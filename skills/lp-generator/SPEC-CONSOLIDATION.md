# Spec: LP Generator — Consolidação Unificada

> Da ideia à landing page, sem atalho raso.

**Status:** Draft
**Data:** 2026-03-24
**Origem:** Forge Brownfield Diagnostic

---

## 1. Objetivo

Consolidar 3 skills fragmentadas (`md-to-branded-pdf`, `md-to-landing-page`, `lp-generator`) em uma única skill `lp-generator` que guia o usuário do zero ao resultado final.

**Antes:** 3 portas de entrada, 3 CLIs, dependências cruzadas frágeis.
**Depois:** 1 skill, 1 CLI, 1 fluxo guiado, código autossuficiente.

---

## 2. Decisões Travadas

| Decisão | Valor |
|---------|-------|
| Nome da skill | `lp-generator` |
| Localização | `skills/lp-generator/` |
| Output HTML | Single-file GSAP (Tailwind CDN + GSAP) |
| Output Next.js | Scaffolded project (shadcn + Framer Motion) |
| Brands | 8 curados (ver seção 4) |
| Skills removidas | `md-to-branded-pdf`, `md-to-landing-page` (código absorvido) |
| CLI entry point | `node skills/lp-generator/convert.mjs` |

---

## 3. Arquitetura Final

```
skills/lp-generator/
├── SKILL.md                    # Instruções do agente (discovery, copy, forms, vetos)
├── convert.mjs                 # CLI unificada (--brand, --style, --effects, --output)
├── lib/
│   ├── brand-loader.mjs        # Carrega brands/*.yaml → objeto brand
│   ├── color-mapper.mjs        # hexToHSL, brandToTailwindConfig, brandToShadcnVars
│   ├── html-utils.mjs          # escapeHTML, formatInline, buildTable, buildList, etc.
│   ├── effects-config.mjs      # EFFECTS_PRESETS (full-framer/premium/minimal)
│   ├── lp-parser.mjs           # Parser semântico LP (hero, problema, solução, etc.)
│   ├── lp-effects.mjs          # 6 efeitos LP (ctaPulse, carousel, glow, etc.)
│   ├── lp-builder-gsap.mjs     # Builder HTML GSAP para LP
│   ├── lp-builder-nextjs.mjs   # Scaffolder Next.js para LP
│   └── lp-nextjs-templates.mjs # Templates TSX LP-específicos
├── templates/
│   ├── lp-styles.mjs           # CSS LP (seções semânticas, carousel, glow, sticky CTA)
│   └── lp-scripts.mjs          # JS GSAP + animações LP
├── brands/
│   ├── vercel-noir.yaml        # Dark monochrome
│   ├── linear-soft.yaml        # Dark purple muted
│   ├── raycast-warm.yaml       # Dark warm orange
│   ├── specta.yaml             # Dark creative purple
│   ├── emerald-noir.yaml       # Dark green luxury
│   ├── rose-gold.yaml          # Dark romantic luxury
│   ├── arctic-frost.yaml       # Light corporate
│   └── minimal-sand.yaml       # Light editorial
├── examples/
│   └── example-landing-page.md # Markdown de referência
├── package.json                # Dependências próprias (marked, js-yaml)
└── README.md                   # Uso rápido
```

### O que NÃO entra

| Módulo | Motivo |
|--------|--------|
| `md-parser.mjs` (genérico) | Substituído pelo `lp-parser.mjs` (semântico) |
| `html-builder.mjs` (PDF) | Skill de LP não gera PDF |
| `html-builder-web.mjs` (vanilla) | Substituído pelo GSAP builder |
| `html-builder-gsap.mjs` (genérico) | Substituído pelo `lp-builder-gsap.mjs` (LP-específico) |
| `pdf-generator.mjs` | Sem PDF |
| `site-generator.mjs` / `site-generator-gsap.mjs` | Orquestração incorporada no `convert.mjs` |
| `nextjs-generator.mjs` (genérico) | Substituído pelo `lp-builder-nextjs.mjs` |
| `nextjs-templates.mjs` (genérico) | Substituído pelo `lp-nextjs-templates.mjs` |
| `templates/styles.mjs` (PDF) | Sem PDF |
| `templates/styles-web.mjs` (vanilla) | Sem vanilla |
| `templates/styles-gsap.mjs` (genérico) | Substituído pelo `lp-styles.mjs` |
| `templates/scripts-web.mjs` (vanilla) | Sem vanilla |
| `templates/scripts-gsap.mjs` (genérico) | Funcionalidade incorporada no `lp-scripts.mjs` |
| `brands/preview.html` | Pode ser recriado depois se necessário |
| 21 brands descartados | Redundância eliminada |

---

## 4. Brands Curados (8)

| Brand | Categoria | Cor Primária | Fonte | Caso de Uso |
|-------|-----------|-------------|-------|-------------|
| `vercel-noir` | Dark B&W | #FAFAFA | Inter | Máximo minimalismo, premium |
| `linear-soft` | Dark purple | #8B8BF5 | Inter | SaaS, tech, startups |
| `raycast-warm` | Dark orange | #FF6B2C | Inter | Tools, produtividade, energia |
| `specta` | Dark creative | #A855F7 | Inter+Syne | Creators, vídeo, plataformas |
| `emerald-noir` | Dark green | #059669 | Plus Jakarta Sans | Consultoria, finanças, luxo |
| `rose-gold` | Dark romantic | #BE185D | Playfair Display | Moda, beauty, eventos |
| `arctic-frost` | Light SaaS | #2563EB | Inter | Corporate, docs, SaaS light |
| `minimal-sand` | Light editorial | #78716C | Libre Baskerville | Blog, portfólio, editorial |

### Cobertura visual

- 6 dark + 2 light
- 6 sans-serif + 1 serif + 1 display
- Warm (raycast, rose-gold) + Cool (linear, arctic) + Neutral (vercel, minimal)
- Tech (linear, specta) + Business (emerald, arctic) + Creative (rose-gold, raycast)

---

## 5. CLI Unificada

```bash
# Gerar LP (GSAP — default)
node skills/lp-generator/convert.mjs input.md --brand=vercel-noir --style=gsap --effects=premium

# Gerar LP (Next.js)
node skills/lp-generator/convert.mjs input.md --brand=linear-soft --style=nextjs --effects=full-framer

# Validar estrutura do MD
node skills/lp-generator/convert.mjs input.md --validate-only

# Listar brands
node skills/lp-generator/convert.mjs --list-brands

# Output customizado
node skills/lp-generator/convert.mjs input.md --brand=specta --output=~/CODE/Projects/landing-pages/meu-produto
```

### Flags

| Flag | Valores | Default |
|------|---------|---------|
| `--brand` | Nome do brand YAML | (obrigatório) |
| `--style` | `gsap`, `nextjs` | prompt interativo |
| `--effects` | `full-framer`, `premium`, `minimal` | `premium` |
| `--output` | Path de saída | `{input-dir}/{slug}-lp-{style}` |
| `--validate-only` | — | Valida sem gerar |
| `--list-brands` | — | Lista brands |
| `--help` | — | Ajuda |

---

## 6. Fluxo do Agente (SKILL.md)

```
Usuário chama /lp-generator
    │
    ▼
Phase 1: Discovery (14 perguntas agrupadas em 4 blocos)
    │  Produto, Visual, Conteúdo, Captação
    ▼
Phase 2: Geração do Markdown (.md com seções semânticas)
    │  Copy com fórmulas PAS, headlines validadas, CTAs de alta conversão
    ▼
Phase 3: Render (CLI convert.mjs)
    │  HTML GSAP ou Next.js project
    ▼
Phase 4: Pós-processamento
    │  Injeção de formulário + imagens (se solicitado)
    ▼
Phase 5: Preview + Iteração
    │  Abre no navegador, aceita ajustes, re-renderiza
    ▼
Entrega (deploy options: Vercel, Netlify, GitHub Pages)
```

---

## 7. Migração — Passo a Passo

### Story 1: Scaffold da skill unificada
- Criar estrutura de pastas `lp-generator/lib/`, `lp-generator/templates/`, `lp-generator/brands/`
- Copiar os 8 brands YAML selecionados
- Criar `package.json` com `marked` + `js-yaml`
- Rodar `npm install`

### Story 2: Migrar código executável
- Copiar e adaptar módulos de `md-to-branded-pdf/lib/` → `lp-generator/lib/`:
  - `brand-loader.mjs` (atualizar path dos brands para local)
  - `color-mapper.mjs` (copiar sem alteração)
  - `html-utils.mjs` (copiar sem alteração)
  - `effects-config.mjs` (copiar sem alteração)
- Copiar módulos de `md-to-landing-page/` → `lp-generator/`:
  - `lib/lp-parser.mjs` (copiar sem alteração)
  - `lib/lp-effects.mjs` (copiar sem alteração)
  - `lib/lp-builder-gsap.mjs` (atualizar imports para relativos locais)
  - `lib/lp-builder-nextjs.mjs` (atualizar imports)
  - `lib/lp-nextjs-templates.mjs` (atualizar imports)
  - `templates/lp-styles.mjs` (copiar sem alteração)
  - `templates/lp-scripts.mjs` (copiar sem alteração)

### Story 3: CLI unificada
- Criar novo `convert.mjs` baseado no existente de `md-to-landing-page`
- Atualizar todos os imports para caminhos relativos locais (`./lib/`, `./templates/`)
- Zero imports de `../md-to-branded-pdf/` (tudo local agora)
- Testar: `--list-brands`, `--validate-only`, `--style=gsap`, `--style=nextjs`

### Story 4: Atualizar SKILL.md
- Atualizar paths (`ENGINE_HOME` → local)
- Atualizar lista de brands (8 ao invés de 26)
- Remover referências a skills externas
- Manter: discovery, copy formulas, form injection, veto conditions, quality checklist

### Story 5: Cleanup
- Remover `skills/md-to-branded-pdf/` (inteira)
- Remover `skills/md-to-landing-page/` (inteira)
- Atualizar referências em outros arquivos (se houver)
- Testar fluxo completo end-to-end

---

## 8. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| `md-to-branded-pdf` usada por outras skills | Alto | Verificar grep por imports antes de deletar |
| Brands YAML com campos diferentes entre versões | Médio | Validar schema dos 8 brands antes de migrar |
| Next.js templates importam da base genérica | Médio | `lp-nextjs-templates.mjs` já é autossuficiente para LP |
| Skill registrada em configs/catálogos | Baixo | Atualizar registros após cleanup |

---

## 9. Critérios de Aceite (Definition of Done)

- [ ] `node skills/lp-generator/convert.mjs --list-brands` lista 8 brands
- [ ] `node skills/lp-generator/convert.mjs example.md --brand=vercel-noir --style=gsap` gera HTML funcional
- [ ] `node skills/lp-generator/convert.mjs example.md --brand=linear-soft --style=nextjs` gera projeto Next.js
- [ ] `node skills/lp-generator/convert.mjs example.md --validate-only` valida estrutura
- [ ] Zero imports de `../md-to-branded-pdf/` ou `../md-to-landing-page/`
- [ ] `skills/md-to-branded-pdf/` removida
- [ ] `skills/md-to-landing-page/` removida
- [ ] SKILL.md atualizado com paths locais e 8 brands
- [ ] Fluxo completo testado: discovery → MD → render → preview
