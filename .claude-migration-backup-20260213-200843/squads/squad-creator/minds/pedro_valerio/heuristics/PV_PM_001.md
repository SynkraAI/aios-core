# PV_PM_001 - Automation Tipping Point

**Type:** Decision Heuristic
**Phase:** 4 (Workflows)
**Agent:** @hybridOps:workflow-designer
**Pattern:** HO-PP-003 (Quality Gate Pattern)

## Purpose

Determine when to automate processes based on frequency, systemic impact, and standardization level. Implements the "Automation Before Delegation" principle with safety guardrails.

## Configuration

```yaml
PV_PM_001:
  name: "Automation Tipping Point"
  phase: 4
  pattern_reference: "HO-PP-003"

  weights:
    task_systemic_impact: 0.9
    task_automatability: 0.8
    task_frequency: 0.7
    guardrails_present: 1.0  # VETO power

  thresholds:
    systemic_impact: 0.6  # For primary time allocation
    automatability: 0.5   # For immediate removal from agenda
    frequency: "2x per month"  # Minimum for automation justification
    standardization: 0.7  # Process must be standardized

  veto_conditions:
    - condition: "guardrails_missing = true"
      action: "VETO - Define safety guardrails first"
    - condition: "frequency < 1x per month AND impact < 0.5"
      action: "VETO - Not worth automating"

  output:
    type: "decision"
    values: ["AUTOMATE", "DELEGATE", "ELIMINATE", "KEEP_MANUAL"]
```

## Application

**Input:** Workflow definitions, task frequency data, process maps
**Process:** Evaluate automation potential for each workflow step
**Output:** AUTOMATE | DELEGATE | ELIMINATE | KEEP_MANUAL

## Decision Tree

```
PRIMARY BRANCH:
  IF (task_automatability > 0.5)
    THEN AUTOMATE/DELEGATE

SECONDARY BRANCH:
  ELSE IF (task_systemic_impact > 0.6)
    THEN ALLOCATE_DEEP_WORK_TIME (keep for humans)

TERMINATION: All tasks are either high-impact or automated/delegated
CONSTRAINT: NEVER automate without guardrails
```

## The Automation Mandate

```yaml
automation_mandate:
  rule_1:
    trigger: "Task repeated 2+ times"
    action: "Document and automate"

  rule_2:
    trigger: "Task repeated 3+ times without automation"
    assessment: "Grave design failure"
    action: "Immediate remediation required"

  rule_3:
    trigger: "Any automation"
    requirement: "Must have guardrails, idempotency, logs, and manual escape route"
```

## Automation Readiness Criteria

| Criterion | Weight | Threshold | Description |
|-----------|--------|-----------|-------------|
| Task Frequency | 0.7 | >2x/month | How often does this task occur? |
| Systemic Impact | 0.9 | ≥0.6 | Impact on long-term system creation |
| Automatability | 0.8 | ≥0.5 | How easily can this be automated? |
| Standardization | 0.7 | ≥0.7 | Is the process well-defined? |
| Guardrails Present | 1.0 | Required | Safety mechanisms in place? |

## Guardrails Requirements

```yaml
automation_guardrails:
  required:
    - loop_prevention: "Deduplication and max iteration limits"
    - idempotency: "Same input always produces same output"
    - audit_trail: "Log of last agent/event"
    - manual_escape: "Human override route available"
    - retry_logic: "Graceful failure handling"

  validation:
    - "Can a human intervene at any point?"
    - "Are all state changes logged?"
    - "Is there a rollback mechanism?"
    - "Are rate limits implemented?"
```

## Performance Metrics

```yaml
performance:
  decision_speed: "Seconds"
  accuracy_rate: "98%"
  confidence_level: "100%"
  resource_efficiency: 9/10
```

## Failure Modes

### Over-Automation
- **Trigger:** Automating everything without considering human judgment needs
- **Manifestation:** Critical decisions made by automation that require nuance
- **Detection:** Quality issues in outputs, edge cases mishandled
- **Recovery:** Add human review checkpoints
- **Prevention:** Always evaluate if task requires human judgment

### Under-Automation
- **Trigger:** Fear of complexity or change resistance
- **Manifestation:** Manual repetitive work continues despite clear automation opportunity
- **Detection:** Team burnout, inconsistent outputs, scaling bottlenecks
- **Recovery:** Apply the "2x rule" rigorously
- **Prevention:** Regular process audits for automation candidates

## Behavioral Evidence

**Example:** Building integrated lifestyle (home, office, leisure in same location)
- **Context:** Life and daily routine planning
- **Information Available:** "Commute" task has zero systemic impact and cannot be automated
- **Heuristic Application:** Task 'commute' has systemic impact = 0, not automatable, so must be ELIMINATED. Task 'being with children' has high family system impact.
- **Outcome:** Elimination of commute time, maximization of focus time and family time

## Integration with HO-PP-003

This heuristic integrates with the Quality Gate Pattern at Phase 4:

```yaml
checkpoint:
  id: "automation-readiness"
  heuristic: PV_PM_001
  phase: 4

  criteria:
    - metric: "task_frequency"
      threshold: "2x per month"
      operator: ">"
    - metric: "guardrails_present"
      required: true
    - metric: "standardization_level"
      threshold: 0.7
      operator: ">="

  veto_conditions:
    - condition: "guardrails_missing"
      action: "VETO - Define safety guardrails first"

  validation_questions:
    - "Are automations triggered frequently enough to justify?"
    - "Are all safety guardrails in place?"
    - "Is the workflow sufficiently standardized?"

  pass_action: "Proceed to Phase 5 (Task Definitions)"
  fail_action: "Add guardrails or reduce automation scope"
```

## Automation Decision Matrix

| Frequency | Impact | Automatability | Decision |
|-----------|--------|----------------|----------|
| High (>4x/month) | High | High | **AUTOMATE** immediately |
| High | High | Low | **DELEGATE** with training |
| High | Low | High | **AUTOMATE** (efficiency) |
| Low (<2x/month) | High | Any | **KEEP_MANUAL** (judgment needed) |
| Low | Low | Any | **ELIMINATE** |
| Any | Any | Any (no guardrails) | **VETO** - add guardrails first |

---

**Pattern Compliance:** HO-PP-003 (Quality Gate) ✓ | HO-AP-XXX (Automation Patterns) ✓
**Source:** PV Mind Artifacts - Heurísticas de Decisão
