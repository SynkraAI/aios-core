# Task: Compare Model Outputs

**Command:** `*compare-outputs`
**Version:** 1.0.0
**Execution Type:** Agent (Opus ONLY - evaluator must be most capable model)
**Model:** `Opus` (REQUIRED - evaluator cannot be same tier as test subject)
**Purpose:** Systematic comparison of Opus baseline vs Haiku test outputs for Model Tier Qualification

---

## CRITICAL: Evaluator Independence

```yaml
evaluator_rules:
  model: "opus"  # NEVER use Haiku to evaluate Haiku
  blind_mode: false  # We know which is which (baseline vs test)
  bias_mitigation:
    - "Score WHAT IS WRITTEN, not what you expect"
    - "Do NOT assume Opus is better - measure objectively"
    - "If outputs are equivalent, say so (don't force differences)"
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_name` | string | Yes | Task being evaluated (e.g., "an-assess-sources") |
| `opus_baseline` | file | Yes | Path to Opus output file |
| `haiku_output` | file | Yes | Path to Haiku output file |
| `task_file` | file | Yes | Original task definition (for reference) |

---

## Evaluation Rubric (100 points)

### Dimension 1: TIER MATCH (40 points)

```yaml
tier_match:
  weight: 40
  description: "Do both outputs classify items into the same tiers?"

  scoring:
    perfect_match: 40    # 100% of items have same tier
    high_match: 32       # 90-99% same tier
    moderate_match: 24   # 75-89% same tier
    low_match: 16        # 50-74% same tier
    poor_match: 0        # <50% same tier

  calculation: |
    match_rate = count(opus_tier == haiku_tier) / total_items

    IF match_rate == 1.0 → 40 points
    IF match_rate >= 0.9 → 32 points
    IF match_rate >= 0.75 → 24 points
    IF match_rate >= 0.5 → 16 points
    ELSE → 0 points

  veto_condition: |
    IF match_rate < 0.75 → VETO (different tier = different user action)
    Rationale: User decides based on tier, not score details
```

### Dimension 2: SCORE VARIANCE (30 points)

```yaml
score_variance:
  weight: 30
  description: "Are numerical scores within acceptable variance?"

  thresholds:
    excellent: 5%     # Scores within 5%
    good: 10%         # Scores within 10%
    acceptable: 15%   # Scores within 15%
    poor: 20%         # Scores within 20%
    unacceptable: ">20%"

  scoring:
    within_5pct: 30
    within_10pct: 24
    within_15pct: 18
    within_20pct: 12
    beyond_20pct: 0

  calculation: |
    FOR each scored item:
      variance = abs(opus_score - haiku_score) / opus_score * 100

    avg_variance = mean(all variances)
    max_variance = max(all variances)

    # Use WORST case (max) for scoring, not average
    IF max_variance <= 5% → 30 points
    IF max_variance <= 10% → 24 points
    IF max_variance <= 15% → 18 points
    IF max_variance <= 20% → 12 points
    ELSE → 0 points

  veto_condition: |
    IF max_variance > 15% → REVIEW (significant scoring difference)
    IF max_variance > 25% → VETO (unreliable scoring)
```

### Dimension 3: CHECKPOINT MATCH (20 points)

```yaml
checkpoint_match:
  weight: 20
  description: "Do binary checkpoints (true/false) match?"

  applies_to: "Tasks with binary checkpoint scoring"

  scoring:
    perfect_match: 20    # 100% checkpoints match
    high_match: 16       # 95-99% match
    moderate_match: 12   # 90-94% match
    low_match: 8         # 80-89% match
    poor_match: 0        # <80% match

  calculation: |
    FOR each item with checkpoints:
      FOR each checkpoint:
        match = (opus_checkpoint == haiku_checkpoint)

    match_rate = count(matches) / total_checkpoints

    IF match_rate == 1.0 → 20 points
    IF match_rate >= 0.95 → 16 points
    IF match_rate >= 0.90 → 12 points
    IF match_rate >= 0.80 → 8 points
    ELSE → 0 points

  note: |
    If task doesn't use binary checkpoints, award 20 points
    (dimension not applicable)
```

### Dimension 4: RECOMMENDATION QUALITY (10 points)

```yaml
recommendation_quality:
  weight: 10
  description: "Do recommendations lead to same user actions?"

  scoring:
    same_actions: 10       # Same recommended actions
    similar_actions: 7     # Same direction, different specifics
    different_actions: 3   # Different recommendations
    contradictory: 0       # Opposite recommendations

  evaluation_criteria:
    - "Would user take same action based on each output?"
    - "Are priorities the same (what to do first)?"
    - "Are gaps/issues identified the same?"

  note: |
    This is the most subjective dimension.
    Focus on ACTIONABLE outcomes, not wording.
```

---

## Qualification Thresholds

```yaml
qualification_decision:
  thresholds:
    QUALIFIED: ">= 85 points AND no veto triggered"
    CONDITIONAL: "70-84 points OR veto with mitigation possible"
    NOT_QUALIFIED: "< 70 points OR hard veto"

  veto_conditions:
    - id: "MTQ_VC_001"
      name: "Score Variance >15%"
      severity: "review"

    - id: "MTQ_VC_002"
      name: "Score Variance >25%"
      severity: "veto"

    - id: "MTQ_VC_003"
      name: "Tier Match <90%"
      severity: "review"

    - id: "MTQ_VC_004"
      name: "Tier Match <75%"
      severity: "veto"

    - id: "MTQ_VC_005"
      name: "Contradictory Recommendations"
      severity: "veto"
```

---

## Workflow

### Step 1: Load Inputs

```yaml
step_1:
  action: "Read both output files and task definition"
  inputs:
    - opus_baseline
    - haiku_output
    - task_file
  validation:
    - "Both files exist and are valid YAML"
    - "Both files have same structure"
    - "Task file provides context for evaluation"
```

### Step 2: Extract Comparable Items

```yaml
step_2:
  action: "Identify all items to compare"
  extract:
    - items: "List of scored items (sources, dimensions, etc.)"
    - scores: "Numerical scores per item"
    - tiers: "Classification tiers per item"
    - checkpoints: "Binary checkpoints if applicable"
    - recommendations: "Action items and priorities"
```

### Step 3: Calculate Dimension Scores

```yaml
step_3:
  action: "Score each dimension using rubric"

  tier_match:
    calculate: "match_rate = matching_tiers / total_items"
    score: "Apply scoring table"
    check_veto: "match_rate < 0.75?"

  score_variance:
    calculate: "variance per item, take max"
    score: "Apply scoring table"
    check_veto: "max_variance > 25%?"

  checkpoint_match:
    calculate: "matching_checkpoints / total_checkpoints"
    score: "Apply scoring table"

  recommendation_quality:
    evaluate: "Would user take same action?"
    score: "Apply scoring table"
    check_veto: "Contradictory?"
```

### Step 4: Generate Report

```yaml
step_4:
  action: "Generate qualification report"

  output_format: |
    qualification_report:
      task: "{task_name}"
      evaluation_date: "{ISO date}"
      evaluator: "opus"

      inputs:
        opus_baseline: "{path}"
        haiku_output: "{path}"

      dimension_scores:
        tier_match:
          score: X/40
          match_rate: X%
          details: [...]

        score_variance:
          score: X/30
          avg_variance: X%
          max_variance: X%
          details: [...]

        checkpoint_match:
          score: X/20
          match_rate: X%
          details: [...]

        recommendation_quality:
          score: X/10
          assessment: "same|similar|different|contradictory"
          details: [...]

      total_score: X/100

      veto_conditions:
        triggered: [...]
        not_triggered: [...]

      decision: "QUALIFIED | CONDITIONAL | NOT_QUALIFIED"

      rationale: |
        {Explanation of decision}

      recommendations:
        if_qualified: |
          - Update model-routing.yaml: tier = haiku
          - Add validated: true with test_date
        if_conditional: |
          - {Specific fixes needed}
          - Re-test after fixes
        if_not_qualified: |
          - Keep tier = opus
          - Document root cause
```

---

## Output

Save qualification report to:
```
squads/squad-creator/test-cases/{task_name}/qualification-report.yaml
```

---

## Usage Example

```bash
*compare-outputs \
  --task an-assess-sources \
  --opus squads/squad-creator/test-cases/an-assess-sources/opus-baseline.yaml \
  --haiku squads/squad-creator/test-cases/an-assess-sources/haiku-v2.2.1-output.yaml \
  --task-file squads/squad-creator/tasks/an-assess-sources.md
```

---

## Completion Criteria

- [ ] Both output files loaded and parsed
- [ ] All 4 dimensions scored using rubric
- [ ] Veto conditions checked
- [ ] Total score calculated
- [ ] Decision determined (QUALIFIED/CONDITIONAL/NOT_QUALIFIED)
- [ ] Qualification report generated with full details
- [ ] Report saved to test-cases/{task}/qualification-report.yaml

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-11 | Initial version with 4-dimension rubric |
