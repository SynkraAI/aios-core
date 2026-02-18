# Template: Webinar Script (60-90 min)

```yaml
template_id: webinar-script-tmpl
version: 1.0.0
tipo: output
clones_recomendados:
  estrutura: "@jon-benson"
  conteudo: "@todd-brown"
  historia: "@gary-halbert"
  emocao: "@clayton-makepeace"
  oferta: "@alex-hormozi"
  objecoes: "@gary-bencivenga"
  close: "@dan-kennedy"
```

---

## ESTRUTURA DO WEBINAR

### BLOCO 1: ABERTURA (0-10 min)

**Slide 1: Hook de Abertura (Benson — Snap Suggestion)**
```
"Nos proximos [X] minutos, vou revelar [promessa especifica]
que [resultado mensuravel] em [tempo]..."

"Isso e diferente de tudo que voce ja viu porque [diferencial]"
```

**Slide 2-3: Credenciais Rapidas**
```
- [Quem sou eu — 1 paragrafo]
- [Prova de resultado — numeros]
- [Por que voce deveria me ouvir — credencial relevante]
```

**Slide 4-5: Promessa do Webinar**
```
Hoje voce vai aprender:
1. [Promessa 1 — resolver dor principal]
2. [Promessa 2 — framework/metodo]
3. [Promessa 3 — resultado tangivel]

E no final, vou te mostrar como [resultado maior] — se quiser ir mais fundo.
```

---

### BLOCO 2: HISTORIA DE ORIGEM (10-20 min)

**Halbert-style storytelling:**
```
[Situacao ANTES — vulnerabilidade, fracasso, dor]
[Momento de crise — ponto mais baixo]
[Descoberta — o que mudou tudo]
[Transformacao — resultado alcancado]
[Conexao com audiencia — "e eu sei que voce esta passando por algo parecido"]
```

> Regra: Historia DEVE criar identificacao. Nao e sobre voce — e sobre eles se verem em voce.

---

### BLOCO 3: CONTEUDO / ENSINO (20-50 min)

**Todd Brown — 3 Grandes Revelacoes:**

**Revelacao 1: O Problema Real (10 min)**
```
[Por que a maioria falha — mecanismo do problema]
[A verdade que ninguem conta]
[Dados/provas que suportam]
[Mini-aha moment para audiencia]
```

**Revelacao 2: O Mecanismo Unico (10 min)**
```
[O que descobrimos/desenvolvemos]
[Como funciona — explicacao simples]
[Por que e diferente de tudo que ja tentaram]
[Case study rapido demonstrando]
```

**Revelacao 3: O Framework/Sistema (10 min)**
```
[Passo 1 do framework — detalhar]
[Passo 2 do framework — detalhar]
[Passo 3 do framework — detalhar]
[Resultado de quem aplicou — prova]
```

> Regra Todd Brown: Entregar valor REAL. Audiencia deve sair com algo util mesmo sem comprar.

---

### BLOCO 4: TRANSICAO PARA OFERTA (50-55 min)

**Makepeace — Emocao + Future Pacing:**
```
[Recapitular transformacao possivel]
[Future pacing: "Imagine daqui a [tempo]..."]
[Agitar custo de NAO agir]
[Transicao: "Para quem quer ir mais fundo, criei algo especial..."]
```

---

### BLOCO 5: PITCH / OFERTA (55-75 min)

**Hormozi — Grand Slam Offer:**
```
[Apresentar produto/programa]

Componente 1: [Nome] — Valor R$[X]
[O que resolve + por que e valioso]

Componente 2: [Nome] — Valor R$[Y]
[O que resolve + por que e valioso]

Componente 3: [Nome] — Valor R$[Z]
[O que resolve + por que e valioso]

BONUS 1: [Nome] — Valor R$[W] (se inscrever hoje)
BONUS 2: [Nome] — Valor R$[V] (primeiros X)

VALOR TOTAL: R$[soma]
INVESTIMENTO: R$[preco]

GARANTIA: [tipo + tempo]
```

**Bencivenga — Quebrar Objecoes:**
```
"Sei que voce pode estar pensando..."

Objecao 1: [Preco] → [Calcular ROI]
Objecao 2: [Tempo] → [Mostrar que e rapido]
Objecao 3: [Confianca] → [Garantia + provas]
Objecao 4: ["Ja tentei"] → [Por que agora e diferente — mecanismo]
```

---

### BLOCO 6: CLOSE (75-90 min)

**Kennedy — Close Direto:**
```
[Resumir 3 opcoes:]
1. Nao fazer nada (consequencias)
2. Tentar sozinho (dificuldades)
3. Usar [programa] (beneficios)

[CTA claro e repetido]
[Urgencia real (vagas, bonus, preco)]
[Ultimas provas sociais]
[CTA final]
```

**Q&A (se aplicavel):**
```
[Responder perguntas — sempre conectar de volta a oferta]
[Usar perguntas como oportunidade de vender]
[Fechar com CTA final]
```

---

## SEQUENCIA DE EMAILS (10 emails)

| Email | Momento | Objetivo | Clone |
|-------|---------|----------|-------|
| 1 | Inscricao | Confirmar + gerar expectativa | Chaperon |
| 2 | -2 dias | Conteudo pre-webinar + case | Chaperon |
| 3 | -1 dia | Lembrete + razao para assistir | Chaperon |
| 4 | -1 hora | Lembrete urgente | Carlton |
| 5 | Ao vivo | Link + FOMO | Carlton |
| 6 | +1 dia | Replay + resumo do que perdeu | Chaperon |
| 7 | +2 dias | Case study detalhado | Halbert |
| 8 | +3 dias | FAQ / objecoes | Bencivenga |
| 9 | +4 dias | Ultimo dia de bonus | Settle |
| 10 | +5 dias | Carrinho fecha — urgencia final | Carlton |

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 6

  required_elements:
    - opening_hook
    - credentials
    - webinar_promise
    - origin_story
    - three_revelations
    - transition_to_offer
    - pitch_stack
    - objection_handling
    - close
    - email_sequence

  quality_checks:
    - name: Opening Hook
      rule: "First 3 minutes establish clear promise and snap suggestion"
      severity: CRITICAL

    - name: Content Value
      rule: "All 3 revelations deliver real value (Todd Brown standard)"
      severity: CRITICAL

    - name: Story Connection
      rule: "Origin story creates identification with audience pain"
      severity: HIGH

    - name: Pitch Transition
      rule: "Smooth transition from content to offer using future pacing"
      severity: HIGH

    - name: Value Stack
      rule: "Minimum 3 core components + 2 bonuses with individual pricing"
      severity: HIGH

    - name: Objection Coverage
      rule: "Minimum 4 major objections addressed before close"
      severity: HIGH

    - name: Close Structure
      rule: "3-option close present (do nothing, DIY, program)"
      severity: HIGH

    - name: Email Sequence
      rule: "10-email sequence mapped with timing and objectives"
      severity: MEDIUM

    - name: Timing Balance
      rule: "Content 50-60%, Pitch 25-35%, Close 10-15%"
      severity: MEDIUM

  word_count:
    script:
      min: 3000
      max: 6000
    email_sequence:
      min: 200
      max: 600

  veto_conditions:
    - "Opening hook is weak or generic"
    - "Less than 3 revelations in content block"
    - "No clear unique mechanism presented"
    - "Value stack missing or incomplete"
    - "Less than 3 objections addressed"
    - "No 3-option close"
    - "Email sequence has less than 8 emails"
    - "Pitch takes more than 40% of total time"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
