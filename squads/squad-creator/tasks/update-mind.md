---
task-id: update-mind
name: Update Existing Agent DNA (Brownfield)
version: 2.0.0
execution_type: Hybrid
model: Sonnet
haiku_eligible: false
estimated-time: 1-2 hours
complexity: medium
note: "Para atualizar agents em squads criados pelo squad-creator"

inputs:
  required:
    - squad_name: "Nome do squad (ex: copy, legal)"
    - agent_slug: "Slug do agent existente (snake_case)"
  optional:
    - new_sources_path: "Caminho para novas fontes"
    - focus: "voice|thinking|both (default: both)"
    - mode: "merge|replace|selective"

outputs:
  primary:
    - updated_agent: "Agent file atualizado com novo DNA"
    - diff_report: "Relatório do que mudou"

elicit: true
---

# Update Existing Agent DNA (Brownfield)

> **Princípio:** "Evolução > Revolução. Preserve o que funciona, adicione o que falta."
>
> **Regra:** NUNCA substituir DNA existente sem validar que o novo é melhor.
>
> **Escopo:** Agents em `squads/{squad}/agents/` criados pelo squad-creator.

---

## FASE 0: LOAD EXISTING DNA (5 min)

### 0.1 Localizar Arquivos Existentes

```yaml
existing_files:
  agent_file: "squads/{squad_name}/agents/{agent_slug}.md"
  sources_dir: "squads/{squad_name}/minds/{agent_slug}/sources/"  # Se existir
  metadata: "squads/{squad_name}/minds/{agent_slug}/metadata.yaml"  # Se existir
```

### 0.2 Snapshot Before

```yaml
snapshot_before:
  voice_dna:
    power_words_count: 0
    signature_phrases_count: 0
    stories_count: 0
    anti_patterns_count: 0

  thinking_dna:
    frameworks_count: 0
    heuristics_count: 0
    recognition_patterns_count: 0

  sources:
    total: 0
    tier_1: 0

  quality_scores:
    voice: "X/10"
    thinking: "X/9"
    fidelity_estimate: "X%"
```

---

## FASE 1: PROCESS NEW SOURCES (30 min)

### 1.1 Validar Novas Fontes

Execute `collect-sources.md` para novas fontes APENAS:

```yaml
new_sources_validation:
  sources_provided: []
  tier_classification: {}
  adds_to_existing: true|false
  fills_gaps: []
```

### 1.2 Identificar Gaps que Novas Fontes Preenchem

```yaml
gap_analysis:
  voice_gaps_before:
    - "Faltavam anedotas pessoais"
    - "Tom em situação X não documentado"

  thinking_gaps_before:
    - "Heurística de priorização incompleta"
    - "Objection handling não tinha exemplos"

  gaps_filled_by_new_sources:
    - gap: ""
      source: ""
      confidence: "alta|média|baixa"
```

---

## FASE 2: EXTRACT FROM NEW SOURCES (45 min)

### 2.1 Voice DNA Delta

Execute `extract-voice-dna.md` nas novas fontes:

```yaml
voice_delta:
  new_power_words: []
  new_signature_phrases: []
  new_stories: []
  new_anti_patterns: []
  new_contradictions: []

  confirms_existing:
    - element: ""
      source_count: "+1"

  contradicts_existing:
    - element: ""
      existing: ""
      new_finding: ""
      resolution: "keep_existing|use_new|flag_for_review"
```

### 2.2 Thinking DNA Delta

Execute `extract-thinking-dna.md` nas novas fontes:

```yaml
thinking_delta:
  new_recognition_patterns: []
  new_heuristics: []
  new_objection_responses: []
  new_handoff_triggers: []

  framework_updates:
    - framework: ""
      change_type: "new_step|clarification|example"
      detail: ""

  contradicts_existing:
    - element: ""
      existing: ""
      new_finding: ""
      resolution: ""
```

---

## FASE 3: MERGE STRATEGY (15 min)

### 3.1 Merge Modes

| Mode | Comportamento |
|------|---------------|
| **merge** | Adiciona novos elementos, preserva existentes |
| **replace** | Substitui seções onde novo é significativamente melhor |
| **selective** | Checkpoint por seção, usuário decide |

### 3.2 Merge Rules

```yaml
merge_rules:
  # SEMPRE adicionar (não duplicar)
  additive:
    - power_words
    - signature_phrases
    - stories
    - heuristics
    - recognition_patterns

  # NUNCA substituir sem validação
  protected:
    - primary_framework  # Core identity
    - identity_statement
    - veto_heuristics

  # Substituir se novo score > existente
  replace_if_better:
    - diagnostic_questions
    - objection_responses
    - decision_pipeline
```

### 3.3 Conflict Resolution

```yaml
conflicts:
  - section: ""
    existing_value: ""
    new_value: ""
    recommendation: "keep|replace|merge"
    rationale: ""

  resolution_strategy:
    auto_resolve:
      - "Novo elemento não existe no atual → ADICIONAR"
      - "Mesmo elemento com mais detalhes → ENRIQUECER"
      - "Mesmo elemento com exemplos adicionais → ADICIONAR EXEMPLOS"

    require_human:
      - "Contradição direta em framework"
      - "Mudança em identity_statement"
      - "Remoção de elemento existente"
```

---

## FASE 4: APPLY UPDATES (10 min)

### 4.1 Generate Updated Files

```yaml
updated_files:
  agent_file:
    path: "squads/{squad_name}/agents/{agent_slug}.md"
    backup: "squads/{squad_name}/.backup/{agent_slug}.{timestamp}.md"
    sections_updated: []

  metadata:
    path: "squads/{squad_name}/minds/{agent_slug}/metadata.yaml"
    new_sources_added: 0
```

### 4.2 Update Agent (if exists)

```yaml
agent_update:
  agent_exists: true|false
  agent_path: ""

  sections_to_regenerate:
    - "voice_dna block"
    - "thinking_dna block"

  preserve:
    - "Custom instructions"
    - "Squad-specific config"
    - "Handoff rules"
```

---

## FASE 5: DIFF REPORT (5 min)

### 5.1 Generate Diff

```yaml
diff_report:
  summary:
    elements_added: 0
    elements_updated: 0
    elements_unchanged: 0
    conflicts_resolved: 0

  voice_changes:
    - section: "power_words"
      before_count: 10
      after_count: 15
      delta: "+5"

    - section: "stories"
      before_count: 3
      after_count: 5
      delta: "+2"

  thinking_changes:
    - section: "heuristics"
      before_count: 5
      after_count: 8
      delta: "+3"

  quality_impact:
    voice_score:
      before: "7/10"
      after: "9/10"

    thinking_score:
      before: "6/9"
      after: "8/9"

    fidelity_estimate:
      before: "70%"
      after: "85%"
```

### 5.2 Snapshot After

```yaml
snapshot_after:
  voice_dna:
    power_words_count: 0
    signature_phrases_count: 0
    stories_count: 0
    anti_patterns_count: 0

  thinking_dna:
    frameworks_count: 0
    heuristics_count: 0
    recognition_patterns_count: 0

  sources:
    total: 0
    tier_1: 0
```

---

## OUTPUT: UPDATE REPORT

```yaml
# ═══════════════════════════════════════════════════════════════
# MIND UPDATE REPORT - {MIND_NAME}
# Updated: {DATE}
# Mode: {merge|replace|selective}
# ═══════════════════════════════════════════════════════════════

update_report:
  metadata:
    mind_name: ""
    mind_slug: ""
    update_date: ""
    mode: ""
    new_sources_processed: 0

  # ─────────────────────────────────────────────────────────────
  # CHANGES SUMMARY
  # ─────────────────────────────────────────────────────────────

  changes:
    voice_dna:
      added: []
      updated: []
      unchanged: []

    thinking_dna:
      added: []
      updated: []
      unchanged: []

  # ─────────────────────────────────────────────────────────────
  # QUALITY IMPACT
  # ─────────────────────────────────────────────────────────────

  quality:
    before:
      voice_score: ""
      thinking_score: ""
      fidelity: ""

    after:
      voice_score: ""
      thinking_score: ""
      fidelity: ""

    improvement: "+X%"

  # ─────────────────────────────────────────────────────────────
  # FILES MODIFIED
  # ─────────────────────────────────────────────────────────────

  files:
    updated:
      - path: ""
        changes: ""

    backed_up:
      - original: ""
        backup: ""

  # ─────────────────────────────────────────────────────────────
  # NEXT STEPS
  # ─────────────────────────────────────────────────────────────

  next_steps:
    - "Regenerar agent.md se qualidade aumentou significativamente"
    - "Rodar smoke tests para validar mudanças"
    - "Atualizar squad config se necessário"

# ═══════════════════════════════════════════════════════════════
```

---

## COMMANDS

```bash
# Update agent com novas fontes
*update-mind copy gary_halbert --sources /path/to/new/materials

# Update apenas voice
*update-mind copy gary_halbert --focus voice --sources /path/to/interviews

# Update com merge manual
*update-mind legal contract_lawyer --mode selective
```

---

## QUALITY CHECK

- [ ] DNA existente carregado com sucesso
- [ ] Snapshot "before" criado
- [ ] Novas fontes processadas
- [ ] Conflicts identificados e resolvidos
- [ ] Backup criado antes de modificar
- [ ] Diff report gerado
- [ ] Quality scores atualizados

**BLOCKING:** Não modificar arquivos sem backup criado.

---

**Squad Architect | Update Agent DNA v2.0**
_Last Updated: 2026-02-11_
*"Evolution beats revolution. Preserve what works, add what's missing."*
