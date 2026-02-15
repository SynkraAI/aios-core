#!/bin/bash
# AIOS Migration - Phase 6: Squads
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 6: Migrando Squads..."
echo ""

# 6.1 Delete empty squad directories
echo "📦 FASE 6.1: Deletando squads vazios..."
EMPTY_SQUADS=("design" "dopamine-learning" "knowledge-base-builder" "squad-creator" "tim-ferriss")

for squad in "${EMPTY_SQUADS[@]}"; do
  if [ -d ".claude/commands/$squad" ]; then
    echo "  → Deletando .claude/commands/$squad/ (vazio)"
    rm -rf ".claude/commands/$squad"
  fi
done
echo "  ✓ Squads vazios deletados"
echo ""

# 6.2 Merge single-file squads
echo "📦 FASE 6.2: Mesclando squads com arquivo único..."
SINGLE_FILE_SQUADS=("content-engine" "hormozi" "icp-cloning" "mind-cloning" "mind-content-updater")

for squad in "${SINGLE_FILE_SQUADS[@]}"; do
  if [ -d ".claude/commands/$squad" ]; then
    echo "  → Analisando .claude/commands/$squad/..."

    # Find first non-.DS_Store file
    claude_file=$(find ".claude/commands/$squad" -type f ! -name ".DS_Store" | head -1)

    if [ -n "$claude_file" ]; then
      filename=$(basename "$claude_file")
      target="squads/$squad/$filename"

      if [ ! -f "$target" ]; then
        echo "    • Movendo arquivo único: $filename"
        mkdir -p "squads/$squad"
        cp "$claude_file" "squads/$squad/"
      else
        echo "    • Arquivo já existe em squads/, ignorando"
      fi
    fi

    # Delete .claude/ folder
    rm -rf ".claude/commands/$squad"
    echo "    ✓ .claude/commands/$squad/ deletado"
  fi
done
echo "  ✓ Squads com arquivo único mesclados"
echo ""

# 6.3 Manual merge for mmos-squad
echo "📦 FASE 6.3: Merge manual para mmos-squad..."
echo ""
echo "⚠️  AÇÃO MANUAL NECESSÁRIA:"
echo ""
echo "Squad: mmos-squad"
echo "  .claude/commands/mmos-squad/  → $(find .claude/commands/mmos-squad -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "  squads/mmos-squad/            → $(find squads/mmos-squad -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo ""
echo "Executar diff agora para ver diferenças..."
echo ""

if [ -d ".claude/commands/mmos-squad" ]; then
  diff -qr .claude/commands/mmos-squad/ squads/mmos-squad/ 2>/dev/null || true
  echo ""
  echo "Revise os arquivos únicos acima."
  echo ""
  read -p "Merge manual completo? Deletar .claude/commands/mmos-squad/? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf ".claude/commands/mmos-squad"
    echo "  ✓ .claude/commands/mmos-squad/ deletado"
  else
    echo "  ⏭️  Mantendo .claude/commands/mmos-squad/ - delete manualmente depois"
  fi
fi
echo ""

# 6.4 Move unique squads
echo "📦 FASE 6.4: Movendo squads únicos..."
UNIQUE_SQUADS=("Ralph" "synapse")

for squad in "${UNIQUE_SQUADS[@]}"; do
  if [ -d ".claude/commands/$squad" ]; then
    echo "  → Movendo $squad..."
    mv ".claude/commands/$squad" "squads/"
    echo "    ✓ squads/$squad/ criado"
  fi
done
echo ""

echo "✅ FASE 6 Completa"
echo ""

# Validation
echo "📊 Validação:"
echo "  • Squads em squads/:"
ls -1d squads/*/ 2>/dev/null | sed 's|squads/||' | sed 's|/||'
echo ""
echo "  • Restante em .claude/commands/:"
ls -1d .claude/commands/*/ 2>/dev/null | sed 's|.claude/commands/||' | sed 's|/||' || echo "    (nenhum)"
echo ""
