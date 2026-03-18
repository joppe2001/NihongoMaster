import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContentType } from '@/components/study/types';

interface StarredState {
  /** Starred item IDs keyed by content type. Arrays are used because Set is not JSON-serialisable. */
  starred: Record<ContentType, string[]>;

  toggleStar: (contentType: ContentType, id: string) => void;
  isStarred: (contentType: ContentType, id: string) => boolean;
  getStarredSet: (contentType: ContentType) => Set<string>;
  clearAll: (contentType?: ContentType) => void;
}

export const useStarredStore = create<StarredState>()(
  persist(
    (set, get) => ({
      starred: { kana: [], kanji: [], vocab: [], grammar: [] },

      toggleStar: (contentType, id) =>
        set((state) => {
          const current = state.starred[contentType];
          const next = current.includes(id)
            ? current.filter((i) => i !== id)
            : [...current, id];
          return { starred: { ...state.starred, [contentType]: next } };
        }),

      isStarred: (contentType, id) =>
        get().starred[contentType].includes(id),

      getStarredSet: (contentType) =>
        new Set(get().starred[contentType]),

      clearAll: (contentType) =>
        set((state) => {
          if (contentType) {
            return { starred: { ...state.starred, [contentType]: [] } };
          }
          return { starred: { kana: [], kanji: [], vocab: [], grammar: [] } };
        }),
    }),
    { name: 'nihongo-starred' }
  )
);
