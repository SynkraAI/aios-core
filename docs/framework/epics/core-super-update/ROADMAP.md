# Roadmap — CORE-SUPER-UPDATE

Canonical: [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md)  
Architecture Wave A: [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md)  
Architecture Wave B: [ARCHITECTURE-WAVE-B.md](./ARCHITECTURE-WAVE-B.md)

> Public path: `docs/framework/epics/core-super-update/` (not gitignored).  
> **No `workspace/` in OSS.**

## Status legend

| | |
|--|--|
| ⬜ | Not started |
| 🟡 | In progress |
| ✅ | Done |
| 🚫 | Blocked |

---

## Phase 0

| Item | Status |
|------|--------|
| Branch off PR #800 | ✅ |
| Epic under `docs/framework/epics/` | ✅ |
| Remove force-added gitignored stories/index | ✅ |
| ARCH-A | ✅ |
| ARCH-B | ✅ |
| Merge PR #800 | ⬜ |
| ARCH-C…E | ⬜ (block those waves) |

---

## Wave A — implementable

| Story | Status | Note |
|-------|--------|------|
| A1 SYNAPSE timeout | ✅ | #798 — implemented on branch |
| A2 ConfigCache residual | ✅ | #797 — skip interval under JEST_WORKER_ID |
| A3 path/prompt/ssrf **extend** permissions | ✅ | path/prompt/ssrf added; mode+operation-guard kept |
| A4 denylist + smoke | ✅ | `npm run validate:port-denylist` + doctor check |

**Exit:** lint/typecheck/test; #797/#798 resolved; ARCH-A satisfied.

---

## Wave B — SDC skills OSS lean

| Item | Status |
|------|--------|
| ARCH-B | ✅ |
| B0 lean protocol | ✅ |
| B1–B4 atomics (validate/develop/review/apply-qa-fixes/close) | ✅ |
| B5 full-sdc lean | ✅ |
| B6 Grok WORKFLOW_SKILLS + development/skills sync | ✅ |
| aiox-commit skill SOT | ✅ |
| B7 full-sdc **EXECUTE** (CLI plan/next/verify + skill loop) | ✅ |
| B8 wave-execute **EXECUTE** (DAG plan + dispatch full-sdc) | ✅ |

**SOT path:** `.aiox-core/development/skills/` + `.aiox-core/core/sdc/`  
**Surfaces:** `.claude/skills/`, `.grok/skills/aiox-*` via `npm run sync:skills:grok`  
**CLI:** `aiox sdc plan|next|verify|status`, `aiox wave plan|next|status`

**Strip checklist**

- [x] No `sinkra_*` / `.sinkra/`  
- [x] No `workspace/`  
- [x] No product deploy hosts hardcode  
- [x] Skills invoke tasks only  
- [x] full-sdc SKILL.md < 400 lines  
- [ ] Anti-bloat CI (port denylist already covers harvest tokens)

**Exit:** skills invocable; Sequence Lock (soft); only close sets Done; denylist green.

---

## Waves C–E — 🚫 until per-wave ARCH

| Wave | ARCH gate | Impl |
|------|-----------|------|
| C | ARCH-C | 🚫 |
| D | ARCH-D | 🚫 |
| E | ARCH-E + hub XI/XII numbering | 🚫 |

## Wave F

| Story | Status |
|-------|--------|
| F1 Windows #773 (P1 // A) | ⬜ |
| F2–F3 | ⬜ / DEFERRED |

---

## Sprint suggestion

1. **Done:** Wave A (A1→A4)  
2. **Done:** Wave B lean SDC skills  
3. **Next:** Merge #800 + Wave B branch; ARCH-C before Wave C  
4. **Later:** D/E with architecture docs first  

---

## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | Epic created |
| 2026-07-09 | Roundtable APPROVE_WITH_FIXES |
| 2026-07-09 | architect-first: not impl-ready |
| 2026-07-09 | Moved to docs/framework/epics; ARCH-A; A2 residual; no workspace; B–E blocked |
| 2026-07-09 | Wave A complete; ARCH-B + Wave B lean skills shipped |
