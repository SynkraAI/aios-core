# Investigação: Bob Absorvendo Ralph — Iteração Autônoma

```yaml
id: INV-2026-02-05-001
title: "Bob 2.0: De Orquestrador com Gates para Account Manager Autônomo"
status: Em Análise
date: 2026-02-05
analyst: Atlas (@analyst)
stakeholder: Alan Nicolas
category: strategic-architecture
priority: high
```

---

## 1. Contexto da Investigação

### 1.1 A Declaração do Usuário

> "Não precisamos de um Ralph, o Bob tem que SER ele. Ele precisa ficar levando pra um e pra outro, mantendo o status atualizado de cada story e usando heurísticas e princípios ir decidindo o melhor caminho, só falando com o usuário quando muito necessário — como se fosse um **account manager de uma software house** com o usuário — e fazer os ciclos até obter o resultado que o usuário deseja."

### 1.2 O Que É Ralph

**Ralph Wiggum** (criado por Geoffrey Huntley) é um mecanismo de iteração autônoma para Claude Code:

- **Essência:** Um loop bash (`while true`) que re-alimenta prompts até detectar um sinal de conclusão
- **Stop Hook:** Plugin que intercepta o fim da sessão e re-injeta o prompt
- **Completion Promise:** `<promise>COMPLETE</promise>` — sinal de que a tarefa terminou
- **Adoção:** Y Combinator adotou, depois Anthropic criou plugin oficial
- **Economia:** Contratos de $50k executados por $297 em custos de API

### 1.3 O Que É Bob Atual

**Bob (AIOS v2.0)** é um orquestrador com checkpoints humanos:

- **Workflow de 6 fases:** Validation → Development → Self-Healing → Quality Gate → Push → Checkpoint
- **Human Gates:** GO/PAUSE/REVIEW/ABORT entre stories
- **Session State:** Persistência via `.session-state.yaml`
- **Observability Panel:** Status em tempo real do que está acontecendo
- **Multi-Agent:** Spawn de agentes em terminais separados

---

## 2. Análise Comparativa

### 2.1 Mecanismo do Ralph

```
┌─────────────────────────────────────────────────────────┐
│                    RALPH LOOP                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   for i in $(seq 1 $MAX_ITERATIONS); do                │
│       claude -p --dangerously-skip-permissions         │
│           "$PROMPT" | tee output                       │
│                                                         │
│       if grep "<promise>COMPLETE</promise>"; then      │
│           exit 0  # Sucesso!                           │
│       fi                                               │
│                                                         │
│       sleep 2                                          │
│   done                                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘

Características:
- Loop EXTERNO ao Claude (bash script)
- Sem interação humana até COMPLETE
- Context window limpa a cada iteração
- Progresso via arquivos (prd.json, progress.txt)
- Auto-fix: marca stories como done se output_file existe
```

### 2.2 Mecanismo do Bob Atual

```
┌─────────────────────────────────────────────────────────┐
│                    BOB WORKFLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Story N ──────────────────────────────────────────►  │
│       │                                                 │
│       ▼                                                 │
│   [Validation] ─► [Development] ─► [Self-Healing]      │
│       │                │               │                │
│       ▼                ▼               ▼                │
│   [Quality Gate] ─► [Push] ─► [Checkpoint]             │
│                                    │                    │
│                                    ▼                    │
│                              ┌─────────┐               │
│                              │ HUMANO  │ ◄── PARADA!   │
│                              │ GO/PAUSE│                │
│                              └─────────┘               │
│                                    │                    │
│                                    ▼                    │
│   Story N+1 ◄──────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘

Características:
- Loop INTERNO ao Claude (workflow-executor.js)
- Checkpoint humano OBRIGATÓRIO entre stories
- Context window persiste (pode poluir)
- Progresso via session-state.yaml
- Spawn de agentes em terminais separados
```

### 2.3 Tabela de Gaps

| Aspecto | Ralph | Bob Atual | Gap |
|---------|-------|-----------|-----|
| **Iteração** | Automática até COMPLETE | Para a cada story | 🔴 Bob para demais |
| **Decisão Humana** | Só em erros | Obrigatória entre stories | 🔴 Bob depende do humano |
| **Progresso** | prd.json + progress.txt | session-state.yaml | 🟢 Similar |
| **Context Window** | Limpa a cada iteração | Acumula | 🔴 Bob pode poluir |
| **Auto-Fix** | Marca done se output existe | Não implementado | 🔴 Bob não auto-corrige |
| **Completion Signal** | `<promise>COMPLETE</promise>` | Não tem | 🔴 Bob não sinaliza fim |
| **Loop Driver** | bash externo | JS interno | 🟡 Diferente arquitetura |
| **Multi-Agent** | Single agent | Multi-agent com spawn | 🟢 Bob é mais sofisticado |
| **Observabilidade** | watch + tail | Observability Panel | 🟢 Bob é mais visual |
| **Heurísticas** | Rígidas (next story) | Não codificadas | 🔴 Bob não decide sozinho |

---

## 3. Proposta: Bob 2.0 — O Account Manager

### 3.1 Visão

Bob 2.0 combina a **sofisticação do AIOS** (multi-agent, observability, quality gates) com a **autonomia do Ralph** (iteração contínua até resultado).

```
┌─────────────────────────────────────────────────────────┐
│              BOB 2.0 — ACCOUNT MANAGER                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────────────────────────────────────────────┐ │
│   │            HEURÍSTICA DE DECISÃO                 │ │
│   │                                                  │ │
│   │  Resultado OK?                                   │ │
│   │    ├── SIM ──► Próxima story (AUTO-GO)          │ │
│   │    └── NÃO ──► Avaliar:                         │ │
│   │                  ├── Erro trivial? ──► Retry    │ │
│   │                  ├── Erro repetido? ──► Surface │ │
│   │                  └── Bloqueio? ──► Surface      │ │
│   │                                                  │ │
│   │  Critérios de Surface (SUBIR AO HUMANO):        │ │
│   │    - 2+ erros consecutivos na mesma story       │ │
│   │    - Decisão binária com trade-offs             │ │
│   │    - Ação destrutiva (delete, drop, force)      │ │
│   │    - Custo > threshold ($5 default)             │ │
│   │    - Escopo mudou do que foi aprovado           │ │
│   │                                                  │ │
│   └──────────────────────────────────────────────────┘ │
│                                                         │
│   Comportamento Padrão: CONTINUAR                       │
│   Comportamento Exceção: PERGUNTAR                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Princípios do Account Manager

1. **Trabalho Silencioso**
   - Bob trabalha "subterrâneo" — executa sem interromper
   - Status atualizado em tempo real (observability panel)
   - Só "sobe à superfície" quando realmente precisa

2. **Heurísticas Codificadas**
   - Decisões de roteamento são SCRIPT, não LLM reasoning
   - If/else determinístico para próximos passos
   - LLM só para execução dentro do escopo definido

3. **Ciclos até Resultado**
   - Loop continua até epic completo ou bloqueio real
   - Auto-GO é default entre stories sem problemas
   - PAUSE/REVIEW são exceções, não regra

4. **Progressão Incremental**
   - Cada story completa = progresso persistido
   - Em caso de crash, retoma da última story completa
   - Learnings acumulados (como Codebase Patterns do Ralph)

### 3.3 Arquitetura Proposta

```
                    ┌─────────────────────────┐
                    │    BOB ORCHESTRATOR     │
                    │    (bob-orchestrator.js)│
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   AUTONOMOUS LOOP       │
                    │   (NEW: bob-loop.js)    │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ SURFACE       │     │ HEURISTICS    │     │ COMPLETION    │
│ CHECKER       │     │ ENGINE        │     │ DETECTOR      │
│ (existente)   │     │ (NEW)         │     │ (NEW)         │
└───────────────┘     └───────────────┘     └───────────────┘

Novos Módulos:
1. bob-loop.js — Loop autônomo que itera entre stories
2. heuristics-engine.js — Motor de decisão codificado
3. completion-detector.js — Detecta quando epic está completo
```

---

## 4. Heurísticas de Decisão

### 4.1 Heurística: Próxima Story

```yaml
# heuristics/next-story.yaml
id: next_story_decision
description: "Decide se continua para próxima story automaticamente"

conditions:
  auto_go:
    # Continuar automaticamente se:
    - current_story.status == "completed"
    - quality_gate.verdict == "APPROVED"
    - no_blocking_errors
    - next_story exists in epic
    - consecutive_errors < 2

  surface:
    # Perguntar ao humano se:
    - consecutive_errors >= 2
    - quality_gate.verdict == "NEEDS_WORK" (after 2 attempts)
    - next_story.requires_decision == true
    - scope_expanded beyond original

default_action: auto_go
```

### 4.2 Heurística: Tratamento de Erro

```yaml
# heuristics/error-handling.yaml
id: error_handling_decision
description: "Decide como tratar erros durante execução"

severity_actions:
  trivial:
    # Lint errors, missing imports, typos
    action: auto_retry
    max_retries: 3

  recoverable:
    # Test failures, type errors
    action: self_heal_then_retry
    max_retries: 2

  blocking:
    # Missing dependencies, env vars, permissions
    action: surface_to_human
    message_template: |
      ⚠️ Encontrei um bloqueio em {story_id}:
      {error_summary}

      Preciso de ajuda para:
      {suggested_actions}

  catastrophic:
    # Database corruption, lost commits, file deletion
    action: immediate_stop
    requires_human: true
```

### 4.3 Heurística: Epic Completion

```yaml
# heuristics/epic-completion.yaml
id: epic_completion_detection
description: "Detecta quando um epic está completo"

completion_criteria:
  all_stories_passed: true
  quality_gates_passed: true
  no_pending_errors: true

completion_signal: "<promise>EPIC_COMPLETE</promise>"

post_completion:
  - update session_state to "completed"
  - generate summary report
  - surface final result to human
```

---

## 5. Implementação Sugerida

### 5.1 Fase 1: Heuristics Engine (MVP)

**Objetivo:** Bob decide automaticamente quando ir para próxima story

```javascript
// .aios-core/core/orchestration/heuristics-engine.js
class HeuristicsEngine {
  shouldAutoGo(phaseResult, storyState) {
    // Retorna true se pode continuar sem perguntar
    if (phaseResult.status !== 'completed') return false;
    if (storyState.consecutiveErrors >= 2) return false;
    if (phaseResult.requiresDecision) return false;
    return true;
  }

  getNextAction(context) {
    // Retorna: 'auto_go' | 'retry' | 'surface'
    // Decisão codificada, não LLM reasoning
  }
}
```

### 5.2 Fase 2: Autonomous Loop

**Objetivo:** Loop que itera entre stories sem parar

```javascript
// .aios-core/core/orchestration/bob-loop.js
class BobLoop {
  async executeEpic(epicPath, options = {}) {
    const stories = await this.loadEpicStories(epicPath);

    for (const story of stories) {
      const result = await this.workflowExecutor.execute(story);

      // Heurística decide se continua
      const action = this.heuristics.getNextAction({
        result,
        story,
        epicProgress: this.getProgress()
      });

      if (action === 'surface') {
        const decision = await this.surfaceToHuman(result);
        if (decision === 'ABORT') break;
        if (decision === 'PAUSE') {
          await this.saveState();
          break;
        }
      }
      // action === 'auto_go' → continua automaticamente
    }

    return this.generateCompletionReport();
  }
}
```

### 5.3 Fase 3: Completion Detection

**Objetivo:** Detectar quando epic está completo e sinalizar

```javascript
// .aios-core/core/orchestration/completion-detector.js
class CompletionDetector {
  isEpicComplete(epicState) {
    const allStoriesCompleted = epicState.stories
      .every(s => s.status === 'completed');
    const noBlockingErrors = epicState.errors
      .filter(e => e.severity === 'blocking').length === 0;

    return allStoriesCompleted && noBlockingErrors;
  }

  emitCompletionSignal() {
    console.log('<promise>EPIC_COMPLETE</promise>');
  }
}
```

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Bob faz decisões erradas autonomamente | Alta | Alto | Heurísticas conservadoras: na dúvida, surface |
| Loop infinito em erros | Média | Alto | Max iterations + circuit breaker |
| Usuário não sabe o que Bob está fazendo | Alta | Médio | Observability panel sempre visível |
| Context window polui com muitas stories | Média | Médio | Manter spawn de terminais separados |
| Bob "empaca" sem avisar | Média | Alto | Heartbeat + timeout + surface automático |

---

## 7. Perguntas em Aberto

1. **Threshold de Surface:** Quantos erros consecutivos antes de perguntar? (Sugestão: 2)
2. **Auto-GO Default:** Deve ser configurável pelo usuário? (Sugestão: Sim, em core.config)
3. **Completion Signal:** Manter `<promise>COMPLETE</promise>` ou criar algo específico?
4. **Loop Driver:** Bash externo (como Ralph) ou JS interno (como atual)?
5. **Granularidade:** Auto-GO por story ou por fase?

---

## 8. Recomendações

### 8.1 Curto Prazo (Quick Wins)

1. **Adicionar Auto-GO no Checkpoint**
   - Modificar `executeCheckpointPhase()` para não sempre aguardar input
   - Usar `SurfaceChecker` para decidir se pergunta ou continua

2. **Implementar Heuristics básico**
   - `shouldAutoGo()` com regras simples
   - Configurável via core.config

### 8.2 Médio Prazo (Epic)

1. **Criar Epic "Bob 2.0: Autonomous Iteration"**
   - Story 1: HeuristicsEngine base
   - Story 2: BobLoop implementation
   - Story 3: CompletionDetector
   - Story 4: Integration tests
   - Story 5: User documentation

2. **Configurabilidade**
   - `bob_mode: "assisted" | "autonomous"`
   - `auto_go_threshold: 0` (always ask) a `10` (never ask)

### 8.3 Longo Prazo (Visão)

Bob se torna um **Account Manager completo**:
- Recebe briefing do cliente (user goal)
- Planeja o trabalho (cria epic + stories)
- Executa autonomamente
- Reporta progresso periodicamente
- Só interrompe quando realmente precisa
- Entrega resultado final com relatório

---

## 9. Conclusão

A visão de "Bob tem que SER o Ralph" é tecnicamente viável e estrategicamente correta. O AIOS já possui a infraestrutura necessária (multi-agent, session state, observability). O que falta é:

1. **Mindset shift:** De "checkpoint obrigatório" para "auto-continue default"
2. **Heuristics Engine:** Decisões codificadas, não dependentes de humano
3. **Completion Detection:** Saber quando parar automaticamente

O resultado será um Bob que trabalha como um **account manager sênior** — competente o suficiente para resolver 90% das situações sozinho, mas inteligente o suficiente para saber quando precisa de input do cliente.

---

*— Atlas, investigando a verdade 🔎*

```yaml
investigation_metadata:
  created: 2026-02-05
  status: completed
  artifacts:
    - gap_analysis: 10 items identified
    - architecture_proposal: 3 new modules
    - heuristics_spec: 3 decision trees
    - implementation_plan: 3 phases
  next_steps:
    - Review with stakeholder
    - Create Epic if approved
    - Prioritize quick wins
```
