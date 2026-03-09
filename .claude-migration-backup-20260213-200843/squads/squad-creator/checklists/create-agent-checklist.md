# Create Agent Checklist

```yaml
checklist:
  id: create-agent-checklist
  version: 1.0.0
  created: 2026-02-10
  purpose: "Validate agent creation process completeness"
  mode: blocking
  task_reference: tasks/create-agent.md
```

---

## Pre-Creation Requirements

```yaml
pre_creation:
  - id: research-complete
    check: "Research phase completed before agent creation"
    type: blocking
    validation: "mind_research.md or equivalent exists"

  - id: mind-identified
    check: "Target mind/expert identified with verifiable work"
    type: blocking
    validation: "mind_name is real person with documented methodologies"

  - id: sources-collected
    check: "Minimum 5 sources collected and classified"
    type: blocking
    validation: "sources_inventory.yaml exists with >= 5 sources"
```

---

## Phase 0: Context Validation

```yaml
context_checks:
  - id: pack-exists
    check: "Target pack exists at squads/{pack_name}/"
    type: blocking
    validation: "ls squads/{pack_name}/ succeeds"

  - id: tier-classification
    check: "Agent tier (0, 1, 2, 3) determined based on role"
    type: blocking
    validation: "tier in [0, 1, 2, 3]"

  - id: no-duplicate
    check: "Agent with same id doesn't already exist"
    type: blocking
    validation: "squads/{pack_name}/agents/{agent_id}.md doesn't exist"
```

---

## Phase 1: DNA Extraction

```yaml
dna_extraction:
  - id: voice-dna-complete
    check: "Voice DNA extracted with 10+ power words"
    type: blocking
    validation: "voice_dna.yaml contains >= 10 power_words"

  - id: thinking-dna-complete
    check: "Thinking DNA extracted with primary framework"
    type: blocking
    validation: "thinking_dna.yaml contains primary_framework with 3+ steps"

  - id: citations-present
    check: "DNA includes citations [SOURCE: page/minute]"
    type: recommended
    validation: "grep '[SOURCE:' returns >= 15 matches"

  - id: signature-phrases
    check: "5+ signature phrases documented"
    type: blocking
    validation: "signature_phrases count >= 5"
```

---

## Phase 2: Agent Structure

```yaml
structure_checks:
  - id: min-lines
    check: "Agent file has 300+ lines"
    type: blocking
    validation: "wc -l {file} >= 300"

  - id: all-levels-present
    check: "All 6 levels present (Identity, Operational, Voice, Quality, Credibility, Integration)"
    type: blocking
    validation: "grep for all level headers"

  - id: persona-complete
    check: "Persona has role, style, identity, focus"
    type: blocking
    sections: ["role", "style", "identity", "focus"]

  - id: core-principles
    check: "5-9 core principles defined"
    type: blocking
    min: 5
    max: 9

  - id: commands-defined
    check: "Commands section with *help and *exit"
    type: blocking
    required: ["*help", "*exit"]
```

---

## Phase 3: Quality Assurance

```yaml
quality_checks:
  - id: output-examples
    check: "3+ complete output examples"
    type: blocking
    min: 3
    fields: ["task", "input", "output"]

  - id: anti-patterns
    check: "5+ never_do anti-patterns documented"
    type: blocking
    min: 5

  - id: handoff-defined
    check: "Handoff triggers and targets defined"
    type: blocking
    validation: "handoff_to has >= 1 entry"

  - id: objection-algorithms
    check: "3+ objection responses documented"
    type: recommended
    min: 3
```

---

## Phase 4: Smoke Test

```yaml
smoke_test:
  - id: domain-knowledge
    check: "Agent demonstrates domain expertise when asked"
    type: blocking
    prompt: "Explain your primary framework"
    validates: ["Uses power_words", "Uses signature_phrases"]

  - id: decision-making
    check: "Agent applies documented heuristics"
    type: blocking
    prompt: "How would you approach [domain scenario]?"
    validates: ["Applies framework", "Shows conviction"]

  - id: objection-handling
    check: "Agent responds to challenges appropriately"
    type: blocking
    prompt: "I disagree with your approach because..."
    validates: ["Recognizes objection", "Maintains position"]
```

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 100% Blocking | PASS | Proceed with integration |
| 80%+ Blocking | CONDITIONAL | Document gaps, proceed |
| <80% Blocking | FAIL | Fix issues, re-run checklist |

---

**Version:** 1.0.0
**Created:** 2026-02-10
**Task Reference:** tasks/create-agent.md
