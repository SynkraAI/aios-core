# AN_KE_008 - Pattern Recognition (2x Rule)

**Type:** Learning Heuristic
**Phase:** Any (Continuous)
**Agent:** @oalanicolas
**Pattern:** Repetition = Rule
**Source:** CLAUDE.md - "Se Disse 2x → Vira Regra"

## Purpose

Identificar padrões através de repetição. Se algo foi corrigido/dito 2x, é um padrão que precisa virar regra documentada.

## Core Principle

> "Se Disse 2x → Vira Regra"
> "Correção repetida = regra faltando no CLAUDE.md"
> "Ação: Adicionar imediatamente após identificar padrão"
> — CLAUDE.md META-RULES

## The 2x Rule

```yaml
rule:
  trigger: "User corrects/repeats same thing twice"
  meaning: "Pattern identified, rule needed"
  action: "Document as rule IMMEDIATELY"

  examples:
    - correction: "Não use mock data" (2x)
      rule_created: "NEVER: Use mock data when real data exists"

    - correction: "Verifique se existe" (2x)
      rule_created: "ALWAYS: Check squads/ before creating new"

    - correction: "Não delete sem perguntar" (2x)
      rule_created: "NEVER: Delete without asking first"
```

## Configuration

```yaml
AN_KE_008:
  name: "Pattern Recognition (2x Rule)"
  phase: "continuous"
  agent: "@oalanicolas"

  detection:
    trigger: "same_correction_twice"
    confidence: "100% - if corrected 2x, it's a pattern"

  action_pipeline:
    - step: 1
      action: "Recognize repetition"
      question: "User said/corrected this before?"

    - step: 2
      action: "Extract pattern"
      question: "What is the underlying rule?"

    - step: 3
      action: "Document immediately"
      location: "CLAUDE.md or relevant config"

    - step: 4
      action: "Confirm with user"
      question: "Added rule X. Correct?"

  veto_conditions:
    - condition: "ignore_repeated_correction"
      action: "VETO - Document as rule now"
      maps_to: "AN_VC_008"
```

## Pattern Categories

| Category | Example Trigger | Rule Format |
|----------|-----------------|-------------|
| NEVER | "Don't do X" (2x) | NEVER: X |
| ALWAYS | "Always do Y" (2x) | ALWAYS: Y |
| IF/THEN | "When Z, do W" (2x) | IF Z → THEN W |
| PRIORITY | "A before B" (2x) | PRIORITY: A > B |
| VETO | "Stop if X" (2x) | VETO: X → STOP |

## Decision Tree

```
ON receiving feedback/correction:

1. Check: "Did user say/correct this before?"
   IF no → Note it, continue
   IF yes → PATTERN DETECTED

2. On pattern detection:
   → STOP current work
   → Extract the rule
   → Document IMMEDIATELY
   → Confirm with user
   → Continue with rule applied

3. Rule documentation format:
   - Clear trigger
   - Specific action
   - Category (NEVER/ALWAYS/IF-THEN/PRIORITY/VETO)
```

## Extraction Template

```yaml
pattern_extraction:
  observation: "User said/corrected X twice"

  analysis:
    what_was_wrong: ""
    what_should_happen: ""
    underlying_principle: ""

  rule_format:
    category: "NEVER | ALWAYS | IF-THEN | PRIORITY | VETO"
    trigger: "When this happens..."
    action: "Do this..."

  documentation:
    location: "CLAUDE.md section"
    format: "| Phrase | Meaning | Action |"
```

## Anti-Patterns

```yaml
anti_patterns:
  - name: "Ignore Repetition"
    symptom: "User corrigiu 2x e você não documentou"
    cost: "Vai errar de novo, frustração"
    fix: "STOP, document rule, then continue"

  - name: "Vague Rule"
    symptom: "Documentar regra genérica demais"
    cost: "Não previne o erro específico"
    fix: "Be specific: trigger + action"

  - name: "Delay Documentation"
    symptom: "Pensar 'vou documentar depois'"
    cost: "Esquece, erra de novo"
    fix: "Document IMMEDIATELY"

  - name: "Wrong Location"
    symptom: "Documentar em lugar que ninguém lê"
    cost: "Regra existe mas não é aplicada"
    fix: "CLAUDE.md or relevant active config"
```

## Validation Questions

1. "User já disse isso antes?"
2. "Se sim, qual é o padrão?"
3. "Documentei a regra?"
4. "Regra está em lugar visível?"
5. "Confirmei com user?"

## Performance Metrics

```yaml
performance:
  pattern_detection_rate: "100% for 2x occurrences"
  documentation_speed: "< 5 min after detection"
  error_recurrence: "~0% after rule documented"
  user_satisfaction: "High (feeling heard)"
```

## Integration with CLAUDE.md

```yaml
integration:
  target_sections:
    - "### NEVER" (for prohibited patterns)
    - "### ALWAYS" (for required patterns)
    - "### IF HE SAYS → IT MEANS" (for interpretation patterns)
    - "### PRIORITIES" (for ordering patterns)

  format_examples:
    never: "- Never do X when Y"
    always: "- Always do A before B"
    if_then: "| Phrase | Meaning | Action |"
    priority: "1. X → 2. Y → 3. Z"
```

---

**Pattern Compliance:** Repetition = Rule
**Veto Mapping:** AN_VC_008 (Ignore Repeated Correction)
**Integration:** Continuous learning across all phases
