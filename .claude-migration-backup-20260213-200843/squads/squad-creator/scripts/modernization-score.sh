#!/bin/bash
# modernization-score.sh - Deterministic modernization scoring (no LLM needed)
# Usage: ./modernization-score.sh <workflow-file> [--json]
#
# Applies 12-point checklist to evaluate if workflow follows modern AIOS patterns
# Based on pv-workflow-validation.yaml criteria

set -e

WORKFLOW_FILE="$1"
OUTPUT_FORMAT="yaml"

if [[ "$2" == "--json" ]]; then
    OUTPUT_FORMAT="json"
fi

if [[ -z "$WORKFLOW_FILE" ]]; then
    echo "Usage: $0 <workflow-file> [--json]"
    echo ""
    echo "Evaluates a workflow/skill file against 12 modern AIOS patterns."
    echo "Returns score X/12 with per-pattern evidence."
    exit 1
fi

if [[ ! -f "$WORKFLOW_FILE" ]]; then
    echo "Error: File not found: $WORKFLOW_FILE"
    exit 1
fi

WORKFLOW_NAME=$(basename "$WORKFLOW_FILE" | sed 's/\.[^.]*$//')
DATE=$(date -Iseconds)
TOTAL=0
RESULTS=()

# ============================================================================
# P1: Teams Architecture (TeamCreate, TaskCreate)
# ============================================================================
if grep -qiE "(TeamCreate|TaskCreate)" "$WORKFLOW_FILE"; then
    P1="PASS"
    P1_EVIDENCE=$(grep -n -m1 -iE "(TeamCreate|TaskCreate)" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P1="FAIL"
    P1_EVIDENCE="No TeamCreate/TaskCreate found"
fi

# ============================================================================
# P2: SKILL.md Frontmatter (name: + description:)
# ============================================================================
if grep -qiE "^name:" "$WORKFLOW_FILE" && grep -qiE "^description:" "$WORKFLOW_FILE"; then
    P2="PASS"
    P2_EVIDENCE="Both name: and description: frontmatter found"
    TOTAL=$((TOTAL + 1))
elif grep -qiE "^name:|^description:" "$WORKFLOW_FILE"; then
    P2="FAIL"
    P2_EVIDENCE="Partial frontmatter (missing name: or description:)"
else
    P2="FAIL"
    P2_EVIDENCE="No SKILL.md frontmatter found"
fi

# ============================================================================
# P3: Blocking Execution (Task with subagent without run_in_background)
# ============================================================================
if grep -qiE "Task.*subagent" "$WORKFLOW_FILE" || grep -qiE "subagent_type" "$WORKFLOW_FILE"; then
    P3="PASS"
    P3_EVIDENCE=$(grep -n -m1 -iE "(Task.*subagent|subagent_type)" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P3="FAIL"
    P3_EVIDENCE="No Task subagent invocations found"
fi

# ============================================================================
# P4: Parallel Execution (run_in_background)
# ============================================================================
if grep -qiE "run_in_background" "$WORKFLOW_FILE"; then
    P4="PASS"
    P4_EVIDENCE=$(grep -n -m1 -iE "run_in_background" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P4="FAIL"
    P4_EVIDENCE="No run_in_background usage found"
fi

# ============================================================================
# P5: Context Preamble (git status, gotchas, context loading)
# ============================================================================
if grep -qiE "(git status|gotchas|context.*preamble|context.*load)" "$WORKFLOW_FILE"; then
    P5="PASS"
    P5_EVIDENCE=$(grep -n -m1 -iE "(git status|gotchas|context.*preamble|context.*load)" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P5="FAIL"
    P5_EVIDENCE="No context preamble found"
fi

# ============================================================================
# P6: File-Based Communication (outputs/ directory)
# ============================================================================
if grep -qiE "outputs/" "$WORKFLOW_FILE"; then
    P6="PASS"
    P6_EVIDENCE=$(grep -n -m1 -iE "outputs/" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P6="FAIL"
    P6_EVIDENCE="No outputs/ directory references found"
fi

# ============================================================================
# P7: Agent File References (Read agent file, .claude/agents)
# ============================================================================
if grep -qiE "(Read.*agent|\.claude/agents|squads/.*/agents)" "$WORKFLOW_FILE"; then
    P7="PASS"
    P7_EVIDENCE=$(grep -n -m1 -iE "(Read.*agent|\.claude/agents|squads/.*/agents)" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P7="FAIL"
    P7_EVIDENCE="No agent file references found"
fi

# ============================================================================
# P8: Task Dependencies (blockedBy)
# ============================================================================
if grep -qiE "blockedBy" "$WORKFLOW_FILE"; then
    P8="PASS"
    P8_EVIDENCE=$(grep -n -m1 -iE "blockedBy" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P8="FAIL"
    P8_EVIDENCE="No blockedBy task dependencies found"
fi

# ============================================================================
# P9: Permission Mode (bypassPermissions or explicit mode)
# ============================================================================
if grep -qiE "(bypassPermissions|permissionMode|acceptEdits)" "$WORKFLOW_FILE"; then
    P9="PASS"
    P9_EVIDENCE=$(grep -n -m1 -iE "(bypassPermissions|permissionMode|acceptEdits)" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P9="FAIL"
    P9_EVIDENCE="No explicit permission mode found"
fi

# ============================================================================
# P10: Proper Finalization (shutdown + TeamDelete)
# ============================================================================
if grep -qiE "(shutdown|TeamDelete)" "$WORKFLOW_FILE"; then
    P10="PASS"
    P10_EVIDENCE=$(grep -n -m1 -iE "(shutdown|TeamDelete)" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P10="FAIL"
    P10_EVIDENCE="No shutdown/TeamDelete finalization found"
fi

# ============================================================================
# P11: Anti-Pattern Documentation (NEVER, anti-pattern, DO NOT)
# ============================================================================
if grep -qiE "(NEVER|anti.pattern|DO NOT)" "$WORKFLOW_FILE"; then
    P11="PASS"
    COUNT=$(grep -ciE "(NEVER|anti.pattern|DO NOT)" "$WORKFLOW_FILE" 2>/dev/null || echo 0)
    P11_EVIDENCE="Found $COUNT anti-pattern references"
    TOTAL=$((TOTAL + 1))
else
    P11="FAIL"
    P11_EVIDENCE="No anti-pattern documentation found"
fi

# ============================================================================
# P12: Artifact Directory (outputs/{slug}/ structured)
# ============================================================================
if grep -qiE "outputs/.*/" "$WORKFLOW_FILE"; then
    P12="PASS"
    P12_EVIDENCE=$(grep -n -m1 -iE "outputs/.*/" "$WORKFLOW_FILE" | head -1 | sed 's/"/\\"/g')
    TOTAL=$((TOTAL + 1))
else
    P12="FAIL"
    P12_EVIDENCE="No structured artifact directory (outputs/{slug}/) found"
fi

# ============================================================================
# INTERPRETATION
# ============================================================================
if [[ $TOTAL -eq 12 ]]; then
    INTERPRETATION="Totalmente moderno"
    ACTION="Pronto para producao"
elif [[ $TOTAL -ge 9 ]]; then
    INTERPRETATION="Quase moderno"
    ACTION="Ajustes menores"
elif [[ $TOTAL -ge 5 ]]; then
    INTERPRETATION="Parcialmente moderno"
    ACTION="Refactor significativo"
elif [[ $TOTAL -ge 1 ]]; then
    INTERPRETATION="Majoritariamente legado"
    ACTION="Rewrite necessario"
else
    INTERPRETATION="Completamente legado"
    ACTION="Rewrite total"
fi

# ============================================================================
# OUTPUT
# ============================================================================
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    cat <<ENDJSON
{
  "modernization_score": {
    "workflow": "$WORKFLOW_NAME",
    "file": "$WORKFLOW_FILE",
    "date": "$DATE",
    "score": "$TOTAL/12",
    "interpretation": "$INTERPRETATION",
    "action": "$ACTION",
    "patterns": [
      {"id": 1, "name": "Teams Architecture", "status": "$P1", "evidence": "$P1_EVIDENCE"},
      {"id": 2, "name": "SKILL.md Frontmatter", "status": "$P2", "evidence": "$P2_EVIDENCE"},
      {"id": 3, "name": "Blocking Execution", "status": "$P3", "evidence": "$P3_EVIDENCE"},
      {"id": 4, "name": "Parallel Execution", "status": "$P4", "evidence": "$P4_EVIDENCE"},
      {"id": 5, "name": "Context Preamble", "status": "$P5", "evidence": "$P5_EVIDENCE"},
      {"id": 6, "name": "File-Based Communication", "status": "$P6", "evidence": "$P6_EVIDENCE"},
      {"id": 7, "name": "Agent File References", "status": "$P7", "evidence": "$P7_EVIDENCE"},
      {"id": 8, "name": "Task Dependencies", "status": "$P8", "evidence": "$P8_EVIDENCE"},
      {"id": 9, "name": "Permission Mode", "status": "$P9", "evidence": "$P9_EVIDENCE"},
      {"id": 10, "name": "Proper Finalization", "status": "$P10", "evidence": "$P10_EVIDENCE"},
      {"id": 11, "name": "Anti-Pattern Docs", "status": "$P11", "evidence": "$P11_EVIDENCE"},
      {"id": 12, "name": "Artifact Directory", "status": "$P12", "evidence": "$P12_EVIDENCE"}
    ],
    "recommendations": [
ENDJSON

    # Build recommendations for FAIL patterns
    RECS=()
    [[ "$P1" == "FAIL" ]] && RECS+=('      {"priority": "high", "pattern": "Teams Architecture", "action": "Add TeamCreate/TaskCreate for multi-agent coordination"}')
    [[ "$P2" == "FAIL" ]] && RECS+=('      {"priority": "medium", "pattern": "SKILL.md Frontmatter", "action": "Add name: and description: frontmatter"}')
    [[ "$P3" == "FAIL" ]] && RECS+=('      {"priority": "high", "pattern": "Blocking Execution", "action": "Use Task tool with subagent_type for agent delegation"}')
    [[ "$P4" == "FAIL" ]] && RECS+=('      {"priority": "medium", "pattern": "Parallel Execution", "action": "Add run_in_background for independent tasks"}')
    [[ "$P5" == "FAIL" ]] && RECS+=('      {"priority": "low", "pattern": "Context Preamble", "action": "Add git status/gotchas context loading"}')
    [[ "$P6" == "FAIL" ]] && RECS+=('      {"priority": "high", "pattern": "File-Based Communication", "action": "Use outputs/ directory for inter-agent communication"}')
    [[ "$P7" == "FAIL" ]] && RECS+=('      {"priority": "medium", "pattern": "Agent File References", "action": "Reference .claude/agents/ files instead of hardcoded personas"}')
    [[ "$P8" == "FAIL" ]] && RECS+=('      {"priority": "medium", "pattern": "Task Dependencies", "action": "Use blockedBy for task ordering"}')
    [[ "$P9" == "FAIL" ]] && RECS+=('      {"priority": "low", "pattern": "Permission Mode", "action": "Set explicit bypassPermissions or acceptEdits"}')
    [[ "$P10" == "FAIL" ]] && RECS+=('      {"priority": "high", "pattern": "Proper Finalization", "action": "Add shutdown_request + TeamDelete cleanup"}')
    [[ "$P11" == "FAIL" ]] && RECS+=('      {"priority": "low", "pattern": "Anti-Pattern Docs", "action": "Document NEVER/DO NOT patterns"}')
    [[ "$P12" == "FAIL" ]] && RECS+=('      {"priority": "medium", "pattern": "Artifact Directory", "action": "Use outputs/{slug}/ structured artifact paths"}')

    # Join with commas
    for i in "${!RECS[@]}"; do
        if [[ $i -lt $((${#RECS[@]} - 1)) ]]; then
            echo "${RECS[$i]},"
        else
            echo "${RECS[$i]}"
        fi
    done

    cat <<ENDJSON
    ]
  }
}
ENDJSON
else
    # YAML output (default)
    echo "# Modernization Score Report"
    echo "# Generated: $DATE"
    echo "# File: $WORKFLOW_FILE"
    echo ""
    echo "modernization_score:"
    echo "  workflow: \"$WORKFLOW_NAME\""
    echo "  file: \"$WORKFLOW_FILE\""
    echo "  date: \"$DATE\""
    echo "  score: \"$TOTAL/12\""
    echo "  interpretation: \"$INTERPRETATION\""
    echo "  action: \"$ACTION\""
    echo ""
    echo "  patterns:"
    echo "    - { id: 1, name: 'Teams Architecture', status: '$P1', evidence: '$P1_EVIDENCE' }"
    echo "    - { id: 2, name: 'SKILL.md Frontmatter', status: '$P2', evidence: '$P2_EVIDENCE' }"
    echo "    - { id: 3, name: 'Blocking Execution', status: '$P3', evidence: '$P3_EVIDENCE' }"
    echo "    - { id: 4, name: 'Parallel Execution', status: '$P4', evidence: '$P4_EVIDENCE' }"
    echo "    - { id: 5, name: 'Context Preamble', status: '$P5', evidence: '$P5_EVIDENCE' }"
    echo "    - { id: 6, name: 'File-Based Communication', status: '$P6', evidence: '$P6_EVIDENCE' }"
    echo "    - { id: 7, name: 'Agent File References', status: '$P7', evidence: '$P7_EVIDENCE' }"
    echo "    - { id: 8, name: 'Task Dependencies', status: '$P8', evidence: '$P8_EVIDENCE' }"
    echo "    - { id: 9, name: 'Permission Mode', status: '$P9', evidence: '$P9_EVIDENCE' }"
    echo "    - { id: 10, name: 'Proper Finalization', status: '$P10', evidence: '$P10_EVIDENCE' }"
    echo "    - { id: 11, name: 'Anti-Pattern Docs', status: '$P11', evidence: '$P11_EVIDENCE' }"
    echo "    - { id: 12, name: 'Artifact Directory', status: '$P12', evidence: '$P12_EVIDENCE' }"
    echo ""
    echo "  recommendations:"

    [[ "$P1" == "FAIL" ]] && echo "    - { priority: 'high', pattern: 'Teams Architecture', action: 'Add TeamCreate/TaskCreate for multi-agent coordination' }"
    [[ "$P2" == "FAIL" ]] && echo "    - { priority: 'medium', pattern: 'SKILL.md Frontmatter', action: 'Add name: and description: frontmatter' }"
    [[ "$P3" == "FAIL" ]] && echo "    - { priority: 'high', pattern: 'Blocking Execution', action: 'Use Task tool with subagent_type for agent delegation' }"
    [[ "$P4" == "FAIL" ]] && echo "    - { priority: 'medium', pattern: 'Parallel Execution', action: 'Add run_in_background for independent tasks' }"
    [[ "$P5" == "FAIL" ]] && echo "    - { priority: 'low', pattern: 'Context Preamble', action: 'Add git status/gotchas context loading' }"
    [[ "$P6" == "FAIL" ]] && echo "    - { priority: 'high', pattern: 'File-Based Communication', action: 'Use outputs/ directory for inter-agent communication' }"
    [[ "$P7" == "FAIL" ]] && echo "    - { priority: 'medium', pattern: 'Agent File References', action: 'Reference .claude/agents/ files instead of hardcoded personas' }"
    [[ "$P8" == "FAIL" ]] && echo "    - { priority: 'medium', pattern: 'Task Dependencies', action: 'Use blockedBy for task ordering' }"
    [[ "$P9" == "FAIL" ]] && echo "    - { priority: 'low', pattern: 'Permission Mode', action: 'Set explicit bypassPermissions or acceptEdits' }"
    [[ "$P10" == "FAIL" ]] && echo "    - { priority: 'high', pattern: 'Proper Finalization', action: 'Add shutdown_request + TeamDelete cleanup' }"
    [[ "$P11" == "FAIL" ]] && echo "    - { priority: 'low', pattern: 'Anti-Pattern Docs', action: 'Document NEVER/DO NOT patterns' }"
    [[ "$P12" == "FAIL" ]] && echo "    - { priority: 'medium', pattern: 'Artifact Directory', action: 'Use outputs/{slug}/ structured artifact paths' }"

    echo ""
    echo "# Cost: \$0 (zero tokens)"
    echo "# Time: <1 second"
fi
