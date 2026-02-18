#!/bin/bash
# PPTX Skill - Script de Verificação de Instalação

echo "=== PPTX Skill - Verificação de Instalação ==="
echo ""

# Python
echo "1. Python:"
which python3
python3 --version
echo ""

# Pacotes Python
echo "2. Pacotes Python:"
python3 -c "import defusedxml; print('  ✓ defusedxml')" 2>/dev/null || echo "  ✗ defusedxml"
python3 -c "import PIL; print('  ✓ Pillow')" 2>/dev/null || echo "  ✗ Pillow"
python3 -c "import lxml; print('  ✓ lxml')" 2>/dev/null || echo "  ✗ lxml"
python3 -c "import markitdown; print('  ✓ markitdown (opcional)')" 2>/dev/null || echo "  ℹ markitdown não instalado (opcional)"
echo ""

# Node.js
echo "3. Node.js:"
which node
node --version
npm --version
echo ""

# Pacotes Node.js (verifica no diretório local)
echo "4. Pacotes Node.js:"
if [ -d "node_modules/pptxgenjs" ]; then
  echo "  ✓ pptxgenjs"
else
  echo "  ✗ pptxgenjs (execute 'npm install')"
fi

if [ -d "node_modules/playwright" ]; then
  echo "  ✓ playwright"
else
  echo "  ✗ playwright (execute 'npm install')"
fi

if [ -d "node_modules/sharp" ]; then
  echo "  ✓ sharp"
else
  echo "  ✗ sharp (execute 'npm install')"
fi
echo ""

# Scripts Python
echo "5. Scripts Python:"
test -x scripts/inventory.py && echo "  ✓ inventory.py" || echo "  ✗ inventory.py (não executável)"
test -x scripts/rearrange.py && echo "  ✓ rearrange.py" || echo "  ✗ rearrange.py"
test -x scripts/replace.py && echo "  ✓ replace.py" || echo "  ✗ replace.py"
test -x scripts/thumbnail.py && echo "  ✓ thumbnail.py" || echo "  ✗ thumbnail.py"
test -x ooxml/scripts/pack.py && echo "  ✓ pack.py" || echo "  ✗ pack.py"
test -x ooxml/scripts/unpack.py && echo "  ✓ unpack.py" || echo "  ✗ unpack.py"
test -x ooxml/scripts/validate.py && echo "  ✓ validate.py" || echo "  ✗ validate.py"
echo ""

# Opcionais
echo "6. Dependências Opcionais:"
which soffice >/dev/null 2>&1 && echo "  ✓ LibreOffice" || echo "  ℹ LibreOffice não instalado (opcional)"
which pdftoppm >/dev/null 2>&1 && echo "  ✓ Poppler" || echo "  ℹ Poppler não instalado (opcional)"
echo ""

echo "=== Verificação Completa ==="
echo ""
echo "Para instalar dependências faltantes:"
echo "  Python: pip3 install --user -r requirements.txt"
echo "  Node.js: npm install"
echo "  Playwright: npx playwright install chromium"
