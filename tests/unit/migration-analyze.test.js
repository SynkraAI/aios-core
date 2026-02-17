/**
 * Migration Analyze Module Tests
 *
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  MODULE_MAPPING,
  detectV2Structure,
  categorizeFile,
  analyzeMigrationPlan,
  formatSize,
  formatMigrationPlan,
  analyzeImports,
} = require('../../.aios-core/cli/commands/migrate/analyze');

describe('Migration Analyze Module', () => {
  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `aios-analyze-test-${Date.now()}`);
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (testDir && fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('MODULE_MAPPING', () => {
    it('should have all four modules defined', () => {
      expect(MODULE_MAPPING).toHaveProperty('core');
      expect(MODULE_MAPPING).toHaveProperty('development');
      expect(MODULE_MAPPING).toHaveProperty('product');
      expect(MODULE_MAPPING).toHaveProperty('infrastructure');
    });

    it('should have directories for each module', () => {
      expect(MODULE_MAPPING.core.directories).toContain('registry');
      expect(MODULE_MAPPING.development.directories).toContain('agents');
      expect(MODULE_MAPPING.product.directories).toContain('cli');
      expect(MODULE_MAPPING.infrastructure.directories).toContain('hooks');
    });
  });

  describe('detectV2Structure', () => {
    it('should detect v2.0 flat structure', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'tasks'), { recursive: true });

      const result = await detectV2Structure(testDir);

      expect(result.isV2).toBe(true);
      expect(result.isV21).toBe(false);
      expect(result.version).toBe('2.0');
    });

    it('should detect v2.1 modular structure', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'core'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'development'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'product'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'infrastructure'), { recursive: true });

      const result = await detectV2Structure(testDir);

      expect(result.isV2).toBe(false);
      expect(result.isV21).toBe(true);
      expect(result.version).toBe('2.1');
    });

    it('should return error if no .aios-core exists', async () => {
      const result = await detectV2Structure(testDir);

      expect(result.isV2).toBe(false);
      expect(result.isV21).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('categorizeFile', () => {
    it('should categorize agents to development', () => {
      expect(categorizeFile('agents/dev.md')).toBe('development');
    });

    it('should categorize registry to core', () => {
      expect(categorizeFile('registry/service.json')).toBe('core');
    });

    it('should categorize cli to product', () => {
      expect(categorizeFile('cli/index.js')).toBe('product');
    });

    it('should categorize hooks to infrastructure', () => {
      expect(categorizeFile('hooks/pre-commit.js')).toBe('infrastructure');
    });

    it('should categorize root files to core', () => {
      expect(categorizeFile('index.js')).toBe('core');
    });

    it('should return null for unknown directories', () => {
      expect(categorizeFile('unknown/file.js')).toBeNull();
    });
  });

  describe('analyzeMigrationPlan', () => {
    it('should generate migration plan for v2.0 project', async () => {
      // Create v2.0 structure
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'tasks'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'registry'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'cli'), { recursive: true });

      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');
      await fs.promises.writeFile(path.join(aiosCoreDir, 'tasks', 'build.md'), 'Task');
      await fs.promises.writeFile(path.join(aiosCoreDir, 'registry', 'index.js'), 'Registry');
      await fs.promises.writeFile(path.join(aiosCoreDir, 'cli', 'index.js'), 'CLI');

      const plan = await analyzeMigrationPlan(testDir);

      expect(plan.canMigrate).toBe(true);
      expect(plan.sourceVersion).toBe('2.0');
      expect(plan.targetVersion).toBe('2.1');
      expect(plan.totalFiles).toBe(4);
      expect(plan.modules.development.files).toHaveLength(2); // agents + tasks
      expect(plan.modules.core.files).toHaveLength(1); // registry
      expect(plan.modules.product.files).toHaveLength(1); // cli
    });

    it('should return canMigrate false for v2.1 project', async () => {
      // Create v2.1 structure
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'core'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'development'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'product'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'infrastructure'), { recursive: true });

      const plan = await analyzeMigrationPlan(testDir);

      expect(plan.canMigrate).toBe(false);
    });

    it('should detect conflicts', async () => {
      // Create v2.0 structure with existing v2.1 dir
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'core'), { recursive: true }); // Conflict

      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');

      const plan = await analyzeMigrationPlan(testDir);

      expect(plan.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('formatSize', () => {
    it('should format bytes correctly', () => {
      expect(formatSize(500)).toBe('500 B');
      expect(formatSize(1024)).toBe('1.0 KB');
      expect(formatSize(1536)).toBe('1.5 KB');
      expect(formatSize(1048576)).toBe('1.0 MB');
    });
  });

  describe('formatMigrationPlan', () => {
    it('should format plan as table', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');

      const plan = await analyzeMigrationPlan(testDir);
      const formatted = formatMigrationPlan(plan);

      expect(formatted).toContain('Migration Plan:');
      expect(formatted).toContain('Module');
      expect(formatted).toContain('Files');
      expect(formatted).toContain('Size');
    });
  });

  describe('analyzeImports', () => {
    it('should analyze importable files', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'cli'), { recursive: true });
      await fs.promises.writeFile(path.join(aiosCoreDir, 'cli', 'index.js'), 'module.exports = {}');

      const plan = await analyzeMigrationPlan(testDir);
      const imports = analyzeImports(plan);

      expect(imports).toHaveProperty('totalImportableFiles');
      expect(imports).toHaveProperty('byModule');
      expect(imports.byModule.product).toBeGreaterThanOrEqual(0);
    });
  });
});
