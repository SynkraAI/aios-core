#!/bin/bash
# Tests for fidelity-score.sh
# Run: bash squads/squad-creator/scripts/tests/test_fidelity_score.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/../fidelity-score.sh"
PASS=0
FAIL=0
TOTAL=0

assert_eq() {
    local test_name="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL + 1))
    if [[ "$expected" == "$actual" ]]; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        echo "  FAIL: $test_name (expected '$expected', got '$actual')"
    fi
}

assert_contains() {
    local test_name="$1" pattern="$2" text="$3"
    TOTAL=$((TOTAL + 1))
    if echo "$text" | grep -qE "$pattern"; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        echo "  FAIL: $test_name (pattern '$pattern' not found)"
    fi
}

assert_exit() {
    local test_name="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL + 1))
    if [[ "$expected" == "$actual" ]]; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        echo "  FAIL: $test_name (expected exit $expected, got $actual)"
    fi
}

echo "=== test_fidelity_score.sh ==="

TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# Fixture: rich clone (should score high)
cat > "$TMP/rich-clone.md" << 'FIXTURE'
# Rich Clone Agent

## Persona
activation-instructions: "Start with greeting"

response_format:
  style: structured

modes:
  default: "Standard mode"
  diagnostic: "Debug mode"

states:
  idle: "Waiting"
  active: "Working"

triggers:
  provocation: "Stay calm"

objection_handling:
  - objection: "Too slow"
    response: "Quality takes time"

anti_patterns:
  never:
    - Skip validation
    - Ignore errors

## Voice DNA

signature_phrases:
  - "Let me be direct"
  - "Here's the thing"
  - "Bottom line"
  - "No shortcuts"

vocabulary:
  always_use:
    - validate
    - execute
    - deliver

never_use:
  - maybe
  - perhaps

writing_style: Direct, punchy sentences
tone: Confident but approachable

metaphors:
  - "Building a house needs foundation first"
  - "Don't polish a broken mirror"

## Workflow

greeting: "Ready to work."

steps:
  - step_1: Initialize
  - step_2: Execute
  - step_3: Validate

checkpoint: Verify at each stage
verify: Cross-check results

closing: "Mission complete."
sign_off: "Until next time."

on_error: "Retry with fallback"
fallback: "Use safe defaults"

## Recognition

red_flags:
  - Rushing without planning
veto_conditions:
  - No tests

green_flags:
  - Clear requirements
signals:
  - Good documentation

decision_rules:
  - "If unclear, ask"
heuristics:
  - PV_BS_001: "Always validate"

threshold: 80%
minimum: 60%

## Thinking DNA

primary_framework: "Decision Pipeline"
thinking_dna: systematic

decision_architecture:
  pipeline: "Analyze → Decide → Execute"

framework: Strategic Planning
framework: Risk Assessment
framework: Quality Gates

steps:
  - Analyze the problem
  - Design the solution

anti_patterns:
  - Jumping to conclusions

## Values

core_beliefs:
  - Quality over speed
  - Data over opinions

principles:
  - Test everything

defends: Rigorous process
advocates: Systematic approach

rejects: Shortcuts
never: Compromise quality

trade_off: Speed for quality
priorit: Quality first

non_negotiable: Testing
absolute: No untested code

## Obsessions

obsession: Quality
focus: Excellence
mission: Deliver perfect results

obsessions:
  - Zero defects

focus_areas:
  - Automation

hills_to_die_on:
  - Testing is non-negotiable
battles:
  - Against sloppy work

purpose: Build reliable systems
legacy: Set the standard
impact: Industry-wide quality improvement

## Paradoxes

contradictions:
  - "Move fast but never rush"

paradox: Speed and quality coexist
paradox: Simple solutions for complex problems

feature.not.bug: "Slowness is thoroughness"
intentional: "Redundancy is safety"

context: "In emergencies, skip some steps"
situational: "Client demos vs internal work"

integration: "Balance speed and quality"
reconcil: "Find the sweet spot"
balance: "Know when to optimize"
FIXTURE

# Fixture: empty clone (should score low)
cat > "$TMP/empty-clone.md" << 'FIXTURE'
# Empty Clone

This clone has minimal content.
Just a placeholder.
FIXTURE

# --- Test 1: No args ---
echo "  Test: no args"
output=$(bash "$SCRIPT" 2>&1)
exit_code=$?
assert_exit "no_args" "1" "$exit_code"
assert_contains "no_args_usage" "Usage:" "$output"

# --- Test 2: Missing file ---
echo "  Test: missing file"
output=$(bash "$SCRIPT" "$TMP/nonexistent.md" 2>&1)
exit_code=$?
assert_exit "missing_file" "1" "$exit_code"

# --- Test 3: Rich clone scores high ---
echo "  Test: rich clone"
output=$(bash "$SCRIPT" "$TMP/rich-clone.md" 2>&1)
exit_code=$?
assert_exit "rich_exit" "0" "$exit_code"
pct=$(echo "$output" | grep "percentage:" | head -1 | sed 's/[^0-9.]//g')
pct_int=${pct%.*}
TOTAL=$((TOTAL + 1))
if [[ "$pct_int" -ge 70 ]]; then
    PASS=$((PASS + 1))
else
    FAIL=$((FAIL + 1))
    echo "  FAIL: rich_score_high (expected >=70%, got ${pct_int}%)"
fi

# --- Test 4: Empty clone scores low ---
echo "  Test: empty clone"
output=$(bash "$SCRIPT" "$TMP/empty-clone.md" 2>&1)
pct=$(echo "$output" | grep "percentage:" | head -1 | sed 's/[^0-9.]//g')
pct_int=${pct%.*}
TOTAL=$((TOTAL + 1))
if [[ "$pct_int" -le 30 ]]; then
    PASS=$((PASS + 1))
else
    FAIL=$((FAIL + 1))
    echo "  FAIL: empty_score_low (expected <=30%, got ${pct_int}%)"
fi

# --- Test 5: All 8 layers present in output ---
echo "  Test: 8 layers"
output=$(bash "$SCRIPT" "$TMP/rich-clone.md" 2>&1)
for layer in 1 2 3 4 5 6 7 8; do
    assert_contains "layer_$layer" "layer_${layer}_" "$output"
done

# --- Test 6: Classification present ---
echo "  Test: classification"
assert_contains "has_classification" "classification:" "$output"

# --- Test 7: Summary section ---
echo "  Test: summary"
assert_contains "has_summary" "summary:" "$output"
assert_contains "has_observable" "observable:" "$output"
assert_contains "has_deep" "deep:" "$output"

# --- Test 8: Score is deterministic (same input = same output) ---
echo "  Test: determinism"
out1=$(bash "$SCRIPT" "$TMP/rich-clone.md" 2>&1 | grep "percentage:")
out2=$(bash "$SCRIPT" "$TMP/rich-clone.md" 2>&1 | grep "percentage:")
assert_eq "deterministic" "$out1" "$out2"

echo ""
echo "=== RESULTS: $PASS/$TOTAL passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
