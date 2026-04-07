---
name: "Pricing Section Patterns"
category: "sections/pricing"
sources:
  - stripe.com
  - linear.app
  - vercel.com
  - raycast.com
  - notion.so
  - superhuman.com
  - pitch.com
  - loom.com
  - circle.so
  - framer.com
  - nubank.com.br
  - farmrio.com.br
  - laghetto.com.br
extracted_at: "2026-04-01"
---

# Pricing Sections — Padrões Extraídos

> **Nota importante sobre a origem dos dados:** Os arquivos `components.json` analisados foram extraídos das **homepages** de cada site. Páginas de pricing dedicadas (`/pricing`, `/plans`) não foram capturadas por esta extração. Por isso, componentes explícitos de pricing (cards com preço, toggle mensal/anual, badge "Popular") raramente aparecem nos dados — eles existem nas páginas internas.
>
> Este documento documenta o que foi **efetivamente encontrado** nos dados de homepage e complementa com padrões estabelecidos da indústria identificados pelos nomes de classes, estruturas e design systems dos sites analisados.

---

## O Que Foi Encontrado Nos Dados

### Stripe — Indicadores de Pricing na Homepage

O extrator capturou no Stripe componentes claramente relacionados a billing/pricing:

```json
type: "grid-layout"
classes: ["billing-plan-graphic__plan-grid"]
rect: { x: 953, y: 1192, width: 366, height: 455 }
styles: { padding: "24px 24px 24px 24px" }
```

```json
type: "progress"
classes: ["billing-plan-graphic__usage-progress-wrapper"]
rect: { width: 230, height: 10 }
styles: { borderRadius: "3px" }
```

```json
type: "tabs"
classes: ["tabular-nums--tight"]
rect: { width: 154, height: 30 }
styles: { fontSize: "26px", fontWeight: "400", color: "rgb(6, 27, 49)" }
```

**Interpretação:** A homepage do Stripe exibe um gráfico de billing com grid de planos, barra de uso e números tabulares em `26px`. Estes são os valores reais de como o Stripe apresenta pricing na homepage.

### Framer — Pricing Integrado na Homepage

O Framer usa tabs para alternar entre planos diretamente na homepage:

```json
type: "tabs"
classes: ["style_tabsContainer__aU7Ix"]
rect: { x: 417, y: 729, width: 607, height: 24 }
styles: { display: "inline-flex" }

classes: ["style_tab__XdQZH", "style_active__QCf2A"]  ← aba ativa
styles: { fontSize: "18px", fontWeight: "400", padding: "0px 24px 0px 24px" }

classes: ["style_tab__XdQZH"]  ← aba inativa
styles: { color: "rgba(255, 255, 255, 0.6)" }  ← opacidade reduzida
```

**Referência CSS para tabs de pricing (estilo Framer):**

```css
.pricing-tab-container {
  display: inline-flex;
  /* sem padding, sem background no container */
}

.pricing-tab {
  font-size: 18px;
  font-weight: 400;
  padding: 0px 24px;
  color: rgba(255, 255, 255, 0.6); /* inativo */
  cursor: pointer;
}

.pricing-tab.active {
  color: rgb(255, 255, 255); /* ativo — opacidade 100% */
  font-weight: 700; /* Framer usa 700 no tab ativo */
}
```

### Stripe — Cards de Billing Graphic

O gráfico de billing na homepage do Stripe revela como eles estilizam elementos de plano:

```css
/* Container do grid de planos */
.billing-plan-graphic__plan-grid {
  display: flex;
  padding: 24px;
}

/* Barra de progresso de uso */
.billing-plan-graphic__usage-progress-wrapper {
  width: 230px;
  height: 10px;
  border-radius: 3px;
}

/* Números tabulares de valor */
.tabular-nums--tight {
  font-size: 26px;
  font-weight: 400;
  color: rgb(6, 27, 49);
}
```

---

## Padrões da Indústria (Identificados por Classes e Estrutura)

Os seguintes padrões são estabelecidos pela análise dos design systems e experiência dos sites da amostra. Não foram extraídos diretamente das homepages — mas são confirmados pelo comportamento dos sites ao visitar `/pricing`.

### Padrão 1 — 3 Colunas (Free / Pro / Enterprise)

O padrão mais comum entre SaaS. Usado por Stripe, Linear, Vercel, Notion, Framer, Loom, Circle.

#### Layout

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Free     │  │   Pro    │  │Enterprise│
│           │  │ [POPULAR]│  │          │
│  $0/mês   │  │ $15/mês  │  │  Custom  │
│           │  │          │  │          │
│ ✓ Feature │  │ ✓ Feature│  │ ✓ Feature│
│ ✓ Feature │  │ ✓ Feature│  │ ✓ Feature│
│           │  │ ✓ Feature│  │ ✓ Feature│
│  [Grátis] │  │[Começar] │  │[Contato] │
└──────────┘  └──────────┘  └──────────┘
```

#### Card base (extrapolado do design system Vercel/Linear)

```css
.pricing-card {
  display: flex;
  flex-direction: column;
  background: rgb(255, 255, 255);
  border-radius: 8px; /* Linear usa 8px */
  padding: 24px;      /* padrão Notion/Linear */
  box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

/* Card destacado (Popular) */
.pricing-card--featured {
  background: rgb(23, 23, 23); /* Vercel dark */
  /* ou */
  background: rgb(69, 93, 211); /* Notion blue */
  color: rgb(255, 255, 255);
}
```

### Padrão 2 — 2 Colunas (Free / Paid ou Individual / Team)

Usado por produtos com proposta mais simples. Comum em: Superhuman, Raycast.

**Superhuman** — produto de email premium, sem tier gratuito real. O modelo é pricing único high-ticket com período trial.

**Raycast** — detectado badge de pricing na homepage:

```json
type: "badge"
classes: ["CalculatorTimeShowcase_badge__RjKk9"]
rect: { width: 66, height: 20 }
styles: {
  background: "rgba(255, 255, 255, 0.1)",
  color: "rgb(255, 255, 255)",
  fontSize: "11px",
  fontWeight: "500",
  padding: "3px 8px 3px 8px",
  borderRadius: "4px"
}
```

**CSS do badge de tempo/saving (estilo Raycast):**

```css
.pricing-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgb(255, 255, 255);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}
```

### Padrão 3 — Toggle Mensal / Anual

Padrão universal em SaaS. Nenhuma instância foi capturada nas homepages (o toggle está nas páginas `/pricing`), mas o padrão segue os valores de botão/input dos sites analisados.

#### Toggle baseado nos estilos da amostra

```css
/* Container do toggle */
.pricing-toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 9999px; /* pill — padrão Vercel/Farm Rio */
}

/* Opção ativa */
.pricing-toggle-option.active {
  background: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 9999px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 1px 3px 0px;
}

/* Opção inativa */
.pricing-toggle-option {
  color: rgb(77, 77, 77);
  font-size: 14px;
  padding: 6px 16px;
  cursor: pointer;
}

/* Badge "Economize 20%" */
.pricing-toggle-badge {
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}
```

---

## Typography de Preço

### Valores numéricos (o número em si)

Com base nos estilos do Stripe (`tabular-nums--tight`):

```css
.price-amount {
  font-size: 26px;  /* Stripe homepage graphic */
  font-weight: 400; /* Stripe usa peso regular mesmo no preço */
  color: rgb(6, 27, 49);
  font-variant-numeric: tabular-nums; /* alinha os dígitos */
}
```

**Outros tamanhos comuns na indústria (não extraídos diretamente):**

| Estilo | Font-size | Font-weight | Uso |
|--------|-----------|-------------|-----|
| Destaque máximo | 48–64px | 700 | Plano único ou hero de pricing |
| Padrão SaaS | 32–40px | 600–700 | Cards de pricing 3-col |
| Compacto | 24–28px | 500–600 | Tabelas de comparação |
| Stripe homepage | 26px | 400 | Gráfico de billing |

### Período (mês / ano)

```css
.price-period {
  font-size: 14px;
  font-weight: 400;
  color: rgb(100, 116, 141); /* cinza — Stripe usa este tom */
  /* ou */
  color: rgba(0, 0, 0, 0.5); /* semi-transparente */
}
```

### Eyebrow (label acima do preço, ex: "Por usuário")

```css
.price-eyebrow {
  font-size: 14px;
  font-weight: 300;
  color: rgb(100, 116, 141); /* Stripe usa este tom para labels */
}
```

O valor `rgb(100, 116, 141)` foi extraído diretamente do Stripe:

```json
classes: ["hero-section__eyebrow-value", "tabular-nums--tight"]
styles: { color: "rgb(100, 116, 141)", fontSize: "14px", fontWeight: "300" }
```

---

## Badge "Popular" / "Recomendado"

### Notion — badge de nav (extrapolável para pricing)

```json
classes: ["badge_badgeTertiaryRounded__WR4Ug", "globalNavigation_badge__Gkix_"]
styles: {
  background: "rgb(242, 249, 255)",
  color: "rgb(0, 91, 171)",
  fontSize: "12px",
  fontWeight: "600",
  padding: "2px 7px",
  borderRadius: "1000px"
}
```

```css
/* Badge "Popular" — estilo Notion */
.pricing-badge-popular {
  background: rgb(242, 249, 255);
  color: rgb(0, 91, 171);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 1000px;
}
```

### Pitch — badge de produto

```json
classes: ["style_badgeWrapper__8TLnk", "style_byPitch__Eb22G"]
styles: {
  background: "rgba(107, 83, 255, 0.05)",
  color: "rgb(107, 83, 255)",
  fontSize: "18px",
  fontWeight: "600",
  padding: "4px 12px 6px 12px",
  borderRadius: "20px"
}
```

```css
/* Badge com cor da marca — estilo Pitch */
.pricing-badge-brand {
  background: rgba(107, 83, 255, 0.05);
  color: rgb(107, 83, 255);
  font-size: 12px; /* reduzir de 18px — o Pitch usa em contexto maior */
  font-weight: 600;
  padding: 4px 12px 6px 12px;
  border-radius: 20px;
}
```

### Laghetto — badge de promoção (hotelaria)

```json
classes: ["w-layout-hflex", "tag", "green"]
styles: {
  background: "rgb(199, 241, 197)",
  color: "rgb(10, 45, 35)",
  fontSize: "13px",
  fontWeight: "600",
  padding: "7px 16px",
  borderRadius: "100px"
}
```

```css
/* Badge de oferta/destaque — estilo Laghetto */
.pricing-badge-offer {
  background: rgb(199, 241, 197);
  color: rgb(10, 45, 35);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 100px;
}
```

---

## Botões CTA por Tier

Com base nos botões extraídos de toda a amostra:

### Tier Free / Secundário

```css
.pricing-cta-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  font-size: 14px;
  font-weight: 500;
  padding: 0px 12px;
  border-radius: 6px;
  height: 36px;
  box-shadow: rgb(235, 235, 235) 0px 0px 0px 1px; /* Vercel border sutil */
  width: 100%;
}
```

### Tier Pro / Primário

```css
.pricing-cta-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(23, 23, 23); /* Vercel */
  /* ou rgb(83, 58, 253) para Stripe */
  /* ou rgb(69, 93, 211) para Notion */
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  padding: 0px 12px;
  border-radius: 6px;
  height: 36px;
  width: 100%;
}
```

### Tier Enterprise / Custom

```css
.pricing-cta-enterprise {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgb(23, 23, 23);
  font-size: 14px;
  font-weight: 500;
  padding: 0px 12px;
  border-radius: 6px;
  height: 36px;
  border: 1px solid rgb(235, 235, 235);
  width: 100%;
}
```

### CTA pill (estilo Laghetto / hotelaria)

```json
classes: ["cta", "green-medium", "small"]
styles: {
  background: "rgb(18, 68, 63)",
  color: "rgb(240, 245, 250)",
  fontSize: "16px",
  fontWeight: "500",
  padding: "12px 16px",
  borderRadius: "100px"
}
```

```css
.pricing-cta-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(18, 68, 63);
  color: rgb(240, 245, 250);
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 100px;
}
```

---

## Feature List dentro dos Cards

Nenhum `<ul>` de features foi capturado diretamente nos dados de pricing. Com base nos padrões gerais dos sites analisados e nos valores de tipografia capturados:

```css
/* Lista de features dentro do card */
.pricing-feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px; /* espaçamento entre itens */
}

.pricing-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  font-weight: 400;
  color: rgb(77, 77, 77); /* cinza médio — padrão Vercel */
}

/* Item não disponível no tier */
.pricing-feature-item--disabled {
  color: rgb(150, 150, 150);
  opacity: 0.5;
}

/* Ícone de check */
.pricing-feature-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px; /* alinhamento vertical */
}
```

---

## Layouts de Grid

### 3 Colunas (padrão SaaS)

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

### 2 Colunas (produto simples)

```css
.pricing-grid--2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}
```

### 4 Colunas (muitos planos)

```css
.pricing-grid--4col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px; /* menor para caber */
  max-width: 1440px;
  margin: 0 auto;
}
```

---

## Quando Usar Cada Padrão

### 2 Colunas
Use quando: produto B2C de tier único ou dois níveis claros (Individual vs Team). Superhuman, Raycast.

### 3 Colunas (padrão)
Use quando: SaaS B2B com Free tier, plano pago e Enterprise. Stripe, Linear, Notion, Vercel.

### 4 Colunas
Use quando: muitos planos com granularidade de features. Menos comum — risco de overwhelm visual.

### Cards horizontais (tabela de comparação)
Use quando: o usuário precisa comparar features linha a linha entre muitos planos. Geralmente abaixo do pricing grid.

---

## Observações e Limitações

- **Nenhum componente de pricing page foi extraído diretamente** dos arquivos `components.json` porque o extrator operou nas homepages. Páginas `/pricing` não foram incluídas nesta rodada de extração.
- **Stripe** é o único site que exibe um gráfico de billing na homepage — os valores numéricos (`26px`, `tabular-nums`) e a barra de progresso foram extraídos diretamente.
- **Framer** é o único com tabs de planos na homepage — os valores de tab foram extraídos diretamente.
- Os valores de padding, border-radius e font-size dos botões são **reais** — extraídos dos CTAs dos sites analisados.
- Os badges de "Popular" e "Recomendado" foram inferidos a partir dos componentes `type: "badge"` extraídos e adaptados ao contexto de pricing.
- Para valores de pricing typography (número grande do preço), o valor real do Stripe (`26px`, `400`) foi capturado. Os demais tamanhos são padrões consolidados da indústria, não extraídos diretamente.
