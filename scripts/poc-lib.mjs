#!/usr/bin/env node

/**
 * poc-lib.mjs
 *
 * Shared library for Phase 0 PoC scripts (E7.0.1, E7.0.2, E7.0.3).
 * Provides reusable functions for:
 *   - Executing agents via `claude -p`
 *   - Parsing JSON output
 *   - Extracting response text and cost
 *   - Verifying tool restrictions
 *   - Logging
 */

import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Project root resolution
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/**
 * Log a message with timestamp and level.
 * Format: [TIMESTAMP] [LEVEL] message
 */
export function log(level, message) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Pre-flight checks
// ---------------------------------------------------------------------------

/**
 * Verify that `claude` CLI is available in PATH.
 * Exits with code 2 if not found.
 */
export function ensureClaudeCLI() {
  try {
    execSync('which claude', { stdio: 'pipe' });
  } catch {
    log('error', 'claude CLI not found in PATH. Install: https://docs.anthropic.com/claude-code');
    process.exit(2);
  }
}

/**
 * Verify that a file exists. Exits with code 2 if not found.
 */
export function ensureFileExists(filePath, description) {
  if (!existsSync(filePath)) {
    log('error', `${description} not found: ${filePath}`);
    process.exit(2);
  }
}

/**
 * Ensure a directory exists, creating it if necessary.
 */
export function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    log('info', `Created directory: ${dirPath}`);
  }
}

// ---------------------------------------------------------------------------
// Agent execution
// ---------------------------------------------------------------------------

/**
 * Agent configuration object shape:
 * @typedef {Object} AgentConfig
 * @property {string} id - Agent identifier (e.g., 'sm', 'po', 'dev')
 * @property {string} persona - Path to persona file relative to PROJECT_ROOT
 * @property {string} allowedTools - Comma-separated allowed tool names
 * @property {string} model - Model name (e.g., 'claude-sonnet-4-6')
 * @property {number} maxBudgetUsd - Budget cap in USD
 */

/**
 * Execute a single agent via `claude -p`.
 *
 * @param {AgentConfig} config - Agent configuration
 * @param {string} prompt - User prompt to send to the agent
 * @param {object} [options] - Additional options
 * @param {string} [options.settingSources='user,project'] - Setting sources flag
 * @param {string} [options.permissionMode='bypassPermissions'] - Permission mode
 * @returns {Promise<{code: number, stdout: string, stderr: string, durationMs: number}>}
 */
export function runAgent(config, prompt, options = {}) {
  const {
    settingSources = 'user,project',
    permissionMode = 'bypassPermissions',
  } = options;

  return new Promise((promiseResolve, reject) => {
    const personaPath = resolve(PROJECT_ROOT, config.persona);
    ensureFileExists(personaPath, `Persona file for @${config.id}`);

    const systemPrompt = readFileSync(personaPath, 'utf-8');

    const args = [
      '-p',
      '--system-prompt', systemPrompt,
      '--allowed-tools', config.allowedTools,
      '--model', config.model,
      '--max-budget-usd', String(config.maxBudgetUsd),
      '--output-format', 'json',
      '--setting-sources', settingSources,
      '--permission-mode', permissionMode,
      '--no-session-persistence',
      prompt,
    ];

    log('info', `Spawning claude -p | agent=@${config.id} model=${config.model} budget=$${config.maxBudgetUsd}`);

    const startMs = Date.now();
    const chunks = [];
    const stderrChunks = [];

    const proc = spawn('claude', args, {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    proc.stdout.on('data', (data) => chunks.push(data));
    proc.stderr.on('data', (data) => stderrChunks.push(data));

    proc.on('close', (code) => {
      const durationMs = Date.now() - startMs;
      const stdout = Buffer.concat(chunks).toString('utf-8');
      const stderr = Buffer.concat(stderrChunks).toString('utf-8');

      if (stderr.trim()) {
        log('warn', `stderr (${config.id}): ${stderr.trim().slice(0, 500)}`);
      }

      promiseResolve({ code, stdout, stderr, durationMs });
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn claude for @${config.id}: ${err.message}`));
    });
  });
}

// ---------------------------------------------------------------------------
// Output parsing
// ---------------------------------------------------------------------------

/**
 * Parse raw JSON stdout from claude -p.
 *
 * @param {string} rawStdout - Raw stdout string
 * @returns {object|null} Parsed JSON or null on failure
 */
export function parseAgentOutput(rawStdout) {
  try {
    return JSON.parse(rawStdout);
  } catch (err) {
    log('error', `Failed to parse JSON output: ${err.message}`);
    log('error', `Raw output (first 1000 chars): ${rawStdout.slice(0, 1000)}`);
    return null;
  }
}

/**
 * Extract the text response from parsed agent output.
 * Handles various output shapes from claude -p --output-format json.
 *
 * @param {object} parsed - Parsed JSON output
 * @returns {string} Extracted text response
 */
export function extractResponseText(parsed) {
  if (typeof parsed === 'string') return parsed;

  if (parsed.result && typeof parsed.result === 'string') return parsed.result;
  if (parsed.content && typeof parsed.content === 'string') return parsed.content;

  // Array of content blocks
  if (Array.isArray(parsed.content)) {
    const textBlocks = parsed.content.filter((b) => b.type === 'text');
    if (textBlocks.length > 0) return textBlocks.map((b) => b.text).join('\n');
  }

  // Messages array — look at last assistant message
  if (Array.isArray(parsed.messages)) {
    const assistantMsgs = parsed.messages.filter((m) => m.role === 'assistant');
    if (assistantMsgs.length > 0) {
      const last = assistantMsgs[assistantMsgs.length - 1];
      if (typeof last.content === 'string') return last.content;
      if (Array.isArray(last.content)) {
        return last.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      }
    }
  }

  // Fallback
  return JSON.stringify(parsed, null, 2);
}

// ---------------------------------------------------------------------------
// Tool restriction verification
// ---------------------------------------------------------------------------

/**
 * Inspect parsed output for tool usage and check against disallowed tools.
 *
 * @param {object} parsed - Parsed JSON output
 * @param {string[]} disallowedTools - List of disallowed tool names
 * @returns {{toolsUsed: string[], violations: string[]}}
 */
export function verifyToolRestrictions(parsed, disallowedTools) {
  const toolCalls = [];

  function collectToolCalls(obj) {
    if (!obj || typeof obj !== 'object') return;

    if (obj.type === 'tool_use' || obj.type === 'tool_call') {
      toolCalls.push(obj.name || obj.tool || 'unknown');
    }

    if (Array.isArray(obj)) {
      obj.forEach(collectToolCalls);
      return;
    }

    for (const val of Object.values(obj)) {
      if (val && typeof val === 'object') {
        collectToolCalls(val);
      }
    }
  }

  collectToolCalls(parsed);

  const uniqueTools = [...new Set(toolCalls)];

  const violations = uniqueTools.filter((t) =>
    disallowedTools.some((d) => t.toLowerCase().startsWith(d.toLowerCase()))
  );

  return { toolsUsed: uniqueTools, violations };
}

// ---------------------------------------------------------------------------
// Cost extraction
// ---------------------------------------------------------------------------

/**
 * Extract cost information from parsed output.
 *
 * @param {object} parsed - Parsed JSON output
 * @returns {number|null} Cost in USD or null if unavailable
 */
export function extractCost(parsed) {
  if (parsed.cost_usd !== undefined) return parsed.cost_usd;
  if (parsed.usage?.cost_usd !== undefined) return parsed.usage.cost_usd;
  if (parsed.total_cost_usd !== undefined) return parsed.total_cost_usd;

  // Estimate from token usage (Sonnet 4 pricing: ~$3/1M input, ~$15/1M output)
  if (parsed.usage) {
    const inputTokens = parsed.usage.input_tokens || 0;
    const outputTokens = parsed.usage.output_tokens || 0;
    const estimated = (inputTokens * 3 + outputTokens * 15) / 1_000_000;
    if (estimated > 0) return estimated;
  }

  return null;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/**
 * Save JSON data to a file.
 *
 * @param {string} filePath - Absolute path to save to
 * @param {object} data - Data to serialize as JSON
 */
export function saveJson(filePath, data) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  log('info', `Output saved to: ${filePath}`);
}

/**
 * Read file contents as string.
 *
 * @param {string} filePath - Absolute path to read
 * @returns {string} File contents
 */
export function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

// ---------------------------------------------------------------------------
// Decision parsing (for SDC workflow)
// ---------------------------------------------------------------------------

/**
 * Parse PO GO/NO-GO decision from agent output text.
 * Returns 'GO', 'NO-GO', or null (parse failure, treated as NO-GO).
 *
 * @param {string} text - Agent output text
 * @returns {'GO'|'NO-GO'|null}
 */
export function parseGoNoGo(text) {
  if (/\bNO.?GO\b/i.test(text)) return 'NO-GO';
  if (/\bGO\b/i.test(text)) return 'GO';
  return null;
}

/**
 * Parse QA verdict from agent output text.
 * Returns 'PASS', 'CONCERNS', 'FAIL', or null (parse failure, treated as FAIL).
 *
 * @param {string} text - Agent output text
 * @returns {'PASS'|'CONCERNS'|'FAIL'|null}
 */
export function parseQaVerdict(text) {
  if (/\bFAIL\b/i.test(text)) return 'FAIL';
  if (/\bCONCERNS\b/i.test(text)) return 'CONCERNS';
  if (/\bPASS\b/i.test(text)) return 'PASS';
  return null;
}

// ---------------------------------------------------------------------------
// Phase logging
// ---------------------------------------------------------------------------

/**
 * Log phase completion metrics.
 *
 * @param {string} phase - Phase name (e.g., 'sm', 'po')
 * @param {number} durationMs - Duration in milliseconds
 * @param {number|null} costUsd - Cost in USD or null
 */
export function logPhase(phase, durationMs, costUsd) {
  const costStr = costUsd !== null ? `cost_usd=${costUsd.toFixed(4)}` : 'cost_usd=N/A';
  log('info', `phase=${phase} duration_ms=${durationMs} ${costStr}`);
}
