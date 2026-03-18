import { query, execute } from '@/lib/db';

export interface TypingSessionRecord {
  id: number;
  mode: string;
  wpm: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: string;
}

/**
 * Save a typing session to the database.
 */
export async function saveTypingSession(
  userId: number,
  mode: string,
  wpm: number,
  accuracy: number,
  durationSeconds: number
): Promise<void> {
  await execute(
    `INSERT INTO typing_sessions (user_id, mode, words_per_minute, accuracy, duration_seconds)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, mode, wpm, accuracy, durationSeconds]
  );
}

/**
 * Get recent typing sessions for a user.
 */
export async function getTypingSessions(
  userId: number,
  limit = 20
): Promise<TypingSessionRecord[]> {
  const rows = await query<{
    id: number;
    mode: string;
    words_per_minute: number;
    accuracy: number;
    duration_seconds: number;
    completed_at: string;
  }>(
    `SELECT id, mode, words_per_minute, accuracy, duration_seconds, completed_at
     FROM typing_sessions
     WHERE user_id = $1
     ORDER BY completed_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return rows.map((r) => ({
    id: r.id,
    mode: r.mode,
    wpm: r.words_per_minute,
    accuracy: r.accuracy,
    durationSeconds: r.duration_seconds,
    completedAt: r.completed_at,
  }));
}
