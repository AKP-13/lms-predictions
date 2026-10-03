import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
// @ts-expect-error - moduleResolution difference between node and bundler
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    // The integration tests read the database URLs from .env and .env.local.
    env: loadEnv(mode, process.cwd(), ''),
    server: {
      deps: {
        // next-auth imports 'next/server' without an extension; vite resolves it, plain Node ESM does not.
        inline: ['next-auth']
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      // 'server-only' throws outside a React server build.
      'server-only': path.resolve(
        __dirname,
        'node_modules/server-only/empty.js'
      )
    }
  }
}));
