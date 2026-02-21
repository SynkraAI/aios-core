/**
 * Unit tests for LargeFilesCheck
 *
 * Tests large file detection: git ls-files scanning, size thresholds
 * (5MB warning, 50MB error), formatSize utility, and edge cases.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const LargeFilesCheck = require('../../../../../.aios-core/core/health-check/checks/repository/large-files');

jest.mock('child_process');
jest.mock('fs');
jest.mock('path');

describe('LargeFilesCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new LargeFilesCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.large-files');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - no large files', () => {
    test('passes when no files exceed threshold', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git ls-files -z') {
          return 'small.js\0readme.md\0';
        }
        return '100644 abc123 0\tfile';
      });

      fs.statSync.mockReturnValue({ size: 1024 }); // 1KB

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No unusually large files');
    });

    test('passes when git ls-files returns empty', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git ls-files -z') {
          return '';
        }
        throw new Error('no files');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - warning (5MB+)', () => {
    test('warns when files exceed 5MB', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git ls-files -z') {
          return 'big-asset.zip\0';
        }
        return '100644 abc123 0\tfile';
      });

      fs.statSync.mockReturnValue({ size: 10 * 1024 * 1024 }); // 10MB

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('1 large file');
    });
  });

  describe('execute - fail (50MB+)', () => {
    test('fails when files exceed 50MB', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git ls-files -z') {
          return 'huge-binary.bin\0';
        }
        return '100644 abc123 0\tfile';
      });

      fs.statSync.mockReturnValue({ size: 60 * 1024 * 1024 }); // 60MB

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('very large file');
    });
  });

  describe('execute - mixed sizes', () => {
    test('reports both very large and large files', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git ls-files -z') {
          return 'huge.bin\0medium.zip\0small.js\0';
        }
        return '100644 abc123 0\tfile';
      });

      fs.statSync.mockImplementation((filePath) => {
        if (filePath.includes('huge.bin')) return { size: 60 * 1024 * 1024 };
        if (filePath.includes('medium.zip')) return { size: 10 * 1024 * 1024 };
        return { size: 1024 };
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.details.veryLarge).toHaveLength(1);
      expect(result.details.large).toHaveLength(1);
    });
  });

  describe('execute - stat errors', () => {
    test('skips files that cannot be stat-ed', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git ls-files -z') {
          return 'deleted.js\0';
        }
        return '100644 abc123 0\tfile';
      });

      fs.statSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - git command fails', () => {
    test('passes when git ls-files fails', async () => {
      execSync.mockImplementation(() => {
        throw new Error('not a git repo');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('formatSize', () => {
    test('formats bytes', () => {
      expect(check.formatSize(500)).toBe('500 B');
    });

    test('formats kilobytes', () => {
      expect(check.formatSize(2048)).toBe('2.0 KB');
    });

    test('formats megabytes', () => {
      expect(check.formatSize(5 * 1024 * 1024)).toBe('5.0 MB');
    });

    test('formats gigabytes', () => {
      expect(check.formatSize(2 * 1024 * 1024 * 1024)).toBe('2.0 GB');
    });
  });

  describe('getHealer', () => {
    test('returns manual guide with warning', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('manual');
      expect(healer.warning).toBeDefined();
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
