import { create } from 'zustand';
import type { SrsCard, ReviewRating, ContentType } from '@/lib/types';

interface ReviewState {
  // Current review session
  dueCards: SrsCard[];
  currentCardIndex: number;
  isAnswerShown: boolean;
  sessionStartTime: number | null;
  cardStartTime: number | null;

  // Session stats
  cardsReviewed: number;
  correctCount: number;
  totalTimeMs: number;

  // Actions
  setDueCards: (cards: SrsCard[]) => void;
  showAnswer: () => void;
  nextCard: (rating: ReviewRating) => void;
  startSession: () => void;
  endSession: () => void;
  resetSession: () => void;
  getDueCardsByType: (type: ContentType) => SrsCard[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  dueCards: [],
  currentCardIndex: 0,
  isAnswerShown: false,
  sessionStartTime: null,
  cardStartTime: null,
  cardsReviewed: 0,
  correctCount: 0,
  totalTimeMs: 0,

  setDueCards: (cards) => set({ dueCards: cards }),

  showAnswer: () => set({ isAnswerShown: true }),

  nextCard: (rating) => {
    const state = get();
    const now = Date.now();
    const cardTime = state.cardStartTime ? now - state.cardStartTime : 0;
    const isCorrect = rating >= 3;

    set({
      currentCardIndex: state.currentCardIndex + 1,
      isAnswerShown: false,
      cardStartTime: now,
      cardsReviewed: state.cardsReviewed + 1,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      totalTimeMs: state.totalTimeMs + cardTime,
    });
  },

  startSession: () =>
    set({
      currentCardIndex: 0,
      isAnswerShown: false,
      sessionStartTime: Date.now(),
      cardStartTime: Date.now(),
      cardsReviewed: 0,
      correctCount: 0,
      totalTimeMs: 0,
    }),

  endSession: () => set({ sessionStartTime: null, cardStartTime: null }),

  resetSession: () =>
    set({
      dueCards: [],
      currentCardIndex: 0,
      isAnswerShown: false,
      sessionStartTime: null,
      cardStartTime: null,
      cardsReviewed: 0,
      correctCount: 0,
      totalTimeMs: 0,
    }),

  getDueCardsByType: (type) => {
    return get().dueCards.filter((card) => card.contentType === type);
  },
}));
