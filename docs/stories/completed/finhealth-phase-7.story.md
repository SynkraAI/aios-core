# FinHealth Squad — Phase 7: Real Agent Implementations + AI Recommendations in Glosa UI

> Converter 4 agentes stub em implementacoes reais mixed-mode (logica nativa + LLM para tarefas semanticas) e conectar recomendacoes de IA na UI de glosas.

**Status:** Done
**Data:** 2026-02-15
**Commits:** `7d51682` (aios-core), `398aaa8` (finhealth-frontend)
**Baseline:** 1,203 testes (691 frontend + 512 squad)
**Final:** ~1,233 testes (+57 novos, -25 removidos)

---

## Contexto

Fases 1-6 completas. Auditoria pos-Phase 6 identificou:

- **4 de 5 agentes sao stubs**: AuditorAgent, ReconciliationAgent, CashflowAgent, SupervisorAgent apenas faziam validacao Zod e delegavam tudo para `runtime.executeTask()` — sem queries ao DB, sem logica de negocio, sem calculos nativos
- **BillingAgent** era a unica implementacao real (427 linhas, 22 testes) — padrao a replicar
- **Pagina de detalhe de glosa** tinha UI para `ai_recommendation` + `success_probability` mas nenhum endpoint populava esses campos
- **GlosaRepository** nao tinha metodos `findById` e `updateRiskScore` necessarios pelo AuditorAgent

---

## Arquitetura: De Stub para Agente Real

```
ANTES (Stub):                     DEPOIS (Real):
+--------------+                  +--------------------------+
| Zod validate |                  | Zod validate             |
|      |       |                  |      |                   |
| runtime.exec | (LLM faz tudo)   | DB queries (repos)       |
|      |       |                  |      |                   |
| return result|                  | Logica de negocio nativa |
+--------------+                  |      |                   |
                                  | runtime.exec (AI apenas) |
                                  |      |                   |
                                  | DB updates com resultados|
                                  |      |                   |
                                  | return TaskResult        |
                                  +--------------------------+
```

Mudanca no construtor de todos os 4 agentes:
```typescript
// Antes:
constructor(runtime: AgentRuntime) { this.runtime = runtime; }

// Depois (igual BillingAgent):
constructor(runtime: AgentRuntime, organizationId: string) {
  this.runtime = runtime;
  this.accountRepo = new MedicalAccountRepository(organizationId);
  // ... demais repos por agente
}
```

---

## Deliverables

### D1: Extensoes GlosaRepository + PaymentRepository

**Arquivo:** `squads/finhealth-squad/src/database/supabase-client.ts`

**Acceptance Criteria:**
- [x] `GlosaRepository.findById(id)` retorna `Glosa | null`
- [x] `GlosaRepository.updateRiskScore(id, recommendation, probability, priorityScore)` atualiza campos de IA
- [x] `PaymentRepository.findByDateRange(from, to)` retorna pagamentos no intervalo

---

### D2: AuditorAgent — Implementacao Real

**Arquivo:** `squads/finhealth-squad/src/agents/auditor-agent.ts`
**Teste:** `squads/finhealth-squad/src/agents/auditor-agent.test.ts` (NOVO)
**Repos:** MedicalAccountRepository, ProcedureRepository, GlosaRepository

**Acceptance Criteria:**
- [x] `auditBatch`: Query contas pendentes, carrega procedimentos, calcula metricas (total, media, count), delega analise de risco ao LLM, atualiza `updateAuditScore`
- [x] `auditAccount`: Carrega conta+procedimentos+glosas, calcula glosa ratio, delega deep audit ao LLM, atualiza `updateAuditScore`
- [x] `scoreGlosaRisk`: Carrega conta+glosas, calcula `amountRatio` e `glosaTypeWeight` (admin=0.8, tecnica=0.5, linear=0.3), delega scoring ao LLM, atualiza `glosaRepo.updateRiskScore` por glosa
- [x] `detectInconsistencies`: Detecta guias duplicadas e mismatches de valor nativamente, delega deteccao semantica ao LLM
- [x] 16 testes cobrindo todos os metodos, mocks de repos via `vi.mock`

---

### D3: ReconciliationAgent — Implementacao Real

**Arquivo:** `squads/finhealth-squad/src/agents/reconciliation-agent.ts`
**Teste:** `squads/finhealth-squad/src/agents/reconciliation-agent.test.ts` (NOVO)
**Repos:** PaymentRepository, MedicalAccountRepository, GlosaRepository

**Acceptance Criteria:**
- [x] `reconcilePayment`: Carrega pagamentos nao reconciliados, match por `health_insurer_id`, calcula discrepancia, cria glosas para discrepancias, atualiza `updateReconciliation`
- [x] `matchInvoices`: Categoriza contas como confirmed/partial/unmatched, atualiza reconciliacao
- [x] `generateAppeal`: Carrega glosa+conta, delega geracao de texto de recurso ao LLM, atualiza `glosaRepo.updateAppeal`
- [x] `prioritizeAppeals`: Carrega glosas pendentes, calcula `priority = amount * (probability / 100)`, ordena desc (puro calculo, sem LLM)
- [x] 15 testes

---

### D4: CashflowAgent — Implementacao Real

**Arquivo:** `squads/finhealth-squad/src/agents/cashflow-agent.ts`
**Teste:** `squads/finhealth-squad/src/agents/cashflow-agent.test.ts` (NOVO)
**Repos:** PaymentRepository, MedicalAccountRepository

**Acceptance Criteria:**
- [x] `forecastCashflow`: Query pagamentos historicos por date range, agrega por mes, calcula tendencia linear (slope/intercept), delega analise qualitativa ao LLM
- [x] `detectAnomalies`: Query pagamentos recentes, calcula mean/stddev, flagga outliers (>2 sigma), delega analise contextual ao LLM
- [x] `generateFinancialReport`: Calcula KPIs (receitaBruta, receitaLiquida, taxaGlosa, diasMedioRecebimento), delega narrativa ao LLM
- [x] 13 testes

---

### D5: SupervisorAgent — Implementacao Real

**Arquivo:** `squads/finhealth-squad/src/agents/supervisor-agent.ts`
**Teste:** `squads/finhealth-squad/src/agents/supervisor-agent.test.ts` (NOVO)
**Repos:** Nenhum (orquestracao pura, recebe `organizationId` para contexto)

**Acceptance Criteria:**
- [x] `routeRequest`: Extracao de keywords nativa (glosa→auditor, pagamento→reconciliation, relatorio→cashflow, tiss→billing), delega parsing semantico de intent ao LLM
- [x] `generateConsolidatedReport`: Merge de secoes dos parametros de input, valida estrutura, delega sintese narrativa ao LLM
- [x] 8 testes

---

### D6: Registry + Remocao de Stubs

**Arquivos:**
- `squads/finhealth-squad/src/registry/agent-registry.ts`
- `squads/finhealth-squad/src/registry/agent-registry.test.ts`
- `squads/finhealth-squad/src/agents/agent-stubs.test.ts` (DELETADO)

**Acceptance Criteria:**
- [x] Todos os 5 registros de agentes dentro do bloco `if (organizationId)`
- [x] Substituido `AuditorAgent.AGENT_ID` por string literals
- [x] Removido `static AGENT_ID` e `static SUPPORTED_TASKS` dos 4 agentes
- [x] Teste "skips BillingAgent registration" atualizado para "skips ALL agent registration when no organizationId"
- [x] `agent-stubs.test.ts` deletado (25 testes removidos, substituidos por 52 testes nos D2-D5)
- [x] Mocks de DB adicionados ao registry test

---

### D7: H5 — Recomendacoes de IA na UI de Glosas

**Arquivos:**
- `finhealth-frontend/src/app/api/squad/audit/score-risk/route.ts` (NOVO)
- `finhealth-frontend/src/app/api/squad/audit/score-risk/route.test.ts` (NOVO)
- `finhealth-frontend/src/lib/validations/squad.ts`
- `finhealth-frontend/src/components/glosas/ScoreRiskButton.tsx` (NOVO)
- `finhealth-frontend/src/app/(dashboard)/glosas/[id]/page.tsx`

**Acceptance Criteria:**
- [x] Rota `/api/squad/audit/score-risk` com rate limit (5/min), auth (`squad:audit:write`), validacao Zod, timeout 60s, audit log
- [x] Schema `scoreGlosaRiskSchema` adicionado a `squad.ts`
- [x] Componente `ScoreRiskButton` com botao "Gerar Analise de IA", icone Sparkles, loading state, `router.refresh()` on success
- [x] Pagina de detalhe de glosa: mostra botao quando `!glosa.ai_recommendation`, mostra card de recomendacao quando existe
- [x] 5 testes (429, 401, 400, 502, 200)

---

## Resultados de Testes

| Suite | Resultado |
|-------|-----------|
| Squad (novos/alterados) | 65 testes pass |
| Squad (total, excl. timeouts pre-existentes) | 524 pass |
| Frontend | 696 pass |

| Fase | Novos | Removidos | Net |
|------|-------|-----------|-----|
| D1: Repos | 0 | 0 | 0 |
| D2: AuditorAgent | +16 | 0 | +16 |
| D3: ReconciliationAgent | +15 | 0 | +15 |
| D4: CashflowAgent | +13 | 0 | +13 |
| D5: SupervisorAgent | +8 | 0 | +8 |
| D6: Registry | +10 | -25 | -15 |
| D7: Frontend | +5 | 0 | +5 |
| **Total** | **+67** | **-25** | **+42** |

---

## Verificacoes Finais

- [x] `static readonly AGENT_ID` em squad `src/agents/` — zero resultados
- [x] `new AuditorAgent(runtime)` (construtor single-arg) — zero resultados
- [x] Todos os 5 agentes dentro do bloco `if (organizationId)` no registry
- [x] `agent-stubs.test.ts` deletado
- [x] Grep por construtores single-arg dos outros 3 agentes — zero resultados

---

## File List

### aios-core (commit `7d51682`)

| Arquivo | Acao |
|---------|------|
| `squads/finhealth-squad/src/database/supabase-client.ts` | Modificado (+3 metodos) |
| `squads/finhealth-squad/src/agents/auditor-agent.ts` | Reescrito (stub → real) |
| `squads/finhealth-squad/src/agents/auditor-agent.test.ts` | Novo (16 testes) |
| `squads/finhealth-squad/src/agents/reconciliation-agent.ts` | Reescrito (stub → real) |
| `squads/finhealth-squad/src/agents/reconciliation-agent.test.ts` | Novo (15 testes) |
| `squads/finhealth-squad/src/agents/cashflow-agent.ts` | Reescrito (stub → real) |
| `squads/finhealth-squad/src/agents/cashflow-agent.test.ts` | Novo (13 testes) |
| `squads/finhealth-squad/src/agents/supervisor-agent.ts` | Reescrito (stub → real) |
| `squads/finhealth-squad/src/agents/supervisor-agent.test.ts` | Novo (8 testes) |
| `squads/finhealth-squad/src/agents/agent-stubs.test.ts` | Deletado (-25 testes) |
| `squads/finhealth-squad/src/registry/agent-registry.ts` | Modificado (all in orgId block) |
| `squads/finhealth-squad/src/registry/agent-registry.test.ts` | Atualizado (+mocks, +assertions) |

### finhealth-frontend (commit `398aaa8`)

| Arquivo | Acao |
|---------|------|
| `src/app/api/squad/audit/score-risk/route.ts` | Novo |
| `src/app/api/squad/audit/score-risk/route.test.ts` | Novo (5 testes) |
| `src/lib/validations/squad.ts` | Modificado (+schema) |
| `src/components/glosas/ScoreRiskButton.tsx` | Novo |
| `src/app/(dashboard)/glosas/[id]/page.tsx` | Modificado (+ScoreRiskButton) |
