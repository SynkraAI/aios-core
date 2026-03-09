#!/bin/bash
# fidelity-score.sh - Deterministic fidelity scoring (no LLM needed)
# Usage: ./fidelity-score.sh <clone-file>
#
# Replaces 95% of an-fidelity-score task with pure bash/grep

set -e

CLONE_FILE="$1"

if [[ -z "$CLONE_FILE" ]]; then
    echo "Usage: $0 <clone-file.md>"
    exit 1
fi

if [[ ! -f "$CLONE_FILE" ]]; then
    echo "Error: File not found: $CLONE_FILE"
    exit 1
fi

echo "# Fidelity Score Report"
echo "# Generated: $(date -Iseconds)"
echo "# File: $CLONE_FILE"
echo ""

# ============================================================================
# LAYER 1: Behavioral Patterns (Observable, weight 0.8)
# ============================================================================
L1_SCORE=0

# Checkpoint 1: Greeting ritual
if grep -qiE "(greeting|activation-instructions|step 1)" "$CLONE_FILE"; then
    L1_SCORE=$((L1_SCORE + 1))
    L1_C1="PASS"
else
    L1_C1="FAIL"
fi

# Checkpoint 2: Response structure
if grep -qiE "(response_format|response_structure|output_format)" "$CLONE_FILE"; then
    L1_SCORE=$((L1_SCORE + 1))
    L1_C2="PASS"
else
    L1_C2="FAIL"
fi

# Checkpoint 3: Modes/states
if grep -qiE "(modes:|states:|behavioral_states)" "$CLONE_FILE"; then
    L1_SCORE=$((L1_SCORE + 1))
    L1_C3="PASS"
else
    L1_C3="FAIL"
fi

# Checkpoint 4: Trigger responses
if grep -qiE "(triggers:|objection_handling|objection_algorithms)" "$CLONE_FILE"; then
    L1_SCORE=$((L1_SCORE + 1))
    L1_C4="PASS"
else
    L1_C4="FAIL"
fi

# Checkpoint 5: Anti-patterns
if grep -qiE "(never:|dont:|anti_patterns|avoid:)" "$CLONE_FILE"; then
    L1_SCORE=$((L1_SCORE + 1))
    L1_C5="PASS"
else
    L1_C5="FAIL"
fi

echo "layer_1_behavioral_patterns:"
echo "  score: $L1_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Greeting ritual', result: '$L1_C1' }"
echo "    - { id: 2, name: 'Response structure', result: '$L1_C2' }"
echo "    - { id: 3, name: 'Modes/states', result: '$L1_C3' }"
echo "    - { id: 4, name: 'Trigger responses', result: '$L1_C4' }"
echo "    - { id: 5, name: 'Anti-patterns', result: '$L1_C5' }"
echo ""

# ============================================================================
# LAYER 2: Communication Style (Observable, weight 0.8)
# ============================================================================
L2_SCORE=0

# Checkpoint 1: Signature phrases
if grep -qiE "signature_phrases:" "$CLONE_FILE"; then
    COUNT=$(grep -A50 "signature_phrases:" "$CLONE_FILE" | grep -cE "^\s+-" || echo 0)
    if [[ "$COUNT" -ge 3 ]]; then
        L2_SCORE=$((L2_SCORE + 1))
        L2_C1="PASS ($COUNT phrases)"
    else
        L2_C1="FAIL ($COUNT < 3)"
    fi
else
    L2_C1="FAIL (section missing)"
fi

# Checkpoint 2: Vocabulary always
if grep -qiE "(always_use:|vocabulary:)" "$CLONE_FILE"; then
    L2_SCORE=$((L2_SCORE + 1))
    L2_C2="PASS"
else
    L2_C2="FAIL"
fi

# Checkpoint 3: Vocabulary never
if grep -qiE "(never_use:|forbidden:)" "$CLONE_FILE"; then
    L2_SCORE=$((L2_SCORE + 1))
    L2_C3="PASS"
else
    L2_C3="FAIL"
fi

# Checkpoint 4: Writing style
if grep -qiE "(writing_style:|tone:|sentence_)" "$CLONE_FILE"; then
    L2_SCORE=$((L2_SCORE + 1))
    L2_C4="PASS"
else
    L2_C4="FAIL"
fi

# Checkpoint 5: Metaphors
if grep -qiE "(metaphors:|analogies:)" "$CLONE_FILE"; then
    L2_SCORE=$((L2_SCORE + 1))
    L2_C5="PASS"
else
    L2_C5="FAIL"
fi

echo "layer_2_communication_style:"
echo "  score: $L2_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Signature phrases', result: '$L2_C1' }"
echo "    - { id: 2, name: 'Vocabulary always', result: '$L2_C2' }"
echo "    - { id: 3, name: 'Vocabulary never', result: '$L2_C3' }"
echo "    - { id: 4, name: 'Writing style', result: '$L2_C4' }"
echo "    - { id: 5, name: 'Metaphors', result: '$L2_C5' }"
echo ""

# ============================================================================
# LAYER 3: Routines & Habits (Observable, weight 0.8)
# ============================================================================
L3_SCORE=0

# Checkpoint 1: Opening ritual
if grep -qiE "(greeting:|step 1|activation)" "$CLONE_FILE"; then
    L3_SCORE=$((L3_SCORE + 1))
    L3_C1="PASS"
else
    L3_C1="FAIL"
fi

# Checkpoint 2: Workflow steps
if grep -qiE "(steps:|workflow:|### step)" "$CLONE_FILE"; then
    L3_SCORE=$((L3_SCORE + 1))
    L3_C2="PASS"
else
    L3_C2="FAIL"
fi

# Checkpoint 3: Checkpoints
if grep -qiE "(checkpoint:|verify:|validation_gates)" "$CLONE_FILE"; then
    L3_SCORE=$((L3_SCORE + 1))
    L3_C3="PASS"
else
    L3_C3="FAIL"
fi

# Checkpoint 4: Closing ritual
if grep -qiE "(closing:|sign_off:|handoff)" "$CLONE_FILE"; then
    L3_SCORE=$((L3_SCORE + 1))
    L3_C4="PASS"
else
    L3_C4="FAIL"
fi

# Checkpoint 5: Error handling
if grep -qiE "(on_error:|fallback:|error_handling)" "$CLONE_FILE"; then
    L3_SCORE=$((L3_SCORE + 1))
    L3_C5="PASS"
else
    L3_C5="FAIL"
fi

echo "layer_3_routines_habits:"
echo "  score: $L3_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Opening ritual', result: '$L3_C1' }"
echo "    - { id: 2, name: 'Workflow steps', result: '$L3_C2' }"
echo "    - { id: 3, name: 'Checkpoints', result: '$L3_C3' }"
echo "    - { id: 4, name: 'Closing ritual', result: '$L3_C4' }"
echo "    - { id: 5, name: 'Error handling', result: '$L3_C5' }"
echo ""

# ============================================================================
# LAYER 4: Recognition Patterns (Observable, weight 0.8)
# ============================================================================
L4_SCORE=0

# Checkpoint 1: Red flags
if grep -qiE "(red_flags:|veto_conditions:|avoid:)" "$CLONE_FILE"; then
    L4_SCORE=$((L4_SCORE + 1))
    L4_C1="PASS"
else
    L4_C1="FAIL"
fi

# Checkpoint 2: Green flags
if grep -qiE "(green_flags:|signals:|indicators:)" "$CLONE_FILE"; then
    L4_SCORE=$((L4_SCORE + 1))
    L4_C2="PASS"
else
    L4_C2="FAIL"
fi

# Checkpoint 3: Decision rules
if grep -qiE "(decision_rules:|heuristics:|rules:)" "$CLONE_FILE"; then
    L4_SCORE=$((L4_SCORE + 1))
    L4_C3="PASS"
else
    L4_C3="FAIL"
fi

# Checkpoint 4: Pattern IDs (XX_YY_NNN format)
if grep -qE "[A-Z]{2,}_[A-Z]{2,}_[0-9]{3}" "$CLONE_FILE"; then
    L4_SCORE=$((L4_SCORE + 1))
    L4_C4="PASS"
else
    L4_C4="FAIL"
fi

# Checkpoint 5: Thresholds
if grep -qiE "(threshold:|minimum:|maximum:|\b[0-9]+%)" "$CLONE_FILE"; then
    L4_SCORE=$((L4_SCORE + 1))
    L4_C5="PASS"
else
    L4_C5="FAIL"
fi

echo "layer_4_recognition_patterns:"
echo "  score: $L4_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Red flags', result: '$L4_C1' }"
echo "    - { id: 2, name: 'Green flags', result: '$L4_C2' }"
echo "    - { id: 3, name: 'Decision rules', result: '$L4_C3' }"
echo "    - { id: 4, name: 'Pattern IDs', result: '$L4_C4' }"
echo "    - { id: 5, name: 'Thresholds', result: '$L4_C5' }"
echo ""

# ============================================================================
# LAYER 5: Mental Models (Deep, weight 1.0)
# ============================================================================
L5_SCORE=0

# Checkpoint 1: Primary framework
if grep -qiE "(primary_framework:|thinking_dna:)" "$CLONE_FILE"; then
    L5_SCORE=$((L5_SCORE + 1))
    L5_C1="PASS"
else
    L5_C1="FAIL"
fi

# Checkpoint 2: Decision architecture
if grep -qiE "(decision_architecture:|pipeline:|decision_)" "$CLONE_FILE"; then
    L5_SCORE=$((L5_SCORE + 1))
    L5_C2="PASS"
else
    L5_C2="FAIL"
fi

# Checkpoint 3: Named frameworks (3+)
FRAMEWORKS=$(grep -ciE "framework:" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
FRAMEWORKS=${FRAMEWORKS:-0}
if [[ "$FRAMEWORKS" -ge 3 ]]; then
    L5_SCORE=$((L5_SCORE + 1))
    L5_C3="PASS ($FRAMEWORKS frameworks)"
else
    L5_C3="FAIL ($FRAMEWORKS < 3)"
fi

# Checkpoint 4: Framework steps
if grep -qiE "(steps:|step_1|step 1)" "$CLONE_FILE"; then
    L5_SCORE=$((L5_SCORE + 1))
    L5_C4="PASS"
else
    L5_C4="FAIL"
fi

# Checkpoint 5: Anti-patterns in thinking
if grep -qiE "(anti_patterns:|thinking.*avoid|cognitive.*bias)" "$CLONE_FILE"; then
    L5_SCORE=$((L5_SCORE + 1))
    L5_C5="PASS"
else
    L5_C5="FAIL"
fi

echo "layer_5_mental_models:"
echo "  score: $L5_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Primary framework', result: '$L5_C1' }"
echo "    - { id: 2, name: 'Decision architecture', result: '$L5_C2' }"
echo "    - { id: 3, name: 'Named frameworks', result: '$L5_C3' }"
echo "    - { id: 4, name: 'Framework steps', result: '$L5_C4' }"
echo "    - { id: 5, name: 'Anti-patterns', result: '$L5_C5' }"
echo ""

# ============================================================================
# LAYER 6: Values Hierarchy (Deep, weight 1.0)
# ============================================================================
L6_SCORE=0

# Checkpoint 1: Core beliefs
if grep -qiE "(core_beliefs:|beliefs:|principles:)" "$CLONE_FILE"; then
    L6_SCORE=$((L6_SCORE + 1))
    L6_C1="PASS"
else
    L6_C1="FAIL"
fi

# Checkpoint 2: What defends
if grep -qiE "(defends:|advocates:|supports:)" "$CLONE_FILE"; then
    L6_SCORE=$((L6_SCORE + 1))
    L6_C2="PASS"
else
    L6_C2="FAIL"
fi

# Checkpoint 3: What rejects
if grep -qiE "(rejects:|never:|opposes:)" "$CLONE_FILE"; then
    L6_SCORE=$((L6_SCORE + 1))
    L6_C3="PASS"
else
    L6_C3="FAIL"
fi

# Checkpoint 4: Trade-offs
if grep -qiE "(trade_off|tradeoff|priorit)" "$CLONE_FILE"; then
    L6_SCORE=$((L6_SCORE + 1))
    L6_C4="PASS"
else
    L6_C4="FAIL"
fi

# Checkpoint 5: Non-negotiables
if grep -qiE "(non_negotiable|absolute|must_have)" "$CLONE_FILE"; then
    L6_SCORE=$((L6_SCORE + 1))
    L6_C5="PASS"
else
    L6_C5="FAIL"
fi

echo "layer_6_values_hierarchy:"
echo "  score: $L6_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Core beliefs', result: '$L6_C1' }"
echo "    - { id: 2, name: 'What defends', result: '$L6_C2' }"
echo "    - { id: 3, name: 'What rejects', result: '$L6_C3' }"
echo "    - { id: 4, name: 'Trade-offs', result: '$L6_C4' }"
echo "    - { id: 5, name: 'Non-negotiables', result: '$L6_C5' }"
echo ""

# ============================================================================
# LAYER 7: Core Obsessions (Deep, weight 1.0)
# ============================================================================
L7_SCORE=0

# Checkpoint 1: Recurring themes (word appears 3+ times)
# This is simplified - a real implementation would be more sophisticated
if grep -qiE "(obsession|focus|mission)" "$CLONE_FILE"; then
    L7_SCORE=$((L7_SCORE + 1))
    L7_C1="PASS"
else
    L7_C1="FAIL"
fi

# Checkpoint 2: Named obsessions
if grep -qiE "(obsessions:|focus_areas:|priorities:)" "$CLONE_FILE"; then
    L7_SCORE=$((L7_SCORE + 1))
    L7_C2="PASS"
else
    L7_C2="FAIL"
fi

# Checkpoint 3: Hills to die on
if grep -qiE "(hills_to_die|battles:|fights:)" "$CLONE_FILE"; then
    L7_SCORE=$((L7_SCORE + 1))
    L7_C3="PASS"
else
    L7_C3="FAIL"
fi

# Checkpoint 4: Mission statement
if grep -qiE "(mission:|purpose:|raison)" "$CLONE_FILE"; then
    L7_SCORE=$((L7_SCORE + 1))
    L7_C4="PASS"
else
    L7_C4="FAIL"
fi

# Checkpoint 5: Legacy thinking
if grep -qiE "(legacy|impact|long.term)" "$CLONE_FILE"; then
    L7_SCORE=$((L7_SCORE + 1))
    L7_C5="PASS"
else
    L7_C5="FAIL"
fi

echo "layer_7_core_obsessions:"
echo "  score: $L7_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Recurring themes', result: '$L7_C1' }"
echo "    - { id: 2, name: 'Named obsessions', result: '$L7_C2' }"
echo "    - { id: 3, name: 'Hills to die on', result: '$L7_C3' }"
echo "    - { id: 4, name: 'Mission statement', result: '$L7_C4' }"
echo "    - { id: 5, name: 'Legacy thinking', result: '$L7_C5' }"
echo ""

# ============================================================================
# LAYER 8: Productive Paradoxes (Deep, weight 1.0)
# ============================================================================
L8_SCORE=0

# Checkpoint 1: Contradictions section
if grep -qiE "(contradictions:|paradoxes:)" "$CLONE_FILE"; then
    L8_SCORE=$((L8_SCORE + 1))
    L8_C1="PASS"
else
    L8_C1="FAIL"
fi

# Checkpoint 2: Named paradoxes (2+)
PARADOXES=$(grep -ciE "(paradox|contradiction)" "$CLONE_FILE" 2>/dev/null | head -1 || echo 0)
PARADOXES=${PARADOXES:-0}
if [[ "$PARADOXES" -ge 2 ]]; then
    L8_SCORE=$((L8_SCORE + 1))
    L8_C2="PASS ($PARADOXES found)"
else
    L8_C2="FAIL ($PARADOXES < 2)"
fi

# Checkpoint 3: Feature not bug
if grep -qiE "(feature.not.bug|intentional|by.design)" "$CLONE_FILE"; then
    L8_SCORE=$((L8_SCORE + 1))
    L8_C3="PASS"
else
    L8_C3="FAIL"
fi

# Checkpoint 4: Context-dependent
if grep -qiE "(context|situational|depends.on)" "$CLONE_FILE"; then
    L8_SCORE=$((L8_SCORE + 1))
    L8_C4="PASS"
else
    L8_C4="FAIL"
fi

# Checkpoint 5: Integration note
if grep -qiE "(integration|reconcil|balance)" "$CLONE_FILE"; then
    L8_SCORE=$((L8_SCORE + 1))
    L8_C5="PASS"
else
    L8_C5="FAIL"
fi

echo "layer_8_productive_paradoxes:"
echo "  score: $L8_SCORE"
echo "  checkpoints:"
echo "    - { id: 1, name: 'Contradictions section', result: '$L8_C1' }"
echo "    - { id: 2, name: 'Named paradoxes', result: '$L8_C2' }"
echo "    - { id: 3, name: 'Feature not bug', result: '$L8_C3' }"
echo "    - { id: 4, name: 'Context-dependent', result: '$L8_C4' }"
echo "    - { id: 5, name: 'Integration note', result: '$L8_C5' }"
echo ""

# ============================================================================
# FINAL CALCULATION
# ============================================================================

OBSERVABLE_RAW=$((L1_SCORE + L2_SCORE + L3_SCORE + L4_SCORE))
DEEP_RAW=$((L5_SCORE + L6_SCORE + L7_SCORE + L8_SCORE))

# Using bc for floating point
OBSERVABLE_WEIGHTED=$(echo "scale=2; $OBSERVABLE_RAW * 0.8" | bc)
DEEP_WEIGHTED=$(echo "scale=2; $DEEP_RAW * 1.0" | bc)
TOTAL_WEIGHTED=$(echo "scale=2; $OBSERVABLE_WEIGHTED + $DEEP_WEIGHTED" | bc)
PERCENTAGE=$(echo "scale=2; ($TOTAL_WEIGHTED / 36) * 100" | bc)

# Classification
if (( $(echo "$PERCENTAGE < 60" | bc -l) )); then
    CLASSIFICATION="Incomplete (V0.x)"
elif (( $(echo "$PERCENTAGE < 75" | bc -l) )); then
    CLASSIFICATION="Basic (V1.0)"
elif (( $(echo "$PERCENTAGE < 85" | bc -l) )); then
    CLASSIFICATION="Intermediate (V2.0)"
elif (( $(echo "$PERCENTAGE < 93" | bc -l) )); then
    CLASSIFICATION="Premium (V3.0)"
else
    CLASSIFICATION="Elite (V3.5+)"
fi

echo "# ============================================"
echo "# FINAL SCORE"
echo "# ============================================"
echo ""
echo "summary:"
echo "  observable:"
echo "    raw: $OBSERVABLE_RAW/20"
echo "    weighted: $OBSERVABLE_WEIGHTED/16"
echo "  deep:"
echo "    raw: $DEEP_RAW/20"
echo "    weighted: $DEEP_WEIGHTED/20"
echo "  total:"
echo "    weighted: $TOTAL_WEIGHTED/36"
echo "    percentage: ${PERCENTAGE}%"
echo "    classification: '$CLASSIFICATION'"
echo ""
echo "# Cost: $0 (zero tokens)"
echo "# Time: <1 second"
