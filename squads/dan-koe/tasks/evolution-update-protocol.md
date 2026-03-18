# Task: Protocolo de Atualizacao Evolutiva

```yaml
task_id: KOE_CHIEF_005
agent: koe-chief
type: maintenance
complexity: medium
estimated_time: 30min
source: "Framework Evolution — Dan Koe, tracked across eras (2018-present)"
version: 1.0
tags: [evolution, update, maintenance, framework-versioning, temporal]
dependencies:
  - data: "squads/mind-cloning/minds/dan-koe/outputs/koe-evolution.yaml"
```

## Proposito

> "My thinking has evolved massively since 2018. The frameworks you learn
> from me today are the refined versions. But the old versions weren't wrong —
> they were right for that era. Understanding the evolution helps you
> understand the WHY behind each framework."
> — Dan Koe

Executar o protocolo de atualizacao quando novo conteudo de Dan Koe
e publicado ou quando um framework evolui. Garante que o squad reflete
o pensamento MAIS RECENTE sem perder contexto historico.

## Contexto

Dan Koe evolui seus frameworks continuamente. O squad precisa de um protocolo
formal para incorporar essas evolucoes sem quebrar a coerencia interna.
O arquivo `koe-evolution.yaml` e o tracker central de versoes.

### O Protocolo de 5 Steps

```
IDENTIFY → EXTRACT DELTA → UPDATE EVOLUTION → PROPAGATE TO DNA → RUN SMOKE TESTS
```

### Regra Central
O modelo de evolucao e CUMULATIVO — cada era CONSTROI sobre a anterior, nao substitui.

## Steps

### Step 1 — Identificar Nova Fonte (5min)

**Fonte nova identificada**:
- Tipo: [ ] Newsletter [ ] YouTube [ ] Podcast [ ] Curso [ ] Livro [ ] Tweet thread
- Titulo: ____
- Data: ____
- Link/referencia: ____

**Scan rapido**:
- Menciona framework NOVO? [ ] Sim [ ] Nao → Se sim, qual? ____
- Menciona EVOLUCAO de framework existente? [ ] Sim [ ] Nao → Se sim, qual? ____
- Contradiz algo que o squad ja tem? [ ] Sim [ ] Nao → Se sim, o que? ____
- E uma aplicacao de framework existente (nao evolucao)? [ ] Sim → PARAR, nao e update

**Decisao**:
- [ ] NOVO FRAMEWORK → Prosseguir para Step 2 com foco em "introduced"
- [ ] EVOLUCAO → Prosseguir para Step 2 com foco em "evolved"
- [ ] NADA NOVO → PARAR, nao e necessario update

### Step 2 — Extrair Delta (8min)

**O que mudou** (comparar com o que o squad ja tem):

**Se NOVO framework**:
- Nome: ____
- Descricao (1-2 frases): ____
- Era em que apareceu: ____
- Maturidade: [ ] seed [ ] developing [ ] developed
- Categoria: ____
- Citacao-chave: "____"

**Se EVOLUCAO de framework existente**:
- Framework: ____
- Versao anterior: ____
- Versao nova: ____
- O que mudou especificamente: ____
- Por que mudou (contexto): ____
- Citacao-chave: "____"

**Impacto no squad**:
- Agentes afetados: ____
- DNAs afetados: ____
- Tasks afetadas: ____
- Frameworks library afetada: [ ] Sim [ ] Nao

### Step 3 — Atualizar koe-evolution.yaml (7min)

**Adicionar ao era correspondente em koe-evolution.yaml**:

Se NOVO:
```yaml
frameworks_introduced:
  - name: "{nome}"
    version: "v1.0"
    status: "introduced"
    description: "{descricao}"
    maturity: "{seed|developing|developed}"
```

Se EVOLUCAO:
```yaml
frameworks_evolved:
  - name: "{nome}"
    version: "v{N}.{N}"
    status: "matured"
    change: "{o que mudou}"
```

**Atualizar version_summary se framework ja esta la**

### Step 4 — Propagar para DNAs (7min)

**Para cada DNA afetado**:

| DNA File | Secao a Atualizar | Mudanca Necessaria |
|----------|------------------|-------------------|
| | | |
| | | |
| | | |

**Para mindset-frameworks.yaml** (se aplicavel):
- [ ] Adicionar novo MF-NNN
- [ ] Atualizar cross_reference
- [ ] Atualizar metadata.total_frameworks

**Para tasks** (se aplicavel):
- [ ] Criar nova task? ____
- [ ] Atualizar task existente? ____

### Step 5 — Rodar Smoke Tests (3min)

**Verificacao de coerencia pos-update**:
- [ ] koe-evolution.yaml valido (YAML syntax OK)
- [ ] Nenhuma contradicao entre eras (modelo cumulativo respeitado)
- [ ] DNAs atualizados refletem a versao mais recente
- [ ] Nenhum agent referencia versao desatualizada de framework
- [ ] Cross-references em mindset-frameworks.yaml consistentes

**Se algum teste falhar**: Reverter mudancas e investigar inconsistencia.

## Input Required

```yaml
input:
  new_source:
    type: "newsletter|youtube|podcast|course|book|twitter"
    title: ""
    date: ""
    link: ""
  change_type: "new_framework|evolution|application"
  framework_name: ""
  summary: ""
```

## Output Template

```yaml
output:
  evolution_update:
    update_date: ""

    source:
      type: ""
      title: ""
      date: ""

    change:
      type: "new_framework|evolution"
      framework: ""
      from_version: ""
      to_version: ""
      delta: ""

    files_modified:
      - file: ""
        change: ""
    files_created: []

    smoke_tests:
      yaml_valid: true|false
      no_contradictions: true|false
      dnas_updated: true|false
      cross_refs_consistent: true|false

    status: "success|partial|failed"
```

## Quality Gate

```yaml
quality_gate: KOE_CHIEF_005_QG
checklist:
  - [ ] Fonte nova validada como genuina evolucao (nao apenas aplicacao)
  - [ ] Delta claramente extraido com citacao-chave
  - [ ] koe-evolution.yaml atualizado no era correto
  - [ ] DNAs afetados propagados
  - [ ] mindset-frameworks.yaml atualizado se aplicavel
  - [ ] Smoke tests de coerencia passam
  - [ ] Modelo cumulativo respeitado (eras constroem, nao substituem)
  - [ ] Nenhuma contradicao introduzida
```

## Handoff

```yaml
handoff:
  next_tasks: []
  artifacts:
    - koe-evolution.yaml (updated)
    - affected DNA files (updated)
  notes: "Update evolutivo completo. Proximo check quando nova fonte for identificada."
```
