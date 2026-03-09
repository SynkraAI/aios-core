# AN_KE_002 - Trinity Framework

**Type:** Structural Framework
**Phase:** 3 (DNA Extraction)
**Agent:** @oalanicolas
**Pattern:** Knowledge Structure Pattern

## Purpose

Estruturar conhecimento extraído em três componentes complementares que, juntos, permitem um clone funcional. Clone precisa dos TRÊS para operar bem.

## The Trinity

```yaml
trinity:
  playbook:
    definition: "A receita completa - passo a passo"
    analogy: "Receita de bolo"
    contains:
      - "Steps sequenciais"
      - "Dependencies entre passos"
      - "Inputs e outputs de cada step"
      - "Timing e ordem"
    if_missing: "Clone não sabe O QUE fazer"

  framework:
    definition: "A forma/estrutura - SE X, ENTÃO Y"
    analogy: "Forma do bolo"
    contains:
      - "Rules e heuristics"
      - "Decision trees"
      - "Veto conditions"
      - "Prioritization logic"
    if_missing: "Clone não sabe QUANDO/COMO decidir"

  swipe_file:
    definition: "Exemplos validados - provas que funcionam"
    analogy: "Fotos de bolos prontos"
    contains:
      - "Output examples reais"
      - "Cases de sucesso"
      - "Templates preenchidos"
      - "Before/after comparisons"
    if_missing: "Clone não tem referência de QUALIDADE"
```

## Configuration

```yaml
AN_KE_002:
  name: "Trinity Framework"
  phase: 3
  agent: "@oalanicolas"

  components:
    playbook:
      required: true
      validation: "Has sequential steps with dependencies"
    framework:
      required: true
      validation: "Has decision rules (SE X, ENTÃO Y)"
    swipe_file:
      required: true
      validation: "Has real output examples"

  weights:
    playbook_completeness: 0.8
    framework_clarity: 0.9
    swipe_quality: 0.7

  veto_conditions:
    - condition: "any_component_missing"
      action: "VETO - Complete trinity before handoff"
      maps_to: "AN_VC_002"
    - condition: "playbook_only"
      action: "VETO - Adicionar framework antes"
    - condition: "framework_without_examples"
      action: "REVIEW - Buscar swipe file"

  output:
    type: "structured_knowledge"
    format: "Playbook + Framework + Swipe File"
```

## Decision Tree

```
IF (has_playbook AND has_framework AND has_swipe)
  THEN trinity_complete = TRUE → APPROVE

ELSE IF (has_playbook AND has_framework AND NOT has_swipe)
  THEN REVIEW → Search for output examples

ELSE IF (has_playbook AND NOT has_framework)
  THEN VETO → Extract decision rules first

ELSE IF (NOT has_playbook)
  THEN VETO → Start with step-by-step extraction

TERMINATION: All three components documented with [SOURCE:]
FALLBACK: Identify weakest component, focus extraction there
```

## Diagnostic Questions

| Component | Diagnostic Question | If NO |
|-----------|---------------------|-------|
| Playbook | "Tenho passos sequenciais documentados?" | Extract steps |
| Framework | "Tenho regras SE/ENTÃO documentadas?" | Extract decision rules |
| Swipe | "Tenho exemplos reais de output?" | Find/create examples |

## Application Examples

### Complete Trinity Example

```yaml
example_expert: "Alex Hormozi - Offers"

playbook:
  - "Step 1: Identify dream outcome"
  - "Step 2: List all problems preventing outcome"
  - "Step 3: Create solutions for each problem"
  - "Step 4: Trim/stack solutions into offer"
  - "Step 5: Name offer using MAGIC formula"
  source: "$100M Offers, Chapter 7"

framework:
  - rule: "SE valor percebido < 10x preço → ENTÃO ajustar offer"
  - rule: "SE time delay > 0 → ENTÃO adicionar velocidade"
  - rule: "SE effort alto → ENTÃO automatizar ou fazer-por-você"
  source: "Value Equation from $100M Offers"

swipe_file:
  - example: "Gym Launch offer transformation"
  - example: "ALAN consulting package"
  - example: "Software licensing pivot"
  source: "Case studies from book + podcast"
```

### Incomplete Trinity Example

```yaml
example_problem: "Clone genérico de copywriting"

has:
  - playbook: "AIDA formula steps"
  - framework: null  # MISSING
  - swipe_file: "Some ad examples"

diagnosis: "Clone sabe O QUE fazer (AIDA) e vê exemplos,
            mas não sabe QUANDO usar AIDA vs PAS vs outro framework"

fix: "Extract decision rules: SE awareness level X → ENTÃO use Y framework"
```

## Validation Checklist

```yaml
validation:
  playbook_check:
    - "Steps são sequenciais?"
    - "Dependencies estão claras?"
    - "Tem [SOURCE:] para cada step?"

  framework_check:
    - "Tem regras SE/ENTÃO?"
    - "Tem veto conditions?"
    - "Decision tree está documentado?"

  swipe_check:
    - "Exemplos são do próprio expert?"
    - "Exemplos mostram aplicação real?"
    - "Tem before/after quando aplicável?"
```

## Performance Metrics

```yaml
performance:
  completeness_detection: "100% (binary - has or doesn't)"
  quality_assessment: "Manual review required"
  common_gap: "Framework (65% of incomplete trinities)"
  fix_time: "2-4h per missing component"
```

## Failure Modes

### Playbook-Only Trap
- **Trigger:** Expert teaches steps clearly, frameworks implicit
- **Manifestation:** Clone follows recipe but can't adapt
- **Detection:** Clone fails on edge cases
- **Recovery:** Ask "QUANDO você decide fazer isso diferente?"
- **Prevention:** Always ask "E se X não funcionar?"

### Framework-Without-Proof Trap
- **Trigger:** Framework extraído mas sem exemplos reais
- **Manifestation:** Clone sounds theoretical, not practical
- **Detection:** No [SOURCE:] pointing to real cases
- **Recovery:** Search for "case study", "exemplo", "cliente"
- **Prevention:** Every framework needs >= 1 swipe example

---

**Pattern Compliance:** Knowledge Structure Pattern
**Source:** AN Mind Artifacts - Trinity Framework
**Veto Mapping:** AN_VC_002 (Trinity Incomplete)
