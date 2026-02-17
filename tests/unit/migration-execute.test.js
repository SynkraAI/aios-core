/**
 * Migration Execute Module Tests
 *
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  createModuleDirectories,
  migrateModule,
  executeMigration,
  saveMigrationState,
  loadMigrationState,
  clearMigrationState,
} = require('../../.aios-core/cli/commands/migrate/execute');
const { analyzeMigrationPlan } = require('../../.aios-core/cli/commands/migrate/analyze');

describe('Migration Execute Module', () => {
  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `aios-execute-test-${Date.now()}`);
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (testDir && fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('createModuleDirectories', () => {
    it('should create all four module directories', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(aiosCoreDir, { recursive: true });

      const result = await createModuleDirectories(aiosCoreDir);

      expect(fs.existsSync(path.join(aiosCoreDir, 'core'))).toBe(true);
      expect(fs.existsSync(path.join(aiosCoreDir, 'development'))).toBe(true);
      expect(fs.existsSync(path.join(aiosCoreDir, 'product'))).toBe(true);
      expect(fs.existsSync(path.join(aiosCoreDir, 'infrastructure'))).toBe(true);
      expect(result.modules).toContain('core');
    });

    it('should not fail if directories already exist', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'core'), { recursive: true });

      const result = await createModuleDirectories(aiosCoreDir);

      expect(result.created).not.toContain(path.join(aiosCoreDir, 'core'));
    });
  });

  describe('migrateModule', () => {
    it('should migrate files to module directory', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'development'), { recursive: true });
      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');

      const moduleData = {
        files: [{
          sourcePath: path.join(aiosCoreDir, 'agents', 'dev.md'),
          relativePath: path.join('agents', 'dev.md'),
          size: 5,
        }],
      };

      const result = await migrateModule(moduleData, 'development', aiosCoreDir);

      expect(result.migratedFiles).toHaveLength(1);
      expect(fs.existsSync(path.join(aiosCoreDir, 'development', 'agents', 'dev.md'))).toBe(true);
    });

    it('should support dry run mode', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'development'), { recursive: true });
      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');

      const moduleData = {
        files: [{
          sourcePath: path.join(aiosCoreDir, 'agents', 'dev.md'),
          relativePath: path.join('agents', 'dev.md'),
          size: 5,
        }],
      };

      const result = await migrateModule(moduleData, 'development', aiosCoreDir, { dryRun: true });

      expect(result.migratedFiles).toHaveLength(1);
      expect(result.migratedFiles[0].dryRun).toBe(true);
      // File should NOT be copied in dry run
      expect(fs.existsSync(path.join(aiosCoreDir, 'development', 'agents', 'dev.md'))).toBe(false);
    });
  });

  describe('executeMigration', () => {
    it('should execute full migration', async () => {
      // Create v2.0 structure
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'registry'), { recursive: true });
      await fs.promises.mkdir(path.join(aiosCoreDir, 'cli'), { recursive: true });
      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');
      await fs.promises.writeFile(path.join(aiosCoreDir, 'registry', 'index.js'), 'Registry');
      await fs.promises.writeFile(path.join(aiosCoreDir, 'cli', 'index.js'), 'CLI');

      const plan = await analyzeMigrationPlan(testDir);
      const result = await executeMigration(plan, { cleanupOriginals: false });

      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(3);
      expect(fs.existsSync(path.join(aiosCoreDir, 'development', 'agents', 'dev.md'))).toBe(true);
      expect(fs.existsSync(path.join(aiosCoreDir, 'core', 'registry', 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(aiosCoreDir, 'product', 'cli', 'index.js'))).toBe(true);
    });

    it('should return error for non-migratable plan', async () => {
      const plan = { canMigrate: false, error: 'Test error' };
      const result = await executeMigration(plan);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should support dry run', async () => {
      const aiosCoreDir = path.join(testDir, '.aios-core');
      await fs.promises.mkdir(path.join(aiosCoreDir, 'agents'), { recursive: true });
      await fs.promises.writeFile(path.join(aiosCoreDir, 'agents', 'dev.md'), 'Agent');

      const plan = await analyzeMigrationPlan(testDir);
      const result = await executeMigration(plan, { dryRun: true });

      expect(result.dryRun).toBe(true);
      // Directories should not be created in dry run
      expect(fs.existsSync(path.join(aiosCoreDir, 'development'))).toBe(false);
    });
  });

  describe('Migration State', () => {
    it('should save and load migration state', async () => {
      await saveMigrationState(testDir, { phase: 'test', value: 123 });

      const state = await loadMigrationState(testDir);

      expect(state.phase).toBe('test');
      expect(state.value).toBe(123);
      expect(state.timestamp).toBeTruthy();
    });

    it('should return null if no state exists', async () => {
      const state = await loadMigrationState(testDir);
      expect(state).toBeNull();
    });

    it('should clear migration state', async () => {
      await saveMigrationState(testDir, { phase: 'test' });
      await clearMigrationState(testDir);

      const state = await loadMigrationState(testDir);
      expect(state).toBeNull();
    });
  });
});
