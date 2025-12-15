# Story 6.4: MCP-Task Integration Investigation

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Epic** | Infrastructure Modernization |
| **Story ID** | 6.4 |
| **Sprint** | 6 |
| **Priority** | 🔴 Critical |
| **Points** | 21 |
| **Effort** | 32 hours |
| **Status** | ⚪ Ready |
| **Type** | 🔬 Investigation + Implementation |
| **Primary Agent** | @dev (Dex) + @architect |
| **Blocked By** | Story 5.11 (Docker MCP) ✅ |
| **Blocks** | Future automation stories |

### TL;DR
Investigar e implementar integração sistemática dos **4 MCPs disponíveis** (playwright, desktop-commander, context7, exa) com as **120 tasks AIOS**, criando um sistema de execução de scripts e identificando MCPs faltantes.

---

## User Story

**Como** desenvolvedor AIOS,
**Quero** que as tasks utilizem automaticamente os MCPs disponíveis,
**Para** aumentar automação, reduzir tokens e habilitar workflows mais poderosos.

---

## Background

### Contexto Atual (Pós Story 5.11)

**MCPs Disponíveis (51 tools):**
| MCP | Tools | Uso Principal |
|-----|-------|---------------|
| **playwright** | 22 | Browser automation, UI testing, screenshots |
| **desktop-commander** | 26 | Filesystem, terminal, process execution |
| **context7** | 2 | Library documentation lookup |
| **exa** | 1 | Web search |

**Tasks AIOS (120 total):**
- 18 tasks de Database
- 11 tasks de QA/Testing
- 10 tasks de Dev/Build
- 6 tasks de GitHub/DevOps
- 8 tasks de Product Owner
- 67 outras tasks (docs, agents, analysis, etc.)

### Problemas Identificados

1. **Nenhuma task usa MCPs nativamente** - Dependências declaradas mas não executadas
2. **Execução manual** - Agentes executam comandos "à mão"
3. **MCPs subutilizados** - 51 tools disponíveis, uso ad-hoc apenas
4. **GAPs de MCPs** - github, postgres, supabase não disponíveis

---

## Objectives

### Primary Objectives

1. **Mapear 120 tasks → MCPs** - Identificar qual MCP cada task deve usar
2. **Criar Task Execution Layer** - Sistema que dispatch operações para MCPs
3. **Definir MCP Schema nas Tasks** - Formato YAML para declarar MCPs
4. **Identificar MCPs Faltantes** - Priorizar adições ao docker-gateway

### Secondary Objectives

1. **Code Mode Integration** - Tasks que podem usar scripts JavaScript (98.7% token savings)
2. **Performance Baseline** - Métricas antes/depois da integração
3. **Documentation Update** - Atualizar task template com MCP support

---

## Scope

### In Scope

- [ ] Análise detalhada das 120 tasks
- [ ] Mapeamento task → MCP tools
- [ ] Design do Task Execution Layer
- [ ] POC com 10 tasks prioritárias
- [ ] Documentação do novo sistema
- [ ] Atualização do task template

### Out of Scope

- Implementação completa de todas as 120 tasks (será feito em stories follow-up)
- Adição de novos MCPs (será story separada)
- Refatoração das tasks existentes (será incremental)

---

## Acceptance Criteria

### AC 6.4.1: Task-MCP Mapping Complete
- [ ] 120 tasks categorizadas por MCP usage
- [ ] Matriz de dependência task → MCP gerada
- [ ] GAPs de MCP documentados com prioridades

### AC 6.4.2: Task Execution Layer Designed
- [ ] Arquitetura documentada
- [ ] Interface de dispatch MCP definida
- [ ] Formato YAML de MCP declaration em tasks
- [ ] Error handling strategy

### AC 6.4.3: POC Implemented
- [ ] 10 tasks modificadas com MCP integration
- [ ] Testes de execução bem-sucedidos
- [ ] Métricas de token savings coletadas

### AC 6.4.4: Documentation Updated
- [ ] Task template atualizado
- [ ] MCP integration guide criado
- [ ] Examples para cada MCP type

---

## Tasks

### Phase 1: Deep Analysis (8h)

#### Task 1.1: Full Task Inventory Analysis
- [ ] Ler todas as 120 tasks
- [ ] Categorizar por tipo de operação
- [ ] Identificar padrões comuns
- **Output:** `docs/analysis/task-inventory.md`

#### Task 1.2: MCP Capability Mapping
- [ ] Documentar todas as 51 tools
- [ ] Mapear tool → use case
- [ ] Identificar overlaps e gaps
- **Output:** `docs/analysis/mcp-capabilities.md`

#### Task 1.3: Task-MCP Matrix
- [ ] Criar matriz 120x4 (tasks x MCPs)
- [ ] Marcar primary/secondary MCP per task
- [ ] Priorizar por impacto
- **Output:** `docs/analysis/task-mcp-matrix.csv`

### Phase 2: Architecture Design (8h)

#### Task 2.1: Task Execution Layer Design
- [ ] Definir interfaces
- [ ] Escolher pattern (dispatcher, middleware, etc.)
- [ ] Documentar fluxo de execução
- **Output:** `docs/architecture/task-execution-layer.md`

#### Task 2.2: MCP Declaration Schema
- [ ] Definir YAML schema para tasks
- [ ] Suportar pre-conditions, post-conditions
- [ ] Incluir fallback handling
- **Output:** `.aios-core/schemas/task-mcp-schema.yaml`

#### Task 2.3: Script Execution System
- [ ] Design Code Mode integration
- [ ] Define script template
- [ ] Error handling e logging
- **Output:** `docs/architecture/code-mode-integration.md`

### Phase 3: POC Implementation (12h)

#### Task 3.1: Select 10 Priority Tasks
Tasks selecionadas para POC:
1. `qa-run-tests` - desktop-commander (start_process)
2. `audit-codebase` - desktop-commander (list_directory, read_file, start_search)
3. `test-as-user` - playwright (browser_navigate, screenshot)
4. `create-deep-research-prompt` - exa + context7
5. `environment-bootstrap` - desktop-commander (start_process, write_file)
6. `generate-documentation` - desktop-commander (read_file, write_file)
7. `db-run-sql` - desktop-commander (start_process) [GAP: needs postgres MCP]
8. `setup-github` - [GAP: needs github MCP]
9. `po-stories-index` - desktop-commander (list_directory, read_file)
10. `ux-create-wireframe` - playwright (browser_navigate, screenshot)

#### Task 3.2: Implement MCP Integration
- [ ] Add MCP declaration to selected tasks
- [ ] Create dispatch logic
- [ ] Test each integration

#### Task 3.3: Measure Token Savings
- [ ] Baseline: tokens without MCP
- [ ] After: tokens with MCP
- [ ] Calculate % reduction

### Phase 4: Documentation (4h)

#### Task 4.1: Update Task Template
- [ ] Add MCP section to template
- [ ] Document all fields
- [ ] Add examples

#### Task 4.2: Create Integration Guide
- [ ] Step-by-step for adding MCP to task
- [ ] Best practices
- [ ] Troubleshooting

---

## Technical Specification

### Proposed Task YAML Schema (MCP Section)

```yaml
# New section to add to tasks
mcp:
  required:
    - name: desktop-commander
      reason: "File operations and process execution"
      tools:
        - read_file
        - write_file
        - start_process

  optional:
    - name: playwright
      reason: "Visual validation (if UI exists)"
      tools:
        - browser_screenshot

  fallback:
    strategy: graceful_degradation
    message: "MCP not available, using manual execution"

  code_mode:
    enabled: true
    script: scripts/mcp-workflows/task-specific-workflow.js
    token_savings: "~98.7%"
```

### Task Execution Flow

```
1. Agent activates task
2. Task Parser reads YAML
3. MCP Validator checks availability
4. If available:
   a. Dispatch operations to MCP
   b. Collect results
   c. Return to agent
5. If not available:
   a. Log warning
   b. Execute fallback (manual or error)
6. Post-conditions validated
```

---

## MCP GAP Analysis

### Critical GAPs (Blocking Functionality)

| MCP | Tasks Blocked | Priority | Action |
|-----|---------------|----------|--------|
| **github** | 6 tasks | 🔴 CRÍTICO | Add via `*add-mcp github` |
| **postgres** | 18 tasks | 🔴 CRÍTICO | Add via `*add-mcp postgres` |

### High Priority GAPs

| MCP | Tasks Blocked | Priority | Action |
|-----|---------------|----------|--------|
| **supabase** | 3 tasks | 🟠 ALTO | Consider after postgres |
| **notion** | 2 tasks | 🟡 MÉDIO | For PM tool integration |
| **clickup** | 2 tasks | 🟡 MÉDIO | For PM tool integration |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tasks with MCP schema | 10 (POC) | Count of tasks updated |
| Token reduction (Code Mode) | >80% | Before/after comparison |
| MCP coverage | >60% of tasks | Tasks with at least 1 MCP |
| Documentation complete | 100% | Checklist completion |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MCP not available | Medium | High | Graceful degradation |
| Performance overhead | Low | Medium | Lazy MCP initialization |
| Breaking existing tasks | Medium | High | Backward compatibility layer |

---

## Dependencies

### Completed
- ✅ Story 5.11: Docker MCP Toolkit Migration

### Required for Full Implementation
- [ ] GitHub MCP added to gateway
- [ ] Postgres MCP added to gateway

---

## Follow-up Stories

After this investigation, we'll create:

1. **Story 6.5: Add Critical MCPs** - github, postgres
2. **Story 6.6: Full Task Migration** - Update remaining 110 tasks
3. **Story 6.7: Code Mode Workflows** - Create scripts for complex tasks
4. **Story 6.8: Task Automation Dashboard** - Metrics and monitoring

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: Investigation/Infrastructure
**Secondary Type(s)**: Documentation, Architecture
**Complexity**: High (21 points, 4 phases)

### Specialized Agent Assignment

**Primary Agents**:
- @dev (Dex): Pre-commit reviews, POC implementation
- @architect (Aria): Architecture design validation

**Supporting Agents**:
- @qa (Quinn): Story validation, test strategy review
- @po (Pax): Story quality, acceptance criteria validation

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@github-devops): Run before creating pull request
- [ ] Documentation Review (@po): Validate all documentation deliverables

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations, 15min)
- HIGH issues: document_only
- MEDIUM/LOW issues: ignore

### CodeRabbit Focus Areas

**Primary Focus**:
- Task Format V1 compliance for modified tasks
- Schema validation (YAML structure)
- Architecture pattern consistency with existing standards

**Secondary Focus**:
- Documentation completeness
- Error handling patterns
- Backward compatibility verification

---

## Dev Notes

### Relevant Source Tree

```
.aios-core/
├── development/
│   └── tasks/                    # 120 tasks to analyze
│       ├── db-*.md              # 18 database tasks
│       ├── qa-*.md              # 11 QA tasks
│       ├── dev-*.md             # 10 dev tasks
│       ├── github-*.md          # 6 GitHub/DevOps tasks
│       └── po-*.md              # 8 PO tasks
├── docs/
│   └── standards/
│       ├── TASK-FORMAT-SPECIFICATION-V1.md  # Task format standard
│       ├── EXECUTOR-DECISION-TREE.md        # Executor types
│       └── AIOS-FRAMEWORK-MASTER.md         # Framework documentation
├── schemas/                      # Where task-mcp-schema.yaml will go
└── tools/
    └── mcp/                      # Existing MCP structure
        ├── configs/
        ├── scripts/
        └── templates/

docs/
├── analysis/                     # Output location for analysis
│   ├── task-inventory.md        # Task 1.1 output
│   ├── mcp-capabilities.md      # Task 1.2 output
│   └── task-mcp-matrix.csv      # Task 1.3 output
└── architecture/
    ├── task-execution-layer.md   # Task 2.1 output
    └── code-mode-integration.md  # Task 2.3 output

scripts/
└── mcp-workflows/                # Code Mode scripts location
```

### Key Technical Context

**MCPs Disponíveis (51 tools total):**
- `desktop-commander` (26 tools): read_file, write_file, start_process, list_directory, start_search, etc.
- `playwright` (22 tools): browser_navigate, browser_snapshot, browser_click, browser_type, etc.
- `context7` (2 tools): resolve-library-id, get-library-docs
- `exa` (1 tool): web_search_exa

**Task Format V1 - Seções para MCP:**
- `**Tools:**` - Já existe, estender com campos MCP
- `**Scripts:**` - Já existe, estender com Code Mode
- `**Error Handling:**` - Já existe, integrar fallback MCP

**Executor Decision Tree:**
- **Worker** é o tipo ideal para MCP tasks (determinístico, script-based)
- Usar `Executor: Worker` no header das tasks MCP-enabled

### Testing Standards

**Test Location:** `tests/unit/` e `tests/integration/`

**Test Patterns:**
```javascript
// Unit test for Task Parser
describe('TaskMCPParser', () => {
  it('should extract MCP tools from task YAML', () => {});
  it('should validate MCP availability', () => {});
  it('should handle missing MCP gracefully', () => {});
});

// Integration test for MCP dispatch
describe('MCPDispatcher', () => {
  it('should dispatch operation to correct MCP', () => {});
  it('should collect results from MCP tools', () => {});
  it('should execute fallback on MCP failure', () => {});
});
```

**Test Frameworks:** Jest (existing), consider Vitest for faster execution

### Previous Story Notes

From Story 5.11 (Docker MCP):
- MCP Gateway running on `http://localhost:8080/mcp`
- Use HTTP transport (not stdio) for reliability
- Gateway must be pre-started as service
- 4 MCPs available via docker-gateway

---

## QA Considerations

### Test Strategy
- Unit tests for Task Parser
- Integration tests for MCP dispatch
- E2E tests for POC tasks

### Quality Gates
- [ ] All 10 POC tasks execute successfully
- [ ] No regression in existing functionality
- [ ] Documentation reviewed

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-08 | 1.0.0 | Initial draft | Pax (PO) |
| 2025-12-08 | 1.1.0 | Added Architectural Analysis | Aria (Architect) |
| 2025-12-08 | 1.2.0 | Added CodeRabbit Integration, Dev Notes | Pax (PO) |

---

## Dev Agent Record

### Agent Model Used
_To be filled during implementation_

### Debug Log References
_To be filled during implementation_

### Completion Notes List
_To be filled during implementation_

### File List
_To be filled during implementation_

---

## QA Results
_To be filled after QA review_

---

## Architectural Analysis (Standards Alignment)

### Key Discovery: Existing Infrastructure

A análise dos standards do AIOS revelou que **já existe infraestrutura pronta** para integração de MCPs nas tasks. Não precisamos criar tudo do zero.

### Standards Analisados

| Standard | Localização | Relevância |
|----------|-------------|------------|
| **Task Format Specification V1** | `.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md` | Define seções Tools e Scripts |
| **Executor Decision Tree** | `.aios-core/docs/standards/EXECUTOR-DECISION-TREE.md` | Define 4 tipos de executores |
| **AIOS Framework Master** | `.aios-core/docs/standards/AIOS-FRAMEWORK-MASTER.md` | Documentação completa do framework |

### Task Format V1 - Seções Existentes para MCPs

O Task Format Specification V1 já define seções **Tools** e **Scripts** que mapeiam diretamente para integração MCP:

#### Seção Tools (Existente)
```yaml
**Tools:**
- [tool_name]:
    version: [X.Y.Z]
    used_for: [description]
    shared_with: [array of step IDs]
    cost: $[Y] per call (optional)
    cacheable: [true|false] (optional)
```

**Mapeamento proposto para MCPs:**
```yaml
**Tools:**
- desktop-commander:
    version: 1.0.0
    used_for: "Filesystem operations and process execution"
    mcp_tools: [read_file, write_file, start_process, list_directory]
    cacheable: false

- playwright:
    version: 1.0.0
    used_for: "Browser automation and visual testing"
    mcp_tools: [browser_navigate, browser_snapshot, browser_click]
    cacheable: false
```

#### Seção Scripts (Existente)
```yaml
**Scripts:**
- [script_path]:
    description: [what it does]
    language: [javascript|python|bash|etc]
    version: [X.Y.Z] (optional)
```

**Mapeamento proposto para Code Mode:**
```yaml
**Scripts:**
- scripts/mcp-workflows/qa-run-tests.js:
    description: "Execute test suite via desktop-commander"
    language: javascript
    mcp_integration: desktop-commander
    token_savings: "~98.7%"
```

### Executor Decision Tree - Worker Type para MCPs

O Executor Decision Tree define 4 tipos de executores:

| Executor | Descrição | Uso para MCPs |
|----------|-----------|---------------|
| **Agente** | AI-powered, criativo | Orquestração de workflows complexos |
| **Worker** | Script-based, determinístico | ✅ **Ideal para MCP tool execution** |
| **Humano** | Requer julgamento manual | Aprovações e validações |
| **Clone** | Emulação de Mind específico | Análises especializadas |

**Decisão Arquitetural:** O executor **Worker** é o tipo ideal para integração MCP porque:
1. Execução determinística de scripts
2. Sem necessidade de criatividade AI
3. Resultados previsíveis e cacheáveis
4. Baixo consumo de tokens

### AIOS Framework Master - Estrutura MCP Existente

O Framework Master documenta a existência de:
```
.aios-core/tools/mcp/
├── configs/       # Configurações MCP por preset
├── scripts/       # Scripts de automação
└── templates/     # Templates para novos MCPs
```

### Alinhamento: Proposta vs Existente

| Aspecto | Proposta Original (Story 6.4) | Infraestrutura Existente | Ação |
|---------|------------------------------|--------------------------|------|
| MCP Declaration | Nova seção `mcp:` no YAML | Seção `Tools:` existente | **Estender** seção Tools |
| Script Execution | Novo campo `code_mode:` | Seção `Scripts:` existente | **Estender** seção Scripts |
| Executor Selection | Implicit (agent decides) | Decision Tree documentado | **Usar** Worker type |
| Error Handling | Nova estratégia | `Error Handling:` existe | **Integrar** com existente |

### Recomendação Arquitetural

**Em vez de criar novos formatos**, devemos:

1. **Estender Task Format V1** - Adicionar campos MCP-específicos às seções existentes
2. **Usar Worker Executor** - Tasks MCP-enabled devem usar executor Worker
3. **Integrar com Error Handling** - Usar padrões existentes de fallback
4. **Manter Compatibilidade** - Tasks sem MCP continuam funcionando

### Schema Revisado (Alinhado com Standards)

```yaml
# Task header (existing format)
Task ID: qa-run-tests
Description: Execute test suite for quality assurance
Executor: Worker  # <- Use Worker for MCP tasks

# Tools section (EXTENDED from Task Format V1)
**Tools:**
- desktop-commander:
    version: 1.0.0
    used_for: "Process execution for npm test"
    mcp_tools:
      - start_process
      - read_process_output
    required: true
    fallback: manual_execution

- playwright:
    version: 1.0.0
    used_for: "Visual regression testing"
    mcp_tools:
      - browser_navigate
      - browser_snapshot
    required: false  # Optional enhancement

# Scripts section (EXTENDED from Task Format V1)
**Scripts:**
- scripts/mcp-workflows/qa-run-tests.js:
    description: "Automated test execution workflow"
    language: javascript
    entry_point: runTests
    mcp_dependencies: [desktop-commander]
    code_mode:
      enabled: true
      token_savings: "~98.7%"

# Error Handling (existing section, MCP-aware)
**Error Handling:**
- mcp_unavailable:
    severity: warning
    action: fallback_to_manual
    message: "MCP {name} not available, executing manually"
- script_failure:
    severity: error
    action: retry_with_agent
    max_retries: 2
```

---

## Metadata

```yaml
story: 6.4
version: 1.2.0
created: 2025-12-08
updated: 2025-12-08
author: Pax (PO Agent)
architect_review: Aria (Architect Agent)
validation: Pax (PO Agent) - PASS
sprint: 6
epic: Infrastructure Modernization
tags:
  - mcp
  - automation
  - investigation
  - infrastructure
  - standards-alignment
  - coderabbit-integrated
```
