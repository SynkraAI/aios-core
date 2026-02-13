#!/bin/bash
# AIOS Terminal Integration - Prompt Injector
# Customizes PS1 to show session context inline
# Performance target: <5ms overhead per prompt

# ANSI color codes
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Generate prompt component from session context
aios_prompt() {
  local state_file=".aios/session.json"

  # Return empty if not AIOS project (zero overhead)
  if [[ ! -f "$state_file" ]]; then
    return 0
  fi

  # Quick check if jq is available
  if ! command -v jq &> /dev/null; then
    # Fallback: minimal parsing without jq
    local name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$state_file" 2>/dev/null | head -1 | cut -d'"' -f4)
    if [[ -n "$name" ]]; then
      echo -e "${CYAN}${name}${RESET}"
    fi
    return 0
  fi

  # Parse session context (with jq)
  local emoji=$(jq -r '.project.emoji // ""' "$state_file" 2>/dev/null)
  local name=$(jq -r '.project.name // ""' "$state_file" 2>/dev/null)
  local status_emoji=$(jq -r '.status.emoji // ""' "$state_file" 2>/dev/null)
  local progress=$(jq -r '.status.progress // ""' "$state_file" 2>/dev/null)
  local phase=$(jq -r '.status.phase // ""' "$state_file" 2>/dev/null)

  # Build prompt output
  local output=""

  # Add project emoji + name
  if [[ -n "$emoji" && "$emoji" != "null" ]]; then
    output="${emoji}"
  fi

  if [[ -n "$name" && "$name" != "null" ]]; then
    output="${output} ${name}"
  fi

  # Add status emoji
  if [[ -n "$status_emoji" && "$status_emoji" != "null" ]]; then
    output="${output} ${status_emoji}"
  fi

  # Add progress (color-coded)
  if [[ -n "$progress" && "$progress" != "null" ]]; then
    # Parse progress to determine color
    if [[ "$progress" =~ ^([0-9]+)/([0-9]+)$ ]]; then
      local current="${BASH_REMATCH[1]}"
      local total="${BASH_REMATCH[2]}"

      # Avoid division by zero
      if [[ $total -gt 0 ]]; then
        local percent=$((current * 100 / total))

        # Color code based on completion
        if [[ $percent -eq 100 ]]; then
          output="${output} ${GREEN}[${progress}]${CYAN}"
        elif [[ $percent -ge 60 ]]; then
          output="${output} ${YELLOW}[${progress}]${CYAN}"
        else
          output="${output} [${progress}]"
        fi
      else
        # If total is 0, just show progress without color
        output="${output} [${progress}]"
      fi
    else
      output="${output} [${progress}]"
    fi
  fi

  # Output with color (if not empty)
  if [[ -n "$output" ]]; then
    echo -e "${CYAN}${output}${RESET} "
  fi
}

# Optional: Auto-integrate into PS1
# Uncomment and add to ~/.zshrc to enable:
#
# export PS1='$(aios_prompt)%~ %# '
#
# Or for more complex prompts:
# export PS1='$(aios_prompt)%F{blue}%~%f %# '
