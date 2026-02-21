/**
 * Unit tests for DeploymentReadinessCheck
 *
 * Tests deployment readiness: package.json, version, scripts,
 * README, LICENSE, scoring, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const DeploymentReadinessCheck = require('../../../../../.aios-core/core/health-check/checks/deployment/deployment-readiness');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('DeploymentReadinessCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new DeploymentReadinessCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('deployment.readiness');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - fully ready', () => {
    test('passes with all checks passing', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-app',
        version: '1.0.0',
        main: 'index.js',
        scripts: { start: 'node .', build: 'tsc' },
      }));
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('ready');
    });
  });

  describe('execute - missing package.json', () => {
    test('fails when package.json not found', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
    });
  });

  describe('execute - version issues', () => {
    test('fails with version 0.0.0', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-app',
        version: '0.0.0',
        scripts: { start: 'node .' },
      }));
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('version');
    });
  });

  describe('execute - no scripts', () => {
    test('fails without start or build script', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-app',
        version: '1.0.0',
        scripts: { test: 'jest' },
      }));
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('entry script');
    });
  });

  describe('execute - warnings', () => {
    test('warns with missing README and LICENSE', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-app',
        version: '1.0.0',
        main: 'index.js',
        scripts: { start: 'node .' },
      }));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('warning');
    });
  });

  describe('execute - no main field', () => {
    test('still passes without main field (just a warn check)', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-app',
        version: '1.0.0',
        scripts: { start: 'node .' },
      }));
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      // No main is a "warn" check, not a fail
      expect(['pass', 'warning']).toContain(result.status);
    });
  });
});
