# Setup Guide - PPTX Processing Skill

Este guia detalha a instalação completa de todas as dependências necessárias para usar o skill de PPTX.

## 📋 Pré-requisitos

### Sistema Operacional
- ✅ macOS (Darwin) - Seu sistema atual
- ✅ Linux
- ✅ Windows (com algumas adaptações)

### Software Obrigatório
- Python 3.9+ (você tem 3.13 via homebrew ✅)
- Node.js 18+ (instalado via homebrew ✅)
- pip3 (incluído com Python ✅)
- npm (incluído com Node.js ✅)

## 🔧 Instalação Passo a Passo

### 1. Dependências Python

```bash
# Navegar até o diretório do skill
cd /Users/luizfosc/aios-core/.aios/skills/document-processing/pptx

# Instalar dependências Python
/opt/homebrew/opt/python@3.13/bin/pip3 install -r requirements.txt

# Verificar instalação
/opt/homebrew/opt/python@3.13/bin/python3 -c "import defusedxml, PIL, lxml; print('✓ Python packages OK')"
```

**Pacotes instalados:**
- `defusedxml` - Parsing seguro de XML
- `Pillow` - Processamento de imagens
- `lxml` - Manipulação de XML
- `markitdown` (opcional) - Conversão PPTX → Markdown
- `python-pptx` (opcional) - Manipulação alternativa de PPTX

### 2. Dependências Node.js

```bash
# Ainda no diretório do skill
npm install

# Instalar browsers do Playwright (necessário para HTML → PPTX)
npx playwright install chromium

# Verificar instalação
node -e "const pptxgen = require('pptxgenjs'); console.log('✓ Node.js packages OK')"
```

**Pacotes instalados:**
- `pptxgenjs` - Biblioteca de geração de PPTX
- `playwright` - Automação de browser para rendering
- `sharp` - Processamento de imagens

### 3. Dependências Opcionais

#### LibreOffice (para conversão PPTX → PDF)

```bash
# macOS
brew install --cask libreoffice

# Verificar instalação
/Applications/LibreOffice.app/Contents/MacOS/soffice --version
```

#### Poppler (para PDF → Imagem)

```bash
# macOS
brew install poppler

# Verificar instalação
pdftoppm -v
```

## ✅ Verificação de Instalação

Execute este script de verificação completa:

```bash
#!/bin/bash
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

# Pacotes Node.js
echo "4. Pacotes Node.js:"
npm list pptxgenjs playwright sharp 2>/dev/null | grep -E "(pptxgenjs|playwright|sharp)" || echo "  Execute 'npm install' no diretório do skill"
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
```

Salve como `verify-setup.sh` e execute:

```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

## 🧪 Teste de Funcionamento

### Teste 1: Desempacotar PPTX

```bash
# Crie um PPTX de teste (ou use um existente)
python3 ooxml/scripts/unpack.py /path/to/test.pptx /tmp/pptx-test
ls -la /tmp/pptx-test
```

### Teste 2: Gerar Thumbnails

```bash
python3 scripts/thumbnail.py /path/to/test.pptx /tmp/thumbnails --cols 3
ls -la /tmp/thumbnails
```

### Teste 3: HTML → PPTX

```bash
# Criar HTML de teste
cat > /tmp/test-slide.html << 'EOF'
<div style="width: 720pt; height: 405pt; background: #1a1a2e; padding: 40pt;">
  <h1 style="color: white; font-size: 48pt; font-family: Arial;">
    Teste PPTX
  </h1>
  <p style="color: #cccccc; font-size: 24pt; font-family: Arial;">
    Gerado via html2pptx
  </p>
</div>
EOF

# Converter
node scripts/html2pptx.js /tmp/test-slide.html /tmp/output.pptx

# Verificar
ls -lh /tmp/output.pptx
```

## 🐛 Troubleshooting

### Erro: "Module 'defusedxml' not found"

```bash
pip3 install defusedxml
```

### Erro: "Cannot find module 'pptxgenjs'"

```bash
cd /Users/luizfosc/aios-core/.aios/skills/document-processing/pptx
npm install
```

### Erro: "Playwright browsers not installed"

```bash
npx playwright install chromium
```

### Erro: "Permission denied" ao executar scripts Python

```bash
chmod +x scripts/*.py ooxml/scripts/*.py
```

### Erro: "command not found: python3"

No seu sistema macOS, use o caminho completo:

```bash
/opt/homebrew/opt/python@3.13/bin/python3
```

Ou adicione ao PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/python@3.13/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Scripts não encontram módulos Python

Certifique-se de usar o Python correto:

```bash
# Verificar qual Python está sendo usado
which python3

# Se necessário, criar alias
alias python3='/opt/homebrew/opt/python@3.13/bin/python3'
```

## 📦 Instalação Completa (Script Automatizado)

Execute este script para instalação completa:

```bash
#!/bin/bash
set -e

echo "=== Instalando PPTX Processing Skill ==="
cd /Users/luizfosc/aios-core/.aios/skills/document-processing/pptx

echo "1. Instalando dependências Python..."
/opt/homebrew/opt/python@3.13/bin/pip3 install -r requirements.txt

echo "2. Instalando dependências Node.js..."
npm install

echo "3. Instalando browsers Playwright..."
npx playwright install chromium

echo "4. Tornando scripts executáveis..."
chmod +x scripts/*.py ooxml/scripts/*.py

echo ""
echo "✅ Instalação completa!"
echo ""
echo "Execute './verify-setup.sh' para verificar a instalação."
```

## 🎯 Próximos Passos

Após instalação bem-sucedida:

1. ✅ Leia o `README.md` para visão geral
2. ✅ Consulte `SKILL.md` para workflows completos
3. ✅ Veja `html2pptx.md` para detalhes de conversão HTML
4. ✅ Leia `ooxml.md` para manipulação avançada de XML
5. ✅ Execute os testes de funcionamento acima

## 📞 Suporte

Em caso de problemas:

1. Verifique se todas as dependências estão instaladas (`./verify-setup.sh`)
2. Consulte a seção Troubleshooting deste arquivo
3. Leia os logs de erro completos
4. Verifique permissões de arquivos e diretórios

---

**Última atualização:** 2026-02-04
**Sistema:** macOS (Darwin 25.2.0)
**Python:** 3.13 (Homebrew)
**Node.js:** via Homebrew
