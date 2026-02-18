# Task: Assess Sources

**Command:** `*assess-sources`
**Execution Type:** Hybrid
**Load:** `data/an-source-tiers.yaml`

## Purpose

Avaliar e classificar todas as fontes disponiveis para um projeto de clone, gerando um source map priorizado.

## Workflow

### Step 1: Collect Sources

Perguntar ao usuario:
- "Liste TODOS os materiais que voce tem dessa pessoa"
- Tipos: videos, podcasts, livros, posts, stories, comentarios, entrevistas, cursos

### Step 2: Classify Each Source

Para cada fonte, avaliar usando 5 dimensoes de curadoria:

| Dimensao | Pergunta | Score 1-5 |
|----------|----------|-----------|
| Autenticidade | Pensamento real ou performance? | |
| Profundidade | Frameworks/decisoes ou superficie? | |
| Atualidade | Reflete pensamento atual? | |
| Unicidade | Mostra o que torna UNICO? | |
| Completude | Cobre Playbook + Framework + exemplos? | |

**Classificacao:**
- Media >= 4.0 → **OURO**
- Media 3.0-3.9 → **MIXED** (usar com cautela)
- Media < 3.0 → **BRONZE** (descartar como base)

#### >>> CHECKPOINTS: Consultar modelos mentais ANTES de finalizar score <<<

```yaml
checkpoint_clareza_radical:
  consult: "VALUES.clareza_radical"
  question: "Esta fonte traz CLAREZA ou RUÍDO?"
  if_clareza: "Prosseguir com score"
  if_ruido: "Autenticidade -= 2"
  rationale: "Clareza é arma. Fonte confusa = bronze independente do resto."

checkpoint_autenticidade_integral:
  consult: "VALUES.autenticidade_integral"
  question: "Conteúdo é ESPONTÂNEO ou SCRIPTED?"
  if_espontaneo: "Prosseguir com score"
  if_scripted: "tier = BRONZE, Autenticidade -= 2"
  rationale: "Performance não revela pensamento real."

checkpoint_limited_losses:
  consult: "MODELS.limited_losses_unlimited_gains"
  question: "Ratio risco/retorno: horas investidas vs valor para o clone?"
  if_ratio_baixo: "Prosseguir (2h investidas, upside = clone 10x melhor)"
  if_ratio_alto: "Deprioritizar (20h investidas, upside marginal)"
  rationale: "Cap downside, leave upside uncapped."

checkpoint_depth_over_breadth:
  consult: "PARADOXES.elitist_egalitarian"
  question: "Priorizando DEPTH (poucas fontes profundas) ou BREADTH (muitas superficiais)?"
  if_depth: "Prosseguir"
  if_breadth: "Eliminar fontes superficiais, aprofundar nas restantes"
  rationale: "Uma fonte Crown Jewel > 10 fontes bronze."
```

### Step 3: Prioritize

Ordenar fontes ouro por valor de extracao:
1. Entrevistas longas com perguntas dificeis (maior valor)
2. Comentarios respondendo perguntas reais
3. Cases detalhados com analise
4. Livros com metodologia propria
5. Stories espontaneos

#### >>> CHECKPOINTS: Consultar modelos mentais ANTES de finalizar priorização <<<

```yaml
checkpoint_pareto_ao_cubo:
  consult: "MODELS.pareto_ao_cubo"
  question: "Classificou fontes em 0.8% (Crown Jewel) / 4% (Ouro) / 20% (Impacto) / 80% (Bronze)?"
  if_classificado: "Priorizar extração: Crown Jewel primeiro"
  if_nao: "PARAR - aplicar Pareto ao Cubo antes de prosseguir"
  rationale: "0.8% gera 51% do resultado. Ordem importa."

checkpoint_eficiencia:
  consult: "OBSESSIONS.eficiencia_alavancagem_maxima"
  question: "Priorização segue ELIMINA > AUTOMATIZA > AMPLIFICA?"
  if_sim: "Ordem correta de leverage"
  if_nao: "Reordenar: primeiro eliminar 80%, depois amplificar 0.8%"
  rationale: "Não automatiza desperdício. ELIMINA primeiro."

checkpoint_evolucao:
  consult: "VALUES.evolucao_constante"
  question: "Fontes são DIVERSAS ou repetindo as mesmas de sempre?"
  if_diversas: "Prosseguir"
  if_repetidas: "Buscar fontes não-óbvias (formatos, períodos, contextos diferentes)"
  rationale: "Mesmas fontes sempre = estagnação de clone."
```

### Step 4: Generate Source Map

```yaml
source_assessment:
  mind: "{nome}"
  total_sources: {n}
  classification:
    ouro: {n} ({%})
    mixed: {n} ({%})
    bronze: {n} ({%})
  sources:
    - name: "{fonte}"
      type: "{tipo}"
      tier: "ouro|mixed|bronze"
      scores:
        autenticidade: {1-5}
        profundidade: {1-5}
        atualidade: {1-5}
        unicidade: {1-5}
        completude: {1-5}
      media: {score}
      extraction_priority: {1-n}
      notes: "{observacoes}"
  recommendations:
    - "{acao recomendada}"
  curadoria_score: "{media geral das fontes ouro}"
```

## Completion Criteria

- [ ] Todas as fontes listadas
- [ ] Cada fonte classificada com 5 dimensoes
- [ ] Ouro vs Bronze separado
- [ ] Prioridade de extracao definida
- [ ] Source map YAML gerado
