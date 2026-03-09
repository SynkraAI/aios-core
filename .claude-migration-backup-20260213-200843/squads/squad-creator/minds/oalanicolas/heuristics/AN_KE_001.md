# AN_KE_001 - Knowledge Extraction Architecture

**Type:** Primary Framework
**Phase:** 3 (DNA Extraction)
**Agent:** @oalanicolas
**Pattern:** Extraction Pipeline

## Purpose

Framework principal para extração de conhecimento com rastreabilidade total. Define o pipeline completo desde descoberta de fontes até validação final antes do handoff.

## Configuration

```yaml
AN_KE_001:
  name: "Knowledge Extraction Architecture"
  phase: 3
  agent: "@oalanicolas"

  pipeline:
    - step: 1
      name: "Source Discovery & Classification"
      action: "Identificar e classificar fontes (ouro/bronze)"
      veto_check: "AN_VC_001, AN_VC_003"
    - step: 2
      name: "Pareto ao Cubo"
      action: "Classificar em 4 zonas (0,8%, 4%, 20%, 80%)"
      heuristic: "AN_KE_003"
    - step: 3
      name: "Deconstruction"
      action: "Perguntas que revelam frameworks ocultos"
      task_file: "tasks/deconstruct.md"
    - step: 4
      name: "DNA Extraction"
      action: "Extrair Voice + Thinking DNA"
      veto_check: "AN_VC_002, AN_VC_004"
    - step: 5
      name: "Self-Validation"
      action: "Checklist antes do handoff"
      veto_check: "AN_VC_005"

  weights:
    source_quality: 0.9
    citation_coverage: 0.8
    trinity_completeness: 0.7

  thresholds:
    citations_minimum: 15
    signature_phrases_minimum: 5
    ouro_ratio_minimum: 0.6

  veto_conditions:
    - condition: "citations < 15"
      action: "VETO - Insufficient citations"
      maps_to: "AN_VC_004"
    - condition: "ouro_ratio < 0.6"
      action: "VETO - Too much bronze"
      maps_to: "AN_VC_003"
    - condition: "trinity_incomplete"
      action: "VETO - Missing Playbook, Framework, or Swipe"
      maps_to: "AN_VC_002"

  output:
    type: "decision"
    values: ["APPROVE", "REVIEW", "VETO"]
    handoff_to: "@pedro-valerio"
    handoff_format: "INSUMOS_READY"
```

## Decision Tree

```
IF (source_quality >= 0.6 AND citations >= 15 AND trinity_complete)
  THEN APPROVE → Proceed to handoff

ELSE IF (source_quality >= 0.6 AND citations < 15)
  THEN REVIEW → Extract more citations

ELSE IF (source_quality < 0.6)
  THEN VETO → Return to source curation

TERMINATION: Handoff approved with INSUMOS_READY format
FALLBACK: LOOP back to weakest step until all criteria pass
```

## Evaluation Criteria

| Criterion | Weight | Threshold | Description |
|-----------|--------|-----------|-------------|
| Source quality (ouro ratio) | 0.9 | >= 0.6 | Fontes ouro / total fontes |
| Citation coverage | 0.8 | >= 15 | Citações com [SOURCE:] |
| Trinity completeness | 0.7 | 3/3 | Playbook + Framework + Swipe |
| Signature phrases | 0.6 | >= 5 | Frases verificáveis do expert |

## Validation Questions

1. "As fontes são majoritariamente ouro (comentários, entrevistas, stories)?"
2. "Existem 15+ citações com [SOURCE: página/minuto]?"
3. "A Trindade está completa (Playbook + Framework + Swipe)?"
4. "Zero conceitos marcados como [INFERRED] sem validação?"
5. "Pareto ao Cubo foi aplicado (4 zonas classificadas)?"

## Performance Metrics

```yaml
performance:
  decision_speed: "1-2 hours per extraction iteration"
  accuracy_rate: "90% (when following pipeline strictly)"
  confidence_level: "85% (requires self-validation pass)"
  quality_correlation: "Direct - better sources = better clone"
```

## Failure Modes

### Volume Over Curation
- **Trigger:** Pressão por entregas rápidas, muitas fontes disponíveis
- **Manifestation:** 30h de áudio sem classificação = clone genérico
- **Detection:** Clone responses são genéricas, sem signature phrases
- **Recovery:** Voltar para Step 1, aplicar classificação ouro/bronze
- **Prevention:** Veto condition AN_VC_001 bloqueia volume sem curadoria

### Inference Without Source
- **Trigger:** Conceito parece óbvio, "todo mundo sabe"
- **Manifestation:** Clone fala coisas que expert nunca disse
- **Detection:** Buscar citação, não encontrar [SOURCE:]
- **Recovery:** Marcar [INFERRED] ou encontrar fonte real
- **Prevention:** Veto condition AN_VC_004 bloqueia conceitos sem fonte

## Integration with Workflow

```yaml
checkpoint:
  id: "dna-extraction-complete"
  heuristic: AN_KE_001
  phase: 3

  criteria:
    - metric: "ouro_ratio"
      threshold: 0.6
      operator: ">="
    - metric: "citations_count"
      threshold: 15
      operator: ">="
    - metric: "trinity_components"
      threshold: 3
      operator: "=="

  veto_conditions:
    - condition: "self_validation_failed"
      action: "HALT - Loop back to weakest step"

  validation_questions:
    - "Source classification complete?"
    - "Pareto ao Cubo applied?"
    - "Trinity complete?"
    - "Self-validation passed?"

  pass_action: "Handoff to @pedro-valerio with INSUMOS_READY"
  fail_action: "Loop back with feedback on failing criteria"
```

---

**Pattern Compliance:** Extraction Pipeline with Quality Gates
**Source:** AN Mind Artifacts - Knowledge Extraction Framework
**Handoff:** @pedro-valerio (INSUMOS_READY format)
