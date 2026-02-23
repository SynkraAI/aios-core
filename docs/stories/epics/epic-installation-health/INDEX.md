# Epic: Installation Health & Environment Sync (INS-4)

## Overview

Garantir que qualquer **fresh install** ou **upgrade** do aios-core resulta num ambiente 100% funcional com todos os artefatos dos epics BM, NOG e GD, e que exista uma forma de **diagnosticar e corrigir** ambientes existentes.

**Origem:** Auditoria pos-epics BM (Boundary Mapping), NOG (Code Intelligence) e GD (Graph Dashboard) revelou 8 gaps criticos no installer — artefatos criados em dev mas nao integrados no fluxo de instalacao.

**Principios:**
- `Install = Complete:` Apos `npx aios-core install`, ambiente 100% funcional
- `Upgrade = Safe:` Updates preservam customizacoes e adicionam novidades
- `Doctor = Diagnostic:` `aios doctor` detecta e sugere correcao para inconsistencias
- `Health = Continuous:` `@aios-master *health-check` valida o ambiente a qualquer momento

## Documents

| Document | Purpose |
|----------|---------|
| [Architect Handoff](../../handoffs/handoff-architect-to-pm-epic-installation-health.md) | Proposta original com gap analysis, specs detalhadas, contexto tecnico |
| [Epic INS-3 (Installer v4)](../epic-installer-v4-debug/) | Epic anterior — INS-4 e continuacao natural |
| [Epic BM (Boundary Mapping)](../epic-boundary-mapping/) | Artefatos de boundary que precisam ser instalados |
| [Epic NOG (Code Intelligence)](../epic-nogic-code-intelligence/) | Artefatos de code-intel para diagnostico |
| [Epic GD (Graph Dashboard)](../epic-cli-graph-dashboard/) | Artefatos de graph para documentacao |

## Gap Analysis (Auditoria + Codex Confirmados)

| # | Gap | Severidade | Status | Codex Finding |
|---|-----|-----------|--------|---------------|
| 1 | `.claude/settings.json` boundary NAO gerado | CRITICO | Confirmado — wizard so escreve `language`, nao `permissions.deny/allow` | C1: bloqueador real |
| 2 | `.claude/rules/*.md` copiadas PARCIALMENTE | ALTO (rebaixado) | `ide-config-generator.js:528-534` JA copia rules para Claude Code | A2: gap residual e so boundary deny/allow |
| 3 | Agent MEMORY.md NAO sincronizados | ALTO | Confirmado — zero referencias no installer | — |
| 4 | CLAUDE.md template desatualizado | ALTO | Confirmado — faltam secoes Boundary, Rules, Code-Intel, Graph | — |
| 5 | core-config.yaml sem merge YAML strategy | CRITICO (elevado) | Merger tem .env e .md apenas, sem YAML | C3: subestimado |
| 6 | IDE sync NAO chamado pelo installer | ALTO | Confirmado — API programatica existe (`commandSync`) | M2: viavel via require |
| 7 | `aios doctor` basico com bug de contrato | CRITICO | 5 checks basicos, `runDoctor(options)` ignora parameter | A3: reescrita necessaria |
| 8 | Entity Registry NAO gerado no install | MEDIO | Script existe; pre-push JA faz incremental | A1: reescopar para bootstrap |
| 9 | Hooks git nao garantidos via `npx` (sem npm install) | ALTO (NOVO) | `package.json` usa `prepare: "husky"` — so funciona via `npm install` | C2: gap no caminho npx |
| 10 | Ausencia testes regressao para installer pipeline | ALTO (NOVO) | Sem suites para validator/upgrader/doctor/IDE sync | A4: incluir no DoD |

## Stories (pos-Codex v2.1)

### Wave 1: Foundation (P0 — Generator + Doctor em paralelo)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.1](story-INS-4.1-aios-doctor.md) | `aios doctor` — Reescrita com 12+ Checks, --fix, --json | @dev | 5 | Draft | — |
| [INS-4.2](story-INS-4.2-settings-json-generator.md) | Settings.json Boundary Generator — Deny/Allow from Config | @dev | 5 | Draft | — |

### Wave 2: Installer Integration (P1)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.3](story-INS-4.3-installer-settings-rules.md) | Installer: Wire Generator + Validate Post-Install | @dev | 2 | Draft | INS-4.2 |
| [INS-4.4](story-INS-4.4-claude-md-template-v5.md) | Installer: CLAUDE.md Template v5 (4 secoes novas) | @dev | 3 | Draft | — |
| [INS-4.5](story-INS-4.5-ide-sync-integration.md) | IDE Sync Integration — via API programatica | @dev + @devops | 3 | Draft | — |

### Wave 3: Runtime Health & Upgrade Safety (P2)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.6](story-INS-4.6-entity-registry-on-install.md) | Entity Registry Bootstrap on Install (nao incremental) | @dev | 2 | Draft | — |
| [INS-4.7](story-INS-4.7-config-smart-merge.md) | YAML Merger Strategy + Config Smart Merge (Phase 1) | @dev | 5 | Draft | — |
| [INS-4.8](story-INS-4.8-health-check-task.md) | Unify Health-Check — Doctor + core/health-check + Task | @dev | 2 | Draft | INS-4.1 |

## Totals

| Metric | Value |
|--------|-------|
| **Total Stories** | 8 |
| **Total Points** | ~27 (pos-Codex Story Review, ajustado de 26) |
| **Waves** | 3 |
| **Executor Primario** | @dev (Dex) |
| **Pre-requisitos** | Branch `feat/epic-nogic-code-intelligence` merged em main (antes de Wave 2) |
| **Bloqueadores Externos** | Nenhum para Wave 1 |

## Executor Assignment

| Story | Executor | Quality Gate | Quality Gate Focus |
|-------|----------|-------------|-------------------|
| INS-4.1 | @dev | @devops | [check_completeness, cli_ux, --fix_safety] |
| INS-4.2 | @dev | @architect | [boundary_correctness, idempotency] |
| INS-4.3 | @dev | @devops | [install_flow, post_install_validation] |
| INS-4.4 | @dev | @architect | [template_completeness, framework_owned_markers] |
| INS-4.5 | @dev + @devops | @qa | [multi_ide_sync, agent_format_validation] |
| INS-4.6 | @dev | @qa | [entity_count_sanity, install_flow] |
| INS-4.7 | @dev | @architect | [merge_safety, user_config_preservation] |
| INS-4.8 | @dev | @qa | [governance_context, fix_safety, constitution_respect] |

## Dependency Graph

```
Wave 1 (parallel):
  INS-4.1 (Doctor) ─────────────────────────────────┐
  INS-4.2 (Settings Generator) ──→ INS-4.3 (W2)     │
                                                      │
Wave 2 (INS-4.4, INS-4.5 parallel):                  │
  INS-4.3 (Installer Settings+Rules) ← INS-4.2       │
  INS-4.4 (CLAUDE.md v5) ── parallel                  │
  INS-4.5 (IDE Sync Integration) ── parallel           │
                                                      │
Wave 3 (all independent):                             │
  INS-4.6 (Entity Registry on Install) ── standalone  │
  INS-4.7 (Config Smart Merge) ── standalone          │
  INS-4.8 (Health Check Task) ← INS-4.1 ─────────────┘
```

## Wave Gates

| Wave | Gate Criteria | GO Threshold | NO-GO Threshold |
|------|--------------|-------------|-----------------|
| W1 | Doctor funcional + Generator testado | `aios doctor` retorna resultados corretos em 3 cenarios (fresh, upgrade, broken) + generator idempotente | Doctor nao detecta gaps conhecidos OU generator produz rules incorretas |
| W2 | Installer integrado | Fresh install passa `aios doctor` com 0 FAIL + CLAUDE.md v5 tem todas as secoes + IDE sync chamado | Installer quebra em algum cenario OU secoes faltantes no template |
| W3 | Runtime health completo | Upgrade preserva config + entity registry gerado + health-check task funcional | Merge corrompe config OU registry <500 entidades OU health-check falha |

## Decisoes PM

### Priorizacao vs Epic TOK

**INS-4 Wave 1 roda ANTES de Epic TOK.** Racional:
1. INS-4 nao depende de TOK, mas TOK depende de ambiente saudavel
2. INS-4.6 (Entity Registry) cria base que TOK-1 (Tool Registry) consome
3. Baseline de tokens (TOK-1.5) precisa de ambiente completo para medicao valida
4. Wave 1 (doctor + generator) pode comecar AGORA

### INS-4.7 Scoped para Fase 1

Smart Merge requer nova YAML strategy no merger (`.env` e `.md` existem, YAML nao). Fase 1 = "add new keys + warn conflicts" usando pattern `registerStrategy('.yaml', YamlMerger)`. 3-way merge completo e backlog futuro.

### Correcao: 7 Rules Files (nao 5)

Auditoria encontrou 7 `.claude/rules/*.md`: agent-authority, workflow-execution, story-lifecycle, ids-principles, coderabbit-integration, **mcp-usage**, **agent-memory-imports**. Doctor e installer devem cobrir todos os 7.

### Codex Findings Incorporados (v2.1)

| Finding | Severidade | Acao PM |
|---------|-----------|---------|
| Rules JA copiadas por `ide-config-generator.js` | ALTO | INS-4.3 reescopada: wiring do generator apenas (2 pts) |
| Merger sem YAML strategy | CRITICO | INS-4.7 aumentada para 5 pts |
| INS-4.2 precisa expandir globs de boundary | CRITICO | INS-4.2 aumentada para 5 pts, verificar se Claude Code aceita glob patterns em deny |
| Pre-push hook JA faz registry sync incremental | ALTO | INS-4.6 reescopada: bootstrap only (2 pts) |
| Doctor tem bug de contrato (`options` ignorado) | ALTO | INS-4.1: reescrita, nao incremento |
| Health-check task/module JA existe em `core/` | MEDIO | INS-4.8: unificar, nao criar terceiro mecanismo (2 pts) |
| Hooks nao garantidos via `npx` | ALTO | Absorvido como check no doctor (INS-4.1), nao story separada |
| Testes regressao ausentes | ALTO | Absorvido no DoD de cada story, nao story separada |

### Discordancias com Codex

1. **Ordem de waves:** Codex propoe doctor na W3. PM mantem doctor na W1 — ele e validador das waves seguintes.
2. **Stories adicionais (INS-4.9, INS-4.10):** PM rejeita. Hooks → check no doctor. Testes → DoD de cada story. Desenvolvimento incremental, sem story para testes separada.

## Relacao com Outros Epics

| Epic | Relacao |
|------|---------|
| **BM (Boundary Mapping)** | INS-4.2 e INS-4.3 integram artefatos BM no installer |
| **NOG (Code Intelligence)** | INS-4.8 diagnostica code-intel provider status |
| **GD (Graph Dashboard)** | INS-4.4 documenta `aios graph` no CLAUDE.md template |
| **TOK (Token Optimization)** | INS-4.6 cria base que TOK-1 consome. INS-4 Wave 1 antes de TOK Wave 1 |
| **INS-3 (Installer Optimization)** | Continuacao natural — INS-3 otimizou performance, INS-4 otimiza completude |

## Risk Matrix

| Risk | Prob | Impact | Mitigation |
|------|------|--------|------------|
| Installer legacy (aios-init.js) dificulta integracao | Media | Alto | Stories focam em modulos isolados chamaveis de qualquer installer |
| Smart merge complexidade | Media | Medio | Scoped para fase 1 (add new keys only) |
| Users com ambientes muito customizados | Media | Medio | `aios doctor --dry-run` mostra o que seria alterado |
| Breaking changes em core-config.yaml schema | Baixa | Alto | Schema validation + versao no config |

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Fresh install `aios doctor` score | N/A (nao existe) | 0 FAIL, <=2 WARN |
| Upgrade config preservation | 0% (sobrescreve ou ignora) | 100% user keys preserved |
| Rules/settings coverage | 0% (nao instalados) | 100% (7 rules + settings.json) |
| Time to diagnose broken env | Manual (30+ min) | < 10 seconds (`aios doctor`) |

## Definition of Done

- [ ] All 8 stories completed with acceptance criteria met
- [ ] `aios doctor` functional with 12 checks, --fix, --json flags
- [ ] `generate-settings-json.js` created and integrated in installer
- [ ] Fresh install includes: settings.json, 7 rules files, CLAUDE.md v5, IDE sync, entity registry
- [ ] Upgrade preserves user core-config.yaml customizations
- [ ] `@aios-master *health-check` task functional
- [ ] Zero regressions in existing install/upgrade flow
- [ ] Documentation updated (CLAUDE.md template, installer README)

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | @pm (Morgan) | Epic criado a partir do handoff @architect. Sizing ajustado (34→24 pts), INS-4.7 scoped fase 1, correcao 7 rules (nao 5), priorizacao INS-4 antes de TOK |
| 2.0 | 2026-02-23 | @pm (Morgan) | Codex Critical Analysis incorporada. Sizing ajustado (24→~26 pts): INS-4.2 (3→5), INS-4.3 (3→2), INS-4.7 (3→5), INS-4.8 (3→2). Gap analysis expandida para 10 itens com Codex findings. Discordancias: wave order mantida (doctor W1), stories adicionais rejeitadas (hooks→doctor check, testes→DoD). INS-4.3 reescopada para wiring only. |
| 2.1 | 2026-02-23 | @sm (River) | 8 stories drafadas: INS-4.1 through INS-4.8. Todas incorporam Codex findings (contract bug A3, merger YAML C3, scope reductions A1/A2, regression test DoD A4). Dependency graph respeitado. INS-4.6 entity registry threshold: relativo (nao fixo >=500). INS-4.8 *doctor alias removido para evitar conflito com CLI. |
| 3.0 | 2026-02-23 | @sm (River) | Stories corrigidas pos-Codex Story Review: schema settings.json como strings "Edit(path)" (INS-4.2), contrato commandSync com adapter pattern (INS-4.5), contrato MergeResult com createMergeResult (INS-4.7), narrativa hooks Claude Code vs git (INS-4.3), markers AIOS-MANAGED-START/END (INS-4.4), source path rules confirmado como .claude/rules/ (INS-4.1). Sizing INS-4.5 ajustado 2→3 pts. Total 27 pts. |

## Handoff to Story Manager

"@sm, por favor crie stories detalhadas para este epic. Key considerations:

- Enhancement ao framework AIOS (Node.js CLI, installer pipeline)
- Specs detalhadas de INS-4.1 (doctor) e INS-4.2 (generator) estao no [handoff do architect](../../handoffs/handoff-architect-to-pm-epic-installation-health.md) secoes 3.1 e 3.2
- Arquivos-chave do installer documentados no handoff secao 9
- Contagem de artefatos a instalar no handoff secao 9
- Patterns existentes: brownfield-upgrader, post-install-validator, ide-sync — seguir padroes
- Wave 1 pode comecar imediatamente (zero blockers externos)
- Wave 2 requer branch NOG merged em main
- INS-4.7 limitado a fase 1: add new keys + warn conflicts (NAO 3-way merge completo)
- Doctor checks: 12 checks propostos no handoff — validar se sao suficientes
- Rules files: sao 7 (nao 5 como handoff original dizia)"
