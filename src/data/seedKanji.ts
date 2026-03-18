import { query, execute } from '@/lib/db';
import { KANJI_N5 } from './kanjiN5';
import { KANJI_N4 } from './kanjiN4';
import { KANJI_N3_PART1 } from './kanjiN3_part1';
import { KANJI_N3_PART2 } from './kanjiN3_part2';
import { KANJI_N3_PART3 } from './kanjiN3_part3';
import { KANJI_N2_PART1 } from './kanjiN2_part1';
import { KANJI_N2_PART2 } from './kanjiN2_part2';
import { KANJI_N2_PART3 } from './kanjiN2_part3';

let seedPromise: Promise<void> | null = null;

const ALL_KANJI = [...KANJI_N5, ...KANJI_N4, ...KANJI_N3_PART1, ...KANJI_N3_PART2, ...KANJI_N3_PART3, ...KANJI_N2_PART1, ...KANJI_N2_PART2, ...KANJI_N2_PART3];

/**
 * Seed kanji data into the database.
 * Uses INSERT OR IGNORE with the existing unique constraint on kanji.character.
 */
export async function seedKanjiData(): Promise<void> {
  if (!seedPromise) {
    seedPromise = doSeed();
  }
  return seedPromise;
}

async function doSeed(): Promise<void> {
  // Check if already seeded
  const existing = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM kanji'
  );

  if ((existing[0]?.count ?? 0) >= ALL_KANJI.length) {
    return;
  }

  for (const k of ALL_KANJI) {
    await execute(
      `INSERT OR IGNORE INTO kanji
        (character, stroke_count, jlpt_level, grade, frequency_rank,
         radical, radical_names, on_readings, kun_readings, meanings, mnemonic)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        k.character,
        k.strokeCount,
        k.jlptLevel,
        k.grade,
        k.frequencyRank,
        k.radical,
        JSON.stringify(k.radicalNames),
        JSON.stringify(k.onReadings),
        JSON.stringify(k.kunReadings),
        JSON.stringify(k.meanings),
        k.mnemonic,
      ]
    );
  }
}
