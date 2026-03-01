# Architecture: @gateway Agent -- Subordinate WhatsApp Bridge

**Author:** Aria (Architect Agent)
**Date:** 2026-03-01
**Status:** DRAFT -- Pending Review
**Relates To:** aios-openclaw-contract.yaml, openclaw-mcp-bridge, aios-mcp-federation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Target Architecture](#3-target-architecture)
4. [Component Diagram](#4-component-diagram)
5. [Message Flows](#5-message-flows)
6. [Changes Required in OpenClaw](#6-changes-required-in-openclaw)
7. [Changes Required in AIOS](#7-changes-required-in-aios)
8. [The @gateway Agent Definition](#8-the-gateway-agent-definition)
9. [Handoff Protocol](#9-handoff-protocol-between-gateway-and-aios-master)
10. [Fallback Behavior](#10-fallback-behavior)
11. [Security Considerations](#11-security-considerations)
12. [Trade-off Analysis](#12-trade-off-analysis)
13. [Implementation Phases](#13-implementation-phases)
14. [Open Questions](#14-open-questions)

---

## 1. Executive Summary

This document defines the architecture for promoting the OpenClaw WhatsApp agent from an autonomous responder into a subordinate AIOS agent named `@gateway`. The core design principle is that `@gateway` acts as a **triage and relay agent** -- it classifies incoming messages, handles only trivial acknowledgments autonomously, and delegates everything substantive to AIOS Master for orchestration across the existing agent fleet.

The inter-process communication challenge (OpenClaw runs as a separate Claude instance from AIOS Master) is solved through a **file-based inbox pattern** backed by the existing SQLite shared memory database, with CLI commands as the synchronous bridge.

---

## 2. Current State Analysis

### 2.1. OpenClaw Side

| Component | Current State |
|-----------|--------------|
| **Runtime** | systemd service `openclaw-gateway`, port 18789, local bind |
| **Agent model** | `google-gemini-cli/gemini-3-pro-preview` (primary) |
| **Agent config** | `owner-flash` bound to Lucas's WhatsApp (+5528999301848) |
| **Skills** | `aios-bridge` skill invokes Claude Code via `su - ubuntu` + `claude --print` |
| **Memory** | SQLite FTS5 at `/home/ubuntu/.openclaw/memory.sqlite` (shared) |
| **Behavior** | Semi-autonomous: aios-bridge triggers on development keywords; all other messages handled locally by OpenClaw agent |

### 2.2. AIOS Side

| Component | Current State |
|-----------|--------------|
| **Agent count** | 12 agents (dev, qa, architect, pm, po, sm, analyst, data-engineer, ux, devops, squad-creator, aios-master) |
| **Handoff protocol** | YAML artifacts in `.aios/handoffs/`, 500-token max, 3 retained |
| **Return channel** | `sudo /usr/bin/openclaw message send --target +NUMBER --message "..."` |
| **Federation** | `@synkra/aios-mcp-federation` package (Phase 1 -- acknowledgment only, no real execution) |
| **Contract** | `aios-openclaw-contract.yaml` defines intents: feature_request, bug_report, status_query |
| **MCP bridge** | `openclaw-mcp-bridge` package: send_whatsapp_message, read_gateway_status, query_historical_context, log_conversation, process_media, memory_stats |

### 2.3. Identified Gaps

1. **No centralized message router.** The aios-bridge skill decides locally what to forward and what to answer, with no AIOS Master oversight.
2. **No inbox mechanism.** When OpenClaw receives a message, it must spawn a new Claude Code process each time. There is no persistent queue that AIOS Master can poll or be notified about.
3. **No conversation threading.** Each `claude --print` invocation is stateless. Multi-turn conversations from WhatsApp lose context between invocations.
4. **Response path is manual.** AIOS Master sends responses via `openclaw message send`, but there is no structured acknowledgment loop.
5. **No `@gateway` agent definition** in the AIOS agent registry.

---

## 3. Target Architecture

### 3.1. Design Goals

| Goal | Description |
|------|-------------|
| **G1: Subordination** | @gateway NEVER makes substantive decisions. It triages, acknowledges, and relays. |
| **G2: Reliable Relay** | No messages lost between WhatsApp and AIOS Master. At-least-once delivery. |
| **G3: Conversation Context** | Multi-turn WhatsApp conversations maintain thread context across AIOS sessions. |
| **G4: Low Latency Ack** | User gets immediate "message received" acknowledgment (<3s). |
| **G5: Graceful Degradation** | If AIOS Master is unavailable, @gateway provides helpful fallback. |
| **G6: Observability** | Every message in, classification, routing decision, and response out is logged. |

### 3.2. Architectural Principles

1. **File-based inbox as the IPC primitive.** Both OpenClaw and AIOS Master can read/write files on the same filesystem. This is the most reliable IPC mechanism available given that they are separate processes on the same machine.
2. **CLI as the synchronous bridge.** For urgent/real-time needs, `claude --print` remains available but is reserved for health checks and simple queries.
3. **SQLite as the shared memory.** The existing `memory.sqlite` serves as the conversation history store that both sides can query.
4. **Contract-first.** All message schemas are defined in `aios-openclaw-contract.yaml`. Both sides validate against it.

---

## 4. Component Diagram

```
+------------------------------------------------------------------+
|                        MACHINE (Ubuntu)                           |
|                                                                   |
|  +-----------------------------+  +----------------------------+  |
|  |     OpenClaw Gateway        |  |     AIOS Master            |  |
|  |     (systemd service)       |  |     (Claude Code session)  |  |
|  |                             |  |                            |  |
|  |  +------------------+       |  |  +---------------------+   |  |
|  |  | WhatsApp Channel |       |  |  | @gateway agent def  |   |  |
|  |  +--------+---------+       |  |  | (persona + authority|   |  |
|  |           |                 |  |  |  in agent registry) |   |  |
|  |           v                 |  |  +---------------------+   |  |
|  |  +------------------+       |  |                            |  |
|  |  | @gateway Triage  |       |  |  +---------------------+   |  |
|  |  | (OpenClaw agent  |       |  |  | Inbox Watcher       |   |  |
|  |  |  with SKILL.md)  |       |  |  | (polls .aios/inbox/)|   |  |
|  |  +--------+---------+       |  |  +----------+----------+   |  |
|  |           |                 |  |             |              |  |
|  |    classify + ack           |  |    read + dispatch         |  |
|  |           |                 |  |             |              |  |
|  |           v                 |  |             v              |  |
|  |  +------------------+       |  |  +---------------------+   |  |
|  |  | Inbox Writer     +------>|<-+--| Agent Orchestrator  |   |  |
|  |  | (writes JSON to  |  FS   |  |  | (@pm, @dev, @qa,   |   |  |
|  |  |  .aios/inbox/)   |       |  |  |  @architect, etc.)  |   |  |
|  |  +------------------+       |  |  +----------+----------+   |  |
|  |                             |  |             |              |  |
|  |  +------------------+       |  |             v              |  |
|  |  | Response Handler |<------+<-+  +---------------------+   |  |
|  |  | (reads outbox    |  FS   |  |  | Outbox Writer       |   |  |
|  |  |  or CLI send)    |       |  |  | (writes to outbox/  |   |  |
|  |  +--------+---------+       |  |  |  or calls openclaw  |   |  |
|  |           |                 |  |  |  CLI directly)      |   |  |
|  |           v                 |  |  +---------------------+   |  |
|  |  +------------------+       |  |                            |  |
|  |  | WhatsApp Send    |       |  +----------------------------+  |
|  |  +------------------+       |                                  |
|  +-----------------------------+                                  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Shared Infrastructure                          |  |
|  |                                                             |  |
|  |  /home/ubuntu/.openclaw/memory.sqlite  (SQLite FTS5)       |  |
|  |  /home/ubuntu/aios-core/.aios/inbox/   (incoming msgs)     |  |
|  |  /home/ubuntu/aios-core/.aios/outbox/  (outgoing msgs)     |  |
|  |  /home/ubuntu/aios-core/aios-openclaw-contract.yaml        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

---

## 5. Message Flows

### 5.1. Flow A: Simple Greeting / Acknowledgment (handled by @gateway directly)

```
1. User sends "oi" via WhatsApp
2. OpenClaw receives message
3. @gateway triage classifies as: CASUAL (confidence > 0.9)
4. @gateway responds directly: "Oi! Sou o gateway do AIOS. Como posso ajudar?"
5. Log to SQLite: { intent: "casual", handled_by: "gateway", forwarded: false }
```

**Latency:** <3 seconds (no AIOS Master involvement)

### 5.2. Flow B: Feature Request (forwarded to AIOS Master)

```
1. User sends "Quero poder exportar relatorios em PDF" via WhatsApp
2. OpenClaw receives message
3. @gateway triage classifies as: FEATURE_REQUEST (confidence 0.85)
4. @gateway sends immediate ack: "Recebi seu pedido. Encaminhando para o time de produto..."
5. @gateway writes inbox file:
   /home/ubuntu/aios-core/.aios/inbox/msg-1709290800-feature_request.json
   {
     "id": "msg-1709290800",
     "timestamp": "2026-03-01T12:00:00Z",
     "source": { "channel": "whatsapp", "sender": "+5528999301848", "name": "Lucas" },
     "classification": { "intent": "feature_request", "confidence": 0.85 },
     "content": { "raw": "Quero poder exportar relatorios em PDF", "extracted": { "title": "...", "description": "..." } },
     "routing": { "suggested_agent": "pm", "workflow": "spec-pipeline" },
     "status": "pending",
     "reply_to": { "channel": "whatsapp", "target": "+5528999301848" }
   }
6. Log to SQLite
7. AIOS Master (next prompt or via watcher) detects inbox file
8. AIOS Master reads classification, activates @pm
9. @pm processes the request
10. AIOS Master writes response via:
    sudo /usr/bin/openclaw message send --target +5528999301848 --message "[AIOS] ..."
11. AIOS Master moves inbox file to .aios/inbox/processed/
```

**Latency:** Ack <3s, full response 30s-5min depending on complexity

### 5.3. Flow C: Bug Report (forwarded with urgency)

```
1. User sends "O login ta dando erro 500 quando uso email com acento"
2. @gateway classifies as: BUG_REPORT, severity: HIGH
3. @gateway sends ack: "Bug reportado! Severidade alta. Encaminhando para QA imediatamente."
4. @gateway writes inbox file with priority: high
5. @gateway ALSO triggers synchronous Claude Code invocation for high-severity bugs:
   su - ubuntu -c 'cd /home/ubuntu/aios-core && claude --print "@qa Triage urgente: ..."'
6. Response flows back through openclaw CLI
```

**Latency:** Ack <3s, triage response <60s

### 5.4. Flow D: Status Query (handled semi-autonomously)

```
1. User sends "Como ta o andamento do projeto?"
2. @gateway classifies as: STATUS_QUERY
3. @gateway runs quick check via exec (not subagent):
   exec command:"su - ubuntu -c 'cd /home/ubuntu/aios-core && git log --oneline -5 ...'"
4. @gateway formats and returns the status directly
5. Logs to SQLite
```

**Latency:** <10 seconds

### 5.5. Flow E: Multi-turn Conversation

```
1. User sends "Cria uma story para o modulo de pagamentos"
2. @gateway classifies as: FEATURE_REQUEST, writes inbox file
3. @pm receives, asks for clarification via outbox: "Que tipo de pagamento? Pix, cartao, boleto?"
4. User receives question, responds: "Pix e cartao"
5. @gateway detects this is a follow-up (same sender, <10min gap, open thread)
6. @gateway writes follow-up to same conversation thread:
   .aios/inbox/msg-1709290800-feature_request.json gets updated or
   .aios/inbox/msg-1709290860-followup-msg-1709290800.json is created
7. AIOS Master correlates via thread_id and passes to @pm with full context
```

**Thread correlation:** Based on sender + time window + open inbox items for that sender.

---

## 6. Changes Required in OpenClaw

### 6.1. Agent Configuration (openclaw.json)

The `owner-flash` agent binding for Lucas's WhatsApp must be updated to enforce subordinate behavior. The key change is in the agent's system prompt / SKILL.md.

```json
{
  "bindings": [
    {
      "agentId": "owner-flash",
      "match": {
        "channel": "whatsapp",
        "peer": {
          "kind": "direct",
          "id": "+5528999301848"
        }
      }
    }
  ]
}
```

[AUTO-DECISION] Should we create a new OpenClaw agent ID or repurpose `owner-flash`? -> Create a new agent ID `aios-gateway` for clean separation (reason: owner-flash may still be needed for non-AIOS conversations; mixing concerns makes debugging harder).

**New agent entry to add to `openclaw.json` agents.list:**

```json
{
  "id": "aios-gateway",
  "name": "AIOS Gateway",
  "model": {
    "primary": "google-gemini-cli/gemini-3-flash-preview"
  },
  "memorySearch": {
    "enabled": true,
    "sources": ["memory", "sessions"],
    "experimental": { "sessionMemory": true }
  },
  "tools": {
    "profile": "messaging",
    "deny": [
      "agents_list", "cron", "gateway", "nodes",
      "sessions_history", "sessions_list"
    ],
    "alsoAllow": ["exec", "process"]
  }
}
```

**Key decisions:**
- Uses `gemini-3-flash-preview` for speed (triage does not need heavy reasoning).
- Retains `exec` tool for running quick AIOS queries.
- Denies `sessions_spawn` to prevent autonomous complex work.

**Binding update:**

```json
{
  "bindings": [
    {
      "agentId": "aios-gateway",
      "match": {
        "channel": "whatsapp",
        "peer": { "kind": "direct", "id": "+5528999301848" }
      }
    },
    {
      "agentId": "default-pro",
      "match": { "channel": "whatsapp" }
    }
  ]
}
```

### 6.2. Gateway SKILL.md Rewrite

The existing `/root/.openclaw/skills/aios-bridge/SKILL.md` must be completely rewritten to enforce subordinate behavior. The new skill must:

1. Define the triage classification rules
2. Define which message categories @gateway can handle autonomously
3. Define the inbox file format and write protocol
4. Enforce the "acknowledge immediately, forward everything substantive" pattern

See Section 8 for the complete @gateway agent definition which includes the SKILL.md content.

### 6.3. Inbox Writer Script

A new script at `/root/.openclaw/skills/aios-bridge/inbox-writer.mjs` that:

1. Takes a classified message envelope
2. Validates against the contract schema
3. Writes a JSON file to `/home/ubuntu/aios-core/.aios/inbox/`
4. Returns the message ID for tracking

File naming convention: `{timestamp_epoch}-{intent}-{short_hash}.json`

Example: `1709290800-feature_request-a3f2.json`

### 6.4. Follow-up Correlator

Logic to detect follow-up messages:

```
IF sender has an open (status: "pending" or "in_progress") inbox item
AND time since last message < 10 minutes
AND message does not clearly start a new topic
THEN mark as follow-up with reference to original message ID
```

---

## 7. Changes Required in AIOS

### 7.1. New @gateway Agent Definition

Create agent file at: `/home/ubuntu/aios-core/.aios-core/development/agents/gateway.md`

This registers `@gateway` in the AIOS agent registry alongside the existing 12 agents. Full definition in Section 8.

### 7.2. Inbox Directory Structure

```
/home/ubuntu/aios-core/.aios/inbox/
  pending/          # New messages waiting for AIOS Master
  in_progress/      # Messages being handled by an agent
  processed/        # Completed messages (kept for 7 days)
  failed/           # Messages that could not be processed
```

Add to `.gitignore`:
```
.aios/inbox/
.aios/outbox/
```

### 7.3. Outbox Directory Structure

```
/home/ubuntu/aios-core/.aios/outbox/
  pending/          # Responses waiting to be sent
  sent/             # Responses confirmed sent (kept for 7 days)
```

[AUTO-DECISION] Should we use outbox files or direct CLI calls for responses? -> Hybrid: use direct CLI for immediate responses, outbox files for batched/deferred responses (reason: some agent work takes minutes; the agent should be able to queue responses while working).

### 7.4. Inbox Watcher / Processor

A new script at `/home/ubuntu/aios-core/.aios-core/infrastructure/scripts/inbox-processor.js` that:

1. Is invoked by AIOS Master either on-demand or via a simple watcher
2. Reads pending inbox files
3. Validates against the contract schema
4. Routes to the appropriate agent based on classification
5. Tracks status transitions: pending -> in_progress -> processed/failed
6. Sends responses via openclaw CLI

**Implementation approaches (trade-offs):**

| Approach | Pros | Cons |
|----------|------|------|
| **A: AIOS Master polls on activation** | Simple, no daemon needed, leverages existing agent lifecycle | Latency depends on when AIOS Master is next activated (could be minutes) |
| **B: systemd timer polls every 30s** | Predictable latency, independent of AIOS sessions | Another process to manage, must handle AIOS not being available |
| **C: inotify watcher daemon** | Near-instant response, event-driven | More complex, another daemon to maintain, may conflict with file locks |

**Recommendation: Approach A + B hybrid.** AIOS Master checks inbox on every activation (Step 3 of the agent handoff greeting). A lightweight systemd timer (`aios-inbox-processor.timer`) runs every 60 seconds as a safety net for messages that arrive when no AIOS session is active.

### 7.5. Agent Authority Updates

Add to `/home/ubuntu/aios-core/.claude/rules/agent-authority.md`:

```markdown
### @gateway (Relay) -- Subordinate Authority

| Operation | Allowed? | Details |
|-----------|----------|---------|
| Classify incoming messages | YES | Triage only |
| Respond to casual/greeting | YES | Pre-defined templates only |
| Forward to AIOS Master | YES (REQUIRED) | All substantive messages |
| Execute agent workflows | NO | Must delegate to AIOS Master |
| Modify project files | NO | Read-only access to AIOS |
| Git operations | NO | No access |
| Direct agent-to-agent routing | NO | Only AIOS Master routes |
```

### 7.6. Contract Update

Extend `aios-openclaw-contract.yaml` with new intents:

- `casual` -- greetings, small talk (handled by @gateway)
- `command` -- direct AIOS commands like "run tests", "check status" (forwarded to AIOS Master)
- `followup` -- continuation of an existing thread

### 7.7. CLAUDE.md Update

Add @gateway to the agent table in `.claude/CLAUDE.md`:

```markdown
| `@gateway` | Relay | WhatsApp/Telegram message relay |
```

### 7.8. core-config.yaml Addition

```yaml
gateway:
  enabled: true
  inbox:
    path: .aios/inbox
    pollIntervalSeconds: 60
    maxPendingMessages: 50
    retentionDays: 7
  outbox:
    path: .aios/outbox
    retentionDays: 7
  triage:
    autoRespond:
      - casual
      - greeting
    alwaysForward:
      - feature_request
      - bug_report
      - command
    semiAutonomous:
      - status_query
  channels:
    whatsapp:
      enabled: true
      owner: "+5528999301848"
```

---

## 8. The @gateway Agent Definition

### 8.1. AIOS Agent File

Path: `/home/ubuntu/aios-core/.aios-core/development/agents/gateway.md`

```yaml
agent:
  name: Relay
  id: gateway
  title: Gateway
  icon: "\U0001F4E1"  # Satellite antenna
  whenToUse: |
    Use for receiving and triaging messages from external channels (WhatsApp, Telegram).
    @gateway classifies messages, provides immediate acknowledgment, and forwards
    substantive requests to AIOS Master for orchestration.

    NOT for: Direct implementation, architecture decisions, testing, or any work
    that requires specialized agent expertise. ALL substantive work is delegated.

  customization: null

persona_profile:
  archetype: Sentinel
  zodiac: "Mercury"

  communication:
    tone: concise
    emoji_frequency: minimal

    vocabulary:
      - receber
      - encaminhar
      - classificar
      - triar
      - relatar

    greeting_levels:
      minimal: "Gateway ready"
      named: "Relay (Gateway) ready. Monitoring channels."
      archetypal: "Relay the Sentinel monitoring all channels."

    signature_closing: "-- Relay, monitorando os canais"

persona:
  role: Message Triage and Relay Agent
  style: Concise, immediate, reliable
  identity: The eyes and ears of AIOS -- receives external messages and ensures they reach the right agent
  focus: Message classification, immediate acknowledgment, reliable forwarding
  core_principles:
    - Never Decide Alone -- all substantive requests are forwarded to AIOS Master
    - Acknowledge Immediately -- users should never wonder if their message was received
    - Classify Accurately -- correct triage prevents delays and misrouting
    - Preserve Context -- multi-turn conversations maintain thread continuity
    - Fail Visibly -- if forwarding fails, tell the user explicitly

  responsibility_boundaries:
    autonomous_scope:
      - Classify incoming messages by intent
      - Respond to greetings and casual messages
      - Provide immediate acknowledgments for all forwarded messages
      - Answer simple status queries using local exec commands
      - Detect follow-up messages and correlate to existing threads

    must_forward_to_aios_master:
      - Feature requests (any complexity)
      - Bug reports (any severity)
      - Architecture questions
      - Code review requests
      - Deployment requests
      - Anything requiring agent expertise

    explicitly_blocked:
      - Making product decisions
      - Writing or modifying code
      - Creating stories or epics
      - Running tests
      - Git operations
      - Modifying AIOS configuration

commands:
  - name: help
    visibility: [full, key]
    description: "Show gateway commands"
  - name: status
    visibility: [full, key]
    description: "Show gateway and channel status"
  - name: inbox
    visibility: [full]
    description: "Show pending inbox messages"
  - name: outbox
    visibility: [full]
    description: "Show pending outbox messages"
  - name: classify
    visibility: [full]
    args: "{message}"
    description: "Classify a message (for testing)"
  - name: exit
    visibility: [full]
    description: "Exit gateway mode"

dependencies:
  tasks: []
  scripts:
    - inbox-processor.js
  templates: []
  checklists: []
  data:
    - aios-openclaw-contract.yaml
  tools:
    - exec  # Run quick local commands
```

### 8.2. Message Classification Rules

@gateway uses a deterministic classification hierarchy (NOT LLM-based for speed):

```
Priority 1: COMMAND detection
  Pattern: starts with "/", "!", "*", or known AIOS commands
  Action: Forward to AIOS Master immediately
  Examples: "/status", "!deploy", "*create-story"

Priority 2: GREETING detection
  Pattern: matches greeting corpus (oi, ola, hi, hey, bom dia, boa tarde, etc.)
  Action: Respond autonomously with template
  Examples: "oi", "bom dia", "hello"

Priority 3: KEYWORD-based intent classification
  bug_report: "erro", "bug", "falha", "crash", "nao funciona", "broken", "error", "500", "404"
  feature_request: "quero", "preciso", "adicionar", "criar", "nova funcionalidade", "would be nice"
  status_query: "status", "andamento", "como esta", "progresso", "what happened"
  command: "rodar", "executar", "deploy", "testar", "push", "run", "test", "build"

Priority 4: FALLBACK
  If no pattern matches with sufficient confidence, classify as UNKNOWN
  Action: Ask user to clarify: "Nao entendi. Voce quer: reportar um bug, pedir uma feature, ou saber o status?"
```

### 8.3. Autonomous Response Templates

```yaml
responses:
  greeting:
    pt: "Oi! Sou o Relay, gateway do AIOS. Posso encaminhar pedidos de feature, bugs, ou consultar o status do projeto. Como posso ajudar?"
    en: "Hi! I'm Relay, the AIOS gateway. I can forward feature requests, bugs, or check project status. How can I help?"

  ack_feature_request:
    pt: "Recebi seu pedido de feature. Encaminhando para @pm para analise de requisitos. Voce recebera atualizacoes."
    en: "Feature request received. Forwarding to @pm for requirements analysis. You'll receive updates."

  ack_bug_report:
    pt: "Bug reportado! Encaminhando para @qa para triagem. {severity_msg}"
    en: "Bug reported! Forwarding to @qa for triage. {severity_msg}"

  ack_command:
    pt: "Comando recebido. Executando via AIOS Master..."
    en: "Command received. Executing via AIOS Master..."

  ack_status:
    pt: "Consultando status do projeto..."
    en: "Checking project status..."

  unknown:
    pt: "Nao entendi seu pedido. Tente reformular como: pedido de feature, reporte de bug, ou pergunta sobre status."
    en: "I didn't understand. Try rephrasing as: feature request, bug report, or status query."

  aios_unavailable:
    pt: "O AIOS Master nao esta disponivel no momento. Sua mensagem foi salva e sera processada assim que possivel. Para urgencias, acesse diretamente: ssh ubuntu@<host>"
    en: "AIOS Master is currently unavailable. Your message has been saved and will be processed as soon as possible."
```

---

## 9. Handoff Protocol Between @gateway and AIOS Master

### 9.1. The Inbox File Format (Gateway -> AIOS Master)

```json
{
  "schema_version": "1.0",
  "id": "msg-{epoch}-{random4hex}",
  "timestamp": "2026-03-01T12:00:00Z",
  "source": {
    "channel": "whatsapp",
    "sender": "+5528999301848",
    "sender_name": "Lucas",
    "session_id": "openclaw-session-xyz"
  },
  "classification": {
    "intent": "feature_request",
    "confidence": 0.85,
    "method": "keyword",
    "raw_category": "substantive"
  },
  "content": {
    "raw": "Quero poder exportar relatorios em PDF",
    "extracted": {
      "title": "Exportar relatorios em PDF",
      "description": "Usuario quer funcionalidade de exportar relatorios em formato PDF",
      "priority": "medium"
    }
  },
  "routing": {
    "suggested_agent": "pm",
    "suggested_workflow": "spec-pipeline",
    "priority": "normal"
  },
  "thread": {
    "thread_id": "msg-1709290800",
    "is_followup": false,
    "parent_id": null
  },
  "reply_to": {
    "channel": "whatsapp",
    "target": "+5528999301848"
  },
  "status": "pending",
  "gateway_ack_sent": true,
  "gateway_ack_message": "Recebi seu pedido. Encaminhando para o time de produto..."
}
```

### 9.2. The Outbox File Format (AIOS Master -> Gateway)

```json
{
  "schema_version": "1.0",
  "id": "reply-{epoch}-{random4hex}",
  "in_reply_to": "msg-1709290800-a3f2",
  "timestamp": "2026-03-01T12:05:00Z",
  "from_agent": "pm",
  "target": {
    "channel": "whatsapp",
    "number": "+5528999301848"
  },
  "content": {
    "message": "Analisei seu pedido de 'Exportar relatorios em PDF'. Classificado como complexidade STANDARD. Preciso de mais detalhes: qual formato de relatorio (tabular, grafico)? E precisa de filtros de data?",
    "type": "question",
    "expects_reply": true
  },
  "status": "pending"
}
```

### 9.3. Status Transitions

```
INBOX:  pending -> in_progress -> processed
                                -> failed (with error reason)

OUTBOX: pending -> sending -> sent
                            -> failed (with retry count)
```

### 9.4. Differences from Internal Agent Handoff

The standard AIOS handoff protocol (`.claude/rules/agent-handoff.md`) is designed for **intra-session** agent switches where both agents share the same Claude Code context window. The @gateway handoff is fundamentally different:

| Aspect | Internal Handoff | Gateway Handoff |
|--------|-----------------|-----------------|
| **Medium** | In-memory YAML artifact | Filesystem JSON files |
| **Context** | Same Claude session | Separate processes |
| **Latency** | Instant | 1-60 seconds |
| **Token budget** | 500 tokens max | No limit (file-based) |
| **Threading** | Single conversation | Multi-turn across sessions |
| **Bidirectional** | Implicit (same session) | Explicit inbox/outbox |

The gateway handoff does NOT replace the internal handoff protocol. It supplements it as an **external ingress/egress mechanism**.

---

## 10. Fallback Behavior

### 10.1. AIOS Master Unavailable

Detection: @gateway attempts `exec command:"pgrep -f 'claude'" timeout:5` and checks for the AIOS project directory.

**Fallback chain:**

```
1. Write inbox file (persists even if AIOS is down)
2. Respond to user: "AIOS Master nao esta disponivel. Mensagem salva. Sera processada quando retornar."
3. For HIGH severity bugs: attempt direct claude --print as one-shot (may work if API is up)
4. For status queries: use local git/filesystem commands to give basic status
5. Log everything to SQLite for continuity
```

### 10.2. OpenClaw Gateway Down

AIOS Master can detect this when `openclaw status` fails or when outbox files accumulate without being sent.

**Fallback:** AIOS Master queues responses in outbox. When gateway recovers, a flush script sends all pending outbox messages.

### 10.3. SQLite Unavailable

Both sides fall back to filesystem-only operation. Conversation context may be degraded but messages are not lost.

### 10.4. Classification Failure

If @gateway cannot classify a message, it:
1. Classifies as `unknown`
2. Responds with the `unknown` template asking for clarification
3. Writes the inbox file with `intent: unknown` so AIOS Master can review
4. AIOS Master treats `unknown` messages as manual triage items

---

## 11. Security Considerations

### 11.1. Authentication

| Concern | Mitigation |
|---------|------------|
| **Who can send messages?** | OpenClaw already has `dmPolicy: allowlist` restricting to `+5528999301848`. @gateway inherits this. |
| **Inbox file tampering** | Inbox directory permissions: `drwxrwx--- ubuntu ubuntu`. OpenClaw runs as root (can write). AIOS runs as ubuntu (can read/write). No other users. |
| **Command injection via messages** | All message content is JSON-serialized in inbox files. AIOS Master should NEVER pass raw user content to shell commands without sanitization. |
| **Token/credential exposure** | Gateway agent uses its own model key (Gemini). AIOS Master uses Anthropic key. No key sharing. |

### 11.2. Rate Limiting

The existing contract defines `10 requests/minute, burst 3`. @gateway enforces this by:
1. Tracking message count per sender per minute in memory
2. Responding with rate limit message if exceeded
3. NOT writing inbox files for rate-limited messages

### 11.3. Content Sanitization

All user messages MUST be sanitized before:
1. Writing to inbox files (escape special JSON characters)
2. Passing to any `exec` or `claude --print` command (shell escape)
3. Logging to SQLite (parameterized queries -- already done)

---

## 12. Trade-off Analysis

### 12.1. File-based IPC vs. HTTP API vs. MCP

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **File-based inbox** | Simple, reliable, survives process restarts, no new dependencies, both sides already have FS access | Higher latency (polling), requires cleanup, no push notification | **SELECTED** |
| **HTTP API** | Low latency, push-based, standard | New server to run, new port, auth to implement, another failure point | Rejected (complexity) |
| **MCP bridge (existing)** | Already built (`aios-mcp-federation`), standard protocol | MCP Federation is Phase 1 (ack-only), would need significant work to make bidirectional; AIOS Master would need to run as MCP client | Future evolution |

**Rationale:** The file-based approach is the most pragmatic for the current setup where both OpenClaw and AIOS Master run on the same machine. It requires zero new infrastructure and zero new dependencies. The existing MCP federation package can evolve to replace files in a future phase.

### 12.2. Gemini Flash vs. Claude for @gateway triage

| Model | Pros | Cons |
|-------|------|------|
| **Gemini 3 Flash** | Fast, cheap, sufficient for triage, already configured in OpenClaw | Less accurate on nuanced classification |
| **Claude Sonnet** | More accurate classification, same family as AIOS | Slower, more expensive, overkill for triage |

**Selected: Gemini 3 Flash.** Triage is a pattern-matching task, not a reasoning task. The keyword-based classification in Section 8.2 means the model barely needs to do any classification work -- it just needs to follow the SKILL.md rules.

### 12.3. Single inbox directory vs. Priority queues

| Approach | Pros | Cons |
|----------|------|------|
| **Single directory** | Simple, easy to reason about | High-priority messages wait behind low-priority |
| **Priority subdirectories** | Can process critical bugs first | More complex, more directories to manage |

**Selected: Single directory with priority field in JSON.** The inbox processor sorts by priority when processing. The volume is low enough that a single directory is sufficient.

---

## 13. Implementation Phases

### Phase 1: Foundation (Estimated: 1-2 stories)

- [ ] Create `.aios/inbox/` and `.aios/outbox/` directory structure
- [ ] Create @gateway agent definition (`gateway.md`)
- [ ] Update agent-authority.md with @gateway rules
- [ ] Update CLAUDE.md agent table
- [ ] Create inbox JSON schema validator
- [ ] Create inbox-writer.mjs for OpenClaw side
- [ ] Rewrite aios-bridge SKILL.md with subordinate behavior
- [ ] Add to .gitignore

### Phase 2: Triage Engine (Estimated: 1 story)

- [ ] Implement keyword-based classifier in SKILL.md
- [ ] Implement autonomous response templates
- [ ] Implement follow-up correlation logic
- [ ] Create inbox-processor.js for AIOS side
- [ ] Wire AIOS Master to check inbox on activation
- [ ] End-to-end test: WhatsApp message -> inbox file -> AIOS reads it

### Phase 3: Response Loop (Estimated: 1 story)

- [ ] Implement outbox writer in AIOS Master workflow
- [ ] Implement outbox reader/sender on OpenClaw side (or use direct CLI)
- [ ] Implement status tracking (pending -> in_progress -> processed)
- [ ] Create systemd timer for inbox polling (safety net)
- [ ] End-to-end test: full round trip WhatsApp -> AIOS -> WhatsApp

### Phase 4: Hardening (Estimated: 1 story)

- [ ] Rate limiting enforcement
- [ ] Content sanitization layer
- [ ] Error handling and retry logic
- [ ] Cleanup cron for old inbox/outbox files
- [ ] Monitoring: log aggregation, alert on failed messages
- [ ] Update aios-openclaw-contract.yaml with new intents

### Phase 5: Evolution (Future)

- [ ] Replace file-based IPC with MCP bidirectional protocol (leverage existing aios-mcp-federation)
- [ ] Multi-channel support (Telegram, Slack)
- [ ] Conversation memory across sessions (leverage shared SQLite)
- [ ] @gateway dashboard for observability

---

## 14. Open Questions

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| 1 | Should @gateway be a 13th AIOS agent or a special "external agent" category? | Agent registry, handoff protocol | Treat as a standard agent in the registry but with a special `external: true` flag |
| 2 | How does AIOS Master know when a new inbox file arrives if no session is active? | Response latency | systemd timer polling every 60s as safety net |
| 3 | Should the existing `openclaw-mcp-bridge` MCP server be deprecated in favor of the inbox pattern? | Maintenance burden | Keep both: MCP bridge for tool-based access (AIOS -> OpenClaw), inbox for message forwarding (OpenClaw -> AIOS) |
| 4 | Multi-user support: what if someone besides Lucas sends a WhatsApp message? | Security, routing | Currently blocked by allowlist. Future: add user registration flow in @gateway |
| 5 | Should high-severity bugs bypass the inbox and trigger a synchronous Claude Code invocation? | Latency for critical bugs | Yes, as described in Flow C (Section 5.3) |

---

## Appendix A: File Reference

| File | Purpose | Side |
|------|---------|------|
| `/home/ubuntu/aios-core/.aios-core/development/agents/gateway.md` | @gateway agent definition | AIOS |
| `/home/ubuntu/aios-core/.aios/inbox/` | Incoming message queue | Shared |
| `/home/ubuntu/aios-core/.aios/outbox/` | Outgoing response queue | Shared |
| `/home/ubuntu/aios-core/.aios-core/infrastructure/scripts/inbox-processor.js` | Inbox polling and routing | AIOS |
| `/root/.openclaw/skills/aios-bridge/SKILL.md` | @gateway triage behavior | OpenClaw |
| `/root/.openclaw/skills/aios-bridge/inbox-writer.mjs` | Write classified messages to inbox | OpenClaw |
| `/home/ubuntu/aios-core/aios-openclaw-contract.yaml` | Shared message contract | Shared |
| `/home/ubuntu/aios-core/.claude/rules/agent-authority.md` | Agent authority rules (updated) | AIOS |
| `/home/ubuntu/aios-core/.aios-core/core-config.yaml` | Gateway config section | AIOS |
| `/home/ubuntu/.openclaw/memory.sqlite` | Shared conversation memory | Shared |

## Appendix B: Inbox File Naming Convention

```
{epoch_seconds}-{intent}-{4char_hex}.json
```

Examples:
```
1709290800-feature_request-a3f2.json
1709290860-bug_report-7b1c.json
1709290920-casual-0000.json        (casual messages not written to inbox)
1709290980-followup-msg-1709290800-d4e5.json
```

## Appendix C: Backward Compatibility

| Existing Feature | Impact | Migration |
|-----------------|--------|-----------|
| `openclaw message send` CLI | No change | @gateway and AIOS Master both continue using it |
| aios-bridge skill | Breaking rewrite | Old SKILL.md replaced with subordinate version |
| openclaw-mcp-bridge | No change | Continues to work alongside inbox pattern |
| aios-mcp-federation | No change | Phase 1 ack behavior unaffected |
| Internal agent handoff | No change | @gateway handoff is a separate protocol |
| owner-flash agent | Replaced by aios-gateway for AIOS-bound messages | Create new agent, update binding |

---

*Architecture by Aria, arquitetando o futuro.*
