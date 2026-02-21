/**
 * Unit tests for IdeDetectionCheck
 *
 * Tests IDE detection: VS Code, JetBrains, Cursor, Claude Code,
 * configuration validation, and no-IDE fallback.
 */

const fs = require('fs').promises;
const IdeDetectionCheck = require('../../../../../.aios-core/core/health-check/checks/local/ide-detection');

jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('IdeDetectionCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new IdeDetectionCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.ide-detection');
    });

    test('has INFO severity', () => {
      expect(check.severity).toBe('INFO');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 0', () => {
      expect(check.healingTier).toBe(0);
    });
  });

  // ============================================================
  // execute - no IDE detected
  // ============================================================
  describe('execute - no IDE', () => {
    test('passes with no IDE detected', async () => {
      fs.stat.mockRejectedValue(new Error('ENOENT'));
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No IDE');
    });
  });

  // ============================================================
  // execute - VS Code detected
  // ============================================================
  describe('execute - VS Code', () => {
    test('passes when VS Code directory found with valid settings', async () => {
      fs.stat.mockImplementation((dirPath) => {
        if (dirPath.includes('.vscode')) return Promise.resolve({ isDirectory: () => true });
        return Promise.reject(new Error('ENOENT'));
      });
      fs.access.mockImplementation((filePath) => {
        if (filePath.includes('settings.json') || filePath.includes('extensions.json')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('{"editor.fontSize": 14}');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('VS Code');
    });

    test('warns when VS Code settings.json has invalid JSON', async () => {
      fs.stat.mockImplementation((dirPath) => {
        if (dirPath.includes('.vscode')) return Promise.resolve({ isDirectory: () => true });
        return Promise.reject(new Error('ENOENT'));
      });
      fs.access.mockImplementation((filePath) => {
        if (filePath.includes('settings.json')) return Promise.resolve();
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('{invalid json}');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('invalid JSON');
    });
  });

  // ============================================================
  // execute - multiple IDEs
  // ============================================================
  describe('execute - multiple IDEs', () => {
    test('detects multiple IDEs', async () => {
      fs.stat.mockImplementation((dirPath) => {
        if (dirPath.includes('.vscode') || dirPath.includes('.idea')) {
          return Promise.resolve({ isDirectory: () => true });
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.access.mockRejectedValue(new Error('ENOENT'));
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('VS Code');
      expect(result.message).toContain('JetBrains');
    });
  });

  // ============================================================
  // execute - Claude Code detected
  // ============================================================
  describe('execute - Claude Code', () => {
    test('detects Claude Code config directory', async () => {
      fs.stat.mockRejectedValue(new Error('ENOENT'));
      fs.access.mockImplementation((filePath) => {
        if (filePath.includes('.claude')) return Promise.resolve();
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('Claude Code');
    });
  });
});
