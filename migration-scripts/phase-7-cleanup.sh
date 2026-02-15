#!/bin/bash
# AIOS Migration - Phase 7: Cleanup
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 7: Cleanup final..."
echo ""

# Delete .claude/commands/AIOS/
if [ -d ".claude/commands/AIOS" ]; then
  echo "  → Deletando .claude/commands/AIOS/..."
  rm -rf .claude/commands/AIOS/
  echo "    ✓ Deletado"
fi

# Delete .claude/commands/ if empty
if [ -d ".claude/commands" ] && [ -z "$(ls -A .claude/commands 2>/dev/null)" ]; then
  echo "  → Deletando .claude/commands/ (vazio)..."
  rm -rf .claude/commands/
  echo "    ✓ Deletado"
fi

# Delete .claude/agents/ if empty
if [ -d ".claude/agents" ] && [ -z "$(ls -A .claude/agents 2>/dev/null)" ]; then
  echo "  → Deletando .claude/agents/ (vazio)..."
  rm -rf .claude/agents/
  echo "    ✓ Deletado"
fi

# Delete .claude/templates/ if empty
if [ -d ".claude/templates" ] && [ -z "$(ls -A .claude/templates 2>/dev/null)" ]; then
  echo "  → Deletando .claude/templates/ (vazio)..."
  rm -rf .claude/templates/
  echo "    ✓ Deletado"
fi

# Delete .claude/skills/ if empty (keep .git if exists)
if [ -d ".claude/skills" ]; then
  non_git_files=$(find .claude/skills -type f ! -path "*/.git/*" ! -name ".gitignore" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$non_git_files" -eq 0 ]; then
    echo "  → Deletando .claude/skills/ (vazio exceto .git)..."
    rm -rf .claude/skills/
    echo "    ✓ Deletado"
  fi
fi

echo ""
echo "✅ FASE 7 Completa - Cleanup finalizado"
echo ""

# Validation
echo "📊 Estrutura .claude/ final:"
ls -la .claude/
echo ""
