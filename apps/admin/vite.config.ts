import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  root: appRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@portfolio/shared-services': resolve(appRoot, '../../packages/shared-services/src/index.ts'),
      '@portfolio/shared-types': resolve(appRoot, '../../packages/shared-types/src/index.ts'),
      '@portfolio/shared-ui': resolve(appRoot, '../../packages/shared-ui/src/index.ts'),
      '@portfolio/supabase': resolve(appRoot, '../../packages/supabase/src/index.ts'),
    },
  },
  css: {
    postcss: resolve(appRoot, '../../postcss.config.js'),
  },
  build: {
    cssCodeSplit: true,
    emptyOutDir: true,
    outDir: resolve(appRoot, '../../dist/apps/admin'),
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
