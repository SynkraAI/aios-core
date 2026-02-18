#!/bin/bash
# AIOS Terminal Integration Setup
# Adds AIOS context to terminal prompt and tab title

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AIOS_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "🔧 AIOS Terminal Integration Setup"
echo ""

# Detect shell
SHELL_NAME=$(basename "$SHELL")
if [[ "$SHELL_NAME" == "zsh" ]]; then
  RC_FILE="$HOME/.zshrc"
elif [[ "$SHELL_NAME" == "bash" ]]; then
  RC_FILE="$HOME/.bashrc"
else
  echo "❌ Unsupported shell: $SHELL_NAME"
  exit 1
fi

echo "📝 Detected shell: $SHELL_NAME"
echo "📄 Config file: $RC_FILE"
echo ""

# Check if already integrated
if grep -q "# AIOS Terminal Integration" "$RC_FILE" 2>/dev/null; then
  echo "✅ AIOS Terminal Integration already installed"
  echo ""
  echo "To update, remove the # AIOS Terminal Integration section from $RC_FILE and run this script again"
  exit 0
fi

# Create backup
cp "$RC_FILE" "${RC_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
echo "💾 Backup created: ${RC_FILE}.backup-$(date +%Y%m%d-%H%M%S)"

# Add integration
cat >> "$RC_FILE" << 'EOF'

# ============================================
# AIOS Terminal Integration
# ============================================

# Source AIOS prompt injector
if [[ -f "$HOME/aios-core/.aios-core/infrastructure/scripts/terminal/prompt-injector.sh" ]]; then
  source "$HOME/aios-core/.aios-core/infrastructure/scripts/terminal/prompt-injector.sh"
fi

# Auto-update tab title on each command
if [[ -n "$ZSH_VERSION" ]]; then
  # Zsh
  precmd() {
    if [[ -f "$HOME/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh" ]]; then
      bash "$HOME/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh" 2>/dev/null || true
    fi
  }
elif [[ -n "$BASH_VERSION" ]]; then
  # Bash
  PROMPT_COMMAND='bash "$HOME/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh" 2>/dev/null || true'
fi

# Add AIOS context to prompt (right side)
# Uncomment one of the following to enable:

# Option 1: Simple prepend
# export PS1='$(aios_prompt)'"$PS1"

# Option 2: Right-aligned (zsh only)
# export RPS1='$(aios_prompt)'

# Option 3: Custom prompt with AIOS context
# export PS1='$(aios_prompt)%F{blue}%~%f %# '

EOF

echo "✅ AIOS Terminal Integration added to $RC_FILE"
echo ""
echo "📋 Next steps:"
echo "  1. Reload your shell: source $RC_FILE"
echo "  2. Or open a new terminal tab"
echo ""
echo "🎨 To enable AIOS context in prompt:"
echo "  Edit $RC_FILE and uncomment one of the PS1 options"
echo ""
echo "📍 Test context:"
echo "  aios context set \"Your task name\""
echo ""

