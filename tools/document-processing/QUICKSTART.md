# Quick Start - Document Processing Skills

Guia rápido para começar a usar os skills de processamento de documentos.

## 🎯 Escolha seu skill

| Preciso de... | Use | Comando |
|---------------|-----|---------|
| Criar/editar PowerPoint | **PPTX** | `cd pptx && cat README.md` |
| Trabalhar com Excel | **XLSX** | `cd xlsx && cat README.md` |
| Criar/editar Word | **DOCX** | `cd docx && cat README.md` |

## ⚡ Exemplos Rápidos

### PPTX - Gerar thumbnails de apresentação

```bash
cd pptx
source .venv/bin/activate
python scripts/thumbnail.py sua-apresentacao.pptx output/ --cols 4
deactivate
```

### XLSX - Criar planilha com fórmulas

```python
# criar_planilha.py
from openpyxl import Workbook

wb = Workbook()
ws = wb.active

# Headers
ws['A1'] = 'Produto'
ws['B1'] = 'Quantidade'
ws['C1'] = 'Preço'
ws['D1'] = 'Total'

# Dados
ws['A2'] = 'Produto A'
ws['B2'] = 10
ws['C2'] = 100
ws['D2'] = '=B2*C2'  # Fórmula Excel

wb.save('exemplo.xlsx')
```

```bash
cd xlsx
source .venv/bin/activate
python criar_planilha.py
python recalc.py exemplo.xlsx exemplo_final.xlsx
deactivate
```

### DOCX - Criar documento simples

```javascript
// criar_documento.js
const { Document, Paragraph, TextRun, Packer } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "Olá Mundo!", bold: true, size: 28 }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('exemplo.docx', buffer);
  console.log('✓ Documento criado!');
});
```

```bash
cd docx
node criar_documento.js
```

## 📚 Documentação Completa

Cada skill tem documentação detalhada:

```bash
# Visão geral de todos os skills
cat README.md

# Documentação específica de um skill
cd pptx && cat SKILL.md
cd xlsx && cat SKILL.md
cd docx && cat SKILL.md
```

## 🔧 Verificar Instalação

```bash
# Verificar todos os skills
for skill in pptx xlsx docx; do
  cd $skill
  ./verify-setup.sh
  cd ..
done
```

## 💡 Dicas

1. **SEMPRE ative o virtual environment** antes de usar scripts Python:
   ```bash
   source .venv/bin/activate
   ```

2. **Desative quando terminar**:
   ```bash
   deactivate
   ```

3. **Leia a documentação completa** no README.md de cada skill

4. **Use os exemplos** como ponto de partida

---

**Localização:** `/Users/luizfosc/aios-core/.aios/skills/document-processing/`
**Instalado:** 2026-02-04
