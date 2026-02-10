# HANDOFF: SYNAPSE Epic — Analise de Impacto nos Epics Existentes

> Documento de handoff para revisao encadeada:
> **@architect (Aria)** → **@pm (Phoenix)** → **@aios-master (Orion)** → **@po (Pax)**

**Versao:** 1.0.0
**Data:** 2026-02-10
**Autor:** Analise automatizada
**Objetivo:** Garantir que o Epic SYNAPSE nao conflita com stories em aberto e se integra coesamente ao roadmap existente.

---

## Sumario Executivo

O **SYNAPSE** (Synkra Adaptive Processing & State Engine) propoe unificar tres sistemas — CARL (regras per-prompt), MIS (memoria persistente) e UAP (ativacao de agentes) — num unico motor de contexto adaptativo com 8 camadas hierarquicas.

Esta analise compara o plano SYNAPSE contra **4 epics ativos** com **~35 stories** para identificar:

1. **Conflitos diretos** — stories que modificam os mesmos arquivos/modulos que SYNAPSE precisa alterar
2. **Sobreposicoes** — funcionalidades planejadas em SYNAPSE que ja existem ou estao em progresso
3. **Dependencias** — stories que SYNAPSE precisa como pre-requisito, ou que precisam de SYNAPSE
4. **Oportunidades de alinhamento** — sinergias que reduzem esforco total se coordenadas

### Veredicto Resumido

| Epic | Conflitos | Sobreposicoes | Dependencias | Risco |
|------|-----------|---------------|--------------|-------|
| **ACT** (Activation Pipeline) | 3 CRITICOS | 4 ALTOS | 5 DIRETAS | **ALTO** |
| **IDS** (Incremental Development) | 0 | 1 MEDIO | 2 INDIRETAS | **BAIXO** |
| **MIS** (Memory Intelligence) | 2 CRITICOS | 3 ALTOS | 3 DIRETAS | **ALTO** |
| **PRO** (AIOS Pro Architecture) | 1 MEDIO | 1 BAIXO | 2 DIRETAS | **MEDIO** |

**Recomendacao principal:** SYNAPSE deve ser implementado em fases coordenadas com ACT e MIS, **nao como epic independente**. O maior risco e modificar `unified-activation-pipeline.js` e `greeting-builder.js` que foram recentemente reescritos no Epic ACT.

---

## 1. EPIC ACT — Unified Agent Activation Pipeline

### 1.1 Status Atual do Epic

| Story | Status | Escopo Relevante para SYNAPSE |
|-------|--------|-------------------------------|
| ACT-1 | Done | GreetingPreferenceManager — afeta greeting output |
| ACT-2 | Done | user_profile audit — `bob` mode restringe greeting |
| ACT-3 | Done | ProjectStatusLoader — cache invalidation via git fingerprint |
| ACT-4 | Done | PermissionMode — `*yolo` command em 12 agentes |
| ACT-5 | Done | WorkflowNavigator + Bob — workflow detection |
| ACT-6 | Done | **UnifiedActivationPipeline** — pipeline unificado (420+ linhas) |
| ACT-7 | Done | Context-aware greetings — secoes adaptativas |
| ACT-8 | Done | Agent config loading + document governance |
| ACT-9 | Done | Language propagation (superseded by ACT-12) |
| ACT-10 | Superseded | → ACT-11 |
| ACT-11 | Done | **Pipeline performance** — tiered loading, 168ms p50 |
| ACT-12 | Done | **Language delegation** to Claude Code native settings |

### 1.2 Conflitos Criticos

#### CONFLITO ACT-C1: UnifiedActivationPipeline.js (CRITICO)

**Arquivo:** `.aios-core/development/scripts/unified-activation-pipeline.js` (~687 linhas)

- **ACT-6/ACT-11** acabaram de reescrever este arquivo com tiered loading (Tier 1: 80ms Critical, Tier 2: 120ms High, Tier 3: 180ms Best-effort), profiling, quality metrics e performance otimizada (168ms p50)
- **SYNAPSE** propoe absorver este pipeline no `synapse-engine.js` com 8 layers hierarquicos e registrar um novo hook `UserPromptSubmit`

**Impacto:** SYNAPSE precisa preservar toda a arquitetura de tiers do ACT-11 ou regredira performance de 168ms para potencialmente >500ms.

**Resolucao proposta:**
- SYNAPSE **nao deve reescrever** o pipeline — deve **estender** via extension points
- Layer 2 (AGENT-SCOPED) do SYNAPSE pode ser injetado como Tier 2 loader no pipeline existente
- `synapse-engine.js` atua como hook per-prompt **complementar** ao pipeline de ativacao, nao substituto

#### CONFLITO ACT-C2: greeting-builder.js (CRITICO)

**Arquivo:** `.aios-core/development/scripts/greeting-builder.js` (~1404 linhas)

- **ACT-7** adicionou context-aware greeting sections (58 tests)
- **ACT-12** removeu i18n constants e language propagation (228 tests)
- **SYNAPSE** propoe integrar greeting builder como "7-section assembly" preservado

**Impacto:** O greeting-builder.js atual ja e context-aware e foi limpo de i18n. SYNAPSE nao deve re-adicionar complexidade removida pelo ACT-12.

**Resolucao proposta:**
- SYNAPSE injeta regras via `additionalContext` (hook output) — **paralelo** ao greeting
- Greeting builder permanece como esta (ACT ownership)
- SYNAPSE contribui contexto que o greeting builder pode consumir, nao o contrario

#### CONFLITO ACT-C3: 12 Agent Definitions (CRITICO)

**Arquivo:** `.aios-core/development/agents/*.md` (12 arquivos)

- **ACT-4** adicionou `*yolo` a todos os 12 agentes
- **ACT-6** atualizou STEP 3 de todos para referenciar unified pipeline
- **ACT-8** enriqueceu config requirements de 5 agentes
- **SYNAPSE** propoe auto-ativacao de domains por agente (Layer 2) e authority boundaries

**Impacto:** SYNAPSE nao precisa modificar agent definitions se a ativacao for baseada em deteccao (ler o agente ativo da session) em vez de declaracao nos `.md` files.

**Resolucao proposta:**
- SYNAPSE detecta agente ativo via `session-state` (ja fornecido pelo pipeline ACT)
- Domain mapping `@agent → domain` fica no `.synapse/manifest`, nao nos agent `.md`
- Authority boundaries sao regras no domain file (`.synapse/dev`, `.synapse/qa`, etc.)
- **Zero modificacoes** em agent definition files

### 1.3 Sobreposicoes

| SYNAPSE Feature | ACT Equivalente | Resolucao |
|-----------------|-----------------|-----------|
| Layer 3: Workflow detection | ACT-5: WorkflowNavigator | SYNAPSE **consome** output do WorkflowNavigator, nao reimplementa |
| Layer 7: Star-commands | ACT-4: `*yolo` command system | SYNAPSE adiciona `*synapse` como novo comando; nao toca em `*yolo` |
| Per-prompt injection | ACT-6: Pipeline activation | SYNAPSE opera via **hook** (per-prompt), pipeline opera na **ativacao** (one-time). Complementares. |
| Context brackets | ACT-11: Pipeline metrics | SYNAPSE brackets monitoram tokens restantes; ACT-11 metrics monitoram latencia. Diferentes dimensoes. |

### 1.4 Dependencias

| SYNAPSE precisa de | Fornecido por | Status |
|--------------------|---------------|--------|
| Agente ativo (session) | ACT-6 SessionContextLoader | Done |
| Workflow state | ACT-5 WorkflowNavigator | Done |
| Permission mode | ACT-4 PermissionMode | Done |
| Project status | ACT-3 ProjectStatusLoader | Done |
| Pipeline extension point | ACT-6/ACT-11 Tiered loading | Done (Tier 2 Enrich) |

**Conclusao ACT:** Todas as dependencias estao satisfeitas. SYNAPSE pode ser implementado como **consumer** do pipeline ACT, nao como substituto.

---

## 2. EPIC IDS — Incremental Development System

### 2.1 Status Atual do Epic

| Story | Status | Escopo Relevante para SYNAPSE |
|-------|--------|-------------------------------|
| IDS-1 | Done | Entity Registry — 474 entities indexed |
| IDS-2 | Done | Decision Engine — REUSE/ADAPT/CREATE |
| IDS-3 | Done | Self-Updating Registry — file watchers |
| IDS-4a | Ready for Review | Data integrity healing |
| IDS-4b | Draft | Performance monitoring |
| IDS-5a | Ready for Review | Verification Gates G1-G4 (advisory) |
| IDS-5b | Draft | Blocking Gates G5-G6 |
| IDS-6 | Draft | Constitution Article IV-A |
| IDS-7 | Ready for Review | aios-master Governor (FrameworkGovernor facade) |

### 2.2 Conflitos

**Nenhum conflito direto.** IDS opera no plano de **entidades do framework** (tasks, agents, workflows, templates). SYNAPSE opera no plano de **contexto per-prompt** (regras, domains, memories). Sistemas ortogonais.

### 2.3 Sobreposicao Media

| SYNAPSE Feature | IDS Equivalente | Resolucao |
|-----------------|-----------------|-----------|
| Layer 0: Constitution enforcement | IDS-6: Constitution Art. IV-A | Complementares. IDS-6 formaliza Art. IV-A (REUSE>ADAPT>CREATE). SYNAPSE Layer 0 enforca Arts. I-VI per-prompt. Nao ha overlap. |

### 2.4 Dependencias Indiretas

| Relacao | Detalhe |
|---------|---------|
| SYNAPSE → IDS Entity Registry | SYNAPSE pode consultar o registry para validar que domains referenciam entidades existentes (futuro) |
| IDS Gates → SYNAPSE domains | Gates G1-G4 poderiam ativar SYNAPSE domains especificos durante verificacao (futuro, nao bloqueante) |

### 2.5 Oportunidade de Alinhamento

**IDS-7 (FrameworkGovernor)** adiciona Step 0 advisory a 6 task files. SYNAPSE Layer 4 (TASK) poderia consumir essas advisories para injetar contexto de IDS no prompt quando o agente esta executando tasks com Step 0.

**Acao:** Criar story futura `SYNAPSE-IDS-INTEGRATION` apos ambos estarem estabilizados. Nao e bloqueante.

**Conclusao IDS:** Risco BAIXO. Sistemas ortogonais. Oportunidades futuras documentadas.

---

## 3. EPIC MIS — Memory Intelligence System

### 3.1 Status Atual do Epic

| Story | Status | Escopo Relevante para SYNAPSE |
|-------|--------|-------------------------------|
| MIS-1 | Done | Arquitetura — 7 design principles, 9 ADRs |
| MIS-2 | Done | Dead code cleanup — 2,397 linhas removidas |
| MIS-3 | Done | Session Digest (PreCompact hook) — `extractor.js` |
| MIS-4 | Done | Progressive Retrieval — attention scoring, 3 layers |
| MIS-5 | InReview | Self-Learning Engine — correction tracking, heuristics |
| MIS-6 | Done | **Pipeline Integration** — MemoryLoader no Tier 2 do pipeline |
| MIS-7 | Pending | CLAUDE.md auto-evolution — regras propostas com aprovacao |

### 3.2 Conflitos Criticos

#### CONFLITO MIS-C1: Memory Integration no Pipeline (CRITICO)

**Arquivo:** `unified-activation-pipeline.js` (Tier 2 Enrich phase)

- **MIS-6** acabou de integrar o MemoryLoader como extension point no Tier 2 do pipeline
- **SYNAPSE** propoe um `MemoryLoader` proprio na sua arquitetura de layers

**Impacto:** Se SYNAPSE criar um segundo MemoryLoader, havera conflito de carregamento duplo — memorias podem ser injetadas duas vezes ou com formatos inconsistentes.

**Resolucao proposta:**
- SYNAPSE **reutiliza** o MemoryLoader do MIS-6 como fonte de dados
- SYNAPSE Layer 2 (AGENT-SCOPED) consulta o MIS para obter memorias relevantes
- **Nao criar MemoryLoader duplicado** — usar a API existente: `loadForAgent()`, `queryMemories()`, `getHotMemories()`

#### CONFLITO MIS-C2: Session Store Unificado (CRITICO)

**Arquivos afetados:**
- SYNAPSE propoe `.synapse/sessions/{uuid}.json` como unified session store
- MIS usa `.aios/session-digests/` para session digests (MIS-3)
- MIS usa `.aios/memories/` para memorias persistentes (MIS-4)
- ACT pipeline usa `SessionContextLoader` com session-state

**Impacto:** 3 session stores em 3 locais diferentes. SYNAPSE propoe unificar mas isso quebraria o MIS-3/MIS-4 que ja estao em producao.

**Resolucao proposta:**
- SYNAPSE session store (`.synapse/sessions/`) gerencia **apenas** estado de domains/brackets/overrides per-session
- MIS mantem seus stores em `.aios/` (session-digests, memories) — ownership MIS
- Pipeline mantem `SessionContextLoader` — ownership ACT
- SYNAPSE **le** de todos os stores mas **escreve** apenas no seu
- Documentar claramente: cada sistema owns seu store, SYNAPSE e consumer dos demais

### 3.3 Sobreposicoes Altas

| SYNAPSE Feature | MIS Equivalente | Resolucao |
|-----------------|-----------------|-----------|
| Progressive disclosure (bracket-aware) | MIS-4: Progressive retrieval (3 layers) | SYNAPSE **invoca** MIS progressive retrieval com token budget baseado no bracket atual. Nao reimplementa. |
| Self-learning | MIS-5: Self-Learning Engine (680+ linhas, 94 tests) | SYNAPSE **nao reimplementa**. MIS-5 e a implementacao canonica. SYNAPSE apenas consome heuristic candidates (output). |
| Memory retrieval | MIS-4: Attention scoring + sector filtering | SYNAPSE usa API `queryMemories()` com sector filtering ja implementado no MIS-4. |

### 3.4 Dependencias Diretas

| SYNAPSE precisa de | Fornecido por | Status |
|--------------------|---------------|--------|
| Memory API (loadForAgent, queryMemories) | MIS-6 Pipeline Integration | Done |
| Session digests | MIS-3 PreCompact Hook | Done |
| Attention scoring | MIS-4 Progressive Retrieval | Done |
| Heuristic candidates | MIS-5 Self-Learning Engine | InReview |

### 3.5 Oportunidade Critica: MIS-7 + SYNAPSE

**MIS-7 (CLAUDE.md Auto-Evolution)** propoe gerar regras automaticamente a partir de heuristics do MIS-5. SYNAPSE propoe o mesmo conceito via "auto-evolucao de regras" no design document.

**Proposta de unificacao:**
- MIS-7 gera heuristic candidates (correções repetidas → regras propostas)
- SYNAPSE recebe essas regras propostas e as adiciona como **regras de domain** no `.synapse/` com status `PROPOSED`
- User aprova via `*synapse approve-rule {id}` → status muda para `ACTIVE`
- Isso elimina duplicacao e integra ambos os sistemas naturalmente

**Acao:** MIS-7 deve ser re-scoped para outputar rules no formato SYNAPSE (`{DOMAIN}_RULE_N=text`). Nao e bloqueante para SYNAPSE fase 1.

**Conclusao MIS:** Risco ALTO mas gerenciavel. A chave e SYNAPSE ser **consumer** do MIS, nao reimplementar. MIS-7 e a melhor oportunidade de sinergia.

---

## 4. EPIC PRO — AIOS Pro Architecture

### 4.1 Status Atual do Epic

| Story | Status | Escopo Relevante para SYNAPSE |
|-------|--------|-------------------------------|
| PRO-1 | Done | Open Core investigation — ADRs aprovados |
| PRO-4 | Done | Config split — 4-level hierarchy (config-resolver.js) |
| PRO-5 | Done | aios-pro repo bootstrap — git submodule `pro/` |
| PRO-6 | In Progress | License & Feature gating — `feature-gate.js` (279 tests) |
| PRO-7 | In Progress | License server — API deployed |
| PRO-8 | Ready | Secure distribution system |

### 4.2 Conflito Medio

#### CONFLITO PRO-C1: Config Hierarchy (MEDIO)

**Arquivo:** `.aios-core/core/config/config-resolver.js`

- **PRO-4** implementou 4-level config hierarchy (Framework L1 → Project L2 → Pro Extension → Local L4)
- **SYNAPSE** propoe `.synapse/manifest` como configuracao central com formato KEY=VALUE

**Impacto:** Dois sistemas de configuracao poderiam confundir o usuario. Porem, operam em escopos diferentes:
- `config-resolver.js` resolve **configuracao do framework** (settings, paths, features)
- `.synapse/manifest` define **domains de regras** (quais regras injetar, keywords, estados)

**Resolucao proposta:**
- Escopos sao **complementares**, nao concorrentes
- SYNAPSE pode ler configuracoes do config-resolver (ex: feature gates, agent configs)
- `.synapse/manifest` e um "rule registry", nao um config file generico
- Documentar a distincao claramente

### 4.3 Sobreposicao Baixa

| SYNAPSE Feature | PRO Equivalente | Resolucao |
|-----------------|-----------------|-----------|
| Pro-aware loading | PRO-5: `pro-detector.js` | SYNAPSE usa `isProAvailable()` do pro-detector para decidir se carrega memory layers |

### 4.4 Dependencias Diretas

| SYNAPSE precisa de | Fornecido por | Status |
|--------------------|---------------|--------|
| `isProAvailable()` | PRO-5 pro-detector.js | Done |
| Feature gates | PRO-6 feature-gate.js | In Progress (279 tests passing) |

### 4.5 Consideracao: Feature Gate para SYNAPSE

SYNAPSE deve ser feature-gated? Consideracoes:

| Aspecto | Core (Free) | Pro (Paid) |
|---------|-------------|------------|
| Per-prompt rule injection (CARL core) | Sim — fundamental | — |
| Context brackets | Sim — fundamental | — |
| Star-commands | Sim — fundamental | — |
| Memory integration (MIS layers) | — | Sim — pro feature |
| Self-learning heuristics | — | Sim — pro feature |
| Squad dynamic domains | — | Sim — pro feature |

**Proposta:** SYNAPSE core (Layers 0-3, 6-7) e **Core (free)**. Layers 4-5 (Task, Squad) e memory integration sao **Pro features** gated por `pro.synapse.extended`.

**Acao para PRO-6:** Registrar feature gate `pro.synapse.extended` no `feature-registry.yaml`. Nao e bloqueante — pode ser adicionado depois.

**Conclusao PRO:** Risco MEDIO. Config hierarchy e o ponto de atencao. Feature gating e oportunidade, nao conflito.

---

## 5. Mapa de Conflitos Consolidado

```
SYNAPSE proposto          Epics existentes          Resolucao
═══════════════           ════════════════           ═════════

synapse-engine.js ──┬──→ unified-activation-pipeline.js (ACT-6/11)
(novo hook)         │    CONFLITO: Nao substituir. Complementar via hook.
                    │
                    ├──→ greeting-builder.js (ACT-7/12)
                    │    CONFLITO: Nao modificar. SYNAPSE opera via additionalContext.
                    │
                    ├──→ MemoryLoader (MIS-6)
                    │    CONFLITO: Nao duplicar. Consumir API existente.
                    │
                    └──→ config-resolver.js (PRO-4)
                         MEDIO: Escopos complementares. Documentar.

.synapse/sessions/ ────→ .aios/session-digests/ (MIS-3)
(session store)     │    .aios/memories/ (MIS-4)
                    │    SessionContextLoader (ACT-6)
                    │    CONFLITO: Cada sistema owns seu store.
                    │    SYNAPSE so escreve no .synapse/.

Layer 0 Constitution ──→ IDS-6 Article IV-A
                         NENHUM CONFLITO: Complementares (arts diferentes).

Self-learning ─────────→ MIS-5 Self-Learning Engine
                         SOBREPOSICAO: SYNAPSE consome, nao reimplementa.

Auto-evolution ────────→ MIS-7 CLAUDE.md Auto-Evolution
                         SINERGIA: Unificar output format = synapse rules.
```

---

## 6. Estrategia de Implementacao Proposta

### 6.1 Fases Recomendadas

#### Fase 1: SYNAPSE Core (sem conflitos)

**Escopo:** Hook per-prompt, `.synapse/` directory, manifest, domains, brackets, star-commands.
**Conflitos:** ZERO — cria arquivos novos, nao modifica existentes.
**Esforco estimado:** 20-30h

| Deliverable | Descricao | Risco |
|-------------|-----------|-------|
| `synapse-engine.js` | Hook Node.js registrado em settings.json | Baixo |
| `.synapse/manifest` | Domain registry (migrado de `.carl/manifest`) | Baixo |
| `.synapse/{domain}` | Domain rule files (migrado de `.carl/`) | Baixo |
| `.synapse/sessions/` | Session state (brackets, overrides) | Baixo |
| Layer 0 (Constitution) | Rules NON-NEGOTIABLE injetadas sempre | Baixo |
| Layer 1 (Global) | Rules ALWAYS_ON | Baixo |
| Layer 6 (Keyword) | RECALL matching do manifest | Baixo |
| Layer 7 (Star-command) | `*synapse`, `*brief`, `*dev`, etc. | Baixo |

**Pre-requisito:** Nenhum. Pode iniciar imediatamente.
**Ponto de atencao:** Desabilitar `carl-hook.py` ao ativar `synapse-engine.js` para evitar injecao dupla.

#### Fase 2: Agent & Workflow Integration (coordenar com ACT)

**Escopo:** Layers 2-3 que consomem dados do pipeline ACT.
**Conflitos:** MEDIO — le de ACT, mas nao modifica.
**Esforco estimado:** 15-20h

| Deliverable | Descricao | Dependencia |
|-------------|-----------|-------------|
| Layer 2 (Agent-scoped) | Auto-detecta agente ativo via session state | ACT-6 Done |
| Layer 3 (Workflow) | Le workflow state do WorkflowNavigator | ACT-5 Done |
| Authority boundaries | Regras negativas por agente | Nenhuma |
| Agent domain mapping | `@dev → DEV`, `@qa → QA` no manifest | Nenhuma |

**Pre-requisito:** Fase 1 completa. Epic ACT Done.

#### Fase 3: Memory Integration (coordenar com MIS)

**Escopo:** SYNAPSE como consumer da API MIS.
**Conflitos:** ALTO se mal coordenado.
**Esforco estimado:** 10-15h

| Deliverable | Descricao | Dependencia |
|-------------|-----------|-------------|
| MIS consumer | SYNAPSE invoca `loadForAgent()` e `queryMemories()` | MIS-6 Done |
| Bracket-aware disclosure | Token budget do bracket informa MIS progressive retrieval | MIS-4 Done |
| Heuristic consumption | Recebe candidates do MIS-5 self-learner | MIS-5 InReview |

**Pre-requisito:** Fase 2 completa. MIS-5 merged.
**Regra critica:** SYNAPSE **NUNCA** escreve em `.aios/memories/` — apenas le via API.

#### Fase 4: Advanced Features (coordenar com PRO + IDS)

**Escopo:** Layers 4-5, feature gating, auto-evolution.
**Conflitos:** BAIXO se feature-gated.
**Esforco estimado:** 15-20h

| Deliverable | Descricao | Dependencia |
|-------------|-----------|-------------|
| Layer 4 (Task) | Injeta context de task em execucao | Nenhuma |
| Layer 5 (Squad) | Descobre `.synapse/` dentro de squads ativos | Nenhuma |
| Feature gate | `pro.synapse.extended` para Layers 4-5 | PRO-6 (In Progress) |
| MIS-7 integration | Recebe rules propostas do auto-evolution | MIS-7 (Pending) |

**Pre-requisito:** Fase 3 completa. PRO-6 feature-gate.js funcional.

### 6.2 Timeline vs Epics Existentes

```
Sprint atual     Sprint +1         Sprint +2         Sprint +3
─────────────    ─────────────     ─────────────     ─────────────
[ACT: Done]
[IDS: Wave 2]    [IDS: Wave 2]     [IDS: Complete]
[MIS-5: Review]  [MIS-6: Done]     [MIS-7: Dev]      [MIS-7: Done]
[PRO-6: Dev]     [PRO-7: Deploy]   [PRO-8: Dev]      [PRO-8: Done]
                 [SYNAPSE Fase 1]  [SYNAPSE Fase 2]  [SYNAPSE F3+F4]
```

---

## 7. Regras de Convivencia (Governance)

### 7.1 Ownership de Arquivos

| Arquivo/Diretorio | Owner | SYNAPSE pode |
|-------------------|-------|-------------|
| `.synapse/` | SYNAPSE | Read/Write |
| `.carl/` | CARL (legado, deprecated) | Read only (migration) |
| `.aios-core/development/scripts/unified-activation-pipeline.js` | ACT | Read only |
| `.aios-core/development/scripts/greeting-builder.js` | ACT | Read only |
| `.aios-core/development/agents/*.md` | ACT | Read only |
| `.aios/session-digests/` | MIS | Read only |
| `.aios/memories/` | MIS | Read only (via API) |
| `pro/memory/*` | MIS (aios-pro) | Read only (via API) |
| `.aios-core/core/config/config-resolver.js` | PRO | Read only (consume) |
| `.aios-core/core/ids/*` | IDS | Read only |
| `.claude/hooks/` | SYNAPSE (new hook) | Write `synapse-engine.js` |
| `.claude/settings.json` | Shared | Append hook registration |

### 7.2 Principios Inegociaveis

1. **SYNAPSE nao reescreve codigo de outros epics** — consumer, nao producer
2. **Cada sistema owns seu store** — `.synapse/`, `.aios/`, `pro/` sao dominios exclusivos
3. **Hook per-prompt e complementar ao pipeline** — nao substituto
4. **Memory layers invocam API do MIS** — nao reimplementam retrieval/scoring
5. **Agent definitions nao sao modificadas** — domain mapping fica no `.synapse/manifest`
6. **Constitution Layer 0 nao overrida IDS-6** — artigos diferentes, complementares

---

## 8. Perguntas para a Cadeia de Revisao

### Para @architect (Aria)

1. **ACT-C1:** Concordamos que `synapse-engine.js` opera como **hook complementar** e nao substitui `unified-activation-pipeline.js`? O design document atual propoe "absorver" o UAP — precisamos ajustar a linguagem para "consumir via extension points".

2. **MIS-C1:** A proposta de SYNAPSE usar `loadForAgent()` + `queryMemories()` como API respeita a arquitetura MIS? Ou precisamos de uma interface intermediaria?

3. **Fase 1 safety:** Criar `.synapse/` e `synapse-engine.js` como hook paralelo (com `carl-hook.py` desabilitado) e seguro para iniciar sem impactar outros epics?

4. **Layer hierarchy:** Os 8 layers propostos sao compatíveis com o tiered loading do ACT-11? Layers executam per-prompt (hook) enquanto tiers executam on-activation (pipeline).

### Para @pm (Phoenix)

5. **Prioridade:** Dado que ACT esta Done e MIS-5 esta InReview, qual a prioridade relativa de SYNAPSE vs completar Wave 2 do IDS (IDS-4b, IDS-5b, IDS-6)?

6. **Esforco:** O esforco estimado total (60-85h em 4 fases) e aceitavel no contexto do roadmap atual?

7. **Feature boundary:** SYNAPSE core (Layers 0-3, 6-7) como Core free e Layers 4-5 como Pro e alinhado com a estrategia comercial definida no PRO-1?

### Para @aios-master (Orion)

8. **Squad domains:** O protocolo de discovery (`.synapse/` dentro de `squads/{name}/`) respeita o squad system existente? Namespace `{SQUAD}_{DOMAIN}` evita colisoes?

9. **Task-first:** Layer 4 (Task context) injetando acceptance criteria e pre-conditions no prompt e compativel com o task format specification v1?

10. **12 agentes:** O domain mapping proposto (tabela na secao 3.3 do plano) cobre todos os 12 agentes com keywords e authority boundaries corretos?

### Para @po (Pax)

11. **Stories:** Quantas stories sao necessarias para o Epic SYNAPSE? Proposta: 8 stories (2 por fase), mais 1 story de migration (carl → synapse) e 1 story de retrospective.

12. **Acceptance criteria global:** Qual e o criterio de sucesso do epic? Proposta: "100% das capacidades de CARL preservadas + per-prompt injection <100ms + zero conflitos com epics ACT/MIS/IDS/PRO".

13. **Riscos aceitos:** O risco ALTO com MIS e gerenciavel dado que MIS-6 ja fornece a API necessaria? A dependencia de MIS-5 (InReview) bloqueia apenas Fase 3, nao Fase 1.

---

## 9. Checklist de Validacao

Antes de aprovar o Epic SYNAPSE, cada revisor deve confirmar:

### @architect
- [ ] Design document ajustado: SYNAPSE como **consumer** do pipeline ACT (nao substituto)
- [ ] Memory integration via API MIS (nao reimplementacao)
- [ ] Session store isolation documentada (`.synapse/` vs `.aios/` vs `pro/`)
- [ ] 8-layer hierarchy compativel com tiered loading ACT-11
- [ ] `synapse-engine.js` hook registration nao conflita com hooks existentes

### @pm
- [ ] Prioridade relativa definida vs IDS Wave 2, MIS-7, PRO-8
- [ ] Esforco (60-85h) aprovado para inclusao no roadmap
- [ ] Feature boundary Core vs Pro alinhada com estrategia PRO-1
- [ ] Timeline de 4 sprints viavel

### @aios-master
- [ ] Squad discovery protocol validado
- [ ] Task context injection compativel com task format spec
- [ ] Domain mapping cobre todos 12 agentes
- [ ] Constitution Layer 0 inclui todos 6 artigos

### @po
- [ ] Epic breakdown em stories validado
- [ ] Acceptance criteria global definidos
- [ ] Dependencies chain documentada (Fase 1 → 2 → 3 → 4)
- [ ] Riscos aceitos e mitigacoes aprovadas

---

## 10. Anexos

### A. Documentos SYNAPSE Existentes

| Documento | Path | Conteudo |
|-----------|------|----------|
| Analise Comparativa | `SYNAPSE/docs/SYNAPSE-ANALYSIS.md` | Best-of-each, conceitos equivalentes, 32 decisoes |
| ADR-001 | `SYNAPSE/docs/ADR-001-SYNAPSE-UNIFIED-CONTEXT-ENGINE.md` | 32 decisoes ponto-a-ponto, riscos, migracao |
| Design Document | `SYNAPSE/docs/DESIGN-SYNAPSE-ENGINE.md` | API, layers, schema, performance targets |

### B. Epic Stories Analisadas

| Epic | Total Stories | Done | In Progress | Draft/Ready | Pending |
|------|-------------|------|-------------|-------------|---------|
| ACT | 12 | 10 | 0 | 0 | 0 (2 superseded) |
| IDS | 10 | 3 | 0 | 4 (3 ready-review, 1 ready) | 3 (draft) |
| MIS | 7 | 5 | 0 | 0 | 1 (in-review) + 1 (pending) |
| PRO | 6 | 3 | 2 | 1 (ready) | 0 |

### C. Arquivos Criticos (Conflito Potencial)

| Arquivo | Linhas | Ultimo Epic | SYNAPSE Interage |
|---------|--------|-------------|------------------|
| `unified-activation-pipeline.js` | ~687 | ACT-11 | Read only (consume session data) |
| `greeting-builder.js` | ~1404 | ACT-12 | Nao interage (parallel via hook) |
| `pro/memory/memory-index.js` | ~300 | MIS-4 | Read only (via API) |
| `pro/memory/memory-retriever.js` | ~250 | MIS-4 | Read only (via API) |
| `pro/memory/self-learner.js` | ~680 | MIS-5 | Read only (consume heuristics) |
| `config-resolver.js` | ~400 | PRO-4 | Read only (consume config values) |
| `feature-gate.js` | ~300 | PRO-6 | Read only (check feature gates) |

---

*Handoff Document v1.0.0 — Gerado em 2026-02-10*
*Review chain: @architect (Aria) → @pm (Phoenix) → @aios-master (Orion) → @po (Pax)*
*Proximo passo: @architect revisa e responde perguntas 1-4*
