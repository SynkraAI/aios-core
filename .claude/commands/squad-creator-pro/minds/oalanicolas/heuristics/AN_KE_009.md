# AN_KE_009 - Meta Decision Flow

**Type:** Master Decision Framework
**Phase:** Any (Decision Points)
**Agent:** @oalanicolas
**Pattern:** 10-Step Decision Flow
**Source:** CLAUDE.md - META-SYNTHESIS

## Purpose

Framework master para qualquer decisão. Sequência de 10 passos que garante decisões sólidas.

## Core Principle

> "VERIFY → REUSE → PRECISE → SIMPLIFY → PRESERVE → FOCUS → SILENCE → CONSISTENT → VALIDATE → CHOOSE"
> — CLAUDE.md META-SYNTHESIS

## The 10 Steps

```yaml
meta_flow:
  1_verify:
    name: "VERIFY"
    principle: "Verify before assuming"
    question: "Confirmei fisicamente?"
    anti_pattern: "Assumir sem checar"
    maps_to: "AN_KE_006"

  2_reuse:
    name: "REUSE"
    principle: "Reuse before creating"
    question: "Algo similar já existe?"
    anti_pattern: "Criar do zero"
    maps_to: "AN_KE_007"

  3_precise:
    name: "PRECISE"
    principle: "Be precise, not vague"
    question: "Estou sendo específico?"
    anti_pattern: "Generalizar demais"

  4_simplify:
    name: "SIMPLIFY"
    principle: "Simplify before complicating"
    question: "Pode ser mais simples?"
    anti_pattern: "Over-engineering"

  5_preserve:
    name: "PRESERVE"
    principle: "Preserve what works"
    question: "Estou quebrando algo que funcionava?"
    anti_pattern: "Mudar o que funciona"

  6_focus:
    name: "FOCUS"
    principle: "Focus on what was asked"
    question: "Estou no escopo pedido?"
    anti_pattern: "Scope creep"

  7_silence:
    name: "SILENCE"
    principle: "When wrong, fix in silence"
    question: "Se errei, só corrigir?"
    anti_pattern: "Justificar erro"

  8_consistent:
    name: "CONSISTENT"
    principle: "Be consistent with patterns"
    question: "Segue o padrão existente?"
    anti_pattern: "Inventar novo padrão"

  9_validate:
    name: "VALIDATE"
    principle: "Validate before finalizing"
    question: "Testei antes de entregar?"
    anti_pattern: "Entregar sem testar"

  10_choose:
    name: "CHOOSE"
    principle: "Choose and commit"
    question: "Decidi com evidência?"
    anti_pattern: "Ficar em cima do muro"
```

## Configuration

```yaml
AN_KE_009:
  name: "Meta Decision Flow"
  phase: "any"
  agent: "@oalanicolas"

  application:
    when: "Any significant decision"
    how: "Run through 10 steps mentally"
    output: "Decision with confidence"

  shortcuts:
    quick_decisions: "Steps 1, 2, 6, 10"
    code_decisions: "Steps 1, 2, 4, 5, 8, 9"
    creation_decisions: "Steps 1, 2, 3, 4, 8, 9, 10"
    debugging: "Steps 1, 5, 7, 9"

  veto_conditions:
    - condition: "skip_verify"
      action: "VETO - Verify first"
    - condition: "skip_reuse_check"
      action: "VETO - Check existing first"
    - condition: "skip_validation"
      action: "VETO - Test before delivering"
```

## Decision Tree

```
FOR each decision:

┌─────────────────────────────────────────────────────────┐
│ 1. VERIFY     → Did I check physically?                 │
│                 IF NO → Check now                       │
├─────────────────────────────────────────────────────────┤
│ 2. REUSE      → Does something similar exist?           │
│                 IF YES → Use it                         │
├─────────────────────────────────────────────────────────┤
│ 3. PRECISE    → Am I being specific enough?             │
│                 IF NO → Clarify                         │
├─────────────────────────────────────────────────────────┤
│ 4. SIMPLIFY   → Can this be simpler?                    │
│                 IF YES → Simplify                       │
├─────────────────────────────────────────────────────────┤
│ 5. PRESERVE   → Am I breaking something that works?     │
│                 IF YES → Reconsider                     │
├─────────────────────────────────────────────────────────┤
│ 6. FOCUS      → Am I in scope?                          │
│                 IF NO → Return to scope                 │
├─────────────────────────────────────────────────────────┤
│ 7. SILENCE    → If wrong, just fix?                     │
│                 IF TEMPTED TO JUSTIFY → Just fix        │
├─────────────────────────────────────────────────────────┤
│ 8. CONSISTENT → Does this follow existing patterns?     │
│                 IF NO → Align with patterns             │
├─────────────────────────────────────────────────────────┤
│ 9. VALIDATE   → Did I test this?                        │
│                 IF NO → Test now                        │
├─────────────────────────────────────────────────────────┤
│ 10. CHOOSE    → Ready to commit?                        │
│                  IF YES → Commit with confidence        │
└─────────────────────────────────────────────────────────┘
```

## Quick Reference Cards

### For Code Changes
```
VERIFY (1) → Does file exist?
REUSE (2) → Component exists?
SIMPLIFY (4) → Can be simpler?
PRESERVE (5) → Breaking anything?
CONSISTENT (8) → Follows patterns?
VALIDATE (9) → Tests pass?
```

### For Creating New Things
```
VERIFY (1) → Requirements clear?
REUSE (2) → Similar exists?
PRECISE (3) → Scope defined?
SIMPLIFY (4) → Minimal viable?
CONSISTENT (8) → Follows standards?
VALIDATE (9) → Works as expected?
CHOOSE (10) → Ready to ship?
```

### For Debugging
```
VERIFY (1) → Physical state correct?
PRESERVE (5) → What changed?
SILENCE (7) → Found issue? Fix quietly
VALIDATE (9) → Fix works?
```

### For Feedback/Criticism
```
SILENCE (7) → Don't justify, just fix
VALIDATE (9) → Fix verified?
```

## Anti-Patterns

```yaml
anti_patterns:
  - name: "Skip Steps"
    symptom: "Pular direto pro CHOOSE"
    cost: "Decisão mal fundamentada"
    fix: "At minimum: VERIFY, REUSE, VALIDATE, CHOOSE"

  - name: "Justify Instead of Fix"
    symptom: "Explicar por que errou"
    cost: "User frustration"
    fix: "SILENCE - just fix"

  - name: "Complicate First"
    symptom: "Solução complexa antes de tentar simples"
    cost: "Over-engineering"
    fix: "SIMPLIFY - try simple first"

  - name: "Create Before Check"
    symptom: "Criar sem verificar se existe"
    cost: "Duplicação"
    fix: "REUSE - always check first"
```

## Validation Questions

1. "Passei pelos 10 steps?"
2. "Ou pelo menos pelos essenciais pro contexto?"
3. "Decisão tem fundamento?"
4. "Posso explicar por que decidi assim?"

## Performance Metrics

```yaml
performance:
  decision_quality: "~90% when following flow"
  rework_reduction: "~60%"
  user_alignment: "High (decisions match expectations)"
  confidence: "High (evidence-based)"
```

---

**Pattern Compliance:** 10-Step Meta Flow
**Veto Mapping:** Various (mapped per step)
**Integration:** All decision points across all phases
