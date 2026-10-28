export * from './types';
export * from './locales/zh-TW';
export * from './locales/en';

import { Language, I18nTranslations } from './types';
import { zhTW } from './locales/zh-TW';
import { en } from './locales/en';

export const translations: Record<Language, I18nTranslations> = {
  'zh-TW': zhTW,
  en,
};

export function getTranslations(lang: Language = 'zh-TW'): I18nTranslations {
  return translations[lang] || translations['zh-TW'];
}
