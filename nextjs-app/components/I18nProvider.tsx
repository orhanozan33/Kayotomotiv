'use client';

import { useEffect } from 'react';
import i18n from '@/lib/i18n/config';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure language is loaded from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('i18nextLng');
      if (savedLang && ['tr', 'en', 'fr'].includes(savedLang)) {
        // Only change if different to avoid unnecessary re-renders
        if (i18n.language !== savedLang) {
          i18n.changeLanguage(savedLang);
        }
      } else {
        // No saved language, default to French
        if (i18n.language !== 'fr') {
          i18n.changeLanguage('fr');
          localStorage.setItem('i18nextLng', 'fr');
        }
      }
    }
  }, []);

  return <>{children}</>;
}

