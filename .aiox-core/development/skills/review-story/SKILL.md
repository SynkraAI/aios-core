---
name: review-story
description: >
  QA gate for a story — verdict PASS/CONCERNS/FAIL/WAIVED + gate file. Does NOT set Done.
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

### Status policy (Wave B / ARCH-B override)

The legacy task prose may say `InReview → Done` on PASS. **For lean SDC this skill must NOT set `Status: Done`.**

| Verdict | Status action |
|---------|----------------|
| PASS / CONCERNS | Ensure story is **InReview** (or leave ready-for-close); Change Log notes gate verdict. **Done only via `close-story`.** |
| FAIL | Return to **InProgress**; list fixes for `apply-qa-fixes` |
| WAIVED | Document waiver; same as PASS regarding Done (close-story only) |

Rationale: Sequence Lock — only `close-story` / `po-close-story` marks Done after closure gates.

## Post-phase verification

- [ ] Gate file on disk (or equivalent QA Results with explicit verdict)
- [ ] Story QA Results updated
- [ ] Status is **not** silently set to Done by this skill

## Forbidden

- Setting `Status: Done`
- Self-approving as the same agent that implemented (anti-self-review)
- Product harvest trees or product-only local canon (see ARCH-A denylist)
- `git push`
