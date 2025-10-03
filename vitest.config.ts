import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./frontend/src/tests/setup.js'],
    globals: true,
    css: true,
    // Limit collection to our app tests only
    include: [
      'frontend/src/**/*.test.{js,jsx,ts,tsx}',
      'frontend/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    // Exclude smoke tests and all dependency tests explicitly
    exclude: [
      '**/*.smoke.test.*',
      'node_modules/**',
      '**/node_modules/**',
      'vendor/**',
      'dist/**',
      'build/**',
    ],
    // Keep a stable origin to avoid port-sensitive assertions in JSDOM
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
      '@radix-ui/react-popover': resolve(
        __dirname,
        './frontend/src/tests/mocks/radixPopover.js',
      ),
    },
  },
});
