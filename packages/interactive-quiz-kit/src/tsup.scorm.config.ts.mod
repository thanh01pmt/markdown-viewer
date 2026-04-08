import { defineConfig, type Format } from 'tsup';

export default defineConfig((options) => {
  // Danh sách các entry point cần 'use client'
  const clientEntryPoints = [
    'src/player.ts',
    'src/react-ui.ts',
    'src/authoring.ts',
  ];

  // Kiểm tra xem entry point hiện tại có phải là client component không
  const isClient = Object.keys(options.entry ?? {}).some(entryKey => 
    clientEntryPoints.includes((options.entry as any)[entryKey])
  );

  return {
    clean: !options.watch,
    format: ['cjs', 'esm'] as Format[],
    splitting: false,
    treeshake: true,
    
    // CHANGE: Enable tsup's built-in d.ts generation
    dts: {
      resolve: true,
      // Generate separate .d.ts files for each entry point
      entry: {
        'index': 'src/index.ts',
        'player': 'src/player.ts', 
        'react-ui': 'src/react-ui.ts',
        'ai': 'src/ai.ts',
        'authoring': 'src/authoring.ts',
      }
    },

    hash: false,
    external: [
      'react',
      'react-dom',
      'react-markdown',
      'remark-gfm',
      'rehype-highlight',
      'remark-math',
      'rehype-katex',
    ],
    banner: {
      js: isClient ? "'use client';" : '',
    },
    entry: [
      'src/index.ts',
      'src/player.ts',
      'src/react-ui.ts',
      'src/ai.ts',
      'src/authoring.ts',
    ],
    outExtension({ format }) {
      return {
        js: `.${format === 'esm' ? 'js' : 'cjs'}`,
      };
    },
  };
});