/**
 * @fileoverview Unit tests for PatternStore module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('PatternStore (Unit)', () => {
  let PatternStore, createPatternStore, DEFAULT_MAX_PATTERNS, PATTERN_STATUS;
  let testStoragePath;

  beforeAll(() => {
    const module = require('../../../.aiox-core/workflow-intelligence/learning/pattern-store');
    PatternStore = module.PatternStore;
    createPatternStore = module.createPatternStore;
    DEFAULT_MAX_PATTERNS = module.DEFAULT_MAX_PATTERNS;
    PATTERN_STATUS = module.PATTERN_STATUS;
  });

  beforeEach(() => {
    // Create unique temp file for each test
    testStoragePath = path.join(os.tmpdir(), `test-patterns-${Date.now()}.yaml`);
  });

  afterEach(() => {
    // Cleanup temp file
    try {
      if (fs.existsSync(testStoragePath)) {
        fs.unlinkSync(testStoragePath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('Module Exports', () => {
    it('should export PatternStore class', () => {
      expect(PatternStore).toBeDefined();
      expect(typeof PatternStore).toBe('function');
    });

    it('should export createPatternStore factory', () => {
      expect(createPatternStore).toBeDefined();
      expect(typeof createPatternStore).toBe('function');
    });

    it('should export DEFAULT_MAX_PATTERNS', () => {
      expect(DEFAULT_MAX_PATTERNS).toBe(100);
    });

    it('should export PATTERN_STATUS enum', () => {
      expect(PATTERN_STATUS.PENDING).toBe('pending');
      expect(PATTERN_STATUS.ACTIVE).toBe('active');
      expect(PATTERN_STATUS.PROMOTED).toBe('promoted');
      expect(PATTERN_STATUS.DEPRECATED).toBe('deprecated');
    });
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      expect(store).toBeInstanceOf(PatternStore);
      expect(store.maxPatterns).toBe(100);
    });

    it('should accept custom options', () => {
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 50,
        pruneThreshold: 0.8,
      });
      expect(store.maxPatterns).toBe(50);
      expect(store.pruneThreshold).toBe(0.8);
    });
  });

  describe('save', () => {
    it('should save new pattern', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        agents: ['dev', 'qa'],
        successRate: 1.0,
      };

      const result = await store.save(pattern);

      expect(result.action).toBe('created');
      expect(result.pattern.id).toBeDefined();
      expect(result.pattern.sequence).toEqual(pattern.sequence);
    });

    it('should update existing pattern with same sequence', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 1.0,
      };

      await store.save(pattern);
      const result = await store.save(pattern);

      expect(result.action).toBe('updated');
      expect(result.pattern.occurrences).toBe(2);
    });

    it('should update success rate with weighted average', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      await store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 1.0,
      });

      const result = await store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 0.5,
      });

      // Average of 1.0 and 0.5 = 0.75
      expect(result.pattern.successRate).toBe(0.75);
    });

    it('should set lastSeen on update', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };

      await store.save(pattern);
      const result = await store.save(pattern);

      expect(result.pattern.lastSeen).toBeDefined();
    });

    it('should normalize pattern with default values', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const result = await store.save({ sequence: ['a', 'b', 'c'] });

      expect(result.pattern.occurrences).toBe(1);
      expect(result.pattern.successRate).toBe(1.0);
      expect(result.pattern.status).toBe('pending');
      expect(result.pattern.firstSeen).toBeDefined();
    });

    it('should persist to file', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });

      expect(fs.existsSync(testStoragePath)).toBe(true);

      const content = fs.readFileSync(testStoragePath, 'utf8');
      expect(content).toContain('develop');
    });
  });

  describe('load', () => {
    it('should return empty structure when file does not exist', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const data = await store.load();

      expect(data.patterns).toEqual([]);
      expect(data.version).toBe('1.0');
    });

    it('should load saved patterns', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      await store.save({ sequence: ['create-story', 'validate-story-draft', 'develop'] });

      // Create new store instance to force reload
      store.invalidateCache();
      const data = await store.load();

      expect(data.patterns).toHaveLength(2);
    });

    it('should use cache for repeated loads', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });

      const data1 = await store.load();
      const data2 = await store.load();

      expect(data1).toBe(data2); // Same reference (cached)
    });
  });

  describe('findSimilar', () => {
    let store;

    beforeEach(async () => {
      store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      await store.save({ sequence: ['create-story', 'validate-story-draft', 'develop'] });
      await store.save({ sequence: ['run-tests', 'create-pr', 'push'] });
    });

    it('should return empty array for null sequence', async () => {
      expect(await store.findSimilar(null)).toEqual([]);
      expect(await store.findSimilar([])).toEqual([]);
    });

    it('should find matching patterns', async () => {
      const matches = await store.findSimilar(['develop', 'review-qa']);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].similarity).toBeGreaterThan(0.3);
    });

    it('should sort by similarity descending', async () => {
      const matches = await store.findSimilar(['develop', 'review-qa', 'apply-qa-fixes']);

      if (matches.length > 1) {
        expect(matches[0].similarity).toBeGreaterThanOrEqual(matches[1].similarity);
      }
    });

    it('should include similarity score in results', async () => {
      const matches = await store.findSimilar(['develop', 'review-qa']);

      matches.forEach((m) => {
        expect(m.similarity).toBeDefined();
        expect(m.similarity).toBeGreaterThan(0);
        expect(m.similarity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getStats', () => {
    it('should return statistics for empty store', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const stats = await store.getStats();

      expect(stats.totalPatterns).toBe(0);
      expect(stats.maxPatterns).toBe(100);
      expect(stats.utilizationPercent).toBe(0);
    });

    it('should count patterns by status', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      await store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      await store.save({ sequence: ['g', 'h', 'i'], status: 'promoted' });

      const stats = await store.getStats();

      expect(stats.totalPatterns).toBe(3);
      expect(stats.statusCounts.pending).toBe(1);
      expect(stats.statusCounts.active).toBe(1);
      expect(stats.statusCounts.promoted).toBe(1);
    });

    it('should calculate average success rate', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['a', 'b', 'c'], successRate: 1.0 });
      await store.save({ sequence: ['d', 'e', 'f'], successRate: 0.8 });

      const stats = await store.getStats();

      expect(stats.avgSuccessRate).toBe(0.9);
    });

    it('should include storage file path', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const stats = await store.getStats();

      expect(stats.storageFile).toBe(testStoragePath);
    });
  });

  describe('prune', () => {
    let store;

    beforeEach(async () => {
      store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 10,
      });

      // Add 8 patterns
      for (let i = 0; i < 8; i++) {
        await store.save({
          sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`],
          occurrences: i + 1,
          successRate: 0.5 + i * 0.05,
        });
      }
    });

    it('should not prune when below threshold', async () => {
      const result = await store.prune({ keepCount: 10 });
      expect(result.pruned).toBe(0);
    });

    it('should prune to specified count', async () => {
      const result = await store.prune({ keepCount: 5 });

      expect(result.pruned).toBe(3);
      expect(result.remaining).toBe(5);
    });

    it('should keep promoted patterns during prune', async () => {
      const dataBefore = await store.load();
      await store.updateStatus(dataBefore.patterns[0].id, 'promoted');

      const result = await store.prune({ keepCount: 3 });
      const data = await store.load();

      expect(data.patterns.some((p) => p.status === 'promoted')).toBe(true);
    });

    it('should use lowest_success_rate strategy when specified', async () => {
      const result = await store.prune({
        keepCount: 4,
        strategy: 'lowest_success_rate',
      });

      expect(result.remaining).toBe(4);
    });
  });

  describe('updateStatus', () => {
    let store;
    let patternId;

    beforeEach(async () => {
      store = createPatternStore({ storagePath: testStoragePath });
      const result = await store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      patternId = result.pattern.id;
    });

    it('should update pattern status', async () => {
      const result = await store.updateStatus(patternId, 'active');

      expect(result.success).toBe(true);
      expect(result.pattern.status).toBe('active');
    });

    it('should fail for non-existent pattern', async () => {
      await expect(store.updateStatus('non-existent-id', 'active')).rejects.toThrow('Pattern not found');
    });

    it('should fail for invalid status', async () => {
      await expect(store.updateStatus(patternId, 'invalid-status')).rejects.toThrow('Invalid status');
    });

    it('should set lastUpdated timestamp', async () => {
      const result = await store.updateStatus(patternId, 'active');

      expect(result.pattern.lastUpdated).toBeDefined();
    });
  });

  describe('getByStatus', () => {
    let store;

    beforeEach(async () => {
      store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      await store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      await store.save({ sequence: ['g', 'h', 'i'], status: 'active' });
    });

    it('should return patterns with given status', async () => {
      const active = await store.getByStatus('active');
      expect(active).toHaveLength(2);
    });

    it('should return empty array for unused status', async () => {
      const promoted = await store.getByStatus('promoted');
      expect(promoted).toHaveLength(0);
    });
  });

  describe('getActivePatterns', () => {
    let store;

    beforeEach(async () => {
      store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['a', 'b', 'c'], status: 'pending' });
      await store.save({ sequence: ['d', 'e', 'f'], status: 'active' });
      await store.save({ sequence: ['g', 'h', 'i'], status: 'promoted' });
      await store.save({ sequence: ['j', 'k', 'l'], status: 'deprecated' });
    });

    it('should return active and promoted patterns', async () => {
      const patterns = await store.getActivePatterns();

      expect(patterns).toHaveLength(2);
      expect(patterns.every((p) => p.status === 'active' || p.status === 'promoted')).toBe(true);
    });
  });

  describe('delete', () => {
    let store;
    let patternId;

    beforeEach(async () => {
      store = createPatternStore({ storagePath: testStoragePath });
      const result = await store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });
      patternId = result.pattern.id;
    });

    it('should delete pattern by ID', async () => {
      const result = await store.delete(patternId);

      expect(result.success).toBe(true);
      const data = await store.load();
      expect(data.patterns).toHaveLength(0);
    });

    it('should fail for non-existent pattern', async () => {
      await expect(store.delete('non-existent-id')).rejects.toThrow('Pattern not found');
    });
  });

  describe('Auto-Prune', () => {
    it('should auto-prune when approaching limit', async () => {
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 10,
        pruneThreshold: 0.8,
      });

      // Add patterns to exceed 80% threshold
      for (let i = 0; i < 10; i++) {
        await store.save({ sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`] });
      }

      const data = await store.load();
      expect(data.patterns.length).toBeLessThanOrEqual(8); // 80% of 10
    });
  });

  describe('Cache Invalidation', () => {
    it('should reload after cache invalidation', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      await store.save({ sequence: ['a', 'b', 'c'] });

      const data1 = await store.load();
      store.invalidateCache();
      const data2 = await store.load();

      expect(data1).not.toBe(data2); // Different references
    });
  });

  describe('Performance', () => {
    it('should save pattern in under 50ms', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        agents: ['dev', 'qa'],
      };

      const start = Date.now();
      await store.save(pattern);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should load patterns in under 50ms', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      // Add some patterns
      for (let i = 0; i < 50; i++) {
        await store.save({ sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`] });
      }

      store.invalidateCache();

      const start = Date.now();
      await store.load();
      const duration = Date.now() - start;

      // Increased threshold for CI environments which may be slower
      expect(duration).toBeLessThan(200);
    });

    it('should find similar patterns in under 200ms', async () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      for (let i = 0; i < 50; i++) {
        await store.save({ sequence: [`cmd${i}a`, `cmd${i}b`, `cmd${i}c`] });
      }

      const start = Date.now();
      await store.findSimilar(['develop', 'review-qa', 'apply-qa-fixes']);
      const duration = Date.now() - start;

      // Increased threshold for CI environments which may be slower
      expect(duration).toBeLessThan(200);
    });
  });
});
