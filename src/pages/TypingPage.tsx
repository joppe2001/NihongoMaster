import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultIcon, StreakBadge } from '@/components/shared/ResultIcon';
import { Flame, Sparkles, PenLine, BarChart3, Flag } from '@/lib/icons';
import { useUserStore } from '@/stores/userStore';
import { saveTypingSession, getTypingSessions } from '@/services/typingService';
import { getWordLists, createWordList, deleteWordList, parseWordListText } from '@/services/wordListService';
import { recordVocabQuizAnswer } from '@/services/vocabMasteryService';
import { query } from '@/lib/db';
import type { TypingSessionRecord } from '@/services/typingService';
import type { CustomWordList } from '@/services/wordListService';
import { PageHeader } from '@/components/shared/PageHeader';

// ─── Smart word generation from learned content ─────────────

interface VocabRow {
  id: number;
  word: string;
  reading: string;
  meanings: string;
}

// ─── Knowledge estimation ────────────────────────────────────
// JLPT levels are 5 (N5 beginner) → 1 (N1 advanced).
// We estimate the student's effective level from SRS progress so that
// typing practice only surfaces words they're likely to recognise or
// are ready to learn next — never random N1 kanji for a beginner.

interface StudentLevel {
  /** The student's configured JLPT level from settings */
  configuredLevel: number;
  /** Effective working level (may be one step harder if they've mastered enough) */
  effectiveLevel: number;
  /** Whether they've learned enough at their level to start seeing next-level words */
  readyForNext: boolean;
  /** % of current-level vocab that exists as SRS cards with reps >= 2 */
  masteryPercent: number;
}

/**
 * Estimate the student's effective JLPT level from their SRS progress.
 *
 * Rules:
 *  - Start from their configured level (users.current_level).
 *  - Count how many vocab at that level they've genuinely learned (reps >= 2).
 *  - If ≥60 % learned → they're "ready for next" (some next-level words mixed in).
 *  - If ≥80 % learned → bump effectiveLevel one step harder (e.g. N5 → N4).
 */
async function estimateStudentLevel(userId: number): Promise<StudentLevel> {
  try {
    const userRows = await query<{ current_level: number }>(
      'SELECT current_level FROM users WHERE id = $1',
      [userId]
    );
    const configuredLevel = userRows[0]?.current_level ?? 5;

    // How many vocab at their level exist vs. how many they've studied
    const rows = await query<{ total: number; learned: number }>(
      `SELECT
         COUNT(v.id) as total,
         COUNT(CASE WHEN sc.reps >= 2 THEN 1 END) as learned
       FROM vocabulary v
       LEFT JOIN srs_cards sc
         ON sc.content_id = v.id
         AND sc.content_type = 'vocab'
         AND sc.user_id = $1
       WHERE v.jlpt_level = $2`,
      [userId, configuredLevel]
    );

    const total = Math.max(rows[0]?.total ?? 1, 1);
    const learned = rows[0]?.learned ?? 0;
    const masteryPercent = Math.round((learned / total) * 100);

    const readyForNext = masteryPercent >= 60 && configuredLevel > 1;
    const effectiveLevel =
      masteryPercent >= 80 && configuredLevel > 1
        ? configuredLevel - 1
        : configuredLevel;

    return { configuredLevel, effectiveLevel, readyForNext, masteryPercent };
  } catch {
    return { configuredLevel: 5, effectiveLevel: 5, readyForNext: false, masteryPercent: 0 };
  }
}

/**
 * Fetch vocab the user has studied via SRS, biased toward words that
 * still need reinforcement (low stability / high lapses) while keeping
 * enough variety so confident words appear too.
 */
async function getLearnedVocab(userId: number): Promise<JapaneseWord[]> {
  try {
    const rows = await query<VocabRow>(
      `SELECT v.id, v.word, v.reading, v.meanings
       FROM srs_cards sc
       JOIN vocabulary v ON sc.content_id = v.id
       WHERE sc.user_id = $1 AND sc.content_type = 'vocab' AND sc.reps > 0
       ORDER BY
         /* words with low stability or many lapses surface first … */
         (sc.stability - sc.lapses * 5),
         /* … but RANDOM tiebreaker keeps variety */
         RANDOM()
       LIMIT 100`,
      [userId]
    );
    return vocabRowsToWords(rows);
  } catch {
    return [];
  }
}

/**
 * Fetch vocab the user has NOT yet studied, scoped to their estimated
 * knowledge level. Picks the highest-frequency words first so new words
 * are useful rather than obscure.
 *
 * Level logic:
 *  - Always include their current JLPT level.
 *  - Always include easier levels they may have skipped (e.g. N5 words
 *    a student set to N4 hasn't seen yet).
 *  - If "ready for next", also include the next-harder level at low weight.
 *  - Order by: current level first → frequency rank → random tiebreaker.
 */
async function getNewVocab(userId: number): Promise<JapaneseWord[]> {
  try {
    const level = await estimateStudentLevel(userId);

    // Hardest level we'll include (lower number = harder)
    const hardestLevel = level.readyForNext
      ? Math.max(level.effectiveLevel - 1, 1)
      : level.effectiveLevel;

    // Easiest level is always 5 (catch any N5 stragglers)
    const easiestLevel = 5;

    const rows = await query<VocabRow>(
      `SELECT v.id, v.word, v.reading, v.meanings
       FROM vocabulary v
       WHERE v.jlpt_level >= $2    /* >= hardest (lower number) */
         AND v.jlpt_level <= $3    /* <= easiest (5 = N5 beginner) */
         AND v.id NOT IN (
           SELECT sc.content_id FROM srs_cards sc
           WHERE sc.user_id = $1 AND sc.content_type = 'vocab'
         )
         AND length(v.reading) >= 2
       ORDER BY
         /* Prioritise words at the student's active level */
         CASE WHEN v.jlpt_level = $4 THEN 0 ELSE 1 END,
         /* Then most common words first */
         v.frequency_rank ASC,
         RANDOM()
       LIMIT 50`,
      [userId, hardestLevel, easiestLevel, level.effectiveLevel]
    );
    return vocabRowsToWords(rows);
  } catch {
    return [];
  }
}

/** Shared helper: convert DB rows into JapaneseWord[] */
function vocabRowsToWords(rows: VocabRow[]): JapaneseWord[] {
  return rows
    .map((r) => {
      const parsed = JSON.parse(r.meanings || '{}');
      const enMeanings: string[] = parsed['en'] ?? [];
      return {
        vocabId: r.id,
        romaji: r.reading,
        kana: r.reading,
        kanji: r.word !== r.reading ? r.word : undefined,
        meaning: enMeanings[0] ?? r.word,
      };
    })
    .filter((w) => w.romaji.length >= 2);
}

/**
 * Build a non-repeating word list by mixing learned vocab, new (unstudied)
 * vocab, and the static bank. Introduces fresh words each session.
 *   ~55% learned (reinforcement), ~20% new (discovery), ~25% static bank
 * Guarantees no consecutive duplicates.
 */
function buildSmartWordList(
  learned: JapaneseWord[],
  newWords: JapaneseWord[],
  bank: JapaneseWord[],
  count: number
): JapaneseWord[] {
  const learnedPool = shuffle([...learned]);
  const newPool = shuffle([...newWords]);
  const bankPool = shuffle([...bank]);

  // Target: 55% learned, 20% new, 25% bank (flexible when pools are small)
  const learnedTarget = Math.min(learnedPool.length, Math.ceil(count * 0.55));
  const newTarget = Math.min(newPool.length, Math.ceil(count * 0.2));
  const bankTarget = Math.max(0, count - learnedTarget - newTarget);

  const pool = [
    ...learnedPool.slice(0, learnedTarget),
    ...newPool.slice(0, newTarget),
    ...bankPool.slice(0, bankTarget),
  ];

  // If not enough, fill from whichever pool has the most remaining
  while (pool.length < count) {
    const sources = [learnedPool, newPool, bankPool].sort((a, b) => b.length - a.length);
    const filler = sources[0];
    const next = filler[pool.length % filler.length];
    if (next) pool.push(next);
    else break;
  }

  // Shuffle and de-duplicate consecutive entries
  return dedupeConsecutive(shuffle(pool));
}

/** Same for romaji mode — returns string[] */
function buildSmartRomajiList(
  learned: JapaneseWord[],
  newWords: JapaneseWord[],
  bank: string[],
  count: number
): string[] {
  const learnedRomaji = learned.map((w) => w.romaji);
  const newRomaji = newWords.map((w) => w.romaji);
  const learnedPool = shuffle([...new Set(learnedRomaji)]);
  const newPool = shuffle([...new Set(newRomaji)]);
  const bankPool = shuffle([...bank]);

  const learnedTarget = Math.min(learnedPool.length, Math.ceil(count * 0.55));
  const newTarget = Math.min(newPool.length, Math.ceil(count * 0.2));
  const bankTarget = Math.max(0, count - learnedTarget - newTarget);

  const pool = [
    ...learnedPool.slice(0, learnedTarget),
    ...newPool.slice(0, newTarget),
    ...bankPool.slice(0, bankTarget),
  ];

  while (pool.length < count) {
    const sources = [learnedPool, newPool, bankPool].sort((a, b) => b.length - a.length);
    const filler = sources[0];
    const next = filler[pool.length % filler.length];
    if (next) pool.push(next);
    else break;
  }

  return dedupeConsecutive(shuffle(pool));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupeConsecutive<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr;
  const result = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1]) {
      result.push(arr[i]);
    }
  }
  return result;
}

type TypingMode = 'romaji' | 'japanese' | 'custom' | 'history';
type Difficulty = 'easy' | 'medium' | 'hard';

/** Per-word result tracked during a session for the end-of-session review. */
interface WordResult {
  /** The word the student was asked to type */
  expected: string;
  /** What the student actually typed (empty if auto-advanced correctly) */
  typed: string;
  correct: boolean;
  /** Optional richer data for Japanese mode */
  kana?: string;
  kanji?: string;
  meaning?: string;
}

// ─── Word Banks (by difficulty) ─────────────────────────────

const ROMAJI_EASY = [
  'neko', 'inu', 'ame', 'sora', 'yama', 'kawa', 'hana', 'umi',
  'mizu', 'hi', 'kaze', 'tsuki', 'hoshi', 'yuki', 'kumo',
  'ie', 'machi', 'mori', 'eki', 'michi',
  'ki', 'te', 'me', 'ashi', 'hito', 'mono', 'tori', 'sakana',
  'niku', 'ishi', 'kane', 'kome', 'tsuchi', 'kuchi', 'mimi',
  'kao', 'oto', 'kusa', 'mushi', 'suna', 'shima', 'kuni',
  'iro', 'koe', 'chikara', 'sato', 'niwa', 'ike', 'hatake',
];

const ROMAJI_MEDIUM = [
  'arigatou', 'konnichiwa', 'ohayou', 'sayounara', 'sumimasen',
  'kudasai', 'onegai', 'oyasumi', 'sugoi', 'kawaii',
  'kirei', 'oishii', 'tanoshii', 'ureshii', 'gomen',
  'sensei', 'tomodachi', 'tabemono', 'nomimono', 'gakkou',
  'shigoto', 'densha', 'sakura', 'gambatte', 'omedetou',
  'byouin', 'toshokan', 'kouen', 'heya', 'jikan',
  'tenki', 'kazoku', 'ryouri', 'ongaku', 'eiga',
  'kutsu', 'kaban', 'yasumi', 'kotoba', 'namae',
  'tegami', 'tokei', 'kaimono', 'shashin', 'kusuri',
  'kippu', 'nimotsu', 'yubiwa', 'hagaki', 'zasshi',
];

const ROMAJI_HARD = [
  'hajimemashite', 'itadakimasu', 'gochisousama', 'wakarimashita',
  'yoroshiku', 'tsukaremashita', 'daijoubu', 'chottomatte',
  'shitsureishimasu', 'okaerinaasai', 'ittekimasu', 'itterasshai',
  'tadaima', 'okaerinasai', 'moushiwakearimasen', 'ganbarimashou',
  'chousensha', 'ryokou', 'benkyoushimasu', 'asobimashita',
  'keiken', 'seikatsu', 'mondai', 'kankyou', 'shakai',
  'bunka', 'rekishi', 'shizen', 'koutsuu', 'kyouiku',
  'undou', 'kenkou', 'yakusoku', 'junbi', 'soudan',
  'chuumon', 'setsumei', 'shoukai', 'happyou', 'kankei',
];

interface JapaneseWord {
  vocabId?: number;         // DB id — present for words sourced from vocabulary table
  romaji: string;
  kana: string;
  kanji?: string;           // primary kanji form (shown as "expected")
  altAccepted?: string[];   // additional accepted forms
  meaning: string;
}

/** Check if user input matches any accepted form of the word */
function matchesWord(input: string, word: JapaneseWord): boolean {
  const trimmed = input.trim();
  if (trimmed === word.kana) return true;
  if (word.kanji && trimmed === word.kanji) return true;
  if (word.altAccepted?.includes(trimmed)) return true;
  return false;
}

const JP_EASY: JapaneseWord[] = [
  { romaji: 'neko', kana: 'ねこ', kanji: '猫', meaning: 'Cat' },
  { romaji: 'inu', kana: 'いぬ', kanji: '犬', meaning: 'Dog' },
  { romaji: 'ame', kana: 'あめ', kanji: '雨', meaning: 'Rain' },
  { romaji: 'sora', kana: 'そら', kanji: '空', meaning: 'Sky' },
  { romaji: 'yama', kana: 'やま', kanji: '山', meaning: 'Mountain' },
  { romaji: 'kawa', kana: 'かわ', kanji: '川', meaning: 'River' },
  { romaji: 'hana', kana: 'はな', kanji: '花', meaning: 'Flower' },
  { romaji: 'umi', kana: 'うみ', kanji: '海', meaning: 'Sea' },
  { romaji: 'mizu', kana: 'みず', kanji: '水', meaning: 'Water' },
  { romaji: 'hi', kana: 'ひ', kanji: '火', altAccepted: ['日'], meaning: 'Fire / Sun' },
  { romaji: 'kaze', kana: 'かぜ', kanji: '風', meaning: 'Wind' },
  { romaji: 'tsuki', kana: 'つき', kanji: '月', meaning: 'Moon' },
  { romaji: 'yuki', kana: 'ゆき', kanji: '雪', meaning: 'Snow' },
  { romaji: 'kumo', kana: 'くも', kanji: '雲', meaning: 'Cloud' },
  { romaji: 'mori', kana: 'もり', kanji: '森', meaning: 'Forest' },
  { romaji: 'ki', kana: 'き', kanji: '木', meaning: 'Tree' },
  { romaji: 'te', kana: 'て', kanji: '手', meaning: 'Hand' },
  { romaji: 'me', kana: 'め', kanji: '目', meaning: 'Eye' },
  { romaji: 'ashi', kana: 'あし', kanji: '足', meaning: 'Foot' },
  { romaji: 'kuchi', kana: 'くち', kanji: '口', meaning: 'Mouth' },
  { romaji: 'mimi', kana: 'みみ', kanji: '耳', meaning: 'Ear' },
  { romaji: 'hito', kana: 'ひと', kanji: '人', meaning: 'Person' },
  { romaji: 'mono', kana: 'もの', kanji: '物', meaning: 'Thing' },
  { romaji: 'tori', kana: 'とり', kanji: '鳥', meaning: 'Bird' },
  { romaji: 'sakana', kana: 'さかな', kanji: '魚', meaning: 'Fish' },
  { romaji: 'niku', kana: 'にく', kanji: '肉', meaning: 'Meat' },
  { romaji: 'ishi', kana: 'いし', kanji: '石', meaning: 'Stone' },
  { romaji: 'kane', kana: 'かね', kanji: '金', meaning: 'Money' },
  { romaji: 'kome', kana: 'こめ', kanji: '米', meaning: 'Rice' },
  { romaji: 'tsuchi', kana: 'つち', kanji: '土', meaning: 'Earth' },
  { romaji: 'oto', kana: 'おと', kanji: '音', meaning: 'Sound' },
  { romaji: 'kao', kana: 'かお', kanji: '顔', meaning: 'Face' },
  { romaji: 'kusa', kana: 'くさ', kanji: '草', meaning: 'Grass' },
  { romaji: 'mushi', kana: 'むし', kanji: '虫', meaning: 'Insect' },
  { romaji: 'shima', kana: 'しま', kanji: '島', meaning: 'Island' },
];

const JP_MEDIUM: JapaneseWord[] = [
  { romaji: 'arigatou', kana: 'ありがとう', altAccepted: ['有難う', '有り難う'], meaning: 'Thank you' },
  { romaji: 'konnichiwa', kana: 'こんにちは', altAccepted: ['今日は'], meaning: 'Hello' },
  { romaji: 'ohayou', kana: 'おはよう', meaning: 'Good morning' },
  { romaji: 'sayounara', kana: 'さようなら', meaning: 'Goodbye' },
  { romaji: 'sumimasen', kana: 'すみません', altAccepted: ['済みません'], meaning: 'Excuse me' },
  { romaji: 'kudasai', kana: 'ください', altAccepted: ['下さい'], meaning: 'Please' },
  { romaji: 'onegai', kana: 'おねがい', kanji: 'お願い', meaning: 'Please (request)' },
  { romaji: 'oyasumi', kana: 'おやすみ', altAccepted: ['お休み'], meaning: 'Good night' },
  { romaji: 'sugoi', kana: 'すごい', altAccepted: ['凄い'], meaning: 'Amazing' },
  { romaji: 'kawaii', kana: 'かわいい', altAccepted: ['可愛い'], meaning: 'Cute' },
  { romaji: 'kirei', kana: 'きれい', altAccepted: ['綺麗'], meaning: 'Beautiful' },
  { romaji: 'oishii', kana: 'おいしい', altAccepted: ['美味しい'], meaning: 'Delicious' },
  { romaji: 'tanoshii', kana: 'たのしい', kanji: '楽しい', meaning: 'Fun' },
  { romaji: 'sensei', kana: 'せんせい', kanji: '先生', meaning: 'Teacher' },
  { romaji: 'tomodachi', kana: 'ともだち', kanji: '友達', altAccepted: ['友だち'], meaning: 'Friend' },
  { romaji: 'tabemono', kana: 'たべもの', kanji: '食べ物', meaning: 'Food' },
  { romaji: 'nomimono', kana: 'のみもの', kanji: '飲み物', meaning: 'Drink' },
  { romaji: 'gakkou', kana: 'がっこう', kanji: '学校', meaning: 'School' },
  { romaji: 'shigoto', kana: 'しごと', kanji: '仕事', meaning: 'Work' },
  { romaji: 'densha', kana: 'でんしゃ', kanji: '電車', meaning: 'Train' },
  { romaji: 'byouin', kana: 'びょういん', kanji: '病院', meaning: 'Hospital' },
  { romaji: 'toshokan', kana: 'としょかん', kanji: '図書館', meaning: 'Library' },
  { romaji: 'kouen', kana: 'こうえん', kanji: '公園', meaning: 'Park' },
  { romaji: 'heya', kana: 'へや', kanji: '部屋', meaning: 'Room' },
  { romaji: 'jikan', kana: 'じかん', kanji: '時間', meaning: 'Time' },
  { romaji: 'tenki', kana: 'てんき', kanji: '天気', meaning: 'Weather' },
  { romaji: 'kazoku', kana: 'かぞく', kanji: '家族', meaning: 'Family' },
  { romaji: 'ryouri', kana: 'りょうり', kanji: '料理', meaning: 'Cooking' },
  { romaji: 'ongaku', kana: 'おんがく', kanji: '音楽', meaning: 'Music' },
  { romaji: 'eiga', kana: 'えいが', kanji: '映画', meaning: 'Movie' },
  { romaji: 'kutsu', kana: 'くつ', kanji: '靴', meaning: 'Shoes' },
  { romaji: 'kaban', kana: 'かばん', kanji: '鞄', meaning: 'Bag' },
  { romaji: 'yasumi', kana: 'やすみ', kanji: '休み', meaning: 'Holiday' },
  { romaji: 'kotoba', kana: 'ことば', kanji: '言葉', meaning: 'Word' },
  { romaji: 'namae', kana: 'なまえ', kanji: '名前', meaning: 'Name' },
  { romaji: 'tegami', kana: 'てがみ', kanji: '手紙', meaning: 'Letter' },
  { romaji: 'tokei', kana: 'とけい', kanji: '時計', meaning: 'Clock' },
  { romaji: 'kaimono', kana: 'かいもの', kanji: '買い物', meaning: 'Shopping' },
  { romaji: 'shashin', kana: 'しゃしん', kanji: '写真', meaning: 'Photo' },
  { romaji: 'kusuri', kana: 'くすり', kanji: '薬', meaning: 'Medicine' },
];

const JP_HARD: JapaneseWord[] = [
  { romaji: 'hajimemashite', kana: 'はじめまして', altAccepted: ['初めまして'], meaning: 'Nice to meet you' },
  { romaji: 'itadakimasu', kana: 'いただきます', altAccepted: ['頂きます', '戴きます'], meaning: 'Bon appetit' },
  { romaji: 'gochisousama', kana: 'ごちそうさま', altAccepted: ['ご馳走様', 'ごちそうさまでした', 'ご馳走様でした'], meaning: 'Thanks for the meal' },
  { romaji: 'wakarimashita', kana: 'わかりました', altAccepted: ['分かりました', '解りました'], meaning: 'Understood' },
  { romaji: 'tsukaremashita', kana: 'つかれました', kanji: '疲れました', meaning: "I'm tired" },
  { romaji: 'daijoubu', kana: 'だいじょうぶ', kanji: '大丈夫', meaning: "It's okay" },
  { romaji: 'shitsureishimasu', kana: 'しつれいします', kanji: '失礼します', meaning: 'Excuse me (formal)' },
  { romaji: 'ittekimasu', kana: 'いってきます', altAccepted: ['行ってきます'], meaning: "I'm leaving" },
  { romaji: 'itterasshai', kana: 'いってらっしゃい', altAccepted: ['行ってらっしゃい'], meaning: 'Have a good trip' },
  { romaji: 'tadaima', kana: 'ただいま', altAccepted: ['只今'], meaning: "I'm home" },
  { romaji: 'okaerinasai', kana: 'おかえりなさい', altAccepted: ['お帰りなさい'], meaning: 'Welcome home' },
  { romaji: 'benkyoushimasu', kana: 'べんきょうします', kanji: '勉強します', meaning: 'To study' },
  { romaji: 'ganbarimashou', kana: 'がんばりましょう', altAccepted: ['頑張りましょう'], meaning: "Let's do our best" },
  { romaji: 'yoroshiku', kana: 'よろしく', altAccepted: ['宜しく'], meaning: 'Please take care' },
  { romaji: 'omedetou', kana: 'おめでとう', altAccepted: ['お目出度う'], meaning: 'Congratulations' },
  { romaji: 'keiken', kana: 'けいけん', kanji: '経験', meaning: 'Experience' },
  { romaji: 'seikatsu', kana: 'せいかつ', kanji: '生活', meaning: 'Daily life' },
  { romaji: 'mondai', kana: 'もんだい', kanji: '問題', meaning: 'Problem' },
  { romaji: 'kankyou', kana: 'かんきょう', kanji: '環境', meaning: 'Environment' },
  { romaji: 'shakai', kana: 'しゃかい', kanji: '社会', meaning: 'Society' },
  { romaji: 'bunka', kana: 'ぶんか', kanji: '文化', meaning: 'Culture' },
  { romaji: 'rekishi', kana: 'れきし', kanji: '歴史', meaning: 'History' },
  { romaji: 'shizen', kana: 'しぜん', kanji: '自然', meaning: 'Nature' },
  { romaji: 'koutsuu', kana: 'こうつう', kanji: '交通', meaning: 'Traffic' },
  { romaji: 'kyouiku', kana: 'きょういく', kanji: '教育', meaning: 'Education' },
  { romaji: 'undou', kana: 'うんどう', kanji: '運動', meaning: 'Exercise' },
  { romaji: 'kenkou', kana: 'けんこう', kanji: '健康', meaning: 'Health' },
  { romaji: 'yakusoku', kana: 'やくそく', kanji: '約束', meaning: 'Promise' },
  { romaji: 'junbi', kana: 'じゅんび', kanji: '準備', meaning: 'Preparation' },
  { romaji: 'soudan', kana: 'そうだん', kanji: '相談', meaning: 'Consultation' },
];

function getWordBank(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy': return ROMAJI_EASY;
    case 'medium': return ROMAJI_MEDIUM;
    case 'hard': return ROMAJI_HARD;
  }
}

function getJpWordBank(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy': return JP_EASY;
    case 'medium': return JP_MEDIUM;
    case 'hard': return JP_HARD;
  }
}

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', desc: '2-4 char words' },
  { id: 'medium', label: 'Medium', desc: 'Common phrases' },
  { id: 'hard', label: 'Hard', desc: 'Long expressions' },
];

const DURATION_OPTIONS = [30, 60, 90] as const;
type Duration = typeof DURATION_OPTIONS[number];

// ─── Main Page ─────────────────────────────────────────────

export function TypingPage() {
  const [mode, setMode] = useState<TypingMode>('romaji');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Typing Practice"
        subtitle="Build speed with Japanese input"
        jpTitle="タイピング"
        theme="sakura"
        action={
          <div className="flex rounded-xl overflow-hidden">
            {(['romaji', 'japanese', 'custom', 'history'] as TypingMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                  mode === m
                    ? 'bg-white text-sakura-600'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                )}
              >
                {m === 'romaji' ? 'Romaji Speed' : m === 'japanese' ? 'Japanese Input' : m === 'custom' ? 'Custom Lists' : 'History'}
              </button>
            ))}
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {mode === 'romaji' && (
          <motion.div key="romaji" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <RomajiTypingMode />
          </motion.div>
        )}
        {mode === 'japanese' && (
          <motion.div key="japanese" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <JapaneseTypingMode />
          </motion.div>
        )}
        {mode === 'custom' && (
          <motion.div key="custom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <CustomWordLists />
          </motion.div>
        )}
        {mode === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TypingHistory />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Romaji Speed Test — auto-advance, stop button, levels
// ════════════════════════════════════════════════════════════

function RomajiTypingMode() {
  const { user } = useUserStore();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [duration, setDuration] = useState<Duration>(60);
  const [isActive, setIsActive] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  // Per-keystroke accuracy tracking
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wordCorrectChars, setWordCorrectChars] = useState(0); // correct chars for WPM calc
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [learnedVocab, setLearnedVocab] = useState<JapaneseWord[]>([]);
  const [newVocab, setNewVocab] = useState<JapaneseWord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevInputRef = useRef('');

  // Load vocab pools on mount
  useEffect(() => {
    if (!user) return;
    Promise.all([getLearnedVocab(user.id), getNewVocab(user.id)]).then(
      ([learned, fresh]) => { setLearnedVocab(learned); setNewVocab(fresh); }
    );
  }, [user]);

  const generateWords = useCallback((learned: JapaneseWord[], fresh: JapaneseWord[]) => {
    const bank = getWordBank(difficulty);
    // Use smart list: mix learned vocab, new vocab, and static bank (~80 words for a timed test)
    const smart = buildSmartRomajiList(learned, fresh, bank, 80);
    // If smart list is too short, pad with shuffled bank
    if (smart.length < 40) {
      const extra = shuffle([...bank, ...bank, ...bank]);
      return dedupeConsecutive([...smart, ...extra]);
    }
    return smart;
  }, [difficulty]);

  const endTest = useCallback((elapsed?: number) => {
    setIsActive(false);
    setIsComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (user) {
      const dur = elapsed ?? elapsedSeconds;
      const finalWpm = dur > 0 ? Math.round((wordCorrectChars / 5) / (dur / 60)) : 0;
      const finalAcc = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
      saveTypingSession(user.id, 'romaji', finalWpm, finalAcc, dur);
    }
  }, [user, elapsedSeconds, wordCorrectChars, totalKeystrokes, correctKeystrokes]);

  const startTest = useCallback(async () => {
    // Refresh vocab pools each session for variety & new word discovery
    let currentLearned = learnedVocab;
    let currentNew = newVocab;
    if (user) {
      const [fresh, freshNew] = await Promise.all([
        getLearnedVocab(user.id),
        getNewVocab(user.id),
      ]);
      currentLearned = fresh;
      currentNew = freshNew;
      setLearnedVocab(fresh);
      setNewVocab(freshNew);
    }
    setWords(generateWords(currentLearned, currentNew));
    setCurrentWordIndex(0);
    setUserInput('');
    setCorrectCount(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setWordCorrectChars(0);
    setWordResults([]);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsActive(true);
    setIsComplete(false);
    setStreak(0);
    setBestStreak(0);
    setLastResult(null);
    prevInputRef.current = '';
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [generateWords, user, learnedVocab, newVocab]);

  // Timer
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
        if (elapsed >= duration) {
          endTest(elapsed);
        }
      }, 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, startTime, duration, endTest]);

  // Auto-advance: check on every keystroke, track per-character accuracy
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    const value = e.target.value;
    const prev = prevInputRef.current;
    const currentWord = words[currentWordIndex];

    // Detect new characters typed (not backspace)
    if (value.length > prev.length) {
      const newChars = value.length - prev.length;
      for (let i = 0; i < newChars; i++) {
        const charIdx = prev.length + i;
        const typedChar = value[charIdx];
        // Skip space at end (word submit)
        if (typedChar === ' ' && charIdx === value.length - 1) continue;
        const expectedChar = currentWord[charIdx];
        setTotalKeystrokes((t) => t + 1);
        if (typedChar === expectedChar) {
          setCorrectKeystrokes((c) => c + 1);
        }
      }
    }
    prevInputRef.current = value;

    // Check for exact match — auto-advance immediately
    if (value === currentWord) {
      setWordCorrectChars((prev) => prev + currentWord.length);
      setCorrectCount((prev) => prev + 1);
      setWordResults((prev) => [...prev, { expected: currentWord, typed: value, correct: true }]);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setLastResult('correct');
      setCurrentWordIndex((prev) => prev + 1);
      setUserInput('');
      prevInputRef.current = '';
      setTimeout(() => setLastResult(null), 300);
      return;
    }

    // Check for wrong word submitted via space
    if (value.endsWith(' ')) {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        // Count matching chars for WPM (partial credit)
        let matched = 0;
        for (let i = 0; i < Math.min(trimmed.length, currentWord.length); i++) {
          if (trimmed[i] === currentWord[i]) matched++;
        }
        setWordCorrectChars((prev) => prev + matched);
        setWordResults((prev) => [...prev, { expected: currentWord, typed: trimmed, correct: false }]);
        setStreak(0);
        setLastResult('wrong');
        setCurrentWordIndex((prev) => prev + 1);
        setUserInput('');
        prevInputRef.current = '';
        setTimeout(() => setLastResult(null), 400);
        return;
      }
    }

    setUserInput(value);
  };

  const wpm = elapsedSeconds > 0 ? Math.round((wordCorrectChars / 5) / (elapsedSeconds / 60)) : 0;
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const timeRemaining = duration - elapsedSeconds;
  const progressPct = (elapsedSeconds / duration) * 100;
  const currentWord = words[currentWordIndex] ?? '';

  // Character-by-character coloring
  const renderCurrentWord = () => {
    return currentWord.split('').map((char, i) => {
      let color = 'text-text-primary';
      if (i < userInput.length) {
        color = userInput[i] === char ? 'text-matcha-500' : 'text-sakura-500';
      }
      return (
        <span key={i} className={cn('transition-colors duration-75', color)}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Setup screen */}
      {!isActive && !isComplete && (
        <div className="bg-bg-secondary rounded-2xl border border-border p-8">
          <div className="text-center mb-8">
            <motion.span
              className="text-6xl block mb-4"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ⌨
            </motion.span>
            <h3 className="text-xl font-semibold text-text-primary mb-1">Romaji Speed Test</h3>
            <p className="text-sm text-text-secondary">Type Japanese words in romaji — words auto-advance when correct</p>
          </div>

          {/* Difficulty */}
          <div className="max-w-md mx-auto space-y-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Difficulty</p>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDifficulty(opt.id)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                      difficulty === opt.id
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                    )}
                  >
                    <span className="block">{opt.label}</span>
                    <span className="block text-[10px] opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Duration</p>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                      duration === d
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                    )}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={startTest}
              className="px-10 py-3 gradient-accent text-white rounded-xl font-semibold text-lg cursor-pointer shadow-sm"
            >
              Start Test
            </motion.button>
          </div>
        </div>
      )}

      {/* Active test */}
      {isActive && (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-3">
            <LiveStat label="WPM" value={wpm} color="text-accent" />
            <LiveStat label="Accuracy" value={`${accuracy}%`} color="text-matcha-500" />
            <LiveStat label="Streak" value={streak} color="text-gold-500" />
            <div className="flex-1" />
            <span className="text-2xl font-bold tabular-nums text-text-primary">{timeRemaining}s</span>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => endTest()}
              className="p-2 rounded-lg bg-sakura-500/10 text-sakura-500 hover:bg-sakura-500/20 cursor-pointer transition-colors"
              title="Stop test"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1.5" /></svg>
            </motion.button>
          </div>

          {/* Timer bar */}
          <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--color-accent), var(--color-sakura-500))' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>

          <div className={cn(
            'bg-bg-secondary rounded-2xl border p-8 transition-colors duration-150',
            lastResult === 'correct' ? 'border-matcha-500/50' : lastResult === 'wrong' ? 'border-sakura-500/50' : 'border-border'
          )}>
            {/* Word queue — upcoming words */}
            <div className="flex flex-wrap gap-2 mb-6 min-h-[36px] items-center justify-center">
              {words.slice(currentWordIndex + 1, currentWordIndex + 8).map((word, i) => (
                <motion.span
                  key={`${currentWordIndex + 1 + i}-${word}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1 - i * 0.12, x: 0 }}
                  className="text-base font-mono px-2 py-0.5 rounded text-text-tertiary"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Current word — large, character-colored */}
            <div className="text-center mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl font-mono font-bold tracking-wider"
                >
                  {renderCurrentWord()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInput}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="w-full text-center text-2xl py-3 px-6 rounded-xl border-2 border-border focus:border-accent outline-none bg-bg-primary text-text-primary font-mono transition-colors"
              placeholder="Type..."
            />

            {/* Streak indicator */}
            <AnimatePresence>
              {streak >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-3"
                >
                  <span className="text-sm font-semibold text-gold-500">
                    <StreakBadge streak={streak} />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Results */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="bg-bg-secondary rounded-2xl border border-border p-8"
        >
          <div className="text-center mb-8">
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
              className="text-5xl block mb-3"
            >
              <ResultIcon accuracy={wpm >= 40 ? 95 : wpm >= 25 ? 80 : 50} />
            </motion.span>
            <h3 className="text-2xl font-bold text-gradient-accent mb-1">Test Complete!</h3>
            <p className="text-sm text-text-tertiary">{wpm >= 40 ? 'Lightning fast!' : wpm >= 25 ? 'Great speed!' : 'Keep practicing!'}</p>
          </div>

          <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
            <ResultStat value={wpm} label="WPM" gradient="gradient-accent" />
            <ResultStat value={`${accuracy}%`} label="Accuracy" gradient="gradient-matcha" />
            <ResultStat value={correctCount} label="Words" gradient="gradient-gold" />
            <ResultStat value={bestStreak} label="Best Streak" gradient="gradient-sakura" />
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={startTest}
              className="px-6 py-2.5 gradient-accent text-white rounded-xl font-medium cursor-pointer shadow-sm"
            >
              Try Again
            </motion.button>
            <button
              onClick={() => { setIsComplete(false); }}
              className="px-6 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
            >
              Change Settings
            </button>
          </div>
        </motion.div>
      )}

      {/* Word-by-word review (shown after results) */}
      {isComplete && wordResults.length > 0 && (
        <WordReview results={wordResults} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Japanese Input Mode — auto-advance, stop, levels
// ════════════════════════════════════════════════════════════

function JapaneseTypingMode() {
  const { user } = useUserStore();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showRomaji, setShowRomaji] = useState(true);
  const [showExpected, setShowExpected] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [words, setWords] = useState<JapaneseWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [learnedVocab, setLearnedVocab] = useState<JapaneseWord[]>([]);
  const [newVocab, setNewVocab] = useState<JapaneseWord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load vocab pools on mount
  useEffect(() => {
    if (!user) return;
    Promise.all([getLearnedVocab(user.id), getNewVocab(user.id)]).then(
      ([learned, fresh]) => { setLearnedVocab(learned); setNewVocab(fresh); }
    );
  }, [user]);

  const focusInput = useCallback(() => {
    setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }, 50);
  }, []);

  const wordCount = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;

  const startPractice = useCallback(async () => {
    // Refresh vocab pools each session for variety & new word discovery
    let currentLearned = learnedVocab;
    let currentNew = newVocab;
    if (user) {
      const [fresh, freshNew] = await Promise.all([
        getLearnedVocab(user.id),
        getNewVocab(user.id),
      ]);
      currentLearned = fresh;
      currentNew = freshNew;
      setLearnedVocab(fresh);
      setNewVocab(freshNew);
    }
    const bank = getJpWordBank(difficulty);
    const smart = buildSmartWordList(currentLearned, currentNew, bank, wordCount);
    setWords(smart);
    setCurrentIndex(0);
    setUserInput('');
    setCorrectCount(0);
    setTotalCount(0);
    setWordResults([]);
    setLastResult(null);
    setIsActive(true);
    setIsComplete(false);
    setStreak(0);
    setBestStreak(0);
    focusInput();
  }, [difficulty, wordCount, focusInput, user, learnedVocab, newVocab]);

  const finishSession = useCallback((correct: number, total: number) => {
    setIsComplete(true);
    setIsActive(false);
    if (user) {
      const acc = total > 0 ? Math.round((correct / total) * 100) : 100;
      saveTypingSession(user.id, 'japanese', 0, acc, 0);
    }
  }, [user]);

  const advanceToNext = useCallback((isCorrect: boolean) => {
    const current = words[currentIndex];
    if (current) {
      setWordResults((prev) => [...prev, {
        expected: current.kanji ?? current.kana,
        typed: userInput,
        correct: isCorrect,
        kana: current.kana,
        kanji: current.kanji,
        meaning: current.meaning,
      }]);
      // Persist mastery for words that come from the vocabulary table
      if (user && current.vocabId) {
        recordVocabQuizAnswer(user.id, current.vocabId, isCorrect);
      }
    }

    const newCorrect = correctCount + (isCorrect ? 1 : 0);
    const newTotal = totalCount + 1;
    setCorrectCount(newCorrect);
    setTotalCount(newTotal);

    if (isCorrect) {
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    // Correct → auto-advance after brief delay
    // Incorrect → PAUSE so the student can study the correction
    if (isCorrect) {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= words.length) {
        advanceTimeoutRef.current = setTimeout(() => {
          finishSession(newCorrect, newTotal);
        }, 500);
      } else {
        advanceTimeoutRef.current = setTimeout(() => {
          setCurrentIndex(nextIdx);
          setUserInput('');
          setLastResult(null);
          focusInput();
        }, 500);
      }
    }
    // When incorrect: lastResult stays 'incorrect', correction UI shown,
    // student must press Enter or click Continue to proceed.
  }, [correctCount, totalCount, currentIndex, words, userInput, finishSession, focusInput]);

  /** Student has reviewed the correction — move on. */
  const handleContinue = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= words.length) {
      finishSession(correctCount, totalCount);
    } else {
      setCurrentIndex(nextIdx);
      setUserInput('');
      setLastResult(null);
      focusInput();
    }
  }, [currentIndex, words.length, correctCount, totalCount, finishSession, focusInput]);

  // Auto-check: when input matches any accepted form (and not composing), auto-advance
  useEffect(() => {
    if (!isActive || isComposing || lastResult) return;
    const current = words[currentIndex];
    if (!current) return;

    if (matchesWord(userInput, current)) {
      setLastResult('correct');
      advanceToNext(true);
    }
  }, [userInput, isActive, isComposing, lastResult, words, currentIndex, advanceToNext]);

  // When the correction panel appears, focus the Continue button after a
  // short delay so the original Enter keypress from submitting has fully
  // propagated before the button can receive keyboard input.
  useEffect(() => {
    if (lastResult !== 'incorrect') return;
    const t = setTimeout(() => continueRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [lastResult]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => { if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current); };
  }, []);

  const handleStop = () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    finishSession(correctCount, totalCount);
  };

  const handleSubmit = () => {
    if (!isActive || isComposing || lastResult) return;
    const current = words[currentIndex];
    if (!current) return;
    const isCorrect = matchesWord(userInput, current);
    setLastResult(isCorrect ? 'correct' : 'incorrect');
    advanceToNext(isCorrect);
  };

  const currentWord = words[currentIndex];
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* IME Help */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--color-feedback-info-bg)] border border-[var(--color-feedback-info-border)] rounded-xl p-4 overflow-hidden"
          >
            <h4 className="text-sm font-semibold text-[var(--color-feedback-info-text)] mb-2">
              How to enable Japanese keyboard on macOS
            </h4>
            <ol className="text-sm text-[var(--color-feedback-info-text)] space-y-1 list-decimal list-inside">
              <li>Open System Settings → Keyboard → Input Sources</li>
              <li>Click "Edit..." → Add → Japanese → Romaji</li>
              <li>Use Globe key (fn) or Control+Space to switch input methods</li>
              <li>Type romaji and it will convert to Japanese characters</li>
            </ol>
            <button onClick={() => setShowHelp(false)} className="mt-3 text-xs text-[var(--color-feedback-info-text)] opacity-70 hover:opacity-100 cursor-pointer">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-bg-secondary rounded-2xl border border-border p-8">
        {/* Setup */}
        {!isActive && !isComplete && (
          <div className="text-center">
            <motion.span
              className="text-6xl block mb-4 character-display"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              日
            </motion.span>
            <h3 className="text-xl font-semibold text-text-primary mb-1">Japanese Input Practice</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Type the Japanese characters using your IME. Words auto-advance when correct.
            </p>

            {/* Difficulty */}
            <div className="max-w-sm mx-auto mb-4">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Difficulty</p>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDifficulty(opt.id)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                      difficulty === opt.id
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hint mode */}
            <div className="max-w-sm mx-auto mb-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Prompt Style</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRomaji(true)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                    showRomaji
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                  )}
                >
                  <span className="block">Romaji</span>
                  <span className="block text-[10px] opacity-60">Show reading</span>
                </button>
                <button
                  onClick={() => setShowRomaji(false)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                    !showRomaji
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                  )}
                >
                  <span className="block">Meaning Only</span>
                  <span className="block text-[10px] opacity-60">No romaji hint</span>
                </button>
              </div>
            </div>

            {/* Show/hide expected answer */}
            <div className="max-w-sm mx-auto mb-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Expected Answer</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExpected(true)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                    showExpected
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                  )}
                >
                  <span className="block">Show Answer</span>
                  <span className="block text-[10px] opacity-60">See the Japanese text</span>
                </button>
                <button
                  onClick={() => setShowExpected(false)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all',
                    !showExpected
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-primary border border-border text-text-secondary hover:border-accent/50'
                  )}
                >
                  <span className="block">Hide Answer</span>
                  <span className="block text-[10px] opacity-60">Type from memory</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={startPractice}
                className="px-8 py-3 gradient-accent text-white rounded-xl font-semibold text-lg cursor-pointer shadow-sm"
              >
                Start Practice
              </motion.button>
              <button onClick={() => setShowHelp(true)} className="px-4 py-3 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary cursor-pointer">
                Setup Help
              </button>
            </div>
          </div>
        )}

        {/* Active practice */}
        {isActive && currentWord && (
          <div>
            {/* Top bar: progress + stop */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 bg-bg-subtle rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--color-accent), var(--color-sakura-500))' }}
                  animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-text-secondary tabular-nums">{currentIndex + 1}/{words.length}</span>
              {streak >= 3 && (
                <span className="text-xs font-semibold text-gold-500">
                  {streak >= 10 ? <><Flame size={12} className="text-sakura-500 inline" /><Flame size={12} className="text-gold-500 inline" /></> : streak >= 5 ? <Flame size={12} className="text-gold-500 inline" /> : <Sparkles size={12} className="text-gold-500 inline" />}{streak}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleStop}
                className="p-1.5 rounded-lg bg-sakura-500/10 text-sakura-500 hover:bg-sakura-500/20 cursor-pointer transition-colors"
                title="Stop practice"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1.5" /></svg>
              </motion.button>
            </div>

            {/* Prompt */}
            <div className="text-center mb-6">
              <p className="text-xs text-text-tertiary mb-2">Type in Japanese:</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {showRomaji ? (
                    <>
                      <p className="text-3xl font-bold font-mono text-accent">{currentWord.romaji}</p>
                      <p className="text-xs text-text-tertiary mt-1">{currentWord.meaning}</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-text-primary">{currentWord.meaning}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Expected answer — conditionally shown based on user toggle */}
            {showExpected ? (
              <div className="text-center mb-4">
                <span className="text-sm text-text-tertiary">Expected: </span>
                <span className="text-lg character-display text-text-secondary jp-text">
                  {currentWord.kanji ?? currentWord.kana}
                </span>
                {currentWord.kanji && (
                  <span className="text-xs text-text-tertiary ml-1.5">({currentWord.kana})</span>
                )}
              </div>
            ) : (
              <div className="text-center mb-4">
                <span className="text-xs text-text-tertiary italic">Answer hidden — type from memory</span>
              </div>
            )}

            {/* Input */}
            <div className="max-w-sm mx-auto">
              <motion.div
                animate={lastResult === 'incorrect' ? { x: [0, -10, 10, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(e) => {
                    setIsComposing(false);
                    setUserInput((e.target as HTMLInputElement).value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isComposing && !lastResult) {
                      handleSubmit();
                    }
                  }}
                  disabled={!!lastResult}
                  className={cn(
                    'w-full text-center text-3xl py-4 px-6 rounded-xl border-2 outline-none transition-all duration-150 jp-text character-display',
                    lastResult === 'correct' && 'border-matcha-500 bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-text)]',
                    lastResult === 'incorrect' && 'border-sakura-500 bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-text)]',
                    !lastResult && 'border-border focus:border-accent bg-bg-primary text-text-primary'
                  )}
                  placeholder="日本語で入力..."
                  lang="ja"
                  inputMode="text"
                />
              </motion.div>

              {/* Correct — brief toast */}
              <AnimatePresence>
                {lastResult === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 py-2 px-4 rounded-lg text-center text-sm font-medium bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-text)]"
                  >
                    Correct!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Incorrect — detailed correction panel (student must acknowledge) */}
              <AnimatePresence>
                {lastResult === 'incorrect' && currentWord && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 rounded-xl border border-sakura-500/30 bg-[var(--color-feedback-error-bg)] p-5"
                  >
                    {/* Your answer vs correct */}
                    <div className="flex items-start gap-6 mb-4">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-feedback-error-text)]/60 mb-1">Your answer</p>
                        <p className="text-xl font-semibold text-sakura-500 jp-text character-display line-through decoration-sakura-500/40">
                          {userInput || '\u2014'}
                        </p>
                      </div>
                      <div className="w-px h-12 bg-sakura-500/20" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-feedback-error-text)]/60 mb-1">Correct answer</p>
                        {currentWord.kanji ? (
                          <div>
                            <p className="text-xl font-bold text-text-primary jp-text character-display">{currentWord.kanji}</p>
                            <p className="text-sm text-text-secondary jp-text mt-0.5">{currentWord.kana}</p>
                          </div>
                        ) : (
                          <p className="text-xl font-bold text-text-primary jp-text character-display">{currentWord.kana}</p>
                        )}
                      </div>
                    </div>

                    {/* Meaning + romaji */}
                    <div className="flex items-center gap-3 text-xs text-text-tertiary mb-4">
                      <span className="font-mono">{currentWord.romaji}</span>
                      <span className="w-1 h-1 rounded-full bg-text-tertiary/30" />
                      <span>{currentWord.meaning}</span>
                    </div>

                    {/* Continue button */}
                    <motion.button
                      ref={continueRef}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleContinue}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleContinue(); } }}
                      className="w-full py-2.5 rounded-xl bg-accent text-white font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      Continue <span className="text-white/50 text-xs ml-1">Enter</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button (only when no result is showing) */}
            {!lastResult && (
              <div className="text-center mt-5">
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim() || isComposing}
                  className="px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer hover:opacity-90"
                >
                  Check <span className="text-white/50 text-xs ml-1">Enter</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Complete */}
        {isComplete && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="text-center py-4">
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
              className="text-5xl block mb-3"
            >
              <Flag size={40} className="text-sakura-500" />
            </motion.span>
            <h3 className="text-2xl font-bold text-gradient-accent mb-1">Practice Complete!</h3>
            <p className="text-sm text-text-tertiary mb-6">{accuracy >= 80 ? 'Great job!' : 'Keep it up!'}</p>
            <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
              <ResultStat value={correctCount} label="Correct" gradient="gradient-matcha" />
              <ResultStat value={totalCount - correctCount} label="Missed" gradient="gradient-sakura" />
              <ResultStat value={`${accuracy}%`} label="Accuracy" gradient="gradient-accent" />
              <ResultStat value={bestStreak} label="Best Streak" gradient="gradient-gold" />
            </div>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={startPractice}
                className="px-6 py-2.5 gradient-accent text-white rounded-xl font-medium cursor-pointer shadow-sm"
              >
                Try Again
              </motion.button>
              <button
                onClick={() => setIsComplete(false)}
                className="px-6 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
              >
                Change Settings
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Word-by-word review (shown after results) */}
      {isComplete && wordResults.length > 0 && (
        <WordReview results={wordResults} />
      )}
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────

function LiveStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border px-4 py-2 text-center min-w-[80px]">
      <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums', color)}>{value}</p>
    </div>
  );
}

function ResultStat({ value, label, gradient }: { value: string | number; label: string; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn('rounded-xl p-3 border border-border/50', gradient)}
    >
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/60 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-4 text-center">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ─── End-of-session word review ─────────────────────────────

function WordReview({ results }: { results: WordResult[] }) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'missed'>('all');

  if (results.length === 0) return null;

  const filtered = filter === 'all'
    ? results
    : results.filter((r) => (filter === 'correct' ? r.correct : !r.correct));

  const missedCount = results.filter((r) => !r.correct).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-bg-secondary rounded-2xl border border-border overflow-hidden"
    >
      {/* Header + filter tabs */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
        <h4 className="text-sm font-semibold text-text-primary">Word Review</h4>
        <div className="flex-1" />
        {(['all', 'correct', 'missed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors',
              filter === f
                ? 'bg-accent/15 text-accent font-medium'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {f === 'all' ? `All (${results.length})` : f === 'correct' ? `Correct (${results.length - missedCount})` : `Missed (${missedCount})`}
          </button>
        ))}
      </div>

      {/* Word list */}
      <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
        {filtered.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.02 * i }}
            className="px-5 py-2.5 flex items-center gap-3"
          >
            {/* Status indicator */}
            <span className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
              r.correct
                ? 'bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-text)]'
                : 'bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-text)]'
            )}>
              {r.correct ? '\u2713' : '\u2717'}
            </span>

            {/* Word info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                {r.kanji ? (
                  <>
                    <span className="text-sm font-semibold text-text-primary jp-text character-display">{r.kanji}</span>
                    <span className="text-xs text-text-tertiary jp-text">{r.kana}</span>
                  </>
                ) : r.kana ? (
                  <span className="text-sm font-semibold text-text-primary jp-text character-display">{r.kana}</span>
                ) : (
                  <span className="text-sm font-semibold text-text-primary font-mono">{r.expected}</span>
                )}
                {r.meaning && (
                  <span className="text-xs text-text-secondary truncate">{r.meaning}</span>
                )}
              </div>
            </div>

            {/* What the student typed (if wrong) */}
            {!r.correct && r.typed && (
              <span className="text-xs text-sakura-500 font-mono shrink-0 max-w-[120px] truncate" title={r.typed}>
                {r.typed}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-5 py-6 text-center text-sm text-text-tertiary">
          {filter === 'missed' ? 'No missed words — perfect session!' : 'No words to show.'}
        </div>
      )}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// Custom Word Lists (unchanged)
// ════════════════════════════════════════════════════════════

function CustomWordLists() {
  const { user } = useUserStore();
  const [lists, setLists] = useState<CustomWordList[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWords, setNewWords] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getWordLists(user.id).then((data) => { setLists(data); setIsLoading(false); });
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newName.trim() || !newWords.trim()) return;
    const words = parseWordListText(newWords);
    if (words.length === 0) return;
    await createWordList(user.id, newName.trim(), words);
    const updated = await getWordLists(user.id);
    setLists(updated);
    setNewName('');
    setNewWords('');
    setShowCreate(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this word list?')) return;
    await deleteWordList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  if (isLoading) return <div className="text-center py-12 text-text-secondary">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">Create custom word lists for typing practice</p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white cursor-pointer"
        >
          {showCreate ? 'Cancel' : 'New List'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-bg-secondary rounded-xl border border-border p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="List name..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm outline-none focus:border-accent"
          />
          <textarea
            value={newWords}
            onChange={(e) => setNewWords(e.target.value)}
            placeholder={'One word per line:\njapanese|romaji|meaning\n\nExample:\n猫|neko|cat\n犬|inu|dog'}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm outline-none focus:border-accent font-mono resize-none"
          />
          <button onClick={handleCreate} disabled={!newName.trim() || !newWords.trim()} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-30">
            Create List
          </button>
        </div>
      )}

      {lists.length === 0 && !showCreate && (
        <div className="bg-bg-secondary rounded-xl border border-border p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3"><PenLine size={28} className="text-accent" /></div>
          <p className="text-text-secondary text-sm">No custom word lists yet. Create one to practice specific vocabulary.</p>
        </div>
      )}

      {lists.map((list) => (
        <div key={list.id} className="bg-bg-secondary rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-text-primary">{list.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-secondary">{list.words.length} words</span>
              <button onClick={() => handleDelete(list.id)} className="text-[10px] text-sakura-500 cursor-pointer hover:underline">Delete</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {list.words.slice(0, 10).map((w, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded bg-bg-primary border border-border text-text-secondary jp-text">
                {w.japanese}
              </span>
            ))}
            {list.words.length > 10 && (
              <span className="text-xs px-2 py-0.5 text-text-secondary/50">+{list.words.length - 10} more</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Typing Session History (unchanged)
// ════════════════════════════════════════════════════════════

function TypingHistory() {
  const { user } = useUserStore();
  const [sessions, setSessions] = useState<TypingSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getTypingSessions(user.id, 30).then((data) => {
      setSessions(data);
      setIsLoading(false);
    });
  }, [user]);

  if (isLoading) {
    return <div className="text-center py-12 text-text-secondary">Loading history...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4"><BarChart3 size={32} className="text-accent" /></div>
        <p className="text-text-secondary">No typing sessions yet. Complete a test to see your history here.</p>
      </div>
    );
  }

  const avgWpm = Math.round(sessions.filter((s) => s.wpm > 0).reduce((sum, s) => sum + s.wpm, 0) / Math.max(1, sessions.filter((s) => s.wpm > 0).length));
  const avgAcc = Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length);
  const bestWpm = Math.max(...sessions.map((s) => s.wpm));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Avg WPM" value={avgWpm || '—'} color="text-accent" />
        <StatBox label="Best WPM" value={bestWpm || '—'} color="text-matcha-500" />
        <StatBox label="Avg Accuracy" value={`${avgAcc}%`} color="text-gold-500" />
      </div>

      <div className="bg-bg-secondary rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Recent Sessions</h3>
        </div>
        <div className="divide-y divide-border">
          {sessions.map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-4">
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium min-w-[70px] text-center">
                {s.mode === 'romaji' ? 'Romaji' : 'Japanese'}
              </span>
              {s.wpm > 0 && (
                <span className="text-sm font-bold text-text-primary">{s.wpm} WPM</span>
              )}
              <span className="text-sm text-text-secondary">{s.accuracy}% acc</span>
              {s.durationSeconds > 0 && (
                <span className="text-xs text-text-secondary">{s.durationSeconds}s</span>
              )}
              <span className="text-xs text-text-secondary/50 ml-auto">
                {new Date(s.completedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
