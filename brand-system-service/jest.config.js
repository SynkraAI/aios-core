/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@bss/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@bss/core$': '<rootDir>/packages/core/src',
    '^@bss/tokens/(.*)$': '<rootDir>/packages/tokens/src/$1',
    '^@bss/tokens$': '<rootDir>/packages/tokens/src',
    '^@bss/creative/(.*)$': '<rootDir>/packages/creative/src/$1',
    '^@bss/creative$': '<rootDir>/packages/creative/src',
    '^@bss/static-generator/(.*)$': '<rootDir>/packages/static-generator/src/$1',
    '^@bss/static-generator$': '<rootDir>/packages/static-generator/src',
    '^@brand-system/ai-service$': '<rootDir>/packages/ai-service/src',
    '^@brand-system/ai-service/(.*)$': '<rootDir>/packages/ai-service/src/$1',
    '^@brand-system/prompts$': '<rootDir>/packages/prompts/src',
    '^@brand-system/prompts/(.*)$': '<rootDir>/packages/prompts/src/$1',
    '^@brand-system/quality$': '<rootDir>/packages/quality/src',
    '^@brand-system/quality/(.*)$': '<rootDir>/packages/quality/src/$1',
    '^@brand-system/cost$': '<rootDir>/packages/cost/src',
    '^@brand-system/cost/(.*)$': '<rootDir>/packages/cost/src/$1',
    '^@brand-system/moderation$': '<rootDir>/packages/moderation/src',
    '^@brand-system/moderation/(.*)$': '<rootDir>/packages/moderation/src/$1',
    '^@brand-system/copy-pipeline$': '<rootDir>/packages/copy-pipeline/src',
    '^@brand-system/copy-pipeline/(.*)$': '<rootDir>/packages/copy-pipeline/src/$1',
    '^@brand-system/onboarding$': '<rootDir>/packages/onboarding/src',
    '^@brand-system/onboarding/(.*)$': '<rootDir>/packages/onboarding/src/$1',
    '^@anthropic-ai/sdk$': '<rootDir>/packages/ai-service/src/__mocks__/anthropic-sdk.ts',
    '^openai$': '<rootDir>/packages/ai-service/src/__mocks__/openai-sdk.ts',
    '^replicate$': '<rootDir>/packages/ai-service/src/__mocks__/replicate-sdk.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowJs: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          skipLibCheck: true,
          jsx: 'react-jsx',
        },
      },
    ],
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/index.ts',
  ],
};

module.exports = config;
