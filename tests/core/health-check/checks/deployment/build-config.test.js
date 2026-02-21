/**
 * Unit tests for BuildConfigCheck
 *
 * Tests build configuration detection: package.json scripts,
 * build tool config files, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const BuildConfigCheck = require('../../../../../.aios-core/core/health-check/checks/deployment/build-config');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('BuildConfigCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new BuildConfigCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('deployment.build-config');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - with scripts and configs', () => {
    test('passes with build and test scripts', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        scripts: { build: 'tsc', start: 'node .',  test: 'jest', lint: 'eslint .' },
      }));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('build script');
    });
  });

  describe('execute - no scripts', () => {
    test('warns when no build or start script', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ scripts: { test: 'jest' } }));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('No build or start');
    });
  });

  describe('execute - no config found', () => {
    test('passes with simple project message', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ scripts: { build: 'tsc' } }));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - package.json read error', () => {
    test('warns when package.json unreadable', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('package.json');
    });
  });

  describe('execute - build tool detected', () => {
    test('passes with TypeScript config', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ scripts: { build: 'tsc' } }));
      fs.access.mockImplementation((p) => {
        if (p.includes('tsconfig.json')) return Promise.resolve(undefined);
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('TypeScript');
    });
  });
});
