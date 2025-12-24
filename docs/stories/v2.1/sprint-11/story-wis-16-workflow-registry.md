# Story WIS-16: Workflow Registry Integration

<!-- Source: Epic WIS - Workflow Intelligence System -->
<!-- Context: Integrate incremental-feature workflow with WIS registry -->
<!-- Created: 2025-12-23 by @sm (River) -->

## Status: Draft

**Priority:** 🟡 MEDIUM
**Sprint:** 11
**Effort:** 4-6h
**Lead:** @architect (Aria)
**Approved by:** Pending @po validation

---

## Story

**As an** AIOS user,
**I want** the incremental-feature workflow registered in the WIS workflow registry,
**So that** `*next` can suggest workflow steps and guide me through feature development.

---

## Background

WIS-9 Investigation created the incremental-feature workflow specification.
WIS-1 Investigation defined the WIS architecture including the workflow registry.
This story integrates the two, adding the incremental-feature workflow to the registry.

### Reference Documents

| Document | Section |
|----------|---------|
| `docs/architecture/wis-9-investigation-report.md` | Section 4.4: Workflow YAML Specification |
| `docs/architecture/adr/adr-wis-architecture.md` | Workflow Registry architecture |
| WIS-2 | Workflow Registry Enhancement |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Integration
**Secondary Type(s)**: Configuration, Workflow Design
**Complexity**: Low-Medium

### Specialized Agent Assignment

**Primary Agents**:
- @architect (Aria): Define workflow structure and integration

**Supporting Agents**:
- @dev (Dex): Implement registry entry

### Quality Gate Tasks

- [ ] Pre-Commit (@architect): Validate workflow YAML schema
  - **Pass criteria:** YAML valid, phases complete, handoffs defined
  - **Fail criteria:** Schema errors, missing phases

### Self-Healing Configuration

**Mode:** check (report only)

### Focus Areas

- Workflow YAML schema compliance
- Phase definition completeness
- Handoff criteria clarity
- Integration with existing patterns

---

## Acceptance Criteria

### AC 16.1: Workflow Definition File
- [ ] Create `.aios-core/workflow-intelligence/registry/incremental-feature.yaml`
- [ ] Follow WIS workflow schema from WIS-1/WIS-2
- [ ] Include all 5 phases from WIS-9:
  - Analysis
  - Research (optional)
  - Planning
  - Development
  - Validation
  - Deployment

### AC 16.2: Phase Definitions
- [ ] Each phase includes:
  - `id` - unique phase identifier
  - `name` - human-readable name
  - `agents` - list of agents involved
  - `tasks` - tasks to execute
  - `outputs` - expected outputs
  - `next_phase` or `decision` - flow control

### AC 16.3: Decision Points
- [ ] Define `research_check` decision point:
  - Question: "Is additional research needed?"
  - Options: yes → research phase, no → planning phase
- [ ] Define `dev_agent_selection` criteria:
  - api_service → @dev
  - infrastructure → @devops
  - database → @data-engineer
  - ui_component → @ux-expert

### AC 16.4: Agent Handoff Criteria
- [ ] Document entry/exit criteria for each transition:
  - User → @architect: Feature request received
  - @architect → @analyst: External API/unclear requirements
  - @architect → @pm: Analysis complete (no research)
  - @pm → @sm: Epic approved
  - @sm → @po: Stories drafted
  - @po → @dev: Stories validated
  - @dev → @qa: Code complete
  - @qa → @devops: QA approved

### AC 16.5: Workflow Triggers
- [ ] Define manual trigger: `*start incremental-feature`
- [ ] Define context trigger: existing project + new feature request

### AC 16.6: Integration with `*next`
- [ ] Workflow registered in registry index
- [ ] Context detection patterns defined
- [ ] Confidence scoring weights set

---

## Tasks / Subtasks

- [ ] **Task 1: Create Workflow File** (AC: 16.1)
  - [ ] Create incremental-feature.yaml
  - [ ] Add workflow metadata

- [ ] **Task 2: Define Phases** (AC: 16.2)
  - [ ] Define analysis phase
  - [ ] Define research phase (optional)
  - [ ] Define planning phase
  - [ ] Define development phase
  - [ ] Define validation phase
  - [ ] Define deployment phase

- [ ] **Task 3: Define Decision Points** (AC: 16.3)
  - [ ] Add research_check decision
  - [ ] Add dev_agent_selection criteria

- [ ] **Task 4: Document Handoffs** (AC: 16.4)
  - [ ] Add entry/exit criteria per transition
  - [ ] Define handoff outputs

- [ ] **Task 5: Configure Triggers** (AC: 16.5)
  - [ ] Add manual trigger
  - [ ] Add context trigger patterns

- [ ] **Task 6: Registry Integration** (AC: 16.6)
  - [ ] Update registry index
  - [ ] Add context detection
  - [ ] Set confidence weights

---

## Dev Notes

### Workflow YAML Structure

```yaml
workflow: incremental-feature
version: "1.0.0"
description: Develop new features/services in existing AIOS projects

triggers:
  - manual: "*start incremental-feature"
  - context:
      conditions:
        - project_has_aios: true
        - user_intent: "add feature|create service|new integration"

phases:
  - id: analysis
    name: Project Analysis
    agents: ["@architect"]
    tasks:
      - "*analyze-project-structure"
    outputs:
      - "project-analysis.md"
      - "recommended-approach.md"
    decision:
      id: research_check
      question: "Is additional research needed?"
      options:
        - value: yes
          next_phase: research
        - value: no
          next_phase: planning

  - id: research
    name: External Research
    agents: ["@analyst"]
    condition: "decision.research_check == yes"
    tasks:
      - "*research {topic}"
    outputs:
      - "research-findings.md"
    next_phase: planning

  # ... remaining phases ...
```

### Registry Index Entry

```yaml
# registry/index.yaml
workflows:
  - id: incremental-feature
    file: incremental-feature.yaml
    triggers:
      - type: manual
        command: "*start incremental-feature"
      - type: context
        pattern: "add.*feature|create.*service"
    confidence_weights:
      command_match: 0.4
      context_match: 0.3
      agent_history: 0.2
      project_state: 0.1
```

---

## Testing

**Validation:**
1. Validate YAML schema compliance
2. Test `*next` detection of incremental-feature context
3. Verify phase transitions work correctly
4. Test decision point branching

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-23 | @sm (River) | Initial draft from WIS-9 investigation |
