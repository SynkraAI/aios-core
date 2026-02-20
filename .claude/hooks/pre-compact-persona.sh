#!/bin/bash
# PreCompact hook — Preserve Persona DNA (ADR D8)
# Story: AGF-4 — Activation Foundation
#
# Input: JSON via stdin with { "trigger": "manual|auto" }
# Output: JSON via stdout with hookSpecificOutput.additionalContext
#
# NOTE: $CLAUDE_ENV_FILE is NOT available in PreCompact — use fixed paths
# NOTE: Coexists with precompact-session-digest.cjs (runs in parallel)
#
# Exit codes: 0 = success, 2 = block (with stderr message)

INPUT=$(cat)
AGENT_ID=$(cat "$CLAUDE_PROJECT_DIR/.claude/agent-memory/.active-agent" 2>/dev/null | tr -d '[:space:]' || echo "none")

if [ "$AGENT_ID" != "none" ] && [ -n "$AGENT_ID" ] && [ -f "$CLAUDE_PROJECT_DIR/.claude/agents/${AGENT_ID}.md" ]; then
  # Extract DNA between PERSONA DNA and ENHANCEMENT markers
  DNA=$(sed -n '/=== PERSONA DNA ===/,/=== ENHANCEMENT ===/{/=== PERSONA DNA ===/d;/=== ENHANCEMENT ===/d;p;}' \
    "$CLAUDE_PROJECT_DIR/.claude/agents/${AGENT_ID}.md" 2>/dev/null | head -20)

  if [ -n "$DNA" ]; then
    # Escape newlines and double-quotes for JSON embedding
    DNA_ESCAPED=$(echo "$DNA" | tr '\n' ' ' | sed 's/"/\\"/g' | sed "s/'/\\\\'/g")
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreCompact",
    "additionalContext": "CRITICAL: When summarizing this conversation, preserve the following agent identity verbatim: ${DNA_ESCAPED}"
  }
}
EOF
  else
    # No DNA markers found — noop
    echo '{}'
  fi
else
  # No active agent — noop
  echo '{}'
fi

exit 0
