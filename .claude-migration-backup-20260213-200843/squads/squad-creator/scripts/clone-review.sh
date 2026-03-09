#!/bin/bash
# clone-review.sh - Deterministic clone review (no LLM needed for 90%)
# Usage: ./clone-review.sh <clone-file> [sources-dir]
#
# Replaces 90% of an-clone-review task with pure bash/grep

set -e

CLONE_FILE="$1"
SOURCES_DIR="${2:-}"

if [[ -z "$CLONE_FILE" ]]; then
    echo "Usage: $0 <clone-file.md> [sources-dir]"
    exit 1
fi

if [[ ! -f "$CLONE_FILE" ]]; then
    echo "Error: File not found: $CLONE_FILE"
    exit 1
fi

echo "# Clone Review Report"
echo "# Generated: $(date -Iseconds)"
echo "# File: $CLONE_FILE"
echo ""

# ============================================================================
# STEP 1: SOURCE QUALITY REVIEW
# ============================================================================
echo "source_quality:"

if [[ -n "$SOURCES_DIR" && -d "$SOURCES_DIR" ]]; then
    TOTAL_SOURCES=$(find "$SOURCES_DIR" -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.txt" \) | wc -l | tr -d ' ')
    OURO_COUNT=$(grep -rl "tier:.*ouro" "$SOURCES_DIR" 2>/dev/null | wc -l | tr -d ' ' || echo 0)
    BRONZE_COUNT=$((TOTAL_SOURCES - OURO_COUNT))

    if [[ $TOTAL_SOURCES -gt 0 ]]; then
        OURO_PCT=$((OURO_COUNT * 100 / TOTAL_SOURCES))
    else
        OURO_PCT=0
    fi

    if [[ $OURO_PCT -ge 80 ]]; then
        CURADORIA="excelente"
    elif [[ $OURO_PCT -ge 60 ]]; then
        CURADORIA="aceitavel"
    else
        CURADORIA="critico"
    fi

    echo "  total_sources: $TOTAL_SOURCES"
    echo "  ouro_count: $OURO_COUNT"
    echo "  bronze_count: $BRONZE_COUNT"
    echo "  ouro_percentage: \"${OURO_PCT}%\""
    echo "  curadoria_score: \"$CURADORIA\""
else
    echo "  total_sources: 0"
    echo "  ouro_count: 0"
    echo "  bronze_count: 0"
    echo "  ouro_percentage: \"N/A\""
    echo "  curadoria_score: \"no_sources_dir\""
    echo "  note: \"No sources directory provided\""
fi

echo ""

# ============================================================================
# STEP 2: TRINITY VERIFICATION
# ============================================================================
echo "trinity:"

# --- PLAYBOOK ---
echo "  playbook:"
PB_SCORE=0
PB_PASSED=()
PB_FAILED=()

# Checkpoint 1: Section exists
if grep -qiE "(playbook:|workflow:|## workflow)" "$CLONE_FILE"; then
    PB_SCORE=$((PB_SCORE + 1))
    PB_PASSED+=("1")
else
    PB_FAILED+=("1")
fi

# Checkpoint 2: Has steps (3+)
STEPS_COUNT=$(grep -ciE "(step[_ ][0-9]|### step|^[0-9]+\\.)" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
STEPS_COUNT=${STEPS_COUNT:-0}
if [[ "$STEPS_COUNT" -ge 3 ]]; then
    PB_SCORE=$((PB_SCORE + 1))
    PB_PASSED+=("2")
else
    PB_FAILED+=("2")
fi

# Checkpoint 3: Steps are sequential
if grep -qiE "(step 1|step_1|### step 1|^1\\.)" "$CLONE_FILE"; then
    PB_SCORE=$((PB_SCORE + 1))
    PB_PASSED+=("3")
else
    PB_FAILED+=("3")
fi

# Checkpoint 4: Steps are actionable (verbs)
if grep -qiE "(execute|create|generate|analyze|validate|verify|check)" "$CLONE_FILE"; then
    PB_SCORE=$((PB_SCORE + 1))
    PB_PASSED+=("4")
else
    PB_FAILED+=("4")
fi

# Checkpoint 5: Has output definition
if grep -qiE "(output:|produces:|generates:|result:)" "$CLONE_FILE"; then
    PB_SCORE=$((PB_SCORE + 1))
    PB_PASSED+=("5")
else
    PB_FAILED+=("5")
fi

echo "    checkpoints_passed: [${PB_PASSED[*]}]"
echo "    checkpoints_failed: [${PB_FAILED[*]}]"
echo "    score: $PB_SCORE"

# --- FRAMEWORK ---
echo "  framework:"
FW_SCORE=0
FW_PASSED=()
FW_FAILED=()

# Checkpoint 1: Section exists
if grep -qiE "(framework:|heuristics:|rules:)" "$CLONE_FILE"; then
    FW_SCORE=$((FW_SCORE + 1))
    FW_PASSED+=("1")
else
    FW_FAILED+=("1")
fi

# Checkpoint 2: Has rules (3+)
RULES_COUNT=$(grep -ciE "(rule:|SE:|IF:|when:)" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
RULES_COUNT=${RULES_COUNT:-0}
if [[ "$RULES_COUNT" -ge 3 ]]; then
    FW_SCORE=$((FW_SCORE + 1))
    FW_PASSED+=("2")
else
    FW_FAILED+=("2")
fi

# Checkpoint 3: Rules are conditional
if grep -qiE "(if:|when:|SE:|\bif\b)" "$CLONE_FILE"; then
    FW_SCORE=$((FW_SCORE + 1))
    FW_PASSED+=("3")
else
    FW_FAILED+=("3")
fi

# Checkpoint 4: Rules have actions
if grep -qiE "(then:|ENTAO:|action:|→)" "$CLONE_FILE"; then
    FW_SCORE=$((FW_SCORE + 1))
    FW_PASSED+=("4")
else
    FW_FAILED+=("4")
fi

# Checkpoint 5: Has decision tree
if grep -qiE "(else:|elif:|otherwise:|default:)" "$CLONE_FILE"; then
    FW_SCORE=$((FW_SCORE + 1))
    FW_PASSED+=("5")
else
    FW_FAILED+=("5")
fi

echo "    checkpoints_passed: [${FW_PASSED[*]}]"
echo "    checkpoints_failed: [${FW_FAILED[*]}]"
echo "    score: $FW_SCORE"

# --- SWIPE FILE ---
echo "  swipe_file:"
SW_SCORE=0
SW_PASSED=()
SW_FAILED=()

# Checkpoint 1: Section exists
if grep -qiE "(examples:|swipe:|samples:)" "$CLONE_FILE"; then
    SW_SCORE=$((SW_SCORE + 1))
    SW_PASSED+=("1")
else
    SW_FAILED+=("1")
fi

# Checkpoint 2: Has examples (3+)
EXAMPLES_COUNT=$(grep -ciE "(example:|sample:|e\.g\.)" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
EXAMPLES_COUNT=${EXAMPLES_COUNT:-0}
if [[ "$EXAMPLES_COUNT" -ge 3 ]]; then
    SW_SCORE=$((SW_SCORE + 1))
    SW_PASSED+=("2")
else
    SW_FAILED+=("2")
fi

# Checkpoint 3: Examples are real (have source)
if grep -qiE "(\[SOURCE|\[REAL|from:|\[cite)" "$CLONE_FILE"; then
    SW_SCORE=$((SW_SCORE + 1))
    SW_PASSED+=("3")
else
    SW_FAILED+=("3")
fi

# Checkpoint 4: Examples show input/output
if grep -qiE "(input:|output:|before:|after:|→)" "$CLONE_FILE"; then
    SW_SCORE=$((SW_SCORE + 1))
    SW_PASSED+=("4")
else
    SW_FAILED+=("4")
fi

# Checkpoint 5: Examples are diverse
EXAMPLE_TYPES=$(grep -ciE "(good example|bad example|edge case|special case)" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
EXAMPLE_TYPES=${EXAMPLE_TYPES:-0}
if [[ "$EXAMPLE_TYPES" -ge 2 ]]; then
    SW_SCORE=$((SW_SCORE + 1))
    SW_PASSED+=("5")
else
    SW_FAILED+=("5")
fi

echo "    checkpoints_passed: [${SW_PASSED[*]}]"
echo "    checkpoints_failed: [${SW_FAILED[*]}]"
echo "    score: $SW_SCORE"

# --- TRINITY TOTAL ---
TRINITY_TOTAL=$((PB_SCORE + FW_SCORE + SW_SCORE))
TRINITY_PCT=$((TRINITY_TOTAL * 100 / 15))

if [[ $TRINITY_PCT -ge 80 ]]; then
    TRINITY_VERDICT="SOLID"
elif [[ $TRINITY_PCT -ge 60 ]]; then
    TRINITY_VERDICT="NEEDS_WORK"
else
    TRINITY_VERDICT="REBUILD"
fi

echo "  total_score: $TRINITY_TOTAL"
echo "  max_score: 15"
echo "  percentage: \"${TRINITY_PCT}%\""
echo "  verdict: \"$TRINITY_VERDICT\""

echo ""

# ============================================================================
# STEP 3: STAGE ARCHITECTURE REVIEW
# ============================================================================
echo "stages:"

HAS_STAGES=$(grep -c "stages:" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
HAS_STAGES=${HAS_STAGES:-0}
FILE_LINES=$(wc -l < "$CLONE_FILE" | tr -d ' ')

if [[ "$HAS_STAGES" -gt 0 ]]; then
    echo "  has_stages: true"

    # Count stages
    STAGE_COUNT=$(grep -ciE "(stage[_ ][0-9]|## stage)" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
    STAGE_COUNT=${STAGE_COUNT:-0}

    ST_SCORE=0

    # Checkpoint 1: Stages defined
    if [[ "$HAS_STAGES" -gt 0 ]]; then ST_SCORE=$((ST_SCORE + 1)); fi

    # Checkpoint 2: 2+ stages
    if [[ "$STAGE_COUNT" -ge 2 ]]; then ST_SCORE=$((ST_SCORE + 1)); fi

    # Checkpoint 3: Each stage has trigger
    if grep -qiE "(trigger:|when:|activation:)" "$CLONE_FILE"; then ST_SCORE=$((ST_SCORE + 1)); fi

    # Checkpoint 4: Each stage has behavior
    if grep -qiE "(behavior:|response:|action:)" "$CLONE_FILE"; then ST_SCORE=$((ST_SCORE + 1)); fi

    # Checkpoint 5: Transitions defined
    if grep -qiE "(transition:|next_stage:|flow:)" "$CLONE_FILE"; then ST_SCORE=$((ST_SCORE + 1)); fi

    echo "  stage_count: $STAGE_COUNT"
    echo "  stage_score: $ST_SCORE"
else
    echo "  has_stages: false"

    # Check if needs stages
    NEEDS_STAGES="false"
    if [[ "$FILE_LINES" -gt 500 ]]; then
        NEEDS_STAGES="true"
        echo "  needs_stages: true"
        echo "  reason: \"File > 500 lines ($FILE_LINES)\""
    elif grep -qiE "(context:|mode:|state:)" "$CLONE_FILE"; then
        NEEDS_STAGES="true"
        echo "  needs_stages: true"
        echo "  reason: \"Multiple contexts detected\""
    else
        echo "  needs_stages: false"
    fi
    echo "  stage_score: 0"
fi

echo ""

# ============================================================================
# STEP 4: QUICK FIDELITY CHECK
# ============================================================================
echo "quick_fidelity:"
QF_SCORE=0
QF_PASSED=()
QF_FAILED=()

# Checkpoint 1: Voice DNA exists
if grep -qiE "(voice_dna:|voice:|communication_style:)" "$CLONE_FILE"; then
    QF_SCORE=$((QF_SCORE + 1))
    QF_PASSED+=("1")
else
    QF_FAILED+=("1")
fi

# Checkpoint 2: Has signature phrases
if grep -qiE "(signature_phrases:|catchphrases:|phrases:)" "$CLONE_FILE"; then
    QF_SCORE=$((QF_SCORE + 1))
    QF_PASSED+=("2")
else
    QF_FAILED+=("2")
fi

# Checkpoint 3: Thinking DNA exists
if grep -qiE "(thinking_dna:|thinking:|mental_models:)" "$CLONE_FILE"; then
    QF_SCORE=$((QF_SCORE + 1))
    QF_PASSED+=("3")
else
    QF_FAILED+=("3")
fi

# Checkpoint 4: Has frameworks
FW_COUNT=$(grep -ciE "framework:" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
FW_COUNT=${FW_COUNT:-0}
if [[ "$FW_COUNT" -ge 2 ]]; then
    QF_SCORE=$((QF_SCORE + 1))
    QF_PASSED+=("4")
else
    QF_FAILED+=("4")
fi

# Checkpoint 5: Has immune system
if grep -qiE "(veto:|never:|objection:|reject:)" "$CLONE_FILE"; then
    QF_SCORE=$((QF_SCORE + 1))
    QF_PASSED+=("5")
else
    QF_FAILED+=("5")
fi

QF_PCT=$((QF_SCORE * 100 / 5))

echo "  checkpoints_passed: [${QF_PASSED[*]}]"
echo "  checkpoints_failed: [${QF_FAILED[*]}]"
echo "  score: $QF_SCORE"
echo "  percentage: \"${QF_PCT}%\""

# Estimate version
if [[ $QF_PCT -ge 80 ]]; then
    QF_ESTIMATE="Premium (V3.0)"
elif [[ $QF_PCT -ge 60 ]]; then
    QF_ESTIMATE="Intermediate (V2.0)"
elif [[ $QF_PCT -ge 40 ]]; then
    QF_ESTIMATE="Basic (V1.0)"
else
    QF_ESTIMATE="Incomplete (V0.x)"
fi
echo "  estimate: \"$QF_ESTIMATE\""

echo ""

# ============================================================================
# OVERALL VERDICT
# ============================================================================
echo "overall:"
echo "  trinity_percentage: \"${TRINITY_PCT}%\""
echo "  fidelity_estimate: \"${QF_PCT}%\""

if [[ "$TRINITY_PCT" -ge 80 && "$QF_PCT" -ge 80 ]]; then
    OVERALL_VERDICT="SOLID"
elif [[ "$TRINITY_PCT" -ge 60 && "$QF_PCT" -ge 60 ]]; then
    OVERALL_VERDICT="NEEDS_WORK"
else
    OVERALL_VERDICT="REBUILD"
fi
echo "  verdict: \"$OVERALL_VERDICT\""

echo ""
echo "# Cost: $0 (zero tokens)"
echo "# Time: <1 second"
