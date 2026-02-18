#!/bin/bash
# DOCX Skill - Verificação de Instalação

echo "=== DOCX Skill - Verificação ==="
echo ""

echo "1. Python:"
which python3
python3 --version
echo ""

echo "2. Virtual Environment:"
if [ -d ".venv" ]; then
  echo "  ✓ Virtual environment existe"
  source .venv/bin/activate
  python -c "import defusedxml; print('  ✓ defusedxml')" 2>/dev/null || echo "  ✗ defusedxml"
  python -c "import lxml; print('  ✓ lxml')" 2>/dev/null || echo "  ✗ lxml"
  python -c "import docx; print('  ✓ python-docx')" 2>/dev/null || echo "  ✗ python-docx"
  deactivate
else
  echo "  ✗ Virtual environment não encontrado"
fi
echo ""

echo "3. Node.js:"
if [ -d "node_modules" ]; then
  echo "  ✓ node_modules existe"
  node -e "const docx = require('docx'); console.log('  ✓ docx library')" 2>/dev/null || echo "  ✗ docx library"
else
  echo "  ✗ node_modules não encontrado (execute 'npm install')"
fi
echo ""

echo "4. Scripts:"
test -x scripts/document.py && echo "  ✓ document.py" || echo "  ✗ document.py"
test -x scripts/utilities.py && echo "  ✓ utilities.py" || echo "  ✗ utilities.py"
test -x ooxml/scripts/pack.py && echo "  ✓ pack.py" || echo "  ✗ pack.py"
test -x ooxml/scripts/unpack.py && echo "  ✓ unpack.py" || echo "  ✗ unpack.py"
test -x ooxml/scripts/validate.py && echo "  ✓ validate.py" || echo "  ✗ validate.py"
echo ""

echo "5. Ferramentas Externas (opcionais):"
which pandoc >/dev/null 2>&1 && echo "  ✓ pandoc" || echo "  ℹ pandoc não instalado (brew install pandoc)"
which soffice >/dev/null 2>&1 && echo "  ✓ LibreOffice" || echo "  ℹ LibreOffice não instalado (brew install --cask libreoffice)"
which pdftoppm >/dev/null 2>&1 && echo "  ✓ poppler" || echo "  ℹ poppler não instalado (brew install poppler)"
echo ""

echo "=== Status ==="
if [ -d ".venv" ] && [ -d "node_modules" ]; then
  echo "✅ DOCX skill pronto para uso!"
else
  echo "⚠️  Execute './install.sh' para configurar"
fi
