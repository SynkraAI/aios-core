/**
 * Unit tests for ClaudeCodeCheck
 *
 * Tests Claude Code CLI detection: installation, project config,
 * global config, CLAUDE.md presence, and configuration completeness.
 */

const fs = require('fs').promises;
const os = require('os');
const { execSync } = require('child_process');
const ClaudeCodeCheck = require('../../../../../.aios-core/core/health-check/checks/services/claude-code');

jest.mock('child_process');
jest.mock('os');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
  },
}));

describe('ClaudeCodeCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    os.homedir.mockReturnValue('/home/user');
    check = new ClaudeCodeCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('services.claude-code');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - not using Claude Code', () => {
    test('passes when nothing is detected', async () => {
      execSync.mockImplementation(() => { throw new Error('not found'); });
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('not detected');
    });
  });

  describe('execute - fully configured', () => {
    test('passes with CLI, project config, and global config', async () => {
      execSync.mockReturnValue('1.0.0');
      fs.access.mockResolvedValue(undefined);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('configured');
    });
  });

  describe('execute - warnings', () => {
    test('warns when CLI installed but no project config', async () => {
      execSync.mockReturnValue('1.0.0');
      fs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('incomplete');
    });

    test('warns when project config exists but no CLAUDE.md', async () => {
      execSync.mockImplementation(() => { throw new Error('not found'); });
      fs.access.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('.claude') && !filePath.includes('CLAUDE.md') && !filePath.includes('.claude.json')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('CLAUDE.md');
    });
  });
});
