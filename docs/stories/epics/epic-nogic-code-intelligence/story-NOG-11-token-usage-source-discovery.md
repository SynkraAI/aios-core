# Story NOG-11: Token Usage Source Discovery & Integration Design

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-11 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Technical Discovery / Spike |
| **Status** | Draft |
| **Priority** | P0 |
| **Points** | 3 |
| **Agent** | @architect (Aria) — research + @dev (Dex) — PoC |
| **Quality Gate** | @pm (Morgan) |
| **Blocked By** | NOG-10 (QW-1 must be wired first) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework architect**, I want to discover where real token usage data (`usage.input_tokens`) can be reliably sourced from in the Claude Code runtime, so that SYNAPSE bracket calculation can use real data instead of the static `promptCount x 1500` estimate — the only static estimation in the industry (per NOG-9 research C2).

---

## Problem Statement

NOG-9 originally proposed QW-2 (populate `last_tokens_used` from API response) as a Quick Win. Codex QA correctly identified this as **infeasible**: the SYNAPSE hook runs as `UserPromptSubmit` (before API call), so `usage.input_tokens` from the API response is not available in that flow.

This story investigates alternative sources and designs the integration path.

### Decision Criteria (Guardrail #3)

**Timebox:** 4 hours of investigation. If no reliable source found within timebox:
- **Fallback decision:** Continue with calibrated estimation (QW-3's 1.2x multiplier) + add instrumentation to log actual token usage when it becomes available
- **Criteria for "reliable source":** Source must provide `input_tokens` or equivalent within 100ms of prompt completion, with >95% availability

---

## Acceptance Criteria

### AC1: Source Investigation
- [ ] Investigate Claude Code hooks API — does a `PostResponse` or `AssistantResponse` hook exist?
- [ ] Investigate JSONL transcripts in `~/.claude/projects/*/` — does `usage` field appear in transcript entries?
- [ ] Investigate Claude Code's `conversation` or `session` persistence — any accessible token count?
- [ ] Document findings with evidence (code snippets, file locations, or "not found" with reasons)
- [ ] **Benchmark:** Measure latency of each viable source
- [ ] **Observability:** Document how to verify token source is working in production

### AC2: Integration Design (if source found)
- [ ] Design integration path from token source → `updateSession()` → `context.last_tokens_used`
- [ ] Identify timing constraints (when data available vs when SYNAPSE needs it)
- [ ] Estimate implementation effort
- [ ] Document in ADR format (decision, options evaluated, rationale)

### AC3: Fallback Plan (if no source found)
- [ ] Document calibration improvements to static estimator
- [ ] Propose instrumentation plan to capture real token data when API evolves
- [ ] Define monitoring hooks so transition to real data is seamless when available
- [ ] **Rollback:** Fallback to current QW-3 calibrated estimation (already working)

---

## Scope

### IN Scope
- Research Claude Code hook types and available events
- Inspect JSONL transcript format and content
- Design integration path (architecture document)
- PoC if viable source found (read-only, no production changes)

### OUT of Scope
- Production implementation of token counting (separate story STR-2)
- Changes to SYNAPSE engine architecture
- Changes to hook-runtime.js beyond PoC validation

---

## Research Plan

### Source A: Claude Code Hooks API
```
Investigate: Does Claude Code expose PostResponse / AssistantResponse hooks?
Location: Claude Code documentation, .claude/settings.json schema
Method: Check hook types available beyond UserPromptSubmit
```

### Source B: JSONL Transcripts
```
Investigate: Do transcript entries include usage.input_tokens?
Location: ~/.claude/projects/{project-hash}/*.jsonl
Method: Read recent transcript entries, search for "usage" or "tokens" fields
```

### Source C: Session Metadata
```
Investigate: Does Claude Code persist token counts in session state?
Location: ~/.claude/projects/{project-hash}/sessions/
Method: Inspect session files for token-related fields
```

### Source D: Hook Input Payload
```
Investigate: What fields does UserPromptSubmit input contain beyond {cwd, session_id, prompt}?
Method: Log full input payload from synapse-engine.cjs stdin
```

---

## Tasks/Subtasks

- [ ] 1. Research Phase (timeboxed: 4h)
  - [ ] 1.1 Investigate Claude Code hooks API for post-response events
  - [ ] 1.2 Inspect JSONL transcripts for usage data
  - [ ] 1.3 Inspect session metadata for token counts
  - [ ] 1.4 Log full hook input payload to check for undocumented fields
- [ ] 2. Document findings in `docs/research/2026-02-21-uap-synapse-research/token-source-investigation.md`
- [ ] 3. If source found:
  - [ ] 3.1 Create PoC reading token data from source
  - [ ] 3.2 Measure latency and reliability
  - [ ] 3.3 Design integration path (ADR)
- [ ] 4. If no source found:
  - [ ] 4.1 Document calibration improvements for static estimator
  - [ ] 4.2 Propose instrumentation plan
  - [ ] 4.3 Define monitoring hooks for future transition
- [ ] 5. Decision: GO (proceed to STR-2 with real source) or CALIBRATE (improve estimation)
- [ ] 6. Journey Snapshot: Run `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-11"`
  - [ ] 6.1 Compare with NOG-10 snapshot — zero regressions in unrelated metrics
  - [ ] 6.2 Document improvements/changes in journey-log.md
  - [ ] 6.3 If regression detected: fix before push or document as accepted trade-off

---

## Testing

N/A — Research/spike story. PoC only, no production code.

### Performance Journey
- `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-11" --compare="NOG-10"`
- Expected: last_tokens_used populated (if viable source found), no regressions

---

## CodeRabbit Integration

> **N/A — Research/spike story.** No production code changes expected.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Reclassified from QW-2 per Codex QA review. |
