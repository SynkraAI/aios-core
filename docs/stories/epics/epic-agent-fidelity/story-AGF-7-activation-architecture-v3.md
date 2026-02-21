# Story AGF-7: Activation Architecture v3 — Deep Investigation + ADR

**Epic:** Agent Fidelity (AGF) — Ensuring consistent agent behavior across all invocation modes
**Story ID:** AGF-7
**Priority:** High
**Points:** 13
**Effort:** 14 hours (8h Phase 1 + 4h Phase 2 + 2h Roundtable)
**Status:** Ready for Review
**Type:** Investigation / ADR
**Lead:** @analyst (Alex) + @architect (Aria)
**Roundtable:** Pedro Valério, Alan Nicolas, Brad Frost, Mitchell Hashimoto
**Quality Gate:** @qa (Quinn)
**PO Validation:** @po (Pax)
**Depends On:** AGF-6 (Done — UAP deprecated, SYNAPSE-Lite operational, CLAUDE.md < 200 lines)
**Repository:** aios-core (branch: pedro-aios)
**ADR Input:** `docs/architecture/adr/ADR-AGF-3-OPTIMAL-AGENT-ACTIVATION-ARCHITECTURE.md`
**ADR Output:** `docs/architecture/adr/ADR-AGF-7-ACTIVATION-ARCHITECTURE-V3.md`

## Executor Assignment

```yaml
executor: "@analyst + @architect"
quality_gate: "@qa"
roundtable: [Pedro Valério, Alan Nicolas, Brad Frost, Mitchell Hashimoto]
adr_decisions: [D-AGF7-1 through D-AGF7-N]
```

---

## User Story

**Como** framework AIOS,
**Quero** investigar em profundidade as 5 lacunas identificadas pela auditoria QA pos-AGF-6 (Activation Report perdido, 3 cópias de cada agente, skills como ativadores de agentes, Bracket Inversion não implementado, sem schema validation), comparar com BMAD-METHOD e outros frameworks de referência, e produzir um ADR com decisões de arquitetura consensuadas em roundtable,
**Para** que a Activation Architecture v3 seja fundamentada em evidências concretas — eliminando divergências, reduzindo cópias de arquivos, e restaurando funcionalidades que regrediram — antes de qualquer implementação no AGF-8+.

---

## Background

### Os 5 Gaps Identificados Pela Auditoria QA (Pos-AGF-6)

| Gap | ADR Decision | Status AGF-6 | Impacto |
|-----|-------------|--------------|---------|
| G1 | D4 — Activation Report | Não implementado — greeting não mostra branch/story/status | Alto — regressão do UAP |
| G2 | D7 — Single Source of Truth | 3 cópias por agente (commands/, skills/, agents/) podem divergir | Alto — manutenção difícil |
| G3 | D8 — Skills como ativadores | Skills que ativam agentes ainda existem (viola "skills = tasks only") | Médio — confusão conceitual |
| G4 | D12 — Bracket Inversion | Não implementado — contexto não reduz progressivamente por prompt count | Médio — eficiência de contexto |
| G5 | N/A — Schema Validation | Nenhuma validação de schema para definições de agente | Médio — silently broken agents |

### Comparação BMAD-METHOD vs AIOS (Resultado da Sessão QA AGF-6)

| Dimensão | BMAD-METHOD | AIOS Atual | Gap |
|----------|-------------|-----------|-----|
| Ativação | Compilação YAML → .md | 3 arquivos manuais | Alto |
| Determinismo | XML + activation script | Frontmatter + hooks | Médio |
| Context Loading | Lazy (carrega apenas o necessário) | Eager (carrega tudo) | Médio |
| Schema Validation | sim (pré-compilação) | Não | Alto |
| Activation Report | Integrado no compiled output | Perdido (regressão) | Alto |

### Relação Com Trabalho Anterior

- **AGF-3:** Roundtable original que gerou ADR-AGF-3 com D1–D12
- **AGF-4:** Implementou foundation (DNA/Enhancement split, 4 hooks, rules authority)
- **AGF-5:** Implementou SYNAPSE-Lite (UserPromptSubmit + Stop hooks)
- **AGF-6:** Consolidação (UAP deprecated, CLAUDE.md < 200 linhas, cross-IDE validation)
- **AGF-7 (esta):** Investigação dos gaps + novo ADR para v3
- **AGF-8+:** Implementação das decisões do ADR-AGF-7

---

## Scope

### IN Scope

1. **Pesquisar todos os repositórios listados** — 7 externos + 5 internos
2. **Mapear mecanismos nativos** de Claude Code, Codex, Gemini, Cursor via /tech-search
3. **Decidir sobre 2-mode activation** — Command interativo + Agent autônomo (eliminar skill-as-agent)
4. **Projetar Activation Report v2** — Restaurar D4 sem overhead do UAP
5. **Projetar consolidação de arquivo de agente** — 1 fonte de verdade → N targets
6. **Decidir estratégia de memória/contexto** — Eager vs Lazy vs Hybrid loading
7. **Executar Roundtable** com 4 mentes
8. **Produzir ADR-AGF-7** com decisões consensuadas

### OUT of Scope

- Implementação de qualquer decisão (isso é AGF-8+)
- Modificar qualquer arquivo de código ou agente existente
- Benchmarking de performance
- Features Pro/enterprise
- Mudanças no pipeline de CI/CD

---

## Acceptance Criteria

### AC1: Phase 1 — Investigação Completa (~8h)

**Repositórios externos pesquisados:**

- [x] **claude-flow** (`https://github.com/ruvnet/claude-flow`) — Rating A: Swarm orchestration, 3-tier routing, hook signals, memory-first
- [x] **aios-stage AST** (`https://github.com/oalanicolas/aios-stage/tree/master/.aios/ast`) — Rating A: Declarative lazyLoading config, devLoadAlwaysFiles tiers
- [x] **CARL** (`https://github.com/automl/CARL`) — Rating C: Irrelevante (RL environments, não LLM agents)
- [x] **claude-mem** (`https://github.com/thedotmack/claude-mem`) — Rating A: Progressive disclosure 3-layer (~10x token savings)
- [x] **memU** (`https://github.com/NevaMind-AI/memU`) — Rating B: Proactive pre-fetching, memory-as-filesystem
- [x] **OpenMemory** (`https://github.com/CaviraOSS/OpenMemory`) — Rating B: Explainable traces (waypoint graph), composite scoring
- [x] **BMAD-METHOD** (`https://github.com/bmad-code-org/BMAD-METHOD`) — Rating A: YAML→compiled MD, AgentAnalyzer, ActivationBuilder

**Fontes internas pesquisadas:**

- [x] **SYNAPSE engine completo** (repositório `aios-core` — `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core`) — 25+ capabilities mapeadas: 10 lost, 10 simplified, 3 new
- [x] **Dependency graph epic** (`docs/stories/epics/epic-nogic-code-intelligence/`) — 5 oportunidades de integração identificadas (dynamic context, AST authority, token-aware brackets)
- [x] **ADR-AGF-3** (`docs/architecture/adr/ADR-AGF-3-OPTIMAL-AGENT-ACTIVATION-ARCHITECTURE.md`) — 5/12 fully, 5/12 partial, 2/12 not implemented; all 12 still relevant
- [x] **Hooks atuais** (`.claude/hooks/` — 15 arquivos de AGF-4/5) — 4 active + 6 governance (possibly inactive) + 1 deprecated mapped
- [x] **Agent files** (`.claude/agents/*.md`, `.claude/commands/AIOS/agents/*.md`, `.claude/skills/{id}/SKILL.md`) — 0% body divergence across 3 copies; only frontmatter differs

**Perguntas de investigação respondidas:**

- [x] Qual é a arquitetura ótima para 2 modos apenas (Command interativo + Agent autônomo)?
- [x] Deve-se adotar a abordagem de compilação do BMAD (YAML source → compiled .md)?
- [x] Como restaurar o Activation Report sem overhead do UAP?
- [x] Quais padrões de memory/context de claude-flow, claude-mem, memU, OpenMemory melhoram o carregamento de contexto de agente?
- [x] Como AST/dependency graph informa o carregamento de contexto (carregar apenas arquivos relevantes por domínio)?
- [x] Os hooks SYNAPSE-Lite devem evoluir ou ser substituídos?

**Entregável:** Documento de relatório de investigação em `docs/research/2026-02-20-activation-architecture-v3/`

### AC2: Phase 2 — Tech Search & Query Analysis (~4h)

- [x] Claude Code: 9 mecanismos mapeados (agents, skills, commands, hooks, rules, memory, frontmatter, settings, CLAUDE.md)
- [x] Codex CLI: 8 mecanismos mapeados (AGENTS.md, override, skills, config, slash commands, multi-agent, session, fallback)
- [x] Gemini CLI: 8 mecanismos mapeados (GEMINI.md, @file imports, /memory, skills, extensions, MCP, settings, .geminiignore)
- [x] Cursor: 10 mecanismos mapeados (.mdc rules, hooks.json, agents/, AGENTS.md, notepads, background agents, subagents, @Docs, user/team rules)
- [x] Outros IDEs/CLIs: Cobertos como extensões dos 4 principais
- [x] Matriz "Build vs Leverage" produzida — 15 mecanismos classificados
- [x] Lista de 16 queries para `/tech-search` documentada

**Entregável:** Documento de tech search matrix em `docs/research/2026-02-20-activation-architecture-v3/tech-search-matrix.md`

### AC3: Decisões de Arquitetura Tomadas

- [x] 2-mode activation definido (Command interativo + Agent autônomo) — D-AGF7-4: Command (/aios-{agent}) + Agent (@{agent}), skills = tasks only
- [x] Skill-as-agent-activator eliminado — D-AGF7-4: 10 agent-as-skill files deprecated, replaced by compiler output
- [x] Activation Report v2 desenhado — D-AGF7-3: session-start.sh + SubagentStart hook, ~20 LOC bash base + optional Node.js rich
- [x] Consolidação de arquivo de agente decidida — D-AGF7-1: single YAML source compiled to N targets (agents/, commands/, skills/, .agents/skills/)
- [x] Estratégia de memory/context loading decidida — D-AGF7-2: 3-tier progressive disclosure (DNA 200t / Enhancement 500t / Memory 1000t+)
- [x] Bracket Inversion (D12) — D-AGF7-5: FRESH 200t → MODERATE 400t → DEPLETED 800t → CRITICAL 1400t, agent-switch resets bracket
- [x] Schema validation — D-AGF7-6: validate at compilation time (ide-sync validate), JSON Schema, CI gate

### AC4: Roundtable Executado

- [x] Pedro Valério participou — process absolutism, validação determinística
- [x] Alan Nicolas participou — Voice DNA, AI architecture, design do SYNAPSE
- [x] Brad Frost participou — Atomic Design, progressive enhancement, component status
- [x] Mitchell Hashimoto participou — IaC, Plan/Apply, gerenciamento de estado declarativo
- [x] ADR-AGF-7 produzido com 7 decisões consensuadas (D-AGF7-1 through D-AGF7-7)
- [x] Roadmap de implementação para AGF-8+ definido (Phase 1: Foundation, Phase 2: Context Intelligence, Phase 3: Portability)

### AC5: Documentação Produzida

- [x] `docs/research/2026-02-20-activation-architecture-v3/investigation-report.md` — relatório de investigação Phase 1
- [x] `docs/research/2026-02-20-activation-architecture-v3/tech-search-matrix.md` — matriz de mecanismos nativos Phase 2
- [x] `docs/architecture/adr/ADR-AGF-7-ACTIVATION-ARCHITECTURE-V3.md` — ADR final com 7 decisões do roundtable
- [x] `docs/research/2026-02-20-agf7-tech-search/` — /tech-search output (bonus: 4 files, 20+ sources)

---

## Implementation Plan

### Phase 1: Deep Investigation (~8h)

#### 1.1 — Triage Rápido dos Repositórios Externos (1h)

Para cada um dos 7 repositórios externos:
1. Clonar ou ler o README
2. Identificar os 3–5 conceitos mais relevantes para AIOS
3. Marcar como: **A (altamente relevante)**, **B (moderadamente relevante)**, **C (irrelevante)**
4. Prosseguir com deep dive apenas para A e B

**Critérios de relevância:**
- Como o repo lida com agent activation?
- Como lida com context loading (eager vs lazy)?
- Como lida com múltiplas cópias de arquivos?
- Tem mecanismo de Activation Report?

#### 1.2 — Deep Dive nos Repositórios A/B (3h)

Para cada repo marcado como A ou B:
- Documentar o mecanismo central de ativação
- Extrair padrões reutilizáveis para AIOS
- Anotar o que NÃO se aplica e por quê

#### 1.3 — Auditoria das Fontes Internas (2h)

**ADR-AGF-3:** Ler todas as decisões D1–D12. Para cada uma:
- Implementada em AGF-4/5/6? Sim/Parcial/Não
- Se Não: é ainda relevante ou substituída?

**Hooks atuais (`.claude/hooks/`):**
Mapear os 15 arquivos em uma tabela:
```
Hook | Tipo | Trigger | O que faz | Gap vs ADR-AGF-3
```

**Agent files (3 cópias):**
Fazer diff entre `.claude/agents/{id}.md`, `.claude/commands/AIOS/agents/{id}.md`, `.claude/skills/{id}/SKILL.md` para pelo menos 3 agentes. Quantificar divergência.

**SYNAPSE engine completo (aios-core):**
Ler o engine 8-camadas. Documentar: o que o UAP fazia que não é feito pelos 4 hooks atuais?

#### 1.4 — Síntese e Relatório de Investigação (2h)

Produzir `docs/research/2026-02-20-activation-architecture-v3/investigation-report.md` com:

1. **Resumo executivo** — 3 parágrafos com os achados mais importantes
2. **Matriz de comparação** — AIOS vs BMAD vs claude-flow vs mecanismos nativos
3. **O que vale preservar** — do SYNAPSE engine, do UAP, dos hooks atuais
4. **Oportunidades identificadas** — do AST/dependency graph, dos repositórios externos
5. **Perguntas abertas** — para o roundtable resolver

### Phase 2: Tech Search & Query Analysis (~4h)

#### 2.1 — Mapeamento de Mecanismos Nativos (2h)

Para cada IDE/CLI, criar uma seção com:
- Nome do mecanismo
- Como funciona (1–2 frases)
- Limitações conhecidas
- "Build vs Leverage" — estamos reinventando ou devemos usar nativamente?

**IDEs/CLIs a mapear:**
- Claude Code (agents/, skills/, commands/, hooks/, rules/, memory/, frontmatter)
- Codex CLI
- Gemini CLI
- Cursor

#### 2.2 — Queries para /tech-search (1h)

Documentar lista de queries específicas para `/tech-search`:
- O que perguntar sobre cada mecanismo nativo
- Como validar se o mecanismo funciona como documentado
- Lacunas de documentação a confirmar

#### 2.3 — Tech Search Matrix (1h)

Produzir `docs/research/2026-02-20-activation-architecture-v3/tech-search-matrix.md`:

| Mecanismo | IDE/CLI | Funciona Para | Limitação | Build ou Leverage |
|----------|---------|--------------|-----------|------------------|
| agents/ | Claude Code | Agent personas | Não persiste entre sessões | Leverage |
| skills/ | Claude Code | Task execution | ... | ... |
| ... | ... | ... | ... | ... |

### Phase 3: Roundtable (~2h, após Phase 1+2)

#### Estrutura do Roundtable

**Facilitador:** @analyst (Alex)
**Arquiteto:** @architect (Aria)

**Agenda:**
1. Apresentação dos achados Phase 1+2 (30min)
2. Debate sobre 2-mode activation e consolidação de arquivos (30min)
3. Debate sobre Activation Report v2 e Bracket Inversion (30min)
4. Consenso e produção do ADR-AGF-7 (30min)

**Perfis dos participantes:**

| Participante | Perspectiva | Perguntas para eles |
|-------------|-------------|---------------------|
| Pedro Valério | Process absolutism, validação determinística | Como garantir que o estado do agente seja sempre válido e verificável? |
| Alan Nicolas | Voice DNA, AI architecture, design do SYNAPSE | O que do SYNAPSE original vale preservar? Como o Voice DNA deve influenciar a ativação? |
| Brad Frost | Atomic Design, progressive enhancement | Como aplicar progressive enhancement ao carregamento de contexto? Qual é o "atom" de um agente? |
| Mitchell Hashimoto | IaC, Plan/Apply, estado declarativo | Como aplicar Plan/Apply ao ciclo de vida do agente? Como o estado declarativo se aplica? |

#### Entregável do Roundtable

`docs/architecture/adr/ADR-AGF-7-ACTIVATION-ARCHITECTURE-V3.md` com:
- Contexto (os 5 gaps, os achados das fases 1 e 2)
- Decisões (D-AGF7-1 a D-AGF7-N) — formato idêntico ao ADR-AGF-3
- Consequências (o que cada decisão implica)
- Roadmap para AGF-8+ (quais decisões implementar primeiro)

---

## Risks

| Risk | Prob | Impact | Mitigation |
|------|------|--------|------------|
| Scope creep de muitas fontes — investigação nunca termina | Alto | Médio | Timebox rigoroso: 1h triage, 3h deep dive, 2h auditoria interna, 2h síntese |
| Paralisia analítica — muitas opções sem decisão | Médio | Alto | Roundtable força decisões; facilitador tem veto para encerrar debates |
| Repositórios externos irrelevantes — tempo perdido | Médio | Baixo | Triage rápido (1h) antes de deep dive; descartar C sem remorso |
| BMAD-METHOD compilation não se aplica ao AIOS | Baixo | Médio | Investigar como conceito, não como implementação — extrair padrão não código |
| ADR-AGF-7 conflita com ADR-AGF-3 | Médio | Alto | Tratar ADR-AGF-3 como input, não como restrição — algumas decisões podem ser revisadas |
| Phase 1+2 revelam que gaps são maiores que esperado | Baixo | Alto | Documentar claramente no ADR; dimensionar AGF-8+ com realismo |

---

## File List

### Arquivos a CRIAR

| # | Arquivo | Descrição |
|---|---------|-----------|
| C1 | `docs/research/2026-02-20-activation-architecture-v3/investigation-report.md` | Relatório Phase 1 — achados de todos os repositórios + fontes internas |
| C2 | `docs/research/2026-02-20-activation-architecture-v3/tech-search-matrix.md` | Matriz Phase 2 — mecanismos nativos por IDE/CLI |
| C3 | `docs/architecture/adr/ADR-AGF-7-ACTIVATION-ARCHITECTURE-V3.md` | ADR final — decisões do roundtable para v3 |

### Arquivos a NÃO MODIFICAR

Esta story é investigação pura. Nenhum arquivo de código, agente, hook, rule, ou configuração deve ser modificado. Qualquer modificação encontrada necessária é registrada como requisito para AGF-8+.

---

## Definition of Done

- [x] Todos os 7 repositórios externos triados; A/B com deep dive documentado
- [x] Todos os 5 fontes internas auditadas (ADR-AGF-3, hooks, agent files 3 cópias, SYNAPSE engine)
- [x] Relatório de investigação produzido em `docs/research/2026-02-20-activation-architecture-v3/investigation-report.md`
- [x] Mecanismos nativos mapeados para Claude Code, Codex, Gemini, Cursor
- [x] Tech search matrix produzida em `docs/research/2026-02-20-activation-architecture-v3/tech-search-matrix.md`
- [x] 7 questões arquiteturais respondidas (2-mode activation, compilação, Activation Report, memory/context, AST/deps, SYNAPSE-Lite evolução, schema validation)
- [x] Roundtable executado com todos os 4 participantes
- [x] ADR-AGF-7 produzido com decisões consensuadas em `docs/architecture/adr/ADR-AGF-7-ACTIVATION-ARCHITECTURE-V3.md`
- [x] Roadmap AGF-8+ definido no ADR (3 phases: Foundation, Context Intelligence, Portability)
- [x] Nenhum arquivo de código ou configuração modificado (esta story é investigation only)

---

## CodeRabbit Configuration

```yaml
reviews:
  path_instructions:
    - path: "docs/research/2026-02-20-activation-architecture-v3/investigation-report.md"
      instructions: "Verify all 7 external repos are researched. Verify all 5 internal sources are audited. Check that the 6 investigation questions are answered. Verify no implementation changes are included — this is investigation only."
    - path: "docs/research/2026-02-20-activation-architecture-v3/tech-search-matrix.md"
      instructions: "Verify Claude Code, Codex, Gemini, and Cursor mechanisms are all mapped. Check that 'Build vs Leverage' decision is documented for each mechanism. Verify /tech-search queries are listed."
    - path: "docs/architecture/adr/ADR-AGF-7-ACTIVATION-ARCHITECTURE-V3.md"
      instructions: "Verify ADR covers all 5 identified gaps (G1-G5). Check that all 4 roundtable participants are listed. Verify decisions cover 2-mode activation, skill consolidation, Activation Report v2, agent file consolidation, memory/context strategy, Bracket Inversion, and schema validation. Verify AGF-8+ roadmap is included."
    - path: "docs/stories/epics/epic-agent-fidelity/story-AGF-7-activation-architecture-v3.md"
      instructions: "Verify story follows AGF-6 format. Check all 5 acceptance criteria are present. Verify Investigation Only scope — no code changes in File List."
```

---

## Dev Agent Record

### Agent Model Used

*To be filled after execution*

### Completion Notes

*To be filled after execution*

### Debug Log References

*To be filled after execution*

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-20 | @po (Pax) | Story criada — 5 gaps pós-AGF-6 identificados, Phase 1+2 definidas, roundtable estruturado, ADR-AGF-7 como entregável |
| 2026-02-20 | @po (Pax) | Validação 10-point: 9.5/10 GO — corrigido effort 12h→14h (inclui 2h roundtable), path absoluto Windows→relativo |

---

*Story derivada de: Auditoria QA pós-AGF-6 + Comparação BMAD-METHOD*
*ADR Input: ADR-AGF-3 (D1-D12) | ADR Output: ADR-AGF-7*
*Epic: Agent Fidelity (AGF) — CLI First | Observability Second | UI Third*
