'use strict';

const path = require('path');
const {
  validateWrite,
  isWriteAllowed,
  normalizePath,
  checkTraversalPatterns,
  checkDenyList,
  getDenyList,
  WRITE_DENY_LIST,
} = require('../path-guard');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

describe('path-guard (CORE-SU.A3)', () => {
  describe('normalizePath()', () => {
    it('returns absolute path for relative input', () => {
      const result = normalizePath('scripts/foo.js', PROJECT_ROOT);
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toBe(path.resolve(PROJECT_ROOT, 'scripts/foo.js'));
    });

    it('resolves .. segments', () => {
      expect(normalizePath('scripts/../package.json', PROJECT_ROOT)).toBe(
        path.resolve(PROJECT_ROOT, 'package.json'),
      );
    });

    it('throws TypeError for non-string', () => {
      expect(() => normalizePath(null)).toThrow(TypeError);
    });
  });

  describe('checkTraversalPatterns()', () => {
    it('detects ../ and null byte and encoded ..', () => {
      expect(checkTraversalPatterns('../secret').traversal).toBe(true);
      expect(checkTraversalPatterns('file\x00.txt').traversal).toBe(true);
      expect(checkTraversalPatterns('%2e%2e/secret').traversal).toBe(true);
    });

    it('allows clean relative paths', () => {
      expect(checkTraversalPatterns('packages/foo/bar.js').traversal).toBe(false);
    });
  });

  describe('checkDenyList()', () => {
    it('blocks constitution and .git', () => {
      const constitution = path.join(PROJECT_ROOT, '.aiox-core/constitution.md');
      expect(checkDenyList(constitution, PROJECT_ROOT).denied).toBe(true);

      const gitObj = path.join(PROJECT_ROOT, '.git/config');
      expect(checkDenyList(gitObj, PROJECT_ROOT).denied).toBe(true);
    });

    it('blocks .env variants by basename', () => {
      const env = path.join(PROJECT_ROOT, '.env.secrets');
      expect(checkDenyList(env, PROJECT_ROOT).denied).toBe(true);
    });

    it('allows normal source files', () => {
      const src = path.join(PROJECT_ROOT, 'packages/installer/src/index.js');
      expect(checkDenyList(src, PROJECT_ROOT).denied).toBe(false);
    });
  });

  describe('validateWrite()', () => {
    it('denies traversal that escapes project root', () => {
      const result = validateWrite('../../../etc/passwd', PROJECT_ROOT);
      expect(result.allowed).toBe(false);
      expect(result.traversalDetected || result.reason).toBeTruthy();
    });

    it('denies deny-listed paths without traversal', () => {
      const result = validateWrite('.aiox-core/constitution.md', PROJECT_ROOT);
      expect(result.allowed).toBe(false);
      expect(result.denyListed).toBe(true);
    });

    it('allows package source writes', () => {
      const result = validateWrite('packages/foo/bar.js', PROJECT_ROOT);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('isWriteAllowed mirrors validateWrite.allowed', () => {
      expect(isWriteAllowed('README.md', PROJECT_ROOT)).toBe(true);
      expect(isWriteAllowed('.git/hooks/pre-commit', PROJECT_ROOT)).toBe(false);
    });
  });

  describe('getDenyList()', () => {
    it('does not include workspace/ product paths', () => {
      const list = getDenyList();
      expect(list.some((e) => e.includes('workspace'))).toBe(false);
      expect(WRITE_DENY_LIST).toEqual(expect.arrayContaining(['.git', '.aiox-core/constitution.md']));
    });
  });
});
