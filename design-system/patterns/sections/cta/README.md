---
name: "CTA & Button Patterns"
category: "sections/cta"
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

# CTA & Button Patterns — Padroes Extraidos

Catalogo de todos os estilos de botao encontrados nos 5 sites premium.

---

## 1. Stripe

### Primary Button
```css
.stripe-primary {
  display: flex;
  background: rgb(83, 58, 253);  /* roxo Stripe */
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 400;
  font-family: sohne-var, "SF Pro Display", sans-serif;
  padding: 15.5px 24px;
  border-radius: 4px;
}
```

### Transparent/Ghost Button (Nav)
```css
.stripe-ghost {
  display: flex;
  background: rgba(0, 0, 0, 0);
  color: rgb(6, 27, 49);
  font-size: 14px;
  font-weight: 400;
  padding: 12px 0px;
  border-radius: 4px;
}
```

### Hover/Transitions
```css
transition: background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
            color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
            border 0.3s cubic-bezier(0.25, 1, 0.5, 1);
```

**Caracteristicas:** Border-radius pequeno (4px), peso leve (font-weight 400), padding generoso vertical. Transicoes suaves com easing custom.

---

## 2. Linear

### Nav Link Button
```css
.linear-nav {
  display: flex;
  background: rgba(0, 0, 0, 0);
  color: rgb(138, 143, 152);
  font-size: 13px;
  font-weight: 400;
  padding: 0px 12px;
  border-radius: 4px;
}
```

### Card (como CTA visual)
```css
.linear-card-cta {
  display: flex;
  background: rgb(15, 16, 17);
  color: rgb(247, 248, 248);
  font-size: 16px;
  font-weight: 400;
  padding: 0px 24px 28px;
  border-radius: 8px;
}
```

### Input CTA (email capture)
```css
.linear-input {
  background: rgba(0, 0, 0, 0);
  color: rgb(247, 248, 248);
  font-size: 16px;
  padding: 1px 32px;
  border: none;
}
```

**Caracteristicas:** Botoes muito discretos no dark theme. CTAs sutis, o produto fala por si. Font-size pequeno (13px) no nav.

---

## 3. Vercel

### Secondary Button (Nav)
```css
.vercel-secondary {
  display: flex;
  background: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  font-size: 14px;
  font-weight: 500;
  padding: 0px 6px;
  border-radius: 6px;
  box-shadow: rgb(235, 235, 235) 0px 0px 0px 1px;
}
```

### Primary Button (Nav CTA)
```css
.vercel-primary {
  display: flex;
  background: rgb(23, 23, 23);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  padding: 0px 6px;
  border-radius: 6px;
}
```

### Nav Trigger (pill shape)
```css
.vercel-pill {
  display: flex;
  background: rgba(0, 0, 0, 0);
  color: rgb(77, 77, 77);
  font-size: 14px;
  font-weight: 400;
  padding: 8px 12px;
  border-radius: 9999px;  /* pill shape */
}
```

**Caracteristicas:** Border-radius de 6px (mais arredondado que Stripe). Shadow-as-border com `0px 0px 0px 1px`. Font-weight 500 para CTAs. Pill shapes para nav triggers.

---

## 4. Raycast

### Download Button (Primary Light)
```css
.raycast-primary {
  display: flex;
  background: rgb(230, 230, 230);
  color: rgb(47, 48, 49);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow:
    rgba(0, 0, 0, 0.5) 0px 0px 0px 2px,
    rgba(255, 255, 255, 0.19) 0px 0px 14px 0px,
    rgba(0, 0, 0, 0.2) 0px -1px 0.4px 0px inset,
    rgb(255, 255, 255) 0px 1px 0.4px 0px inset;
}
```

### Navigation Button (circular)
```css
.raycast-nav-circle {
  display: flex;
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 20px;
  border-radius: 86px;
  box-shadow: rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset;
}
```

### Badge
```css
.raycast-badge {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  color: rgb(255, 255, 255);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}
```

**Caracteristicas:** Glass morphism com multiplas camadas de box-shadow (inset + outer). Border-radius de 8px. Efeito de depth com inset shadows brancos sobre fundo escuro — cria a ilusao de botao fisico.

---

## 5. Apple iPhone

### Link CTA (Blue)
```css
.apple-cta-link {
  color: rgb(0, 102, 204);
  font-size: 17px;
  font-weight: 600;
  font-family: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", sans-serif;
}
```

### Nav Link
```css
.apple-nav-link {
  color: rgba(0, 0, 0, 0.56);
  font-size: 12px;
  font-weight: 400;
  font-family: "SF Pro Text", "Myriad Set Pro", sans-serif;
}
```

**Caracteristicas:** Apple nao usa botoes tradicionais no hero — prefere links de texto com setas (chevron). Cor azul iconica `#0066CC`. Font-weight 600 para CTAs. Sem bordas ou backgrounds.

---

## Comparacao de Estilos

| Site | Radius | Peso | Padding | Abordagem |
|------|--------|------|---------|-----------|
| Stripe | 4px | 400 | 15.5px 24px | Solid color, compact |
| Linear | 4-8px | 400 | 0 12px | Ghost/transparent |
| Vercel | 6px / 9999px | 500 | 0 6px / 8px 12px | Shadow-border, pill nav |
| Raycast | 8px | 500 | 8px 12px | Glass morphism, inset shadow |
| Apple | N/A | 600 | text-only | Links de texto, sem botao |

---

## CSS Reference — Copy-Paste

### Botao Solid (Stripe style)
```css
.btn-solid {
  display: inline-flex;
  align-items: center;
  background: rgb(83, 58, 253);
  color: #fff;
  font-size: 16px;
  font-weight: 400;
  padding: 15.5px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
```

### Botao Glass (Raycast style)
```css
.btn-glass {
  display: inline-flex;
  align-items: center;
  background: rgb(230, 230, 230);
  color: rgb(47, 48, 49);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  box-shadow:
    rgba(0, 0, 0, 0.5) 0px 0px 0px 2px,
    rgba(255, 255, 255, 0.19) 0px 0px 14px 0px,
    rgba(0, 0, 0, 0.2) 0px -1px 0.4px 0px inset,
    rgb(255, 255, 255) 0px 1px 0.4px 0px inset;
}
```

### Botao Shadow-Border (Vercel style)
```css
.btn-shadow-border {
  display: inline-flex;
  align-items: center;
  background: rgb(23, 23, 23);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 0 6px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.btn-shadow-border-secondary {
  background: #fff;
  color: rgb(23, 23, 23);
  box-shadow: rgb(235, 235, 235) 0px 0px 0px 1px;
}
```

### Link CTA (Apple style)
```css
.link-cta {
  color: rgb(0, 102, 204);
  font-size: 17px;
  font-weight: 600;
  font-family: "SF Pro Text", "Helvetica Neue", sans-serif;
  text-decoration: none;
  transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
}
```

---

## Quando Usar Cada Estilo

| Estilo | Quando Usar |
|--------|-------------|
| **Solid** (Stripe) | SaaS B2B, fintech, produtos com CTA claro |
| **Glass** (Raycast) | Apps desktop, dark themes, produtos premium |
| **Shadow-Border** (Vercel) | Developer tools, plataformas tecnicas |
| **Link CTA** (Apple) | Produtos consumer, editorial, quando a imagem ja vende |
| **Ghost** (Linear) | Interfaces densas, quando o CTA nao deve competir com o conteudo |

---

# Onda 2 — CTAs & Botões (17 sites)

---

## SaaS & AI

### 6. Framer

#### Primary CTA (Accent Blue)
```css
.framer-primary {
  background: rgb(0, 153, 255);
  color: rgb(255, 255, 255);
  font-size: 13px;
  font-weight: 500;
  font-family: Inter, sans-serif;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgb(0, 153, 255);
}
```

#### Ring Button (Dark)
```css
.framer-ring {
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  font-size: 15px;
  font-weight: 400;
  box-shadow: rgb(9, 9, 9) 0px 0px 0px 2px;
}
```

**Características:** Radius pequeno (6px), padding compacto, botões discretos. Transition suave: `color 0.3s cubic-bezier(0.44, 0, 0.56, 1)`.

---

### 7. Notion

#### Primary CTA (Blue Solid)
```css
.notion-primary {
  background: rgb(0, 117, 222);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 500;
  font-family: NotionInter, Inter, sans-serif;
  padding: 8px 24px;
  border-radius: 8px;
}
```

#### Ghost Button (Nav)
```css
.notion-ghost {
  background: rgba(0, 0, 0, 0);
  color: rgba(0, 0, 0, 0.9);
  font-size: 14px;
  font-weight: 500;
  padding: 6px 8px;
  border-radius: 6px;
}
```

**Características:** Sombra suave nos cards (4 camadas): `rgba(0, 0, 0, 0.04) 0px 4px 18px`. Border-radius de 8px nos CTAs. Cores quentes com preto transparente.

---

### 8. Superhuman

#### Primary CTA (Purple Ring)
```css
.superhuman-primary {
  background: rgb(113, 76, 182);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 600;
  font-family: "Super Sans VF", system-ui, sans-serif;
  padding: 12px 24px;
  border-radius: 10px;
  box-shadow: rgb(113, 76, 182) 0px 0px 0px 1px inset;
}
```

**Características:** Variable font com peso customizado (460, 540). Shadow ring inset como border sutil. Hatched pattern para backgrounds decorativos: `repeating-linear-gradient(45deg, ... 1px, transparent 1px, transparent 5px)`.

---

### 9. Runway

#### Primary CTA (White on Dark)
```css
.runway-primary {
  background: rgb(255, 255, 255);
  color: rgb(12, 12, 12);
  font-size: 14px;
  font-weight: 600;
  font-family: abcNormal, sans-serif;
  padding: 8px 16px;
  border-radius: 6px;
}
```

#### Ghost Button
```css
.runway-ghost {
  background: rgba(0, 0, 0, 0);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgb(39, 39, 42);
  border-radius: 6px;
}
```

**Características:** Abordagem contida — botão branco no dark theme, sem gradientes ou efeitos. Minimalismo de Runway reflete no CTA.

---

### 10. OpenAI

#### Primary CTA (Black Solid)
```css
.openai-primary {
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  font-family: "OpenAI Sans", sans-serif;
  padding: 8px 12px;
  border-radius: 9999px; /* pill */
  border: 1px solid rgba(0, 0, 0, 0.12);
}
```

**Características:** Pill shape (`border-radius: 9999px`). Sombra sutil: `rgba(0, 0, 0, 0.02) 0px 4px 6px, rgba(0, 0, 0, 0.05) 0px 0px 2px`. Transição: `color 0.2s cubic-bezier(0, 0, 1, 1)`.

---

### 11. Anthropic

#### Primary CTA (Dark Solid com Border)
```css
.anthropic-primary {
  background: rgb(20, 20, 19);
  color: rgb(250, 249, 245);
  font-size: 16px;
  font-weight: 500;
  font-family: "Anthropic Sans", Arial, sans-serif;
  padding: 12px 24px;
  border: 1px solid rgba(20, 20, 19, 0.3);
  border-radius: 8px;
}
```

#### Tertiary (Border Only)
```css
.anthropic-tertiary {
  background: rgba(0, 0, 0, 0);
  color: rgb(20, 20, 19);
  font-size: 15px;
  font-weight: 600;
  border: 1px solid rgba(20, 20, 19, 0.1);
  border-radius: 8px;
}
```

**Características:** Tons quentes — o preto é `rgb(20, 20, 19)`, não preto puro. Border sutil com opacity. Transições rápidas: `transform 0.2s, color 0.2s`.

---

### 12. Pitch

#### Primary CTA (Gradient Purple)
```css
.pitch-primary {
  background: linear-gradient(90deg, rgb(141, 73, 247), rgb(107, 83, 255));
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 700;
  font-family: Eina01, sans-serif;
  padding: 12px 24px;
  border-radius: 6px;
}
```

#### Secondary (Outlined)
```css
.pitch-secondary {
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 600;
  border: 1px solid rgb(221, 223, 229);
  border-radius: 6px;
}
```

**Características:** Gradiente no botão primário — pattern incomum entre os 22 sites. Accent amarelo para badges: `9px solid rgb(255, 208, 44)`.

---

### 13. Loom

#### Primary CTA (Blue Solid)
```css
.loom-primary {
  background: rgb(24, 104, 219);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 700;
  font-family: "Charlie Text", sans-serif;
  padding: 12px 24px;
  border-radius: 8px;
}
```

**Características:** Tipografia Charlie (proprietária, humanista). Sombra de elevação generosa: `rgba(0, 0, 0, 0.04) 0px 2px 6px, rgba(0, 0, 0, 0.1) 0px 24px 83px`. Border laranja para destaque: `1px solid rgb(255, 171, 0)`.

---

### 14. Circle

#### Primary CTA (Gradient Blue-Purple)
```css
.circle-primary {
  background: linear-gradient(142deg, rgb(64, 143, 237) 18.68%, rgb(62, 27, 201) 78.25%);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 600;
  font-family: Inter, system-ui, sans-serif;
  padding: 12px 32px;
  border-radius: 8px;
}
```

**Características:** Gradiente no CTA primário (similar a Pitch). Shadow card: `rgba(169, 169, 169, 0.08) 0px 4px 8px`. Focus ring azul: `rgb(83, 156, 242) 0px 0px 0px 2px`.

---

## Brasil Premium

### 15. Nubank

#### Primary CTA (Roxo Solid)
```css
.nubank-primary {
  background: rgb(130, 10, 209);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 500;
  font-family: graphikMedium, arial, helvetica;
  padding: 16px 32px;
  border-radius: 24px; /* muito arredondado */
}
```

**Características:** Radius de 24px — o maior entre todos os sites (junto com pill shapes). Sem sombras nos botões. Gradiente fade: `linear-gradient(rgba(0, 0, 0, 0), rgb(0, 0, 0))`.

---

### 16. Duck Design

#### Primary CTA (Amarelo Dourado)
```css
.duck-primary {
  background: rgb(248, 224, 142);
  color: rgb(0, 0, 0);
  font-size: 14px;
  font-weight: 500;
  font-family: Pretendard, sans-serif;
  padding: 10px 20px;
  border: 1px solid rgb(248, 224, 142);
}
```

#### Outlined (Gray Border)
```css
.duck-outlined {
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  border: 2px solid rgb(102, 102, 102);
}
```

**Características:** Accent dourado como diferencial. Border de 2px (mais pesado que a maioria). Font Mono para labels: `"Martian Mono SemiExpanded"`.

---

### 17-18. Reino / Pulso Hotel

#### Reino — Border Button
```css
.reino-button {
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 700;
  font-family: Poppins, sans-serif;
  border: 1px solid rgb(255, 255, 255);
}
```

#### Pulso Hotel — CTA Dourado
```css
.pulso-button {
  background: rgb(217, 181, 125);
  color: rgb(51, 51, 51);
  font-size: 14px;
  font-weight: 600;
  font-family: "Fff Acidgrotesk", Tahoma, sans-serif;
  padding: 12px 24px;
  border: 1px solid rgb(217, 181, 125);
}
```

---

### 19-21. Laghetto / FARM Rio / GMX

#### Laghetto — CTA Verde
```css
.laghetto-primary {
  background: rgb(10, 45, 35);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  font-family: Inter, sans-serif;
  border: 1px solid rgb(10, 45, 35);
  border-radius: 100px; /* pill */
}
```

#### FARM Rio — CTA Minimalista
```css
.farmrio-primary {
  background: rgb(51, 51, 51);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 600;
  font-family: Montserrat, sans-serif;
  padding: 12px 24px;
  border: 1px solid rgb(51, 51, 51);
}
```

#### GMX — CTA Neon
```css
.gmx-primary {
  background: linear-gradient(90deg, rgb(0, 242, 254), rgb(255, 0, 127));
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 600;
  font-family: Inter, sans-serif;
  padding: 12px 24px;
  border-radius: 14px;
}
```

---

## Comparação Completa de CTAs — Onda 2

| Site | Radius | Peso | Padding | Abordagem |
|------|--------|------|---------|-----------|
| Framer | 6px | 500 | 6px 10px | Compact, ring shadow |
| Notion | 8px | 500 | 8px 24px | Solid clean, warm colors |
| Superhuman | 10px | 600 | 12px 24px | Purple ring inset |
| Runway | 6px | 600 | 8px 16px | White on dark, minimal |
| OpenAI | 9999px | 500 | 8px 12px | Pill shape, ultra-clean |
| Anthropic | 8px | 500 | 12px 24px | Warm dark solid |
| Pitch | 6px | 700 | 12px 24px | **Gradient purple** |
| Loom | 8px | 700 | 12px 24px | Blue solid, Charlie font |
| Circle | 8px | 600 | 12px 32px | **Gradient blue-purple** |
| Nubank | 24px | 500 | 16px 32px | Pill-ish, roxo Nubank |
| Duck Design | 0px | 500 | 10px 20px | Gold accent, 2px border |
| Reino | 0px | 700 | — | Border only, high contrast |
| Pulso Hotel | — | 600 | 12px 24px | Gold warm, light weight |
| Laghetto | 100px | 500 | — | Pill, verde floresta |
| FARM Rio | 0px | 600 | 12px 24px | Minimal dark |
| GMX | 14px | 600 | 12px 24px | **Gradient neon** |

### Insight: 3 sites usam gradientes no CTA primário (Pitch, Circle, GMX) — todos com público mais jovem/criativo.
