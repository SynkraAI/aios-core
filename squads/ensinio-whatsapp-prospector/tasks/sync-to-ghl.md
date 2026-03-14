# Task: Sync to GoHighLevel

## Objetivo
Sincronizar prospects aprovados com GoHighLevel: criar contatos, criar deals no pipeline e enviar mensagens de outreach.

## Pre-requisitos
- `.env` com `GHL_API_TOKEN`, `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, `GHL_DEFAULT_STAGE_ID`
- `approved_messages` do phase-4b (array de prospects com mensagem aprovada)

## Fluxo

### Step 0: Perguntar Tags (OBRIGATORIO)

**SEMPRE** perguntar ao usuario antes de iniciar o sync:

```
Qual tag deseja aplicar aos contatos no GHL?
Default: "Leads Fosc"

1. "Leads Fosc" (default)
2. Outra tag (especifique)
3. Multiplas tags (separadas por virgula)
```

Aguardar resposta antes de prosseguir.

### Step 1: Criar/Buscar Contatos

Para cada prospect aprovado:

```
POST /contacts/
Authorization: Bearer {GHL_API_TOKEN}
Version: 2021-07-28

{
  "locationId": "{GHL_LOCATION_ID}",
  "firstName": "{prospect.firstName}",
  "lastName": "{prospect.lastName}",
  "phone": "{prospect.phone}",
  "email": "{prospect.email || null}",
  "source": "WhatsApp Group Prospector",
  "tags": ["{tags_escolhidas_pelo_usuario}"],
  "customFields": [
    { "key": "whatsapp_group", "value": "{group_name}" },
    { "key": "prospect_score", "value": "{prospect.score}" },
    { "key": "ensinio_pillar", "value": "{prospect.pillar}" },
    { "key": "prospect_type", "value": "{prospect.type}" }
  ]
}
```

**Deduplicacao**: Buscar por telefone antes de criar (`GET /contacts/lookup/phone/{phone}`). Se ja existe, apenas adicionar tags.

### Step 2: Criar Deals (Opportunities)

Para cada contato criado/encontrado:

```
POST /opportunities/
Authorization: Bearer {GHL_API_TOKEN}
Version: 2021-07-28

{
  "pipelineId": "{GHL_PIPELINE_ID}",
  "pipelineStageId": "{GHL_DEFAULT_STAGE_ID}",
  "locationId": "{GHL_LOCATION_ID}",
  "contactId": "{contactId_do_step_1}",
  "name": "{prospect.name} - {group_name}",
  "source": "WhatsApp Prospector",
  "status": "open",
  "monetaryValue": 0
}
```

### Step 3: Enviar Mensagens (se `send_messages: true`)

Para cada contato com deal criado:

```
POST /conversations/messages
Authorization: Bearer {GHL_API_TOKEN}
Version: 2021-07-28

{
  "type": "WhatsApp",
  "contactId": "{contactId}",
  "message": "{approved_message.text}"
}
```

**IMPORTANTE**: WhatsApp requer template aprovado pela Meta para primeira mensagem (fora da janela de 24h). Se o envio falhar com erro de template, registrar no report e continuar.

### Step 4: Batch Processing

- Processar em lotes de 50
- Delay de 600ms entre requests (rate limit ~100/min)
- Idempotency: usar `{phone}_{group_name}` como chave unica
- Progress: reportar a cada 10% do lote

## Output

```yaml
ghl_sync_report:
  tags_applied: ["Leads Fosc"]
  contacts_created: 0
  contacts_found_existing: 0
  deals_created: 0
  messages_sent: 0
  messages_failed: 0
  errors: []
```

## Error Handling

| Erro | Acao |
|------|------|
| 401 Unauthorized | HALT - token invalido |
| 403 Forbidden | HALT - sem permissao |
| 422 Missing field | LOG + skip prospect |
| 429 Rate limit | WAIT 60s + retry |
| 400 Bad request | LOG + skip prospect |

## Quality Gate QG-005

- [ ] Todos os contatos criados/encontrados no GHL
- [ ] Todos os deals criados no pipeline correto
- [ ] Tags aplicadas conforme escolha do usuario
- [ ] Mensagens enviadas (ou falhas documentadas)
- [ ] Nenhum erro 401/403 (autenticacao OK)
- [ ] Report completo gerado
