/**
 * Unit tests for CiConfigCheck
 *
 * Tests CI/CD config detection: GitHub Actions, GitLab CI, Jenkins,
 * workflow YAML validation, tab detection, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const CiConfigCheck = require('../../../../../.aios-core/core/health-check/checks/deployment/ci-config');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('CiConfigCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new CiConfigCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('deployment.ci-config');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - no CI config', () => {
    test('passes when no CI configuration found', async () => {
      fs.stat.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No CI/CD');
    });
  });

  describe('execute - GitHub Actions', () => {
    test('passes with valid GitHub Actions workflows', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.github/workflows')) {
          return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readdir.mockResolvedValue(['ci.yml', 'deploy.yaml']);
      fs.readFile.mockResolvedValue('name: CI\non: push\njobs:\n  test:\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('GitHub Actions');
    });

    test('warns when workflow contains tabs', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.github/workflows')) {
          return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readdir.mockResolvedValue(['ci.yml']);
      fs.readFile.mockResolvedValue('name: CI\n\tsteps:\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('tabs');
    });
  });

  describe('execute - GitLab CI', () => {
    test('passes with GitLab CI file', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.gitlab-ci.yml')) {
          return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('GitLab CI');
    });
  });

  describe('execute - empty workflows dir', () => {
    test('does not report platform for empty dir', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.github/workflows')) {
          return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readdir.mockResolvedValue(['readme.md']);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No CI/CD');
    });
  });
});
