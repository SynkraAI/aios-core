#!/bin/bash
# ============================================================================
# EXTRACTION BENCHMARK RUNNER v1.0
# Roda test suite contra golden benchmark. Zero humano no loop.
#
# Usage: bash run-benchmark.sh <expert> <extraction-output-file>
# Example: bash run-benchmark.sh hormozi /path/to/extraction-output.yaml
#
# Requires: yq (YAML parser) - brew install yq
# ============================================================================

set -uo pipefail
# Note: not using -e because grep returns exit 1 on no match

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Args
EXPERT="${1:-}"
OUTPUT_FILE="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BENCHMARK_DIR="$(dirname "$SCRIPT_DIR")"
GOLDEN_DIR="$BENCHMARK_DIR/golden"
RUNS_DIR="$BENCHMARK_DIR/runs"

# Validate
if [[ -z "$EXPERT" || -z "$OUTPUT_FILE" ]]; then
    echo "Usage: bash run-benchmark.sh <expert> <extraction-output-file>"
    echo "Example: bash run-benchmark.sh hormozi /tmp/hormozi-extraction.yaml"
    exit 1
fi

GOLDEN_FILE="$GOLDEN_DIR/${EXPERT}-golden.yaml"
if [[ ! -f "$GOLDEN_FILE" ]]; then
    echo -e "${RED}ERROR: Golden benchmark not found: $GOLDEN_FILE${NC}"
    exit 1
fi

if [[ ! -f "$OUTPUT_FILE" ]]; then
    echo -e "${RED}ERROR: Extraction output not found: $OUTPUT_FILE${NC}"
    exit 1
fi

# Output
RUN_DATE=$(date +%Y-%m-%d_%H%M%S)
RUN_FILE="$RUNS_DIR/${EXPERT}-${RUN_DATE}.txt"
mkdir -p "$RUNS_DIR"

echo -e "${BOLD}============================================================================${NC}"
echo -e "${BOLD}  EXTRACTION BENCHMARK: ${EXPERT}${NC}"
echo -e "${BOLD}  Date: ${RUN_DATE}${NC}"
echo -e "${BOLD}  Golden: ${GOLDEN_FILE}${NC}"
echo -e "${BOLD}  Output: ${OUTPUT_FILE}${NC}"
echo -e "${BOLD}============================================================================${NC}"
echo ""

# Create preprocessed lowercase temp file
# Strip meta-documentation sections (never_use, transforms) so we only test
# ACTUAL content, not "here are words we don't use" documentation
OUTPUT_PROCESSED="/tmp/benchmark-processed-$$"
cat "$OUTPUT_FILE" | \
    sed '/^  *never_use:/,/^  *[a-z_]*:$/{ /violation:/d; /word:/d; }' | \
    tr '[:upper:]' '[:lower:]' > "$OUTPUT_PROCESSED"
trap "rm -f $OUTPUT_PROCESSED" EXIT

# ============================================================================
# TEST 1: FRAMEWORKS (keyword matching)
# ============================================================================
echo -e "${BLUE}--- TEST 1: FRAMEWORKS ---${NC}"

FW_TOTAL=0
FW_FOUND=0
FW_CORE_TOTAL=0
FW_CORE_FOUND=0

# Parse frameworks from golden
FW_COUNT=$(yq '.expected_frameworks | length' "$GOLDEN_FILE")

for ((i=0; i<FW_COUNT; i++)); do
    FW_NAME=$(yq ".expected_frameworks[$i].name" "$GOLDEN_FILE")
    FW_CRIT=$(yq ".expected_frameworks[$i].criticality" "$GOLDEN_FILE")
    FW_TOTAL=$((FW_TOTAL + 1))

    # Check required keywords
    REQ_COUNT=$(yq ".expected_frameworks[$i].keywords_required | length" "$GOLDEN_FILE")
    REQ_FOUND=0
    for ((j=0; j<REQ_COUNT; j++)); do
        KW=$(yq ".expected_frameworks[$i].keywords_required[$j]" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
        if grep -qi "$KW" "$OUTPUT_PROCESSED" 2>/dev/null; then
            REQ_FOUND=$((REQ_FOUND + 1))
        fi
    done

    # Check any-of keywords (bonus)
    ANY_COUNT=$(yq ".expected_frameworks[$i].keywords_any_of | length" "$GOLDEN_FILE" 2>/dev/null || echo 0)
    ANY_FOUND=0
    if [[ "$ANY_COUNT" -gt 0 ]]; then
        for ((j=0; j<ANY_COUNT; j++)); do
            KW=$(yq ".expected_frameworks[$i].keywords_any_of[$j]" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
            if grep -qi "$KW" "$OUTPUT_PROCESSED" 2>/dev/null; then
                ANY_FOUND=$((ANY_FOUND + 1))
                break  # One is enough
            fi
        done
    fi

    # Framework matches if ALL required + at least 1 any_of
    if [[ "$REQ_FOUND" -eq "$REQ_COUNT" && ("$ANY_COUNT" -eq 0 || "$ANY_FOUND" -gt 0) ]]; then
        echo -e "  ${GREEN}MATCH${NC} [$FW_CRIT] $FW_NAME (${REQ_FOUND}/${REQ_COUNT} required)"
        FW_FOUND=$((FW_FOUND + 1))
        if [[ "$FW_CRIT" == "CORE" ]]; then
            FW_CORE_FOUND=$((FW_CORE_FOUND + 1))
        fi
    else
        echo -e "  ${RED}MISS${NC}  [$FW_CRIT] $FW_NAME (${REQ_FOUND}/${REQ_COUNT} required)"
    fi

    if [[ "$FW_CRIT" == "CORE" ]]; then
        FW_CORE_TOTAL=$((FW_CORE_TOTAL + 1))
    fi
done

FW_SCORE=$((FW_FOUND * 100 / FW_TOTAL))
echo -e "\n  Frameworks: ${BOLD}${FW_FOUND}/${FW_TOTAL}${NC} (${FW_SCORE}%) | Core: ${FW_CORE_FOUND}/${FW_CORE_TOTAL}"
echo ""

# ============================================================================
# TEST 2: INVERSIONS (dual keyword matching)
# ============================================================================
echo -e "${BLUE}--- TEST 2: INVERSIONS ---${NC}"

INV_TOTAL=0
INV_FOUND=0

INV_COUNT=$(yq '.expected_inversions | length' "$GOLDEN_FILE")

for ((i=0; i<INV_COUNT; i++)); do
    INV_CONV=$(yq ".expected_inversions[$i].conventional" "$GOLDEN_FILE")
    INV_EXPERT=$(yq ".expected_inversions[$i].expert_position" "$GOLDEN_FILE")
    INV_CRIT=$(yq ".expected_inversions[$i].criticality" "$GOLDEN_FILE")
    INV_TOTAL=$((INV_TOTAL + 1))

    # Check expert-side keywords (the position the expert takes)
    EXP_KW_COUNT=$(yq ".expected_inversions[$i].keywords_expert | length" "$GOLDEN_FILE")
    EXP_FOUND=0
    for ((j=0; j<EXP_KW_COUNT; j++)); do
        KW=$(yq ".expected_inversions[$i].keywords_expert[$j]" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
        if grep -qi "$KW" "$OUTPUT_PROCESSED" 2>/dev/null; then
            EXP_FOUND=$((EXP_FOUND + 1))
            break
        fi
    done

    if [[ "$EXP_FOUND" -gt 0 ]]; then
        echo -e "  ${GREEN}MATCH${NC} [$INV_CRIT] ${INV_EXPERT:0:60}..."
        INV_FOUND=$((INV_FOUND + 1))
    else
        echo -e "  ${RED}MISS${NC}  [$INV_CRIT] ${INV_EXPERT:0:60}..."
    fi
done

INV_SCORE=$((INV_FOUND * 100 / INV_TOTAL))
echo -e "\n  Inversions: ${BOLD}${INV_FOUND}/${INV_TOTAL}${NC} (${INV_SCORE}%)"
echo ""

# ============================================================================
# TEST 3: SIGNATURE PHRASES (grep literal)
# ============================================================================
echo -e "${BLUE}--- TEST 3: SIGNATURE PHRASES ---${NC}"

PH_TOTAL=0
PH_FOUND=0
PH_CORE_TOTAL=0
PH_CORE_FOUND=0

PH_COUNT=$(yq '.expected_phrases | length' "$GOLDEN_FILE")

for ((i=0; i<PH_COUNT; i++)); do
    PHRASE=$(yq ".expected_phrases[$i].phrase" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
    PH_CRIT=$(yq ".expected_phrases[$i].criticality" "$GOLDEN_FILE")
    PH_TOTAL=$((PH_TOTAL + 1))

    FOUND=0
    if grep -qi "$PHRASE" "$OUTPUT_PROCESSED" 2>/dev/null; then
        FOUND=1
    else
        # Check alternatives
        ALT_COUNT=$(yq ".expected_phrases[$i].alternatives | length" "$GOLDEN_FILE" 2>/dev/null || echo 0)
        for ((j=0; j<ALT_COUNT; j++)); do
            ALT=$(yq ".expected_phrases[$i].alternatives[$j]" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
            if grep -qi "$ALT" "$OUTPUT_PROCESSED" 2>/dev/null; then
                FOUND=1
                break
            fi
        done
    fi

    if [[ "$FOUND" -eq 1 ]]; then
        echo -e "  ${GREEN}MATCH${NC} [$PH_CRIT] \"$PHRASE\""
        PH_FOUND=$((PH_FOUND + 1))
        [[ "$PH_CRIT" == "CORE" ]] && PH_CORE_FOUND=$((PH_CORE_FOUND + 1))
    else
        echo -e "  ${RED}MISS${NC}  [$PH_CRIT] \"$PHRASE\""
    fi
    [[ "$PH_CRIT" == "CORE" ]] && PH_CORE_TOTAL=$((PH_CORE_TOTAL + 1))
done

PH_SCORE=$((PH_FOUND * 100 / PH_TOTAL))
echo -e "\n  Phrases: ${BOLD}${PH_FOUND}/${PH_TOTAL}${NC} (${PH_SCORE}%) | Core: ${PH_CORE_FOUND}/${PH_CORE_TOTAL}"
echo ""

# ============================================================================
# TEST 4: VOICE DNA - NEVER USE WORDS
# ============================================================================
echo -e "${BLUE}--- TEST 4: VOICE DNA (Never Use) ---${NC}"

NEVER_TOTAL=0
NEVER_VIOLATIONS=0

NEVER_COUNT=$(yq '.expected_voice_markers.never_use_words | length' "$GOLDEN_FILE")

for ((i=0; i<NEVER_COUNT; i++)); do
    WORD=$(yq ".expected_voice_markers.never_use_words[$i]" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
    NEVER_TOTAL=$((NEVER_TOTAL + 1))

    OCCURRENCES=$(grep -oi "$WORD" "$OUTPUT_PROCESSED" 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$OCCURRENCES" -gt 0 ]]; then
        echo -e "  ${RED}VIOLATION${NC} \"$WORD\" found ${OCCURRENCES}x"
        NEVER_VIOLATIONS=$((NEVER_VIOLATIONS + 1))
    else
        echo -e "  ${GREEN}CLEAN${NC}    \"$WORD\" (0 occurrences)"
    fi
done

VOICE_CLEAN=$((NEVER_TOTAL - NEVER_VIOLATIONS))
VOICE_SCORE=$((VOICE_CLEAN * 100 / NEVER_TOTAL))
echo -e "\n  Voice Clean: ${BOLD}${VOICE_CLEAN}/${NEVER_TOTAL}${NC} (${VOICE_SCORE}%) | Violations: ${NEVER_VIOLATIONS}"
echo ""

# ============================================================================
# TEST 5: FALSE POSITIVES
# ============================================================================
echo -e "${BLUE}--- TEST 5: FALSE POSITIVE TRAPS ---${NC}"

FP_TOTAL=0
FP_VIOLATIONS=0

FP_COUNT=$(yq '.false_positive_traps | length' "$GOLDEN_FILE")

for ((i=0; i<FP_COUNT; i++)); do
    TRAP=$(yq ".false_positive_traps[$i].trap" "$GOLDEN_FILE")
    FP_TOTAL=$((FP_TOTAL + 1))

    ALERT_FOUND=0
    ALERT_COUNT=$(yq ".false_positive_traps[$i].grep_alert | length" "$GOLDEN_FILE")
    for ((j=0; j<ALERT_COUNT; j++)); do
        ALERT=$(yq ".false_positive_traps[$i].grep_alert[$j]" "$GOLDEN_FILE" | tr '[:upper:]' '[:lower:]')
        if grep -qiE "$ALERT" "$OUTPUT_PROCESSED" 2>/dev/null; then
            ALERT_FOUND=1
            break
        fi
    done

    if [[ "$ALERT_FOUND" -eq 1 ]]; then
        echo -e "  ${RED}FALSE POS${NC} ${TRAP:0:70}..."
        FP_VIOLATIONS=$((FP_VIOLATIONS + 1))
    else
        echo -e "  ${GREEN}CLEAN${NC}     ${TRAP:0:70}..."
    fi
done

FP_CLEAN=$((FP_TOTAL - FP_VIOLATIONS))
FP_SCORE=$((FP_CLEAN * 100 / FP_TOTAL))
echo -e "\n  False Positives: ${BOLD}${FP_VIOLATIONS}/${FP_TOTAL}${NC} traps triggered | Clean: ${FP_SCORE}%"
echo ""

# ============================================================================
# TEST 6: QUANTITATIVE GATES
# ============================================================================
echo -e "${BLUE}--- TEST 6: QUANTITATIVE GATES ---${NC}"

CITATION_COUNT=$(grep -c "\[SOURCE:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
CITATION_COUNT=$(echo "$CITATION_COUNT" | tr -d '[:space:]')
echo -e "  Citations [SOURCE:]: ${CITATION_COUNT} (target: >= 15)"

# ============================================================================
# OVERALL SCORE
# ============================================================================
echo ""
echo -e "${BOLD}============================================================================${NC}"
echo -e "${BOLD}  SCORECARD${NC}"
echo -e "${BOLD}============================================================================${NC}"

# Weighted score calculation
# FW: 30%, INV: 20%, PH: 15%, VOICE: 15%, FP: 10%, CITATIONS: 10%
CITE_SCORE=0
CITE_NUM=${CITATION_COUNT:-0}
if [[ "$CITE_NUM" -ge 15 ]]; then
    CITE_SCORE=100
elif [[ "$CITE_NUM" -ge 10 ]]; then
    CITE_SCORE=70
elif [[ "$CITE_NUM" -ge 5 ]]; then
    CITE_SCORE=40
fi

WEIGHTED=$(( (FW_SCORE * 30 + INV_SCORE * 20 + PH_SCORE * 15 + VOICE_SCORE * 15 + FP_SCORE * 10 + CITE_SCORE * 10) / 100 ))

echo ""
echo -e "  Frameworks:      ${FW_SCORE}% (weight: 30%)"
echo -e "  Inversions:      ${INV_SCORE}% (weight: 20%)"
echo -e "  Phrases:         ${PH_SCORE}% (weight: 15%)"
echo -e "  Voice Clean:     ${VOICE_SCORE}% (weight: 15%)"
echo -e "  False Positives: ${FP_SCORE}% (weight: 10%)"
echo -e "  Citations:       ${CITE_SCORE}% (weight: 10%)"
echo ""

# Grade
GRADE="D"
if [[ "$WEIGHTED" -ge 90 ]]; then
    GRADE="S"
elif [[ "$WEIGHTED" -ge 80 ]]; then
    GRADE="A"
elif [[ "$WEIGHTED" -ge 70 ]]; then
    GRADE="B"
elif [[ "$WEIGHTED" -ge 60 ]]; then
    GRADE="C"
fi

echo -e "  ${BOLD}OVERALL: ${WEIGHTED}% — GRADE ${GRADE}${NC}"
echo ""

# Core check
if [[ "$FW_CORE_FOUND" -lt "$FW_CORE_TOTAL" ]]; then
    echo -e "  ${RED}WARNING: Missing CORE frameworks (${FW_CORE_FOUND}/${FW_CORE_TOTAL})${NC}"
fi
if [[ "$PH_CORE_FOUND" -lt "$PH_CORE_TOTAL" ]]; then
    echo -e "  ${RED}WARNING: Missing CORE phrases (${PH_CORE_FOUND}/${PH_CORE_TOTAL})${NC}"
fi

echo -e "${BOLD}============================================================================${NC}"

# Save run
{
    echo "# Benchmark Run: ${EXPERT} @ ${RUN_DATE}"
    echo "expert: ${EXPERT}"
    echo "date: ${RUN_DATE}"
    echo "output_file: ${OUTPUT_FILE}"
    echo "frameworks: ${FW_FOUND}/${FW_TOTAL} (${FW_SCORE}%)"
    echo "inversions: ${INV_FOUND}/${INV_TOTAL} (${INV_SCORE}%)"
    echo "phrases: ${PH_FOUND}/${PH_TOTAL} (${PH_SCORE}%)"
    echo "voice_clean: ${VOICE_CLEAN}/${NEVER_TOTAL} (${VOICE_SCORE}%)"
    echo "false_positives: ${FP_VIOLATIONS}/${FP_TOTAL}"
    echo "citations: ${CITATION_COUNT}"
    echo "overall: ${WEIGHTED}%"
    echo "grade: ${GRADE}"
} > "$RUN_FILE"

echo -e "\nRun saved to: ${RUN_FILE}"
