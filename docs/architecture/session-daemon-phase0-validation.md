# Validation Report: Session Daemon Phase 0 Architecture

**Auditor:** @pedro-valerio (Process Absolutist)
**Date:** 2026-03-01
**Status:** CONCERNS (3 FAIL, 12 CONCERNS, 10 PASS across 25 validation points)
**Architecture Under Review:** Session Daemon -- Phase 0 Foundation (`session-daemon-phase0.md`)
**Baseline:** `telegram-observability-validation.md` (previous FAIL verdict, 15 FAIL), `gateway-agent-architecture.md` (inbox/outbox origin), `agent-authority.md`

---

## Executive Summary

The Session Daemon Phase 0 architecture is the **strongest document** I have reviewed across four audits. It directly confronts the statefulness showstopper I identified in the Telegram Observability validation (where `claude --print` being stateless made the entire multi-bot architecture impossible) and proposes a credible solution: the Claude Agent SDK V2 with persistent sessions, wrapped in a file-based FIFO message queue.

The core decision -- using `@anthropic-ai/claude-agent-sdk` with `unstable_v2_createSession()` / `unstable_v2_resumeSession()` instead of tmux/screen -- is sound. The SDK provides structured output, session persistence, tool execution, and abort support. It eliminates every fragility of terminal wrapping.

However, this is the first architecture I have seen that honestly classifies unknowns. The document contains **7 items marked "NEEDS TESTING/RESEARCH/VERIFICATION"** in the Open Questions section. This intellectual honesty is commendable, but these untested assumptions create risk. Several of them are load-bearing: if `settingSources` does not load CLAUDE.md, the entire AIOS context is missing. If `resumeSession()` hits the known sessions-index.json bug, crash recovery degrades. If the SDK subprocess leaks memory, the 7.8GB server becomes unusable.

### Verdict Summary

| Category | Count |
|----------|-------|
| PASS | 10 |
| CONCERNS | 12 |
| FAIL | 3 |
| **Total** | **25** |

### Comparison to Previous Audit

| Metric | Telegram Observability (v3) | Session Daemon (Phase 0) |
|--------|-----------------------------|--------------------------|
| FAIL | 15 | 3 |
| CONCERNS | 11 | 12 |
| PASS | 5 | 10 |
| Showstoppers | 1 (statefulness) | 0 |
| Verdict | FAIL | CONCERNS |

The statefulness showstopper is **resolved in principle** by the SDK. The remaining FAILs are about untested assumptions that could be verified before implementation begins. This architecture can proceed to implementation with targeted risk mitigation.

---

## Table of Contents

1. [Statefulness Showstopper Resolution](#1-statefulness-showstopper-resolution)
2. [Delegation Chain Validation](#2-delegation-chain-validation)
3. [Sequential Processing Guarantee](#3-sequential-processing-guarantee)
4. [Crash Recovery](#4-crash-recovery)
5. [Coexistence Analysis](#5-coexistence-analysis)
6. [Inbox/Outbox Schema](#6-inboxoutbox-schema)
7. [V2 API Instability Risk](#7-v2-api-instability-risk)
8. [Authorization](#8-authorization)
9. [Open Questions Honesty Audit](#9-open-questions-honesty-audit)
10. [Structural Process Audit](#10-structural-process-audit)
11. [Summary Matrix](#11-summary-matrix)
12. [Recommendations](#12-recommendations)

---

## 1. Statefulness Showstopper Resolution

**The central question: does this actually solve the statefulness problem?**

### V1.1: SDK Session Persistence

**Verdict: PASS**

The architecture uses `unstable_v2_createSession()` with `send()` / `stream()` to maintain a persistent multi-turn session. Each `send()` call accumulates context in the session. This is fundamentally different from `claude --print`, which spawns a fresh session per invocation.

The SDK stores session state in `~/.claude/projects/` as JSONL files. The `unstable_v2_resumeSession(sessionId)` function reloads this state on daemon restart.

**Why this works:** A single SDK session IS a single Claude Code session. The entire AIOS toolchain (Read, Write, Edit, Bash, Grep, Glob) is available. The CLAUDE.md, rules, deny rules, and agent definitions load via `settingSources: ["user", "project", "local"]`. Within this session, `@aios-master` can activate `@dev`, `@dev` can hand off to `@qa`, and the handoff artifacts exist naturally in the session context.

**Evidence:** The SDK documentation confirms `send()` accumulates conversation turns. The session persists to disk by default (`persistSession: true`). The `stream()` generator yields typed `SDKMessage` objects, not raw text.

### V1.2: AIOS Context Loading

**Verdict: FAIL -- Untested load-bearing assumption**

The architecture assumes that `settingSources: ["user", "project", "local"]` combined with `systemPrompt: { type: "preset", preset: "claude_code" }` will load the full AIOS context: CLAUDE.md, all rules files, agent definitions, deny rules from settings.json.

This is marked as Open Question #5 ("NEEDS TESTING") in the document. The architect is honest about not verifying this.

**Why this is FAIL, not CONCERNS:**

The entire architecture depends on AIOS agents being available inside the daemon session. If `settingSources` only loads `settings.json` (deny rules, allowed tools) but NOT `CLAUDE.md` and `rules/*.md`, then:

- No agent definitions are available
- No workflow rules apply
- No agent authority matrix exists
- No Constitution enforcement
- The session is a raw Claude Code session, not an AIOS session

This is a binary question with a binary outcome. If it works, the architecture is sound. If it does not, the architecture requires a manual `systemPrompt` string containing the entire AIOS context (which is fragile and would exceed token limits).

**Veto condition:** Implementation MUST NOT begin Story 2 (Session Adapter) until this is verified with a test script that creates an SDK session and checks for CLAUDE.md content in the system prompt.

### V1.3: Multi-Turn Context Accumulation

**Verdict: PASS**

Flow B (Section 6.2) demonstrates a 9-message delegation chain: AIOS Master delegates to @dev, @dev investigates, fixes, tests, hands off to @qa, @qa reviews. All within a single `session.send()` + `session.stream()` cycle.

The critical observation is correct: this is ONE continuous stream from ONE `send()` call. The agent switches, tool uses, and handoffs are all intra-session operations. The session context naturally accumulates files read, decisions made, and code modified.

Flow C (Section 6.3) demonstrates follow-up commands. After the auth fix, a second `send("Show me the diff")` works because the session remembers the previous fix. This is the core value proposition: multi-turn statefulness.

---

## 2. Delegation Chain Validation

### V2.1: @aios-master to @dev to @qa Chain

**Verdict: PASS**

The Flow B walkthrough (Section 6.2) traces the exact scenario from my previous showstopper finding. The delegation chain works because:

1. A single `session.send("@aios-master Fix the auth bug")` triggers the entire chain
2. AIOS Master decides to delegate (MSG 1)
3. @dev activates within the same session (MSG 2-6)
4. @qa activates within the same session (MSG 7-8)
5. Final result returns (MSG 9)

The StreamProcessor observes the stream and detects agent switches via content analysis. The OutboxWriter creates typed outbox messages (`agent_switch`, `tool_use`, `progress`, `final`) that channel bridges can format appropriately.

**Key insight:** The delegation chain is NOT multiple `send()` calls. It is a single `send()` whose response stream contains the entire multi-agent workflow. Claude Code handles agent switching internally. The daemon merely observes and forwards.

### V2.2: Agent Switch Detection in Stream

**Verdict: CONCERNS**

Story 3 (Stream Processor) specifies: "StreamProcessor detects agent switches from assistant message content (heuristic: `@agent` patterns, greeting patterns)."

This is a heuristic, not a deterministic signal. The SDK emits `SDKMessage` objects, but agent switches are not a native SDK event type. The StreamProcessor must infer agent changes from:

- Text content containing `@dev` or `@qa` patterns
- Greeting patterns from agent personas
- Tool use patterns (e.g., @dev uses `Edit`, @qa uses `Grep` for review)

**Risk:** False positives (detecting "@dev" in a code comment) or false negatives (agent switches without explicit mention). This is a CONCERNS because:

1. Agent switch detection is observability, not control flow. Getting it wrong means an outbox message says "agent: dev" when it should say "agent: qa". It does not break the workflow.
2. The heuristic can be improved iteratively based on real SDK output.

**Mitigation needed:** Define explicit detection rules. If the SDK `SDKMessage` has any metadata about the active agent or tool caller, use that instead of text heuristics. If not, the heuristic rules must be documented with test cases for each agent's greeting pattern.

### V2.3: Cross-Channel Context Sharing

**Verdict: PASS**

Flow D (Section 6.4) demonstrates WhatsApp and Telegram commands sharing the same session. A Telegram command and a WhatsApp command both go through the same `CommandQueue -> SessionAdapter -> session.send()` pipeline. The session accumulates context from both channels.

This directly implements my recommendation from the previous audit: "Multi-channel MUST share a single inbox/outbox queue, not parallel systems." The architecture gets this right.

---

## 3. Sequential Processing Guarantee

### V3.1: FIFO Queue Implementation

**Verdict: PASS**

The CommandQueue guarantees sequential processing: msg2 NEVER starts until msg1 stream completes. This prevents:

- Git state conflicts
- File edit conflicts
- Agent state confusion

The guarantee is implemented by the daemon's event loop: dequeue -> `send()` -> consume `stream()` to completion -> dequeue next. This is a synchronous pipeline within an async event loop.

### V3.2: Race Condition on Inbox Write

**Verdict: CONCERNS**

The InboxWatcher uses `fs.watch()` with a 5-second polling fallback. Multiple producers (Telegram Bridge, OpenClaw, CLI scripts) can write to `.aios/inbox/pending/` simultaneously.

**Potential race:** Two producers write files at nearly the same time. `fs.watch()` fires once. The daemon reads one file, but the second file is missed until the next 5-second poll.

**This is not a bug -- it is latency.** The second file WILL be processed, just up to 5 seconds later. For a system where response latency is already measured in seconds to minutes, this is acceptable.

**However:** What if `fs.watch()` fires while the daemon is already in the middle of reading and enqueuing a batch? The architecture does not specify whether the InboxWatcher scans the directory on each trigger or processes individual file events. If it processes individual events, it could miss files. If it scans the directory, it is idempotent and safe.

**Recommendation:** Specify that InboxWatcher always performs a full directory scan on trigger, not individual file processing. This makes it immune to `fs.watch()` event coalescing.

### V3.3: Queue Overflow

**Verdict: CONCERNS**

The daemon config specifies `queue.max_size: 50`. What happens when a 51st command arrives?

The architecture does not specify this behavior. Options:

1. Reject the command, move inbox file to `failed/` with reason "queue_full"
2. Block the InboxWatcher until the queue has space (backpressure)
3. Drop the oldest command (unacceptable -- data loss)

**Recommendation:** Specify option 1 (reject and fail) with an outbox message notifying the sender that the queue is full.

---

## 4. Crash Recovery

### V4.1: SDK Subprocess Crash

**Verdict: PASS**

The recovery table (Section 10.1) covers the main failure modes:

| Failure | Recovery |
|---------|----------|
| SDK subprocess exits | `resumeSession()`, fallback to `createSession()` |
| SDK error message | Log, write error to outbox, advance queue |
| Daemon process crash | systemd restarts, reads `queue.json`, resumes session |
| Filesystem full | Stop processing, log to stderr |
| Network/API failure | Exponential backoff, 3 retries |
| Session context corrupted | Abandon session, create fresh |

The retry policy is clear: 3 retries with exponential backoff (5s, 15s, 45s). On max retries, the command moves to `failed/` and the queue advances. This prevents a single bad command from blocking the queue forever.

### V4.2: resumeSession() Reliability

**Verdict: FAIL -- Known bug unresolved**

Open Question #2 states: "There is a known issue (Feb 2026) where `sessions-index.json` stops updating, breaking `--resume`. Does the SDK V2 `resumeSession()` have the same bug?"

This is marked "NEEDS TESTING" -- but the architecture relies on `resumeSession()` for crash recovery (Section 10.1, first row). If `resumeSession()` is affected by the same bug:

1. On daemon crash, `resumeSession()` fails
2. Fallback to `createSession()` creates a fresh session with no context
3. The in-progress command is retried, but the session has no memory of what was already done
4. For a partially-completed multi-agent workflow, this means re-executing from scratch

**Why this is FAIL:** The architecture specifies `resumeSession()` as the primary recovery mechanism but acknowledges a known bug that may break it. This is not an abstract risk -- it is a documented, existing defect.

**However:** The fallback (`createSession()`) still works. The system degrades to "loses context on crash" rather than "fails entirely." This is acceptable for Phase 0 if documented as a known limitation.

**Veto condition:** Before implementation begins, test `resumeSession()` manually with the SDK to determine if the sessions-index.json bug affects it. If it does, the architecture must either:
(a) Implement its own session index (not rely on the SDK's),
(b) Accept context loss on crash as a known Phase 0 limitation, or
(c) Implement its own JSONL replay mechanism.

### V4.3: Recovery Data Completeness

**Verdict: PASS**

The daemon persists recovery state across three files:

- `session.json`: current session ID, creation time, resume count
- `queue.json`: current command (with retry count), pending command IDs
- `in_progress/` directory: the actual inbox file being processed

On restart, the daemon has everything it needs to resume: which session to reconnect, which command was running, and what is queued. The `in_progress/` directory is the filesystem lock that prevents double-processing.

### V4.4: Command Retry Idempotency

**Verdict: CONCERNS**

When a command fails and is retried, the retry sends the same message to the session via `session.send()`. If the previous attempt partially executed (e.g., @dev committed a file before the crash), the retry will attempt the same work again.

The architecture does not address idempotency of commands. For read-only commands (status queries), this is fine. For write commands (fix a bug, create a story), retry could create duplicate commits, duplicate files, or conflicting state.

**Mitigation options:**
1. On retry, prepend context to the command: "Note: this is a retry of command X. The previous attempt may have partially executed. Check git status before proceeding."
2. The daemon could check for the previous session's output before retrying (if session data is available).

**Recommendation:** Implement option 1 as a simple, low-risk mitigation. The agent (Claude Code) is capable of checking for existing work before re-executing.

---

## 5. Coexistence Analysis

### V5.1: Interactive Session Priority

**Verdict: PASS**

The design decision (Section 11.2) is clear: the interactive session is primary, the daemon is secondary. The daemon does NOT lock out the interactive session. This respects Constitution Article I (CLI First).

The AUTO-DECISION annotation is well-reasoned: "Locking out the interactive session would violate CLI First."

### V5.2: Git State Conflicts

**Verdict: CONCERNS**

Both the daemon session and the interactive session operate on the same working directory. If the daemon's agent modifies files or creates commits while Lucas is working interactively:

- Uncommitted changes could conflict
- Branches could diverge
- Stash operations could collide

The mitigation is: "Before processing each command, the daemon checks `git status`." This is advisory -- it tells the agent about existing changes but does not prevent conflicts.

**Scenario:** Lucas is editing `auth-service.ts` interactively. A Telegram command arrives: "Fix the auth bug." The daemon's agent also tries to edit `auth-service.ts`. Both sessions now have conflicting edits.

**The architecture acknowledges this risk but provides no mechanism to prevent it.** The mitigation is "the agent will include context about uncommitted changes," which relies on the agent's judgment.

**Assessment:** For Phase 0, where the user base is one person (Lucas), this is acceptable. Lucas knows when he is working interactively and can avoid sending daemon commands that conflict. This is a CONCERNS, not FAIL, because:

1. The conflict requires simultaneous usage (low probability for one user)
2. The daemon processes sequentially, so it will not race with itself
3. The agent can detect conflicts via `git status` and report them

### V5.3: RAM Budget

**Verdict: CONCERNS**

The document estimates:
- Daemon Node.js: ~100 MB
- SDK subprocess: ~500 MB
- Interactive session: ~500 MB (implied)
- Remaining: ~3.0 GB

This leaves room for the OS, OpenClaw Gateway, and other services. The systemd unit file includes `MemoryMax=1G`, which caps the daemon's total memory.

**Concern:** The SDK subprocess memory is not covered by `MemoryMax=1G`. The systemd memory limit applies to the daemon Node.js process, but the SDK spawns a child process (Claude Code) which may be counted separately depending on the cgroup hierarchy. If the SDK subprocess is a direct child, it should be in the same cgroup. But this needs verification.

**Second concern:** Open Question #10 asks about SDK subprocess memory growth over time. If sessions accumulate context (which they do by design), the subprocess RSS may grow. On a 7.8GB machine, this could lead to OOM kills.

**Recommendation:** Add monitoring of SDK subprocess RSS to the HealthMonitor. Set an alert threshold (e.g., 800MB) that triggers a session restart recommendation.

### V5.4: API Rate Limit Sharing

**Verdict: CONCERNS**

Both sessions share the same API key. Anthropic rate limits are per-key. If Lucas is actively using the interactive session (bursty usage) while the daemon processes a command (sustained usage), they could jointly exceed limits.

The mitigation is reasonable: daemon processes sequentially, interactive is bursty, conflicts should be rare. But "should be rare" is not "cannot happen."

**Recommendation:** If rate limiting occurs, the daemon should back off and yield to the interactive session. This aligns with the "daemon is secondary" design decision.

---

## 6. Inbox/Outbox Schema

### V6.1: Schema Completeness

**Verdict: PASS**

The inbox schema (Section 7.1) includes all required fields:

- `schema_version`: explicit versioning (2.0)
- `id`: unique message identifier with pattern validation
- `timestamp`: ISO 8601
- `source`: channel, sender_id, sender_name, message_id (for deduplication)
- `command`: raw command text
- `priority`: enum (critical, high, normal, low)
- `classification`: optional pre-classification
- `thread`: thread_id, is_followup, parent_id
- `reply_to`: channel and target for response routing
- `status`: state machine (pending, in_progress, processed, failed)
- `metadata`: channel-specific data

The outbox schema (Section 7.2) includes:

- `id`: reply identifier
- `in_reply_to`: links to inbox message
- `channel`: delivery target
- `target`: sender_id and chat_id
- `content`: type (ack, progress, agent_switch, tool_use, error, final), message, agent, tool, expects_reply
- `status`: delivery state (pending, sending, sent, failed)

This is a significant improvement over the gateway architecture's inbox format (Section 9.1), which was version 1.0 and tightly coupled to WhatsApp.

### V6.2: Deduplication Mechanism

**Verdict: PASS**

The `source.message_id` field prevents duplicate processing. The InboxWatcher maintains an in-memory set of recently seen message IDs (last 1000). On startup, it scans `in_progress/` and `processed/` (last 24h) to rebuild the set.

This addresses my finding from the gateway audit: "No deduplication (correlation_id missing)."

The 1000-message window and 24-hour scan window are reasonable for the expected message volume (single user, low throughput).

### V6.3: Outbox Message Ordering

**Verdict: CONCERNS**

Open Question #8 asks: "For a single command, the StreamProcessor may write many outbox files. Are they guaranteed to be processed in order?"

The mitigation is: "Use timestamp-based file naming (epoch milliseconds, not seconds). Bridges sort by timestamp before sending."

**Issue:** The file naming convention in Section 7.4 uses epoch SECONDS, not milliseconds:

```
reply-1709290805-telegram-a3f2.json
```

If the StreamProcessor writes multiple outbox files within the same second (likely for rapid progress messages during a delegation chain), they will have the same timestamp prefix. The bridge cannot sort them correctly.

**Recommendation:** Change file naming to use epoch milliseconds or add a sequence number:

```
reply-1709290805123-telegram-a3f2.json     # milliseconds
reply-1709290805-001-telegram-a3f2.json    # sequence number
```

### V6.4: Priority Queue Behavior

**Verdict: CONCERNS**

The inbox schema includes a `priority` field with values: critical, high, normal, low. The architecture states the queue is FIFO. These are contradictory: FIFO does not respect priority.

Section 12.3 of the gateway architecture chose "single directory with priority field in JSON. The inbox processor sorts by priority when processing." But the Session Daemon CommandQueue is described as strictly FIFO (Section 4.4): "msg2 NEVER starts until msg1 stream completes."

**Question:** Does the CommandQueue sort by priority on enqueue? Or does it process strictly in arrival order? If strictly FIFO, the priority field is decorative and misleading. If sorted by priority, the FIFO guarantee is weakened.

**Recommendation:** Clarify one of:
(a) FIFO with priority: dequeue selects the highest-priority pending command (priority queue, not FIFO).
(b) Strict FIFO: process in order of arrival, ignore priority field. Priority is informational only.

For Phase 0 with low message volume, strict FIFO is simpler and sufficient. Document that priority is informational and reserved for future phases.

---

## 7. V2 API Instability Risk

### V7.1: Adapter Pattern

**Verdict: PASS**

The thin adapter pattern (Section 3.6) isolates V2 instability:

```typescript
interface SessionAdapter {
  createSession(opts: SessionConfig): Promise<ManagedSession>;
  resumeSession(id: string, opts: SessionConfig): Promise<ManagedSession>;
}
```

If the V2 API changes, only `session-adapter.ts` changes. The rest of the daemon (InboxWatcher, CommandQueue, StreamProcessor, OutboxWriter, HealthMonitor) is isolated.

### V7.2: V1 Fallback

**Verdict: CONCERNS**

The architecture claims: "The V1 `query()` with `resume` option provides the same functionality with a different API shape."

**Assessment:** The V1 `query()` function is a one-shot request/response. It supports `resume: sessionId` for session continuity, but it does not provide a streaming interface. The V2 `session.stream()` yields real-time `SDKMessage` objects during processing. If the fallback is V1 `query()`, the daemon loses:

- Real-time progress messages (only gets final result)
- Agent switch detection during processing
- Tool use observation during processing

This degrades the observability value. The daemon would still function (commands process, results return) but the StreamProcessor would only see the final result, not intermediate events.

**Recommendation:** Document this degradation explicitly. If V2 breaks and V1 fallback activates, the outbox produces only `final` messages, not `progress`/`agent_switch`/`tool_use`. Channel bridges must handle this gracefully (no progress updates, just final result).

---

## 8. Authorization

### V8.1: Sender Allowlist

**Verdict: PASS**

The authorization config (Section 12.2) defines an explicit allowlist of allowed senders per channel. Unknown senders are rejected and logged. This addresses my previous finding: "Can an unauthorized user write to inbox?"

The allowlist approach is correct:
- Telegram: `${TELEGRAM_OWNER_ID}` (Lucas)
- WhatsApp: `+5528999301848` (Lucas)
- CLI: `system` (automated scripts)
- systemd_timer: `system` (automated timers)

### V8.2: Filesystem Permission Model

**Verdict: CONCERNS**

Inbox directory permissions: `drwxrwx--- ubuntu ubuntu`. The document states "Only `ubuntu` user and processes running as `ubuntu` can write."

**Issue:** OpenClaw runs as root. Root can write to any directory regardless of permissions. The architecture notes "OpenClaw runs as root but writes via `su - ubuntu`." This is correct for the current setup, but the permission model does not actually prevent root processes from writing.

However, the InboxWatcher validates `source.sender_id` against the allowlist. This is the real access control, not filesystem permissions. A rogue root process could write a JSON file, but the daemon would reject it if the sender_id is not in the allowlist.

**Residual risk:** The rogue root process could spoof a valid sender_id. On a single-user machine with root access limited to known services (OpenClaw, systemd), this is an acceptable risk for Phase 0.

### V8.3: Command Injection Prevention

**Verdict: PASS**

The document explicitly states: "The daemon NEVER executes inbox content as shell commands. All commands are passed as strings to `session.send()`." The SDK handles the command within the Claude Code session, where deny rules and sandboxing apply.

This is correct. The `session.send()` interface treats the input as a user message, not a shell command. Any dangerous operations would be subject to Claude Code's own permission model and AIOS deny rules.

---

## 9. Open Questions Honesty Audit

The architecture contains 10 open questions with classifications: MITIGATED (4), NEEDS TESTING (3), NEEDS RESEARCH (1), NEEDS VERIFICATION (1), DEFERRED (1).

### V9.1: MITIGATED Classifications

**Verdict: PASS (with caveats)**

| # | Question | Classification | My Assessment |
|---|----------|---------------|---------------|
| 1 | V2 API stability | MITIGATED | Agree. Adapter pattern + V1 fallback is genuine mitigation. |
| 7 | Outbox consumption race | MITIGATED | Agree. Channel field filtering prevents cross-bridge consumption. |
| 8 | Message ordering in outbox | MITIGATED | Partially agree. File naming uses seconds not milliseconds (see V6.3). |

Question 8's mitigation is incomplete (seconds vs. milliseconds), but the classification is not dishonest -- it is an oversight.

### V9.2: NEEDS TESTING/RESEARCH/VERIFICATION Classifications

**Verdict: CONCERNS**

| # | Question | Classification | Severity |
|---|----------|---------------|----------|
| 2 | Session index bug | NEEDS TESTING | HIGH -- crash recovery depends on this |
| 3 | Context window size | NEEDS RESEARCH | MEDIUM -- affects session lifetime |
| 4 | Concurrent API usage | NEEDS TESTING | LOW -- can be tested empirically |
| 5 | CLAUDE.md loading | NEEDS TESTING | CRITICAL -- architecture validity depends on this |
| 6 | Deny rules in SDK | NEEDS VERIFICATION | HIGH -- security depends on this |
| 10 | SDK subprocess memory | NEEDS MONITORING | MEDIUM -- affects long-term stability |

Three of these are load-bearing assumptions (#2, #5, #6). The architecture is honest about not knowing the answers, which is commendable. But building on unverified assumptions is risky.

**Recommendation:** Create a "Pre-Implementation Verification Script" story (Story 0) that tests questions #2, #5, and #6 before any implementation begins. This is a 2-4 hour task, not a multi-day story.

### V9.3: DEFERRED Classification

**Verdict: CONCERNS**

Question #9: "Interactive approval flows. If an agent needs user approval, the SDK session blocks. The daemon uses `bypassPermissions`, which auto-approves all operations."

This is classified as "DEFERRED (Phase 2)." But the daemon runs with `bypassPermissions` in Phase 0, meaning ALL operations are auto-approved: file writes, bash commands, git operations, everything.

**Risk:** A malformed inbox command like "Delete everything in the project" would be executed without any safety net. The deny rules mitigate some of this (can't push to remote, can't modify framework files), but destructive bash commands are not blocked by deny rules.

**Assessment:** For Phase 0, with a single user (Lucas) and controlled access, this is acceptable. But the `canUseTool` callback mechanism described for Phase 2 should be prioritized, not deferred indefinitely. At minimum, a `Bash` command allowlist would prevent catastrophic damage.

---

## 10. Structural Process Audit

### V10.1: Does the Architecture Solve What It Claims to Solve?

**Verdict: PASS**

The document explicitly references my previous validation findings and maps solutions:

| My Previous Finding | How This Addresses It |
|--------------------|----------------------|
| `claude --print` is STATELESS | SDK V2 persistent sessions |
| No bridge service | Session Daemon as the bridge foundation |
| No queue | CommandQueue (FIFO, sequential) |
| No watchdog | HealthMonitor + systemd watchdog |
| Multi-channel MUST share single queue | Single inbox/outbox for all channels |
| Start with single bot | Phase 0 is channel-agnostic (no Telegram yet) |

This is the correct approach: solve the foundation before building the bridge.

### V10.2: Unidirectional Flow

**Verdict: PASS**

The flow is strictly unidirectional:

```
External Producer -> inbox/pending/ -> InboxWatcher -> CommandQueue ->
SessionAdapter -> StreamProcessor -> OutboxWriter -> outbox/pending/ -> External Consumer
```

There are no cycles. The CommandQueue processes one command at a time. Files move forward through states (pending -> in_progress -> processed/failed). No step feeds back to a previous step.

### V10.3: Can the Executor Skip Steps?

**Verdict: FAIL -- Missing filesystem atomicity**

The InboxWatcher moves files between directories (pending -> in_progress -> processed/failed) as the command progresses. But there is no atomic rename guarantee specified.

**Scenario:** The daemon crashes BETWEEN reading a file from `pending/` and moving it to `in_progress/`. On restart:

1. The file is still in `pending/`
2. No record exists in `queue.json` (not written yet)
3. The file is processed again (duplicate execution)

OR:

1. The daemon moves the file to `in_progress/`
2. The daemon crashes before enqueuing the command
3. On restart, the file is in `in_progress/` but not in `queue.json`
4. The daemon must decide: is this file being processed or abandoned?

The architecture does not specify the order of operations for the pickup sequence, nor does it specify a locking mechanism.

**Recommendation:** Specify the exact pickup sequence:
1. Read file from `pending/`
2. Write entry to `queue.json` with status "pending"
3. Move file to `in_progress/` (atomic rename on same filesystem)
4. If daemon crashes between steps 1 and 3: file stays in `pending/`, re-processed on restart (safe because deduplication catches it via `source.message_id`)

With deduplication (V6.2), the double-processing scenario is caught. But the in_progress ambiguity (is this file abandoned or active?) needs a resolution strategy:

**On startup:** Scan `in_progress/`. For each file, check `queue.json`. If the file's ID is in `queue.json.current`, attempt to resume the command. If not in `queue.json`, move the file back to `pending/` for reprocessing.

### V10.4: Component Boundaries

**Verdict: PASS**

Each component has a clear responsibility:

| Component | Does | Does NOT |
|-----------|------|----------|
| InboxWatcher | Watch, validate, enqueue | Classify messages |
| CommandQueue | Order, serialize | Execute commands |
| SessionAdapter | Create/resume sessions, send/stream | Route output |
| StreamProcessor | Parse SDK messages, detect events | Deliver to channels |
| OutboxWriter | Write response files | Deliver messages |
| HealthMonitor | Track state, write health file | Make recovery decisions |

The "Does NOT" column is as important as the "Does" column. Each component has explicit boundaries that prevent scope creep.

### V10.5: Implementation Plan Quality

**Verdict: PASS**

The 5-story implementation plan is well-structured:

- Story 1: Core Infrastructure (no SDK dependency)
- Story 2: Session Adapter + Queue (SDK integration)
- Story 3: Stream Processor (depends on Story 2)
- Story 4: Health + Recovery (depends on Story 2)
- Story 5: Integration + Deploy (depends on Stories 3, 4)

Stories 3 and 4 are independent and can be parallelized. The dependency chain is correct. Each story has concrete acceptance criteria with checkboxes.

The estimated 9-11 days is realistic for the scope.

---

## 11. Summary Matrix

| ID | Validation Point | Verdict | Severity | Notes |
|----|-----------------|---------|----------|-------|
| V1.1 | SDK Session Persistence | PASS | -- | Core mechanism is sound |
| V1.2 | AIOS Context Loading | FAIL | CRITICAL | Untested: does settingSources load CLAUDE.md? |
| V1.3 | Multi-Turn Context | PASS | -- | send() accumulates context correctly |
| V2.1 | Delegation Chain | PASS | -- | Flow B demonstrates full chain |
| V2.2 | Agent Switch Detection | CONCERNS | MEDIUM | Heuristic-based, not deterministic |
| V2.3 | Cross-Channel Context | PASS | -- | Single session for all channels |
| V3.1 | FIFO Queue | PASS | -- | Sequential processing guaranteed |
| V3.2 | Inbox Write Race | CONCERNS | LOW | 5s polling gap acceptable, but specify full scan |
| V3.3 | Queue Overflow | CONCERNS | MEDIUM | max_size=50 but no overflow behavior defined |
| V4.1 | SDK Crash Recovery | PASS | -- | Comprehensive failure mode table |
| V4.2 | resumeSession() Bug | FAIL | HIGH | Known bug acknowledged but not resolved |
| V4.3 | Recovery Data | PASS | -- | session.json + queue.json + in_progress/ |
| V4.4 | Retry Idempotency | CONCERNS | MEDIUM | Retries may re-execute partial work |
| V5.1 | Interactive Priority | PASS | -- | CLI First respected |
| V5.2 | Git State Conflicts | CONCERNS | MEDIUM | Advisory only, no prevention mechanism |
| V5.3 | RAM Budget | CONCERNS | MEDIUM | MemoryMax scope unclear, subprocess growth unknown |
| V5.4 | API Rate Limits | CONCERNS | LOW | Sequential processing minimizes risk |
| V6.1 | Schema Completeness | PASS | -- | Comprehensive, channel-agnostic |
| V6.2 | Deduplication | PASS | -- | message_id + in-memory set + startup rebuild |
| V6.3 | Outbox Ordering | CONCERNS | LOW | Epoch seconds, not milliseconds |
| V6.4 | Priority vs FIFO | CONCERNS | LOW | Priority field exists but queue is FIFO |
| V7.1 | Adapter Pattern | PASS | -- | Clean isolation of V2 instability |
| V7.2 | V1 Fallback Degradation | CONCERNS | MEDIUM | Loses real-time streaming, only final results |
| V8.1 | Sender Allowlist | PASS | -- | Explicit, per-channel |
| V8.2 | Filesystem Permissions | CONCERNS | LOW | Root bypass, but allowlist is the real control |
| V8.3 | Command Injection | PASS | -- | session.send() is not shell execution |
| V9.3 | bypassPermissions Safety | CONCERNS | MEDIUM | No safety net for destructive commands |
| V10.1 | Solves Claimed Problem | PASS | -- | Maps directly to previous showstoppers |
| V10.2 | Unidirectional Flow | PASS | -- | No cycles, strict forward progression |
| V10.3 | Filesystem Atomicity | FAIL | MEDIUM | No atomic pickup sequence specified |
| V10.4 | Component Boundaries | PASS | -- | Clear responsibilities with explicit exclusions |
| V10.5 | Implementation Plan | PASS | -- | 5 stories, correct dependencies, realistic estimates |

**Totals: 10 PASS, 12 CONCERNS, 3 FAIL**

---

## 12. Recommendations

### R0: Pre-Implementation Verification (BLOCKING)

**Before any implementation begins, execute a verification script that answers Open Questions #2, #5, and #6.**

```javascript
// verification-script.js -- Run BEFORE starting Story 1
const { unstable_v2_createSession } = require('@anthropic-ai/claude-agent-sdk');

async function verify() {
  // Q5: Does settingSources load CLAUDE.md?
  const session = unstable_v2_createSession({
    model: "claude-sonnet-4-5-20250929", // Use cheaper model for testing
    cwd: "/home/ubuntu/aios-core",
    settingSources: ["user", "project", "local"],
    systemPrompt: { type: "preset", preset: "claude_code" },
    permissionMode: "bypassPermissions",
  });

  await session.send("What agents are available? List them from CLAUDE.md.");
  // If it lists @dev, @qa, @architect, etc. -> CLAUDE.md is loaded
  // If it says "I don't have that information" -> CLAUDE.md NOT loaded

  // Q2: Does resumeSession work?
  const sessionId = session.sessionId;
  session.close();
  const resumed = unstable_v2_resumeSession(sessionId, { /* same opts */ });
  await resumed.send("What was my previous question?");
  // If it remembers -> resumeSession works
  // If it doesn't -> sessions-index.json bug is present

  // Q6: Are deny rules enforced with bypassPermissions?
  await resumed.send("Read the file .aios-core/constitution.md");
  // If it reads -> deny rules NOT enforced (constitution.md is in L1)
  // If it refuses -> deny rules ARE enforced
}
```

**This is a 2-4 hour task. It must complete before Story 1 begins.**

### R1: Specify Filesystem Atomicity

Define the exact pickup sequence in Story 1:
1. Scan `pending/` directory
2. For each file, check deduplication set
3. If not duplicate, write entry to `queue.json`
4. Rename file from `pending/` to `in_progress/` (atomic on same filesystem)
5. On startup: scan `in_progress/`, cross-reference with `queue.json`, re-enqueue orphaned files

### R2: Use Millisecond Timestamps in File Naming

Change outbox file naming from:
```
reply-1709290805-telegram-a3f2.json
```
To:
```
reply-1709290805123-telegram-a3f2.json
```

This ensures ordering of multiple outbox files generated within the same second.

### R3: Define Queue Overflow Behavior

Add to daemon config:
```yaml
queue:
  max_size: 50
  overflow_behavior: "reject"  # reject | backpressure
```

On overflow, move the inbox file to `failed/` with error reason `queue_full` and write an outbox message notifying the sender.

### R4: Add Retry Context

When retrying a failed command, prepend to the `session.send()` call:
```
"[SYSTEM NOTE: This is retry {n} of command '{id}'. The previous attempt may have partially executed. Check git status and recent file modifications before proceeding.]\n\n{original_command}"
```

### R5: Document V1 Fallback Degradation

Add a section to the architecture document explaining what channel bridges should expect when V2 fails and V1 fallback activates:
- No `progress` outbox messages during processing
- No `agent_switch` outbox messages
- No `tool_use` outbox messages
- Only `final` outbox message on completion
- Channel bridges should display "Processing..." placeholder instead of real-time updates

### R6: Add SDK Subprocess Memory Monitoring

In Story 4 (Health Monitor), add:
- Track RSS of the SDK child process via `/proc/{pid}/status`
- Write `sdk_subprocess_rss_mb` to `health.json`
- If RSS exceeds threshold (configurable, default 800MB), write warning to outbox
- If RSS exceeds critical threshold (configurable, default 1200MB), trigger session restart

### R7: Specify InboxWatcher Scan Mode

In Story 1 (InboxWatcher), specify:
- On `fs.watch()` trigger, perform a full `readdir()` of `pending/`
- Do NOT process individual file events (they can be coalesced or lost)
- This makes the watcher idempotent and immune to OS-level event quirks

---

## Final Assessment

This architecture represents a significant maturation from the previous Telegram Observability proposal. The core insight -- use the Claude Agent SDK instead of terminal wrapping -- is correct and eliminates the primary class of problems I identified previously. The document is honest about what it does not know, which is a process quality signal.

The 3 FAILs are all verifiable before implementation begins:

| FAIL | Resolution Path | Effort |
|------|----------------|--------|
| V1.2: CLAUDE.md loading | Test with SDK (R0) | 2 hours |
| V4.2: resumeSession() bug | Test with SDK (R0) | 1 hour |
| V10.3: Filesystem atomicity | Specify pickup sequence (R1) | 30 minutes |

If R0 confirms that `settingSources` loads CLAUDE.md and `resumeSession()` works, all three FAILs are resolved and the architecture graduates to PASS (with CONCERNS).

**Conditional verdict: If R0 passes, architecture is APPROVED for implementation.**

---

*Validation by @pedro-valerio -- Process Absolutist.*
*"Se executor CONSEGUE fazer errado, processo esta errado."*
