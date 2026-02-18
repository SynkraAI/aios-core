#!/bin/bash
# Track active agent/squad for statusline display
# Hook type: UserPromptSubmit
# Writes cache files that statusline.sh reads via PID walking
#
# Detects:
#   @agent-name          -> set agent
#   /NS:agents:name      -> set agent (+ squad from NS)
#   /squad:something     -> set squad
#   *exit                -> clear agent and squad

CACHE_DIR="$HOME/.claude/session-cache"
mkdir -p "$CACHE_DIR"

# Get the Claude Code PID (parent of hook process)
CLAUDE_PID="$PPID"

# Read the user prompt from stdin
PROMPT=$(cat)

# Extract the actual prompt text from JSON if present
if command -v jq &>/dev/null; then
  PROMPT_TEXT=$(echo "$PROMPT" | jq -r '.prompt // .message // .content // empty' 2>/dev/null)
  if [ -n "$PROMPT_TEXT" ]; then
    PROMPT="$PROMPT_TEXT"
  fi
fi

# Trim whitespace
PROMPT=$(echo "$PROMPT" | xargs 2>/dev/null || echo "$PROMPT")

# Namespaces to ignore for squad detection (framework internals)
IGNORE_NS="AIOS|aios-core|aios|synkra|system"

# ── Detect *exit ────────────────────────────────────────────────────────────
if [[ "$PROMPT" =~ ^\*exit ]]; then
  # Clear both agent and squad
  echo '{"agent":""}' > "$CACHE_DIR/agent-${CLAUDE_PID}.json"
  echo '{"squad":""}' > "$CACHE_DIR/squad-${CLAUDE_PID}.json"
  exit 0
fi

# ── Detect @agent-name ─────────────────────────────────────────────────────
if [[ "$PROMPT" =~ ^@([a-zA-Z0-9_-]+) ]]; then
  AGENT="${BASH_REMATCH[1]}"
  echo "{\"agent\":\"${AGENT}\",\"ts\":$(date +%s)}" > "$CACHE_DIR/agent-${CLAUDE_PID}.json"
  exit 0
fi

# ── Detect /namespace:agents:name ──────────────────────────────────────────
if [[ "$PROMPT" =~ ^/([a-zA-Z0-9_-]+):agents:([a-zA-Z0-9_-]+) ]]; then
  NS="${BASH_REMATCH[1]}"
  AGENT="${BASH_REMATCH[2]}"
  echo "{\"agent\":\"${AGENT}\",\"ts\":$(date +%s)}" > "$CACHE_DIR/agent-${CLAUDE_PID}.json"
  # Set squad only if namespace is not a known framework namespace
  if ! echo "$NS" | grep -qEi "^(${IGNORE_NS})$"; then
    echo "{\"squad\":\"${NS}\",\"ts\":$(date +%s)}" > "$CACHE_DIR/squad-${CLAUDE_PID}.json"
  fi
  exit 0
fi

# ── Detect /squad:something ────────────────────────────────────────────────
if [[ "$PROMPT" =~ ^/([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+) ]]; then
  NS="${BASH_REMATCH[1]}"
  # Set as squad if not an ignored namespace
  if ! echo "$NS" | grep -qEi "^(${IGNORE_NS})$"; then
    echo "{\"squad\":\"${NS}\",\"ts\":$(date +%s)}" > "$CACHE_DIR/squad-${CLAUDE_PID}.json"
  fi
  exit 0
fi

# No match — don't modify cache (preserve current state)
exit 0
