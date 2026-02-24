# Task: Start - Pipeline Completa Zona de Genialidade

**Task ID:** zona-genialidade/start
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Zona Genialidade Pipeline
**Execution Type:** Hybrid (interativo no assessment, autonomo no resto)

---

## Executive Summary

Este e o ENTRY POINT UNICO do squad Zona de Genialidade. O aluno chama `/start` e o squad conduz TUDO: assessment de 30 min, analise multi-framework por 7 agentes, recomendacao de squad com scoring algoritmico, e entrega de um Genius Zone Blueprint completo com plano de monetizacao 30-60-90 dias. No final, o aluno sai com squad pronto pra criar.

**Duracao Total Estimada:** 60-90 minutos (30 min interativo + 30-60 min autonomo)
**Output Final:** Genius Zone Blueprint em Markdown + squad recomendado + proximos passos

---

## Pipeline Visual

```
/start
  |
  v
PHASE 1: ASSESSMENT (30 min, interativo)
  Task: run-assessment
  Gate: QG-002 (Assessment Complete)
  Output: assessment-result.yaml
  |
  v
PHASE 2: ANALISE MULTI-FRAMEWORK (15-30 min, autonomo)
  Task: analyze-genius-profile
  Agents: 7 especialistas em 3 tiers
  Gate: QG-003 (Profile Synthesized)
  Output: genius-profile.yaml
  |
  v
PHASE 3: MATCHING DE SQUAD (5-15 min, autonomo)
  Task: recommend-squad
  Algoritmo: Hamilton(40%) + Kolbe(30%) + Clifton(20%) + Context(10%)
  Output: squad-recommendation.yaml
  |
  v
PHASE 4: BLUEPRINT FINAL (10-20 min, autonomo)
  Task: generate-blueprint
  Gate: QG-004 (Blueprint Reviewed)
  Output: genius-zone-blueprint.md
  |
  v
ENTREGA
  -> Blueprint completo (10 secoes)
  -> Top 3 squads com scores e racional
  -> Dream Squad personalizado
  -> Plano de monetizacao 30-60-90 dias
  -> Checklist de proximos passos (comecar HOJE)
```

---

## Proposito

O aluno do Cohort Fundamentals chega com UMA pergunta: "Qual e o MEU negocio ideal?"

Sem este task, ele precisaria:
1. Saber que o squad existe
2. Saber que precisa rodar `*assess` primeiro
3. Esperar, depois rodar `*blueprint`
4. Depois rodar `*recommend-squad`

Com `/start`, ele faz UMA coisa: responde ~43 perguntas em 30 minutos. O squad faz o resto.

**Analogia:** E como ir ao medico. Voce nao pede "faca hemograma, depois analise, depois diagnostico, depois receita". Voce diz "doutor, me ajuda" e ele conduz tudo.

---

## Tipo de Executor

**Hybrid**
- **Phase 1:** 20% Agent / 80% Human (assessment interativo)
- **Phases 2-4:** 100% Agent (autonomo completo)
- **Entrega:** Agent apresenta resultado ao Human

---

## Inputs

### Obrigatorios

```yaml
user_consent:
  field: "Confirmacao para iniciar o pipeline completo"
  format: "boolean"
  required: true
  validation: "Usuario confirma que tem ~30 minutos para o assessment"
```

### Opcionais

```yaml
previous_assessments:
  field: "Resultados anteriores (DISC, MBTI, CliftonStrengths, etc.)"
  format: "text"
  required: false

aluno_slug:
  field: "Slug do aluno (se ja cadastrado)"
  format: "string (snake_case)"
  required: false
  derivation: "Se nao fornecido, derivar do nome coletado no assessment"

formato_saida:
  field: "Formato do Blueprint"
  format: "string"
  required: false
  default: "markdown"
  options: ["markdown", "html"]
```

---

## Precondicoes

- [ ] Squad zona-genialidade configurado e ativo
- [ ] Agente zona-genialidade-chief disponivel
- [ ] Diretorio `squads/zona-genialidade/data/` existe
- [ ] Nenhum assessment em andamento para este usuario (ou re-execucao explicitamente solicitada)

---

## Steps

### Step 0: Boas-vindas e Consentimento (2 min)

**Agent Activity:**

Apresentar o pipeline completo de forma acessivel:

```
==========================================================
  ZONA DE GENIALIDADE - Descoberta Completa
==========================================================

  O que vai acontecer:

  1. ASSESSMENT (30 min) - Voce responde ~43 perguntas
     Eu pergunto, voce responde. Maioria e multipla escolha.

  2. ANALISE (autonomo) - 7 especialistas analisam seu perfil
     Gay Hendricks, Clifton, Sullivan, Hamilton, Hormozi,
     Kolbe e Hogshead. Cada um traz uma lente diferente.

  3. MATCHING (autonomo) - Algoritmo cruza seu perfil com
     18+ squads disponiveis e rankeia os 3 melhores pra voce.

  4. BLUEPRINT (autonomo) - Documento completo com:
     - Seu perfil de genialidade
     - Squad recomendado pra criar
     - Plano de monetizacao 30-60-90 dias
     - Proximos passos (comecar HOJE)

  Tempo total: ~30 min suas + ~30 min minhas (autonomo)
  Voce so precisa estar presente na Etapa 1.

==========================================================
```

**Elicitation:**

```yaml
AskUserQuestion:
  question: "Pronto pra descobrir sua Zona de Genialidade? Voce tem ~30 minutos agora?"
  options:
    - "Sim, vamos comecar!"
    - "Agora nao, salvar pra depois"
  required: true
```

**Gate:** Se "Agora nao" -> encerrar com mensagem amigavel e instrucao de retomada.

**Se SIM, perguntar sobre assessments anteriores:**

```yaml
AskUserQuestion:
  question: "Voce ja fez algum teste de perfil antes? (DISC, MBTI, CliftonStrengths, Kolbe, etc.)"
  options:
    - "Sim, tenho resultados"
    - "Nao, nunca fiz"
    - "Fiz mas nao lembro os resultados"
  required: true
```

Se "Sim, tenho resultados" -> pedir que compartilhe (usado como ancora de calibracao).

---

### Step 1: PHASE 1 - Assessment Unificado (30 min)

**Executa:** `run-assessment` task completa

**Agent Activity:**

1. Conduzir as 5 secoes do assessment:
   - Secao 1: Contexto Pessoal (5 min, 8 perguntas)
   - Secao 2: Atividades e Energia (8 min, 12 perguntas)
   - Secao 3: Talentos e Padroes (7 min, 10 perguntas)
   - Secao 4: Estilo de Negocios (5 min, 8 perguntas)
   - Secao 5: Visao e Ambicao (5 min, 5 perguntas)

2. Usar AskUserQuestion para cada pergunta conforme definido em `run-assessment.md`

3. Compilar respostas em `assessment-result.yaml`

**Interacao com Usuario:**

Entre cada secao, dar feedback de progresso:

```
Secao 1 completa! [=====>    ] 20%
Otimo. Agora vamos falar sobre o que te da energia...
```

Ao final do assessment:

```
Assessment completo! [==========] 100%
Voce respondeu 43 perguntas em {X} minutos.

Agora vou rodar sua analise em 7 frameworks diferentes.
Isso leva uns 30-45 minutos. Voce pode ir fazer outra coisa
- eu te aviso quando o Blueprint estiver pronto.

Ou, se preferir, pode esperar que eu vou mostrando o progresso.
```

**Quality Gate QG-002:**
- [ ] Minimo 40 de 43 perguntas respondidas
- [ ] Todas 5 perguntas abertas com respostas substantivas (>20 chars)
- [ ] Nenhuma secao com mais de 50% de respostas em branco
- [ ] assessment-result.yaml gerado e salvo

**Veto Conditions:**
- Se < 35 perguntas respondidas -> NAO prosseguir. Completar lacunas primeiro.
- Se perguntas abertas vazias -> Reformular e pedir resposta.

**Output:** `squads/zona-genialidade/data/assessments/{user_slug}-assessment.yaml`

---

### Step 2: PHASE 2 - Analise Multi-Framework (15-30 min, autonomo)

**Executa:** `analyze-genius-profile` task completa

**Agent Activity:**

1. Carregar assessment-result.yaml
2. Validar integridade dos dados
3. Executar analise sequencial por tier:

```
TIER 0: Gay Hendricks
  -> Zona atual + Upper Limit Problem
  -> Checkpoint: Zona classificada com evidencia

TIER 1 (paralelo conceitual, sequencial na pratica):
  -> Don Clifton: Top 5 CliftonStrengths + dominio dominante
  -> Dan Sullivan: Unique Ability + mapa de delegacao
  -> Roger Hamilton: Wealth Dynamics profile + Wealth Spectrum
  -> Alex Hormozi: Value Equation + Grand Slam Offer draft

TIER 2 (apos Tier 1):
  -> Kathy Kolbe: 4 Action Modes + estilo de execucao
  -> Sally Hogshead: Fascination Advantage + arquetipo

SINTESE:
  -> Convergencias (onde 3+ frameworks concordam)
  -> Insights unicos (so um framework viu)
  -> Contradicoes (documentar, nao esconder)
  -> Meta-insights (emergem do cruzamento)
```

**Progress Feedback (se usuario estiver presente):**

```
Analise em andamento...

  [x] Gay Hendricks - Zona de Genialidade mapeada
  [x] Don Clifton - Talentos identificados
  [x] Dan Sullivan - Habilidade Unica definida
  [x] Roger Hamilton - Perfil de Riqueza classificado
  [ ] Alex Hormozi - Calculando Value Equation...
  [ ] Kathy Kolbe - Pendente
  [ ] Sally Hogshead - Pendente
  [ ] Sintese cruzada - Pendente
```

**Quality Gate QG-003:**
- [ ] Todas 7 analises completas com confianca >= 0.6
- [ ] Sintese com pelo menos 3 convergencias
- [ ] Contradicoes documentadas (nao ignoradas)
- [ ] genius-profile.yaml gerado e salvo

**Veto Conditions:**
- Se < 5 analises completas -> Reprocessar agentes faltantes
- Se nenhuma convergencia encontrada -> Investigar dados do assessment

**Output:** `squads/zona-genialidade/data/{user_slug}/genius-profile.yaml`

---

### Step 3: PHASE 3 - Matching de Squad (5-15 min, autonomo)

**Executa:** `recommend-squad` task completa

**Agent Activity:**

1. Carregar genius-profile.yaml
2. Carregar catalogo de 18+ squads do ecossistema
3. Aplicar algoritmo de matching em 4 camadas:

```yaml
scoring_layers:
  hamilton_match:   # 40% do score total
    regra: "Perfil WD primario e secundario vs squads naturais"

  kolbe_match:      # 30% do score total
    regra: "Action Modes estimados vs kolbe_ideal de cada squad"

  clifton_match:    # 20% do score total
    regra: "Dominio dominante vs dominio ideal de cada squad"

  context_bonus:    # 10% do score total
    regra: "Value Equation, UA alignment, convergencias, ULP"
```

4. Rankear squads por score composto
5. Gerar Top 3 com racional detalhado
6. Projetar Dream Squad personalizado
7. Definir next step imediato

**Output:** `squads/zona-genialidade/data/{user_slug}/squad-recommendation.yaml`

---

### Step 4: PHASE 4 - Blueprint Final (10-20 min, autonomo)

**Executa:** `generate-blueprint` task completa

**Agent Activity:**

1. Carregar genius-profile.yaml + squad-recommendation.yaml
2. Gerar as 10 secoes do Blueprint:

```
Secao 1:  Perfil em 30 Segundos
Secao 2:  Diagnostico de Zona (Hendricks)
Secao 3:  Mapa de Talentos (Clifton)
Secao 4:  Habilidade Unica (Sullivan)
Secao 5:  Perfil de Riqueza (Hamilton)
Secao 6:  Squad Recomendado (Top 3 + Dream Squad)
Secao 7:  Plano de Monetizacao (Hormozi)
Secao 8:  Estilo de Execucao (Kolbe)
Secao 9:  Posicionamento (Hogshead)
Secao 10: Proximos Passos (checklist actionable)
```

3. Aplicar Quality Gate Final (14 checks obrigatorios)
4. Gerar output no formato escolhido (markdown ou html)

**Quality Gate QG-004:**
- [ ] 10/10 secoes preenchidas com dados reais do aluno
- [ ] Zero contradicoes entre secoes
- [ ] Tom empoderador (mentor, nao clinico)
- [ ] Proximos passos concretos e executaveis
- [ ] Blueprint salvo no path correto

**Output:** `squads/zona-genialidade/data/{user_slug}/genius-zone-blueprint.md`

---

### Step 5: ENTREGA (2-3 min)

**Agent Activity:**

Apresentar o Blueprint ao aluno com destaque para os pontos mais importantes:

```
==========================================================
  SEU GENIUS ZONE BLUEPRINT ESTA PRONTO!
==========================================================

  {nome}, aqui esta o resumo do seu perfil:

  Zona atual:       {zona Hendricks}
  Perfil dominante: {perfil Hamilton}
  Top 3 talentos:   {talentos Clifton}
  Habilidade unica: {UA Sullivan em 1 frase}
  Arquetipo:        {arquetipo Hogshead}
  Estilo de acao:   {modo dominante Kolbe}

  SQUAD RECOMENDADO:
  #1 {squad_name} (score: {X}%)
  #2 {squad_name} (score: {X}%)
  #3 {squad_name} (score: {X}%)

  SEU PROXIMO PASSO (HOJE):
  {acao imediata do next_step}

==========================================================

  O Blueprint completo (10 secoes) esta salvo em:
  squads/zona-genialidade/data/{slug}/genius-zone-blueprint.md

  Quer que eu mostre o Blueprint completo agora?
```

**Elicitation Final:**

```yaml
AskUserQuestion:
  question: "O que voce quer fazer agora?"
  options:
    - "Ver o Blueprint completo"
    - "Me explica mais sobre o Squad #1 recomendado"
    - "Quero criar o Squad recomendado agora"
    - "Salvar e ver depois"
  required: true
```

**Se "Quero criar o Squad recomendado agora":**
-> Handoff para `@squad-chief *create-squad` com contexto do perfil

---

## Outputs

### Output Primario

| Arquivo | Localizacao | Descricao |
|---------|-------------|-----------|
| Assessment Result | `squads/zona-genialidade/data/assessments/{slug}-assessment.yaml` | Dados brutos do assessment |
| Genius Profile | `squads/zona-genialidade/data/{slug}/genius-profile.yaml` | 7 analises + sintese cruzada |
| Squad Recommendation | `squads/zona-genialidade/data/{slug}/squad-recommendation.yaml` | Top 3 + Dream Squad |
| **Blueprint** | `squads/zona-genialidade/data/{slug}/genius-zone-blueprint.md` | **Entrega final** |

### Outputs Secundarios

| Arquivo | Descricao |
|---------|-----------|
| `{slug}/analyses/*.yaml` | Analise individual por framework |
| `{slug}/scoring-matrix.yaml` | Matrix completa de matching |
| `{slug}/anti-recommendations.yaml` | Squads a evitar e por que |
| `{slug}/blueprint-metadata.yaml` | Metadata da geracao |

---

## Validacao

### Checklist Pipeline Completa

**Phase 1 - Assessment:**
- [ ] 40+ de 43 perguntas respondidas
- [ ] 5 perguntas abertas com respostas substantivas
- [ ] assessment-result.yaml gerado e valido
- [ ] Tempo total 15-45 min

**Phase 2 - Analise:**
- [ ] 7/7 analises completas
- [ ] Confianca geral >= 0.65
- [ ] 3+ convergencias na sintese
- [ ] Contradicoes documentadas
- [ ] genius-profile.yaml gerado e valido

**Phase 3 - Matching:**
- [ ] Top 3 squads com score >= 0.50
- [ ] Racional especifico por recomendacao (nao generico)
- [ ] Dream Squad projetado com caminho
- [ ] squad-recommendation.yaml gerado e valido

**Phase 4 - Blueprint:**
- [ ] 10/10 secoes preenchidas
- [ ] Zero contradicoes entre secoes
- [ ] Tom empoderador mantido
- [ ] Proximos passos concretos e com prazo
- [ ] Quality Gate Final 14/14 checks

**Pipeline Global:**
- [ ] Todos os 4 quality gates passaram (QG-001 a QG-004)
- [ ] Aluno recebeu resumo executivo
- [ ] Aluno sabe o proximo passo imediato
- [ ] Arquivos salvos nos paths corretos

---

## Error Handling

```yaml
assessment_abandonado:
  trigger: "Usuario para no meio do assessment"
  action: "Salvar respostas parciais em {slug}-partial.yaml"
  recovery: "Na retomada, carregar parcial e continuar da ultima secao"
  message: |
    Sem problema! Salvei suas respostas ate aqui.
    Quando quiser continuar, e so chamar /start de novo.

analise_falha_parcial:
  trigger: "1-2 agentes nao conseguem classificar"
  action: "Classificar com confianca < 0.5, marcar como 'requer dados adicionais'"
  recovery: "Blueprint inclui nota de que analise X tem menor confianca"
  threshold: "Se < 5 agentes completarem -> PARAR e pedir dados adicionais"

matching_sem_squad_forte:
  trigger: "Nenhum squad com score > 0.60"
  action: "Priorizar Dream Squad como recomendacao principal"
  recovery: "Sugerir criacao de squad customizado"

blueprint_contradicao:
  trigger: "Contradicao identificada entre secoes"
  action: "Apresentar como nuance, nao como erro"
  recovery: "Transformar em ponto de exploracao nos proximos passos"

timeout:
  trigger: "Pipeline leva mais de 120 minutos no total"
  action: "Salvar estado parcial, informar progresso"
  recovery: "Retomar do ultimo checkpoint salvo"
```

---

## Integracao

### Depende De
- Nenhum (este e o entry point do pipeline)

### Alimenta
- **Squad Creator:** Se aluno quer criar o squad recomendado, handoff para `@squad-chief`
- **Mentoria Engine:** Blueprint serve como base para sessoes de mentoria
- **Cohort Fundamentals:** Registro do progresso do aluno

### Tasks Encadeadas

```yaml
pipeline_sequence:
  - task: "run-assessment"
    phase: 1
    type: "interactive"
    gate_after: "QG-002"

  - task: "analyze-genius-profile"
    phase: 2
    type: "autonomous"
    gate_after: "QG-003"
    depends_on: "run-assessment"

  - task: "recommend-squad"
    phase: 3
    type: "autonomous"
    depends_on: "analyze-genius-profile"

  - task: "generate-blueprint"
    phase: 4
    type: "autonomous"
    gate_after: "QG-004"
    depends_on: ["analyze-genius-profile", "recommend-squad"]
```

---

## Tom de Voz

### Durante o Assessment (Phase 1)

Tom conversacional e encorajador. O aluno esta vulneravel (compartilhando medos, desejos, frustraccoes). Nao e teste, e conversa com mentor.

```
"Otima resposta. Ja consigo ver um padrao se formando..."
"Interessante. Essa combinacao e rara e valiosa."
"Ultima secao! Voce ta indo muito bem."
```

### Durante a Espera (Phases 2-4)

Tom confiante e informativo. O aluno quer saber que algo esta acontecendo.

```
"7 especialistas analisando seu perfil agora..."
"Gay Hendricks identificou sua zona. Agora os outros 6 vao cruzar dados."
"Matching em andamento. Ja encontrei 3 squads fortes pro seu perfil."
```

### Na Entrega (Step 5)

Tom celebratorio mas direto. E o momento "aha!" do aluno.

```
"Seu Blueprint esta pronto. Isso aqui e ouro."
"Agora voce sabe EXATAMENTE qual e sua zona de genialidade."
"O proximo passo e seu. E comecar HOJE."
```

---

## Notas para o Executor

### Ritmo e Pacing

1. **NaO apressar o assessment** - Se o aluno quer refletir, dar espaco
2. **Celebrar micro-momentos** - Quando uma resposta revela algo forte, comentar
3. **Transicoes entre secoes** - Usar como momento de breathing e contextualizacao
4. **Feedback de progresso** - Barra visual entre secoes (20%, 40%, 60%, 80%, 100%)

### Se o Aluno Questionar o Processo

```
"Por que tantas perguntas?"
-> "Cada pergunta alimenta 2-4 frameworks ao mesmo tempo.
    Se fizessemos cada framework separado, seriam 3 horas.
    Assim, em 30 minutos voce tem 7 analises."

"Isso funciona mesmo?"
-> "7 frameworks com decadas de pesquisa e milhoes de assessments.
    Quando todos apontam a mesma direcao, a gente sabe que achou."

"Posso ver so o resultado do Hendricks?"
-> "Pode, mas recomendo esperar o Blueprint completo.
    O poder esta no cruzamento dos 7, nao em um isolado."
```

### Se o Aluno Ja Tem Resultados Formais

Se ele tem CliftonStrengths oficial, DISC formal, Kolbe A Index, etc:
1. Registrar como ancora de calibracao
2. NAO pular perguntas do assessment (precisamos no nosso formato)
3. Na analise, usar resultados formais para validar estimativas
4. Se discrepancia entre formal e estimativa -> usar o formal

---

## Historico de Revisoes

| Versao | Data | Mudanca |
|---------|------|--------|
| 1.0.0 | 2026-02-13 | Release inicial - pipeline completa ponta-a-ponta |
