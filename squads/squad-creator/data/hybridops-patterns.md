# PATTERNS REUTILIZÁVEIS DO HYBRIDOPS PARA SQUAD-CREATOR

**Data da Extração:** 2026-02-10
**Fonte:** `/Users/oalanicolas/Code/mmos/squads/hybrid-ops-squad`
**Status:** Pronto para Implementação
**Última Atualização:** 2026-02-10 (v1.2 - Self-contained: COPIAR artifacts)

---

## ESTRUTURA DO PEDRO VALÉRIO NO SQUAD-CREATOR

### Os 4 Modos (Validado com Pedro Original - 2026-02-10)

```
SQUAD-CREATOR
├── squad-chief (orquestra squad + revisa)
├── oalanicolas (extrai DNA, SOPs, frameworks)
└── pedro-valerio (AI Head de OPS)
    ├── modo: engenheiro-processos
    ├── modo: arquiteto-sistemas
    ├── modo: arquiteto-automacao
    └── modo: construtor-templates
```

### Mapeamento Modo → Pattern → Comandos

| Modo | Responsabilidade | Patterns Usados | Comandos | Veto Conditions |
|------|------------------|-----------------|----------|-----------------|
| **Engenheiro de Processos** | Mapear do fim pro começo, encontrar gaps | HO-HE-001 (Future Back-Casting), HO-VC-001 | `*map-process`, `*find-gaps`, `*identify-owners` | Vision clarity < 0.7 |
| **Arquiteto de Sistemas** | Estrutura, statuses, campos, permissões | HO-TP-001 (Task Anatomy), HO-EP-001/002/003/004 | `*design-structure`, `*create-statuses`, `*define-fields` | Missing required fields |
| **Arquiteto de Automação** | Bloqueios, triggers, conexões, N8N | HO-HE-003 (Automation Tipping), HO-VC-003, HO-QG-001 | `*create-rules`, `*connect-systems`, `*design-triggers` | Guardrails missing |
| **Construtor de Templates** | Templates, checklists, docs, teste da filha | HO-QG-001, HO-CV-001, HO-AX-001 | `*create-template`, `*write-instructions`, `*test-leigo` | Truthfulness < 0.7 |

### Ferramentas por Modo (da reunião)

| Modo | Ferramentas |
|------|-------------|
| Engenheiro de Processos | Figma, Notion, Google Docs, Loom |
| Arquiteto de Sistemas | ClickUp, Notion, Google Drive, Airtable |
| Arquiteto de Automação | ClickUp Automations, N8N, Webhooks, APIs |
| Construtor de Templates | Notion, ClickUp, Markdown, Loom |

---

## MIND ARTIFACTS (Self-Contained)

**REGRA:** Squad-creator é 100% self-contained. Todos os artifacts são COPIADOS para dentro do squad.

### Estrutura Local (após migração)

```
squads/squad-creator/
├── minds/
│   └── pedro_valerio/
│       ├── heuristics/
│       │   ├── PV_BS_001.md       # Future Back-Casting
│       │   ├── PV_PA_001.md       # Systemic Coherence Scan
│       │   └── PV_PM_001.md       # Automation Tipping Point
│       └── artifacts/
│           ├── META_AXIOMAS.md    # 10 dimensões + Axiomas Level -4 a 0
│           └── Assinatura_Linguistica.md  # Voice DNA original
```

### Heuristics (Copiados de HybridOps)

| Arquivo | Path Local | O que contém |
|---------|------------|--------------|
| **PV_BS_001** | `minds/pedro_valerio/heuristics/PV_BS_001.md` | Future Back-Casting (decisão estratégica) |
| **PV_PA_001** | `minds/pedro_valerio/heuristics/PV_PA_001.md` | Systemic Coherence Scan (validação de executores) |
| **PV_PM_001** | `minds/pedro_valerio/heuristics/PV_PM_001.md` | Automation Tipping Point (quando automatizar) |

### Artifacts (Copiados de HybridOps)

| Arquivo | Path Local | O que contém |
|---------|------------|--------------|
| **META_AXIOMAS** | `minds/pedro_valerio/artifacts/META_AXIOMAS.md` | 10 dimensões de validação, Axiomas Level -4 a 0 |
| **Assinatura_Linguistica** | `minds/pedro_valerio/artifacts/Assinatura_Linguistica.md` | Voice DNA original |

### Fonte Original (para referência)

| Arquivo | Path Original (HybridOps) |
|---------|---------------------------|
| PV_BS_001 | `squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/PV_BS_001.md` |
| PV_PA_001 | `squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/PV_PA_001.md` |
| PV_PM_001 | `squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/PV_PM_001.md` |
| META_AXIOMAS | `squads/hybrid-ops-squad/minds/pedro_valerio/artifacts/META_AXIOMAS.md` |
| Assinatura | `squads/hybrid-ops-squad/minds/pedro_valerio/artifacts/Assinatura_Linguistica.md` |
| heuristics.yaml | `squads/hybrid-ops-squad/config/heuristics.yaml` |

**NOTA:** Os arquivos são COPIADOS uma vez. Atualizações futuras devem ser feitas no squad-creator diretamente.

---

## ÍNDICE DE PATTERNS

1. [Veto Conditions Patterns](#veto-conditions-patterns)
2. [Task Anatomy Patterns (8 Campos)](#task-anatomy-patterns-8-campos)
3. [Heuristics Patterns (PV_BS_001, PV_PA_001, PV_PM_001)](#heuristics-patterns)
4. [Axioma Validator Pattern](#axioma-validator-pattern)
5. [Quality Gate Patterns (HO-PP-003)](#quality-gate-patterns)
6. [Executor Assignment Patterns (HO-EP-XXX)](#executor-assignment-patterns)
7. [Coherence Validation Patterns](#coherence-validation-patterns)

---

## VETO CONDITIONS PATTERNS

### HO-VC-001: Veto Condição - Visão Estratégica Incompleta

**ID Pattern:** `HO-VC-001`
**Nome:** Vision Clarity Veto
**Fase:** Architecture (Phase 2)
**Heurística:** PV_BS_001

**Definição:**
```yaml
veto_trigger:
  condition: "end_state_vision_clarity < 0.7"
  action: "VETO - Vision unclear, return to Discovery"
  severity: "BLOCKING"
  recovery: "Clarify end-state vision before proceeding"
```

**Quando Usar:**
- Quando visão estratégica está abaixo de 70% de clareza
- Antes de commitar recursos significativos e irreversíveis
- Em decisões de arquitetura que definem fundação do sistema

**Exemplo de Aplicação no Squad-Creator:**
- Verificar se "DNA extraction pipeline" está claro antes de design
- Validar se meta de "automated agent generation" é visível
- Confirmar escopo de "quality gates" antes de Phase 2

**Como Adaptar:**
- Substituir `end_state_vision` por: `squad_creation_vision_clarity`
- Manter threshold em 0.7
- Criar questões validação específicas para squad-creator

**Outputs Esperados:**
- APPROVE: Proceed to Architecture
- REVIEW: Clarify vision with team
- VETO: Return to Discovery phase

---

### HO-VC-002: Veto Condição - Incoerência de Executor

**ID Pattern:** `HO-VC-002`
**Nome:** Executor Coherence Veto
**Fase:** Executors (Phase 3)
**Heurística:** PV_PA_001

**Definição:**
```yaml
veto_conditions:
  - condition: "truthfulness_coherence < 0.7"
    action: "VETO - REJECT/REMOVE immediately"
    severity: "CRITICAL"
  - condition: "detected_incoherence = true"
    action: "VETO - Trust breach, cannot proceed"
    severity: "CRITICAL"
```

**Quando Usar:**
- Incoerência detectada entre statements e actions
- Mentira identificada propositalmente
- Agent assignment não-confiável

**Exemplo de Aplicação:**
- Validar que agent do squad-creator segue suas próprias axiomas
- Verificar se extraction logic é determinístico
- Confirmar que output bate com documented behavior

**Como Adaptar:**
- `truthfulness_coherence` → `agent_behavior_coherence`
- Aplicar a agents que pertencem ao squad
- Usar para validar DNA clones antes de deploy

**Guardrails:**
- Teste comportamento com tasks que revelam consistência
- Use métricas objetivas sobre impressões subjetivas
- Implemente appeal tribunal para casos borderline

---

### HO-VC-003: Veto Condição - Falta de Guardrails

**ID Pattern:** `HO-VC-003`
**Nome:** Automation Guardrail Veto
**Fase:** Workflows (Phase 4)
**Heurística:** PV_PM_001

**Definição:**
```yaml
veto_condition:
  trigger: "guardrails_missing = true"
  action: "VETO - Define safety guardrails first"
  scope: "Any automation"
  required_guardrails:
    - loop_prevention
    - idempotency
    - audit_trail
    - manual_escape
    - retry_logic
```

**Quando Usar:**
- Antes de automate qualquer workflow
- Quando frequency > 2x por mês
- Em automations com systemic impact > 0.6

**Exemplo no Squad-Creator:**
- Agent-geração precisa: loop prevention, idempotency, audit trail
- Extraction pipeline: rollback mechanism, manual override
- Validation gates: timeout handling, fallback behavior

**Como Adaptar:**
- Manter 5 guardrails obrigatórios
- Adicionar: `max_iterations`, `failure_threshold`, `notification_on_veto`
- Criar checklist pré-automation

---

## TASK ANATOMY PATTERNS (8 CAMPOS)

### HO-TP-001: Task Anatomy Standard

**ID Pattern:** `HO-TP-001`
**Nome:** 8-Field Task Definition Standard
**Aplicável a:** Todas as tasks
**Compliance Rate:** 100% (validado em prioritization-system)

**Os 8 Campos Obrigatórios:**

| # | Campo | Tipo | Validação | Exemplo |
|---|-------|------|-----------|---------|
| 1 | `task_name` | string | "Verb + Object" format | "Extract Mind DNA" |
| 2 | `status` | enum | pending \| in_progress \| review \| completed \| blocked | "pending" |
| 3 | `responsible_executor` | string | role or @agent reference | "@squad-creator:analyzer" |
| 4 | `execution_type` | enum | Human \| Agent \| Hybrid \| Worker | "Agent" |
| 5 | `estimated_time` | duration | Must include unit (h, m, d) | "2-3 hours" |
| 6 | `input` | array | At least 1 item required | ["DNA template", "agent config"] |
| 7 | `output` | array | At least 1 item required | ["extracted axiomas", "validation report"] |
| 8 | `action_items` | array | Step-by-step execution (≥1) | ["Parse agent markdown", "Extract axiomas", "Validate..."] |
| 9 | `acceptance_criteria` | array | "Done" definition (≥1) | ["All fields extracted", "Pass validation gate"] |

**Estrutura Completa:**

```yaml
task_definition:
  # REQUIRED (8 FIELDS)
  task_name: "Extract Mind DNA"
  status: "pending"
  responsible_executor: "@squad-creator:analyzer"
  execution_type: "Agent"
  estimated_time: "3h"
  input:
    - "Agent markdown file"
    - "DNA extraction template"
  output:
    - "DNA YAML file"
    - "Extraction report"
  action_items:
    - "Parse agent markdown"
    - "Extract axiomas"
    - "Validate coherence"
    - "Generate YAML"
  acceptance_criteria:
    - "All axiomas extracted"
    - "DNA passes coherence check"
    - "YAML well-formed"

  # OPTIONAL EXTENSIONS
  tools:
    - "ClickUp"
    - "Claude API"
  templates:
    - "dna-extraction-template.yaml"
  quality_gate: "QG-2.1A"
  handoff:
    to: "create-agent"
    trigger: "dna_extraction_complete"
```

**Validação Checklist:**
- [ ] task_name começa com verbo de ação
- [ ] status é valor válido
- [ ] responsible_executor é role ou @agent
- [ ] execution_type é um dos 4 tipos
- [ ] estimated_time tem unidade (h/m/d)
- [ ] input array não vazio
- [ ] output array não vazio
- [ ] action_items tem ≥1 step
- [ ] acceptance_criteria tem ≥1 criterion
- [ ] Sem typos ou caracteres inválidos

**Reusável em Squad-Creator:**
- Aplicar ao 100% das tasks
- Usar "Verb + Object" em Portuguese (Extrair, Validar, Gerar, etc)
- Criar dependency graph baseado em handoff triggers
- Validar compliance em Phase 5

---

## HEURISTICS PATTERNS

### HO-HE-001: PV_BS_001 - Future Back-Casting

**ID Pattern:** `HO-HE-001`
**Nome Completo:** Future Back-Casting Heuristic
**Categoria:** Strategic Decision Heuristic
**Fase:** 2 (Architecture)
**Agent Executor:** `@hybridOps:process-architect`

**Propósito:**
Validar alinhamento estratégico usando metodologia future back-casting. Responde: "Esta ação direta ou cria opcionality paths para o end-state vision?"

**Pesos e Thresholds:**

```yaml
PV_BS_001:
  weights:
    end_state_vision: 0.9          # Primary weight
    market_signals: 0.1             # Secondary

  thresholds:
    high_priority: 0.8
    medium_priority: 0.7
    low_priority: 0.5
    veto_threshold: 0.7

  veto_conditions:
    - "end_state_vision_clarity < 0.7"        # VETO
    - "strategic_priority_score < 0.5"        # REVIEW
```

**Decision Tree:**

```
IF (proposed_action directly enables 'end_state_vision')
  THEN resource_allocation_priority = HIGH → APPROVE

ELSE IF (proposed_action creates optionality_path)
  THEN resource_allocation_priority = MEDIUM → APPROVE with conditions

ELSE IF (action does not serve end_state vision)
  THEN REVIEW - requires justification

TERMINATION: If action contradicts end_state OR more direct path exists
FALLBACK: If multiple actions conflict, prioritize the one that builds
          the more fundamental layer of the future system
```

**Critérios de Avaliação:**

| Critério | Weight | Threshold | Descrição |
|----------|--------|-----------|-----------|
| End-state vision clarity | 0.9 | ≥0.8 | Quão bem definido é o estado futuro? |
| Strategic priority score | 0.1 | ≥0.7 | Alinha com top priorities? |
| Optionality creation | 0.8 | ≥0.6 | Cria flexibilidade futura? |
| Resource efficiency | 0.7 | ≥0.5 | Uso ótimo de recursos? |

**Exemplo Behavioral Evidence (do HybridOps):**
- **Context:** Mercado de influencer focado em ativação manual
- **Decision:** Criar AI team 1.5 anos antes de ser necessário
- **Rationale:** Mudança estrutural do mercado para advertising automation (TTCX)
- **Outcome:** #1 em Latin America quando mercado mudou

**Reusável em Squad-Creator Como:**

```yaml
HO-HE-001-SC: "Squad-Creator Architecture Validation"
phase: 2
question: "Does this architecture directly enable full-stack squad creation?"

decision_points:
  - "DNA extraction pipeline → YES (fundamental)"
  - "Agent generation → YES (core capability)"
  - "Quality gates → YES (systemic requirement)"
  - "Workflow automation → YES (efficiency layer)"
  - "Dashboard analytics → REVIEW (nice-to-have, not core)"

end_state_vision: "Autonomous creation of purpose-built squads with 0 manual configuration"
vision_clarity: 0.85  # Clear vision
strategic_priority: 0.9  # Top priority for AIOS
optionality_paths: 3  # Multiple integration points

result: APPROVE (0.87 score)
```

**Performance Metrics:**
- Decision speed: "1-3 days (vision crystallization); <1 hour (tactical)"
- Accuracy rate: "85% (3-5 year horizons)"
- Confidence level: "95% (once vision is established)"

---

### HO-HE-002: PV_PA_001 - Systemic Coherence Scan

**ID Pattern:** `HO-HE-002`
**Nome Completo:** Systemic Coherence Scan
**Categoria:** People/Executor Assessment Heuristic
**Fase:** 3 (Executors)
**Agent Executor:** `@hybridOps:executor-designer`

**Propósito:**
Validar coerência de executor assignments e people assessment. Truthfulness tem **VETO POWER**.

**Pesos Críticos:**

```yaml
PV_PA_001:
  weights:
    truthfulness_coherence: 1.0  # VETO power - absolute
    system_adherence_potential: 0.8
    technical_skill: 0.3

  thresholds:
    truthfulness: 0.7           # Must be 'Coherent'
    system_adherence: 0.7
    technical_skill: null        # No minimum, context-dependent

  veto_conditions:
    - condition: "truthfulness_coherence < 0.7"
      action: "VETO - REJECT/REMOVE immediately"
    - condition: "lie_detected = true"
      action: "VETO - Trust violation"
```

**Truthfulness States:**

```yaml
truthfulness_states:
  coherent:
    range: [0.7, 1.0]
    description: "Statements align with actions and observable data"
    action: "APPROVE"

  incoherent:
    range: [0.4, 0.7]
    description: "Statements contradict actions or data"
    action: "REVIEW - Investigate"

  lie_detected:
    range: [0.0, 0.4]
    description: "Deliberate misrepresentation"
    action: "VETO - Immediate removal"
```

**Executor Type Coherence Matrix:**

| Executor Type | Min Truthfulness | Min System Adherence | Tech Weight |
|---------------|------------------|----------------------|-------------|
| Human | 0.7 (VETO) | 0.7 | 0.3 |
| Hybrid | 0.7 (VETO) | 0.8 | 0.4 |
| Agent | N/A | 0.9 | 0.6 |
| Worker | N/A | 0.95 | 0.8 |

**Failure Modes to Watch:**

- **False Negative:** Rejecting talented candidate por pequena inconsistência
  - Recovery: Appeal tribunal com trusted circle
  - Prevention: Diferenciar "nervousness" de "intentional lie"

- **False Positive:** Accepting incoherent executor por charming presentation
  - Detection: Contradictions em behavioral evidence
  - Recovery: Apply test period com revealing tasks

**Reusável em Squad-Creator:**

```yaml
HO-HE-002-SC: "Agent Executor Coherence Validation"
phase: 3
scope: "All agents generated by squad-creator"

validation_criteria:
  - agent_output_matches_prompt: 0.9
  - consistency_across_runs: 0.85
  - behavior_matches_persona: 0.80
  - follows_guardrails: 1.0  # VETO if fails

veto_conditions:
  - "Agent generates outputs contradicting its persona"
  - "Agent ignores quality gates"
  - "Agent produces inconsistent results for same input"

example:
  agent: "@squad-creator:analyzer"
  truthfulness_score: 0.92
  system_adherence: 0.88
  consistency: "Extracts same axiomas from same agent 10/10 times"
  result: APPROVE
```

---

### HO-HE-003: PV_PM_001 - Automation Tipping Point

**ID Pattern:** `HO-HE-003`
**Nome Completo:** Automation Tipping Point
**Categoria:** Automation Decision Heuristic
**Fase:** 4 (Workflows)
**Agent Executor:** `@hybridOps:workflow-designer`

**Propósito:**
Determinar QUANDO e SE automate um processo. Implementa "Automation Before Delegation". **Guardrails têm VETO POWER**.

**A Lei da Automação:**

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
    requirement: "MUST have guardrails, idempotency, logs, and manual escape"
```

**Pesos e Thresholds:**

```yaml
PV_PM_001:
  weights:
    task_systemic_impact: 0.9
    task_automatability: 0.8
    task_frequency: 0.7
    guardrails_present: 1.0  # VETO power

  thresholds:
    systemic_impact: 0.6      # For deep work allocation
    automatability: 0.5       # For removal from agenda
    frequency: "2x per month" # Minimum for automation justification
    standardization: 0.7      # Process must be standardized
```

**Decision Tree:**

```
PRIMARY:
  IF (task_automatability > 0.5)
    THEN AUTOMATE/DELEGATE

SECONDARY:
  ELSE IF (task_systemic_impact > 0.6)
    THEN ALLOCATE_DEEP_WORK_TIME (keep for humans)

CONSTRAINT: NEVER automate without guardrails

AUTOMATION DECISION MATRIX:
┌───────────┬────────┬──────────────┬──────────────┐
│ Frequency │ Impact │ Automatability│ Decision     │
├───────────┼────────┼──────────────┼──────────────┤
│ High (4x) │ High   │ High         │ **AUTOMATE** │
│ High      │ High   │ Low          │ DELEGATE     │
│ High      │ Low    │ High         │ AUTOMATE     │
│ Low (<2x) │ High   │ Any          │ KEEP_MANUAL  │
│ Low       │ Low    │ Any          │ **ELIMINATE**│
│ Any       │ Any    │ Any (no GR)  │ **VETO**     │
└───────────┴────────┴──────────────┴──────────────┘
```

**Guardrails Requirements (OBRIGATÓRIOS):**

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

**Reusável em Squad-Creator:**

```yaml
HO-HE-003-SC: "DNA Extraction Automation Decision"
phase: 4

analysis:
  frequency: "Every agent created (10+ times/month)"  # High
  systemic_impact: 0.95  # Core to squad creation
  automatability: 0.85  # Parse, extract, validate are deterministic
  guardrails: "Present"  # 5/5 required
    - loop_prevention: "Max 100 iterations per extraction"
    - idempotency: "Same agent file → same DNA output"
    - audit_trail: "Log each extraction step"
    - manual_escape: "Manual DNA review before deploy"
    - retry_logic: "Fallback to template on parse error"

decision: AUTOMATE (0.91 score)
confidence: HIGH
```

---

## AXIOMA VALIDATOR PATTERN

### HO-AX-001: 10-Dimension Axioma Assessment

**ID Pattern:** `HO-AX-001`
**Nome:** Meta-Axiomas Assessment Framework
**Fase:** 6 (Quality Assurance)
**Scope:** Process-level validation

**Definição:**
Framework de 10 dimensões para validar se um processo está **coerente com axiomas fundamentais**. Baseado em 40+ decisões documentadas.

**As 10 Dimensões:**

| # | Dimensão | Definição | Weight | Threshold | Veto Power |
|---|----------|-----------|--------|-----------|------------|
| 1 | Truthfulness | Acurácia e confiabilidade dos outputs | 1.0 | 7.0 | YES |
| 2 | Coherence | Consistência interna e lógica | 0.9 | 6.0 | NO |
| 3 | Strategic Alignment | Suporta objetivos organizacionais | 0.9 | 6.0 | NO |
| 4 | Operational Excellence | Eficiência, confiabilidade, documentação | 0.8 | 6.0 | NO |
| 5 | Innovation Capacity | Habilidade de melhoria e adaptação | 0.7 | 5.0 | NO |
| 6 | Risk Management | Identificação e mitigação de riscos | 0.8 | 6.0 | NO |
| 7 | Resource Optimization | Uso eficiente de tempo/dinheiro/pessoas | 0.8 | 6.0 | NO |
| 8 | Stakeholder Value | Valor entregue a todas as partes | 0.7 | 6.0 | NO |
| 9 | Sustainability | Viabilidade a longo prazo | 0.7 | 6.0 | NO |
| 10 | Adaptability | Capacidade de evolução | 0.6 | 5.0 | NO |

**Scoring:**
```yaml
overall_score: (Σ(score_i × weight_i)) ÷ Σ(weight_i)

pass_criteria:
  overall: ">= 7.0"
  per_dimension: ">= 6.0 for all"
  veto: "truthfulness < 7.0"
```

**Assessment Template:**

```yaml
axioma_assessment:
  process_name: "DNA Extraction Pipeline"
  assessor: "@squad-creator:qa-architect"

  dimensions:
    - name: "Truthfulness"
      score: 8.5/10
      evidence: "Extracts same axiomas consistently from same agent"
      recommendations: ["Add confidence scoring", "Document edge cases"]

    - name: "Coherence"
      score: 8.0/10
      evidence: "Output YAML format matches schema 100%"
      recommendations: []

    # ... remaining 8 dimensions

  overall_score: 7.9
  pass_threshold: 7.0
  status: "PASS"
  veto_triggered: false
```

**Reusável em Squad-Creator:**

```yaml
HO-AX-001-SC: "Squad-Creator Pipeline Axioma Assessment"

process_components:
  - "DNA Extraction"
  - "Agent Generation"
  - "Quality Gates"
  - "Validation Pipeline"

example_assessment:
  DNA_Extraction:
    truthfulness: 8.5  # Consistent output
    coherence: 8.0     # Follows YAML schema
    strategic_alignment: 8.5  # Enables core mission
    operational_excellence: 8.0  # Well-documented, 99.9% uptime
    innovation_capacity: 7.0  # Templates can be enhanced
    risk_management: 8.5  # Guardrails present
    resource_optimization: 8.0  # 48% automated
    stakeholder_value: 8.5  # Saves 3h per agent
    sustainability: 7.5  # No custom code
    adaptability: 7.5  # Config-based

    overall_score: 7.9  # PASS
    recommendation: "Proceed to Phase 7"
```

---

## QUALITY GATE PATTERNS (HO-PP-003)

### HO-QG-001: Quality Gate Pattern - 3-Type Taxonomy

**ID Pattern:** `HO-QG-001`
**Nome:** Quality Gate Pattern (HO-PP-003)
**Aplicável a:** Todas as fases (1-9)

**Os 3 Tipos de Quality Gates:**

| Tipo | Executor | Velocidade | Uso | Exemplo |
|------|----------|-----------|-----|---------|
| **Automated** | Sistema/AI | <1 segundo | Deterministic checks | Field validation, calculations |
| **Hybrid** | Sistema + Human | 1-5 minutos | AI prepara, humano aprova | Template generation review |
| **Manual** | Human/Team | 1-8 horas | Judgment-based | Acceptance sign-off |

**Estrutura Completa de Quality Gate:**

```yaml
quality_gate:
  id: "QG-R02"                    # Unique identifier
  name: "RICE Inputs Completeness"
  phase: "Runtime"
  workflow: "WF-R01"
  location: "Before RT-004"
  type: "Automated"               # One of: Automated, Hybrid, Manual
  risk_level: "Medium"            # Low, Medium, High, Critical

  # TRIGGER DEFINITION
  trigger:
    event: "field_change"         # What event activates gate
    condition: "any_rice_field_updated"

  # ACCEPTANCE CRITERIA
  criteria:
    - check: "Reach field filled"
      type: "not_empty"           # Type: not_empty, validation, boolean, threshold, etc
      field_id: "a1f4fcb9-..."
      required: true

    - check: "Impact field selected"
      type: "not_empty"
      field_id: "daeaffa6-..."
      required: true

    - check: "Effort field selected"
      type: "not_empty"
      field_id: "056d774e-..."
      required: true

  threshold: "100% fields filled"  # Pass condition

  # EXECUTOR CONFIGURATION
  executor:
    type: "automated"             # Or: hybrid, manual
    agent: "ClickUp AI Field"      # Who/what validates

  # ACTIONS ON PASS/FAIL
  pass_action:
    - "Proceed with RICE calculation"
    - "Log success"

  fail_action:
    - "Return '-' as score"
    - "Display incomplete status"
    - "Log failure details"

  sla: "<1 second"                # Service level agreement
  guardrail: "GR-001"             # Linked guardrail (optional)
```

**5-Layer QG Taxonomy:**

```
Layer 1: RUNTIME GATES (System-level, automated)
├── Template application gates
├── Calculation completeness gates
├── Value validity gates
└── Status transition gates

Layer 2: IMPLEMENTATION GATES (Wave-based)
├── Wave 1 completion
├── Wave 2 completion
├── Wave 3 completion
└── Acceptance gate

Layer 3: INTEGRATION GATES (End-to-end)
├── Complete epic flow test
├── Complete story flow test
└── Validation gate blocking test

Layer 4: APPROVAL GATES (Management)
├── Product Owner sign-off
├── Tech Lead sign-off
└── Executive approval

Layer 5: MONITORING GATES (Operational)
├── SLA monitoring
├── Failure rate tracking
└── Performance dashboards
```

**Reusável em Squad-Creator:**

```yaml
HO-QG-001-SC: "Agent Generation Quality Gates"

gates:
  - id: "QG-1.1"
    name: "DNA Extraction Completeness"
    type: "Automated"
    location: "After extraction, before generation"
    criteria:
      - "All axiomas extracted (≥5)"
      - "No empty fields in DNA YAML"
      - "Coherence score ≥ 0.7"
    threshold: "100% criteria met"
    pass_action: ["Proceed to agent generation"]
    fail_action: ["Return to extraction", "Notify user"]

  - id: "QG-1.2"
    name: "Agent Generation Validity"
    type: "Hybrid"
    location: "After agent YAML generated"
    criteria:
      - "Agent markdown parses without error"
      - "All required fields present"
      - "No undefined placeholder values"
    threshold: "100% criteria met"
    pass_action: ["Deploy agent", "Generate documentation"]
    fail_action: ["Regenerate", "Request manual fixes"]

  - id: "QG-1.3"
    name: "Axioma Compliance Review"
    type: "Manual"
    location: "Before go-live"
    criteria:
      - "Agent behavior matches persona (PV assessment)"
      - "No security/safety violations"
      - "Meets squad requirements"
    threshold: "Product Owner approval"
    pass_action: ["Mark as Production-Ready"]
    fail_action: ["Send back for refinement"]
```

---

## EXECUTOR ASSIGNMENT PATTERNS (HO-EP-XXX)

### HO-EP-001: Human Executor Pattern

**ID Pattern:** `HO-EP-001`
**Nome:** Human Executor Assignment
**Quando Usar:** Tasks requiring judgment, creativity, relationships

**Characteristics:**
- Cost: $$$ (expensive)
- Speed: Slow (hours to days)
- Judgment Required: YES
- Can be automated: NO

**Typical Tasks:**
- Business value assessment
- Technical estimation
- Leadership decisions
- Code reviews (with judgment)
- Stakeholder communication

**Executor Matrix Entry:**

```yaml
- task_id: COMP-H01
  task_name: "Assess Agent Fit for Squad"
  executor_type: human
  pattern: HO-EP-001
  assigned_to: "Squad Lead"
  backup: "Product Owner"

  rationale: "Judgment about agent personality, culture fit requires human discernment"
  automation_potential: low
  frequency: "per agent creation"

  capabilities_required:
    - name: "Agent Capability Assessment"
      level: expert
    - name: "Team Dynamics Understanding"
      level: expert

  raci:
    responsible: "Squad Lead"
    accountable: "Squad Lead"
    consulted: ["Agent Creator", "PM"]
    informed: ["Team"]
```

---

### HO-EP-002: Agent (AI) Executor Pattern

**ID Pattern:** `HO-EP-002`
**Nome:** Agent (AI) Executor Assignment
**Quando Usar:** Analysis, generation, pattern recognition

**Characteristics:**
- Cost: $$$$ (API calls)
- Speed: Very Fast (seconds to minutes)
- Judgment Required: NO (deterministic or guided)
- Can be automated: YES (fully)

**Typical Tasks:**
- Code generation
- Data analysis
- Content generation
- Complex pattern matching
- Reasoning over structured data

**Executor Matrix Entry:**

```yaml
- task_id: COMP-A01
  task_name: "Extract Agent Axiomas"
  executor_type: agent
  pattern: HO-EP-002
  assigned_to: "Claude API (Opus)"
  backup: null

  rationale: "Axioma extraction is deterministic pattern recognition"
  automation_potential: high
  frequency: "per agent"

  tools_available:
    - "Claude Opus API"
    - "Extraction templates"

  raci:
    responsible: "API System"
    accountable: "Squad Creator Admin"
    consulted: []
    informed: ["QA team"]
```

---

### HO-EP-003: Hybrid Executor Pattern

**ID Pattern:** `HO-EP-003`
**Nome:** Hybrid Executor Assignment
**Quando Usar:** AI assists, human validates and directs

**Characteristics:**
- Cost: $$ (split cost)
- Speed: Moderate (minutes to hours)
- Judgment Required: BOTH
- Can be automated: Partially (AI part yes, validation part no)

**Typical Tasks:**
- Code generation with review
- Design + implementation (separate roles)
- AI draft + human refinement
- Complex automation with human gates

**Executor Matrix Entry:**

```yaml
- task_id: IMP-006
  task_name: "Create WSJF Validation Gate"
  executor_type: hybrid
  pattern: HO-EP-003
  assigned_to:
    design: "@squad-creator:architect"  # AI designs automation logic
    implement: "Admin"                     # Human implements in ClickUp
  backup: "Tech Lead"

  rationale: "Automation logic requires AI design, implementation requires admin access"
  effort: "2h total (1h design + 1h implement)"
  risk: medium

  raci:
    responsible: "@architect"  # Design lead
    accountable: "Tech Lead"    # Overall accountability
    consulted: ["Product Owner"]
    informed: ["Dev Team"]

  workflow:
    step_1: "AI designs validation logic"
    step_2: "Human reviews AI output"
    step_3: "Human implements in platform"
    step_4: "Test end-to-end"
```

---

### HO-EP-004: Worker Executor Pattern

**ID Pattern:** `HO-EP-004`
**Nome:** Worker (Deterministic Automation) Executor
**Quando Usar:** Deterministic tasks, file operations, API calls

**Characteristics:**
- Cost: $ (cheapest)
- Speed: Very Fast (sub-second to seconds)
- Judgment Required: NO
- Can be automated: YES (100%)

**Typical Tasks:**
- Template application
- Field calculations (formulas)
- Validation (if/then rules)
- File operations
- Data transformations

**Executor Matrix Entry:**

```yaml
- task_id: COMP-W01
  task_name: "Apply Agent Template"
  executor_type: worker
  pattern: HO-EP-004
  assigned_to: "ClickUp Task Template"  # Or: automation system, worker process
  backup: null

  rationale: "Template application is deterministic, no judgment"
  automation_potential: high
  frequency: "per agent creation"
  platform: "ClickUp native"
  trigger: "task_created with type=agent"

  required_fields:
    - "agent name"
    - "agent type"

  capabilities_required:
    - name: "Template Application"
      level: basic

  raci:
    responsible: "System"
    accountable: "Admin"
    consulted: []
    informed: ["Squad Creator"]

  worker_logic: |
    IF task_type = 'agent' AND created_by = '@squad-creator'
    THEN apply_template('agent-standard.yaml')
    AND set_default_fields()
    AND notify_creator()
```

---

## COHERENCE VALIDATION PATTERNS

### HO-CV-001: Truthfulness Assessment

**ID Pattern:** `HO-CV-001`
**Nome:** Truthfulness Coherence Validation
**Source:** PV_PA_001 Heuristic

**Truthfulness Evaluation States:**

```yaml
coherence_levels:
  coherent:  # 0.7 - 1.0
    description: "Statements align with observable data and actions"
    examples:
      - "Agent always extracts same axiomas from same input"
      - "Agent behavior matches its documented persona"
    action: "APPROVE"
    score_range: [0.7, 1.0]

  inconsistent:  # 0.4 - 0.7
    description: "Statements contradict data without clear explanation"
    examples:
      - "Agent claims 'deterministic' but output varies"
      - "Agent says 'truthfulness matters' but outputs contain errors"
    action: "REVIEW - Investigate"
    score_range: [0.4, 0.7]
    remediation: "Apply test period with revealing tasks"

  incoherent:  # 0.0 - 0.4
    description: "Deliberate misrepresentation detected"
    examples:
      - "Agent fabricates extraction data"
      - "Agent ignores documented safety guardrails"
    action: "VETO - Remove immediately"
    score_range: [0.0, 0.4]
    consequence: "Trust breach - cannot proceed"
```

**Assessment Checklist:**

```yaml
truthfulness_validation:
  - test: "Run same input 10x, check output consistency"
    threshold: "10/10 identical outputs"

  - test: "Verify extracted data against source"
    threshold: ">95% accuracy"

  - test: "Check if behavior matches documented persona"
    threshold: "100% alignment"

  - test: "Verify compliance with safety guardrails"
    threshold: "0 violations across 100 runs"

  - test: "Check if error messages are truthful"
    threshold: "No false positives or negatives"

scoring:
  all_tests_pass: 0.95    # Coherent
  1_test_fails: 0.65      # Inconsistent
  2+_tests_fail: 0.35     # Incoherent
```

---

### HO-CV-002: Weighted Coherence Assessment

**ID Pattern:** `HO-CV-002`
**Nome:** Weighted Coherence Score Calculation
**Source:** PV_PA_001 Checkpoint

**Evaluation Criteria:**

```yaml
weighted_coherence_formula:
  components:
    - criterion: "Capability-Task Alignment"
      weight: 0.35
      evaluation: "Does task match executor capabilities?"

    - criterion: "Accountability Clarity"
      weight: 0.25
      evaluation: "Is R/A/C/I clear for task?"

    - criterion: "Backup Coverage"
      weight: 0.15
      evaluation: "Is there clear backup executor?"

    - criterion: "Escalation Paths"
      weight: 0.10
      evaluation: "Are escalation routes defined?"

    - criterion: "Pattern Compliance"
      weight: 0.15
      evaluation: "Does task follow HO patterns?"

  formula: "(Σ(score_i × weight_i)) / Σ(weight_i)"

  example_calculation:
    capability_alignment: 0.92 × 0.35 = 0.322
    accountability: 0.90 × 0.25 = 0.225
    backup: 0.85 × 0.15 = 0.128
    escalation: 0.90 × 0.10 = 0.090
    pattern: 0.95 × 0.15 = 0.143
    ────────────────────────────────
    total_score: 0.908  # PASS (threshold: 0.8)
```

**Reusável em Squad-Creator:**

```yaml
HO-CV-002-SC: "Agent-Squad Coherence Assessment"

agents:
  - name: "@squad-creator:analyzer"
    capability_alignment: 0.92  # DNA extraction ✓
    accountability: 0.90        # Clear RACI ✓
    backup: 0.85                # Fallback template ✓
    escalation: 0.90            # QA review available ✓
    pattern: 0.95               # Follows HO-EP-002 ✓

    weighted_score: 0.91  # PASS
```

---

## RESUMO DE PATTERNS PARA IMPLEMENTAÇÃO

### Prioridade 1: CRÍTICO (Implementar Primeiro)

| Pattern | Descrição | Fase | Esforço |
|---------|-----------|------|---------|
| **HO-TP-001** | 8-field task anatomy | 5 | 3h |
| **HO-VC-001/002/003** | Veto conditions framework | 2-4 | 5h |
| **HO-HE-001** | Future back-casting | 2 | 4h |
| **HO-HE-002** | Coherence scan | 3 | 4h |
| **HO-QG-001** | Quality gate pattern | 6 | 6h |

### Prioridade 2: IMPORTANTE (Próximas)

| Pattern | Descrição | Fase | Esforço |
|---------|-----------|------|---------|
| **HO-HE-003** | Automation tipping point | 4 | 4h |
| **HO-AX-001** | Axioma validation | 6 | 8h |
| **HO-EP-001 a 004** | Executor patterns | 3 | 6h |

### Prioridade 3: COMPLEMENTAR (Depois)

| Pattern | Descrição | Uso |
|---------|-----------|-----|
| **HO-CV-001/002** | Coherence validation | Specific assessments |

---

## ESTRUTURA DE ARQUIVO RECOMENDADA (Self-Contained)

Para implementar todos os patterns no squad-creator, criar:

```
squads/squad-creator/
├── minds/                              # MIND ARTIFACTS (copiados de HybridOps)
│   └── pedro_valerio/
│       ├── heuristics/
│       │   ├── PV_BS_001.md           # Future Back-Casting
│       │   ├── PV_PA_001.md           # Systemic Coherence Scan
│       │   └── PV_PM_001.md           # Automation Tipping Point
│       └── artifacts/
│           ├── META_AXIOMAS.md        # 10 dimensões
│           └── Assinatura_Linguistica.md
│
├── config/                             # CONFIGURAÇÕES
│   ├── veto-conditions.yaml           # Engine de veto
│   ├── task-anatomy.yaml              # Schema 8 campos
│   ├── heuristics.yaml                # Engine de heuristics (adaptado)
│   ├── axioma-validator.yaml          # Scoring 10 dimensões
│   └── quality-gates.yaml             # Quality gates por fase
│
├── patterns/                           # PATTERNS ADAPTADOS
│   ├── veto-conditions/
│   │   ├── SC-VC-001-vision-clarity.yaml
│   │   ├── SC-VC-002-agent-coherence.yaml
│   │   └── SC-VC-003-guardrail-requirement.yaml
│   │
│   ├── heuristics/
│   │   ├── SC-HE-001-squad-vision.md
│   │   ├── SC-HE-002-agent-coherence.md
│   │   └── SC-HE-003-workflow-automation.md
│   │
│   ├── quality-gates/
│   │   └── SC-QG-001-pattern.yaml
│   │
│   └── executors/
│       ├── SC-EP-001-human.yaml
│       ├── SC-EP-002-agent.yaml
│       ├── SC-EP-003-hybrid.yaml
│       └── SC-EP-004-worker.yaml
│
└── scripts/                            # VALIDADORES
    ├── task-anatomy-validator.py
    └── coherence-validator.py
```

**NOTA:** Prefixo `SC-` = Squad-Creator (adaptação local). Prefixo `PV_` ou `HO-` = Original do HybridOps.

---

## INTEGRAÇÃO COM WORKFLOW EXISTENTE

### Fluxo Atual do Squad-Creator

```
squad-chief (orquestra)
    ↓ *create-squad, *review-*
oalanicolas (extrai)
    ↓ INSUMOS_READY (template: handoff-insumos-tmpl.yaml)
pedro-valerio (constrói)
    ↓ Artefatos validados
squad-chief (revisa)
    ↓ *review-extraction, *review-artifacts
Entrega final
```

### Template de Handoff (Já Existe)

**Path:** `squads/squad-creator/templates/handoff-insumos-tmpl.yaml`

O Pedro Valério aceita insumos no formato:
```yaml
handoff_type: INSUMOS_READY
from: "@oalanicolas"
to: "@pedro-valerio"

insumos:
  voice_dna:
    signature_phrases: ["...", "..."]  # Mínimo 5
    source_verified: true               # OBRIGATÓRIO
  thinking_dna:
    frameworks: ["...", "..."]
    heuristics: ["...", "..."]
  quotes:
    verified_count: 15                  # Mínimo 15

validation_gates:
  - all_sources_have_SOURCE_tag: true
  - min_quotes: 15
  - min_signature_phrases: 5
```

### Veto no Handoff

Se insumos incompletos, Pedro Valério **devolve** para @oalanicolas:

```yaml
veto_handoff:
  trigger: "insumos_incomplete"
  conditions:
    - "< 15 citações verificáveis"
    - "< 5 signature phrases"
    - "Conceitos sem [SOURCE:]"
    - "Inferências não marcadas"
  action: "DEVOLVER para @oalanicolas com lista específica"
```

---

## CONCLUSÃO

Extraí **23 patterns reutilizáveis** do HybridOps squad:

- **3 Veto Conditions** (para quality gates)
- **1 Task Anatomy pattern** (8 campos obrigatórios)
- **3 Heuristics** (PV_BS_001, PV_PA_001, PV_PM_001)
- **1 Axioma Validator** (10 dimensões)
- **3 Quality Gate types** (Automated, Hybrid, Manual)
- **4 Executor Patterns** (Human, Agent, Hybrid, Worker)
- **2 Coherence Validation** patterns

**ADICIONAL (v1.2):**
- **4 Modos do Pedro Valério** com mapeamento modo → pattern
- **5 Mind Artifacts** COPIADOS para dentro do squad-creator (self-contained)
- **Integração com workflow** squad-chief → oalanicolas → pedro-valerio
- **Zero referências externas** - squad é 100% portável

Todos estão **prontos para adaptação** ao squad-creator com minimal customization. Recomendo iniciar pela **Fase 0 (Agent Update)** antes dos patterns.

---

## CHANGELOG

| Versão | Data | Mudanças |
|--------|------|----------|
| v1.2 | 2026-02-10 | Self-contained: COPIAR artifacts, zero refs externas |
| v1.1 | 2026-02-10 | 4 Modos, Mind Artifacts, Workflow integration |
| v1.0 | 2026-02-10 | Versão inicial - 23 patterns extraídos |

---

*Documento atualizado: 2026-02-10 v1.2*
