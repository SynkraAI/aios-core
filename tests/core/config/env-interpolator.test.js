/**
 * Unit tests for env-interpolator
 *
 * Tests environment variable interpolation: ${VAR}, ${VAR:-default},
 * recursive object/array walking, linting, and edge cases.
 */

const { interpolateString, interpolateEnvVars, lintEnvPatterns, ENV_VAR_PATTERN } = require('../../../.aios-core/core/config/env-interpolator');

describe('env-interpolator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, TEST_VAR: 'hello', DB_HOST: 'localhost' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('interpolateString', () => {
    test('resolves existing env var', () => {
      expect(interpolateString('${TEST_VAR}')).toBe('hello');
    });

    test('resolves multiple vars in one string', () => {
      expect(interpolateString('host=${DB_HOST},val=${TEST_VAR}')).toBe('host=localhost,val=hello');
    });

    test('uses default when var missing', () => {
      expect(interpolateString('${MISSING_VAR:-fallback}')).toBe('fallback');
    });

    test('returns empty string and warns for missing var without default', () => {
      const warnings = [];
      const result = interpolateString('${NONEXISTENT}', { warnings });
      expect(result).toBe('');
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('NONEXISTENT');
    });

    test('returns string unchanged when no patterns', () => {
      expect(interpolateString('plain text')).toBe('plain text');
    });

    test('uses env value over default when var exists', () => {
      expect(interpolateString('${TEST_VAR:-default}')).toBe('hello');
    });
  });

  describe('interpolateEnvVars', () => {
    test('interpolates nested objects', () => {
      const config = { db: { host: '${DB_HOST}', port: 5432 } };
      const result = interpolateEnvVars(config);
      expect(result.db.host).toBe('localhost');
      expect(result.db.port).toBe(5432);
    });

    test('interpolates arrays', () => {
      const config = ['${TEST_VAR}', 'static'];
      const result = interpolateEnvVars(config);
      expect(result[0]).toBe('hello');
      expect(result[1]).toBe('static');
    });

    test('passes through non-string scalars', () => {
      expect(interpolateEnvVars(42)).toBe(42);
      expect(interpolateEnvVars(true)).toBe(true);
      expect(interpolateEnvVars(null)).toBe(null);
    });

    test('handles deeply nested structures', () => {
      const config = { a: { b: { c: ['${TEST_VAR}'] } } };
      const result = interpolateEnvVars(config);
      expect(result.a.b.c[0]).toBe('hello');
    });
  });

  describe('lintEnvPatterns', () => {
    test('detects env patterns in config', () => {
      const config = { secret: '${API_KEY}' };
      const findings = lintEnvPatterns(config, 'config.yaml');
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain('API_KEY');
      expect(findings[0]).toContain('config.yaml');
    });

    test('detects patterns in nested objects', () => {
      const config = { db: { password: '${DB_PASS}' } };
      const findings = lintEnvPatterns(config, 'app.yaml');
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain('db.password');
    });

    test('detects patterns in arrays', () => {
      const config = { hosts: ['${HOST_1}', 'static'] };
      const findings = lintEnvPatterns(config, 'test.yaml');
      expect(findings).toHaveLength(1);
    });

    test('returns empty for config without patterns', () => {
      const config = { name: 'app', port: 3000 };
      const findings = lintEnvPatterns(config, 'test.yaml');
      expect(findings).toHaveLength(0);
    });
  });

  describe('ENV_VAR_PATTERN', () => {
    test('matches simple var', () => {
      expect('${FOO}'.match(ENV_VAR_PATTERN)).toBeTruthy();
    });

    test('matches var with default', () => {
      expect('${FOO:-bar}'.match(ENV_VAR_PATTERN)).toBeTruthy();
    });

    test('does not match invalid var names', () => {
      ENV_VAR_PATTERN.lastIndex = 0;
      expect('${123}'.match(ENV_VAR_PATTERN)).toBeNull();
    });
  });
});
