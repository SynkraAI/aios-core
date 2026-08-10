# AIOX × Grok Build — Project Rules

Estas regras aplicam-se em toda sessão Grok Build neste repositório.
Full constitution: `.aiox-core/constitution.md`

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First → Observability Second → UI Third`
3. Trabalhe por stories em `docs/framework/epics/` (framework OSS) ou `docs/stories/` (projeto L4)
4. Não invente requisitos fora de story/PRD/research
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: authority -->
## Authority (non-negotiable)

| Operation | Exclusive agent | Skill |
|-----------|-----------------|-------|
| `git push`, PR create/merge, releases | devops (Gage) | `/aiox-devops` |
| Story draft/create | sm (River) | `/aiox-sm` |
| Story validate → Ready | po (Pax) | `/aiox-po` |
| Implementation | dev (Dex) | `/aiox-dev` |
| QA gate verdict | qa (Quinn) | `/aiox-qa` |

On `/aiox-*` activation, register the active-agent bridge:

```bash
mkdir -p .aiox .synapse/sessions
printf '%s\n' '{agent-id}' > .aiox/active-agent
export AIOX_ACTIVE_AGENT={agent-id}
```
<!-- AIOX-MANAGED-END: authority -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

```bash
npm run lint && npm run typecheck && npm test
```
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: entrypoints -->
## Grok entry points

- Agents: `.grok/agents/` (also spawnable as `subagent_type`)
- Skills: `/aiox-*` under `.grok/skills/`
- Short aliases: `/develop-story`, `/full-sdc`, `/commit`, …
- Hooks: `.grok/hooks/` (git-push authority, synapse, precompact)
- Source of truth agents: `.aiox-core/development/agents/`

Regenerate:

```bash
npm run sync:skills:grok
npm run validate:skills:grok
```

Discover:

```bash
grok inspect
```
<!-- AIOX-MANAGED-END: entrypoints -->

<!-- AIOX-MANAGED-START: shortcuts -->
## Agent shortcuts

```text
/aiox-master · /aiox-analyst · /aiox-architect · /aiox-data-engineer
/aiox-dev · /aiox-devops · /aiox-pm · /aiox-po
/aiox-qa · /aiox-sm · /aiox-squad-creator · /aiox-ux-design-expert
/aiox-full-sdc · /aiox-sdc · /aiox-quality-gates · /aiox-handoff · /aiox-commit
```

On every `/aiox-*` agent shortcut activation, the agent MUST confirm its
identity (name + persona), list 3–6 primary commands including `*help`, and
stay in that persona until `*exit`.
<!-- AIOX-MANAGED-END: shortcuts -->
