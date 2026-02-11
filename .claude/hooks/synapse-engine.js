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
 * - All errors logged to stderr with [synapse-hook] prefix
 * - 5s safety timeout as defense-in-depth
 *
 * @module synapse-engine-hook
 */

const path = require('path');
const fs = require('fs');

/** Safety timeout (ms) — defense-in-depth; Claude Code also manages hook timeout. */
const HOOK_TIMEOUT_MS = 5000;

/**
 * Read all data from stdin as a JSON object.
 * @returns {Promise<object>} Parsed JSON input
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  });
}

/** Main hook execution pipeline. */
async function main() {
  const input = await readStdin();
  const { sessionId, cwd, prompt } = input;
  const synapsePath = path.join(cwd, '.synapse');
  if (!fs.existsSync(synapsePath)) return;

  const { loadSession } = require(
    path.join(cwd, '.aios-core', 'core', 'synapse', 'session', 'session-manager.js')
  );
  const { SynapseEngine } = require(
    path.join(cwd, '.aios-core', 'core', 'synapse', 'engine.js')
  );

  const sessionsDir = path.join(synapsePath, 'sessions');
  const session = loadSession(sessionId, sessionsDir) || { prompt_count: 0 };
  const engine = new SynapseEngine(synapsePath);
  const result = engine.process(prompt, session);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { additionalContext: result.xml || '' },
  }));
}

/** Entry point runner — sets safety timeout and executes main(). */
function run() {
  const timer = setTimeout(() => process.exit(0), HOOK_TIMEOUT_MS);
  timer.unref();
  main().catch((err) => {
    console.error(`[synapse-hook] ${err.message}`);
    process.exit(0);
  });
}

if (require.main === module) run();

module.exports = { readStdin, main, run, HOOK_TIMEOUT_MS };
