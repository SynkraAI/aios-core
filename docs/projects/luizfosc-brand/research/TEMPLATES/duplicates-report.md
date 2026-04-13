# Relatório de Duplicatas e Sobreposições

> Mapeamento de onde existem redundâncias e recomendações de consolidação.

---

## 1. Brand Themes — 3 locais diferentes

### Onde estão

| Local | Quantidade | Formato | Propósito original |
|-------|-----------|---------|-------------------|
| `packages/brand-schema/brands/` | 9 YAMLs | JSON Schema validado | **Canônico** — fonte de verdade |
| `skills/lp-generator/brands/` | 8 YAMLs | Formato proprietário LP | Específico para lp-generator |
| `.aiox-core/product/templates/premium-lp-tokens.yaml` | 8 temas | Inline YAML monolítico | Específico para premium LP template |

### Sobreposição real

| Brand name | brand-schema | lp-generator | premium-lp |
|-----------|:---:|:---:|:---:|
| Vercel Noir / Arctic Frost LP | sim | sim | sim (variante) |
| Emerald Noir / Stealth Emerald | sim | sim | sim (variante) |
| Linear Soft / Midnight Violet | sim | sim | sim (variante) |
| Minimal Sand | sim | sim | — |
| Raycast Warm | sim | sim | — |
| Rose Gold / Eclipse Rose | sim | sim | sim (variante) |
| Specta / Midnight Violet | sim | sim | sim (variante) |
| Arctic Frost (light) | sim | sim | sim (variante) |
| Ensinio | sim | — | — |
| Nocturne Cian | — | — | sim |
| Obsidian Gold | — | — | sim |
| Carbon Blue | — | — | sim |
| Crimson Noir | — | — | sim |

### Recomendação

- **Manter `brand-schema` como única fonte de verdade**
- Criar adapters `from-lp-generator` e `from-premium-lp` para converter (já existe `from-lp-generator.mjs`)
- Migrar os 4 temas exclusivos do premium-lp (Nocturne Cian, Obsidian Gold, Carbon Blue, Crimson Noir) para `brand-schema`
- A longo prazo: lp-generator e premium-lp devem consumir de `brand-schema` via adapters

**Esforço estimado:** Médio — criar 4 YAMLs novos + ajustar imports

---

## 2. Templates de LP Copy — 5 squads

### Onde estão

| Squad | Template | Foco |
|-------|---------|------|
| `squads/copywriting-squad/templates/landing-page-tmpl.md` | Template genérico de LP copy | Copy geral |
| `squads/copywriting-squad/templates/sales-page-completa-tmpl.md` | Sales page completa | Vendas |
| `squads/icaro-de-carvalho/templates/landing-page-tmpl.md` | Framework PPP (Produto/Proposta/Personalidade) | Infoprodutos BR |
| `squads/hormozi/docs/sops/landing-page-sop.md` | Value Equation aplicada a LP | High-ticket |
| `squads/conversao-extrema/tasks/create-landing-page.md` | Cabeça-Corpo-Pernas (50-30-20) | Conversão |
| `squads/content-engine/tasks/write-landing-page.md` | Task genérica | Multi-formato |

### Análise

Estes NÃO são duplicatas reais — cada um aplica um **framework diferente** de copy:
- Copywriting Squad → genérico
- Ícaro → PPP (brasileiro)
- Hormozi → Value Equation ($100M Leads)
- Conversão Extrema → foco em métricas de conversão
- Content Engine → multi-agente com debate

### Recomendação

- **NÃO consolidar** — são perspectivas complementares
- **Criar índice** no routing-map indicando qual framework usar para qual situação
- O `content-forge` deveria perguntar "qual estilo de copy?" e rotear para o squad certo

**Esforço:** Baixo — só documentação

---

## 3. Pipelines de Vídeo — 4 squads

### Onde estão

| Squad | Foco | Stack |
|-------|------|-------|
| `skills/video-generator/` | Vídeo genérico branded | Remotion |
| `squads/viral-squad/` | Viral Instagram (30 agentes) | Remotion |
| `squads/ai-reels/` | Avatar + voz AI | ElevenLabs + HeyGen + Remotion |
| `squads/audio-reels/` | Áudio → vídeo cinemático | Gemini + Kling AI + Remotion |

### Análise

Também NÃO são duplicatas reais — cada um atende um caso de uso diferente:
- `video-generator` → genérico (qualquer formato)
- `viral-squad` → otimizado para viralização Instagram
- `ai-reels` → quando precisa de avatar falando
- `audio-reels` → quando tem áudio de WhatsApp/podcast

### Sobreposição real

O que se sobrepõe é o **rendering layer** — todos usam Remotion. Os tokens de design e componentes visuais poderiam ser compartilhados.

### Recomendação

- **NÃO consolidar squads** — são pipelines diferentes
- **Compartilhar componentes Remotion** — mover templates genéricos (transitions, particles, typography) para um package comum
- O `content-forge` já roteia corretamente para cada um

**Esforço:** Médio — criar shared Remotion components package

---

## 4. Renderers de Imagem — 2 caminhos

### Onde estão

| Tool | Método | Uso principal |
|------|--------|--------------|
| `skills/image-creator/` | Playwright (headless browser → PNG) | Posts, thumbnails, social cards |
| `squads/brandcraft/agents/forge-renderer.md` | Puppeteer + Playwright → PDF/PNG | Documentos, apresentações |

### Análise

Ambos fazem HTML → imagem, mas com focos diferentes:
- `image-creator` → otimizado para social media (presets de dimensão, batch)
- `brandcraft/forge-renderer` → otimizado para documentos (PDF, qualidade print)

### Recomendação

- **Manter ambos** — servem propósitos diferentes
- A longo prazo: extrair o rendering engine para um package compartilhado

**Esforço:** Baixo a médio

---

## 5. Extração de Design System — 2 caminhos

### Onde estão

| Tool | Método |
|------|--------|
| `skills/design-system-forge/` | Skill com scripts CLI (dissect.mjs, etc.) |
| `squads/design/scripts/dissect-artifact.cjs` | Script Playwright no squad de design |

### Análise

O `dissect-artifact.cjs` do squad parece ser o motor original, e o `design-system-forge` é a skill que o orquestra.

### Recomendação

- **Consolidar no `design-system-forge`** como skill canônica
- O squad de design deveria chamar a skill, não ter seu próprio script

**Esforço:** Baixo — já quase consolidado

---

## 6. Duplicata de Templates (`.aiox-core/` vs `.aios-core/`)

### O que existe

| Path | Conteúdo |
|------|---------|
| `.aiox-core/product/templates/premium-lp-*` | 3 arquivos (template, schema, tokens) |
| `.aios-core/product/templates/premium-lp-*` | Mesmos 3 arquivos (cópia exata) |

### Recomendação

- **Deletar `.aios-core/product/templates/`** — é cópia do `.aiox-core/`
- Manter apenas `.aiox-core/` como canônico

**Esforço:** Trivial

---

## Resumo de Ações

| # | Ação | Prioridade | Esforço |
|---|------|-----------|---------|
| 1 | Migrar 4 temas exclusivos do premium-lp para brand-schema | Alta | Médio |
| 2 | Deletar duplicata `.aios-core/product/templates/` | Alta | Trivial |
| 3 | Criar índice de "qual framework de copy usar quando" | Média | Baixo |
| 4 | Extrair Remotion components compartilhados | Média | Médio |
| 5 | Consolidar dissect-artifact no design-system-forge | Baixa | Baixo |
| 6 | Fazer lp-generator consumir de brand-schema via adapter | Baixa | Médio |
