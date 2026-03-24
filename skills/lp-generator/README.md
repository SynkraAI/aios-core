# LP Generator v3

Gerador unificado de landing pages com qualidade de agencia. Skill autossuficiente — zero dependencias externas.

## Como Usar

```
/lp-generator
```

A skill faz discovery (perguntas sobre produto, visual, conteudo), escreve o Markdown,
renderiza via CLI interna (8 temas curados, GSAP ou Next.js) e abre preview.

## CLI

```bash
# Gerar LP (HTML GSAP)
node skills/lp-generator/convert.mjs input.md --brand=vercel-noir --style=gsap --effects=premium

# Gerar LP (Next.js)
node skills/lp-generator/convert.mjs input.md --brand=linear-soft --style=nextjs

# Listar temas
node skills/lp-generator/convert.mjs --list-brands

# Validar estrutura do MD
node skills/lp-generator/convert.mjs input.md --validate-only
```

## Brands (8 curados)

| Brand | Categoria | Caso de uso |
|-------|-----------|-------------|
| `vercel-noir` | Dark B&W | Premium, minimalista |
| `linear-soft` | Dark purple | SaaS, tech |
| `raycast-warm` | Dark orange | Tools, produtividade |
| `specta` | Dark creative | Creators, video |
| `emerald-noir` | Dark green | Consultoria, financas |
| `rose-gold` | Dark romantic | Moda, beauty, eventos |
| `arctic-frost` | Light corporate | Docs, SaaS light |
| `minimal-sand` | Light editorial | Blog, portfolio |

## Output

```
~/CODE/Projects/landing-pages/{slug}/
├── index.html    <- LP completa (ou projeto Next.js)
├── {slug}.md     <- Markdown source
├── assets/       <- Imagens (se geradas)
└── README.md     <- Briefing + instrucoes de deploy
```
