#!/bin/bash

# Claude Status Monitor - Detects when Claude is waiting for input
# Usage: ./monitor-claude-status.sh
#        Run in background: ./monitor-claude-status.sh &

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATUS_FILE="${PROJECT_ROOT}/.aios/claude-status.json"
LOG_FILE="${PROJECT_ROOT}/.aios/logs/status-monitor.log"
CHECK_INTERVAL=2  # seconds
IDLE_TIMEOUT=30   # seconds without activity = idle

# Create directories if they don't exist
mkdir -p "$(dirname "$STATUS_FILE")"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Update status file
update_status() {
    local state=$1
    local message=${2:-""}
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    cat > "$STATUS_FILE" << EOF
{
  "state": "$state",
  "timestamp": "$timestamp",
  "lastActivity": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "message": "$message",
  "pid": $CLAUDE_PID,
  "context": ""
}
EOF
    log "Status updated: $state - $message"
}

# Find Claude Code process
find_claude_process() {
    # Try to find Claude Code CLI process
    # This might need adjustment based on how Claude Code runs
    pgrep -f "claude.*code" | head -1 || echo ""
}

# Check if Claude is waiting for input
check_if_waiting() {
    local pid=$1

    # Method 1: Check if process has open file descriptors waiting for input
    if [ -n "$pid" ]; then
        # Check if stdin is waiting (process is blocking on read)
        if lsof -p "$pid" 2>/dev/null | grep -q "FIFO\|pipe\|stdin"; then
            # Additional check: no recent CPU activity
            local cpu_usage=$(ps -p "$pid" -o %cpu | tail -1 | xargs)
            if (( $(echo "$cpu_usage < 5" | bc -l) )); then
                return 0  # Waiting
            fi
        fi
    fi

    return 1  # Not waiting
}

# Main monitoring loop
main() {
    log "Claude Status Monitor started"
    log "Monitoring interval: ${CHECK_INTERVAL}s"
    log "Status file: $STATUS_FILE"

    local last_activity=$(date +%s)
    local current_state="idle"

    # Initialize status
    update_status "idle" "Monitor iniciado - aguardando atividade do Claude"

    while true; do
        CLAUDE_PID=$(find_claude_process)

        if [ -z "$CLAUDE_PID" ]; then
            # No Claude process found
            if [ "$current_state" != "idle" ]; then
                update_status "idle" "Claude Code não está rodando"
                current_state="idle"
            fi
        else
            # Claude process found
            if check_if_waiting "$CLAUDE_PID"; then
                # Claude is waiting for input
                if [ "$current_state" != "waiting" ]; then
                    update_status "waiting" "⚠️ Claude está aguardando sua resposta"
                    current_state="waiting"
                fi
            else
                # Claude is running
                if [ "$current_state" != "running" ]; then
                    update_status "running" "✓ Claude está executando tasks"
                    current_state="running"
                fi
                last_activity=$(date +%s)
            fi

            # Check for idle timeout
            local now=$(date +%s)
            local idle_time=$((now - last_activity))

            if [ $idle_time -gt $IDLE_TIMEOUT ] && [ "$current_state" == "running" ]; then
                update_status "idle" "Sem atividade nos últimos ${IDLE_TIMEOUT}s"
                current_state="idle"
            fi
        fi

        sleep "$CHECK_INTERVAL"
    done
}

# Cleanup on exit
cleanup() {
    log "Monitor stopped"
    update_status "idle" "Monitor parado"
    exit 0
}

trap cleanup INT TERM

# Run
main
