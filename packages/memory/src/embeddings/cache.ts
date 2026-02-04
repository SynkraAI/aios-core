/**
 * AIOS Memory Layer - Embedding Cache
 *
 * SQLite-based cache for embeddings to avoid recomputation.
 * Uses content hash (SHA-256) as key.
 */

import * as crypto from 'crypto';
import Database from 'better-sqlite3';
import { MODEL_NAME, MODEL_DIMENSIONS } from './model-loader';

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  modelVersion: string;
}

// In-memory statistics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Generate SHA-256 hash of content for cache key.
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create the embedding cache table if it doesn't exist.
 */
export function createCacheSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS aios_embedding_cache (
      content_hash TEXT PRIMARY KEY,
      embedding BLOB NOT NULL,
      model_version TEXT NOT NULL,
      dimensions INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_embedding_cache_model
    ON aios_embedding_cache(model_version)
  `);
}

/**
 * Get cached embedding by content hash.
 */
export function getCachedEmbedding(
  db: Database.Database,
  content: string
): number[] | null {
  const hash = hashContent(content);

  const row = db.prepare(`
    SELECT embedding, model_version, dimensions
    FROM aios_embedding_cache
    WHERE content_hash = ? AND model_version = ?
  `).get(hash, MODEL_NAME) as { embedding: Buffer; model_version: string; dimensions: number } | undefined;

  if (row) {
    cacheHits++;
    // Convert BLOB to number array
    const floatArray = new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.dimensions);
    return Array.from(floatArray);
  }

  cacheMisses++;
  return null;
}

/**
 * Store embedding in cache.
 */
export function cacheEmbedding(
  db: Database.Database,
  content: string,
  embedding: number[]
): void {
  const hash = hashContent(content);

  // Convert number array to BLOB
  const floatArray = new Float32Array(embedding);
  const buffer = Buffer.from(floatArray.buffer);

  db.prepare(`
    INSERT OR REPLACE INTO aios_embedding_cache
    (content_hash, embedding, model_version, dimensions, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(hash, buffer, MODEL_NAME, MODEL_DIMENSIONS);
}

/**
 * Get cache statistics.
 */
export function getCacheStats(db: Database.Database): CacheStats {
  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM aios_embedding_cache WHERE model_version = ?
  `).get(MODEL_NAME) as { count: number };

  const totalRequests = cacheHits + cacheMisses;
  const hitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate,
    totalEntries: countResult.count,
    modelVersion: MODEL_NAME
  };
}

/**
 * Reset cache statistics.
 */
export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Clear all cached embeddings.
 */
export function clearCache(db: Database.Database): number {
  const result = db.prepare(`
    DELETE FROM aios_embedding_cache WHERE model_version = ?
  `).run(MODEL_NAME);

  resetCacheStats();
  return result.changes;
}

/**
 * Clear old cached embeddings (from previous model versions).
 */
export function clearOldCache(db: Database.Database): number {
  const result = db.prepare(`
    DELETE FROM aios_embedding_cache WHERE model_version != ?
  `).run(MODEL_NAME);

  return result.changes;
}

/**
 * Invalidate cache entry for specific content.
 */
export function invalidateCacheEntry(
  db: Database.Database,
  content: string
): boolean {
  const hash = hashContent(content);

  const result = db.prepare(`
    DELETE FROM aios_embedding_cache WHERE content_hash = ?
  `).run(hash);

  return result.changes > 0;
}
