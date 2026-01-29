# ADE Epic 3 Handoff - Spec Pipeline

> **From:** Quinn (@qa) - QA Agent
> **To:** Aria (@architect) - Solution Architect
> **Date:** 2026-01-28
> **Status:** Epic 1+2 COMPLETE → Epic 3 UNLOCKED

---

## Executive Summary

Epic 1 (Worktree) e Epic 2 (Migration V3) estão **100% completos** e aprovados pelo QA Gate. O Epic 3 (Spec Pipeline) está **desbloqueado** para início imediato.

**Epic 3 é 100% Prompt Engineering** - @architect lidera todas as 6 stories.

---

## Prerequisites Validated ✅

| Dependency        | Status            | Evidence                                      |
| ----------------- | ----------------- | --------------------------------------------- |
| WorktreeManager   | ✅ Functional     | `manager.list()` executa sem erros            |
| V3 Schemas        | ✅ Complete       | `agent-v3-schema.json`, `task-v3-schema.json` |
| All Agents V3     | ✅ 12/12 migrated | `autoClaude:` section em todos                |
| Migration Scripts | ✅ Ready          | `asset-inventory.js`, `path-analyzer.js`      |

---

## Epic 3: Spec Pipeline Overview

**Tipo:** 10% Código, **90% Prompt Engineering**

O Spec Pipeline transforma requisitos vagos em especificações executáveis através de 5 fases sequenciais:

```
User Request → Gather → Assess → Research → Write → Critique → Spec Ready
```

---

## Stories Breakdown

| Story | Deliverable                     | Tipo           | Agent      |
| ----- | ------------------------------- | -------------- | ---------- |
| 3.1   | `spec-gather-requirements.md`   | Task .md       | @architect |
| 3.2   | `spec-assess-complexity.md`     | Task .md       | @architect |
| 3.3   | `spec-research-dependencies.md` | Task .md + MCP | @architect |
| 3.4   | `spec-write-spec.md`            | Task .md       | @architect |
| 3.5   | `spec-critique.md`              | Task .md       | @architect |
| 3.6   | `spec-pipeline.yaml`            | Workflow .yaml | @architect |

**@dev needed:** Nenhum
**@architect leads:** TODAS as stories

---

## Story 3.1: Gather Requirements

**Objetivo:** Coletar e estruturar requisitos do usuário

**Task:** `spec-gather-requirements.md`

**Inputs:**

- User request (text or voice)
- Project context (from status.json)
- Existing specs (if iterating)

**Outputs:**

- Structured requirements document
- Clarification questions (if ambiguous)
- Initial scope definition

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-gather
  elicit: true
  deterministic: false # LLM creativity needed
```

---

## Story 3.2: Assess Complexity

**Objetivo:** Avaliar complexidade e estimar esforço

**Task:** `spec-assess-complexity.md`

**Inputs:**

- Gathered requirements (from 3.1)
- Codebase analysis
- Technical constraints

**Outputs:**

- Complexity score (simple/standard/complex)
- Effort estimation
- Risk factors
- Suggested breakdown (if complex)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-assess
  complexity: standard
  verification:
    type: none # Assessment is advisory
```

---

## Story 3.3: Research Dependencies

**Objetivo:** Pesquisar bibliotecas, APIs e padrões necessários

**Task:** `spec-research-dependencies.md`

**Tools Required:**

- EXA (web search)
- Context7 (library docs)
- Codebase search

**Inputs:**

- Requirements + Assessment
- Tech stack preferences (from technical-preferences.md)

**Outputs:**

- Recommended libraries with rationale
- API documentation links
- Code examples
- Compatibility notes

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-research
  tools:
    - exa
    - context7
```

---

## Story 3.4: Write Specification

**Objetivo:** Produzir especificação executável

**Task:** `spec-write-spec.md`

**Inputs:**

- All previous outputs (requirements, assessment, research)
- Spec template

**Outputs:**

- Complete specification document
- Implementation checklist
- Test scenarios (Given-When-Then)
- Acceptance criteria

**Template:** Use existing `spec-tmpl.yaml` or create new

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-write
  deterministic: true # Same inputs = same spec
  composable: true
```

---

## Story 3.5: Critique Specification

**Objetivo:** Validar e melhorar a spec antes da execução

**Task:** `spec-critique.md`

**Inputs:**

- Written specification (from 3.4)
- Quality checklist

**Outputs:**

- Critique report
- Improvement suggestions
- PASS/NEEDS_REVISION decision
- Revised spec (if auto-fixed)

**Agent:** @qa capabilities (canCritique: true)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-critique
  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md
```

---

## Story 3.6: Pipeline Orchestration

**Objetivo:** Orquestrar as 5 fases em workflow único

**Workflow:** `spec-pipeline.yaml`

**Structure:**

```yaml
workflow:
  id: spec-pipeline
  sequence:
    - step: gather
      task: spec-gather-requirements.md
      agent: pm
    - step: assess
      task: spec-assess-complexity.md
      agent: architect
    - step: research
      task: spec-research-dependencies.md
      agent: analyst
    - step: write
      task: spec-write-spec.md
      agent: pm
    - step: critique
      task: spec-critique.md
      agent: qa
      gate: true # Must pass to continue
```

---

## Technical Patterns

### Task V3 Template

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-{phase}
  deterministic: boolean
  elicit: boolean
  composable: true

  verification:
    type: none|command|manual

  contextRequirements:
    projectContext: true
    filesContext: false
    implementationPlan: false
    spec: false
```

### Pipeline Phase Enum

```
spec-gather    # @pm - collect requirements
spec-assess    # @architect - evaluate complexity
spec-research  # @analyst - research dependencies
spec-write     # @pm - write specification
spec-critique  # @qa - validate quality
```

---

## Success Criteria

- [ ] All 5 spec tasks created with V3 autoClaude section
- [ ] Pipeline workflow orchestrates all phases
- [ ] Each task has clear inputs/outputs
- [ ] Critique task includes quality gate
- [ ] End-to-end test: vague request → complete spec

---

## Recommended Execution Order

1. **3.1 + 3.2 + 3.3** - Create the 3 analysis tasks (can be parallel)
2. **3.4** - Write spec task (depends on understanding flow)
3. **3.5** - Critique task (needs spec to critique)
4. **3.6** - Pipeline workflow (integrates all)

---

## Related Documents

- PRD: `docs/prd/aios-autonomous-development-engine.md`
- Auto-Claude Analysis: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Epic Stories: `docs/stories/aios-core-ade/epic-3-spec-pipeline.md`

---

## QA Gate for Epic 3

After completing Epic 3, run:

```
@qa *gate epic-3-spec-pipeline
```

**Validation:**

- All 5 tasks validate against task-v3-schema.json
- Pipeline workflow executes without errors
- E2E test: "Add login feature" → complete spec

---

_Handoff prepared by Quinn (@qa) - Guardian of Quality_
_Commit: 3fea6ca - feat(ade): complete Epic 1+2_
_Date: 2026-01-28_
