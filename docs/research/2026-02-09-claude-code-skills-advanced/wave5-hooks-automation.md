# Wave 5: Hooks, Automation & Self-Improving Agent Patterns

> Deep research into the most creative and advanced uses of Claude Code hooks,
> automation patterns, and self-improving agent architectures.
>
> **Date:** 2026-02-09
> **Sources consulted:** 28
> **Pages deep-read:** 16

---

## TL;DR: Top 10 Hook Recipes

1. **Auto-format on every edit** -- PostToolUse + `Edit|Write` matcher runs Prettier/ESLint automatically (zero friction, deterministic)
2. **Block destructive commands** -- PreToolUse + Bash matcher denies `rm -rf`, `DROP TABLE`, `--force push` before execution
3. **Agent-based quality gate on Stop** -- `type: "agent"` hook spawns a subagent to run tests, typecheck, and lint before Claude finishes
4. **PreCompact transcript backup** -- saves full transcript to `.claude/backups/` before context compaction (prevents knowledge loss)
5. **Claudeception skill extraction** -- UserPromptSubmit hook injects reminder to evaluate session for extractable knowledge
6. **Cost/token tracking per session** -- PostToolUse hook logs every tool call with timestamps to audit file; OpenTelemetry for dashboards
7. **Desktop notifications (macOS/Linux)** -- Notification hook fires `osascript`/`notify-send` when Claude needs input
8. **Environment variable persistence** -- SessionStart hook writes to `$CLAUDE_ENV_FILE` for NVM/pyenv/etc. setup
9. **HCOM inter-agent messaging** -- hooks capture events into SQLite event bus; other agents subscribe and receive mid-turn
10. **Prompt improver gate** -- UserPromptSubmit evaluates clarity; vague prompts get clarifying questions before execution

---

## Table of Contents

1. [Hook Architecture Deep-Dive](#1-hook-architecture-deep-dive)
2. [Hook Recipes Catalog](#2-hook-recipes-catalog)
3. [Automation Blueprints](#3-automation-blueprints)
4. [Self-Improving Agent Architecture](#4-self-improving-agent-architecture)
5. [Observability & Monitoring](#5-observability--monitoring)
6. [Inter-Agent Communication](#6-inter-agent-communication)
7. [Performance Considerations](#7-performance-considerations)
8. [Recommendations for MMOS](#8-recommendations-for-mmos)
9. [Sources](#9-sources)

---

## 1. Hook Architecture Deep-Dive

### 1.1 The 14 Hook Events (Complete Lifecycle)

Claude Code hooks fire at 14 distinct lifecycle points. Each event has specific
input schemas, matcher patterns, and decision control capabilities.

```
SessionStart ──> UserPromptSubmit ──> [Agentic Loop] ──> Stop ──> SessionEnd
                                       |
                                       v
                              PreToolUse ──> PermissionRequest
                                       |
                                       v
                              PostToolUse / PostToolUseFailure
                                       |
                                       v
                              SubagentStart ──> SubagentStop
                                       |
                                       v
                              TeammateIdle / TaskCompleted
                                       |
                                       v
                              PreCompact / Notification
```

| Event | When | Can Block? | Matcher Target |
|-------|------|-----------|----------------|
| `SessionStart` | Session begins/resumes | No | `startup`, `resume`, `clear`, `compact` |
| `UserPromptSubmit` | Prompt submitted, pre-processing | Yes | No matcher (always fires) |
| `PreToolUse` | Before tool executes | Yes (allow/deny/ask) | Tool name: `Bash`, `Edit`, `Write`, `mcp__*` |
| `PermissionRequest` | Permission dialog shown | Yes (allow/deny) | Tool name |
| `PostToolUse` | After tool succeeds | No (feedback only) | Tool name |
| `PostToolUseFailure` | After tool fails | No (feedback only) | Tool name |
| `Notification` | Claude needs attention | No | `permission_prompt`, `idle_prompt`, `auth_success` |
| `SubagentStart` | Subagent spawned | No (context inject) | Agent type name |
| `SubagentStop` | Subagent finishes | Yes (block stop) | Agent type name |
| `Stop` | Main agent finishes | Yes (block stop) | No matcher (always fires) |
| `TeammateIdle` | Agent Teams teammate idle | Yes (exit 2) | No matcher |
| `TaskCompleted` | Task marked complete | Yes (exit 2) | No matcher |
| `PreCompact` | Before context compaction | No | `manual`, `auto` |
| `SessionEnd` | Session terminates | No | `clear`, `logout`, `prompt_input_exit`, `other` |

> Source: [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)

### 1.2 Three Hook Types

| Type | Mechanism | Best For | Default Timeout |
|------|-----------|----------|-----------------|
| `command` | Shell command, reads stdin JSON | Deterministic rules, scripts | 600s |
| `prompt` | Single LLM call (Haiku default) | Judgment-based decisions | 30s |
| `agent` | Multi-turn subagent with tools | Complex verification needing file reads | 60s |

**Command hooks** are the workhorse: your script receives JSON on stdin, inspects
it, and communicates via exit codes (0=proceed, 2=block) or JSON stdout.

**Prompt hooks** send the hook input + your prompt to a fast model that returns
`{"ok": true/false, "reason": "..."}`. Ideal for semantic evaluation like
"did Claude complete all tasks?"

**Agent hooks** spawn a subagent that can Read, Grep, Glob, and run Bash for up
to 50 turns before returning the same `ok/reason` decision. Ideal for "run tests
and verify they pass" gates.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify all unit tests pass. Run the test suite and check results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

> Source: [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

### 1.3 Hook Scoping & Precedence

| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/settings.json` | All projects | No |
| `.claude/settings.json` | Single project | Yes (commit) |
| `.claude/settings.local.json` | Single project | No (gitignored) |
| Managed policy | Organization-wide | Yes (admin) |
| Plugin `hooks/hooks.json` | When plugin enabled | Yes |
| Skill/Agent frontmatter | While component active | Yes |

**Key insight:** Hooks in skills/agents are scoped to the component's lifecycle
and automatically cleaned up when it finishes. For subagents, `Stop` hooks
in frontmatter auto-convert to `SubagentStop`.

**Security:** Direct edits to settings files don't take effect mid-session.
Claude Code snapshots hooks at startup. Enterprise admins can use
`allowManagedHooksOnly` to block user/project/plugin hooks entirely.

### 1.4 Matcher Patterns (Regex-Based)

Matchers are regex strings filtering when hooks fire:

- `Bash` -- exact tool match
- `Edit|Write` -- either tool
- `mcp__github__.*` -- all GitHub MCP tools
- `mcp__.*__write.*` -- any write tool from any MCP server
- `startup|resume` -- SessionStart on new or resumed sessions
- `""` or omitted -- matches everything

### 1.5 Exit Code Decision Control

```
Exit 0  --> Success: proceed. JSON on stdout parsed for structured control
Exit 2  --> Block: stderr fed to Claude as error. Tool call prevented (PreToolUse)
                    or prompt rejected (UserPromptSubmit)
Other   --> Non-blocking error: stderr logged, execution continues
```

**JSON output on exit 0** provides fine-grained control:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes not allowed in production"
  }
}
```

PreToolUse supports three decisions: `"allow"` (bypass permission), `"deny"`
(block + tell Claude why), `"ask"` (show normal permission prompt).

### 1.6 Async Hooks

Add `"async": true` to command hooks to run in the background. Claude continues
working immediately. When the async hook finishes, its `systemMessage` or
`additionalContext` is delivered on the next conversation turn.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/run-tests-async.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

**Limitations:** Only `type: "command"` supports async. Cannot block actions.
No deduplication across multiple firings.

---

## 2. Hook Recipes Catalog

### Category A: Security & Protection

#### A1. Block Destructive Shell Commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'CMD=$(jq -r \".tool_input.command\" <<< \"$(cat)\"); for p in \"rm -rf /\" \"rm -rf ~\" \"drop table\" \"DROP TABLE\" \"truncate\" \"TRUNCATE\" \"--force\" \"push.*--force\"; do if echo \"$CMD\" | grep -qiE \"$p\"; then echo \"Blocked: pattern \\\"$p\\\" detected\" >&2; exit 2; fi; done; exit 0'"
          }
        ]
      }
    ]
  }
}
```

> Source: [Claude Code Hooks: 20+ Examples](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg)

#### A2. Protect Sensitive Files

```bash
#!/bin/bash
# .claude/hooks/protect-files.sh
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED=(".env" ".env.local" "secrets/" ".git/" "package-lock.json" "pnpm-lock.yaml")

for pattern in "${PROTECTED[@]}"; do
  if [[ "$FILE" == *"$pattern"* ]]; then
    echo "Protected file: $pattern" >&2
    exit 2
  fi
done
exit 0
```

Config:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

#### A3. Audit Log All Bash Commands

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'jq -r \".tool_input.command\" <<< \"$(cat)\" | while read cmd; do echo \"$(date +%Y-%m-%dT%H:%M:%S) $cmd\" >> \"$CLAUDE_PROJECT_DIR\"/.claude/command-audit.log; done; exit 0'"
          }
        ]
      }
    ]
  }
}
```

#### A4. Rate-Limit MCP Tools

```bash
#!/bin/bash
# .claude/hooks/rate-limit-mcp.sh
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name')
LOGFILE="$CLAUDE_PROJECT_DIR/.claude/mcp-rate.log"

RECENT=$(grep -c "$TOOL" "$LOGFILE" 2>/dev/null || echo 0)
echo "$(date +%s) $TOOL" >> "$LOGFILE"

if [ "$RECENT" -gt 10 ]; then
  echo "Rate limit: $TOOL called $RECENT times recently" >&2
  exit 2
fi
exit 0
```

### Category B: Code Quality

#### B1. Auto-Format with Prettier (PostToolUse)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

#### B2. Auto-Lint with ESLint Fix

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\" <<< \"$(cat)\"); if [[ \"$FILE\" == *.ts || \"$FILE\" == *.tsx || \"$FILE\" == *.js || \"$FILE\" == *.jsx ]]; then npx eslint --fix \"$FILE\" 2>/dev/null; fi; exit 0'"
          }
        ]
      }
    ]
  }
}
```

#### B3. TypeScript Type Check After Edits

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\" <<< \"$(cat)\"); if [[ \"$FILE\" == *.ts || \"$FILE\" == *.tsx ]]; then npx tsc --noEmit 2>&1 | head -20; fi; exit 0'",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

#### B4. Run Affected Tests After File Changes (Async)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\" <<< \"$(cat)\"); if [[ \"$FILE\" == *.test.* || \"$FILE\" == *.spec.* ]]; then npx vitest run \"$FILE\" 2>&1 | tail -5; fi; exit 0'",
            "timeout": 30,
            "async": true
          }
        ]
      }
    ]
  }
}
```

#### B5. Agent-Based Quality Gate on Stop

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify work complete: 1) Run test suite. 2) Check TypeScript errors (npx tsc --noEmit). 3) Verify no console.log in production code. Report findings. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

#### B6. Enforce Tests Pass Before Stopping

```bash
#!/bin/bash
# .claude/hooks/verify-tests.sh
INPUT=$(cat)

# CRITICAL: Prevent infinite loop
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

if ! npm test --silent 2>/dev/null; then
  echo "Tests are failing. Fix them before finishing." >&2
  exit 2
fi

exit 0
```

### Category C: Context Management

#### C1. Inject Context After Compaction

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"Post-compaction context: Use Bun (not npm). Run bun test before committing. Current branch: $(git -C \"$CLAUDE_PROJECT_DIR\" branch --show-current 2>/dev/null || echo unknown). Last commit: $(git -C \"$CLAUDE_PROJECT_DIR\" log --oneline -1 2>/dev/null || echo none).\"'"
          }
        ]
      }
    ]
  }
}
```

#### C2. Environment Variable Persistence via CLAUDE_ENV_FILE

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'if [ -n \"$CLAUDE_ENV_FILE\" ]; then echo \"export NODE_ENV=development\" >> \"$CLAUDE_ENV_FILE\"; echo \"export NEXT_TELEMETRY_DISABLED=1\" >> \"$CLAUDE_ENV_FILE\"; fi; exit 0'"
          }
        ]
      }
    ]
  }
}
```

#### C3. NVM/Pyenv Setup via Environment Diff

```bash
#!/bin/bash
# .claude/hooks/setup-env.sh
ENV_BEFORE=$(export -p | sort)

# Run setup commands that modify environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

#### C4. PreCompact Transcript Backup

```python
#!/usr/bin/env python3
# .claude/hooks/backup-transcript.py
import json, shutil, sys
from pathlib import Path
from datetime import datetime

input_data = json.load(sys.stdin)
transcript_path = input_data.get('transcript_path', '')

if transcript_path and Path(transcript_path).exists():
    backup_dir = Path('.claude/backups')
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    trigger = input_data.get('trigger', 'unknown')
    backup_name = f"transcript_{trigger}_{timestamp}.jsonl"
    shutil.copy2(transcript_path, backup_dir / backup_name)

    # Keep only last 10 backups
    for old in sorted(backup_dir.glob('transcript_*.jsonl'))[:-10]:
        old.unlink()
```

#### C5. PreCompact Recovery Brief (LLM-Interpreted)

The [precompact-hook](https://github.com/mvara-ai/precompact-hook) project
generates "recovery briefs" before compaction by:

1. Extracting last 50 messages from transcript
2. Spawning a fresh Claude instance (empty context) to interpret them
3. Generating a brief with 6 dimensions: Who Is Here, The Living Thread,
   What Just Happened, Emotional Truth, Key Artifacts, Continue With
4. Injecting the brief into post-compaction context

This preserves semantic understanding rather than raw data across compaction
boundaries.

### Category D: Notifications

#### D1. macOS Desktop Notification

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your input\" with title \"Claude Code\" sound name \"Ping\"'"
          }
        ]
      }
    ]
  }
}
```

#### D2. Task Complete Notification

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Task complete - ready for next instruction\" with title \"Claude Code\" sound name \"Glass\"'"
          }
        ]
      }
    ]
  }
}
```

#### D3. Slack Notification on Permission Request

The [claude-code-hooks](https://github.com/karanb192/claude-code-hooks) repo
provides a `notify-permission` hook that sends Slack messages when Claude
requires approval, enabling remote monitoring of headless sessions.

### Category E: Permission Automation

#### E1. Auto-Approve Read Operations

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Glob|Grep",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"{\\\"hookSpecificOutput\\\":{\\\"hookEventName\\\":\\\"PreToolUse\\\",\\\"permissionDecision\\\":\\\"allow\\\"}}\"'"
          }
        ]
      }
    ]
  }
}
```

#### E2. Auto-Approve Web Operations

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "WebFetch|WebSearch",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\"}}'"
          }
        ]
      }
    ]
  }
}
```

#### E3. Deny Web Access (Offline Mode)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "WebFetch|WebSearch",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"Web access disabled by project policy\" >&2; exit 2'"
          }
        ]
      }
    ]
  }
}
```

### Category F: Prompt Engineering

#### F1. Anti-Sycophancy Hook

The [ljw1004 gist](https://gist.github.com/ljw1004/34b58090c16ee6d5e6f13fce07463a31)
implements a UserPromptSubmit hook that monitors the transcript for reflexive
agreement phrases ("You're right", "you are correct", "absolutely"). When
detected, it injects a system reminder instructing Claude to:

1. Avoid reflexive agreement
2. Provide substantive analysis with flaw/bug/edge-case identification
3. State disagreement concretely with technical reasoning

Detection examines the last 5 transcript items, first 80 characters of each
assistant message.

#### F2. Prompt Improver

The [claude-code-prompt-improver](https://github.com/severity1/claude-code-prompt-improver)
hook evaluates prompt clarity via a ~189-token evaluation wrapper. Clear prompts
proceed immediately; vague prompts trigger a 4-phase skill workflow
(Research -> Questions -> Clarify -> Execute).

Bypass prefixes: `*` (skip evaluation), `/` (slash commands), `#` (memorization).

Token cost: ~5.7K tokens per 30-message session (~2.8% of 200K context).

### Category G: Agent Teams

#### G1. TeammateIdle Quality Gate

```bash
#!/bin/bash
# Prevent teammate from going idle without build artifact
if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2
fi
exit 0
```

#### G2. TaskCompleted Verification

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if ! npm test 2>&1; then
  echo "Tests not passing. Fix failing tests before completing: $TASK_SUBJECT" >&2
  exit 2
fi
exit 0
```

---

## 3. Automation Blueprints

### 3.1 GitHub Actions Integration

Claude Code provides an official GitHub Action
([anthropics/claude-code-action](https://github.com/anthropics/claude-code-action))
for CI/CD integration.

#### Code Review on PR

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/review"
          claude_args: "--max-turns 5"
```

#### Interactive @claude in PRs

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

#### Scheduled Daily Report

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: "--model opus"
```

> Source: [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)

### 3.2 Cron + Headless Mode

Headless mode (`-p` flag) runs Claude Code non-interactively, perfect for
scheduled tasks.

```bash
# Nightly dependency check
0 2 * * * claude -p "Check for outdated npm dependencies and create a PR to update them" \
  --output-format json \
  --max-turns 20 \
  >> /var/log/claude-nightly.log 2>&1
```

#### Claude Code Scheduler Plugin

The [claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler)
provides structured scheduling with three task types:

| Type | Behavior | Example |
|------|----------|---------|
| **One-Time** | Single execution, auto-removes | "today at 3pm remind me to deploy" |
| **Recurring** | Repeated on schedule, persists | "every weekday at 9am check for issues" |
| **Autonomous** | File modifications, commits | "every 4 hours update changelog" |

Tasks are stored in `.claude/schedules.json` or `~/.claude/schedules.json`.
Execution uses OS-native schedulers (launchd on macOS, crontab on Linux).

For autonomous tasks requiring file changes, the scheduler uses git worktree
isolation: creates fresh worktree with new branch -> Claude executes -> changes
commit and push -> worktree self-destructs.

#### runCLAUDErun (macOS Native)

[runCLAUDErun](https://runclauderun.com/) is a native macOS app for scheduling
Claude Code tasks with a GUI instead of cron configuration.

### 3.3 Webhook-Triggered Execution

```bash
# Express.js webhook endpoint triggering Claude Code
app.post('/webhook/deploy', async (req, res) => {
  const { environment, version } = req.body;
  exec(`claude -p "Deploy version ${version} to ${environment}. Run smoke tests." \
    --output-format json \
    --max-turns 30`);
  res.json({ status: 'deploying' });
});
```

### 3.4 LaunchDarkly Dynamic Context

The [LaunchDarkly SessionStart hook](https://github.com/launchdarkly-labs/claude-code-session-start-hook)
dynamically injects context based on repository characteristics using feature
flags. Different repositories receive different instructions without manual
configuration -- React best practices for one team, Python standards for another,
all through LaunchDarkly targeting rules evaluated at session start.

---

## 4. Self-Improving Agent Architecture

### 4.1 Claudeception: Autonomous Skill Extraction

[Claudeception](https://github.com/blader/Claudeception) is the canonical
implementation of self-improving via skill extraction.

**Architecture:**

```
UserPromptSubmit hook
       |
       v
  Injects reminder: "Evaluate if current task produced extractable knowledge"
       |
       v
  Claude evaluates against criteria:
    - Reusable? (will help future tasks)
    - Non-trivial? (required discovery, not docs)
    - Specific? (clear trigger conditions)
    - Verified? (solution actually works)
       |
       v
  If criteria met: Write SKILL.md to .claude/skills/{name}/
```

**Extraction Template:**

```markdown
---
name: [descriptive-kebab-case]
description: |
  [Precise description: (1) use cases, (2) trigger conditions
  like exact error messages, (3) what problem this solves]
author: Claude Code
version: 1.0.0
date: YYYY-MM-DD
---

# Skill Name

## Problem
[Clear description]

## Context / Trigger Conditions
[When to use, including exact error messages or symptoms]

## Solution
[Step-by-step instructions]

## Verification
[How to confirm it worked]

## Notes
[Caveats, edge cases]
```

**Automatic Triggers:**
- Debugging requiring >10 minutes investigation
- Misleading error messages with non-obvious root causes
- Workarounds for tool/framework limitations
- Trial-and-error success paths

**Anti-Patterns:**
- Over-extraction of mundane solutions
- Vague descriptions lacking trigger conditions
- Unverified solutions
- Duplicating official documentation

### 4.2 Skill Auto-Activation via Hooks

The [paddo.dev analysis](https://paddo.dev/blog/claude-skills-hooks-solution/)
identifies the core activation problem: skills remain dormant because Claude
does not recognize their relevance via semantic matching alone.

**Solution:** UserPromptSubmit hook checks open files against a `skill-rules.json`
configuration mapping file patterns to skills:

```json
{
  "rules": [
    {
      "pattern": "src/**/*.ts",
      "skills": ["backend-guidelines", "typescript-patterns"]
    },
    {
      "pattern": "*.test.*",
      "skills": ["testing-best-practices"]
    }
  ]
}
```

**Assessment:** Effective for directory-mapped codebases with clean
domain boundaries. Does not solve workflow orchestration (forcing/preventing
activation based on intent rather than file context).

The [umputun gist](https://gist.github.com/umputun/570c77f8d5f3ab621498e1449d2b98b6)
provides a mandatory skill activation hook that ensures specific skills are
always loaded, regardless of matching.

### 4.3 everything-claude-code: Instinct-Based Learning

The [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
(42.9K stars) project implements a 4-layer self-improving architecture using
hooks as the observation layer.

**Hook Implementations:**

| Hook | Script | Purpose |
|------|--------|---------|
| SessionStart | `session-start.js` | Load previous context, detect package manager |
| SessionEnd | `session-end.js` | Persist session state |
| PreCompact | `pre-compact.js` | Save state before compaction |
| PostToolUse (Write/Edit) | inline | Auto-format with Prettier, TypeScript check |
| PostToolUse (mcp__github__create_pull_request) | inline | Log PR URLs, provide review commands |
| Stop | inline | Check for console.log in modified files |
| SessionEnd | `evaluate-session.js` | Extract patterns from session |

**Instinct Model:**

- Atomic behaviors with 0.3-0.9 confidence scores
- Domain-tagged (frontend, backend, devops, etc.)
- Evidence-backed (linked to specific discoveries)
- CLI commands: `/instinct-status`, `/instinct-import`, `/instinct-export`, `/evolve`

**Key insight from ECC:**

> "Hooks > Skills for observation: hooks fire 100% deterministically,
> skills fire ~50-80% probabilistically."

This makes hooks the reliable foundation for continuous learning systems.

### 4.4 Claude Reflect System

The [claude-reflect-system](https://github.com/haddock-development/claude-reflect-system)
implements correction-based learning with three signal types:

| Signal | Confidence | Example | Storage |
|--------|-----------|---------|---------|
| Corrections | HIGH | "use X instead of Y" | Critical Corrections section |
| Approvals | MEDIUM | "exactly right" | Best Practices section |
| Observations | LOW | "have you considered?" | Considerations section |

**Learning Flow:**
1. **Detection**: Pattern matching identifies correction signals in conversation
2. **Analysis**: Classify by confidence level
3. **Application**: Update skill YAML frontmatter + sections with timestamped backups
4. **Safety**: Interactive review flow, YAML validation, immediate rollback capability

Two modes: Manual (`/reflect` after sessions) or Auto (SessionEnd hook).

### 4.5 Self-Improving Agent Patterns (Addy Osmani)

From [Self-Improving Coding Agents](https://addyosmani.com/blog/self-improving-agents/):

**The "Ralph Wiggum" Cycle:**
1. Pick next incomplete task
2. Implement feature/fix
3. Run validation (tests, type checks)
4. Commit if checks pass
5. Update task status and learnings (AGENTS.md)
6. Reset agent context and repeat

**Multi-Channel Persistence:**
1. **Git history** -- code diffs + commit messages
2. **Progress logs** -- chronological task attempt records
3. **Task state files** -- JSON tracking completion (prd.json)
4. **Semantic knowledge** -- AGENTS.md capturing wisdom + conventions

**Compound Loop Orchestration:**
Analysis loops (identify priorities) -> Planning loops (generate specs) ->
Execution loops (implement code). Agents determine *what* to build alongside
*how* to build it.

**Risk Mitigation:**
- Run on feature branches, never main
- Whitelist safe operations (read-only auto-approve)
- Sandbox in containers/VMs
- Periodic fresh planning to prevent drift
- PR review as final human QA gate

---

## 5. Observability & Monitoring

### 5.1 OpenTelemetry Stack

Claude Code supports OpenTelemetry natively. The
[claude-code-otel](https://github.com/ColeMurray/claude-code-otel) project
provides a complete observability stack:

```
Claude Code --> OTel Collector --> Prometheus (metrics) + Loki (logs) --> Grafana
```

**Environment setup:**
```bash
CLAUDE_CODE_ENABLE_TELEMETRY=1
OTEL_METRICS_EXPORTER=otlp
OTEL_LOGS_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

**Dashboard sections:**
- Overview: active sessions, total costs, token usage, code changes
- Cost & Usage: per-model spending trends, API request counts, token efficiency
- Tool Performance: usage frequency, success rates, bottlenecks
- Performance & Errors: API latency by model, error rates
- User Activity: code changes, commits, PRs, productivity metrics
- Event Logs: real-time tool execution and error investigation

### 5.2 Hook-Based Multi-Agent Observability

The [claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)
system provides real-time monitoring via:

```
Claude Agents --> Hook Scripts --> HTTP POST --> Bun Server --> SQLite --> WebSocket --> Vue Client
```

**Features:**
- 12 hook event types tracked with dedicated emojis
- Multi-session tracking with color-coded visualization
- Live pulse chart with session-specific colors
- Chat transcript viewer with syntax highlighting
- Filtering by app, session, and event type

All 12 hooks are intercepted via Python scripts using Astral uv, with each event
forwarded to a central server that broadcasts via WebSocket to a Vue dashboard.

### 5.3 Cost Tracking Tools

| Tool | Approach | Key Feature |
|------|----------|-------------|
| `/cost` command | Built-in | Session token stats |
| [ccusage](https://github.com/ryoppippi/ccusage) | Local JSONL analysis | 5-hour billing window blocks |
| [Claude-Code-Usage-Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) | Real-time CLI | Consumption prediction |
| [claude-code-otel](https://github.com/ColeMurray/claude-code-otel) | OTel + Grafana | Full dashboard |
| [Datadog AI Agents Console](https://www.datadoghq.com/blog/claude-code-monitoring/) | Enterprise | Organization-wide tracking |
| [Dev-Agent-Lens](https://arize.com/blog/claude-code-observability-and-tracing-introducing-dev-agent-lens/) | Proxy-based | LiteLLM + Arize AX tracing |

---

## 6. Inter-Agent Communication

### 6.1 HCOM (Hook Communications)

[HCOM](https://github.com/aannoo/hcom) enables real-time messaging between
Claude Code instances (also supports Gemini CLI and Codex).

**Architecture:**
```
Agents --> Hooks --> SQLite Event Bus --> Hooks --> Other Agents
```

**Key capabilities:**
- **Structured messaging**: Direct messages with intent types (request/inform/ack)
- **Broadcast**: Send to all agents
- **Thread grouping**: Related messages grouped
- **Collision detection**: Alert when 2 agents edit the same file within 20 seconds
- **Event subscriptions**: Agents subscribe to patterns (git commits, file ops, status)
- **Cross-device**: HuggingFace Space relay for remote agents

**Pre-built workflows:**
- **clone**: Fork current agent with new task; result returns via message
- **watcher**: Background reviewer subscribes to agent work
- **confess**: Honesty self-evaluation
- **debate**: Structured multi-agent debate

**Installation:**
```bash
pip install hcom
hcom claude  # Launch with hcom wrapper
```

### 6.2 Agent Teams Built-in Communication

Claude Code's native Agent Teams feature (experimental since Feb 6, 2026) provides
structured inter-agent communication via `SendMessage` tool. HCOM provides an
alternative for scenarios where:
- You need cross-tool communication (Claude + Gemini + Codex)
- You want event-driven rather than message-driven coordination
- You need subscription-based filtering

---

## 7. Performance Considerations

### 7.1 Hook Execution Overhead

| Hook Type | Overhead | When to Worry |
|-----------|----------|---------------|
| `command` (simple) | <100ms | Never |
| `command` (shell script) | 100-500ms | If running on every tool call |
| `command` (npm/node) | 500-2000ms | Cold start penalty; keep SessionStart fast |
| `prompt` | 1-5s | Model inference time; use for infrequent events |
| `agent` | 5-120s | Multiple tool-use turns; only for Stop/completion gates |
| `async` | 0ms blocking | Background process; no impact on main thread |

### 7.2 Best Practices

1. **Keep SessionStart fast**: Runs every session (including after compaction).
   Move heavy operations to Setup hooks (`--init` flag)

2. **Use matchers aggressively**: `Edit|Write` instead of `*` prevents running
   formatting hooks on Read/Grep/Glob calls

3. **Prevent infinite Stop loops**: Always check `stop_hook_active` field:
   ```bash
   if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
     exit 0  # Allow Claude to stop
   fi
   ```

4. **Use async for non-blocking tasks**: Test suites, linting, and deployment
   verification can run in background with `"async": true`

5. **Cache expensive computations**: For hooks that run frequently (PostToolUse),
   cache results and check timestamps before re-running

6. **Shell profile interference**: If JSON parsing fails, wrap echo statements
   in shell profiles with interactive-only guards:
   ```bash
   if [[ $- == *i* ]]; then
     echo "Shell ready"  # Only in interactive shells
   fi
   ```

### 7.3 Hook Debugging

```bash
# Verbose mode: Ctrl+O in Claude Code to see hook output
# Debug mode: full execution details
claude --debug

# Manual testing: pipe sample JSON to your hook
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
echo $?  # Check exit code
```

---

## 8. Recommendations for MMOS

Based on the research findings, here are specific recommendations for the MMOS
project's hook and automation strategy.

### 8.1 Immediate Wins (implement now)

**R1. Project-level auto-format hook:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\" <<< \"$(cat)\"); if [[ \"$FILE\" == *.ts || \"$FILE\" == *.tsx || \"$FILE\" == *.js || \"$FILE\" == *.jsx ]]; then npx prettier --write \"$FILE\" 2>/dev/null; fi; exit 0'"
          }
        ]
      }
    ]
  }
}
```

Rationale: MMOS already has Prettier configured. This hook enforces it
deterministically on every edit without relying on Claude to remember.

**R2. PreCompact transcript backup:**
Add the Python backup script (Category C4 above) to `.claude/hooks/`. This
prevents knowledge loss during long sessions that trigger auto-compaction.

**R3. Desktop notifications (macOS):**
Add Notification hook for `permission_prompt` and `idle_prompt` to
`~/.claude/settings.json`. Enables effective monitoring of parallel sessions.

### 8.2 Medium-Term (next sprint)

**R4. SQL governance enforcement via hooks:**
The existing `sql-governance.py` hook (already in `.claude/hooks/`) is the right
pattern. Verify it covers all PreToolUse events for Bash commands containing
SQL keywords.

**R5. Agent-based quality gate for Agent Teams:**
When using Agent Teams for MMOS pipeline, add a TaskCompleted hook that runs
`npm test` and `npm run typecheck` before allowing task completion. This
ensures each teammate's work passes CI gates.

**R6. Claudeception-style skill extraction:**
Install Claudeception's UserPromptSubmit hook to gradually build project-specific
skills from debugging sessions. Focus extraction on MMOS pipeline patterns,
Supabase gotchas, and squad-specific knowledge.

### 8.3 Long-Term (architecture)

**R7. Multi-agent observability:**
Deploy the OTel stack (claude-code-otel) for production monitoring of:
- Token costs per agent/session
- Tool usage patterns
- Error rates and bottlenecks
- Session duration and productivity metrics

**R8. Scheduled Claude Code runs:**
Use GitHub Actions + Claude Code Action for:
- Daily dependency audits
- Weekly security reviews via `/review` skill
- PR-triggered code reviews with `@claude` mentions

**R9. Self-improving knowledge base:**
Combine Claudeception (skill extraction) + Reflect System (correction learning)
+ everything-claude-code instincts (observation) into a unified learning
pipeline:

```
Hooks (observe) --> Claudeception (extract skills) -->
Reflect (learn from corrections) --> Instincts (evolve patterns)
```

This creates compound improvement where each session makes the system smarter.

---

## 9. Sources

### Official Documentation
- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Automate workflows with hooks - Claude Code Docs](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code GitHub Actions - Claude Code Docs](https://code.claude.com/docs/en/github-actions)
- [Manage costs effectively - Claude Code Docs](https://code.claude.com/docs/en/costs)

### Comprehensive Guides
- [Claude Code Hooks: 20+ Ready-to-Use Examples (2026) - DEV Community](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg)
- [Claude Code Session Hooks: Auto-Load Context - claudefa.st](https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks)
- [Skills Auto-Activation via Hooks - paddo.dev](https://paddo.dev/blog/claude-skills-hooks-solution/)
- [Claude Code Hooks: Practical Guide - DataCamp](https://www.datacamp.com/tutorial/claude-code-hooks)

### GitHub Repositories
- [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) -- UV single-file scripts, 13 events, TTS integration
- [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) -- Real-time monitoring dashboard
- [blader/Claudeception](https://github.com/blader/Claudeception) -- Autonomous skill extraction
- [haddock-development/claude-reflect-system](https://github.com/haddock-development/claude-reflect-system) -- Correction-based learning
- [severity1/claude-code-prompt-improver](https://github.com/severity1/claude-code-prompt-improver) -- Prompt quality gate
- [mvara-ai/precompact-hook](https://github.com/mvara-ai/precompact-hook) -- LLM-interpreted recovery summaries
- [jshchnz/claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler) -- Task scheduling plugin
- [karanb192/claude-code-hooks](https://github.com/karanb192/claude-code-hooks) -- Safety-focused hook collection (262 tests)
- [johnlindquist/claude-hooks](https://github.com/johnlindquist/claude-hooks) -- TypeScript-powered hook system
- [ColeMurray/claude-code-otel](https://github.com/ColeMurray/claude-code-otel) -- OTel + Grafana observability
- [aannoo/hcom](https://github.com/aannoo/hcom) -- Inter-agent real-time messaging
- [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) -- 42.9K stars, instinct-based learning
- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) -- Official GitHub Action
- [launchdarkly-labs/claude-code-session-start-hook](https://github.com/launchdarkly-labs/claude-code-session-start-hook) -- Dynamic context via feature flags
- [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) -- Comprehensive project configuration
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) -- Curated resource list

### Articles & Analysis
- [Self-Improving Coding Agents - Addy Osmani](https://addyosmani.com/blog/self-improving-agents/)
- [Anti-Sycophancy UserPromptSubmit Hook - ljw1004](https://gist.github.com/ljw1004/34b58090c16ee6d5e6f13fce07463a31)
- [Mandatory Skill Activation Hook - umputun](https://gist.github.com/umputun/570c77f8d5f3ab621498e1449d2b98b6)

### Monitoring & Observability
- [Claude Code + OpenTelemetry - SigNoz](https://signoz.io/blog/claude-code-monitoring-with-opentelemetry/)
- [Claude Code + Grafana - Quesma](https://quesma.com/blog/track-claude-code-usage-and-limits-with-grafana-cloud/)
- [Dev-Agent-Lens - Arize](https://arize.com/blog/claude-code-observability-and-tracing-introducing-dev-agent-lens/)
- [Claude Code Monitoring - Datadog](https://www.datadoghq.com/blog/claude-code-monitoring/)

---

## Gaps & Future Research

1. **Hook performance benchmarks**: No published data on actual latency impact
   of hook chains (e.g., 5+ hooks on PostToolUse). Need empirical testing.

2. **Hook composition patterns**: How to manage 20+ hooks without conflicts.
   No established patterns for hook dependency management or ordering.

3. **Agent hook cost tracking**: Agent-based hooks (`type: "agent"`) consume
   tokens for the subagent. No tooling exists to track hook-specific token costs
   separately from main session costs.

4. **Cross-project hook sharing**: Beyond plugins, no standardized way to share
   hook configurations across teams/projects. Plugin system is still young.

5. **Hook testing frameworks**: Only karanb192/claude-code-hooks has a test suite
   (262 tests). Most hook implementations are untested bash scripts.

6. **Windows hook ecosystem**: Most examples are macOS/Linux. Windows PowerShell
   hooks are underdeveloped in the community.

7. **Hooks + Agent SDK integration**: How hooks in the CLI map to the Agent SDK's
   callback-based hook system. No bridging documentation exists.
