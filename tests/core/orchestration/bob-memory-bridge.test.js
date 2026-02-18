/**
 * Tests for BobMemoryBridge
 *
 * Memory Pipeline Integration — Feature-gated MIS consumer for Bob Orchestrator.
 *
 * Tests:
 * - Constructor validation
 * - Feature gate: Pro not installed → returns empty values
 * - Feature gate: Pro installed → calls MemoryLoader
 * - Timeout protection → returns empty on timeout
 * - GotchasMemory always works (open-core)
 * - Each public method: happy path + degradation
 */

'use strict';

const path = require('path');

// Mock pro dependencies before requiring the module
const mockFeatureGate = {
  isAvailable: jest.fn(() => false),
};

const mockMemoryLoader = {
  queryMemories: jest.fn(async () => []),
  loadForAgent: jest.fn(async () => []),
};

const mockSelfLearner = {
  run: jest.fn(async () => ({ stats: { promoted: 1, demoted: 0 } })),
};

const mockDigestExtractor = jest.fn(async () => ({
  outputPath: '/tmp/digest.yaml',
}));

const mockGotchasMemory = {
  getContextForTask: jest.fn(() => [
    { id: 'g1', title: 'Test gotcha', severity: 'warning', relevanceScore: 3 },
  ]),
};

// Setup module mocks
jest.mock('../../../../pro/license/feature-gate', () => ({
  featureGate: mockFeatureGate,
}), { virtual: true });

jest.mock('../../../../pro/memory/memory-loader', () => ({
  createMemoryLoader: jest.fn(() => mockMemoryLoader),
}), { virtual: true });

jest.mock('../../../../pro/memory/self-learner', () => ({
  createSelfLearner: jest.fn(() => mockSelfLearner),
}), { virtual: true });

jest.mock('../../../../pro/memory/session-digest/extractor', () => ({
  extractSessionDigest: mockDigestExtractor,
}), { virtual: true });

jest.mock('../../../.aios-core/core/memory/gotchas-memory', () => ({
  GotchasMemory: jest.fn(() => mockGotchasMemory),
}));

const { BobMemoryBridge, TIMEOUTS } = require('../../../.aios-core/core/orchestration/bob-memory-bridge');

describe('BobMemoryBridge', () => {
  let bridge;
  const projectRoot = '/tmp/test-project';

  beforeEach(() => {
    bridge = new BobMemoryBridge(projectRoot, { debug: false });
    // Reset all mocks
    jest.clearAllMocks();
    mockFeatureGate.isAvailable.mockReturnValue(false);
  });

  afterEach(() => {
    bridge._reset();
  });

  // ═══════════════════════════════════════════════════════════════
  //                      CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════

  describe('constructor', () => {
    it('should throw if projectRoot is not provided', () => {
      expect(() => new BobMemoryBridge()).toThrow('projectRoot is required');
    });

    it('should throw if projectRoot is not a string', () => {
      expect(() => new BobMemoryBridge(123)).toThrow('projectRoot is required and must be a string');
    });

    it('should initialize with defaults', () => {
      const b = new BobMemoryBridge('/test');
      expect(b.projectRoot).toBe('/test');
      expect(b.options.debug).toBe(false);
      expect(b._initialized).toBe(false);
    });

    it('should accept debug option', () => {
      const b = new BobMemoryBridge('/test', { debug: true });
      expect(b.options.debug).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                      FEATURE GATE
  // ═══════════════════════════════════════════════════════════════

  describe('_isAvailable', () => {
    it('should return false when Pro is not installed', () => {
      // Force re-init with no pro
      bridge._reset();
      bridge._featureGate = null;
      bridge._initialized = true;

      expect(bridge._isAvailable('pro.memory.extended')).toBe(false);
    });

    it('should delegate to featureGate.isAvailable when Pro is installed', () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      expect(bridge._isAvailable('pro.memory.extended')).toBe(true);
      expect(mockFeatureGate.isAvailable).toHaveBeenCalledWith('pro.memory.extended');
    });

    it('should return false if featureGate.isAvailable throws', () => {
      mockFeatureGate.isAvailable.mockImplementation(() => { throw new Error('license error'); });
      expect(bridge._isAvailable('pro.memory.extended')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                  loadProjectMemories
  // ═══════════════════════════════════════════════════════════════

  describe('loadProjectMemories', () => {
    it('should return gotchas even without Pro', async () => {
      const result = await bridge.loadProjectMemories({ title: 'Test epic' });

      expect(result.gotchas).toHaveLength(1);
      expect(result.gotchas[0].title).toBe('Test gotcha');
      expect(result.memories).toHaveLength(0);
      expect(result.metadata.gotchasCount).toBe(1);
      expect(result.metadata.memoriesCount).toBe(0);
    });

    it('should load Pro memories when feature is available', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockMemoryLoader.queryMemories.mockResolvedValue([
        { content: 'test memory', confidence: 0.85 },
      ]);

      const result = await bridge.loadProjectMemories({ title: 'Test epic' });

      expect(result.memories).toHaveLength(1);
      expect(result.memories[0].confidence).toBe(0.85);
      expect(result.metadata.maxConfidence).toBe(0.85);
      expect(result.metadata.source).toBe('pro');
    });

    it('should return empty memories on timeout', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockMemoryLoader.queryMemories.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([{ content: 'late' }]), 200)),
      );

      // Use very short timeout for test
      const origTimeout = TIMEOUTS.loadProjectMemories;
      TIMEOUTS.loadProjectMemories = 1; // 1ms

      const result = await bridge.loadProjectMemories({ title: 'Test' });

      TIMEOUTS.loadProjectMemories = origTimeout;

      expect(result.memories).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockMemoryLoader.queryMemories.mockRejectedValue(new Error('loader crash'));

      const result = await bridge.loadProjectMemories({ title: 'Test' });

      expect(result.memories).toHaveLength(0);
      expect(result.gotchas).toHaveLength(1); // Gotchas still work
    });

    it('should include timestamp in metadata', async () => {
      const result = await bridge.loadProjectMemories({});
      expect(result.metadata.timestamp).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                    getPhaseMemories
  // ═══════════════════════════════════════════════════════════════

  describe('getPhaseMemories', () => {
    it('should return gotchas for phase context without Pro', async () => {
      const result = await bridge.getPhaseMemories('2_development', '@dev', { story: 'test.story.md' });

      expect(result.gotchas).toHaveLength(1);
      expect(result.memories).toHaveLength(0);
      expect(result.metadata.phase).toBe('2_development');
      expect(result.metadata.agentId).toBe('@dev');
    });

    it('should load Pro agent memories when feature is available', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockMemoryLoader.loadForAgent.mockResolvedValue([
        { content: 'dev tip', confidence: 0.9 },
        { content: 'pattern', confidence: 0.7 },
      ]);

      const result = await bridge.getPhaseMemories('2_development', '@dev', {});

      expect(result.memories).toHaveLength(2);
      expect(result.metadata.maxConfidence).toBe(0.9);
      expect(mockMemoryLoader.loadForAgent).toHaveBeenCalledWith('@dev', expect.objectContaining({ phase: '2_development' }));
    });

    it('should handle empty Pro memories', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockMemoryLoader.loadForAgent.mockResolvedValue([]);

      const result = await bridge.getPhaseMemories('1_validation', '@po', {});

      expect(result.memories).toHaveLength(0);
      expect(result.metadata.maxConfidence).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                  generateSessionDigest
  // ═══════════════════════════════════════════════════════════════

  describe('generateSessionDigest', () => {
    it('should return not-success when Pro is unavailable', async () => {
      const result = await bridge.generateSessionDigest({ sessionId: 'test' });

      expect(result.success).toBe(false);
      expect(result.digestPath).toBeNull();
    });

    it('should generate digest when Pro is available', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);

      const result = await bridge.generateSessionDigest({
        sessionId: 'bob-123',
        projectDir: '/tmp/project',
        metadata: { activeStory: 'test.story.md' },
      });

      expect(result.success).toBe(true);
      expect(result.digestPath).toBe('/tmp/digest.yaml');
      expect(mockDigestExtractor).toHaveBeenCalledWith(expect.objectContaining({
        sessionId: 'bob-123',
        projectDir: '/tmp/project',
      }));
    });

    it('should handle extractor returning null', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockDigestExtractor.mockResolvedValue(null);

      const result = await bridge.generateSessionDigest({});

      expect(result.success).toBe(false);
    });

    it('should handle extractor error gracefully', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockDigestExtractor.mockRejectedValue(new Error('disk full'));

      const result = await bridge.generateSessionDigest({});

      expect(result.success).toBe(false);
      expect(result.digestPath).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                   triggerSelfLearning
  // ═══════════════════════════════════════════════════════════════

  describe('triggerSelfLearning', () => {
    it('should return not-success when Pro is unavailable', async () => {
      const result = await bridge.triggerSelfLearning();

      expect(result.success).toBe(false);
      expect(result.stats).toEqual({});
    });

    it('should run self-learning when Pro is available', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);

      const result = await bridge.triggerSelfLearning({ verbose: true });

      expect(result.success).toBe(true);
      expect(result.stats).toEqual({ promoted: 1, demoted: 0 });
      expect(mockSelfLearner.run).toHaveBeenCalledWith({ verbose: true });
    });

    it('should handle self-learner error gracefully', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockSelfLearner.run.mockRejectedValue(new Error('analysis failed'));

      const result = await bridge.triggerSelfLearning();

      expect(result.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                    _executeWithTimeout
  // ═══════════════════════════════════════════════════════════════

  describe('_executeWithTimeout', () => {
    it('should return result within timeout', async () => {
      const result = await bridge._executeWithTimeout(
        () => Promise.resolve('ok'),
        100,
      );
      expect(result).toBe('ok');
    });

    it('should return null on timeout', async () => {
      const result = await bridge._executeWithTimeout(
        () => new Promise(resolve => setTimeout(() => resolve('late'), 200)),
        1,
      );
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const result = await bridge._executeWithTimeout(
        () => Promise.reject(new Error('boom')),
        100,
      );
      expect(result).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                       _reset
  // ═══════════════════════════════════════════════════════════════

  describe('_reset', () => {
    it('should clear all cached state', () => {
      bridge._init();
      bridge._reset();

      expect(bridge._initialized).toBe(false);
      expect(bridge._featureGate).toBeNull();
      expect(bridge._memoryLoader).toBeNull();
      expect(bridge._selfLearner).toBeNull();
      expect(bridge._digestExtractor).toBeNull();
      expect(bridge._gotchasMemory).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                    TIMEOUTS CONFIG
  // ═══════════════════════════════════════════════════════════════

  describe('TIMEOUTS', () => {
    it('should have correct timeout values', () => {
      expect(TIMEOUTS.loadProjectMemories).toBe(50);
      expect(TIMEOUTS.getPhaseMemories).toBe(15);
      expect(TIMEOUTS.generateSessionDigest).toBe(5000);
      expect(TIMEOUTS.triggerSelfLearning).toBe(30000);
    });
  });
});
