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
 *
 * NOTE: this hook is a governance guardrail, not a security boundary. The
 * active-agent identity comes from cooperative signals (env vars, command
 * prefix, bridge files) that any process in the workspace can set. It exists
 * to stop accidental non-devops publication, not a determined adversary.
 */

const fs = require('fs');
const path = require('path');

// Git accepts global options between `git` and the subcommand
// (`git -C /repo push`, `git -c k=v push`, `git --git-dir=/x push`), so the
// push pattern must tolerate interleaved option tokens or it is bypassable.
const GIT_GLOBAL_OPTIONS =
  '(?:-[Cc]\\s+\\S+' +
  '|--(?:git-dir|work-tree|namespace|super-prefix|config-env)(?:=\\S+|\\s+\\S+)' +
  '|--exec-path(?:=\\S+)?' +
  '|-[pP]\\b' +
  '|--(?:no-pager|paginate|bare|literal-pathspecs|glob-pathspecs' +
  '|noglob-pathspecs|icase-pathspecs|no-optional-locks|no-replace-objects' +
  '|no-lazy-fetch|no-advice))';

// Generic `-f val` / `--flag[=val]` token for `gh`, whose flags may appear
// before or after the subcommand (`gh --repo o/r pr create`, `gh pr -R o/r merge`).
const GH_OPTION = '(?:-{1,2}[\\w-]+(?:[=\\s]+\\S+)?)';

const REMOTE_OPERATION_PATTERNS = [
  {
    pattern: new RegExp(`\\bgit(?:\\s+${GIT_GLOBAL_OPTIONS})*\\s+push\\b`, 'i'),
    operation: 'git push',
  },
  {
    pattern: new RegExp(`\\bgh(?:\\s+${GH_OPTION})*\\s+pr(?:\\s+${GH_OPTION})*\\s+create\\b`, 'i'),
    operation: 'gh pr create',
  },
  {
    pattern: new RegExp(`\\bgh(?:\\s+${GH_OPTION})*\\s+pr(?:\\s+${GH_OPTION})*\\s+merge\\b`, 'i'),
    operation: 'gh pr merge',
  },
  {
    // PR creation/merge through the REST API (`gh api repos/o/r/pulls -f ...`,
    // `gh api -X PUT repos/o/r/pulls/1/merge`). Plain GET reads stay allowed.
    pattern: /\bgh\s+api\b(?=[^\n]*\/pulls\b)[^\n]*(?:\s(?:-X|--method)[=\s]*(?:POST|PUT|PATCH)\b|\s(?:-f|-F|--field|--raw-field|--input)(?:[=\s]|$))/i,
    operation: 'gh api (pull request mutation)',
  },
  {
    pattern: new RegExp(
      `\\bgh(?:\\s+${GH_OPTION})*\\s+api(?:\\s+${GH_OPTION})*\\s+graphql\\b` +
        '(?=[\\s\\S]*\\bmutation\\b)(?=[\\s\\S]*\\b(?:createPullRequest|mergePullRequest)\\s*\\()',
      'i',
    ),
    operation: 'gh api graphql (pull request mutation)',
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
 *
 * Bridges older than BRIDGE_TTL_MS are ignored: a leftover `devops` bridge
 * from an earlier session must not authorize remote Git operations later.
 */
const BRIDGE_TTL_MS = 8 * 60 * 60 * 1000;

function isBridgeFresh(filePath) {
  try {
    const ageMs = Date.now() - fs.statSync(filePath).mtimeMs;
    // Future-dated mtimes (restored files, clock skew) are as untrusted as
    // expired ones — only accept 0 <= age <= TTL.
    return ageMs >= 0 && ageMs <= BRIDGE_TTL_MS;
  } catch {
    return false;
  }
}

function readBridgeAgent(projectRoot) {
  const root = String(projectRoot || process.cwd());

  const jsonBridges = [
    path.join(root, '.synapse', 'sessions', '_active-agent.json'),
    path.join(root, '.aiox', 'active-agent.json'),
  ];

  for (const filePath of jsonBridges) {
    if (!isBridgeFresh(filePath)) continue;
    const data = readJsonFile(filePath);
    const id = data?.id || data?.agentId || data?.agent_id || data?.name;
    if (id) return String(id).toLowerCase();
  }

  const plainPath = path.join(root, '.aiox', 'active-agent');
  const plain = isBridgeFresh(plainPath) ? readTextFile(plainPath).trim() : '';
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
  // Strict allowlist only — no wildcard suffix (e.g. fake-devops).
  return (
    DEVOPS_AGENT_ALIASES.has(normalized) || DEVOPS_AGENT_ALIASES.has(`@${normalized}`)
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
  if (permissionDecision === 'deny') {
    // Both runtimes honor the JSON deny; exit 2 also provides a fail-closed
    // signal and stderr feedback when a host cannot consume the payload.
    process.stderr.write(permissionDecisionReason);
    process.exitCode = 2;
  }
}

function main() {
  const rawInput = readStdin();

  // Fail-closed on empty stdin: without a payload we cannot authorize remote
  // publication. Malformed JSON below is also fail-closed.
  if (!rawInput.trim()) {
    emitDecision(
      'deny',
      'Hook did not receive PreToolUse input. Blocking remote Git operation for safety; retry via @devops.',
    );
    return;
  }

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
