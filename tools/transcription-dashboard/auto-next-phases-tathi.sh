#!/bin/bash
set -euo pipefail

DASH_DIR="/Users/luizfosc/aios-core/tools/transcription-dashboard"
STATUS_FILE="$DASH_DIR/transcription-status.json"
PREP_SCRIPT="$DASH_DIR/prepare-tathi-phase-manifests.sh"
ROOT="/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável"
PIPE="$ROOT/_pipeline"
LOG_DIR="$PIPE/logs"
LOG_FILE="$LOG_DIR/auto-next-phases.log"

mkdir -p "$LOG_DIR"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" | tee -a "$LOG_FILE"; }

log "Auto-next watcher started"

while true; do
  if [ ! -f "$STATUS_FILE" ]; then
    log "Status file not found yet: $STATUS_FILE"
    sleep 30
    continue
  fi

  is_running=$(jq -r '.is_running // false' "$STATUS_FILE" 2>/dev/null || echo false)
  completed=$(jq -r '.completed // 0' "$STATUS_FILE" 2>/dev/null || echo 0)
  failed=$(jq -r '.failed // 0' "$STATUS_FILE" 2>/dev/null || echo 0)
  total=$(jq -r '.total_videos // 0' "$STATUS_FILE" 2>/dev/null || echo 0)
  current=$(jq -r '.current // ""' "$STATUS_FILE" 2>/dev/null || echo "")

  log "Polling: running=$is_running completed=$completed failed=$failed total=$total current='$current'"

  if [ "$total" -gt 0 ] && [ $((completed + failed)) -ge "$total" ] && [ "$is_running" = "false" ]; then
    log "Transcription phase finished. Preparing manifests for sculpt/distill/kb..."
    bash "$PREP_SCRIPT" >> "$LOG_FILE" 2>&1

    MANI="$PIPE/manifests"
    READY="$LOG_DIR/post-phases-ready.txt"
    {
      echo "READY_AT=$(ts)"
      echo "SCULPT_COMMANDS=$MANI/sculpt-commands.txt"
      echo "DISTILL_COMMANDS=$MANI/distill-commands.txt"
      echo "KB_COMMANDS=$MANI/kb-commands.txt"
      echo
      echo "NOTE: commands are prepared and ready to execute in the AIOS agent runtime."
    } > "$READY"

    log "Post-phase manifests prepared. Ready file: $READY"
    exit 0
  fi

  sleep 60
done
