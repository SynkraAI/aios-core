# Wave 3: Gap Analysis -- What Waves 1-2 Missed

> Deep research into 8 gap areas identified after reviewing all Wave 1 and Wave 2 reports.
> Date: 2026-02-09
> Sources consulted: 35+ unique URLs, 20+ pages deep-read
> Focus: CI/CD, hooks deep-dive, plugins, cost management, debugging, recent releases, edge cases, security

---

## TL;DR

1. **GitHub Actions + Claude Code**: The `claude-code-action@v1` (GA release) supports 4 auth methods (Anthropic API, OAuth, Bedrock OIDC, Vertex OIDC), auto-detects interactive vs automation mode, supports structured JSON outputs for CI pipelines, and integrates with skills/plugins. Configuration via unified `prompt` + `claude_args` inputs.
2. **Hooks Deep-Dive**: 14 hook events total (not 12 as previously documented). Complete stdin JSON schemas, 3 handler types (command/prompt/agent), async background hooks, `$CLAUDE_ENV_FILE` for env persistence, and `updatedInput` for tool input modification. PreToolUse has the richest decision control: allow/deny/ask + input modification.
3. **Plugin System**: Git-based distribution via marketplace repos. Official directory at `anthropics/claude-plugins-official`. Community tools: `claude-tools` (paddo.dev), `skills.sh` (339+ skills), `claude-plugins.dev`, `skillsmp.com`. Plugin hooks use `${CLAUDE_PLUGIN_ROOT}` for path resolution.
4. **Cost Management**: Average $6/dev/day ($100-200/mo). Agent teams use ~7x more tokens than solo sessions. SDK provides `total_cost_usd` and per-model `modelUsage` breakdown. Budget control via `maxBudgetUsd` (SDK) and workspace limits (Console). Real-world horror story: 887K tokens/minute with runaway subagents.
5. **Debugging Multi-Agent**: `disler/claude-code-hooks-multi-agent-observability` provides real-time dashboard (Bun + SQLite + Vue). Architecture: hooks -> HTTP POST -> SQLite -> WebSocket -> live dashboard. Also: `claude --debug`, `Ctrl+O` verbose mode, `agent_transcript_path` in SubagentStop, `ColeMurray/claude-code-otel` for OpenTelemetry.
6. **Recent Releases (Feb 2026)**: v2.1.30-v2.1.37. Key additions: PDF page ranges, `/debug` command, fast mode for Opus 4.6, agent teams GA, memory auto-record, 1M token context (beta), `--resume` memory usage improved 68%, sandbox security patch, skill budget scales to 2% of context.
7. **Edge Cases**: No file locking between teammates (last write wins). Context compaction loses nuance. 1M context beta helps but costs 2x at >200K tokens. Tool Search reduces MCP bloat by 46.9%. `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` for early compaction. Git worktree isolation (claude-squad pattern) is the proven solution for file conflicts.
8. **Security**: OS-level sandboxing via macOS Seatbelt / Linux bubblewrap. Reduces permission prompts by 84%. Two modes: auto-allow (sandboxed commands run freely) and regular permissions. Filesystem + network isolation. `excludedCommands` for incompatible tools. `allowUnsandboxedCommands: false` to disable escape hatch. Open-source sandbox runtime: `@anthropic-ai/sandbox-runtime`.

---

## 1. GitHub Actions + Claude Code (claude-code-action)

### 1.1 Architecture

`claude-code-action` is an official GitHub Action built on top of the Claude Agent SDK. It auto-detects two modes:

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Interactive** | `@claude` mention in PR/issue comment | Responds to user request in context |
| **Automation** | `prompt` parameter provided, no mention | Runs immediately with provided instructions |

No `mode` parameter needed in v1 (was required in beta).

### 1.2 Authentication Methods

| Method | Input | Use Case |
|--------|-------|----------|
| **Anthropic API** | `anthropic_api_key` secret | Direct API access |
| **OAuth Token** | `claude_code_oauth_token` | Alternative to API key |
| **AWS Bedrock** | `use_bedrock: true` + OIDC role | Enterprise AWS environments |
| **Google Vertex AI** | `use_vertex: true` + Workload Identity | Enterprise GCP environments |

Bedrock and Vertex use OIDC -- no static credentials stored in GitHub.

### 1.3 Complete Input Reference

| Parameter | Description |
|-----------|-------------|
| `prompt` | Instructions (text or skill like `/review`) |
| `claude_args` | CLI arguments: `--max-turns`, `--model`, `--allowedTools`, `--mcp-config`, `--system-prompt`, `--json-schema` |
| `trigger_phrase` | Custom trigger (default: `@claude`) |
| `assignee_trigger` | Trigger on specific issue assignee |
| `label_trigger` | Trigger on specific label |
| `use_bedrock` / `use_vertex` | Cloud provider flags |
| `settings` | JSON string or file path for Claude Code settings |
| `plugin_marketplaces` | Newline-separated marketplace Git URLs |
| `plugins` | Newline-separated plugin names to install |
| `track_progress` | Force progress tracking comments |
| `include_fix_links` | Include "Fix this" links in PR reviews |
| `use_sticky_comment` | Single comment for PR feedback (updates in place) |
| `branch_prefix` | Prefix for Claude-created branches (default: `claude/`) |
| `use_commit_signing` | Enable commit signing via GitHub API |
| `additional_permissions` | Extra permissions (e.g., `actions: read`) |
| `allowed_bots` | Comma-separated bot usernames or `*` |
| `structured_output` | Action output field when using `--json-schema` |

### 1.4 Structured Outputs for CI Pipelines

The action supports JSON schema validation for machine-readable outputs:

```yaml
- name: Analyze
  id: analyze
  uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Check CI logs for flaky tests."
    claude_args: |
      --json-schema '{"type":"object","properties":{"is_flaky":{"type":"boolean"},"confidence":{"type":"number"}},"required":["is_flaky"]}'

- name: Retry if flaky
  if: fromJSON(steps.analyze.outputs.structured_output).is_flaky == true
  run: gh workflow run CI
```

This enables Claude as a **decision node** in CI pipelines -- not just a commenter.

### 1.5 Workflow Patterns

| Pattern | Trigger | Example |
|---------|---------|---------|
| **Interactive PR review** | `@claude` in PR comment | User asks for security review |
| **Auto-review on open** | `pull_request: [opened]` | Every PR gets automated review |
| **Scheduled maintenance** | `schedule: cron` | Daily dependency audit, doc sync |
| **Issue-to-PR** | `issues: [opened, assigned]` | Claude implements issue as PR |
| **Label-triggered** | `label_trigger: "claude"` | Add label to trigger Claude |
| **Structured analysis** | `--json-schema` | CI decision node with typed output |

### 1.6 Skills and Plugins in CI

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "/review"  # Invokes a skill
    plugins: |
      code-review@claude-code-plugins
    plugin_marketplaces: |
      https://github.com/org/custom-marketplace.git
```

Skills load from the repo's `.claude/skills/` and any installed plugins.

> Sources: [Claude Code GitHub Actions Docs](https://code.claude.com/docs/en/github-actions), [claude-code-action Usage](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md), [GitHub Marketplace](https://github.com/marketplace/actions/claude-code-action-official)

---

## 2. Hooks System -- Complete Reference

### 2.1 All 14 Hook Events

| # | Event | When | Can Block? | Matcher Support |
|---|-------|------|-----------|-----------------|
| 1 | `SessionStart` | Session begins/resumes | No | `startup`, `resume`, `clear`, `compact` |
| 2 | `UserPromptSubmit` | User submits prompt | Yes | No (always fires) |
| 3 | `PreToolUse` | Before tool executes | Yes (allow/deny/ask) | Tool name regex |
| 4 | `PermissionRequest` | Permission dialog shown | Yes (allow/deny) | Tool name regex |
| 5 | `PostToolUse` | After tool succeeds | No (feedback only) | Tool name regex |
| 6 | `PostToolUseFailure` | After tool fails | No (feedback only) | Tool name regex |
| 7 | `Notification` | Claude sends notification | No | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` |
| 8 | `SubagentStart` | Subagent spawns | No (can inject context) | Agent type name |
| 9 | `SubagentStop` | Subagent completes | Yes | Agent type name |
| 10 | `Stop` | Main agent finishes | Yes | No (always fires) |
| 11 | `TeammateIdle` | Teammate going idle | Yes (exit code 2 only) | No (always fires) |
| 12 | `TaskCompleted` | Task marked done | Yes (exit code 2 only) | No (always fires) |
| 13 | `PreCompact` | Before compaction | No | `manual`, `auto` |
| 14 | `SessionEnd` | Session terminates | No | `clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` |

**Previously underdocumented in Waves 1-2**: `PermissionRequest`, `PostToolUseFailure`, `Notification`, `PreCompact`, and `SessionEnd` were mentioned but their input schemas and decision control were not detailed.

### 2.2 Three Handler Types

| Type | Description | Timeout Default | Async Support |
|------|-------------|-----------------|---------------|
| `command` | Shell script, JSON on stdin | 600s (10 min) | Yes |
| `prompt` | Single-turn LLM evaluation | 30s | No |
| `agent` | Multi-turn subagent with tools | 60s | No |

### 2.3 Common Input Fields (All Events)

Every hook receives via stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default|plan|acceptEdits|dontAsk|bypassPermissions",
  "hook_event_name": "PreToolUse"
}
```

Plus event-specific fields documented per event.

### 2.4 Exit Code Semantics

| Code | Meaning | JSON Processing |
|------|---------|-----------------|
| **0** | Success, proceed | stdout parsed as JSON |
| **2** | Blocking error | stderr fed back to Claude; stdout/JSON ignored |
| **Other** | Non-blocking error | stderr shown in verbose mode; execution continues |

### 2.5 Decision Control Patterns

Three distinct decision patterns:

**Pattern A: Top-level decision** (UserPromptSubmit, PostToolUse, PostToolUseFailure, Stop, SubagentStop):
```json
{ "decision": "block", "reason": "Test suite must pass" }
```

**Pattern B: hookSpecificOutput** (PreToolUse):
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Reason text",
    "updatedInput": { "command": "modified command" },
    "additionalContext": "Extra context for Claude"
  }
}
```

**Pattern C: Exit code only** (TeammateIdle, TaskCompleted):
- Exit 2 + stderr message = blocks the action

### 2.6 PreToolUse Input Schemas (Per Tool)

| Tool | Key Fields |
|------|-----------|
| **Bash** | `command`, `description`, `timeout`, `run_in_background` |
| **Write** | `file_path`, `content` |
| **Edit** | `file_path`, `old_string`, `new_string`, `replace_all` |
| **Read** | `file_path`, `offset`, `limit` |
| **Glob** | `pattern`, `path` |
| **Grep** | `pattern`, `path`, `glob`, `output_mode`, `-i`, `multiline` |
| **WebFetch** | `url`, `prompt` |
| **WebSearch** | `query`, `allowed_domains`, `blocked_domains` |
| **Task** | `prompt`, `description`, `subagent_type`, `model` |

### 2.7 Advanced Hook Features

**Async hooks** (`async: true`): Run in background, cannot block. Output delivered on next turn.

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "./scripts/run-tests.sh",
        "async": true,
        "timeout": 120
      }]
    }]
  }
}
```

**Environment persistence** (SessionStart only): Write `export` statements to `$CLAUDE_ENV_FILE` to set env vars for subsequent Bash commands.

**MCP tool matching**: Pattern `mcp__<server>__<tool>`. Example: `mcp__memory__.*` matches all memory server tools.

**Tool input modification** (PreToolUse): `updatedInput` can rewrite tool parameters before execution. Combine with `permissionDecision: "allow"` to auto-approve modified input.

**Hook snapshots**: Settings are captured at startup. Mid-session changes require review via `/hooks` menu.

**Once flag** (`once: true`): Skills-only. Runs once per session then removed.

> Sources: [Hooks Reference](https://code.claude.com/docs/en/hooks), [Hooks Guide](https://code.claude.com/docs/en/hooks-guide), [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)

---

## 3. Plugin System -- Distribution and Marketplace

### 3.1 Plugin Architecture

Plugins bundle multiple extension types:

```
my-plugin/
+-- .claude-plugin/
|   +-- plugin.json          # Component declarations
|   +-- marketplace.json     # Marketplace metadata
+-- skills/
|   +-- my-skill/SKILL.md
+-- agents/
|   +-- my-agent.md
+-- hooks/
|   +-- hooks.json           # Plugin-scoped hooks
+-- README.md
```

Plugin hooks use `${CLAUDE_PLUGIN_ROOT}` for portable path references.

### 3.2 Distribution Mechanisms

| Mechanism | How | Who |
|-----------|-----|-----|
| **Official marketplace** | Auto-available on startup | `anthropics/claude-plugins-official` |
| **Third-party marketplaces** | `/plugin marketplace add <org>/<repo>` | Any GitHub repo |
| **Direct install** | `/plugin install <name>@<marketplace>` | Users |
| **Settings** | `plugin_marketplaces` in settings.json | Admins |

### 3.3 Community Marketplaces

| Platform | URL | Features |
|----------|-----|----------|
| **skills.sh** (Vercel) | [skills.sh](https://skills.sh) | 339+ skills, `npx skills add` CLI, leaderboard |
| **claude-plugins.dev** | [claude-plugins.dev](https://claude-plugins.dev/) | Community registry with CLI |
| **SkillsMP** | [skillsmp.com](https://skillsmp.com/) | Third-party marketplace |
| **claude-tools** (paddo.dev) | [paddo.dev](https://paddo.dev/blog/claude-tools-plugin-marketplace/) | External capability plugins |
| **dashed/claude-marketplace** | GitHub | Local personal marketplace |

### 3.4 Publishing Workflow

1. Create plugin structure with `.claude-plugin/plugin.json`
2. Add skills, agents, hooks as needed
3. Push to Git repository
4. Register repo as marketplace or submit to `anthropics/claude-plugins-official`
5. Community tools like `marketplace-sync` automate packaging and publishing

### 3.5 Plugin Namespacing

Plugin skills use `plugin-name:skill-name` namespace to avoid conflicts. Plugin hooks merge with user/project hooks at runtime. Plugin hooks are read-only in the `/hooks` menu.

> Sources: [Discover Plugins](https://code.claude.com/docs/en/discover-plugins), [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official), [paddo.dev](https://paddo.dev/blog/claude-tools-plugin-marketplace/)

---

## 4. Cost Management -- Real-World Data

### 4.1 Baseline Costs

| Configuration | Cost | Tokens |
|---------------|------|--------|
| Average developer/day | $6 | ~200k/session |
| 90th percentile/day | <$12 | -- |
| Monthly/developer (Sonnet) | $100-200 | Varies |
| 3 subagents | ~$15-20/session | ~440k |
| 3-person team | ~$25-40/session | ~800k |
| Agent teams (plan mode) | ~7x solo session | Each teammate has own context |

### 4.2 Horror Story: Subagent Cost Explosion

One developer burned through **887,000 tokens per minute** during a 2.5-hour session with runaway subagents. Enterprise teams report subagent costs **300-500% higher than expected** due to parallel context windows.

### 4.3 Budget Controls

| Level | Mechanism | How |
|-------|-----------|-----|
| **SDK** | `maxBudgetUsd` | Hard budget cap per query |
| **Console** | Workspace spend limits | Org-level spending cap |
| **Rate limits** | TPM/RPM per org | 5-hour rolling window |
| **Model routing** | Haiku/Sonnet/Opus mix | 50-80% cost reduction |
| **Context management** | `/clear`, `/compact` | Reduce per-message cost |

### 4.4 SDK Cost Tracking

The Agent SDK provides authoritative cost data:

```typescript
const result = await query({ prompt: "..." });

// Authoritative total
console.log(result.usage.total_cost_usd);

// Per-model breakdown
for (const [model, usage] of Object.entries(result.modelUsage)) {
  console.log(`${model}: $${usage.costUSD.toFixed(4)}`);
  console.log(`  Input: ${usage.inputTokens}, Output: ${usage.outputTokens}`);
  console.log(`  Cache read: ${usage.cacheReadInputTokens}`);
}
```

Key rules:
- Same message ID = same usage (deduplicate by ID)
- Charge once per step, not per message
- `total_cost_usd` in result message is authoritative
- `modelUsage` provides per-model breakdown for billing

### 4.5 Rate Limit Recommendations by Team Size

| Team Size | TPM/User | RPM/User |
|-----------|----------|----------|
| 1-5 | 200-300k | 5-7 |
| 5-20 | 100-150k | 2.5-3.5 |
| 20-50 | 50-75k | 1.25-1.75 |
| 50-100 | 25-35k | 0.62-0.87 |
| 100-500 | 15-20k | 0.37-0.47 |
| 500+ | 10-15k | 0.25-0.35 |

### 4.6 Cost Optimization Strategies

1. **Model mixing**: Haiku for subagents ($0.80/M vs $15/M for Opus), Sonnet for implementation, Opus only for planning
2. **Delegate verbose ops to subagents**: Verbose output stays in subagent context, only summary returns
3. **Move instructions from CLAUDE.md to skills**: Skills load on-demand; CLAUDE.md is always loaded
4. **Filter test output via hooks**: PreToolUse hook that pipes test output through `grep -A 5 'FAIL|ERROR' | head -100`
5. **Tool Search for MCP**: Automatic when tools exceed 10% of context (46.9% token reduction)
6. **Lower extended thinking**: `MAX_THINKING_TOKENS=8000` for simple tasks (default is 31,999)
7. **Clean up teams promptly**: Active teammates consume tokens even when idle
8. **Use `/clear` between tasks**: Stale context wastes tokens on every subsequent message

### 4.7 Third-Party Cost Tracking

- **LiteLLM**: Open-source proxy for spend-per-key tracking (used by several enterprises for Bedrock/Vertex)
- **ColeMurray/claude-code-otel**: OpenTelemetry-based observability for Claude Code cost and performance
- **`/cost` command**: Real-time session cost display (API users only)
- **`/stats` command**: Usage patterns for subscribers

> Sources: [Manage Costs](https://code.claude.com/docs/en/costs), [SDK Cost Tracking](https://platform.claude.com/docs/en/agent-sdk/cost-tracking), [aicosts.ai](https://www.aicosts.ai/blog/claude-code-subagent-cost-explosion-887k-tokens-minute-crisis), [Faros AI](https://www.faros.ai/blog/claude-code-token-limits)

---

## 5. Debugging Multi-Agent Workflows

### 5.1 Built-in Debugging Tools

| Tool | How | What it Shows |
|------|-----|---------------|
| `claude --debug` | Launch flag | Hook execution, matching, exit codes, output |
| `Ctrl+O` | Toggle in session | Verbose mode showing hook progress |
| `/debug` | New in v2.1.30 | Claude helps troubleshoot current session |
| `Ctrl+T` | Toggle in teams | Task list with status for all teammates |
| `Shift+Up/Down` | In teams | Select and view teammate sessions |

### 5.2 Subagent Transcript Access

SubagentStop hook receives `agent_transcript_path`:

```json
{
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl"
}
```

Transcripts are JSONL format, one record per message. Stored independently from main conversation (survive compaction). Cleaned up based on `cleanupPeriodDays` (default: 30).

### 5.3 disler/claude-code-hooks-multi-agent-observability

Real-time monitoring dashboard for multi-agent Claude Code workflows.

**Architecture**: Claude Agents -> Hook Scripts (Python) -> HTTP POST -> Bun Server -> SQLite (WAL mode) -> WebSocket -> Vue 3 Client

**Tracks 12 event types** across all concurrent agents:
- Tool execution timing and results
- Agent lifecycle (spawn, stop, idle)
- User prompts and interactions
- Permission requests
- Context compaction events
- Session duration and termination

**Dashboard features**:
- Dual-color swim lanes: app colors + session colors
- Real-time WebSocket updates with auto-scroll
- Multi-criteria filtering (app, session, event type)
- Live pulse chart (canvas-based, 1m/3m/5m ranges)
- Chat transcript viewer with syntax highlighting
- Tool emoji system (Bash: terminal, Read: book, Write: pencil, MCP: plug prefix)

**Setup**: Copy `.claude` directory to project, update `settings.json` with `source-app` identifier, start server with `just start`, dashboard at `http://localhost:5173`.

### 5.4 ColeMurray/claude-code-otel

OpenTelemetry-based observability for Claude Code:
- Metrics: cost, tokens, session duration
- Events: tool usage, API requests
- Compatible with any OTLP-compatible backend (Grafana, Datadog, etc.)

### 5.5 Session Replay Patterns

**claude-flow** implements AgentDB for session replay:
- Records full sessions (actions, decisions, tool calls, results)
- Step-by-step replay of any session
- Diff two sessions to understand why one succeeded and another failed

**Native approach**: Read subagent transcripts from `~/.claude/projects/{project}/{session}/subagents/`:
```bash
# Search all subagent transcripts for errors
grep -r "error" ~/.claude/projects/my-project/*/subagents/ --include="*.jsonl"
```

### 5.6 Common Multi-Agent Debugging Scenarios

| Problem | Symptom | Solution |
|---------|---------|----------|
| **Teammate not claiming tasks** | Task stays `pending` | Check TaskList for blockedBy dependencies |
| **Teammates editing same file** | Inconsistent changes | Partition file ownership; use `blockedBy` |
| **Lead not receiving messages** | Teammate goes idle | Verify `SendMessage` with correct recipient |
| **Runaway token costs** | Rapid budget consumption | Set `maxBudgetUsd`, use `--max-turns` |
| **Context overflow** | Generic responses, forgotten decisions | Enable compaction, use `/clear` between tasks |
| **Hook not firing** | No debug output | Check matcher regex, verify settings.json path |

> Sources: [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability), [ColeMurray/claude-code-otel](https://github.com/ColeMurray/claude-code-otel), [Claude Code Troubleshooting](https://code.claude.com/docs/en/troubleshooting)

---

## 6. Recent Releases (February 2026)

### 6.1 Version Timeline

| Version | Date | Key Changes |
|---------|------|-------------|
| **v2.1.37** | Feb 8 | `/fast` accessible immediately after `/extra-usage` |
| **v2.1.36** | Feb 8 | Fast mode extended to Opus 4.6 |
| **v2.1.34** | Feb 7 | Agent teams crash fix; sandbox security patch (excluded commands could bypass Bash permissions) |
| **v2.1.33** | Feb 6 | **Major**: TeammateIdle/TaskCompleted hooks, `memory` frontmatter, Task(agent_type) restriction, plugin names in skill descriptions |
| **v2.1.32** | Feb 6 | **Opus 4.6 launch**: Agent teams (research preview), auto memory, skill budget 2% of context, `/summarize-from-here`, auto-load skills from `--add-dir` |
| **v2.1.31** | Feb 4 | Resume guidance on exit, IME support, PDF lockup fix, temperatureOverride fix |
| **v2.1.30** | Feb 3 | PDF page ranges, `/debug` command, OAuth for MCP servers, `--resume` 68% memory improvement |

### 6.2 Significant New Capabilities (Not in Waves 1-2)

**Fast Mode for Opus 4.6** (v2.1.36): Same model with faster output. Toggle with `/fast`. Does not switch to a different model.

**PDF Page Ranges** (v2.1.30): `Read` tool now accepts `pages: "1-5"` parameter. Large PDFs (>10 pages) return lightweight reference when `@` mentioned instead of being inlined.

**`/debug` Command** (v2.1.30): Claude helps troubleshoot the current session interactively.

**Auto Memory** (v2.1.32): Claude now automatically records and recalls memories as it works. No manual `#` prefix needed.

**Skill Budget Scaling** (v2.1.32): Dynamic skill description budget = 2% of context window size (was fixed at ~16K chars).

**`--resume` Memory Improvement** (v2.1.30): 68% reduction in memory usage for session resume via lightweight stat-based loading.

**Sandbox Security Patch** (v2.1.34): Fixed vulnerability where `excludedCommands` in sandbox settings could bypass Bash permission rules.

### 6.3 1M Token Context Window (Beta)

Available with Opus 4.6 (launched Feb 5, 2026):
- Access: Append `[1m]` to model name in Claude Code, or `context-1m-2025-08-07` beta header in API
- Requires: Usage tier 4 (API) or pay-as-you-go (Claude Code)
- Pricing: Standard up to 200K tokens; 2x premium rate above 200K ($10/$37.50 per million)
- NOT available on claude.ai (any plan) at launch

**Context Compaction API** (beta): Automatically summarizes older context when approaching the limit, enabling effectively infinite conversations.

> Sources: [Releasebot](https://releasebot.io/updates/anthropic/claude-code), [Claude Code Changelog](https://code.claude.com/docs/en/changelog), [Anthropic: Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6), [Claude Opus 4.6 1M Context](https://venturebeat.com/technology/anthropics-claude-opus-4-6-brings-1m-token-context-and-agent-teams-to-take)

---

## 7. Edge Cases and Recovery Patterns

### 7.1 File Conflict Between Agents

**Problem**: Two teammates edit the same file. Last write wins -- no merge, no lock.

**Solutions**:

| Strategy | How | When |
|----------|-----|------|
| **File ownership partitioning** | Each teammate owns specific files/directories | Always (best practice) |
| **Task dependency DAG** | `blockedBy` ensures sequential access | When shared files are unavoidable |
| **Git worktree isolation** | Each agent gets own worktree (claude-squad pattern) | Maximum isolation needed |
| **oh-my-claudecode file partitioning** | Ultrapilot mode assigns file ownership per agent | Parallel acceleration |

### 7.2 Context Window Overflow

**Symptoms**: Responses become generic, previous decisions forgotten, code quality degrades.

**Built-in Mitigations**:
- Auto-compaction at ~95% capacity (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
- Session Memory writes summaries in background (recoverable after compaction)
- `/compact` with custom instructions: `/compact Focus on code changes and API patterns`
- 1M context beta: 5x more room before compaction

**Tool Search** reduces MCP context bloat by 46.9% (51K -> 8.5K tokens). Auto-activates when MCP tools exceed 10% of context. Lower threshold: `ENABLE_TOOL_SEARCH=auto:5`.

**Compaction limitations**: Only compresses conversation history. Fixed overheads (CLAUDE.md, tool definitions, skills) remain. Nuanced context (trade-offs discussed, alternatives considered) may be lost.

### 7.3 Agent Conflicts (Competing Modifications)

**Problem**: Multiple agents generate conflicting solutions (e.g., both try to refactor the same function differently).

**Recovery patterns**:
1. **Plan-approve-execute**: Require plan approval before implementation
2. **Competing hypotheses**: Intentional -- agents debate, lead picks winner
3. **Partition by concern**: Security reviewer reads but doesn't write; implementer writes
4. **Sequential pipeline**: Agent A completes before Agent B starts (via `blockedBy`)

### 7.4 Runaway Agents

**Problem**: Agent enters infinite loop or spends hours on unproductive work.

**Controls**:
- `maxTurns`: Hard limit on agentic turns per subagent
- `maxBudgetUsd`: Budget cap in SDK
- `--max-turns`: CLI limit for GitHub Actions
- `timeout`: Per-hook timeout (default 600s for commands)
- `Stop` hooks: Evaluate completion criteria before allowing agent to stop
- Keyboard: `Escape` interrupts current turn; double-tap `Escape` rewinds

### 7.5 Lost Context After Compaction

**Problem**: Important context lost during auto-compaction.

**Mitigation**:
- `PreCompact` hook: Save critical state to files before compaction
- `/compact` with instructions: Tell Claude what to preserve
- Session Memory: Automatically writes summaries in background (survives compaction)
- `MEMORY.md`: Write important decisions there (always loaded)
- Skills: Move reference material to skills (loaded on-demand, not compacted)

### 7.6 MCP Server Connection Failures

**Problem**: MCP server crashes or becomes unresponsive mid-session.

**Recovery**:
- `/mcp` menu to check server status and restart
- MCP health checks improved in Feb 2026 releases
- `PostToolUseFailure` hook for MCP tools: log failures and provide corrective context
- Prefer CLI tools (gh, aws, gcloud) over MCP servers for reliability and lower token cost

> Sources: [eesel.ai Guide](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide), [Claude Code Troubleshooting](https://code.claude.com/docs/en/troubleshooting), [Context Recovery (Medium)](https://medium.com/coding-nexus/claude-code-context-recovery-stop-losing-progress-when-context-compacts-772830ee7863)

---

## 8. Security Considerations

### 8.1 Sandboxing Architecture

Claude Code uses **OS-level sandboxing** with two isolation boundaries:

| Boundary | Mechanism | Protection |
|----------|-----------|------------|
| **Filesystem** | macOS Seatbelt / Linux bubblewrap | Cannot modify files outside working directory |
| **Network** | Proxy server outside sandbox | Only approved domains accessible |

**Impact**: In internal testing, sandboxing reduces permission prompts by **84%**.

### 8.2 Sandbox Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **Auto-allow** | Sandboxed commands run without permission prompts | Maximum productivity |
| **Regular permissions** | All commands require approval, even when sandboxed | Maximum control |

Enable via `/sandbox` command or settings.json.

### 8.3 Filesystem Isolation Details

- **Default writes**: Read/write to CWD and subdirectories only
- **Default reads**: Read access to entire computer, except denied directories
- **Configurable**: Custom allowed/denied paths via settings
- **All child processes inherit** sandbox restrictions

### 8.4 Network Isolation Details

- Domain-based filtering (not IP-based)
- New domain requests trigger permission prompts
- Custom proxy support for enterprise: `sandbox.network.httpProxyPort` and `sandbox.network.socksProxyPort`
- Known limitation: Domain fronting can bypass (acknowledged in docs)

### 8.5 Configuration

```json
{
  "sandbox": {
    "mode": "auto-allow",
    "network": {
      "allowedDomains": ["registry.npmjs.org", "api.github.com"],
      "httpProxyPort": 8080,
      "socksProxyPort": 8081
    },
    "excludedCommands": ["docker", "watchman"],
    "allowUnsandboxedCommands": false,
    "allowUnixSockets": false,
    "enableWeakerNestedSandbox": false
  }
}
```

**`excludedCommands`**: Tools incompatible with sandbox (docker, watchman). These run outside sandbox through normal permission flow.

**`allowUnsandboxedCommands: false`**: Disables the escape hatch where Claude retries failed commands outside sandbox.

**`allowUnixSockets`**: DANGEROUS -- can grant access to Docker socket, effectively bypassing sandbox.

**`enableWeakerNestedSandbox`**: For Docker environments without privileged namespaces. "Considerably weakens security."

### 8.6 Open-Source Sandbox Runtime

The sandbox is available as a standalone npm package:

```bash
npx @anthropic-ai/sandbox-runtime <command-to-sandbox>
```

Can be used to sandbox MCP servers or any untrusted process.

Source: [GitHub - sandbox-runtime](https://github.com/anthropic-experimental/sandbox-runtime)

### 8.7 Agent Permission Isolation

| Mechanism | Scope | How |
|-----------|-------|-----|
| **Permission modes** | Per agent | `permissionMode: bypassPermissions|acceptEdits|dontAsk|plan|default` |
| **Tool allowlists** | Per agent | `tools: Read, Grep, Glob` |
| **Tool denylists** | Per agent | `disallowedTools: Bash, Write` |
| **Subagent spawning control** | Per agent | `tools: Task(worker, researcher)` |
| **Model restriction** | Per agent | `model: haiku` (limits capability) |
| **MCP server scoping** | Per agent | `mcpServers:` field restricts which servers available |
| **Sandbox per Bash** | Global | OS-level enforcement on all Bash commands |

### 8.8 Sensitive Data Prevention

| Risk | Mitigation |
|------|-----------|
| **API keys in code** | `PreToolUse` hook scanning for secrets patterns |
| **SSH key exfiltration** | Network sandbox blocks unauthorized domains |
| **Environment variable leaks** | Sandbox inherits minimal env; `$CLAUDE_ENV_FILE` for explicit vars only |
| **Data exfiltration** | Zero-Data-Retention mode (Enterprise); VPC isolation (Bedrock/Vertex) |
| **Prompt injection** | Sandbox ensures compromised agent cannot escape boundaries |
| **Malicious dependencies** | Network sandbox restricts download sources |

### 8.9 Enterprise Deployment Patterns

- **Managed settings**: `allowManagedHooksOnly` blocks user/project/plugin hooks
- **VPC isolation**: Bedrock/Vertex deployment behind corporate network
- **Custom proxy**: HTTPS inspection and filtering via sandbox network config
- **Devcontainers**: Additional isolation layer for development
- **Managed policies**: Organization-wide CLAUDE.md via `/Library/Application Support/ClaudeCode/CLAUDE.md`

> Sources: [Sandboxing Docs](https://code.claude.com/docs/en/sandboxing), [Anthropic Engineering: Sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing), [Security Best Practices](https://www.mintmcp.com/blog/claude-code-security), [Secure Deployment](https://platform.claude.com/docs/en/agent-sdk/secure-deployment)

---

## Summary: Coverage Matrix

| Topic | Wave 1-2 Coverage | Wave 3 New Findings |
|-------|-------------------|---------------------|
| **GitHub Actions** | Mentioned briefly (2 sentences) | Complete input reference, 4 auth methods, structured outputs, workflow patterns |
| **Hooks** | 12 events listed, basic examples | 14 events with full stdin schemas, 3 decision patterns, async hooks, tool input modification, MCP matching |
| **Plugins** | Architecture described | Distribution mechanisms, 5 marketplaces, publishing workflow, namespacing |
| **Cost Management** | Token estimates only | Real-world data ($6/day avg), SDK tracking API, rate limits by team size, horror stories, optimization strategies |
| **Debugging** | Not covered | 6 debugging tools, observability dashboard, transcript access, common scenarios |
| **Recent Releases** | v2.1.33 only | v2.1.30-v2.1.37 complete, fast mode, PDF pages, /debug, sandbox patch, skill budget scaling |
| **Edge Cases** | Listed as gaps | File conflicts, context overflow, runaway agents, compaction recovery, MCP failures |
| **Security** | 1 paragraph | Complete sandboxing reference, 2 modes, 8 isolation mechanisms, enterprise patterns, open-source runtime |

---

## Sources

### Official Anthropic Documentation
- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Sandboxing](https://code.claude.com/docs/en/sandboxing)
- [Manage Costs](https://code.claude.com/docs/en/costs)
- [Troubleshooting](https://code.claude.com/docs/en/troubleshooting)
- [Changelog](https://code.claude.com/docs/en/changelog)
- [Discover Plugins](https://code.claude.com/docs/en/discover-plugins)
- [Introducing Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)
- [Claude Code Sandboxing (Engineering)](https://www.anthropic.com/engineering/claude-code-sandboxing)

### Official Repositories
- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)
- [claude-code-action Usage Docs](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md)
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [anthropic-experimental/sandbox-runtime](https://github.com/anthropic-experimental/sandbox-runtime)

### SDK and API
- [Agent SDK Cost Tracking](https://platform.claude.com/docs/en/agent-sdk/cost-tracking)
- [Agent SDK Secure Deployment](https://platform.claude.com/docs/en/agent-sdk/secure-deployment)
- [Context Windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)

### Community Tools and Repos
- [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)
- [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
- [ColeMurray/claude-code-otel](https://github.com/ColeMurray/claude-code-otel)
- [dashed/claude-marketplace](https://github.com/dashed/claude-marketplace)

### Blog Posts and Articles
- [Claude Code GitHub Actions (Steve Kinney)](https://stevekinney.com/courses/ai-development/integrating-with-github-actions)
- [How to Configure Hooks (Anthropic Blog)](https://claude.com/blog/how-to-configure-hooks)
- [DataCamp Hooks Tutorial](https://www.datacamp.com/tutorial/claude-code-hooks)
- [GitButler + Claude Code Hooks](https://docs.gitbutler.com/features/ai-integration/claude-code-hooks)
- [Subagent Cost Explosion (AICosts.ai)](https://www.aicosts.ai/blog/claude-code-subagent-cost-explosion-887k-tokens-minute-crisis)
- [Claude Code Token Limits (Faros AI)](https://www.faros.ai/blog/claude-code-token-limits)
- [Claude Code Sandboxing (claudefa.st)](https://claudefa.st/blog/guide/sandboxing-guide)
- [Security Best Practices (MintMCP)](https://www.mintmcp.com/blog/claude-code-security)
- [Secrets Access Limitation (Patrick McCanna)](https://patrickmccanna.net/a-better-way-to-limit-claude-code-and-other-coding-agents-access-to-secrets/)
- [Docker Sandboxes (Docker Blog)](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/)
- [Context Recovery (Medium)](https://medium.com/coding-nexus/claude-code-context-recovery-stop-losing-progress-when-context-compacts-772830ee7863)
- [MCP Context Bloat Reduction (Medium)](https://medium.com/@joe.njenga/claude-code-just-cut-mcp-context-bloat-by-46-9-51k-tokens-down-to-8-5k-with-new-tool-search-ddf9e905f734)

### Release Notes
- [Releasebot - Claude Code](https://releasebot.io/updates/anthropic/claude-code)
- [ClaudeLog Changelog](https://claudelog.com/claude-code-changelog/)
- [claudefa.st Changelog](https://claudefa.st/blog/guide/changelog)
- [VentureBeat: Opus 4.6](https://venturebeat.com/technology/anthropics-claude-opus-4-6-brings-1m-token-context-and-agent-teams-to-take)

### Marketplace and Distribution
- [skills.sh](https://skills.sh)
- [claude-plugins.dev](https://claude-plugins.dev/)
- [skillsmp.com](https://skillsmp.com/)
- [paddo.dev: claude-tools marketplace](https://paddo.dev/blog/claude-tools-plugin-marketplace/)

---

## Remaining Gaps

1. **Hook input modification for PermissionRequest**: The `updatedPermissions` field can apply permission rule updates, but no documented examples of complex permission policies via hooks.
2. **Agent teams + sandboxing interaction**: No documentation on whether teammates inherit the lead's sandbox configuration or get their own.
3. **Plugin versioning and upgrades**: No mechanism for plugin version pinning or upgrade management beyond Git.
4. **Cost attribution per teammate**: SDK provides per-model cost but not per-agent cost in team contexts.
5. **Long-running agent health checks**: No heartbeat or health check mechanism for agents running for hours.
6. **Cross-repo agent teams**: No documentation on teams spanning multiple repositories.
7. **Sandbox + Docker compose**: The `excludedCommands` pattern for Docker is documented but complex Docker Compose workflows are not.
8. **Structured output validation in hooks**: No way to validate structured output schema in PostToolUse hooks before it reaches the user.
