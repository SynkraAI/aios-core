---
name: "Visual Effects Catalog"
category: "effects"
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

# Catálogo de Efeitos Visuais — Extraídos dos 22 Sites

Todas as animacoes, transicoes, gradientes e sombras encontradas nos dados reais.

---

## 1. Sistemas de Sombras (Shadow Elevation)

### Stripe — Sombras Suaves (Light Theme)

| Nivel | Valor | Uso |
|-------|-------|-----|
| XS | `rgba(23, 23, 23, 0.06) 0px 3px 6px 0px` | Cards pequenos |
| SM | `rgba(50, 50, 93, 0.12) 0px 16px 32px 0px` | Cards elevados |
| MD | `rgba(23, 23, 23, 0.08) 0px 15px 35px 0px` | Cards com destaque |
| LG | `rgba(0, 0, 0, 0.1) 0px 30px 60px -50px, rgba(50, 50, 93, 0.25) 0px 30px 60px -10px` | Modais/overlays |
| Subtle | `rgba(0, 0, 0, 0.06) 0px 4px 24px 0px, rgba(0, 0, 0, 0.03) 0px 1px 2px 0px` | Elevacao sutil |

### Linear — Sombras Dark Theme

| Nivel | Valor | Uso |
|-------|-------|-----|
| Divider | `rgba(0, 0, 0, 0.03) 0px 1.2px 0px 0px` | Separadores (31 usos) |
| Elevation | `rgba(0, 0, 0, 0.4) 0px 2px 4px 0px` | Cards (16 usos) |
| Inset | `rgba(0, 0, 0, 0.2) 0px 0px 12px 0px inset` | Input fields (7 usos) |
| Ring | `rgb(35, 37, 42) 0px 0px 0px 1px inset` | Borders como sombra (5 usos) |
| Deep | `rgba(0, 0, 0) 0px 8px 2px, ... 0px 0px 1px 0px` | Stack de 5 camadas |
| Float | `rgba(8, 9, 10, 0.6) 0px 4px 32px 0px` | Dropdowns |

### Vercel — Shadow-as-Border

| Nivel | Valor | Uso |
|-------|-------|-----|
| Border | `rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px, rgb(250, 250, 250) 0px 0px 0px 1px` | Cards (6 usos) |
| Ring | `rgb(235, 235, 235) 0px 0px 0px 1px` | Botoes (3 usos) |
| Focus | `rgb(255, 255, 255) 0px 0px 0px 2px, rgb(0, 114, 245) 0px 0px 0px 4px` | Focus state |
| Deep Card | `rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.02) 0px 1px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgb(250, 250, 250) 0px 0px 0px 1px, rgb(255, 255, 255) 0px 0px 0px 1px` | Card elevado |

### Raycast — Glass Morphism Shadows

| Nivel | Valor | Uso |
|-------|-------|-----|
| Key | `rgba(0, 0, 0, 0.4) 0px 1.5px 0.5px 2.5px, rgb(0, 0, 0) 0px 0px 0.5px 1px, rgba(0, 0, 0, 0.25) 0px 2px 1px 1px inset, rgba(255, 255, 255, 0.2) 0px 1px 1px 1px inset` | Teclas/botoes (81 usos) |
| Container | `rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset` | Containers (54 usos) |
| Glow | `rgba(215, 201, 175, 0.05) 0px 0px 20px 5px, rgba(215, 201, 175, 0.05) 0px 0px 16px -7px` | Glow sutil (18 usos) |
| Button Glass | `rgba(0, 0, 0, 0.5) 0px 0px 0px 2px, rgba(255, 255, 255, 0.19) 0px 0px 14px, rgba(0, 0, 0, 0.2) 0px -1px 0.4px inset, rgb(255, 255, 255) 0px 1px 0.4px inset` | CTAs (8 usos) |
| Card Glow | `rgba(255, 255, 255, 0.1) 0px 1px 0px inset, rgba(7, 13, 79, 0.05) 0px 0px 20px 3px, rgba(7, 13, 79, 0.05) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset` | Extension cards |
| Deep Float | `rgba(0, 0, 0, 0.4) 0px 4px 40px 8px, rgba(0, 0, 0, 0.8) 0px 0px 0px 0.5px, rgba(255, 255, 255, 0.3) 0px 0.5px 0px inset` | Modais flutuantes |

### Apple — Sombras Minimas
Apple iPhone nao possui sombras extraidas nos dados (`shadows: []`). O design depende de cor, tipografia e espaco.

---

## 2. Gradientes

### Stripe — Gradientes Multicoloridos (Ricos)

```css
/* Aurora/Mesh gradient (secao hero) */
background: radial-gradient(103.24% 102.63% at 50% 102.63%,
  rgb(72, 111, 253) 0px,
  rgb(127, 129, 243) 9.84%,
  rgb(196, 137, 255) 20.83%,
  rgb(218, 192, 255) 34.13%,
  rgb(234, 220, 255) 44.86%,
  rgb(249, 246, 255) 58.59%,
  rgb(248, 250, 253) 100%);

/* Gradient bar (linear) */
background: linear-gradient(90deg,
  rgb(114, 50, 241) 3.13%,
  rgb(251, 118, 250) 50%,
  rgb(255, 207, 94));

/* Warm gradient */
background: radial-gradient(102.68% 99.11% at 50% 104.6%,
  rgb(203, 131, 255) 0px,
  rgb(255, 144, 185) 15.77%,
  rgb(255, 201, 119) 30.62%,
  rgb(255, 215, 155) 38.04%,
  rgb(255, 241, 220) 50.11%,
  rgb(255, 255, 255) 63.1%,
  rgb(248, 250, 253) 98.81%);

/* Glow circle */
background: radial-gradient(50% 50%,
  rgba(83, 58, 253, 0.8) 62.5%,
  rgba(83, 58, 253, 0) 100%);
```

### Linear — Gradientes Sutis Dark

```css
/* Fade overlay */
background: linear-gradient(rgba(11, 11, 11, 0.8) 0px,
  oklab(0.149576 0.00000680983 0.00000298768 / 0.761905) 100%);

/* Composted radial */
background: radial-gradient(52.53% 57.5% at 50% 100%,
  rgba(8, 9, 10, 0) 0px,
  rgba(8, 9, 10, 0.5) 100%),
  linear-gradient(rgb(8, 9, 10) 10%, rgb(208, 214, 224) 100%);

/* Subtle glow */
background: radial-gradient(50% 50%,
  rgba(255, 255, 255, 0.04) 0px,
  rgba(255, 255, 255, 0) 90%);

/* Repeating dashed */
background: repeating-linear-gradient(to right,
  rgb(35, 37, 42) 0px, rgb(35, 37, 42) 3px,
  rgba(0, 0, 0, 0) 3px, rgba(0, 0, 0, 0) 7px);
```

### Vercel — Conic Gradient (Unico)

```css
/* Signature conic gradient */
background: conic-gradient(from 180deg at 50% 70%,
  rgba(250, 250, 250, 0) 0deg,
  rgb(238, 195, 45) 72deg,
  rgb(236, 75, 75) 144deg,
  rgb(112, 154, 185) 216deg,
  rgb(77, 255, 191) 288deg,
  rgba(250, 250, 250, 0) 360deg);
```

### Raycast — Gradientes Escuros com Glow

```css
/* Card background */
background: linear-gradient(137deg,
  rgba(17, 18, 20, 0.75) 4.87%,
  rgba(12, 13, 15, 0.9) 75.88%);

/* Conic rainbow */
background: conic-gradient(from 136.95deg,
  rgb(2, 148, 254) -55.68deg,
  rgb(255, 33, 54) 113.23deg,
  rgb(155, 77, 255) 195deg,
  rgb(2, 148, 254) 304.32deg,
  rgb(255, 33, 54) 473.23deg);

/* Red CTA gradient */
background: linear-gradient(rgb(255, 99, 99), rgb(215, 42, 42));

/* Blue accent */
background: linear-gradient(135deg,
  rgb(86, 194, 255) 0%,
  rgb(19, 138, 242) 100%);

/* Metal key */
background: radial-gradient(79.21% 79.21% at 42.35% 0px,
  rgb(120, 120, 120) 0px,
  rgb(40, 40, 40) 100%);

/* Dot pattern */
background: radial-gradient(rgb(47, 48, 49) 0.5px, rgba(0, 0, 0, 0) 0px);
```

### Apple — Gradientes Simples

```css
/* Image overlay */
background: linear-gradient(
  rgba(0, 0, 0, 0.24),
  rgba(0, 0, 0, 0.42),
  rgba(0, 0, 0, 0.56));

/* Fade to white */
background: linear-gradient(to right,
  rgba(255, 255, 255, 0),
  rgb(255, 255, 255) 50%);
```

---

## 3. Animacoes (Keyframes)

### Raycast — Animacoes Ricas

```css
/* Progress bar */
@keyframes progress {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

/* Blink cursor */
@keyframes blink {
  50% { opacity: 0; }
}

/* Icon success (bounce) */
@keyframes iconSuccess {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

/* Night rider (loading sweep) */
@keyframes nightRider {
  0%, 100% { left: 0px; transform: translateX(0px); }
  50% { left: 100%; transform: translateX(-100%); }
}

/* Hero announcement (CSS property animation) */
@keyframes heroX {
  0% { --x: 20px; }
  32.82% { --x: 206px; }
  50% { --x: 206px; }
  82.82% { --x: 20px; }
  100% { --x: 20px; }
}
```

### Vercel — Animacoes de Interface

```css
/* Fade in */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Scale in (nav dropdown) */
@keyframes scaleIn {
  0% { opacity: 0; transform: rotateX(-30deg) scale(0.9); }
  100% { opacity: 1; transform: rotateX(0deg) scale(1); }
}

/* Scale out */
@keyframes scaleOut {
  0% { opacity: 1; transform: rotateX(0deg) scale(1); }
  100% { opacity: 0; transform: rotateX(-10deg) scale(0.95); }
}

/* Enter from right */
@keyframes enterFromRight {
  0% { opacity: 0; transform: translate(200px); }
  100% { opacity: 1; transform: translate(0px); }
}

/* Slide down */
@keyframes slideDown {
  0% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

/* Pulse (mapa) */
@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.5); }
  100% { opacity: 0; transform: scale(2); }
}

/* CRT turn-on (Easter egg Vercel) */
@keyframes turnOn {
  0% { filter: brightness(30); opacity: 1; transform: scaleY(0.8); }
  3.5% { transform: scaleY(0.8) translateY(100%); }
  9% { filter: brightness(30); opacity: 0; transform: scale(1.3, 0.6) translateY(100%); }
  100% { filter: contrast() brightness(1.2) saturate(1.3); opacity: 1; }
}

/* Flicker */
@keyframes flicker {
  0% { opacity: 0.28; }
  15% { opacity: 0.91; }
  40% { opacity: 0.27; }
  50% { opacity: 0.96; }
  55% { opacity: 0.09; }
  100% { opacity: 0.24; }
}

/* Customer carousel scroll */
@keyframes scroll {
  0% { transform: translate(0px, 0px); }
  100% { transform: translate3d(calc(100% / var(--copies) * -1), 0, 0); }
}

/* Cursor reveal */
@keyframes reveal {
  100% { transform: translate(100%); }
}
```

### Apple — Animacoes de Navegacao

```css
/* Chevron slide in */
@keyframes chevronSlideIn {
  0% { opacity: 0; transform: translate(-4px); }
  100% { opacity: 1; transform: translate(0px); }
}

/* Flyout slide */
@keyframes flyoutSlideForward {
  0% { opacity: 0; transform: translate(8px); }
  100% { opacity: 1; transform: translate(0px); }
}

/* Ribbon drop */
@keyframes ribbonDrop {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(0px); }
}

/* Link entrance */
@keyframes linkIn {
  0% { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

### Linear — Animacoes de Grid Dots
Linear usa animacoes de grid-dot procedurais (centenas de keyframes individuais para cada ponto do grid), criando efeitos de "onda" ou "path" visual.

---

## 4. Transicoes (Hover Effects)

### Stripe
```css
/* Botao hover */
transition: background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
            color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
            border 0.3s cubic-bezier(0.25, 1, 0.5, 1);

/* Card hover */
transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);

/* Fade suave */
transition: opacity 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95);

/* Color change (lento) */
transition: color 1.2s cubic-bezier(0.65, 0, 0.35, 1);
```

### Apple
```css
/* Cor de background */
transition: background-color 0.24s cubic-bezier(0.4, 0, 0.6, 1);

/* Cor de texto */
transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);

/* Staggered fade (cascata de itens) */
transition: opacity 0.32s 0.08s, transform 0.32s 0.08s;
transition: opacity 0.32s 0.16s, transform 0.32s 0.16s;
transition: opacity 0.32s 0.20s, transform 0.32s 0.20s;

/* Scroll transform */
transition: opacity 0.4s cubic-bezier(0.4, 0, 0.6, 1) 0.05s,
            transform 0.5s cubic-bezier(0.4, 0, 0.6, 1);
```

### Raycast (nao extraidas diretamente — inferidas das animacoes)

### Linear
Easing curves custom encontrados:
```css
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
--ease-in-out-circ: cubic-bezier(0.785, 0.135, 0.15, 0.86);
--speed-quickTransition: 0.1s;
--speed-highlightFadeOut: 0.15s;
```

---

## 5. Easing Curves — Referencia Rapida

| Nome | Valor | Uso |
|------|-------|-----|
| Stripe Smooth | `cubic-bezier(0.25, 1, 0.5, 1)` | Botoes, hover |
| Stripe Card | `cubic-bezier(0.165, 0.84, 0.44, 1)` | Cards, transform |
| Apple Standard | `cubic-bezier(0.4, 0, 0.6, 1)` | Tudo |
| Apple Gentle | `cubic-bezier(0.25, 0.1, 0.3, 1)` | Transform, search |
| Linear Quart | `cubic-bezier(0.77, 0, 0.175, 1)` | In-out dramatico |
| Linear Circ | `cubic-bezier(0.785, 0.135, 0.15, 0.86)` | In-out circular |
| Vercel Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Geral |

---

## Quando Usar

| Efeito | Quando Usar |
|--------|-------------|
| **Mesh Gradients** (Stripe) | Secoes hero, backgrounds decorativos premium |
| **Subtle Glows** (Linear/Raycast) | Dark themes, destaque de elementos |
| **Shadow-as-Border** (Vercel) | Cards em light themes, borders sem "peso" visual |
| **Glass Shadows** (Raycast) | Botoes e cards que precisam parecer "fisicos" |
| **Staggered Transitions** (Apple) | Listas de itens que entram em cascata |
| **Scale+Rotate** (Vercel nav) | Dropdowns e menus contextuais |
| **Dot Patterns** (Raycast/Linear) | Backgrounds texturizados em dark themes |

---

# Onda 2 — Efeitos Visuais (17 sites)

---

## 1. Sistemas de Sombras — Onda 2

### Framer — Sombras com Glow Sutil

| Nível | Valor | Uso |
|-------|-------|-----|
| Card | `rgba(255, 255, 255, 0.1) 0px 0.5px 0px 0.5px, rgba(0, 0, 0, 0.25) 0px 10px 30px` | Cards com glow |
| Deep | `rgba(0, 0, 0, 0.25) 0px 25px 50px, rgba(0, 0, 0, 0.5) 0px 5px 25px` | Elevação máxima |
| Ring | `rgb(9, 9, 9) 0px 0px 0px 2px` | Border-as-shadow |
| Lateral | `rgba(0, 0, 0, 0.45) -15px 0px 10px` | Sombra lateral (stacked elements) |

### Notion — Sombras Ultra-Suaves (Multi-camada)

| Nível | Valor | Uso |
|-------|-------|-----|
| Default | `rgba(0, 0, 0, 0.04) 0px 4px 18px, rgba(0, 0, 0, 0.027) 0px 2px 7.85px, rgba(0, 0, 0, 0.02) 0px 0.8px 2.9px, rgba(0, 0, 0, 0.01) 0px 0.175px 1px` | Cards (16x) — 4 camadas! |
| Elevated | `rgba(0, 0, 0, 0.01) 0px 1px 3px, ... rgba(0, 0, 0, 0.05) 0px 23px 52px` | Modais — 5 camadas |
| Glow | `rgba(255, 255, 255, 0.2) 0px 0px 20px 5px` | Highlight |

### OpenAI — Sombras Minimalistas

| Nível | Valor | Uso |
|-------|-------|-----|
| Card | `rgba(0, 0, 0, 0.02) 0px 4px 6px, rgba(0, 0, 0, 0.05) 0px 0px 2px` | Cards (5x) |
| Hover | `rgba(0, 0, 0, 0.06) 0px 2px 5px, rgba(0, 0, 0, 0.01) 0px 4px 4px` | Hover state |

### Anthropic — Sombra Trifásica

| Nível | Valor | Uso |
|-------|-------|-----|
| Card | `rgba(0, 0, 0, 0.01) 0px 2px 2px, rgba(0, 0, 0, 0.02) 0px 4px 4px, rgba(0, 0, 0, 0.04) 0px 16px 24px` | Cards (3x) |

### Pitch — Sombras de Apresentação

| Nível | Valor | Uso |
|-------|-------|-----|
| Default | `rgba(0, 0, 0, 0.15) 0px 3px 10px` | Cards (24x) |
| Elevated | `rgba(0, 0, 0, 0.15) 0px 4px 30px` | Modais |
| Slide | `rgba(43, 42, 53, 0.25) 0px 6px 27px` | Preview de slides |

### Loom — Sombras com Profundidade Extrema

| Nível | Valor | Uso |
|-------|-------|-----|
| Card | `rgba(0, 0, 0, 0.04) 0px 2px 6px, rgba(0, 0, 0, 0.06) 0px 5px 18px, rgba(0, 0, 0, 0.1) 0px 24px 83px` | Cards (5x) |
| Photo | `rgba(255, 255, 255, 0.4) 0px 0px 0px 5px, rgba(0, 0, 0, 0.17) 0px 45.6px 86.9px` | Fotos com ring branco |

### GMX — Glass Morphism Avançado

| Nível | Valor | Uso |
|-------|-------|-----|
| Hero | `rgba(0, 0, 0, 0.8) 0px 60px 120px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset` | Cards hero (13x) |
| Light | `rgba(0, 0, 0, 0.04) 0px 6px 28px, rgba(255, 255, 255, 0.7) 0px 1px 0px inset` | Cards light (7x) |
| Deep | `rgba(0, 0, 0, 0.6) 0px 30px 60px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset, rgba(0, 0, 0, 0.5) 0px -1px 0px inset` | Overlays |

---

## 2. Gradientes — Onda 2

### Framer — Fade-to-Black
```css
linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 41%, rgb(0, 0, 0) 100%)
radial-gradient(100% 100% at 0% 0%, rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)
```

### Superhuman — Mesh Gradient (5 Radiais)
```css
radial-gradient(circle at 68% 50%, rgba(133, 125, 250, 0.6) 0px, rgba(0, 0, 0, 0) 50%),
radial-gradient(circle at 50% 98%, rgba(255, 51, 102, 0.6) 0px, rgba(0, 0, 0, 0) 50%),
radial-gradient(circle at 93% 50%, rgba(75, 105, 227, 0.5) 0px, rgba(0, 0, 0, 0) 50%),
radial-gradient(circle at 50% 75%, rgba(104, 222, 255, 0.5) 0px, rgba(0, 0, 0, 0) 50%)
```

### Anthropic — Warm Overlay
```css
linear-gradient(rgba(232, 230, 220, 0.8), rgba(232, 230, 220, 0.59) 40%, rgba(0, 0, 0, 0))
radial-gradient(rgba(232, 230, 220, 0.95) 0%, rgba(232, 230, 220, 0.95) 50%, rgba(232, 230, 220, 0) 100%)
```

### Pitch — Purple Gradient (10 variações!)
```css
linear-gradient(90deg, rgb(83, 24, 235), rgb(171, 110, 249))
linear-gradient(45deg, rgb(43, 42, 53), rgb(138, 76, 249) 120%)
linear-gradient(rgba(53, 27, 97, 0.04), rgba(53, 27, 97, 0))
```

### Circle — Pastel Gradients por Categoria
```css
/* Azul */ linear-gradient(142deg, rgb(64, 143, 237) 18.68%, rgb(62, 27, 201) 78.25%)
/* Salmon */ linear-gradient(0deg, rgb(255, 235, 225) -8.3%, rgb(255, 204, 187) 130.75%)
/* Teal */ linear-gradient(303deg, rgb(218, 239, 237) 14.4%, rgb(243, 255, 254) 91.66%)
/* Pink */ linear-gradient(101deg, rgb(255, 224, 226) 12.95%, rgb(255, 192, 198) 100%)
```

### GMX — Neon Gradients
```css
linear-gradient(90deg, rgb(0, 242, 254), rgb(255, 0, 127))
linear-gradient(135deg, rgb(0, 242, 254), rgb(255, 0, 127))
linear-gradient(rgb(5, 5, 5) 0%, rgb(8, 8, 16) 8%, rgb(248, 248, 248) 22%, rgb(248, 248, 248) 100%)
```

### FARM Rio — Tropical Rainbow
```css
linear-gradient(90deg, rgb(222, 227, 94), rgb(255, 148, 145), rgb(135, 94, 143), rgb(153, 201, 181))
```

### Laghetto — Nature Gradient
```css
linear-gradient(to right, rgb(180, 212, 223), rgb(10, 45, 35))
linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.15))
```

---

## 3. Animações — Onda 2

### OpenAI — CRT Screen Effects (Easter Egg)
```css
@keyframes crt-flicker {
  0%, 100% { opacity: var(--crt-overlay-before); }
  25% { opacity: var(--crt-overlay-before-low); }
}
@keyframes crt-typewriter {
  0% { clip-path: inset(0px 100% 0px 0px); }
  100% { clip-path: inset(0px); }
}
```

### Anthropic — Marquee + Fade-in
```css
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
@keyframes fadein {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

### Pitch — Sparks + Gradient Animation
```css
@keyframes element-slide-in {
  0% { opacity: 0; transform: translateY(1.875rem); }
  50% { opacity: 0.7; }
  100% { opacity: 1; transform: translateY(0px); }
}
@keyframes sparks {
  0% { opacity: 0; transform: translate(0px); }
  1% { opacity: 1; transform: translateY(-20%); }
  40% { opacity: 1; }
  100% { opacity: 0; }
}
```

### GMX — Glow + Scroll Indicators
```css
@keyframes logoGlow {
  0%, 100% { filter: drop-shadow(rgba(0, 242, 254, 0.12) 0px 0px 6px)
                      drop-shadow(rgba(0, 242, 254, 0.04) 0px 0px 20px); }
  50% { filter: drop-shadow(rgba(0, 242, 254, 0.25) 0px 0px 12px)
                drop-shadow(rgba(0, 242, 254, 0.08) 0px 0px 40px); }
}
@keyframes scrollLinePulse {
  0%, 100% { transform: scaleY(1); opacity: 0.6; }
  50% { transform: scaleY(0.5); opacity: 0.2; }
}
@keyframes heroIndicatorIn {
  0% { opacity: 0; transform: translateX(-50%) translateY(15px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0px); }
}
```

---

## 4. Transições — Onda 2

### OpenAI
```css
transition: translate 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Framer
```css
transition: color 0.3s cubic-bezier(0.44, 0, 0.56, 1);
```

### Anthropic
```css
transition: transform 0.2s, color 0.2s;
```

### Pitch
```css
transition: color 0.5s ease-out;
transition: background-position 0.5s ease-out;
transition: box-shadow 0.12s ease-in-out;
```

### GMX
```css
transition: opacity 0.6s;
transition: width 0.1s linear;
```

---

## 5. Contagem de Animações por Site (Onda 2)

| Site | Keyframes | Transições | Estilo |
|------|-----------|------------|--------|
| FARM Rio | 42 | — | Shimmer, carrousel |
| Notion | 39 | 21 | UI micro-interactions |
| OpenAI | 32 | 26 | CRT easter egg, UI |
| Circle | 32 | 14 | Scroll animations |
| Loom | 29 | 15 | UI, hover states |
| Pitch | 21 | 27 | Sparks, gradientes animados |
| Reino | 17 | — | Scroll animations |
| GMX | 13 | 43 | Glow, scroll, loader |
| Anthropic | 7 | 22 | Marquee, fadein |
| Framer | 4 | 7 | Typewriter, blink |
| Runway | 3 | — | Minimal |
| Nubank | 2 | — | Minimal |
| Laghetto | 2 | — | Minimal |
| Duck Design | 1 | — | Minimal |
| Pulso Hotel | 1 | — | Minimal |
| Superhuman | 0 | 7 | Transitions only |

### Insight: Sites com mais animações tendem a ser e-commerce (FARM Rio) ou plataformas de comunidade (Circle, Notion). Produtos AI (OpenAI, Anthropic, Runway) são mais contidos.

---

# Onda 3 — Efeitos Visuais (13 sites)

---

## 1. Gradientes — Onda 3

### Circle — Gradient Button Animado + Pastel System
```css
/* CTA button com gradient flow */
@keyframes gradient-button {
  0% { background-position: 0% center; }
  50% { background-position: 100% 0px; }
  100% { background-position: 0% center; }
}
.btn-gradient {
  background: linear-gradient(142deg, #408FED 18.68%, #3E1BC9 78.25%);
  background-size: 200% auto;
  animation: gradient-button 4s ease infinite;
}

/* Shine overlay (cards) */
@keyframes shine {
  0% { background-position: 0px 0px; }
  100% { background-position: 200% 200%; }
}
```

### Webflow — Dark Gradient + Blue Accent
```css
/* Hero background — quase-preto absoluto */
background: #080808;
/* Accent gradient nos CTAs */
background: linear-gradient(135deg, rgb(20, 110, 245), rgb(60, 140, 255));
```

### Simply Chocolate — Verde Floresta
```css
/* Background principal */
background: rgb(28, 28, 28);
/* Accent cards */
background: linear-gradient(to bottom, rgb(35, 73, 35), rgb(74, 137, 72));
```

### Spline — Multi-Accent System
```css
/* CSS Variables para trocas dinâmicas */
--color-blue: #0062FF;
--color-team: #915EFF;
--color-super: #00A376;
--color-bg: #000;
```

### Rive — Arco-íris oklch
```css
/* Gradient moderno oklch */
background: linear-gradient(90deg,
  oklch(0.65 0.3 0),
  oklch(0.65 0.3 60),
  oklch(0.65 0.3 120),
  oklch(0.65 0.3 180),
  oklch(0.65 0.3 240),
  oklch(0.65 0.3 300),
  oklch(0.65 0.3 360));
```

---

## 2. Animações — Onda 3

### Circle — Scroll + Pulse + Video Player
```css
@keyframes infinitescroll {
  0% { transform: translate(0px); }
  100% { transform: translate(-100%); }
}
@keyframes infinitescrollReverse {
  0% { transform: translate(-100%); }
  100% { transform: translate(0px); }
}
@keyframes gradientFlow {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}
@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes scroll-x {
  0% { transform: translate(0px); }
  100% { transform: translate(-100%); }
}
```

### Simply Chocolate — 59 Animações (maior da Onda 3)
Inclui: shimmer, parallax scroll, product reveal, carousel animations.

### Spline — 17 Animações
Inclui: 3D object transitions, hover morphs, loading states.

---

## 3. Sombras — Onda 3

### Simply Chocolate
```css
/* Card elevation */
box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12),
            0px 1px 4px rgba(0, 0, 0, 0.06);
/* Deep modal */
box-shadow: 0px 25px 50px rgba(0, 0, 0, 0.25);
```

### Figma
```css
/* Card with border-shadow */
box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.06),
            0px 2px 4px rgba(0, 0, 0, 0.04),
            0px 8px 16px rgba(0, 0, 0, 0.04);
/* Elevated */
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08),
            0px 16px 32px rgba(0, 0, 0, 0.08);
```

---

# Premium Effects Library — Receitas Prontas

> Efeitos que NÃO são capturados pelo extrator estático.
> Recriados manualmente a partir de análise visual dos sites.

---

## PE-01: Hero Glow (Circle, Linear, Raycast)

O efeito de "luz" atrás do título no hero. Uma bola de luz difusa que pode pulsar ou se mover sutilmente.

```css
.hero-glow {
  position: relative;
  overflow: hidden;
}

.hero-glow::before {
  content: '';
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 60vw;
  height: 60vw;
  max-width: 800px;
  max-height: 800px;
  background: radial-gradient(circle,
    rgba(64, 143, 237, 0.4) 0%,
    rgba(62, 27, 201, 0.2) 35%,
    transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  animation: glowPulse 6s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}
```

**Variações:**
- **Linear:** Usar cores `rgba(99, 102, 241, 0.3)` (indigo) — mais sutil
- **Raycast:** Usar `rgba(215, 201, 175, 0.15)` (warm glow) — dourado
- **Dual glow:** Adicionar segundo `::after` com cor diferente e offset

---

## PE-02: Gradient Mesh Background (Superhuman, Stripe)

Múltiplos radial-gradients sobrepostos que criam um efeito "aurora boreal".

```css
.mesh-bg {
  background:
    radial-gradient(circle at 20% 50%, rgba(133, 125, 250, 0.5) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 51, 102, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 60% 80%, rgba(75, 105, 227, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 30%, rgba(104, 222, 255, 0.3) 0%, transparent 50%),
    #0a0a0a;
  animation: meshMove 20s ease-in-out infinite;
}

@keyframes meshMove {
  0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 30% 20%; }
  25% { background-position: 20% 30%, 80% 40%, 60% 70%, 40% 50%; }
  50% { background-position: 40% 60%, 60% 80%, 30% 40%, 70% 60%; }
  75% { background-position: 10% 40%, 90% 20%, 70% 90%, 20% 30%; }
}
```

---

## PE-03: Infinite Logo Scroll (Circle, Notion, Vercel)

Logos de clientes scrollando infinitamente.

```css
.scroll-container {
  overflow: hidden;
  mask-image: linear-gradient(to right,
    transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right,
    transparent, black 10%, black 90%, transparent);
}

.scroll-track {
  display: flex;
  gap: 3rem;
  width: max-content;
  animation: scrollX 30s linear infinite;
}

@keyframes scrollX {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**Nota:** Duplicar o conteúdo dentro de `.scroll-track` para loop seamless.

---

## PE-04: Scroll-Triggered Fade In (Apple, Anthropic, Webflow)

Elementos que aparecem conforme o usuário scrolla. CSS-only com IntersectionObserver.

```html
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
</script>
```

```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children (Apple style) */
.scroll-reveal.visible .stagger-1 { transition-delay: 0.1s; }
.scroll-reveal.visible .stagger-2 { transition-delay: 0.2s; }
.scroll-reveal.visible .stagger-3 { transition-delay: 0.3s; }
.scroll-reveal.visible .stagger-4 { transition-delay: 0.4s; }
```

---

## PE-05: Glass Morphism Card (Raycast, GMX)

Cards com fundo translúcido e blur.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow:
    rgba(255, 255, 255, 0.05) 0px 1px 0px inset,
    rgba(0, 0, 0, 0.3) 0px 20px 40px;
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    rgba(255, 255, 255, 0.08) 0px 1px 0px inset,
    rgba(0, 0, 0, 0.4) 0px 25px 50px;
}
```

---

## PE-06: Animated Gradient Border (Linear, Pitch)

Borda com gradiente que rotaciona.

```css
.gradient-border {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: conic-gradient(from 0deg,
    #408FED, #3E1BC9, #9B4DFF, #408FED);
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: borderRotate 4s linear infinite;
}

@keyframes borderRotate {
  0% { background: conic-gradient(from 0deg, #408FED, #3E1BC9, #9B4DFF, #408FED); }
  100% { background: conic-gradient(from 360deg, #408FED, #3E1BC9, #9B4DFF, #408FED); }
}
```

---

## PE-07: Parallax Scroll (Apple, Nothing, Simply Chocolate)

Elementos se movem em velocidades diferentes no scroll.

```html
<script>
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    el.style.transform = `translateY(${scrollY * speed}px)`;
  });
});
</script>
```

```html
<div data-parallax="-0.3">Moves slower (background)</div>
<div data-parallax="0">Normal speed</div>
<div data-parallax="0.1">Moves slightly faster</div>
```

---

## PE-08: Text Reveal / Typewriter (Framer, Obys)

Texto que aparece letra por letra ou palavra por palavra.

```css
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
  animation: typing 3s steps(40) forwards,
             blink 0.7s step-end infinite;
  width: 0;
}

@keyframes typing {
  to { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

**Variação (word-by-word com JS):**
```html
<script>
function revealWords(selector, delay = 100) {
  const el = document.querySelector(selector);
  const words = el.textContent.split(' ');
  el.innerHTML = words.map((w, i) =>
    `<span style="opacity:0;transform:translateY(10px);display:inline-block;
     transition:all 0.4s ease ${i * delay}ms">${w}&nbsp;</span>`
  ).join('');
  requestAnimationFrame(() => {
    el.querySelectorAll('span').forEach(s => {
      s.style.opacity = '1';
      s.style.transform = 'translateY(0)';
    });
  });
}
</script>
```

---

## PE-09: Cursor Glow / Spotlight (Lusion, makemepulse)

Círculo de luz que segue o mouse.

```html
<script>
document.addEventListener('mousemove', (e) => {
  const spotlight = document.querySelector('.spotlight');
  spotlight.style.setProperty('--x', e.clientX + 'px');
  spotlight.style.setProperty('--y', e.clientY + 'px');
});
</script>
```

```css
.spotlight-container {
  position: relative;
  overflow: hidden;
}

.spotlight {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  background: radial-gradient(
    400px circle at var(--x, 50%) var(--y, 50%),
    rgba(64, 143, 237, 0.1),
    transparent 60%
  );
  z-index: 1;
}
```

---

## PE-10: Sticky Header Shrink (Circle, Vercel, Figma)

Header que encolhe e ganha blur no scroll.

```html
<script>
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});
</script>
```

```css
.header {
  height: 80px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(0px);
  transition: all 0.3s ease;
}

.header.scrolled {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
```

---

---

# Receitas Premium PE-11 a PE-25 — Efeitos JS (Análise Visual)

> Efeitos identificados via Claude Vision nos 12 vídeos de referência gravados.
> Estes efeitos NÃO são capturáveis por extratores DOM/CSS — requerem JavaScript.
> Extraído em 2026-04-01 | 539 frames analisados de 12 sites

### Mapa de Efeitos por Site

| Site | Efeitos Identificados | Destaques |
|------|----------------------|-----------|
| **Lusion** | 8 | 3D Physics, Curved Carousel, Topographic Shader, Custom Cursor |
| **Circle** | 12 | Aurora Glow, Sonar Rings, Tab Scroll-Spy, Counter Ticker |
| **Obys** | 9 | Preloader Counter, Hover Image Reveal, Horizontal Scroll Pinned |
| **Locomotive** | 14 | Text Scramble/Glitch, Marquee Gigante, Color Transition, Smooth Scroll |
| **Stripe** | 8 | Gradient Mesh WebGL, Globe Theme Switcher, Node Graph |
| **Raycast** | 6 | Diagonal Light Beams, Keyboard Scroll Highlight, Blur Nav |
| **Linear** | 6 | Live UI Mockup, 3D Isometric Icons, Diff Code Highlight |
| **makemepulse** | 7 | WebGL Particles, Cursor-Reactive Gradient, Clip Reveal |
| **Nothing** | 7 | Dot-Matrix Font, Parallax Multi-Layer, Animated Clock |
| **Gui Ávila ClickUp 8x** | 5 | Cosmic Particles, Rotating Badge, Nebula Background |
| **Gui Ávila Automações** | 5 | Same pattern — LP high-ticket BR template |
| **Superhuman** | 4 | AI Chat Typing, Gradient Sky, Tab Suite Navigation |
| **TOTAL** | **91 efeitos** | **15 novas receitas (PE-11 a PE-25)** |

### Por Dificuldade

| Nível | Receitas |
|-------|----------|
| **Fácil** (8) | PE-11 Cursor, PE-13 SVG Draw, PE-15 Hover Reveal, PE-20 Sonar, PE-21 Particles, PE-22 Rotating Badge, PE-23 AI Chat, PE-24 Inner Parallax, PE-25 Counter |
| **Médio** (6) | PE-12 Horizontal Scroll, PE-14 Preloader, PE-16 Text Scramble, PE-17 Color Transition, PE-18 Node Graph, PE-19 Keyboard Highlight |
| **Difícil** (0 neste batch) | 3D Physics (Lusion), Gradient Mesh WebGL (Stripe) — documentados nos relatórios detalhados |

---

## PE-11: Custom Cursor com Magnetic Effect (Lusion, Obys)

Cursor personalizado com lag suave (lerp) e atração magnética em botões.

```js
// Cursor suave com lerp
const cursor = document.querySelector('.cursor');
let cx = 0, cy = 0, x = 0, y = 0;
document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
(function tick() {
  x += (cx - x) * 0.12;
  y += (cy - y) * 0.12;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(tick);
})();
// Efeito magnético em botões
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});
```

```css
.cursor {
  position: fixed; top: 0; left: 0;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: rgba(100, 140, 255, 0.8);
  box-shadow: 0 0 20px rgba(100, 140, 255, 0.5);
  pointer-events: none; z-index: 9999;
  mix-blend-mode: difference;
  transition: width 0.3s, height 0.3s;
}
body { cursor: none; }
```

**Fontes:** Lusion, Obys | **Dificuldade:** Fácil

---

## PE-12: Scroll Horizontal Pinned (Obys, Locomotive)

Seção pinned que converte scroll vertical em movimento horizontal de cards.

```js
// GSAP ScrollTrigger — horizontal scroll
const track = document.querySelector('.cards-track');
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.cards-section',
    pin: true,
    scrub: 1,
    end: () => '+=' + track.scrollWidth
  }
});
```

```css
.cards-section { overflow: hidden; }
.cards-track {
  display: flex; gap: 2rem;
  width: max-content;
  will-change: transform;
}
.card { min-width: 400px; flex-shrink: 0; }
```

**Fontes:** Obys, Locomotive | **Dificuldade:** Médio | **Deps:** GSAP + ScrollTrigger

---

## PE-13: SVG Path Drawing on Scroll (Lusion)

Linhas curvas que se "desenham" conforme o scroll progride.

```js
const path = document.querySelector('.draw-path');
const length = path.getTotalLength();
path.style.strokeDasharray = length;
path.style.strokeDashoffset = length;

gsap.to(path, {
  strokeDashoffset: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: '.draw-section',
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: true
  }
});
```

```css
.draw-path {
  fill: none;
  stroke: #00d4ff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
svg { overflow: visible; }
```

**Fontes:** Lusion | **Dificuldade:** Fácil | **Deps:** GSAP + ScrollTrigger

---

## PE-14: Preloader com Counter + Page Reveal (Obys, Locomotive)

Tela de loading com contador animado e transição wipe para revelar o site.

```js
// Contador 0→100
const counter = { val: 0 };
gsap.to(counter, {
  val: 100, duration: 2.4, ease: 'power2.out',
  onUpdate: () => {
    document.querySelector('.loader-num').textContent = Math.round(counter.val);
  },
  onComplete: () => {
    // Wipe reveal
    gsap.to('.preloader', {
      yPercent: -100, duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => document.querySelector('.preloader').remove()
    });
  }
});
```

```css
.preloader {
  position: fixed; inset: 0;
  background: #000; z-index: 9999;
  display: grid; place-items: center;
}
.loader-num {
  font-size: clamp(4rem, 10vw, 8rem);
  font-weight: 700; color: #fff;
}
```

**Fontes:** Obys, Locomotive | **Dificuldade:** Médio | **Deps:** GSAP

---

## PE-15: Hover Image Reveal em Links (Obys)

Thumbnail aparece e segue o cursor ao passar sobre itens de lista.

```js
const img = document.querySelector('.hover-img');
document.querySelectorAll('.project-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    img.src = item.dataset.image;
    gsap.to(img, { opacity: 1, scale: 1, duration: 0.4 });
  });
  item.addEventListener('mousemove', e => {
    img.style.left = e.clientX + 20 + 'px';
    img.style.top = e.clientY - 100 + 'px';
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(img, { opacity: 0, scale: 0.85, duration: 0.3 });
  });
});
```

```css
.hover-img {
  position: fixed; pointer-events: none;
  width: 300px; border-radius: 8px;
  opacity: 0; transform: scale(0.85);
  z-index: 100; object-fit: cover;
  transition: none; /* GSAP controla */
}
```

**Fontes:** Obys | **Dificuldade:** Fácil

---

## PE-16: Text Scramble / Glitch Typography (Locomotive)

Letras mutam aleatoriamente antes de revelar a palavra final.

```js
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
  }
  setText(newText) {
    const length = Math.max(this.el.textContent.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = this.el.textContent[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '', complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) { complete++; output += to; }
      else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="glitch-char">${char}</span>`;
      } else { output += from; }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) this.resolve();
    else { this.frameRequest = requestAnimationFrame(() => this.update()); this.frame++; }
  }
}
```

**Fontes:** Locomotive | **Dificuldade:** Médio

---

## PE-17: Section Background Color Transition (Circle, Locomotive, Stripe)

Fundo muda gradualmente de cor conforme o scroll, sem corte abrupto.

```js
// Dark → Light → Dark transição proporcional ao scroll
gsap.to('body', {
  backgroundColor: '#ffffff',
  color: '#111111',
  scrollTrigger: {
    trigger: '.light-section',
    start: 'top 60%',
    end: 'top 20%',
    scrub: true
  }
});
// Reverter ao chegar na seção escura
gsap.to('body', {
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  scrollTrigger: {
    trigger: '.dark-section-2',
    start: 'top 60%',
    end: 'top 20%',
    scrub: true
  }
});
```

**Fontes:** Circle, Locomotive, Stripe | **Dificuldade:** Médio | **Deps:** GSAP + ScrollTrigger

---

## PE-18: Animated Architecture Diagram / Node Graph (Stripe)

Diagrama de nós conectados com fluxo animado nas arestas.

```js
const canvas = document.querySelector('.graph-canvas');
const ctx = canvas.getContext('2d');
let dashOffset = 0;

function drawEdge(from, to) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.setLineDash([8, 4]);
  ctx.lineDashOffset = -dashOffset;
  ctx.strokeStyle = 'rgba(100, 140, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawNode(node) {
  ctx.fillStyle = '#1a1a2e';
  ctx.strokeStyle = 'rgba(100, 140, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(node.x - 60, node.y - 20, 120, 40, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(node.label, node.x, node.y + 4);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  edges.forEach(e => drawEdge(e.from, e.to));
  nodes.forEach(n => drawNode(n));
  dashOffset += 0.5; // Fluxo animado
  requestAnimationFrame(animate);
}
```

**Fontes:** Stripe | **Dificuldade:** Médio

---

## PE-19: Interactive Keyboard / Product Highlight (Raycast)

Produto full-screen com elementos que acendem conforme o scroll.

```js
const keys = gsap.utils.toArray('.key');
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.keyboard-section',
    pin: true,
    scrub: true,
    start: 'top top',
    end: '+=200%'
  }
});
// Acender teclas em sequência
tl.to(keys, {
  backgroundColor: '#ff4444',
  boxShadow: '0 0 12px rgba(255,68,68,0.5)',
  stagger: 0.02,
  duration: 0.5
});
// Texto explicativo aparece sincronizado
tl.from('.keyboard-text', { opacity: 0, y: 30 }, '<0.3');
```

**Fontes:** Raycast | **Dificuldade:** Médio | **Deps:** GSAP + ScrollTrigger

---

## PE-20: Concentric Ring / Sonar Pulse (Circle)

Anéis concêntricos expandindo do centro como pulso de sonar.

```js
gsap.fromTo('.ring', {
  scale: 0.6, opacity: 0.6
}, {
  scale: 1.4, opacity: 0,
  duration: 3,
  stagger: 0.4,
  repeat: -1,
  ease: 'power1.out'
});
```

```css
.rings-container { position: relative; }
.ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 300px; height: 300px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  pointer-events: none;
}
```

**Fontes:** Circle | **Dificuldade:** Fácil | **Deps:** GSAP

---

## PE-21: Cosmic Particle Field Background (Gui Ávila)

Fundo com partículas tipo nebulosa/estrelas para LPs high-ticket.

```js
const canvas = document.querySelector('.particles-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = Array.from({ length: 120 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2 + 0.5,
  vx: (Math.random() - 0.5) * 0.3,
  vy: (Math.random() - 0.5) * 0.3,
  alpha: Math.random() * 0.6 + 0.2
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();
```

```css
.particles-bg {
  position: absolute; inset: 0;
  z-index: 0; pointer-events: none;
}
```

**Fontes:** Gui Ávila (ClickUp 8x, Automações) | **Dificuldade:** Fácil

---

## PE-22: Rotating Circular Text Badge (Gui Ávila, Obys)

Texto circular que gira infinitamente ao redor de um ícone central.

```html
<div class="rotating-badge">
  <svg viewBox="0 0 100 100" width="120" height="120">
    <defs>
      <path id="circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"/>
    </defs>
    <text font-size="10" fill="#fff">
      <textPath href="#circle">OPTIMIZE SEU TEMPO • ESCALE •</textPath>
    </text>
  </svg>
  <span class="badge-icon">⚡</span>
</div>
```

```css
.rotating-badge {
  position: relative; display: inline-block;
}
.rotating-badge svg {
  animation: spin 8s linear infinite;
}
.badge-icon {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

**Fontes:** Gui Ávila, Obys | **Dificuldade:** Fácil

---

## PE-23: AI Chat Typing Simulation (Superhuman)

Simulação de conversa IA com efeito de digitação progressiva.

```js
async function typeMessage(el, text, speed = 30) {
  el.textContent = '';
  el.classList.add('typing');
  for (const char of text) {
    el.textContent += char;
    await new Promise(r => setTimeout(r, speed + Math.random() * 20));
  }
  el.classList.remove('typing');
}

// Sequência de mensagens
const messages = [
  { role: 'user', text: 'Summarize my unread emails' },
  { role: 'ai', text: 'You have 3 important emails...' }
];
async function playConversation() {
  for (const msg of messages) {
    const bubble = document.createElement('div');
    bubble.className = `message ${msg.role}`;
    document.querySelector('.chat').appendChild(bubble);
    await typeMessage(bubble, msg.text);
    await new Promise(r => setTimeout(r, 800));
  }
}
```

```css
.typing::after {
  content: '▊';
  animation: blink 0.5s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }
```

**Fontes:** Superhuman | **Dificuldade:** Fácil

---

## PE-24: Inner Parallax em Card (Obys, Locomotive)

Imagem interna de um card se move mais devagar que o card, criando profundidade.

```js
gsap.utils.toArray('.parallax-card').forEach(card => {
  const img = card.querySelector('img');
  gsap.to(img, {
    yPercent: -20,
    ease: 'none',
    scrollTrigger: {
      trigger: card,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
});
```

```css
.parallax-card {
  overflow: hidden;
  border-radius: 12px;
}
.parallax-card img {
  width: 100%; height: 120%; /* Maior que o card */
  object-fit: cover;
  will-change: transform;
}
```

**Fontes:** Obys, Locomotive | **Dificuldade:** Fácil | **Deps:** GSAP + ScrollTrigger

---

## PE-25: Scroll-Triggered Number Counter (Circle, Locomotive)

Números animam de 0 ao valor final ao entrar no viewport.

```js
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    gsap.to({ val: 0 }, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        el.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString() + suffix;
      }
    });
    observer.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => observer.observe(el));
```

```html
<span class="counter" data-target="7890" data-prefix="+$">0</span>
<span class="counter" data-target="489" data-suffix=" avaliações">0</span>
```

**Fontes:** Circle, Locomotive | **Dificuldade:** Fácil | **Deps:** GSAP (ou requestAnimationFrame puro)

---

---

# Custom: Gui Ávila — Efeitos Premium (3 sites, 615 animações)

> LPs brasileiras high-ticket com GSAP pesado. Referência #1 para LPs de curso/mentoria.

---

## Animações Únicas (não-encontradas em nenhum outro site da library)

### `pulseGlow` — Halo branco pulsante para CTAs ⭐
```css
@keyframes pulseGlow {
  0%  { box-shadow: rgba(255, 255, 255, 0) 0px 0px; }
  25% { box-shadow: rgba(255, 255, 255, 0.25) 0px 0px 2.5px 1px; }
  50% { box-shadow: rgba(255, 255, 255, 0.5) 0px 0px 5px 2px; }
  85% { box-shadow: rgba(255, 255, 255, 0) 0px 0px 5px 5px; }
  100%{ box-shadow: rgba(255, 255, 255, 0) 0px 0px; }
}
```

### `bounce` — Bounce realista com sombra dinâmica ⭐
```css
@keyframes bounce {
  15% { box-shadow: transparent 0px 0px 0px 0px; transform: translateY(0px); }
  35% { box-shadow: rgba(0, 0, 0, 0.25) 0px 8px 5px -5px; transform: translateY(-35%); }
  45% { box-shadow: transparent 0px 0px 0px 0px; transform: translateY(0px); }
  55% { box-shadow: rgba(0, 0, 0, 0.25) 0px 5px 4px -4px; transform: translateY(-20%); }
  70% { box-shadow: transparent 0px 0px 0px 0px; transform: translateY(0px); }
  80% { box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 3px -3px; transform: translateY(-10%); }
  90% { box-shadow: transparent 0px 0px 0px 0px; transform: translateY(0px); }
  95% { box-shadow: rgba(0, 0, 0, 0.25) 0px 2px 3px -3px; transform: translateY(-2%); }
  100%{ box-shadow: transparent 0px 0px 0px 0px; transform: translateY(0px); }
}
```

### `elevate` — Hover flutuante com sombra
```css
@keyframes elevate {
  0%  { box-shadow: transparent 0px 0px 0px 0px; transform: translateY(0px); }
  100%{ box-shadow: rgba(0, 0, 0, 0.25) 0px 8px 5px -5px; transform: translateY(-10px); }
}
```

### `rocking` — Balanço sutil para ícones
```css
@keyframes rocking {
  0%, 25% { transform: rotate(0deg); }
  50% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
  100%{ transform: rotate(0deg); }
}
```

### `jackInTheBox` — Entrada dramática com rotação
```css
@keyframes jackInTheBox {
  0%  { opacity: 0; transform: scale(0.1) rotate(30deg); transform-origin: center bottom; }
  50% { transform: rotate(-10deg); }
  70% { transform: rotate(3deg); }
  100%{ opacity: 1; transform: scale(1); }
}
```

### `hinge` — Saída: queda com pivô no eixo Z
```css
@keyframes hinge {
  0%       { animation-timing-function: ease-in-out; }
  20%, 60% { transform: rotate3d(0, 0, 1, 80deg); animation-timing-function: ease-in-out; }
  40%, 80% { transform: rotate3d(0, 0, 1, 60deg); animation-timing-function: ease-in-out; opacity: 1; }
  100%     { transform: translate3d(0px, 700px, 0px); opacity: 0; }
}
```

---

## Gradientes — ClickUp 8x (os mais únicos)

```css
/* Radial pink neon (destaque central) */
radial-gradient(50% 50%, rgb(254, 66, 167) 0%, rgba(0, 0, 0, 0) 100%)

/* Radial azul no canto (acento) */
radial-gradient(10% 10% at 17.6% 0%, rgb(3, 150, 255) 0%, rgba(255, 255, 255, 0) 100%)

/* Label pink neon com fade */
linear-gradient(rgb(254, 66, 167) 0%, rgba(1, 1, 1, 0) 100%)

/* Label amarelo dourado com fade */
linear-gradient(rgb(255, 182, 2) 0%, rgba(1, 1, 1, 0) 100%)

/* Radial verde neon */
radial-gradient(50% 50%, rgb(92, 255, 103) 0%, rgba(0, 0, 0, 0) 100%)

/* Hero escuro com fade */
linear-gradient(rgb(44, 41, 56) 0%, rgb(44, 41, 56) 85.3886%, rgba(1, 1, 1, 0) 100%)
```

## Gradientes — Automações PRO (os mais únicos)

```css
/* Diagonal lilás para branco (hero) */
linear-gradient(291deg, rgb(186, 195, 255) 0%, rgb(255, 255, 255) 100%)

/* Barra azul elétrico horizontal */
linear-gradient(90deg, rgba(0, 89, 255, 0) 0%, rgb(0, 76, 255) 100%)

/* Shimmer line (brilho bilateral) */
linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 50%, rgba(255, 255, 255, 0) 100%)

/* Glow azul elétrico radial */
radial-gradient(50% 50%, rgb(0, 115, 255) 0%, rgba(0, 44, 201, 0.4) 100%)

/* Glass button (overlay branco sólido) */
linear-gradient(rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.24) 100%)
```

---

## Sombras — Automações PRO (sistema completo)

```css
/* CTA principal — blue glow trifásico ⭐⭐ (17 ocorrências) */
box-shadow:
  rgba(17, 0, 255, 0.5) 0px 8px 40px 0px,
  rgba(255, 255, 255, 0) 0px 0px 10px 1px inset,
  rgba(0, 85, 255, 0.12) 0px 0px 0px 1px;

/* CTA hover/focus — intensificado */
box-shadow:
  rgba(0, 85, 255, 0.7) 0px 8px 40px 0px,
  rgba(0, 85, 255, 0.2) 0px 0px 0px 5px;

/* Blue glow simples */
box-shadow: rgba(17, 0, 255, 0.5) 0px 8px 40px 0px;

/* Card sutil */
box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 10px 0px;
```

---

## Quando Usar — Gui Ávila Patterns

| Efeito | Quando |
|--------|--------|
| `pulseGlow` | CTAs em dark mode — chama atenção sem ser agressivo |
| `bounce` com shadow | Elementos que precisam de "urgência" sem parecer spam |
| Blue glow trifásico | Botões de compra em LP dark premium |
| Radial pink/verde neon | Destaque visual para badge ou feature card |
| Shimmer line | Separadores premium entre seções dark |
| Diagonal lilás→branco | Hero sections que misturam dark e light |

---

## Sites para Captura Visual (User Reference Collection)

> Visitar estes sites, gravar/screenshotar os efeitos mais impressionantes, e salvar aqui.

### Tier S — Os mais impressionantes visualmente
| Site | Efeito principal | O que capturar |
|------|-----------------|----------------|
| **circle.so** | Hero glow animado + gradient buttons | Screenrecord do hero, hover nos CTAs |
| **linear.app** | Grid dot wave + dark glow | Screenrecord do hero, scroll animation |
| **lusion.co** | WebGL 3D objects + cursor interaction | Screenrecord full page |
| **locomotive.ca** | Smooth scroll + text reveals | Screenrecord scroll completo |
| **obys.agency** | Typography animations + cursor effects | Screenrecord hover + scroll |
| **makemepulse.com** | Cursor spotlight + 3D transitions | Screenrecord interactions |

### Tier A — Efeitos específicos excelentes
| Site | Efeito | O que capturar |
|------|--------|----------------|
| **superhuman.com** | Mesh gradient background | Screenshot do hero |
| **stripe.com** | Aurora gradient + mesh | Screenshot hero + scroll |
| **raycast.com** | Glass morphism buttons | Screenshot CTAs + hover |
| **gmxdigital.com** | Neon glow + glass cards | Screenrecord full page |
| **dogstudio.co** | Page transitions | Screenrecord navegação entre páginas |
| **nothing.tech** | Dot matrix reveal | Screenrecord product section |

### Tier B — Detalhes premium
| Site | Efeito |
|------|--------|
| **figma.com** | Smooth scroll sections + product demos |
| **webflow.com** | Interactive demos + scroll animations |
| **pitch.com** | Sparks animation + gradient CTAs |
| **vercel.com** | Conic gradient + nav dropdown |
| **simply-chocolate.dk** | Product parallax + color transitions |
| **rive.app** | Interactive 3D demos inline |

---

## Como Salvar Capturas

Salvar em `design-system/patterns/effects/captures/{site-name}/`:
```
captures/{site-name}/
├── hero-effect.mp4          # Screenrecord do efeito principal
├── hero-effect.gif          # GIF se preferir
├── hover-cta.mp4            # Hover effects nos CTAs
├── scroll-animation.mp4     # Scroll completo
├── screenshots/             # Screenshots estáticos
│   ├── hero-desktop.png
│   ├── effect-detail-1.png
│   └── effect-detail-2.png
└── notes.md                 # Notas sobre o que você achou mais interessante
```
