/**
 * Unit tests for GitRepoCheck
 *
 * Tests git repository validation: .git directory, branch/remote detection,
 * commit count, URL sanitization, and healer configuration.
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const GitRepoCheck = require('../../../../../.aios-core/core/health-check/checks/repository/git-repo');

jest.mock('child_process');
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
  },
}));

describe('GitRepoCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new GitRepoCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.git-repo');
    });

    test('has CRITICAL severity', () => {
      expect(check.severity).toBe('CRITICAL');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 2', () => {
      expect(check.healingTier).toBe(2);
    });
  });

  // ============================================================
  // execute - valid repo
  // ============================================================
  describe('execute - pass', () => {
    test('passes for valid git repo with remote and commits', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse --git-dir')) return '.git\n';
        if (cmd.includes('rev-parse --abbrev-ref')) return 'main\n';
        if (cmd.includes('remote get-url')) return 'https://github.com/user/repo.git\n';
        if (cmd.includes('rev-list --count')) return '42\n';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('main');
    });
  });

  // ============================================================
  // execute - warnings
  // ============================================================
  describe('execute - warning', () => {
    test('warns when no remote configured', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse --git-dir')) return '.git\n';
        if (cmd.includes('rev-parse --abbrev-ref')) return 'main\n';
        if (cmd.includes('remote get-url')) throw new Error('No remote');
        if (cmd.includes('rev-list --count')) return '5\n';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('no remote');
      expect(result.recommendation).toContain('git remote add');
    });

    test('warns when no commits exist', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse --git-dir')) return '.git\n';
        if (cmd.includes('rev-parse --abbrev-ref')) throw new Error('no commits');
        if (cmd.includes('remote get-url')) return 'https://github.com/user/repo.git\n';
        if (cmd.includes('rev-list --count')) throw new Error('no commits');
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('no commits');
    });
  });

  // ============================================================
  // execute - fail
  // ============================================================
  describe('execute - fail', () => {
    test('fails when .git does not exist', async () => {
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      fs.stat.mockRejectedValue(err);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('Not a Git repository');
      expect(result.recommendation).toContain('git init');
    });

    test('fails when .git is not a directory', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => false });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not a directory');
    });
  });

  // ============================================================
  // execute - error
  // ============================================================
  describe('execute - error', () => {
    test('returns error on unexpected failure', async () => {
      fs.stat.mockRejectedValue(new Error('Permission denied'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Git check failed');
    });
  });

  // ============================================================
  // sanitizeUrl
  // ============================================================
  describe('sanitizeUrl', () => {
    test('removes credentials from URL', () => {
      expect(check.sanitizeUrl('https://user:token@github.com/repo.git'))
        .toBe('https://github.com/repo.git');
    });

    test('leaves clean URL unchanged', () => {
      expect(check.sanitizeUrl('https://github.com/repo.git'))
        .toBe('https://github.com/repo.git');
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns git init healer', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('git-init');
      expect(healer.action).toBe('initialize-git');
      expect(healer.risk).toBe('low');
      expect(typeof healer.fix).toBe('function');
    });
  });
});
