#!/bin/bash
# AIOS Migration - Phase 2: Templates
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 2: Migrando Templates..."
echo ""

# Move all templates from .claude/templates/
if [ -d ".claude/templates" ]; then
  echo "  → Movendo templates de .claude/templates/..."

  # Move YAML templates
  yaml_count=$(ls -1 .claude/templates/*.yaml 2>/dev/null | wc -l | tr -d ' ')
  if [ "$yaml_count" -gt 0 ]; then
    mv .claude/templates/*.yaml .aios-core/development/templates/ 2>/dev/null
    echo "    ✓ $yaml_count templates YAML movidos"
  fi

  # Move Markdown templates
  md_count=$(ls -1 .claude/templates/*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$md_count" -gt 0 ]; then
    mv .claude/templates/*.md .aios-core/development/templates/ 2>/dev/null
    echo "    ✓ $md_count templates MD movidos"
  fi
fi

echo ""
echo "✅ FASE 2 Completa"
echo ""

# Validation
echo "📊 Validação:"
total_templates=$(find .aios-core/development/templates/ -maxdepth 1 -type f | wc -l | tr -d ' ')
echo "  • Total de templates em .aios-core/development/templates/: $total_templates"
echo "  • Esperado: ~21 templates"
echo ""
