# Análise Arquitetural: Decision Analysis System - Core vs Expansion Pack

**Documento**: Decisão Arquitetural Crítica
**Data**: 2025-10-21
**Status**: 🔍 **EM ANÁLISE**
**Decisor**: Pedro Valério
**Contexto**: Integração do Decision Analysis System no AIOS-FULLSTACK

---

## Executive Summary

### Questão Central
**Onde deve residir o Decision Analysis System e Pedro Valério Mind?**

**Opção A**: `expansion-packs/decision-analysis/` (proposta inicial)
**Opção B**: `aios-core/` + workspace packages (memory, cognitive, etc.) ← **PROPOSTA DO USUÁRIO**

### Recomendação Preliminar
🎯 **ARQUITETURA HÍBRIDA**: Core cognitive infrastructure + pluggable minds

---

## 1. Análise de Precedentes no Framework

### 1.1 Estrutura Atual: Workspace Packages

O AIOS-FULLSTACK já possui **4 workspace packages nativos** que são parte fundamental:

```json
// aios-fullstack/package.json
"workspaces": [
  "aios-core",      // ✅ Core framework
  "memory",         // ✅ @aios-fullstack/memory (vector storage, semantic search)
  "security",       // ✅ @aios-fullstack/security (auth, audit, sanitizer)
  "performance",    // ✅ @aios-fullstack/performance (profiler, monitor, cache)
  "telemetry"       // ✅ @aios-fullstack/telemetry (analytics, error reporter)
]
```

**Características Compartilhadas**:
- ✅ Publicados como `@aios-fullstack/[package]`
- ✅ Versionados juntos (v4.31.0 em todos)
- ✅ Peer dependency de `@aios-fullstack/core`
- ✅ Infraestrutura **transversal** a todos agentes
- ✅ Exportados no package principal (`files: ["memory/", "performance/", ...]`)

### 1.2 Expansion Packs: Caso Hybrid-Ops

**Único expansion pack existente**: `hybrid-ops`

```json
// expansion-packs/hybrid-ops/package.json
{
  "name": "@aios-fullstack/hybrid-ops",
  "version": "1.0.0",
  "description": "Process Mapping with Pedro Valério's Mind Architecture"
}
```

**Características**:
- ❌ **NÃO** está em workspaces
- ❌ Versionamento independente (1.0.0 vs 4.31.0)
- ✅ Usa Pedro Valério Mind artifacts (`outputs/minds/pedro_valerio/`)
- ✅ Domain-specific (process mapping, ClickUp workflows)
- ✅ Opcional para usuários AIOS

### 1.3 Padrão Identificado

| Categoria | Localização | Características | Exemplos |
|-----------|-------------|-----------------|----------|
| **Core Infrastructure** | `workspace packages` | Transversal, sempre carregado, versionamento unificado | memory, security, performance, telemetry |
| **Domain Extensions** | `expansion-packs/` | Opcional, versionamento independente, domain-specific | hybrid-ops |
| **User Data** | `outputs/` | Artefatos gerados, minds, reports | minds/pedro_valerio/ |

---

## 2. Análise de Acoplamento e Dependências

### 2.1 Decision Analysis System - Natureza do Componente

**Pergunta**: O Decision Analysis é infraestrutura core ou extensão de domínio?

#### Análise Multi-Dimensional

| Dimensão | Core-Like ✅ | Extension-Like ❌ | Peso |
|----------|-------------|-------------------|------|
| **Reusabilidade** | Aplicável a qualquer desenvolvedor | Específico para Pedro Valério | 🔴 Extension |
| **Acoplamento** | Usado por todos 11 agentes | Usado apenas por decision-analyst | 🔴 Extension |
| **Lifecycle** | Precisa evoluir com framework | Evolui com Mind Pedro Valério | 🔴 Extension |
| **Abstração** | Genérico (DecisionCapturer abstrato) | Concreto (PedroValerioMind) | 🟡 Híbrido |
| **Persistence** | Infra de armazenamento de decisões | Dados específicos da Mind | 🟡 Híbrido |
| **Distribution** | Sempre instalado | Opt-in | 🔴 Extension |

#### Componentes Decompostos

| Componente | Classificação | Justificativa |
|------------|---------------|---------------|
| `DecisionCapturer` | 🟢 **CORE** | Infraestrutura genérica de captura |
| `PatternAnalyzer` | 🟢 **CORE** | Análise agnóstica de padrões |
| `MindStorage` | 🟢 **CORE** | Sistema abstrato de persistência |
| `PedroValerioMind` | 🔴 **EXTENSION** | Implementação específica |
| `decision-analyst agent` | 🟡 **HYBRID** | Agent genérico, mas com Mind plugável |
| `outputs/minds/pedro_valerio/` | 🔴 **USER DATA** | Artifacts do usuário |

### 2.2 Impacto em Dependências

#### Cenário A: Expansion Pack (Status Quo)

```
expansion-packs/decision-analysis/
  ↓ depende de
aios-core/ (agents, tasks, workflows)
  ↓ depende de
memory/ (vector storage)
  ↓ depende de
outputs/minds/pedro_valerio/ (user data)
```

**Grafo de Dependências**:
- ✅ Dependência unidirecional (expansion → core)
- ✅ Core não conhece expansion
- ✅ Fácil de remover/desabilitar
- ❌ Duplicação de infraestrutura se outros devs criarem Minds

#### Cenário B: Workspace Package Nativo

```
@aios-fullstack/cognitive/           # NOVO workspace package
├── mind-loader.js                   # Carregador genérico
├── decision-capturer.js
├── pattern-analyzer.js
└── minds/
    └── adapters/
        └── pedro-valerio-adapter.js  # Adapter específico

aios-core/agents/
├── decision-analyst.md              # NOVO: agente core
└── mind-consultant.md               # NOVO: agente core

outputs/minds/pedro_valerio/         # User data (inalterado)
```

**Grafo de Dependências**:
- ✅ Infraestrutura reutilizável
- ✅ Outros devs podem criar Minds facilmente
- ⚠️ Core tem dependência em "cognitive" package
- ⚠️ Aumento de complexidade do monorepo
- ❌ Todos usuários instalam cognitive layer (mesmo sem usar)

#### Cenário C: Arquitetura Híbrida (RECOMENDADA)

```
@aios-fullstack/cognitive/           # Workspace package: infraestrutura
├── decision-capturer.js             # Genérico
├── pattern-analyzer.js              # Genérico
├── mind-storage.js                  # Abstração
└── adapters/
    └── base-mind-adapter.js         # Interface

aios-core/agents/
├── decision-analyst.md              # Agente genérico (detecta Mind via config)
└── mind-consultant.md               # Agente genérico

expansion-packs/pedro-valerio-mind/  # Extension: implementação específica
├── adapters/
│   └── pedro-valerio-adapter.js     # Implementação concreta
├── config.yaml                      # Configuração da Mind
└── artifacts/                       # Links para outputs/minds/

outputs/minds/pedro_valerio/         # User data (inalterado)
```

**Grafo de Dependências**:
- ✅ Core agnóstico de Minds específicas
- ✅ Infraestrutura reutilizável em workspace package
- ✅ Minds como plugins via expansion packs
- ✅ Fácil criar nova Mind (copiar template do expansion pack)

---

## 3. Riscos e Mitigações

### 3.1 Riscos: Expansion Pack (Proposta Inicial)

| Risco | Severidade | Probabilidade | Impacto | Mitigação |
|-------|------------|---------------|---------|-----------|
| **R1: Duplicação de código** | 🟡 Média | 🔴 Alta (90%) | Múltiplos devs reescrevem DecisionCapturer | Mover infra para core |
| **R2: Inconsistência entre Minds** | 🟡 Média | 🟡 Média (60%) | Cada Mind implementa padrões diferentes | Criar base class/interface |
| **R3: Baixa descoberta** | 🟢 Baixa | 🟡 Média (50%) | Novos devs não sabem que expansion existe | Melhor documentação |
| **R4: Manutenção fragmentada** | 🟡 Média | 🟡 Média (40%) | Bugs corrigidos em um lugar, não em outro | Centralizar código comum |
| **R5: Dificuldade de evolução** | 🟢 Baixa | 🟢 Baixa (20%) | Breaking changes no expansion não sincronizam com core | Versionamento semântico |

**Mitigação Global**: Adotar **Arquitetura Híbrida** (Cenário C)

### 3.2 Riscos: Workspace Package Nativo

| Risco | Severidade | Probabilidade | Impacto | Mitigação |
|-------|------------|---------------|---------|-----------|
| **R6: Bloat do core** | 🔴 Alta | 🔴 Alta (80%) | Todos usuários instalam cognitive mesmo sem usar | Lazy loading, tree-shaking |
| **R7: Acoplamento excessivo** | 🔴 Alta | 🟡 Média (60%) | Core depende de Mind específica | Usar adapter pattern |
| **R8: Dificuldade de opt-out** | 🟡 Média | 🔴 Alta (70%) | Usuários não podem desabilitar facilmente | Configuração feature flag |
| **R9: Versionamento complexo** | 🟡 Média | 🟡 Média (50%) | Mind PV evolui mais rápido que core | Desacoplar versionamento |
| **R10: Overhead de publicação** | 🟢 Baixa | 🟡 Média (40%) | Cada release inclui cognitive package | Automatizar com lerna/nx |

**Mitigação Global**: Adotar **Arquitetura Híbrida** (Cenário C)

### 3.3 Riscos: Arquitetura Híbrida

| Risco | Severidade | Probabilidade | Impacto | Mitigação |
|-------|------------|---------------|---------|-----------|
| **R11: Complexidade arquitetural** | 🟡 Média | 🟡 Média (50%) | 3 layers (core, cognitive, mind-expansion) | Documentação clara, diagrams |
| **R12: Adapter overhead** | 🟢 Baixa | 🟢 Baixa (30%) | Camada extra de abstração | Keep adapters simple |
| **R13: Discovery de Minds** | 🟢 Baixa | 🟡 Média (40%) | Devs não sabem que podem plugar Minds | CLI command `aios minds:list` |
| **R14: Testes multi-layer** | 🟡 Média | 🟡 Média (50%) | Testar core + cognitive + expansion | Test fixtures compartilhados |

**Mitigação Global**: Investir em **Developer Experience** (DX)

---

## 4. Comparação Prós e Contras

### 4.1 Expansion Pack (Proposta Inicial)

#### ✅ Prós

1. **Baixo acoplamento**
   - Core permanece limpo e focado
   - Fácil de adicionar/remover expansion
   - Não afeta usuários que não usam Decision Analysis

2. **Versionamento independente**
   - Mind PV pode evoluir sem afetar AIOS core
   - Releases mais frequentes sem breaking changes

3. **Menor risco**
   - Falhas no expansion não derrubam core
   - Rollback simples (desabilitar expansion)

4. **Precedente claro**
   - Hybrid-Ops já usa esse modelo
   - Padrão estabelecido e documentado

#### ❌ Contras

1. **Baixa reutilização**
   - Próximos devs reescrevem DecisionCapturer, PatternAnalyzer
   - Código duplicado entre expansions

2. **Baixa descoberta**
   - Novos usuários não sabem que expansion existe
   - Menor adoção do sistema de Minds

3. **Inconsistência**
   - Cada Mind pode implementar padrões diferentes
   - Difícil padronizar formato de decisões

4. **Fragmentação**
   - Código de infraestrutura espalhado
   - Manutenção de bugs em múltiplos lugares

### 4.2 Workspace Package Nativo

#### ✅ Prós

1. **Alta reutilização**
   - DecisionCapturer, PatternAnalyzer disponíveis para todos
   - DRY principle aplicado

2. **Padronização**
   - Formato único de decisões
   - Interface consistente entre Minds

3. **Descoberta automática**
   - Todos usuários têm acesso ao cognitive layer
   - Documentação centralizada

4. **Evolução coordenada**
   - Cognitive package evolui com core
   - Breaking changes sincronizados

#### ❌ Contras

1. **Bloat obrigatório**
   - Todos usuários instalam cognitive mesmo sem usar Minds
   - Bundle size aumenta

2. **Acoplamento core**
   - Core depende de cognitive package
   - Maior superfície de ataque para bugs

3. **Rigidez**
   - Difícil fazer opt-out
   - Mudanças no cognitive afetam todos

4. **Overhead de release**
   - Cognitive package deve ser publicado sempre
   - Versionamento mais complexo

### 4.3 Arquitetura Híbrida (RECOMENDADA)

#### ✅ Prós

1. **Melhor dos dois mundos**
   - Infraestrutura reutilizável (cognitive package)
   - Minds plugáveis (expansion packs)
   - Core agnóstico de implementações

2. **Escalabilidade**
   - Fácil adicionar novas Minds (seguir template)
   - Comunidade pode contribuir Minds

3. **Flexibilidade**
   - Usuários escolhem quais Minds instalar
   - Core funciona sem nenhuma Mind

4. **Padrão futuro**
   - Estabelece arquitetura para outros cognitive services
   - Plugin system robusto

#### ❌ Contras

1. **Complexidade inicial**
   - 3 layers para entender (core, cognitive, mind-extension)
   - Mais arquivos e abstrações

2. **Overhead de abstração**
   - Adapter pattern adiciona camada
   - Mais interfaces para manter

3. **Documentação extensa**
   - Precisa documentar: core, cognitive API, como criar Mind
   - Mais exemplos necessários

4. **Setup inicial maior**
   - Criar cognitive package do zero
   - Refatorar hybrid-ops para usar adapters

---

## 5. Análise de Alinhamento com Visão AIOS

### 5.1 Princípios AIOS-FULLSTACK

| Princípio | Expansion Pack | Workspace Native | Híbrido |
|-----------|---------------|------------------|---------|
| **Modularidade** | ✅ Alta | ❌ Baixa | ✅ Alta |
| **Reutilização** | ❌ Baixa | ✅ Alta | ✅ Alta |
| **Extensibilidade** | ✅ Alta | ❌ Média | ✅ Muito Alta |
| **Opt-in** | ✅ Sim | ❌ Não | ✅ Sim |
| **DRY** | ❌ Não | ✅ Sim | ✅ Sim |
| **Separation of Concerns** | ✅ Clara | ❌ Misturada | ✅ Clara |

### 5.2 Alinhamento com Caso de Uso

**"Futuramente outros usuários menos experientes possam pedir ajuda à Mind Pedro Valério"**

| Abordagem | Facilita Caso de Uso? | Justificativa |
|-----------|----------------------|---------------|
| Expansion Pack | 🟡 Parcialmente | Precisa instalar expansion + descobrir como usar |
| Workspace Native | ✅ Sim | Cognitive layer sempre disponível, mas força instalação |
| Híbrido | ✅✅ Muito | Cognitive layer disponível + Minds opt-in + descoberta via CLI |

**"Ir aumentando sistematicamente como Pedro Valério se comporta nas tomadas de decisão"**

| Abordagem | Facilita Evolução? | Justificativa |
|-----------|-------------------|---------------|
| Expansion Pack | ✅ Sim | Versionamento independente, pode evoluir rápido |
| Workspace Native | 🟡 Parcialmente | Preso ao versionamento do core |
| Híbrido | ✅✅ Muito | Mind evolui independente, infra estável no core |

---

## 6. Proposta de Arquitetura Híbrida Detalhada

### 6.1 Estrutura de Diretórios

```
aios-fullstack/
├── workspaces: [
│     "aios-core",
│     "memory",
│     "security",
│     "performance",
│     "telemetry",
│     "cognitive"        # ← NOVO workspace package
│   ]
│
├── cognitive/                              # ✅ NOVO: Infraestrutura genérica
│   ├── package.json                        # @aios-fullstack/cognitive v4.31.0
│   ├── lib/
│   │   ├── decision-capturer.js            # Captura genérica
│   │   ├── pattern-analyzer.js             # Análise genérica
│   │   ├── mind-storage.js                 # Abstração de storage
│   │   └── query-engine.js                 # Query genérico
│   ├── adapters/
│   │   └── base-mind-adapter.js            # Interface base
│   ├── schemas/
│   │   ├── decision-schema.json            # Schema padrão
│   │   └── mind-config-schema.json
│   └── README.md
│
├── aios-core/
│   ├── agents/
│   │   ├── aios-decision-analyst.md        # ✅ Agente genérico (detecta Mind via config)
│   │   └── aios-mind-consultant.md         # ✅ Agente genérico
│   ├── tasks/
│   │   ├── capture-decisions.md            # Usa @aios-fullstack/cognitive
│   │   └── consult-mind.md
│   └── workflows/
│       └── decision-evolution-cycle.yaml
│
├── expansion-packs/
│   ├── pedro-valerio-mind/                 # ✅ NOVO: Mind como plugin
│   │   ├── package.json                    # @aios-fullstack/pedro-valerio-mind v1.0.0
│   │   ├── config.yaml                     # Configuração da Mind
│   │   │   # mind_name: "Pedro Valério"
│   │   │   # adapter: "./adapters/pedro-valerio-adapter.js"
│   │   │   # storage_path: "../../../../outputs/minds/pedro_valerio"
│   │   ├── adapters/
│   │   │   └── pedro-valerio-adapter.js    # Implementação do BaseAdapter
│   │   ├── prompts/
│   │   │   └── decision-analysis-prompt.md # Prompt específico PV
│   │   └── README.md
│   │
│   └── hybrid-ops/                         # Existente (refatorar para usar cognitive)
│       └── utils/
│           └── mind-loader.js              # Usar @aios-fullstack/cognitive
│
└── outputs/
    └── minds/
        └── pedro_valerio/                  # ✅ User data (inalterado)
            ├── artifacts/
            ├── decisions/                  # ← Criado por cognitive package
            │   ├── analyses/
            │   ├── evolution/
            │   └── aggregated/
            └── metadata.yaml
```

### 6.2 Fluxo de Dados

```
1. Dev completa Story 1.15
   ↓
2. Executa: aios capture-decisions --story 1.15
   ↓
3. @aios-fullstack/cognitive (DecisionCapturer)
   - Lê git log, chat history, tool calls
   - Salva em outputs/minds/pedro_valerio/decisions/analyses/
   ↓
4. Detecta Mind via config: expansion-packs/pedro-valerio-mind/config.yaml
   ↓
5. Carrega PedroValerioAdapter
   - Executa decision-analysis-prompt.md (prompt PV-específico)
   - Valida com META_AXIOMAS
   - Compila heurísticas
   ↓
6. PatternAnalyzer (genérico)
   - Detecta pattern shifts
   - Atualiza aggregated/decision-profile-current.json
   ↓
7. MindStorage (genérico)
   - Persiste em estrutura padrão
   - Versiona alterações
   ↓
8. (Futuro) Outro dev:
   aios consult-mind --context "refactoring hybrid-ops"
   ↓
9. QueryEngine carrega PedroValerioAdapter
   - Busca decisões similares
   - Retorna recomendações baseadas em histórico PV
```

### 6.3 Código de Exemplo: Adapter Pattern

#### cognitive/adapters/base-mind-adapter.js

```javascript
/**
 * Base interface for Mind adapters
 * Todas Minds devem implementar esta interface
 */
class BaseMindAdapter {
  constructor(config) {
    this.mindName = config.mind_name;
    this.storagePath = config.storage_path;
  }

  /**
   * Executa análise de decisão com prompt específico da Mind
   * @param {Object} evidence - Evidências coletadas
   * @returns {Promise<Object>} - Análise estruturada
   */
  async analyzeDecision(evidence) {
    throw new Error('analyzeDecision must be implemented by subclass');
  }

  /**
   * Valida decisão contra axiomas/princípios da Mind
   * @param {Object} decision - Decisão a validar
   * @returns {Promise<Object>} - Resultado validação
   */
  async validateDecision(decision) {
    throw new Error('validateDecision must be implemented by subclass');
  }

  /**
   * Compila heurísticas específicas da Mind
   * @returns {Promise<Array>} - Heurísticas compiladas
   */
  async compileHeuristics() {
    throw new Error('compileHeuristics must be implemented by subclass');
  }

  /**
   * Formata resposta de consulta no estilo da Mind
   * @param {Object} query - Query de consulta
   * @param {Array} matches - Decisões encontradas
   * @returns {Promise<Object>} - Resposta formatada
   */
  async formatConsultationResponse(query, matches) {
    throw new Error('formatConsultationResponse must be implemented');
  }
}

module.exports = { BaseMindAdapter };
```

#### expansion-packs/pedro-valerio-mind/adapters/pedro-valerio-adapter.js

```javascript
const { BaseMindAdapter } = require('@aios-fullstack/cognitive/adapters');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('yaml');

class PedroValerioAdapter extends BaseMindAdapter {
  constructor(config) {
    super(config);
    this.artifactsPath = path.join(this.storagePath, 'artifacts');
    this.metaAxiomas = null;
    this.heuristicas = null;
  }

  async loadArtifacts() {
    if (!this.metaAxiomas) {
      const metaPath = path.join(this.artifactsPath, 'META_AXIOMAS_DE_PEDRO_VALÉRIO.md');
      this.metaAxiomas = await fs.readFile(metaPath, 'utf-8');
    }
    if (!this.heuristicas) {
      const heurPath = path.join(this.artifactsPath, 'heurísticas_de_decisão_e_algoritmos_mentais_únicos.md');
      this.heuristicas = await fs.readFile(heurPath, 'utf-8');
    }
  }

  async analyzeDecision(evidence) {
    await this.loadArtifacts();

    // Lê prompt específico do Pedro Valério
    const promptPath = path.join(__dirname, '../prompts/decision-analysis-prompt.md');
    const promptTemplate = await fs.readFile(promptPath, 'utf-8');

    // Executa análise usando LLM com prompt PV + evidências
    const analysis = await this.executeLLMAnalysis({
      prompt: promptTemplate,
      evidence: evidence,
      context: {
        meta_axiomas: this.metaAxiomas,
        heuristicas: this.heuristicas
      }
    });

    return analysis;
  }

  async validateDecision(decision) {
    await this.loadArtifacts();

    // Valida contra META_AXIOMAS
    const violations = [];

    // Exemplo: verifica se decisão é coerente com "Completude Antes de Entrega"
    if (decision.axes.speed_vs_rigor.assessment !== 'Strong rigor bias') {
      violations.push({
        axioma: 'Completude Antes de Entrega',
        severity: 'high',
        reason: 'Decisão não reflete preferência por rigor documentada'
      });
    }

    return {
      valid: violations.length === 0,
      violations: violations,
      confidence: violations.length === 0 ? 1.0 : 0.5
    };
  }

  async compileHeuristics() {
    await this.loadArtifacts();

    // Compila heurísticas executáveis a partir do markdown
    const compiled = [
      {
        id: 'PV_COMPLETUDE_001',
        name: 'Completude Antes de Entrega',
        condition: (context) => context.tests_passing && context.docs_updated,
        action: 'approve_for_delivery',
        source: this.heuristicas
      },
      {
        id: 'PV_ROLLBACK_001',
        name: 'Sempre Ter Plano B',
        condition: (context) => !context.has_rollback_plan,
        action: 'block_deployment',
        source: this.heuristicas
      }
      // ... mais heurísticas
    ];

    return compiled;
  }

  async formatConsultationResponse(query, matches) {
    // Formata resposta no estilo direto e objetivo do PV
    return {
      summary: `Baseado em ${matches.length} decisões passadas similares:`,
      top_decision: matches[0],
      key_heuristics: matches[0].relevant_heuristics,
      recommendation: this.generateRecommendation(query, matches),
      confidence: this.calculateConfidence(matches),
      caveat: 'Sempre validar contexto específico do seu caso'
    };
  }

  // Métodos privados helpers...
}

module.exports = { PedroValerioAdapter };
```

### 6.4 Configuração da Mind

#### expansion-packs/pedro-valerio-mind/config.yaml

```yaml
mind:
  name: "Pedro Valério"
  slug: "pedro_valerio"
  version: "1.0.0"
  adapter_class: "./adapters/pedro-valerio-adapter.js"

storage:
  base_path: "../../../../outputs/minds/pedro_valerio"
  decisions_path: "decisions"
  artifacts_path: "artifacts"

prompts:
  decision_analysis: "./prompts/decision-analysis-prompt.md"
  consultation_response: "./prompts/consultation-response.md"

features:
  auto_validation: true          # Valida contra META_AXIOMAS
  heuristic_compilation: true    # Compila heurísticas executáveis
  pattern_evolution: true        # Detecta shifts de padrão
  mind_evolution: true           # Auto-atualiza System_Prompt.md

integration:
  hybrid_ops: true               # Integra com hybrid-ops expansion
  agents:
    - "aios-decision-analyst"
    - "aios-mind-consultant"
```

### 6.5 Detecção Automática de Minds

#### cognitive/lib/mind-registry.js

```javascript
const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');

class MindRegistry {
  static async discoverMinds() {
    const expansionsPath = path.resolve(__dirname, '../../../expansion-packs');
    const expansions = await fs.readdir(expansionsPath);

    const minds = [];
    for (const expansion of expansions) {
      const configPath = path.join(expansionsPath, expansion, 'config.yaml');
      try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = yaml.parse(configContent);

        if (config.mind) {
          minds.push({
            name: config.mind.name,
            slug: config.mind.slug,
            path: path.join(expansionsPath, expansion),
            adapter: require(path.join(expansionsPath, expansion, config.mind.adapter_class))
          });
        }
      } catch (err) {
        // Expansion sem Mind, skip
      }
    }

    return minds;
  }

  static async loadMind(slug) {
    const minds = await this.discoverMinds();
    const mind = minds.find(m => m.slug === slug);

    if (!mind) {
      throw new Error(`Mind "${slug}" not found. Available: ${minds.map(m => m.slug).join(', ')}`);
    }

    const configPath = path.join(mind.path, 'config.yaml');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = yaml.parse(configContent);

    const AdapterClass = mind.adapter;
    return new AdapterClass(config);
  }
}

module.exports = { MindRegistry };
```

---

## 7. Análise de Custo-Benefício

### 7.1 Esforço de Implementação

| Abordagem | Esforço Inicial | Manutenção | Escalabilidade |
|-----------|----------------|------------|----------------|
| **Expansion Pack** | 🟢 Baixo (1 semana) | 🔴 Alto (bugs duplicados) | 🔴 Baixa (reescrever por Mind) |
| **Workspace Native** | 🟡 Médio (2 semanas) | 🟡 Médio | 🟡 Média (forçado para todos) |
| **Híbrido** | 🔴 Alto (3-4 semanas) | 🟢 Baixo (DRY) | 🟢 Alta (plugin system) |

### 7.2 Retorno no Investimento

**Cenário**: 5 desenvolvedores criarão suas próprias Minds nos próximos 12 meses

| Abordagem | Tempo Total (5 Minds) | Bugs Duplicados | Inconsistência |
|-----------|----------------------|-----------------|----------------|
| Expansion Pack | 5 × 3 semanas = **15 semanas** | 🔴 Alta | 🔴 Alta |
| Workspace Native | 5 × 1 semana = **5 semanas** | 🟢 Baixa | 🟢 Baixa |
| Híbrido | 4 semanas (infra) + 5 × 1 semana = **9 semanas** | 🟢 Baixa | 🟢 Baixa |

**ROI**: Híbrido se paga após **2ª Mind criada** (9 semanas vs 15 semanas)

---

## 8. Casos de Uso Futuros

### 8.1 Múltiplas Minds no Mesmo Projeto

**Cenário**: Empresa AllFluence com 5 devs, cada um com sua Mind

```bash
# Dev 1 (Pedro Valério)
aios capture-decisions --mind pedro_valerio

# Dev 2 (Maria Silva)
aios capture-decisions --mind maria_silva

# Dev 3 consulta ambas Minds
aios consult-mind --minds pedro_valerio,maria_silva --context "refactoring API"
```

**Suporte por Abordagem**:
- ❌ Expansion Pack: Precisa múltiplos expansions (duplicate code)
- ✅ Workspace Native: Suporta, mas forçado para todos
- ✅ Híbrido: Suporta via plugin system

### 8.2 Team Aggregated Mind

**Cenário**: Criar "AllFluence Team Mind" agregando decisões de 5 devs

```javascript
const teamMind = await cognitive.aggregateMinds([
  'pedro_valerio',
  'maria_silva',
  'joao_santos',
  'ana_costa',
  'lucas_oliveira'
]);

const consensus = teamMind.getConsensusHeuristics();
// Retorna heurísticas que ≥3 devs compartilham
```

**Suporte por Abordagem**:
- ❌ Expansion Pack: Impossível (cada Mind em expansion separado)
- ✅ Workspace Native: Possível, mas acoplado
- ✅ Híbrido: Fácil (cognitive.aggregateMinds() genérico)

### 8.3 Community Minds Marketplace

**Cenário**: Developers compartilham Minds publicamente

```bash
# Instalar Mind de expert externo
npm install @aios-minds/kent-beck

# Consultar decisões do Kent Beck
aios consult-mind --mind kent_beck --context "TDD workflow"
```

**Suporte por Abordagem**:
- 🟡 Expansion Pack: Possível, mas cada Mind é monolito
- ✅ Workspace Native: Difícil (depende de core)
- ✅ Híbrido: Natural (Minds como npm packages independentes)

---

## 9. Recomendação Final

### 9.1 Decisão Recomendada

🎯 **ARQUITETURA HÍBRIDA** (Cenário C)

**Justificativa**:

1. ✅ **Alinha com princípios AIOS**: Modular, extensível, opt-in
2. ✅ **Prepara para escala**: Fácil adicionar Minds (5 devs nos próximos 12 meses)
3. ✅ **Reutilização máxima**: Infraestrutura compartilhada, Minds plugáveis
4. ✅ **ROI positivo**: Se paga após 2ª Mind criada
5. ✅ **Suporta casos futuros**: Team Mind, Community Marketplace

### 9.2 Roadmap de Implementação

#### Phase 1: Cognitive Infrastructure (2 semanas)
**Epic**: Cognitive Layer Foundation
**Stories**:
1. Criar workspace package `@aios-fullstack/cognitive`
2. Implementar `DecisionCapturer` genérico
3. Implementar `PatternAnalyzer` genérico
4. Implementar `MindStorage` abstração
5. Criar `BaseMindAdapter` interface
6. Criar `MindRegistry` para discovery
7. Adicionar ao monorepo workspaces

#### Phase 2: Core Agents (1 semana)
**Epic**: Generic Decision Analysis Agents
**Stories**:
1. Criar `aios-decision-analyst.md` (detecta Mind via config)
2. Criar `aios-mind-consultant.md` (query genérico)
3. Criar workflows `decision-evolution-cycle.yaml`
4. Integrar com `@aios-fullstack/cognitive`

#### Phase 3: Pedro Valério Mind Plugin (1 semana)
**Epic**: Pedro Valério Mind as Extension
**Stories**:
1. Criar `expansion-packs/pedro-valerio-mind/`
2. Implementar `PedroValerioAdapter` (estende `BaseMindAdapter`)
3. Migrar prompt de análise para `prompts/decision-analysis-prompt.md`
4. Criar `config.yaml` com configuração da Mind
5. Integrar com `outputs/minds/pedro_valerio/`

#### Phase 4: Hybrid-Ops Refactoring (0.5 semana)
**Epic**: Hybrid-Ops Migration to Cognitive
**Stories**:
1. Refatorar `utils/mind-loader.js` para usar `@aios-fullstack/cognitive`
2. Remover código duplicado
3. Atualizar testes

#### Phase 5: Documentation & DX (0.5 semana)
**Epic**: Developer Experience
**Stories**:
1. Documentar cognitive package API
2. Criar guide "How to Create a Mind"
3. Adicionar CLI command `aios minds:list`
4. Criar template expansion pack para novas Minds

**Total**: **5 semanas** (vs 1 semana expansion pack, mas 15 semanas para 5 Minds)

### 9.3 Critérios de Aceitação

- [ ] **AC1**: `@aios-fullstack/cognitive` package criado e publicável
- [ ] **AC2**: `BaseMindAdapter` interface bem documentada
- [ ] **AC3**: Pedro Valério Mind funciona como expansion pack
- [ ] **AC4**: Hybrid-Ops refatorado para usar cognitive
- [ ] **AC5**: CLI `aios minds:list` lista Minds disponíveis
- [ ] **AC6**: Documentação "Create Your Mind" completa
- [ ] **AC7**: Exemplo de 2ª Mind criada em <1 semana
- [ ] **AC8**: Todos testes passando (cognitive + expansions)

---

## 10. Riscos da Recomendação

### 10.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Over-engineering inicial | 🟡 40% | 🟡 Média | Implementar MVP primeiro, iterar |
| Adapter pattern muito complexo | 🟢 20% | 🟢 Baixa | Simplificar interface, poucos métodos |
| Performance overhead | 🟢 10% | 🟢 Baixa | Lazy loading, cache de adapters |

### 10.2 Riscos Organizacionais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Devs não criam novas Minds | 🟡 30% | 🔴 Alta | Evangelizar, criar templates fáceis |
| Resistência à complexidade | 🟡 40% | 🟡 Média | Documentação excelente, exemplos |
| Tempo de implementação estourar | 🟡 50% | 🟡 Média | Dividir em sprints, MVPs incrementais |

---

## 11. Alternativa: Se Esforço For Blocker

**Se as 5 semanas forem inviáveis agora**, recomendo:

### 11.1 Abordagem Gradual

**Fase 1 (Imediata)**: Expansion Pack (1 semana)
- Implementar como expansion pack (proposta original)
- Adicionar TODO comments: "// TODO: Migrar para @aios-fullstack/cognitive"

**Fase 2 (Após validação)**: Extraction (2 semanas)
- Extrair código genérico para `@aios-fullstack/cognitive`
- Manter expansion pack usando cognitive

**Fase 3 (Quando 2ª Mind surgir)**: Plugin System (2 semanas)
- Criar adapter pattern
- Migrar Pedro Valério Mind para expansion dedicado

**Benefício**: Validar conceito primeiro, refatorar depois

### 11.2 Decision Points

| Quando | Decisão |
|--------|---------|
| **Agora** | Implementar expansion pack (quick win) |
| **Após 1 mês** | Avaliar adoção. Se >3 devs interessados → extrair para cognitive |
| **Após 3 meses** | Se 2ª Mind criada → implementar adapter pattern |
| **Após 6 meses** | Se ≥3 Minds → community marketplace |

---

## 12. Conclusão

### Recomendação Estratégica

**Para Pedro Valério (decisor)**:

1. 🎯 **Curto Prazo (agora)**: Implementar como **Expansion Pack** (quick win, 1 semana)
2. 🎯 **Médio Prazo (1-3 meses)**: Extrair para **@aios-fullstack/cognitive** (quando validado)
3. 🎯 **Longo Prazo (6+ meses)**: **Arquitetura Híbrida completa** (quando múltiplas Minds)

**Rationale**:
- ✅ Minimiza risco inicial
- ✅ Valida conceito rapidamente
- ✅ Permite refactoring incremental
- ✅ Não bloqueia evolução futura

### Próximas Ações

1. **Pedro decide**: Expansion Pack agora vs Híbrido já?
2. **Se Expansion Pack**: Aprovar PRD original, implementar Phase 1
3. **Se Híbrido**: Aprovar este documento, fragmentar em 13 stories
4. **Ambos**: Criar Epic no ClickUp "Decision Analysis Integration"

---

**Documento Preparado Por**: Claude Code (AIOS Decision Analyst Agent)
**Para Revisão**: Pedro Valério
**Data**: 2025-10-21
**Status**: ⏸️ Aguardando Decisão Final

