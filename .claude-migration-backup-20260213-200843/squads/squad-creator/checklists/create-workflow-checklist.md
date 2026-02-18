# Create Workflow Checklist

```yaml
checklist:
  id: create-workflow-checklist
  version: 1.0.0
  created: 2026-02-10
  purpose: "Validate workflow creation meets AIOS quality standards"
  mode: blocking
  task_reference: tasks/create-workflow.md
```

---

## Pre-Creation Requirements

```yaml
pre_creation:
  - id: workflow-needed
    check: "Operation requires 3+ phases or multiple agents"
    type: blocking
    validation: "phases >= 3 OR agents_involved >= 2"

  - id: not-atomic
    check: "Operation is NOT atomic (use task instead)"
    type: blocking
    validation: "complexity warrants workflow, not simple task"

  - id: pack-exists
    check: "Target pack exists"
    type: blocking
    validation: "squads/{pack_name}/ exists"
```

---

## Structure Validation

```yaml
structure_checks:
  - id: min-lines
    check: "Workflow file has 500+ lines"
    type: blocking
    validation: "wc -l {file} >= 500"

  - id: yaml-valid
    check: "YAML syntax is valid"
    type: blocking
    validation: "yamllint passes"

  - id: min-phases
    check: "Workflow has 3+ phases"
    type: blocking
    min: 3

  - id: workflow-id-exists
    check: "workflow-id field is defined"
    type: blocking
    field: "workflow-id"

  - id: version-exists
    check: "version field is defined"
    type: blocking
    field: "version"
```

---

## Phase Structure

```yaml
phase_checks:
  - id: phases-sequential
    check: "Phases have clear sequential order"
    type: blocking
    validation: "phase numbers are sequential (0, 1, 2, ...)"

  - id: phase-has-name
    check: "Each phase has name and purpose"
    type: blocking
    required_fields: ["name", "purpose"]

  - id: phase-has-duration
    check: "Each phase has estimated duration"
    type: recommended
    field: "duration"

  - id: phase-has-steps
    check: "Each phase has defined steps"
    type: blocking
    validation: "steps array exists for each phase"
```

---

## Checkpoint Validation

```yaml
checkpoint_checks:
  - id: checkpoints-exist
    check: "Workflow has checkpoint definitions"
    type: blocking
    validation: "checkpoint: keyword exists"

  - id: checkpoint-has-criteria
    check: "Each checkpoint has pass criteria"
    type: blocking
    field: "criteria"

  - id: blocking-checkpoints
    check: "At least 1 blocking checkpoint exists"
    type: blocking
    validation: "blocking: true exists in at least 1 checkpoint"

  - id: checkpoint-actions
    check: "Checkpoints define action_if_fail"
    type: recommended
    field: "action_if_fail"
```

---

## Fallback Rules

```yaml
fallback_checks:
  - id: fallback-defined
    check: "Fallback rules defined for critical phases"
    type: blocking
    validation: "fallback: or rework: sections exist"

  - id: retry-logic
    check: "Retry logic defined with max iterations"
    type: recommended
    fields: ["max_iterations", "retry_max"]

  - id: escalation-path
    check: "Escalation path defined for failures"
    type: recommended
    validation: "ESCALATE: or escalate_to: exists"
```

---

## Input/Output Validation

```yaml
io_checks:
  - id: inputs-defined
    check: "Required and optional inputs defined"
    type: blocking
    sections: ["inputs.required", "inputs.optional"]

  - id: outputs-defined
    check: "Expected outputs defined per phase"
    type: blocking
    validation: "output: section exists"

  - id: output-files-specified
    check: "Output file locations specified"
    type: recommended
    fields: ["file", "location"]
```

---

## Agent Integration

```yaml
agent_checks:
  - id: specialists-defined
    check: "Specialist agents defined if needed"
    type: recommended
    section: "specialists"

  - id: handoffs-clear
    check: "Agent handoffs are clearly defined"
    type: blocking
    validation: "handoff_to or depends_on defined"

  - id: agent-guidance
    check: "Specialist guidance provided"
    type: recommended
    field: "specialist_guidance"
```

---

## Quality Gates

```yaml
quality_gate_checks:
  - id: quality-gates-summary
    check: "Quality gates summary section exists"
    type: recommended
    section: "quality_gates"

  - id: heuristics-referenced
    check: "Relevant heuristics referenced"
    type: recommended
    validation: "heuristic: or heuristic_id: exists"

  - id: veto-conditions
    check: "Veto conditions referenced where appropriate"
    type: recommended
    validation: "veto_check: or veto_conditions: exists"
```

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 100% Blocking + 80% Recommended | EXCELLENT | Ready for production |
| 100% Blocking + 50% Recommended | GOOD | Document gaps, usable |
| 100% Blocking + <50% Recommended | CONDITIONAL | Improve fallback coverage |
| <100% Blocking | FAIL | Fix blocking items |

---

**Version:** 1.0.0
**Created:** 2026-02-10
**Task Reference:** tasks/create-workflow.md
