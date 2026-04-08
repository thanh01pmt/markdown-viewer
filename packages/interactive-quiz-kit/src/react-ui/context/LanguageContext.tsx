// packages/interactive-quiz-kit/src/react-ui/context/LanguageContext.tsx

"use client";

import React, { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; // Import the configured i18next instance from the library

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * LanguageProvider is a convenience wrapper for setting up i18next in a standalone
 * environment for the interactive-quiz-kit. It uses the standard I18nextProvider
 * internally. When this library is used within a larger application (like LearnWell),
 * the larger application should provide its own I18nextProvider at the root.
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

// The custom useLanguage hook is no longer needed. 
// Components should now import and use `useTranslation` from `react-i18next` directly.