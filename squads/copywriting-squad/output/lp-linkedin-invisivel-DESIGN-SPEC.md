# Design System & Especificações — LP "LinkedIn Invisível"

**Especialista:** @brad-frost (Design Systems)
**Referências visuais:** Vercel, Linear, Raycast — dark premium, sem cara de template
**Contexto:** LP de conversão para ebook R$ 59,90, público profissional 30-55 anos

---

## 1. DESIGN TOKENS (CSS Custom Properties)

```css
:root {
  /* ================================================
     PALETA — Dark Premium com acento LinkedIn Blue
     Não é "dark mode genérico". É executive dark:
     fundos quase-preto com subtleza de azul frio.
     ================================================ */

  /* Backgrounds (layered depth) */
  --bg-base: #0a0b0f;           /* Fundo principal — quase preto, leve tom azulado */
  --bg-elevated: #12131a;       /* Cards, seções alternadas */
  --bg-surface: #1a1b24;        /* Inputs, FAQ items, pricing card bg */
  --bg-surface-hover: #22232e;  /* Hover states em surfaces */
  --bg-accent: #0d1117;         /* Seções de destaque (autor, pricing) */

  /* Borders & Separators */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.15);
  --border-accent: rgba(64, 153, 255, 0.25);

  /* Text */
  --text-primary: #f0f0f3;       /* Headings, corpo principal */
  --text-secondary: #a0a3b1;     /* Parágrafos secundários, labels */
  --text-tertiary: #6b6e7d;      /* Captions, metadados */
  --text-accent: #4d9fff;        /* Links, destaques técnicos */
  --text-on-cta: #ffffff;        /* Texto em botões primários */

  /* Accent — LinkedIn Blue refinado (não o azul cru #0077B5) */
  --accent-primary: #4099ff;      /* CTA principal, links */
  --accent-primary-hover: #5aabff;
  --accent-primary-muted: rgba(64, 153, 255, 0.12); /* Badges, tags bg */
  --accent-secondary: #38bdf8;    /* Destaques secundários, ícones */
  --accent-glow: rgba(64, 153, 255, 0.15); /* Glow sutil em hover */

  /* Status / Semântico */
  --success: #34d399;             /* Checkmarks, "incluído" */
  --success-muted: rgba(52, 211, 153, 0.12);
  --warning: #fbbf24;            /* Âncora de valor (riscado) */
  --danger: #f87171;              /* Preço original (riscado) */

  /* Gradients */
  --gradient-hero: linear-gradient(180deg, #0a0b0f 0%, #0d1520 50%, #0a0b0f 100%);
  --gradient-cta: linear-gradient(135deg, #4099ff 0%, #2563eb 100%);
  --gradient-cta-hover: linear-gradient(135deg, #5aabff 0%, #3b82f6 100%);
  --gradient-card: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  --gradient-text: linear-gradient(135deg, #f0f0f3 0%, #a0a3b1 100%);

  /* Noise/Grain overlay */
  --noise-opacity: 0.025;

  /* ================================================
     TIPOGRAFIA — Inter + JetBrains Mono
     Inter: moderna, legível, "tech premium"
     JetBrains Mono: dados, números, preços
     ================================================ */

  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Scale (Mobile-first, fluid) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);     /* 12-13px */
  --text-sm: clamp(0.8125rem, 0.77rem + 0.25vw, 0.875rem);    /* 13-14px */
  --text-base: clamp(0.9375rem, 0.88rem + 0.3vw, 1.0625rem);  /* 15-17px */
  --text-lg: clamp(1.0625rem, 0.98rem + 0.4vw, 1.25rem);      /* 17-20px */
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);         /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);            /* 24-32px */
  --text-3xl: clamp(1.75rem, 1.3rem + 2.25vw, 2.5rem);        /* 28-40px */
  --text-4xl: clamp(2rem, 1.4rem + 3vw, 3rem);                 /* 32-48px */
  --text-5xl: clamp(2.25rem, 1.5rem + 3.75vw, 3.5rem);        /* 36-56px */

  /* Line Heights */
  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  /* Font Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0em;
  --tracking-wide: 0.04em;
  --tracking-wider: 0.08em;

  /* ================================================
     ESPAÇAMENTO — Compacto e premium
     REGRA: sem espaços exagerados entre seções.
     Padding vertical das seções: 48-80px, NUNCA 120+.
     ================================================ */

  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */

  /* Section Spacing (CRÍTICO — não exagerar) */
  --section-py: clamp(3rem, 2.5rem + 2.5vw, 5rem);    /* 48-80px */
  --section-py-lg: clamp(4rem, 3rem + 3vw, 6rem);      /* 64-96px — só hero/pricing */

  /* ================================================
     LAYOUT — Grid & Container
     ================================================ */

  --container-max: 1080px;        /* Mais estreito = mais premium */
  --container-narrow: 720px;      /* Copy-heavy sections */
  --container-wide: 1200px;       /* Grid de screenshots */
  --container-px: clamp(1rem, 0.5rem + 2.5vw, 2rem);  /* 16-32px padding lateral */

  /* ================================================
     EFEITOS
     ================================================ */

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 40px rgba(64, 153, 255, 0.1);
  --shadow-card: 0 1px 0 rgba(255, 255, 255, 0.03), 0 4px 16px rgba(0, 0, 0, 0.4);

  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 40px;

  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);

  /* ================================================
     Z-INDEX
     ================================================ */

  --z-base: 1;
  --z-elevated: 10;
  --z-sticky: 100;
  --z-overlay: 1000;
}
```

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

---

## 2. BASE STYLES & GLOBAL

```css
/* ================================================
   RESET MÍNIMO + BASE
   ================================================ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-base);
  overflow-x: hidden;
}

/* Grain/Noise Overlay — profundidade premium */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ================================================
   CONTAINER
   ================================================ */

.container {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--container-px);
  position: relative;
  z-index: var(--z-base);
}

.container--narrow {
  max-width: var(--container-narrow);
}

.container--wide {
  max-width: var(--container-wide);
}

/* ================================================
   SECTION BASE
   ================================================ */

.section {
  padding-block: var(--section-py);
  position: relative;
}

.section--lg {
  padding-block: var(--section-py-lg);
}

/* Divider sutil entre seções — linha gradiente */
.section + .section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(80%, 600px);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-subtle) 30%, var(--border-default) 50%, var(--border-subtle) 70%, transparent);
}

/* Seção com fundo alternado */
.section--elevated {
  background-color: var(--bg-elevated);
}
```

---

## 3. COMPONENTES

### 3.1 Typography

```css
/* ================================================
   HEADINGS
   ================================================ */

.heading-hero {
  font-size: var(--text-5xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

.heading-section {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.heading-subsection {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

/* Pré-headline (seletor de público) */
.pre-headline {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: var(--space-4);
}

/* Subheadline */
.subheadline {
  font-size: var(--text-lg);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  max-width: 640px;
}

/* Body copy */
.body-text {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.body-text strong {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

/* Texto mono para dados/preços */
.mono {
  font-family: var(--font-mono);
}
```

### 3.2 Buttons (CTA)

```css
/* ================================================
   CTA PRIMÁRIO — Full width em mobile, auto em desktop
   Altura mínima 56px (thumb-friendly).
   Glow sutil no hover, sem sombra agressiva.
   ================================================ */

.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 480px;
  min-height: 56px;
  padding: var(--space-4) var(--space-8);
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-on-cta);
  background: var(--gradient-cta);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-base),
    background var(--transition-base);
  position: relative;
}

.btn-cta::after {
  content: '→';
  font-size: 1.1em;
  transition: transform var(--transition-fast);
}

.btn-cta:hover {
  background: var(--gradient-cta-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow), var(--shadow-md);
}

.btn-cta:hover::after {
  transform: translateX(4px);
}

.btn-cta:active {
  transform: translateY(0);
}

/* Texto abaixo do CTA */
.cta-subtext {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  text-align: center;
  margin-top: var(--space-3);
}

/* Container de CTA (centralizado) */
.cta-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-block: var(--space-10);
}
```

### 3.3 Pain Bullet Cards

```css
/* ================================================
   "VOCÊ JÁ VIVEU ISSO?" — cards de micro-histórias
   Cada história é um card com borda sutil e ícone.
   ================================================ */

.pain-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6) var(--space-6) var(--space-6) var(--space-8);
  position: relative;
  transition: border-color var(--transition-base);
}

.pain-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--space-6);
  bottom: var(--space-6);
  width: 3px;
  background: var(--gradient-cta);
  border-radius: var(--radius-full);
}

.pain-card:hover {
  border-color: var(--border-accent);
}

.pain-card p:first-child {
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.pain-card p:last-child {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.pain-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

### 3.4 Prova Social — Screenshots Grid

```css
/* ================================================
   SCREENSHOTS DE RECRUTADORES

   Layout: Grid estático de 2 colunas (desktop), 1 (mobile).
   NÃO carrossel — a copy já definiu isso.

   Cada screenshot fica dentro de um "device frame"
   simulando uma tela de celular (iPhone-like).
   ================================================ */

.social-proof-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 640px) {
  .social-proof-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Device Frame (celular simulado) */
.screenshot-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
}

.screenshot-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Header do "dispositivo" — simula barra de status */
.screenshot-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

.screenshot-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.screenshot-card__header-text {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

/* Imagem do screenshot */
.screenshot-card__image {
  width: 100%;
  display: block;
  aspect-ratio: auto;
}

/* Contexto abaixo do screenshot */
.screenshot-card__context {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.screenshot-card__context-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: var(--space-2);
}

.screenshot-card__context-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}
```

**HTML de referência para cada screenshot:**

```html
<div class="screenshot-card">
  <div class="screenshot-card__header">
    <span class="screenshot-card__dot"></span>
    <span class="screenshot-card__dot"></span>
    <span class="screenshot-card__dot"></span>
    <span class="screenshot-card__header-text">LinkedIn Messages</span>
  </div>
  <img class="screenshot-card__image" src="screenshot-1.webp" alt="Mensagem de recrutadora multinacional" loading="lazy">
  <div class="screenshot-card__context">
    <span class="screenshot-card__context-label">Contexto</span>
    <p class="screenshot-card__context-text">
      Esta mensagem chegou 11 dias depois do ajuste no perfil. Recrutadora de multinacional buscando Engenheiro Sênior.
    </p>
  </div>
</div>
```

### 3.5 Stack de Valor (Value Table)

```css
/* ================================================
   STACK DE VALOR — tabela com itens e valores
   Estilo: lista vertical com valor à direita.
   Itens individuais parecem "line items" de invoice.
   ================================================ */

.value-stack {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.value-stack__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  transition: background-color var(--transition-fast);
}

.value-stack__item:last-child {
  border-bottom: none;
}

.value-stack__item:hover {
  background-color: var(--bg-surface-hover);
}

/* Item principal (ebook completo) */
.value-stack__item--primary {
  background-color: var(--bg-surface);
  padding-block: var(--space-5);
}

.value-stack__item--primary .value-stack__label {
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* Bônus items */
.value-stack__item--bonus {
  background-color: var(--accent-primary-muted);
}

.value-stack__item--bonus .value-stack__label::before {
  content: '🎁 ';
}

.value-stack__label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  flex: 1;
}

.value-stack__label strong {
  color: var(--text-primary);
  display: block;
  font-size: var(--text-base);
  margin-bottom: var(--space-1);
}

.value-stack__price {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* Linha de total */
.value-stack__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  background: var(--bg-surface);
  border-top: 2px solid var(--border-strong);
}

.value-stack__total-label {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.value-stack__total-price {
  font-family: var(--font-mono);
  font-weight: var(--weight-bold);
  color: var(--danger);
  text-decoration: line-through;
  font-size: var(--text-lg);
}
```

### 3.6 Pricing Card

```css
/* ================================================
   PRICING CARD — O centro de conversão.
   Card flutuante com glow accent, preço grande,
   âncora riscada, e CTA integrado.
   ================================================ */

.pricing-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  text-align: center;
  position: relative;
  overflow: hidden;
  max-width: 520px;
  margin-inline: auto;
}

/* Glow sutil no topo */
.pricing-card::before {
  content: '';
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 160px;
  background: radial-gradient(ellipse, var(--accent-glow), transparent 70%);
  pointer-events: none;
}

.pricing-card__eyebrow {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: var(--space-4);
}

.pricing-card__anchor {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  text-decoration: line-through;
  text-decoration-color: var(--danger);
  text-decoration-thickness: 2px;
  margin-bottom: var(--space-2);
}

.pricing-card__price {
  font-family: var(--font-mono);
  font-size: var(--text-5xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.pricing-card__price-currency {
  font-size: 0.5em;
  vertical-align: super;
  color: var(--text-secondary);
}

.pricing-card__installments {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.pricing-card__daily {
  font-size: var(--text-sm);
  color: var(--accent-primary);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-8);
  padding: var(--space-2) var(--space-4);
  background: var(--accent-primary-muted);
  border-radius: var(--radius-full);
  display: inline-block;
}

/* CTA dentro do pricing */
.pricing-card .btn-cta {
  max-width: 100%;
  margin-bottom: var(--space-4);
}
```

### 3.7 Garantia Badge

```css
/* ================================================
   GARANTIA — Badge/card com ícone de escudo
   Visual: confiança, segurança, sem risco.
   ================================================ */

.guarantee {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.15);
  border-radius: var(--radius-lg);
  max-width: 520px;
  margin-inline: auto;
  margin-top: var(--space-6);
}

.guarantee__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.guarantee__title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--success);
  margin-bottom: var(--space-2);
}

.guarantee__text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}
```

### 3.8 Seção do Autor

```css
/* ================================================
   SOBRE O AUTOR — Foto + Bio + Logos de empresas
   Layout: Horizontal em desktop, vertical em mobile.
   ================================================ */

.author {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  text-align: center;
}

@media (min-width: 768px) {
  .author {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
  }
}

/* Foto circular com borda accent */
.author__photo-wrapper {
  flex-shrink: 0;
  position: relative;
}

.author__photo {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-accent);
  box-shadow: var(--shadow-glow);
}

/* Badge de verificação */
.author__verified {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: var(--gradient-cta);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 2px solid var(--bg-base);
}

.author__info {
  flex: 1;
}

.author__name {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.author__title {
  font-size: var(--text-base);
  color: var(--accent-primary);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-4);
}

.author__bio {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

/* Credentials - mini badges */
.author__credentials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-6);
}

@media (min-width: 768px) {
  .author__credentials {
    justify-content: flex-start;
  }
}

.credential-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

/* Logos de empresas */
.author__logos {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex-wrap: wrap;
  justify-content: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

@media (min-width: 768px) {
  .author__logos {
    justify-content: flex-start;
  }
}

.author__logos img {
  height: 24px;
  width: auto;
  opacity: 0.5;
  filter: grayscale(100%) brightness(2);
  transition: opacity var(--transition-base);
}

.author__logos img:hover {
  opacity: 0.8;
}
```

**HTML de referência:**

```html
<div class="author">
  <div class="author__photo-wrapper">
    <img class="author__photo" src="gustavo-foto.webp" alt="Gustavo André Silva Pereira">
    <span class="author__verified">✓</span>
  </div>
  <div class="author__info">
    <h3 class="author__name">Gustavo André Silva Pereira</h3>
    <p class="author__title">Engenheiro Eletricista | 18+ anos em projetos EPC</p>
    <div class="author__credentials">
      <span class="credential-badge">18+ anos</span>
      <span class="credential-badge">4 países</span>
      <span class="credential-badge">Projetos multimilionários</span>
      <span class="credential-badge">Criador do Engenharia Detalhada</span>
    </div>
    <p class="author__bio">
      De zero mensagens de recrutadores para dezenas por semana.
      Não ensina teoria — compartilha exatamente o que funciona na prática.
    </p>
    <div class="author__logos">
      <img src="logo-ge.svg" alt="GE Vernova">
      <img src="logo-abb.svg" alt="ABB">
      <img src="logo-vale.svg" alt="Vale">
      <img src="logo-hatch.svg" alt="Hatch">
      <img src="logo-snc.svg" alt="SNC-Lavalin">
    </div>
  </div>
</div>
```

### 3.9 FAQ Accordion

```css
/* ================================================
   FAQ — Accordion puro CSS (details/summary)
   Sem JS. Animação suave com grid trick.
   ================================================ */

.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: var(--container-narrow);
  margin-inline: auto;
}

.faq-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-base);
}

.faq-item[open] {
  border-color: var(--border-accent);
}

.faq-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-5);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: color var(--transition-fast);
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: '+';
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  transition: transform var(--transition-base), color var(--transition-base);
}

.faq-item[open] summary::after {
  content: '−';
  color: var(--accent-primary);
  transform: rotate(0deg);
}

.faq-item summary:hover {
  color: var(--accent-primary);
}

/* Conteúdo expandido — grid trick para animação */
.faq-item__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--transition-slow);
}

.faq-item[open] .faq-item__content {
  grid-template-rows: 1fr;
}

.faq-item__content-inner {
  overflow: hidden;
}

.faq-item__content p {
  padding: 0 var(--space-5) var(--space-5);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}
```

**HTML de referência:**

```html
<details class="faq-item">
  <summary>"Funciona para minha área ou só para engenharia?"</summary>
  <div class="faq-item__content">
    <div class="faq-item__content-inner">
      <p>O método funciona para qualquer profissional buscado por recrutadores via palavras-chave...</p>
    </div>
  </div>
</details>
```

**Nota:** A animação com `grid-template-rows` funciona nativamente em navegadores modernos. Para o `<details>` animar corretamente a abertura/fechamento, é necessário um snippet mínimo de JS (12 linhas) que intercepta o toggle e anima. Alternativa: sem animação, o `<details>` funciona 100% sem JS.

---

## 4. MICRO-INTERACOES (CSS Only)

```css
/* ================================================
   SCROLL REVEAL — Elementos aparecem ao scrollar
   Usa IntersectionObserver (JS mínimo) + CSS transitions.
   ================================================ */

/* Estado inicial: invisível e deslocado */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Delays escalonados para grid items */
.reveal:nth-child(2) { transition-delay: 80ms; }
.reveal:nth-child(3) { transition-delay: 160ms; }
.reveal:nth-child(4) { transition-delay: 240ms; }

/* Estado final: visível */
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ================================================
   HOVER EFFECTS
   ================================================ */

/* Links no body text */
a:not(.btn-cta) {
  color: var(--accent-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(64, 153, 255, 0.3);
  transition: text-decoration-color var(--transition-fast);
}

a:not(.btn-cta):hover {
  text-decoration-color: var(--accent-primary);
}

/* Highlight text (negritos dentro de parágrafos de dor) */
.highlight {
  background: linear-gradient(transparent 60%, var(--accent-primary-muted) 60%);
  padding-inline: 2px;
}

/* Número animado do preço (pulso sutil) */
@keyframes price-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.pricing-card__price {
  animation: price-pulse 3s ease-in-out infinite;
}
```

### JS Mínimo (IntersectionObserver — 8 linhas)

```html
<script>
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
</script>
```

---

## 5. MOBILE-FIRST & RESPONSIVE

```css
/* ================================================
   STICKY CTA — Aparece após scroll do hero
   Barra fixa no bottom com CTA compacto.
   ================================================ */

.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background: rgba(10, 11, 15, 0.95);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-top: 1px solid var(--border-subtle);
  padding: var(--space-3) var(--container-px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  transform: translateY(100%);
  transition: transform var(--transition-slow);
}

.sticky-cta.is-visible {
  transform: translateY(0);
}

.sticky-cta .btn-cta {
  min-height: 48px;
  max-width: 360px;
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-6);
}

.sticky-cta__price {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  display: none;
}

@media (min-width: 640px) {
  .sticky-cta__price {
    display: block;
  }
}

/* Esconder sticky CTA em desktop largo (desnecessário) */
@media (min-width: 1024px) {
  .sticky-cta {
    display: none;
  }
}

/* ================================================
   BREAKPOINTS
   ================================================ */

/* Mobile: 0 - 639px (base styles, já mobile-first) */

/* Tablet: 640px+ */
@media (min-width: 640px) {
  .pain-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}

/* Desktop: 768px+ */
@media (min-width: 768px) {
  .heading-hero {
    text-align: center;
  }

  .subheadline {
    margin-inline: auto;
    text-align: center;
  }

  .pre-headline {
    text-align: center;
  }

  .cta-block {
    align-items: center;
  }
}

/* Desktop Large: 1024px+ */
@media (min-width: 1024px) {
  .social-proof-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-8);
  }
}

/* Touch targets (sempre) */
@media (pointer: coarse) {
  .btn-cta {
    min-height: 56px;
  }

  .faq-item summary {
    min-height: 56px;
  }

  a, button, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### JS Mínimo para Sticky CTA (8 linhas)

```html
<script>
  const stickyCta = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.section--hero');
  if (stickyCta && hero) {
    const stickyObs = new IntersectionObserver(([e]) => {
      stickyCta.classList.toggle('is-visible', !e.isIntersecting);
    }, { threshold: 0 });
    stickyObs.observe(hero);
  }
</script>
```

---

## 6. SEÇÃO-POR-SEÇÃO: LAYOUT MAP

Ordem exata seguindo a copy consolidada (Cabeça-Corpo-Pernas):

```
┌─────────────────────────────────────────────────────┐
│  HERO (section--lg, gradient-hero background)       │
│  ┌─────────────────────────────────────────┐        │
│  │  .pre-headline (uppercase, accent)      │        │
│  │  .heading-hero (headline DSOD)          │        │
│  │  .subheadline (max-width: 640px)        │        │
│  │  .cta-block (botão + subtext)           │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  DOR (section, container--narrow)                   │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "Confere se..."       │        │
│  │  .pain-grid (5 pain-cards, 1col→2col)   │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  VERDADE (section--elevated, container--narrow)     │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "A verdade que..."    │        │
│  │  body-text com metáfora do restaurante  │        │
│  │  .highlight nos termos técnicos         │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  ORIGIN STORY (section, container--narrow)          │
│  ┌─────────────────────────────────────────┐        │
│  │  Narrativa em prosa (body-text)         │        │
│  │  Itálicos para pensamentos internos     │        │
│  │  Bold para momentos de virada           │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  FUTURE PACING (section--elevated)                  │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "Imagine daqui a..."  │        │
│  │  body-text com cenário positivo         │        │
│  │  .cta-block (CTA secundário)            │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  PROVA SOCIAL (section, container--wide)            │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "Eu poderia te..."    │        │
│  │  .social-proof-grid (2x2 screenshots)   │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  STACK DE VALOR (section--elevated)                 │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "O que você recebe"   │        │
│  │  .value-stack (line items)              │        │
│  │  .cta-block (CTA terciário)             │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  AUTOR (section, container)                         │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "Quem é Gustavo..."   │        │
│  │  .author (foto + bio + logos)           │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  PRICING + GARANTIA (section--lg, container)        │
│  ┌─────────────────────────────────────────┐        │
│  │  .pricing-card                          │        │
│  │    ├── eyebrow "POR APENAS"             │        │
│  │    ├── anchor "R$ 729" (riscado)        │        │
│  │    ├── price "R$ 59,90"                 │        │
│  │    ├── installments "3x R$ 19,97"       │        │
│  │    ├── daily "< R$ 0,17/dia"            │        │
│  │    └── btn-cta                          │        │
│  │  .guarantee (badge com escudo)          │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  FAQ (section--elevated, container--narrow)          │
│  ┌─────────────────────────────────────────┐        │
│  │  .heading-section "Perguntas..."        │        │
│  │  .faq-list (6 details/summary)          │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  PS + CTA FINAL (section, container--narrow)        │
│  ┌─────────────────────────────────────────┐        │
│  │  PS e PPS (body-text, itálico)          │        │
│  │  .cta-block (CTA final)                 │        │
│  └─────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────┤
│  STICKY CTA (fixed, mobile only)                    │
│  ┌─────────────────────────────────────────┐        │
│  │  Preço + btn-cta compacto               │        │
│  └─────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## 7. CHECKLIST DE QUALIDADE PREMIUM

Antes de considerar a LP pronta, validar:

- [ ] **Espaçamento:** Nenhuma seção com padding > 96px. Média ideal: 48-80px.
- [ ] **Cores:** Nenhuma cor saturada pura (#0000FF, #FF0000). Tudo dessaturado e sofisticado.
- [ ] **Grain/Noise:** Overlay visível mas sutil (opacity 0.025).
- [ ] **Tipografia:** Inter carregada com font-display: swap. Sem FOUT perceptível.
- [ ] **Mobile:** Hero headline + CTA visíveis sem scroll (above the fold).
- [ ] **Touch:** Todos os botões >= 48px de altura. FAQ summaries >= 56px.
- [ ] **Screenshots:** Imagens em .webp, lazy loaded, com alt descritivo.
- [ ] **CTA:** Texto orientado ao desejo, não à transação ("QUERO SER ENCONTRADO", não "COMPRAR").
- [ ] **Performance:** Sem JS frameworks. Dois scripts inline (8 linhas cada). CSS < 15KB minificado.
- [ ] **Contrast:** Texto primary (#f0f0f3) sobre bg-base (#0a0b0f) = ratio 16:1+ (WCAG AAA).
- [ ] **Sem cara de IA:** Detalhes artesanais — border-left nos pain cards, gradient dividers, glow sutil.

---

*Spec gerada por @brad-frost (Design Systems) via Design Chief routing*
*Data: 2026-03-27*
