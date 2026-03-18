import { query, execute } from '@/lib/db';
import { XP_REWARDS } from '@/lib/constants';
import { awardXp, recordReviewSession } from './progressService';
import { getMasteryLevel } from './kanaMasteryService';

export { getMasteryLevel };

export interface VocabMastery {
  vocabId: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number;
}

export async function recordVocabQuizAnswer(userId: number, vocabId: number, isCorrect: boolean): Promise<void> {
  const now = new Date().toISOString();
  if (isCorrect) {
    await execute(
      `INSERT INTO vocab_mastery (user_id, vocab_id, correct_count, last_correct_at) VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, vocab_id) DO UPDATE SET correct_count = correct_count + 1, last_correct_at = $3`,
      [userId, vocabId, now]
    );
  } else {
    await execute(
      `INSERT INTO vocab_mastery (user_id, vocab_id, incorrect_count, last_incorrect_at) VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, vocab_id) DO UPDATE SET incorrect_count = incorrect_count + 1, correct_count = MAX(correct_count - 1, 0), last_incorrect_at = $3`,
      [userId, vocabId, now]
    );
  }
}

export async function getMasteryForVocab(userId: number, vocabIds: number[]): Promise<Map<number, VocabMastery>> {
  if (vocabIds.length === 0) return new Map();
  const placeholders = vocabIds.map((_, i) => `$${i + 2}`).join(',');
  const rows = await query<{ vocab_id: number; correct_count: number; incorrect_count: number }>(
    `SELECT vocab_id, correct_count, incorrect_count FROM vocab_mastery WHERE user_id = $1 AND vocab_id IN (${placeholders})`,
    [userId, ...vocabIds]
  );
  const map = new Map<number, VocabMastery>();
  for (const r of rows) {
    map.set(r.vocab_id, { vocabId: r.vocab_id, correctCount: r.correct_count, incorrectCount: r.incorrect_count, masteryLevel: getMasteryLevel(r.correct_count, r.incorrect_count) });
  }
  return map;
}

export async function recordVocabQuizSession(userId: number, correctCount: number, totalCount: number): Promise<number> {
  const xp = correctCount * XP_REWARDS.quiz_correct;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  await recordReviewSession(userId, totalCount, 0, 0, accuracy, xp);
  await awardXp(userId, xp);
  return xp;
}
