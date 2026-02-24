# Migrate Workflows to YAML

**Task ID:** `migrate-workflows-to-yaml`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-05
**Deprecated:** true
**Deprecation Note:** One-time migration task - completed 2026-02-05. Kept for reference only.

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Migrate Workflows to YAML |
| **status** | `completed` |
| **responsible_executor** | @squad-chief |
| **execution_type** | `Agent` |
| **input** | Workflow .md files in workflows/ folder |
| **output** | Migrated .yaml files + archived .md files |
| **action_items** | 4 steps |
| **acceptance_criteria** | 3 criteria |

**Estimated Time:** 30min

## Overview

Migrar workflows em formato `.md` (legacy/narrativo) para o formato `.yaml` padrão do AIOS.

**Motivação:**
- Consistência no ecossistema (todos workflows em .yaml)
- Parsing automático por scripts de validação
- Suporte a tooling (templates, linters, geradores)
- Validação por schema

**Arquivos a migrar:**
1. `workflows/mind-research-loop.md` → `workflows/wf-mind-research-loop.yaml`
2. `workflows/research-then-create-agent.md` → `workflows/wf-research-then-create-agent.yaml`

## Input

- **source_files** (array)
  - Description: Lista de arquivos .md a migrar
  - Required: Yes
  - Source: `squads/squad-creator/workflows/*.md`

- **template** (file)
  - Description: Template de workflow YAML
  - Required: Yes
  - Source: `squads/squad-creator/templates/workflow-tmpl.yaml`

## Output

- **migrated_workflows** (files)
  - Description: Workflows convertidos para YAML
  - Destination: `squads/squad-creator/workflows/wf-*.yaml`
  - Format: YAML seguindo workflow-tmpl.yaml

- **archived_files** (files)
  - Description: Arquivos .md originais movidos para backup
  - Destination: `squads/squad-creator/workflows/_archive/`
  - Format: Original .md

## Action Items

### Step 1: Analisar Estrutura dos Workflows .md

Ler cada arquivo .md e extrair:
- workflow-id
- name/purpose
- version
- phases (seções principais)
- inputs/outputs
- checkpoints
- frameworks usados
- agents envolvidos

**Substeps:**
- [ ] Ler `mind-research-loop.md` e mapear estrutura
- [ ] Ler `research-then-create-agent.md` e mapear estrutura
- [ ] Identificar gaps em relação ao template YAML

### Step 2: Converter para Formato YAML

Usar `workflow-tmpl.yaml` como base e preencher com dados extraídos.

**Substeps:**
- [ ] Criar `wf-mind-research-loop.yaml` com estrutura completa
- [ ] Criar `wf-research-then-create-agent.yaml` com estrutura completa
- [ ] Validar sintaxe YAML de ambos os arquivos

### Step 3: Validar Workflows Migrados

Executar validação para garantir conformidade.

**Substeps:**
- [ ] Verificar campos obrigatórios (workflow-id, name, version, phases)
- [ ] Verificar que cada phase tem checkpoint
- [ ] Verificar referências a frameworks/agents estão corretas
- [ ] Rodar `*validate-workflow` em cada arquivo

### Step 4: Arquivar Originais e Limpar

Mover arquivos .md para pasta de archive.

**Substeps:**
- [ ] Criar pasta `workflows/_archive/` se não existir
- [ ] Mover `mind-research-loop.md` para `_archive/`
- [ ] Mover `research-then-create-agent.md` para `_archive/`
- [ ] Atualizar referências em outros arquivos (se houver)

## Acceptance Criteria

The task is complete when ALL of the following criteria are met:

- [ ] **AC1:** Ambos workflows convertidos para .yaml com estrutura válida
  - Measurement: `*validate-workflow` passa sem erros

- [ ] **AC2:** Pasta workflows/ contém apenas arquivos .yaml (exceto _archive/)
  - Measurement: `ls workflows/*.md` retorna vazio

- [ ] **AC3:** Arquivos originais preservados em `workflows/_archive/`
  - Measurement: Ambos .md existem em _archive/

## Quality Gate

```yaml
quality_gate:
  id: "QG_WF_MIGRATE_001"
  name: "Workflow Migration Quality Gate"
  placement: "exit"
  type: "automated"
  severity: "blocking"

  criteria:
    - check: "YAML syntax valid"
      type: "automated"
      field: "yaml_valid"
      value: true
      operator: "eq"
      weight: 3

    - check: "Required fields present"
      type: "automated"
      field: "required_fields"
      value: ["workflow-id", "name", "version", "phases"]
      operator: "contains_all"
      weight: 3

    - check: "Each phase has checkpoint"
      type: "automated"
      field: "phase_checkpoints"
      value: true
      operator: "eq"
      weight: 2

  thresholds:
    pass: 8
    review: 6
    fail: 5

  pass_action:
    - "Archive original .md files"
    - "Update squad-creator dependencies"

  fail_action:
    - "Report validation errors"
    - "Keep original .md files"
```

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `refresh-registry` |
| **Trigger** | Migration complete |
| **Executor** | @squad-chief |

### Handoff Checklist

Before handoff, verify:
- [ ] Todos workflows migrados passam validação
- [ ] Nenhuma referência quebrada a arquivos .md
- [ ] _archive/ contém backups

### Handoff Package

The following artifacts are passed to the next task:
- **migrated_workflows**: Lista de novos arquivos .yaml
- **migration_report**: Resumo da migração

## Error Handling

### YAML Syntax Error

- **Trigger:** Parser YAML falha
- **Detection:** Erro de parse ao carregar arquivo
- **Recovery:** Corrigir indentação/sintaxe e re-validar
- **Prevention:** Usar template como base, validar incrementalmente

### Missing Required Fields

- **Trigger:** Campo obrigatório ausente no .md original
- **Detection:** Validação falha no campo específico
- **Recovery:** Extrair informação do contexto ou pedir input
- **Prevention:** Mapear todos campos antes de converter

### Broken References

- **Trigger:** Outro arquivo referencia o .md antigo
- **Detection:** Grep por nome do arquivo nos dependencies
- **Recovery:** Atualizar referências para novo .yaml
- **Prevention:** Buscar referências antes de arquivar

## Examples

### Exemplo de Conversão

**Antes (mind-research-loop.md):**
```markdown
# Workflow: Mind Research Loop

**Workflow ID:** mind-research-loop
**Version:** 2.1.0
**Purpose:** Research and validate...

## Core Philosophy
...

## Phase 1: Initial Research
...
```

**Depois (wf-mind-research-loop.yaml):**
```yaml
workflow-id: wf-mind-research-loop
name: Mind Research Loop
version: 2.1.0
description: |
  Research and validate the world's best minds...

phases:
  - id: initial-research
    name: Initial Research
    checkpoint:
      criteria: [...]
    ...
```

## Notes

- Manter prefixo `wf-` para consistência com outros workflows
- Preservar toda informação semântica do .md original
- Estrutura de phases deve mapear para seções do .md
- Specialist handoffs devem ser preservados na nova estrutura

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-05_
_Compliant: Yes_
