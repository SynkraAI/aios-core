# Task: Fetch Group via Evolution API (Phase 1a)

## Overview

Buscar dados de um grupo de WhatsApp diretamente via Evolution API,
usando a instancia reader (fosc-personal). Alternativa ao parse de ZIP (Phase 1b).

## Pre-requisitos

1. Instancia reader (`fosc-personal`) conectada na Evolution API
2. Numero pessoal vinculado ao grupo alvo
3. Variaveis de ambiente configuradas:
   - `EVOLUTION_API_URL` (base URL do servidor)
   - `EVOLUTION_API_KEY` (API key)

## Inputs

| Input | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| group_jid | string | Sim* | JID do grupo (e.g. `120363001@g.us`). Se omitido, listar grupos disponiveis. |

## Steps

### Step 1: Verificar conexao
- Checar `getConnectionState()` da instancia reader
- Se nao conectada: HALT com instrucoes de reconexao

### Step 2: Listar ou selecionar grupo
- Se `group_jid` fornecido: pular para Step 3
- Se nao: `listAvailableGroups()` e apresentar lista ao usuario

### Step 3: Buscar participantes
- `getParticipantsWithPhones(groupJid)`
- Telefones vem 100% resolvidos do JID (formato E.164)
- Nao requer Phase 4 (resolve phones)

### Step 4: Buscar mensagens
- `findMessages(groupJid)`
- ATENCAO: so retorna mensagens armazenadas APOS conexao da instancia
- Para historico completo, usar ZIP (Phase 1b)

### Step 5: Montar ParsedExport
- Converter dados da API para formato ParsedExport
- Output identico ao parser ZIP
- Campo `_meta.source = 'evolution_api'` para rastreabilidade

## Output

Formato `ParsedExport` (compativel com Phase 2+):

```json
{
  "group_name": "Mentoria 50K",
  "date_range": { "start": "2026-03-13", "end": "2026-03-13" },
  "total_messages": 150,
  "total_contacts": 45,
  "contacts": [{
    "name": "Joao Silva",
    "phone": "+5531999887766",
    "message_count": 12,
    "messages": [{ "timestamp": "...", "content": "..." }],
    "name_source": "evolution_api",
    "name_confidence": "high"
  }],
  "_meta": {
    "source": "evolution_api",
    "instance": "fosc-personal",
    "fetched_at": "2026-03-13T10:00:00Z",
    "phones_resolved": true
  }
}
```

## Veto Conditions

| Condicao | Severidade | Acao |
|----------|-----------|------|
| Instancia reader nao conectada | BLOCKING | HALT |
| Grupo nao encontrado | BLOCKING | HALT |
| 0 participantes extraidos | BLOCKING | HALT |
| 0 mensagens (instancia recente) | WARNING | LOG_AND_CONTINUE |

## Vantagens vs ZIP

| Aspecto | API (Phase 1a) | ZIP (Phase 1b) |
|---------|---------------|----------------|
| Telefones | 100% resolvidos (JID) | Parcial (precisa Phase 4) |
| Automacao | Total | Manual (exportar ZIP) |
| Historico | Apos conexao apenas | Completo |
| Phase 4 | SKIP | Necessaria |

## Implementation

- Script: `lib/fetch-group-via-api.js`
- Tool: `tools/evolution-whatsapp-api` (GroupsMixin)
- Config: `config.yaml` > `settings.evolution.instances.reader`
