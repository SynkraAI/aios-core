import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.integration.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 15_000,
    reporters: ['verbose'],
    clearMocks: true,
  },
});
