import { defineConfig, type Options } from 'tsup';
import dotenv from 'dotenv';
import path from 'path';

// Load from root .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Define a base configuration to be shared across different build targets
const commonConfig: Options = {
  // We set clean to false here and only enable it on the first config object
  // to prevent it from running multiple times.
  clean: false, 
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: true,
  define: {
    'process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_URL': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_URL || ''),
    'process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_KEY': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_FALLBACK_KEY || ''),
    'process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_URL': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_URL || ''),
    'process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_KEY': JSON.stringify(process.env.NEXT_PUBLIC_JUDGE0_PRIMARY_KEY || ''),
    'process.env.NEXT_PUBLIC_GEMINI_API_KEY': JSON.stringify(process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''),
    'process.env.NEXT_PUBLIC_PISTON_URL': JSON.stringify(process.env.NEXT_PUBLIC_PISTON_URL || '/api/piston'),
    'process.env.NEXT_PUBLIC_PISTON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_PISTON_KEY || ''),
  },
  dts: true,
  external: [
    'react', 
    'react-dom', 
    'next', 
    'i18next-browser-languagedetector', 
    'react-i18next',
    '@google/generative-ai'
  ],
  noExternal: [
    'clsx', 'tailwind-merge', 'lucide-react', 'react-markdown', 'remark-gfm',
    'rehype-highlight', 'remark-math', 'rehype-katex', '@radix-ui/react-accordion',
    '@radix-ui/react-slot', '@radix-ui/react-scroll-area', 'class-variance-authority',
    '@radix-ui/react-progress', '@radix-ui/react-label', '@radix-ui/react-radio-group',
    '@radix-ui/react-checkbox', '@radix-ui/react-select', '@radix-ui/react-dialog',
    '@radix-ui/react-toast', 'i18next',
    'date-fns', 'html-to-image', 'react-calendar-heatmap', 'react-day-picker', 'react-tooltip',
    '@radix-ui/react-tooltip', '@radix-ui/react-tabs', '@radix-ui/react-switch',
    '@radix-ui/react-popover', '@radix-ui/react-menubar', '@radix-ui/react-separator',
    '@radix-ui/react-dropdown-menu', '@radix-ui/react-avatar', '@radix-ui/react-slider',
    'recharts', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities',
    '@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/lang-cpp',
    '@codemirror/lang-python', 'zod', 'jszip', 'path-browserify',
    '@tailwindcss/typography', 'cmdk', 'highlight.js', 'katex', '@milkdown/kit',
    '@milkdown/react', '@prosemirror-adapter/react', '@radix-ui/react-alert-dialog',
    '@tiptap/extension-code-block-lowlight', '@tiptap/extension-image', '@tiptap/extension-link',
    '@tiptap/react', '@tiptap/starter-kit', '@types/react-calendar-heatmap', 'lowlight',
    'scratchblocks'
  ],
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : 'cjs'}`,
    };
  },
  shims: false,
};

// Configuration for UI entry points that require React and the "use client" directive
const uiConfig: Options = {
  ...commonConfig,
  clean: true, // Only the first config needs to clean the directory
  entry: {
    'player': 'src/player.ts',
    'react-ui': 'src/react-ui.ts',
  },
  esbuildOptions(options) {
    options.inject = ['./src/react-shim.ts'];
    return options;
  },
  banner: {
    js: "'use client';",
  },
};

// Configuration for client-side services that need "use client" but NOT the React shim
const clientServicesConfig: Options = {
    ...commonConfig,
    entry: {
        'client-services': 'src/client-services.ts',
    },
    banner: {
        js: "'use client';",
    },
};

// Configuration for headless/server-safe entry points (no banner, no inject)
const headlessConfig: Options = {
  ...commonConfig,
  entry: {
    'index': 'src/index.ts',
    'ai': 'src/ai.ts',
    'i18n': 'src/i18n.ts',
    'schemas': 'src/schemas.ts', // Add the new entry point here
  },
};

export default defineConfig([
    uiConfig,
    clientServicesConfig,
    headlessConfig
]);