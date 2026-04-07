---
name: "Feature Section & Grid Patterns"
category: "sections/features"
sources:
  - stripe.com
  - linear.app
  - vercel.com
  - raycast.com
  - apple.com/iphone
  - framer.com
  - notion.so
  - superhuman.com
  - runwayml.com
  - openai.com
  - anthropic.com
  - pitch.com
  - loom.com
  - circle.so
  - nubank.com.br
  - duckstudio.design
  - reinostudio.com.br
  - pulsohotel.com
  - laghetto.com.br
  - farmrio.com.br
  - gmxdigital.com
extracted_at: "2026-04-01"
---

# Feature Sections & Grid Layouts — Padroes Extraidos

Analise de grid systems, card layouts e secoes de features dos 5 sites.

---

## 1. Stripe — Bento Grid

O padrao mais rico. Stripe usa um "bento grid" com cards de tamanhos variados.

### Grid Container
```css
.stripe-grid {
  display: grid;
  width: 1232px;
  margin: 0 auto;
}
```

### Section Header
```css
.stripe-section-header {
  display: grid;
  width: 1232px;
  height: 130px;
}
```

### Bento Card (grande — ~66% do grid)
```css
.stripe-bento-large {
  display: flex;
  width: 816px;
  height: 676px;
}
```

### Billing Grid
```css
.stripe-billing-grid {
  display: flex;
  width: 366px;
  padding: 24px;
}
```

### Programa Card Grid
```css
.stripe-program-grid {
  display: grid;
  width: 1232px;
  height: 191px;
}
```

**Espacamento (multiplos de 8px):**
`8px` (78x), `16px` (40x), `24px` (20x), `32px` (30x), `64px` (22x), `96px` (10x)

---

## 2. Linear — Carousel de Beneficios

### Carousel Card
```css
.linear-benefit-card {
  display: flex;
  background: rgb(15, 16, 17);
  color: rgb(247, 248, 248);
  padding: 0px 24px 28px;
  border-radius: 8px;
}
```

**Espacamento:**
`8px` (140x), `12px` (58x), `24px` (22x), `48px` (12x), `96px` (10x)

**Extra:** Grid de dots decorativos (circle SVG 2px) como textura de background.

---

## 3. Vercel — Grid System Rigoroso

### Grid System Wrapper
```css
.vercel-grid-wrapper {
  display: flex;
  width: 1408px;
}
```

### Grid System (interno)
```css
.vercel-grid-system {
  display: flex;
  width: 1079px;
  margin: 0 auto;
}
```

### Page Root
```css
.vercel-page-root {
  display: flex;
  background: rgb(250, 250, 250);
  padding: 64px 0 0;
}
```

### Grid Borders
```css
/* Border pattern mais comum (156 ocorrencias) */
border-right: 1px solid rgba(0, 0, 0, 0.05);
border-bottom: 1px solid rgba(0, 0, 0, 0.05);

/* Dashed separators */
border-top: 1px dashed rgb(235, 235, 235);
```

**Espacamento:**
`2px` (146x), `4px` (123x), `8px` (73x), `12px` (137x), `24px` (6x), `48px` (10x)

---

## 4. Raycast — Extension Cards

### Extension Card
```css
.raycast-extension-card {
  display: grid;
  width: 360px;
  height: 536px;
  border-radius: 20px;
  box-shadow:
    rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset,
    rgba(7, 13, 79, 0.05) 0px 0px 20px 3px,
    rgba(7, 13, 79, 0.05) 0px 0px 40px 20px,
    rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset;
}
```

### Feature Menu Bar
```css
.raycast-menu-bar {
  display: flex;
  width: 1184px;
  height: 48px;
  padding: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  font-weight: 700;
}
```

**Espacamento:**
`8px` (238x), `12px` (70x), `16px` (62x), `24px` (117x), `32px` (17x), `48px` (7x)

---

## 5. Apple iPhone — Product Index Grid

### Index Group (nav de produtos)
```css
.apple-index-groups {
  display: flex;
  width: 1260px;
  height: 386px;
}
```

### Section Header
```css
.apple-section-header {
  display: flex;
  width: 1260px;
  padding: 0 0 48px;
}
```

**Espacamento:**
`7px` (314x), `20px` (93x), `32px` (63x), `40px` (73x), `64px` (97x), `76px` (54x)

Custom property: `--global-section-padding: 160px`

---

## Comparacao de Grid Systems

| Site | Largura | Sistema | Card Radius | Border Style |
|------|---------|---------|-------------|--------------|
| Stripe | 1232px | CSS Grid | 0px | `1px solid rgb(229, 237, 245)` |
| Linear | Full-width | Flex + Carousel | 8px | `1px solid rgba(255, 255, 255, 0.05)` |
| Vercel | 1079px (inner) | Flex Grid | 6px | `1px solid rgba(0, 0, 0, 0.05)` |
| Raycast | Variavel | Flex/Grid | 20px | `1px solid rgba(255, 255, 255, 0.1)` |
| Apple | 1260px | Flex | 0px | Minimo |

---

## Escala de Espacamento Comum

Todos os 5 sites compartilham uma progressao similar:

```
4px  → micro (borders, gaps minimos)
8px  → pequeno (padding interno)
12px → medio-pequeno (gaps entre itens)
16px → medio (padding padrao)
24px → medio-grande (gaps entre cards)
32px → grande (separacao de grupos)
48px → extra-grande (padding de secao)
64px → secao (margens de secao)
96px → macro (separacao de blocos)
```

---

## CSS Reference — Copy-Paste

### Bento Grid (Stripe style)
```css
.bento-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  max-width: 1232px;
  margin: 0 auto;
}
.bento-grid .card-large {
  grid-row: span 2;
}
```

### Feature Card Dark (Raycast style)
```css
.feature-card-dark {
  display: grid;
  width: 360px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset,
    rgba(7, 13, 79, 0.05) 0px 0px 20px 3px,
    rgba(7, 13, 79, 0.05) 0px 0px 40px 20px,
    rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset;
}
```

### Grid com Bordas (Vercel style)
```css
.grid-bordered {
  display: flex;
  flex-wrap: wrap;
  max-width: 1079px;
  margin: 0 auto;
}
.grid-bordered > * {
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
```

---

## Quando Usar

| Padrao | Quando Usar |
|--------|-------------|
| **Bento Grid** (Stripe) | Multiplas features de tamanhos diferentes |
| **Carousel** (Linear) | Features com narrativa sequencial |
| **Grid Bordered** (Vercel) | Developer tools, dados tabulares |
| **Cards com Glow** (Raycast) | App stores, showcases de extensoes |
| **Editorial** (Apple) | Produto unico com multiplas variacoes |

---

# Onda 2 — Feature Sections & Grids (17 sites)

---

## SaaS & AI

### 6. Notion — Bento Grid com Categorias Coloridas

Grid de cards em bento layout, cada categoria com cor distinta (azul, roxo, laranja, teal, etc.).

```css
.notion-bento-card {
  display: flex;
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 24px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 18px 0px,
              rgba(0, 0, 0, 0.027) 0px 2.025px 7.85px 0px;
}
```

**Espaçamento:** `4px` (129x), `8px` (71x), `24px` (70x), `16px` (38x), `64px` (11x)

---

### 7. Superhuman — Cards com Tipografia Variable

Cards minimalistas com tipografia Super Sans VF e pesos não-convencionais (460, 540).

```css
.superhuman-feature-card {
  display: flex;
  background: rgb(247, 245, 242); /* warm off-white */
  padding: 28px;
  border: 1px solid rgb(220, 215, 211);
}
```

**Espaçamento:** `4px` (48x), `8px` (43x), `12px` (28x), `16px` (21x), `36px` (17x)

---

### 8. OpenAI — Grid Ultra-Limpo com Bordas Sutis

Grid minimalista monocromático com cards separados por bordas de baixa opacity.

```css
.openai-feature-card {
  display: flex;
  background: rgb(255, 255, 255);
  padding: 32px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: rgba(0, 0, 0, 0.02) 0px 4px 6px, rgba(0, 0, 0, 0.05) 0px 0px 2px;
}
```

**Espaçamento:** `16px` (55x), `12px` (14x), `24px` (14x), `8px` (12x), `32px` (10x)

---

### 9. Anthropic — Grid 12-Colunas Responsivo com Serif

Sistema de grid robusto com 12 colunas, clamp() para responsividade, e tipografia serif nos cards de conteúdo.

```css
/* Grid columns system */
--column-width: calc((min(89.5rem, 100vw) - gutter * 2 - gap * 11) / 12);
```

**Espaçamento:** `8px` (147x), `4px` (78x), `16px` (38x), `12px` (28x), `24px` (13x)

---

### 10. Pitch — Cards com Accent Gradient e Sombra Suave

Cards escuros sobre fundo dark-purple, bordas visuais via box-shadow, gradientes roxos nos destaques.

```css
.pitch-feature-card {
  display: flex;
  background: rgb(30, 29, 40);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 10px;
  padding: 24px;
}
```

**Espaçamento:** `12px` (80x), `20px` (37x), `24px` (27x), `40px` (22x), `120px` (20x seção)

---

### 11. Circle — Feature Cards Pastel com Gradientes

Cards com gradientes pastel distintos para cada feature, sobre fundo dark.

```css
.circle-feature-card {
  display: flex;
  background: linear-gradient(rgb(224, 234, 252) 0%, rgb(207, 222, 243) 100%);
  border-radius: 16px;
  padding: 32px;
}
```

**Espaçamento:** `8px` (149x), `32px` (58x), `24px` (45x), `12px` (36x), `16px` (34x), `40px` (29x), `80px` (15x)

---

## Brasil Premium

### 12. Nubank — Cards com Radius Grande

Cards com border-radius generoso (24px) e paleta roxo/preto. Ícones via font proprietária (`nubankIcons`).

```css
.nubank-feature-card {
  display: flex;
  background: rgb(244, 244, 244);
  border-radius: 24px;
  padding: 24px;
}
```

**Espaçamento:** `24px` (102x), `8px` (54x), `4px` (30x), `16px` (23x), `32px` (15x), `48px` (11x), `80px` (10x)

---

### 13. Duck Design — Grid com Tipografia Oversize e Mono Labels

Layout com tipografia enorme (até 160px) e labels em fonte monospace para dados técnicos.

```css
.duck-feature-section {
  display: flex;
  padding: 30px;
  border-bottom: 1px solid rgb(102, 102, 102);
}
.duck-label {
  font-family: "Martian Mono SemiExpanded", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
```

---

### 14. GMX — Glass Cards com Inset Highlights

Cards com efeito glass morphism sofisticado — sombra profunda + inset white glow.

```css
.gmx-glass-card {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    rgba(0, 0, 0, 0.8) 0px 60px 120px 0px,
    rgba(255, 255, 255, 0.04) 0px 0px 0px 1px,
    rgba(255, 255, 255, 0.08) 0px 1px 0px 0px inset;
}
/* Variante light */
.gmx-light-card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  box-shadow:
    rgba(0, 0, 0, 0.04) 0px 6px 28px 0px,
    rgba(255, 255, 255, 0.7) 0px 1px 0px 0px inset;
}
```

**Espaçamento:** `12px` (43x), `18px` (41x), `16px` (37x), `10px` (27x), `20px` (26x), `50px` (24x), `48px` (10x)

---

### 15. Laghetto — Grid de Unidades com Booking Integration

Grid complexo com cards de hotel, preços, e integração com motor de reservas. DOM pesado (2293 nós).

```css
.laghetto-hotel-card {
  border: 1px solid rgba(10, 45, 35, 0.4);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.18) 0px 0px 26px;
  overflow: hidden;
}
```

---

### 16. FARM Rio — Product Grid E-commerce

Grid de produtos denso com sombras mínimas, tipografia Montserrat consistente. Gradiente rainbow tropical para banners.

```css
.farmrio-product-card {
  border-bottom: 1px solid rgb(245, 245, 245);
  padding: 8px;
}
.farmrio-banner {
  background: linear-gradient(90deg,
    rgb(222, 227, 94),
    rgb(255, 148, 145),
    rgb(135, 94, 143),
    rgb(153, 201, 181));
}
```

---

## Comparação de Grid Systems — Onda 2

| Site | Largura | Sistema | Card Radius | Border Style |
|------|---------|---------|-------------|--------------|
| Notion | Fluid | Bento Grid | 12px | `1px solid rgba(0, 0, 0, 0.1)` |
| Superhuman | Fluid | Flex | 10px | `1px solid rgb(220, 215, 211)` |
| OpenAI | Fluid | Flex Grid | 8px | `1px solid rgba(0, 0, 0, 0.12)` |
| Anthropic | 89.5rem max | 12-Col Grid | 8px | `1px solid rgba(20, 20, 19, 0.1)` |
| Pitch | Fluid | Flex | 12px | Shadow-based |
| Circle | Fluid | Flex Grid | 16px | `1px solid rgba(219, 219, 219, 0.25)` |
| Nubank | Fluid | Flex | 24px | Sem border visível |
| Duck Design | Full | Flex | 0px | `1px solid rgb(102, 102, 102)` |
| GMX | Fluid | Flex Grid | 20px | `1px solid rgba(255, 255, 255, 0.08)` |
| Laghetto | Fluid | Grid | 12px | `1px solid rgba(10, 45, 35, 0.4)` |
| FARM Rio | Fluid | Product Grid | 0px | `1px solid rgb(229, 229, 229)` |

### Insight: Border-radius aumentou na Onda 2 — média de 11px vs 7px da Onda 1. Nubank lidera com 24px.
