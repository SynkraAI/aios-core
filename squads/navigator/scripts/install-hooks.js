#!/usr/bin/env node

/**
 * Navigator Git Hooks Auto-Installer
 * Integrates Navigator post-commit hook into .husky/post-commit
 *
 * Usage:
 *   node squads/navigator/scripts/install-hooks.js
 *   node squads/navigator/scripts/install-hooks.js --check
 *   node squads/navigator/scripts/install-hooks.js --uninstall
 */

const fs = require('fs');
const _path = require('path');
const { resolveSquadPath } = require('./squad-paths');

const HOOK_FILE = '.husky/post-commit';
// Resolve hook script path: squad-local first, legacy fallback
const hookScriptPath = resolveSquadPath('scripts/navigator', 'post-commit-hook.js')
  ? 'squads/navigator/scripts/navigator/post-commit-hook.js'
  : '.aios-core/development/scripts/navigator/post-commit-hook.js';
const HOOK_LINE = `node ${hookScriptPath} 2>/dev/null || true`;
const HOOK_COMMENT = '# Navigator Auto-Update (Navigator Agent)';

/**
 * Install Navigator hook
 */
function installHook() {
  // Check if .husky exists
  if (!fs.existsSync('.husky')) {
    console.error('✗ Husky not found. Run `npm run prepare` first.');
    return false;
  }

  // Check if post-commit exists
  if (!fs.existsSync(HOOK_FILE)) {
    console.error(`✗ ${HOOK_FILE} not found. Run \`npm run prepare\` first.`);
    return false;
  }

  // Read current hook content
  const currentContent = fs.readFileSync(HOOK_FILE, 'utf8');

  // Check if already installed
  if (currentContent.includes(HOOK_LINE)) {
    console.log('✓ Navigator hook already installed');
    return true;
  }

  // Add Navigator hook at the end
  const newContent = currentContent.trimEnd() + '\n\n' + HOOK_COMMENT + '\n' +
    '# Auto-updates roadmap when stories change (async, non-blocking).\n' +
    HOOK_LINE + '\n';

  // Write updated content
  fs.writeFileSync(HOOK_FILE, newContent);

  console.log('✓ Navigator hook installed successfully');
  console.log(`  Added to: ${HOOK_FILE}`);

  return true;
}

/**
 * Check if hook is installed
 */
function checkHook() {
  if (!fs.existsSync(HOOK_FILE)) {
    console.log('✗ Post-commit hook not found');
    console.log('  Run: npm run prepare');
    return false;
  }

  const content = fs.readFileSync(HOOK_FILE, 'utf8');

  if (content.includes(HOOK_LINE)) {
    console.log('✓ Navigator hook is installed');
    return true;
  } else {
    console.log('✗ Navigator hook not installed');
    console.log('  Run: node squads/navigator/scripts/install-hooks.js');
    return false;
  }
}

/**
 * Uninstall Navigator hook
 */
function uninstallHook() {
  if (!fs.existsSync(HOOK_FILE)) {
    console.log('✗ Post-commit hook not found');
    return false;
  }

  const content = fs.readFileSync(HOOK_FILE, 'utf8');

  if (!content.includes(HOOK_LINE)) {
    console.log('✓ Navigator hook not installed (nothing to remove)');
    return true;
  }

  // Remove Navigator hook lines
  const lines = content.split('\n');
  const filteredLines = lines.filter(line =>
    !line.includes(HOOK_LINE) &&
    !line.includes(HOOK_COMMENT) &&
    !line.includes('Auto-updates roadmap when stories change'),
  );

  const newContent = filteredLines.join('\n');

  fs.writeFileSync(HOOK_FILE, newContent);

  console.log('✓ Navigator hook uninstalled');
  return true;
}

/**
 * Show installation status
 */
function showStatus() {
  console.log('\n🧭 Navigator Git Hooks Status\n');

  // Check Husky
  const huskyExists = fs.existsSync('.husky');
  console.log(`Husky: ${huskyExists ? '✓' : '✗'}`);

  // Check post-commit
  const hookExists = fs.existsSync(HOOK_FILE);
  console.log(`Post-commit hook: ${hookExists ? '✓' : '✗'}`);

  if (hookExists) {
    const content = fs.readFileSync(HOOK_FILE, 'utf8');
    const navigatorInstalled = content.includes(HOOK_LINE);
    console.log(`Navigator hook: ${navigatorInstalled ? '✓ Installed' : '✗ Not installed'}`);
  }

  console.log('\nCommands:');
  console.log('  Install:   node squads/navigator/scripts/install-hooks.js');
  console.log('  Check:     node squads/navigator/scripts/install-hooks.js --check');
  console.log('  Uninstall: node squads/navigator/scripts/install-hooks.js --uninstall');
  console.log('  Status:    node squads/navigator/scripts/install-hooks.js --status\n');
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case '--check':
      process.exit(checkHook() ? 0 : 1);
      break;

    case '--uninstall':
      process.exit(uninstallHook() ? 0 : 1);
      break;

    case '--status':
      showStatus();
      break;

    case '--help':
    case '-h':
      console.log('Usage: node install-hooks.js [--check|--uninstall|--status|--help]');
      console.log('\nOptions:');
      console.log('  (no args)    Install Navigator hook');
      console.log('  --check      Check if hook is installed');
      console.log('  --uninstall  Remove Navigator hook');
      console.log('  --status     Show installation status');
      console.log('  --help       Show this help\n');
      break;

    default:
      // Install by default
      process.exit(installHook() ? 0 : 1);
  }
}

module.exports = {
  installHook,
  checkHook,
  uninstallHook,
  showStatus,
};
