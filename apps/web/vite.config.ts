import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(fileURLToPath(import.meta.url));
const servicesRoot = resolve(appRoot, '../../../web-cv-services');

export default defineConfig({
  base: './',
  root: appRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@web-cv-services/cv-renderer': resolve(servicesRoot, 'packages/cv-renderer/src/index.ts'),
      '@web-cv-services/shared-services': resolve(servicesRoot, 'packages/shared-services/src/index.ts'),
      '@web-cv-services/shared-types': resolve(servicesRoot, 'packages/shared-types/src/index.ts'),
      '@web-cv/shared-ui': resolve(appRoot, '../../packages/shared-ui/src/index.ts'),
      '@web-cv/supabase': resolve(appRoot, '../../packages/supabase/src/index.ts'),
    },
  },
  server: {
    port: 9000,
    strictPort: true,
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
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
