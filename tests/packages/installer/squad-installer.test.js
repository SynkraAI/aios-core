/**
 * Squad Installer Tests
 *
 * Tests for squad detection, validation, copying, symlinks, and tracking.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  detectSource,
  validateSquadYaml,
  readInstalledSquads,
  writeInstalledSquads,
  copyDirRecursive,
  createSlashCommandSymlinks,
  listAvailableSquads,
  installSquad,
} = require('../../../packages/installer/src/installer/squad-installer');

// Helper: create temp dir
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'squad-installer-test-'));
}

// Helper: clean up temp dir
function cleanUp(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Helper: create a minimal squad structure
function createMockSquad(parentDir, squadName, config = {}) {
  const squadDir = path.join(parentDir, 'squads', squadName);
  fs.mkdirSync(squadDir, { recursive: true });

  const defaultConfig = {
    name: squadName,
    version: '1.0.0',
    description: `Test squad ${squadName}`,
    components: {
      agents: ['test-agent.md'],
      tasks: ['test-task.md'],
    },
    dependencies: {
      node: [],
    },
    integration: {
      git_hooks: [],
    },
    ...config,
  };

  // Write squad.yaml
  const yaml = require('js-yaml');
  fs.writeFileSync(
    path.join(squadDir, 'squad.yaml'),
    yaml.dump(defaultConfig),
  );

  // Write README.md
  fs.writeFileSync(
    path.join(squadDir, 'README.md'),
    `# ${squadName}\nTest squad for unit tests.\n`,
  );

  // Create component dirs
  const agentsDir = path.join(squadDir, 'agents');
  fs.mkdirSync(agentsDir, { recursive: true });
  fs.writeFileSync(path.join(agentsDir, 'test-agent.md'), '# Test Agent\n');

  const tasksDir = path.join(squadDir, 'tasks');
  fs.mkdirSync(tasksDir, { recursive: true });
  fs.writeFileSync(path.join(tasksDir, 'test-task.md'), '# Test Task\n');

  return squadDir;
}

describe('squad-installer', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanUp(tempDir);
  });

  describe('detectSource', () => {
    it('should find squad in aiosCoreRoot/squads/', () => {
      createMockSquad(tempDir, 'test-squad');

      const result = detectSource('test-squad', tempDir);

      expect(result).not.toBeNull();
      expect(result).toContain('test-squad');
    });

    it('should return null for non-existent squad', () => {
      const result = detectSource('non-existent-squad', tempDir);

      expect(result).toBeNull();
    });

    it('should return null when directory exists but has no squad.yaml', () => {
      const squadDir = path.join(tempDir, 'squads', 'no-yaml');
      fs.mkdirSync(squadDir, { recursive: true });
      fs.writeFileSync(path.join(squadDir, 'README.md'), '# No YAML\n');

      const result = detectSource('no-yaml', tempDir);

      expect(result).toBeNull();
    });
  });

  describe('validateSquadYaml', () => {
    it('should parse valid squad.yaml', () => {
      const squadDir = createMockSquad(tempDir, 'valid-squad');

      const config = validateSquadYaml(squadDir);

      expect(config.name).toBe('valid-squad');
      expect(config.version).toBe('1.0.0');
    });

    it('should throw if squad.yaml is missing', () => {
      const emptyDir = path.join(tempDir, 'empty');
      fs.mkdirSync(emptyDir, { recursive: true });

      expect(() => validateSquadYaml(emptyDir)).toThrow('squad.yaml not found');
    });

    it('should throw if name field is missing', () => {
      const squadDir = path.join(tempDir, 'squads', 'no-name');
      fs.mkdirSync(squadDir, { recursive: true });

      const yaml = require('js-yaml');
      fs.writeFileSync(
        path.join(squadDir, 'squad.yaml'),
        yaml.dump({ version: '1.0.0' }),
      );

      expect(() => validateSquadYaml(squadDir)).toThrow('missing required field "name"');
    });

    it('should throw if version field is missing', () => {
      const squadDir = path.join(tempDir, 'squads', 'no-version');
      fs.mkdirSync(squadDir, { recursive: true });

      const yaml = require('js-yaml');
      fs.writeFileSync(
        path.join(squadDir, 'squad.yaml'),
        yaml.dump({ name: 'test' }),
      );

      expect(() => validateSquadYaml(squadDir)).toThrow('missing required field "version"');
    });
  });

  describe('readInstalledSquads / writeInstalledSquads', () => {
    it('should return empty data when tracking file does not exist', () => {
      const result = readInstalledSquads(tempDir);

      expect(result).toEqual({ squads: {} });
    });

    it('should write and read tracking data', () => {
      const data = {
        squads: {
          navigator: {
            version: '1.0.0',
            installedAt: '2026-02-20T00:00:00.000Z',
          },
        },
      };

      writeInstalledSquads(tempDir, data);
      const result = readInstalledSquads(tempDir);

      expect(result.squads.navigator.version).toBe('1.0.0');
    });

    it('should create .aios directory if it does not exist', () => {
      const aiosDir = path.join(tempDir, '.aios');
      expect(fs.existsSync(aiosDir)).toBe(false);

      writeInstalledSquads(tempDir, { squads: {} });

      expect(fs.existsSync(aiosDir)).toBe(true);
    });
  });

  describe('copyDirRecursive', () => {
    it('should copy all files recursively', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');

      fs.mkdirSync(path.join(srcDir, 'sub'), { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'file1.md'), 'content1');
      fs.writeFileSync(path.join(srcDir, 'sub', 'file2.md'), 'content2');

      const count = copyDirRecursive(srcDir, destDir);

      expect(count).toBe(2);
      expect(fs.existsSync(path.join(destDir, 'file1.md'))).toBe(true);
      expect(fs.existsSync(path.join(destDir, 'sub', 'file2.md'))).toBe(true);
    });

    it('should skip .DS_Store files', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');

      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, '.DS_Store'), 'junk');
      fs.writeFileSync(path.join(srcDir, 'real.md'), 'content');

      const count = copyDirRecursive(srcDir, destDir);

      expect(count).toBe(1);
      expect(fs.existsSync(path.join(destDir, '.DS_Store'))).toBe(false);
      expect(fs.existsSync(path.join(destDir, 'real.md'))).toBe(true);
    });

    it('should skip node_modules', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');

      fs.mkdirSync(path.join(srcDir, 'node_modules'), { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'node_modules', 'pkg.js'), 'x');
      fs.writeFileSync(path.join(srcDir, 'real.md'), 'content');

      const count = copyDirRecursive(srcDir, destDir);

      expect(count).toBe(1);
      expect(fs.existsSync(path.join(destDir, 'node_modules'))).toBe(false);
    });

    it('should return 0 for non-existent source', () => {
      const count = copyDirRecursive('/nonexistent', path.join(tempDir, 'dest'));

      expect(count).toBe(0);
    });
  });

  describe('createSlashCommandSymlinks', () => {
    it('should create symlinks for README and component dirs', () => {
      const squadDir = createMockSquad(tempDir, 'symlink-test');
      const commandsDir = path.join(tempDir, '.claude', 'commands');

      const count = createSlashCommandSymlinks('symlink-test', squadDir, commandsDir);

      // README + 1 agent + 1 task = 3
      expect(count).toBe(3);

      const cmdDir = path.join(commandsDir, 'symlink-test');
      expect(fs.existsSync(path.join(cmdDir, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(cmdDir, 'agents', 'test-agent.md'))).toBe(true);
      expect(fs.existsSync(path.join(cmdDir, 'tasks', 'test-task.md'))).toBe(true);
    });

    it('should replace existing symlinks', () => {
      const squadDir = createMockSquad(tempDir, 'replace-test');
      const commandsDir = path.join(tempDir, '.claude', 'commands');

      // Create once
      createSlashCommandSymlinks('replace-test', squadDir, commandsDir);

      // Create again (should not throw)
      const count = createSlashCommandSymlinks('replace-test', squadDir, commandsDir);

      expect(count).toBe(3);
    });
  });

  describe('listAvailableSquads', () => {
    it('should list squads with squad.yaml', () => {
      createMockSquad(tempDir, 'squad-a');
      createMockSquad(tempDir, 'squad-b');

      const result = listAvailableSquads(tempDir);

      expect(result).toContain('squad-a');
      expect(result).toContain('squad-b');
      expect(result.length).toBe(2);
    });

    it('should exclude directories without squad.yaml', () => {
      createMockSquad(tempDir, 'valid-squad');
      const invalidDir = path.join(tempDir, 'squads', 'no-yaml');
      fs.mkdirSync(invalidDir, { recursive: true });

      const result = listAvailableSquads(tempDir);

      expect(result).toContain('valid-squad');
      expect(result).not.toContain('no-yaml');
    });

    it('should return empty array when squads dir does not exist', () => {
      const result = listAvailableSquads('/nonexistent-path');

      expect(result).toEqual([]);
    });
  });

  describe('installSquad', () => {
    it('should install a squad successfully', async () => {
      // Setup: create source and target
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        createMockSquad(sourceRoot, 'test-nav');

        const result = await installSquad('test-nav', {
          projectRoot: targetRoot,
          aiosCoreRoot: sourceRoot,
          skipDeps: true,
          skipHooks: true,
        });

        expect(result.success).toBe(true);
        expect(result.squadName).toBe('test-nav');
        expect(result.version).toBe('1.0.0');
        expect(result.filesCopied).toBeGreaterThan(0);
        expect(result.symlinksCreated).toBeGreaterThan(0);

        // Check files were copied
        expect(fs.existsSync(path.join(targetRoot, 'squads', 'test-nav', 'squad.yaml'))).toBe(true);

        // Check tracking file
        const tracking = readInstalledSquads(targetRoot);
        expect(tracking.squads['test-nav']).toBeDefined();
        expect(tracking.squads['test-nav'].version).toBe('1.0.0');

        // Check symlinks
        expect(fs.existsSync(path.join(targetRoot, '.claude', 'commands', 'test-nav', 'README.md'))).toBe(true);
      } finally {
        cleanUp(sourceRoot);
        cleanUp(targetRoot);
      }
    });

    it('should fail if squad is not found', async () => {
      const result = await installSquad('nonexistent', {
        projectRoot: tempDir,
        aiosCoreRoot: tempDir,
        skipDeps: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should refuse to reinstall without --force', async () => {
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        createMockSquad(sourceRoot, 'dupe-test');

        // Install once
        await installSquad('dupe-test', {
          projectRoot: targetRoot,
          aiosCoreRoot: sourceRoot,
          skipDeps: true,
          skipHooks: true,
        });

        // Try again without force
        const result = await installSquad('dupe-test', {
          projectRoot: targetRoot,
          aiosCoreRoot: sourceRoot,
          skipDeps: true,
          force: false,
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('already installed');
      } finally {
        cleanUp(sourceRoot);
        cleanUp(targetRoot);
      }
    });

    it('should reinstall with --force', async () => {
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        createMockSquad(sourceRoot, 'force-test');

        // Install once
        await installSquad('force-test', {
          projectRoot: targetRoot,
          aiosCoreRoot: sourceRoot,
          skipDeps: true,
          skipHooks: true,
        });

        // Reinstall with force
        const result = await installSquad('force-test', {
          projectRoot: targetRoot,
          aiosCoreRoot: sourceRoot,
          skipDeps: true,
          skipHooks: true,
          force: true,
        });

        expect(result.success).toBe(true);
      } finally {
        cleanUp(sourceRoot);
        cleanUp(targetRoot);
      }
    });

    it('should call onProgress callback', async () => {
      const sourceRoot = createTempDir();
      const targetRoot = createTempDir();

      try {
        createMockSquad(sourceRoot, 'progress-test');

        const phases = [];
        await installSquad('progress-test', {
          projectRoot: targetRoot,
          aiosCoreRoot: sourceRoot,
          skipDeps: true,
          skipHooks: true,
          onProgress: (phase) => phases.push(phase),
        });

        expect(phases).toContain('detect');
        expect(phases).toContain('validate');
        expect(phases).toContain('copy');
        expect(phases).toContain('symlinks');
        expect(phases).toContain('register');
      } finally {
        cleanUp(sourceRoot);
        cleanUp(targetRoot);
      }
    });
  });
});
