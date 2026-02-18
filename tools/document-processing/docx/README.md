# DOCX Processing Skill - AIOS

Skill completo para criação, edição e análise de documentos Word (.docx) via CLI com suporte a tracked changes (redlining).

## 📁 Estrutura Instalada

```
.aios/skills/document-processing/docx/
├── README.md                  # Este arquivo
├── SETUP.md                   # Guia de instalação
├── SKILL.md                   # Documentação principal
├── docx-js.md                 # Guia de criação com docx.js
├── ooxml.md                   # Referência técnica OOXML
├── LICENSE.txt                # Licença
├── requirements.txt           # Dependências Python
├── package.json               # Dependências Node.js
├── scripts/                   # Scripts Python
│   ├── __init__.py
│   ├── document.py            # Manipulação de documentos
│   ├── utilities.py           # Utilitários
│   └── templates/             # Templates XML para comentários
│       ├── comments.xml
│       ├── commentsExtended.xml
│       ├── commentsExtensible.xml
│       ├── commentsIds.xml
│       └── people.xml
└── ooxml/
    └── scripts/               # Scripts OOXML
        ├── pack.py            # Empacotar DOCX
        ├── unpack.py          # Desempacotar DOCX
        ├── validate.py        # Validar estrutura
        └── validation/        # Módulos de validação
```

## 🚀 Quick Start

### 1. Instalação de Dependências

```bash
# Navegar até o diretório do skill
cd /Users/luizfosc/aios-core/.aios/skills/document-processing/docx

# Executar instalação automática
./install.sh

# Ou manualmente:
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
deactivate
```

### 2. Verificar Instalação

```bash
./verify-setup.sh
```

## 📚 Workflows Principais

### 1. Ler e Analisar Documentos

#### Extrair texto para Markdown (com tracked changes)

```bash
pandoc --track-changes=all input.docx -o output.md
```

#### Acessar XML bruto

```bash
source .venv/bin/activate
python ooxml/scripts/unpack.py document.docx extracted/
ls -la extracted/word/
deactivate
```

**Estrutura OOXML:**
- `word/document.xml` - Conteúdo principal
- `word/comments.xml` - Comentários
- `word/styles.xml` - Estilos
- `word/numbering.xml` - Listas numeradas
- `word/settings.xml` - Configurações
- `word/_rels/` - Relacionamentos

### 2. Criar Documentos Novos

Use **docx** (Node.js/TypeScript) para criar documentos programaticamente:

```javascript
const { Document, Paragraph, TextRun, AlignmentType } = require('docx');
const fs = require('fs');

// Criar documento
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Título do Documento",
            bold: true,
            size: 32,  // 16pt (size é em half-points)
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Este é um parágrafo normal com ",
          }),
          new TextRun({
            text: "texto em negrito",
            bold: true,
          }),
          new TextRun({
            text: " e ",
          }),
          new TextRun({
            text: "texto em itálico",
            italics: true,
          }),
          new TextRun({
            text: ".",
          }),
        ],
      }),
    ],
  }],
});

// Salvar
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('output.docx', buffer);
```

**IMPORTANTE:** Sempre leia `docx-js.md` completamente antes de criar documentos.

### 3. Editar Documentos Existentes (OOXML)

```bash
# 1. Ler documentação
cat ooxml.md

# 2. Desempacotar
source .venv/bin/activate
python ooxml/scripts/unpack.py original.docx unpacked/

# 3. Editar XML (usando scripts Python ou manual)
# Modificar unpacked/word/document.xml

# 4. Validar
python ooxml/scripts/validate.py unpacked/ --original original.docx

# 5. Reempacotar
python ooxml/scripts/pack.py unpacked/ modified.docx

deactivate
```

### 4. Redlining (Tracked Changes)

Workflow especializado para implementar revisões/track changes:

#### Fase 1: Planejamento

```bash
# Converter para Markdown
pandoc --track-changes=all original.docx -o original.md

# Identificar mudanças necessárias
# Criar plano em lotes (batches) de 3-10 mudanças relacionadas
```

#### Fase 2: Implementação por Batch

```bash
source .venv/bin/activate

# Desempacotar (apenas uma vez)
python ooxml/scripts/unpack.py original.docx working/

# Para cada batch:
# 1. Implementar mudanças via scripts Python
python scripts/document.py add-comment working/ "Seção 1" "Texto do comentário" --author "Revisor"

# 2. Validar após cada batch
python ooxml/scripts/validate.py working/ --original original.docx

# 3. Testar (empacotar temporário)
python ooxml/scripts/pack.py working/ test_batch1.docx
# Abrir test_batch1.docx no Word e verificar

# Após todos os batches:
python ooxml/scripts/pack.py working/ final_reviewed.docx

deactivate
```

**Princípios do Redlining:**
- **Batching:** 3-10 mudanças relacionadas por batch
- **Edição Mínima:** Marcar apenas texto alterado
- **Localização:** Use números de seção, grep, ou estrutura (nunca linha do MD)
- **Preservação:** Manter formatação original intacta

## 🎨 Conversão de Formato

### DOCX → PDF

```bash
/Applications/LibreOffice.app/Contents/MacOS/soffice --headless \
  --convert-to pdf input.docx --outdir output/
```

### DOCX → Imagens (JPEG)

```bash
# DOCX → PDF
soffice --headless --convert-to pdf input.docx --outdir temp/

# PDF → JPEG (150 DPI)
pdftoppm -jpeg -r 150 temp/input.pdf output/page
```

## 🛠️ Scripts Disponíveis

### Python Scripts (ooxml/)

| Script | Uso | Descrição |
|--------|-----|-----------|
| `ooxml/scripts/unpack.py` | `python unpack.py input.docx output_dir/` | Desempacotar DOCX |
| `ooxml/scripts/pack.py` | `python pack.py input_dir/ output.docx` | Empacotar DOCX |
| `ooxml/scripts/validate.py` | `python validate.py dir/ --original file.docx` | Validar estrutura |

### Python Scripts (main)

| Script | Descrição |
|--------|-----------|
| `scripts/document.py` | Operações em documentos (adicionar comentários, etc) |
| `scripts/utilities.py` | Utilitários auxiliares |

### Templates XML

Templates prontos para adicionar comentários e reviews em `scripts/templates/`.

## 📖 Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| `SKILL.md` | Guia completo com todos os workflows |
| `docx-js.md` | Documentação da biblioteca docx.js |
| `ooxml.md` | Referência técnica XML/OOXML |
| `SETUP.md` | Instalação detalhada |

## 🔧 Dependências

### Python Packages

```
defusedxml>=0.7.1          # Parsing seguro de XML
lxml>=4.9.0                # Manipulação de XML
python-docx>=0.8.11        # Manipulação de DOCX (high-level)
```

### Node.js Packages

```
docx>=8.5.0                # Criação de documentos Word
```

### External Tools

- **pandoc** - Conversão de formatos (`brew install pandoc`)
- **LibreOffice** - Conversão para PDF (`brew install --cask libreoffice`)
- **Poppler** - PDF para imagens (`brew install poppler`)

## 🧪 Exemplos de Uso

### Criar documento simples

```javascript
const { Document, Paragraph, TextRun, Packer } = require('docx');
const fs = require('fs');

async function createDocument() {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "Hello World!",
              bold: true,
              size: 28,
            }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('hello.docx', buffer);
}

createDocument();
```

### Extrair texto de DOCX

```bash
# Método 1: Pandoc (preserva estrutura)
pandoc input.docx -t markdown -o output.md

# Método 2: Python
python << 'EOF'
from docx import Document

doc = Document('input.docx')
for para in doc.paragraphs:
    print(para.text)
EOF
```

### Adicionar comentário em documento

```python
# Usar scripts customizados em scripts/document.py
# (Ver SKILL.md para detalhes de implementação)
```

## ⚠️ Regras Críticas

### ✅ SEMPRE FAÇA

1. **Leia documentação completa** antes de criar/editar
   - `docx-js.md` para criação
   - `ooxml.md` para edição

2. **Valide após modificações**
   ```bash
   python ooxml/scripts/validate.py unpacked/ --original original.docx
   ```

3. **Trabalhe em batches** para redlining (3-10 mudanças)

4. **Preserve formatação** original ao editar

5. **Teste em Word** após cada batch de mudanças

### ❌ NUNCA FAÇA

1. Editar XML sem ler `ooxml.md` primeiro
2. Usar números de linha de Markdown para localização
3. Pular validação após modificações
4. Modificar mais de 10 itens por batch no redlining
5. Referenciar elementos XML que não existem no documento

## 🎯 Quando Usar Este Skill

✅ **Use para:**
- Criar documentos Word programaticamente
- Implementar tracked changes (redlining)
- Extrair conteúdo estruturado de DOCX
- Automatizar geração de relatórios
- Processar documentos em lote
- Adicionar/modificar comentários

❌ **Não use para:**
- Edição visual de documentos (use Word)
- Design gráfico complexo
- OCR de imagens em documentos
- Documentos únicos sem automação

## 📦 Instalação de Dependências Externas

### macOS (Homebrew)

```bash
# pandoc
brew install pandoc

# LibreOffice
brew install --cask libreoffice

# Poppler
brew install poppler

# Verificar instalações
pandoc --version
/Applications/LibreOffice.app/Contents/MacOS/soffice --version
pdftoppm -v
```

## 🔗 Recursos Adicionais

- [docx.js Documentation](https://docx.js.org/)
- [python-docx Documentation](https://python-docx.readthedocs.io/)
- [Pandoc Documentation](https://pandoc.org/MANUAL.html)
- [Office Open XML Spec](https://learn.microsoft.com/en-us/openspecs/office_standards/)

---

**Instalado em:** 2026-02-04
**Fonte:** https://github.com/davila7/claude-code-templates
**Sistema:** AIOS Core - Synkra AI
