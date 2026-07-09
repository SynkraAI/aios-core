# Architecture — Wave C (Orchestration stretch)

| Campo | Valor |
|-------|-------|
| Wave | C |
| Epic | CORE-SUPER-UPDATE |
| Status | Accepted draft — unblocks C1–C4 design; implement after MVP A+B |
| Depends | ARCH-B (done), `aiox sdc` / `aiox wave` runtime (B7/B8) |

## 1. Goal

Harden **multi-story orchestration** on top of Wave B execute runtime: durable wave progress, optional parallel dispatch hooks, resume, and tests — **without** porting hub cockpit conductor / worktree product.

**Headline:** `aiox wave plan` → dispatch full-sdc per story → durable batch completion → devops handoff.

## 2. Already shipped (do not reimplement)

| Capability | Where |
|------------|--------|
| full-sdc EXECUTE loop | skills + `aiox sdc` |
| wave plan DAG + file partition | `.aiox-core/core/sdc/wave-plan.js` |
| Progress files | `.aiox/sdc/`, `.aiox/waves/` |
| Atomic SDC skills | validate/develop/review/apply-qa-fixes/close |
| Legacy WaveExecutor (task waves) | `.aiox-core/core/execution/wave-executor.js` — **workflow tasks**, not story SDC |

Wave C **extends** B7/B8; it does not replace them.

## 3. Components (target)

```
User / skill wave-execute
        │
        ▼
┌───────────────────┐
│ aiox wave plan    │  DAG + partition (exists)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ WaveRunController │  C1/C2 — batch status, resume, cascade-block
│ (.aiox/waves/*)   │
└─────────┬─────────┘
          │ per story
          ▼
┌───────────────────┐
│ full-sdc / aiox   │  B7 (exists)
│ sdc plan|next|…   │
└─────────┬─────────┘
          │ optional
          ▼
┌───────────────────┐
│ SubagentDispatcher│  C2 — spawn persona agents when host supports
│ (optional hook)   │
└───────────────────┘
          │
          ▼
     @devops merge handoff
```

## 4. Stories

| ID | Title | Scope |
|----|-------|--------|
| **C1** | Wave run controller | Mark batch complete/failed; cascade-block dependents; `aiox wave advance`; resume mid-wave |
| **C2** | Optional parallel dispatch | Adapter interface `dispatchStory(story, mode)` — default sequential; Grok `spawn_subagent` / Node child optional |
| **C3** | Epic orchestration glue | Read epic story table or `--stories` list; write wave summary report under `.aiox/waves/{id}/report.md` |
| **C4** | Tests | Unit tests same PR as C1–C3 code |

## 5. Data / control flow

1. Plan (idempotent) → state `planned`
2. `advance` starts batch N → state `running`
3. For each story: ensure SDC state; run full-sdc (agent or dry-run verify only)
4. Poll / accept `aiox sdc status completed` per story
5. On story fail: mark dependents blocked (depends_on)
6. All batches done → `completed` + report
7. Never git push from wave controller

## 6. Configuration

| Key | Default | Notes |
|-----|---------|-------|
| maxParallelStories | 2 | Soft cap when parallel adapter on |
| maxQgIterations | 3 | Inherited from sdc state |
| mode | interactive | yolo \| interactive |

No new core-config required for C1; optional `orchestration.wave` later.

## 7. Failure modes

| Failure | Behavior |
|---------|----------|
| Cycle in depends_on | plan status `invalid`; HALT |
| Story path missing | HALT batch |
| SDC integrity Done early | HALT story; cascade-block dependents |
| QG circuit breaker | mark story failed; cascade |
| Parallel adapter unavailable | sequential fallback (never fake parallel) |

## 8. Explicitly non-ported

- Cockpit `wave launch` / pane tokens / companion domain
- ConductorLoop / decision rail
- Worktree WL-1..7 auto-spawn registry
- Product harvest trees / multi-BU gates

## 9. Integration points

- Skills: `wave-execute`, `full-sdc`
- CLI: extend `aiox wave` with `advance` / `report` (C1/C3)
- Optional: `SubagentDispatcher` only as **adapter**, not required for CLI correctness
- Existing `WaveExecutor` stays for **workflow task** waves — document boundary; do not merge classes without ADR

## 10. Acceptance ARCH-C

- [x] This document
- [x] C1–C4 rows in epic table
- [x] C1 implemented: `wave-run.js` + CLI advance/mark/report
- [x] C1 unit tests
- [ ] C2–C4 full scope
- [x] No product harvest in C code paths
