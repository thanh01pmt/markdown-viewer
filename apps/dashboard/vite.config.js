import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-syntax-highlighter')) return 'highlight';
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('unified')) return 'markdown';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
        }
      }
    }
  }
})
