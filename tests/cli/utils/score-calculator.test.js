'use strict';

const {
  calculateScores,
  sortByScore,
  normalizeScores,
  calculateRelevanceScore,
  boostExactMatches,
  calculateSearchAccuracy,
} = require('../../../.aios-core/cli/utils/score-calculator');

describe('score-calculator', () => {
  // Shared fixtures
  const makeResult = (overrides = {}) => ({
    id: 'dev',
    name: 'Dex',
    tags: ['development', 'code'],
    category: 'engineering',
    description: 'Full stack development agent',
    score: 0,
    ...overrides,
  });

  describe('calculateScores', () => {
    // Use neutral fixtures to isolate each scoring factor
    const neutral = (overrides = {}) => ({
      id: 'zz', name: 'ZZ', tags: [], category: '', description: '', score: 0, ...overrides,
    });

    it('should boost score for exact ID match', () => {
      const results = [neutral({ id: 'dev' })];
      const scored = calculateScores(results, 'dev');
      expect(scored[0].score).toBe(100);
    });

    it('should boost score for case-insensitive ID match', () => {
      const results = [neutral({ id: 'Dev' })];
      const scored = calculateScores(results, 'dev');
      expect(scored[0].score).toBeGreaterThanOrEqual(99);
    });

    it('should boost score for partial ID match', () => {
      const results = [neutral({ id: 'devops' })];
      const scored = calculateScores(results, 'dev');
      expect(scored[0].score).toBeGreaterThanOrEqual(95);
    });

    it('should boost score for exact name match', () => {
      const results = [neutral({ name: 'Dex' })];
      const scored = calculateScores(results, 'dex');
      expect(scored[0].score).toBeGreaterThanOrEqual(98);
    });

    it('should boost score for partial name match', () => {
      const results = [neutral({ name: 'Developer Agent' })];
      const scored = calculateScores(results, 'developer');
      expect(scored[0].score).toBeGreaterThanOrEqual(90);
    });

    it('should boost score for tag matches', () => {
      const results = [neutral({ tags: ['testing', 'qa'] })];
      const scored = calculateScores(results, 'testing qa');
      expect(scored[0].score).toBeGreaterThan(0);
    });

    it('should boost score for category match', () => {
      const results = [neutral({ category: 'engineering' })];
      const scored = calculateScores(results, 'engineering');
      expect(scored[0].score).toBeGreaterThan(0);
    });

    it('should clamp scores to 0-100 range', () => {
      const results = [neutral({ score: 200 })];
      const scored = calculateScores(results, 'zzzznothing');
      expect(scored[0].score).toBeLessThanOrEqual(100);
    });

    it('should preserve existing score when no matches', () => {
      const results = [neutral({ score: 50 })];
      const scored = calculateScores(results, 'zzzzz');
      expect(scored[0].score).toBe(50);
    });

    it('should handle results without tags or category', () => {
      const results = [{ id: 'x', name: 'y', score: 0 }];
      expect(() => calculateScores(results, 'test')).not.toThrow();
    });

    it('should handle empty results array', () => {
      const scored = calculateScores([], 'dev');
      expect(scored).toEqual([]);
    });
  });

  describe('sortByScore', () => {
    it('should sort results by score descending', () => {
      const results = [
        makeResult({ id: 'low', score: 10 }),
        makeResult({ id: 'high', score: 90 }),
        makeResult({ id: 'mid', score: 50 }),
      ];
      const sorted = sortByScore(results);
      expect(sorted[0].id).toBe('high');
      expect(sorted[1].id).toBe('mid');
      expect(sorted[2].id).toBe('low');
    });

    it('should use name length as tiebreaker (shorter first)', () => {
      const results = [
        makeResult({ id: 'a', name: 'Developer Agent', score: 80 }),
        makeResult({ id: 'b', name: 'Dev', score: 80 }),
      ];
      const sorted = sortByScore(results);
      expect(sorted[0].name).toBe('Dev');
      expect(sorted[1].name).toBe('Developer Agent');
    });

    it('should not mutate the original array', () => {
      const results = [
        makeResult({ id: 'b', score: 10 }),
        makeResult({ id: 'a', score: 90 }),
      ];
      const sorted = sortByScore(results);
      expect(results[0].id).toBe('b');
      expect(sorted[0].id).toBe('a');
    });

    it('should handle empty array', () => {
      expect(sortByScore([])).toEqual([]);
    });
  });

  describe('normalizeScores', () => {
    it('should normalize scores to 0-100 range', () => {
      const results = [
        makeResult({ score: 10 }),
        makeResult({ score: 50 }),
        makeResult({ score: 90 }),
      ];
      const normalized = normalizeScores(results);
      expect(normalized[0].score).toBe(0);
      expect(normalized[2].score).toBe(100);
    });

    it('should return as-is when all scores are equal', () => {
      const results = [
        makeResult({ id: 'a', score: 50 }),
        makeResult({ id: 'b', score: 50 }),
      ];
      const normalized = normalizeScores(results);
      expect(normalized[0].score).toBe(50);
      expect(normalized[1].score).toBe(50);
    });

    it('should handle empty array', () => {
      expect(normalizeScores([])).toEqual([]);
    });

    it('should handle single result', () => {
      const results = [makeResult({ score: 75 })];
      const normalized = normalizeScores(results);
      expect(normalized[0].score).toBe(75);
    });
  });

  describe('calculateRelevanceScore', () => {
    const makeWorker = (overrides = {}) => ({
      id: 'dev',
      name: 'Dex',
      tags: ['development'],
      description: 'Full stack developer',
      category: 'engineering',
      ...overrides,
    });

    it('should give highest score for exact ID match', () => {
      const score = calculateRelevanceScore(makeWorker(), 'dev');
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('should score partial ID match lower than exact when using low weights', () => {
      const lowWeights = { idWeight: 0.5, nameWeight: 0, tagWeight: 0, descriptionWeight: 0, categoryWeight: 0 };
      const exact = calculateRelevanceScore(
        makeWorker({ id: 'dev', name: 'x', tags: [], description: '', category: '' }), 'dev', lowWeights,
      );
      const partial = calculateRelevanceScore(
        makeWorker({ id: 'devops', name: 'x', tags: [], description: '', category: '' }), 'dev', lowWeights,
      );
      expect(exact).toBeGreaterThan(partial);
    });

    it('should boost for name match', () => {
      const withName = calculateRelevanceScore(makeWorker({ id: 'x', name: 'development' }), 'development');
      const noName = calculateRelevanceScore(makeWorker({ id: 'x', name: 'zzz' }), 'development');
      expect(withName).toBeGreaterThan(noName);
    });

    it('should boost for tag match', () => {
      const withTags = calculateRelevanceScore(makeWorker({ id: 'x', name: 'x', tags: ['testing'] }), 'testing');
      const noTags = calculateRelevanceScore(makeWorker({ id: 'x', name: 'x', tags: [] }), 'testing');
      expect(withTags).toBeGreaterThan(noTags);
    });

    it('should boost for description match', () => {
      const withDesc = calculateRelevanceScore(
        makeWorker({ id: 'x', name: 'x', tags: [], description: 'handles testing' }),
        'testing',
      );
      const noDesc = calculateRelevanceScore(
        makeWorker({ id: 'x', name: 'x', tags: [], description: '' }),
        'testing',
      );
      expect(withDesc).toBeGreaterThan(noDesc);
    });

    it('should boost for category match', () => {
      const withCat = calculateRelevanceScore(
        makeWorker({ id: 'x', name: 'x', tags: [], description: '', category: 'testing' }),
        'testing',
      );
      const noCat = calculateRelevanceScore(
        makeWorker({ id: 'x', name: 'x', tags: [], description: '', category: '' }),
        'testing',
      );
      expect(withCat).toBeGreaterThan(noCat);
    });

    it('should respect custom weights', () => {
      const worker = makeWorker({ id: 'dev' });
      const highWeight = calculateRelevanceScore(worker, 'dev', { idWeight: 3.0 });
      const lowWeight = calculateRelevanceScore(worker, 'dev', { idWeight: 0.5 });
      expect(highWeight).toBeGreaterThanOrEqual(lowWeight);
    });

    it('should cap score at 100', () => {
      const score = calculateRelevanceScore(makeWorker(), 'dev', { idWeight: 10, nameWeight: 10 });
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle worker without optional fields', () => {
      const worker = { id: 'test', name: 'Test' };
      expect(() => calculateRelevanceScore(worker, 'test')).not.toThrow();
    });
  });

  describe('boostExactMatches', () => {
    it('should set exact ID match to score 100', () => {
      const results = [makeResult({ id: 'dev', score: 50 })];
      const boosted = boostExactMatches(results, 'dev');
      expect(boosted[0].score).toBe(100);
    });

    it('should be case-insensitive', () => {
      const results = [makeResult({ id: 'Dev', score: 50 })];
      const boosted = boostExactMatches(results, 'dev');
      expect(boosted[0].score).toBe(100);
    });

    it('should not boost non-matching results', () => {
      const results = [makeResult({ id: 'qa', score: 50 })];
      const boosted = boostExactMatches(results, 'dev');
      expect(boosted[0].score).toBe(50);
    });

    it('should handle multiple results', () => {
      const results = [
        makeResult({ id: 'dev', score: 30 }),
        makeResult({ id: 'qa', score: 70 }),
      ];
      const boosted = boostExactMatches(results, 'dev');
      expect(boosted[0].score).toBe(100);
      expect(boosted[1].score).toBe(70);
    });

    it('should handle empty array', () => {
      expect(boostExactMatches([], 'dev')).toEqual([]);
    });
  });

  describe('calculateSearchAccuracy', () => {
    it('should return found=true and position for existing ID', () => {
      const results = [
        makeResult({ id: 'dev' }),
        makeResult({ id: 'qa' }),
      ];
      const accuracy = calculateSearchAccuracy(results, 'qa');
      expect(accuracy.found).toBe(true);
      expect(accuracy.position).toBe(1);
      expect(accuracy.isFirst).toBe(false);
    });

    it('should return isFirst=true when expected is first', () => {
      const results = [
        makeResult({ id: 'dev' }),
        makeResult({ id: 'qa' }),
      ];
      const accuracy = calculateSearchAccuracy(results, 'dev');
      expect(accuracy.isFirst).toBe(true);
      expect(accuracy.accuracy).toBe(100);
    });

    it('should return found=false for missing ID', () => {
      const results = [makeResult({ id: 'dev' })];
      const accuracy = calculateSearchAccuracy(results, 'nonexistent');
      expect(accuracy.found).toBe(false);
      expect(accuracy.position).toBe(-1);
      expect(accuracy.accuracy).toBe(0);
    });

    it('should handle empty results', () => {
      const accuracy = calculateSearchAccuracy([], 'dev');
      expect(accuracy.found).toBe(false);
      expect(accuracy.accuracy).toBe(0);
    });

    it('should decrease accuracy with position', () => {
      const results = [
        makeResult({ id: 'a' }),
        makeResult({ id: 'b' }),
        makeResult({ id: 'target' }),
      ];
      const accuracy = calculateSearchAccuracy(results, 'target');
      expect(accuracy.accuracy).toBeLessThan(100);
      expect(accuracy.accuracy).toBeGreaterThan(0);
    });
  });
});
