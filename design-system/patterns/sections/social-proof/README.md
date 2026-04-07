---
name: "Social Proof Patterns"
category: "sections/social-proof"
sources:
  - stripe.com
  - linear.app
  - raycast.com
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

# Social Proof — Padroes Extraidos

Padroes de prova social identificados nos dados extraidos.

---

## 1. Stripe — Logo Carousel (Marquee)

O padrao mais forte de social proof encontrado. Stripe usa um carousel infinito de logos de clientes imediatamente abaixo do hero.

### Estrutura
```css
/* Container do carousel */
.logo-carousel {
  display: block;
  width: 1264px;
  height: 73px;
  /* Posicao: logo abaixo do hero, y: 688px */
}

/* Container do marquee */
.logo-carousel__marquee-container {
  display: flex;
  height: 72px;
}

/* Lista de logos (animada) */
.logo-carousel__marquee {
  display: flex;
  width: 6192px; /* duplicado ~5x para loop infinito */
  height: 72px;
}
```

### Animacao de Scroll
O marquee utiliza duplicacao de conteudo e translacao CSS para criar o efeito de scroll infinito. A largura de 6192px (vs 1264px do container) indica que os logos sao duplicados ~5x.

**Quando usar:** Imediatamente apos o hero section. Funciona como validacao instantanea — "se essas empresas usam, deve ser bom". Ideal para B2B com clientes enterprise reconheciveis.

---

## 2. Raycast — Testimonials com Avatares

Raycast inclui uma secao de testimonials com avatares circulares.

### Avatar Style
```css
.testimonial-avatar {
  display: block;
  width: 48px;
  height: 48px;
  border-radius: 99999px; /* circulo perfeito */
}
```

### Estrutura
Os testimonials aparecem com:
- Avatares de 48px com `border-radius: 99999px`
- Fundo transparente sobre o dark theme
- Font-weight 600 para nomes dos autores

**Quando usar:** Quando voce tem testimonials reais de usuarios. Os avatares circulares criam conexao humana. Melhor para B2C ou comunidades de devs.

---

## 3. Linear — Avatares em Contexto

Linear usa avatares menores dentro de um contexto de uso do produto (Slack messages, issues).

### Avatar Style
```css
.avatar-contextual {
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 6px; /* quadrado arredondado, nao circulo */
}
```

**Nota:** Os avatares de 36px com radius de 6px sugerem integracao com Slack/tools. Nao e social proof classico, mas mostra o produto em uso real.

---

## Padroes NAO Encontrados

Os seguintes padroes de social proof **nao foram identificados** nos dados extraidos:
- **Counter sections** (numeros de clientes, revenue, etc.)
- **Trust badges** (certificacoes, premios)
- **Case study cards** isolados
- **Star ratings**

Vercel e Apple nao possuem social proof explicito nos dados. A Vercel usa showcases de projetos como prova social implicita. Apple depende da propria marca.

---

## CSS Reference — Copy-Paste

### Logo Carousel (Stripe style)
```css
.social-proof-logos {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 72px;
  margin-top: 48px;
}
.social-proof-logos__track {
  display: flex;
  gap: 48px;
  animation: marquee 30s linear infinite;
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Testimonial Card (Raycast style)
```css
.testimonial {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.testimonial__avatar {
  width: 48px;
  height: 48px;
  border-radius: 99999px;
  object-fit: cover;
}
.testimonial__text {
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 400;
}
.testimonial__author {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
}
```

---

## Quando Usar

| Padrao | Quando Usar |
|--------|-------------|
| **Logo Carousel** | B2B SaaS, fintech — quando tem clientes enterprise reconheciveis |
| **Testimonials** | Qualquer produto — humaniza a marca |
| **Avatares em Contexto** | Tools de produtividade — mostra o produto em uso real |

---

# Onda 2 — Social Proof (17 sites)

---

## SaaS & AI

### 6. Anthropic — Logo Marquee

Anthropic implementa um marquee de logos animado (similar ao Stripe).

```css
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
```

**Quando usar:** Mesmo padrão do Stripe — logos de clientes enterprise em scroll infinito. Anthropic valida com "quem usa Claude".

---

### 7. Notion — Bento Cards com Logos de Integrações

Notion exibe logos de integrações (Slack, Google, etc.) dentro de bento cards com sombra suave.

```css
.notion-integration-card {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 18px 0px,
              rgba(0, 0, 0, 0.027) 0px 2.025px 7.85px 0px,
              rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px 0px;
}
```

**Quando usar:** Quando o ecossistema de integrações é um argumento de venda. Os cards com sombra sutil transmitem "funciona com tudo que você já usa".

---

### 8. Loom — Badges de Confiança com Cores

Loom usa badges coloridos para categorias de uso (sales, engineering, etc.) com cores distintas.

```css
.loom-badge {
  background: rgb(233, 242, 254); /* azul claro */
  color: rgb(24, 104, 219);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}
/* Variações: verde, roxo, laranja */
```

**Quando usar:** Quando o produto serve múltiplos públicos. As cores codificam "não é só para devs — é para todos".

---

### 9. Circle — Gradiente Cards de Comunidades

Circle exibe cards de comunidades reais com gradientes pastel, mostrando diversidade de uso.

```css
.circle-community-card {
  background: linear-gradient(rgb(224, 234, 252) 0%, rgb(207, 222, 243) 100%);
  border-radius: 12px;
  box-shadow: rgba(169, 169, 169, 0.08) 0px 4px 8px;
}
```

---

## Brasil Premium

### 10. Nubank — Social Proof Implícito via Números

Nubank não usa logo carousels — a marca fala por si. Social proof via números de clientes (ex: "90 milhões de clientes"). Gradiente sutil de overlay: `linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)`.

---

### 11. Laghetto — Cards de Unidades com Sombra

Laghetto exibe cards de hotéis como social proof implícito (portfólio extenso = confiança).

```css
.laghetto-unit-card {
  border: 1px solid rgba(10, 45, 35, 0.4);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.18) 0px 0px 26px;
}
```

---

### 12. FARM Rio — Grid de Produtos como Social Proof

E-commerce usa o grid de produtos como prova social (volume = legitimidade). Sombra: `rgba(0, 0, 0, 0.05) 0px 1px 2px`.

---

## Padrões NÃO Encontrados (Onda 2)

- **OpenAI, Runway, Superhuman:** Nenhum social proof explícito nos dados — marcas que dependem do reconhecimento próprio
- **Framer, Pitch:** Social proof via showcases de projetos criados com a ferramenta
- **Duck Design, Reino, GMX:** Portfólio de trabalhos substitui testimonials tradicionais
- **Pulso Hotel:** Sem social proof detectado no DOM extraído

---

## Comparação Completa (22 sites)

| Padrão | Sites | Quando Usar |
|--------|-------|-------------|
| **Logo Carousel** | Stripe, Anthropic | B2B SaaS, clientes enterprise reconhecíveis |
| **Testimonials** | Raycast | Qualquer produto — humaniza a marca |
| **Avatares em Contexto** | Linear | Tools de produtividade — uso real |
| **Integration Logos** | Notion | Ecossistema/marketplace de integrações |
| **Community Cards** | Circle, Loom | Plataformas de comunidade/comunicação |
| **Números** | Nubank | Quando a escala é o argumento |
| **Portfólio/Showcases** | Framer, Pitch, Duck, Reino, GMX | Agências e ferramentas criativas |
| **Grid de Produtos** | FARM Rio | E-commerce — volume = legitimidade |
| **Nenhum** | OpenAI, Runway, Superhuman, Vercel, Apple | Marcas que vendem pelo nome |
