# Wave 2: Claude Agent SDK and Headless Agent Patterns

> Deep research on the Claude Agent SDK (TypeScript/Python), headless mode, MCP integration, hooks system, plugins, and production patterns for programmatic agent orchestration.

**Date:** 2026-02-09
**Sources consulted:** 18 unique URLs, 15 pages read in full
**Focus:** Programmatic agent building, CI/CD integration, production deployment

---

## TL;DR

- The **Claude Agent SDK** (renamed from "Claude Code SDK") provides the same tools, agent loop, and context management that power Claude Code, available as Python and TypeScript libraries
- The SDK uses an **async generator pattern** via `query()` -- Claude handles the entire tool execution loop autonomously
- **Headless mode** (`claude -p`) enables non-interactive operation for CI/CD, scripts, and automation; the `--agent` flag (v2.0.59+) configures the main session as a specialized agent
- **Hooks** provide deterministic lifecycle control at 14 event points, with three types: `command` (shell), `prompt` (single-turn LLM), and `agent` (multi-turn with tools)
- **MCP integration** supports stdio, HTTP/SSE, and in-process SDK servers, with automatic tool search for large tool sets
- **Plugins** package commands, agents, skills, hooks, and MCP servers for distribution across projects
- **OpenTelemetry** is the official monitoring solution, with metrics for cost, tokens, sessions, and events for tool usage and API requests
- Production patterns center on **permission sandboxing**, **cost budgets** (`maxBudgetUsd`), **session management**, and **structured outputs**

---

## 1. Claude Agent SDK Architecture

### 1.1 Core Design: query() as the Universal Entry Point

The Agent SDK's fundamental abstraction is the `query()` function, which returns an `AsyncGenerator<SDKMessage>`. Unlike the Anthropic Client SDK where you implement the tool loop yourself, the Agent SDK handles tool execution, context management, and retries autonomously.

```typescript
// Client SDK: You implement the tool loop
let response = await client.messages.create({...});
while (response.stop_reason === "tool_use") {
  const result = yourToolExecutor(response.tool_use);
  response = await client.messages.create({ tool_result: result, ... });
}

// Agent SDK: Claude handles tools autonomously
for await (const message of query({ prompt: "Fix the bug in auth.py" })) {
  console.log(message);
}
```

Source: [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)

### 1.2 Installation and Authentication

```bash
# TypeScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install claude-agent-sdk
```

Authentication supports multiple providers:
- **Anthropic API**: `ANTHROPIC_API_KEY` environment variable
- **Amazon Bedrock**: `CLAUDE_CODE_USE_BEDROCK=1` + AWS credentials
- **Google Vertex AI**: `CLAUDE_CODE_USE_VERTEX=1` + Google Cloud credentials
- **Microsoft Azure**: `CLAUDE_CODE_USE_FOUNDRY=1` + Azure credentials

Source: [Agent SDK quickstart](https://platform.claude.com/docs/en/agent-sdk/quickstart)

### 1.3 The Options Interface (Complete)

The `Options` type controls all aspects of agent behavior. Key fields:

| Property | Type | Description |
|----------|------|-------------|
| `allowedTools` | `string[]` | Allowlist of tool names |
| `disallowedTools` | `string[]` | Denylist of tool names |
| `agents` | `Record<string, AgentDefinition>` | Programmatic subagent definitions |
| `mcpServers` | `Record<string, McpServerConfig>` | MCP server configurations |
| `hooks` | `Partial<Record<HookEvent, HookCallbackMatcher[]>>` | Lifecycle hooks |
| `permissionMode` | `PermissionMode` | `'default' \| 'acceptEdits' \| 'bypassPermissions' \| 'plan'` |
| `canUseTool` | `CanUseTool` | Custom permission callback function |
| `resume` | `string` | Session ID to resume |
| `maxTurns` | `number` | Maximum conversation turns |
| `maxBudgetUsd` | `number` | Maximum budget in USD |
| `maxThinkingTokens` | `number` | Maximum tokens for extended thinking |
| `model` | `string` | Claude model to use |
| `fallbackModel` | `string` | Fallback model if primary fails |
| `systemPrompt` | `string \| { type: 'preset'; preset: 'claude_code'; append?: string }` | System prompt config |
| `settingSources` | `('user' \| 'project' \| 'local')[]` | Which filesystem settings to load |
| `outputFormat` | `{ type: 'json_schema', schema: JSONSchema }` | Structured output format |
| `plugins` | `SdkPluginConfig[]` | Plugin configurations |
| `sandbox` | `SandboxSettings` | Sandbox behavior config |
| `betas` | `SdkBeta[]` | Beta features (e.g., `'context-1m-2025-08-07'`) |
| `cwd` | `string` | Working directory |
| `env` | `Dict<string>` | Environment variables |
| `enableFileCheckpointing` | `boolean` | Track file changes for rewinding |
| `includePartialMessages` | `boolean` | Include streaming partial messages |

**Critical insight**: When `settingSources` is omitted (default), the SDK does NOT load any filesystem settings (CLAUDE.md, settings.json). You must explicitly set `settingSources: ['project']` to load project configuration.

Source: [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript)

### 1.4 AgentDefinition Interface

Subagents are defined programmatically via the `agents` option:

```typescript
type AgentDefinition = {
  description: string;  // When to use this agent (required)
  prompt: string;       // System prompt (required)
  tools?: string[];     // Allowed tools (inherits all if omitted)
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
}
```

Example with delegation:

```typescript
for await (const message of query({
  prompt: "Use the code-reviewer agent to review this codebase",
  options: {
    allowedTools: ["Read", "Glob", "Grep", "Task"],
    agents: {
      "code-reviewer": {
        description: "Expert code reviewer for quality and security reviews.",
        prompt: "Analyze code quality and suggest improvements.",
        tools: ["Read", "Glob", "Grep"]
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

Messages from within a subagent include a `parent_tool_use_id` field for tracking which messages belong to which subagent execution.

Source: [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)

### 1.5 Session Management

Sessions maintain context across multiple exchanges. The SDK supports resuming, forking, and continuing sessions:

```typescript
let sessionId: string | undefined;

// First query: capture the session ID
for await (const message of query({
  prompt: "Read the authentication module",
  options: { allowedTools: ["Read", "Glob"] }
})) {
  if (message.type === "system" && message.subtype === "init") {
    sessionId = message.session_id;
  }
}

// Resume with full context from the first query
for await (const message of query({
  prompt: "Now find all places that call it",
  options: { resume: sessionId }
})) {
  if ("result" in message) console.log(message.result);
}
```

The `forkSession: true` option creates a new session branching from the resumed one, useful for exploring different approaches without modifying the original.

Source: [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)

### 1.6 Query Object Methods

The `Query` object returned by `query()` provides runtime control:

| Method | Description |
|--------|-------------|
| `interrupt()` | Interrupts the query (streaming input mode) |
| `rewindFiles(uuid)` | Restores files to state at specific message (requires `enableFileCheckpointing`) |
| `setPermissionMode(mode)` | Changes permission mode mid-session |
| `setModel(model)` | Changes model mid-session |
| `setMaxThinkingTokens(n)` | Changes thinking token limit |
| `supportedCommands()` | Returns available slash commands |
| `supportedModels()` | Returns available models with info |
| `mcpServerStatus()` | Returns MCP server connection status |
| `accountInfo()` | Returns account information |

Source: [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript)

### 1.7 Message Types

The SDK streams these message types:

| Type | When |
|------|------|
| `SDKSystemMessage` (subtype: `init`) | Session start -- includes tools, MCP servers, model, permission mode |
| `SDKAssistantMessage` | Claude's responses and tool invocations |
| `SDKUserMessage` | User input messages |
| `SDKResultMessage` (subtype: `success`) | Successful completion with result, cost, usage stats |
| `SDKResultMessage` (subtype: `error_*`) | Failures: `error_max_turns`, `error_during_execution`, `error_max_budget_usd`, `error_max_structured_output_retries` |
| `SDKPartialAssistantMessage` | Streaming tokens (when `includePartialMessages: true`) |
| `SDKCompactBoundaryMessage` | Context compaction occurred |

The `SDKResultMessage` on success includes:

```typescript
{
  type: 'result';
  subtype: 'success';
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  result: string;
  total_cost_usd: number;
  usage: NonNullableUsage;
  modelUsage: { [modelName: string]: ModelUsage };
  permission_denials: SDKPermissionDenial[];
  structured_output?: unknown;
}
```

Source: [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript)

### 1.8 SDK vs CLI: When to Use Each

| Use case | Best choice |
|----------|-------------|
| Interactive development | CLI |
| CI/CD pipelines | SDK |
| Custom applications | SDK |
| One-off tasks | CLI |
| Production automation | SDK |

Many teams use both: CLI for daily development, SDK for production. Workflows translate directly between them.

Source: [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)

---

## 2. Headless Mode and the --agent Flag

### 2.1 Basic Headless Mode (-p flag)

The `-p` (or `--print`) flag enables non-interactive operation. All CLI options work with `-p`:

```bash
# Basic usage
claude -p "What does the auth module do?"

# With tool permissions
claude -p "Run tests and fix failures" --allowedTools "Bash,Read,Edit"

# Structured JSON output
claude -p "Summarize this project" --output-format json

# JSON with schema enforcement
claude -p "Extract function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}}}'

# Streaming JSON (real-time tokens)
claude -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages

# Custom system prompt
gh pr diff "$1" | claude -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

Source: [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)

### 2.2 Continuing Conversations

```bash
# First request
claude -p "Review this codebase for performance issues"

# Continue the most recent conversation
claude -p "Now focus on the database queries" --continue

# Or resume a specific session by ID
session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')
claude -p "Continue that review" --resume "$session_id"
```

Source: [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)

### 2.3 The --agent Flag (v2.0.59+)

The `--agent` flag configures the main Claude Code session with a custom agent's system prompt, tool restrictions, and model. It transforms your main thread into a specialized agent without spawning sub-agents.

```bash
# Run as a specific agent
claude --agent security-reviewer

# Combine with other flags
claude --agent api-designer --resume my-session

# Combine with headless mode
claude --agent code-reviewer -p "Review the latest changes"
```

**Key distinction:**
- `--agent`: Configures the entire main thread for specialized behavior
- `Task tool`: Spawns independent sub-agents while keeping a general-purpose main thread

Default agent can be set in `.claude/settings.json`:
```json
{"agent": "security-reviewer"}
```

CLI flags override the config setting for that session.

Source: [ClaudeLog: --agent flag](https://claudelog.com/faqs/what-is-agent-flag-in-claude-code/)

### 2.4 CLI-Defined Subagents (--agents flag)

Pass agent definitions as JSON when launching Claude Code for session-only agents:

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

The `--agents` flag accepts all frontmatter fields: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, and `memory`.

Source: [Create custom subagents](https://code.claude.com/docs/en/sub-agents)

### 2.5 Tool Permission in Headless Mode

```bash
# Prefix matching with trailing space+*
claude -p "Create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

The trailing ` *` (space + asterisk) enables prefix matching. `Bash(git diff *)` allows any command starting with `git diff`. The space before `*` is important -- without it, `Bash(git diff*)` would also match `git diff-index`.

**Important limitation:** `PermissionRequest` hooks do not fire in non-interactive mode (`-p`). Use `PreToolUse` hooks for automated permission decisions instead.

Source: [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)

### 2.6 Piping Data

```bash
# Pipe data into Claude
cat error.log | claude -p "Summarize the key errors in this log file"

# Extract specific fields with jq
claude -p "Summarize this project" --output-format json | jq -r '.result'

# Stream only text deltas
claude -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

Source: [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)

---

## 3. MCP (Model Context Protocol) Integration

### 3.1 Transport Types

| Transport | When to use | Config |
|-----------|-------------|--------|
| **stdio** | Local processes (npx, python commands) | `{ command: "npx", args: [...] }` |
| **HTTP** | Remote cloud servers (non-streaming) | `{ type: "http", url: "..." }` |
| **SSE** | Remote cloud servers (streaming) | `{ type: "sse", url: "..." }` |
| **SDK** | In-process custom tools | `{ type: "sdk", name: "...", instance: McpServer }` |

### 3.2 Configuring MCP Servers in the SDK

```typescript
// In code
for await (const message of query({
  prompt: "List the 3 most recent issues in anthropics/claude-code",
  options: {
    mcpServers: {
      "github": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
      }
    },
    allowedTools: ["mcp__github__list_issues"]
  }
})) { ... }
```

MCP tools require explicit permission. Tool naming convention: `mcp__<server-name>__<tool-name>`. Wildcards supported: `mcp__github__*`.

### 3.3 In-Process SDK MCP Servers

Create custom tools that run in your application process:

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const analyzeComplexity = tool(
  "analyze_complexity",
  "Analyzes code complexity of a file",
  { filePath: z.string() },
  async (args) => ({
    content: [{ type: "text", text: `Complexity analysis for ${args.filePath}...` }]
  })
);

const myServer = createSdkMcpServer({
  name: "code-tools",
  tools: [analyzeComplexity]
});

for await (const message of query({
  prompt: "Analyze the complexity of auth.py",
  options: {
    mcpServers: { "code-tools": myServer },
    allowedTools: ["mcp__code-tools__*"]
  }
})) { ... }
```

Source: [Connect to external tools with MCP](https://platform.claude.com/docs/en/agent-sdk/mcp)

### 3.4 MCP Tool Search (Auto-Discovery)

When MCP tool descriptions consume >10% of the context window, tool search activates automatically. Tools are deferred (`defer_loading: true`) and discovered on-demand via a search tool.

Configure via environment variable:

| Value | Behavior |
|-------|----------|
| `auto` | Activates at 10% threshold (default) |
| `auto:5` | Activates at 5% threshold |
| `true` | Always enabled |
| `false` | Disabled, all tools loaded upfront |

```typescript
options: {
  mcpServers: { ... },
  env: { ENABLE_TOOL_SEARCH: "auto:5" }
}
```

Requires models supporting `tool_reference` blocks: Sonnet 4+ or Opus 4+. Haiku does not support tool search.

Source: [Connect to external tools with MCP](https://platform.claude.com/docs/en/agent-sdk/mcp)

### 3.5 .mcp.json Configuration File

MCP servers can be configured via file instead of code:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
    }
  }
}
```

`${VAR}` syntax expands environment variables at runtime.

Source: [Connect to external tools with MCP](https://platform.claude.com/docs/en/agent-sdk/mcp)

### 3.6 Agent-Specific MCP in Subagent Frontmatter

Subagents can reference already-configured MCP servers or define inline:

```yaml
---
name: github-agent
description: Manages GitHub issues and PRs
mcpServers:
  slack: {}  # References existing server
  custom-api:
    type: http
    url: https://api.example.com/mcp
    headers:
      Authorization: "Bearer ${API_TOKEN}"
---
```

Source: [Create custom subagents](https://code.claude.com/docs/en/sub-agents)

---

## 4. Hooks System for Agent Lifecycle

### 4.1 Hook Events (Complete List)

The hooks system provides 14 lifecycle events:

| Event | When it fires | Matcher input |
|-------|--------------|---------------|
| `SessionStart` | Session begins/resumes | How started: `startup`, `resume`, `clear`, `compact` |
| `UserPromptSubmit` | User submits a prompt | No matcher support |
| `PreToolUse` | Before tool executes (can block/modify) | Tool name |
| `PermissionRequest` | Permission dialog appears | Tool name |
| `PostToolUse` | After tool succeeds | Tool name |
| `PostToolUseFailure` | After tool fails | Tool name |
| `Notification` | Status notification | Notification type |
| `SubagentStart` | Subagent spawned | Agent type name |
| `SubagentStop` | Subagent finishes | Agent type name |
| `Stop` | Claude finishes responding | No matcher |
| `TeammateIdle` | Agent team member about to go idle | No matcher |
| `TaskCompleted` | Task being marked complete | No matcher |
| `PreCompact` | Before context compaction | `manual` or `auto` |
| `SessionEnd` | Session terminates | Exit reason |

Source: [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

### 4.2 Three Hook Types

| Type | How it works | Use case |
|------|-------------|----------|
| `command` | Runs a shell command | Formatting, validation, logging |
| `prompt` | Single-turn LLM evaluation (Haiku default) | Judgment-based decisions |
| `agent` | Multi-turn subagent with tool access | Verification requiring file inspection |

#### Command hooks (most common):
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

#### Prompt hooks (judgment-based):
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains\"}."
      }]
    }]
  }
}
```

#### Agent hooks (tool-using verification):
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "agent",
        "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
        "timeout": 120
      }]
    }]
  }
}
```

Source: [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

### 4.3 Hook Communication Protocol

Hooks communicate via stdin (JSON input), stdout (JSON output), stderr (error messages), and exit codes:

| Exit Code | Behavior |
|-----------|----------|
| **0** | Allow the action. For `UserPromptSubmit`/`SessionStart`, stdout added to context |
| **2** | Block the action. stderr becomes Claude's feedback |
| **Other** | Allow but log stderr. Toggle verbose mode (Ctrl+O) to see |

For structured control, exit 0 with JSON output:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

Permission decisions: `"allow"` (auto-approve), `"deny"` (block + reason), `"ask"` (show permission prompt).

Source: [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

### 4.4 SDK Hooks (Programmatic)

In the SDK, hooks are callback functions instead of shell commands:

```typescript
import { query, HookCallback, PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

const protectEnvFiles: HookCallback = async (input, toolUseID, { signal }) => {
  const preInput = input as PreToolUseHookInput;
  const filePath = preInput.tool_input?.file_path as string;
  const fileName = filePath?.split('/').pop();

  if (fileName === '.env') {
    return {
      hookSpecificOutput: {
        hookEventName: input.hook_event_name,
        permissionDecision: 'deny',
        permissionDecisionReason: 'Cannot modify .env files'
      }
    };
  }
  return {};
};

for await (const message of query({
  prompt: "Update the database configuration",
  options: {
    hooks: {
      PreToolUse: [{ matcher: 'Write|Edit', hooks: [protectEnvFiles] }]
    }
  }
})) { ... }
```

**SDK-only hook events** (not available in Python SDK): `PostToolUseFailure`, `PermissionRequest`, `SessionStart`, `SessionEnd`, `Notification`, `SubagentStart`.

Source: [Intercept and control agent behavior with hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)

### 4.5 PreToolUse Input Modification (v2.0.10+)

Starting in v2.0.10, hooks can modify tool inputs before execution:

```typescript
const redirectToSandbox: HookCallback = async (input) => {
  const preInput = input as PreToolUseHookInput;
  if (preInput.tool_name === 'Write') {
    const originalPath = preInput.tool_input.file_path as string;
    return {
      hookSpecificOutput: {
        hookEventName: input.hook_event_name,
        permissionDecision: 'allow',
        updatedInput: {
          ...preInput.tool_input,
          file_path: `/sandbox${originalPath}`
        }
      }
    };
  }
  return {};
};
```

`updatedInput` requires `permissionDecision: 'allow'` to take effect.

Source: [Intercept and control agent behavior with hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)

### 4.6 Hook Scoping

| Location | Scope |
|----------|-------|
| `~/.claude/settings.json` | All projects (user-level) |
| `.claude/settings.json` | Single project (version controlled) |
| `.claude/settings.local.json` | Single project (gitignored) |
| Managed policy settings | Organization-wide |
| Plugin `hooks/hooks.json` | When plugin enabled |
| Skill/agent frontmatter | While skill/agent active |

Hooks added via `/hooks` menu take effect immediately. Manual file edits require session restart.

Source: [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

### 4.7 Subagent-Scoped Hooks

Define hooks in subagent frontmatter that only run while that subagent is active:

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

`Stop` hooks in subagent frontmatter are automatically converted to `SubagentStop` events.

Project-level hooks can also respond to subagent lifecycle:

```json
{
  "hooks": {
    "SubagentStart": [{
      "matcher": "db-agent",
      "hooks": [{ "type": "command", "command": "./scripts/setup-db-connection.sh" }]
    }],
    "SubagentStop": [{
      "hooks": [{ "type": "command", "command": "./scripts/cleanup-db-connection.sh" }]
    }]
  }
}
```

Source: [Create custom subagents](https://code.claude.com/docs/en/sub-agents)

---

## 5. Plugins System

### 5.1 Plugin Structure

```
my-plugin/
  .claude-plugin/
    plugin.json          # Required: plugin manifest
  commands/              # Custom slash commands
    custom-cmd.md
  agents/                # Custom agents
    specialist.md
  skills/                # Agent Skills
    my-skill/
      SKILL.md
  hooks/                 # Event handlers
    hooks.json
  .mcp.json              # MCP server definitions
```

### 5.2 Loading Plugins in the SDK

```typescript
for await (const message of query({
  prompt: "Hello",
  options: {
    plugins: [
      { type: "local", path: "./my-plugin" },
      { type: "local", path: "/absolute/path/to/another-plugin" }
    ]
  }
})) { ... }
```

Commands from plugins are automatically namespaced: `plugin-name:command-name`.

### 5.3 Verifying Plugin Installation

```typescript
for await (const message of query({
  prompt: "Hello",
  options: { plugins: [{ type: "local", path: "./my-plugin" }] }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Plugins:", message.plugins);
    console.log("Commands:", message.slash_commands);
  }
}
```

Source: [Plugins in the SDK](https://platform.claude.com/docs/en/agent-sdk/plugins)

---

## 6. GitHub Actions Integration

### 6.1 Basic Workflow

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

This responds to `@claude` mentions in comments automatically.

### 6.2 With Skills and Custom Prompts

```yaml
# Skills-based code review
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "/review"
    claude_args: "--max-turns 5"

# Custom automation
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Generate a summary of yesterday's commits and open issues"
    claude_args: "--model opus"
```

### 6.3 Action Parameters (v1)

| Parameter | Description | Required |
|-----------|-------------|----------|
| `prompt` | Instructions (text or skill like `/review`) | No |
| `claude_args` | CLI arguments passed to Claude Code | No |
| `anthropic_api_key` | Claude API key | Yes (for direct API) |
| `github_token` | GitHub token for API access | No |
| `trigger_phrase` | Custom trigger (default: `@claude`) | No |
| `use_bedrock` | Use AWS Bedrock | No |
| `use_vertex` | Use Google Vertex AI | No |

### 6.4 Enterprise: AWS Bedrock and Google Vertex AI

Both cloud providers are supported with OIDC authentication (no stored credentials):

```yaml
# AWS Bedrock
- name: Configure AWS Credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-west-2

- uses: anthropics/claude-code-action@v1
  with:
    github_token: ${{ steps.app-token.outputs.token }}
    use_bedrock: "true"
    claude_args: '--model us.anthropic.claude-sonnet-4-5-20250929-v1:0'

# Google Vertex AI
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
    service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

- uses: anthropics/claude-code-action@v1
  with:
    github_token: ${{ steps.app-token.outputs.token }}
    use_vertex: "true"
    claude_args: '--model claude-sonnet-4@20250514'
```

Source: [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)

---

## 7. Production Patterns

### 7.1 Monitoring with OpenTelemetry

Claude Code supports OpenTelemetry out of the box. Enable with:

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

**Available Metrics:**

| Metric | Unit | Description |
|--------|------|-------------|
| `claude_code.session.count` | count | Sessions started |
| `claude_code.lines_of_code.count` | count | Lines modified (by `type`: added/removed) |
| `claude_code.pull_request.count` | count | PRs created |
| `claude_code.commit.count` | count | Commits created |
| `claude_code.cost.usage` | USD | Session cost (by `model`) |
| `claude_code.token.usage` | tokens | Tokens used (by `type`: input/output/cacheRead/cacheCreation and `model`) |
| `claude_code.code_edit_tool.decision` | count | Edit permission decisions (by `tool`, `decision`, `language`) |
| `claude_code.active_time.total` | seconds | Active time |

**Available Events:**

| Event | Attributes |
|-------|------------|
| `claude_code.user_prompt` | prompt_length, prompt (opt-in) |
| `claude_code.tool_result` | tool_name, success, duration_ms, decision, source |
| `claude_code.api_request` | model, cost_usd, duration_ms, input/output/cache tokens |
| `claude_code.api_error` | model, error, status_code, attempt |
| `claude_code.tool_decision` | tool_name, decision, source |

**Multi-team support:**
```bash
export OTEL_RESOURCE_ATTRIBUTES="department=engineering,team.id=platform,cost_center=eng-123"
```

Source: [Monitoring](https://code.claude.com/docs/en/monitoring-usage)

### 7.2 Cost Management Strategies

**SDK-level budget control:**
```typescript
options: {
  maxBudgetUsd: 5.00,  // Hard limit per query
  maxTurns: 10,        // Limit conversation turns
}
```

**Model routing for cost optimization:**
- Use `haiku` for subagents doing read-only exploration (fast, cheap)
- Use `sonnet` for general tasks (balanced)
- Use `opus` for complex analysis requiring deep reasoning
- Use `fallbackModel` for graceful degradation

**Batch API (50% discount):**
For non-time-sensitive workloads, the Anthropic Batch API processes requests asynchronously within 24 hours at half the cost. Useful for:
- Content generation at scale
- Data processing pipelines
- Model evaluation

Source: [Monitoring](https://code.claude.com/docs/en/monitoring-usage), [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)

### 7.3 Sandbox Configuration

The SDK supports sandboxing for command execution:

```typescript
options: {
  sandbox: {
    enabled: true,
    autoAllowBashIfSandboxed: true,
    excludedCommands: ['docker'],  // Always bypass sandbox
    allowUnsandboxedCommands: false,
    network: {
      allowLocalBinding: true,
      allowUnixSockets: ['/var/run/docker.sock']
    }
  }
}
```

When `allowUnsandboxedCommands: true`, the model can request `dangerouslyDisableSandbox: true` in tool input, which falls back to the `canUseTool` permission handler for custom authorization logic.

**Warning:** Combining `permissionMode: 'bypassPermissions'` with `allowUnsandboxedCommands: true` allows the model to escape sandbox isolation silently.

Source: [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript)

### 7.4 Structured Outputs

Force agent results to conform to a JSON Schema:

```typescript
for await (const message of query({
  prompt: "Review auth.py for security vulnerabilities",
  options: {
    outputFormat: {
      type: 'json_schema',
      schema: {
        type: 'object',
        properties: {
          vulnerabilities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                description: { type: 'string' },
                file: { type: 'string' },
                line: { type: 'number' }
              },
              required: ['severity', 'description', 'file']
            }
          }
        },
        required: ['vulnerabilities']
      }
    }
  }
})) {
  if (message.type === 'result' && message.subtype === 'success') {
    const output = message.structured_output;
    // output conforms to schema
  }
}
```

CLI equivalent:
```bash
claude -p "Extract function names" --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}}}'
```

Source: [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript)

### 7.5 Custom Permission Handlers

For production systems requiring fine-grained authorization:

```typescript
const canUseTool: CanUseTool = async (toolName, input, { signal, suggestions }) => {
  // Check against your authorization system
  if (toolName === "Bash" && input.command?.includes("rm")) {
    return {
      behavior: 'deny',
      message: 'Destructive commands require admin approval',
      interrupt: true  // Stop the agent
    };
  }

  // Modify inputs before execution
  if (toolName === "Write" && !input.file_path?.startsWith('/sandbox/')) {
    return {
      behavior: 'allow',
      updatedInput: { ...input, file_path: `/sandbox${input.file_path}` },
      updatedPermissions: suggestions || []
    };
  }

  return { behavior: 'allow', updatedInput: input };
};

for await (const message of query({
  prompt: "Deploy the application",
  options: { canUseTool, permissionMode: 'default' }
})) { ... }
```

Source: [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript)

### 7.6 Observability Ecosystem

Multiple observability platforms support Claude Code:

| Platform | Integration Method | Strengths |
|----------|-------------------|-----------|
| **Datadog** AI Agents Console | Native integration | Usage, adoption, cost, ROI tracking |
| **Grafana** + OpenTelemetry | OTLP export | Custom dashboards, alerting |
| **Arize Dev-Agent-Lens** | LiteLLM proxy + OpenInference | Tracing, span-level analysis |
| **SigNoz** + OpenTelemetry | OTLP export | Open-source, self-hosted |
| **Faros AI** | Developer productivity | ROI measurement, Linear integration |
| **claude-code-otel** | Docker Compose stack | Self-hosted Prometheus + Grafana |

Source: [Datadog Claude Code monitoring](https://www.datadoghq.com/blog/claude-code-monitoring/), [SigNoz blog](https://signoz.io/blog/claude-code-monitoring-with-opentelemetry/)

---

## 8. Subagent Architecture (File-Based)

### 8.1 Frontmatter Fields (Complete Reference)

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase + hyphens) |
| `description` | Yes | When Claude should delegate to this agent |
| `tools` | No | Allowed tools (inherits all if omitted) |
| `disallowedTools` | No | Tools to deny |
| `model` | No | `sonnet`, `opus`, `haiku`, or `inherit` (default) |
| `permissionMode` | No | `default`, `acceptEdits`, `delegate`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | Max agentic turns |
| `skills` | No | Skills to preload into context |
| `mcpServers` | No | MCP server configurations |
| `hooks` | No | Lifecycle hooks scoped to this agent |
| `memory` | No | Persistent memory: `user`, `project`, or `local` |

### 8.2 Persistent Agent Memory

```yaml
---
name: code-reviewer
description: Reviews code for quality
memory: user
---
```

| Scope | Location | Use when |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Cross-project learnings |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, version controlled |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, gitignored |

When enabled:
- System prompt includes instructions for reading/writing memory
- First 200 lines of `MEMORY.md` auto-loaded
- Read, Write, Edit tools auto-enabled for memory management

### 8.3 Restricting Subagent Spawning

Use `Task(agent_type)` syntax in the `tools` field to control which subagents can be spawned:

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Task(worker, researcher), Read, Bash
---
```

Only `worker` and `researcher` can be spawned. This restriction only applies to agents running as the main thread with `--agent`.

### 8.4 Built-in Subagents

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **Explore** | Haiku | Read-only | Fast codebase search/analysis |
| **Plan** | Inherit | Read-only | Research for plan mode |
| **general-purpose** | Inherit | All | Complex multi-step tasks |
| **Bash** | Inherit | Bash | Terminal commands in separate context |
| **Claude Code Guide** | Haiku | Read-only | Questions about Claude Code features |

### 8.5 Background vs Foreground Subagents

- **Foreground**: Block main conversation. Permission prompts pass through.
- **Background**: Run concurrently. Pre-approve permissions before launch. Auto-deny unapproved. MCP tools unavailable.

Press `Ctrl+B` to background a running task. Set `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` to disable.

Source: [Create custom subagents](https://code.claude.com/docs/en/sub-agents)

---

## 9. Agent Loop Design Philosophy

Anthropic's engineering blog describes the agent loop as a feedback cycle:

> **Gather context --> Take action --> Verify work --> Repeat**

### 9.1 Context Engineering Principles

1. **File system as context infrastructure** -- agents query using bash, grep, glob rather than pre-indexed embeddings
2. **Subagents for context isolation** -- each maintains a separate context window, returning only relevant summaries
3. **Context compaction** -- auto-summarizes when approaching limits (triggers at ~95% capacity by default, configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
4. **MCP for on-demand tool loading** -- tool search defers loading until needed

### 9.2 Tool Design Principles

- Tools are prominently featured in context, making them primary decision points
- Should represent frequent, high-level actions
- More context-efficient than generic "do anything" approaches
- Bash provides a flexible general-purpose execution layer for anything tools don't cover

### 9.3 Verification Patterns

| Pattern | How it works | Best for |
|---------|-------------|----------|
| **Rules-based feedback** | Code linting, type checking, test runners | Objective validation |
| **Visual feedback** | Screenshots via Playwright MCP | UI generation |
| **LLM-as-Judge** | Secondary model evaluates output | Fuzzy quality criteria |

Source: [Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)

---

## 10. Real-World Production Examples

### 10.1 Anthropic Internal Usage

Anthropic uses the Agent SDK internally for "deep research, video creation, note-taking, and almost all major agent loops," indicating production viability beyond coding.

Source: [Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)

### 10.2 Apple Xcode Integration

Xcode 26.3 introduces native integration with the Claude Agent SDK, providing Claude Code capabilities directly in Xcode including subagents, background tasks, and plugins.

Source: [Apple Xcode Claude Agent SDK](https://www.anthropic.com/news/apple-xcode-claude-agent-sdk)

### 10.3 Multi-Agent Documentation Pipeline

Rick Hightower documented a 7-agent documentation pipeline built with the SDK: agents handling diagram extraction, image generation, and document compilation with centralized orchestration.

Source: [PromptLayer blog](https://blog.promptlayer.com/building-agents-with-claude-codes-sdk/)

### 10.4 CI/CD Agent Pipeline Pattern

```yaml
# GitHub Actions: PR review + fix pipeline
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/review"
          claude_args: "--max-turns 5 --model claude-sonnet-4-5-20250929"
```

### 10.5 Community Tools

| Tool | Purpose |
|------|---------|
| [claude-code-otel](https://github.com/ColeMurray/claude-code-otel) | Self-hosted monitoring with Docker Compose |
| [Dev-Agent-Lens](https://arize.com/blog/claude-code-observability-and-tracing-introducing-dev-agent-lens/) | Observability proxy with OpenInference tracing |
| [claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) | Hook patterns and examples |
| [claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) | Real-time monitoring via hooks |
| [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Curated list of skills, hooks, plugins |
| [awesome-claude-plugins](https://github.com/ComposioHQ/awesome-claude-plugins) | Plugin directory |

---

## Sources

- [Agent SDK overview - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Agent SDK TypeScript reference - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Agent SDK quickstart - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/quickstart)
- [Run Claude Code programmatically (Headless) - code.claude.com](https://code.claude.com/docs/en/headless)
- [Automate workflows with hooks - code.claude.com](https://code.claude.com/docs/en/hooks-guide)
- [Intercept and control agent behavior with hooks (SDK) - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Claude Code GitHub Actions - code.claude.com](https://code.claude.com/docs/en/github-actions)
- [Connect to external tools with MCP (SDK) - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/mcp)
- [Create custom subagents - code.claude.com](https://code.claude.com/docs/en/sub-agents)
- [Monitoring - code.claude.com](https://code.claude.com/docs/en/monitoring-usage)
- [Plugins in the SDK - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/plugins)
- [Building agents with the Claude Agent SDK - claude.com/blog](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)
- [ClaudeLog: --agent flag](https://claudelog.com/faqs/what-is-agent-flag-in-claude-code/)
- [PromptLayer: Building Agents with Claude Code's SDK](https://blog.promptlayer.com/building-agents-with-claude-codes-sdk/)
- [Nader Dabit: Complete Guide to Building Agents](https://nader.substack.com/p/the-complete-guide-to-building-agents)
- [Datadog: Claude Code Monitoring](https://www.datadoghq.com/blog/claude-code-monitoring/)
- [SigNoz: Claude Code with OpenTelemetry](https://signoz.io/blog/claude-code-monitoring-with-opentelemetry/)
- [Arize: Dev-Agent-Lens](https://arize.com/blog/claude-code-observability-and-tracing-introducing-dev-agent-lens/)

---

## Gaps / Areas for Further Research

1. **V2 TypeScript interface preview** -- A new `send()`/`receive()` pattern is in preview but documentation is limited
2. **Python SDK parity** -- The Python SDK lacks several hook events available in TypeScript (SessionStart/End, Notification, PostToolUseFailure, etc.)
3. **Agent Teams + SDK integration** -- How Agent Teams (experimental) interact with SDK-defined agents needs more documentation
4. **Streaming input mode** -- The `prompt: AsyncIterable<SDKUserMessage>` pattern for multi-turn programmatic conversations needs deeper examples
5. **File checkpointing** -- The `rewindFiles()` method for undoing agent actions is documented but lacks production usage patterns
6. **Plugin marketplace** -- The `~/.claude/plugins/` ecosystem for CLI-installed plugins is emerging but not fully documented
7. **Cost optimization benchmarks** -- Real-world cost data for different agent configurations (model routing, caching, maxTurns) is scarce
8. **Sandbox escape patterns** -- The interaction between `allowUnsandboxedCommands`, `canUseTool`, and `bypassPermissions` needs security auditing guidance
