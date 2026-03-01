#!/bin/bash
# =============================================================================
# AIOS Orchestrator — Overnight Batch Processing
#
# Processes all story files in the backlog directory sequentially.
# On failure: sends OpenClaw notification and STOPS (CP-14: stop-on-first-failure).
# On completion: sends summary notification.
#
# Usage:
#   ./overnight.sh                          Process all backlog stories
#   ./overnight.sh --dry-run                List stories without processing
#   ./overnight.sh --backlog <dir>          Use custom backlog directory
#   ./overnight.sh --max-budget <usd>       Set per-story budget limit
#
# Story: E7.1.7
# Architecture: docs/architecture/sdk-orchestrator-architecture.md Section 13.2
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ORCHESTRATOR="${SCRIPT_DIR}/orchestrator.mjs"
LOG_DIR="${PROJECT_ROOT}/.aios/logs"
LOG_FILE="${LOG_DIR}/overnight-$(date +%Y%m%d-%H%M%S).log"
OPENCLAW_TARGET="+5528999301848"

# Defaults
BACKLOG_DIR="${PROJECT_ROOT}/docs/stories/backlog"
DRY_RUN=false
MAX_BUDGET=""

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --backlog)
      BACKLOG_DIR="$2"
      shift 2
      ;;
    --max-budget)
      MAX_BUDGET="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: overnight.sh [--dry-run] [--backlog <dir>] [--max-budget <usd>]"
      echo ""
      echo "Options:"
      echo "  --dry-run          List stories that would be processed without running them"
      echo "  --backlog <dir>    Backlog directory (default: docs/stories/backlog)"
      echo "  --max-budget <usd> Per-story budget limit in USD"
      echo "  --help, -h         Show this help"
      exit 0
      ;;
    *)
      echo "[ERROR] Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

notify() {
  local message="$1"
  sudo /usr/bin/openclaw message send \
    --target "$OPENCLAW_TARGET" \
    --message "$message" || true
}

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

mkdir -p "$LOG_DIR"

if [[ ! -d "$BACKLOG_DIR" ]]; then
  log "[ERROR] Backlog directory not found: ${BACKLOG_DIR}"
  exit 2
fi

if [[ ! -f "$ORCHESTRATOR" ]]; then
  log "[ERROR] Orchestrator not found: ${ORCHESTRATOR}"
  exit 2
fi

# ---------------------------------------------------------------------------
# Enumerate stories
# ---------------------------------------------------------------------------

mapfile -t STORIES < <(find "$BACKLOG_DIR" -name '*.story.md' -type f | sort)
TOTAL=${#STORIES[@]}

if [[ $TOTAL -eq 0 ]]; then
  log "No story files found in ${BACKLOG_DIR}. Nothing to process."
  exit 0
fi

# ---------------------------------------------------------------------------
# Dry-run mode
# ---------------------------------------------------------------------------

if [[ "$DRY_RUN" == "true" ]]; then
  echo "=== Overnight Batch — Dry Run ==="
  echo "Backlog: ${BACKLOG_DIR}"
  echo "Stories found: ${TOTAL}"
  echo ""
  for i in "${!STORIES[@]}"; do
    echo "  $((i + 1)). ${STORIES[$i]}"
  done
  echo ""
  echo "Run without --dry-run to process these stories."
  exit 0
fi

# ---------------------------------------------------------------------------
# Batch execution
# ---------------------------------------------------------------------------

START_TIME=$(date +%s)
SUCCESS_COUNT=0

log "=== AIOS Overnight Batch Started ==="
log "Backlog: ${BACKLOG_DIR}"
log "Stories: ${TOTAL}"
log "Log: ${LOG_FILE}"

for i in "${!STORIES[@]}"; do
  STORY="${STORIES[$i]}"
  STORY_NUM=$((i + 1))

  log "[${STORY_NUM}/${TOTAL}] Processing: ${STORY}"

  # Build command
  CMD=(node "$ORCHESTRATOR" --workflow sdc --story "$STORY" --no-interactive)
  if [[ -n "$MAX_BUDGET" ]]; then
    CMD+=(--max-budget "$MAX_BUDGET")
  fi

  # Execute
  set +e
  "${CMD[@]}" >> "$LOG_FILE" 2>&1
  EXIT_CODE=$?
  set -e

  if [[ $EXIT_CODE -ne 0 ]]; then
    log "[${STORY_NUM}/${TOTAL}] FAILED: ${STORY} (exit code: ${EXIT_CODE})"

    # CP-14: stop-on-first-failure + notify
    notify "[AIOS-Overnight] FAILED: ${STORY}. Exit code: ${EXIT_CODE}. Stopping batch."

    END_TIME=$(date +%s)
    DURATION=$(( END_TIME - START_TIME ))
    log "=== Batch ABORTED after ${SUCCESS_COUNT}/${TOTAL} stories. Duration: ${DURATION}s ==="
    exit 1
  fi

  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  log "[${STORY_NUM}/${TOTAL}] SUCCESS: ${STORY}"
done

# ---------------------------------------------------------------------------
# Batch complete
# ---------------------------------------------------------------------------

END_TIME=$(date +%s)
DURATION=$(( END_TIME - START_TIME ))

log "=== AIOS Overnight Batch Complete ==="
log "Result: ${SUCCESS_COUNT}/${TOTAL} stories processed successfully"
log "Duration: ${DURATION}s"

notify "[AIOS-Overnight] Complete: ${SUCCESS_COUNT}/${TOTAL} stories processed. Duration: ${DURATION}s."

exit 0
