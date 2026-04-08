// tsup.config.ts
import { defineConfig, type Format } from 'tsup';

export default defineConfig((options) => {
  const clientEntryPoints = [
    'src/player.ts',
    'src/react-ui.ts',
    'src/authoring.ts',
  ];

  const isClient = Object.keys(options.entry ?? {}).some(entryKey => 
    clientEntryPoints.includes((options.entry as any)[entryKey])
  );

  return {
    clean: true, 
    format: ['cjs', 'esm'],
    splitting: false,
    treeshake: true,
    dts: true,

    inject: ['./react-shim.ts'],

    external: [
      'react',
      'react-dom',
    ],
    
    noExternal: [
        'clsx', 'tailwind-merge', 'lucide-react', 'react-markdown', 'remark-gfm', 
        'rehype-highlight', 'remark-math', 'rehype-katex', '@radix-ui/react-accordion',
        '@radix-ui/react-slot', '@radix-ui/react-scroll-area', 'class-variance-authority',
        '@radix-ui/react-progress', '@radix-ui/react-label', '@radix-ui/react-radio-group',
        '@radix-ui/react-checkbox', '@radix-ui/react-select', '@radix-ui/react-dialog',
        '@radix-ui/react-toast', 'i18next', 'react-i18next', 'i18next-browser-languagedetector',
        'date-fns', 'html-to-image', 'react-calendar-heatmap', 'react-day-picker', 'react-tooltip',
        '@radix-ui/react-tooltip', '@radix-ui/react-tabs', '@radix-ui/react-switch', 
        '@radix-ui/react-popover', '@radix-ui/react-menubar', '@radix-ui/react-separator',
        '@radix-ui/react-dropdown-menu', '@radix-ui/react-avatar', '@radix-ui/react-slider',
        'recharts', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities',
        '@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/lang-cpp',
        '@codemirror/lang-python',
        'scratchblocks'
    ],
    
    banner: {
      js: isClient ? "'use client';" : '',
    },
    
    entry: {
        'index': 'src/index.ts',
        'player': 'src/player.ts', 
        'react-ui': 'src/react-ui.ts',
        'ai': 'src/ai.ts',
        'authoring': 'src/authoring.ts',
    },
    
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'mjs' : 'cjs'}`,
      };
    },
    
    shims: false, 
  };
});