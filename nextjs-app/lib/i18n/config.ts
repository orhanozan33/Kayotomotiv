import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { locales } from './locales';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: locales,
    fallbackLng: 'fr',
    // Don't set lng explicitly - let LanguageDetector handle it from localStorage
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'], // Only use localStorage, ignore browser language
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
    debug: process.env.NODE_ENV === 'development',
  });

// Ensure language is loaded from localStorage on initialization (client-side only)
if (typeof window !== 'undefined') {
  try {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && ['tr', 'en', 'fr'].includes(savedLang)) {
      i18n.changeLanguage(savedLang);
    } else {
      // No saved language, set default and save it
      i18n.changeLanguage('fr');
      localStorage.setItem('i18nextLng', 'fr');
    }
  } catch (e) {
    // localStorage might not be available - silently fail
  }
}

// Ensure language is persisted on change (only on client side, not during build)
// This code will only run in the browser, not during SSR or build
// Check if we're in a browser environment and not during build
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NEXT_PHASE === 'phase-development-build';

if (isBrowser && !isBuildTime) {
  // Set up language change listener to persist to localStorage
  i18n.on('languageChanged', (lng) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('i18nextLng', lng);
      }
    } catch (e) {
      // localStorage might not be available - silently fail
    }
  });
}

export default i18n;

