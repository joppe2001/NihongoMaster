/**
 * Dynamic sentence generator — semantically aware.
 *
 * Composes grammatically AND semantically correct Japanese sentences from
 * the student's vocabulary. Uses tag-based affinity rules so that:
 *   - 美味しい only pairs with food nouns (not "delicious question")
 *   - 広い only pairs with places/spaces (not "wide fish")
 *   - 食べる only takes food objects (not "eat weather")
 *   - Locations use location-tagged nouns
 *
 * Every practice session produces fresh, natural sentences.
 */

import type { VocabDetail } from './vocabService';
import { conjugateVerb, type ConjugationForm } from './conjugationEngine';
import type { FillBlankExercise as StaticFillBlank } from '@/data/sentenceExercises';
import {
  ADJ_NOUN_AFFINITY,
  VERB_OBJECT_AFFINITY,
  INTRANSITIVE_SUBJECT_AFFINITY,
  LOCATION_TAGS,
  EXISTENCE_OBJECT_TAGS,
  MOVEMENT_VERBS,
  INTRANSITIVE_VERBS,
  EXCLUDED_NOUN_TAGS,
  SCENARIO_BUNDLES,
} from '@/data/semanticRules';

// ─── Types ───────────────────────────────────────────────────

export interface GeneratedSentence {
  japanese: string;
  reading: string;
  english: string;
  words: string[];
  wordReadings: Record<string, string>;
  grammarTags: string[];
  difficulty: 1 | 2 | 3;
}

export interface ParticleDrill {
  sentence: string;
  reading: string;
  english: string;
  blankParticle: string;
  options: string[];
  difficulty: 1 | 2 | 3;
}

export interface TranslationExercise {
  japanese: string;
  reading: string;
  english: string;
  direction: 'jp-to-en' | 'en-to-jp';
  acceptedAnswers: string[];
  difficulty: 1 | 2 | 3;
}

// ─── Sentence Templates ──────────────────────────────────────

type SemanticConstraint =
  | { type: 'location' }
  | { type: 'adj-compatible'; adjSlot: string }
  | { type: 'verb-object'; verbSlot: string }
  | { type: 'intransitive-subject'; verbSlot: string }
  | { type: 'existence-object' }
  | { type: 'any-noun' }
  | { type: 'movement-verb' }
  | { type: 'transitive-verb' }
  | { type: 'intransitive-verb' };

interface SlotDef {
  tag: string;
  pos: string[];
  conjugation?: ConjugationForm;
  semantic?: SemanticConstraint;
}

interface SentenceTemplate {
  pattern: string;
  slots: Record<string, SlotDef>;
  englishTemplate: string;
  particles: string[];
  grammarTags: string[];
  difficulty: 1 | 2 | 3;
}

const TEMPLATES: SentenceTemplate[] = [
  // ── N は Adj-i です (copula + i-adj) ──
  {
    pattern: '{N1}は{A}です',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'adj-compatible', adjSlot: 'A' } },
      A:  { tag: 'A', pos: ['i-adjective'] },
    },
    englishTemplate: 'The {N1} is {A}',
    particles: ['は'],
    grammarTags: ['〜です'],
    difficulty: 1,
  },
  // ── N は Adj-na です ──
  {
    pattern: '{N1}は{A}です',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'adj-compatible', adjSlot: 'A' } },
      A:  { tag: 'A', pos: ['na-adjective'] },
    },
    englishTemplate: 'The {N1} is {A}',
    particles: ['は'],
    grammarTags: ['〜です'],
    difficulty: 1,
  },
  // ── N を V-masu (transitive) ──
  {
    pattern: '{N1}を{V}',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'masu', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: 'I {V} the {N1}',
    particles: ['を'],
    grammarTags: ['〜を', '〜ますform'],
    difficulty: 1,
  },
  // ── Location で N を V-masu ──
  {
    pattern: '{LOC}で{N1}を{V}',
    slots: {
      LOC: { tag: 'LOC', pos: ['noun'], semantic: { type: 'location' } },
      N1:  { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:   { tag: 'V', pos: ['verb'], conjugation: 'masu', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: 'I {V} the {N1} at the {LOC}',
    particles: ['で', 'を'],
    grammarTags: ['〜で', '〜を'],
    difficulty: 2,
  },
  // ── N に V-masu (destination / movement) ──
  {
    pattern: '{LOC}に{V}',
    slots: {
      LOC: { tag: 'LOC', pos: ['noun'], semantic: { type: 'location' } },
      V:   { tag: 'V', pos: ['verb'], conjugation: 'masu', semantic: { type: 'movement-verb' } },
    },
    englishTemplate: 'I {V} to the {LOC}',
    particles: ['に'],
    grammarTags: ['〜に'],
    difficulty: 1,
  },
  // ── N を V-tai (want to) ──
  {
    pattern: '{N1}を{V}',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'tai', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: 'I want to {V} the {N1}',
    particles: ['を'],
    grammarTags: ['〜たい'],
    difficulty: 2,
  },
  // ── N を V-masen (negative) ──
  {
    pattern: '{N1}を{V}',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'masen', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: "I don't {V} the {N1}",
    particles: ['を'],
    grammarTags: ['〜ません'],
    difficulty: 1,
  },
  // ── N を V-mashita (past) ──
  {
    pattern: '{N1}を{V}',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'mashita', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: 'I {V} the {N1}',
    particles: ['を'],
    grammarTags: ['〜ました'],
    difficulty: 1,
  },
  // ── V-te ください (request) ──
  {
    pattern: '{N1}を{V}ください',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'te', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: 'Please {V} the {N1}',
    particles: ['を'],
    grammarTags: ['〜てください'],
    difficulty: 2,
  },
  // ── Location に N があります (existence) ──
  {
    pattern: '{LOC}に{N1}があります',
    slots: {
      LOC: { tag: 'LOC', pos: ['noun'], semantic: { type: 'location' } },
      N1:  { tag: 'N1', pos: ['noun'], semantic: { type: 'existence-object' } },
    },
    englishTemplate: 'There is a {N1} at the {LOC}',
    particles: ['に', 'が'],
    grammarTags: ['〜があります'],
    difficulty: 1,
  },
  // ── N1 は N2 より Adj です (comparative) ──
  {
    pattern: '{N1}は{N2}より{A}です',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'adj-compatible', adjSlot: 'A' } },
      N2: { tag: 'N2', pos: ['noun'], semantic: { type: 'adj-compatible', adjSlot: 'A' } },
      A:  { tag: 'A', pos: ['i-adjective'] },
    },
    englishTemplate: 'The {N1} is more {A} than the {N2}',
    particles: ['は', 'より'],
    grammarTags: ['〜より'],
    difficulty: 2,
  },
  // ── N を V-potential (can do) ──
  {
    pattern: '{N1}を{V}',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'verb-object', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'potential', semantic: { type: 'transitive-verb' } },
    },
    englishTemplate: 'I can {V} the {N1}',
    particles: ['を'],
    grammarTags: ['potential'],
    difficulty: 3,
  },
  // ── N が V-masu (intransitive — rain falls, class begins) ──
  {
    pattern: '{N1}が{V}',
    slots: {
      N1: { tag: 'N1', pos: ['noun'], semantic: { type: 'intransitive-subject', verbSlot: 'V' } },
      V:  { tag: 'V', pos: ['verb'], conjugation: 'masu', semantic: { type: 'intransitive-verb' } },
    },
    englishTemplate: 'The {N1} {V}',
    particles: ['が'],
    grammarTags: ['〜が'],
    difficulty: 1,
  },
];

// ─── Helpers ─────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get a clean English verb form (strip "to " prefix) */
function getVerbMeaning(v: VocabDetail): string {
  const raw = (v.meanings['en'] ?? [])[0] ?? v.word;
  return raw.replace(/^to /, '');
}

/** Mass/uncountable nouns that should NOT get "the" or "a" in English */
const MASS_NOUNS = new Set([
  'water', 'money', 'food', 'weather', 'time', 'work', 'music',
  'rain', 'snow', 'tea', 'coffee', 'homework', 'study', 'air',
  'rice', 'meat', 'milk', 'bread', 'paper', 'fun', 'help',
]);

/** Get a clean English noun (strip leading articles — templates add their own) */
function getNounMeaning(v: VocabDetail): string {
  const raw = (v.meanings['en'] ?? [])[0] ?? v.word;
  return raw.replace(/^(the |a |an )/, '');
}

/** Check if a noun is a mass/uncountable noun */
function isMassNoun(v: VocabDetail): boolean {
  const meaning = (v.meanings['en'] ?? [])[0] ?? '';
  return MASS_NOUNS.has(meaning.toLowerCase().replace(/^(the |a |an )/, ''));
}

/** Check if a noun is a valid generic noun (not a greeting, pronoun, etc.) */
function isUsableNoun(v: VocabDetail): boolean {
  return v.partOfSpeech === 'noun' && !v.tags.some((t) => EXCLUDED_NOUN_TAGS.has(t));
}

/** Check if a noun has any of the given tags */
function hasAnyTag(v: VocabDetail, tags: string[]): boolean {
  return v.tags.some((t) => tags.includes(t));
}

/** Check if a noun qualifies as a location */
function isLocation(v: VocabDetail): boolean {
  return v.tags.some((t) => LOCATION_TAGS.has(t));
}

/** Check if a noun can "exist" in a location */
function isExistenceObject(v: VocabDetail): boolean {
  return v.tags.some((t) => EXISTENCE_OBJECT_TAGS.has(t));
}

/** Check if a verb is a movement verb */
function isMovementVerb(v: VocabDetail): boolean {
  return MOVEMENT_VERBS.has(v.word);
}

/** Check if a verb is transitive (not movement, not existence, not intransitive) */
function isTransitiveVerb(v: VocabDetail): boolean {
  return v.partOfSpeech.startsWith('verb') && !MOVEMENT_VERBS.has(v.word) &&
    !INTRANSITIVE_VERBS.has(v.word) && v.word !== 'ある' && v.word !== 'いる';
}

/** Check if a verb is intransitive (subject が verb, no object) */
function isIntransitiveVerb(v: VocabDetail): boolean {
  return INTRANSITIVE_VERBS.has(v.word);
}

/** Get compatible subject tags for an intransitive verb */
function getIntransitiveSubjectTags(verbWord: string): string[] | null {
  return INTRANSITIVE_SUBJECT_AFFINITY[verbWord] ?? null;
}

/** Get compatible noun tags for an adjective */
function getAdjCompatibleTags(adjWord: string): string[] | null {
  return ADJ_NOUN_AFFINITY[adjWord] ?? null;
}

/** Get compatible noun tags for a verb's object */
function getVerbObjectTags(verbWord: string): string[] | null {
  return VERB_OBJECT_AFFINITY[verbWord] ?? null;
}

// ─── Core Generator ──────────────────────────────────────────

/**
 * Try to fill a template with semantically compatible vocabulary.
 * Returns null if no valid combination is found.
 */
function fillTemplate(
  template: SentenceTemplate,
  vocab: VocabDetail[]
): GeneratedSentence | null {
  const slotKeys = Object.keys(template.slots);
  const filled: Record<string, VocabDetail> = {};
  const usedIds = new Set<number>();

  // We may need to resolve dependencies between slots.
  // Strategy: fill adjective/verb slots first (they constrain noun slots),
  // then fill noun slots filtered by the adj/verb affinity.

  // Phase 1: identify and fill "independent" slots (adj, verb)
  const adjSlots = slotKeys.filter((k) =>
    template.slots[k].pos.some((p) => p.includes('adjective'))
  );
  const verbSlots = slotKeys.filter((k) =>
    template.slots[k].pos.some((p) => p === 'verb')
  );
  const nounSlots = slotKeys.filter((k) =>
    template.slots[k].pos.includes('noun')
  );

  // Fill adjective slots
  for (const key of adjSlots) {
    const slot = template.slots[key];
    const candidates = vocab.filter(
      (v) => slot.pos.some((p) => v.partOfSpeech === p) && !usedIds.has(v.id)
    );
    if (candidates.length === 0) return null;
    const pick = pickRandom(candidates);
    filled[key] = pick;
    usedIds.add(pick.id);
  }

  // Fill verb slots
  for (const key of verbSlots) {
    const slot = template.slots[key];
    const semantic = slot.semantic;
    let candidates = vocab.filter(
      (v) => v.partOfSpeech.startsWith('verb') && !usedIds.has(v.id)
    );

    if (semantic?.type === 'movement-verb') {
      candidates = candidates.filter(isMovementVerb);
    } else if (semantic?.type === 'transitive-verb') {
      candidates = candidates.filter(isTransitiveVerb);
    } else if (semantic?.type === 'intransitive-verb') {
      candidates = candidates.filter(isIntransitiveVerb);
    }

    if (candidates.length === 0) return null;
    const pick = pickRandom(candidates);
    filled[key] = pick;
    usedIds.add(pick.id);
  }

  // Fill noun slots — now we can use adj/verb affinity to filter
  for (const key of nounSlots) {
    const slot = template.slots[key];
    const semantic = slot.semantic;
    let candidates = vocab.filter(
      (v) => v.partOfSpeech === 'noun' && !usedIds.has(v.id) && isUsableNoun(v)
    );

    if (semantic?.type === 'location') {
      candidates = candidates.filter(isLocation);
    } else if (semantic?.type === 'existence-object') {
      candidates = candidates.filter(isExistenceObject);
    } else     if (semantic?.type === 'adj-compatible' && semantic.adjSlot) {
      const adj = filled[semantic.adjSlot];
      if (adj) {
        const compatTags = getAdjCompatibleTags(adj.word);
        if (!compatTags) return null; // Unknown adjective — skip template, don't guess
        candidates = candidates.filter((v) => hasAnyTag(v, compatTags));
      }
    } else if (semantic?.type === 'verb-object' && semantic.verbSlot) {
      const verb = filled[semantic.verbSlot];
      if (verb) {
        const compatTags = getVerbObjectTags(verb.word);
        if (!compatTags) return null; // Unknown verb — skip template, don't guess
        candidates = candidates.filter((v) => hasAnyTag(v, compatTags));
      }
    } else if (semantic?.type === 'intransitive-subject' && semantic.verbSlot) {
      const verb = filled[semantic.verbSlot];
      if (verb) {
        const compatTags = getIntransitiveSubjectTags(verb.word);
        if (!compatTags) return null;
        candidates = candidates.filter((v) => hasAnyTag(v, compatTags));
      }
    } else if (semantic?.type === 'any-noun') {
      // already filtered to usable nouns
    }

    if (candidates.length === 0) return null;

    // For comparative templates: if another noun is already filled,
    // require the new noun to share at least one tag (same category).
    // This prevents "ear is bigger than bank" — ears compare to eyes,
    // banks compare to libraries.
    const otherNounKeys = nounSlots.filter((k) => k !== key && filled[k]);
    if (otherNounKeys.length > 0) {
      const otherTags = new Set(otherNounKeys.flatMap((k) => filled[k].tags));
      const sameCategoryCandidates = candidates.filter((v) =>
        v.tags.some((t) => otherTags.has(t))
      );
      if (sameCategoryCandidates.length > 0) {
        candidates = sameCategoryCandidates;
      }
      // If no same-category match, fall through to the wider pool
      // (better a slight mismatch than zero output)
    }

    const pick = pickRandom(candidates);
    filled[key] = pick;
    usedIds.add(pick.id);
  }

  // ── Build the sentence ──

  let japanese = template.pattern;
  let reading = template.pattern;
  let english = template.englishTemplate;
  const words: string[] = [];
  const wordReadings: Record<string, string> = {};

  for (const key of slotKeys) {
    const v = filled[key];
    if (!v) return null; // safety
    const slot = template.slots[key];

    let wordForm = v.word;
    let readingForm = v.reading;

    // Conjugate verbs
    if (slot.conjugation) {
      const conj = conjugateVerb(v.word, v.reading, v.partOfSpeech, slot.conjugation);
      if (conj) {
        wordForm = conj;
        const conjReading = conjugateVerb(v.reading, v.reading, v.partOfSpeech, slot.conjugation);
        readingForm = conjReading ?? conj;
      }
    }

    japanese = japanese.replace(`{${key}}`, wordForm);
    reading = reading.replace(`{${key}}`, readingForm);

    // Use clean English: verbs without "to " prefix, nouns natural
    const isVerb = v.partOfSpeech.startsWith('verb');
    english = english.replace(`{${key}}`, isVerb ? getVerbMeaning(v) : getNounMeaning(v));

    words.push(wordForm);
    if (wordForm !== readingForm) {
      wordReadings[wordForm] = readingForm;
    }
  }

  // Post-process English: drop articles before mass nouns
  // Templates use "the {N}" or "a {N}" but mass nouns don't take articles
  for (const key of nounSlots) {
    const v = filled[key];
    if (v && isMassNoun(v)) {
      const meaning = getNounMeaning(v);
      english = english.replace(`the ${meaning}`, meaning);
      english = english.replace(`a ${meaning}`, meaning);
    }
  }

  // Tokenize: split on particles / known boundaries
  const allTokens: string[] = [];
  let remaining = japanese;
  for (const w of words) {
    const idx = remaining.indexOf(w);
    if (idx > 0) allTokens.push(remaining.slice(0, idx));
    allTokens.push(w);
    remaining = remaining.slice(idx + w.length);
  }
  if (remaining) allTokens.push(remaining);

  return {
    japanese,
    reading,
    english,
    words: allTokens.filter((t) => t.length > 0),
    wordReadings,
    grammarTags: template.grammarTags,
    difficulty: template.difficulty,
  };
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Generate N semantically coherent sentences from the student's vocabulary.
 */
export function generateSentences(
  vocab: VocabDetail[],
  count: number = 10,
  maxDifficulty: 1 | 2 | 3 = 3
): GeneratedSentence[] {
  const eligible = TEMPLATES.filter((t) => t.difficulty <= maxDifficulty);
  const results: GeneratedSentence[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (results.length < count && attempts < count * 12) {
    attempts++;

    // Optionally pick a scenario bundle to further constrain
    const useScenario = Math.random() < 0.4;
    let filteredVocab = vocab;

    if (useScenario) {
      const scenario = pickRandom(SCENARIO_BUNDLES);
      filteredVocab = vocab.filter((v) => {
        if (v.partOfSpeech === 'noun') return v.tags.some((t) => scenario.nounTags.includes(t));
        if (v.partOfSpeech.includes('adjective')) return scenario.adjectives.includes(v.word);
        if (v.partOfSpeech.startsWith('verb')) return scenario.verbs.includes(v.word);
        return false;
      });
      if (filteredVocab.length < 4) filteredVocab = vocab; // fallback
    }

    const template = pickRandom(eligible);
    const sentence = fillTemplate(template, shuffle(filteredVocab));
    if (!sentence || seen.has(sentence.japanese)) continue;
    seen.add(sentence.japanese);
    results.push(sentence);
  }

  return results;
}

/**
 * Generate particle drills from known vocabulary.
 */
export function generateParticleDrills(
  vocab: VocabDetail[],
  count: number = 12
): ParticleDrill[] {
  const ALL_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'も', 'の', 'より'];
  const sentences = generateSentences(vocab, count * 2, 2);
  const drills: ParticleDrill[] = [];

  for (const s of sentences) {
    if (drills.length >= count) break;
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
        options: shuffle([p, ...distractors]),
        difficulty: s.difficulty,
      });
      break;
    }
  }
  return drills;
}

/**
 * Generate translation exercises.
 */
export function generateTranslationExercises(
  vocab: VocabDetail[],
  count: number = 10,
  maxDifficulty: 1 | 2 | 3 = 2
): TranslationExercise[] {
  const sentences = generateSentences(vocab, count, maxDifficulty);
  return sentences.map((s) => {
    const direction: 'jp-to-en' | 'en-to-jp' = Math.random() > 0.5 ? 'jp-to-en' : 'en-to-jp';
    const acceptedAnswers = direction === 'jp-to-en'
      ? [s.english.toLowerCase()]
      : [s.japanese, s.reading];
    return { japanese: s.japanese, reading: s.reading, english: s.english, direction, acceptedAnswers, difficulty: s.difficulty };
  });
}

/**
 * Generate fill-in-blank exercises (StaticFillBlank format).
 */
export function generateDynamicFillBlanks(
  vocab: VocabDetail[],
  count: number = 10
): StaticFillBlank[] {
  const drills = generateParticleDrills(vocab, count);
  return drills.map((d, i) => ({
    id: `dyn-fb-${i}`,
    scenario: 'dynamic',
    scenarioIcon: '',
    sentence: d.sentence,
    reading: d.reading,
    english: d.english,
    blanks: [{ answer: d.blankParticle, options: d.options }],
    difficulty: d.difficulty,
  }));
}

/**
 * Generate sentence builder exercises.
 */
export function generateDynamicSentenceBuilder(
  vocab: VocabDetail[],
  count: number = 10,
): { id: string; scenario: string; scenarioIcon: string; prompt: string; japanese: string; reading: string; english: string; words: string[]; wordReadings?: Record<string, string>; difficulty: 1 | 2 | 3 }[] {
  const sentences = generateSentences(vocab, count, 2);
  return sentences.map((s, i) => ({
    id: `dyn-sb-${i}`,
    scenario: 'dynamic',
    scenarioIcon: '',
    prompt: s.english,
    japanese: s.japanese,
    reading: s.reading,
    english: s.english,
    words: s.words,
    wordReadings: Object.keys(s.wordReadings).length > 0 ? s.wordReadings : undefined,
    difficulty: s.difficulty,
  }));
}
