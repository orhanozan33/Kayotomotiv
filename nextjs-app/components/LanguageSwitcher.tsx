'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const languages = [
  { code: 'en', nameKey: 'languages.en' },
  { code: 'fr', nameKey: 'languages.fr' },
  { code: 'tr', nameKey: 'languages.tr' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lng);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <div className={styles.languageSwitcher} ref={dropdownRef}>
      <button
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        title={t(currentLanguage.nameKey)}
      >
        <span className={styles.languageCode}>{currentLanguage.code.toUpperCase()}</span>
        <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.dropdownItem} ${i18n.language === lang.code ? styles.active : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className={styles.languageCode}>{lang.code.toUpperCase()}</span>
              {i18n.language === lang.code && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

