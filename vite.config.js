import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      output: {
        // Ensure we have a single entry point file
        entryFileNames: 'assets/index.js',
        // Ensure we have a single CSS file
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        },
        // Ensure we have a single chunk file
        chunkFileNames: 'assets/index-chunk.js',
        // Ensure all code is in a single chunk
        manualChunks: () => 'index',
      },
    },
  },
})
