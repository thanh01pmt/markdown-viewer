import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindv4 from '@tailwindcss/vite';

// Remark plugins
import remarkDirective from "remark-directive";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkCard } from "./src/plugins/remark-card";
import { remarkStripComments } from "./src/plugins/remark-strip-comments";
import { remarkStripMarp } from "./src/plugins/remark-strip-marp";

// Rehype plugins
import { rehypeSlides } from "./src/plugins/rehype-slides";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [
        remarkDirective,
        remarkStripMarp,
        remarkStripComments,
        remarkAdmonitions,
        remarkCard,
      ],
      rehypePlugins: [
        rehypeSlides,
      ],
    }), 
    react()
  ],
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkStripMarp,
      remarkStripComments,
      remarkAdmonitions,
      remarkCard,
    ],
    rehypePlugins: [
      rehypeSlides,
    ],
  },

  vite: {
    plugins: [tailwindv4()],
  },
});

