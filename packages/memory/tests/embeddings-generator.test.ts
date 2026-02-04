/**
 * AIOS Memory Layer - Embedding Generator Tests
 *
 * Tests for embedding generation functionality.
 * Uses mocked @xenova/transformers pipeline.
 */

import {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  getEmbeddingDimensions
} from '../src/embeddings/generator';
import {
  MODEL_DIMENSIONS,
  isModelLoaded,
  unloadModel,
  getModelInfo
} from '../src/embeddings/model-loader';

// Mock is provided by jest.config.js moduleNameMapper

describe('Embedding Generator', () => {
  beforeAll(() => {
    // Ensure clean state
    if (isModelLoaded()) {
      unloadModel();
    }
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      const embedding = await generateEmbedding('Hello world');

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(MODEL_DIMENSIONS);
    });

    it('should generate normalized embedding by default', async () => {
      const embedding = await generateEmbedding('Test text');

      // Calculate L2 norm
      const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

      // Should be approximately 1 (normalized)
      expect(norm).toBeCloseTo(1, 5);
    });

    it('should return zero vector for empty text', async () => {
      const embedding = await generateEmbedding('');

      expect(embedding.length).toBe(MODEL_DIMENSIONS);
      expect(embedding.every(v => v === 0)).toBe(true);
    });

    it('should return zero vector for whitespace-only text', async () => {
      const embedding = await generateEmbedding('   ');

      expect(embedding.every(v => v === 0)).toBe(true);
    });

    it('should skip normalization when requested', async () => {
      const embedding = await generateEmbedding('Test', { normalize: false });

      expect(embedding.length).toBe(MODEL_DIMENSIONS);
      // Just verify it returns something - norm will vary
    });
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['First text', 'Second text', 'Third text'];
      const embeddings = await generateEmbeddings(texts);

      expect(embeddings.length).toBe(3);
      embeddings.forEach(emb => {
        expect(emb.length).toBe(MODEL_DIMENSIONS);
      });
    });

    it('should return empty array for empty input', async () => {
      const embeddings = await generateEmbeddings([]);

      expect(embeddings).toEqual([]);
    });

    it('should handle mixed empty and non-empty texts', async () => {
      const texts = ['Valid text', '', 'Another valid'];
      const embeddings = await generateEmbeddings(texts);

      expect(embeddings.length).toBe(3);
      expect(embeddings[0].length).toBe(MODEL_DIMENSIONS);
      expect(embeddings[1].every(v => v === 0)).toBe(true);
      expect(embeddings[2].length).toBe(MODEL_DIMENSIONS);
    });

    it('should report progress during batch processing', async () => {
      const texts = ['One', 'Two', 'Three', 'Four', 'Five'];
      const progressUpdates: Array<{ current: number; total: number; percentage: number }> = [];

      await generateEmbeddings(texts, {
        batchSize: 2,
        onProgress: (progress) => {
          progressUpdates.push({ ...progress });
        }
      });

      expect(progressUpdates.length).toBe(5);
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
    });

    it('should use custom batch size', async () => {
      const texts = Array(10).fill('Test text');
      let progressCount = 0;

      await generateEmbeddings(texts, {
        batchSize: 5,
        onProgress: () => {
          progressCount++;
        }
      });

      expect(progressCount).toBe(10);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate similarity between identical vectors', () => {
      const vec = [1, 2, 3, 4, 5];
      const similarity = cosineSimilarity(vec, vec);

      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      const similarity = cosineSimilarity(vecA, vecB);

      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [-1, -2, -3];
      const similarity = cosineSimilarity(vecA, vecB);

      expect(similarity).toBeCloseTo(-1, 5);
    });

    it('should throw for vectors of different dimensions', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2];

      expect(() => cosineSimilarity(vecA, vecB)).toThrow('Embeddings must have same dimensions');
    });

    it('should handle zero vectors', () => {
      const vecA = [0, 0, 0];
      const vecB = [1, 2, 3];
      const similarity = cosineSimilarity(vecA, vecB);

      expect(similarity).toBe(0);
    });
  });

  describe('getEmbeddingDimensions', () => {
    it('should return correct dimensions', () => {
      expect(getEmbeddingDimensions()).toBe(384);
    });

    it('should match MODEL_DIMENSIONS constant', () => {
      expect(getEmbeddingDimensions()).toBe(MODEL_DIMENSIONS);
    });
  });
});

describe('Model Loader', () => {
  describe('getModelInfo', () => {
    it('should return model information', () => {
      const info = getModelInfo();

      expect(info.name).toBe('Xenova/all-MiniLM-L6-v2');
      expect(info.dimensions).toBe(384);
      expect(typeof info.loaded).toBe('boolean');
    });
  });

  describe('MODEL_DIMENSIONS', () => {
    it('should be 384 for all-MiniLM-L6-v2', () => {
      expect(MODEL_DIMENSIONS).toBe(384);
    });
  });
});
