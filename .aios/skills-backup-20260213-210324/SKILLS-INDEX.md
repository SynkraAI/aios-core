# AIOS Skills Index

## Visao Geral

O AIOS tem 3 camadas distintas. NAO confundir:

```
AIOS Capabilities
├── agents/        (11) — Personas completas (ativadas com @agent)
├── skills/         (4) — Skills runtime (carregadas automaticamente em .aios/skills/)
└── slash commands/ (74) — Knowledge packs (ativados com /AIOS:skills:nome)
```

**Importante:** Slash commands sao arquivos markdown com expertise — NAO sao skills runtime.
Skills runtime carregam automaticamente. Slash commands precisam ser invocados explicitamente.

---

## Layer 1: AIOS Agents (11)

**Tipo:** Personas completas | **Ativacao:** `@agent` ou `/AIOS:agents:agent`

| Agent | Persona | Use Para |
|-------|---------|----------|
| `@dev` | Dex | Implementacao, debugging, refactoring |
| `@qa` | Quinn | Testes, validacao, quality gates |
| `@architect` | Aria | Design de sistemas, decisoes tecnicas |
| `@data-engineer` | Dara | Database design, schema, migrations |
| `@po` | Pax | Stories, backlog, acceptance criteria |
| `@pm` | Morgan | Planning, sprints, recursos |
| `@sm` | River | Agile ceremonies, processo |
| `@analyst` | Alex | Requirements, research, analise |
| `@ux-design-expert` | Uma | UX/UI design, usabilidade |
| `@devops` | Gage | Git, CI/CD, releases (EXCLUSIVO) |
| `@aios-master` | — | Orchestration, framework development |

---

## Layer 2: Runtime Skills (4)

**Tipo:** Skills carregadas automaticamente | **Local:** `.aios/skills/`

| Skill | Descricao |
|-------|-----------|
| `superpowers/` | 8 sub-skills (TDD, brainstorming, code review, plans, etc.) |
| `design-system-extractor/` | Extracao de design tokens de websites |
| `criar-app-completo/` | Workflow completo de criacao de app |
| `prd-generator/` | Geracao de PRDs profissionais |

Estas skills sao distribuidas via `aios install` e funcionam automaticamente.

---

## Layer 3: Slash Commands (75)

**Tipo:** Knowledge packs on-demand | **Local:** `.claude/commands/AIOS/skills/`
**Ativacao:** `/AIOS:skills:nome` no Claude Code

Estes sao arquivos markdown com expertise especializada. Carregados sob demanda.

**Por Dominio:**
- **Workflows** — concise-planning, systematic-debugging, kaizen, git-pushing
- **Security** — ethical-hacking-methodology, security-auditor, top-web-vulnerabilities, burp-suite-testing, cloud-penetration-testing, linux-privilege-escalation, vulnerability-scanner
- **Architecture** — architecture-decision-records, event-sourcing-architect, cqrs-implementation, saga-orchestration, event-store-design, projection-patterns, monorepo-architect
- **Code Quality** — doc-rot, error-detective, code-refactoring-refactor-clean, error-handling-patterns, production-code-audit, lint-and-validate
- **Languages** — typescript-pro, python-pro, cpp-pro, elixir-pro, haskell-pro, julia-pro
- **Frontend** — angular, angular-state-management, nextjs-react-expert, tailwind-patterns, tailwind-design-system, radix-ui-design-system, scroll-experience, frontend-design, web-design-guidelines, mobile-design
- **3D/Games** — 3d-web-experience, game-development (11 sub-skills), godot-gdscript-patterns, unreal-engine-cpp-pro, minecraft-bukkit-pro
- **Blockchain** — blockchain-developer, defi-protocol-templates
- **Tools** — automate-whatsapp, notion-template-business, inngest, n8n-mcp-tools-expert, nestjs-expert, browser-extension-builder, mcp-builder
- **Business** — pricing-strategy, competitive-landscape, market-sizing-analysis, content-creator, copywriting
- **AI/Agents** — agent-orchestration-improve-agent, prompt-engineering, multi-agent-patterns
- **Design** — obsidian-app-filler, obsidian-tag-manager, video-media-content-downloader, progress-visualizer
- **Dev Patterns** — api-design-principles, database-design, documentation-templates, architect-first, app-builder (13 templates), avalonia-viewmodels-zafiro, nx-workspace-patterns, salesforce-development
- **Media** — video-downloader

**Referencia completa:** `.claude/commands/AIOS/skills/HIERARCHY.md`

---

## Quick Reference

| Preciso de... | Use... | Tipo |
|---------------|--------|------|
| Gestao de projeto | `@po`, `@pm`, `@sm` | Agent |
| Implementar codigo | `@dev` | Agent |
| Planning formal | `/AIOS:skills:concise-planning` | Slash Command |
| Debug complexo | `/AIOS:skills:systematic-debugging` | Slash Command |
| Security audit | `/AIOS:skills:ethical-hacking-methodology` | Slash Command |
| Limpar doc rot | `/doc-rot` | Slash Command |
| Criar app completo | `.aios/skills/criar-app-completo/` | Runtime Skill |
| Gerar PRD | `.aios/skills/prd-generator/` | Runtime Skill |
| Code review | `/AIOS:skills:kaizen` | Slash Command |

---

*AIOS Skills System v2.0*
*Last Updated: 2026-02-10*
