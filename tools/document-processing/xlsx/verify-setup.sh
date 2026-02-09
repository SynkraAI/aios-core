#!/bin/bash
# XLSX Skill - Verificação de Instalação

echo "=== XLSX Skill - Verificação ==="
echo ""

echo "1. Python:"
which python3
python3 --version
echo ""

echo "2. Virtual Environment:"
if [ -d ".venv" ]; then
  echo "  ✓ Virtual environment existe"
  source .venv/bin/activate
  python -c "import pandas; print('  ✓ pandas')" 2>/dev/null || echo "  ✗ pandas"
  python -c "import openpyxl; print('  ✓ openpyxl')" 2>/dev/null || echo "  ✗ openpyxl"
  python -c "import xlrd; print('  ✓ xlrd')" 2>/dev/null || echo "  ✗ xlrd"
  python -c "import xlsxwriter; print('  ✓ xlsxwriter')" 2>/dev/null || echo "  ✗ xlsxwriter"
  deactivate
else
  echo "  ✗ Virtual environment não encontrado"
fi
echo ""

echo "3. Scripts:"
test -x recalc.py && echo "  ✓ recalc.py" || echo "  ✗ recalc.py"
echo ""

echo "4. LibreOffice (opcional):"
which soffice >/dev/null 2>&1 && echo "  ✓ LibreOffice instalado" || echo "  ℹ LibreOffice não instalado (brew install --cask libreoffice)"
echo ""

echo "=== Status ==="
if [ -d ".venv" ]; then
  echo "✅ XLSX skill pronto para uso!"
else
  echo "⚠️  Execute './install.sh' para configurar"
fi
