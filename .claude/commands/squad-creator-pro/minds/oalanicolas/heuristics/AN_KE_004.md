# AN_KE_004 - Discovery Before Implementation

**Type:** Research Heuristic
**Phase:** 0 (Discovery)
**Agent:** @oalanicolas
**Pattern:** REUSE > CREATE
**Source:** CLAUDE.md - "Map existing systems before building new ones"

## Purpose

Garantir que sistemas existentes sejam mapeados ANTES de propor novos. Evita duplicação, aproveita trabalho existente, e reduz débito técnico.

## Core Principle

> "Existing → Gap → Options → Recommendation"
> — CLAUDE.md Methodology

Nunca propor criação sem antes apresentar o que já existe.

## Configuration

```yaml
AN_KE_004:
  name: "Discovery Before Implementation"
  phase: 0
  agent: "@oalanicolas"

  pipeline:
    - step: 1
      name: "Map Existing"
      action: "Search for similar systems/components"
      queries:
        - "SELECT * FROM ... WHERE name LIKE '%keyword%'"
        - "find squads/ -name '*keyword*'"
        - "grep -r 'pattern' .claude/"
    - step: 2
      name: "Document Findings"
      action: "List what exists with paths/references"
    - step: 3
      name: "Identify Gaps"
      action: "What's missing vs requirements?"
    - step: 4
      name: "Present Options"
      action: "Extend existing vs Create new"
    - step: 5
      name: "Recommend"
      action: "Justify recommendation with evidence"

  weights:
    existing_coverage: 0.9
    gap_clarity: 0.8
    recommendation_evidence: 0.7

  thresholds:
    search_paths_minimum: 3
    findings_documented: true
    gap_analysis_complete: true

  veto_conditions:
    - condition: "proposal_without_discovery"
      action: "VETO - Map existing first"
      maps_to: "AN_VC_006"
    - condition: "create_when_similar_exists"
      action: "VETO - Extend existing instead"
      maps_to: "AN_VC_006"

  output:
    type: "decision"
    format: "Existing → Gap → Options → Recommendation"
```

## Decision Tree

```
IF (similar_exists >= 80%)
  THEN EXTEND → "Extend existing, don't create new"

ELSE IF (similar_exists >= 30% AND < 80%)
  THEN HYBRID → "Fork existing, adapt for new use case"

ELSE IF (similar_exists < 30%)
  THEN CREATE → "Create new, but document why existing doesn't fit"

TERMINATION: Always document what was searched
FALLBACK: If unsure, present options to human
```

## Search Checklist

```yaml
search_locations:
  code:
    - "squads/{domain}/"
    - ".claude/agents/"
    - ".claude/skills/"
    - "app/components/"

  documentation:
    - "docs/projects/"
    - "docs/architecture/"
    - "docs/guides/"

  database:
    - "information_schema.tables"
    - "information_schema.routines"
    - "pg_catalog.pg_indexes"

  external:
    - "npm search {keyword}"
    - "GitHub topics:{domain}"
    - "awesome-{domain} lists"
```

## Validation Questions

1. "Pesquisei em squads/, .claude/, docs/?"
2. "Documentei o que encontrei?"
3. "Gap está claro entre existente e necessário?"
4. "Apresentei opções antes de implementar?"
5. "Recomendação tem evidência?"

## Anti-Patterns

```yaml
anti_patterns:
  - name: "Create First, Search Later"
    symptom: "Descobrir que já existia depois de criar"
    prevention: "Always search BEFORE proposing"

  - name: "Shallow Search"
    symptom: "Só olhou um lugar"
    prevention: "Search minimum 3 locations"

  - name: "Proposal Without Evidence"
    symptom: "Propor criação sem mostrar o que existe"
    prevention: "Always show Existing → Gap → Options"
```

## Performance Metrics

```yaml
performance:
  search_time: "5-15 min depending on scope"
  accuracy: "95% when following checklist"
  duplication_avoided: "~70% of proposals extend existing"
  false_negatives: "<5% (miss existing solution)"
```

---

**Pattern Compliance:** REUSE > CREATE
**Veto Mapping:** AN_VC_006 (Create Without Discovery)
**Integration:** Phase 0 of any creation workflow
