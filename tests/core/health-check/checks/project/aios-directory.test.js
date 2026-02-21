/**
 * Unit tests for AiosDirectoryCheck
 *
 * Tests .aios directory structure validation: existence, subdirectories,
 * write permissions, healer, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const AiosDirectoryCheck = require('../../../../../.aios-core/core/health-check/checks/project/aios-directory');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
    mkdir: jest.fn(),
  },
}));

describe('AiosDirectoryCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new AiosDirectoryCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.aios-directory');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - not present', () => {
    test('passes when .aios not present', async () => {
      fs.stat.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('not present');
    });
  });

  describe('execute - valid structure', () => {
    test('passes with valid directory structure', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('config.yaml')) {
          return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        }
        return Promise.resolve({ isDirectory: () => true, isFile: () => false });
      });
      fs.writeFile.mockResolvedValue(undefined);
      fs.unlink.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('valid');
    });
  });

  describe('execute - not a directory', () => {
    test('fails when .aios is a file', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.endsWith('.aios')) {
          return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not a directory');
    });
  });

  describe('execute - not writable', () => {
    test('warns when .aios not writable', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true, isFile: () => false });
      fs.writeFile.mockRejectedValue(new Error('EPERM'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('not writable');
    });
  });

  describe('execute - wrong type subdirectory', () => {
    test('warns when subdirectory is wrong type', async () => {
      fs.stat.mockImplementation((p) => {
        if (p.includes('config.yaml')) {
          return Promise.resolve({ isDirectory: () => true, isFile: () => false }); // Should be file
        }
        return Promise.resolve({ isDirectory: () => true, isFile: () => false });
      });
      fs.writeFile.mockResolvedValue(undefined);
      fs.unlink.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('wrong type');
    });
  });

  describe('getHealer', () => {
    test('returns healer with fix function', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('create-directories');
      expect(typeof healer.fix).toBe('function');
    });
  });
});
