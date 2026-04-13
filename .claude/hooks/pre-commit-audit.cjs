#!/usr/bin/env node

/**
 * Pre-Commit Audit Hook
 *
 * Roda audit de configurações antes de cada commit.
 * Bloqueia commit se houver projetos com config faltando.
 */

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log('blue', '\n🔍 [Pre-Commit] Running project config audit...\n');

  try {
    // Run audit (silent mode)
    const result = execSync('node tools/project-ops/audit-project-configs.js', {
      cwd: AIOS_CORE,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // Parse result to check for failures
    const lines = result.split('\n');
    const missingLine = lines.find(l => l.includes('❌ Missing Config:'));
    const outdatedLine = lines.find(l => l.includes('⚠️ Outdated/Incomplete:'));

    const missingCount = missingLine ? parseInt(missingLine.match(/\d+/)?.[0] || '0') : 0;
    const outdatedCount = outdatedLine ? parseInt(outdatedLine.match(/\d+/)?.[0] || '0') : 0;

    if (missingCount === 0 && outdatedCount === 0) {
      log('green', '✅ [Pre-Commit] All projects have valid config\n');
      return 0;
    }

    // Non-blocking warning for outdated
    if (outdatedCount > 0) {
      log('yellow', `⚠️  [Pre-Commit] ${outdatedCount} projeto(s) com config desatualizada`);
      log('yellow', '    (Não bloqueia commit, mas considere corrigir)\n');
    }

    // Blocking error for missing
    if (missingCount > 0) {
      log('red', `\n❌ [Pre-Commit] BLOCKER: ${missingCount} projeto(s) sem config .claude/\n`);
      log('yellow', 'Para corrigir automaticamente:');
      log('yellow', '  node tools/automation/fix-project-configs.js\n');
      log('yellow', 'Ou use --no-verify para pular este hook (não recomendado)\n');
      return 1; // Block commit
    }

    return 0;

  } catch (error) {
    log('red', `\n❌ [Pre-Commit] Erro ao rodar audit: ${error.message}\n`);
    log('yellow', 'Use --no-verify para pular este hook se necessário\n');
    return 1;
  }
}

// Only run if called as git hook (not when required as module)
if (require.main === module) {
  const exitCode = main();
  process.exit(exitCode);
}

module.exports = { main };
