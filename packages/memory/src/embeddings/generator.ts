/**
 * AIOS Memory Layer - Embedding Generator
 *
 * Generates embeddings using the all-MiniLM-L6-v2 model.
 * Supports single and batch processing with L2 normalization.
 */

import { getEmbeddingPipeline, MODEL_DIMENSIONS, ProgressCallback } from './model-loader';

export interface BatchProgress {
  current: number;
  total: number;
  percentage: number;
}

export type BatchProgressCallback = (progress: BatchProgress) => void;

/**
 * Normalize a vector to unit length (L2 norm = 1).
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    return vector;
  }
  return vector.map(val => val / magnitude);
}

/**
 * Generate embedding for a single text.
 *
 * @param text - The text to embed
 * @param options - Optional configuration
 * @returns 384-dimensional normalized vector
 */
export async function generateEmbedding(
  text: string,
  options?: {
    normalize?: boolean;
    onModelLoad?: ProgressCallback;
  }
): Promise<number[]> {
  // Handle empty/null input
  if (!text || text.trim().length === 0) {
    // Return zero vector for empty input
    return new Array(MODEL_DIMENSIONS).fill(0);
  }

  const pipeline = await getEmbeddingPipeline(options?.onModelLoad);

  // Generate embedding
  const result = await pipeline(text, {
    pooling: 'mean',
    normalize: false // We do our own normalization
  });

  // Extract the embedding array
  const embedding = Array.from(result.data as Float32Array);

  // Normalize if requested (default: true)
  if (options?.normalize !== false) {
    return normalizeVector(embedding);
  }

  return embedding;
}

/**
 * Generate embeddings for multiple texts efficiently.
 *
 * @param texts - Array of texts to embed
 * @param options - Optional configuration
 * @returns Array of 384-dimensional normalized vectors
 */
export async function generateEmbeddings(
  texts: string[],
  options?: {
    batchSize?: number;
    normalize?: boolean;
    onProgress?: BatchProgressCallback;
    onModelLoad?: ProgressCallback;
  }
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const batchSize = options?.batchSize ?? 32;
  const results: number[][] = [];
  const total = texts.length;

  // Load model once before processing
  const pipeline = await getEmbeddingPipeline(options?.onModelLoad);

  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // Process each text in the batch
    for (let j = 0; j < batch.length; j++) {
      const text = batch[j];
      const globalIndex = i + j;

      // Handle empty text
      if (!text || text.trim().length === 0) {
        results.push(new Array(MODEL_DIMENSIONS).fill(0));
      } else {
        // Generate embedding
        const result = await pipeline(text, {
          pooling: 'mean',
          normalize: false
        });

        let embedding = Array.from(result.data as Float32Array);

        // Normalize if requested (default: true)
        if (options?.normalize !== false) {
          embedding = normalizeVector(embedding);
        }

        results.push(embedding);
      }

      // Report progress
      options?.onProgress?.({
        current: globalIndex + 1,
        total,
        percentage: Math.round(((globalIndex + 1) / total) * 100)
      });
    }
  }

  return results;
}

/**
 * Calculate cosine similarity between two embeddings.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Get the embedding dimensions.
 */
export function getEmbeddingDimensions(): number {
  return MODEL_DIMENSIONS;
}
