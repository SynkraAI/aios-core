# Template: Sales Call Script (High-Ticket)

```yaml
template_id: sales-call-script-tmpl
version: 1.0.0
tipo: output
clones_recomendados:
  estrutura: "@dan-kennedy"
  emocao: "@clayton-makepeace"
  objecoes: "@gary-bencivenga"
```

---

## ESTRUTURA DO SCRIPT (30-45 min)

### FASE 1: RAPPORT + QUALIFICACAO (5-10 min)

**Abertura:**
```
"Oi [nome], tudo bem? Antes de comecar, quero entender melhor sua situacao
para ver se realmente faz sentido conversarmos. Pode ser?"
```

**Perguntas de Qualificacao (Kennedy-style):**
```
1. "Me conta um pouco sobre seu [negocio/situacao] hoje."
   → Ouvir, nao interromper

2. "Qual o maior desafio que voce esta enfrentando agora?"
   → Anotar palavras exatas

3. "Ha quanto tempo isso e um problema?"
   → Estabelecer urgencia

4. "O que voce ja tentou para resolver?"
   → Mapear fracassos anteriores

5. "Se pudesse mudar UMA coisa, qual seria?"
   → Identificar dream outcome
```

**Filtro de Qualificacao (interno):**
```
[ ] Tem o problema que resolvemos?
[ ] Tem urgencia para resolver?
[ ] Tem capacidade de investir?
[ ] Esta no perfil do nosso cliente ideal?
→ Se 3/4 = SIM → Continuar
→ Se <3 = Encerrar educadamente
```

---

### FASE 2: APROFUNDAR DOR (5-10 min)

**Kennedy — Perguntas Profundas:**
```
6. "O que te mantem acordado a noite em relacao a isso?"
   → Dor emocional

7. "Como isso afeta outras areas da sua vida?"
   → Expandir consequencias

8. "O que acontece se nada mudar nos proximos 12 meses?"
   → Consequencia de nao agir

9. "O que voce gostaria que fosse diferente?"
   → Dream outcome em palavras DELES
```

**Makepeace — Amplificar (interno, nao verbalizar):**
```
Usar as palavras exatas do lead para refletir a dor.
"Entao o que voce esta me dizendo e que [dor nas palavras deles]
e isso esta causando [consequencia que mencionaram]... correto?"
```

> Regra: OUVIR mais do que falar nesta fase. 80% ouvir, 20% perguntar.

---

### FASE 3: APRESENTAR MECANISMO (5-10 min)

**Todd Brown — Por que agora e diferente:**
```
"O motivo pelo qual [solucoes anteriores] nao funcionaram e porque
elas focam em [abordagem errada].

O que descobrimos e que o problema real e [mecanismo do problema].

Por isso criamos [nome do metodo/programa] que ataca [causa raiz]
de forma diferente: [mecanismo da solucao em 3 passos]."
```

**Conectar com situacao do lead:**
```
"No seu caso, o Passo 1 seria [personalizar].
O Passo 2 resolveria exatamente [dor que mencionou].
E o Passo 3 te levaria a [dream outcome que falou]."
```

---

### FASE 4: STACK DE VALOR (5 min)

**Hormozi — Grand Slam verbal:**
```
"Para fazer isso acontecer, [programa] inclui:

1. [Componente 1] — que resolve [problema especifico deles]
2. [Componente 2] — que garante [resultado]
3. [Componente 3] — que acelera [tempo]

Alem disso, quem entra agora recebe:
- [Bonus 1] — que normalmente custaria R$[X]
- [Bonus 2] — exclusivo para quem decide hoje

O investimento total para tudo isso e R$[preco]."
```

---

### FASE 5: TRATAMENTO DE OBJECOES (5-10 min)

**Bencivenga — Antecipar e Neutralizar:**

| Objecao | Resposta |
|---------|----------|
| "E muito caro" | "Entendo. Me deixa fazer uma conta: se [programa] te gerar apenas [resultado minimo], em [tempo] voce teria [ROI]. O investimento se paga em [tempo]. O 'caro' seria nao ter isso e continuar [dor]." |
| "Preciso pensar" | "Claro. Me ajuda a entender: o que exatamente precisa pensar? E sobre [X] ou [Y]? Porque se for sobre [X], posso esclarecer agora..." |
| "Preciso falar com [conjuge/socio]" | "Faz total sentido. O que voce acha que [pessoa] vai perguntar? Posso te dar as respostas agora pra facilitar a conversa." |
| "Ja tentei e nao funcionou" | "Respeito muito isso. Me conta o que tentou? [Ouvir] A diferenca aqui e [mecanismo unico]. Enquanto [solucao anterior] foca em [X], nos atacamos [Y]." |
| "Nao e o momento" | "Entendo. Mas me deixa perguntar: quando SERIA o momento? Porque [consequencia de esperar]. O custo de esperar [tempo] e [calcular perda]." |

---

### FASE 6: CLOSE (3-5 min)

**Kennedy — 3 Opcoes:**
```
"[Nome], como eu vejo, voce tem 3 opcoes:

1. Nao fazer nada — continuar exatamente como esta,
   e daqui a 12 meses estar [consequencia].

2. Tentar resolver sozinho — o que ja tentou antes
   e [resultado que teve].

3. Entrar no [programa] — e em [tempo] estar
   [dream outcome nas palavras deles].

Qual faz mais sentido pra voce?"
```

**Se SIM:**
```
"Otimo. Vou te enviar o link agora. [Instrucoes de pagamento]
Assim que confirmar, voce recebe [proximo passo imediato]."
```

**Se NAO (pos-call follow-up):**
```
→ Enviar email resumo em 1 hora
→ Case study relevante em 24h
→ Oferta limitada em 48h
→ Ultimo contato em 72h
```

---

## POS-CALL CHECKLIST

- [ ] Lead qualificado corretamente?
- [ ] Dor aprofundada com palavras do lead?
- [ ] Mecanismo apresentado de forma personalizada?
- [ ] Stack de valor claro?
- [ ] Objecoes tratadas (nao ignoradas)?
- [ ] Close com 3 opcoes oferecido?
- [ ] Follow-up agendado se nao fechou?

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 6

  required_elements:
    - qualification_questions
    - pain_deepening_questions
    - mechanism_presentation
    - value_stack
    - objection_responses
    - three_option_close
    - followup_sequence

  quality_checks:
    - name: Qualification Filter
      rule: "Minimum 5 qualifying questions present with clear go/no-go criteria"
      severity: CRITICAL

    - name: Pain Discovery
      rule: "Minimum 4 pain-deepening questions using Kennedy methodology"
      severity: CRITICAL

    - name: Active Listening Ratio
      rule: "Script indicates 80/20 listen-to-talk ratio in discovery phase"
      severity: HIGH

    - name: Mechanism Clarity
      rule: "Unique mechanism clearly explained in 3 steps with personalization"
      severity: HIGH

    - name: Objection Coverage
      rule: "Top 5 objections mapped with specific responses"
      severity: HIGH

    - name: Close Structure
      rule: "3-option close present with clear consequences for each"
      severity: HIGH

    - name: Personalization Points
      rule: "Script includes placeholders for lead-specific customization"
      severity: MEDIUM

    - name: Follow-up Mapped
      rule: "Post-call follow-up sequence defined (if no immediate close)"
      severity: MEDIUM

  word_count:
    script:
      min: 1500
      max: 3500
    objection_response:
      min: 50
      max: 150

  veto_conditions:
    - "Less than 4 qualification questions"
    - "No pain-deepening questions"
    - "Mechanism not clearly defined"
    - "Less than 3 objections mapped"
    - "No 3-option close"
    - "Script is monologue (no listening built in)"
    - "No follow-up sequence for no-close"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
