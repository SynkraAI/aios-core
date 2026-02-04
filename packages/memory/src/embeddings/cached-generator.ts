/**
 * AIOS Memory Layer - Cached Embedding Generator
 *
 * Wraps the embedding generator with SQLite cache for performance.
 */

import Database from 'better-sqlite3';
import { generateEmbedding, generateEmbeddings, BatchProgressCallback } from './generator';
import { ProgressCallback } from './model-loader';
import { getCachedEmbedding, cacheEmbedding, getCacheStats, CacheStats } from './cache';

export interface CachedGeneratorOptions {
  db: Database.Database;
  useCache?: boolean;
  normalize?: boolean;
  onModelLoad?: ProgressCallback;
}

/**
 * Generate embedding with cache support.
 */
export async function generateEmbeddingCached(
  text: string,
  options: CachedGeneratorOptions
): Promise<number[]> {
  const { db, useCache = true, normalize, onModelLoad } = options;

  // Try cache first
  if (useCache) {
    const cached = getCachedEmbedding(db, text);
    if (cached) {
      return cached;
    }
  }

  // Generate embedding
  const embedding = await generateEmbedding(text, { normalize, onModelLoad });

  // Cache the result
  if (useCache) {
    cacheEmbedding(db, text, embedding);
  }

  return embedding;
}

/**
 * Generate embeddings for multiple texts with cache support.
 */
export async function generateEmbeddingsCached(
  texts: string[],
  options: CachedGeneratorOptions & {
    batchSize?: number;
    onProgress?: BatchProgressCallback;
  }
): Promise<number[][]> {
  const { db, useCache = true, normalize, onModelLoad, batchSize, onProgress } = options;

  if (!texts || texts.length === 0) {
    return [];
  }

  const results: number[][] = [];
  const textsToGenerate: { index: number; text: string }[] = [];

  // Check cache for each text
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    if (useCache) {
      const cached = getCachedEmbedding(db, text);
      if (cached) {
        results[i] = cached;
        continue;
      }
    }

    textsToGenerate.push({ index: i, text });
  }

  // Generate uncached embeddings
  if (textsToGenerate.length > 0) {
    const uncachedTexts = textsToGenerate.map(t => t.text);

    const generated = await generateEmbeddings(uncachedTexts, {
      batchSize,
      normalize,
      onModelLoad,
      onProgress: onProgress ? (progress) => {
        // Adjust progress to account for cache hits
        const adjustedTotal = texts.length;
        const cachedCount = texts.length - textsToGenerate.length;
        const adjustedCurrent = cachedCount + progress.current;
        onProgress({
          current: adjustedCurrent,
          total: adjustedTotal,
          percentage: Math.round((adjustedCurrent / adjustedTotal) * 100)
        });
      } : undefined
    });

    // Store results and cache
    for (let i = 0; i < textsToGenerate.length; i++) {
      const { index, text } = textsToGenerate[i];
      const embedding = generated[i];

      results[index] = embedding;

      if (useCache) {
        cacheEmbedding(db, text, embedding);
      }
    }
  }

  return results;
}

/**
 * Get cache statistics.
 */
export function getEmbeddingCacheStats(db: Database.Database): CacheStats {
  return getCacheStats(db);
}
