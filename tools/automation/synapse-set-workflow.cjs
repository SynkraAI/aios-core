#!/usr/bin/env node
'use strict';

/**
 * Set active_workflow in the current Synapse session.
 *
 * Usage:
 *   node tools/synapse-set-workflow.cjs <workflow_id> [phase]
 *   node tools/synapse-set-workflow.cjs forge_pipeline 0
 *   node tools/synapse-set-workflow.cjs --clear
 *
 * Finds the most recent session in .synapse/sessions/ and updates
 * the active_workflow field.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: synapse-set-workflow.cjs <workflow_id> [phase] | --clear');
  process.exit(1);
}

const aiosCore = path.resolve(__dirname, '..');
const sessionsDir = path.join(aiosCore, '.synapse', 'sessions');

if (!fs.existsSync(sessionsDir)) {
  console.error('No .synapse/sessions/ directory found');
  process.exit(1);
}

// Find most recent session file
const files = fs.readdirSync(sessionsDir)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .map(f => ({
    name: f,
    path: path.join(sessionsDir, f),
    mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
  console.error('No session files found');
  process.exit(1);
}

const sessionFile = files[0].path;
const session = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));

if (args[0] === '--clear') {
  session.active_workflow = null;
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  console.log(`Workflow cleared in session ${files[0].name}`);
  process.exit(0);
}

const workflowId = args[0];
const currentPhase = args[1] ? parseInt(args[1], 10) : null;

session.active_workflow = {
  id: workflowId,
  activated_at: new Date().toISOString(),
  current_phase: currentPhase,
};
session.last_activity = new Date().toISOString();

fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
console.log(`Workflow set to "${workflowId}" (phase: ${currentPhase ?? 'none'}) in session ${files[0].name}`);
