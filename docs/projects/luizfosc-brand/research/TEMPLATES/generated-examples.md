# Inventário de Exemplos Gerados

> Todos os outputs visuais já existentes no ecossistema, com paths reais e status.

---

## Landing Pages

### Ensinio Founders (4 variações + 1 incompleta)

| Variação | Path | Formato | Tamanho | Standalone? |
|----------|------|---------|---------|-------------|
| Carbon Steel | `~/CODE/Projects/landing-pages/ensinio-founders/carbon-steel/index.html` | HTML | 42 KB | Sim (Google Fonts CDN) |
| Ensinio Official | `~/CODE/Projects/landing-pages/ensinio-founders/ensinio-official/index.html` | HTML | 43 KB | Sim |
| Minimal Sand | `~/CODE/Projects/landing-pages/ensinio-founders/minimal-sand/index.html` | HTML | 42 KB | Sim |
| SaaS Modern | `~/CODE/Projects/landing-pages/ensinio-founders/saas-modern/index.html` | HTML | 42 KB | Sim |
| Emerald AI | `~/CODE/Projects/landing-pages/ensinio-founders/emerald-ai/` | — | Vazio | HTML ausente |
| PDF Export | `~/CODE/Projects/landing-pages/ensinio-founders/ensinio-founders-emerald-ai.pdf` | PDF | 1.5 MB | — |
| Source brief | `~/CODE/Projects/landing-pages/ensinio-founders/ensinio-founders.md` | Markdown | 7.5 KB | — |

### LinkedIn Invisível (2 variações + assets)

| Variação | Path | Formato | Tamanho | Standalone? |
|----------|------|---------|---------|-------------|
| LP completa | `squads/copywriting-squad/output/lp-linkedin-invisivel.html` | HTML | 31 KB | Sim (CDN deps) |
| LP Final (dark) | `squads/copywriting-squad/output/lp-final/index.html` | HTML | 30 KB | Sim (precisa pasta assets/) |
| LP Final (light) | `squads/copywriting-squad/output/lp-final/index-light.html` | HTML | 30 KB | Sim (precisa pasta assets/) |
| Assets (18 imagens) | `squads/copywriting-squad/output/lp-final/assets/` | JPG/PNG/WebP | ~1.2 MB | — |

### Documentos de Copy/Design de LP

| Documento | Path | Tamanho |
|-----------|------|---------|
| Design Spec (@brad-frost) | `squads/copywriting-squad/output/lp-linkedin-invisivel-DESIGN-SPEC.md` | 43 KB |
| Copy Consolidado | `squads/copywriting-squad/output/lp-linkedin-invisivel-CONSOLIDADO.md` | 19 KB |
| Source Markdown | `squads/copywriting-squad/output/lp-linkedin-invisivel-source.md` | 13 KB |
| Versão Gustavo Pereira | `squads/copywriting-squad/output/lp-linkedin-invisivel-gustavo-pereira.md` | 21 KB |
| Hormozi Hooks | `squads/copywriting-squad/output/hormozi-hooks-landing.md` | 8.6 KB |
| Hub IA Político | `squads/copywriting-squad/output/landing-page-hub-ia-politico.md` | 17 KB |
| Cialdini Audit | `squads/copywriting-squad/output/cialdini-audit.md` | 17 KB |
| Ladeira BR Adaptation | `squads/copywriting-squad/output/ladeira-br-adaptation.md` | 15 KB |

---

## Carrosséis Instagram

| Carrossel | Path | Slides | Formatos | Status |
|-----------|------|--------|----------|--------|
| Ensinio Comunidade | `squads/conteudo/output/carrossel-ensinio-comunidade/` | 7 | HTML + PNG | Verificar existência |
| Ensinio Gamificação | `squads/conteudo/output/carrossel-ensinio-gamificacao/` | 7 | HTML + PNG | Verificar existência |
| Ensinio Whitelabel | `squads/conteudo/output/carrossel-ensinio-whitelabel/` | 7 | HTML + PNG | Verificar existência |

> **Nota:** Na verificação de disco, a pasta `squads/conteudo/output/` estava quase vazia (apenas 1 YAML). Os carrosséis podem ter sido movidos ou não renderizados ainda.

---

## Composições Remotion (Source — precisam render)

### Projeto Pessoal — "Não É Dom"

| Componente | Path | Descrição |
|-----------|------|-----------|
| Entry | `Luiz-fosc-remotion/src/NaoEDom/index.tsx` | Composição principal (637 bytes) |
| Tokens | `Luiz-fosc-remotion/src/NaoEDom/tokens.ts` | Design tokens Academia Lendária |
| Hook | `Luiz-fosc-remotion/src/NaoEDom/sections/Hook.tsx` | Abertura (0-3s) |
| Agitation | `Luiz-fosc-remotion/src/NaoEDom/sections/Agitation.tsx` | Dor (3-10s) |
| Before | `Luiz-fosc-remotion/src/NaoEDom/sections/Before.tsx` | Antes (10-25s) |
| After | `Luiz-fosc-remotion/src/NaoEDom/sections/After.tsx` | Depois (25-40s) |
| Bridge | `Luiz-fosc-remotion/src/NaoEDom/sections/Bridge.tsx` | Ponte (40-50s) |
| CTA | `Luiz-fosc-remotion/src/NaoEDom/sections/Cta.tsx` | Call to Action (50-57s) |
| Signature | `Luiz-fosc-remotion/src/NaoEDom/sections/Signature.tsx` | Assinatura (57-60s) |
| BillionairesChart | `Luiz-fosc-remotion/src/BillionairesChart.tsx` | Visualização de dados (6 KB) |

**Formato:** 1080×1920, 30fps, 60 segundos | **Brand:** #000 / #FFF / #C9B298 (8% gold rule)

### Templates Viral Squad (7 componentes)

| Template | Path | Tamanho |
|----------|------|---------|
| DS Integrated Component | `squads/viral-squad/templates/remotion/ds-integrated-component.tsx` | 20 KB |
| Advanced Components | `squads/viral-squad/templates/remotion/advanced-components.tsx` | 13 KB |
| Particle System | `squads/viral-squad/templates/remotion/particle-system.tsx` | 10 KB |
| Viral Stat Card | `squads/viral-squad/templates/remotion/viral-stat-card.tsx` | 10 KB |
| Slide Transition | `squads/viral-squad/templates/remotion/slide-transition.tsx` | 8 KB |
| Fade Transition | `squads/viral-squad/templates/remotion/fade-transition.tsx` | 6 KB |
| Kinetic Typography | `squads/viral-squad/templates/remotion/kinetic-typography.tsx` | 1.2 KB |

### Audio Reels (Remotion project)

| Arquivo | Path | Tamanho |
|---------|------|---------|
| AudioReels.tsx | `squads/audio-reels/templates/remotion-reels/src/AudioReels.tsx` | 8 KB |
| Root.tsx | `squads/audio-reels/templates/remotion-reels/src/Root.tsx` | 808 bytes |

---

## Design Systems Extraídos

| Sistema | Path | Tipo | Build pronto? |
|---------|------|------|---------------|
| Circle BR | `~/CODE/design-systems/circle-br/` | Extração completa (tokens, screenshots, CSS, imagens) | Dados brutos |
| DesignCode UI | `~/CODE/design-systems/designcode-ui/` | App Vite completo (atomic design) | Sim (`dist/`) |
| Shadcn Dashboard | `~/CODE/design-systems/shadcn-dashboard-landing/` | Vite + Next.js versions | Não (precisa build) |
| Studio Admin | `~/CODE/design-systems/studio-admin/` | Next.js app | Não (precisa build) |
| Cyberpunk DS | `~/CODE/design-systems/cyberpunk-ds/` | YAML spec only | — |
| Fantasy DS | `~/CODE/design-systems/fantasy-ds/` | YAML spec only | — |

---

## App Artes Ensinio

| Item | Path | Status |
|------|------|--------|
| App (Vite + React) | `~/CODE/Projects/app-artes-ensinio/` | Build pronto em `dist/` (precisa server local) |
| 3 estilos visuais | Elegante (dark/gold), Moderno (bold/geometric), Suave (pastel/organic) | Configurados |
| 5 formatos de arte | Capa Horizontal, Vertical, Billboard, Thumbnail, Estampa | Configurados |
| Exemplos em PNG | `~/CODE/Projects/app-artes-ensinio/Exemplos de Artes/` | 8 pastas com amostras |

---

## Resumo Quantitativo

| Categoria | Outputs prontos | Source/templates | Vazios/pendentes |
|-----------|----------------|-----------------|------------------|
| LPs (HTML standalone) | 7 arquivos | 8+ docs de copy | 1 (emerald-ai) |
| Carrosséis (PNG) | 0 confirmados | 3 conjuntos (verificar) | — |
| Vídeos Remotion | 0 renderizados | 10+ composições TSX | — |
| Design Systems | 2 com build | 4 com source | 2 (YAML only) |
| Apresentações PPTX | 0 | Skill pronta | — |
| Artes Ensinio | App funcional | 8 pastas de exemplo | — |
