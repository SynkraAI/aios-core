#!/usr/bin/env node

/**
 * Roadmap Sync Script
 * Synchronizes roadmap between central (.aios/navigator/) and local (docs/roadmap.md)
 *
 * Used by: nav-map-project, nav-update-roadmap, git hooks
 */

const fs = require('fs');
const path = require('path');

/**
 * Sync roadmap between central and local locations
 * @param {string} projectName - Name of project
 * @param {Object} options - Sync options
 * @returns {Promise<Object>} Sync result
 */
async function syncRoadmap(projectName, options = {}) {
  const centralPath = `.aios/navigator/${projectName}/roadmap.md`;
  const localPath = 'docs/roadmap.md';

  // Ensure directories exist
  ensureDirectoryExists(path.dirname(centralPath));
  ensureDirectoryExists(path.dirname(localPath));

  // Determine sync direction
  const { direction = 'bidirectional', force = false } = options;

  try {
    if (direction === 'central-to-local' || direction === 'bidirectional') {
      await syncCentralToLocal(centralPath, localPath, force);
    }

    if (direction === 'local-to-central' || direction === 'bidirectional') {
      await syncLocalToCentral(centralPath, localPath, force);
    }

    return {
      success: true,
      centralPath,
      localPath,
      direction,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sync from central to local
 */
async function syncCentralToLocal(centralPath, localPath, force) {
  if (!fs.existsSync(centralPath)) {
    throw new Error(`Central roadmap not found: ${centralPath}`);
  }

  const centralContent = fs.readFileSync(centralPath, 'utf8');
  const centralMtime = fs.statSync(centralPath).mtimeMs;

  if (fs.existsSync(localPath) && !force) {
    const localMtime = fs.statSync(localPath).mtimeMs;
    const localContent = fs.readFileSync(localPath, 'utf8');

    // Check for conflict (different content)
    if (centralContent !== localContent) {
      // In non-interactive mode, use timestamp
      if (process.env.NAVIGATOR_AUTO_MODE === 'true') {
        if (centralMtime > localMtime) {
          fs.writeFileSync(localPath, centralContent);
          console.log('✓ Synced central → local (central newer)');
        }
      } else {
        // Interactive mode: ask for confirmation
        const inquirer = require('inquirer');
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Local roadmap differs from central. Overwrite local with central version?',
          default: centralMtime > localMtime, // Default to newer version
        }]);

        if (confirm) {
          fs.writeFileSync(localPath, centralContent);
          console.log('✓ Synced central → local (user confirmed)');
        } else {
          console.log('⚠️  Sync cancelled by user');
        }
      }
    }
  } else {
    // Local doesn't exist or force = true
    fs.writeFileSync(localPath, centralContent);
    console.log('✓ Created local roadmap from central');
  }
}

/**
 * Sync from local to central
 */
async function syncLocalToCentral(centralPath, localPath, force) {
  if (!fs.existsSync(localPath)) {
    // Local doesn't exist, nothing to sync
    return;
  }

  const localContent = fs.readFileSync(localPath, 'utf8');
  const localMtime = fs.statSync(localPath).mtimeMs;

  if (fs.existsSync(centralPath) && !force) {
    const centralMtime = fs.statSync(centralPath).mtimeMs;
    const centralContent = fs.readFileSync(centralPath, 'utf8');

    // Check for conflict (different content)
    if (localContent !== centralContent) {
      // In non-interactive mode, use timestamp
      if (process.env.NAVIGATOR_AUTO_MODE === 'true') {
        if (localMtime > centralMtime) {
          fs.writeFileSync(centralPath, localContent);
          console.log('✓ Synced local → central (local newer)');
        }
      } else {
        // Interactive mode: ask for confirmation
        const inquirer = require('inquirer');
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Central roadmap differs from local. Overwrite central with local version?',
          default: localMtime > centralMtime, // Default to newer version
        }]);

        if (confirm) {
          fs.writeFileSync(centralPath, localContent);
          console.log('✓ Synced local → central (user confirmed)');
        } else {
          console.log('⚠️  Sync cancelled by user');
        }
      }
    }
  } else {
    // Central doesn't exist or force = true
    fs.writeFileSync(centralPath, localContent);
    console.log('✓ Created central roadmap from local');
  }
}

/**
 * Detect conflicts between central and local
 */
function detectConflicts(centralPath, localPath) {
  if (!fs.existsSync(centralPath) || !fs.existsSync(localPath)) {
    return { hasConflict: false };
  }

  const centralMtime = fs.statSync(centralPath).mtimeMs;
  const localMtime = fs.statSync(localPath).mtimeMs;
  const centralContent = fs.readFileSync(centralPath, 'utf8');
  const localContent = fs.readFileSync(localPath, 'utf8');

  // Both modified since last sync and content differs
  if (centralContent !== localContent) {
    return {
      hasConflict: true,
      centralNewer: centralMtime > localMtime,
      localNewer: localMtime > centralMtime,
      centralMtime: new Date(centralMtime),
      localMtime: new Date(localMtime),
    };
  }

  return { hasConflict: false };
}

/**
 * Resolve conflicts with strategy
 */
function resolveConflicts(centralPath, localPath, strategy = 'central-wins') {
  const strategies = {
    'central-wins': () => {
      const content = fs.readFileSync(centralPath, 'utf8');
      fs.writeFileSync(localPath, content);
      console.log('✓ Conflict resolved: central wins');
    },
    'local-wins': () => {
      const content = fs.readFileSync(localPath, 'utf8');
      fs.writeFileSync(centralPath, content);
      console.log('✓ Conflict resolved: local wins');
    },
    'newer-wins': () => {
      const conflict = detectConflicts(centralPath, localPath);
      if (conflict.centralNewer) {
        strategies['central-wins']();
      } else {
        strategies['local-wins']();
      }
    },
  };

  const resolver = strategies[strategy];
  if (!resolver) {
    throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
  }

  resolver();
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// CLI interface
if (require.main === module) {
  const projectName = process.argv[2];

  if (!projectName) {
    console.error('Usage: roadmap-sync.js <project-name>');
    process.exit(1);
  }

  syncRoadmap(projectName)
    .then(result => {
      if (result.success) {
        console.log('✓ Roadmap sync complete');
      } else {
        console.error('✗ Sync failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('✗ Sync error:', error.message);
      process.exit(1);
    });
}

module.exports = {
  syncRoadmap,
  detectConflicts,
  resolveConflicts,
};
