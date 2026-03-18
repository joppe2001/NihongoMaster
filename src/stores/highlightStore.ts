/**
 * Global word highlight state.
 *
 * Tracks which word is currently being spoken so HighlightableText
 * components can render the karaoke-style highlight effect.
 *
 * Only one text can be highlighted at a time (one audio plays at a time).
 */
import { create } from 'zustand';
import type { WordTiming } from '@/services/wordTimingService';

interface HighlightStore {
  /** Unique ID of the currently highlighted text instance. */
  activeId: string | null;
  /** Timing data for the active text. */
  timings: WordTiming[];
  /** Index of the currently highlighted word. */
  currentIndex: number;
  /** Whether highlighting is active. */
  isActive: boolean;

  // Actions
  start: (id: string, timings: WordTiming[]) => void;
  setCurrent: (index: number) => void;
  stop: () => void;
}

export const useHighlightStore = create<HighlightStore>((set) => ({
  activeId: null,
  timings: [],
  currentIndex: -1,
  isActive: false,

  start: (id, timings) =>
    set({ activeId: id, timings, currentIndex: 0, isActive: true }),

  setCurrent: (index) => set({ currentIndex: index }),

  stop: () =>
    set({ activeId: null, timings: [], currentIndex: -1, isActive: false }),
}));
