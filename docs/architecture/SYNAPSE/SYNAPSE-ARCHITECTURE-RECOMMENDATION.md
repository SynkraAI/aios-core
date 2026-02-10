# SYNAPSE — Architectural Recommendation

> **Author:** @architect (Aria)
> **Date:** 2026-02-10
> **Status:** Ready for PM Review
> **Review Chain:** @architect → @pm → @aios-master → @po
> **Version:** 1.0.0

---

## 1. Sumario Executivo

SYNAPSE (Synkra Adaptive Processing & State Engine) unifica CARL (regras per-prompt), MIS (memoria persistente) e UAP (ativacao de agentes) num motor de contexto JIT de 8 camadas. Este documento consolida a analise de 4 documentos de design + exploracao completa do CARL project + codebase patterns do aios-core para definir a arquitetura final e recomendar o epic de desenvolvimento.

### Decisoes Estrategicas Confirmadas

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| 8 Layers de regras | **Core (open-source)** | SYNAPSE eh o motor fundamental do AIOS |
| Integracao com MIS | **Pro only (feature-gated)** | Memoria persistente eh diferencial comercial |
| Relacao com UAP | **Consumer, nao substituto** | Preserva investimento do Epic ACT |
| Relacao com MIS | **Consumer via API** | Nao reimplementa retrieval/scoring |
| Linguagem | **Node.js** | Alinhado com aios-core stack |
| Format de dados | **KEY=VALUE** | Zero-dependency, CARL-compatible |

---

## 2. Arquitetura de 4 Camadas (baseada no CARL)

A analise do projeto CARL original (`C:\Users\AllFluence-User\Workspaces\AIOS\CARL\`) revelou uma separacao clara em 4 camadas que SYNAPSE deve replicar:

### 2.1 Mapeamento CARL → SYNAPSE

| Camada | CARL (Python) | SYNAPSE (Node.js) | Responsabilidade |
|--------|---------------|--------------------|--------------------|
| **Hook Entry** | `.claude/hooks/carl-hook.py` (1073 linhas, 1 arquivo) | `.claude/hooks/synapse-engine.js` (entry point fino) | Ponto de entrada registrado como hook Claude Code |
| **Engine** | Tudo inline no carl-hook.py | `.aios-core/core/synapse/` (modulos separados) | Logica de processamento (layers, session, domain loading) |
| **Runtime Data** | `.carl/` (manifest, domains, sessions/) | `.synapse/` (manifest, domains, sessions/) | Dados que o engine le e gerencia |
| **CRUD Commands** | `.claude/commands/carl/` (tasks/, templates/) | `.claude/commands/synapse/` | Gestao de domains/regras pelo usuario |
| **Help/Skills** | `.claude/skills/carl-help/`, `carl-manager/` | `.claude/skills/synapse/` | Documentacao e guia do usuario |

### 2.2 Decisao Chave: Engine Location

**CARL coloca tudo no hook** (1 arquivo Python de 1073 linhas). SYNAPSE **separa** o engine em modulos dentro de `.aios-core/core/synapse/` por tres razoes:

1. **Testabilidade** — Modulos separados podem ter testes unitarios (Jest)
2. **Reusabilidade** — Outros sistemas podem importar layer processors
3. **Manutencao** — 8 layers + session + domain loader + formatter = muito para 1 arquivo

O hook entry point (`.claude/hooks/synapse-engine.js`) sera um arquivo fino (~50 linhas) que:
- Le JSON de stdin
- Importa e instancia `SynapseEngine` de `.aios-core/core/synapse/engine.js`
- Chama `engine.process(input)`
- Escreve resultado em stdout

### 2.3 Arvore de Arquivos Proposta

```
aios-core/
├── .claude/
│   ├── hooks/
│   │   └── synapse-engine.js          # Entry point fino (~50 linhas)
│   ├── commands/synapse/
│   │   ├── manager.md                 # Router de comandos
│   │   ├── tasks/
│   │   │   ├── add-rule.md
│   │   │   ├── create-domain.md
│   │   │   ├── create-command.md
│   │   │   ├── edit-rule.md
│   │   │   └── toggle-domain.md
│   │   ├── templates/
│   │   │   ├── domain-template
│   │   │   └── manifest-entry-template
│   │   └── utils/
│   │       └── manifest-parser-reference.md
│   └── skills/synapse/
│       ├── SYNAPSE-OVERVIEW.md
│       ├── COMMANDS-GUIDE.md
│       ├── CONTEXT-RULES.md
│       ├── DOMAIN-GUIDE.md
│       └── MANIFEST-REFERENCE.md
│
├── .aios-core/core/synapse/           # Engine modules (open-source)
│   ├── engine.js                      # SynapseEngine class
│   ├── layers/
│   │   ├── layer-processor.js         # Classe base abstrata
│   │   ├── l0-constitution.js
│   │   ├── l1-global.js
│   │   ├── l2-agent.js
│   │   ├── l3-workflow.js
│   │   ├── l4-task.js
│   │   ├── l5-squad.js
│   │   ├── l6-keyword.js
│   │   └── l7-star-command.js
│   ├── session/
│   │   └── session-manager.js
│   ├── domain/
│   │   └── domain-loader.js           # Parser KEY=VALUE
│   ├── context/
│   │   └── context-tracker.js         # Bracket calculator
│   ├── memory/
│   │   └── memory-bridge.js           # Pro-gated consumer do MIS
│   ├── output/
│   │   └── formatter.js               # <synapse-rules> XML generator
│   └── utils/
│       └── paths.js                   # Cross-platform path resolution
│
├── .synapse/                          # Runtime data (open-source)
│   ├── manifest                       # Central domain registry (KEY=VALUE)
│   ├── constitution                   # L0: 6 artigos
│   ├── global                         # L1: Regras universais
│   ├── context                        # L1: Bracket-specific rules
│   ├── commands                       # L7: Star-command definitions
│   ├── agent-dev                      # L2: @dev rules + authority
│   ├── agent-qa                       # L2: @qa rules + authority
│   ├── agent-architect                # L2: @architect rules + authority
│   ├── agent-pm                       # L2: @pm rules
│   ├── agent-po                       # L2: @po rules
│   ├── agent-sm                       # L2: @sm rules
│   ├── agent-devops                   # L2: @devops rules (EXCLUSIVE authorities)
│   ├── agent-analyst                  # L2: @analyst rules
│   ├── agent-data-engineer            # L2: @data-engineer rules
│   ├── agent-ux-design-expert         # L2: @ux-design-expert rules
│   ├── agent-aios-master              # L2: @aios-master rules
│   ├── agent-squad-creator            # L2: @squad-creator rules
│   ├── workflow-story-dev             # L3: SDC workflow rules
│   ├── workflow-epic-create           # L3: Epic creation rules
│   ├── workflow-arch-review           # L3: Architecture review rules
│   ├── sessions/                      # Auto-managed (gitignored)
│   └── cache/                         # Optional (gitignored)
│
└── pro/memory/
    └── synapse-memory-provider.js     # Pro: Adapter MIS → SYNAPSE format
```

---

## 3. Hierarquia de 8 Layers

### 3.1 Especificacao por Layer

| Layer | Nome | Ativacao | Desativavel? | Timeout | Token Budget | Open-Source? |
|-------|------|---------|-------------|---------|-------------|-------------|
| L0 | CONSTITUTION | ALWAYS_ON | **Nunca** | 5ms | ~100 tokens | Sim |
| L1 | GLOBAL | ALWAYS_ON | Via manifest | 10ms | ~200 tokens | Sim |
| L2 | AGENT-SCOPED | Agent ativo | Por session | 15ms | ~300 tokens | Sim |
| L3 | WORKFLOW | Workflow state | Por session | 15ms | ~200 tokens | Sim |
| L4 | TASK | Task ativa | Por session | 20ms | ~300 tokens | Sim |
| L5 | SQUAD | Squad ativo | Por session | 20ms | ~200 tokens | Sim |
| L6 | KEYWORD | Prompt keywords | Via EXCLUDE | 15ms | ~200 tokens | Sim |
| L7 | STAR-COMMAND | `*command` no prompt | N/A | 5ms | ~200 tokens | Sim |

**Total pipeline:** <70ms target, <100ms hard limit.

### 3.2 Context Brackets

| Bracket | Context % | Layers Injetadas | Max Tokens |
|---------|----------|-----------------|-----------|
| FRESH | 60-100% | L0, L1, L2 ativo, L7 (se explicito) | ~800 |
| MODERATE | 40-60% | Todas as layers ativas | ~1500 |
| DEPLETED | 25-40% | Todas + memory hints (pro) | ~2000 |
| CRITICAL | <25% | Todas + handoff warning | ~2500 |

### 3.3 Output Format

```xml
<synapse-rules>
[CONTEXT BRACKET] ...
[CONSTITUTION] (NON-NEGOTIABLE) ...
[ACTIVE AGENT: @{id}] ...
[ACTIVE WORKFLOW: {id}] ...
[TASK CONTEXT] ...
[SQUAD: {name}] ...
[STAR-COMMANDS] ...
[DEVMODE STATUS] ...
[LOADED DOMAINS SUMMARY] ...
</synapse-rules>
```

---

## 4. Open Core Boundary

### 4.1 Core (Open-Source, aios-core)

| Componente | Descricao |
|------------|-----------|
| synapse-engine.js | Hook entry point |
| `.aios-core/core/synapse/` | Engine modules completo (8 layers) |
| `.synapse/` | Runtime data (manifest, domains, sessions) |
| `.claude/commands/synapse/` | CRUD operations |
| `.claude/skills/synapse/` | Help/documentation |
| Context brackets | Bracket calculation e filtering |
| Star-commands | `*synapse`, `*brief`, `*dev`, etc. |

### 4.2 Pro (Feature-Gated, aios-pro)

| Componente | Feature Gate | Descricao |
|------------|-------------|-----------|
| `pro/memory/synapse-memory-provider.js` | `pro.memory.synapse` | Adapter MIS → SYNAPSE |
| Memory bridge activation | `pro.memory.synapse` | `memory-bridge.js` invoca MIS API |
| Heuristic consumption | `pro.memory.synapse` | Self-learner candidates |
| Auto-evolution rules | `pro.memory.synapse` | MIS-7 proposed rules |

### 4.3 Feature Gating Pattern

Usa o padrao existente do `precompact-runner.js`:

```javascript
// .aios-core/core/synapse/memory/memory-bridge.js
const { isProAvailable, loadProModule } = require(proDetectorPath);

async function loadMemoryContext(agentId, bracket, tokenBudget) {
  if (!isProAvailable()) return '';  // Graceful degradation

  const featureGate = loadProModule('license/feature-gate');
  if (!featureGate?.isAvailable('pro.memory.synapse')) return '';

  const provider = loadProModule('memory/synapse-memory-provider');
  if (!provider) return '';

  return provider.getMemoriesForContext(agentId, bracket, tokenBudget);
}
```

---

## 5. Analise de Conflitos com Epics Ativos

### 5.1 Resumo de Conflitos

| Epic | Status | Conflitos | Risco | Resolucao |
|------|--------|-----------|-------|-----------|
| **ACT** | Done (12/12) | 3 CRITICOS | ALTO → **MITIGADO** | SYNAPSE eh consumer, nao substituto |
| **MIS** | 5/7 done | 2 CRITICOS | ALTO → **MITIGADO** | SYNAPSE usa API MIS, nao reimplementa |
| **IDS** | Wave 1 done | 0 | BAIXO | Sistemas ortogonais |
| **PRO** | 4/5 done | 1 MEDIO | MEDIO → MITIGADO | Config scopes complementares |

### 5.2 Resolucoes Arquiteturais (Respostas do @architect)

**Pergunta 1 (ACT-C1):** Sim, `synapse-engine.js` opera como **hook complementar** (UserPromptSubmit) e NAO substitui `unified-activation-pipeline.js`. O pipeline roda na ativacao (one-time), o hook roda per-prompt. Sao mecanismos independentes e complementares.

**Pergunta 2 (MIS-C1):** Sim, SYNAPSE usa `loadForAgent()` + `queryMemories()` como API publica do MIS. Nao precisa de interface intermediaria — o `synapse-memory-provider.js` (pro) faz a adaptacao de formato.

**Pergunta 3 (Fase 1 safety):** Sim, Fase 1 cria apenas arquivos novos (`.synapse/`, `.aios-core/core/synapse/`, `.claude/hooks/synapse-engine.js`). Nao modifica nenhum arquivo existente. CARL deve ser desabilitado quando SYNAPSE ativar para evitar injecao dupla.

**Pergunta 4 (Layer hierarchy):** Sim, compativel. Layers executam per-prompt (hook, <100ms). Tiers executam on-activation (pipeline, <500ms). Dimensoes diferentes do mesmo contexto.

### 5.3 Ownership de Arquivos

| Arquivo/Diretorio | Owner | SYNAPSE Acesso |
|-------------------|-------|---------------|
| `.synapse/` | **SYNAPSE** | Read/Write |
| `.aios-core/core/synapse/` | **SYNAPSE** | Read/Write |
| `.claude/hooks/synapse-engine.js` | **SYNAPSE** | Read/Write |
| `unified-activation-pipeline.js` | ACT | **Read only** |
| `greeting-builder.js` | ACT | **Nao interage** |
| `pro/memory/memory-loader.js` | MIS | **Read only (via API)** |
| `pro/memory/self-learner.js` | MIS | **Read only** |
| `.aios/session-digests/` | MIS | **Read only** |
| `.aios/memories/` | MIS | **Read only (via API)** |
| `config-resolver.js` | PRO | **Read only** |
| `feature-gate.js` | PRO | **Read only** |
| `feature-registry.yaml` | PRO | **Append** (1 entry: `pro.memory.synapse`) |

---

## 6. Dependencias Externas

| Dependencia | Fornecido por | Status | Bloqueante? |
|-------------|---------------|--------|------------|
| Claude Code UserPromptSubmit hook | Claude Code nativo | Disponivel | Nao |
| Session state (active agent) | ACT-6 SessionContextLoader | Done | Nao |
| Workflow state | ACT-5 WorkflowNavigator | Done | Nao |
| Permission mode | ACT-4 PermissionMode | Done | Nao |
| Memory API (loadForAgent) | MIS-6 Pipeline Integration | Done | Nao |
| Attention scoring | MIS-4 Progressive Retrieval | Done | Nao |
| Self-learning heuristics | MIS-5 Self-Learning Engine | InReview | Bloqueia Fase 3 apenas |
| Feature gate runtime | PRO-6 feature-gate.js | In Progress | Bloqueia SYN-10 apenas |
| `pro-detector.js` | PRO-5 | Done | Nao |

---

## 7. Proposta de Waves para Epic SYNAPSE

### Wave 0: Foundation (sem conflitos, pode iniciar imediatamente)

| Story | Titulo | Complexidade | Deps | Esforco |
|-------|--------|-------------|------|---------|
| SYN-1 | Domain Loader + Manifest Parser (KEY=VALUE) | Medium | - | 6-8h |
| SYN-2 | Session Manager (.synapse/sessions/) | Medium | - | 6-8h |
| SYN-3 | Context Bracket Tracker | Medium | - | 4-6h |

**Risco:** ZERO. Cria apenas arquivos novos em `.aios-core/core/synapse/`.

### Wave 1: Layer Engine

| Story | Titulo | Complexidade | Deps | Esforco |
|-------|--------|-------------|------|---------|
| SYN-4 | Layer Processors L0-L3 (Constitution → Workflow) | High | SYN-1 | 8-10h |
| SYN-5 | Layer Processors L4-L7 (Task → Star-Command) | High | SYN-1, SYN-2 | 8-10h |
| SYN-6 | SynapseEngine Orchestrator + Output Formatter | High | SYN-3, SYN-4, SYN-5 | 6-8h |

**Risco:** BAIXO. Consome dados do ACT pipeline como read-only.

### Wave 2: Integration + Content

| Story | Titulo | Complexidade | Deps | Esforco |
|-------|--------|-------------|------|---------|
| SYN-7 | Hook Entry Point + Registration (UserPromptSubmit) | Medium | SYN-6 | 4-6h |
| SYN-8 | Domain Content Files (.synapse/ population) | Medium | SYN-1 | 6-8h |
| SYN-9 | CRUD Commands + Skills (.claude/commands/ + skills/) | Medium | SYN-7 | 6-8h |

**Risco:** BAIXO. SYN-7 registra hook em settings.local.json (CARL desabilitado).

### Wave 3: Pro + Polish

| Story | Titulo | Complexidade | Deps Externas | Esforco |
|-------|--------|-------------|---------------|---------|
| SYN-10 | Pro Memory Bridge (feature-gated MIS consumer) | High | MIS-6 (Done), PRO-6 | 8-10h |
| SYN-11 | Skills + Help Documentation | Low | SYN-7 | 4-6h |
| SYN-12 | Performance Optimization + E2E Testing | High | SYN-7, SYN-10 | 6-8h |

**Risco:** MEDIO para SYN-10 (dep PRO-6). BAIXO para SYN-11/12.

### Totais

| Wave | Stories | Esforco Estimado | Risco |
|------|---------|-----------------|-------|
| Wave 0 | 3 | 16-22h | ZERO |
| Wave 1 | 3 | 22-28h | BAIXO |
| Wave 2 | 3 | 16-22h | BAIXO |
| Wave 3 | 3 | 18-24h | MEDIO |
| **Total** | **12** | **72-96h** | **Gerenciavel** |

---

## 8. Performance Targets

### Per-Prompt (Hook)

| Metrica | Target | Hard Limit |
|---------|--------|------------|
| Total pipeline | <70ms | <100ms |
| Layer individual | <15ms | <20ms (exceto L0/L7: <5ms) |
| Startup (find .synapse/) | <5ms | <10ms |
| Session I/O | <10ms | <15ms |

### Agent Activation (Pipeline ACT + SYNAPSE)

| Metrica | Target | Hard Limit |
|---------|--------|------------|
| Total activation | <350ms | <500ms |
| Memory loader (pro) | <300ms | <500ms |

### Token Budget

| Bracket | Max Tokens | % de 200K Context |
|---------|-----------|-------------------|
| FRESH | 800 | 0.4% |
| MODERATE | 1500 | 0.75% |
| DEPLETED | 2000 | 1.0% |
| CRITICAL | 2500 | 1.25% |

---

## 9. CARL Migration Strategy

### 9.1 Feature Parity

Todas as funcionalidades do `carl-hook.py` devem ser preservadas no SYNAPSE:

| Feature CARL | SYNAPSE Equivalente | Status |
|--------------|--------------------|---------|
| stdin/stdout JSON | Identico | Pendente |
| Manifest parsing (KEY=VALUE) | Identico (SYN-1) | Pendente |
| Session management | Aprimorado com schema v2.0 (SYN-2) | Pendente |
| Context brackets (FRESH/MODERATE/DEPLETED/CRITICAL) | Identico (SYN-3) | Pendente |
| Star-command detection (*brief, *dev, etc.) | Identico + *synapse (SYN-5) | Pendente |
| Keyword matching (RECALL) | Identico (SYN-5) | Pendente |
| Exclusion system (EXCLUDE, GLOBAL_EXCLUDE) | Identico (SYN-1) | Pendente |
| Domain rule parsing | Identico (SYN-1) | Pendente |
| `<carl-rules>` XML output | `<synapse-rules>` XML (SYN-6) | Pendente |
| DEVMODE toggle | Identico + metrics (SYN-6) | Pendente |
| Auto-title generation | Identico (SYN-2) | Pendente |
| Stale session cleanup (>24h) | Identico (SYN-2) | Pendente |

### 9.2 Novas Funcionalidades (nao no CARL)

| Feature | Layer | Story |
|---------|-------|-------|
| L0: Constitution enforcement | L0 | SYN-4 |
| L2: Agent-scoped domains + authority | L2 | SYN-4 |
| L3: Workflow domain activation | L3 | SYN-4 |
| L4: Task context injection | L4 | SYN-5 |
| L5: Squad domain discovery | L5 | SYN-5 |
| Memory integration (pro) | Bridge | SYN-10 |
| Pipeline metrics (DEVMODE) | Engine | SYN-6 |
| CRUD commands | Commands | SYN-9 |

### 9.3 Transicao CARL → SYNAPSE

1. **Fase 1-2:** SYNAPSE coexiste com CARL (ambos podem estar registrados, mas apenas 1 ativo)
2. **SYN-7:** Ao registrar hook SYNAPSE, desabilitar hook CARL em settings
3. **Pos-Wave 2:** CARL pode ser completamente desabilitado
4. **Futuro:** Diretorio `.carl/` pode ser removido (migration script)

---

## 10. Principios Inegociaveis

1. **SYNAPSE nao reescreve codigo de outros epics** — consumer, nao producer
2. **Cada sistema owns seu store** — `.synapse/`, `.aios/`, `pro/` sao dominios exclusivos
3. **Hook per-prompt eh complementar ao pipeline** — nao substituto
4. **Memory layers invocam API do MIS** — nao reimplementam retrieval/scoring
5. **Agent definitions nao sao modificadas** — domain mapping fica no `.synapse/manifest`
6. **Constitution Layer 0 nao overrida IDS-6** — artigos diferentes, complementares
7. **Nunca bloqueia o prompt** — timeout/error → skip layer, warn-and-proceed
8. **Zero dependencies externas** — stdlib Node.js apenas (como CARL usa stdlib Python)

---

## 11. Documentos de Referencia

| Documento | Path (relativo a docs/architecture/SYNAPSE/) |
|-----------|----------------------------------------------|
| Analise Comparativa | `docs/SYNAPSE-ANALYSIS.md` |
| ADR-001 (32 decisoes) | `docs/ADR-001-SYNAPSE-UNIFIED-CONTEXT-ENGINE.md` |
| Design Document (API) | `docs/DESIGN-SYNAPSE-ENGINE.md` |
| Handoff Epics | `docs/HANDOFF-SYNAPSE-EPIC-ANALYSIS.md` |
| **Este documento** | `SYNAPSE-ARCHITECTURE-RECOMMENDATION.md` |

---

## 12. Proximo Passo

Este documento deve ser revisado na seguinte cadeia:

1. **@pm** — Criar EPIC-SYN-INDEX.md com stories formais baseadas nas Waves propostas
2. **@aios-master** — Validar compliance constitucional e squad discovery protocol
3. **@po** — Validar stories individuais (checklist 10 pontos)
4. **@sm** — Draftar stories detalhadas para Wave 0

**Comando recomendado:** `@pm *create-epic` usando este documento como input.

---

*SYNAPSE Architecture Recommendation v1.0.0*
*@architect (Aria) — 2026-02-10*
*CLI First | Consumer Architecture | Feature-Gated Memory*
