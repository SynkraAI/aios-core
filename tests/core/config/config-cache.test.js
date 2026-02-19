/**
 * Unit tests for config-cache
 *
 * Tests ConfigCache class: TTL expiration, get/set/has, invalidation,
 * clearExpired, statistics, entries, serialization, and global singleton.
 */

jest.useFakeTimers();

const { ConfigCache, globalConfigCache } = require('../../../.aios-core/core/config/config-cache');

describe('config-cache', () => {
  let cache;

  beforeEach(() => {
    cache = new ConfigCache(1000); // 1 second TTL for tests
  });

  describe('constructor', () => {
    test('uses default TTL of 5 minutes', () => {
      const defaultCache = new ConfigCache();
      expect(defaultCache.ttl).toBe(5 * 60 * 1000);
    });

    test('accepts custom TTL', () => {
      expect(cache.ttl).toBe(1000);
    });

    test('initializes empty stats', () => {
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(0);
      expect(cache.size).toBe(0);
    });
  });

  describe('set and get', () => {
    test('stores and retrieves a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('stores objects', () => {
      const obj = { nested: { data: true } };
      cache.set('obj', obj);
      expect(cache.get('obj')).toBe(obj);
    });

    test('returns null for missing key', () => {
      expect(cache.get('missing')).toBeNull();
    });

    test('returns null for expired key', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(1500); // past 1s TTL
      expect(cache.get('key1')).toBeNull();
    });

    test('removes expired entry from cache on get', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(1500);
      cache.get('key1');
      expect(cache.size).toBe(0);
    });

    test('overwrites existing key', () => {
      cache.set('key1', 'v1');
      cache.set('key1', 'v2');
      expect(cache.get('key1')).toBe('v2');
    });
  });

  describe('has', () => {
    test('returns true for valid entry', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    test('returns false for missing entry', () => {
      expect(cache.has('missing')).toBe(false);
    });

    test('returns false for expired entry', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(1500);
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('invalidate', () => {
    test('removes specific entry', () => {
      cache.set('key1', 'v1');
      cache.set('key2', 'v2');
      const deleted = cache.invalidate('key1');
      expect(deleted).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('v2');
    });

    test('returns false for non-existent key', () => {
      expect(cache.invalidate('missing')).toBe(false);
    });
  });

  describe('clear', () => {
    test('removes all entries and resets stats', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a'); // hit
      cache.get('missing'); // miss
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(0);
    });
  });

  describe('clearExpired', () => {
    test('removes only expired entries', () => {
      cache.set('old', 'data');
      jest.advanceTimersByTime(800);
      cache.set('new', 'data');
      jest.advanceTimersByTime(300); // old is 1100ms, new is 300ms
      const cleared = cache.clearExpired();
      expect(cleared).toBe(1);
      expect(cache.get('new')).toBe('data');
    });

    test('returns 0 when nothing expired', () => {
      cache.set('fresh', 'data');
      expect(cache.clearExpired()).toBe(0);
    });

    test('returns 0 on empty cache', () => {
      expect(cache.clearExpired()).toBe(0);
    });
  });

  describe('size', () => {
    test('returns number of entries', () => {
      expect(cache.size).toBe(0);
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);
    });
  });

  describe('statistics', () => {
    test('tracks hits and misses', () => {
      cache.set('key1', 'v1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('missing'); // miss
      expect(cache.hits).toBe(2);
      expect(cache.misses).toBe(1);
    });

    test('getStats returns correct statistics', () => {
      cache.set('key1', 'v1');
      cache.get('key1'); // hit
      cache.get('missing'); // miss
      const stats = cache.getStats();
      expect(stats.size).toBe(1);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.total).toBe(2);
      expect(stats.hitRate).toBe('50.0%');
      expect(stats.ttl).toBe(1000);
      expect(stats.ttlMinutes).toBe('0.0');
    });

    test('getStats returns 0.0% hit rate when no requests', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe('0.0%');
    });

    test('resetStats clears counters but keeps cache', () => {
      cache.set('key1', 'v1');
      cache.get('key1');
      cache.resetStats();
      expect(cache.hits).toBe(0);
      expect(cache.misses).toBe(0);
      expect(cache.get('key1')).toBe('v1');
    });
  });

  describe('keys', () => {
    test('returns array of cache keys', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.keys()).toEqual(['a', 'b']);
    });

    test('returns empty array for empty cache', () => {
      expect(cache.keys()).toEqual([]);
    });
  });

  describe('entries', () => {
    test('returns entries with age and expiry info', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(200);
      const entries = cache.entries();
      expect(entries).toHaveLength(1);
      expect(entries[0].key).toBe('key1');
      expect(entries[0].value).toBe('value1');
      expect(entries[0].age).toBe(200);
      expect(entries[0].ageSeconds).toBe('0.2');
      expect(entries[0].expires).toBe(800);
      expect(entries[0].expiresSeconds).toBe('0.8');
    });
  });

  describe('setTTL', () => {
    test('updates TTL for future expiration checks', () => {
      cache.set('key1', 'v1');
      cache.setTTL(500);
      jest.advanceTimersByTime(600);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('toJSON', () => {
    test('serializes cache state to JSON string', () => {
      cache.set('key1', 'v1');
      cache.get('key1'); // hit
      const json = cache.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed.size).toBe(1);
      expect(parsed.stats).toBeDefined();
      expect(parsed.entries).toHaveLength(1);
      expect(parsed.entries[0].key).toBe('key1');
    });

    test('produces valid JSON for empty cache', () => {
      const parsed = JSON.parse(cache.toJSON());
      expect(parsed.size).toBe(0);
      expect(parsed.entries).toEqual([]);
    });
  });

  describe('globalConfigCache', () => {
    test('is a ConfigCache instance', () => {
      expect(globalConfigCache).toBeInstanceOf(ConfigCache);
    });

    test('has default 5 minute TTL', () => {
      expect(globalConfigCache.ttl).toBe(5 * 60 * 1000);
    });
  });
});
