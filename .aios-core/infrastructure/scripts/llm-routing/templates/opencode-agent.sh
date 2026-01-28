#!/bin/bash
# OpenCode Agent Routing Script
# Ported from Synkra AIOS Claude Max

# Track usage if enabled
if [ "$AIOS_USAGE_TRACKING" = "true" ]; then
  node .aios-core/infrastructure/scripts/usage-analytics.js --agent "opencode" --event "activation"
fi

# Route to OpenCode CLI
# Usage: ./opencode-agent.sh [args]
opencode "$@"
