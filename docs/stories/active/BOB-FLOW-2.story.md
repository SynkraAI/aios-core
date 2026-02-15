# Story BOB-FLOW-2: Enhanced Surface Conditions

```yaml
id: BOB-FLOW-2
title: Improve surface decision logic with explicit trade-offs
type: enhancement
priority: P1
severity: high
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review', 'unit_test']
estimated_effort: 2h
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio - Process Quality)
**Location:** `surface-checker.js` and surface decision points

Currently, surface conditions in `shouldSurface()` use simple thresholds without explicitly considering trade-offs. BOB should surface to user when decisions have meaningful trade-offs, not just based on option counts.

## Problem Statement

**Current logic (surface-checker.js:32-52):**
```javascript
shouldSurface(context) {
  const {
    valid_options_count = 0,
    user_context_missing = false,
    high_cost_operation = false,
    options_with_tradeoffs = null,
  } = context;

  // Surface if 2+ valid options exist
  if (valid_options_count >= 2) {
    return { should_surface: true, reason: 'multiple_valid_options' };
  }
  // ...
}
```

**Issues:**
1. Doesn't evaluate QUALITY of trade-offs
2. Surfaces for trivial choices
3. Missing context about decision impact
4. No consideration of user expertise level

**Risk:**
- User gets asked about trivial decisions → poor UX
- Critical decisions auto-execute → unexpected behavior
- No clear guidance on WHEN to use each option

## Acceptance Criteria

- [x] AC1: Add trade-off scoring to shouldSurface()
- [x] AC2: Surface when trade-offs have high impact
- [x] AC3: Auto-decide trivial choices (low impact trade-offs)
- [x] AC4: Include trade-off summary in surface message
- [x] AC5: Add decision impact assessment
- [x] AC6: Unit tests for trade-off scoring

## Implementation Plan

### Step 1: Add trade-off impact scoring

```javascript
/**
 * Scores the impact of trade-offs for a decision
 * @param {Object} tradeoffs - Trade-off analysis
 * @returns {Object} Impact score and classification
 * @private
 */
_scoreTradeoffImpact(tradeoffs) {
  let impactScore = 0;
  const factors = [];

  // Factor 1: Reversibility (can user undo this?)
  if (tradeoffs.reversibility === 'hard') {
    impactScore += 30;
    factors.push('irreversible');
  } else if (tradeoffs.reversibility === 'moderate') {
    impactScore += 15;
    factors.push('hard_to_reverse');
  }

  // Factor 2: Blast radius (how many things affected?)
  if (tradeoffs.blast_radius === 'high') {
    impactScore += 25;
    factors.push('high_blast_radius');
  } else if (tradeoffs.blast_radius === 'medium') {
    impactScore += 10;
    factors.push('medium_blast_radius');
  }

  // Factor 3: Cost (time/money/effort)
  if (tradeoffs.cost === 'high') {
    impactScore += 20;
    factors.push('high_cost');
  }

  // Factor 4: User expertise required
  if (tradeoffs.expertise_required === 'high') {
    impactScore += 15;
    factors.push('requires_expertise');
  }

  // Factor 5: Consequences (data loss, security, etc.)
  if (tradeoffs.consequences?.includes('data_loss')) {
    impactScore += 30;
    factors.push('data_loss_risk');
  }

  // Classification
  let classification;
  if (impactScore >= 50) {
    classification = 'critical'; // MUST surface
  } else if (impactScore >= 25) {
    classification = 'significant'; // SHOULD surface
  } else {
    classification = 'trivial'; // CAN auto-decide
  }

  return {
    score: impactScore,
    classification,
    factors,
  };
}
```

### Step 2: Update shouldSurface() logic

```javascript
shouldSurface(context) {
  const {
    valid_options_count = 0,
    user_context_missing = false,
    high_cost_operation = false,
    options_with_tradeoffs = null,
    decision_metadata = {},
  } = context;

  // NEW: Evaluate trade-off impact
  if (options_with_tradeoffs) {
    const impact = this._scoreTradeoffImpact(decision_metadata.tradeoffs || {});

    // Critical decisions MUST surface
    if (impact.classification === 'critical') {
      return {
        should_surface: true,
        reason: 'critical_tradeoffs',
        impact,
        guidance: 'Esta decisão tem consequências significativas. Por favor, revise as opções.',
      };
    }

    // Significant decisions SHOULD surface (unless user prefers auto)
    if (impact.classification === 'significant' && valid_options_count >= 2) {
      return {
        should_surface: true,
        reason: 'significant_tradeoffs',
        impact,
        guidance: 'Há trade-offs importantes a considerar.',
      };
    }

    // Trivial decisions can auto-decide
    if (impact.classification === 'trivial' && valid_options_count === 1) {
      return {
        should_surface: false,
        reason: 'trivial_auto_decide',
        auto_selected: decision_metadata.recommended_option,
      };
    }
  }

  // Existing logic for backward compatibility...
  if (valid_options_count >= 2) {
    return { should_surface: true, reason: 'multiple_valid_options' };
  }

  // ...
}
```

### Step 3: Add trade-off metadata to decision points

Update callers to provide trade-off context:

```javascript
// Example in handleSessionResume()
const surfaceResult = this.surfaceChecker.shouldSurface({
  valid_options_count: 4,
  options_with_tradeoffs: sessionCheck.summary,
  decision_metadata: {
    tradeoffs: {
      reversibility: 'moderate', // Can re-run orchestrate, but loses flow
      blast_radius: 'low', // Only affects current session
      cost: 'low', // Just time to re-decide
      expertise_required: 'low', // User knows their intent
      consequences: [], // No data loss
    },
    recommended_option: 'continue', // Default suggestion
  },
});
```

### Step 4: Add unit tests

```javascript
describe('BOB-FLOW-2: Enhanced surface conditions', () => {
  it('should surface critical decisions (data loss risk)', () => {
    const checker = new SurfaceChecker();
    const result = checker.shouldSurface({
      valid_options_count: 2,
      options_with_tradeoffs: 'Delete vs Archive',
      decision_metadata: {
        tradeoffs: {
          reversibility: 'hard',
          blast_radius: 'high',
          consequences: ['data_loss'],
        },
      },
    });

    expect(result.should_surface).toBe(true);
    expect(result.reason).toBe('critical_tradeoffs');
  });

  it('should auto-decide trivial choices', () => {
    const checker = new SurfaceChecker();
    const result = checker.shouldSurface({
      valid_options_count: 1,
      options_with_tradeoffs: null,
      decision_metadata: {
        tradeoffs: {
          reversibility: 'easy',
          blast_radius: 'none',
          cost: 'negligible',
        },
        recommended_option: 'proceed',
      },
    });

    expect(result.should_surface).toBe(false);
    expect(result.reason).toBe('trivial_auto_decide');
  });
});
```

## Testing Strategy

1. Unit test: Trade-off scoring algorithm
2. Unit test: Surface decision matrix
3. Integration test: Real decisions with trade-offs
4. Manual test: User experience with enhanced surfacing

## File List

- `.aios-core/core/orchestration/surface-checker.js` (modified)
- `tests/core/orchestration/bob-flow-2.test.js` (created)

## Definition of Done

- [x] Trade-off impact scoring implemented
- [x] Surface logic considers impact
- [x] Trivial decisions auto-execute
- [x] Critical decisions always surface
- [x] Unit tests pass
- [x] Code review approved

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
