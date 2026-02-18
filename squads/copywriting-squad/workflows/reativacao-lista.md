# Workflow: Reativação de Lista Morta

## Metadados
```yaml
id: reativacao-lista
versao: 1.1.0
duracao: 3-5 dias de campanha
complexidade: media
output: Sequência de reengajamento + limpeza de lista
dependencies:
  optional_pre:
    - email-diario-lucrativo.md (lista que parou de engajar)
  feeds_into:
    - email-diario-lucrativo.md (leads reativados voltam ao sistema)
  checklists:
    - sugarman-31-triggers.md
```

---

## VISAO GERAL

Reativar leads que pararam de abrir emails e transformá-los em compradores ou removê-los da lista (limpeza saudável).

**Resultado esperado:** 10-30% da lista reativada + lista limpa de inativos.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Lista de emails (tamanho)
- Critério de "inativo" (X dias sem abrir)
- Produto(s) para oferecer
- Histórico de relacionamento
- Última oferta enviada

### PASSO 2: INPUT VALUE
```yaml
lista:
  total: ""
  inativos: "" # Não abriu em X dias
  tempo_inatividade: "" # 30, 60, 90 dias

historico:
  como_entrou: "lead_magnet|compra|evento|organico"
  ultima_interacao: ""
  ultima_oferta: ""

campanha:
  duracao: "5|7|10 dias"
  oferta: ""
  tom: "direto|emocional|curioso|dramatico"
```

### PASSO 3: PRE-CHECKLIST
- [ ] Lista segmentada (só inativos)?
- [ ] Tem oferta para fazer?
- [ ] Sabe quando/como entraram na lista?
- [ ] Preparado para remover quem não engajar?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Estratégia | @eugene-schwartz | Entender awareness atual |
| 2. Hooks | @john-carlton | Criar aberturas diretas |
| 3. Emoção | @clayton-makepeace | Criar urgência emocional |
| 4. Storytelling | @gary-halbert | Reconectar com história |
| 5. Triggers | Sugarman | Fear + Urgência |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Estratégia de Reativação (30 min)
**Clone:** @eugene-schwartz

**Diagnóstico:**
- Por que pararam de engajar?
  - Emails demais?
  - Conteúdo irrelevante?
  - Já compraram e não tem mais oferta?
  - Mudaram de interesse?

**Estratégia por tempo de inatividade:**

| Tempo | Abordagem | Tom |
|-------|-----------|-----|
| 30 dias | Suave, curioso | "Sumiu!" |
| 60 dias | Direto, valor | "Sinto sua falta" |
| 90+ dias | Dramático, último | "Despedida" |

**Output:** Estratégia definida

---

#### FASE 2: Sequência de 7 Emails (2-3h)

**EMAIL 1 - O SUMIDO (Dia 1)**
**Clone:** @gary-halbert

```
Subject: Você ainda está aí?

Faz tempo que não te vejo por aqui.

[Nome], você entrou na minha lista em [data/contexto]
porque queria [objetivo que buscava].

Aconteceu alguma coisa?

Nos últimos [X] meses, mandei [Y] emails e você
não abriu nenhum.

Tudo bem, pode ter caído no spam.
Pode ter mudado de email.
Pode ter perdido interesse.

Mas antes de te remover da lista, queria perguntar:

Você ainda quer [resultado principal]?

Se sim, só clique aqui: [LINK]
E vou saber que você está ativo.

Se não... sem problemas.
Vou te tirar da lista em 5 dias pra não
encher sua caixa de entrada.

[Assinatura]

PS: Se você clicar, vou te mandar [algo de valor]
como presente por ainda estar aqui.
```

---

**EMAIL 2 - O VALOR ESQUECIDO (Dia 2)**
**Clone:** @clayton-makepeace

```
Subject: Isso te pertence (mas você esqueceu)

Quando você entrou na minha lista, eu prometi
te ajudar a [resultado].

Desde então, compartilhei:
- [Conteúdo valioso 1]
- [Conteúdo valioso 2]
- [Conteúdo valioso 3]

Mas percebi que você não abriu nenhum email recente.

Aquela sensação de [dor que tinham]...
ainda está aí?

Ou você já resolveu de outra forma?

Se ainda está buscando [resultado], preciso
que você faça uma coisa simples:

Clique aqui e me diz: [LINK - com pesquisa simples]
1. Ainda quero, me ajuda
2. Já resolvi, pode me tirar
3. Mudei de interesse

Só preciso saber pra não continuar mandando
emails que você não quer receber.

[Assinatura]
```

---

**EMAIL 3 - A HISTÓRIA (Dia 3)**
**Clone:** @gary-halbert

```
Subject: Por que criei isso (história que nunca contei)

Nunca te contei por que comecei [seu negócio/método].

[História pessoal resumida - 3-4 parágrafos]
- O problema que você enfrentou
- O momento de virada
- Por que decidiu ajudar outros

A razão de te contar isso?

Porque talvez você esteja passando pelo mesmo
que eu passei em [ano/momento].

E se eu tivesse desistido naquela época,
[consequência negativa].

Então se você está pensando em desistir de
[objetivo], não desiste.

Clica aqui e me deixa te ajudar: [LINK]

[Assinatura]

PS: Se você não quer mais ouvir de mim,
tudo bem. Mas me diz antes de eu te remover?
```

---

**EMAIL 4 - A OFERTA EXCLUSIVA (Dia 4)**
**Clone:** @alex-hormozi + @john-carlton

```
Subject: Só pra quem está vivo (oferta exclusiva)

Ok, você abriu esse email.
Isso significa que você ainda está aí.

Por isso, vou fazer uma coisa que não faço:

[OFERTA ESPECIAL]
- [Benefício 1]
- [Benefício 2]
- [Benefício 3]

Por [preço especial] - só pra quem está
nessa lista de "reativação".

Não vou mandar isso pra lista geral.
Não vou repetir depois.

É agora ou nunca (literalmente, porque
vou te remover em 3 dias se não engajar).

[CTA]

[Assinatura]
```

---

**EMAIL 5 - O MEDO (Dia 5)**
**Clone:** @clayton-makepeace

```
Subject: Preciso te perguntar uma coisa difícil

Essa pergunta pode doer, mas preciso fazer:

Você desistiu de [objetivo]?

Porque quando você entrou na minha lista,
você QUERIA isso. Eu lembro.

E se você desistiu... tudo bem.
Mas preciso saber se é porque:

A) Você conseguiu de outra forma (show!)
B) Você desistiu de vez (triste, mas respeito)
C) Você ainda quer, mas está travado (posso ajudar)

Se for C, me responde esse email e me conta
onde você travou.

Vou ler pessoalmente e responder.

[Assinatura]

PS: Esse é o penúltimo email que vou te mandar.
Depois de amanhã, você sai da lista automaticamente.
```

---

**EMAIL 6 - ÚLTIMO VALOR (Dia 6)**
**Clone:** @dan-koe + @gary-bencivenga

```
Subject: Meu melhor conteúdo (despedida)

Amanhã você sai da minha lista.

Antes de ir, quero te dar o que tenho de melhor:

[CONTEÚDO DE ALTO VALOR]
- [Recurso 1 - link]
- [Recurso 2 - link]
- [Recurso 3 - link]

Isso é o que eu daria pra um amigo que está
começando em [área].

Leva isso com você.

E se depois de consumir isso você quiser
continuar na lista, só clicar aqui: [LINK PARA FICAR]

Se não clicar, entendo.
Foi bom ter você aqui.

[Assinatura]
```

---

**EMAIL 7 - DESPEDIDA (Dia 7)**
**Clone:** @ben-settle

```
Subject: Tchau (última mensagem)

É isso.

Esse é o último email que você recebe de mim.

Mandei 6 emails nos últimos dias.
Você não clicou em nenhum.

Tudo bem.

Não vou mais encher sua caixa de entrada
com emails que você não quer ler.

Se um dia você quiser voltar, é só entrar
de novo aqui: [LINK PARA LISTA]

Boa sorte com [objetivo deles].
De verdade.

[Assinatura]

---

PS: Se você está lendo isso e NÃO quer
sair da lista, clique aqui AGORA: [LINK PARA FICAR]

Este email é processado automaticamente.
Você tem 24 horas.
```

---

### PASSO 6: TOOLS/SCRIPTS
- 5 clones para diferentes tons
- Template de sequência
- Ferramenta de automação de email
- Segmentação de lista

### PASSO 7: OUTPUT
```yaml
entregaveis:
  - sequencia_7_emails.md
  - subject_lines_variantes.md
  - segmentacao_criterios.md
  - metricas_acompanhamento.md

sequencia:
  email_1: "O Sumido"
  email_2: "O Valor Esquecido"
  email_3: "A História"
  email_4: "A Oferta Exclusiva"
  email_5: "O Medo"
  email_6: "Último Valor"
  email_7: "Despedida"
```

### PASSO 8: POS-CHECKLIST
- [ ] Sequência tem 7 emails?
- [ ] Tom escala de suave para dramático?
- [ ] Tem oferta especial incluída?
- [ ] Links de "quero ficar" funcionam?
- [ ] Automação de remoção configurada?

### PASSO 9: OUTPUT FINAL
- 7 emails de reativação escritos
- Subject lines testáveis
- Critérios de remoção definidos
- Métrica: 10-30% reativação esperada

---

## MÉTRICAS ESPERADAS

| Métrica | Alvo |
|---------|------|
| Open rate email 1 | 15-25% |
| Click rate total | 5-10% |
| Reativação | 10-30% |
| Remoção | 60-80% |

**Nota:** Remover inativos é BOM. Melhora deliverability e métricas.

---

## CHECKPOINTS

| Checkpoint | Após | Critério de Aprovação | Ação se Falhar |
|------------|------|----------------------|----------------|
| CP-1 | Fase 1 | Diagnóstico de inatividade completo + estratégia por tempo definida + tom escolhido | Voltar para Fase 1 — rediagnosticar causa de inatividade |
| CP-2 | Email 1-2 | Tom suave/curioso, link de reativação presente, opção de sair clara | Voltar para Email 1-2 — tom muito agressivo para início |
| CP-3 | Email 3-4 | História pessoal conecta com dor do lead + oferta exclusiva com escassez real | Voltar para Email 3-4 — falta conexão emocional ou oferta |
| CP-4 | Email 5-6 | Escalada emocional presente + último valor entregue antes da despedida | Voltar para Email 5-6 — sequência não escala em urgência |
| CP-5 | Email 7 | Despedida definitiva com última chance de clicar + prazo de remoção claro | Voltar para Email 7 — falta clareza no deadline |
| CP-FINAL | Passo 8 | Pós-checklist 100% + sequência escala de suave para dramático verificado | Revisar emails com tom inconsistente |

---

## VETO CONDITIONS

Condições que PARAM o workflow imediatamente:

| ID | Condição | Severidade | Ação |
|----|----------|-----------|------|
| VT-1 | Sequência não tem mecanismo de remoção automática (promete remover mas não configura) | BLOCKING | PARAR — configurar automação de remoção antes de enviar |
| VT-2 | Lista não está segmentada (enviando para ativos + inativos juntos) | BLOCKING | PARAR — segmentar lista por critério de inatividade |
| VT-3 | Nenhum email oferece valor real (só cobrança de engajamento) | HIGH | PAUSAR — adicionar conteúdo de valor no Email 6 |
| VT-4 | Subject lines genéricas (sem curiosidade ou emoção) | HIGH | PAUSAR — reescrever subjects com hooks |

---

## FAILURE/REWORK

| Cenário | Ação | Max Iterações |
|---------|------|---------------|
| Checkpoint falhou | Retornar à fase anterior, refazer com feedback | 2 |
| Veto triggered | STOP completo, resolver condição antes de continuar | 1 |
| Taxa de reativação estimada abaixo de 5% | Chamar @clayton-makepeace para amplificar emoção + @gary-halbert para reescrever história | 1 |

---

**Versão:** 1.0.0
**Criado por:** @pedro-valerio (Framework 9 Passos)
