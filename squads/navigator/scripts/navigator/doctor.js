#!/usr/bin/env node

/**
 * Navigator Doctor - Health Check Script
 * Validates Navigator installation and dependencies
 *
 * Used by: *navigator-doctor command
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { resolveSquadDir, resolveSquadPath } = require('../squad-paths');

/**
 * Run all health checks
 */
async function runHealthCheck() {
  console.log('\n🧭 Navigator Health Check\n');

  const results = [];

  // Check 1: Node.js version
  results.push(await checkNodeVersion());

  // Check 2: Git availability
  results.push(await checkGitAvailable());

  // Check 3: NPM dependencies
  results.push(await checkDependencies());

  // Check 4: Git hooks
  results.push(await checkGitHooks());

  // Check 5: Directory structure
  results.push(await checkDirectoryStructure());

  // Check 6: Pipeline map
  results.push(await checkPipelineMap());

  // Check 7: Scripts executable
  results.push(await checkScriptsExecutable());

  // Print summary
  printSummary(results);

  const allPassed = results.every(r => r.passed);
  return allPassed ? 0 : 1;
}

/**
 * Check Node.js version
 */
async function checkNodeVersion() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
      return {
        name: 'Node.js Version',
        passed: true,
        message: `✓ Node.js ${version} (>= 18.0.0)`,
      };
    } else {
      return {
        name: 'Node.js Version',
        passed: false,
        message: `✗ Node.js ${version} (requires >= 18.0.0)`,
        fix: 'Install Node.js 18 or higher from https://nodejs.org',
      };
    }
  } catch (_error) {
    return {
      name: 'Node.js Version',
      passed: false,
      message: '✗ Could not detect Node.js version',
    };
  }
}

/**
 * Check Git availability
 */
async function checkGitAvailable() {
  try {
    const version = execSync('git --version', { encoding: 'utf8' }).trim();
    return {
      name: 'Git',
      passed: true,
      message: `✓ ${version}`,
    };
  } catch (_error) {
    return {
      name: 'Git',
      passed: false,
      message: '✗ Git not found',
      fix: 'Install Git from https://git-scm.com',
    };
  }
}

/**
 * Check NPM dependencies
 */
async function checkDependencies() {
  const requiredDeps = ['js-yaml', 'glob', 'inquirer'];
  const missing = [];

  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
    } catch (_error) {
      missing.push(dep);
    }
  }

  if (missing.length === 0) {
    return {
      name: 'Dependencies',
      passed: true,
      message: `✓ All required packages installed (${requiredDeps.join(', ')})`,
    };
  } else {
    return {
      name: 'Dependencies',
      passed: false,
      message: `✗ Missing packages: ${missing.join(', ')}`,
      fix: `Run: npm install ${missing.join(' ')}`,
    };
  }
}

/**
 * Check Git hooks
 */
async function checkGitHooks() {
  const hookPath = '.husky/post-commit';

  if (!fs.existsSync(hookPath)) {
    return {
      name: 'Git Hooks',
      passed: false,
      message: '✗ Husky post-commit hook not found',
      fix: 'Run: npm run prepare',
    };
  }

  const hookContent = fs.readFileSync(hookPath, 'utf8');
  const hasNavigatorHook = hookContent.includes('navigator/post-commit-hook.js');

  if (hasNavigatorHook) {
    return {
      name: 'Git Hooks',
      passed: true,
      message: '✓ Navigator post-commit hook installed',
    };
  } else {
    return {
      name: 'Git Hooks',
      passed: false,
      message: '✗ Navigator hook not integrated in .husky/post-commit',
      fix: 'Add navigator hook to .husky/post-commit',
    };
  }
}

/**
 * Check directory structure
 */
async function checkDirectoryStructure() {
  const requiredDirs = [
    { name: 'agents', resolved: resolveSquadDir('agents') },
    { name: 'tasks', resolved: resolveSquadDir('tasks') },
    { name: 'templates', resolved: resolveSquadDir('templates') },
    { name: 'scripts/navigator', resolved: resolveSquadDir('scripts/navigator') },
    { name: 'data', resolved: resolveSquadDir('data') },
  ];

  const missing = requiredDirs.filter(dir => !dir.resolved).map(dir => dir.name);

  if (missing.length === 0) {
    return {
      name: 'Directory Structure',
      passed: true,
      message: '✓ All required directories exist',
    };
  } else {
    return {
      name: 'Directory Structure',
      passed: false,
      message: `✗ Missing directories: ${missing.join(', ')}`,
      fix: 'Reinstall AIOS or create missing directories',
    };
  }
}

/**
 * Check pipeline map
 */
async function checkPipelineMap() {
  const pipelineMapPath = resolveSquadPath('data', 'navigator-pipeline-map.yaml')
    || '.aios-core/development/data/navigator-pipeline-map.yaml';

  if (!fs.existsSync(pipelineMapPath)) {
    return {
      name: 'Pipeline Map',
      passed: false,
      message: '✗ Pipeline map not found',
      fix: `Create ${pipelineMapPath}`,
    };
  }

  try {
    const yaml = require('js-yaml');
    const content = fs.readFileSync(pipelineMapPath, 'utf8');
    const pipelineMap = yaml.load(content);

    if (!pipelineMap.phases || !Array.isArray(pipelineMap.phases)) {
      return {
        name: 'Pipeline Map',
        passed: false,
        message: '✗ Pipeline map invalid (missing phases array)',
        fix: 'Fix pipeline map YAML structure',
      };
    }

    return {
      name: 'Pipeline Map',
      passed: true,
      message: `✓ Pipeline map valid (${pipelineMap.phases.length} phases)`,
    };
  } catch (error) {
    return {
      name: 'Pipeline Map',
      passed: false,
      message: `✗ Pipeline map parse error: ${error.message}`,
      fix: 'Fix YAML syntax in pipeline map',
    };
  }
}

/**
 * Check scripts executable
 */
async function checkScriptsExecutable() {
  const scriptsDir = resolveSquadDir('scripts/navigator')
    || '.aios-core/development/scripts/navigator';
  const requiredScripts = [
    'roadmap-sync.js',
    'phase-detector.js',
    'checkpoint-manager.js',
    'orchestrator.js',
    'post-commit-hook.js',
  ];

  const missing = [];
  const notExecutable = [];

  for (const script of requiredScripts) {
    const scriptPath = path.join(scriptsDir, script);

    if (!fs.existsSync(scriptPath)) {
      missing.push(script);
    } else {
      try {
        fs.accessSync(scriptPath, fs.constants.R_OK);
      } catch (_error) {
        notExecutable.push(script);
      }
    }
  }

  if (missing.length === 0 && notExecutable.length === 0) {
    return {
      name: 'Scripts',
      passed: true,
      message: `✓ All ${requiredScripts.length} scripts present and readable`,
    };
  } else {
    const issues = [];
    if (missing.length > 0) {
      issues.push(`missing: ${missing.join(', ')}`);
    }
    if (notExecutable.length > 0) {
      issues.push(`not readable: ${notExecutable.join(', ')}`);
    }

    return {
      name: 'Scripts',
      passed: false,
      message: `✗ Script issues: ${issues.join('; ')}`,
      fix: 'Reinstall Navigator scripts or fix permissions',
    };
  }
}

/**
 * Print health check summary
 */
function printSummary(results) {
  console.log('\n--- Health Check Summary ---\n');

  for (const result of results) {
    console.log(result.message);
    if (!result.passed && result.fix) {
      console.log(`  → Fix: ${result.fix}`);
    }
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\n${passed}/${total} checks passed\n`);

  if (passed === total) {
    console.log('✅ Navigator is healthy!\n');
  } else {
    console.log('⚠️  Navigator has issues. Please fix the problems above.\n');
  }
}

// CLI interface
if (require.main === module) {
  runHealthCheck()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('✗ Health check failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runHealthCheck,
  checkNodeVersion,
  checkGitAvailable,
  checkDependencies,
  checkGitHooks,
  checkDirectoryStructure,
  checkPipelineMap,
  checkScriptsExecutable,
};
