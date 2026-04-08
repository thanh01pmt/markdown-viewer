// packages/interactive-quiz-kit/src/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import the translation files
import { translationEN } from './locales/en/translation';
import { translationVI } from './locales/vi/translation';

// --- NEW: Export the raw translation objects for consumption by the platform ---
export { translationEN, translationVI };

// Define the resources
const resources = {
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  },
};

i18n
  // Pass the language detector instance to i18next.
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if the detected language is not available
    
    // Configure the standard language detector
    detection: {
      // Order of detection:
      // 1. localStorage (default key 'i18nextLng')
      // 2. Querystring (e.g., ?lng=vi)
      // 3. Cookie
      // 4. Navigator (browser language)
      order: ['localStorage', 'querystring', 'cookie', 'navigator'],
      caches: ['localStorage'], // Use the detector's built-in localStorage caching
    },

    interpolation: {
      escapeValue: false, // React already safes from xss
    },

    // react-i18next options
    react: {
      useSuspense: false, // Set to false for simpler integration without React.Suspense
    },
  });

export default i18n;