# Workflow: Otimizacao de Funil Existente

## Metadados
```yaml
id: otimizacao-funil
versao: 1.0.0
duracao: 3-5 dias
complexidade: media-alta
output: Funil otimizado com gaps corrigidos, triggers injetados, testes A/B configurados
execution_model: one-time (repetir a cada ciclo de otimizacao)
dependencies:
  checklists:
    - audit-copy-hopkins.md
    - sugarman-31-triggers.md
    - awareness-checklist.md
    - sales-letter-checklist.md
```

---

## VISAO GERAL

Workflow de 5 fases para otimizar funil de vendas existente. Diagnostica problemas, identifica gaps por especialidade, reescreve pontos fracos com clones especializados, turbina com triggers psicologicos e configura testes A/B.

**Principio:** Nao reescrever tudo — so os pontos fracos. Manter o que ja funciona.

**Duracao Estimada:** 3-5 dias

**Clones Utilizados:**
- **Diagnostico:** Claude Hopkins (audit), Eugene Schwartz (awareness)
- **Gaps:** Todd Brown (mecanismo), Clayton Makepeace (emocao), Gary Bencivenga (objecoes), Alex Hormozi (oferta)
- **Turbinar:** Joe Sugarman (31 triggers)
- **Testar:** Claude Hopkins (A/B)

## Veto Conditions

- **VETO-OF-1:** Reescrever copy inteira sem diagnostico → PARAR, completar Fase 1
- **VETO-OF-2:** Ignorar gaps identificados e pular para triggers → PARAR, corrigir gaps primeiro
- **VETO-OF-3:** Escalar campanha sem ao menos 1 teste A/B → PARAR, testar antes de escalar
- **VETO-OF-4:** Assumir causa do problema sem dados → PARAR, diagnosticar com Hopkins
- **VETO-OF-5:** Injetar todos 31 triggers de uma vez → PARAR, max 5-10 relevantes

---

## PRE-CHECKLIST

- [ ] Funil existente com copy publicada
- [ ] Metricas atuais disponiveis (CTR, conversao, bounce, etc.)
- [ ] Acesso a todas pecas de copy (ads, LP, emails, sales page)
- [ ] Historico de testes anteriores (se houver)
- [ ] Objetivo de melhoria definido (ex: aumentar conversao em 20%)

---

## FASE 1: DIAGNOSTICO (Claude Hopkins)

### Passo 1: Audit de Headlines
**Clone:** @claude-hopkins

**Acoes:**
1. Coletar todas headlines do funil (ads, LP, emails, sales page)
2. Testar cada uma contra checklist Hopkins:
   - [ ] Promete beneficio especifico?
   - [ ] Seleciona o publico certo?
   - [ ] Cria curiosidade para ler mais?
   - [ ] Seria efetiva como teste A/B?
3. Classificar: FORTE / MEDIA / FRACA
4. Marcar fracas para reescrita

**Output:** Audit de headlines com classificacao

---

### Passo 2: Audit de Oferta
**Clone:** @claude-hopkins (com framework @alex-hormozi)

**Acoes:**
1. Comparar oferta atual com Value Equation de Hormozi
2. Avaliar: Dream Outcome claro? Likelihood percebida? Time delay? Effort?
3. Identificar gaps no stack de valor
4. Avaliar forca da garantia (remove risco?)
5. Comparar preco vs valor percebido

**Output:** Audit de oferta com gaps identificados

---

### Passo 3: Audit de Copy Body
**Clone:** @claude-hopkins

**Acoes:**
1. Verificar especificidade (numeros concretos vs generalidades)
2. Checar provas e credibilidade (testimonials, dados, estudos)
3. Avaliar fluxo logico (faz sentido do inicio ao fim?)
4. Verificar tratamento de objecoes (cobertas ou ignoradas?)
5. Avaliar CTA (claro, unico, repetido?)
6. Teste do vendedor: "Se eu dissesse isso pessoalmente, funcionaria?"

**Output:** Audit completo com score por secao

---

## FASE 2: IDENTIFICAR GAPS

### Gap de Awareness
**Clone:** @eugene-schwartz

**Perguntas:**
1. Copy esta falando para o nivel errado de awareness?
2. Precisa educar mais (unaware) ou ser mais direto (most aware)?
3. Extensao do copy esta adequada ao nivel?
4. Tom esta alinhado com awareness?

**Output:** Diagnostico de awareness gap

---

### Gap de Mecanismo
**Clone:** @todd-brown

**Perguntas:**
1. Esta diferenciado o suficiente? (parece igual a concorrencia?)
2. Mecanismo do problema esta claro? (por que falharam antes?)
3. Mecanismo da solucao esta claro? (por que vai funcionar agora?)
4. Tem Big Idea memoravel?

**Output:** Gap de mecanismo com recomendacoes

---

### Gap de Emocao
**Clone:** @clayton-makepeace

**Perguntas:**
1. Dor esta agitada o suficiente? (leitor SENTE no corpo?)
2. Desejo esta vivo? (future pacing que faz salivar?)
3. Linguagem sensorial presente? (ver, ouvir, sentir, etc.)
4. Stakes raising adequado? (o que esta em jogo alem do obvio?)

**Output:** Gap de emocao com pontos para intensificar

---

### Gap de Objecoes
**Clone:** @gary-bencivenga

**Perguntas:**
1. Todas objecoes principais cobertas?
2. Objecoes antecipadas ANTES do leitor pensar?
3. Bullets criam curiosidade irresistivel?
4. Objecoes transformadas em beneficios?

**Output:** Gap de objecoes com lista de objecoes nao tratadas

---

## FASE 3: REESCREVER PONTOS FRACOS

**REGRA:** Usar clone especializado para CADA gap. Nao reescrever tudo — so os pontos fracos identificados.

### Execucao por Gap:

| Gap Identificado | Clone para Reescrita | O que Reescrever |
|------------------|---------------------|------------------|
| Headlines fracas | @john-carlton (agressivo) ou @gary-halbert (curiosidade) | Headlines + subheadlines |
| Awareness errado | @eugene-schwartz | Tom, extensao, abordagem |
| Mecanismo fraco | @todd-brown | Secao de diferenciacao |
| Emocao ausente | @clayton-makepeace | Lead, dor, future pacing |
| Objecoes ignoradas | @gary-bencivenga | Secao de objecoes + bullets |
| Oferta fraca | @alex-hormozi | Stack, garantia, pricing |
| Emails sem conversao | @andre-chaperon ou @ben-settle | Sequencia de email |
| VSL sem hook | @jon-benson | Primeiros 15 segundos |

**Acoes:**
1. Listar todos os gaps da Fase 2
2. Priorizar por impacto (qual gap mais prejudica conversao?)
3. Reescrever top 3 gaps primeiro
4. Integrar nova copy com copy existente (manter coerencia)
5. Revisar fluxo completo apos reescritas

**Output:** Pecas de copy reescritas integradas ao funil

---

## FASE 4: TURBINAR (Joe Sugarman)

### Injecao de Triggers Psicologicos
**Ferramenta:** Sugarman 31 Triggers

**Acoes:**
1. Abrir checklist de 31 triggers
2. Passar por cada trigger e avaliar presenca no copy
3. Identificar 5-10 triggers ausentes que fazem sentido
4. Injetar em pontos estrategicos:
   - Headlines: Curiosity (19), Specificity (28)
   - Lead: Storytelling (25), Involvement (01)
   - Body: Authority (08), Proof of Value (05)
   - Oferta: Greed (07), Exclusivity (22), Urgency (20)
   - CTA: Instant Gratification (21), Fear (31)
5. Verificar que nao exagerou (copy natural, nao forcada)

**Output:** Copy turbinada com triggers mapeados

---

## FASE 5: TESTAR (Claude Hopkins)

### Setup de Testes A/B
**Clone:** @claude-hopkins

**Acoes:**
1. Identificar variavel #1 a testar (maior impacto potencial)
2. Criar 2 versoes DISTINTAS (nao similares — diferentes de verdade)
3. Dividir trafego igualmente (50/50)
4. Definir metrica de sucesso (CTR? Conversao? Revenue?)
5. Calcular tamanho de amostra necessario para significancia
6. Rodar ate significancia estatistica
7. Implementar vencedor
8. Testar proxima variavel
9. Repetir indefinidamente

**Ordem de Teste Sugerida:**
```
1. Headlines (maior impacto)
2. Oferta/pricing
3. CTA
4. Lead/abertura
5. Garantia
6. Email subject lines
```

**Output:** Plano de testes A/B + primeira variante pronta

---

## POS-CHECKLIST

- [ ] Audit completo de Hopkins documentado
- [ ] Gaps identificados por especialidade
- [ ] Top 3 gaps reescritos com clones especializados
- [ ] Copy integrada e coerente
- [ ] 5-10 triggers Sugarman injetados
- [ ] Teste A/B #1 configurado e rodando
- [ ] Metricas baseline documentadas para comparacao
- [ ] Plano de testes futuros definido

---

## CICLO DE OTIMIZACAO CONTINUA

```
Testar → Medir → Identificar gap → Reescrever com clone → Turbinar → Testar novamente
```

Repetir este workflow a cada 30-60 dias ou quando metricas cairem abaixo do baseline.

---

_Workflow Version: 1.0.0_
_Baseado em: Framework Estrategico de Clones - WF6 Otimizacao de Funil Existente_
_Squad: copywriting-squad_
