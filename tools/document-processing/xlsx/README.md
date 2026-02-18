# XLSX Processing Skill - AIOS

Skill completo para criação, edição e análise de planilhas Excel (.xlsx, .xlsm, .csv, .tsv) via CLI.

## 📁 Estrutura Instalada

```
.aios/skills/document-processing/xlsx/
├── README.md              # Este arquivo
├── SETUP.md               # Guia de instalação de dependências
├── SKILL.md               # Documentação principal do skill
├── LICENSE.txt            # Licença
├── requirements.txt       # Dependências Python
├── recalc.py              # Script de recálculo de fórmulas
└── .venv/                 # Virtual environment Python
```

## 🚀 Quick Start

### 1. Instalação de Dependências

```bash
# Navegar até o diretório do skill
cd /Users/luizfosc/aios-core/.aios/skills/document-processing/xlsx

# Executar instalação automática
./install.sh

# Ou instalar manualmente:
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
```

### 2. Verificar Instalação

```bash
./verify-setup.sh
```

## 📚 Capacidades Principais

### 1. Criar Planilhas Novas

Use **pandas** para operações básicas:

```python
import pandas as pd

# Criar DataFrame
df = pd.DataFrame({
    'Produto': ['A', 'B', 'C'],
    'Quantidade': [10, 20, 30],
    'Preço': [100, 200, 300]
})

# Adicionar coluna com fórmula
df['Total'] = df['Quantidade'] * df['Preço']

# Salvar
df.to_excel('output.xlsx', index=False)
```

Use **openpyxl** para formatação avançada e fórmulas:

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

wb = Workbook()
ws = wb.active

# Headers com formatação
ws['A1'] = 'Produto'
ws['A1'].font = Font(bold=True)
ws['A1'].fill = PatternFill(start_color="CCCCCC", fill_type="solid")

# Fórmula Excel (não valor calculado)
ws['D2'] = '=B2*C2'

wb.save('formatted.xlsx')
```

### 2. Analisar e Ler Planilhas

```python
# Ler com pandas
df = pd.read_excel('data.xlsx', sheet_name='Sheet1')
print(df.head())
print(df.describe())

# Ler com openpyxl (preserva fórmulas)
from openpyxl import load_workbook
wb = load_workbook('data.xlsx')
ws = wb.active
print(ws['A1'].value)  # Valor
print(ws['D2'].value)  # Resultado da fórmula
```

### 3. Editar Planilhas Existentes

```python
from openpyxl import load_workbook

# Carregar planilha existente
wb = load_workbook('existing.xlsx')
ws = wb.active

# Modificar dados
ws['A1'] = 'Novo Título'
ws['B5'] = '=SUM(B2:B4)'

# Salvar
wb.save('modified.xlsx')

# Recalcular fórmulas (obrigatório após modificações)
```

### 4. Recalcular Fórmulas

**IMPORTANTE:** Sempre recalcule fórmulas após criar ou modificar planilhas.

```bash
# Ativar venv e recalcular
source .venv/bin/activate
python recalc.py input.xlsx output.xlsx
deactivate
```

O script `recalc.py` usa LibreOffice em modo headless para recalcular todas as fórmulas.

## 🎨 Convenções de Modelo Financeiro

### Código de Cores (Padrão Excel)

| Cor | Significado | Uso |
|-----|-------------|-----|
| **Azul** | Entrada do usuário | Valores que podem ser alterados |
| **Preto** | Fórmulas e cálculos | Valores derivados de fórmulas |
| **Verde** | Links internos | Referências a outras planilhas no mesmo arquivo |
| **Vermelho** | Links externos | Referências a outros arquivos |
| **Amarelo (fundo)** | Premissas-chave | Valores que requerem atenção especial |

### Formatação de Números

```python
from openpyxl.styles import numbers

# Anos como texto
ws['A1'].number_format = '@'  # Text format

# Moeda
ws['B2'].number_format = '$#,##0.00'

# Percentuais
ws['C2'].number_format = '0.0%'

# Negativos entre parênteses
ws['D2'].number_format = '#,##0_);(#,##0)'
```

## 🛠️ Scripts Disponíveis

### recalc.py - Recálculo de Fórmulas

```bash
python recalc.py <input.xlsx> <output.xlsx>
```

**Funcionalidade:**
- Abre planilha no LibreOffice em modo headless
- Força recálculo de todas as fórmulas
- Salva resultado
- Fecha LibreOffice

**Requer:** LibreOffice instalado (`brew install --cask libreoffice`)

## ⚠️ Regras Críticas

### ✅ SEMPRE FAÇA

1. **Use fórmulas Excel**, nunca valores calculados em Python
   ```python
   # ✓ CORRETO
   ws['D2'] = '=B2*C2'

   # ✗ ERRADO
   ws['D2'] = row['Quantidade'] * row['Preço']
   ```

2. **Recalcule após modificações**
   ```bash
   python recalc.py modified.xlsx final.xlsx
   ```

3. **Verifique erros** - Zero erros de fórmula permitidos
   - #REF! - Referência inválida
   - #DIV/0! - Divisão por zero
   - #VALUE! - Tipo de valor errado
   - #N/A - Valor não disponível
   - #NAME? - Nome de função desconhecido

4. **Preserve formatação** ao editar planilhas existentes

### ❌ NUNCA FAÇA

1. Calcular valores em Python e hardcoded em células
2. Ignorar recálculo após modificações
3. Criar planilhas com erros de fórmula
4. Mudar formatação de templates existentes sem razão

## 📖 Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| `SKILL.md` | Guia completo do skill |
| `SETUP.md` | Instalação detalhada |
| `.venv-usage.md` | Como usar o virtual environment |

## 🔧 Dependências

### Python Packages

```
pandas>=2.0.0           # Data analysis and manipulation
openpyxl>=3.1.0        # Excel file manipulation
xlrd>=2.0.0            # Reading old .xls files
xlsxwriter>=3.1.0      # Alternative Excel writer
```

### External Tools

- **LibreOffice** - Para recálculo de fórmulas (`brew install --cask libreoffice`)

### Opcionais

- **matplotlib** - Para gráficos
- **seaborn** - Para visualizações avançadas

## 🧪 Exemplos de Uso

### Criar relatório financeiro simples

```python
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

# Criar planilha
wb = Workbook()
ws = wb.active
ws.title = "Relatório Financeiro"

# Headers
headers = ['Mês', 'Receita', 'Despesas', 'Lucro']
for col, header in enumerate(headers, 1):
    cell = ws.cell(1, col, header)
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = PatternFill(start_color="4F81BD", fill_type="solid")

# Dados (azul = input do usuário)
meses = ['Jan', 'Fev', 'Mar']
receitas = [10000, 12000, 11000]
despesas = [7000, 8000, 7500]

for row, (mes, receita, despesa) in enumerate(zip(meses, receitas, despesas), 2):
    ws.cell(row, 1, mes)
    ws.cell(row, 2, receita).font = Font(color="0000FF")  # Azul = input
    ws.cell(row, 3, despesa).font = Font(color="0000FF")  # Azul = input
    # Fórmula (preto = calculado)
    ws.cell(row, 4, f'=B{row}-C{row}')

# Totais
ws.cell(5, 1, "TOTAL").font = Font(bold=True)
ws.cell(5, 2, "=SUM(B2:B4)")
ws.cell(5, 3, "=SUM(C2:C4)")
ws.cell(5, 4, "=SUM(D2:D4)")

# Formatação de moeda
for row in range(2, 6):
    for col in [2, 3, 4]:
        ws.cell(row, col).number_format = 'R$ #,##0.00'

wb.save('relatorio.xlsx')

# Recalcular
import subprocess
subprocess.run(['python', 'recalc.py', 'relatorio.xlsx', 'relatorio_final.xlsx'])
```

### Análise de dados com pandas

```python
import pandas as pd

# Ler planilha
df = pd.read_excel('vendas.xlsx')

# Análise estatística
print(df.describe())

# Filtrar dados
vendas_altas = df[df['Valor'] > 1000]

# Agrupar e agregar
resumo = df.groupby('Produto').agg({
    'Quantidade': 'sum',
    'Valor': 'mean'
})

# Salvar resultado
resumo.to_excel('resumo_vendas.xlsx')
```

## 🎯 Quando Usar Este Skill

✅ **Use para:**
- Criar planilhas com fórmulas complexas
- Automatizar relatórios financeiros
- Processar e analisar dados tabulares
- Converter CSVs para Excel formatado
- Modificar planilhas mantendo fórmulas

❌ **Não use para:**
- Cálculos simples (use pandas diretamente)
- Manipulação de dados não-tabulares
- Operações que não envolvem arquivos Excel

## 📦 Instalação de Dependências Externas

### LibreOffice (macOS)

```bash
brew install --cask libreoffice

# Verificar instalação
/Applications/LibreOffice.app/Contents/MacOS/soffice --version
```

### Opcionais

```bash
# Instalar matplotlib para gráficos
source .venv/bin/activate
pip install matplotlib seaborn
deactivate
```

## 🔗 Recursos Adicionais

- [pandas Documentation](https://pandas.pydata.org/docs/)
- [openpyxl Documentation](https://openpyxl.readthedocs.io/)
- [Excel Formula Reference](https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb)

---

**Instalado em:** 2026-02-04
**Fonte:** https://github.com/davila7/claude-code-templates
**Sistema:** AIOS Core - Synkra AI
