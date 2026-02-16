# FinHealth Squad — Phase 10: Scheduler & Workflow Automation (H3)

> Implementar scheduler node-cron que dispara workflows YAML automaticamente via cron, eventos e triggers manuais via CLI.

**Status:** Done
**Data:** 2026-02-16
**Baseline:** 567 testes squad
**Final:** 604 testes (+37 novos)

---

## Contexto

Existem 5 workflows YAML em `workflows/` (audit-pipeline, billing-pipeline, reconciliation-pipeline, monthly-close, data-sync-pipeline) com triggers configurados (`scheduled`, `on-event`, `manual`), mas nenhum runtime scheduler para executa-los automaticamente. O `PipelineExecutor` ja funciona para execucao sob demanda via stdin/stdout, mas nao ha cron, event dispatch, ou CLI de gerenciamento.

### Decisoes Arquiteturais

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Scheduler engine | `node-cron` v4 | Sem Redis dependency, CLI-first, menor footprint |
| Deploy model | CLI container | Processo long-lived em Docker, sem HTTP server |
| Event system | Node.js EventEmitter | In-process pub/sub, suficiente para single-container |
| Execution log | In-memory (rolling) | Sem DB dependency obrigatoria; SQL migration inclusa para persistencia futura |
| UI | Nenhuma | CLI + config only (CLI First principle) |

---

## Arquitetura

```
+---------------------+
| Workflow YAML files  |
| (5 workflows)        |
+----------+----------+
           |
           v
+---------------------+     +-----------------------+
| WorkflowScheduler   |<--->| PipelineExecutor      |
| - registerCronJob() |     | (existing, unchanged) |
| - registerEvent()   |     +-----------------------+
| - start()/stop()    |
| - trigger()         |
+---+------+----------+
    |      |
    v      v
+-------+ +-----------------+  +------------------+
| cron  | | EventDispatcher |  | ExecutionLogger  |
| jobs  | | (EventEmitter)  |  | (rolling history)|
+-------+ +-----------------+  +------------------+
    |            |
    v            v
+------------------------------+
| SchedulerCLI                 |
| start | status | list |      |
| trigger <wf> | emit <evt>   |
+------------------------------+
```

---

## Deliverables

### D10.1: Scheduler Types (`src/scheduler/types.ts`)
- `ScheduledJob`, `EventBinding`, `WorkflowExecution`, `SchedulerStatus`, `SchedulerConfig`
- `TriggerType` = `'scheduled' | 'on-event' | 'manual'`
- `ExecutionStatus` = `'running' | 'success' | 'failed' | 'cancelled'`

### D10.2: Execution Logger (`src/scheduler/execution-logger.ts`)
- Rolling window de 200 execucoes em memoria
- `start()` → retorna executionId
- `finish()` → marca status + duration
- `getRecent()`, `getLastFor()`, `getStats()`
- **13 testes**

### D10.3: Event Dispatcher (`src/scheduler/event-dispatcher.ts`)
- Wrapper sobre Node.js `EventEmitter`
- `bind(event, workflow, handler)` — registra trigger
- `emit(event, payload)` — dispara handlers async
- Error handling per-handler (nao propaga)
- **10 testes**

### D10.4: Workflow Scheduler (`src/scheduler/workflow-scheduler.ts`)
- Core scheduler: le workflows via `PipelineExecutor`, registra cron + events
- `initialize()` — carrega workflows, cria cron tasks e event bindings
- `start()/stop()` — controle de lifecycle dos cron jobs
- `trigger(workflow, params)` — execucao manual com logging
- `emitEvent(event, payload)` — dispara event triggers
- `getStatus()` — status completo (jobs, bindings, execucoes)
- `destroy()` — cleanup total
- node-cron v4 com timezone support (`America/Sao_Paulo`)
- **14 testes**

### D10.5: Scheduler CLI (`src/scheduler/scheduler-cli.ts`)
- `finhealth scheduler start` — daemon mode (long-lived, SIGINT/SIGTERM handling)
- `finhealth scheduler status` — tabela de jobs e bindings
- `finhealth scheduler list` — lista todos workflows com trigger type
- `finhealth scheduler trigger <name>` — execucao manual
- `finhealth scheduler emit <event>` — emissao de evento

### D10.6: DB Migration (`src/scheduler/migration-workflow-executions.sql`)
- Tabela `workflow_executions` com RLS
- Indexes em `workflow_name`, `status`, `started_at`, `organization_id`
- Service role: full access (scheduler como servico)
- Authenticated: read-only por org

### D10.7: Package & Exports
- `node-cron` v4.2.1 adicionado como dependency
- npm scripts: `scheduler`, `scheduler:start`, `scheduler:status`, `scheduler:list`
- Exports em `src/index.ts`: WorkflowScheduler, EventDispatcher, ExecutionLogger, runSchedulerCli + types

---

## Workflow Schedule Mapping

| Workflow | Trigger | Schedule | Timezone |
|----------|---------|----------|----------|
| audit-pipeline | scheduled | `0 6 * * *` (daily 6AM) | America/Sao_Paulo |
| monthly-close | scheduled | `0 8 1 * *` (1st day 8AM) | America/Sao_Paulo |
| data-sync-pipeline | scheduled | `0 3 1 * *` (1st day 3AM) | America/Sao_Paulo |
| reconciliation-pipeline | on-event | `payment-received` | - |
| billing-pipeline | manual | CLI trigger | - |

---

## File List

| File | Action | Lines |
|------|--------|-------|
| `src/scheduler/types.ts` | Created | 50 |
| `src/scheduler/execution-logger.ts` | Created | 110 |
| `src/scheduler/event-dispatcher.ts` | Created | 80 |
| `src/scheduler/workflow-scheduler.ts` | Created | 240 |
| `src/scheduler/scheduler-cli.ts` | Created | 250 |
| `src/scheduler/migration-workflow-executions.sql` | Created | 45 |
| `src/scheduler/execution-logger.test.ts` | Created | 130 |
| `src/scheduler/event-dispatcher.test.ts` | Created | 100 |
| `src/scheduler/workflow-scheduler.test.ts` | Created | 250 |
| `src/index.ts` | Modified | +15 |
| `package.json` | Modified | +5 (deps + scripts) |

---

## Acceptance Criteria

- [x] `audit-pipeline` registrado com cron `0 6 * * *` (America/Sao_Paulo)
- [x] `monthly-close` registrado com cron `0 8 1 * *` (America/Sao_Paulo)
- [x] `reconciliation-pipeline` dispara no evento `payment-received`
- [x] `billing-pipeline` pode ser trigado manualmente via CLI
- [x] Execution logger rastreia historico com status (success/failed/running)
- [x] Scheduler sobrevive a restart (cron jobs re-registrados ao inicializar)
- [x] 37 novos testes, todos passando
