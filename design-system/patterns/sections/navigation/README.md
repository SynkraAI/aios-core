---
name: "Navigation / Header Patterns"
category: "sections/navigation"
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

# Navigation / Header — Padrões Extraídos

Análise dos componentes de navegação (`type: "navigation"` e `type: "header"`) extraídos de 13 sites premium. Os valores abaixo são reais — coletados diretamente do DOM de cada site.

---

## Resumo dos Padrões Encontrados

### Alturas de Header (medidas reais do DOM)

| Site | Altura do `<header>` | Largura | Posição |
|------|---------------------|---------|---------|
| Stripe | 76px | 1440px | topo (y=0) |
| Linear | 73px | 1440px | topo (y=0) |
| Vercel | 64px | 1440px | topo (y=0) |
| Raycast | — | — | sem `<header>` extraído |
| Notion | 64px | 1440px | topo (y=0) |
| Superhuman | 67px (transparente) + 67px (branco) | 1440px | topo |
| Pitch | — | — | sem `<header>` extraído |
| Loom | 150px | 1440px | topo (y=0) |
| Circle | 68px | 1440px | `sticky` detectado na classe |
| Framer | 64px | 1440px | topo (y=0) |
| Nubank | 80px | 1440px | topo (y=0) |
| Farm Rio | 64px | 1440px | topo (y=0) |
| Laghetto | 64px | 1440px | topo (y=0) |

**Padrão dominante:** 64–76px de altura. O valor 64px é o mais recorrente (Vercel, Notion, Framer, Farm Rio, Laghetto, Circle).

---

## Padrão A — Tech Dark (fundo transparente / dark)

**Exemplos:** Linear, Raycast, Framer, Pitch

### Características

- Fundo transparente no scroll inicial: `background: rgba(0, 0, 0, 0)`
- Cor do texto claro: `rgb(247, 248, 248)` (Linear), `rgb(255, 255, 255)` (Raycast, Pitch)
- Framer usa fundo semitransparente: `background: rgba(0, 0, 0, 0.7)` — efeito frosted glass
- Itens do menu com `fontSize: "13px"` e `fontWeight: "400"` (Linear)
- Espaçamento interno do item: `padding: "0px 12px 0px 12px"` (Linear), altura do item ~32px

### Itens de menu (nav links)

```css
/* Linear — estilo dos triggers de nav */
font-size: 13px;
font-weight: 400;
color: rgb(138, 143, 152);
padding: 0px 12px;
border-radius: 4px;
height: 32px;
```

### CTA no header (Linear)

Sem CTA primário destacado — apenas links de login/signup como texto.

### Referência de medidas

```css
/* Linear Header */
height: 73px;
background: transparent;
color: rgb(247, 248, 248);

/* Framer Nav */
height: 64px;
background: rgba(0, 0, 0, 0.7); /* blur-glass */
padding: 0px 20px;
font-size: 12px;
```

---

## Padrão B — Tech Light (fundo branco/neutro, marca clara)

**Exemplos:** Stripe, Vercel, Notion

### Características

- Fundo transparente ou branco puro: `background: rgba(0, 0, 0, 0)` ou `rgb(255, 255, 255)`
- Cor do texto: `rgb(6, 27, 49)` (Stripe dark blue), `rgb(77, 77, 77)` (Vercel cinza), `rgba(0, 0, 0, 0.9)` (Notion)
- Font-size dos triggers: **14px** (Stripe, Vercel) ou **16px** (Notion)
- Border-radius dos triggers: `4px` (Stripe), `9999px` (Vercel — pill shape), `4px` (Notion)

### Itens de menu — Stripe

```css
/* Stripe — navigation trigger */
font-size: 14px;
font-weight: 400;
color: rgb(6, 27, 49);
padding: 12px 0px;
border-radius: 4px;
background: transparent;
height: 40px;
```

### Itens de menu — Vercel

```css
/* Vercel — navigation trigger (pill) */
font-size: 14px;
font-weight: 400;
color: rgb(77, 77, 77);
padding: 8px 12px;
border-radius: 9999px;
background: transparent;
height: 30px;
```

### Itens de menu — Notion

```css
/* Notion — navigation trigger */
font-size: 16px;
font-weight: 400;
color: rgb(246, 245, 244);
padding: 5px 10px;
border-radius: 4px;
background: transparent;
height: 30px;
```

### CTA no header

**Stripe** — CTA primário como `<a>` com background roxo:

```css
background: rgb(83, 58, 253);
color: rgb(255, 255, 255);
font-size: 16px;
font-weight: 400;
padding: 15.5px 24px 16.5px 24px;
border-radius: 4px;
```

**Vercel** — dois botões: secundário (outline) + primário (preto):

```css
/* Secundário */
background: rgb(255, 255, 255);
color: rgb(23, 23, 23);
font-size: 14px;
font-weight: 500;
padding: 0px 6px;
border-radius: 6px;
box-shadow: rgb(235, 235, 235) 0px 0px 0px 1px;
height: 32px;

/* Primário */
background: rgb(23, 23, 23);
color: rgb(255, 255, 255);
font-size: 14px;
font-weight: 500;
padding: 0px 6px;
border-radius: 6px;
height: 32px;
```

**Notion** — CTA primário azul:

```css
background: rgb(69, 93, 211);
color: rgb(255, 255, 255);
font-size: 16px;
font-weight: 500;
padding: 4px 14px;
border-radius: 8px;
height: 36px;
```

---

## Padrão C — SaaS Premium com Glassmorphism / Scroll-aware

**Exemplos:** Superhuman, Circle, Farm Rio

### Características

- Header inicia transparente e muda para sólido ao rolar
- Superhuman: dois estados detectados — `rgba(0,0,0,0)` (hero) e `rgb(255,255,255)` (após scroll)
- Farm Rio: classe `transition-[height] duration-300 ease-in-out` indica animação de altura
- Circle: `sticky` + `transition-all` — header gruda no topo com transição
- Font-size mais compacto: **14px** (Farm Rio, Laghetto)

### Superhuman — estados do header

```css
/* Estado transparente (sobre o hero) */
background: color(srgb 1 1 1 / 0); /* transparente */
color: rgb(255, 255, 255);
font-size: 16px;
font-weight: 460; /* peso incomum — fonte personalizada */
height: 67px;

/* Estado sólido (após scroll) */
background: rgb(255, 255, 255);
color: rgb(41, 40, 39);
```

### Farm Rio — nav links

```css
/* Font-size menor, estilo minimalista */
font-size: 14px;
font-weight: 400;
color: rgb(51, 51, 51);
padding: 0px 64px; /* padding lateral do container nav */
height: 64px;
```

---

## Padrão D — E-commerce / Hotelaria (logo + nav compacto)

**Exemplos:** Laghetto, Farm Rio

### Características

- Header compacto: **64px** de altura
- Logo visível no scroll (sem versão transparente detetada)
- Font-size: **14px** para itens
- Sem CTA proeminente no header — links de texto simples
- Laghetto: badge de carrinho com `border-radius: 9999px; font-size: 9px`

### Laghetto — nav container

```css
height: 64px;
padding: 0px 64px;
font-size: 14px;
font-weight: 400;
color: rgb(51, 51, 51);
background: transparent;
display: flex;
```

---

## Posicionamento do Logo

Com base nas classes e rects extraídos:

| Site | Logo no DOM | Posição aproximada |
|------|-------------|-------------------|
| Stripe | `navigation-menu-home-link` (a) | x=105, y=26 — esquerda |
| Linear | Header_header — logo implícito | esquerda |
| Vercel | `img.geist-hide-on-dark` | x=24, y=23 (91×18px) — esquerda |
| Laghetto | `img` na nav | x=112, y=20 (122×25px) — esquerda |

**Padrão universal:** logo sempre à esquerda. Nenhum site da amostra centra o logo no desktop.

---

## Espaçamento entre Itens de Menu

| Site | Espaçamento | Implementação |
|------|-------------|---------------|
| Linear | `gap` via flexbox | itens com padding `0px 12px` |
| Vercel | `8px 12px` por item | pill com padding interno |
| Stripe | sem gap explícito | padding `12px 0px` nos triggers |
| Circle | `gap-5 xl:gap-12` (Tailwind) | 20px a 48px |

---

## Dropdowns de Navegação

Sites com megamenu detectado:

- **Stripe:** `borderRadius: "6px"`, largura ~557px
- **Notion:** `borderRadius: "16px"`, `boxShadow: rgba(0,0,0,0.04) 0px 4px 18px 0px`, padding `16px`, background `rgb(255, 255, 255)`
- **Vercel:** `borderRadius: "9999px"` nos triggers (pill navigation)

### Notion — dropdown container

```css
background: rgb(255, 255, 255);
border-radius: 16px;
padding: 16px;
box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 18px 0px,
            rgba(0, 0, 0, 0.027) 0px 2.025px 7.847px 0px,
            rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px 0px,
            rgba(0, 0, 0, 0.01) 0px 0.175px 1.041px 0px;
```

---

## Mobile Menu

Padrões detectados nas classes extraídas:

- **Linear:** `Header_mobileMenuTrigger__ignIg` — botão hambúrguer detectado (display: flex)
- **Pitch:** `style_hamburgerButton__j9B8J` — botão detectado (display: none no desktop)
- **Laghetto:** `drawer-side` com `aside` — menu lateral (drawer pattern via DaisyUI)
- **Vercel:** `hide-tablet` nos itens — itens desaparecem no tablet

**Padrão predominante:** hambúrguer que abre um drawer/overlay lateral. Nenhum site usa menu accordion mobile nativo detectável no DOM do desktop.

---

## Transparência / Blur (Glassmorphism)

Sites que usam fundo semitransparente:

| Site | Background detectado |
|------|---------------------|
| Framer | `rgba(0, 0, 0, 0.7)` — preto semitransparente |
| Superhuman | `color(srgb 1 1 1 / 0)` → `rgb(255,255,255)` (scroll-aware) |
| Farm Rio | `rgba(0, 0, 0, 0)` (transparente sobre hero vídeo) |

> **Nota:** `backdrop-filter: blur()` não é capturado pelo extrator de CSS. Os valores acima refletem apenas a propriedade `background`. Para glassmorphism real, combine `background: rgba(255,255,255,0.8)` com `backdrop-filter: blur(12px)`.

---

## Quando Usar Cada Padrão

### Padrão A — Tech Dark
Use quando: produto B2B SaaS, CLI tools, developer tools, público técnico. Fundo escuro cria sensação de premium/focus.

### Padrão B — Tech Light
Use quando: produto SaaS mainstream, fintech, plataformas de produtividade. Branco transmite clareza e confiabilidade.

### Padrão C — Scroll-aware / Glass
Use quando: o hero ocupa viewport inteira e há imagem/vídeo no fundo. Garante legibilidade sobre qualquer conteúdo.

### Padrão D — E-commerce / Hotelaria
Use quando: loja ou serviço de hospitalidade. Header compacto para dar protagonismo ao produto/imagem.

---

## CSS Reference — Copie e Cole

### Header base universal (64px, Light)

```css
header {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  background: transparent;
  /* adicione border-bottom se necessário */
}
```

### Nav link — estilo Vercel (pill)

```css
.nav-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: rgb(77, 77, 77);
  padding: 8px 12px;
  border-radius: 9999px;
  background: transparent;
  transition: background 0.15s;
}
.nav-link:hover {
  background: rgba(0, 0, 0, 0.05);
}
```

### Nav link — estilo Stripe (texto puro)

```css
.nav-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: rgb(6, 27, 49);
  padding: 12px 0px;
  border-radius: 4px;
  background: transparent;
}
```

### CTA primário no header — estilo Vercel

```css
.nav-cta-primary {
  display: flex;
  align-items: center;
  background: rgb(23, 23, 23);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  padding: 0px 12px;
  border-radius: 6px;
  height: 32px;
}
```

### CTA primário no header — estilo Notion

```css
.nav-cta-primary {
  display: flex;
  align-items: center;
  background: rgb(69, 93, 211);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 500;
  padding: 4px 14px;
  border-radius: 8px;
  height: 36px;
}
```

### CTA primário no header — estilo Stripe

```css
.nav-cta-primary {
  display: flex;
  align-items: center;
  background: rgb(83, 58, 253);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 400;
  padding: 15.5px 24px 16.5px 24px;
  border-radius: 4px;
}
```

### Header scroll-aware (transparente → sólido)

```css
header {
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

header[data-scrolled="false"] {
  background: transparent;
  color: white;
}

header[data-scrolled="true"] {
  background: rgb(255, 255, 255);
  color: rgb(41, 40, 39);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}
```

### Glassmorphism (Framer-style)

```css
nav {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 64px;
  padding: 0px 20px;
}
```

---

## Observações e Limitações

- **Nubank:** não possui componente `type: "navigation"` no arquivo extraído — apenas `<header>` com 80px. O site usa React/Chakra UI e a nav pode estar embutida no header sem tag `<nav>` explícita.
- **Pitch:** não possui `type: "navigation"` ou `type: "header"` no arquivo — o extrator capturou apenas footer e conteúdo principal. O Pitch usa uma nav simples embutida no hero.
- **Raycast:** não possui `<header>` explícito — a nav está embutida na página sem wrapper separado. O menu bar foi detectado como `div.Features_menuBar__Tkc36`.
- **Laghetto:** possui dois headers — um transparente (scroll: false) e um sólido, confirmando o padrão scroll-aware.
- Valores de `backdrop-filter` (blur) **não são capturados** pelo extrator de estilos computados utilizado. Os valores acima de background transparente indicam onde provavelmente há blur, mas não confirmam.
