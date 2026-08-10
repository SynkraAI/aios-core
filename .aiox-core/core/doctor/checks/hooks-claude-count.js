/**
 * Doctor Check: Hooks Claude Count
 *
 * Counts .cjs files in .claude/hooks/ and verifies registration
 * in settings.local.json.
 * PASS: >=2 + all registered, WARN: files present but not registered or <2,
 * FAIL: 0 or directory missing.
 *
 * @module aiox-core/doctor/checks/hooks-claude-count
 * @story INS-4.8
 */

const path = require('path');
const fs = require('fs');

const name = 'hooks-claude-count';

/**
 * Extracts every hook command string from a Claude Code settings file.
 *
 * Hooks may be registered in settings.json (shipped/tracked) or
 * settings.local.json (per-machine); Claude Code merges both, so
 * registration in either counts.
 *
 * Returns [] when the file is missing or unparseable.
 */
function collectHookCommands(settingsPath) {
  if (!fs.existsSync(settingsPath)) return [];

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    return [];
  }

  const hooks = settings.hooks || {};
  // Claude Code hooks schema: { EventName: [{ matcher, hooks: [{ type, command }] }] }
  const commands = [];
  for (const entries of Object.values(hooks)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (entry && Array.isArray(entry.hooks)) {
        for (const h of entry.hooks) {
          if (h && h.command) commands.push(h.command);
        }
      }
      // Fallback: flat string or direct command
      if (typeof entry === 'string') commands.push(entry);
      if (entry && typeof entry.command === 'string') commands.push(entry.command);
    }
  }

  return commands;
}

/**
 * Extracts referenced hook filenames from command strings.
 *
 * Matches complete .cjs filenames at path/shell-token boundaries rather than
 * by substring: a bare `includes()` would treat `sync.cjs` as referenced by a
 * command that only mentions `sync-wrapper.cjs`, turning a missing
 * registration into a PASS with an inflated count.
 */
function referencedHookNames(commands) {
  const names = new Set();

  for (const command of commands) {
    for (const rawToken of command.split(/\s+/)) {
      // Strip surrounding quotes and trailing shell punctuation
      const token = rawToken.replace(/^['"`(]+/, '').replace(/['"`;,)]+$/, '');
      if (!token.endsWith('.cjs')) continue;
      // Normalize Windows separators before taking the basename
      names.add(path.posix.basename(token.replace(/\\/g, '/')));
    }
  }

  return names;
}

async function run(context) {
  const hooksDir = path.join(context.projectRoot, '.claude', 'hooks');

  if (!fs.existsSync(hooksDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Hooks directory not found (.claude/hooks/)',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  let entries;
  try {
    entries = fs.readdirSync(hooksDir, { withFileTypes: true });
  } catch {
    return {
      check: name,
      status: 'FAIL',
      message: 'Cannot read hooks directory',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  const hookFiles = entries.filter(
    (e) => e.isFile() && e.name.endsWith('.cjs'),
  );
  const hookCount = hookFiles.length;

  if (hookCount === 0) {
    return {
      check: name,
      status: 'FAIL',
      message: 'No hook files found (.cjs)',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  // Check registration in settings.json and settings.local.json (Claude Code merges both).
  // Wrapper hooks are registered directly; engine hooks they spawn as child
  // processes are not, so any reference is enough to count as wired up.
  const claudeDir = path.join(context.projectRoot, '.claude');
  const referenced = referencedHookNames([
    ...collectHookCommands(path.join(claudeDir, 'settings.json')),
    ...collectHookCommands(path.join(claudeDir, 'settings.local.json')),
  ]);

  const referencedCount = hookFiles.filter((f) => referenced.has(f.name)).length;
  const registered = referencedCount > 0;

  if (hookCount >= 2 && registered) {
    return {
      check: name,
      status: 'PASS',
      message: `${hookCount} hook files found, ${referencedCount} registered`,
      fixCommand: null,
    };
  }

  if (hookCount >= 2 && !registered) {
    return {
      check: name,
      status: 'WARN',
      message: `${hookCount} hook files found but not registered in settings.json or settings.local.json`,
      fixCommand: 'npx aiox-core install --force',
    };
  }

  return {
    check: name,
    status: 'WARN',
    message: `Only ${hookCount}/2 hook files found`,
    fixCommand: 'npx aiox-core install --force',
  };
}

module.exports = { name, run };
