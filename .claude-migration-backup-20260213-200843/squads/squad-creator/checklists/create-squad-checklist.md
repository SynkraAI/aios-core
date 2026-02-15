# Create Squad Checklist

```yaml
checklist:
  id: create-squad-checklist
  version: 1.0.0
  created: 2026-02-10
  purpose: "Validate complete squad creation meets AIOS standards"
  mode: blocking
  task_reference: tasks/create-squad.md
```

---

## Pre-Creation Requirements

```yaml
pre_creation:
  - id: domain-viable
    check: "Domain has sufficient documented methodologies"
    type: blocking
    validation: "viability_score >= 6"

  - id: use-cases-defined
    check: "3-5 key use cases defined"
    type: blocking
    min: 3
    max: 5

  - id: no-duplicate-squad
    check: "No existing squad with > 80% overlap"
    type: blocking
    validation: "overlap_check returns < 80%"
```

---

## Phase 0: Discovery

```yaml
discovery_checks:
  - id: pack-name-valid
    check: "Pack name is kebab-case"
    type: blocking
    pattern: "^[a-z]+(-[a-z]+)*$"

  - id: slash-prefix-valid
    check: "Slash prefix is camelCase"
    type: blocking
    pattern: "^[a-z]+([A-Z][a-z]+)*$"

  - id: config-created
    check: "config.yaml created with required fields"
    type: blocking
    required_fields: ["name", "version", "author", "entry_agent", "slashPrefix"]
```

---

## Phase 1: Research

```yaml
research_checks:
  - id: minds-found
    check: "5+ elite minds identified"
    type: blocking
    min: 5

  - id: frameworks-documented
    check: "Each mind has documented frameworks"
    type: blocking
    validation: "frameworks_per_mind >= 1 for all"

  - id: tier-0-covered
    check: "At least 1 mind classified as Tier 0 (diagnostic)"
    type: blocking
    validation: "tier_0_count >= 1"

  - id: use-cases-coverage
    check: "Minds cover 80%+ of use cases"
    type: blocking
    threshold: 80
```

---

## Phase 2: Architecture

```yaml
architecture_checks:
  - id: tier-structure-defined
    check: "Tier structure (0-3) defined"
    type: blocking
    tiers: [0, 1, 2, 3]

  - id: orchestrator-planned
    check: "Orchestrator agent planned"
    type: blocking
    validation: "orchestrator in architecture"

  - id: handoff-map-complete
    check: "Handoff map defines all transitions"
    type: blocking
    validation: "all agents have handoff_to defined"

  - id: quality-gates-defined
    check: "3+ quality gates defined"
    type: blocking
    min: 3
```

---

## Phase 3: Creation

```yaml
creation_checks:
  - id: directory-structure
    check: "All required directories created"
    type: blocking
    directories: ["agents/", "tasks/", "workflows/", "templates/", "checklists/", "data/", "docs/"]

  - id: orchestrator-created
    check: "Orchestrator agent file exists"
    type: blocking
    validation: "agents/{pack_name}-chief.md exists"

  - id: tier-0-agents
    check: "At least 1 Tier 0 agent created"
    type: blocking
    min: 1

  - id: agents-pass-quality
    check: "All agents pass SC_AGT_001 quality gate"
    type: blocking
    gate: "SC_AGT_001"

  - id: workflows-have-checkpoints
    check: "All workflows have checkpoint definitions"
    type: blocking
    validation: "grep 'checkpoint:' returns match for each workflow"
```

---

## Phase 4: Integration

```yaml
integration_checks:
  - id: dependencies-wired
    check: "All agent dependencies exist"
    type: blocking
    validation: "all files in dependencies[] exist"

  - id: readme-complete
    check: "README.md has all required sections"
    type: blocking
    sections: ["overview", "installation", "quick_start", "agents_list"]

  - id: config-valid
    check: "config.yaml passes YAML lint"
    type: blocking
    validation: "yamllint passes"
```

---

## Phase 5: Validation

```yaml
validation_checks:
  - id: checklist-pass
    check: "Squad passes squad-checklist.md"
    type: blocking
    checklist: "checklists/squad-checklist.md"

  - id: quality-score
    check: "Quality dimensions score >= 7.0"
    type: blocking
    threshold: 7.0

  - id: no-blocking-issues
    check: "No blocking issues remain"
    type: blocking
    validation: "blocking_issues_count == 0"
```

---

## Final Metrics

```yaml
final_metrics:
  - agents_created: "count"
  - total_lines: "sum across all files"
  - quality_score: "average of all components"
  - use_cases_coverage: "percentage"
```

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 100% Blocking | PASS | Squad ready for use |
| 90%+ Blocking | CONDITIONAL | Document gaps, usable with warnings |
| <90% Blocking | FAIL | Fix issues before handoff |

---

**Version:** 1.0.0
**Created:** 2026-02-10
**Task Reference:** tasks/create-squad.md
