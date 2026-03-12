# Task: GHL Sync v5.0 (Phase 9 - Opcional)

**Status:** Ready for Implementation
**Agent:** Atlas (prospector-chief)
**Model:** sonnet
**Executor Role:** CRM Synchronizer
**Type:** Optional (não bloqueia pipeline)

---

## ⚠️ IMPORTANTE: NÃO ENVIA MENSAGENS!

```
❌ ESTA FASE NÃO ENVIA NENHUMA MENSAGEM

   Envio já foi feito em Phase 8:
   - Você clicou no link WhatsApp
   - Enviou manualmente no WhatsApp Web
   - Marcou "✅ Enviado" em Coluna H do Sheets

✅ ESTA FASE FAZ:
   - Cria contatos no GHL
   - Cria deals no pipeline
   - Aplica tags aos contatos
   - Preenche Link GHL em Coluna I
   - Preenche GHL Contact ID em Coluna J
```

---

## Objetivo

Sincronizar dados do Google Sheets com GoHighLevel CRM (sistema secundário).

**Fonte de Verdade:** Google Sheets (Phase 8)
**CRM Secundário:** GoHighLevel (Phase 9)

---

## Entrada

**Dados de entrada (Google Sheets - Phase 8):**
```
Spreadsheet ID: 124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI

Coluna A: Nome
Coluna B: Telefone (+55...)
Coluna C: Grupo WhatsApp
Coluna D: Projeto
Coluna E: Explicação
Coluna F: Mensagem
Coluna G: Link WhatsApp
Coluna H: Status Envio (⬜ Não enviado | ✅ Enviado)
Coluna I: [VAZIO - será preenchido]
Coluna J: [VAZIO - será preenchido]
```

---

## PASSO 0: Perguntar Tags (Interativo)

**Prompt ao usuário:**
```
┌─────────────────────────────────────────────┐
│ Qual tag deseja aplicar aos contatos no GHL? │
│                                             │
│ 1. "Leads Fosc" (default)                   │
│ 2. Outra tag customizada                    │
│ 3. Múltiplas tags (ex: "Leads,Hot,VIP")    │
│                                             │
│ Escolha [1-3]: _                            │
└─────────────────────────────────────────────┘
```

**Resultado:** `selected_tags = ["Leads Fosc"]` (ou user input)

---

## Processamento

### PASSO 1: Ler Sheets

**Algoritmo:**
```
1. Conectar ao Google Sheets API
2. Ler spreadsheet ID: 124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI
3. Ler todas as abas (Summary, grupo_name, etc)
4. Para cada aba com dados:
   - Pular aba "Summary"
   - Ler linhas 2+ (skip headers em linha 1)
   - Extrair colunas A-H (ignorar I, J)
5. Validar dados:
   - Coluna B (telefone) não vazio?
   - Coluna H (status) = "✅ Enviado" ou user selected all?
6. Acumular lista de contatos para sincronizar
```

**Output:**
```javascript
const contacts = [
  {
    row_id: 2,
    sheets_name: "João Silva",
    sheets_phone: "+5531999887766",
    sheets_group: "Mentoria 50k",
    sheets_project: "Podcast",
    sheets_status: "✅ Enviado",
    sheets_message: "Opa João!...",
    ghl_contact_id: null,  // será preenchido
    ghl_link: null        // será preenchido
  },
  { ... }
]
```

### PASSO 2: Validar Contatos

**Blocking Checks:**
```
✅ Telefone válido (E.164 format)?
✅ Nome não vazio?
✅ Status = "✅ Enviado" (default) ou incluir todos?
```

**Warning Checks:**
```
⚠️ Telefone inválido → Pular contato
⚠️ Nome muito curto (<2 chars) → Usar "Contato"
```

### PASSO 3: Buscar Contatos Existentes (Deduplicação)

**Para cada contato:**
```javascript
// 1. Buscar por telefone no GHL
REQUEST: GET /contacts/lookup/phone/{phone}
{
  "phone": "+5531999887766"
}

RESPONSE:
{
  "id": "ABC123",
  "firstName": "João",
  "phone": "+5531999887766",
  "tags": ["Tag1", "Tag2"]
}

// 2. Se encontrou:
//    - contactId = ABC123
//    - Ação: Atualizar tags (append)
//
// 3. Se não encontrou (404):
//    - contactId = null
//    - Ação: Criar novo contato
```

### PASSO 4: Criar/Atualizar Contatos

**Algoritmo:**
```javascript
for (const contact of contacts) {

  // 1. Buscar contato existente
  const existing = await ghl.lookupByPhone(contact.sheets_phone);

  if (existing) {
    // Contato já existe → Apenas adicionar tags
    contactId = existing.id;
    await ghl.updateTags(contactId, selected_tags);
    console.log(`✅ Updated tags for ${contact.sheets_name}`);

  } else {
    // Criar novo contato
    const newContact = await ghl.createContact({
      locationId: GHL_LOCATION_ID,
      firstName: contact.sheets_name.split(' ')[0],
      lastName: contact.sheets_name.split(' ').slice(1).join(' ') || '',
      phone: contact.sheets_phone,
      source: 'WhatsApp Group Prospector',
      tags: selected_tags,
      customFields: {
        whatsapp_group: contact.sheets_group,
        prospect_score: contact.sheets_score,
        ensinio_pillar: contact.sheets_pillar,
        prospect_type: contact.sheets_project,
        sheets_source_row: contact.row_id.toString()
      }
    });

    contactId = newContact.id;
    console.log(`✅ Created contact ${contact.sheets_name} (${contactId})`);
  }

  // 2. Guardar contactId para deal
  contact.ghl_contact_id = contactId;
}
```

**API Request:**
```javascript
REQUEST: POST /contacts/
{
  "locationId": "XXXXXX",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+5531999887766",
  "source": "WhatsApp Group Prospector",
  "tags": ["Leads Fosc"],           // ← Tags do PASSO 0
  "customFields": {
    "whatsapp_group": "Mentoria 50k",
    "prospect_score": "7.2",
    "ensinio_pillar": "Marketing & Growth",
    "prospect_type": "Content Creator",
    "sheets_source_row": "2"
  }
}

RESPONSE:
{
  "id": "ABC123",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+5531999887766"
}
```

### PASSO 5: Criar Deals

**Para cada contato com contactId:**
```javascript
REQUEST: POST /deals/
{
  "pipelineId": "xRqrV2LoT6E8iwLW4Syi",
  "pipelineStageId": "d3c25373-2b78-43d4-af3a-b4781f15874e",
  "locationId": "XXXXXX",
  "contactId": "ABC123",
  "name": "João Silva - Mentoria 50k",
  "source": "WhatsApp Prospector",
  "status": "open",
  "monetaryValue": 0
}

RESPONSE:
{
  "id": "DEAL123",
  "contactId": "ABC123",
  "pipelineId": "xRqrV2LoT6E8iwLW4Syi",
  "stage": "Para prospectar"
}
```

**Algoritmo:**
```javascript
for (const contact of contacts) {

  if (!contact.ghl_contact_id) {
    console.warn(`⚠️ Skipping deal for ${contact.sheets_name} (no contactId)`);
    continue;
  }

  const deal = await ghl.createDeal({
    pipelineId: GHL_PIPELINE_ID,
    pipelineStageId: GHL_PIPELINE_STAGE_ID,
    locationId: GHL_LOCATION_ID,
    contactId: contact.ghl_contact_id,
    name: `${contact.sheets_name} - ${contact.sheets_group}`,
    source: 'WhatsApp Prospector',
    status: 'open',
    monetaryValue: 0
  });

  contact.ghl_deal_id = deal.id;
  contact.ghl_link = `https://app.highlevel.com/contacts/${contact.ghl_contact_id}`;
  console.log(`✅ Created deal ${deal.id} for ${contact.sheets_name}`);
}
```

### PASSO 6: Atualizar Sheets com Links GHL

**Para cada contato com ghl_contact_id + ghl_link:**
```javascript
// Atualizar Coluna I (Link GHL) e Coluna J (GHL Contact ID)

UPDATE Sheets[row_id] {
  I: ghl_link,           // https://app.highlevel.com/contacts/ABC123
  J: ghl_contact_id      // ABC123
}
```

**Algoritmo:**
```javascript
for (const contact of contacts) {

  if (!contact.ghl_contact_id) {
    console.warn(`⚠️ Skipping sheet update for ${contact.sheets_name}`);
    continue;
  }

  await sheets.updateCells({
    spreadsheet_id: SHEETS_ID,
    range: `${contact.sheets_tab}!I${contact.row_id}:J${contact.row_id}`,
    values: [
      [contact.ghl_link, contact.ghl_contact_id]
    ]
  });

  console.log(`✅ Updated Sheets row ${contact.row_id} with GHL links`);
}
```

### PASSO 7: ❌ NÃO FAZER

```javascript
// ❌ NUNCA fazer isto:

// ❌ Enviar mensagens via GHL
await ghl.sendMessage({
  contactId: contact.ghl_contact_id,
  message: contact.sheets_message  // ← NÃO FAÇA!
});

// ❌ Chamar API de mensagens
POST /messages/ { ... }  // ← NÃO FAÇA!

// ❌ Tentar integração WhatsApp do GHL
await ghl.whatsapp.send(...);  // ← NÃO FAÇA!

Por quê?
  1. Você já enviou manualmente em Phase 8
  2. GHL não deixa enviar mensagem dessa forma
  3. Coluna H (Status Envio) é a fonte de verdade
  4. Sheets é o sistema primário
```

---

## Rate Limiting

```javascript
// GHL API tem limite: ~600ms entre requests

const RATE_LIMIT_MS = 600;
let last_request_time = 0;

for (const contact of contacts) {

  const elapsed = Date.now() - last_request_time;
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed);
  }

  // Fazer request (contact lookup, create, etc)
  last_request_time = Date.now();
}
```

---

## ✅ Quality Gate QG-009: GHL Sync

**Blocking Checks (precisam passar):**
1. ✅ Todos os contatos foram criados/atualizados?
2. ✅ Todos os deals foram criados?
3. ✅ Tags foram aplicadas corretamente?
4. ✅ Rate limiting foi respeitado?
5. ✅ Colunas I+J foram atualizadas no Sheets?
6. ✅ ❌ Nenhuma mensagem foi enviada?

**Warning Checks:**
- ⚠️ Alguns contatos falharam (retry 3x)?
- ⚠️ Deduplicação funcionando?
- ⚠️ Links GHL válidos?

**Se falhar (algum check):**
```
Log erro com contexto
Continuar com próximos contatos (não haltar)
Atualizar Coluna H com status "⚠️ Erro" (opcional)
```

---

## 🔄 Error Handling

### Erro: Contact Lookup falha
```
Action: Retry 3x com backoff
  1º: 2 segundos
  2º: 5 segundos
  3º: 10 segundos

Se falhar 3x:
  - Log: "Contact lookup failed for {phone}"
  - Ação: Continuar com próximo
  - Status: "⚠️ Erro de API"
```

### Erro: Create Contact falha
```
Action: Log detalhado
  - Phone: +55...
  - Erro: "Invalid location ID"
  - Status: Skip, não criar deal

Próximo contato continua normal
```

### Erro: Google Sheets API falha
```
Action: Retry 3x com backoff
Se falhar 3x: Log e continue (Sheets é read-only nesta fase)
```

### Erro: Endpoint /deals/ vs /opportunities/
```
Algoritmo de fallback:

  1. Tentar POST /deals/
     └─ Se 200-299: Usar /deals/
     └─ Se 4xx/5xx: Goto 2

  2. Tentar POST /opportunities/
     └─ Se 200-299: Usar /opportunities/
     └─ Se 4xx/5xx: Log "No endpoint works"

  3. Log erro, continuar com próximos (não haltar)
```

---

## 📝 Config

```javascript
module.exports = {
  phase: 9,
  name: 'GHL Sync v5.0',
  type: 'optional',
  blocking: false,

  ghl: {
    location_id: process.env.GHL_LOCATION_ID,
    pipeline_id: 'xRqrV2LoT6E8iwLW4Syi',
    pipeline_stage_id: 'd3c25373-2b78-43d4-af3a-b4781f15874e',
    rate_limit_ms: 600,
    max_retries: 3,
    retry_delay_ms: [2000, 5000, 10000],

    // Endpoint fallback (importante!)
    endpoints: {
      create_deal: ['/deals/', '/opportunities/']  // Tenta /deals/ primeiro
    }
  },

  sheets: {
    spreadsheet_id: '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI',
    columns_to_update: ['I', 'J']  // Link GHL, GHL Contact ID
  },

  defaults: {
    link_ghl_prefix: 'https://app.highlevel.com/contacts/',
    source: 'WhatsApp Group Prospector'
  }
}
```

---

## 📞 Dependências

**Entrada:**
- Phase 8 Output (Google Sheets Populado)
- GHL API credentials (location_id, API key)
- Google Sheets API (MCP)

**Saída:**
- GHL Contatos + Deals
- Sheets Atualizado (Colunas I+J)

**Próxima Fase:**
- Nenhuma (final do pipeline)

---

## 🚀 Resumo

| Aspecto | Detalhe |
|---------|---------|
| **Função** | Sincronizar Sheets com GHL CRM |
| **Tipo** | Opcional (não bloqueia) |
| **Entrada** | Google Sheets (Phase 8) |
| **Saída** | GHL + Sheets atualizado |
| **Envio** | ❌ Não envia mensagem (você enviou em Phase 8) |
| **Automático** | Criar contatos, deals, tags, links |
| **Manual** | Nada (tudo é automático) |
| **Próximo** | Nenhum (final) |
| **Resultado** | GHL + Sheets sincronizados |

---

**Versão:** v5.0 (Sheets-First, sem envio de mensagens)
**Data:** 2026-03-12
**Executor:** @dev (Atlas)
**Approval:** @qa (quality gate)
**Architecture:** Google Sheets = Source of Truth | GHL = Secondary CRM
