# HANDOFF_PROTOCOL - Self-Validation Checklist

**Type:** Quality Gate Artifact
**Agent:** @oalanicolas
**Purpose:** Validação obrigatória antes de handoff para @pedro-valerio

## Core Principle

> "Se não passar no checklist, LOOP. Não handoff."
> — Alan Nicolas

PV não pode operacionalizar inferências. Só entrega insumos verificáveis.

---

## Pre-Handoff Checklist

### 1. Citation Coverage

```yaml
checkpoint: "citation_coverage"
requirement: "15+ citações com [SOURCE:]"
format: "[SOURCE: livro/página ou vídeo/minuto]"

validation:
  count_citations: "grep -c '\\[SOURCE:' extraction.md"
  threshold: ">= 15"

  if_fail:
    action: "LOOP - extract more citations"
    focus: "Buscar mais fontes ouro, extrair citações específicas"

examples:
  valid:
    - "[SOURCE: $100M Offers, p.47]"
    - "[SOURCE: Lex Fridman #234, 1:23:45]"
    - "[SOURCE: Instagram comment, 2024-01-15]"

  invalid:
    - "Hormozi sempre diz isso" # No source
    - "[SOURCE: internet]" # Too vague
    - "Based on his philosophy" # Inference
```

### 2. Signature Phrases

```yaml
checkpoint: "signature_phrases"
requirement: "5+ signature phrases verificáveis"

validation:
  criteria:
    - "Phrase is unique to this expert"
    - "Phrase appears in multiple sources (triangulated)"
    - "Phrase has [SOURCE:] reference"
  threshold: ">= 5 verified phrases"

  if_fail:
    action: "LOOP - mine more signature phrases"
    technique: "Search for repeated expressions across sources"

examples:
  valid:
    - "Se entrar cocô, sai cocô" [SOURCE: DNA Mental, aula 3]
    - "Value Equation" [SOURCE: $100M Offers, p.23]
    - "Speed to lead" [SOURCE: $100M Leads, p.156]

  invalid:
    - "Work hard" # Generic, not signature
    - "Be authentic" # Everyone says this
```

### 3. Trinity Completeness

```yaml
checkpoint: "trinity_complete"
requirement: "Playbook + Framework + Swipe File"

validation:
  components:
    playbook:
      check: "Has sequential steps"
      verify: "Each step has [SOURCE:]"
    framework:
      check: "Has SE/ENTÃO rules"
      verify: "Decision logic documented"
    swipe:
      check: "Has real examples"
      verify: "Examples from expert, not generic"

  if_fail:
    action: "LOOP - complete missing component"
    priority: "Framework > Swipe > Playbook (usually)"

diagnostic_questions:
  - "O clone sabe O QUE fazer? (Playbook)"
  - "O clone sabe QUANDO/COMO decidir? (Framework)"
  - "O clone tem referência de QUALIDADE? (Swipe)"
```

### 4. Zero Unvalidated Inferences

```yaml
checkpoint: "no_unvalidated_inferences"
requirement: "Zero conceitos [INFERRED] sem tentativa de validação"

validation:
  search: "grep '\\[INFERRED\\]' extraction.md"

  for_each_inferred:
    required: "Validation attempt documented"
    format: "[INFERRED] concept - validation: searched X, Y, Z"

  if_fail:
    action: "LOOP - validate or remove inferences"
    options:
      - "Find source → convert to [SOURCE:]"
      - "Document validation attempt → keep [INFERRED]"
      - "Remove if cannot validate"

examples:
  valid:
    - "[INFERRED] Likely uses 80/20 for hiring - validation: searched 3 podcasts, no direct mention, but consistent with other frameworks"

  invalid:
    - "[INFERRED] Probably thinks X" # No validation attempt
    - "He probably..." # Not even marked
```

### 5. Pareto ao Cubo Applied

```yaml
checkpoint: "pareto_applied"
requirement: "4 zonas classificadas com [SOURCE:]"

validation:
  zones_documented:
    - "0,8% (Genialidade) - items listed"
    - "4% (Excelência) - items listed"
    - "20% (Impacto) - items listed"
    - "80% (Eliminar) - items listed"

  each_zone:
    required: "At least 1 item with [SOURCE:]"

  if_fail:
    action: "LOOP - apply AN_KE_003"
    task: "tasks/find-0.8.md"
```

---

## Checklist Summary

```yaml
handoff_checklist:
  - id: "CHK-01"
    name: "Citation Coverage"
    threshold: ">= 15 citations"
    blocking: true

  - id: "CHK-02"
    name: "Signature Phrases"
    threshold: ">= 5 verified"
    blocking: true

  - id: "CHK-03"
    name: "Trinity Complete"
    threshold: "3/3 components"
    blocking: true

  - id: "CHK-04"
    name: "No Unvalidated Inferences"
    threshold: "0 unmarked"
    blocking: true

  - id: "CHK-05"
    name: "Pareto Applied"
    threshold: "4 zones documented"
    blocking: false  # Can proceed with warning
```

---

## Handoff Format: INSUMOS_READY

When all checks pass, format handoff as:

```yaml
handoff_to: "@pedro-valerio"
status: "INSUMOS_READY"
timestamp: "YYYY-MM-DD HH:MM"

summary:
  expert: "Expert Name"
  sources_count: "X ouro, Y bronze"
  ouro_ratio: "X%"
  citations_count: "X"
  signature_phrases_count: "X"
  trinity_status: "complete"

checklist_results:
  CHK-01: "PASS - 18 citations"
  CHK-02: "PASS - 7 phrases"
  CHK-03: "PASS - 3/3 components"
  CHK-04: "PASS - 0 unvalidated"
  CHK-05: "PASS - 4 zones documented"

deliverables:
  voice_dna: "path/to/voice-dna.md"
  thinking_dna: "path/to/thinking-dna.md"
  frameworks: "path/to/frameworks.md"
  heuristics: "path/to/heuristics.md"
  source_map: "path/to/source-map.yaml"

notes_for_pv:
  - "Insight X precisa de validação extra"
  - "Framework Y tem variação em contexto Z"
```

---

## Veto Conditions

| Condition | Veto Code | Action |
|-----------|-----------|--------|
| citations < 15 | AN_VC_004 | LOOP - extract more |
| phrases < 5 | AN_VC_004 | LOOP - mine more |
| trinity incomplete | AN_VC_002 | LOOP - complete component |
| unvalidated inferences | AN_VC_004 | LOOP - validate or remove |
| handoff without checklist | AN_VC_005 | HARD VETO |

---

## Anti-Patterns

### "Good Enough" Trap

```yaml
anti_pattern: "Handoff com 12 citations 'porque já tá bom'"
symptom: "PV recebe insumos fracos, clone fica genérico"
prevention: "Threshold é 15, não 'cerca de 15'"
rule: "Se não passou, não passou. LOOP."
```

### "I'll Fix Later" Trap

```yaml
anti_pattern: "Marcar [INFERRED] e deixar pra lá"
symptom: "Clone fala coisas que expert nunca disse"
prevention: "Every [INFERRED] needs validation attempt"
rule: "Unvalidated inference = potential hallucination"
```

### "Volume Compensation" Trap

```yaml
anti_pattern: "Entregar 50 citations bronze ao invés de 15 ouro"
symptom: "Muito conteúdo, pouca profundidade"
prevention: "Quality > quantity, sempre"
rule: "15 ouro > 50 bronze"
```

---

**Pattern Compliance:** Quality Gate Pattern
**Veto Mapping:** AN_VC_005 (Handoff Without Validation)
**Integration:** Final step of AN_KE_001 pipeline
**Handoff Target:** @pedro-valerio (INSUMOS_READY format)
