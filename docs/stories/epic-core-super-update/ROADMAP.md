# Roadmap — CORE-SUPER-UPDATE

> Companion operacional do [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md).  
> Atualizar checkboxes conforme stories avançam.

## Status legend

| Status | Significado |
|--------|-------------|
| ⬜ | Not started |
| 🟡 | In progress |
| ✅ | Done |
| ⏸️ | Blocked / deferred |

---

## Phase 0 — Foundation

| # | Item | Status | Notes |
|---|------|--------|-------|
| 0.1 | Branch `feat/core-super-update-epic` off PR #800 | ✅ | 2026-07-09 |
| 0.2 | Epic + roadmap docs | ✅ | este diretório |
| 0.3 | Merge PR #800 (Grok) into main | ⬜ | wait CI + approval |
| 0.4 | Rebase super-update onto main post-merge | ⬜ | |

---

## Wave A — Runtime hygiene

**Goal:** core estável e seguro antes de skills grandes.

| Story | Item | Status | Issue / source |
|-------|------|--------|----------------|
| A1 | SYNAPSE timeout configurável | ⬜ | #798 |
| A2 | ConfigCache Jest unref / skip | ⬜ | #797 |
| A3 | path-guard + prompt-guard + ssrf-guard | ⬜ | hub permissions |
| A4 | Tests + doctor smoke | ⬜ | |

**Exit criteria**

- [ ] `npm test` green
- [ ] #797 e #798 fecháveis com evidência
- [ ] Guards cobertos por unit tests

---

## Wave B — SDC skills OSS

**Goal:** ciclo de story invocável por slash skill, sem monorepo Sinkra.

| Story | Item | Status |
|-------|------|--------|
| B1 | validate-story-draft | ⬜ |
| B2 | develop-story | ⬜ |
| B3 | review-story + apply-qa-fixes | ⬜ |
| B4 | close-story + commit | ⬜ |
| B5 | full-sdc **lean** | ⬜ |
| B6 | sync Claude + Grok + Codex | ⬜ |

**Strip checklist (cada skill)**

- [ ] Sem `sinkra_tier` / `owner_squad: sinkra-*`
- [ ] Sem paths `.sinkra/`
- [ ] Sem deploy hetzner/coolify hardcode (genérico ou `deploy_type: none`)
- [ ] Invoca task em `.aiox-core/development/tasks/` quando existir
- [ ] Funciona standalone (skill agnosticism)

**Exit criteria**

- [ ] Mock story Ready → Done via skill pipeline (local)
- [ ] Skills listadas em `grok inspect` / Claude skills / codex skills

---

## Wave C — Orchestration merge

**Goal:** wave + orchestrator melhores sem matar external-executors.

| Story | Item | Status |
|-------|------|--------|
| C1 | 3-way master-orchestrator plan | ⬜ |
| C2 | wave-execute core lean | ⬜ |
| C3 | optional model-router | ⬜ |
| C4 | external-executors preservation doc + tests | ⬜ |

**Exit criteria**

- [ ] Wave de 2 stories mock sem mux-adapter
- [ ] External executor path ainda documentado e testado

---

## Wave D — IDE & SYNAPSE

| Story | Item | Status |
|-------|------|--------|
| D1 | ide-sync advanced port | ⬜ |
| D2 | Grok inside official sync:ide | ⬜ |
| D3 | hook-runtime + memory-bridge merge | ⬜ |
| D4 | context-optimizer + handoff | ⬜ |
| D5 | three-brain lean | ⬜ |

**Exit criteria**

- [ ] `npm run sync:ide` + `sync:skills:grok` + parity check green

---

## Wave E — Constitution & governance

| Story | Item | Status |
|-------|------|--------|
| E1 | Art. XI Squad-First | ⬜ |
| E2 | Art. XII Model Governance (stripped) | ⬜ |
| E3 | Optional extensions doc (VII–X, XIII) | ⬜ |
| E4 | governance-pipeline lean skill | ⬜ |

---

## Wave F — Installer & quality

| Story | Item | Status |
|-------|------|--------|
| F1 | Windows ECOMPROMISED (#773) | ⬜ |
| F2 | Doctor heuristic subset | ⬜ |
| F3 | Theme-resolver API only | ⬜ |

---

## Out of scope (do not pull)

- mux-adapter / conductor full stack  
- policy digests / journey-log service  
- model tribunal harness  
- domain squads & sinkra-* skills  
- multi-BU hard gates  

---

## Suggested sprint order

1. **Sprint 1:** Wave A (all)  
2. **Sprint 2:** Wave B1–B4  
3. **Sprint 3:** Wave B5–B6  
4. **Sprint 4:** Wave C1–C2  
5. **Sprint 5:** Wave D1–D2 + E1–E2  
6. **Sprint 6:** remaining C/D/E/F  

---

## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | Epic + roadmap created from PR #800 branch |

*Update this table on each story close.*
