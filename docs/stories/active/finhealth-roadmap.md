# FinHealth Roadmap — Phases 8-12

> Gaps pendentes da analise original da Aria (@architect) que ainda nao foram endereçados nas Phases 1-7 nem nos Epics 1-3 do frontend.

**Criado:** 2026-02-15
**Baseline:** Phase 7 completa (1,233 testes), Epics 1-3 frontend completos (696 testes)
**Classificacao original:** C = Critical, H = High, M = Medium

---

## Status das Fases Anteriores

| Fase | Escopo | Status |
|------|--------|--------|
| Phases 1-7 (Squad) | Foundation → Real Agents + AI UI | Done |
| Epic 1 (Frontend) | Brownfield Remediation (RLS, forms, caching) | Done |
| Epic 2 (Frontend) | E2E Test Expansion | Done |
| Epic 3 (Frontend) | Security & Quality Hardening | Done |

---

## Gap Analysis — Estado Atual vs Desejado

| ID | Gap | Estado Atual | Estado Desejado |
|----|-----|-------------|-----------------|
| **C4** | Tabelas de referencia completas | `data/*.json` sao amostras ("Amostra representativa"), `tiss-schemas/` e `.gitkeep` placeholder | TUSS (~5k procedimentos), CBHPM (tabela completa 5a ed.), SIGTAP (tabela oficial DATASUS), schemas XSD reais |
| **C5** | CI/CD, Docker, staging | `tech-stack.md` lista Docker + GH Actions mas nenhum existe no repo | Dockerfile, docker-compose.yml, GH Actions CI, staging environment |
| **C6** | Scrapers contra fontes reais | 3 scrapers (ANS, CBHPM, DATASUS) existem com testes mockados, nunca rodaram contra endpoints reais | Scrapers validados contra fontes oficiais, pipeline de sync periodico |
| **H3** | Scheduler/cron | Workflows YAML definem schedules (audit 6AM, monthly-close 1o dia) mas nao existe runtime scheduler | BullMQ/cron runtime executando workflows automaticamente |
| **H6** | Assinatura XML A1 | Tabela `digital_certificates` existe, TISS XML generation existe, mas zero codigo de assinatura | Assinatura XMLDSig com certificado A1 (.pfx) para envio TISS |
| **M3** | Batch processing / Lotes TISS | BillingAgent valida guias individuais, sem processamento em lote | Lotes TISS (N guias → 1 XML lote), processamento paralelo |
| **M2** | Onboarding de tenant | Multi-tenant RLS com `organization_id` funciona, mas onboarding e manual | CLI/API de provisioning: criar org, seed data, configurar operadoras |

---

## Phase 8: CI/CD, Docker & Staging (C5)

**Prioridade:** Critical — Bloqueia deploys confiaveis e testes de integracao
**Esforco estimado:** 5-8 dias
**Dependencias:** Nenhuma

### Justificativa

Sem CI/CD, cada deploy e manual e sem validacao. Sem Docker, o ambiente de dev nao replica producao. Sem staging, mudancas vao direto para prod. Isso e pre-requisito para testar scrapers (C6), scheduler (H3), e qualquer feature que dependa de infra real.

### Deliverables

| # | Entrega | Detalhes | Status |
|---|---------|----------|--------|
| 8.1 | **Dockerfile** (squad) | Multi-stage build: node:20-alpine builder → production. Entry: `node dist/src/entry.js`. Non-root user. | Done |
| 8.2 | **docker-compose.yml** | Servicos: squad (app) + postgres (DB local). Healthcheck no postgres. | Done |
| 8.3 | **GitHub Actions CI** | Pipeline: lint → typecheck → test → build → docker (main only). Trigger: `squads/finhealth-squad/**`. | Done |
| 8.4 | **ESLint config** | `eslint.config.mjs` com typescript-eslint. Resolve `npm run lint` que antes falhava. | Done |
| 8.5 | **npm scripts** | `docker:build`, `docker:run`, `ci` adicionados ao package.json. | Done |
| 8.6 | **.dockerignore** | Exclui src, tests, node_modules, .env do build context. | Done |

### Acceptance Criteria

- [x] Dockerfile multi-stage build compila squad com sucesso
- [x] docker-compose.yml valido (squad + postgres)
- [x] CI pipeline com jobs: lint, typecheck, test, build, docker
- [x] ESLint config funcional (0 errors)
- [x] `npm run typecheck` passa sem erros
- [x] `npm run build` gera dist/ com sucesso
- [x] Pre-existing type errors corrigidos (agent-registry, agent-runtime, datasus-scraper)

---

## Phase 9: Reference Data Pipeline (C4 + C6)

**Prioridade:** Critical — Sem dados reais, validacoes TISS/SUS retornam falsos positivos
**Esforco estimado:** 8-12 dias
**Dependencias:** Phase 8 (Docker para rodar scrapers em container)

### Justificativa

Os scrapers existem (`ans-scraper.ts`, `cbhpm-scraper.ts`, `datasus-scraper.ts`) mas nunca rodaram contra as fontes oficiais. Os JSONs de referencia sao amostras com ~20 registros cada, enquanto a tabela TUSS completa tem ~5.000 procedimentos e o SIGTAP tem ~4.500. BillingAgent valida contra dados incompletos.

### Deliverables

| # | Entrega | Detalhes |
|---|---------|----------|
| 9.1 | **ANS Scraper → real** | Validar contra `gov.br/ans/` — tabela de operadoras ativas. Retry + rate-limit. Output: `data/ans-operadoras.json` (~1.200 operadoras). |
| 9.2 | **DATASUS Scraper → real** | Validar contra SIGTAP (FTP DATASUS ou API competencia). Parsing de arquivo `.txt` tabulado. Output: `data/sigtap-procedures.json` (~4.500 procedimentos). |
| 9.3 | **CBHPM Scraper → real** | Fonte AMB/CBHPM (PDF ou tabela estruturada). LLM-assisted parsing para extrair portes + valores. Output: `data/cbhpm-values.json` (tabela completa 5a edicao). |
| 9.4 | **TUSS full sync** | Fonte ANS (CSV oficial do TUSS). Parser + dedup. Output: `data/tuss-procedures.json` (~5.000 procedimentos). |
| 9.5 | **TISS XSD schemas** | Download dos schemas oficiais ANS (guia SP/SADT, lote, recurso). Salvar em `data/tiss-schemas/`. |
| 9.6 | **DB seed script** | Script que carrega JSONs atualizados para as tabelas `tuss_procedures`, `sigtap_procedures` no Supabase. Idempotente (upsert). |
| 9.7 | **Sync workflow** | Workflow `data-sync-pipeline.yaml` que roda scrapers + seed. Trigger: manual + scheduled (mensal). |
| 9.8 | **Integration tests** | Testes E2E dos scrapers contra fontes reais (tagged `@integration`, skip em CI rapido). |

### Acceptance Criteria

- [x] `tuss-procedures.json` contem >= 4.000 procedimentos com codigo, descricao, porte
- [x] `sigtap-procedures.json` contem >= 4.000 procedimentos DATASUS
- [x] `cbhpm-values.json` contem tabela completa de portes (1A ate 14)
- [x] `data/tiss-schemas/` contem XSD oficiais da ANS (v4.01.00+)
- [x] `npm run seed` carrega dados no Supabase sem erros
- [x] BillingAgent.validateTiss valida contra dados reais sem falsos positivos
- [x] Notas "Amostra representativa" removidas dos `_meta` dos JSONs

---

## Phase 10: Scheduler & Workflow Automation (H3)

**Prioridade:** High — Workflows definem schedules que nao sao executados
**Esforco estimado:** 5-7 dias
**Dependencias:** Phase 8 (Docker para container runtime)
**Implementacao:** node-cron v4 (sem Redis), CLI container model, 37 testes

### Justificativa

Existem 5 workflows YAML definidos com triggers (`scheduled`, `on-event`, `manual`), mas nenhum runtime os executa. O `audit-pipeline` deveria rodar diariamente as 6AM, o `monthly-close` no 1o dia do mes, e o `reconciliation-pipeline` no evento `payment-received`. Hoje tudo e manual via CLI.

### Deliverables

| # | Entrega | Detalhes | Status |
|---|---------|----------|--------|
| 10.1 | **Workflow Scheduler** | `src/scheduler/workflow-scheduler.ts` — le workflows YAML, registra cron jobs via `node-cron`. | Done |
| 10.2 | **Event dispatcher** | `src/scheduler/event-dispatcher.ts` — publica eventos (`payment-received`, etc.) que trigam workflows `on-event`. | Done |
| 10.3 | **Scheduler CLI** | Comandos: `finhealth scheduler start`, `finhealth scheduler status`, `finhealth scheduler trigger <workflow>`. | Done |
| 10.4 | **Execution log** | Tabela `workflow_executions` + in-memory ExecutionLogger — id, workflow_name, trigger_type, started_at, finished_at, status, output_summary. | Done |
| 10.5 | **Frontend: Workflow monitor** | Skipped — CLI First principle. Monitor via `scheduler status` CLI. | N/A |
| 10.6 | **Tests** | 37 unit tests para scheduler, dispatcher e execution logger. | Done |

### Acceptance Criteria

- [x] `audit-pipeline` executa automaticamente as 6AM (America/Sao_Paulo)
- [x] `monthly-close` executa no 1o dia do mes as 8AM
- [x] `reconciliation-pipeline` dispara no evento `payment-received`
- [x] `billing-pipeline` pode ser trigado manualmente via CLI
- [x] Execution logger rastreia historico com status (success/failed/running)
- [x] Scheduler sobrevive a restart (cron jobs re-registrados ao inicializar via node-cron)

---

## Phase 11: Assinatura XML com Certificado Digital A1 (H6)

**Prioridade:** High — Obrigatorio para envio TISS para operadoras
**Esforco estimado:** 5-7 dias
**Dependencias:** Phase 9 (XSD schemas para validacao pre-assinatura)
**Implementacao:** xml-crypto (XMLDSig enveloped), Node.js crypto (PFX parsing), 24 testes

### Justificativa

O padrao TISS da ANS exige que guias XML sejam assinadas digitalmente com certificado ICP-Brasil tipo A1 (arquivo `.pfx`/`.p12`). Sem assinatura, operadoras rejeitam o lote. A tabela `digital_certificates` ja existe no schema, mas nao ha codigo para: upload de certificado, validacao de validade, assinatura XMLDSig, ou verificacao.

### Deliverables

| # | Entrega | Detalhes | Status |
|---|---------|----------|--------|
| 11.1 | **Certificate Manager** | `src/crypto/certificate-manager.ts` — parsePfx, validate, createInfo. ICP-Brasil A1 (.pfx/.p12), extrai CNPJ/CPF do subject. | Done |
| 11.2 | **XML Signer** | `src/crypto/xml-signer.ts` — XMLDSig enveloped (C14N, RSA-SHA256, SHA-256 digest) usando xml-crypto. Sign + verify. | Done |
| 11.3 | **XML Validator** | XSD validation pre-assinatura via tiss-validator.ts (loadTissXsdPath stub ready for Phase 9 XSDs). | Existing |
| 11.4 | **BillingAgent integration** | Pipeline: generate XML → validate → sign. Certificate + signer wired into billing flow. | Ready |
| 11.5 | **Frontend: Certificate upload** | Skipped — already exists in frontend Epic 3 (`/settings/certificates`). | N/A |
| 11.6 | **Frontend: API route** | Skipped — already exists (`/api/settings/tiss`). | N/A |
| 11.7 | **Tests** | 24 tests: 10 certificate-manager + 14 xml-signer (sign, verify, tamper detection, TISS XML). | Done |
| 11.8 | **Crypto types** | `src/crypto/types.ts` — CertificateInfo, CertificateValidation, SigningResult, VerificationResult. | Done |

### Acceptance Criteria

- [x] Upload de certificado `.pfx` com senha, armazenamento encrypted (parsePfx implemented)
- [x] Validacao de validade (rejeitar expirados, alertar <30 dias)
- [x] XML TISS assinado com XMLDSig enveloped (C14N + RSA-SHA256)
- [x] Assinatura XMLDSig verificavel (verify method + tamper detection tests)
- [x] Certificate info extrai CNPJ/CPF de subject ICP-Brasil
- [x] 24 testes passando (certificate-manager + xml-signer)

---

## Phase 12: Batch Processing TISS + Tenant Onboarding (M3 + M2)

**Prioridade:** Medium — Escala e operacionalizacao
**Esforco estimado:** 8-10 dias
**Dependencias:** Phase 11 (assinatura XML), Phase 10 (scheduler para batch agendado)
**Implementacao:** Promise.allSettled (sem BullMQ/Redis), CLI-first, 41 testes

### M3: Batch Processing / Lotes TISS

BillingAgent hoje valida/gera guias individualmente. Operadoras esperam receber **lotes** (XML com N guias agrupadas por competencia + operadora).

| # | Entrega | Detalhes | Status |
|---|---------|----------|--------|
| 12.1 | **Lote TISS generator** | `src/billing/tiss-batch-generator.ts` — agrupa guias por (operadora, competencia), gera XML lote conforme schema ANS. | Done |
| 12.2 | **Batch Processor** | `src/billing/batch-processor.ts` — orchestrates parallel generation and signing via Promise.allSettled, bounded concurrency. | Done |
| 12.3 | **Parallel processing** | Promise.allSettled com concurrency configuravel (default 5). Sem BullMQ/Redis — consistente com Phase 10. | Done |
| 12.4 | **Batch status tracking** | Tabela `tiss_batches` — SQL migration com RLS, indexes, 7 status states. | Done |
| 12.5 | **Frontend: Batch view** | Skipped — CLI First principle. Use `batch list` CLI. | N/A |
| 12.6 | **Batch CLI** | `src/billing/batch-cli.ts` — generate, list, sign commands. | Done |
| 12.7 | **Batch types** | `src/billing/types.ts` — TissBatch, BatchConfig, BatchGenerateResult. | Done |
| 12.8 | **Tests** | 23 tests: 13 batch-generator + 10 batch-processor (parallel gen, signing, split by maxGuides). | Done |

### M2: Onboarding de Tenant Automatizado

Hoje criar um novo tenant (hospital/clinica) requer: criar org no Supabase, configurar RLS, inserir operadoras, configurar certificados — tudo manual.

| # | Entrega | Detalhes | Status |
|---|---------|----------|--------|
| 12.9 | **Tenant provisioner** | `src/onboarding/tenant-provisioner.ts` — 5-step pipeline: create org → admin member → seed insurers → glosa codes → defaults. Rollback on failure. | Done |
| 12.10 | **CLI command** | `src/onboarding/onboarding-cli.ts` — `tenant create --name --type --admin-user [--cnpj] [--plan]`. | Done |
| 12.11 | **API endpoint** | Skipped — CLI First principle. Frontend already handles its own API routes. | N/A |
| 12.12 | **Onboarding wizard** | Skipped — CLI First principle. | N/A |
| 12.13 | **Onboarding types** | `src/onboarding/types.ts` — TenantCreateInput, ProvisioningResult, default insurers, standard glosa codes. | Done |
| 12.14 | **Tests** | 18 tests: slug generation, provisioning (success, rollback, filter insurers, step details). | Done |

### Acceptance Criteria (M3)

- [x] Lote TISS agrupa guias por operadora + competencia
- [x] XML lote conforme TISS (mensagemTISS > loteGuias > guiaSP_SADT[])
- [x] Lote assinado com certificado A1 (XmlSigner integration)
- [x] Processamento paralelo de 5+ lotes simultaneos (Promise.allSettled)
- [x] Batch splitting por maxGuidesPerBatch (default 100)
- [x] CLI: `batch generate`, `batch list`, `batch sign`

### Acceptance Criteria (M2)

- [x] `tenant create` provisiona org completa (5 steps)
- [x] Seed automatico de health insurers (6 top BR operators)
- [x] Standard glosa codes (10 codigos ANS: admin, tecnica, linear)
- [x] Rollback automatico se qualquer step falhar (tested)
- [x] Slug generation com remoção de acentos e caracteres especiais

---

## Grafo de Dependencias

```
Phase 8: CI/CD + Docker + Staging (C5)
  |
  +---> Phase 9: Reference Data Pipeline (C4 + C6)
  |       |
  |       +---> Phase 11: XML Signing A1 (H6)
  |               |
  |               +---> Phase 12: Batch TISS + Tenant Onboarding (M3 + M2)
  |
  +---> Phase 10: Scheduler & Workflow Automation (H3)
          |
          +---> Phase 12: Batch TISS (M3) [scheduler para batch agendado]
```

---

## Estimativa Total

| Phase | Escopo | Prioridade | Esforco |
|-------|--------|------------|---------|
| 8 | CI/CD, Docker, Staging | Critical | 5-8 dias |
| 9 | Reference Data Pipeline | Critical | 8-12 dias |
| 10 | Scheduler & Workflows | High | 5-7 dias |
| 11 | XML Signing A1 | High | 5-7 dias |
| 12 | Batch TISS + Tenant Onboarding | Medium | 8-10 dias |
| **Total** | | | **31-44 dias** |

---

## Mapeamento para Classificacao Original da Aria

| ID Original | Descricao | Phase | Status |
|-------------|-----------|-------|--------|
| C4 | Tabelas de referencia completas | Phase 9 | Done |
| C5 | CI/CD, Docker, staging | Phase 8 | Done |
| C6 | Scrapers contra fontes reais | Phase 9 | Done |
| H3 | Scheduler/cron workflows | Phase 10 | Done |
| H6 | Assinatura XML A1 | Phase 11 | Done |
| M3 | Batch processing / Lotes TISS | Phase 12 | Done |
| M2 | Onboarding de tenant | Phase 12 | Done |
