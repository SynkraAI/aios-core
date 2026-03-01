# Architect Agent Memory

## AIOS Session Daemon Architecture
- Single daemon at `packages/session-daemon/` using Claude Agent SDK (V2 with V1 fallback)
- IPC via filesystem JSON: `.aios/inbox/pending/` -> `.aios/outbox/pending/`
- Strict FIFO queue, one command at a time, max 50 queued
- Session persistence via `.aios/daemon/session.json`
- Health state machine: STARTING -> READY -> BUSY -> RECOVERY -> FAILED
- systemd service with MemoryMax=2G, CPUQuota=200%
- Agent switching detected via text pattern matching in StreamProcessor

## Telegram Bridge Architecture
- 4 bots (master, dev, qa, architect) via grammY
- AgentRouter maps agent -> bot using `agent_to_bot_map` from bots.yaml
- Dual delivery: always sends to master + relevant agent bot
- Rate limiter: token bucket 1/sec, burst 3
- Digest mode suppresses tool_use and progress messages

## VPS Constraints (March 2026)
- 7.8 GB RAM (2.8 GB available), 2 CPU cores (AMD EPYC), 96 GB disk (60 GB free)
- Daemon uses ~600 MB (Node.js + SDK subprocess)
- Max concurrent workers: 2 (comfortable), 3 (tight)

## Autonomous Agents Architecture (March 2026)
- Report: `docs/architecture/autonomous-agents-architecture.md`
- Model: Master-Worker with on-demand spawn (evolution of Model C Hybrid)
- Orchestrator: persistent process (~300MB), no SDK session, spawns workers
- Workers: on-demand child_process.fork(), each ~600MB, own Claude session
- Peak RAM at 2 workers: ~1.5 GB (Orchestrator + 2 workers + Bridge)
- Communication: filesystem event bus (`.aios/events/pending/`)
- Governance: 4-layer (pre-flight, structural, runtime sentinel, post-flight)
- Authority: enforced structurally via SDK allowed_tools + denied_bash_patterns
- Overnight: L3 autonomy, bounded tasks, budget cap, Telegram/WhatsApp escalation
- State: SQLite WAL for orchestrator, JSON for workers, filesystem for events
- Implementation: 5 phases, ~10-17 weeks total, each phase backward-compatible
- Phase 0 (worker isolation): 1-2 weeks, minimal risk, foundation for everything

## Multi-Daemon Analysis Decision (March 2026)
- Full multi-daemon (11 daemons): REJECTED - exceeds VPS RAM
- Grouped multi-daemon (3 groups): VIABLE but context pollution persists
- Hybrid (master + on-demand workers): SELECTED as basis for autonomous architecture
- Pool (N reusable slots): REJECTED - context pollution
- Previous report: `docs/architecture/multi-daemon-analysis.md`

## Claude API Pricing (March 2026)
- Opus 4.6: $5/$25 per MTok (input/output)
- Sonnet 4.5: $3/$15 per MTok
- Haiku 4.5: $1/$5 per MTok
- System prompt overhead per session: ~18k tokens
- Estimated cost per SDC story cycle: ~$4.50 (Sonnet)
- Estimated overnight 2-story run: ~$9.00
