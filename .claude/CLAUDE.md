# CLAUDE.md - Synkra AIOX

Sistema de orquestração de agentes AI para desenvolvimento full-stack. Agentes especializados colaboram via CLI para implementar, testar e entregar software com qualidade.

**Filosofia:** CLI First | Observability Second | UI Third

---

## Constitution

Princípios inegociáveis com gates automáticos. Documento completo: `.aiox-core/constitution.md`

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First — toda funcionalidade 100% via CLI antes de UI | NON-NEGOTIABLE |
| II | Agent Authority — cada agente tem escopo exclusivo | NON-NEGOTIABLE |
| III | Story-Driven Development — sem story, sem código | MUST |
| IV | No Invention — sem features inventadas | MUST |
| V | Quality First — lint + typecheck + test passam | MUST |
| VI | Absolute Imports — `@/` alias, sem `../../` | SHOULD |
| VII | pt-BR Quality — todo texto pt-BR com acentuação completa, sem exceção. Ref: `skills/pt-br-accentuation/SKILL.md` | NON-NEGOTIABLE |

---

## Estrutura do Projeto

```
aiox-core/
├── .aiox-core/              # Core do framework (L1-L2: NEVER modify)
│   ├── core/                # Módulos principais (orchestration, memory)
│   ├── data/                # Knowledge base, entity registry (L3: mutable)
│   └── development/         # Agents, tasks, templates, checklists
├── bin/                     # CLI executables (aiox-init.js, aiox.js)
├── docs/                    # Documentação e stories (L4: runtime)
│   ├── stories/             # Development stories (active/, completed/)
│   └── projects/            # Project state (INDEX.md, sessions/)
├── packages/                # Shared packages (L4: runtime)
├── squads/                  # Squad expansions (L4: runtime)
└── tests/                   # Testes (L4: runtime)
```

**Framework boundary:** L1-L2 protegidos por deny rules em `.claude/settings.json`. Toggle: `core-config.yaml` → `boundary.frameworkProtection`.

---

## Agentes

Ative com `@agent-name` ou `/AIOX:agents:agent-name`. Comandos: `*help`, `*create-story`, `*task {name}`, `*exit`.

| Agente | Escopo | Exclusividade |
|--------|--------|---------------|
| `@dev` | Implementação de código | git local (add/commit/branch) |
| `@qa` | Testes e qualidade | Quality gates |
| `@architect` | Arquitetura e design | Decisões técnicas |
| `@pm` | Product Management | Epics e specs |
| `@po` | Product Owner | Validação de stories |
| `@sm` | Scrum Master | Criação de stories |
| `@devops` | CI/CD, releases | **EXCLUSIVO: git push, PRs, MCP** |
| `@analyst` | Pesquisa e análise | Research |
| `@data-engineer` | Database design | Schema, migrations |
| `@ux-design-expert` | UX/UI design | Frontend spec |

Detalhes completos: `.claude/rules/agent-authority.md` e `.claude/rules/agent-handoff.md`

---

## Workflows

**Story Development Cycle:** `@sm draft → @po validate → @dev implement → @qa gate → @devops push`

Todo desenvolvimento começa com uma story em `docs/stories/`. Marque checkboxes conforme completa, mantenha File List atualizada.

Detalhes completos: `.claude/rules/story-workflow.md`

---

## Comandos Essenciais

```bash
npm test              # Testes
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run build         # Build produção

# Dev server — SEMPRE usar port-manager (NUNCA hardcode porta)
eval $(node ~/aios-core/tools/monitoring/port-manager.js auto <project>) && PORT=$PORT npm run dev

# Ecosystem Index
node scripts/generate-ecosystem-index.js    # Regenerar índice de minds/agentes
/ecosystem-index                            # Ver índice completo
/ecosystem-index minds                      # Ver só minds
```

**⚠️ Port Management:** NUNCA iniciar dev server sem alocar porta. Detalhes: `.claude/rules/port-management.md`

---

## Convenções Git

Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`
Referencie story: `feat: implement feature [Story 2.1]`
Branches: `main`, `feat/*`, `fix/*`, `docs/*`
**Push: apenas `@devops`.**

---

## Documentação Detalhada

Consulte sob demanda — estes arquivos NÃO precisam ser lidos antecipadamente:

| Documento | Quando consultar |
|-----------|-----------------|
| `.claude/rules/agent-authority.md` | Ao delegar entre agentes |
| `.claude/rules/agent-handoff.md` | Ao trocar de agente (`@agent`) |
| `.claude/references/tool-examples.md` | Ao escolher tools (MCP vs nativo) |
| `.claude/references/mcp-usage-detail.md` | Detalhes de cada MCP server |
| `.claude/references/ids-principles.md` | Princípios IDS (quando epic sair de Draft) |
| `.aiox-core/constitution.md` | Para regras completas da Constitution |

---

*Synkra AIOX v4.1 — CLI First | Observability Second | UI Third*
