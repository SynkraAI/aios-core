/**
 * AIOS Memory Layer - Embedding Model Loader
 *
 * Lazy-loads the all-MiniLM-L6-v2 model for local embedding generation.
 * Uses @xenova/transformers (ONNX-based) for Node.js execution.
 */

import { pipeline, env } from '@xenova/transformers';
import * as fs from 'fs';
import * as path from 'path';

// Pipeline type - use generic callable type since @xenova/transformers types are inconsistent
type EmbeddingPipeline = (
  text: string | string[],
  options?: { pooling?: string; normalize?: boolean }
) => Promise<{ data: Float32Array }>;

// Configure transformers.js for local caching
env.cacheDir = path.join(process.cwd(), '.aios', 'models');
env.allowLocalModels = true;
env.allowRemoteModels = true;

// Model configuration
export const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
export const MODEL_DIMENSIONS = 384;

// Singleton instance
let embeddingPipeline: EmbeddingPipeline | null = null;
let isLoading = false;
let loadError: Error | null = null;

export interface ModelLoadProgress {
  status: 'downloading' | 'loading' | 'ready' | 'error';
  progress?: number;
  file?: string;
  loaded?: number;
  total?: number;
}

export type ProgressCallback = (progress: ModelLoadProgress) => void;

/**
 * Ensure model cache directory exists.
 */
function ensureModelCacheDir(): void {
  const cacheDir = env.cacheDir as string;
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * Check if model is already cached locally.
 */
export function isModelCached(): boolean {
  const cacheDir = env.cacheDir as string;
  const modelDir = path.join(cacheDir, 'Xenova', 'all-MiniLM-L6-v2');
  return fs.existsSync(modelDir);
}

/**
 * Get the embedding pipeline, loading if necessary.
 * Uses lazy loading - model is only downloaded/loaded on first use.
 */
export async function getEmbeddingPipeline(
  onProgress?: ProgressCallback
): Promise<EmbeddingPipeline> {
  // Return cached instance
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  // Return error if previous load failed
  if (loadError) {
    throw loadError;
  }

  // Wait if already loading
  if (isLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (embeddingPipeline) {
          clearInterval(checkInterval);
          resolve(embeddingPipeline);
        } else if (loadError) {
          clearInterval(checkInterval);
          reject(loadError);
        }
      }, 100);
    });
  }

  isLoading = true;
  ensureModelCacheDir();

  try {
    onProgress?.({ status: 'loading' });

    // Create the feature-extraction pipeline
    embeddingPipeline = await pipeline(
      'feature-extraction',
      MODEL_NAME,
      {
        progress_callback: (progress: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (progress.status === 'download') {
            onProgress?.({
              status: 'downloading',
              file: progress.file,
              loaded: progress.loaded,
              total: progress.total,
              progress: progress.total ? (progress.loaded || 0) / progress.total : undefined
            });
          }
        }
      }
    ) as unknown as EmbeddingPipeline;

    onProgress?.({ status: 'ready' });
    isLoading = false;
    return embeddingPipeline;
  } catch (error) {
    loadError = error instanceof Error ? error : new Error(String(error));
    isLoading = false;
    onProgress?.({ status: 'error' });
    throw loadError;
  }
}

/**
 * Preload the model (optional - for faster first embedding).
 */
export async function preloadModel(onProgress?: ProgressCallback): Promise<void> {
  await getEmbeddingPipeline(onProgress);
}

/**
 * Check if model is loaded and ready.
 */
export function isModelLoaded(): boolean {
  return embeddingPipeline !== null;
}

/**
 * Unload the model to free memory.
 */
export function unloadModel(): void {
  embeddingPipeline = null;
  loadError = null;
  isLoading = false;
}

/**
 * Get model information.
 */
export function getModelInfo(): {
  name: string;
  dimensions: number;
  cached: boolean;
  loaded: boolean;
} {
  return {
    name: MODEL_NAME,
    dimensions: MODEL_DIMENSIONS,
    cached: isModelCached(),
    loaded: isModelLoaded()
  };
}
