/**
 * Tests for rate limiter — rolling window, boundary conditions, breach detection.
 * Story: BSS-1.4 AC-4
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

import { RateLimiter } from '../rate-limiter';

// Suppress console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const TEST_STORAGE = path.join('output', '.rate-limits-test');

function createLimiter(overrides?: { maxRequests?: number; windowMs?: number }): RateLimiter {
  return new RateLimiter({
    maxRequests: overrides?.maxRequests ?? 5,
    windowMs: overrides?.windowMs ?? 10_000,
    storageDir: TEST_STORAGE,
  });
}

beforeEach(() => {
  if (existsSync(TEST_STORAGE)) {
    rmSync(TEST_STORAGE, { recursive: true });
  }
  mkdirSync(TEST_STORAGE, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_STORAGE)) {
    rmSync(TEST_STORAGE, { recursive: true });
  }
});

describe('RateLimiter', () => {
  describe('basic functionality', () => {
    it('allows requests within the limit', () => {
      const limiter = createLimiter({ maxRequests: 5 });
      const result = limiter.checkLimit('client-a');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('tracks remaining count correctly', () => {
      const limiter = createLimiter({ maxRequests: 3 });
      expect(limiter.checkLimit('client-a').remaining).toBe(2);
      expect(limiter.checkLimit('client-a').remaining).toBe(1);
      expect(limiter.checkLimit('client-a').remaining).toBe(0);
    });

    it('rejects requests when limit is exceeded', () => {
      const limiter = createLimiter({ maxRequests: 2 });
      limiter.checkLimit('client-a');
      limiter.checkLimit('client-a');
      const result = limiter.checkLimit('client-a');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('returns resetAt as ISO string', () => {
      const limiter = createLimiter();
      const result = limiter.checkLimit('client-a');
      expect(() => new Date(result.resetAt)).not.toThrow();
      expect(new Date(result.resetAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('rolling window', () => {
    it('allows requests after window expires', () => {
      jest.useFakeTimers();
      const limiter = createLimiter({ maxRequests: 2, windowMs: 5000 });

      limiter.checkLimit('client-b');
      limiter.checkLimit('client-b');
      expect(limiter.checkLimit('client-b').allowed).toBe(false);

      // Advance past window
      jest.advanceTimersByTime(6000);
      expect(limiter.checkLimit('client-b').allowed).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('client isolation', () => {
    it('tracks limits independently per client', () => {
      const limiter = createLimiter({ maxRequests: 1 });

      limiter.checkLimit('client-x');
      expect(limiter.checkLimit('client-x').allowed).toBe(false);
      expect(limiter.checkLimit('client-y').allowed).toBe(true);
    });
  });

  describe('getCount', () => {
    it('returns current count without recording', () => {
      const limiter = createLimiter();
      expect(limiter.getCount('client-c')).toBe(0);
      limiter.checkLimit('client-c');
      expect(limiter.getCount('client-c')).toBe(1);
    });
  });

  describe('reset', () => {
    it('clears the count for a client', () => {
      const limiter = createLimiter({ maxRequests: 1 });
      limiter.checkLimit('client-d');
      expect(limiter.checkLimit('client-d').allowed).toBe(false);

      limiter.reset('client-d');
      expect(limiter.checkLimit('client-d').allowed).toBe(true);
    });
  });

  describe('persistence', () => {
    it('persists counts across limiter instances', () => {
      const config = { maxRequests: 3, windowMs: 60_000, storageDir: TEST_STORAGE };

      const limiter1 = new RateLimiter(config);
      limiter1.checkLimit('client-e');
      limiter1.checkLimit('client-e');

      // New instance reads from same storage
      const limiter2 = new RateLimiter(config);
      expect(limiter2.getCount('client-e')).toBe(2);
    });
  });

  describe('path sanitization', () => {
    it('sanitizes clientId with special characters', () => {
      const limiter = createLimiter();
      // Should not throw even with path-traversal-like clientId
      const result = limiter.checkLimit('../../../etc/passwd');
      expect(result.allowed).toBe(true);
    });
  });
});
