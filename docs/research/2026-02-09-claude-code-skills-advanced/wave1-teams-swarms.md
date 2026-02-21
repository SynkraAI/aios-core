# Deep Research: Claude Code Teams/Swarms - Multi-Agent Orchestration

**Date:** 2026-02-09
**Researcher:** deep-researcher agent
**Sources consulted:** 25+ unique sources, 15+ pages deep-read
**Status:** Complete

---

## TL;DR

- Claude Code Agent Teams shipped officially with Opus 4.6 (Feb 6, 2026) as an **experimental feature** behind `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Architecture: **Team Lead** + **N Teammates** + **Shared Task List** + **Mailbox System** — each teammate is a full independent Claude Code session
- 7 core primitives: `TeamCreate`, `TeamDelete` (cleanup), `TaskCreate`, `TaskUpdate`, `TaskList`, `TaskGet`, `SendMessage`
- The underlying `TeammateTool` has **13 operations**: spawnTeam, discoverTeams, cleanup, requestJoin, approveJoin, rejectJoin, write, broadcast, approvePlan, rejectPlan, requestShutdown, approveShutdown, rejectShutdown
- Real proof: Anthropic built a **100,000-line C compiler in Rust** using 16 parallel agents, ~2,000 sessions, $20K, passing 99% of GCC torture tests
- Key limitation: **no nested teams** (teammates cannot spawn sub-teams) — deliberate design to prevent runaway costs
- Third-party alternatives: **claude-flow** (60+ agents, MCP-native), **oh-my-claudecode** (5 execution modes), **claude-squad** (multi-tool), **ccswarm** (Rust-native)

---

## 1. Architecture Overview

### Core Components

| Component | Role |
|-----------|------|
| **Team Lead** | Main Claude Code session that creates team, spawns teammates, assigns tasks, synthesizes results |
| **Teammates** | Separate Claude Code instances, each with its own context window, working independently |
| **Task List** | Shared JSON files at `~/.claude/tasks/{team-name}/` with dependency tracking |
| **Mailbox** | Inter-agent messaging system with automatic delivery |

> "Unlike subagents, which run within a single session and can only report back to the main agent, teammates can talk to each other directly, message each other, challenge each other's findings, and self-coordinate." — [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams)

### Storage Structure

```
~/.claude/
├── teams/{team-name}/
│   ├── config.json          # members: [{name, agentId, agentType}]
│   └── messages/{session-id}/  # inter-agent messages
└── tasks/{team-name}/
    ├── 1.json               # {id, subject, description, status, owner, dependencies}
    ├── 2.json
    └── N.json
```

Source: [alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/), [paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/)

### Subagents vs Agent Teams

| Feature | Subagents | Agent Teams |
|---------|-----------|-------------|
| **Context** | Own context; results return to caller | Own context; fully independent |
| **Communication** | Report results back to main agent only | Teammates message each other directly |
| **Coordination** | Main agent manages all work | Shared task list with self-coordination |
| **Best for** | Focused tasks where only result matters | Complex work requiring discussion/collaboration |
| **Token cost** | Lower: results summarized back | Higher: each teammate is separate instance |
| **Nested** | Yes (subagent can spawn subagent) | No (teammates cannot spawn teams) |

Source: [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams)

---

## 2. API & Tool Reference

### 2.1 Team Lifecycle Tools

#### TeamCreate
Creates a new agent team with shared task list and config.

```json
{
  "team_name": "my-project",
  "description": "Working on feature X"
}
```

Creates: `~/.claude/teams/{team-name}/config.json` + `~/.claude/tasks/{team-name}/`

#### TeamDelete (cleanup)
Removes team config and task files. **Must be called by lead only.** Fails if active teammates exist.

Source: [Kieran Klaassen Gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)

### 2.2 Task Management Tools

#### TaskCreate
```json
{
  "subject": "Brief title",
  "description": "Detailed requirements",
  "activeForm": "Present continuous form for spinner"
}
```

#### TaskUpdate
```json
{
  "taskId": "1",
  "status": "in_progress",           // pending → in_progress → completed
  "owner": "agent-name",             // claim task
  "addBlockedBy": ["2", "3"],        // dependency management
  "addBlocks": ["4"]                 // reverse dependency
}
```

#### TaskList
Returns summary of all tasks: id, subject, status, owner, blockedBy.

#### TaskGet
Returns full task details by ID including description and dependencies.

**Task Status Workflow:** `pending` → `in_progress` → `completed` (or `deleted`)

**Dependency DAG:** Tasks support directed acyclic graphs. A task with `blockedBy` cannot be claimed until all blocking tasks complete. Auto-unblocking happens automatically.

**File Locking:** Task claiming uses file locking to prevent race conditions when multiple teammates try to claim simultaneously.

Source: [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams), [claudefa.st](https://claudefa.st/blog/guide/agents/agent-teams)

### 2.3 Communication: SendMessage

```json
{
  "type": "message",              // Direct message to one teammate
  "recipient": "agent-name",
  "content": "Your message here",
  "summary": "Brief preview (5-10 words)"
}
```

**Message Types:**

| Type | Purpose | Recipient |
|------|---------|-----------|
| `message` | Direct message to one teammate | Required: specific name |
| `broadcast` | Send to ALL teammates (expensive!) | All members |
| `shutdown_request` | Ask teammate to exit gracefully | Required: specific name |
| `shutdown_response` | Approve/reject shutdown | Via request_id |
| `plan_approval_response` | Approve/reject teammate's plan | Required: specific name |

**Automatic Delivery:** Messages arrive automatically without polling. Queued during active turn, delivered when turn completes.

**Idle Notifications:** Teammates automatically notify lead when finishing work. This is normal behavior, not an error.

Source: [Piebald-AI system prompts](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-sendmessagetool.md)

### 2.4 TeammateTool (13 Internal Operations)

Discovered via `strings` analysis of Claude Code binary v2.1.29:

| Category | Operations |
|----------|-----------|
| **Team Lifecycle** | `spawnTeam`, `discoverTeams`, `cleanup` |
| **Membership** | `requestJoin`, `approveJoin`, `rejectJoin` |
| **Communication** | `write` (direct), `broadcast` (all) |
| **Plan Control** | `approvePlan`, `rejectPlan` |
| **Shutdown** | `requestShutdown`, `approveShutdown`, `rejectShutdown` |

**Environment Variables (auto-set for teammates):**
- `CLAUDE_CODE_TEAM_NAME`
- `CLAUDE_CODE_AGENT_ID`
- `CLAUDE_CODE_AGENT_NAME`
- `CLAUDE_CODE_PLAN_MODE_REQUIRED`

**Feature gate:** Controlled by `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

Source: [paddo.dev - Hidden Multi-Agent System](https://paddo.dev/blog/claude-code-hidden-swarm/)

---

## 3. Orchestration Patterns

### 3.1 Parallel Specialists (Most Common)

Multiple agents with different specializations work simultaneously on the same codebase.

```
Lead → spawns 3 specialists:
  ├── security-reviewer (focus: token handling, input validation)
  ├── performance-reviewer (focus: N+1 queries, memory leaks)
  └── test-reviewer (focus: coverage gaps, edge cases)
Lead ← synthesizes 3 independent reports
```

**Best for:** Code review, research, investigation
**Token overhead:** ~3x single session

Source: [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams)

### 3.2 Competing Hypotheses (Adversarial Debate)

```
Lead → spawns 5 investigators:
  ├── hypothesis-1: "connection pooling issue"
  ├── hypothesis-2: "race condition in auth"
  ├── hypothesis-3: "memory leak in WebSocket"
  ├── hypothesis-4: "timeout misconfiguration"
  └── hypothesis-5: "DNS resolution failure"
Teammates ↔ message each other to disprove theories
Lead ← consensus emerges through scientific debate
```

> "Sequential investigation suffers from anchoring: once one theory is explored, subsequent investigation is biased toward it. With multiple independent investigators actively trying to disprove each other, the theory that survives is much more likely to be the actual root cause." — [Anthropic Docs](https://code.claude.com/docs/en/agent-teams)

**Best for:** Debugging with unknown root cause

### 3.3 Cross-Layer Coordination

```
Lead → spawns 3 layer owners:
  ├── backend (owns: src/api/)
  ├── frontend (owns: src/components/)
  └── testing (owns: tests/)
Tasks with dependencies:
  T1: Backend API [no deps]
  T2: Frontend components [blocked by T1]
  T3: Integration tests [blocked by T1, T2]
```

**Best for:** Full-stack features, clear file ownership boundaries

### 3.4 Sequential Pipeline

Tasks with explicit dependency chains execute in waves:

```
Wave 1 (parallel): Research → multiple agents investigate
Wave 2 (sequential): Plan → architect synthesizes findings
Wave 3 (parallel): Implement → developers build components
Wave 4 (sequential): Review → quality gate checks
```

**Best for:** Phased projects with clear stage gates

### 3.5 Self-Organizing Swarm

Teammates autonomously poll TaskList, claim available unblocked tasks, complete them, and repeat:

```
Lead creates 20 tasks → spawns 4 teammates
Each teammate: TaskList() → claim next → execute → complete → repeat
No explicit assignment needed
```

**Best for:** Large task lists with independent items (e.g., processing 500 items)

### 3.6 Plan-Approve-Execute

```
Lead → spawns architect with plan_mode_required=true
Architect plans → sends plan_approval_request to Lead
Lead reviews → approves or rejects with feedback
If approved → Architect exits plan mode → begins implementation
If rejected → Architect revises → resubmits
```

**Best for:** Risky refactors, architectural changes

Source: [Addy Osmani](https://addyosmani.com/blog/claude-code-agent-teams/), [Kieran Klaassen Gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)

---

## 4. Quality Gates & Hooks

### TeammateIdle Hook

Runs when a teammate is about to go idle. Exit code 2 sends feedback and keeps teammate working.

```json
// .claude/settings.json
{
  "hooks": {
    "TeammateIdle": [{
      "command": "node ./scripts/check-teammate-idle.js"
    }]
  }
}
```

### TaskCompleted Hook

Runs when a task is being marked complete. Exit code 2 prevents completion and sends feedback.

```json
{
  "hooks": {
    "TaskCompleted": [{
      "command": "npm test -- --bail"
    }]
  }
}
```

**Use case:** "Run the test suite before a teammate marks its task complete"

Added in Claude Code v2.1.33.

Source: [code.claude.com](https://code.claude.com/docs/en/agent-teams), [@oikon48 on X](https://x.com/oikon48/status/2019625412180283463)

---

## 5. Display Modes & Interaction

### In-Process Mode (Default)

All teammates run inside main terminal. Works in any terminal.

| Shortcut | Action |
|----------|--------|
| `Shift+Up/Down` | Select teammate |
| `Enter` | View teammate's full session |
| `Escape` | Interrupt teammate's current turn |
| `Ctrl+T` | Toggle task list |
| `Shift+Tab` | Toggle delegate mode |

### Split Pane Mode

Each teammate gets its own terminal pane. Requires tmux or iTerm2.

```json
{
  "teammateMode": "tmux"  // or "in-process" or "auto"
}
```

**Not supported in:** VS Code integrated terminal, Windows Terminal, Ghostty

### Delegate Mode

Restricts lead to coordination-only tools (spawning, messaging, shutting down, task management). Prevents lead from implementing tasks itself.

**Toggle:** `Shift+Tab`

Source: [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams)

---

## 6. The C Compiler Case Study (Anthropic's Stress Test)

### Project Stats

| Metric | Value |
|--------|-------|
| **Agents** | 16 parallel Claude Opus 4.6 instances |
| **Sessions** | ~2,000 Claude Code sessions |
| **Cost** | ~$20,000 |
| **Input Tokens** | 2 billion |
| **Output Tokens** | 140 million |
| **Duration** | ~2 weeks |
| **Code Output** | 100,000 lines of Rust |
| **Test Pass Rate** | 99% GCC torture tests |
| **Targets** | x86, ARM, RISC-V |
| **Could Compile** | Linux 6.9, QEMU, FFmpeg, SQLite, PostgreSQL, Redis, Doom |

### Architecture

**Decentralized coordination** — no centralized orchestrator:
- Each agent runs in isolated Docker container
- Shared Git repository as coordination mechanism
- Lock-based task claiming: write file to `current_tasks/parse_if_statement.txt`
- Git synchronization forces second agent to pick different task on conflict

**Workflow per agent:**
1. Pull from upstream git repo
2. Clone to `/workspace`
3. Claim task via lock file
4. Work on task
5. Pull upstream changes, merge, push
6. Remove lock file
7. Infinite loop spawns fresh session

### Two-Phase Approach

**Phase 1 (Horizontal):** Agents worked on different small open-source projects (SQLite, Redis, libjpeg, MQuickJS, Lua) until 99% test pass rate.

**Phase 2 (Vertical - Linux Kernel):** Initially failed because "every agent would hit the same bug, fix that bug, and then overwrite each other's changes." Solution: **GCC Oracle** — randomly compile most kernel files with GCC, use Claude's compiler for remainder. This let agents "work in parallel, fixing different bugs in different files."

### Key Lessons

1. **Test quality is paramount:** "Claude will work autonomously to solve whatever problem I give it. So it's important that the task verifier is nearly perfect."
2. **Context pollution kills productivity:** Tests must output to files, not console. Errors must be grep-friendly.
3. **Time awareness missing:** Claude "will happily spend hours running tests instead of making progress." Need progress indicators and time-bound modes.
4. **CI prevents regressions:** Near project end, "Claude started to frequently break existing functionality."
5. **Specialization helps:** One agent for deduplication, one for performance, one for code generation efficiency.
6. **Self-preservation lacking:** An agent once executed `pkill -9 bash`, "thus killing itself and ending the loop."

### Limitations

- No 16-bit x86 (output exceeds 32KB limit; falls back to GCC)
- Assembler/linker "somewhat buggy" (used GCC versions for demo)
- Code efficiency: "outputs less efficient code than GCC with all optimizations disabled"
- Rust quality: "reasonable, but nowhere near what an expert Rust programmer might produce"
- "Nearly reached the limits of Opus's abilities"

> "A fraction of what it would cost me to produce this myself—let alone an entire team." — [Anthropic Engineering Blog](https://www.anthropic.com/engineering/building-c-compiler)

Source: [Anthropic Engineering](https://www.anthropic.com/engineering/building-c-compiler)

---

## 7. Token Economics

### Cost Model

| Configuration | Estimated Token Usage |
|---------------|----------------------|
| Solo session | ~200k tokens |
| 3 subagents | ~440k tokens (each has own context) |
| 3-person team | ~800k tokens (full collaboration overhead) |
| 5-person team, 30 min | ~3-4x single sequential session |
| 16 agents, 2 weeks | 2 billion input + 140 million output (~$20K) |

### Cost Optimization Strategies

1. **Model mixing:** Run lead on Opus (strategic decisions), teammates on Sonnet (implementation)
2. **Plan first:** Use `/plan` mode (cheap) to decompose, then execute as team (expensive but fast)
3. **Pre-approve permissions:** Reduces interruptions and wasted cycles
4. **Task sizing:** 5-6 tasks per teammate keeps everyone productive
5. **Avoid broadcast:** Target messages to specific teammates (broadcast costs scale linearly)

> "4 agents, 6 tasks, ~6 min wall clock vs ~18-20 min sequential. Token cost: roughly 4x a single session." — [HN User Report](https://news.ycombinator.com/item?id=46902368)

---

## 8. Configuration Reference

### Enable Agent Teams

```json
// ~/.claude/settings.json OR project .claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Shared Task List (Cross-Session)

```bash
export CLAUDE_CODE_TASK_LIST_ID="shared-project-name"
```

Multiple Claude Code instances with the same `CLAUDE_CODE_TASK_LIST_ID` share task state.

### Display Mode

```json
{
  "teammateMode": "in-process"  // "in-process" | "tmux" | "auto"
}
```

```bash
claude --teammate-mode in-process
```

### Force Spawn Backend

```bash
export CLAUDE_CODE_SPAWN_BACKEND="tmux"  // "in-process" | "tmux" | "iterm2"
```

Source: [code.claude.com](https://code.claude.com/docs/en/agent-teams), [marco.dev](https://www.marc0.dev/en/blog/claude-code-agent-teams-multiple-ai-agents-working-in-parallel-setup-guide-1770317684454)

---

## 9. Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| No session resumption for in-process teammates | `/resume` and `/rewind` don't restore teammates | Spawn new teammates after resume |
| Task status can lag | Teammates forget to mark completion, blocking dependents | Manually update or nudge |
| Shutdown can be slow | Teammates finish current request first | Be patient or force-kill tmux |
| One team per session | Cannot run multiple teams | Clean up before starting new |
| No nested teams | Teammates cannot spawn sub-teams | Deliberate design for cost control |
| Lead is fixed | Cannot promote teammate to lead | Plan team structure upfront |
| Permissions set at spawn | All teammates inherit lead's permissions | Change individually after spawn |
| No file locking between teammates | Last write wins on same file | Partition file ownership |
| Split panes limited | No VS Code, Windows Terminal, Ghostty | Use in-process mode |

Source: [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams)

---

## 10. Third-Party Frameworks & Ecosystem

### claude-flow (ruvnet)

- **Scale:** 60+ specialized agents in coordinated swarms
- **Features:** Hive Mind system (queen-led hierarchical coordination), 170+ MCP tools, RuVector vector DB
- **Performance:** 84.8% SWE-Bench, 75% cost savings
- **Architecture:** Self-learning SONA system, fault-tolerant consensus
- **Adoption:** ~500K downloads, ~100K monthly active users
- **Best for:** Enterprise-grade orchestration at scale

Source: [GitHub - ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)

### oh-my-claudecode

| Mode | Description |
|------|-------------|
| **Autopilot** | Full autonomous execution |
| **Ultrapilot** | 3-5x parallel with file ownership partitioning |
| **Swarm** | N agents on shared task pool (SQLite-based atomic claiming) |
| **Pipeline** | Sequential agent chaining with data passing |
| **Ecomode** | 30-50% token savings with smart routing |

- **Agents:** 32 specialized agents, 31+ skills
- **Smart routing:** Haiku for simple tasks, Opus for complex reasoning
- **Best for:** Developers wanting flexible patterns without config complexity

Source: [GitHub - Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)

### claude-squad

- **Multi-tool:** Manages Claude Code, Aider, Codex, OpenCode, Amp simultaneously
- **Isolation:** Git worktree separation preventing conflicts
- **Interface:** Unified terminal management
- **Best for:** Teams using multiple AI coding tools

### ccswarm

- **Implementation:** Rust-native with zero-cost abstractions
- **Architecture:** Type-state patterns, channel-based coordination
- **Overhead:** Minimal orchestration latency
- **Best for:** Performance-critical workflows with large codebases

### Decision Framework

```
Is this production code?
├── YES → Use Official Subagents (stable, documented)
└── NO → Experimental acceptable?
    ├── YES → Evaluate Agent Teams for learning
    └── NO → Assess Third-Party Frameworks
        ├── Need enterprise scale? → claude-flow
        ├── Need execution flexibility? → oh-my-claudecode
        ├── Manage multiple tools? → claude-squad
        └── Performance critical? → ccswarm
```

Source: [eesel.ai](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)

---

## 11. Comparison: Claude Code Teams vs Other Multi-Agent Frameworks

| Feature | Claude Code Teams | CrewAI | AutoGen | LangGraph |
|---------|-------------------|--------|---------|-----------|
| **Philosophy** | File-based coordination | Role-based | Conversation-based | Graph-based |
| **Setup** | Natural language prompt | Python classes | Python config | State machine |
| **Communication** | Mailbox + Tasks | Direct method calls | Chat messages | State transitions |
| **Dependencies** | DAG via blockedBy/blocks | Process flows | Chat rounds | Graph edges |
| **Persistence** | File system (~/.claude/) | In-memory | In-memory | Checkpoints |
| **LLM Lock-in** | Claude only | Multi-LLM | Multi-LLM | Multi-LLM |
| **Token cost** | High (full sessions) | Moderate | Variable | Moderate |
| **Learning curve** | Low (natural language) | Medium | Medium | High |
| **Production ready** | Experimental | Yes (18M funding) | Yes (Microsoft) | Yes (LangChain) |
| **Unique strength** | Deep codebase integration | Role abstractions | Iterative debate | State management |

**Key differentiator:** Claude Code Teams uniquely integrates with the entire Claude Code ecosystem (CLAUDE.md, skills, MCP servers, file editing) — it's not just an orchestration layer, it's a development environment with built-in multi-agent coordination.

Source: [dev.to comparison](https://dev.to/pockit_tools/langgraph-vs-crewai-vs-autogen-the-complete-multi-agent-ai-orchestration-guide-for-2026-2d63), [DataCamp](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)

---

## 12. Best Practices (Consolidated)

### Task Design

1. **Decompose before spawning:** Use `/plan` mode first (cheap), then execute as team (expensive)
2. **5-6 tasks per teammate:** Keeps everyone productive; enables reassignment if stuck
3. **Self-contained tasks:** Each task produces a clear deliverable (function, test file, review)
4. **Clear file ownership:** Never let two teammates edit the same file
5. **Include acceptance criteria:** In task descriptions, not just titles

### Team Management

6. **Start with read-only:** First team run should be code review, not implementation
7. **Use delegate mode:** Prevents lead from coding instead of coordinating
8. **Require plan approval for risky work:** Architect plans before implementing
9. **Pre-approve permissions:** Reduce interruption friction
10. **Monitor actively:** Check progress regularly via `Ctrl+T` or split panes

### Communication

11. **Prefer `message` over `broadcast`:** Targeted is cheaper and more effective
12. **Give enough context in spawn prompts:** Teammates don't inherit conversation history
13. **Include file paths and tech details:** "Review src/auth/ for JWT vulnerabilities"

### Cost Control

14. **Model mixing:** Opus for lead, Sonnet for teammates
15. **Kill idle teammates:** Don't let them run after work is done
16. **Clean up after each team:** Prevent resource accumulation
17. **Don't use teams for sequential work:** Subagents or single session are cheaper

Source: [Anthropic Official Docs](https://code.claude.com/docs/en/agent-teams), [Addy Osmani](https://addyosmani.com/blog/claude-code-agent-teams/), [alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)

---

## 13. Community Perspectives

### Positive

- "I'm releasing features to my platform daily now, instead of weekly." — HN user
- Real metrics: "4 agents, 6 tasks, ~6 min wall clock vs ~18-20 min sequential" — FastAPI developer
- C compiler case study proves concept at scale (100K lines, 99% test pass)

### Skeptical

- "I absolutely cannot trust Claude code to independently work on large tasks... I need to guide more of the design process." — experienced developer
- Cost concerns: "who can actually afford to let these agents run on tasks all day long?"
- "Activity doesn't always translate to value" — warning about parallel execution metrics
- Junior developer skill atrophy concerns when AI generates bulk code

### Balanced

- Validation remains the limiting factor, not orchestration capability
- Results depend heavily on implementation skill (problem decomposition, task design)
- Multi-agent justified only when parallel exploration adds genuine value

Source: [Hacker News](https://news.ycombinator.com/item?id=46902368)

---

## 14. Market Context (2026)

- **Gartner:** 1,445% surge in multi-agent system inquiries from Q1 2024 to Q2 2025
- **Prediction:** 40% of enterprise applications will include task-specific AI agents by end of 2026 (vs <5% in 2025)
- **CrewAI:** $18M funding, 100K+ certified developers, 60% Fortune 500 adoption, 60M+ agent executions/month
- **AutoGen:** Microsoft Research backing, v0.4 complete redesign (Jan 2025)
- **LangGraph:** Trusted by Klarna, Replit, Elastic, Uber, LinkedIn

Source: [eesel.ai](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide), [o-mega.ai](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)

---

## 15. Execution Flow: Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     SETUP PHASE                              │
│                                                              │
│  User: "Create a team to review PR #142"                     │
│  Lead: TeamCreate("pr-review-142")                           │
│  Lead: TaskCreate({subject: "Security review", ...})         │
│  Lead: TaskCreate({subject: "Performance review", ...})      │
│  Lead: TaskCreate({subject: "Test coverage review", ...})    │
│  Lead: Task(spawn "security-reviewer")                       │
│  Lead: Task(spawn "perf-reviewer")                           │
│  Lead: Task(spawn "test-reviewer")                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   EXECUTION PHASE                            │
│                                                              │
│  Each teammate independently:                                │
│    1. TaskList() → find pending unblocked task               │
│    2. TaskUpdate(claim: status="in_progress", owner=me)      │
│    3. Execute work (read files, analyze, etc.)               │
│    4. TaskUpdate(status="completed")                         │
│    5. SendMessage(type="message", to="team-lead", findings)  │
│    6. TaskList() → check for more work                       │
│    7. If no work → go idle (automatic notification to lead)  │
│                                                              │
│  File locking prevents race conditions on task claiming      │
│  Dependencies auto-unblock when prerequisites complete       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   TEARDOWN PHASE                             │
│                                                              │
│  Lead: SendMessage(type="shutdown_request", to="teammate-1") │
│  Teammate-1: SendMessage(type="shutdown_response", approve)  │
│  Lead: (repeat for each teammate)                            │
│  Lead: cleanup() → removes team config and task files        │
└─────────────────────────────────────────────────────────────┘
```

---

## Sources

### Official Documentation
- [Orchestrate teams of Claude Code sessions - Anthropic Docs](https://code.claude.com/docs/en/agent-teams)
- [Create custom subagents - Anthropic Docs](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Building a C compiler with a team of parallel Claudes - Anthropic Engineering](https://www.anthropic.com/engineering/building-c-compiler)

### Technical Analysis
- [From Tasks to Swarms: Agent Teams in Claude Code - alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)
- [Claude Code Swarms - Addy Osmani](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Claude Code's Hidden Multi-Agent System - paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/)
- [Claude Code Agent Teams: Multi-Session Orchestration - claudefa.st](https://claudefa.st/blog/guide/agents/agent-teams)

### Community & Guides
- [Claude Code Swarm Orchestration Skill - Kieran Klaassen (GitHub Gist)](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)
- [Claude Code Agent Teams Setup Guide - marc0.dev](https://www.marc0.dev/en/blog/claude-code-agent-teams-multiple-ai-agents-working-in-parallel-setup-guide-1770317684454)
- [Claude Code multiple agent systems: Complete 2026 guide - eesel.ai](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [TeammateTool System Prompt - Piebald-AI (GitHub)](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-teammatetool.md)
- [Hacker News Discussion](https://news.ycombinator.com/item?id=46902368)

### Third-Party Frameworks
- [claude-flow - ruvnet (GitHub)](https://github.com/ruvnet/claude-flow)
- [oh-my-claudecode - Yeachan-Heo (GitHub)](https://github.com/Yeachan-Heo/oh-my-claudecode)

### Framework Comparisons
- [LangGraph vs CrewAI vs AutoGen: 2026 Guide - dev.to](https://dev.to/pockit_tools/langgraph-vs-crewai-vs-autogen-the-complete-multi-agent-ai-orchestration-guide-for-2026-2d63)
- [CrewAI vs LangGraph vs AutoGen - DataCamp](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
- [Top 10 AI Agent Frameworks - o-mega.ai](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)

### News Coverage
- [Claude Code Swarms: Multi-Agent AI Coding - zenvanriel.nl](https://zenvanriel.nl/ai-engineer-blog/claude-code-swarms-multi-agent-orchestration/)
- [Claude Code's Tasks Update - VentureBeat](https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across)

---

## Gaps & Future Research

1. **Nested teams timeline:** When will Anthropic allow teammates to spawn sub-teams? No public roadmap.
2. **Token optimization techniques:** No detailed benchmarks on model-mixing savings (Opus lead + Sonnet teammates).
3. **Session resumption fix:** `/resume` for in-process teammates is a known gap with no announced fix date.
4. **Multi-repo coordination:** No documentation on agent teams spanning multiple repositories.
5. **CI/CD integration:** How to integrate agent teams into automated pipelines (beyond hooks).
6. **Security implications:** No analysis of permission escalation risks in multi-agent setups.
7. **Comparison benchmarks:** No head-to-head benchmark of Claude Code Teams vs CrewAI vs AutoGen on identical tasks.
