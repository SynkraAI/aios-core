'use strict';

let mockIsAvailable = false;
let mockAnalyzeResult = null;
let mockRegistryData = null;

const mockClient = {
  analyzeDependencies: jest.fn().mockImplementation(async () => mockAnalyzeResult),
};

jest.mock('../../.aios-core/core/code-intel', () => ({
  getClient: () => mockClient,
  isCodeIntelAvailable: () => mockIsAvailable,
}));

jest.mock('../../.aios-core/core/ids/registry-loader', () => ({
  RegistryLoader: jest.fn().mockImplementation(() => ({
    load: () => mockRegistryData,
  })),
}));

const { CodeIntelSource } = require('../../.aios-core/core/graph-dashboard/data-sources/code-intel-source');

describe('CodeIntelSource', () => {
  let source;

  beforeEach(() => {
    source = new CodeIntelSource({ cacheTTL: 0 });
    mockIsAvailable = false;
    mockAnalyzeResult = null;
    mockClient.analyzeDependencies.mockImplementation(async () => mockAnalyzeResult);
    mockRegistryData = {
      metadata: { entityCount: 3, lastUpdated: '2026-01-01' },
      entities: {
        tasks: {
          'task-a': { path: 'tasks/a.md', type: 'task', purpose: 'A', dependencies: ['task-b'], usedBy: [] },
          'task-b': { path: 'tasks/b.md', type: 'task', purpose: 'B', dependencies: [], usedBy: ['task-a'] },
        },
        agents: {
          dev: { path: 'agents/dev.md', type: 'agent', purpose: 'Dev', dependencies: ['task-a'], usedBy: [] },
        },
      },
    };
  });

  describe('getData - fallback to registry', () => {
    it('should return registry data when code-intel is unavailable', async () => {
      mockIsAvailable = false;
      const result = await source.getData();

      expect(result.source).toBe('registry');
      expect(result.isFallback).toBe(true);
      expect(result.nodes.length).toBe(3);
      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should group nodes by category from registry', async () => {
      const result = await source.getData();
      const categories = [...new Set(result.nodes.map((n) => n.category))];

      expect(categories).toContain('tasks');
      expect(categories).toContain('agents');
    });

    it('should create edges from dependencies', async () => {
      const result = await source.getData();
      const dependsEdges = result.edges.filter((e) => e.type === 'depends');

      expect(dependsEdges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ from: 'task-a', to: 'task-b', type: 'depends' }),
          expect.objectContaining({ from: 'dev', to: 'task-a', type: 'depends' }),
        ])
      );
    });

    it('should deduplicate edges from dependencies + usedBy', async () => {
      const result = await source.getData();
      const edgeKeys = result.edges.map((e) => `${e.from}->${e.type}->${e.to}`);
      const uniqueKeys = [...new Set(edgeKeys)];

      expect(edgeKeys.length).toBe(uniqueKeys.length);
    });
  });

  describe('getData - code-intel provider', () => {
    it('should use code-intel when available', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = {
        nodes: [{ id: 'foo', label: 'foo', type: 'module', path: 'foo.js', category: 'modules' }],
        edges: [{ from: 'foo', to: 'bar', type: 'depends' }],
      };

      const result = await source.getData();

      expect(result.source).toBe('code-intel');
      expect(result.isFallback).toBe(false);
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });

    it('should fall back to registry if code-intel throws', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = null;

      // Force analyzeDependencies to throw
      mockClient.analyzeDependencies.mockRejectedValueOnce(new Error('Provider offline'));

      const result = await source.getData();

      expect(result.source).toBe('registry');
      expect(result.isFallback).toBe(true);
    });
  });

  describe('getData - normalization', () => {
    it('should handle array-format dependencies', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = [
        { id: 'a', name: 'a', type: 'task', path: 'a.md', dependencies: ['b'] },
        { id: 'b', name: 'b', type: 'task', path: 'b.md', dependencies: [] },
      ];

      const result = await source.getData();

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toEqual(
        expect.arrayContaining([expect.objectContaining({ from: 'a', to: 'b' })])
      );
    });

    it('should handle null/undefined deps gracefully', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = null;

      mockClient.analyzeDependencies.mockResolvedValueOnce(null);

      const result = await source.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should handle flat object with dependencies property', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = {
        dependencies: {
          'mod-x': { type: 'module', path: 'x.js', dependencies: ['mod-y'] },
          'mod-y': { type: 'module', path: 'y.js' },
        },
      };

      const result = await source.getData();

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'mod-x' }),
          expect.objectContaining({ id: 'mod-y' }),
        ])
      );
      expect(result.edges).toEqual(
        expect.arrayContaining([expect.objectContaining({ from: 'mod-x', to: 'mod-y' })])
      );
    });
  });

  describe('getData - registry fallback error', () => {
    it('should return empty graph when RegistryLoader throws', async () => {
      mockRegistryData = null;
      const { RegistryLoader } = require('../../.aios-core/core/ids/registry-loader');
      RegistryLoader.mockImplementationOnce(() => ({
        load: () => { throw new Error('Registry file missing'); },
      }));

      const result = await source.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.source).toBe('registry');
      expect(result.isFallback).toBe(true);
    });
  });

  describe('getData - empty registry', () => {
    it('should handle empty registry gracefully', async () => {
      mockRegistryData = { metadata: { entityCount: 0 }, entities: {} };

      const result = await source.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.isFallback).toBe(true);
    });
  });

  describe('caching', () => {
    it('should return cached data when not stale', async () => {
      const cachedSource = new CodeIntelSource({ cacheTTL: 60000 });
      const first = await cachedSource.getData();
      const second = await cachedSource.getData();

      expect(first.timestamp).toBe(second.timestamp);
    });

    it('should report stale correctly', () => {
      expect(source.isStale()).toBe(true);
      expect(source.getLastUpdate()).toBe(0);
    });
  });
});
