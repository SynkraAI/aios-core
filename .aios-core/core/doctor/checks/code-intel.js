/**
 * Doctor Check: Code Intelligence
 *
 * Reads code-intel provider status. Returns INFO (not FAIL) if not configured.
 *
 * @module aios-core/doctor/checks/code-intel
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'code-intel';

async function run(context) {
  const codeIntelDir = path.join(context.projectRoot, '.aios-core', 'core', 'code-intel');

  if (!fs.existsSync(codeIntelDir)) {
    return {
      check: name,
      status: 'INFO',
      message: 'Code-intel module not found (optional)',
      fixCommand: null,
    };
  }

  const configPath = path.join(context.projectRoot, '.aios-core', 'core-config.yaml');
  if (!fs.existsSync(configPath)) {
    return {
      check: name,
      status: 'INFO',
      message: 'Provider not configured (graceful fallback active)',
      fixCommand: null,
    };
  }

  const content = fs.readFileSync(configPath, 'utf8');
  const hasCodeIntel = content.includes('codeIntel:') || content.includes('code_intel:');

  if (hasCodeIntel) {
    return {
      check: name,
      status: 'PASS',
      message: 'Code-intel provider configured',
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'INFO',
    message: 'Provider not configured (graceful fallback active)',
    fixCommand: null,
  };
}

module.exports = { name, run };
