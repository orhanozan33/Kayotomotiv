// Locale files as TypeScript modules to avoid JSON import issues in Next.js
import enCommon from '@/app/locales/en/common.json';
import frCommon from '@/app/locales/fr/common.json';
import trCommon from '@/app/locales/tr/common.json';

export const locales = {
  en: {
    common: enCommon,
  },
  fr: {
    common: frCommon,
  },
  tr: {
    common: trCommon,
  },
};

