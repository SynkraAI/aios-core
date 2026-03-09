# Proposta: optimize.md v4.0

**Baseado em:** Sessão de Model Tier Qualification 2026-02-11
**Evidência:** 8 tasks testadas, 3 padrões críticos descobertos

---

## Descobertas Empíricas

### 1. Binary Checkpoint Conversion (99.3% match)

**Problema:** Tasks com scoring subjetivo (1-5) geram divergência Opus/Haiku.

**Solução comprovada:** Converter para checkpoints binários.

```yaml
ANTES (divergência):
  an-fidelity-score v1.0:
    scoring: "Avaliar 1-5 cada layer"
    opus: 82.22%
    haiku: "varia muito"

DEPOIS (99.3% match):
  an-fidelity-score v2.0:
    scoring: "5 checkpoints binários por layer"
    opus: 82.22%
    haiku: 81.67%
    match: 99.3%
```

**Nova fase proposta:** PHASE 4b: BINARY CHECKPOINT CONVERSION

### 2. Script-First Architecture (0 tokens)

**Problema:** Tasks classificadas como "Hybrid" ainda gastam tokens desnecessários.

**Solução comprovada:** Script pode fazer 90-95% do trabalho.

```yaml
fidelity-score.sh:
  lines: 518
  time: "<1 second"
  tokens: 0
  coverage: "95% da task"
  llm_only_for: "gap recommendations"
```

**Nova regra:** SE 90%+ é determinístico → SCRIPT-ONLY, não Hybrid.

### 3. Scope Interpretation (Haiku literal)

**Problema:** Haiku interpreta escopo LITERALMENTE.

```yaml
an-clone-review:
  task_scope: "Review clone file"
  opus_interpretation: "wrapper + delegated persona"
  haiku_interpretation: "wrapper only"
  result:
    opus: 93.3% SOLID
    haiku: 73.3% NEEDS_WORK
    match: 78.6% (VETO)
```

**Nova fase proposta:** PHASE 1b: SCOPE CLARIFICATION

### 4. Bidirectional Scoring Bias

**Descoberta crítica:** Haiku pode ser CONSERVADOR ou GENEROSO, dependendo da task.

```yaml
conservative_example:
  task: an-clone-review
  opus: 93.3%
  haiku: 73.3%  # -20% (mais rigoroso)

generous_example:
  task: an-validate-clone
  opus: 73.89%
  haiku: 88.3%  # +14% (mais generoso)
```

**Nova fase proposta:** PHASE 7b: BIDIRECTIONAL BIAS TEST

### 5. Gatekeeper Pattern

**Descoberta:** Tasks com decisão pass/fail binária são Haiku-safe mesmo com scores diferentes.

```yaml
qa-after-creation:
  opus_score: 8.32
  haiku_score: 9.9  # +19% diferente
  opus_decision: APPROVED
  haiku_decision: APPROVED  # IGUAL!
  verdict: HAIKU QUALIFIED
```

**Nova fase proposta:** PHASE 1c: GATEKEEPER DETECTION

---

## Novas Fases Propostas

### PHASE 1b: SCOPE CLARIFICATION

```yaml
scope_clarification:
  trigger: "After Phase 1 decomposition"
  duration: "2-3 minutes"

  step_1b_1:
    action: "Identify all files referenced in task"
    check:
      - "Does task reference other files? (delegated persona, configs, etc)"
      - "Does task use dynamic paths? (e.g., {mind_path})"
      - "Does task have implicit dependencies?"

  step_1b_2:
    action: "Add explicit scope definition"
    template: |
      ## SCOPE DEFINITION

      **Primary file:** {main_file}
      **Include in scope:**
      - [ ] Delegated persona files (if wrapper)
      - [ ] Referenced configs
      - [ ] Source directories

      **Explicit scope:**
      ```
      WHEN analyzing this clone/squad/task:
      - INCLUDE: {list of files}
      - EXCLUDE: {list of files}
      - IF wrapper delegates to persona → READ BOTH
      ```

  veto: |
    Tasks with ambiguous scope MUST NOT proceed to Haiku testing.
    Clarify scope FIRST, then test.
```

### PHASE 4b: BINARY CHECKPOINT CONVERSION

```yaml
binary_checkpoint_conversion:
  trigger: "After Phase 4 (code stubs), if task has subjective scoring"
  duration: "10-15 minutes"

  detect_subjective_scoring:
    patterns:
      - "Score 1-5"
      - "Avaliar qualidade"
      - "Rate from"
      - "Evaluate"
      - "Quality score"

  conversion_template:
    for_each_subjective_score:
      original: "Score layer X from 1-5"
      converted: |
        ## Layer X (5 checkpoints)

        | # | Checkpoint | O que procurar | Passa se... |
        |---|------------|----------------|-------------|
        | 1 | {specific_check} | {where_to_look} | {binary_condition} |
        | 2 | {specific_check} | {where_to_look} | {binary_condition} |
        | 3 | {specific_check} | {where_to_look} | {binary_condition} |
        | 4 | {specific_check} | {where_to_look} | {binary_condition} |
        | 5 | {specific_check} | {where_to_look} | {binary_condition} |

        **Score = count(passed) → 0-5**

  add_scoring_calibration:
    template: |
      ## SCORING CALIBRATION (CRITICAL)

      ```yaml
      scoring_philosophy:
        principle: "SCORE O QUE EXISTE, não o que falta"
        bias_correction: "Haiku tende a sub-pontuar. Compensar sendo generoso."
        evidence_rule: "Se existe evidência, conta ponto. Gaps vão para recommendations."

        checkpoint_rules:
          - "PASS = evidence EXISTS (not perfect)"
          - "FAIL = evidence MISSING (not weak)"
          - "Partial = PASS (generous interpretation)"
      ```

  quality_gate:
    - "All subjective scores converted to binary checkpoints?"
    - "Scoring calibration section added?"
    - "Each checkpoint has specific lookup location?"
    - "Binary condition is yes/no, not judgment?"
```

### PHASE 1c: GATEKEEPER DETECTION

```yaml
gatekeeper_detection:
  trigger: "During Phase 1 analysis"
  duration: "1-2 minutes"

  definition: |
    A GATEKEEPER task has ONE primary output: PASS or FAIL.
    Score details are secondary. The decision is what matters.

  detection_criteria:
    is_gatekeeper:
      - "Output is PASS/FAIL or APPROVED/REJECTED?"
      - "Score is used to DERIVE decision, not as final output?"
      - "Users care about decision, not exact score?"

  if_gatekeeper:
    action: "Add gatekeeper marker to task metadata"
    haiku_qualification: |
      For GATEKEEPER tasks, Haiku qualifies if:
      - Final DECISION matches Opus (not score)
      - Score is within 30% (allows variance)

      Example:
        opus: 8.32 → APPROVED
        haiku: 9.9 → APPROVED
        decision_match: true → QUALIFIED
```

### PHASE 7b: BIDIRECTIONAL BIAS TEST

```yaml
bidirectional_bias_test:
  trigger: "After Phase 7 (Empirical Validation)"
  duration: "5-10 minutes"
  condition: "Haiku passed with >95% match"

  rationale: |
    Haiku can be EITHER conservative OR generous.
    One test is not enough. Test with different inputs.

  step_7b_1:
    action: "Run Haiku with DIFFERENT target"
    inputs:
      - "Use a SMALLER target (should score higher)"
      - "Use a LARGER target (should score lower)"
      - "Use a EDGE CASE target"

  step_7b_2:
    action: "Compare all results"
    analysis:
      - "Is Haiku consistently conservative?"
      - "Is Haiku consistently generous?"
      - "Is Haiku inconsistent (varies)?"

  verdicts:
    consistent_conservative: "ADD Scoring Calibration (bias up)"
    consistent_generous: "ADD Scoring Calibration (bias down)"
    inconsistent: "VETO - Task needs more structure"

  quality_gate:
    qualified_only_if: "Haiku behavior is CONSISTENT across 3+ tests"
```

---

## Script-First Priority Rule

```yaml
script_first_rule:
  principle: "SE 90%+ é determinístico → SCRIPT-ONLY, não Hybrid"

  decision_tree:
    if_deterministic_pct >= 90:
      action: "Create SCRIPT-ONLY executor"
      llm_role: "Optional: gap analysis / recommendations"
      cost: "~$0 per execution"

    elif_deterministic_pct >= 60:
      action: "Create HYBRID executor"
      llm_role: "Interpretation of script results"
      cost: "~20% of full Agent"

    else:
      action: "Keep as AGENT"
      cost: "100%"

  examples:
    an-fidelity-score:
      deterministic: 95%
      decision: "SCRIPT-ONLY"
      script: "fidelity-score.sh"
      llm_for: "gap recommendations"

    an-clone-review:
      deterministic: 90%
      decision: "SCRIPT-ONLY"
      script: "clone-review.sh"
      llm_for: "priority actions"

    an-validate-clone:
      deterministic: 70%
      decision: "HYBRID"
      script: "fidelity-score.sh + hackability checks"
      llm_for: "hackability tests, authenticity markers"
```

---

## Updated Phase Flow

```yaml
optimize_v4_phases:
  scan_mode:
    - PHASE 0: Target Identification
    - PHASE 1: Determinism Analysis
    - PHASE 1b: Scope Clarification (NEW)
    - PHASE 1c: Gatekeeper Detection (NEW)
    - PHASE 2: ROI Calculation
    - PHASE 3: Report Generation

  implement_mode:
    - All scan phases +
    - PHASE 4: Implementation Suggestions
    - PHASE 4b: Binary Checkpoint Conversion (NEW)

  hybrid_mode:
    - All implement phases +
    - PHASE 5: Script-First Executor (UPDATED)
    - PHASE 6: GAP ZERO Enforcement
    - PHASE 7: Empirical Validation
    - PHASE 7b: Bidirectional Bias Test (NEW)

  post_mode:
    - PHASE 8: Post-Refactoring Economy Analysis
```

---

## Changelog v4.0 Proposal

| Change | Rationale | Evidence |
|--------|-----------|----------|
| PHASE 1b: Scope Clarification | Haiku interprets scope literally | an-clone-review 78.6% match |
| PHASE 1c: Gatekeeper Detection | Pass/fail tasks are Haiku-safe | qa-after-creation qualified |
| PHASE 4b: Binary Checkpoint Conversion | 99.3% match with binary | an-fidelity-score v2.0 |
| PHASE 7b: Bidirectional Bias Test | Haiku can be conservative OR generous | an-clone-review vs an-validate-clone |
| Script-First Priority | 95% deterministic = script-only | fidelity-score.sh, clone-review.sh |

---

## Related Files

- `test-cases/BATCH-PROGRESS.md` - Session evidence
- `scripts/fidelity-score.sh` - Script-only executor example
- `scripts/clone-review.sh` - Script-only executor example
- `tasks/an-fidelity-score.md` - Binary checkpoint conversion example
- `config/model-routing.yaml` - Tier decisions with evidence
