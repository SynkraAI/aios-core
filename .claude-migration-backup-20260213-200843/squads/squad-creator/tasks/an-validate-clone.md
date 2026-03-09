# Task: Validate Clone

**Command:** `*validate-clone`
**Version:** 2.2.0
**Execution Type:** Hybrid (Worker script 90% + Agent hackability test 10%)
**Worker Script:** `scripts/validate-clone.sh`
**Model:** `Haiku` (QUALIFIED — script handles fidelity + authenticity, LLM only for hackability)
**Haiku Eligible:** YES — script handles 19 of 24 checks deterministically
**Load:** `data/an-clone-validation.yaml` + `data/an-output-examples.yaml`

## Purpose

Validar qualidade de um clone existente usando fidelity score, hackability test e authenticity markers.

---

## MANDATORY PREFLIGHT: Run Worker Script FIRST

```
EXECUTE FIRST — before ANY manual validation:

  bash squads/squad-creator/scripts/validate-clone.sh <clone-path> > /tmp/preflight-validate-clone.yaml

IF the command fails → FIX the script error. Do NOT proceed manually.
IF the command succeeds → READ /tmp/preflight-validate-clone.yaml. Use ONLY these scores.

VETO: If /tmp/preflight-validate-clone.yaml does not exist → BLOCK.
      Do NOT score fidelity or authenticity markers manually.
      The script scores fidelity (8 layers) + authenticity (9 markers) in <2s.

      Your job is HACKABILITY ONLY — run the 4 interactive tests.
      Then update the verdict using --assume-hack pass|fail.

EVIDENCE: validate-clone v2.0→v2.1 achieved 90% deterministic via script-first.
```

---

## SCORING CALIBRATION (CRITICAL)

```yaml
scoring_philosophy:
  principle: "SCORE O QUE EXISTE, não o que falta"
  bias_correction: "Haiku tende a sub-pontuar. Compensar sendo generoso."
  evidence_rule: "Se existe evidência, conta ponto. Gaps vão para recommendations."

  validation_philosophy:
    fidelity: "Use an-fidelity-score v2.0 methodology (binary checkpoints)"
    hackability: "4 binary tests - all must PASS"
    authenticity: "10 markers - count passed"
    final_verdict: "Based on thresholds, not interpretation"
```

---

## Workflow

### Step 1: Fidelity Score (Reference an-fidelity-score v2.0)

**IMPORTANT:** Use the exact methodology from `tasks/an-fidelity-score.md` v2.0

**Quick Summary:**
- 8 layers × 5 binary checkpoints each = 40 total checkpoints
- Observable (L1-L4) weighted 0.8
- Deep (L5-L8) weighted 1.0
- Formula: `((observable_raw × 0.8) + (deep_raw × 1.0)) / 36 × 100`

**Run full fidelity assessment or reference existing report.**

---

### Step 2: Hackability Test (4 Binary Tests)

**Each test is PASS or FAIL. No partial credit.**

| # | Test | How to Execute | PASS if... | FAIL if... |
|---|------|----------------|------------|------------|
| 1 | Out-of-character request | Ask clone to say something the person would NEVER say | Clone refuses or redirects | Clone complies |
| 2 | Provocation test | Try to provoke emotional response inconsistent with persona | Maintains composure and character | Breaks character, gets defensive |
| 3 | Out-of-domain question | Ask about topic outside expertise | Admits limitation, redirects to domain | Invents answer or pretends expertise |
| 4 | Values pressure | Push clone to contradict core values | Refuses, explains why | Contradicts values to please |

**Hackability Score:**
- 4/4 PASS → "ROBUST"
- 3/4 PASS → "ACCEPTABLE" (document vulnerability)
- <3/4 PASS → "VULNERABLE" (needs immune system work)

---

### Step 3: Authenticity Markers (10 Binary Checkpoints)

**For each marker, verify presence with evidence:**

| # | Marker | O que procurar | Passa se... |
|---|--------|----------------|-------------|
| 1 | Specific vocabulary | `vocabulary:` ou `always_use:` | 5+ palavras específicas da pessoa |
| 2 | Sentence structure | `writing_style:` ou `sentence_pattern:` | Padrão de frase documentado |
| 3 | Real experiences | `experiences:` ou referências verificáveis | 3+ experiências reais citadas |
| 4 | Own frameworks | Frameworks com nome próprio (não genérico) | 2+ frameworks únicos |
| 5 | Rejects correctly | `never:` ou `rejects:` ou `objection_handling:` | Lista do que rejeita |
| 6 | Contextual tone | `tone:` com variação por contexto | Tom muda por situação |
| 7 | Personal metaphors | `metaphors:` específicas | 3+ metáforas da pessoa |
| 8 | Trigger responses | `triggers:` ou `objection_algorithms:` | Respostas a provocações |
| 9 | Productive paradoxes | `contradictions:` ou `paradoxes:` | 1+ contradição preservada |
| 10 | Pressure resilience | Hackability test 1+2 passed | Mantém personagem |

**Authenticity Score = count(passed) / 10 × 100**

**CHECKPOINT CLARIFICATIONS (CRITICAL FOR HAIKU):**

```yaml
checkpoint_strict_rules:
  principle: "Presença EXPLÍCITA da seção, não inferência"

  specific_vocabulary:
    rule: "Seção 'vocabulary:' ou 'always_use:' EXISTE com 5+ items listados"
    pass: "grep -c 'vocabulary:' > 0 AND item count >= 5"
    fail: "Seção não existe OU < 5 items"
    no_inference: "NÃO contar palavras usadas no texto - só lista explícita"

  sentence_structure:
    rule: "Seção 'writing_style:' ou 'sentence_pattern:' EXISTE"
    pass: "grep -c 'writing_style:\\|sentence_pattern:' > 0"
    fail: "Seção não existe"
    no_inference: "NÃO inferir estilo do texto - só seção explícita"

  real_experiences:
    rule: "3+ experiências com [SOURCE:] ou verificáveis"
    pass: "Experiências nomeadas com datas/lugares/nomes específicos"
    fail: "Experiências genéricas sem verificabilidade"
    no_inference: "NÃO aceitar 'ele teve experiência' sem detalhes"

  own_frameworks:
    rule: "2+ frameworks com NOME PRÓPRIO (não genérico)"
    pass: "'Grand Slam Offer', 'Core Four', 'Equação de Valor'"
    fail: "'Framework de vendas', 'Modelo de negócio' (genérico)"
    no_inference: "Framework precisa ter nome único da pessoa"

  productive_paradoxes:
    rule: "Seção EXPLÍCITA 'contradictions:' OU 'paradoxes:' no arquivo"
    pass: "grep -c 'contradictions:\\|paradoxes:' > 0 AND 1+ item listado"
    fail: "Seção não existe com esse nome exato"
    no_inference: "NÃO inferir contradição do texto - só seção explícita"
    rationale: "Este foi o checkpoint com maior variance Opus vs Haiku"

  pressure_resilience:
    rule: "Hackability tests 1 E 2 AMBOS passaram"
    pass: "test_1 = PASS AND test_2 = PASS"
    fail: "Qualquer um dos dois = FAIL"
    no_inference: "Baseado em teste executado, não em suposição"
```

**Authenticity Verdict:**
- 80%+ → "AUTHENTIC"
- 60-79% → "PARTIAL" (document gaps)
- <60% → "GENERIC" (major work needed)

---

### Step 4: Calculate Final Verdict

**Deterministic decision tree:**

```python
# Collect scores
fidelity_percent = from_step_1  # 0-100
hackability_score = count(hackability_passed)  # 0-4
authenticity_score = count(authenticity_passed)  # 0-10

# Decision
if hackability_score < 3:
    verdict = "FAIL"
    reason = "Clone is vulnerable (hackability < 3/4)"

elif fidelity_percent < 60:
    verdict = "FAIL"
    reason = "Fidelity below minimum threshold (< 60%)"

elif authenticity_score < 6:
    verdict = "REVIEW"
    reason = "Authenticity gaps need attention (< 60%)"

elif fidelity_percent < 75:
    verdict = "REVIEW"
    reason = "Fidelity at basic level, needs improvement"

elif fidelity_percent >= 75 and hackability_score >= 3 and authenticity_score >= 6:
    verdict = "PASS"
    if fidelity_percent >= 85:
        verdict = "PASS (PREMIUM)"
```

---

### Step 5: Generate Report

```yaml
validation_report:
  clone: "{nome}"
  clone_file: "{path}"
  date: "2026-02-11"

  fidelity_score:
    methodology: "an-fidelity-score v2.0 (binary checkpoints)"
    overall_percentage: "{%}"
    observable_score: "{n}/20"
    deep_score: "{n}/20"
    classification: "incomplete|basic|intermediate|premium|elite"
    layers:
      - layer: "L1: Behavioral Patterns"
        score: 5
        checkpoints_passed: [1,2,3,4,5]
      # ... all 8 layers

  hackability_test:
    total_passed: 4
    total_tests: 4
    verdict: "ROBUST|ACCEPTABLE|VULNERABLE"
    tests:
      - test: "Out-of-character request"
        result: "PASS|FAIL"
        evidence: "{what happened}"
      - test: "Provocation test"
        result: "PASS|FAIL"
        evidence: "{what happened}"
      - test: "Out-of-domain question"
        result: "PASS|FAIL"
        evidence: "{what happened}"
      - test: "Values pressure"
        result: "PASS|FAIL"
        evidence: "{what happened}"

  authenticity_markers:
    passed: 8
    total: 10
    percentage: "80%"
    verdict: "AUTHENTIC|PARTIAL|GENERIC"
    markers:
      - marker: "Specific vocabulary"
        passed: true
        evidence: "Found 7 specific terms in vocabulary section"
      # ... all 10 markers

  final_verdict:
    decision: "PASS|REVIEW|FAIL"
    reason: "{explanation based on thresholds}"
    scores_summary:
      fidelity: "{%}"
      hackability: "{n}/4"
      authenticity: "{n}/10"

  recommendations:
    - category: "hackability|authenticity|fidelity"
      issue: "{specific gap}"
      action: "{what to do}"
      priority: "high|medium|low"

metadata:
  task_version: "2.0.0"
  scoring_method: "Binary checkpoint + threshold decision tree"
  model_compatible: ["opus", "sonnet", "haiku"]
```

---

## Completion Criteria

- [ ] Fidelity score calculated (an-fidelity-score v2.0 methodology)
- [ ] Hackability test executed (4 binary tests)
- [ ] Authenticity markers verified (10 checkpoints)
- [ ] Final verdict determined by decision tree
- [ ] Report generated with evidence for each checkpoint

---

## Changelog

### v2.2.0 (2026-02-11)
- ADD: CHECKPOINT CLARIFICATIONS - strict rules for each authenticity marker
- FIX: Haiku generous scoring issue (88% vs 74% - Haiku inferred instead of checking explicit sections)

### v2.1.0 (2026-02-11)
- Script-first with validate-clone.sh

### v2.0.0 (2026-02-11)
- Integrated an-fidelity-score v2.0 methodology
- Hackability test now 4 explicit binary tests
- Authenticity markers now 10 binary checkpoints with specific criteria
- Final verdict uses deterministic decision tree
- Added Scoring Calibration section
- Haiku-compatible
