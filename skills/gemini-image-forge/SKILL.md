---
name: gemini-image-forge
description: Orquestra geração em lote de imagens via Gemini Web (gemini.google.com) usando Playwright. Use esta skill quando o usuário precisa gerar várias imagens a partir de prompts pré-estruturados (id, filename, prompt, aspectRatio), evitando o custo da API Imagen e usando o tier gratuito da UI web. Fluxo em duas fases — Fase 1 (Claude gera prompts.json a partir de um documento), Fase 2 (Playwright automatiza o Gemini Web e baixa as imagens com os filenames corretos).
---

# Gemini Image Forge

Skill para geração em lote de imagens via automação de browser do Gemini Web. Substitui a abordagem "API Imagen paga" pela "UI gratuita automatizada".

## Por que esta skill existe

A API Imagen do Google Cloud exige billing ativo mesmo pra 1 imagem. Custo real: R$ 0,35–5,00 por imagem. O Gemini Web (gemini.google.com) gera de graça dentro da cota diária (~500 imagens). Esta skill abre o Gemini Web logado no perfil do usuário, cola o prompt, espera a imagem, baixa com o filename correto — automação pura do que um humano faria clicando.

## Quando usar

- O usuário tem um documento (briefing, PRD, roteiro) e precisa de N imagens pra ilustrar
- O usuário já tem uma lista estruturada de prompts e quer gerar em lote
- O usuário pediu "gera essas imagens pra mim" com quantidade > 3
- O usuário reclamou de custo da API Imagen

## Quando NÃO usar

- Apenas 1–2 imagens (use a skill `image-creator` ou gere manual)
- Precisa de modelos específicos não-Imagen (DALL-E, Flux, SD — use ferramentas específicas)
- Ambiente headless sem Chrome/X display (Gemini Web exige browser real)

## Fluxo em Duas Fases

### Fase 1 — Prompt Factory (Claude)

O usuário fornece um documento fonte (PRD, roteiro, briefing). Claude lê e gera `prompts.json` estruturado.

**Discovery obrigatório antes de gerar:** usar `AskUserQuestion` com as perguntas de `references/prompt-schema.md` (seção "Discovery Questions"):
1. Estilo visual predominante (editorial dark? vintage? screenshot mockup? cinematic?)
2. Paleta de cores principal (se houver brand)
3. Aspect ratio dominante (16:9 / 1:1 / 4:3 / 9:16)
4. Categorias das imagens (diagrama/slide/profissao/hero/etc.)
5. Quantidade aproximada por categoria

Após as respostas, Claude gera `prompts.json` no formato:
```json
{
  "meta": {
    "project": "nome-projeto",
    "created": "YYYY-MM-DD",
    "style_anchor": "...texto herdado por prompts que não redefinem..."
  },
  "items": [
    {
      "id": "d1",
      "filename": "01-kebab-case.png",
      "title": "Título humano",
      "category": "diagrama",
      "aspectRatio": "16:9",
      "prompt": "Prompt completo aqui..."
    }
  ]
}
```

**Validações obrigatórias no JSON gerado:**
- Todo `filename` em kebab-case terminando em `.png`
- Todo `id` único
- Todo `prompt` com pelo menos um `STYLE ANCHOR:` no começo (pode herdar de `meta.style_anchor`)
- Texto pt-BR dentro dos prompts com acentuação completa (Artigo VII)

Salvar em: `{projeto}/prompts.json` — NUNCA dentro da skill.

### Fase 2 — Batch Playwright (Script)

Rodar o script `scripts/batch-generate.cjs`:

```bash
node ~/aios-core/skills/gemini-image-forge/scripts/batch-generate.cjs \
  --prompts "/path/to/prompts.json" \
  --output "/path/to/imagens" \
  --mode preflight   # primeiro sempre preflight
```

**Modos:**
- `preflight` — roda só o primeiro item, valida selectors, confirma login, aborta. Use sempre na primeira vez do dia
- `full` — roda o batch completo a partir do state file
- `resume` — retoma de onde parou (lê `state.json` do output dir)
- `only` — regera IDs específicos: `--only d1,d3,p5`
- `category` — filtra por categoria: `--category diagrama`
- `dry` — mostra o que faria, não gera

**Login inicial (primeira execução):**
1. Script abre Chrome persistente em `~/.gemini-image-forge/chrome-profile`
2. Navega pra https://gemini.google.com/app
3. Se não estiver logado: PAUSA, chama o usuário pra logar manualmente
4. Usuário loga → aperta ENTER no terminal → script valida login → salva state
5. Próximas execuções reutilizam o perfil

**Durante o batch:**
- Uma imagem por vez (nunca paralelo — Google detecta bot)
- Pausa aleatória 15–30s entre imagens (simula humano)
- State file atualizado após cada sucesso/falha
- Se CAPTCHA aparecer: pausa, bipa (terminal bell), espera usuário resolver, continua
- Se safety filter bloquear prompt: marca como `blocked`, continua pro próximo

**Output esperado:**
```
🟢 Pre-flight OK (1/1)
🟡 Iniciando batch: 32 imagens
[1/32] d1  01-executor-orquestrador.png     ✓ 18s
[2/32] d2  02-vibe-coding-vs-sdd.png         ✓ 22s
[3/32] d3  03-janela-contexto.png            ✗ safety_filter
...
🟢 29 geradas | 🟡 2 retry | 🔴 1 safety_filter
📁 /Users/luizfosc/.../imagens/batch-2026-04-11/
```

## Arquivos Importantes

| Path | Propósito |
|------|-----------|
| `scripts/batch-generate.cjs` | Runner Playwright principal |
| `scripts/sanitize-prompts.cjs` | Remove conteúdo que dispara safety filter (nomes de pessoas reais, marcas registradas) |
| `references/gemini-web-selectors.md` | Seletores CSS/ARIA do Gemini Web. **ATUALIZAR quando UI mudar.** |
| `references/prompt-schema.md` | Schema do prompts.json + discovery questions da Fase 1 |
| `references/troubleshooting.md` | CAPTCHA, bot detection, safety filter, selectors quebrados |
| `templates/prompts.example.json` | Exemplo de referência |

## Princípios

- **Sequencial sempre** — paralelismo é ban garantido
- **Perfil Chrome persistente** — login uma vez, usa sempre
- **State file é fonte de verdade** — script lê do state, não assume nada
- **Sanitização antes de enviar** — nomes próprios famosos (Steve Jobs, Elon Musk) viram "tech founder silhouette"
- **Pre-flight obrigatório** — nunca rode full sem preflight do dia
- **Não sobrescreve** — se filename já existe no output, pula por default (override com `--force`)
- **pt-BR quality** — prompts em pt-BR têm acentuação completa (Artigo VII Constitution)

## Troubleshooting Rápido

| Sintoma | Ação |
|---------|------|
| "Selectors not found" | Ler `references/gemini-web-selectors.md` + rodar `--mode preflight --debug` |
| CAPTCHA no meio do batch | Script pausa automaticamente, resolva no browser, aperte ENTER |
| Safety filter bloqueia | Rodar `scripts/sanitize-prompts.cjs` antes do batch |
| Login expirou | Deletar `~/.gemini-image-forge/chrome-profile` e logar de novo |
| Imagem gerada sem download | Verificar se o Gemini renderizou — pode ser bug do Imagen nesse prompt |

## Integração com outras skills

- **lp-generator** — pode usar esta skill pra gerar heros de LPs
- **content-forge** — pode delegar geração de thumbnails
- **forge** — pipeline de app pode chamar no step de assets

---

**Versão**: 1.0
**Constituição**: CLI First ✓ | pt-BR quality ✓ | No invention ✓
