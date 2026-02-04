/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 80,
      lines: 75,
      statements: 75
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  // Transform @xenova/transformers (ESM module)
  transformIgnorePatterns: [
    '/node_modules/(?!@xenova/transformers)/'
  ],
  // Mock @xenova/transformers in tests that don't mock it explicitly
  moduleNameMapper: {
    '^@xenova/transformers$': '<rootDir>/tests/__mocks__/@xenova/transformers.ts'
  },
  verbose: true
};
