/**
 * Unit tests for BranchProtectionCheck
 *
 * Tests branch protection detection: current branch, protected branches,
 * main branch detection, branch counting, and error handling.
 */

const { execSync } = require('child_process');
const BranchProtectionCheck = require('../../../../../.aios-core/core/health-check/checks/repository/branch-protection');

jest.mock('child_process');

describe('BranchProtectionCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new BranchProtectionCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.branch-protection');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - on feature branch', () => {
    test('passes when on feature branch with main', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse')) return 'feat/my-feature\n';
        if (cmd.includes('branch -a')) return '  main\n* feat/my-feature\n  remotes/origin/main\n';
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('feat/my-feature');
      expect(result.message).toContain('main');
    });
  });

  describe('execute - on protected branch', () => {
    test('warns when on main', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse')) return 'main\n';
        if (cmd.includes('branch -a')) return '* main\n  feat/test\n';
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('main');
    });

    test('warns when on master', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse')) return 'master\n';
        if (cmd.includes('branch -a')) return '* master\n';
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
    });

    test('warns when on develop', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse')) return 'develop\n';
        if (cmd.includes('branch -a')) return '* develop\n  main\n';
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
    });
  });

  describe('execute - no main branch', () => {
    test('warns when no standard main branch found', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse')) return 'feature\n';
        if (cmd.includes('branch -a')) return '* feature\n  other\n';
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('No standard main branch');
    });
  });

  describe('execute - error', () => {
    test('returns error when git fails', async () => {
      execSync.mockImplementation(() => {
        throw new Error('not a git repo');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
    });
  });

  describe('execute - filters HEAD pointer', () => {
    test('filters out HEAD -> entries', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse')) return 'feat/x\n';
        if (cmd.includes('branch -a')) return '  main\n* feat/x\n  remotes/origin/HEAD -> origin/main\n  remotes/origin/main\n';
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });
});
