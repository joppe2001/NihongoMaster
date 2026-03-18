import { query, execute } from '@/lib/db';
import { XP_REWARDS } from '@/lib/constants';
import { awardXp, recordReviewSession } from './progressService';

export interface KanaMastery {
  kanaId: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number;
}

/**
 * Calculate mastery level (0-5) using a "net score" system.
 *
 * Each correct answer adds +1 point to a net score.
 * Each wrong answer deducts -2 points (wrong answers cost more — you need
 * to prove you actually know it, not just guess correctly sometimes).
 * The net score is floored at 0 (can't go negative).
 *
 * Net score thresholds for levels:
 *   0      → Level 0 (not started / lost all progress)
 *   1-2    → Level 1 (seen)
 *   3-5    → Level 2 (familiar)
 *   6-10   → Level 3 (intermediate)
 *   11-17  → Level 4 (advanced)
 *   18+    → Level 5 (mastered)
 *
 * This means:
 * - Getting 3 right + 0 wrong = net 3 → level 2 (familiar) ✓
 * - Getting 3 right + 2 wrong = net max(3-4, 0) = 0 → level 0 (back to start)
 * - Getting 10 right + 2 wrong = net 10-4 = 6 → level 3 (intermediate)
 * - To reach mastery (level 5), you need sustained correct answers
 */
export function getMasteryLevel(correctCount: number, incorrectCount: number): number {
  // Net score: each correct = +1, each incorrect = -2 (penalty is heavier)
  const netScore = Math.max(0, correctCount - (incorrectCount * 2));

  if (netScore === 0) return 0;
  if (netScore <= 2)  return 1;
  if (netScore <= 5)  return 2;
  if (netScore <= 10) return 3;
  if (netScore <= 17) return 4;
  return 5;
}

/**
 * Record a quiz answer for a specific kana character.
 *
 * Correct: +1 correct_count
 * Wrong:   +1 incorrect_count AND -1 correct_count (floored at 0)
 *
 * This ensures wrong answers actively deduct progress, not just
 * slow it down. Combined with getMasteryLevel()'s net score formula,
 * this means a wrong answer costs -3 effective points (−1 from correct
 * deduction + −2 from the incorrect penalty weight in the formula).
 */
export async function recordQuizAnswer(
  userId: number,
  kanaId: number,
  isCorrect: boolean
): Promise<void> {
  const now = new Date().toISOString();

  if (isCorrect) {
    await execute(
      `INSERT INTO kana_mastery (user_id, kana_id, correct_count, last_correct_at)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, kana_id) DO UPDATE SET
         correct_count = correct_count + 1,
         last_correct_at = $3`,
      [userId, kanaId, now]
    );
  } else {
    await execute(
      `INSERT INTO kana_mastery (user_id, kana_id, incorrect_count, last_incorrect_at)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, kana_id) DO UPDATE SET
         incorrect_count = incorrect_count + 1,
         correct_count = MAX(correct_count - 1, 0),
         last_incorrect_at = $3`,
      [userId, kanaId, now]
    );
  }
}

/**
 * Get mastery data for a list of kana IDs.
 */
export async function getMasteryForKana(
  userId: number,
  kanaIds: number[]
): Promise<Map<number, KanaMastery>> {
  if (kanaIds.length === 0) return new Map();

  const placeholders = kanaIds.map((_, i) => `$${i + 2}`).join(',');
  const rows = await query<{
    kana_id: number;
    correct_count: number;
    incorrect_count: number;
  }>(
    `SELECT kana_id, correct_count, incorrect_count
     FROM kana_mastery
     WHERE user_id = $1 AND kana_id IN (${placeholders})`,
    [userId, ...kanaIds]
  );

  const map = new Map<number, KanaMastery>();
  for (const row of rows) {
    map.set(row.kana_id, {
      kanaId: row.kana_id,
      correctCount: row.correct_count,
      incorrectCount: row.incorrect_count,
      masteryLevel: getMasteryLevel(row.correct_count, row.incorrect_count),
    });
  }
  return map;
}

/**
 * Record a quiz session and award XP.
 */
export async function recordQuizSession(
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

// ─── Row Group Progress ──────────────────────────────────────

export interface RowGroupProgress {
  rowGroup: string;
  totalChars: number;
  masteredCount: number;
  avgAccuracy: number;
}

/**
 * Get mastery progress aggregated by row group for a kana type.
 */
export async function getRowGroupProgress(
  userId: number,
  kanaType: 'hiragana' | 'katakana'
): Promise<RowGroupProgress[]> {
  const rows = await query<{
    row_group: string;
    total_chars: number;
    mastered_count: number;
    avg_accuracy: number;
  }>(
    `SELECT
       k.row_group,
       COUNT(k.id) as total_chars,
       SUM(CASE WHEN COALESCE(m.correct_count, 0) >= 6 THEN 1 ELSE 0 END) as mastered_count,
       CASE WHEN SUM(COALESCE(m.correct_count, 0) + COALESCE(m.incorrect_count, 0)) > 0
         THEN ROUND(
           CAST(SUM(COALESCE(m.correct_count, 0)) AS REAL) /
           SUM(COALESCE(m.correct_count, 0) + COALESCE(m.incorrect_count, 0)) * 100
         )
         ELSE 0
       END as avg_accuracy
     FROM kana k
     LEFT JOIN kana_mastery m ON m.kana_id = k.id AND m.user_id = $1
     WHERE k.type = $2
     GROUP BY k.row_group
     ORDER BY MIN(k.sort_order)`,
    [userId, kanaType]
  );

  return rows.map((r) => ({
    rowGroup: r.row_group,
    totalChars: r.total_chars,
    masteredCount: r.mastered_count,
    avgAccuracy: r.avg_accuracy,
  }));
}
