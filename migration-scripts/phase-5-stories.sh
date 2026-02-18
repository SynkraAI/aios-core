#!/bin/bash
# AIOS Migration - Phase 5: Stories
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 5: Migrando Stories..."
echo ""

# Create docs/stories/active/ if not exists
mkdir -p docs/stories/active/

# Move story
if [ -f ".claude/commands/AIOS/stories/story-6.1.4.md" ]; then
  echo "  → Movendo story-6.1.4.md..."
  mv .claude/commands/AIOS/stories/story-6.1.4.md docs/stories/active/
  echo "    ✓ Story movida"
fi

echo ""
echo "✅ FASE 5 Completa"
echo ""

# Validation
echo "📊 Validação:"
if [ -f "docs/stories/active/story-6.1.4.md" ]; then
  echo "  • Story movida com sucesso: docs/stories/active/story-6.1.4.md"
else
  echo "  ⚠️  Story não encontrada"
fi
echo ""
