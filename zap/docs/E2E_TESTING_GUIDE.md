# 🧪 Guia de Teste End-to-End — RedirectFlow Localhost

## Checklist de Pré-requisitos

### 1️⃣ **Redis Rodando** ✅ OBRIGATÓRIO

O sistema usa BullMQ para processar jobs. Sem Redis, as filas não funcionam.

```bash
# Opção A: Docker
docker run -d -p 6379:6379 redis:latest

# Opção B: Instalado localmente
redis-server

# Verificar se está rodando
redis-cli ping
# Resposta: PONG
```

**Arquivo .env necessário:**
```
REDIS_URL=redis://localhost:6379
```

### 2️⃣ **Supabase Local ou Cloud** ✅ OBRIGATÓRIO

O sistema precisa de PostgreSQL com tabelas. Use qualquer uma:

**Opção A: Supabase Cloud (mais fácil)**
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx (para supabaseAdmin)
```

**Opção B: Supabase Local**
```bash
npm install -g supabase
supabase start
# Criar migrations manualmente
```

### 3️⃣ **API e Workers Rodando**

```bash
# Terminal 1: API Server (que recebe webhooks)
cd apps/api
npm run dev
# Output: Zap API running on port 3000

# Terminal 2: Workers (que processam jobs)
cd apps/api
npm run worker:dev
# Output: All Zap workers initialized [message-send, broadcast-proc, trigger-proc, offer-parser, offer-replication]
```

### 4️⃣ **Frontend Rodando** (Opcional para testes, mas recomendado)

```bash
# Terminal 3: Web App
cd apps/web
npm run dev
# Output: ▲ Next.js 14.0 ready
```

---

## 🧪 Teste Step-by-Step

### **Step 1: Criar Tenant + Conexão WhatsApp**

Antes de tudo, você precisa de um tenant e uma conexão WhatsApp.

```bash
# Via API
curl -X POST http://localhost:3000/api/v1/connections \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "display_name": "Meu WhatsApp"
  }'

# Resposta:
# {
#   "id": "conn-uuid-123",
#   "tenant_id": "tenant-uuid",
#   "phone": "5511999999999",
#   "status": "connecting",
#   "created_at": "2026-02-27T..."
# }

# Guarde o: conn-uuid-123 (connection ID)
```

**Ou via UI:** `/dashboard/connections` → Clique "Adicionar Conexão"

### **Step 2: Criar Grupo Monitorado (Grupo de Concorrente)**

Você precisa copiar o JID do grupo de concorrente que quer monitorar.

**Como obter o JID:**
- No WhatsApp, abra o grupo
- Faça screenshot da informação do grupo
- Ou use Evolution API para listar grupos: `GET /api/v1/groups`

```bash
curl -X POST http://localhost:3000/api/v1/monitored-groups \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "conn-uuid-123",
    "group_name": "Concorrentes - Shopee",
    "group_jid": "120363001234567-1234567890@g.us",
    "status": "active"
  }'

# Resposta:
# {
#   "id": "monitored-group-uuid",
#   "group_jid": "120363001234567-1234567890@g.us",
#   "status": "active",
#   "message_count": 0
# }

# Guarde: 120363001234567-1234567890@g.us (group JID)
```

**Ou via UI:** `/dashboard/monitored-groups` → "Adicionar Grupo Monitorado"

### **Step 3: Configurar Credenciais Shopee**

```bash
curl -X POST http://localhost:3000/api/v1/marketplace-credentials/shopee \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "affiliate_id": "seu-affiliate-id-shopee",
    "api_key": "sua-api-key-shopee"
  }'

# Resposta:
# { "success": true, "message": "Credentials saved" }
```

**Ou via UI:** `/dashboard/settings/apis` → Preencha "Shopee" → Clique "Salvar"

### **Step 4: Configurar Grupo de Disparo (Seu Grupo)**

Você precisa de um grupo seu onde as ofertas serão replicadas.

```bash
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "conn-uuid-123",
    "name": "Meus Clientes",
    "wa_group_id": "120363009876543-9876543210@g.us",
    "status": "active"
  }'

# Resposta:
# {
#   "id": "group-uuid-456",
#   "wa_group_id": "120363009876543-9876543210@g.us"
# }

# Guarde: group-uuid-456 (target group ID)
```

### **Step 5: Simular Webhook do Evolution API**

Agora simule uma mensagem chegando no grupo de concorrente.

```bash
curl -X POST http://localhost:3000/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "prod_tenant-uuid_conn-uuid-123",
    "data": {
      "key": {
        "remoteJid": "120363001234567-1234567890@g.us",
        "id": "msg-test-' $(date +%s) '",
        "participant": "5511988888888@s.whatsapp.net",
        "fromMe": false
      },
      "message": {
        "conversation": "🛍️ SHOPEE - Tênis adidas ultraboost R$ 250,00 → R$ 99,90 💰 https://shopee.com.br/p/123456789"
      },
      "messageTimestamp": ' $(date +%s) '
    }
  }'

# Resposta imediata (200 OK):
# { "ok": true }

# Nota: A resposta é imediata porque é fire-and-forget.
# O processamento acontece async nos workers.
```

### **Step 6: Monitorar o Processamento**

```bash
# Terminal: Verificar Redis
redis-cli
> LLEN offer-parser
# 1 (um job na fila)

> LLEN offer-replication
# 0 (nenhum job ainda - será adicionado depois que parser executar)

# Ver conteúdo da fila (para debug)
> LPOP offer-parser
```

**Via logs do Terminal 2 (workers):**
```
[INFO] Processing offer { message_id: 'msg-...', text: '🛍️ SHOPEE...', attempt: 1 }
[INFO] Offer captured { offer_id: 'offer-uuid', marketplace: 'shopee', product_id: '123456789' }
```

### **Step 7: Verificar Oferta Capturada no Banco**

```sql
-- Supabase SQL Editor ou psql
SELECT * FROM captured_offers
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- Deve mostrar:
-- id: offer-uuid
-- marketplace: shopee
-- product_title: Tênis adidas ultraboost
-- original_price: 250.00
-- discounted_price: 99.90
-- discount_percent: 60
-- status: new
```

**Ou via Frontend:**
```
Navegue para http://localhost:3001/dashboard/captured-offers
Você deve ver a oferta listada com:
  - Titulo: Tênis adidas ultraboost
  - Marketplace: Shopee badge
  - Preço: R$ 250,00 → R$ 99,90 (-60%)
  - Status: Novo
  - Botão: "Replicar"
```

### **Step 8: Testar Replicação Manual (via UI)**

1. Na página `/dashboard/captured-offers`
2. Clique no botão **"Replicar"** da oferta
3. Um modal abre:
   - **Selecione conexão:** Seu WhatsApp
   - **Selecione grupos:** Meus Clientes
   - **Clique:** "Replicar em 1 Grupo(s)"

```
Modal fechará com mensagem "Oferta enfileirada com sucesso!"
```

### **Step 9: Verificar Replicação Enfileirada**

```bash
# Terminal: Redis
redis-cli
> LLEN offer-replication
# 1 (um job de replicação foi adicionado)
```

**Via logs do Terminal 2:**
```
[INFO] Processing offer replication { jobId: 'job-uuid', offerId: 'offer-uuid', groupCount: 1 }
[INFO] Applying anti-ban delay { groupId: 'group-uuid-456', delayMs: 3200, multiplier: 1.0 }
[INFO] Offer sent to group { offerId: 'offer-uuid', groupId: 'group-uuid-456', delayMs: 3200 }
```

### **Step 10: Verificar Mensagem Enviada**

**Opção A: Via WhatsApp**
- Abra seu grupo "Meus Clientes"
- A oferta deve aparecer com:
  ```
  🛍️ Tênis adidas ultraboost
  Preço: R$ 99,90 (de R$ 250,00)
  Marketplace: Shopee
  Link: https://shopee.com.br/p/... (com seu affiliate_id)
  ```

**Opção B: Via Banco de Dados**
```sql
SELECT * FROM replicated_offers
WHERE offer_id = 'offer-uuid'
AND created_at > NOW() - INTERVAL '5 minutes';

-- Deve mostrar:
-- status: sent
-- sent_at: 2026-02-27 10:30:45
-- sent_to_count: 1
```

---

## ✅ Checklist de Sucesso

- [ ] Redis rodando (`redis-cli ping` → PONG)
- [ ] Supabase conectado (migrations executadas)
- [ ] API rodando (`npm run dev` em apps/api)
- [ ] Workers rodando (`npm run worker:dev` em apps/api)
- [ ] Frontend rodando (`npm run dev` em apps/web) [opcional]
- [ ] Tenant + Conexão WhatsApp criados
- [ ] Grupo monitorado criado (group JID copiado)
- [ ] Credenciais Shopee configuradas
- [ ] Grupo de disparo criado (seu grupo)
- [ ] Webhook simulado (curl enviado)
- [ ] Oferta apareceu em captured_offers
- [ ] Oferta replicada via UI
- [ ] Mensagem apareceu no WhatsApp

---

## 🐛 Troubleshooting

### **"Cannot find offer in captured_offers"**
- Webhook não foi processado
- Verifique: Redis está rodando?
- Verifique: Workers estão rodando? (veja logs do Terminal 2)
- Verifique: Group JID está correto? (deve terminar com `@g.us`)

### **"Offer queued but not sent to group"**
- Worker de replicação não está rodando
- Verifique: `npm run worker:dev` está executando?
- Verifique: Redis tem a fila `offer-replication`?
- Verifique: Grupo está `status = 'active'`?

### **"Invalid marketplace detected" na captura**
- MarketplaceDetector não reconheceu "Shopee"
- Verifique: Texto da mensagem contém "shopee" ou "Shopee"?
- Verifique: Confidence score < 0.7?
- Solução: Edite `apps/api/src/services/offers/marketplace-detector.ts`

### **"No affiliate link built"**
- LinkSubstitutionService falhou
- Verifique: Credenciais Shopee estão salvos?
- Verifique: API key do Shopee é válido?
- Solução: Veja logs de erro, confira chave no Supabase

### **"Message not sent to WhatsApp"**
- SessionManager.sendTextToGroup() falhou
- Verifique: Conexão está `status = 'connected'`?
- Verifique: Grupo JID é válido?
- Verifique: Token Evolution API válido?

---

## 📊 Monitorar Progresso

### **Redis CLI — Ver filas em tempo real**

```bash
redis-cli
> LLEN offer-parser        # Jobs aguardando parse
> LLEN offer-replication   # Jobs aguardando envio
> KEYS "*" | GREP captured # Cache de dedup
```

### **Supabase — Ver dados**

```sql
-- Ofertas capturadas
SELECT id, marketplace, product_title, status, captured_at
FROM captured_offers
ORDER BY captured_at DESC
LIMIT 10;

-- Grupos monitorados
SELECT id, group_name, message_count, last_message_at
FROM monitored_groups;

-- Ofertas replicadas
SELECT id, offer_id, status, sent_at, sent_to_count
FROM replicated_offers
ORDER BY sent_at DESC;
```

### **Logs — Ver execução**

```bash
# Terminal 2: Veja logs de workers em tempo real
# Busque por padrões:
# [INFO] Processing offer
# [INFO] Offer captured
# [INFO] Processing offer replication
# [INFO] Offer sent to group
```

---

## 🎯 Próximas Etapas Após Sucesso

1. **Validar Assinatura do Webhook** (AC-010.2)
   - Implementar verificação de `X-Evolution-Signature` header
   - Usar HMAC-SHA256 com API key

2. **Teste com Webhook Real**
   - Conectar Evolution API real (não simulado)
   - Configurar endpoint como webhook para Evolution
   - Receber mensagens reais de grupos de concorrentes

3. **Monitoramento em Produção**
   - Alertas para failed jobs
   - Metrics de latência (capture → replicação)
   - Dashboard de status de grupos

4. **Scale Testing**
   - Teste com múltiplos grupos monitorados
   - Teste com múltiplos marketplaces (Shopee + ML + Amazon)
   - Teste de carga: 100+ mensagens/min

---

## Dúvidas?

Se algo não funcionar:
1. Verifique os logs (Terminal 1, 2, 3)
2. Confira Redis (`redis-cli LLEN offer-parser`)
3. Confira Supabase (dados inseridos?)
4. Teste isoladamente (cada etapa separada)

Bom teste! 🚀
