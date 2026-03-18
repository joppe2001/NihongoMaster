// ============================================================
// Quizlet-style Study Mode — Shared Types
// ============================================================

/**
 * A generic study item that all content types (kana, kanji, vocab, grammar)
 * are transformed into for the shared study components.
 */
export type ContentType = 'kana' | 'kanji' | 'vocab' | 'grammar';

export interface StudyItem {
  /** Unique identifier (stringified content id) */
  id: string;
  /** The primary term to learn — displayed large (e.g. あ, 日, 食べる, ~ます) */
  term: string;
  /** Optional secondary info on the term side (e.g. reading, formation) */
  termExtra?: string;
  /** The definition / answer (e.g. "a", "day/sun", "to eat") */
  definition: string;
  /** Optional secondary info on the definition side */
  definitionExtra?: string;
  /** Audio file path for pronunciation */
  audio?: string;
  /** Content type — used to namespace starred items across page types */
  contentType?: ContentType;
}

/** Which study mode is active */
export type StudyMode = 'flashcards' | 'learn' | 'test' | 'match';

/** Item mastery state within a Learn session */
export type LearnItemState = 'not_studied' | 'familiar' | 'mastered';

/** Question type used in Learn and Test modes */
export type QuestionType = 'multiple_choice' | 'written' | 'true_false';

/** A single question in Test mode */
export interface TestQuestion {
  id: string;
  type: QuestionType;
  /** The item being tested */
  item: StudyItem;
  /** For MC: the 4 choices (including correct) */
  choices?: string[];
  /** For true/false: the statement shown */
  statement?: string;
  /** For true/false: whether the statement is correct */
  statementIsCorrect?: boolean;
  /** Index of correct answer in choices (MC only) */
  correctIndex?: number;
  /** User's answer — filled during the test */
  userAnswer?: string | number | boolean;
  /** Whether the user got it right */
  isCorrect?: boolean;
}

/** Props shared across all study mode components */
export interface StudyModeProps {
  items: StudyItem[];
  onComplete?: (stats: StudySessionStats) => void;
  onBack?: () => void;
}

/** Stats returned when a study session completes */
export interface StudySessionStats {
  mode: StudyMode;
  totalItems: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  /** Time spent in seconds */
  timeSpent: number;
  /** Items the user starred (flashcard mode) */
  starredIds?: string[];
  /** Items the user got wrong (for retake) */
  missedItems?: StudyItem[];
}
