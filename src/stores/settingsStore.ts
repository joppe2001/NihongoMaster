import { create } from 'zustand';
import type { PageId } from '@/lib/types';

interface AppState {
  currentPage: PageId;
  isSidebarCollapsed: boolean;
  isDbReady: boolean;

  // Actions
  setCurrentPage: (page: PageId) => void;
  toggleSidebar: () => void;
  setDbReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  isSidebarCollapsed: false,
  isDbReady: false,

  setCurrentPage: (page) => set({ currentPage: page }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setDbReady: (ready) => set({ isDbReady: ready }),
}));
