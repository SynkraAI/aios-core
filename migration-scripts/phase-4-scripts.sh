#!/bin/bash
# AIOS Migration - Phase 4: Scripts
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 4: Migrando Scripts..."
echo ""

# Move scripts from .claude/commands/AIOS/scripts/
if [ -d ".claude/commands/AIOS/scripts" ]; then
  echo "  → Movendo scripts de .claude/commands/AIOS/scripts/..."

  script_count=$(ls -1 .claude/commands/AIOS/scripts/*.js 2>/dev/null | wc -l | tr -d ' ')

  if [ "$script_count" -gt 0 ]; then
    mv .claude/commands/AIOS/scripts/*.js .aios-core/development/scripts/
    echo "    ✓ $script_count scripts movidos"
  fi
fi

echo ""
echo "✅ FASE 4 Completa"
echo ""

# Validation
echo "📊 Validação:"
echo "  • Scripts movidos:"
ls .aios-core/development/scripts/*.js 2>/dev/null | grep -E "(agent-config-loader|generate-greeting|greeting-builder|session-context-loader)" || echo "    ⚠️  Scripts não encontrados"
echo ""
