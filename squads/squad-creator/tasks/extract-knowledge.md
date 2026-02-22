---
task: Extract Knowledge (Framework → SOP → Checklist)
execution_type: Agent
responsavel: "@tim-ferriss"
responsavel_type: agent
atomic_layer: task
elicit: true
phase: discovery

# Dependencies
workflows:
  - wf-extraction-pipeline
templates:
  - pop-extractor-prompt
config:
  - squad-config
---

# Extract Knowledge from Author Sources

**Squad:** squad-creator
**Phase:** Discovery
**Agent:** @tim-ferriss
**Workflow:** wf-extraction-pipeline
**Pattern:** Zero Invention - 100% Source-Based Extraction

## Purpose

Extract complete knowledge triplet (Framework + SOP + Checklist) from author/expert source materials. Guarantees ZERO invented content - every statement must have a literal citation from the source material.

**Core Principle:** "Se não está na fonte, não existe no output."

## Task Anatomy (HO-TP-001)

| Field | Value |
|-------|-------|
| task_name | Extract Knowledge from Author Sources |
| status | pending |
| responsible_executor | @tim-ferriss |
| execution_type | Hybrid (Agent extracts, Human validates) |
| estimated_time | 2-4h per triplet |
| input | author_name, topic, sources_path |
| output | framework.md, sop.md, blueprint.yaml, checklist.md |
| action_items | See Execution section |
| acceptance_criteria | All gates passed, 50+ citations, zero invention |

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| author_name | string | Yes | Author/expert name (e.g., "Alex Hormozi") |
| topic | string | Yes | Specific topic to extract (e.g., "Value Equation") |
| sources_path | path | Yes | Path to source materials (books, transcripts, etc.) |
| output_squad | string | No | Target squad (default: inferred from author) |
| format | enum | No | `triplet` (default), `framework`, `sop`, `checklist` |
| depth | enum | No | `quick`, `standard` (default), `deep` |

## Outputs

| Output | Type | Location | Description |
|--------|------|----------|-------------|
| framework | MD | `squads/{squad}/docs/frameworks/{topic}-framework.md` | Conceptual model (formulas, principles) |
| sop | MD | `squads/{squad}/docs/sops/{topic}-sop.md` | Operational process (steps, executors) |
| blueprint | YAML | `squads/{squad}/docs/sops/{topic}-squad-blueprint.yaml` | Agent configuration |
| checklist | MD | `squads/{squad}/checklists/{topic}-sop-checklist.md` | Validation checklist |

---

## Execution

### Phase 0: Source Validation (BLOCKING)

**Gate:** SOURCE_COVERAGE
**Duration:** 15-30 min

#### Step 0.1: Inventory Sources

```yaml
action: "List all available source files"
command: "ls -la {sources_path}"
output:
  - file_list
  - total_pages_or_minutes
  - source_types
```

#### Step 0.2: Relevance Classification

For each source, evaluate:

| Criterion | Question | Score |
|-----------|----------|-------|
| Direct mention | Source mentions {topic} by name? | 0-3 |
| Process explained | Author explains how to do it? | 0-3 |
| Examples given | Practical examples included? | 0-2 |
| Quotable content | Has usable quotes? | 0-2 |

**Threshold:** Include sources with score ≥ 5/10

#### Step 0.3: Coverage Validation

```yaml
minimum_requirements:
  pages_or_minutes: 5+
  direct_quotes: 3+
  practical_examples: 2+
  framework_identifiable: true

decision:
  GO: "4/4 requirements met"
  CONDITIONAL: "3/4 + acquisition plan"
  NO_GO: "<3/4 → STOP, get more sources"
```

**Elicit if NO_GO:**
```
❌ Fontes insuficientes para extração de "{topic}".

Faltam:
- [ ] Mais X páginas/minutos de conteúdo
- [ ] Citações diretas sobre o tema
- [ ] Exemplos práticos do autor

Opções:
1. Fornecer fontes adicionais
2. Pesquisar por mais material (Deep Research)
3. Ajustar escopo do topic
```

**Output:** `source_inventory.yaml`

---

### Phase 1: Framework Extraction

**Gate:** FRAMEWORK_QUALITY
**Duration:** 30-60 min
**Skip if:** format == 'sop' OR format == 'checklist'

#### Step 1.1: Identify Core Formula

```yaml
question: "O autor resume o conceito em uma fórmula/equação?"
search_patterns:
  - "equals", "is", "formula", "equation"
  - Mathematical notation
  - "X = Y / Z" patterns
output:
  core_formula: "[extracted formula]"
  source: "[SOURCE: page/minute]"
```

**Example:**
```
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
[SOURCE: $100M Offers, Chapter 6, p.47]
```

#### Step 1.2: Map Components/Pillars

```yaml
question: "Quais são os elementos fundamentais do framework?"
search_patterns:
  - "The X pillars", "The X steps"
  - Numbered lists
  - "First... Second... Third..."
output:
  components:
    - name: "[Component name]"
      description: "[Author's description]"
      source: "[SOURCE: page/minute]"
```

#### Step 1.3: Extract Principles/Axioms

```yaml
question: "Quais verdades o autor considera absolutas?"
search_patterns:
  - "Always...", "Never..."
  - "The key is...", "The secret is..."
  - Emphasized statements
output:
  principles:
    - principle: "[Exact quote]"
      context: "[When it applies]"
      source: "[SOURCE: page/minute]"
```

#### Step 1.4: Document Relationships

```yaml
question: "Como os componentes se conectam?"
output:
  relationships:
    - from: "[Component A]"
      to: "[Component B]"
      relation: "[increases/decreases/enables/blocks]"
      source: "[SOURCE: page/minute]"
```

#### Step 1.5: Collect Author Examples

```yaml
question: "Como o autor demonstra o framework?"
requirement: "ONLY examples from the author - NEVER invented"
output:
  examples:
    - scenario: "[What the author described]"
      application: "[How framework was applied]"
      result: "[Outcome mentioned]"
      source: "[SOURCE: page/minute]"
```

#### Step 1.6: Compile Literal Quotes

```yaml
requirement: "Minimum 15 quotes with [SOURCE: page/minute]"
format: |
  > "[Exact quote from author]"
  > — {author_name}, [SOURCE: book/video, page/minute]
```

#### Framework Quality Gate

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| Core formula | Identified with citation | [ ] |
| Components | 3+ documented | [ ] |
| Principles | 5+ extracted | [ ] |
| Examples | 3+ from author (not invented) | [ ] |
| Quotes | 15+ with sources | [ ] |
| Zero invention | No unsourced claims | [ ] |

**Threshold:** 6/6 required

**Output:** `{topic}-framework.md`

---

### Phase 2: SOP Extraction

**Gate:** SOP_QUALITY
**Duration:** 45-90 min
**Depends on:** Phase 1 (if triplet mode)
**Skip if:** format == 'framework' OR format == 'checklist'

#### Step 2.1: Identify Author's Process

```yaml
question: "O autor descreve uma sequência de ações?"
search_patterns:
  - "First... Then... Finally..."
  - "Step 1... Step 2..."
  - "Start by... Next... End with..."
sources:
  - Framework from Phase 1
  - Practical examples in source material
output:
  process_outline:
    - phase: "[Phase name]"
      steps: ["Step 1", "Step 2", ...]
      source: "[SOURCE: page/minute]"
```

#### Step 2.2: Decompose into Atomic Steps

For each identified step:

```yaml
step_template:
  step_number: X
  step_name: "[Verb] + [Object]"

  # 8-Field Task Anatomy
  description: "[What to do - from author]"
  cognitive_type: "Perception|Analysis|Synthesis|Judgment|Creativity|Memory|Empathy|Accountability"
  automation_potential: "High|Medium|Low"
  executor: "Human|Agent|Worker|Hybrid"
  precondition: "[What must exist before]"
  output: "[What is produced]"
  guardrails: "[Limits and validations]"
  decision_rule: "IF [condition] THEN [next step]"

  # Source tracking
  source: "[SOURCE: page/minute]"
```

**Cognitive Type Guide:**

| Author Signal | Cognitive Type |
|---------------|----------------|
| "Look at...", "Notice..." | Perception |
| "Remember that...", "Recall..." | Memory |
| "Compare...", "Evaluate..." | Analysis |
| "Combine...", "Create..." | Synthesis |
| "Decide...", "Choose..." | Judgment |
| "Invent...", "Brainstorm..." | Creativity |
| "Understand their...", "Feel..." | Empathy |
| "Track...", "Measure..." | Accountability |

#### Step 2.3: Extract Decision Rules

```yaml
question: "Onde o autor indica decisões/bifurcações?"
search_patterns:
  - "If... then..."
  - "When... do..."
  - "Depends on..."
  - "Unless..."
format: |
  RULE: [Rule name]
  IF: [Condition from author]
  THEN: [Action from author]
  ELSE: [Alternative from author]
  SOURCE: [page/minute]
```

#### Step 2.4: Document Exceptions

```yaml
question: "O autor menciona casos especiais?"
search_patterns:
  - "Except when..."
  - "Unless..."
  - "The only time..."
  - "Never do this if..."
output:
  exceptions:
    - scenario: "[Exception scenario]"
      handling: "[What to do instead]"
      source: "[SOURCE: page/minute]"
```

#### Step 2.5: Define Expected Outputs

```yaml
question: "O que cada fase produz?"
output:
  phase_outputs:
    - phase: "[Phase name]"
      deliverable: "[What is produced]"
      format: "[How it looks]"
      source: "[SOURCE: page/minute]"
```

#### Step 2.6: Compile Appendix D

```yaml
requirement: "50+ references with [SOURCE: page/minute]"
format: |
  | ID | Quote/Reference | Source | Page/Min | SOP Section |
  |----|-----------------|--------|----------|-------------|
  | 001 | "[Quote]" | [Book/Video] | p.47 | Part 5, Step 3 |
```

#### SOP Quality Gate

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| Steps documented | 8+ steps | [ ] |
| Task Anatomy | 8 fields per step | [ ] |
| Decision rules | All forks covered | [ ] |
| Appendix D | 50+ references | [ ] |
| Zero invention | All steps sourced | [ ] |
| Logical flow | Start to finish | [ ] |

**Threshold:** 6/6 required

**Output:**
- `{topic}-sop.md`
- `{topic}-squad-blueprint.yaml`

---

### Phase 3: Checklist Generation

**Gate:** CHECKLIST_QUALITY
**Duration:** 15-30 min
**Depends on:** Phase 2
**Skip if:** format == 'framework' OR format == 'sop'

#### Step 3.1: Read Complete SOP

```yaml
action: "Load SOP from Phase 2"
input: "{topic}-sop.md"
extract:
  - all_steps
  - all_preconditions
  - all_outputs
  - all_guardrails
  - all_decision_rules
```

#### Step 3.2: Generate Step Checkboxes

For each SOP step:

```markdown
### Step X: [Step Name]

**Preconditions:**
- [ ] [Precondition 1 from SOP]
- [ ] [Precondition 2 from SOP]

**Execution:**
- [ ] [Action item 1 from SOP]
- [ ] [Action item 2 from SOP]

**Output Validation:**
- [ ] [Output 1] produced
- [ ] [Output 1] meets [quality criteria from SOP]

**Guardrails:**
- [ ] [Guardrail 1] verified
- [ ] [Guardrail 2] verified
```

#### Step 3.3: Generate Gate Checkboxes

For each quality gate in SOP:

```markdown
### Quality Gate: [Gate Name]

- [ ] [Criterion 1 from SOP]
- [ ] [Criterion 2 from SOP]
- [ ] [Criterion 3 from SOP]
- [ ] Minimum score achieved: [X/Y]

**Decision:**
- [ ] PASS → Proceed to next phase
- [ ] FAIL → Return to [step] for remediation
```

#### Step 3.4: Validate 1:1 Correspondence

```yaml
validation:
  for_each_checkbox:
    - has_corresponding_sop_element: true
    - source_traceable: true
  for_each_sop_step:
    - has_checkbox_coverage: true
  invented_checkboxes: 0
```

#### Checklist Quality Gate

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| Step coverage | 100% of SOP steps | [ ] |
| Checkbox mapping | Each → SOP element | [ ] |
| Zero invention | No "safety" additions | [ ] |
| Gates included | All quality gates | [ ] |
| Logical sequence | Matches SOP order | [ ] |

**Threshold:** 5/5 required

**Output:** `{topic}-sop-checklist.md`

---

## Anti-Invention Validation

**Run after each phase:**

### Framework Anti-Invention Check

- [ ] Every formula has literal citation?
- [ ] Every principle comes from author quote?
- [ ] Every example is from author (not invented)?
- [ ] No generic "best practices" added?
- [ ] 15+ quotes with [SOURCE: page/minute]?

### SOP Anti-Invention Check

- [ ] Every step has author example or instruction?
- [ ] Appendix D has 50+ references?
- [ ] No steps from "general experience"?
- [ ] Decision rules extracted from author?
- [ ] Guardrails based on author warnings?

### Checklist Anti-Invention Check

- [ ] Every checkbox maps to SOP step?
- [ ] No "safety" checkboxes invented?
- [ ] Sequence reflects SOP faithfully?

---

## Validation

**Validation Type:** Human review required

**Final Validation Checklist:**

- [ ] Phase 0: SOURCE_COVERAGE gate passed
- [ ] Phase 1: FRAMEWORK_QUALITY gate passed (if applicable)
- [ ] Phase 2: SOP_QUALITY gate passed (if applicable)
- [ ] Phase 3: CHECKLIST_QUALITY gate passed (if applicable)
- [ ] Anti-invention checks: ALL passed
- [ ] Appendix D: 50+ citations present
- [ ] Triplet files: All created in correct locations

**Quality Gate Summary:**

| Gate | Phase | Blocking | Status |
|------|-------|----------|--------|
| SOURCE_COVERAGE | 0 | Yes | [ ] |
| FRAMEWORK_QUALITY | 1 | Yes | [ ] |
| SOP_QUALITY | 2 | Yes | [ ] |
| CHECKLIST_QUALITY | 3 | Yes | [ ] |

---

## Handoff

```yaml
handoff:
  to: "create-squad OR validate-squad"
  trigger: "all_gates_passed = true"
  data_transferred:
    - framework.md
    - sop.md
    - blueprint.yaml
    - checklist.md
  validation: "Human confirms zero invention"
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| SOURCE_COVERAGE failed | Insufficient material | Request more sources, run Deep Research |
| FRAMEWORK_QUALITY failed | Missing citations | Return to sources, find literal quotes |
| SOP_QUALITY failed | <50 references | Expand Appendix D, cite more |
| CHECKLIST_QUALITY failed | Invented checkboxes | Remove non-SOP items |
| Invention detected | Unsourced claim | Delete or find source |

---

## Examples

**Good extraction signals:**
- `> "The formula is X = Y / Z" [SOURCE: p.47]` → Literal quote
- `Step derived from: "First, do X, then Y" [SOURCE: min 23:45]` → Traceable
- `Example from author: Gym Launch case [SOURCE: Ch.5]` → Author's example

**Red flag signals:**
- "Generally, experts recommend..." → NO SOURCE
- "Best practice is to..." → GENERIC
- "It's common to add..." → INVENTED
- Step without [SOURCE: ...] → UNTRACEABLE

---

## Commands

```bash
# Full triplet extraction
*extract-knowledge "Alex Hormozi" --topic "Value Equation" --sources ./sources/

# Framework only
*extract-knowledge "Alex Hormozi" --topic "Value Equation" --format framework

# SOP from existing framework
*extract-knowledge "Alex Hormozi" --topic "Value Equation" --format sop --framework ./framework.md

# Checklist from existing SOP
*extract-knowledge "Alex Hormozi" --topic "Value Equation" --format checklist --sop ./sop.md
```

---

**Pattern Compliance:** SC-PE-001 ✓ | HO-TP-001 ✓ | WF-EXTRACTION-PIPELINE ✓
