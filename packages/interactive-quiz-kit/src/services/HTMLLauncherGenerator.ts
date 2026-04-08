// src/lib/interactive-quiz-kit/services/HTMLLauncherGenerator.ts
import type { QuizConfig } from '..';

const escapeAttribute = (unsafe: string | undefined): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/"/g, '&quot;');
};

export const generateLauncherHTML = (
  quizConfig: QuizConfig,
  libraryJSPath: string,
  quizDataPath: string,
  blocklyCSSPath?: string,
  mainCSSPath: string = 'styles.css',
  title?: string
): string => {
  const pageTitle = escapeAttribute(title || quizConfig.title || 'Interactive Quiz');
  
  const relLibraryJSPath = libraryJSPath.startsWith('./') ? libraryJSPath : `./${libraryJSPath}`;
  const relQuizDataPath = quizDataPath.startsWith('./') ? quizDataPath : `./${quizDataPath}`;
  const relBlocklyCSSPath = blocklyCSSPath ? (blocklyCSSPath.startsWith('./') ? blocklyCSSPath : `./${blocklyCSSPath}`) : undefined;
  const relMainCSSPath = mainCSSPath.startsWith('./') ? mainCSSPath : `./${mainCSSPath}`;

  const blocklyLink = relBlocklyCSSPath ? `<link rel="stylesheet" href="${escapeAttribute(relBlocklyCSSPath)}">` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link rel="stylesheet" href="${escapeAttribute(relMainCSSPath)}">
  ${blocklyLink}
  <style>
    html, body {
      height: 100%;
      margin: 0;
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      background-color: #f0f2f5;
      color: #1f2937; 
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      box-sizing: border-box; 
    }
    #root { 
      width: 100%; 
      max-width: 900px;
    }
    .loading-spinner { 
      border: 4px solid #e5e7eb; 
      border-top: 4px solid #3b82f6; 
      border-radius: 50%; 
      width: 40px; 
      height: 40px; 
      animation: spin 1s linear infinite; 
      margin: 60px auto 20px auto; 
    }
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
    .status-message { 
      text-align: center; 
      padding: 20px; 
      margin-top: 10px; 
      color: #4b5563; 
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading-spinner" aria-label="Loading quiz content"></div>
    <p class="status-message" role="status">Loading Quiz...</p>
  </div>

  <!-- Load IIFE bundle as classic script (NOT as module) -->
  <script src="${escapeAttribute(relLibraryJSPath)}"></script>
  
  <!-- Initialization script runs after player.js loads -->
  <script>
    (function () {
      function showStatusMessage(message, isError = false) {
        const rootEl = document.getElementById('root');
        if (rootEl) {
          rootEl.innerHTML = '';
          const messageEl = document.createElement('p');
          messageEl.textContent = message;
          messageEl.className = 'status-message';
          if (isError) messageEl.style.color = '#ef4444';
          rootEl.appendChild(messageEl);
        }
      }

      async function main() {
        // Check if IIFE bundle loaded correctly
        if (typeof window.QuizPlayerBundle === 'undefined' || 
            typeof window.QuizPlayerBundle.mountQuizPlayer !== 'function') {
          showStatusMessage(
            'Error: Quiz Player bundle failed to load or does not export mountQuizPlayer. Check build logs.', 
            true
          );
          console.error('QuizPlayerBundle not found on window object');
          return;
        }

        // Get mountQuizPlayer from global object
        const { mountQuizPlayer } = window.QuizPlayerBundle;

        // Load quiz data
        let quizConfigData;
        try {
          const response = await fetch('${escapeAttribute(relQuizDataPath)}');
          if (!response.ok) {
            throw new Error(\`Failed to load quiz data: \${response.status} - \${response.statusText}\`);
          }
          quizConfigData = await response.json();
        } catch (error) {
          console.error("Error loading quiz data:", error);
          showStatusMessage(
            'Error: Could not load quiz configuration. ' + (error.message || 'Unknown error.'), 
            true
          );
          return;
        }
        
        // Mount the quiz player
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.innerHTML = '';
          mountQuizPlayer('root', quizConfigData);
        } else {
          console.error('Critical Error: Root element (#root) not found');
          document.body.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Critical Error: Root element not found.</p>';
        }
      }

      // Run on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
      } else {
        main();
      }
    })();
  </script>
</body>
</html>`;
};