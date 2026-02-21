# Wave 2: Third-Party Multi-Agent Orchestration Tools for Claude Code

> Deep-dive into claude-flow, oh-my-claudecode, claude-squad, and ccswarm.
> Research date: 2026-02-09 | 15+ sources consulted, full page reads via WebFetch.

---

## TL;DR

- **claude-flow** is the most ambitious: 60+ agents, 87 MCP tools, WASM agent booster, queen-led swarm topologies, and a self-learning routing system (SONA). Claims 84.8% SWE-Bench. However, the architecture is heavily over-engineered with many features that appear aspirational rather than production-tested.
- **oh-my-claudecode** is the most practical for Claude Code users: 7 execution modes (autopilot, ultrapilot, ultrawork, swarm, pipeline, ecomode, ralph), 28 agents, 37 skills, and a hooks system that injects orchestration into native Claude Code. Uses SQLite for swarm task claiming and file-ownership partitioning for parallelism.
- **claude-squad** is the simplest and most mature (5.8k stars): a Go TUI that manages multiple AI agents (not just Claude) in isolated tmux sessions with Git worktree per agent. No agent coordination -- just parallel isolation. Best for "run N agents on N tasks" without inter-agent communication.
- **ccswarm** is an early-stage Rust framework with strong architectural ideas (channel-based orchestration, type-state pattern, zero Arc) but incomplete implementation. The orchestrator coordination loop is not wired, and many features are planned but not built.

**For MMOS/Synkra AIOS**: The most reusable patterns are (1) oh-my-claudecode's SQLite task claiming for swarm coordination, (2) claude-squad's Git worktree isolation for parallel agent work, and (3) claude-flow's 3-tier model routing concept (WASM/Haiku/Opus).

---

## 1. claude-flow (ruvnet/claude-flow)

**Repository**: [github.com/ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)
**Stars**: High activity, ~100K monthly active users (claimed)
**Version**: v3 (alpha rebuild)
**Language**: TypeScript/JavaScript + WASM

### 1.1 Architecture Overview

claude-flow operates as a meta-orchestration layer that sits between the user and Claude Code, routing tasks through intelligent analysis before dispatching to agent swarms.

```
User -> Claude-Flow (CLI/MCP) -> Router (Q-Learning) -> Swarm -> Agents -> Memory -> LLM Providers
                                      |
                                  Learning feedback loop
```

**Core design principle**: "1 MESSAGE = ALL RELATED OPERATIONS" -- the system mandates that all operations must be concurrent/parallel in a single message, combining MCP tool initialization with Claude Code's Task tool for spawning agents simultaneously.

### 1.2 Agent System (64 Agents, 12 Categories)

The agent hierarchy uses a **queen-led structure** with three queen types and eight worker types:

| Queen Type | Role |
|-----------|------|
| Strategic | Planning and high-level decisions |
| Tactical | Execution coordination |
| Adaptive | Runtime optimization |

| Worker Type | Specialization |
|-------------|---------------|
| Researcher | Analysis and requirements gathering |
| Coder | Implementation |
| Analyst | Code quality and performance |
| Tester | Test coverage and validation |
| Architect | System design and decisions |
| Reviewer | Quality and security review |
| Optimizer | Performance tuning |
| Documenter | Documentation generation |

**Agent categories span 12 domains**: Core Development (5), Swarm Coordination (3), Hive-Mind Intelligence (3), Consensus & Distributed Systems (7), Performance & Optimization (5), GitHub & Repository Management (12), SPARC Methodology (4), Specialized Development (8), Testing & Validation (2), Templates & Orchestration (7), Analysis & Architecture (2), Specialized Domains (3).

Agents are configured via YAML frontmatter:

```yaml
---
name: agent-name
type: agent-type
priority: high|medium|low|critical
capabilities:
  - capability_1
  - capability_2
hooks:
  pre: "Pre-execution commands"
  post: "Post-execution commands"
---
```

### 1.3 Coordination Patterns

**Topology options**:
- **Hierarchical**: Queen-led tree structure (default)
- **Mesh**: Peer-to-peer with fault tolerance
- **Ring**: Sequential message passing
- **Star**: Central coordinator with spoke workers

**Consensus mechanisms** (5 algorithms):
1. **Raft** -- Leader-based consistency (preferred default for anti-drift)
2. **Byzantine Fault Tolerant** -- Tolerates f < n/3 failures
3. **Gossip Protocol** -- Distributed information sharing
4. **Weighted Voting** -- Queen votes count 3x
5. **Majority Rule** -- Simple plurality

**Auto-Start Protocol** initializes with 6 specialized agents at dependency levels:
- Level 0: Architect (independent)
- Level 1: Coder, Tester (depend on Architect output)
- Level 2: Reviewer (depends on both Coder and Tester)

### 1.4 Shared State & Memory

The memory layer is the most complex aspect of claude-flow:

| Component | Function | Performance |
|-----------|----------|-------------|
| RuVector (HNSW) | Vector search for agent knowledge | 150x-12,500x faster than standard |
| ReasoningBank | Pattern storage with trajectory learning | RETRIEVE-JUDGE-DISTILL-CONSOLIDATE-ROUTE cycle |
| AgentDB | Persistent SQLite with WAL | Write-ahead logging for durability |
| LRU Cache | In-memory hot data | Configurable eviction |

**Memory coordination** uses namespaced stores:

```
memory store --namespace collaboration --key [identifier] --value [data]
memory search --namespace collaboration --query [pattern]
memory retrieve --namespace collaboration --key [identifier]
```

### 1.5 MCP Integration (87 Tools)

Tools are exposed through the `mcp__claude-flow__` namespace in 8 categories:

| Category | Count | Examples |
|----------|-------|---------|
| Swarm Management | 16 | `swarm_init`, `agent_spawn`, `task_orchestrate` |
| Neural & AI | 15 | Training, inference, pattern recognition |
| Memory & Persistence | 10 | Storage, search, backup |
| Performance & Analytics | 10 | Monitoring, benchmarking |
| GitHub Integration | 6 | PR management, workflow automation |
| Dynamic Agent Architecture | 6 | Agent creation, consensus |
| Workflow & Automation | 8 | Pipeline creation, scheduling |
| System Utilities | 16 | Diagnostics, security scanning |

### 1.6 3-Tier Model Routing (Key Pattern)

This is one of the most reusable patterns from claude-flow:

| Tier | Handler | Speed | Use Case |
|------|---------|-------|----------|
| 1 | Agent Booster (WASM) | <1ms | Simple code transforms (var-to-const, type annotations) |
| 2 | Haiku | ~500ms | Basic tasks (simple analysis, formatting) |
| 3 | Opus + Swarm | 2-5s | Complex reasoning (architecture, debugging) |

The system checks for `[AGENT_BOOSTER_AVAILABLE]` signals before spawning full agents, routing 352x faster for simple transforms.

### 1.7 Self-Learning (SONA)

SONA (Self-Optimizing Neural Adaptation) learns from task outcomes:
- Q-Learning router analyzes task complexity
- Mixture of Experts (8 experts) suggests optimal agent types
- Successful patterns stored in ReasoningBank for future routing
- Claims <0.05ms routing adjustment and 34,798 routes/second

### 1.8 Critical Assessment

**Strengths**:
- Most comprehensive feature set of any third-party tool
- MCP-native integration is architecturally sound
- 3-tier routing is a genuinely useful pattern
- Memory layer design is well-thought-out

**Weaknesses / Red Flags**:
- Architecture is over-engineered: Byzantine fault tolerance for coding agents is overkill
- Many performance claims (84.8% SWE-Bench, 352x faster) are unverified
- "100K monthly active users across 80 countries" seems inflated for a GitHub project
- SONA/EWC++/Flash Attention -- these are ML concepts being applied metaphorically, not actual implementations of the algorithms
- The sheer number of agents (64) and tools (87) suggests feature-flag marketing rather than focused engineering

**Reusable patterns for MMOS**:
1. 3-tier model routing (WASM/Haiku/Opus)
2. Namespaced memory stores for agent coordination
3. Dependency-level agent spawning (L0 -> L1 -> L2)
4. MCP namespace pattern (`mcp__tool__action`)

---

## 2. oh-my-claudecode (Yeachan-Heo/oh-my-claudecode)

**Repository**: [github.com/Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
**Website**: [ohmyclaudecode.com](https://ohmyclaudecode.com/)
**Version**: Active development (plugin-based)
**Language**: Claude Code Skills/Agents (YAML + Markdown, no external runtime)

### 2.1 Architecture Overview

oh-my-claudecode (OMC) is fundamentally different from claude-flow: rather than being an external orchestration platform, it is a **Claude Code plugin** that injects orchestration behavior through skills, agents, and hooks into the native Claude Code runtime.

```
Claude Code -> OMC Hooks (31) -> Mode Detection -> Agent Routing -> Task Execution
                    |                                    |
               Rules Injection                    Model Routing
               Todo Continuation                  State Management (.omc/)
               Recovery Handling                  Skill Composition
```

**Key insight**: OMC works INSIDE Claude Code, not outside it. This means zero infrastructure overhead -- it extends native capabilities rather than wrapping them.

### 2.2 Execution Modes (7+)

This is OMC's differentiator -- multiple execution paradigms optimized for different scenarios:

#### Autopilot
- Fully autonomous sequential execution
- Single agent runs from concept to completion
- Simplest mode, no coordination overhead
- Best for: Well-defined single-component tasks

#### Ultrapilot
- **3-5x faster** through file-ownership partitioning
- Up to 5 parallel executor agents
- Each agent "owns" specific files, preventing race conditions
- Automatic work distribution across agents
- Best for: Multi-component features (frontend + backend + tests)

#### Ultrawork
- Maximum parallelism without file ownership constraints
- Agents work on independent subtasks
- Best for: Large independent task sets

#### Swarm
- N coordinated agents on a **shared task pool**
- **SQLite-based atomic task claiming** (`swarm.db`) prevents duplicate work
- Database-level locking ensures no two agents claim the same task
- Best for: Large backlogs where tasks are independent but need coordination

#### Pipeline
- Sequential agent chaining with **data passing between stages**
- Each stage produces output consumed by the next
- Supports preset and custom pipeline definitions
- Error handling at each stage boundary
- Best for: Workflows with clear stage dependencies (analysis -> design -> implement -> test)

#### Ecomode
- **Smart model routing** based on task complexity:
  - Simple lookups -> Haiku
  - Standard work -> Sonnet
  - Complex reasoning -> Opus
- 30-50% token savings
- Takes precedence when both ecomode and ultrawork are specified
- Best for: Cost-conscious development, large codebases

#### Ralph
- **Persistence mode**: "won't stop until verified complete"
- Self-referential development with architect verification
- Survives rate limits and context compaction
- Best for: Complex multi-day features requiring persistence

#### UltraQA
- Autonomous quality assurance cycling
- Iterative test-fix-verify loops
- Best for: Stabilization phases, pre-release QA

### 2.3 Agent System (28 Agents, 3 Tiers)

Agents are organized by domain and model tier:

| Domain | Agents | Models Used |
|--------|--------|-------------|
| Architecture/Analysis | architect, architect-medium, architect-low | Opus/Sonnet/Haiku |
| Execution | executor, executor-low, executor-high | Sonnet/Haiku/Opus |
| Search | explore, explore-high | Haiku/Opus |
| Research | researcher | Sonnet |
| Frontend | designer, designer-low, designer-high | Sonnet/Haiku/Opus |
| Documentation | writer | Haiku |
| Vision | vision | Sonnet |
| Strategic | planner, analyst, critic | Opus |
| Testing | qa-tester | Sonnet |
| Security | security-reviewer, security-reviewer-low | Opus/Haiku |
| Build | build-fixer | Sonnet |
| TDD | tdd-guide, tdd-guide-low | Sonnet/Haiku |
| Code Review | code-reviewer | Opus |
| Data Science | scientist, scientist-high | Sonnet/Opus |

**Delegation protocol**: The orchestrator routes work to agents based on task type, never executing directly:

| Work Type | Delegate To | Model |
|-----------|------------|-------|
| Code changes | executor variants | Sonnet/Haiku/Opus |
| Analysis | architect variants | Opus/Sonnet/Haiku |
| Search | explore agents | Haiku/Opus |

### 2.4 Skills System (37 Skills)

**Core Orchestration** (13): orchestrate, autopilot, ultrawork, ultrapilot, swarm, pipeline, ecomode, ralph, ralph-init, ultraqa, plan, ralplan, review

**Enhancement** (12): deepinit, deepsearch, analyze, research, frontend-ui-ux, git-master, tdd, learner, build-fix, code-review, security-review

**Utilities** (12): note, cancel, omc-setup, doctor, help, hud, release, mcp-setup, writer-memory, project-session-manager, skill

All skills invokable as `/oh-my-claudecode:{skill}` slash commands.

### 2.5 Hooks System (31 Hooks)

This is where OMC's real power lies -- hooks inject behavior at lifecycle points:

| Category | Hooks | Function |
|----------|-------|----------|
| Execution Modes | autopilot, ultrawork, ralph, ultrapilot, ultraqa, swarm, mode-registry, persistent-mode | Mode-specific behavior injection |
| Core | rules-injector, omc-orchestrator, auto-slash-command, keyword-detector, todo-continuation, notepad, learner | Core orchestration infrastructure |
| Context & Recovery | recovery, preemptive-compaction, pre-compact, directory-readme-injector | State management and resilience |
| Quality & Validation | comment-checker, thinking-block-validator, empty-message-sanitizer, permission-handler, think-mode | Output quality enforcement |
| Coordination | subagent-tracker, session-end, non-interactive-env, agent-usage-reminder, background-notification | Multi-agent coordination |

**Magic keywords** trigger mode activation automatically: typing "ultrawork" in a prompt activates ultrawork mode without explicit slash commands.

### 2.6 IDE-Like Intelligence (LSP + AST)

OMC provides agents with IDE-level capabilities:

**LSP Tools** (12): Hover information, go-to-definition, find references, workspace symbols, diagnostics, rename operations

**AST Tools** (2): Structural code search and transformation using ast-grep patterns

**Python REPL**: Data analysis execution within agent context

### 2.7 State Management

Execution state persists in `.omc/` directories:
- Plan-scoped notepads capture learnings, decisions, and issues
- SQLite-backed MCP job state storage for swarm coordination
- Session persistence across rate limits and compaction events

Configuration via `~/.claude/.omc-config.json`:
```json
{
  "defaultExecutionMode": "ultrawork"
}
```

### 2.8 Critical Assessment

**Strengths**:
- Works INSIDE Claude Code (zero external infrastructure)
- Execution modes are genuinely differentiated and useful
- SQLite task claiming is a pragmatic coordination pattern
- File-ownership partitioning in Ultrapilot prevents real conflicts
- 31 hooks provide deep lifecycle integration
- LSP/AST tools give agents IDE-level intelligence

**Weaknesses**:
- Plugin-based distribution (not npm installable anymore)
- Heavy reliance on Claude Code internals that may change
- 28 agents may have overlapping responsibilities
- Documentation quality varies between modes
- Ralph mode's "won't stop" persistence may cause runaway costs

**Reusable patterns for MMOS**:
1. **SQLite-based atomic task claiming** for swarm coordination
2. **File-ownership partitioning** for parallel agent work
3. **3-tier agent variants** (Haiku/Sonnet/Opus per role)
4. **Hooks-based behavior injection** for mode switching
5. **Magic keyword detection** for implicit mode activation
6. **Ecomode model routing** (complexity -> model tier)

---

## 3. claude-squad (smtg-ai/claude-squad)

**Repository**: [github.com/smtg-ai/claude-squad](https://github.com/smtg-ai/claude-squad)
**Stars**: 5.8k (most popular in this category)
**Version**: Stable, actively maintained
**Language**: Go (Bubble Tea TUI framework)
**License**: AGPL-3.0

### 3.1 Architecture Overview

claude-squad takes a fundamentally different approach from claude-flow and OMC: it does NOT orchestrate agents or coordinate tasks. Instead, it provides a **unified terminal interface** for managing multiple independent AI agent sessions, each in its own isolated workspace.

```
TUI (Bubble Tea) -> home struct (MVU pattern)
      |                    |
  ui.List              session.Storage
  ui.TabbedWindow      session.Instance[]
  ui.Menu                   |
  ui.ErrBox           +-----+-----+
                      |           |
               tmux.TmuxSession  git.GitWorktree
               (terminal isolation)  (code isolation)
```

**Key insight**: claude-squad is not an orchestrator -- it is a **session manager**. It manages N isolated environments, each running its own AI agent, with no inter-agent communication.

### 3.2 Session Management (Dual Isolation)

Each session.Instance provides two layers of isolation:

**Layer 1 - Terminal Isolation (tmux)**:
- Each agent runs in a dedicated tmux session
- Prevents terminal conflicts between concurrent agents
- Sessions can be attached/detached without stopping the agent
- Background execution continues when detached

**Layer 2 - Code Isolation (Git Worktrees)**:
- Each instance gets a unique branch (`session/<instance-name>`)
- Worktree created in separate directory from main repo
- Agents modify code without affecting other agents' work
- Changes can be reviewed, committed, and pushed independently

**Session lifecycle**:
```
Ready -> Loading -> Running -> Paused -> Deleted
                      |           |
                   Attach      Remove worktree
                   Detach      (preserve branch)
                      |           |
                   Resume      Recreate worktree
                   (from branch)
```

### 3.3 Git Worktree Management (Deep Dive)

The `GitWorktree` struct manages the complete worktree lifecycle:

**Creation** (two paths):
1. **New instance**: Create fresh worktree from HEAD with new branch
2. **Resume**: Recreate worktree from existing preserved branch

**Branch naming**: `session/<instance-name>` (automatic, deterministic)

**Operations**:

| Operation | Method | Details |
|-----------|--------|---------|
| Dirty check | `git status --porcelain` | Detect uncommitted changes |
| Branch status | `git branch --show-current` | Verify checkout state |
| Push changes | Stage + commit + `gh` push | Submit to remote |
| Browser view | `gh browse --branch` | Open in GitHub UI |

**Cleanup** (three levels):
1. **Remove()**: Delete worktree, preserve branch (for later resume)
2. **Cleanup()**: Delete worktree + branch + prune references
3. **CleanupWorktrees()**: Bulk cleanup of all worktrees (for reset)

### 3.4 Daemon System (Auto-Yes)

The daemon automates prompt acceptance for unattended operation:

```
LaunchDaemon() -> spawns background process
RunDaemon() -> monitors tmux sessions
           -> automatically sends keystrokes
           -> accepts AI prompts (--autoyes flag)
```

Integrates with configuration system and external CLIs (tmux, git, gh).

### 3.5 TUI Interface (Bubble Tea MVU)

The interface follows the Model-View-Update pattern:

**Key bindings**:
| Key | Action |
|-----|--------|
| `n` | Create new session |
| `N` | Create session with initial prompt |
| `Enter/o` | Attach to session |
| `Ctrl-q` | Detach from session |
| `D` | Terminate session |
| `s` | Commit and push to GitHub |
| `c` | Checkpoint (commit + pause) |
| `r` | Resume paused session |
| `Tab` | Toggle preview/diff views |
| `?` | Help menu |

**Preview pane** refreshes at 100ms, showing live session output from tmux.
**Diff pane** shows git changes from the instance's worktree branch.

### 3.6 Supported Tools

Not Claude-only -- supports any terminal AI agent:
- **Claude Code**
- **Aider**
- **Codex** (OpenAI)
- **OpenCode**
- **Amp**
- **Gemini CLI**
- Custom programs via `-p` flag

### 3.7 Critical Assessment

**Strengths**:
- **Simplest mental model**: N agents, N isolated workspaces, zero coordination overhead
- **Most mature** (5.8k stars, stable releases)
- **Tool-agnostic**: Works with any terminal-based AI agent
- **Git worktree isolation is production-ready** and well-implemented
- **Go/Bubble Tea TUI** is responsive and well-designed
- **Checkpoint/resume** enables long-running multi-session workflows

**Weaknesses**:
- **No inter-agent coordination**: Agents cannot communicate or share work
- **No task decomposition**: User must manually assign tasks to sessions
- **No model routing**: All instances use the same model
- **No shared state**: Each agent has completely isolated context
- **Requires tmux** (external dependency)

**Reusable patterns for MMOS**:
1. **Git worktree per agent** for code isolation (battle-tested)
2. **Checkpoint/resume** pattern for long-running work
3. **Session lifecycle** state machine (Ready/Loading/Running/Paused/Deleted)
4. **Dual-isolation** (terminal + code) as a design principle
5. **Tool-agnostic interface** (support multiple AI agents, not just Claude)

---

## 4. ccswarm (nwiizo/ccswarm)

**Repository**: [github.com/nwiizo/ccswarm](https://github.com/nwiizo/ccswarm)
**Crate**: [lib.rs/crates/ccswarm](https://lib.rs/crates/ccswarm)
**Version**: 0.4.5 (released 2026-02-07)
**Language**: Rust (2024 edition)
**License**: MIT

### 4.1 Architecture Overview

ccswarm is a Rust-native framework that prioritizes compile-time safety and zero-cost abstractions. Its architecture follows the actor model with channel-based message passing instead of shared state.

```
CLI (clap) -> ProactiveMaster (orchestrator)
                    |
              Channel-based dispatch
                    |
         +----+----+----+----+
         |    |    |    |    |
      Frontend Backend DevOps QA   (specialized agents)
         |    |    |    |    |
      Git Worktrees (isolated per agent)
         |
      TUI (ratatui/crossterm)
```

### 4.2 Design Patterns (Rust-Specific)

ccswarm uses several sophisticated Rust patterns:

**Type-State Pattern**: Compile-time state validation eliminates runtime overhead. Agent states are encoded in the type system, making invalid state transitions impossible at compile time.

**Channel-Based Orchestration**: No `Arc<Mutex<T>>` anywhere. The `ProactiveMaster` communicates with agents via Tokio channels (message passing), implementing a form of the actor model. This eliminates lock contention and data races by design.

**Iterator Pipelines**: Task processing uses zero-cost iterators, avoiding heap allocations in hot paths.

**No Shared State**: Each agent operates with its own data. Coordination happens exclusively through message passing.

### 4.3 Agent Types

Four primary specialized agents:

| Agent | Domain | Responsibilities |
|-------|--------|-----------------|
| Frontend | UI/UX | React/Vue component development |
| Backend | API/DB | API endpoints, database logic |
| DevOps | Infra | Docker, CI/CD, deployment |
| QA | Testing | Test writing, quality assurance |

**Multi-provider support** (5 implementations):
- ClaudeCode (primary)
- Aider
- ClaudeAPI (direct API)
- Codex
- Custom (user-defined)

### 4.4 Key Dependencies

```
tokio 1.40          -- Async runtime (multi-threaded)
clap 4.5            -- CLI framework
ratatui 0.29        -- Terminal UI
crossterm 0.29      -- Terminal manipulation
ai-session 0.4.5    -- Native PTY session management
serde/serde_json    -- Serialization
tracing             -- Observability with span tracking
```

Total: ~36-58MB dependencies, ~851K source lines (including deps).

### 4.5 Implementation Status

| Status | Component | Details |
|--------|-----------|---------|
| Working | CLI infrastructure | Command routing, argument parsing |
| Working | PTY session management | Native sessions (replaced tmux) |
| Working | Task queuing/tracking | Basic task lifecycle |
| Working | Template system | Variable substitution for scaffolding |
| Working | Git worktree isolation | Create, list, remove, prune |
| Working | TUI monitoring | Real-time via ratatui |
| Working | Human-in-the-loop | Approval workflows |
| Partial | AI execution | Currently simulated (keyword-based responses) |
| Partial | Orchestrator coordination | ProactiveMaster exists but not fully wired |
| Partial | Parallel executor | Structure exists, not integrated |
| Planned | Multi-provider wiring | Provider abstraction exists, not connected |
| Planned | ACP WebSocket | Agent Client Protocol |
| Planned | Sangha voting | Collective decision-making |
| Planned | IPC | Unix socket/SQLite for inter-process communication |

### 4.6 Notable Architectural Decisions

**Minimal testing surface**: Only 8 essential tests, relying on Rust's type system for correctness guarantees rather than extensive unit testing.

**Native PTY over tmux**: v0.4.x replaced tmux dependency with native PTY session management (`ai-session` crate), reducing external dependencies.

**Graph workflow engine**: Supports DAG-based workflows (working), enabling complex task dependency graphs.

**93% token savings** claimed through context compression and MessageBus integration (planned, not yet implemented).

### 4.7 Critical Assessment

**Strengths**:
- **Rust type safety** provides compile-time guarantees no other tool offers
- **Channel-based architecture** is fundamentally sound for concurrent agents
- **No external dependencies** (no tmux requirement since v0.4.x)
- **Native PTY** management is a clean design choice
- **DAG workflow engine** is working and useful
- **MIT license** (most permissive of the four tools)

**Weaknesses**:
- **Incomplete implementation**: Core orchestrator loop not wired
- **AI execution is simulated**: Keyword-based responses, not real LLM integration
- **`start` command exits immediately**: No continuous orchestration
- **macOS/Linux only**: No Windows support
- **Low community adoption**: Minimal stars compared to claude-squad
- **Documentation-vs-reality gap**: README describes features that are not yet implemented

**Reusable patterns for MMOS**:
1. **Channel-based agent communication** (no shared state)
2. **Type-state pattern** for agent lifecycle management
3. **Native PTY session management** (no tmux dependency)
4. **DAG workflow engine** for task dependencies

---

## 5. Comparative Analysis

### 5.1 Feature Matrix

| Feature | claude-flow | oh-my-claudecode | claude-squad | ccswarm | Native Teams |
|---------|------------|------------------|-------------|---------|-------------|
| **Agent count** | 64 | 28 | N/A (sessions) | 4 | Unlimited |
| **Coordination** | Swarm+consensus | SQLite+ownership | None | Channel-based | TaskCreate+SendMessage |
| **Shared state** | Memory layer (SQLite+Vector) | `.omc/` + SQLite | None | Planned (IPC) | File-based |
| **Model routing** | 3-tier (WASM/Haiku/Opus) | Ecomode (Haiku/Sonnet/Opus) | None | None | Manual |
| **Git isolation** | No | No | Git worktrees | Git worktrees | No |
| **Tool agnostic** | No (Claude-only) | No (Claude-only) | Yes (5+ tools) | Yes (5 providers) | No (Claude-only) |
| **Language** | TypeScript | Skills/Markdown | Go | Rust | Built-in |
| **External deps** | MCP server | None (plugin) | tmux, gh | None | None |
| **Learning curve** | High | Low | Low | Medium | Medium |
| **Production ready** | Partial | Yes | Yes | No | Experimental |
| **License** | MIT | MIT | AGPL-3.0 | MIT | Proprietary |

### 5.2 Coordination Pattern Comparison

| Pattern | claude-flow | OMC | claude-squad | ccswarm |
|---------|------------|-----|-------------|---------|
| Task decomposition | Automatic (router) | Per-mode (manual/auto) | Manual | Automatic (ProactiveMaster) |
| Task assignment | Queen delegates | Mode-specific | User assigns | Pattern matching |
| Conflict prevention | Consensus voting | File ownership / SQLite | Git worktrees | Channel isolation |
| Progress tracking | Memory layer | `.omc/` state | TUI + diff pane | Task queue |
| Error recovery | Agent respawn | Recovery hooks | Checkpoint/resume | Not implemented |
| Inter-agent comms | Shared memory | SQLite + notepads | None | Channels (planned) |

### 5.3 Architectural Philosophy

| Tool | Philosophy | Analogy |
|------|-----------|---------|
| claude-flow | Enterprise platform: everything built-in, batteries-included, self-learning | Kubernetes for agents |
| oh-my-claudecode | Plugin ecosystem: extend native capabilities, zero infrastructure | Oh-my-zsh for Claude Code |
| claude-squad | Session manager: isolate, run, review, merge | tmux for AI agents |
| ccswarm | Systems engineering: type-safe, zero-cost, correct by construction | Rust stdlib for agents |

### 5.4 When to Use Each

| Scenario | Best Tool | Why |
|----------|----------|-----|
| Single developer, varied tasks | oh-my-claudecode | Execution modes match task types, zero setup |
| Team with mixed AI tools | claude-squad | Tool-agnostic, Git isolation, simple model |
| Enterprise with custom routing | claude-flow | Most configurable, MCP integration |
| Performance-critical workflows | ccswarm | Zero-cost abstractions (when complete) |
| Production code, stability first | Native Teams | First-party support, stable API |
| Rapid prototyping | oh-my-claudecode | Magic keywords, autopilot mode |
| Large independent task backlogs | oh-my-claudecode (swarm) | SQLite task claiming prevents duplication |
| Multi-feature parallel dev | claude-squad | Git worktree per feature, diff review |

---

## 6. Reusable Patterns for MMOS

### 6.1 Priority Patterns (most actionable)

**P1: SQLite-Based Task Claiming (from OMC Swarm)**
```
Problem: Multiple agents claiming the same task
Solution: SQLite DB with atomic row-level locking
Implementation: swarm.db with claimed_by + claimed_at columns
Pattern: Agent claims task -> executes -> marks complete -> claims next
```
This is the most practical coordination pattern. Simple, battle-tested (SQLite), and requires zero external infrastructure.

**P2: Git Worktree Per Agent (from claude-squad)**
```
Problem: Multiple agents modifying the same files
Solution: Each agent gets its own Git worktree on a unique branch
Implementation: git worktree add <path> -b session/<agent-name>
Lifecycle: Create -> Work -> Commit -> Push -> Cleanup
```
Already proven at scale (5.8k stars). The pause/resume pattern (remove worktree but preserve branch) is elegant.

**P3: File-Ownership Partitioning (from OMC Ultrapilot)**
```
Problem: Parallel agents creating merge conflicts
Solution: Assign file ownership to agents before execution
Implementation: Task decomposition -> file list per agent -> enforce ownership
Pattern: Agent A owns /api/*, Agent B owns /ui/*, no overlap
```
Lighter weight than Git worktrees when agents work in the same branch.

### 6.2 Secondary Patterns (worth exploring)

**P4: 3-Tier Model Routing (from claude-flow + OMC)**
```
Tier 1: Deterministic transforms (regex, AST) -> $0 cost, <1ms
Tier 2: Haiku/small model -> low cost, ~500ms
Tier 3: Opus/large model -> full cost, 2-5s
```
Reduces cost 30-50% by routing simple tasks to cheaper execution paths.

**P5: Hooks-Based Mode Switching (from OMC)**
```
Problem: Different tasks need different orchestration strategies
Solution: Hooks detect context and inject mode-specific behavior
Implementation: Keyword detection -> mode activation -> behavior injection
```
Enables the same system to run in sequential, parallel, or swarm modes based on task characteristics.

**P6: Channel-Based Agent Communication (from ccswarm)**
```
Problem: Shared state creates lock contention
Solution: Message passing via channels (actor model)
Implementation: tokio::mpsc channels between ProactiveMaster and agents
```
Cleanest concurrency model, but requires Rust or Go for proper implementation.

### 6.3 Anti-Patterns to Avoid

1. **Over-engineering consensus**: Byzantine fault tolerance for coding agents is unnecessary. Simple leader-based coordination (Raft-like) or SQLite locking suffices.
2. **Too many agent types**: 64 agent types (claude-flow) creates confusion. 4-8 well-defined roles are sufficient.
3. **Marketing-driven features**: Vector databases, neural networks, and self-learning are buzzwords when applied to agent coordination. Keep it simple.
4. **Ignoring Git integration**: Any multi-agent system that modifies code MUST handle concurrent file changes. Git worktrees or file ownership are non-negotiable.
5. **External dependencies**: tmux, Docker, or external databases add friction. Native solutions (PTY, SQLite, in-process) are preferable.

---

## 7. Gaps and Open Questions

1. **No tool benchmarks agents against native Teams**: Every third-party tool was built before or independently of native Claude Code Teams (experimental since Feb 6, 2026). No comparison data exists.
2. **Token cost analysis**: None of the tools provide verified token usage data comparing their approach vs. sequential single-agent execution.
3. **Conflict resolution**: What happens when agents in OMC's Ultrapilot mode accidentally modify a file outside their ownership? No documentation on enforcement mechanisms.
4. **ccswarm completion timeline**: The most architecturally interesting tool is the least complete. No roadmap or timeline for core orchestrator wiring.
5. **Plugin stability**: OMC's hook system depends on Claude Code internals that Anthropic may change without notice. What is the migration path?

---

## Sources

- [claude-flow GitHub](https://github.com/ruvnet/claude-flow)
- [claude-flow CLAUDE.md](https://github.com/ruvnet/claude-flow/blob/main/CLAUDE.md)
- [claude-flow Agent System Wiki](https://github.com/ruvnet/claude-flow/wiki/Agent-System-Overview)
- [claude-flow MCP Tools Wiki](https://github.com/ruvnet/claude-flow/wiki/MCP-Tools)
- [claude-flow V3 Rebuild Issue](https://github.com/ruvnet/claude-flow/issues/945)
- [oh-my-claudecode GitHub](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [oh-my-claudecode Website](https://yeachan-heo.github.io/oh-my-claudecode-website/)
- [oh-my-claudecode Docs](https://yeachan-heo.github.io/oh-my-claudecode-website/docs.html)
- [oh-my-claudecode AGENTS.md](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/AGENTS.md)
- [oh-my-claudecode REFERENCE.md](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/docs/REFERENCE.md)
- [claude-squad GitHub](https://github.com/smtg-ai/claude-squad)
- [claude-squad DeepWiki Architecture](https://deepwiki.com/smtg-ai/claude-squad)
- [claude-squad Git Worktree DeepWiki](https://deepwiki.com/smtg-ai/claude-squad/4.1-git-worktree-management)
- [ccswarm GitHub](https://github.com/nwiizo/ccswarm)
- [ccswarm on lib.rs](https://lib.rs/crates/ccswarm)
- [eesel.ai Multi-Agent Systems Guide 2026](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
