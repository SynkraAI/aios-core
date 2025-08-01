/**
 * Jest configuration for meta-agent unit tests
 */

module.exports = {
  displayName: 'meta-agent-unit-tests',
  testEnvironment: 'node',
  rootDir: '../../..',
  testMatch: [
    '<rootDir>/tests/unit/meta-agent/**/*.test.js'
  ],
  collectCoverageFrom: [
    '<rootDir>/aios-core/utils/template-engine.js',
    '<rootDir>/aios-core/utils/elicitation-engine.js',
    '<rootDir>/aios-core/utils/component-generator.js',
    '<rootDir>/aios-core/utils/transaction-manager.js',
    '<rootDir>/aios-core/utils/component-preview.js',
    '<rootDir>/aios-core/utils/manifest-preview.js',
    '<rootDir>/aios-core/utils/batch-creator.js',
    '<rootDir>/aios-core/utils/dependency-analyzer.js',
    '<rootDir>/aios-core/utils/component-metadata.js',
    '<rootDir>/aios-core/utils/component-search.js',
    '<rootDir>/aios-core/utils/usage-analytics.js',
    '<rootDir>/aios-core/utils/rollback-handler.js'
  ],
  coverageDirectory: '<rootDir>/coverage/meta-agent',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/aios-core/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/meta-agent/setup.js'],
  verbose: true
};