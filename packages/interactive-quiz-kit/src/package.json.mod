{
  "name": "@thanh01.pmt/interactive-quiz-kit",
  "version": "1.0.35",
  "description": "A comprehensive library for creating, managing, and playing interactive quizzes, with AI generation and SCORM support.",
  "keywords": [
    "react",
    "quiz",
    "scorm",
    "edtech",
    "typescript",
    "headless",
    "ai",
    "genkit"
  ],
  "author": "Thanh Pham <https://github.com/thanh01pmt>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/thanh01pmt/interactive-quiz-kit.git"
  },
  "sideEffects": [
    "**/i18n.ts"
  ],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./player": {
      "types": "./dist/player.d.ts",
      "import": "./dist/player.mjs",
      "require": "./dist/player.cjs"
    },
    "./react-ui": {
      "types": "./dist/react-ui.d.ts",
      "import": "./dist/react-ui.mjs",
      "require": "./dist/react-ui.cjs"
    },
    "./ai": {
      "types": "./dist/ai.d.ts",
      "import": "./dist/ai.mjs",
      "require": "./dist/ai.cjs"
    },
    "./authoring": {
      "types": "./dist/authoring.d.ts",
      "import": "./dist/authoring.mjs",
      "require": "./dist/authoring.cjs"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "README.md",
    "HEADLESS.md"
  ],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "clean": "rm -rf dist",
    "build": "npm run clean && tsc --project tsconfig.json && tsup",
    "build:scorm:js": "tsup --config tsup.scorm.config.ts",
    "build:scorm:css": "tailwindcss -i ./src/styles/main.css -o ./scorm-bundle/styles.css --minify",
    "build:scorm": "npm run build:scorm:js && npm run build:scorm:css",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest"
  },
  "dependencies": {
    "@google/generative-ai": "^0.14.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "jszip": "^3.10.1",
    "path-browserify": "^1.0.1",
    "tailwind-merge": "^2.3.0",
    "zod": "^3.23.8"
  },
  "peerDependencies": {
    "next": ">=14.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@milkdown/kit": "^7.3.2",
    "@milkdown/react": "^7.3.2",
    "@prosemirror-adapter/react": "^0.1.0-next.12",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@tiptap/extension-code-block-lowlight": "^2.4.0",
    "@tiptap/extension-image": "^2.4.0",
    "@tiptap/extension-link": "^2.4.0",
    "@tiptap/react": "^2.4.0",
    "@tiptap/starter-kit": "^2.4.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-calendar-heatmap": "^1.9.0",
    "@types/react-dom": "^18",
    "@uiw/react-codemirror": "^4.22.2",
    "autoprefixer": "^10.4.19",
    "date-fns": "^3.6.0",
    "dotenv": "^16.4.5",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.3",
    "genkit-cli": "^1.8.0",
    "html-to-image": "^1.11.11",
    "i18next": "^23.11.5",
    "i18next-browser-languagedetector": "^7.2.1",
    "lowlight": "^3.1.0",
    "lucide-react": "^0.395.0",
    "postcss": "^8.4.38",
    "react": "^18.3.1",
    "react-calendar-heatmap": "^1.9.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.52.0",
    "react-i18next": "^14.1.2",
    "react-markdown": "^9.0.1",
    "react-tooltip": "^5.27.0",
    "recharts": "^2.12.7",
    "rehype-highlight": "^7.0.0",
    "rehype-katex": "^7.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "tsup": "^8.1.0",
    "typescript": "^5"
  }
}
