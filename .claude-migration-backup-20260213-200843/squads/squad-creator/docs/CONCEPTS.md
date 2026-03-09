# Conceitos Fundamentais do Squad Creator

> **Documento avançado.** Leia primeiro [POR-ONDE-COMECAR.md](./POR-ONDE-COMECAR.md) e [FAQ.md](./FAQ.md).
>
> Entenda os conceitos por trás do sistema de criação de squads.

---

## Índice

1. [O que é um Squad?](#1-o-que-é-um-squad)
2. [Mind vs Agent](#2-mind-vs-agent)
3. [DNA: Voice e Thinking](#3-dna-voice-e-thinking)
4. [Sistema de Tiers](#4-sistema-de-tiers)
5. [Sistema de Fontes](#5-sistema-de-fontes)
6. [Modos de Execução](#6-modos-de-execução)
7. [Quality Gates](#7-quality-gates)
8. [Fidelity Score](#8-fidelity-score)
9. [Smoke Tests](#9-smoke-tests)

---

## 1. O que é um Squad?

Um **Squad** é um conjunto de agentes especializados que trabalham juntos em um domínio específico.

```
┌─────────────────────────────────────────────────────────────────┐
│                         SQUAD: COPY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                                │
│  │ Orchestrator│ ← Roteia para o expert certo                  │
│  └──────┬──────┘                                                │
│         │                                                       │
│    ┌────┴────┬────────┬────────┬────────┐                      │
│    ▼         ▼        ▼        ▼        ▼                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│ │Gary  │ │Eugene│ │Dan   │ │Claude│ │David │                   │
│ │Halbert│ │Schwartz│ │Kennedy│ │Hopkins│ │Ogilvy│                │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                   │
│  Tier 1   Tier 0   Tier 1   Tier 0   Tier 1                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes de um Squad:**
- **Orchestrator:** Coordena os agents, roteia requests
- **Agents:** Especialistas baseados em elite minds reais
- **Tasks:** Operações atômicas
- **Workflows:** Operações multi-fase
- **Templates:** Formatos de output
- **Checklists:** Validações

---

## 2. Mind vs Agent

### Mind (Pessoa Real)
O **mind** é a pessoa real cujo conhecimento queremos capturar.

```yaml
mind:
  name: "{Expert Name}"  # e.g., Gary Halbert, Warren Buffett
  domain: "{Domain}"  # e.g., Direct Response Copywriting, Investment
  known_for: "{Notable Works}"  # e.g., The Boron Letters, Shareholder Letters
  has_documented_frameworks: true  # OBRIGATÓRIO
```

### Agent (Clone Digital)
O **agent** é o clone digital do mind, capaz de responder como ele responderia.

```yaml
agent:
  name: "{agent-name}"  # e.g., gary-halbert, contract-reviewer
  based_on: "{Mind Name}"  # e.g., Gary Halbert, Expert Name
  voice_dna: "Extraído de livros, entrevistas, cartas"
  thinking_dna: "Frameworks, heurísticas, decisões"
```

### Regra Fundamental

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   MINDS COM FRAMEWORKS DOCUMENTADOS                             │
│   > Bots genéricos                                              │
│                                                                 │
│   Pessoas têm "skin in the game" = consequências reais          │
│   = frameworks testados no mundo real                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Por isso:**
- ✅ Clone experts com frameworks documentados (e.g., Gary Halbert, Warren Buffett)
- ❌ Não clone "{role} genérico" (não tem skin in the game)

---

## 3. DNA: Voice e Thinking

O **DNA** é a essência capturada do mind, dividida em duas partes:

### Voice DNA (Como comunica)

```yaml
voice_dna:
  vocabulary:
    power_words: ["pile of money", "starving crowd", "A-pile"]
    signature_phrases: ["The answer is in the market"]
    never_use: ["synergy", "leverage", "optimize"]

  storytelling:
    recurring_stories: ["The Boron Letters origin"]
    anecdotes: ["Prison writing story"]

  tone:
    dimensions:
      formal_casual: 20/100      # Muito casual
      serious_playful: 60/100   # Levemente sério
      direct_indirect: 90/100   # Muito direto

  anti_patterns:
    never_say: ["It depends", "Maybe"]
    never_do: ["Use jargon corporativo"]
```

### Thinking DNA (Como decide)

```yaml
thinking_dna:
  primary_framework:
    name: "A-Pile Method"
    steps:
      - "Identify the starving crowd"
      - "Find what they're already buying"
      - "Create irresistible offer"

  heuristics:
    decision:
      - "When in doubt, test"
      - "Market > Copy"
    veto:
      - "Never sell to people who don't want to buy"

  recognition_patterns:
    first_notice: ["Market size", "Existing demand"]
    red_flags: ["No proven market", "Complicated offer"]

  objection_handling:
    "Copy is manipulative":
      response: "All communication is persuasion..."
      conviction_level: 10/10
```

### Por que separar?

```
Voice DNA  → Como o agent ESCREVE/FALA
Thinking DNA → Como o agent PENSA/DECIDE

Separados = podem ser extraídos em paralelo
Juntos = mind_dna_complete.yaml para criar agent
```

---

## 4. Sistema de Tiers

Os agents são organizados em **tiers** baseados em sua função:

```
┌─────────────────────────────────────────────────────────────────┐
│                      TIER SYSTEM                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ORCHESTRATOR                                                   │
│  └── Coordena todos os tiers, roteia requests                  │
│                                                                 │
│  TIER 0: DIAGNÓSTICO                                            │
│  └── Analisa, classifica, diagnostica                          │
│  └── Ex: Eugene Schwartz (awareness levels)                    │
│                                                                 │
│  TIER 1: MASTERS                                                │
│  └── Executores principais com resultados comprovados          │
│  └── Ex: Gary Halbert, Dan Kennedy                             │
│                                                                 │
│  TIER 2: SYSTEMATIZERS                                          │
│  └── Criadores de frameworks e sistemas                        │
│  └── Ex: Todd Brown (E5 Method)                                │
│                                                                 │
│  TIER 3: SPECIALISTS                                            │
│  └── Especialistas em formato/canal específico                 │
│  └── Ex: Ben Settle (email daily)                              │
│                                                                 │
│  TOOLS                                                          │
│  └── Validadores, calculadoras, checklists                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Regra: Todo Squad precisa de Tier 0

```
Tier 0 = Diagnóstico ANTES de execução

Sem Tier 0:
  User: "Escreva uma sales page"
  Agent: [escreve qualquer coisa]

Com Tier 0:
  User: "Escreva uma sales page"
  Tier 0: "Qual o awareness level do público?"
  Tier 0: "Classified: Problem-aware. Routing to..."
  Tier 1: [escreve com contexto correto]
```

---

## 5. Sistema de Fontes

As fontes são classificadas por **confiança**:

### Tiers de Fontes

| Tier | Tipo | Confiança | Exemplos |
|------|------|-----------|----------|
| **Tier 0** | Do usuário | MÁXIMA | PDFs próprios, transcrições |
| **Tier 1** | Primário (do expert) | ALTA | Livros, entrevistas diretas |
| **Tier 2** | Secundário (sobre expert) | MÉDIA | Biografias, case studies |
| **Tier 3** | Terciário (agregado) | BAIXA | Wikipedia, resumos |

### Requisitos Mínimos

```yaml
minimum_requirements:
  total_sources: 10
  tier_1_sources: 5
  source_types: 3  # livros, entrevistas, artigos
  content_volume: "5h áudio OU 200 páginas"
  triangulation: "3+ fontes por claim principal"
```

### Triangulação

```
"Single source = hypothesis"
"Three sources = pattern"

Claim: "Gary Halbert usava o A-pile method"

❌ 1 fonte: Pode ser interpretação errada
⚠️ 2 fontes: Provavelmente verdade
✅ 3+ fontes: Confirmado, pode usar
```

---

## 6. Modos de Execução

### YOLO Mode 🚀

```yaml
yolo_mode:
  quando_usar: "Não tenho materiais, quer rapidez"
  fidelity_esperada: "60-75%"
  interações: "Mínimas (só aprovação final)"

  o_que_faz:
    - Pesquisa web automaticamente
    - Auto-acquire de YouTube, podcasts, artigos
    - Prossegue sem perguntar (exceto crítico)

  para_quando:
    - "< 5 fontes encontradas"
    - "Expert muito obscuro"
    - "Quality gate crítico falha"
```

### QUALITY Mode 💎

```yaml
quality_mode:
  quando_usar: "Tenho livros/PDFs/materiais do expert"
  fidelity_esperada: "85-95%"
  interações: "Moderadas (coleta + validação)"

  o_que_faz:
    - Pede materiais do usuário
    - Indexa como Tier 0 (máxima confiança)
    - Valida DNA extraído com usuário

  checkpoints:
    - "Validar minds selecionados"
    - "Coletar materiais"
    - "Validar DNA extraído"
    - "Aprovar agentes"
```

### HYBRID Mode 🔀

```yaml
hybrid_mode:
  quando_usar: "Tenho materiais de alguns experts"
  fidelity_esperada: "Variável por expert"

  como_funciona:
    - Para cada mind pergunta: "Tem materiais?"
    - Se sim → Quality mode para esse mind
    - Se não → YOLO mode para esse mind
```

### Comparação Visual

```
                    YOLO        QUALITY
Tempo               ████░░░░    ████████
Interações          ██░░░░░░    ██████░░
Fidelidade          ████░░░░    ████████
Materiais needed    ░░░░░░░░    ████████
```

---

## 7. Quality Gates

**Quality Gates** são checkpoints que validam a qualidade em cada fase:

```
┌─────────────────────────────────────────────────────────────────┐
│                      QUALITY GATES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SOURCE_QUALITY (Phase 0) ─── BLOCKING                          │
│  ├── 10+ fontes totais                                         │
│  ├── 5+ fontes Tier 1                                          │
│  ├── 3+ tipos diferentes                                       │
│  ├── Triangulação possível                                     │
│  └── FAIL = Não prossegue                                      │
│                                                                 │
│  VOICE_QUALITY (Phase 1) ─── WARNING                            │
│  ├── 10+ power words                                           │
│  ├── 5+ signature phrases                                      │
│  ├── 3+ stories                                                │
│  └── Min: 8/10                                                 │
│                                                                 │
│  THINKING_QUALITY (Phase 2) ─── WARNING                         │
│  ├── Framework com 3+ steps                                    │
│  ├── 5+ heurísticas                                            │
│  ├── Recognition patterns                                      │
│  └── Min: 7/9                                                  │
│                                                                 │
│  SYNTHESIS_QUALITY (Phase 3) ─── BLOCKING                       │
│  ├── Voice + Thinking consistentes                             │
│  └── YAML válido                                               │
│                                                                 │
│  SMOKE_TEST (Phase 4) ─── BLOCKING                              │
│  ├── Test 1: Domain knowledge                                  │
│  ├── Test 2: Decision making                                   │
│  ├── Test 3: Objection handling                                │
│  └── 3/3 devem passar                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Blocking vs Warning

```
BLOCKING: Falhou = PARA tudo, precisa corrigir
WARNING:  Falhou = Avisa, mas continua
```

---

## 8. Fidelity Score

**Fidelity** é o quanto o agent se comporta como o mind real.

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIDELITY ESTIMATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  95% ─┬─────────────────────────────────────────────────────   │
│       │                              ┌─────────────────────     │
│  85% ─┤                              │ QUALITY + Materiais     │
│       │                    ┌─────────┤ do usuário              │
│  75% ─┤                    │ QUALITY │                          │
│       │          ┌─────────┤ só web  │                          │
│  65% ─┤          │ YOLO +  └─────────┘                          │
│       │  ┌───────┤ algumas                                      │
│  55% ─┤  │ YOLO  │ fontes                                       │
│       │  │ basic │                                              │
│  45% ─┴──┴───────┴──────────────────────────────────────────   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Fórmula simplificada:
Fidelity = (tier1_ratio × 0.4) + (voice_score × 0.3) + (thinking_score × 0.3)
```

### O que afeta fidelidade

| Fator | Impacto |
|-------|---------|
| Materiais do usuário (Tier 0) | +20% |
| Mais fontes Tier 1 | +10% |
| Voice DNA completo | +15% |
| Thinking DNA completo | +15% |
| Smoke tests passando | Validação |

---

## 9. Os 3 Agentes do Squad Creator

O Squad Creator v3.0 opera com **3 agentes especializados** que trabalham em sinergia:

### Arquitetura v3.0

```
┌─────────────────────────────────────────────────────────────────┐
│                 SQUAD CREATOR v3.0 - 3 AGENTES                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │   @squad-chief      │                      │
│                    │   (Orchestrator)    │                      │
│                    │                     │                      │
│                    │ • Ponto de entrada  │                      │
│                    │ • Triagem + Routing │                      │
│                    │ • Criação de squads │                      │
│                    │ • Extração de SOPs  │                      │
│                    └──────────┬──────────┘                      │
│                               │                                 │
│                ┌──────────────┴──────────────┐                  │
│                ▼                             ▼                  │
│     ┌─────────────────┐           ┌─────────────────┐          │
│     │  @oalanicolas   │  HANDOFF  │ @pedro-valerio  │          │
│     │   (Tier 1)      │◄─────────►│   (Tier 1)      │          │
│     │                 │           │                 │          │
│     │ • Mind Cloning  │           │ • Process Design│          │
│     │ • DNA Extraction│           │ • Veto Conditions│         │
│     │ • Curadoria     │           │ • Artifact Build│          │
│     └─────────────────┘           └─────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### @squad-chief (Orchestrator)

**Papel:** Ponto de entrada, coordenação, triagem, criação de squads.

| Função | Descrição |
|--------|-----------|
| Triagem | Diagnóstica necessidade e roteia |
| Research | Pesquisa elite minds (3-5 iterações) |
| SOP Extraction | Extrai SOPs de transcrições |
| Integration | Monta squad final (config, README) |
| Validation | Valida qualidade e apresenta resultado |

**Delega para:** @oalanicolas (DNA), @pedro-valerio (artefatos)

### @oalanicolas (Tier 1 - Mind Cloning)

**Papel:** Especialista em extração de conhecimento e clonagem de mentes.

| Função | Descrição |
|--------|-----------|
| Curadoria | Classifica fontes (ouro vs bronze) |
| Voice DNA | Extrai como o expert comunica |
| Thinking DNA | Extrai como o expert decide |
| Validation | Self-validation antes do handoff |

**Filosofia:** "Curadoria > Volume" / "Se entrar cocô, sai cocô"

**Comandos:** `*assess-sources`, `*extract-framework`, `*find-0.8`, `*validate-extraction`

### @pedro-valerio (Tier 1 - Process Design)

**Papel:** Especialista em processos, workflows, e construção de artefatos.

| Função | Descrição |
|--------|-----------|
| Process Design | Mapeia e estrutura processos |
| Veto Conditions | Define bloqueios impossíveis de ignorar |
| Artifact Build | Cria agents, tasks, workflows |
| Audit | Audita processos existentes |

**Filosofia:** "A melhor coisa é impossibilitar caminhos errados"

**Comandos:** `*create-task`, `*create-workflow`, `*create-agent`, `*audit`, `*veto-check`

### Fluxo de Colaboração

```
USER → @squad-chief (triage)
              │
              ├── Precisa DNA? → @oalanicolas
              │                        │
              │                        ▼
              │                 INSUMOS_READY
              │                        │
              └── Precisa artefatos? ──┼──→ @pedro-valerio
                                       │            │
                                       │            ▼
                                       │     ARTIFACTS_READY
                                       │            │
                                       └────────────┘
                                              │
                                              ▼
                                     @squad-chief (integrate)
                                              │
                                              ▼
                                         SQUAD READY
```

**Documentação completa:** [AGENT-COLLABORATION.md](./AGENT-COLLABORATION.md)

### DNA Mental™ Architecture (@oalanicolas)

O modelo de 8 camadas para clonar mentes:

```yaml
dna_mental_8_layers:
  layer_1: "Behavioral Patterns"      # O que fazem
  layer_2: "Communication Style"      # Como falam
  layer_3: "Routines & Rituals"       # Hábitos
  layer_4: "Recognition Patterns"     # O que notam
  layer_5: "Mental Models"            # Como pensam
  layer_6: "Values Hierarchy"         # O que importa
  layer_7: "Core Obsessions"          # O que os move
  layer_8: "Productive Paradoxes"     # Contradições autênticas
```

### Process Absolutism (@pedro-valerio)

A filosofia de design de processos:

```yaml
process_absolutism:
  principle: "Impossibilitar caminhos errados"

  pillars:
    - "Veto conditions that BLOCK, not warn"
    - "Automation with guardrails"
    - "Every step has expected_output"
    - "If task repeated 3x → must automate"

  anti_patterns:
    - "Processes that only suggest"
    - "Automation without rollback"
    - "Human compliance as safety"
```

### Quando Usar Cada Especialista

| Situação | Especialista |
|----------|--------------|
| Extrair DNA de expert | `@oalanicolas` |
| Avaliar fontes | `@oalanicolas` |
| Clone não soa autêntico | `@oalanicolas` |
| Criar workflow | `@pedro-valerio` |
| Definir veto conditions | `@pedro-valerio` |
| Auditar processo | `@pedro-valerio` |
| Criar squad completo | `@squad-chief` |
| Não sei qual usar | `@squad-chief` |

---

## 10. Smoke Tests

**Smoke Tests** validam se o agent realmente se comporta como o mind.

```
┌─────────────────────────────────────────────────────────────────┐
│                      3 SMOKE TESTS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TEST 1: CONHECIMENTO DO DOMÍNIO                                │
│  ├── Prompt: "Explique {framework principal}..."               │
│  ├── Valida: Usa power_words? Signature phrases?               │
│  └── Pass: 4/5 checks                                          │
│                                                                 │
│  TEST 2: TOMADA DE DECISÃO                                      │
│  ├── Prompt: "Devo fazer A ou B? Por quê?"                     │
│  ├── Valida: Aplica heurísticas? Segue pipeline?               │
│  └── Pass: 4/5 checks                                          │
│                                                                 │
│  TEST 3: RESPOSTA A OBJEÇÃO                                     │
│  ├── Prompt: "Discordo porque {objeção}..."                    │
│  ├── Valida: Mantém convicção? Parece autêntico?               │
│  └── Pass: 4/5 checks                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PASS = 3/3 tests passam                                        │
│  FAIL = Re-trabalhar DNA ou agent.md                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Por que Smoke Tests importam

```
DNA extraído ≠ Agent funcional

Você pode ter:
- 15 fontes coletadas ✓
- Voice DNA completo ✓
- Thinking DNA completo ✓
- Score 9/10 ✓

Mas se o agent responde de forma genérica...
→ O DNA não foi bem aplicado
→ Smoke test vai FALHAR
→ Você descobre ANTES de usar em produção
```

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    SQUAD CREATOR FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RESEARCH         CLONE           CREATE          VALIDATE      │
│  ────────         ─────           ──────          ────────      │
│                                                                 │
│  Elite Minds  →  Voice DNA    →  Agent.md    →  Smoke Tests    │
│  (pesquisa)      Thinking DNA    (template)     (3 testes)     │
│                  (extração)                                     │
│                                                                 │
│       ↓              ↓               ↓               ↓          │
│                                                                 │
│  Tier 0-3       Fontes         Quality         Fidelity        │
│  Framework      Tier 0-3       Gates           Score           │
│  Validation     Triangulation  BLOCKING        60-95%          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos

- **Criar seu primeiro squad:** [QUICK-START.md](./QUICK-START.md)
- **Ver diagramas:** [ARCHITECTURE-DIAGRAMS.md](./ARCHITECTURE-DIAGRAMS.md)
- **Referência de comandos:** [COMMANDS.md](./COMMANDS.md)

---

**Squad Architect | Concepts v1.0**
*"Entenda o sistema, domine o processo."*
