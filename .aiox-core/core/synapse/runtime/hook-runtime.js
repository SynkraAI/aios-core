'use strict';

const path = require('path');
const fs = require('fs');

const DEFAULT_STALE_TTL_HOURS = 168; // 7 days

/**
 * Read .aiox-core/core-config.yaml from the current project.
 *
 * @param {string} cwd - Working directory
 * @returns {object} Parsed config object, or empty object on missing/invalid config
 */
function loadCoreConfig(cwd) {
  try {
    const yaml = require('js-yaml');
    const configPath = path.join(cwd, '.aiox-core', 'core-config.yaml');
    if (!fs.existsSync(configPath)) return {};
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return config && typeof config === 'object' ? config : {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[synapse:hook-runtime] Failed to load core-config.yaml: ${msg}`);
    return {};
  }
}

/**
 * Read stale session TTL from core-config.yaml.
 * Falls back to DEFAULT_STALE_TTL_HOURS (168h = 7 days).
 *
 * @param {string} cwd - Working directory
 * @returns {number} TTL in hours
 */
function getStaleSessionTTL(cwd) {
  const config = loadCoreConfig(cwd);
  const ttl = config && config.synapse && config.synapse.session && config.synapse.session.staleTTLHours;
  return typeof ttl === 'number' && ttl > 0 ? ttl : DEFAULT_STALE_TTL_HOURS;
}

/**
 * Resolve runtime dependencies for Synapse hook execution.
 *
 * On the first prompt of a session (prompt_count === 0), runs
 * cleanStaleSessions() fire-and-forget to remove expired sessions.
 *
 * @param {{cwd?: string, session_id?: string, sessionId?: string}} input
 * @returns {{
 *   engine: import('../engine').SynapseEngine,
 *   session: Object
 * } | null}
 */
function resolveHookRuntime(input) {
  const cwd = input && input.cwd;
  const sessionId = input && (input.session_id || input.sessionId);
  if (!cwd || typeof cwd !== 'string') return null;

  const synapsePath = path.join(cwd, '.synapse');
  if (!fs.existsSync(synapsePath)) return null;

  try {
    const { loadSession, createSession, cleanStaleSessions } = require(
      path.join(cwd, '.aiox-core', 'core', 'synapse', 'session', 'session-manager.js'),
    );
    const { SynapseEngine } = require(
      path.join(cwd, '.aiox-core', 'core', 'synapse', 'engine.js'),
    );

    const sessionsDir = path.join(synapsePath, 'sessions');

    // Create session file on first prompt if it doesn't exist.
    // Without this, updateSession() silently fails because loadSession() returns null.
    let session = loadSession(sessionId, sessionsDir);
    if (!session && sessionId) {
      session = createSession(sessionId, cwd, sessionsDir);
    }
    if (!session) {
      session = { prompt_count: 0 };
    }
    const coreConfig = loadCoreConfig(cwd);
    const engine = new SynapseEngine(synapsePath, {
      synapse: coreConfig.synapse || {},
    });

    // AC3: Run cleanup on first prompt only (fire-and-forget)
    if (session.prompt_count === 0) {
      try {
        const ttlHours = getStaleSessionTTL(cwd);
        const removed = cleanStaleSessions(sessionsDir, ttlHours);
        if (removed > 0 && process.env.DEBUG === '1') {
          console.error(`[hook-runtime] Cleaned ${removed} stale session(s) (TTL: ${ttlHours}h)`);
        }
      } catch (_cleanupErr) {
        // Fire-and-forget: never block hook execution
      }
    }

    return { engine, session, sessionId, sessionsDir, cwd };
  } catch (error) {
    if (process.env.DEBUG === '1') {
      console.error(`[hook-runtime] Failed to resolve runtime: ${error.message}`);
    }
    return null;
  }
}

/**
 * Normalize hook output payload shape.
 *
 * Claude Code 2.1.68+ validates hook outputs by event-specific schema.
 * For UserPromptSubmit, hookSpecificOutput.hookEventName is required.
 *
 * @param {string} xml
 * @returns {{hookSpecificOutput: {hookEventName: string, additionalContext: string}}}
 */
function buildHookOutput(xml) {
  return {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: xml || '',
    },
  };
}

module.exports = {
  loadCoreConfig,
  getStaleSessionTTL,
  resolveHookRuntime,
  buildHookOutput,
};
