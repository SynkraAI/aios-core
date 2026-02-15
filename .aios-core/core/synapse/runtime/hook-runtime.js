'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Resolve runtime dependencies for Synapse hook execution.
 *
 * @param {{cwd?: string, sessionId?: string}} input
 * @returns {{
 *   engine: import('../engine').SynapseEngine,
 *   session: Object
 * } | null}
 */
function resolveHookRuntime(input) {
  const cwd = input && input.cwd;
  const sessionId = input && input.sessionId;
  if (!cwd) return null;

  const synapsePath = path.join(cwd, '.synapse');
  if (!fs.existsSync(synapsePath)) return null;

  const { loadSession } = require(
    path.join(cwd, '.aios-core', 'core', 'synapse', 'session', 'session-manager.js'),
  );
  const { SynapseEngine } = require(
    path.join(cwd, '.aios-core', 'core', 'synapse', 'engine.js'),
  );

  const sessionsDir = path.join(synapsePath, 'sessions');
  const session = loadSession(sessionId, sessionsDir) || { prompt_count: 0 };
  const engine = new SynapseEngine(synapsePath);

  return { engine, session };
}

/**
 * Normalize hook output payload shape.
 * @param {string} xml
 * @returns {{hookSpecificOutput: {additionalContext: string}}}
 */
function buildHookOutput(xml) {
  return {
    hookSpecificOutput: {
      additionalContext: xml || '',
    },
  };
}

module.exports = {
  resolveHookRuntime,
  buildHookOutput,
};
