#!/bin/bash
# AIOS Terminal Integration - Tab Title Updater
# Updates terminal tab title via ANSI OSC sequences based on session context
# Performance target: <20ms execution time

set -euo pipefail

# ANSI OSC 0 = set window + tab title
set_tab_title() {
  local title="$1"
  # OSC 0 sets both window and tab title
  # Format: ESC ] 0 ; title BEL
  echo -ne "\033]0;${title}\007"
}

# Parse JSON using jq (preferred) or grep fallback
parse_json_field() {
  local file="$1"
  local field="$2"
  local default="${3:-}"

  if command -v jq &> /dev/null; then
    jq -r "${field} // \"${default}\"" "$file" 2>/dev/null || echo "$default"
  else
    # Fallback: grep-based parsing
    grep -o "\"$(basename "$field")\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$file" 2>/dev/null | \
      head -1 | \
      cut -d'"' -f4 || echo "$default"
  fi
}

# Main update logic
update_from_state() {
  local state_file=".aios/session.json"

  # Fail-fast if not AIOS project (zero overhead for non-AIOS)
  if [[ ! -f "$state_file" ]]; then
    return 0
  fi

  # Parse session context
  if command -v jq &> /dev/null; then
    local emoji=$(jq -r '.project.emoji // "📦"' "$state_file" 2>/dev/null)
    local name=$(jq -r '.project.name // "project"' "$state_file" 2>/dev/null)
    local progress=$(jq -r '.status.progress // ""' "$state_file" 2>/dev/null)
    local status_emoji=$(jq -r '.status.emoji // ""' "$state_file" 2>/dev/null)
    local phase=$(jq -r '.status.phase // ""' "$state_file" 2>/dev/null)
  else
    # Fallback: grep-based parsing (slower but works without jq)
    local emoji=$(parse_json_field "$state_file" ".project.emoji" "📦")
    local name=$(parse_json_field "$state_file" ".project.name" "project")
    local progress=$(parse_json_field "$state_file" ".status.progress" "")
    local status_emoji=$(parse_json_field "$state_file" ".status.emoji" "")
    local phase=$(parse_json_field "$state_file" ".status.phase" "")
  fi

  # Build title: {emoji} {name} [{progress}] {status_emoji}
  local title="${emoji} ${name}"

  # Add progress if available
  if [[ -n "$progress" && "$progress" != "null" ]]; then
    title="${title} [${progress}]"
  fi

  # Add status emoji if available
  if [[ -n "$status_emoji" && "$status_emoji" != "null" ]]; then
    title="${title} ${status_emoji}"
  fi

  # Add phase hint if available (optional, space permitting)
  if [[ -n "$phase" && "$phase" != "null" && ${#title} -lt 50 ]]; then
    title="${title} · ${phase}"
  fi

  # Update terminal tab title
  set_tab_title "$title"
}

# Execute update
update_from_state
