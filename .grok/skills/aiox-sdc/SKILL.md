---
name: aiox-sdc
description: >
  Run the AIOX Story Development Cycle (create → validate → develop → QA). Use when starting a story lifecycle, SDC, or full-cycle story work. Slash: /aiox-sdc
metadata:
  short-description: "AIOX workflow: aiox-sdc"
---

# AIOX Story Development Cycle (SDC)

Primary development workflow. Task-first: follow task files, not improvised steps.

## Phases

| Phase | Agent | Task | Output status |
|-------|-------|------|---------------|
| 1 Create | @sm | `.aiox-core/development/tasks/create-next-story.md` (or sm-create-next-story) | Draft |
| 2 Validate | @po | `.aiox-core/development/tasks/validate-next-story.md` | Ready (on GO) |
| 3 Develop | @dev | `.aiox-core/development/tasks/dev-develop-story.md` | InProgress → InReview |
| 4 QA Gate | @qa | `.aiox-core/development/tasks/qa-gate.md` | Done path after PASS |
| 5 Push | @devops | pre-push + push/PR | remote |

## Rules

1. Never skip Validate for non-trivial work.
2. @dev must not edit AC/title/scope.
3. Only @devops may `git push` / create PRs.
4. Quality gates before push: `npm run lint && npm run typecheck && npm test`.
5. Constitution: `.aiox-core/constitution.md`

## How to run in Grok

1. Activate persona skill (`/aiox-sm`, then `/aiox-po`, …) or stay general and follow phases.
2. Load the phase task file and execute exactly.
3. Update story checkboxes and File List as you go.

