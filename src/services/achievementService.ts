import { query, execute } from '@/lib/db';
import { ACHIEVEMENTS, XP_REWARDS } from '@/lib/constants';
import { awardXp } from './progressService';
import type { UserStats } from '@/lib/types';

export interface UnlockedAchievement {
  key: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

/**
 * Get the full UserStats object needed for achievement condition checks.
 */
export async function getUserStats(userId: number): Promise<UserStats> {
  // Parallel queries for all stats
  const [
    reviewResult,
    streakResult,
    cardBreakdown,
    accuracyResult,
  ] = await Promise.all([
    query<{ total: number }>(
      `SELECT COALESCE(SUM(cards_reviewed), 0) as total FROM user_progress WHERE user_id = $1`,
      [userId]
    ),
    query<{ current_streak: number; longest_streak: number }>(
      `SELECT current_streak, longest_streak FROM users WHERE id = $1`,
      [userId]
    ),
    query<{ content_type: string; total: number; learned: number; learning: number; mature: number }>(
      `SELECT content_type,
              COUNT(*) as total,
              SUM(CASE WHEN state IN ('learning', 'review') AND reps >= 2 THEN 1 ELSE 0 END) as learned,
              SUM(CASE WHEN state IN ('learning', 'review') AND reps >= 2 AND stability < 30 THEN 1 ELSE 0 END) as learning,
              SUM(CASE WHEN stability >= 30 THEN 1 ELSE 0 END) as mature
       FROM srs_cards WHERE user_id = $1
       GROUP BY content_type`,
      [userId]
    ),
    query<{ avg_accuracy: number }>(
      `SELECT COALESCE(AVG(accuracy), 0) as avg_accuracy
       FROM user_progress WHERE user_id = $1 AND accuracy > 0`,
      [userId]
    ),
  ]);

  const breakdown: Record<string, { total: number; learned: number; learning: number; mature: number }> = {};
  for (const row of cardBreakdown) {
    breakdown[row.content_type] = {
      total: row.total,
      learned: row.learned,
      learning: row.learning,
      mature: row.mature,
    };
  }

  const emptyBreakdown = { total: 0, learned: 0, learning: 0, mature: 0 };

  return {
    totalCardsLearned: Object.values(breakdown).reduce((s, b) => s + b.learned, 0),
    totalReviews: reviewResult[0]?.total ?? 0,
    currentStreak: streakResult[0]?.current_streak ?? 0,
    longestStreak: streakResult[0]?.longest_streak ?? 0,
    totalStudyTimeMinutes: 0, // Not tracked yet
    averageAccuracy: Math.round(accuracyResult[0]?.avg_accuracy ?? 0),
    kanaProgress: breakdown['kana'] ?? emptyBreakdown,
    kanjiProgress: breakdown['kanji'] ?? emptyBreakdown,
    vocabProgress: breakdown['vocab'] ?? emptyBreakdown,
    grammarProgress: breakdown['grammar'] ?? emptyBreakdown,
  };
}

/**
 * Check all achievements and unlock any newly earned ones.
 * Returns the list of newly unlocked achievements (for notifications).
 */
export async function checkAndUnlockAchievements(
  userId: number
): Promise<UnlockedAchievement[]> {
  const stats = await getUserStats(userId);

  // Get already-earned achievement keys
  const earned = await query<{ achievement_key: string }>(
    'SELECT achievement_key FROM achievements WHERE user_id = $1',
    [userId]
  );
  const earnedKeys = new Set(earned.map((r) => r.achievement_key));

  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedKeys.has(achievement.key)) continue;

    try {
      if (achievement.condition(stats)) {
        await execute(
          'INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES ($1, $2)',
          [userId, achievement.key]
        );
        await awardXp(userId, XP_REWARDS.achievement_earned);

        newlyUnlocked.push({
          key: achievement.key,
          name: achievement.name,
          icon: achievement.icon,
          description: achievement.description,
          earnedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Skip if condition fails (missing data, etc.)
    }
  }

  return newlyUnlocked;
}

/**
 * Get all achievements with their unlock status for a user.
 */
export async function getAllAchievements(
  userId: number
): Promise<(UnlockedAchievement & { isUnlocked: boolean })[]> {
  const earned = await query<{ achievement_key: string; earned_at: string }>(
    'SELECT achievement_key, earned_at FROM achievements WHERE user_id = $1',
    [userId]
  );
  const earnedMap = new Map(earned.map((r) => [r.achievement_key, r.earned_at]));

  return ACHIEVEMENTS.map((a) => ({
    key: a.key,
    name: a.name,
    icon: a.icon,
    description: a.description,
    earnedAt: earnedMap.get(a.key) ?? '',
    isUnlocked: earnedMap.has(a.key),
  }));
}
