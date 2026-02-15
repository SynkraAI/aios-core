# AGENTS.md - Synkra AIOS

Este arquivo configura o comportamento esperado de agentes no Codex CLI neste repositorio.

## Constitution

Siga `.aios-core/constitution.md` como fonte de verdade:
- CLI First
- Agent Authority
- Story-Driven Development
- No Invention
- Quality First
- Absolute Imports

## Workflow Obrigatorio

1. Inicie por uma story em `docs/stories/`
2. Implemente apenas o que os acceptance criteria pedem
3. Atualize checklist (`[ ]` -> `[x]`) e file list
4. Execute quality gates antes de concluir

## Quality Gates

```bash
npm run lint
npm run typecheck
npm test
```

## Estrutura Principal

- Core framework: `.aios-core/`
- CLI: `bin/`
- Pacotes: `packages/`
- Testes: `tests/`
- Documentacao: `docs/`

## IDE/Agent Sync

- Sincronizar regras/agentes: `npm run sync:ide`
- Validar drift: `npm run sync:ide:check`
- Gerar skills locais do Codex: `npm run sync:skills:codex`
- Este repositorio usa **local-first**: prefira `.codex/skills` versionado no projeto
- Use `sync:skills:codex:global` apenas para testes fora deste repo

## Agent Shortcuts (Codex)

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aios-<agent-id>` vindo de `.codex/skills` (ex.: `aios-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Quando a mensagem do usuario for um atalho de agente, carregue o arquivo correspondente em `.aios-core/development/agents/` (fallback: `.codex/agents/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate receber `*exit`.

Atalhos aceitos por agente:
- `@aios-master`, `/aios-master`, `/aios-master.md` -> `.aios-core/development/agents/aios-master.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aios-core/development/agents/analyst.md`
- `@architect`, `/architect`, `/architect.md` -> `.aios-core/development/agents/architect.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aios-core/development/agents/data-engineer.md`
- `@dev`, `/dev`, `/dev.md` -> `.aios-core/development/agents/dev.md`
- `@devops`, `/devops`, `/devops.md` -> `.aios-core/development/agents/devops.md`
- `@pm`, `/pm`, `/pm.md` -> `.aios-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aios-core/development/agents/po.md`
- `@qa`, `/qa`, `/qa.md` -> `.aios-core/development/agents/qa.md`
- `@sm`, `/sm`, `/sm.md` -> `.aios-core/development/agents/sm.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aios-core/development/agents/squad-creator.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aios-core/development/agents/ux-design-expert.md`

Resposta esperada ao ativar atalho:
1. Confirmar agente ativado
2. Mostrar 3-6 comandos principais (`*help`, etc.)
3. Seguir na persona do agente
