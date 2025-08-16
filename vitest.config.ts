import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: [
      { find: /^@\/server/, replacement: path.resolve(__dirname, './server') },
      { find: '@', replacement: path.resolve(__dirname, './client/src') },
      { find: '@shared', replacement: path.resolve(__dirname, './shared') },
      { find: '@assets', replacement: path.resolve(__dirname, './attached_assets') }
    ]
  }
});