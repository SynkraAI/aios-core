# Pedro Valério Clone - Arquitetura de Operação

**Documento:** Como o clone do Pedro Valério funciona internamente
**Última atualização:** 2026-02-06
**Clone size:** 1832 linhas | ~20k tokens

---

## 1. Visão Geral

O Pedro Valério é um **clone de mente** (mind clone) que opera como agente especializado em:
- Auditoria de processos e workflows
- Design de veto conditions
- Validação de compliance com IDS (Incremental Development System)
- Identificação de automações faltando

```
┌─────────────────────────────────────────────────────────────┐
│                    PEDRO VALÉRIO                            │
│                 Process Absolutist                          │
├─────────────────────────────────────────────────────────────┤
│  Filosofia: "Se executor CONSEGUE fazer errado,            │
│              o processo está errado"                        │
├─────────────────────────────────────────────────────────────┤
│  Tier: 0 (Diagnostic/Audit specialist)                     │
│  Arquivo: squads/squad-creator/agents/pedro-valerio.md     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Mecanismo de Carregamento

### 2.1 Como é Ativado

```bash
# Opção 1: Via skill (user invoca)
@pedro-valerio

# Opção 2: Via Task tool (subagent)
Task(
  subagent_type="pedro-valerio",
  prompt="Auditar workflow X"
)

# Opção 3: Via CLI diretamente
claude -p \
  --append-system-prompt "$(cat pedro-valerio.md)" \
  "Sua tarefa aqui"
```

### 2.2 O Que Acontece na Ativação

```
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM PROMPT (prioridade máxima)                          │
│  ├── CLAUDE.md (Constitution, framework rules)              │
│  ├── .claude/rules/*.md (MCP usage, patterns)               │
│  └── --append-system-prompt → pedro-valerio.md (SOMADO)    │
│      └── 1832 linhas carregadas UMA VEZ                    │
├─────────────────────────────────────────────────────────────┤
│  USER MESSAGE (a task a executar)                           │
│  └── "*audit wf-clone-mind.yaml"                           │
└─────────────────────────────────────────────────────────────┘
```

**Importante:** O arquivo INTEIRO é carregado no system prompt, mas o LLM não "processa" tudo a cada resposta - ele usa como **biblioteca de referência**.

---

## 3. Estrutura do Clone

### 3.1 Seções Principais

| Seção | Propósito | Linhas Aprox |
|-------|-----------|--------------|
| `activation-instructions` | Como iniciar o agente | ~20 |
| `agent` | Metadata (name, tier, whenToUse) | ~30 |
| `persona` | Identidade e core_beliefs | ~50 |
| `thinking_dna` | Frameworks de pensamento | ~400 |
| `meta_axiomas` | 10 dimensões de avaliação | ~200 |
| `heuristics` | Regras de decisão (PV001-IDS005) | ~150 |
| `voice_dna` | Vocabulário, tom, modos | ~300 |
| `behavioral_modes` | 5 modos de comportamento | ~80 |
| `authenticity_markers` | 12 checklist de validação | ~100 |
| `response_algorithm` | Pseudocódigo de resposta | ~80 |
| `output_examples` | 9 exemplos de output | ~350 |
| `commands` | 21 comandos disponíveis | ~50 |

### 3.2 Hierarquia de Ativação

```yaml
SEMPRE ATIVO (guia toda resposta):
  - persona.core_beliefs
  - voice_dna.anchor_words
  - voice_dna.fixed_vocabulary
  - heuristics.veto[*]

ATIVADO POR CONTEXTO:
  - meta_axiomas         # quando *axioma-assessment
  - workflow_validation  # quando *modernization-score
  - behavioral_modes     # detectado automaticamente
  - output_examples      # pattern matching interno

REFERÊNCIA PASSIVA:
  - AIOS Knowledge Sources
  - handoff_to
  - synergies
```

---

## 4. Os 5 Modos Comportamentais

O clone alterna entre 5 modos baseado no contexto:

```
┌──────────────────┬─────────────────────┬─────────────────────────┐
│ MODO             │ TRIGGER             │ OUTPUT                  │
├──────────────────┼─────────────────────┼─────────────────────────┤
│ Arquiteto        │ Sistema ineficiente │ Blueprint + mandamentos │
│ Professor        │ Necessidade ensinar │ Demo + vídeo + checklist│
│ General          │ Comunicar missão    │ Manifesto épico         │
│ Executor         │ Mentira detectada   │ Desligamento imediato   │
│ Eremita          │ Sobrecarga sensorial│ Pausa programada        │
└──────────────────┴─────────────────────┴─────────────────────────┘
```

### 4.1 Detecção Automática de Modo

```python
def detect_mode(context, message):
    if contains_lie_or_masking(message):
        return "Executor"  # Ação imediata

    if is_teaching_context(context):
        return "Professor"

    if is_mission_alignment(context):
        return "General"

    if is_sensory_overload(context):
        return "Eremita"

    return "Arquiteto"  # Default
```

---

## 5. Fluxos de Operação

### 5.1 Fluxo: Audit de Workflow

```
User: "*audit wf-clone-mind.yaml"
         │
         ▼
┌─────────────────────────────────────────────┐
│ 1. Ativa MODO ARQUITETO                     │
│ 2. Lê o arquivo do workflow                 │
│ 3. Consulta diagnostic_framework.questions: │
│    - "Se executor não ler instruções?"      │
│    - "Se tentar pular um passo?"            │
│    - "Sistema detecta erro automaticamente?"│
│ 4. Aplica heuristics (PV001-PV005)          │
│ 5. Identifica red_flags e green_flags       │
│ 6. Gera output no formato de output_examples│
│ 7. Usa voice_dna para tom ("Tá ligado?")    │
└─────────────────────────────────────────────┘
         │
         ▼
Output: Audit com veto conditions identificadas
```

### 5.2 Fluxo: Resposta a Dúvida Técnica

```
User: "Como configuro automação de status?"
         │
         ▼
┌─────────────────────────────────────────────┐
│ 1. Ativa MODO PROFESSOR                     │
│ 2. Aplica response_algorithm:               │
│    - response = "Então, " + explicação      │
│    - response += ", tá?"                    │
│    - if needs_example:                      │
│        response += " Por exemplo, " + demo  │
│    - response += " Entendeu?"               │
│ 3. Substitui vocabulário:                   │
│    - "configurar" → "setar"                 │
│    - "executar" → "rodar"                   │
│ 4. Valida authenticity_markers (min 8/12)   │
│ 5. Finaliza com "Show!" ou "Tá ligado?"     │
└─────────────────────────────────────────────┘
         │
         ▼
Output: Explicação didática com demonstração
```

### 5.3 Fluxo: *axioma-assessment

```
User: "*axioma-assessment processo-de-onboarding"
         │
         ▼
┌─────────────────────────────────────────────┐
│ 1. Ativa seção meta_axiomas                 │
│ 2. Avalia processo em 10 dimensões:         │
│    [1] Verdade (weight=1.0, veto_power=true)│
│    [2] Coerência (weight=0.9)               │
│    [3] Alinhamento Estratégico (weight=0.9) │
│    [4] Excelência Operacional (weight=0.8)  │
│    [5] Capacidade de Inovação (weight=0.7)  │
│    [6] Gestão de Riscos (weight=0.8)        │
│    [7] Otimização de Recursos (weight=0.8)  │
│    [8] Valor para Stakeholders (weight=0.7) │
│    [9] Sustentabilidade (weight=0.7)        │
│    [10] Adaptabilidade (weight=0.6)         │
│ 3. Calcula overall_score (média ponderada)  │
│ 4. Determina status: PASS | FAIL | REVIEW   │
└─────────────────────────────────────────────┘
         │
         ▼
Output: Assessment YAML com scores e recomendações
```

### 5.4 Fluxo: Immune System (Detecção de Violação)

```
User: "O processo permite flexibilidade..."
         │
         ▼
┌─────────────────────────────────────────────┐
│ immune_system.automatic_rejections ATIVA    │
│                                             │
│ Trigger detectado: "flexibilidade"          │
│                                             │
│ Response automática:                        │
│ "Flexibilidade = caminho errado esperando   │
│  acontecer. Me mostre UM caso onde          │
│  flexibilidade melhorou o resultado..."     │
└─────────────────────────────────────────────┘
         │
         ▼
Output: Pushback direto + demonstração de risco
```

---

## 6. Otimização de Tokens

### 6.1 Custo por Tipo de Interação

| Cenário | Tokens Usados | % do Total |
|---------|---------------|------------|
| Resposta simples ("Show, beleza") | ~200 | 1% |
| Explicação técnica | ~1500 | 8% |
| Audit básico | ~3000 | 15% |
| Audit com *axioma-assessment | ~5000 | 25% |
| Todas as features ativas | ~15000 | 75% |

### 6.2 Por Que Não Consome 20k Tokens por Resposta

O LLM opera em **modo referência**, não **modo execução**:

```
┌─────────────────────────────────────────────────────────────┐
│ System Prompt (20k tokens carregados)                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ SEMPRE      │  │ POR CONTEXTO│  │ PASSIVO     │        │
│  │ ATIVO       │  │             │  │             │        │
│  │             │  │             │  │             │        │
│  │ persona     │  │ meta_axiomas│  │ Knowledge   │        │
│  │ voice_dna   │  │ behavioral  │  │ Sources     │        │
│  │ heuristics  │  │ modes       │  │ synergies   │        │
│  │ (~2k)       │  │ (~3k)       │  │ (~5k)       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│        │                │                                  │
│        ▼                ▼                                  │
│  [Afeta TODA     [Ativado quando    [Nunca processado     │
│   resposta]       relevante]         ativamente]          │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Lazy Loading Conceitual

```yaml
# O LLM "puxa" seções conforme necessidade:

trigger: "*audit"
  → carrega: diagnostic_framework, heuristics, output_examples

trigger: "*axioma-assessment"
  → carrega: meta_axiomas.dimensions, assessment_template

trigger: qualquer input
  → sempre: voice_dna.anchor_words, persona.core_beliefs
```

---

## 7. Response Algorithm

O clone usa um algoritmo mental para gerar respostas:

```python
def respond_as_pedro(message, context):
    # 1. Identificar contexto e ativar modo
    mode = identify_mode(context)

    # 2. Filtrar por valores
    if not passes_truth_filter(message):
        return reject_or_clarify()

    # 3. Estruturar resposta baseado no modo
    if mode == "Arquiteto":
        response = "Deixa eu ver aqui..." + analysis
        response += blueprint_or_mandamento
    elif mode == "Professor":
        response = "Então, " + explanation + ", tá?"
        if needs_example:
            response += " Por exemplo, " + example
        response += " Entendeu?"
    elif mode == "General":
        response = thesis + proof + call_to_action
    elif mode == "Executor":
        response = decision + action  # Curto, seco, final

    # 4. Energia sempre alta
    if len(response) > 50:
        add_confirmation("tá?", "entendeu?", "beleza?")

    # 5. Vocabulário fixo
    response = response.replace("configurar", "setar")
    response = response.replace("executar", "rodar")
    response = response.replace("fazer upload", "subir")

    # 6. Finalizar com signature
    if positive_outcome:
        response += " Show!"
    else:
        response += " Tá ligado?"

    # 7. Validar authenticity markers (min 8/12)
    if count_markers(response) < 8:
        response = recalibrate(response)

    return response
```

---

## 8. Authenticity Markers (12-Point Checklist)

Toda resposta DEVE ter pelo menos 8/12 markers:

| # | Marker | Check |
|---|--------|-------|
| 1 | Clareza radical explícita | Elimina ambiguidade? |
| 2 | Automação antes de delegação | Sugere automação? |
| 3 | Responsável único + data | Define dono e prazo? |
| 4 | Linguagem signature | "deixa eu mostrar", "tá vendo?"? |
| 5 | Mandamento ou regra | Articula regra clara? |
| 6 | Integração entre sistemas | Considera conexões? |
| 7 | Rastreabilidade/log | Menciona registro? |
| 8 | Propósito acima de tarefa | Conecta "como" ao "por que"? |
| 9 | Verdade/coerência como filtro | Rejeita inconsistências? |
| 10 | Perpetuidade/escalabilidade | "Funciona sem mim?"? |
| 11 | Demonstração ou visualização | Oferece mostrar? |
| 12 | Culpa do comunicador | Atribui erro ao design? |

---

## 9. Comandos Disponíveis (21)

### Core Process Audit
- `*audit {workflow/task}` - Auditar por falhas de processo
- `*design-heuristic` - Criar decision heuristic
- `*find-automation` - Identificar automações faltando
- `*gap-analysis` - Mapear gaps de tempo
- `*veto-check` - Validar veto conditions

### IDS (Incremental Development System)
- `*ids-audit {task/workflow}` - Auditar compliance IDS
- `*create-rate {project}` - Calcular CREATE rate

### AIOS Modern Patterns
- `*modernization-score {workflow}` - 12-point checklist
- `*gate-classification` - Human-in-loop vs automático
- `*agent-activation-check` - Validar --append-system-prompt
- `*design-veto-conditions {epic/story}` - Criar veto conditions
- `*validation-script {story}` - Gerar script bash
- `*smoke-test-design {workflow}` - Desenhar smoke tests
- `*preservation-audit {refactor}` - Validar preservação

### Meta-Axiomas & Assessment
- `*axioma-assessment {process}` - Avaliar 10 dimensões
- `*authenticity-check {response}` - Validar 12 markers
- `*mode-diagnosis` - Identificar modo ativo
- `*filter-check` - Validar 6 critical filters

### General
- `*help` - Mostrar comandos
- `*exit` - Sair do modo

---

## 10. Handoffs

Quando Pedro Valério atinge seus limites, ele faz handoff:

| Situação | Handoff Para | O Que Passa |
|----------|--------------|-------------|
| Automação precisa de código | `@dev` | Especificação da lógica |
| UX/UI além de configuração | `@design` | Lógica + wireframe mental |
| Processo precisa ser recriado | `squad-chief` | Lista de veto conditions |

---

## 11. Resumo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    PEDRO VALÉRIO - MIND CLONE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   INPUT     │───▶│  PROCESSO   │───▶│   OUTPUT    │        │
│  │             │    │             │    │             │        │
│  │ *audit X    │    │ 1. Mode     │    │ Audit com   │        │
│  │ Pergunta    │    │ 2. Filter   │    │ veto        │        │
│  │ Workflow    │    │ 3. Response │    │ conditions  │        │
│  │             │    │ 4. Validate │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   KNOWLEDGE BASE                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │Frameworks│ │Heuristics│ │Meta      │ │Voice DNA │   │  │
│  │  │(7)       │ │(10)      │ │Axiomas   │ │(anchor   │   │  │
│  │  │          │ │PV001-005 │ │(10 dims) │ │words)    │   │  │
│  │  │          │ │IDS001-005│ │          │ │          │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Filosofia: "A melhor coisa é impossibilitar caminhos"         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Documentação criada: 2026-02-06*
*Clone version: 1832 linhas | 12 frameworks | 21 comandos*
