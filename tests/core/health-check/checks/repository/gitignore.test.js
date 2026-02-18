/**
 * Unit tests for GitignoreCheck
 *
 * Tests .gitignore validation: required patterns, recommended patterns,
 * pattern matching variants, and healer configuration.
 */

const fs = require('fs').promises;
const GitignoreCheck = require('../../../../../.aios-core/core/health-check/checks/repository/gitignore');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('GitignoreCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new GitignoreCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('repository.gitignore');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 1', () => {
      expect(check.healingTier).toBe(1);
    });
  });

  // ============================================================
  // execute - pass
  // ============================================================
  describe('execute - pass', () => {
    test('passes with all required and recommended patterns', async () => {
      const gitignore = [
        'node_modules',
        '.env',
        '.env.local',
        '.DS_Store',
        '*.log',
        'dist',
        'coverage',
      ].join('\n');
      fs.readFile.mockResolvedValue(gitignore);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('7 patterns');
    });
  });

  // ============================================================
  // execute - fail (missing required)
  // ============================================================
  describe('execute - fail', () => {
    test('fails when .gitignore not found', async () => {
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      fs.readFile.mockRejectedValue(err);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('not found');
    });

    test('fails when required pattern node_modules is missing', async () => {
      fs.readFile.mockResolvedValue('.env\n*.log\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('node_modules');
    });

    test('fails when required pattern .env is missing', async () => {
      fs.readFile.mockResolvedValue('node_modules\n*.log\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('.env');
    });
  });

  // ============================================================
  // execute - warning (missing recommended)
  // ============================================================
  describe('execute - warning', () => {
    test('warns when recommended patterns are missing', async () => {
      fs.readFile.mockResolvedValue('node_modules\n.env\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('recommended');
    });
  });

  // ============================================================
  // hasPattern
  // ============================================================
  describe('hasPattern', () => {
    test('matches direct pattern', () => {
      const patterns = new Set(['node_modules']);
      expect(check.hasPattern(patterns, 'node_modules')).toBe(true);
    });

    test('matches with leading slash', () => {
      const patterns = new Set(['/node_modules']);
      expect(check.hasPattern(patterns, 'node_modules')).toBe(true);
    });

    test('matches with trailing slash', () => {
      const patterns = new Set(['node_modules/']);
      expect(check.hasPattern(patterns, 'node_modules')).toBe(true);
    });

    test('matches with ** prefix', () => {
      const patterns = new Set(['**/node_modules']);
      expect(check.hasPattern(patterns, 'node_modules')).toBe(true);
    });

    test('returns false for missing pattern', () => {
      const patterns = new Set(['dist']);
      expect(check.hasPattern(patterns, 'node_modules')).toBe(false);
    });
  });

  // ============================================================
  // execute - comments and empty lines ignored
  // ============================================================
  describe('execute - filtering', () => {
    test('ignores comments and empty lines', async () => {
      const gitignore = '# Dependencies\nnode_modules\n\n# Environment\n.env\n.env.local\n.DS_Store\n*.log\ndist\ncoverage\n';
      fs.readFile.mockResolvedValue(gitignore);

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns gitignore update healer', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('add-gitignore-patterns');
      expect(healer.action).toBe('update-gitignore');
      expect(healer.targetFile).toBe('.gitignore');
      expect(typeof healer.fix).toBe('function');
    });
  });
});
