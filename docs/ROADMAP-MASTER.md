# ROADMAP MASTER - AIOS + JARVIS

> Documento vivo. Atualizar checkboxes conforme progresso.
> Criado: 2026-02-26 | Ultima atualizacao: 2026-02-28 (W5-W7 redefinidas — Agent Parity + Intelligence + Hardening)
> Referencia cruzada: `docs/stories/backlog.json`, `docs/roadmap.md`

---

## Status Geral

| Area | Progresso | Notas |
|------|-----------|-------|
| AIOS Core Framework | ~95% | 14 modulos completos, W3 100% gaps resolvidos |
| JARVIS CLI Engine | ~95% | 7/7 stories DONE, pipeline integrado, 346 testes |
| JARVIS Voice Hub | ~90% | v6 cockpit + HTTPS + Core integration (W2.1-W2.6 DONE) |
| JARVIS Cloud Brain | ~60% | W4 foundation DONE, W5 agent parity pendente |
| Cloud Brain Intelligence | 0% | W6 — multi-agent, memory, voice shortcuts |
| Hardening & Polish | 0% | W7 — security, tests, cleanup |

---

## WAVE 0 — QUICK WINS & FIXES CRITICOS (1-2 sessoes)

> Itens que desbloqueiam outras waves ou corrigem bugs ativos.

### JARVIS Voice Hub - Fixes

- [x] W0.1 - Fix PDF parsing (pdf-parse v2→v1) — DONE 2026-02-26
- [x] W0.2 - Menu lateral historico de chats — DONE 2026-02-26
- [x] W0.3 - Fix `viewFile()` no app.js — agora injeta conteudo no contexto do JARVIS — DONE 2026-02-27
- [x] W0.4 - Fix `read_file` tool aplica BLOCKED_PATHS (protege .env) — DONE 2026-02-27
- [x] W0.5 - Fix `search_code` reescrito em Node.js puro (sem grep) — DONE 2026-02-27
- [x] W0.6 - Removidas deps mortas (`@anthropic-ai/sdk`, `form-data`) + npm prune (-22 pkgs) — DONE 2026-02-27
- [x] W0.7 - Removido `voiceSelect` do HTML e app.js (dead code) — DONE 2026-02-27

### AIOS Core - Fixes Criticos

- [x] W0.8 - Fix @qa task ref: `manage-story-backlog.md` → `po-manage-story-backlog.md` — DONE 2026-02-27
- [x] W0.9 - Fix GreetingPreferenceManager: adicionado `preference: auto` em core-config.yaml — DONE 2026-02-27
- [x] W0.10 - SYNAPSE SYN-13 ja implementado e QA PASS (9/10) — aguarda apenas push @devops — DONE 2026-02-27

---

## WAVE 1 — JARVIS CLI ENGINE (3-5 sessoes)

> Completar o motor de inteligencia do JARVIS. Pre-requisito para integracao Voice Hub ↔ Core.

### Story 1.1 - CLI Bootstrap & Entry Point (DONE)
- [x] W1.1 - Review final e merge da Story 1.1 — DONE 2026-02-27
- [x] W1.2 - Fix INT-001: `npx aios-core jarvis` adicionado ao bin/aios.js — DONE 2026-02-27

### Story 1.2 - Intent Classification Engine (DONE)
- [x] W1.3 - Review final e merge da Story 1.2 — DONE 2026-02-27
- [ ] W1.4 - Implementar Tier 2 LLM fallback (atualmente stub intencional)

### Story 1.3 - Mission Planner (DONE)
- [x] W1.5 - Story completa, QA Gate PASS

### Story 1.4 - Agent Delegation Bridge (DONE)
- [x] W1.6 - Implementar delegation-bridge.js completo (706 linhas) — DONE 2026-02-27
- [x] W1.7 - AuthorityChecker + Semaphore (cap 3 concorrentes) — DONE 2026-02-27
- [x] W1.8 - delegate/delegateParallel + retry + timeout — DONE 2026-02-27
- [x] W1.9 - NDJSON mission log — DONE 2026-02-27

### Story 1.5 - Autonomy Controller (DONE)
- [x] W1.10 - Implementar autonomy-controller.js (869 linhas) — DONE 2026-02-27
- [x] W1.11 - Modos: supervised / assisted / autonomous — DONE 2026-02-27
- [x] W1.12 - Risk assessment per-action (safe patterns + novel triggers) — DONE 2026-02-27

### Story 1.6 - Session State & Project Context (DONE)
- [x] W1.13 - Implementar session-manager.js completo (493 linhas) — DONE 2026-02-27
- [x] W1.14 - Round-trip save/load, corruption recovery — DONE 2026-02-27
- [x] W1.15 - 30-mission cap, cleanup 30d archive / 90d purge — DONE 2026-02-27

### Story 1.7 - Real-Time Progress Reporting (DONE)
- [x] W1.16 - Implementar progress-reporter.js — DONE 2026-02-27
- [x] W1.17 - Streaming updates para terminal + WebSocket — DONE 2026-02-27

### Integration: processCommand() Pipeline (DONE)
- [x] W1.18 - Wire processCommand() em jarvis-bootstrap.js: IntentEngine → MissionPlanner → AutonomyController → DelegationBridge → SessionManager — DONE 2026-02-27
- [x] W1.19 - Todos os 330 testes JARVIS passando — DONE 2026-02-27

---

## WAVE 2 — JARVIS VOICE HUB → CORE INTEGRATION (2-3 sessoes)

> Conectar o Voice Hub ao JARVIS Core Engine em vez de ir direto ao OpenAI.
> Atualmente: Browser ↔ server.js ↔ OpenAI Realtime (bypass total do Core)
> Target: Browser ↔ server.js ↔ JARVIS Core ↔ OpenAI Realtime

- [x] W2.1 - Definir REST API do JARVIS Core (jarvis-api.js criado, 5 endpoints) — DONE 2026-02-28
- [x] W2.2 - Server.js consome JARVIS Core API (5 rotas REST + WS integration) — DONE 2026-02-28
- [x] W2.3 - Intent Engine processa comandos de voz (jarvis_command tool + routing) — DONE 2026-02-28
- [x] W2.4 - Delegation Bridge roteia para agentes AIOS reais (via jarvis-api pipeline) — DONE 2026-02-28
- [x] W2.5 - Session Manager mantém estado entre requests de voz (per-session store) — DONE 2026-02-28
- [x] W2.6 - Progress Reporter envia updates via WebSocket para o cockpit (6 event types) — DONE 2026-02-28

### Voice Hub - Melhorias UX

- [x] W2.7 - File viewer inline no chat (preview de codigo/texto) — VERIFIED DONE 2026-02-28
- [x] W2.8 - OCR para PDFs escaneados (fallback quando pdf-parse retorna vazio) — DONE 2026-02-28 (pdf-to-img + GPT-4o Vision, ate 3 paginas)
- [x] W2.9 - Notificacoes push no cockpit (tool executions, errors) — VERIFIED DONE 2026-02-28
- [x] W2.10 - Tema claro/escuro toggle — VERIFIED DONE 2026-02-28
- [x] W2.11 - PWA manifest + service worker (instalar no celular) — DONE 2026-02-28 (icones SVG+PNG, SW v2, offline page)
- [x] W2.12 - Autenticacao basica (pin/senha) para proteger endpoints — DONE 2026-02-28 (PIN 4-6 digitos, WS auth, session TTL, auto-logout)

---

## WAVE 3 — AIOS CORE COMPLETENESS (3-4 sessoes)

> Resolver tech debt e gaps do framework.

### Activation Pipeline (ACT-2 → ACT-8)

- [x] W3.1 - ACT-2: Audit user_profile impact across agents — VERIFIED DONE (31 testes, cascade wired)
- [x] W3.2 - ACT-3: ProjectStatusLoader reliability overhaul — VERIFIED DONE (90 testes)
- [x] W3.3 - ACT-4: PermissionMode integration (wiring permissions/ to CLI) — VERIFIED DONE (67 testes)
- [x] W3.4 - ACT-5: WorkflowNavigator + Bob integration — DONE 2026-02-26 (profile-aware filtering: bob=1 suggestion, intermediate=2, advanced=all; simplified header; SurfaceChecker bypass for bob; 51 testes)
- [x] W3.5 - ACT-6: Unified Activation Pipeline — VERIFIED DONE (QA PASS, 67 testes)
- [x] W3.6 - ACT-7: Context-Aware Greeting Sections — DONE (4 session types: new/existing/workflow/absence; buildAbsenceSection; _detectAbsenceInfo; 25+ testes)
- [x] W3.7 - ACT-8: Agent Config Loading governance — DONE 2026-02-28 (4-phase validator, JSON Schema, 53 testes, 12 agents validados)

### Core Gaps

- [x] W3.8 - Remover phantom memory modules (memory-query.js, session-memory.js) — DONE 2026-02-28 (dead imports removidos, 66 testes passando)
- [x] W3.9 - Consolidar 3 duplicate task file pairs -- DONE: dev-apply-qa-fixes.md and sm-create-next-story.md refs updated to generic versions, entity-registry/install-manifest cleaned. validate-next-story/dev-validate-next-story NOT duplicates (different agents). L2 deny rules block file deletion -- needs manual removal.
- [x] W3.10 - Consolidar 3 elicitation file duplicates -- DONE: removed 5 duplicates, updated elicitationLocation config
- [x] W3.11 - Config migration monolitico → L1-L4 — DONE 2026-02-28 (layered config ativo, 176 testes, legacy deprecated. Phase 2: migrar 10 consumers para resolveConfig())
- [x] W3.12 - INS-4.11: v4.3.0 post-release installer fixes — VERIFIED DONE (SYNAPSE migration concluida)
- [x] W3.13 - INS-4.12: brownfield dependency resolution — VERIFIED DONE (isolamento deps, NODE_PATH, CI brownfield test, doctor check, 8 testes)

### Stories Pendentes

- [x] W3.14 - CODEINTEL-RP-001: RegistryProvider completion — VERIFIED DONE (QA PASS, 351 testes)
- [x] W3.15 - NOG-23: post-migration validation benchmark — DONE (QA PASS 100/100, zero regressions NOG-17→NOG-22, benchmark report at docs/qa/NOG-23-benchmark-comparison.md)
- [x] W3.16 - WIS-16: workflow-aware greeting handoffs — DONE (HandoffReader module, buildHandoffSection, Tier 3 pipeline integration, 17+25 testes)
- [x] W3.17 - GHIM-001 Phase 3: GitHub Actions execution — DONE (code 100% complete, awaiting @devops live validation of 3 workflows)

---

## WAVE 4 — JARVIS CLOUD BRAIN: AUTONOMOUS VPS (4-6 sessoes)

> JARVIS na VPS com autonomia total: voz → agentes → codigo → testes → push.
> O cockpit E o dashboard. Acesso de qualquer lugar, celular ou PC.

### Phase 1: Foundation (VPS = Dev Environment)

- [x] W4.1 - Clone aios-core repo na VPS + npm install (dev environment completo) — DONE 2026-02-28
- [x] W4.2 - Anthropic SDK integration em server.js (Claude API como backend de agentes) — DONE 2026-02-28 (cloud-brain.js + callClaude())
- [x] W4.3 - Agent prompt loader (carrega definicoes YAML dos agentes como system prompts) — DONE 2026-02-28 (loadAgentPrompt() carrega 12 agents)
- [x] W4.4 - Claude-powered tool execution (read/write/edit/search no repo real da VPS) — DONE 2026-02-28 (9 tools: read/write/edit/search/list/run/git_status/git_commit/git_push)

### Phase 2: Agent Orchestration (Agentes funcionando via Cloud)

- [x] W4.5 - DelegationBridge cloud adapter (chama Claude API per-agent com contexto) — DONE 2026-02-28 (executeAgent() agentic loop, max 25 rounds)
- [x] W4.6 - IntentEngine cloud mode (classifica comandos de voz → agente correto) — DONE 2026-02-28 (orchestrate() Opus 4.6 analisa intent + detectAgent() fallback)
- [x] W4.7 - MissionPlanner cloud mode (quebra missoes em steps executaveis) — DONE 2026-02-28 (Opus routing + refined_command para agents)
- [x] W4.8 - AutonomyController cloud mode (risk assessment, approval gates) — DONE 2026-02-28 (BLOCKED_PATTERNS, path traversal, dangerous command blocking)

### Phase 3: Git & CI (Push direto da VPS)

- [x] W4.9 - SSH key para GitHub na VPS (clone/pull/push sem senha) — DONE 2026-02-28 (SSH key ed25519 gerada, git config, setup endpoint /api/brain/github/setup para token)
- [x] W4.10 - Git operations via JARVIS (commit, push, branch, PR via gh CLI) — DONE 2026-02-28 (3 tools: git_branch/git_log/git_diff + 4 REST endpoints)
- [x] W4.11 - Test runner integration (npm test executado pelo JARVIS, resultados no cockpit) — DONE 2026-02-28 (run_tests tool + parseTestResults() + WebSocket broadcast)
- [x] W4.12 - CI feedback loop (testes falham → JARVIS corrige automaticamente) — DONE 2026-02-28 (autoFixTests() max 3 iterations, Sonnet analyzes + fixes)

### Phase 4: Cockpit UX (Dashboard integrado)

- [x] W4.13 - Agent activity timeline no cockpit (quem fez o que, quando) — DONE 2026-02-28 (nova tab Activity, timeline vertical, cores por agente, max 100 FIFO)
- [x] W4.14 - Story progress tracker visual (checkboxes, file list, status) — DONE 2026-02-28 (card Monitor, parseia markdown checkboxes, progress bar)
- [x] W4.15 - Git activity graph (commits, branches, PRs) — DONE 2026-02-28 (card Monitor, 10 commits timeline, auto-refresh 60s)
- [x] W4.16 - Mission history (historico de missoes com replay) — DONE 2026-02-28 (localStorage max 50, expandivel, badge diario)
- [x] W4.17 - Autonomy mode selector no cockpit (supervised/assisted/autonomous) — DONE 2026-02-28 (dropdown topbar, 3 modos, persiste localStorage)
- [x] W4.18 - Real-time streaming de progresso (steps executando ao vivo) — DONE 2026-02-28 (progress overlay, spinner, tool indicators, collapse on complete)

---

## WAVE 5 — CLOUD BRAIN: AGENT PARITY (3-4 sessoes)

> Todos os agentes AIOS funcionando na VPS com paridade total ao CLI local.
> Cada @agent com persona real, tools especificos, authority rules e workflows.

### Phase 1: Agent Personas & Authority (paridade de identidade)

- [ ] W5.1 - Agent persona injection: carregar persona completa (greeting, communication style, signature) no system prompt do Cloud Brain, nao so o YAML cru
- [ ] W5.2 - Agent authority enforcement: implementar delegation matrix no Cloud Brain (@dev nao faz push, @devops nao faz code, etc.)
- [ ] W5.3 - Agent-specific tools: filtrar tools por agente (dev = read/write/edit/git_commit, devops = git_push/git_branch, qa = run_tests/search_code)
- [ ] W5.4 - Agent MEMORY.md: carregar e atualizar MEMORY.md por agente na VPS (persistencia entre sessoes)

### Phase 2: Workflows & Tasks (paridade de execucao)

- [ ] W5.5 - Task loader: Cloud Brain carrega e executa tasks de `.aios-core/development/tasks/` (dev-develop-story, qa-gate, create-next-story, etc.)
- [ ] W5.6 - Story-driven mode: agentes trabalham a partir de stories reais em `docs/stories/`, atualizam checkboxes e file lists
- [ ] W5.7 - Agent handoff cloud: implementar protocolo de handoff entre agentes no Cloud Brain (compaction artifact, context transfer)
- [ ] W5.8 - QA Loop cloud: ciclo review-fix automatico via Cloud Brain (qa review → dev fix → re-review, max 5 iteracoes)

### Phase 3: Infra & Confiabilidade

- [ ] W5.9 - SSL real: Let's Encrypt com certbot em vez de self-signed (elimina warnings de browser)
- [ ] W5.10 - GitHub SSH funcional: SSH key adicionada ao GitHub, git push real da VPS
- [ ] W5.11 - JARVIS Core API na VPS: fazer jarvis-api.js funcionar no container (hoje UNAVAILABLE)
- [ ] W5.12 - Agent progress streaming: cada tool call e decisao do agente aparece em tempo real no cockpit

---

## WAVE 6 — CLOUD BRAIN: INTELLIGENCE (2-3 sessoes)

> JARVIS mais inteligente: contexto de projeto, memoria de longo prazo, multi-agent.

### Phase 1: Context & Memory

- [ ] W6.1 - Project context injection: injetar CLAUDE.md, constitution, story ativa e git status no system prompt de cada agente
- [ ] W6.2 - Conversation memory: persistir historico de conversas por sessao no servidor (hoje so localStorage no browser)
- [ ] W6.3 - Cross-session learning: JARVIS aprende padroes do projeto e preferencias do usuario entre sessoes

### Phase 2: Multi-Agent & Orchestration

- [ ] W6.4 - Multi-agent missions: JARVIS orquestra multiplos agentes em sequencia para uma missao (ex: @sm cria story → @dev implementa → @qa testa)
- [ ] W6.5 - Parallel agent execution: rodar agentes independentes em paralelo (ex: @qa e @dev em tasks diferentes)
- [ ] W6.6 - Agent routing inteligente: Opus analisa comando e decide automaticamente qual agente(s) acionar, sem precisar de @mention explicito

### Phase 3: Voice & UX

- [ ] W6.7 - Voice command shortcuts: "JARVIS, roda os testes" → detecta intent e executa direto sem confirmar
- [ ] W6.8 - Voice status reports: JARVIS fala o status do projeto, progresso da story, resultados de teste
- [ ] W6.9 - Mobile cockpit polish: UX otimizada para uso no celular (gestos, layout responsivo, notificacoes)

---

## WAVE 7 — HARDENING & POLISH (2-3 sessoes)

> Estabilidade, seguranca, testes e cleanup para producao.

### Phase 1: Security & Auth

- [ ] W7.1 - Rate limiting: proteger endpoints do Cloud Brain contra abuse
- [ ] W7.2 - Tool sandboxing: isolar execucao de comandos perigosos (containers, timeouts, resource limits)
- [ ] W7.3 - Audit log: registrar todas as acoes dos agentes (quem fez o que, quando, qual tool)
- [ ] W7.4 - Security audit: revisar tool blocklists, path traversal, injection vectors

### Phase 2: Testing & Reliability

- [ ] W7.5 - Cloud Brain tests: testes unitarios para orchestrate(), executeAgent(), executeTool()
- [ ] W7.6 - E2E tests: fluxo completo voice → intent → agent → tool → response
- [ ] W7.7 - Error recovery: retry automatico, fallback graceful, reconexao WebSocket
- [ ] W7.8 - Health monitoring: alertas quando container cai, OpenAI desconecta, ou disco enche

### Phase 3: Cleanup

- [ ] W7.9 - Arquivar deprecated docs, orphaned scripts e ghost directories
- [ ] W7.10 - Dead code removal: remover modules nao-usados (ideation-engine, timeline-manager)
- [ ] W7.11 - Testes para core modules sem coverage (10+ modules)
- [ ] W7.12 - Performance: cache de agent prompts, connection pooling, lazy loading

---

## Metricas de Progresso

| Wave | Total Items | Concluidos | % |
|------|------------|------------|---|
| W0 Quick Wins | 10 | 10 | 100% |
| W1 JARVIS CLI | 19 | 18 | 95% |
| W2 Integration | 12 | 12 | 100% |
| W3 Core | 17 | 17 | 100% |
| W4 Cloud Brain | 18 | 18 | 100% |
| W5 Agent Parity | 12 | 0 | 0% |
| W6 Intelligence | 9 | 0 | 0% |
| W7 Hardening | 12 | 0 | 0% |
| **TOTAL** | **109** | **75** | **69%** |

---

## Regras de Execucao

1. **Sempre iniciar sessao lendo este arquivo** para retomar contexto
2. **Atualizar checkboxes** imediatamente ao completar item
3. **Waves sao sequenciais** mas items dentro de uma wave podem ser paralelos
4. **W0 e W1 sao pre-requisitos** para W2
5. **W3 pode rodar em paralelo** com W1/W2
6. **Cada sessao deve ter objetivo claro**: "Hoje vamos completar W0" ou "Foco em W1.6-W1.9"
7. **JARVIS Voice Hub** pode receber melhorias incrementais a qualquer momento
8. **Se iniciar sessao nova**, ler: `docs/ROADMAP-MASTER.md` + `docs/stories/backlog.json`

---

## Dependencias entre Waves

```
W0 (fixes) ──→ W1 (JARVIS CLI) ──→ W2 (Integration)
                                         ↓
W3 (Core) ─────────────────────→ W4 (Dashboard)
                                         ↓
W5 (Squads) ────────────────────→ W6 (Pro)
                                         ↓
                                    W7 (Cleanup)
```

W0 + W1 = Fundacao | W2 + W3 = Conexao | W4-W7 = Escala
