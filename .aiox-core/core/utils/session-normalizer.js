/**
 * Session Normalizer
 *
 * Normalizes session objects to a consistent camelCase format.
 * Resolves inconsistencies between active_agent (snake_case) and activeAgent (camelCase).
 *
 * @module core/utils/session-normalizer
 * @version 1.0.0
 */

'use strict';

/**
 * Normalize session data for internal consumption.
 * @param {Object} session - Raw session object
 * @returns {Object} Normalized session object
 */
function normalizeSession(session) {
  if (!session || typeof session !== 'object') {
    return { prompt_count: 0, activeAgent: null };
  }

  const normalized = { ...session };

  // 1. Normalize prompt_count
  normalized.prompt_count = session.prompt_count || session.promptCount || 0;

  // 2. Normalize activeAgent
  // Priority: explicit activeAgent > active_agent.id > active_agent (string)
  let agentId = null;
  if (session.activeAgent) {
    agentId = typeof session.activeAgent === 'object' ? session.activeAgent.id : session.activeAgent;
  } else if (session.active_agent) {
    agentId = typeof session.active_agent === 'object' ? session.active_agent.id : session.active_agent;
  }
  normalized.activeAgent = agentId;

  // 3. Keep backward compatibility for layers that still use snake_case
  if (!normalized.active_agent && agentId) {
    normalized.active_agent = { id: agentId };
  }

  return normalized;
}

module.exports = {
  normalizeSession,
};
