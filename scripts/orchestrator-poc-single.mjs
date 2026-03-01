#!/usr/bin/env node

/**
 * orchestrator-poc-single.mjs
 *
 * Phase 0 PoC — Story E7.0.1
 * Executes a single AIOS agent (@sm) via `claude -p` with:
 *   - System prompt from agent persona file
 *   - Tool restrictions (--allowed-tools)
 *   - Model selection (--model)
 *   - Budget cap (--max-budget-usd)
 *   - JSON output (--output-format json)
 *   - Setting sources for CLAUDE.md loading (--setting-sources user,project)
 *   - Permission bypass for autonomous execution (--permission-mode bypassPermissions)
 *
 * Exit codes:
 *   0 — success (agent completed, output JSON valid)
 *   1 — agent error (parse failure, empty output, budget exceeded)
 *   2 — configuration error (persona file not found, claude not in PATH)
 *
 * Usage:
 *   node scripts/orchestrator-poc-single.mjs
 */

import { resolve } from 'node:path';
import {
  PROJECT_ROOT,
  log,
  ensureClaudeCLI,
  ensureFileExists,
  ensureDir,
  runAgent,
  parseAgentOutput,
  extractResponseText,
  verifyToolRestrictions,
  extractCost,
  saveJson,
  readFile,
  logPhase,
} from './poc-lib.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENT_CONFIG = {
  id: 'sm',
  persona: '.claude/commands/AIOS/agents/sm.md',
  allowedTools: 'Read,Write,Grep,Glob',
  model: 'claude-sonnet-4-6',
  maxBudgetUsd: 3.00,
};

const PROMPT_PATH = resolve(PROJECT_ROOT, 'scripts/poc-prompts/sm-create-story.txt');
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'scripts/poc-output');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'phase-output.json');

// Disallowed tools for @sm
const DISALLOWED_TOOLS = ['Bash', 'Edit'];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log('info', '=== AIOS SDK Orchestrator PoC — Single Agent Execution ===');
  log('info', `Agent: @${AGENT_CONFIG.id} | Model: ${AGENT_CONFIG.model} | Budget: $${AGENT_CONFIG.maxBudgetUsd}`);

  // Pre-flight checks
  ensureClaudeCLI();
  ensureFileExists(resolve(PROJECT_ROOT, AGENT_CONFIG.persona), `Persona file for @${AGENT_CONFIG.id}`);
  ensureFileExists(PROMPT_PATH, 'Prompt file');
  ensureDir(OUTPUT_DIR);

  // Read prompt
  const prompt = readFile(PROMPT_PATH);
  log('info', `Prompt loaded: ${prompt.length} chars`);

  // Execute agent
  let result;
  try {
    result = await runAgent(AGENT_CONFIG, prompt);
  } catch (err) {
    log('error', `Agent execution failed: ${err.message}`);
    process.exit(1);
  }

  log('info', `claude -p exited with code ${result.code} in ${result.durationMs}ms`);

  // Check process exit code
  if (result.code !== 0) {
    log('error', `claude -p returned non-zero exit code: ${result.code}`);
    log('error', `stdout: ${result.stdout.slice(0, 500)}`);
    process.exit(1);
  }

  // Parse JSON output
  const parsed = parseAgentOutput(result.stdout);
  if (!parsed) {
    log('error', 'Failed to parse agent output as JSON');
    process.exit(1);
  }

  // Extract response text
  const responseText = extractResponseText(parsed);
  if (!responseText || responseText.trim().length === 0) {
    log('error', 'Agent output contains no text response');
    process.exit(1);
  }

  log('info', `Response text length: ${responseText.length} chars`);

  // Save output
  saveJson(OUTPUT_PATH, parsed);

  // Verify tool restrictions (AC3)
  const { toolsUsed, violations } = verifyToolRestrictions(parsed, DISALLOWED_TOOLS);
  log('info', `Tools used by agent: ${toolsUsed.length > 0 ? toolsUsed.join(', ') : '(none detected)'}`);

  if (violations.length > 0) {
    log('warn', `TOOL RESTRICTION VIOLATION: Agent used disallowed tools: ${violations.join(', ')}`);
  } else {
    log('info', 'Tool restriction check: PASSED (no disallowed tools used)');
  }

  // Extract cost (AC4)
  const cost = extractCost(parsed);
  if (cost !== null) {
    log('info', `cost_usd=${cost.toFixed(4)}`);
  } else {
    log('info', 'Cost information not available in output JSON');
  }

  // Phase log
  logPhase(AGENT_CONFIG.id, result.durationMs, cost);

  // Summary log (AC5)
  log('info', '--- Execution Summary ---');
  log('info', `agent=${AGENT_CONFIG.id} | model=${AGENT_CONFIG.model} | budget=$${AGENT_CONFIG.maxBudgetUsd} | exit=0`);
  log('info', `duration_ms=${result.durationMs} | tool_violations=${violations.length}`);

  process.exit(0);
}

main().catch((err) => {
  log('error', `Unhandled error: ${err.message}`);
  process.exit(1);
});
