#!/usr/bin/env node

/**
 * Fix Ecosystem Issues — Auto-fix common problems
 *
 * Fixes:
 * - Hooks format (array -> object)
 * - Missing chmod +x on tools
 * - Missing usage headers
 *
 * Usage:
 *   node tools/fix-ecosystem-issues.js --fix-hooks
 *   node tools/fix-ecosystem-issues.js --fix-tools
 *   node tools/fix-ecosystem-issues.js --all
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');

// ============================================================================
// FIX 1: HOOKS FORMAT (array -> object)
// ============================================================================

function fixHooksFormat() {
  console.log('\n🔧 Fixing hooks format (array -> object)...\n');

  const projectAudit = require('./audit-project-configs.js');
  const parsed = projectAudit.parseActiveProjects();
  const projects = parsed.projects || parsed;

  let fixed = 0;
  let errors = 0;

  projects.forEach(proj => {
    const settingsPath = path.join(proj.claudePath, 'settings.json');

    if (!fs.existsSync(settingsPath)) {
      return; // Skip if no settings.json
    }

    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(content);

      // Check if hooks is array
      if (Array.isArray(settings.hooks)) {
        console.log(`   Fixing: ${proj.name}`);

        // Convert array to empty object
        settings.hooks = {};

        // Write back
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
        fixed++;
      }
    } catch (error) {
      console.log(`   ❌ Error in ${proj.name}: ${error.message}`);
      errors++;
    }
  });

  console.log(`\n✅ Fixed ${fixed} projects`);
  if (errors > 0) {
    console.log(`⚠️ ${errors} errors encountered`);
  }
}

// ============================================================================
// FIX 2: CHMOD +X ON TOOLS
// ============================================================================

function fixToolsPermissions() {
  console.log('\n🔧 Adding executable permissions to tools...\n');

  const toolsDir = path.join(AIOS_CORE, 'tools');
  const tools = fs.readdirSync(toolsDir)
    .filter(name => name.endsWith('.js') || name.endsWith('.sh'));

  let fixed = 0;

  tools.forEach(name => {
    const toolPath = path.join(toolsDir, name);
    const stats = fs.statSync(toolPath);

    // Check if executable
    const isExecutable = (stats.mode & 0o111) !== 0;

    if (!isExecutable) {
      console.log(`   Adding +x: ${name}`);
      fs.chmodSync(toolPath, stats.mode | 0o111);
      fixed++;
    }
  });

  console.log(`\n✅ Fixed ${fixed} tools`);
}

// ============================================================================
// FIX 3: CLEAN SQUAD JUNK
// ============================================================================

function cleanSquadJunk() {
  console.log('\n🔧 Cleaning squad junk directories...\n');

  const squadsDir = path.join(AIOS_CORE, 'squads');
  const junkDirs = ['__MACOSX', '_example', '_imports'];

  let removed = 0;

  junkDirs.forEach(name => {
    const dirPath = path.join(squadsDir, name);

    if (fs.existsSync(dirPath)) {
      console.log(`   Removing: ${name}`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      removed++;
    }
  });

  console.log(`\n✅ Removed ${removed} junk directories`);
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const fixHooks = args.includes('--fix-hooks') || args.includes('--all');
  const fixTools = args.includes('--fix-tools') || args.includes('--all');
  const cleanJunk = args.includes('--clean-junk') || args.includes('--all');

  if (!fixHooks && !fixTools && !cleanJunk) {
    console.log(`
Usage:
  node tools/fix-ecosystem-issues.js --fix-hooks
  node tools/fix-ecosystem-issues.js --fix-tools
  node tools/fix-ecosystem-issues.js --clean-junk
  node tools/fix-ecosystem-issues.js --all
    `);
    process.exit(1);
  }

  console.log('🚀 Fixing ecosystem issues...');

  if (fixHooks) fixHooksFormat();
  if (fixTools) fixToolsPermissions();
  if (cleanJunk) cleanSquadJunk();

  console.log('\n✨ Done! Re-run ecosystem-audit to verify:\n');
  console.log('   node tools/ecosystem-audit.js\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  fixHooksFormat,
  fixToolsPermissions,
  cleanSquadJunk
};
