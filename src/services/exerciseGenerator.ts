/**
 * Dynamic exercise generation engine.
 * Generates exercises from existing grammar/vocab data.
 */

import type { VocabDetail } from './vocabService';
import type { GrammarDetail } from './grammarService';
import { conjugateVerb, generateConjugationDistractors, type ConjugationForm } from './conjugationEngine';

// ── Exercise Types ──

export interface FillBlankExercise {
  type: 'fill-blank';
  sentence: string;
  blank: string;
  answer: string;
  options: string[];
  hint?: string;
  grammarId?: number;
}

export interface TranslationExercise {
  type: 'translation';
  source: string;
  sourceLang: 'en' | 'jp';
  answers: string[];
  hint?: string;
}

export interface ConjugationExercise {
  type: 'conjugation';
  verb: string;
  reading: string;
  targetForm: ConjugationForm;
  targetFormLabel: string;
  correctAnswer: string;
  options: string[];
}

export interface ErrorCorrectionExercise {
  type: 'error-correction';
  incorrectSentence: string;
  correctSentence: string;
  explanation: string;
  errorType: string;
}

export interface MatchingExercise {
  type: 'matching';
  pairs: { japanese: string; english: string }[];
}

export interface DialogueExercise {
  type: 'dialogue';
  context: string;
  exchanges: { speaker: string; text: string; isBlank?: boolean; options?: string[]; answer?: string }[];
}

export type GeneratedExercise =
  | FillBlankExercise
  | TranslationExercise
  | ConjugationExercise
  | ErrorCorrectionExercise
  | MatchingExercise
  | DialogueExercise;

// ── Fill-in-Blank from Grammar Examples ──

export function generateFillBlanksFromGrammar(grammar: GrammarDetail[]): FillBlankExercise[] {
  const exercises: FillBlankExercise[] = [];

  for (const g of grammar) {
    for (const ex of g.examples) {
      const japanese = ex.japanese;
      const pattern = g.pattern.replace(/[〜～]/g, '');

      // Try to find the grammar pattern in the sentence
      // Create a blank where the key grammar element appears
      const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'も', 'の', 'か', 'よ', 'ね'];

      // For particle-based grammar, blank out the particle
      for (const p of particles) {
        if (pattern.includes(p) && japanese.includes(p)) {
          const blanked = japanese.replace(p, '___');
          if (blanked !== japanese) {
            const distractors = particles.filter((d) => d !== p && d.length === p.length).sort(() => Math.random() - 0.5).slice(0, 3);
            exercises.push({
              type: 'fill-blank',
              sentence: blanked,
              blank: '___',
              answer: p,
              options: [p, ...distractors].sort(() => Math.random() - 0.5),
              hint: ex.translations?.['en'] ?? '',
              grammarId: g.id,
            });
            break;
          }
        }
      }

      // For verb-form grammar, create translation exercise
      if (ex.translations?.['en']) {
        exercises.push({
          type: 'fill-blank',
          sentence: `${ex.translations['en']}`,
          blank: '___',
          answer: japanese,
          options: [],
          hint: g.pattern,
          grammarId: g.id,
        });
      }
    }
  }

  return exercises;
}

// ── Conjugation Drills from Verb Vocab ──

const DRILL_FORMS: { form: ConjugationForm; label: string }[] = [
  { form: 'masu', label: 'Polite (ます)' },
  { form: 'te', label: 'て-form' },
  { form: 'nai', label: 'Negative (ない)' },
  { form: 'ta', label: 'Past (た)' },
  { form: 'tai', label: 'Want to (たい)' },
  { form: 'potential', label: 'Potential (can)' },
];

export function generateConjugationDrills(verbs: VocabDetail[]): ConjugationExercise[] {
  const exercises: ConjugationExercise[] = [];

  for (const v of verbs) {
    if (!v.partOfSpeech.startsWith('verb')) continue;

    for (const { form, label } of DRILL_FORMS) {
      const answer = conjugateVerb(v.word, v.reading, v.partOfSpeech, form);
      if (!answer) continue;

      const distractors = generateConjugationDistractors(v.word, v.reading, v.partOfSpeech, form, 3);
      if (distractors.length < 2) continue;

      exercises.push({
        type: 'conjugation',
        verb: v.word,
        reading: v.reading,
        targetForm: form,
        targetFormLabel: label,
        correctAnswer: answer,
        options: [answer, ...distractors].sort(() => Math.random() - 0.5),
      });
    }
  }

  return exercises;
}

// ── Translation Exercises from Vocab ──

export function generateTranslationExercises(vocab: VocabDetail[]): TranslationExercise[] {
  return vocab.slice(0, 50).map((v) => {
    const meanings = v.meanings['en'] ?? [];
    return {
      type: 'translation' as const,
      source: meanings[0] ?? '',
      sourceLang: 'en' as const,
      answers: [v.word, v.reading],
      hint: v.partOfSpeech,
    };
  });
}

// ── Matching Pairs from Vocab ──

export function generateMatchingExercises(vocab: VocabDetail[]): MatchingExercise[] {
  const exercises: MatchingExercise[] = [];

  // Create groups of 6 pairs
  const shuffled = [...vocab].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length - 5; i += 6) {
    const group = shuffled.slice(i, i + 6);
    exercises.push({
      type: 'matching',
      pairs: group.map((v) => ({
        japanese: v.word,
        english: (v.meanings['en'] ?? [])[0] ?? '',
      })),
    });
  }

  return exercises;
}

// ── Error Correction Exercises ──

const ERROR_EXERCISES: ErrorCorrectionExercise[] = [
  { type: 'error-correction', incorrectSentence: '私は水が飲みます。', correctSentence: '私は水を飲みます。', explanation: 'Direct objects use を, not が.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: '東京は行きました。', correctSentence: '東京に行きました。', explanation: 'Destinations use に (or へ), not は.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: '日本語は上手です。', correctSentence: '日本語が上手です。', explanation: 'Skills and abilities use が with 上手/下手.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: '昨日、映画を見るました。', correctSentence: '昨日、映画を見ました。', explanation: 'Past polite form: 見る → 見ました (not 見るました).', errorType: 'conjugation' },
  { type: 'error-correction', incorrectSentence: '私はりんごは好きです。', correctSentence: '私はりんごが好きです。', explanation: 'Objects of feelings (好き/嫌い) use が, not は.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: 'バスに乗って、学校に行きます。', correctSentence: 'バスに乗って、学校に行きます。', explanation: 'This sentence is actually correct! Not all sentences have errors.', errorType: 'none' },
  { type: 'error-correction', incorrectSentence: '明日は雨が降ったら、家にいます。', correctSentence: '明日雨が降ったら、家にいます。', explanation: 'With たら conditional, は on the time word is unnecessary.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: 'この本を読むのは難しいです。', correctSentence: 'この本を読むのは難しいです。', explanation: 'This sentence is correct! の nominalizes the verb clause.', errorType: 'none' },
  { type: 'error-correction', incorrectSentence: '先生は学生に教えてあげました。', correctSentence: '先生は学生に教えてくださいました。', explanation: 'When a superior does something for you, use くださる, not あげる.', errorType: 'honorifics' },
  { type: 'error-correction', incorrectSentence: '食べるてください。', correctSentence: '食べてください。', explanation: 'て-form of 食べる is 食べて, not 食べるて.', errorType: 'conjugation' },
  { type: 'error-correction', incorrectSentence: 'きれい花です。', correctSentence: 'きれいな花です。', explanation: 'な-adjectives need な before nouns: きれいな花.', errorType: 'adjective' },
  { type: 'error-correction', incorrectSentence: '彼は走るのが速い。', correctSentence: '彼は走るのが速い。', explanation: 'This is correct! の nominalizes 走る.', errorType: 'none' },
  { type: 'error-correction', incorrectSentence: '毎日、6時に起きるます。', correctSentence: '毎日、6時に起きます。', explanation: 'Polite form of 起きる (ichidan) is 起きます, not 起きるます.', errorType: 'conjugation' },
  { type: 'error-correction', incorrectSentence: 'コーヒーか紅茶か、どちらが好きですか。', correctSentence: 'コーヒーと紅茶と、どちらが好きですか。', explanation: 'When comparing two specific things, use と...と, not か...か.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: '静かの部屋', correctSentence: '静かな部屋', explanation: 'な-adjectives use な (not の) before nouns.', errorType: 'adjective' },
  { type: 'error-correction', incorrectSentence: '友達を会いました。', correctSentence: '友達に会いました。', explanation: '会う (to meet) takes に, not を.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: '電車で降りました。', correctSentence: '電車を降りました。', explanation: '降りる (to get off) uses を for the vehicle, not で.', errorType: 'particle' },
  { type: 'error-correction', incorrectSentence: '日本語を勉強するのために、日本に来ました。', correctSentence: '日本語を勉強するために、日本に来ました。', explanation: 'ために directly follows the dictionary form — no の needed.', errorType: 'grammar' },
  { type: 'error-correction', incorrectSentence: '高い安いのレストランに行きましょう。', correctSentence: '安いレストランに行きましょう。', explanation: '高い and 安い are opposites — you can\'t use both. Choose one.', errorType: 'vocabulary' },
  { type: 'error-correction', incorrectSentence: 'もし暇だったら、映画を見に行きませんか。', correctSentence: 'もし暇だったら、映画を見に行きませんか。', explanation: 'This is correct! もし + たら is a natural conditional pattern.', errorType: 'none' },
];

export function getErrorCorrectionExercises(): ErrorCorrectionExercise[] {
  return [...ERROR_EXERCISES].sort(() => Math.random() - 0.5);
}

// ── Dialogue Completion ──

const DIALOGUES: DialogueExercise[] = [
  {
    type: 'dialogue', context: 'At a restaurant',
    exchanges: [
      { speaker: 'Staff', text: 'いらっしゃいませ！何名様ですか？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['二人です。', '二つください。', '二番です。', '二回です。'], answer: '二人です。' },
      { speaker: 'Staff', text: 'こちらへどうぞ。ご注文はお決まりですか？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['すみません、まだです。', 'はい、元気です。', 'いいえ、大丈夫です。', 'ありがとうございます。'], answer: 'すみません、まだです。' },
    ],
  },
  {
    type: 'dialogue', context: 'Asking for directions',
    exchanges: [
      { speaker: 'You', text: 'すみません、駅はどこですか？' },
      { speaker: 'Person', text: 'まっすぐ行って、右に曲がってください。' },
      { speaker: 'You', text: '___', isBlank: true, options: ['ありがとうございます。', 'いただきます。', 'おはようございます。', 'お元気ですか。'], answer: 'ありがとうございます。' },
    ],
  },
  {
    type: 'dialogue', context: 'At a shop',
    exchanges: [
      { speaker: 'You', text: 'すみません、これはいくらですか？' },
      { speaker: 'Staff', text: '500円です。' },
      { speaker: 'You', text: '___', isBlank: true, options: ['じゃ、これをください。', 'じゃ、これをたべます。', 'じゃ、これがすきです。', 'じゃ、これをしります。'], answer: 'じゃ、これをください。' },
      { speaker: 'Staff', text: 'ありがとうございます。袋はいりますか？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['いいえ、大丈夫です。', 'はい、食べます。', 'はい、行きます。', 'いいえ、飲みません。'], answer: 'いいえ、大丈夫です。' },
    ],
  },
  {
    type: 'dialogue', context: 'Meeting someone new',
    exchanges: [
      { speaker: 'Person', text: 'はじめまして。田中と申します。' },
      { speaker: 'You', text: '___', isBlank: true, options: ['はじめまして。よろしくお願いします。', 'お久しぶりです。', 'さようなら。', 'いただきます。'], answer: 'はじめまして。よろしくお願いします。' },
      { speaker: 'Person', text: 'お仕事は何をされていますか？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['学生です。', '元気です。', '日本です。', '月曜日です。'], answer: '学生です。' },
    ],
  },
  {
    type: 'dialogue', context: 'At the doctor\'s office',
    exchanges: [
      { speaker: 'Doctor', text: 'どうしましたか？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['頭が痛いです。', '頭が好きです。', '頭が上手です。', '頭がきれいです。'], answer: '頭が痛いです。' },
      { speaker: 'Doctor', text: 'いつからですか？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['昨日からです。', '昨日までです。', '昨日にです。', '昨日をです。'], answer: '昨日からです。' },
    ],
  },
  {
    type: 'dialogue', context: 'Making plans with a friend',
    exchanges: [
      { speaker: 'Friend', text: '週末、何かする？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['映画を見に行かない？', '映画を見に行きました。', '映画は好きです。', '映画が上手です。'], answer: '映画を見に行かない？' },
      { speaker: 'Friend', text: 'いいね！何時に会う？' },
      { speaker: 'You', text: '___', isBlank: true, options: ['2時はどう？', '2時が好き。', '2時を食べる。', '2時に寝た。'], answer: '2時はどう？' },
    ],
  },
];

export function getDialogueExercises(): DialogueExercise[] {
  return [...DIALOGUES].sort(() => Math.random() - 0.5);
}

// ── Mixed Session Generator ──

export function generateMixedSession(
  vocab: VocabDetail[],
  grammar: GrammarDetail[],
  maxExercises: number = 15
): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];

  // 1. Conjugation drills (30% of session)
  const verbs = vocab.filter((v) => v.partOfSpeech.startsWith('verb'));
  const conjugations = generateConjugationDrills(verbs.sort(() => Math.random() - 0.5).slice(0, 5));
  exercises.push(...conjugations.slice(0, Math.ceil(maxExercises * 0.3)));

  // 2. Fill-in-blank from grammar (25%)
  const fillBlanks = generateFillBlanksFromGrammar(grammar.sort(() => Math.random() - 0.5).slice(0, 8));
  exercises.push(...fillBlanks.slice(0, Math.ceil(maxExercises * 0.25)));

  // 3. Error correction (15%)
  const errors = getErrorCorrectionExercises();
  exercises.push(...errors.slice(0, Math.ceil(maxExercises * 0.15)));

  // 4. Dialogue (15%)
  const dialogues = getDialogueExercises();
  exercises.push(...dialogues.slice(0, Math.ceil(maxExercises * 0.15)));

  // 5. Matching (15%)
  const matching = generateMatchingExercises(vocab.sort(() => Math.random() - 0.5).slice(0, 12));
  exercises.push(...matching.slice(0, Math.ceil(maxExercises * 0.15)));

  // Shuffle and limit
  return exercises.sort(() => Math.random() - 0.5).slice(0, maxExercises);
}
