#!/bin/bash
set -euo pipefail

ROOT="/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável"
CLAUDE_BIN="/Users/luizfosc/.local/bin/claude"
MANI="$ROOT/_pipeline/manifests"
LOG_DIR="$ROOT/_pipeline/logs"
STATE_DIR="$ROOT/_pipeline/state"
mkdir -p "$LOG_DIR" "$STATE_DIR"

SCULPT_CMDS="$MANI/sculpt-commands.txt"
DISTILL_CMDS="$MANI/distill-commands.txt"
KB_CMDS="$MANI/kb-commands.txt"

SCULPT_STATE="$STATE_DIR/sculpt.index"
DISTILL_STATE="$STATE_DIR/distill.index"
KB_STATE="$STATE_DIR/kb.done"

MAIN_LOG="$LOG_DIR/post-phases-runner.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" | tee -a "$MAIN_LOG"; }

run_cmd() {
  local phase="$1"
  local n="$2"
  local cmd="$3"
  local out="$LOG_DIR/${phase}-$(printf '%03d' "$n").log"

  log "${phase} #$n START"
  # Guard against hanging CLI calls with a hard timeout (~3 min)
  set +e
  "$CLAUDE_BIN" -p "$cmd" --permission-mode bypassPermissions --output-format text > "$out" 2>&1 &
  cpid=$!
  waited=0
  rc=0
  while kill -0 "$cpid" >/dev/null 2>&1; do
    sleep 2
    waited=$((waited+2))
    if [ "$waited" -ge 180 ]; then
      kill -TERM "$cpid" >/dev/null 2>&1 || true
      sleep 1
      kill -KILL "$cpid" >/dev/null 2>&1 || true
      rc=124
      break
    fi
  done
  if [ "$rc" -ne 124 ]; then
    wait "$cpid"
    rc=$?
  fi
  set -e

  if grep -E "hit your limit|resets 2pm" "$out" >/dev/null 2>&1; then
    log "${phase} #$n QUOTA_LIMIT. Waiting until 14:05 America/Sao_Paulo"
    return 99
  fi

  if [ "$rc" -eq 124 ]; then
    log "${phase} #$n TIMEOUT after 180s. Retrying in 5 min"
    return 98
  fi

  if [ $rc -ne 0 ]; then
    log "${phase} #$n FAILED rc=$rc (see $out)"
    return $rc
  fi

  log "${phase} #$n OK"
  return 0
}

wait_until_reset() {
  while true; do
    # Compare current Sao Paulo hour/minute
    hm=$(TZ=America/Sao_Paulo date +%H%M)
    if [ "$hm" -ge 1405 ]; then
      break
    fi
    sleep 300
  done
}

run_phase_file() {
  local phase="$1"
  local file="$2"
  local state="$3"

  [ -f "$file" ] || { log "Missing file for $phase: $file"; return 1; }
  total=$(wc -l < "$file" | tr -d ' ')
  idx=1
  if [ -f "$state" ]; then
    idx=$(cat "$state")
  fi

  log "$phase phase start: idx=$idx total=$total"
  n=0
  while IFS= read -r cmd; do
    n=$((n+1))
    [ $n -lt $idx ] && continue
    [ -z "$cmd" ] && continue

    while true; do
      if run_cmd "$phase" "$n" "$cmd"; then
        echo $((n+1)) > "$state"
        break
      else
        rc=$?
        if [ "$rc" -eq 99 ]; then
          wait_until_reset
          continue
        fi
        if [ "$rc" -eq 98 ]; then
          sleep 300
          continue
        fi
        log "$phase #$n hard fail, stopping"
        return 1
      fi
    done
  done < "$file"

  log "$phase phase complete"
}

log "Post phases runner started"
run_phase_file "sculpt" "$SCULPT_CMDS" "$SCULPT_STATE"
run_phase_file "distill" "$DISTILL_CMDS" "$DISTILL_STATE"

if [ ! -f "$KB_STATE" ]; then
  kb_cmd=$(head -n 1 "$KB_CMDS")
  while true; do
    if run_cmd "kb" 1 "$kb_cmd"; then
      echo "done" > "$KB_STATE"
      break
    else
      rc=$?
      if [ "$rc" -eq 99 ]; then
        wait_until_reset
        continue
      fi
      if [ "$rc" -eq 98 ]; then
        sleep 300
        continue
      fi
      log "kb hard fail"
      exit 1
    fi
  done
fi

log "All post phases complete"
