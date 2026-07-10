---
name: close-story
description: >
  Finalize bookkeeping for a story already completed by QA. Never changes lifecycle status.
  Use when: close story, *close-story, story Done, /close-story.
user-invocable: true
argument-hint: "{story-path} [yolo|interactive]"
agent: po
---

# close-story

Lean SDC skill. **Task is source of truth.**

## Task SOT

`.aiox-core/development/tasks/po-close-story.md`

## Input

- `$ARGUMENTS[0]` — story path
- `$ARGUMENTS[1]` — mode

## Pre-close gates (blocking)

Before any administrative write, verify (this skill must not modify lifecycle Status):

1. Review/gate verdict exists and is PASS, CONCERNS (accepted), or WAIVED — not FAIL/missing.
2. Acceptance criteria met.
3. Tasks checked complete; File List present.
4. Quality gates green (or documented waiver).
5. Story is already **Done** by QA; any other status is an integrity violation.

On any hard fail → **HALT**, no administrative write and no Status change.

## Protocol

1. Load and execute `po-close-story.md`.
2. Adopt **@po**.
3. Preserve **Status: Done**; do not perform a lifecycle transition.
4. Update epic index/backlog and closure metadata if required.
5. Suggest next story when applicable.

## Post-phase verification

- [ ] `Status: Done` remains unchanged on disk
- [ ] Administrative closure entry added only when it carries new metadata
- [ ] Epic index updated if applicable

## Forbidden

- Closing without a review verdict or before QA sets Done
- Changing story lifecycle status
- `git push` (still `@devops`)
- Product harvest trees (see ARCH-A denylist)
