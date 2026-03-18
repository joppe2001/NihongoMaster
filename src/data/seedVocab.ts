import { query, execute } from '@/lib/db';
import { VOCAB_N5 } from './vocabN5';
import { VOCAB_N4 } from './vocabN4';
import { VOCAB_N4_EXTRA } from './vocabN4_extra';
import { VOCAB_N3_PART1 } from './vocabN3_part1';
import { VOCAB_N3_PART2 } from './vocabN3_part2';
import { VOCAB_N3_PART3 } from './vocabN3_part3';
import { VOCAB_N3_PART4 } from './vocabN3_part4';
import { VOCAB_N3_PART5 } from './vocabN3_part5';
import { VOCAB_N3_PART6 } from './vocabN3_part6';
import { VOCAB_N3_PART7 } from './vocabN3_part7';
import { VOCAB_N3_PART8 } from './vocabN3_part8';
import { VOCAB_N3_PART9 } from './vocabN3_part9';
import { VOCAB_N3_PART10 } from './vocabN3_part10';
import { VOCAB_N3_PART11 } from './vocabN3_part11';
import { VOCAB_N3_PART12 } from './vocabN3_part12';
import { VOCAB_N3_PART13 } from './vocabN3_part13';
import { VOCAB_N2_PART1 } from './vocabN2_part1';
import { VOCAB_N2_PART2 } from './vocabN2_part2';
import { VOCAB_N2_PART3 } from './vocabN2_part3';
import { VOCAB_N2_PART4 } from './vocabN2_part4';
import { VOCAB_N2_PART5 } from './vocabN2_part5';

let seedPromise: Promise<void> | null = null;

const ALL_VOCAB = [
  ...VOCAB_N5,
  ...VOCAB_N4,
  ...VOCAB_N4_EXTRA,
  ...VOCAB_N3_PART1,
  ...VOCAB_N3_PART2,
  ...VOCAB_N3_PART3,
  ...VOCAB_N3_PART4,
  ...VOCAB_N3_PART5,
  ...VOCAB_N3_PART6,
  ...VOCAB_N3_PART7,
  ...VOCAB_N3_PART8,
  ...VOCAB_N3_PART9,
  ...VOCAB_N3_PART10,
  ...VOCAB_N3_PART11,
  ...VOCAB_N3_PART12,
  ...VOCAB_N3_PART13,
  ...VOCAB_N2_PART1,
  ...VOCAB_N2_PART2,
  ...VOCAB_N2_PART3,
  ...VOCAB_N2_PART4,
  ...VOCAB_N2_PART5,
];

/**
 * Seed vocabulary data into the database.
 * Uses INSERT OR IGNORE with the existing unique constraint.
 */
export async function seedVocabData(): Promise<void> {
  if (!seedPromise) {
    seedPromise = doSeed();
  }
  return seedPromise;
}

async function doSeed(): Promise<void> {
  const existing = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM vocabulary'
  );

  if ((existing[0]?.count ?? 0) >= ALL_VOCAB.length) {
    return;
  }

  for (const v of ALL_VOCAB) {
    await execute(
      `INSERT OR IGNORE INTO vocabulary
        (word, reading, jlpt_level, part_of_speech, meanings, frequency_rank, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        v.word,
        v.reading,
        v.jlptLevel,
        v.partOfSpeech,
        JSON.stringify(v.meanings),
        v.frequencyRank,
        JSON.stringify(v.tags),
      ]
    );
  }
}
