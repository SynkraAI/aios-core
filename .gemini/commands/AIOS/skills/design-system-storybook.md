---
name: design-system-storybook
description: >-
  Gera componentes React + stories Storybook a partir dos dados de design system
  extraídos. Modo bootstrap/rápido: cria esqueleto básico com 3 variantes por
  componente usando Atomic Design. Terceira etapa do pipeline de 4 skills.
  Para qualidade profissional, use o modo Premium do design-system-forge (@brad-frost).
risk: safe
source: opensquad
paths:
  - "skills/design-system-storybook/"
lazy_load: true
context_budget: 600
---

# Design System Storybook (Bootstrap Mode)

Gera componentes React + stories básicos rapidamente a partir dos dados extraídos. É a terceira etapa do pipeline de 4 skills.

**Para qualidade profissional**, use o modo Premium do `/design-system-forge` que delega para `@brad-frost *build` (6 variantes, hover/loading/a11y, testes) e `@storybook-expert` (stories CSF3 type-safe).

**Esta skill** é o modo rápido/fallback: gera esqueleto básico em minutos, útil como ponto de partida.

## When to Use This Skill

- Após scaffoldar o projeto com `/design-system-scaffold`
- Quando quer bootstrap rápido de componentes sem qualidade production-ready
- Como ponto de partida para refinar depois com `@brad-frost`
- Quando o usuário pediu velocidade sobre qualidade

## Do NOT Use This Skill When

- Quer componentes production-ready com testes e a11y (use modo Premium do `/design-system-forge`)
- Não tem `.storybook/` configurado (rode `/design-system-scaffold` primeiro)
- Não tem `design-system/components.json` (rode `/design-system-forge` primeiro)

## Discovery Questions

Perguntas a fazer antes de executar. Pule se o usuário já forneceu o contexto.

1. **Qual design system quer popular? (listar pastas em `~/CODE/design-systems/` com `.storybook/`)** — (para localizar o projeto correto)
2. **Quer gerar todos os componentes ou escolher quais?** — (todos é o recomendado; selecionar se quiser começar por atoms)
3. **Quer aplicar animações premium (Framer Motion, Aceternity UI) nos componentes com animações complexas?** — (opcional, pergunta só se há animações detectadas)

## Prerequisites

- `design-system/components.json` — OBRIGATÓRIO
- `design-system/extracted-css.json` — OBRIGATÓRIO
- `design-system/tokens.yaml` — OBRIGATÓRIO
- `.storybook/` configurado — OBRIGATÓRIO
- `tailwind.config.ts` — OBRIGATÓRIO

## Workflow

### Fluxo Guiado (6 passos)

1. **Localizar projeto** — verificar `.storybook/` e arquivos obrigatórios
2. **Analisar componentes** — ler `components.json`, classificar em atoms/molecules/organisms
3. **Gerar atoms** — button, badge, input, avatar, icon (um por vez com aprovação)
4. **Gerar molecules** — card, nav-item, form-field (importam atoms)
5. **Gerar organisms** — hero, header, footer, feature-section (importam atoms + molecules)
6. **Score de completude** — mostrar `componentes gerados / detectados` e sugestões de melhoria

### Arquivos Gerados por Componente

```
src/components/atoms/button/
├── Button.tsx          # componente com props TypeScript
├── Button.stories.tsx  # stories CSF3 básicas
├── Button.mdx          # docs page
└── index.ts            # barrel export
```

### Estilo por Token (ordem de prioridade)

1. CSS custom properties de `extracted-css.json` → `var(--nome)`
2. Classes Tailwind de `tailwind.config.ts`
3. Valores inline dos samples em `components.json` → fallback

### Regras Anti-AI Slop

- NUNCA fontes genéricas (Inter, Roboto, Arial) — usar as extraídas do site original
- NUNCA esquemas de cor clichê — usar a paleta real do `tokens.yaml`
- NUNCA layouts cookie-cutter — respeitar o layout original do `section-map.json`
- Componentes recebem dados via props — nunca importar dados diretamente
- TypeScript interfaces para todas as props

### Variantes Automáticas

| Se detectar... | Cria variante |
|----------------|---------------|
| Múltiplas cores | Primary, Secondary, Accent |
| Atributo `disabled` | Disabled |
| Animação no componente | Animated |
| Background escuro no section-map | Dark |
| Tamanhos diferentes nos samples | Small, Medium, Large |

### Interação por Componente

Após cada componente gerado, mostrar arquivos criados e perguntar:
1. Ficou fiel ao original — próximo componente
2. Precisa de ajuste — informar o que mudar
3. Pular este componente

## Best Practices

- Sempre parar para aprovação após cada componente antes de continuar
- Abrir Storybook em paralelo para comparar visualmente com o original
- Animações complexas (scroll/3D) precisam de bibliotecas externas — sugerir Framer Motion, GSAP, Aceternity UI
- Um efeito de entrada bem orquestrado é melhor que muitos efeitos espalhados
- Ao terminar, sempre sugerir o próximo passo: `/design-system-catalog`

## Pipeline Completo

```
/design-system-forge     ← Extrai DNA do site
/design-system-scaffold  ← Cria projeto Next.js + Storybook
/design-system-storybook ← VOCÊ ESTÁ AQUI (gera componentes + stories)
/design-system-catalog   ← Registra no catálogo global
```
