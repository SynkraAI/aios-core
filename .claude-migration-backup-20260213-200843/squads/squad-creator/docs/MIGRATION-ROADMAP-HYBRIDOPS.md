# ROADMAP DE MIGRAÇÃO: HybridOps Patterns → Squad-Creator

**Data:** 2026-02-10
**Status:** Planejado
**Patterns Reference:** `data/hybridops-patterns.md`
**Última Atualização:** 2026-02-10 (v1.1 - Adicionado Fase 0 + Mind Artifacts)

---

## VISÃO GERAL

Migrar patterns do HybridOps para fortalecer o squad-creator com:
- **4 Modos do Pedro Valério** (validado com Pedro original)
- **Veto Conditions** que bloqueiam artefatos ruins
- **Task Anatomy** padronizado (8 campos)
- **Heuristics Engine** para validação rigorosa
- **Axioma 10-Dimensões** para scoring multidimensional
- **Coherence Validation** para detectar contradições
- **Integração com workflow** squad-chief → oalanicolas → pedro-valerio

**EXCLUÍDO DO ESCOPO:**
- ~~Dual-Mode Execution~~ (não aplicável ao squad-creator)
- ~~ClickUp Integration~~ (não aplicável ao squad-creator)

---

## FASE 0: AGENT UPDATE (ANTES de tudo)
**Objetivo:** Atualizar pedro-valerio.md com os 4 modos validados

### 0.1 Atualizar Agent File com 4 Modos

**Task:** Implementar estrutura do Squad OPS no agent

**Arquivo a modificar:** `squads/squad-creator/agents/pedro-valerio.md`

**Mudanças:**

```yaml
# ADICIONAR após PERSONA section

## MODOS DE OPERAÇÃO

modes:
  engenheiro_processos:
    name: "Engenheiro de Processos"
    icon: "🔍"
    description: "Mapeia processo do fim pro começo, encontra gaps"
    commands:
      - "*map-process {processo}" - Mapear processo completo
      - "*find-gaps {workflow}" - Identificar gaps de tempo
      - "*identify-owners {processo}" - Descobrir quem faz o quê
    tools: ["Figma", "Notion", "Google Docs", "Loom"]
    patterns_used: ["HO-HE-001", "HO-VC-001"]
    veto_conditions:
      - "Vision clarity < 0.7"
      - "Processo sem owner identificado"

  arquiteto_sistemas:
    name: "Arquiteto de Sistemas"
    icon: "🏗️"
    description: "Define estrutura, statuses, campos, permissões"
    commands:
      - "*design-structure {sistema}" - Criar estrutura
      - "*create-statuses {workflow}" - Definir fluxo de status
      - "*define-fields {entidade}" - Campos personalizados
    tools: ["ClickUp", "Notion", "Google Drive", "Airtable"]
    patterns_used: ["HO-TP-001", "HO-EP-001/002/003/004"]
    veto_conditions:
      - "Status workflow permite voltar"
      - "Campos obrigatórios faltando"

  arquiteto_automacao:
    name: "Arquiteto de Automação"
    icon: "⚡"
    description: "Cria regras que bloqueiam erros, conecta sistemas"
    commands:
      - "*create-rules {sistema}" - Regras de bloqueio
      - "*connect-systems {a} {b}" - Integrar sistemas
      - "*design-triggers {workflow}" - Gatilhos automáticos
    tools: ["ClickUp Automations", "N8N", "Webhooks", "APIs"]
    patterns_used: ["HO-HE-003", "HO-VC-003", "HO-QG-001"]
    veto_conditions:
      - "Automação sem 5 guardrails"
      - "Sem manual escape route"

  construtor_templates:
    name: "Construtor de Templates"
    icon: "📋"
    description: "Cria templates replicáveis, testa com pessoa de fora"
    commands:
      - "*create-template {tipo}" - Template replicável
      - "*write-instructions {processo}" - Instruções claras
      - "*test-leigo {template}" - Teste da filha
    tools: ["Notion", "ClickUp", "Markdown", "Loom"]
    patterns_used: ["HO-QG-001", "HO-CV-001", "HO-AX-001"]
    veto_conditions:
      - "Template precisa de treinamento"
      - "Instrução fora do sistema"
```

**Atualizar Greeting:**

```
⚙️ **Pedro Valério** - AI Head de OPS

"Tá ligado que processo que permite erro é processo quebrado, né?
Me passa os insumos que eu construo os artefatos."

**Modos de Operação:**
🔍 `*eng-` - Engenheiro de Processos (mapear, gaps, owners)
🏗️ `*arq-` - Arquiteto de Sistemas (estrutura, status, campos)
⚡ `*auto-` - Arquiteto de Automação (regras, triggers, integrações)
📋 `*tmpl-` - Construtor de Templates (templates, instruções, teste)

**Comandos de Criação:**
- `*create-task {name}` - Criar task a partir de insumos
- `*create-workflow {name}` - Criar workflow multi-fase
- `*create-agent {name}` - Criar agent a partir de DNA

`*help` para todos os comandos
```

**Acceptance Criteria:**
- [ ] 4 modos documentados no agent file
- [ ] Comandos mapeados por modo
- [ ] Greeting atualizado
- [ ] Patterns linkados por modo
- [ ] Veto conditions por modo

**Esforço:** 4h

---

### 0.2 Copiar Mind Artifacts para Squad-Creator (Self-Contained)

**Task:** Copiar artefatos do HybridOps para dentro do squad-creator

**REGRA:** Squad-creator deve ser 100% self-contained. Nenhuma referência externa.

**Estrutura a criar:**
```
squads/squad-creator/
├── minds/
│   └── pedro_valerio/
│       ├── heuristics/
│       │   ├── PV_BS_001.md       # Future Back-Casting
│       │   ├── PV_PA_001.md       # Systemic Coherence Scan
│       │   └── PV_PM_001.md       # Automation Tipping Point
│       └── artifacts/
│           ├── META_AXIOMAS.md    # 10 dimensões
│           └── Assinatura_Linguistica.md  # Voice DNA
```

**Comandos de cópia:**
```bash
# Criar estrutura
mkdir -p squads/squad-creator/minds/pedro_valerio/{heuristics,artifacts}

# Copiar heuristics
cp squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/PV_BS_001.md \
   squads/squad-creator/minds/pedro_valerio/heuristics/
cp squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/PV_PA_001.md \
   squads/squad-creator/minds/pedro_valerio/heuristics/
cp squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/PV_PM_001.md \
   squads/squad-creator/minds/pedro_valerio/heuristics/

# Copiar artifacts
cp squads/hybrid-ops-squad/minds/pedro_valerio/artifacts/META_AXIOMAS.md \
   squads/squad-creator/minds/pedro_valerio/artifacts/
cp squads/hybrid-ops-squad/minds/pedro_valerio/artifacts/Assinatura_Linguistica.md \
   squads/squad-creator/minds/pedro_valerio/artifacts/
```

**Sync com .claude/commands/:**
```bash
# Copiar para commands também
mkdir -p .claude/commands/squad-creator/minds/pedro_valerio/{heuristics,artifacts}
cp -r squads/squad-creator/minds/pedro_valerio/* \
   .claude/commands/squad-creator/minds/pedro_valerio/
```

**Acceptance Criteria:**
- [ ] 3 heuristics copiados para squad-creator/minds/
- [ ] 2 artifacts copiados para squad-creator/minds/
- [ ] Zero referências externas
- [ ] Squad-creator é 100% self-contained
- [ ] Sync com .claude/commands/ feito

**Esforço:** 1h

---

### 0.3 Sync com .claude/commands/

**Task:** Sincronizar agent atualizado

**Comando:**
```bash
cp squads/squad-creator/agents/pedro-valerio.md .claude/commands/squad-creator/agents/pedro-valerio.md
```

**Ou usar script existente:**
```bash
python squads/squad-creator/scripts/sync-ide-command.py
```

**Esforço:** 0.5h

---

## FASE 1: FOUNDATION (Semana 1)
**Objetivo:** Estabelecer base de veto conditions e task anatomy

### 1.1 Implementar Veto Conditions Framework

**Task:** Criar engine de veto conditions em quality gates

**Arquivos a criar:**
```
squads/squad-creator/
├── config/
│   └── veto-conditions.yaml       # Engine de veto (NEW)
├── checklists/
│   └── veto-validation.md         # Checklist de veto (NEW)
```

**Estrutura `veto-conditions.yaml`:**
```yaml
veto_engine:
  version: "1.0"

  conditions:
    # Phase 2: Architecture
    SC_VC_001:
      name: "Vision Clarity Veto"
      phase: "architecture"
      trigger: "squad_vision_clarity < 0.7"
      action: "VETO - Return to discovery"
      severity: "BLOCKING"
      source_pattern: "HO-VC-001"

    # Phase 3: Agent Design
    SC_VC_002:
      name: "Agent Coherence Veto"
      phase: "agent_design"
      trigger: "agent_behavior_coherence < 0.7"
      action: "VETO - Reject agent, redesign"
      severity: "CRITICAL"
      source_pattern: "HO-VC-002"

    # Phase 4: Workflow Design
    SC_VC_003:
      name: "Guardrail Missing Veto"
      phase: "workflow_design"
      trigger: "guardrails_present = false"
      action: "VETO - Define guardrails first"
      severity: "BLOCKING"
      required_guardrails:
        - loop_prevention
        - idempotency
        - audit_trail
        - manual_escape
        - retry_logic
      source_pattern: "HO-VC-003"

    # Phase 5: DNA Extraction
    SC_VC_004:
      name: "Source Quality Veto"
      phase: "dna_extraction"
      trigger: "source_quality_score < 0.6"
      action: "VETO - Insufficient sources"
      severity: "BLOCKING"

    # Phase 6: Validation
    SC_VC_005:
      name: "Smoke Test Veto"
      phase: "validation"
      trigger: "smoke_tests_passed < 3"
      action: "VETO - Agent behavior invalid"
      severity: "CRITICAL"

  outcomes:
    APPROVE: "Proceed to next phase"
    REVIEW: "Address concerns before proceeding"
    VETO: "BLOCKED - Cannot proceed until resolved"
```

**Integração em tasks:**
- `validate-squad.md` - Adicionar veto checks por fase
- `create-agent.md` - Adicionar SC_VC_002 check
- `create-workflow.md` - Adicionar SC_VC_003 check

**Acceptance Criteria:**
- [ ] `veto-conditions.yaml` criado com 5+ conditions
- [ ] Veto checks integrados em validate-squad.md
- [ ] VETO bloqueia progresso até resolução
- [ ] Log de vetos para auditoria

**Esforço:** 5h

---

### 1.2 Implementar Task Anatomy Validator (8 Campos)

**Task:** Criar validador automático de task anatomy

**Arquivos a criar/modificar:**
```
squads/squad-creator/
├── config/
│   └── task-anatomy.yaml          # Schema dos 8 campos (NEW)
├── scripts/
│   └── task-anatomy-validator.py  # Validador Python (NEW)
├── checklists/
│   └── task-anatomy-checklist.md  # UPDATE com enforcement
```

**Schema `task-anatomy.yaml`:**
```yaml
task_anatomy:
  version: "1.0"
  source_pattern: "HO-TP-001"

  required_fields:
    - field: "task_name"
      type: "string"
      validation: "starts_with_verb"
      error: "Task name must start with action verb (e.g., Extract, Validate, Generate)"

    - field: "status"
      type: "enum"
      values: ["pending", "in_progress", "review", "completed", "blocked"]
      error: "Invalid status value"

    - field: "responsible_executor"
      type: "string"
      validation: "role_or_agent_ref"
      error: "Must be role name or @agent reference"

    - field: "execution_type"
      type: "enum"
      values: ["Human", "Agent", "Hybrid", "Worker"]
      error: "Must be one of: Human, Agent, Hybrid, Worker"

    - field: "estimated_time"
      type: "string"
      validation: "has_unit"
      pattern: "\\d+[hmd]|\\d+-\\d+[hmd]"
      error: "Must include time unit (h, m, d)"

    - field: "input"
      type: "array"
      validation: "non_empty"
      min_items: 1
      error: "Input array must have at least 1 item"

    - field: "output"
      type: "array"
      validation: "non_empty"
      min_items: 1
      error: "Output array must have at least 1 item"

    - field: "action_items"
      type: "array"
      validation: "non_empty"
      min_items: 1
      error: "Action items must have at least 1 step"

  optional_fields:
    - field: "acceptance_criteria"
      type: "array"
      recommended: true

    - field: "tools"
      type: "array"

    - field: "templates"
      type: "array"

    - field: "quality_gate"
      type: "string"

    - field: "handoff"
      type: "object"

  validation_result:
    pass: "All 8 required fields present and valid"
    fail: "VETO - Task anatomy incomplete"
```

**Acceptance Criteria:**
- [ ] `task-anatomy.yaml` schema criado
- [ ] `task-anatomy-validator.py` implementado
- [ ] Validação integrada em `create-task.md`
- [ ] Falha em 8-field = VETO automático

**Esforço:** 3h

---

## FASE 2: HEURISTICS ENGINE (Semana 2)
**Objetivo:** Implementar heuristics de validação com veto power

### 2.1 Implementar SC_HE_001 - Squad Vision Validation

**Task:** Adaptar PV_BS_001 (Future Back-Casting) para squad-creator

**Arquivo:** `squads/squad-creator/config/heuristics.yaml`

```yaml
heuristics:
  SC_HE_001:
    name: "Squad Vision Validation"
    source_pattern: "HO-HE-001 (PV_BS_001)"
    phase: "architecture"

    question: "Does this squad architecture enable its stated purpose?"

    weights:
      squad_purpose_clarity: 0.9
      agent_coverage: 0.8
      workflow_completeness: 0.7

    thresholds:
      high_confidence: 0.8
      medium_confidence: 0.7
      veto_threshold: 0.6

    evaluation_points:
      - "Squad purpose clearly defined?"
      - "Agents cover all required capabilities?"
      - "Workflows connect agents properly?"
      - "Quality gates prevent bad outputs?"
      - "Handoffs have zero gaps?"

    outcomes:
      APPROVE: "Squad architecture is sound"
      REVIEW: "Minor gaps, address before Phase 3"
      VETO: "Architecture fails to serve purpose"
```

**Esforço:** 4h

---

### 2.2 Implementar SC_HE_002 - Agent Coherence Scan

**Task:** Adaptar PV_PA_001 (Systemic Coherence) para validar agents

**Adicionar a `heuristics.yaml`:**

```yaml
  SC_HE_002:
    name: "Agent Coherence Scan"
    source_pattern: "HO-HE-002 (PV_PA_001)"
    phase: "agent_validation"

    purpose: "Validate agent behavior matches documented persona"

    weights:
      output_consistency: 1.0      # VETO power
      persona_alignment: 0.9
      guardrail_compliance: 1.0    # VETO power

    thresholds:
      coherent: 0.7
      inconsistent: 0.4
      incoherent: 0.0

    veto_conditions:
      - condition: "output_consistency < 0.7"
        action: "VETO - Agent output varies unexpectedly"
      - condition: "guardrail_compliance < 1.0"
        action: "VETO - Agent violates safety guardrails"

    tests:
      - name: "Consistency Test"
        method: "Run same input 10x"
        threshold: "10/10 identical outputs"

      - name: "Persona Alignment Test"
        method: "Compare output style to voice_dna"
        threshold: ">90% alignment"

      - name: "Guardrail Compliance Test"
        method: "Test edge cases against anti_patterns"
        threshold: "0 violations"

    outcomes:
      APPROVE: "Agent is coherent and reliable"
      REVIEW: "Minor inconsistencies, investigate"
      VETO: "Agent is incoherent, redesign required"
```

**Esforço:** 4h

---

### 2.3 Implementar SC_HE_003 - Workflow Automation Validation

**Task:** Adaptar PV_PM_001 (Automation Tipping Point) para workflows

**Adicionar a `heuristics.yaml`:**

```yaml
  SC_HE_003:
    name: "Workflow Automation Validation"
    source_pattern: "HO-HE-003 (PV_PM_001)"
    phase: "workflow_validation"

    purpose: "Ensure workflows have proper automation with guardrails"

    automation_mandate:
      rule_1: "Task repeated 2+ times → Document and automate"
      rule_2: "Task repeated 3+ times without automation → Design failure"
      rule_3: "Any automation MUST have 5 guardrails"

    required_guardrails:
      - name: "loop_prevention"
        description: "Max iterations, deduplication"
      - name: "idempotency"
        description: "Same input → same output"
      - name: "audit_trail"
        description: "Log all state changes"
      - name: "manual_escape"
        description: "Human override route"
      - name: "retry_logic"
        description: "Graceful failure handling"

    weights:
      guardrails_present: 1.0    # VETO power
      checkpoint_coverage: 0.9
      unidirectional_flow: 0.9
      handoff_continuity: 0.8

    validation_matrix:
      - check: "Has checkpoints per phase"
        required: true
      - check: "Flow is unidirectional"
        required: true
      - check: "Veto conditions defined"
        required: true
      - check: "Zero time gaps in handoffs"
        required: true
      - check: "All 5 guardrails present"
        required: true
        veto_on_fail: true

    outcomes:
      APPROVE: "Workflow is well-designed"
      REVIEW: "Missing non-critical elements"
      VETO: "Missing guardrails or critical flaws"
```

**Esforço:** 4h

---

## FASE 3: AXIOMA & QUALITY (Semana 3)
**Objetivo:** Scoring multidimensional e quality gates avançados

### 3.1 Implementar Axioma 10-Dimensões

**Task:** Criar framework de avaliação multidimensional

**Arquivo:** `squads/squad-creator/config/axioma-validator.yaml`

```yaml
axioma_validator:
  version: "1.0"
  source_pattern: "HO-AX-001"

  dimensions:
    - id: 1
      name: "Truthfulness"
      description: "Accuracy and reliability of outputs"
      weight: 1.0
      threshold: 7.0
      veto_power: true
      squad_creator_application: "Agent outputs are verifiable and consistent"

    - id: 2
      name: "Coherence"
      description: "Internal consistency and logic"
      weight: 0.9
      threshold: 6.0
      veto_power: false
      squad_creator_application: "Agent behavior matches documented persona"

    - id: 3
      name: "Strategic Alignment"
      description: "Supports organizational objectives"
      weight: 0.9
      threshold: 6.0
      veto_power: false
      squad_creator_application: "Squad serves its stated purpose"

    - id: 4
      name: "Operational Excellence"
      description: "Efficiency, reliability, documentation"
      weight: 0.8
      threshold: 6.0
      veto_power: false
      squad_creator_application: "Workflows are efficient and documented"

    - id: 5
      name: "Innovation Capacity"
      description: "Ability to improve and adapt"
      weight: 0.7
      threshold: 5.0
      veto_power: false
      squad_creator_application: "Squad can evolve with new agents/tasks"

    - id: 6
      name: "Risk Management"
      description: "Identification and mitigation of risks"
      weight: 0.8
      threshold: 6.0
      veto_power: false
      squad_creator_application: "Guardrails and veto conditions present"

    - id: 7
      name: "Resource Optimization"
      description: "Efficient use of time/money/compute"
      weight: 0.8
      threshold: 6.0
      veto_power: false
      squad_creator_application: "Worker tasks where possible, Agent only when needed"

    - id: 8
      name: "Stakeholder Value"
      description: "Value delivered to all parties"
      weight: 0.7
      threshold: 6.0
      veto_power: false
      squad_creator_application: "Squad solves real problems"

    - id: 9
      name: "Sustainability"
      description: "Long-term viability"
      weight: 0.7
      threshold: 6.0
      veto_power: false
      squad_creator_application: "No custom code, config-driven"

    - id: 10
      name: "Adaptability"
      description: "Capacity for evolution"
      weight: 0.6
      threshold: 5.0
      veto_power: false
      squad_creator_application: "Squad can be extended easily"

  scoring:
    formula: "(Σ(score_i × weight_i)) ÷ Σ(weight_i)"
    pass_threshold: 7.0
    per_dimension_minimum: 6.0
    veto_trigger: "truthfulness < 7.0"

  assessment_template: |
    ## Axioma Assessment: {squad_name}

    | Dimension | Score | Threshold | Status |
    |-----------|-------|-----------|--------|
    | Truthfulness | {score_1}/10 | 7.0 | {status_1} |
    | Coherence | {score_2}/10 | 6.0 | {status_2} |
    | ... | ... | ... | ... |

    **Overall Score:** {overall}/10
    **Status:** {APPROVE|REVIEW|VETO}
```

**Esforço:** 8h

---

### 3.2 Implementar Quality Gates Avançados

**Task:** Criar estrutura de quality gates por tipo

**Arquivo:** `squads/squad-creator/config/quality-gates.yaml`

```yaml
quality_gates:
  version: "1.0"
  source_pattern: "HO-QG-001"

  gate_types:
    automated:
      executor: "System/Worker"
      speed: "<1 second"
      use_case: "Deterministic checks"
      examples:
        - "YAML syntax validation"
        - "Required fields present"
        - "Schema compliance"

    hybrid:
      executor: "System + Human"
      speed: "1-5 minutes"
      use_case: "AI prepares, human approves"
      examples:
        - "Agent output review"
        - "DNA extraction validation"
        - "Template generation check"

    manual:
      executor: "Human"
      speed: "1-8 hours"
      use_case: "Judgment-based decisions"
      examples:
        - "Squad acceptance"
        - "Go-live approval"
        - "Architecture sign-off"

  gates:
    # Phase 1: Discovery
    QG_SC_1_1:
      name: "Domain Viability Check"
      phase: 1
      type: "hybrid"
      criteria:
        - "Elite minds exist in domain (≥3)"
        - "Documented frameworks available"
        - "Sources are accessible"
      veto_on_fail: true

    # Phase 2: Architecture
    QG_SC_2_1:
      name: "Architecture Validation"
      phase: 2
      type: "automated"
      criteria:
        - "Squad purpose defined"
        - "Agent tiers assigned"
        - "Orchestrator exists"
      veto_on_fail: true

    # Phase 3: DNA Extraction
    QG_SC_3_1:
      name: "DNA Completeness"
      phase: 3
      type: "automated"
      criteria:
        - "Voice DNA extracted"
        - "Thinking DNA extracted"
        - "≥5 axiomas per agent"
        - "≥5 signature phrases"
      veto_on_fail: true

    # Phase 4: Agent Creation
    QG_SC_4_1:
      name: "Agent Quality Gate"
      phase: 4
      type: "hybrid"
      criteria:
        - "3/3 smoke tests pass"
        - "Voice DNA verified with [SOURCE:]"
        - "Heuristics have WHEN context"
        - "Handoffs defined"
      veto_on_fail: true

    # Phase 5: Workflow Integration
    QG_SC_5_1:
      name: "Workflow Validation"
      phase: 5
      type: "automated"
      criteria:
        - "Checkpoints per phase"
        - "Veto conditions defined"
        - "Unidirectional flow"
        - "5 guardrails present"
      veto_on_fail: true

    # Phase 6: Final Validation
    QG_SC_6_1:
      name: "Squad Acceptance"
      phase: 6
      type: "manual"
      criteria:
        - "Axioma score ≥7.0"
        - "All previous gates passed"
        - "Documentation complete"
      veto_on_fail: true
```

**Esforço:** 6h

---

## FASE 4: EXECUTOR & COHERENCE (Semana 4)
**Objetivo:** Executor assignment validation e coherence detection

### 4.1 Implementar Executor Decision Tree

**Task:** Integrar executor-decision-tree.md com validação automática

**Arquivo a modificar:** `squads/squad-creator/data/executor-decision-tree.md`

**Adicionar seção de validação:**

```yaml
executor_validation:
  source_patterns:
    - "HO-EP-001 (Human)"
    - "HO-EP-002 (Agent)"
    - "HO-EP-003 (Hybrid)"
    - "HO-EP-004 (Worker)"

  validation_rules:
    worker_conditions:
      - "Task is 100% deterministic"
      - "No judgment required"
      - "Can be expressed as if/then rules"
      - "Examples: template application, field calculation, validation"

    agent_conditions:
      - "Requires reasoning over data"
      - "Pattern recognition needed"
      - "Content generation"
      - "NOT deterministic (multiple valid outputs)"

    hybrid_conditions:
      - "Agent prepares, human validates"
      - "Both judgment types needed"
      - "High-risk with human gate"

    human_conditions:
      - "Requires creativity or judgment"
      - "Stakeholder relationships"
      - "Strategic decisions"
      - "Cannot be automated"

  cost_comparison:
    worker: "$"
    agent: "$$$$"
    hybrid: "$$"
    human: "$$$"

  validation_check:
    - "Is execution_type aligned with task nature?"
    - "Could this be Worker instead of Agent? (cost savings)"
    - "Is Agent overkill for deterministic task?"
```

**Integração em `create-task.md`:**
- Adicionar check de executor type vs task nature
- Sugerir Worker quando Agent é overkill
- WARN se Agent usado para deterministic task

**Esforço:** 6h

---

### 4.2 Implementar Coherence Validation

**Task:** Criar validador de coerência para agents

**Arquivo:** `squads/squad-creator/scripts/coherence-validator.py`

```python
"""
Coherence Validator for Squad-Creator Agents
Source patterns: HO-CV-001, HO-CV-002
"""

class CoherenceValidator:
    COHERENT_THRESHOLD = 0.7
    INCONSISTENT_THRESHOLD = 0.4

    def validate_agent(self, agent_file: str) -> dict:
        """
        Validate agent coherence across multiple dimensions.

        Returns:
            dict with coherence_score, status, and recommendations
        """
        scores = {
            'capability_alignment': self._check_capability_alignment(),
            'accountability_clarity': self._check_raci_defined(),
            'backup_coverage': self._check_backup_exists(),
            'escalation_paths': self._check_escalation_defined(),
            'pattern_compliance': self._check_follows_patterns()
        }

        weights = {
            'capability_alignment': 0.35,
            'accountability_clarity': 0.25,
            'backup_coverage': 0.15,
            'escalation_paths': 0.10,
            'pattern_compliance': 0.15
        }

        weighted_score = sum(
            scores[k] * weights[k] for k in scores
        ) / sum(weights.values())

        if weighted_score >= self.COHERENT_THRESHOLD:
            status = "APPROVE"
        elif weighted_score >= self.INCONSISTENT_THRESHOLD:
            status = "REVIEW"
        else:
            status = "VETO"

        return {
            'coherence_score': weighted_score,
            'status': status,
            'dimension_scores': scores,
            'recommendations': self._generate_recommendations(scores)
        }
```

**Esforço:** 4h

---

## FASE 5: INTEGRATION & DOCUMENTATION (Semana 5)
**Objetivo:** Integrar tudo, atualizar squad-chief, e documentar

### 5.1 Integrar Patterns em Workflows

**Task:** Atualizar workflows para usar novos patterns

**Arquivos a modificar:**
- `workflows/wf-create-squad.yaml` - Adicionar veto checkpoints
- `workflows/wf-validate-squad.yaml` - Integrar axioma scoring
- `tasks/validate-squad.md` - Usar quality gates

**Esforço:** 4h

---

### 5.2 Atualizar Squad-Chief com Review Gates

**Task:** Integrar novos quality gates nos comandos de review

**Arquivo a modificar:** `squads/squad-creator/agents/squad-chief.md`

**Adicionar:**

```yaml
review_commands:
  review_extraction:
    uses_patterns:
      - "HO-HE-002 (Coherence Scan)" - Validar DNA extraído
      - "HO-CV-001 (Truthfulness)" - Verificar [SOURCE:] tags
    quality_gates:
      - "QG_SC_3_1: DNA Completeness"
    veto_conditions:
      - "< 15 citações verificáveis"
      - "< 5 signature phrases"

  review_artifacts:
    uses_patterns:
      - "HO-TP-001 (Task Anatomy)" - Validar 8 campos
      - "HO-HE-003 (Automation)" - Verificar guardrails
      - "HO-AX-001 (Axioma)" - Scoring final
    quality_gates:
      - "QG_SC_4_1: Agent Quality Gate"
      - "QG_SC_5_1: Workflow Validation"
    veto_conditions:
      - "Smoke tests < 3"
      - "Guardrails missing"
      - "Axioma score < 7.0"

  routing_to_pedro:
    modes_available:
      - "eng-*" → engenheiro_processos
      - "arq-*" → arquiteto_sistemas
      - "auto-*" → arquiteto_automacao
      - "tmpl-*" → construtor_templates
```

**Acceptance Criteria:**
- [ ] Review commands usam patterns corretos
- [ ] Routing para modos do Pedro documentado
- [ ] Quality gates integrados

**Esforço:** 4h

---

### 5.3 Validar Workflow End-to-End

**Task:** Testar fluxo completo com os novos patterns

**Teste:**
```
1. squad-chief recebe demanda
2. squad-chief delega para oalanicolas
3. oalanicolas extrai DNA, gera INSUMOS_READY
4. pedro-valerio (modo correto) constrói artefatos
5. squad-chief revisa com quality gates
6. Veto conditions funcionam (testar falha)
7. Axioma scoring calcula corretamente
```

**Acceptance Criteria:**
- [ ] Fluxo completo funciona
- [ ] Handoff template INSUMOS_READY validado
- [ ] Veto conditions bloqueiam quando devem
- [ ] Routing para modos correto

**Esforço:** 4h

---

### 5.4 Criar Pattern Library Consolidado

**Task:** Documentar todos os patterns disponíveis

**Arquivo:** `squads/squad-creator/docs/PATTERN-LIBRARY.md`

Conteúdo:
- Lista de todos patterns implementados
- Quando usar cada pattern
- Exemplos de aplicação
- Cross-reference com HybridOps
- Mapeamento modo → pattern

**Esforço:** 3h

---

### 5.5 Atualizar Documentação

**Task:** Atualizar docs com novos patterns

**Arquivos a modificar:**
- `docs/CONCEPTS.md` - Adicionar Veto Conditions, Axioma, 4 Modos
- `docs/FAQ.md` - Perguntas sobre quality gates e modos
- `README.md` - Mencionar heuristics engine e estrutura Squad OPS

**Esforço:** 3h

---

## CRONOGRAMA CONSOLIDADO (REVISADO v1.1)

| Semana | Fase | Deliverables | Esforço |
|--------|------|--------------|---------|
| **0** | Agent Update | pedro-valerio.md + 4 modos + Mind COPY + Sync | **7h** |
| **1** | Foundation | Veto Conditions + Task Anatomy | 8h |
| **2** | Heuristics | SC_HE_001, SC_HE_002, SC_HE_003 | 12h |
| **3** | Quality | Axioma 10-Dim + Quality Gates | 14h |
| **4** | Executor | Executor Validation + Coherence | 10h |
| **5** | Integration | Workflows + squad-chief + Docs + Test E2E | **18h** |

**Total:** ~69h (6 semanas, ~11.5h/semana)

**REGRA:** Squad-creator é 100% self-contained. Mind artifacts são COPIADOS, não referenciados.

**Breakdown Fase 0:**
- 0.1 Agent file com 4 modos: 4h
- 0.2 Copiar mind artifacts: 1h
- 0.3 Sync com .claude/commands/: 0.5h
- 0.4 Testar ativação: 1.5h

### Dependências

```
Fase 0 ──┬──> Fase 1 ──> Fase 2 ──> Fase 3
         │
         └──> Fase 4 ──────────────> Fase 5
```

- Fase 0 é PRÉ-REQUISITO para todas as outras
- Fases 1-4 podem ter paralelismo parcial
- Fase 5 depende de TODAS as anteriores

---

## CRITÉRIOS DE SUCESSO

### Métricas de Qualidade

| Métrica | Antes | Meta |
|---------|-------|------|
| **Pedro Valério tem 4 modos** | 0 | 4 |
| **Comandos mapeados por modo** | 0 | 12+ |
| Agents com veto check | 0% | 100% |
| Tasks com 8 campos | ~60% | 100% |
| Workflows com guardrails | ~40% | 100% |
| Squads com axioma score | 0% | 100% |
| **Mind artifacts copiados** | 0 | 5 |
| **Squad-chief usa quality gates** | 0 | 100% |

### Definição de Done

**Fase 0 (CRÍTICO):**
- [ ] pedro-valerio.md tem 4 modos documentados
- [ ] Comandos mapeados: `*eng-*`, `*arq-*`, `*auto-*`, `*tmpl-*`
- [ ] Greeting atualizado com modos
- [ ] Mind artifacts COPIADOS para minds/pedro_valerio/
- [ ] Sync com .claude/commands/ feito

**Fases 1-4:**
- [ ] Veto conditions bloqueiam artefatos ruins
- [ ] Task anatomy é enforced automaticamente
- [ ] Heuristics engine valida agents/workflows
- [ ] Axioma score é calculado para todo squad
- [ ] Quality gates têm 3 tipos (auto/hybrid/manual)
- [ ] Coherence validation detecta contradições

**Fase 5:**
- [ ] Squad-chief usa quality gates em reviews
- [ ] Workflow E2E testado e funcionando
- [ ] Handoff INSUMOS_READY validado
- [ ] Pattern library está documentado
- [ ] Todos os patterns têm source_pattern linkado

---

## RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Over-engineering | Média | Alto | Começar com P1 patterns apenas |
| Veto muito agressivo | Média | Médio | Tunning iterativo de thresholds |
| Adoção lenta | Baixa | Médio | Documentação clara + exemplos |
| Incompatibilidade | Baixa | Alto | Testar em squad existente primeiro |

---

## PRÓXIMOS PASSOS IMEDIATOS

### Semana 0 (FAZER AGORA)

1. **Atualizar `agents/pedro-valerio.md`** com 4 modos - 4h
2. **Copiar mind artifacts** de HybridOps para squad-creator - 1h
   ```bash
   mkdir -p squads/squad-creator/minds/pedro_valerio/{heuristics,artifacts}
   cp squads/hybrid-ops-squad/minds/pedro_valerio/heuristics/*.md \
      squads/squad-creator/minds/pedro_valerio/heuristics/
   cp squads/hybrid-ops-squad/minds/pedro_valerio/artifacts/*.md \
      squads/squad-creator/minds/pedro_valerio/artifacts/
   ```
3. **Atualizar greeting** com novos comandos - 0.5h
4. **Sync com `.claude/commands/`** - 0.5h
5. **Testar ativação** do Pedro com novos modos - 1h

### Semana 1 (Após Fase 0)

1. **Criar `config/veto-conditions.yaml`** - 2h
2. **Criar `config/task-anatomy.yaml`** - 1h
3. **Atualizar `validate-squad.md`** com veto checks - 2h
4. **Testar em squad existente** (copy ou hormozi) - 3h

---

## CHANGELOG

| Versão | Data | Mudanças |
|--------|------|----------|
| v1.2 | 2026-02-10 | Self-contained: COPIAR artifacts em vez de referenciar |
| v1.1 | 2026-02-10 | Adicionado Fase 0, Mind Artifacts, Squad-chief integration |
| v1.0 | 2026-02-10 | Versão inicial |

---

*Roadmap v1.2 - 2026-02-10*
