# Roadmap — CORE-SUPER-UPDATE

Canonical: [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md)  
Architecture Wave A: [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md)

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
| Remove force-added gitignored stories/index | ✅ (this revision) |
| ARCH-A | ✅ Draft |
| Merge PR #800 | ⬜ |
| ARCH-B…E | ⬜ (block implementation) |

---

## Wave A — implementable

| Story | Status | Note |
|-------|--------|------|
| A1 SYNAPSE timeout | ✅ | #798 — implemented on branch |
| A2 ConfigCache residual | ✅ | #797 — skip interval under JEST_WORKER_ID |
| A3 path/prompt/ssrf **extend** permissions | ✅ | path/prompt/ssrf added; mode+operation-guard kept |
| A4 denylist + smoke | ⬜ | denylist includes `workspace/` |

**Exit:** lint/typecheck/test; #797/#798 resolved; ARCH-A satisfied.

---

## Wave B — 🚫 until ARCH-B

| Item | Status |
|------|--------|
| ARCH-B | ⬜ **gate** |
| B0–B6 | 🚫 blocked |

**Strip checklist (when unblocked)**

- [ ] No `sinkra_*` / `.sinkra/`  
- [ ] No `workspace/`  
- [ ] No product deploy hosts hardcode  
- [ ] Skills invoke tasks only  
- [ ] Anti-bloat CI  

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

1. **Now:** Wave A only (A1→A2→A3→A4)  
2. **After A + ARCH-B:** Wave B → MVP 5.3.0  
3. **Later:** C/D/E with architecture docs first  

---

## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | Epic created |
| 2026-07-09 | Roundtable APPROVE_WITH_FIXES |
| 2026-07-09 | architect-first: not impl-ready |
| 2026-07-09 | Moved to docs/framework/epics; ARCH-A; A2 residual; no workspace; B–E blocked |
