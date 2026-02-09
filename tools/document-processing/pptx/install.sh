#!/bin/bash
# PPTX Skill - Script de Instalação Automática

set -e

echo "=== Instalando PPTX Processing Skill ==="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "SKILL.md" ]; then
  echo "❌ Erro: Execute este script no diretório do skill PPTX"
  echo "   cd /Users/luizfosc/aios-core/.aios/skills/document-processing/pptx"
  exit 1
fi

echo "📦 1. Criando virtual environment Python..."
if command -v python3 >/dev/null 2>&1; then
  # Criar virtual environment para isolar dependências
  if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "   ✓ Virtual environment criado (.venv/)"
  else
    echo "   ℹ Virtual environment já existe"
  fi

  # Ativar venv e instalar dependências
  source .venv/bin/activate
  pip install --quiet -r requirements.txt --disable-pip-version-check
  echo "   ✓ Dependências Python instaladas no venv"
  deactivate
else
  echo "   ❌ Python 3 não encontrado"
  exit 1
fi
echo ""

echo "📦 2. Instalando dependências Node.js..."
if command -v npm >/dev/null 2>&1; then
  npm install --silent
  echo "   ✓ Dependências Node.js instaladas"
else
  echo "   ❌ npm não encontrado"
  exit 1
fi
echo ""

echo "🌐 3. Instalando browsers Playwright..."
if [ -d "node_modules/playwright" ]; then
  npx playwright install chromium --quiet 2>&1 | grep -v "Downloading" || true
  echo "   ✓ Chromium instalado"
else
  echo "   ⚠️  Playwright não encontrado (npm install primeiro)"
fi
echo ""

echo "🔧 4. Configurando permissões..."
chmod +x scripts/*.py ooxml/scripts/*.py verify-setup.sh install.sh 2>/dev/null || true
echo "   ✓ Scripts tornados executáveis"
echo ""

echo "✅ Instalação completa!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute './verify-setup.sh' para verificar a instalação"
echo "   2. Leia 'README.md' para visão geral"
echo "   3. Consulte 'SKILL.md' para workflows completos"
echo ""
