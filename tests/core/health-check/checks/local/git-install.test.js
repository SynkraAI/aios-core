/**
 * Unit tests for GitInstallCheck
 *
 * Tests git installation verification: version detection, minimum version,
 * user configuration, and healer guide.
 */

const { execSync } = require('child_process');
const GitInstallCheck = require('../../../../../.aios-core/core/health-check/checks/local/git-install');

jest.mock('child_process');

describe('GitInstallCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new GitInstallCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.git-install');
    });

    test('has CRITICAL severity', () => {
      expect(check.severity).toBe('CRITICAL');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 3', () => {
      expect(check.healingTier).toBe(3);
    });
  });

  // ============================================================
  // execute - pass
  // ============================================================
  describe('execute - pass', () => {
    test('passes with git installed and configured', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git --version') return 'git version 2.40.0';
        if (cmd === 'git config user.name') return 'Test User';
        if (cmd === 'git config user.email') return 'test@example.com';
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('2.40.0');
      expect(result.message).toContain('configured');
    });
  });

  // ============================================================
  // execute - warnings
  // ============================================================
  describe('execute - warning', () => {
    test('warns when version below minimum', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git --version') return 'git version 2.15.0';
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('2.15.0');
      expect(result.message).toContain('below recommended');
    });

    test('warns when user.name not configured', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git --version') return 'git version 2.40.0';
        if (cmd === 'git config user.name') throw new Error('not set');
        if (cmd === 'git config user.email') return 'test@example.com';
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('user.name');
    });

    test('warns when user.email not configured', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git --version') return 'git version 2.40.0';
        if (cmd === 'git config user.name') return 'Test User';
        if (cmd === 'git config user.email') throw new Error('not set');
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('user.email');
    });

    test('warns when version cannot be parsed', async () => {
      execSync.mockReturnValue('git version unknown');

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Could not determine');
    });
  });

  // ============================================================
  // execute - fail
  // ============================================================
  describe('execute - fail', () => {
    test('fails when git is not installed', async () => {
      execSync.mockImplementation(() => {
        throw new Error('command not found: git');
      });

      const result = await check.execute({});
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not installed');
      expect(result.recommendation).toContain('git-scm.com');
    });
  });

  // ============================================================
  // compareVersions
  // ============================================================
  describe('compareVersions', () => {
    test('returns 0 for equal versions', () => {
      expect(check.compareVersions('2.20.0', '2.20.0')).toBe(0);
    });

    test('returns -1 when v1 < v2', () => {
      expect(check.compareVersions('2.15.0', '2.20.0')).toBe(-1);
    });

    test('returns 1 when v1 > v2', () => {
      expect(check.compareVersions('2.40.0', '2.20.0')).toBe(1);
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns install guide', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('git-install-guide');
      expect(healer.action).toBe('manual');
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
