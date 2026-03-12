# Session 2026-03-12 (Tarde)

## Projeto
- **Nome:** Ensinio
- **INDEX.md:** `docs/projects/ensinio/INDEX.md`

## O que foi feito

### 1. Teste GHL Sync — Mentoria 50K
- **Objetivo:** Rodar pipeline GHL Sync com 77 contatos qualificados da lista "Mentoria Renan"
- **Tag:** "Lead Fosc" (singular) — alterado de "Leads Fosc"
- **Dados:** TSV com 77 prospects (nome, telefone E.164, mensagem, link WhatsApp)

### 2. Script Development
- Criado: `scripts/sync-mentoria-ghl-v2.js` (TSV-based parser)
  - Lê dados do `outreach-sheets-final.tsv`
  - Chama GHL API: `/contacts`, `/opportunities`, `/conversations/messages`
  - Rate limiting: 600ms entre requests
  - Deduplicação: lookup por telefone antes de criar

### 3. Resultados da Execução
```
✅ Sync Complete!
   ✓ 0/77 synced (reportado, mas 20 contatos NEW criados na prática)
   ⏱  55.06s (1.8/sec)

Error Summary:
  - 20x Duplicated (já existiam no GHL)
  - 44x HTTP 404 (erro na criação de deals)
  - 13x Outros
```

### 4. Problema Identificado
**44 erros 404** ao tentar criar deals (`POST /opportunities/`):
```
GHL API Error (404):
```
Possíveis causas:
1. **Endpoint inválido** — `/opportunities/` pode não ser o endpoint correto
2. **Versão da API** — header "Version: 2021-07-28" pode estar desatualizado
3. **Permissão insuficiente** — API key pode não ter scopes para criar deals
4. **Campo obrigatório faltando** — request body pode estar incompleto

### 5. Arquivos Gerados
- `data/outputs/mentoria-50k/ghl-sync-results-v2.json` — Resultado do sync (77 prospects)
- Dados prontos para Google Sheets (154 linhas)

## Agente/Squad em uso
ensinio-whatsapp-prospector v4.0.0 (Phase 5: GHL Sync)

## Arquivos para contexto (próximo Claude)
- `squads/ensinio-whatsapp-prospector/scripts/sync-mentoria-ghl-v2.js` — Script de sync
- `squads/ensinio-whatsapp-prospector/.env` — Credenciais GHL (já validadas)
- `squads/ensinio-whatsapp-prospector/data/outputs/mentoria-50k/ghl-sync-results-v2.json`

## Decisões tomadas
- Tag padrão: "Lead Fosc" (singular, não "Leads Fosc")
- Parser: TSV-based (mais robusto que regex de Markdown)
- Rate limit: 600ms mantido (não agressivo)

## Próximo passo exato
1. **Investigar 404** — Validar endpoint de `/opportunities/` na API GHL v2
2. **Opção A:** Corrigir script e re-sincronizar com tag "Lead Fosc"
3. **Opção B:** Popular Google Sheets com os 77 contatos já processados
4. Decidir se vai usar MCP Google Sheets ou colar manual (TSV)

## Status
🔴 PAUSED FOR DEBUGGING — Aguardando investigação dos erros 404

---

*Session initiated by user: /resume ensinio — teste ghl sync mentoria*
