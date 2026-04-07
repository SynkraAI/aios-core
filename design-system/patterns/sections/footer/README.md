---
name: "Footer Patterns"
category: "sections/footer"
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

# Footer Sections — Padrões Extraídos

Analise dos footers de 5 sites premium.

---

## 1. Stripe

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(248, 250, 253)` (off-white frio) |
| Cor do Texto | `rgb(0, 0, 0)` |
| Font-size | `16px` |
| Font-weight | `400` |
| Padding | `0px 16px` |
| Altura | `1040px` |
| Largura | `1440px` |
| Modo | Light (`hds-mode--light`) |

**Caracteristicas:** Footer alto (1040px) com fundo levemente diferente do body (`rgb(248, 250, 253)` vs `rgb(255, 255, 255)`). A diferenca de tom cria separacao visual sem borda explicita.

---

## 2. Linear

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(8, 9, 10)` (preto profundo) |
| Cor do Texto | `rgb(247, 248, 248)` (branco off-white) |
| Font-size | `16px` |
| Font-weight | `400` |
| Padding | `0px` |
| Altura | `464px` |
| Largura | `1440px` |

**Caracteristicas:** Footer mais compacto (464px), mesma cor de fundo que o resto do site. Continuidade visual total — o footer nao "quebra" o dark theme.

---

## 3. Vercel

| Propriedade | Valor |
|-------------|-------|
| Background | Transparente (herda o fundo) |
| Cor do Texto | `rgb(23, 23, 23)` |
| Font-size | `14px` (texto menor que o body) |
| Font-weight | `400` |
| Padding | `40px 24px` |
| Altura | `678px` |
| Largura | `1440px` |
| Classes CSS | `max-w-[var(--ds-page-width-with-margin)]`, `mx-auto`, `py-10`, `text-[14px]` |

**Caracteristicas:** Usa Tailwind utility classes. Font-size reduzido para 14px (vs 16px do body). Padding vertical generoso (40px = `py-10`). Contem navegacao interna (`<nav>` de 1392px x 598px).

---

## 4. Raycast

Nao foi detectado um `<footer>` explicito nos dados extraidos. O conteudo provavelmente utiliza uma secao personalizada em vez de tag semantica `<footer>`.

### Newsletter Form (encontrado na parte inferior)
```css
.newsletter-form {
  display: grid;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  font-weight: 500;
}

.newsletter-input {
  background: rgba(255, 255, 255, 0.05);
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
}

.newsletter-submit {
  background: rgba(255, 255, 255, 0.9);
  color: rgb(0, 0, 0);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
}
```

**Caracteristicas:** Newsletter subscribe com input field glass-morphism e botao de submit invertido (fundo claro em dark theme).

---

## 5. Apple iPhone

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(245, 245, 247)` (cinza Apple claro) |
| Cor do Texto | `rgba(0, 0, 0, 0.56)` (preto com 56% opacity) |
| Font-size | `12px` |
| Font-weight | `400` |
| Padding | `0px` |
| Altura | `5630px` (!!) |
| Largura | `1440px` |
| Fonte | `"SF Pro Text", "Myriad Set Pro", sans-serif` |

**Caracteristicas:** Footer extremamente longo (5630px) — Apple inclui um mega-footer com tabela comparativa de todos os iPhones, notas legais extensas, e links de navegacao global. A cor de texto com opacity (56%) cria hierarquia sutil.

---

## Comparacao Rapida

| Site | Background | Texto | Font-size | Altura | Estilo |
|------|-----------|-------|-----------|--------|--------|
| Stripe | `rgb(248, 250, 253)` | Preto | 16px | 1040px | Off-white frio |
| Linear | `rgb(8, 9, 10)` | Off-white | 16px | 464px | Continuidade dark |
| Vercel | Transparente | Quase preto | 14px | 678px | Tailwind, compacto |
| Raycast | Dark (inferido) | Branco 40% | 14px | N/A | Newsletter CTA |
| Apple | `rgb(245, 245, 247)` | Preto 56% | 12px | 5630px | Mega-footer legal |

---

## CSS Reference — Copy-Paste

### Footer Light (Stripe style)
```css
.footer-light {
  background: rgb(248, 250, 253);
  color: rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
  padding: 64px 16px;
}
```

### Footer Dark (Linear style)
```css
.footer-dark {
  background: rgb(8, 9, 10);
  color: rgb(247, 248, 248);
  font-size: 16px;
  font-weight: 400;
  padding: 48px 0;
}
```

### Footer Compacto (Vercel style)
```css
.footer-compact {
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 40px 24px;
  font-size: 14px;
  color: rgb(23, 23, 23);
}
```

### Footer com Opacity Text (Apple style)
```css
.footer-muted {
  background: rgb(245, 245, 247);
  color: rgba(0, 0, 0, 0.56);
  font-size: 12px;
  font-weight: 400;
  font-family: "SF Pro Text", "Helvetica Neue", sans-serif;
}
```

### Newsletter Dark (Raycast style)
```css
.footer-newsletter {
  display: grid;
  gap: 12px;
}
.footer-newsletter input {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
}
.footer-newsletter button {
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
}
```

---

## Quando Usar

| Padrao | Quando Usar |
|--------|-------------|
| **Footer Light** (Stripe) | SaaS B2B, muitos links de produto/recurso |
| **Footer Dark** (Linear) | Apps dark theme, continuidade visual |
| **Footer Compacto** (Vercel) | Developer tools, informacao minima |
| **Mega-footer** (Apple) | E-commerce, comparacao de produtos, legais extensos |
| **Newsletter CTA** (Raycast) | Quando captura de email e prioridade |

---

# Onda 2 — Footer Patterns (17 sites)

---

## SaaS & AI

### 6. Framer

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` (preto puro) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Font-size | `15px` |
| Fonte | `"Inter Variable", sans-serif` |

**Características:** Footer escuro contínuo com o tema da página. Links em branco com hover sutil via `color 0.3s cubic-bezier(0.44, 0, 0.56, 1)`.

---

### 7. Notion

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(255, 255, 255)` |
| Cor do Texto | `rgba(0, 0, 0, 0.54)` (54% opacity) |
| Font-size | `14px` |
| Fonte | `NotionInter, Inter, sans-serif` |
| Border Top | `1px solid rgba(0, 0, 0, 0.1)` |

**Características:** Footer light com texto em opacity reduzida — similar ao Apple. Separado do body por border sutil.

---

### 8. OpenAI

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(255, 255, 255)` |
| Cor do Texto | `rgb(0, 0, 0)` |
| Cor Links | `rgba(0, 0, 0, 0.6)` |
| Font-size | `14px` |
| Fonte | `"OpenAI Sans", sans-serif` |

**Características:** Ultra-minimalista. Sem sombras, sem bordas decorativas. Links em preto com opacity.

---

### 9. Anthropic

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(250, 249, 245)` (warm cream) |
| Cor do Texto | `rgb(20, 20, 19)` |
| Cor Secundária | `rgb(176, 174, 165)` |
| Font-size | `16px` (sans), `20px` (serif) |
| Fonte | `"Anthropic Sans"` + `"Anthropic Serif"` |

**Características:** Footer warm com tipografia serif para textos de missão. Border sutil: `1px solid rgba(20, 20, 19, 0.1)`. Continua o tema cream do corpo.

---

### 10. Pitch

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(43, 42, 53)` (dark purple-gray) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Font-size | `16px` |
| Fonte | `Eina01, sans-serif` |
| Border Top | `1px solid rgb(221, 223, 229)` |

**Características:** Footer contínuo com dark theme. Accent amarelo para badges: `rgb(255, 208, 44)`.

---

## Brasil Premium

### 11. Nubank

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` |
| Cor do Texto | `rgb(162, 162, 162)` (cinza médio) |
| Cor Links | `rgb(255, 255, 255)` |
| Font-size | `16px` |
| Fonte | `graphikMedium, arial, helvetica` |
| Padding | `24px` (vertical) |

**Características:** Footer escuro com texto em cinza — não branco puro, cria hierarquia. Links brancos se destacam. Sem decoração extra.

---

### 12. Duck Design

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(0, 0, 0)` / `rgb(25, 25, 25)` |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Accent | `rgb(248, 224, 142)` (dourado) |
| Font-size | `14px` |
| Fonte | `Pretendard, sans-serif` |
| Border | `1px solid rgb(102, 102, 102)` |

**Características:** Footer dark com labels mono (`"Martian Mono SemiExpanded"`) e accent dourado.

---

### 13. Pulso Hotel

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(51, 51, 51)` (cinza escuro quente) |
| Cor do Texto | `rgb(247, 247, 242)` (warm cream) |
| Cor Accent | `rgb(217, 181, 125)` (dourado) |
| Font-size | `14px` |
| Fonte | `"Fff Acidgrotesk", Tahoma, sans-serif` |

**Características:** Footer warm-dark. Cores invertidas do body (dark bg com texto cream). Accent dourado para links de ação.

---

### 14. Laghetto

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(10, 45, 35)` (verde floresta escuro) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Cor Accent | `rgb(199, 241, 197)` (verde claro) |
| Font-size | `14px` |
| Fonte | `Inter, sans-serif` |
| Border | `1px solid rgba(10, 45, 35, 0.4)` |

**Características:** Footer verde floresta profundo — continuidade total com o branding. Um dos footers mais distintos visualmente.

---

### 15. FARM Rio

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(51, 51, 51)` (cinza escuro) |
| Cor do Texto | `rgb(255, 255, 255)` |
| Font-size | `14px` |
| Fonte | `Montserrat, sans-serif` |
| Border | `1px solid rgb(229, 229, 229)` |

**Características:** Footer e-commerce padrão com links de navegação, políticas, e newsletter. Gradiente tropical: `linear-gradient(90deg, rgb(222, 227, 94), rgb(255, 148, 145), rgb(135, 94, 143))`.

---

### 16. GMX

| Propriedade | Valor |
|-------------|-------|
| Background | `rgb(5, 5, 5)` (quase preto) |
| Cor do Texto | `rgba(255, 255, 255, 0.6)` |
| Cor Accent | `rgb(0, 242, 254)` (cyan neon) |
| Font-size | `16px` |
| Fonte | `Inter, sans-serif` |
| Border | `1px solid rgba(255, 255, 255, 0.08)` |

**Características:** Footer dark cyberpunk. Neon accent nos links. Glass morphism nos cards: `rgba(0, 0, 0, 0.04) 0px 6px 28px, rgba(255, 255, 255, 0.7) 0px 1px 0px inset`.

---

## Comparação — Onda 2

| Site | Background | Texto | Font-size | Estilo |
|------|-----------|-------|-----------|--------|
| Framer | `rgb(0, 0, 0)` | Branco | 15px | Continuidade dark |
| Notion | `rgb(255, 255, 255)` | Preto 54% | 14px | Light, opacity text |
| OpenAI | `rgb(255, 255, 255)` | Preto | 14px | Ultra-minimal |
| Anthropic | `rgb(250, 249, 245)` | Quase preto | 16px | Warm cream, serif |
| Pitch | `rgb(43, 42, 53)` | Branco | 16px | Dark purple |
| Nubank | `rgb(0, 0, 0)` | Cinza | 16px | Dark, hierárquico |
| Duck Design | `rgb(0, 0, 0)` | Branco | 14px | Dark, mono labels |
| Pulso Hotel | `rgb(51, 51, 51)` | Cream | 14px | Warm dark |
| Laghetto | `rgb(10, 45, 35)` | Branco | 14px | Verde floresta! |
| FARM Rio | `rgb(51, 51, 51)` | Branco | 14px | E-commerce padrão |
| GMX | `rgb(5, 5, 5)` | Branco 60% | 16px | Cyberpunk neon |

### Insight: 12 de 22 sites têm footer dark. O footer warm (Anthropic, Pulso Hotel) é o diferencial mais incomum. Laghetto com verde floresta é o mais memorável.
