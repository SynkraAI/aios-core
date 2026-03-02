---
task: Brand Voice & Messaging
owner: ann-handley
phase: 7
elicit: false
atomic_layer: task
Entrada: |
  - brand_purpose: WHY Statement (de Simon Sinek)
  - brand_name: Nome selecionado (de Alexandra Watkins)
  - consumer_insights: Audience Archetypes (de Malcolm Gladwell)
Saida: |
  - brand_voice_guide: Guia completo de voz de marca
  - messaging_framework: Brand promise, tagline, elevator pitch, key messages
---

# Brand Voice & Messaging — Ann Handley

Define a voz de marca, tom de voz por contexto, e messaging framework completo.
Entrega Brand Voice Guide e Core Messaging que todo escritor pode seguir.

## Processo

### Fase 1: Voice Discovery

Ann conduz o processo de descoberta da voz:

**De onde vem a voz:**
```
A voz de uma marca não é inventada — é descoberta.
Ela já existe na cultura da empresa, no jeito dos fundadores,
nos clientes mais apaixonados. Nosso trabalho é articulá-la.

Perguntas de descoberta:

1. Se a marca fosse uma pessoa em uma festa, como se apresentaria?
   (Não "sou um profissional de X" — como REALMENTE se apresentaria)

2. Qual é o email mais humano que alguém da empresa já escreveu?
   (Pedir exemplos reais — a voz está ali)

3. Como os melhores clientes descrevem a empresa para amigos?
   (Reviews, NPS verbatim, transcrições de call)

4. Se a marca fosse apresentada no TED Talk, qual seria o estilo do apresentador?
   (Apaixonado, acadêmico, irreverente, poético, direto)

5. Que livros ou podcasts a marca recomendaria para clientes?
   (O gosto revela a voz)

6. Se a marca enviasse um email de desculpas por um erro, como soaria?
   (Teste de autenticidade — erros revelam o caráter real)
```

### Fase 2: Character Definition

**Formato "X, but never Y":**
```
A voz de [MARCA] é:

[Adjetivo 1], but never [extremo oposto negativo]
[Adjetivo 2], but never [extremo oposto negativo]
[Adjetivo 3], but never [extremo oposto negativo]
[Adjetivo 4], but never [extremo oposto negativo]
[Adjetivo 5], but never [extremo oposto negativo]

Exemplos típicos:
- Confident, but never arrogant
- Warm, but never saccharine
- Playful, but never silly
- Direct, but never rude
- Expert, but never condescending
- Conversational, but never sloppy
- Optimistic, but never naive
```

### Fase 3: Tone Variations

**Voice vs. Tone:**
```
VOICE = quem você é (constante)
TONE = como você soa em cada contexto (adapta)

Imagine um professor brilhante:
- Com alunos novos: paciente, didático, encorajador
- Com colegas: técnico, preciso, questionador
- Em celebração: expansivo, generoso, emocionado
A VOZ (o professor) é a mesma. O TOM muda.
```

**Mapeamento de Tom por Contexto:**
```yaml
tone_map:
  social_media:
    shift: "Mais casual, mais conversacional, mais curto"
    permission: "Mais personalidade, pode ser mais ousado"
    example_before: "[como não fazer]"
    example_after: "[como fazer]"

  email_marketing:
    shift: "Pessoal mas respeitoso, claro e focado"
    permission: "Uma ideia por email — sem diluição"

  website_homepage:
    shift: "Confiante e convidativo — a primeira impressão"
    permission: "Mais polish, menos gíria"

  customer_support:
    shift: "Mais empático, mais paciente, menos promocional"
    permission: "Empatia primeiro, solução segundo"

  blog_long_form:
    shift: "Mais educativo, mais profundo, com mais nuance"
    permission: "Pode ser mais opinionated"

  crisis_communication:
    shift: "Sério, claro, humano — nunca corporativo"
    permission: "Menos 'nós entendemos' — mais 'fizemos errado, veja o que fazemos'"

  celebrating_wins:
    shift: "Mais generoso com emoção, mais expansivo"
    permission: "Pode ser mais expressivo e grato"
```

### Fase 4: Vocabulary

**Palavras que Possuímos:**
```
[15-20 palavras que definem o vocabulário da marca]
[Palavras que, quando a audiência lê, pensam na marca]
[Podem incluir palavras reinventadas com significado exclusivo]
```

**Palavras que Evitamos:**
```
Categorias de palavras proibidas:

1. Corporate Speak (nunca usar):
   synergy, leverage, paradigm shift, utilize, solutions,
   world-class, best-in-class, innovative, disruptive,
   thought leader, holistic, robust, scalable

2. Palavras de Competidores (nunca usar):
   [palavras que são "de" um concorrente específico]

3. Palavras Genéricas da Categoria (usar com cuidado):
   [palavras que todos na categoria usam — se usar, usar diferente]

4. Palavras que Contradizem a Voz:
   [palavras que contradizem os adjetivos definidos em Fase 2]
```

**Gramática e Estilo:**
```
Regras específicas de escrita:

1. Voz ativa: "Nós resolvemos" não "O problema é resolvido"
2. Contrações: [permitidas / não permitidas] — "[justificativa]"
3. Frases curtas: Máximo [X] palavras por frase em digital
4. Parágrafos: Máximo [X] frases em digital
5. Oxford comma: [sim / não]
6. Números: [soletrar até dez / sempre numeral]
7. Em dash vs. parênteses: [preferência]
8. Exclamação: [sparingly / nunca / liberalmente]
9. Perguntas retóricas: [encorajadas / evitar]
10. Voz do leitor: [você / tu / vocês — consistência]
```

### Fase 5: Messaging Framework

**Brand Promise:**
```
Para [AUDIÊNCIA PRIMÁRIA],
[MARCA] entrega [OUTCOME EMOCIONAL]
através de [DIFERENCIADOR].

Nota: Brand Promise ≠ Tagline
A Promise é interna (guia decisões).
A Tagline é externa (o que o mundo vê).
```

**Tagline:**
```
Critérios de Handley para taglines:

✓ Soa como essa marca e mais nenhuma
✓ Funciona sem o nome da marca junto (independente)
✓ Resiste ao tempo — não é "de campanha"
✓ 3-7 palavras (raramente mais)
✓ Pode ser dita em qualquer contexto sem parecer forçado

Gerar 5-10 opções antes de filtrar:
[opção 1] — [por que funciona ou não]
[opção 2] — [avaliação]
...
TOP 3: [melhores candidatos com justificativa]
```

**Elevator Pitch:**
```
1 sentença, qualquer audiência, qualquer contexto.

Formato: "Ajudamos [AUDIÊNCIA] a [VERBO + OUTCOME] através de [HOW]."

Princípio Handley: A sentença deve fazer a pessoa responder
"Como assim?" — não "Ah, entendi." (curiosidade > clareza imediata)
```

**Key Messages:**
```
3-5 mensagens centrais que toda comunicação reforça.
Cada mensagem deve ser:
- Verdadeira e comprovável (não aspiracional)
- Diferenciada (não pode ser dita por qualquer concorrente)
- Relevante para a audiência primária
- Conectada ao WHY (Simon Sinek)

Formato de cada mensagem:
CLAIM: "[A mensagem em 1 frase]"
PROOF: "[Como provamos isso — dado, história, exemplo]"
WHY IT MATTERS: "[Por que a audiência se importa]"
```

## Deliverable: Brand Voice Guide

```markdown
# Brand Voice Guide: [Nome da Marca]
**Brand Voice Director:** Ann Handley
**Data:** [data]

---

## Nossa Personalidade em Palavras

[MARCA] soa como [3 adjetivos positivos].
Nunca como [3 adjetivos que contradizem a voz].

Nossa voz é:
- [Adjetivo], but never [extremo oposto]
- [Adjetivo], but never [extremo oposto]
- [Adjetivo], but never [extremo oposto]
- [Adjetivo], but never [extremo oposto]
- [Adjetivo], but never [extremo oposto]

---

## Tom por Contexto

| Contexto | Tom | Exemplo Certo | Exemplo Errado |
|----------|-----|--------------|----------------|
| Redes Sociais | [tom] | [frase] | [frase] |
| Email | [tom] | [frase] | [frase] |
| Site | [tom] | [frase] | [frase] |
| Suporte | [tom] | [frase] | [frase] |
| Blog | [tom] | [frase] | [frase] |

---

## Vocabulário de Marca

### Palavras que Possuímos
[lista de 15-20 palavras]

### Palavras que Evitamos
[lista com categorias e exemplos]

---

## Gramática e Estilo
[10 regras específicas]

---

## Messaging Framework

**Brand Promise (interno):**
"Para [audiência], [marca] entrega [outcome] através de [diferenciador]."

**Tagline (externo):**
"[3-7 palavras]"
*Por que funciona:* [justificativa]

**Elevator Pitch:**
"[1 sentença]"

**Key Messages:**
1. **[Claim]** — Prova: [como provamos]
2. **[Claim]** — Prova: [como provamos]
3. **[Claim]** — Prova: [como provamos]

---

## Exemplos Práticos

### Antes e Depois (3 exemplos de transformação)

**Contexto:** [ex: Post de Instagram sobre produto novo]

❌ Antes: "[versão corporativa/genérica]"
✅ Depois: "[versão com voz da marca]"
*Por que funciona:* [conexão com os adjetivos de voz]
```
