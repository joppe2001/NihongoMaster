// ============================================================
// Core Types for NihongoMaster
// ============================================================

// -- JLPT Levels --
export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type JlptLevelId = 5 | 4 | 3 | 2 | 1;

// -- Writing System Types --
export type KanaType = 'hiragana' | 'katakana';

export interface Kana {
  id: number;
  character: string;
  type: KanaType;
  romaji: string;
  rowGroup: string;
  strokeCount: number;
  strokeOrderSvg: string | null;
  audioFile: string | null;
  sortOrder: number;
}

// -- Kanji --
export interface Kanji {
  id: number;
  character: string;
  strokeCount: number;
  strokeOrderSvg: string | null;
  jlptLevel: JlptLevelId;
  grade: number;
  frequencyRank: number;
  radical: string;
  radicalNames: string[];
  onReadings: string[];
  kunReadings: string[];
  meanings: Record<string, string[]>; // keyed by language code
  mnemonic: string | null;
  similarKanji: string[];
}

// -- Vocabulary --
export interface Vocabulary {
  id: number;
  word: string;
  reading: string;
  jlptLevel: JlptLevelId;
  partOfSpeech: string;
  meanings: Record<string, string[]>; // keyed by language code
  exampleSentences: ExampleSentence[];
  audioFile: string | null;
  tags: string[];
  frequencyRank: number;
}

export interface ExampleSentence {
  japanese: string;
  reading: string;
  translations: Record<string, string>; // keyed by language code
}

// -- Grammar --
export interface GrammarPoint {
  id: number;
  pattern: string;
  jlptLevel: JlptLevelId;
  meaning: Record<string, string>; // keyed by language code
  formation: string;
  examples: GrammarExample[];
  notes: string | null;
  relatedGrammar: number[];
}

export interface GrammarExample {
  japanese: string;
  reading: string;
  translations: Record<string, string>;
}

// -- SRS (Spaced Repetition System) --
export type CardState = 'new' | 'learning' | 'review' | 'relearning';
export type ContentType = 'kana' | 'kanji' | 'vocab' | 'grammar';
export type ReviewRating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface SrsCard {
  id: number;
  userId: number;
  contentType: ContentType;
  contentId: number;
  state: CardState;
  dueDate: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview: string | null;
  createdAt: string;
}

export interface ReviewResult {
  new_state: string;
  new_stability: number;
  new_difficulty: number;
  scheduled_days: number;
  due_date: string;
}

export interface ReviewHistory {
  id: number;
  cardId: number;
  rating: ReviewRating;
  reviewTime: string;
  elapsedMs: number;
  stateBefore: CardState;
  stateAfter: CardState;
}

// -- User --
export interface User {
  id: number;
  name: string;
  sourceLanguage: string;
  currentLevel: JlptLevelId;
  dailyGoalMinutes: number;
  newCardsPerDay: number;
  xp: number;
  streakDays: number;
  lastStudyDate: string | null;
  createdAt: string;
}

export interface UserProgress {
  id: number;
  userId: number;
  date: string;
  cardsReviewed: number;
  cardsLearned: number;
  timeSpentSeconds: number;
  accuracyPercent: number;
  xpEarned: number;
}

// -- Achievements --
export interface Achievement {
  id: number;
  userId: number;
  achievementKey: string;
  earnedAt: string;
}

export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  condition: (progress: UserStats) => boolean;
}

// -- TTS Provider --
export type TtsProvider = 'browser' | 'openai' | 'voicevox';
export type OpenAiTtsVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer' | 'verse';

// -- Settings --
export interface AppSettings {
  dailyReviewLimit: number;
  newCardsPerDay: number;
  showFurigana: boolean;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'system' | 'light' | 'dark' | 'sakura' | 'matcha' | 'fuji' | 'momiji' | 'sora';
  colorTheme: 'twilight' | 'sakura' | 'matcha' | 'fuji' | 'momiji' | 'sora';
  colorMode: 'light' | 'dark' | 'system';
  sourceLanguage: string;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  ttsProvider: TtsProvider;
  openaiApiKey: string;
  openaiTtsVoice: OpenAiTtsVoice;
  voicevoxBaseUrl: string;
  voicevoxSpeakerId: number;
}

// -- Statistics --
export interface UserStats {
  totalCardsLearned: number;
  totalReviews: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTimeMinutes: number;
  averageAccuracy: number;
  kanaProgress: ProgressBreakdown;
  kanjiProgress: ProgressBreakdown;
  vocabProgress: ProgressBreakdown;
  grammarProgress: ProgressBreakdown;
}

export interface ProgressBreakdown {
  total: number;
  learned: number;
  learning: number;
  mature: number; // stability > 30 days
}

// -- Typing --
export interface TypingSession {
  id: number;
  userId: number;
  mode: 'romaji_to_kana' | 'sentence' | 'speed_test';
  wordsPerMinute: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: string;
}

// -- Navigation --
export type PageId =
  | 'dashboard'
  | 'hiragana'
  | 'katakana'
  | 'kanji'
  | 'vocabulary'
  | 'grammar'
  | 'practice'
  | 'reading'
  | 'typing'
  | 'review'
  | 'progress'
  | 'settings';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  description: string;
}
