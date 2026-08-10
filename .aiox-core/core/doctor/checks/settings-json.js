/**
 * Doctor Check: settings.json
 *
 * Validates .claude/settings.json exists, deny rules count >= 40,
 * and compares against core-config.yaml boundary paths.
 *
 * @module aiox-core/doctor/checks/settings-json
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'settings-json';

/**
 * Reads boundary.frameworkProtection from core-config.yaml.
 *
 * Deny rules exist to stop project consumers from editing L1/L2 framework
 * paths. Framework contributors set frameworkProtection: false precisely so
 * those paths stay editable, so an empty deny list is correct in that mode.
 *
 * Defaults to true (protected) when the config or key is absent.
 */
function isFrameworkProtectionEnabled(context) {
  const configPath = path.join(context.projectRoot, '.aiox-core', 'core-config.yaml');
  if (!fs.existsSync(configPath)) return true;

  let content;
  try {
    content = fs.readFileSync(configPath, 'utf8');
  } catch {
    return true;
  }

  let inBoundary = false;
  for (const line of content.split('\n')) {
    if (/^boundary:\s*$/.test(line)) {
      inBoundary = true;
      continue;
    }
    if (!inBoundary) continue;
    // A new top-level key ends the boundary section
    if (/^\S/.test(line)) break;
    const match = line.match(/^\s+frameworkProtection:\s*(true|false)\b/);
    if (match) return match[1] === 'true';
  }

  return true;
}

/**
 * Checks that core-config.yaml boundary.protected paths are covered by deny rules.
 * Returns array of unprotected boundary paths.
 */
function checkBoundaryAlignment(context, denyRules) {
  const configPath = path.join(context.projectRoot, '.aiox-core', 'core-config.yaml');
  if (!fs.existsSync(configPath)) return []; // No config = skip boundary check

  let content;
  try {
    content = fs.readFileSync(configPath, 'utf8');
  } catch {
    return [];
  }

  // Extract boundary.protected paths from YAML (simple line parsing)
  const lines = content.split('\n');
  const protectedPaths = [];
  let inProtected = false;

  for (const line of lines) {
    if (/^\s+protected:\s*$/.test(line)) {
      inProtected = true;
      continue;
    }
    if (inProtected) {
      const match = line.match(/^\s+-\s+(.+)$/);
      if (match) {
        protectedPaths.push(match[1].trim());
      } else if (/^\s+\w/.test(line) && !line.match(/^\s+-/)) {
        inProtected = false;
      }
    }
  }

  if (protectedPaths.length === 0) return [];

  // Check each boundary path has at least one matching deny rule
  const denyStr = denyRules.join('\n');
  const unprotected = protectedPaths.filter((bp) => {
    // Strip glob suffixes for base path matching
    const basePath = bp.replace(/\/\*\*$/, '').replace(/\/\*$/, '');
    return !denyStr.includes(basePath);
  });

  return unprotected;
}

async function run(context) {
  const settingsPath = path.join(context.projectRoot, '.claude', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'settings.json not found',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    return {
      check: name,
      status: 'FAIL',
      message: 'settings.json is invalid JSON',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  const denyRules = settings.permissions?.deny || [];
  const allowRules = settings.permissions?.allow || [];
  const denyCount = denyRules.length;
  const allowCount = allowRules.length;

  // Contributor mode: boundary enforcement is off, so deny rules are not expected
  if (!isFrameworkProtectionEnabled(context)) {
    return {
      check: name,
      status: 'PASS',
      message: `Deny rules not required (boundary.frameworkProtection: false — contributor mode, ${denyCount} rules, ${allowCount} allows)`,
      fixCommand: null,
    };
  }

  if (denyCount < 40) {
    return {
      check: name,
      status: 'WARN',
      message: `Deny rules below threshold (${denyCount} rules, expected >= 40)`,
      fixCommand: 'aiox doctor --fix',
    };
  }

  // Compare deny rules against core-config.yaml boundary.protected paths
  const boundaryIssues = checkBoundaryAlignment(context, denyRules);
  if (boundaryIssues.length > 0) {
    return {
      check: name,
      status: 'WARN',
      message: `Deny rules present (${denyCount}) but missing boundary coverage: ${boundaryIssues.join(', ')}`,
      fixCommand: 'aiox doctor --fix',
    };
  }

  return {
    check: name,
    status: 'PASS',
    message: `Deny rules present (${denyCount} rules, ${allowCount} allows)`,
    fixCommand: null,
  };
}

module.exports = { name, run };
