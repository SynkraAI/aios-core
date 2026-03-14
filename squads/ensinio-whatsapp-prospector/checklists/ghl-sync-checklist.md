# QG-005: GHL Sync Validation Checklist

## Pre-Sync
- [ ] `.env` carregado com `GHL_API_TOKEN` e `GHL_LOCATION_ID`
- [ ] Pipeline ID e Stage ID validos
- [ ] Tags confirmadas com o usuario (default: "Leads Fosc")
- [ ] `approved_messages` disponivel do phase anterior

## Contact Creation
- [ ] Busca por telefone antes de criar (deduplicacao)
- [ ] Contatos existentes: apenas adicionar tags (nao duplicar)
- [ ] Novos contatos: criados com nome, telefone, tags e custom fields
- [ ] Custom fields preenchidos: whatsapp_group, prospect_score, ensinio_pillar, prospect_type

## Deal Creation
- [ ] Deals criados no pipeline correto (Qualificacao)
- [ ] Stage correto (Para prospectar)
- [ ] Nome do deal: "{nome} - {grupo}"
- [ ] Source: "WhatsApp Prospector"
- [ ] Status: "open"

## Message Sending
- [ ] Mensagens enviadas via canal WhatsApp
- [ ] Falhas de template documentadas (nao bloqueiam)
- [ ] Idempotency keys utilizados

## Batch Processing
- [ ] Rate limit respeitado (delay 600ms entre requests)
- [ ] Progresso reportado a cada 10%
- [ ] Erros 422/400 logados e prospect skipado
- [ ] Nenhum erro 401/403 (autenticacao OK)

## Report
- [ ] `ghl_sync_report` gerado com totais
- [ ] Contatos criados vs encontrados
- [ ] Deals criados
- [ ] Mensagens enviadas vs falhadas
- [ ] Tags aplicadas documentadas
