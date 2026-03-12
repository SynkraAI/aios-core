# Task: Populate Google Sheets v5.0 (Phase 8 - Bloqueador)

**Status:** Ready for Implementation
**Agent:** Atlas (prospector-chief)
**Model:** sonnet
**Executor Role:** Data Formatter + Sheet API Client

---

## Objetivo

Transformar dados processados (prospects + análises + mensagens) em Google Sheets estruturado.

**Google Sheets = Fonte de Verdade** do Ensinio Prospector v5.0

---

## Entrada

**Dados de entrada (Phase 7 - Validate Outreach):**
```json
{
  "group_name": "Mentoria 50k",
  "contacts": [
    {
      "id": "c_001",
      "name": "João Silva",
      "phone": "+5531999887766",
      "analysis": {
        "score": 7.2,
        "pillar": "Marketing & Growth",
        "prospect_type": "Content Creator",
        "temperature": 7
      },
      "outreach": {
        "message": "Opa João!\n\nAchei demais seu podcast!...",
        "status": "approved"
      }
    }
  ]
}
```

---

## Processamento

### PASSO 1: Validar Entrada
```
✅ Todos os campos obrigatórios presentes?
✅ Contatos têm phone + message + score?
✅ Mensagens têm status "approved"?
✅ Colunas A-J podem ser preenchidas?
```

### PASSO 2: Formatar Dados (10 Colunas)

**Coluna A: Nome**
```
Input: contact.name
Transform: Apenas primeiro nome
Example: "João Silva" → "João"
Fallback: Se vazio, usar "Contato"
```

**Coluna B: Telefone**
```
Input: contact.phone
Format: E.164 (+55XXXXXXXXXXX)
Validation: Regex /^\+55\d{10,11}$/
Fallback: Se vazio, marcar com ⚠️ PHONE_MISSING
```

**Coluna C: Grupo WhatsApp**
```
Input: group_name
Example: "Mentoria 50k"
Format: Como está
```

**Coluna D: Projeto/Nicho**
```
Input: analysis.prospect_type
Example: "Content Creator", "Agência de Ads", "Consultoria"
Format: Como está
```

**Coluna E: Explicação Projeto**
```
Input: Extrair de contact.messages (últimas 2-3 mensagens)
Transform: Resumir em 1-2 linhas (máx 150 caracteres)
Example: "Monetização de podcast com funis de vendas"
Fallback: analysis.prospect_type
```

**Coluna F: Mensagem WhatsApp**
```
Input: outreach.message (já validada em Phase 7)
Format: Texto completo, preservar quebras de linha
Length: 150-300 caracteres
Important: Preservar exatamente como gerado
```

**Coluna G: Link WhatsApp** ⭐ CRÍTICA
```
Input: contact.phone + outreach.message
Format: https://wa.me/{PHONE}?text={ENCODED_MESSAGE}

Algoritmo:
  1. Pegar coluna F (message)
  2. URL-encode (encodeURIComponent)
  3. Construir URL: https://wa.me/{phone}?text={encoded}
  4. Pré-preencher com message (importante!)

Example:
  Phone: +5531999887766
  Message: "Opa João!\n\nAchei demais seu podcast!"
  Encoded: "Opa%20Jo%C3%A3o%21%0A%0AAchei%20demais%20seu%20podcast%21"
  URL: https://wa.me/+5531999887766?text=Opa%20Jo%C3%A3o%21%0A%0AAchei%20demais%20seu%20podcast%21

Action: Quando usuário clica → Abre WhatsApp Web com message pré-preenchida
```

**Coluna H: Status Envio** 📊 RASTREAMENTO
```
Valores possíveis:
  ⬜ "Não enviado"    ← Padrão (todo contato começa aqui)
  ✅ "Enviado"        ← Usuário marca após enviar
  ⚠️ "Erro"           ← Se WhatsApp falhar
  📋 "Agendado"       ← Futuro (para bot async)

Default: "⬜ Não enviado"
Editável: SIM (usuário preenche manualmente)
Important: Deixar EDITÁVEL (não bloquear)
```

**Coluna I: Link GHL**
```
Status: VAZIO por enquanto
Preenchimento: Phase 9 (GHL Sync)
Format: https://app.highlevel.com/contacts/{contact_id}
Default: Célula vazia (não preencher em Phase 8)
```

**Coluna J: GHL Contact ID**
```
Status: VAZIO por enquanto
Preenchimento: Phase 9 (GHL Sync)
Format: String ID (ex: "ABC123XYZ")
Default: Célula vazia (não preencher em Phase 8)
```

### PASSO 3: Ordenar por Temperature (DESC)
```
Score 8-10: Muito Quente (topo)
Score 6-7:  Quente (meio-alto)
Score 4-5:  Morno (meio)
Score 1-3:  Frio (baixo)

Sort by: analysis.temperature DESC
```

### PASSO 4: Criar/Atualizar Sheet
```
Mode: new_tab_per_group (padrão) ou single_tab

Se new_tab_per_group:
  ├─ Aba "Summary" (estatísticas)
  └─ Aba "{group_name}" (contatos)

Se single_tab:
  └─ Aba "All Prospects" (todos)

Headers (Linha 1):
  A: Nome
  B: Telefone
  C: Grupo WhatsApp
  D: Projeto
  E: Explicação Projeto
  F: Mensagem
  G: Link WhatsApp
  H: Status Envio
  I: Link GHL
  J: GHL Contact ID
```

### PASSO 5: Inserir Dados
```
Para cada contato:
  INSERT ROW {
    A: nome_primeiro,
    B: telefone_e164,
    C: grupo,
    D: tipo_projeto,
    E: explicacao,
    F: mensagem,
    G: link_whatsapp,
    H: "⬜ Não enviado",
    I: "",
    J: ""
  }
```

### PASSO 6: Criar Aba Summary (se new_tab_per_group)
```
Row 1: Headers
  A: Métrica
  B: Valor

Data:
  Row 2: "Grupo"             │ "{group_name}"
  Row 3: "Total Contatos"    │ {count}
  Row 4: "Com Telefone"      │ {count} ({percent}%)
  Row 5: "Red Flags Bloqueados" │ {count}
  Row 6: "Qualificados"      │ {count} ({percent}%)
  Row 7: "Mensagens Aprovadas"  │ {count} ({percent}%)
  Row 8: "Ordenação"         │ "Temperature DESC"
  Row 9: "Data Processamento"   │ "{now}"
```

---

## Saída

**Estrutura Google Sheets Final:**

```
Spreadsheet ID: 124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI

├── Aba "Summary" (opcional)
│   ├─ Métrica │ Valor
│   ├─ Grupo │ "Mentoria 50k"
│   ├─ Total │ 150
│   └─ Qualificados │ 142 (95%)
│
└── Aba "Mentoria 50k" (ou por grupo)
    ├─ Linha 1: Headers (A-J)
    ├─ Linha 2: João Silva │ +5531... │ Mentoria 50k │ Podcast │ ... │ Opa João!... │ https://wa.me/... │ ⬜ Não enviado │ [vazio] │ [vazio]
    ├─ Linha 3: Maria Santos │ +5585... │ ...
    └─ ... (ordenado por temperature DESC)
```

---

## ✅ Quality Gate QG-008: Sheet Population

**Blocking Checks (todos precisam passar):**
1. ✅ Sheets criado/atualizado?
2. ✅ Headers corretos em Linha 1?
3. ✅ Todos os contatos inseridos?
4. ✅ Número de linhas = contatos aprovados?
5. ✅ URLs WhatsApp funcionam (format correto)?
6. ✅ Colunas H vazias ou "⬜ Não enviado"?
7. ✅ Colunas I+J vazias (para Phase 9)?
8. ✅ Ordenação por temperature correta?

**Warning Checks:**
- ⚠️ Telefones faltando em alguns contatos?
- ⚠️ Mensagens com erros ortográficos?
- ⚠️ Links WhatsApp mal formatados?

**Se falhar:** Halt com erro claro, não continua para Phase 9

---

## 🔄 Fluxo do Usuário (Após Phase 8)

```
1. ✅ Recebe notificação: "Dados prontos no Google Sheets!"
2. ✅ Abre Sheets
3. ✅ Revisa contatos (status = "⬜ Não enviado")
4. ✅ Para cada linha:
   a. Clica Coluna G (Link WhatsApp)
   b. Abre WhatsApp Web
   c. Copia Coluna F (Mensagem)
   d. Cola na conversa
   e. Envia
   f. Volta pro Sheets
   g. Marca Coluna H: "✅ Enviado"
5. ✅ Quando terminar (ou em paralelo):
   - Executa Phase 9 (GHL Sync)
   - Colunas I+J são preenchidas automaticamente
```

---

## ⚠️ Error Handling

### Erro: Sheets não existe
```
Action: Criar novo Sheets
  1. Criar spreadsheet
  2. Adicionar abas (Summary + Grupo)
  3. Inserir headers
  4. Inserir dados
```

### Erro: Phone formato inválido
```
Action: Marcar com ⚠️ e incluir na aba
  Coluna B: "⚠️ PHONE_INVALID"
  Coluna H: "⚠️ Erro"
  Note: Usuário pode editar e corrigir depois
```

### Erro: Mensagem truncada/inválida
```
Action: Usar fallback padrão
  F: "Opa {nome}! Gostaria de conversar sobre sua empresa?"
  Log: Registrar qual contato teve fallback
```

### Erro: Google Sheets API falha
```
Action: Retry 3x com backoff
  1º retry: 2 segundos
  2º retry: 5 segundos
  3º retry: 10 segundos
Se falhar 3x: Halt com erro, não continua
```

---

## 📝 Config

```javascript
module.exports = {
  phase: 8,
  name: 'Populate Google Sheets v5.0',
  type: 'blocker',
  blocking: true,

  sheets: {
    spreadsheet_id: '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI',
    mode: 'new_tab_per_group', // ou 'single_tab'
    headers: [
      'Nome', 'Telefone', 'Grupo WhatsApp', 'Projeto',
      'Explicação Projeto', 'Mensagem', 'Link WhatsApp',
      'Status Envio', 'Link GHL', 'GHL Contact ID'
    ],
    sort_by: 'temperature_desc',
    create_summary: true,
    max_retries: 3,
    retry_delay_ms: [2000, 5000, 10000]
  },

  defaults: {
    status_envio: '⬜ Não enviado',
    link_ghl: '', // Vazio, preenchido em Phase 9
    ghl_id: ''    // Vazio, preenchido em Phase 9
  }
}
```

---

## 📞 Dependências

**Entrada:**
- Phase 7 Output (Validated Outreach Messages)
- Google Sheets API (MCP disponível)

**Saída:**
- Google Sheets Populado (Source of Truth)

**Próxima Fase:**
- Phase 9: GHL Sync (Opcional)

---

## 🚀 Resumo

| Aspecto | Detalhe |
|---------|---------|
| **Função** | Transformar análise em Sheets operacional |
| **Tipo** | Bloqueador (não pode pular) |
| **Usuário faz** | Clica link → Envia via WhatsApp Web → Marca "Enviado" |
| **Automático** | Formatar dados, criar URLs, ordenar, inserir |
| **Manual** | Envio de mensagem (WhatsApp Web) |
| **Próximo** | Phase 9: GHL Sync (opcional) |
| **Resultado** | Sheets completo, pronto para envio |

---

**Versão:** v5.0 (Sheets-First)
**Data:** 2026-03-12
**Executor:** @dev (Atlas)
**Approval:** @qa (quality gate)
