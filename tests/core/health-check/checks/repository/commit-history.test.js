/**
 * Unit tests for CommitHistoryCheck
 *
 * Tests commit history quality analysis: conventional commit detection,
 * message length checks, warning thresholds, and edge cases.
 */

const { execSync } = require('child_process');
const CommitHistoryCheck = require('../../../../../.aios-core/core/health-check/checks/repository/commit-history');

jest.mock('child_process');

describe('CommitHistoryCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new CommitHistoryCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.commit-history');
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
  // execute - healthy commits
  // ============================================================
  describe('execute - pass', () => {
    test('passes with mostly conventional commits', async () => {
      const commits = [
        'abc1234 feat: add new feature',
        'abc1235 fix: resolve bug in parser',
        'abc1236 docs: update readme',
        'abc1237 test: add unit tests',
        'abc1238 chore: update dependencies',
        'abc1239 refactor: simplify logic',
      ].join('\n');
      execSync.mockReturnValue(commits);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('100%');
    });

    test('passes with no commits yet', async () => {
      execSync.mockReturnValue('');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No commits');
    });

    test('passes when error says no commits', async () => {
      execSync.mockImplementation(() => {
        throw new Error('does not have any commits yet');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  // ============================================================
  // execute - warnings
  // ============================================================
  describe('execute - warning', () => {
    test('warns when conventional commit usage below 50%', async () => {
      const commits = [
        'abc1234 fix something',
        'abc1235 update stuff',
        'abc1236 more changes',
        'abc1237 another fix',
        'abc1238 feat: one conventional',
        'abc1239 cleanup code',
      ].join('\n');
      execSync.mockReturnValue(commits);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Low conventional');
    });

    test('warns when many commits have short messages', async () => {
      const commits = [
        'abc1234 fix',
        'abc1235 up',
        'abc1236 wip',
        'abc1237 fix',
        'abc1238 feat: add feature with proper message',
        'abc1239 fix: resolve issue properly',
        'abc1240 done',
        'abc1241 test',
        'abc1242 ok',
        'abc1243 feat: another proper message here',
      ].join('\n');
      execSync.mockReturnValue(commits);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('short messages');
    });
  });

  // ============================================================
  // execute - error handling
  // ============================================================
  describe('execute - error', () => {
    test('returns error when git log fails', async () => {
      execSync.mockImplementation(() => {
        throw new Error('fatal: not a git repository');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Commit history check failed');
    });
  });

  // ============================================================
  // execute - details
  // ============================================================
  describe('execute - details', () => {
    test('includes recent commits in details (max 5)', async () => {
      const commits = Array.from({ length: 10 }, (_, i) =>
        `abc123${i} feat: commit number ${i}`
      ).join('\n');
      execSync.mockReturnValue(commits);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.details.details.analyzed).toBe(10);
      expect(result.details.details.recentCommits).toHaveLength(5);
    });

    test('uses process.cwd() when no projectRoot', async () => {
      execSync.mockReturnValue('abc1234 feat: initial commit');

      await check.execute({});
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git log'),
        expect.objectContaining({ cwd: process.cwd() })
      );
    });
  });
});
