# Template: Post Organico / Thread

```yaml
template_id: post-organico-tmpl
version: 1.0.0
tipo: output
clones_recomendados:
  principal: "@dan-koe"
  storytelling: "@gary-halbert"
  premium: "@david-ogilvy"
```

---

## FORMATO 1: POST CURTO (Twitter/X, LinkedIn, Instagram)

### Tipo A — CONTRARIAN
```
[HOOK — 1 linha que desafia crenca comum]

[2-3 linhas explicando por que a crenca esta errada]

[O que funciona de verdade — 2-3 linhas]

[Takeaway em 1 frase]

[CTA de engajamento: "Concorda?" / "Salva pra depois"]
```

**Exemplo:**
```
Voce nao precisa de disciplina.

Disciplina e o que pessoas sem sistema usam pra se sentir produtivas.

O que voce precisa e de um SISTEMA que elimina a necessidade de motivacao.

Motivacao e combustivel. Sistema e o motor.

Construa o motor primeiro.
```

### Tipo B — HOW-TO / LIST
```
[HOOK — "[Numero] [coisas] que [resultado/mudaram X]"]

1. [Item 1 — 1-2 linhas]
2. [Item 2 — 1-2 linhas]
3. [Item 3 — 1-2 linhas]
[...]

[Takeaway final]

[CTA: "Qual voce usaria primeiro?"]
```

### Tipo C — STORY
```
[HOOK — "Em [ano], eu estava [situacao ruim]."]

[Setup — 2-3 frases de contexto]

[Conflito/momento de crise]

[Virada — o que descobriu/mudou]

[Resultado — especifico, mensuravel]

[Licao em 1-2 frases]

[CTA: "Ja passou por algo parecido?"]
```

### Tipo D — BOLD CLAIM
```
[HOOK — Afirmacao forte/controversa]

[Por que acredita nisso — 3-4 linhas]

[Prova ou exemplo — 2-3 linhas]

[Implicacao para o leitor]

[CTA de debate: "Mude minha opiniao" / "Discorda?"]
```

### Tipo E — BEHIND-THE-SCENES
```
[HOOK — "Vou te mostrar como [faco X] nos bastidores"]

[Processo passo a passo — formato simples]

[Resultado que esse processo gera]

[O que a maioria faz de errado]

[CTA: "Quer ver mais bastidores?"]
```

---

## FORMATO 2: THREAD LONGA (Twitter/X)

### Estrutura (8-12 tweets):
```
Tweet 1: [HOOK devastador — 1 frase que para o scroll]
          ↓

Tweet 2: [CONTEXTO — por que isso importa / setup]
          ↓

Tweet 3: [PONTO 1 — primeiro insight/framework]
          ↓

Tweet 4: [Aprofundar Ponto 1 — exemplo pratico]
          ↓

Tweet 5: [PONTO 2 — segundo insight/framework]
          ↓

Tweet 6: [Aprofundar Ponto 2 — exemplo ou caso]
          ↓

Tweet 7: [PONTO 3 — terceiro insight/framework]
          ↓

Tweet 8: [Aprofundar Ponto 3 — prova/dado]
          ↓

Tweet 9: [RESUMO — recapitular 3 pontos em bullets]
          ↓

Tweet 10: [CTA — follow, newsletter, retweet, save]
```

**Hooks de Thread que Viralizam:**
- "Estudei [X] por [tempo]. Aqui esta tudo que aprendi:"
- "[Numero] frameworks de [tema] que uso toda semana:"
- "O segredo de [resultado] em [tempo] (thread):"
- "Li [numero] livros sobre [tema]. Os 3 melhores insights:"

---

## FORMATO 3: CARROSSEL (Instagram/LinkedIn)

### Estrutura (8-10 slides):
```
Slide 1: [HEADLINE — grande, bold, parar scroll]
Slide 2: [PROBLEMA — agitar dor]
Slide 3: [ERRO 1 que maioria comete]
Slide 4: [ERRO 2 que maioria comete]
Slide 5: [SOLUCAO — framework em 3 passos]
Slide 6: [PASSO 1 — detalhar]
Slide 7: [PASSO 2 — detalhar]
Slide 8: [PASSO 3 — detalhar]
Slide 9: [RESULTADO — prova/caso]
Slide 10: [CTA — follow, salvar, comentar]
```

---

## REGRAS GERAIS (Dan Koe)

1. **Hook decide tudo** — se a primeira linha nao para o scroll, o resto nao importa
2. **Escaneavel** — formatacao que permite ler rapido (espacos, bullets, numeros)
3. **Value Creation > Value Capture** — 80% valor, 20% pitch (maximo)
4. **Nicho de Um** — seus interesses unicos sao o diferencial
5. **Consistencia > Viralidade** — 1 post/dia por 1 ano > 1 viral

---

## BANCO DE HOOKS REUTILIZAVEIS

| Tipo | Formula |
|------|---------|
| Contrarian | "Tudo que voce aprendeu sobre [X] esta errado" |
| Curiosity | "Fiz [resultado impressionante] usando uma tecnica de [ano]" |
| Specific | "[Numero] frameworks de [X] que uso toda semana" |
| Story | "Em [ano], eu estava [ruim]. Hoje [bom]. Aqui esta o que mudou:" |
| Bold | "Voce nao precisa de [coisa que todos acham necessaria]" |
| Question | "Por que [%] das pessoas falham em [X]?" |
| Number | "Passei [tempo] estudando [tema]. [Numero] coisas que aprendi:" |

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 3

  required_elements:
    - hook_first_line
    - value_body
    - engagement_cta

  quality_checks:
    - name: Hook Power
      rule: "First line must stop scroll (contrarian, bold claim, curiosity, or story opener)"
      severity: CRITICAL

    - name: Scannability
      rule: "Formatted for quick scanning (line breaks, bullets, numbers, emojis)"
      severity: CRITICAL

    - name: Value Ratio
      rule: "80% value delivery, maximum 20% pitch"
      severity: HIGH

    - name: Takeaway Clarity
      rule: "Single clear takeaway or action item present"
      severity: HIGH

    - name: Engagement Hook
      rule: "CTA encourages engagement (question, debate, save, share)"
      severity: MEDIUM

    - name: Platform Optimization
      rule: "Format optimized for target platform (Twitter length, LinkedIn professionalism, IG visual)"
      severity: MEDIUM

    - name: Voice Consistency
      rule: "Matches sender's established voice and niche"
      severity: MEDIUM

  word_count:
    short_post:
      min: 50
      max: 200
    thread:
      min: 400
      max: 1200
    carousel:
      min: 150
      max: 400

  veto_conditions:
    - "Hook is generic or fails to stop scroll"
    - "No clear value delivered"
    - "Pure pitch (no educational content)"
    - "Engagement CTA missing"
    - "Format not scannable (wall of text)"
    - "Voice is generic or inconsistent"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
