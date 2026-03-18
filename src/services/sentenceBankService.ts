/**
 * Sentence bank retrieval service.
 *
 * Retrieval-first approach: searches the curated sentence bank for real,
 * natural sentences matching the student's level and target grammar/vocab.
 * Falls back to the dynamic generator only when the bank doesn't cover
 * the student's needs.
 */

import { query } from '@/lib/db';
import { seedSentenceBank } from '@/data/seedSentences';
import {
  generateSentences,
  generateParticleDrills,
  generateTranslationExercises,
  generateDynamicFillBlanks,
  generateDynamicSentenceBuilder,
  type GeneratedSentence,
  type ParticleDrill,
  type TranslationExercise,
} from './sentenceGenerator';
import type { VocabDetail } from './vocabService';
import type { FillBlankExercise as StaticFillBlank } from '@/data/sentenceExercises';

// ─── Types ───────────────────────────────────────────────────

interface SentenceRow {
  id: number;
  japanese: string;
  reading: string;
  english: string;
  jlpt_level: number;
  grammar_points: string;
  scenario: string | null;
  difficulty: number;
}

export interface BankSentence {
  id: number;
  japanese: string;
  reading: string;
  english: string;
  jlptLevel: number;
  grammarPoints: string[];
  scenario: string | null;
  difficulty: 1 | 2 | 3;
}

function rowToSentence(row: SentenceRow): BankSentence {
  return {
    id: row.id,
    japanese: row.japanese,
    reading: row.reading,
    english: row.english,
    jlptLevel: row.jlpt_level,
    grammarPoints: JSON.parse(row.grammar_points || '[]'),
    scenario: row.scenario,
    difficulty: row.difficulty as 1 | 2 | 3,
  };
}

// ─── Ensure bank is seeded ───────────────────────────────────

let initialized = false;

async function ensureSeeded(): Promise<void> {
  if (initialized) return;
  await seedSentenceBank();
  initialized = true;
}

// ─── Retrieval queries ───────────────────────────────────────

/**
 * Get random sentences at or below the student's level.
 */
export async function getRandomSentences(
  maxLevel: number,
  count: number = 10,
  maxDifficulty: number = 3
): Promise<BankSentence[]> {
  await ensureSeeded();
  const rows = await query<SentenceRow>(
    `SELECT * FROM sentence_bank
     WHERE jlpt_level >= $1 AND jlpt_level <= 5
       AND difficulty <= $2
     ORDER BY RANDOM()
     LIMIT $3`,
    [maxLevel, maxDifficulty, count]
  );
  return rows.map(rowToSentence);
}

/**
 * Get sentences that target specific grammar points.
 */
export async function getSentencesByGrammar(
  grammarPoint: string,
  maxLevel: number,
  count: number = 5
): Promise<BankSentence[]> {
  await ensureSeeded();
  const rows = await query<SentenceRow>(
    `SELECT * FROM sentence_bank
     WHERE grammar_points LIKE $1
       AND jlpt_level >= $2 AND jlpt_level <= 5
     ORDER BY RANDOM()
     LIMIT $3`,
    [`%${grammarPoint}%`, maxLevel, count]
  );
  return rows.map(rowToSentence);
}

/**
 * Get sentences for a specific scenario.
 */
export async function getSentencesByScenario(
  scenario: string,
  maxLevel: number,
  count: number = 10
): Promise<BankSentence[]> {
  await ensureSeeded();
  const rows = await query<SentenceRow>(
    `SELECT * FROM sentence_bank
     WHERE scenario = $1
       AND jlpt_level >= $2 AND jlpt_level <= 5
     ORDER BY RANDOM()
     LIMIT $3`,
    [scenario, maxLevel, count]
  );
  return rows.map(rowToSentence);
}

/**
 * Get sentences containing a specific vocabulary word.
 */
export async function getSentencesByVocab(
  word: string,
  maxLevel: number,
  count: number = 5
): Promise<BankSentence[]> {
  await ensureSeeded();
  const rows = await query<SentenceRow>(
    `SELECT * FROM sentence_bank
     WHERE japanese LIKE $1
       AND jlpt_level >= $2 AND jlpt_level <= 5
     ORDER BY RANDOM()
     LIMIT $3`,
    [`%${word}%`, maxLevel, count]
  );
  return rows.map(rowToSentence);
}

// ─── Hybrid: retrieval + generation ──────────────────────────
// These functions try the bank first, then fall back to the generator.

function bankToGenerated(s: BankSentence): GeneratedSentence {
  return {
    japanese: s.japanese,
    reading: s.reading,
    english: s.english,
    words: s.japanese.split(''),  // character-level fallback
    wordReadings: {},
    grammarTags: s.grammarPoints,
    difficulty: s.difficulty,
  };
}

/**
 * Get practice sentences: retrieval-first, generator-fallback.
 * Returns a mix of curated bank sentences and generated ones.
 */
export async function getPracticeSentences(
  vocab: VocabDetail[],
  level: number,
  count: number = 12,
  maxDifficulty: 1 | 2 | 3 = 3
): Promise<GeneratedSentence[]> {
  // Phase 1: Retrieve from bank (aim for 60-70% of target)
  const bankTarget = Math.ceil(count * 0.65);
  const bankSentences = await getRandomSentences(level, bankTarget, maxDifficulty);
  const results: GeneratedSentence[] = bankSentences.map(bankToGenerated);

  // Phase 2: Generate the rest from vocab
  const genTarget = count - results.length;
  if (genTarget > 0 && vocab.length > 0) {
    const generated = generateSentences(vocab, genTarget, maxDifficulty);
    results.push(...generated);
  }

  // Shuffle so bank and generated sentences are interleaved
  return results.sort(() => Math.random() - 0.5);
}

/**
 * Get particle drills: bank sentences with particles blanked out,
 * supplemented by generator.
 */
export async function getPracticeParticleDrills(
  vocab: VocabDetail[],
  level: number,
  count: number = 15
): Promise<ParticleDrill[]> {
  const ALL_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'も', 'の', 'より'];
  const bankSentences = await getRandomSentences(level, count * 2, 2);
  const drills: ParticleDrill[] = [];

  // Create drills from bank sentences
  for (const s of bankSentences) {
    if (drills.length >= Math.ceil(count * 0.6)) break;
    for (const p of ALL_PARTICLES) {
      if (!s.japanese.includes(p)) continue;
      const blanked = s.japanese.replace(p, '___');
      const blankedReading = s.reading.replace(p, '___');
      const distractors = ALL_PARTICLES
        .filter((d) => d !== p)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      drills.push({
        sentence: blanked,
        reading: blankedReading,
        english: s.english,
        blankParticle: p,
        options: [p, ...distractors].sort(() => Math.random() - 0.5),
        difficulty: s.difficulty,
      });
      break;
    }
  }

  // Supplement with generated drills
  const remaining = count - drills.length;
  if (remaining > 0 && vocab.length > 0) {
    drills.push(...generateParticleDrills(vocab, remaining));
  }

  return drills.sort(() => Math.random() - 0.5);
}

/**
 * Get translation exercises: bank + generator hybrid.
 */
export async function getPracticeTranslation(
  vocab: VocabDetail[],
  level: number,
  count: number = 10
): Promise<TranslationExercise[]> {
  const bankSentences = await getRandomSentences(level, Math.ceil(count * 0.6), 2);
  const results: TranslationExercise[] = bankSentences.map((s) => {
    const direction: 'jp-to-en' | 'en-to-jp' = Math.random() > 0.5 ? 'jp-to-en' : 'en-to-jp';
    return {
      japanese: s.japanese,
      reading: s.reading,
      english: s.english,
      direction,
      acceptedAnswers: direction === 'jp-to-en'
        ? [s.english.toLowerCase()]
        : [s.japanese, s.reading],
      difficulty: s.difficulty,
    };
  });

  const remaining = count - results.length;
  if (remaining > 0 && vocab.length > 0) {
    results.push(...generateTranslationExercises(vocab, remaining, 2));
  }

  return results.sort(() => Math.random() - 0.5);
}

/**
 * Get fill-in-blank exercises: bank + generator hybrid.
 */
export async function getPracticeFillBlanks(
  vocab: VocabDetail[],
  level: number,
  count: number = 12
): Promise<StaticFillBlank[]> {
  const ALL_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'も', 'の'];
  const bankSentences = await getRandomSentences(level, count * 2, 2);
  const results: StaticFillBlank[] = [];

  for (const s of bankSentences) {
    if (results.length >= Math.ceil(count * 0.6)) break;
    for (const p of ALL_PARTICLES) {
      if (!s.japanese.includes(p)) continue;
      const blanked = s.japanese.replace(p, '___');
      const blankedReading = s.reading.replace(p, '___');
      const distractors = ALL_PARTICLES
        .filter((d) => d !== p)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      results.push({
        id: `bank-fb-${s.id}`,
        scenario: s.scenario ?? 'bank',
        scenarioIcon: '',
        sentence: blanked,
        reading: blankedReading,
        english: s.english,
        blanks: [{ answer: p, options: [p, ...distractors].sort(() => Math.random() - 0.5) }],
        difficulty: s.difficulty as 1 | 2 | 3,
      });
      break;
    }
  }

  const remaining = count - results.length;
  if (remaining > 0 && vocab.length > 0) {
    results.push(...generateDynamicFillBlanks(vocab, remaining));
  }

  return results.sort(() => Math.random() - 0.5);
}

/**
 * Get sentence builder exercises: bank + generator hybrid.
 */
export async function getPracticeSentenceBuilder(
  vocab: VocabDetail[],
  level: number,
  count: number = 10
): Promise<{ id: string; scenario: string; scenarioIcon: string; prompt: string; japanese: string; reading: string; english: string; words: string[]; wordReadings?: Record<string, string>; difficulty: 1 | 2 | 3 }[]> {
  const bankSentences = await getRandomSentences(level, Math.ceil(count * 0.5), 2);

  // Convert bank sentences to sentence builder format
  // Split Japanese into words heuristically (on particles)
  const bankExercises = bankSentences.map((s) => {
    const words = splitIntoWords(s.japanese);
    return {
      id: `bank-sb-${s.id}`,
      scenario: s.scenario ?? 'bank',
      scenarioIcon: '',
      prompt: s.english,
      japanese: s.japanese,
      reading: s.reading,
      english: s.english,
      words,
      difficulty: s.difficulty,
    };
  }).filter((e) => e.words.length >= 3); // need at least 3 tokens for it to be a puzzle

  // Supplement with generated
  const remaining = count - bankExercises.length;
  const generated = vocab.length > 0 ? generateDynamicSentenceBuilder(vocab, remaining) : [];

  return [...bankExercises, ...generated].sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Heuristic Japanese word splitter for sentence builder exercises.
 * Splits on particles, verb endings, and common boundaries.
 */
function splitIntoWords(japanese: string): string[] {
  // Split before particles (は, が, を, に, で, と, へ, から, まで, も, の, か)
  // and after common endings (ます, です, ました, ません, ください, etc.)
  const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'へ', 'も', 'か'];
  const multiParticles = ['から', 'まで', 'より', 'のに'];
  const endings = ['ます', 'です', 'ました', 'ません', 'ください', 'ましょう', 'ましたか'];

  let text = japanese.replace(/。$/, ''); // strip final period

  // Try to split on known multi-char particles first
  for (const mp of multiParticles) {
    text = text.replace(new RegExp(mp, 'g'), `\0${mp}\0`);
  }

  // Split on single particles (lookahead: they're standalone tokens)
  for (const p of particles) {
    text = text.replace(new RegExp(`([^\\0])${p}`, 'g'), `$1\0${p}\0`);
  }

  // Split on endings
  for (const e of endings) {
    text = text.replace(new RegExp(e, 'g'), `\0${e}`);
  }

  return text.split('\0').map((t) => t.trim()).filter((t) => t.length > 0);
}
