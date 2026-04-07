# Handoff — Pattern Library LP Agency

**Data:** 2026-04-01
**Sessão:** Construção da Pattern Library para LP Agency

---

## O que foi feito

### 1. Pesquisa profunda (tech-search)
- Pesquisado estado da arte em LP generation com AI
- Mapeados 40 sites premium (BR + mundo) organizados em 3 tiers
- Pesquisadas ferramentas: Dembrandt, Aceternity UI, Magic UI, 21st.dev, Lenis, GSAP, Framer Motion
- Benchmarks de conversão: CWV targets, 14-element checklist

### 2. PRD do ecossistema Forge + Quest atualizado
- Arquivo: `skills/forge/docs/prd-forge-quest-ecosystem.md`
- Adicionado: regra F4 (quality gates obrigatórios), extraction hierarchy, landing-page pipeline detalhado (7 fases), ownership do project-context.md, risco de contexto esgotado, distinção passivo/ativo

### 3. Pattern Library construída (21 sites)
- **Localização:** `design-system/patterns/`
- **Tamanho:** 415MB
- **6 ferramentas** por site:
  1. `dissect-artifact.cjs` — tokens, components, CSS, screenshots
  2. `dembrandt` — tokens W3C DTCG
  3. `extract-states.mjs` — estados interativos
  4. `capture-hover-states.cjs` — screenshots antes/depois de hover
  5. Playwright video — gravação de scroll + interações
  6. Pattern files — análise consolidada em 8 categorias

### 4. Sites extraídos

**TIER 1 (5):** Stripe, Linear, Vercel, Raycast, Apple iPhone
**TIER 2 SaaS (9):** Framer, Notion, Superhuman, Runway, OpenAI, Anthropic, Pitch, Loom, Circle
**TIER 2 Brasil (7):** Nubank, Duck Design, Reino, Pulso Hotel, Laghetto, FARM Rio, GMX
**Excluídos (3):** Arc (timeout), VTEX (SPA mínima), JARCOS (dados insuficientes)

### 5. Pattern files organizados (8 categorias, 4.459 linhas)

| Categoria | Linhas |
|---|---|
| heroes/ | 739 |
| cta/ | 723 |
| social-proof/ | 303 |
| features/ | 530 |
| footer/ | 417 |
| navigation/ | 491 |
| pricing/ | 595 |
| effects/ | 661 |

### 6. Scripts criados
- `design-system/scripts/full-extract.sh` — 6 steps, pronto pra TIER 3
- `design-system/scripts/capture-hover-states.cjs` — hover screenshots antes/depois

---

## Próximos passos (ordem recomendada)

### Passo 1: Onda 3 — 16 sites de agências criativas + design tools
Sites pendentes:
- **Agências:** Locomotive, Lusion, Active Theory, Dogstudio, Obys, Unseen Studio, makemepulse
- **Produto:** Nothing, Teenage Engineering, Simply Chocolate, Scout Motors
- **Design tools:** Figma, Spline, Rive, Webflow, Stripe Press

Comando: `bash design-system/scripts/full-extract.sh "{url}" "{name}" [--dark-mode]`

### Passo 2: Atualizar pattern files com dados da Onda 3
Mesmo processo: agente analisa components.json/tokens.yaml/extracted-css.json e adiciona aos README.md existentes.

### Passo 3: Criar workflow `skills/forge/workflows/landing-page.md`
Pipeline definido no PRD (seção 13):
Phase 0: Brief → Phase 1: Design Intelligence → Phase 2: Copy Factory → Phase 3: Design Composition → Phase 4: Build → Phase 5: Conversion Audit → Phase 6: Deploy

### Passo 4: Criar pack Quest `skills/quest/packs/lp-agency.yaml`
7 mundos gamificados mapeando para o workflow landing-page.

### Passo 5: Testar com 1 LP real
Validar pipeline end-to-end.

---

## Contexto importante

- O usuário quer LPs **perfeitas (10/10)** — qualidade de agência premium
- A ideia veio de um membro do grupo AIOS (engenharia reversa + pattern library + fusão)
- O usuário NÃO é designer — precisa de guia passo a passo
- A pattern library são peças de LEGO (não templates) — combinar patterns + brand = LP única
- Dembrandt está instalado globalmente (`npm i -g dembrandt` v0.8.2)
- Playwright v1.58.2 disponível
