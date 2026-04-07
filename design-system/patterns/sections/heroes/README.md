---
name: "Hero Section Patterns"
category: "sections/heroes"
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

# Hero Sections — Padroes Extraidos

Analise dos hero sections de 5 sites premium. Cada padrao inclui valores CSS reais extraidos automaticamente.

---

## 1. Stripe — Hero Split com Grid

**Layout:** Grid de 2 colunas (texto a esquerda, imagem/ilustracao a direita), fundo branco.

| Propriedade | Valor |
|-------------|-------|
| Container | `width: 1440px`, `padding: 0px 16px` |
| Grid Layout | `display: grid`, `padding: 36px 16px` |
| Grid Interno | `display: grid`, `width: 1232px` |
| Background | `rgb(255, 255, 255)` (branco puro) |
| Cor do Texto | `rgb(0, 0, 0)` (base), `rgb(6, 27, 49)` (headings), `rgb(100, 116, 141)` (subtitulo) |
| Fonte | `sohne-var, "SF Pro Display", sans-serif` |
| Heading XL | `font-size: 48px`, `font-weight: 300` (light) |
| Heading MD | `font-size: 32px`, `font-weight: 300`, `letter-spacing: -0.01em` |
| Body | `font-size: 16px`, `font-weight: 300` |
| Eyebrow | `font-size: 14px`, `font-weight: 300`, cor `rgb(100, 116, 141)` |
| Cor Accent | `rgb(83, 58, 253)` (roxo Stripe) |
| Hero Height | ~685px (secao completa) |

**Efeitos Especiais:**
- Gradientes radiais multicoloridos como fundo decorativo:
  ```css
  radial-gradient(103.24% 102.63% at 50% 102.63%, rgb(72, 111, 253) 0px, rgb(127, 129, 243) 9.84%, rgb(196, 137, 255) 20.83%, rgb(218, 192, 255) 34.13%, rgb(234, 220, 255) 44.86%, rgb(249, 246, 255) 58.59%, rgb(248, 250, 253) 100%)
  ```
- Logo carousel logo abaixo do hero (social proof imediato)

**Quando usar:** Landing pages de produtos SaaS com multiplas funcionalidades. O layout split permite mostrar o produto visualmente enquanto comunica a proposta de valor.

---

## 2. Linear — Hero Dark Centralizado

**Layout:** Centralizado, full-width, fundo escuro (quase preto). Texto grande e impactante.

| Propriedade | Valor |
|-------------|-------|
| Container | `width: 1344px`, `padding: 0px 32px` |
| Background | Transparente sobre fundo `rgb(8, 9, 10)` (quase preto) |
| Cor do Texto | `rgb(247, 248, 248)` (branco off-white) |
| Cor Secundaria | `rgb(138, 143, 152)` (cinza medio) |
| Fonte | `"Inter Variable", "SF Pro Display", -apple-system, system-ui, sans-serif` |
| Heading H1 | `font-size: 64px`, `font-weight: 510` (medium+) |
| Subtitle | `font-size: 18px`, `font-weight: 400` |
| Body | `font-size: 15px`, `font-weight: 400`, `letter-spacing: -0.011em` |
| Line-height H1 | `1.03` (heading XL), `1.2` (heading XS) |
| App Screenshot | Full-width abaixo do texto (`width: 1416px`) |

**Efeitos Especiais:**
- Gradiente radial no fundo da imagem:
  ```css
  radial-gradient(52.53% 57.5% at 50% 100%, rgba(8, 9, 10, 0) 0px, rgba(8, 9, 10, 0.5) 100%)
  ```
- Radial glows sutis com `rgba(255, 255, 255, 0.04)` para depth
- Shadow de elevacao: `rgba(0, 0, 0, 0.4) 0px 2px 4px 0px`

**Quando usar:** Ferramentas de produtividade ou developer tools. O dark theme transmite sofisticacao e foco. Ideal quando o produto tem uma UI bonita para exibir.

---

## 3. Vercel — Hero Minimalista com Grid System

**Layout:** Centralizado dentro de grid system, fundo claro, extremamente limpo.

| Propriedade | Valor |
|-------------|-------|
| Page Container | `width: 1408px`, `padding: 64px 0px 0px` |
| Grid System | `width: 1079px`, centralizado com `mx-auto` |
| Background | `rgb(250, 250, 250)` (off-white) |
| Cor do Texto | `rgb(23, 23, 23)` (quase preto) |
| Cor Secundaria | `rgb(77, 77, 77)` (cinza escuro) |
| Cor Terciaria | `rgb(102, 102, 102)` (cinza medio) |
| Fonte | `Geist, Arial, sans-serif` |
| Heading Grande | `font-size: 48px`, `font-weight: 600` |
| Heading Medio | `font-size: 32px`, `font-weight: 600` |
| Heading Pequeno | `font-size: 24px`, `font-weight: 600` |
| Body | `font-size: 14px`, `font-weight: 400` |
| Mono | `"Geist Mono", ui-monospace, SFMono-Regular` |

**Efeitos Especiais:**
- Gradiente conico decorativo:
  ```css
  conic-gradient(from 180deg at 50% 70%, rgba(250, 250, 250, 0) 0deg, rgb(238, 195, 45) 72deg, rgb(236, 75, 75) 144deg, rgb(112, 154, 185) 216deg, rgb(77, 255, 191) 288deg, rgba(250, 250, 250, 0) 360deg)
  ```
- Borders sutis com `rgba(0, 0, 0, 0.05)` para grid visual
- Shadow-as-border: `rgba(0, 0, 0, 0.08) 0px 0px 0px 1px`

**Quando usar:** Plataformas developer, infraestrutura, tooling. A abordagem minimalista com grid visivel transmite precisao e confiabilidade.

---

## 4. Raycast — Hero Dark com CTA em Destaque

**Layout:** Centralizado, fundo escuro (preto), hero full-height com CTA proeminente.

| Propriedade | Valor |
|-------------|-------|
| Hero Container | `width: 1440px`, `height: 940px` (full viewport) |
| Background | `rgb(7, 8, 10)` / `rgb(8, 9, 12)` (preto profundo) |
| Cor do Texto | `rgb(255, 255, 255)` (branco puro) |
| Cor Subtitle | `rgba(255, 255, 255, 0.6)` (60% opacity) |
| Cor Muted | `rgb(156, 156, 157)` |
| Fonte | `Inter, "Inter Fallback", sans-serif` |
| Hero Title | `font-size: 18px`, `font-weight: 400` (subtitle sob a imagem) |
| Section Title | `font-size: 32px`, `font-weight: 400` a `500` |
| CTA Text | `font-size: 14px`, `font-weight: 500` |
| Navbar Height | `76px` (custom property `--navbar-height`) |
| Fade-in Class | `page_fadeInUp` |

**Efeitos Especiais:**
- Gradiente diagonal no hero:
  ```css
  linear-gradient(137deg, rgba(17, 18, 20, 0.75) 4.87%, rgba(12, 13, 15, 0.9) 75.88%)
  ```
- Glow sutil do produto:
  ```css
  radial-gradient(85.77% 49.97% at 51% 5.12%, rgba(255, 150, 150, 0.11) 0px, rgba(222, 226, 255, 0.08) 45.83%, rgba(241, 242, 255, 0.02) 100%)
  ```
- Botao CTA com shadow complexo (glass morphism):
  ```css
  box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 2px, rgba(255, 255, 255, 0.19) 0px 0px 14px 0px, rgba(0, 0, 0, 0.2) 0px -1px 0.4px 0px inset, rgb(255, 255, 255) 0px 1px 0.4px 0px inset;
  ```

**Quando usar:** Apps desktop/launcher, ferramentas de produtividade pessoal. O dark theme com glow sutil cria uma atmosfera premium.

---

## 5. Apple iPhone — Hero Editorial com Tipografia Grande

**Layout:** Full-width, centrado, alternando secoes claras e escuras. Hero e um showcase de produto.

| Propriedade | Valor |
|-------------|-------|
| Page Header | `width: 1440px`, `display: flex` |
| Section Width | `1260px` (com margins de 90px) |
| Background Claro | `rgb(245, 245, 247)` |
| Background Nav | `rgb(250, 250, 252)` |
| Cor do Texto | `rgb(29, 29, 31)` (quase preto Apple) |
| Cor Secundaria | `rgb(51, 51, 54)`, `rgb(110, 110, 115)` |
| Cor Link | `rgb(0, 102, 204)` (azul Apple) |
| Fonte Display | `"SF Pro Display", "SF Pro Icons", "Helvetica Neue", sans-serif` |
| Fonte Text | `"SF Pro Text", "SF Pro Icons", "Helvetica Neue", sans-serif` |
| Heading Hero | `font-size: 56px`, `font-weight: 600` |
| Heading Section | `font-size: 28px`, `font-weight: 600` |
| Heading Sub | `font-size: 24px`, `font-weight: 600` |
| Body | `font-size: 17px`, `font-weight: 400` |
| Footer Text | `font-size: 12px`, `font-weight: 400`, cor `rgba(0, 0, 0, 0.56)` |
| Global Nav Height | `44px` (custom property `--r-globalnav-height`) |
| Section Padding | `160px` (custom property `--global-section-padding`) |

**Efeitos Especiais:**
- Gradiente sutil para overlay de imagem:
  ```css
  linear-gradient(rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.56))
  ```
- Animacoes de scroll com cascata de opacidade (staggered fade-in)
- Secoes com padding vertical generoso (`160px`)

**Quando usar:** Produtos consumer premium, hardware, lifestyle brands. A abordagem editorial com grandes imagens e tipografia bold cria desejo.

---

## Comparacao Rapida

| Site | Tema | Heading | Font-Weight | Layout | Accent |
|------|------|---------|-------------|--------|--------|
| Stripe | Light | 48px | 300 (light) | Grid Split | `rgb(83, 58, 253)` |
| Linear | Dark | 64px | 510 (medium+) | Centralizado | `rgb(94, 106, 210)` |
| Vercel | Light | 48px | 600 (semibold) | Grid System | `rgb(0, 114, 245)` |
| Raycast | Dark | 32px | 400-500 | Centralizado | `rgb(255, 99, 99)` |
| Apple | Light/Dark | 56px | 600 (semibold) | Full-width | `rgb(0, 102, 204)` |

---

## CSS Reference — Copy-Paste

### Dark Hero (Linear/Raycast style)
```css
.hero-dark {
  background: rgb(8, 9, 10);
  color: rgb(247, 248, 248);
  font-family: "Inter Variable", -apple-system, system-ui, sans-serif;
  padding: 0 32px;
}
.hero-dark h1 {
  font-size: 64px;
  font-weight: 510;
  line-height: 1.03;
  letter-spacing: -0.02em;
}
.hero-dark .subtitle {
  color: rgb(138, 143, 152);
  font-size: 18px;
  font-weight: 400;
}
```

### Light Hero (Stripe/Vercel style)
```css
.hero-light {
  background: rgb(255, 255, 255);
  color: rgb(6, 27, 49);
  font-family: Geist, "SF Pro Display", sans-serif;
  padding: 36px 16px;
}
.hero-light h1 {
  font-size: 48px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.hero-light .subtitle {
  color: rgb(100, 116, 141);
  font-size: 16px;
  font-weight: 300;
}
```

### Editorial Hero (Apple style)
```css
.hero-editorial {
  background: rgb(245, 245, 247);
  color: rgb(29, 29, 31);
  font-family: "SF Pro Display", "Helvetica Neue", sans-serif;
  padding: 160px 0;
}
.hero-editorial h1 {
  font-size: 56px;
  font-weight: 600;
}
.hero-editorial .body {
  font-size: 17px;
  font-weight: 400;
  color: rgb(110, 110, 115);
}
```

---

# Onda 2 — Sites Novos (17 sites)

---

## SaaS & AI

---

### 6. Framer — Hero Dark com Tipografia Display

**Layout:** Full-width, fundo preto puro, texto centralizado com tipografia display grande.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` (preto puro) |
| Cor do Texto | `rgb(255, 255, 255)` (branco) |
| Cor Secundária | `rgba(255, 255, 255, 0.6)` (60% opacity) |
| Cor Accent | `rgb(0, 153, 255)` (azul Framer) |
| Fonte Display | `"GT Walsheim Medium", sans-serif` |
| Fonte Body | `"Inter Variable", sans-serif` |
| Heading Hero | `font-size: 62px`, `font-weight: 500` |
| Heading Section | `font-size: 32px`, `font-weight: 500` |
| Body | `font-size: 15px`, `font-weight: 400` |
| Node Count | 3896 (DOM complexo) |

**Efeitos Especiais:**
- Gradiente radial branco-para-preto:
  ```css
  radial-gradient(100% 100% at 0% 0%, rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)
  ```
- Fade-to-black linear no hero:
  ```css
  linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 41%, rgb(0, 0, 0) 100%)
  ```
- Sombras com glow sutil: `rgba(255, 255, 255, 0.1) 0px 0.5px 0px 0.5px, rgba(0, 0, 0, 0.25) 0px 10px 30px`

**Quando usar:** Landing pages de ferramentas de design/prototipagem. O dark theme com tipografia display grande cria impacto visual imediato.

---

### 7. Notion — Hero Light Warm com Tipografia Humanista

**Layout:** Centralizado, fundo off-white quente, paleta multicolorida para categorias.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(255, 255, 255)` / `rgb(246, 245, 244)` (warm off-white) |
| Cor do Texto | `rgba(0, 0, 0, 0.9)` (quase preto com leve transparência) |
| Cor Secundária | `rgba(0, 0, 0, 0.54)` (54% opacity) |
| Cor Accent | `rgb(0, 117, 222)` / `rgb(9, 127, 232)` (azul Notion) |
| Fonte | `NotionInter, Inter, -apple-system, sans-serif` |
| Heading Hero | `font-size: 54px`, `font-weight: 700` |
| Heading Section | `font-size: 48px`, `font-weight: 400` |
| Heading Card | `font-size: 22px`, `font-weight: 700` |
| Body | `font-size: 16px`, `font-weight: 400` |
| Sombra Card | `rgba(0, 0, 0, 0.04) 0px 4px 18px` (4 camadas, muito sutil) |

**Quando usar:** Produtos de produtividade, workspaces. O tom quente (off-white amarelado) e a tipografia humanista transmitem acessibilidade e conforto.

---

### 8. Superhuman — Hero com Gradientes Mesh Vibrantes

**Layout:** Fundo dark com gradientes mesh multicoloridos vibrantes. Tipografia com variable font customizada.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(41, 40, 39)` (warm dark) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Accent | `rgb(113, 76, 182)` (roxo Superhuman) |
| Fonte | `"Super Sans VF", system-ui, sans-serif` |
| Heading Hero | `font-size: 64px`, `font-weight: 540` |
| Heading Section | `font-size: 48px`, `font-weight: 460` |
| Body | `font-size: 16px`, `font-weight: 460` (peso customizado) |
| Sombra CTA | `rgb(113, 76, 182) 0px 0px 0px 1px inset` (ring roxo) |

**Efeitos Especiais:**
- Mesh gradient complexo (5 radiais sobrepostos):
  ```css
  linear-gradient(rgba(255, 255, 255, 0.12) 0px, rgba(255, 255, 255, 0) 100%),
  radial-gradient(circle at 68% 50%, rgba(133, 125, 250, 0.6) 0px, rgba(0, 0, 0, 0) 50%),
  radial-gradient(circle at 50% 98%, rgba(255, 51, 102, 0.6) 0px, rgba(0, 0, 0, 0) 50%),
  radial-gradient(circle at 93% 50%, rgba(75, 105, 227, 0.5) 0px, rgba(0, 0, 0, 0) 50%),
  radial-gradient(circle at 50% 75%, rgba(104, 222, 255, 0.5) 0px, rgba(0, 0, 0, 0) 50%)
  ```

**Quando usar:** Produtos de email/comunicação premium. Os gradientes mesh criam uma sensação de luxo digital.

---

### 9. Runway — Hero Dark Minimalista com Tipografia Neutra

**Layout:** Fundo escuro minimalista, tipografia customizada com pesos leves.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(12, 12, 12)` (preto profundo) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Secundária | `rgb(64, 64, 64)` / `rgb(153, 153, 153)` |
| Fonte | `abcNormal, sans-serif` |
| Heading Hero | `font-size: 48px`, `font-weight: 400` (light) |
| Heading Section | `font-size: 40px`, `font-weight: 400` |
| Body | `font-size: 16px`, `font-weight: 400` |
| CTA | `font-size: 14px`, `font-weight: 600` |

**Quando usar:** Produtos de AI/criação de vídeo. O minimalismo extremo deixa o produto falar por si — ideal quando o visual do output é o argumento de venda.

---

### 10. OpenAI — Hero Ultra-Minimalista Monocromático

**Layout:** Extremamente limpo, praticamente só preto e branco, sem decoração.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(255, 255, 255)` (branco puro) |
| Cor do Texto | `rgb(0, 0, 0)` (preto puro) |
| Cor Secundária | `rgba(0, 0, 0, 0.6)` (60% opacity) |
| Cor Border | `rgba(0, 0, 0, 0.12)` |
| Fonte | `"OpenAI Sans", sans-serif` |
| Heading Hero | `font-size: 48px`, `font-weight: 500` |
| Heading Section | `font-size: 28px`, `font-weight: 600` |
| Body | `font-size: 17px`, `font-weight: 400` |
| Nav Link | `font-size: 14px`, `font-weight: 500` |

**Quando usar:** Produtos de AI/research. O minimalismo absoluto transmite seriedade e foco na tecnologia. Sem distrações visuais.

---

### 11. Anthropic — Hero Warm Serif Elegante

**Layout:** Fundo warm off-white com combinação sans-serif + serif. Paleta terrosa sofisticada.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(250, 249, 245)` (warm cream) |
| Cor do Texto | `rgb(20, 20, 19)` (quase preto quente) |
| Cor Secundária | `rgb(176, 174, 165)` (cinza quente) |
| Cor Accent | `rgb(217, 119, 87)` (clay/terracota) |
| Fonte Display | `"Anthropic Sans", Arial, sans-serif` |
| Fonte Serif | `"Anthropic Serif", Georgia, sans-serif` |
| Heading Hero | `font-size: ~61px`, `font-weight: 700` |
| Body Serif | `font-size: 20px`, `font-weight: 400` (serif) |
| Body Sans | `font-size: 16px`, `font-weight: 400` |
| Sombra | `rgba(0, 0, 0, 0.01) 0px 2px 2px, rgba(0, 0, 0, 0.04) 0px 16px 24px` (ultra-sutil) |

**Efeitos Especiais:**
- Marquee (logo carousel): `@keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }`
- Gradiente overlay warm: `linear-gradient(rgba(232, 230, 220, 0.8), rgba(232, 230, 220, 0.59) 40%, rgba(0, 0, 0, 0))`

**Quando usar:** Empresas de AI safety/research. A combinação serif + warm tones transmite confiança e humanidade. Anti-padrão ao "tech dark" genérico.

---

### 12. Pitch — Hero Dark Vibrante com Roxo Accent

**Layout:** Fundo dark-purple escuro, accent roxo vibrante, tipografia bold pesada.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(43, 42, 53)` (dark purple-gray) |
| Background Alt | `rgb(30, 29, 40)` (mais escuro) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Accent | `rgb(107, 83, 255)` (roxo Pitch) |
| Cor Accent Alt | `rgb(141, 73, 247)` (purple) |
| Fonte Display | `"Mark Pro", sans-serif` |
| Fonte Body | `Eina01, sans-serif` |
| Heading Hero | `font-size: 80px`, `font-weight: 800` (extra-bold) |
| Heading Section | `font-size: 60px`, `font-weight: 800` |
| Body | `font-size: 18px`, `font-weight: 400` |
| Sombra | `rgba(0, 0, 0, 0.15) 0px 3px 10px` (24 ocorrências) |

**Efeitos Especiais:**
- Gradientes roxo vibrante:
  ```css
  linear-gradient(90deg, rgb(83, 24, 235), rgb(171, 110, 249))
  linear-gradient(45deg, rgb(43, 42, 53), rgb(138, 76, 249) 120%)
  ```
- Animação de sparkles e gradientes animados

**Quando usar:** Produtos de apresentação/colaboração. O roxo vibrante sobre dark cria energia e criatividade.

---

### 13. Loom — Hero Light Clean com Azul Corporativo

**Layout:** Fundo escuro (quase preto) para hero, transição para branco em seções. Azul corporativo forte.

| Propriedade | Valor |
|-------------|-------|
| Background Hero | `rgb(16, 18, 20)` (preto) |
| Background Body | `rgb(255, 255, 255)` / `rgb(233, 242, 254)` (azul claro) |
| Cor do Texto | `rgb(41, 42, 46)` (dark gray) |
| Cor Accent | `rgb(24, 104, 219)` (azul Loom) |
| Fonte Display | `"Charlie Display", sans-serif` |
| Fonte Body | `"Charlie Text", sans-serif` |
| Heading Hero | `font-size: ~63px`, `font-weight: 700` |
| Heading Section | `font-size: ~25px`, `font-weight: 700` |
| Body | `font-size: 16px`, `font-weight: 400` |
| Sombra Card | `rgba(0, 0, 0, 0.04) 0px 2px 6px, rgba(0, 0, 0, 0.1) 0px 24px 83px` |

**Quando usar:** Ferramentas de vídeo/comunicação async. A combinação dark hero + body claro cria contraste entre "hero impactante" e "produto acessível".

---

### 14. Circle — Hero Dark com Gradientes Pastel

**Layout:** Fundo preto com gradientes pastel coloridos para categorias. Tipografia Inter bold.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` / `rgb(10, 10, 10)` |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Secundária | `rgb(115, 115, 115)` |
| Fonte | `Inter, system-ui, sans-serif` |
| Heading Hero | `font-size: 64px`, `font-weight: 700` |
| Heading Section | `font-size: 56px`, `font-weight: 700` |
| Body | `font-size: 16px`, `font-weight: 400` |

**Efeitos Especiais:**
- Gradientes pastel por categoria:
  ```css
  linear-gradient(142deg, rgb(64, 143, 237) 18.68%, rgb(62, 27, 201) 78.25%)  /* azul */
  linear-gradient(0deg, rgb(255, 235, 225) -8.3%, rgb(255, 204, 187) 130.75%) /* salmon */
  linear-gradient(303deg, rgb(218, 239, 237) 14.4%, rgb(243, 255, 254) 91.66%) /* teal */
  ```

**Quando usar:** Plataformas de comunidade. Os gradientes pastel humanizam o dark theme e criam identidade visual por feature.

---

## Brasil Premium

---

### 15. Nubank — Hero Clean com Roxo Institucional

**Layout:** Fundo preto com accent roxo forte. Tipografia Graphik Medium proprietária.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` (preto) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Secundária | `rgb(162, 162, 162)` |
| Cor Accent | `rgb(130, 10, 209)` (roxo Nubank) |
| Cor Accent Dark | `rgb(41, 11, 77)` (purple escuro) |
| Fonte | `graphikMedium, arial, helvetica` |
| Heading Hero | `font-size: 48-56px`, `font-weight: 500` |
| Heading Section | `font-size: 36px`, `font-weight: 500` |
| Body | `font-size: 16-18px`, `font-weight: 400` |
| Radius | `24px` (cards generosos) |

**Quando usar:** Fintech, apps financeiros. O roxo vibrante sobre preto transmite confiança e modernidade. Referência brasileira de design system consistente.

---

### 16. Duck Design — Hero Dark com Tipografia Gigante

**Layout:** Fundo preto, tipografia extremamente grande (até 160px), accent amarelo dourado.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` / `rgb(25, 25, 25)` |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Secundária | `rgb(102, 102, 102)` |
| Cor Accent | `rgb(248, 224, 142)` (dourado) |
| Fonte Display | `Pretendard, sans-serif` |
| Fonte Mono | `"Martian Mono SemiExpanded", sans-serif` |
| Heading Hero | `font-size: 160px`, `font-weight: 600` (!!) |
| Heading Section | `font-size: 64px`, `font-weight: 500-700` |
| Body | `font-size: 14-16px`, `font-weight: 500` |
| Sombra Drama | `rgba(0, 0, 0, 0.36) 0px 0px 70px` |

**Quando usar:** Agências de design, portfólios criativos. A tipografia gigante é statement — transmite ousadia e confiança criativa.

---

### 17. Reino Studio — Hero Preto-e-Branco com Tipografia Mega

**Layout:** Extremamente contrastado, preto e branco puro. Tipografia Poppins em tamanhos gigantescos.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` (preto puro) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Accent | `rgb(0, 122, 255)` (azul) |
| Fonte Display | `Poppins, sans-serif` |
| Fonte Body | `Inter, sans-serif` |
| Heading Hero | `font-size: 200px`, `font-weight: 700` (!!!) |
| Heading Section | `font-size: 112px`, `font-weight: 400` |
| Body | `font-size: 16px`, `font-weight: 400` |

**Quando usar:** Estúdios de design digital, portfólios. Tipografia 200px é o maior valor extraído de todos os 22 sites.

---

### 18. Pulso Hotel — Hero Warm Elegante com Tipografia Leve

**Layout:** Fundo warm off-white, paleta terrosa com dourado. Tipografia ultra-leve (weight 200-300).

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(247, 247, 242)` (warm cream) |
| Background Alt | `rgb(248, 247, 243)` |
| Cor do Texto | `rgb(51, 51, 51)` (cinza escuro quente) |
| Cor Accent | `rgb(217, 181, 125)` (dourado) |
| Cor Verde | `rgb(71, 97, 77)` (verde musgo) |
| Fonte | `"Fff Acidgrotesk", Tahoma, sans-serif` |
| Heading Hero | `font-size: 28px`, `font-weight: 200` (ultra-light) |
| Body | `font-size: 14-16px`, `font-weight: 300-400` |
| Sombra | `rgba(0, 0, 0, 0.3) 0px 0px 20px` |

**Quando usar:** Hotelaria, luxo, lifestyle. A tipografia ultra-leve com paleta terrosa cria sofisticação. Contraste com o "bold/heavy" do tech.

---

### 19. Laghetto — Hero Institucional Verde-Escuro

**Layout:** Fundo verde floresta escuro (`rgb(10, 45, 35)`), tipografia Inter limpa, paleta de verdes.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(10, 45, 35)` (verde floresta escuro) |
| Background Light | `rgb(240, 245, 250)` (off-white azulado) |
| Cor do Texto | `rgb(51, 51, 51)` / `rgb(255, 255, 255)` |
| Cor Accent | `rgb(199, 241, 197)` (verde claro) |
| Cor Accent Alt | `rgb(180, 212, 223)` (azul-verde) |
| Fonte | `Inter, sans-serif` / `"Source Sans 3", sans-serif` |
| Heading Section | `font-size: 36px`, `font-weight: 500` |
| Body | `font-size: 14-18px`, `font-weight: 400` |
| Node Count | 2293 (site complexo) |

**Quando usar:** Hotelaria, turismo, natureza. O verde floresta profundo é incomum e memorável. Transmite premium + sustentabilidade.

---

### 20. FARM Rio — Hero E-commerce com Paleta Tropical

**Layout:** Fundo branco limpo, tipografia Montserrat consistente, cores tropicais nos gradientes.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(255, 255, 255)` |
| Cor do Texto | `rgb(51, 51, 51)` |
| Cor Secundária | `rgb(153, 153, 153)` |
| Cor Verde | `rgb(35, 164, 132)` (verde tropical) |
| Fonte | `Montserrat, sans-serif` |
| Body | `font-size: 14-17px`, `font-weight: 400` |
| Node Count | 2828 (e-commerce, DOM pesado) |

**Efeitos Especiais:**
- Gradiente rainbow tropical:
  ```css
  linear-gradient(90deg, rgb(222, 227, 94), rgb(255, 148, 145), rgb(135, 94, 143), rgb(153, 201, 181))
  ```

**Quando usar:** E-commerce de moda, lifestyle brands. Paleta tropical é identidade — funciona para marcas brasileiras com DNA visual forte.

---

### 21. GMX Digital — Hero Dark Cyberpunk com Neon

**Layout:** Fundo ultra-escuro com accent neon cyan + pink. Tipografia Syncopate bold para headings.

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(17, 17, 17)` / `rgb(5, 5, 5)` (quase preto) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Accent | `rgb(0, 242, 254)` (cyan neon) |
| Cor Accent Alt | `rgb(255, 77, 109)` (pink neon) |
| Fonte Display | `Syncopate, sans-serif` / `"Space Grotesk", sans-serif` |
| Fonte Body | `Inter, sans-serif` |
| Heading Hero | `font-size: ~101px`, `font-weight: 700` |
| Heading Section | `font-size: ~46-56px`, `font-weight: 700` |
| Body | `font-size: 16-17.6px`, `font-weight: 400` |

**Efeitos Especiais:**
- Gradiente neon: `linear-gradient(90deg, rgb(0, 242, 254), rgb(255, 0, 127))`
- Logo glow: `@keyframes logoGlow { filter: drop-shadow(rgba(0, 242, 254, 0.12) 0px 0px 6px) }`
- Sombra profunda com inset glow:
  ```css
  rgba(0, 0, 0, 0.8) 0px 60px 120px 0px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(255, 255, 255, 0.08) 0px 1px 0px 0px inset
  ```
- Glass cards com inset highlights:
  ```css
  rgba(0, 0, 0, 0.04) 0px 6px 28px 0px, rgba(255, 255, 255, 0.7) 0px 1px 0px 0px inset
  ```

**Quando usar:** Agências digitais, tech studios. O estilo cyberpunk com neons transmite inovação e ousadia.

---

## Comparação Rápida — Onda 2

| Site | Tema | Heading | Font-Weight | Layout | Accent |
|------|------|---------|-------------|--------|--------|
| Framer | Dark | 62px | 500 | Centralizado | `rgb(0, 153, 255)` |
| Notion | Light (warm) | 54px | 700 | Centralizado | `rgb(0, 117, 222)` |
| Superhuman | Dark (warm) | 64px | 540 | Centralizado | `rgb(113, 76, 182)` |
| Runway | Dark | 48px | 400 | Centralizado | N/A (monocromático) |
| OpenAI | Light | 48px | 500 | Centralizado | N/A (monocromático) |
| Anthropic | Light (warm) | 61px | 700 | Centralizado | `rgb(217, 119, 87)` |
| Pitch | Dark (purple) | 80px | 800 | Centralizado | `rgb(107, 83, 255)` |
| Loom | Dark→Light | 63px | 700 | Centralizado | `rgb(24, 104, 219)` |
| Circle | Dark | 64px | 700 | Centralizado | Gradientes pastel |
| Nubank | Dark | 48-56px | 500 | Centralizado | `rgb(130, 10, 209)` |
| Duck Design | Dark | 160px | 600 | Centralizado | `rgb(248, 224, 142)` |
| Reino | Dark | 200px | 700 | Centralizado | `rgb(0, 122, 255)` |
| Pulso Hotel | Light (warm) | 28px | 200 | Centralizado | `rgb(217, 181, 125)` |
| Laghetto | Dark (green) | 36px | 500 | Centralizado | `rgb(199, 241, 197)` |
| FARM Rio | Light | 17px | 400 | Grid E-commerce | `rgb(35, 164, 132)` |
| GMX | Dark | 101px | 700 | Centralizado | `rgb(0, 242, 254)` |

### CSS Reference — Copy-Paste (Onda 2)

### Warm Hero (Anthropic/Pulso style)
```css
.hero-warm {
  background: rgb(250, 249, 245);
  color: rgb(20, 20, 19);
  font-family: "Anthropic Serif", Georgia, sans-serif;
  padding: 0 28px;
}
.hero-warm h1 {
  font-size: 61px;
  font-weight: 700;
  font-family: "Anthropic Sans", Arial, sans-serif;
}
.hero-warm .subtitle {
  color: rgb(176, 174, 165);
  font-size: 20px;
  font-weight: 400;
}
```

### Cyberpunk Hero (GMX style)
```css
.hero-cyberpunk {
  background: rgb(5, 5, 5);
  color: rgb(255, 255, 255);
  font-family: Inter, sans-serif;
}
.hero-cyberpunk h1 {
  font-size: 100px;
  font-weight: 700;
  font-family: Syncopate, sans-serif;
  background: linear-gradient(90deg, rgb(0, 242, 254), rgb(255, 0, 127));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Ultra-Light Hero (Pulso Hotel style)
```css
.hero-ultralight {
  background: rgb(247, 247, 242);
  color: rgb(51, 51, 51);
  font-family: "Fff Acidgrotesk", Tahoma, sans-serif;
}
.hero-ultralight h1 {
  font-size: 28px;
  font-weight: 200;
  letter-spacing: 0.02em;
}
.hero-ultralight .accent {
  color: rgb(217, 181, 125);
}
```
