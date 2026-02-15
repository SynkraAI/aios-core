#!/bin/bash
# AIOS Migration - Phase 1: Agents
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 1: Migrando Agents..."
echo ""

# 1.1 Move unique agents from .claude/agents/ to .aios-core/development/agents/
if [ -d ".claude/agents" ]; then
  echo "  → Movendo agents de .claude/agents/..."

  agent_count=$(ls -1 .claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')

  if [ "$agent_count" -gt 0 ]; then
    mv .claude/agents/*.md .aios-core/development/agents/
    echo "    ✓ $agent_count agents movidos"
  else
    echo "    ⚠️  Nenhum agent encontrado em .claude/agents/"
  fi
fi

# 1.2 Delete duplicate agents in .claude/commands/AIOS/agents/
if [ -d ".claude/commands/AIOS/agents" ]; then
  echo "  → Deletando agents duplicados em .claude/commands/AIOS/agents/..."

  dup_count=$(ls -1 .claude/commands/AIOS/agents/*.md 2>/dev/null | wc -l | tr -d ' ')

  rm -rf .claude/commands/AIOS/agents/
  echo "    ✓ $dup_count agents duplicados deletados"
fi

echo ""
echo "✅ FASE 1 Completa"
echo ""

# Validation
echo "📊 Validação:"
total_agents=$(ls -1 .aios-core/development/agents/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "  • Total de agents em .aios-core/development/agents/: $total_agents"
echo "  • Esperado: 37 agents"
echo ""
