/**
 * Unit tests for execution-profile-resolver module
 *
 * Tests profile resolution logic including context-based enforcement,
 * explicit profile selection, yolo mode, and input normalization.
 */

const {
  VALID_PROFILES,
  VALID_CONTEXTS,
  PROFILE_POLICIES,
  normalizeProfile,
  normalizeContext,
  resolveExecutionProfile,
} = require('../../../.aios-core/core/orchestration/execution-profile-resolver');

describe('execution-profile-resolver', () => {
  // ============================================================
  // Constants
  // ============================================================
  describe('constants', () => {
    test('VALID_PROFILES contains safe, balanced, aggressive', () => {
      expect(VALID_PROFILES).toEqual(['safe', 'balanced', 'aggressive']);
    });

    test('VALID_CONTEXTS contains expected contexts', () => {
      expect(VALID_CONTEXTS).toEqual(['production', 'migration', 'security-sensitive', 'development']);
    });

    test('PROFILE_POLICIES has entries for all profiles', () => {
      for (const profile of VALID_PROFILES) {
        expect(PROFILE_POLICIES[profile]).toBeDefined();
      }
    });

    test('safe policy is most restrictive', () => {
      const safe = PROFILE_POLICIES.safe;
      expect(safe.require_confirmation).toBe(true);
      expect(safe.require_tests_before_handoff).toBe(true);
      expect(safe.max_parallel_changes).toBe(1);
      expect(safe.allow_destructive_operations).toBe(false);
      expect(safe.allow_autonomous_refactors).toBe(false);
    });

    test('aggressive policy is most permissive', () => {
      const aggressive = PROFILE_POLICIES.aggressive;
      expect(aggressive.require_confirmation).toBe(false);
      expect(aggressive.require_tests_before_handoff).toBe(false);
      expect(aggressive.max_parallel_changes).toBe(8);
      expect(aggressive.allow_autonomous_refactors).toBe(true);
    });

    test('balanced policy is intermediate', () => {
      const balanced = PROFILE_POLICIES.balanced;
      expect(balanced.require_confirmation).toBe('high-risk-only');
      expect(balanced.max_parallel_changes).toBe(3);
      expect(balanced.allow_autonomous_refactors).toBe(true);
    });
  });

  // ============================================================
  // normalizeProfile
  // ============================================================
  describe('normalizeProfile', () => {
    test('returns valid profile as-is', () => {
      expect(normalizeProfile('safe')).toBe('safe');
      expect(normalizeProfile('balanced')).toBe('balanced');
      expect(normalizeProfile('aggressive')).toBe('aggressive');
    });

    test('lowercases input', () => {
      expect(normalizeProfile('SAFE')).toBe('safe');
      expect(normalizeProfile('Balanced')).toBe('balanced');
    });

    test('trims whitespace', () => {
      expect(normalizeProfile('  safe  ')).toBe('safe');
    });

    test('returns null for invalid profile', () => {
      expect(normalizeProfile('unknown')).toBeNull();
      expect(normalizeProfile('turbo')).toBeNull();
    });

    test('returns null for empty/null/undefined', () => {
      expect(normalizeProfile('')).toBeNull();
      expect(normalizeProfile(null)).toBeNull();
      expect(normalizeProfile(undefined)).toBeNull();
    });
  });

  // ============================================================
  // normalizeContext
  // ============================================================
  describe('normalizeContext', () => {
    test('returns valid context as-is', () => {
      expect(normalizeContext('production')).toBe('production');
      expect(normalizeContext('migration')).toBe('migration');
      expect(normalizeContext('security-sensitive')).toBe('security-sensitive');
      expect(normalizeContext('development')).toBe('development');
    });

    test('lowercases input', () => {
      expect(normalizeContext('PRODUCTION')).toBe('production');
    });

    test('trims whitespace', () => {
      expect(normalizeContext('  migration  ')).toBe('migration');
    });

    test('defaults to development for invalid context', () => {
      expect(normalizeContext('unknown')).toBe('development');
      expect(normalizeContext('staging')).toBe('development');
    });

    test('defaults to development for empty/null/undefined', () => {
      expect(normalizeContext('')).toBe('development');
      expect(normalizeContext(null)).toBe('development');
      expect(normalizeContext(undefined)).toBe('development');
    });
  });

  // ============================================================
  // resolveExecutionProfile
  // ============================================================
  describe('resolveExecutionProfile', () => {
    test('explicit profile takes highest priority', () => {
      const result = resolveExecutionProfile({
        explicitProfile: 'aggressive',
        context: 'production',
        yolo: true,
      });

      expect(result.profile).toBe('aggressive');
      expect(result.source).toBe('explicit');
      expect(result.policy).toBe(PROFILE_POLICIES.aggressive);
      expect(result.reasons[0]).toContain('explicit');
    });

    test('production context enforces safe profile', () => {
      const result = resolveExecutionProfile({ context: 'production' });

      expect(result.profile).toBe('safe');
      expect(result.context).toBe('production');
      expect(result.source).toBe('context');
      expect(result.policy).toBe(PROFILE_POLICIES.safe);
    });

    test('security-sensitive context enforces safe profile', () => {
      const result = resolveExecutionProfile({ context: 'security-sensitive' });

      expect(result.profile).toBe('safe');
      expect(result.source).toBe('context');
    });

    test('migration context enforces balanced profile', () => {
      const result = resolveExecutionProfile({ context: 'migration' });

      expect(result.profile).toBe('balanced');
      expect(result.source).toBe('context');
      expect(result.reasons[0]).toContain('migration');
    });

    test('yolo mode in development sets aggressive', () => {
      const result = resolveExecutionProfile({
        context: 'development',
        yolo: true,
      });

      expect(result.profile).toBe('aggressive');
      expect(result.source).toBe('yolo');
      expect(result.reasons[0]).toContain('yolo');
    });

    test('yolo is ignored when context enforces safe', () => {
      const result = resolveExecutionProfile({
        context: 'production',
        yolo: true,
      });

      expect(result.profile).toBe('safe');
      expect(result.source).toBe('context');
    });

    test('default is balanced for development context', () => {
      const result = resolveExecutionProfile({ context: 'development' });

      expect(result.profile).toBe('balanced');
      expect(result.source).toBe('default');
      expect(result.reasons[0]).toContain('default');
    });

    test('empty input defaults to balanced/development', () => {
      const result = resolveExecutionProfile({});

      expect(result.profile).toBe('balanced');
      expect(result.context).toBe('development');
      expect(result.source).toBe('default');
    });

    test('no arguments defaults to balanced/development', () => {
      const result = resolveExecutionProfile();

      expect(result.profile).toBe('balanced');
      expect(result.context).toBe('development');
    });

    test('result always includes policy object', () => {
      const result = resolveExecutionProfile({});

      expect(result.policy).toBeDefined();
      expect(result.policy.max_parallel_changes).toBeDefined();
    });

    test('result always includes reasons array', () => {
      const result = resolveExecutionProfile({});

      expect(Array.isArray(result.reasons)).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    test('explicit safe profile with development context', () => {
      const result = resolveExecutionProfile({
        explicitProfile: 'safe',
        context: 'development',
      });

      expect(result.profile).toBe('safe');
      expect(result.context).toBe('development');
      expect(result.source).toBe('explicit');
    });

    test('invalid explicit profile falls through to context resolution', () => {
      const result = resolveExecutionProfile({
        explicitProfile: 'turbo',
        context: 'production',
      });

      expect(result.profile).toBe('safe');
      expect(result.source).toBe('context');
    });
  });
});
