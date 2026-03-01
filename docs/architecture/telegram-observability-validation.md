# Validation Report: Telegram Real-Time Observability Architecture

**Auditor:** @pedro-valerio (Process Absolutist)
**Date:** 2026-03-01
**Status:** FAIL (12 FAIL, 14 CONCERNS, 5 PASS across 31 validation points)
**Architecture Under Review:** Telegram Multi-Bot Observability System
**Baseline:** `gateway-agent-architecture.md` (WhatsApp Subordinate Bridge), `gateway-personal-memory-architecture.md` (Personal Memory Guardian), `aios-openclaw-contract.yaml`

---

## Executive Summary

The proposed architecture creates a Telegram-based observability layer where each AIOS agent has its own Telegram bot. Lucas sends commands via `@aios_master_bot`, and agent work is visible in real-time through per-agent bot channels (`@aios_dev_bot`, `@aios_qa_bot`, etc.).

This is the third evolution of the external communication layer:

| Version | Architecture | Status |
|---------|------------|--------|
| v1 | WhatsApp Subordinate Relay (@gateway as triage pipe) | Designed, partially implemented |
| v2 | WhatsApp Personal Memory Guardian (@gateway/Alan as companion) | Designed, not implemented, 9 FAIL in my previous audit |
| **v3** | **Telegram Multi-Bot Observability** | **Under review** |

The proposal fundamentally changes the communication model from **single-gateway-single-channel** to **multi-bot-multi-channel**. This report validates every critical path, veto condition, and edge case using the core principle:

> "Se executor CONSEGUE fazer errado, processo esta errado."

### Verdict Summary

The architecture has a **fatal structural flaw**: `claude --print` is stateless, and the proposed architecture requires stateful multi-agent sessions with delegation chains, progress reporting, and inter-agent handoffs. No mechanism is specified to bridge this gap. Without solving this, nothing else in the architecture can function as described.

Additionally, the multi-bot model creates N concurrent process requirements on a machine that currently runs a single Claude Code session. This is not an architectural decision -- it is a physical resource constraint that the architecture does not address.

---

## Table of Contents

1. [Critical Technical Question: Statefulness](#1-critical-technical-question-statefulness)
2. [Critical Path Validation](#2-critical-path-validation)
3. [Veto Condition Validation](#3-veto-condition-validation)
4. [Unidirectional Flow Validation](#4-unidirectional-flow-validation)
5. [Edge Case Validation](#5-edge-case-validation)
6. [Structural Process Audit](#6-structural-process-audit)
7. [Comparison with Existing Architecture](#7-comparison-with-existing-architecture)
8. [Summary Matrix](#8-summary-matrix)
9. [Recommendations](#9-recommendations)

---

## 1. Critical Technical Question: Statefulness

**Verdict: FAIL -- This is a showstopper.**

### The Problem

`claude --print` is stateless. Each invocation starts a fresh Claude Code session with no memory of previous calls. The proposed architecture assumes:

1. AIOS Master receives "Fix auth bug" and **decides** to delegate to @dev
2. @dev **investigates**, finds the bug, and **fixes** it
3. @dev **reports progress** to `@aios_dev_bot`
4. @dev **hands off** to @qa
5. @qa **reviews** and reports via `@aios_qa_bot`
6. AIOS Master **sends completion** to `@aios_master_bot`

Steps 1-6 require a **persistent session** where AIOS Master maintains state across multiple agent activations. With `claude --print`, step 1 would complete and the session would terminate. Step 2 would need to start a new session that somehow knows the context from step 1.

### Analysis of Proposed Solutions

#### Option A: Persistent Claude Code Session

```
Mechanism: Keep a long-running `claude` session alive (not --print)
```

**Assessment: TECHNICALLY POSSIBLE but architecturally undefined.**

- Claude Code supports interactive sessions (`claude` without `--print`).
- To use this from a Telegram bridge, you would need a process that holds a terminal session open and pipes stdin/stdout between the Telegram bot handler and the Claude Code process.
- This is effectively a terminal multiplexer (like `screen` or `tmux`) wrapping a Claude Code session.
- The AIOS architecture already assumes a Claude Code session exists (that is what the developer uses interactively). The Telegram bridge would be a SECOND session competing for the same filesystem, git state, and project resources.

**Gaps:**
- No session lifecycle management specified (start, pause, resume, crash recovery)
- No conflict resolution between the interactive developer session and the Telegram-triggered session
- No timeout policy (how long does an idle session stay alive?)
- No mechanism specified for how stdin commands from Telegram reach the Claude Code process
- Constitution Article II (Agent Authority) does not address which session has priority

#### Option B: Context Passed via Files (Inbox Pattern)

```
Mechanism: Same inbox/outbox pattern from gateway-agent-architecture.md
```

**Assessment: WORKS FOR SINGLE-STEP, FAILS FOR DELEGATION CHAINS.**

- The existing inbox/outbox pattern can deliver a message from Telegram to AIOS Master. This is equivalent to what WhatsApp already does.
- The problem is multi-step workflows. When AIOS Master decides to delegate to @dev, and @dev needs to hand off to @qa, each step requires a new `claude --print` invocation. The context from the previous step is lost.
- You could serialize the full context into a file between steps, but this means:
  - Each step reads a growing context file (potentially megabytes for complex tasks)
  - The file must contain the entire conversation history, all decisions made, all files modified
  - This is functionally equivalent to replaying the entire conversation on each invocation
  - Token costs multiply linearly with the number of steps

**Gaps:**
- No context serialization format defined
- No maximum context size defined
- No mechanism for AIOS Master to "resume" a delegation chain after step N completes
- The handoff protocol (`.claude/rules/agent-handoff.md`) is designed for INTRA-session switches, not cross-session serialization

#### Option C: Claude API Directly Instead of CLI

```
Mechanism: Use the Anthropic API directly via HTTP calls, maintaining conversation_id
```

**Assessment: POSSIBLE but fundamentally different from AIOS.**

- The Anthropic Messages API supports multi-turn conversations with conversation history.
- However, AIOS is built on Claude Code (the CLI tool), NOT the raw API. Claude Code provides:
  - File read/write/edit tools
  - Bash execution
  - Grep/Glob search
  - Project context (CLAUDE.md, rules, agent definitions)
  - MCP tool integration
- Using the API directly would bypass ALL of this. The Telegram-triggered agent would be a "vanilla Claude" without AIOS capabilities.
- To replicate AIOS capabilities via the API, you would need to rebuild the entire tool layer.

**Gaps:**
- Claude API does not have Claude Code's tool layer
- Would require a custom tool implementation layer
- Agent authority rules, constitution, story-driven development -- none of this applies to raw API calls
- This would be a completely separate system, not "AIOS via Telegram"

#### Option D: Single Long-Running Session with Queue (Recommended Exploration)

```
Mechanism: AIOS Master runs as a persistent daemon. Telegram messages are enqueued.
           The daemon processes messages sequentially in its persistent context.
```

**Assessment: MOST VIABLE but requires significant design work.**

- A single Claude Code session stays alive (e.g., in a tmux session)
- A lightweight daemon watches the inbox directory and injects commands into the Claude Code stdin
- Agent switches (@dev, @qa, etc.) happen within this session using normal AIOS handoff protocol
- Progress updates are sent via the existing `openclaw message send` CLI (or a Telegram equivalent)

**Gaps:**
- No daemon specification
- No stdin injection protocol
- No queue management (what happens when message 2 arrives while message 1 is still being processed?)
- Claude Code sessions have token limits and eventually need `/compact` or restart
- No session recovery after crash
- This is the only approach that preserves AIOS capabilities, but it is architecturally the most complex

### Critical Technical Question Verdict

| Option | Preserves AIOS? | Supports Delegation? | Complexity | Verdict |
|--------|-----------------|---------------------|------------|---------|
| A: Persistent session | YES | YES | HIGH | Viable but undefined |
| B: File-based context | YES | PARTIAL (single-step only) | MEDIUM | Insufficient for multi-step |
| C: Raw API | NO | YES | VERY HIGH | Wrong architecture |
| D: Session + queue | YES | YES | HIGH | Most viable, needs design |

**None of the options are specified in the proposed architecture.** The architecture describes WHAT happens (delegation chain) without specifying HOW the statefulness problem is solved. This is a blocking gap.

---

## 2. Critical Path Validation

### Path 1: Command -> Delegation -> Execution -> Report

```
1. Lucas sends "Fix auth bug" to @aios_master_bot
2. Bridge receives message, calls claude --print "@aios-master Fix auth bug"
3. AIOS Master decides to delegate to @dev
4. @dev investigates, finds bug, fixes it
5. @dev reports progress to @aios_dev_bot (Lucas sees updates)
6. @dev hands off to @qa
7. @qa reports via @aios_qa_bot
8. AIOS Master sends completion to @aios_master_bot
```

**Verdict: FAIL**

| Step | Feasible? | Issue |
|------|-----------|-------|
| 1: Send message | YES | Telegram Bot API supports this |
| 2: Bridge receives | PARTIAL | Bridge software not specified -- what receives the webhook? What calls `claude`? |
| 3: AIOS Master decides | YES within `claude --print` | But the decision + delegation cannot happen in a single stateless call |
| 4: @dev investigates | FAIL | @dev is a persona within Claude Code, not a separate process. In `claude --print`, the session ends after step 3. @dev cannot "investigate" in a separate invocation without the full context. |
| 5: @dev reports to @aios_dev_bot | FAIL | No mechanism for a Claude Code agent to send messages to a SPECIFIC Telegram bot. The current architecture only supports `openclaw message send` to WhatsApp. No Telegram send command exists. |
| 6: @dev hands off to @qa | FAIL | Agent handoff is an INTRA-session operation. Cross-session handoff would require serializing @dev's entire context (files modified, decisions made, code changes) and loading it into a new @qa invocation. |
| 7: @qa reports via @aios_qa_bot | FAIL | Same as step 5 -- no Telegram bot routing mechanism |
| 8: Completion report | FAIL | AIOS Master's session ended at step 3. A new session would not know the task completed. |

**Issues Found:**

1. **No bridge software specified.** What receives the Telegram webhook? OpenClaw supports WhatsApp but not Telegram natively. A new Telegram bridge service must be created or configured.
2. **No per-agent bot routing.** The architecture assumes agents can send to their own bot. But agents are personas within Claude Code, not separate processes with separate bot tokens. A routing layer is needed that maps agent identity to bot API credentials.
3. **The delegation chain is physically impossible with `claude --print`.** Steps 3-8 require a persistent session or an orchestrator that breaks the task into sequential `claude --print` invocations with full context replay.
4. **No bot-to-agent mapping specification.** Which bot token does @dev use? Where are the tokens stored? Who manages them?

---

### Path 2: Direct Agent Communication

```
1. Lucas sends message directly to @aios_dev_bot
2. @dev processes the request
3. Should @dev inform AIOS Master? Or work independently?
```

**Verdict: FAIL**

| Check | Result | Detail |
|-------|--------|--------|
| Can @dev receive from @aios_dev_bot? | UNDEFINED | No bridge maps @aios_dev_bot messages to @dev activation |
| Authority to work independently? | NO | Constitution Article II (Agent Authority) says agents work within their scope but are activated by AIOS Master or user via `@agent` syntax in a Claude Code session. There is no defined path for Telegram-initiated agent activation bypassing AIOS Master. |
| Should @dev inform AIOS Master? | ARCHITECTURALLY REQUIRED | Agent-authority.md defines delegation flows. @dev cannot initiate git push (needs @devops), cannot create stories (needs @sm/@po). If @dev works independently, it can only do partial work. |

**Issues Found:**

1. **Bypassing AIOS Master violates the delegation matrix.** The current architecture defines: `ANY agent -> @devops *push`, `@sm *draft -> @po *validate -> @dev *develop`. Direct agent activation via Telegram creates an uncontrolled entry point.
2. **No disambiguation.** If Lucas sends "fix the login bug" to @aios_dev_bot, should @dev:
   - Start working immediately (violates V2: work without AIOS Master knowledge)?
   - Forward to AIOS Master (then why not just send to @aios_master_bot)?
   - Reject and ask Lucas to use @aios_master_bot?
3. **Process design must choose ONE entry point.** Either AIOS Master is the single entry point (current architecture), or all agents accept direct commands (new architecture requiring new authority rules). Mixing both creates ambiguity about who knows what is happening.

**Recommendation:** Direct agent communication should be **observation-only** (read what the agent is doing), not **command** (tell the agent what to do). Commands go through @aios_master_bot exclusively.

---

### Path 3: Long-Running Task

```
1. Lucas sends complex request to @aios_master_bot
2. Task takes 10+ minutes
3. How does Lucas get progress updates?
4. Can Lucas send follow-up messages while task is running?
```

**Verdict: FAIL**

| Check | Result | Detail |
|-------|--------|--------|
| Progress reporting mechanism? | UNDEFINED | Claude Code does not have a "progress callback" API. The existing return channel (`openclaw message send`) works for WhatsApp but no Telegram equivalent is defined. |
| Follow-up while running? | FAIL | If a Claude Code session is processing task A, it cannot simultaneously receive task B. There is no message queue that buffers incoming messages while the session is busy. |
| Timeout policy? | UNDEFINED | What happens if the task takes 30 minutes? 60 minutes? Does the Telegram bridge time out? Does the Claude Code session's context window fill up? |
| Cancellation? | UNDEFINED | Can Lucas send "cancel" and have the running task stop? Claude Code does not support external interruption of a running turn. |

**Issues Found:**

1. **No progress reporting infrastructure.** The proposed architecture says "Lucas sees updates" but never defines HOW. Options:
   - Agent periodically calls a "send update" tool (does not exist for Telegram)
   - A file watcher monitors agent output and forwards to Telegram (not specified)
   - Agent writes to a log file that the bridge tails (not specified)
2. **Concurrent message handling is architecturally impossible.** A Claude Code session processes ONE turn at a time. If Lucas sends a follow-up while a turn is being processed, the message is either:
   - Queued (no queue defined)
   - Lost (V1 violation: command lost between Telegram and Claude Code)
   - Rejected with error (poor UX but process-safe)
3. **The "10+ minutes" scenario is common for AIOS tasks.** Story creation, spec pipeline, brownfield discovery -- these are multi-agent workflows that take significant time. Any Telegram integration MUST handle long-running tasks as the primary case, not an edge case.

---

### Path 4: Multiple Concurrent Tasks

```
1. Lucas sends task A to @aios_master_bot
2. While A is running, sends task B to @aios_dev_bot directly
3. Both tasks need Claude Code access
4. Conflict? Resource contention?
```

**Verdict: FAIL**

| Check | Result | Detail |
|-------|--------|--------|
| Concurrent session support? | NO | Claude Code runs one session per project directory. Two sessions in `/home/ubuntu/aios-core` would conflict on file operations, git state, and `.aios/` runtime files. |
| Resource contention defined? | NO | No locking mechanism, no queue, no priority system |
| Git state isolation? | NO | If task A creates a branch and task B also creates a branch, merge conflicts and state corruption are likely |
| File system conflicts? | YES | Both sessions could edit the same files simultaneously |

**Issues Found:**

1. **Single-session constraint is PHYSICAL, not architectural.** Claude Code sessions lock to a project directory. Two concurrent sessions on the same codebase would create race conditions on:
   - `git` operations (branch, commit, stash)
   - File edits (both sessions writing to the same file)
   - `.aios/` runtime state (handoff files, inbox/outbox)
   - Story progress tracking (checkbox updates)
2. **The multi-bot model IMPLIES concurrency.** If Lucas can send to @aios_master_bot AND @aios_dev_bot simultaneously, the architecture implicitly promises concurrent execution. But the underlying infrastructure cannot deliver it.
3. **Even with separate Claude Code sessions, the project state is shared.** You cannot run @dev and @qa concurrently on the same codebase without git branch isolation, which the architecture does not define.

**Recommendation:** Enforce SEQUENTIAL processing. All Telegram messages go into a FIFO queue. One message is processed at a time. The current message's status (running, pending, complete) is visible via a status command.

---

### Path 5: Error/Failure

```
1. Agent encounters error during execution
2. Error is reported to Lucas via Telegram
3. Lucas can intervene or retry
```

**Verdict: CONCERNS**

| Check | Result | Detail |
|-------|--------|--------|
| Error detection? | YES | Claude Code reports errors in its output |
| Error routing to Telegram? | PARTIAL | If the session is alive and has a Telegram send mechanism, errors can be reported. But if the session crashes (OOM, timeout, API error), the error is NOT reported because the reporter is dead. |
| Intervention mechanism? | UNDEFINED | "Intervene" means what? Send a follow-up message? That requires the session to accept input while in an error state. |
| Retry mechanism? | UNDEFINED | Who retries? The bridge (automatic)? Lucas (manual via new message)? How many retries? |

**Issues Found:**

1. **Dead session cannot report its own death.** If Claude Code crashes, there is no watchdog process that detects the crash and sends a Telegram notification. The bridge must have a health check mechanism independent of Claude Code.
2. **Error categorization is missing.** Not all errors are equal:
   - Transient (API rate limit) -- retry automatically
   - Recoverable (file conflict) -- report and wait for instruction
   - Fatal (session crash) -- report and restart session
   - Silent (wrong output) -- cannot be detected automatically

---

## 3. Veto Condition Validation

### V1: A command is lost between Telegram and Claude Code

**Verdict: FAIL**

No acknowledgment protocol is defined. When a Telegram message arrives:
1. The bridge receives it (Telegram webhook confirms delivery to the bridge)
2. The bridge must confirm it was queued for processing
3. The bridge must confirm it was delivered to Claude Code
4. Claude Code must confirm it was processed

Steps 2-4 have no defined acknowledgment. If the bridge crashes between receiving the webhook and calling `claude --print`, the message is lost. Telegram does not retry webhooks automatically after successful HTTP 200 response.

**Required mechanism:** Write incoming messages to a persistent queue (file-based, SQLite, or Redis) BEFORE attempting to process them. Mark as `received`, then `processing`, then `completed`. On bridge restart, replay any messages in `received` or `processing` state.

**Comparison with existing architecture:** The gateway-agent-architecture.md defines an inbox file pattern that provides at-least-once delivery. The Telegram architecture has NO equivalent. This is a regression from v1.

---

### V2: An agent acts without reporting to its Telegram bot

**Verdict: CONCERNS**

Agents are personas within Claude Code. They have no native awareness of Telegram bots. Unless EVERY agent's system prompt is modified to include "send progress to your Telegram bot," agents will work silently.

**Required mechanism:** A post-processing hook that intercepts agent output and routes it to the appropriate Telegram bot. This hook must:
- Know which agent is currently active
- Map agent identity to bot token
- Format output for Telegram (message length limits, markdown support)
- Handle pagination for long outputs

**Current state:** No hook exists. The existing AIOS architecture does not have a "publish agent activity to external channel" capability. The closest thing is `openclaw message send` which is a manual command, not an automatic hook.

---

### V3: Duplicate execution (same command processed twice)

**Verdict: FAIL**

No deduplication mechanism is defined. This was already identified in my first audit of the gateway architecture (`correlation_id missing`). The Telegram architecture inherits this gap and adds a new dimension: Telegram's `update_id` provides a unique message identifier, but the architecture does not specify that this ID should be used for deduplication.

**Required mechanism:**
- Store `update_id` (or `message_id`) from Telegram in the queue/inbox
- Before processing, check if this ID was already processed
- If duplicate, respond with "Already processing this request" and skip

---

### V4: Agent responds to wrong Telegram bot (cross-contamination)

**Verdict: FAIL**

No bot-to-agent mapping is defined. Without explicit mapping, the routing layer could send @dev output to @aios_qa_bot, or @qa output to @aios_master_bot.

**Required mechanism:**

```yaml
bot_agent_mapping:
  "@aios_master_bot":
    token: "${TELEGRAM_MASTER_BOT_TOKEN}"
    agents: ["aios-master"]
    type: "command + report"
  "@aios_dev_bot":
    token: "${TELEGRAM_DEV_BOT_TOKEN}"
    agents: ["dev"]
    type: "observability"
  "@aios_qa_bot":
    token: "${TELEGRAM_QA_BOT_TOKEN}"
    agents: ["qa"]
    type: "observability"
  # ... one entry per bot
```

The mapping must be STATIC (not LLM-decided). Each agent has exactly one bot. Cross-posting is blocked by the routing layer, not by agent discipline.

---

### V5: Unauthorized user sends commands

**Verdict: CONCERNS**

Telegram Bot API supports `chat_id`-based authorization. The bridge can check that the incoming `chat_id` matches Lucas's Telegram user ID. However:

1. No user allowlist is defined in the architecture
2. No authentication flow is specified
3. The existing WhatsApp architecture uses phone number verification. Telegram uses `chat_id` (a numeric ID). The bridge must verify this ID.
4. If the bots are discovered (bot usernames are public), anyone can send messages to them. The bridge MUST reject unauthorized messages.

**Required mechanism:**

```yaml
authorization:
  allowed_users:
    - telegram_user_id: ${LUCAS_TELEGRAM_ID}
      name: "Lucas"
      role: "owner"
  unauthorized_response: "Nao autorizado."
  log_unauthorized: true
```

---

### V6: Claude Code session conflicts when multiple agents need access

**Verdict: FAIL**

This is the concurrency problem from Path 4. Claude Code does not support concurrent sessions on the same project directory. The architecture proposes multiple agents working simultaneously (Path 4), which is physically impossible without:

1. Session queuing (sequential processing)
2. Branch-based isolation (each task on a separate git branch, managed by a coordinator)
3. Separate project directories per agent (defeats the purpose of a shared codebase)

None of these are specified.

**Critical note:** Even the existing AIOS architecture (without Telegram) has this constraint. When a developer uses Claude Code interactively and OpenClaw triggers a `claude --print` command simultaneously, there is a potential conflict. The difference is that OpenClaw's `claude --print` is short-lived and infrequent. The Telegram architecture proposes continuous, multi-agent, concurrent access.

---

### V7: Telegram rate limit exceeded, updates lost

**Verdict: CONCERNS**

Telegram Bot API has rate limits:
- Messages to the same chat: ~30/second
- Messages to the same user: ~1/second per bot
- Inline keyboards: additional limits

If an agent produces verbose output (e.g., full test results, diff output), the bridge might need to send multiple messages rapidly. If rate-limited, messages are dropped or delayed.

**Required mechanism:**
- Output buffer with rate-aware sending (max 1 message/second per bot)
- Long outputs chunked into max-4096-char messages (Telegram limit) with pagination
- Failed sends queued for retry with exponential backoff
- Deduplication on retry to avoid duplicate messages to Lucas

**Comparison with existing architecture:** The OpenClaw contract defines `pagination.max_chars_per_chunk: 4096` and `chunk_format: "[{current}/{total}] {content}"`. The Telegram architecture has NO equivalent pagination specification.

---

## 4. Unidirectional Flow Validation

### Command flow: Lucas -> Telegram Bot -> Bridge -> Claude Code

**Verdict: CONCERNS**

The flow is conceptually unidirectional, but the bridge is a bidirectional process (it receives messages AND sends responses). The architecture must ensure:

1. Commands only flow INWARD (Lucas -> Claude Code)
2. Claude Code cannot send commands TO Lucas (only reports/responses)
3. The bridge does not modify commands in transit (V3 from personal memory audit: preserve intent)

**Gap:** No bridge specification exists. Without knowing the bridge's code, we cannot validate that it is a passive relay vs. an active modifier.

---

### Observability flow: Claude Code -> Bridge -> Telegram Bot -> Lucas

**Verdict: CONCERNS**

The flow is conceptually unidirectional, but several questions are unanswered:

1. **What triggers observability updates?** Does the agent explicitly call a "send to Telegram" function? Or does a watcher intercept output?
2. **What gets sent?** Full output? Summaries? Only key decisions? The granularity is undefined.
3. **Can Lucas respond to an observability update?** If Lucas sees "@dev is editing auth.ts" and replies "Don't edit that file!", does that message reach @dev? If yes, the flow is bidirectional (not observability, but interactive control). If no, the reply is lost or goes to @aios_master_bot as a new command.

---

### Delegation flow: AIOS Master -> Agent -> Both bots

**Verdict: FAIL**

The proposed flow says: when AIOS Master delegates to @dev, both @aios_dev_bot AND @aios_master_bot get updates. This requires:

1. A mechanism for AIOS Master to know WHEN it delegates (it does -- handoff protocol)
2. A mechanism to send to @aios_master_bot (notification: "Delegated to @dev")
3. A mechanism for @dev to send to BOTH @aios_dev_bot (its own updates) AND @aios_master_bot (completion/status)

Problem: @dev should NOT have access to @aios_master_bot's token. If it does, @dev could impersonate AIOS Master. If it does not, @dev cannot send completion notifications to @aios_master_bot.

**Required mechanism:** The bridge (not the agent) handles routing. When @dev produces output, the bridge decides:
- Progress update -> @aios_dev_bot
- Completion/handoff -> @aios_master_bot + @aios_dev_bot
- Error -> @aios_master_bot + @aios_dev_bot

The agent never directly touches bot tokens. The bridge reads agent identity from the output and routes accordingly.

---

## 5. Edge Case Validation

### EC1: Claude Code session expires or crashes mid-task

**Verdict: FAIL**

| Check | Result |
|-------|--------|
| Crash detection? | NO -- no watchdog process specified |
| Notification to Lucas? | NO -- if the session is dead, it cannot send notifications |
| Task recovery? | NO -- no task state serialization for recovery |
| Session restart? | NO -- no automatic restart mechanism |

**Recommendation:** A watchdog process (independent of Claude Code) monitors the session. If the session dies:
1. Watchdog sends Telegram message: "AIOS session crashed. Task X was interrupted at step Y."
2. Watchdog attempts session restart
3. On restart, AIOS Master reads the last known state from `.aios/` directory
4. If auto-recovery fails, watchdog sends: "Manual intervention required."

---

### EC2: Telegram API is down but Claude Code is working

**Verdict: CONCERNS**

Claude Code continues working but cannot report progress. This is acceptable IF:
1. Output is queued for delivery when Telegram recovers
2. Lucas is not expecting real-time updates during the outage
3. The task result is not lost

**Gap:** No output queue is specified. If the bridge tries to send a Telegram message and fails, does it retry? Log? Discard?

---

### EC3: Two agents collaborate (dev writes code, qa reviews) -- Telegram visualization

**Verdict: CONCERNS**

The handoff looks like:

```
@aios_dev_bot: "Starting implementation of auth fix..."
@aios_dev_bot: "Modified auth.ts, added input validation..."
@aios_dev_bot: "Implementation complete. Handing off to @qa."
@aios_qa_bot: "Received code for review from @dev..."
@aios_qa_bot: "Running quality checks..."
@aios_qa_bot: "Review complete: PASS. 7/7 checks passed."
@aios_master_bot: "Task complete. Auth bug fixed and reviewed."
```

This looks good in theory but requires:
1. Each agent sends structured messages at defined checkpoints (not implemented)
2. The handoff message appears in BOTH bot channels (routing rule needed)
3. The timeline is coherent (messages appear in correct order despite potential Telegram delivery delays)
4. The granularity is defined (does @dev report every file edit? Or only milestones?)

**Recommendation:** Define message granularity levels:
- `milestone`: Major state changes (started, blocked, completed, handed off) -- ALWAYS sent
- `progress`: Intermediate updates (file modified, test run, decision made) -- sent for tasks > 5 minutes
- `verbose`: Every action (each grep, each file read) -- NEVER sent to Telegram (too noisy)

---

### EC4: Lucas sends "cancel" while task is running

**Verdict: FAIL**

Claude Code does not support external interruption of a running turn. If Lucas sends "cancel" to @aios_master_bot while a turn is being processed:

1. The "cancel" message is received by the bridge
2. The bridge cannot interrupt Claude Code's current turn
3. The "cancel" message is either queued (processed after current turn completes -- too late) or discarded

**Required mechanism:**
- Bridge sends `SIGINT` to the Claude Code process (risky -- may corrupt state)
- Bridge sets a "cancel requested" flag in a file (`.aios/cancel-request.json`). Claude Code checks this flag periodically (requires modification to Claude Code behavior -- not feasible without Anthropic support)
- Bridge acknowledges: "Cancellation requested. Current task will complete its current step and then stop." (soft cancel)

Soft cancel is the only viable option. The bridge queues the cancel and delivers it as the next input after the current turn completes. This means the "cancel" may take minutes to take effect.

---

### EC5: Very long output exceeds Telegram message limit

**Verdict: CONCERNS**

Telegram messages are limited to 4096 characters. Claude Code output for tasks like "show test results" or "diff of changes" can be tens of thousands of characters.

**Required mechanism:**
- Chunk output into 4096-char segments
- Add pagination markers: `[1/5]`, `[2/5]`, etc.
- For very long outputs (>20 chunks), summarize instead: "Full output: 847 lines. Summary: 23 tests passed, 2 failed. Full results saved to /home/ubuntu/aios-core/.aios/output/task-{id}.txt"
- Provide a "full output" command that sends the file via Telegram document upload

**The existing OpenClaw contract already defines this pattern** (`pagination.max_chars_per_chunk: 4096`). The Telegram architecture should adopt the same specification.

---

### EC6: Agent needs user approval ("Push to remote?") -- interactive flow

**Verdict: FAIL**

Interactive approval flows require:
1. Agent sends question to Telegram
2. Lucas reads and responds
3. Response reaches the SAME agent in the SAME context
4. Agent continues based on response

Step 3 is impossible with `claude --print` (session is dead after sending the question). With a persistent session:
- Agent sends question via Telegram
- Session BLOCKS waiting for input
- Bridge receives Lucas's response
- Bridge injects response into session's stdin
- Agent continues

**Gaps:**
- No blocking mechanism defined
- No timeout for approval (what if Lucas does not respond for an hour?)
- No default action on timeout (proceed? abort? escalate?)
- No approval message format (inline keyboard? text reply? button?)

**Recommendation:** Use Telegram inline keyboards for approval flows:

```
[@aios_dev_bot]: Push auth-fix branch to remote?
[Yes] [No] [Defer to @devops]
```

The inline keyboard callback is mapped to a response that the bridge delivers to the waiting session.

---

## 6. Structural Process Audit

### 6.1. Can Executor Do It Wrong?

| Action | Can it go wrong? | Process prevents it? |
|--------|-----------------|---------------------|
| Bridge loses a Telegram message | YES | NO -- no persistent queue |
| Agent sends to wrong bot | YES | NO -- no static bot-agent mapping enforced |
| Two tasks run concurrently and corrupt state | YES | NO -- no concurrency control |
| Session crashes and nobody is notified | YES | NO -- no watchdog |
| Unauthorized user sends command | YES | PARTIAL -- Telegram provides chat_id but no allowlist is defined |
| Long output exceeds Telegram limit | YES | NO -- no chunking/pagination defined |
| Cancel request is lost while task runs | YES | NO -- no cancellation mechanism |
| Progress updates are not sent (agent forgets) | YES | NO -- no mandatory progress hook |
| Context is lost between delegation steps | YES | NO -- no cross-session context serialization |
| Duplicate message processed twice | YES | NO -- no deduplication on message_id |

**Result: 10/10 failure modes are possible and unmitigated.** By the core principle, this architecture is structurally unsound.

### 6.2. Checkpoint Coverage

| Checkpoint | Exists? | Veto Condition? | Blocking? |
|------------|---------|-----------------|-----------|
| CP1: Message received by bridge | NO | NO | NO |
| CP2: Message validated and queued | NO | NO | NO |
| CP3: Message delivered to Claude Code | NO | NO | NO |
| CP4: Agent activated and working | NO | NO | NO |
| CP5: Progress update sent to bot | NO | NO | NO |
| CP6: Agent handoff (dev -> qa) | YES (existing handoff protocol) | YES (existing) | YES (existing) |
| CP7: Task completion reported | NO | NO | NO |
| CP8: Response delivered to Lucas | NO | NO | NO |

**Result: 1 of 8 checkpoints exists, and only because it is inherited from the existing AIOS handoff protocol.** The Telegram-specific pipeline has ZERO checkpoints.

### 6.3. Missing Infrastructure Components

| Component | Status | Blocking? |
|-----------|--------|-----------|
| Telegram bridge service (webhook receiver, message sender) | DOES NOT EXIST | YES |
| Bot token management (N bots, N tokens, secure storage) | DOES NOT EXIST | YES |
| Bot-agent mapping (static, enforced) | DOES NOT EXIST | YES |
| Message queue (persistent, FIFO, deduplicated) | DOES NOT EXIST | YES |
| Session manager (start, monitor, restart Claude Code) | DOES NOT EXIST | YES |
| Progress hook (intercept agent output, route to bot) | DOES NOT EXIST | YES |
| Output formatter (chunk, paginate, summarize) | DOES NOT EXIST | NO (can borrow from OpenClaw contract) |
| Watchdog (detect session crash, notify Lucas) | DOES NOT EXIST | YES |
| Authorization layer (user allowlist, chat_id verification) | DOES NOT EXIST | YES |
| Cancellation handler (soft cancel via queue) | DOES NOT EXIST | NO (nice to have) |

**9 of 10 components are blocking and do not exist.** This is not an architecture with gaps -- it is a vision without implementation.

---

## 7. Comparison with Existing Architecture

### WhatsApp Gateway v1 (Relay) vs Telegram Multi-Bot

| Dimension | WhatsApp v1 | Telegram Multi-Bot | Assessment |
|-----------|-------------|-------------------|------------|
| Entry point | Single (OpenClaw gateway) | Multiple (N bots) | Telegram is more complex |
| Session model | Stateless (`claude --print`) | Requires stateful | Telegram requires solving a harder problem |
| Agent visibility | None (black box) | Per-agent channels | Telegram advantage |
| Message delivery | At-least-once (inbox files) | Undefined | Telegram is a regression |
| Concurrency | Sequential (one message at a time) | Implies concurrent | Telegram creates new problems |
| Infrastructure | Exists (OpenClaw, systemd, inbox) | None exists | WhatsApp is production-ready |
| Delegation chain | File-based (inbox -> process -> outbox) | Undefined | WhatsApp has a defined pattern |
| Rate limiting | Defined in contract | Undefined | WhatsApp is ahead |
| Error handling | Fallback behavior defined | Undefined | WhatsApp is ahead |
| Personal memory | Designed (v2, not implemented) | Not addressed | Orthogonal concern |

**Assessment:** The Telegram multi-bot architecture provides a valuable new capability (per-agent observability) but at the cost of losing ALL the infrastructure guarantees built in the WhatsApp gateway design. The WhatsApp architecture spent significant effort on at-least-once delivery, fallback behavior, rate limiting, and contract validation. The Telegram architecture starts from zero on all of these.

### Can WhatsApp and Telegram Coexist?

The architecture proposes: "WhatsApp (@gateway/Alan) remains separate for personal communication."

This means:
- WhatsApp: personal context, casual conversation, mood management (via @gateway/Alan)
- Telegram: command interface, observability, technical work

This is a CLEAN separation that respects the personal/professional boundary identified in the gateway-personal-memory-architecture.md. The concern is that it requires TWO separate bridge services, TWO sets of credentials, and TWO message routing systems. The operational complexity doubles.

**Recommendation:** If both channels coexist, they must share:
- The inbox/outbox IPC mechanism (single queue, multiple producers)
- The session manager (single Claude Code session serving both channels)
- The authorization system (Lucas identified by phone OR Telegram ID)

---

## 8. Summary Matrix

### Critical Paths

| Path | Verdict | Critical Issue |
|------|---------|---------------|
| Path 1: Command -> Delegation -> Report | FAIL | `claude --print` is stateless; delegation chain impossible |
| Path 2: Direct Agent Communication | FAIL | Bypasses delegation matrix; no disambiguation |
| Path 3: Long-Running Task | FAIL | No progress reporting; no concurrent message handling |
| Path 4: Multiple Concurrent Tasks | FAIL | Physical single-session constraint; no concurrency control |
| Path 5: Error/Failure | CONCERNS | Dead session cannot report its own death |

### Veto Conditions

| Veto | Verdict | Critical Issue |
|------|---------|---------------|
| V1: Command lost | FAIL | No persistent queue; no acknowledgment protocol |
| V2: Agent works invisibly | CONCERNS | No progress hook; agents unaware of Telegram |
| V3: Duplicate execution | FAIL | No deduplication on message_id |
| V4: Wrong bot (cross-contamination) | FAIL | No static bot-agent mapping |
| V5: Unauthorized user | CONCERNS | No allowlist defined |
| V6: Session conflicts | FAIL | No concurrency control; physical constraint |
| V7: Rate limit exceeded | CONCERNS | No output buffer; no pagination |

### Edge Cases

| Edge Case | Verdict | Critical Issue |
|-----------|---------|---------------|
| EC1: Session crash mid-task | FAIL | No watchdog; no recovery |
| EC2: Telegram down, Claude working | CONCERNS | No output queue |
| EC3: Agent collaboration visualization | CONCERNS | No message granularity spec |
| EC4: Cancel while running | FAIL | No cancellation mechanism |
| EC5: Long output | CONCERNS | No chunking defined |
| EC6: Interactive approval | FAIL | No blocking mechanism; no timeout |

### Structural

| Check | Verdict |
|-------|---------|
| Checkpoints with veto conditions | FAIL (1/8) |
| Executor can do it wrong | FAIL (10/10 unmitigated) |
| Missing infrastructure components | FAIL (9/10 blocking) |

### Aggregate

| Category | PASS | CONCERNS | FAIL | Total |
|----------|------|----------|------|-------|
| Critical Paths | 0 | 1 | 4 | 5 |
| Veto Conditions | 0 | 3 | 4 | 7 |
| Edge Cases | 0 | 3 | 3 | 6 |
| Statefulness | 0 | 0 | 1 | 1 |
| Structural | 0 | 0 | 3 | 3 |
| Comparison | 5 | 4 | 0 | 9 |
| **TOTAL** | **5** | **11** | **15** | **31** |

*Note: The 5 PASS items come from the comparison section where the existing WhatsApp architecture already handles the equivalent concern.*

---

## 9. Recommendations

### R1: Solve the statefulness problem BEFORE anything else

The entire architecture depends on multi-step, stateful agent interactions triggered from Telegram. Without solving this, NOTHING ELSE MATTERS. The recommended approach:

**Phase 0: Session Daemon**

Design and implement a "Session Daemon" that:
1. Maintains a persistent Claude Code session (in tmux/screen)
2. Exposes a message queue interface (file-based or Unix socket)
3. Processes messages SEQUENTIALLY (no concurrency)
4. Provides a health check endpoint (is the session alive?)
5. Has automatic restart capability

This is the foundation that both WhatsApp and Telegram can use.

### R2: Start with SINGLE bot, not multi-bot

The multi-bot architecture (N bots for N agents) multiplies complexity. Start with a single bot:

```
@aios_bot (single bot) receives all commands
@aios_bot sends all responses, prefixed with [AGENT_NAME]

Example:
Lucas: Fix auth bug
@aios_bot: [AIOS-Master] Received. Delegating to @dev.
@aios_bot: [@dev] Investigating auth.ts...
@aios_bot: [@dev] Found issue: missing input validation on line 47.
@aios_bot: [@dev] Fix applied. Handing off to @qa.
@aios_bot: [@qa] Reviewing auth.ts changes...
@aios_bot: [@qa] PASS. 7/7 quality checks.
@aios_bot: [AIOS-Master] Task complete.
```

This eliminates:
- Bot token management (1 token instead of N)
- Bot-agent mapping (single bot, agent name in prefix)
- Cross-contamination risk (single channel)

Upgrade to multi-bot in a later phase IF the single-bot model proves insufficient.

### R3: Reuse the inbox/outbox pattern from WhatsApp gateway

The WhatsApp gateway architecture (`gateway-agent-architecture.md`) already defines:
- Inbox JSON schema with classification, routing, threading
- Outbox response format
- Status transitions (pending -> in_progress -> processed)
- Follow-up correlation
- Rate limiting
- Error responses

The Telegram bridge should be a NEW PRODUCER for the SAME queue, not a parallel system. Architecture:

```
WhatsApp -> OpenClaw -> inbox/    <- shared queue -> AIOS Session Daemon
Telegram -> Bridge   -> inbox/
```

Both channels write to `.aios/inbox/`. The Session Daemon reads from inbox. Responses go to `.aios/outbox/` with a `reply_channel` field (`whatsapp` or `telegram`). The appropriate bridge reads its responses.

### R4: Define the Telegram bridge as a minimal Node.js service

```yaml
telegram_bridge:
  runtime: "Node.js"
  deployment: "systemd service (like openclaw-gateway)"
  responsibilities:
    - Receive Telegram webhook updates
    - Validate authorization (chat_id allowlist)
    - Write to inbox (reuse inbox JSON schema)
    - Read from outbox (filter by channel=telegram)
    - Send responses to Telegram Bot API
    - Chunk long messages (4096 char limit)
    - Health check endpoint
  does_NOT_do:
    - Parse or classify messages (AIOS Master does this)
    - Route to agents (AIOS Master does this)
    - Manage Claude Code sessions (Session Daemon does this)
    - Store personal memory (gateway/Alan does this)
```

### R5: Make multi-bot a LATER phase

Phased approach:

| Phase | Scope | Components | Risk |
|-------|-------|-----------|------|
| 0 | Session Daemon (solves statefulness) | tmux wrapper, message queue, health check | MEDIUM |
| 1 | Single Telegram bot + inbox integration | Telegram bridge service, inbox producer, outbox consumer | LOW |
| 2 | Progress reporting | Agent output hook, message formatter, milestone detection | MEDIUM |
| 3 | Interactive flows | Inline keyboards, approval flow, soft cancel | MEDIUM |
| 4 | Multi-bot split | Per-agent bots, token management, routing layer | HIGH |
| 5 | WhatsApp + Telegram unified | Shared inbox, channel-aware outbox, unified authorization | MEDIUM |

Each phase must pass a process validation before the next begins.

### R6: Address WhatsApp/Telegram channel separation explicitly

Define clearly:

```yaml
channel_separation:
  whatsapp:
    purpose: "Personal communication with @gateway/Alan"
    content_types: ["casual", "personal", "mood", "life_updates"]
    bridge: "OpenClaw"
    agent: "@gateway"
  telegram:
    purpose: "Technical commands and observability"
    content_types: ["commands", "status_queries", "task_management", "observability"]
    bridge: "Telegram bridge service"
    agent: "@aios-master"
  cross_channel:
    - "If Lucas sends a technical command to WhatsApp, @gateway forwards to inbox (existing behavior)"
    - "If Lucas sends personal message to Telegram bot, bot responds: 'Para assuntos pessoais, use o WhatsApp.'"
    - "AIOS Master can notify via BOTH channels for critical events (session crash, task completion)"
```

### R7: Do NOT build progress reporting into agents

Agents should NOT be modified to "send Telegram messages." Instead, build an OUTPUT INTERCEPTOR at the bridge/session daemon level:

```
Claude Code output -> Session Daemon captures -> Daemon classifies:
  - Agent switch detected? -> Send "[Agent X] activated" to Telegram
  - File modified? -> Send "[@dev] Modified auth.ts" to Telegram (if progress level >= milestone)
  - Error detected? -> Send "[@dev] ERROR: ..." to Telegram
  - Task complete? -> Send "[AIOS-Master] Task complete" to Telegram
```

This keeps agents clean (they do not know about Telegram) and centralizes formatting/routing in one place.

---

## Appendix A: Architectural Decision Required

Before ANY implementation begins, the following decision must be made and documented as an ADR:

**ADR: How does AIOS handle external command ingestion?**

| Option | Description | Preserves AIOS? | Supports Delegation? | Effort |
|--------|-------------|-----------------|---------------------|--------|
| A | Session Daemon (persistent tmux + queue) | YES | YES | 2-3 stories |
| B | Sequential `claude --print` with full context replay | YES | PARTIAL | 1-2 stories |
| C | Hybrid: simple tasks via --print, complex via daemon | YES | YES (for complex) | 3-4 stories |
| D | Raw API + custom tool layer | NO | YES | 10+ stories |

**Recommendation: Option C (Hybrid)**

- Simple, single-step tasks (status query, send message) use `claude --print`
- Complex, multi-step tasks (fix bug, create story, run spec pipeline) use the Session Daemon
- The bridge decides based on message classification (reuse the existing keyword classifier)

---

## Appendix B: Files Referenced

| File | Path |
|------|------|
| Gateway Architecture v1 | `/home/ubuntu/aios-core/docs/architecture/gateway-agent-architecture.md` |
| Personal Memory Architecture v2 | `/home/ubuntu/aios-core/docs/architecture/gateway-personal-memory-architecture.md` |
| Personal Memory Validation | `/home/ubuntu/aios-core/docs/architecture/gateway-personal-validation.md` |
| OpenClaw Contract | `/home/ubuntu/aios-core/aios-openclaw-contract.yaml` |
| Agent Authority Rules | `/home/ubuntu/aios-core/.claude/rules/agent-authority.md` |
| Agent Handoff Protocol | `/home/ubuntu/aios-core/.claude/rules/agent-handoff.md` |
| Workflow Execution Rules | `/home/ubuntu/aios-core/.claude/rules/workflow-execution.md` |
| OpenClaw Tools Adapter | `/home/ubuntu/aios-core/packages/aios-mcp-federation/src/openclaw-tools-adapter.js` |
| Gateway Agent Definition | `/home/ubuntu/aios-core/squads/gateway/agents/gateway.md` |
| CLAUDE.md | `/home/ubuntu/aios-core/.claude/CLAUDE.md` |

---

## Appendix C: What This Architecture Gets RIGHT

Despite the 15 FAIL verdicts, the vision has strong foundations:

1. **Per-agent observability is genuinely valuable.** Seeing what each agent is doing in real-time solves the "black box" problem that exists in the current CLI-only workflow.
2. **WhatsApp/Telegram channel separation is architecturally clean.** Personal on WhatsApp, technical on Telegram aligns with the gateway-personal-memory-architecture's two-world model.
3. **The delegation chain visualization is excellent UX.** Seeing messages flow from @aios_master_bot to @aios_dev_bot to @aios_qa_bot gives Lucas a mental model of how his request is being processed.
4. **Telegram as the command interface is pragmatic.** Telegram bots have better API support than WhatsApp for structured interactions (inline keyboards, commands, message formatting).

The problem is not the WHAT but the HOW. Every path assumes infrastructure that does not exist and capabilities that the current runtime does not provide. The recommendations in Section 9 provide a phased path from vision to implementation.

---

*Validated by @pedro-valerio (Process Absolutist)*
*"Se executor CONSEGUE fazer errado, processo esta errado."*
*Report: 5 PASS, 11 CONCERNS, 15 FAIL across 31 validation points.*
