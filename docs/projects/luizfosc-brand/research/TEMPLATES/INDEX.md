# TEMPLATES — Inventário de Brand Identity Tools

> Varredura completa do ecossistema de templates visuais: landing pages, social media, vídeos, design systems.

**Data:** 2026-04-07 | **Escopo:** `aios-core/`, `~/CODE/`, todos os squads e skills

---

## Resumo Executivo

O ecossistema tem **infraestrutura de agência premium** — 12 skills visuais, 10 squads de conteúdo, 21 brand themes, 46 sites na pattern library, 30+ workflows de produção. O problema não é falta de templates: é **fragmentação**. Assets similares existem em múltiplos locais sem índice unificado.

**O que funciona hoje:**
- LPs HTML standalone (7 geradas, 3 sistemas de geração)
- Carrosséis Instagram (skill completa, 9 copy frameworks)
- 4 pipelines de vídeo/reels (Remotion, AI avatar, áudio cinemático)
- 9 brand themes canônicos + 8 temas LP premium
- Pipeline completa de design system (extração → scaffold → storybook → catálogo)

**O que precisa de atenção:**
- Brand themes duplicados em 3 locais diferentes
- Nenhum vídeo renderizado em disco (só source TSX)
- Carrosséis anteriores podem ter sido movidos/deletados
- LP Generator Mode B (Next.js) pendente

---

## Documentos

| Arquivo | Descrição |
|---------|-----------|
| [catalog.html](catalog.html) | Catálogo visual interativo com swatches de cor, tipografia e status de cada asset |
| [routing-map.md](routing-map.md) | "Quero X → Use Y" — guia de rotas para cada tipo de conteúdo |
| [generated-examples.md](generated-examples.md) | Inventário completo de outputs já existentes em disco |
| [duplicates-report.md](duplicates-report.md) | Mapeamento de sobreposições + recomendações de consolidação |

---

## Quick Reference — "Quero X → Faça Y"

| Quero... | Use... |
|----------|--------|
| LP completa | `/content-forge` → detecta LP → `lp-generator` |
| Carrossel Instagram | `/content-forge` → detecta carrossel → `carrossel-instagram` |
| Reel com tipografia | `/content-forge` → `video-generator` (Remotion) |
| Reel com avatar falando | `/content-forge` → `ai-reels` squad |
| Reel de áudio/podcast | `/content-forge` → `audio-reels` squad |
| Post estático (qualquer plataforma) | `image-creator` com preset da plataforma |
| Stories Instagram | Squad Conteúdo → `stories-strategist` |
| Publicar no Instagram | `instagram-publisher` (Graph API) |
| Publicar multi-plataforma | `blotato` (MCP) |
| Criar apresentação PPTX | `pptx-generator` |
| Clonar visual de um site | `design-system-forge` |
| Ver brands disponíveis | Abrir `catalog.html` no browser |

---

## Decisões Pendentes

1. **Consolidar brand themes?** — 3 locais com overlaps. Recomendação: migrar 4 temas exclusivos do premium-lp para `brand-schema` (ver [duplicates-report.md](duplicates-report.md))
2. **Deletar duplicata `.aios-core/product/templates/`?** — Cópia exata de `.aiox-core/`. Seguro deletar.
3. **Compartilhar componentes Remotion?** — 4 squads usam Remotion independentemente. Um package compartilhado evitaria duplicação.
4. **Renderizar composições existentes?** — 10+ composições TSX sem vídeo renderizado. Rodar render para ter output pronto.
5. **Verificar carrosséis antigos** — Os 3 conjuntos (ensinio-comunidade/gamificacao/whitelabel) não foram encontrados em disco. Verificar se foram movidos.

---

## Números

| Métrica | Valor |
|---------|-------|
| Skills de conteúdo visual | 12 |
| Squads de conteúdo/design | 10 |
| Brand themes disponíveis | 21 (9 canônicos + 8 LP premium + 4 exclusivos) |
| Frameworks de copy | 6+ (Imperador, Blaze, Brandcontent, PPP, Value Equation, Debate) |
| LPs prontas em disco | 7 HTML standalone |
| Vídeos renderizados | 0 (10+ composições source) |
| Formatos de output | 15+ (HTML, PNG, MP4, GIF, PDF, PPTX, Canva, Next.js, Storybook) |
| Pattern library | 46 sites premium extraídos |
| Design systems extraídos | 6 (2 com build, 2 source, 2 spec) |
