import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import ruCommon from '../locales/ru/common.json';
import ukCommon from '../locales/uk/common.json';
import deCommon from '../locales/de/common.json';
import esCommon from '../locales/es/common.json';
import frCommon from '../locales/fr/common.json';
import plCommon from '../locales/pl/common.json';
import ptCommon from '../locales/pt/common.json';
import zhCommon from '../locales/zh/common.json';

const resources = {
  en: {
    common: enCommon
  },
  ru: {
    common: ruCommon
  },
  uk: {
    common: ukCommon
  },
  de: {
    common: deCommon
  },
  es: {
    common: esCommon
  },
  fr: {
    common: frCommon
  },
  pl: {
    common: plCommon
  },
  pt: {
    common: ptCommon
  },
  zh: {
    common: zhCommon
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru', // Default language
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    // Namespace configuration
    defaultNS: 'common',
    ns: ['common'],
    
    // Language switching
    supportedLngs: ['en', 'ru', 'uk', 'de', 'es', 'fr', 'pl', 'pt', 'zh'],
    nonExplicitSupportedLngs: false,
  });

export default i18n;
