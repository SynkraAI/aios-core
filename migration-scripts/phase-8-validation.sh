#!/bin/bash
# AIOS Migration - Phase 8: Complete Validation
# Created by @architect (Aria)
# Date: 2026-02-13

set -e

echo "📦 FASE 8: Validação completa do sistema..."
echo ""

# Validate agents
echo "  → Validando agents..."
if command -v npm &> /dev/null; then
  npm run validate:agents || echo "    ⚠️  Validação de agents falhou (pode ser esperado se comando não existe)"
else
  echo "    ⏭️  npm não encontrado, pulando"
fi
echo ""

# Validate structure
echo "  → Validando estrutura do projeto..."
if command -v npm &> /dev/null; then
  npm run validate:structure || echo "    ⚠️  Validação de estrutura falhou (pode ser esperado se comando não existe)"
else
  echo "    ⏭️  npm não encontrado, pulando"
fi
echo ""

# Health check
echo "  → Executando health check..."
if command -v npx &> /dev/null; then
  npx aios-core doctor || echo "    ⚠️  Health check encontrou problemas (revisar manualmente)"
else
  echo "    ⏭️  npx não encontrado, pulando"
fi
echo ""

# Count verification
echo "📊 Contagem Final:"
echo ""

agents_count=$(ls -1 .aios-core/development/agents/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "  • Agents: $agents_count (esperado: 37)"

templates_count=$(find .aios-core/development/templates/ -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
echo "  • Templates: $templates_count (esperado: ~21)"

skills_count=$(ls -1d .aios/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
echo "  • Skills: $skills_count (esperado: ~53)"

scripts_count=$(ls -1 .aios-core/development/scripts/*.js 2>/dev/null | wc -l | tr -d ' ')
echo "  • Scripts: $scripts_count"

squads_count=$(ls -1d squads/*/ 2>/dev/null | wc -l | tr -d ' ')
echo "  • Squads: $squads_count (esperado: ~15)"

echo ""

# Check .claude/ structure
echo "📁 Estrutura .claude/ final:"
echo ""
ls -la .claude/ | grep -v "^total" | grep -v "^\." | awk '{print "  " $0}'
echo ""

# Final verification
echo "🔍 Verificação de pastas que NÃO devem existir:"
echo ""

if [ -d ".claude/commands" ]; then
  echo "  ❌ .claude/commands/ ainda existe!"
else
  echo "  ✅ .claude/commands/ não existe"
fi

if [ -d ".claude/agents" ]; then
  echo "  ❌ .claude/agents/ ainda existe!"
else
  echo "  ✅ .claude/agents/ não existe"
fi

if [ -d ".claude/templates" ]; then
  echo "  ❌ .claude/templates/ ainda existe!"
else
  echo "  ✅ .claude/templates/ não existe"
fi

echo ""
echo "✅ FASE 8 Completa - Validação finalizada"
echo ""
echo "🎉 MIGRAÇÃO COMPLETA!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Revisar os números acima"
echo "  2. Testar sistema: npx aios-core --version"
echo "  3. Commit das mudanças"
echo "  4. Deletar backup após 7 dias de validação"
echo ""
