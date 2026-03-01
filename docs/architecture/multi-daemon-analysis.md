# Architecture Analysis: Single-Daemon vs Multi-Daemon Session Strategy

**Author:** Aria (Architect Agent)
**Date:** 2026-03-01
**Status:** DRAFT -- Pending Review
**Relates To:** session-daemon-phase0.md, telegram-observability-bridge.md, gateway-agent-architecture.md
**Scope:** Migration feasibility analysis from single shared session to parallel agent sessions

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Baseline](#2-current-architecture-baseline)
3. [Problem Statement: Why Consider Multi-Daemon](#3-problem-statement-why-consider-multi-daemon)
4. [Detailed Pros of Multi-Daemon](#4-detailed-pros-of-multi-daemon)
5. [Detailed Cons of Multi-Daemon](#5-detailed-cons-of-multi-daemon)
6. [Architecture Models Evaluated](#6-architecture-models-evaluated)
7. [Impact on Telegram Bridge](#7-impact-on-telegram-bridge)
8. [Impact on Hardware and Resources](#8-impact-on-hardware-and-resources)
9. [API Cost Analysis](#9-api-cost-analysis)
10. [Complexity of Implementation](#10-complexity-of-implementation)
11. [Industry Reference: How Others Solve This](#11-industry-reference-how-others-solve-this)
12. [Trade-Off Matrix](#12-trade-off-matrix)
13. [Recommendation](#13-recommendation)
14. [Migration Path (If Adopted)](#14-migration-path-if-adopted)
15. [Open Questions](#15-open-questions)

---

## 1. Executive Summary

This document analyzes the architectural trade-offs of migrating the AIOS Session Daemon from its current single-daemon model (one persistent Claude Code session shared by 11 agents) to a multi-daemon model (multiple concurrent sessions, each serving a subset of agents).

**The core tension:** The single-daemon model serializes all agent work through one context window, creating a bottleneck where Agent A must wait for Agent B to finish. A multi-daemon model would enable true parallelism but introduces significant complexity in coordination, resource consumption, and cost.

**Recommendation:** Adopt the **Hybrid Daemon Model (Model C)** -- a primary persistent master daemon plus on-demand ephemeral worker daemons. This provides parallelism where it matters (long-running tasks) while preserving the simplicity of the current architecture for interactive and sequential workflows. This should be implemented as a Phase 2 evolution after the current Phase 0 single-daemon proves stable.

---

## 2. Current Architecture Baseline

### 2.1. System Topology

```
                    +-------------------+
                    |  Telegram Bridge  |
                    | (4 bots: master,  |
                    |  dev, qa, arch)   |
                    +--------+----------+
                             |
                    writes inbox / reads outbox
                             |
                    +--------v----------+
                    |   .aios/ IPC      |
                    | inbox/pending/    |
                    | outbox/pending/   |
                    +--------+----------+
                             |
                    +--------v----------+
                    | Session Daemon    |
                    | (1 process)       |
                    | (1 Claude session)|
                    | (11 agents share) |
                    +-------------------+
```

### 2.2. Key Components (from codebase analysis)

| Component | File | Responsibility |
|-----------|------|---------------|
| **SessionDaemon** | `/home/ubuntu/aios-core/packages/session-daemon/src/index.js` | Main orchestrator. Wires InboxWatcher -> CommandQueue -> SessionAdapter -> StreamProcessor -> OutboxWriter |
| **SessionAdapter** | `/home/ubuntu/aios-core/packages/session-daemon/src/session-adapter.js` | Claude Agent SDK wrapper (V2 with V1 fallback). Single persistent session with `sessionId` for resume. Uses `query()` or `unstable_v2_createSession()`. |
| **InboxWatcher** | `/home/ubuntu/aios-core/packages/session-daemon/src/inbox-watcher.js` | Watches `.aios/inbox/pending/` via chokidar + polling. Schema validation, dedup, authorization. |
| **OutboxWriter** | `/home/ubuntu/aios-core/packages/session-daemon/src/outbox-writer.js` | Writes response JSON to `.aios/outbox/pending/`. Millisecond timestamps for ordering. |
| **CommandQueue** | `/home/ubuntu/aios-core/packages/session-daemon/src/command-queue.js` | Strict FIFO, max 50 entries. Persistent state in `queue.json`. One command at a time. |
| **StreamProcessor** | `/home/ubuntu/aios-core/packages/session-daemon/src/stream-processor.js` | Parses SDK stream. Detects agent switches via text pattern matching. Throttles progress updates. |
| **HealthMonitor** | `/home/ubuntu/aios-core/packages/session-daemon/src/health-monitor.js` | State machine (STARTING -> READY -> BUSY -> RECOVERY -> FAILED). Writes `health.json` every 10s. systemd watchdog integration. |

### 2.3. Key Design Properties of Current System

1. **Strict serialization.** The `CommandQueue` enforces one-at-a-time processing. No parallelism.
2. **Single session persistence.** One `session.json` stores a single session ID. Resume on crash.
3. **Agent switching is in-session.** When `@dev` finishes and `@architect` starts, it is a context switch *within the same session*, detected by text pattern matching in `StreamProcessor.detectAgentSwitch()`.
4. **Shared context window (~200k tokens).** All 11 agents accumulate context in the same window. After many commands, the session fills up and must be restarted (losing all accumulated context).
5. **Single outbox.** All agent responses go to `.aios/outbox/pending/`. The Telegram Bridge routes based on the `agent` field in the message.

### 2.4. Current Resource Usage

| Resource | Measured | Source |
|----------|---------|--------|
| VPS RAM total | 7,940 MB | `free -m` |
| RAM in use | 5,781 MB | `free -m` (all processes) |
| RAM available | 2,159 MB | `free -m` |
| CPU cores | 2 | `nproc` |
| Disk available | 60 GB | `df -h` |
| Daemon process RAM | ~80-100 MB (Node.js) + ~500 MB (SDK subprocess) | Architecture doc estimate |
| Daemon systemd MemoryMax | 2 GB | `aios-session-daemon.service` |
| Daemon systemd CPUQuota | 200% (2 cores) | `aios-session-daemon.service` |

---

## 3. Problem Statement: Why Consider Multi-Daemon

### 3.1. Current Pain Points

1. **No parallelism.** If `@dev` is implementing a story (10-30 min), all other agents (`@qa`, `@architect`, `@pm`) are blocked. The queue holds their commands, but nothing processes until `@dev` finishes.

2. **Context window contamination.** When `@dev` works on implementation details (file contents, test output), that context remains in the shared session even when `@architect` or `@pm` take over. This wastes tokens on irrelevant context and degrades response quality.

3. **Context window exhaustion.** With 11 agents sharing ~200k tokens, the session fills up faster. A dedicated session for `@dev` would last longer because it only accumulates implementation-relevant context.

4. **Blast radius.** If the single session crashes or enters FAILED state, ALL agents are down. There is no degraded mode where some agents can still respond.

5. **Agent switch latency.** Every agent switch requires the session to re-read the new agent's persona, instructions, and context. In a dedicated session, this would already be loaded.

### 3.2. Scenarios Where Multi-Daemon Adds Value

| Scenario | Single-Daemon | Multi-Daemon |
|----------|--------------|-------------|
| Lucas sends `@dev` a long implementation task + `@architect` a design question | Architect waits 10-30 min until dev finishes | Both process in parallel |
| `@qa` runs tests while `@dev` keeps coding | Impossible -- sequential only | Natural parallel flow |
| Session crashes during `@dev` work | All agents down until recovery | Only `@dev` down; `@architect`, `@pm` still responsive |
| Context window at 150k tokens | ALL agents affected, session needs restart | Only the busy agent's session is full; others have headroom |
| Telegram user sends multiple messages rapidly | Queued, processed one at a time (could take minutes) | Different agents respond immediately to their messages |

---

## 4. Detailed Pros of Multi-Daemon

### 4.1. True Parallelism

The single most compelling advantage. Currently, the system processes commands in strict FIFO order. With N daemons, N commands can process simultaneously.

**Real-world impact:** Lucas sends "@dev implement the login feature" followed immediately by "@architect review the API design". Today, the architect waits 10+ minutes. With multi-daemon, both start immediately.

**Quantified value:** Average AIOS command takes 2-10 minutes for simple tasks, 10-30 minutes for complex ones. With 3 daemons, throughput increases 3x for independent tasks.

### 4.2. Context Isolation

Each agent (or agent group) maintains its own context window dedicated to its domain.

- `@dev` context: source code files, test output, git diff, implementation details
- `@architect` context: architecture docs, design patterns, system diagrams
- `@qa` context: test results, coverage reports, quality metrics

**Benefits:**
- No cross-contamination (dev's file contents do not pollute architect's context)
- Better response quality (each agent sees only relevant context)
- Longer effective session life (each context fills up slower because it is domain-specific)

### 4.3. Fault Isolation

If one daemon crashes:
- Other daemons continue operating normally
- The crashed daemon can recover independently
- The system degrades gracefully instead of total failure

**Current risk:** A single `FAILED` state means zero AIOS functionality via Telegram until manual intervention.

### 4.4. Specialized Session Configuration

Each daemon can be configured with:
- Different Claude models (Opus for `@architect`, Sonnet for `@dev`, Haiku for `@pm`)
- Different tool allowlists (restrict `@pm` from code tools)
- Different system prompts (pre-load agent persona)
- Different permission modes

**Example from current config:**
```yaml
# daemon.yaml currently uses claude-opus-4-6 for ALL agents.
# Multi-daemon would allow:
dev-daemon:
  model: claude-sonnet-4-5-20250929  # Cheaper, faster for code
architect-daemon:
  model: claude-opus-4-6            # Deep reasoning for design
pm-daemon:
  model: claude-haiku-4-5           # Fast, cheap for coordination
```

### 4.5. Improved Telegram UX

With dedicated daemons, each Telegram bot could have a "live" connection to its agent. The current system shows all messages from all agents in the master bot's chat. With multi-daemon, conversations feel like talking to individual agents.

---

## 5. Detailed Cons of Multi-Daemon

### 5.1. API Cost Multiplication

This is the single most critical con. Each daemon maintains its own Claude session, and each session loads the full AIOS context (CLAUDE.md, rules, agent persona, project settings) on every command.

**Token cost analysis:**

| Component | Tokens per Session | Notes |
|-----------|-------------------|-------|
| CLAUDE.md system prompt | ~8,000 | Loaded every session |
| Agent persona YAML | ~3,000-5,000 | Different per agent |
| Project settings/rules | ~5,000 | Loaded via settingSources |
| Session-accumulated context | Variable | Grows per command |
| **Minimum per-session overhead** | **~16,000-18,000** | Before any actual work |

**Cost per daemon per command (minimum):**

| Model | Input Cost (18k tokens) | Notes |
|-------|------------------------|-------|
| Claude Opus 4.6 | $0.09/command overhead | $5/MTok input |
| Claude Sonnet 4.6 | $0.054/command overhead | $3/MTok input |
| Claude Haiku 4.5 | $0.018/command overhead | $1/MTok input |

**With N daemons running N commands simultaneously:** The system prompt tokens are duplicated N times. If 3 daemons each process 1 command, the system prompt cost is 3x vs 1x in single-daemon mode.

**Monthly cost projection (estimate):**

| Scenario | Commands/Day | Daemons | Est. Monthly API Cost |
|----------|-------------|---------|----------------------|
| Current single-daemon | ~20 | 1 | ~$15-30/month |
| Full multi-daemon (11) | ~20 (same total) | 3-4 active | ~$40-80/month |
| Hybrid (1 master + on-demand workers) | ~20 | 1.3 avg | ~$20-40/month |

### 5.2. RAM and CPU Pressure on VPS

Each daemon spawns a Node.js process (~80-100 MB) plus the Claude SDK subprocess (the `claude` binary, ~200-500 MB depending on activity).

**Memory projection per daemon model:**

| Daemons | Node.js RAM | SDK Subprocess RAM | Total | Available (7.9 GB) |
|---------|------------|-------------------|-------|---------------------|
| 1 (current) | 100 MB | 500 MB | 600 MB | 7.3 GB |
| 3 (grouped) | 300 MB | 1.5 GB | 1.8 GB | 6.1 GB |
| 5 (grouped+) | 500 MB | 2.5 GB | 3.0 GB | 4.9 GB |
| 11 (full) | 1.1 GB | 5.5 GB | 6.6 GB | 1.3 GB (CRITICAL) |

**Analysis:** Full multi-daemon (11 daemons) is physically impossible on the current VPS. Even with the SDK subprocess being ephemeral (only alive during command processing), the peak concurrent load would exceed available memory. The VPS currently shows only 2,159 MB available.

### 5.3. Coordination Complexity

With multiple daemons writing to the same filesystem:

**File conflict scenarios:**
- `@dev` creates a file while `@qa` is reading it
- `@dev` and `@qa` both try to edit `package.json`
- Two agents create conflicting git commits
- Two agents attempt `npm install` simultaneously

**Required coordination primitives:**
- File-level advisory locks (flock or custom)
- Git operation serialization (mutex on git commands)
- npm/package manager serialization
- Working directory isolation (separate worktrees?)

**Current system avoids all of this** because the `CommandQueue` guarantees one-at-a-time processing.

### 5.4. State Consistency

Multiple daemons means multiple views of the project state:

- `@dev` modifies `src/auth.js` in Daemon A
- `@qa` in Daemon B still sees the old version until its session refreshes
- The `@architect` in Daemon C might make decisions based on stale architecture
- Git branch state could diverge if daemons create branches independently

**Mitigations exist but add complexity:**
- Each command could start with `git status` / `git pull` checks
- File system events could trigger invalidation
- A shared state service could broadcast changes

### 5.5. Inbox/Outbox Routing Complexity

Currently, all commands go to one inbox. All responses come from one outbox. With multi-daemon:

- Each daemon needs its own inbox, or a router must dispatch to the correct daemon's inbox
- Each daemon writes to its own outbox, or shares a single outbox with potential write conflicts
- The Telegram Bridge must know which daemon to send commands to
- Responses must carry daemon identity for proper routing back

### 5.6. Operational Complexity

- 11 systemd services instead of 1
- 11 health files to monitor instead of 1
- 11 session states to track
- 11 potential crash/recovery scenarios
- Log aggregation across 11 daemon logs
- Configuration management for 11 daemon.yaml files
- Upgrade coordination (all daemons must use compatible SDK versions)

---

## 6. Architecture Models Evaluated

### Model A: Full Multi-Daemon (1 Daemon per Agent)

```
+-------------+  +----------+  +----------+  +----------+  +----------+
|  @dev       |  |  @qa     |  | @arch    |  |  @pm     |  | ...x7    |
|  Daemon     |  |  Daemon  |  | Daemon   |  |  Daemon  |  | more     |
|  (session)  |  | (session)|  | (session)|  | (session)|  | daemons  |
+------+------+  +----+-----+  +----+-----+  +----+-----+  +----+-----+
       |              |             |              |              |
       v              v             v              v              v
+------+------+  +----+-----+  +----+-----+  +----+-----+  +----+-----+
| inbox/dev   |  |inbox/qa  |  |inbox/arch|  |inbox/pm  |  |inbox/... |
| outbox/dev  |  |outbox/qa |  |outbox/arc|  |outbox/pm |  |outbox/...|
+-----------+-+  +-+--------+  +---+------+  +----+-----+  +----+-----+
             \      |              |              |              /
              +-----+--------------+--------------+-------------+
                    |  Telegram Bridge Router                   |
                    +------------------------------------------+
```

**11 daemons, 11 sessions, 11 inbox/outbox pairs.**

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Parallelism | Excellent | Full parallelism across all agents |
| Context isolation | Excellent | Perfect per-agent isolation |
| Fault isolation | Excellent | One crash affects one agent only |
| RAM usage | CRITICAL | ~6.6 GB -- exceeds VPS capacity |
| API cost | Very High | 11x system prompt overhead |
| Implementation complexity | Very High | 11 services, 11 configs |
| Operational burden | Very High | Monitoring, upgrades, debugging 11 daemons |

**Verdict: REJECTED.** Physically impossible on current hardware. Cost-prohibitive. Operationally unmanageable.

---

### Model B: Grouped Multi-Daemon (by Function)

```
+------------------+     +------------------+     +------------------+
| Execution Group  |     | Strategy Group   |     |  Ops Group       |
| @dev, @qa        |     | @arch, @pm, @po  |     | @devops, @master |
| (1 session)      |     | @sm, @analyst    |     | (1 session)      |
| (1 daemon)       |     | @ux, @data-eng   |     | (1 daemon)       |
|                  |     | (1 session)      |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
    inbox/execution          inbox/strategy           inbox/ops
    outbox/execution         outbox/strategy          outbox/ops
```

**3 daemons, 3 sessions, grouped by function.**

Group rationale:
- **Execution Group** (`@dev`, `@qa`): These agents work on code and tests -- highly related context. They benefit from shared context (dev writes code, qa sees same code in context).
- **Strategy Group** (`@architect`, `@pm`, `@po`, `@sm`, `@analyst`, `@ux`, `@data-engineer`): These agents work on design, planning, and analysis. They share architectural context.
- **Operations Group** (`@devops`, `@aios-master`): System administration, git push, orchestration.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Parallelism | Good | 3 parallel streams (execution vs strategy vs ops) |
| Context isolation | Good | Related agents share context (beneficial) |
| Fault isolation | Good | Group-level isolation |
| RAM usage | Manageable | ~1.8 GB -- within VPS capacity |
| API cost | Moderate | 3x system prompt overhead |
| Implementation complexity | Moderate | 3 services, routing logic |
| Operational burden | Moderate | 3 daemons to monitor |

**Key challenge:** Agent switching within a group still requires in-session context switching, same as today. Only *cross-group* parallelism is gained.

**Verdict: VIABLE but may not justify the added complexity.** The most common scenario (dev implements, qa reviews) would still be sequential within the Execution Group.

---

### Model C: Hybrid Daemon (Master + On-Demand Workers)

```
+---------------------------+
| Master Daemon (persistent)|     +-------------------+
| @aios-master, all agents  |---->| Worker Daemon A   |
| (default session)         |     | (ephemeral)       |
| Handles: interactive,     |     | Long-running task |
|   short commands, routing |     | for @dev          |
+---------------------------+     +-------------------+
             |
             |                    +-------------------+
             +------------------->| Worker Daemon B   |
                                  | (ephemeral)       |
                                  | Long-running task |
                                  | for @qa           |
                                  +-------------------+
```

**1 persistent daemon + N ephemeral workers (0-3 simultaneous).**

The Master Daemon is always running (same as today). When it detects a long-running task or when commands arrive for different agents while one is busy, it *spawns* a worker daemon for the new task. Workers use `forkSession` or `createSession` with the relevant agent's persona pre-loaded.

**How it works:**

1. Command arrives in master inbox.
2. If master is idle: process normally (same as today).
3. If master is busy AND new command is for a different agent: spawn worker.
4. Worker creates its own ephemeral session, processes the command, writes to shared outbox, then terminates.
5. Worker lifetime: one command, then exit. (No persistent session for workers.)

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Parallelism | Good | Parallelism on-demand, only when needed |
| Context isolation | Partial | Workers have fresh context; master accumulates |
| Fault isolation | Good | Worker crash does not affect master |
| RAM usage | Low-Moderate | Base: 600 MB (master). Peak: +600 MB per worker |
| API cost | Low | Workers have cold-start overhead but only run when needed |
| Implementation complexity | Low-Moderate | Master daemon needs spawn logic + worker lifecycle |
| Operational burden | Low | 1 persistent service + self-managing workers |
| Backward compatibility | Excellent | Master daemon is identical to current system |

**Key advantages over Model B:**
- Zero overhead when the system is idle (same as today)
- Scales up only when actual parallelism is needed
- Workers are stateless and disposable -- no persistent session state to manage
- Master daemon codebase stays nearly unchanged

**Key challenges:**
- Worker must resolve file conflicts with master (both editing the codebase)
- Worker needs access to agent persona and AIOS context
- Outbox routing must distinguish master vs worker responses
- Worker process lifecycle management (spawn, timeout, cleanup)

**Verdict: RECOMMENDED.** Best balance of value (parallelism when needed) vs cost (no overhead when idle). Incrementally buildable on top of current architecture.

---

### Model D: Pool Daemon (N Reusable Workers)

```
+---------------------------+
|      Daemon Pool          |
|  +-------+ +-------+     |     +-----------+
|  | Slot 1| | Slot 2|     |     | Dispatcher|
|  | (idle)| | (busy)|     |<----| (routes   |
|  +-------+ +-------+     |     |  commands)|
|  +-------+               |     +-----------+
|  | Slot 3|               |
|  | (idle)|               |
|  +-------+               |
+---------------------------+
```

**N pre-warmed daemon slots, agents assigned dynamically.**

Sessions are maintained in a pool. When a command arrives, the dispatcher assigns it to an idle slot. If no slot is idle, the command queues. Each slot maintains a persistent session that can serve any agent.

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Parallelism | Configurable | N slots = N parallel commands |
| Context isolation | Poor | Agents share sessions over time (context pollution) |
| Fault isolation | Good | Per-slot isolation |
| RAM usage | Fixed, Predictable | N * 600 MB (always allocated) |
| API cost | Moderate | N persistent sessions with system prompt overhead |
| Implementation complexity | High | Pool management, session affinity, slot allocation |
| Operational burden | Moderate | Pool health monitoring |

**Verdict: REJECTED.** The pool model works well for stateless workers, but AIOS agents benefit from persistent, specialized context. A pool that rotates agents through generic sessions loses the specialization advantage and pollutes context. This model is better suited for homogeneous worker fleets (like running the same LLM call on different inputs), not heterogeneous agent orchestration.

---

## 7. Impact on Telegram Bridge

### 7.1. Current Bridge Architecture

The Telegram Bridge (`/home/ubuntu/aios-core/packages/telegram-bridge/`) currently:

1. **4 bots** defined in `/home/ubuntu/aios-core/packages/telegram-bridge/config/bots.yaml`:
   - `master` (aios-master) -- command mode
   - `dev` (@dev) -- observe mode
   - `qa` (@qa) -- observe mode
   - `architect` (@architect) -- observe mode

2. **Single inbox target:** All commands go to `.aios/inbox/pending/` (one shared inbox).

3. **Single outbox source:** All responses read from `.aios/outbox/pending/` (one shared outbox).

4. **Agent routing** is done by `AgentRouter` in `/home/ubuntu/aios-core/packages/telegram-bridge/src/agent-router.js`:
   - Reads `content.agent` field from outbox messages
   - Uses `agent_to_bot_map` from bots.yaml to find the right bot
   - Always sends to master bot + relevant agent bot (dual delivery for observability)

### 7.2. Changes Required per Model

#### Model C (Hybrid -- Recommended)

**Inbox changes:**
- **Minimal.** Master daemon still reads from `.aios/inbox/pending/`. When master decides to spawn a worker, it creates a temporary inbox for the worker (e.g., `.aios/inbox/worker-{id}/`) and moves the command there.
- Alternatively, the master can pass the command directly to the worker process via IPC (stdin/stdout, not filesystem), avoiding inbox duplication entirely.

**Outbox changes:**
- **Minimal.** Workers write to the same `.aios/outbox/pending/` directory. The existing outbox schema already includes `content.agent`, which the Bridge uses for routing. Workers just need to set this field correctly.
- Add optional `source_daemon` field to outbox messages for debugging/observability (e.g., `"source_daemon": "worker-1709290800"`).

**Bridge code changes:**
- None required for basic functionality.
- Optional: Add worker health monitoring to `/agents` command output.
- Optional: Show worker status in `/status` response.

**bots.yaml changes:**
- None required. The existing `agent_to_bot_map` continues to work because routing is based on agent identity, not daemon identity.

#### Model B (Grouped)

**Inbox changes:**
- Three separate inbox directories: `.aios/inbox/execution/`, `.aios/inbox/strategy/`, `.aios/inbox/ops/`.
- Bridge must route incoming commands to the correct group inbox based on agent target.
- `InboxWriter` in Bridge needs `agentId -> group` mapping.

**Outbox changes:**
- Could use separate outbox directories per group, or a shared outbox with group tags.
- Shared outbox is simpler (current `OutboxWatcher` watches one directory).

**Bridge code changes:**
- `InboxWriter`: Add group routing logic (which agent -> which inbox directory).
- `AgentRouter`: No change needed if shared outbox.
- `BotManager`: No change needed.
- New: `GroupResolver` component to map agentId -> daemon group.

**bots.yaml changes:**
- Add `group` field to each agent mapping.

### 7.3. Telegram Bot Dedicated Daemons?

The question was raised: could each Telegram bot have its own daemon?

Currently there are 4 bots (master, dev, qa, architect) and 11 agents. The 7 agents without dedicated bots (pm, po, sm, devops, analyst, data-engineer, ux) all route through the master bot.

**Analysis:** A bot-per-daemon model would give 4 daemons. This is close to Model B (grouped) but with different groupings:
- master daemon: @aios-master, @pm, @po, @sm, @devops, @analyst, @data-engineer, @ux (8 agents)
- dev daemon: @dev only
- qa daemon: @qa only
- architect daemon: @architect only

This is a poor grouping because it front-loads 8 agents onto the master daemon and isolates the least-busy agents (qa, architect) into their own daemons. The master daemon would still have the serialization bottleneck for most agent interactions.

**Verdict:** Bot-per-daemon mapping does not align well with workload patterns. Better to group by function (Model B) or use on-demand workers (Model C).

---

## 8. Impact on Hardware and Resources

### 8.1. RAM Analysis

| Model | Idle RAM | Peak RAM | VPS Headroom (7.9 GB) |
|-------|----------|----------|-----------------------|
| Current (1 daemon) | ~600 MB | ~800 MB | 7.1 GB idle, 5.3 GB available |
| Model B (3 daemons) | ~1.8 GB | ~2.4 GB | 6.1 GB idle, 3.7 GB available |
| Model C (1+workers) | ~600 MB | ~1.8 GB (3 workers) | Same as current idle; peak same as Model B |
| Model A (11 daemons) | ~6.6 GB | ~8.8 GB | **EXCEEDS VPS** |

**Note on SDK subprocess memory:** The Claude SDK subprocess (`claude` binary) is not always running at peak memory. It loads fully only during active command processing. When idle (between commands), it may use significantly less memory or could be terminated. For Model C, workers terminate after each command, releasing all memory.

### 8.2. CPU Analysis

The VPS has 2 cores. Claude SDK work is primarily I/O bound (API calls to Anthropic). CPU usage is low during actual LLM inference (which happens on Anthropic's servers).

**CPU contention scenarios:**
- 2 daemons actively streaming responses simultaneously: Minimal CPU impact (parsing JSON, writing files).
- 2 daemons both running `Bash` tool simultaneously: Could cause CPU spikes (running npm test, builds, etc.).
- Stream processing (parsing, outbox writes): Negligible CPU.

**Verdict:** CPU is not the bottleneck. Even 3-4 concurrent daemons would work within 2 cores because the workload is I/O-bound.

### 8.3. Disk I/O Analysis

Multiple daemons increase filesystem activity:
- Multiple inbox watchers (chokidar instances)
- Multiple outbox writers
- Multiple health.json writes (every 10s per daemon)
- Multiple session.json / queue.json writes

**Verdict:** Disk I/O is not a concern. Modern SSDs handle thousands of small JSON writes per second. The current system writes are infrequent (health every 10s, outbox per-message, inbox per-command).

### 8.4. VPS Upgrade Considerations

If multi-daemon is adopted, upgrading the VPS would extend the ceiling:

| VPS Tier | RAM | Cores | Max Concurrent Daemons | Monthly Cost (est.) |
|----------|-----|-------|----------------------|---------------------|
| Current | 7.8 GB | 2 | 3-4 (tight) | ~$50/mo |
| Mid-tier | 16 GB | 4 | 6-8 | ~$100/mo |
| High-tier | 32 GB | 8 | 11+ (all agents) | ~$200/mo |

**Model C (Hybrid) avoids the need for VPS upgrade** because workers are ephemeral and only 1-3 run concurrently.

---

## 9. API Cost Analysis

### 9.1. Current Pricing (March 2026)

| Model | Input (per MTok) | Output (per MTok) | Notes |
|-------|-----------------|-------------------|-------|
| Claude Opus 4.6 | $5.00 | $25.00 | Current daemon model |
| Claude Sonnet 4.6 | $3.00 | $15.00 | |
| Claude Haiku 4.5 | $1.00 | $5.00 | |

Source: [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

### 9.2. System Prompt Tax per Session

Every Claude session loads the AIOS system context. This "tax" is paid:
- Once per session if the session is persistent and resumed (current model)
- Once per worker spawn in Model C
- Once per daemon start in Models A/B
- On every command in V1 fallback mode (query() re-sends system prompt)

**Estimated system prompt size:** ~16,000-18,000 tokens (CLAUDE.md + rules + settingSources)

**Cost per session start:**
- Opus 4.6: 18k tokens * $5/MTok = $0.09
- Sonnet 4.6: 18k tokens * $3/MTok = $0.054
- Haiku 4.5: 18k tokens * $1/MTok = $0.018

### 9.3. Model-Specific Cost Optimization

A key advantage of multi-daemon is the ability to assign different models per agent:

| Agent Group | Suggested Model | Rationale |
|-------------|----------------|-----------|
| @dev, @qa | Sonnet 4.6 | Code is well-structured; Sonnet handles it well. High volume. |
| @architect | Opus 4.6 | Complex reasoning, system design, trade-off analysis. Low volume. |
| @pm, @po, @sm | Haiku 4.5 | Lightweight coordination, story management. Very low volume. |
| @devops | Sonnet 4.6 | Git operations, CI/CD. Low volume. |
| @analyst | Opus 4.6 | Deep research, complex analysis. Low volume. |

**Potential savings with mixed models vs all-Opus:**

Assume 20 commands/day, average 50k tokens input + 10k tokens output per command:

| Scenario | Daily Input Cost | Daily Output Cost | Monthly Total |
|----------|-----------------|-------------------|---------------|
| All Opus 4.6 (current) | 20 * 50k * $5/MTok = $5.00 | 20 * 10k * $25/MTok = $5.00 | ~$300 |
| Mixed (10 Sonnet, 5 Haiku, 5 Opus) | ~$2.60 | ~$3.25 | ~$176 |

**Note:** These are rough estimates. Actual costs depend on command complexity, context length, and response length. The key point is that mixed models can reduce costs by 30-50%.

### 9.4. Batch API Discount

Anthropic's Batch API offers 50% discount on both input and output tokens. If worker daemons process non-interactive tasks (scheduled CI, automated reviews), they could use the Batch API for significant savings. This is not compatible with streaming responses, so it would only work for tasks where Telegram real-time updates are not required.

---

## 10. Complexity of Implementation

### 10.1. Changes to Session Daemon

#### Model C (Hybrid -- Recommended)

**New components:**

1. **WorkerSpawner** (~200 LOC)
   - Launches a new Node.js process running a stripped-down worker daemon
   - Passes command data via stdin or temporary inbox
   - Monitors worker process (timeout, crash)
   - Collects result from worker outbox writes

2. **WorkerDaemon** (~300 LOC, simplified version of SessionDaemon)
   - Creates ephemeral Claude session (no persistence)
   - Processes exactly one command
   - Writes results to shared outbox
   - Exits after completion (or timeout)

3. **SpawnDecider** (~100 LOC)
   - Logic to decide when to spawn a worker vs queue in master
   - Criteria: master is BUSY, new command targets different agent, system has enough RAM

**Modified components:**

4. **SessionDaemon.wireEvents()** (~50 LOC change)
   - Instead of always queueing, check SpawnDecider
   - If spawn decision: invoke WorkerSpawner
   - If queue decision: same as today

5. **HealthMonitor** (~30 LOC change)
   - Add worker tracking (active workers, their status)
   - Include worker info in health.json

**Unchanged components:**
- `SessionAdapter` -- same for both master and worker
- `InboxWatcher` -- same (master still watches same inbox)
- `OutboxWriter` -- same (workers use same outbox directory)
- `StreamProcessor` -- same
- `CommandQueue` -- same (for master's own queue)

**Estimated effort:** 3-5 story points. 1-2 days of implementation + 1 day testing.

### 10.2. Changes to Telegram Bridge

**For Model C: Minimal to zero changes.**

The Bridge does not need to know about workers. Workers write to the same outbox with the same schema. The Bridge's `OutboxWatcher` picks up all messages regardless of source. The `AgentRouter` routes based on `content.agent`, which workers set correctly.

**Optional enhancements** (non-blocking):
- `/workers` command showing active worker status
- Include `source_daemon` in outbox messages for debugging
- Show worker spawn/exit events in master bot

**Estimated effort:** 0-1 story point.

### 10.3. New Components Needed

| Component | Required for Model C? | Complexity | Notes |
|-----------|----------------------|------------|-------|
| File lock manager | No (sequential workers) | Medium | Only if workers run truly concurrently with master |
| Git operation serializer | Recommended | Low | Simple flock on `.git/index.lock` |
| Worker process monitor | Yes | Low | Track PID, set timeout, handle OOM |
| Shared state broadcaster | No | High | Not needed for Model C (workers are ephemeral) |
| Multi-inbox router | No (Model B only) | Medium | Not needed for Model C |
| Session registry | No (workers are ephemeral) | Medium | Would be needed for Model D |

### 10.4. Configuration Changes

**New daemon.yaml fields for Model C:**

```yaml
workers:
  enabled: true
  max_concurrent: 2          # Max simultaneous workers
  timeout_ms: 600000         # 10 min max per worker
  spawn_threshold: "busy"    # When to spawn: "busy" | "always" | "never"
  model_override:
    dev: "claude-sonnet-4-5-20250929"
    qa: "claude-sonnet-4-5-20250929"
    architect: "claude-opus-4-6"
    pm: "claude-haiku-4-5"
    # Agents not listed use master's model
  cleanup_after_ms: 5000     # Delay before cleaning up worker artifacts
```

---

## 11. Industry Reference: How Others Solve This

### 11.1. AutoGen (Microsoft)

AutoGen uses a **conversational agent architecture** where multiple agents exchange messages. Each agent can have its own LLM backend or share one. The orchestrator (GroupChatManager) serializes turns but allows async message passing.

**Relevance to AIOS:** AutoGen's model is closer to Model B (grouped conversations). Agents within a group chat share context but different groups are independent.

### 11.2. CrewAI

CrewAI uses a **role-based model** where agents are organized into "crews." Each crew can process tasks sequentially or in parallel. Parallel processing is supported within a crew using thread pools.

**Relevance to AIOS:** CrewAI's parallel mode is similar to Model C. A "manager" agent coordinates while worker agents execute tasks independently.

### 11.3. LangGraph

LangGraph uses a **graph-based workflow** with a central state object. Nodes (agents) read from and write to shared state. Reducer logic merges concurrent updates. This enables sophisticated parallel execution with state consistency guarantees.

**Relevance to AIOS:** LangGraph's shared state + concurrent nodes is the most sophisticated model. However, it requires a purpose-built state management layer that AIOS does not currently have. The filesystem-based inbox/outbox IPC is too coarse for LangGraph-style state sharing.

### 11.4. Claude Agent SDK Swarms (Experimental, Jan 2026)

Anthropic introduced experimental "Swarms" in Claude Code (January 2026). A team lead agent plans and delegates to specialist background agents. Agents share a task board and coordinate via messaging.

**Relevance to AIOS:** This is the closest reference model. The key architectural decision in Swarms is that the team lead maintains the master plan while specialists execute independently. This validates Model C's approach of a master daemon + worker daemons.

### 11.5. Multi-Session Claude Precedent

The Claude Agent SDK supports multiple concurrent sessions explicitly. The [Session Management documentation](https://platform.claude.com/docs/en/agent-sdk/sessions) confirms:
- Sessions can be created, resumed, and forked
- Multiple sessions can exist simultaneously
- `forkSession: true` creates a new session branching from an existing one
- Each session maintains its own context and conversation history

**No documented limit on concurrent sessions** per API key, but rate limits apply per-key.

---

## 12. Trade-Off Matrix

| Criterion | Single (Current) | Model A (Full) | Model B (Grouped) | Model C (Hybrid) | Model D (Pool) |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Parallelism | 1 | 5 | 4 | 4 | 4 |
| Context Isolation | 1 | 5 | 4 | 3 | 2 |
| Fault Isolation | 1 | 5 | 4 | 4 | 4 |
| RAM Efficiency | 5 | 1 | 3 | 5 | 3 |
| API Cost Efficiency | 5 | 1 | 3 | 4 | 3 |
| Implementation Effort | 5 | 1 | 2 | 4 | 2 |
| Operational Simplicity | 5 | 1 | 2 | 4 | 2 |
| Backward Compatibility | 5 | 1 | 2 | 5 | 1 |
| Telegram Bridge Impact | 5 | 1 | 2 | 5 | 2 |
| **Total (out of 45)** | **33** | **21** | **26** | **38** | **23** |

**Scale:** 1 = worst, 5 = best

**Model C (Hybrid) scores highest** because it preserves the simplicity and cost-efficiency of the current system while adding parallelism on-demand. It does not require hardware upgrades, Bridge changes, or operational complexity increases.

---

## 13. Recommendation

### Primary Recommendation: Adopt Model C (Hybrid) as Phase 2

**Do not implement immediately.** The current Phase 0 single-daemon must prove stable in production before adding worker complexity. The recommended sequence:

```
Phase 0 (Current)     Phase 1 (Stabilize)     Phase 2 (Hybrid)
  Single daemon   -->   Hardened daemon    -->   Master + Workers
  Prove viability       Production-ready        On-demand parallelism
  March 2026            April 2026              May-June 2026
```

### Phase 2 Implementation Plan

**Step 1: WorkerDaemon class** (simplified SessionDaemon for ephemeral single-command processing)
- No persistent session (create on start, discard on finish)
- No CommandQueue (single command, direct processing)
- Same outbox writing as master
- Process timeout with cleanup

**Step 2: SpawnDecider** (in master daemon)
- If master is BUSY and new command targets a different agent: spawn worker
- If system memory < 1 GB available: do not spawn (queue instead)
- Max 2 concurrent workers

**Step 3: WorkerSpawner** (process lifecycle management)
- Fork child process or use `child_process.spawn()`
- Pass command via temporary file or stdin
- Monitor worker health (timeout, OOM)
- Clean up worker artifacts on completion

**Step 4: Configuration** (daemon.yaml)
- Worker enable/disable toggle
- Max concurrent workers
- Per-agent model overrides
- Worker timeout

**Step 5: Observability** (health.json + Telegram Bridge)
- Track active workers in health.json
- Optional: show worker status in `/agents` Telegram command

### What NOT to Do

1. **Do not build a coordinator/lock manager.** Workers process one command and exit. If the master is doing work on the codebase and a worker also does work on the codebase, the risk of conflict is accepted for now. In practice, the most common scenario is a strategy agent (architect, pm) running in a worker while dev runs in the master -- these rarely touch the same files.

2. **Do not split the inbox/outbox.** Keep the shared filesystem IPC. Workers write to the same outbox. This avoids Telegram Bridge changes entirely.

3. **Do not implement session pooling.** The overhead of maintaining warm sessions for agents that are rarely used (ux, data-engineer, po, sm) does not justify the memory cost.

4. **Do not upgrade the VPS yet.** Model C works within current hardware constraints. Re-evaluate only if concurrent worker count needs to exceed 3.

### Security Implications

- Workers inherit the same `settingSources` and deny rules as the master. Constitutional enforcement is maintained.
- Workers run as the same user (`ubuntu`) with the same filesystem permissions.
- Workers use the same `ANTHROPIC_API_KEY` (rate limit sharing).
- No new attack surface is introduced (workers do not listen on network ports).

### Backward Compatibility

- **100% backward compatible.** If `workers.enabled: false` in daemon.yaml, the system behaves exactly as the current single-daemon.
- No Telegram Bridge changes required for basic functionality.
- No inbox/outbox schema changes required.
- Existing CLI commands (`aios-daemon health`, `aios-daemon send`) continue to work unchanged.

---

## 14. Migration Path (If Adopted)

### 14.1. Phase 2 Stories

| Story | Scope | Estimate |
|-------|-------|----------|
| Worker daemon core (WorkerDaemon class) | Create ephemeral daemon that processes single command | 3 SP |
| Spawn decision logic (SpawnDecider) | Decide when to spawn vs queue | 2 SP |
| Worker spawner (WorkerSpawner) | Process lifecycle, timeout, cleanup | 3 SP |
| Health monitoring extension | Track workers in health.json | 1 SP |
| Configuration and model overrides | daemon.yaml worker section | 1 SP |
| Integration testing | Master + worker E2E tests | 3 SP |
| Telegram Bridge observability | Optional: /workers command | 1 SP |
| **Total** | | **14 SP** |

### 14.2. Rollback Plan

If Model C proves problematic after deployment:
1. Set `workers.enabled: false` in daemon.yaml
2. Restart daemon (`systemctl restart aios-session-daemon`)
3. System reverts to single-daemon behavior immediately
4. No data migration or cleanup required

### 14.3. Success Criteria

Model C is successful if:
- Parallel command processing works for independent agents (e.g., dev + architect)
- Worker spawn time < 30 seconds
- No increase in session crashes or FAILED states
- API cost increase < 30% over single-daemon baseline
- RAM usage stays below 4 GB peak

---

## 15. Open Questions

1. **Git worktrees for workers?** Should workers use `git worktree` to operate on isolated copies of the codebase? This would eliminate file conflicts entirely but adds complexity and disk usage. The current `core-config.yaml` has `worktree.enabled: true` with `maxWorktrees: 10`, suggesting infrastructure for this already exists.

2. **Session forking vs fresh creation?** The Claude SDK supports `forkSession: true` when resuming. Should workers fork from the master's session (inheriting accumulated context) or create fresh sessions (clean context)? Trade-off: forked sessions have richer context but inherit any contamination; fresh sessions are clean but lack accumulated project knowledge.

3. **Worker model selection?** Should the model be fixed per agent (config-driven) or dynamic (based on task complexity)? For example, a simple `@pm` status check could use Haiku, but a complex `@pm *create-epic` could use Opus.

4. **Rate limit coordination?** With multiple sessions making API calls, there is a risk of hitting per-key rate limits. Should the master daemon manage a shared rate limiter for workers? Or rely on the SDK's built-in retry-on-429 behavior?

5. **Context window handoff?** When a worker completes a task, should the result be injected into the master's context? Currently, the agent handoff protocol (`.claude/rules/agent-handoff.md`) compacts agent context to ~379 tokens. Workers could emit a similar handoff artifact for the master to consume.

---

## References

### Project Files Analyzed

- `/home/ubuntu/aios-core/packages/session-daemon/src/index.js` -- SessionDaemon main entry
- `/home/ubuntu/aios-core/packages/session-daemon/src/session-adapter.js` -- SDK wrapper
- `/home/ubuntu/aios-core/packages/session-daemon/src/inbox-watcher.js` -- Inbox processing
- `/home/ubuntu/aios-core/packages/session-daemon/src/outbox-writer.js` -- Outbox writing
- `/home/ubuntu/aios-core/packages/session-daemon/src/command-queue.js` -- FIFO queue
- `/home/ubuntu/aios-core/packages/session-daemon/src/stream-processor.js` -- SDK stream parser
- `/home/ubuntu/aios-core/packages/session-daemon/src/health-monitor.js` -- Health state machine
- `/home/ubuntu/aios-core/packages/session-daemon/src/cli.js` -- CLI interface
- `/home/ubuntu/aios-core/packages/session-daemon/config/daemon.yaml` -- Daemon config
- `/home/ubuntu/aios-core/packages/session-daemon/config/aios-session-daemon.service` -- systemd unit
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/index.js` -- Bridge entry point
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/bot-manager.js` -- Telegram bot manager
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/agent-router.js` -- Agent routing
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/outbox-watcher.js` -- Outbox consumer
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/inbox-writer.js` -- Inbox producer
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/message-formatter.js` -- Message formatting
- `/home/ubuntu/aios-core/packages/telegram-bridge/src/rate-limiter.js` -- Rate limiting
- `/home/ubuntu/aios-core/packages/telegram-bridge/config/bots.yaml` -- Bot configuration
- `/home/ubuntu/aios-core/docs/architecture/session-daemon-phase0.md` -- Phase 0 architecture

### External References

- [Claude Agent SDK Session Management](https://platform.claude.com/docs/en/agent-sdk/sessions)
- [Claude Agent SDK V2 Preview](https://platform.claude.com/docs/en/agent-sdk/typescript-v2-preview)
- [Claude Agent SDK Hosting Guide](https://platform.claude.com/docs/en/agent-sdk/hosting)
- [Anthropic API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Multi-Agent Orchestration: Running 10+ Claude Instances in Parallel](https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da)
- [Claude Code Multiple Agent Systems Guide (2026)](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [LangGraph vs CrewAI vs AutoGen Comparison (2026)](https://dev.to/pockit_tools/langgraph-vs-crewai-vs-autogen-the-complete-multi-agent-ai-orchestration-guide-for-2026-2d63)
- [Open Source AI Agent Frameworks Compared (2026)](https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared)

---

*Aria, arquitetando o futuro*
