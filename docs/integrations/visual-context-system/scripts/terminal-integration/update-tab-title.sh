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
    local display_title=$(jq -r '.project.displayTitle // ""' "$state_file" 2>/dev/null)
    local title_emoji=$(jq -r '.project.titleEmoji // ""' "$state_file" 2>/dev/null)
    local emoji=$(jq -r '.project.emoji // "📦"' "$state_file" 2>/dev/null)
    local name=$(jq -r '.project.name // "project"' "$state_file" 2>/dev/null)
    local progress=$(jq -r '.status.progress // ""' "$state_file" 2>/dev/null)
    local status_emoji=$(jq -r '.status.emoji // ""' "$state_file" 2>/dev/null)
    local phase=$(jq -r '.status.phase // ""' "$state_file" 2>/dev/null)
  else
    # Fallback: grep-based parsing (slower but works without jq)
    local display_title=$(parse_json_field "$state_file" ".project.displayTitle" "")
    local title_emoji=$(parse_json_field "$state_file" ".project.titleEmoji" "")
    local emoji=$(parse_json_field "$state_file" ".project.emoji" "📦")
    local name=$(parse_json_field "$state_file" ".project.name" "project")
    local progress=$(parse_json_field "$state_file" ".status.progress" "")
    local status_emoji=$(parse_json_field "$state_file" ".status.emoji" "")
    local phase=$(parse_json_field "$state_file" ".status.phase" "")
  fi

  # Check if there's a locked display title
  local title=""

  if [[ -n "$display_title" && "$display_title" != "null" && "$display_title" != "" ]]; then
    # Use fixed display title (locked mode)
    # Prepend titleEmoji if available
    if [[ -n "$title_emoji" && "$title_emoji" != "null" && "$title_emoji" != "" ]]; then
      title="${title_emoji} ${display_title}"
    else
      title="${display_title}"
    fi
  else
    # Build dynamic title: {emoji} {name} [{progress}] {status_emoji}
    title="${emoji} ${name}"

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
  fi

  # Update terminal tab title
  set_tab_title "$title"
}

# Execute update
update_from_state
