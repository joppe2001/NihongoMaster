import { query, execute } from '@/lib/db';

interface ExportPayload {
  version: number;
  exportedAt: string;
  user: Record<string, unknown>;
  srsCards: Record<string, unknown>[];
  progress: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  kanaMastery: Record<string, unknown>[];
  kanjiMastery?: Record<string, unknown>[];
  vocabMastery?: Record<string, unknown>[];
  grammarMastery?: Record<string, unknown>[];
}

/**
 * Export all user data as a JSON-serializable object.
 */
export async function exportAllData(userId: number): Promise<ExportPayload> {
  const [userRows, srsCards, progress, achievements, kanaMastery, kanjiMastery, vocabMastery, grammarMastery] = await Promise.all([
    query<Record<string, unknown>>('SELECT * FROM users WHERE id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM srs_cards WHERE user_id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM user_progress WHERE user_id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM achievements WHERE user_id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM kana_mastery WHERE user_id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM kanji_mastery WHERE user_id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM vocab_mastery WHERE user_id = $1', [userId]),
    query<Record<string, unknown>>('SELECT * FROM grammar_mastery WHERE user_id = $1', [userId]),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    user: userRows[0] ?? {},
    srsCards,
    progress,
    achievements,
    kanaMastery,
    kanjiMastery,
    vocabMastery,
    grammarMastery,
  };
}

/**
 * Import user data from a backup payload.
 * Clears existing user data and replaces with imported data.
 */
export async function importData(userId: number, payload: ExportPayload): Promise<void> {
  if (!payload.version || (payload.version !== 1 && payload.version !== 2)) {
    throw new Error('Unsupported backup version');
  }

  // Clear existing user data (all mastery tables + core tables)
  await execute('DELETE FROM kana_mastery WHERE user_id = $1', [userId]);
  try { await execute('DELETE FROM kanji_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  try { await execute('DELETE FROM vocab_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  try { await execute('DELETE FROM grammar_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  await execute('DELETE FROM achievements WHERE user_id = $1', [userId]);
  await execute('DELETE FROM user_progress WHERE user_id = $1', [userId]);
  await execute('DELETE FROM srs_cards WHERE user_id = $1', [userId]);

  // Import SRS cards
  for (const card of payload.srsCards) {
    await execute(
      `INSERT OR IGNORE INTO srs_cards
        (user_id, content_type, content_id, due_date, stability, difficulty, reps, lapses, state, last_review)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId, card.content_type, card.content_id, card.due_date,
        card.stability, card.difficulty, card.reps, card.lapses, card.state, card.last_review,
      ]
    );
  }

  // Import progress
  for (const p of payload.progress) {
    // Support both old column name (accuracy) and new (accuracy_percent)
    const accuracy = p.accuracy_percent ?? p.accuracy ?? 0;
    await execute(
      `INSERT OR IGNORE INTO user_progress
        (user_id, date, cards_reviewed, cards_learned, time_spent_seconds, accuracy_percent, xp_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, p.date, p.cards_reviewed, p.cards_learned, p.time_spent_seconds, accuracy, p.xp_earned]
    );
  }

  // Import achievements
  for (const a of payload.achievements) {
    await execute(
      'INSERT OR IGNORE INTO achievements (user_id, achievement_key, earned_at) VALUES ($1, $2, $3)',
      [userId, a.achievement_key, a.earned_at]
    );
  }

  // Import kana mastery
  for (const m of payload.kanaMastery) {
    await execute(
      `INSERT OR REPLACE INTO kana_mastery
        (user_id, kana_id, correct_count, incorrect_count, last_correct_at, last_incorrect_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, m.kana_id, m.correct_count, m.incorrect_count, m.last_correct_at, m.last_incorrect_at]
    );
  }

  // Import kanji mastery (v2+)
  if (payload.kanjiMastery) {
    for (const m of payload.kanjiMastery) {
      await execute(
        `INSERT OR REPLACE INTO kanji_mastery
          (user_id, kanji_id, correct_count, incorrect_count, last_correct_at, last_incorrect_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, m.kanji_id, m.correct_count, m.incorrect_count, m.last_correct_at, m.last_incorrect_at]
      );
    }
  }

  // Import vocab mastery (v2+)
  if (payload.vocabMastery) {
    for (const m of payload.vocabMastery) {
      await execute(
        `INSERT OR REPLACE INTO vocab_mastery
          (user_id, vocab_id, correct_count, incorrect_count, last_correct_at, last_incorrect_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, m.vocab_id, m.correct_count, m.incorrect_count, m.last_correct_at, m.last_incorrect_at]
      );
    }
  }

  // Import grammar mastery (v2+)
  if (payload.grammarMastery) {
    for (const m of payload.grammarMastery) {
      await execute(
        `INSERT OR REPLACE INTO grammar_mastery
          (user_id, grammar_id, correct_count, incorrect_count, last_correct_at, last_incorrect_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, m.grammar_id, m.correct_count, m.incorrect_count, m.last_correct_at, m.last_incorrect_at]
      );
    }
  }

  // Update user XP and streak from imported data
  if (payload.user.xp !== undefined) {
    await execute('UPDATE users SET xp = $1 WHERE id = $2', [payload.user.xp, userId]);
  }
}

/**
 * Download a JSON string as a file using browser APIs.
 */
export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Read a JSON file from a file input.
 */
export function readJsonFile(file: File): Promise<ExportPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version || !data.exportedAt) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        resolve(data as ExportPayload);
      } catch {
        reject(new Error('Could not parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

/**
 * Reset all user progress data. Deletes in FK-safe order.
 * Does NOT delete the user record itself or content data (kana, kanji, vocab, grammar).
 */
export async function resetProgress(userId: number): Promise<void> {
  // Delete in FK order: review_history → srs_cards → everything else
  await execute(
    'DELETE FROM review_history WHERE card_id IN (SELECT id FROM srs_cards WHERE user_id = $1)',
    [userId]
  );
  await execute('DELETE FROM srs_cards WHERE user_id = $1', [userId]);
  // Mastery tables may or may not exist depending on migration state
  try { await execute('DELETE FROM kana_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  try { await execute('DELETE FROM kanji_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  try { await execute('DELETE FROM vocab_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  try { await execute('DELETE FROM grammar_mastery WHERE user_id = $1', [userId]); } catch { /* table may not exist */ }
  await execute('DELETE FROM achievements WHERE user_id = $1', [userId]);
  await execute('DELETE FROM user_progress WHERE user_id = $1', [userId]);
  await execute('DELETE FROM typing_sessions WHERE user_id = $1', [userId]);
  // Reset user stats but keep name/settings
  await execute(
    'UPDATE users SET xp = 0, streak_days = 0, last_study_date = NULL WHERE id = $1',
    [userId]
  );
}
