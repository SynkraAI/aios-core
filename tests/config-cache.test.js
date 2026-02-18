/**
 * Tests for config-cache.js — Configuration Cache with TTL Support
 *
 * Covers:
 * - Cache initialization and default configuration
 * - Get/set operations
 * - TTL-based expiration logic
 * - Cache invalidation (single entry and full clear)
 * - Hit/miss metrics tracking
 * - Cache statistics (getStats, resetStats)
 * - clearExpired() bulk cleanup
 * - Accessor methods (keys, entries, size, has)
 * - setTTL dynamic reconfiguration
 * - toJSON serialization
 * - Edge cases: empty keys, null/undefined values, numeric keys
 * - Error handling and boundary conditions
 *
 * @module tests/config-cache
 */

let ConfigCache;
let globalConfigCache;

beforeAll(() => {
  jest.useFakeTimers();
  const mod = require('../.aios-core/core/config/config-cache');
  ConfigCache = mod.ConfigCache;
  globalConfigCache = mod.globalConfigCache;
});

afterAll(() => {
  jest.useRealTimers();
});

describe('ConfigCache', () => {
  let cache;

  beforeEach(() => {
    cache = new ConfigCache();
  });

  describe('initialization', () => {
    test('should create cache with default TTL of 5 minutes', () => {
      expect(cache.ttl).toBe(5 * 60 * 1000);
    });

    test('should create cache with custom TTL', () => {
      const custom = new ConfigCache(10000);
      expect(custom.ttl).toBe(10000);
    });

    test('should start with empty cache', () => {
      expect(cache.size).toBe(0);
    });

    test('should start with zero hits and misses', () => {
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('get/set operations', () => {
    test('should store and retrieve a string value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should store and retrieve an object value', () => {
      const obj = { foo: 'bar', nested: { a: 1 } };
      cache.set('config', obj);
      expect(cache.get('config')).toEqual(obj);
    });

    test('should store and retrieve an array value', () => {
      const arr = [1, 2, 3];
      cache.set('list', arr);
      expect(cache.get('list')).toEqual(arr);
    });

    test('should store and retrieve a numeric value', () => {
      cache.set('port', 3000);
      expect(cache.get('port')).toBe(3000);
    });

    test('should store and retrieve a boolean value', () => {
      cache.set('enabled', false);
      expect(cache.get('enabled')).toBe(false);
    });

    test('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    test('should overwrite existing value with set', () => {
      cache.set('key', 'old');
      cache.set('key', 'new');
      expect(cache.get('key')).toBe('new');
    });

    test('should update timestamp when overwriting a value', () => {
      cache.set('key', 'v1');
      jest.advanceTimersByTime(1000);
      cache.set('key', 'v2');
      jest.advanceTimersByTime(cache.ttl - 1500);
      expect(cache.get('key')).toBe('v2');
    });
  });

  describe('TTL expiration', () => {
    test('should return value before TTL expires', () => {
      const shortCache = new ConfigCache(1000);
      shortCache.set('key', 'value');
      jest.advanceTimersByTime(999);
      expect(shortCache.get('key')).toBe('value');
    });

    test('should return null after TTL expires', () => {
      const shortCache = new ConfigCache(1000);
      shortCache.set('key', 'value');
      jest.advanceTimersByTime(1001);
      expect(shortCache.get('key')).toBeNull();
    });

    test('should delete expired entry from internal maps on get', () => {
      const shortCache = new ConfigCache(1000);
      shortCache.set('key', 'value');
      jest.advanceTimersByTime(1001);
      shortCache.get('key');
      expect(shortCache.size).toBe(0);
    });

    test('should handle mixed expired and valid entries', () => {
      const shortCache = new ConfigCache(2000);
      shortCache.set('early', 'first');
      jest.advanceTimersByTime(1500);
      shortCache.set('late', 'second');
      jest.advanceTimersByTime(600);
      expect(shortCache.get('early')).toBeNull();
      expect(shortCache.get('late')).toBe('second');
    });

    test('should expire at exactly TTL+1 boundary', () => {
      const shortCache = new ConfigCache(100);
      shortCache.set('key', 'value');
      jest.advanceTimersByTime(100);
      expect(shortCache.get('key')).toBe('value');
      jest.advanceTimersByTime(1);
      expect(shortCache.get('key')).toBeNull();
    });
  });

  describe('has()', () => {
    test('should return true for existing key', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    test('should return false for non-existent key', () => {
      expect(cache.has('ghost')).toBe(false);
    });

    test('should return false for expired key', () => {
      const shortCache = new ConfigCache(500);
      shortCache.set('key', 'value');
      jest.advanceTimersByTime(501);
      expect(shortCache.has('key')).toBe(false);
    });

    test('should count as a miss when key does not exist', () => {
      cache.has('nope');
      expect(cache.misses).toBe(1);
    });

    test('should count as a hit when key exists and is valid', () => {
      cache.set('key', 'value');
      cache.has('key');
      expect(cache.hits).toBe(1);
    });
  });

  describe('invalidate()', () => {
    test('should remove a specific cache entry', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      const result = cache.invalidate('a');
      expect(result).toBe(true);
      expect(cache.get('a')).toBeNull();
      expect(cache.size).toBe(1);
    });

    test('should return false when invalidating non-existent key', () => {
      const result = cache.invalidate('nonexistent');
      expect(result).toBe(false);
    });

    test('should remove both cache and timestamp entries', () => {
      cache.set('key', 'value');
      cache.invalidate('key');
      expect(cache.size).toBe(0);
      expect(cache.keys()).toEqual([]);
    });
  });

  describe('clear()', () => {
    test('should remove all cache entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeNull();
    });

    test('should reset hit/miss counters', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.get('missing');
      cache.clear();
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(0);
    });

    test('should allow new entries after clear', () => {
      cache.set('key', 'value');
      cache.clear();
      cache.set('key', 'new');
      expect(cache.get('key')).toBe('new');
    });
  });

  describe('clearExpired()', () => {
    test('should clear expired entries and return count', () => {
      const shortCache = new ConfigCache(1000);
      shortCache.set('a', 1);
      shortCache.set('b', 2);
      jest.advanceTimersByTime(1001);
      shortCache.set('c', 3);
      const cleared = shortCache.clearExpired();
      expect(cleared).toBe(2);
      expect(shortCache.size).toBe(1);
      expect(shortCache.get('c')).toBe(3);
    });

    test('should return 0 when no entries are expired', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      const cleared = cache.clearExpired();
      expect(cleared).toBe(0);
    });

    test('should return 0 on empty cache', () => {
      const cleared = cache.clearExpired();
      expect(cleared).toBe(0);
    });

    test('should clear all entries when all are expired', () => {
      const shortCache = new ConfigCache(500);
      shortCache.set('x', 10);
      shortCache.set('y', 20);
      jest.advanceTimersByTime(501);
      const cleared = shortCache.clearExpired();
      expect(cleared).toBe(2);
      expect(shortCache.size).toBe(0);
    });
  });

  describe('size', () => {
    test('should reflect number of entries', () => {
      expect(cache.size).toBe(0);
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);
    });

    test('should not double-count overwrites', () => {
      cache.set('key', 'v1');
      cache.set('key', 'v2');
      expect(cache.size).toBe(1);
    });
  });

  describe('hit/miss metrics', () => {
    test('should track cache hits', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.get('key');
      expect(cache.hits).toBe(2);
      expect(cache.misses).toBe(0);
    });

    test('should track cache misses for non-existent keys', () => {
      cache.get('nope');
      cache.get('also-nope');
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(2);
    });

    test('should count expired entry access as a miss', () => {
      const shortCache = new ConfigCache(100);
      shortCache.set('key', 'value');
      jest.advanceTimersByTime(101);
      shortCache.get('key');
      expect(shortCache.hits).toBe(0);
      expect(shortCache.misses).toBe(1);
    });

    test('should track mixed hits and misses correctly', () => {
      cache.set('exists', 'yes');
      cache.get('exists');
      cache.get('nope');
      cache.get('exists');
      cache.get('nah');
      expect(cache.hits).toBe(2);
      expect(cache.misses).toBe(2);
    });
  });

  describe('getStats()', () => {
    test('should return correct stats structure', () => {
      const stats = cache.getStats();
      expect(stats).toEqual({
        size: 0,
        hits: 0,
        misses: 0,
        total: 0,
        hitRate: '0.0%',
        ttl: 5 * 60 * 1000,
        ttlMinutes: '5.0',
      });
    });

    test('should calculate hit rate correctly', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.get('key');
      cache.get('key');
      cache.get('miss');
      const stats = cache.getStats();
      expect(stats.hitRate).toBe('75.0%');
      expect(stats.total).toBe(4);
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(1);
    });

    test('should report 0.0% hit rate when no accesses', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe('0.0%');
    });

    test('should report 100.0% hit rate when all hits', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.get('key');
      expect(cache.getStats().hitRate).toBe('100.0%');
    });

    test('should report correct ttlMinutes for custom TTL', () => {
      const custom = new ConfigCache(30000);
      expect(custom.getStats().ttlMinutes).toBe('0.5');
    });
  });

  describe('resetStats()', () => {
    test('should reset hits and misses to zero', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.get('missing');
      cache.resetStats();
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(0);
    });

    test('should not clear cache data', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.resetStats();
      expect(cache.size).toBe(1);
      expect(cache.get('key')).toBe('value');
    });
  });

  describe('keys()', () => {
    test('should return empty array for empty cache', () => {
      expect(cache.keys()).toEqual([]);
    });

    test('should return all cache keys', () => {
      cache.set('alpha', 1);
      cache.set('beta', 2);
      cache.set('gamma', 3);
      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('alpha');
      expect(keys).toContain('beta');
      expect(keys).toContain('gamma');
    });

    test('should include expired keys (not proactively cleaned)', () => {
      const shortCache = new ConfigCache(100);
      shortCache.set('fresh', 'yes');
      shortCache.set('stale', 'yes');
      jest.advanceTimersByTime(101);
      shortCache.set('fresh2', 'yes');
      const keys = shortCache.keys();
      expect(keys).toContain('stale');
      expect(keys).toContain('fresh');
      expect(keys).toContain('fresh2');
    });
  });

  describe('entries()', () => {
    test('should return empty array for empty cache', () => {
      expect(cache.entries()).toEqual([]);
    });

    test('should return entries with expected structure', () => {
      cache.set('key', 'value');
      const entries = cache.entries();
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({
        key: 'key',
        value: 'value',
      });
      expect(entries[0]).toHaveProperty('age');
      expect(entries[0]).toHaveProperty('ageSeconds');
      expect(entries[0]).toHaveProperty('expires');
      expect(entries[0]).toHaveProperty('expiresSeconds');
    });

    test('should calculate age correctly', () => {
      cache.set('key', 'value');
      jest.advanceTimersByTime(5000);
      const entries = cache.entries();
      expect(entries[0].age).toBeGreaterThanOrEqual(5000);
      expect(entries[0].ageSeconds).toBe('5.0');
    });

    test('should calculate expiration time correctly', () => {
      cache.set('key', 'value');
      jest.advanceTimersByTime(10000);
      const entries = cache.entries();
      expect(entries[0].expires).toBeLessThanOrEqual(290000);
    });
  });

  describe('setTTL()', () => {
    test('should update TTL value', () => {
      cache.setTTL(60000);
      expect(cache.ttl).toBe(60000);
    });

    test('should affect subsequent expiration checks', () => {
      cache.set('key', 'value');
      cache.setTTL(1000);
      jest.advanceTimersByTime(1001);
      expect(cache.get('key')).toBeNull();
    });

    test('should retroactively expire entries with shorter TTL', () => {
      const longCache = new ConfigCache(60000);
      longCache.set('key', 'value');
      jest.advanceTimersByTime(5000);
      longCache.setTTL(2000);
      expect(longCache.get('key')).toBeNull();
    });
  });

  describe('toJSON()', () => {
    test('should return valid JSON string', () => {
      cache.set('key', 'value');
      const json = cache.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
      expect(parsed.size).toBe(1);
    });

    test('should include stats in JSON output', () => {
      cache.set('key', 'value');
      cache.get('key');
      const parsed = JSON.parse(cache.toJSON());
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.hits).toBe(1);
    });

    test('should include entries with key, age, and expires', () => {
      cache.set('alpha', 1);
      cache.set('beta', 2);
      const parsed = JSON.parse(cache.toJSON());
      expect(parsed.entries).toHaveLength(2);
      expect(parsed.entries[0]).toHaveProperty('key');
      expect(parsed.entries[0]).toHaveProperty('age');
      expect(parsed.entries[0]).toHaveProperty('expires');
    });

    test('should return valid JSON for empty cache', () => {
      const parsed = JSON.parse(cache.toJSON());
      expect(parsed.size).toBe(0);
      expect(parsed.entries).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('should handle empty string as key', () => {
      cache.set('', 'empty-key');
      expect(cache.get('')).toBe('empty-key');
    });

    test('should handle null as a stored value', () => {
      cache.set('nullable', null);
      expect(cache.get('nullable')).toBeNull();
    });

    test('should handle undefined as a stored value', () => {
      cache.set('undef', undefined);
      const result = cache.get('undef');
      expect(result).toBeUndefined();
    });

    test('should handle zero as a stored value', () => {
      cache.set('zero', 0);
      expect(cache.get('zero')).toBe(0);
    });

    test('should handle false as a stored value', () => {
      cache.set('falsy', false);
      expect(cache.get('falsy')).toBe(false);
    });

    test('should handle very long key names', () => {
      const longKey = 'k'.repeat(10000);
      cache.set(longKey, 'long');
      expect(cache.get(longKey)).toBe('long');
    });

    test('should handle large number of entries', () => {
      for (let i = 0; i < 1000; i++) {
        cache.set('key-' + i, i);
      }
      expect(cache.size).toBe(1000);
      expect(cache.get('key-500')).toBe(500);
      expect(cache.get('key-999')).toBe(999);
    });

    test('should handle TTL of zero (immediate expiration)', () => {
      const zeroCache = new ConfigCache(0);
      zeroCache.set('key', 'value');
      expect(zeroCache.get('key')).toBe('value');
      jest.advanceTimersByTime(1);
      expect(zeroCache.get('key')).toBeNull();
    });

    test('should handle special characters in keys', () => {
      cache.set('config/path.to.key', 'dotted');
      cache.set('key with spaces', 'spaced');
      expect(cache.get('config/path.to.key')).toBe('dotted');
      expect(cache.get('key with spaces')).toBe('spaced');
    });
  });

  describe('globalConfigCache singleton', () => {
    beforeEach(() => {
      globalConfigCache.clear();
    });

    test('should be an instance of ConfigCache', () => {
      expect(globalConfigCache).toBeInstanceOf(ConfigCache);
    });

    test('should support standard get/set operations', () => {
      globalConfigCache.set('global-key', 'global-value');
      expect(globalConfigCache.get('global-key')).toBe('global-value');
    });

    test('should have default TTL of 5 minutes', () => {
      expect(globalConfigCache.ttl).toBe(5 * 60 * 1000);
    });

    test('should auto-cleanup expired entries via setInterval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const originalTtl = globalConfigCache.ttl;
      globalConfigCache.setTTL(1000);
      globalConfigCache.set('temp', 'data');
      jest.advanceTimersByTime(1001);
      jest.advanceTimersByTime(60000);
      globalConfigCache.setTTL(originalTtl);
      expect(globalConfigCache.size).toBe(0);
      consoleSpy.mockRestore();
    });
  });
});
