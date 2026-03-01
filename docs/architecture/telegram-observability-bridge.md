# Architecture: Telegram Real-Time Observability Bridge for AIOS

**Author:** Aria (Architect Agent)
**Date:** 2026-03-01
**Status:** DRAFT -- Pending Review
**Relates To:** gateway-agent-architecture.md, agent-authority.md, agent-handoff.md, openclaw-mcp-bridge

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Principles](#2-design-principles)
3. [System Architecture](#3-system-architecture)
4. [Session Architecture -- Critical Decision](#4-session-architecture--critical-decision)
5. [Bot Creation Strategy](#5-bot-creation-strategy)
6. [Message Flow Architecture](#6-message-flow-architecture)
7. [The Bridge Script -- Technical Design](#7-the-bridge-script--technical-design)
8. [Observability Protocol](#8-observability-protocol)
9. [Integration with Existing AIOS](#9-integration-with-existing-aios)
10. [Security Architecture](#10-security-architecture)
11. [Rate Limiting and Message Formatting](#11-rate-limiting-and-message-formatting)
12. [Trade-off Analysis](#12-trade-off-analysis)
13. [Implementation Plan](#13-implementation-plan)
14. [Open Questions](#14-open-questions)

---

## 1. Executive Summary

This document defines the architecture for a **Telegram-based real-time observability bridge** that gives Lucas full transparency into AIOS agent operations. Unlike the WhatsApp/OpenClaw channel (which serves as a personal/casual interaction layer with @gateway as the Personal Memory Guardian), the Telegram bridge is a **professional operations channel** where each AIOS agent has its own dedicated Telegram bot.

The core experience: Lucas sends a command to `@aios_master_bot` on Telegram. He watches in real time as AIOS Master delegates work to other agents. Each agent's dedicated bot broadcasts progress updates, tool invocations, decisions, and verdicts. When the task completes, the full delegation chain is visible as a timeline across multiple Telegram chats.

### What This Is

- A **real-time observability layer** for AIOS operations
- A **command interface** where Lucas sends work instructions to AIOS Master
- A **multi-bot broadcasting system** where each agent has its own Telegram channel
- A **professional/work channel** complementing WhatsApp's personal role

### What This Is NOT

- NOT a replacement for WhatsApp/@gateway (personal channel stays as-is)
- NOT a replacement for the Claude Code terminal (the CLI remains the source of truth)
- NOT a multi-user collaboration tool (single user: Lucas)
- NOT an autonomous decision-making system (agents still follow AIOS authority rules)

### Relationship to Existing Architecture

```
+------------------------------------------------------------------+
|                    CHANNEL ARCHITECTURE                            |
|                                                                   |
|  WhatsApp (@gateway / Alan)         Telegram (Observability)      |
|  +--------------------------+       +--------------------------+  |
|  | Personal Memory Guardian |       | Operations Dashboard     |  |
|  | - Casual conversation    |       | - Command entry point    |  |
|  | - Personal context       |       | - Real-time agent logs   |  |
|  | - Mood-aware responses   |       | - Delegation tracking    |  |
|  | - Life/work filter       |       | - Per-agent channels     |  |
|  | - Via OpenClaw            |       | - Direct to Claude Code  |  |
|  +--------------------------+       +--------------------------+  |
|                                                                   |
|                      AIOS Master (CLI)                            |
|                   Source of Truth for All                          |
+------------------------------------------------------------------+
```

---

## 2. Design Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **CLI First, Telegram Second** | Telegram is an observability layer, not the control plane. All intelligence lives in Claude Code. Telegram broadcasts what happens, not decides what happens. Constitution Article I. |
| 2 | **No OpenClaw for Telegram** | Telegram connects directly to Claude Code CLI, not through OpenClaw. OpenClaw stays WhatsApp-only. This avoids coupling two messaging systems through a single gateway. |
| 3 | **One Bot Per Agent** | Each AIOS agent gets its own Telegram bot. This provides channel isolation, clear attribution, and the ability to mute/unmute agents independently. |
| 4 | **Streaming Over Polling** | Use Claude Code's `--output-format stream-json` with `--include-partial-messages` to stream agent output to Telegram in real time, not wait for completion. |
| 5 | **Single Session, Agent Switching** | One persistent Claude Code session (AIOS Master) handles all commands. Agent switching via `@agent` commands within the session. The bridge manages context, not separate processes. |
| 6 | **Observability Is Read-Only by Default** | Agent bots broadcast updates. Lucas CAN send direct messages to agent bots, but the default mode is observe-only for non-master bots. |
| 7 | **Graceful Degradation** | If Telegram is down, AIOS continues normally. If Claude Code is unresponsive, Telegram bots report the outage. Neither system depends on the other for core function. |

---

## 3. System Architecture

### 3.1. High-Level Component Diagram

```
+====================================================================+
|                         TELEGRAM CLOUD                              |
|                                                                     |
|  @aios_master_bot   @aios_dev_bot   @aios_qa_bot   @aios_arch_bot |
|        |                  |               |               |         |
+========|==================|===============|===============|=========+
         |                  |               |               |
         v                  v               v               v
+====================================================================+
|                    BRIDGE PROCESS (Node.js)                         |
|                    /home/ubuntu/aios-core/                          |
|                    packages/telegram-bridge/                        |
|                                                                     |
|  +------------------+  +------------------+  +------------------+  |
|  | BotManager       |  | SessionManager   |  | ObservabilityBus |  |
|  | - Creates bots   |  | - Claude CLI     |  | - Event router   |  |
|  | - Routes msgs    |  | - Stream parser  |  | - Log watcher    |  |
|  | - Rate limiter   |  | - Session state  |  | - Notification   |  |
|  +--------+---------+  +--------+---------+  +--------+---------+  |
|           |                      |                      |           |
|           +----------------------+----------------------+           |
|                                  |                                  |
|                    +-------------+-------------+                    |
|                    | AgentRouter               |                    |
|                    | - Maps agent IDs to bots  |                    |
|                    | - Delegation tracking     |                    |
|                    | - Cross-agent correlation  |                    |
|                    +---------------------------+                    |
+====================================================================+
         |
         v
+====================================================================+
|                    CLAUDE CODE CLI (v2.1.62+)                       |
|                                                                     |
|  claude -p --output-format stream-json                             |
|          --include-partial-messages                                  |
|          --dangerously-skip-permissions                              |
|          --session-id <uuid>                                        |
|          "@aios-master <command>"                                    |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  | AIOS Session                                                  |  |
|  |  @aios-master -> @dev -> @qa -> @architect -> ...            |  |
|  |  Agent handoff protocol preserved                             |  |
|  |  Full agent authority rules enforced                          |  |
|  +-------------------------------------------------------------+   |
+====================================================================+
```

### 3.2. Process Architecture

The system runs as **two processes** on the same Ubuntu machine:

| Process | Description | Lifecycle |
|---------|-------------|-----------|
| **telegram-bridge** | Node.js process running grammY bots + Claude CLI orchestration | systemd service, always-on |
| **Claude Code** | Spawned by bridge via `claude -p` per command, or persistent session | Per-command or long-running |

[AUTO-DECISION] Should the bridge be a standalone process or integrated into AIOS core?
-> Standalone package at `packages/telegram-bridge/` (reason: follows AIOS package architecture; can be developed, tested, and deployed independently; does not pollute core framework code).

### 3.3. Data Flow Overview

```
INBOUND (Lucas -> AIOS):
  Telegram message -> BotManager -> SessionManager -> Claude CLI -> AIOS Agent -> Result

OUTBOUND (AIOS -> Lucas, OBSERVABILITY):
  Claude CLI stream-json -> StreamParser -> ObservabilityBus -> AgentRouter -> Telegram Bot -> Lucas

CROSS-AGENT (delegation):
  @master delegates to @dev ->
    ObservabilityBus emits "delegation" event ->
    AgentRouter sends update to @aios_master_bot ("Delegating to @dev...") ->
    AgentRouter sends update to @aios_dev_bot ("Received task from @master...")
```

---

## 4. Session Architecture -- Critical Decision

### 4.1. Options Analyzed

| Option | Description | Context Isolation | Resource Usage | Complexity | Real-Time Capability |
|--------|-------------|-------------------|----------------|------------|---------------------|
| **A: One session, agent switching** | Single Claude Code process, agent switch via `@agent` commands | Shared (handoff protocol manages) | LOW (1 process) | LOW | HIGH (single stream) |
| **B: Separate sessions per agent** | N Claude Code processes, each with its own bot | Full isolation | HIGH (N processes, each ~500MB) | HIGH | HIGH (N streams) |
| **C: Master + Task subagents** | One main process (Master), spawns Task tool subagents | Partial (Task tool creates subcontext) | MEDIUM (1 main + transient) | MEDIUM | MEDIUM (nested streams) |

### 4.2. Deep Analysis

**Option A: Single Session with Agent Switching**

This maps directly to how AIOS already works in the terminal. Lucas types `@dev fix the bug`, and the session switches to the Dev agent. The bridge does the same thing programmatically.

Advantages:
- Exact same behavior as interactive CLI usage
- Agent handoff protocol works natively (500-token artifacts, 3 retained)
- Single `--session-id` means conversation state accumulates naturally
- The `--resume` flag lets the bridge reconnect to an existing session
- Lowest resource usage (one Claude Code process)

Disadvantages:
- Sequential execution only -- cannot have @dev and @qa working simultaneously
- If the session crashes, all context is lost (mitigated by session persistence)
- Agent switching overhead (compaction, persona loading) adds latency

**Option B: Separate Sessions Per Agent**

Each agent runs in its own Claude Code process with its own session ID.

Advantages:
- True parallel execution (@dev codes while @qa reviews previous work)
- Complete context isolation (no cross-contamination)
- Individual session failure does not affect other agents

Disadvantages:
- Claude Code processes are heavy (~500MB RSS each)
- 4-10 concurrent processes = 2-5 GB RAM minimum
- Cross-agent communication must be reimplemented outside Claude Code
- Breaks the AIOS handoff protocol (designed for intra-session switches)
- Each session loads its own CLAUDE.md, rules, MCP servers -- duplicated work
- Orchestration complexity explodes (who coordinates @dev finishing and @qa starting?)

**Option C: Master + Task Subagents**

AIOS Master is the main session. When delegating, it uses Claude Code's built-in Task tool to spawn subagents.

Advantages:
- Subagents inherit the parent session's context
- Built-in tool in Claude Code, no custom orchestration needed
- Moderate resource usage (subagents share the parent process)

Disadvantages:
- Task tool output is not independently streamable (it returns when done)
- Cannot send real-time updates from a subagent to a Telegram bot during execution
- The Task tool is designed for one-shot delegation, not conversational agents
- Agent personas (full YAML definitions) are heavy to inject into Task tool prompts

### 4.3. Decision: Option A (Single Session with Agent Switching) + Command Queuing

**Selected: Option A** as the primary architecture, with a command queue to handle sequential execution.

Rationale:
1. Matches existing AIOS behavior exactly -- the bridge is a transparent proxy for the CLI.
2. Agent handoff protocol works without modification.
3. Lowest operational complexity and resource usage.
4. Real-time streaming via `--output-format stream-json --include-partial-messages` gives character-by-character output from a single process.
5. The "limitation" of sequential execution is actually correct: AIOS agents are not designed to work in parallel. @dev finishes, then @qa reviews. This is the Story Development Cycle.

The command queue handles the case where Lucas sends multiple commands before the first completes:
```
Queue: [cmd1: "@dev fix auth bug", cmd2: "@qa review last commit"]
Processing: cmd1 (streaming to @aios_dev_bot)
Queued: cmd2 (will execute after cmd1 completes)
```

For genuinely parallel work (rare), the bridge can spawn a second Claude Code process with a fresh session, but this is the exception, not the rule.

### 4.4. Session Lifecycle

```
1. Bridge starts -> generates session UUID
2. First command arrives -> spawns: claude -p --session-id <uuid> --output-format stream-json
                                     --include-partial-messages
                                     --dangerously-skip-permissions
                                     "@aios-master <command>"
3. Stream parsed -> events routed to Telegram bots
4. Command completes -> session persisted by Claude Code
5. Next command -> spawns: claude -p --resume <uuid> --output-format stream-json
                                     --include-partial-messages
                                     --dangerously-skip-permissions
                                     "<command>"
6. Session continues with accumulated context
```

Key flags:
- `--session-id <uuid>`: Creates a named session for the first command
- `--resume <uuid>` (or `-r`): Resumes the session for subsequent commands, preserving full context
- `--output-format stream-json`: Enables machine-parseable streaming output
- `--include-partial-messages`: Sends character-by-character updates as they are generated
- `--dangerously-skip-permissions`: Required for non-interactive execution (the bridge cannot answer permission prompts)
- `-p` / `--print`: Non-interactive mode, exits after completion

**Session persistence note:** Claude Code v2.1.62 persists sessions to disk by default. The `--resume` flag loads the previous conversation history, so multi-turn context is preserved across commands.

---

## 5. Bot Creation Strategy

### 5.1. Phased Rollout

**Phase 1 -- Core Operations (4 bots)**

| Bot Username | Agent | Role in Phase 1 |
|-------------|-------|-----------------|
| `@aios_master_bot` | aios-master | Command entry point. Receives all commands from Lucas. Broadcasts delegation decisions and final results. |
| `@aios_dev_bot` | dev (Dex) | Broadcasts: file edits, test runs, git operations, implementation progress |
| `@aios_qa_bot` | qa (Quinn) | Broadcasts: QA gate results, test verdicts, review findings |
| `@aios_arch_bot` | architect (Aria) | Broadcasts: architecture decisions, impact analysis, tech recommendations |

**Phase 2 -- Extended Team (3 bots)**

| Bot Username | Agent | Role |
|-------------|-------|------|
| `@aios_pm_bot` | pm (Morgan) | Epic orchestration, spec pipeline, requirements |
| `@aios_devops_bot` | devops (Gage) | Push operations, CI/CD status, release management |
| `@aios_analyst_bot` | analyst (Alex) | Research results, competitive analysis |

**Phase 3 -- Full Fleet (as needed)**

| Bot Username | Agent | Role |
|-------------|-------|------|
| `@aios_po_bot` | po (Pax) | Story validation, backlog |
| `@aios_sm_bot` | sm (River) | Story creation, sprint management |
| `@aios_data_bot` | data-engineer (Dara) | Database operations, migrations |
| `@aios_ux_bot` | ux-design-expert (Uma) | UX decisions, frontend architecture |

### 5.2. Bot Registration

Each bot is created via Telegram's @BotFather with these settings:

```
/newbot
Name: AIOS Master
Username: aios_master_bot

/setdescription
Description: Synkra AIOS Master agent. Send commands to orchestrate the agent team.

/setabouttext
About: AIOS Master - CLI-first AI agent orchestrator by Synkra

/setcommands
start - Initialize connection
status - Current AIOS status
help - Available commands
queue - Show command queue
cancel - Cancel current operation
```

Commands are registered per bot (different agents get different command menus).

### 5.3. Bot Configuration File

All bot tokens and mappings are stored in a single config file:

**Path:** `/home/ubuntu/aios-core/packages/telegram-bridge/.env`

```bash
# Telegram Bot Tokens (from @BotFather)
TELEGRAM_MASTER_TOKEN=<token>
TELEGRAM_DEV_TOKEN=<token>
TELEGRAM_QA_TOKEN=<token>
TELEGRAM_ARCH_TOKEN=<token>

# Authorization
TELEGRAM_OWNER_ID=<lucas_telegram_user_id>

# Claude Code
CLAUDE_CLI_PATH=/usr/bin/claude
AIOS_PROJECT_DIR=/home/ubuntu/aios-core

# Session
SESSION_TIMEOUT_MINUTES=60
MAX_QUEUE_SIZE=10
```

**Path:** `/home/ubuntu/aios-core/packages/telegram-bridge/config/bots.yaml`

```yaml
bots:
  master:
    agent_id: aios-master
    token_env: TELEGRAM_MASTER_TOKEN
    username: aios_master_bot
    mode: command     # Accepts commands from Lucas
    phase: 1

  dev:
    agent_id: dev
    token_env: TELEGRAM_DEV_TOKEN
    username: aios_dev_bot
    mode: observe     # Primarily broadcasts, can accept direct messages
    phase: 1

  qa:
    agent_id: qa
    token_env: TELEGRAM_QA_TOKEN
    username: aios_qa_bot
    mode: observe
    phase: 1

  architect:
    agent_id: architect
    token_env: TELEGRAM_ARCH_TOKEN
    username: aios_arch_bot
    mode: observe
    phase: 1

  pm:
    agent_id: pm
    token_env: TELEGRAM_PM_TOKEN
    username: aios_pm_bot
    mode: observe
    phase: 2

  devops:
    agent_id: devops
    token_env: TELEGRAM_DEVOPS_TOKEN
    username: aios_devops_bot
    mode: observe
    phase: 2

  analyst:
    agent_id: analyst
    token_env: TELEGRAM_ANALYST_TOKEN
    username: aios_analyst_bot
    mode: observe
    phase: 2

agent_to_bot_map:
  aios-master: master
  dev: dev
  qa: qa
  architect: architect
  pm: pm
  devops: devops
  analyst: analyst
  # Agents without bots fall back to master bot
  po: master
  sm: master
  data-engineer: master
  ux-design-expert: master
  squad-creator: master
```

---

## 6. Message Flow Architecture

### 6.1. Flow A: Simple Command (Single Agent)

```
Lucas -> @aios_master_bot: "Roda os testes do modulo de auth"

1. BotManager receives Telegram message
2. BotManager verifies sender == TELEGRAM_OWNER_ID
3. SessionManager queues command: "@aios-master Roda os testes do modulo de auth"
4. SessionManager spawns Claude CLI with stream-json output
5. StreamParser processes events:

   Event: {type: "assistant", content: "Vou executar os testes..."}
   -> @aios_master_bot sends: "Vou executar os testes do modulo de auth."

   Event: {type: "tool_use", tool: "Bash", input: "npm test -- --testPathPattern=auth"}
   -> @aios_master_bot sends: "[Running] npm test -- --testPathPattern=auth"

   Event: {type: "tool_result", output: "Tests: 12 passed, 0 failed"}
   -> @aios_master_bot sends: "[Result] Tests: 12 passed, 0 failed"

   Event: {type: "assistant", content: "Todos os 12 testes passando."}
   -> @aios_master_bot sends: "Todos os 12 testes de auth passando. Nenhuma falha."

6. Stream ends -> SessionManager marks command complete
7. Queue advances to next command (if any)
```

**Latency profile:** First Telegram message appears within 2-3 seconds of sending command.

### 6.2. Flow B: Multi-Agent Delegation

```
Lucas -> @aios_master_bot: "Corrige o bug de autenticacao"

1. BotManager receives message, validates sender
2. SessionManager spawns Claude CLI

3. StreamParser detects agent activation pattern:

   Event: {type: "assistant", content: "Recebi. Vou delegar para @dev..."}
   -> @aios_master_bot: "Recebi. Delegando para @dev. @qa vai revisar depois."

   Event: {type: "assistant", agent_switch: "dev", content: "Investigando o bug..."}
   -> ObservabilityBus detects agent switch to "dev"
   -> @aios_dev_bot: "Investigando o bug de autenticacao..."

   Event: {type: "tool_use", tool: "Grep", input: {pattern: "token.*expire"}}
   -> @aios_dev_bot: "[Searching] Grep: token.*expire"

   Event: {type: "tool_use", tool: "Read", input: {file: "auth-service.ts"}}
   -> @aios_dev_bot: "[Reading] auth-service.ts"

   Event: {type: "assistant", content: "Encontrei: token expirado nao renovado em auth-service.ts:47"}
   -> @aios_dev_bot: "Encontrei: token expirado nao renovado em auth-service.ts:47"

   Event: {type: "tool_use", tool: "Edit", input: {file: "auth-service.ts"}}
   -> @aios_dev_bot: "[Editing] auth-service.ts"

   Event: {type: "tool_use", tool: "Bash", input: "npm test"}
   -> @aios_dev_bot: "[Running] npm test"

   Event: {type: "tool_result", output: "12/12 passed"}
   -> @aios_dev_bot: "[Result] 12/12 testes passando."

   Event: {type: "assistant", content: "Fix aplicado. Entregando para @qa."}
   -> @aios_dev_bot: "Fix aplicado. 3 arquivos modificados. Entregando para @qa."

   Event: {type: "assistant", agent_switch: "qa", content: "Recebido de @dev. Iniciando QA gate..."}
   -> ObservabilityBus detects agent switch to "qa"
   -> @aios_qa_bot: "Recebido de @dev. Iniciando QA gate..."

   Event: {type: "assistant", content: "7/7 checks passando. Verdict: PASS"}
   -> @aios_qa_bot: "7/7 checks passando. Verdict: PASS"

   Event: {type: "assistant", agent_switch: "aios-master", content: "Bug corrigido e validado."}
   -> @aios_master_bot: "Bug corrigido e validado. Pronto para push."

4. Stream ends. Full delegation chain visible across 3 Telegram chats.
```

### 6.3. Flow C: Direct Message to Agent Bot

```
Lucas -> @aios_dev_bot: "Mostra o git diff do ultimo commit"

1. BotManager receives message on dev bot
2. BotManager verifies sender == TELEGRAM_OWNER_ID
3. SessionManager queues command: "@dev Mostra o git diff do ultimo commit"
4. Same stream processing as Flow A, but output goes to @aios_dev_bot
5. If @dev delegates to another agent, that agent's bot also gets updates
```

This allows Lucas to talk directly to any agent, not just master. The bridge prepends `@{agent_id}` to the command before passing to Claude CLI.

### 6.4. Flow D: Command Queue Overflow

```
Lucas sends 3 commands rapidly:
  cmd1: "Fix the auth bug"           -> Processing
  cmd2: "Update the README"          -> Queued (#1)
  cmd3: "Run the full test suite"    -> Queued (#2)

@aios_master_bot: "Command queued (#1): Update the README"
@aios_master_bot: "Command queued (#2): Run the full test suite"

After cmd1 completes:
@aios_master_bot: "Starting queued command #1: Update the README"

/queue command shows:
@aios_master_bot:
  "Active: Fix the auth bug (running for 2m30s)
   Queue:
   1. Update the README
   2. Run the full test suite"
```

### 6.5. Flow E: Error and Recovery

```
Claude CLI process crashes mid-execution:

1. SessionManager detects process exit with non-zero code
2. @aios_master_bot: "[ERROR] Claude Code session terminated unexpectedly. Error: <message>"
3. @aios_master_bot: "Attempting to resume session..."
4. SessionManager retries with --resume <session-id>
5. If retry succeeds:
   @aios_master_bot: "Session resumed successfully. Continuing..."
6. If retry fails after 3 attempts:
   @aios_master_bot: "[FAILED] Could not resume session. Use /start to create a new session."
```

---

## 7. The Bridge Script -- Technical Design

### 7.1. Package Structure

```
/home/ubuntu/aios-core/packages/telegram-bridge/
  package.json
  .env                          # Bot tokens (gitignored)
  config/
    bots.yaml                   # Bot-to-agent mapping
  src/
    index.js                    # Entry point, systemd-friendly
    bot-manager.js              # Creates and manages grammY bot instances
    session-manager.js          # Claude CLI process management
    stream-parser.js            # Parses stream-json output from Claude CLI
    observability-bus.js        # Event bus for agent activity tracking
    agent-router.js             # Routes events to correct Telegram bot
    rate-limiter.js             # Telegram API rate limiting
    message-formatter.js        # Formats messages (markdown, code blocks, truncation)
    command-queue.js            # Sequential command execution queue
    health-check.js             # Health monitoring endpoint
  test/
    stream-parser.test.js
    agent-router.test.js
    message-formatter.test.js
    command-queue.test.js
```

### 7.2. Dependencies

```json
{
  "name": "@synkra/telegram-bridge",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "grammy": "^1.35.0",
    "yaml": "^2.7.0",
    "dotenv": "^16.4.0",
    "pino": "^9.6.0",
    "eventemitter3": "^5.0.1"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

**Why grammY over node-telegram-bot-api:**
- grammY is actively maintained (2026), TypeScript-first, better error handling
- Built-in flood control (auto-retry on 429 errors)
- Plugin ecosystem (conversations, session, rate limiter)
- Better performance for multi-bot scenarios (shared polling infrastructure)

[AUTO-DECISION] Should we use grammY or Telegraf? -> grammY (reason: more actively maintained in 2025-2026, better TypeScript support, built-in flood control that handles Telegram's rate limits automatically, simpler API for multi-bot setups).

### 7.3. Core Components

#### 7.3.1. BotManager (`bot-manager.js`)

Responsible for creating grammY bot instances and routing incoming messages.

```javascript
import { Bot } from 'grammy';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import pino from 'pino';

const logger = pino({ name: 'bot-manager' });

export class BotManager {
  constructor(config, ownerId) {
    this.bots = new Map();       // agentId -> { bot, chatId }
    this.config = config;        // parsed bots.yaml
    this.ownerId = ownerId;      // Lucas's Telegram user ID
    this.chatIds = new Map();    // agentId -> chatId (set on first /start)
  }

  async initialize() {
    for (const [key, botConfig] of Object.entries(this.config.bots)) {
      const token = process.env[botConfig.token_env];
      if (!token) {
        logger.warn(`No token for bot ${key} (${botConfig.token_env}), skipping`);
        continue;
      }

      const bot = new Bot(token);

      // Auth middleware: only accept messages from owner
      bot.use(async (ctx, next) => {
        if (ctx.from?.id !== this.ownerId) {
          await ctx.reply('Unauthorized. This bot is private.');
          return;
        }
        await next();
      });

      // /start command: register chat ID for this bot
      bot.command('start', async (ctx) => {
        this.chatIds.set(botConfig.agent_id, ctx.chat.id);
        await ctx.reply(
          `Connected to AIOS agent: @${botConfig.agent_id}\n` +
          `Mode: ${botConfig.mode}\n` +
          `Ready to ${botConfig.mode === 'command' ? 'receive commands' : 'broadcast updates'}.`
        );
        logger.info({ agent: botConfig.agent_id, chatId: ctx.chat.id }, 'Bot connected');
      });

      // /status command
      bot.command('status', async (ctx) => {
        this.emit('status_request', { agent: botConfig.agent_id, ctx });
      });

      // Text message handler
      bot.on('message:text', async (ctx) => {
        if (ctx.message.text.startsWith('/')) return; // Skip other commands
        this.emit('user_message', {
          agent: botConfig.agent_id,
          text: ctx.message.text,
          chatId: ctx.chat.id,
          mode: botConfig.mode,
        });
      });

      this.bots.set(botConfig.agent_id, { bot, config: botConfig });
      logger.info({ agent: botConfig.agent_id, username: botConfig.username }, 'Bot created');
    }
  }

  async startAll() {
    const startPromises = [];
    for (const [agentId, { bot }] of this.bots) {
      startPromises.push(
        bot.start({
          onStart: () => logger.info({ agent: agentId }, 'Bot polling started'),
        })
      );
    }
    await Promise.all(startPromises);
  }

  async sendToAgent(agentId, message, options = {}) {
    // Resolve agent to bot (fallback to master if no dedicated bot)
    const resolvedAgentId = this.config.agent_to_bot_map[agentId] || 'master';
    const botEntry = this.bots.get(
      Object.values(this.config.bots).find(b => b.agent_id === resolvedAgentId)?.agent_id
        || 'aios-master'
    );

    const chatId = this.chatIds.get(resolvedAgentId) || this.chatIds.get('aios-master');
    if (!chatId || !botEntry) {
      logger.warn({ agentId, resolvedAgentId }, 'No chat ID or bot for agent, message dropped');
      return;
    }

    await botEntry.bot.api.sendMessage(chatId, message, {
      parse_mode: options.parseMode || 'Markdown',
      disable_notification: options.silent || false,
    });
  }

  async stopAll() {
    for (const [, { bot }] of this.bots) {
      await bot.stop();
    }
  }
}
```

#### 7.3.2. SessionManager (`session-manager.js`)

Manages the Claude Code CLI process lifecycle and streaming output.

```javascript
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import pino from 'pino';

const logger = pino({ name: 'session-manager' });

export class SessionManager {
  constructor(config) {
    this.claudePath = config.claudePath || '/usr/bin/claude';
    this.projectDir = config.projectDir || '/home/ubuntu/aios-core';
    this.sessionId = null;
    this.currentProcess = null;
    this.isFirstCommand = true;
  }

  async executeCommand(command, onEvent) {
    return new Promise((resolve, reject) => {
      const args = [
        '-p',
        '--output-format', 'stream-json',
        '--include-partial-messages',
        '--dangerously-skip-permissions',
      ];

      if (this.isFirstCommand) {
        this.sessionId = randomUUID();
        args.push('--session-id', this.sessionId);
        this.isFirstCommand = false;
      } else {
        args.push('-r', this.sessionId);
      }

      args.push(command);

      logger.info({ command, sessionId: this.sessionId }, 'Spawning Claude CLI');

      this.currentProcess = spawn(this.claudePath, args, {
        cwd: this.projectDir,
        env: {
          ...process.env,
          HOME: '/home/ubuntu',
          USER: 'ubuntu',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let buffer = '';
      let lastEventTime = Date.now();

      this.currentProcess.stdout.on('data', (chunk) => {
        buffer += chunk.toString();
        lastEventTime = Date.now();

        // stream-json outputs one JSON object per line
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            onEvent(event);
          } catch (err) {
            logger.warn({ line: line.substring(0, 200) }, 'Failed to parse stream event');
          }
        }
      });

      this.currentProcess.stderr.on('data', (chunk) => {
        logger.warn({ stderr: chunk.toString().substring(0, 500) }, 'Claude CLI stderr');
      });

      this.currentProcess.on('close', (code) => {
        this.currentProcess = null;
        if (code === 0) {
          logger.info({ sessionId: this.sessionId, code }, 'Claude CLI completed');
          resolve({ sessionId: this.sessionId, exitCode: code });
        } else {
          logger.error({ sessionId: this.sessionId, code }, 'Claude CLI exited with error');
          reject(new Error(`Claude CLI exited with code ${code}`));
        }
      });

      this.currentProcess.on('error', (err) => {
        this.currentProcess = null;
        logger.error({ err }, 'Failed to spawn Claude CLI');
        reject(err);
      });
    });
  }

  cancel() {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      // Give 5 seconds, then SIGKILL
      setTimeout(() => {
        if (this.currentProcess) {
          this.currentProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  resetSession() {
    this.sessionId = null;
    this.isFirstCommand = true;
  }
}
```

#### 7.3.3. StreamParser (`stream-parser.js`)

Parses Claude Code's `stream-json` output into structured observability events.

The `stream-json` output format produces one JSON object per line. Each object has a `type` field indicating the event kind. The parser normalizes these into a consistent event format for the ObservabilityBus.

```javascript
import pino from 'pino';

const logger = pino({ name: 'stream-parser' });

// Agent detection patterns (AIOS agents referenced in output)
const AGENT_PATTERNS = [
  { pattern: /@(dev|qa|architect|pm|po|sm|analyst|data-engineer|devops|ux-design-expert|aios-master)\b/i,
    extract: (match) => match[1].toLowerCase() },
  { pattern: /Delegando para @(\w+)/i,
    extract: (match) => match[1].toLowerCase() },
  { pattern: /Switching to @(\w+)/i,
    extract: (match) => match[1].toLowerCase() },
];

export class StreamParser {
  constructor() {
    this.currentAgent = 'aios-master';
    this.textAccumulator = '';
    this.lastFlushTime = Date.now();
    this.flushIntervalMs = 1500; // Flush accumulated text every 1.5s
  }

  /**
   * Parse a single stream-json event from Claude CLI.
   * Returns an array of normalized events (may be empty if accumulating).
   */
  parse(rawEvent) {
    const events = [];

    // Handle different event types from Claude Code stream-json
    switch (rawEvent.type) {
      case 'system':
        // System events (session start, model info)
        events.push({
          kind: 'system',
          agent: this.currentAgent,
          message: rawEvent.subtype || 'session_event',
          data: rawEvent,
        });
        break;

      case 'assistant':
        // Assistant text output (may be partial if --include-partial-messages)
        if (rawEvent.partial) {
          // Accumulate partial text, will be flushed periodically
          this.textAccumulator += rawEvent.content || '';
          if (Date.now() - this.lastFlushTime > this.flushIntervalMs) {
            events.push(...this._flushText());
          }
        } else {
          // Complete message
          events.push(...this._flushText());
          const text = rawEvent.content || '';
          const agentSwitch = this._detectAgentSwitch(text);
          if (agentSwitch) {
            events.push({
              kind: 'agent_switch',
              from: this.currentAgent,
              to: agentSwitch,
              message: text,
            });
            this.currentAgent = agentSwitch;
          }
          events.push({
            kind: 'assistant_message',
            agent: this.currentAgent,
            message: text,
            complete: true,
          });
        }
        break;

      case 'tool_use':
        // Tool invocation start
        events.push(...this._flushText());
        events.push({
          kind: 'tool_start',
          agent: this.currentAgent,
          tool: rawEvent.name || rawEvent.tool,
          input: this._summarizeToolInput(rawEvent.name || rawEvent.tool, rawEvent.input),
          rawInput: rawEvent.input,
        });
        break;

      case 'tool_result':
        // Tool invocation result
        events.push({
          kind: 'tool_result',
          agent: this.currentAgent,
          tool: rawEvent.name || rawEvent.tool,
          output: this._summarizeToolOutput(rawEvent.output),
          success: !rawEvent.is_error,
          rawOutput: rawEvent.output,
        });
        break;

      case 'result':
        // Final result (session complete)
        events.push(...this._flushText());
        events.push({
          kind: 'session_complete',
          agent: this.currentAgent,
          cost: rawEvent.cost_usd,
          duration: rawEvent.duration_ms,
          turns: rawEvent.num_turns,
        });
        break;

      case 'error':
        events.push({
          kind: 'error',
          agent: this.currentAgent,
          message: rawEvent.error || rawEvent.message || 'Unknown error',
        });
        break;

      default:
        logger.debug({ type: rawEvent.type }, 'Unhandled stream event type');
    }

    return events;
  }

  _flushText() {
    if (!this.textAccumulator.trim()) return [];
    const text = this.textAccumulator.trim();
    this.textAccumulator = '';
    this.lastFlushTime = Date.now();

    const agentSwitch = this._detectAgentSwitch(text);
    const events = [];
    if (agentSwitch) {
      events.push({
        kind: 'agent_switch',
        from: this.currentAgent,
        to: agentSwitch,
        message: text,
      });
      this.currentAgent = agentSwitch;
    }
    events.push({
      kind: 'assistant_message',
      agent: this.currentAgent,
      message: text,
      complete: false,
    });
    return events;
  }

  _detectAgentSwitch(text) {
    for (const { pattern, extract } of AGENT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const agent = extract(match);
        if (agent !== this.currentAgent) {
          return agent;
        }
      }
    }
    return null;
  }

  _summarizeToolInput(tool, input) {
    if (!input) return '';
    switch (tool) {
      case 'Bash':
        return input.command ? input.command.substring(0, 120) : '';
      case 'Read':
        return input.file_path || '';
      case 'Edit':
        return input.file_path ? `${input.file_path}` : '';
      case 'Write':
        return input.file_path || '';
      case 'Grep':
        return `${input.pattern || ''} in ${input.path || '.'}`;
      case 'Glob':
        return input.pattern || '';
      case 'WebSearch':
        return input.query || '';
      case 'WebFetch':
        return input.url || '';
      default:
        return JSON.stringify(input).substring(0, 80);
    }
  }

  _summarizeToolOutput(output) {
    if (!output) return '';
    const str = typeof output === 'string' ? output : JSON.stringify(output);
    // Truncate long outputs
    if (str.length > 500) {
      return str.substring(0, 497) + '...';
    }
    return str;
  }

  reset() {
    this.currentAgent = 'aios-master';
    this.textAccumulator = '';
    this.lastFlushTime = Date.now();
  }
}
```

#### 7.3.4. AgentRouter (`agent-router.js`)

Routes parsed events to the correct Telegram bot based on the active agent.

```javascript
import pino from 'pino';
import { MessageFormatter } from './message-formatter.js';

const logger = pino({ name: 'agent-router' });

export class AgentRouter {
  constructor(botManager, rateLimiter) {
    this.botManager = botManager;
    this.rateLimiter = rateLimiter;
    this.formatter = new MessageFormatter();
    this.delegationStack = []; // Track delegation chain
  }

  async route(event) {
    switch (event.kind) {
      case 'agent_switch':
        await this._handleAgentSwitch(event);
        break;

      case 'assistant_message':
        if (event.message.trim()) {
          await this._sendToAgent(event.agent, this.formatter.formatAssistant(event));
        }
        break;

      case 'tool_start':
        await this._sendToAgent(
          event.agent,
          this.formatter.formatToolStart(event),
          { silent: true } // Tool starts are low-priority, no notification sound
        );
        break;

      case 'tool_result':
        await this._sendToAgent(
          event.agent,
          this.formatter.formatToolResult(event),
          { silent: !event.success } // Errors get notification sound
        );
        break;

      case 'session_complete':
        await this._handleSessionComplete(event);
        break;

      case 'error':
        // Errors always go to master bot AND the agent's bot
        const errorMsg = this.formatter.formatError(event);
        await this._sendToAgent('aios-master', errorMsg);
        if (event.agent !== 'aios-master') {
          await this._sendToAgent(event.agent, errorMsg);
        }
        break;

      default:
        logger.debug({ kind: event.kind }, 'Unrouted event kind');
    }
  }

  async _handleAgentSwitch(event) {
    this.delegationStack.push({
      from: event.from,
      to: event.to,
      timestamp: new Date().toISOString(),
    });

    // Notify the source agent's bot
    await this._sendToAgent(
      event.from,
      this.formatter.formatDelegation(event.from, event.to, 'outgoing')
    );

    // Notify the target agent's bot
    await this._sendToAgent(
      event.to,
      this.formatter.formatDelegation(event.from, event.to, 'incoming')
    );
  }

  async _handleSessionComplete(event) {
    const summary = this.formatter.formatSessionComplete(event, this.delegationStack);
    await this._sendToAgent('aios-master', summary);
    this.delegationStack = [];
  }

  async _sendToAgent(agentId, message, options = {}) {
    if (!message || !message.trim()) return;

    // Rate limit check
    const canSend = await this.rateLimiter.acquire(agentId);
    if (!canSend) {
      logger.warn({ agentId }, 'Rate limited, message queued');
      this.rateLimiter.enqueue(agentId, message, options);
      return;
    }

    try {
      await this.botManager.sendToAgent(agentId, message, options);
    } catch (err) {
      if (err.description?.includes('Too Many Requests')) {
        const retryAfter = err.parameters?.retry_after || 5;
        logger.warn({ agentId, retryAfter }, 'Telegram 429, backing off');
        await this._delay(retryAfter * 1000);
        await this.botManager.sendToAgent(agentId, message, options);
      } else {
        logger.error({ agentId, err: err.message }, 'Failed to send Telegram message');
      }
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 7.3.5. MessageFormatter (`message-formatter.js`)

Formats observability events into clean Telegram messages with Markdown.

```javascript
export class MessageFormatter {
  constructor(options = {}) {
    this.maxLength = options.maxLength || 4000; // Telegram limit is 4096
    this.showToolDetails = options.showToolDetails !== false;
  }

  formatAssistant(event) {
    const text = event.message;
    return this._truncate(text);
  }

  formatToolStart(event) {
    const icon = this._toolIcon(event.tool);
    const summary = event.input ? ` \`${this._escapeMarkdown(event.input)}\`` : '';
    return `${icon} *${event.tool}*${summary}`;
  }

  formatToolResult(event) {
    if (!event.success) {
      return `[ERROR] ${event.tool}: ${this._truncate(event.output, 300)}`;
    }

    // Compact output for common tools
    const output = event.output;
    if (!output || output.length < 5) return null; // Skip trivial outputs

    // For test results, show full output
    if (output.includes('Tests:') || output.includes('PASS') || output.includes('FAIL')) {
      return `\`\`\`\n${this._truncate(output, 800)}\n\`\`\``;
    }

    // For long outputs, summarize
    if (output.length > 200) {
      return `_${this._truncate(output, 200)}_`;
    }

    return `\`${this._truncate(output, 300)}\``;
  }

  formatDelegation(from, to, direction) {
    if (direction === 'outgoing') {
      return `>> Delegating to *@${to}*`;
    } else {
      return `<< Received from *@${from}*. Starting work...`;
    }
  }

  formatError(event) {
    return `[ERROR] ${event.message}`;
  }

  formatSessionComplete(event, delegationStack) {
    const lines = ['*Session Complete*'];

    if (event.duration) {
      lines.push(`Duration: ${Math.round(event.duration / 1000)}s`);
    }
    if (event.cost) {
      lines.push(`Cost: $${event.cost.toFixed(4)}`);
    }
    if (event.turns) {
      lines.push(`Turns: ${event.turns}`);
    }

    if (delegationStack.length > 0) {
      lines.push('');
      lines.push('*Delegation chain:*');
      for (const d of delegationStack) {
        lines.push(`  @${d.from} -> @${d.to}`);
      }
    }

    return lines.join('\n');
  }

  formatQueueStatus(active, queued) {
    const lines = [];
    if (active) {
      lines.push(`*Active:* ${active.command.substring(0, 60)}`);
      if (active.startTime) {
        const elapsed = Math.round((Date.now() - active.startTime) / 1000);
        lines.push(`  Running for ${elapsed}s`);
      }
    } else {
      lines.push('*Active:* None');
    }

    if (queued.length > 0) {
      lines.push('');
      lines.push('*Queue:*');
      queued.forEach((cmd, i) => {
        lines.push(`  ${i + 1}. ${cmd.command.substring(0, 60)}`);
      });
    } else {
      lines.push('*Queue:* Empty');
    }

    return lines.join('\n');
  }

  _toolIcon(tool) {
    const icons = {
      Bash: '[>_]',
      Read: '[R]',
      Edit: '[E]',
      Write: '[W]',
      Grep: '[?]',
      Glob: '[*]',
      WebSearch: '[WEB]',
      WebFetch: '[URL]',
      Task: '[T]',
    };
    return icons[tool] || `[${tool}]`;
  }

  _escapeMarkdown(text) {
    // Escape Markdown special chars for Telegram
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  }

  _truncate(text, maxLen) {
    const limit = maxLen || this.maxLength;
    if (text.length <= limit) return text;
    return text.substring(0, limit - 3) + '...';
  }
}
```

#### 7.3.6. Entry Point (`index.js`)

```javascript
import { BotManager } from './bot-manager.js';
import { SessionManager } from './session-manager.js';
import { StreamParser } from './stream-parser.js';
import { AgentRouter } from './agent-router.js';
import { RateLimiter } from './rate-limiter.js';
import { CommandQueue } from './command-queue.js';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino({ name: 'telegram-bridge' });

async function main() {
  // Load config
  const botsConfig = parse(
    readFileSync(new URL('./config/bots.yaml', import.meta.url), 'utf8')
  );

  const ownerId = parseInt(process.env.TELEGRAM_OWNER_ID, 10);
  if (!ownerId) {
    logger.fatal('TELEGRAM_OWNER_ID is required');
    process.exit(1);
  }

  // Initialize components
  const botManager = new BotManager(botsConfig, ownerId);
  const sessionManager = new SessionManager({
    claudePath: process.env.CLAUDE_CLI_PATH || '/usr/bin/claude',
    projectDir: process.env.AIOS_PROJECT_DIR || '/home/ubuntu/aios-core',
  });
  const streamParser = new StreamParser();
  const rateLimiter = new RateLimiter({ messagesPerSecond: 1, burstSize: 3 });
  const agentRouter = new AgentRouter(botManager, rateLimiter);
  const commandQueue = new CommandQueue();

  await botManager.initialize();

  // Wire up user messages -> command queue
  botManager.on = function (eventName, handler) {
    // Simple event emitter shim (or use EventEmitter3)
    this._handlers = this._handlers || {};
    this._handlers[eventName] = this._handlers[eventName] || [];
    this._handlers[eventName].push(handler);
  };
  botManager.emit = function (eventName, data) {
    const handlers = this._handlers?.[eventName] || [];
    handlers.forEach(h => h(data));
  };

  botManager.on('user_message', async ({ agent, text, chatId, mode }) => {
    // Prepend @agent if message is to a non-master bot
    const command = agent === 'aios-master' ? text : `@${agent} ${text}`;

    // Confirm receipt
    await botManager.sendToAgent(agent, `_Received. ${commandQueue.size > 0 ? `Queued (#${commandQueue.size + 1}).` : 'Processing...'}_`);

    commandQueue.enqueue({
      command,
      sourceAgent: agent,
      chatId,
    });
  });

  // Process command queue
  commandQueue.on('execute', async (item) => {
    logger.info({ command: item.command }, 'Executing command');

    streamParser.reset();

    try {
      await sessionManager.executeCommand(item.command, (rawEvent) => {
        const events = streamParser.parse(rawEvent);
        for (const event of events) {
          agentRouter.route(event).catch(err => {
            logger.error({ err: err.message, event: event.kind }, 'Failed to route event');
          });
        }
      });

      logger.info({ command: item.command }, 'Command completed successfully');
    } catch (err) {
      logger.error({ err: err.message, command: item.command }, 'Command failed');
      await botManager.sendToAgent('aios-master', `[ERROR] Command failed: ${err.message}`);
    }
  });

  // Start all bots
  await botManager.startAll();
  logger.info('Telegram bridge started. All bots polling.');

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down...');
    sessionManager.cancel();
    await botManager.stopAll();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start telegram-bridge');
  process.exit(1);
});
```

### 7.4. systemd Service

**Path:** `/etc/systemd/system/aios-telegram-bridge.service`

```ini
[Unit]
Description=AIOS Telegram Observability Bridge
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/aios-core/packages/telegram-bridge
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

# Security hardening
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# Installation commands
sudo systemctl daemon-reload
sudo systemctl enable aios-telegram-bridge
sudo systemctl start aios-telegram-bridge

# Monitoring
journalctl -u aios-telegram-bridge -f
```

---

## 8. Observability Protocol

### 8.1. Event Taxonomy

Every activity in the AIOS session generates observability events that the bridge routes to the appropriate Telegram bot. Events are classified by type and verbosity level.

| Event Kind | Source | Target Bot | Verbosity | Description |
|-----------|--------|------------|-----------|-------------|
| `agent_switch` | StreamParser detects @agent activation | Both from/to bots | ALWAYS | Agent delegation/handoff |
| `assistant_message` | Claude's text output | Current agent's bot | ALWAYS | What the agent is saying/thinking |
| `tool_start` | Tool invocation begins | Current agent's bot | NORMAL | What tool is being used and with what input |
| `tool_result` | Tool invocation completes | Current agent's bot | NORMAL | Tool output (success/failure) |
| `session_complete` | Stream ends | Master bot | ALWAYS | Summary with cost, duration, delegation chain |
| `error` | Any error | Master bot + agent's bot | ALWAYS | Error details |
| `queue_update` | Command queued/dequeued | Master bot | ALWAYS | Queue position changes |

### 8.2. Verbosity Levels

Users can control how much detail each bot broadcasts via a `/verbose` command:

| Level | What Is Shown |
|-------|---------------|
| `minimal` | Agent switches, final results, errors only |
| `normal` (default) | All of minimal + tool invocations (start/result) |
| `verbose` | All of normal + partial text streaming, raw tool inputs |
| `silent` | Nothing (bot is muted) |

Implementation: stored per-bot in `config/bots.yaml` at runtime, persisted to disk.

### 8.3. Agent Detection Heuristics

The StreamParser must detect when the active agent changes. This is challenging because Claude Code does not emit explicit "agent switch" events in its stream-json output. The parser uses a multi-signal approach:

**Signal 1: Greeting Pattern Detection**

Each AIOS agent has a distinctive greeting format (defined in their YAML persona). The parser watches for these patterns:

```javascript
const GREETING_PATTERNS = {
  'dev':       /Dex.*ready|dev Agent ready/i,
  'qa':        /Quinn.*ready|qa Agent ready/i,
  'architect': /Aria.*ready|architect Agent ready/i,
  'pm':        /Morgan.*ready|pm Agent ready/i,
  'devops':    /Gage.*ready|devops Agent ready/i,
  'analyst':   /Alex.*ready|analyst Agent ready/i,
};
```

**Signal 2: @agent Command Echo**

When the session processes an `@agent` command, Claude often echoes it. The parser watches for:
```
/Switching to @(\w+)/
/Activating @(\w+)/
/@(\w+) agent activated/
```

**Signal 3: Tool Use Context**

Certain tool patterns are agent-specific:
- `Bash(npm test)` -> likely @qa or @dev
- `Edit` tool -> likely @dev
- `Grep` with architecture patterns -> likely @architect

This signal is supplementary and does not override explicit detection.

**Signal 4: Handoff Artifact Detection**

When the stream output mentions writing or reading handoff artifacts (`.aios/handoffs/`), this confirms an agent switch occurred.

### 8.4. Checkpoint Events

Beyond tool-level observability, the bridge tracks high-level checkpoints in the Story Development Cycle:

| Checkpoint | Trigger Pattern | Broadcast To |
|-----------|----------------|--------------|
| Story started | `"Starting story"` or story file read | Master, relevant agent |
| Tests running | `npm test` or `vitest` in Bash tool | Dev, QA |
| Tests complete | Test result output parsed | Dev, QA, Master |
| QA Gate started | `"QA gate"` or `qa-gate.md` referenced | QA, Master |
| QA Verdict | `PASS`, `FAIL`, `CONCERNS`, `WAIVED` in output | QA, Master |
| Git commit | `git commit` in Bash tool | Dev, DevOps, Master |
| Build complete | `npm run build` result | Dev, DevOps |
| Error/failure | Non-zero exit, error patterns | Master (always) |

---

## 9. Integration with Existing AIOS

### 9.1. Agent Authority Compliance

The Telegram bridge does NOT modify agent authority rules. It is a transparent proxy:

| Rule | How Bridge Complies |
|------|-------------------|
| Only @devops can `git push` | Bridge passes commands verbatim. If @dev tries to push, Claude Code enforces the block. |
| Agent handoff protocol | Works natively within the single Claude Code session. Bridge just observes. |
| Story-driven development | Commands that reference stories work exactly as in the terminal. |
| @pm exclusive for epics | Bridge does not override. If Lucas sends an epic command to @dev bot, the agent will correctly refuse or delegate. |
| Framework protection | `.claude/settings.json` deny rules are enforced by Claude Code, not the bridge. |

### 9.2. Agent Handoff Protocol Compatibility

The existing handoff protocol (`.claude/rules/agent-handoff.md`) works without modification:

```
Terminal usage:       @dev -> @qa (handoff artifact, compaction, 500 token limit)
Telegram bridge:      Same flow, bridge just observes the stream output

The only difference: the bridge detects agent switches from the stream
and routes messages to different Telegram bots. The underlying AIOS
behavior is identical.
```

### 9.3. WhatsApp/OpenClaw Coexistence

The two channels serve entirely different purposes and do NOT conflict:

| Aspect | WhatsApp (@gateway/Alan) | Telegram (Bridge) |
|--------|------------------------|-------------------|
| **Purpose** | Personal interaction, life/work filter | Professional operations, observability |
| **Architecture** | OpenClaw Gateway -> File inbox -> AIOS | grammY bots -> Claude CLI -> AIOS |
| **Conversation style** | Casual, mood-aware, bilingual | Technical, structured, agent-per-channel |
| **Session model** | Stateless (file-based IPC) | Persistent (Claude Code session) |
| **Multi-agent** | Single @gateway triage | Per-agent bots with delegation tracking |
| **When to use** | Away from desk, mobile, casual | At desk, monitoring work, sending commands |

Both channels can operate simultaneously. The only shared resource is the AIOS codebase on disk, and Claude Code handles file locking internally.

### 9.4. Notification Bridge

The existing WhatsApp notification mechanism (`sudo /usr/bin/openclaw message send`) continues to work independently. The Telegram bridge adds a parallel notification path:

```javascript
// In any AIOS script or hook, you can now notify via Telegram too:
// This is FUTURE work -- the bridge would expose a simple HTTP API or Unix socket

// Current WhatsApp notification (unchanged):
// sudo /usr/bin/openclaw message send --target +5528999301848 --message "..."

// Future Telegram notification (Phase 3):
// curl -X POST http://localhost:3847/notify -d '{"agent":"dev","message":"..."}'
```

---

## 10. Security Architecture

### 10.1. Authentication

| Threat | Mitigation |
|--------|------------|
| **Unauthorized command injection** | Every message is checked: `ctx.from.id === TELEGRAM_OWNER_ID`. Only Lucas can send commands. |
| **Bot token theft** | Tokens stored in `.env` file, 600 permissions, gitignored. systemd `NoNewPrivileges=true`. |
| **Session hijacking** | Claude Code sessions are local to the machine. No network exposure. |
| **Telegram MITM** | Telegram Bot API uses HTTPS. grammY validates all responses. |

### 10.2. Authorization Model

```
COMMAND FLOW:
  Lucas (verified by Telegram user ID)
    -> BotManager (enforces TELEGRAM_OWNER_ID check)
      -> SessionManager (runs as ubuntu user)
        -> Claude Code (enforces AIOS agent authority rules)

No step in this chain allows unauthenticated access.
```

### 10.3. Sensitive Data in Telegram Messages

The bridge MUST sanitize certain data before sending to Telegram:

| Data Type | Action |
|-----------|--------|
| API keys, tokens in tool output | Redact (replace with `***`) |
| File paths | Allow (not sensitive for single-user) |
| Git diffs | Allow, but truncate to 4000 chars |
| Error stack traces | Allow, truncated |
| `.env` file contents | Redact entirely |
| Database credentials | Redact |

Implementation: the `MessageFormatter` applies a sanitization pass before sending:

```javascript
const REDACT_PATTERNS = [
  { pattern: /(api[_-]?key|token|secret|password|credential)[\s]*[:=]\s*['"]?([^\s'"]+)/gi,
    replace: '$1=***' },
  { pattern: /(sk-[a-zA-Z0-9]{20,})/g,
    replace: '***API_KEY***' },
  { pattern: /(ghp_[a-zA-Z0-9]{36,})/g,
    replace: '***GITHUB_TOKEN***' },
];
```

### 10.4. Read-Only Default for Agent Bots

Agent bots (dev, qa, architect, etc.) are in `observe` mode by default. This means:
- They broadcast updates automatically
- They CAN accept direct messages from Lucas (owner-verified)
- They CANNOT receive messages from anyone else
- Even if someone discovers the bot username, the auth middleware blocks all non-owner messages

---

## 11. Rate Limiting and Message Formatting

### 11.1. Telegram API Rate Limits

Telegram enforces these limits (as of Bot API 8.0):

| Limit | Value |
|-------|-------|
| Per-chat messages | ~1 message/second (burst OK, sustained will 429) |
| Per-group messages | 20 messages/minute |
| Global per-bot | 30 messages/second across all chats |
| Message size | 4096 characters max |
| editMessage | Shared with send quota |

### 11.2. Rate Limiter Design

The bridge implements a token-bucket rate limiter per bot:

```javascript
export class RateLimiter {
  constructor(options = {}) {
    this.maxTokens = options.burstSize || 3;
    this.refillRate = options.messagesPerSecond || 1; // tokens per second
    this.buckets = new Map();     // agentId -> { tokens, lastRefill }
    this.queues = new Map();      // agentId -> [{ message, options }]
    this.drainInterval = null;
  }

  acquire(agentId) {
    if (!this.buckets.has(agentId)) {
      this.buckets.set(agentId, { tokens: this.maxTokens, lastRefill: Date.now() });
    }

    const bucket = this.buckets.get(agentId);
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + elapsed * this.refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }

  enqueue(agentId, message, options) {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, []);
    }
    this.queues.get(agentId).push({ message, options });
    this._startDrain();
  }

  _startDrain() {
    if (this.drainInterval) return;
    this.drainInterval = setInterval(() => {
      let anyPending = false;
      for (const [agentId, queue] of this.queues) {
        if (queue.length === 0) continue;
        anyPending = true;
        if (this.acquire(agentId)) {
          const item = queue.shift();
          // Emit for AgentRouter to send
          this.emit('drain', { agentId, ...item });
        }
      }
      if (!anyPending) {
        clearInterval(this.drainInterval);
        this.drainInterval = null;
      }
    }, 1100); // Slightly over 1 second
  }
}
```

### 11.3. Message Batching Strategy

When Claude Code generates rapid tool invocations (e.g., reading 10 files in sequence), sending one Telegram message per tool call would hit rate limits. The bridge batches:

**Batching rules:**
1. Tool start events within 500ms of each other are batched into one message
2. Consecutive Read tool calls are collapsed: `[R] file1.js, file2.js, file3.js`
3. Partial text accumulates for 1.5 seconds before flushing
4. Tool results under 50 chars are appended to the next assistant message
5. Maximum batch size: 4000 chars (Telegram limit)

### 11.4. Message Formatting for Telegram

Telegram supports a subset of Markdown (MarkdownV2 parse mode). The formatter handles:

| Element | Telegram Markdown |
|---------|------------------|
| Bold | `*bold*` |
| Italic | `_italic_` |
| Code inline | `` `code` `` |
| Code block | ` ```lang\ncode\n``` ` |
| Monospace | `` `monospace` `` |
| Links | `[text](url)` |

Special handling:
- Escape `_`, `*`, `` ` ``, `[` in non-formatted text
- Code blocks for test output, diffs, file contents
- Bold for agent names and section headers
- Italic for status updates and metadata

---

## 12. Trade-off Analysis

### 12.1. grammY vs node-telegram-bot-api vs Telegraf

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **grammY** | Active maintenance (2026), TypeScript-first, built-in flood control, plugin ecosystem, multi-bot friendly | Slightly newer community | **SELECTED** |
| **node-telegram-bot-api** | Mature, widely used, simple API | Less active maintenance, no built-in flood control, no TypeScript types by default | Rejected |
| **Telegraf** | Popular, middleware architecture, good docs | Heavier, more opinionated, some maintenance gaps in 2025 | Rejected |

### 12.2. `claude --print` (stateless) vs Persistent Session

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **`--print` with `--resume`** | Stateless process (clean exit per command), session persistence handled by Claude Code, no memory leaks from long-running processes, crash recovery is trivial | Small startup overhead per command (~1-2s), session state loaded from disk each time | **SELECTED** |
| **Persistent interactive session** | Zero startup overhead, instant response, live context | Complex process management, stdin/stdout pipe management, crash = lost session, memory grows over time | Rejected |

Rationale: The `--print` + `--resume` approach is dramatically simpler to implement and operate. Each command is a clean process lifecycle: spawn, stream, exit. The 1-2 second startup overhead is acceptable for a command interface (not a real-time chat). Claude Code's built-in session persistence means context is preserved across commands without the bridge needing to manage it.

### 12.3. Stream-JSON vs Polling Log Files

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Stream-JSON from CLI** | Real-time, structured, first-party API, includes all events | Tied to Claude Code CLI output format | **SELECTED** |
| **Watch log files** | Decoupled from CLI process, works even if bridge starts after CLI | Log format not stable, parsing is fragile, higher latency | Rejected |

### 12.4. Single Bridge Process vs Per-Bot Processes

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Single process, multiple bots** | Simple deployment, shared state, one systemd unit | Single point of failure | **SELECTED** |
| **Per-bot processes** | Fault isolation, independent scaling | N processes to manage, IPC needed for shared state (session, queue) | Overkill for single user |

### 12.5. Direct Claude API vs Claude CLI

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Claude CLI (`claude -p`)** | Gets ALL AIOS context (CLAUDE.md, rules, settings, MCP), session persistence, agent system, tool permissions | Dependency on CLI version, process spawn overhead | **SELECTED** |
| **Direct Anthropic API** | Lower latency, more control, no CLI dependency | Must re-implement ALL context loading (CLAUDE.md, agent personas, rules, MCP, settings), loses AIOS agent system entirely | Rejected (would require rebuilding AIOS from scratch) |

This is the most important trade-off. Using the Claude CLI means the Telegram bridge inherits the entire AIOS ecosystem for free. Using the API directly would mean the bridge needs to manually load agent personas, inject system prompts, manage tool permissions, handle MCP servers, and enforce the Constitution. That is essentially rebuilding AIOS as a library, which is out of scope.

---

## 13. Implementation Plan

### Phase 1: Foundation (Estimated: 2-3 days)

**Goal:** Single bot (master) that can send commands and receive responses.

| Task | File | Estimated Effort |
|------|------|-----------------|
| Create package structure | `/home/ubuntu/aios-core/packages/telegram-bridge/` | 30 min |
| Initialize npm package | `package.json` with grammY, dotenv, pino, yaml | 15 min |
| Create bot tokens via @BotFather | 4 bots: master, dev, qa, architect | 20 min |
| Write `.env` template | `.env.example` | 10 min |
| Write `bots.yaml` config | `config/bots.yaml` | 15 min |
| Implement BotManager (single bot first) | `src/bot-manager.js` | 2 hours |
| Implement SessionManager | `src/session-manager.js` | 3 hours |
| Implement basic StreamParser | `src/stream-parser.js` | 2 hours |
| Wire index.js (master bot only) | `src/index.js` | 1 hour |
| End-to-end test: send message, get response | Manual testing | 1 hour |
| Create systemd unit file | `/etc/systemd/system/aios-telegram-bridge.service` | 30 min |

**Deliverable:** Lucas sends a message to @aios_master_bot, receives Claude Code's response.

### Phase 2: Multi-Bot Observability (Estimated: 2-3 days)

**Goal:** Agent detection and routing to dedicated bots.

| Task | File | Estimated Effort |
|------|------|-----------------|
| Implement agent detection in StreamParser | `src/stream-parser.js` | 3 hours |
| Implement AgentRouter | `src/agent-router.js` | 2 hours |
| Implement MessageFormatter | `src/message-formatter.js` | 2 hours |
| Implement RateLimiter | `src/rate-limiter.js` | 1.5 hours |
| Connect all 4 bots | `src/bot-manager.js`, `src/index.js` | 1 hour |
| Test multi-agent delegation flow | Manual testing | 2 hours |
| Write unit tests | `test/*.test.js` | 3 hours |

**Deliverable:** Full Flow B working -- delegation visible across multiple Telegram bots.

### Phase 3: Production Hardening (Estimated: 2-3 days)

**Goal:** Reliable operation for daily use.

| Task | File | Estimated Effort |
|------|------|-----------------|
| Implement CommandQueue | `src/command-queue.js` | 2 hours |
| Implement message batching | `src/message-formatter.js` | 2 hours |
| Implement sensitive data redaction | `src/message-formatter.js` | 1.5 hours |
| Add `/status`, `/queue`, `/cancel` commands | `src/bot-manager.js` | 2 hours |
| Add verbosity level control | `src/agent-router.js` | 1 hour |
| Error recovery and retry logic | `src/session-manager.js` | 2 hours |
| Health check endpoint (optional) | `src/health-check.js` | 1 hour |
| Comprehensive testing | All test files | 3 hours |
| Documentation | `README.md` in package dir | 1 hour |

**Deliverable:** Production-ready bridge that handles edge cases, rate limits, and errors gracefully.

### Phase 4: Extended Bot Fleet (Estimated: 1-2 days)

**Goal:** Add Phase 2 bots (pm, devops, analyst).

| Task | Estimated Effort |
|------|-----------------|
| Create 3 new bot tokens via @BotFather | 15 min |
| Update `bots.yaml` and `.env` | 15 min |
| Test routing to new bots | 1 hour |
| Add agent-specific command menus per bot | 1 hour |

### Phase 5: Future Enhancements (Backlog)

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Local notification API | HTTP endpoint for AIOS scripts to push Telegram messages directly | MEDIUM |
| Inline keyboards | Interactive buttons for QA verdicts (PASS/FAIL) | LOW |
| File sharing | Send diffs, screenshots, reports as Telegram files | MEDIUM |
| Voice messages | Lucas sends voice, bridge transcribes and forwards | LOW |
| Webhook mode | Replace polling with Telegram webhooks for lower latency | LOW |
| Conversation threading | Use Telegram reply threads to group delegation chains | MEDIUM |
| Dashboard channel | A Telegram channel (not bot) for broadcast-only observability | LOW |

### File Manifest (All Phases)

| File | Purpose |
|------|---------|
| `/home/ubuntu/aios-core/packages/telegram-bridge/package.json` | NPM package definition |
| `/home/ubuntu/aios-core/packages/telegram-bridge/.env` | Bot tokens and config (gitignored) |
| `/home/ubuntu/aios-core/packages/telegram-bridge/.env.example` | Template for .env |
| `/home/ubuntu/aios-core/packages/telegram-bridge/config/bots.yaml` | Bot-to-agent mapping |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/index.js` | Entry point |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/bot-manager.js` | grammY bot lifecycle |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/session-manager.js` | Claude CLI process management |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/stream-parser.js` | stream-json event parser |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/observability-bus.js` | Event bus |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/agent-router.js` | Event-to-bot routing |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/rate-limiter.js` | Telegram rate limiting |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/message-formatter.js` | Message formatting and sanitization |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/command-queue.js` | Sequential command execution |
| `/home/ubuntu/aios-core/packages/telegram-bridge/src/health-check.js` | Health monitoring |
| `/home/ubuntu/aios-core/packages/telegram-bridge/test/stream-parser.test.js` | StreamParser unit tests |
| `/home/ubuntu/aios-core/packages/telegram-bridge/test/agent-router.test.js` | AgentRouter unit tests |
| `/home/ubuntu/aios-core/packages/telegram-bridge/test/message-formatter.test.js` | MessageFormatter unit tests |
| `/home/ubuntu/aios-core/packages/telegram-bridge/test/command-queue.test.js` | CommandQueue unit tests |
| `/etc/systemd/system/aios-telegram-bridge.service` | systemd service definition |

---

## 14. Open Questions

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| 1 | How does `--output-format stream-json` structure its events exactly? The format is not fully documented. | StreamParser accuracy | Build a test harness: run `claude -p --output-format stream-json --include-partial-messages "hello"` and capture raw output to map the exact event schema. Adapt parser accordingly. |
| 2 | Does `--resume` with `--output-format stream-json` work reliably? | Session persistence for multi-command workflows | Test empirically. Fallback: use `--session-id` with a new UUID per session "block" (group of related commands). |
| 3 | Should the bridge run as `ubuntu` user or `root`? | Security, file permissions | Run as `ubuntu` (same user that owns the AIOS codebase). Claude Code runs as ubuntu natively. No root needed. |
| 4 | Telegram user ID for Lucas -- how to obtain? | Authentication | Send `/start` to @userinfobot on Telegram, or check `ctx.from.id` in the first message to any AIOS bot. Store in `.env`. |
| 5 | Should agent bots accept rich commands (e.g., `/review PR #123` on @aios_qa_bot)? | UX, scope creep | Phase 1: text only. Phase 2+: add agent-specific slash commands as needed. Keep the bridge thin. |
| 6 | What happens when Claude Code's session context fills up? | Long-running sessions may degrade | The bridge creates a new session (new UUID) when the previous one hits a token limit error. The user is notified: "Session reset due to context limit." |
| 7 | Should the bridge integrate with the existing inbox/outbox system from the @gateway architecture? | Architectural coherence | Not in Phase 1. The inbox/outbox is for WhatsApp (async, file-based). Telegram is synchronous (stream-based). Different IPC models for different channels. Future: unified notification bus. |
| 8 | How to handle `--dangerously-skip-permissions` safely? | Security | This flag is required because the bridge cannot answer interactive permission prompts. Mitigation: the AIOS `.claude/settings.json` already defines allowed/denied tools. The `--dangerously-skip-permissions` flag only skips the interactive prompt, not the deny rules. |

---

## Appendix A: Complete `bots.yaml` Reference

```yaml
# /home/ubuntu/aios-core/packages/telegram-bridge/config/bots.yaml
#
# Bot Configuration for AIOS Telegram Observability Bridge
# Each bot maps to one AIOS agent and has a mode (command or observe).

bots:
  # Phase 1 bots (essential)
  master:
    agent_id: aios-master
    token_env: TELEGRAM_MASTER_TOKEN
    username: aios_master_bot
    mode: command
    phase: 1
    description: "Command entry point. Sends commands to AIOS Master."
    commands:
      - { name: start, description: "Initialize connection" }
      - { name: status, description: "AIOS system status" }
      - { name: help, description: "Available commands" }
      - { name: queue, description: "Show command queue" }
      - { name: cancel, description: "Cancel current operation" }
      - { name: session, description: "Session info (ID, uptime, turns)" }
      - { name: reset, description: "Start a fresh session" }

  dev:
    agent_id: dev
    token_env: TELEGRAM_DEV_TOKEN
    username: aios_dev_bot
    mode: observe
    phase: 1
    description: "Observability for @dev (Dex). Code implementation, tests, git."
    commands:
      - { name: start, description: "Connect to dev channel" }
      - { name: verbose, description: "Toggle verbosity level" }

  qa:
    agent_id: qa
    token_env: TELEGRAM_QA_TOKEN
    username: aios_qa_bot
    mode: observe
    phase: 1
    description: "Observability for @qa (Quinn). QA gates, test verdicts."
    commands:
      - { name: start, description: "Connect to QA channel" }
      - { name: verbose, description: "Toggle verbosity level" }

  architect:
    agent_id: architect
    token_env: TELEGRAM_ARCH_TOKEN
    username: aios_arch_bot
    mode: observe
    phase: 1
    description: "Observability for @architect (Aria). Architecture decisions."
    commands:
      - { name: start, description: "Connect to architect channel" }
      - { name: verbose, description: "Toggle verbosity level" }

  # Phase 2 bots (extended)
  pm:
    agent_id: pm
    token_env: TELEGRAM_PM_TOKEN
    username: aios_pm_bot
    mode: observe
    phase: 2
    description: "Observability for @pm (Morgan). Epics, specs, requirements."

  devops:
    agent_id: devops
    token_env: TELEGRAM_DEVOPS_TOKEN
    username: aios_devops_bot
    mode: observe
    phase: 2
    description: "Observability for @devops (Gage). Push, CI/CD, releases."

  analyst:
    agent_id: analyst
    token_env: TELEGRAM_ANALYST_TOKEN
    username: aios_analyst_bot
    mode: observe
    phase: 2
    description: "Observability for @analyst (Alex). Research, analysis."

# Maps AIOS agent IDs to bot keys.
# Agents without dedicated bots fall back to master.
agent_to_bot_map:
  aios-master: master
  dev: dev
  qa: qa
  architect: architect
  pm: pm
  devops: devops
  analyst: analyst
  po: master          # No dedicated bot yet
  sm: master          # No dedicated bot yet
  data-engineer: master
  ux-design-expert: master
  squad-creator: master
  gateway: master     # @gateway uses WhatsApp, not Telegram
```

## Appendix B: `.env.example`

```bash
# /home/ubuntu/aios-core/packages/telegram-bridge/.env.example
#
# Copy to .env and fill in values.
# NEVER commit .env to git.

# === Telegram Bot Tokens (from @BotFather) ===
TELEGRAM_MASTER_TOKEN=
TELEGRAM_DEV_TOKEN=
TELEGRAM_QA_TOKEN=
TELEGRAM_ARCH_TOKEN=
# Phase 2 (optional)
TELEGRAM_PM_TOKEN=
TELEGRAM_DEVOPS_TOKEN=
TELEGRAM_ANALYST_TOKEN=

# === Authorization ===
# Lucas's Telegram user ID (number, not username)
# Get via: send /start to @userinfobot on Telegram
TELEGRAM_OWNER_ID=

# === Claude Code ===
CLAUDE_CLI_PATH=/usr/bin/claude
AIOS_PROJECT_DIR=/home/ubuntu/aios-core

# === Session ===
# Auto-reset session after N minutes of inactivity
SESSION_TIMEOUT_MINUTES=60
# Maximum commands in queue
MAX_QUEUE_SIZE=10

# === Logging ===
LOG_LEVEL=info
```

## Appendix C: Backward Compatibility Matrix

| Existing Feature | Impact | Notes |
|-----------------|--------|-------|
| WhatsApp / OpenClaw | NONE | Completely independent. Different process, different channel. |
| @gateway Personal Memory Guardian | NONE | @gateway operates on WhatsApp only. Telegram bridge has no @gateway concept. |
| Agent handoff protocol | NONE | Works natively in Claude Code session. Bridge observes, does not modify. |
| Agent authority rules | NONE | Enforced by Claude Code, not the bridge. |
| Story-driven development | NONE | Commands reference stories normally. |
| MCP servers | NONE | Claude Code loads MCP servers per its config. Bridge has no MCP dependency. |
| CLAUDE.md / Constitution | NONE | Loaded by Claude Code when session starts. Bridge inherits all rules. |
| `openclaw message send` | NONE | WhatsApp notification continues to work. Telegram is additive. |
| `.aios/inbox/` system | NONE | Inbox is for WhatsApp async messages. Telegram is synchronous. |
| git push authority (@devops) | NONE | Enforced by Claude Code. If Lucas sends push via Telegram, @devops rules apply. |

## Appendix D: Monitoring and Troubleshooting

### Service Management

```bash
# Start the bridge
sudo systemctl start aios-telegram-bridge

# Stop the bridge
sudo systemctl stop aios-telegram-bridge

# Check status
sudo systemctl status aios-telegram-bridge

# View logs (real-time)
journalctl -u aios-telegram-bridge -f

# View logs (last 100 lines)
journalctl -u aios-telegram-bridge -n 100

# Restart after config changes
sudo systemctl restart aios-telegram-bridge
```

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Bot not responding | Missing bot token in .env | Check `TELEGRAM_*_TOKEN` values |
| "Unauthorized" reply | Wrong TELEGRAM_OWNER_ID | Verify with @userinfobot |
| Commands hang | Claude CLI not in PATH | Check `CLAUDE_CLI_PATH` |
| Rate limit errors in log | Too many messages/second | Increase `burstSize` or reduce verbosity |
| Session context errors | Session UUID expired or corrupted | Send `/reset` to master bot |
| "Failed to spawn" errors | Wrong user/permissions | Ensure service runs as `ubuntu` |

### Health Check

The bridge optionally exposes a simple HTTP health endpoint on `localhost:3847/health`:

```json
{
  "status": "healthy",
  "uptime_seconds": 3600,
  "bots_active": 4,
  "session_id": "550e8400-...",
  "queue_depth": 0,
  "last_command_at": "2026-03-01T15:30:00Z"
}
```

---

*Architecture by Aria, arquitetando o futuro.*

---

**Auto-Decisions Log:**

| Question | Decision | Reason |
|----------|----------|--------|
| Standalone package or integrated into core? | Standalone at `packages/telegram-bridge/` | Follows AIOS package architecture; independent development and deployment cycle |
| grammY or Telegraf or node-telegram-bot-api? | grammY | Most active maintenance in 2025-2026, TypeScript-first, built-in flood control, multi-bot friendly |
| Session architecture: A (single), B (multi-process), C (Task subagents)? | A (single session with agent switching) | Matches existing AIOS behavior, lowest complexity and resource usage, agent handoff protocol works natively |
| `--print` with `--resume` or persistent interactive session? | `--print` with `--resume` | Clean process lifecycle per command, crash recovery is trivial, no memory leak risk, Claude Code handles session persistence |
| Stream-JSON or watch log files? | Stream-JSON | Real-time, structured, first-party API, all events included |
| Claude API directly or Claude CLI? | Claude CLI | Gets ALL AIOS context for free (CLAUDE.md, rules, agents, MCP, settings); API would require rebuilding AIOS as a library |
| Run as ubuntu or root? | ubuntu | Same user that owns the AIOS codebase; no root privileges needed |
| Integrate with @gateway inbox system? | No (Phase 1) | Different IPC models: Telegram is synchronous (streams), WhatsApp is async (files). Future: unified notification bus. |
