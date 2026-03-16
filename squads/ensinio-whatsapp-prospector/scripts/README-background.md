# Envio em Background — Guia Completo

Script para enviar mensagens via Evolution API com processamento no servidor. **Você pode fechar o Mac depois de iniciar.**

---

## 🚀 **Como Usar**

### **Método 1: Direto (Recomendado)**

```bash
cd /Users/luizfosc/aios-core/squads/ensinio-whatsapp-prospector
node scripts/send-background.js
```

**Workflow:**
1. Script pergunta grupo e modo
2. Envia TODAS as mensagens para Evolution API de uma vez
3. Evolution API processa com delays configurados
4. Script termina (pode fechar terminal)
5. Evolution continua enviando no servidor

**Tempo:** ~2-3 minutos para enviar requests (36 mensagens)
**Processamento:** Evolution processa em background (10-15 min com Modo NATURAL)

---

### **Método 2: Com PM2 (Opcional)**

Se quiser rodar como daemon (logs persistentes):

```bash
# Instalar PM2 (uma vez)
npm install -g pm2

# Iniciar com PM2
cd /Users/luizfosc/aios-core/squads/ensinio-whatsapp-prospector
pm2 start scripts/send-background.js --name="ensinio-send"

# Ver logs
pm2 logs ensinio-send

# Parar
pm2 stop ensinio-send

# Remover
pm2 delete ensinio-send
```

---

## ⏱️ **Modos de Espaçamento**

| Modo | Nome | Entre Partes | Entre Mensagens | Tempo Total (36 msgs) |
|------|------|--------------|-----------------|----------------------|
| **1** | NATURAL | 2-4s | 5-10s | ~10-15 min |
| **2** | RÁPIDO | 1-2s | 3-5s | ~5-7 min |
| **3** | CONSERVADOR | 3-6s | 10-20s | ~15-25 min |
| **4** | SUPER CONSERVADOR | 5-8s | 30-60s | ~30-40 min |

---

## 🌐 **Monitoramento**

### **Dashboard Evolution API:**
```
http://178.156.242.82:8080/manager/
```

**O que ver:**
- ✅ Status da instância `ensinio3`
- ✅ Mensagens sendo enviadas em tempo real
- ✅ Queue de pendentes
- ✅ Histórico completo

---

## 🔧 **Diferença vs send-interactive.js**

| Feature | send-interactive.js | send-background.js |
|---------|--------------------|--------------------|
| **Precisa terminal aberto** | ✅ SIM (bloqueante) | ❌ NÃO (envia e sai) |
| **Pode fechar Mac** | ❌ NÃO | ✅ SIM |
| **Processamento** | Local (Node.js) | Remoto (Evolution API) |
| **Monitoramento** | Terminal | Dashboard |
| **Retomável** | ❌ NÃO | ✅ SIM (via dashboard) |

---

## 📊 **Output Esperado**

```
╔════════════════════════════════════════════════════════════╗
║  Ensinio Prospector — Envio em Background                 ║
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
   ...

🎯 Qual modo? (1-4): 1
✅ Modo selecionado: NATURAL

╔════════════════════════════════════════════════════════════╗
║  RESUMO DO ENVIO EM BACKGROUND                             ║
╠════════════════════════════════════════════════════════════╣
║  Grupo: Mentoria Renan                                     ║
║  Contatos: 36                                              ║
║  Modo: NATURAL                                             ║
╚════════════════════════════════════════════════════════════╝

🚀 Confirmar envio? (s/n): s

🚀 Enviando em background para Evolution API (Modo 1: NATURAL)
   Entre partes: 2-4s
   Entre mensagens: 5-10s

[1/36] 📤 Enviando para Emerson - Pérola Tour (+5544999001267)...
   ✅ [1/5] Enfileirado: "Fala Emerson! Tudo certo?"
   ✅ [2/5] Enfileirado: "Aqui é o Antonio..."
   ...

⏳ Aguardando confirmação de todos os envios...

✅ Todas mensagens enviadas para Evolution API!
   Total enfileirado: 36
   Tempo estimado de processamento: ~12 minutos

💡 IMPORTANTE:
   - Evolution API está processando as mensagens com delays configurados
   - Você pode FECHAR este terminal agora
   - Monitore progresso no dashboard: http://178.156.242.82:8080/manager/
```

---

## ⚠️ **Troubleshooting**

**Erro: "Evolution API error: 401"**
- API Key inválida no `.env`
- Verifique: `EVOLUTION_API_KEY=evo-fosc-2026-xK9mP`

**Erro: "Evolution API error: 404"**
- Instância não existe
- Verifique: `EVOLUTION_INSTANCE_SENDER=ensinio3`

**Mensagens não chegam:**
- Verifique status da instância no dashboard
- QR Code pode ter expirado (reconectar)

**Quero cancelar envio:**
- Se ainda não confirmou (s/n), digite `n`
- Se já confirmou, acesse dashboard e desconecte instância

---

## 🎯 **Próximos Passos**

Após envio completo:
1. ✅ Verificar dashboard (todas mensagens enviadas?)
2. ✅ Atualizar Google Sheets (Coluna H = "✅ Enviado")
3. ✅ Rodar GHL sync (opcional)
4. ✅ Processar próximo grupo

---

## 📁 **Arquivos Relacionados**

- `scripts/send-background.js` — Este script (background)
- `scripts/send-interactive.js` — Versão interativa (terminal aberto)
- `lib/message-splitter.js` — Lógica de split
- `data/outputs/mentoria-50k/outreach-sheets-final.tsv` — Dados

---

**Fontes:**
- [Evolution API Documentation](https://doc.evolution-api.com/)
- [Send List Endpoint](https://doc.evolution-api.com/v1/api-reference/message-controller/send-list)
