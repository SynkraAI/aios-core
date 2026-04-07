# Pattern Library — Premium Design DNA

**Status:** Onda 1 + Onda 2 + Onda 3 completas (35/40 sites — 5 excluídos)
**Última atualização:** 2026-04-01
**Ferramentas:** dissect-artifact.cjs + Dembrandt 0.8.2

---

## Onda 1: TIER 1 — Os Intocáveis

| Site | URL | Cores | Tipografia | Sombras | Gradientes | Animações | Componentes | CSS Vars |
|------|-----|-------|------------|---------|------------|-----------|-------------|----------|
| **Stripe** | stripe.com | 37 | 25 | 6 | 19 | 0 | 795 | 650 |
| **Linear** | linear.app | 50 | 31 | 13 | 13 | 607 | 405 | 537 |
| **Vercel** | vercel.com | 10 | 15 | 6 | 1 | 90 | 746 | 407 |
| **Raycast** | raycast.com | 30 | 30 | 32 | 34 | 70 | 429 | 87 |
| **Apple iPhone** | apple.com/iphone | 40 | 25 | 0 | 2 | 27 | 2493 | 138 |

### Insights da Extração — Onda 1

**Cores dominantes por site:**
- **Stripe:** `#5335FD` (roxo) + `#061B31` (dark navy) + `#50617A` (slate)
- **Linear:** `#F7F8F8` (quase-branco) + `#626669` (gray) + `#D0D6E0` (light gray) — light mode!
- **Vercel:** `#171717` (quase-preto) + `#4D4D4D` (gray) + `#666` (mid-gray) — minimal
- **Raycast:** `#FFF` (branco em dark bg) + `rgba(255,255,255,0.05)` (glass) + `#434345` (dark gray)
- **Apple:** `#1D1D1F` (quase-preto) + `#333336` (dark gray) + `rgba(0,0,0,0.56)` (overlay)

**Padrões detectados:**
- 4 de 5 usam dark mode como default (Stripe é o único light)
- Todos usam escalas de cinza com no máximo 1-2 cores de destaque
- Raycast tem o maior número de sombras (32) — profundidade via elevação
- Linear tem de longe mais animações (607) — interatividade como diferencial
- Apple tem o maior DOM (3888 nós, 2493 componentes) — site mais complexo

---

## Onda 2: SaaS & AI + Brasil Premium

### SaaS & AI (9 sites)

| Site | URL | Cores | Tipografia | Sombras | Gradientes | Animações | Nós DOM |
|------|-----|-------|------------|---------|------------|-----------|---------|
| **Framer** | framer.com | 40 | 20 | 10 | 5 | 4 | 3896 |
| **Notion** | notion.so | 40 | 20 | 6 | 1 | 39 | 1156 |
| **Superhuman** | superhuman.com | 17 | 15 | 6 | 8 | 0 | 494 |
| **Runway** | runwayml.com | 19 | 14 | 0 | 2 | 3 | 533 |
| **OpenAI** | openai.com | 9 | 9 | 2 | 0 | 32 | 709 |
| **Anthropic** | anthropic.com | 16 | 20 | 1 | 2 | 7 | 965 |
| **Pitch** | pitch.com | 20 | 20 | 6 | 10 | 21 | 897 |
| **Loom** | loom.com | 31 | 20 | 10 | 3 | 29 | 998 |
| **Circle** | circle.so | 29 | 20 | 3 | 8 | 32 | 1332 |

### Brasil Premium (7 sites)

| Site | URL | Cores | Tipografia | Sombras | Gradientes | Animações | Nós DOM |
|------|-----|-------|------------|---------|------------|-----------|---------|
| **Nubank** | nubank.com.br | 13 | 19 | 0 | 2 | 2 | 813 |
| **Duck Design** | duckstudio.design | 14 | 20 | 2 | 2 | 1 | 600 |
| **Reino** | reinostudio.com.br | 4 | 20 | 0 | 0 | 17 | 508 |
| **Pulso Hotel** | pulsohotel.com | 21 | 18 | 4 | 0 | 1 | 661 |
| **Laghetto** | laghetto.com.br | 34 | 20 | 10 | 5 | 2 | 2293 |
| **FARM Rio** | farmrio.com.br | 27 | 20 | 7 | 5 | 42 | 2828 |
| **GMX Digital** | gmxdigital.com | 40 | 20 | 10 | 10 | 13 | 640 |

### Sites Excluídos (dados insuficientes)

| Site | Motivo |
|------|--------|
| **VTEX** | Apenas 11 nós DOM (página mínima) |
| **Arc** | Extração falhou |
| **JARCOS** | Apenas 3 cores extraídas |

### Insights da Extração — Onda 2

**Cores dominantes por site (SaaS & AI):**
- **Framer:** `#000` (preto) + `#0099FF` (azul) + `rgba(255,255,255,0.6)` — dark total
- **Notion:** `rgba(0,0,0,0.9)` (preto transparente) + `#F6F5F4` (warm white) — light warm
- **Superhuman:** `#292827` (warm dark) + `#714CB6` (roxo) — mesh gradients
- **Runway:** `#0C0C0C` (preto profundo) + `#404040` (cinza) — ultra-minimal
- **OpenAI:** `#000` (preto) + `rgba(0,0,0,0.6)` — monocromático extremo
- **Anthropic:** `#141413` (warm black) + `#FAF9F5` (cream) + `#D97757` (clay) — warm elegante
- **Pitch:** `#2B2A35` (purple-gray) + `#6B53FF` (roxo) — vibrante
- **Loom:** `#292A2E` (dark) + `#1868DB` (azul) — corporativo
- **Circle:** `#000` (preto) + `#737373` (cinza) — gradientes pastel como accent

**Cores dominantes por site (Brasil Premium):**
- **Nubank:** `#000` + `#820AD1` (roxo icônico) + `#A2A2A2` (cinza)
- **Duck Design:** `#000` + `#FFF` + `#F8E08E` (dourado) — high contrast
- **Reino:** `#000` + `#FFF` — bicolor absoluto + tipografia gigante
- **Pulso Hotel:** `#F7F7F2` (cream) + `#333` + `#D9B57D` (dourado) — warm luxury
- **Laghetto:** `#0A2D23` (verde floresta) + `#C7F1C5` (verde claro) — natureza
- **FARM Rio:** `#333` + `#FFF` + rainbow tropical — e-commerce vibrante
- **GMX:** `#111` + `#00F2FE` (cyan neon) + `#FF4D6D` (pink neon) — cyberpunk

**Padrões detectados na Onda 2:**
- 12 de 16 usam dark mode (exceções: Notion, OpenAI, Anthropic, Pulso Hotel)
- Fontes proprietárias em 9 de 16: "OpenAI Sans", "Anthropic Sans/Serif", "Super Sans VF", "Charlie Text/Display", "graphikMedium", "Fff Acidgrotesk", Eina01, abcNormal, Pretendard
- Tipografia display gigante em agências BR: Duck Design (160px), Reino (200px!), GMX (101px)
- Mesh gradients em Superhuman (5 radiais sobrepostos) — tendência premium
- Glass morphism avançado em GMX (sombras com inset + outer glow)
- 3 sites usam gradiente no CTA primário: Pitch, Circle, GMX
- FARM Rio e Laghetto têm os maiores DOMs (2828 e 2293 nós) — e-commerce/booking
- OpenAI é o mais minimalista em cores (apenas 9 valores únicos)

---

## Artefatos por Site

Cada site em `tokens/{nome}/` contém:

```
tokens/{nome}/
├── tokens.yaml              # Cores, fontes, espaçamento (dissect)
├── components.json          # Componentes detectados com CSS
├── extracted-css.json       # CSS completo organizado
├── dom-tree.json            # Árvore DOM com estilos computados
├── source.html              # HTML bruto
├── screenshot-desktop.png   # Screenshot 1440px
├── screenshot-mobile.png    # Screenshot 375px
├── stylesheets/             # CSS externas baixadas
├── manifest.json            # Metadados da extração
└── output/                  # Tokens W3C DTCG (Dembrandt)
```

---

## Onda 3: Agências Criativas + Design Tools

### Agências Criativas (7 sites)

| Site | URL | Cores | Tipografia | Sombras | Gradientes | Animações | Nós DOM |
|------|-----|-------|------------|---------|------------|-----------|---------|
| **Locomotive** | locomotive.ca | 3 | 7 | 0 | 1 | 10 | 326 |
| **Lusion** | lusion.co | 12 | 24 | 1 | 1 | 2 | 365 |
| **Dogstudio** | dogstudio.co | 23 | 95 | 2 | 0 | 29 | 491 |
| **Obys** | obys.agency | 6 | 14 | 1 | 0 | 10 | 782 |
| **Unseen** | unseen.co | 9 | 22 | 0 | 0 | 1 | 284 |
| **makemepulse** | makemepulse.com | 14 | 16 | 3 | 0 | 4 | 746 |
| **Scout** | scout.camd.northeastern.edu | 11 | 23 | 0 | 0 | 1 | 288 |

### Design Tools & Produto (6 sites)

| Site | URL | Cores | Tipografia | Sombras | Gradientes | Animações | Nós DOM |
|------|-----|-------|------------|---------|------------|-----------|---------|
| **Nothing** | nothing.tech | 14 | 12 | 1 | 0 | 3 | 752 |
| **Simply Chocolate** | simplychocolate.dk | 39 | 59 | 8 | 5 | 59 | 4009 |
| **Figma** | figma.com | 25 | 17 | 5 | 3 | 8 | 1239 |
| **Spline** | spline.design | 12 | 5 | 1 | 0 | 17 | 118 |
| **Rive** | rive.app | 16 | 13 | 1 | 1 | 0 | 890 |
| **Webflow** | webflow.com | 21 | 25 | 2 | 13 | 15 | 3439 |

### Sites Excluídos (dados insuficientes)

| Site | Motivo |
|------|--------|
| **Active Theory** | Full WebGL (2 nós DOM, 0 componentes) |
| **TE Connectivity** | HTTP2 protocol error (WAF/CDN) |
| **Stripe Press** | Timeout em todas as etapas |

### Insights da Extração — Onda 3

**Cores dominantes por site (Agências Criativas):**
- **Locomotive:** `#000` + `#FFF` + `#312DFB` (azul elétrico) — bicolor + accent
- **Lusion:** `#000` + `#FFF` + `#0016EC` (azul puro) + `#C1FF00` (verde neon)
- **Dogstudio:** `#FFF` + `rgba(160,168,220,0.7)` (lilás pastel) + `rgb(19,20,25)` (dark bg)
- **Obys:** `#FFF` + `rgb(21,21,21)` + `#FFA63D` (laranja) — tipografia como hero
- **Unseen:** `#000` + `#212121` + `rgb(250,246,244)` (cream) — minimalismo warm
- **makemepulse:** `rgb(15,15,15)` + `#FFF` + `#896FFF` (roxo suave) — dark total
- **Scout:** `#000` + `rgb(250,249,242)` (off-white) + `rgb(140,40,189)` (roxo Northeastern)

**Cores dominantes por site (Design Tools & Produto):**
- **Nothing:** `#000` + `#FFF` + `rgb(198,16,46)` (vermelho accent) — identidade monocromática
- **Simply Chocolate:** `rgb(28,28,28)` + `#FFF` + `rgb(35,73,35)` (verde floresta)
- **Figma:** `#000` + `#FFF` + `rgb(77,73,252)` (roxo/azul Figma)
- **Spline:** `rgba(255,255,255,0.6)` + `#000` + `#0062FF` (azul) + `#915EFF` (roxo)
- **Rive:** `rgb(0,0,238)` (azul) + `#000` + `rgb(241,241,241)` (off-white)
- **Webflow:** `rgb(8,8,8)` + `#FFF` + `rgb(20,110,245)` (azul Webflow)

**Padrões detectados na Onda 3:**
- 10 de 13 usam dark mode por padrão (exceções: Locomotive, Figma, Scout)
- Fontes proprietárias em 7 de 13: `LocomotiveNew`, `NType82` (Nothing), `Simply-Chocolate*`, `figmaSans`, `Spline Sans`, `WF Visual Sans Variable`, `Aeonik` (Lusion)
- Tipografia display gigante como hero visual: Obys, Unseen, Locomotive — texto É o design
- Azul elétrico (#0016EC-#312DFB) como accent em 4 sites: Locomotive, Lusion, Spline, Webflow
- Roxo como accent secundário em 4 sites: makemepulse, Spline, Figma, Scout
- Simply Chocolate é o monstro da onda: 4009 nós, 684 componentes, 241 CSS vars
- Webflow segundo maior: 3439 nós, 1043 componentes, 232 CSS vars
- Inline styles massivos em Rive (655) e makemepulse (218) — CSS-in-JS patterns
- Zero gradientes em 8 de 13 sites — minimalismo extremo nas agências
- Serif como display font em 3 sites: Dogstudio (`GT Sectra`), Obys (`Silk Serif`), Unseen (`Saol Display`)

---

## Resumo Geral — 3 Ondas

| Onda | Sites | Status |
|------|-------|--------|
| **Onda 1** | Stripe, Linear, Vercel, Raycast, Apple | ✅ Completa (5/5) |
| **Onda 2** | Framer, Notion, Superhuman, Runway, OpenAI, Anthropic, Pitch, Loom, Circle + Nubank, Duck Design, Reino, Pulso Hotel, Laghetto, FARM Rio, GMX | ✅ Completa (16 OK, 3 excluídos) |
| **Onda 3** | Locomotive, Lusion, Dogstudio, Obys, Unseen, makemepulse, Nothing, Simply Chocolate, Figma, Spline, Rive, Webflow, Scout | ✅ Completa (13 OK, 3 excluídos) |
| **Custom: Gui Ávila** | Reverso, ClickUp 8x, Automações PRO | ✅ Completa (3/3) |
| **Custom: Redesign Case** | STC Original, STC Redesign (antes/depois de IA) | ✅ Completa (2/2) |
| **Custom: Component Lib** | 21st.dev (382 CSS vars, 149 componentes) | ✅ Completa (1/1) |
| **Total** | **40 sites com dados + 6 excluídos** | ✅ Completa |

---

## Pattern Files

Análises consolidadas nos arquivos:

| Arquivo | Conteúdo | Sites |
|---------|----------|-------|
| `sections/heroes/README.md` | Hero sections, layout, tipografia | 40 sites |
| `sections/cta/README.md` | Botões, CTAs, hover effects | 40 sites |
| `sections/social-proof/README.md` | Logos, testimonials, badges | 40 sites |
| `sections/features/README.md` | Grids, cards, feature sections | 40 sites |
| `sections/footer/README.md` | Footer layout e estilo | 40 sites |
| `effects/README.md` | Animações, sombras, gradientes, transições + 10 receitas premium | 40 sites |

---

## Como Usar

1. **LP dark premium:** Linear + Vercel + Raycast + GMX + Webflow + makemepulse + Gui Ávila ClickUp 8x
2. **LP light/corporativa:** Stripe + OpenAI + Figma + Scout
3. **LP warm/elegante:** Anthropic + Pulso Hotel + Unseen
4. **LP de produto (hardware/SaaS):** Apple + Notion + Nothing + Rive
5. **LP de agência/portfólio:** Duck Design + Reino + GMX + Locomotive + Lusion + Obys
6. **LP e-commerce:** FARM Rio + Nubank + Simply Chocolate
7. **LP fintech:** Nubank + Stripe
8. **LP de hotelaria:** Pulso Hotel + Laghetto
9. **LP design tool:** Figma + Spline + Webflow + Rive
10. **LP com tipografia como hero:** Obys + Unseen + Locomotive + Reino
11. **LP com serif elegante:** Dogstudio + Obys + Unseen
12. **LP high-ticket BR (curso/mentoria):** Gui Ávila Reverso + ClickUp 8x + Automações PRO
13. **LP com animações pesadas (GSAP):** Gui Ávila (195-225 anim) + Linear (607) + Simply Chocolate (59)
14. **Redesign case (antes/depois):** STC Original vs STC Redesign — caso real de redesign por IA
15. **Componentes React prontos:** 21st.dev (382 CSS vars, 149 componentes, categorias: Heroes, CTAs, Pricing, Testimonials, Buttons)
16. **Para componentes:** consulte `components.json` de cada site
17. **Para efeitos:** consulte `extracted-css.json` → seção `animations` + `effects/README.md` para receitas prontas

### Caso de Estudo: STC Redesign (Antes vs Depois)

| Métrica | Original | Redesign | Delta |
|---------|----------|----------|-------|
| Nós DOM | 533 | 328 | -38% (mais limpo) |
| Cores | 17 | 20 | +3 (mais paleta) |
| Tipografia | 14 | 32 | +128% (mais hierarquia) |
| Gradientes | 0 | 8 | +8 (visual premium) |
| Animações | 193 | 0 | -100% (removeu GSAP) |
| CSS Vars | 107 | 28 | -74% (simplificou) |
| Componentes | 59 | 61 | +2 (mesma quantidade) |

**Insight:** O redesign trocou animações por tipografia e gradientes — menos "show", mais "substância". DOM 38% menor = mais performático.

### 21st.dev — Fonte de Componentes React

**URL:** https://21st.dev/components
**Categorias disponíveis:** Heroes, Features, CTAs, Buttons, Testimonials, Pricing, Text, Shaders, AI Chat
**Como usar:** Na hora de criar LP com `/forge lp`, consultar 21st.dev para pegar componentes React prontos e adaptar com os tokens da pattern library.
