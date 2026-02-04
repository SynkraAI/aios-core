/**
 * AIOS Memory Layer - Embedding Cache Tests
 *
 * Tests for embedding caching functionality.
 */

import {
  hashContent,
  createCacheSchema,
  getCachedEmbedding,
  cacheEmbedding,
  getCacheStats,
  resetCacheStats,
  clearCache,
  clearOldCache,
  invalidateCacheEntry
} from '../src/embeddings/cache';
import { MODEL_NAME, MODEL_DIMENSIONS } from '../src/embeddings/model-loader';
import { createInMemoryConnection, closeConnection, ConnectionInfo } from '../src/db/connection';
import { createSchema } from '../src/db/schema';

describe('Embedding Cache', () => {
  let conn: ConnectionInfo;

  beforeEach(() => {
    conn = createInMemoryConnection({ enableVectorSearch: false });
    createSchema(conn);
    resetCacheStats();
  });

  afterEach(() => {
    closeConnection(conn);
  });

  describe('hashContent', () => {
    it('should generate consistent hash for same content', () => {
      const hash1 = hashContent('test content');
      const hash2 = hashContent('test content');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', () => {
      const hash1 = hashContent('content A');
      const hash2 = hashContent('content B');

      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64-character hex hash (SHA-256)', () => {
      const hash = hashContent('any content');

      expect(hash.length).toBe(64);
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it('should handle empty string', () => {
      const hash = hashContent('');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('should handle unicode content', () => {
      const hash = hashContent('こんにちは世界 🌍');

      expect(hash.length).toBe(64);
    });
  });

  describe('createCacheSchema', () => {
    it('should create cache table idempotently', () => {
      // Already created in beforeEach via createSchema
      // This should not throw
      createCacheSchema(conn.db);

      const tables = conn.db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='aios_embedding_cache'
      `).all();

      expect(tables.length).toBe(1);
    });
  });

  describe('cacheEmbedding & getCachedEmbedding', () => {
    const testContent = 'Test content for embedding';
    const testEmbedding = Array(MODEL_DIMENSIONS).fill(0).map((_, i) => i / MODEL_DIMENSIONS);

    it('should cache and retrieve embedding', () => {
      cacheEmbedding(conn.db, testContent, testEmbedding);
      const retrieved = getCachedEmbedding(conn.db, testContent);

      expect(retrieved).toBeDefined();
      expect(retrieved!.length).toBe(MODEL_DIMENSIONS);
    });

    it('should return null for uncached content', () => {
      const result = getCachedEmbedding(conn.db, 'not in cache');

      expect(result).toBeNull();
    });

    it('should preserve embedding values', () => {
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      const paddedEmbedding = [...embedding, ...Array(MODEL_DIMENSIONS - 5).fill(0)];

      cacheEmbedding(conn.db, 'precise test', paddedEmbedding);
      const retrieved = getCachedEmbedding(conn.db, 'precise test');

      // Float32 has limited precision
      expect(retrieved![0]).toBeCloseTo(0.1, 5);
      expect(retrieved![1]).toBeCloseTo(0.2, 5);
      expect(retrieved![2]).toBeCloseTo(0.3, 5);
    });

    it('should update existing cache entry', () => {
      const embedding1 = Array(MODEL_DIMENSIONS).fill(0.1);
      const embedding2 = Array(MODEL_DIMENSIONS).fill(0.9);

      cacheEmbedding(conn.db, testContent, embedding1);
      cacheEmbedding(conn.db, testContent, embedding2);

      const retrieved = getCachedEmbedding(conn.db, testContent);
      expect(retrieved![0]).toBeCloseTo(0.9, 5);
    });
  });

  describe('getCacheStats', () => {
    it('should track hits and misses', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);

      cacheEmbedding(conn.db, 'cached content', embedding);

      // This should be a miss (new content)
      getCachedEmbedding(conn.db, 'not cached');
      // This should be a hit
      getCachedEmbedding(conn.db, 'cached content');
      // Another hit
      getCachedEmbedding(conn.db, 'cached content');

      const stats = getCacheStats(conn.db);

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2/3, 5);
    });

    it('should count total entries', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);

      cacheEmbedding(conn.db, 'content 1', embedding);
      cacheEmbedding(conn.db, 'content 2', embedding);
      cacheEmbedding(conn.db, 'content 3', embedding);

      const stats = getCacheStats(conn.db);

      expect(stats.totalEntries).toBe(3);
    });

    it('should report model version', () => {
      const stats = getCacheStats(conn.db);

      expect(stats.modelVersion).toBe(MODEL_NAME);
    });

    it('should handle zero requests', () => {
      const stats = getCacheStats(conn.db);

      expect(stats.hitRate).toBe(0);
    });
  });

  describe('resetCacheStats', () => {
    it('should reset hit/miss counters', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);
      cacheEmbedding(conn.db, 'test', embedding);

      getCachedEmbedding(conn.db, 'test'); // hit
      getCachedEmbedding(conn.db, 'miss'); // miss

      resetCacheStats();

      const stats = getCacheStats(conn.db);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('clearCache', () => {
    it('should remove all cached embeddings', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);

      cacheEmbedding(conn.db, 'content 1', embedding);
      cacheEmbedding(conn.db, 'content 2', embedding);
      cacheEmbedding(conn.db, 'content 3', embedding);

      const deleted = clearCache(conn.db);

      expect(deleted).toBe(3);

      const stats = getCacheStats(conn.db);
      expect(stats.totalEntries).toBe(0);
    });

    it('should reset stats after clearing', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);
      cacheEmbedding(conn.db, 'test', embedding);
      getCachedEmbedding(conn.db, 'test');

      clearCache(conn.db);

      const stats = getCacheStats(conn.db);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('clearOldCache', () => {
    it('should remove entries from different model versions', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);

      // Add entry with current model
      cacheEmbedding(conn.db, 'current model', embedding);

      // Manually insert entry with old model version
      const hash = hashContent('old model');
      const buffer = Buffer.from(new Float32Array(embedding).buffer);

      conn.db.prepare(`
        INSERT INTO aios_embedding_cache
        (content_hash, embedding, model_version, dimensions, created_at)
        VALUES (?, ?, 'old-model-v1', ?, datetime('now'))
      `).run(hash, buffer, MODEL_DIMENSIONS);

      const deleted = clearOldCache(conn.db);

      expect(deleted).toBe(1);

      // Current model entry should remain
      const stats = getCacheStats(conn.db);
      expect(stats.totalEntries).toBe(1);
    });
  });

  describe('invalidateCacheEntry', () => {
    it('should remove specific cache entry', () => {
      const embedding = Array(MODEL_DIMENSIONS).fill(0.5);

      cacheEmbedding(conn.db, 'keep this', embedding);
      cacheEmbedding(conn.db, 'remove this', embedding);

      const removed = invalidateCacheEntry(conn.db, 'remove this');

      expect(removed).toBe(true);
      expect(getCachedEmbedding(conn.db, 'remove this')).toBeNull();
      expect(getCachedEmbedding(conn.db, 'keep this')).not.toBeNull();
    });

    it('should return false for non-existent entry', () => {
      const removed = invalidateCacheEntry(conn.db, 'not in cache');

      expect(removed).toBe(false);
    });
  });
});
