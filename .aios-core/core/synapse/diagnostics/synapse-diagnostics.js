/**
 * SYNAPSE Diagnostics Orchestrator
 *
 * Coordinates all collectors and generates a comprehensive diagnostic report
 * comparing expected vs. actual SYNAPSE pipeline state.
 *
 * Usage:
 *   const { runDiagnostics } = require('.../synapse-diagnostics');
 *   const report = runDiagnostics('/path/to/project');
 *
 * @module core/synapse/diagnostics/synapse-diagnostics
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const path = require('path');
const { collectHookStatus } = require('./collectors/hook-collector');
const { collectSessionStatus } = require('./collectors/session-collector');
const { collectManifestIntegrity } = require('./collectors/manifest-collector');
const { collectPipelineSimulation } = require('./collectors/pipeline-collector');
const { collectUapBridgeStatus } = require('./collectors/uap-collector');
const { formatReport } = require('./report-formatter');
const { parseManifest } = require('../domain/domain-loader');

/**
 * Run full SYNAPSE diagnostics and return formatted markdown report.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {object} [options] - Diagnostic options
 * @param {string} [options.sessionId] - Session UUID for session-specific checks
 * @returns {string} Formatted markdown diagnostic report
 */
function runDiagnostics(projectRoot, options = {}) {
  const synapsePath = path.join(projectRoot, '.synapse');
  const manifestPath = path.join(synapsePath, 'manifest');

  // Run all collectors
  const hook = collectHookStatus(projectRoot);
  const session = collectSessionStatus(projectRoot, options.sessionId);
  const manifest = collectManifestIntegrity(projectRoot);

  // Parse manifest for pipeline simulation
  const parsedManifest = parseManifest(manifestPath);

  // Extract session data for pipeline simulation
  const promptCount = session.raw?.session?.prompt_count || 0;
  const activeAgentId = session.raw?.bridgeData?.id || session.raw?.session?.active_agent?.id || null;

  const pipeline = collectPipelineSimulation(promptCount, activeAgentId, parsedManifest);
  const uap = collectUapBridgeStatus(projectRoot);

  // Format report
  const report = formatReport({ hook, session, manifest, pipeline, uap });

  return report;
}

/**
 * Run diagnostics and return raw collector data (for programmatic use).
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {object} [options] - Diagnostic options
 * @returns {object} Raw collector results
 */
function runDiagnosticsRaw(projectRoot, options = {}) {
  const synapsePath = path.join(projectRoot, '.synapse');
  const manifestPath = path.join(synapsePath, 'manifest');

  const hook = collectHookStatus(projectRoot);
  const session = collectSessionStatus(projectRoot, options.sessionId);
  const manifest = collectManifestIntegrity(projectRoot);
  const parsedManifest = parseManifest(manifestPath);

  const promptCount = session.raw?.session?.prompt_count || 0;
  const activeAgentId = session.raw?.bridgeData?.id || session.raw?.session?.active_agent?.id || null;

  const pipeline = collectPipelineSimulation(promptCount, activeAgentId, parsedManifest);
  const uap = collectUapBridgeStatus(projectRoot);

  return { hook, session, manifest, pipeline, uap };
}

module.exports = { runDiagnostics, runDiagnosticsRaw };
