/**
 * Unit tests for PackageJsonCheck
 *
 * Tests the package.json health check: file existence,
 * JSON validity, required fields, name format validation.
 */

const fs = require('fs').promises;
const PackageJsonCheck = require('../../../../../.aios-core/core/health-check/checks/project/package-json');

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
    check = new PackageJsonCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.package-json');
    });

    test('has CRITICAL severity', () => {
      expect(check.severity).toBe('CRITICAL');
    });

    test('is in PROJECT domain', () => {
      expect(check.domain).toBe('project');
    });

    test('has relevant tags', () => {
      expect(check.tags).toContain('npm');
      expect(check.tags).toContain('required');
    });
  });

  // ============================================================
  // execute - valid package.json
  // ============================================================
  describe('execute - valid', () => {
    test('passes for valid package.json', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-project',
        version: '1.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.details.details.name).toBe('my-project');
    });

    test('passes for scoped package name', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: '@synkra/aios-core',
        version: '2.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });

    test('uses process.cwd when no projectRoot', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
      }));

      const result = await check.execute({});
      expect(result.status).toBe('pass');
    });
  });

  // ============================================================
  // execute - warnings (field issues)
  // ============================================================
  describe('execute - warnings', () => {
    test('warns when name is missing', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Missing "name"');
    });

    test('warns when version is missing', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'my-project',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Missing "version"');
    });

    test('warns for invalid package name format', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({
        name: 'INVALID NAME!',
        version: '1.0.0',
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Invalid package name');
    });

    test('warns for multiple issues', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify({}));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.details.issues.length).toBeGreaterThan(1);
    });
  });

  // ============================================================
  // execute - failures
  // ============================================================
  describe('execute - failures', () => {
    test('fails when package.json not found', async () => {
      const error = new Error('ENOENT');
      error.code = 'ENOENT';
      fs.access.mockRejectedValue(error);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not found');
      expect(result.recommendation).toContain('npm init');
    });

    test('fails for invalid JSON', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue('{ invalid json }');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('invalid JSON');
    });
  });

  // ============================================================
  // execute - errors
  // ============================================================
  describe('execute - errors', () => {
    test('returns error for unexpected failures', async () => {
      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockRejectedValue(new Error('Permission denied'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Permission denied');
    });
  });
});
