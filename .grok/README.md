# AIOX Grok Integration

Optimized agents, skills, roles, and personas for [Grok Build TUI](https://grok.x.ai).

## Layout

| Path | Purpose |
|------|---------|
| `agents/` | Native Grok agent profiles (session + spawnable types) |
| `skills/aiox-*/` | Slash skills to activate personas |
| `skills/aiox-sdc/` etc. | Workflow skills (SDC, gates, handoff, commit) |
| `roles/` | Subagent capability defaults |
| `personas/` | Behavioral overlays for subagents |
| `rules/` | Always-on compact AIOX rules |

## Activate an agent

```text
/aiox-dev
/aiox-qa
/aiox-devops
/aiox-squad-creator
```

Or ask in natural language ("implement this story", "create a PR") — skill descriptions drive auto-invocation.

## Regenerate

From repo root:

```bash
npm run sync:skills:grok
# or
node .aiox-core/infrastructure/scripts/grok-skills-sync/index.js
```

Dry-run:

```bash
npm run sync:skills:grok -- --dry-run
```

## Design principles

1. **Token-efficient** — condensed profiles; full YAML stays in `.aiox-core/development/agents/`
2. **Authority-safe** — devops-only push; story lifecycle ownership
3. **Task-first** — formal work loads `.aiox-core/development/tasks/*`
4. **Grok-native** — frontmatter `permission_mode`, roles, personas

## Related

- Codex skills: `npm run sync:skills:codex`
- IDE sync: `npm run sync:ide`
- Constitution: `.aiox-core/constitution.md`
