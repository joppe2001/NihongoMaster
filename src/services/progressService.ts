import { query, execute } from '@/lib/db';
import { XP_REWARDS } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────
// Daily Progress Tracking
// ─────────────────────────────────────────────────────────────

/**
 * Get today's date string in YYYY-MM-DD format (local time).
 */
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Record a review session's results into daily progress.
 * Uses UPSERT — creates row if none exists for today, otherwise adds to it.
 */
export async function recordReviewSession(
  userId: number,
  cardsReviewed: number,
  cardsLearned: number,
  timeSpentSeconds: number,
  accuracyPercent: number,
  xpEarned: number
): Promise<void> {
  const today = todayStr();

  // Check if row exists for today
  const existing = await query<{ id: number }>(
    'SELECT id FROM user_progress WHERE user_id = $1 AND date = $2',
    [userId, today]
  );

  if (existing.length > 0) {
    await execute(
      `UPDATE user_progress SET
         cards_reviewed = cards_reviewed + $1,
         cards_learned = cards_learned + $2,
         time_spent_seconds = time_spent_seconds + $3,
         accuracy_percent = $4,
         xp_earned = xp_earned + $5
       WHERE user_id = $6 AND date = $7`,
      [cardsReviewed, cardsLearned, timeSpentSeconds, accuracyPercent, xpEarned, userId, today]
    );
  } else {
    await execute(
      `INSERT INTO user_progress (user_id, date, cards_reviewed, cards_learned, time_spent_seconds, accuracy_percent, xp_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, today, cardsReviewed, cardsLearned, timeSpentSeconds, accuracyPercent, xpEarned]
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Streak Calculation
// ─────────────────────────────────────────────────────────────

/**
 * Calculate the current study streak (consecutive days).
 */
export async function calculateStreak(userId: number): Promise<number> {
  // Get all distinct study dates, most recent first
  const rows = await query<{ date: string }>(
    `SELECT DISTINCT date FROM user_progress
     WHERE user_id = $1 AND cards_reviewed > 0
     ORDER BY date DESC
     LIMIT 365`,
    [userId]
  );

  if (rows.length === 0) return 0;

  const today = todayStr();
  const yesterday = getYesterday();

  // Streak must include today or yesterday
  const mostRecent = rows[0].date;
  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 0;
  let expectedDate = mostRecent === today ? today : yesterday;

  for (const row of rows) {
    if (row.date === expectedDate) {
      streak++;
      expectedDate = getPreviousDay(expectedDate);
    } else {
      break;
    }
  }

  return streak;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────
// XP & User Stats
// ─────────────────────────────────────────────────────────────

/**
 * Award XP to a user and update streak.
 */
export async function awardXp(userId: number, amount: number): Promise<void> {
  await execute(
    'UPDATE users SET xp = xp + $1 WHERE id = $2',
    [amount, userId]
  );
}

/**
 * Update the user's streak in the database.
 */
export async function updateUserStreak(userId: number, streakDays: number): Promise<void> {
  const today = todayStr();
  await execute(
    'UPDATE users SET streak_days = $1, last_study_date = $2 WHERE id = $3',
    [streakDays, today, userId]
  );
}

/**
 * Calculate XP earned from a review session.
 */
export function calculateSessionXp(
  _cardsReviewed: number,
  correctCount: number,
  newCardsLearned: number
): number {
  const reviewXp = correctCount * XP_REWARDS.review_correct;
  const newCardXp = newCardsLearned * XP_REWARDS.new_card_learned;
  return reviewXp + newCardXp;
}

// ─────────────────────────────────────────────────────────────
// Dashboard Statistics
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  dueCards: number;
  reviewedToday: number;
  learnedToday: number;
  totalCards: number;
  kanaLearned: number;
  kanjiLearned: number;
  vocabLearned: number;
  grammarLearned: number;
  /** Cards with stability >= 30 days (truly memorized) */
  kanaMastered: number;
  kanjiMastered: number;
  vocabMastered: number;
  grammarMastered: number;
}

/**
 * Fetch all stats needed for the dashboard.
 */
export async function getDashboardStats(userId: number): Promise<DashboardStats> {
  const today = todayStr();

  const [dueResult, todayResult, countsResult] = await Promise.all([
    query<{ count: number }>(
      "SELECT COUNT(*) as count FROM srs_cards WHERE user_id = $1 AND due_date <= datetime('now')",
      [userId]
    ),
    query<{ cards_reviewed: number; cards_learned: number }>(
      `SELECT COALESCE(SUM(cards_reviewed), 0) as cards_reviewed,
              COALESCE(SUM(cards_learned), 0) as cards_learned
       FROM user_progress WHERE user_id = $1 AND date = $2`,
      [userId, today]
    ),
    query<{ content_type: string; learned: number; mastered: number }>(
      `SELECT content_type,
              SUM(CASE WHEN state IN ('learning', 'review') AND reps >= 2 THEN 1 ELSE 0 END) as learned,
              SUM(CASE WHEN stability >= 30 THEN 1 ELSE 0 END) as mastered
       FROM srs_cards WHERE user_id = $1
       GROUP BY content_type`,
      [userId]
    ),
  ]);

  const counts: Record<string, { learned: number; mastered: number }> = {};
  for (const row of countsResult) {
    counts[row.content_type] = { learned: row.learned, mastered: row.mastered };
  }

  const g = (type: string) => counts[type] ?? { learned: 0, mastered: 0 };

  return {
    dueCards: dueResult[0]?.count ?? 0,
    reviewedToday: todayResult[0]?.cards_reviewed ?? 0,
    learnedToday: todayResult[0]?.cards_learned ?? 0,
    totalCards: Object.values(counts).reduce((a, b) => a + b.learned, 0),
    kanaLearned: g('kana').learned,
    kanjiLearned: g('kanji').learned,
    vocabLearned: g('vocab').learned,
    grammarLearned: g('grammar').learned,
    kanaMastered: g('kana').mastered,
    kanjiMastered: g('kanji').mastered,
    vocabMastered: g('vocab').mastered,
    grammarMastered: g('grammar').mastered,
  };
}

/**
 * Fetch progress page data.
 */
export async function getProgressStats(userId: number) {
  const [totals, daily] = await Promise.all([
    query<{
      total_reviews: number;
      total_learned: number;
      total_time: number;
      avg_accuracy: number;
    }>(
      `SELECT
        COALESCE(SUM(cards_reviewed), 0) as total_reviews,
        COALESCE(SUM(cards_learned), 0) as total_learned,
        COALESCE(SUM(time_spent_seconds), 0) as total_time,
        COALESCE(AVG(CASE WHEN accuracy_percent > 0 THEN accuracy_percent END), 0) as avg_accuracy
      FROM user_progress WHERE user_id = $1`,
      [userId]
    ),
    query<{ date: string; cards_reviewed: number; accuracy_percent: number }>(
      `SELECT date, cards_reviewed, accuracy_percent
       FROM user_progress
       WHERE user_id = $1 AND date >= date('now', '-7 days')
       ORDER BY date DESC`,
      [userId]
    ),
  ]);

  return {
    totalReviews: totals[0]?.total_reviews ?? 0,
    totalCardsLearned: totals[0]?.total_learned ?? 0,
    totalStudyTime: totals[0]?.total_time ?? 0,
    averageAccuracy: Math.round(totals[0]?.avg_accuracy ?? 0),
    last7Days: daily.map((d) => ({
      date: d.date,
      cardsReviewed: d.cards_reviewed,
      accuracy: d.accuracy_percent,
    })),
  };
}
