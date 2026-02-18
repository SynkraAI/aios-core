#!/bin/bash
# Uninstall Synkra AIOS Statusline
# Removes scripts, hook entry, and cache — preserves settings.json

set -e

CLAUDE_DIR="$HOME/.claude"
SETTINGS="$CLAUDE_DIR/settings.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()  { echo -e "${CYAN}[INFO]${RESET} $1"; }
ok()    { echo -e "${GREEN}[OK]${RESET} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${RESET} $1"; }

echo -e "${BOLD}Synkra AIOS Statusline Uninstaller${RESET}"
echo "────────────────────────────────────"

# ── Remove statusline.sh ───────────────────────────────────────────────────
if [ -f "$CLAUDE_DIR/statusline.sh" ]; then
  rm "$CLAUDE_DIR/statusline.sh"
  ok "Removed statusline.sh"
else
  info "statusline.sh not found (already removed)"
fi

# ── Remove track-agent.sh ──────────────────────────────────────────────────
if [ -f "$CLAUDE_DIR/hooks/track-agent.sh" ]; then
  rm "$CLAUDE_DIR/hooks/track-agent.sh"
  ok "Removed track-agent.sh"
else
  info "track-agent.sh not found (already removed)"
fi

# ── Clean session-cache ────────────────────────────────────────────────────
if [ -d "$CLAUDE_DIR/session-cache" ]; then
  rm -rf "$CLAUDE_DIR/session-cache"
  ok "Removed session-cache/"
else
  info "session-cache/ not found"
fi

# ── Remove statusLine from settings.json ───────────────────────────────────
if [ -f "$SETTINGS" ] && command -v jq &>/dev/null; then
  # Remove statusLine key
  HAS_STATUSLINE=$(jq 'has("statusLine")' "$SETTINGS" 2>/dev/null || echo "false")
  if [ "$HAS_STATUSLINE" = "true" ]; then
    UPDATED=$(jq 'del(.statusLine)' "$SETTINGS")
    echo "$UPDATED" > "$SETTINGS"
    ok "Removed statusLine from settings.json"
  fi

  # Remove only our hook from UserPromptSubmit (preserve others)
  HOOK_CMD="$HOME/.claude/hooks/track-agent.sh"
  HAS_HOOKS=$(jq '.hooks.UserPromptSubmit // [] | length' "$SETTINGS" 2>/dev/null || echo "0")
  if [ "$HAS_HOOKS" -gt 0 ]; then
    UPDATED=$(jq --arg cmd "$HOOK_CMD" '
      .hooks.UserPromptSubmit = ([.hooks.UserPromptSubmit[] | select(.command != $cmd)])
      | if (.hooks.UserPromptSubmit | length) == 0 then del(.hooks.UserPromptSubmit) else . end
      | if (.hooks | length) == 0 then del(.hooks) else . end
    ' "$SETTINGS")
    echo "$UPDATED" > "$SETTINGS"
    ok "Removed hook from settings.json"
  fi
else
  warn "Could not update settings.json (jq not found or file missing)"
fi

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Uninstall complete!${RESET}"
echo "────────────────────────────────────"
echo -e "  ${GREEN}Scripts removed${RESET}"
echo -e "  ${GREEN}Hook removed${RESET}"
echo -e "  ${GREEN}Cache cleaned${RESET}"
echo -e "  ${YELLOW}settings.json preserved (only statusLine and hook removed)${RESET}"
echo ""
echo -e "${YELLOW}Restart Claude Code to apply changes.${RESET}"
