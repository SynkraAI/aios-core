#!/bin/bash
# AIOS Enhanced Status Line - TWO LINE FORMAT
# Intentional 2-line layout: keeps all info without breaking input area

export LC_NUMERIC=C

# ANSI Colors
RESET='\033[0m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
BOLD='\033[1m'

# Read JSON from Claude Code
INPUT=$(cat)

# Extract Claude Code data (single jq call for efficiency)
if command -v jq &> /dev/null; then
  eval "$(echo "$INPUT" | jq -r '
    @sh "MODEL=\(.model.display_name // "Unknown")",
    @sh "CTX_USED=\(.context_window.used_percentage // 0)",
    @sh "CTX_SIZE=\(.context_window.context_window_size // 200000)",
    @sh "SESSION_COST=\(.cost.total_cost_usd // 0)",
    @sh "DURATION_MS=\(.cost.total_duration_ms // 0)",
    @sh "CWD=\(.cwd // "")"
  ' 2>/dev/null)" || {
    MODEL="Unknown"; CTX_USED=0; CTX_SIZE=200000
    SESSION_COST=0; DURATION_MS=0; CWD=""
  }
else
  echo "jq required" >&2
  exit 1
fi

# Calculate tokens used
CTX_PERCENT=${CTX_USED%.*}
CTX_PERCENT=${CTX_PERCENT:-0}
TOKENS_USED=$((CTX_SIZE * CTX_PERCENT / 100))

# Format tokens (k/M) — using awk -v for safe variable passing
if [ "$TOKENS_USED" -gt 1000000 ]; then
  TOKENS_FMT=$(awk -v tokens="$TOKENS_USED" 'BEGIN {printf "%.1fM", tokens/1000000}')
elif [ "$TOKENS_USED" -gt 1000 ]; then
  TOKENS_FMT=$(awk -v tokens="$TOKENS_USED" 'BEGIN {printf "%.0fk", tokens/1000}')
else
  TOKENS_FMT="${TOKENS_USED}"
fi

# Format duration
DURATION_SEC=$((DURATION_MS / 1000))
DURATION_MIN=$((DURATION_SEC / 60))
DURATION_HOUR=$((DURATION_MIN / 60))
if [ "$DURATION_HOUR" -gt 0 ]; then
  DURATION_FMT="${DURATION_HOUR}h$((DURATION_MIN % 60))m"
elif [ "$DURATION_MIN" -gt 0 ]; then
  DURATION_FMT="${DURATION_MIN}m$((DURATION_SEC % 60))s"
else
  DURATION_FMT="${DURATION_SEC}s"
fi

# Format cost — using awk -v for safe variable passing
COST_FMT=$(awk -v cost="$SESSION_COST" 'BEGIN {printf "%.2f", cost}')

# Short directory path
SHORT_CWD=$(echo "$CWD" | sed "s|$HOME|~|")

# Git branch (supports worktrees where .git is a file)
BRANCH=""
if [ -n "$CWD" ] && git -C "$CWD" rev-parse --is-inside-work-tree &>/dev/null; then
  BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)
fi

# CPU and RAM — cross-platform detection
CPU="0"
RAM_PERCENT="0"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: use ps for CPU (fast) and sysctl/vm_stat for RAM
  CPU=$(ps -A -o %cpu | awk '{s+=$1} END {printf "%.0f", s}' 2>/dev/null || echo "0")
  # Cap at 100 per core, show as aggregate percentage
  MEM_TOTAL_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
  if [ "$MEM_TOTAL_BYTES" -gt 0 ]; then
    # Get page size and pages from vm_stat (fast, no sampling delay)
    PAGE_SIZE=$(sysctl -n hw.pagesize 2>/dev/null || echo "4096")
    PAGES_ACTIVE=$(vm_stat 2>/dev/null | awk '/Pages active/ {gsub(/\./,"",$3); print $3}')
    PAGES_WIRED=$(vm_stat 2>/dev/null | awk '/Pages wired/ {gsub(/\./,"",$4); print $4}')
    PAGES_ACTIVE=${PAGES_ACTIVE:-0}
    PAGES_WIRED=${PAGES_WIRED:-0}
    MEM_USED_BYTES=$(( (PAGES_ACTIVE + PAGES_WIRED) * PAGE_SIZE ))
    RAM_PERCENT=$(awk -v used="$MEM_USED_BYTES" -v total="$MEM_TOTAL_BYTES" \
      'BEGIN {printf "%.0f", (used / total) * 100}')
  fi
elif [[ "$OSTYPE" == "linux"* ]]; then
  # Linux: /proc/stat for CPU, /proc/meminfo for RAM
  CPU=$(awk '/^cpu / {usage=100-($5*100/($2+$3+$4+$5+$6+$7+$8)); printf "%.0f", usage}' \
    /proc/stat 2>/dev/null || echo "0")
  MEM_INFO=$(awk '/MemTotal/ {total=$2} /MemAvailable/ {avail=$2} END {if(total>0) printf "%.0f", ((total-avail)/total)*100; else print "0"}' \
    /proc/meminfo 2>/dev/null)
  RAM_PERCENT="${MEM_INFO:-0}"
fi

# Date and Time
DATE_FMT=$(date +"%d/%m/%y")
TIME_FMT=$(date +"%H:%M")

# === AIOS Context Integration ===
AIOS_STATE_FILE="${CWD}/.aios/session.json"
AIOS_CONTEXT=""

if [ -f "$AIOS_STATE_FILE" ]; then
  # Single jq call for all AIOS fields
  eval "$(jq -r '
    @sh "DISPLAY_TITLE=\(.project.displayTitle // "")",
    @sh "TITLE_EMOJI=\(.project.titleEmoji // "")",
    @sh "PROJECT_EMOJI=\(.project.emoji // "")",
    @sh "PROJECT_NAME=\(.project.name // "")",
    @sh "PROGRESS=\(.status.progress // "")",
    @sh "STATUS_EMOJI=\(.status.emoji // "")"
  ' "$AIOS_STATE_FILE" 2>/dev/null)" || true

  # Build context (truncate if needed)
  if [ -n "$DISPLAY_TITLE" ] && [ "$DISPLAY_TITLE" != "null" ]; then
    emoji_prefix=""
    if [ -n "$TITLE_EMOJI" ] && [ "$TITLE_EMOJI" != "null" ]; then
      emoji_prefix="${TITLE_EMOJI} "
    fi

    # Truncate display title if > 35 chars
    max_len=35
    if [ ${#DISPLAY_TITLE} -gt $max_len ]; then
      AIOS_CONTEXT="${emoji_prefix}${DISPLAY_TITLE:0:32}..."
    else
      AIOS_CONTEXT="${emoji_prefix}${DISPLAY_TITLE}"
    fi
  elif [ -n "$PROJECT_NAME" ] && [ "$PROJECT_NAME" != "null" ]; then
    AIOS_CONTEXT="${PROJECT_EMOJI} ${PROJECT_NAME}"
  fi

  # Add progress
  if [ -n "$PROGRESS" ] && [ "$PROGRESS" != "null" ]; then
    AIOS_CONTEXT="${AIOS_CONTEXT} [${PROGRESS}]"
  fi

  # Add status emoji
  if [ -n "$STATUS_EMOJI" ] && [ "$STATUS_EMOJI" != "null" ]; then
    AIOS_CONTEXT="${AIOS_CONTEXT} ${STATUS_EMOJI}"
  fi
fi

# === Visual Progress Bar (10 blocks) ===
BLOCKS_TOTAL=10
BLOCKS_FILLED=$((CTX_PERCENT * BLOCKS_TOTAL / 100))
BLOCKS_EMPTY=$((BLOCKS_TOTAL - BLOCKS_FILLED))

# Choose color
if [ "$CTX_PERCENT" -gt 80 ]; then
  BAR_COLOR=$RED
elif [ "$CTX_PERCENT" -gt 50 ]; then
  BAR_COLOR=$YELLOW
else
  BAR_COLOR=$GREEN
fi

# Build progress bar
PROGRESS_BAR="${BAR_COLOR}"
for ((i=0; i<BLOCKS_FILLED; i++)); do
  PROGRESS_BAR="${PROGRESS_BAR}█"
done
PROGRESS_BAR="${PROGRESS_BAR}${GRAY}"
for ((i=0; i<BLOCKS_EMPTY; i++)); do
  PROGRESS_BAR="${PROGRESS_BAR}░"
done
PROGRESS_BAR="${PROGRESS_BAR}${RESET}"

# === TWO LINE FORMAT ===
# Line 1: Model | Progress | Cost/Time | AIOS Context
LINE1="🤖 ${CYAN}${MODEL}${RESET} | ${PROGRESS_BAR} ${BOLD}${CTX_PERCENT}%${RESET} ${TOKENS_FMT} | 💰 ${YELLOW}\$${COST_FMT}${RESET} ⏱ ${DURATION_FMT}"

if [ -n "$AIOS_CONTEXT" ]; then
  LINE1="${LINE1} | ${BOLD}${AIOS_CONTEXT}${RESET}"
fi

# Line 2: Directory:Branch | CPU/RAM | Date/Time
LINE2="📁 ${BLUE}${SHORT_CWD}"
if [ -n "$BRANCH" ]; then
  LINE2="${LINE2}:${BRANCH}"
fi
LINE2="${LINE2}${RESET} | 💻 ${CPU}%/${RAM_PERCENT}% | 📅 ${DATE_FMT} 🕐 ${TIME_FMT}"

# Output: Two lines
echo -e "${LINE1}\n${LINE2}"
