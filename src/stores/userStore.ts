import { create } from 'zustand';
import type { User, AppSettings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { applyTheme } from '@/services/themeService';

interface UserState {
  user: User | null;
  settings: AppSettings;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  addXp: (amount: number) => void;
  updateStreak: (days: number) => void;
}

// Apply non-theme settings to the DOM
function applyDomSettings(settings: Partial<AppSettings>) {
  if (settings.animationsEnabled !== undefined) {
    document.documentElement.dataset.animations = settings.animationsEnabled ? 'on' : 'off';
  }
  if (settings.fontSize !== undefined) {
    document.documentElement.dataset.fontSize = settings.fontSize;
  }
}

// Apply defaults on load
applyDomSettings(DEFAULT_SETTINGS);

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  isOnboarded: false,

  setUser: (user) => set({ user }),

  updateSettings: (newSettings) => {
    // Apply theme whenever colorTheme or colorMode changes
    const current = get().settings;
    const nextTheme = newSettings.colorTheme ?? current.colorTheme;
    const nextMode = newSettings.colorMode ?? current.colorMode;

    if (newSettings.colorTheme !== undefined || newSettings.colorMode !== undefined) {
      applyTheme(nextTheme, nextMode);
    }

    applyDomSettings(newSettings);

    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),

  setOnboarded: (isOnboarded) => set({ isOnboarded }),

  addXp: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, xp: state.user.xp + amount }
        : null,
    })),

  updateStreak: (days) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, streakDays: days }
        : null,
    })),
}));
