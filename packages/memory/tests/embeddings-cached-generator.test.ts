/**
 * AIOS Memory Layer - Cached Generator Tests
 *
 * Tests for cached embedding generation functionality.
 */

import {
  generateEmbeddingCached,
  generateEmbeddingsCached,
  getEmbeddingCacheStats
} from '../src/embeddings/cached-generator';
import { resetCacheStats } from '../src/embeddings/cache';
import { MODEL_DIMENSIONS, unloadModel } from '../src/embeddings/model-loader';
import { createInMemoryConnection, closeConnection, ConnectionInfo } from '../src/db/connection';
import { createSchema } from '../src/db/schema';

// Mock is provided by jest.config.js moduleNameMapper
// Access mock functions via require('@xenova/transformers')

describe('Cached Embedding Generator', () => {
  let conn: ConnectionInfo;

  beforeEach(() => {
    // Unload model to get fresh pipeline instance for call tracking
    unloadModel();
    conn = createInMemoryConnection({ enableVectorSearch: false });
    createSchema(conn);
    resetCacheStats();
    // Reset mock call count
    const transformers = require('@xenova/transformers');
    transformers.__resetCallCount();
  });

  afterEach(() => {
    closeConnection(conn);
  });

  describe('generateEmbeddingCached', () => {
    it('should generate and cache embedding', async () => {
      const embedding = await generateEmbeddingCached('test text', { db: conn.db });

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(MODEL_DIMENSIONS);
    });

    it('should return cached embedding on second call', async () => {
      const transformers = require('@xenova/transformers');

      // First call - generates new embedding
      await generateEmbeddingCached('cached text', { db: conn.db });
      const firstCallCount = transformers.__getCallCount();

      // Second call - should use cache
      await generateEmbeddingCached('cached text', { db: conn.db });
      const secondCallCount = transformers.__getCallCount();

      // Pipeline should not be called again
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should skip cache when useCache=false', async () => {
      const transformers = require('@xenova/transformers');

      await generateEmbeddingCached('no cache', { db: conn.db, useCache: false });
      const firstCount = transformers.__getCallCount();

      await generateEmbeddingCached('no cache', { db: conn.db, useCache: false });
      const secondCount = transformers.__getCallCount();

      // Should call pipeline twice (no caching)
      expect(secondCount).toBe(firstCount + 1);
    });

    it('should update cache stats', async () => {
      await generateEmbeddingCached('new content', { db: conn.db });
      await generateEmbeddingCached('new content', { db: conn.db }); // Hit
      await generateEmbeddingCached('other content', { db: conn.db }); // Miss

      const stats = getEmbeddingCacheStats(conn.db);

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
    });
  });

  describe('generateEmbeddingsCached', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['First', 'Second', 'Third'];
      const embeddings = await generateEmbeddingsCached(texts, { db: conn.db });

      expect(embeddings.length).toBe(3);
      embeddings.forEach(emb => {
        expect(emb.length).toBe(MODEL_DIMENSIONS);
      });
    });

    it('should return empty array for empty input', async () => {
      const embeddings = await generateEmbeddingsCached([], { db: conn.db });

      expect(embeddings).toEqual([]);
    });

    it('should use cache for repeated texts', async () => {
      const transformers = require('@xenova/transformers');

      // First batch
      await generateEmbeddingsCached(['A', 'B', 'C'], { db: conn.db });
      const firstCallCount = transformers.__getCallCount();

      // Second batch with some cached texts
      await generateEmbeddingsCached(['A', 'B', 'D'], { db: conn.db });
      const secondCallCount = transformers.__getCallCount();

      // Only 'D' should be generated (1 new call)
      expect(secondCallCount - firstCallCount).toBe(1);
    });

    it('should maintain correct order with mixed cached/uncached', async () => {
      // Pre-cache some texts
      await generateEmbeddingCached('cached 1', { db: conn.db });
      await generateEmbeddingCached('cached 2', { db: conn.db });

      // Request mix of cached and new
      const texts = ['new 1', 'cached 1', 'new 2', 'cached 2', 'new 3'];
      const embeddings = await generateEmbeddingsCached(texts, { db: conn.db });

      expect(embeddings.length).toBe(5);
      // Each embedding should be unique and defined
      embeddings.forEach(emb => {
        expect(emb.length).toBe(MODEL_DIMENSIONS);
      });
    });

    it('should report adjusted progress with cache hits', async () => {
      // Pre-cache some texts
      await generateEmbeddingCached('pre-cached A', { db: conn.db });
      await generateEmbeddingCached('pre-cached B', { db: conn.db });

      const progressUpdates: Array<{ current: number; total: number; percentage: number }> = [];

      await generateEmbeddingsCached(
        ['pre-cached A', 'new 1', 'pre-cached B', 'new 2'],
        {
          db: conn.db,
          onProgress: (progress) => {
            progressUpdates.push({ ...progress });
          }
        }
      );

      // Progress should reflect total items (4), not just generated
      const lastProgress = progressUpdates[progressUpdates.length - 1];
      expect(lastProgress.total).toBe(4);
    });

    it('should respect batchSize option', async () => {
      const texts = Array(10).fill(null).map((_, i) => `text-${i}`);
      let progressCount = 0;

      await generateEmbeddingsCached(texts, {
        db: conn.db,
        batchSize: 3,
        onProgress: () => {
          progressCount++;
        }
      });

      expect(progressCount).toBe(10);
    });
  });

  describe('getEmbeddingCacheStats', () => {
    it('should return current cache statistics', async () => {
      await generateEmbeddingCached('text 1', { db: conn.db });
      await generateEmbeddingCached('text 2', { db: conn.db });
      await generateEmbeddingCached('text 1', { db: conn.db }); // hit

      const stats = getEmbeddingCacheStats(conn.db);

      expect(stats.totalEntries).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
    });
  });

  describe('Cache Isolation', () => {
    it('should not share cache between different db instances', async () => {
      const conn2 = createInMemoryConnection({ enableVectorSearch: false });
      createSchema(conn2);

      try {
        // Cache in first db
        await generateEmbeddingCached('shared text', { db: conn.db });

        // Should not be cached in second db
        const transformers = require('@xenova/transformers');
        const beforeCount = transformers.__getCallCount();

        await generateEmbeddingCached('shared text', { db: conn2.db });

        const afterCount = transformers.__getCallCount();

        // Should have called pipeline (not cached)
        expect(afterCount).toBe(beforeCount + 1);
      } finally {
        closeConnection(conn2);
      }
    });
  });
});
