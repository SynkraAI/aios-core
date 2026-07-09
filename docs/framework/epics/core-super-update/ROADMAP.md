# Roadmap — CORE-SUPER-UPDATE

Canonical: [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md)  
Architecture: [A](./ARCHITECTURE-WAVE-A.md) · [B](./ARCHITECTURE-WAVE-B.md) · [C](./ARCHITECTURE-WAVE-C.md)

> Public path: `docs/framework/epics/core-super-update/`.

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
| Branch + epic path | ✅ |
| ARCH-A / B / C | ✅ |
| Merge PR #800 | ⬜ |
| ARCH-D…E | ⬜ |

---

## Wave A — ✅

A1–A4 Done.

## Wave B — ✅

SDC skills + `aiox sdc` / `aiox wave` execute.

## Wave C — ✅ COMPLETE (via wave-execute CORE-SU-C)

| Item | Status |
|------|--------|
| C1 wave-run | ✅ |
| C2 dispatch-adapter | ✅ |
| C3 epic-glue / from-epic | ✅ |
| C4 tests | ✅ 23 tests |

```bash
aiox wave from-epic --epic-dir docs/framework/epics/core-super-update \
  --filter 'CORE-SU.C' --wave-id CORE-SU-C --mode yolo
aiox wave advance CORE-SU-C
# full-sdc per open story…
aiox wave report CORE-SU-C
```

---

## Waves D–E

| Wave | ARCH | Impl |
|------|------|------|
| D IDE/SYNAPSE | ⬜ | 🚫 until ARCH-D |
| E Constitution | ⬜ | 🚫 until ARCH-E |

## Wave F

| Story | Status |
|-------|--------|
| F1 Windows #773 | ⬜ (// anytime) |

---

## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | A+B+C1 |
| 2026-07-09 | Wave C complete via wave-execute + full-sdc (C2–C4) |
