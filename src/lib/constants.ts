import type { NavItem, JlptLevel, AchievementDefinition } from './types';

// -- Navigation Items --
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Overview and daily progress',
  },
  {
    id: 'hiragana',
    label: 'Hiragana',
    icon: 'あ',
    description: 'Learn hiragana characters',
  },
  {
    id: 'katakana',
    label: 'Katakana',
    icon: 'ア',
    description: 'Learn katakana characters',
  },
  {
    id: 'kanji',
    label: 'Kanji',
    icon: '漢',
    description: 'Study kanji characters',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    icon: '語',
    description: 'Build your word bank',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    icon: '文',
    description: 'Learn grammar patterns',
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: '💬',
    description: 'Real-world sentence exercises',
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: '📖',
    description: 'Mini stories and comprehension',
  },
  {
    id: 'typing',
    label: 'Typing',
    icon: '⌨',
    description: 'Japanese typing practice',
  },
  {
    id: 'review',
    label: 'Review',
    icon: '🔄',
    description: 'SRS review session',
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: '📈',
    description: 'Detailed statistics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙',
    description: 'App preferences',
  },
];

// -- JLPT Level Config --
export const JLPT_LEVELS: Record<JlptLevel, {
  name: string;
  kanjiCount: number;
  vocabCount: number;
  grammarCount: number;
  description: string;
  color: string;
}> = {
  N5: {
    name: 'N5 - Beginner',
    kanjiCount: 100,
    vocabCount: 800,
    grammarCount: 80,
    description: 'Basic Japanese: greetings, numbers, simple sentences',
    color: '#22c55e',
  },
  N4: {
    name: 'N4 - Elementary',
    kanjiCount: 300,
    vocabCount: 1500,
    grammarCount: 200,
    description: 'Daily life Japanese: conversations, basic reading',
    color: '#3b82f6',
  },
  N3: {
    name: 'N3 - Intermediate',
    kanjiCount: 650,
    vocabCount: 3750,
    grammarCount: 350,
    description: 'Intermediate: newspaper articles, general topics',
    color: '#a855f7',
  },
  N2: {
    name: 'N2 - Upper Intermediate',
    kanjiCount: 1000,
    vocabCount: 6000,
    grammarCount: 250,
    description: 'Advanced: complex texts, nuanced expression',
    color: '#f59e0b',
  },
  N1: {
    name: 'N1 - Advanced',
    kanjiCount: 2136,
    vocabCount: 10000,
    grammarCount: 200,
    description: 'Near-native: abstract texts, academic Japanese',
    color: '#ef4444',
  },
};

// -- SRS Constants --
export const SRS_RATING_LABELS = {
  1: { label: 'Again', shortcut: '1', color: '#ef4444', description: 'Completely forgot' },
  2: { label: 'Hard', shortcut: '2', color: '#f59e0b', description: 'Recalled with difficulty' },
  3: { label: 'Good', shortcut: '3', color: '#22c55e', description: 'Recalled correctly' },
  4: { label: 'Easy', shortcut: '4', color: '#3b82f6', description: 'Recalled effortlessly' },
} as const;

// -- Kana Row Groups --
export const HIRAGANA_ROWS = [
  { group: 'vowels', label: 'Vowels', chars: ['あ', 'い', 'う', 'え', 'お'] },
  { group: 'k-row', label: 'K Row', chars: ['か', 'き', 'く', 'け', 'こ'] },
  { group: 's-row', label: 'S Row', chars: ['さ', 'し', 'す', 'せ', 'そ'] },
  { group: 't-row', label: 'T Row', chars: ['た', 'ち', 'つ', 'て', 'と'] },
  { group: 'n-row', label: 'N Row', chars: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { group: 'h-row', label: 'H Row', chars: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { group: 'm-row', label: 'M Row', chars: ['ま', 'み', 'む', 'め', 'も'] },
  { group: 'y-row', label: 'Y Row', chars: ['や', 'ゆ', 'よ'] },
  { group: 'r-row', label: 'R Row', chars: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { group: 'w-row', label: 'W Row', chars: ['わ', 'を'] },
  { group: 'n', label: 'N', chars: ['ん'] },
];

export const KATAKANA_ROWS = [
  { group: 'vowels', label: 'Vowels', chars: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { group: 'k-row', label: 'K Row', chars: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { group: 's-row', label: 'S Row', chars: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { group: 't-row', label: 'T Row', chars: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { group: 'n-row', label: 'N Row', chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { group: 'h-row', label: 'H Row', chars: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { group: 'm-row', label: 'M Row', chars: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { group: 'y-row', label: 'Y Row', chars: ['ヤ', 'ユ', 'ヨ'] },
  { group: 'r-row', label: 'R Row', chars: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { group: 'w-row', label: 'W Row', chars: ['ワ', 'ヲ'] },
  { group: 'n', label: 'N', chars: ['ン'] },
];

// -- Default Settings --
export const DEFAULT_SETTINGS = {
  dailyReviewLimit: 100,
  newCardsPerDay: 20,
  showFurigana: true,
  fontSize: 'medium' as const,
  theme: 'system' as const,
  colorTheme: 'twilight' as const,
  colorMode: 'system' as const,
  sourceLanguage: 'en',
  soundEnabled: true,
  animationsEnabled: true,
  ttsProvider: 'browser' as const,
  openaiApiKey: '',
  openaiTtsVoice: 'nova' as const,
  voicevoxBaseUrl: 'http://localhost:50021',
  voicevoxSpeakerId: 3, // ずんだもん (ノーマル) — clear, neutral JP voice
};

// -- OpenAI TTS Voice Options --
export const OPENAI_TTS_VOICES = [
  { id: 'alloy' as const, label: 'Alloy', description: 'Neutral, balanced' },
  { id: 'ash' as const, label: 'Ash', description: 'Clear, direct' },
  { id: 'ballad' as const, label: 'Ballad', description: 'Warm, expressive' },
  { id: 'coral' as const, label: 'Coral', description: 'Warm, engaging' },
  { id: 'echo' as const, label: 'Echo', description: 'Smooth, mellow' },
  { id: 'fable' as const, label: 'Fable', description: 'Animated, storytelling' },
  { id: 'nova' as const, label: 'Nova', description: 'Friendly, natural' },
  { id: 'onyx' as const, label: 'Onyx', description: 'Deep, authoritative' },
  { id: 'sage' as const, label: 'Sage', description: 'Calm, measured' },
  { id: 'shimmer' as const, label: 'Shimmer', description: 'Bright, optimistic' },
  { id: 'verse' as const, label: 'Verse', description: 'Versatile, dynamic' },
] as const;

// -- Achievement Definitions --
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: 'first_review',
    name: 'First Steps',
    description: 'Complete your first review',
    icon: '🎯',
    condition: (stats) => stats.totalReviews >= 1,
  },
  {
    key: 'hiragana_master',
    name: 'Hiragana Master',
    description: 'Learn all 46 basic hiragana',
    icon: 'あ',
    condition: (stats) => stats.kanaProgress.learned >= 46,
  },
  {
    key: 'katakana_master',
    name: 'Katakana Master',
    description: 'Learn all 46 basic katakana',
    icon: 'ア',
    condition: (stats) => stats.kanaProgress.learned >= 92,
  },
  {
    key: 'kanji_50',
    name: 'Kanji Explorer',
    description: 'Learn 50 kanji',
    icon: '漢',
    condition: (stats) => stats.kanjiProgress.learned >= 50,
  },
  {
    key: 'kanji_100',
    name: 'Kanji Enthusiast',
    description: 'Learn 100 kanji (N5 complete)',
    icon: '🏯',
    condition: (stats) => stats.kanjiProgress.learned >= 100,
  },
  {
    key: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    key: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day study streak',
    icon: '🌟',
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    key: 'streak_100',
    name: 'Century Scholar',
    description: 'Maintain a 100-day study streak',
    icon: '👑',
    condition: (stats) => stats.currentStreak >= 100,
  },
  {
    key: 'vocab_500',
    name: 'Wordsmith',
    description: 'Learn 500 vocabulary words',
    icon: '📚',
    condition: (stats) => stats.vocabProgress.learned >= 500,
  },
  {
    key: 'accuracy_90',
    name: 'Precision',
    description: 'Achieve 90% overall accuracy',
    icon: '🎯',
    condition: (stats) => stats.averageAccuracy >= 90,
  },
  {
    key: 'reviews_1000',
    name: 'Dedicated Learner',
    description: 'Complete 1,000 reviews',
    icon: '💪',
    condition: (stats) => stats.totalReviews >= 1000,
  },
];

// -- XP Rewards --
export const XP_REWARDS = {
  review_correct: 10,
  review_easy: 15,
  new_card_learned: 25,
  streak_bonus_per_day: 5,
  achievement_earned: 100,
  lesson_completed: 50,
  quiz_correct: 5,
} as const;
