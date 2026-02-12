# Epic: CLI & Developer Experience (CLI-DX)

**Epic ID:** EPIC-CLI-DX
**Status:** Active
**Priority:** High
**Target:** Sprint 22+
**Effort Estimate:** 32-36 hours (Story 1)
**Owner:** @aios-master, @architect, @dev, @ux-design-expert

---

## Vision

Transform the AIOS CLI developer experience with context-aware tooling that eliminates friction when working with multiple terminal sessions, projects, and workflows simultaneously.

---

## Problem Statement

Developers working with Claude Code + AIOS often have **5-10 terminal tabs open simultaneously**, each working on different:
- Projects (aios-core, squads, tools, design-systems, apps)
- Contexts (development, research, debugging, planning)
- Stories/Tasks (Story 7.4, mind clone research, bug fixing)

**Current pain:** When switching between tabs, developers must:
1. Read chat history to understand context
2. Check git status to see current work
3. Remember what stage of work they were in
4. Mentally reconstruct the project/task

This **context loss** happens 20-50 times per day, costing **5-10 minutes each time** = 100-500 minutes/day of lost productivity.

---

## Stories

| Story | Title | Priority | Complexity | Executor | Quality Gate | Status |
|-------|-------|----------|------------|----------|--------------|--------|
| CLI-DX-1 | Visual Context System for Multi-Tab Sessions | Critical | High | @dev | @architect + @ux-design-expert | Draft |

### Story Files

| Story | File |
|-------|------|
| CLI-DX-1 | [story-cli-dx-1-visual-context.md](story-cli-dx-1-visual-context.md) |

---

## Orchestration

**Execution plan:** Single story for now, future stories TBD
**Template:** `.aios-core/development/workflows/development-cycle.yaml` (per story)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Context Switch Time** | <2s | Time to identify project/status when switching tabs |
| **Context Loss Events** | -80% | Reduction in "what was I working on?" moments |
| **Developer Satisfaction** | 9/10 | Post-implementation survey |
| **Setup Time** | <5min | Time from install to working system |

---

## Future Stories (Backlog)

- CLI-DX-2: Smart command history with context awareness
- CLI-DX-3: Project workspace bookmarks (quick cd + context restore)
- CLI-DX-4: AI-powered "what should I work on next?" suggestions
- CLI-DX-5: Cross-session clipboard (copy/paste between AIOS tabs)
- CLI-DX-6: Hotkey-based tab switching with preview

---

**Created:** 2026-02-12
**Last Updated:** 2026-02-12
