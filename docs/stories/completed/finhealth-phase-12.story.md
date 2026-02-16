# FinHealth Squad — Phase 12: Batch Processing TISS + Tenant Onboarding (M3 + M2)

> Implementar processamento em lote de guias TISS (agrupamento por operadora + competencia, XML lote, assinatura paralela) e onboarding automatizado de tenant com rollback.

**Status:** Done
**Data:** 2026-02-16
**Baseline:** 628 testes squad (Phases 10-11 inclusas)
**Final:** 669 testes (+41 novos)

---

## Escopo

### M3: Batch Processing TISS

Operadoras de saude esperam receber lotes TISS (XML com N guias agrupadas por operadora + competencia). Ate agora, o BillingAgent gerava guias individuais. Esta fase implementa:

1. **Batch Generator** — agrupa contas medicas por (insurer, competencia), gera XML lote ANS
2. **Batch Processor** — processamento paralelo com Promise.allSettled, assinatura via XmlSigner
3. **Batch CLI** — generate, list, sign via CLI
4. **tiss_batches table** — SQL migration com RLS, 7 status states

### M2: Tenant Onboarding

Criar um novo tenant (hospital/clinica) requeria passos manuais. Agora:

1. **Tenant Provisioner** — pipeline de 5 steps com rollback automatico
2. **Onboarding CLI** — create, list, info via CLI
3. **Reference data seeding** — 6 health insurers + 10 glosa codes padrao

---

## Decisoes Tecnicas

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Parallel processing | Promise.allSettled | Sem BullMQ/Redis — consistente com Phase 10 (node-cron, sem Redis) |
| Concurrency | Configuravel (default 5) | Bounded concurrency para nao sobrecarregar DB |
| Batch splitting | maxGuidesPerBatch=100 | Limite ANS por lote |
| Rollback | Reverse sequential | Steps completados sao revertidos em ordem reversa |
| Frontend | CLI-first | Principio arquitetural AIOS — CLI First |
| Slug generation | Normalize + kebab-case | Remove acentos, caracteres especiais, max 50 chars |

---

## Deliverables

### M3: Billing Batch

| Arquivo | Descricao |
|---------|-----------|
| `src/billing/types.ts` | TissBatch, BatchConfig, BatchGenerateResult, BatchGroupKey |
| `src/billing/tiss-batch-generator.ts` | groupAccountsByBatch, buildBatchXml, createBatchFromGroup |
| `src/billing/batch-processor.ts` | BatchProcessor (generate + sign, parallel) |
| `src/billing/batch-cli.ts` | CLI: generate, list, sign |
| `src/billing/migration-tiss-batches.sql` | SQL migration com RLS |
| `src/billing/tiss-batch-generator.test.ts` | 13 testes |
| `src/billing/batch-processor.test.ts` | 10 testes |

### M2: Tenant Onboarding

| Arquivo | Descricao |
|---------|-----------|
| `src/onboarding/types.ts` | TenantCreateInput, ProvisioningResult, default insurers, glosa codes |
| `src/onboarding/tenant-provisioner.ts` | TenantProvisioner (5-step pipeline + rollback) |
| `src/onboarding/onboarding-cli.ts` | CLI: create, list, info |
| `src/onboarding/tenant-provisioner.test.ts` | 18 testes |

### Modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/index.ts` | Exports billing batch + onboarding |
| `package.json` | CLI scripts: batch, batch:generate, batch:list, tenant, tenant:create |

---

## Testes (41 novos)

**tiss-batch-generator.test.ts (13 testes):**
- groupAccountsByBatch: agrupa por insurer+competencia, skip sem insurer, empty, associa procedures
- generateBatchId: IDs unicos
- generateLoteNumber: 12 digitos
- buildBatchXml: single guide, multiple guides, no procedures, schema version
- computeTotalAmount: soma, vazio
- createBatchFromGroup: objeto completo

**batch-processor.test.ts (10 testes):**
- generateBatches: empty, single batch, multiple insurers, different competencias, insurer not found, split large, filters
- signBatch: sign XML, no XML error
- signBatches: parallel signing

**tenant-provisioner.test.ts (18 testes):**
- generateSlug: from name, remove accents, special chars, max length, no leading/trailing hyphens
- provision: success (5 steps), createOrganization data, admin member role, default role, custom slug, seed insurers, filter insurers, rollback on member failure, rollback on insurer failure, fail without rollback, duration, no rollback in result, step details

---

## Acceptance Criteria

### M3

- [x] Lote TISS agrupa guias por operadora + competencia
- [x] XML lote conforme TISS (mensagemTISS > loteGuias > guiaSP_SADT[])
- [x] Lote assinado com certificado A1 via XmlSigner
- [x] Processamento paralelo (Promise.allSettled, concurrency=5)
- [x] Batch splitting por maxGuidesPerBatch
- [x] CLI: batch generate, batch list, batch sign
- [x] SQL migration tiss_batches com RLS

### M2

- [x] Tenant provisioner com 5-step pipeline
- [x] Seed de 6 health insurers (top BR operators)
- [x] 10 standard glosa codes (ANS)
- [x] Rollback automatico testado (org + member revertidos)
- [x] CLI: tenant create, tenant list, tenant info
- [x] Slug generation com normalizacao
- [x] 41 testes passando
- [x] TypeScript compila sem erros
