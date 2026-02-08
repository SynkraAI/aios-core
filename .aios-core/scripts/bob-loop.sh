#!/bin/bash
# bob-loop.sh - Ralph-style autonomous agent loop for AIOS
# Spawns a real Claude Code agent to implement a story with iteration loop.
# Usage: bob-loop.sh <story-file> [--agent <agent>] [--max-iterations <n>] [--max-budget <usd>] [--dry-run]
set -euo pipefail

# --- Path Resolution ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AIOS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$AIOS_ROOT/.." && pwd)"

# --- Argument Parsing ---
if [[ $# -eq 0 ]]; then
  echo "Usage: bob-loop.sh <story-file> [--agent <agent>] [--max-iterations <n>] [--max-budget <usd>] [--dry-run]"
  exit 1
fi

STORY_FILE="$1"
shift

AGENT=""
MAX_ITERATIONS=3
MAX_BUDGET=5
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent) AGENT="$2"; shift 2 ;;
    --max-iterations) MAX_ITERATIONS="$2"; shift 2 ;;
    --max-budget) MAX_BUDGET="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --allowed-tools) shift 2 ;;  # Accepted but no-op (future use)
    *) echo "Error: Unknown option: $1"; exit 1 ;;
  esac
done

# --- Validation ---
if [[ ! -f "$STORY_FILE" ]]; then
  echo "Error: Story file not found: $STORY_FILE"
  exit 1
fi

STORY_CONTENT=$(cat "$STORY_FILE")
STORY_ID=$(grep -m1 'story_id:' "$STORY_FILE" | sed 's/.*"\(.*\)".*/\1/' || echo "unknown")

# --- Agent Detection ---
detect_agent() {
  local story_file="$1"
  node -e "
    const { assignExecutorFromContent } = require('${AIOS_ROOT}/core/orchestration/executor-assignment.js');
    const fs = require('fs');
    const content = fs.readFileSync('${story_file}', 'utf-8');
    const result = assignExecutorFromContent(content);
    console.log(result.executor.replace('@', ''));
  " 2>/dev/null || echo "dev"
}

if [[ -z "$AGENT" ]]; then
  AGENT=$(detect_agent "$STORY_FILE")
  AGENT_SOURCE="auto-detected"
else
  AGENT_SOURCE="manual"
fi

# --- Load Agent Definition ---
AGENT_DEF_PATH="${AIOS_ROOT}/development/agents/${AGENT}.md"
if [[ ! -f "$AGENT_DEF_PATH" ]]; then
  echo "Error: Agent definition not found: $AGENT_DEF_PATH"
  exit 1
fi

AGENT_DEF=$(cat "$AGENT_DEF_PATH")

# --- Progress File ---
PROGRESS_FILE="$(dirname "$STORY_FILE")/progress-${STORY_ID}.txt"

# --- Build User Prompt ---
build_user_prompt() {
  local iteration="$1"
  local max_iter="$2"
  local failed_tests="${3:-}"

  local branch
  branch=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "unknown")
  local last_commit
  last_commit=$(git -C "$PROJECT_ROOT" log --oneline -1 2>/dev/null || echo "none")
  local progress=""
  if [[ -f "$PROGRESS_FILE" ]]; then
    progress=$(cat "$PROGRESS_FILE")
  fi

  cat <<PROMPT
# Your Task

Implement the following story. Work on acceptance criteria that are still unchecked.

## Story
${STORY_CONTENT}

## Iteration Context
Iteration: ${iteration} of ${max_iter}
Branch: ${branch}
Last commit: ${last_commit}

## Progress from Previous Iterations
${progress:-No previous iterations.}
${failed_tests:+
## Failed Tests from Previous Iteration
$failed_tests
}
## Rules
- Work on acceptance criteria sequentially
- Run quality checks (npm test, npm run lint) before committing
- Commit with: feat: [Story ${STORY_ID}] - {short description}
- Update story file: mark completed criteria [ ] → [x]
- When ALL acceptance criteria are met and quality checks pass, output:
  <promise>COMPLETE</promise>
- If stuck, document what's blocking in your response
PROMPT
}

# --- Dry-Run Mode ---
if $DRY_RUN; then
  USER_PROMPT=$(build_user_prompt 1 "$MAX_ITERATIONS")
  AGENT_DEF_LEN=${#AGENT_DEF}
  PROMPT_LEN=${#USER_PROMPT}

  cat <<EOF
=== BOB-LOOP DRY-RUN ===
Story file:     $STORY_FILE
Story ID:       $STORY_ID
Agent:          $AGENT ($AGENT_SOURCE)
Agent def:      $AGENT_DEF_PATH ($AGENT_DEF_LEN chars)
Max iterations: $MAX_ITERATIONS
Max budget:     \$${MAX_BUDGET}/iteration
Progress file:  $PROGRESS_FILE

--- CLAUDE COMMAND ---
claude -p \\
  --append-system-prompt "<agent-def: ${AGENT_DEF_LEN} chars>" \\
  --dangerously-skip-permissions \\
  --max-budget-usd ${MAX_BUDGET} \\
  "<user-prompt: ${PROMPT_LEN} chars>"

Quality checks:  npm test (if package.json exists)
Decision matrix: promise + QC pass → SUCCESS | else → next iteration

--- USER PROMPT (full) ---
${USER_PROMPT}
=== DRY-RUN COMPLETE ===
EOF
  exit 0
fi

# --- Run Iteration ---
run_iteration() {
  local agent_def="$1"
  local user_prompt="$2"
  local max_budget="$3"

  claude -p \
    --append-system-prompt "$agent_def" \
    --dangerously-skip-permissions \
    --max-budget-usd "$max_budget" \
    "$user_prompt" 2>&1 || true
}

# --- Progress Logging ---
log_progress() {
  local iteration="$1"
  local output="$2"
  local promise_detected="$3"
  local qc_passed="${4:-skip}"
  local qc_output="${5:-}"
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local summary
  summary=$(echo "$output" | head -c 500)

  cat >> "$PROGRESS_FILE" <<LOG

--- Iteration $iteration [$timestamp] ---
Promise detected: $promise_detected
Quality check: $qc_passed
${qc_output:+Failed tests:
$qc_output
}Summary:
$summary
LOG
}

# --- Quality Check ---
run_quality_check() {
  if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    return 0
  fi
  cd "$PROJECT_ROOT" && npm test 2>&1
}

# --- Execution Loop ---
echo "=== BOB-LOOP START ==="
echo "Story: $STORY_FILE (ID: $STORY_ID)"
echo "Agent: $AGENT ($AGENT_SOURCE)"
echo "Max iterations: $MAX_ITERATIONS | Budget: \$${MAX_BUDGET}/iteration"
echo ""

FAILED_TESTS=""

for iteration in $(seq 1 "$MAX_ITERATIONS"); do
  echo "=== Iteration $iteration of $MAX_ITERATIONS ==="

  # Build prompt with current progress + any failed tests from previous iteration
  USER_PROMPT=$(build_user_prompt "$iteration" "$MAX_ITERATIONS" "$FAILED_TESTS")

  # Execute claude
  OUTPUT=$(run_iteration "$AGENT_DEF" "$USER_PROMPT" "$MAX_BUDGET")
  echo "$OUTPUT"

  # Check completion promise
  PROMISE_DETECTED=false
  echo "$OUTPUT" | grep -q '<promise>COMPLETE</promise>' && PROMISE_DETECTED=true

  # Run quality check
  QC_PASSED=0
  QC_OUTPUT=""
  QC_OUTPUT=$(run_quality_check) || QC_PASSED=$?

  if [[ $QC_PASSED -ne 0 ]]; then
    FAILED_TESTS=$(echo "$QC_OUTPUT" | tail -50)
    QC_STATUS="FAIL"
  else
    FAILED_TESTS=""
    QC_STATUS="PASS"
  fi

  # Log progress
  log_progress "$iteration" "$OUTPUT" "$PROMISE_DETECTED" "$QC_STATUS" "$FAILED_TESTS"

  # Decision matrix
  if $PROMISE_DETECTED && [[ $QC_PASSED -eq 0 ]]; then
    echo ""
    echo "=== COMPLETE at iteration $iteration (promise + quality check passed) ==="
    exit 0
  fi

  if $PROMISE_DETECTED && [[ $QC_PASSED -ne 0 ]]; then
    echo ""
    echo "=== Iteration $iteration: promise detected but quality check FAILED, continuing... ==="
  else
    echo ""
    echo "=== Iteration $iteration: not complete, continuing... ==="
  fi
done

echo ""
echo "=== FAILED: max iterations ($MAX_ITERATIONS) reached without completion ==="
exit 1
