// FILE: packages/interactive-quiz-kit/src/react-ui/components/common/ClientTranslation.tsx

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TOptions } from 'i18next';

interface ClientTranslationProps {
  tKey: string;
  options?: TOptions;
  fallback: string; // The exact string rendered on the server (usually English)
}

/**
 * Renders a translated string only on the client-side after hydration is complete.
 * On the server and during the initial client render, it shows a fallback string
 * to prevent hydration mismatch errors.
 * @param {ClientTranslationProps} props - The component props.
 * @param {string} props.tKey - The i18next translation key.
 * @param {TOptions} [props.options] - Optional interpolation values for the translation.
 * @param {string} props.fallback - The string that was rendered on the server (must match exactly).
 */
export const ClientTranslation: React.FC<ClientTranslationProps> = ({ tKey, options, fallback }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{t(tKey, options)}</>;
};