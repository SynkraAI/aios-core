# Grok Skills/Agents Sync

Gera artefatos otimizados do AIOX para o **Grok Build TUI**.

## Usage

```bash
# From repo root
npm run sync:skills:grok
npm run sync:skills:grok:dry
```

## Outputs

| Path | Content |
|------|---------|
| `.grok/agents/*.md` | Agent profiles nativos (frontmatter Grok) |
| `.grok/skills/aiox-*/SKILL.md` | Skills de ativação de persona |
| `.grok/skills/aiox-sdc/` etc. | Skills de workflow |
| `.grok/roles/*.toml` | Defaults de capability para subagents |
| `.grok/personas/*.toml` | Overlays comportamentais |
| `.grok/rules/aiox-core.md` | Regras compactas always-on |
| `.grok/README.md` | Documentação da integração |

## Design

- **Token-efficient:** prompts condensados; YAML completo fica em `.aiox-core/development/agents/`
- **Authority-safe:** matriz de autoridades AIOX embutida (ex.: só devops faz push)
- **Regenerável:** re-rode o sync após mudanças nos agents fonte

## Source

Lê agents via `ide-sync/agent-parser` a partir de `.aiox-core/development/agents/`.
Overlays de perfil Grok: `AGENT_PROFILES` em `index.js`.
