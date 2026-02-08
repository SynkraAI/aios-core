#!/usr/bin/env node
/**
 * Agent Context Loader - Thin wrapper for spawned agents
 *
 * Outputs ONLY operational context (git, permissions, project status, etc.)
 * Agent persona is already in the wrapper - no need to duplicate.
 *
 * Usage: node agent-context-loader.js <agentId>
 * Output: JSON to stdout (compact, ~300-500 chars)
 *
 * @module development/scripts/agent-context-loader
 * @see unified-activation-pipeline.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Compliance logging - logs to outputs/.agent-compliance/
const RETENTION_DAYS = 7;

function cleanupOldLogs(logDir) {
  // Only run ~10% of the time
  if (Math.random() > 0.1) return;
  try {
    const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
    for (const file of files) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})\.log$/);
      if (match) {
        const fileDate = new Date(match[1]).getTime();
        if (fileDate < cutoff) {
          fs.unlinkSync(path.join(logDir, file));
        }
      }
    }
  } catch {
    // Silent fail
  }
}

function logCompliance(agentId, event, data = {}) {
  try {
    const logDir = path.join(process.cwd(), 'outputs', '.agent-compliance');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${today}.log`);
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      agentId,
      ...data
    };
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    cleanupOldLogs(logDir);
  } catch {
    // Silent fail - logging should never break the loader
  }
}

// Suppress all console output to keep stdout clean for JSON
const _log = console.log;
const _warn = console.warn;
const _info = console.info;
console.log = () => {};
console.warn = () => {};
console.info = () => {};

const { UnifiedActivationPipeline } = require('./unified-activation-pipeline');

const agentId = process.argv[2];
if (!agentId) {
  process.stderr.write('Usage: node agent-context-loader.js <agentId>\n');
  process.exit(1);
}

// Log Step 1 execution start
logCompliance(agentId, 'CONTEXT_LOAD_START', { step: 1 });

const pipeline = new UnifiedActivationPipeline();
pipeline.activate(agentId).then(result => {
  const ctx = result.context;
  // Pre-compute counts so LLMs don't need to count (determinism > LLM)
  const techContent = ctx.techPreferences?.content || '';
  const output = {
    gitConfig: ctx.gitConfig,
    permissions: ctx.permissions,
    projectStatus: ctx.projectStatus,
    sessionType: ctx.sessionType,
    workflowState: ctx.workflowState,
    userProfile: ctx.userProfile,
    config: ctx.config,
    sessionStory: ctx.sessionStory,
    gotchas: ctx.gotchas,
    techPreferences: techContent ? { chars: techContent.length, content: techContent } : null,
  };
  // Strip null/undefined to keep output minimal
  for (const k of Object.keys(output)) {
    if (output[k] === null || output[k] === undefined) delete output[k];
  }
  // Log successful context load
  logCompliance(agentId, 'CONTEXT_LOAD_SUCCESS', {
    step: 1,
    hasGotchas: !!output.gotchas,
    hasTechPrefs: !!output.techPreferences,
    hasWorkflowState: !!output.workflowState
  });
  process.stdout.write(JSON.stringify(output));
  process.exit(0);
}).catch((err) => {
  // Log context load failure
  logCompliance(agentId, 'CONTEXT_LOAD_ERROR', {
    step: 1,
    error: err?.message || 'unknown'
  });
  process.stdout.write(JSON.stringify({ agentId, error: true }));
  process.exit(1);
});
