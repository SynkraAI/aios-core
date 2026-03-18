# sovereignty-check

## Metadata
```yaml
task_id: KOE_CHIEF_004
agent: koe-chief
type: validation
complexity: low
estimated_time: 10min
source: "Dan Koe — The Art of Focus + One-Person Business Philosophy"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
```

## Purpose
Avaliação rápida de soberania em 5 dimensões (scored 0-10) antes de qualquer recomendação significativa, garantindo que as ações propostas aumentem — e nunca diminuam — a soberania do criador.

> "The goal of a one-person business is not to build a company. It's to build a life. If your business doesn't give you more freedom, you've just created a fancy job." — Dan Koe

## Context
A soberania é o meta-princípio de Dan Koe. Toda decisão — de conteúdo, oferta, marca, distribuição — deve ser filtrada pela pergunta: "Isso aumenta ou diminui minha soberania?"

Este check é executado como pré-condição antes de qualquer recomendação importante do Koe Squad. Se uma ação proposta diminui soberania em qualquer dimensão sem compensação clara em outra, ela deve ser vetada ou reformulada.

As 5 dimensões de soberania:
1. **Tempo** — Controle sobre como gasta suas horas
2. **Criativa** — Liberdade de criar o que quer, como quer
3. **Financeira** — Independência financeira e diversificação
4. **Locacional** — Trabalhar de qualquer lugar
5. **Relacional** — Sem dependências tóxicas ou obrigações desgastantes

O sovereignty check é rápido por design — deve tomar no máximo 10 minutos e pode ser executado inline durante qualquer outro task.

---

## Steps

### STEP 1: Coletar Scores das 5 Dimensões
Pedir ao usuário que avalie cada dimensão de 0-10, com âncoras claras:

```yaml
scoring_anchors:
  time_sovereignty:
    0: "Zero controle — horário 100% ditado por outros"
    3: "Pouco controle — emprego tradicional com alguma flexibilidade"
    5: "Controle moderado — freelance/híbrido, mas ainda preso a entregas"
    7: "Bom controle — escolhe quando trabalha, com exceções"
    10: "Controle total — trabalha quando quer, quanto quer"

  creative_sovereignty:
    0: "Zero — faz o que mandam, cria por obrigação"
    3: "Pouco — tem liberdade criativa limitada, cliente/chefe define"
    5: "Moderado — cria conteúdo próprio mas faz concessões por dinheiro"
    7: "Bom — cria quase tudo que quer, poucas concessões"
    10: "Total — cria exclusivamente o que quer, sem compromissos"

  financial_sovereignty:
    0: "Zero — sem renda ou 100% dependente de uma fonte"
    3: "Pouco — renda existe mas 1 fonte, instável"
    5: "Moderado — 2-3 fontes, cobre custos mas sem reserva"
    7: "Bom — múltiplas fontes, reserva de 6+ meses"
    10: "Total — renda passiva cobre 100% dos custos, crescendo"

  location_sovereignty:
    0: "Zero — preso a local fixo por trabalho"
    3: "Pouco — pode trabalhar remoto às vezes"
    5: "Moderado — trabalha remoto mas com fuso/reuniões fixas"
    7: "Bom — 90% independente de local"
    10: "Total — trabalha de qualquer lugar do mundo, sem restrições"

  relationship_sovereignty:
    0: "Zero — relações tóxicas/obrigatórias dominam"
    3: "Pouco — algumas obrigações desgastantes inescapáveis"
    5: "Moderado — relações ok, mas falta comunidade de pares"
    7: "Bom — relações saudáveis, comunidade ativa"
    10: "Total — cercado de pessoas que elevam, zero toxicidade"
```

### STEP 2: Calcular Score Composto
```yaml
calculation:
  overall_score: "{{média simples dos 5 scores}}"

  interpretation:
    0_to_3:
      label: "CRÍTICO — Preso"
      message: "Soberania muito baixa. Prioridade absoluta é aumentar controle sobre tempo e finanças. Não otimize conteúdo/ofertas — primeiro garanta base."
      recommended_agent: koe-advisor

    4_to_5:
      label: "ALERTA — Construindo"
      message: "Soberania em construção. Cada decisão deve ser avaliada: isso me liberta ou me prende mais? Foco em construir assets que trabalham por você."
      recommended_agent: koe-chief

    6_to_7:
      label: "BOM — Crescendo"
      message: "Soberania saudável. Momento de otimizar e escalar sem comprometer o que já conquistou. Cuidado com oportunidades que parecem boas mas adicionam dependência."
      recommended_agent: koe-offers

    8_to_10:
      label: "EXCELENTE — Soberano"
      message: "Soberania alta. Momento de maximizar impacto e legacy. Criar sistemas que amplifiquem sem adicionar complexidade."
      recommended_agent: koe-sintetizador

  weakest_dimension:
    identify: "{{dimensão com menor score}}"
    action: "{{ação específica para melhorar a dimensão mais fraca}}"

  strongest_dimension:
    identify: "{{dimensão com maior score}}"
    leverage: "{{como usar a força para compensar fraquezas}}"
```

### STEP 3: Validar Ação Proposta contra Soberania
Se este check está sendo executado como pré-condição de outra recomendação, validar:

```yaml
action_validation:
  proposed_action: "{{ação que será recomendada}}"

  impact_assessment:
    time_impact: "+{{n}}" or "-{{n}}"      # positivo = aumenta soberania
    creative_impact: "+{{n}}" or "-{{n}}"
    financial_impact: "+{{n}}" or "-{{n}}"
    location_impact: "+{{n}}" or "-{{n}}"
    relationship_impact: "+{{n}}" or "-{{n}}"

  net_sovereignty_change: "{{soma dos impactos}}"

  verdict:
    approved: "{{net change >= 0}}"
    conditional: "{{net change < 0 but temporary sacrifice for greater gain}}"
    vetoed: "{{net change < 0 and no clear path to recovery}}"

  veto_override:
    allowed: "{{only if user explicitly acknowledges sovereignty cost}}"
    requires_acknowledgment: |
      Esta ação pode reduzir sua soberania em [DIMENSÃO] de [CURRENT] para [PROJECTED].
      Quer prosseguir mesmo assim? (preciso de confirmação explícita)
```

### STEP 4: Gerar Recomendações de Melhoria
Para as dimensões abaixo de 7, sugerir ações concretas:

```yaml
improvement_playbook:
  time_sovereignty:
    quick_wins:
      - "Automatize 1 tarefa repetitiva esta semana"
      - "Diga 'não' para 1 compromisso que drena energia"
      - "Implemente time-blocking para deep work (2-4h/dia)"
    medium_term:
      - "Crie SOPs para delegar tarefas operacionais"
      - "Substitua renda ativa por renda de conteúdo/produtos"

  creative_sovereignty:
    quick_wins:
      - "Publique 1 conteúdo sobre algo que VOCÊ quer falar (não o que 'performa')"
      - "Inicie um Queue System para capturar ideias próprias"
    medium_term:
      - "Desenvolva uma Big Idea única que só VOCÊ pode ter"
      - "Pare de copiar formatos — crie o seu próprio"

  financial_sovereignty:
    quick_wins:
      - "Identifique 1 skill monetizável que já possui"
      - "Crie oferta mínima viável esta semana"
    medium_term:
      - "Construa 2a fonte de renda digital"
      - "Aumente reserva para 6 meses de custos"

  location_sovereignty:
    quick_wins:
      - "Teste trabalhar de local diferente por 1 dia"
      - "Migre 1 processo para 100% digital"
    medium_term:
      - "Elimine todas as obrigações presenciais desnecessárias"

  relationship_sovereignty:
    quick_wins:
      - "Identifique 1 relação que drena energia e estabeleça boundary"
      - "Conecte-se com 1 criador no mesmo estágio"
    medium_term:
      - "Construa ou entre em comunidade de pares (mastermind)"
      - "Elimine relações profissionais tóxicas/dependentes"
```

---

## Input Required
```yaml
sovereignty_input:
  scores:
    time: ""           # 0-10
    creative: ""       # 0-10
    financial: ""      # 0-10
    location: ""       # 0-10
    relationship: ""   # 0-10
  proposed_action: ""  # optional — action to validate against sovereignty
  context: ""          # optional — additional context
```

## Output Template
```yaml
sovereignty_result:
  task_id: KOE_CHIEF_004
  timestamp: "{{ISO_TIMESTAMP}}"

  scores:
    time: "{{0-10}}"
    creative: "{{0-10}}"
    financial: "{{0-10}}"
    location: "{{0-10}}"
    relationship: "{{0-10}}"
    overall: "{{média}}"

  interpretation:
    label: "{{CRÍTICO|ALERTA|BOM|EXCELENTE}}"
    message: "{{interpretation text}}"
    weakest: "{{dimension}}"
    strongest: "{{dimension}}"

  action_validation:
    proposed_action: "{{action or N/A}}"
    verdict: "{{approved|conditional|vetoed}}"
    net_change: "{{+/-N}}"
    reasoning: "{{explanation}}"

  improvements:
    priority_dimension: "{{weakest dimension}}"
    quick_wins:
      - "{{action 1}}"
      - "{{action 2}}"
    medium_term:
      - "{{action 1}}"
      - "{{action 2}}"

  sovereignty_trajectory: "{{toward|away|stable}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Todas as 5 dimensões foram scored (nenhuma vazia)
  - [ ] Scores usam as âncoras fornecidas (não inventou escala)
  - [ ] Overall score é média aritmética simples
  - [ ] Interpretação corresponde à faixa correta
  - [ ] Se ação proposta existia, foi validada com impact assessment
  - [ ] Recomendações de melhoria são específicas e acionáveis
  - [ ] Dimensão mais fraca tem plano de quick wins
  - [ ] Execution time <= 10 minutos
```

## Handoff
After completion: → koe-chief (routing) ou → koe-advisor (se sovereignty score < 4, prioridade é strategic counsel)

---
*Task: KOE_CHIEF_004 | Agent: koe-chief | Version: 1.0*
