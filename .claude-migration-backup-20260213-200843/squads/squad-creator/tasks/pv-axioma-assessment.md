# Task: Axioma Assessment (*axioma-assessment)

> Pedro Valério | Loaded on-demand when `*axioma-assessment {process}` is invoked

**Execution Type:** Agent

## Purpose

Avaliar processo/sistema nas 10 dimensões de Meta-Axiomas de Pedro Valério

## Pre-requisite

Load `squads/squad-creator/data/pv-meta-axiomas.yaml` for dimension definitions, weights, and thresholds.

## Input

- Process/system name and description
- Relevant documentation or workflow files

## Steps

### 1. Load Framework

Read `squads/squad-creator/data/pv-meta-axiomas.yaml`

### 2. Evaluate Each Dimension

Score 0-10 for each of the 10 dimensions:

| # | Dimension | Weight | Threshold | Veto? |
|---|-----------|--------|-----------|-------|
| 1 | Verdade (Truthfulness) | 1.0 | 7.0 | YES |
| 2 | Coerência (Coherence) | 0.9 | 6.0 | no |
| 3 | Alinhamento Estratégico | 0.9 | 6.0 | no |
| 4 | Excelência Operacional | 0.8 | 6.0 | no |
| 5 | Capacidade de Inovação | 0.7 | 5.0 | no |
| 6 | Gestão de Riscos | 0.8 | 6.0 | no |
| 7 | Otimização de Recursos | 0.8 | 6.0 | no |
| 8 | Valor para Stakeholders | 0.7 | 6.0 | no |
| 9 | Sustentabilidade | 0.7 | 6.0 | no |
| 10 | Adaptabilidade | 0.6 | 5.0 | no |

### 3. Calculate Overall Score

- Weighted average of all dimensions
- Check if any dimension is below its minimum threshold
- Check if VETO dimension (Verdade) passes

### 4. Generate Assessment Report

Use `assessment_template` from `pv-meta-axiomas.yaml`

```yaml
axioma_assessment:
  process_name: "{nome}"
  assessment_date: "{data}"
  assessor: "@pedro-valerio"

  dimensions:
    - name: "{dimension}"
      score: X/10
      evidence: "{observações}"
      recommendations: ["melhorias"]
    # ... all 10

  overall_score: X.X  # weighted average
  pass_threshold: 7.0
  status: "PASS | FAIL | REVIEW"
  veto_triggered: true/false
  recommendations: ["prioritized list"]
```

## Scoring Rules

- Overall threshold: 7.0
- Minimum per dimension: 6.0
- Verdade < 7.0 → VETO regardless of overall score
- Status: PASS (>= 7.0) | FAIL (< 7.0 or VETO) | REVIEW (borderline)

## Scoring Calibration (CRITICAL)

**Princípio:** Score o que EXISTE, não o que FALTA. Gaps são para recommendations, não para penalizar score.

| Score | Significado | Quando usar |
|-------|-------------|-------------|
| 9-10 | Excelente | Dimensão bem implementada, evidência clara |
| 7-8 | Bom | Dimensão presente e funcional, gaps menores |
| 5-6 | Adequado | Dimensão existe mas com limitações significativas |
| 3-4 | Fraco | Dimensão parcialmente atendida |
| 0-2 | Ausente | Dimensão não implementada ou falha crítica |

**Regras de Calibração:**

1. **Se o processo TEM a característica → mínimo 7.0**
   - Exemplo: "Tem fallbacks definidos" → Gestão de Riscos >= 7.0

2. **Gaps vão para recommendations, não reduzem score**
   - ERRADO: "Tem X mas falta Y → score 6.5"
   - CERTO: "Tem X → score 8.0. Recommendation: adicionar Y"

3. **Inovação = fazer diferente do padrão**
   - Se resolve problema de forma não-óbvia → score >= 7.0
   - Não exigir que seja "revolucionário" para score alto

4. **Sustentabilidade = funciona sem intervenção manual**
   - Se outputs são persistidos e reutilizáveis → score >= 7.0
   - "Poderia ter mais" não reduz score se já funciona

5. **Evidence deve ser POSITIVA primeiro**
   - Liste o que o processo FAZ bem
   - Gaps são secundários e vão para recommendations

## Completion Criteria

- All 10 dimensions scored with evidence
- Overall weighted score calculated
- PASS/FAIL/REVIEW verdict
- Recommendations for dimensions below threshold
