#!/bin/bash
# Tests for clone-review.sh
# Run: bash squads/squad-creator/scripts/tests/test_clone_review.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/../clone-review.sh"
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

echo "=== test_clone_review.sh ==="

TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# Fixture: well-structured clone
cat > "$TMP/good-clone.md" << 'FIXTURE'
# Good Clone

## Workflow

### Step 1: Initialize
Execute the setup process.

### Step 2: Analyze
Generate the analysis report.

### Step 3: Validate
Check and verify all results.

output: Final report

## Framework

framework: Decision Pipeline
rules:
  - SE: input is valid
    ENTAO: process it
  - SE: input is invalid
    action: reject

if: condition A
then: do X
else: do Y
otherwise: fallback

## Examples

examples:
  - input: "Test query"
    output: "Test response"
    e.g. this shows the pattern

good example: structured query
bad example: unstructured input
edge case: empty input

[SOURCE: Real interaction]

## Voice DNA

voice_dna:
  vocabulary:
    always_use:
      - validate
      - execute
    never_use:
      - maybe

signature_phrases:
  - "Let's be direct"
  - "No shortcuts"
  - "Quality first"

catchphrases:
  - "Here's the deal"

## Thinking DNA

thinking_dna:
  primary_framework: Decision Pipeline
  mental_models:
    - First Principles

framework: Strategic Analysis
framework: Risk Assessment

## Immune System

veto: Never skip validation
never: Compromise quality
objection: Handle with data
reject: Low-quality input

## Stages

stages:
  - stage_1: Research
    trigger: New request
    behavior: Gather data
    action: Collect sources
    transition: Move to analysis
  - stage_2: Analysis
    trigger: Data ready
    behavior: Analyze patterns
FIXTURE

# Fixture: minimal clone
cat > "$TMP/minimal-clone.md" << 'FIXTURE'
# Minimal Clone

This is a simple placeholder.
Not much here.
FIXTURE

# Fixture: sources directory
SOURCES="$TMP/sources"
mkdir -p "$SOURCES"
echo "tier: ouro" > "$SOURCES/source1.md"
echo "tier: ouro" > "$SOURCES/source2.md"
echo "tier: bronze" > "$SOURCES/source3.md"

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

# --- Test 3: Good clone produces report ---
echo "  Test: good clone report"
output=$(bash "$SCRIPT" "$TMP/good-clone.md" 2>&1)
exit_code=$?
assert_exit "good_exit" "0" "$exit_code"
assert_contains "has_header" "Clone Review Report" "$output"

# --- Test 4: Trinity sections present ---
echo "  Test: trinity"
output=$(bash "$SCRIPT" "$TMP/good-clone.md" 2>&1)
assert_contains "has_trinity" "trinity:" "$output"
assert_contains "has_playbook" "playbook:" "$output"
assert_contains "has_framework" "framework:" "$output"
assert_contains "has_swipe" "swipe_file:" "$output"

# --- Test 5: Trinity scores for good clone ---
echo "  Test: trinity scores"
trinity_pct=$(echo "$output" | grep "trinity_percentage:" | head -1 | sed 's/[^0-9]//g')
TOTAL=$((TOTAL + 1))
if [[ -n "$trinity_pct" && "$trinity_pct" -ge 50 ]]; then
    PASS=$((PASS + 1))
else
    FAIL=$((FAIL + 1))
    echo "  FAIL: trinity_score (expected >=50%, got ${trinity_pct}%)"
fi

# --- Test 6: Stages section ---
echo "  Test: stages"
assert_contains "has_stages" "stages:" "$output"
assert_contains "stages_true" "has_stages: true" "$output"

# --- Test 7: Quick fidelity ---
echo "  Test: quick fidelity"
assert_contains "has_quick_fidelity" "quick_fidelity:" "$output"

# --- Test 8: Overall verdict ---
echo "  Test: verdict"
assert_contains "has_verdict" "verdict:" "$output"

# --- Test 9: With sources directory ---
echo "  Test: with sources"
output=$(bash "$SCRIPT" "$TMP/good-clone.md" "$SOURCES" 2>&1)
exit_code=$?
assert_exit "with_sources" "0" "$exit_code"
assert_contains "has_source_quality" "source_quality:" "$output"
assert_contains "has_total_sources" "total_sources:" "$output"
total_src=$(echo "$output" | grep "total_sources:" | head -1 | grep -oE '[0-9]+')
assert_eq "source_count" "3" "$total_src"

# --- Test 10: Without sources directory ---
echo "  Test: without sources"
output=$(bash "$SCRIPT" "$TMP/good-clone.md" 2>&1)
assert_contains "no_sources_note" "no_sources_dir" "$output"

# --- Test 11: Minimal clone scores low ---
echo "  Test: minimal clone"
output=$(bash "$SCRIPT" "$TMP/minimal-clone.md" 2>&1)
verdict=$(echo "$output" | grep "verdict:" | tail -1 | sed 's/.*: "//' | sed 's/".*//')
assert_eq "minimal_verdict" "REBUILD" "$verdict"

# --- Test 12: Determinism ---
echo "  Test: determinism"
out1=$(bash "$SCRIPT" "$TMP/good-clone.md" 2>&1 | grep "verdict:" | tail -1)
out2=$(bash "$SCRIPT" "$TMP/good-clone.md" 2>&1 | grep "verdict:" | tail -1)
assert_eq "deterministic" "$out1" "$out2"

echo ""
echo "=== RESULTS: $PASS/$TOTAL passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
