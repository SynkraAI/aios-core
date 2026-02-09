# Epic MIS: Memory Intelligence System

**Epic ID:** EPIC-MIS
**Status:** Draft
**Created:** 2026-02-09
**Author:** @architect (Aria)
**Related Guide:** [Memory System Guide](../../../guides/MEMORY-SYSTEM.md)

---

## Overview

### Problem Statement

> **"Agents operate in isolated sessions; institutional knowledge evaporates at every compact"**

During the Memory System audit (2026-02-09), critical gaps were identified:

- **2,397 lines of orphan code** (timeline-manager, file-evolution-tracker, context-snapshot) with zero production consumers
- **8 broken/missing paths** (.aios/snapshots/, .aios/timeline/, runners/, etc.)
- **No session-digest mechanism** to persist learnings when context compacts
- **No intelligent retrieval** - agents load all-or-nothing memory, no relevance-based filtering
- **No self-learning loop** - heuristics, corrections, and axioms are lost between sessions
- **~14K lines of orphan data** nobody reads in `.aios/`

### Solution

Implement a **Memory Intelligence System (MIS)** that:

1. **Captures session knowledge** via PreCompact hook before context loss
2. **Retrieves intelligently** using progressive disclosure (index → context → detail)
3. **Learns continuously** from user corrections, patterns, and session outcomes
4. **Cleans dead code** by removing orphan modules and broken paths
5. **Integrates with UnifiedActivationPipeline** for agent-relevant memory injection
6. **Provides on-demand memory access** so agents can pull memories when needed

---

## Stories

| Story | Title | Priority | Complexity | Estimated |
|-------|-------|----------|------------|-----------|
| [MIS-1](story-mis-1-investigation.md) | Investigation & Architecture Design | Critical | High | 12h |
| MIS-2 | Dead Code Cleanup & Path Repair | High | Low | 4h |
| MIS-3 | Session Digest (PreCompact Hook) | Critical | High | 14h |
| MIS-4 | Progressive Memory Retrieval | Critical | High | 16h |
| MIS-5 | Self-Learning Engine | High | High | 14h |
| MIS-6 | Pipeline Integration & Agent Memory API | High | Medium | 10h |
| MIS-7 | CLAUDE.md & Rules Auto-Evolution | Medium | Medium | 8h |

**Total Estimated:** ~78 hours

---

## Dependencies

### Internal Dependencies

| Story | Depends On | Reason |
|-------|------------|--------|
| MIS-2 | MIS-1 | Cleanup needs architecture decisions from investigation |
| MIS-3 | MIS-1 | Session digest design defined in investigation |
| MIS-4 | MIS-3 | Retrieval needs stored memories from digest |
| MIS-5 | MIS-3, MIS-4 | Self-learning needs capture + retrieval working |
| MIS-6 | MIS-4 | Pipeline integration uses retrieval API |
| MIS-7 | MIS-5 | Auto-evolution uses self-learning engine |

### External Dependencies

| Dependency | Status | Impact |
|-----------|--------|--------|
| Claude Code PreCompact hook | Available (native) | MIS-3 trigger mechanism |
| Claude Code async hooks | Available (Jan 2026) | MIS-3 fire-and-forget digest |
| Claude Code agent memory frontmatter | Available (Feb 2026) | MIS-6 scope control |
| UnifiedActivationPipeline (ACT epic) | Done | MIS-6 integration point |
| IDS Entity Registry | Done (IDS-1) | MIS-4 pattern matching |

---

## Architecture Vision

```
                    SESSION LIFECYCLE

  SessionStart ─────────────────────────────── PreCompact ──── Stop
       │                                            │            │
       ▼                                            ▼            ▼
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  ┌─────────┐
  │ Memory      │    │ On-Demand    │    │ Session      │  │ Final   │
  │ Injection   │    │ Memory Pull  │    │ Digest       │  │ Flush   │
  │ (Pipeline)  │    │ (Agent API)  │    │ (PreCompact) │  │ (Stop)  │
  └──────┬──────┘    └──────┬───────┘    └──────┬───────┘  └────┬────┘
         │                  │                    │               │
         ▼                  ▼                    ▼               ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                   MEMORY INTELLIGENCE LAYER                      │
  │                                                                  │
  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────┐ │
  │  │ Progressive│  │ Relevance  │  │ Self-Learn  │  │ Memory   │ │
  │  │ Disclosure │  │ Scoring    │  │ Engine      │  │ Store    │ │
  │  └────────────┘  └────────────┘  └─────────────┘  └──────────┘ │
  └─────────────────────────────────────────────────────────────────┘
         │                                                │
         ▼                                                ▼
  ┌─────────────┐                                  ┌─────────────┐
  │ .claude/    │                                  │ .aios/      │
  │ memory/     │                                  │ memories/   │
  │ (native)    │                                  │ (framework) │
  └─────────────┘                                  └─────────────┘
```

---

## Success Criteria

1. **Zero orphan code** - All dead modules removed, all paths valid
2. **Session continuity** - PreCompact digest captures key learnings before context loss
3. **Token efficiency** - Progressive disclosure reduces memory token usage by 60%+
4. **Agent relevance** - Agents receive only contextually relevant memories
5. **Self-improvement** - System captures and applies corrections, patterns, heuristics
6. **Auto-evolution** - CLAUDE.md, rules, and agent configs improve over time

---

## Research Foundation

Extensive investigation of 10 open-source memory systems conducted in MIS-1:
- claude-mem, cognee, OpenMemory, basic-memory, claude-reflect
- cipher, memU, claude-cognitive, PageIndex, openclaw

See [MIS-1 Investigation](story-mis-1-investigation.md) for complete analysis.

---

*Epic MIS - Memory Intelligence System*
*Created by @architect (Aria) - 2026-02-09*
