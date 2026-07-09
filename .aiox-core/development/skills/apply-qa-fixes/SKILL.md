---
name: apply-qa-fixes
description: >
  Apply QA gate findings then hand back for re-review. Never self-approves or closes.
  Use when: apply QA fixes, remediate gate FAIL/CONCERNS, /apply-qa-fixes.
user-invocable: true
argument-hint: "{story-path} [yolo|interactive]"
agent: dev
---

# apply-qa-fixes

Lean SDC skill. **Task is source of truth.**

## Task SOT

`.aiox-core/development/tasks/apply-qa-fixes.md`

## Input

- `$ARGUMENTS[0]` — story path (must have QA Results / gate file)
- `$ARGUMENTS[1]` — mode

## Protocol

1. Load and execute `apply-qa-fixes.md`.
2. Adopt story **Executor** (fallback `@dev`).
3. Inventory **all** findings before fixing (complete-findings).
4. Fix CRITICAL/HIGH before MEDIUM/LOW; each finding → FIXED | WON'T_FIX (justified) | DEFERRED (owner).
5. Re-run `npm run lint && npm run typecheck && npm test`.
6. Update File List + QA Results resolution notes.
7. **Hand back to `review-story`** — do not self-approve, do not set Done.

## Post-phase verification

- [ ] Findings addressed (or justified)
- [ ] Gates re-run and noted
- [ ] Story still not `Done`

## Forbidden

- Self-approving the gate
- `Status: Done`
- `git push`
- Product harvest trees (see ARCH-A denylist)
