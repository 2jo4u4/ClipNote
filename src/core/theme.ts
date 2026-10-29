import type { Language } from '../i18n/types';

export const THEME_STORAGE_KEY = 'notebook_theme';
export const LANGUAGE_STORAGE_KEY = 'notebook_language';

export type Theme = 'light' | 'dark';

export function isTheme(val: unknown): val is Theme {
  return val === 'light' || val === 'dark';
}

export function isLanguage(val: unknown): val is Language {
  return val === 'zh-TW' || val === 'en';
}

function persistPreference(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore localStorage errors
  }
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [key]: value });
    }
  } catch {
    // Ignore chrome.storage errors
  }
}

/**
 * Synchronously applies theme styling to documentElement.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
}

/**
 * Retrieves the stored theme from localStorage or falls back to the default (dark).
 */
export function getStoredTheme(defaultDark: boolean = true): Theme {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(saved)) return saved;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return defaultDark ? 'dark' : 'light';
}

/**
 * Persists the user theme preference into localStorage and chrome.storage.local.
 */
export function setStoredTheme(theme: Theme): void {
  persistPreference(THEME_STORAGE_KEY, theme);
}

/**
 * Persists the user language preference into localStorage and chrome.storage.local.
 */
export function setStoredLanguage(language: Language): void {
  persistPreference(LANGUAGE_STORAGE_KEY, language);
}

/**
 * Resolves the default language from navigator.language ('zh*' -> 'zh-TW', else 'en').
 */
export function getDefaultBrowserLanguage(): Language {
  try {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';
    }
  } catch {
    // Ignore navigator errors
  }
  return 'zh-TW';
}

/**
 * Asynchronously resolves language and theme preferences from chrome.storage.local
 * across extension contexts (e.g. Content Script and Background Service Worker).
 */
export async function resolveStoredPreferences(): Promise<{ language: Language; theme: Theme }> {
  const fallbackLanguage = getDefaultBrowserLanguage();
  const fallbackTheme: Theme = 'dark';

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await new Promise<Record<string, unknown>>((resolve) => {
        chrome.storage.local.get([LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY], (items) => {
          resolve(items || {});
        });
      });
      const storedLang = res[LANGUAGE_STORAGE_KEY];
      const storedTheme = res[THEME_STORAGE_KEY];
      return {
        language: isLanguage(storedLang) ? storedLang : fallbackLanguage,
        theme: isTheme(storedTheme) ? storedTheme : fallbackTheme,
      };
    }
  } catch {
    // Ignore storage read errors
  }

  return { language: fallbackLanguage, theme: fallbackTheme };
}
