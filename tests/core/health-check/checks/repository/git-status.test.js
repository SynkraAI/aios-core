/**
 * Unit tests for GitStatusCheck
 *
 * Tests git working directory status detection: clean state,
 * staged/modified/untracked files, ahead/behind remote, and error handling.
 */

const { execSync } = require('child_process');
const GitStatusCheck = require('../../../../../.aios-core/core/health-check/checks/repository/git-status');

jest.mock('child_process');

describe('GitStatusCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new GitStatusCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.git-status');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });

    test('is not cacheable', () => {
      expect(check.cacheable).toBe(false);
    });

    test('has healingTier 0', () => {
      expect(check.healingTier).toBe(0);
    });
  });

  // ============================================================
  // execute - clean working directory
  // ============================================================
  describe('execute - clean and in sync', () => {
    test('passes when working directory is clean and in sync', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return '';
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('clean and in sync');
    });

    test('uses process.cwd() when no projectRoot provided', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return '';
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      await check.execute({});
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('status --porcelain'),
        expect.objectContaining({ cwd: process.cwd() })
      );
    });
  });

  // ============================================================
  // execute - ahead/behind remote
  // ============================================================
  describe('execute - ahead/behind remote', () => {
    test('warns when ahead of remote', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return '';
        if (cmd.includes('rev-list')) return '3\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('3 commit(s) ahead');
      expect(result.recommendation).toContain('pushing');
    });

    test('warns when behind remote', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return '';
        if (cmd.includes('rev-list')) return '0\t5';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('5 commit(s) behind');
      expect(result.recommendation).toContain('pulling');
    });

    test('handles no upstream configured gracefully', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return '';
        if (cmd.includes('rev-list')) throw new Error('no upstream');
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('clean and in sync');
    });
  });

  // ============================================================
  // execute - has changes
  // ============================================================
  describe('execute - has changes', () => {
    test('warns with staged files', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return 'M  file.js\nA  new.js\n';
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('staged');
      expect(result.recommendation).toContain('Commit or stash');
    });

    test('warns with modified files in worktree', async () => {
      // MM = staged AND modified in worktree
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return 'MM file.js\n';
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.details.modified).toBe(1);
      expect(result.details.staged).toBe(1);
    });

    test('warns with untracked files', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return '?? new-file.js\n?? another.js\n';
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('2 untracked');
    });

    test('includes all change types in message', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return 'M  staged.js\n M modified.js\n?? untracked.js\n';
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('staged');
      expect(result.message).toContain('modified');
      expect(result.message).toContain('untracked');
    });

    test('limits file lists to 5 entries in details', async () => {
      const lines = Array.from({ length: 8 }, (_, i) => `?? file${i}.js`).join('\n');
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('status --porcelain')) return lines;
        if (cmd.includes('rev-list')) return '0\t0';
        return '';
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.details.files.untracked).toHaveLength(5);
    });
  });

  // ============================================================
  // execute - error handling
  // ============================================================
  describe('execute - error handling', () => {
    test('returns error when git status fails', async () => {
      execSync.mockImplementation(() => {
        throw new Error('not a git repository');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('not a git repository');
    });
  });
});
