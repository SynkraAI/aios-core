---
name: design-system-forge
description: >-
  Pipeline orquestrador que transforma qualquer site em um design system premium.
  Extrai DNA visual via Playwright (cores, tipografia, animações, componentes),
  delega geração para o squad /design (Brad Frost, Storybook Expert) e
  cataloga o resultado. Dois modos: Premium (qualidade profissional) e Rápido (bootstrap).
risk: safe
source: opensquad
paths:
  - "skills/design-system-forge/"
lazy_load: true
context_budget: 700
---

# Design System Forge

Orquestrador do pipeline de design system. Extrai o DNA visual de qualquer site e delega a geração de componentes para o ecossistema AIOS — não implementa componentes diretamente.

**Filosofia:** Extraia o DNA. Delegue para especialistas. Entregue arte.

## When to Use This Skill

- Clonar o sistema visual de qualquer site em um design system reutilizável
- Gerar tokens, componentes React e Storybook a partir de uma URL
- Criar um design system premium com qualidade profissional (modo Premium via `@brad-frost`)
- Bootstrap rápido de um DS para protótipo (modo Rápido)

## Do NOT Use This Skill When

- Já tem os dados extraídos e quer só gerar componentes (use `/design-system-storybook`)
- Quer apenas gerenciar o catálogo (use `/design-system-catalog`)
- O site-alvo bloqueia headless browsers (tentar com timeout maior)

## Discovery Questions

Perguntas a fazer antes de executar. Use AskUserQuestion. Pule se o usuário já forneceu o contexto.

1. **Qual URL quer clonar?** — (URL completa com http/https)
2. **Como quer chamar o design system?** — (sugerir slug baseado no domínio, ex: circle-br)
3. **Qual modo quer usar: Premium (qualidade profissional) ou Rápido (bootstrap)?** — (Premium usa `@brad-frost`, Rápido usa `generate-components.mjs`)

## Prerequisites

- Playwright instalado: `npm install -D @playwright/test && npx playwright install chromium`
- Pasta `~/CODE/design-systems/` existente (criada automaticamente se necessário)

## Workflow

### Passo a Passo (guiado)

1. **Descobrir alvo** — pedir URL, validar formato
2. **Nomear o DS** — sugerir slug do domínio, confirmar com usuário
3. **Escolher pasta** — padrão `~/CODE/design-systems/{nome}/`
4. **Verificar pré-requisitos** — Playwright, pasta base
5. **Extrair DNA** — rodar `dissect-artifact.cjs` com `--clone --mobile`
6. **Preview e aprovação** — servir clone local em `http://localhost:8888`, comparar com original
7. **Análise de animações** — detectar animações complexas, sugerir bibliotecas (Framer Motion, GSAP, Aceternity UI)
8. **Handoff para especialistas** — delegar conforme modo escolhido

### Modo Premium (Recomendado)

```
@brad-frost *setup      → estrutura do DS
@brad-frost *tokenize   → tokens em camadas (Base → Semantic → Component)
@brad-frost *build      → componentes production-ready (6 variantes, a11y, testes)
@storybook-expert       → stories CSF3 type-safe com interaction testing
/design-system-catalog  → registrar no catálogo
```

### Modo Rápido (Bootstrap)

```
/design-system-scaffold  → scaffold Next.js + Storybook
/design-system-storybook → gerar esqueleto básico com generate-components.mjs
/design-system-catalog   → registrar no catálogo
```

### Output da Extração

```
{pasta}/design-system/
├── clean-structure.html   # clone local para preview
├── tokens.yaml            # cores, tipografia, espaçamentos
├── extracted-css.json     # animações, gradientes, shadows
├── components.json        # componentes detectados com samples
├── manifest.json          # metadados da extração
├── screenshots/           # desktop + mobile
├── images/                # todas as imagens baixadas
├── fonts/                 # fontes (.woff2)
└── svgs/                  # SVGs extraídos
```

## Best Practices

- Sempre fazer preview do clone local antes de prosseguir para o scaffold
- Animações complexas (scroll/3D/mouse) precisam de bibliotecas externas — consultar tabela na SKILL.md
- Modo Premium entrega qualidade equivalente a um design system profissional; Rápido é para protótipos
- Se o site bloquear extração, tentar com `--timeout 120` (timeout maior)
- Cada passo pausa para aprovação do usuário antes de continuar

## Ferramentas Disponíveis

| Ferramenta | Localização | O que faz |
|------------|-------------|-----------|
| `dissect-artifact.cjs` | `squads/design/scripts/` | Motor Playwright: extrai CSS, DOM, assets |
| `@brad-frost` | `squads/design/agents/` | Tokenização + componentes premium |
| `@storybook-expert` | `squads/design/agents/` | Stories CSF3 type-safe |
| `/design-system-scaffold` | `skills/design-system-scaffold/` | Scaffold Next.js + Tailwind |
| `/design-system-catalog` | `skills/design-system-catalog/` | Catálogo global |

## Pipeline Completo

```
/design-system-forge     ← VOCÊ ESTÁ AQUI (extrai DNA do site)
/design-system-scaffold  ← Cria projeto Next.js + Storybook
/design-system-storybook ← Gera componentes + stories
/design-system-catalog   ← Registra no catálogo global
```
