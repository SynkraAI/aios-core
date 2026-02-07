import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/index.ts',
    '!src/chat/repl.ts',
    '!src/notifier/telegram.ts',
    '!src/notifier/email.ts',
    '!src/notifier/notifier.ts',
    '!src/scheduler/**',
    '!src/collector/**',
    '!src/config/loader.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  verbose: true,
  testTimeout: 30000,
};

export default config;
