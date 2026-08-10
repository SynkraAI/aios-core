#!/usr/bin/env node
'use strict';

/**
 * SYNAPSE Hook Entry Point — UserPromptSubmit
 *
 * Thin wrapper that reads JSON from stdin, delegates to SynapseEngine,
 * and writes <synapse-rules> context to stdout.
 *
 * - Silent exit on missing .synapse/ directory
 * - Silent exit on any error (never blocks the user prompt)
 * - 5s safety timeout as defense-in-depth
 *
 * @module synapse-engine-hook
 */

const fs = require('fs');
const path = require('path');

/** Safety timeout (ms) — defense-in-depth; Claude Code also manages hook timeout. */
const HOOK_TIMEOUT_MS = 5000;

/**
 * Resolve project root for both checkout layouts:
 * - `.claude/hooks` or `.grok/hooks` → two levels up
 * - `.aiox-core/infrastructure/templates/grok-hooks` → four levels up
 * Also accepts process.cwd() and installed node_modules layouts.
 */
function resolveProjectRoot() {
  const runtimeRel = path.join('.aiox-core', 'core', 'synapse', 'runtime', 'hook-runtime.js');
  const installedRel = path.join(
    'node_modules',
    'aiox-core',
    '.aiox-core',
    'core',
    'synapse',
    'runtime',
    'hook-runtime.js',
  );
  const candidates = [
    process.cwd(),
    path.resolve(__dirname, '..', '..'),
    path.resolve(__dirname, '..', '..', '..', '..'),
  ];
  for (const candidate of candidates) {
    if (
      fs.existsSync(path.join(candidate, runtimeRel)) ||
      fs.existsSync(path.join(candidate, installedRel))
    ) {
      return candidate;
    }
  }
  return process.cwd();
}

function resolveHookRuntimeModulePath(projectRoot) {
  const candidates = [
    path.join(projectRoot, '.aiox-core', 'core', 'synapse', 'runtime', 'hook-runtime.js'),
    path.join(
      projectRoot,
      'node_modules',
      'aiox-core',
      '.aiox-core',
      'core',
      'synapse',
      'runtime',
      'hook-runtime.js',
    ),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const PROJECT_ROOT = resolveProjectRoot();
let resolveHookRuntime = null;
let buildHookOutput = null;
try {
  const runtimePath = resolveHookRuntimeModulePath(PROJECT_ROOT);
  if (runtimePath) {
    ({ resolveHookRuntime, buildHookOutput } = require(runtimePath));
  }
} catch {
  // Silent — missing/invalid runtime must never crash the hook process.
  resolveHookRuntime = null;
  buildHookOutput = null;
}

/**
 * Read all data from stdin as a JSON object.
 * @returns {Promise<object>} Parsed JSON input
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('error', (e) => reject(e));
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  });
}

/** Main hook execution pipeline. */
async function main() {
  if (typeof resolveHookRuntime !== 'function' || typeof buildHookOutput !== 'function') {
    return;
  }

  const input = await readStdin();
  const runtime = resolveHookRuntime(input);
  if (!runtime) return;

  const result = await runtime.engine.process(input.prompt, runtime.session);

  // QW-1: Wire updateSession() — persist bracket transitions after each prompt
  if (runtime.sessionId && runtime.sessionsDir) {
    try {
      const sessionManagerCandidates = [
        path.join(runtime.cwd, '.aiox-core', 'core', 'synapse', 'session', 'session-manager.js'),
        path.join(
          runtime.cwd,
          'node_modules',
          'aiox-core',
          '.aiox-core',
          'core',
          'synapse',
          'session',
          'session-manager.js',
        ),
      ];
      const sessionManagerPath = sessionManagerCandidates.find((candidate) => fs.existsSync(candidate));
      if (sessionManagerPath) {
        const { updateSession } = require(sessionManagerPath);
        updateSession(runtime.sessionId, runtime.sessionsDir, {
          context: { last_bracket: result.bracket || 'FRESH' },
        });
      }
    } catch (_err) {
      // Fire-and-forget — never block the prompt
    }
  }

  const output = JSON.stringify(buildHookOutput(result.xml));

  // Write output robustly across real process.stdout and mocked Jest streams.
  // Some mocks return boolean but never invoke callback; handle both patterns.
  await new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve();
    };

    try {
      const flushed = process.stdout.write(output, (err) => finish(err));
      if (flushed) {
        setImmediate(() => finish());
      } else if (typeof process.stdout.once === 'function') {
        process.stdout.once('drain', () => finish());
      }
    } catch (err) {
      finish(err);
    }
  });
}

/** Entry point runner — lets Node exit naturally after stdout flush. */
function run() {
  const timer = setTimeout(() => {
    // process.exitCode alone won't terminate the process if active handles
    // remain (e.g. stdout backpressure). Use process.exit() to enforce the
    // 5 s hard limit and guarantee the hook never blocks Claude Code.
    process.exit(0);
  }, HOOK_TIMEOUT_MS);
  timer.unref();
  main()
    .then(() => {
      clearTimeout(timer);
      process.exitCode = 0;
    })
    .catch(() => {
      clearTimeout(timer);
      // Silent exit — stderr output triggers "hook error" in Claude Code UI
      process.exitCode = 0;
    });
}

if (require.main === module) run();

module.exports = { readStdin, main, run, HOOK_TIMEOUT_MS };
