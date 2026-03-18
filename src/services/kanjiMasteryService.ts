import { query, execute } from '@/lib/db';
import { XP_REWARDS } from '@/lib/constants';
import { awardXp, recordReviewSession } from './progressService';
import { getMasteryLevel } from './kanaMasteryService';

export { getMasteryLevel };

export interface KanjiMastery {
  kanjiId: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number;
}

/**
 * Record a quiz answer for a specific kanji character.
 */
export async function recordKanjiQuizAnswer(
  userId: number,
  kanjiId: number,
  isCorrect: boolean
): Promise<void> {
  const now = new Date().toISOString();

  if (isCorrect) {
    await execute(
      `INSERT INTO kanji_mastery (user_id, kanji_id, correct_count, last_correct_at)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, kanji_id) DO UPDATE SET
         correct_count = correct_count + 1,
         last_correct_at = $3`,
      [userId, kanjiId, now]
    );
  } else {
    await execute(
      `INSERT INTO kanji_mastery (user_id, kanji_id, incorrect_count, last_incorrect_at)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, kanji_id) DO UPDATE SET
         incorrect_count = incorrect_count + 1,
         correct_count = MAX(correct_count - 1, 0),
         last_incorrect_at = $3`,
      [userId, kanjiId, now]
    );
  }
}

/**
 * Get mastery data for a list of kanji IDs.
 */
export async function getMasteryForKanji(
  userId: number,
  kanjiIds: number[]
): Promise<Map<number, KanjiMastery>> {
  if (kanjiIds.length === 0) return new Map();

  const placeholders = kanjiIds.map((_, i) => `$${i + 2}`).join(',');
  const rows = await query<{
    kanji_id: number;
    correct_count: number;
    incorrect_count: number;
  }>(
    `SELECT kanji_id, correct_count, incorrect_count
     FROM kanji_mastery
     WHERE user_id = $1 AND kanji_id IN (${placeholders})`,
    [userId, ...kanjiIds]
  );

  const map = new Map<number, KanjiMastery>();
  for (const row of rows) {
    map.set(row.kanji_id, {
      kanjiId: row.kanji_id,
      correctCount: row.correct_count,
      incorrectCount: row.incorrect_count,
      masteryLevel: getMasteryLevel(row.correct_count, row.incorrect_count),
    });
  }
  return map;
}

/**
 * Record a kanji quiz session and award XP.
 */
export async function recordKanjiQuizSession(
  userId: number,
  correctCount: number,
  totalCount: number
): Promise<number> {
  const xp = correctCount * XP_REWARDS.quiz_correct;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  await recordReviewSession(userId, totalCount, 0, 0, accuracy, xp);
  await awardXp(userId, xp);

  return xp;
}
