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
 * Persists the user theme preference into localStorage.
 */
export function setStoredTheme(theme: Theme): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Ignore storage errors
  }
}
