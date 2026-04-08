// packages/interactive-quiz-kit/tsup.scorm.config.ts
import { defineConfig } from 'tsup';
import { polyfillNode } from "esbuild-plugin-polyfill-node";
import dotenv from 'dotenv';
import path from 'path';

// Load from root .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export default defineConfig({
  entry: ['src/player.ts'],
  outDir: './scorm-bundle',
  format: ['iife'],
  globalName: 'QuizPlayerBundle',
  platform: 'browser',
  
  define: {
    'process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_URL': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_URL || ''),
    'process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_KEY': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_KEY || ''),
    'process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_URL': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_URL || ''),
    'process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_KEY': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_KEY || ''),
    'process.env.NEXT_PUBLIC_GEMINI_API_KEY': JSON.stringify(process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''),
    'process.env.NEXT_PUBLIC_PISTON_URL': JSON.stringify(process.env.NEXT_PUBLIC_PISTON_URL || '/api/piston'),
    'process.env.NEXT_PUBLIC_PISTON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_PISTON_KEY || ''),
  },
  
  // Bundle ALL dependencies including peer dependencies
  noExternal: [
    'react',
    'react-dom',
    'i18next',
    'react-i18next',
    'i18next-browser-languagedetector',
    'scratchblocks',
    '@google/generative-ai'
  ],

  // Polyfill Node.js modules for browser
  esbuildPlugins: [
    polyfillNode({
      polyfills: {
        path: true,
        process: true,
        url: true,
      },
    }),
  ],
  
  splitting: false,
  treeshake: true,
  sourcemap: true,
  minify: false,
  clean: true,

  outExtension() {
    return {
      js: `.js`,
    };
  },
  
  dts: false,
});