/**
 * Unit tests for GeminiCliCheck
 *
 * Tests Gemini CLI detection: installation, version, authentication,
 * project config, global config, hooks, preview features, extensions,
 * AIOS agents, and edge cases.
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const GeminiCliCheck = require('../../../../../.aios-core/core/health-check/checks/services/gemini-cli');

jest.mock('child_process');
jest.mock('os');
jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

describe('GeminiCliCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    os.homedir.mockReturnValue('/home/user');
    path.join.mockImplementation((...args) => args.join('/'));
    check = new GeminiCliCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('services.gemini-cli');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - not detected', () => {
    test('passes when gemini not installed and no config', async () => {
      execSync.mockImplementation(() => { throw new Error('not found'); });
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('not detected');
    });
  });

  describe('execute - installed and configured', () => {
    test('passes with full configuration', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) return '1.2.3';
        if (cmd.includes('auth status')) return 'Authenticated';
        if (cmd.includes('extensions list')) return JSON.stringify([{ name: 'ext1' }]);
        throw new Error('unknown');
      });

      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('settings.json') && filePath.includes('/project/')) {
          return Promise.resolve(JSON.stringify({
            hooks: { presubmit: {} },
            previewFeatures: true,
          }));
        }
        if (filePath.includes('settings.json') && filePath.includes('/home/')) {
          return Promise.resolve(JSON.stringify({ previewFeatures: true }));
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readdir.mockResolvedValue(['dev.md', 'qa.md', 'readme.txt']);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('1.2.3');
      expect(result.message).toContain('authenticated');
    });
  });

  describe('execute - installed but not authenticated', () => {
    test('warns when not authenticated', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) return '1.0.0';
        if (cmd.includes('auth status')) return 'not authenticated';
        throw new Error('unknown');
      });

      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockRejectedValue(new Error('ENOENT'));
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Not authenticated');
    });
  });

  describe('execute - missing project config', () => {
    test('warns when no project .gemini directory', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) return '1.0.0';
        if (cmd.includes('auth status')) return 'Authenticated';
        throw new Error('unknown');
      });

      fs.access.mockImplementation((p) => {
        if (p.includes('/project/')) return Promise.reject(new Error('ENOENT'));
        return Promise.resolve(undefined);
      });
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('No project-level');
    });
  });

  describe('execute - no rules.md', () => {
    test('warns when project config exists but no rules.md', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) return '1.0.0';
        if (cmd.includes('auth status')) return 'Authenticated';
        throw new Error('unknown');
      });

      let callCount = 0;
      fs.access.mockImplementation((p) => {
        if (p.includes('rules.md')) return Promise.reject(new Error('ENOENT'));
        return Promise.resolve(undefined);
      });
      fs.readFile.mockRejectedValue(new Error('ENOENT'));
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
    });
  });

  describe('execute - auth status throws', () => {
    test('marks not authenticated when auth command throws', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) return '1.0.0';
        throw new Error('command failed');
      });

      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockRejectedValue(new Error('ENOENT'));
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Not authenticated');
    });
  });

  describe('execute - extensions command fails', () => {
    test('handles extensions command failure gracefully', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) return '1.0.0';
        if (cmd.includes('auth status')) return 'Authenticated';
        if (cmd.includes('extensions')) throw new Error('not supported');
        throw new Error('unknown');
      });

      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
    });
  });
});
