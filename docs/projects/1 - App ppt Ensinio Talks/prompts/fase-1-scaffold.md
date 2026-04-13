# 🏗️ Prompt — Fase 1: Scaffold

> **Objetivo:** Gerar o esqueleto vazio do app com navegação e componentes. SEM conteúdo real.
> **Onde colar:** Google AI Studio, em projeto novo chamado `ensinio-talks-fosc`.
> **Tempo esperado:** 30 min para gerar + validar.

---

## ▶️ Instruções de Uso

1. Abra https://aistudio.google.com
2. Crie um **novo projeto** em modo "Build"
3. Nomeie como `ensinio-talks-fosc`
4. Copie TUDO entre os banners abaixo (do primeiro ao segundo)
5. Cole no AI Studio e aguarde a geração
6. Valide com a [Checklist da Fase 1](../checklists/01-fase-1-scaffold.md)

---

```
════════════════════════════════════════════════════════════
          COPIAR A PARTIR DAQUI ⬇
════════════════════════════════════════════════════════════

Crie um web app de apresentação interativa ("slide deck web") em
React + Vite + TailwindCSS + TypeScript, sem backend, totalmente
client-side.

⚠️ REGRA INEGOCIÁVEL — TOKENIZAÇÃO PRIMEIRO

Antes de qualquer componente, você DEVE criar um sistema de design
tokens centralizado. Esse sistema é a ÚNICA fonte de verdade para
cores, tipografia, espaçamentos, raios, sombras e animações. Nenhum
componente pode hardcodar valores — todos devem consumir tokens.

ARQUIVO OBRIGATÓRIO: src/tokens/design-tokens.ts

Deve exportar objetos tipados com TODAS as decisões de design abaixo:

```typescript
export const colors = {
  bg: {
    primary: '#0a0a0a',      // background principal
    secondary: '#141414',    // cards, bloco de código
    tertiary: '#1f1f1f',     // hover states
  },
  text: {
    primary: '#ffffff',      // títulos, corpo principal
    secondary: '#a1a1aa',    // subtítulos, legendas
    muted: '#71717a',        // texto desabilitado
  },
  accent: {
    primary: '#f59e0b',      // amber principal (destaques)
    hover: '#fbbf24',        // hover amber
    glow: 'rgba(245, 158, 11, 0.3)', // sombra amber
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.2)',
    accent: '#f59e0b',
  },
} as const;

export const typography = {
  fontFamily: {
    heading: "'Montserrat', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
  5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem',
  16: '4rem', 20: '5rem', 24: '6rem', 32: '8rem', 40: '10rem',
  48: '12rem', 64: '16rem',
} as const;

export const radii = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  amberGlow: '0 0 40px rgba(245, 158, 11, 0.4)', // signature
  amberGlowSoft: '0 0 20px rgba(245, 158, 11, 0.2)',
} as const;

export const transitions = {
  fast: '150ms ease-out',
  base: '250ms ease-out',
  slow: '400ms ease-out',
  bounce: '400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  overlay: 1000,
  modal: 2000,
  tooltip: 3000,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
```

CONFIG TAILWIND OBRIGATÓRIO

O tailwind.config.ts DEVE importar os tokens acima e usá-los em
theme.extend. Nenhum valor pode ser hardcodado no Tailwind config.
Exemplo:

```typescript
import { colors, typography, spacing, radii, shadows } from './src/tokens/design-tokens';

export default {
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        text: colors.text,
        accent: colors.accent,
        // ... todos os tokens
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      spacing,
      borderRadius: radii,
      boxShadow: shadows,
    },
  },
};
```

REGRAS DE USO DOS TOKENS (aplicáveis a TODOS os componentes):

1. NUNCA hardcodar valores de cor, tamanho, espaçamento ou sombra
   em componentes. SEMPRE usar classes Tailwind que referenciam
   tokens OU importar direto de design-tokens.ts.
2. Exemplo ERRADO: <div className="bg-[#0a0a0a] p-4">
   Exemplo CERTO: <div className="bg-bg-primary p-4">
3. Animações customizadas devem usar as durations de transitions.
4. Gradients amber devem usar colors.accent.primary, nunca #f59e0b literal.
5. Z-indexes sempre via constant zIndex, nunca números soltos.

REQUISITOS DE NAVEGAÇÃO:
- Setas ← → para navegar entre slides
- Tecla Esc abre menu lateral com índice de todos os slides
- Tecla F ativa fullscreen
- Tecla Home volta ao primeiro slide, End vai ao último
- Barra de progresso fina no topo mostrando posição atual
- URL hash sincroniza com slide atual (#slide-3-2) para voltar
  direto de qualquer lugar ao recarregar a página

REQUISITOS DE LAYOUT E VISUAL (todos via tokens):
- Dark mode por padrão — use colors.bg.primary
- Accent — use colors.accent.primary (amber)
- Títulos — fontFamily.heading (Montserrat bold)
- Corpo — fontFamily.body (Inter regular)
- Cada "Ato" tem um slide-divisor grande com gradient amber sutil
  usando colors.accent.primary com opacity
- Slides normais têm layout: título grande no topo, conteúdo
  central, área de mídia à direita ou abaixo
- Responsivo: funciona em notebook, projetor e TV

COMPONENTES REUTILIZÁVEIS (crie todos prontos pra usar na Fase 2,
TODOS consumindo tokens):

1. <PromptBox code="..." language="..." />
   Bloco de código monospace com botão "Copiar" no canto. Highlight
   amber suave nos backticks.

2. <Carousel items={[{src, caption}]} />
   Slider horizontal de imagens com setas de navegação.

3. <VideoPlayer src="..." caption="..." />
   Player de vídeo embutido com controles nativos.

4. <ImageCard src="..." caption="..." align="left|center|right" />
   Imagem com legenda abaixo.

5. <DiagramPlaceholder number={X} title="..." />
   Caixa retangular grande com gradient amber, borda fina branca,
   mostrando "DIAGRAMA #X" em cima e o título no centro. Será
   substituída por imagem real na Fase 3.

6. <SpeechBubble>...</SpeechBubble>
   Bloco de citação estilo fala do palestrante: borda esquerda
   amber grossa, texto em itálico, ícone 💬 no início.

7. <ActDivider number={X} title="..." subtitle="..." />
   Slide de transição entre atos, ocupa tela inteira.

8. <HighlightBox color="amber|green|red">...</HighlightBox>
   Caixa destacada para avisos, dicas ou "aha moments".

9. <ComparisonTable rows={[...]} />
   Tabela comparativa de 2+ colunas com styling premium.

ESTRUTURA INICIAL (8 ATOS VAZIOS):

Crie a navegação com os 8 Atos abaixo. Cada Ato deve ter o
ActDivider + 1 slide placeholder vazio. NÃO preencha conteúdo real.

1. Ato 1 — Abertura & Hook
2. Ato 2 — Mão na Massa
3. Ato 3 — O que é Framework
4. Ato 4 — Hierarquia
5. Ato 5 — Processos
6. Ato 6 — Qualidade
7. Ato 7 — FORGE
8. Ato 8 — Encerramento

REGRAS IMPORTANTES:
- NÃO gere conteúdo real dos slides agora. Só o esqueleto funcional.
- Todos os componentes devem ser exportados de um arquivo components/
  para reuso posterior.
- Use TypeScript com interfaces tipadas nos props.
- O código deve passar em lint e typecheck sem warnings.
- Tudo client-side, zero dependência de API externa em runtime.
- ⚠️ NENHUM componente pode hardcodar valor de design. TODOS devem
  consumir os tokens de src/tokens/design-tokens.ts (seja via
  classes Tailwind que mapeiam pros tokens, seja via import direto).
- Se você criar qualquer valor novo de cor, espaçamento ou tamanho,
  adicione primeiro como token e depois consuma. Nada de "magic values".

ENTREGA ESPERADA:
1. src/tokens/design-tokens.ts completo e tipado
2. tailwind.config.ts consumindo os tokens
3. 9 componentes reutilizáveis em src/components/ (todos usando tokens)
4. 8 Atos com ActDivider + 1 slide placeholder cada
5. Navegação por teclado funcional
6. Zero erro de lint/typecheck

Quero poder navegar pelo app e ver os 8 Atos como placeholders
funcionais. Na próxima fase, eu preencherei o conteúdo de cada
Ato em prompts separados — que vão REUTILIZAR os mesmos tokens,
sem inventar valores novos.

════════════════════════════════════════════════════════════
          FIM DO BLOCO DE CÓPIA ⬆
════════════════════════════════════════════════════════════
```

---

## ✅ Depois de Executar

Abra a [Checklist da Fase 1](../checklists/01-fase-1-scaffold.md) e valide cada item antes de passar pra Fase 2.

Se tudo estiver OK, próximo passo: [Fase 2 — Ato 1](./fase-2-ato-1-abertura.md)
