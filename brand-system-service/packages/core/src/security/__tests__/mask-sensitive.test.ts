/**
 * Tests for maskSensitiveFields utility.
 * Story: BSS-1.4 AC-2
 */

import { maskSensitiveFields } from '../mask-sensitive';

describe('maskSensitiveFields', () => {
  const REDACTED = '***REDACTED***';

  describe('basic redaction', () => {
    it('redacts accessKeyId', () => {
      const result = maskSensitiveFields({ accessKeyId: 'AKIAEXAMPLE' });
      expect(result.accessKeyId).toBe(REDACTED);
    });

    it('redacts secretAccessKey', () => {
      const result = maskSensitiveFields({ secretAccessKey: 'secretValue123' });
      expect(result.secretAccessKey).toBe(REDACTED);
    });

    it('redacts apiKey', () => {
      const result = maskSensitiveFields({ apiKey: 'sk-12345' });
      expect(result.apiKey).toBe(REDACTED);
    });

    it('redacts token', () => {
      const result = maskSensitiveFields({ token: 'jwt-token-here' });
      expect(result.token).toBe(REDACTED);
    });

    it('redacts password', () => {
      const result = maskSensitiveFields({ password: 'hunter2' });
      expect(result.password).toBe(REDACTED);
    });

    it('redacts dsn field', () => {
      const result = maskSensitiveFields({ dsn: 'https://sentry.io/123' });
      expect(result.dsn).toBe(REDACTED);
    });
  });

  describe('case-insensitive matching', () => {
    it('redacts APIKEY (uppercase)', () => {
      const result = maskSensitiveFields({ APIKEY: 'value' });
      expect(result.APIKEY).toBe(REDACTED);
    });

    it('redacts ApiKey (mixed case)', () => {
      const result = maskSensitiveFields({ ApiKey: 'value' });
      expect(result.ApiKey).toBe(REDACTED);
    });
  });

  describe('preserves non-sensitive fields', () => {
    it('keeps normal fields unchanged', () => {
      const input = { name: 'acme', bucketName: 'brand-assets', debug: true };
      const result = maskSensitiveFields(input);
      expect(result).toEqual(input);
    });
  });

  describe('handles nested objects', () => {
    it('redacts sensitive fields in nested objects', () => {
      const input = {
        r2: {
          accountId: 'abc123',
          accessKeyId: 'AKIA_SECRET',
          secretAccessKey: 'SECRET_KEY',
        },
      };
      const result = maskSensitiveFields(input);
      expect(result.r2.accountId).toBe('abc123');
      expect(result.r2.accessKeyId).toBe(REDACTED);
      expect(result.r2.secretAccessKey).toBe(REDACTED);
    });
  });

  describe('handles arrays', () => {
    it('redacts sensitive fields in array items', () => {
      const input = [{ apiKey: 'key1' }, { apiKey: 'key2' }];
      const result = maskSensitiveFields(input);
      expect(result[0].apiKey).toBe(REDACTED);
      expect(result[1].apiKey).toBe(REDACTED);
    });
  });

  describe('edge cases', () => {
    it('returns null for null input', () => {
      expect(maskSensitiveFields(null)).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(maskSensitiveFields(undefined)).toBeUndefined();
    });

    it('returns primitive values unchanged', () => {
      expect(maskSensitiveFields('string')).toBe('string');
      expect(maskSensitiveFields(42)).toBe(42);
      expect(maskSensitiveFields(true)).toBe(true);
    });

    it('does not redact empty string values', () => {
      const result = maskSensitiveFields({ apiKey: '' });
      expect(result.apiKey).toBe('');
    });

    it('does not mutate original object', () => {
      const original = { apiKey: 'secret123' };
      maskSensitiveFields(original);
      expect(original.apiKey).toBe('secret123');
    });
  });
});
