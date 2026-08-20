import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
            return 'monaco-vendor';
          }
          if (
            id.includes('socket.io-client') ||
            id.includes('yjs') ||
            id.includes('y-monaco') ||
            id.includes('y-protocols')
          ) {
            return 'collab-vendor';
          }
          if (id.includes('react-icons')) {
            return 'icons-vendor';
          }
        },
      },
    },
  },
})
