import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  publicDir: '../public',
  envDir: '../',
  plugins: [react({ include: /\.(jsx|js|tsx|ts)$/ }), tailwindcss()],
  resolve: {
    alias: {
      '~': path.resolve('./src'),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
});
