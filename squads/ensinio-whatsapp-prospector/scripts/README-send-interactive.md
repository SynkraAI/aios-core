# Send Interactive — Guia de Uso

Script interativo para envio de mensagens via Evolution API com escolha de grupo e modo de espaçamento.

---

## 🚀 Como Usar

```bash
cd /Users/luizfosc/aios-core/squads/ensinio-whatsapp-prospector
node scripts/send-interactive.js
```

---

## 📋 Workflow

1. **Lê TSV** — `data/outputs/mentoria-50k/outreach-sheets-final.tsv`
2. **Detecta grupos** — coluna 3 (Grupo)
3. **Pergunta:** Qual grupo enviar? (opções numeradas)
4. **Pergunta:** Qual modo de espaçamento? (1-4)
5. **Filtra:** Contatos do grupo + status "Não enviado"
6. **Confirma:** "X contatos, continuar?"
7. **Envia** com delays configurados
8. **Resumo** de sucesso/falhas

---

## ⏱️ Modos de Espaçamento

| Modo | Nome | Entre Partes | Entre Mensagens | Uso |
|------|------|--------------|-----------------|-----|
| **1** | NATURAL | 2-4s | 5-10s | Conversação normal (recomendado) |
| **2** | RÁPIDO | 1-2s | 3-5s | Quando tem muita gente pra enviar |
| **3** | CONSERVADOR | 3-6s | 10-20s | Evitar spam, parecer mais humano |
| **4** | SUPER CONSERVADOR | 5-8s | 30-60s | Anti-ban (1 msg por minuto) |

**Exemplo (Modo 1 - NATURAL):**
```
[João - 1/3] Oi João! Tudo bem?
  ⏱️ 2-4s (typing)
[João - 2/3] O Fosc tá no grupo...
  ⏱️ 2-4s (typing)
[João - 3/3] Posso te mostrar?
  ⏱️ 5-10s (próxima pessoa)
[Maria - 1/2] Oi Maria...
```

---

## 📊 Output Esperado

```
╔════════════════════════════════════════════════════════════╗
║  Ensinio WhatsApp Prospector — Envio Interativo           ║
╚════════════════════════════════════════════════════════════╝

📂 Lendo TSV: data/outputs/mentoria-50k/outreach-sheets-final.tsv
   ✅ 76 contatos válidos encontrados

📊 Grupos disponíveis (1):

   1. Mentoria Renan (36 contatos não enviados)

🎯 Qual grupo você quer enviar? (número): 1

✅ Grupo selecionado: Mentoria Renan

📋 Contatos a enviar: 36

⏱️  Modos de espaçamento:

   1. NATURAL — Conversação normal (recomendado)
      Entre partes: 2-4s | Entre mensagens: 5-10s
   2. RÁPIDO — Quando tem muita gente pra enviar
      Entre partes: 1-2s | Entre mensagens: 3-5s
   3. CONSERVADOR — Evitar spam, parecer mais humano
      Entre partes: 3-6s | Entre mensagens: 10-20s
   4. SUPER CONSERVADOR — Anti-ban (1 msg por minuto)
      Entre partes: 5-8s | Entre mensagens: 30-60s

🎯 Qual modo você quer usar? (1-4): 1

✅ Modo selecionado: NATURAL

╔════════════════════════════════════════════════════════════╗
║  RESUMO DO ENVIO                                           ║
╠════════════════════════════════════════════════════════════╣
║  Grupo: Mentoria Renan                                     ║
║  Contatos: 36                                              ║
║  Modo: NATURAL                                             ║
╚════════════════════════════════════════════════════════════╝

🚀 Confirmar envio? (s/n): s

🔌 Conectando à Evolution API...
✅ Evolution API conectada!

🚀 Iniciando envio (Modo 1: NATURAL)
   Entre partes: 2-4s
   Entre mensagens: 5-10s

[1/36] 📤 Enviando para Emerson - Pérola Tour (+5544999001267)...
   [1/5] Enviando parte: "Fala Emerson! Tudo certo?"
   ⏱️ 2.3s (typing)
   [2/5] Enviando parte: "Aqui é o Antonio..."
   ⏱️ 3.1s (typing)
   ...
   ✅ Enviado com sucesso (3% completo)
   ⏱️ Aguardando 7.2s até próxima mensagem...

[2/36] 📤 Enviando para Tati Ambrosio (+5549988457213)...
   ...
```

---

## ⚠️ Requisitos

- ✅ Evolution API conectada (`.env` configurado)
- ✅ TSV com dados (Coluna 3 = Grupo, Coluna 8 = Status Envio)
- ✅ `lib/message-splitter.js` implementado

---

## 🔧 Troubleshooting

**Erro: "TSV não encontrado"**
- Verifique se o arquivo existe: `data/outputs/mentoria-50k/outreach-sheets-final.tsv`
- Ou ajuste o path no script (linha 147)

**Erro: "Evolution API não está conectada"**
- Rode: `node scripts/check-evolution-connection.js`
- Conecte a instância manualmente se necessário

**Erro: "Nenhum grupo encontrado"**
- Verifique se a coluna 3 do TSV tem dados (nome do grupo)

---

## 📁 Arquivos Relacionados

- `scripts/send-interactive.js` — Este script
- `lib/message-splitter.js` — Lógica de split de mensagens
- `scripts/check-evolution-connection.js` — Validar conexão Evolution API
- `data/outputs/mentoria-50k/outreach-sheets-final.tsv` — Dados de entrada

---

## 🎯 Próximos Passos

Após envio completo:
1. Atualizar Google Sheets (Coluna H = "✅ Enviado")
2. Rodar GHL sync (opcional) — `*sync-ghl`
3. Processar próximo grupo (rodar script novamente)
