import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  root: appRoot,
  plugins: [react()],
  css: {
    postcss: resolve(appRoot, '../../postcss.config.js'),
  },
  build: {
    cssCodeSplit: true,
    emptyOutDir: true,
    outDir: resolve(appRoot, '../../dist/apps/web'),
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
