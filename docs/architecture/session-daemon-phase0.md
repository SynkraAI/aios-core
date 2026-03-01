# Architecture: Session Daemon -- Phase 0 Foundation

**Author:** Aria (Architect Agent)
**Date:** 2026-03-01
**Status:** DRAFT -- Pending Review
**Relates To:** telegram-observability-bridge.md, telegram-observability-validation.md, gateway-agent-architecture.md
**Supersedes:** Section 4 "Session Architecture" of telegram-observability-bridge.md (which left the statefulness problem unresolved)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Architecture Decision: Approach Selection](#3-architecture-decision-approach-selection)
4. [Selected Architecture: Claude Agent SDK with Session Persistence](#4-selected-architecture-claude-agent-sdk-with-session-persistence)
5. [Component Diagram](#5-component-diagram)
6. [Message Flow](#6-message-flow)
7. [Inbox / Outbox JSON Schema](#7-inbox--outbox-json-schema)
8. [Session Lifecycle](#8-session-lifecycle)
9. [Health Check Design](#9-health-check-design)
10. [Crash Recovery Strategy](#10-crash-recovery-strategy)
11. [Coexistence with Interactive Session](#11-coexistence-with-interactive-session)
12. [Security Considerations](#12-security-considerations)
13. [Resource Constraints](#13-resource-constraints)
14. [Implementation Plan](#14-implementation-plan)
15. [Open Questions](#15-open-questions)

---

## 1. Executive Summary

This document specifies the **Session Daemon** -- the foundational component that solves the statefulness problem identified in Pedro Valerio's validation report (telegram-observability-validation.md, Verdict: FAIL, showstopper). The Session Daemon maintains a persistent Claude Code session and accepts external commands from any channel (Telegram, WhatsApp, CLI scripts). It is the prerequisite for the Telegram Observability Bridge, the WhatsApp Gateway, and any future external integration.

### What This Solves

The core showstopper: `claude --print` is stateless. Each invocation starts fresh. Multi-step, stateful agent interactions (AIOS Master delegates to @dev, @dev hands off to @qa, etc.) triggered from external sources are impossible without session persistence.

### Architecture Decision

**Selected: Approach A -- Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) with the V2 session interface.**

The Claude Agent SDK (formerly Claude Code SDK) provides programmatic persistent sessions via `unstable_v2_createSession()` / `unstable_v2_resumeSession()` with `send()` / `stream()` patterns. This eliminates the need for tmux/screen wrappers, stdin/stdout pipe hacking, or raw API reimplementation.

### What This Is

- A **Node.js systemd service** that maintains a persistent Claude Code session
- A **FIFO message queue** backed by filesystem (inbox/outbox pattern)
- A **sequential command processor** that feeds external commands into the persistent session
- A **health check and crash recovery** layer
- The **single entry point** for all external-to-AIOS communication

### What This Is NOT

- NOT a Telegram bridge (that builds ON TOP of this in Phase 1+)
- NOT a replacement for interactive Claude Code usage (coexists)
- NOT a multi-session orchestrator (one session at a time, sequential processing)
- NOT an agent itself (it is infrastructure that agents run inside)

---

## 2. Problem Statement

### 2.1. The Statefulness Gap

```
CURRENT STATE:
  External message -> claude --print "do something" -> stateless, context dies -> response

REQUIRED STATE:
  External message -> persistent session -> @aios-master delegates to @dev ->
    @dev investigates, fixes -> hands off to @qa -> @qa reviews ->
    @aios-master reports completion -> response
```

The entire delegation chain (steps 2-5) requires a **living session** with accumulated context: files read, decisions made, code modified, agent handoff artifacts. With `claude --print`, each step would lose all previous context.

### 2.2. Validation Report Reference

Pedro Valerio's validation (telegram-observability-validation.md) identified this as:

> "The architecture has a **fatal structural flaw**: `claude --print` is stateless, and the proposed architecture requires stateful multi-agent sessions with delegation chains, progress reporting, and inter-agent handoffs. No mechanism is specified to bridge this gap. Without solving this, nothing else in the architecture can function as described."

This document IS that mechanism.

### 2.3. Requirements (from spawn prompt)

| # | Requirement | Section |
|---|------------|---------|
| R1 | Persistent Claude Code session | Section 4, 8 |
| R2 | Message queue interface | Section 6, 7 |
| R3 | Output capture and channel routing | Section 6 |
| R4 | Health check | Section 9 |
| R5 | Crash recovery | Section 10 |
| R6 | Sequential processing | Section 4 |
| R7 | Session lifecycle (start/pause/resume/restart/kill) | Section 8 |

---

## 3. Architecture Decision: Approach Selection

### 3.1. Approaches Evaluated

| Approach | Description | Preserves AIOS? | Session Persistence | Complexity | Verdict |
|----------|-------------|-----------------|---------------------|------------|---------|
| **A: Claude Agent SDK** | Use `@anthropic-ai/claude-agent-sdk` V2 with `createSession()` / `resumeSession()` and `send()` / `stream()` | YES (full tools, CLAUDE.md, MCP, hooks, settings) | YES (native SDK feature) | MEDIUM | **SELECTED** |
| **B: tmux/screen wrapper** | Spawn `claude` interactive in tmux, pipe stdin from queue, capture stdout | YES | PARTIAL (tmux session, but fragile) | HIGH (stdout parsing, process management, no structured output) | Rejected |
| **C: Hybrid SDK + CLI** | SDK for session, CLI subprocess for execution | UNCLEAR | PARTIAL | VERY HIGH | Rejected |
| **D: Custom Anthropic API + tools** | Raw Messages API with custom tool implementations | NO (loses all AIOS infra) | YES (API-level) | ENORMOUS | Rejected |

### 3.2. Why Approach A (Claude Agent SDK)

The Claude Agent SDK (`@anthropic-ai/claude-agent-sdk` v0.2.63, npm) provides exactly what we need:

**V2 Session Interface (preview, `unstable_v2_*`):**

```typescript
// Create a persistent session
const session = unstable_v2_createSession({
  model: "claude-opus-4-6",
  cwd: "/home/ubuntu/aios-core",
  settingSources: ["user", "project", "local"], // Loads CLAUDE.md, settings, rules
  systemPrompt: { type: "preset", preset: "claude_code" }, // Full Claude Code system prompt
  permissionMode: "bypassPermissions",
  allowedTools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob", "WebSearch", "WebFetch", "Task"],
  includePartialMessages: true,
});

// Send a command (multi-turn: context accumulates)
await session.send("@aios-master Fix the auth bug");
for await (const msg of session.stream()) {
  // Real-time streaming of ALL agent output
  // msg.type: "assistant" | "user" | "result" | "system" | ...
}

// Later, send follow-up (same session, full context retained)
await session.send("@qa Review the fix that @dev just made");
for await (const msg of session.stream()) { /* ... */ }
```

**Resume after restart:**

```typescript
// On crash recovery, resume the exact session
const session = unstable_v2_resumeSession(savedSessionId, {
  model: "claude-opus-4-6",
  cwd: "/home/ubuntu/aios-core",
  settingSources: ["user", "project", "local"],
  systemPrompt: { type: "preset", preset: "claude_code" },
  permissionMode: "bypassPermissions",
});
```

**Key advantages over alternatives:**

1. **Full AIOS capability preservation.** With `settingSources: ["user", "project", "local"]` and `systemPrompt: { type: "preset", preset: "claude_code" }`, the SDK session loads the exact same CLAUDE.md, rules, deny rules, agent definitions, and MCP servers as an interactive Claude Code session.

2. **Native session persistence.** Sessions are persisted to `~/.claude/projects/` by default. The `persistSession: true` option (default) means sessions survive process restarts. `unstable_v2_resumeSession()` reloads the full conversation history.

3. **Structured streaming.** The SDK emits typed `SDKMessage` objects (not raw stdout text). No parsing heuristics needed. Agent switches, tool uses, results, errors -- all are structured events.

4. **AbortController support.** `options.abortController` allows clean cancellation of running operations.

5. **Hooks support.** `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd` hooks can intercept agent behavior for observability forwarding.

6. **Subagents support.** The SDK's `agents` option allows defining custom subagents programmatically, though we will primarily use AIOS's file-based agent definitions via `settingSources`.

### 3.3. Why NOT Approach B (tmux/screen wrapper)

The tmux approach was recommended in the validation report (Section 9, R1), but the Agent SDK makes it obsolete:

| Concern | tmux wrapper | Agent SDK |
|---------|-------------|-----------|
| Stdin injection | Must parse terminal escape sequences, handle prompts, detect ready state | `session.send(message)` -- one function call |
| Output capture | Raw stdout parsing, regex-based agent detection, unstructured | Typed `SDKMessage` objects with `msg.type`, `msg.session_id`, tool data |
| Session resume | tmux session survives, but Claude Code context may not | `resumeSession(id)` reloads full conversation from disk |
| Process lifecycle | Must manage tmux session creation, reattach, kill, zombie cleanup | `session.close()` + AbortController |
| Crash detection | Must poll tmux process, check if Claude Code is still responsive | SDK process exits with error; health check detects absence |
| Permissions | Must handle interactive permission prompts or use `--dangerously-skip-permissions` | `permissionMode: "bypassPermissions"` or custom `canUseTool` callback |
| Agent detection | Regex on stdout: look for persona names, greeting patterns | `msg.type === "assistant"` with structured content blocks |

The SDK eliminates every fragility of the tmux approach.

### 3.4. Why NOT Approach C (Hybrid)

The hybrid approach would use the SDK for session management but delegate tool execution to a CLI subprocess. This creates an impedance mismatch: the SDK already handles tool execution internally. Splitting responsibility between SDK session state and CLI tool state would create synchronization bugs.

### 3.5. Why NOT Approach D (Raw API)

Building a custom agent with the Anthropic Messages API would require reimplementing:
- File read/write/edit tools (Claude Code's core tools)
- Bash execution with sandboxing
- Grep/Glob search
- MCP server management
- CLAUDE.md and rules loading
- Agent handoff protocol
- The entire AIOS framework

This is months of work to replicate what the SDK provides out of the box.

### 3.6. V2 Interface Risk Assessment

The V2 interface functions are prefixed `unstable_v2_*`, indicating they may change before stabilization. Risk assessment:

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| V2 API changes breaking interface | MEDIUM | The V1 `query()` with `resume` option provides the same functionality with a different API shape. If V2 changes, we can fall back to V1 `query()` with minimal refactoring. |
| V2 removed entirely | LOW | The underlying `query()` function supports `resume: sessionId` -- the session persistence mechanism is stable, only the convenience wrapper is unstable. |
| Bugs in V2 preview | MEDIUM | Pin to specific SDK version. The V1 `query()` fallback works identically for our use case. |

**Mitigation: Thin adapter pattern.** The Session Daemon wraps SDK calls in an adapter layer. If the V2 API changes, only the adapter changes, not the daemon logic.

```typescript
// session-adapter.ts -- thin wrapper over SDK, isolates V2 instability
interface SessionAdapter {
  createSession(opts: SessionConfig): Promise<ManagedSession>;
  resumeSession(id: string, opts: SessionConfig): Promise<ManagedSession>;
}

interface ManagedSession {
  readonly sessionId: string;
  send(message: string): Promise<void>;
  stream(): AsyncGenerator<SDKMessage, void>;
  close(): void;
}
```

---

## 4. Selected Architecture: Claude Agent SDK with Session Persistence

### 4.1. High-Level Architecture

```
+=====================================================================+
|                     SESSION DAEMON (Node.js)                         |
|                     systemd: aios-session-daemon.service              |
|                     /home/ubuntu/aios-core/packages/session-daemon/   |
|                                                                       |
|  +------------------+    +-------------------+    +-----------------+ |
|  | InboxWatcher     |    | CommandQueue      |    | SessionAdapter  | |
|  | (fs.watch on     |--->| (FIFO, sequential |---->| (V2 SDK        | |
|  |  .aios/inbox/    |    |  processing)      |    |  createSession/ | |
|  |  pending/)       |    +-------------------+    |  resumeSession) | |
|  +------------------+           |                 +---------+-------+ |
|                                 |                           |         |
|  +------------------+           |                           |         |
|  | OutboxWriter     |<----------+                           |         |
|  | (writes to       |    +-------------------+              |         |
|  |  .aios/outbox/   |    | StreamProcessor   |<-------------+        |
|  |  pending/)       |    | (parses SDKMessage |                       |
|  +--------+---------+    |  stream, detects   |                       |
|           |              |  agent switches,   |                       |
|  +--------+---------+    |  tool use, errors) |                       |
|  | HealthMonitor    |    +-------------------+                        |
|  | (session alive?, |                                                 |
|  |  last activity,  |                                                 |
|  |  current agent)  |                                                 |
|  +------------------+                                                 |
+=====================================================================+
         |                            |
         v                            v
+------------------+     +---------------------------+
| .aios/inbox/     |     | Claude Agent SDK          |
| .aios/outbox/    |     | (@anthropic-ai/           |
| .aios/daemon/    |     |  claude-agent-sdk)         |
| (filesystem IPC) |     | - Full AIOS tools         |
+------------------+     | - CLAUDE.md loaded        |
                          | - Agent definitions       |
                          | - MCP servers             |
                          | - Session persistence     |
                          +---------------------------+
```

### 4.2. Component Responsibilities

| Component | Responsibility | Does NOT |
|-----------|---------------|----------|
| **InboxWatcher** | Watches `.aios/inbox/pending/` for new JSON files using `fs.watch()` + polling fallback. Reads, validates, enqueues. | Classify messages (that is the sender's job, or the agent's) |
| **CommandQueue** | FIFO queue of commands. Ensures sequential processing. Tracks current command state. | Execute commands directly |
| **SessionAdapter** | Wraps Claude Agent SDK V2. Creates/resumes sessions. Sends commands. Streams responses. Handles V2 API instability. | Route output to channels |
| **StreamProcessor** | Processes `SDKMessage` stream from the active session. Detects agent switches, tool invocations, errors, completions. Emits structured events. | Send messages to Telegram/WhatsApp (that is the bridge's job) |
| **OutboxWriter** | Writes response messages to `.aios/outbox/pending/` in the standard schema. The appropriate channel bridge reads and delivers. | Deliver messages (bridges do that) |
| **HealthMonitor** | Tracks session state: alive/dead, last activity timestamp, current agent, current command, queue depth. Writes health file. Restarts on crash. | Make decisions about what to do on crash (follows policy) |

### 4.3. Process Model

The Session Daemon runs as a **single Node.js process** managed by systemd:

```
systemd -> node packages/session-daemon/src/index.js
                 |
                 +-> InboxWatcher (fs.watch + 5s poll)
                 +-> CommandQueue (in-memory FIFO)
                 +-> SessionAdapter (spawns Claude Agent SDK subprocess)
                 +-> StreamProcessor (consumes SDK message stream)
                 +-> OutboxWriter (writes JSON files)
                 +-> HealthMonitor (writes health file every 10s)
```

The Claude Agent SDK itself spawns a Claude Code subprocess internally. The Daemon does NOT manage this subprocess directly -- the SDK handles it.

### 4.4. Sequential Processing Guarantee

```
TIME ->

InboxWatcher:  [msg1] ------[msg2]----------[msg3]----
                  |            |                |
CommandQueue:  [msg1]        [msg2, queued]   [msg3, queued]
                  |            |                |
SessionAdapter: send(msg1) -> stream(msg1)   send(msg2) -> stream(msg2)   send(msg3)
                  |            |                |
                (BUSY)     (BUSY, msg2 waits) (BUSY)

GUARANTEE: msg2 NEVER starts until msg1 stream completes.
           msg3 NEVER starts until msg2 stream completes.
```

This prevents:
- Git state conflicts (two commands trying to commit simultaneously)
- File edit conflicts (two commands modifying the same file)
- Agent state confusion (two agent switches in parallel)
- `.aios/` runtime file corruption

---

## 5. Component Diagram

```
+================================================================+
|                         EXTERNAL PRODUCERS                      |
|                                                                  |
|  +------------------+  +------------------+  +----------------+ |
|  | Telegram Bridge  |  | WhatsApp/OpenClaw|  | CLI Scripts    | |
|  | (future Phase 1) |  | (existing)       |  | (manual test)  | |
|  +--------+---------+  +--------+---------+  +-------+--------+ |
|           |                      |                    |          |
+===========|======================|====================|==========+
            |                      |                    |
            v                      v                    v
     +------+------+--------+------+------+
     |      .aios/inbox/pending/          |  <-- All producers write here
     |      {timestamp}-{source}-{id}.json|
     +------+-----------------------------+
            |
            | fs.watch() + 5s poll
            v
+================================================================+
|                     SESSION DAEMON                               |
|                                                                  |
|  +------------------+                                            |
|  | InboxWatcher     | validates JSON, enqueues                   |
|  +--------+---------+                                            |
|           |                                                      |
|           v                                                      |
|  +------------------+                                            |
|  | CommandQueue     | FIFO, sequential, one-at-a-time            |
|  +--------+---------+                                            |
|           |                                                      |
|           v                                                      |
|  +------------------+     +---------------------------+          |
|  | SessionAdapter   |---->| Claude Agent SDK (V2)     |          |
|  | send() + stream()|     | unstable_v2_createSession |          |
|  +--------+---------+     | unstable_v2_resumeSession |          |
|           |               | session.send()            |          |
|           |               | session.stream()          |          |
|           v               | session.close()           |          |
|  +------------------+     +---------------------------+          |
|  | StreamProcessor   |                                           |
|  | - agent detection |                                           |
|  | - tool use events |                                           |
|  | - error detection |                                           |
|  | - completion      |                                           |
|  +--------+---------+                                            |
|           |                                                      |
|           v                                                      |
|  +------------------+     +--------------------------+           |
|  | OutboxWriter     |---->| .aios/outbox/pending/    |           |
|  +------------------+     | {reply}-{channel}-{id}   |           |
|                           +-----------+--------------+           |
|  +------------------+                 |                          |
|  | HealthMonitor    |                 |                          |
|  | -> .aios/daemon/ |                 |                          |
|  |    health.json   |                 |                          |
|  +------------------+                 |                          |
+================================================================+
                                        |
            +---------------------------+
            |
            v
+================================================================+
|                       EXTERNAL CONSUMERS                        |
|                                                                  |
|  +------------------+  +------------------+  +----------------+ |
|  | Telegram Bridge  |  | WhatsApp/OpenClaw|  | CLI Reporter   | |
|  | (reads outbox    |  | (reads outbox    |  | (reads outbox  | |
|  |  channel=telegram)|  |  channel=whatsapp)|  |  channel=cli)  | |
|  +------------------+  +------------------+  +----------------+ |
+================================================================+
```

---

## 6. Message Flow

### 6.1. Flow A: Simple Command (single-step)

```
1. Telegram Bridge writes inbox file:
   .aios/inbox/pending/1709290800-telegram-a3f2.json
   {
     "source": { "channel": "telegram", "sender_id": "123456", "sender_name": "Lucas" },
     "command": "@aios-master What is the project status?",
     "priority": "normal"
   }

2. InboxWatcher detects file via fs.watch()
3. InboxWatcher validates JSON against schema
4. InboxWatcher enqueues to CommandQueue
5. InboxWatcher moves file to .aios/inbox/in_progress/

6. CommandQueue dequeues (queue was empty, starts immediately)
7. SessionAdapter calls: session.send("@aios-master What is the project status?")

8. StreamProcessor consumes SDK messages:
   { type: "system", subtype: "init", session_id: "abc-123" }           -> HealthMonitor: session alive
   { type: "assistant", message: { content: [{type: "text", text: "..."}] } }  -> OutboxWriter: progress
   { type: "result", subtype: "success", result: "Project status: ..." }        -> OutboxWriter: final response

9. OutboxWriter writes:
   .aios/outbox/pending/reply-1709290805-telegram-a3f2.json
   {
     "in_reply_to": "1709290800-telegram-a3f2",
     "channel": "telegram",
     "target": { "sender_id": "123456" },
     "content": { "message": "Project status: ...", "type": "final" }
   }

10. Telegram Bridge reads outbox file, sends to Telegram, moves to .aios/outbox/sent/
11. InboxWatcher moves inbox file to .aios/inbox/processed/
```

**Latency:** First partial response ~2-5s. Final response depends on task complexity.

### 6.2. Flow B: Multi-Agent Delegation (the showstopper scenario, now solved)

```
1. Telegram Bridge writes inbox file:
   command: "@aios-master Fix the auth bug in auth-service.ts"

2. InboxWatcher -> CommandQueue -> SessionAdapter:
   session.send("@aios-master Fix the auth bug in auth-service.ts")

3. StreamProcessor receives SDK messages (single continuous stream):

   MSG 1: { type: "assistant", content: "I'll delegate this to @dev..." }
     -> OutboxWriter: { type: "progress", agent: "aios-master",
                        message: "Delegating to @dev for investigation and fix." }

   MSG 2: { type: "assistant", content: "@dev activated... investigating..." }
     -> StreamProcessor detects agent switch: current_agent = "dev"
     -> OutboxWriter: { type: "agent_switch", from: "aios-master", to: "dev" }

   MSG 3: { type: "assistant", tool_use: { tool: "Grep", input: {pattern: "token.*expire"} } }
     -> OutboxWriter: { type: "tool_use", agent: "dev", tool: "Grep", summary: "Searching for token expiration" }

   MSG 4: { type: "assistant", tool_use: { tool: "Edit", input: {file: "auth-service.ts"} } }
     -> OutboxWriter: { type: "tool_use", agent: "dev", tool: "Edit", summary: "Editing auth-service.ts" }

   MSG 5: { type: "assistant", content: "Fix applied. Running tests..." }
     -> OutboxWriter: { type: "progress", agent: "dev", message: "Fix applied. Running tests." }

   MSG 6: { type: "assistant", tool_use: { tool: "Bash", input: "npm test" } }
     -> OutboxWriter: { type: "tool_use", agent: "dev", tool: "Bash", summary: "Running npm test" }

   MSG 7: { type: "assistant", content: "Tests pass. Handing off to @qa." }
     -> StreamProcessor detects agent switch: current_agent = "qa"
     -> OutboxWriter: { type: "agent_switch", from: "dev", to: "qa" }

   MSG 8: { type: "assistant", content: "QA gate: reviewing..." }
     -> OutboxWriter: { type: "progress", agent: "qa", message: "Running QA gate." }

   MSG 9: { type: "result", subtype: "success", result: "Auth bug fixed and reviewed." }
     -> OutboxWriter: { type: "final", agent: "aios-master",
                        message: "Auth bug fixed and reviewed. QA PASS." }

4. CommandQueue marks command as completed
5. CommandQueue dequeues next command (if any)
```

**Critical observation:** ALL messages (MSG 1-9) flow from a SINGLE `session.stream()` call. The agent switches, delegation chain, tool uses, and final result are all part of one continuous SDK session stream. This is possible because the session persists context across the entire interaction. No cross-session serialization is needed.

### 6.3. Flow C: Follow-up Command (multi-turn context)

```
1. After Flow B completes, Lucas sends:
   command: "Show me the diff of what @dev changed"

2. SessionAdapter calls session.send("Show me the diff of what @dev changed")
   The session REMEMBERS the auth fix from Flow B because the session persists.

3. Agent responds with the diff (it has the context of files modified in Flow B)

4. Response written to outbox
```

### 6.4. Flow D: WhatsApp Message (channel coexistence)

```
1. OpenClaw Gateway writes inbox file:
   .aios/inbox/pending/1709290900-whatsapp-b7c1.json
   {
     "source": { "channel": "whatsapp", "sender_id": "+5528999301848" },
     "command": "Quero uma feature de exportar PDF",
     "priority": "normal"
   }

2. Same InboxWatcher -> CommandQueue -> SessionAdapter pipeline
3. Response goes to outbox with channel: "whatsapp"
4. OpenClaw's outbox consumer reads and delivers via WhatsApp
```

**Both channels share the SAME session.** This means context from Telegram commands and WhatsApp commands accumulates in the same session, providing cross-channel continuity.

---

## 7. Inbox / Outbox JSON Schema

### 7.1. Inbox Message Schema

This extends the schema from `gateway-agent-architecture.md` (Section 9.1) to be channel-agnostic.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AIOS Inbox Message",
  "type": "object",
  "required": ["schema_version", "id", "timestamp", "source", "command", "priority", "status"],
  "properties": {
    "schema_version": {
      "type": "string",
      "const": "2.0"
    },
    "id": {
      "type": "string",
      "pattern": "^msg-[0-9]+-[a-f0-9]{4}$",
      "description": "Unique message identifier: msg-{epoch_seconds}-{random_4hex}"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "source": {
      "type": "object",
      "required": ["channel", "sender_id"],
      "properties": {
        "channel": {
          "type": "string",
          "enum": ["telegram", "whatsapp", "cli", "systemd_timer"]
        },
        "sender_id": {
          "type": "string",
          "description": "Telegram user ID, WhatsApp phone number, or 'system'"
        },
        "sender_name": {
          "type": "string"
        },
        "message_id": {
          "type": "string",
          "description": "Original message ID from the source channel (for deduplication)"
        }
      }
    },
    "command": {
      "type": "string",
      "description": "The raw command text to send to the Claude Code session"
    },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "normal", "low"],
      "default": "normal"
    },
    "classification": {
      "type": "object",
      "description": "Optional pre-classification from the channel bridge",
      "properties": {
        "intent": {
          "type": "string",
          "enum": ["command", "feature_request", "bug_report", "status_query", "casual", "followup", "unknown"]
        },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "thread": {
      "type": "object",
      "properties": {
        "thread_id": { "type": "string" },
        "is_followup": { "type": "boolean", "default": false },
        "parent_id": { "type": ["string", "null"] }
      }
    },
    "reply_to": {
      "type": "object",
      "required": ["channel"],
      "properties": {
        "channel": { "type": "string" },
        "target": { "type": "string" }
      }
    },
    "status": {
      "type": "string",
      "enum": ["pending", "in_progress", "processed", "failed"],
      "default": "pending"
    },
    "metadata": {
      "type": "object",
      "description": "Channel-specific metadata (Telegram update_id, WhatsApp session_id, etc.)"
    }
  }
}
```

**Example inbox file:**

```json
{
  "schema_version": "2.0",
  "id": "msg-1709290800-a3f2",
  "timestamp": "2026-03-01T12:00:00Z",
  "source": {
    "channel": "telegram",
    "sender_id": "123456789",
    "sender_name": "Lucas",
    "message_id": "tg-update-98765"
  },
  "command": "@aios-master Fix the auth bug in auth-service.ts",
  "priority": "normal",
  "classification": {
    "intent": "command",
    "confidence": 0.95
  },
  "thread": {
    "thread_id": "msg-1709290800-a3f2",
    "is_followup": false,
    "parent_id": null
  },
  "reply_to": {
    "channel": "telegram",
    "target": "123456789"
  },
  "status": "pending",
  "metadata": {
    "telegram_update_id": 98765,
    "telegram_chat_id": 123456789
  }
}
```

### 7.2. Outbox Message Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AIOS Outbox Message",
  "type": "object",
  "required": ["schema_version", "id", "in_reply_to", "timestamp", "channel", "content", "status"],
  "properties": {
    "schema_version": {
      "type": "string",
      "const": "2.0"
    },
    "id": {
      "type": "string",
      "pattern": "^reply-[0-9]+-[a-f0-9]{4}$"
    },
    "in_reply_to": {
      "type": "string",
      "description": "The inbox message ID this replies to"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "channel": {
      "type": "string",
      "enum": ["telegram", "whatsapp", "cli"],
      "description": "Which channel should deliver this response"
    },
    "target": {
      "type": "object",
      "properties": {
        "sender_id": { "type": "string" },
        "chat_id": { "type": "string" }
      }
    },
    "content": {
      "type": "object",
      "required": ["type", "message"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["ack", "progress", "agent_switch", "tool_use", "error", "final"],
          "description": "Message type for the consumer to format appropriately"
        },
        "message": {
          "type": "string",
          "description": "Human-readable message text"
        },
        "agent": {
          "type": "string",
          "description": "Which AIOS agent generated this message"
        },
        "tool": {
          "type": "string",
          "description": "Tool name (for tool_use type)"
        },
        "expects_reply": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "status": {
      "type": "string",
      "enum": ["pending", "sending", "sent", "failed"]
    }
  }
}
```

### 7.3. Directory Structure

```
/home/ubuntu/aios-core/.aios/
  inbox/
    pending/              # New messages waiting for daemon
    in_progress/          # Currently being processed
    processed/            # Completed (retained 7 days)
    failed/               # Failed with error (retained 14 days)
  outbox/
    pending/              # Responses waiting for channel bridges
    sent/                 # Confirmed sent (retained 7 days)
    failed/               # Failed delivery (retained 14 days)
  daemon/
    health.json           # Current daemon health state
    session.json          # Current session metadata (ID, start time, agent)
    queue.json            # Current queue state (for recovery)
    pid                   # Daemon process PID
```

### 7.4. File Naming Convention

```
Inbox:  {epoch_seconds}-{channel}-{4hex}.json
        1709290800-telegram-a3f2.json
        1709290860-whatsapp-7b1c.json
        1709290920-cli-0001.json

Outbox: reply-{epoch_seconds}-{channel}-{4hex}.json
        reply-1709290805-telegram-a3f2.json
```

### 7.5. Deduplication

The `source.message_id` field prevents duplicate processing. The InboxWatcher maintains an in-memory set of recently seen message IDs (last 1000). On startup, it scans `in_progress/` and `processed/` (last 24h) to rebuild the set.

---

## 8. Session Lifecycle

### 8.1. State Machine

```
                    +----------+
                    | STOPPED  |
                    +----+-----+
                         |
                    daemon.start()
                         |
                         v
                    +----------+
              +---->| STARTING |
              |     +----+-----+
              |          |
              |     createSession() or resumeSession()
              |          |
              |          v
              |     +----------+
              |     |  READY   |<---------+
              |     +----+-----+          |
              |          |                |
              |     command dequeued      |
              |          |                |
              |          v                |
              |     +----------+          |
              |     | BUSY     |          |
              |     | (processing        |
              |     |  command)  |         |
              |     +----+-----+          |
              |          |                |
              |     stream completes      |
              |          |                |
              |          +----------------+
              |
              |     session error / crash
              |          |
              |          v
              |     +----------+
              +-----| RECOVERY |
                    +----+-----+
                         |
                    recovery fails 3x
                         |
                         v
                    +----------+
                    | FAILED   |
                    +----+-----+
                         |
                    manual restart or timer
                         |
                         v
                    +----------+
                    | STOPPED  |
                    +----------+
```

### 8.2. Lifecycle Operations

| Operation | Trigger | Action |
|-----------|---------|--------|
| **Start** | systemd start, manual | Create fresh session or resume last session. Enter READY state. |
| **Process** | Command dequeued | READY -> BUSY. Call `session.send()`. Consume `session.stream()`. Write outbox. BUSY -> READY. |
| **Pause** | Manual command or signal | Stop accepting inbox commands. Complete current command. Enter READY (idle). Queue accumulates. |
| **Resume** | Manual command | Start processing queue again. |
| **Restart** | Manual, or after context window fills | Save current session ID. Close session. Create new session (fresh context). Note: context from previous session is lost. |
| **Kill** | systemd stop, SIGTERM | Close session gracefully. Write queue state to `queue.json`. Exit process. |
| **Recover** | Session crash detected | Attempt `resumeSession(lastSessionId)`. If fails, create new session. Retry current command if it was in-progress. Max 3 retries. |

### 8.3. Context Window Management

Claude Code sessions have a finite context window. As the session processes more commands, context accumulates. Eventually, the session may need compaction or restart.

**Monitoring:**
- Track `usage.input_tokens` from `SDKResultMessage` after each command
- When cumulative tokens exceed a threshold (configurable, default 150,000), set `needs_compaction: true` in health state
- The daemon does NOT auto-compact (that would lose context). It flags the condition and allows the current session to continue

**On threshold breach:**
- Write health warning: `{ "context_pressure": "high", "cumulative_tokens": 152340 }`
- Optionally send notification to outbox: `{ "type": "system_alert", "message": "Session context at 85%. Consider restarting." }`

**Manual restart:**
- A `restart` command in the inbox triggers: close current session, create new session, lose accumulated context but start fresh

[AUTO-DECISION] Should the daemon auto-restart sessions when context fills? -> No. Auto-restart loses context, which may break in-progress multi-command workflows. The daemon should warn and let the operator (Lucas or a channel bridge) decide when to restart. (reason: losing context mid-workflow is worse than running near capacity)

---

## 9. Health Check Design

### 9.1. Health File

The daemon writes health state to `.aios/daemon/health.json` every 10 seconds:

```json
{
  "daemon_pid": 12345,
  "daemon_uptime_seconds": 3600,
  "daemon_version": "0.1.0",
  "session": {
    "id": "abc-123-def-456",
    "state": "READY",
    "created_at": "2026-03-01T10:00:00Z",
    "last_activity_at": "2026-03-01T11:30:00Z",
    "current_agent": "aios-master",
    "commands_processed": 15,
    "cumulative_tokens": 45230,
    "cumulative_cost_usd": 0.42
  },
  "queue": {
    "pending": 0,
    "in_progress": 0,
    "total_processed": 15,
    "total_failed": 1
  },
  "last_error": null,
  "last_health_check": "2026-03-01T11:30:10Z"
}
```

### 9.2. Health Check Consumers

| Consumer | How | Frequency |
|----------|-----|-----------|
| **Telegram Bridge** | Reads `health.json` before sending commands. If `state === "FAILED"`, reports to Lucas. | Before each command |
| **systemd watchdog** | Daemon writes to `sd_notify(WATCHDOG=1)` every 30s. If missed, systemd restarts. | 30s |
| **CLI health check** | `node packages/session-daemon/src/cli.js health` reads and reports. | On-demand |
| **OpenClaw/WhatsApp** | Reads `health.json` to determine if AIOS Master is available for commands. | Before each command |

### 9.3. Health State Machine

| State | Meaning | Actions Available |
|-------|---------|-------------------|
| `STARTING` | Daemon just started, creating session | Wait |
| `READY` | Session alive, queue empty, waiting for commands | Send commands |
| `BUSY` | Processing a command | Queue additional commands, view progress |
| `RECOVERY` | Session crashed, attempting restart | Wait, view error |
| `FAILED` | Recovery failed, manual intervention needed | Restart daemon |
| `PAUSED` | Manually paused, not processing queue | Resume, restart |

---

## 10. Crash Recovery Strategy

### 10.1. Failure Modes and Recovery

| Failure | Detection | Recovery |
|---------|----------|----------|
| **SDK subprocess exits** | `stream()` generator completes with no `result` message, or throws | Attempt `resumeSession(id)`. If fails, `createSession()`. Retry current command (max 3). |
| **SDK returns error message** | `SDKResultMessage.subtype` is `error_*` | Log error. Write error to outbox. Move inbox file to `failed/`. Advance queue. |
| **Daemon process crash (OOM, uncaught exception)** | systemd detects process exit | systemd restarts daemon. Daemon reads `queue.json` to find interrupted command. Resumes session. Retries command. |
| **Filesystem full** | Write to inbox/outbox fails with ENOSPC | Log error. Stop processing. Write health state to stderr (since FS is full). Wait for manual cleanup. |
| **Network/API failure** | SDK throws authentication or rate limit error | Exponential backoff: 5s, 15s, 45s. Max 3 retries. If persists, enter FAILED state. |
| **Session context corrupted** | `resumeSession()` throws or produces incoherent output | Abandon session. Create fresh session. Note: context is lost, but processing continues. |

### 10.2. Recovery Data

On crash, the daemon must know:
1. Which command was being processed (read from `in_progress/` directory)
2. What the session ID was (read from `.aios/daemon/session.json`)
3. What commands are queued (read from `.aios/daemon/queue.json` + scan `pending/`)

**`session.json`** (written on every session create/resume):

```json
{
  "session_id": "abc-123-def-456",
  "created_at": "2026-03-01T10:00:00Z",
  "resumed_count": 2,
  "last_resumed_at": "2026-03-01T11:00:00Z"
}
```

**`queue.json`** (written on every enqueue/dequeue):

```json
{
  "current": {
    "id": "msg-1709290800-a3f2",
    "started_at": "2026-03-01T12:00:05Z",
    "retry_count": 0
  },
  "pending": [
    "msg-1709290860-b7c1",
    "msg-1709290920-c8d2"
  ]
}
```

### 10.3. Retry Policy

```
Command retry:
  max_retries: 3
  backoff: exponential (5s, 15s, 45s)
  on_max_retries: move inbox file to failed/, write error to outbox, advance queue

Session recovery:
  max_retries: 3
  backoff: exponential (5s, 15s, 45s)
  on_max_retries: enter FAILED state, write health alert, notify via outbox
```

---

## 11. Coexistence with Interactive Session

### 11.1. The Conflict

Lucas uses Claude Code interactively in his terminal. The Session Daemon also runs a Claude Code session. Both operate on `/home/ubuntu/aios-core/`. Potential conflicts:

| Resource | Conflict Risk | Mitigation |
|----------|--------------|------------|
| **Git state** | Both sessions could branch, commit, stash | Sequential processing + branch awareness (see below) |
| **File edits** | Both could edit the same file simultaneously | Sequential processing means daemon waits when busy, but interactive session is independent |
| **`.aios/` runtime** | Both write to handoff files, session state | Daemon uses `.aios/daemon/` namespace. Interactive session uses `.aios/handoffs/` |
| **CPU/RAM** | Two Claude Code processes running | 7.8 GB RAM, 2 cores. One SDK session ~500MB. Interactive session ~500MB. Leaves ~2.5GB free. Tight but viable. |
| **API rate limits** | Two sessions making API calls | Anthropic rate limits are per-API-key. Could hit limits if both are active simultaneously. |

### 11.2. Design Decision: Accept Coexistence with Advisories

[AUTO-DECISION] Should the daemon lock out the interactive session? -> No. The interactive session is the primary developer workflow. The daemon is secondary infrastructure. Locking out the interactive session would violate CLI First. (reason: Constitution Article I -- CLI First. The interactive CLI session must always work.)

**Strategy:**

1. **The daemon session is secondary.** If there is a conflict, the interactive session takes priority.
2. **Git safety:** The daemon's agent commands should NOT create branches or commit directly unless explicitly asked. For tasks that modify files, the daemon operates on the current branch, same as the interactive session. This mirrors how a human developer would work -- they do not create a separate branch for every small task.
3. **Stale state detection:** Before processing each command, the daemon checks `git status` via the SDK session. If there are unexpected modifications (from the interactive session), the daemon includes this context in the command: "Note: there are uncommitted changes in the working directory."
4. **Advisory notifications:** The daemon writes to `.aios/daemon/coexistence.json` when it detects the interactive session is active (by checking for Claude Code processes). Channel bridges can warn Lucas: "Note: interactive session is also active."

### 11.3. Detection of Interactive Session

```javascript
// Check if an interactive Claude Code session is running
const { execSync } = require('child_process');
function isInteractiveSessionActive() {
  try {
    const result = execSync('pgrep -f "claude" | wc -l', { encoding: 'utf8' }).trim();
    // Subtract 1 for the daemon's own SDK subprocess
    return parseInt(result, 10) > 1;
  } catch {
    return false;
  }
}
```

This is advisory only. The daemon does NOT pause or stop when an interactive session is detected.

---

## 12. Security Considerations

### 12.1. Permission Model

| Concern | Mitigation |
|---------|------------|
| **Who can write to inbox?** | Directory permissions: `drwxrwx--- ubuntu ubuntu`. Only `ubuntu` user and processes running as `ubuntu` can write. OpenClaw runs as root but writes via `su - ubuntu`. |
| **Command injection via inbox** | All commands are passed as strings to `session.send()`. The SDK handles escaping. The daemon NEVER executes inbox content as shell commands. |
| **API key exposure** | `ANTHROPIC_API_KEY` is set in the daemon's systemd environment file (`/etc/systemd/system/aios-session-daemon.service.d/env.conf`), not in the inbox/outbox. |
| **Outbox content leakage** | Outbox files contain agent responses, which may include code or sensitive project data. Outbox directory has same permissions as inbox. Bridges should NOT forward raw code to Telegram without truncation. |
| **Unauthorized inbox writes** | The InboxWatcher validates `source.sender_id` against an allowlist in the daemon config. Unknown senders are rejected and logged. |

### 12.2. Authorization Config

```yaml
# packages/session-daemon/config/daemon.yaml
authorization:
  allowed_senders:
    - channel: telegram
      sender_id: "${TELEGRAM_OWNER_ID}"   # Lucas's Telegram ID
      name: "Lucas"
    - channel: whatsapp
      sender_id: "+5528999301848"          # Lucas's WhatsApp
      name: "Lucas"
    - channel: cli
      sender_id: "system"                  # CLI scripts
      name: "System"
    - channel: systemd_timer
      sender_id: "system"                  # Automated timers
      name: "System"
  reject_unknown: true
  log_rejections: true
```

### 12.3. Deny Rules Enforcement

The SDK session loads project settings via `settingSources: ["user", "project", "local"]`. This means all deny rules from `.claude/settings.json` are enforced. The daemon session has the SAME restrictions as an interactive session. Constitution Article II (Agent Authority) applies identically.

With `permissionMode: "bypassPermissions"`, file permission prompts are bypassed -- but deny rules are STILL enforced by Claude Code. This matches the behavior described in the Telegram bridge architecture document: "deny rules still enforced."

---

## 13. Resource Constraints

### 13.1. Current Server Specs

| Resource | Available | Daemon Usage | Remaining |
|----------|-----------|-------------|-----------|
| RAM | 7.8 GB | ~500 MB (SDK subprocess) + ~100 MB (daemon Node.js) | ~3.0 GB (after interactive session) |
| CPU | 2 cores | Low (mostly I/O wait on API calls) | Sufficient |
| Disk | TBD | Inbox/outbox: negligible. Session persistence: ~10-50 MB per session | Sufficient |
| API rate | Per-key | Shared with interactive session | **Potential bottleneck** if both are active |

### 13.2. API Rate Limit Concern

With 2 sessions (interactive + daemon) sharing the same API key, there is a risk of hitting rate limits during concurrent usage. The SDK exposes `SDKRateLimitEvent` messages when rate limiting occurs.

**Mitigation:**
- The daemon processes commands sequentially (not bursting)
- If the daemon receives a rate limit event, it backs off exponentially
- In practice, interactive usage is bursty (human typing speed) while daemon usage is sequential (one command at a time). Conflicts should be rare.

---

## 14. Implementation Plan

### 14.1. Package Structure

```
packages/session-daemon/
  package.json
  tsconfig.json
  config/
    daemon.yaml              # Daemon configuration
  src/
    index.ts                 # Entry point, orchestrates all components
    session-adapter.ts       # Thin wrapper over Claude Agent SDK V2
    inbox-watcher.ts         # Watches .aios/inbox/pending/ for new files
    command-queue.ts         # FIFO queue with sequential processing
    stream-processor.ts      # Parses SDKMessage stream, emits structured events
    outbox-writer.ts         # Writes response files to .aios/outbox/pending/
    health-monitor.ts        # Writes health state, watchdog, session tracking
    schema-validator.ts      # Validates inbox/outbox JSON against schemas
    cli.ts                   # CLI interface: health, status, queue, restart
  schemas/
    inbox-message.json       # JSON Schema for inbox messages
    outbox-message.json      # JSON Schema for outbox messages
  systemd/
    aios-session-daemon.service  # systemd unit file
  tests/
    session-adapter.test.ts
    inbox-watcher.test.ts
    command-queue.test.ts
    stream-processor.test.ts
    outbox-writer.test.ts
    integration.test.ts
```

### 14.2. Stories

#### Story 1: Core Infrastructure (Foundation)

**Scope:** Package setup, directory structure, schema validation, inbox watcher, outbox writer.

**Acceptance Criteria:**
- [ ] `packages/session-daemon/` package created with TypeScript config
- [ ] `.aios/inbox/` and `.aios/outbox/` directory structure created with subdirectories (pending, in_progress, processed, failed)
- [ ] `.aios/daemon/` directory created for health state
- [ ] JSON schemas for inbox and outbox messages defined and validated with ajv
- [ ] InboxWatcher watches `pending/` using `fs.watch()` with 5-second polling fallback
- [ ] InboxWatcher validates incoming JSON against schema, rejects invalid files (moves to `failed/`)
- [ ] OutboxWriter writes response files to `outbox/pending/`
- [ ] Deduplication on `source.message_id` prevents duplicate processing
- [ ] Unit tests for all components
- [ ] `.gitignore` updated to exclude `.aios/inbox/`, `.aios/outbox/`, `.aios/daemon/`

**Estimated effort:** 1-2 days

#### Story 2: Session Adapter and Command Queue

**Scope:** Claude Agent SDK integration, session create/resume, sequential command processing.

**Acceptance Criteria:**
- [ ] `@anthropic-ai/claude-agent-sdk` installed as dependency
- [ ] SessionAdapter wraps V2 `unstable_v2_createSession()` and `unstable_v2_resumeSession()`
- [ ] SessionAdapter falls back to V1 `query()` with `resume` option if V2 fails
- [ ] Session created with `settingSources: ["user", "project", "local"]` and `systemPrompt: { type: "preset", preset: "claude_code" }`
- [ ] Session created with `permissionMode: "bypassPermissions"` and `includePartialMessages: true`
- [ ] CommandQueue implements FIFO with sequential processing guarantee
- [ ] CommandQueue persists state to `.aios/daemon/queue.json` for crash recovery
- [ ] On command completion, inbox file moves from `in_progress/` to `processed/`
- [ ] On command failure (3 retries), inbox file moves to `failed/`
- [ ] Integration test: send command via inbox file, receive response in outbox file

**Estimated effort:** 2-3 days

#### Story 3: Stream Processor and Agent Detection

**Scope:** Parse SDK message stream, detect agent switches, tool uses, format for outbox.

**Acceptance Criteria:**
- [ ] StreamProcessor consumes `AsyncGenerator<SDKMessage>` from SessionAdapter
- [ ] StreamProcessor detects agent switches from assistant message content (heuristic: `@agent` patterns, greeting patterns)
- [ ] StreamProcessor classifies messages into: progress, agent_switch, tool_use, error, final
- [ ] StreamProcessor writes classified messages to outbox via OutboxWriter
- [ ] Tool use messages include tool name and input summary (truncated for readability)
- [ ] Error messages include error type and details
- [ ] Final result message includes full result text and session metadata (tokens, cost)
- [ ] Message granularity filter: only `milestone` and `progress` messages reach outbox (not every grep/read)
- [ ] Unit tests with mock SDKMessage sequences

**Estimated effort:** 2 days

#### Story 4: Health Monitor and Crash Recovery

**Scope:** Health state file, systemd integration, crash detection and recovery.

**Acceptance Criteria:**
- [ ] HealthMonitor writes `health.json` every 10 seconds
- [ ] Health state includes: daemon PID, uptime, session ID, state, current agent, queue depth, cumulative tokens
- [ ] HealthMonitor tracks session state machine (STARTING, READY, BUSY, RECOVERY, FAILED, PAUSED)
- [ ] Session metadata persisted to `session.json` on every create/resume
- [ ] On daemon restart (systemd), reads `session.json` and attempts `resumeSession()`
- [ ] On resume failure, creates fresh session and logs warning
- [ ] On command failure, retries with exponential backoff (max 3 retries)
- [ ] On max retries, enters RECOVERY state, attempts session restart
- [ ] On 3 failed recoveries, enters FAILED state and writes error to outbox
- [ ] systemd unit file with `WatchdogSec=60` and `Restart=on-failure`
- [ ] CLI tool: `node src/cli.ts health` shows current health state
- [ ] CLI tool: `node src/cli.ts restart` triggers daemon session restart

**Estimated effort:** 2 days

#### Story 5: End-to-End Integration Test

**Scope:** Full pipeline test, coexistence verification, systemd deployment.

**Acceptance Criteria:**
- [ ] End-to-end test: write inbox file manually, verify outbox response appears
- [ ] End-to-end test: multi-turn conversation (send 3 commands, verify context is maintained)
- [ ] End-to-end test: agent delegation (send "@aios-master fix bug", verify @dev and @qa agent switches detected in outbox)
- [ ] End-to-end test: crash recovery (kill SDK subprocess, verify daemon recovers and retries)
- [ ] End-to-end test: queue ordering (send 3 commands rapidly, verify processed in order)
- [ ] Coexistence test: run daemon while interactive Claude Code session is active, verify no conflicts
- [ ] systemd service deployed and tested: `systemctl start aios-session-daemon`
- [ ] Resource usage measured and documented: RAM, CPU under load

**Estimated effort:** 2 days

### 14.3. Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `@anthropic-ai/claude-agent-sdk` | ^0.2.63 | Claude Agent SDK with V2 session support |
| `ajv` | ^8.x | JSON Schema validation for inbox/outbox |
| `chokidar` | ^3.x | Cross-platform file watcher (more reliable than `fs.watch`) |
| `yaml` | ^2.x | Parse daemon config YAML |
| `pino` | ^8.x | Structured logging |
| `typescript` | ^5.4 | TypeScript with `await using` support |

### 14.4. Timeline

| Story | Estimated | Depends On |
|-------|-----------|------------|
| Story 1: Core Infrastructure | 1-2 days | None |
| Story 2: Session Adapter + Queue | 2-3 days | Story 1 |
| Story 3: Stream Processor | 2 days | Story 2 |
| Story 4: Health + Recovery | 2 days | Story 2 |
| Story 5: Integration + Deploy | 2 days | Stories 3, 4 |
| **Total** | **9-11 days** | |

Stories 3 and 4 can be worked in parallel after Story 2 completes.

---

## 15. Open Questions

| # | Question | Impact | Suggested Resolution | Status |
|---|----------|--------|---------------------|--------|
| 1 | **V2 API stability:** The V2 functions are `unstable_v2_*`. Will they change significantly before stabilization? | Session adapter may need refactoring | Pin SDK version. Implement V1 `query()` fallback in session adapter. Monitor SDK changelog. | MITIGATED |
| 2 | **Session index bug:** There is a known issue (Feb 2026) where `sessions-index.json` stops updating, breaking `--resume`. Does the SDK V2 `resumeSession()` have the same bug? | Session resume may fail | Test `resumeSession()` explicitly. The SDK may use a different code path than the CLI `--resume` flag. If broken, fall back to `createSession()` (fresh session, loses context). | NEEDS TESTING |
| 3 | **Context window size:** How many commands can a single session handle before context fills? With the default model, what is the effective context limit? | Session lifetime and restart frequency | Monitor `usage.input_tokens` from result messages. Set configurable threshold (default 150K). The `--compact` equivalent in SDK is unknown -- investigate if the SDK supports mid-session compaction. | NEEDS RESEARCH |
| 4 | **Concurrent API usage:** With both the daemon and interactive session sharing one API key, what are the actual rate limits? | Both sessions may be throttled | Anthropic rate limits vary by plan. For the current setup, measure empirically. If issues arise, consider separate API keys for daemon vs. interactive. | NEEDS TESTING |
| 5 | **CLAUDE.md loading:** Does `settingSources: ["project"]` with `systemPrompt: { type: "preset", preset: "claude_code" }` load ALL project files (CLAUDE.md, rules, agent defs)? Or only `settings.json`? | AIOS context may be incomplete | Test explicitly by creating a session with these options and verifying that CLAUDE.md content appears in the system prompt. If not, may need to load CLAUDE.md manually via `systemPrompt` string. | NEEDS TESTING |
| 6 | **Agent authority in daemon session:** The daemon bypasses permissions. Does this also bypass deny rules? Constitution Article II compliance? | Security concern | Per Claude Code documentation: `--dangerously-skip-permissions` (and `bypassPermissions`) bypass permission prompts but deny rules from `settings.json` are still enforced. Verify this with the SDK. | NEEDS VERIFICATION |
| 7 | **Outbox consumption race:** If two bridges (Telegram + WhatsApp) both watch the outbox, could both try to consume the same file? | Duplicate delivery | Each outbox file has a `channel` field. Bridges filter by channel. A bridge only processes files matching its channel. No race condition if bridges respect the channel field. | MITIGATED |
| 8 | **Message ordering in outbox:** For a single command, the StreamProcessor may write many outbox files (progress, tool_use, final). Are they guaranteed to be processed in order? | Messages arrive out of order | Use timestamp-based file naming (epoch milliseconds, not seconds). Bridges sort by timestamp before sending. The outbox write is synchronous (one file at a time), so write order matches logical order. | MITIGATED |
| 9 | **Interactive approval flows:** If an agent needs user approval ("Push to remote?"), the SDK session blocks waiting for input. How does the daemon handle this? | Session hangs | The daemon uses `permissionMode: "bypassPermissions"`, which auto-approves all operations. For production safety, we may want `canUseTool` callback that auto-approves safe operations and writes approval requests to outbox for dangerous ones. This is a Phase 2 concern. | DEFERRED |
| 10 | **SDK subprocess memory:** Does the SDK subprocess grow in memory over time as context accumulates? Is there a memory leak risk? | OOM kill on 7.8GB server | Monitor RSS of the SDK subprocess over time. If memory grows unbounded, implement periodic session restart (fresh context). Session restart threshold configurable in daemon config. | NEEDS MONITORING |

---

## Appendix A: systemd Service File

```ini
# /etc/systemd/system/aios-session-daemon.service
[Unit]
Description=AIOS Session Daemon - Persistent Claude Code Session Manager
After=network.target
Wants=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/aios-core
ExecStart=/usr/bin/node /home/ubuntu/aios-core/packages/session-daemon/src/index.js
Restart=on-failure
RestartSec=10
WatchdogSec=60

# Environment
EnvironmentFile=/home/ubuntu/aios-core/packages/session-daemon/.env

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=aios-session-daemon

# Resource limits
LimitNOFILE=4096
MemoryMax=1G

[Install]
WantedBy=multi-user.target
```

## Appendix B: Daemon Configuration File

```yaml
# packages/session-daemon/config/daemon.yaml
version: "1.0"

session:
  model: "claude-opus-4-6"
  cwd: "/home/ubuntu/aios-core"
  permission_mode: "bypassPermissions"
  setting_sources: ["user", "project", "local"]
  system_prompt:
    type: "preset"
    preset: "claude_code"
  include_partial_messages: true
  persist_session: true
  allowed_tools:
    - Read
    - Write
    - Edit
    - Bash
    - Grep
    - Glob
    - WebSearch
    - WebFetch
    - Task

queue:
  max_size: 50
  max_retries: 3
  retry_backoff_ms: [5000, 15000, 45000]

inbox:
  watch_directory: ".aios/inbox/pending"
  poll_interval_ms: 5000
  retention_days: 7

outbox:
  write_directory: ".aios/outbox/pending"
  retention_days: 7

health:
  write_interval_ms: 10000
  state_directory: ".aios/daemon"
  watchdog_interval_ms: 30000

recovery:
  max_session_retries: 3
  session_retry_backoff_ms: [5000, 15000, 45000]

context:
  token_warning_threshold: 150000
  auto_restart: false

authorization:
  allowed_senders:
    - channel: telegram
      sender_id: "${TELEGRAM_OWNER_ID}"
    - channel: whatsapp
      sender_id: "+5528999301848"
    - channel: cli
      sender_id: "system"
    - channel: systemd_timer
      sender_id: "system"
  reject_unknown: true

observability:
  message_granularity: "milestone"
  # milestone: agent switches, completions, errors only
  # progress: milestone + file modifications, test results
  # verbose: everything (not recommended for production)
  max_outbox_message_length: 4096
  truncate_tool_output: true
  truncate_max_chars: 500
```

## Appendix C: Relationship to Existing Architecture Documents

| Document | Relationship |
|----------|-------------|
| `telegram-observability-bridge.md` | The Telegram bridge builds ON TOP of the Session Daemon. Section 4 (Session Architecture) of that document is superseded by this document. The bridge becomes a simple inbox producer + outbox consumer. |
| `telegram-observability-validation.md` | This document addresses the "fatal structural flaw" (statefulness problem) identified in Section 1 of the validation report. Recommendations R1 (Session Daemon), R3 (reuse inbox/outbox), R7 (output interceptor) are implemented here. |
| `gateway-agent-architecture.md` | The inbox/outbox JSON schema (Section 7) extends the gateway's inbox format (Section 9.1) to be channel-agnostic. The gateway becomes another inbox producer. |
| `gateway-personal-memory-architecture.md` | Orthogonal. The personal memory system operates within the @gateway agent's context, not in the Session Daemon. The daemon provides the session that @gateway's AIOS-side logic runs inside. |
| `.claude/rules/agent-authority.md` | Fully respected. The SDK session loads all AIOS rules via `settingSources`. Agent authority is enforced by Claude Code within the session, not by the daemon. |
| `.claude/rules/agent-handoff.md` | Fully supported. Agent handoff is an intra-session operation. The persistent SDK session preserves handoff artifacts naturally. |

## Appendix D: CLI Interface

```bash
# Check daemon health
node packages/session-daemon/src/cli.js health

# Show current queue
node packages/session-daemon/src/cli.js queue

# Send a test command via inbox
node packages/session-daemon/src/cli.js send "What is the project status?"

# Restart session (fresh context)
node packages/session-daemon/src/cli.js restart

# Pause processing (complete current, stop dequeuing)
node packages/session-daemon/src/cli.js pause

# Resume processing
node packages/session-daemon/src/cli.js resume

# Show session info
node packages/session-daemon/src/cli.js session
```

## Appendix E: Trade-off Summary

| Decision | Selected | Rejected | Rationale |
|----------|----------|----------|-----------|
| Session approach | Claude Agent SDK V2 | tmux wrapper, raw API, hybrid | SDK provides structured streaming, native session persistence, full AIOS tools, and eliminates all parsing fragility |
| Message queue | Filesystem (inbox/outbox) | Redis, SQLite, HTTP API | Same-machine IPC, no new dependencies, compatible with existing gateway architecture, survives process restarts |
| Processing model | Sequential FIFO | Concurrent, priority queue | Sequential prevents git/file conflicts. Priority sorting within queue handles urgency without concurrent execution. |
| Session lifecycle | Manual restart only | Auto-restart on context threshold | Losing context mid-workflow is worse than running near capacity. Operator decides when to restart. |
| Coexistence | Advisory (detect + warn) | Lock out interactive session | CLI First principle (Constitution Article I). Interactive session must never be blocked. |
| V2 API risk | Thin adapter + V1 fallback | Direct V2 usage without abstraction | Adapter isolates instability. V1 `query()` with `resume` provides identical functionality if V2 breaks. |

---

*Architecture by Aria, arquitetando o futuro.*
