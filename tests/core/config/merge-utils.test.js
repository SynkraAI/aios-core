/**
 * Unit tests for merge-utils
 *
 * Tests deep merge strategy per ADR-PRO-002: scalars last-wins,
 * objects deep merge, arrays replace, +append, null delete, isPlainObject.
 */

const { deepMerge, mergeAll, isPlainObject } = require('../../../.aios-core/core/config/merge-utils');

describe('merge-utils', () => {
  describe('isPlainObject', () => {
    test('returns true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
    });

    test('returns true for Object.create(null)', () => {
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    test('returns false for arrays', () => {
      expect(isPlainObject([])).toBe(false);
    });

    test('returns false for null', () => {
      expect(isPlainObject(null)).toBe(false);
    });

    test('returns false for primitives', () => {
      expect(isPlainObject('string')).toBe(false);
      expect(isPlainObject(42)).toBe(false);
      expect(isPlainObject(true)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
    });

    test('returns false for class instances', () => {
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(new Map())).toBe(false);
    });
  });

  describe('deepMerge', () => {
    test('scalars: source overrides target', () => {
      const result = deepMerge({ a: 1 }, { a: 2 });
      expect(result.a).toBe(2);
    });

    test('adds new keys from source', () => {
      const result = deepMerge({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test('deep merges nested objects', () => {
      const target = { db: { host: 'localhost', port: 5432 } };
      const source = { db: { host: 'remote', timeout: 30 } };
      const result = deepMerge(target, source);
      expect(result.db).toEqual({ host: 'remote', port: 5432, timeout: 30 });
    });

    test('arrays: source replaces target', () => {
      const result = deepMerge({ tags: ['a', 'b'] }, { tags: ['c'] });
      expect(result.tags).toEqual(['c']);
    });

    test('+append: concatenates arrays', () => {
      const result = deepMerge({ items: [1, 2] }, { 'items+append': [3, 4] });
      expect(result.items).toEqual([1, 2, 3, 4]);
    });

    test('+append: creates new array when target key missing', () => {
      const result = deepMerge({}, { 'items+append': [1, 2] });
      expect(result.items).toEqual([1, 2]);
    });

    test('null value deletes key', () => {
      const result = deepMerge({ a: 1, b: 2 }, { a: null });
      expect(result).toEqual({ b: 2 });
      expect('a' in result).toBe(false);
    });

    test('does not mutate inputs', () => {
      const target = { a: { b: 1 } };
      const source = { a: { c: 2 } };
      const result = deepMerge(target, source);
      expect(target.a).toEqual({ b: 1 });
      expect(result.a).toEqual({ b: 1, c: 2 });
    });

    test('returns source when target not plain object', () => {
      expect(deepMerge('string', { a: 1 })).toEqual({ a: 1 });
    });

    test('returns target when source is undefined', () => {
      expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 });
    });
  });

  describe('mergeAll', () => {
    test('merges multiple layers in order', () => {
      const result = mergeAll(
        { a: 1, b: 2 },
        { b: 3, c: 4 },
        { c: 5 },
      );
      expect(result).toEqual({ a: 1, b: 3, c: 5 });
    });

    test('skips null and non-object layers', () => {
      const result = mergeAll({ a: 1 }, null, undefined, 'string', { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test('returns empty object when no layers', () => {
      expect(mergeAll()).toEqual({});
    });

    test('deep merges across layers', () => {
      const result = mergeAll(
        { db: { host: 'localhost' } },
        { db: { port: 5432 } },
        { db: { host: 'remote' } },
      );
      expect(result.db).toEqual({ host: 'remote', port: 5432 });
    });
  });
});
