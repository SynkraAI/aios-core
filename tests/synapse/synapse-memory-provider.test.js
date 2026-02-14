/**
 * SynapseMemoryProvider Tests
 *
 * Tests for the pro-gated MIS retrieval provider used by MemoryBridge.
 *
 * @module tests/synapse/synapse-memory-provider
 * @story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 */

jest.setTimeout(10000);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFeatureGate = {
  isAvailable: jest.fn(() => true),
  require: jest.fn(),
};

jest.mock('../../pro/license/feature-gate', () => ({
  featureGate: mockFeatureGate,
  FeatureGate: jest.fn(),
}), { virtual: true });

const mockQueryMemories = jest.fn(() => Promise.resolve([]));

jest.mock('../../pro/memory/memory-loader', () => ({
  MemoryLoader: jest.fn().mockImplementation(() => ({
    queryMemories: mockQueryMemories,
  })),
  AGENT_SECTOR_PREFERENCES: {
    dev: ['procedural', 'semantic'],
    qa: ['reflective', 'episodic'],
    architect: ['semantic', 'reflective'],
    pm: ['episodic', 'semantic'],
    po: ['episodic', 'semantic'],
    sm: ['procedural', 'episodic'],
    devops: ['procedural', 'episodic'],
    analyst: ['semantic', 'reflective'],
    'data-engineer': ['procedural', 'semantic'],
    'ux-design-expert': ['reflective', 'procedural'],
  },
}), { virtual: true });

// ---------------------------------------------------------------------------
// Import (after mocks) — skip entire suite if pro/ submodule is absent (CI)
// ---------------------------------------------------------------------------

let SynapseMemoryProvider, BRACKET_CONFIG, DEFAULT_SECTORS;
let proAvailable = true;

try {
  const mod = require('../../pro/memory/synapse-memory-provider');
  SynapseMemoryProvider = mod.SynapseMemoryProvider;
  BRACKET_CONFIG = mod.BRACKET_CONFIG;
  DEFAULT_SECTORS = mod.DEFAULT_SECTORS;
} catch {
  proAvailable = false;
}

const describeIfPro = proAvailable ? describe : describe.skip;

// =============================================================================
// SynapseMemoryProvider
// =============================================================================

describeIfPro('SynapseMemoryProvider', () => {
  let provider;

  beforeEach(() => {
    mockFeatureGate.require.mockReset();
    mockQueryMemories.mockReset();
    mockQueryMemories.mockResolvedValue([]);
    provider = new SynapseMemoryProvider();
  });

  // -------------------------------------------------------------------------
  // Construction + Feature Gate
  // -------------------------------------------------------------------------

  describe('construction', () => {
    test('requires pro.memory.synapse feature', () => {
      new SynapseMemoryProvider();
      expect(mockFeatureGate.require).toHaveBeenCalledWith(
        'pro.memory.synapse',
        'SYNAPSE Memory Bridge',
      );
    });

    test('throws when feature gate denies', () => {
      mockFeatureGate.require.mockImplementation(() => {
        throw new Error('Pro feature required');
      });
      expect(() => new SynapseMemoryProvider()).toThrow('Pro feature required');
    });
  });

  // -------------------------------------------------------------------------
  // AC-4: Agent-scoped memory
  // -------------------------------------------------------------------------

  describe('agent-scoped sector filtering', () => {
    test('@dev gets procedural + semantic sectors', async () => {
      await provider.getMemories('dev', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('dev', expect.objectContaining({
        sectors: ['procedural', 'semantic'],
      }));
    });

    test('@qa gets reflective + episodic sectors', async () => {
      await provider.getMemories('qa', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('qa', expect.objectContaining({
        sectors: ['reflective', 'episodic'],
      }));
    });

    test('@architect gets semantic + reflective sectors', async () => {
      await provider.getMemories('architect', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('architect', expect.objectContaining({
        sectors: ['semantic', 'reflective'],
      }));
    });

    test('unknown agent gets default sector (semantic)', async () => {
      await provider.getMemories('unknown-agent', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('unknown-agent', expect.objectContaining({
        sectors: ['semantic'],
      }));
    });
  });

  // -------------------------------------------------------------------------
  // AC-5: Session-level caching
  // -------------------------------------------------------------------------

  describe('session-level caching', () => {
    test('caches results by agentId + bracket', async () => {
      mockQueryMemories.mockResolvedValue([
        { content: 'cached', relevance: 0.8 },
      ]);

      const first = await provider.getMemories('dev', 'MODERATE', 100);
      const second = await provider.getMemories('dev', 'MODERATE', 100);

      // queryMemories should only be called once (second call uses cache)
      expect(mockQueryMemories).toHaveBeenCalledTimes(1);
      expect(first).toEqual(second);
    });

    test('different brackets are cached separately', async () => {
      mockQueryMemories.mockResolvedValue([]);

      await provider.getMemories('dev', 'MODERATE', 50);
      await provider.getMemories('dev', 'DEPLETED', 200);

      expect(mockQueryMemories).toHaveBeenCalledTimes(2);
    });

    test('different agents are cached separately', async () => {
      mockQueryMemories.mockResolvedValue([]);

      await provider.getMemories('dev', 'MODERATE', 50);
      await provider.getMemories('qa', 'MODERATE', 50);

      expect(mockQueryMemories).toHaveBeenCalledTimes(2);
    });

    test('clearCache empties the cache', async () => {
      mockQueryMemories.mockResolvedValue([
        { content: 'test', relevance: 0.5 },
      ]);

      await provider.getMemories('dev', 'MODERATE', 100);
      provider.clearCache();
      await provider.getMemories('dev', 'MODERATE', 100);

      expect(mockQueryMemories).toHaveBeenCalledTimes(2);
    });
  });

  // -------------------------------------------------------------------------
  // Bracket configuration
  // -------------------------------------------------------------------------

  describe('bracket configuration', () => {
    test('MODERATE uses layer 1, limit 3, minRelevance 0.7', async () => {
      await provider.getMemories('dev', 'MODERATE', 50);
      expect(mockQueryMemories).toHaveBeenCalledWith('dev', expect.objectContaining({
        layer: 1,
        limit: 3,
        minRelevance: 0.7,
      }));
    });

    test('DEPLETED uses layer 2, limit 5, minRelevance 0.5', async () => {
      await provider.getMemories('dev', 'DEPLETED', 200);
      expect(mockQueryMemories).toHaveBeenCalledWith('dev', expect.objectContaining({
        layer: 2,
        limit: 5,
        minRelevance: 0.5,
      }));
    });

    test('CRITICAL uses layer 3, limit 10, minRelevance 0.3', async () => {
      await provider.getMemories('dev', 'CRITICAL', 1000);
      expect(mockQueryMemories).toHaveBeenCalledWith('dev', expect.objectContaining({
        layer: 3,
        limit: 10,
        minRelevance: 0.3,
      }));
    });

    test('unknown bracket returns []', async () => {
      const result = await provider.getMemories('dev', 'FRESH', 100);
      expect(result).toEqual([]);
      expect(mockQueryMemories).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Transform to hints
  // -------------------------------------------------------------------------

  describe('hint transformation', () => {
    test('transforms memories to hint format', async () => {
      mockQueryMemories.mockResolvedValue([
        { content: 'Use absolute imports', relevance: 0.9, sector: 'procedural' },
        { content: 'Avoid any type', relevance: 0.7, sector: 'semantic' },
      ]);

      const hints = await provider.getMemories('dev', 'MODERATE', 100);
      expect(hints.length).toBe(2);
      expect(hints[0]).toMatchObject({
        content: 'Use absolute imports',
        source: 'procedural',
        relevance: 0.9,
      });
      expect(hints[0]).toHaveProperty('tokens');
    });

    test('respects token budget in transformation', async () => {
      mockQueryMemories.mockResolvedValue([
        { content: 'x'.repeat(200), relevance: 0.9 },
        { content: 'y'.repeat(200), relevance: 0.8 },
      ]);

      // Budget of 60 tokens ~ 240 chars, first memory is 200 chars (50 tokens), second would exceed
      const hints = await provider.getMemories('dev', 'MODERATE', 60);
      expect(hints.length).toBe(1);
    });

    test('handles empty memories array', async () => {
      mockQueryMemories.mockResolvedValue([]);
      const hints = await provider.getMemories('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });

    test('uses summary or title as fallback content', async () => {
      mockQueryMemories.mockResolvedValue([
        { summary: 'Summary text', relevance: 0.6 },
      ]);

      const hints = await provider.getMemories('dev', 'MODERATE', 100);
      expect(hints.length).toBe(1);
      expect(hints[0].content).toBe('Summary text');
    });
  });
});

// =============================================================================
// Constants
// =============================================================================

describeIfPro('module constants', () => {
  test('BRACKET_CONFIG has MODERATE, DEPLETED, CRITICAL', () => {
    expect(BRACKET_CONFIG).toHaveProperty('MODERATE');
    expect(BRACKET_CONFIG).toHaveProperty('DEPLETED');
    expect(BRACKET_CONFIG).toHaveProperty('CRITICAL');
  });

  test('DEFAULT_SECTORS is [semantic]', () => {
    expect(DEFAULT_SECTORS).toEqual(['semantic']);
  });
});
