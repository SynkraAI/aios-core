---
metadata:
  short-description: "AIOX workflow: aiox-close-story"
name: aiox-close-story
description: >
  Close a completed story (Status → Done). ONLY skill authorized to mark Done in lean SDC.
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

Before mutating Status, verify:

1. Review/gate verdict exists and is PASS, CONCERNS (accepted), or WAIVED — not FAIL/missing.
2. Acceptance criteria met.
3. Tasks checked complete; File List present.
4. Quality gates green (or documented waiver).
5. Story is not already Done (idempotent warn + exit).

On any hard fail → **HALT**, no Status change.

## Protocol

1. Load and execute `po-close-story.md`.
2. Adopt **@po**.
3. Set **Status → Done**; append Change Log.
4. Update epic index/table if the task requires it.
5. Suggest next story when applicable.

## Post-phase verification

- [ ] `Status: Done` on disk
- [ ] Change Log entry for close
- [ ] Epic index updated if applicable

## Forbidden

- Closing without a review verdict
- Hand-editing Done outside this skill during full-sdc
- `git push` (still `@devops`)
- Product harvest trees (see ARCH-A denylist)
