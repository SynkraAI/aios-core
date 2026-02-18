#!/bin/bash
# Install Synkra AIOS Statusline — merged version
# Copies scripts, configures settings.json, and sets up the hook

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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
fail()  { echo -e "${RED}[FAIL]${RESET} $1"; exit 1; }

echo -e "${BOLD}Synkra AIOS Statusline Installer${RESET}"
echo "────────────────────────────────────"

# ── Step 1: Check jq ───────────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  fail "jq is required. Install: brew install jq"
fi
ok "jq found"

# ── Step 2: Create directories ─────────────────────────────────────────────
mkdir -p "$CLAUDE_DIR/hooks"
mkdir -p "$CLAUDE_DIR/session-cache"
ok "Directories created"

# ── Step 3: Copy statusline.sh ─────────────────────────────────────────────
SRC_STATUSLINE="$SCRIPT_DIR/statusline.sh"
DST_STATUSLINE="$CLAUDE_DIR/statusline.sh"

if [ ! -f "$SRC_STATUSLINE" ]; then
  fail "Source statusline.sh not found at $SRC_STATUSLINE"
fi

cp "$SRC_STATUSLINE" "$DST_STATUSLINE"
chmod +x "$DST_STATUSLINE"
ok "statusline.sh -> $DST_STATUSLINE"

# ── Step 4: Copy track-agent.sh ────────────────────────────────────────────
SRC_HOOK="$SCRIPT_DIR/hooks/track-agent.sh"
DST_HOOK="$CLAUDE_DIR/hooks/track-agent.sh"

if [ ! -f "$SRC_HOOK" ]; then
  fail "Source track-agent.sh not found at $SRC_HOOK"
fi

cp "$SRC_HOOK" "$DST_HOOK"
chmod +x "$DST_HOOK"
ok "track-agent.sh -> $DST_HOOK"

# ── Step 5: Backup settings.json ───────────────────────────────────────────
if [ -f "$SETTINGS" ]; then
  BACKUP="${SETTINGS}.backup-$(date +%Y%m%d-%H%M%S)"
  cp "$SETTINGS" "$BACKUP"
  ok "Backup: $BACKUP"
else
  # Create minimal settings.json
  echo '{}' > "$SETTINGS"
  info "Created new settings.json"
fi

# ── Step 6: Configure statusLine ───────────────────────────────────────────
STATUSLINE_CMD="$HOME/.claude/statusline.sh"

# Update statusLine in settings.json
UPDATED=$(jq --arg cmd "$STATUSLINE_CMD" '
  .statusLine = {
    "type": "command",
    "command": $cmd
  }
' "$SETTINGS")
echo "$UPDATED" > "$SETTINGS"
ok "statusLine configured: $STATUSLINE_CMD"

# ── Step 7: Add UserPromptSubmit hook ──────────────────────────────────────
HOOK_CMD="$HOME/.claude/hooks/track-agent.sh"

# Check if hooks.UserPromptSubmit exists and if our hook is already there
HAS_HOOK=$(jq --arg cmd "$HOOK_CMD" '
  .hooks.UserPromptSubmit // [] | map(select(.command == $cmd)) | length
' "$SETTINGS" 2>/dev/null || echo "0")

if [ "$HAS_HOOK" = "0" ] || [ "$HAS_HOOK" = "" ]; then
  # Add our hook, preserving any existing hooks
  UPDATED=$(jq --arg cmd "$HOOK_CMD" '
    .hooks.UserPromptSubmit = ((.hooks.UserPromptSubmit // []) + [{
      "command": $cmd,
      "timeout": 5000
    }])
  ' "$SETTINGS")
  echo "$UPDATED" > "$SETTINGS"
  ok "Hook added: UserPromptSubmit -> track-agent.sh"
else
  info "Hook already configured"
fi

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Installation complete!${RESET}"
echo "────────────────────────────────────"
echo -e "  Statusline: ${GREEN}$DST_STATUSLINE${RESET}"
echo -e "  Hook:       ${GREEN}$DST_HOOK${RESET}"
echo -e "  Cache:      ${GREEN}$CLAUDE_DIR/session-cache/${RESET}"
echo -e "  Settings:   ${GREEN}$SETTINGS${RESET}"
echo ""
echo -e "${YELLOW}Restart Claude Code to see the new statusline.${RESET}"
