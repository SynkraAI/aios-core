/**
 * Unit tests for EnvironmentVarsCheck
 *
 * Tests environment variable validation: required vars, recommended vars,
 * AIOS-specific vars, value masking, and result categorization.
 */

const EnvironmentVarsCheck = require('../../../../../.aios-core/core/health-check/checks/local/environment-vars');

describe('EnvironmentVarsCheck', () => {
  let check;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    check = new EnvironmentVarsCheck();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.environment-vars');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 0', () => {
      expect(check.healingTier).toBe(0);
    });
  });

  // ============================================================
  // execute - all vars present
  // ============================================================
  describe('execute - pass', () => {
    test('passes when all required and recommended vars are set', async () => {
      process.env.PATH = '/usr/bin';
      process.env.HOME = '/home/user';
      process.env.USERPROFILE = 'C:\\Users\\user';

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('All required');
    });

    test('includes AIOS vars in details when set', async () => {
      process.env.PATH = '/usr/bin';
      process.env.HOME = '/home/user';
      process.env.USERPROFILE = 'C:\\Users\\user';
      process.env.AIOS_DEBUG = 'true';

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.details.details.aiosVars).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'AIOS_DEBUG' })
        ])
      );
    });
  });

  // ============================================================
  // execute - missing required
  // ============================================================
  describe('execute - fail', () => {
    test('fails when PATH is missing', async () => {
      delete process.env.PATH;
      process.env.HOME = '/home/user';

      const result = await check.execute({});
      expect(result.status).toBe('fail');
      expect(result.message).toContain('PATH');
      expect(result.recommendation).toContain('shell profile');
    });
  });

  // ============================================================
  // execute - missing recommended
  // ============================================================
  describe('execute - warning', () => {
    test('warns when HOME and USERPROFILE are missing', async () => {
      process.env.PATH = '/usr/bin';
      delete process.env.HOME;
      delete process.env.USERPROFILE;

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('recommended');
      expect(result.details.missingRecommended).toContain('HOME');
      expect(result.details.missingRecommended).toContain('USERPROFILE');
    });

    test('warns when only HOME is missing (USERPROFILE set)', async () => {
      process.env.PATH = '/usr/bin';
      delete process.env.HOME;
      process.env.USERPROFILE = 'C:\\Users\\user';

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.details.missingRecommended).toContain('HOME');
      expect(result.details.missingRecommended).not.toContain('USERPROFILE');
    });
  });

  // ============================================================
  // maskValue
  // ============================================================
  describe('maskValue', () => {
    test('masks value keeping first 2 and last 2 chars', () => {
      expect(check.maskValue('abcdefgh')).toBe('ab****gh');
    });

    test('fully masks short values (4 or fewer chars)', () => {
      expect(check.maskValue('abcd')).toBe('****');
      expect(check.maskValue('ab')).toBe('****');
    });

    test('returns empty string for falsy values', () => {
      expect(check.maskValue('')).toBe('');
      expect(check.maskValue(null)).toBe('');
      expect(check.maskValue(undefined)).toBe('');
    });

    test('masks 5-char value correctly', () => {
      expect(check.maskValue('12345')).toBe('12****45');
    });
  });
});
