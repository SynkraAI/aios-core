---
name: review-story
description: >
  QA gate for a story — verdict PASS/CONCERNS/FAIL/WAIVED + lifecycle transition.
  Use when: review story, qa gate, *qa-gate, /review-story.
user-invocable: true
argument-hint: "{story-path} [yolo|interactive]"
agent: qa
---

# review-story

Lean SDC skill. **Task is source of truth** for gate schema and review depth.

## Task SOT

Primary:

`.aiox-core/development/tasks/qa-gate.md`

Supporting (deep review):

`.aiox-core/development/tasks/qa-review-story.md`

## Input

- `$ARGUMENTS[0]` — story path
- `$ARGUMENTS[1]` — mode (`yolo` | `interactive`)

## Protocol

1. Load `qa-gate.md` and execute review + gate-file write.
2. Adopt **@qa** (or story quality_gate if ≠ executor).
3. Write gate under `docs/qa/gates/` (path per task/core-config).
4. Update story **QA Results** section with verdict + gate path.
5. Verdicts: **PASS** | **CONCERNS** | **FAIL** | **WAIVED**.

### Status policy (canonical lifecycle)

The QA task and `.claude/rules/story-lifecycle.md` are authoritative.

| Verdict | Status action |
|---------|----------------|
| PASS / CONCERNS | Set **Done** and append the `InReview → Done` Change Log transition. |
| FAIL | Return to **InProgress**; list fixes for `apply-qa-fixes` |
| WAIVED | Document waiver, set **Done**, and append the lifecycle transition. |

## Post-phase verification

- [ ] Gate file on disk (or equivalent QA Results with explicit verdict)
- [ ] Story QA Results updated
- [ ] PASS/CONCERNS/WAIVED set Done; FAIL sets InProgress

## Forbidden

- Self-approving as the same agent that implemented (anti-self-review)
- Product harvest trees or product-only local canon (see ARCH-A denylist)
- `git push`
