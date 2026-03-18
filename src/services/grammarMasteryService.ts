import { query, execute } from '@/lib/db';
import { XP_REWARDS } from '@/lib/constants';
import { awardXp, recordReviewSession } from './progressService';
import { getMasteryLevel } from './kanaMasteryService';

export { getMasteryLevel };

export interface GrammarMastery {
  grammarId: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number;
}

export async function recordGrammarQuizAnswer(userId: number, grammarId: number, isCorrect: boolean): Promise<void> {
  const now = new Date().toISOString();
  if (isCorrect) {
    await execute(
      `INSERT INTO grammar_mastery (user_id, grammar_id, correct_count, last_correct_at) VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, grammar_id) DO UPDATE SET correct_count = correct_count + 1, last_correct_at = $3`,
      [userId, grammarId, now]
    );
  } else {
    await execute(
      `INSERT INTO grammar_mastery (user_id, grammar_id, incorrect_count, last_incorrect_at) VALUES ($1, $2, 1, $3)
       ON CONFLICT(user_id, grammar_id) DO UPDATE SET incorrect_count = incorrect_count + 1, correct_count = MAX(correct_count - 1, 0), last_incorrect_at = $3`,
      [userId, grammarId, now]
    );
  }
}

export async function getMasteryForGrammar(userId: number, grammarIds: number[]): Promise<Map<number, GrammarMastery>> {
  if (grammarIds.length === 0) return new Map();
  const placeholders = grammarIds.map((_, i) => `$${i + 2}`).join(',');
  const rows = await query<{ grammar_id: number; correct_count: number; incorrect_count: number }>(
    `SELECT grammar_id, correct_count, incorrect_count FROM grammar_mastery WHERE user_id = $1 AND grammar_id IN (${placeholders})`,
    [userId, ...grammarIds]
  );
  const map = new Map<number, GrammarMastery>();
  for (const r of rows) {
    map.set(r.grammar_id, { grammarId: r.grammar_id, correctCount: r.correct_count, incorrectCount: r.incorrect_count, masteryLevel: getMasteryLevel(r.correct_count, r.incorrect_count) });
  }
  return map;
}

export async function recordGrammarQuizSession(userId: number, correctCount: number, totalCount: number): Promise<number> {
  const xp = correctCount * XP_REWARDS.quiz_correct;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  await recordReviewSession(userId, totalCount, 0, 0, accuracy, xp);
  await awardXp(userId, xp);
  return xp;
}
