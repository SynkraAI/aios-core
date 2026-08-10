# Grok Skills/Agents Sync

Gera artefatos otimizados do AIOX para o **Grok Build TUI**.

## Usage

```bash
# From repo root
npm run sync:skills:grok
npm run sync:skills:grok:dry
npm run validate:skills:grok
```

## Installer

`npx aiox-core install` (wizard) lists **Grok Build** as a recommended IDE/CLI.
When selected, the installer:

1. Writes `.grok/rules/aiox-core.md` from the product template
2. Runs `grok-skills-sync` → full `.grok/{agents,skills,roles,personas,hooks,config.toml}`

Same path as Codex local-first skills generation.

## Outputs

| Path | Content |
|------|---------|
| `.grok/agents/*.md` | Agent profiles nativos (frontmatter Grok) |
| `.grok/skills/aiox-*/SKILL.md` | Skills de ativação de persona |
| `.grok/skills/aiox-sdc/` etc. | Skills de workflow |
| `.grok/skills/develop-story/` etc. | Aliases curtos (`/develop-story` → `/aiox-develop-story`) |
| `.grok/roles/*.toml` | Defaults de capability para subagents |
| `.grok/personas/*.toml` | Overlays comportamentais |
| `.grok/rules/aiox-core.md` | Regras compactas always-on |
| `.grok/hooks/` | PreToolUse git-push authority (Claude + Grok payloads) |
| `.grok/config.toml` | Higiene de skills (ignore dumps Codex) |
| `.grok/README.md` | Documentação da integração |

## Design

- **Token-efficient:** prompts condensados; YAML completo fica em `.aiox-core/development/agents/`
- **Authority-safe:** matriz de autoridades AIOX embutida (ex.: só devops faz push)
- **Regenerável:** re-rode o sync após mudanças nos agents fonte

## Source

Lê agents via `ide-sync/agent-parser` a partir de `.aiox-core/development/agents/`.
Overlays de perfil Grok: `AGENT_PROFILES` em `index.js`.
