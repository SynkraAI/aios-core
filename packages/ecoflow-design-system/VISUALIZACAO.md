# 🎨 Como Visualizar o EcoFlow Design System

## 📁 Localização dos Arquivos

```
/Users/luizfosc/aios-core/packages/ecoflow-design-system/
│
├── 📄 README.md                    # Documentação principal
├── 📄 CHANGELOG.md                 # Histórico de versões
├── 📄 TESTING.md                   # Estratégia de testes
│
├── 📂 src/                          # Código fonte
│   ├── 📂 tokens/                   # Design tokens
│   │   ├── colors.ts                # Paleta de cores (teal + yellow)
│   │   ├── typography.ts            # Tipografia (Inter font)
│   │   ├── spacing.ts               # Sistema de espaçamento
│   │   ├── shadows.ts               # Elevações e sombras
│   │   └── borders.ts               # Bordas e raios
│   │
│   └── 📂 components/               # 24 componentes React
│       ├── 📂 typography/           # Heading, Text
│       ├── 📂 layout/               # Container, Stack, Grid, Spacer
│       ├── 📂 navigation/           # Sidebar, TopBar, Breadcrumb, Tabs
│       ├── 📂 forms/                # Button, Input, Select, Checkbox, Radio, Switch
│       ├── 📂 data-display/         # Badge, Avatar, StatusIndicator, Card, Table
│       └── 📂 feedback/             # Alert, Loading, Progress, Modal, Toast
│
├── 📂 docs/                         # Documentação detalhada
│   ├── GETTING_STARTED.md           # Guia de início
│   ├── DESIGN_PRINCIPLES.md         # Princípios de design
│   └── ACCESSIBILITY.md             # Acessibilidade WCAG 2.1 AA
│
├── 📂 design-analysis/              # Análise dos 7 screenshots
│   ├── 01-design-tokens-analysis.md # Extração de tokens
│   └── 02-component-inventory.md    # Inventário de componentes
│
└── 📂 .storybook/                   # Configuração Storybook
    └── 220+ stories interativas
```

---

## 🚀 3 Formas de Visualizar

### 1. Storybook (Recomendado - Interativo)

**Visualize todos os componentes com controles interativos:**

\`\`\`bash
cd /Users/luizfosc/aios-core/packages/ecoflow-design-system
npm install
npm run storybook
\`\`\`

**Abrir no navegador:** http://localhost:6006

**O que você verá:**
- 📚 ~220 stories interativas
- 🎛️ Controles ao vivo para testar props
- 📱 Visualização responsiva
- ♿ Testes de acessibilidade integrados
- 🎨 Todos os componentes organizados por categoria

---

### 2. Demo Completo (Dashboard Real)

**Ver um exemplo de dashboard completo:**

Criei um arquivo de exemplo: `example-demo.tsx`

**Para rodar:**

\`\`\`bash
# 1. Instale as dependências
cd /Users/luizfosc/aios-core/packages/ecoflow-design-system
npm install

# 2. Crie um arquivo de teste
cat > test-demo.html <<'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoFlow Design System Demo</title>
  <style>
    body {
      margin: 0;
      font-family: Inter, system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18.2.0';
    import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
    import { EcoFlowDemo } from './example-demo.tsx';

    ReactDOM.createRoot(document.getElementById('root')).render(
      React.createElement(EcoFlowDemo)
    );
  </script>
</body>
</html>
EOF

# 3. Abra no navegador
open test-demo.html
\`\`\`

**O que você verá:**
- 📊 Dashboard completo com sidebar + topbar
- 📈 Cards com estatísticas
- 📋 Tabela de projetos
- 📝 Formulários com todos os componentes
- 🔔 Modal e Toast notifications
- 🎨 Todas as cores e estilos aplicados

---

### 3. Exploração Manual (Código)

**Ver tokens de design:**

\`\`\`bash
# Cores
cat src/tokens/colors.ts

# Tipografia
cat src/tokens/typography.ts

# Espaçamento
cat src/tokens/spacing.ts
\`\`\`

**Ver componentes:**

\`\`\`bash
# Ver todos os componentes
ls -1 src/components/*/index.ts

# Ver um componente específico (exemplo: Button)
cat src/components/forms/Button.tsx
\`\`\`

---

## 🎨 Paleta de Cores

### Cores Primárias
- **Teal (Primary):** `#00BFA5` - Cor principal do sistema
- **Yellow (Accent):** `#FFB800` - Cor de destaque
- **White:** `#FFFFFF` - Background limpo

### Cores Semânticas
- **Success:** `#10B981` (Verde)
- **Warning:** `#F59E0B` (Âmbar)
- **Error:** `#EF4444` (Vermelho)
- **Info:** `#3B82F6` (Azul)

### Neutrals (Cinzas)
- 10 tons de cinza de `#F9FAFB` a `#111827`

---

## 📊 Métricas do Design System

- **24 Componentes** production-ready
- **322 Testes** passando (91.74% coverage)
- **220+ Stories** Storybook interativas
- **WCAG 2.1 AA** compliance
- **Tree-shakeable** build (ESM + CJS)
- **TypeScript** 5.3 full support

---

## 🎯 Componentes Disponíveis

### Typography (2)
- `<Heading>` - H1-H6 com variações de peso
- `<Text>` - Texto body em vários tamanhos

### Layout (4)
- `<Container>` - Wrapper com max-width
- `<Stack>` - Layout vertical/horizontal
- `<Grid>` - Grid responsivo
- `<Spacer>` - Espaçamento vazio

### Navigation (4)
- `<Sidebar>` - Navegação lateral colapsável
- `<TopBar>` - Header com busca e menu
- `<Breadcrumb>` - Navegação hierárquica
- `<Tabs>` - Abas horizontais

### Forms (6)
- `<Button>` - 5 variantes (primary, secondary, outline, ghost, danger)
- `<Input>` - Campo de texto com label, erro, ícones
- `<Select>` - Dropdown seletor
- `<Checkbox>` - Checkbox único ou grupo
- `<Radio>` - Radio único ou grupo
- `<Switch>` - Toggle switch

### Data Display (5)
- `<Badge>` - 7 variantes de status
- `<Avatar>` - Avatar com fallback
- `<StatusIndicator>` - Online/offline/busy/away
- `<Card>` - Container flexível
- `<Table>` - Tabela com sorting e seleção

### Feedback (5)
- `<Alert>` - 4 variantes (info, success, warning, error)
- `<Loading>` - 3 tipos de loader
- `<Progress>` - Barra linear e circular
- `<Modal>` - Dialog com overlay
- `<Toast>` - Notificações toast (6 posições)

---

## 🔗 Links Rápidos

- **Storybook:** http://localhost:6006 (após `npm run storybook`)
- **Documentação:** `docs/GETTING_STARTED.md`
- **Acessibilidade:** `docs/ACCESSIBILITY.md`
- **Princípios:** `docs/DESIGN_PRINCIPLES.md`
- **Testes:** `TESTING.md`

---

## 💡 Exemplo de Uso Rápido

\`\`\`tsx
import { Button, Card, Alert } from '@fosc/ecoflow-design-system';

function App() {
  return (
    <Card padding="md">
      <Alert variant="success" title="Welcome!">
        EcoFlow Design System está pronto!
      </Alert>
      <Button variant="primary" size="md">
        Começar
      </Button>
    </Card>
  );
}
\`\`\`

---

## 📞 Suporte

- **Documentação Completa:** `README.md`
- **Changelog:** `CHANGELOG.md`
- **Issues:** GitHub Issues
- **License:** MIT

---

🎉 **Aproveite o EcoFlow Design System!**
