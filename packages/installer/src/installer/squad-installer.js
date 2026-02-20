/**
 * Squad Installer
 * Installs squad expansion packs into target projects
 *
 * Workflow:
 *   1. Detect source squad (local aios-core/squads/ or node_modules)
 *   2. Read and validate squad.yaml
 *   3. Check if already installed (.aios/installed-squads.json)
 *   4. Copy squad to squads/<name>/ in target project
 *   5. Install npm dependencies from squad.yaml
 *   6. Generate slash commands via symlinks in .claude/commands/<name>/
 *   7. Install git hooks (if defined in squad.yaml)
 *   8. Register installation in .aios/installed-squads.json
 *
 * Usage:
 *   const { installSquad } = require('./squad-installer');
 *   await installSquad('navigator', { projectRoot: process.cwd() });
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let yaml;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

// Directories to symlink as slash commands (same as squad-indexer.js)
const SYMLINK_DIRS = ['agents', 'tasks', 'workflows', 'checklists', 'templates', 'data'];

/**
 * Detect the source path for a squad
 * @param {string} squadName - Name of the squad to find
 * @param {string} [aiosCoreRoot] - Override aios-core root path
 * @returns {string|null} Absolute path to squad source, or null
 */
function detectSource(squadName, aiosCoreRoot = null) {
  const searchPaths = [];

  if (aiosCoreRoot) {
    searchPaths.push(path.join(aiosCoreRoot, 'squads', squadName));
  }

  // 1. Local aios-core/squads/ (when running from repo)
  const localSquad = path.resolve(__dirname, '..', '..', '..', '..', 'squads', squadName);
  searchPaths.push(localSquad);

  // 2. node_modules/@synkra/aios-core/squads/ (when installed via npm)
  const npmSquad = path.resolve(process.cwd(), 'node_modules', '@synkra', 'aios-core', 'squads', squadName);
  searchPaths.push(npmSquad);

  // 3. npx cache (when running via npx aios-core)
  const npxSquad = path.resolve(__dirname, '..', '..', '..', '..', 'squads', squadName);
  searchPaths.push(npxSquad);

  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath) && fs.existsSync(path.join(searchPath, 'squad.yaml'))) {
      return searchPath;
    }
  }

  return null;
}

/**
 * Read and validate squad.yaml
 * @param {string} squadPath - Path to squad directory
 * @returns {Object} Parsed squad.yaml content
 * @throws {Error} If squad.yaml is missing or invalid
 */
function validateSquadYaml(squadPath) {
  const yamlPath = path.join(squadPath, 'squad.yaml');

  if (!fs.existsSync(yamlPath)) {
    throw new Error(`squad.yaml not found in ${squadPath}`);
  }

  if (!yaml) {
    throw new Error('js-yaml package is required. Run: npm install js-yaml');
  }

  const content = fs.readFileSync(yamlPath, 'utf8');
  const config = yaml.load(content);

  // Validate required fields
  if (!config.name) {
    throw new Error('squad.yaml: missing required field "name"');
  }

  if (!config.version) {
    throw new Error('squad.yaml: missing required field "version"');
  }

  return config;
}

/**
 * Read the installed squads tracking file
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Installed squads data
 */
function readInstalledSquads(projectRoot) {
  const trackingPath = path.join(projectRoot, '.aios', 'installed-squads.json');

  if (!fs.existsSync(trackingPath)) {
    return { squads: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
  } catch {
    return { squads: {} };
  }
}

/**
 * Write the installed squads tracking file
 * @param {string} projectRoot - Project root directory
 * @param {Object} data - Tracking data to write
 */
function writeInstalledSquads(projectRoot, data) {
  const aiosDir = path.join(projectRoot, '.aios');
  if (!fs.existsSync(aiosDir)) {
    fs.mkdirSync(aiosDir, { recursive: true });
  }

  const trackingPath = path.join(aiosDir, 'installed-squads.json');
  fs.writeFileSync(trackingPath, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Copy a directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @returns {number} Number of files copied
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return 0;

  fs.mkdirSync(dest, { recursive: true });
  let count = 0;

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip .DS_Store, backups, and node_modules
    if (entry.name === '.DS_Store' || entry.name === 'node_modules' || entry.name.includes('.backup')) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }

  return count;
}

/**
 * Create slash command symlinks for a squad
 * Follows the same pattern as scripts/squad-indexer.js createSymlinks()
 * @param {string} squadName - Squad name
 * @param {string} squadPath - Installed squad path
 * @param {string} commandsDir - .claude/commands directory
 * @returns {number} Number of symlinks created
 */
function createSlashCommandSymlinks(squadName, squadPath, commandsDir) {
  const targetDir = path.join(commandsDir, squadName);
  let count = 0;

  fs.mkdirSync(targetDir, { recursive: true });

  // Symlink README.md
  const readmeSrc = path.join(squadPath, 'README.md');
  const readmeDst = path.join(targetDir, 'README.md');

  if (fs.existsSync(readmeSrc)) {
    const relativePath = path.relative(targetDir, readmeSrc);
    if (fs.existsSync(readmeDst)) {
      fs.unlinkSync(readmeDst);
    }
    fs.symlinkSync(relativePath, readmeDst);
    count++;
  }

  // Symlink component directories
  for (const dir of SYMLINK_DIRS) {
    const srcDir = path.join(squadPath, dir);
    const dstDir = path.join(targetDir, dir);

    if (!fs.existsSync(srcDir)) continue;

    fs.mkdirSync(dstDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f =>
      f.endsWith('.md') || f.endsWith('.yaml'),
    );

    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const dstFile = path.join(dstDir, file);
      const relativePath = path.relative(dstDir, srcFile);

      if (fs.existsSync(dstFile)) {
        fs.unlinkSync(dstFile);
      }

      fs.symlinkSync(relativePath, dstFile);
      count++;
    }
  }

  return count;
}

/**
 * Install npm dependencies from squad.yaml
 * @param {Object} squadConfig - Parsed squad.yaml
 * @param {string} projectRoot - Project root
 * @returns {string[]} List of installed packages
 */
function installDependencies(squadConfig, projectRoot) {
  const deps = squadConfig.dependencies?.node || [];

  if (deps.length === 0) return [];

  // Check which are already installed
  const missing = deps.filter(dep => {
    try {
      require.resolve(dep, { paths: [projectRoot] });
      return false;
    } catch {
      return true;
    }
  });

  if (missing.length === 0) return [];

  try {
    execSync(`npm install ${missing.join(' ')}`, {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 60000,
    });
    return missing;
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${error.message}`);
  }
}

/**
 * Install git hooks defined in squad.yaml
 * @param {Object} squadConfig - Parsed squad.yaml
 * @param {string} squadPath - Installed squad path
 * @param {string} projectRoot - Project root
 * @returns {boolean} Whether hooks were installed
 */
function installGitHooks(squadConfig, squadPath, projectRoot) {
  const hooks = squadConfig.integration?.git_hooks || [];

  if (hooks.length === 0) return false;

  // Check for install-hooks.js script
  const hookInstallerPath = path.join(squadPath, 'scripts', 'install-hooks.js');

  if (fs.existsSync(hookInstallerPath)) {
    try {
      const { installHook } = require(hookInstallerPath);
      return installHook();
    } catch {
      // Fallback: try running as script
      try {
        execSync(`node "${hookInstallerPath}"`, {
          cwd: projectRoot,
          stdio: 'pipe',
          timeout: 10000,
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  return false;
}

/**
 * List available squads from source
 * @param {string} [aiosCoreRoot] - Override aios-core root path
 * @returns {string[]} List of squad names
 */
function listAvailableSquads(aiosCoreRoot = null) {
  const squadsDir = aiosCoreRoot
    ? path.join(aiosCoreRoot, 'squads')
    : path.resolve(__dirname, '..', '..', '..', '..', 'squads');

  if (!fs.existsSync(squadsDir)) return [];

  return fs.readdirSync(squadsDir, { withFileTypes: true })
    .filter(entry => {
      if (!entry.isDirectory()) return false;
      if (entry.name.startsWith('.') || entry.name.includes('.backup')) return false;
      return fs.existsSync(path.join(squadsDir, entry.name, 'squad.yaml'));
    })
    .map(entry => entry.name);
}

/**
 * Install a squad into the target project
 * @param {string} squadName - Name of the squad to install
 * @param {Object} [options] - Installation options
 * @param {string} [options.projectRoot] - Target project root (default: cwd)
 * @param {string} [options.aiosCoreRoot] - Override aios-core root
 * @param {boolean} [options.force] - Force reinstall if already installed
 * @param {boolean} [options.skipDeps] - Skip npm dependency installation
 * @param {boolean} [options.skipHooks] - Skip git hook installation
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Installation result
 */
async function installSquad(squadName, options = {}) {
  const {
    projectRoot = process.cwd(),
    aiosCoreRoot = null,
    force = false,
    skipDeps = false,
    skipHooks = false,
    onProgress = () => {},
  } = options;

  const result = {
    success: false,
    squadName,
    version: null,
    filesCopied: 0,
    symlinksCreated: 0,
    depsInstalled: [],
    hooksInstalled: false,
    message: '',
  };

  // 1. Detect source
  onProgress('detect', `Searching for squad "${squadName}"...`);
  const sourcePath = detectSource(squadName, aiosCoreRoot);

  if (!sourcePath) {
    const available = listAvailableSquads(aiosCoreRoot);
    result.message = `Squad "${squadName}" not found.`;
    if (available.length > 0) {
      result.message += ` Available squads: ${available.join(', ')}`;
    }
    return result;
  }

  // 2. Validate squad.yaml
  onProgress('validate', 'Validating squad.yaml...');
  let squadConfig;
  try {
    squadConfig = validateSquadYaml(sourcePath);
  } catch (error) {
    result.message = `Invalid squad: ${error.message}`;
    return result;
  }
  result.version = squadConfig.version;

  // 3. Check if already installed
  const tracking = readInstalledSquads(projectRoot);

  if (tracking.squads[squadName] && !force) {
    const installed = tracking.squads[squadName];
    result.message = `Squad "${squadName}" v${installed.version} is already installed. Use --force to reinstall.`;
    return result;
  }

  // 4. Copy squad
  onProgress('copy', `Copying squad to squads/${squadName}/...`);
  const destPath = path.join(projectRoot, 'squads', squadName);
  result.filesCopied = copyDirRecursive(sourcePath, destPath);

  // 5. Install dependencies
  if (!skipDeps && squadConfig.dependencies?.node?.length > 0) {
    onProgress('deps', 'Installing dependencies...');
    try {
      result.depsInstalled = installDependencies(squadConfig, projectRoot);
    } catch (error) {
      onProgress('deps-warn', `Warning: ${error.message}`);
    }
  }

  // 6. Create slash command symlinks
  onProgress('symlinks', 'Creating slash commands...');
  const commandsDir = path.join(projectRoot, '.claude', 'commands');
  result.symlinksCreated = createSlashCommandSymlinks(squadName, destPath, commandsDir);

  // 7. Install git hooks
  if (!skipHooks) {
    onProgress('hooks', 'Installing git hooks...');
    result.hooksInstalled = installGitHooks(squadConfig, destPath, projectRoot);
  }

  // 8. Register installation
  onProgress('register', 'Registering installation...');
  tracking.squads[squadName] = {
    version: squadConfig.version,
    installedAt: new Date().toISOString(),
    source: sourcePath,
    filesCopied: result.filesCopied,
    symlinksCreated: result.symlinksCreated,
  };
  writeInstalledSquads(projectRoot, tracking);

  result.success = true;
  result.message = `Squad "${squadName}" v${squadConfig.version} installed successfully.`;

  return result;
}

module.exports = {
  installSquad,
  detectSource,
  validateSquadYaml,
  readInstalledSquads,
  writeInstalledSquads,
  copyDirRecursive,
  createSlashCommandSymlinks,
  installDependencies,
  installGitHooks,
  listAvailableSquads,
};
