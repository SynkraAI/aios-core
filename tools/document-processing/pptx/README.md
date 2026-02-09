# PPTX Processing Skill - AIOS

Skill completo para criação, edição e análise de apresentações PowerPoint (.pptx) via CLI.

## 📁 Estrutura Instalada

```
.aios/skills/document-processing/pptx/
├── README.md              # Este arquivo
├── SETUP.md               # Guia de instalação de dependências
├── SKILL.md               # Documentação principal do skill
├── html2pptx.md          # Guia de conversão HTML → PPTX
├── ooxml.md              # Referência técnica OOXML
├── LICENSE.txt           # Licença
├── requirements.txt      # Dependências Python
├── package.json          # Dependências Node.js
├── scripts/              # Scripts principais
│   ├── html2pptx.js      # Biblioteca de conversão HTML → PPTX
│   ├── inventory.py      # Extrair inventário de slides
│   ├── rearrange.py      # Reordenar/duplicar/deletar slides
│   ├── replace.py        # Substituir texto em slides
│   └── thumbnail.py      # Gerar grid de thumbnails
└── ooxml/
    └── scripts/          # Scripts OOXML
        ├── pack.py       # Empacotar PPTX
        ├── unpack.py     # Desempacotar PPTX
        ├── validate.py   # Validar estrutura PPTX
        └── validation/   # Módulos de validação
```

## 🚀 Quick Start

### 1. Instalação de Dependências

```bash
# Navegar até o diretório do skill
cd /Users/luizfosc/aios-core/.aios/skills/document-processing/pptx

# Instalar dependências Python
pip3 install -r requirements.txt

# Instalar dependências Node.js
npm install

# Instalar Playwright browsers (necessário para HTML → PPTX)
npx playwright install chromium
```

### 2. Verificar Instalação

```bash
# Testar scripts Python
python3 scripts/thumbnail.py --help
python3 ooxml/scripts/unpack.py --help

# Testar Node.js
node -e "console.log('Node.js OK')"
```

## 📚 Workflows Principais

### 1. Criar Apresentação do Zero (HTML → PPTX)

```bash
# 1. Ler guia completo
cat html2pptx.md

# 2. Criar HTML com dimensões corretas (720pt × 405pt para 16:9)
# 3. Converter para PPTX usando html2pptx.js
node scripts/html2pptx.js input.html output.pptx

# 4. Gerar thumbnails para validação
python3 scripts/thumbnail.py output.pptx thumbnails/ --cols 4
```

### 2. Editar Apresentação Existente (OOXML)

```bash
# 1. Desempacotar PPTX
python3 ooxml/scripts/unpack.py presentation.pptx extracted/

# 2. Editar arquivos XML em extracted/ppt/slides/

# 3. Validar mudanças
python3 ooxml/scripts/validate.py extracted/ --original presentation.pptx

# 4. Reempacotar
python3 ooxml/scripts/pack.py extracted/ modified.pptx
```

### 3. Trabalhar com Templates

```bash
# 1. Gerar thumbnails do template
python3 scripts/thumbnail.py template.pptx thumbnails/ --cols 5

# 2. Extrair inventário de texto
python3 scripts/inventory.py template.pptx inventory.json

# 3. Reordenar slides (duplicar slide 34, usar slides 0,34,34,50,52)
python3 scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52

# 4. Substituir texto
python3 scripts/replace.py working.pptx replacements.json output.pptx
```

### 4. Extrair Conteúdo de PPTX

```bash
# Converter para Markdown (requer markitdown)
python3 -m markitdown presentation.pptx > content.md

# Extrair estrutura XML
python3 ooxml/scripts/unpack.py presentation.pptx extracted/
```

## 🎨 Design Guidelines

**Fontes permitidas (web-safe only):**
- Arial, Helvetica, Times New Roman, Georgia
- Courier New, Verdana, Tahoma, Trebuchet MS, Impact

**Dimensões de slides:**
- 16:9 → `width: 720pt; height: 405pt`
- 4:3 → `width: 720pt; height: 540pt`
- 16:10 → `width: 720pt; height: 450pt`

**Regras importantes:**
- Todo texto DEVE estar dentro de `<p>`, `<h1>`-`<h6>`, `<ul>` ou `<ol>`
- Backgrounds/borders só funcionam em `<div>`, não em elementos de texto
- NUNCA use `#` em cores hex com PptxGenJS (use `FF0000` ao invés de `#FF0000`)
- Prefira layouts de duas colunas (header full-width, colunas 40/60)

## 📖 Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| `SKILL.md` | Guia completo com todos os workflows |
| `html2pptx.md` | Detalhes de conversão HTML → PPTX |
| `ooxml.md` | Referência técnica XML/OOXML |
| `SETUP.md` | Instalação detalhada de dependências |

## 🛠️ Scripts Disponíveis

### Python Scripts

| Script | Uso | Descrição |
|--------|-----|-----------|
| `scripts/inventory.py` | `python3 scripts/inventory.py input.pptx output.json` | Extrai inventário de texto e shapes |
| `scripts/rearrange.py` | `python3 scripts/rearrange.py input.pptx output.pptx 0,1,1,3` | Reordena/duplica slides |
| `scripts/replace.py` | `python3 scripts/replace.py input.pptx replacements.json output.pptx` | Substitui texto |
| `scripts/thumbnail.py` | `python3 scripts/thumbnail.py input.pptx output/ --cols 4` | Gera thumbnails |
| `ooxml/scripts/unpack.py` | `python3 ooxml/scripts/unpack.py file.pptx output_dir/` | Desempacota PPTX |
| `ooxml/scripts/pack.py` | `python3 ooxml/scripts/pack.py input_dir/ output.pptx` | Empacota PPTX |
| `ooxml/scripts/validate.py` | `python3 ooxml/scripts/validate.py dir/ --original file.pptx` | Valida estrutura |

### JavaScript Scripts

| Script | Uso | Descrição |
|--------|-----|-----------|
| `scripts/html2pptx.js` | `node scripts/html2pptx.js input.html output.pptx` | Converte HTML → PPTX |

## 🔧 Troubleshooting

### Erro: "Module not found"
```bash
pip3 install -r requirements.txt
npm install
```

### Erro: "Playwright not installed"
```bash
npx playwright install chromium
```

### Erro: "Permission denied"
```bash
chmod +x scripts/*.py ooxml/scripts/*.py
```

### PPTX corrompido após edição
```bash
# Sempre valide antes de empacotar
python3 ooxml/scripts/validate.py extracted/ --original original.pptx
```

## 📝 Exemplos de Uso

### Criar apresentação simples

```html
<!-- slide.html -->
<div style="width: 720pt; height: 405pt; background: #1a1a2e; padding: 40pt;">
  <h1 style="color: white; font-size: 48pt; font-family: Arial;">
    Minha Apresentação
  </h1>
  <p style="color: #cccccc; font-size: 24pt; font-family: Arial;">
    Subtítulo aqui
  </p>
</div>
```

```bash
node scripts/html2pptx.js slide.html output.pptx
```

### Duplicar slide específico

```bash
# Duplicar slide 5 três vezes
python3 scripts/rearrange.py input.pptx output.pptx 0,1,2,3,4,5,5,5,6,7
```

### Substituir texto em lote

```json
// replacements.json
{
  "{{COMPANY}}": "AIOS Corp",
  "{{YEAR}}": "2026",
  "{{AUTHOR}}": "Luiz Fosc"
}
```

```bash
python3 scripts/replace.py template.pptx replacements.json output.pptx
```

## 🎯 Quando Usar Este Skill

✅ **Use para:**
- Gerar apresentações programaticamente
- Automatizar criação de reports
- Processar templates em lote
- Extrair conteúdo de PPTX
- Modificar apresentações existentes via script

❌ **Não use para:**
- Edição visual interativa (use PowerPoint)
- Design gráfico complexo (crie em ferramenta visual primeiro)
- Apresentações únicas sem automação

## 📦 Dependências Externas

### Obrigatórias
- Python 3.9+
- Node.js 18+
- pip3
- npm

### Opcionais
- LibreOffice (para conversão PDF)
- Poppler (para PDF → imagem)

## 🔗 Recursos Adicionais

- [PptxGenJS Docs](https://gitbrent.github.io/PptxGenJS/)
- [Office Open XML Spec](https://learn.microsoft.com/en-us/openspecs/office_standards/)
- [Playwright Docs](https://playwright.dev/)

---

**Instalado em:** 2026-02-04
**Fonte:** https://github.com/davila7/claude-code-templates
**Sistema:** AIOS Core - Synkra AI
