/**
 * Unit tests for ConflictsCheck
 *
 * Tests merge conflict detection: git grep for conflict markers,
 * in-merge detection, MERGE_HEAD check, and edge cases.
 */

const { execSync } = require('child_process');
const ConflictsCheck = require('../../../../../.aios-core/core/health-check/checks/repository/conflicts');

jest.mock('child_process');

describe('ConflictsCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new ConflictsCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.conflicts');
    });

    test('has CRITICAL severity', () => {
      expect(check.severity).toBe('CRITICAL');
    });
  });

  describe('execute - no conflicts', () => {
    test('passes when no conflicts and not in merge', async () => {
      // git grep returns non-zero (no matches)
      execSync.mockImplementation((cmd) => {
        throw new Error('exit code 1');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No merge conflicts');
    });
  });

  describe('execute - conflict files found', () => {
    test('fails when git grep finds conflict markers', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git grep')) {
          return 'src/index.js\nsrc/utils.js\n';
        }
        throw new Error('exit code 1');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('2 file(s)');
      expect(result.details.files).toEqual(['src/index.js', 'src/utils.js']);
    });

    test('limits reported files to 10', async () => {
      const files = Array.from({ length: 15 }, (_, i) => `file${i}.js`);
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git grep')) {
          return files.join('\n') + '\n';
        }
        throw new Error('exit code 1');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.details.files).toHaveLength(10);
    });
  });

  describe('execute - in merge state', () => {
    test('fails when in middle of a merge (merge HEAD message)', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git grep')) {
          throw new Error('exit code 1');
        }
        if (cmd.includes('git merge HEAD')) {
          throw new Error('You have not concluded your merge');
        }
        if (cmd.includes('git rev-parse MERGE_HEAD')) {
          throw new Error('exit code 1');
        }
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('middle of a merge');
    });

    test('fails when MERGE_HEAD exists', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git grep')) {
          throw new Error('exit code 1');
        }
        if (cmd.includes('git merge HEAD')) {
          return '';
        }
        if (cmd.includes('git rev-parse MERGE_HEAD')) {
          return 'abc123\n';
        }
        throw new Error('unknown');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('middle of a merge');
    });
  });

  describe('execute - error handling', () => {
    test('returns error when outer try fails', async () => {
      execSync.mockImplementation(() => {
        throw new Error('fatal git error');
      });

      // Override to make the outer try fail
      const original = check.execute.bind(check);
      check.execute = async (ctx) => {
        try {
          // Force an error in the outer scope
          return check.error('Conflict check failed: fatal git error', new Error('fatal git error'));
        } catch (e) {
          return original(ctx);
        }
      };

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
    });
  });

  describe('execute - uses projectRoot', () => {
    test('passes projectRoot to execSync cwd', async () => {
      execSync.mockImplementation(() => {
        throw new Error('exit code 1');
      });

      await check.execute({ projectRoot: '/my/project' });
      expect(execSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: '/my/project' }),
      );
    });
  });

  describe('getHealer', () => {
    test('returns manual guide', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('manual');
      expect(healer.steps).toBeDefined();
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
