# Architect Agent Memory

## EPIC-ACT Wave 2 Quality Gate Review (2026-02-06)
- Reviewed: ACT-6 (Unified Activation Pipeline, 67 tests, APPROVED)
- Total EPIC-ACT: 255 tests pass across 4 test suites (0 regressions)
- UnifiedActivationPipeline: single entry point, 5-way parallel load, 3-phase sequential, GreetingBuilder final
- Timeout architecture: 150ms per-loader, 200ms total pipeline, fallback greeting on failure
- Timer leak concern: _timeoutFallback setTimeout not cancelled when pipeline wins the race (advisory, not blocking)
- generate-greeting.js refactored to thin wrapper; backward compatible
- All 12 agent .md files updated with unified STEP 3 reference
- *validate-agents command added to aios-master (validate-agents.md task file)

## EPIC-ACT Wave 1 Quality Gate Review (2026-02-06)
- Reviewed: ACT-1 (config fix, merged), ACT-2 (user_profile audit, 31 tests), ACT-3 (ProjectStatusLoader, 90 tests), ACT-4 (PermissionMode, 67 tests)
- All 188 tests pass across 3 test suites
- Key patterns: fingerprint-based cache invalidation, file locking with wx flag, mode cycling (ask>auto>explore)
- PermissionMode reads from `.aios/config.yaml`, NOT from `.aios-core/core-config.yaml` - different config hierarchy
- GreetingPreferenceManager reads from `.aios-core/core-config.yaml` (agentIdentity.greeting.preference)
- The *yolo command cycles PermissionMode; it does NOT directly change greeting preference

## SDK Orchestrator Architecture (2026-03-01)
- Architecture doc: `docs/architecture/sdk-orchestrator-architecture.md`
- SUPERSEDES: `docs/architecture/autonomous-agents-architecture.md` (2034 lines -> ~500 LOC)
- Core idea: single Node.js process orchestrates isolated SDK `query()` calls per agent
- 5 components: Agent Registry (JSON), Workflow Engine (SDC state machine), Session Manager, Governance Hooks, Comms Bridge
- Each agent = 1 `query()` with own systemPrompt, allowedTools, disallowedTools, model, maxBudgetUsd
- Authority matrix enforced via PreToolUse hooks (bash command filtering, file path restrictions)
- Comms Bridge writes to `.aios/outbox/pending/` (same as Telegram Bridge watches)
- State persisted to `.aios/orchestrator/workflow-state.json` for crash recovery
- Phase 0: shell script POC with `claude -p` (2-3 days)
- Phase 1: SDK orchestrator.mjs (1-2 weeks, 7 stories)
- Phase 2: Agent Teams integration (future, when experimental stabilizes)
- Cost per story: $0.76-5.73 (Sonnet), up to $12 with retries
- RAM: ~800MB peak (orchestrator + 1 ephemeral query)
- Package: `packages/aios-orchestrator/`
- Key decisions: query() over streamInput() (simplicity), ephemeral over persistent workers (RAM), JSON over SQLite (zero deps)
- Session Daemon remains for interactive use; Orchestrator for automated workflows
- SDK exports used: query(), HOOK_EVENTS, EXIT_REASONS

## Architecture Patterns to Track
- Agent activation: UnifiedActivationPipeline is now THE single entry point for all 12 agents (ACT-6)
- Previous two paths (Direct 9 agents + CLI wrapper 3 agents) are now unified
- generate-greeting.js is thin wrapper around UnifiedActivationPipeline (backward compat)
- user_profile cascades: config-resolver > validate-user-profile > greeting-preference-manager > greeting-builder
- Permission system: permission-mode.js + operation-guard.js + index.js (facade)
- ProjectStatusLoader: .aios/project-status.yaml (runtime cache), separate from .aios-core/ (framework config)
- PM agent bypasses bob mode restriction in _resolvePreference()

## Key File Locations
- Unified Pipeline: `.aios-core/development/scripts/unified-activation-pipeline.js`
- Permissions: `.aios-core/core/permissions/`
- Greeting system: `.aios-core/development/scripts/greeting-builder.js`, `greeting-preference-manager.js`
- Project status: `.aios-core/infrastructure/scripts/project-status-loader.js`
- User profile validation: `.aios-core/infrastructure/scripts/validate-user-profile.js`
- Post-commit hook: `.aios-core/infrastructure/scripts/git-hooks/post-commit.js` + `.husky/post-commit`
- Validate agents task: `.aios-core/development/tasks/validate-agents.md`

## @gateway Personal Memory Guardian Architecture (2026-03-01)
- Redesigned @gateway from stateless relay to Personal Memory Guardian
- Architecture doc: `docs/architecture/gateway-personal-memory-architecture.md` (1757 lines)
- Supersedes: `docs/architecture/gateway-agent-architecture.md` (relay-only, infrastructure reused)
- Key decision: @gateway = Alan Turing (unified entity, not separate)
- Personal memory: 7-domain YAML schema (identity, career, personality, relationships, active context, conversation patterns, voice DNA)
- Storage: Hybrid YAML (stable data) + SQLite (dynamic data, mood tracking, search)
- Context filtering: 4-stage pipeline (classify -> extract -> route -> enrich)
- Privacy: 5-tier system (T0 forbidden -> T4 public), field-level manifest
- Context hints: anonymous signals (user_energy, deadline_pressure) forwarded to agents without personal detail
- 6 conversation modes: casual, technical_request, status_update, emotional_support, command_execution, mixed
- Voice DNA synced from LinkedIn SKILL.md, applied to ALL responses
- Personal memory stored in /root/.openclaw/workspace/personal/ (root-owned, 600 perms)
- 7-phase implementation plan: Foundation -> Filter Engine -> Conversation Modes -> Memory Learning -> AIOS Integration -> Hardening -> Evolution
- Relay infrastructure (inbox/outbox IPC, contract validation, rate limiting) fully reused from v1

## Session Daemon Phase 0 Architecture (2026-03-01)
- Architecture doc: `docs/architecture/session-daemon-phase0.md`
- Purpose: Solve the statefulness problem for external command ingestion
- SELECTED: Claude Agent SDK V2 (`@anthropic-ai/claude-agent-sdk` v0.2.63)
- Key APIs: `unstable_v2_createSession()`, `unstable_v2_resumeSession()`, `session.send()`, `session.stream()`
- V2 is preview/unstable -- thin adapter pattern isolates instability, V1 `query()` with `resume` fallback
- Package: `packages/session-daemon/` (new, does not exist yet)
- Components: InboxWatcher, CommandQueue (FIFO), SessionAdapter, StreamProcessor, OutboxWriter, HealthMonitor
- Session config: settingSources=["user","project","local"], systemPrompt preset=claude_code, permissionMode=bypassPermissions
- Sequential processing: one command at a time, prevents git/file conflicts
- Crash recovery: session.json + queue.json persisted, resumeSession() on restart, max 3 retries
- Health: .aios/daemon/health.json written every 10s, systemd watchdog at 60s
- Coexistence: daemon is secondary to interactive session (CLI First), advisory detection only
- Server: 7.8GB RAM, 2 cores, Node v22. SDK subprocess ~500MB + daemon ~100MB
- Known risk: sessions-index.json bug (Feb 2026) may affect resumeSession()
- 5 stories, estimated 9-11 days total

## Telegram Observability Bridge Architecture (2026-03-01)
- Architecture doc: `docs/architecture/telegram-observability-bridge.md`
- Validation: `docs/architecture/telegram-observability-validation.md` (FAIL: 15 FAIL, 11 CONCERNS, 5 PASS)
- Fatal flaw identified: `claude --print` stateless -- solved by Session Daemon (Phase 0)
- Purpose: Real-time multi-bot Telegram channel for AIOS agent observability
- Session arch: Option A selected (single Claude Code session, agent switching)
- Framework: grammY (Telegram bot)
- Package location: `packages/telegram-bridge/`
- Phase 1 bots: master, dev, qa, architect (4 bots)
- Bridge becomes thin inbox producer + outbox consumer on top of Session Daemon
- No OpenClaw dependency -- direct Claude CLI / SDK integration
- systemd service: `aios-telegram-bridge.service`
- Agent detection: heuristic-based (greeting patterns, @agent echo, handoff artifacts)

## Channel Architecture (2026-03-01)
- WhatsApp: Personal channel via OpenClaw + @gateway (Alan Turing persona)
- Telegram: Professional operations via grammY + Session Daemon
- Both channels share the Session Daemon as the single AIOS session
- Both write to shared .aios/inbox/, both read from .aios/outbox/ (filtered by channel field)
- WhatsApp: OpenClaw writes inbox, reads outbox channel=whatsapp
- Telegram: Bridge writes inbox, reads outbox channel=telegram

## Pre-existing Test Failures (not EPIC-ACT related)
- squads/mmos-squad/ (6 suites): missing clickup module
- tests/core/orchestration/ (2 suites): greenfield-handler, terminal-spawner
