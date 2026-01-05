'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const languages = [
  { code: 'en', nameKey: 'languages.en' },
  { code: 'fr', nameKey: 'languages.fr' },
  { code: 'tr', nameKey: 'languages.tr' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lng);
    }
  };

  // Default to 'en' for server-side render to avoid hydration mismatch
  const currentLanguageCode = isMounted ? i18n.language : 'en';

  return (
    <div className={styles.languageSwitcher}>
      <div className={styles.dropdown}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`${styles.dropdownItem} ${currentLanguageCode === lang.code ? styles.active : ''}`}
            onClick={() => changeLanguage(lang.code)}
            title={isMounted ? String(t(lang.nameKey) || lang.code.toUpperCase()) : lang.code.toUpperCase()}
          >
            <span className={styles.languageCode}>{lang.code.toUpperCase()}</span>
            {currentLanguageCode === lang.code && <span className={styles.checkmark}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

