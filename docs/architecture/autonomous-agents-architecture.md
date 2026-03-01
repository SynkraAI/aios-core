# Autonomous Agents Architecture: From Single-Daemon to Governed Agent Fleet

**Author:** Aria (Architect Agent)
**Date:** 2026-03-01
**Status:** DRAFT -- Pending Review
**Supersedes:** multi-daemon-analysis.md (Model C Hybrid recommendation)
**Relates To:** session-daemon-phase0.md, telegram-observability-bridge.md, autonomous-agents-market-research.md

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision and Design Principles](#2-vision-and-design-principles)
3. [Current Architecture Baseline](#3-current-architecture-baseline)
4. [Target Architecture Overview](#4-target-architecture-overview)
5. [Execution Architecture](#5-execution-architecture)
6. [Inter-Agent Communication](#6-inter-agent-communication)
7. [Task Distribution](#7-task-distribution)
8. [Distributed Governance](#8-distributed-governance)
9. [Overnight Execution](#9-overnight-execution)
10. [Memory and State](#10-memory-and-state)
11. [Impact on Existing Components](#11-impact-on-existing-components)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Decision Log](#13-decision-log)
14. [Risks and Mitigations](#14-risks-and-mitigations)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

This document defines the complete architecture for evolving the Synkra AIOS from a **single-daemon sequential model** (one Claude Code session shared across all 11 agents) to a **governed autonomous agent fleet** where agents can work independently, in parallel, overnight, while maintaining Constitutional compliance and authority boundaries.

**Key architectural decisions:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Execution model | Master-Worker with on-demand spawn | Balances RAM (8GB VPS) with parallelism |
| Communication | Filesystem event bus + structured messages | Zero new dependencies, crash-recoverable |
| Task distribution | Centralized dispatcher with per-agent inboxes | Preserves authority matrix, enables dependency chains |
| Governance | Pre-flight Constitution gate + runtime sentinel | Prevents violations before and during execution |
| Overnight mode | Bounded autonomous loops with escalation | Human sleeps safely, agents work within guardrails |
| State management | Filesystem JSON + SQLite WAL | Survives VPS restarts, zero cloud dependency |

**Hardware target:** 7.8 GB RAM, 2 CPU cores (AMD EPYC), 96 GB disk (60 GB free). Current daemon uses approximately 600 MB. Architecture supports 2-3 concurrent workers within these constraints.

---

## 2. Vision and Design Principles

### 2.1 Vision Statement

> "Agentes de verdade. Independentes. Uma equipe. Mais vida. Que trabalham de fato enquanto eu durmo."

Translated into architecture: agents must be **process-isolated**, **authority-bounded**, **autonomously executing**, **overnight-capable**, and **observable from Telegram** -- all within the governance framework the Constitution already defines.

### 2.2 Design Principles

| # | Principle | Implication |
|---|-----------|-------------|
| P1 | **CLI First** (Constitution Art. I) | All agent orchestration via CLI/filesystem. No web UI required. |
| P2 | **Authority is structural, not advisory** | Agent boundaries enforced at process level, not by prompt. |
| P3 | **Spawn cost over idle cost** | On-demand workers over persistent daemons (RAM constraint). |
| P4 | **Filesystem is the bus** | No new infrastructure (Redis, RabbitMQ). JSON files are the IPC. |
| P5 | **Crash resilience by default** | Every state is on disk. Any process can die and recover. |
| P6 | **Incremental evolution** | Each phase is independently deployable and backward-compatible. |
| P7 | **Cost awareness** | Every API call is tracked. Budgets per task. Kill switches on spend. |
| P8 | **Observable overnight** | Telegram Bridge is the eyes. Lucas wakes up to a full report. |

### 2.3 What "Autonomous" Means in This Context

The AIOS defines autonomy as **L3 -- Autonomous Supervised** (from market research taxonomy):

- Agents work for hours without human intervention
- Escalate to human only for: (a) critical decisions, (b) Constitution violations, (c) budget exceeded, (d) repeated failures
- All actions are within pre-authorized scope (story + authority matrix)
- Full audit trail of every decision

This is NOT L4/L5 autonomy. The system does not self-modify goals or self-organize.

---

## 3. Current Architecture Baseline

### 3.1 Single-Daemon Model

```
                        +-----------------------------------+
                        |          SESSION DAEMON            |
                        |  (single Node.js process, ~600MB) |
                        |                                   |
  Telegram   inbox/     |  InboxWatcher                     |
  Bridge  ----------->  |       |                           |
                        |  CommandQueue (FIFO, max 50)      |
                        |       |                           |
                        |  SessionAdapter                   |
                        |  (Claude Agent SDK v2/v1)         |
                        |  [ONE shared Claude session]      |
                        |       |                           |
                        |  StreamProcessor                  |
                        |       |                           |
  Telegram   outbox/    |  OutboxWriter                     |
  Bridge  <-----------  |                                   |
                        |  HealthMonitor                    |
                        +-----------------------------------+
```

### 3.2 Key Limitations

| Limitation | Impact |
|-----------|--------|
| **Sequential execution** | One command at a time. @dev blocks @qa. |
| **Shared context window** | All agents share 200K tokens. Context pollution across agents. |
| **No parallelism** | Cannot implement a story and run QA simultaneously. |
| **Single point of failure** | Daemon crash stops everything. |
| **Agent switching overhead** | Each @agent switch consumes ~3-5K tokens for persona load. |
| **No overnight autonomy** | Queue processes one-by-one, no workflow orchestration. |

### 3.3 What Works Well (Preserve)

- Filesystem-based IPC (inbox/outbox JSON) -- battle-tested, crash-recoverable
- Schema validation on messages (inbox-message.json, outbox-message.json)
- Health monitoring with state machine (STARTING/READY/BUSY/RECOVERY/FAILED)
- Telegram Bridge multi-bot architecture with AgentRouter
- Authorization via allowed_senders whitelist
- Deduplication in InboxWatcher
- Retry with exponential backoff in CommandQueue

---

## 4. Target Architecture Overview

### 4.1 High-Level Architecture

```
+-----------------------------------------------------------------------+
|                          ORCHESTRATOR (Master Daemon)                   |
|  Persistent process (~300MB) -- always running                        |
|                                                                       |
|  +-------------------+  +-------------------+  +-------------------+  |
|  | Task Dispatcher   |  | Governance Engine |  | Workflow Engine   |  |
|  | (assigns tasks    |  | (Constitution     |  | (story/epic      |  |
|  |  to workers)      |  |  enforcement)     |  |  orchestration)  |  |
|  +-------------------+  +-------------------+  +-------------------+  |
|                                                                       |
|  +-------------------+  +-------------------+  +-------------------+  |
|  | Event Bus         |  | Cost Tracker      |  | Overnight         |  |
|  | (filesystem       |  | (token/$ per      |  | Scheduler         |  |
|  |  pub/sub)         |  |  agent/task)      |  | (cron-like)       |  |
|  +-------------------+  +-------------------+  +-------------------+  |
+-----------------------------------------------------------------------+
         |                        |                        |
    spawn/kill              read/write               health checks
         |                        |                        |
    +----v----+              +----v----+              +----v----+
    | Worker  |              | Worker  |              | Worker  |
    | @dev    |              | @qa     |              | @arch   |
    | (~600MB)|              | (~600MB)|              | (~600MB)|
    | Claude  |              | Claude  |              | Claude  |
    | Session |              | Session |              | Session |
    +---------+              +---------+              +---------+
         |                        |                        |
    own inbox/               own inbox/               own inbox/
    outbox                   outbox                   outbox
         |                        |                        |
         +------------------------+------------------------+
                                  |
                          +-------v-------+
                          | Telegram      |
                          | Bridge        |
                          | (unchanged    |
                          |  multi-bot)   |
                          +---------------+
```

### 4.2 Component Inventory

| Component | New/Modified | Process | RAM Estimate |
|-----------|-------------|---------|-------------|
| **Orchestrator** | NEW (evolution of session-daemon) | Persistent, systemd | ~300 MB |
| **Worker** | NEW (thin session wrapper) | On-demand, child_process | ~600 MB each |
| **Governance Engine** | NEW (module in Orchestrator) | In-process | ~10 MB |
| **Task Dispatcher** | NEW (module in Orchestrator) | In-process | ~10 MB |
| **Workflow Engine** | NEW (module in Orchestrator) | In-process | ~20 MB |
| **Event Bus** | NEW (filesystem-based) | In-process | ~5 MB |
| **Cost Tracker** | NEW (module in Orchestrator) | In-process | ~5 MB |
| **Overnight Scheduler** | NEW (module in Orchestrator) | In-process | ~5 MB |
| **Telegram Bridge** | MODIFIED (multi-worker aware) | Persistent, systemd | ~80 MB (unchanged) |

**Peak memory at max concurrency (2 workers):** 300 + 600 + 600 + 80 = **1,580 MB** (~1.5 GB)
**Available RAM:** 2.8 GB (current), expanding to ~5 GB after freeing current daemon
**Headroom:** Comfortable for 2 concurrent workers, tight for 3

---

## 5. Execution Architecture

### 5.1 Master-Worker Model

The Orchestrator is a persistent Node.js process that replaces the current session-daemon. It does NOT hold a Claude SDK session itself. Instead, it spawns Worker processes on demand, each with its own isolated Claude Code session.

```
Orchestrator (no SDK session)
    |
    +-- spawn --> Worker @dev (SDK session, isolated context)
    |                 |
    |                 +-- execute task
    |                 +-- write results to worker outbox
    |                 +-- exit (or sleep)
    |
    +-- spawn --> Worker @qa (SDK session, isolated context)
                      |
                      +-- execute task
                      +-- write results to worker outbox
                      +-- exit (or sleep)
```

**Why Master-Worker over multi-daemon?**

| Alternative | Why rejected |
|-------------|-------------|
| 11 persistent daemons | 11 x 600MB = 6.6 GB. Exceeds VPS RAM. |
| 3 grouped daemons (per multi-daemon-analysis.md) | Context pollution between agents sharing a session persists. |
| N reusable slots (pool) | Context pollution when reusing session across different agents. |
| Master + on-demand workers (THIS) | Clean context per agent. RAM used only during active work. Scales with hardware. |

### 5.2 Worker Lifecycle

```
              IDLE (no process)
                    |
          Task assigned by Dispatcher
                    |
                    v
              SPAWNING
                    |
          child_process.fork() or exec
                    |
                    v
              INITIALIZING
                    |
          SDK session created/resumed
          Agent persona injected
          Task context loaded
                    |
                    v
              EXECUTING
                    |
          Processing task via Claude SDK
          Writing progress to worker outbox
          Governance sentinel active
                    |
              +-----+------+
              |            |
         Task done    Task failed
              |            |
              v            v
          REPORTING    REPORTING
              |            |
          Write final  Write error
          to outbox    to outbox
              |            |
              v            v
          COOLDOWN     COOLDOWN
              |            |
    +----+----+----+       |
    |         |            |
  More    No more     Recovery/
  tasks   tasks       Retry
    |         |            |
    v         v            v
  EXECUTING  EXITING    SPAWNING
              |            (if retries left)
              v
           DEAD
        (process exits)
```

### 5.3 Worker Implementation

Each Worker is a standalone Node.js script that:

1. Receives task definition via command-line arguments (JSON file path)
2. Creates a fresh Claude SDK session with agent-specific configuration
3. Executes the task
4. Writes results to its own outbox directory
5. Exits (or enters cooldown for potential follow-up tasks)

```
File: packages/session-daemon/src/worker.js

Arguments:
  --task <path>       Path to task JSON file
  --agent <id>        Agent identity (dev, qa, architect, etc.)
  --session <id>      Optional: resume existing session
  --budget <tokens>   Max tokens for this execution
  --timeout <ms>      Max wall-clock time

Environment:
  ANTHROPIC_API_KEY   (inherited from Orchestrator)
  AIOS_CWD            /home/ubuntu/aios-core
  AIOS_WORKER_ID      Unique worker identifier
  AIOS_AGENT_ID       Agent identity

Exit codes:
  0  - Task completed successfully
  1  - Task failed (retryable)
  2  - Task failed (non-retryable)
  3  - Budget exceeded
  4  - Timeout
  5  - Governance violation
```

### 5.4 Worker Configuration Per Agent

Each agent's worker inherits its authority boundaries structurally:

```yaml
# config/worker-profiles.yaml
profiles:
  dev:
    model: "claude-sonnet-4-5-20250929"
    max_tokens_per_task: 500000
    max_wall_time_ms: 3600000  # 1 hour
    allowed_tools:
      - Read
      - Write
      - Edit
      - Bash
      - Grep
      - Glob
      - Task
      - WebSearch
      - WebFetch
    denied_tools: []
    denied_bash_patterns:
      - "git push"
      - "gh pr create"
      - "gh pr merge"
    permission_mode: "bypassPermissions"
    system_prompt_append: |
      You are @dev (Dex). You CANNOT push to git or create PRs.
      If you need to push, write a request to .aios/events/pending/.

  qa:
    model: "claude-sonnet-4-5-20250929"
    max_tokens_per_task: 300000
    max_wall_time_ms: 1800000  # 30 min
    allowed_tools:
      - Read
      - Bash
      - Grep
      - Glob
      - Task
    denied_tools:
      - Write
      - Edit
    denied_bash_patterns:
      - "git push"
      - "rm -rf"
    permission_mode: "bypassPermissions"
    system_prompt_append: |
      You are @qa (Quinn). You are READ-ONLY.
      You CANNOT modify files. Only analyze and report.

  architect:
    model: "claude-opus-4-6"
    max_tokens_per_task: 800000
    max_wall_time_ms: 7200000  # 2 hours
    allowed_tools:
      - Read
      - Write
      - Edit
      - Bash
      - Grep
      - Glob
      - WebSearch
      - WebFetch
    denied_tools: []
    denied_bash_patterns:
      - "git push"
      - "gh pr"
      - "npm publish"
    permission_mode: "bypassPermissions"
    system_prompt_append: |
      You are @architect (Aria). Design only, no implementation.

  devops:
    model: "claude-sonnet-4-5-20250929"
    max_tokens_per_task: 200000
    max_wall_time_ms: 900000  # 15 min
    allowed_tools:
      - Read
      - Bash
      - Grep
      - Glob
    denied_tools:
      - Write
      - Edit
    allowed_bash_patterns:
      - "git push"
      - "gh pr"
    permission_mode: "bypassPermissions"
    system_prompt_append: |
      You are @devops (Gage). EXCLUSIVE authority for git push and PR operations.
```

### 5.5 Concurrency Control

Given the 8 GB RAM constraint:

```
MAX_CONCURRENT_WORKERS = 2  (configurable, default)
MAX_CONCURRENT_WORKERS_LIMIT = 3  (absolute ceiling on current hardware)
```

The Orchestrator enforces this via a semaphore:

```
Worker Semaphore:
  capacity: 2
  queue: FIFO (tasks wait if both slots occupied)
  preemption: NONE (running workers are never killed for priority)
  starvation: prevented by max_wall_time per worker
```

When the VPS is upgraded (e.g., to 16 GB), `MAX_CONCURRENT_WORKERS` can be increased to 4-5 without any code changes.

### 5.6 Resource Enforcement

Each Worker runs under cgroup constraints (via systemd transient units or Node.js `child_process` resource limits):

```
Per-Worker limits:
  MemoryMax:   1.5G
  CPUQuota:    100%  (one core)
  TimeoutSec:  max_wall_time_ms from profile

Orchestrator limits:
  MemoryMax:   512M
  CPUQuota:    50%
```

---

## 6. Inter-Agent Communication

### 6.1 Event Bus Architecture

Communication between agents uses a **filesystem-based event bus**. This extends the existing inbox/outbox pattern into a general-purpose pub/sub system.

```
.aios/
  events/
    pending/       # New events (written by any component)
    processing/    # Being handled by a subscriber
    completed/     # Successfully processed
    failed/        # Failed processing

  workers/
    dev/
      inbox/       # Tasks assigned to @dev
      outbox/      # Results from @dev
      health.json  # Worker health state
    qa/
      inbox/
      outbox/
      health.json
    ...

  orchestrator/
    state.json     # Orchestrator state
    schedule.json  # Overnight task schedule
    budget.json    # Cost tracking
```

### 6.2 Event Schema

Events extend the existing outbox message schema with inter-agent routing:

```json
{
  "schema_version": "3.0",
  "id": "evt-1709312345678-a1b2",
  "type": "task_completed",
  "timestamp": "2026-03-01T15:30:00.000Z",
  "source": {
    "agent": "dev",
    "worker_id": "worker-dev-1709312340000",
    "task_id": "task-story-2.1-implement"
  },
  "target": {
    "agent": "qa",
    "workflow": "story-development-cycle"
  },
  "payload": {
    "story_id": "2.1",
    "story_path": "docs/stories/active/2.1.story.md",
    "branch": "feat/story-2.1",
    "files_changed": ["src/components/feature.tsx", "src/stores/feature-store.ts"],
    "commit_sha": "abc1234",
    "test_results": { "passed": 12, "failed": 0, "skipped": 1 }
  },
  "governance": {
    "constitution_check": "PASSED",
    "authority_check": "PASSED",
    "budget_remaining_tokens": 150000
  }
}
```

### 6.3 Event Types

| Event Type | Source | Target | Trigger |
|-----------|--------|--------|---------|
| `task_assigned` | Orchestrator | Worker | New task dispatched to agent |
| `task_accepted` | Worker | Orchestrator | Worker acknowledged task |
| `task_progress` | Worker | Orchestrator + Bridge | Periodic status update |
| `task_completed` | Worker | Orchestrator | Task finished successfully |
| `task_failed` | Worker | Orchestrator | Task failed after retries |
| `governance_violation` | Gov Engine | Orchestrator + Bridge | Authority boundary crossed |
| `budget_warning` | Cost Tracker | Orchestrator + Bridge | Token budget at 80% |
| `budget_exceeded` | Cost Tracker | Worker (kill) | Token budget at 100% |
| `agent_request` | Worker | Orchestrator | Agent requests another agent's help |
| `escalation` | Worker/Gov | Bridge (Telegram) | Human intervention needed |
| `overnight_report` | Scheduler | Bridge (Telegram) | Summary of overnight work |
| `workflow_step` | Workflow Engine | Orchestrator | Next step in SDC/QA Loop |
| `heartbeat` | Worker | Orchestrator | Worker is alive |

### 6.4 Communication Flow: @dev Notifies @qa

Concrete example of how the Story Development Cycle Phase 3 (implement) transitions to Phase 4 (QA gate):

```
1. @dev Worker finishes implementation
   |
   +-- Writes: .aios/events/pending/evt-{epoch}-dev-task_completed.json
   |   {
   |     type: "task_completed",
   |     source: { agent: "dev", task_id: "task-story-2.1-implement" },
   |     target: { agent: "qa", workflow: "story-development-cycle" },
   |     payload: { story_id: "2.1", files_changed: [...], commit_sha: "abc" }
   |   }
   |
   +-- Worker exits (or enters cooldown)

2. Orchestrator's EventBus detects new file in events/pending/
   |
   +-- Reads event
   +-- Governance Engine validates: does @dev have authority to trigger QA?
   |   Result: PASSED (SDC workflow authorizes this transition)
   |
   +-- Workflow Engine checks: is story 2.1 in "InProgress" state?
   |   Result: YES
   |
   +-- Task Dispatcher creates QA task:
       Writes: .aios/workers/qa/inbox/task-story-2.1-qa-gate.json
       {
         type: "qa_gate",
         story_id: "2.1",
         files_to_review: [...],
         commit_range: "main..feat/story-2.1",
         checklist: "qa-gate-checklist.md"
       }

3. If Worker @qa is idle:
   +-- Orchestrator spawns Worker @qa
   +-- Worker picks up task from its inbox
   +-- Executes QA gate
   +-- Writes result to .aios/workers/qa/outbox/
   +-- Writes event: .aios/events/pending/evt-{epoch}-qa-task_completed.json

4. Orchestrator picks up QA result
   +-- If PASS: marks story as Done, writes Telegram notification
   +-- If FAIL: creates fix task for @dev, restarts cycle
```

### 6.5 How @architect Broadcasts Decisions

Architectural decisions that affect multiple agents use a **broadcast event**:

```json
{
  "schema_version": "3.0",
  "type": "architecture_decision",
  "source": { "agent": "architect" },
  "target": { "agent": "*", "broadcast": true },
  "payload": {
    "decision_id": "ADR-007",
    "title": "Use SQLite for worker state persistence",
    "summary": "All worker state persisted via SQLite WAL mode...",
    "impacts": ["dev", "devops", "data-engineer"],
    "files_affected": ["packages/session-daemon/src/state-store.js"]
  }
}
```

The Orchestrator's EventBus delivers broadcast events to all active workers and writes them to a shared decisions log at `.aios/decisions/`.

---

## 7. Task Distribution

### 7.1 Task Dispatcher Design

The Task Dispatcher is a module within the Orchestrator responsible for:

1. Receiving tasks from: external commands (inbox), workflow transitions, scheduled jobs
2. Validating authority: can this agent perform this task?
3. Resolving dependencies: does this task depend on another task completing first?
4. Assigning to worker: write to agent's inbox directory
5. Managing the worker semaphore: enforce concurrency limits

```
                    External Commands
                    (Telegram, CLI, systemd_timer)
                          |
                          v
                    +-------------+
                    |   Inbox     |
                    | (existing)  |
                    +------+------+
                           |
                    +------v------+
                    |   Task      |
                    | Classifier  |
                    +------+------+
                           |
              +------------+------------+
              |                         |
        Direct command           Workflow step
        (e.g. "fix bug X")      (e.g. SDC Phase 3)
              |                         |
              v                         v
        +-----+-------+         +------+------+
        | Authority    |         | Workflow    |
        | Validator    |         | Engine      |
        +-----+-------+         +------+------+
              |                         |
              +------------+------------+
                           |
                    +------v------+
                    |   Task      |
                    | Dispatcher  |
                    +------+------+
                           |
              +-----+------+------+-----+
              |            |            |
        Worker @dev  Worker @qa  Worker @arch
        inbox/       inbox/      inbox/
```

### 7.2 Task Schema

```json
{
  "schema_version": "1.0",
  "id": "task-1709312345678-a1b2",
  "type": "implement_story",
  "agent": "dev",
  "priority": "normal",
  "created_at": "2026-03-01T15:30:00.000Z",
  "created_by": "orchestrator",
  "workflow": {
    "id": "sdc-story-2.1",
    "phase": "implement",
    "step": 3,
    "depends_on": ["task-story-2.1-validate"]
  },
  "context": {
    "story_id": "2.1",
    "story_path": "docs/stories/active/2.1.story.md",
    "branch": "feat/story-2.1",
    "architecture_doc": "docs/architecture/feature-x.md"
  },
  "execution": {
    "command": "@dev *develop-story 2.1 --yolo",
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 500000,
    "max_wall_time_ms": 3600000,
    "retry_policy": {
      "max_retries": 2,
      "backoff_ms": [30000, 120000]
    }
  },
  "governance": {
    "requires_approval": false,
    "constitution_articles": ["III", "IV", "V"],
    "authority_scope": "dev",
    "budget_limit_usd": 5.00
  },
  "status": "pending"
}
```

### 7.3 Priority System

Tasks are ordered by a composite priority score:

```
Priority Score = (base_priority * 100) + (workflow_urgency * 10) + age_bonus

Where:
  base_priority:
    critical = 4 (governance violations, security)
    high     = 3 (blocking other agents, QA failures)
    normal   = 2 (standard workflow tasks)
    low      = 1 (documentation, cleanup)

  workflow_urgency:
    blocking_others = 3 (other agents waiting on this)
    on_critical_path = 2 (part of active story)
    background = 1 (no dependencies)

  age_bonus:
    +1 per 15 minutes waiting (prevents starvation)
```

### 7.4 Dependency Resolution

Tasks can declare dependencies via `workflow.depends_on`. The Dispatcher maintains a dependency graph:

```
Story 2.1 SDC:
  [validate] ---> [implement] ---> [qa-gate] ---> [push]
       |               |               |             |
     @po done      @dev done       @qa done    @devops done
```

A task is only dispatched when all `depends_on` tasks have status `completed`.

**Circular dependency detection:** The Dispatcher runs a topological sort on the dependency graph before dispatching. If a cycle is detected, the task is rejected with `governance_violation` event.

### 7.5 Per-Agent Inbox vs Shared Queue

[AUTO-DECISION] Shared queue vs per-agent inbox? --> Per-agent inbox (reason: authority boundaries are per-agent, and a shared queue requires the Dispatcher to peek at task types before dequeuing, which adds complexity. Per-agent inboxes naturally partition work.)

```
.aios/workers/dev/inbox/    <-- Only @dev tasks land here
.aios/workers/qa/inbox/     <-- Only @qa tasks land here
.aios/workers/architect/inbox/
...
```

---

## 8. Distributed Governance

### 8.1 Governance Layers

Constitution enforcement operates at three layers:

```
Layer 1: PRE-FLIGHT (before task starts)
  |
  |  Constitution gate checks task definition
  |  Authority matrix validates agent x operation
  |  Budget check ensures cost within limits
  |  Dependency check confirms prerequisites met
  |
  v
Layer 2: STRUCTURAL (process-level enforcement)
  |
  |  Worker's allowed_tools whitelist (SDK config)
  |  Worker's denied_bash_patterns (runtime intercept)
  |  Worker's file write restrictions (systemd ReadWritePaths)
  |  Worker's cgroup resource limits (MemoryMax, CPUQuota)
  |
  v
Layer 3: RUNTIME SENTINEL (during execution)
  |
  |  Stream watcher monitors worker's output stream
  |  Detects forbidden patterns in tool usage
  |  Detects drift from assigned task
  |  Budget tracking per-token
  |  Heartbeat monitoring (worker alive?)
  |
  v
Layer 4: POST-FLIGHT (after task completes)
  |
  |  Validates output against expected artifacts
  |  Checks git diff for unauthorized changes
  |  Verifies no file modifications outside scope
  |  Records audit trail
```

### 8.2 Authority Enforcement (Constitution Article II)

The current authority matrix (from `agent-authority.md`) is enforced structurally:

| Agent | git push | Write files | Create PRs | Run tests | Deploy |
|-------|----------|-------------|-----------|-----------|--------|
| @dev | BLOCKED (process) | ALLOWED | BLOCKED (process) | ALLOWED | BLOCKED |
| @qa | BLOCKED (process) | BLOCKED (process) | BLOCKED (process) | ALLOWED | BLOCKED |
| @architect | BLOCKED (process) | ALLOWED (docs only) | BLOCKED (process) | N/A | BLOCKED |
| @devops | ALLOWED | BLOCKED (process) | ALLOWED | N/A | ALLOWED |

**How "BLOCKED (process)" works:**

1. **SDK tool whitelist:** Worker's `allowed_tools` config excludes the tool entirely
2. **Bash pattern blacklist:** Worker's `denied_bash_patterns` intercepts shell commands before execution
3. **Filesystem restriction:** Worker's systemd `ReadWritePaths` limits file system access
4. **Stream sentinel:** Orchestrator monitors the worker's output stream for forbidden operations

Example: @dev tries to `git push`:

```
Worker @dev -> SessionAdapter -> SDK -> Bash tool -> "git push origin main"
                                          |
                                    denied_bash_patterns match!
                                          |
                                    SDK returns error:
                                    "Bash command blocked by policy: git push"
                                          |
Worker @dev receives error, writes event:
  {
    type: "agent_request",
    source: { agent: "dev" },
    target: { agent: "devops" },
    payload: {
      request: "push",
      branch: "feat/story-2.1",
      reason: "Story 2.1 implementation complete"
    }
  }
```

### 8.3 Drift Detection

Agent drift (deviating from assigned task) is detected by the Runtime Sentinel:

```
Drift Detection Strategy:

  1. GOAL RE-INJECTION:
     Every N tool calls (configurable, default 20), the Orchestrator
     injects a system message into the worker's stream:

     "[SENTINEL] Reminder: Your current task is '{task_description}'.
      Story: {story_id}. Scope: {acceptance_criteria_summary}.
      Stay within these boundaries."

  2. FILE SCOPE MONITORING:
     The Sentinel tracks which files the worker modifies.
     If modifications deviate significantly from the task's expected
     file scope (defined in task.context.expected_files), a warning
     is emitted.

     Threshold: > 5 files outside expected scope triggers warning.
     Threshold: > 10 files outside expected scope triggers pause + escalation.

  3. TOKEN VELOCITY MONITORING:
     If token consumption rate exceeds 2x the expected rate for the
     task type, the Sentinel flags potential runaway behavior.

  4. TIME-BASED CHECKPOINTS:
     Every 15 minutes, the Sentinel compares worker progress
     (via task_progress events) against expected milestones.
     No progress for 30 minutes triggers escalation.
```

### 8.4 Kill Switch

The Orchestrator provides multiple kill mechanisms:

```
Kill Switch Hierarchy:

  Level 1: PAUSE WORKER
    - Writes pause signal to worker's inbox
    - Worker completes current tool call, then suspends
    - Reversible: resume signal restarts processing

  Level 2: TERMINATE WORKER
    - Sends SIGTERM to worker process
    - Worker has 30s for graceful shutdown
    - Task marked as "interrupted", retryable

  Level 3: KILL WORKER
    - Sends SIGKILL to worker process
    - Immediate termination, no cleanup
    - Task marked as "killed", may need manual recovery

  Level 4: KILL ALL (Emergency)
    - SIGKILL all worker processes
    - Orchestrator enters EMERGENCY state
    - Writes emergency notification to Telegram
    - All tasks paused until human resumes

  Level 5: SYSTEM HALT
    - Orchestrator shuts down
    - systemd does not restart (manual restart required)
    - Maximum safety: nothing runs
```

**Trigger mechanisms:**

| Trigger | Kill Level | Automated? |
|---------|-----------|-----------|
| Budget exceeded | 2 (TERMINATE) | Yes |
| Governance violation | 2 (TERMINATE) | Yes |
| Drift detected (severe) | 1 (PAUSE) + escalation | Yes |
| Worker unresponsive (no heartbeat 5 min) | 3 (KILL) | Yes |
| User sends `/kill` via Telegram | 4 (KILL ALL) | No |
| User sends `/halt` via Telegram | 5 (SYSTEM HALT) | No |
| VPS memory > 90% | 2 (TERMINATE oldest worker) | Yes |

### 8.5 Audit Trail

Every governance decision is logged to `.aios/audit/`:

```json
{
  "timestamp": "2026-03-01T03:15:30.000Z",
  "type": "authority_check",
  "agent": "dev",
  "operation": "bash:git push",
  "result": "BLOCKED",
  "reason": "denied_bash_patterns match",
  "task_id": "task-story-2.1-implement",
  "constitution_article": "II"
}
```

Audit files are rotated daily and retained for 30 days. The overnight report includes a summary of all governance events.

---

## 9. Overnight Execution

### 9.1 What Can Run Without Supervision

Based on the market research finding that L3 autonomous tasks succeed 60-80% for tasks under 2 hours, and the AIOS authority boundaries:

| Task Type | Overnight? | Max Duration | Approval Needed? |
|-----------|-----------|-------------|-----------------|
| Bug fixes (well-defined) | YES | 1 hour | No |
| Story implementation (with AC) | YES | 2 hours | No |
| Unit test writing | YES | 1 hour | No |
| Documentation generation | YES | 30 min | No |
| Code refactoring (scoped) | YES | 1.5 hours | No |
| QA gate execution | YES | 30 min | No |
| Architecture analysis | YES | 2 hours | No |
| Research tasks | YES | 1 hour | No |
| **git push** | **NO** | N/A | **ALWAYS** |
| **PR creation** | **NO** | N/A | **ALWAYS** |
| **Deploy to production** | **NO** | N/A | **ALWAYS** |
| **Schema migrations** | **NO** | N/A | **ALWAYS** |
| **New architectural decisions** | **CONDITIONAL** | 2 hours | If cost > $5 |

### 9.2 Overnight Scheduler

The Overnight Scheduler is a cron-like module within the Orchestrator that processes a nightly task plan:

```yaml
# .aios/orchestrator/schedule.json (generated by /overnight command)
{
  "id": "overnight-2026-03-01",
  "created_at": "2026-03-01T22:00:00Z",
  "created_by": "user",
  "approved": true,
  "budget_limit_usd": 25.00,
  "tasks": [
    {
      "order": 1,
      "type": "implement_story",
      "agent": "dev",
      "story_id": "2.1",
      "max_time_ms": 7200000,
      "max_cost_usd": 8.00,
      "depends_on": null
    },
    {
      "order": 2,
      "type": "qa_gate",
      "agent": "qa",
      "story_id": "2.1",
      "max_time_ms": 1800000,
      "max_cost_usd": 3.00,
      "depends_on": ["task-1"]
    },
    {
      "order": 3,
      "type": "implement_story",
      "agent": "dev",
      "story_id": "2.2",
      "max_time_ms": 7200000,
      "max_cost_usd": 8.00,
      "depends_on": null
    }
  ],
  "escalation_policy": {
    "on_failure": "skip_and_continue",
    "on_budget_exceeded": "stop_all",
    "on_governance_violation": "stop_all_and_notify",
    "notification_channel": "telegram"
  }
}
```

### 9.3 Telegram Integration for Overnight

The overnight execution integrates with the Telegram Bridge at these points:

```
22:00  User sends: /overnight story 2.1, 2.2
         |
       Orchestrator generates schedule
       Sends plan summary to Telegram for confirmation
         |
22:05  User sends: /approve
         |
       Overnight Scheduler activates
       Sends: "Overnight session starting. 3 tasks, $25 budget."
         |
22:10  Worker @dev spawns for story 2.1
       Telegram: "[DEV] Starting story 2.1 implementation..."
         |
00:30  Worker @dev completes story 2.1
       Telegram: "[DEV] Story 2.1 complete. 5 files changed. 12 tests passed."
       Worker @qa spawns for QA gate
       Worker @dev spawns for story 2.2 (parallel -- no dependency)
       Telegram: "[QA] Starting QA gate for story 2.1..."
       Telegram: "[DEV] Starting story 2.2 implementation..."
         |
01:15  Worker @qa completes
       Telegram: "[QA] Story 2.1: PASS (7/7 checks)"
         |
03:00  Worker @dev completes story 2.2
       Telegram: "[DEV] Story 2.2 complete."
         |
03:01  Overnight Scheduler: all tasks done
       Generates summary report
       Telegram:
         "OVERNIGHT REPORT
          ===============
          Duration: 4h 56m
          Cost: $14.30 of $25.00 budget

          Stories completed:
            2.1 - DONE (implemented + QA PASSED)
            2.2 - DONE (implemented, QA pending)

          Git: 2 branches ready for push
            feat/story-2.1 (3 commits)
            feat/story-2.2 (2 commits)

          Awaiting your approval:
            /push story-2.1
            /push story-2.2

          0 governance violations
          0 errors
          Full log: .aios/reports/overnight-2026-03-01.md"
         |
07:00  Lucas wakes up, reads Telegram
       Sends: /push story-2.1
       Orchestrator spawns Worker @devops for git push
```

### 9.4 Escalation During Overnight

When something goes wrong at 3 AM:

```
Escalation Matrix:

  Severity 1 (INFORMATIONAL):
    - Task completed with warnings
    - Action: Log to report, continue working
    - Telegram: Silent notification (no sound)

  Severity 2 (WARNING):
    - Budget at 80%
    - Task failed but retrying
    - Unexpected file modifications
    - Action: Log, send Telegram notification
    - Telegram: Normal notification

  Severity 3 (BLOCKING):
    - Task failed after all retries
    - QA gate FAIL
    - Dependency missing
    - Action: Skip task, notify, continue with independent tasks
    - Telegram: Urgent notification

  Severity 4 (CRITICAL):
    - Budget exceeded
    - Governance violation
    - Worker unresponsive
    - VPS resource exhaustion
    - Action: STOP ALL, send emergency notification
    - Telegram: Urgent notification + WhatsApp via OpenClaw

    Emergency notification (WhatsApp):
    sudo /usr/bin/openclaw message send \
      --target +5528999301848 \
      --message "[AIOS-EMERGENCY] Overnight session stopped.
      Reason: {reason}. All workers killed. Manual intervention required."
```

---

## 10. Memory and State

### 10.1 Memory Hierarchy

```
+-------------------------------------------------------------------+
|                    MEMORY ARCHITECTURE                             |
|                                                                   |
|  LAYER 1: Session Memory (volatile, per-worker)                   |
|  +---------------------------------------------------------+     |
|  | Claude SDK context window (~200K tokens)                 |     |
|  | Agent persona + task context + conversation history      |     |
|  | DIES with worker process. NOT shared.                    |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  LAYER 2: Worker State (filesystem, per-worker, ephemeral)        |
|  +---------------------------------------------------------+     |
|  | .aios/workers/{agent}/state.json                         |     |
|  | Current task, progress %, files modified, tokens used    |     |
|  | SURVIVES worker restart. DELETED when task completes.    |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  LAYER 3: Agent Memory (filesystem, per-agent, persistent)        |
|  +---------------------------------------------------------+     |
|  | .aios-core/development/agents/{id}/MEMORY.md             |     |
|  | .claude/agent-memory/{agent}/MEMORY.md                   |     |
|  | Patterns, preferences, lessons learned                   |     |
|  | PERSISTS across sessions. SHARED read access.            |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  LAYER 4: Project Memory (filesystem, global, persistent)         |
|  +---------------------------------------------------------+     |
|  | .aios/gotchas.json (code gotchas)                        |     |
|  | .aios/decisions/ (architectural decisions)                |     |
|  | docs/stories/ (story state)                              |     |
|  | .aios/audit/ (governance audit trail)                    |     |
|  | .aios/reports/ (overnight reports)                       |     |
|  | PERSISTS forever. Git-committed where appropriate.       |     |
|  +---------------------------------------------------------+     |
|                                                                   |
|  LAYER 5: Orchestrator State (SQLite, persistent)                 |
|  +---------------------------------------------------------+     |
|  | .aios/orchestrator/state.db                              |     |
|  | Task history, workflow state, cost tracking               |     |
|  | Session metadata, dependency graph                       |     |
|  | WAL mode for crash safety. Survives VPS restart.         |     |
|  +---------------------------------------------------------+     |
+-------------------------------------------------------------------+
```

### 10.2 Shared Knowledge Between Agents

Agents share knowledge through Layer 3 and Layer 4, NOT through direct communication:

```
@architect writes:
  docs/architecture/feature-x.md
  .aios/decisions/ADR-007.json

@dev reads these files when assigned implementation task.
The task.context includes paths to relevant architecture docs.

@dev writes:
  src/components/feature.tsx (implementation)
  .aios-core/development/agents/dev/MEMORY.md (lessons)

@qa reads the implementation files for review.
The QA task.context includes commit range and changed files.
```

This is a **blackboard pattern** -- agents communicate through shared artifacts on the filesystem, not through direct messages.

### 10.3 State Recovery After VPS Restart

```
VPS Restart Recovery Sequence:

1. systemd starts Orchestrator
   |
   v
2. Orchestrator reads .aios/orchestrator/state.db
   Recovers: active tasks, workflow state, budget tracking
   |
   v
3. Orchestrator scans .aios/workers/*/state.json
   Finds: interrupted workers (orphaned state files)
   |
   v
4. For each interrupted task:
   a. Was it retryable? -> Re-dispatch to agent inbox
   b. Was it non-retryable? -> Mark as failed, notify
   c. Was it near completion? -> Check git status for partial work
   |
   v
5. Orchestrator enters READY state
   Resumes processing task queues
   |
   v
6. systemd starts Telegram Bridge
   Bridge reconnects to Telegram API
   Sends: "AIOS recovered from restart. {N} tasks re-queued."
   |
   v
7. Normal operation resumes
```

### 10.4 SQLite Schema for Orchestrator State

```sql
-- .aios/orchestrator/state.db

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  agent TEXT NOT NULL,
  priority INTEGER DEFAULT 200,
  status TEXT DEFAULT 'pending',  -- pending, dispatched, executing, completed, failed, cancelled
  workflow_id TEXT,
  depends_on TEXT,  -- JSON array of task IDs
  context TEXT,     -- JSON blob
  execution TEXT,   -- JSON blob (model, tokens, timeout)
  governance TEXT,  -- JSON blob
  created_at TEXT NOT NULL,
  dispatched_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  result TEXT,      -- JSON blob
  tokens_used INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  error TEXT,
  retry_count INTEGER DEFAULT 0
);

CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,  -- sdc, qa_loop, spec_pipeline, brownfield
  story_id TEXT,
  current_phase TEXT,
  current_step INTEGER,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT,
  context TEXT  -- JSON blob
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source_agent TEXT,
  target_agent TEXT,
  payload TEXT,  -- JSON blob
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  processed_at TEXT
);

CREATE TABLE budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent TEXT NOT NULL,
  task_id TEXT,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  model TEXT,
  recorded_at TEXT NOT NULL
);

CREATE TABLE audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  agent TEXT,
  operation TEXT,
  result TEXT,
  reason TEXT,
  task_id TEXT,
  constitution_article TEXT
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_agent ON tasks(agent);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_budget_agent ON budget(agent);
CREATE INDEX idx_audit_agent ON audit(agent);
```

---

## 11. Impact on Existing Components

### 11.1 Session Daemon (packages/session-daemon/)

**Status:** EVOLVES into Orchestrator

| File | Change | Impact |
|------|--------|--------|
| `src/index.js` | MAJOR REWRITE | Becomes Orchestrator main. Removes SessionAdapter/StreamProcessor, adds TaskDispatcher/GovernanceEngine/WorkflowEngine/EventBus. |
| `src/session-adapter.js` | MOVED to Worker | Session creation logic moves to worker process. |
| `src/stream-processor.js` | MOVED to Worker (partially) | Core stream processing stays in worker. Agent switch detection moves to Orchestrator's EventBus. |
| `src/command-queue.js` | EVOLVES | Becomes TaskDispatcher. FIFO queue becomes priority queue with dependency resolution. |
| `src/inbox-watcher.js` | MINOR CHANGES | Same logic, but now writes tasks to per-agent inboxes instead of single queue. |
| `src/outbox-writer.js` | MINOR CHANGES | Same logic, used by workers. Orchestrator aggregates from worker outboxes. |
| `src/health-monitor.js` | EVOLVES | Monitors Orchestrator + all workers. Aggregates health into single health.json. |
| `config/daemon.yaml` | MAJOR CHANGES | Adds worker profiles, governance config, overnight config, event bus config. |
| NEW: `src/worker.js` | NEW | Standalone worker process with Claude SDK session. |
| NEW: `src/task-dispatcher.js` | NEW | Priority-based task distribution with dependency resolution. |
| NEW: `src/governance-engine.js` | NEW | Pre-flight + runtime Constitution enforcement. |
| NEW: `src/workflow-engine.js` | NEW | SDC, QA Loop, Spec Pipeline state machines. |
| NEW: `src/event-bus.js` | NEW | Filesystem-based pub/sub for inter-agent events. |
| NEW: `src/cost-tracker.js` | NEW | Per-agent, per-task token and cost tracking. |
| NEW: `src/overnight-scheduler.js` | NEW | Cron-like overnight task execution. |
| NEW: `src/sentinel.js` | NEW | Runtime stream monitoring for governance. |

### 11.2 Telegram Bridge (packages/telegram-bridge/)

**Status:** MODIFIED (multi-worker aware)

| File | Change | Impact |
|------|--------|--------|
| `src/index.js` | MODERATE | Add handlers for new commands: /overnight, /approve, /push, /kill, /halt, /budget. Wire to Orchestrator event bus. |
| `src/outbox-watcher.js` | MODERATE | Watch multiple outbox directories: `.aios/workers/*/outbox/` + `.aios/outbox/` (backward compat). |
| `src/agent-router.js` | MINOR | No fundamental change. Already routes by agent. New: route events from multiple workers. |
| `src/bot-manager.js` | MODERATE | New commands. /agents shows per-worker status. /status shows fleet health. |
| `src/inbox-writer.js` | UNCHANGED | Still writes to `.aios/inbox/pending/`. Orchestrator picks it up. |
| `src/message-formatter.js` | MINOR | New format for overnight reports and governance events. |
| `config/bots.yaml` | UNCHANGED | Bot configuration is independent of backend architecture. |

### 11.3 IPC (Inbox/Outbox)

**Status:** EXTENDED (backward compatible)

```
CURRENT:
  .aios/inbox/pending/      <-- commands from external (Telegram, CLI)
  .aios/outbox/pending/     <-- responses to external

NEW (added, does not break current):
  .aios/events/pending/     <-- inter-agent events
  .aios/workers/{agent}/inbox/   <-- per-agent task queue
  .aios/workers/{agent}/outbox/  <-- per-agent results
  .aios/workers/{agent}/health.json
  .aios/orchestrator/state.db
  .aios/audit/
  .aios/reports/
```

The existing inbox/outbox paths continue working. The Orchestrator reads from `.aios/inbox/pending/` (same as current daemon) and writes to `.aios/outbox/pending/` (same as current daemon). Internally, it also manages the per-worker directories.

### 11.4 New Components

| Component | Package | Description |
|-----------|---------|-------------|
| `worker.js` | session-daemon | Standalone worker process with Claude SDK |
| `task-dispatcher.js` | session-daemon | Priority queue with dependency resolution |
| `governance-engine.js` | session-daemon | Constitution enforcement engine |
| `workflow-engine.js` | session-daemon | Story lifecycle state machines |
| `event-bus.js` | session-daemon | Filesystem pub/sub |
| `cost-tracker.js` | session-daemon | Token/cost accounting |
| `overnight-scheduler.js` | session-daemon | Overnight task execution |
| `sentinel.js` | session-daemon | Runtime stream monitoring |
| `state-store.js` | session-daemon | SQLite state persistence |

---

## 12. Implementation Roadmap

### Phase 0: Foundation (1-2 weeks)

**Goal:** Worker process isolation without changing the Orchestrator yet.

**Scope:**
- Extract `worker.js` as standalone process
- Worker reads task from command-line argument
- Worker creates own Claude SDK session
- Worker writes results to its own outbox
- Single worker at a time (no parallelism yet)
- Orchestrator is just a thin wrapper that spawns workers sequentially

**What changes:**
- NEW: `packages/session-daemon/src/worker.js`
- NEW: `packages/session-daemon/config/worker-profiles.yaml`
- MODIFIED: `packages/session-daemon/src/index.js` (spawn worker instead of inline execution)
- UNCHANGED: Everything else

**Backward compatibility:** FULL. From Telegram's perspective, behavior is identical. Commands still flow through the same inbox/outbox.

**Testing:** Run existing session-daemon tests. Send command via Telegram, verify response comes back.

**Effort estimate:** 3-5 days development, 1-2 days testing.

---

### Phase 1: Parallel Execution (2-3 weeks)

**Goal:** Multiple workers can run simultaneously.

**Scope:**
- Implement worker semaphore (max 2 concurrent)
- Per-agent inbox directories
- Task Dispatcher with priority ordering
- Worker lifecycle management (spawn, monitor, kill)
- Per-worker health monitoring
- Modified Telegram Bridge to watch multiple outbox directories

**What changes:**
- NEW: `src/task-dispatcher.js`
- NEW: `src/event-bus.js` (basic version)
- MODIFIED: `src/index.js` (becomes Orchestrator)
- MODIFIED: `src/health-monitor.js` (multi-worker aware)
- MODIFIED: `packages/telegram-bridge/src/outbox-watcher.js` (multi-directory)
- MODIFIED: `packages/telegram-bridge/src/bot-manager.js` (new /agents output)

**Backward compatibility:** FULL. Single-command flow still works. Parallelism is additive.

**Testing:**
- Send two commands for different agents simultaneously
- Verify both execute in parallel
- Verify Telegram receives interleaved updates from both agents
- Verify one worker crashing does not affect the other

**Effort estimate:** 7-10 days development, 3-5 days testing.

---

### Phase 2: Governance Engine (2-3 weeks)

**Goal:** Constitution enforcement at process level.

**Scope:**
- Pre-flight authority validation
- Worker profile enforcement (allowed_tools, denied_bash_patterns)
- Runtime Sentinel (stream monitoring)
- Drift detection (basic: file scope + token velocity)
- Kill switch hierarchy
- Audit trail logging
- New Telegram commands: /kill, /halt

**What changes:**
- NEW: `src/governance-engine.js`
- NEW: `src/sentinel.js`
- MODIFIED: `src/worker.js` (denied_bash_patterns intercept)
- MODIFIED: `src/task-dispatcher.js` (pre-flight checks)
- MODIFIED: Telegram Bridge (new commands)
- NEW: `.aios/audit/` directory and rotation

**Backward compatibility:** FULL. Governance adds safety, does not change happy path.

**Testing:**
- Attempt @dev git push -> verify blocked
- Attempt @qa file write -> verify blocked
- Trigger budget exceeded -> verify worker terminated
- Send /kill -> verify all workers stop

**Effort estimate:** 7-10 days development, 3-5 days testing.

---

### Phase 3: Workflow Engine (2-3 weeks)

**Goal:** Automated multi-step workflows (SDC, QA Loop).

**Scope:**
- Workflow state machines (SDC 4 phases, QA Loop)
- Dependency resolution in Task Dispatcher
- Automatic task chaining (@dev done -> @qa starts)
- Workflow status tracking in SQLite
- Telegram: workflow progress reporting

**What changes:**
- NEW: `src/workflow-engine.js`
- NEW: `src/state-store.js` (SQLite)
- MODIFIED: `src/task-dispatcher.js` (dependency resolution)
- MODIFIED: `src/event-bus.js` (workflow events)
- MODIFIED: Telegram Bridge (workflow status commands)

**Backward compatibility:** FULL. Workflows are opt-in. Manual command-by-command operation still works.

**Testing:**
- Run full SDC: @sm draft -> @po validate -> @dev implement -> @qa gate
- Verify automatic transitions
- Verify QA FAIL triggers @dev fix loop
- Verify workflow state survives Orchestrator restart

**Effort estimate:** 10-14 days development, 5-7 days testing.

---

### Phase 4: Overnight Execution (1-2 weeks)

**Goal:** Lucas can schedule work, approve it, and go to sleep.

**Scope:**
- Overnight Scheduler
- /overnight, /approve, /budget Telegram commands
- Overnight report generation
- Escalation policies
- WhatsApp emergency notification via OpenClaw
- Cost tracking with per-task budgets

**What changes:**
- NEW: `src/overnight-scheduler.js`
- NEW: `src/cost-tracker.js`
- MODIFIED: Telegram Bridge (new commands and report formatting)
- MODIFIED: `config/daemon.yaml` (overnight and budget configuration)

**Backward compatibility:** FULL. Overnight is purely additive.

**Testing:**
- Schedule 2-story overnight run
- Verify budget enforcement
- Verify escalation on failure
- Verify morning report in Telegram
- Simulate VPS restart during overnight -> verify recovery

**Effort estimate:** 5-7 days development, 3-5 days testing.

---

### Phase 5: Advanced Features (2-4 weeks)

**Goal:** Polish, optimization, extended governance.

**Scope:**
- Advanced drift detection (semantic analysis of output)
- Goal re-injection system
- Cost optimization (model selection per task type)
- Agent memory sharing protocols
- Performance telemetry dashboard (CLI-based)
- Spec Pipeline and Brownfield Discovery workflow integration
- Worker session resume (avoid cold starts for repeated tasks)

**Effort estimate:** 10-14 days development, 5-7 days testing.

---

### Total Roadmap Summary

| Phase | Duration | Effort (dev days) | Key Deliverable |
|-------|----------|-------------------|-----------------|
| Phase 0 | 1-2 weeks | 5-7 | Worker isolation |
| Phase 1 | 2-3 weeks | 10-15 | Parallel execution |
| Phase 2 | 2-3 weeks | 10-15 | Governance engine |
| Phase 3 | 2-3 weeks | 15-21 | Workflow automation |
| Phase 4 | 1-2 weeks | 8-12 | Overnight execution |
| Phase 5 | 2-4 weeks | 15-21 | Advanced features |
| **TOTAL** | **10-17 weeks** | **63-91 days** | **Full autonomous fleet** |

Each phase is independently deployable and backward compatible.

---

## 13. Decision Log

| # | Decision | Options Considered | Choice | Rationale |
|---|----------|-------------------|--------|-----------|
| D1 | Execution model | (A) Multi-daemon persistent, (B) Process pool, (C) Master-worker on-demand | C | RAM constraint (8GB). On-demand avoids idle cost. Clean context per agent. |
| D2 | Communication | (A) Redis pub/sub, (B) Unix sockets, (C) Filesystem events, (D) gRPC | C | Zero new dependencies. Crash-recoverable (files survive restarts). Existing IPC already uses filesystem. Proven in current architecture. |
| D3 | State persistence | (A) PostgreSQL, (B) SQLite, (C) Pure JSON files | B + C | SQLite for structured queries (task history, budgets). JSON for simple state (health, events). No cloud dependency. |
| D4 | Worker spawn mechanism | (A) child_process.fork(), (B) child_process.exec(), (C) systemd transient units | A | fork() shares V8 heap initially (copy-on-write), fastest spawn. Transient units would provide better resource isolation but add complexity. Phase 5 can migrate to transient units. |
| D5 | Governance enforcement | (A) Prompt-only (advisory), (B) SDK config (structural), (C) Process-level (systemd) | B + C | Prompt-only is bypassable. SDK config (allowed_tools) is structural. systemd ReadWritePaths adds OS-level enforcement. Defense in depth. |
| D6 | Agent-to-agent protocol | (A) Direct socket, (B) Filesystem events, (C) A2A protocol | B | Filesystem is simplest, proven. A2A adds external protocol dependency for internal communication. Direct sockets require connection management. |
| D7 | Overnight autonomy level | (A) Full L4, (B) L3 with escalation, (C) L2 batch | B | Market research shows L4 success rates are 40-60% for >2h tasks. L3 with escalation provides safety while enabling meaningful overnight work. |
| D8 | Model selection per agent | (A) All Opus, (B) All Sonnet, (C) Per-agent profile | C | Architect benefits from Opus reasoning. Dev/QA work well on Sonnet. Saves 40% cost vs all-Opus. |
| D9 | Task priority system | (A) Strict FIFO (current), (B) Priority queue, (C) Priority + dependency graph | C | Dependencies are essential for workflows (dev before qa). Priority prevents starvation and enables critical-path optimization. |
| D10 | Telegram Bridge changes | (A) Full rewrite for multi-worker, (B) Minimal changes + multi-outbox, (C) New bridge | B | Current bridge architecture is sound. Only needs to watch additional directories and handle new commands. |
| D11 | Per-agent inbox vs shared queue | (A) Shared queue with dispatcher, (B) Per-agent inboxes | B | Per-agent inboxes naturally partition by authority. Shared queue requires peeking, which adds complexity. |
| D12 | Recovery strategy | (A) Restart from scratch, (B) Resume from checkpoint, (C) Re-dispatch interrupted tasks | C | Re-dispatching is simplest. Worker state.json tracks progress. Task retry logic already exists. Resuming SDK sessions is fragile. |

---

## 14. Risks and Mitigations

### 14.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Claude SDK V2 instability** | MEDIUM | HIGH | V1 fallback already implemented in SessionAdapter. Workers can use either version. |
| **VPS RAM exhaustion** | MEDIUM | HIGH | Worker semaphore limits concurrency. Per-worker MemoryMax cgroup. OOM killer will take worker, not orchestrator (Orchestrator has lower OOM score). |
| **Filesystem event bus latency** | LOW | MEDIUM | chokidar + polling fallback. Same approach that works in current InboxWatcher. Polling interval configurable. |
| **SQLite corruption** | LOW | HIGH | WAL mode with checkpointing. Periodic backup to .aios/backups/. State can be rebuilt from filesystem artifacts if needed. |
| **Worker process leak** | MEDIUM | MEDIUM | Heartbeat monitoring (5 min timeout). Orchestrator tracks all child PIDs. Cleanup on startup scans for orphaned workers. |
| **Context window exhaustion** | MEDIUM | MEDIUM | Each worker has isolated 200K context. Long tasks get goal re-injection. Token tracking kills workers before exhaustion. |
| **Race conditions in filesystem IPC** | LOW | LOW | Atomic rename for state transitions (current design). chokidar awaitWriteFinish for new file detection. |

### 14.2 Cost Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Runaway token spend** | MEDIUM | HIGH | Per-task budget limits. Per-overnight budget cap. Real-time tracking in CostTracker. Automatic worker termination on budget exceeded. |
| **Model cost spike** | LOW | MEDIUM | Worker profiles specify model. Sonnet for most tasks, Opus only for architect. Estimated cost per task type documented. |
| **Multiple workers multiplying cost** | HIGH | MEDIUM | Max 2 concurrent workers. Budget is aggregate, not per-worker. Overnight budget cap is the hard limit. |

**Cost Estimates (current prices, Sonnet 4.5):**

| Scenario | Tokens (est.) | Cost (est.) |
|----------|---------------|-------------|
| Single story implementation | ~200K input + 100K output | $2.10 |
| QA gate | ~100K input + 30K output | $0.75 |
| Full SDC (4 phases) | ~500K input + 200K output | $4.50 |
| Overnight (2 stories) | ~1M input + 400K output | $9.00 |
| Overnight (5 stories, aggressive) | ~2.5M input + 1M output | $22.50 |

### 14.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Cascading agent failures** | LOW | HIGH | Workers are process-isolated. One crash cannot affect another. Orchestrator monitors independently. |
| **Governance bypass** | LOW | CRITICAL | Three-layer defense (SDK config + bash pattern + systemd). Would require simultaneous bypass of all three. Audit trail catches post-hoc. |
| **VPS restart during overnight** | LOW | MEDIUM | State persists in SQLite + filesystem. Recovery sequence re-dispatches interrupted tasks. Telegram notification on recovery. |
| **Telegram Bridge disconnect** | MEDIUM | LOW | Bridge is observability only. Agents continue working without it. Reconnect logic already exists. Missed messages caught on reconnect. |

---

## 15. Appendices

### Appendix A: Full Directory Structure (Target State)

```
.aios/
  inbox/
    pending/           # External commands (unchanged)
    in_progress/
    processed/
    failed/
  outbox/
    pending/           # External responses (unchanged)
    sent/
    failed/
  events/
    pending/           # Inter-agent events (NEW)
    processing/
    completed/
    failed/
  workers/
    dev/
      inbox/           # Tasks for @dev
      outbox/          # Results from @dev
      state.json       # Current worker state
      health.json      # Worker health
    qa/
      inbox/
      outbox/
      state.json
      health.json
    architect/
      inbox/
      outbox/
      state.json
      health.json
    devops/
      inbox/
      outbox/
      state.json
      health.json
    # ... (other agents on demand)
  orchestrator/
    state.db           # SQLite database
    state.db-wal       # WAL file
    state.json         # Quick-read state summary
    schedule.json      # Current overnight schedule
    budget.json        # Real-time budget snapshot
  daemon/
    health.json        # Orchestrator health (replaces current)
    session.json       # DEPRECATED (workers manage their own)
  audit/
    audit-2026-03-01.jsonl
    audit-2026-03-02.jsonl
  reports/
    overnight-2026-03-01.md
  decisions/
    ADR-001.json
  logs/
    daemon.log         # Orchestrator log
    worker-dev-{epoch}.log
    worker-qa-{epoch}.log
```

### Appendix B: New Telegram Commands

| Command | Description | Phase |
|---------|-------------|-------|
| `/workers` | Show active workers, their status, current task | Phase 1 |
| `/kill` | Kill all workers immediately | Phase 2 |
| `/halt` | Kill all + stop Orchestrator | Phase 2 |
| `/budget` | Show cost tracking (per-agent, per-task, total) | Phase 4 |
| `/overnight <stories>` | Schedule overnight work | Phase 4 |
| `/approve` | Approve pending overnight schedule | Phase 4 |
| `/push <story>` | Trigger @devops push for a completed story | Phase 4 |
| `/workflow <id>` | Show workflow status | Phase 3 |

### Appendix C: Configuration Example (Target daemon.yaml)

```yaml
version: "2.0"

orchestrator:
  max_concurrent_workers: 2
  worker_spawn_timeout_ms: 30000
  worker_heartbeat_interval_ms: 60000
  worker_heartbeat_timeout_ms: 300000
  event_poll_interval_ms: 2000

session:
  default_model: "claude-sonnet-4-5-20250929"
  cwd: "/home/ubuntu/aios-core"
  permission_mode: "bypassPermissions"
  setting_sources: ["user", "project", "local"]
  system_prompt:
    type: "preset"
    preset: "claude_code"

worker_profiles:
  dev:
    model: "claude-sonnet-4-5-20250929"
    max_tokens_per_task: 500000
    max_wall_time_ms: 3600000
    denied_bash_patterns: ["git push", "gh pr create", "gh pr merge"]
  qa:
    model: "claude-sonnet-4-5-20250929"
    max_tokens_per_task: 300000
    max_wall_time_ms: 1800000
    denied_tools: ["Write", "Edit"]
    denied_bash_patterns: ["git push", "rm -rf"]
  architect:
    model: "claude-opus-4-6"
    max_tokens_per_task: 800000
    max_wall_time_ms: 7200000
    denied_bash_patterns: ["git push", "gh pr", "npm publish"]
  devops:
    model: "claude-sonnet-4-5-20250929"
    max_tokens_per_task: 200000
    max_wall_time_ms: 900000
    allowed_bash_patterns: ["git push", "gh pr"]

governance:
  constitution_enforcement: true
  drift_detection:
    file_scope_warning: 5
    file_scope_escalation: 10
    token_velocity_multiplier: 2.0
    checkpoint_interval_ms: 900000
  goal_reinjection_interval: 20  # every N tool calls
  kill_switch:
    memory_threshold_percent: 90
    budget_exceeded_action: "terminate"
    governance_violation_action: "terminate"

overnight:
  default_budget_usd: 25.00
  max_budget_usd: 100.00
  escalation:
    on_failure: "skip_and_continue"
    on_budget_exceeded: "stop_all"
    on_governance_violation: "stop_all_and_notify"
  emergency_notification:
    telegram: true
    whatsapp: true
    whatsapp_target: "+5528999301848"

cost:
  tracking_enabled: true
  model_costs:
    "claude-opus-4-6":
      input_per_mtok: 5.00
      output_per_mtok: 25.00
    "claude-sonnet-4-5-20250929":
      input_per_mtok: 3.00
      output_per_mtok: 15.00

queue:
  max_size: 100
  overflow_behavior: "reject"

inbox:
  watch_directory: ".aios/inbox/pending"
  poll_interval_ms: 3000

health:
  write_interval_ms: 10000
  state_directory: ".aios/daemon"

recovery:
  max_orchestrator_retries: 5
  max_worker_retries: 2
  worker_retry_backoff_ms: [10000, 30000]

authorization:
  allowed_senders:
    - channel: telegram
      sender_id: "6854910830"
    - channel: whatsapp
      sender_id: "+5528999301848"
    - channel: cli
      sender_id: "system"
    - channel: systemd_timer
      sender_id: "system"
  reject_unknown: true
```

### Appendix D: API Cost Comparison (Current vs Target)

| Scenario | Current (single daemon) | Target (autonomous fleet) | Multiplier |
|----------|------------------------|--------------------------|-----------|
| Single command | 1 session | 1 worker session | 1x |
| Sequential story cycle | 1 session, 4 agent switches (~16K tokens overhead) | 4 worker sessions, 0 switch overhead | ~0.92x (saves switch tokens) |
| 2 stories parallel | Impossible (sequential only) | 2 concurrent workers | 1x (same total, faster) |
| Overnight 3 stories | 3 sequential sessions (~48K switch overhead) | 3-6 worker sessions, parallelized | ~0.9x tokens, 50% faster |

The autonomous fleet does NOT multiply API costs because:
1. Worker sessions are fresh (no accumulated context from other agents)
2. No agent switching overhead (~4-5K tokens per switch in current model)
3. Parallelism reduces wall-clock time but not total tokens
4. Per-agent model selection (Sonnet for dev/qa vs Opus for architect) saves cost

---

## Summary

This architecture transforms the AIOS from a serial command executor to a governed autonomous agent fleet, while preserving every existing component's interface. The key innovation is not parallelism itself -- it is **parallelism with structural governance**. The Constitution, authority matrix, and story-driven constraints are enforced at the process level, making it physically impossible for agents to violate boundaries even when working unsupervised at 3 AM.

The implementation is incremental across 5 phases, each independently deployable. Phase 0 (worker isolation) can ship in 1-2 weeks and immediately provides the foundation for everything that follows.

**The system Lucas wakes up to:**
- Telegram shows overnight report: stories completed, costs incurred, branches ready for push
- Zero governance violations
- All work traceable through audit trail
- One command (/push) to merge the night's work

---

*Document generated by Aria (Architect Agent) on 2026-03-01.*
*Constitution compliance: Art. I (CLI First), Art. II (Agent Authority -- structural enforcement), Art. III (Story-Driven), Art. IV (No Invention -- all decisions traced to requirements), Art. V (Quality First).*
