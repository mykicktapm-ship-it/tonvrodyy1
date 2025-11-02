import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Locale } from './i18n';

/**
 * Provides current locale and translation function to the application.
 * The locale value persists in localStorage to retain language choice.
 */
interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /**
   * Translate a dot-delimited key (e.g. 'home.welcome') to the current locale.
   * Falls back to the key itself if no translation exists.
   */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize locale from localStorage or Telegram language_code
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem('locale') as Locale | null;
      if (stored) return stored;
      const tgLang: string | undefined = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
      if (tgLang?.startsWith('ru')) return 'ru';
      if (tgLang?.startsWith('en')) return 'en';
    } catch {}
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  }, []);

  // Translation function: splits key by '.' and navigates the dictionary
  const t = useCallback(
    (key: string) => {
      const parts = key.split('.');
      let value: any = translations[locale];
      for (const part of parts) {
        if (value && part in value) {
          value = value[part];
        } else {
          return key; // return key if missing
        }
      }
      return typeof value === 'string' ? value : key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access language context. Throws if used outside provider.
 */
export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
};
