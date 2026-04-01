---
name: design-system-scaffold
description: >-
  Monta o projeto Next.js + Tailwind + Shadcn/ui + Storybook 8 a partir dos
  tokens extraídos pelo design-system-forge. Converte tokens.yaml em
  tailwind.config.ts e CSS custom properties. Segunda etapa do pipeline de 4 skills.
risk: safe
source: opensquad
paths:
  - "skills/design-system-scaffold/"
lazy_load: true
context_budget: 500
---

# Design System Scaffold

Monta a estrutura completa do projeto a partir dos dados extraídos pelo `/design-system-forge`. É a segunda etapa do pipeline de 4 skills.

**Pré-requisito:** ter rodado `/design-system-forge` e ter a pasta `design-system/` com os dados extraídos.

## When to Use This Skill

- Após extrair o DNA de um site com `/design-system-forge`
- Quando quer criar a estrutura Next.js + Storybook a partir de tokens extraídos
- Para converter `tokens.yaml` em `tailwind.config.ts` e CSS custom properties automaticamente

## Do NOT Use This Skill When

- Não existe `design-system/tokens.yaml` (rode `/design-system-forge` primeiro)
- Já tem o projeto scaffoldado e quer gerar componentes (use `/design-system-storybook`)
- Quer um scaffold genérico sem tokens extraídos (use `create-next-app` diretamente)

## Discovery Questions

Perguntas a fazer antes de executar. Pule se o usuário já forneceu o contexto.

1. **Onde está a pasta `design-system/` com os dados extraídos?** — (caminho do projeto ou cwd)
2. **Confirma a stack padrão: Next.js 14 + Tailwind + Shadcn + Storybook 8?** — (perguntar só se usuário não confirmou)

## Prerequisites

- `design-system/tokens.yaml` — OBRIGATÓRIO
- `design-system/extracted-css.json` — OBRIGATÓRIO
- `design-system/components.json` — OBRIGATÓRIO
- `design-system/images/` — OBRIGATÓRIO
- Node.js e npm instalados

## Workflow

### Stack Gerada

```
Next.js 14+ (App Router) + TypeScript
Tailwind CSS 3.4+
Shadcn/ui (componentes base)
Storybook 8 (documentação visual)
```

### Etapas (6 passos com progresso visual)

1. Criar projeto Next.js com `create-next-app@latest`
2. Configurar Shadcn/ui com `npx shadcn@latest init -d`
3. Instalar Storybook 8 com `npx storybook@latest init`
4. Copiar assets extraídos para `public/` (images, svgs, fonts, screenshots)
5. Gerar `tailwind.config.ts` a partir de `tokens.yaml` + `extracted-css.json`
6. Gerar `src/styles/tokens.css` com CSS custom properties (`:root { --color-primary: ... }`)

### Estrutura de Componentes Criada

```
src/components/
├── atoms/       (button, badge, input, avatar, icon)
├── molecules/   (card, nav-item, form-field)
├── organisms/   (hero, header, footer, feature-section)
└── index.ts     (barrel exports)
```

### Scripts CLI

```bash
# Scaffold completo automatizado
node ~/aios-core/skills/design-system-scaffold/lib/scaffold-project.mjs \
  --name circle-br \
  --tokens design-system/tokens.yaml \
  --css design-system/extracted-css.json \
  --assets design-system/ \
  --output ~/CODE/design-systems/circle-br/

# Só tokens → tailwind.config.ts
node ~/aios-core/skills/design-system-scaffold/lib/tokens-to-tailwind.mjs \
  --input design-system/tokens.yaml --css design-system/extracted-css.json --output tailwind.config.ts

# Só tokens → tokens.css
node ~/aios-core/skills/design-system-scaffold/lib/tokens-to-css.mjs \
  --input design-system/tokens.yaml --output src/styles/tokens.css
```

### Validação Final

```bash
npm run build    # Zero erros
npm run storybook # Abre sem erros
```

## Best Practices

- Sempre confirmar a stack com o usuário antes de rodar (o scaffold é difícil de reverter)
- Verificar os 3 arquivos obrigatórios antes de iniciar — falhar cedo com mensagem clara
- Se não houver fontes baixadas, sugerir Google Fonts baseado no `font-family` do `tokens.yaml`
- Ao terminar, sempre sugerir o próximo passo: `/design-system-storybook`

## Pipeline Completo

```
/design-system-forge     ← Extrai DNA do site
/design-system-scaffold  ← VOCÊ ESTÁ AQUI (cria projeto Next.js + Storybook)
/design-system-storybook ← Gera componentes + stories
/design-system-catalog   ← Registra no catálogo global
```
