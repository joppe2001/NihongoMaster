/**
 * Theme Service — manages applying color themes and light/dark modes.
 *
 * Sets two attributes on <html>:
 *   data-theme="sakura|matcha|fuji|momiji|sora|twilight"
 *   data-mode="light|dark"
 *
 * CSS selectors target [data-theme="X"][data-mode="Y"] for full theme × mode matrix.
 */
import type { AppSettings } from '@/lib/types';

export type ColorTheme = AppSettings['colorTheme'];
export type ColorMode = AppSettings['colorMode'];

let systemModeListener: (() => void) | null = null;

/** Resolves 'system' to the actual OS preference. */
function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Applies theme + mode to the <html> element.
 */
export function applyTheme(theme: ColorTheme, mode: ColorMode): void {
  const html = document.documentElement;
  const effectiveMode = resolveMode(mode);

  html.classList.add('theme-transitioning');
  html.setAttribute('data-theme', theme);
  html.setAttribute('data-mode', effectiveMode);

  setTimeout(() => html.classList.remove('theme-transitioning'), 500);

  // Clean up old listener
  if (systemModeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemModeListener);
    systemModeListener = null;
  }

  // Listen for OS changes when mode is 'system'
  if (mode === 'system') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemModeListener = () => {
      document.documentElement.setAttribute('data-mode', mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', systemModeListener);
  }
}

/**
 * Migrates old single-field `theme` to new `colorTheme` + `colorMode`.
 */
export function migrateOldTheme(oldTheme: string): { colorTheme: ColorTheme; colorMode: ColorMode } {
  switch (oldTheme) {
    case 'system': return { colorTheme: 'twilight', colorMode: 'system' };
    case 'light':  return { colorTheme: 'twilight', colorMode: 'light' };
    case 'dark':   return { colorTheme: 'twilight', colorMode: 'dark' };
    case 'sakura': return { colorTheme: 'sakura',  colorMode: 'light' };
    case 'matcha': return { colorTheme: 'matcha',  colorMode: 'light' };
    case 'fuji':   return { colorTheme: 'fuji',    colorMode: 'light' };
    case 'momiji': return { colorTheme: 'momiji',  colorMode: 'light' };
    case 'sora':   return { colorTheme: 'sora',    colorMode: 'light' };
    default:       return { colorTheme: 'twilight', colorMode: 'system' };
  }
}

export function initializeTheme(theme: ColorTheme, mode: ColorMode): void {
  applyTheme(theme, mode);
}

export function cleanupTheme(): void {
  if (systemModeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemModeListener);
    systemModeListener = null;
  }
}
