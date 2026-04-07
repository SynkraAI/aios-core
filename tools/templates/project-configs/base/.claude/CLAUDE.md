# CLAUDE.md — {{PROJECT_NAME}}

## Projeto AIOX

Este projeto usa governança {{MODE}} AIOX.

{{MODE_DESCRIPTION}}

## Stack

[A definir — preencha com framework, database, ORM, etc. conforme o projeto evolui]

## Commands

[A definir — preencha após `npm init` ou setup do projeto]

## Conventions

- Absolute imports com `@/` alias — nunca imports relativos (`../../`)
- Componentes em PascalCase, arquivos em kebab-case
- 2 espaços de indentação, single quotes, semicolons
- try/catch com mensagens descritivas incluindo contexto
- Log errors com contexto antes de re-throw
- Comentários de código em inglês

## pt-BR Quality (NON-NEGOTIABLE)

- Todo texto em português DEVE ter acentuação completa: acentos, cedilhas, tils, crases
- Texto sem acentuação é violação constitucional — corrigir antes de entregar
- Aplica-se a: respostas, arquivos .md/.html, copy, relatórios, stories, outputs de squads/skills
- Na dúvida, ACENTUE. Referência: `~/aios-core/skills/pt-br-accentuation/SKILL.md`

## Security

- Nunca commitar `.env` ou credenciais
- Validar todo input de usuário em API routes
- Queries parametrizadas (sem SQL raw)
- Sanitizar output para prevenir XSS

## Comunicação

- **Tom:** explique como se fosse para um adolescente curioso de 15 anos. Inteligente, mas sem jargão
- **Metáforas obrigatórias:** sempre usar analogias do cotidiano para conceitos técnicos ou abstratos
- **Concisão:** se dá pra explicar em 3 linhas, não use 10
- **Pós-tarefa:** O que fiz, Por quê, Próximo passo, Erros (se houver)

## Governança AIOS

- **Modo:** {{MODE}}
- **INDEX:** `{{INDEX_PATH}}`
- **Stories:** `{{STORIES_PATH}}`
- **Sessions:** `{{SESSIONS_PATH}}`
- **ACTIVE.md:** `~/aios-core/docs/projects/ACTIVE.md` (registry central)
- **Framework:** `~/aios-core/`

## Ao iniciar sessão neste diretório

1. Leia `{{INDEX_PATH}}` para contexto completo
2. Verifique se há session file recente em `{{SESSIONS_PATH}}`
3. Ou use: `/resume {{PROJECT_SLUG}}`

## Ao finalizar sessão

1. Use: `/checkpoint` (detecta automaticamente modo {{MODE}})
2. INDEX.md e session são salvos em `{{SAVE_LOCATION}}`

## Port Management

Dev server DEVE usar port-manager — NUNCA hardcode porta:
```bash
eval $(node ~/aios-core/tools/port-manager.js auto {{PROJECT_SLUG}}) && PORT=$PORT npm run dev
```

## Behavioral Rules

Consulte `.claude/rules/behavioral-rules.md` para regras completas de NEVER/ALWAYS.
