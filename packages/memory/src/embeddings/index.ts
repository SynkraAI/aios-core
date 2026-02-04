/**
 * AIOS Memory Layer - Embeddings Module
 *
 * Public exports for embedding generation functionality.
 */

// Model loader
export {
  MODEL_NAME,
  MODEL_DIMENSIONS,
  getEmbeddingPipeline,
  preloadModel,
  isModelLoaded,
  isModelCached,
  unloadModel,
  getModelInfo,
  type ModelLoadProgress,
  type ProgressCallback
} from './model-loader';

// Embedding generator
export {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  getEmbeddingDimensions,
  type BatchProgress,
  type BatchProgressCallback
} from './generator';

// Cache
export {
  hashContent,
  createCacheSchema,
  getCachedEmbedding,
  cacheEmbedding,
  getCacheStats,
  resetCacheStats,
  clearCache,
  clearOldCache,
  invalidateCacheEntry,
  type CacheStats
} from './cache';

// Cached generator (combines generator + cache)
export {
  generateEmbeddingCached,
  generateEmbeddingsCached,
  getEmbeddingCacheStats,
  type CachedGeneratorOptions
} from './cached-generator';
