'use client';

import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n/config';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to initialize
    if (i18n.isInitialized) {
      // Initialize i18n language from localStorage or default to French
      if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('i18nextLng');
        if (savedLang && ['tr', 'en', 'fr'].includes(savedLang)) {
          i18n.changeLanguage(savedLang);
        } else {
          i18n.changeLanguage('fr');
          localStorage.setItem('i18nextLng', 'fr');
        }
      }
      setIsReady(true);
    } else {
      // Wait for initialization
      const initHandler = () => {
        if (typeof window !== 'undefined') {
          const savedLang = localStorage.getItem('i18nextLng');
          if (savedLang && ['tr', 'en', 'fr'].includes(savedLang)) {
            i18n.changeLanguage(savedLang);
          } else {
            i18n.changeLanguage('fr');
            localStorage.setItem('i18nextLng', 'fr');
          }
        }
        setIsReady(true);
      };
      i18n.on('initialized', initHandler);
      return () => {
        i18n.off('initialized', initHandler);
      };
    }
  }, []);

  // Don't wait for isReady - i18n is initialized synchronously
  // Children will render immediately and i18n will be available
  return <>{children}</>;
}

