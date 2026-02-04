/**
 * Mock for @xenova/transformers
 *
 * Provides mock implementations for testing without downloading the actual model.
 */

// Track call counts for testing
let callCount = 0;

// Mock environment
export const env = {
  cacheDir: '/tmp/test-cache',
  allowLocalModels: true,
  allowRemoteModels: true
};

// Mock pipeline instance that tracks calls
const createMockPipelineInstance = () => {
  return async (text: string) => {
    callCount++;
    // Generate deterministic mock embeddings based on text
    const data = new Float32Array(384);
    for (let i = 0; i < 384; i++) {
      data[i] = (text.charCodeAt(i % Math.max(text.length, 1)) || i) / 1000;
    }
    return { data };
  };
};

export const pipeline = jest.fn().mockImplementation(async () => {
  return createMockPipelineInstance();
});

// Mock Pipeline type
export type Pipeline = ReturnType<typeof createMockPipelineInstance>;

export const __getCallCount = () => callCount;
export const __resetCallCount = () => {
  callCount = 0;
};
