# Prompt Schema — `prompts.json`

Formato esperado pelo `batch-generate.cjs`.

## Schema

```json
{
  "meta": {
    "project": "string (slug)",
    "created": "YYYY-MM-DD",
    "style_anchor": "string (texto opcional que é herdado por prompts sem STYLE ANCHOR próprio)",
    "language": "pt-BR | en-US (default: en-US)",
    "sanitized_at": "ISO timestamp (preenchido pelo sanitize-prompts.cjs)",
    "total_replacements": 0
  },
  "items": [
    {
      "id": "string (único — ex: d1, s1-1, p3, h1)",
      "filename": "string (kebab-case.png)",
      "title": "string (humano, aparece em logs)",
      "category": "string (diagrama | slide | profissao | hero | thumbnail | custom)",
      "aspectRatio": "16:9 | 1:1 | 4:3 | 9:16 | 3:2",
      "prompt": "string (prompt completo incluindo STYLE ANCHOR)"
    }
  ]
}
```

## Regras obrigatórias

- `id` é único em todo o arquivo
- `filename` em kebab-case terminando em `.png`
- `prompt` começa com `STYLE ANCHOR:` ou herda de `meta.style_anchor` (Claude aplica antes de salvar)
- Texto pt-BR dentro do prompt tem acentuação COMPLETA (Artigo VII Constitution)
- Nomes próprios famosos devem passar pelo `sanitize-prompts.cjs` antes do batch

## Discovery Questions (Fase 1 — Claude)

Antes de gerar um `prompts.json` a partir de um documento, Claude DEVE fazer essas perguntas via `AskUserQuestion`:

1. **Estilo visual predominante**
   - Opções: Editorial dark minimalista · Vintage sepia · Cinematic fotorrealista · Flat illustration · Screenshot mockup · Misto (categorias diferentes)
   - Por quê: define o STYLE ANCHOR global

2. **Paleta de cores principal**
   - Opções: Dark #0a0a0a + amber #f59e0b · Light + azul corporativo · Pastel · Marca específica (pedir hex) · Sem restrição
   - Por quê: consistência visual entre imagens

3. **Tipografia quando houver texto na imagem**
   - Opções: Inter/Montserrat · Serif editorial · Handwritten · Não há texto · Definir depois
   - Por quê: entra no STYLE ANCHOR

4. **Aspect ratio dominante**
   - Opções: 16:9 (slides/heros) · 1:1 (thumbs/Instagram) · 4:3 · 9:16 (stories) · Mixado (vou indicar por item)
   - Por quê: default pra items sem aspectRatio explícito

5. **Idioma do texto dentro das imagens**
   - Opções: pt-BR com acentos · Inglês · Sem texto · Mixado
   - Por quê: evitar traduções automáticas no Imagen

**Não perguntar mais que 5. Agrupar em 1 chamada do AskUserQuestion.**

## Exemplo mínimo

```json
{
  "meta": {
    "project": "minha-lp",
    "created": "2026-04-11",
    "style_anchor": "STYLE ANCHOR: editorial dark background #0a0a0a, amber #f59e0b accents, minimalist, Inter typography, high contrast.",
    "language": "pt-BR"
  },
  "items": [
    {
      "id": "h1",
      "filename": "hero-abertura.png",
      "title": "Hero — abertura da LP",
      "category": "hero",
      "aspectRatio": "16:9",
      "prompt": "STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, Inter, 16:9. Hero image: glowing AI brain emerging from a digital forge, sparks flying, Portuguese title 'CONSTRUA COM IA' in bold amber letters."
    }
  ]
}
```

## Onde salvar

O `prompts.json` vive junto do projeto, NUNCA dentro da skill:
- Projeto em `~/aios-core/docs/projects/{name}/` → salvar em `{name}/prompts.json`
- Projeto externo em `~/CODE/Projects/{name}/` → salvar em `{name}/prompts.json`
- Assets estruturados: `{project}/assets/prompts.json`

## Validação

Antes de rodar o batch, o script valida:
- `items` é array não-vazio
- `id` únicos
- `filename` termina em `.png`
- `prompt` não-vazio

Falhas: aborta com mensagem clara antes de abrir browser.
