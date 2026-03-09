#!/bin/bash
# Tests for assess-sources.sh
# Run: bash squads/squad-creator/scripts/tests/test_assess_sources.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/../assess-sources.sh"
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

echo "=== test_assess_sources.sh ==="

TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# Fixture: gold source (high quality)
SOURCES_GOLD="$TMP/sources-gold"
mkdir -p "$SOURCES_GOLD"
cat > "$SOURCES_GOLD/interview-deep.md" << 'FIXTURE'
# Deep Interview with Expert — 2024

Honestly, I was wrong about this for years. I struggled with the same problem
and it was a painful failure. Let me tell you my story.

The difficult question is: what do we sacrifice for speed?
It depends on context. On the other hand, there are nuances.
I remember when I was starting out, years ago, my experience taught me...

Because this matters, the reason is clear. The key insight is this:
My framework has 3 steps: Step 1, Step 2, Step 3.
We had $500K in revenue with 200 clients. The trade-off was significant.
Just as in biology, the analogy is striking. Similar to how physics works.

This was published in 2024. AI and ChatGPT changed everything.
I used to think differently, but now I evolved and shifted my approach.
You can try this: start with actionable steps, apply and implement.

Most people are wrong about this. I call it the "Decision Matrix" —
what I call my proprietary framework. It's counter-intuitive but
my perspective is unique. Actually, the opposite is true.

Step 1: Analyze the problem thoroughly.
Step 2: Design the solution carefully.
Step 3: Execute with precision.
If the conditions change, then adjust. There are edge cases and caveats.
For example, such as when dealing with enterprise clients.
Watch out for this exception unless you have enough data.
This is a comprehensive guide with many more insights to follow.
FIXTURE
# Pad to 250+ lines
for i in $(seq 1 200); do echo "Additional insight line $i about the framework." >> "$SOURCES_GOLD/interview-deep.md"; done

# Fixture: bronze source (low quality)
cat > "$SOURCES_GOLD/promo-post.md" << 'FIXTURE'
# Check Out Our New Product!

Buy now! Limited time offer!
Click the link below to learn more.
This product is amazing and everyone loves it.
Get 50% off today only!
FIXTURE

# Fixture: mixed source
cat > "$SOURCES_GOLD/blog-post.md" << 'FIXTURE'
# Why Process Matters in 2025

Because process is the foundation. Step 1: Plan. Step 2: Execute.
AI changed the game. You can start with this simple method.
For example, take the case of a startup with 50 employees.
The downside is it takes longer, but the trade-off is worth it.
Most people skip this step, which is wrong about this area.
FIXTURE
for i in $(seq 1 180); do echo "Extended analysis paragraph $i." >> "$SOURCES_GOLD/blog-post.md"; done

# Fixture: empty dir
SOURCES_EMPTY="$TMP/sources-empty"
mkdir -p "$SOURCES_EMPTY"

# Fixture: single file dir
SOURCES_SINGLE="$TMP/sources-single"
mkdir -p "$SOURCES_SINGLE"
cat > "$SOURCES_SINGLE/only-file.md" << 'FIXTURE'
# Only Source
Honestly, I struggled with failure. My experience years ago taught me.
Because the reason matters. Framework with Step 1 and Step 2.
50 clients generated $100K. The trade-off was real.
Published 2024. AI is relevant. You can apply this now.
Most people disagree. I call it my unique approach. Actually surprising.
If X then Y. For example, a case study. Edge case warning.
FIXTURE
for i in $(seq 1 180); do echo "Content line $i." >> "$SOURCES_SINGLE/only-file.md"; done

# --- Test 1: No args ---
echo "  Test: no args"
output=$(bash "$SCRIPT" 2>&1)
exit_code=$?
assert_exit "no_args" "1" "$exit_code"
assert_contains "no_args_usage" "Usage:" "$output"

# --- Test 2: Missing directory ---
echo "  Test: missing directory"
output=$(bash "$SCRIPT" "$TMP/nonexistent/" 2>&1)
exit_code=$?
assert_exit "missing_dir" "1" "$exit_code"

# --- Test 3: Empty directory ---
echo "  Test: empty directory"
output=$(bash "$SCRIPT" "$SOURCES_EMPTY" 2>&1)
exit_code=$?
assert_exit "empty_dir" "1" "$exit_code"
assert_contains "empty_no_files" "No source files" "$output"

# --- Test 4: Gold source produces report ---
echo "  Test: gold source report"
output=$(bash "$SCRIPT" "$SOURCES_GOLD" 2>&1)
exit_code=$?
assert_exit "gold_exit" "0" "$exit_code"
assert_contains "has_assessment" "source_assessment:" "$output"
assert_contains "has_summary" "summary:" "$output"
assert_contains "has_total" "total_sources:" "$output"

# --- Test 5: 5 dimensions per source ---
echo "  Test: 5 dimensions"
output=$(bash "$SCRIPT" "$SOURCES_SINGLE" 2>&1)
assert_contains "has_autenticidade" "autenticidade:" "$output"
assert_contains "has_profundidade" "profundidade:" "$output"
assert_contains "has_atualidade" "atualidade:" "$output"
assert_contains "has_unicidade" "unicidade:" "$output"
assert_contains "has_completude" "completude:" "$output"

# --- Test 6: Tier classification ---
echo "  Test: tier classification"
output=$(bash "$SCRIPT" "$SOURCES_GOLD" 2>&1)
assert_contains "has_tier" "tier:" "$output"
# At least one should be bronze (the promo post)
assert_contains "has_bronze" "bronze" "$output"

# --- Test 7: D1 < 3 forces bronze ---
echo "  Test: D1 forces bronze"
# The promo post has no authenticity markers, should be forced bronze
promo_section=$(echo "$output" | grep -A20 "promo-post")
assert_contains "promo_bronze" "bronze" "$promo_section"

# --- Test 8: Aggregation counts ---
echo "  Test: aggregation"
output=$(bash "$SCRIPT" "$SOURCES_GOLD" 2>&1)
assert_contains "has_ouro_count" "ouro_count:" "$output"
assert_contains "has_mixed_count" "mixed_count:" "$output"
assert_contains "has_bronze_count" "bronze_count:" "$output"
assert_contains "has_overall" "overall_quality:" "$output"

# --- Test 9: Correct source count ---
echo "  Test: source count"
total=$(echo "$output" | grep "total_sources:" | head -1 | grep -oE '[0-9]+')
assert_eq "source_count" "3" "$total"

# --- Test 10: JSON output ---
echo "  Test: JSON output"
json_output=$(bash "$SCRIPT" "$SOURCES_GOLD" --json 2>&1)
exit_code=$?
assert_exit "json_exit" "0" "$exit_code"
assert_contains "json_brace" "^\{" "$json_output"
assert_contains "json_assessment" '"source_assessment"' "$json_output"

# --- Test 11: Determinism ---
echo "  Test: determinism"
out1=$(bash "$SCRIPT" "$SOURCES_SINGLE" 2>&1 | grep "average_score:")
out2=$(bash "$SCRIPT" "$SOURCES_SINGLE" 2>&1 | grep "average_score:")
assert_eq "deterministic" "$out1" "$out2"

# --- Test 12: Single source works ---
echo "  Test: single source"
output=$(bash "$SCRIPT" "$SOURCES_SINGLE" 2>&1)
exit_code=$?
assert_exit "single_exit" "0" "$exit_code"
total=$(echo "$output" | grep "total_sources:" | head -1 | grep -oE '[0-9]+')
assert_eq "single_count" "1" "$total"

echo ""
echo "=== RESULTS: $PASS/$TOTAL passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
