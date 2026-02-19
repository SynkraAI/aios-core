/**
 * Unit tests for NpmInstallCheck
 *
 * Tests npm installation verification: version detection, minimum version,
 * registry connectivity, and healer guide.
 */

const { execSync } = require('child_process');
const NpmInstallCheck = require('../../../../../.aios-core/core/health-check/checks/local/npm-install');

jest.mock('child_process');

describe('NpmInstallCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new NpmInstallCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.npm-install');
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
    test('passes with npm installed and registry reachable', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'npm --version') return '10.2.0';
        if (cmd.includes('npm ping')) return '';
        if (cmd.includes('npm config get registry')) return 'https://registry.npmjs.org/';
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('10.2.0');
      expect(result.message).toContain('working');
    });
  });

  // ============================================================
  // execute - warnings
  // ============================================================
  describe('execute - warning', () => {
    test('warns when version below minimum', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'npm --version') return '7.24.0';
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('7.24.0');
      expect(result.message).toContain('below recommended');
    });

    test('warns when registry is unreachable', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'npm --version') return '10.2.0';
        if (cmd.includes('npm ping')) throw new Error('registry unreachable');
        return '';
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('registry unreachable');
    });
  });

  // ============================================================
  // execute - fail
  // ============================================================
  describe('execute - fail', () => {
    test('fails when npm is not installed', async () => {
      execSync.mockImplementation(() => {
        throw new Error('command not found: npm');
      });

      const result = await check.execute({});
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not installed');
      expect(result.recommendation).toContain('nodejs.org');
    });
  });

  // ============================================================
  // compareVersions
  // ============================================================
  describe('compareVersions', () => {
    test('returns 0 for equal versions', () => {
      expect(check.compareVersions('8.0.0', '8.0.0')).toBe(0);
    });

    test('returns -1 when v1 < v2', () => {
      expect(check.compareVersions('7.0.0', '8.0.0')).toBe(-1);
    });

    test('returns 1 when v1 > v2', () => {
      expect(check.compareVersions('10.0.0', '8.0.0')).toBe(1);
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns install guide', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('npm-install-guide');
      expect(healer.action).toBe('manual');
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
