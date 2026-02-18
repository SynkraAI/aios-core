# Template: Newsletter Semanal

```yaml
template_id: newsletter-tmpl
version: 1.0.0
tipo: output
clones_recomendados:
  estilo_pessoal: "@gary-halbert"
  estilo_framework: "@dan-koe"
  audit: "@claude-hopkins"
```

---

## FORMATO A: ESTILO HALBERT (Carta Pessoal)

### Estrutura:
```
SUBJECT: [Curiosa/pessoal — como assunto de email de amigo]

---

Oi [nome],

[INTRO PESSOAL — 2-3 paragrafos]
O que aconteceu esta semana / o que esta na minha cabeca.
Tom: intimo, vulneravel, como conversa com amigo.
Gancho para o tema do dia.

---

[HISTORIA DA SEMANA — 3-5 paragrafos]
Algo que aconteceu (real) que ensina uma licao.
Detalhes sensoriais (Halbert adora detalhes).
Conflito/tensao → Resolucao → Licao.

---

[LICAO / INSIGHT — 2-3 paragrafos]
O que aprendi com isso.
Como se aplica ao leitor.
Framework ou principio util.

---

[APLICACAO — 1-2 paragrafos]
O que fazer com isso amanha.
1 passo concreto.

---

[SOFT SELL — 2-3 linhas]
"Se voce quer ir mais fundo em [tema], [produto/servico] pode te ajudar."
[Link]

PS. [Resumo + CTA direto — MUITO lido]
PPS. [Bonus/urgencia/curiosidade extra — opcional]
```

**Regras Halbert para Newsletter:**
- Paragrafos curtos (2-3 linhas MAX)
- Linguagem simples (nivel 5a serie)
- "Voce" constantemente
- Parenteses para intimidade (assim como estou fazendo agora)
- Sublinhado para enfase
- PS. SEMPRE — e a parte mais lida depois da headline

---

## FORMATO B: ESTILO KOE (Framework + Valor)

### Estrutura:
```
SUBJECT: [Framework/promessa especifica — "3 principios que..." / "O erro de..."]

---

[INTRO — 2 paragrafos]
O que esta na minha cabeca.
Por que esse tema importa agora.

---

## [BIG IDEA — titulo do conceito]

[Explicacao do conceito central — 3-4 paragrafos]
Algo que faz pensar diferente.
Contraditorio se possivel ("o oposto do que voce ouve").

---

## Como Aplicar

[Framework pratico — numerado]
1. [Passo 1 — com exemplo]
2. [Passo 2 — com exemplo]
3. [Passo 3 — com exemplo]

---

## Takeaway

[1 paragrafo com a licao central]
[O que fazer AGORA — 1 acao concreta]

---

[SOFT SELL — embutido naturalmente]
"Criei [produto] exatamente pra resolver isso. Se faz sentido: [link]"
```

**Regras Koe para Newsletter:**
- Formatacao escaneavel (headers, bullets, numeros)
- Big Idea que faz PENSAR (nao so informar)
- Frameworks uteis e aplicaveis
- Ratio 80% valor / 20% pitch
- Sem medo de opiniao forte

---

## CALENDARIO DE TEMAS (Exemplo Mensal)

| Semana | Tema | Estilo |
|--------|------|--------|
| 1 | Historia pessoal + licao | Halbert |
| 2 | Framework pratico | Koe |
| 3 | Bastidores + vulnerabilidade | Halbert |
| 4 | Big Idea controversa | Koe |

---

## SUBJECT LINES QUE FUNCIONAM

**Estilo Halbert (pessoal):**
- "O pior conselho que ja recebi"
- "Isso aconteceu na terca..."
- "Preciso te contar uma coisa"
- "O dia que quase desisti"
- "Meu maior erro (e o que aprendi)"

**Estilo Koe (framework):**
- "3 frameworks que uso toda semana"
- "O mito de [X] que esta custando caro"
- "Como fiz [resultado] em [tempo]"
- "Pare de fazer [erro comum]"
- "O principio de [nome] que muda tudo"

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 4

  required_elements:
    - subject_line
    - personal_intro
    - value_content
    - actionable_takeaway
    - soft_sell
    - ps

  quality_checks:
    - name: Subject Line Hook
      rule: "Subject line must be personal or curiosity-driven (not salesy)"
      severity: CRITICAL

    - name: Personal Connection
      rule: "First 2-3 paragraphs establish intimate, personal tone"
      severity: CRITICAL

    - name: Value Delivery
      rule: "Core content teaches useful framework or shares actionable insight"
      severity: HIGH

    - name: Paragraph Length
      rule: "Paragraphs max 2-3 lines (Halbert standard)"
      severity: HIGH

    - name: Reading Level
      rule: "Language at 5th grade level or simpler"
      severity: HIGH

    - name: Personality Presence
      rule: "Voice is distinctive and consistent with sender personality"
      severity: MEDIUM

    - name: Soft Sell Integration
      rule: "CTA is natural and non-pushy (80/20 value-to-pitch ratio)"
      severity: MEDIUM

    - name: PS Power
      rule: "PS is present and reinforces main message or adds urgency"
      severity: MEDIUM

    - name: Engagement CTA
      rule: "Includes reply encouragement or engagement prompt"
      severity: MEDIUM

  word_count:
    halbert_style:
      min: 400
      max: 1200
    koe_style:
      min: 600
      max: 1500

  veto_conditions:
    - "Subject line is generic or salesy"
    - "Intro is impersonal or corporate"
    - "No actionable value delivered"
    - "PS is missing"
    - "Pitch exceeds 30% of content"
    - "Paragraphs are too long (no white space)"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
