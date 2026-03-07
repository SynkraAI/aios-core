# Wireframe Mobile-First — Home Page v3

**Autor:** Uma (@ux-design-expert)
**Data:** 2026-03-07
**Baseado em:** Pesquisa Atlas (`docs/research/2026-03-07-redesign-mobile-conteudo.md`)
**Substitui:** visual-spec-v2.md (secoes 2.1-2.4 apenas — componentes mantem)
**Fidelidade:** Media (layout + conteudo + spacing + breakpoints)

---

## 0. Decisoes de Design

### D-1: Paleta de Cores — Resolucao do Conflito

O Tailwind base.ts define `base-dark: #213B2C` (verde do basetriade.com).
O globals.css sobrescreve para `--base-dark: #2d1810` (marrom do visual spec v2).

**Decisao:** Usar AMBAS como complementares:
- `#213B2C` (verde-floresta) → Navbar, footer background, badges identitarios
- `#2d1810` (marrom-terroso) → Texto corrido, headings, foreground padrao
- `#fef9f0` (creme) → Background principal (mantem)

Isso alinha a identidade visual com basetriade.com sem quebrar o visual spec v2.

**Nova variavel CSS:**
```css
--base-forest: #213B2C;  /* Identidade Base Triade — navbar, footer, badges */
```

### D-2: Mandala — Grid Responsivo (nao circular)

Manter grid 2x2 por praticidade. Mandala circular e iteracao futura.
Corrigir spacing mobile com breakpoints progressivos.

### D-3: Conteudo como Constantes + Override do Banco

Todos os textos ricos sao constantes TypeScript no codigo.
O admin pode sobrescrever via `getSiteContents()`.
A home NUNCA fica vazia.

---

## 1. Navbar (NOVO — P0)

**Componente:** `Navbar` (organismo)
**Posicao:** sticky top, z-50
**Rastreabilidade:** Visual Spec v2 secao 3.7, Pesquisa I-2

### Mobile (<768px)
```
+------------------------------------------+
| [Triskle 28px]  Ciclo das Estacoes  [=]  |
+------------------------------------------+
```
- Altura: 56px
- Fundo: `#fef9f0` com `backdrop-blur-md` (95% opacidade)
- Borda inferior: 1px `#d4a574/20`
- Logo: Triskle SVG 28px + texto "Ciclo das Estacoes" (Playfair 16px)
- Hamburger: 3 linhas, 24px, cor `#2d1810`

**Menu aberto (overlay):**
```
+------------------------------------------+
| [Triskle]  Ciclo das Estacoes       [X]  |
+------------------------------------------+
| Inicio                                    |
| Eventos                                   |
| Sobre                                     |
| Facilitadoras                             |
| FAQ                                       |
| Contato                                   |
+------------------------------------------+
| [ Inscreva-se ]  (full-width, terracota) |
+------------------------------------------+
```
- Links: 16px Inter, padding 12px 16px, hover bg `#d4a574/10`
- CTA: `#D2691E` fundo, branco texto, border-radius 8px

### Desktop (>=768px)
```
+--------------------------------------------------------------+
| [Triskle] Ciclo das Estacoes   Inicio Eventos Sobre FAQ  [CTA] |
+--------------------------------------------------------------+
```
- Altura: 64px
- Links inline com gap 24px
- CTA: "Inscreva-se" ou "Minha Conta" (se logado)

---

## 2. Hero (P1 — Compacto)

**Rastreabilidade:** Visual Spec v2 secao 2.2, corrigido

### Mobile
```
+------------------------------------------+
|    BASE TRIADE — BARRA VELHA, SC         |  <- 10px, uppercase, tracking wide, #8B4513
|                                           |
|      Ciclo das Estacoes                   |  <- Playfair 28px bold, #2d1810
|                                           |
|    Respire. Reconecte. Renasca.           |  <- Inter 16px, #6b5744
|                                           |
|    O primeiro programa de autocuidado     |  <- Inter 13px, #8B4513/70
|    ciclico do Brasil                      |
|                                           |
|         [Mandala 2x2]                     |  <- Ver secao 3
|      Prim    Verao                        |
|      Out     Inv                          |
|         [Triskle centro]                  |
|                                           |
|    [  Conhecer Eventos  ]  full-width     |  <- #D2691E, branco
|    [  Receber Chamado   ]  full-width     |  <- outline #d4a574
+------------------------------------------+
```
- Padding: 48px 16px (top inclui navbar offset)
- `min-height: auto` (NAO 80vh — desperdicava espaco)
- Fundo: `#fef9f0`
- CTAs: `width: 100%` no mobile, `width: auto` no desktop

### Desktop
- Titulo: 48px
- Subtitulo: 20px
- CTAs lado a lado (flex-row)
- Mandala max-width 560px

---

## 3. Mandala — Spacing Responsivo (P0)

**Rastreabilidade:** Visual Spec v2 secao 2.3, corrigido para mobile

### Breakpoints Progressivos
```css
/* Base mobile (<375px) */
.seasons-mandala { gap: 0.75rem; max-width: 320px; padding: 0 0.5rem; }
.season-card { padding: 0.75rem 0.5rem; }
.season-card emoji { font-size: 1.5rem; }  /* 24px */
.season-card nome { font-size: 0.8125rem; }  /* 13px */
.season-card info { font-size: 0.625rem; }   /* 10px */

/* sm (>=375px) */
.seasons-mandala { gap: 1rem; max-width: 380px; }
.season-card { padding: 1rem 0.75rem; }
.season-card emoji { font-size: 1.75rem; }  /* 28px */
.season-card nome { font-size: 0.875rem; }  /* 14px */

/* md (>=768px) */
.seasons-mandala { gap: 1.25rem; max-width: 480px; }
.season-card { padding: 1.5rem 1rem; border-radius: 0.75rem; }
.season-card emoji { font-size: 2rem; }  /* 32px */
.season-card nome { font-size: 1rem; }   /* 16px */

/* lg (>=1024px) */
.seasons-mandala { gap: 1.5rem; max-width: 560px; }
.season-card { padding: 2rem 1.5rem; border-radius: 1rem; }
.season-card emoji { font-size: 2.5rem; }  /* 40px */

/* Triskle centro */
mobile: 36px, opacity 0.5
desktop: 56px, opacity 0.6
```

**Conteudo de cada card (simplificado no mobile):**
- Mobile: emoji + nome + elemento/orgao (3 linhas)
- Desktop: emoji + nome + elemento/orgao + proximo evento (4 linhas)

---

## 4. Sobre o Programa (P0)

### Mobile
```
+------------------------------------------+
|  RESGATAR A HARMONIA ENTRE                |  <- 10px uppercase #8B4513
|  HUMANIDADE E NATUREZA                    |
|                                           |
|  Sobre o Programa                         |  <- Playfair 22px #2d1810
|                                           |
|  O equinocio da primavera simboliza o     |  <- Inter 14px #6b5744
|  renascimento da natureza, o equilibrio   |    leading-relaxed
|  entre luz e sombra, e o florescer de     |    max-width 640px
|  novos ciclos...                          |
|                                           |
|  Voltado para terapeutas holisticos,      |  <- Inter 14px #6b5744
|  facilitadores de bem-estar, praticantes  |
|  de yoga — aberto a todos.               |
+------------------------------------------+
```
- Padding: 48px 16px
- Texto centralizado
- 2 paragrafos com mt-4 entre eles

---

## 5. Propositos da Vivencia (P0)

### Mobile
```
+------------------------------------------+
|  Propositos da Vivencia                   |  <- Playfair 22px #8B4513
|  O que cada jornada desperta em voce      |  <- 13px #6b5744
|                                           |
|  +--------------------------------------+|
|  | [emoji] Autoconhecimento             ||  <- purpose-card
|  |   Yoga como ferramenta de            ||
|  |   reconexao corpo-mente...           ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  | [emoji] Forca Interna                ||
|  |   Fortalecimento da autonomia...     ||
|  +--------------------------------------+|
|  ... (6 cards total)                      |
+------------------------------------------+
```

### Layout por breakpoint
- Mobile: 1 coluna, cards com `flex gap-3` (icone + texto lado a lado)
- sm (>=375px): 1 coluna
- md (>=768px): 2 colunas
- lg (>=1024px): 3 colunas

### Card (purpose-card)
- Layout: flex horizontal (icone 32px + div com titulo + texto)
- Borda: 1px `#e8ddd0`
- Fundo: branco
- Padding: 12px mobile, 16px desktop
- Titulo: Inter 14px semibold `#2d1810`
- Texto: Inter 12px `#6b5744` (mobile), 13px (desktop)

---

## 6. Programacao Tipica (P1)

### Mobile
```
+------------------------------------------+
|  EXEMPLO DE UMA JORNADA                   |  <- 10px uppercase #8B4513
|  Programacao Tipica                       |  <- Playfair 22px #2d1810
|  Baseada na Jornada Renascenca            |  <- 13px #6b5744
|                                           |
|  | 07:15  Credenciamento                  |  <- timeline vertical
|  |   Abertura e acolhimento               |
|  |                                        |
|  | 08:00  Acolhimento                     |
|  |   Infusao de ervas e circulo           |
|  |   de intencao                          |
|  |                                        |
|  | 08:30  Yoga Solar                      |
|  |   Hatha Vinyasa para honrar            |
|  |   o astro-rei                          |
|  ... (9 items total)                      |
|                                           |
|  * Programacao varia conforme a estacao   |  <- 11px #6b5744 italic
+------------------------------------------+
```

### Timeline Component (timeline-item)
- Borda esquerda: 2px solid `#d4a574`
- Dot: 8px circulo `#8B4513` (absolute left -5px)
- Padding-left: 24px mobile, 32px desktop
- Hora: Inter 13px semibold `#8B4513`
- Titulo: Inter 14px semibold `#2d1810`
- Descricao: Inter 12px `#6b5744`
- Ultimo item: borda transparente

---

## 7. Proximos Eventos (P0 — ja existe, ajustar)

### Ajustes Mobile
- Grid: 1 coluna mobile, 2 tablet, 3-4 desktop
- Card gap: 12px mobile, 16px tablet, 24px desktop
- Quando sem eventos: card de "Em breve" com CTA para lead form

---

## 8. Facilitadoras (P0)

### Mobile
```
+------------------------------------------+
|  Facilitadoras e Terapeutas               |  <- Playfair 22px #8B4513
|  Profissionais que conduzem as vivencias  |  <- 13px #6b5744
|                                           |
|  +--------------------------------------+|
|  |     [LA]  (avatar 48px)              ||  <- iniciais, bg #d4a574/15
|  |   Lionara Artn                       ||  <- 14px semibold
|  |   Yoga                               ||  <- 12px #8B4513
|  |   Formada em Hatha Vinyasa...        ||  <- 12px #6b5744
|  +--------------------------------------+|
|  ... (6 cards total)                      |
+------------------------------------------+
```

### Layout por breakpoint
- Mobile: 1 coluna (cards compactos, avatar + info horizontal)
- md: 2 colunas (cards verticais, avatar centralizado)
- lg: 3 colunas

### Card Variante Mobile (compacto)
```
+--------------------------------------+
| [Avatar 48px]  Nome                   |
|                Papel                  |
|                Bio truncada (100ch)   |
+--------------------------------------+
```

### Card Variante Desktop (vertical)
```
+------------------+
|     [Avatar]     |
|      Nome        |
|      Papel       |
|   Bio completa   |
+------------------+
```

---

## 9. Depoimentos (ja existe — manter)

Ajuste: padding `p-4` no mobile (era `p-6`).

---

## 10. FAQ (P0)

### Mobile
```
+------------------------------------------+
|  Perguntas Frequentes                     |  <- Playfair 22px #2d1810
|                                           |
|  +--------------------------------------+|
|  | O que esta incluido?            [v]  ||  <- details/summary
|  +--------------------------------------+|
|  +--------------------------------------+|
|  | Posso levar criancas?           [v]  ||
|  +--------------------------------------+|
|  ... (6 items)                            |
+------------------------------------------+
```

### Componente (faq-item)
- Container: rounded-lg, borda 1px `#e8ddd0`, bg branco
- Summary: padding 12px 16px, Inter 14px semibold, cursor pointer
- Seta: `#d4a574`, rotate 180 quando aberto
- Conteudo: borda-top 1px `#e8ddd0`, padding 12px 16px, Inter 13px `#6b5744`
- Gap entre items: 8px

---

## 11. Politica de Cancelamento (P1)

### Mobile
```
+------------------------------------------+
|  Politica de Cancelamento                 |
|                                           |
|  +--------------------------------------+|
|  | +15 dias     | 80% reembolso         ||
|  | 7-14 dias    | 50% reembolso         ||
|  | <7 dias      | Sem reemb., transfere ||
|  | No-show      | Sem reembolso         ||
|  | Intemperie   | Credito ou 80%        ||
|  +--------------------------------------+|
|                                           |
|  Transferencia sempre permitida sem custo |
+------------------------------------------+
```

- Tabela responsiva com `overflow-x: auto` se necessario
- Celulas: padding 12px 16px, Inter 13px
- Header: bg `#fef9f0`, uppercase 11px `#8B4513`

---

## 12. Lead Capture (ja existe — manter)

Ajuste: titulo "Receba o Chamado das Estacoes" (manter).

---

## 13. Informacoes Praticas (P1)

### Mobile
```
+------------------------------------------+
|  Informacoes Praticas                     |
|                                           |
|  +--------------------------------------+|
|  | Local                                ||
|  | Base Triade — Barra Velha, SC        ||
|  | Estacionamento gratuito              ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  | Contato                              ||
|  | contato@basetriade.com               ||
|  | WhatsApp: (47) 99241-4009            ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  | Facilitadoras Principais             ||
|  | @podprana  @koch.milenar             ||
|  +--------------------------------------+|
+------------------------------------------+
```

- 1 coluna mobile, 3 colunas desktop
- Cards: borda `#e8ddd0`, bg branco, padding 16px

---

## 14. Spacing System — Mobile-First

### Section Padding (`.section-padding`)
```css
/* Mobile default */    padding: 40px 16px;
/* sm (>=375px) */      padding: 40px 16px;
/* md (>=768px) */      padding: 56px 24px;
/* lg (>=1024px) */     padding: 80px 32px;
```

### Inter-Section Divider
- `SacredDivider` entre secoes principais (manter)
- Alternancia: `variant="line"` e `variant="sacred"`

---

## 15. Ordem Final das Secoes

| # | Secao | Prioridade | Componente | Dados |
|---|-------|-----------|------------|-------|
| 0 | Navbar | P0 | NOVO | Estatico |
| 1 | Hero | P1 | Redesign | Estatico + DB override |
| 2 | Mandala | P0 | Fix CSS | Estatico |
| 3 | Sobre | P0 | NOVO | Estatico + DB override |
| 4 | Propositos | P0 | NOVO | Estatico (6 items) |
| 5 | Programacao | P1 | NOVO | Estatico (9 items) |
| 6 | Eventos | P0 | Ajuste | Dinamico (DB) |
| 7 | Facilitadoras | P0 | NOVO | Estatico (6 items) |
| 8 | Depoimentos | - | Ajuste | Dinamico (DB) |
| 9 | FAQ | P0 | NOVO | Estatico (6 items) |
| 10 | Cancelamento | P1 | NOVO | Estatico (5 regras) |
| 11 | Lead Capture | - | Manter | Dinamico |
| 12 | Info Praticas | P1 | NOVO | Estatico |

---

## 16. Proximo Passo

Este wireframe serve como input para:
```
@sm *draft → Story E5.1 com ACs baseados neste wireframe
@po *validate → GO/NO-GO
@dev *develop → Implementar
```

---

*— Uma, desenhando com empatia*
