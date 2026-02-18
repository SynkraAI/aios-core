#!/bin/bash
# Synkra AIOS Statusline — Merged (AIOS + Universal)
# Layout: 2 lines
# Line 1: Model | Progress bar + % + tokens | $cost + duration | squad > agent | AIOS context
# Line 2: repo/subpath:branch Nf +A -D | CPU%/RAM% | date time

export LC_NUMERIC=C

# ── Colors (256-color palette) ──────────────────────────────────────────────
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[38;5;81m'
CYAN_BOLD='\033[1;38;5;81m'
YELLOW='\033[38;5;220m'
GREEN='\033[38;5;114m'
RED='\033[38;5;203m'
BLUE='\033[38;5;111m'
ORANGE='\033[38;5;208m'
GRAY='\033[38;5;242m'
WHITE='\033[38;5;252m'

# ── Read stdin JSON ─────────────────────────────────────────────────────────
INPUT=$(cat)

if ! command -v jq &>/dev/null; then
  echo "jq required" >&2
  exit 1
fi

# Single jq call — extract all Claude Code fields
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

# ── Token calculations ──────────────────────────────────────────────────────
CTX_PERCENT=${CTX_USED%.*}
CTX_PERCENT=${CTX_PERCENT:-0}
TOKENS_USED=$((CTX_SIZE * CTX_PERCENT / 100))

if [ "$TOKENS_USED" -gt 1000000 ]; then
  TOKENS_FMT=$(awk -v t="$TOKENS_USED" 'BEGIN {printf "%.1fM", t/1000000}')
elif [ "$TOKENS_USED" -gt 1000 ]; then
  TOKENS_FMT=$(awk -v t="$TOKENS_USED" 'BEGIN {printf "%.0fk", t/1000}')
else
  TOKENS_FMT="${TOKENS_USED}"
fi

# ── Cost + Duration ─────────────────────────────────────────────────────────
COST_FMT=$(awk -v c="$SESSION_COST" 'BEGIN {printf "%.2f", c}')

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

# ── Project name: repo/subpath (Universal style) ───────────────────────────
REPO_PATH=""
if [ -n "$CWD" ] && git -C "$CWD" rev-parse --is-inside-work-tree &>/dev/null; then
  GIT_ROOT=$(git -C "$CWD" rev-parse --show-toplevel 2>/dev/null)
  REPO_NAME=$(basename "$GIT_ROOT")
  # If CWD is deeper than root, show subpath
  if [ "$CWD" != "$GIT_ROOT" ]; then
    SUBPATH="${CWD#"$GIT_ROOT"/}"
    # Truncate deep subpaths: show only first dir
    SUBDIR=$(echo "$SUBPATH" | cut -d'/' -f1)
    if [ "$SUBDIR" != "$SUBPATH" ]; then
      REPO_PATH="${REPO_NAME}/${SUBDIR}"
    else
      REPO_PATH="${REPO_NAME}/${SUBPATH}"
    fi
  else
    REPO_PATH="${REPO_NAME}"
  fi
fi

# ── Git branch ──────────────────────────────────────────────────────────────
BRANCH=""
if [ -n "$CWD" ] && git -C "$CWD" rev-parse --is-inside-work-tree &>/dev/null; then
  BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)
  # Detached HEAD fallback
  if [ -z "$BRANCH" ]; then
    BRANCH=$(git -C "$CWD" rev-parse --short HEAD 2>/dev/null)
  fi
fi

# ── Git changes ─────────────────────────────────────────────────────────────
GIT_CHANGES=""
if [ -n "$CWD" ] && git -C "$CWD" rev-parse --is-inside-work-tree &>/dev/null; then
  # Combine staged + unstaged numstat
  NUMSTAT=$(git -C "$CWD" diff --numstat 2>/dev/null; git -C "$CWD" diff --cached --numstat 2>/dev/null)
  if [ -n "$NUMSTAT" ]; then
    FILES_CHANGED=$(echo "$NUMSTAT" | wc -l | tr -d ' ')
    ADDITIONS=$(echo "$NUMSTAT" | awk '{s+=$1} END {printf "%d", s}')
    DELETIONS=$(echo "$NUMSTAT" | awk '{s+=$2} END {printf "%d", s}')
    GIT_CHANGES="${WHITE}${FILES_CHANGED}f${RESET}"
    if [ "$ADDITIONS" -gt 0 ]; then
      GIT_CHANGES="${GIT_CHANGES} ${GREEN}+${ADDITIONS}${RESET}"
    fi
    if [ "$DELETIONS" -gt 0 ]; then
      GIT_CHANGES="${GIT_CHANGES} ${RED}-${DELETIONS}${RESET}"
    fi
  fi
fi

# ── CPU / RAM (cross-platform) ──────────────────────────────────────────────
CPU="0"
RAM_PERCENT="0"

if [[ "$OSTYPE" == "darwin"* ]]; then
  CPU=$(ps -A -o %cpu | awk '{s+=$1} END {printf "%.0f", s}' 2>/dev/null || echo "0")
  MEM_TOTAL_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
  if [ "$MEM_TOTAL_BYTES" -gt 0 ]; then
    PAGE_SIZE=$(sysctl -n hw.pagesize 2>/dev/null || echo "4096")
    PAGES_ACTIVE=$(vm_stat 2>/dev/null | awk '/Pages active/ {gsub(/\./,"",$3); print $3}')
    PAGES_WIRED=$(vm_stat 2>/dev/null | awk '/Pages wired/ {gsub(/\./,"",$4); print $4}')
    PAGES_ACTIVE=${PAGES_ACTIVE:-0}
    PAGES_WIRED=${PAGES_WIRED:-0}
    MEM_USED_BYTES=$(( (PAGES_ACTIVE + PAGES_WIRED) * PAGE_SIZE ))
    RAM_PERCENT=$(awk -v u="$MEM_USED_BYTES" -v t="$MEM_TOTAL_BYTES" \
      'BEGIN {printf "%.0f", (u / t) * 100}')
  fi
elif [[ "$OSTYPE" == "linux"* ]]; then
  CPU=$(awk '/^cpu / {usage=100-($5*100/($2+$3+$4+$5+$6+$7+$8)); printf "%.0f", usage}' \
    /proc/stat 2>/dev/null || echo "0")
  RAM_PERCENT=$(awk '/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {if(t>0) printf "%.0f", ((t-a)/t)*100; else print "0"}' \
    /proc/meminfo 2>/dev/null)
  RAM_PERCENT="${RAM_PERCENT:-0}"
fi

# ── Date / Time ─────────────────────────────────────────────────────────────
DATE_FMT=$(date +"%d/%m")
TIME_FMT=$(date +"%H:%M")

# ── AIOS session.json ───────────────────────────────────────────────────────
AIOS_STATE_FILE="${CWD}/.aios/session.json"
AIOS_CONTEXT=""
SESSION_AGENT=""

if [ -f "$AIOS_STATE_FILE" ]; then
  eval "$(jq -r '
    @sh "DISPLAY_TITLE=\(.project.displayTitle // "")",
    @sh "TITLE_EMOJI=\(.project.titleEmoji // "")",
    @sh "PROGRESS=\(.status.progress // "")",
    @sh "STATUS_EMOJI=\(.status.emoji // "")",
    @sh "SESSION_AGENT=\(.activeAgent.id // "")"
  ' "$AIOS_STATE_FILE" 2>/dev/null)" || true

  # Build AIOS context string
  if [ -n "$DISPLAY_TITLE" ] && [ "$DISPLAY_TITLE" != "null" ]; then
    ctx_prefix=""
    if [ -n "$TITLE_EMOJI" ] && [ "$TITLE_EMOJI" != "null" ]; then
      ctx_prefix="${TITLE_EMOJI} "
    fi
    if [ ${#DISPLAY_TITLE} -gt 30 ]; then
      AIOS_CONTEXT="${ctx_prefix}${DISPLAY_TITLE:0:27}..."
    else
      AIOS_CONTEXT="${ctx_prefix}${DISPLAY_TITLE}"
    fi
  fi

  # Append progress
  if [ -n "$PROGRESS" ] && [ "$PROGRESS" != "null" ]; then
    AIOS_CONTEXT="${AIOS_CONTEXT} [${PROGRESS}]"
  fi

  # Append status emoji
  if [ -n "$STATUS_EMOJI" ] && [ "$STATUS_EMOJI" != "null" ]; then
    AIOS_CONTEXT="${AIOS_CONTEXT} ${STATUS_EMOJI}"
  fi
fi

# ── Squad/Agent via hook cache ──────────────────────────────────────────────
HOOK_AGENT=""
HOOK_SQUAD=""
CACHE_DIR="$HOME/.claude/session-cache"

if [ -d "$CACHE_DIR" ]; then
  # Walk PIDs: current -> parent -> grandparent (max 10 hops)
  CHECK_PID=$$
  HOPS=0
  while [ "$HOPS" -lt 10 ] && [ "$CHECK_PID" -gt 1 ]; do
    if [ -f "$CACHE_DIR/agent-${CHECK_PID}.json" ]; then
      HOOK_AGENT=$(jq -r '.agent // ""' "$CACHE_DIR/agent-${CHECK_PID}.json" 2>/dev/null)
      break
    fi
    CHECK_PID=$(ps -o ppid= -p "$CHECK_PID" 2>/dev/null | tr -d ' ')
    HOPS=$((HOPS + 1))
  done

  # Same walk for squad
  CHECK_PID=$$
  HOPS=0
  while [ "$HOPS" -lt 10 ] && [ "$CHECK_PID" -gt 1 ]; do
    if [ -f "$CACHE_DIR/squad-${CHECK_PID}.json" ]; then
      HOOK_SQUAD=$(jq -r '.squad // ""' "$CACHE_DIR/squad-${CHECK_PID}.json" 2>/dev/null)
      break
    fi
    CHECK_PID=$(ps -o ppid= -p "$CHECK_PID" 2>/dev/null | tr -d ' ')
    HOPS=$((HOPS + 1))
  done
fi

# Agent priority: hook cache > session.json > empty
# If hook says "idle" (empty file exists but agent is blank), respect that
ACTIVE_AGENT=""
if [ -n "$HOOK_AGENT" ]; then
  ACTIVE_AGENT="$HOOK_AGENT"
elif [ -n "$SESSION_AGENT" ] && [ "$SESSION_AGENT" != "null" ]; then
  ACTIVE_AGENT="$SESSION_AGENT"
fi

ACTIVE_SQUAD=""
if [ -n "$HOOK_SQUAD" ]; then
  ACTIVE_SQUAD="$HOOK_SQUAD"
fi

# ── Progress bar (10 blocks) ───────────────────────────────────────────────
BLOCKS=10
FILLED=$((CTX_PERCENT * BLOCKS / 100))
EMPTY=$((BLOCKS - FILLED))

if [ "$CTX_PERCENT" -gt 80 ]; then
  BAR_COLOR=$RED
elif [ "$CTX_PERCENT" -gt 50 ]; then
  BAR_COLOR=$YELLOW
else
  BAR_COLOR=$GREEN
fi

PROGRESS_BAR="${BAR_COLOR}"
for ((i=0; i<FILLED; i++)); do PROGRESS_BAR+="█"; done
PROGRESS_BAR+="${GRAY}"
for ((i=0; i<EMPTY; i++)); do PROGRESS_BAR+="░"; done
PROGRESS_BAR+="${RESET}"

# ── Build Line 1 ───────────────────────────────────────────────────────────
LINE1="${CYAN_BOLD}${MODEL}${RESET}"
LINE1+=" | ${PROGRESS_BAR} ${BOLD}${CTX_PERCENT}%${RESET} ${TOKENS_FMT}"
LINE1+=" | ${YELLOW}\$${COST_FMT}${RESET} ${DIM}${DURATION_FMT}${RESET}"

# Squad > Agent section (conditional)
if [ -n "$ACTIVE_SQUAD" ] || [ -n "$ACTIVE_AGENT" ]; then
  LINE1+=" |"
  if [ -n "$ACTIVE_SQUAD" ]; then
    LINE1+=" ${ORANGE}${ACTIVE_SQUAD}${RESET}"
    if [ -n "$ACTIVE_AGENT" ]; then
      LINE1+=" ${GRAY}>${RESET} ${CYAN}${ACTIVE_AGENT}${RESET}"
    fi
  else
    LINE1+=" ${CYAN}${ACTIVE_AGENT}${RESET}"
  fi
fi

# AIOS context (conditional)
if [ -n "$AIOS_CONTEXT" ]; then
  LINE1+=" | ${BOLD}${AIOS_CONTEXT}${RESET}"
fi

# ── Build Line 2 ───────────────────────────────────────────────────────────
# repo/subpath:branch
if [ -n "$REPO_PATH" ]; then
  LINE2="${BLUE}${REPO_PATH}"
else
  LINE2="${BLUE}$(basename "$CWD")"
fi
if [ -n "$BRANCH" ]; then
  LINE2+=":${BRANCH}"
fi
LINE2+="${RESET}"

# Git changes (conditional)
if [ -n "$GIT_CHANGES" ]; then
  LINE2+=" ${GIT_CHANGES}"
fi

# CPU/RAM | Date Time
LINE2+=" | ${CPU}%/${RAM_PERCENT}% | ${DATE_FMT} ${TIME_FMT}"

# ── Output ──────────────────────────────────────────────────────────────────
echo -e "${LINE1}\n${LINE2}"
