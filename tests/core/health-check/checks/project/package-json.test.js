/**
 * Unit tests for PackageJsonCheck
 *
 * Tests package.json validation: file existence, JSON parsing,
 * required fields, name format validation, and error handling.
 */

const fs = require('fs').promises;
const path = require('path');
const PackageJsonCheck = require('../../../../../.aios-core/core/health-check/checks/project/package-json');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('PackageJsonCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new PackageJsonCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.package-json');
    });

    test('has CRITICAL severity', () => {
      expect(check.severity).toBe('CRITICAL');
    });
  });

  describe('execute - valid package.json', () => {
    test('passes with valid name and version', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-project',
        version: '1.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('valid');
    });

    test('passes with scoped package name', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: '@scope/my-package',
        version: '2.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - missing fields', () => {
    test('warns when name is missing', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('name');
    });

    test('warns when version is missing', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-project',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('version');
    });
  });

  describe('execute - invalid name format', () => {
    test('warns with invalid package name', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'INVALID_NAME',
        version: '1.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Invalid package name');
    });
  });

  describe('execute - file not found', () => {
    test('fails when package.json not found', async () => {
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      fs.access.mockRejectedValue(err);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not found');
    });
  });

  describe('execute - invalid JSON', () => {
    test('fails with invalid JSON', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue('{ invalid json }');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('invalid JSON');
    });
  });

  describe('execute - other errors', () => {
    test('returns error on unexpected failure', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockRejectedValue(new Error('EPERM'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
    });
  });
});
