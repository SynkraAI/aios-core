# Mapa de Rotas — "Quero X → Use Y"

> Guia rápido para saber qual ferramenta usar para cada tipo de conteúdo visual.

---

## Landing Pages

| Necessidade | Rota recomendada | Entry point | Status |
|-------------|-----------------|-------------|--------|
| LP completa (copy + design + HTML) | `/content-forge` → `lp-generator` | `skills/content-forge/` | Funcional (Mode A) |
| LP rápida (só HTML com brand) | `/lp-generator` direto | `skills/lp-generator/` | Funcional |
| LP via Forge pipeline (6 fases) | `/forge lp` | `skills/forge/workflows/landing-page.md` | Funcional |
| LP Next.js premium | `lp-generator` Mode B | `skills/lp-generator/` | Pendente |
| LP premium com Mustache template | Premium LP System | `.aiox-core/product/templates/premium-lp-*` | Funcional (8 temas) |
| Copy de LP (frameworks) | Squad Hormozi / Ícaro / Copywriting | `squads/hormozi/tasks/create-landing-page.md` | Funcional |
| Otimização de LP existente | Squad Conversão Extrema | `squads/conversao-extrema/tasks/optimize-landing-page.md` | Funcional |
| Inspiração visual (46 sites) | Pattern Library | `design-system/patterns/INDEX.md` | Funcional |

**Rota padrão:** `/content-forge` → detecta "LP" → roteia para `lp-generator` com brand do `brand-schema`

---

## Instagram — Carrosséis

| Necessidade | Rota recomendada | Entry point | Status |
|-------------|-----------------|-------------|--------|
| Carrossel completo (copy + design + PNG) | `/content-forge` → `carrossel-instagram` | `skills/content-forge/` | Funcional |
| Carrossel rápido (só imagens) | `/carrossel-instagram` direto | `skills/carrossel-instagram/` | Funcional |
| Copy de carrossel (9 frameworks) | Squad Conteúdo → carousel-creator | `squads/conteudo/tasks/create-carousel.md` | Funcional |
| Render HTML → PNG genérico | `image-creator` | `skills/image-creator/` | Funcional |
| Publicação no Instagram | `instagram-publisher` | `skills/instagram-publisher/scripts/publish.js` | Funcional |

**Rota padrão:** `/content-forge` → detecta "carrossel" → copy via `conteudo:carousel-creator` → design via `carrossel-instagram` → render via `image-creator` → publish via `instagram-publisher`

---

## Instagram — Reels / Vídeos

| Necessidade | Rota recomendada | Entry point | Status |
|-------------|-----------------|-------------|--------|
| Reel com tipografia animada | `video-generator` (Remotion) | `skills/video-generator/` | Funcional |
| Reel viral (debate multi-agente) | Viral Squad | `squads/viral-squad/` | Funcional (30 agentes) |
| Reel com avatar + voz AI | AI Reels Squad | `squads/ai-reels/` | Funcional (ElevenLabs + HeyGen) |
| Reel de áudio (WhatsApp → cinemático) | Audio Reels Squad | `squads/audio-reels/` | Funcional (Gemini + Kling AI) |
| Repurposing de vídeo | Content Creator Squad | `squads/content-creator/tasks/multiplicar-conteudo.md` | Funcional |

**Rota padrão:** `/content-forge` → detecta tipo de vídeo → roteia para squad específico

---

## Instagram — Stories

| Necessidade | Rota recomendada | Entry point | Status |
|-------------|-----------------|-------------|--------|
| Sequência de stories (conversão) | Squad Conteúdo → stories-strategist | `squads/conteudo/tasks/create-stories.md` | Funcional |
| Story visual (imagem) | `image-creator` (preset 1080x1920) | `skills/image-creator/` | Funcional |
| Stories de funil/venda | Tasks específicas | `squads/conteudo/tasks/create-stories-funil.md` | Funcional |

---

## Outras Plataformas

| Plataforma | Rota | Dimensões | Status |
|-----------|------|-----------|--------|
| LinkedIn Post | `image-creator` | 1200×627 | Funcional |
| Twitter/X Post | `image-creator` | 1200×675 | Funcional |
| YouTube Thumbnail | `image-creator` | 1280×720 | Funcional |
| Pinterest Pin | `image-creator` | 1000×1500 | Funcional |
| Facebook Post | `image-creator` | 1200×630 | Funcional |
| Apresentação PPTX | `pptx-generator` | 16:9 (1920×1080) | Funcional |
| Design via Canva | `canva` (MCP) | Variados | Funcional |
| Publicação multi-plataforma | `blotato` (MCP) | — | Funcional |

---

## Design Systems

| Necessidade | Rota recomendada | Entry point | Status |
|-------------|-----------------|-------------|--------|
| Clonar visual de um site | `design-system-forge` | `skills/design-system-forge/` | Funcional |
| Scaffoldar projeto com tokens | `design-system-scaffold` | `skills/design-system-scaffold/` | Funcional |
| Gerar componentes + Storybook | `design-system-storybook` | `skills/design-system-storybook/` | Funcional |
| Catálogo de DS existentes | `design-system-catalog` | `skills/design-system-catalog/` | Funcional |
| Extrair tokens de site ao vivo | `design-system-extractor` | `skills/design-system-extractor/` | Funcional |
| Brand completo (estratégia) | Branding Squad | `squads/branding/` | Funcional (6 experts) |

---

## Brands / Temas

| Necessidade | Rota | Localização |
|-------------|------|-------------|
| Brand canônico (YAML + adapters) | `brand-schema` | `packages/brand-schema/brands/` (9 brands) |
| Brand para LP | LP Generator brands | `skills/lp-generator/brands/` (8 brands) |
| Brand para LP premium | Premium LP tokens | `.aiox-core/product/templates/premium-lp-tokens.yaml` (8 temas) |
| Converter brand → CSS | `to-css-vars` adapter | `packages/brand-schema/adapters/to-css-vars.mjs` |
| Converter brand → Tailwind | `to-tailwind` adapter | `packages/brand-schema/adapters/to-tailwind.mjs` |
| Converter brand → Remotion | `to-remotion-theme` adapter | `packages/brand-schema/adapters/to-remotion-theme.mjs` |

**Brand canônico:** Sempre usar `packages/brand-schema/` como fonte de verdade. Os outros são derivados ou legacy.

---

## Orquestrador Central

O **Content Forge** (`skills/content-forge/`) é o entry point recomendado para qualquer produção de conteúdo. Ele classifica a necessidade e roteia para a skill/squad certa:

```
/content-forge → Classificador → Rota específica
                 ├── Carousel IG → conteudo + carrossel-instagram + image-creator + instagram-publisher
                 ├── Reel tipografia → viral-squad (Remotion)
                 ├── Reel talking head → ai-reels
                 ├── Reel áudio → audio-reels
                 ├── Story → image-creator
                 ├── Vídeo branded → video-generator (Remotion)
                 ├── LP → lp-generator
                 └── Calendário → conteudo:content-planner
```
