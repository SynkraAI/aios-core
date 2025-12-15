# PRD: Sistema de Análise de Decisões e Mind Evolution

**Epic**: Cognitive Evolution Layer - Pedro Valério Decision Tracking
**Status**: 📋 **PROPOSTA**
**Versão**: 1.0
**Data**: 2025-10-21

---

## Contexto Estratégico

### Problema Atual

O AIOS-FULLSTACK possui:
- ✅ **11 agentes especializados** (aios-master, analyst, pm, architect, etc.)
- ✅ **Sistema de Minds** em `outputs/minds/` com 38+ personalidades
- ✅ **Pedro Valério Mind** completa com 60+ artifacts cognitivos
- ✅ **Hybrid-Ops expansion pack** que usa PV Mind para validação

**PORÉM:**
- ❌ Não captura decisões tomadas durante ciclos de desenvolvimento
- ❌ Não acumula padrões de decisão sistematicamente
- ❌ Não permite que a Mind evolua com base em experiência real
- ❌ Desenvolvedores inexperientes não podem consultar histórico de decisões

### Oportunidade

Criar um **Decision Analysis Layer** que:
1. **Captura** decisões pós-ciclo de desenvolvimento
2. **Analisa** padrões usando o prompt de análise estruturado
3. **Armazena** em estrutura acumulativa na Mind
4. **Evolui** a Mind Pedro Valério com dados reais
5. **Permite** que outros devs consultem decisões passadas

---

## Arquitetura Proposta

### 1. Estrutura de Diretórios

```
aios-fullstack/
├── aios-core/
│   ├── agents/
│   │   ├── aios-decision-analyst.md       # NOVO: Agente de análise
│   │   └── aios-mind-consultant.md        # NOVO: Consultor de Mind
│   ├── tasks/
│   │   ├── capture-decisions.md           # NOVO: Captura pós-ciclo
│   │   ├── analyze-decision-style.md      # NOVO: Análise estruturada
│   │   └── consult-mind.md                # NOVO: Consulta histórico
│   └── workflows/
│       └── decision-evolution-cycle.yaml  # NOVO: Workflow completo
│
├── outputs/
│   └── minds/
│       └── pedro_valerio/
│           ├── artifacts/                 # Existente (60+ files)
│           ├── decisions/                 # NOVO: Histórico de decisões
│           │   ├── analyses/              # Análises individuais
│           │   │   ├── 2025-10-21_story-1-15.json
│           │   │   ├── 2025-10-22_epic-2-phase-1.json
│           │   │   └── ...
│           │   ├── evolution/             # Evolução temporal
│           │   │   ├── timeline.json      # Linha do tempo
│           │   │   ├── pattern-shifts.json # Mudanças de padrão
│           │   │   └── confidence-growth.json
│           │   └── aggregated/            # Dados consolidados
│           │       ├── decision-profile-current.json
│           │       ├── decision-profile-history.json
│           │       └── heuristics-learned.json
│           ├── metadata.yaml              # Existente
│           └── system_prompts/            # Existente
│               └── System_Prompt.md       # Auto-atualiza com insights
│
└── expansion-packs/
    └── decision-analysis/                 # NOVO: Expansion pack dedicado
        ├── config.yaml
        ├── agents/
        │   ├── decision-analyst.md
        │   └── mind-consultant.md
        ├── tasks/
        │   ├── post-cycle-capture.md
        │   ├── analyze-style.md
        │   └── query-mind.md
        ├── templates/
        │   ├── decision-analysis-prompt.md  # Prompt estruturado
        │   └── consultation-response.md
        ├── tools/
        │   ├── decision-capturer.js
        │   ├── pattern-analyzer.js
        │   └── mind-query-engine.js
        └── USER-GUIDE.md
```

---

## Componentes do Sistema

### 2.1 Decision Analysis Prompt (Template)

Localização: `expansion-packs/decision-analysis/templates/decision-analysis-prompt.md`

```markdown
# OBJETIVO
Mapear estilo de decisão com base EXCLUSIVA no histórico do ciclo atual.

# ENTREGAS
1) AXES → 10 eixos (speed_vs_rigor, risk_tolerance, etc.) com:
   - assessment, signals, evidence (3-7 citações), confidence 0-5
2) HEURÍSTICAS → 3-7 regras observadas
3) STOP-RULES & TRIGGERS → Quando para/reavaliar
4) BIAS & RISCOS → 3 vieses + mitigação
5) CONTRATO DE COLABORAÇÃO → 5 regras imperativas

# FORMATO (JSON obrigatório)
{
  "cycle_metadata": {
    "cycle_id": "story-1.15-hybrid-ops-migration",
    "start_date": "2025-01-20",
    "end_date": "2025-01-20",
    "duration_hours": 2,
    "story_points": 5
  },
  "axes": { /* 10 eixos */ },
  "heuristics": [ /* 3-7 regras */ ],
  "stop_rules": [ /* quando parar */ ],
  "reversal_triggers": [ /* gatilhos de reversão */ ],
  "bias_and_risks": [ /* 3 vieses */ ],
  "collab_contract": [ /* 5 regras */ ],
  "unknowns": [ /* inconclusivos */ ],
  "questions_max_3": [ /* 3 perguntas */ ]
}
```

### 2.2 Decision Capturer Tool

Localização: `expansion-packs/decision-analysis/tools/decision-capturer.js`

```javascript
/**
 * @fileoverview Decision Capturer
 * Captura contexto de ciclo de desenvolvimento para análise posterior
 */

class DecisionCapturer {
  constructor() {
    this.mindPath = path.resolve(__dirname, '../../../outputs/minds/pedro_valerio');
    this.decisionsPath = path.join(this.mindPath, 'decisions');
  }

  /**
   * Captura contexto do ciclo atual
   * @param {Object} cycleContext - Metadados do ciclo
   * @returns {Promise<string>} - ID da captura
   */
  async captureCycle(cycleContext) {
    const captureId = `${cycleContext.date}_${cycleContext.storyId}`;

    // Coletar evidências
    const evidence = await this.collectEvidence({
      gitLog: await this.getGitLog(cycleContext.startCommit, cycleContext.endCommit),
      storyFile: await this.readStoryFile(cycleContext.storyId),
      toolCalls: await this.getToolCallHistory(),
      chatHistory: cycleContext.chatHistory,
      filesModified: await this.getFilesModified()
    });

    // Preparar contexto para análise
    const analysisContext = {
      cycle_id: captureId,
      metadata: cycleContext,
      evidence: evidence,
      captured_at: new Date().toISOString()
    };

    // Salvar contexto
    const outputPath = path.join(
      this.decisionsPath,
      'analyses',
      `${captureId}.json`
    );

    await fs.writeFile(
      outputPath,
      JSON.stringify(analysisContext, null, 2)
    );

    return captureId;
  }

  /**
   * Executa análise estruturada usando o prompt template
   */
  async analyzeDecisions(captureId) {
    const contextPath = path.join(
      this.decisionsPath,
      'analyses',
      `${captureId}.json`
    );

    const context = JSON.parse(await fs.readFile(contextPath, 'utf8'));

    // Carregar prompt template
    const promptTemplate = await this.loadPromptTemplate();

    // Renderizar prompt com evidências
    const analysisPrompt = this.renderPrompt(promptTemplate, context.evidence);

    // LLM call seria aqui (via AIOS agent)
    // Por enquanto, retorna estrutura para agente preencher
    return {
      captureId,
      promptForAgent: analysisPrompt,
      outputPath: contextPath.replace('.json', '_analysis.json')
    };
  }
}

module.exports = { DecisionCapturer };
```

### 2.3 Pattern Analyzer Tool

Localização: `expansion-packs/decision-analysis/tools/pattern-analyzer.js`

```javascript
/**
 * @fileoverview Pattern Analyzer
 * Analisa padrões ao longo de múltiplas análises de decisão
 */

class PatternAnalyzer {
  constructor() {
    this.decisionsPath = path.resolve(
      __dirname,
      '../../../outputs/minds/pedro_valerio/decisions'
    );
  }

  /**
   * Agrega análises e detecta mudanças de padrão
   */
  async detectPatternShifts() {
    const analyses = await this.loadAllAnalyses();

    // Ordenar por data
    const timeline = analyses.sort((a, b) =>
      new Date(a.cycle_metadata.end_date) - new Date(b.cycle_metadata.end_date)
    );

    // Detectar shifts em cada eixo
    const shifts = {};
    const axes = [
      'speed_vs_rigor',
      'risk_tolerance',
      'yagni_vs_overengineering',
      // ... outros 7 eixos
    ];

    for (const axis of axes) {
      shifts[axis] = this.detectAxisShift(timeline, axis);
    }

    // Detectar novas heurísticas emergentes
    const heuristicEvolution = this.trackHeuristicEvolution(timeline);

    return {
      pattern_shifts: shifts,
      heuristic_evolution: heuristicEvolution,
      confidence_trends: this.calculateConfidenceTrends(timeline),
      analyzed_cycles: timeline.length,
      date_range: {
        first: timeline[0].cycle_metadata.start_date,
        last: timeline[timeline.length - 1].cycle_metadata.end_date
      }
    };
  }

  /**
   * Detecta mudança de padrão em eixo específico
   */
  detectAxisShift(timeline, axisName) {
    const assessments = timeline.map(analysis => ({
      date: analysis.cycle_metadata.end_date,
      assessment: analysis.axes[axisName].assessment,
      confidence: analysis.axes[axisName].confidence,
      signals: analysis.axes[axisName].signals
    }));

    // Análise de tendência (simplificada)
    const windows = this.slidingWindow(assessments, 3);
    const shifts = [];

    for (let i = 1; i < windows.length; i++) {
      const prev = windows[i - 1];
      const curr = windows[i];

      // Detectar mudança significativa
      if (this.isSignificantChange(prev, curr)) {
        shifts.push({
          detected_at: curr[curr.length - 1].date,
          from_pattern: this.summarizePattern(prev),
          to_pattern: this.summarizePattern(curr),
          confidence_delta: this.calculateConfidenceDelta(prev, curr)
        });
      }
    }

    return shifts;
  }

  /**
   * Rastreia evolução de heurísticas
   */
  trackHeuristicEvolution(timeline) {
    const allHeuristics = new Map();

    for (const analysis of timeline) {
      for (const heuristic of analysis.heuristics) {
        const key = this.normalizeHeuristicName(heuristic.name);

        if (!allHeuristics.has(key)) {
          allHeuristics.set(key, {
            name: heuristic.name,
            first_observed: analysis.cycle_metadata.end_date,
            occurrences: 0,
            descriptions: [],
            evidence_count: 0
          });
        }

        const entry = allHeuristics.get(key);
        entry.occurrences++;
        entry.descriptions.push(heuristic.description);
        entry.evidence_count += heuristic.evidence.length;
        entry.last_observed = analysis.cycle_metadata.end_date;
      }
    }

    // Ordenar por frequência
    return Array.from(allHeuristics.values())
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Calcula tendências de confiança ao longo do tempo
   */
  calculateConfidenceTrends(timeline) {
    const trends = {};

    const axes = Object.keys(timeline[0].axes);

    for (const axis of axes) {
      const confidences = timeline.map(a => ({
        date: a.cycle_metadata.end_date,
        confidence: a.axes[axis].confidence
      }));

      trends[axis] = {
        current: confidences[confidences.length - 1].confidence,
        average: confidences.reduce((sum, c) => sum + c.confidence, 0) / confidences.length,
        trend: this.calculateTrend(confidences),
        data_points: confidences.length
      };
    }

    return trends;
  }
}

module.exports = { PatternAnalyzer };
```

### 2.4 Mind Query Engine

Localização: `expansion-packs/decision-analysis/tools/mind-query-engine.js`

```javascript
/**
 * @fileoverview Mind Query Engine
 * Permite que desenvolvedores consultem decisões passadas da Mind
 */

class MindQueryEngine {
  constructor() {
    this.decisionsPath = path.resolve(
      __dirname,
      '../../../outputs/minds/pedro_valerio/decisions'
    );
  }

  /**
   * Consulta decisões por contexto similar
   */
  async queryBySimilarContext(query) {
    const {
      storyType,      // e.g., "migration", "new-feature", "refactoring"
      complexity,     // e.g., "high", "medium", "low"
      techStack,      // e.g., ["node", "react", "clickup-api"]
      decisionArea    // e.g., "architecture", "testing", "documentation"
    } = query;

    const analyses = await this.loadAllAnalyses();

    // Filtrar análises relevantes
    const relevant = analyses.filter(analysis => {
      return this.matchesContext(analysis, query);
    });

    // Rankear por relevância
    const ranked = this.rankByRelevance(relevant, query);

    // Extrair insights
    return {
      total_matches: ranked.length,
      top_decisions: ranked.slice(0, 5).map(a => ({
        cycle_id: a.cycle_metadata.cycle_id,
        date: a.cycle_metadata.end_date,
        summary: this.summarizeDecision(a, decisionArea),
        relevant_heuristics: this.extractRelevantHeuristics(a, decisionArea),
        confidence: a.axes[this.mapToAxis(decisionArea)]?.confidence || 0
      })),
      common_patterns: this.extractCommonPatterns(ranked, decisionArea),
      recommendations: this.generateRecommendations(ranked, query)
    };
  }

  /**
   * Consulta heurísticas específicas
   */
  async queryHeuristics(filter = {}) {
    const aggregated = await this.loadAggregatedData();

    let heuristics = aggregated.heuristics_learned || [];

    // Aplicar filtros
    if (filter.minOccurrences) {
      heuristics = heuristics.filter(h => h.occurrences >= filter.minOccurrences);
    }

    if (filter.category) {
      heuristics = heuristics.filter(h =>
        this.categorizeHeuristic(h).includes(filter.category)
      );
    }

    return {
      total: heuristics.length,
      heuristics: heuristics.map(h => ({
        name: h.name,
        description: h.descriptions[h.descriptions.length - 1], // Última versão
        occurrences: h.occurrences,
        confidence: this.calculateHeuristicConfidence(h),
        first_observed: h.first_observed,
        last_observed: h.last_observed,
        categories: this.categorizeHeuristic(h)
      }))
    };
  }

  /**
   * Gera recomendações baseadas em histórico
   */
  generateRecommendations(analyses, currentContext) {
    const recommendations = [];

    // Recomendação 1: Padrão mais bem-sucedido
    const successfulPattern = this.identifySuccessfulPattern(analyses);
    if (successfulPattern) {
      recommendations.push({
        type: 'pattern_replication',
        title: 'Replicar Padrão Bem-Sucedido',
        description: successfulPattern.description,
        evidence: successfulPattern.evidence,
        confidence: successfulPattern.confidence
      });
    }

    // Recomendação 2: Evitar armadilhas conhecidas
    const knownPitfalls = this.identifyPitfalls(analyses);
    if (knownPitfalls.length > 0) {
      recommendations.push({
        type: 'avoid_pitfall',
        title: 'Evitar Armadilhas Conhecidas',
        pitfalls: knownPitfalls,
        mitigation_strategies: this.extractMitigations(analyses)
      });
    }

    // Recomendação 3: Ajuste de threshold
    const thresholdSuggestion = this.suggestThresholdAdjustment(analyses, currentContext);
    if (thresholdSuggestion) {
      recommendations.push(thresholdSuggestion);
    }

    return recommendations;
  }
}

module.exports = { MindQueryEngine };
```

---

## Workflow de Uso

### 3.1 Pós-Ciclo de Desenvolvimento (Automático)

```yaml
# expansion-packs/decision-analysis/workflows/post-cycle-capture.yaml
workflow:
  name: "Post-Cycle Decision Capture"
  trigger: "manual"  # Executado por comando *capture-decisions

  steps:
    - id: detect_cycle_end
      task: detect-completed-cycle
      agent: aios-decision-analyst
      description: "Detectar fim de ciclo (story completa, PR merged, etc.)"

    - id: gather_evidence
      task: gather-cycle-evidence
      agent: aios-decision-analyst
      description: "Coletar git log, chat history, tool calls, files modified"
      depends_on: [detect_cycle_end]

    - id: execute_analysis
      task: analyze-decision-style
      agent: aios-decision-analyst
      description: "Executar prompt de análise estruturado"
      depends_on: [gather_evidence]
      inputs:
        prompt_template: "templates/decision-analysis-prompt.md"
        evidence: "${gather_evidence.output}"

    - id: save_analysis
      task: save-decision-analysis
      agent: aios-decision-analyst
      description: "Salvar análise em decisions/analyses/"
      depends_on: [execute_analysis]

    - id: update_aggregated
      task: update-aggregated-profile
      agent: aios-decision-analyst
      description: "Atualizar decision-profile-current.json"
      depends_on: [save_analysis]

    - id: detect_patterns
      task: detect-pattern-shifts
      agent: aios-decision-analyst
      description: "Detectar mudanças de padrão"
      depends_on: [update_aggregated]

    - id: evolve_mind
      task: evolve-system-prompt
      agent: aios-decision-analyst
      description: "Atualizar System_Prompt.md com novos insights"
      depends_on: [detect_patterns]
      elicit: true
      approval_required: true
```

### 3.2 Consulta por Desenvolvedores (Sob Demanda)

```yaml
# expansion-packs/decision-analysis/workflows/mind-consultation.yaml
workflow:
  name: "Consult Pedro Valério Mind"
  trigger: "command"  # *consult-mind

  steps:
    - id: understand_query
      task: elicit-consultation-query
      agent: aios-mind-consultant
      description: "Entender contexto da consulta do desenvolvedor"
      elicit: true
      questions:
        - "Qual o tipo de decisão? (architecture/testing/docs/workflow/other)"
        - "Qual a complexidade? (low/medium/high)"
        - "Tech stack envolvida? (lista separada por vírgulas)"
        - "Contexto adicional? (texto livre)"

    - id: search_similar
      task: query-similar-decisions
      agent: aios-mind-consultant
      description: "Buscar decisões similares no histórico"
      depends_on: [understand_query]

    - id: extract_heuristics
      task: extract-relevant-heuristics
      agent: aios-mind-consultant
      description: "Extrair heurísticas aplicáveis"
      depends_on: [search_similar]

    - id: generate_recommendations
      task: generate-recommendations
      agent: aios-mind-consultant
      description: "Gerar recomendações baseadas em histórico"
      depends_on: [extract_heuristics]

    - id: present_insights
      task: present-consultation-results
      agent: aios-mind-consultant
      description: "Apresentar insights formatados"
      depends_on: [generate_recommendations]
      output_format: "markdown"
```

---

## Fluxo Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DECISION EVOLUTION CYCLE                         │
└─────────────────────────────────────────────────────────────────────┘

FASE 1: DESENVOLVIMENTO NORMAL
┌──────────────────┐
│ Dev trabalha em  │
│ Story 1.15       │──┐
│ (2 horas)        │  │
└──────────────────┘  │
                      │
                      ├─ git commits
                      ├─ tool calls
                      ├─ chat history
                      └─ files modified

FASE 2: CAPTURA (Automática via comando)
┌──────────────────┐
│ *capture-        │
│  decisions       │──→ DecisionCapturer.captureCycle()
└──────────────────┘         │
                             ↓
                    ┌─────────────────────┐
                    │ Evidence Package    │
                    │ - git log           │
                    │ - story file        │
                    │ - tool history      │
                    │ - chat context      │
                    └─────────────────────┘
                             │
                             ↓
                    decisions/analyses/
                    2025-10-21_story-1-15.json

FASE 3: ANÁLISE (LLM via agent)
┌──────────────────┐
│ @aios-decision-  │
│  analyst         │──→ Executa prompt estruturado
└──────────────────┘         │
                             ↓
                    ┌─────────────────────┐
                    │ Decision Analysis   │
                    │ {                   │
                    │   axes: {...},      │
                    │   heuristics: [...],│
                    │   stop_rules: [...] │
                    │ }                   │
                    └─────────────────────┘
                             │
                             ↓
                    decisions/analyses/
                    2025-10-21_story-1-15_analysis.json

FASE 4: AGREGAÇÃO (Automática)
┌──────────────────┐
│ PatternAnalyzer. │
│ detectPattern-   │──→ Analisa N análises
│ Shifts()         │         │
└──────────────────┘         ↓
                    ┌─────────────────────┐
                    │ Aggregated Data     │
                    │ - pattern_shifts    │
                    │ - heuristic_evolution│
                    │ - confidence_trends │
                    └─────────────────────┘
                             │
                             ↓
                    decisions/aggregated/
                    decision-profile-current.json

FASE 5: EVOLUÇÃO DA MIND (Semi-automática)
┌──────────────────┐
│ User aprova      │
│ atualização      │──→ System_Prompt.md auto-update
└──────────────────┘         │
                             ↓
                    ┌─────────────────────┐
                    │ System Prompt v2.1  │
                    │ [Seção Nova]        │
                    │ ## Heurísticas      │
                    │ Aprendidas (2025)   │
                    │ - Completude Antes  │
                    │   de Entrega (95%)  │
                    └─────────────────────┘

═══════════════════════════════════════════════════════════════

CONSULTA POR OUTROS DEVS
┌──────────────────┐
│ Junior Dev:      │
│ *consult-mind    │
│ "Como Pedro      │──→ @aios-mind-consultant
│  decide sobre    │         │
│  testing?"       │         ↓
└──────────────────┘  ┌─────────────────────┐
                      │ MindQueryEngine     │
                      │ .queryBySimilar-    │
                      │  Context()          │
                      └─────────────────────┘
                               │
                               ↓
                      ┌─────────────────────┐
                      │ Response:           │
                      │ - 5 decisões similar│
                      │ - 3 heurísticas     │
                      │ - Recommendations   │
                      │ - Confidence: 4.2/5 │
                      └─────────────────────┘
```

---

## Estrutura de Dados

### 4.1 Decision Analysis Output (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["cycle_metadata", "axes", "heuristics", "collab_contract"],
  "properties": {
    "cycle_metadata": {
      "type": "object",
      "required": ["cycle_id", "start_date", "end_date"],
      "properties": {
        "cycle_id": { "type": "string" },
        "start_date": { "type": "string", "format": "date" },
        "end_date": { "type": "string", "format": "date" },
        "duration_hours": { "type": "number" },
        "story_points": { "type": "number" },
        "story_id": { "type": "string" },
        "epic_id": { "type": "string" },
        "agents_used": { "type": "array", "items": { "type": "string" } }
      }
    },
    "axes": {
      "type": "object",
      "properties": {
        "speed_vs_rigor": { "$ref": "#/definitions/axis" },
        "risk_tolerance": { "$ref": "#/definitions/axis" },
        "yagni_vs_overengineering": { "$ref": "#/definitions/axis" },
        "testing_style": { "$ref": "#/definitions/axis" },
        "refactor_threshold": { "$ref": "#/definitions/axis" },
        "docs_preference": { "$ref": "#/definitions/axis" },
        "ambiguity_tolerance": { "$ref": "#/definitions/axis" },
        "decision_reversibility": { "$ref": "#/definitions/axis" },
        "autonomy_expectation": { "$ref": "#/definitions/axis" },
        "communication_style": { "$ref": "#/definitions/axis" }
      }
    },
    "heuristics": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "description", "evidence"],
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "evidence": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "stop_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["rule", "evidence"],
        "properties": {
          "rule": { "type": "string" },
          "evidence": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "reversal_triggers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["trigger", "evidence"],
        "properties": {
          "trigger": { "type": "string" },
          "evidence": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "bias_and_risks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["risk", "mitigation", "evidence"],
        "properties": {
          "risk": { "type": "string" },
          "mitigation": { "type": "string" },
          "evidence": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "collab_contract": {
      "type": "array",
      "minItems": 5,
      "maxItems": 5,
      "items": { "type": "string" }
    },
    "unknowns": {
      "type": "array",
      "items": { "type": "string" }
    },
    "questions_max_3": {
      "type": "array",
      "maxItems": 3,
      "items": { "type": "string" }
    }
  },
  "definitions": {
    "axis": {
      "type": "object",
      "required": ["assessment", "signals", "evidence", "confidence"],
      "properties": {
        "assessment": { "type": "string" },
        "signals": { "type": "array", "items": { "type": "string" } },
        "evidence": {
          "type": "array",
          "minItems": 3,
          "maxItems": 7,
          "items": { "type": "string" }
        },
        "confidence": {
          "type": "integer",
          "minimum": 0,
          "maximum": 5
        }
      }
    }
  }
}
```

### 4.2 Aggregated Decision Profile

```json
{
  "profile_version": "2.1",
  "generated_at": "2025-10-21T14:30:00Z",
  "total_cycles_analyzed": 15,
  "date_range": {
    "first_analysis": "2025-01-20",
    "last_analysis": "2025-10-21"
  },
  "axes_summary": {
    "speed_vs_rigor": {
      "dominant_pattern": "Strong rigor bias - prefers exhaustive analysis",
      "confidence_average": 4.8,
      "consistency": 0.92,
      "last_shift_detected": null
    },
    "risk_tolerance": {
      "dominant_pattern": "Conservative with strong validation emphasis",
      "confidence_average": 5.0,
      "consistency": 0.95,
      "last_shift_detected": null
    }
    /* ... outros 8 eixos */
  },
  "top_heuristics": [
    {
      "name": "Completude Antes de Entrega",
      "occurrences": 14,
      "confidence": 0.95,
      "description_consensus": "Nunca entregue versões parciais - sempre complete análise total, documentação exaustiva e validação completa",
      "first_observed": "2025-01-20",
      "categories": ["quality", "delivery", "completeness"]
    },
    {
      "name": "Estrutura Determina Confiança",
      "occurrences": 13,
      "confidence": 0.92,
      "description_consensus": "Use padrões estabelecidos - estruturas formais aumentam confiança e qualidade percebida",
      "first_observed": "2025-01-20",
      "categories": ["architecture", "quality", "standards"]
    }
    /* ... mais heurísticas */
  ],
  "common_stop_rules": [
    {
      "rule": "Pare quando todos AC estiverem [x] e validação completa executada",
      "frequency": 15,
      "reliability": 1.0
    }
  ],
  "known_biases": [
    {
      "bias": "Over-documentation bias",
      "occurrences": 8,
      "mitigation_success_rate": 0.6,
      "recommended_mitigation": "Estabeleça threshold de 'good enough' com versões iterativas"
    }
  ],
  "collaboration_contract_stable": [
    "Entregue soluções completas desde o início",
    "Documente exaustivamente com múltiplos formatos",
    "Implemente múltiplas camadas de validação",
    "Use padrões estabelecidos e naming hierarchical",
    "Mostre raciocínio com evidências rastreáveis"
  ]
}
```

---

## Casos de Uso

### UC1: Desenvolvedor Júnior Consulta Decisões de Testing

**Cenário**: Junior dev precisa decidir quantos testes escrever para uma feature

**Fluxo**:
```bash
# No IDE
@aios-mind-consultant
*consult-mind

# Agent pergunta:
"Qual o tipo de decisão?"
> testing

"Qual a complexidade da feature?"
> medium

"Tech stack?"
> node, jest, integration-tests

# Agent responde:
┌─────────────────────────────────────────────────────────┐
│ CONSULTA À MIND PEDRO VALÉRIO                           │
├─────────────────────────────────────────────────────────┤
│ 📊 DECISÕES SIMILARES (5 encontradas)                   │
│                                                          │
│ 1️⃣ Story 1.15 - Hybrid-Ops Migration (2025-01-20)      │
│    - 29 testes em 4 suites                              │
│    - Cobertura: unit + integration + performance        │
│    - Confidence: 5/5                                     │
│                                                          │
│ 2️⃣ Story 1.3 - ClickUp Engineer (2025-01-15)           │
│    - 18 testes + edge cases                             │
│    - Performance benchmarks obrigatórios                │
│    - Confidence: 4/5                                     │
│                                                          │
│ 🎯 HEURÍSTICAS RELEVANTES                               │
│                                                          │
│ • "Comprehensive Testing" (14/15 ocorrências)           │
│   → Múltiplas camadas: unit + integration + performance │
│   → Edge cases sempre cobertos                          │
│   → Confidence: 95%                                      │
│                                                          │
│ • "Performance as Validation Gate" (12/15)              │
│   → Benchmarks com thresholds numéricos                 │
│   → <500ms loading, <10ms cached                        │
│   → Confidence: 90%                                      │
│                                                          │
│ ✅ RECOMENDAÇÕES                                         │
│                                                          │
│ 1. Escreva 15-20 testes mínimo para medium complexity   │
│ 2. Inclua: 60% unit + 30% integration + 10% performance │
│ 3. Defina thresholds numéricos claros                   │
│ 4. Cubra edge cases explicitamente                      │
│ 5. Rode full suite antes de marcar story como done      │
│                                                          │
│ 📈 CONFIANÇA DESTA RECOMENDAÇÃO: 4.2/5                  │
│    (baseado em 5 decisões similares)                    │
└─────────────────────────────────────────────────────────┘
```

### UC2: Evolução Automática da Mind

**Cenário**: Após 10 análises, sistema detecta nova heurística emergente

**Fluxo**:
```bash
# Automático após 10º ciclo
PatternAnalyzer detecta:
- Nova heurística: "Backup Before Structural Change"
- Aparece em 9/10 últimos ciclos
- Confidence: 0.9

# Agent propõe atualização:
┌─────────────────────────────────────────────────────────┐
│ 🧠 EVOLUÇÃO DA MIND DETECTADA                           │
├─────────────────────────────────────────────────────────┤
│ Nova heurística candidata:                              │
│                                                          │
│ NOME: "Backup Before Structural Change"                 │
│ DESCRIÇÃO: "Sempre crie backup completo antes de        │
│            mudanças estruturais (migrations, refactors,  │
│            reorganizações)"                              │
│                                                          │
│ EVIDÊNCIAS:                                              │
│ - Story 1.15: hybrid-ops.legacy/ backup                 │
│ - Story 2.3: .backups/memory-integration/               │
│ - Story 3.1: rollback instructions documented           │
│ - [... 6 mais]                                           │
│                                                          │
│ FREQUÊNCIA: 9/10 últimos ciclos (90%)                   │
│ CONFIDENCE: 4.5/5                                        │
│                                                          │
│ ❓ Adicionar ao System_Prompt.md?                       │
│    [SIM] [NÃO] [VER DIFF]                               │
└─────────────────────────────────────────────────────────┘

# User escolhe [VER DIFF]:
┌─────────────────────────────────────────────────────────┐
│ DIFF: system_prompts/System_Prompt.md                   │
├─────────────────────────────────────────────────────────┤
│  ## Heurísticas de Decisão (Aprendidas)                 │
│                                                          │
│  ### Completude Antes de Entrega (Confidence: 95%)      │
│  Nunca entregue versões parciais...                     │
│                                                          │
│+ ### Backup Before Structural Change (Confidence: 90%)  │
│+ Sempre crie backup completo antes de mudanças          │
│+ estruturais. Exemplos:                                 │
│+ - Migrations: backup legacy version                    │
│+ - Refactorings: .backups/ directory                    │
│+ - Reorganizações: document rollback procedure          │
│+ Evidências: Stories 1.15, 2.3, 3.1, ... (9/10)        │
│                                                          │
│  ### Estrutura Determina Confiança (Confidence: 92%)    │
│  Use padrões estabelecidos...                           │
└─────────────────────────────────────────────────────────┘

# User aprova → System_Prompt.md atualizado automaticamente
```

---

## Roadmap de Implementação

### Fase 1: Foundation (Sprint 1 - 2 semanas)

**Story 1.1: Decision Capturer Infrastructure**
- [ ] Criar `expansion-packs/decision-analysis/` structure
- [ ] Implementar `DecisionCapturer` class
- [ ] Criar `decisions/` directory structure em pedro_valerio Mind
- [ ] Implementar `collectEvidence()` method
- [ ] Testes unitários

**Story 1.2: Analysis Prompt Template**
- [ ] Criar `templates/decision-analysis-prompt.md`
- [ ] Definir JSON schema para output
- [ ] Criar validador de schema
- [ ] Documentar uso do template

**Story 1.3: Decision Analyst Agent**
- [ ] Criar `agents/aios-decision-analyst.md`
- [ ] Implementar comando `*capture-decisions`
- [ ] Implementar comando `*analyze-style`
- [ ] Integrar com DecisionCapturer
- [ ] Testes de integração

### Fase 2: Pattern Analysis (Sprint 2 - 2 semanas)

**Story 2.1: Pattern Analyzer**
- [ ] Implementar `PatternAnalyzer` class
- [ ] Método `detectPatternShifts()`
- [ ] Método `trackHeuristicEvolution()`
- [ ] Método `calculateConfidenceTrends()`
- [ ] Testes com dados sintéticos

**Story 2.2: Aggregation System**
- [ ] Implementar geração de `decision-profile-current.json`
- [ ] Implementar `decision-profile-history.json` (timeline)
- [ ] Sistema de versionamento de profiles
- [ ] Migration scripts para formato antigo → novo

**Story 2.3: Mind Evolution Workflow**
- [ ] Workflow `evolve-system-prompt`
- [ ] Diff generator para System_Prompt.md
- [ ] Approval mechanism
- [ ] Auto-update com backup

### Fase 3: Query System (Sprint 3 - 2 semanas)

**Story 3.1: Mind Query Engine**
- [ ] Implementar `MindQueryEngine` class
- [ ] Método `queryBySimilarContext()`
- [ ] Método `queryHeuristics()`
- [ ] Método `generateRecommendations()`
- [ ] Search indexing para performance

**Story 3.2: Mind Consultant Agent**
- [ ] Criar `agents/aios-mind-consultant.md`
- [ ] Implementar comando `*consult-mind`
- [ ] Workflow interativo de consulta
- [ ] Response formatting (markdown)
- [ ] Testes de UX

**Story 3.3: Consultation Interface**
- [ ] Templates de resposta
- [ ] Confidence scoring para recomendações
- [ ] Evidence linking (clickable references)
- [ ] Export consultation results

### Fase 4: Integration & Docs (Sprint 4 - 1 semana)

**Story 4.1: AIOS Integration**
- [ ] Adicionar agents ao `aios-core/agents/`
- [ ] Criar tasks em `aios-core/tasks/`
- [ ] Workflow YAML files
- [ ] Update `.claude/CLAUDE.md` com novos comandos

**Story 4.2: Documentation**
- [ ] USER-GUIDE.md para expansion pack
- [ ] API documentation
- [ ] Tutorial passo-a-passo
- [ ] Video walkthrough (opcional)

**Story 4.3: Validation & Refinement**
- [ ] Executar 5 ciclos reais de captura
- [ ] Validar qualidade das análises
- [ ] Refinar prompts baseado em resultados
- [ ] Performance optimization

---

## Métricas de Sucesso

### Quantitativas

1. **Cobertura de Ciclos**
   - Meta: 80% dos ciclos de desenvolvimento capturados
   - Medição: `decisions/analyses/` file count vs git commits

2. **Qualidade de Análise**
   - Meta: Confidence média ≥ 4.0/5.0 em todos os eixos
   - Medição: Average confidence score across all analyses

3. **Heurística Stability**
   - Meta: Top 5 heurísticas permanecem estáveis por 3+ meses
   - Medição: Heuristic ranking changes over time

4. **Consultation Usage**
   - Meta: 5+ consultas por semana após 1 mês
   - Medição: `*consult-mind` command invocations

5. **Mind Evolution Rate**
   - Meta: 1-2 novas heurísticas por mês (não mais que isso - sign of instability)
   - Medição: System_Prompt.md update frequency

### Qualitativas

1. **Accuracy of Recommendations**
   - Desenvolvedores seguem recomendações da Mind? (survey)
   - Recomendações levam a melhores decisões? (retrospective)

2. **Developer Confidence**
   - Júniors sentem-se mais confiantes com consultas à Mind? (survey)
   - Redução de re-trabalho após consultar Mind? (metrics)

3. **Mind Authenticity**
   - Heurísticas capturadas refletem autenticamente PV? (validation sessions)
   - System_Prompt evolution mantém coerência? (review)

---

## Riscos e Mitigações

### Risco 1: Overfitting to Recent Decisions

**Descrição**: Sistema pode dar peso excessivo a decisões recentes

**Impacto**: Alto - Mind pode "esquecer" padrões históricos importantes

**Mitigação**:
- Usar weighted average com decay function
- Manter `decision-profile-history.json` separado
- Alertar user quando detectar shift >30% em confidence
- Implementar "stability score" que penaliza mudanças rápidas

### Risco 2: Analysis Prompt Drift

**Descrição**: Prompt de análise pode ficar desalinhado com evolução do AIOS

**Impacto**: Médio - Análises podem perder relevância

**Mitigação**:
- Versionar prompt template
- Re-analisar ciclos antigos quando prompt mudar (opcional)
- Manter changelog de prompt changes
- Validation sessions periódicas com PV

### Risco 3: Storage Growth

**Descrição**: `decisions/` directory pode crescer indefinidamente

**Impacto**: Baixo - Performance degradation após 100+ analyses

**Mitigação**:
- Implement archival strategy (move analyses >6 months to `archived/`)
- Compress old analyses to JSON.gz
- Manter aggregated profiles sempre atualizados (mais lightweight)
- Query engine trabalha primariamente com aggregated data

### Risco 4: False Recommendations

**Descrição**: Sistema pode sugerir padrões que não se aplicam ao novo contexto

**Impacto**: Alto - Developer trust erosion

**Mitigação**:
- Sempre mostrar confidence score
- Incluir "evidence" clickable para verificação
- Disclaimer: "Baseado em N decisões similares - adapte ao contexto"
- User feedback loop (👍/👎 em recomendações)

### Risco 5: Privacy Concerns

**Descrição**: Decisões podem conter informação sensível do projeto

**Impacto**: Médio - Leakage de detalhes proprietários

**Mitigação**:
- Sanitize evidence antes de salvar (remover secrets, IPs, etc.)
- Flag sensitive cycles para não incluir em consultas públicas
- Encryption at rest para `decisions/` directory
- Access control se Mind for compartilhada

---

## Extensões Futuras

### Multi-User Minds

Permitir que outros usuários criem suas próprias Minds:

```
outputs/minds/
├── pedro_valerio/
│   └── decisions/
├── junior_dev_1/
│   └── decisions/
└── senior_dev_2/
    └── decisions/
```

Queries poderiam comparar estilos:
```bash
*compare-minds pedro_valerio senior_dev_2 --axis=testing_style
```

### Team Aggregated Mind

Criar "Team Mind" que agrega padrões da equipe:

```
outputs/minds/
└── team_allfluence/
    ├── decisions/
    │   └── aggregated/
    │       └── team-decision-profile.json
    └── members/
        ├── pedro_valerio.link
        ├── junior_dev_1.link
        └── senior_dev_2.link
```

### Predictive Recommendations

Usar ML para prever decisões antes do ciclo começar:

```bash
@aios-decision-analyst
*predict-decision --story=2.5 --context="new-feature, high-complexity, react"

# Output:
┌───────────────────────────────────────────────────┐
│ 🔮 PREDIÇÃO DE DECISÃO (Story 2.5)               │
├───────────────────────────────────────────────────┤
│ Baseado em 12 ciclos similares, prevejo:         │
│                                                    │
│ Testing Approach:                                  │
│ - 18-22 testes (80% probability)                  │
│ - Suites: unit + integration + e2e                │
│                                                    │
│ Documentation:                                     │
│ - Comprehensive docs esperados (90% probability)  │
│ - Inclua: user-guide + API reference              │
│                                                    │
│ Refactoring Threshold:                            │
│ - Likely large refactoring (75% probability)      │
│ - Backup + rollback plan recomendados             │
└───────────────────────────────────────────────────┘
```

### Cross-Project Learning

Se AIOS for usado em múltiplos projetos, agregar learnings:

```
global_minds/
└── pedro_valerio_cross_project/
    ├── project_a_decisions/
    ├── project_b_decisions/
    └── aggregated/
        └── cross-project-patterns.json
```

---

## Dependências

### Técnicas

- **Node.js** ≥18.0.0
- **YAML parser** (já existe em hybrid-ops)
- **JSON Schema validator**
- **Git CLI** (para git log parsing)
- **AIOS Core** v4.31.0+

### Arquiteturais

- **outputs/minds/** structure (existente)
- **Pedro Valério Mind** artifacts (60+ files existentes)
- **Hybrid-Ops expansion pack** (referência de implementação)
- **AIOS Agent System** (11 agents existentes)

### Opcionais

- **Search indexing** (Elasticsearch/MeiliSearch) para queries rápidas em 100+ analyses
- **ML library** (TensorFlow.js) para predictive recommendations futuras
- **Encryption library** (crypto-js) para sensitive decisions

---

## Conclusão

Este PRD define uma arquitetura completa para:

1. ✅ **Capturar** decisões de desenvolvimento automaticamente
2. ✅ **Analisar** padrões usando prompt estruturado
3. ✅ **Armazenar** em estrutura evolutiva na Mind
4. ✅ **Evoluir** System_Prompt.md com insights reais
5. ✅ **Consultar** histórico de decisões para orientação

### Benefícios Chave

- **Para Pedro Valério**: Mind que aprende e evolui com experiência real
- **Para Júniors**: Acesso a decisões validadas e recomendações confiáveis
- **Para AIOS**: Diferenciação competitiva (nenhum framework faz isso)
- **Para AllFluence**: Knowledge retention e team scalability

### Next Steps

1. **Aprovar PRD** (este documento)
2. **Criar Epic** em ClickUp: "Decision Analysis Integration"
3. **Fragmentar em Stories** (4 sprints = 13 stories)
4. **Começar Fase 1** (Decision Capturer Infrastructure)
5. **Validar com 5 ciclos reais** antes de continuar Fase 2

---

**Autor**: Claude (AIOS Decision Analyst)
**Reviewer**: Pedro Valério
**Status**: ⏳ Aguardando Aprovação
**Próximo Passo**: Review + Approval → Create Epic

