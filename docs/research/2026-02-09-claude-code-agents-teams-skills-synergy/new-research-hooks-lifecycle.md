# Deep Research: Claude Code Hooks Lifecycle System

> Complete reference for Claude Code's hook events, matchers, decision control, scoping, and integration with agents, skills, teams, and MCP.

**Date:** 2026-02-09
**Sources consulted:** 20+
**Pages deep-read:** 14

---

## TL;DR

- Claude Code provides **14 hook events** spanning the entire lifecycle: SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, Notification, SubagentStart, SubagentStop, Stop, TeammateIdle, TaskCompleted, PreCompact, SessionEnd.
- Hooks come in **3 types**: command (shell scripts), prompt (single-turn LLM evaluation), and agent (multi-turn subagent with tool access).
- Hooks can be scoped to **6 locations**: user global, project, project-local, managed policy, plugin, and skill/agent frontmatter.
- **Skill-scoped hooks** (via frontmatter) are active only while the skill runs and auto-cleanup on finish. The `once: true` field makes a hook fire only once per session (skills only, not agents).
- **TeammateIdle** and **TaskCompleted** are team-specific hooks that enforce quality gates before teammates idle or tasks close.
- Decision control varies by event: PreToolUse uses `hookSpecificOutput.permissionDecision` (allow/deny/ask); PostToolUse/Stop use top-level `decision: "block"`; TeammateIdle/TaskCompleted use exit code 2 only.
- **Async hooks** (`async: true`) run in background without blocking; results delivered on next conversation turn.
- **MCP tools** are matched with the pattern `mcp__<server>__<tool>` in matchers.
- Command hooks add **milliseconds of overhead**; prompt/agent hooks add seconds (LLM call). Use `timeout` to cap.
- **PreToolUse** can **modify tool input** before execution via `updatedInput`, enabling input sanitization, path redirection, and credential injection.
- **Hooks snapshot at startup**: mid-session edits to settings files require review in `/hooks` menu before taking effect (security measure).
- **PermissionRequest** hooks can auto-approve, deny, or modify permissions -- but do NOT fire in headless/non-interactive mode (`-p`). Use PreToolUse instead.

---

## Table of Contents

1. [Complete Event Reference](#1-complete-event-reference)
2. [Hook Types: Command, Prompt, Agent](#2-hook-types-command-prompt-agent)
3. [Configuration and Scoping](#3-configuration-and-scoping)
4. [Matchers and Filtering](#4-matchers-and-filtering)
5. [Decision Control Patterns](#5-decision-control-patterns)
6. [Hooks in Skills and Agents (Frontmatter)](#6-hooks-in-skills-and-agents-frontmatter)
7. [Hooks and Agent Teams](#7-hooks-and-agent-teams)
8. [Hooks and MCP Servers](#8-hooks-and-mcp-servers)
9. [Quality Gates Pattern](#9-quality-gates-pattern)
10. [Agent Coordination via Hooks](#10-agent-coordination-via-hooks)
11. [Performance Impact](#11-performance-impact)
12. [Comparison: Claude Code Hooks vs Git Hooks vs GitHub Actions](#12-comparison-claude-code-hooks-vs-git-hooks-vs-github-actions)
13. [Production Cases and Community Patterns](#13-production-cases-and-community-patterns)
14. [Anti-Patterns and Pitfalls](#14-anti-patterns-and-pitfalls)
15. [Recommendations for MMOS](#15-recommendations-for-mmos)

---

## 1. Complete Event Reference

### Full Lifecycle Order

```
SessionStart
  |
  v
UserPromptSubmit
  |
  v
[Agentic Loop Begins]
  |
  +---> PreToolUse --------> [Tool Executes] --------> PostToolUse
  |         |                                              |
  |   (PermissionRequest                          (PostToolUseFailure
  |    if permission needed)                       if tool fails)
  |
  +---> SubagentStart ---> [Subagent works] ---> SubagentStop
  |
  +---> Notification (when Claude needs attention)
  |
  +---> TeammateIdle (agent teams: teammate about to idle)
  |
  +---> TaskCompleted (task being marked complete)
  |
  v
[Agentic Loop Ends]
  |
  v
Stop
  |
  v
PreCompact (if context full)
  |
  v
SessionEnd
```

### Event Summary Table

| Event | When | Matcher Field | Can Block? | Stdin Fields (beyond common) |
|-------|------|---------------|------------|------------------------------|
| **SessionStart** | Session begins/resumes | `source` (startup, resume, clear, compact) | No | `source`, `model`, `agent_type?` |
| **UserPromptSubmit** | User submits prompt | None (always fires) | Yes | `prompt` |
| **PreToolUse** | Before tool executes | `tool_name` | Yes (deny/ask) | `tool_name`, `tool_input`, `tool_use_id` |
| **PermissionRequest** | Permission dialog shown | `tool_name` | Yes | `tool_name`, `tool_input`, `permission_suggestions` |
| **PostToolUse** | After tool succeeds | `tool_name` | No (feedback only) | `tool_name`, `tool_input`, `tool_response`, `tool_use_id` |
| **PostToolUseFailure** | After tool fails | `tool_name` | No (feedback only) | `tool_name`, `tool_input`, `error`, `is_interrupt`, `tool_use_id` |
| **Notification** | Claude sends notification | `notification_type` (permission_prompt, idle_prompt, auth_success, elicitation_dialog) | No | `message`, `title?`, `notification_type` |
| **SubagentStart** | Subagent spawned | `agent_type` | No (context inject only) | `agent_id`, `agent_type` |
| **SubagentStop** | Subagent finishes | `agent_type` | Yes | `agent_id`, `agent_type`, `agent_transcript_path`, `stop_hook_active` |
| **Stop** | Main agent finishes | None (always fires) | Yes | `stop_hook_active` |
| **TeammateIdle** | Teammate about to idle | None (always fires) | Yes (exit 2) | `teammate_name`, `team_name` |
| **TaskCompleted** | Task being marked done | None (always fires) | Yes (exit 2) | `task_id`, `task_subject`, `task_description?`, `teammate_name?`, `team_name?` |
| **PreCompact** | Before context compaction | `trigger` (manual, auto) | No | `trigger`, `custom_instructions` |
| **SessionEnd** | Session terminates | `reason` (clear, logout, prompt_input_exit, bypass_permissions_disabled, other) | No | `reason` |

### Common Input Fields (All Events)

Every hook receives these via stdin JSON:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default|plan|acceptEdits|dontAsk|bypassPermissions",
  "hook_event_name": "PreToolUse"
}
```

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)

---

## 2. Hook Types: Command, Prompt, Agent

### Type Comparison

| Type | How It Works | Blocking? | Default Timeout | Cost | Use When |
|------|-------------|-----------|-----------------|------|----------|
| **command** | Runs shell command | Yes | 600s (10 min) | Free (local compute) | Deterministic validation, formatting, logging |
| **prompt** | Single-turn LLM call | Yes | 30s | LLM tokens | Semantic judgment on hook input data |
| **agent** | Multi-turn subagent with tools | Yes | 60s | LLM tokens + tools | Verification requiring file inspection, test execution |

### Command Hook

```json
{
  "type": "command",
  "command": ".claude/hooks/validate.sh",
  "timeout": 30,
  "async": false,
  "statusMessage": "Running validation..."
}
```

Key fields:
- `command` (required): shell command to execute
- `async`: if `true`, runs in background without blocking (results on next turn)
- `statusMessage`: custom spinner text during execution

### Prompt Hook

```json
{
  "type": "prompt",
  "prompt": "Evaluate if all tasks are complete: $ARGUMENTS. Respond with {\"ok\": true} or {\"ok\": false, \"reason\": \"...\"}",
  "model": "haiku",
  "timeout": 30
}
```

The LLM must respond with `{"ok": true|false, "reason": "..."}`. Used when deterministic rules cannot capture the decision (e.g., "are all user requirements satisfied?").

### Agent Hook

```json
{
  "type": "agent",
  "prompt": "Verify all unit tests pass. Run the test suite and check results. $ARGUMENTS",
  "model": "sonnet",
  "timeout": 120
}
```

Agent hooks spawn a subagent with access to Read, Grep, Glob, and Bash tools. Up to 50 tool-use turns. Same response format as prompt hooks.

**Critical distinction:** Prompt hooks evaluate the hook *input data* only. Agent hooks can inspect the *actual state* of the codebase (files, test results, etc.).

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks), [Hooks Guide - code.claude.com](https://code.claude.com/docs/en/hooks-guide)

---

## 3. Configuration and Scoping

### 6 Hook Locations (Priority Order)

| # | Location | Scope | Shareable? | Notes |
|---|----------|-------|------------|-------|
| 1 | Skill/Agent frontmatter | While component active | Yes | Auto-cleanup on finish |
| 2 | Plugin `hooks/hooks.json` | When plugin enabled | Yes | Read-only in `/hooks` menu |
| 3 | `.claude/settings.local.json` | Single project | No (gitignored) | Personal overrides |
| 4 | `.claude/settings.json` | Single project | Yes (committed) | Team standards |
| 5 | `~/.claude/settings.json` | All your projects | No (local machine) | Personal defaults |
| 6 | Managed policy settings | Organization-wide | Yes (admin-controlled) | Enterprise lockdown |

When multiple hooks match, ALL matching hooks run **in parallel**. Identical handlers are deduplicated automatically.

### Configuration Format

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "regex_pattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-script.sh",
            "timeout": 60,
            "async": false,
            "statusMessage": "Custom spinner text",
            "once": false
          }
        ]
      }
    ]
  }
}
```

### Security: Snapshot at Startup

Hooks are captured at session startup. Direct edits to settings files during a session require review in the `/hooks` menu before taking effect. This prevents malicious mid-session hook injection.

Enterprise admins can set `allowManagedHooksOnly` to block user, project, and plugin hooks entirely.

### Environment Variables

- `$CLAUDE_PROJECT_DIR`: project root (use for portable script paths)
- `${CLAUDE_PLUGIN_ROOT}`: plugin root directory
- `$CLAUDE_ENV_FILE`: file path for persisting env vars (SessionStart only)
- `$CLAUDE_CODE_REMOTE`: `"true"` in remote web environments

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)

---

## 4. Matchers and Filtering

### Matcher Behavior by Event

| Events | Matcher Tests Against | Example Values |
|--------|----------------------|----------------|
| PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest | `tool_name` | `Bash`, `Edit\|Write`, `mcp__memory__.*` |
| SessionStart | `source` | `startup`, `resume`, `clear`, `compact` |
| SessionEnd | `reason` | `clear`, `logout`, `other` |
| Notification | `notification_type` | `permission_prompt`, `idle_prompt` |
| SubagentStart, SubagentStop | `agent_type` | `Bash`, `Explore`, `Plan`, custom agent names |
| PreCompact | `trigger` | `manual`, `auto` |
| UserPromptSubmit, Stop, TeammateIdle, TaskCompleted | **No matcher support** | Always fires on every occurrence |

### Matcher Syntax

- **Empty string, `"*"`, or omitted**: match all occurrences
- **Exact string**: `"Bash"` matches only the Bash tool
- **Regex OR**: `"Edit|Write"` matches Edit OR Write
- **Regex prefix**: `"Notebook.*"` matches any tool starting with Notebook
- **MCP tools**: `"mcp__memory__.*"` matches all tools from memory server
- **Cross-server**: `"mcp__.*__write.*"` matches any write tool from any MCP server

**Matchers are case-sensitive.** Tool names are PascalCase: `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Task`, `WebFetch`, `WebSearch`.

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)

---

## 5. Decision Control Patterns

### Pattern 1: Exit Code Control (Simple)

```bash
#!/bin/bash
# Exit 0 = allow, Exit 2 = block
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "rm -rf"; then
  echo "Blocked: destructive command" >&2
  exit 2  # Block
fi
exit 0  # Allow
```

**Exit code 2 behavior varies by event:**
- PreToolUse: blocks tool call
- UserPromptSubmit: blocks prompt processing, erases prompt
- Stop/SubagentStop: prevents stopping, conversation continues
- TeammateIdle: prevents idle, teammate continues working
- TaskCompleted: prevents completion, feedback sent to model
- PostToolUse/Notification/SessionStart/SessionEnd/PreCompact: non-blocking, stderr shown

### Pattern 2: Top-Level Decision (PostToolUse, Stop, SubagentStop, UserPromptSubmit)

```json
{
  "decision": "block",
  "reason": "Test suite must pass before proceeding"
}
```

### Pattern 3: hookSpecificOutput (PreToolUse)

PreToolUse has the richest control with three outcomes:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Reason shown to user (allow/ask) or Claude (deny)",
    "updatedInput": { "command": "modified command" },
    "additionalContext": "Context injected for Claude"
  }
}
```

- **allow**: bypasses permission system entirely
- **deny**: blocks tool call, reason fed to Claude
- **ask**: prompts user for confirmation

### Pattern 4: hookSpecificOutput (PermissionRequest)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow|deny",
      "updatedInput": { "command": "npm run lint" },
      "updatedPermissions": [{ "type": "toolAlwaysAllow", "tool": "Bash" }],
      "message": "Why denied (deny only)",
      "interrupt": false
    }
  }
}
```

### Pattern 5: Universal Fields (All Events)

```json
{
  "continue": false,
  "stopReason": "Build failed, fix errors",
  "suppressOutput": false,
  "systemMessage": "Warning: production environment detected"
}
```

Setting `continue: false` stops Claude entirely, regardless of event type. Takes precedence over event-specific decisions.

### Decision Priority (When Multiple Hooks Fire)

1. **Deny** rules checked first (any match = immediate denial)
2. **Ask** rules checked second
3. **Allow** rules checked third
4. **Default to Ask** if nothing matches

A single `deny` cannot be overridden by another hook returning `allow`.

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks), [Agent SDK Hooks - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/hooks)

---

## 6. Hooks in Skills and Agents (Frontmatter)

### Skill-Scoped Hooks

Hooks defined in skill frontmatter are:
- **Active only** while the skill is running
- **Auto-cleaned** when the skill finishes
- Support ALL hook events
- Support the `once: true` field (fire only once per session, skills only, NOT agents)

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

### Agent-Scoped Hooks

Same format in agent frontmatter. **Critical behavior:** `Stop` hooks in agent/skill frontmatter are automatically converted to `SubagentStop` events at runtime.

```yaml
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
  Stop:
    - hooks:
        - type: command
          command: "./scripts/validate-review-complete.sh"
---
```

The `Stop` hook above becomes a `SubagentStop` hook when the agent runs as a subagent.

### Settings.json Hooks for Subagent Events

Configure hooks in project settings that respond to subagent lifecycle in the main session:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

### Known Bug

Skill-scoped hooks defined in SKILL.md frontmatter are NOT triggered within plugins (see [GitHub Issue #17688](https://github.com/anthropics/claude-code/issues/17688)).

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks), [Sub-agents docs - code.claude.com](https://code.claude.com/docs/en/sub-agents)

---

## 7. Hooks and Agent Teams

### Team-Specific Hook Events

| Event | When | Can Block? | Decision Mechanism |
|-------|------|------------|-------------------|
| **TeammateIdle** | Teammate about to go idle after finishing turn | Yes | Exit code 2 only (no JSON) |
| **TaskCompleted** | Task being marked complete (via TaskUpdate or teammate finishing with in-progress tasks) | Yes | Exit code 2 only (no JSON) |

### TeammateIdle: Quality Gate Before Idle

When a TeammateIdle hook exits with code 2, the teammate receives the stderr message as feedback and **continues working** instead of going idle.

```bash
#!/bin/bash
# Prevent teammate from idling if build artifact missing
if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2  # Teammate continues working
fi
exit 0  # Teammate goes idle
```

### TaskCompleted: Quality Gate Before Task Closure

When a TaskCompleted hook exits with code 2, the task is NOT marked as completed and stderr is fed back to the model.

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if ! npm test 2>&1; then
  echo "Tests not passing. Fix before completing: $TASK_SUBJECT" >&2
  exit 2  # Task stays open
fi
exit 0  # Task marked complete
```

### Input Fields for Team Events

**TeammateIdle:** `teammate_name`, `team_name`
**TaskCompleted:** `task_id`, `task_subject`, `task_description?`, `teammate_name?`, `team_name?`

### Integration Pattern: Lead Monitors Teammates

The team lead's session can have hooks that fire when teammates start or stop:

```json
{
  "hooks": {
    "SubagentStart": [{
      "matcher": "researcher|implementer|reviewer",
      "hooks": [{ "type": "command", "command": "./hooks/log-agent-start.sh" }]
    }],
    "SubagentStop": [{
      "hooks": [{ "type": "command", "command": "./hooks/aggregate-agent-results.sh" }]
    }]
  }
}
```

**Source:** [Agent Teams - code.claude.com](https://code.claude.com/docs/en/agent-teams), [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)

---

## 8. Hooks and MCP Servers

### MCP Tool Naming Convention

MCP tools follow the pattern: `mcp__<server>__<tool>`

Examples:
- `mcp__memory__create_entities` -- Memory server's create entities tool
- `mcp__filesystem__read_file` -- Filesystem server's read file tool
- `mcp__github__search_repositories` -- GitHub server's search tool

### Matching MCP Tools

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          { "type": "command", "command": "echo 'Memory operation' >> ~/mcp-ops.log" }
        ]
      },
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          { "type": "command", "command": "./validate-mcp-write.py" }
        ]
      }
    ]
  }
}
```

### PostToolUse: Modify MCP Tool Output

PostToolUse hooks for MCP tools can **replace** the tool's output with custom content via `updatedMCPToolOutput`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "updatedMCPToolOutput": "Sanitized output replacing original MCP response"
  }
}
```

This is unique to MCP tools and not available for built-in tools.

### Rate-Limiting MCP Tools

```bash
#!/bin/bash
# Rate limit: max 10 calls per 60 seconds
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
LOG_FILE="/tmp/mcp-rate-${TOOL_NAME}.log"

# Count recent calls
NOW=$(date +%s)
CUTOFF=$((NOW - 60))
RECENT=$(awk -v cutoff="$CUTOFF" '$1 > cutoff' "$LOG_FILE" 2>/dev/null | wc -l)

if [ "$RECENT" -ge 10 ]; then
  echo "Rate limited: $TOOL_NAME exceeded 10 calls/minute" >&2
  exit 2
fi

echo "$NOW" >> "$LOG_FILE"
exit 0
```

**Source:** [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)

---

## 9. Quality Gates Pattern

### Pattern: Layered Quality Enforcement

The recommended pattern layers three hook types for different verification needs:

| Layer | Hook Type | Use For | Example |
|-------|-----------|---------|---------|
| Deterministic | `command` | Format, lint, type-check, file protection | `prettier --write`, `eslint --fix`, `tsc --noEmit` |
| Semantic | `prompt` | Complex judgment on hook input data | "Are all user requirements satisfied?" |
| Comprehensive | `agent` | Multi-step verification with codebase inspection | Run tests + check types + verify no debug code |

### Example: Complete Quality Pipeline

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write",
            "statusMessage": "Formatting..."
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify: 1) All unit tests pass (run npm test). 2) No TypeScript errors (run npx tsc --noEmit). 3) No console.log in production code. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/verify-task-complete.sh"
          }
        ]
      }
    ]
  }
}
```

### Production Pattern: Boris Cherny Workflow

Boris Cherny (Claude Code power user running 10-15 parallel sessions) uses:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "bun run format || true"
      }]
    }]
  }
}
```

The `|| true` ensures formatting failures don't block Claude. This is the most common production pattern: auto-format after every edit, swallow errors.

### Anti-Infinite-Loop Pattern for Stop Hooks

Always check `stop_hook_active` to prevent Claude from looping forever:

```bash
#!/bin/bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow stop on second pass
fi
# ... actual validation logic ...
```

**Source:** [Hooks Guide - code.claude.com](https://code.claude.com/docs/en/hooks-guide), [dev.to/lukaszfryc](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg), [builder.io/blog/claude-code](https://www.builder.io/blog/claude-code)

---

## 10. Agent Coordination via Hooks

### Pattern 1: Hook Emission as Event Bus

Hooks act as an inter-agent event bus. Key coordination patterns:

```
[Agent A completes] ---> SubagentStop hook fires
                              |
                              v
                    [Script logs completion, updates shared state]
                              |
                              v
                    [Main agent reads state, spawns Agent B]
```

### Pattern 2: Multi-Agent Observability (disler/claude-code-hooks-multi-agent-observability)

Architecture: `Claude Agents --> Hook Scripts --> HTTP POST --> Server --> SQLite --> WebSocket --> Dashboard`

Each of 12 hook events has a dedicated Python script that captures context (tool name, inputs, outputs, agent IDs) and sends to an observability server. Sessions are color-coded for visual tracking.

Configuration per event:
```json
{
  "PreToolUse": [{
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": "uv run .claude/hooks/send_event.py --source-app PROJECT_NAME --event-type PreToolUse"
    }]
  }]
}
```

### Pattern 3: Subagent Context Injection (SubagentStart)

Inject context into subagents at spawn time:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Follow security guidelines. Database is read-only. Use staging credentials."
  }
}
```

### Pattern 4: Subagent Transcript Analysis (SubagentStop)

SubagentStop provides `agent_transcript_path` -- the subagent's full conversation log. Parse it to:
- Extract key findings
- Validate work quality
- Feed results to next agent
- Log metrics

```bash
#!/bin/bash
INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.agent_transcript_path')
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type')

# Parse transcript for key results
FINDINGS=$(jq -r '.[] | select(.type=="assistant") | .content' "$TRANSCRIPT" | tail -20)

# Log completion
echo "[$(date)] Agent $AGENT_TYPE completed. Findings: $FINDINGS" >> .claude/agent-completions.log
exit 0
```

### Pattern 5: Skill Auto-Activation (paddo.dev)

Use `UserPromptSubmit` hook to match file contexts and inject relevant skills:

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/skill-activation-prompt.sh"
      }]
    }]
  }
}
```

The script reads open files, matches against rules in `skill-rules.json`, and outputs skill content to stdout (added to Claude's context).

**Limitation:** This works for context selection but NOT for workflow orchestration (sequencing multi-step processes).

**Source:** [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability), [paddo.dev](https://paddo.dev/blog/claude-skills-hooks-solution/), [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)

---

## 11. Performance Impact

### Overhead by Hook Type

| Hook Type | Typical Latency | Blocking? | Token Cost |
|-----------|----------------|-----------|------------|
| **command** (simple script) | 1-50ms | Yes (unless async) | $0 |
| **command** (runs tests/lint) | 1-30s | Yes (unless async) | $0 |
| **prompt** | 1-5s | Yes | ~200-500 tokens |
| **agent** | 5-60s | Yes | ~1K-10K tokens (multiple turns) |
| **command** (async) | 0ms blocking | No | $0 |

### Mitigation Strategies

1. **Use `async: true`** for long-running hooks (tests, deployments) that don't need to block
2. **Set `timeout`** appropriately: 30s for scripts, 60s for agents, 120s for test suites
3. **Use specific matchers** to avoid firing on irrelevant events (e.g., `"Edit|Write"` not `"*"`)
4. **Prefer command over prompt/agent** when deterministic rules suffice
5. **Exit early** in scripts when conditions don't apply (check file extension, tool name)

### Scaling Considerations

- All matching hooks run **in parallel** (not sequential)
- Identical handlers are deduplicated automatically
- Each async hook creates a separate background process (no dedup across firings)
- Prompt/agent hooks call the LLM -- monitor token usage in high-frequency events like PostToolUse
- In agent teams, hooks multiply: N teammates x M hooks = N*M total executions

### Real-World Benchmarks

- Auto-format with Prettier (PostToolUse): ~100-500ms per file
- TypeScript type-check (PostToolUse): ~2-10s depending on project size
- Stop hook with `npm test`: ~5-30s depending on test suite
- Boris Cherny pattern (`bun run format || true`): ~50-200ms per edit

**Source:** [claudelog.com/faqs/claude-code-performance](https://claudelog.com/faqs/claude-code-performance/), community benchmarks

---

## 12. Comparison: Claude Code Hooks vs Git Hooks vs GitHub Actions

| Dimension | Claude Code Hooks | Git Hooks | GitHub Actions |
|-----------|------------------|-----------|----------------|
| **Trigger scope** | AI agent lifecycle (tool calls, prompts, sessions, agents) | Git operations (commit, push, merge) | Repository events (push, PR, schedule) |
| **Execution** | Local machine, during Claude session | Local machine, during git command | Remote (GitHub runners) |
| **Blocking** | PreToolUse, Stop, UserPromptSubmit can block | pre-commit, pre-push can block | Required status checks block merge |
| **Token/cost** | Free (command) or LLM tokens (prompt/agent) | Free | Free minutes + paid overages |
| **Matchers** | Regex on tool name/event type | Pre-defined hook names (fixed) | Event types + filters |
| **Input** | Rich JSON (session, tool, input, response) | Git refs, commit info | GitHub event payload |
| **AI-aware** | Yes (can read transcripts, agent state) | No | No (unless you add AI step) |
| **Scope** | Per-user, per-project, per-skill, per-agent | Per-repo | Per-repo + org |
| **3 types** | command, prompt, agent | Shell scripts only | YAML workflows |

### Complementary Usage

These are NOT competing systems. Optimal setup uses all three:

1. **Claude Code hooks**: Enforce standards during AI-assisted development (real-time)
2. **Git hooks**: Enforce standards during manual git operations (local)
3. **GitHub Actions**: Enforce standards in CI/CD pipeline (remote, canonical)

### Missing: PreCommit/PostCommit

A [feature request (Issue #4834)](https://github.com/anthropics/claude-code/issues/4834) for git-specific `PreCommit`/`PostCommit` hooks was closed as NOT_PLANNED after 60 days. Current workaround: `PreToolUse` with `Bash` matcher + grep for `git commit` in the command, but this is suboptimal for pre-commit validation.

**Source:** [GitHub Issue #4834](https://github.com/anthropics/claude-code/issues/4834), [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)

---

## 13. Production Cases and Community Patterns

### Case 1: Klaudiush - Git Workflow Validator (Go)

**Repo:** [smykla-skalski/klaudiush](https://github.com/smykla-skalski/klaudiush)

A Go binary that acts as a PreToolUse hook with a predicate-based registry:

- **CommitValidator**: Requires `-sS` flags, conventional commits (<=50 char title)
- **BranchValidator**: Enforces `type/description` format
- **PRValidator**: Semantic PR title format
- **ShellScript/Markdown/Terraform validators**: File-specific rules
- **Composable predicates**: `And(EventTypeIs(PreToolUse), CommandContains("git commit"))`
- **3-level config merge**: CLI flags > env vars > project config > global config > defaults

### Case 2: everything-claude-code Hooks (affaan-m)

**Repo:** [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)

Battle-tested hooks.json covering all 13 events:
- TTS notification on Stop
- Strategic compact on PreCompact
- Tool call logging on all PreToolUse/PostToolUse
- Builder/Validator agent pattern (builder has full access, validator is read-only)

### Case 3: Claude Hooks Ruby DSL (gabriel-dehan)

**Repo:** [gabriel-dehan/claude_hooks](https://github.com/gabriel-dehan/claude_hooks)

A Ruby DSL that abstracts hook complexity:
- Coordinator pattern: entrypoints instantiate handlers per event type
- State management via `add_additional_context!()`, `block_prompt!()`
- Auto-handles exit codes, stream selection (stdout/stderr), JSON merging
- Supports all 10 core hook events

### Case 4: Chris Wiles Claude Code Showcase

**Repo:** [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)

Full project configuration showing hooks + skills + agents + commands + GitHub Actions:
- Skill evaluation hook on UserPromptSubmit (auto-suggests relevant skills)
- Branch protection on PreToolUse
- Quality gates on Stop

### Case 5: Cameron Westland - First Hooks

**Blog:** [cameronwestland.com](https://cameronwestland.com/building-my-first-claude-code-hooks-automating-the-workflow-i-actually-want/)

Two hooks:
1. **Branch protection**: PreToolUse blocks git commands on main, suggests branching
2. **Quality automation**: PostToolUse runs TypeScript type-check + lint after edits, blocks on failure with JSON feedback

Key insight: "Automatic contextual feedback matters more than manual checks. When Claude receives immediate feedback about type errors, it self-corrects within the same conversation."

### Case 6: Hook Development Skill (alexfazio)

**Gist:** [alexfazio/653c5164d726987569ee8229a19f451f](https://gist.github.com/alexfazio/653c5164d726987569ee8229a19f451f)

A meta-skill that helps you BUILD hooks. Includes templates for all event types, testing patterns, and progressive disclosure of hook capabilities.

### Case 7: disler/claude-code-hooks-mastery

**Repo:** [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)

Reference implementation of all 13 events with:
- Intelligent TTS system (ElevenLabs > OpenAI > pyttsx3 priority)
- Context persistence via `CLAUDE_ENV_FILE`
- Transcript management (JSONL to JSON conversion in PostToolUse)
- PreCompact backup of conversations

**Source:** Community repositories listed above

---

## 14. Anti-Patterns and Pitfalls

### 1. Infinite Stop Hook Loop

**Problem:** Stop hook always returns `decision: "block"`, Claude never stops.
**Fix:** Always check `stop_hook_active` and exit 0 on the second pass.

### 2. Heavy Hooks on High-Frequency Events

**Problem:** Running `npm test` synchronously on every PostToolUse blocks Claude for 10-30s per edit.
**Fix:** Use `async: true` for test runners, or only trigger on specific file patterns (check file extension in script).

### 3. Shell Profile Interference

**Problem:** `~/.zshrc` or `~/.bashrc` prints text on startup (e.g., "Shell ready"), prepended to hook JSON output, causing parse failure.
**Fix:** Wrap echo statements in `if [[ $- == *i* ]]; then ... fi` (interactive-only).

### 4. PermissionRequest Hooks in Headless Mode

**Problem:** PermissionRequest hooks don't fire in non-interactive mode (`-p`).
**Fix:** Use PreToolUse hooks for automated permission decisions in CI/CD.

### 5. Trusting Matchers for File Paths

**Problem:** Matchers only filter by tool name, not file paths or arguments.
**Fix:** Check `tool_input.file_path` inside the hook callback for path-based filtering.

### 6. Mixing Exit Code 2 with JSON Output

**Problem:** Returning both exit code 2 and JSON output. Claude Code ignores JSON on exit 2.
**Fix:** Choose one approach: exit codes for simple allow/block, OR exit 0 with JSON for structured control.

### 7. Missing chmod +x

**Problem:** Hook script exists but fails silently because it's not executable.
**Fix:** Always `chmod +x` hook scripts.

### 8. Prompt/Agent Hooks on PostToolUse

**Problem:** Prompt or agent hooks on high-frequency events (PostToolUse) burn tokens rapidly.
**Fix:** Reserve prompt/agent hooks for infrequent events (Stop, TaskCompleted) and use command hooks for frequent events.

### 9. Not Quoting Shell Variables

**Problem:** File paths with spaces break unquoted variables.
**Fix:** Always use `"$VAR"` not `$VAR` in hook scripts.

### 10. Skill-Scoped Hooks in Plugins

**Problem:** Skill-scoped hooks defined in SKILL.md frontmatter are NOT triggered within plugins ([Issue #17688](https://github.com/anthropics/claude-code/issues/17688)).
**Fix:** Use settings-based hooks instead of frontmatter hooks in plugins until fixed.

**Source:** [Hooks Guide Troubleshooting - code.claude.com](https://code.claude.com/docs/en/hooks-guide), community reports

---

## 15. Recommendations for MMOS

### Current MMOS Hooks

MMOS already has hooks defined in `.claude/hooks/`:

| Hook | Event | Purpose |
|------|-------|---------|
| `read-protection.py` | PreToolUse (Read) | Blocks partial reads on protected files |
| `sql-governance.py` | PreToolUse (Bash) | Blocks CREATE/ALTER/DROP without approval |
| `slug-validation.py` | PreToolUse (Write/Edit) | Enforces snake_case slug format |
| `enforce-architecture-first.py` | PreToolUse (Write) | Blocks code in protected paths without docs |
| `write-path-validation.py` | PostToolUse (Write) | Warns about incorrect document paths |
| `mind-clone-governance.py` | PreToolUse | Blocks mind clone agents without DNA extraction |

### Recommended Additions

**1. Auto-Format on Edit** (High Priority)
```json
{
  "PostToolUse": [{
    "matcher": "Edit|Write",
    "hooks": [{
      "type": "command",
      "command": "FILE=$(cat | jq -r '.tool_input.file_path'); case \"$FILE\" in *.ts|*.tsx|*.js|*.jsx) npx prettier --write \"$FILE\" 2>/dev/null ;; esac; exit 0"
    }]
  }]
}
```

**2. Context Re-injection After Compaction**
```json
{
  "SessionStart": [{
    "matcher": "compact",
    "hooks": [{
      "type": "command",
      "command": "echo 'MMOS project. See .claude/CLAUDE.md for rules. Use PageLayout for pages. Never invent icons - check icon-map.ts. ETL fetch-page.js before WebFetch.'"
    }]
  }]
}
```

**3. TeammateIdle Quality Gate** (For Agent Teams)
```bash
#!/bin/bash
# Ensure teammate ran lint before going idle
if [ -f ".lint-required" ]; then
  RESULT=$(npm run lint 2>&1)
  if [ $? -ne 0 ]; then
    echo "Lint errors found. Fix before stopping: $RESULT" >&2
    exit 2
  fi
fi
exit 0
```

**4. TaskCompleted Verification** (For Agent Teams)
```bash
#!/bin/bash
INPUT=$(cat)
TASK=$(echo "$INPUT" | jq -r '.task_subject')

# Run type check
if ! npx tsc --noEmit 2>&1; then
  echo "TypeScript errors. Fix before completing: $TASK" >&2
  exit 2
fi
exit 0
```

**5. SubagentStop Observer** (For Multi-Agent Coordination)
```json
{
  "SubagentStop": [{
    "hooks": [{
      "type": "command",
      "command": ".claude/hooks/log-agent-completion.sh"
    }]
  }]
}
```

**6. Notification Hook** (Desktop Alerts)
```json
{
  "Notification": [{
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": "osascript -e 'display notification \"Claude needs attention\" with title \"MMOS\"'"
    }]
  }]
}
```

### Architecture Principle

For MMOS, adopt the **three-layer quality gate model**:

1. **PreToolUse** (governance hooks): Block dangerous/invalid operations deterministically
2. **PostToolUse** (quality hooks): Auto-format, lint, type-check after every edit
3. **Stop/TaskCompleted** (completion hooks): Verify work quality before marking done

This maps directly to MMOS's existing governance philosophy but extends it with automatic quality enforcement and team coordination capabilities.

---

## Sources

### Official Documentation
- [Hooks Reference - code.claude.com](https://code.claude.com/docs/en/hooks)
- [Hooks Guide - code.claude.com](https://code.claude.com/docs/en/hooks-guide)
- [Agent Teams - code.claude.com](https://code.claude.com/docs/en/agent-teams)
- [Sub-agents - code.claude.com](https://code.claude.com/docs/en/sub-agents)
- [Agent SDK Hooks - platform.claude.com](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Claude Blog: How to Configure Hooks](https://claude.com/blog/how-to-configure-hooks)

### Community Repos
- [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) -- All 13 events reference implementation
- [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) -- Multi-agent monitoring
- [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) -- Full project config with hooks+skills+agents
- [smykla-skalski/klaudiush](https://github.com/smykla-skalski/klaudiush) -- Go-based git workflow validator
- [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) -- Battle-tested hooks.json
- [gabriel-dehan/claude_hooks](https://github.com/gabriel-dehan/claude_hooks) -- Ruby DSL for hooks
- [alexfazio hook development skill](https://gist.github.com/alexfazio/653c5164d726987569ee8229a19f451f)
- [GitHub Issue #4834 - PreCommit/PostCommit request](https://github.com/anthropics/claude-code/issues/4834)
- [GitHub Issue #17688 - Skill-scoped hooks in plugins bug](https://github.com/anthropics/claude-code/issues/17688)

### Blog Posts and Guides
- [paddo.dev: Skills Auto-Activation via Hooks](https://paddo.dev/blog/claude-skills-hooks-solution/)
- [letanure.dev: Claude Code Part 8 - Hooks Automated Quality Checks](https://www.letanure.dev/blog/2025-08-06--claude-code-part-8-hooks-automated-quality-checks)
- [cameronwestland.com: Building My First Claude Code Hooks](https://cameronwestland.com/building-my-first-claude-code-hooks-automating-the-workflow-i-actually-want/)
- [dev.to/lukaszfryc: 20+ Ready-to-Use Hook Examples](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg)
- [eesel.ai: Complete Guide to Hooks](https://www.eesel.ai/blog/hooks-in-claude-code)
- [datacamp.com: Claude Code Hooks Tutorial](https://www.datacamp.com/tutorial/claude-code-hooks)

---

## Gaps

- **Performance benchmarks in production**: No systematic measurement of hook overhead across different project sizes. Community reports are anecdotal.
- **Agent hook token cost tracking**: No built-in way to monitor how many tokens prompt/agent hooks consume over time.
- **Hook execution order guarantees**: Documentation says hooks run "in parallel" but doesn't specify ordering when multiple matchers match the same event with conflicting decisions.
- **PreCommit/PostCommit hooks**: Feature request closed as NOT_PLANNED. No native git-commit-specific hooks. Current workaround (PreToolUse + Bash grep) is fragile.
- **Skill-scoped hooks in plugins**: Known bug (#17688) where frontmatter hooks don't fire in plugin context.
- **Cross-session hook state**: No built-in mechanism for hooks to persist state across sessions (must use files or external storage).
- **Hook testing framework**: No official testing tools. Must test by piping sample JSON manually.
- **Rate limiting for prompt/agent hooks**: No built-in protection against runaway token costs from high-frequency prompt/agent hooks.
