/**
 * Unit tests for config-loader module
 *
 * Tests the lazy-loading config loader with caching, agent-specific
 * section loading, performance metrics, and validation.
 */

const path = require('path');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));
jest.mock('js-yaml');

const fs = require('fs').promises;
const yaml = require('js-yaml');

const {
  loadFullConfig,
  loadConfigSections,
  loadAgentConfig,
  loadMinimalConfig,
  preloadConfig,
  clearCache,
  getPerformanceMetrics,
  validateAgentConfig,
  getConfigSection,
  agentRequirements,
  ALWAYS_LOADED,
} = require('../../../.aios-core/core/config/config-loader');

describe('config-loader', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    // Clear cache between tests
    clearCache();
  });

  // ============================================================
  // Constants
  // ============================================================
  describe('constants', () => {
    test('ALWAYS_LOADED contains core sections', () => {
      expect(ALWAYS_LOADED).toContain('frameworkDocsLocation');
      expect(ALWAYS_LOADED).toContain('projectDocsLocation');
      expect(ALWAYS_LOADED).toContain('devLoadAlwaysFiles');
      expect(ALWAYS_LOADED).toContain('lazyLoading');
    });

    test('agentRequirements maps known agents', () => {
      expect(agentRequirements.dev).toBeDefined();
      expect(agentRequirements.qa).toBeDefined();
      expect(agentRequirements.po).toBeDefined();
      expect(agentRequirements.architect).toBeDefined();
      expect(agentRequirements.devops).toBeDefined();
    });

    test('all agents have ALWAYS_LOADED sections', () => {
      for (const [, sections] of Object.entries(agentRequirements)) {
        for (const required of ALWAYS_LOADED) {
          expect(sections).toContain(required);
        }
      }
    });

    test('dev agent has specialized sections', () => {
      expect(agentRequirements.dev).toContain('pvMindContext');
      expect(agentRequirements.dev).toContain('hybridOpsConfig');
    });
  });

  // ============================================================
  // loadFullConfig
  // ============================================================
  describe('loadFullConfig', () => {
    test('loads and parses YAML config file', async () => {
      const mockConfig = { frameworkDocsLocation: 'docs/', lazyLoading: true };
      fs.readFile.mockResolvedValue('yaml content');
      yaml.load.mockReturnValue(mockConfig);

      const result = await loadFullConfig();
      expect(result).toEqual(mockConfig);
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join('.aios-core', 'core-config.yaml'),
        'utf8'
      );
    });

    test('throws on file read error', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      await expect(loadFullConfig()).rejects.toThrow('Config load failed');
    });

    test('logs error message on failure', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      try { await loadFullConfig(); } catch {}
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ============================================================
  // loadConfigSections
  // ============================================================
  describe('loadConfigSections', () => {
    test('loads requested sections from full config', async () => {
      const mockConfig = {
        frameworkDocsLocation: 'docs/',
        lazyLoading: true,
        toolConfigurations: { lint: true },
      };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      const result = await loadConfigSections(['frameworkDocsLocation', 'lazyLoading']);
      expect(result.frameworkDocsLocation).toBe('docs/');
      expect(result.lazyLoading).toBe(true);
      expect(result.toolConfigurations).toBeUndefined();
    });

    test('ignores non-existent sections', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({ a: 1 });

      const result = await loadConfigSections(['a', 'nonExistent']);
      expect(result.a).toBe(1);
      expect(result.nonExistent).toBeUndefined();
    });

    test('uses cache on second call', async () => {
      const mockConfig = { a: 1, b: 2 };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      // First call loads
      await loadConfigSections(['a']);
      // Second call should use cache
      const result = await loadConfigSections(['b']);
      expect(result.b).toBe(2);
      // readFile should be called only once (cached)
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // loadAgentConfig
  // ============================================================
  describe('loadAgentConfig', () => {
    test('loads config for known agent', async () => {
      const mockConfig = {
        frameworkDocsLocation: 'docs/',
        projectDocsLocation: 'pdocs/',
        devLoadAlwaysFiles: [],
        lazyLoading: true,
        toolConfigurations: { lint: true },
      };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      const result = await loadAgentConfig('qa');
      expect(result.frameworkDocsLocation).toBe('docs/');
      expect(result.toolConfigurations).toEqual({ lint: true });
    });

    test('falls back to ALWAYS_LOADED for unknown agent', async () => {
      const mockConfig = {
        frameworkDocsLocation: 'docs/',
        projectDocsLocation: 'pdocs/',
        devLoadAlwaysFiles: [],
        lazyLoading: true,
        toolConfigurations: { lint: true },
      };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      const result = await loadAgentConfig('unknown-agent');
      expect(result.frameworkDocsLocation).toBe('docs/');
      // Unknown agent should NOT get toolConfigurations (not in ALWAYS_LOADED)
      expect(result.toolConfigurations).toBeUndefined();
    });

    test('logs loading messages', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({});

      await loadAgentConfig('dev');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('@dev')
      );
    });
  });

  // ============================================================
  // loadMinimalConfig
  // ============================================================
  describe('loadMinimalConfig', () => {
    test('loads only ALWAYS_LOADED sections', async () => {
      const mockConfig = {
        frameworkDocsLocation: 'docs/',
        projectDocsLocation: 'pdocs/',
        devLoadAlwaysFiles: ['a.js'],
        lazyLoading: true,
        toolConfigurations: { lint: true },
        pvMindContext: {},
      };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      const result = await loadMinimalConfig();
      expect(result.frameworkDocsLocation).toBe('docs/');
      expect(result.lazyLoading).toBe(true);
      // Should NOT include non-ALWAYS_LOADED sections
      expect(result.toolConfigurations).toBeUndefined();
      expect(result.pvMindContext).toBeUndefined();
    });
  });

  // ============================================================
  // preloadConfig
  // ============================================================
  describe('preloadConfig', () => {
    test('loads full config into cache', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({ a: 1 });

      await preloadConfig();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Preloading'));
    });
  });

  // ============================================================
  // clearCache
  // ============================================================
  describe('clearCache', () => {
    test('forces reload on next call', async () => {
      const mockConfig = { a: 1 };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      await loadConfigSections(['a']);
      clearCache();
      await loadConfigSections(['a']);

      // After clear, readFile should be called again
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // getPerformanceMetrics
  // ============================================================
  describe('getPerformanceMetrics', () => {
    test('returns metrics object', () => {
      const metrics = getPerformanceMetrics();
      expect(metrics).toHaveProperty('loads');
      expect(metrics).toHaveProperty('cacheHits');
      expect(metrics).toHaveProperty('cacheMisses');
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics).toHaveProperty('avgLoadTimeMs');
    });

    test('cacheHitRate is a percentage string', () => {
      const metrics = getPerformanceMetrics();
      expect(metrics.cacheHitRate).toMatch(/^\d+(\.\d+)?%$/);
    });
  });

  // ============================================================
  // validateAgentConfig
  // ============================================================
  describe('validateAgentConfig', () => {
    test('returns valid when all sections exist', async () => {
      const mockConfig = {
        frameworkDocsLocation: 'docs/',
        projectDocsLocation: 'pdocs/',
        devLoadAlwaysFiles: [],
        lazyLoading: true,
      };
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue(mockConfig);

      const result = await validateAgentConfig('pm');
      expect(result.valid).toBe(true);
      expect(result.missingSections).toHaveLength(0);
      expect(result.agentId).toBe('pm');
    });

    test('returns invalid when sections are missing', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({});

      const result = await validateAgentConfig('dev');
      expect(result.valid).toBe(false);
      expect(result.missingSections.length).toBeGreaterThan(0);
    });

    test('uses ALWAYS_LOADED for unknown agent', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({
        frameworkDocsLocation: 'docs/',
        projectDocsLocation: 'pdocs/',
        devLoadAlwaysFiles: [],
        lazyLoading: true,
      });

      const result = await validateAgentConfig('custom');
      expect(result.valid).toBe(true);
      expect(result.requiredSections).toEqual(ALWAYS_LOADED);
    });
  });

  // ============================================================
  // getConfigSection
  // ============================================================
  describe('getConfigSection', () => {
    test('returns specific section', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({ toolConfigurations: { lint: true } });

      const result = await getConfigSection('toolConfigurations');
      expect(result).toEqual({ lint: true });
    });

    test('returns undefined for non-existent section', async () => {
      fs.readFile.mockResolvedValue('yaml');
      yaml.load.mockReturnValue({});

      const result = await getConfigSection('nonExistent');
      expect(result).toBeUndefined();
    });
  });
});
