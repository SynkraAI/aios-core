---
name: validate-story-draft
description: >
  Validate a story draft (Draft → Ready on GO). Runs the OSS PO validation task.
  Use when: validate story, *validate-story-draft, /validate-story-draft, story readiness.
user-invocable: true
argument-hint: "{story-path} [yolo|interactive]"
agent: po
---

# validate-story-draft

Lean SDC skill. **Task is source of truth** — do not invent a parallel checklist.

## Task SOT

Load and execute:

`.aiox-core/development/tasks/validate-next-story.md`

Fallback if project uses the dev-side validator:

`.aiox-core/development/tasks/dev-validate-next-story.md`

## Input

- `$ARGUMENTS[0]` — story path (required; ask if missing)
- `$ARGUMENTS[1]` — `yolo` | `interactive` (default `interactive`)

## Protocol

1. Read the task file fully; follow its pre-conditions, instructions, and exit criteria.
2. Adopt **@po** persona (or the story's quality-gate agent if specified and ≠ executor).
3. Run validation against the story template / 10-point (or task-defined) checklist.
4. Auto-fix only mechanical gaps the task allows; do not invent AC/scope.
5. On **GO** (including conditional GO after fixes): set story **Status → Ready**, append Change Log.
6. On **NO-GO**: leave Draft; list required fixes.

## Post-phase verification

Must be true on disk before handing off:

- [ ] Story file updated (Ready on GO, or Draft + remediation on NO-GO)
- [ ] Change Log entry present
- [ ] No `Status: Done` written by this skill

## Forbidden

- Setting `Status: Done`
- Product harvest trees or product-only local canon (see ARCH-A denylist)
- `git push` / PR (delegate `@devops`)

## Modes

| Mode | Behavior |
|------|----------|
| `interactive` | Confirm on ambiguity |
| `yolo` | Autonomous; log decisions in chat |
