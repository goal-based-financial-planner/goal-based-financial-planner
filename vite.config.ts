import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/goal-based-financial-planner/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/index.tsx',
        'src/vite-env.d.ts',
        'src/setupTests.ts',
      ],
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      thresholds: {
        branches: 55,
        functions: 63,
        lines: 63,
        statements: 63,
      },
    },
  },
});
