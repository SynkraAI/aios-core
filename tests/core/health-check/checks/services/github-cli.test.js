/**
 * Unit tests for GithubCliCheck
 *
 * Tests GitHub CLI detection: installation, version parsing,
 * authentication status, username extraction, and edge cases.
 */

const { execSync } = require('child_process');
const GithubCliCheck = require('../../../../../.aios-core/core/health-check/checks/services/github-cli');

jest.mock('child_process');

describe('GithubCliCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new GithubCliCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('services.github-cli');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - not installed', () => {
    test('passes when gh is not installed', async () => {
      execSync.mockImplementation(() => {
        throw new Error('command not found');
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('not installed');
    });
  });

  describe('execute - installed and authenticated', () => {
    test('passes with version and username', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) {
          return 'gh version 2.45.0 (2024-03-15)\n';
        }
        if (cmd.includes('auth status')) {
          return 'Logged in to github.com as nikolasdehor';
        }
        throw new Error('unknown');
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('2.45.0');
      expect(result.message).toContain('nikolasdehor');
    });

    test('passes with unknown version format', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) {
          return 'gh custom build\n';
        }
        if (cmd.includes('auth status')) {
          return 'Logged in to github.com as user1';
        }
        throw new Error('unknown');
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('unknown');
    });
  });

  describe('execute - installed but not authenticated', () => {
    test('warns when not authenticated', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) {
          return 'gh version 2.45.0 (2024-03-15)\n';
        }
        if (cmd.includes('auth status')) {
          throw new Error('not logged in');
        }
        throw new Error('unknown');
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('not authenticated');
      expect(result.message).toContain('2.45.0');
    });
  });

  describe('execute - no username match', () => {
    test('passes with fallback user text', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('--version')) {
          return 'gh version 2.45.0\n';
        }
        if (cmd.includes('auth status')) {
          return 'authenticated via token';
        }
        throw new Error('unknown');
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('user');
    });
  });

  describe('getHealer', () => {
    test('returns manual guide with documentation', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('manual');
      expect(healer.documentation).toBeDefined();
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
