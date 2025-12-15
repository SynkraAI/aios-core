# Decision Analysis System - Deep Integration with AIOS Components

**Document Version**: 1.0
**Date**: 2025-01-21
**Status**: Implementation Blueprint
**Related**: `decision-analysis-architectural-decision.md`, `decision-analysis-integration.md`

---

## Executive Summary

Este documento responde à pergunta crítica do Pedro Valério:

> "Qual o impacto real dessa decision-analysis-architectural-decision terá nos outros agentes, tasks, check-lists, templates, workflows, tools e utils? Como de fato ele será executado manualmente e automaticamente por qualquer agente que tiver trabalhando ou fechando um ciclo de desenvolvimento para reconhecer que aquelas decisões tomadas pelo usuários estão indo contra a forma correta de usar o sistema pelo pedro valério?"

**Resumo da Resposta**:

- **Execução Manual**: Comandos `*capture-decisions` e `*consult-mind` adicionados a TODOS os 11 agentes
- **Execução Automática**: Hooks pós-ciclo em pontos estratégicos (story completion, QA pass, epic closure)
- **Validação em Tempo Real**: Interceptors nos agentes `dev`, `qa`, `pm` que consultam Mind antes de decisões críticas
- **Integração Profunda**: 27 pontos de integração em tasks, 6 checklists modificados, 3 novos workflows

---

## Table of Contents

1. [Matriz de Impacto por Agente](#matriz-de-impacto-por-agente)
2. [Fluxos de Execução Detalhados](#fluxos-de-execução-detalhados)
3. [Triggers e Hooks Automáticos](#triggers-e-hooks-automáticos)
4. [Validação em Tempo Real](#validação-em-tempo-real)
5. [Integração com Tasks](#integração-com-tasks)
6. [Integração com Checklists](#integração-com-checklists)
7. [Integração com Workflows](#integração-com-workflows)
8. [Integração com Tools](#integração-com-tools)
9. [Casos de Uso Concretos](#casos-de-uso-concretos)
10. [Código de Implementação](#código-de-implementação)

---

## 1. Matriz de Impacto por Agente

### Legenda de Impacto

- 🔴 **Alto**: Modificações profundas no comportamento do agente
- 🟡 **Médio**: Novos comandos e validações opcionais
- 🟢 **Baixo**: Apenas comandos básicos de consulta

### Tabela de Impacto

| Agente | ID | Impacto | Novos Comandos | Validações | Modificações Workflow |
|--------|----|---------|--------------|-----------|-----------------------|
| Developer | dev | 🔴 Alto | `*capture-decisions`<br>`*consult-mind`<br>`*validate-approach` | ✅ Pre-task<br>✅ Post-story | `develop-story` completion hook |
| QA | qa | 🔴 Alto | `*capture-qa-decisions`<br>`*consult-mind`<br>`*validate-testing` | ✅ Pre-review<br>✅ Gate decisions | `review` and `gate` workflows |
| PM | pm | 🟡 Médio | `*capture-planning`<br>`*consult-mind` | ✅ PRD creation<br>✅ Epic closure | `create-prd`, `create-epic` |
| PO | po | 🟡 Médio | `*capture-backlog`<br>`*consult-mind` | ✅ Story validation | Backlog prioritization |
| SM | sm | 🟢 Baixo | `*consult-mind` | ❌ None | Optional retrospective capture |
| Architect | architect | 🟡 Médio | `*capture-arch-decisions`<br>`*consult-mind` | ✅ ADR validation | Architecture decision review |
| Analyst | analyst | 🟢 Baixo | `*consult-mind` | ❌ None | Optional research enhancement |
| UX Expert | ux-expert | 🟢 Baixo | `*consult-mind` | ❌ None | Optional UX consultation |
| AIOS Master | aios-master | 🟡 Médio | `*analyze-decisions`<br>`*mind-report` | ❌ None | System-level reporting |
| AIOS Orchestrator | aios-orchestrator | 🟡 Médio | `*auto-capture` | ✅ Workflow completion | Cross-agent decision tracking |
| AIOS Developer | aios-developer | 🟢 Baixo | `*consult-mind` | ❌ None | Framework development consultation |

### Impacto Quantitativo

- **Total de Agentes**: 11
- **Agentes com Alto Impacto**: 2 (dev, qa)
- **Agentes com Médio Impacto**: 5 (pm, po, architect, aios-master, aios-orchestrator)
- **Agentes com Baixo Impacto**: 4 (sm, analyst, ux-expert, aios-developer)
- **Total de Novos Comandos**: 21
- **Total de Validações**: 8 pontos críticos

---

## 2. Fluxos de Execução Detalhados

### 2.1 Execução Manual - Comandos Disponíveis

#### Comando Universal: `*consult-mind`

**Disponível em**: TODOS os 11 agentes

**Sintaxe**:
```
@{agente}
*consult-mind {contexto}
```

**Exemplo**:
```
@dev
*consult-mind "Devo usar MongoDB ou PostgreSQL para este caso de uso?"
```

**Fluxo de Execução**:
```
1. Agente captura contexto atual (story ativa, arquivos modificados, git diff)
2. Formata query com contexto do agente
3. Chama MindQueryEngine.query({context, query})
4. MindQueryEngine:
   a. Busca decisões similares em outputs/minds/pedro_valerio/decisions/
   b. Compila heurísticas relevantes via HeuristicCompiler
   c. Aplica AxiomaValidator para checar coerência
   d. Retorna resposta estruturada com:
      - Decisão recomendada
      - Fundamentação baseada em casos anteriores
      - Confiança score (0-1)
      - Axiomas/heurísticas aplicados
5. Agente apresenta resposta formatada ao usuário
6. Usuário decide: seguir, adaptar ou ignorar
7. Se decisão for tomada, agente sugere: "*capture-decisions para registrar"
```

#### Comando de Captura: `*capture-decisions`

**Disponível em**: dev, qa, pm, po, architect

**Sintaxe**:
```
@{agente}
*capture-decisions [--story {storyId}] [--auto]
```

**Exemplo**:
```
@dev
*capture-decisions --story 1.15

@qa
*capture-decisions --auto  # Captura automaticamente do contexto atual
```

**Fluxo de Execução**:
```
1. Determinar escopo de captura:
   - Se --story fornecido: Usar story específica
   - Se --auto: Detectar story ativa do git branch ou diretório
   - Senão: Perguntar ao usuário qual story/ciclo capturar

2. Coletar evidências (DecisionCapturer):
   a. Git log desde último capture:
      git log --since="{last_capture_date}" --pretty=format:"%h %an %ad %s" --date=short

   b. Arquivos modificados com diff:
      git diff {last_capture_commit}..HEAD --name-status
      git diff {last_capture_commit}..HEAD {critical_files}

   c. Story file atual:
      - Acceptance Criteria marcados
      - Dev Notes
      - Tasks completados
      - QA Results (se disponível)

   d. Chat history (se MCP memory disponível):
      - Decisões discutidas
      - Alternativas consideradas
      - Justificativas dadas

   e. Tool calls log:
      - create-agent, create-task, modify-checklist
      - Parâmetros escolhidos

3. Executar análise LLM (via adapter):
   a. Carregar prompt: prompts/decision-analysis-prompt.md
   b. Injetar evidências no contexto
   c. Injetar meta_axiomas e heuristicas do Mind
   d. Executar LLM call
   e. Parsear resposta estruturada

4. Salvar decisões:
   a. Criar arquivo: outputs/minds/pedro_valerio/decisions/{timestamp}-{story}.yaml
   b. Estrutura:
      ```yaml
      meta:
        timestamp: 2025-01-21T14:30:00Z
        story: "1.15"
        agent: "dev"
        capture_mode: "manual"

      decisions:
        - id: "1.15-001"
          category: "architecture"
          context: "Choosing between expansion pack vs core integration"
          decision: "Hybrid approach with cognitive workspace package"
          alternatives_considered:
            - "Pure expansion pack"
            - "Pure core integration"
          rationale: "Balances reusability with extensibility..."
          confidence: 0.85
          axiomas_applied:
            - "Completude Antes de Entrega"
            - "Priorização do Rigor Técnico"
          heuristics_matched:
            - "PV_BS_001" # Future Back-Casting
          axes_assessment:
            speed_vs_rigor: "Strong rigor bias"
            autonomy_vs_collaboration: "Balanced"
      ```

5. Atualizar índice:
   a. Adicionar entrada em outputs/minds/pedro_valerio/decisions/index.json
   b. Atualizar estatísticas (total decisions, categories, confidence avg)

6. Feedback ao usuário:
   "✅ Capturadas 3 decisões do Story 1.15:
    - Architecture: Hybrid approach (confidence: 0.85)
    - Testing: Unit + integration strategy (confidence: 0.92)
    - Documentation: Inline + ADR pattern (confidence: 0.78)

    Arquivo: outputs/minds/pedro_valerio/decisions/20250121-1-15.yaml

    Para consultar futuramente: @dev *consult-mind 'hybrid architecture'"
```

### 2.2 Execução Automática - Hooks do Sistema

#### Hook 1: Post-Story Completion (dev agent)

**Trigger**: Quando dev agent marca última task [x] e status → "Ready for Review"

**Localização**: `aios-core/agents/dev.md` → `develop-story.completion`

**Modificação**:
```yaml
develop-story:
  completion: |
    All Tasks marked [x] →
    Validations pass →
    File List complete →
    **[NEW] Execute: @aios-orchestrator *auto-capture --agent dev --story {current_story}** →
    set status: 'Ready for Review' →
    HALT
```

**Fluxo Detalhado**:
```
1. Dev agent verifica completion:
   - All tasks [x]
   - Tests passing
   - Lint passing
   - File list updated

2. ANTES de marcar "Ready for Review":
   a. Call aios-orchestrator agent (interno, não visível ao usuário)
   b. aios-orchestrator executa *auto-capture:
      - Scope: current story
      - Agent: dev
      - Mode: automatic
      - Silence: true (não interrompe usuário)

3. aios-orchestrator → DecisionCapturer:
   - Coleta evidências (git, story file, tool calls)
   - Executa análise LLM
   - Salva em outputs/minds/pedro_valerio/decisions/
   - Retorna sucesso/falha ao dev agent

4. Dev agent continua:
   - Se captura sucesso: Log silencioso
   - Se captura falha: Warning não-bloqueante
   - Marca status "Ready for Review"
   - HALT

5. Post-completion notification (opcional):
   "✅ Story 1.15 marked 'Ready for Review'
    📊 Decisões capturadas automaticamente (3 encontradas)
    Ver: outputs/minds/pedro_valerio/decisions/20250121-1-15.yaml"
```

#### Hook 2: Post-QA Gate PASS (qa agent)

**Trigger**: Quando qa agent marca gate como PASS

**Localização**: `aios-core/agents/qa.md` → `gate` command

**Modificação**:
```yaml
commands:
  - gate {story}: |
      Execute qa-gate task →
      **[NEW] If PASS: Execute @aios-orchestrator *auto-capture --agent qa --story {story}** →
      Update QA Results section →
      Inform user of gate result
```

**Fluxo**:
```
1. QA executa gate validation
2. Se resultado = PASS:
   a. Trigger auto-capture de decisões QA:
      - Test strategy decisions
      - Coverage decisions
      - Risk assessment choices
   b. Salvar em outputs/minds/pedro_valerio/decisions/qa-{story}.yaml
3. Atualizar story com QA Results
4. Notificar usuário
```

#### Hook 3: Post-Epic Closure (pm agent)

**Trigger**: PM marca último story do epic como Done

**Localização**: `aios-core/agents/pm.md` → epic monitoring

**Fluxo**:
```
1. PM detecta: all stories in epic → Done
2. Trigger: @aios-orchestrator *auto-capture --scope epic --epic {epicNum}
3. DecisionCapturer:
   - Agrega decisões de TODAS stories do epic
   - Identifica padrões emergentes
   - Compila heurísticas novas
4. Salva: outputs/minds/pedro_valerio/decisions/epic-{epicNum}-summary.yaml
5. PM notifica usuário com epic summary
```

---

## 3. Triggers e Hooks Automáticos

### 3.1 Tabela de Triggers

| Trigger Point | Agent | Condition | Action | Blocking | Silence |
|---------------|-------|-----------|--------|----------|---------|
| Story Completion | dev | All tasks [x] + validations pass | auto-capture story | ❌ No | ✅ Yes |
| QA Gate PASS | qa | Gate result = PASS | auto-capture qa decisions | ❌ No | ✅ Yes |
| QA Gate FAIL | qa | Gate result = FAIL + fixes applied | auto-capture failure learnings | ❌ No | ✅ Yes |
| Epic Closure | pm | Last story Done | auto-capture epic summary | ❌ No | ❌ No |
| PRD Creation | pm | create-prd completion | auto-capture planning decisions | ❌ No | ✅ Yes |
| Architecture Decision | architect | ADR created | auto-capture arch rationale | ❌ No | ✅ Yes |

### 3.2 Hook Implementation Pattern

Todos os hooks seguem este padrão:

```javascript
// In agent workflow (pseudocode)
async function agentWorkflowCompletion() {
  // Original agent logic
  await executeAgentTask();

  // NEW: Decision capture hook
  if (shouldCaptureDecisions()) {
    try {
      await orchestrator.autoCapture({
        agent: this.agentId,
        scope: this.currentScope,
        mode: 'automatic',
        silence: true
      });
    } catch (error) {
      // Non-blocking: log but don't fail workflow
      console.warn(`Decision capture failed: ${error.message}`);
    }
  }

  // Continue original workflow
  await completeWorkflow();
}
```

---

## 4. Validação em Tempo Real

### 4.1 Conceito de "Veto Suave"

O sistema NÃO bloqueia decisões do usuário, mas **alerta proativamente** quando detecta desvio dos padrões do Pedro Valério.

**Princípio**: "Informar, não impor"

### 4.2 Pontos de Validação Críticos

#### Dev Agent: Pre-Task Validation

**Quando**: Dev agent está para iniciar uma nova task

**Trigger**: Usuário pede `@dev *start-task {taskId}` (comando hipotético)

**Validação**:
```
1. Dev agent lê task description e acceptance criteria
2. Identifica tipo de decisão: "refactoring", "new feature", "bug fix"
3. Consulta Mind:
   query = "Abordagem recomendada para {task_type} considerando {tech_stack}"
4. MindQueryEngine retorna:
   - Decisões similares anteriores
   - Heurísticas aplicáveis (ex: PV_PM_001 - Automation Check)
   - Confiança score

5. Se confiança > 0.7 E decisão atual difere:
   **ALERTA PROATIVO**:
   "⚠️  Mind Pedro Valério Consultation:

   Task: {task description}

   Sua abordagem planejada parece diferir do padrão PV habitual:

   Padrão PV (confiança 85%):
   - Approach: Test-first development
   - Rationale: Garante completude antes de entrega
   - Heuristic: PV_PA_001 (Coherence Scan)

   Você ainda pode prosseguir com sua abordagem, mas considere:
   - Risco de retrabalho se testes revelarem gaps
   - Alinhamento com Meta-Axioma: 'Completude Antes de Entrega'

   Deseja: [1] Seguir padrão PV  [2] Prosseguir com sua abordagem  [3] Ver casos similares"
```

#### QA Agent: Test Strategy Validation

**Quando**: QA está definindo estratégia de testes para uma story

**Trigger**: QA agent command `*test-design {story}`

**Validação**:
```
1. QA lê story acceptance criteria e technical context
2. Consulta Mind:
   query = "Estratégia de testes para {feature_type} com {tech_stack}"
3. Mind retorna teste cases de stories similares
4. QA compara sua estratégia planejada com padrão PV

5. Se divergência detectada:
   **ALERTA**:
   "🧪 Mind QA Consultation:

   Padrão PV para features similares (3 casos encontrados):
   - Unit coverage: 80%+
   - Integration tests: Critical paths
   - E2E: User workflows principais

   Sua estratégia atual:
   - Unit coverage: 60% (⚠️ abaixo do padrão)
   - Integration tests: Nenhum (⚠️ gap crítico)

   Recomendação: Adicionar integration tests para {critical_paths}

   Fundamentação: Axioma 'Rigor Técnico' + Heurística PV_PA_001

   Ajustar estratégia? [Y/n]"
```

#### PM Agent: Scope Validation

**Quando**: PM está criando PRD ou definindo escopo de epic

**Trigger**: PM command `*create-prd` ou `*create-epic`

**Validação**:
```
1. PM coleta requirements do usuário
2. Analisa escopo proposto
3. Consulta Mind:
   query = "Escopo adequado para MVP de {project_type}"
4. Mind retorna decisões de scoping anteriores

5. Se escopo muito grande ou muito pequeno:
   **ALERTA**:
   "📋 Mind PM Consultation:

   Análise de Escopo:

   Padrão PV (baseado em 5 MVPs anteriores):
   - Features core: 3-5
   - Sprint duration: 2-4 weeks
   - Team size: 2-3 devs

   Escopo atual:
   - Features propostas: 12 (⚠️ muito grande)
   - Estimativa: 8 weeks (⚠️ risco de atraso)

   Recomendação: Reduzir para 4 features core:
   1. {essential_feature_1}
   2. {essential_feature_2}
   3. {essential_feature_3}
   4. {essential_feature_4}

   Fundamentação: Heurística PV_BS_001 (Future Back-Casting)
   'Definir MVP mínimo que entrega valor, iterar depois'

   Ajustar escopo? [Y/n]"
```

### 4.3 Interceptor Pattern (Código)

```javascript
// aios-core/agents/interceptors/mind-validator.js

class MindValidator {
  constructor(mindAdapter) {
    this.adapter = mindAdapter;
  }

  /**
   * Intercept agent decision before execution
   * @returns {Object} {allowed: boolean, warning: string|null, recommendation: Object|null}
   */
  async validateDecision(context) {
    const {
      agent,        // 'dev', 'qa', 'pm'
      decisionType, // 'task-start', 'test-strategy', 'scope-definition'
      plannedAction,// Descrição da ação planejada
      evidenceContext // Story, tech stack, etc.
    } = context;

    // 1. Query Mind for similar decisions
    const mindQuery = this.buildQuery(decisionType, evidenceContext);
    const similarDecisions = await this.adapter.queryDecisions(mindQuery);

    if (!similarDecisions || similarDecisions.length === 0) {
      // No historical data, allow without warning
      return {allowed: true, warning: null};
    }

    // 2. Analyze deviation from Mind pattern
    const deviation = this.calculateDeviation(plannedAction, similarDecisions);

    // 3. If significant deviation (>30%), generate warning
    if (deviation.score > 0.3) {
      const recommendation = await this.adapter.generateRecommendation({
        plannedAction,
        similarDecisions,
        deviation,
        axiomas: await this.adapter.getRelevantAxiomas(decisionType)
      });

      return {
        allowed: true, // NEVER block
        warning: this.formatWarning(deviation, recommendation),
        recommendation: recommendation
      };
    }

    // 4. Aligned with Mind, proceed silently
    return {allowed: true, warning: null};
  }

  calculateDeviation(planned, historical) {
    // Simplified: compare key attributes
    const avgConfidence = historical.reduce((sum, d) => sum + d.confidence, 0) / historical.length;

    // Check if planned approach is mentioned in historical decisions
    const matchFound = historical.some(d =>
      this.semanticSimilarity(planned, d.decision) > 0.7
    );

    if (!matchFound && avgConfidence > 0.7) {
      return {score: 0.5, reason: 'No similar approach found in high-confidence historical decisions'};
    }

    return {score: 0.1, reason: 'Aligned with historical pattern'};
  }

  formatWarning(deviation, recommendation) {
    return `
⚠️  Mind Pedro Valério Consultation:

${deviation.reason}

Recomendação Mind (confiança: ${(recommendation.confidence * 100).toFixed(0)}%):
${recommendation.suggested_approach}

Fundamentação:
- Axiomas: ${recommendation.axiomas.join(', ')}
- Casos similares: ${recommendation.similar_cases_count}

Você pode prosseguir com sua abordagem, mas considere os riscos identificados.
    `.trim();
  }
}

// Usage in dev agent
// aios-core/agents/dev.md (pseudocode injection)

const mindValidator = new MindValidator(pedroValerioAdapter);

async function startTask(taskId) {
  const task = await loadTask(taskId);

  // Intercept before execution
  const validation = await mindValidator.validateDecision({
    agent: 'dev',
    decisionType: 'task-start',
    plannedAction: task.description,
    evidenceContext: {
      story: currentStory,
      techStack: projectTechStack,
      taskType: task.type
    }
  });

  if (validation.warning) {
    // Show warning to user
    console.log(validation.warning);

    // Ask user to proceed or adjust
    const userChoice = await promptUser('[1] Follow Mind recommendation  [2] Proceed with my approach  [3] See similar cases');

    if (userChoice === '1') {
      // User wants to follow Mind
      return await executeTaskWithRecommendation(task, validation.recommendation);
    } else if (userChoice === '3') {
      // User wants more context
      await showSimilarCases(validation.recommendation.similar_cases);
      return await startTask(taskId); // Re-prompt
    }
    // else: user proceeds with their approach (choice 2 or timeout)
  }

  // Execute task normally
  return await executeTask(task);
}
```

---

## 5. Integração com Tasks

### 5.1 Novos Tasks Criados

#### Task: `capture-decisions.md`

**Localização**: `aios-core/tasks/capture-decisions.md`

**Purpose**: Capturar decisões de desenvolvimento de forma estruturada

**Tools Required**:
- git (análise de commits)
- filesystem (leitura de story files)
- mcp/memory (se disponível, para chat history)

**Parameters**:
- `story_id` (opcional): Story específica para capturar
- `scope` (opcional): 'story', 'epic', 'sprint'
- `mode`: 'manual' ou 'automatic'

**Workflow**:
```markdown
## Task: Capture Development Decisions

### 1. Determine Scope
- If story_id provided: Use that story
- If scope=epic: Collect all stories in epic
- Else: Ask user which story/scope to capture

### 2. Collect Evidence
- Run git log analysis
- Read story file (AC, tasks, dev notes)
- Extract tool calls from logs
- If MCP memory available: Get chat history

### 3. Execute LLM Analysis
- Load decision-analysis-prompt.md
- Inject evidence + Pedro Valério artifacts
- Call LLM via adapter
- Parse structured response

### 4. Save Decisions
- Create YAML file in outputs/minds/pedro_valerio/decisions/
- Update index.json
- Log completion to user

### 5. Optional: Generate Insights
- If scope=epic: Identify emergent patterns
- Compile new heuristics if confidence > 0.8
```

#### Task: `consult-mind.md`

**Localização**: `aios-core/tasks/consult-mind.md`

**Purpose**: Consultar Mind Pedro Valério para orientação

**Parameters**:
- `query`: Pergunta do usuário
- `context`: Contexto adicional (story, tech stack)

**Workflow**:
```markdown
## Task: Consult Pedro Valério Mind

### 1. Prepare Query Context
- Extract current working context (git branch, modified files)
- Read active story file if exists
- Gather tech stack from architecture docs

### 2. Query Mind
- Format query with full context
- Call MindQueryEngine.query()
- Receive ranked matches with confidence scores

### 3. Present Results
- Show top 3 most relevant decisions
- Display axiomas/heuristics applied
- Provide confidence score
- Offer "See more cases" option

### 4. Optional: Capture Follow-up Decision
- If user makes decision based on consultation
- Offer to capture with: "*capture-decisions"
```

#### Task: `validate-against-mind.md`

**Localização**: `aios-core/tasks/validate-against-mind.md`

**Purpose**: Validar decisão planejada contra padrões Mind

**Parameters**:
- `decision_type`: 'task-start', 'test-strategy', 'architecture', etc.
- `planned_action`: Descrição da ação planejada
- `context`: Contexto relevante

**Workflow**:
```markdown
## Task: Validate Decision Against Mind

### 1. Load Mind Context
- Get relevant axiomas for decision_type
- Load historical decisions of same type

### 2. Analyze Deviation
- Compare planned_action with historical patterns
- Calculate deviation score
- Identify specific differences

### 3. Generate Recommendation
- If deviation > 30%: Generate warning
- Compile recommendation based on axiomas
- Find similar cases for reference

### 4. Present to User
- Show validation result
- If warning: Explain deviation and risks
- Offer options: Follow Mind / Proceed / See cases
```

### 5.2 Tasks Modificados

#### Modified: `create-next-story.md`

**Section Added**: "Step 6.5: Mind Consultation for Story Preparation"

**Insertion Point**: After "5.4 Update Story Frontmatter", before "6. Story Draft Completion"

**New Content**:
```markdown
### 5.5 Optional: Consult Mind for Story Preparation

**[NEW - Mind Integration]**

If this story type has been implemented before, consult Mind for insights:

- Execute: `@dev *consult-mind "Best approach for {story_type} with {tech_stack}"`
- Review historical decisions from similar stories
- Incorporate learned patterns into Dev Notes
- Update task breakdown based on Mind recommendations

This step is optional but recommended for complex or unfamiliar story types.
```

#### Modified: `document-project.md`

**Section Added**: "2.5 Mind Context Enhancement"

**New Step**:
```markdown
### 2.5 Consult Mind for Project Patterns

**[NEW - Mind Integration]**

If Pedro Valério has worked on similar brownfield projects before:

- Execute: `@analyst *consult-mind "Documentation approach for {project_type}"`
- Identify relevant patterns from past projects
- Use consistent terminology and structure
- Highlight critical areas based on PV experience

This enhances documentation quality by leveraging accumulated knowledge.
```

### 5.3 Quantitative Impact

- **Tasks Created**: 3 novos (`capture-decisions.md`, `consult-mind.md`, `validate-against-mind.md`)
- **Tasks Modified**: 2 existentes (`create-next-story.md`, `document-project.md`)
- **Optional Steps Added**: 4 (em tasks diversos)
- **Total Integration Points**: 9

---

## 6. Integração com Checklists

### 6.1 Checklist Modificado: `story-dod-checklist.md`

**Section Added**: "8. Decision Capture & Mind Alignment"

**Insertion**: After "7. Documentation", before "Final Confirmation"

**New Content**:
```markdown
## 8. Decision Capture & Mind Alignment

[[LLM: Ensure development decisions are captured for Mind evolution]]

- [ ] Key technical decisions documented in Dev Notes with rationale
- [ ] Alternative approaches considered are noted
- [ ] Deviations from standard patterns are justified
- [ ] **[AUTOMATIC]** Decision capture executed via post-completion hook
- [ ] If Mind warnings were shown during development, decisions are explained

**Mind Consultation Notes** (if applicable):
- [ ] Mind was consulted for: ____________________
- [ ] Recommendation followed: [ ] Yes [ ] No [ ] Partially
- [ ] If deviated from Mind, rationale documented: ____________________

**Note**: Decision capture runs automatically when story is marked complete. This checklist item is for awareness and manual documentation of key rationale.
```

### 6.2 Checklist Modificado: `story-draft-checklist.md`

**Section Added**: "6. Mind Context Verification"

**New Content**:
```markdown
## 6. Mind Context Verification

[[LLM: Verify if Mind can provide insights for story preparation]]

- [ ] Story type checked against historical decisions database
- [ ] If similar stories found, Mind insights incorporated into Dev Notes
- [ ] Task breakdown informed by successful past approaches (if available)
- [ ] Potential pitfalls from past experience noted in story file

**Mind Consultation** (optional but recommended):
- [ ] Executed: `*consult-mind` for story type
- [ ] Relevant historical cases: [ ] Found [ ] Not found
- [ ] If found: Key learnings incorporated: ____________________
```

### 6.3 Novo Checklist: `mind-capture-quality.md`

**Purpose**: Validar qualidade das decisões capturadas

**Content**:
```markdown
# Mind Decision Capture Quality Checklist

## Purpose
Ensure captured decisions are high-quality and useful for Mind evolution.

## Quality Criteria

### 1. Context Completeness
- [ ] Decision has clear context (story, feature, technical challenge)
- [ ] Alternatives considered are documented
- [ ] Constraints and requirements are explicit

### 2. Rationale Clarity
- [ ] Reasoning for chosen approach is clear
- [ ] Trade-offs are explained
- [ ] Axiomas/principles applied are identified

### 3. Evidence Strength
- [ ] Git commits support the decision narrative
- [ ] Code changes align with stated approach
- [ ] Test coverage validates decision quality

### 4. Confidence Assessment
- [ ] Confidence score is realistic (not auto-generated high)
- [ ] Uncertainty is acknowledged where it exists
- [ ] Follow-up validation is noted if decision was experimental

### 5. Reusability
- [ ] Decision is abstracted enough to apply to similar cases
- [ ] Technical details don't obscure the principle
- [ ] Heuristics can be extracted from the pattern

## Final Verification
- [ ] Decision file passes schema validation
- [ ] All required fields are populated
- [ ] Linked artifacts (commits, files) are accessible
```

### 6.4 Quantitative Impact

- **Checklists Modified**: 2 (`story-dod-checklist.md`, `story-draft-checklist.md`)
- **Checklists Created**: 1 (`mind-capture-quality.md`)
- **New Checklist Items**: 12
- **Total Integration Points**: 15

---

## 7. Integração com Workflows

### 7.1 Novo Workflow: `decision-capture-cycle.yaml`

**Location**: `aios-core/workflows/decision-capture-cycle.yaml`

**Purpose**: Workflow completo de captura de decisões pós-ciclo

**Content**:
```yaml
workflow:
  id: decision-capture-cycle
  name: Decision Capture Post-Development Cycle
  description: Automatically capture and analyze decisions after completing a development cycle
  type: automation
  metadata:
    elicit: false  # Fully automated
    confirmation_required: false
    trigger: post-story-completion

  parameters:
    - name: story_id
      type: string
      required: true
      description: Story that just completed
    - name: agent
      type: string
      required: true
      description: Agent that completed the story (dev, qa, etc.)
    - name: mode
      type: string
      default: automatic
      enum: [manual, automatic]

  steps:
    - id: validate-completion
      name: Validate Story Completion
      description: Ensure story is actually complete before capture
      actions:
        - type: check
          condition: story.status === "Ready for Review" || story.status === "Done"
          on_failure: abort

    - id: collect-evidence
      name: Collect Decision Evidence
      description: Gather all artifacts related to decisions
      actions:
        - type: execute
          tool: git
          command: log --since="{story_start_date}" --pretty=format:"%h %an %ad %s"
        - type: read
          file: "docs/stories/{story_id}.md"
        - type: execute
          tool: git
          command: diff {story_branch_start}..HEAD --name-status

    - id: analyze-decisions
      name: Analyze with Mind Adapter
      description: Use Pedro Valério adapter to analyze decisions
      actions:
        - type: load
          adapter: pedro-valerio
          artifacts: [meta_axiomas, heuristicas, clickup_playbook]
        - type: execute
          method: analyzeDecision
          params:
            evidence: "{collected_evidence}"
            context:
              story: "{story_id}"
              agent: "{agent}"
              tech_stack: "{project.tech_stack}"

    - id: save-decisions
      name: Save to Mind Storage
      description: Persist decisions to Mind database
      actions:
        - type: create
          file: "outputs/minds/pedro_valerio/decisions/{timestamp}-{story_id}.yaml"
          content: "{analysis_result}"
        - type: update
          file: "outputs/minds/pedro_valerio/decisions/index.json"
          operation: append_entry

    - id: generate-insights
      name: Generate Insights
      description: Identify patterns and potential new heuristics
      actions:
        - type: analyze
          method: detectPatterns
          params:
            recent_decisions_count: 10
            min_confidence: 0.75
        - type: conditional
          condition: new_patterns_found
          then:
            - type: create
              file: "outputs/minds/pedro_valerio/insights/{timestamp}-emerging-patterns.md"

    - id: notify
      name: Notify Completion
      description: Inform system and optionally user
      actions:
        - type: log
          message: "✅ Decisions captured for story {story_id}"
        - type: conditional
          condition: mode === "manual"
          then:
            - type: notify_user
              message: "Capturadas {decision_count} decisões. Ver: outputs/minds/pedro_valerio/decisions/{timestamp}-{story_id}.yaml"

  error_handling:
    on_error: log_and_continue  # Non-blocking
    max_retries: 1
    fallback: notify_admin
```

### 7.2 Novo Workflow: `mind-consultation.yaml`

**Purpose**: Workflow interativo de consulta à Mind

**Content**:
```yaml
workflow:
  id: mind-consultation
  name: Mind Pedro Valério Consultation Workflow
  description: Interactive consultation with Pedro Valério Mind for guidance
  type: interactive
  metadata:
    elicit: true
    confirmation_required: false

  parameters:
    - name: query
      type: string
      required: true
      description: User's question or context
    - name: context
      type: object
      required: false
      description: Additional context (story, tech stack, etc.)

  steps:
    - id: prepare-context
      name: Prepare Query Context
      description: Enrich query with current working context
      actions:
        - type: detect
          what: current_story
          fallback: null
        - type: detect
          what: modified_files
          method: git_status
        - type: detect
          what: tech_stack
          source: architecture/tech-stack.md

    - id: query-mind
      name: Query Mind Database
      description: Search for relevant historical decisions
      actions:
        - type: execute
          adapter: pedro-valerio
          method: queryDecisions
          params:
            query: "{query}"
            context: "{enriched_context}"
            max_results: 5
            min_confidence: 0.5

    - id: compile-heuristics
      name: Compile Relevant Heuristics
      description: Identify applicable heuristics for this query
      actions:
        - type: execute
          compiler: HeuristicCompiler
          method: compileRelevant
          params:
            query_type: "{detected_query_type}"
            context: "{enriched_context}"

    - id: format-response
      name: Format Response for User
      description: Present results in actionable format
      actions:
        - type: execute
          adapter: pedro-valerio
          method: formatConsultationResponse
          params:
            query: "{query}"
            matches: "{query_results}"
            heuristics: "{compiled_heuristics}"

    - id: present-results
      name: Present to User
      description: Show results with options for drill-down
      actions:
        - type: display
          format: structured
          content: "{formatted_response}"
        - type: elicit
          prompt: "Deseja: [1] Ver casos detalhados [2] Capturar sua decisão [3] Fechar"
          options:
            - value: "1"
              label: "Ver casos detalhados"
              action: show_detailed_cases
            - value: "2"
              label: "Capturar decisão"
              action: trigger_capture_workflow
            - value: "3"
              label: "Fechar"
              action: exit

  error_handling:
    on_error: show_friendly_message
    fallback_message: "Mind indisponível. Prossiga com sua experiência e capture a decisão manualmente depois."
```

### 7.3 Workflow Modificado: `setup-environment.yaml`

**Section Added**: "Mind Storage Initialization"

**New Step**:
```yaml
steps:
  # ... existing steps ...

  - id: init-mind-storage
    name: Initialize Mind Storage
    description: Setup Pedro Valério Mind storage structure
    actions:
      - type: create_directory
        path: "outputs/minds/pedro_valerio/decisions"
        if_not_exists: true
      - type: create_file
        path: "outputs/minds/pedro_valerio/decisions/index.json"
        content: |
          {
            "version": "1.0",
            "total_decisions": 0,
            "categories": {},
            "decisions": []
          }
        if_not_exists: true
      - type: log
        message: "✅ Mind storage initialized"
```

### 7.4 Quantitative Impact

- **Workflows Created**: 2 (`decision-capture-cycle.yaml`, `mind-consultation.yaml`)
- **Workflows Modified**: 1 (`setup-environment.yaml`)
- **Total Workflow Steps Added**: 18
- **Integration Points**: 21

---

## 8. Integração com Tools

### 8.1 Novo Tool: `cognitive/decision-capturer.js`

**Package**: `@aios-fullstack/cognitive`

**Purpose**: Coletar evidências de decisões

**API**:
```javascript
class DecisionCapturer {
  async collectEvidence(scope) {
    // scope: {story_id, epic_id, timeframe, etc.}

    const evidence = {
      git_log: await this.getGitLog(scope),
      file_changes: await this.getFileChanges(scope),
      story_data: await this.getStoryData(scope),
      tool_calls: await this.getToolCalls(scope),
      chat_history: await this.getChatHistory(scope) // if MCP memory available
    };

    return evidence;
  }

  async getGitLog(scope) {
    // Execute: git log --since="{start}" --until="{end}"
    // Parse commits with: hash, author, date, message
  }

  async getFileChanges(scope) {
    // Execute: git diff {start_commit}..{end_commit} --name-status
    // Categorize: added, modified, deleted
  }

  async getStoryData(scope) {
    // Read story file
    // Extract: AC, tasks, dev notes, QA results
  }

  async getToolCalls(scope) {
    // Parse logs for tool invocations
    // Extract: tool name, parameters, timestamp
  }
}
```

**Integration with Agents**:
- Accessed via `@aios-fullstack/cognitive` import
- Called by `aios-orchestrator` during auto-capture
- Used by `capture-decisions.md` task

### 8.2 Novo Tool: `cognitive/pattern-analyzer.js`

**Purpose**: Detectar padrões emergentes em decisões

**API**:
```javascript
class PatternAnalyzer {
  async detectPatterns(decisions, options = {}) {
    // decisions: array of decision objects
    // options: {min_occurrences: 3, min_confidence: 0.75}

    const patterns = {
      emergent_heuristics: [],
      recurring_axiomas: [],
      decision_trends: [],
      confidence_evolution: []
    };

    // Group decisions by category
    const grouped = this.groupBy(decisions, 'category');

    // For each category, analyze patterns
    for (const [category, categoryDecisions] of Object.entries(grouped)) {
      // Detect recurring approaches
      const approaches = this.extractApproaches(categoryDecisions);
      const recurring = approaches.filter(a => a.count >= options.min_occurrences);

      // If pattern strong enough, propose new heuristic
      if (recurring.length > 0 && recurring[0].avg_confidence > options.min_confidence) {
        patterns.emergent_heuristics.push({
          id: `PV_${category.toUpperCase()}_${Date.now()}`,
          name: recurring[0].pattern_name,
          description: recurring[0].description,
          confidence: recurring[0].avg_confidence,
          occurrences: recurring[0].count,
          template: this.generateHeuristicTemplate(recurring[0])
        });
      }
    }

    return patterns;
  }

  generateHeuristicTemplate(pattern) {
    // Generate executable heuristic code
    return {
      evaluate: `(context) => { /* check if ${pattern.pattern_name} applies */ }`,
      apply: `(context) => { /* execute ${pattern.pattern_name} */ }`,
      veto: `(context) => { /* veto if contradicts ${pattern.pattern_name} */ }`
    };
  }
}
```

### 8.3 Novo Tool: `cognitive/mind-query-engine.js`

**Purpose**: Busca semântica em decisões históricas

**API**:
```javascript
class MindQueryEngine {
  constructor(mindAdapter) {
    this.adapter = mindAdapter;
    this.indexPath = 'outputs/minds/pedro_valerio/decisions/index.json';
  }

  async query(params) {
    // params: {query, context, max_results, min_confidence}

    // 1. Load index
    const index = await this.loadIndex();

    // 2. Semantic search (simplified: keyword matching + context scoring)
    const matches = index.decisions
      .map(decision => ({
        ...decision,
        score: this.calculateRelevance(decision, params.query, params.context)
      }))
      .filter(d => d.score > (params.min_confidence || 0.5))
      .sort((a, b) => b.score - a.score)
      .slice(0, params.max_results || 5);

    // 3. Load full decision data for matches
    const fullDecisions = await Promise.all(
      matches.map(m => this.loadDecisionFile(m.file_path))
    );

    // 4. Compile relevant heuristics
    const heuristics = await this.compileRelevantHeuristics(fullDecisions);

    return {
      matches: fullDecisions,
      heuristics: heuristics,
      total_found: matches.length
    };
  }

  calculateRelevance(decision, query, context) {
    // Simplified scoring:
    // - Keyword match in decision text: +0.3
    // - Same category as context: +0.2
    // - Same tech stack: +0.2
    // - Recent decision (last 6 months): +0.1
    // - High original confidence: +0.2

    let score = 0;

    if (this.containsKeywords(decision.decision, query)) score += 0.3;
    if (context.category && decision.category === context.category) score += 0.2;
    if (context.tech_stack && this.sharesTechStack(decision, context.tech_stack)) score += 0.2;
    if (this.isRecent(decision.meta.timestamp, 6)) score += 0.1;
    if (decision.confidence > 0.8) score += 0.2;

    return Math.min(score, 1.0);
  }
}
```

### 8.4 Integração com MCP Tools

#### ClickUp MCP Integration

**Purpose**: Sync decisions com ClickUp tasks

**New Feature**: Attach decision files to ClickUp story tasks

**Implementation**:
```javascript
// When decision is captured
async function syncDecisionToClickUp(decision, storyId) {
  // 1. Get story task_id from frontmatter
  const story = await loadStory(storyId);
  const taskId = story.clickup.task_id;

  // 2. Create attachment with decision file
  await clickUpMCP.createAttachment({
    task_id: taskId,
    file_path: decision.file_path,
    file_name: `decision-${decision.id}.yaml`,
    description: `Decisão capturada: ${decision.category}`
  });

  // 3. Add comment with decision summary
  await clickUpMCP.createComment({
    task_id: taskId,
    content: `
📊 **Decisão Capturada Automaticamente**

**Categoria**: ${decision.category}
**Confiança**: ${(decision.confidence * 100).toFixed(0)}%

**Decisão**: ${decision.decision}

**Axiomas Aplicados**: ${decision.axiomas_applied.join(', ')}

Ver detalhes: ${decision.file_path}
    `.trim()
  });
}
```

### 8.5 Quantitative Impact

- **New Tools Created**: 3 (`decision-capturer.js`, `pattern-analyzer.js`, `mind-query-engine.js`)
- **MCP Integrations**: 1 (ClickUp attachment + comment)
- **Tool API Methods**: 15+
- **Integration Points**: 18

---

## 9. Casos de Uso Concretos

### Caso 1: Dev Agent Iniciando Feature Complexa

**Cenário**: Pedro está para implementar autenticação OAuth para a aplicação.

**Fluxo Completo**:

1. **Pedro ativa Dev Agent**:
   ```
   @dev
   *start-task 1.15.3  # "Implement OAuth authentication"
   ```

2. **Dev Agent lê task e detecta complexidade**:
   ```
   Task: Implement OAuth authentication
   Type: new-feature (high complexity)
   Tech Stack: Node.js + Express

   → Triggering Mind validation...
   ```

3. **Mind Validator intercepta**:
   ```javascript
   const validation = await mindValidator.validateDecision({
     agent: 'dev',
     decisionType: 'task-start',
     plannedAction: 'Implement OAuth authentication from scratch',
     evidenceContext: {
       story: '1.15',
       techStack: ['node', 'express'],
       taskType: 'new-feature'
     }
   });
   ```

4. **Mind encontra decisões similares**:
   ```
   Found 2 similar decisions:

   1. Story 1.8: "Implement JWT authentication"
      Decision: "Use Passport.js library for standardization"
      Confidence: 0.92
      Axioma: "Priorização do Rigor Técnico" (prefer proven libraries)

   2. Story 1.12: "Add social login"
      Decision: "Passport.js + strategies (Google, Facebook)"
      Confidence: 0.88
      Axioma: "Completude Antes de Entrega" (comprehensive solution)
   ```

5. **Dev Agent mostra alerta proativo**:
   ```
   ⚠️  Mind Pedro Valério Consultation:

   Padrão PV para autenticação (confiança 90%):
   - Library: Passport.js
   - Approach: Strategy pattern para múltiplos providers
   - Rationale: Padrão de mercado, bem documentado, extensível

   Sua abordagem planejada:
   - "Implement OAuth from scratch"

   ⚠️ Risco Identificado:
   - Reinventar solução complexa (OAuth tem nuances de segurança)
   - Tempo de desenvolvimento: 2-3x maior
   - Manutenção: alta complexidade

   Recomendação Mind:
   1. Use Passport.js com passport-oauth2 strategy
   2. Exemplo de implementação em Story 1.12
   3. Teste com Google OAuth primeiro, depois generalize

   Fundamentação:
   - Axioma: "Priorização do Rigor Técnico"
   - Heurística: PV_PM_001 (Automation Check) - "Use ferramentas prontas quando disponíveis"

   Escolha:
   [1] Seguir padrão PV (Passport.js)
   [2] Prosseguir com implementação custom
   [3] Ver código de referência (Story 1.12)
   ```

6. **Pedro escolhe [1]**:
   ```
   ✅ Aplicando recomendação Mind...

   Updated Task Approach:
   - Install Passport.js + passport-oauth2
   - Configure strategies para Google OAuth
   - Implement callback routes
   - Add session management

   Reference Code: docs/stories/1.12-social-login.md

   Proceed with updated approach? [Y/n]
   ```

7. **Dev Agent implementa com abordagem recomendada**

8. **Ao completar story, auto-capture executa**:
   ```
   [Silently running in background]

   DecisionCapturer.collectEvidence({story: '1.15'})
   → Git log: 12 commits
   → Files changed: auth/, routes/oauth.js, config/passport.js
   → Tool calls: npm install passport passport-oauth2

   PedroValerioAdapter.analyzeDecision({evidence, context})
   → LLM analysis...
   → Decision extracted:
      {
        id: "1.15-003",
        category: "architecture",
        decision: "Used Passport.js for OAuth implementation",
        rationale: "Following Mind recommendation, proven library...",
        confidence: 0.95,
        axiomas_applied: ["Priorização do Rigor Técnico"],
        mind_consultation: true,
        followed_recommendation: true
      }

   Saved: outputs/minds/pedro_valerio/decisions/20250121-1-15.yaml

   ✅ Story 1.15 marked 'Ready for Review'
   📊 3 decisões capturadas automaticamente
   ```

**Resultado**:
- Pedro evitou 2-3 dias de trabalho desnecessário
- Implementação seguiu padrão já validado
- Mind aprendeu que recomendação foi aceita (confidence boost)
- Próxima vez: recomendação terá confiança ainda maior

---

### Caso 2: QA Agent Detectando Test Coverage Insuficiente

**Cenário**: Quinn (QA) está revisando Story 1.16 (nova feature de pagamentos).

**Fluxo**:

1. **QA inicia review**:
   ```
   @qa
   *review 1.16
   ```

2. **QA lê story e testa manualmente**:
   ```
   Story 1.16: Implement Stripe payment integration
   Status: Ready for Review (by dev)

   → Running manual tests...
   → Checking test coverage...

   Test Results:
   - Unit tests: 12 passing ✅
   - Coverage: 45% ⚠️
   - Integration tests: 0 ❌
   - E2E tests: 0 ❌
   ```

3. **QA planeja strategy**:
   ```
   Planned Test Strategy:
   - Add 5 more unit tests → 65% coverage
   - Skip integration tests (time constraint)
   - Manual E2E testing only
   ```

4. **Mind Validator intercepta**:
   ```javascript
   const validation = await mindValidator.validateDecision({
     agent: 'qa',
     decisionType: 'test-strategy',
     plannedAction: 'Unit tests only, manual E2E, skip integration',
     evidenceContext: {
       story: '1.16',
       feature_type: 'payments',
       risk_level: 'high' // payment = high risk
     }
   });
   ```

5. **Mind encontra padrão crítico**:
   ```
   ⚠️⚠️ Mind QA Consultation - HIGH RISK DETECTED

   Feature Type: Payments (high-risk category)

   Padrão PV para features high-risk (5 casos encontrados):

   Story 1.5: "Payment refunds" (confidence: 0.95)
   Test Strategy:
   - Unit: 85%+ coverage ✅
   - Integration: Full payment flow + edge cases ✅
   - E2E: Happy path + error scenarios ✅
   - Result: 0 production bugs

   Story 1.9: "Payment webhooks" (confidence: 0.88)
   Test Strategy:
   - Unit: 70% coverage ⚠️
   - Integration: Skipped ❌
   - E2E: Manual only ❌
   - Result: 3 production bugs (webhook failures, race conditions)

   🚨 Sua estratégia atual se assemelha ao Story 1.9 (que teve bugs)

   Recomendação Mind (confidence: 0.95):
   1. Unit coverage: Mínimo 80% para payment logic
   2. Integration tests: CRÍTICO - testar:
      - Stripe API integration
      - Webhook handling
      - Transaction rollback scenarios
   3. E2E: Automated tests para:
      - Happy path (successful payment)
      - Card declined scenario
      - Network timeout handling

   Fundamentação:
   - Axioma: "Completude Antes de Entrega"
   - Heurística: PV_PA_001 (Coherence Scan) - "High-risk features exigem high-coverage"
   - Meta-Axioma: "VETO em situações de incoerência óbvia"

   Estimativa de Esforço:
   - Integration tests: +4 horas
   - E2E automation: +3 horas
   - Total: +7 horas

   vs.

   Risco de Production Bugs:
   - Probabilidade: 60% (baseado em Story 1.9)
   - Custo de correção: 2-3 dias + reputação

   ⚠️ Mind recomenda fortemente: Investir 7h agora para evitar 2-3 dias depois

   Decisão:
   [1] Seguir padrão PV (coverage completo)
   [2] Prosseguir com minha estratégia (assumir risco)
   [3] Ver casos detalhados
   ```

6. **Quinn escolhe [1]**:
   ```
   ✅ Aplicando estratégia recomendada...

   Updated Test Plan:

   Unit Tests (target: 85%):
   - [ ] Payment amount validation
   - [ ] Currency conversion logic
   - [ ] Transaction state machine
   - [ ] Error handling for all Stripe errors

   Integration Tests (NEW):
   - [ ] Stripe API: Create payment intent
   - [ ] Stripe API: Confirm payment
   - [ ] Webhook: payment.succeeded
   - [ ] Webhook: payment.failed
   - [ ] Rollback: Failed payment cleanup

   E2E Automated (NEW):
   - [ ] Happy path: Card payment succeeds
   - [ ] Error path: Card declined
   - [ ] Error path: Network timeout

   Estimated Time: +7 hours

   Proceed? [Y/n]
   ```

7. **QA executa strategy completa**

8. **Resultados**:
   ```
   Final Test Results:
   - Unit coverage: 87% ✅
   - Integration tests: 5 passing ✅
   - E2E tests: 3 passing ✅

   Bugs found during testing: 2
   - Webhook race condition (caught by integration test!)
   - Timeout handling missing (caught by E2E test!)

   Fixed before production ✅
   ```

9. **Auto-capture registra sucesso**:
   ```
   Decision captured:
   {
     id: "1.16-qa-001",
     category: "testing",
     decision: "Full test coverage for payment feature",
     rationale: "Followed Mind recommendation for high-risk features",
     confidence: 0.95,
     mind_consultation: true,
     followed_recommendation: true,
     outcome: "2 bugs caught pre-production",
     validation: "Mind pattern proven correct again"
   }
   ```

**Resultado**:
- 2 bugs críticos evitados em produção
- Time investment: 7h (vs 2-3 dias de correção emergencial)
- Mind aprendeu: padrão high-risk reforçado (confidence → 0.98)
- Próxima feature de pagamentos: recomendação automática ainda mais forte

---

### Caso 3: PM Agent Definindo Escopo de MVP

**Cenário**: John (PM) está criando PRD para novo produto.

**Fluxo**:

1. **PM inicia PRD creation**:
   ```
   @pm
   *create-prd "SaaS Analytics Dashboard"
   ```

2. **PM coleta requirements do usuário**:
   ```
   Product: SaaS Analytics Dashboard

   User requests:
   - Real-time analytics
   - Custom dashboards
   - Team collaboration
   - Export to PDF/Excel
   - Mobile app
   - AI-powered insights
   - Integration with 20+ data sources
   - White-label customization
   - Advanced role-based access
   - Audit logs
   - API for developers
   - Webhooks
   ```

3. **PM começa a definir MVP**:
   ```
   Planned MVP Scope:
   - All 12 features above
   - Estimated: 6 months, 5 developers
   ```

4. **Mind Validator intercepta**:
   ```
   ⚠️  Mind PM Consultation - SCOPE ALERT

   Padrão PV para MVPs SaaS (baseado em 4 produtos anteriores):

   Product A: "Analytics Platform" (success story)
   MVP Scope:
   - Core features: 3 (basic analytics, 1 dashboard template, export CSV)
   - Timeline: 2 months
   - Team: 2 devs
   - Result: Launched on time, iterated based on feedback, now 15 features

   Product B: "Dashboard Builder" (failure story)
   MVP Scope:
   - Core features: 10 (tried to do too much)
   - Timeline: 4 months (actual: 10 months)
   - Team: 4 devs
   - Result: Launched late, features half-baked, users confused, pivoted

   🚨 Seu escopo atual se assemelha ao Product B

   Análise Mind (confidence: 0.92):

   Features Propostas: 12
   Classificação:

   CORE (must-have for MVP):
   1. ✅ Real-time analytics (basic charts)
   2. ✅ 1 pre-built dashboard template
   3. ✅ Export to CSV/Excel

   NICE-TO-HAVE (can wait for v2):
   4. ⏸️ Custom dashboard builder (complex, pode ser v2)
   5. ⏸️ Team collaboration (não crítico no MVP)
   6. ⏸️ PDF export (CSV suficiente para MVP)
   7. ⏸️ Mobile app (web responsivo primeiro)

   ADVANCED (definitely v3+):
   8. ❌ AI-powered insights (muito complexo, precisa dados primeiro)
   9. ❌ 20+ integrations (começar com 2-3 principais)
   10. ❌ White-label (enterprise feature)
   11. ❌ Advanced RBAC (básico suficiente)
   12. ❌ API/Webhooks (adicionar quando houver demanda)

   Recomendação Mind - MVP Lean:

   Phase 1 (MVP - 2 months):
   - Real-time analytics (line/bar/pie charts)
   - 1 dashboard template ("Executive Overview")
   - Export to CSV/Excel
   - Basic auth + single-user accounts
   - 3 data source integrations (Google Analytics, Stripe, PostgreSQL)

   Phase 2 (v2 - +2 months after feedback):
   - Custom dashboard builder (drag-drop widgets)
   - Team accounts + basic sharing
   - +5 integrations
   - PDF export

   Phase 3 (v3 - +3 months):
   - Mobile app
   - AI insights (now have user data)
   - Advanced RBAC
   - API for developers

   Fundamentação:
   - Heurística: PV_BS_001 (Future Back-Casting)
     "Start with end goal, work backwards to minimal viable increment"
   - Meta-Axioma: "Preferência por Completude de Produto"
     "Better to launch 3 features excellently than 12 mediocrely"
   - Axioma: "Priorização do Rigor Técnico"
     "Each feature must be production-quality, not prototype"

   Comparação:

   Sua proposta:
   - Features: 12
   - Timeline: 6 months
   - Risk: High (baseado em Product B pattern)
   - Success probability: 35%

   Recomendação Mind:
   - Features: 5 (core)
   - Timeline: 2 months
   - Risk: Low (baseado em Product A pattern)
   - Success probability: 85%

   💡 Insight Mind:
   "Lançar MVP em 2 meses com 5 features sólidas permite:
    - Feedback real de usuários
    - Validar hipóteses de produto
    - Ajustar roadmap baseado em uso real
    - Evitar desperdício de 4 meses em features não-usadas"

   Decisão:
   [1] Seguir recomendação Mind (MVP lean, 2 meses)
   [2] Prosseguir com escopo original (12 features, 6 meses)
   [3] Ver detalhes dos casos Product A e Product B
   [4] Definir escopo customizado (com consultoria Mind)
   ```

5. **John escolhe [4] - Escopo customizado**:
   ```
   Vamos definir escopo customizado.

   Mind: Quais features do escopo original você considera absolutamente críticas?

   John: Real-time analytics, custom dashboards (simple version), e 5 key integrations.

   Mind Analysis:
   - Real-time analytics: ✅ CORE (MVP Phase 1)
   - Custom dashboards: ⚠️ HIGH COMPLEXITY
     → Mind recommendation: Start with "dashboard templates + basic customization"
        (select widgets, arrange layout)
     → Full drag-drop builder: Phase 2
   - 5 integrations: ⚠️ MODERATE SCOPE
     → Mind recommendation: Which 5? Prioritize by user demand

   Mind: Quais as 5 integrações mais importantes?

   John: Google Analytics, Stripe, Shopify, PostgreSQL, MySQL.

   Mind Analysis:
   ✅ Google Analytics - alta demanda
   ✅ Stripe - pagamentos, comum
   ✅ PostgreSQL - custom data sources
   ⚠️ Shopify - e-commerce specific, nicho
   ⚠️ MySQL - similar to PostgreSQL

   Mind Recommendation:
   MVP: Google Analytics, Stripe, PostgreSQL (cover 80% use cases)
   v2: Add Shopify, MySQL, + 3 more based on requests

   Updated MVP Scope (John + Mind collaboration):

   Phase 1 - MVP (2.5 months):
   1. Real-time analytics (line, bar, pie, table)
   2. Dashboard templates (3 pre-built: Executive, Sales, Marketing)
   3. Basic dashboard customization (select/hide widgets, arrange layout)
   4. Export CSV/Excel
   5. Integrations: Google Analytics, Stripe, PostgreSQL
   6. Team accounts (up to 5 users, basic permissions)

   Phase 2 - v2 (+2 months):
   7. Full drag-drop dashboard builder
   8. Advanced team collaboration (comments, sharing)
   9. +5 integrations (Shopify, MySQL, Salesforce, HubSpot, custom API)
   10. PDF export with branding

   Phase 3 - v3 (+3 months):
   11. Mobile app (iOS/Android)
   12. AI-powered insights
   13. API for developers

   Compromisso:
   - Mantém custom dashboards (versão simplificada no MVP)
   - Mantém 5 integrações (3 no MVP, 5 completo em v2)
   - Reduz timeline: 6 meses → 2.5 meses (MVP) + iterações
   - Aumenta success probability: 35% → 70%

   Mind Assessment:
   ✅ Bom compromisso entre ambição e pragmatismo
   ✅ Escopo MVP ainda viável em 2.5 meses
   ⚠️ Team size: 3 devs recomendado (vs 5 original)

   Proceed with this scope? [Y/n]
   ```

6. **John aceita**:
   ```
   ✅ PRD created with Mind-validated scope

   Estimated:
   - MVP: 2.5 months, 3 developers
   - Success probability: 70% (Mind assessment)

   Key Learnings Applied:
   - Product A success pattern (lean MVP)
   - Avoided Product B failure pattern (scope creep)
   - Balanced ambition with pragmatism

   Next: Create Epic 1 with MVP stories
   ```

7. **Auto-capture registra decisão de scoping**:
   ```
   Decision captured:
   {
     id: "analytics-mvp-001",
     category: "product-management",
     decision: "Lean MVP with 6 core features, 2.5 month timeline",
     alternatives_considered: [
       "Full scope (12 features, 6 months) - rejected due to Product B failure pattern",
       "Ultra-minimal (3 features, 1 month) - rejected as too limited"
     ],
     rationale: "Followed PV_BS_001 heuristic (Future Back-Casting), balanced user needs with delivery pragmatism",
     confidence: 0.75,
     mind_consultation: true,
     followed_recommendation: "partially" // customized based on Mind guidance,
     axiomas_applied: [
       "Preferência por Completude de Produto",
       "Priorização do Rigor Técnico"
     ],
     heuristics_matched: ["PV_BS_001"],
     outcome: "TBD (will update post-launch)"
   }
   ```

**Resultado Esperado**:
- Escopo realista com alta chance de sucesso
- Evitou armadilha de "trying to do too much"
- Mind aprendeu: preferência por MVP lean mas com customização equilibrada
- Próximo produto: recomendação já incorpora esse aprendizado

---

## 10. Código de Implementação

### 10.1 Agent Modification Example: `dev.md`

**Original** (relevant section):
```yaml
commands:
  - help: Show numbered list of commands
  - review-qa: run task apply-qa-fixes.md
  - run-tests: Execute linting and tests
  - exit: Say goodbye and abandon persona

develop-story:
  completion: |
    All Tasks marked [x] →
    Validations pass →
    File List complete →
    set status: 'Ready for Review' →
    HALT
```

**Modified**:
```yaml
commands:
  - help: Show numbered list of commands
  - review-qa: run task apply-qa-fixes.md
  - run-tests: Execute linting and tests
  # NEW: Decision analysis commands
  - capture-decisions [--story {id}]: run task capture-decisions.md
  - consult-mind {query}: run task consult-mind.md
  - validate-approach: run task validate-against-mind.md
  - exit: Say goodbye and abandon persona

develop-story:
  completion: |
    All Tasks marked [x] →
    Validations pass →
    File List complete →
    **[NEW] Execute: @aios-orchestrator *auto-capture --agent dev --story {current_story} --mode automatic --silence true** →
    set status: 'Ready for Review' →
    HALT

  # NEW: Pre-task validation
  pre-task-start: |
    IF task complexity >= medium:
      Execute: validate-against-mind with task context
      IF Mind warning shown:
        Present warning to user
        Elicit: Follow Mind / Proceed / See cases
        IF Follow Mind:
          Adjust approach based on recommendation
    Proceed with task execution
```

### 10.2 Task Implementation: `capture-decisions.md`

```markdown
---
tools:
  - git               # Git log analysis
  - filesystem        # Story file reading
  - mcp/memory        # Chat history (if available)
  - cognitive         # DecisionCapturer, PedroValerioAdapter
---

# Capture Development Decisions

## Purpose

Capture development decisions systematically for Mind evolution.

## Parameters

- `story_id` (optional): Specific story to capture (e.g., "1.15")
- `scope` (optional): 'story', 'epic', 'sprint'
- `mode`: 'manual' or 'automatic'
- `silence` (optional): Suppress user notifications if true

## Task Execution

### 0. Load Cognitive Tools

```javascript
const { DecisionCapturer } = require('@aios-fullstack/cognitive');
const { PedroValerioAdapter } = require('expansion-packs/pedro-valerio-mind');

const capturer = new DecisionCapturer();
const adapter = new PedroValerioAdapter({
  mind_name: 'pedro_valerio',
  storage_path: 'outputs/minds/pedro_valerio'
});
```

### 1. Determine Scope

**IF story_id provided**:
- Use that story
- Set scope = 'story'

**ELSE IF scope === 'epic'**:
- Ask user: Which epic to capture?
- Collect all stories in that epic

**ELSE IF scope === 'sprint'**:
- Ask user: Which sprint timeframe?
- Use date range

**ELSE** (no parameters):
- Detect current story from:
  - Git branch name (e.g., `story/1.15`)
  - Story file in current directory
  - Ask user if cannot detect

### 2. Collect Evidence

```javascript
const evidence = await capturer.collectEvidence({
  story_id: determinedStoryId,
  scope: determinedScope,
  since: scopeStartDate,  // For epic/sprint
  until: scopeEndDate      // For epic/sprint
});

// evidence structure:
// {
//   git_log: [{hash, author, date, message}, ...],
//   file_changes: [{path, status, diff}, ...],
//   story_data: {ac, tasks, dev_notes, qa_results},
//   tool_calls: [{tool, params, timestamp}, ...],
//   chat_history: [{message, timestamp, role}, ...] // if MCP memory available
// }
```

### 3. Execute Analysis

```javascript
const analysis = await adapter.analyzeDecision(evidence);

// analysis structure:
// {
//   decisions: [
//     {
//       id, category, context, decision,
//       alternatives_considered, rationale,
//       confidence, axiomas_applied, heuristics_matched,
//       axes_assessment
//     },
//     ...
//   ],
//   meta: {
//     timestamp, story, agent, capture_mode
//   }
// }
```

### 4. Save Decisions

```javascript
const filepath = `outputs/minds/pedro_valerio/decisions/${timestamp}-${storyId}.yaml`;
await fs.writeFile(filepath, yaml.stringify(analysis));

// Update index
const index = await loadIndex();
analysis.decisions.forEach(d => {
  index.decisions.push({
    id: d.id,
    file_path: filepath,
    category: d.category,
    confidence: d.confidence,
    timestamp: analysis.meta.timestamp
  });
});
await saveIndex(index);
```

### 5. Optional: Generate Insights

**IF scope === 'epic'** (multiple stories):
```javascript
const { PatternAnalyzer } = require('@aios-fullstack/cognitive');
const analyzer = new PatternAnalyzer();

const patterns = await analyzer.detectPatterns(analysis.decisions, {
  min_occurrences: 2,
  min_confidence: 0.75
});

if (patterns.emergent_heuristics.length > 0) {
  // Save insights
  await fs.writeFile(
    `outputs/minds/pedro_valerio/insights/${timestamp}-emerging-patterns.md`,
    formatInsights(patterns)
  );
}
```

### 6. Feedback

**IF mode === 'manual' OR silence !== true**:
```
✅ Capturadas {count} decisões do Story {storyId}:
   - Architecture: {decision_summary} (confidence: {score})
   - Testing: {decision_summary} (confidence: {score})
   ...

Arquivo: {filepath}

Para consultar futuramente: @{agent} *consult-mind '{keyword}'
```

**ELSE** (automatic + silence):
```
[Silent log only]
```

## Error Handling

- **Git not available**: Warn user, proceed with partial evidence
- **Story file not found**: Error, cannot capture without story context
- **LLM API error**: Retry once, then save evidence for manual analysis later
- **File write error**: Critical error, abort

## Success Criteria

- [ ] Evidence collected successfully
- [ ] Analysis completed via adapter
- [ ] Decisions saved to YAML file
- [ ] Index updated
- [ ] User feedback provided (unless silenced)
```

### 10.3 Interceptor Implementation: `mind-validator.js`

```javascript
// aios-core/lib/interceptors/mind-validator.js

const path = require('path');
const { MindQueryEngine } = require('@aios-fullstack/cognitive');

class MindValidator {
  constructor(mindAdapter) {
    this.adapter = mindAdapter;
    this.queryEngine = new MindQueryEngine(mindAdapter);
  }

  /**
   * Validate a planned decision against Mind patterns
   * @param {Object} context - Decision context
   * @returns {Promise<Object>} Validation result
   */
  async validateDecision(context) {
    const {
      agent,           // 'dev', 'qa', 'pm'
      decisionType,    // 'task-start', 'test-strategy', 'scope-definition'
      plannedAction,   // User's planned approach
      evidenceContext  // Story, tech stack, etc.
    } = context;

    try {
      // 1. Query Mind for similar decisions
      const query = this.buildQuery(decisionType, plannedAction, evidenceContext);
      const mindResponse = await this.queryEngine.query({
        query: query,
        context: evidenceContext,
        max_results: 5,
        min_confidence: 0.5
      });

      if (!mindResponse.matches || mindResponse.matches.length === 0) {
        // No historical data, allow without warning
        return {
          allowed: true,
          warning: null,
          mind_data_available: false
        };
      }

      // 2. Calculate deviation from Mind patterns
      const deviation = await this.calculateDeviation(
        plannedAction,
        mindResponse.matches,
        mindResponse.heuristics
      );

      // 3. If significant deviation, generate warning
      if (deviation.score > 0.3) {
        const recommendation = await this.generateRecommendation({
          plannedAction,
          matches: mindResponse.matches,
          heuristics: mindResponse.heuristics,
          deviation,
          decisionType
        });

        return {
          allowed: true, // NEVER block user
          warning: this.formatWarning(deviation, recommendation),
          recommendation: recommendation,
          mind_data_available: true
        };
      }

      // 4. Aligned with Mind, proceed silently
      return {
        allowed: true,
        warning: null,
        mind_data_available: true,
        alignment: 'high'
      };

    } catch (error) {
      // Non-blocking: if validation fails, allow user to proceed
      console.error('[MindValidator] Validation error:', error);
      return {
        allowed: true,
        warning: null,
        error: error.message
      };
    }
  }

  /**
   * Build query string for Mind
   */
  buildQuery(decisionType, plannedAction, evidenceContext) {
    const typeQueries = {
      'task-start': `Best approach for implementing ${evidenceContext.task_type} with ${evidenceContext.tech_stack}`,
      'test-strategy': `Test strategy for ${evidenceContext.feature_type} feature`,
      'scope-definition': `MVP scope for ${evidenceContext.project_type} product`,
      'architecture': `Architecture pattern for ${evidenceContext.system_type}`,
      'tech-choice': `Technology choice for ${evidenceContext.use_case}`
    };

    return typeQueries[decisionType] || plannedAction;
  }

  /**
   * Calculate deviation score between planned action and Mind patterns
   */
  async calculateDeviation(plannedAction, historicalMatches, heuristics) {
    // Average confidence of historical matches
    const avgConfidence = historicalMatches.reduce((sum, m) => sum + m.confidence, 0) / historicalMatches.length;

    // Check semantic similarity
    const similarities = await Promise.all(
      historicalMatches.map(m => this.semanticSimilarity(plannedAction, m.decision))
    );
    const maxSimilarity = Math.max(...similarities);

    // If high-confidence historical data exists but planned action differs significantly
    if (avgConfidence > 0.7 && maxSimilarity < 0.5) {
      return {
        score: 0.6,
        reason: 'Planned approach differs significantly from high-confidence historical patterns',
        historical_confidence: avgConfidence,
        similarity_to_best_match: maxSimilarity
      };
    }

    // If applicable heuristics exist but not reflected in planned action
    const heuristicMatch = this.checkHeuristicAlignment(plannedAction, heuristics);
    if (heuristics.length > 0 && !heuristicMatch) {
      return {
        score: 0.4,
        reason: 'Planned approach does not align with applicable heuristics',
        relevant_heuristics: heuristics.map(h => h.id)
      };
    }

    // Low deviation, aligned with Mind
    return {
      score: Math.max(0.1, 1 - maxSimilarity),
      reason: maxSimilarity > 0.7 ? 'Aligned with historical pattern' : 'Partially aligned',
      similarity_to_best_match: maxSimilarity
    };
  }

  /**
   * Simplified semantic similarity (in production, use embeddings)
   */
  async semanticSimilarity(text1, text2) {
    // Simplified: keyword overlap
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * Check if planned action aligns with heuristics
   */
  checkHeuristicAlignment(plannedAction, heuristics) {
    // Simplified: check if heuristic keywords present in planned action
    return heuristics.some(h => {
      const keywords = h.template?.keywords || [];
      return keywords.some(kw => plannedAction.toLowerCase().includes(kw.toLowerCase()));
    });
  }

  /**
   * Generate recommendation based on Mind data
   */
  async generateRecommendation(params) {
    const { plannedAction, matches, heuristics, deviation, decisionType } = params;

    // Find best match (highest confidence)
    const bestMatch = matches.reduce((best, m) => m.confidence > best.confidence ? m : best);

    // Get relevant axiomas from adapter
    const axiomas = await this.adapter.getRelevantAxiomas(decisionType);

    return {
      suggested_approach: bestMatch.decision,
      rationale: bestMatch.rationale,
      confidence: bestMatch.confidence,
      similar_cases_count: matches.length,
      axiomas: axiomas.map(a => a.name),
      heuristics: heuristics.map(h => h.id),
      deviation_score: deviation.score,
      risks_of_proceeding: this.identifyRisks(deviation, bestMatch),
      reference_stories: matches.map(m => m.meta?.story).filter(Boolean)
    };
  }

  /**
   * Identify risks if user proceeds with their approach
   */
  identifyRisks(deviation, bestMatch) {
    const risks = [];

    if (deviation.score > 0.5) {
      risks.push('High deviation from proven pattern');
    }

    if (bestMatch.confidence > 0.8) {
      risks.push('Strong historical evidence against this approach');
    }

    if (bestMatch.outcome && bestMatch.outcome.includes('bug')) {
      risks.push('Similar approach led to production bugs in past');
    }

    return risks.length > 0 ? risks : ['Moderate risk, proceed with caution'];
  }

  /**
   * Format warning message for user
   */
  formatWarning(deviation, recommendation) {
    const emoji = deviation.score > 0.5 ? '🚨' : '⚠️';

    return `
${emoji} Mind Pedro Valério Consultation:

Padrão PV (confiança ${(recommendation.confidence * 100).toFixed(0)}%):
${recommendation.suggested_approach}

Fundamentação:
- Axiomas: ${recommendation.axiomas.join(', ')}
- Heurísticas: ${recommendation.heuristics.join(', ')}
- Casos similares: ${recommendation.similar_cases_count}

Riscos se prosseguir com sua abordagem:
${recommendation.risks_of_proceeding.map(r => `- ${r}`).join('\n')}

Referências:
${recommendation.reference_stories.map(s => `- Story ${s}`).join('\n') || '- Ver decisões similares no índice'}

Você pode prosseguir com sua abordagem, mas considere os riscos identificados.

Escolha:
[1] Seguir padrão PV  [2] Prosseguir com minha abordagem  [3] Ver casos detalhados
    `.trim();
  }
}

module.exports = { MindValidator };
```

### 10.4 Workflow Integration: `aios-orchestrator` Hook

```javascript
// aios-core/agents/lib/aios-orchestrator.js

const { DecisionCapturer } = require('@aios-fullstack/cognitive');
const { MindRegistry } = require('@aios-fullstack/cognitive');

class AIOSOrchestrator {
  constructor() {
    this.capturer = new DecisionCapturer();
    this.mindRegistry = null;
  }

  async init() {
    // Discover available Minds
    this.mindRegistry = await MindRegistry.discoverMinds();
    console.log(`[Orchestrator] Discovered ${this.mindRegistry.length} Minds`);
  }

  /**
   * Auto-capture decisions after agent workflow completion
   * Called by agent completion hooks
   */
  async autoCapture(params) {
    const {
      agent,       // 'dev', 'qa', 'pm'
      scope,       // {story_id: '1.15'} or {epic_id: '1'}
      mode,        // 'automatic'
      silence      // true/false
    } = params;

    try {
      if (!silence) {
        console.log(`[Orchestrator] Auto-capturing decisions for ${agent}...`);
      }

      // 1. Collect evidence
      const evidence = await this.capturer.collectEvidence(scope);

      // 2. Determine which Mind to use (default: Pedro Valério)
      const mind = this.mindRegistry.find(m => m.slug === 'pedro_valerio');
      if (!mind) {
        throw new Error('Pedro Valério Mind not found');
      }

      const adapter = new mind.adapter({
        mind_name: 'pedro_valerio',
        storage_path: 'outputs/minds/pedro_valerio'
      });

      // 3. Analyze decisions
      const analysis = await adapter.analyzeDecision(evidence);

      // 4. Save decisions
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const storyId = scope.story_id || scope.epic_id;
      const filepath = `outputs/minds/pedro_valerio/decisions/${timestamp}-${storyId}.yaml`;

      await this.saveDecisions(filepath, analysis);
      await this.updateIndex(analysis);

      // 5. Optional: Sync to ClickUp if story_id provided
      if (scope.story_id) {
        await this.syncToClickUp(analysis, scope.story_id);
      }

      if (!silence) {
        console.log(`[Orchestrator] ✅ Captured ${analysis.decisions.length} decisions`);
      }

      return {
        success: true,
        decision_count: analysis.decisions.length,
        filepath: filepath
      };

    } catch (error) {
      console.error('[Orchestrator] Auto-capture failed:', error);

      // Non-blocking: return error but don't fail workflow
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveDecisions(filepath, analysis) {
    const yaml = require('yaml');
    const fs = require('fs').promises;
    await fs.writeFile(filepath, yaml.stringify(analysis));
  }

  async updateIndex(analysis) {
    const fs = require('fs').promises;
    const indexPath = 'outputs/minds/pedro_valerio/decisions/index.json';

    let index;
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      index = JSON.parse(content);
    } catch {
      // Index doesn't exist, create new
      index = {
        version: '1.0',
        total_decisions: 0,
        categories: {},
        decisions: []
      };
    }

    // Add entries
    analysis.decisions.forEach(d => {
      index.decisions.push({
        id: d.id,
        file_path: analysis.meta.filepath,
        category: d.category,
        confidence: d.confidence,
        timestamp: analysis.meta.timestamp
      });

      // Update category count
      index.categories[d.category] = (index.categories[d.category] || 0) + 1;
      index.total_decisions++;
    });

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  async syncToClickUp(analysis, storyId) {
    // Load story to get ClickUp task_id
    const storyPath = `docs/stories/${storyId}.md`;
    // ... parse frontmatter to get clickup.task_id ...

    // Create attachment
    // ... use ClickUp MCP to attach decision YAML ...

    // Create comment
    // ... use ClickUp MCP to add decision summary comment ...
  }
}

module.exports = { AIOSOrchestrator };
```

---

## Resumo Executivo

### Impacto Quantificado

| Categoria | Quantidade |
|-----------|-----------|
| **Agentes Modificados** | 11 (todos) |
| **Novos Comandos** | 21 |
| **Tasks Criados** | 3 |
| **Tasks Modificados** | 2 |
| **Checklists Criados** | 1 |
| **Checklists Modificados** | 2 |
| **Workflows Criados** | 2 |
| **Workflows Modificados** | 1 |
| **Tools Criados** | 3 |
| **MCP Integrations** | 1 |
| **Pontos de Integração Total** | 72+ |

### Execução Manual vs Automática

**Manual**:
- 21 comandos `*consult-mind` e `*capture-decisions` distribuídos nos agentes
- Disponível a qualquer momento durante desenvolvimento
- Interativo com feedback imediato

**Automática**:
- 6 hooks principais (story completion, QA gate, epic closure, PRD creation, ADR, task start)
- Execução silenciosa em background
- Não interrompe usuário

### Validação em Tempo Real

- 3 pontos críticos de validação (dev, qa, pm)
- Interceptor pattern implementado
- Veto suave: informa mas não bloqueia
- Confidence-based warnings

### Resposta à Pergunta Original

**"Como de fato ele será executado?"**

✅ **Manual**: Via comandos `*consult-mind` e `*capture-decisions` em qualquer agente
✅ **Automático**: Via hooks pós-ciclo em 6 pontos estratégicos
✅ **Tempo Real**: Via interceptors que consultam Mind antes de decisões críticas

**"Como reconhecer decisões contra padrão PV?"**

✅ **MindValidator**: Compara ação planejada com histórico de decisões
✅ **Deviation Score**: Calcula divergência (>30% = warning)
✅ **Proactive Alerts**: Mostra warning ANTES da execução, não depois
✅ **Evidence-Based**: Fundamenta warnings com casos concretos e axiomas

---

**Documento Completo**: 72+ pontos de integração mapeados com código e exemplos concretos.

**Próximo Passo**: Implementação fase 1 (infraestrutura cognitiva) conforme roadmap em `decision-analysis-architectural-decision.md`.
