---
name: aiox-sdc
description: >
  Run the AIOX Story Development Cycle. Prefer /aiox-full-sdc (lean orchestrator). Slash: /aiox-sdc
metadata:
  short-description: "AIOX workflow: aiox-sdc"
---

# AIOX Story Development Cycle (SDC)

Primary development workflow. **Task-first.** Prefer the lean orchestrator skill:

`.aiox-core/development/skills/full-sdc/SKILL.md` → Grok: `/aiox-full-sdc`

## Phases

| Phase | Skill | Agent | Task SOT |
|-------|-------|-------|----------|
| 1 Create | (sm create) | @sm | `create-next-story.md` |
| 2 Validate | `validate-story-draft` | @po | `validate-next-story.md` → Ready on GO |
| 3 Develop | `develop-story` | @dev | `dev-develop-story.md` |
| 4 Review | `review-story` | @qa | `qa-gate.md` — **not Done** |
| 4b Fix | `apply-qa-fixes` | @dev | `apply-qa-fixes.md` (QG loop ≤3) |
| 5 Close | `close-story` | @po | `po-close-story.md` → **Done** |
| 6 Push | @devops | @devops | pre-push + push/PR |

## Rules

1. Never skip Validate for non-trivial work.
2. @dev must not edit AC/title/scope.
3. Only @devops may `git push` / create PRs.
4. Only `close-story` sets Status Done (Sequence Lock).
5. Quality gates: `npm run lint && npm run typecheck && npm test`.
6. Constitution: `.aiox-core/constitution.md`
7. No product harvest trees (ARCH-A denylist).

