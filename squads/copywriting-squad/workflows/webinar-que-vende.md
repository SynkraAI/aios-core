# Workflow: Webinar que Vende

## Metadados
```yaml
id: webinar-que-vende
versao: 1.1.0
duracao: 2-3 dias
complexidade: alta
output: Script completo de webinar + slides + emails
dependencies:
  optional_pre:
    - oferta-irresistivel.md (oferta integrada ao pitch do webinar)
  feeds_into:
    - lancamento-completo.md (webinar como evento de lancamento)
  checklists:
    - sugarman-31-triggers.md
    - awareness-checklist.md
```

---

## VISAO GERAL

Criar um webinar de 60-90 minutos que educa E vende, usando a estrutura comprovada de conteúdo + pitch.

**Resultado esperado:** Script completo com timing, slides estruturados e sequência de emails.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto a ser vendido
- Promessa do webinar (o que vão aprender)
- Público-alvo
- Duração alvo (60-90 min)
- Preço do produto
- Formato (ao vivo/gravado/evergreen)

### PASSO 2: INPUT VALUE
```yaml
webinar:
  titulo: ""
  promessa: ""
  duracao: "60|75|90"
  formato: "ao_vivo|gravado|evergreen"

produto:
  nome: ""
  preco: ""
  stack_resumo: []
  garantia: ""

publico:
  awareness: ""
  objecoes_principais: []
  resultado_desejado: ""
```

### PASSO 3: PRE-CHECKLIST
- [ ] Produto está definido?
- [ ] Promessa do webinar é clara?
- [ ] Sabe quanto tempo tem?
- [ ] Conhece as objeções do público?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Estrutura | @jon-benson | Framework de apresentação |
| 2. Conteúdo | @todd-brown | Unique Mechanism |
| 3. História | @gary-halbert | Storytelling |
| 4. Emoção | @clayton-makepeace | Amplificar |
| 5. Oferta | @alex-hormozi | Pitch estruturado |
| 6. Objeções | @gary-bencivenga | Quebrar |
| 7. Close | @dan-kennedy | Fechamento |

### PASSO 5: PROMPT DE EXECUÇÃO

---

## ESTRUTURA DO WEBINAR (90 min)

### BLOCO 1: ABERTURA (10 min)
**Objetivo:** Prender atenção + criar comprometimento

```
[0-2 min] HOOK DE ABERTURA
- Promessa ousada e específica
- "Nos próximos 90 minutos, você vai descobrir..."
- Pattern interrupt

[2-5 min] CRIAR CONTEXTO
- Por que esse webinar?
- O que vai aprender
- O que NÃO vai ser (diferenciar de outros webinars)

[5-8 min] CREDENCIAIS RÁPIDAS
- Quem é você (30 segundos)
- Resultados que teve
- Pessoas que ajudou
- NÃO é ego, é estabelecer autoridade

[8-10 min] REGRAS DO JOGO
- Ficar até o final (teaser do bônus)
- Pegar papel e caneta
- Desligar distrações
- "Quanto mais você participar, mais vai aproveitar"
```

**Clone:** @jon-benson (estrutura)

---

### BLOCO 2: HISTÓRIA DE ORIGEM (10-15 min)
**Objetivo:** Criar conexão + estabelecer o problema

```
[10-15 min] SUA HISTÓRIA
- De onde você veio
- O problema que enfrentou
- Os fracassos que teve
- O momento de virada
- A descoberta que mudou tudo

[15-20 min] CONECTAR COM AUDIÊNCIA
- "Talvez você esteja passando pelo mesmo..."
- Normalizar o problema deles
- Mostrar que entende
- "Eu estava exatamente aí"

[20-25 min] A GRANDE PROMESSA
- O que você descobriu
- Por que funciona diferente
- O que vai ensinar hoje
```

**Clone:** @gary-halbert (storytelling)

---

### BLOCO 3: CONTEÚDO DE VALOR (25-30 min)
**Objetivo:** Ensinar algo real + preparar para o pitch

**Estrutura: 3 SEGREDOS/CHAVES/PILARES**

```
[25-35 min] SEGREDO #1
- Ensinar conceito real
- Dar quick win aplicável
- Transição: "Mas isso sozinho não basta..."

[35-45 min] SEGREDO #2
- Segundo conceito importante
- Exemplo ou case rápido
- Transição: "E o mais importante..."

[45-55 min] SEGREDO #3
- O conceito mais transformador
- Conectar com o produto (sem vender ainda)
- "E é aqui que entra o que vou te apresentar..."
```

**Clone:** @todd-brown (mecanismo) + @clayton-makepeace (emoção)

**Regras do conteúdo:**
- Ensinar O QUE fazer, não COMO fazer em detalhes
- Dar valor real (eles devem poder aplicar algo)
- Cada segredo resolve 1 objeção
- Criar awareness de que precisam de mais ajuda

---

### BLOCO 4: TRANSIÇÃO PARA PITCH (5 min)
**Objetivo:** Mudar de modo "ensino" para "venda"

```
[55-60 min] BRIDGE
- "Agora você conhece os 3 segredos..."
- "Mas tem um problema..."
- "Implementar sozinho é difícil/demorado/arriscado"
- "Por isso criei..."
- Revelar nome do produto
```

**Clone:** @jon-benson

---

### BLOCO 5: APRESENTAÇÃO DA OFERTA (15-20 min)
**Objetivo:** Mostrar valor irresistível

```
[60-65 min] O QUE É
- Apresentar o produto
- O que ele entrega
- Resultados esperados

[65-75 min] STACK DE VALOR
- Listar CADA componente
- Mostrar valor de cada um
- Empilhar valores no slide

[75-78 min] BÔNUS
- Bônus especiais para quem comprar hoje
- Valor de cada bônus
- Por que só hoje

[78-80 min] GARANTIA
- Apresentar garantia forte
- Remover todo risco
- "Você não tem nada a perder"

[80-82 min] PREÇO
- Ancoragem alta
- Revelar preço real
- Comparar com alternativas (consultoria, tempo, etc)
```

**Clone:** @alex-hormozi

---

### BLOCO 6: QUEBRA DE OBJEÇÕES (8-10 min)
**Objetivo:** Antecipar e destruir objeções

```
[82-90 min] OBJEÇÕES COMUNS

"E se não funcionar pra mim?"
- Explicar por que funciona
- Cases diversos
- Garantia

"É muito caro"
- Custo de NÃO resolver
- Valor vs preço
- Parcelamento

"Não tenho tempo"
- Quanto tempo precisa
- O que vai ganhar de tempo depois
- "É justamente pra quem não tem tempo"

"Preciso pensar"
- Bônus que some se pensar demais
- Custo de esperar
- "Pensar é bom, mas procrastinar custa caro"
```

**Clone:** @gary-bencivenga + @dan-kennedy

---

### BLOCO 7: CLOSE (5 min)
**Objetivo:** Criar ação imediata

```
[90-95 min] FECHAMENTO

1. Resumir oferta (30 segundos)
2. Repetir garantia
3. Criar urgência REAL
   - Bônus some em X horas
   - Vagas limitadas (se verdade)
   - Preço sobe em X

4. CTA CLARO
   - "Clique no botão abaixo"
   - "www.link.com"
   - Repetir 3x

5. Visão de futuro
   - "Daqui X dias, você pode estar..."
   - Pintar o depois

6. Última palavra
   - "A decisão é sua"
   - "Eu estarei aqui independente"
   - "Mas a oferta não"
```

**Clone:** @dan-kennedy (close)

---

## EMAILS DO WEBINAR

### PRÉ-WEBINAR (3-5 emails)

**Email 1: Convite (7 dias antes)**
- Anunciar o webinar
- Promessa principal
- Data/hora
- CTA para se inscrever

**Email 2: Confirmação (imediato após inscrição)**
- Confirmar inscrição
- Adicionar ao calendário
- O que vai aprender
- Criar expectativa

**Email 3: Lembrete (1 dia antes)**
- Lembrar da data
- Reforçar promessa
- "Prepare papel e caneta"
- Teaser do bônus de quem ficar até o final

**Email 4: Lembrete (1 hora antes)**
- "Começa em 1 hora"
- Link de acesso
- "Não perca os primeiros minutos"

**Email 5: Ao vivo (no horário)**
- "Estamos ao vivo!"
- Link direto
- Urgência

### PÓS-WEBINAR (3-5 emails)

**Email 1: Replay (imediato)**
- Link do replay
- Resumo do que foi ensinado
- "Se você não comprou ainda..."
- Prazo do replay

**Email 2: Objeções (dia seguinte)**
- Responder dúvidas comuns
- Cases de sucesso
- CTA

**Email 3: Urgência (dia do deadline)**
- "Última chance"
- O que perde se não comprar
- Bônus que some
- CTA forte

**Email 4: Fechamento (horas finais)**
- "Encerra em X horas"
- Resumo final
- "Depois disso, [consequência]"

**Email 5: Encerrado (depois do prazo)**
- "Oferta encerrada"
- Para quem comprou: próximos passos
- Para quem não comprou: quando terá outra chance

---

### PASSO 6: TOOLS/SCRIPTS
- 7 clones para cada bloco
- Template de slides
- Cronômetro por seção
- Sequência de emails

### PASSO 7: OUTPUT
```yaml
entregaveis:
  - script_webinar_completo.md
  - estrutura_slides.md
  - sequencia_emails_pre.md
  - sequencia_emails_pos.md
  - checklist_ao_vivo.md

webinar:
  duracao_total: "90 min"
  blocos: 7
  slides_estimados: "60-80"
  emails_total: 10
```

### PASSO 8: POS-CHECKLIST
- [ ] Script tem os 7 blocos?
- [ ] Timing está definido?
- [ ] Conteúdo entrega valor real?
- [ ] Transição para pitch é suave?
- [ ] Stack está completo?
- [ ] Objeções estão cobertas?
- [ ] Emails estão escritos?

### PASSO 9: OUTPUT FINAL
**Webinar completo:**
- Script com timing por bloco
- Estrutura de 60-80 slides
- 10 emails (5 pré + 5 pós)
- Checklist do dia do webinar
- Métricas alvo

---

## MÉTRICAS ALVO

| Métrica | Webinar ao Vivo | Evergreen |
|---------|-----------------|-----------|
| Show-up rate | 30-40% | 20-30% |
| Retention 50% | 60%+ | 50%+ |
| Retention 100% | 40%+ | 30%+ |
| Conversão | 5-15% | 3-8% |

---

## CHECKPOINTS

| Checkpoint | Após | Critério de Aprovação | Ação se Falhar |
|------------|------|----------------------|----------------|
| CP-1 | Bloco 1 | Abertura com hook + contexto + credenciais + regras do jogo (10 min script) | Voltar para Bloco 1 — abertura fraca ou sem comprometimento |
| CP-2 | Bloco 2 | História de origem com conexão emocional + grande promessa articulada | Voltar para Bloco 2 — história desconectada do público |
| CP-3 | Bloco 3 | 3 segredos/pilares com conteúdo real + quick wins + transições entre cada | Voltar para Bloco 3 — conteúdo superficial ou sem valor aplicável |
| CP-4 | Bloco 4 | Bridge suave de ensino para venda (não abrupto) | Voltar para Bloco 4 — transição forçada |
| CP-5 | Bloco 5 | Stack de valor completo + bônus + garantia + preço com ancoragem | Voltar para Bloco 5 — oferta incompleta ou sem ancoragem |
| CP-6 | Bloco 6 | 4+ objeções principais quebradas com argumentos e provas | Voltar para Bloco 6 — objeções ignoradas ou respostas fracas |
| CP-7 | Bloco 7 | Close com resumo + urgência real + CTA repetido 3x + future pacing | Voltar para Bloco 7 — close sem urgência ou CTA fraco |
| CP-8 | Emails | 10 emails escritos (5 pré + 5 pós) com subject lines e timing | Voltar para Emails — sequência incompleta |
| CP-FINAL | Passo 8 | Pós-checklist 100% + timing total dentro de 90 min | Revisar blocos com timing desbalanceado |

---

## VETO CONDITIONS

Condições que PARAM o workflow imediatamente:

| ID | Condição | Severidade | Ação |
|----|----------|-----------|------|
| VT-1 | Conteúdo dos 3 segredos não entrega valor real (puro pitch disfarçado) | BLOCKING | PARAR — reescrever Bloco 3 com ensino genuíno |
| VT-2 | Webinar sem stack de valor ou sem garantia na oferta | BLOCKING | PARAR — completar Bloco 5 antes de finalizar |
| VT-3 | Timing total ultrapassa 120 min (audiência vai abandonar) | HIGH | PAUSAR — cortar conteúdo redundante |
| VT-4 | Emails pré-webinar não existem (sem sequência de aquecimento) | HIGH | PAUSAR — criar mínimo 3 emails pré-evento |
| VT-5 | Close sem urgência real (apenas "compre agora" genérico) | HIGH | PAUSAR — criar escassez legítima com deadline |

---

## FAILURE/REWORK

| Cenário | Ação | Max Iterações |
|---------|------|---------------|
| Checkpoint falhou | Retornar ao bloco anterior, refazer com feedback | 2 |
| Veto triggered | STOP completo, resolver condição antes de continuar | 1 |
| Script ultrapassa tempo alvo | Chamar @jon-benson para cortar e otimizar timing por bloco | 1 |

---

**Versão:** 1.0.0
**Criado por:** @pedro-valerio (Framework 9 Passos)
