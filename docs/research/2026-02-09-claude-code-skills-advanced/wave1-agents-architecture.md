# Deep Research: Claude Code Agents Architecture & Advanced Patterns

**Date:** 2026-02-09
**Researcher:** deep-researcher agent
**Sources consulted:** 25+ (official docs, GitHub repos, blog posts, community articles)

---

## TL;DR

- Claude Code agents (subagents) are **isolated AI instances** with their own context window, system prompt, tool restrictions, and permissions
- Defined via **Markdown files with YAML frontmatter** in `.claude/agents/` (project) or `~/.claude/agents/` (user)
- **Built-in agents**: Explore (Haiku, read-only), Plan (inherit, read-only), general-purpose (inherit, full tools), Bash, Claude Code Guide (Haiku), statusline-setup (Sonnet)
- **11 frontmatter fields**: name, description, tools, disallowedTools, model, permissionMode, maxTurns, skills, mcpServers, hooks, memory
- **6 permission modes**: default, acceptEdits, dontAsk, delegate, bypassPermissions, plan
- **Agent Teams** (experimental): multi-session orchestration with shared task list, inter-agent messaging, team lead pattern
- **Agent SDK** (TypeScript/Python): programmatic agent definition with `AgentDefinition` class
- **`--agent` flag**: runs entire session AS a specific agent (vs `--agents` for defining subagents)
- Subagents **cannot spawn other subagents** (no infinite nesting)
- Up to **10 concurrent subagents** in parallel

---

## 1. Agent Architecture Fundamentals

### 1.1 What Are Agents/Subagents?

Subagents are specialized AI assistants that handle specific types of tasks. Each subagent runs in its **own context window** with:

- A custom **system prompt** (the markdown body of the agent file)
- Specific **tool access** (allowlist or denylist)
- Independent **permissions** (inherited or overridden)
- Optional **persistent memory** across sessions

> "Custom agents are specialized agents that can be utilized to solve specific tasks. They are automatically invoked by Claude in a similar manner to how Tools are invoked automatically. Unlike traditional sub-agents, they have their own custom system prompt, tools, and context window separate from their delegating agent."
> -- [ClaudeLog](https://claudelog.com/mechanics/custom-agents/)

When Claude encounters a task matching a subagent's description, it delegates to that subagent, which works independently and returns results.

### 1.2 Core Design Principles

| Principle | Description |
|-----------|-------------|
| **Isolation** | Each subagent has separate context -- prevents "context poisoning" |
| **Specialization** | Focused system prompts for specific domains |
| **Parallelization** | Up to 10 concurrent agents simultaneously |
| **Least Privilege** | Fine-grained tool restrictions per agent |
| **Plug-and-Play** | Drop a file, agent is live -- no code changes needed |
| **Cost Control** | Route tasks to cheaper/faster models (e.g., Haiku) |

### 1.3 Delegation Architecture

```
User Request
    |
    v
Main Agent (orchestrator)
    |
    +---> Task Tool ---> Subagent A (Explore, Haiku)
    |                        |
    |                        +---> Results back to main
    |
    +---> Task Tool ---> Subagent B (custom, Sonnet)
    |                        |
    |                        +---> Results back to main
    |
    +---> Task Tool ---> Subagent C (general-purpose)
    |                        |
    |                        +---> Results back to main
    v
Synthesized Response to User
```

**Key constraint**: Subagents cannot spawn other subagents. This prevents infinite nesting while still gathering necessary context.

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

---

## 2. Built-in Agent Types

Claude Code includes several built-in subagents that Claude automatically uses when appropriate.

### 2.1 Explore

| Property | Value |
|----------|-------|
| **Model** | Haiku (fast, low-latency) |
| **Tools** | Read-only (denied Write/Edit) |
| **Purpose** | File discovery, code search, codebase exploration |
| **Thoroughness** | quick / medium / very thorough |

Claude delegates to Explore when it needs to search or understand a codebase without making changes. When invoking, Claude specifies a thoroughness level.

### 2.2 Plan

| Property | Value |
|----------|-------|
| **Model** | Inherits from main conversation |
| **Tools** | Read-only (denied Write/Edit) |
| **Purpose** | Codebase research for planning (plan mode) |

Used during plan mode to gather context before presenting a plan.

### 2.3 General-purpose

| Property | Value |
|----------|-------|
| **Model** | Inherits from main conversation |
| **Tools** | All tools |
| **Purpose** | Complex research, multi-step operations, code modifications |

Delegates when task requires both exploration and modification, complex reasoning, or multiple dependent steps.

### 2.4 Other Built-in Agents

| Agent | Model | When Used |
|-------|-------|-----------|
| **Bash** | Inherits | Running terminal commands in separate context |
| **statusline-setup** | Sonnet | When `/statusline` is invoked |
| **Claude Code Guide** | Haiku | When asking about Claude Code features |

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

---

## 3. Agent Configuration (Complete Reference)

### 3.1 File Structure

Agent files are Markdown with YAML frontmatter:

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

The frontmatter defines metadata/config. The body becomes the **system prompt** (NOT the full Claude Code system prompt -- just this custom prompt plus basic environment details).

### 3.2 Storage Locations (Priority Order)

| Location | Scope | Priority | How to Create |
|----------|-------|----------|---------------|
| `--agents` CLI flag | Current session only | 1 (highest) | Pass JSON at launch |
| `.claude/agents/` | Current project | 2 | Interactive or manual |
| `~/.claude/agents/` | All your projects | 3 | Interactive or manual |
| Plugin's `agents/` dir | Where plugin enabled | 4 (lowest) | Installed with plugins |

When multiple subagents share the same name, the higher-priority location wins.

### 3.3 Complete Frontmatter Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | **Yes** | string | Unique identifier (lowercase letters and hyphens) |
| `description` | **Yes** | string | When Claude should delegate to this agent |
| `tools` | No | string/list | Allowlist of tools. Inherits all if omitted |
| `disallowedTools` | No | string/list | Tools to deny (removed from inherited/specified list) |
| `model` | No | enum | `sonnet`, `opus`, `haiku`, or `inherit` (default: `inherit`) |
| `permissionMode` | No | enum | `default`, `acceptEdits`, `delegate`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | number | Maximum agentic turns before stop |
| `skills` | No | list | Skills to inject at startup (full content, not just made available) |
| `mcpServers` | No | object/list | MCP servers available to this agent |
| `hooks` | No | object | Lifecycle hooks scoped to this agent |
| `memory` | No | enum | `user`, `project`, or `local` -- enables persistent cross-session memory |

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

### 3.4 CLI-Defined Agents (JSON)

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

The `--agents` flag uses `prompt` for system prompt (equivalent to markdown body in file-based agents).

### 3.5 The `--agent` Flag (Run AS Agent)

Distinct from `--agents`, the `--agent` flag runs the **entire session** as a specific agent:

```bash
claude --agent security-reviewer
```

This applies the agent's system prompt, tool restrictions, and model to the main thread. Useful when you want the whole session to behave as a specialist.

Can also be set persistently:
```json
// .claude/settings.json
{ "agent": "security-reviewer" }
```

**Key difference**:
- `--agent`: configures main thread as specialist (entire session)
- `--agents`: defines subagents available for delegation (parallel workers)

When running with `--agent`, the agent can spawn subagents via the Task tool, and you can restrict which agents it can spawn with `Task(agent_type)` syntax in the tools field.

Source: [ClaudeLog](https://claudelog.com/faqs/what-is-agent-flag-in-claude-code/)

---

## 4. Permission Modes (Deep Dive)

### 4.1 Available Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `default` | Standard permission checking with prompts | Normal interactive work |
| `acceptEdits` | Auto-accept file edits (Write/Edit) | Trusted prototyping, isolated directories |
| `dontAsk` | Auto-deny permission prompts (explicitly allowed tools still work) | Read-only agents that should never escalate |
| `delegate` | Coordination-only tools (spawn, message, task management) | Team lead that should not implement |
| `bypassPermissions` | Skip ALL permission checks | Automation, CI/CD, headless mode |
| `plan` | Read-only exploration mode | Analysis before implementation |

### 4.2 Permission Inheritance

- Subagents **inherit** the permission context from the main conversation
- The `permissionMode` field can **override** the inherited mode
- **Exception**: if parent uses `bypassPermissions`, this takes precedence and **cannot be overridden** in subagents

### 4.3 Restricting Subagent Spawning

When running as main agent (`--agent`), control which subagents can be spawned:

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Task(worker, researcher), Read, Bash
---
```

This is an **allowlist**: only `worker` and `researcher` can be spawned. If `Task` is omitted entirely, the agent cannot spawn any subagents.

### 4.4 Disabling Specific Agents

```json
{
  "permissions": {
    "deny": ["Task(Explore)", "Task(my-custom-agent)"]
  }
}
```

Or via CLI: `claude --disallowedTools "Task(Explore)"`

Source: [Official docs](https://code.claude.com/docs/en/sub-agents), [eesel.ai](https://www.eesel.ai/blog/claude-code-permissions)

---

## 5. Persistent Agent Memory

### 5.1 Memory Scopes

The `memory` field gives agents a persistent directory that survives across conversations:

| Scope | Location | Use When |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Agent should remember across ALL projects |
| `project` | `.claude/agent-memory/<name>/` | Knowledge is project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, NOT checked into VCS |

### 5.2 How Memory Works

When memory is enabled:

1. System prompt includes instructions for reading/writing memory directory
2. First 200 lines of `MEMORY.md` are auto-injected into system prompt
3. Read, Write, Edit tools auto-enabled for memory management
4. Agent builds knowledge over time (patterns, conventions, decisions)

### 5.3 Best Practices

- `user` is the **recommended default** scope
- Ask agent to consult memory before starting: "Check your memory for patterns"
- Ask agent to update memory after completing: "Save what you learned"
- Include memory instructions in the agent markdown file directly

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

---

## 6. Hooks (Lifecycle Events)

### 6.1 Hooks in Agent Frontmatter

Define hooks scoped to a specific agent:

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
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

### 6.2 Available Hook Events

| Event | Matcher Input | When It Fires |
|-------|--------------|---------------|
| `PreToolUse` | Tool name | Before agent uses a tool |
| `PostToolUse` | Tool name | After agent uses a tool |
| `Stop` | (none) | When agent finishes (auto-converted to SubagentStop) |

### 6.3 Project-Level Hooks for Agent Events

In `settings.json`, respond to agent lifecycle:

| Event | Matcher Input | When It Fires |
|-------|--------------|---------------|
| `SubagentStart` | Agent type name | When a subagent begins execution |
| `SubagentStop` | Agent type name | When a subagent completes |

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
    ]
  }
}
```

### 6.4 Hook Exit Codes

| Code | Behavior |
|------|----------|
| 0 | Allow operation to proceed |
| 2 | **Block** operation, feed error message back to Claude |
| Other | Error logged but operation continues |

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

---

## 7. Skills Integration with Agents

### 7.1 Preloading Skills into Agents

Use `skills` field to inject skill content at startup:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions from preloaded skills.
```

**Key behaviors**:
- Full skill content is **injected** into the agent's context (not just made available)
- Subagents do NOT inherit skills from parent -- must list explicitly
- Inverse of `context: fork` + `agent:` in skills (where skill controls the system prompt)

### 7.2 Two Directions: Skill <-> Agent

| Direction | Who Controls | How |
|-----------|-------------|-----|
| Skill --> Agent | Skill orchestrates | `context: fork` + `agent: AgentName` in skill frontmatter |
| Agent --> Skill | Agent orchestrates | `skills:` field in agent frontmatter |

Source: [Official docs](https://code.claude.com/docs/en/sub-agents), [alexop.dev](https://alexop.dev/posts/understanding-claude-code-full-stack/)

---

## 8. MCP Servers in Agents

### 8.1 Configuration

Agents can reference already-configured MCP servers or define inline:

```yaml
---
name: slack-notifier
description: Sends notifications to Slack
mcpServers:
  - slack
  - custom-api:
      command: "node"
      args: ["./mcp-servers/custom-api/index.js"]
      env:
        API_KEY: "${CUSTOM_API_KEY}"
---
```

Each entry is either:
- A **server name** referencing an already-configured server
- An **inline definition** with server name as key and full MCP config as value

**Note**: MCP tools are NOT available in background subagents.

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

---

## 9. Agent Execution Patterns

### 9.1 Foreground vs Background

| Mode | Behavior |
|------|----------|
| **Foreground** | Blocks main conversation; permission prompts pass through to user |
| **Background** | Runs concurrently; permissions pre-approved at launch; auto-denies unapproved |

- Claude decides mode based on task
- User can press **Ctrl+B** to background a running task
- Disable background: `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`

### 9.2 Resume Mechanism

Subagents can be resumed to continue where they left off:

```
Use the code-reviewer subagent to review the auth module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

Transcripts stored at: `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`

### 9.3 Auto-Compaction

Subagents support automatic compaction at ~95% capacity. Override with `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (e.g., `50` for 50%).

### 9.4 Chaining Subagents

For multi-step workflows, chain subagents sequentially:

```
Use the code-reviewer to find performance issues,
then use the optimizer to fix them
```

Each completes and returns results to Claude, which passes context to the next.

### 9.5 Parallel Research

```
Research the authentication, database, and API modules in parallel
using separate subagents
```

Each explores independently; Claude synthesizes findings.

Source: [Official docs](https://code.claude.com/docs/en/sub-agents)

---

## 10. Agent Teams (Multi-Session Orchestration)

### 10.1 Overview

Agent teams coordinate **multiple independent Claude Code instances** working together. Unlike subagents (single session), teams enable inter-agent communication and shared coordination.

> "Anthropic shipped [TeammateTool] as 'agent teams' alongside Opus 4.6."
> -- [paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/)

### 10.2 Enabling

```json
// .claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 10.3 Architecture Components

| Component | Role |
|-----------|------|
| **Team Lead** | Main Claude Code session; spawns teammates, coordinates, synthesizes |
| **Teammates** | Separate Claude Code instances; independent context windows |
| **Task List** | Shared work items with dependency tracking and auto-unblocking |
| **Mailbox** | Messaging system for inter-agent communication |

### 10.4 Seven Foundational Primitives (Tools)

| Tool | Function |
|------|----------|
| **TeamCreate** | Initialize team directory and config |
| **TaskCreate** | Define work units as JSON files with subject, description, status |
| **TaskUpdate** | Claim tasks, mark completion |
| **TaskList** | View all tasks with status and ownership |
| **Task** (with team_name) | Spawn new teammate as full Claude Code session |
| **SendMessage** | Direct peer-to-peer communication (message, broadcast, shutdown, plan approval) |
| **TeamDelete** | Remove team config and task files |

### 10.5 Task Lifecycle

```
pending --> in_progress --> completed
```

- Teammates self-claim unowned pending tasks
- File locking prevents concurrent claims
- Dependency waves auto-unblock (Wave 1 independent, Wave 2 dependent, etc.)
- Task storage: `~/.claude/tasks/{team-name}/`
- Team config: `~/.claude/teams/{team-name}/config.json`

### 10.6 Communication Patterns

| Type | Description |
|------|-------------|
| `message` | Send to one specific teammate |
| `broadcast` | Send to ALL teammates (use sparingly -- costs scale with team size) |
| `shutdown_request` / `shutdown_response` | Graceful termination protocol |
| `plan_approval_request` / `plan_approval_response` | Plan review before implementation |

### 10.7 Delegate Mode

Restricts lead to coordination-only tools. Enable via `Shift+Tab` after team creation. Prevents lead from implementing tasks itself.

### 10.8 Plan Approval for Teammates

```
Spawn an architect teammate to refactor the auth module.
Require plan approval before they make any changes.
```

Teammate works in read-only mode until lead approves their plan.

### 10.9 Display Modes

| Mode | Description |
|------|-------------|
| **in-process** | All in main terminal; Shift+Up/Down to select; Ctrl+T for task list |
| **split panes** | Each teammate gets own pane (requires tmux or iTerm2) |
| **auto** (default) | Split if already in tmux, in-process otherwise |

### 10.10 Known Limitations

- No session resumption for in-process teammates
- Task status can lag (teammates fail to mark complete)
- One team per session; no nested teams
- Lead is fixed (cannot promote teammate)
- Permissions set at spawn time (inherited from lead)
- Split panes require tmux/iTerm2 (not VS Code terminal)
- Shutdown can be slow

### 10.11 Best Use Cases

- Research and review (parallel investigation)
- New modules/features (each teammate owns separate piece)
- Debugging with competing hypotheses
- Cross-layer coordination (frontend/backend/tests)

### 10.12 Token Economics

Each teammate = separate full Claude Code instance:

| Configuration | ~Token Usage |
|--------------|-------------|
| Solo session | ~200k tokens |
| 3 subagents | ~440k tokens |
| 3-person team | ~800k tokens |

Source: [Official docs](https://code.claude.com/docs/en/agent-teams), [alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/), [addyosmani.com](https://addyosmani.com/blog/claude-code-agent-teams/)

---

## 11. Agent SDK (Programmatic Agents)

### 11.1 Overview

The Claude Agent SDK enables programmatic agent definition in TypeScript and Python.

### 11.2 Three Ways to Create Subagents

1. **Programmatic**: `agents` parameter in `query()` options (recommended for SDK apps)
2. **Filesystem-based**: Markdown files in `.claude/agents/`
3. **Built-in general-purpose**: Always available via Task tool

### 11.3 AgentDefinition Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | When to use this agent |
| `prompt` | string | Yes | Agent's system prompt |
| `tools` | string[] | No | Allowed tools (inherits all if omitted) |
| `model` | enum | No | `sonnet`, `opus`, `haiku`, or `inherit` |

### 11.4 TypeScript Example

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: "Review the auth module for security issues",
  options: {
    allowedTools: ['Read', 'Grep', 'Glob', 'Task'],
    agents: {
      'code-reviewer': {
        description: 'Expert code review specialist.',
        prompt: 'You are a code review specialist...',
        tools: ['Read', 'Grep', 'Glob'],
        model: 'sonnet'
      }
    }
  }
})) {
  if ('result' in message) console.log(message.result);
}
```

### 11.5 Python Example

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async for message in query(
    prompt="Review the auth module",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Grep", "Glob", "Task"],
        agents={
            "code-reviewer": AgentDefinition(
                description="Expert code review specialist.",
                prompt="You are a code review specialist...",
                tools=["Read", "Grep", "Glob"],
                model="sonnet"
            )
        }
    )
):
    if hasattr(message, "result"):
        print(message.result)
```

### 11.6 Dynamic Agent Configuration

Factory pattern for runtime customization:

```python
def create_security_agent(level: str) -> AgentDefinition:
    is_strict = level == "strict"
    return AgentDefinition(
        description="Security code reviewer",
        prompt=f"You are a {'strict' if is_strict else 'balanced'} security reviewer...",
        tools=["Read", "Grep", "Glob"],
        model="opus" if is_strict else "sonnet"
    )
```

### 11.7 Detecting Subagent Invocation

Check for `tool_use` blocks with `name: "Task"`. Messages from within a subagent's context include `parent_tool_use_id`.

### 11.8 Resuming Subagents (SDK)

1. Capture `session_id` from messages during first query
2. Extract `agentId` from message content
3. Pass `resume: sessionId` in second query's options

Source: [Claude Agent SDK docs](https://platform.claude.com/docs/en/agent-sdk/subagents), [GitHub TS SDK](https://github.com/anthropics/claude-agent-sdk-typescript), [GitHub Python SDK](https://github.com/anthropics/claude-agent-sdk-python)

---

## 12. Community Patterns & Real-World Examples

### 12.1 Multi-Agent Archetypes

Five patterns identified by the community:

| Pattern | Description | Example |
|---------|-------------|---------|
| **Leader** | Hierarchical task direction | Team lead assigning work to specialists |
| **Swarm** | Parallel processing of similar work | QA team testing 5 domains simultaneously |
| **Pipeline** | Sequential multi-stage workflows | Review -> Implement -> Test chain |
| **Council** | Multi-perspective decision-making | 3 reviewers (security, perf, tests) |
| **Watchdog** | Quality monitoring and oversight | CI agent watching for regressions |

Source: [paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/)

### 12.2 Three-Tier Model Strategy (wshobson/agents)

| Tier | Model | Agents | Purpose |
|------|-------|--------|---------|
| Tier 1 | Opus 4.5 | 42 agents | Architecture, security, code review, production coding |
| Tier 2 | Inherit | 42 agents | Complex work requiring flexibility |
| Tier 3 | Sonnet 4.5 | 51 agents | Documentation, testing, specialized domains |
| Tier 4 | Haiku 4.5 | 18 agents | Fast operational tasks (SEO, deployment) |

> "Opus's 65% token reduction on complex tasks often offsets higher rate"

Source: [wshobson/agents](https://github.com/wshobson/agents) (24.1k stars)

### 12.3 Notable Community Repos

| Repository | Stars | Content |
|------------|-------|---------|
| [wshobson/agents](https://github.com/wshobson/agents) | 24.1k | 73 plugins, 112 agents, 146 skills, 79 tools |
| [vizra-ai/claude-code-agents](https://github.com/vizra-ai/claude-code-agents) | 128 | 59 agents across 10 categories |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | - | 100+ specialized subagents |
| [fcakyon/claude-codex-settings](https://github.com/fcakyon/claude-codex-settings) | - | Battle-tested daily setup |
| [lst97/claude-code-sub-agents](https://github.com/lst97/claude-code-sub-agents) | - | Full-stack development agents |
| [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) | - | Comprehensive config example |

### 12.4 Minimal Viable Team Structure

A recommended starting team:

1. **Planner** -- specifications and task breakdown
2. **Implementer** -- code generation
3. **Reviewer** -- quality checks
4. **Tester** -- test generation and execution

Source: [TechLife blog](https://techlife.blog/posts/building-an-ai-software-development-team-with-claude-code-agents/)

### 12.5 Enterprise Agent Patterns

```yaml
# Financial Services
---
name: financial-trading-reviewer
tools: Read, Grep, Bash
# Compliance: MiFID-II, Dodd-Frank
---

# Healthcare
---
name: medical-device-reviewer
tools: Read, Grep, Glob
# Standards: FDA-21CFR820, HIPAA
---
```

Source: [DEV Community](https://dev.to/therealmrmumba/claude-codes-custom-agent-framework-changes-everything-4o4m)

---

## 13. Example Agent Configurations

### 13.1 Code Reviewer (Read-Only)

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality,
  security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards.

Review checklist:
- Code clarity and readability
- Function/variable naming
- No duplicated code
- Proper error handling
- No exposed secrets
- Input validation
- Test coverage
- Performance considerations

Provide feedback by priority:
- Critical (must fix)
- Warnings (should fix)
- Suggestions (consider improving)
```

### 13.2 Debugger (Read + Write)

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior.
  Use proactively when encountering issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

Process:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate failure location
4. Implement minimal fix
5. Verify solution works
```

### 13.3 Database Query Validator (with Hooks)

```markdown
---
name: db-reader
description: Execute read-only database queries. Use for data analysis.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries only.
```

### 13.4 Agent with Persistent Memory

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

### 13.5 Coordinator Agent (Restricts Spawnable Agents)

```markdown
---
name: coordinator
description: Coordinates work across specialized agents
tools: Task(worker, researcher), Read, Bash
---

You coordinate tasks between the worker and researcher agents.
Only these two agents can be spawned.
```

---

## 14. Technical Internals

### 14.1 How the Task Tool Works

The Task tool is the internal mechanism for spawning subagents:

1. Main agent invokes Task tool with description and configuration
2. System spawns new agent instance with isolated context
3. `SubagentStart` hook fires
4. Agent executes independently
5. Results return via `TaskOutputTool`
6. `SubagentStop` hook fires with `agent_id` and `agent_transcript_path`

### 14.2 Context Window Management

- Each subagent: separate ~98% threshold for auto-compaction
- Main conversation compaction does NOT affect subagent transcripts
- Subagent transcripts stored in separate files
- Cleanup based on `cleanupPeriodDays` (default: 30 days)

### 14.3 Environment Variables

| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable all background subagent functionality |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Override auto-compaction threshold |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams feature |
| `CLAUDE_CODE_TEAM_NAME` | Set team name for teammates |
| `CLAUDE_CODE_AGENT_ID` | Agent identifier within team |
| `CLAUDE_CODE_AGENT_TYPE` | Agent type within team |

### 14.4 TeammateTool Discovery

The TeammateTool was discovered by running `strings` on Claude Code's binary:

```bash
strings ~/.local/share/claude/versions/2.1.29 | grep TeammateTool
```

13 operations were found: `spawnTeam`, `discoverTeams`, `cleanup`, `requestJoin`, `approveJoin`, `rejectJoin`, `write` (DM), `broadcast`, `approvePlan`, `rejectPlan`, `requestShutdown`, `approveShutdown`, `rejectShutdown`.

Two boolean feature gates (`I9()` and `qFB()`) controlled access until official release with Opus 4.6.

Source: [paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/)

---

## 15. Decision Matrix: When to Use What

### 15.1 Subagents vs Main Conversation

| Scenario | Use |
|----------|-----|
| Frequent back-and-forth / iterative refinement | Main conversation |
| Multiple phases sharing significant context | Main conversation |
| Quick, targeted change | Main conversation |
| Latency-sensitive | Main conversation |
| Produces verbose output you don't need in main context | **Subagent** |
| Need specific tool restrictions | **Subagent** |
| Self-contained work returning a summary | **Subagent** |

### 15.2 Subagents vs Agent Teams

| Scenario | Use |
|----------|-----|
| Focused tasks, only result matters | **Subagent** |
| Workers don't need to communicate | **Subagent** |
| Lower token cost needed | **Subagent** |
| Complex work requiring discussion | **Agent Team** |
| Workers need to share findings / challenge each other | **Agent Team** |
| Self-coordinating with shared task list | **Agent Team** |

### 15.3 Subagents vs Skills

| Scenario | Use |
|----------|-----|
| Reusable prompts in main conversation context | **Skill** |
| Isolated context for exploration | **Subagent** |
| Auto-discovered based on task description | Both (description matching) |
| Running in separate context window | **Subagent** |

---

## 16. Best Practices Summary

### Agent Design

1. **Design focused agents** -- each should excel at one specific task
2. **Write detailed descriptions** -- Claude uses these to decide when to delegate
3. **Limit tool access** -- grant only necessary permissions (least privilege)
4. **Check into version control** -- share project agents with your team
5. **Keep prompts under ~500 lines** -- use progressive disclosure for complex instructions
6. **Include positive/negative examples** -- in system prompts for better behavior

### Model Selection

- **Haiku**: lightweight, fast tasks (exploration, simple analysis)
- **Sonnet**: balanced capability/speed (code review, documentation)
- **Opus**: critical tasks (architecture decisions, security audits)
- **Inherit**: when flexibility matters or parent already chose well

### Permission Strategy

- Start with `default` and tighten as needed
- Use `dontAsk` for agents that should never escalate
- Use `acceptEdits` only in isolated/trusted directories
- Reserve `bypassPermissions` for automation/CI
- Use `delegate` for team leads that should not implement

### Memory Strategy

- `user` scope for agents used across multiple projects
- `project` scope for team-shared, project-specific knowledge
- `local` scope for sensitive/personal project notes
- Include memory curation instructions in agent prompt

---

## Sources

### Official Documentation
1. [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
2. [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
3. [Subagents in the SDK - Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/subagents)
4. [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)
5. [Configure permissions - Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/permissions)
6. [Claude Agent SDK TypeScript](https://github.com/anthropics/claude-agent-sdk-typescript)
7. [Claude Agent SDK Python](https://github.com/anthropics/claude-agent-sdk-python)
8. [Claude Agent SDK Demos](https://github.com/anthropics/claude-agent-sdk-demos)

### Technical Deep Dives
9. [Understanding Claude Code's Full Stack - alexop.dev](https://alexop.dev/posts/understanding-claude-code-full-stack/)
10. [From Tasks to Swarms: Agent Teams - alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)
11. [Claude Code Customization Guide - alexop.dev](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
12. [Claude Code's Hidden Multi-Agent System - paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/)
13. [Agent Teams: The Switch Got Flipped - paddo.dev](https://paddo.dev/blog/agent-teams-the-switch-got-flipped/)
14. [Claude Code Swarms - addyosmani.com](https://addyosmani.com/blog/claude-code-agent-teams/)
15. [Agent System & Subagents - DeepWiki](https://deepwiki.com/anthropics/claude-code/3.1-agent-system-and-subagents)

### Community & Blog Posts
16. [Custom Agent Framework Changes Everything - DEV Community](https://dev.to/therealmrmumba/claude-codes-custom-agent-framework-changes-everything-4o4m)
17. [ClaudeLog: Custom Agents](https://claudelog.com/mechanics/custom-agents/)
18. [ClaudeLog: --agent flag FAQ](https://claudelog.com/faqs/what-is-agent-flag-in-claude-code/)
19. [Building AI Dev Team with Claude Code - TechLife](https://techlife.blog/posts/building-an-ai-software-development-team-with-claude-code-agents/)
20. [Claude Code Swarm Orchestration Skill - GitHub Gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)

### Community Repositories
21. [wshobson/agents](https://github.com/wshobson/agents) - 73 plugins, 112 agents (24.1k stars)
22. [vizra-ai/claude-code-agents](https://github.com/vizra-ai/claude-code-agents) - 59 specialized agents
23. [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - 100+ subagents
24. [fcakyon/claude-codex-settings](https://github.com/fcakyon/claude-codex-settings) - Battle-tested daily setup
25. [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) - Comprehensive config example

### GitHub Issues & Feature Requests
26. [Allow custom agents as team teammates - #24316](https://github.com/anthropics/claude-code/issues/24316)
27. [Agent-to-Agent Communication - #4993](https://github.com/anthropics/claude-code/issues/4993)
28. [Persistent Memory for Agents - #4588](https://github.com/anthropics/claude-code/issues/4588)
29. [Add YOLO mode to permission cycle - #15898](https://github.com/anthropics/claude-code/issues/15898)

---

## Gaps (Areas Needing More Research)

- **Hook input schema details**: exact JSON structure passed to hook commands via stdin
- **Agent transcript format**: detailed `.jsonl` schema for subagent transcripts
- **Performance benchmarks**: token consumption and latency for different agent configurations
- **Team lead prompt internals**: what system prompt the team lead receives
- **Nested agent workarounds**: practical patterns for when you need deeper nesting
- **MCP server inheritance**: exact rules for which MCP servers are inherited vs need explicit config
- **Agent color system**: how color assignment works in the UI beyond the `/agents` interface
