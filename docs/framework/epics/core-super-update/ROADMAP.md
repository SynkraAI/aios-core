# Roadmap — CORE-SUPER-UPDATE

Canonical: [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md)  
Architecture: [A](./ARCHITECTURE-WAVE-A.md) · [B](./ARCHITECTURE-WAVE-B.md) · [C](./ARCHITECTURE-WAVE-C.md)

> Public path: `docs/framework/epics/core-super-update/` (not gitignored).  
> **No product harvest trees in OSS.**

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
| ARCH-A / ARCH-B / ARCH-C | ✅ |
| Merge PR #800 | ⬜ |
| ARCH-D…E | ⬜ |

---

## Wave A — Runtime hygiene

| Story | Status |
|-------|--------|
| A1 SYNAPSE timeout | ✅ Done |
| A2 ConfigCache residual | ✅ Done |
| A3 path/prompt/ssrf guards | ✅ Done |
| A4 denylist + smoke | ✅ Done |

---

## Wave B — SDC skills + execute

| Item | Status |
|------|--------|
| Skills + full-sdc lean | ✅ |
| `aiox sdc` / `aiox wave` plan | ✅ |
| Grok/Claude surfaces | ✅ |

---

## Wave C — Orchestration

| Item | Status |
|------|--------|
| ARCH-C | ✅ |
| C1 wave-run controller | ✅ `wave-run.js` + advance/mark/report |
| C2 parallel dispatch adapter | ⬜ |
| C3 epic glue | 🟡 report.md |
| C4 tests | 🟡 unit tests for wave-run |

**CLI:** `aiox wave advance|mark|report|next|plan|status`

---

## Waves D–E

| Wave | ARCH | Impl |
|------|------|------|
| D | ⬜ | 🚫 |
| E | ⬜ | 🚫 |

## Wave F

| Story | Status |
|-------|--------|
| F1 Windows #773 | ⬜ |

---

## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | Epic + ARCH-A; Wave A |
| 2026-07-09 | ARCH-B + Wave B skills + execute |
| 2026-07-09 | ARCH-C + C1 wave-run; A1 residual closed |
