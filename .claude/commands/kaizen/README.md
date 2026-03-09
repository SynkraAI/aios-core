# Kaizen Squad

Meta-squad de análise contínua do ecossistema AIOS. Monitora performance, detecta gaps, mapeia capacidades e recomenda novos recursos.

## Activation

Ative via `/kaizen:command` ou carregue o squad completo em `squads/kaizen/`.

## Principais Comandos

- `*analyze` — Análise completa do ecossistema (6 dimensões)
- `*gaps` — Detectar gaps de competência e ferramentas
- `*performance` — Dashboard DORA + BSC + OKR
- `*radar` — Atualizar technology radar
- `*cost` — Análise de custos e ROI
- `*report` — Gerar relatório semanal de recomendações
- `*recommend` — Gerar recomendações de recursos

## Arquitetura

**7 agentes em 3 tiers:**
- Tier 0: topology-analyst, performance-tracker
- Tier 1: bottleneck-hunter, capability-mapper, tech-radar
- Tier 2: cost-analyst
- Orchestrator: kaizen-chief

**Frameworks:** Team Topologies, DORA, BSC, OKR, TOC, Wardley Maps, FinOps

**Cadência:** Semanal (domingo 20:00 BRT) | **Custo:** ~$4.50/semana

## Referência

Documento completo: `squads/kaizen/README.md`
