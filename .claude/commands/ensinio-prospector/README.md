# Ensinio Prospector — Squad Commands

Squad especializado em prospectar leads via Google Sheets + Instagram enrichment + GoHighLevel CRM.

## Agentes

- `/ensinio-prospector:agents:prospector-chief` — Atlas, orquestrador do pipeline
- `/ensinio-prospector:agents:instagram-researcher` — Scout, pesquisador Instagram/web
- `/ensinio-prospector:agents:prospect-analyst` — Minerva, analista de fit
- `/ensinio-prospector:agents:outreach-writer` — Velvet, copywriter de outreach
- `/ensinio-prospector:agents:crm-syncer` — Nexus, sync CRM + Slack

## Workflow

- `/ensinio-prospector:workflows:sheets-instagram-pipeline` — Pipeline completo (9 fases)

## Tasks

- `/ensinio-prospector:tasks:fetch-sheets-lead` — Buscar proximo lead
- `/ensinio-prospector:tasks:enrich-instagram` — Enriquecer dados Instagram/site
- `/ensinio-prospector:tasks:detect-checkout-platform` — Detectar plataforma checkout
- `/ensinio-prospector:tasks:load-ensinio-kb` — Carregar knowledge base Ensinio
- `/ensinio-prospector:tasks:analyze-and-score` — Analisar e scorar prospect
- `/ensinio-prospector:tasks:generate-outreach` — Gerar mensagem personalizada
- `/ensinio-prospector:tasks:validate-outreach` — Validar mensagem
- `/ensinio-prospector:tasks:sync-to-crm` — Sincronizar GoHighLevel
- `/ensinio-prospector:tasks:notify-team` — Notificar equipe via Slack
- `/ensinio-prospector:tasks:mark-lead-done` — Marcar lead como processado

## Uso

```bash
# Executar pipeline completo
/ensinio-prospector:workflows:sheets-instagram-pipeline

# Ativar agente especifico
/ensinio-prospector:agents:prospector-chief

# Executar task individual
/ensinio-prospector:tasks:fetch-sheets-lead
```

## Pipeline Overview

1. **Fetch** — Buscar lead da planilha (status: Fila)
2. **Enrich** — Instagram + site research via EXA
3. **Load KB** — Carregar 5 pilares Ensinio (paralelo)
4. **Analyze** — Scorar fit e classificar tipo
5. **Outreach** — Gerar mensagem personalizada (Opus)
6. **Validate** — Validar qualidade da mensagem
7. **CRM** — Sincronizar GoHighLevel
8. **Notify** — Notificar equipe via Slack
9. **Mark Done** — Atualizar planilha (Processado)

## Quality Gates

- **QG-001** — Enrichment quality check
- **QG-002** — Scoring validation
- **QG-003** — Outreach message validation
- **QG-004** — CRM sync confirmation
- **QG-005** — Sheet update confirmation
