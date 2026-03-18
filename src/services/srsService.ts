import { invoke } from '@tauri-apps/api/core';
import { query, execute } from '@/lib/db';
import type { SrsCard, ContentType, ReviewRating, ReviewResult } from '@/lib/types';

// ─────────────────────────────────────────────────────────────
// Card Creation
// ─────────────────────────────────────────────────────────────

/**
 * Create an SRS card for a piece of content.
 * Uses INSERT OR IGNORE so it's safe to call multiple times.
 */
export async function createCard(
  userId: number,
  contentType: ContentType,
  contentId: number
): Promise<void> {
  await execute(
    `INSERT OR IGNORE INTO srs_cards (user_id, content_type, content_id, state, due_date)
     VALUES ($1, $2, $3, 'new', datetime('now'))`,
    [userId, contentType, contentId]
  );
}

/**
 * Batch-create SRS cards for multiple content items.
 */
export async function createCards(
  userId: number,
  contentType: ContentType,
  contentIds: number[]
): Promise<void> {
  for (const id of contentIds) {
    await createCard(userId, contentType, id);
  }
}

// ─────────────────────────────────────────────────────────────
// Card Queries
// ─────────────────────────────────────────────────────────────

interface SrsCardRow {
  id: number;
  user_id: number;
  content_type: string;
  content_id: number;
  state: string;
  due_date: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
  created_at: string;
}

function rowToCard(row: SrsCardRow): SrsCard {
  return {
    id: row.id,
    userId: row.user_id,
    contentType: row.content_type as ContentType,
    contentId: row.content_id,
    state: row.state as SrsCard['state'],
    dueDate: row.due_date,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsedDays: row.elapsed_days,
    scheduledDays: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    lastReview: row.last_review,
    createdAt: row.created_at,
  };
}

/**
 * Get cards that are due for review now.
 * Returns new cards and cards whose due_date has passed.
 */
export async function getDueCards(
  userId: number,
  limit = 20
): Promise<SrsCard[]> {
  const rows = await query<SrsCardRow>(
    `SELECT * FROM srs_cards
     WHERE user_id = $1 AND due_date <= datetime('now')
     ORDER BY
       CASE state
         WHEN 'relearning' THEN 0
         WHEN 'learning' THEN 1
         WHEN 'new' THEN 2
         WHEN 'review' THEN 3
       END,
       due_date ASC
     LIMIT $2`,
    [userId, limit]
  );
  return rows.map(rowToCard);
}

/**
 * Get count of cards due for review.
 */
export async function getDueCount(userId: number): Promise<number> {
  const rows = await query<{ count: number }>(
    `SELECT COUNT(*) as count FROM srs_cards
     WHERE user_id = $1 AND due_date <= datetime('now')`,
    [userId]
  );
  return rows[0]?.count ?? 0;
}

/**
 * Get the total number of cards a user has, grouped by content type.
 */
export async function getCardCounts(userId: number): Promise<Record<ContentType, { total: number; learned: number }>> {
  const rows = await query<{ content_type: string; total: number; learned: number }>(
    `SELECT
       content_type,
       COUNT(*) as total,
       SUM(CASE WHEN state IN ('learning', 'review') AND reps >= 2 THEN 1 ELSE 0 END) as learned
     FROM srs_cards
     WHERE user_id = $1
     GROUP BY content_type`,
    [userId]
  );

  const result: Record<string, { total: number; learned: number }> = {
    kana: { total: 0, learned: 0 },
    kanji: { total: 0, learned: 0 },
    vocab: { total: 0, learned: 0 },
    grammar: { total: 0, learned: 0 },
  };

  for (const row of rows) {
    result[row.content_type] = {
      total: row.total,
      learned: row.learned,
    };
  }

  return result as Record<ContentType, { total: number; learned: number }>;
}

/**
 * Check if a card exists for given content.
 */
export async function cardExists(
  userId: number,
  contentType: ContentType,
  contentId: number
): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `SELECT id FROM srs_cards
     WHERE user_id = $1 AND content_type = $2 AND content_id = $3
     LIMIT 1`,
    [userId, contentType, contentId]
  );
  return rows.length > 0;
}

// ─────────────────────────────────────────────────────────────
// Level-scoped Queries & Management
// ─────────────────────────────────────────────────────────────

/** Maps SRS content type to its source table name. */
const CONTENT_TABLE: Record<'kanji' | 'vocab' | 'grammar', string> = {
  kanji: 'kanji',
  vocab: 'vocabulary',
  grammar: 'grammar_points',
};

/**
 * Count how many SRS cards a user has for a specific JLPT level and content type.
 */
export async function getCardCountForLevel(
  userId: number,
  contentType: 'kanji' | 'vocab' | 'grammar',
  level: number
): Promise<number> {
  const table = CONTENT_TABLE[contentType];
  const rows = await query<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM srs_cards
     WHERE user_id = $1
       AND content_type = $2
       AND content_id IN (SELECT id FROM ${table} WHERE jlpt_level = $3)`,
    [userId, contentType, level]
  );
  return rows[0]?.count ?? 0;
}

/**
 * Delete all SRS cards (and their review history) for a given user,
 * content type and JLPT level. Cascades through review_history first
 * to satisfy the FK constraint.
 */
export async function removeCardsForLevel(
  userId: number,
  contentType: 'kanji' | 'vocab' | 'grammar',
  level: number
): Promise<void> {
  const table = CONTENT_TABLE[contentType];

  // 1. Delete review history rows that belong to these cards
  await execute(
    `DELETE FROM review_history
     WHERE card_id IN (
       SELECT id FROM srs_cards
       WHERE user_id = $1
         AND content_type = $2
         AND content_id IN (SELECT id FROM ${table} WHERE jlpt_level = $3)
     )`,
    [userId, contentType, level]
  );

  // 2. Delete the cards themselves
  await execute(
    `DELETE FROM srs_cards
     WHERE user_id = $1
       AND content_type = $2
       AND content_id IN (SELECT id FROM ${table} WHERE jlpt_level = $3)`,
    [userId, contentType, level]
  );
}

// ─────────────────────────────────────────────────────────────
// Review Submission
// ─────────────────────────────────────────────────────────────

/**
 * Submit a review for a card.
 * Calls the Rust FSRS engine, then persists the result to SQLite.
 */
export async function submitReview(
  card: SrsCard,
  rating: ReviewRating,
  elapsedMs: number
): Promise<ReviewResult> {
  // Call the Rust FSRS engine via Tauri IPC
  const result = await invoke<ReviewResult>('submit_review', {
    cardState: card.state,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    rating,
  });

  // Persist the updated card state
  const newReps = card.reps + 1;
  const newLapses = card.lapses + (rating === 1 ? 1 : 0);

  await execute(
    `UPDATE srs_cards SET
       state = $1,
       stability = $2,
       difficulty = $3,
       scheduled_days = $4,
       due_date = $5,
       reps = $6,
       lapses = $7,
       elapsed_days = $8,
       last_review = datetime('now')
     WHERE id = $9`,
    [
      result.new_state,
      result.new_stability,
      result.new_difficulty,
      result.scheduled_days,
      result.due_date,
      newReps,
      newLapses,
      card.scheduledDays, // actual elapsed days = previous scheduled interval
      card.id,
    ]
  );

  // Record review history
  await execute(
    `INSERT INTO review_history (card_id, rating, elapsed_ms, state_before, state_after)
     VALUES ($1, $2, $3, $4, $5)`,
    [card.id, rating, elapsedMs, card.state, result.new_state]
  );

  return result;
}

// ─────────────────────────────────────────────────────────────
// Content Fetching (for review cards)
// ─────────────────────────────────────────────────────────────

export interface CardContent {
  character: string;
  romaji?: string;
  type: string;
  contentType: ContentType;
  onReadings?: string[];
  kunReadings?: string[];
  meanings?: string[];
  // Vocab fields
  word?: string;
  reading?: string;
  partOfSpeech?: string;
  // Grammar fields
  pattern?: string;
  formation?: string;
  notes?: string | null;
}

/**
 * Fetch the content details for a card (kana, kanji, etc.)
 */
export async function getCardContent(card: SrsCard): Promise<CardContent | null> {
  if (card.contentType === 'kana') {
    const rows = await query<{ character: string; romaji: string; type: string }>(
      'SELECT character, romaji, type FROM kana WHERE id = $1',
      [card.contentId]
    );
    if (rows.length === 0) return null;
    return {
      character: rows[0].character,
      romaji: rows[0].romaji,
      type: rows[0].type,
      contentType: 'kana',
    };
  }

  if (card.contentType === 'kanji') {
    const rows = await query<{ character: string; on_readings: string; kun_readings: string; meanings: string }>(
      'SELECT character, on_readings, kun_readings, meanings FROM kanji WHERE id = $1',
      [card.contentId]
    );
    if (rows.length === 0) return null;
    const meanings = JSON.parse(rows[0].meanings || '{}');
    return {
      character: rows[0].character,
      type: 'kanji',
      contentType: 'kanji',
      onReadings: JSON.parse(rows[0].on_readings || '[]'),
      kunReadings: JSON.parse(rows[0].kun_readings || '[]'),
      meanings: meanings['en'] ?? [],
    };
  }

  if (card.contentType === 'vocab') {
    const rows = await query<{ word: string; reading: string; part_of_speech: string; meanings: string }>(
      'SELECT word, reading, part_of_speech, meanings FROM vocabulary WHERE id = $1',
      [card.contentId]
    );
    if (rows.length === 0) return null;
    const meanings = JSON.parse(rows[0].meanings || '{}');
    return {
      character: rows[0].word,
      word: rows[0].word,
      reading: rows[0].reading,
      partOfSpeech: rows[0].part_of_speech,
      type: 'vocab',
      contentType: 'vocab',
      meanings: meanings['en'] ?? [],
    };
  }

  if (card.contentType === 'grammar') {
    const rows = await query<{ pattern: string; meaning: string; formation: string; notes: string | null }>(
      'SELECT pattern, meaning, formation, notes FROM grammar_points WHERE id = $1',
      [card.contentId]
    );
    if (rows.length === 0) return null;
    const meaning = JSON.parse(rows[0].meaning || '{}');
    return {
      character: rows[0].pattern,
      pattern: rows[0].pattern,
      formation: rows[0].formation,
      notes: rows[0].notes,
      type: 'grammar',
      contentType: 'grammar',
      meanings: meaning['en'] ? [meaning['en']] : [],
    };
  }

  return null;
}
