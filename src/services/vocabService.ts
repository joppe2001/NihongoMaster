import { query } from '@/lib/db';
import { createCards } from './srsService';
import type { JlptLevelId } from '@/lib/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface VocabDetail {
  id: number;
  word: string;
  reading: string;
  jlptLevel: number;
  partOfSpeech: string;
  meanings: Record<string, string[]>;
  frequencyRank: number;
  tags: string[];
}

interface VocabRow {
  id: number;
  word: string;
  reading: string;
  jlpt_level: number;
  part_of_speech: string;
  meanings: string;
  frequency_rank: number;
  tags: string;
}

function rowToVocab(row: VocabRow): VocabDetail {
  return {
    id: row.id,
    word: row.word,
    reading: row.reading,
    jlptLevel: row.jlpt_level,
    partOfSpeech: row.part_of_speech,
    meanings: JSON.parse(row.meanings || '{}'),
    frequencyRank: row.frequency_rank,
    tags: JSON.parse(row.tags || '[]'),
  };
}

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get all vocabulary for a JLPT level, ordered by frequency.
 */
export async function getVocabByLevel(level: JlptLevelId): Promise<VocabDetail[]> {
  const rows = await query<VocabRow>(
    'SELECT * FROM vocabulary WHERE jlpt_level = $1 ORDER BY frequency_rank ASC',
    [level]
  );
  return rows.map(rowToVocab);
}

/**
 * Get vocabulary across multiple JLPT levels for practice exercises.
 * Returns words from the student's current level and all easier levels,
 * so an N3 student sees N5 + N4 + N3 vocabulary.
 * JLPT levels: 5 = easiest (N5), 1 = hardest (N1).
 */
export async function getVocabUpToLevel(level: JlptLevelId): Promise<VocabDetail[]> {
  const rows = await query<VocabRow>(
    'SELECT * FROM vocabulary WHERE jlpt_level >= $1 AND jlpt_level <= 5 ORDER BY jlpt_level DESC, frequency_rank ASC',
    [level]
  );
  return rows.map(rowToVocab);
}

/**
 * Get vocabulary by part of speech within a level.
 */
export async function getVocabByPartOfSpeech(
  level: JlptLevelId,
  partOfSpeech: string
): Promise<VocabDetail[]> {
  const rows = await query<VocabRow>(
    'SELECT * FROM vocabulary WHERE jlpt_level = $1 AND part_of_speech = $2 ORDER BY frequency_rank ASC',
    [level, partOfSpeech]
  );
  return rows.map(rowToVocab);
}

/**
 * Search vocabulary by word, reading, or meaning.
 */
export async function searchVocab(searchQuery: string): Promise<VocabDetail[]> {
  const q = `%${searchQuery}%`;
  const rows = await query<VocabRow>(
    `SELECT * FROM vocabulary
     WHERE word LIKE $1
        OR reading LIKE $1
        OR meanings LIKE $1
     ORDER BY frequency_rank ASC
     LIMIT 50`,
    [q]
  );
  return rows.map(rowToVocab);
}

/**
 * Get a single vocabulary item by ID.
 */
export async function getVocabById(id: number): Promise<VocabDetail | null> {
  const rows = await query<VocabRow>(
    'SELECT * FROM vocabulary WHERE id = $1',
    [id]
  );
  return rows.length > 0 ? rowToVocab(rows[0]) : null;
}

/**
 * Create SRS cards for all vocabulary at a given JLPT level.
 */
export async function startStudyingVocabLevel(
  userId: number,
  level: JlptLevelId
): Promise<void> {
  const vocab = await getVocabByLevel(level);
  const ids = vocab.map((v) => v.id);
  await createCards(userId, 'vocab', ids);
}

/**
 * Get distinct part-of-speech values for a level.
 */
export async function getPartOfSpeechOptions(level: JlptLevelId): Promise<string[]> {
  const rows = await query<{ part_of_speech: string }>(
    'SELECT DISTINCT part_of_speech FROM vocabulary WHERE jlpt_level = $1 ORDER BY part_of_speech',
    [level]
  );
  return rows.map((r) => r.part_of_speech);
}
