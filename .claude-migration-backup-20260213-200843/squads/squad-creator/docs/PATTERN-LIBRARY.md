# Pattern Library - Squad-Creator

**Version:** 1.0
**Last Updated:** 2026-02-10
**Source:** HybridOps Migration

---

## Overview

This document consolidates all patterns, heuristics, veto conditions, quality gates, and axiomas used by the Squad-Creator system.

**Config Files:**
- `config/heuristics.yaml` - 3 decision heuristics (SC_HE_*)
- `config/veto-conditions.yaml` - 10 veto conditions (SC_VC_*)
- `config/axioma-validator.yaml` - 10 axioma dimensions (D1-D10)
- `config/quality-gates.yaml` - 10 quality gates (QG-SC-*)
- `config/task-anatomy.yaml` - 8 mandatory task fields

**Validation:**
- `scripts/coherence-validator.py` - Validates cross-references between configs

---

## Heuristics (SC_HE_*)

Decision heuristics derived from Pedro Valério's mind artifacts.

| ID | Name | Source | Phase | Mode |
|----|------|--------|-------|------|
| SC_HE_001 | Vision Alignment | PV_BS_001 | architecture | `*eng-*` |
| SC_HE_002 | Agent Coherence | PV_PA_001 | agent_creation | `*arq-*` |
| SC_HE_003 | Workflow Automation | PV_PM_001 | workflow_design | `*auto-*` |

### SC_HE_001: Vision Alignment

**When to use:** Before starting any major squad creation
**Decision Tree:**
```
Is vision defined and clear?
├── YES (score >= 7) → PROCEED
├── PARTIAL (score 5-6) → Document gaps, proceed with warning
└── NO (score < 5) → VETO (SC_VC_002)
```

### SC_HE_002: Agent Coherence

**When to use:** During agent creation or validation
**Decision Tree:**
```
Does agent structure align with DNA?
├── Voice + Thinking DNA match → PASS
├── Minor inconsistencies → WARN, suggest fixes
└── Major misalignment → VETO (SC_VC_005)
```

### SC_HE_003: Workflow Automation

**When to use:** During workflow design or audit
**Decision Tree:**
```
Can this step be automated without loss?
├── YES → Implement as Worker/Agent
├── NEEDS JUDGMENT → Implement as Hybrid
└── REQUIRES HUMAN → Keep as Human, document why
```

---

## Veto Conditions (SC_VC_*)

Blocking conditions that MUST be resolved before proceeding.

| Code | Name | Trigger | Resolution |
|------|------|---------|------------|
| SC_VC_001 | Domain Viability | domain_score < 5 | Research more, change scope |
| SC_VC_002 | Vision Clarity | vision_score < 7 | Define clearer objectives |
| SC_VC_003 | Source Quality | sources < 5 per mind | Add more sources |
| SC_VC_004 | DNA Completeness | voice OR thinking missing | Extract missing DNA |
| SC_VC_005 | Agent Coherence | misalignment detected | Realign voice+thinking |
| SC_VC_006 | Smoke Test | any smoke test fails | Fix and re-test |
| SC_VC_007 | Guardrail Missing | no veto condition | Add veto conditions |
| SC_VC_008 | Unidirectional Flow | flow allows backtrack | Redesign flow |
| SC_VC_009 | Axioma Score | D1 < 7.0 | Improve truthfulness |
| SC_VC_010 | Task Anatomy | missing required field | Add missing fields |

### Veto Hierarchy

```
HARD VETO (immediate stop):
  SC_VC_003 (Source Quality) - No sources = no clone
  SC_VC_006 (Smoke Test) - Failed behavior = broken agent
  SC_VC_009 (Axioma D1) - Truthfulness below threshold

SOFT VETO (warn, allow override):
  SC_VC_001 (Domain Viability) - May proceed with reduced scope
  SC_VC_010 (Task Anatomy) - May proceed with documentation
```

---

## Axioma Dimensions (D1-D10)

Based on Pedro Valério's META_AXIOMAS artifact. Each dimension measures a quality aspect.

| ID | Name | Weight | Threshold | VETO Power |
|----|------|--------|-----------|------------|
| D1 | Truthfulness | 1.0 | 7.0 | **YES** |
| D2 | Coherence | 0.9 | 6.0 | No |
| D3 | Strategic Alignment | 0.9 | 6.0 | No |
| D4 | Operational Excellence | 0.8 | 6.0 | No |
| D5 | Innovation Capacity | 0.7 | 5.0 | No |
| D6 | Risk Management | 0.8 | 6.0 | No |
| D7 | Resource Optimization | 0.8 | 6.0 | No |
| D8 | Stakeholder Value | 0.7 | 6.0 | No |
| D9 | Sustainability | 0.7 | 6.0 | No |
| D10 | Adaptability | 0.6 | 5.0 | No |

### D1: Truthfulness (VETO POWER)

The only dimension with automatic veto. If truthfulness < 7.0, entire validation fails.

**Validation Questions:**
- Todas as citações têm [SOURCE:] verificável?
- Os frameworks são documentados ou inventados?
- As inferências estão marcadas como tal?
- Existe evidência para cada claim?

**Red Flags:**
- Citações sem fonte
- Frameworks 'inspirados em' sem documentação
- Afirmações categóricas sem evidência
- Inferências apresentadas como fatos

---

## Quality Gates (QG-SC-*)

Validation checkpoints throughout the workflow.

### Auto Gates (Runtime, <60s)

| ID | Name | Trigger | Validation |
|----|------|---------|------------|
| QG-SC-1.1 | Structure Validation | On artifact creation | YAML syntax, required fields |
| QG-SC-1.2 | Schema Compliance | On artifact creation | task-anatomy fields |
| QG-SC-2.1 | Reference Integrity | On artifact save | All refs exist |
| QG-SC-3.1 | Veto Scan | On checkpoint | No active vetos |
| QG-SC-4.1 | Coherence Check | On validation request | coherence-validator.py |
| QG-SC-4.2 | Axioma Scoring | On validation request | D1-D10 scoring |

### Hybrid Gates (AI + Human, <5min)

| ID | Name | Trigger | Validation |
|----|------|---------|------------|
| QG-SC-5.1 | DNA Review | On DNA extraction complete | AI prepares, human validates |
| QG-SC-5.2 | Smoke Test Review | On smoke test execution | AI runs, human verifies |
| QG-SC-6.1 | Squad Review | On squad completion | Final human approval |
| QG-SC-6.2 | Handoff Review | Before handoff | Validate deliverables |

---

## Task Anatomy (8 Fields)

Every task MUST have these 8 fields:

| # | Field | Type | Description |
|---|-------|------|-------------|
| 1 | task_name | string | Verb + Object (e.g., "Create Agent") |
| 2 | status | enum | draft/ready/in_progress/done/blocked |
| 3 | responsible_executor | string | Who executes (@agent or role) |
| 4 | execution_type | enum | Human/Agent/Hybrid/Worker |
| 5 | estimated_time | string | Duration with unit (e.g., "30 min") |
| 6 | input | array | Required inputs to start |
| 7 | output | array | Expected deliverables |
| 8 | action_items | array | Concrete steps to execute |

**Validation:** SC_VC_010 triggers if any field missing.

---

## Executor Types

Decision tree for choosing executor (from `data/executor-decision-tree.md`):

```
Is output 100% predictable?
├── YES → Can be written as pure function?
│         ├── YES → Library/API exists?
│         │         ├── YES → WORKER
│         │         └── NO → Worth coding (used 3+ times)?
│         │                  ├── YES → WORKER
│         │                  └── NO → AGENT
│         └── NO → (continue to NLP check)
├── NO → Requires NLP interpretation?
│         ├── YES → Error impact significant?
│         │         ├── HIGH → HYBRID
│         │         └── LOW → AGENT
│         └── NO → Requires strategic judgment?
│                  ├── YES → AI can assist?
│                  │         ├── YES → HYBRID
│                  │         └── NO → HUMAN
│                  └── NO → (re-evaluate)
```

| Type | Cost | Speed | Consistency | When |
|------|------|-------|-------------|------|
| Worker | $ | ms-s | 100% | Deterministic transforms |
| Agent | $$$$ | s-min | 85-95% | NLP, analysis, generation |
| Hybrid | $$ | min-h | 95%+ | Critical output, human review |
| Human | $$$ | h-days | Variable | Strategic, interpersonal |

---

## Cross-Reference Map

How configs reference each other:

```
heuristics.yaml
├── SC_HE_001 → veto_on_fail: SC_VC_002
├── SC_HE_002 → veto_on_fail: SC_VC_005
└── SC_HE_003 → veto_on_fail: SC_VC_007

axioma-validator.yaml
├── D1_truthfulness → maps_to_veto: SC_VC_003
└── D1_truthfulness → maps_to_veto: SC_VC_009

quality-gates.yaml
├── QG-SC-3.1 → checks: veto-conditions.yaml
├── QG-SC-4.1 → runs: coherence-validator.py
└── QG-SC-4.2 → uses: axioma-validator.yaml
```

**Validation Command:**
```bash
python scripts/coherence-validator.py
```

---

## Usage in Workflows

### In wf-create-squad.yaml

```yaml
# Phase 1: Research
heuristic:
  id: SC_RES_001  # Legacy, maps to SC_HE_001
  blocking: true
  veto_conditions:
    - SC_VC_002  # Vision Clarity
    - SC_VC_003  # Source Quality

# Phase 5: Validation
quality_gates:
  - QG-SC-4.1  # Coherence Check
  - QG-SC-4.2  # Axioma Scoring
  - QG-SC-6.1  # Final Human Approval
```

### In Agent Definitions

```yaml
# In squad-chief.md or any agent
quality_standards:
  agents:
    required:
      - "voice_dna com signature phrases rastreáveis a [SOURCE:]"  # D1
      - "thinking_dna com heuristics que têm QUANDO usar"  # SC_HE_*
      - "3 smoke tests que PASSAM"  # SC_VC_006
      - "handoffs definidos"  # SC_HE_002
```

---

## Validation Report Example

```
======================================================================
COHERENCE VALIDATOR - Squad-Creator Configs
======================================================================
Config dir: /squads/squad-creator/config
Strict mode: False

CONFIGS LOADED:
  ✓ heuristics.yaml
  ✓ veto-conditions.yaml
  ✓ axioma-validator.yaml
  ✓ quality-gates.yaml
  ✓ task-anatomy.yaml

VALIDATIONS:
  ✓ heuristic_veto_coverage
      Heuristics with veto: 3/3
  ✓ axioma_threshold_coverage
      Dimensions defined: 10/10
  ✓ gate_reference_validity
      Invalid references found: 0
  ✓ veto_code_uniqueness
      Unique veto codes: 10, Duplicates: 0
  ✓ executor_consistency
      Valid executor types: ['Worker', 'Agent', 'Hybrid', 'Human']
  ✓ cross_reference_integrity
      Total unique IDs across configs: 53

======================================================================
STATUS: ✓ PASS
  Rules: 6 | Passed: 6 | Failed: 0 | Warnings: 0 | Skipped: 0
======================================================================
```

---

## Migration from HybridOps

Patterns migrated from HybridOps to Squad-Creator:

| HybridOps Pattern | Squad-Creator Equivalent |
|-------------------|-------------------------|
| HO-VC-* | SC_VC_* (10 veto conditions) |
| HO-HE-* | SC_HE_* (3 heuristics) |
| HO-QG-* | QG-SC-* (10 quality gates) |
| executor-matrix-framework.md | task-anatomy.yaml + executor-decision-tree.md |
| META_AXIOMAS.md | axioma-validator.yaml (D1-D10) |

**Full migration roadmap:** `docs/MIGRATION-ROADMAP-HYBRIDOPS.md`

---

*Pattern Library v1.0*
*Last Updated: 2026-02-10*
*Executor: Pedro Valério (Process Absolutist)*
