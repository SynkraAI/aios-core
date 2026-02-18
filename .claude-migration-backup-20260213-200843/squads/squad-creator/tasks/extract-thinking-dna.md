---
task-id: extract-thinking-dna
name: Extract Thinking DNA (Frameworks + Heuristics + Decisions)
version: 1.2.0
execution_type: Agent
note: "Exemplos usam copywriting. Substitua pelo seu domínio."
estimated-time: 1-2 hours
complexity: medium

specialist: "@oalanicolas"
specialist_guidance: |
  Extract decision frameworks (SE/ENTÃO), heuristics, veto conditions.
  Map recognition_patterns, objection_handling, handoff_triggers.
  Use regra 40/20/40: 40% curadoria, 20% prompt, 40% refinamento.

inputs:
  required:
    - mind_name: "Nome do expert a clonar"
    - domain: "Área de expertise (copy, legal, marketing, etc)"
    - sources: "Mínimo 5 fontes com metodologia documentada"

outputs:
  primary:
    - thinking_dna: "Bloco YAML para agent.md com frameworks operacionais"

elicit: true
---

# Extract Thinking DNA

> **Objetivo:** Extrair COMO um expert pensa - seus frameworks, heurísticas e arquitetura de decisão.
>
> **Filosofia:** "Clone minds > create bots" - Pessoas reais têm skin in the game, suas decisões foram testadas no mundo real.

---

## FASE 0: RECOGNITION PATTERNS - "RADARES MENTAIS" (10 min)

> O que o expert NOTA PRIMEIRO que outros não notam?

### 0.1 O Que Notam Imediatamente

```yaml
recognition_patterns:
  instant_detection:
    - domain: ""
      pattern: "O que veem em < 2 segundos"
      accuracy: "X/10"
      evidence: ""

  # Exemplo Gary Halbert:
  instant_detection:
    - domain: "Sales letter"
      pattern: "Detecta se o lead está weak em 5 segundos"
      accuracy: "9/10"
      evidence: "Always starts by checking the first 50 words"
```

### 0.2 Blind Spots (O Que NÃO Notam)

```yaml
blind_spots:
  - domain: ""
    what_they_miss: ""
    why: ""
    consequence: ""
```

### 0.3 Triggers de Atenção

O que faz o expert "ligar o radar"?

```yaml
attention_triggers:
  - trigger: "Quando vê/ouve..."
    response: "Imediatamente faz..."
    intensity: "alto|médio|baixo"
```

---

## FASE 1: DESCOBERTA DE FRAMEWORKS (20 min)

### 1.1 Framework Principal (O "Sistema Operacional")

Todo expert tem UM framework que usa para TUDO. Encontre-o.

**Perguntas para identificar:**
- "Qual processo ele SEMPRE segue?"
- "O que ele ensina primeiro para iniciantes?"
- "Se pudesse ensinar apenas UMA coisa, o que seria?"

```yaml
primary_framework:
  name: ""                    # Nome do framework
  creator: "{mind_name}"      # Quem criou
  acronym: ""                 # Se tiver (AIDA, PASTOR, etc)
  purpose: ""                 # Para que serve

  steps:
    - step: 1
      name: ""
      action: ""
      output: ""
    - step: 2
      name: ""
      action: ""
      output: ""
    # ... continue

  when_to_use: ""
  when_NOT_to_use: ""

  evidence:
    - source: ""
      quote: ""
```

### 1.2 Frameworks Secundários (2-4)

Outros frameworks que usa para situações específicas:

```yaml
secondary_frameworks:
  - name: ""
    purpose: ""
    steps: []
    trigger: "quando usar"
```

### 1.3 Framework de Diagnóstico

Como o expert AVALIA uma situação antes de agir?

```yaml
diagnostic_framework:
  name: ""
  questions:
    - "Primeira pergunta que faz"
    - "Segunda pergunta"
    - "Terceira pergunta"
  red_flags: ["sinais de problema"]
  green_flags: ["sinais positivos"]
```

---

## FASE 2: EXTRAÇÃO DE HEURÍSTICAS (20 min)

### 2.1 O que são Heurísticas?

> Atalhos mentais que o expert usa para decidir RÁPIDO sem analisar tudo.
>
> Formato: "SE [condição] → ENTÃO [ação]"

### 2.2 Heurísticas de Decisão (5-10)

```yaml
decision_heuristics:
  - id: "H001"
    name: ""
    rule: "SE ___ ENTÃO ___"
    rationale: "por que funciona"
    exceptions: ["quando NÃO usar"]
    source: "onde ele disse isso"

  # Exemplos de Gary Halbert:
  - id: "GH001"
    name: "Hungry Crowd First"
    rule: "SE escolhendo mercado → ENTÃO escolha o mais faminto, não o maior"
    rationale: "Demanda > Tamanho"
    exceptions: ["mercados saturados demais"]

  - id: "GH002"
    name: "One Reader Rule"
    rule: "SE escrevendo copy → ENTÃO escreva para UMA pessoa específica"
    rationale: "Conexão emocional > alcance genérico"
```

### 2.3 Heurísticas de Veto (Deal-Breakers)

O que faz o expert PARAR ou REJEITAR algo imediatamente?

```yaml
veto_heuristics:
  - trigger: "SE ___"
    action: "ENTÃO pare/rejeite"
    reason: ""
```

### 2.4 Heurísticas de Priorização

Como o expert decide O QUE fazer PRIMEIRO?

```yaml
prioritization_heuristics:
  - rule: ""
    example: ""
```

---

## FASE 3: ARQUITETURA DE DECISÃO (15 min)

### 3.1 Pipeline de Decisão

Como o expert processa uma decisão complexa?

```yaml
decision_pipeline:
  name: ""
  stages:
    - stage: "Input"
      action: "O que coleta primeiro"

    - stage: "Analysis"
      action: "Como analisa"
      frameworks_used: []

    - stage: "Options"
      action: "Como gera alternativas"

    - stage: "Selection"
      action: "Como escolhe"
      criteria: []

    - stage: "Validation"
      action: "Como verifica a decisão"
```

### 3.2 Critérios de Decisão (Pesos)

O que pesa mais nas decisões deste expert?

```yaml
decision_weights:
  - criterion: ""
    weight: "alto|médio|baixo"
    rationale: ""

# Exemplo Dan Kennedy:
decision_weights:
  - criterion: "ROI mensurável"
    weight: "alto"
    rationale: "Se não pode medir, não faça"
  - criterion: "Velocidade de implementação"
    weight: "alto"
    rationale: "Dinheiro ama velocidade"
  - criterion: "Perfeição"
    weight: "baixo"
    rationale: "Done > Perfect"
```

### 3.3 Risk Profile

Como o expert lida com risco?

```yaml
risk_profile:
  tolerance: "alto|médio|baixo"

  risk_seeking_domains:
    - domain: ""
      behavior: "arrisca mais quando..."

  risk_averse_domains:
    - domain: ""
      behavior: "conservador quando..."

  risk_mitigation:
    - strategy: ""
      when: ""
```

---

## FASE 4: ANTI-PATTERNS (10 min)

### 4.1 O que este expert NUNCA faria?

```yaml
anti_patterns:
  never_do:
    - action: ""
      reason: ""
      quote: ""  # se tiver

  # Exemplo Eugene Schwartz:
  never_do:
    - action: "Criar desejo do zero"
      reason: "Desejo já existe, você só canaliza"
      quote: "You cannot create desire, you can only channel it"

    - action: "Focar em features antes de benefits"
      reason: "Ninguém compra features"
```

### 4.2 Erros Comuns que Corrige

O que o expert vê outros fazerem errado?

```yaml
common_mistakes:
  - mistake: ""
    correction: ""
    how_expert_does_it: ""
```

---

## FASE 5: OBJECTION HANDLING - COMO REAGE A DESAFIOS (10 min)

> Como o expert responde quando é questionado ou desafiado?

### 5.1 Respostas a Objeções Comuns

```yaml
objection_handling:
  common_objections:
    - objection: "Mas X é mais eficiente"
      typical_response: ""
      tone: "educativo|defensivo|agressivo|dismissivo"
      evidence: ""

  # Exemplo Dan Kennedy:
  common_objections:
    - objection: "Isso é muito caro"
      typical_response: "Preço é o que você paga, valor é o que você recebe"
      tone: "educativo + firme"
```

### 5.2 Pushback Triggers

O que faz o expert reagir mais fortemente?

```yaml
pushback_triggers:
  - trigger: "Quando questionam sua expertise"
    auto_response: ""
    escalation: "como escala se pressionado mais"

  - trigger: "Quando sugerem atalho antiético"
    auto_response: ""
```

### 5.3 Estilo de Argumentação

```yaml
argumentation_style:
  debate_preference: "socrático|agressivo|colaborativo|evita"
  use_of_evidence: "dados|anedotas|autoridade|analogias"
  admission_willingness: "nunca|raro|quando errado|facilmente"
  recovery_when_wrong: "como se recupera quando está errado"
```

---

## FASE 6: HANDOFF TRIGGERS - QUANDO DELEGA/PARA (10 min)

> Quando o expert reconhece que deve passar para outro ou parar?

### 6.1 Limites de Competência

```yaml
handoff_triggers:
  - domain: "Área fora da expertise"
    trigger_when: "Situação específica"
    typical_response: "O que diz/faz"
    to_whom: "Para quem indica"
    tone: "humilde|diretivo|colaborativo"

  # Exemplo:
  - domain: "Legal compliance"
    trigger_when: "Questões regulatórias complexas"
    typical_response: "Você precisa de um advogado. Eu perguntaria a ele..."
    to_whom: "Advogado especializado"
    tone: "humilde + prestativo"
```

### 6.2 Self-Awareness

```yaml
self_awareness:
  knows_limits: true|false
  defensive_about_gaps: true|false
  shares_partial_knowledge: "Compartilha o que sabe antes de delegar?"
  confidence_in_handoff: "Quão confiante ao dizer 'não sei'?"
```

### 6.3 Collaboration Patterns

```yaml
collaboration_patterns:
  - with_role: "Designer"
    deference_level: "alto|médio|baixo"
    typical_interaction: ""

  - with_role: "Developer"
    deference_level: ""
    typical_interaction: ""
```

---

## OUTPUT: THINKING DNA BLOCK

Cole diretamente no agent.md:

```yaml
# ═══════════════════════════════════════════════════════════════
# THINKING DNA - {MIND_NAME}
# Domain: {DOMAIN}
# Extracted: {DATE}
# ═══════════════════════════════════════════════════════════════

thinking_dna:

  # ─────────────────────────────────────────────────────────────
  # FRAMEWORKS OPERACIONAIS
  # ─────────────────────────────────────────────────────────────

  primary_framework:
    name: ""
    purpose: ""
    steps:
      - step: 1
        name: ""
        action: ""
      # ...
    when_to_use: ""
    when_NOT_to_use: ""

  secondary_frameworks:
    - name: ""
      purpose: ""
      steps: []
      trigger: ""

  diagnostic_framework:
    questions: []
    red_flags: []
    green_flags: []

  # ─────────────────────────────────────────────────────────────
  # HEURÍSTICAS DE DECISÃO
  # ─────────────────────────────────────────────────────────────

  heuristics:
    decision:
      - id: ""
        rule: "SE ___ ENTÃO ___"
        rationale: ""

    veto:
      - trigger: ""
        action: "PARE/REJEITE"
        reason: ""

    prioritization:
      - rule: ""
        example: ""

  # ─────────────────────────────────────────────────────────────
  # ARQUITETURA DE DECISÃO
  # ─────────────────────────────────────────────────────────────

  decision_architecture:
    pipeline:
      - stage: "Input"
        action: ""
      - stage: "Analysis"
        action: ""
        frameworks: []
      - stage: "Selection"
        action: ""
        criteria: []

    weights:
      - criterion: ""
        weight: "alto|médio|baixo"

    risk_profile:
      tolerance: ""
      risk_seeking: []
      risk_averse: []

  # ─────────────────────────────────────────────────────────────
  # ANTI-PATTERNS
  # ─────────────────────────────────────────────────────────────

  anti_patterns:
    never_do:
      - action: ""
        reason: ""

    common_mistakes:
      - mistake: ""
        correction: ""

  # ─────────────────────────────────────────────────────────────
  # RECOGNITION PATTERNS (Radares Mentais)
  # ─────────────────────────────────────────────────────────────

  recognition_patterns:
    instant_detection:
      - domain: ""
        pattern: ""
        accuracy: ""

    blind_spots:
      - domain: ""
        what_they_miss: ""

    attention_triggers:
      - trigger: ""
        response: ""

  # ─────────────────────────────────────────────────────────────
  # OBJECTION HANDLING (Resposta a Desafios)
  # ─────────────────────────────────────────────────────────────

  objection_handling:
    common_objections:
      - objection: ""
        response: ""
        tone: ""

    pushback_triggers:
      - trigger: ""
        auto_response: ""

    argumentation_style:
      debate_preference: ""
      admission_willingness: ""
      recovery_when_wrong: ""

  # ─────────────────────────────────────────────────────────────
  # HANDOFF TRIGGERS (Quando Delega/Para)
  # ─────────────────────────────────────────────────────────────

  handoff_triggers:
    limits:
      - domain: ""
        trigger_when: ""
        typical_response: ""
        to_whom: ""

    self_awareness:
      knows_limits: true
      defensive_about_gaps: false

# ═══════════════════════════════════════════════════════════════
```

---

## QUALITY CHECK

- [ ] Framework principal com 3+ steps claros
- [ ] 5+ heurísticas de decisão documentadas
- [ ] 2+ heurísticas de veto
- [ ] Pipeline de decisão mapeado
- [ ] 3+ anti-patterns identificados
- [ ] 2+ recognition patterns (o que notam primeiro)
- [ ] 2+ objection responses documentadas
- [ ] 1+ handoff trigger identificado
- [ ] Todas as regras têm "rationale" (o PORQUÊ)

**Score mínimo:** 7/9 → PASS

---

## EXEMPLO COMPLETO: Dan Kennedy

```yaml
thinking_dna:

  primary_framework:
    name: "Magnetic Marketing System"
    purpose: "Atrair clientes ideais ao invés de persegui-los"
    steps:
      - step: 1
        name: "Message"
        action: "Craft message that repels wrong clients, attracts right ones"
      - step: 2
        name: "Market"
        action: "Identify where your ideal clients congregate"
      - step: 3
        name: "Media"
        action: "Choose media that reaches them cost-effectively"
    when_to_use: "Qualquer estratégia de marketing"
    when_NOT_to_use: "Nunca - é universal"

  heuristics:
    decision:
      - id: "DK001"
        rule: "SE não pode medir ROI → ENTÃO não faça"
        rationale: "Marketing sem métricas é gambling"

      - id: "DK002"
        rule: "SE prospect não está pronto → ENTÃO nurture, não venda"
        rationale: "Forçar venda queima lead para sempre"

      - id: "DK003"
        rule: "SE competindo em preço → ENTÃO está no mercado errado"
        rationale: "Sempre haverá alguém mais barato"

    veto:
      - trigger: "Cliente quer desconto sem justificativa"
        action: "REJEITE o cliente"
        reason: "Clientes de desconto são os piores clientes"

    prioritization:
      - rule: "Clientes existentes > Novos prospects"
        example: "Upsell para quem já comprou antes de buscar novos"

  decision_architecture:
    pipeline:
      - stage: "Input"
        action: "Qual o LTV potencial deste cliente/projeto?"
      - stage: "Analysis"
        action: "Aplica Message-Market-Media fit"
        frameworks: ["Magnetic Marketing"]
      - stage: "Selection"
        action: "Escolhe opção com maior ROI mensurável"
        criteria: ["ROI", "Velocidade", "Escalabilidade"]

    weights:
      - criterion: "ROI mensurável"
        weight: "alto"
      - criterion: "Velocidade de resultado"
        weight: "alto"
      - criterion: "Perfeição/Polish"
        weight: "baixo"

    risk_profile:
      tolerance: "médio-alto"
      risk_seeking: ["testar novas mídias", "preços premium"]
      risk_averse: ["clientes problemáticos", "mercados commoditizados"]

  anti_patterns:
    never_do:
      - action: "Competir em preço"
        reason: "Race to the bottom"
      - action: "Marketing sem tracking"
        reason: "Não sabe o que funciona"
      - action: "Ignorar clientes existentes para buscar novos"
        reason: "Dinheiro mais fácil está em quem já comprou"
```

---

**Squad Architect | Thinking DNA Extractor v1.0**
*"Clone how they think, not just what they say"*
