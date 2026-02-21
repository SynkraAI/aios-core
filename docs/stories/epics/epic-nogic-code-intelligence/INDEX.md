# Epic: Code Intelligence Integration (Provider-Agnostic)

## Overview

Criar camada de code intelligence provider-agnostic em todas as tasks do AIOS, com **Code Graph MCP** como provider primario (25+ linguagens, open-source, ast-grep/tree-sitter) e fallback graceful.

**Principios:**
- `Code Intelligence = Enhancement Layer, NOT Dependency`
- `Provider = Pluggable, NOT Hardcoded`
- `MVP = 8 Primitive Capabilities`

## Documents

| Document | Purpose |
|----------|---------|
| [PRD-NOGIC.md](PRD-NOGIC.md) | Product Requirements Document (v2.1 — provider-agnostic + PO corrections) |
| [EPIC-NOGIC-EXECUTION.yaml](EPIC-NOGIC-EXECUTION.yaml) | Execution Plan (waves, dependencies, gates) |
| [Research](../../../research/2026-02-15-code-intelligence-alternatives/) | Tech research: alternatives analysis |
| [Gap Analysis](NOGIC-PO-GAP-ANALYSIS-2026-02-15.md) | PO gap analysis with decisions |

## Stories

### Wave 0: Enablement
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-0](story-NOG-0-provider-enablement.md) | Code Graph MCP Enablement & Health | @devops + @dev | 2 | Done | - |

### Wave 1: Foundation (Sequential)
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-1](story-NOG-1-infrastructure-layer.md) | Code Intelligence Infrastructure | @dev | 5 | Done | NOG-0 |
| [NOG-2](story-NOG-2-entity-registry-enrichment.md) | Entity Registry Live Enrichment | @dev + @aios-master | 5 | Done | NOG-0, NOG-1 |

### Wave 2: Core Agent Enhancement (Parallel)
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-3](story-NOG-3-dev-task-enhancement.md) | Dev Task Enhancement (IDS G4) | @dev | 3 | Done | NOG-1 |
| [NOG-4](story-NOG-4-qa-gate-enhancement.md) | QA Gate Enhancement (Blast Radius) | @qa | 3 | Done | NOG-1 |

### Wave 3: Planning & Discovery (Parallel)
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-5](story-NOG-5-brownfield-prd-code-graph.md) | Brownfield & PRD with Code Graph | @pm + @architect | 3 | Done | NOG-1 |
| [NOG-6](story-NOG-6-story-creation-awareness.md) | Story Creation with Code Awareness | @sm + @po | 2 | Done | NOG-1 |

### Wave 4: Operations & Expansion (Parallel)
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-7](story-NOG-7-devops-impact-analysis.md) | DevOps Pre-Push Impact Analysis | @devops | 2 | Done | NOG-1, NOG-4 |
| [NOG-8](story-NOG-8-squad-creator-awareness.md) | Squad Creator with Codebase Awareness | squad-creator | 3 | Draft | NOG-1, NOG-2 |

### Wave 5: Research & Optimization (from NOG-9)
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-9](story-NOG-9-uap-synapse-research.md) | UAP & SYNAPSE Deep Research | @analyst + @architect | 5 | Done | NOG-7 |

### Wave 6: UAP & SYNAPSE Hardening (from NOG-9 roadmap)
| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [NOG-10](story-NOG-10-phase0a-safe-quick-wins.md) | Phase 0A — Safe Quick Wins | @dev | 3 | Done | NOG-9 |
| [NOG-11](story-NOG-11-token-usage-source-discovery.md) | Token Usage Source Discovery | @architect + @dev | 3 | Draft | NOG-10 |
| [NOG-12](story-NOG-12-state-persistence-hardening.md) | State Persistence Hardening | @dev | 3 | Draft | NOG-10 |
| [NOG-13](story-NOG-13-fsmonitor-experimental.md) | Git fsmonitor Experimental (Opt-in) | @dev | 1 | Draft | NOG-10 |
| [NOG-14](story-NOG-14-adr-memory-self-editing-security.md) | ADR: Memory Self-Editing Security | @architect + @qa | 2 | Draft | NOG-9 |

## Totals

| Metric | v1.0 (Nogic) | v2.0 (Architect) | v2.1 (PO Corrections) | v3.0 (NOG-9 Expansion) |
|--------|-------------|------------------|----------------------|------------------------|
| Total Stories | 8 | 8 | **9 (+NOG-0)** | **15 (+NOG-9 to NOG-14)** |
| Total Points | 42 | 26 | **28 (+2 enablement)** | **40 (+12 optimization)** |
| Estimated Duration | 3-4 sprints | 2-3 sprints | **2-3 sprints** | **3-4 sprints** |
| Waves | 4 | 4 | **5 (wave-0 added)** | **7 (wave-5,6 added)** |
| Provider | Nogic only | Code Graph MCP | **Code Graph MCP** | **Code Graph MCP** |
| Linguagens | 3 | 25+ | **25+** | **25+** |
| Vendor Lock-in | Alto | Zero | **Zero** | **Zero** |
| Wave Gates | None | None | **Defined per wave** | **Expanded** |

## Wave Gates (v3.0)

| Wave | Gate Criteria |
|------|--------------|
| W0 | Provider health check aprovado + fallback validado |
| W1 | Fallback aprovado + NFR metrics coletadas |
| W2 | Demonstracao real de IDS G4 + QA blast radius |
| W3 | PRD/Story enrichment com referencias reais de codigo |
| W4 | Pre-push impact + squad creation sem regressao |
| W5 | 21 research reports + comparative matrix + roadmap aprovado |
| W6 | Brackets funcionando + git <5ms + atomic writes + zero regressions |

## Architecture

```
.aios-core/core/code-intel/
  index.js                          # Public exports
  code-intel-client.js              # Provider abstraction + capabilities
  code-intel-enricher.js            # High-level composite capabilities
  providers/
    provider-interface.js           # Contract for all providers
    code-graph-provider.js          # Code Graph MCP adapter (PRIMARY)
  helpers/
    dev-helper.js                   # @dev (IDS G4, conventions)
    qa-helper.js                    # @qa (blast radius, coverage)
    planning-helper.js              # @pm/@architect (brownfield, PRD)
    story-helper.js                 # @sm/@po (duplicate detection)
    devops-helper.js                # @devops (impact analysis)
    creation-helper.js              # squad-creator (artefact creation)
```

## Dependency Graph

```
NOG-0 (Provider Enablement)
  └── NOG-1 (Infrastructure + Provider Interface)
        ├── NOG-2 (Entity Registry)
        │     └── NOG-8 (Squad Creator)
        ├── NOG-3 (Dev Enhancement)
        ├── NOG-4 (QA Enhancement)
        │     └── NOG-7 (DevOps Impact)
        │           └── NOG-9 (UAP & SYNAPSE Research)
        │                 ├── NOG-10 (Phase 0A Quick Wins)
        │                 │     ├── NOG-11 (Token Source Discovery)
        │                 │     ├── NOG-12 (Persistence Hardening)
        │                 │     └── NOG-13 (fsmonitor Opt-in)
        │                 └── NOG-14 (ADR Memory Security)
        ├── NOG-5 (Brownfield/PRD)
        └── NOG-6 (Story Creation)
```

## Provider Strategy

```
Primary:  Code Graph MCP (25+ langs, OSS, ast-grep/tree-sitter)
Future:   Nogic (when stable), Semgrep (security), Custom tree-sitter
Pattern:  Provider Interface → any provider pluggable without task changes
```

## PO Decisions Log (2026-02-15)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 8 vs 9 tools | 8 primitives in MVP | Extra tools can be added later without interface changes |
| NOG-4 scope | 2 tasks (qa-gate + qa-review) | qa-trace + qa-generate deferred to NOG-4B |
| NOG-5 scope | Expanded (+create-doc, +plan-create-implementation) | Align tasks with AC promises |
| Incremental sync | sourceMtime vs lastSynced | Simple, filesystem-based, --full flag for override |
| Enablement | NOG-0 created | Provider must be operational before abstraction layer |
| NFR measurement | Added to NOG-1 as tasks 12-14 | Latency logging, cache counters, regression tests |
