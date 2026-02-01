# AIOS Agent Foundation Refactor PRD

> **Product Requirements Document**
> **Version:** 1.0
> **Date:** 2026-02-01
> **Author:** Morgan (PM Agent)
> **Status:** Draft (Architect Reviewed)
> **Reviewed By:** Aria (Architect) - 2026-02-01
> **Priority:** P0 - Blocking ADE Implementation

---

## 1. Goals and Background Context

### 1.1 Goals

- **G1:** Eliminar conflitos de autoridade entre agentes (1 comando = 1 agente owner)
- **G2:** Garantir que 100% dos comandos documentados estejam implementados
- **G3:** Unificar formato YAML de todos os agentes
- **G4:** Criar sistema de validação automática de integridade
- **G5:** Estabelecer hierarquia clara de responsabilidades
- **G6:** Reduzir ambiguidade nas instruções de agentes para < 5%

### 1.2 Background Context

**Feedback de usuário (18 horas de uso):**
> "O AIOS precisa corrigir o AIOS. Se o AIOS não está nem produzindo ele mesmo sem BUG, não vai ter QA que faça nossos projetos serem bons!"

**Princípio KISS aplicado:** Antes de adicionar novas funcionalidades (ADE, Worktrees, Memory Layer), a **base de agentes deve funcionar corretamente**.

### 1.3 Audit Summary

Uma auditoria completa dos 12 arquivos de agentes revelou **22 problemas de obediência**:

| Categoria | Quantidade | Severidade |
|-----------|------------|------------|
| Conflitos de autoridade | 8 | CRITICAL |
| Comandos não implementados | 4 | CRITICAL |
| Formato inconsistente | 3 | HIGH |
| Instruções ambíguas | 6 | MEDIUM |
| Referências quebradas | 1 | LOW |

### 1.4 Why This Blocks ADE

O PRD do ADE (`docs/prd/aios-autonomous-development-engine.md`) assume que:
- Agentes executam comandos corretamente
- Handoffs entre agentes são determinísticos
- Tasks referenciadas existem e funcionam

**Se a base está quebrada, o ADE vai amplificar os problemas.**

### 1.5 Scope

**Este PRD cobre:**
- Refatoração dos 12 arquivos de agentes
- Consolidação de comandos duplicados
- Criação de validação automática
- Documentação de autoridade por comando

**Este PRD NÃO cobre:**
- Novas funcionalidades do ADE
- Dashboard ou UI
- Memory Layer

### 1.6 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-01 | 1.0 | PRD inicial baseado em auditoria de agentes | Morgan (PM) |
| 2026-02-01 | 1.1 | Incorporadas observações do review arquitetural | Morgan (PM) + Aria (Architect) |

---

## 2. Requirements

### 2.1 Functional Requirements

#### Command Authority Matrix

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR1 | Criar Command Authority Matrix com owner único por comando | P0 | 1 |
| FR2 | Remover comandos duplicados de agentes não-owners | P0 | 1 |
| FR3 | Documentar handoff explícito quando outro agente precisa executar | P0 | 1 |

#### Command Implementation

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR4 | Registrar `*create-suite` no qa.md | P0 | 2 |
| FR5 | Padronizar uso de greeting scripts (documentar arquitetura CLI wrapper) | P0 | 2 |
| FR6 | Implementar todos os comandos listados em aios-master.md | P0 | 2 |

#### Format Standardization

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR7 | Padronizar formato de commands (usar `- name:` em todos) | P0 | 3 |
| FR8 | Padronizar dependencies.tasks em todos os agentes | P0 | 3 |
| FR9 | Unificar IDE-FILE-RESOLUTION path pattern | P0 | 3 |

#### Validation System

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR10 | Criar script agent-validator.js | P1 | 4 |
| FR11 | Validar que todos os commands têm tasks correspondentes | P1 | 4 |
| FR12 | Validar que todas as tasks referenciadas existem | P1 | 4 |
| FR13 | CI check que bloqueia PRs com agentes inválidos | P1 | 4 |

#### Documentation

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR14 | Documentar visibility levels (full, quick, key) | P1 | 5 |
| FR15 | Criar Agent Authority Guide | P1 | 5 |
| FR16 | Atualizar CLAUDE.md com nova estrutura | P1 | 5 |

### 2.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | Zero breaking changes para comandos existentes que funcionam |
| NFR2 | Validação deve rodar em < 5 segundos |
| NFR3 | Todos os agentes devem passar validação antes de merge |
| NFR4 | Backward compatibility com squads existentes |

---

## 3. Problem Details

### 3.1 Critical Problem: Command Authority Conflicts

**Problema:** Múltiplos agentes definem os mesmos comandos.

```
*create-epic:
  - @pm (pm.md line 98)
  - @po (po.md line 117)

*create-story:
  - @pm (pm.md line 99)
  - @po (po.md line 119)
  - @sm (via *draft)

*correct-course:
  - @aios-master
  - @architect
  - @analyst
  - @po
  - @pm
  - @sm
```

**Impacto:** AI não sabe qual agente ativar. Comportamento não-determinístico.

**Solução Proposta:**

| Command | Owner | Rationale | Handoff From |
|---------|-------|-----------|--------------|
| `*create-epic` | @pm | PM owns product structure | - |
| `*create-story` | @sm | SM owns story creation | @pm delegates after epic |
| `*correct-course` | @aios-master | Master orchestrates corrections | Any agent can escalate |
| `*create-suite` | @qa | QA owns test suites | @dev requests after implementation |

### 3.2 Critical Problem: Undocumented Commands

**Problema:** Comandos existem na documentação mas não nos agentes.

| Command | Documented In | Missing In |
|---------|---------------|------------|
| `*create-suite` | aios-master.md:189 | qa.md |
| `*brainstorm` | aios-master.md:177 | analyst.md (existe mas formato diferente) |

### 3.3 High Problem: Inconsistent YAML Format

**Problema:** Agentes usam formatos diferentes para commands.

**Formato A (9 agentes):**
```yaml
commands:
  - name: help
    visibility: [full, quick, key]
    description: 'Show all commands'
```

**Formato B (3 agentes - qa, data-engineer, ux-design-expert):**
```yaml
commands:
  - help: Show all commands
  - 'code-review {scope}': 'Run automated review'
```

**Impacto:** Parsers não conseguem extrair comandos consistentemente.

### 3.4 High Problem: Greeting Script Divergence

**Problema:** Dois scripts diferentes para greeting.

| Script | Agentes |
|--------|---------|
| `greeting-builder.js` | 9 agentes (dev, qa, architect, pm, po, sm, analyst, aios-master, squad-creator) |
| `generate-greeting.js` | 3 agentes (devops, data-engineer, ux-design-expert) |

**Impacto:** Comportamento inconsistente ao alternar agentes.

### 3.5 Medium Problem: Ambiguous Instructions

**Problema:** Instruções vagas permitem interpretações múltiplas.

```yaml
REQUEST-RESOLUTION: Match user requests to your commands/dependencies flexibly
```

**"Flexibly" não define:**
- Qual threshold de matching?
- Prioridade entre comandos similares?
- Quando pedir clarificação?

---

## 4. Epic Structure

| # | Epic | Stories | Priority | Estimation |
|---|------|---------|----------|------------|
| 1 | **Command Authority** | 4 | P0 | 3-4 dias |
| 2 | **Command Implementation** | 3 | P0 | 2-3 dias |
| 3 | **Format Standardization** | 4 | P0 | 3-4 dias |
| 4 | **Validation System** | 4 | P1 | 3-4 dias |
| 5 | **Documentation** | 3 | P1 | 2 dias |

**Total: 18 Stories | 13-17 dias**

### Execution Order

```
Epic 1 (Authority) ──► Epic 2 (Implementation) ──► Epic 3 (Format)
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
                              Epic 4 (Validation)                     Epic 5 (Docs)
```

---

## 5. Epic Details

### Epic 1: Command Authority Consolidation

**Goal:** Eliminar conflitos de autoridade estabelecendo owner único por comando.

#### Story 1.1: Create Command Authority Matrix

**As a** framework maintainer,
**I want** a definitive matrix of command ownership,
**so that** there's no ambiguity about which agent handles what.

**Acceptance Criteria:**
1. `docs/architecture/command-authority-matrix.md` criado
2. Todos os 50+ comandos listados com owner único
3. Handoff rules documentadas (quando delegar)
4. Reviewed por @architect
5. Linked em CLAUDE.md

#### Story 1.2: Remove Duplicate Commands from PO

**As a** developer,
**I want** @po to not have `*create-epic` and `*create-story`,
**so that** these commands are handled only by their owners.

**Acceptance Criteria:**
1. Remover `create-epic` de po.md
2. Remover `create-story` de po.md
3. Adicionar handoff instruction: "For epic/story creation, delegate to @pm/@sm"
4. Atualizar po.md Quick Commands section
5. Testes de regressão passam

#### Story 1.3: Consolidate correct-course Ownership

**As a** developer,
**I want** `*correct-course` owned only by @aios-master,
**so that** course corrections are centralized.

**Acceptance Criteria:**
1. Manter `*correct-course` apenas em aios-master.md
2. Remover de: architect.md, analyst.md, po.md, pm.md, sm.md
3. Adicionar handoff: "For course corrections, escalate to @aios-master"
4. Atualizar 6 agent files

#### Story 1.4: Document Handoff Protocol

**As a** agent,
**I want** clear handoff rules,
**so that** I know when to delegate to another agent.

**Acceptance Criteria:**
1. Seção "Handoff Protocol" em cada agent
2. Format: `For {task} → Delegate to @{agent} using {command}`
3. Bidirecional: quem delega e quem recebe
4. Exemplos concretos

---

### Epic 2: Command Implementation

**Goal:** Garantir que todos os comandos documentados estejam implementados.

#### Story 2.1: Register *create-suite in QA

**As a** QA agent,
**I want** `*create-suite` command registered,
**so that** I can create test suites as documented.

**Acceptance Criteria:**
1. Adicionar em qa.md commands section:
```yaml
- name: create-suite
  visibility: [full]
  description: 'Create test suite for story'
```
2. Adicionar em dependencies.tasks: `create-suite.md`
3. Verificar que task existe
4. Testar comando funciona

#### Story 2.2: Standardize Greeting Script Usage

**As a** framework maintainer,
**I want** all agents using consistent greeting invocation,
**so that** behavior is predictable and maintainable.

**Acceptance Criteria:**

> **[Architect Review - Pre-requisite Investigation]:**
> Antes de unificar cegamente, investigar por que existem dois scripts.

0. **[BLOCKER - RESOLVED] Investigar diferenças entre scripts:**
   - ✅ Comparar `greeting-builder.js` vs `generate-greeting.js`
   - ✅ Documentar funcionalidades únicas de cada um
   - ✅ Determinar se `generate-greeting.js` foi criado intencionalmente

   **Resultado da Investigação (2026-02-01):**

   | Script | Linhas | Propósito |
   |--------|--------|-----------|
   | `greeting-builder.js` | 938 | Core class `GreetingBuilder` com toda lógica de greeting |
   | `generate-greeting.js` | 160 | CLI orchestrator que USA greeting-builder.js |

   **Arquitetura descoberta:**
   ```
   generate-greeting.js (CLI wrapper)
          ↓
   Carrega: config → agent → session → project status
          ↓
   GreetingBuilder.buildGreeting(unified context)
   ```

   **Conclusão:** `generate-greeting.js` é **INTENCIONAL** - é um CLI wrapper que orquestra o carregamento de contexto antes de chamar `GreetingBuilder`. NÃO deve ser removido.

   **Nova abordagem:** Padronizar instruções STEP 3 para usar abordagem consistente (ou CLI ou direta, mas documentar ambas como válidas).

1. Documentar arquitetura de greeting scripts em `docs/architecture/greeting-system.md`
2. Padronizar STEP 3 em devops.md para clareza (mantendo generate-greeting.js)
3. Padronizar STEP 3 em data-engineer.md para clareza
4. Padronizar STEP 3 em ux-design-expert.md para clareza
5. Validar que ambas abordagens produzem greetings consistentes
6. Adicionar comentários de documentação em ambos scripts explicando relação

#### Story 2.3: Audit All aios-master Commands

**As a** framework maintainer,
**I want** all aios-master quick commands working,
**so that** users can trust documentation.

**Acceptance Criteria:**
1. Lista todos os comandos em aios-master.md Quick Commands
2. Para cada comando, verifica que agent tem comando registrado
3. Para cada comando, verifica que task existe
4. Documenta gaps encontrados
5. Implementa missing commands

**Audit Results (2026-02-01):**

| Métrica | Valor |
|---------|-------|
| Comandos definidos | 27 |
| Tasks referenciados | 23 |
| Tasks existentes | ✅ 23/23 (100%) |
| Total tasks disponíveis | 179 |

**Findings:**

1. **Todos os 23 tasks referenciados existem** - Nenhum arquivo faltando
2. **Comandos internos não precisam de tasks:** help, kb, status, guide, yolo, exit, list-components, test-memory, task, workflow, plan, doc-out, chat-mode, agent, validate-component
3. **Comandos delegados documentados corretamente** (linhas 232-237):
   - Epic/Story creation → @pm
   - Brainstorming → @analyst
   - Test suites → @qa
   - AI prompts → @architect

**Gaps identificados (não bloqueantes para v1.0):**

- Apenas 23 de 179 tasks estão no dependencies.tasks
- Missing: spec-*.md, build-*.md, orchestrate-*.md workflows

**Conclusão:** PASS - Dependencies estão íntegras. Gaps são melhorias futuras.

---

### Epic 3: Format Standardization

**Goal:** Padronizar formato YAML de todos os agentes.

#### Story 3.1: Standardize Commands Format

**As a** parser/tool,
**I want** consistent command format,
**so that** I can reliably extract commands.

**Acceptance Criteria:**
1. Converter qa.md para formato `- name:`
2. Converter data-engineer.md para formato `- name:`
3. Converter ux-design-expert.md para formato `- name:`
4. Validar schema em todos os 12 agentes
5. Criar JSON Schema para commands section

#### Story 3.2: Standardize Dependencies Format

**As a** parser/tool,
**I want** consistent dependencies format,
**so that** I can reliably resolve references.

**Acceptance Criteria:**
1. Todos agentes têm dependencies.tasks como array
2. Todos agentes têm dependencies.templates como array
3. Todos agentes têm dependencies.checklists como array
4. Format: `- filename.md` (sem path prefix)
5. Validar todas as referências existem

#### Story 3.3: Fix IDE-FILE-RESOLUTION Path

**As a** developer,
**I want** correct path resolution,
**so that** dependencies are found.

**Acceptance Criteria:**
1. Corrigir ux-design-expert.md: `aios-core/` → `.aios-core/development/`
2. Validar todos os 12 agentes têm mesmo pattern
3. Testar resolução de path funciona

#### Story 3.4: Define REQUEST-RESOLUTION Algorithm

> **Added from Architect Review:** A instrução "match flexibly" é ambígua e permite interpretações múltiplas.

**As a** agent,
**I want** a deterministic algorithm for matching user requests,
**so that** my behavior is predictable.

**Acceptance Criteria:**
1. Documentar algoritmo de matching em `docs/architecture/request-resolution-algorithm.md`:
   - **Exact match:** Comando exato (e.g., `*create-story`) → 100% confidence
   - **Keyword match:** Palavras-chave no request (e.g., "criar história") → 80% confidence
   - **Semantic match:** Intenção similar (e.g., "preciso de uma story") → 60% confidence
2. Definir threshold mínimo para execução automática: **80%**
3. Abaixo de 80%: Pedir clarificação ao usuário
4. Definir prioridade quando múltiplos matches:
   - Preferir comando mais específico
   - Preferir comando do agente atual
   - Em caso de empate: listar opções
5. Atualizar REQUEST-RESOLUTION em todos os 12 agentes com referência ao algoritmo
6. Adicionar exemplos concretos de matching

---

### Epic 4: Validation System

**Goal:** Criar validação automática que previne regressões.

#### Story 4.1: Create Agent Schema

**As a** framework maintainer,
**I want** a JSON Schema for agent files,
**so that** structure is enforced.

**Acceptance Criteria:**
1. `schemas/agent-v3-schema.json` criado
2. Define required fields: agent, persona, commands, dependencies
3. Define command structure com `name`, `description`, `visibility`
4. Schema validation library escolhida (ajv)

#### Story 4.2: Create agent-validator.js

**As a** framework maintainer,
**I want** a validation script,
**so that** I can check agent integrity.

**Acceptance Criteria:**
1. `.aios-core/scripts/agent-validator.js` criado
2. Valida schema compliance
3. Valida que tasks referenciadas existem
4. Valida que templates referenciados existem
5. Valida que não há comandos duplicados cross-agents
6. Output: JSON report com errors/warnings
7. **[Architect Review]** Validar handoff bidirectionality:
   - Se agente A delega para B, verificar que B tem o comando
   - Se agente B recebe de A, verificar que A documenta o handoff
8. **[Architect Review]** Detectar circular delegation patterns:
   - A → B → C → A = ERRO
   - Gerar grafo de delegações para visualização

#### Story 4.3: Create Task Reference Validator

**As a** framework maintainer,
**I want** to validate task references,
**so that** broken references are caught.

**Acceptance Criteria:**
1. Para cada agent, extrai dependencies.tasks
2. Verifica que cada task existe em `.aios-core/development/tasks/`
3. Lista tasks órfãs (existem mas não referenciadas)
4. Lista tasks faltantes (referenciadas mas não existem)

#### Story 4.4: Add CI Validation

**As a** framework maintainer,
**I want** CI to block invalid agents,
**so that** quality is enforced.

**Acceptance Criteria:**
1. GitHub Action que roda agent-validator.js
2. Falha PR se qualquer agent inválido
3. Report de erros claro
4. Roda em < 30 segundos

---

### Epic 5: Documentation

**Goal:** Documentar claramente a estrutura e regras.

#### Story 5.1: Document Visibility Levels

**As a** agent developer,
**I want** visibility levels documented,
**so that** I know when to show each command.

**Acceptance Criteria:**
1. Seção em `docs/guides/agent-development-guide.md`
2. Define:
   - `full`: All commands, shown in *help
   - `quick`: Essential commands, shown in Quick Commands section
   - `key`: Critical commands, always highlighted
3. Examples de cada level

#### Story 5.2: Create Agent Authority Guide

**As a** user,
**I want** to know which agent handles what,
**so that** I use the right agent.

**Acceptance Criteria:**
1. `docs/guides/agent-authority-guide.md` criado
2. Table: Task → Agent → Command
3. Decision tree para escolher agente
4. Common mistakes section
5. Linked em README

#### Story 5.3: Update CLAUDE.md

**As a** Claude Code user,
**I want** CLAUDE.md reflecting new structure,
**so that** Claude follows correct patterns.

**Acceptance Criteria:**
1. Atualizar Agent System section
2. Adicionar Command Authority Matrix reference
3. Adicionar Handoff Protocol section
4. Remove outdated instructions

---

## 6. Command Authority Matrix (Draft)

### Creation Commands

| Command | Owner | Can Delegate To | Notes |
|---------|-------|-----------------|-------|
| `*create-prd` | @pm | - | Greenfield PRDs |
| `*create-brownfield-prd` | @pm | - | Brownfield PRDs |
| `*create-epic` | @pm | - | Epic structure |
| `*create-story` | @sm | - | Story creation |
| `*create-suite` | @qa | - | Test suites |
| `*create-doc` | @pm | @analyst (research) | Generic docs |

### Analysis Commands

| Command | Owner | Can Delegate To | Notes |
|---------|-------|-----------------|-------|
| `*brainstorm` | @analyst | - | Ideation |
| `*research` | @analyst | - | Deep research |
| `*correct-course` | @aios-master | - | Process corrections |
| `*assess-complexity` | @architect | - | Complexity assessment |

### Development Commands

| Command | Owner | Can Delegate To | Notes |
|---------|-------|-----------------|-------|
| `*develop` | @dev | - | Story implementation |
| `*fix-qa-issues` | @dev | - | Fix QA findings |
| `*review-build` | @qa | - | QA review |

### Infrastructure Commands

| Command | Owner | Can Delegate To | Notes |
|---------|-------|-----------------|-------|
| `*push` | @devops | - | Git push (exclusive) |
| `*create-worktree` | @devops | - | Worktree management |

---

## 7. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Commands with single owner | ~60% | 100% |
| Commands documented & implemented | ~85% | 100% |
| Agents passing schema validation | Unknown | 100% |
| Agent format consistency | ~75% | 100% |
| Greeting script consistency | 75% | 100% |

---

## 8. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing workflows | Medium | High | Extensive testing, gradual rollout |
| User confusion during transition | Medium | Medium | Clear migration guide, deprecation warnings |
| Missing edge cases in authority matrix | Low | Medium | Review by all stakeholders |
| CI validation too strict | Low | Low | Allow warnings vs errors |

---

## 9. Dependencies

### Blocking

- **None** - This is foundational work

### Blocked By This

- `docs/prd/aios-autonomous-development-engine.md` - ADE requires stable agent base
- Dashboard agent interactions
- Any new agent development

---

## 10. Next Steps

### For Architect (@architect)

```
Review this PRD and validate:
1. Command Authority Matrix is complete
2. No architectural conflicts with ADE PRD
3. Validation approach is sound
```

### For DevOps (@devops)

```
After PRD approval, start Epic 1:
1. Create command-authority-matrix.md
2. Begin agent file modifications
3. Set up CI validation
```

### For QA (@qa)

```
Prepare test plan:
1. List all commands to test
2. Create regression test suite
3. Document expected behaviors
```

---

## 11. Appendix

### A. Files to Modify

| File | Changes |
|------|---------|
| `.aios-core/development/agents/pm.md` | Keep create-epic/story |
| `.aios-core/development/agents/po.md` | Remove create-epic/story, add handoff |
| `.aios-core/development/agents/sm.md` | Keep create-story via *draft |
| `.aios-core/development/agents/qa.md` | Add create-suite, standardize format |
| `.aios-core/development/agents/devops.md` | Fix greeting script |
| `.aios-core/development/agents/data-engineer.md` | Fix greeting script, format |
| `.aios-core/development/agents/ux-design-expert.md` | Fix greeting, path, format |
| `.aios-core/development/agents/architect.md` | Remove correct-course |
| `.aios-core/development/agents/analyst.md` | Remove correct-course |
| `.aios-core/development/agents/aios-master.md` | Keep as authority source |
| `.aios-core/development/agents/dev.md` | Verify commands |
| `.aios-core/development/agents/squad-creator.md` | Verify format |

### B. Audit Evidence

Full audit report available at: Investigation session 2026-02-01

Key findings:
- 22 problems identified across 5 categories
- 8 command authority conflicts
- 4 undocumented commands
- 3 format inconsistencies

### C. Reference: Current Command Counts

| Agent | Commands Defined |
|-------|------------------|
| aios-master | 15 |
| pm | 12 |
| po | 14 |
| sm | 11 |
| dev | 13 |
| qa | 10 |
| architect | 12 |
| analyst | 10 |
| devops | 8 |
| data-engineer | 6 |
| ux-design-expert | 7 |
| squad-creator | 5 |

---

## 12. Architect Review Summary

> **Reviewer:** Aria (Architect)
> **Date:** 2026-02-01
> **Status:** APPROVED com observações incorporadas

### Changes from Review

| Item | Section | Change |
|------|---------|--------|
| Story 3.4 | Epic 3 | **ADDED** - REQUEST-RESOLUTION Algorithm |
| Story 4.2 AC 7-8 | Epic 4 | **EXPANDED** - Handoff validation |
| Story 2.2 AC 0 | Epic 2 | **ADDED** - Greeting script investigation |
| Command Authority Matrix | Section 3.1 | **EXPANDED** - Handoff From column |

### Architectural Validation

| ADE Requirement | Coverage | Status |
|-----------------|----------|--------|
| FR1: Agent loading flow | Story 2.2 | ✅ |
| FR33-37: Agent commands | Epic 1 | ✅ |
| Handoff entre agentes | Story 1.4, 4.2 | ✅ |
| Tasks referenciadas | Story 4.3 | ✅ |

### Conditions for Approval

- [x] Story 3.4 adicionada (REQUEST-RESOLUTION)
- [x] Story 4.2 expandida (handoff validation)
- [x] Story 2.2 inclui investigação prévia (RESOLVED: generate-greeting.js é CLI wrapper intencional)

### Risk Assessment

| Risk | Mitigation Added |
|------|------------------|
| Breaking workflows | NFR1 + Documentation in Story 2.2 |
| Greeting architecture misunderstanding | Investigation step (AC 0) RESOLVED - CLI wrapper is intentional |
| Missing handoff cases | Bidirectional validation in Story 4.2 |

---

*PRD gerado por Morgan (PM Agent) - AIOS Framework*
*Reviewed por Aria (Architect Agent) - 2026-02-01*
*Baseado em: Agent Obedience Audit (2026-02-01)*
*Status: APPROVED - Ready for implementation*
*Priority: BLOCKING - Must complete before ADE implementation*
