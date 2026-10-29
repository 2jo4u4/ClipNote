import type { Language } from '../i18n/types';

export const THEME_STORAGE_KEY = 'notebook_theme';
export const LANGUAGE_STORAGE_KEY = 'notebook_language';

export type Theme = 'light' | 'dark';

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
      if (saved === 'light' || saved === 'dark') return saved;
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
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Ignore localStorage errors
  }
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
    }
  } catch {
    // Ignore chrome.storage errors
  }
}

/**
 * Persists the user language preference into localStorage and chrome.storage.local.
 */
export function setStoredLanguage(language: Language): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  } catch {
    // Ignore localStorage errors
  }
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: language });
    }
  } catch {
    // Ignore chrome.storage errors
  }
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
