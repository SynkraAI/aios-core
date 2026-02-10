# ADR-001: SYNAPSE — Unified Context Engine

> Architecture Decision Record para a unificacao de CARL + MIS + UAP em SYNAPSE

**Status:** Accepted
**Date:** 2026-02-10
**Deciders:** @architect, @pm
**Consulted:** @dev, @qa, @devops

---

## Context

O Synkra AIOS evoluiu tres sistemas independentes para governar a experiencia do Claude Code:

1. **CARL** (Context Augmentation & Reinforcement Layer) — Motor de injecao dinamica de regras implementado em Python como hook de `UserPromptSubmit`. Injeta `<carl-rules>` XML a cada prompt com keyword matching, context brackets, star-commands e session management. **1073 linhas**, zero dependencies externas.

2. **MIS** (Memory Intelligence System) — Sistema de memoria persistente de 4 camadas (Capture → Storage → Retrieval → Evolution) implementado em Node.js como modulo pro. Inclui session digest extractor, attention scoring, progressive disclosure e self-learning engine. **~3000+ linhas** distribuidas em 6 modulos.

3. **UAP** (UnifiedActivationPipeline) — Pipeline de ativacao de 12 agentes com tiered parallel loading, greeting builder de 8 secoes e workflow navigation. Implementado em Node.js. **~2400+ linhas** distribuidas em 5 modulos.

### Problemas com a Situacao Atual

1. **Fragmentacao de estado:** Tres session stores diferentes (`.carl/sessions/`, `.aios/session-state.json`, `SessionContextLoader`)
2. **Linguagem mista:** CARL em Python, MIS/UAP em Node.js — overhead de manter dois runtimes
3. **Sem enforcement de Constitution:** Nenhum sistema garante os 6 artigos automaticamente
4. **Sem agent authority boundaries:** Regras nao respeitam autoridade exclusiva de cada agente
5. **Sem suporte a Squads:** Nenhum sistema descobre domains dinamicos de squads
6. **Sem Task-First awareness:** Nenhum sistema injeta contexto de task (pre-conditions, acceptance criteria)
7. **Workflow activation manual:** Nenhum sistema ativa domains automaticamente por workflow state

### Requisitos

- Preservar 100% das capacidades de cada sistema original
- Constitution enforcement automatico (Layer 0)
- Agent-scoped domains com authority boundaries
- Squad dynamic domain discovery
- Task context injection
- Workflow-driven domain activation
- Migrar de Python para Node.js (unificar runtime)
- Manter backward compatibility durante migracao
- Performance: <100ms per-prompt injection, <500ms agent activation

---

## Decision

Criar **SYNAPSE** (Synkra Adaptive Processing & State Engine) como motor unificado de contexto que absorve e substitui completamente CARL, integrando o melhor de MIS e UAP.

### Renaming Completo

Toda referencia a "CARL" sera substituida por "SYNAPSE":
- `.carl/` → `.synapse/`
- `carl-hook.py` → `synapse-engine.js`
- `<carl-rules>` → `<synapse-rules>`
- `*carl` → `*synapse`
- `CARL/` → `SYNAPSE/`

### 32 Decisoes Ponto-a-Ponto

#### Grupo A: Heranca direta de CARL (Elementos 1-6, 23)

**A1. Per-prompt rule injection** — CARL→SYNAPSE
- **Motivo:** Unico sistema com JIT injection. Capacidade core insubstituivel.
- **Implementacao:** `synapse-engine.js` registrado como hook de `UserPromptSubmit`
- **Risco:** Baixo — mecanismo comprovado, apenas migra de Python para Node.js

**A2. Context brackets** — CARL→SYNAPSE
- **Motivo:** Adaptacao automatica ao token budget e unica no ecossistema
- **Implementacao:** Mesma logica de calculo (200K max, 4 brackets)
- **Risco:** Nenhum — logica puramente aritmetica

**A3. Star-commands** — CARL→SYNAPSE
- **Motivo:** UX elegante, zero-friction para usuario
- **Implementacao:** `*synapse` substitui `*carl`. Todos os comandos preservados + novos
- **Risco:** Baixo — renaming apenas

**A4. Keyword matching** — CARL→SYNAPSE
- **Motivo:** Ativacao transparente sem intervencao do usuario
- **Implementacao:** RECALL/EXCLUDE no `.synapse/manifest` com regex escaping
- **Risco:** Nenhum — mesma logica

**A5. Domain/rule format** — CARL→SYNAPSE
- **Motivo:** KEY=VALUE e mais simples e zero-dependency que YAML
- **Implementacao:** `.synapse/{domain}` com `DOMAIN_RULE_N=text`
- **Risco:** Nenhum — formato identicoo

**A6. Manifest format** — CARL→SYNAPSE
- **Motivo:** Zero dependencies, parsing trivial em qualquer linguagem
- **Implementacao:** `.synapse/manifest` com `{DOMAIN}_STATE`, `_RECALL`, `_EXCLUDE`
- **Risco:** Nenhum — formato identico

**A7. Exclusion system** — CARL→SYNAPSE
- **Motivo:** Global + per-domain exclusion previne falsos positivos
- **Implementacao:** Preservado com mesma semantica
- **Risco:** Nenhum

#### Grupo B: Integracao de MIS (Elementos 7-12, 24)

**B1. Persistent memory** — MIS (extension point)
- **Motivo:** Cross-session memory e capacidade unica do MIS
- **Implementacao:** Extension point via `MemoryLoader` (pro feature)
- **Risco:** Medio — requer feature gate `pro.memory.extended`
- **Mitigacao:** Graceful degradation se pro nao disponivel

**B2. Attention scoring** — MIS (filtro de relevancia)
- **Motivo:** Formula multi-fator supera keyword matching simples para memories
- **Implementacao:** Usado como filtro de relevancia para memories, nao para domains
- **Risco:** Baixo — ja comprovado no MIS
- **Nota:** Domains usam keyword matching (CARL). Memories usam attention scoring (MIS)

**B3. Progressive disclosure** — MIS (bracket-aware)
- **Motivo:** 73% token reduction e critico para eficiencia
- **Implementacao:** 3 niveis de disclosure alinhados com context brackets
- **Risco:** Baixo — ja comprovado
- **Integracao:** FRESH=minimal, MODERATE=standard, DEPLETED=full

**B4. Cognitive sectors** — MIS (agent-scoped isolation)
- **Motivo:** Isolamento natural previne contaminacao de memorias entre agentes
- **Implementacao:** Memories indexadas por agent + sector
- **Risco:** Baixo

**B5. Self-learning** — MIS (auto-evolucao)
- **Motivo:** Correcoes viram patterns que viram regras automaticamente
- **Implementacao:** Preservado como modulo pro standalone
- **Risco:** Medio — requer feature gate
- **Mitigacao:** Desabilitado por default, opt-in

**B6. Session digest** — MIS (PreCompact capture)
- **Motivo:** Captura conhecimento antes de context compact — nao perde informacao
- **Implementacao:** Hook PreCompact existente, preservado
- **Risco:** Nenhum — modulo independente

**B7. Gotcha system** — MIS core (standalone)
- **Motivo:** Auto-captura de errors 3x+ e extremamente util
- **Implementacao:** `gotchas-memory.js` preservado como modulo core
- **Risco:** Nenhum — ja funcional

#### Grupo C: Integracao de UAP (Elementos 13-19, 25)

**C1. Parallel loading** — UAP (agent activation phase)
- **Motivo:** Promise.all com tiered loading e essencial para performance
- **Implementacao:** Preservado integralmente na fase de ativacao de agente
- **Risco:** Nenhum — ja otimizado (ACT-11)

**C2. Tiered fallbacks** — UAP (every layer)
- **Motivo:** Graceful degradation garante que o sistema nunca falha silenciosamente
- **Implementacao:** Expandido para todas as 8 layers de SYNAPSE
- **Risco:** Baixo — principio comprovado, apenas expandido

**C3. Agent definitions** — UAP (preservado)
- **Motivo:** YAML com persona, commands, greeting ja funciona para 12 agentes
- **Implementacao:** Preservado integralmente em `agents/{id}.md`
- **Risco:** Nenhum

**C4. Project status** — UAP (git integration)
- **Motivo:** Git branch, modified files, recent commits sao contexto valioso
- **Implementacao:** `ProjectStatusLoader` preservado
- **Risco:** Nenhum

**C5. Permission system** — UAP (autonomy control)
- **Motivo:** Badge de permissao comunica nivel de autonomia ao usuario
- **Implementacao:** `PermissionMode` preservado
- **Risco:** Nenhum

**C6. Greeting builder** — UAP (8-section assembly)
- **Motivo:** Greeting adaptativo por session type e profile e diferencial UX
- **Implementacao:** `GreetingBuilder` preservado integralmente
- **Risco:** Nenhum

**C7. Performance metrics** — UAP (DEVMODE + metrics)
- **Motivo:** Per-loader metrics permitem diagnostico e otimizacao
- **Implementacao:** Unificado com DEVMODE de CARL
- **Risco:** Nenhum

**C8. Workflow detection** — UAP (Layer 3 pattern-based)
- **Motivo:** Deteccao de workflow state via command history + state file
- **Implementacao:** `WorkflowNavigator` preservado + domain activation
- **Risco:** Baixo

#### Grupo D: Decisoes Unificadas (Elementos 20-22)

**D1. Session management** — Unificado
- **Motivo:** Tres session stores e fragmentacao desnecessaria
- **Implementacao:** `.synapse/sessions/{uuid}.json` como store unico
- **Risco:** Medio — requer migracao de formato
- **Mitigacao:** Session migration automatica (detecta formato antigo, converte)

**D2. Engine language** — Node.js
- **Motivo:** MIS e UAP ja sao Node.js. Python (CARL) e o outlier
- **Implementacao:** `synapse-engine.js` reescreve logica de `carl-hook.py`
- **Risco:** Medio — reescrita completa do engine
- **Mitigacao:** Test coverage completo, feature parity checklist

**D3. Debug/observability** — Unificado
- **Motivo:** DEVMODE (CARL) + pipeline metrics (UAP) se complementam
- **Implementacao:** `*synapse debug` mostra domains + rules + metrics + memory stats
- **Risco:** Nenhum

#### Grupo E: Capacidades NOVAS (Elementos 26-32)

**E1. Constitution enforcement** — NOVO (Layer 0)
- **Motivo:** Constitution existe mas nenhum sistema a enforca automaticamente per-prompt
- **Implementacao:** Layer 0 domain ALWAYS_ON, NON-NEGOTIABLE, nunca desativavel
- **Risco:** Baixo — rules sao estaticas e curtas

**E2. Agent-scoped domains** — NOVO (Layer 2)
- **Motivo:** Cada agente tem autoridade exclusiva que precisa ser enforcada
- **Implementacao:** Domain auto-ativado pelo agente ativo + authority boundaries
- **Risco:** Medio — requer mapeamento completo dos 12 agentes
- **Mitigacao:** Mapeamento ja documentado (ver Analysis)

**E3. Squad dynamic domains** — NOVO (Layer 5)
- **Motivo:** Squads precisam contribuir regras especificas sem modificar global
- **Implementacao:** Discovery de `.synapse/` em `squads/*/`, namespace `{SQUAD}_{DOMAIN}`
- **Risco:** Medio — discovery pode ser lento com muitos squads
- **Mitigacao:** Cache de squad manifests, lazy loading

**E4. Task context injection** — NOVO (Layer 4)
- **Motivo:** Task-First architecture define pre/post conditions e acceptance criteria
- **Implementacao:** Leitura de task metadata quando `*develop` ou equivalente ativo
- **Risco:** Baixo — read-only, nao modifica tasks

**E5. Workflow-driven domains** — NOVO (Layer 3)
- **Motivo:** Workflow state file ja existe mas nao ativa domains
- **Implementacao:** Leitura de `.aios/{id}-state.yaml` → ativa domain do step atual
- **Risco:** Baixo — extensao natural do WorkflowNavigator

**E6. Authority boundaries** — NOVO
- **Motivo:** Constitution Art. II exige que agentes nao assumam autoridade alheia
- **Implementacao:** Regras negativas per-agent (NEVER push, NEVER create stories)
- **Risco:** Baixo — regras estaticas derivadas da Constitution

**E7. Executor type awareness** — NOVO
- **Motivo:** Task-First spec define 4 tipos de executor com necessidades diferentes
- **Implementacao:** Ajusta nivel de injecao por tipo (Agent=full, Worker=minimal, Human=checklist)
- **Risco:** Baixo — condicional simples

---

## Constitution Compliance Verification

| Artigo | Principio | Como SYNAPSE Enforca | Layer |
|--------|-----------|---------------------|-------|
| **I. CLI First** | CLI > Observability > UI | Rule constitucional: "All new functionality MUST work 100% via CLI before any UI" | L0 |
| **II. Agent Authority** | Autoridade exclusiva | AUTHORITY_BOUNDARIES per-agent: NEVER clauses + delegation rules | L0 + L2 |
| **III. Story-Driven** | Zero code sem story | Domain STORY com keyword activation + task pre-condition check | L4 + L6 |
| **IV. No Invention** | Specs rastreiam a requisitos | Rule constitucional: "Every spec MUST trace to FR-*, NFR-*, CON-*, or research" | L0 |
| **V. Quality First** | Quality gates pass | Domain QA enforca: lint, typecheck, test, build MUST pass | L0 + L2 |
| **VI. Absolute Imports** | `@/` prefix | Rule GLOBAL: "Use absolute imports @/ — never relative ../" | L1 |

---

## Task-First Integration Design

### Executor Type → Injection Level

```yaml
executor_injection:
  Agente:
    layers: [L0, L1, L2, L3, L4, L5, L6, L7]  # Full injection
    memory: enabled (if pro)
    greeting: full 8-section
  Worker:
    layers: [L0, L1]  # Minimal — workers are deterministic
    memory: disabled
    greeting: none
  Humano:
    layers: [L0, L1, L4]  # Constitution + Global + Task checklist
    memory: disabled
    greeting: task-focused
  Clone:
    layers: [L0, L1, L2, L4]  # Constitution + Global + Agent + Task
    memory: clone DNA context
    greeting: agent-style
```

### Task Context Injection Format

```xml
<synapse-rules>
  <!-- ... other layers ... -->

  [TASK CONTEXT]
  Active Task: implement-user-auth
  Story: STORY-42
  Executor: @dev (Agente)

  Pre-conditions:
    [x] Story validated by @po
    [x] Architecture approved by @architect
    [ ] Database schema created by @data-engineer

  Acceptance Criteria:
    - [ ] Login endpoint returns JWT token
    - [ ] Refresh token rotation implemented
    - [ ] Rate limiting on auth endpoints

  File List:
    - src/auth/login.ts (new)
    - src/auth/middleware.ts (modify)
    - tests/auth/login.test.ts (new)

  <!-- ... other layers ... -->
</synapse-rules>
```

---

## Squad Dynamic Domain Protocol

### Discovery

```
1. Scan ./squads/*/squad.yaml
2. For each squad with .synapse/ directory:
   a. Parse .synapse/manifest
   b. Namespace domains: {SQUAD}_{DOMAIN}
   c. Apply extends mode (extend|override|none)
3. Merge with global manifest
4. Domains available for keyword matching
```

### Extends Modes

| Mode | Behavior |
|------|----------|
| `extend` | Squad domains ADD to global (default) |
| `override` | Squad domains REPLACE global for overlapping keys |
| `none` | Squad domains are independent |

### Namespace Example

```ini
# squads/etl-squad/.synapse/manifest
ETL_PIPELINE_STATE=active
ETL_PIPELINE_RECALL=etl,extract,transform,load,pipeline
ETL_PIPELINE_EXCLUDE=frontend,ui

# squads/etl-squad/.synapse/etl-pipeline
ETL_PIPELINE_RULE_0=Follow ETL best practices for data transformation
ETL_PIPELINE_RULE_1=Validate data schema before and after transformation
ETL_PIPELINE_RULE_2=Log pipeline execution metrics
```

---

## Agent Authority Boundary Enforcement

### Per-Agent Authority Rules (Layer 2)

```ini
# .synapse/agent-dev
DEV_RULE_AUTH_0=NEVER execute git push — delegate to @devops
DEV_RULE_AUTH_1=NEVER create or modify stories — delegate to @po/@sm
DEV_RULE_AUTH_2=ONLY modify code files, tests, and Dev Agent Record in stories
DEV_RULE_AUTH_3=Commits are LOCAL only — never push to remote

# .synapse/agent-qa
QA_RULE_AUTH_0=ONLY modify "QA Results" section in stories
QA_RULE_AUTH_1=NEVER commit code directly
QA_RULE_AUTH_2=Quality verdicts are ADVISORY — teams choose their bar

# .synapse/agent-devops
DEVOPS_RULE_AUTH_0=EXCLUSIVE authority for git push to remote
DEVOPS_RULE_AUTH_1=EXCLUSIVE authority for PR creation and merge
DEVOPS_RULE_AUTH_2=EXCLUSIVE authority for releases and tags
DEVOPS_RULE_AUTH_3=MUST run pre-push quality gate before any push
```

---

## Migration Path: CARL → SYNAPSE (Incremental)

### Phase 1: Preparation (No Breaking Changes)

1. Criar diretorio `SYNAPSE/`
2. Criar `.synapse/` com copias de `.carl/` files
3. Implementar `synapse-engine.js` com feature parity de `carl-hook.py`
4. Testes unitarios garantem parity

### Phase 2: Dual-Mode (Backward Compatible)

1. `synapse-engine.js` detecta `.synapse/` primeiro, fallback para `.carl/`
2. Output usa `<synapse-rules>` se `.synapse/` presente, senao `<carl-rules>`
3. Registrar `synapse-engine.js` em `settings.json` como hook
4. Desregistrar `carl-hook.py`
5. Monitorar por 1 semana

### Phase 3: Full Migration

1. Remover `.carl/` directory
2. Remover `carl-hook.py`
3. Atualizar `CLAUDE.md` para referenciar `<synapse-rules>`
4. Renomear `*carl` → `*synapse`
5. Atualizar todas as skills que referenciam CARL

### Phase 4: New Features

1. Implementar Layer 0 (Constitution enforcement)
2. Implementar Layer 2 (Agent-scoped domains)
3. Implementar Layer 3 (Workflow-driven activation)
4. Implementar Layer 4 (Task context injection)
5. Implementar Layer 5 (Squad dynamic domains)

---

## Riscos e Mitigacoes

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|--------------|---------|-----------|
| R1 | Reescrita Python→Node.js introduz bugs | Media | Alto | Test coverage completo, feature parity checklist, dual-mode transition |
| R2 | Performance degradada com 8 layers | Baixa | Medio | Per-layer timeout budget, early exit, lazy loading |
| R3 | Squad domain discovery lento | Baixa | Baixo | Cache de manifests, scan incremental |
| R4 | Constitution rules muito restritivas | Baixa | Medio | NON-NEGOTIABLE para Art. I-II, WARN para Art. III-V, INFO para Art. VI |
| R5 | Conflito de namespace em squad domains | Baixa | Baixo | Namespace `{SQUAD}_{DOMAIN}` elimina colisao |
| R6 | Session migration perde dados | Baixa | Alto | Backup automatico antes de migracao, rollback path |
| R7 | Keyword matching falsos positivos | Media | Baixo | EXCLUDE keywords refinados, per-domain granularity |
| R8 | Token budget excedido com 8 layers | Media | Medio | Bracket-aware injection, progressive disclosure, hard cap |

---

## Consequences

### Positivas

1. **Unificacao de runtime:** Single Node.js engine substitui Python + Node.js
2. **Constitution enforcement automatico:** 6 artigos garantidos a cada prompt
3. **Agent authority protection:** Boundaries impossíveis de violar
4. **Squad extensibility:** Domains dinamicos sem modificar core
5. **Task-First alignment:** Contexto de task injetado automaticamente
6. **Workflow automation:** Domain activation segue workflow state
7. **Single session store:** `.synapse/sessions/` unifica 3 stores
8. **Observability completa:** DEVMODE + pipeline metrics + memory stats

### Negativas

1. **Esforco de migracao:** Reescrita do engine Python→Node.js (~2-3 semanas dev)
2. **Complexidade de 8 layers:** Mais layers = mais pontos de falha (mitigado por fallbacks)
3. **Squad adoption curve:** Squads precisam criar `.synapse/` para contribuir domains
4. **Backward compatibility period:** Dual-mode durante transicao adiciona complexidade temporaria

### Neutras

1. **Formatos preservados:** KEY=VALUE, YAML, Markdown+YAML continuam coexistindo
2. **MIS como extension point:** Memoria persistente continua como feature pro
3. **UAP preservado internamente:** Pipeline de ativacao nao muda, apenas se integra melhor

---

*ADR-001 v1.0.0 — SYNAPSE Unified Context Engine*
*Accepted: 2026-02-10*
*CLI First | Task-First | Constitution*
