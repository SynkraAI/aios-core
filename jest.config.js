module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  // Test patterns from LOCAL (mais específico)
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Ignore patterns - exclude incompatible test frameworks
  testPathIgnorePatterns: [
    '/node_modules/',
    // Playwright e2e tests (use ESM imports, run with Playwright not Jest)
    'tools/quality-dashboard/tests/e2e/',
    // Node.js native test runner tests (use node:test module)
    'tests/installer/v21-path-validation.test.js'
  ],

  // Coverage collection from LOCAL (paths atualizados com Story 4.5.2)
  collectCoverageFrom: [
    'common/**/*.js',
    'aios-core/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],

  // Coverage thresholds from REMOTE (boa prática de qualidade)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage ignore patterns from REMOTE
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/.husky/',
    '/dist/'
  ],

  // Timeout from REMOTE (30s melhor para operações longas)
  testTimeout: 30000,

  // Config from LOCAL
  verbose: true,
  roots: ['<rootDir>'],
  moduleDirectories: ['node_modules', '.'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Cross-platform config from REMOTE
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
