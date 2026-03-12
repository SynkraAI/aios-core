# Design Triage - Request Classification and Routing

> Task ID: design-triage
> Agent: Design Chief (Orchestrator)
> Version: 1.0.0

## Purpose

Analyze incoming design requests, classify them by type (brand, UI, photo, video, business), assess complexity, and route to the appropriate specialist agent. This is the gateway task that ensures every design request reaches the expert best suited to deliver results.

## Context

The Design Squad consists of 9 elite specialists organized in three tiers:

**TIER 0 - Foundation (Strategy)**
- @marty-neumeier: Brand Strategy, Positioning, Differentiation
- @dave-malouf: DesignOps, Team Scaling, Processes

**TIER 1 - Masters (Execution)**
- @chris-do: Design Business, Pricing, Client Negotiation
- @paddy-galloway: YouTube Strategy, Thumbnails, CTR Optimization
- @joe-mcnally: Photography, Lighting, Flash Techniques

**TIER 2 - Specialists (Craft)**
- @brad-frost: Design Systems, Atomic Design, Tokens
- @aaron-draplin: Logo Design, Brand Marks, Visual Identity
- @peter-mckinnon: Photo/Video Editing, Lightroom, Color Grading

Design Chief's role is NEVER to execute - only to route intelligently.

## Prerequisites

- Active Design Chief context (`@design-chief` or `/Design:agents:design-chief`)
- Incoming design request from user
- Understanding of specialist capabilities and tier system

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| request | string | Yes | User's design request or project description |
| context | object | No | Additional context (business type, constraints, timeline) |
| priority | string | No | Priority level: low, medium, high, urgent |

## Workflow

### Phase 1: Request Analysis

**Step 1.1: Extract Core Intent**
- Parse the user's request for primary objective
- Identify key deliverables mentioned (logo, thumbnail, photo, system, etc.)
- Note any explicit specialist mentions or preferences
- Validation: Primary intent identified

**Step 1.2: Keyword Detection**
Execute keyword matching against routing matrix:

```yaml
brand_keywords:
  - brand, marca, identidade, posicionamento, diferenciacao, zag
  - route: @marty-neumeier

scaling_keywords:
  - escalar, scale, operacoes, processos, designops, team, governanca
  - route: @dave-malouf (then @brad-frost if system needed)

pricing_keywords:
  - preco, pricing, valor, cobrar, proposta, cliente, negociacao
  - route: @chris-do

logo_keywords:
  - logo, logotipo, marca grafica, simbolo, identidade visual, brand mark
  - route: @aaron-draplin

thumbnail_keywords:
  - thumbnail, miniatura, youtube, click, ctr, video cover
  - route: @paddy-galloway

photography_keywords:
  - foto, iluminacao, flash, retrato, lighting, portrait, shoot
  - route: @joe-mcnally (then @peter-mckinnon for editing)

system_keywords:
  - design system, tokens, components, atomic, padronizacao, ui library
  - route: @brad-frost

editing_keywords:
  - edicao, lightroom, preset, color grade, retouch, editing
  - route: @peter-mckinnon
```

- Validation: At least one keyword category matched OR marked as ambiguous

**Step 1.3: Complexity Assessment**
Evaluate request complexity on three axes:

```yaml
scope_complexity:
  single_deliverable: 1  # Just a logo
  multiple_deliverables: 2  # Logo + guidelines
  full_project: 3  # Complete rebrand

specialist_count:
  single: 1  # One specialist can handle
  sequential: 2  # Multiple specialists, sequential
  parallel: 3  # Multiple specialists, parallel work

timeline_pressure:
  flexible: 1  # No deadline
  defined: 2  # Has deadline
  urgent: 3  # Rush job
```

- Calculate complexity score: (scope + specialists + timeline) / 3
- Validation: Complexity score between 1.0 and 3.0

### Phase 2: Classification

**Step 2.1: Determine Request Type**

```yaml
request_types:
  BRAND_STRATEGY:
    description: "Strategic brand work - positioning, differentiation"
    primary_specialist: @marty-neumeier
    indicators:
      - New brand creation
      - Brand repositioning
      - Competitive differentiation
      - Brand voice/personality

  VISUAL_IDENTITY:
    description: "Logo and brand mark creation"
    primary_specialist: @aaron-draplin
    indicators:
      - Logo design request
      - Brand mark update
      - Visual identity system

  DESIGN_SYSTEM:
    description: "UI patterns, tokens, component libraries"
    primary_specialist: @brad-frost
    indicators:
      - Design system creation
      - Component audit
      - Token extraction
      - Pattern consolidation

  YOUTUBE_VISUAL:
    description: "YouTube thumbnails and channel visuals"
    primary_specialist: @paddy-galloway
    indicators:
      - Thumbnail optimization
      - CTR improvement
      - YouTube strategy

  PHOTOGRAPHY:
    description: "Photo capture and lighting"
    primary_specialist: @joe-mcnally
    indicators:
      - Product photography
      - Portrait session
      - Lighting setup

  PHOTO_VIDEO_EDITING:
    description: "Post-production editing work"
    primary_specialist: @peter-mckinnon
    indicators:
      - Color grading
      - Preset creation
      - Retouching
      - Video editing

  DESIGN_BUSINESS:
    description: "Pricing, proposals, client work"
    primary_specialist: @chris-do
    indicators:
      - Pricing questions
      - Client negotiation
      - Proposal creation
      - Value communication

  DESIGN_OPERATIONS:
    description: "Team scaling, processes, governance"
    primary_specialist: @dave-malouf
    indicators:
      - Team structure
      - Design process
      - Scaling challenges
      - Governance needs

  MULTI_DOMAIN:
    description: "Complex project spanning multiple domains"
    primary_specialist: WORKFLOW_REQUIRED
    indicators:
      - Complete rebrand
      - End-to-end project
      - Multiple deliverable types
```

- Validation: Request classified into exactly one type

**Step 2.2: Identify Workflow Pattern**

For MULTI_DOMAIN requests, select workflow pattern:

```yaml
workflow_patterns:
  FULL_REBRAND:
    flow: "@marty-neumeier -> @aaron-draplin -> @brad-frost"
    phases: ["Strategy", "Logo", "System"]
    duration_estimate: "4-8 weeks"

  YOUTUBE_OPTIMIZATION:
    flow: "@paddy-galloway -> @peter-mckinnon"
    phases: ["Strategy", "Execution"]
    duration_estimate: "1-2 weeks"

  PHOTOGRAPHY_PRODUCTION:
    flow: "@joe-mcnally -> @peter-mckinnon"
    phases: ["Capture", "Edit"]
    duration_estimate: "2-5 days"

  DESIGN_SCALING:
    flow: "@dave-malouf -> @brad-frost"
    phases: ["Operations", "System"]
    duration_estimate: "4-6 weeks"

  BRAND_TO_SYSTEM:
    flow: "@marty-neumeier -> @brad-frost"
    phases: ["Strategy", "System"]
    duration_estimate: "3-5 weeks"
```

- Validation: Workflow pattern selected if MULTI_DOMAIN

### Phase 3: Clarification (If Needed)

**Step 3.1: Ambiguity Detection**

Trigger clarification questions if:
- No keyword matches found
- Multiple equally valid specialists
- Scope unclear
- Critical information missing

**Step 3.2: Context Questions**

```yaml
scope_questions:
  - "Qual e o objetivo principal desse projeto?"
  - "E um projeto novo ou uma revisao/melhoria?"
  - "Qual o escopo - peca unica ou sistema completo?"

context_questions:
  - "Qual e o negocio/produto?"
  - "Quem e o publico-alvo?"
  - "Existe brand guidelines ou estamos criando do zero?"

constraint_questions:
  - "Qual o prazo?"
  - "Qual o orcamento (se relevante)?"
  - "Ha restricoes tecnicas ou de plataforma?"

success_questions:
  - "Como voce vai medir sucesso?"
  - "O que seria um resultado excelente vs aceitavel?"
  - "Quem precisa aprovar o resultado final?"
```

- Ask maximum 3 questions per clarification round
- Validation: User response received

**Step 3.3: Re-classify After Clarification**
- Return to Phase 2 with new information
- Validation: Classification now unambiguous

### Phase 4: Routing Decision

**Step 4.1: Generate Routing Recommendation**

```yaml
routing_decision:
  primary_specialist: "@{specialist_id}"
  reason: "{Why this specialist is the best fit}"
  tier: "{0|1|2}"
  complexity: "{score}"
  estimated_duration: "{timeframe}"
  dependencies:
    - specialist: "@{optional_second_specialist}"
      phase: "{when in workflow}"
      reason: "{why needed}"
```

- Validation: Routing decision complete with justification

**Step 4.2: Present Options (If Multiple Valid Routes)**

When ambiguity remains, present numbered options:

```
Para esse projeto, existem dois caminhos validos:

1. @aaron-draplin para o logo primeiro, depois sistema
   - Foco no craft visual imediato
   - Melhor se: ja tem estrategia definida

2. @marty-neumeier para estrategia primeiro, depois logo
   - Foco na fundacao estrategica
   - Melhor se: marca e nova ou precisa reposicionamento

Qual abordagem faz mais sentido para o seu contexto?
```

- Validation: User selects option

**Step 4.3: Confirm Routing**

Before handoff:
- Summarize understanding of the request
- State the selected specialist and reason
- Ask for confirmation: "Posso fazer a conexao com @{specialist}?"
- Validation: User confirms routing

### Phase 5: Handoff Preparation

**Step 5.1: Create Handoff Brief**

```yaml
handoff_brief:
  project_summary: "{One paragraph description}"
  primary_objective: "{What needs to be achieved}"
  key_deliverables:
    - "{Deliverable 1}"
    - "{Deliverable 2}"
  constraints:
    timeline: "{If specified}"
    budget: "{If specified}"
    technical: "{If specified}"
  success_criteria:
    - "{Criterion 1}"
    - "{Criterion 2}"
  context_notes: "{Any important background}"
  user_preferences: "{Stated preferences}"
```

- Validation: Brief complete and accurate

**Step 5.2: Log Routing Decision**

Update session history:
```yaml
routing_log:
  timestamp: "{ISO timestamp}"
  request_summary: "{Brief}"
  classification: "{Type}"
  complexity_score: "{Score}"
  routed_to: "@{specialist}"
  reason: "{Justification}"
  workflow_pattern: "{If multi-domain}"
```

- Validation: Log entry created

**Step 5.3: Initiate Handoff**

Execute handoff to specialist:
- Transfer handoff brief
- Set specialist context
- Begin specialist workflow
- Validation: Specialist activated

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| classification_result | object | Request type, complexity, keywords matched |
| routing_decision | object | Selected specialist, reason, tier |
| handoff_brief | object | Complete brief for specialist |
| routing_log | object | Session log entry |

### Output Format

```yaml
triage_result:
  request:
    original: "{User's original request}"
    parsed_intent: "{Extracted primary intent}"
    keywords_matched: ["keyword1", "keyword2"]

  classification:
    type: "VISUAL_IDENTITY"
    complexity_score: 1.7
    scope: "single_deliverable"

  routing:
    primary_specialist: "@aaron-draplin"
    tier: 2
    reason: "Logo design request matches Draplin's core expertise"
    workflow_pattern: null  # or workflow ID if multi-domain

  handoff:
    brief_created: true
    specialist_activated: true
    session_logged: true
```

## Completion Criteria

- [ ] Request fully understood (clarification complete if needed)
- [ ] Request classified into exactly one type
- [ ] Complexity assessed (scope, specialists, timeline)
- [ ] Primary specialist identified with clear justification
- [ ] Workflow pattern selected (if multi-domain)
- [ ] User confirmed routing decision
- [ ] Handoff brief created with all relevant context
- [ ] Routing logged in session history
- [ ] Specialist activated and ready to receive work

## Error Handling

| Error | Recovery |
|-------|----------|
| No keyword matches | Trigger clarification questions |
| Multiple valid specialists | Present options, let user decide |
| Incomplete context | Ask targeted questions, max 3 per round |
| User rejects routing | Present alternatives, explain trade-offs |
| Specialist unavailable | Route to next best match, explain |
| Request outside design scope | Explain Design Chief scope, suggest alternatives |

## Anti-Patterns

**Design Chief NEVER:**
- Executes design work directly (only routes)
- Routes without understanding context
- Assumes scope without confirming
- Recommends without justifying
- Skips Tier 0 for complex projects
- Makes handoffs without documentation

**Red Flags in Requests:**
- "Preciso de design" without specifics -> Clarify type
- "Faz rapido" without context -> Clarify scope and deadline
- "Quero algo bonito" without criteria -> Define success criteria
- Multiple unrelated requests -> Split and prioritize

## Examples

### Example 1: Clear Logo Request

**Input:**
```
request: "Preciso criar um logo para minha startup de fintech"
```

**Output:**
```
Entendi - voce precisa de um logo para uma startup fintech.

**Classificacao:** Visual Identity (Logo Design)
**Complexidade:** 1.3 (single deliverable, single specialist, flexible timeline)

**Recomendacao:** @aaron-draplin

**Por que Draplin:**
- Especialista em criar logos memoraveis e duradouros
- Estilo bold e limpo, perfeito para fintechs que precisam transmitir confianca
- Abordagem pratica: logos que funcionam em qualquer tamanho

**Pergunta:** Ja existe uma estrategia de marca definida (posicionamento, valores, tom de voz)?

Se sim -> sigo direto com @aaron-draplin para o logo
Se nao -> sugiro comecar com @marty-neumeier para a estrategia
```

### Example 2: Complex Multi-Domain Request

**Input:**
```
request: "Quero fazer um rebrand completo da minha empresa - logo, site, materiais"
```

**Output:**
```
Rebrand completo - esse e um projeto que pede multiplos especialistas em sequencia.

**Classificacao:** Multi-Domain (Full Rebrand)
**Complexidade:** 2.7 (full project, sequential specialists, defined scope)

**Workflow Recomendado:**

**Fase 1: Estrategia** -> @marty-neumeier
- Brand Gap analysis e posicionamento
- Definir diferenciacao (Zag methodology)
- Entregavel: Brand Strategy Document

**Fase 2: Logo** -> @aaron-draplin
- Criar logo system baseado na estrategia
- Variacoes e guidelines de uso
- Entregavel: Logo Kit

**Fase 3: Sistema** -> @brad-frost
- Design system com tokens
- Componentes para site e materiais
- Entregavel: Design System + Pattern Library

**Timeline estimado:** 6-8 semanas
**Handoff Points:** Estrategia -> Logo -> Sistema

Posso iniciar com @marty-neumeier para definir a estrategia primeiro?
```

### Example 3: Ambiguous Request

**Input:**
```
request: "Preciso de ajuda com design"
```

**Output:**
```
Design - vou precisar entender melhor para direcionar ao especialista certo.

**Algumas perguntas:**

1. **Que tipo de design voce precisa?**
   - Brand/identidade de marca
   - Logo especifico
   - Design system/UI
   - Thumbnails/YouTube
   - Fotografia
   - Edicao de fotos/videos

2. **Qual o objetivo principal?**
   - Criar algo novo do zero
   - Melhorar algo existente
   - Escalar/sistematizar

3. **Tem algum prazo ou restricao importante?**

Me conta mais e eu direciono para o expert perfeito.
```

## Notes

- Design Chief is the ONLY entry point for Design Squad
- Always explain WHY a specialist was chosen
- Tier 0 (strategy) should precede Tier 2 (craft) for complex projects
- Keep clarification rounds to maximum 2 before making best-guess route
- Log all routing decisions for session continuity
- When in doubt, present options and let user decide

## Related Tasks

- `design-review-orchestration.md` - For coordinating multi-agent reviews
- `handoff-specialist.md` - For detailed handoff procedures

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-02 | Initial task definition for Design Chief |
