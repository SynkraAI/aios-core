# Ensinio — Project Index

## Estado Atual
- **Squad:** `ensinio-whatsapp-prospector` v4.0.0 — pipeline completo com GHL
- **Epic:** [EPIC-ENSINIO-APP](../../stories/epics/epic-ensinio-prospector-app/EPIC.md) — Evolução Squad → App
- **Local:** `docs/projects/ensinio/`
- **Status:** Squad operacional, epic de evolução para app em Draft
- **Resultados:** 178 contatos, 77 qualificados, 20 HOT prospects (score 9-10)
- **Phone Resolution:** 77/77 prospects com telefone resolvido (100% coverage)
- **Outreach:** 77/77 mensagens personalizadas com WhatsApp links
- **Google Sheets:** Scripts prontos (TSV + Apps Script), MCP OAuth configurado

## Dados do Projeto
- **Phone-book:** `squads/ensinio-whatsapp-prospector/data/phone-books/mentoria-50k.json`
- **Outputs:** `squads/ensinio-whatsapp-prospector/data/outputs/mentoria-50k/`
  - `EXECUTIVE-SUMMARY.md` — Resumo executivo com Top 5 e action plan
  - `analysis-results-FINAL.md` — Relatório detalhado
  - `analysis-results.md` — Análise completa (2025 linhas, todos os 77 prospects)
  - `outreach-messages.md` — 77 mensagens personalizadas com WhatsApp links
  - `unique-quotes-top20.md` — Quotes fingerprint para busca no WhatsApp
  - `outreach-sheets-final.tsv` — Dados formatados para Google Sheets (7 colunas)
  - `populate-sheet.gs` — Google Apps Script para popular planilha automaticamente
- **Planilha:** `https://docs.google.com/spreadsheets/d/124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`
- **Scripts:** `squads/ensinio-whatsapp-prospector/scripts/`
  - `generate-sheets-csv.js` — Gera TSV com 12 colunas (formato expandido)
  - `generate-sheets-paste.js` — Gera TSV com 7 colunas (formato planilha padrão)
  - `generate-apps-script.js` — Gera Apps Script com dados embutidos

## Última Sessão
- **Data:** 2026-03-10 ~01:30
- **Agente/Squad:** ensinio-whatsapp-prospector + Kaizen
- **O que foi feito:**
  1. Extraiu 230 contatos de 12 screenshots da lista de membros do WhatsApp
  2. Resolveu telefones de 50 prospects via match automático (nome→telefone)
  3. Resolveu 7 prospects restantes via busca manual (quotes no WhatsApp)
  4. Total: 77/77 prospects com telefone (100% coverage)
  5. Gerou scripts para Google Sheets (TSV, Apps Script, CSV)
  6. Configurou Google Workspace MCP OAuth (Client ID + Secret + Refresh Token)
  7. Análise Kaizen: infraestrutura MCP já existia, só faltava ativar credenciais

## Próximo Passo
- Revisar ADR de decisões técnicas (`docs/stories/epics/epic-ensinio-prospector-app/ADR-001-tech-stack.md`)
- Validar stories M0 com @po e iniciar M0.1 (extrair parser como módulo)
- Popular Google Sheets via MCP (campanha mentoria-50k pendente)

## Histórico
| Data | Sessão | Resumo |
|------|--------|--------|
| 2026-03-10 (2) | Phone Resolution + Sheets | 77/77 telefones resolvidos, scripts Google Sheets, MCP OAuth configurado |
| 2026-03-10 (1) | Outreach completo | 57 novas mensagens (score 3-6), total 77/77 prospects cobertos |
| 2026-03-09 (3) | Phone Resolution + Outreach | 20/20 telefones resolvidos, 20 mensagens personalizadas escritas |
| 2026-03-09 (2) | Pipeline real MENTORIA 50K | Parse+Score de 9708 linhas: 178 contatos, 77 qualificados, 20 HOT |
| 2026-03-09 (1) | Squad v3.0.0 | 4 melhorias: phone resolution, ICP/red flags, batch, scoring v2.1 |

## Epic & Stories
- **Epic:** [EPIC-ENSINIO-APP](../../stories/epics/epic-ensinio-prospector-app/EPIC.md) — 4 milestones (M0→M4), ~20 stories
- **ADR:** [ADR-001 Tech Stack](../../stories/epics/epic-ensinio-prospector-app/ADR-001-tech-stack.md) — Decisões arquiteturais
- **Stories M0:** `docs/stories/active/story-M0.*` — Fundação técnica (5 stories)

## Squads Relacionados
- `ensinio-whatsapp-prospector` — Pipeline de prospecção via WhatsApp (v4.0, base do app)
- `ensinio-mind` — Source of truth do conhecimento Ensinio (v1.1)
- `ensinio-prospector` — Prospecção geral (consome ensinio-mind)
