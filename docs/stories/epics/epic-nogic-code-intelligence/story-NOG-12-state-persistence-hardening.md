# Story NOG-12: State Persistence Hardening (Atomic Writes + Session Cleanup)

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-12 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Bug Fix / Hardening |
| **Status** | Draft |
| **Priority** | P1 |
| **Points** | 3 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | NOG-10 |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework developer**, I want all state persistence points to use atomic writes and session cleanup to be properly wired, so that session files cannot be corrupted on unexpected exit and stale sessions are automatically cleaned up — resolving Codex QA findings #2 and #7.

---

## Problem Statement

### Atomic Writes (Finding #2 — expanded scope)

4 points of non-atomic `writeFileSync` identified by Codex QA:

| Location | File Written | Risk |
|----------|-------------|------|
| `session-manager.js:230` | `.synapse/sessions/{uuid}.json` | Session corruption |
| `context-detector.js:194` | `.aios/session-state.json` | Session state loss |
| `unified-activation-pipeline.js:713` | `.synapse/sessions/_active-agent.json` | Agent bridge corruption |
| `unified-activation-pipeline.js:759` | `.synapse/metrics/uap-metrics.json` | Metrics loss |

### Session Cleanup (Finding #7)

`cleanStaleSessions()` exists in `session-manager.js:305` and is fully implemented — but **never called** from any production flow. Another "Infrastructure Exists, Wiring Falta" case.

### Evidence

- Codex QA: `HANDOFF-TO-ARCHITECT-FROM-CODEX-QA.md` findings #2 and #7
- Architect Response: `ARCHITECT-RESPONSE-TO-CODEX.md` findings #2 and #7

---

## Acceptance Criteria

### AC1: Atomic Write Utility
- [ ] Create `atomicWriteSync(filePath, data)` utility that writes to `.tmp.{pid}` then renames
- [ ] Utility handles POSIX and Windows atomic rename semantics
- [ ] **Test:** Write file, simulate crash (kill before rename), verify original intact
- [ ] **Rollback:** If utility causes issues, revert to direct writeFileSync (single commit)
- [ ] **Observability:** Errors logged to stderr with `[atomic-write]` prefix

### AC2: Apply Atomic Writes to All 4 Points
- [ ] `session-manager.js:230` — `updateSession()` uses atomic write
- [ ] `context-detector.js:194` — `_updateSessionState()` uses atomic write
- [ ] `unified-activation-pipeline.js:713` — `_writeSynapseSession()` uses atomic write
- [ ] `unified-activation-pipeline.js:759` — `_persistUapMetrics()` uses atomic write
- [ ] **Benchmark:** No measurable performance regression (rename is <0.1ms)
- [ ] **Test:** Existing tests pass unchanged (atomic write is transparent to callers)

### AC3: Wire Session Cleanup
- [ ] `cleanStaleSessions()` called during hook runtime initialization (fire-and-forget)
- [ ] TTL configurable via `core-config.yaml` (default: 7 days = 168 hours)
- [ ] Existing 24h implementation reused (not duplicated), just parametrized
- [ ] Cleanup runs at most once per session (not on every prompt)
- [ ] **Benchmark:** Cleanup adds <5ms to first prompt of session
- [ ] **Test:** Create stale session file, run cleanup, verify deleted
- [ ] **Rollback:** Remove single `cleanStaleSessions()` call to disable
- [ ] **Observability:** Count of cleaned sessions logged at DEBUG level

---

## Scope

### IN Scope
- Create atomicWriteSync utility function
- Apply to all 4 identified write points
- Wire existing cleanStaleSessions into production flow
- Parametrize TTL from core-config.yaml

### OUT of Scope
- Changes to session schema
- New session features (resume, etc.)
- Changes to cleanup algorithm

---

## Tasks/Subtasks

- [ ] 1. Create `atomicWriteSync()` utility
  - [ ] 1.1 Implement write-to-tmp + rename pattern
  - [ ] 1.2 Handle Windows-specific rename behavior (may need unlink first)
  - [ ] 1.3 Write unit tests for utility
- [ ] 2. Apply atomic writes to 4 points
  - [ ] 2.1 `session-manager.js` — `updateSession()`
  - [ ] 2.2 `context-detector.js` — `_updateSessionState()`
  - [ ] 2.3 `unified-activation-pipeline.js` — `_writeSynapseSession()`
  - [ ] 2.4 `unified-activation-pipeline.js` — `_persistUapMetrics()`
- [ ] 3. Wire session cleanup
  - [ ] 3.1 Add `cleanStaleSessions()` call in `resolveHookRuntime()` (first prompt only)
  - [ ] 3.2 Read TTL from core-config.yaml with 168h default
  - [ ] 3.3 Add "first prompt" guard to prevent repeated cleanup
  - [ ] 3.4 Write test for cleanup integration
- [ ] 4. Run full test suite — zero regressions
- [ ] 5. Journey Snapshot: Run `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-12"`
  - [ ] 5.1 Compare with NOG-10 snapshot — zero regressions in unrelated metrics
  - [ ] 5.2 Document improvements/changes in journey-log.md
  - [ ] 5.3 If regression detected: fix before push or document as accepted trade-off
- [ ] 6. Update story checkboxes and file list

---

## Testing

### Specific Tests
- `tests/synapse/atomic-write.test.js` — utility tests (new)
- `tests/synapse/session-manager.test.js` — cleanup wiring test (extended)
- `tests/synapse/engine.test.js` — verify existing tests still pass

### Performance Journey
- `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-12" --compare="NOG-10"`
- Expected: atomic writes (no timing impact), session cleanup wired, no regressions

---

## CodeRabbit Integration

Standard self-healing (dev phase): max 2 iterations, CRITICAL/HIGH auto-fix.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Expanded from QW-7 per Codex QA finding #2. |
