#!/bin/bash
# assess-sources.sh - Deterministic source quality assessment (no LLM needed)
# Usage: ./assess-sources.sh <sources-dir> [--json] [--verbose]
#
# Loops through source files, applies 25 binary checkpoints per source
# across 5 dimensions (Autenticidade, Profundidade, Atualidade, Unicidade, Completude)

set -e

SOURCES_DIR=""
OUTPUT_FORMAT="yaml"
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            OUTPUT_FORMAT="json"
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            SOURCES_DIR="$1"
            shift
            ;;
    esac
done

if [[ -z "$SOURCES_DIR" ]]; then
    echo "Usage: $0 <sources-dir> [--json] [--verbose]"
    echo ""
    echo "Assesses quality of source files across 5 dimensions (25 checkpoints)."
    echo "Classifies each source as ouro (gold), mixed, or bronze."
    echo ""
    echo "Options:"
    echo "  --json      Output JSON instead of YAML"
    echo "  --verbose   Show per-checkpoint details for each source"
    exit 1
fi

if [[ ! -d "$SOURCES_DIR" ]]; then
    echo "Error: Directory not found: $SOURCES_DIR"
    exit 1
fi

DATE=$(date -Iseconds)

# Find all source files
mapfile -t SOURCE_FILES < <(find "$SOURCES_DIR" -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.txt" \) | sort)

TOTAL_FILES=${#SOURCE_FILES[@]}

if [[ $TOTAL_FILES -eq 0 ]]; then
    echo "Error: No source files (.md, .yaml, .yml, .txt) found in $SOURCES_DIR"
    exit 1
fi

# Counters
OURO_COUNT=0
MIXED_COUNT=0
BRONZE_COUNT=0
CROWN_COUNT=0
ALL_SCORES=()
ALL_TIERS=()
ALL_NAMES=()

# Per-source YAML/JSON accumulator
SOURCE_REPORTS=""

for FILE in "${SOURCE_FILES[@]}"; do
    FNAME=$(basename "$FILE")
    LINE_COUNT=$(wc -l < "$FILE" | tr -d ' ')

    # ========================================================================
    # D1: Autenticidade (5 checks)
    # ========================================================================
    D1=0

    # D1.1: Spontaneity markers ("honestly", "I was wrong", "truth is")
    if grep -qiE "(honestly|I was wrong|truth is|to be honest|frankly|confession)" "$FILE"; then
        D1=$((D1 + 1))
        D1_1="PASS"
    else
        D1_1="FAIL"
    fi

    # D1.2: Vulnerability markers ("struggle", "failure", "mistake")
    if grep -qiE "(struggle|failure|mistake|I failed|I lost|painful|embarrass)" "$FILE"; then
        D1=$((D1 + 1))
        D1_2="PASS"
    else
        D1_2="FAIL"
    fi

    # D1.3: Difficult questions acknowledged
    if grep -qiE "(difficult question|hard question|I don.t know|uncertain|not sure|gray area)" "$FILE"; then
        D1=$((D1 + 1))
        D1_3="PASS"
    else
        D1_3="FAIL"
    fi

    # D1.4: Nuanced answers (not black/white)
    if grep -qiE "(depends on|it depends|nuance|on the other hand|however|but also|both true)" "$FILE"; then
        D1=$((D1 + 1))
        D1_4="PASS"
    else
        D1_4="FAIL"
    fi

    # D1.5: Personal storytelling
    if grep -qiE "(I remember|when I was|my experience|I learned|my story|years ago)" "$FILE"; then
        D1=$((D1 + 1))
        D1_5="PASS"
    else
        D1_5="FAIL"
    fi

    # ========================================================================
    # D2: Profundidade (5 checks)
    # ========================================================================
    D2=0

    # D2.1: Explains why (not just what)
    if grep -qiE "(because|the reason|why this matters|this is important|the key insight)" "$FILE"; then
        D2=$((D2 + 1))
        D2_1="PASS"
    else
        D2_1="FAIL"
    fi

    # D2.2: Framework present
    if grep -qiE "(framework|model|system|methodology|approach|process|step [0-9])" "$FILE"; then
        D2=$((D2 + 1))
        D2_2="PASS"
    else
        D2_2="FAIL"
    fi

    # D2.3: Specific examples with numbers
    if grep -qE "[0-9]+%" "$FILE" || grep -qiE "(\$[0-9]|[0-9]+ (people|clients|companies|students|years))" "$FILE"; then
        D2=$((D2 + 1))
        D2_3="PASS"
    else
        D2_3="FAIL"
    fi

    # D2.4: Trade-offs discussed
    if grep -qiE "(trade.off|downside|cost of|sacrifice|risk|limitation|the problem with)" "$FILE"; then
        D2=$((D2 + 1))
        D2_4="PASS"
    else
        D2_4="FAIL"
    fi

    # D2.5: Cross-domain connections
    if grep -qiE "(like in|similar to|just as|reminds me of|analogy|compare|connection)" "$FILE"; then
        D2=$((D2 + 1))
        D2_5="PASS"
    else
        D2_5="FAIL"
    fi

    # ========================================================================
    # D3: Atualidade (5 checks)
    # ========================================================================
    D3=0

    # D3.1: Date >= 2023 (or recent context)
    if grep -qE "(202[3-9]|203[0-9])" "$FILE"; then
        D3=$((D3 + 1))
        D3_1="PASS"
    else
        D3_1="FAIL"
    fi

    # D3.2: Current context references (AI, GPT, remote work, etc.)
    if grep -qiE "(AI|artificial intelligence|GPT|ChatGPT|remote|hybrid work|creator economy|no.code)" "$FILE"; then
        D3=$((D3 + 1))
        D3_2="PASS"
    else
        D3_2="FAIL"
    fi

    # D3.3: Not contradicted (no "outdated" or "deprecated" markers)
    if ! grep -qiE "(outdated|deprecated|no longer|obsolete|was true but)" "$FILE"; then
        D3=$((D3 + 1))
        D3_3="PASS"
    else
        D3_3="FAIL"
    fi

    # D3.4: Shows evolution (mentions change, growth, update)
    if grep -qiE "(evolved|changed|updated|used to|now I|shifted|pivot)" "$FILE"; then
        D3=$((D3 + 1))
        D3_4="PASS"
    else
        D3_4="FAIL"
    fi

    # D3.5: Applicable now (actionable content)
    if grep -qiE "(you can|try this|start with|actionable|implement|apply|do this)" "$FILE"; then
        D3=$((D3 + 1))
        D3_5="PASS"
    else
        D3_5="FAIL"
    fi

    # ========================================================================
    # D4: Unicidade (5 checks)
    # ========================================================================
    D4=0

    # D4.1: Contra-mainstream position
    if grep -qiE "(most people|everyone says|conventional|contrarian|unpopular|disagree|wrong about)" "$FILE"; then
        D4=$((D4 + 1))
        D4_1="PASS"
    else
        D4_1="FAIL"
    fi

    # D4.2: Unique vocabulary (coined terms)
    if grep -qiE "(I call it|what I call|my term|I coined|I define)" "$FILE"; then
        D4=$((D4 + 1))
        D4_2="PASS"
    else
        D4_2="FAIL"
    fi

    # D4.3: Original framework name
    # Check for capitalized multi-word names that look like named frameworks
    if grep -qE "[A-Z][a-z]+\s+[A-Z][a-z]+" "$FILE" && grep -qiE "(framework|method|system|model|approach)" "$FILE"; then
        D4=$((D4 + 1))
        D4_3="PASS"
    else
        D4_3="FAIL"
    fi

    # D4.4: Counter-intuitive insight
    if grep -qiE "(counter.intuitive|surprising|paradox|opposite|actually|seems wrong but)" "$FILE"; then
        D4=$((D4 + 1))
        D4_4="PASS"
    else
        D4_4="FAIL"
    fi

    # D4.5: Singular perspective
    if grep -qiE "(my perspective|in my view|I believe|my philosophy|my approach|the way I see)" "$FILE"; then
        D4=$((D4 + 1))
        D4_5="PASS"
    else
        D4_5="FAIL"
    fi

    # ========================================================================
    # D5: Completude (5 checks)
    # ========================================================================
    D5=0

    # D5.1: Has step-by-step
    if grep -qiE "(step [0-9]|step-by-step|first.*then.*finally|1\.|2\.|3\.)" "$FILE"; then
        D5=$((D5 + 1))
        D5_1="PASS"
    else
        D5_1="FAIL"
    fi

    # D5.2: Has decision rules
    if grep -qiE "(if.*then|when.*do|rule:|decision:|criteria:|threshold)" "$FILE"; then
        D5=$((D5 + 1))
        D5_2="PASS"
    else
        D5_2="FAIL"
    fi

    # D5.3: Has real examples
    if grep -qiE "(for example|example:|e\.g\.|such as|case study|instance)" "$FILE"; then
        D5=$((D5 + 1))
        D5_3="PASS"
    else
        D5_3="FAIL"
    fi

    # D5.4: Discusses edge cases
    if grep -qiE "(edge case|exception|unless|except when|caveat|warning|watch out)" "$FILE"; then
        D5=$((D5 + 1))
        D5_4="PASS"
    else
        D5_4="FAIL"
    fi

    # D5.5: Adequate length (>200 lines or indication of substantial content)
    if [[ "$LINE_COUNT" -gt 200 ]]; then
        D5=$((D5 + 1))
        D5_5="PASS"
    else
        # Check word count as fallback
        WORD_COUNT=$(wc -w < "$FILE" | tr -d ' ')
        if [[ "$WORD_COUNT" -gt 1500 ]]; then
            D5=$((D5 + 1))
            D5_5="PASS"
        else
            D5_5="FAIL"
        fi
    fi

    # ========================================================================
    # SCORING
    # ========================================================================
    TOTAL_CHECKS=$((D1 + D2 + D3 + D4 + D5))
    # Average across 5 dimensions (each 0-5, average 0-5)
    AVG_SCORE=$(echo "scale=1; ($D1 + $D2 + $D3 + $D4 + $D5) / 5" | bc)

    # Tier classification
    # Special rule: D1 < 3 → force bronze
    if [[ "$D1" -lt 3 ]]; then
        TIER="bronze"
        TIER_REASON="D1 Autenticidade < 3 (forced bronze)"
    elif [[ "$D1" -ge 4 && "$D2" -ge 4 && "$D3" -ge 4 && "$D4" -ge 4 && "$D5" -ge 4 ]]; then
        TIER="crown_jewel"
        TIER_REASON="All dimensions >= 4"
        CROWN_COUNT=$((CROWN_COUNT + 1))
        OURO_COUNT=$((OURO_COUNT + 1))
    elif (( $(echo "$AVG_SCORE >= 4.0" | bc -l) )); then
        TIER="ouro"
        TIER_REASON="Average >= 4.0"
        OURO_COUNT=$((OURO_COUNT + 1))
    elif (( $(echo "$AVG_SCORE >= 3.0" | bc -l) )); then
        TIER="mixed"
        TIER_REASON="Average 3.0-3.9"
        MIXED_COUNT=$((MIXED_COUNT + 1))
    else
        TIER="bronze"
        TIER_REASON="Average < 3.0"
        BRONZE_COUNT=$((BRONZE_COUNT + 1))
    fi

    ALL_SCORES+=("$AVG_SCORE")
    ALL_TIERS+=("$TIER")
    ALL_NAMES+=("$FNAME")

    # Accumulate per-source report
    if [[ "$OUTPUT_FORMAT" == "yaml" ]]; then
        SOURCE_REPORTS+="    - file: \"$FNAME\""$'\n'
        SOURCE_REPORTS+="      lines: $LINE_COUNT"$'\n'
        SOURCE_REPORTS+="      tier: \"$TIER\""$'\n'
        SOURCE_REPORTS+="      tier_reason: \"$TIER_REASON\""$'\n'
        SOURCE_REPORTS+="      average_score: $AVG_SCORE"$'\n'
        SOURCE_REPORTS+="      dimensions:"$'\n'
        SOURCE_REPORTS+="        autenticidade: { score: $D1, checks: [$D1_1, $D1_2, $D1_3, $D1_4, $D1_5] }"$'\n'
        SOURCE_REPORTS+="        profundidade: { score: $D2, checks: [$D2_1, $D2_2, $D2_3, $D2_4, $D2_5] }"$'\n'
        SOURCE_REPORTS+="        atualidade: { score: $D3, checks: [$D3_1, $D3_2, $D3_3, $D3_4, $D3_5] }"$'\n'
        SOURCE_REPORTS+="        unicidade: { score: $D4, checks: [$D4_1, $D4_2, $D4_3, $D4_4, $D4_5] }"$'\n'
        SOURCE_REPORTS+="        completude: { score: $D5, checks: [$D5_1, $D5_2, $D5_3, $D5_4, $D5_5] }"$'\n'
    fi

    if [[ "$VERBOSE" == true ]]; then
        echo "  [VERBOSE] $FNAME: D1=$D1 D2=$D2 D3=$D3 D4=$D4 D5=$D5 avg=$AVG_SCORE tier=$TIER" >&2
    fi
done

# ============================================================================
# AGGREGATION
# ============================================================================
if [[ $TOTAL_FILES -gt 0 ]]; then
    OURO_PCT=$((OURO_COUNT * 100 / TOTAL_FILES))
else
    OURO_PCT=0
fi

# Overall quality
if [[ "$OURO_PCT" -ge 80 ]]; then
    OVERALL="excelente"
elif [[ "$OURO_PCT" -ge 60 ]]; then
    OVERALL="aceitavel"
elif [[ "$OURO_PCT" -ge 40 ]]; then
    OVERALL="parcial"
else
    OVERALL="critico"
fi

# ============================================================================
# OUTPUT
# ============================================================================
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    echo "{"
    echo "  \"source_assessment\": {"
    echo "    \"directory\": \"$SOURCES_DIR\","
    echo "    \"date\": \"$DATE\","
    echo "    \"summary\": {"
    echo "      \"total_sources\": $TOTAL_FILES,"
    echo "      \"ouro_count\": $OURO_COUNT,"
    echo "      \"mixed_count\": $MIXED_COUNT,"
    echo "      \"bronze_count\": $BRONZE_COUNT,"
    echo "      \"crown_jewels\": $CROWN_COUNT,"
    echo "      \"ouro_percentage\": \"${OURO_PCT}%\","
    echo "      \"overall_quality\": \"$OVERALL\""
    echo "    },"
    echo "    \"sources\": ["

    for i in "${!ALL_NAMES[@]}"; do
        COMMA=""
        if [[ $i -lt $((${#ALL_NAMES[@]} - 1)) ]]; then
            COMMA=","
        fi
        echo "      {\"file\": \"${ALL_NAMES[$i]}\", \"tier\": \"${ALL_TIERS[$i]}\", \"score\": ${ALL_SCORES[$i]}}$COMMA"
    done

    echo "    ]"
    echo "  }"
    echo "}"
else
    # YAML output
    echo "# Source Assessment Report"
    echo "# Generated: $DATE"
    echo "# Directory: $SOURCES_DIR"
    echo ""
    echo "source_assessment:"
    echo "  directory: \"$SOURCES_DIR\""
    echo "  date: \"$DATE\""
    echo ""
    echo "  summary:"
    echo "    total_sources: $TOTAL_FILES"
    echo "    ouro_count: $OURO_COUNT"
    echo "    mixed_count: $MIXED_COUNT"
    echo "    bronze_count: $BRONZE_COUNT"
    echo "    crown_jewels: $CROWN_COUNT"
    echo "    ouro_percentage: \"${OURO_PCT}%\""
    echo "    overall_quality: \"$OVERALL\""
    echo ""
    echo "  sources:"
    echo -n "$SOURCE_REPORTS"
    echo ""
    echo "# Cost: \$0 (zero tokens)"
    echo "# Time: <${TOTAL_FILES} seconds"
fi
