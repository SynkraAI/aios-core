---
paths:
  - docs/stories/**
  - .aiox-core/development/tasks/**
  - .aiox-core/development/workflows/**
---

# Story Workflow — Development Lifecycle

## Status Progression

```
Draft → Ready → InProgress → InReview → Done
```

| Status | Agent | Trigger |
|--------|-------|---------|
| Draft | @sm | Story file created |
| Ready | @po | Validates (GO ≥7/10) — **MUST update status** |
| InProgress | @dev | Starts implementation |
| InReview | @qa | Reviews quality |
| Done | @devops | Pushes to remote |

---

## Story Development Cycle (SDC) — 4 Phases

### Phase 1: Create (@sm)
- **Inputs:** PRD sharded, epic context
- **Output:** `{epicNum}.{storyNum}.story.md` (Draft)

### Phase 2: Validate (@po)
**10-Point Checklist:**
1. Clear title | 2. Complete description | 3. Testable AC (Given/When/Then)
4. Defined scope (IN/OUT) | 5. Dependencies mapped | 6. Complexity estimate
7. Business value | 8. Risks documented | 9. Criteria of Done | 10. PRD/Epic alignment

**Decision:** GO (≥7/10) or NO-GO (fixes listed)

### Phase 3: Implement (@dev)
**Modes:** YOLO (autonomous) | Interactive (default) | Pre-Flight (plan-first)
**CodeRabbit:** Self-healing max 2 iterations. CRITICAL after 2 → HALT.

### Phase 4: QA Gate (@qa)
**7 Quality Checks:** Code review | Unit tests | AC met | No regressions | Performance | Security | Docs

| Decision | Action |
|----------|--------|
| PASS | Proceed to @devops push |
| CONCERNS | Approve with observations |
| FAIL | Return to @dev |
| WAIVED | Approve with waiver (rare) |

---

## QA Loop — Iterative Review

```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```

**Commands:** `*qa-loop {storyId}` | `*stop-qa-loop` | `*resume-qa-loop` | `*escalate-qa-loop`

**Escalation:** max_iterations_reached | verdict_blocked | fix_failure | manual_escalate

---

## Spec Pipeline — Pre-Implementation

| Phase | Agent | Output | Skip If |
|-------|-------|--------|---------|
| 1. Gather | @pm | requirements | Never |
| 2. Assess | @architect | complexity | source=simple |
| 3. Research | @analyst | research | SIMPLE class |
| 4. Write Spec | @pm | spec.md | Never |
| 5. Critique | @qa | critique | Never |
| 6. Plan | @architect | implementation | If APPROVED |

**Complexity:** ≤8 SIMPLE (3 phases) | 9-15 STANDARD (all 6) | ≥16 COMPLEX (6 + revision)

---

## Brownfield Discovery — Legacy Assessment

10-phase technical debt assessment. Data Collection (1-3) → Draft & Validation (4-7) → Finalization (8-10).
QA Gate Phase 7: APPROVED or NEEDS WORK (return to Phase 4).

---

## Story File Update Rules

| Section | Who Can Edit |
|---------|-------------|
| Title, Description, AC, Scope | @po only |
| File List, Dev Notes, checkboxes | @dev |
| QA Results | @qa only |
| Change Log | Any agent (append only) |

---

## Workflow Selection

| Situation | Workflow |
|-----------|---------|
| New story from epic | SDC |
| QA found issues | QA Loop |
| Complex feature needs spec | Spec Pipeline → SDC |
| Joining existing project | Brownfield Discovery |
| Simple bug fix | SDC only (YOLO mode) |
