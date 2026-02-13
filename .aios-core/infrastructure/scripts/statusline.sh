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

# Extract Claude Code data
MODEL=$(echo "$INPUT" | jq -r '.model.display_name // "Unknown"')
CTX_USED=$(echo "$INPUT" | jq -r '.context_window.used_percentage // 0')
CTX_SIZE=$(echo "$INPUT" | jq -r '.context_window.context_window_size // 200000')
SESSION_COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$INPUT" | jq -r '.cost.total_duration_ms // 0')
CWD=$(echo "$INPUT" | jq -r '.cwd // ""')

# Calculate tokens used
CTX_PERCENT=${CTX_USED%.*}
TOKENS_USED=$((CTX_SIZE * CTX_PERCENT / 100))

# Format tokens (k/M)
if [ "$TOKENS_USED" -gt 1000000 ]; then
  TOKENS_FMT=$(awk "BEGIN {printf \"%.1fM\", $TOKENS_USED/1000000}")
elif [ "$TOKENS_USED" -gt 1000 ]; then
  TOKENS_FMT=$(awk "BEGIN {printf \"%.0fk\", $TOKENS_USED/1000}")
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

# Format cost
COST_FMT=$(awk "BEGIN {printf \"%.2f\", $SESSION_COST}")

# Short directory path
SHORT_CWD=$(echo "$CWD" | sed "s|$HOME|~|")

# Git branch
BRANCH=""
if [ -n "$CWD" ] && [ -d "$CWD/.git" ]; then
  BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)
fi

# CPU and RAM
TOP_OUTPUT=$(top -l 1 -n 0 2>/dev/null)
CPU=$(echo "$TOP_OUTPUT" | grep "CPU usage" | awk '{print $3}' | tr -d '%')
CPU=${CPU:-"0"}
MEM_USED=$(echo "$TOP_OUTPUT" | grep "PhysMem" | awk '{print $2}' | tr -d 'G')
MEM_TOTAL=$(sysctl -n hw.memsize 2>/dev/null | awk '{printf "%.0f", $1/1024/1024/1024}')
if [ -n "$MEM_USED" ] && [ -n "$MEM_TOTAL" ] && [ "$MEM_TOTAL" -gt 0 ]; then
  RAM_PERCENT=$(awk "BEGIN {printf \"%.0f\", ($MEM_USED / $MEM_TOTAL) * 100}")
else
  RAM_PERCENT="0"
fi

# Date and Time
DATE_FMT=$(date +"%d/%m/%y")
TIME_FMT=$(date +"%H:%M")

# === AIOS Context Integration ===
AIOS_STATE_FILE="${CWD}/.aios/session.json"
AIOS_CONTEXT=""

if [ -f "$AIOS_STATE_FILE" ]; then
  DISPLAY_TITLE=$(jq -r '.project.displayTitle // ""' "$AIOS_STATE_FILE" 2>/dev/null)
  TITLE_EMOJI=$(jq -r '.project.titleEmoji // ""' "$AIOS_STATE_FILE" 2>/dev/null)
  PROJECT_EMOJI=$(jq -r '.project.emoji // ""' "$AIOS_STATE_FILE" 2>/dev/null)
  PROJECT_NAME=$(jq -r '.project.name // ""' "$AIOS_STATE_FILE" 2>/dev/null)
  PROGRESS=$(jq -r '.status.progress // ""' "$AIOS_STATE_FILE" 2>/dev/null)
  STATUS_EMOJI=$(jq -r '.status.emoji // ""' "$AIOS_STATE_FILE" 2>/dev/null)

  # Build context (truncate if needed)
  if [ -n "$DISPLAY_TITLE" ] && [ "$DISPLAY_TITLE" != "null" ]; then
    # Prepend titleEmoji if available
    local emoji_prefix=""
    if [ -n "$TITLE_EMOJI" ] && [ "$TITLE_EMOJI" != "null" ]; then
      emoji_prefix="${TITLE_EMOJI} "
    fi

    # Truncate display title if > 35 chars (accounting for emoji)
    local max_len=35
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
