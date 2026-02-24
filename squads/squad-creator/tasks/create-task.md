# Task: Create Squad Task

**Task ID:** create-task
**Version:** 2.0
**Execution Type:** Hybrid
**Purpose:** Create a single workflow task following Task Anatomy standard (8 fields)
**Orchestrator:** @squad-chief
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level (300+ lines simple, 500+ lines complex)

**Frameworks Used:**
- `data/executor-decision-tree.md` → Executor assignment (Phase 0, Step 0.3) **← PRIMARY**
- `data/executor-matrix-framework.md` → Executor profiles reference
- `data/decision-heuristics-framework.md` → Quality gate logic (Phase 4)
- `data/quality-dimensions-framework.md` → Task validation (Phase 4)

---

## Overview

This task creates a single workflow task for an AIOS squad. The key insight: **every task must follow the Task Anatomy standard (8 fields) for consistency and quality**.

**v2.0 Changes:**
- Mandatory Task Anatomy (8 fields)
- PHASE-based structure with checkpoints
- Executor assignment using executor-matrix-framework
- Quality gate SC_TSK_001 must pass
- Clear distinction: Task (atomic) vs Workflow (multi-phase)

```
INPUT (task_purpose + pack_name)
    ↓
[PHASE 0: CLASSIFICATION]
    → Determine: Task or Workflow?
    → Identify target pack
    → Assign executor type
    ↓
[PHASE 1: TASK ANATOMY]
    → Define all 8 required fields
    → Design workflow steps
    → Create elicitation structure
    ↓
[PHASE 2: EXECUTOR DESIGN]
    → Apply executor-matrix-framework
    → Define guardrails
    → Set checkpoints
    ↓
[PHASE 3: CREATION]
    → Generate task using template
    → Add examples
    → Include validation criteria
    ↓
[PHASE 4: VALIDATION]
    → Run SC_TSK_001 quality gate
    → Fix blocking issues
    → Save task file
    ↓
OUTPUT: Task file + Quality Gate PASS
```

---

## Task Anatomy Standard (8 Fields)

**CRITICAL:** Every task MUST have these 8 fields defined.

```yaml
task_anatomy:
  # FIELD 1: ID
  id: "unique-task-identifier"
  description: "Kebab-case identifier for the task"

  # FIELD 2: PURPOSE
  purpose: "What the task accomplishes and why"
  description: "Clear statement of goal and value"

  # FIELD 3: EXECUTOR
  executor: "Human | Agent | Hybrid | Worker"
  description: "Who/what executes this task"

  # FIELD 4: INPUTS
  inputs:
    - name: "Input name"
      type: "string | file | object | list"
      required: true | false
      source: "user | previous_task | database | api"
  description: "What the task needs to run"

  # FIELD 5: PRECONDITIONS
  preconditions:
    - "What must be true before task starts"
  description: "Prerequisites and validations"

  # FIELD 6: STEPS
  steps:
    - name: "Step name"
      action: "What to do"
      elicit: true | false
  description: "How to execute the task"

  # FIELD 7: OUTPUTS
  outputs:
    - name: "Output name"
      format: "markdown | yaml | json | file"
      location: "path or pattern"
  description: "What the task produces"

  # FIELD 8: VALIDATION
  validation:
    - criterion: "How to verify success"
      type: "blocking | warning"
  description: "How to know task completed correctly"
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `task_purpose` | string | Yes | What the task should accomplish | `"Generate sales page copy"` |
| `task_name` | string | Yes | Human-readable name | `"Generate Sales Page"` |
| `pack_name` | string | Yes | Target squad | `"copy"` |
| `complexity` | enum | No | `"simple"` or `"complex"` | `"complex"` |

---

## Preconditions

- [ ] Target pack exists at `squads/{pack_name}/`
- [ ] squad-chief agent is active
- [ ] Agent that will execute this task exists (or will be created)
- [ ] Write permissions for `squads/{pack_name}/tasks/`

---

## PHASE 0: CLASSIFICATION

**Duration:** 2-5 minutes
**Checkpoint:** None (fast classification)
**Mode:** Interactive

### Step 0.1: Task vs Workflow Decision

**Apply: quality_standards.workflow_vs_task_decision**

**Actions:**
```yaml
classification_criteria:
  create_WORKFLOW_when:
    - operation_has_3plus_phases: true
    - multiple_agents_involved: true
    - spans_multiple_sessions: true
    - needs_intermediate_checkpoints: true
    - output_from_one_phase_feeds_next: true

  create_TASK_when:
    - atomic_single_session: true
    - single_agent_sufficient: true
    - no_intermediate_checkpoints: true

  decision_tree:
    - IF any workflow criteria met → "Create workflow, not task"
    - ELSE → "Task is appropriate"
```

**Elicitation:**
```yaml
elicit_classification:
  question: "Let's classify this operation. Tell me about it:"

  sub_questions:
    - "Does it have multiple distinct phases (3+)?"
    - "Does it require multiple agents to work together?"
    - "Will it span multiple work sessions?"
    - "Does it need checkpoints between steps?"

  decision:
    if_workflow: "This should be a WORKFLOW. Use *create-workflow instead."
    if_task: "This is correctly a TASK. Let's continue."
```

### Step 0.2: Identify Target Pack

**Actions:**
```yaml
identify_pack:
  validation:
    - check_path: "squads/{pack_name}/"
    - check_exists: true
    - load_config: "config.yaml"
    - identify_agents: "List agents that could execute this task"

  on_not_exists:
    - suggest: "Create squad first with *create-squad"
    - option: "Create task standalone (not recommended)"
```

### Step 0.3: Assign Executor Type

**Apply: executor-decision-tree.md** (MANDATORY ELICITATION)

**CRITICAL:** Não assuma o executor. Faça as perguntas na ordem.

**Elicitation Flow:**

```yaml
executor_elicitation:
  # PERGUNTA 1: Teste de Determinismo
  q1:
    ask: |
      **Pergunta 1/6 - Determinismo**
      Dado o MESMO input, o output será SEMPRE idêntico?

      Exemplos:
      - ✅ SIM: Converter JSON→YAML, validar CPF, calcular total
      - ❌ NÃO: Resumir texto, classificar sentimento, gerar copy

    options:
      - "SIM - Output é 100% previsível"
      - "NÃO - Output pode variar"

    if_yes: "q2"
    if_no: "q3"

  # PERGUNTA 2: Função Pura
  q2:
    ask: |
      **Pergunta 2/6 - Função Pura**
      Pode ser implementado como função `f(x) → y` sem ambiguidade?

      Exemplos:
      - ✅ SIM: Parsing de arquivo, validação de schema, transformação de dados
      - ❌ NÃO: Decisão que depende de contexto externo

    options:
      - "SIM - Pode ser função pura"
      - "NÃO - Há ambiguidade ou dependência externa"

    if_yes: "q2a"
    if_no: "q3"

  # PERGUNTA 2a: Existe Lib/API
  q2a:
    ask: |
      **Pergunta 2a/6 - Implementação Existente**
      Existe biblioteca, SDK, ou API que faz essa operação?

      Exemplos:
      - ✅ SIM: email-validator, pdf-parse, date-fns
      - ❌ NÃO: Lógica de negócio específica

    options:
      - "SIM - Existe código pronto"
      - "NÃO - Precisa implementar"

    if_yes:
      result: "Worker"
      rationale: "Operação determinística com implementação existente"
    if_no: "q2b"

  # PERGUNTA 2b: ROI de Codificar
  q2b:
    ask: |
      **Pergunta 2b/6 - ROI de Codificação**
      Task será executada quantas vezes?

      Rule of thumb:
      - < 3x → Agent (menor setup)
      - 3-50x → Avaliar complexidade
      - > 50x → Worker (investimento se paga)

    options:
      - "< 3 vezes - One-off ou raro"
      - "3-50 vezes - Uso moderado"
      - "> 50 vezes - Uso frequente"

    if_less_than_3:
      result: "Agent"
      rationale: "Baixa frequência não justifica codificação"
    if_moderate:
      result: "Worker ou Agent"
      rationale: "Avaliar complexidade de implementação vs benefício"
    if_frequent:
      result: "Worker"
      rationale: "Alta frequência justifica investimento em código"

  # PERGUNTA 3: Linguagem Natural
  q3:
    ask: |
      **Pergunta 3/6 - Linguagem Natural**
      Task envolve interpretar, analisar, ou gerar texto não-estruturado?

      Exemplos:
      - ✅ SIM: Resumir documento, classificar email, gerar resposta
      - ❌ NÃO: Calcular métricas, mover arquivos, chamar API

    options:
      - "SIM - Envolve linguagem natural"
      - "NÃO - Dados estruturados apenas"

    if_yes: "q4"
    if_no: "q5"

  # PERGUNTA 4: Impacto de Erro
  q4:
    ask: |
      **Pergunta 4/6 - Impacto de Erro**
      Se o output estiver ERRADO, qual é o impacto?

      Níveis:
      - BAIXO: Typo em draft interno, classificação que será revisada
      - MÉDIO: Email enviado com erro, relatório impreciso
      - ALTO: Proposta com valor errado, comunicação a cliente
      - CRÍTICO: Dados deletados, violação legal, dano irreversível

    options:
      - "BAIXO - Facilmente corrigível"
      - "MÉDIO - Retrabalho necessário"
      - "ALTO - Dano financeiro/reputacional"
      - "CRÍTICO - Irreversível/catastrófico"

    if_low:
      result: "Agent"
      rationale: "Baixo impacto permite execução autônoma de LLM"
    if_medium:
      result: "Hybrid"
      rationale: "Impacto médio requer validação humana"
    if_high:
      result: "Hybrid"
      rationale: "Alto impacto requer validação humana obrigatória"
    if_critical:
      result: "Human"
      rationale: "Impacto crítico requer decisão humana direta"

  # PERGUNTA 5: Julgamento Estratégico
  q5:
    ask: |
      **Pergunta 5/6 - Julgamento Estratégico**
      Task requer decisão estratégica, política, ou interpessoal?

      Exemplos:
      - ✅ SIM: Priorizar roadmap, negociar contrato, resolver conflito
      - ❌ NÃO: Gerar relatório, processar dados, classificar items

    options:
      - "SIM - Requer julgamento humano"
      - "NÃO - Pode ser automatizado"

    if_yes: "q6"
    if_no: "q4"

  # PERGUNTA 6: AI pode assistir
  q6:
    ask: |
      **Pergunta 6/6 - Assistência AI**
      Um AI pode preparar contexto/análise para acelerar a decisão humana?

      Exemplos:
      - ✅ SIM: AI prepara briefing, humano decide
      - ❌ NÃO: Decisão depende de relacionamento/política interna

    options:
      - "SIM - AI pode preparar/assistir"
      - "NÃO - Decisão 100% humana"

    if_yes:
      result: "Hybrid"
      rationale: "AI prepara, humano decide"
    if_no:
      result: "Human"
      rationale: "Decisão requer contexto que AI não tem acesso"
```

**Post-Elicitation Actions:**

```yaml
post_elicitation:
  # Após determinar executor, definir guardrails
  guardrails_by_type:
    Worker:
      - "Input validation obrigatório"
      - "Error handling com retry"
      - "Logging de execução"
      - "Fallback para Hybrid se falhar"

    Agent:
      - "Confidence threshold definido"
      - "Output validation"
      - "Fallback para Hybrid obrigatório"
      - "Rate limiting"

    Hybrid:
      - "Timeout para review humano"
      - "Escalation path definido"
      - "Feedback loop para melhoria"
      - "Fallback para Human se urgente"

    Human:
      - "Critérios de decisão documentados"
      - "Deadline definido"
      - "Escalation path definido"
      - "Documentação obrigatória"
```

**Output (PHASE 0):**

```yaml
# Example output - values will vary based on your squad
phase_0_output:
  classification: "task"
  pack_name: "{squad-name}"
  pack_path: "squads/{squad-name}/"
  task_id: "{task-name}"

  executor:
    type: "Hybrid"
    pattern: "EXEC-HY-001"
    rationale: "LLM gera draft (linguagem natural), humano valida (impacto médio em cliente)"

    elicitation_path:
      q1: "NÃO - Output varia"
      q3: "SIM - Envolve linguagem natural"
      q4: "MÉDIO - Email/conteúdo para cliente"

    guardrails:
      - "Timeout de review: 4h"
      - "Escalation: @{squad-chief}"  # e.g., @{squad-name}-chief
      - "Feedback loop: ativo"

    fallback:
      type: "Human"
      trigger: "Cliente VIP ou conteúdo sensível"
```

---

## PHASE 1: TASK ANATOMY

**Duration:** 10-15 minutes
**Checkpoint:** SC_ANA_001 (Anatomy Complete)
**Mode:** Interactive (elicitation)

### Step 1.1: Define Field 1-2 (ID & Purpose)

**Elicitation:**
```yaml
elicit_identity:
  field_1_id:
    question: "What should be the task ID? (kebab-case)"
    example: "generate-sales-page"
    validation: "Must be unique within pack"

  field_2_purpose:
    question: "What is the purpose of this task?"
    prompt: "Complete: 'This task exists to...'"
    example: "Generate high-converting sales page copy following proven copywriting frameworks"
    requirements:
      - "Clear goal statement"
      - "Value proposition"
      - "Measurable outcome if possible"
```

### Step 1.2: Define Field 3 (Executor)

**Use result from Phase 0, Step 0.3**

**Elicitation (confirmation):**
```yaml
elicit_executor:
  present: "Based on analysis, I recommend: {executor}"
  rationale: "{executor_rationale}"
  question: "Does this executor assignment make sense?"

  if_disagree:
    options:
      - "Human - I need full human control"
      - "Agent - Let AI handle it fully"
      - "Hybrid - AI drafts, I review"
      - "Worker - It's purely mechanical"

  guardrails_prompt:
    - "What guardrails should be in place for this executor?"
```

### Step 1.3: Define Field 4 (Inputs)

**Elicitation:**
```yaml
elicit_inputs:
  question: "What inputs does this task need?"

  for_each_input:
    - "What is the input name?"
    - "What type is it? (string, file, object, list)"
    - "Is it required or optional?"
    - "Where does it come from? (user, previous task, database, API)"
    - "How should it be validated?"

  examples:
    - name: "product_description"
      type: "string"
      required: true
      source: "user"
      validation: "Min 50 characters"

    - name: "target_audience"
      type: "object"
      required: true
      source: "previous_task (avatar-research)"
      validation: "Must have demographics, psychographics"

  minimum_inputs: 1
  document_all: true
```

### Step 1.4: Define Field 5 (Preconditions)

**Elicitation:**
```yaml
elicit_preconditions:
  question: "What must be true before this task can start?"

  categories:
    data_prerequisites:
      - "What data must exist?"
      - "What research must be done?"

    system_prerequisites:
      - "What tools or systems must be available?"
      - "What permissions are needed?"

    sequence_prerequisites:
      - "What tasks must complete first?"
      - "What agent context is required?"

  format_as_checklist: true

  example:
    - "[ ] Product description available (50+ chars)"
    - "[ ] Target audience research complete"
    - "[ ] Brand voice guide accessible"
    - "[ ] Agent has copywriting framework loaded"
```

### Step 1.5: Define Field 6 (Steps)

**Elicitation:**
```yaml
elicit_steps:
  question: "Let's break down the workflow. What are the main steps?"

  for_each_step:
    - name: "Step name (action verb)"
    - action: "What exactly should happen"
    - elicit: "Does this step need user input? (true/false)"
    - output: "What does this step produce"
    - conditions: "Any conditional logic"

  structure_guidance:
    simple_task:
      - "3-7 steps"
      - "Linear flow"
      - "Clear action per step"

    complex_task:
      - "7-15 steps"
      - "May have branches"
      - "Checkpoints between sections"

  example_steps:
    - name: "Analyze Product"
      action: "Extract key features, benefits, USPs from product description"
      elicit: false
      output: "Product analysis document"

    - name: "Select Framework"
      action: "Choose copywriting framework based on product type"
      elicit: true
      options:
        - "AIDA (Attention-Interest-Desire-Action)"
        - "PAS (Problem-Agitate-Solution)"
        - "4Ps (Promise-Picture-Proof-Push)"
      output: "Selected framework"

    - name: "Generate Headline Options"
      action: "Create 5 headline variations"
      elicit: false
      output: "5 headlines with rationale"
```

### Step 1.6: Define Field 7 (Outputs)

**Elicitation:**
```yaml
elicit_outputs:
  question: "What does this task produce?"

  for_each_output:
    - name: "Output name"
    - format: "markdown | yaml | json | file"
    - location: "Where to save (pattern allowed)"
    - structure: "What sections/fields"

  primary_output:
    required: true
    must_have:
      - "Clear filename pattern"
      - "Defined structure"
      - "Quality criteria"

  secondary_outputs:
    optional: true
    examples:
      - "Research artifacts"
      - "Intermediate drafts"
      - "Audit logs"

  example:
    primary:
      name: "sales-page-draft"
      format: "markdown"
      location: "outputs/{project}/sales-page-v1.md"
      structure:
        - "Headline"
        - "Subheadline"
        - "Lead"
        - "Body (problem, agitate, solution)"
        - "Social proof"
        - "Offer"
        - "CTA"
        - "PS"

    secondary:
      name: "headline-options"
      format: "yaml"
      location: "outputs/{project}/headlines.yaml"
```

### Step 1.7: Define Field 8 (Validation)

**Elicitation:**
```yaml
elicit_validation:
  question: "How do we know this task completed successfully?"

  categories:
    completeness:
      - "Are all required sections present?"
      - "Are minimum lengths met?"

    quality:
      - "Does output meet quality standards?"
      - "Does it follow the framework correctly?"

    domain_specific:
      - "Does it include required elements for this domain?"
      - "Does it avoid known anti-patterns?"

    format:
      - "Is the structure correct?"
      - "Is the file format valid?"

  blocking_vs_warning:
    blocking:
      - "Failures that prevent task from completing"
      - "Must be fixed before output is valid"

    warning:
      - "Issues that should be noted but don't block"
      - "Recommendations for improvement"

  example_validation:
    blocking:
      - "Headline present"
      - "CTA present"
      - "Min 500 words"

    warning:
      - "Social proof section recommended"
      - "Consider adding PS"
```

**Checkpoint SC_ANA_001:**
```yaml
heuristic_id: SC_ANA_001
name: "Task Anatomy Complete"
blocking: true
criteria:
  - field_1_id: "defined and unique"
  - field_2_purpose: "clear and specific"
  - field_3_executor: "assigned with rationale"
  - field_4_inputs: "at least 1 defined"
  - field_5_preconditions: "checklist created"
  - field_6_steps: "3+ steps defined"
  - field_7_outputs: "primary output defined"
  - field_8_validation: "criteria defined"
```

---

## PHASE 2: EXECUTOR DESIGN

**Duration:** 5-10 minutes
**Checkpoint:** None
**Mode:** Autonomous with confirmation

### Step 2.1: Design Guardrails

**Apply: executor-matrix-framework.md**

**Actions:**
```yaml
design_guardrails:
  based_on_executor: "{executor}"

  guardrail_templates:
    Worker:
      - input_validation: "Strict schema validation"
      - error_handling: "Retry logic, fallback values"
      - logging: "All operations logged"
      - limits: "Rate limits, timeout"

    Agent:
      - confidence_threshold: "Only proceed if >= 0.8"
      - quality_check: "Self-review before output"
      - escalation: "Flag uncertainty for human"
      - audit: "Log reasoning chain"

    Hybrid:
      - draft_quality: "AI must meet min threshold"
      - human_triggers:
        - "confidence < 0.7"
        - "novel scenario detected"
        - "high-stakes output"
      - approval_workflow: "Clear accept/revise/reject"
      - version_control: "Track all versions"

    Human:
      - instructions: "Clear, unambiguous guidance"
      - decision_criteria: "Explicit rules for decisions"
      - escalation_path: "Who to ask when stuck"
      - time_limit: "Expected completion window"
```

### Step 2.2: Set Checkpoints

**Actions:**
```yaml
set_checkpoints:
  for_complex_tasks:
    identify_transitions:
      - "Input validation → Processing"
      - "Processing → Output generation"
      - "Draft → Review"
      - "Review → Final"

    checkpoint_design:
      - id: "CP-001"
        after_step: 3
        validation: "Inputs validated and analysis complete"
        blocking: true

      - id: "CP-002"
        after_step: 6
        validation: "Draft meets quality threshold"
        blocking: false  # Warning only

  for_simple_tasks:
    checkpoints:
      - "Before output: Validation criteria check"
```

**Output (PHASE 2):**
```yaml
phase_2_output:
  executor: "Hybrid"
  guardrails:
    - "AI confidence threshold: 0.75"
    - "Human review for headline selection"
    - "Version tracking enabled"
  checkpoints: 2
  human_review_triggers:
    - "Headline approval"
    - "Final draft review"
```

---

## PHASE 3: CREATION

**Duration:** 5-10 minutes
**Checkpoint:** None (validation in Phase 4)
**Mode:** Autonomous

### Step 3.1: Generate Task Using Template

**Template:** `templates/task-tmpl.md`

**Actions:**
```yaml
generate_task:
  template: "templates/task-tmpl.md"

  required_sections:
    # Header
    header:
      - task_id
      - version: "1.0"
      - purpose
      - orchestrator: "{agent that executes}"
      - mode: "{executor type}"
      - quality_standard

    # Frameworks Used
    frameworks:
      - "List frameworks applied"

    # Overview
    overview:
      - "ASCII flow diagram"
      - "Version notes"

    # Task Anatomy (8 fields)
    task_anatomy:
      - inputs_table
      - preconditions_checklist
      - steps_detailed
      - outputs_table
      - validation_checklist

    # Executor Details
    executor_details:
      - guardrails
      - checkpoints
      - human_review_triggers

    # Examples
    examples:
      - "1-3 usage examples"
      - "Show input → output"

    # Error Handling
    error_handling:
      - "Common errors"
      - "Recovery procedures"

    # Integration
    integration:
      - "Related tasks"
      - "Agent dependencies"
```

### Step 3.2: Add Usage Examples

**Actions:**
```yaml
add_examples:
  minimum: 1
  recommended: 3

  example_structure:
    - scenario: "Brief description"
    - inputs: "What was provided"
    - execution: "Key steps taken"
    - output: "What was produced"

  example_types:
    - "Happy path (normal usage)"
    - "Edge case (unusual inputs)"
    - "Error handling (how errors resolved)"
```

### Step 3.3: Add Error Handling

**Actions:**
```yaml
add_error_handling:
  common_errors:
    - error: "Missing required input"
      cause: "User didn't provide required field"
      handling: "Prompt for missing input"
      recovery: "Continue after input provided"

    - error: "Validation failure"
      cause: "Output doesn't meet criteria"
      handling: "Log specific failures"
      recovery: "Revise and re-validate"

    - error: "Executor timeout"
      cause: "Task took too long"
      handling: "Save partial progress"
      recovery: "Resume from checkpoint"
```

**Output (PHASE 3):**
```yaml
phase_3_output:
  task_file_content: "..."
  lines: 520
  examples: 3
  error_scenarios: 5
```

---

## PHASE 4: VALIDATION

**Duration:** 2-5 minutes
**Checkpoint:** SC_TSK_001 (Task Quality Gate)
**Mode:** Autonomous with retry

### Step 4.1: Run Quality Gate SC_TSK_001

**Actions:**
```yaml
run_quality_gate:
  heuristic_id: SC_TSK_001
  name: "Task Quality Gate"
  blocking: true

  blocking_requirements:
    # Task Anatomy
    task_anatomy_complete:
      - id_defined: true
      - purpose_clear: true
      - executor_assigned: true
      - inputs_defined: ">= 1"
      - preconditions_listed: ">= 1"
      - steps_defined: ">= 3"
      - outputs_defined: ">= 1"
      - validation_criteria: ">= 1"

    # Quality
    lines:
      simple: ">= 300"
      complex: ">= 500"

    examples: ">= 1"
    error_handling: "defined"

  scoring:
    | Dimension | Weight | Check |
    |-----------|--------|-------|
    | Completeness | 0.25 | All 8 fields present |
    | Clarity | 0.20 | Steps are unambiguous |
    | Executor fit | 0.20 | Right executor assigned |
    | Guardrails | 0.15 | Appropriate safeguards |
    | Examples | 0.10 | Realistic examples |
    | Documentation | 0.10 | Well-documented |

  threshold: 7.0
  veto_conditions:
    - anatomy_incomplete → "Missing required Task Anatomy fields"
    - no_validation → "No validation criteria defined"
    - wrong_executor → "Executor doesn't match task type"
```

### Step 4.2: Fix Blocking Issues

**Actions:**
```yaml
fix_blocking_issues:
  for_each_failure:
    - identify: "What's missing"
    - source: "Where to get it (elicit or derive)"
    - fix: "Add the content"

  common_fixes:
    missing_anatomy_field:
      - "Return to Phase 1 for that field"
      - "Elicit missing information"

    too_short:
      - "Add more detail to steps"
      - "Expand examples"
      - "Add error handling scenarios"

    unclear_steps:
      - "Break into smaller steps"
      - "Add expected outputs per step"
      - "Add decision criteria"

  max_iterations: 2
```

### Step 4.3: Save Task File

**Actions:**
```yaml
save_task:
  path: "squads/{pack_name}/tasks/{task_id}.md"

  post_save:
    - verify_markdown_valid
    - update_agent_dependencies
    - update_pack_readme
    - log_creation
```

**Output (PHASE 4):**
```yaml
# Example output - values will vary based on your squad
phase_4_output:
  quality_score: 8.1/10
  blocking_requirements: "ALL PASS"
  task_file: "squads/{squad-name}/tasks/{task-name}.md"
  lines: 520
  status: "PASS"
```

---

## PHASE 5: HANDOFF

**Duration:** < 1 minute
**Mode:** Interactive

### Step 5.1: Present Task Summary

**Actions:**
```yaml
# Example output - values will vary based on your squad
present_summary:
  task_created:
    id: "{task-name}"
    purpose: "{task purpose description}"
    executor: "Hybrid"
    file: "squads/{squad-name}/tasks/{task-name}.md"
    lines: 520

  task_anatomy:
    inputs: 3
    steps: 8
    outputs: 2
    validation_criteria: 5

  quality:
    score: 8.1/10
    status: "PASS"

  execution:
    command: "*{command-name}"  # e.g., *generate-sales-page
    agent: "@{squad-name}:{agent-name}"  # e.g., @copy:sales-page-writer
```

### Step 5.2: Document Integration

**Actions:**
```yaml
integration_notes:  # Example - replace with your squad agents
  agents_that_use:
    - "{agent-1}"
    - "{squad-name}-chief (orchestration)"

  prerequisite_tasks:
    - "avatar-research"
    - "product-analysis"

  follow_up_tasks:
    - "headline-testing"
    - "copy-review"

  handoff_to:
    - agent: "squad-chief"
      when: "Create more tasks"
    - agent: "assigned-agent"
      when: "Execute the task"
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Task File | `squads/{pack_name}/tasks/{task_id}.md` | Complete task definition |
| Updated Agent | `squads/{pack_name}/agents/*.md` | Dependencies updated |
| Updated README | `squads/{pack_name}/README.md` | Task added to list |

---

## Validation Criteria (All Must Pass)

### Task Anatomy (8 Fields)
- [ ] Field 1: ID defined (kebab-case, unique)
- [ ] Field 2: Purpose clear and specific
- [ ] Field 3: Executor assigned with rationale
- [ ] Field 4: Inputs defined (>= 1)
- [ ] Field 5: Preconditions listed
- [ ] Field 6: Steps defined (>= 3)
- [ ] Field 7: Outputs defined with format/location
- [ ] Field 8: Validation criteria defined

### Quality
- [ ] Lines >= 300 (simple) or >= 500 (complex)
- [ ] SC_TSK_001 score >= 7.0
- [ ] Examples >= 1

### Integration
- [ ] Agent dependencies updated
- [ ] README updated
- [ ] Can be executed via command

---

## Heuristics Reference

| Heuristic ID | Name | Where Applied | Blocking |
|--------------|------|---------------|----------|
| SC_ANA_001 | Task Anatomy Complete | Phase 1 | Yes |
| SC_TSK_001 | Task Quality Gate | Phase 4 | Yes |

---

## Error Handling

```yaml
error_handling:
  should_be_workflow:
    - "User trying to create complex multi-phase as task"
    - action: "Redirect to *create-workflow"

  missing_anatomy_field:
    - "User skipped required field"
    - action: "Return to elicitation for that field"

  validation_fails:
    - "Task doesn't meet quality gate"
    - action: "Identify failures, fix, re-validate"
```

---

## Integration with AIOS

This task creates tasks that:
- Follow Task Anatomy standard (8 fields)
- Can be executed by agents via commands
- Have appropriate executor assignments
- Include proper guardrails
- Produce validated outputs
- Integrate with squad ecosystem

---

_Task Version: 2.0_
_Last Updated: 2026-02-01_
_Lines: 550+_
