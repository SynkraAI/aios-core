# 🎨 Design Squad - Quick Start

## Ativação

```bash
/design
```

## Comandos Principais

### 1️⃣ Brownfield (Audit de Codebase Existente)

```bash
/design
*audit ./src              # Escanear por padrões redundantes
*consolidate              # Reduzir padrões (ex: 47 botões → 3)
*tokenize                 # Gerar design tokens
*shock-report             # Relatório visual HTML
*calculate-roi            # Calcular economia
```

### 2️⃣ Greenfield (Novo Design System)

```bash
/design
*setup                    # Inicializar estrutura
*build button             # Gerar componente Button
*build input              # Gerar componente Input
*compose form-field       # Criar molécula
*document                 # Gerar documentação
```

### 3️⃣ Acessibilidade

```bash
/design
*a11y-audit              # Auditoria WCAG completa
*aria-audit              # Auditoria ARIA
*contrast-matrix         # Análise de contraste
*focus-order             # Validar ordem de foco
```

### 4️⃣ Manutenção

```bash
/design
*health-metrics          # Score de saúde do DS
*bundle-audit            # Impacto no bundle
*validate-fidelity       # Verificar fidelidade ao design
*dead-code               # Detectar padrões não utilizados
```

## Outputs

Todos os outputs vão para:

```
outputs/design-system/{project}/
├── audit/
│   ├── pattern-inventory.json
│   ├── consolidation-map.json
│   └── shock-report.html
├── tokens/
│   ├── tokens.yaml
│   ├── tokens.css
│   ├── tokens.tailwind.js
│   └── tokens.scss
├── components/
│   ├── atoms/
│   └── molecules/
└── docs/
```

## Próximos Passos

1. Leia o README completo: `squads/design/README.md`
2. Execute `/design` para ativar
3. Comece com `*audit ./src` se tiver projeto existente
4. Ou `*setup` se for novo projeto

---

**Metodologia:** Brad Frost Atomic Design
**Independência:** 100% (sem dependências externas)
