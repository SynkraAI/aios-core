/**
 * Tests for config-resolver.js
 * Story PRO-4 — Config Hierarchy
 *
 * Covers: unit tests (Task 5.1), integration tests (Task 5.2), performance (Task 5.4)
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  resolveConfig,
  isLegacyMode,
  loadLayeredConfig,
  loadLegacyConfig,
  getConfigAtLevel,
  CONFIG_FILES,
  LEVELS,
} = require('../../.aios-core/core/config/config-resolver');
const { globalConfigCache } = require('../../.aios-core/core/config/config-cache');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/**
 * Create a temporary project directory with specific config files.
 */
function createTempProject(files = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-config-test-'));
  const aiosCoreDir = path.join(tmpDir, '.aios-core');
  fs.mkdirSync(aiosCoreDir, { recursive: true });

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    if (typeof content === 'string') {
      fs.writeFileSync(fullPath, content, 'utf8');
    } else {
      // Copy from fixtures
      const fixturePath = path.join(FIXTURES_DIR, content.fixture);
      fs.copyFileSync(fixturePath, fullPath);
    }
  }

  return tmpDir;
}

function cleanupTempDir(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('config-resolver', () => {
  beforeEach(() => {
    globalConfigCache.clear();
  });

  // ------------------------------------------------------------------
  // Unit Tests
  // ------------------------------------------------------------------

  describe('constants', () => {
    test('CONFIG_FILES has all expected keys', () => {
      expect(CONFIG_FILES).toHaveProperty('framework');
      expect(CONFIG_FILES).toHaveProperty('project');
      expect(CONFIG_FILES).toHaveProperty('pro');
      expect(CONFIG_FILES).toHaveProperty('local');
      expect(CONFIG_FILES).toHaveProperty('legacy');
    });

    test('LEVELS has all expected keys', () => {
      expect(LEVELS.framework).toBe('L1');
      expect(LEVELS.project).toBe('L2');
      expect(LEVELS.pro).toBe('Pro');
      expect(LEVELS.app).toBe('L3');
      expect(LEVELS.local).toBe('L4');
      expect(LEVELS.legacy).toBe('Legacy');
    });
  });

  describe('isLegacyMode', () => {
    test('returns true when core-config.yaml exists but framework-config.yaml does not', () => {
      const tmpDir = createTempProject({
        '.aios-core/core-config.yaml': 'project:\n  name: legacy\n',
      });

      try {
        expect(isLegacyMode(tmpDir)).toBe(true);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns false when framework-config.yaml exists', () => {
      const tmpDir = createTempProject({
        '.aios-core/core-config.yaml': 'project:\n  name: legacy\n',
        '.aios-core/framework-config.yaml': 'metadata:\n  version: "1.0"\n',
      });

      try {
        expect(isLegacyMode(tmpDir)).toBe(false);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns false when neither file exists', () => {
      const tmpDir = createTempProject({});

      try {
        expect(isLegacyMode(tmpDir)).toBe(false);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  describe('getConfigAtLevel', () => {
    test('loads framework config at L1', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        const config = getConfigAtLevel(tmpDir, 'L1');
        expect(config).toBeTruthy();
        expect(config.metadata.framework_name).toBe('AIOS-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('loads project config at L2', () => {
      const tmpDir = createTempProject({
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const config = getConfigAtLevel(tmpDir, 'L2');
        expect(config.project.name).toBe('test-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns null when file does not exist', () => {
      const tmpDir = createTempProject({});

      try {
        const config = getConfigAtLevel(tmpDir, 'L1');
        expect(config).toBeNull();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('returns null for app level without appDir', () => {
      const tmpDir = createTempProject({});

      try {
        expect(getConfigAtLevel(tmpDir, 'L3')).toBeNull();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('throws on unknown level', () => {
      expect(() => getConfigAtLevel('/tmp', 'unknown')).toThrow('Unknown config level');
    });

    test('supports string aliases (1, 2, L1, L2, etc.)', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        expect(getConfigAtLevel(tmpDir, '1')).toBeTruthy();
        expect(getConfigAtLevel(tmpDir, 'framework')).toBeTruthy();
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // ------------------------------------------------------------------
  // Integration Tests
  // ------------------------------------------------------------------

  describe('loadLegacyConfig', () => {
    test('loads monolithic core-config.yaml', () => {
      const tmpDir = createTempProject({
        '.aios-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });

      try {
        const result = loadLegacyConfig(tmpDir);
        expect(result.config.project.name).toBe('legacy-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('includes deprecation warning', () => {
      const tmpDir = createTempProject({
        '.aios-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });
      const origEnv = process.env.AIOS_SUPPRESS_DEPRECATION;

      try {
        delete process.env.AIOS_SUPPRESS_DEPRECATION;

        const result = loadLegacyConfig(tmpDir);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('DEPRECATION');
      } finally {
        if (origEnv === undefined) {
          delete process.env.AIOS_SUPPRESS_DEPRECATION;
        } else {
          process.env.AIOS_SUPPRESS_DEPRECATION = origEnv;
        }
        cleanupTempDir(tmpDir);
      }
    });

    test('suppresses deprecation when AIOS_SUPPRESS_DEPRECATION=true', () => {
      const tmpDir = createTempProject({
        '.aios-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });
      const origEnv = process.env.AIOS_SUPPRESS_DEPRECATION;

      try {
        process.env.AIOS_SUPPRESS_DEPRECATION = 'true';

        const result = loadLegacyConfig(tmpDir);
        expect(result.warnings).toHaveLength(0);
      } finally {
        if (origEnv === undefined) {
          delete process.env.AIOS_SUPPRESS_DEPRECATION;
        } else {
          process.env.AIOS_SUPPRESS_DEPRECATION = origEnv;
        }
        cleanupTempDir(tmpDir);
      }
    });

    test('throws when legacy file is missing', () => {
      const tmpDir = createTempProject({});

      try {
        expect(() => loadLegacyConfig(tmpDir)).toThrow('Legacy config file not found');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  describe('loadLayeredConfig — 4-level resolution', () => {
    test('merges L1 and L2 correctly', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // L1 values present
        expect(result.config.metadata.framework_name).toBe('AIOS-FullStack');
        // L2 overrides L1
        expect(result.config.performance_defaults.max_concurrent_operations).toBe(8);
        // L2 additions
        expect(result.config.project.name).toBe('test-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('merges L1 + L2 + L4 correctly', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
        '.aios-core/local-config.yaml': { fixture: 'local-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // L4 overrides L2 scalar
        expect(result.config.performance_defaults.max_concurrent_operations).toBe(16);
        // L4 additions
        expect(result.config.ide.selected).toEqual(['vscode', 'claude-code']);
        // L1 values preserved
        expect(result.config.metadata.framework_name).toBe('AIOS-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('includes Pro extension when present', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
        'pro/pro-config.yaml': { fixture: 'pro-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // Pro overrides L2 squad settings
        expect(result.config.squads.max_squads).toBe(10);
        expect(result.config.squads.premium_templates).toBe(true);
        // Pro addition
        expect(result.config.pro_features.advanced_analytics).toBe(true);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('silently skips missing Pro extension', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        // No error, and pro_features not present
        expect(result.config.pro_features).toBeUndefined();
        expect(result.config.squads.max_squads).toBe(3);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('debug mode tracks sources', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = loadLayeredConfig(tmpDir, { debug: true });
        expect(result.sources).toBeTruthy();
        // Framework values tracked as L1
        expect(result.sources['metadata']).toEqual(
          expect.objectContaining({ level: 'L1' }),
        );
        // Project values tracked as L2
        expect(result.sources['project']).toEqual(
          expect.objectContaining({ level: 'L2' }),
        );
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('lints L1 and L2 for env patterns', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': 'url: "${API_URL}"\n',
        '.aios-core/project-config.yaml': 'name: "clean"\n',
      });

      try {
        const result = loadLayeredConfig(tmpDir);
        const lintWarnings = result.warnings.filter(w => w.startsWith('[LINT]'));
        expect(lintWarnings.length).toBeGreaterThan(0);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  describe('resolveConfig — main entry point', () => {
    test('auto-detects legacy mode', () => {
      const tmpDir = createTempProject({
        '.aios-core/core-config.yaml': { fixture: 'legacy-core-config.yaml' },
      });

      try {
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.legacy).toBe(true);
        expect(result.config.project.name).toBe('legacy-project');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('auto-detects layered mode', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
      });

      try {
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.legacy).toBe(false);
        expect(result.config.metadata.framework_name).toBe('AIOS-FullStack');
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('interpolates env vars after merge', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': 'metadata:\n  name: "test"\n',
        '.aios-core/local-config.yaml': 'api_url: "${TEST_API_URL:-http://localhost}"\n',
      });
      const origTestApiUrl = process.env.TEST_API_URL;

      try {
        delete process.env.TEST_API_URL;
        const result = resolveConfig(tmpDir, { skipCache: true });
        expect(result.config.api_url).toBe('http://localhost');
      } finally {
        if (origTestApiUrl === undefined) {
          delete process.env.TEST_API_URL;
        } else {
          process.env.TEST_API_URL = origTestApiUrl;
        }
        cleanupTempDir(tmpDir);
      }
    });

    test('caches resolved config', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        const result1 = resolveConfig(tmpDir);
        const result2 = resolveConfig(tmpDir);
        // Same reference from cache
        expect(result1).toBe(result2);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test('skipCache bypasses cache', () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
      });

      try {
        const result1 = resolveConfig(tmpDir);
        const result2 = resolveConfig(tmpDir, { skipCache: true });
        // Different references
        expect(result1).not.toBe(result2);
        // But same content
        expect(result1.config).toEqual(result2.config);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });

  // ------------------------------------------------------------------
  // Performance Tests (Task 5.4)
  // ------------------------------------------------------------------

  describe('performance benchmarks', () => {
    const isCI = !!process.env.CI;
    const COLD_START_LIMIT = isCI ? 300 : 100;
    const CACHED_READ_LIMIT = isCI ? 50 : 5;

    test(`cold start resolution < ${COLD_START_LIMIT}ms`, () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
        '.aios-core/local-config.yaml': { fixture: 'local-config.yaml' },
      });

      try {
        globalConfigCache.clear();

        const start = process.hrtime.bigint();
        resolveConfig(tmpDir, { skipCache: true });
        const end = process.hrtime.bigint();

        const durationMs = Number(end - start) / 1_000_000;
        expect(durationMs).toBeLessThan(COLD_START_LIMIT);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });

    test(`cached read < ${CACHED_READ_LIMIT}ms`, () => {
      const tmpDir = createTempProject({
        '.aios-core/framework-config.yaml': { fixture: 'framework-config.yaml' },
        '.aios-core/project-config.yaml': { fixture: 'project-config.yaml' },
        '.aios-core/local-config.yaml': { fixture: 'local-config.yaml' },
      });

      try {
        // Warm up cache
        resolveConfig(tmpDir);

        const start = process.hrtime.bigint();
        resolveConfig(tmpDir);
        const end = process.hrtime.bigint();

        const durationMs = Number(end - start) / 1_000_000;
        expect(durationMs).toBeLessThan(CACHED_READ_LIMIT);
      } finally {
        cleanupTempDir(tmpDir);
      }
    });
  });
});
