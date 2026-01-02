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
    lng: 'fr', // Set default language to French
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'], // Only use localStorage, ignore browser language
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true, // Only allow whitelisted languages
    },
    react: {
      useSuspense: false,
    },
    debug: process.env.NODE_ENV === 'development',
  });

// Ensure language is persisted on change
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('i18nextLng', lng);
  });
  
  // Load saved language on initialization
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && ['tr', 'en', 'fr'].includes(savedLang)) {
    i18n.changeLanguage(savedLang);
  } else {
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
  }
}

export default i18n;

