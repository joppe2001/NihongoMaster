import { query } from '@/lib/db';
import { createCards } from './srsService';
import type { JlptLevelId } from '@/lib/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface KanjiDetail {
  id: number;
  character: string;
  strokeCount: number;
  jlptLevel: number;
  grade: number;
  frequencyRank: number;
  radical: string;
  radicalNames: string[];
  onReadings: string[];
  kunReadings: string[];
  meanings: Record<string, string[]>;
  mnemonic: string | null;
}

interface KanjiRow {
  id: number;
  character: string;
  stroke_count: number;
  jlpt_level: number;
  grade: number;
  frequency_rank: number;
  radical: string;
  radical_names: string;
  on_readings: string;
  kun_readings: string;
  meanings: string;
  mnemonic: string | null;
}

function rowToKanji(row: KanjiRow): KanjiDetail {
  return {
    id: row.id,
    character: row.character,
    strokeCount: row.stroke_count,
    jlptLevel: row.jlpt_level,
    grade: row.grade,
    frequencyRank: row.frequency_rank,
    radical: row.radical,
    radicalNames: JSON.parse(row.radical_names || '[]'),
    onReadings: JSON.parse(row.on_readings || '[]'),
    kunReadings: JSON.parse(row.kun_readings || '[]'),
    meanings: JSON.parse(row.meanings || '{}'),
    mnemonic: row.mnemonic,
  };
}

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get all kanji for a JLPT level, ordered by frequency.
 */
export async function getKanjiByLevel(level: JlptLevelId): Promise<KanjiDetail[]> {
  const rows = await query<KanjiRow>(
    'SELECT * FROM kanji WHERE jlpt_level = $1 ORDER BY frequency_rank ASC',
    [level]
  );
  return rows.map(rowToKanji);
}

/**
 * Get a single kanji by ID.
 */
export async function getKanjiById(id: number): Promise<KanjiDetail | null> {
  const rows = await query<KanjiRow>(
    'SELECT * FROM kanji WHERE id = $1',
    [id]
  );
  return rows.length > 0 ? rowToKanji(rows[0]) : null;
}

/**
 * Get a single kanji by character.
 */
export async function getKanjiByCharacter(char: string): Promise<KanjiDetail | null> {
  const rows = await query<KanjiRow>(
    'SELECT * FROM kanji WHERE character = $1',
    [char]
  );
  return rows.length > 0 ? rowToKanji(rows[0]) : null;
}

/**
 * Search kanji by character, reading, or meaning.
 */
export async function searchKanji(searchQuery: string): Promise<KanjiDetail[]> {
  const q = `%${searchQuery}%`;
  const rows = await query<KanjiRow>(
    `SELECT * FROM kanji
     WHERE character LIKE $1
        OR on_readings LIKE $1
        OR kun_readings LIKE $1
        OR meanings LIKE $1
     ORDER BY frequency_rank ASC
     LIMIT 50`,
    [q]
  );
  return rows.map(rowToKanji);
}

/**
 * Get kanji count per JLPT level.
 */
export async function getKanjiCountByLevel(): Promise<Record<number, number>> {
  const rows = await query<{ jlpt_level: number; count: number }>(
    'SELECT jlpt_level, COUNT(*) as count FROM kanji GROUP BY jlpt_level'
  );
  const result: Record<number, number> = {};
  for (const row of rows) {
    result[row.jlpt_level] = row.count;
  }
  return result;
}

/**
 * Create SRS cards for all kanji at a given JLPT level.
 */
export async function startStudyingKanjiLevel(
  userId: number,
  level: JlptLevelId
): Promise<void> {
  const kanji = await getKanjiByLevel(level);
  const ids = kanji.map((k) => k.id);
  await createCards(userId, 'kanji', ids);
}
