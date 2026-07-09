# AIOX × Grok — Compact Rules

These rules apply in every Grok session in this repo. Full constitution: `.aiox-core/constitution.md`.

## Authority (non-negotiable)

| Operation | Exclusive agent | Skill |
|-----------|-----------------|-------|
| `git push`, PR create/merge, releases | devops (Gage) | `/aiox-devops` |
| Story draft/create | sm (River) | `/aiox-sm` |
| Story validate → Ready | po (Pax) | `/aiox-po` |
| Implementation | dev (Dex) | `/aiox-dev` |
| QA gate verdict | qa (Quinn) | `/aiox-qa` |
| Architecture decisions | architect (Aria) | `/aiox-architect` |
| Schema/migrations/RLS | data-engineer (Dara) | `/aiox-data-engineer` |

## Story lifecycle

`Draft → Ready → InProgress → InReview → Done`

SDC skill: `/aiox-sdc`

## Quality gates

```bash
npm run lint && npm run typecheck && npm test
```

## Layers (do not corrupt)

- **L1/L2** framework core & templates under `.aiox-core/` — extend carefully; frameworkProtection may deny edits
- **L4** project work: `docs/stories/`, `packages/`, `squads/`, `tests/`

## Grok entry points

- Agents: `.grok/agents/` (also spawnable as `subagent_type`)
- Skills: `/aiox-*` under `.grok/skills/`
- Source of truth agents: `.aiox-core/development/agents/`

## Portable paths

Never commit machine-specific absolute paths. Use repo-relative paths.
