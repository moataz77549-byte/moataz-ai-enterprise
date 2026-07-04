import en, { type TranslationKeys } from './locales/en';
import ar from './locales/ar';
import type { SupportedLocale } from '@shared/types';

const catalogs: Record<SupportedLocale, TranslationKeys> = { en, ar };

export function getTranslations(locale: SupportedLocale): TranslationKeys {
  return catalogs[locale];
}

export function getDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export { type TranslationKeys };
