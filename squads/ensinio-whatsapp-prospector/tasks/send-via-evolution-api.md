# Phase 10: Send via Evolution API

**Phase:** 10 | **Agent:** Atlas (prospector-chief) | **Model:** sonnet
**Type:** INTERATIVO (NUNCA envia sem confirmacao)
**Quality Gate:** QG-010 (Send Validation)
**Tool:** `tools/evolution-whatsapp-api/`

---

## REGRA ABSOLUTA

**NUNCA enviar mensagem sem confirmacao explicita do usuario.**

Isso nao e sugestao, e bloqueador. Se o usuario nao confirmou, a fase NAO executa.
Pense nisso como um botao de lancamento de foguete: duas chaves precisam ser giradas ao mesmo tempo.

---

## Pre-requisitos

1. Phase 9 (Populate Sheets) COMPLETA com QG-008 PASS
2. Evolution API configurada no `.env`:
   ```
   EVOLUTION_API_URL=https://your-evolution-api.example.com
   EVOLUTION_API_KEY=your-api-key
   EVOLUTION_INSTANCE=your-instance-name
   ```
3. Instancia Evolution conectada (connection state = open)

---

## Fluxo

### Step 1: Verificar Conexao

```javascript
const { EvolutionClient } = require('../../tools/evolution-whatsapp-api');

const client = new EvolutionClient({
  baseUrl: process.env.EVOLUTION_API_URL,
  apiKey: process.env.EVOLUTION_API_KEY,
  instance: process.env.EVOLUTION_INSTANCE,
});

const state = await client.getConnectionState();
// Se state !== 'open' → HALT e avisar usuario
```

**Se desconectado:** "Evolution API nao esta conectada. Verifique a instancia e tente novamente."

### Step 2: Ler Google Sheets

1. Conectar ao Sheets via MCP Google Workspace
2. Ler spreadsheet: `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`
3. Filtrar pela aba do grupo (ou grupo especifico se batch)
4. Selecionar APENAS linhas com Coluna H = "Nao enviado"
5. Extrair: Nome (A), Telefone (B), Mensagem (F)

### Step 3: Apresentar Resumo e PERGUNTAR

```
Encontrei X contatos com status "Nao enviado" no grupo "{group_name}".

Preview (primeiras 3 mensagens):

1. Joao (+5531999887766):
   "Oi Joao! O Fosc ta no grupo aqui tambem..."

2. Maria (+5521988776655):
   "Oi Maria! Aqui e o Antonio, da Ensinio..."

3. Carlos (+5511977665544):
   "Carlos, aqui e o Antonio. Vi que voce..."

Deseja enviar as X mensagens? [S/N]
```

**Se N:** "Envio cancelado. Dados continuam no Sheets para envio manual."
**Se S:** Prosseguir para Step 4.

### Step 4: Confirmar Pacing

```
Configuracao de envio:
- Intervalo entre mensagens: 3 segundos (minimo seguro)
- Tempo estimado total: ~X minutos
- Se erro em mais de 20% dos envios, vou pausar e perguntar.

Confirma? [S/N]
```

### Step 5: Batch Send

```javascript
const contacts = sheetsData.map(row => ({
  name: row.A,
  phone: row.B.replace('+', ''), // Evolution usa sem +
  message: row.F,
}));

const results = await client.sendBatch(
  contacts,
  (contact) => ({ text: contact.message }),
  {
    intervalMs: 3000,
    onProgress: (result) => {
      // Atualizar progresso em tempo real
      console.log(`[${result.index}/${contacts.length}] ${result.status}`);
    },
  },
);
```

**Durante o envio, reportar progresso:**
```
Enviando... [15/47] - 32% completo
Ultimo: Joao (+5531...) - Enviado
```

### Step 6: Tratar Erros

Para cada envio:
- **Sucesso:** Marcar na lista como enviado
- **Erro 401:** PARAR TUDO. Token invalido.
- **Erro 404:** Instancia nao encontrada. PARAR.
- **Erro 429:** Rate limit. Aguardar e retry (auto-retry do client).
- **Erro 5xx:** Retry ate 3x (auto-retry do client).
- **Timeout:** Retry ate 3x.

**Regra de pausa:** Se erro > 20% do total enviado ate agora → PAUSAR e perguntar:
```
Atencao: taxa de erro alta (X de Y falharam).
Erros comuns: [tipo mais frequente]

Opcoes:
1. Continuar enviando (ignorar erros)
2. Pausar e investigar
3. Cancelar envio restante

Escolha [1-3]:
```

### Step 7: Atualizar Google Sheets

Para cada contato processado, atualizar Coluna H:
- Sucesso → "Enviado"
- Erro → "Erro"

```
Atualizar via MCP Google Workspace:
- Linha do contato → Coluna H = novo status
```

### Step 8: Relatorio Final

```
Envio concluido para grupo "{group_name}"!

Resultados:
- Total: 47 contatos
- Enviados: 43 (91%)
- Erros: 4 (9%)
  - Rate limit (retry ok): 2
  - Numero invalido: 1
  - Timeout: 1

Erros detalhados:
- Maria (+5521...): Numero invalido (nao esta no WhatsApp)
- Pedro (+5511...): Timeout apos 3 tentativas

Planilha atualizada com status de cada envio.
```

---

## Quality Gate QG-010: Send Validation

### Blocking Checks
1. Usuario confirmou envio explicitamente?
2. Evolution API conectada antes do envio?
3. Telefones em formato correto (sem +, apenas digitos)?
4. Mensagens nao vazias?

### Warning Checks
1. Taxa de erro < 20%?
2. Todos os status atualizados no Sheets?
3. Nenhum envio duplicado (mesmo telefone 2x)?

### Pass Criteria
- Todos blocking checks = PASS
- Taxa de sucesso >= 80%
- Sheets atualizado com status correto

---

## Formato do Telefone para Evolution API

**CRITICO:** Evolution API usa telefone SEM o `+`:
- Sheets: `+5531999887766`
- Evolution: `5531999887766`

Conversao:
```javascript
const evolutionPhone = sheetsPhone.replace('+', '');
```

---

## Integracao com Batch Pipeline

No batch pipeline, Phase 10 e executada POR GRUPO:

```
Para cada grupo processado:
  1. "Deseja enviar mensagens do grupo {nome}? [S/N]"
  2. Se sim → envia apenas daquele grupo
  3. Se nao → pula para proximo grupo

Ou o usuario pode pedir:
  "Envie todas as mensagens do grupo Mentoria 50K"
  → Filtra apenas aba "Mentoria 50K" no Sheets
  → Executa Phase 10 so para esse grupo
```

---

## Guardrails

| Guardrail | Valor | Motivo |
|-----------|-------|--------|
| intervalMs | >= 3000 | Rate limit informal do WhatsApp |
| maxRetries | 3 | Evitar loop infinito |
| errorThreshold | 20% | Pausa automatica se muitos erros |
| confirmBeforeSend | ALWAYS | NUNCA enviar sem confirmacao |
| previewCount | 3 | Mostrar 3 msgs antes de confirmar |
| duplicateCheck | true | Nunca enviar 2x pro mesmo numero |

---

## Fallback: Envio Manual

Se Evolution API nao estiver disponivel ou o usuario preferir:
1. Dados ja estao no Google Sheets (Phase 9)
2. Coluna G tem links WhatsApp pre-encoded
3. Usuario clica no link → WhatsApp Web abre com mensagem pre-preenchida
4. Usuario envia manualmente
5. Marca Coluna H como "Enviado"

**A Phase 10 e um acelerador, nao um requisito.**
