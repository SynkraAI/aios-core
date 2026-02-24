# AN_KE_007 - REUSE > CREATE

**Type:** Creation Heuristic
**Phase:** 0 (Discovery)
**Agent:** @oalanicolas
**Pattern:** Check Existing First
**Source:** CLAUDE.md - "Check squads/ and existing components before creating new"

## Purpose

SEMPRE verificar se algo similar existe antes de criar novo. Evita duplicação, mantém consistência, aproveita trabalho validado.

## Core Principle

> "Check squads/ and existing components before creating new"
> "Create from scratch when similar exists" → NEVER
> — CLAUDE.md Alan's Personal Rules

## Search Locations

```yaml
search_order:
  1:
    location: "squads/"
    what: "Similar agents, tasks, workflows"
    command: "find squads/ -name '*{keyword}*'"

  2:
    location: ".claude/agents/"
    what: "Existing agent definitions"
    command: "ls .claude/agents/*.md"

  3:
    location: ".claude/skills/"
    what: "Existing skills"
    command: "find .claude/skills/ -name 'SKILL.md'"

  4:
    location: "app/components/"
    what: "UI components"
    command: "find app/components/ -name '*.tsx'"

  5:
    location: "docs/"
    what: "Documentation, templates"
    command: "find docs/ -name '*{keyword}*'"
```

## Configuration

```yaml
AN_KE_007:
  name: "REUSE > CREATE"
  phase: 0
  agent: "@oalanicolas"

  decision_matrix:
    - similarity: ">= 80%"
      action: "REUSE - Use existing directly"
      justification_required: false

    - similarity: "50-79%"
      action: "ADAPT - Fork and modify existing"
      justification_required: true

    - similarity: "20-49%"
      action: "REFERENCE - Use as template/inspiration"
      justification_required: true

    - similarity: "< 20%"
      action: "CREATE - New, but document why"
      justification_required: true

  veto_conditions:
    - condition: "create_without_search"
      action: "VETO - Search first"
      maps_to: "AN_VC_006"
    - condition: "create_when_80_percent_exists"
      action: "VETO - Use existing"
      maps_to: "AN_VC_006"

  output:
    type: "decision"
    values: ["REUSE", "ADAPT", "REFERENCE", "CREATE"]
```

## Decision Tree

```
STEP 1: Search all locations
  → Document findings

STEP 2: Calculate similarity
  IF >= 80% similar exists
    THEN REUSE → Use existing, don't create

  ELSE IF 50-79% similar exists
    THEN ADAPT → Fork existing, modify
    REQUIRE justification for changes

  ELSE IF 20-49% similar exists
    THEN REFERENCE → Use as template
    REQUIRE justification for new approach

  ELSE IF < 20% similar exists
    THEN CREATE → New creation justified
    REQUIRE documentation of search performed

TERMINATION: Always document search + decision
```

## Similarity Assessment

| Aspect | Weight | How to Assess |
|--------|--------|---------------|
| Purpose/intent | 0.3 | Same goal? |
| Structure | 0.2 | Same architecture? |
| Components | 0.2 | Same building blocks? |
| Interface | 0.15 | Same inputs/outputs? |
| Domain | 0.15 | Same context? |

## Before Creating Anything

```yaml
checklist:
  - question: "Does something similar exist in squads/?"
    action: "find squads/ -name '*keyword*'"

  - question: "Does an agent already do this?"
    action: "grep -r 'purpose' .claude/agents/*.md"

  - question: "Is there a skill for this?"
    action: "find .claude/skills/ -name 'SKILL.md' | xargs grep keyword"

  - question: "Is there a component for this?"
    action: "find app/components/ -name '*.tsx' | xargs grep keyword"

  - question: "Did I document what I found?"
    action: "List findings before proposing"
```

## Anti-Patterns

```yaml
anti_patterns:
  - name: "NIH Syndrome (Not Invented Here)"
    symptom: "Criar novo quando existente funciona"
    cost: "Duplicação, inconsistência, manutenção"
    fix: "REUSE existing unless genuinely inadequate"

  - name: "Shallow Search"
    symptom: "Olhou só um lugar e disse 'não existe'"
    cost: "Duplicação por ignorância"
    fix: "Search ALL locations in checklist"

  - name: "Create First, Search Later"
    symptom: "Descobrir existente depois de criar"
    cost: "Trabalho jogado fora"
    fix: "ALWAYS search before proposing creation"

  - name: "Over-Customization"
    symptom: "Adaptar muito quando existente serve"
    cost: "Fork desnecessário, manutenção dupla"
    fix: "Prefer REUSE over ADAPT when possible"
```

## Validation Questions

1. "Pesquisei em squads/?"
2. "Pesquisei em .claude/agents/?"
3. "Pesquisei em .claude/skills/?"
4. "Pesquisei em app/components/?"
5. "Documentei o que encontrei?"
6. "Justifiquei a decisão?"

## Performance Metrics

```yaml
performance:
  search_time: "5-10 min"
  duplication_avoided: "~60% of proposals use existing"
  consistency_improvement: "High (same patterns reused)"
  maintenance_reduction: "~40% (fewer unique implementations)"
```

---

**Pattern Compliance:** REUSE > CREATE
**Veto Mapping:** AN_VC_006 (Create Without Discovery)
**Integration:** Phase 0 of any creation workflow
