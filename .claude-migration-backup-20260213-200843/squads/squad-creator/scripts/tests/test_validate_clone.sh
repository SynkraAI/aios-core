#!/bin/bash
# Tests for validate-clone.sh
# Run: bash squads/squad-creator/scripts/tests/test_validate_clone.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/../validate-clone.sh"
FIDELITY_SCRIPT="$SCRIPT_DIR/../fidelity-score.sh"
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

# Check fidelity-score.sh exists (dependency)
if [[ ! -f "$FIDELITY_SCRIPT" ]]; then
    echo "ERROR: fidelity-score.sh not found at $FIDELITY_SCRIPT"
    exit 2
fi

echo "=== test_validate_clone.sh ==="

TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# Fixture: high-quality clone
cat > "$TMP/quality-clone.md" << 'FIXTURE'
# Quality Clone

activation-instructions: "Hello"
response_format: structured
modes:
  default: "Standard"
states:
  active: "Working"
triggers:
  - provocation: "Stay calm"
objection_handling:
  - response: "Let me explain"
never: Skip steps
anti_patterns:
  - Rushing

signature_phrases:
  - "Here's the deal"
  - "Let me be frank"
  - "No shortcuts"
  - "Quality first"

vocabulary:
  always_use:
    - validate
    - execute
    - deliver
    - verify
    - confirm
    - test
never_use:
  - maybe
  - perhaps
  - might
writing_style: Direct and punchy
sentence_pattern: Short declarative
tone: Confident
tone: Casual in private
tone: Formal in presentations

metaphors:
  - "Foundation before walls"
  - "Measure twice cut once"
  - "Polish after building"
  - "Test before deploy"

greeting: "Let's work."
steps:
  - Initialize
  - Execute
  - Validate
checkpoint: Verify each step
closing: "Done."
on_error: "Retry"

red_flags:
  - No tests
green_flags:
  - Clear specs
decision_rules:
  - If unclear ask
PV_BS_001: Always validate
threshold: 80%

primary_framework: Decision Pipeline
thinking_dna: systematic
decision_architecture:
  pipeline: Analyze Decide Execute
framework: Strategic Planning
framework: Risk Assessment
framework: Quality Gates
steps:
  - Analyze
anti_patterns:
  - Jumping to conclusions

core_beliefs:
  - Quality over speed
defends: Process
rejects: Shortcuts
never: Compromise
trade_off: Speed for quality
non_negotiable: Testing

obsession: Quality
focus_areas:
  - Automation
hills_to_die_on:
  - Testing
mission: Build reliable systems
legacy: Quality standard
impact: Industry improvement

contradictions:
  - "Fast but thorough"
paradox: Speed and quality
feature.not.bug: "Thoroughness"
context: "Emergency vs normal"
integration: "Balance"

experience: 20 years in the field
experience: Built 100+ systems
experience: Trained 500 engineers
client: Fortune 500 companies
case study: Reduced bugs by 90%

trigger: Quality provocation
objection_algorithm: Counter with data
FIXTURE

# Fixture: thin clone
cat > "$TMP/thin-clone.md" << 'FIXTURE'
# Thin Clone

A basic agent with minimal content.
Does some things.
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

# --- Test 3: Quality clone produces report ---
echo "  Test: quality clone report"
output=$(bash "$SCRIPT" "$TMP/quality-clone.md" 2>&1)
exit_code=$?
assert_exit "quality_exit" "0" "$exit_code"
assert_contains "has_validation_report" "validation_report:" "$output"
assert_contains "has_fidelity" "fidelity:" "$output"
assert_contains "has_authenticity" "authenticity:" "$output"
assert_contains "has_hackability" "hackability:" "$output"
assert_contains "has_verdict" "verdict:" "$output"

# --- Test 4: Authenticity markers scored ---
echo "  Test: authenticity markers"
output=$(bash "$SCRIPT" "$TMP/quality-clone.md" 2>&1)
for id in 1 2 3 4 5 6 7 8 9; do
    assert_contains "auth_marker_$id" "id: $id" "$output"
done
# AM10 should be REQUIRES_LLM
assert_contains "am10_requires_llm" "REQUIRES_LLM" "$output"

# --- Test 5: Hackability defaults to SKIPPED ---
echo "  Test: hackability skipped by default"
output=$(bash "$SCRIPT" "$TMP/quality-clone.md" 2>&1)
assert_contains "hack_skipped" "SKIPPED" "$output"

# --- Test 6: --assume-hack pass ---
echo "  Test: assume hack pass"
output=$(bash "$SCRIPT" "$TMP/quality-clone.md" --assume-hack pass 2>&1)
assert_contains "hack_assumed_pass" "ASSUMED_PASS" "$output"

# --- Test 7: --assume-hack fail ---
echo "  Test: assume hack fail"
output=$(bash "$SCRIPT" "$TMP/quality-clone.md" --assume-hack fail 2>&1)
assert_contains "hack_assumed_fail" "ASSUMED_FAIL" "$output"

# --- Test 8: Thin clone gets FAIL or REVIEW ---
echo "  Test: thin clone verdict"
output=$(bash "$SCRIPT" "$TMP/thin-clone.md" 2>&1)
assert_contains "thin_verdict" "(FAIL|REVIEW)" "$output"

# --- Test 9: JSON output ---
echo "  Test: JSON output"
json_output=$(bash "$SCRIPT" "$TMP/quality-clone.md" --json 2>&1)
assert_contains "json_brace" "^\{" "$json_output"
assert_contains "json_validation" '"validation_report"' "$json_output"

# --- Test 10: Decision tree thresholds ---
echo "  Test: decision tree"
# Quality clone with hack fail should FAIL
output=$(bash "$SCRIPT" "$TMP/quality-clone.md" --assume-hack fail 2>&1)
verdict=$(echo "$output" | grep "decision:" | head -1)
assert_contains "hack_fail_verdict" "FAIL" "$verdict"

# --- Test 11: Determinism ---
echo "  Test: determinism"
out1=$(bash "$SCRIPT" "$TMP/quality-clone.md" 2>&1 | grep "decision:")
out2=$(bash "$SCRIPT" "$TMP/quality-clone.md" 2>&1 | grep "decision:")
assert_eq "deterministic" "$out1" "$out2"

echo ""
echo "=== RESULTS: $PASS/$TOTAL passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
