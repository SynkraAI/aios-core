# Document Processing Skills - AIOS

Coleção completa de skills para processamento de documentos Office (PowerPoint, Excel, Word).

## 📦 Skills Instalados

### ✅ 1. PPTX (PowerPoint)
**Localização:** `.aios/skills/document-processing/pptx/`

**Capacidades:**
- ✓ Criar apresentações do zero (HTML → PPTX)
- ✓ Editar apresentações existentes (via OOXML)
- ✓ Trabalhar com templates
- ✓ Gerar thumbnails
- ✓ Reordenar/duplicar/deletar slides
- ✓ Substituir texto em lote
- ✓ Extrair conteúdo

**Quick Start:**
```bash
cd .aios/skills/document-processing/pptx
./verify-setup.sh
cat README.md
```

---

### ✅ 2. XLSX (Excel)
**Localização:** `.aios/skills/document-processing/xlsx/`

**Capacidades:**
- ✓ Criar planilhas com fórmulas
- ✓ Análise e manipulação de dados
- ✓ Editar planilhas existentes
- ✓ Recalcular fórmulas
- ✓ Formatação avançada
- ✓ Modelos financeiros

**Quick Start:**
```bash
cd .aios/skills/document-processing/xlsx
./verify-setup.sh
cat README.md
```

---

### ✅ 3. DOCX (Word)
**Localização:** `.aios/skills/document-processing/docx/`

**Capacidades:**
- ✓ Criar documentos programaticamente
- ✓ Editar documentos existentes
- ✓ Redlining (tracked changes)
- ✓ Adicionar comentários
- ✓ Extrair conteúdo
- ✓ Conversão de formatos

**Quick Start:**
```bash
cd .aios/skills/document-processing/docx
./verify-setup.sh
cat README.md
```

---

## 🚀 Instalação Geral

### Status Atual

| Skill | Python | Node.js | Scripts | Status |
|-------|--------|---------|---------|--------|
| **PPTX** | ✅ | ✅ | ✅ | Pronto |
| **XLSX** | ✅ | - | ✅ | Pronto |
| **DOCX** | ✅ | ✅ | ✅ | Pronto |

### Dependências Externas Recomendadas

```bash
# LibreOffice (para PDF e recálculo de fórmulas)
brew install --cask libreoffice

# Poppler (para conversão PDF → imagem)
brew install poppler

# Pandoc (para conversão de documentos)
brew install pandoc

# Verificar instalações
/Applications/LibreOffice.app/Contents/MacOS/soffice --version
pdftoppm -v
pandoc --version
```

---

## 📚 Estrutura Completa

```
.aios/skills/document-processing/
├── README.md                     # Este arquivo
├── pptx/                         # PowerPoint
│   ├── README.md
│   ├── SKILL.md
│   ├── SETUP.md
│   ├── html2pptx.md
│   ├── ooxml.md
│   ├── requirements.txt
│   ├── package.json
│   ├── install.sh
│   ├── verify-setup.sh
│   ├── .venv/                    # Virtual environment Python
│   ├── node_modules/             # Dependências Node.js
│   ├── scripts/                  # Scripts principais
│   │   ├── html2pptx.js
│   │   ├── inventory.py
│   │   ├── rearrange.py
│   │   ├── replace.py
│   │   └── thumbnail.py
│   └── ooxml/
│       └── scripts/              # Scripts OOXML
├── xlsx/                         # Excel
│   ├── README.md
│   ├── SKILL.md
│   ├── requirements.txt
│   ├── install.sh
│   ├── verify-setup.sh
│   ├── .venv/                    # Virtual environment Python
│   └── recalc.py
└── docx/                         # Word
    ├── README.md
    ├── SKILL.md
    ├── docx-js.md
    ├── ooxml.md
    ├── requirements.txt
    ├── package.json
    ├── install.sh
    ├── verify-setup.sh
    ├── .venv/                    # Virtual environment Python
    ├── node_modules/             # Dependências Node.js
    ├── scripts/
    │   ├── document.py
    │   ├── utilities.py
    │   └── templates/
    └── ooxml/
        └── scripts/
```

---

## 🛠️ Uso dos Scripts

### Ativando Virtual Environments

Todos os skills usam Python virtual environments isolados:

```bash
# PPTX
cd .aios/skills/document-processing/pptx
source .venv/bin/activate
python scripts/thumbnail.py example.pptx output/
deactivate

# XLSX
cd .aios/skills/document-processing/xlsx
source .venv/bin/activate
python recalc.py input.xlsx output.xlsx
deactivate

# DOCX
cd .aios/skills/document-processing/docx
source .venv/bin/activate
python ooxml/scripts/unpack.py doc.docx extracted/
deactivate
```

### Verificação de Instalação

```bash
# Verificar todos os skills
for skill in pptx xlsx docx; do
  echo "=== $skill ==="
  cd .aios/skills/document-processing/$skill
  ./verify-setup.sh
  cd -
done
```

---

## 📖 Documentação

Cada skill tem documentação completa:

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Visão geral e quick start |
| `SKILL.md` | Documentação completa do skill |
| `SETUP.md` | Guia de instalação detalhado |
| `*-js.md` | Documentação de bibliotecas JavaScript |
| `ooxml.md` | Referência técnica OOXML/XML |

---

## 🔧 Manutenção

### Atualizar Dependências

```bash
# Python (em cada skill)
source .venv/bin/activate
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt
deactivate

# Node.js (PPTX e DOCX)
npm update
```

### Recriar Virtual Environments

```bash
# Se algo der errado, recrie o venv
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
```

---

## 🎯 Casos de Uso Comuns

### 1. Automatizar Relatórios

```bash
# 1. Processar dados (XLSX)
cd xlsx && source .venv/bin/activate
python process_data.py raw.csv report.xlsx
deactivate

# 2. Criar apresentação (PPTX)
cd ../pptx && source .venv/bin/activate
node scripts/html2pptx.js slides.html presentation.pptx
deactivate

# 3. Gerar documento (DOCX)
cd ../docx && source .venv/bin/activate
node create_report.js
deactivate
```

### 2. Processar Templates em Lote

```bash
# PPTX: Duplicar slides e substituir texto
cd pptx && source .venv/bin/activate
python scripts/rearrange.py template.pptx working.pptx 0,5,5,10
python scripts/replace.py working.pptx replacements.json final.pptx
deactivate
```

### 3. Implementar Redlining (DOCX)

```bash
cd docx && source .venv/bin/activate

# Converter para markdown
pandoc --track-changes=all original.docx -o original.md

# Desempacotar
python ooxml/scripts/unpack.py original.docx working/

# Implementar mudanças (em batches)
python scripts/document.py add-comment working/ "Section" "Comment"

# Validar e empacotar
python ooxml/scripts/validate.py working/ --original original.docx
python ooxml/scripts/pack.py working/ reviewed.docx

deactivate
```

---

## 🐛 Troubleshooting

### Problema: "Module not found"

```bash
# Verificar se venv está ativado
source .venv/bin/activate

# Reinstalar dependências
pip install -r requirements.txt
```

### Problema: "Permission denied"

```bash
chmod +x *.sh scripts/*.py ooxml/scripts/*.py
```

### Problema: Scripts não funcionam

```bash
# Verificar Python correto
which python3

# Recriar venv
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 📝 Notas Importantes

### Virtual Environments

- Cada skill tem seu próprio `.venv/`
- **SEMPRE ative** o venv antes de usar scripts Python
- Desative com `deactivate` quando terminar

### Dependências Node.js

- PPTX e DOCX usam Node.js para algumas operações
- Instaladas localmente em `node_modules/`
- Use `npm install` se ausentes

### Ferramentas Externas

- LibreOffice, Pandoc e Poppler são opcionais mas recomendados
- Necessários para conversões avançadas (PDF, imagens, etc)

---

## 🔗 Links Úteis

- **Fonte:** https://github.com/davila7/claude-code-templates
- **Sistema:** AIOS Core - Synkra AI
- **Documentação AIOS:** /Users/luizfosc/aios-core/docs/

---

**Instalado em:** 2026-02-04
**Versão:** 1.0.0
**Skills:** PPTX, XLSX, DOCX
**Status:** ✅ Totalmente Instalado e Funcional
