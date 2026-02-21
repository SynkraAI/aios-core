# Integration Patterns: Agents + Memory + Teams + Skills Together

> Deep Research Wave 1 -- Integration Patterns
> Date: 2026-02-09
> Researcher: deep-researcher agent
> Sources: 30+ URLs consulted, 15+ pages read in full

---

## TL;DR

- **Skills + Teams**: A skill with `context: fork` can spawn an agent, but skills cannot directly create agent teams. The pattern is: user invokes skill -> skill orchestrates via subagent -> OR user/skill instructs lead to create team.
- **Agents + Memory**: Agents declared with `memory: user|project|local` get persistent cross-session MEMORY.md directories. The first 200 lines are auto-loaded into their system prompt every session.
- **Teams + Memory**: Teammates load CLAUDE.md project memory automatically at spawn. They do NOT inherit the lead's conversation history. Coordination happens via shared task lists and direct messaging, not shared memory files.
- **Compound Patterns**: The most powerful setups combine all four: skills define workflows, agents provide specialization, memory enables learning, and teams enable parallelism.
- **Claude Agent SDK**: The headless SDK provides the same primitives (tools, hooks, subagents, MCP, sessions, skills) programmable in Python/TypeScript, enabling CI/CD and production automation.
- **Recursive limitation**: Subagents cannot spawn subagents. Teammates cannot spawn sub-teams. This is intentional to prevent runaway costs and loss of oversight.

---

## 1. Skill -> Team Orchestration

### How It Works

Skills cannot directly create agent teams (there is no `team: true` frontmatter field). The integration path is indirect:

1. **Skill as Entrypoint**: A user invokes `/my-workflow` which provides structured instructions
2. **Skill instructs Claude**: The skill content tells Claude to create an agent team with specific roles
3. **Claude orchestrates**: Claude uses TeamCreate, TaskCreate, and Task tools to spawn the team

**Example Pattern**:
```yaml
---
name: parallel-review
description: Launch a multi-agent code review
disable-model-invocation: true
---

Create an agent team called "review-squad" to review the current PR.
Spawn three teammates:
1. Security reviewer - focus on auth, input validation, secrets
2. Performance reviewer - focus on N+1 queries, memory leaks, bundle size
3. Test coverage reviewer - focus on edge cases, missing tests

Each reviewer should:
- Read the PR diff with `gh pr diff`
- Analyze their domain
- Report findings with severity ratings

Wait for all teammates to finish, then synthesize a unified review.
```

### Skill + Subagent (Simpler Path)

For cases where team peer-communication isn't needed, `context: fork` runs a skill in an isolated subagent:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly using Glob and Grep.
Summarize findings with specific file references.
```

The `agent` field can reference:
- Built-in agents: `Explore`, `Plan`, `general-purpose`
- Custom agents from `.claude/agents/`

> **Source**: [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)

### Pipeline Pattern: Multi-Skill Chains

Skills can be chained where the output of one feeds the next. Claude figures out the composition:

```
/analyze-codebase -> /design-architecture -> /implement-plan
```

Stream-JSON chaining enables CLI-based pipelines:
```bash
claude -p "analyze the auth module" | claude -p "design improvements based on this analysis"
```

> **Source**: [Egghead - Stacking Claude Skills](https://egghead.io/stacking-claude-skills-to-create-complex-workflows~ob9ww), [Claude-Flow Stream Chaining](https://github.com/ruvnet/claude-flow/wiki/Stream-Chaining)

---

## 2. Agent + Memory (Cross-Session Learning)

### How Memory Works for Agents

The `memory` frontmatter field gives subagents persistent storage:

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

**Three scopes**:

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Learnings across ALL projects |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, not versioned |

**When memory is enabled**:
- System prompt includes instructions for reading/writing memory files
- First 200 lines of `MEMORY.md` are injected into the agent's system prompt
- Read, Write, Edit tools are auto-enabled for memory management
- Agent can create topic files (e.g., `debugging.md`, `patterns.md`) referenced from MEMORY.md

> **Source**: [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory), [Claude Code v2.1.33 Release Notes](https://claude-world.com/articles/claude-code-2133-release/)

### Self-Improving Agent Pattern

From Addy Osmani's research, the compound learning loop:

1. **AGENTS.md Knowledge Base**: Patterns, conventions, gotchas, style preferences, recent learnings
2. **Git Commit History**: Concrete record of prior changes via `git diff` / `git log`
3. **Progress Log**: Chronological journal of attempts, pass/fail, discoveries
4. **Task State**: Structured metadata with status flags

> "Each improvement should make future improvements easier. Agents update this file after each iteration, creating compound learning."

**Memory Update Triggers**:
- After completing a task: "save what you learned to your memory"
- After discovering a pattern: "remember that we use pnpm, not npm"
- Proactive instructions in the agent's prompt: "Update your agent memory as you discover codepaths, patterns, library locations, and key architectural decisions"

> **Source**: [Self-Improving Coding Agents (Addy Osmani)](https://addyosmani.com/blog/self-improving-agents/)

### Auto Memory (Session Memory)

Beyond agent memory, Claude Code has auto memory at `~/.claude/projects/<project>/memory/`:
- Claude automatically saves project patterns, commands, preferences
- `MEMORY.md` index loaded into every session (first 200 lines)
- Topic files loaded on demand
- Each project gets its own directory

> **Source**: [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)

---

## 3. Team + Memory (Cross-Session Team Learning)

### What Teammates Inherit

When spawned, a teammate loads:
- **CLAUDE.md files**: Full project memory hierarchy
- **MCP servers**: Same configuration as the lead
- **Skills**: Same skill discovery as the lead
- **Spawn prompt**: Context from the lead (NOT conversation history)

What teammates do NOT inherit:
- Lead's conversation history
- Lead's auto memory
- Other teammates' context

### Coordination via Files (Not Shared Memory)

Teams coordinate through:

1. **Shared Task List**: `~/.claude/tasks/{team-name}/` - JSON files for each task
2. **Direct Messaging**: Mailbox system for peer-to-peer and broadcast messages
3. **Team Config**: `~/.claude/teams/{team-name}/config.json` - members, IDs, types

> **Source**: [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)

### Cross-Session Team Learning Patterns

Since teams don't have native cross-session memory, the pattern is:

1. **Team produces artifacts**: Each teammate writes findings to files
2. **Lead synthesizes**: Lead consolidates into a structured report
3. **CLAUDE.md captures learnings**: Key insights go into project memory
4. **Next session benefits**: Future teams/agents read CLAUDE.md

**Quality gates via hooks enforce standards**:

```json
{
  "hooks": {
    "TeammateIdle": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/check-teammate-output.sh"
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/verify-task-quality.sh"
          }
        ]
      }
    ]
  }
}
```

Exit code 2 from these hooks sends feedback back to the teammate/task, preventing premature completion.

> **Source**: [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks), [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)

---

## 4. Skill + Agent Specialization

### Routing Skills to Specialized Agents

Two directions of composition:

| Direction | Who Controls | How |
|-----------|-------------|-----|
| Skill -> Agent | Skill orchestrates | `context: fork` + `agent: <name>` |
| Agent -> Skill | Agent orchestrates | `skills:` field in agent frontmatter |

**Skill -> Agent Example** (skill picks the specialist):
```yaml
---
name: security-audit
description: Run a security audit on the codebase
context: fork
agent: security-reviewer
---

Audit the codebase for OWASP Top 10 vulnerabilities.
Focus on: SQL injection, XSS, CSRF, auth bypass.
Report with severity ratings and remediation steps.
```

**Agent -> Skill Example** (agent has skills pre-loaded):
```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns
from the preloaded skills.
```

The full skill content is injected into the subagent's context at startup (not just made available for invocation). Subagents don't inherit skills from the parent conversation; they must be listed explicitly.

### Agent Tool Restriction for Specialization

Agents can restrict which subagents they can spawn:

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Task(worker, researcher), Read, Bash
---
```

This is an allowlist: only `worker` and `researcher` subagents can be spawned. If the agent tries to spawn any other type, the request fails.

> **Source**: [Claude Code Subagents - Restrict which subagents can be spawned](https://code.claude.com/docs/en/sub-agents)

---

## 5. Compound Patterns

### Pattern: Memory-Enabled Specialized Team

The most powerful integration combines all four pillars:

```
User invokes /full-review skill
  -> Skill instructs Claude to create team
    -> Claude spawns 3 agents, each with:
       - Custom persona (agent frontmatter)
       - Persistent memory (memory: project)
       - Preloaded skills (skills: [...])
       - Quality gate hooks
    -> Agents work in parallel
    -> Each agent updates its MEMORY.md with learnings
    -> Lead synthesizes findings
    -> Project CLAUDE.md updated with new patterns
```

**Concrete Implementation**:

1. **Skill** (`/full-review`): Entry point defining the workflow
2. **Agents** (`.claude/agents/security-reviewer.md`, etc.): Specialized personas
3. **Memory** (`memory: project`): Cross-session learning per reviewer domain
4. **Team**: Parallel execution with peer discussion
5. **Hooks**: Quality gates preventing premature completion

### Pattern: Iterative Improvement Loop

```
Session 1: Agent discovers patterns -> writes to MEMORY.md
Session 2: Agent reads MEMORY.md -> applies learnings -> discovers more
Session 3: Agent's effectiveness increases as it stops repeating mistakes
```

The compound learning loop from Self-Improving Agents:
- "A shared markdown file serves as external memory where Claude records what it has done and what should be done next"
- "Every fix or pattern the agent figures out is rolled into the context for next time"
- "Over dozens of iterations, the agent's effectiveness can increase"

> **Source**: [Self-Improving Coding Agents](https://addyosmani.com/blog/self-improving-agents/), [Continuous Claude](https://github.com/AnandChowdhary/continuous-claude)

### Pattern: Plan-Then-Team

The most cost-effective compound pattern:

1. **Plan phase** (cheap, ~10k tokens): Use plan mode or Plan agent to decompose work
2. **Human review**: Validate the plan before expensive execution
3. **Team execution** (expensive, ~500k+ tokens): Hand reviewed plan to team for parallel work

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

When teammate finishes planning, it sends a plan approval request to the lead. Lead reviews and either approves or rejects with feedback.

> **Source**: [Claude Code Swarms (Addy Osmani)](https://addyosmani.com/blog/claude-code-agent-teams/), [Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)

---

## 6. Pipeline Patterns

### Multi-Skill Sequential Pipeline

Skills can be invoked in sequence, each building on the previous:

```
/analyze-auth -> /design-improvements -> /implement-changes -> /write-tests
```

Each skill runs in the main conversation context (unless `context: fork`), so subsequent skills see prior results.

### Stream-JSON Chaining (CLI Pipeline)

For headless/automated pipelines:

```bash
# Agent A analyzes -> Agent B designs -> Agent C implements
claude -p "analyze auth module" --output-format json | \
claude -p "design improvements based on: $(cat -)" --output-format json | \
claude -p "implement these changes: $(cat -)"
```

### SDK Sequential Composition

The Agent SDK enables programmatic pipelines:

```python
# Phase 1: Research
async for msg in query(prompt="Analyze the auth module", options=opts):
    if hasattr(msg, 'subtype') and msg.subtype == 'init':
        session_id = msg.session_id

# Phase 2: Resume and implement
async for msg in query(
    prompt="Now implement improvements based on your analysis",
    options=ClaudeAgentOptions(resume=session_id)
):
    if hasattr(msg, "result"):
        print(msg.result)
```

> **Source**: [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)

---

## 7. Recursive Patterns (and Limitations)

### What Is NOT Supported

Claude Code intentionally prevents recursive spawning:

- **Subagents cannot spawn subagents**: "If your workflow requires nested delegation, use Skills or chain subagents from the main conversation"
- **Teammates cannot spawn sub-teams**: "One team per session. Teammates cannot spawn their own teams or teammates"
- **Lead is fixed**: Cannot promote a teammate to lead or transfer leadership

### Why This Limitation Exists

1. **Prevent runaway costs**: Each agent = separate Claude instance with full context
2. **Maintain human oversight**: Unlimited nesting removes human control
3. **Avoid infinite loops**: Recursive spawning could create unbounded execution

### Workarounds

1. **Chain subagents from main**: Main agent spawns A, gets results, spawns B with A's results
2. **Sequential team phases**: Clean up team 1, create team 2 with team 1's output files
3. **SDK orchestration**: Use the Agent SDK to programmatically chain multiple agent sessions

### Agents Creating Agents (Dynamic)

While runtime recursive spawning is blocked, agents CAN create agent definition files:

```yaml
# An agent that creates specialized agents for new team members
---
name: agent-factory
description: Creates specialized agent definitions
tools: Read, Write, Glob
---

When asked to create a new agent:
1. Read existing agents in .claude/agents/
2. Understand the requested specialization
3. Write a new agent .md file with appropriate frontmatter
4. The new agent is available on next session restart
```

> **Source**: [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents), [GitHub Issue #4182](https://github.com/anthropics/claude-code/issues/4182)

---

## 8. Quality Loops

### Hook-Based Quality Gates

Hooks provide deterministic quality enforcement at key lifecycle points:

| Hook Event | Quality Gate Use |
|-----------|-----------------|
| `PreToolUse` | Block dangerous operations before execution |
| `PostToolUse` | Run linter/formatter after file edits |
| `Stop` | Verify all tasks complete before agent stops |
| `SubagentStop` | Validate subagent output quality |
| `TeammateIdle` | Ensure teammate finished all assigned work |
| `TaskCompleted` | Run tests before marking task done |

**Three hook types**:

1. **Command hooks** (`type: "command"`): Run shell scripts. Fast, deterministic.
2. **Prompt hooks** (`type: "prompt"`): LLM evaluates with yes/no decision. Good for fuzzy criteria.
3. **Agent hooks** (`type: "agent"`): Spawn subagent with tool access to verify. Most thorough.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

### Memory-Driven Quality Improvement

The feedback loop:

```
Iteration N:   Agent encounters bug -> fixes it -> records pattern in MEMORY.md
Iteration N+1: Agent reads MEMORY.md -> avoids the same bug class
Iteration N+2: Agent's error rate decreases as memory accumulates
```

Instrumentation for tracking improvement:
- Log iteration duration and token cost
- Track "features per hour" metric
- Compare pre/post memory agent performance
- Feed test results back into memory as learnings

> **Source**: [Self-Improving Agents](https://addyosmani.com/blog/self-improving-agents/), [Continuous Claude](https://github.com/AnandChowdhary/continuous-claude)

---

## 9. Claude Agent SDK Patterns

### SDK vs CLI

| Use Case | Best Choice |
|----------|-------------|
| Interactive development | CLI |
| CI/CD pipelines | SDK |
| Custom applications | SDK |
| One-off tasks | CLI |
| Production automation | SDK |

### Key SDK Capabilities

The SDK provides the same primitives as Claude Code CLI, programmable:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

# Define custom agents programmatically
agents = {
    "code-reviewer": AgentDefinition(
        description="Expert code reviewer",
        prompt="Analyze code quality and suggest improvements.",
        tools=["Read", "Glob", "Grep"]
    )
}

# Run with MCP servers
mcp_servers = {
    "playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}
}

# Compose with hooks
hooks = {
    "PostToolUse": [HookMatcher(matcher="Edit|Write", hooks=[log_file_change])]
}
```

### SDK Multi-Agent Composition

The SDK supports composing Claude agents with other agents (Azure OpenAI, OpenAI, GitHub Copilot) using built-in orchestrators:

- **Sequential**: Agent A -> Agent B (pipeline)
- **Concurrent**: Agent A || Agent B (parallel)
- **Handoff**: Agent A delegates to Agent B when scope changes
- **Group Chat**: Multiple agents discuss in shared context

This enables cross-vendor agent orchestration not possible in the CLI.

> **Source**: [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview), [Building Agents with Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk), [Microsoft Semantic Kernel Integration](https://devblogs.microsoft.com/semantic-kernel/build-ai-agents-with-claude-agent-sdk-and-microsoft-agent-framework/)

---

## 10. MCP Integration with Agents

### How MCP Extends Agent Capabilities

MCP servers provide standardized tool integrations:

```yaml
---
name: data-analyst
description: Analyze data using database and visualization tools
mcpServers:
  postgres:
    command: "npx"
    args: ["@modelcontextprotocol/server-postgres"]
  playwright:
    command: "npx"
    args: ["@playwright/mcp@latest"]
---
```

Agent can then use `mcp__postgres__query` and `mcp__playwright__navigate` tools.

### MCP + Hooks for Governance

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-mcp-write.py"
          }
        ]
      }
    ]
  }
}
```

### MCP in Teams

Teammates inherit MCP server configuration from the project. Each teammate can use MCP tools independently, enabling scenarios like:
- One teammate queries the database
- Another teammate interacts with GitHub
- A third teammate uses Slack for notifications

**Limitation**: MCP tools are NOT available in background subagents.

> **Source**: [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp), [Agent SDK MCP Integration](https://platform.claude.com/docs/en/agent-sdk/mcp)

---

## 11. Google's 8 Multi-Agent Design Patterns (Industry Context)

For context on how Claude Code patterns map to industry-standard architectures:

| Google Pattern | Claude Code Equivalent |
|---------------|----------------------|
| **Sequential Pipeline** | Skill chain, SDK sequential composition |
| **Coordinator/Dispatcher** | Team lead with Task routing |
| **Parallel Fan-Out/Gather** | Agent teams with TaskCreate + parallel teammates |
| **Hierarchical Decomposition** | Lead -> TaskCreate with dependencies |
| **Generator and Critic** | Agent + PostToolUse hooks / prompt hooks |
| **Iterative Refinement** | Stop hooks that block completion + memory feedback |
| **Human-in-the-Loop** | Plan approval mode, permission hooks |
| **Composite** | Compound patterns combining all above |

> **Source**: [Google's Eight Essential Multi-Agent Design Patterns (InfoQ)](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/), [Google ADK Developer Guide](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)

---

## 12. Hooks System for Lifecycle Management

### Complete Hook Events

| Event | When | Can Block? | Key Use |
|-------|------|-----------|---------|
| `SessionStart` | Session begins/resumes | No | Load context, set env vars |
| `UserPromptSubmit` | User submits prompt | Yes | Validate/filter prompts |
| `PreToolUse` | Before tool executes | Yes | Block dangerous ops |
| `PermissionRequest` | Permission dialog shown | Yes | Auto-approve/deny |
| `PostToolUse` | After tool succeeds | No (feedback) | Lint, format, log |
| `PostToolUseFailure` | After tool fails | No (feedback) | Error handling, alerts |
| `Notification` | Claude sends notification | No | Custom alerts |
| `SubagentStart` | Subagent spawns | No | Inject context |
| `SubagentStop` | Subagent completes | Yes | Validate output |
| `Stop` | Claude finishes responding | Yes | Verify completeness |
| `TeammateIdle` | Teammate going idle | Yes | Quality gates |
| `TaskCompleted` | Task being marked done | Yes | Run tests, verify |
| `PreCompact` | Before context compaction | No | Save state |
| `SessionEnd` | Session terminates | No | Cleanup, logging |

### Hooks Scoped to Skills/Agents

Hooks can be defined in skill/agent frontmatter, scoped to that component's lifecycle:

```yaml
---
name: secure-operations
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

These hooks ONLY run while that skill/agent is active.

> **Source**: [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)

---

## Integration Pattern Decision Matrix

| Need | Pattern | Cost | Complexity |
|------|---------|------|-----------|
| Reusable workflow | Skill (inline) | Low | Low |
| Isolated task execution | Skill + `context: fork` | Low | Low |
| Specialized domain agent | Custom agent + memory | Medium | Medium |
| Parallel independent work | Agent team (3-5 members) | High | Medium |
| Cross-session learning | Agent + `memory: project` | Low | Low |
| Quality enforcement | Hooks (command/prompt/agent) | Low | Medium |
| Production automation | Agent SDK | Medium | High |
| External tool integration | MCP servers | Low | Low |
| Multi-step pipeline | Skill chain or SDK sequential | Medium | Medium |
| Adversarial validation | Team with competing hypotheses | High | Medium |

---

## Recommendations

### Start Simple, Scale Up
1. **Phase 1**: Skills for reusable workflows + CLAUDE.md for project memory
2. **Phase 2**: Custom agents with persistent memory for domain specialization
3. **Phase 3**: Agent teams for parallel work requiring discussion
4. **Phase 4**: Hooks for quality gates and lifecycle automation
5. **Phase 5**: SDK for CI/CD and production pipelines

### Key Design Principles
- **Decompose before parallelizing**: Plan-then-team is more cost-effective than improvised teams
- **Memory compounds**: Every session's learnings benefit future sessions
- **Hooks enforce, don't suggest**: Use deterministic quality gates, not hoping agents do the right thing
- **Right-size the tool**: Subagent for focused work, team for collaborative work, SDK for automated work
- **Files are the interface**: Between phases, between agents, between sessions -- files are the universal coordination mechanism

### Cost Awareness

| Approach | Tokens | Best For |
|----------|--------|----------|
| Solo session | ~200k | Single complex task |
| 3 subagents | ~440k | Parallel research |
| 3-person team | ~800k | Cross-layer coordination |
| 5-person team | ~1.2M | Full feature development |

> "Activity doesn't always translate to value. The risk with multi-agent systems is that they make it easy to produce large quantities of code very quickly. That code still needs to be right, maintainable, and solving the problem." -- Addy Osmani

---

## Gaps & Open Questions

1. **No native team memory**: Teams cannot share a persistent memory space across sessions. Workaround: file-based coordination + CLAUDE.md.
2. **No recursive spawning**: Subagents can't spawn subagents, teams can't spawn sub-teams. This limits depth but prevents runaway costs.
3. **Session resumption broken for teams**: `/resume` doesn't restore in-process teammates.
4. **No dynamic team resizing**: Can't add teammates after initial spawn easily.
5. **Hook composition**: No way to compose hooks from multiple skills/agents into a unified pipeline.
6. **Memory pruning**: No automatic mechanism to prune outdated memories. Agents must self-curate.
7. **Cross-agent memory sharing**: Agents with `memory: project` each get separate directories. No shared agent memory pool.

---

## Sources

### Official Anthropic Documentation
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Agent Skills Overview (Platform)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agent Skills in the SDK](https://platform.claude.com/docs/en/agent-sdk/skills)
- [Building Agents with Claude Agent SDK (Blog)](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)
- [Skills Explained (Blog)](https://claude.com/blog/skills-explained)
- [Equipping Agents with Skills (Engineering)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Enabling Autonomous Work](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- [2026 Agentic Coding Trends Report (PDF)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)

### Community Resources & Technical Deep Dives
- [Self-Improving Coding Agents (Addy Osmani)](https://addyosmani.com/blog/self-improving-agents/)
- [Claude Code Swarms (Addy Osmani)](https://addyosmani.com/blog/claude-code-agent-teams/)
- [From Tasks to Swarms (alexop.dev)](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)
- [Claude Code Swarm Orchestration Skill (Kieran Klaassen)](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)
- [Claude Code Multi-Agent Orchestration (Kieran Klaassen)](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f)
- [Claude Code Hidden Multi-Agent System (paddo.dev)](https://paddo.dev/blog/claude-code-hidden-swarm/)
- [Agent Teams Switch Got Flipped (paddo.dev)](https://paddo.dev/blog/agent-teams-the-switch-got-flipped/)
- [Claude Code Multiple Agent Systems Guide (eesel.ai)](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [Practical Guide to Sub-Agents (Medium)](https://new2026.medium.com/practical-guide-to-mastering-claude-codes-main-agent-and-sub-agents-fd52952dcf00)
- [Build Agent Skills with Claude Code 2.1 (Medium)](https://medium.com/@richardhightower/build-agent-skills-faster-with-claude-code-2-1-release-6d821d5b8179)
- [Claude Code Release Notes (Releasebot)](https://releasebot.io/updates/anthropic/claude-code)
- [Continuous Claude (GitHub)](https://github.com/AnandChowdhary/continuous-claude)
- [Claude-Flow Orchestration (GitHub)](https://github.com/ruvnet/claude-flow)
- [Claude Pipeline (GitHub)](https://github.com/aaddrick/claude-pipeline)
- [Awesome Claude Skills (GitHub)](https://github.com/travisvn/awesome-claude-skills)
- [wshobson/agents (GitHub)](https://github.com/wshobson/agents)

### Industry Context
- [Google's Eight Essential Multi-Agent Design Patterns (InfoQ)](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/)
- [Google ADK Multi-Agent Patterns (Developer Guide)](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Multi-Agent AI Orchestration 2025-2026 (onabout.ai)](https://www.onabout.ai/p/mastering-multi-agent-orchestration-architectures-patterns-roi-benchmarks-for-2025-2026)
- [How to Build Multi-Agent Systems (DEV Community)](https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6)
- [Microsoft Semantic Kernel + Claude Agent SDK](https://devblogs.microsoft.com/semantic-kernel/build-ai-agents-with-claude-agent-sdk-and-microsoft-agent-framework/)

### Memory-Specific Resources
- [Claude Code Session Memory (claudefa.st)](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Persistent Memory for Claude Code (Mem0)](https://mem0.ai/blog/persistent-memory-for-claude-code)
- [Claude-Mem Plugin (yuv.ai)](https://yuv.ai/blog/claude-mem)
- [Enable Persistent Memory Issue #4588 (GitHub)](https://github.com/anthropics/claude-code/issues/4588)
- [Super Claude Kit (GitHub)](https://github.com/arpitnath/super-claude-kit)

### Hooks-Specific Resources
- [Complete Guide to Hooks (claudefa.st)](https://claudefa.st/blog/tools/hooks/hooks-guide)
- [Hooks Guide with 20+ Examples (DEV Community)](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg)
- [Claude Code Hooks Mastery (GitHub)](https://github.com/disler/claude-code-hooks-mastery)
- [Claude Code Setup Hooks (claudefa.st)](https://claudefa.st/blog/tools/hooks/claude-code-setup-hooks)
