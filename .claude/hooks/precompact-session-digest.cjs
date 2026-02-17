#!/usr/bin/env node
/**
 * Claude Code Hook: PreCompact Session Digest
 *
 * This hook is registered with Claude Code to trigger before context compact.
 * It delegates to the unified hook runner in aios-core.
 *
 * Installation:
 * - Claude Code automatically discovers hooks in .claude/hooks/
 * - Hook naming: {event}-{name}.js (e.g., precompact-session-digest.js)
 *
 * @see .aios-core/hooks/unified/runners/precompact-runner.js
 * @see Story MIS-3 - Session Digest (PreCompact Hook)
 */

'use strict';

const path = require('path');

// Resolve path to the unified hook runner
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(
  PROJECT_ROOT,
  '.aios-core',
  'hooks',
  'unified',
  'runners',
  'precompact-runner.js',
);

// Load and execute the hook runner
try {
  const { onPreCompact } = require(runnerPath);

  // Export the hook handler for Claude Code
  module.exports = async (context) => {
    return await onPreCompact(context);
  };
} catch (error) {
  console.error('[PreCompact Hook] Failed to load hook runner:', error.message);

  // Graceful degradation - export no-op function
  module.exports = async () => {
    console.log('[PreCompact Hook] Hook runner not available, skipping');
  };
}
