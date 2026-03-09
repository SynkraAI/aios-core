# Squad PRD Template

> **Template ID:** squad-prd-template
> **Version:** 1.0.0
> **Purpose:** PRD for squads with >= 10 workflows
> **Reference:** data/pm-best-practices.md

---

# {{SQUAD_NAME}} Squad - Product Requirements Document

**Version:** 1.0.0
**Created:** {{DATE}}
**Author:** @squad-chief
**Status:** Draft | Review | Approved

---

## 1. Goals & Context

### 1.1 Goals

> What outcomes does this squad enable?

- [ ] {{GOAL_1}}
- [ ] {{GOAL_2}}
- [ ] {{GOAL_3}}

### 1.2 Background Context

> 1-2 paragraphs on the problem being solved

{{BACKGROUND_CONTEXT}}

**Key Questions Answered:**
- Why does this squad need to exist?
- What pain exists today without it?
- What's the opportunity cost of NOT building this?

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| {{DATE}} | 1.0.0 | Initial PRD | @squad-chief |

---

## 2. Domain Analysis

### 2.1 Workflows Mapped

> Complete list of ALL workflows this squad handles

| # | Workflow | Category | Frequency | Complexity | Automatizável |
|---|----------|----------|-----------|------------|---------------|
| 1.1 | {{WORKFLOW}} | {{CATEGORY}} | {{FREQ}} | {{COMPLEX}} | {{AUTO_PCT}} |
| ... | ... | ... | ... | ... | ... |

**Total Workflows:** {{TOTAL}}
**High Automation (>80%):** {{COUNT}} ({{PCT}}%)
**Medium Automation (50-80%):** {{COUNT}} ({{PCT}}%)
**Low Automation (<50%):** {{COUNT}} ({{PCT}}%)

### 2.2 Workflow Categories

```yaml
categories:
  {{CATEGORY_1}}:
    count: {{N}}
    workflows: [{{LIST}}]
    automation_avg: {{PCT}}%

  {{CATEGORY_2}}:
    count: {{N}}
    workflows: [{{LIST}}]
    automation_avg: {{PCT}}%
```

---

## 3. Elite Minds

### 3.1 Research Summary

| Mind | Tier | Domain | Framework Documented | Score |
|------|------|--------|---------------------|-------|
| {{MIND_1}} | Tier 0 | {{DOMAIN}} | {{FRAMEWORK}} | {{SCORE}}/15 |
| {{MIND_2}} | Tier 1 | {{DOMAIN}} | {{FRAMEWORK}} | {{SCORE}}/15 |
| ... | ... | ... | ... | ... |

### 3.2 Tier Distribution

```yaml
tier_distribution:
  tier_0:
    purpose: "Diagnosis, Classification, Onboarding"
    minds: [{{LIST}}]
    coverage: "{{WHAT_THEY_COVER}}"

  tier_1:
    purpose: "Masters with proven results"
    minds: [{{LIST}}]
    coverage: "{{WHAT_THEY_COVER}}"

  tier_2:
    purpose: "Systematizers, Framework creators"
    minds: [{{LIST}}]
    coverage: "{{WHAT_THEY_COVER}}"

  tier_3:
    purpose: "Format/Channel specialists"
    minds: [{{LIST}}]
    coverage: "{{WHAT_THEY_COVER}}"
```

### 3.3 Gap Analysis

| Gap | Impact | Mitigation |
|-----|--------|------------|
| {{GAP}} | {{IMPACT}} | {{MITIGATION}} |

---

## 4. Agent Architecture

### 4.1 Orchestrator

```yaml
orchestrator:
  name: "{{PACK_NAME}}-chief"
  purpose: "Coordinates all agents, routes requests"
  tier: "orchestrator"
  capabilities:
    - "Route requests to appropriate tier"
    - "Manage multi-agent workflows"
    - "Track context across handoffs"
```

### 4.2 Agents by Tier

```yaml
agents:
  tier_0:
    - id: "{{AGENT_ID}}"
      name: "{{AGENT_NAME}}"
      based_on: "{{MIND_NAME}}"
      workflows: [{{WORKFLOW_IDS}}]
      purpose: "{{PURPOSE}}"

  tier_1:
    - id: "{{AGENT_ID}}"
      name: "{{AGENT_NAME}}"
      based_on: "{{MIND_NAME}}"
      workflows: [{{WORKFLOW_IDS}}]
      purpose: "{{PURPOSE}}"

  tier_2:
    # ...

  tier_3:
    # ...
```

### 4.3 Handoff Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      HANDOFF ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Request                                                   │
│       ↓                                                         │
│  @{{PACK_NAME}}-chief (Orchestrator)                           │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tier 0: Diagnosis                                        │   │
│  │ {{AGENT_1}} → {{AGENT_2}}                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tier 1: Execution                                        │   │
│  │ {{AGENT_3}} ←→ {{AGENT_4}}                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  Output to User                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Workflow → Agent Matrix

| Workflow | Primary Agent | Support Agent | Quality Gate |
|----------|---------------|---------------|--------------|
| {{WORKFLOW}} | @{{AGENT}} | @{{AGENT}} | {{GATE}} |
| ... | ... | ... | ... |

**Coverage Check:**
- [ ] All {{TOTAL}} workflows assigned to at least 1 agent
- [ ] No orphan workflows
- [ ] No orphan agents

---

## 5. Epic List

> High-level list of epics for phased implementation

### Overview

| Epic | Title | Agents | Workflows | Estimated Effort |
|------|-------|--------|-----------|------------------|
| 1 | Foundation + Orchestrator | 1-2 | 0 | {{EFFORT}} |
| 2 | {{TITLE}} | {{N}} | {{N}} | {{EFFORT}} |
| 3 | {{TITLE}} | {{N}} | {{N}} | {{EFFORT}} |
| ... | ... | ... | ... | ... |

### Epic Dependencies

```
Epic 1 (Foundation)
    ↓
Epic 2 (Tier 0)
    ↓
Epic 3 (Tier 1a) ←→ Epic 4 (Tier 1b)
    ↓
Epic 5 (Tier 2)
    ↓
Epic 6 (Tier 3)
```

---

## 6. Epic Details

### Epic 1: Foundation + Orchestrator

**Goal:** Establish squad infrastructure and create orchestrator agent that routes all requests.

**Deliverables:**
- [ ] Directory structure (`squads/{{PACK_NAME}}/`)
- [ ] `config.yaml` with pack metadata
- [ ] `README.md` with usage documentation
- [ ] Orchestrator agent (`{{PACK_NAME}}-chief`)
- [ ] Core data files (KB, frameworks)

**Stories:**

#### Story 1.1: Create Squad Structure

**As a** squad user
**I want** the squad directory properly structured
**So that** all components have consistent locations

**Acceptance Criteria:**
- [ ] `squads/{{PACK_NAME}}/` directory created
- [ ] All subdirectories exist (agents/, tasks/, workflows/, etc.)
- [ ] `config.yaml` valid and complete
- [ ] `README.md` with activation instructions

**Quality Gates:**
- Pre-Commit: Structure validation
- Specialist: @squad-chief

---

#### Story 1.2: Create Orchestrator Agent

**As a** squad user
**I want** an orchestrator that routes my requests
**So that** I don't need to know which agent to call

**Execution:**
```yaml
workflow: "create-agent.md"
type: "functional"
inputs:
  agent_id: "{{PACK_NAME}}-chief"
  tier: "orchestrator"
  purpose: "Route requests to appropriate tier agents"
template: "templates/agent-tmpl.md"
```

**Acceptance Criteria:**
- [ ] `agents/{{PACK_NAME}}-chief.md` created
- [ ] Agent >= 400 lines
- [ ] Routing logic for all tiers defined
- [ ] `*help` command lists all capabilities

**Quality Gates:**
- Pre-Commit: SC_AGT_001 (Agent Quality)
- Specialist: @squad-chief

---

### CRITICAL: Story Pattern for Agent Creation

> **REGRA:** Stories de criação de agent NUNCA devem especificar o agent inline.
> Devem REFERENCIAR o workflow de criação.

**Template a usar:** `templates/story-create-agent-tmpl.md`

```yaml
# ❌ ERRADO - Especificação inline (gera agents genéricos)
story_antiga:
  conteudo: |
    agent:
      name: "X"
      # 200 linhas de YAML do agent completo
      # Executor apenas copia

# ✅ CORRETO - Referência a workflow (gera agents com profundidade)
story_nova:
  workflow: "wf-clone-mind.yaml | create-agent.md"
  type: "mind_clone | functional"
  inputs: [agent_id, domain, sources_path, ...]
  quality_gates: [SC_AGT_001, SC_AGT_002, SC_AGT_003, SMOKE_TEST]
```

**Quality Gate SC_AGT_003 (Depth Gate) - NOVO:**
```yaml
SC_AGT_003:
  name: "Agent Depth Quality"
  blocking: true
  criteria:
    - "Frameworks têm TEORIA (o porquê), não só passos"
    - "Heurísticas têm EXEMPLOS de aplicação real"
    - "Voice DNA é distinguível (não genérico)"
    - "Anti-patterns têm RAZÃO explicada"
    - "Agent NÃO poderia ser confundido com outro genérico"
```

---

### Epic 2: {{EPIC_TITLE}}

**Goal:** {{EPIC_GOAL}}

**Deliverables:**
- [ ] {{DELIVERABLE_1}}
- [ ] {{DELIVERABLE_2}}

**Stories:**

#### Story 2.1: {{STORY_TITLE}}

**As a** {{USER_TYPE}}
**I want** {{ACTION}}
**So that** {{BENEFIT}}

**Acceptance Criteria:**
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}

**Quality Gates:**
- Pre-Commit: {{GATE}}
- Specialist: @{{SPECIALIST}}

---

<!-- Repeat for all epics -->

---

## 7. Success Criteria

### 7.1 Coverage Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Workflow Coverage | 100% | All {{TOTAL}} workflows have assigned agent |
| Automation Rate | >= 70% | High-automation workflows functional |
| Agent Quality | >= 7.0 | All agents pass quality gate |

### 7.2 Functional Criteria

- [ ] User can activate squad with `/{{PACK_NAME}}`
- [ ] Orchestrator routes to correct agent
- [ ] All Tier 0 workflows functional
- [ ] All Tier 1 workflows functional
- [ ] Documentation complete

### 7.3 Quality Criteria

- [ ] All agents have voice_dna
- [ ] All agents have output_examples >= 3
- [ ] All workflows have checkpoints
- [ ] No orphan dependencies

---

## 8. Risks & Mitigations

| # | Risk | Impact | Probability | Mitigation | Rollback |
|---|------|--------|-------------|------------|----------|
| 1 | {{RISK}} | High/Med/Low | High/Med/Low | {{MITIGATION}} | {{ROLLBACK}} |
| 2 | ... | ... | ... | ... | ... |

---

## 9. Next Steps

### After PRD Approval

1. **Create Epic 1 issues/stories** in project management
2. **Invoke:** `@squad-chief *create-squad {{PACK_NAME}} --epic=1`
3. **Validate:** After each epic, run `*validate-squad {{PACK_NAME}}`
4. **Iterate:** Proceed to next epic after validation passes

### Handoff

- **To @squad-chief:** Implement Epic 1
- **To @oalanicolas:** Clone minds for Tier 0 agents
- **To @pedro-valerio:** Validate workflow quality gates

---

## Appendix A: Research Sources

| Mind | Source Type | Source | Quality |
|------|-------------|--------|---------|
| {{MIND}} | Book | {{TITLE}} | Ouro |
| {{MIND}} | Interview | {{TITLE}} | Bronze |

---

## Appendix B: PRD Checklist

### Problem Definition
- [ ] Clear problem articulation
- [ ] Target user identified
- [ ] Success metrics defined

### Domain Analysis
- [ ] ALL workflows mapped
- [ ] Categories defined
- [ ] Automation assessed

### Elite Minds
- [ ] >= 3 minds identified
- [ ] Frameworks documented
- [ ] Tier coverage complete

### Agent Architecture
- [ ] Orchestrator defined
- [ ] Handoff map complete
- [ ] No orphan agents/workflows

### Epic Structure
- [ ] Epic 1 = Foundation
- [ ] Sequential dependencies
- [ ] Each epic delivers value

### Quality
- [ ] Gates defined per story
- [ ] Specialists assigned
- [ ] Success criteria measurable

**Score:** __/6 categories
**Threshold:** >= 5/6 to approve

---

*Squad PRD Template v1.0*
*Reference: data/pm-best-practices.md*
