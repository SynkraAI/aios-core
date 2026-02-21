/**
 * Unit tests for FrameworkConfigCheck
 *
 * Tests framework config validation: required configs (.aios-core, .claude),
 * recommended configs (.aios, CLAUDE.md, docs), type checking, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const FrameworkConfigCheck = require('../../../../../.aios-core/core/health-check/checks/project/framework-config');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
  },
}));

describe('FrameworkConfigCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new FrameworkConfigCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.framework-config');
    });

    test('has HIGH severity', () => {
      expect(check.severity).toBe('HIGH');
    });
  });

  describe('execute - all present', () => {
    test('passes when all configs present', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('CLAUDE.md')) {
          return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        }
        return Promise.resolve({ isDirectory: () => true, isFile: () => false });
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('All framework');
    });
  });

  describe('execute - missing required', () => {
    test('fails when .aios-core missing', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.aios-core')) return Promise.reject(new Error('ENOENT'));
        if (p.includes('CLAUDE.md')) return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        return Promise.resolve({ isDirectory: () => true, isFile: () => false });
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('.aios-core');
    });

    test('fails when .claude missing', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.claude') && !p.includes('CLAUDE.md')) return Promise.reject(new Error('ENOENT'));
        if (p.includes('CLAUDE.md')) return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        return Promise.resolve({ isDirectory: () => true, isFile: () => false });
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('.claude');
    });
  });

  describe('execute - missing recommended', () => {
    test('warns when recommended configs missing', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.aios-core') || p.includes('.claude')) {
          if (p.includes('CLAUDE.md') || p.includes('docs') || p.endsWith('.aios')) {
            return Promise.reject(new Error('ENOENT'));
          }
          return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('recommended');
    });
  });

  describe('execute - wrong type', () => {
    test('fails when required path is wrong type', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('.aios-core')) {
          return Promise.resolve({ isDirectory: () => false, isFile: () => true }); // Should be dir
        }
        if (p.includes('CLAUDE.md')) return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        return Promise.resolve({ isDirectory: () => true, isFile: () => false });
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
    });
  });
});
