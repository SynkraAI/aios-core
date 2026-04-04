'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const FORGE_HOME = path.resolve(__dirname, '..');
const PLUGINS_DIR = path.join(FORGE_HOME, 'plugins');
const AIOS_HOME = path.resolve(FORGE_HOME, '../..');

const VALID_HOOKS = [
  'before:run',
  'before:phase:*',
  'before:phase:0',
  'before:phase:1',
  'before:phase:2',
  'before:phase:3',
  'before:phase:4',
  'before:phase:5',
  'after:phase:*',
  'after:phase:0',
  'after:phase:1',
  'after:phase:2',
  'after:phase:3',
  'after:phase:4',
  'after:phase:5',
  'on:agent-dispatch',
  'on:agent-return',
  'on:error',
  'on:checkpoint',
  'on:veto',
  'on:story-complete',
  'after:deploy',
  'after:run',
];

const VALID_MODES = [
  'FULL_APP',
  'SINGLE_FEATURE',
  'BUG_FIX',
  'QUICK',
  'BROWNFIELD',
  'DESIGN_SYSTEM',
  'LANDING_PAGE',
  'CLONE_SITE',
  'SQUAD_UPGRADE',
  'DRY_RUN',
  'REPLAY',
  'TEMPLATE',
];

const VALID_ACTIONS = ['inject', 'validate', 'log'];

let totalErrors = 0;
let totalWarnings = 0;
const results = [];

function resolveSourcePath(sourcePath) {
  return sourcePath
    .replace('{FORGE_HOME}', FORGE_HOME)
    .replace('{AIOS_HOME}', AIOS_HOME);
}

function validatePlugin(filePath) {
  const fileName = path.basename(filePath);
  const errors = [];
  const warnings = [];

  // 1. YAML parse
  let doc;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    doc = yaml.parse(content);
  } catch (e) {
    errors.push(`YAML parse error: ${e.message}`);
    return { fileName, errors, warnings };
  }

  // 2. Plugin metadata
  if (!doc.plugin) {
    errors.push('Missing: plugin section');
  } else {
    if (!doc.plugin.name) {
      errors.push('Missing: plugin.name');
    } else if (!/^[a-z0-9-]+$/.test(doc.plugin.name)) {
      errors.push(`Invalid: plugin.name "${doc.plugin.name}" must be kebab-case`);
    }
    if (!doc.plugin.version) {
      errors.push('Missing: plugin.version');
    } else if (!/^\d+\.\d+\.\d+$/.test(doc.plugin.version)) {
      warnings.push(`plugin.version "${doc.plugin.version}" is not semver`);
    }
    if (!doc.plugin.description) {
      errors.push('Missing: plugin.description');
    }
  }

  // 3. Activation
  if (!doc.activation) {
    errors.push('Missing: activation section');
  } else {
    if (doc.activation.enabled === undefined) {
      errors.push('Missing: activation.enabled');
    }
    if (doc.activation.modes && Array.isArray(doc.activation.modes)) {
      for (const mode of doc.activation.modes) {
        if (!VALID_MODES.includes(mode)) {
          errors.push(`Invalid mode: "${mode}" — valid: ${VALID_MODES.join(', ')}`);
        }
      }
    }
  }

  // 4. Priority
  if (doc.priority === undefined) {
    errors.push('Missing: priority');
  } else if (typeof doc.priority !== 'number' || doc.priority < 0 || doc.priority > 99) {
    errors.push(`Invalid: priority ${doc.priority} must be 0-99`);
  }

  // 5. Hooks
  if (!doc.hooks) {
    errors.push('Missing: hooks section');
  } else if (!Array.isArray(doc.hooks)) {
    errors.push('Invalid: hooks must be an array');
  } else {
    for (let i = 0; i < doc.hooks.length; i++) {
      const hook = doc.hooks[i];
      const prefix = `hooks[${i}]`;

      if (!hook.event) {
        errors.push(`Missing: ${prefix}.event`);
      } else if (!VALID_HOOKS.includes(hook.event)) {
        warnings.push(`${prefix}.event "${hook.event}" is not in standard hook taxonomy`);
      }

      if (!hook.action && !hook.skill) {
        errors.push(`Missing: ${prefix}.action or ${prefix}.skill`);
      }
      if (hook.action && !VALID_ACTIONS.includes(hook.action)) {
        warnings.push(`${prefix}.action "${hook.action}" is not standard (inject|validate|log)`);
      }

      if (!hook.description) {
        errors.push(`Missing: ${prefix}.description`);
      }

      // Validate source file reference
      if (hook.source) {
        const resolved = resolveSourcePath(hook.source);
        if (!fs.existsSync(resolved)) {
          errors.push(`${prefix}.source file not found: ${hook.source} → ${resolved}`);
        }
      }

      // Validate skill file reference
      if (hook.skill) {
        const skillPath = path.join(AIOS_HOME, hook.skill);
        if (!fs.existsSync(skillPath)) {
          errors.push(`${prefix}.skill file not found: ${hook.skill} → ${skillPath}`);
        }
      }

      // Validate severity for validate actions
      if (hook.action === 'validate' && hook.severity) {
        if (!['recommended', 'optional'].includes(hook.severity)) {
          errors.push(`${prefix}.severity must be "recommended" or "optional", got "${hook.severity}"`);
        }
      }
    }
  }

  // 6. State key uniqueness (checked globally later)
  if (doc.state_key && typeof doc.state_key !== 'string') {
    errors.push('Invalid: state_key must be a string');
  }

  return { fileName, errors, warnings, doc };
}

function run() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Forge Plugin Validator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Check plugins directory exists
  if (!fs.existsSync(PLUGINS_DIR)) {
    console.log('⚠️  plugins/ directory not found — nothing to validate');
    process.exit(0);
  }

  // Find all .yaml files
  const files = fs.readdirSync(PLUGINS_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => path.join(PLUGINS_DIR, f))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No .yaml files found in plugins/');
    process.exit(0);
  }

  console.log(`  Found ${files.length} plugin(s)\n`);

  // Validate each plugin
  for (const file of files) {
    const result = validatePlugin(file);
    results.push(result);

    const status = result.errors.length === 0
      ? (result.warnings.length === 0 ? '✅' : '⚠️')
      : '❌';

    console.log(`  ${status} ${result.fileName}`);

    for (const err of result.errors) {
      console.log(`     ❌ ${err}`);
      totalErrors++;
    }
    for (const warn of result.warnings) {
      console.log(`     ⚠️  ${warn}`);
      totalWarnings++;
    }
  }

  // Global checks
  console.log('');
  console.log('  ── Global Checks ──');

  // Check for duplicate state_keys
  const stateKeys = results
    .filter(r => r.doc && r.doc.state_key)
    .map(r => ({ key: r.doc.state_key, file: r.fileName }));

  const keyMap = {};
  for (const { key, file } of stateKeys) {
    if (keyMap[key]) {
      console.log(`  ❌ Duplicate state_key "${key}": ${keyMap[key]} and ${file}`);
      totalErrors++;
    } else {
      keyMap[key] = file;
    }
  }
  if (Object.keys(keyMap).length === stateKeys.length) {
    console.log(`  ✅ state_key uniqueness — ${stateKeys.length} unique keys`);
  }

  // Check for duplicate priorities
  const priorities = results
    .filter(r => r.doc && r.doc.priority !== undefined)
    .map(r => ({ priority: r.doc.priority, file: r.fileName }));

  const prioMap = {};
  for (const { priority, file } of priorities) {
    if (prioMap[priority]) {
      console.log(`  ⚠️  Duplicate priority ${priority}: ${prioMap[priority]} and ${file}`);
      totalWarnings++;
    } else {
      prioMap[priority] = file;
    }
  }
  if (Object.keys(prioMap).length === priorities.length) {
    console.log(`  ✅ Priority uniqueness — ${priorities.length} unique priorities`);
  }

  // Check for duplicate plugin names
  const names = results
    .filter(r => r.doc && r.doc.plugin && r.doc.plugin.name)
    .map(r => ({ name: r.doc.plugin.name, file: r.fileName }));

  const nameMap = {};
  for (const { name, file } of names) {
    if (nameMap[name]) {
      console.log(`  ❌ Duplicate plugin.name "${name}": ${nameMap[name]} and ${file}`);
      totalErrors++;
    } else {
      nameMap[name] = file;
    }
  }
  if (Object.keys(nameMap).length === names.length) {
    console.log(`  ✅ Plugin name uniqueness — ${names.length} unique names`);
  }

  // Summary
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (totalErrors === 0) {
    console.log(`  ✅ PASS — ${files.length} plugins validated`);
    if (totalWarnings > 0) {
      console.log(`     ${totalWarnings} warning(s)`);
    }
  } else {
    console.log(`  ❌ FAIL — ${totalErrors} error(s), ${totalWarnings} warning(s)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(totalErrors > 0 ? 1 : 0);
}

run();
