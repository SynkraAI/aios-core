#!/bin/bash
# AIOS Migration - Phase 3: Skills
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 3: Migrando Skills..."
echo ""

# Create .aios/skills/ if not exists
mkdir -p .aios/skills/

# Move skills from .claude/skills/
if [ -d ".claude/skills" ]; then
  echo "  → Movendo skills de .claude/skills/..."

  count=0
  for skill_dir in .claude/skills/*/; do
    if [ -d "$skill_dir" ]; then
      skill_name=$(basename "$skill_dir")
      if [ "$skill_name" != ".git" ]; then
        mv "$skill_dir" .aios/skills/
        count=$((count + 1))
      fi
    fi
  done

  echo "    ✓ $count skills movidas"
fi

# Move skills from .claude/commands/AIOS/skills/ (except .deprecated)
if [ -d ".claude/commands/AIOS/skills" ]; then
  echo "  → Movendo skills de .claude/commands/AIOS/skills/..."

  cd .claude/commands/AIOS/skills/
  count=0
  for skill_dir in */; do
    if [ "$skill_dir" != ".deprecated/" ] && [ -d "$skill_dir" ]; then
      mv "$skill_dir" ../../../../.aios/skills/
      count=$((count + 1))
    fi
  done
  cd ../../../..

  echo "    ✓ $count skills movidas"

  # Move SKILLS-INDEX.md
  if [ -f ".claude/commands/AIOS/SKILLS-INDEX.md" ]; then
    mv .claude/commands/AIOS/SKILLS-INDEX.md .aios/skills/
    echo "    ✓ SKILLS-INDEX.md movido"
  fi
fi

echo ""
echo "✅ FASE 3 Completa"
echo ""

# Validation
echo "📊 Validação:"
total_skills=$(ls -1d .aios/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
echo "  • Total de skills em .aios/skills/: $total_skills"
echo "  • Esperado: ~53 skills"
echo ""
