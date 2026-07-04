'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { SupportedLocale } from '@shared/types';
import { getTranslations, getDirection, type TranslationKeys } from '@core/i18n';

interface LanguageContextValue {
  locale: SupportedLocale;
  direction: 'ltr' | 'rtl';
  t: TranslationKeys;
  setLocale: (locale: SupportedLocale) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'moataz-ai-locale';

function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(getInitialLocale);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  useEffect(() => {
    const dir = getDirection(locale);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    direction: getDirection(locale),
    t: getTranslations(locale),
    setLocale,
  }), [locale, setLocale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
