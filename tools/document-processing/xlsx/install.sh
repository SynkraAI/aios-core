#!/bin/bash
set -e

echo "=== Instalando XLSX Processing Skill ==="
echo ""

if [ ! -f "SKILL.md" ]; then
  echo "❌ Erro: Execute no diretório do skill XLSX"
  exit 1
fi

echo "📦 1. Criando virtual environment Python..."
if command -v python3 >/dev/null 2>&1; then
  if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "   ✓ Virtual environment criado"
  else
    echo "   ℹ Virtual environment já existe"
  fi

  source .venv/bin/activate
  pip install --quiet -r requirements.txt
  echo "   ✓ Dependências Python instaladas"
  deactivate
else
  echo "   ❌ Python 3 não encontrado"
  exit 1
fi

echo ""
echo "🔧 2. Configurando permissões..."
chmod +x recalc.py verify-setup.sh install.sh 2>/dev/null || true
echo "   ✓ Scripts executáveis"

echo ""
echo "✅ Instalação completa!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute './verify-setup.sh' para verificar"
echo "   2. Leia 'README.md' para visão geral"
echo "   3. Instale LibreOffice: brew install --cask libreoffice"
