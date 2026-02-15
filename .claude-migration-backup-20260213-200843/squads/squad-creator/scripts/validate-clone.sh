#!/bin/bash
# validate-clone.sh - Deterministic clone validation (no LLM needed for 90%)
# Usage: ./validate-clone.sh <clone-file> [--sources <dir>] [--assume-hack pass|fail] [--json]
#
# Combines: fidelity-score.sh + authenticity markers + decision tree
# Hackability test requires LLM interaction — use --assume-hack for override

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLONE_FILE=""
SOURCES_DIR=""
ASSUME_HACK=""
OUTPUT_FORMAT="yaml"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --sources)
            SOURCES_DIR="$2"
            shift 2
            ;;
        --assume-hack)
            ASSUME_HACK="$2"
            shift 2
            ;;
        --json)
            OUTPUT_FORMAT="json"
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            CLONE_FILE="$1"
            shift
            ;;
    esac
done

if [[ -z "$CLONE_FILE" ]]; then
    echo "Usage: $0 <clone-file> [--sources <dir>] [--assume-hack pass|fail] [--json]"
    echo ""
    echo "Validates clone quality using fidelity score, authenticity markers, and decision tree."
    echo ""
    echo "Options:"
    echo "  --sources <dir>     Directory with source files for source quality check"
    echo "  --assume-hack pass  Assume hackability test passed (default: skip from verdict)"
    echo "  --assume-hack fail  Assume hackability test failed"
    echo "  --json              Output JSON instead of YAML"
    exit 1
fi

if [[ ! -f "$CLONE_FILE" ]]; then
    echo "Error: File not found: $CLONE_FILE"
    exit 1
fi

CLONE_NAME=$(basename "$CLONE_FILE" | sed 's/\.[^.]*$//')
DATE=$(date -Iseconds)

# ============================================================================
# PART A: FIDELITY SCORE (via fidelity-score.sh)
# ============================================================================
FIDELITY_SCRIPT="$SCRIPT_DIR/fidelity-score.sh"

if [[ ! -f "$FIDELITY_SCRIPT" ]]; then
    echo "Error: fidelity-score.sh not found at $FIDELITY_SCRIPT"
    exit 2
fi

FIDELITY_OUTPUT=$("$FIDELITY_SCRIPT" "$CLONE_FILE" 2>/dev/null)

# Parse percentage from fidelity output
FIDELITY_PCT=$(echo "$FIDELITY_OUTPUT" | grep "percentage:" | head -1 | sed 's/.*: //' | sed 's/%//')
FIDELITY_PCT=${FIDELITY_PCT:-0}
# Strip any trailing whitespace
FIDELITY_PCT=$(echo "$FIDELITY_PCT" | tr -d ' ')

FIDELITY_CLASS=$(echo "$FIDELITY_OUTPUT" | grep "classification:" | head -1 | sed "s/.*: '//" | sed "s/'//")
FIDELITY_CLASS=${FIDELITY_CLASS:-"Unknown"}

# Parse observable and deep scores
OBS_RAW=$(echo "$FIDELITY_OUTPUT" | grep -A1 "observable:" | grep "raw:" | head -1 | sed 's/.*: //' | sed 's|/.*||')
OBS_RAW=${OBS_RAW:-0}
DEEP_RAW=$(echo "$FIDELITY_OUTPUT" | grep -A1 "deep:" | grep "raw:" | head -1 | sed 's/.*: //' | sed 's|/.*||')
DEEP_RAW=${DEEP_RAW:-0}

# ============================================================================
# PART B: AUTHENTICITY MARKERS (9 of 10 grep-able)
# ============================================================================
AUTH_SCORE=0
AUTH_RESULTS=()

# AM1: Specific vocabulary (5+ specific terms)
VOCAB_COUNT=$(grep -ciE "(always_use:|vocabulary:|specific_terms:)" "$CLONE_FILE" 2>/dev/null || echo 0)
VOCAB_ITEMS=0
if grep -qiE "(always_use:|vocabulary:)" "$CLONE_FILE"; then
    VOCAB_ITEMS=$(grep -A30 -iE "(always_use:|vocabulary:)" "$CLONE_FILE" | grep -cE "^\s+-" 2>/dev/null || echo 0)
fi
if [[ "$VOCAB_ITEMS" -ge 5 ]]; then
    AM1="PASS"
    AM1_EVIDENCE="$VOCAB_ITEMS vocabulary items found"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM1="FAIL"
    AM1_EVIDENCE="$VOCAB_ITEMS vocabulary items (need 5+)"
fi

# AM2: Sentence structure
if grep -qiE "(writing_style:|sentence_pattern:|sentence_structure:)" "$CLONE_FILE"; then
    AM2="PASS"
    AM2_EVIDENCE="Writing style/sentence pattern documented"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM2="FAIL"
    AM2_EVIDENCE="No writing style section found"
fi

# AM3: Real experiences (3+ references)
EXP_COUNT=$(grep -ciE "(experience|case study|story|real.world|client)" "$CLONE_FILE" 2>/dev/null || echo 0)
if [[ "$EXP_COUNT" -ge 3 ]]; then
    AM3="PASS"
    AM3_EVIDENCE="$EXP_COUNT experience references found"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM3="FAIL"
    AM3_EVIDENCE="$EXP_COUNT experience references (need 3+)"
fi

# AM4: Own frameworks (2+ named, not generic)
FW_COUNT=$(grep -ciE "framework.*:" "$CLONE_FILE" 2>/dev/null || echo 0)
if [[ "$FW_COUNT" -ge 2 ]]; then
    AM4="PASS"
    AM4_EVIDENCE="$FW_COUNT framework references found"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM4="FAIL"
    AM4_EVIDENCE="$FW_COUNT framework references (need 2+)"
fi

# AM5: Rejects correctly
if grep -qiE "(never:|rejects:|objection|forbidden:)" "$CLONE_FILE"; then
    AM5="PASS"
    AM5_EVIDENCE="Rejection/boundary rules documented"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM5="FAIL"
    AM5_EVIDENCE="No rejection rules found"
fi

# AM6: Contextual tone (tone varies by context)
TONE_COUNT=$(grep -ciE "(tone.*:|register:|formality:)" "$CLONE_FILE" 2>/dev/null || echo 0)
if [[ "$TONE_COUNT" -ge 2 ]]; then
    AM6="PASS"
    AM6_EVIDENCE="$TONE_COUNT tone/register references (contextual variation)"
    AUTH_SCORE=$((AUTH_SCORE + 1))
elif grep -qiE "(tone.*:" "$CLONE_FILE"; then
    AM6="FAIL"
    AM6_EVIDENCE="Tone defined but no contextual variation"
else
    AM6="FAIL"
    AM6_EVIDENCE="No tone documentation found"
fi

# AM7: Personal metaphors (3+)
META_COUNT=$(grep -ciE "(metaphor|analogy|analogies)" "$CLONE_FILE" 2>/dev/null || echo 0)
META_ITEMS=0
if grep -qiE "(metaphors:|analogies:)" "$CLONE_FILE"; then
    META_ITEMS=$(grep -A20 -iE "(metaphors:|analogies:)" "$CLONE_FILE" | grep -cE "^\s+-" 2>/dev/null || echo 0)
fi
TOTAL_META=$((META_COUNT + META_ITEMS))
if [[ "$TOTAL_META" -ge 3 ]]; then
    AM7="PASS"
    AM7_EVIDENCE="$TOTAL_META metaphor/analogy references found"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM7="FAIL"
    AM7_EVIDENCE="$TOTAL_META metaphor references (need 3+)"
fi

# AM8: Trigger responses
if grep -qiE "(trigger|objection_algorithm|objection_handling)" "$CLONE_FILE"; then
    AM8="PASS"
    AM8_EVIDENCE="Trigger/objection handling documented"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM8="FAIL"
    AM8_EVIDENCE="No trigger responses found"
fi

# AM9: Productive paradoxes
if grep -qiE "(contradiction|paradox)" "$CLONE_FILE"; then
    AM9="PASS"
    AM9_EVIDENCE="Contradictions/paradoxes documented"
    AUTH_SCORE=$((AUTH_SCORE + 1))
else
    AM9="FAIL"
    AM9_EVIDENCE="No productive paradoxes found"
fi

# AM10: Pressure resilience (REQUIRES LLM - skip or use --assume-hack)
AM10="REQUIRES_LLM"
AM10_EVIDENCE="Interactive hackability test required"

AUTH_TOTAL=9  # 9 testable markers

# ============================================================================
# PART C: HACKABILITY STATUS
# ============================================================================
if [[ "$ASSUME_HACK" == "pass" ]]; then
    HACK_STATUS="ASSUMED_PASS"
    HACK_SCORE=4
    HACK_VERDICT="ROBUST (assumed)"
elif [[ "$ASSUME_HACK" == "fail" ]]; then
    HACK_STATUS="ASSUMED_FAIL"
    HACK_SCORE=0
    HACK_VERDICT="VULNERABLE (assumed)"
else
    HACK_STATUS="SKIPPED"
    HACK_SCORE=-1
    HACK_VERDICT="REQUIRES_LLM_TEST"
fi

# ============================================================================
# PART D: DECISION TREE
# ============================================================================
# Convert fidelity to integer for comparison
FIDELITY_INT=$(echo "$FIDELITY_PCT" | cut -d. -f1)
FIDELITY_INT=${FIDELITY_INT:-0}

if [[ "$HACK_SCORE" -ge 0 && "$HACK_SCORE" -lt 3 ]]; then
    VERDICT="FAIL"
    REASON="Clone is vulnerable (hackability < 3/4)"
elif [[ "$FIDELITY_INT" -lt 60 ]]; then
    VERDICT="FAIL"
    REASON="Fidelity below minimum threshold (< 60%)"
elif [[ "$AUTH_SCORE" -lt 6 ]]; then
    VERDICT="REVIEW"
    REASON="Authenticity gaps need attention ($AUTH_SCORE/$AUTH_TOTAL < 6)"
elif [[ "$FIDELITY_INT" -lt 75 ]]; then
    VERDICT="REVIEW"
    REASON="Fidelity at basic level ($FIDELITY_INT% < 75%), needs improvement"
elif [[ "$FIDELITY_INT" -ge 85 ]]; then
    VERDICT="PASS_PREMIUM"
    REASON="Fidelity $FIDELITY_INT% + authenticity $AUTH_SCORE/$AUTH_TOTAL = premium clone"
else
    VERDICT="PASS"
    REASON="Fidelity $FIDELITY_INT% >= 75% and authenticity $AUTH_SCORE/$AUTH_TOTAL >= 6"
fi

# ============================================================================
# OUTPUT
# ============================================================================
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    cat <<ENDJSON
{
  "validation_report": {
    "clone": "$CLONE_NAME",
    "clone_file": "$CLONE_FILE",
    "date": "$DATE",
    "fidelity": {
      "percentage": "$FIDELITY_PCT%",
      "observable_raw": "$OBS_RAW/20",
      "deep_raw": "$DEEP_RAW/20",
      "classification": "$FIDELITY_CLASS"
    },
    "authenticity": {
      "score": "$AUTH_SCORE/$AUTH_TOTAL",
      "markers": [
        {"id": 1, "name": "Specific vocabulary", "status": "$AM1", "evidence": "$AM1_EVIDENCE"},
        {"id": 2, "name": "Sentence structure", "status": "$AM2", "evidence": "$AM2_EVIDENCE"},
        {"id": 3, "name": "Real experiences", "status": "$AM3", "evidence": "$AM3_EVIDENCE"},
        {"id": 4, "name": "Own frameworks", "status": "$AM4", "evidence": "$AM4_EVIDENCE"},
        {"id": 5, "name": "Rejects correctly", "status": "$AM5", "evidence": "$AM5_EVIDENCE"},
        {"id": 6, "name": "Contextual tone", "status": "$AM6", "evidence": "$AM6_EVIDENCE"},
        {"id": 7, "name": "Personal metaphors", "status": "$AM7", "evidence": "$AM7_EVIDENCE"},
        {"id": 8, "name": "Trigger responses", "status": "$AM8", "evidence": "$AM8_EVIDENCE"},
        {"id": 9, "name": "Productive paradoxes", "status": "$AM9", "evidence": "$AM9_EVIDENCE"},
        {"id": 10, "name": "Pressure resilience", "status": "$AM10", "evidence": "$AM10_EVIDENCE"}
      ]
    },
    "hackability": {
      "status": "$HACK_STATUS",
      "score": $HACK_SCORE,
      "verdict": "$HACK_VERDICT"
    },
    "verdict": {
      "decision": "$VERDICT",
      "reason": "$REASON",
      "fidelity_pct": "$FIDELITY_INT",
      "authenticity_score": $AUTH_SCORE,
      "hackability_score": $HACK_SCORE
    }
  }
}
ENDJSON
else
    # YAML output
    echo "# Clone Validation Report"
    echo "# Generated: $DATE"
    echo "# File: $CLONE_FILE"
    echo ""
    echo "validation_report:"
    echo "  clone: \"$CLONE_NAME\""
    echo "  clone_file: \"$CLONE_FILE\""
    echo "  date: \"$DATE\""
    echo ""
    echo "  fidelity:"
    echo "    percentage: \"${FIDELITY_PCT}%\""
    echo "    observable_raw: \"$OBS_RAW/20\""
    echo "    deep_raw: \"$DEEP_RAW/20\""
    echo "    classification: \"$FIDELITY_CLASS\""
    echo ""
    echo "  authenticity:"
    echo "    score: \"$AUTH_SCORE/$AUTH_TOTAL\""
    echo "    markers:"
    echo "      - { id: 1, name: 'Specific vocabulary', status: '$AM1', evidence: '$AM1_EVIDENCE' }"
    echo "      - { id: 2, name: 'Sentence structure', status: '$AM2', evidence: '$AM2_EVIDENCE' }"
    echo "      - { id: 3, name: 'Real experiences', status: '$AM3', evidence: '$AM3_EVIDENCE' }"
    echo "      - { id: 4, name: 'Own frameworks', status: '$AM4', evidence: '$AM4_EVIDENCE' }"
    echo "      - { id: 5, name: 'Rejects correctly', status: '$AM5', evidence: '$AM5_EVIDENCE' }"
    echo "      - { id: 6, name: 'Contextual tone', status: '$AM6', evidence: '$AM6_EVIDENCE' }"
    echo "      - { id: 7, name: 'Personal metaphors', status: '$AM7', evidence: '$AM7_EVIDENCE' }"
    echo "      - { id: 8, name: 'Trigger responses', status: '$AM8', evidence: '$AM8_EVIDENCE' }"
    echo "      - { id: 9, name: 'Productive paradoxes', status: '$AM9', evidence: '$AM9_EVIDENCE' }"
    echo "      - { id: 10, name: 'Pressure resilience', status: '$AM10', evidence: '$AM10_EVIDENCE' }"
    echo ""
    echo "  hackability:"
    echo "    status: \"$HACK_STATUS\""
    echo "    score: $HACK_SCORE"
    echo "    verdict: \"$HACK_VERDICT\""
    echo ""
    echo "  verdict:"
    echo "    decision: \"$VERDICT\""
    echo "    reason: \"$REASON\""
    echo "    scores_summary:"
    echo "      fidelity: \"${FIDELITY_INT}%\""
    echo "      authenticity: \"$AUTH_SCORE/$AUTH_TOTAL\""
    echo "      hackability: \"$HACK_STATUS\""
    echo ""
    echo "# Cost: \$0 (zero tokens)"
    echo "# Time: <2 seconds"
fi
