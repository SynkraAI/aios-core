# PV_PA_001 - Systemic Coherence Scan

**Type:** Decision Heuristic
**Phase:** 3 (Executors)
**Agent:** @hybridOps:executor-designer
**Pattern:** HO-PP-003 (Quality Gate Pattern)

## Purpose

Coherence validation for executor assignments and people assessment. Evaluates truthfulness, system adherence potential, and technical skills with truthfulness having VETO power.

## Configuration

```yaml
PV_PA_001:
  name: "Systemic Coherence Scan"
  phase: 3
  pattern_reference: "HO-PP-003"

  weights:
    truthfulness_coherence: 1.0  # VETO power
    system_adherence_potential: 0.8
    technical_skill: 0.3

  thresholds:
    truthfulness: 0.7  # Must be 'Coherent'
    system_adherence: 0.7
    technical_skill: null  # No minimum, context-dependent

  veto_conditions:
    - condition: "truthfulness_coherence < 0.7"
      action: "VETO - REJECT/REMOVE immediately"
    - condition: "detected_incoherence = true"
      action: "VETO - Trust violation, cannot proceed"

  fallback_mechanisms:
    - "In case of doubt about coherence, apply test period with tasks that reveal consistency"
    - "Use objective metrics over subjective impressions"

  output:
    type: "decision"
    values: ["APPROVE", "REVIEW", "VETO"]
```

## Application

**Input:** Executor assignment proposals, role definitions, team roster
**Process:** Evaluate each executor against coherence criteria
**Output:** APPROVE | REVIEW | VETO

## Decision Tree

```
PRIMARY BRANCH:
  IF (truthfulness_coherence == 'Incoherent' OR 'Lie Detected')
    THEN REJECT/REMOVE immediately → VETO

SECONDARY BRANCH:
  ELSE IF (system_adherence_potential < 0.7)
    THEN REJECT or FLAG for observation → REVIEW

TERTIARY BRANCH:
  ELSE IF (technical_skill < required_level)
    THEN Consider training or reassignment → REVIEW with conditions

TERMINATION: Primary branch violation
FALLBACK: Apply test period with revealing tasks when coherence is uncertain
```

## Evaluation Criteria

| Criterion | Weight | Threshold | VETO Power | Description |
|-----------|--------|-----------|------------|-------------|
| Truthfulness Coherence | 1.0 | Must be 'Coherent' | YES | Is the executor honest and consistent? |
| System Adherence Potential | 0.8 | ≥0.7 | NO | Can they operate within clear systems? |
| Technical Skill | 0.3 | Context-dependent | NO | Current technical ability level |

## Truthfulness Assessment

```yaml
truthfulness_states:
  coherent:
    description: "Statements align with actions and observable data"
    score_range: [0.7, 1.0]
    action: "APPROVE"

  incoherent:
    description: "Statements contradict actions or data without explanation"
    score_range: [0.4, 0.7]
    action: "REVIEW - Investigate further"

  lie_detected:
    description: "Deliberate misrepresentation identified"
    score_range: [0.0, 0.4]
    action: "VETO - Immediate removal"
```

## Performance Metrics

```yaml
performance:
  decision_speed:
    rejection_for_incoherence: "< 5 minutes"
    full_evaluation: "1-2 days"
  accuracy_rate: "95% (predicting long-term cultural fit)"
  confidence_level: "99%"
  resource_efficiency: 10/10
```

## Failure Modes

### False Negative Rejection
- **Trigger:** Interpreting communication error or misunderstanding as deliberate lie; overly rigid system
- **Manifestation:** Rejecting talented, high-potential candidate for small interview inconsistency
- **Detection:** Feedback from other interviewers that 'lie' perception was too severe
- **Recovery:** Institute "appeal tribunal" with trust circle for borderline cases
- **Prevention:** Add subroutine differentiating between 'inconsistency from nervousness' and 'inconsistency from intent'

## Behavioral Evidence

**Example:** Dismissing technically superior filmmakers
- **Context:** Internal conflict in filming team
- **Information Available:** Evidence that filmmakers were creating stories (lying) to harm a colleague
- **Heuristic Application:** 'truthfulness_coherence' parameter was violated. Weight of 'technical_skill' became irrelevant. Removal decision was immediate.
- **Outcome:** More cohesive team aligned with company values, though temporarily less technically skilled

## Integration with HO-PP-003

This heuristic integrates with the Quality Gate Pattern at Phase 3:

```yaml
checkpoint:
  id: "coherence-scan"
  heuristic: PV_PA_001
  phase: 3

  criteria:
    - metric: "executor_truthfulness"
      threshold: 0.7
      operator: ">="
      scope: "each executor"
    - metric: "weighted_coherence"
      threshold: 0.8
      operator: ">="
    - metric: "system_adherence"
      threshold: 0.6
      operator: ">="

  veto_conditions:
    - condition: "any executor truthfulness < 0.7"
      action: "VETO - Reassign executor"

  validation_questions:
    - "Is each executor the right fit for their tasks?"
    - "Are human tasks truly requiring human judgment?"
    - "Can any human tasks be automated?"

  pass_action: "Proceed to Phase 4 (Workflows)"
  fail_action: "Reassign executors and re-evaluate"
```

## Executor Type Coherence Matrix

| Executor Type | Min Truthfulness | Min System Adherence | Technical Weight |
|---------------|------------------|----------------------|------------------|
| Human | 0.7 (VETO) | 0.7 | 0.3 |
| Hybrid | 0.7 (VETO) | 0.8 | 0.4 |
| Agent | N/A | 0.9 | 0.6 |
| Worker | N/A | 0.95 | 0.8 |

---

**Pattern Compliance:** HO-PP-003 (Quality Gate) ✓ | HO-EP-XXX (Executor Patterns) ✓
**Source:** PV Mind Artifacts - Heurísticas de Decisão
