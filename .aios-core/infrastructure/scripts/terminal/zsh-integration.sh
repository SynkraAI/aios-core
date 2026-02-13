#!/bin/bash
# AIOS Terminal Integration - zsh Shell Hooks
# Integrates tab title updates with zsh precmd/chpwd hooks
# Auto-loads when .aios/session.json exists

# Avoid duplicate loading
if [[ -n "$AIOS_TERMINAL_INTEGRATED" ]]; then
  return 0
fi
export AIOS_TERMINAL_INTEGRATED=1

# Detect AIOS Core path (support both installed and development modes)
if [[ -n "$AIOS_CORE_PATH" ]]; then
  AIOS_UPDATE_SCRIPT="${AIOS_CORE_PATH}/infrastructure/scripts/terminal/update-tab-title.sh"
elif [[ -d ".aios-core" ]]; then
  # Development mode (in aios-core repo)
  AIOS_UPDATE_SCRIPT=".aios-core/infrastructure/scripts/terminal/update-tab-title.sh"
elif [[ -d "$HOME/aios-core/.aios-core" ]]; then
  # Global fallback
  AIOS_UPDATE_SCRIPT="$HOME/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh"
else
  # Cannot find AIOS Core, disable integration
  unset AIOS_TERMINAL_INTEGRATED
  return 1
fi

# Verify update script exists
if [[ ! -f "$AIOS_UPDATE_SCRIPT" ]]; then
  unset AIOS_TERMINAL_INTEGRATED
  return 1
fi

# Hook: before each prompt
aios_precmd() {
  # Only run if .aios/session.json exists (fail-fast)
  if [[ -f ".aios/session.json" ]]; then
    # Source the update script (runs in subshell for isolation)
    (source "$AIOS_UPDATE_SCRIPT" 2>/dev/null) || true
  fi
}

# Hook: on directory change
aios_chpwd() {
  # Check for .aios/session.json in new directory
  if [[ -f ".aios/session.json" ]]; then
    (source "$AIOS_UPDATE_SCRIPT" 2>/dev/null) || true
  else
    # Reset title to generic when leaving AIOS project
    echo -ne "\033]0;$(basename "$PWD")\007"
  fi
}

# Register hooks (zsh-specific)
if [[ -n "$ZSH_VERSION" ]]; then
  autoload -U add-zsh-hook 2>/dev/null || return 1
  add-zsh-hook precmd aios_precmd
  add-zsh-hook chpwd aios_chpwd

  # Run once on initial load (if in AIOS project)
  aios_precmd
else
  # Not zsh, disable integration
  unset AIOS_TERMINAL_INTEGRATED
  return 1
fi
