#!/usr/bin/env node
'use strict';

/**
 * PreToolUse hook for Constitution Article II (Agent Authority).
 *
 * Blocks remote Git/GitHub publication commands unless the active agent is
 * @devops. Works with Claude Code, Codex, and Grok Build payloads:
 *   - Claude/Codex: tool_input.command + hookSpecificOutput.permissionDecision
 *   - Grok:         toolInput.command  + decision/reason
 *
 * Active agent resolution (first match wins):
 *   1. Env: AIOX_ACTIVE_AGENT / AIOX_AGENT / ACTIVE_AGENT / CLAUDE_* / GROK_ACTIVE_AGENT
 *   2. Command-scoped export AIOX_ACTIVE_AGENT=...
 *   3. Bridge files (Grok / UAP):
 *        .synapse/sessions/_active-agent.json  { "id": "devops" }
 *        .aiox/active-agent.json               { "id": "devops" }
 *        .aiox/active-agent                   plain text id
 *
 * Dependency-free so it runs from a freshly installed AIOX package on
 * macOS, Linux, WSL, and Windows.
 */

const fs = require('fs');
const path = require('path');

const REMOTE_OPERATION_PATTERNS = [
  {
    pattern: /\bgit\s+push\b/i,
    operation: 'git push',
  },
  {
    pattern: /\bgh\s+pr\s+create\b/i,
    operation: 'gh pr create',
  },
  {
    pattern: /\bgh\s+pr\s+merge\b/i,
    operation: 'gh pr merge',
  },
];

const DEVOPS_AGENT_ALIASES = new Set([
  'devops',
  '@devops',
  'github-devops',
  '@github-devops',
  'aiox-devops',
  '@aiox-devops',
  'gage',
]);

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function parseInput(rawInput) {
  try {
    return JSON.parse(rawInput || '{}');
  } catch {
    return null;
  }
}

function normalizeCommand(command) {
  return String(command || '')
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract shell command from Claude (snake_case) or Grok (camelCase) envelopes.
 */
function extractCommand(input) {
  if (!input || typeof input !== 'object') return '';

  const direct =
    input?.tool_input?.command ||
    input?.toolInput?.command ||
    input?.tool_input?.cmd ||
    input?.toolInput?.cmd ||
    '';

  if (direct) return direct;

  const nested =
    input?.input?.command ||
    input?.parameters?.command ||
    input?.tool_input?.input?.command ||
    input?.toolInput?.input?.command ||
    '';

  return nested || '';
}

/**
 * Project root for bridge-file lookup (Grok workspaceRoot / Claude cwd).
 */
function extractProjectRoot(input) {
  const candidates = [
    input?.workspaceRoot,
    input?.workspace_root,
    input?.cwd,
    input?.cwd_path,
    process.env.GROK_WORKSPACE_ROOT,
    process.env.CLAUDE_PROJECT_DIR,
    process.cwd(),
  ];
  return String(candidates.find(Boolean) || process.cwd());
}

function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function readJsonFile(filePath) {
  const raw = readTextFile(filePath);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Read UAP / Grok activation bridge for current agent id.
 */
function readBridgeAgent(projectRoot) {
  const root = String(projectRoot || process.cwd());

  const jsonBridges = [
    path.join(root, '.synapse', 'sessions', '_active-agent.json'),
    path.join(root, '.aiox', 'active-agent.json'),
  ];

  for (const filePath of jsonBridges) {
    const data = readJsonFile(filePath);
    const id = data?.id || data?.agentId || data?.agent_id || data?.name;
    if (id) return String(id).toLowerCase();
  }

  const plain = readTextFile(path.join(root, '.aiox', 'active-agent')).trim();
  if (plain) {
    // allow "devops" or JSON-ish single token
    const first = plain.split(/\s|\n/)[0];
    if (first) return first.toLowerCase().replace(/^@/, '');
  }

  return '';
}

function getCommandScopedAgent(command) {
  const match = String(command || '').match(
    /(?:^|\s)(?:export\s+)?(?:AIOX_ACTIVE_AGENT|AIOX_AGENT|ACTIVE_AGENT|CLAUDE_AGENT_NAME|GROK_ACTIVE_AGENT)=["']?(@?[a-z0-9-]+)["']?/i,
  );

  return match ? match[1].toLowerCase() : '';
}

function getActiveAgent(command, input = null) {
  const candidates = [
    process.env.AIOX_ACTIVE_AGENT,
    process.env.AIOX_AGENT,
    process.env.ACTIVE_AGENT,
    process.env.CLAUDE_AGENT_NAME,
    process.env.CLAUDE_CODE_AGENT,
    process.env.AIOX_CURRENT_AGENT,
    process.env.GROK_ACTIVE_AGENT,
    getCommandScopedAgent(command),
    readBridgeAgent(extractProjectRoot(input || {})),
  ];

  return String(candidates.find(Boolean) || '').toLowerCase();
}

function isDevOpsAgent(agent) {
  const normalized = String(agent || '')
    .toLowerCase()
    .replace(/^@/, '');
  return (
    DEVOPS_AGENT_ALIASES.has(normalized) ||
    DEVOPS_AGENT_ALIASES.has(`@${normalized}`) ||
    normalized === 'aiox-devops' ||
    normalized.endsWith('-devops') && normalized.includes('devops')
  );
}

function findRemoteOperation(command) {
  const normalized = normalizeCommand(command);
  return REMOTE_OPERATION_PATTERNS.find(({ pattern }) => pattern.test(normalized)) || null;
}

/**
 * Dual decision payload:
 * - Claude Code: hookSpecificOutput.permissionDecision
 * - Grok Build:  decision + reason
 */
function emitDecision(permissionDecision, permissionDecisionReason) {
  const payload = {
    decision: permissionDecision,
    reason: permissionDecisionReason,
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision,
      permissionDecisionReason,
    },
  };
  process.stdout.write(JSON.stringify(payload));
}

function main() {
  const rawInput = readStdin();
  const input = parseInput(rawInput);

  if (!input) {
    emitDecision(
      'deny',
      'Hook failed to parse PreToolUse input. Blocking remote Git operation for safety; retry via @devops.',
    );
    return;
  }

  const command = extractCommand(input);
  const operation = findRemoteOperation(command);

  if (!operation) {
    return;
  }

  const activeAgent = getActiveAgent(command, input);
  if (isDevOpsAgent(activeAgent)) {
    return;
  }

  emitDecision(
    'deny',
    `${operation.operation} is exclusive to @devops (Constitution Article II). Current agent: ${activeAgent || '@unknown'}. Activate /aiox-devops (writes .aiox/active-agent) or prefix AIOX_ACTIVE_AGENT=devops.`,
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  DEVOPS_AGENT_ALIASES,
  REMOTE_OPERATION_PATTERNS,
  extractCommand,
  extractProjectRoot,
  readBridgeAgent,
  findRemoteOperation,
  getActiveAgent,
  isDevOpsAgent,
  normalizeCommand,
};
