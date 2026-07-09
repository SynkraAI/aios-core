---
metadata:
  short-description: "AIOX workflow: aiox-full-sdc"
name: aiox-full-sdc
description: >
  Lean Full Story Development Cycle for one story: validate → develop → review
  (QG loop) → close. Thin orchestrator over OSS tasks. No hub worktree product.
  Use when: full-sdc, full cycle, SDC, run story end-to-end.
user-invocable: true
argument-hint: "{story-path} [yolo|interactive]"
agent: aiox-master
---

# full-sdc (lean)

Orchestrator only. Atomic skills + task files do the work. Soft Sequence Lock.

**Not in scope:** hub full-sdc (~2k LOC), worktree product registry, hub conductor adapters, product harvest trees, product deploy hosts.

## Invocation

```
/full-sdc {story-path} [yolo|interactive]
```

Default mode: `interactive`.

## Phase map

| # | Skill | Default agent | Task SOT |
|---|-------|---------------|----------|
| 1 | `validate-story-draft` | @po | `validate-next-story.md` |
| 2 | `develop-story` | @dev / executor | `dev-develop-story.md` |
| 3 | `review-story` | @qa / quality_gate | `qa-gate.md` (+ `qa-review-story.md`) |
| 3b | `apply-qa-fixes` | @dev / executor | `apply-qa-fixes.md` |
| 4 | deploy | — | **skip** when no deploy config / deploy_type none |
| 5 | `close-story` | @po | `po-close-story.md` |

Skill bodies: `.aiox-core/development/skills/<name>/SKILL.md`

## Sequence Lock (soft)

1. Run phases **in order**. Do not start N+1 until phase N artifacts exist on disk.
2. After each phase, verify the checklist in that skill's "Post-phase verification".
3. **Only `close-story` may set `Status: Done`.**
4. If `Status: Done` appears before phase 5 → **HALT** (integrity violation); do not continue.
5. QG loop: review FAIL/CONCERNS → apply-qa-fixes → review again. Max **3** fix cycles → escalate to human.
6. Anti-self-validation: executor ≠ quality_gate; if equal, escalate QG to a different agent.

## Modes

| Mode | Behavior |
|------|----------|
| `interactive` | Report between phases; stop on blockers; ask on decisions |
| `yolo` | Autonomous between phases; stop only on absolute blockers / circuit breaker |

## Post-phase verification (orchestrator)

| After | Must see on disk |
|-------|------------------|
| validate | Ready (GO) or stop on NO-GO |
| develop | Tasks checked; File List; not Done |
| review | Gate / QA Results + verdict; not Done |
| apply-qa-fixes | Fixes + retest notes |
| close | Status Done + Change Log |

## Execution style

- Prefer loading each skill file and following it (or the task it names) as the phase protocol.
- Single-session sequential is OK for OSS lean; real multi-agent teams optional when available.
- Local commits during develop; **push/PR only via `@devops`** after close (or when user asks devops).

## Explicitly non-ported

- Worktree auto-spawn / registry / GC
- `.sdc-ack` full matrix (v1 = checklists only)
- deploy-story / verify product targets
- product-only tiers / owner squad / product local-canon paths

## Strip checklist (must stay true)

- [ ] No product-prefix or product local-canon paths
- [ ] No product harvest trees
- [ ] No product deploy host hardcodes
- [ ] Skills invoke tasks only (no parallel invented AC)
