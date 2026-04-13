# @pedro-valerio Memory - Process Absolutist

## Quick Stats
- Workflows auditados: 17 (deep-research v1.0→v1.1; BRE extract v1.0→v1.1, formalize v1.0→v1.1; Mind Cloning v1.1; Project Lifecycle v1.0; YouTube Transcription v1.0; /new-project v1.0; Ensinio WhatsApp Prospector v5.0; High-Ticket Mastery v1.0; Forge v1.0; BrandCraft v1.0→v1.1; Ícaro de Carvalho v2.0→v2.0-enriched)
- Clones auditados: 2 (renner-silva v1.1=8.5, v1.2=9.0)
- Veto conditions propostas: 18 (deep-research) + 24 (BRE v1.1) + 8 (Project Lifecycle) + 8 (/new-project v1.0) + 12 (Ensinio v5.0) + 10 (HTM v1.0) + 22 (Forge v1.0) + 21 (BrandCraft v1.0) + 12 (Ícaro v2.0) + 47 catalogadas (Ícaro v2 enriched)
- Detalhes completos: `audit-history.md`

---

## Principio Core
> "Se executor CONSEGUE fazer errado -> processo esta errado"

---

## Score Board (todos workflows)

| Workflow | Score | Veredicto |
|----------|-------|-----------|
| deep-research v1.0 | 62 | VETO |
| deep-research v1.1 | 91 | APROVAR |
| BRE wf-extract v1.0 | 62 | VETO |
| BRE wf-extract v1.1 | 85 | APROVAR |
| BRE wf-formalize v1.0 | 54 | VETO |
| BRE wf-formalize v1.1 | 83 | APROVAR |
| Mind Cloning v1.1 | 78 | APROVAR c/ ressalvas |
| Project Lifecycle v1.0 | 40 | VETO |
| YouTube Transcription v1.0 | 47 | VETO |
| /new-project v1.0 | 67 | VETO |
| **Ensinio Prospector v5.0** | **73** | **APROVAR c/ ressalvas** |
| **High-Ticket Mastery v1.0** | **58** | **VETO** |
| **Forge v1.0** | **74** | **APROVAR c/ ressalvas** |
| **BrandCraft v1.0** | **71** | **APROVAR c/ ressalvas** |
| **BrandCraft v1.1** | **71** | **APROVAR c/ ressalvas** |
| **Ícaro de Carvalho v2.0** | **74** | **APROVAR c/ ressalvas** |
| **Ícaro de Carvalho v2.0-enriched** | **82** | **APROVAR c/ ressalvas** |

---

## Padroes de Validacao (8 criterios, 10 pts cada)
1. Veto Conditions: TODAS as fases tem blocking conditions?
2. Fluxo Unidirecional: Pipeline forward-only?
3. Checkpoints: Quality gates + veto em TODAS as fases?
4. Zero Wrong Paths: Executor CONSEGUE fazer errado?
5. Handoffs: Transferencias com format validation?
6. Stopping Criteria: Edge cases cobertos (plateau, timeout)?
7. Fallback Chains: Graceful degradation?
8. Decision Tree: Ambiguidade tratada?

### Scoring
- 90-100: APROVAR (production-ready)
- 70-89: APROVAR com ressalvas
- 50-69: VETO (fixes obrigatorios)
- < 50: VETO (retrabalho completo)

### Em Agents: 300+ lines? Voice DNA? Output examples? Quality gates?

---

## Anti-Patterns Recorrentes
- Checkpoint sem veto condition (deep-research v1.0, Mind Cloning v1.1)
- Quality gate sem enforcement (BRE v1.0, Mind Cloning v1.1)
- Veto sem blocking explicito (BRE v1.0)
- Handoff sem input_validation (todos workflows)
- Dois arquivos descrevendo mesmo fluxo (Mind Cloning: clone-mind.md + workflow YAML)
- Sem timeout protection (Mind Cloning v1.1)
- Sobrescrita silenciosa por naming collision (Project Lifecycle: session YYYY-MM-DD.md)
- Skill B cria artefato de Skill A como fallback (checkpoint cria INDEX.md = viola single responsibility)
- Data contract com campo renomeado entre template e dados reais (Project Path vs Local)
- **Fallback silencioso com return None** (YouTube: 429 rate limit → transcript-api → browser-cookies → None sem veto)
- **Subprocess delegation sem veto** (aios-transcriber → youtube_captions.py, check=False = erro oculto)
- **Extension-only validation** (is_audio_file: .mp3 OK, mas .txt renomeado pra .mp3 passa)
- **State file sem lock** (TranscriptionState: JSON atômico mas concurrent access = race condition)
- **FAIL LATE** (/new-project: validation no Passo 6 → deveria estar em Passo 0)
- **Validation sem rollback** (/new-project: falha deixa lixo no disco)
- **Silent skip** (create-epic-structure: INDEX.md existe → pula sem ABORT)
- **Table corruption** (/new-project: ACTIVE.md append sem validar header)
- **Veto conditions documentadas mas SEM enforcement** (Ensinio: QG diz "halt" mas nada força throw)
- **Optional phase com falha silenciosa** (Ensinio Phase 9 GHL: erro → log → continue = dessincronizado)
- **Threshold sem veto** (Ensinio phone_coverage < 70% continua, deveria haltar)
- **WARN em vez de BLOCK** (HTM: V2 Skip Foundation = WARN, contradiz allow_skip:false do workflow)
- **Menu oferece opcao sem implementacao** (HTM: "Lancamento Rapido" sem rapid-launch.yaml)
- **Activation ambigua** (HTM: "Direct call" e "Direct reference" nao sao slash commands executaveis)
- **Resume sem state validation** (Forge: state.json corrompido = crash sem fallback)
- **Fallback chain sem skip** (Forge: HALT apos @aios-master = dead-end, sem opcao pular story)
- **Brownfield routing sem state init** (Forge: brownfield despacha workflow sem criar state.json)
- **Concurrent runs sem lock** (Forge: dois runs simultaneos = conflito no codebase)
- **"Proceed anyway" apos N retries** (Forge: toda veto condition ultrapassavel = veto sem dentes)
- **Workflow viola propria Constitution** (Forge BUG_FIX: skip story viola Article III Story-Driven)
- **Handoff IDs errados entre agentes** (BrandCraft: brandcraft-chief referencia template-manager, doc-renderer, etc. IDs reais sao template-architect, doc-generator)
- **Condicional sem criterio explicito** (BrandCraft: "if images needed" sem regra objetiva = ambiguidade)
- **Command sem workflow** (BrandCraft: *publish sem wf-publish.yaml)
- **Agent handoff bypassa workflow** (BrandCraft: Scribe handoff direto para renderer, pulando Vault/brand)
- **Correcao incompleta** (BrandCraft v1.1: wf-improve-document fases Re-Render e Validate sem veto/enforcement — unico workflow com gap)
- **Output example contradiz workflow** (BrandCraft v1.1: Vault exemplo mostra "serving anyway" para draft, workflow diz HALT <80%)
- **Workflows fantasma** (Ícaro v2.0: config.yaml referencia 2 workflows que NÃO EXISTEM no disco) — RESOLVIDO em v2-enriched
- **Tasks só para 1 de 5 agents** (Ícaro v2.0: 4 tasks todas para icaro-de-carvalho, 4 agents sem tasks estruturadas) — RESOLVIDO em v2-enriched (7 tasks, 4 minds)
- **Routing sem disambiguation** (Ícaro v2.0: trigger "posicionamento" match 2 agents sem regra de desempate)
- **Condicional 'when' sem fallback** (Ícaro v2-enriched: wf-copy-pipeline Phase 2, tipo de copy não coberto = nada executa)
- **Phase paralela sem sync barrier** (Ícaro v2-enriched: wf-marketing-end-to-end Phase 3, Juliana + Ícaro em paralelo, checkpoint não valida ambos)
- **WARN sem escalação** (Ícaro v2-enriched: WARN no Phase 0 nunca vira BLOCK em fases posteriores)
- **Referência a workflow fantasma em not_for** (Ícaro v2-enriched: wf-lancamento-completo menciona wf-sprint que não existe)

## Patterns Efetivos
- Enforcement global: `enforcement: { checkpoint_policy, veto_behavior, max_retries }`
- Input validation: `input_validation: [ { field, required, min_length, type } ]`
- Fallback: `fallback: { on_veto, on_timeout }` com graceful degradation
- Checkpoint types: auto, human_review, quality_gate
- Global safeguards: max_duration, max_tokens, max_waves, plateau_threshold
- Quality Gate Enforcement: gate define CRITERIA, veto ENFORCA (blocking: true)
- **Retry com backoff exponencial** (Deepgram: [5s, 10s, 30s], Search: 2^retry)
- **Atomic write pattern** (TranscriptionState: tmp → replace)

---

## Aprendizados Chave
- Edge cases SEMPRE verificar: plateau, timeout, regression, query exhaustion, partial failure, disambiguation
- Conteudo rico NAO compensa workflow fraco (Mind Cloning: tasks 9/10, workflow 6/10)
- Duplicacao de fluxo (task + workflow YAML) e GAP CRITICAL - single source of truth
- CONDITIONAL paths precisam de tracking/propagacao entre fases
- **Fallback chain SEM veto final = silent failure** (YouTube: 3 níveis mas resultado vazio = continue)
- **Magic bytes > extension check** (is_audio_file só olha .mp3, não valida header)
- **Subprocess com check=False = esconde erro** (youtube.py → youtube_captions.py retorna False, mas erro não sobe)

---

## Patterns Novos (Forge)
- **Flow First Checkpoints** — usuario so para 2x no happy path, automatico no resto. Melhor UX de pipeline auditado.
- **Human Awareness** — checagem de horario/duracao. Unico workflow com essa preocupacao.
- **Ecosystem Scanner** — bridge com minds/skills/squads do ecossistema. Conceito forte.
- **Error Recovery Tree com routing por tipo** — ARCHITECTURE/DB/REQUIREMENT/STUCK/GENERIC. Mais sofisticado que retry simples.

## Patterns Novos (Ícaro v2-enriched)
- **Tasks 10/10 como referência** — campanha-trafego, estrategia-social, branding-completo são as tasks mais completas auditadas. Todas têm: output_example, elicitação, completion_criteria, veto com citação de framework, múltiplos checkpoints.
- **Voice DNA nos veto conditions** — veto fala na voz do mind ("Estratégia sem métrica é horóscopo de marketing" — Kiso). Diferenciador.
- **Checklists com scoring system + thresholds** — copy-quality-gate e lancamento-readiness com pesos, PASS/FAIL/REVISÃO e bloqueadores absolutos.
- **Multi-mind orchestration** — wf-marketing-end-to-end orquestra 5 minds em 6 fases. Mais ambicioso que qualquer squad anterior.

## Notas Recentes
- [2026-03-25] Ícaro de Carvalho v2.0-enriched RE-AUDIT APROVAR c/ RESSALVAS (82/100) — 2C, 4H, 10M, 4L. **Maior salto de qualidade entre audits (+8 pts).** Workflows agora existem com 16 quality gates. 3 tasks 10/10 (Sobral/Kiso/Hiller). 2 checklists com scoring. CRITICALs remanescentes: enforcement ausente (47 vetos textuais), orchestrator sem veto routing. Audit: `squads/icaro-de-carvalho/data/pedro-valerio-audit-v2.yaml`
- [2026-03-25] Ícaro de Carvalho v2.0 APROVAR c/ RESSALVAS (74/100) — 3C, 4H, 3M, 2L. **Melhor qualidade de agents auditada (Voice DNA excepcional em 5 minds).** CRITICALs: 2 workflows referenciados em config.yaml NÃO EXISTEM, veto conditions sem enforcement, zero checkpoints em todo o squad. Tasks com anatomia completa mas só para 1 agent. Routing sólido com overlap mínimo ("posicionamento"). Audit: `squads/icaro-de-carvalho/data/pedro-valerio-audit-report.yaml`
- [2026-03-24] BrandCraft v1.1 RE-AUDIT APROVAR c/ RESSALVAS (71/100) — 1C, 4H, 4M, 2L. **5 issues anteriores corrigidos.** C1-NEW: wf-improve-document Re-Render+Validate sem veto/enforcement. H: *publish sem workflow, Scribe bypassa Maestro, config.yaml usa nomes narrativos vs IDs, "if images needed" sem criterio. Zero timeout em todos workflows. Score nao subiu porque novos gaps encontrados. Audit inline na conversa.
- [2026-03-24] BrandCraft v1.0 APROVAR c/ RESSALVAS (71/100) — 5C, 7H, 6M, 3L. **Arquitetura solida com tier system e Gauge quality gate.** CRITICALs: handoff IDs errados entre agentes (template-manager vs template-architect), 3/5 workflows sem checkpoints, 8 fases sem veto conditions, veto sem enforcement, draft template servido sem HALT. Problemas de hardening e naming consistency. Audit inline na conversa.
- [2026-03-22] Forge v1.0 APROVAR c/ RESSALVAS (74/100) — 5C, 8H, 6M, 3L. **Melhor arquitetura de pipeline auditada.** CRITICALs: state.json sem validation, fallback sem skip, brownfield sem state init, concurrent sem lock, @aios-master sem guardrails. Problemas de hardening, nao de concepcao. Audit: `skills/forge/AUDIT-2026-03-22.md`
- [2026-03-17] High-Ticket Mastery v1.0 VETO (58/100) — 10C, 8H, 8M. **Enforcement zero:** veto conditions documentadas mas nao bloqueiam. CRITICAL: V2=WARN contradiz allow_skip:false, menu oferece workflow inexistente, zero fallback/timeout, handoffs sem input_validation. Arquitetura FUSION solida mas sem travas. Audit: `squads/high-ticket-mastery/AUDIT-2026-03-17.md`
- [2026-03-16] Ensinio Prospector v5.0 APROVAR c/ RESSALVAS (73/100) — 3C, 4H, 3M. **Veto sem enforcement:** QG documentado mas não força throw. CRITICAL: Phase 9 (GHL) falha silenciosa, phone_coverage sem threshold, schema validation ausente. Pipeline sólido mas precisa hardening. Audit: `.aiox/audits/process-workflow-audit-2026-03-16.md`
- [2026-03-15] /new-project v1.0 VETO (67/100) — 3C, 4H, 4M, 2L. **Fail Late** violação: validation no fim. CRITICAL: rollback ausente, table corruption, scan não bloqueia
- [2026-03-13] YouTube Transcription v1.0 VETO (47/100) — 3C, 2H, 6M, 1L. Fallback chain sem veto, subprocess sem raise, extension-only validation
- [2026-03-11] Project Lifecycle v1.0 VETO (40/100) — 3C, 4H, 4M, 2L. Skills /new-project+/checkpoint+/resume sem veto conditions
- [2026-03-11] Mind Cloning v1.1 APROVADO c/ RESSALVAS (78/100) — 3C, 5M, 7m. Gap: workflow YAML sem gates em 3/5 fases
- [2026-03-11] BRE v1.1 APROVADO — extract 85, formalize 83
- [2026-03-09] renner-silva v1.2 APROVADO (9.0/10)
- [2026-03-08] deep-research v1.1 APROVADO (91/100)
