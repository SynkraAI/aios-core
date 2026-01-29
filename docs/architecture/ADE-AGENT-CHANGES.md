# ADE Agent Changes - Alterações nos Agentes AIOS

> **Document:** Registro das alterações feitas nos agentes para suportar ADE
> **Date:** 2026-01-29
> **Status:** Complete ✅
> **Related:** ADE Epics 1-7

---

## Overview

Este documento registra todas as alterações feitas nos arquivos de definição dos agentes AIOS para suportar o AIOS Autonomous Development Engine (ADE).

**Arquivos modificados:**

- `.aios-core/development/agents/*.md` (source)
- `.claude/commands/AIOS/agents/*.md` (synced)

---

## Formato autoClaude V3

Todos os agentes foram migrados para incluir a seção `autoClaude` no formato V3:

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:XX.XXXZ'

  # Spec Pipeline capabilities (Epic 3)
  specPipeline:
    canGather: boolean # Coletar requisitos
    canAssess: boolean # Avaliar complexidade
    canResearch: boolean # Pesquisar dependências
    canWrite: boolean # Escrever spec
    canCritique: boolean # Criticar spec

  # Execution Engine capabilities (Epic 4)
  execution:
    canCreatePlan: boolean # Criar plano de implementação
    canCreateContext: boolean # Criar contexto do projeto
    canExecute: boolean # Executar subtasks
    canVerify: boolean # Verificar subtasks

  # Recovery System capabilities (Epic 5)
  recovery:
    canTrackAttempts: boolean # Rastrear tentativas
    canRollback: boolean # Fazer rollback

  # QA Evolution capabilities (Epic 6)
  qa:
    canReview: boolean # Fazer review estruturado
    canRequestFix: boolean # Solicitar correções

  # Worktree capabilities (Epic 1)
  worktree:
    canCreate: boolean # Criar worktrees
    canMerge: boolean # Fazer merge
    canCleanup: boolean # Limpar worktrees

  # Memory Layer capabilities (Epic 7)
  memory:
    canCaptureInsights: boolean # Capturar insights
    canExtractPatterns: boolean # Extrair padrões
    canDocumentGotchas: boolean # Documentar gotchas
```

---

## Alterações por Agente

### @devops (Gage)

**Arquivo:** `.aios-core/development/agents/devops.md`

**Comandos Adicionados:**

```yaml
# Worktree Management (Epic 1 - ADE Infrastructure)
- create-worktree {story}: Create isolated worktree for story development
- list-worktrees: List all active worktrees with status
- merge-worktree {story}: Merge completed worktree back to main
- cleanup-worktrees: Remove stale/merged worktrees

# Migration Management (Epic 2 - V2→V3 Migration)
- inventory-assets: Generate migration inventory from V2 assets
- analyze-paths: Analyze path dependencies and migration impact
- migrate-agent: Migrate single agent from V2 to V3 format
- migrate-batch: Batch migrate all agents with validation
```

**autoClaude Capabilities:**

```yaml
autoClaude:
  version: '3.0'
  worktree:
    canCreate: true
    canMerge: true
    canCleanup: true
```

**Dependencies Adicionadas:**

```yaml
dependencies:
  scripts:
    # Worktree Management (Epic 1)
    - worktree-manager.js
    - story-worktree-hooks.js
    - project-status-loader.js
    # Migration Management (Epic 2)
    - asset-inventory.js
    - path-analyzer.js
    - migrate-agent.js
  tasks:
    - worktree-create.md
    - worktree-list.md
    - worktree-merge.md
  workflows:
    - auto-worktree.yaml
```

---

### @pm (Morgan)

**Arquivo:** `.aios-core/development/agents/pm.md`

**Comandos Adicionados:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- gather-requirements: Elicit and document requirements from stakeholders
- write-spec: Generate formal specification document from requirements
```

**autoClaude Capabilities:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: true
    canAssess: false
    canResearch: false
    canWrite: true
    canCritique: false
```

**Dependencies Adicionadas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-gather-requirements.md
    - spec-write-spec.md
```

---

### @architect (Aria)

**Arquivo:** `.aios-core/development/agents/architect.md`

**Comandos Adicionados:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- assess-complexity: Assess story complexity and estimate effort

# Execution Engine (Epic 4 - ADE)
- create-plan: Create implementation plan with phases and subtasks
- create-context: Generate project and files context for story

# Memory Layer (Epic 7 - ADE)
- map-codebase: Generate codebase map (structure, services, patterns, conventions)
```

**autoClaude Capabilities:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: true
    canResearch: false
    canWrite: false
    canCritique: false
  execution:
    canCreatePlan: true
    canCreateContext: true
    canExecute: false
    canVerify: false
```

**Dependencies Adicionadas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-assess-complexity.md
    # Execution Engine (Epic 4)
    - plan-create-implementation.md
    - plan-create-context.md
  scripts:
    # Memory Layer (Epic 7)
    - codebase-mapper.js
```

---

### @analyst (Atlas)

**Arquivo:** `.aios-core/development/agents/analyst.md`

**Comandos Adicionados:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- research-deps: Research dependencies and technical constraints for story

# Memory Layer (Epic 7 - ADE)
- extract-patterns: Extract and document code patterns from codebase
```

**autoClaude Capabilities:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: false
    canResearch: true
    canWrite: false
    canCritique: false
  memory:
    canCaptureInsights: false
    canExtractPatterns: true
    canDocumentGotchas: false
```

**Dependencies Adicionadas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-research-dependencies.md
  scripts:
    # Memory Layer (Epic 7)
    - pattern-extractor.js
```

---

### @qa (Quinn)

**Arquivo:** `.aios-core/development/agents/qa.md`

**Comandos Adicionados:**

```yaml
# Structured Review (Epic 6 - QA Evolution)
- 'review-build {story}': 10-phase structured QA review - outputs qa_report.md
- 'request-fix {issue}': Request specific fix from @dev with context
- 'verify-fix {issue}': Verify fix was properly implemented

# Spec Pipeline (Epic 3 - ADE)
- 'critique-spec {story}': Review and critique specification for completeness
```

**autoClaude Capabilities:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: false
    canResearch: false
    canWrite: false
    canCritique: true
  qa:
    canReview: true
    canRequestFix: true
```

**Dependencies Adicionadas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-critique.md
    # QA Evolution (Epic 6)
    - qa-review-build.md
    - qa-fix-issues.md
    - qa-structured-review.md
  scripts:
    - qa-loop-orchestrator.js
    - qa-report-generator.js
  workflows:
    - qa-loop.yaml
  templates:
    - qa-report-tmpl.yaml
```

---

### @dev (Dexter)

**Arquivo:** `.aios-core/development/agents/dev.md`

**Comandos Adicionados:**

```yaml
# Execution Engine (Epic 4 - ADE)
- name: execute-subtask
  visibility: [full, quick]
  description: 'Execute a subtask following 13-step workflow with self-critique'

# Recovery System (Epic 5 - ADE)
- name: track-attempt
  visibility: [full, quick]
  description: 'Track implementation attempt for a subtask (registers in recovery/attempts.json)'
- name: rollback
  visibility: [full, quick]
  description: 'Rollback to last good state for a subtask (--hard to skip confirmation)'

# QA Loop (Epic 6)
- name: apply-qa-fix
  visibility: [full, quick]
  description: 'Apply fix requested by QA (reads qa_report.md for context)'

# Memory Layer (Epic 7 - ADE)
- name: capture-insights
  visibility: [full, quick]
  description: 'Capture session insights (discoveries, patterns, gotchas, decisions)'
- name: list-gotchas
  visibility: [full, quick]
  description: 'List known gotchas from .aios/gotchas.md'
```

**autoClaude Capabilities:**

```yaml
autoClaude:
  version: '3.0'
  execution:
    canCreatePlan: false
    canCreateContext: false
    canExecute: true
    canVerify: true
  recovery:
    canTrackAttempts: true
    canRollback: true
  memory:
    canCaptureInsights: true
    canExtractPatterns: false
    canDocumentGotchas: true
```

**Dependencies Adicionadas:**

```yaml
dependencies:
  tasks:
    # Execution Engine (Epic 4)
    - plan-execute-subtask.md
    # QA Evolution (Epic 6)
    - qa-fix-issues.md
    # Memory Layer (Epic 7)
    - capture-session-insights.md
  scripts:
    # Execution Engine (Epic 4)
    - subtask-verifier.js
    - plan-tracker.js
    # Recovery System (Epic 5)
    - recovery-tracker.js
    - approach-manager.js
    - rollback-manager.js
    - stuck-detector.js
    # Memory Layer (Epic 7)
    - gotchas-documenter.js
  checklists:
    - self-critique-checklist.md
```

---

## Matriz de Capabilities por Agente

| Capability         | @devops | @pm | @architect | @analyst | @qa | @dev |
| ------------------ | ------- | --- | ---------- | -------- | --- | ---- |
| **Spec Pipeline**  |
| canGather          | -       | ✅  | -          | -        | -   | -    |
| canAssess          | -       | -   | ✅         | -        | -   | -    |
| canResearch        | -       | -   | -          | ✅       | -   | -    |
| canWrite           | -       | ✅  | -          | -        | -   | -    |
| canCritique        | -       | -   | -          | -        | ✅  | -    |
| **Execution**      |
| canCreatePlan      | -       | -   | ✅         | -        | -   | -    |
| canCreateContext   | -       | -   | ✅         | -        | -   | -    |
| canExecute         | -       | -   | -          | -        | -   | ✅   |
| canVerify          | -       | -   | -          | -        | -   | ✅   |
| **Recovery**       |
| canTrackAttempts   | -       | -   | -          | -        | -   | ✅   |
| canRollback        | -       | -   | -          | -        | -   | ✅   |
| **QA**             |
| canReview          | -       | -   | -          | -        | ✅  | -    |
| canRequestFix      | -       | -   | -          | -        | ✅  | -    |
| **Worktree**       |
| canCreate          | ✅      | -   | -          | -        | -   | -    |
| canMerge           | ✅      | -   | -          | -        | -   | -    |
| canCleanup         | ✅      | -   | -          | -        | -   | -    |
| **Memory**         |
| canCaptureInsights | -       | -   | -          | -        | -   | ✅   |
| canExtractPatterns | -       | -   | -          | ✅       | -   | -    |
| canDocumentGotchas | -       | -   | -          | -        | -   | ✅   |

---

## Sincronização de Arquivos

Todos os agentes foram sincronizados entre:

```
.aios-core/development/agents/   →   .claude/commands/AIOS/agents/
         (source)                           (synced)
```

**Agentes sincronizados:**

- analyst.md
- architect.md
- dev.md
- devops.md
- pm.md
- po.md
- qa.md
- sm.md
- ux-design-expert.md
- data-engineer.md
- aios-master.md
- squad-creator.md

---

## Validação

Todos os agentes validam contra:

- `.aios-core/infrastructure/schemas/agent-v3-schema.json`

**Comando para validar:**

```bash
node .aios-core/infrastructure/scripts/migrate-agent.js --validate
```

---

_Document created by Quinn (@qa) - Guardian of Quality_
_Date: 2026-01-29_
