/**
 * Unit tests for DependenciesCheck
 *
 * Tests dependency validation: package.json reading, node_modules check,
 * required deps, installed deps, missing deps, and healer.
 */

const fs = require('fs').promises;
const path = require('path');
const DependenciesCheck = require('../../../../../.aios-core/core/health-check/checks/project/dependencies');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('DependenciesCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new DependenciesCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.dependencies');
    });

    test('has HIGH severity', () => {
      expect(check.severity).toBe('HIGH');
    });
  });

  describe('execute - all installed', () => {
    test('passes when all dependencies installed', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: { 'js-yaml': '^4.0.0', express: '^4.18.0' },
        devDependencies: { jest: '^30.0.0' },
      }));
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('3');
    });
  });

  describe('execute - node_modules missing', () => {
    test('fails when node_modules not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: { 'js-yaml': '^4.0.0' },
      }));
      fs.access.mockImplementation((p) => {
        if (p.includes('node_modules')) return Promise.reject(new Error('ENOENT'));
        return Promise.resolve(undefined);
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('node_modules');
    });
  });

  describe('execute - missing required deps', () => {
    test('warns when js-yaml not in package.json', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: { express: '^4.18.0' },
      }));
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('js-yaml');
    });
  });

  describe('execute - deps not installed', () => {
    test('fails when listed deps not in node_modules', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: { 'js-yaml': '^4.0.0', 'missing-pkg': '^1.0.0' },
      }));
      fs.access.mockImplementation((p) => {
        if (p.includes('missing-pkg')) return Promise.reject(new Error('ENOENT'));
        return Promise.resolve(undefined);
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not installed');
    });
  });

  describe('execute - package.json not found', () => {
    test('fails when package.json missing', async () => {
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      fs.readFile.mockRejectedValue(err);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('package.json');
    });
  });

  describe('execute - unexpected error', () => {
    test('returns error on unexpected failure', async () => {
      fs.readFile.mockRejectedValue(new Error('EPERM'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
    });
  });

  describe('getHealer', () => {
    test('returns healer with fix function', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('install-dependencies');
      expect(typeof healer.fix).toBe('function');
    });
  });
});
