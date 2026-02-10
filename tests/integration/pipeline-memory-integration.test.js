/**
 * UnifiedActivationPipeline Memory Integration Tests (MIS-6)
 *
 * Tests the complete pipeline flow with memory injection:
 * - Scenario 1: Activation WITHOUT pro/ → no memories, no errors
 * - Scenario 2: Activation WITH pro/ but no digests → empty array, no errors
 * - Scenario 3: Activation WITH pro/ and digests → memories injected correctly
 * - Scenario 4: Token budget respected → never exceeds configured limit
 * - Scenario 5: Agent scoping enforced → only own + shared memories
 *
 * @module __tests__/integration/pipeline-memory-integration
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const { UnifiedActivationPipeline } = require('../../.aios-core/development/scripts/unified-activation-pipeline');

// Mock pro-detector for testing different scenarios
jest.mock('../../bin/utils/pro-detector');
const proDetector = require('../../bin/utils/pro-detector');

describe('UnifiedActivationPipeline Memory Integration (MIS-6)', () => {
  let pipeline;
  const testProjectRoot = path.join(__dirname, '..', 'fixtures', 'test-project-memory');

  beforeEach(() => {
    pipeline = new UnifiedActivationPipeline(testProjectRoot);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup test data
    try {
      const digestsPath = path.join(testProjectRoot, '.aios', 'session-digests');
      await fs.rm(digestsPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  /**
   * SCENARIO 1: Activation WITHOUT pro/ → no memories, no errors
   */
  describe('Scenario 1: No Pro Available', () => {
    beforeEach(() => {
      // Mock pro as unavailable
      proDetector.isProAvailable.mockReturnValue(false);
      proDetector.loadProModule.mockReturnValue(null);
    });

    it('should activate successfully with empty memories array', async () => {
      const result = await pipeline.activate('dev');

      expect(result).toBeDefined();
      expect(result.greeting).toBeDefined();
      expect(result.context).toBeDefined();
      expect(result.context.memories).toEqual([]);
      expect(result.fallback).toBe(false);
    });

    it('should not throw errors when pro is unavailable', async () => {
      await expect(pipeline.activate('qa')).resolves.toBeDefined();
    });

    it('should work for all agent IDs', async () => {
      const agentIds = ['dev', 'qa', 'architect', 'pm', 'po'];

      for (const agentId of agentIds) {
        const result = await pipeline.activate(agentId);
        expect(result.context.memories).toEqual([]);
      }
    });
  });

  /**
   * SCENARIO 2: Activation WITH pro/ but no digests → empty array, no errors
   */
  describe('Scenario 2: Pro Available, No Digests', () => {
    beforeEach(() => {
      // Mock pro as available but return mock classes
      proDetector.isProAvailable.mockReturnValue(true);

      // Mock MemoryLoader that returns empty results (no digests)
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent() {
          return { memories: [], metadata: { count: 0, tokensUsed: 0 } };
        }
      };

      // Mock feature gate as enabled
      const mockFeatureGate = {
        featureGate: {
          isAvailable: jest.fn().mockReturnValue(true)
        }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') {
          return MockMemoryLoader;
        }
        if (module === 'license/feature-gate') {
          return mockFeatureGate;
        }
        return null;
      });
    });

    it('should activate successfully with empty memories array', async () => {
      const result = await pipeline.activate('dev');

      expect(result).toBeDefined();
      expect(result.context.memories).toEqual([]);
      expect(result.metrics.loaders.memories).toBeDefined();
      expect(result.metrics.loaders.memories.status).toBe('ok');
    });

    it('should not throw errors when digests directory is empty', async () => {
      await expect(pipeline.activate('architect')).resolves.toBeDefined();
    });
  });

  /**
   * SCENARIO 3: Activation WITH pro/ and digests → memories injected correctly
   */
  describe('Scenario 3: Pro Available, With Digests', () => {
    const mockMemories = [
      {
        id: 'mem-001',
        title: 'Test Memory 1',
        summary: 'HOT memory about testing',
        sector: 'procedural',
        tier: 'hot',
        attention_score: 0.8,
        agent: 'dev'
      },
      {
        id: 'mem-002',
        title: 'Test Memory 2',
        summary: 'WARM memory about architecture',
        sector: 'semantic',
        tier: 'warm',
        attention_score: 0.5,
        agent: 'dev'
      }
    ];

    beforeEach(() => {
      proDetector.isProAvailable.mockReturnValue(true);

      // Mock MemoryLoader that returns test memories
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent(agentId, options) {
          return {
            memories: mockMemories,
            metadata: {
              agent: agentId,
              count: 2,
              tokensUsed: 450,
              budget: options.budget || 2000,
              tiers: ['hot', 'warm']
            }
          };
        }
      };

      const mockFeatureGate = {
        featureGate: {
          isAvailable: jest.fn().mockReturnValue(true)
        }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') {
          return MockMemoryLoader;
        }
        if (module === 'license/feature-gate') {
          return mockFeatureGate;
        }
        return null;
      });
    });

    it('should inject memories into enrichedContext', async () => {
      const result = await pipeline.activate('dev');

      expect(result.context.memories).toHaveLength(2);
      expect(result.context.memories[0]).toMatchObject({
        id: 'mem-001',
        title: 'Test Memory 1',
        tier: 'hot'
      });
    });

    it('should include memory metadata in metrics', async () => {
      const result = await pipeline.activate('dev');

      expect(result.metrics.loaders.memories).toBeDefined();
      expect(result.metrics.loaders.memories.status).toBe('ok');
      expect(result.metrics.loaders.memories.duration).toBeGreaterThan(0);
    });

    it('should maintain activation quality as "full"', async () => {
      const result = await pipeline.activate('dev');

      expect(result.quality).toBe('full');
      expect(result.fallback).toBe(false);
    });
  });

  /**
   * SCENARIO 4: Token budget respected → never exceeds configured limit
   */
  describe('Scenario 4: Token Budget Enforcement', () => {
    beforeEach(() => {
      proDetector.isProAvailable.mockReturnValue(true);

      // Mock MemoryLoader that respects budget
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent(agentId, options) {
          const budget = options.budget || 2000;
          // Simulate budget enforcement
          const memories = [];
          let tokensUsed = 0;

          // Add memories until budget is reached
          for (let i = 0; i < 10; i++) {
            const memoryTokens = 200;
            if (tokensUsed + memoryTokens > budget) break;

            memories.push({
              id: `mem-${i}`,
              title: `Memory ${i}`,
              summary: 'Test memory',
              sector: 'procedural',
              tier: 'hot',
              attention_score: 0.7,
              agent: agentId
            });
            tokensUsed += memoryTokens;
          }

          return {
            memories,
            metadata: { count: memories.length, tokensUsed, budget }
          };
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });
    });

    it('should never exceed configured budget', async () => {
      // Test with different budget values
      const budgets = [500, 1000, 2000];

      for (const budget of budgets) {
        // Mock agent config with custom budget
        const originalActivate = pipeline.activate.bind(pipeline);
        pipeline.activate = async (agentId, options) => {
          return originalActivate(agentId, {
            ...options,
            _testMemoryBudget: budget
          });
        };

        const result = await pipeline.activate('dev');

        // Verify memories are within budget
        expect(result.context.memories.length).toBeLessThanOrEqual(budget / 200);
      }
    });

    it('should stop adding memories when budget is reached', async () => {
      const result = await pipeline.activate('dev');

      // With default 2000 budget and 200 tokens per memory, max is 10 memories
      expect(result.context.memories.length).toBeLessThanOrEqual(10);
    });
  });

  /**
   * SCENARIO 5: Agent scoping enforced → only own + shared memories
   */
  describe('Scenario 5: Agent Scoping Privacy', () => {
    beforeEach(() => {
      proDetector.isProAvailable.mockReturnValue(true);

      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent(agentId, options) {
          // Simulate proper agent scoping
          const allMemories = [
            { id: 'mem-dev-1', agent: 'dev', title: 'Dev Memory' },
            { id: 'mem-qa-1', agent: 'qa', title: 'QA Memory' },
            { id: 'mem-shared-1', agent: 'shared', title: 'Shared Memory' }
          ];

          // Filter to only agent's own + shared
          const memories = allMemories.filter(m =>
            m.agent === agentId || m.agent === 'shared'
          );

          return {
            memories,
            metadata: { count: memories.length, tokensUsed: memories.length * 200 }
          };
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });
    });

    it('should only return dev + shared memories for dev agent', async () => {
      const result = await pipeline.activate('dev');

      const agents = result.context.memories.map(m => m.agent);
      expect(agents).toContain('dev');
      expect(agents).toContain('shared');
      expect(agents).not.toContain('qa');
    });

    it('should only return qa + shared memories for qa agent', async () => {
      const result = await pipeline.activate('qa');

      const agents = result.context.memories.map(m => m.agent);
      expect(agents).toContain('qa');
      expect(agents).toContain('shared');
      expect(agents).not.toContain('dev');
    });

    it('should never leak private memories between agents', async () => {
      const devResult = await pipeline.activate('dev');
      const qaResult = await pipeline.activate('qa');

      const devAgents = devResult.context.memories.map(m => m.agent);
      const qaAgents = qaResult.context.memories.map(m => m.agent);

      // Dev should not see QA memories
      expect(devAgents).not.toContain('qa');
      // QA should not see Dev memories
      expect(qaAgents).not.toContain('dev');
      // Both should see shared
      expect(devAgents).toContain('shared');
      expect(qaAgents).toContain('shared');
    });
  });

  /**
   * EDGE CASES & ERROR HANDLING
   */
  describe('Edge Cases', () => {
    it('should handle feature gate disabled gracefully', async () => {
      proDetector.isProAvailable.mockReturnValue(true);

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(false) }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });

      const result = await pipeline.activate('dev');
      expect(result.context.memories).toEqual([]);
    });

    it('should handle memory loader errors gracefully', async () => {
      proDetector.isProAvailable.mockReturnValue(true);

      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent() {
          throw new Error('Simulated memory load error');
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });

      // Should not throw, should gracefully degrade
      const result = await pipeline.activate('dev');
      expect(result.context.memories).toEqual([]);
      expect(result.metrics.loaders.memories).toBeDefined();
    });

    it('should handle timeout gracefully (< 500ms)', async () => {
      proDetector.isProAvailable.mockReturnValue(true);

      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent() {
          // Simulate slow load
          await new Promise(resolve => setTimeout(resolve, 600));
          return { memories: [], metadata: {} };
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) }
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });

      const result = await pipeline.activate('dev');

      // Should timeout and return empty memories
      expect(result.context.memories).toEqual([]);
      expect(result.metrics.loaders.memories.status).toBe('timeout');
    }, 10000); // Increase test timeout
  });
});
