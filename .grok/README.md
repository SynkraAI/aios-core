# AIOX Grok Integration

Optimized agents, skills, roles, personas, hooks, and project config for [Grok Build TUI](https://grok.x.ai).

## Layout

| Path | Purpose |
|------|---------|
| `agents/` | Native Grok agent profiles (session + spawnable types) |
| `skills/aiox-*/` | Slash skills to activate personas |
| `skills/aiox-sdc/`, `aiox-full-sdc/`, atomics | Workflow skills (lean SDC + gates + handoff) |
| `skills/develop-story/`, etc. | Short aliases (`/develop-story` → `/aiox-develop-story`) |
| `roles/` | Subagent capability defaults |
| `personas/` | Behavioral overlays for subagents |
| `rules/` | Always-on compact AIOX rules |
| `hooks/` | PreToolUse git-push authority (Article II) |
| `config.toml` | Project skill hygiene (ignore Codex dumps) |

## Activate an agent

```text
/aiox-dev
/aiox-qa
/aiox-devops
/aiox-squad-creator
```

Short workflow aliases (no Claude compat required):

```text
/develop-story
/validate-story-draft
/review-story
/full-sdc
/commit
```

Or ask in natural language ("implement this story", "create a PR") — skill descriptions drive auto-invocation.

## Authority (git push)

`hooks/git-push-authority.json` runs `enforce-git-push-authority.cjs` on
`Bash|run_terminal_command`. Only devops may `git push` / `gh pr create|merge`.

Identity resolution order:

1. Env `AIOX_ACTIVE_AGENT` / command-scoped export
2. Bridge files written on skill/agent activation:
   - `.aiox/active-agent`
   - `.aiox/active-agent.json`
   - `.synapse/sessions/_active-agent.json`

Also: `hooks/synapse-prompt.json`, `hooks/precompact.json` — fully Grok-native: their commands run wrappers vendored under `.grok/hooks/` (copied at sync time from `.claude/hooks/`), so no Claude settings or runtime files are required.

Short agent spawn aliases: `dev`, `po`, `qa`, `devops`, … under `agents/`.

## Regenerate

From repo root:

```bash
npm run sync:skills:grok
npm run validate:skills:grok
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
4. **Grok-native** — frontmatter `permission_mode`, roles, personas, hooks fully self-contained under `.grok/hooks/` (wrappers vendored at sync time from `.claude/hooks/`)

## Related

- Codex skills: `npm run sync:skills:codex`
- IDE sync: `npm run sync:ide`
- Constitution: `.aiox-core/constitution.md`
- Verify discovery: `grok inspect`
