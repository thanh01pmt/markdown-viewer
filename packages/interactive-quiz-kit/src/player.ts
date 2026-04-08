"use client";
// src/player.ts

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QuizPlayer } from './react-ui/components/ui/QuizPlayer';
import { QuizResult } from './react-ui/components/ui/QuizResult';
import type { QuizConfig, QuizResultType } from '.';
import { translationEN } from './locales/en/translation';
import { translationVI } from './locales/vi/translation';

// Initialize i18next for SCORM standalone usage with full resources
const detectPreferredLanguage = (): string => {
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) return urlLang.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  } catch (_e) {}
  const globalLang = (window as any).__IQK_LANG__ as string | undefined;
  if (globalLang) return globalLang.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  const navLang = typeof navigator !== 'undefined' ? navigator.language : 'en';
  return navLang && navLang.toLowerCase().startsWith('vi') ? 'vi' : 'en';
};

const initI18n = (preferred?: string) => {
  const lng = preferred || detectPreferredLanguage();
  const resources = {
    en: { translation: translationEN },
    vi: { translation: translationVI },
  } as const;

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  } else if (i18n.language !== lng) {
    i18n.changeLanguage(lng);
  }
};

/**
 * Hàm này là entry point duy nhất cho gói SCORM hoặc môi trường độc lập.
 * Nó sẽ được gọi từ file index.html để khởi tạo và render toàn bộ ứng dụng quiz
 * vào một phần tử DOM được chỉ định.
 * 
 * @param targetElementId ID của thẻ div trong HTML nơi quiz sẽ được render (ví dụ: 'root').
 * @param quizConfig Đối tượng cấu hình quiz đầy đủ.
 */
function mountQuizPlayer(
  targetElementId: string,
  quizConfig: QuizConfig
) {
  // Initialize i18n first (detect or from URL/global)
  initI18n();

  const targetElement = document.getElementById(targetElementId);
  if (!targetElement) {
    console.error(`Quiz Player Mount Error: Element with ID "${targetElementId}" not found.`);
    document.body.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Critical Error: Target render element #${targetElementId} not found.</p>`;
    return;
  }

  /**
   * Đây là một component "container" nội bộ.
   * Vai trò của nó là quản lý trạng thái cấp cao nhất: quiz đang diễn ra hay đã kết thúc.
   * Dựa vào trạng thái này, nó sẽ quyết định render QuizPlayer hoặc QuizResult.
   */
  const AppContainer = () => {
    const [quizResult, setQuizResult] = useState<QuizResultType | null>(null);

    const handleQuizComplete = (result: QuizResultType) => {
      console.log("Quiz Complete (captured inside React AppContainer):", result);
      setQuizResult(result);
    };

    const handleExit = () => {
      console.log("Quiz Exited");
      const rootEl = document.getElementById(targetElementId);
      if (rootEl) {
        const root = (rootEl as any)._reactRootContainer;
        if (root) {
          root.unmount();
        }
        rootEl.innerHTML = '<p style="text-align: center; padding: 20px; color: #4b5563;">Quiz exited. You may now close this window.</p>';
      }
    };

    if (quizResult) {
      return React.createElement(QuizResult, {
        result: quizResult,
        quizTitle: quizConfig.title,
        onExitQuiz: handleExit,
      });
    }

    return React.createElement(QuizPlayer, {
      quizConfig: quizConfig,
      onQuizComplete: handleQuizComplete,
      onExitQuiz: handleExit,
    });
  };

  // Khởi tạo và render ứng dụng React vào target element
  const root = ReactDOM.createRoot(targetElement);
  root.render(React.createElement(React.StrictMode, null, React.createElement(AppContainer)));
}

export { mountQuizPlayer };

// Expose global for SCORM runtime (script-tag usage)
declare global {
  interface Window {
    mountQuizPlayer?: typeof mountQuizPlayer;
    __IQK_LANG__?: string;
  }
}

if (typeof window !== 'undefined') {
  window.mountQuizPlayer = mountQuizPlayer;
}