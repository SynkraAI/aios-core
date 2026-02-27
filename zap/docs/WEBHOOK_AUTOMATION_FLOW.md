# RedirectFlow — Automação de Webhooks

## Fluxo Completo Implementado

O RedirectFlow implementa um fluxo totalmente automatizado de captura e replicação de ofertas usando webhooks do Evolution API.

### 1️⃣ **Evolution API envia webhook**

```
Evolution API (WhatsApp provider)
        ↓
POST /webhooks/evolution
  (body: EvolutionWebhookPayload)
```

**Exemplo de payload:**
```json
{
  "event": "messages.upsert",
  "instance": "prod_tenant-123_conn-456",
  "data": {
    "key": {
      "remoteJid": "120363001@g.us",
      "id": "msg-12345",
      "participant": "5511999999@s.whatsapp.net"
    },
    "message": {
      "conversation": "Shopee - Tênis adidas R$ 199 → R$ 99 https://shopee.com.br/..."
    },
    "messageTimestamp": 1709043600
  }
}
```

### 2️⃣ **processEvolutionEvent() — Roteamento**

```typescript
// apps/api/src/routes/webhooks.ts
async function processEvolutionEvent(body: EvolutionWebhookPayload) {
  // Parse instance name → tenantId + connectionId
  const { tenantId, connectionId } = parseInstanceName(body.instance)

  // Route message para monitor ou broadcast
  const route = await routeWebhookMessage(messageEvent, tenantId)

  if (route === 'monitor') {
    // Grupo é monitorado (concorrente) → capture offer
    await groupMonitorService.processMessage(messageEvent, tenantId)
  } else {
    // Grupo é seu → handle broadcast (não implementado)
  }
}
```

**Decisão de roteamento:**
- Verifica se `remoteJid` existe em `monitored_groups` table
- `monitored_groups.status = 'active'` para este tenant
- Retorna `'monitor'` se encontrado, `'broadcast'` caso contrário

### 3️⃣ **GroupMonitorService.processMessage() — Captura**

```typescript
// apps/api/src/services/group-monitor.service.ts
async processMessage(event: EvolutionMessageEvent, tenantId: string) {
  // 1. Extract message text
  const text = this.extractMessageText(event.data?.message)
  if (!text) return // Skip non-text messages

  // 2. Skip own messages
  if (event.data?.key?.fromMe) return

  // 3. Deduplication cache (Redis — 1 minute)
  const cacheKey = `captured:${messageId}`
  if (await redis.get(cacheKey)) return
  await redis.setex(cacheKey, 60, '1')

  // 4. Verify group is active
  const { data: group } = await supabaseAdmin
    .from('monitored_groups')
    .select('id')
    .eq('group_jid', groupJid)
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .single()
  if (!group) return

  // 5. Create job payload
  const job: OfferParserJob = {
    message_id: messageId,
    text,
    group_jid: groupJid,
    tenant_id: tenantId,
    timestamp: new Date().toISOString()
  }

  // 6. Enqueue to OfferParserQueue (retry: 3x, exponential backoff)
  await offerParserQueue.add('parse-offer', job, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false
  })

  // 7. Update group message counter
  await supabaseAdmin.rpc('increment_message_count', {
    p_group_jid: groupJid,
    p_tenant_id: tenantId
  })
}
```

**Timing:** < 100ms (AC-034.3)

### 4️⃣ **OfferParserWorker — Processamento**

```typescript
// apps/api/src/workers/offer-parser.worker.ts
// Triggered by: offerParserQueue.add('parse-offer', job)
// Runs in separate worker process with Redis connection

async (job) => {
  const { text, group_jid, tenant_id, timestamp } = job.data

  // 1. Detect marketplace (Shopee, Mercado Livre, Amazon)
  const detector = new MarketplaceDetector()
  const { marketplace, confidence } = detector.detect(text)
  if (!marketplace || confidence < 0.7) {
    return { status: 'skipped', reason: 'no_marketplace' }
  }

  // 2. Extract offer data (product ID, title, prices, URL)
  const extractor = new URLExtractor()
  const extracted = extractor.extract(text, marketplace)
  if (!extracted) {
    return { status: 'skipped', reason: 'extraction_failed' }
  }

  // 3. Generate deduplication hash
  const hash = deduplicationService.generateHash(
    marketplace,
    extracted.product_id,
    new Date(timestamp)
  )

  // 4. Check for duplicate (within 24h for same product)
  const isDuplicate = await deduplicationService.checkDuplicate(
    tenant_id,
    hash,
    new Date(timestamp)
  )

  // 5. Save to captured_offers table
  const { data: offer } = await supabaseAdmin
    .from('captured_offers')
    .insert({
      tenant_id,
      marketplace,
      product_id: extracted.product_id,
      product_title: extracted.product_title,
      original_price: extracted.original_price,
      discounted_price: extracted.discounted_price,
      discount_percent: extracted.discount_percent,
      original_url: extracted.original_url,
      source_group_jid: group_jid,
      captured_at: new Date(timestamp),
      dedup_hash: hash,
      is_duplicate: isDuplicate,
      status: 'new'
    })
    .select()
    .single()

  return {
    status: isDuplicate ? 'skipped_duplicate' : 'captured',
    offer_id: offer.id
  }
}
```

**Retry:** 3 attempts with exponential backoff (2s, 4s, 8s)

### 5️⃣ **Frontend — Manual Replication (User Action)**

```
User sees captured offer in /dashboard/captured-offers
        ↓
Clicks "Replicar" button
        ↓
Selects WhatsApp connection + target groups
        ↓
POST /api/v1/captured-offers/{offerId}/replicate
  {
    connectionId: "conn-123",
    targetGroupIds: ["group-1", "group-2"]
  }
```

### 6️⃣ **Replicate Endpoint — Link Substitution**

```typescript
// apps/api/src/routes/offers.ts
app.post('/captured-offers/:id/replicate', async (c) => {
  // 1. Fetch captured offer
  const { data: offer } = await supabaseAdmin
    .from('captured_offers')
    .select('*')
    .eq('id', offerId)
    .eq('tenant_id', tenantId)
    .single()

  // 2. Fetch target groups
  const { data: groups } = await supabaseAdmin
    .from('groups')
    .select('id, wa_group_id')
    .eq('connection_id', connectionId)
    .eq('status', 'active')
    .in('id', targetGroupIds)

  // 3. Build affiliate links (Shopee/ML/Amazon)
  const linkService = new LinkSubstitutionService()
  const affiliateLinks = await linkService.buildAllAffiliateLinks(
    offer.product_id,
    [offer.marketplace],
    tenantId
  )

  // 4. Create job payload
  const jobData: OfferReplicationJobData = {
    offerId,
    tenantId,
    connectionId,
    parsedOffer: {
      marketplace: offer.marketplace,
      productId: offer.product_id,
      price: offer.discounted_price || offer.original_price,
      originalUrl: offer.original_url
    },
    targetGroups: groups.map(g => ({
      groupId: g.id,
      waGroupId: g.wa_group_id
    })),
    affiliateLinks
  }

  // 5. Enqueue to OfferReplicationQueue
  await offerReplicationQueue.add('replicate-offer', jobData, {
    attempts: 4,
    backoff: { type: 'exponential', delay: 5 * 60 * 1000 }, // 5min → 10min → 20min → 60min
    removeOnComplete: true,
    removeOnFail: false
  })

  return c.json({
    success: true,
    message: `Offer queued for replication to ${groups.length} group(s)`
  }, 202)
})
```

### 7️⃣ **OfferReplicationWorker — Envio com Anti-Ban**

```typescript
// apps/api/src/workers/broadcast.worker.ts
export const offerReplicationWorker = new Worker<OfferReplicationJobData>(
  'offer-replication',
  async (job) => {
    const { offerId, tenantId, connectionId, parsedOffer, targetGroups, affiliateLinks } = job.data

    for (const group of targetGroups) {
      // 1. Calculate anti-ban delay (AC-050)
      const { delayMs, multiplier } = await antiBanEngine.calculateDelay(
        group.groupId,
        offerId,
        supabaseAdmin,
        redisConnection
      )

      // 2. Wait before sending (humanized delay)
      await new Promise(resolve => setTimeout(resolve, delayMs))

      // 3. Format message with affiliate link
      const affiliateUrl = affiliateLinks?.[parsedOffer.marketplace] || parsedOffer.originalUrl
      const messageText = formatOfferMessage({
        productTitle: parsedOffer.productId,
        discountedPrice: parsedOffer.price,
        affiliateUrl,
        marketplace: parsedOffer.marketplace
      })

      // 4. Send via SessionManager (Evolution API)
      await sessionManager.sendTextToGroup(
        tenantId,
        connectionId,
        group.waGroupId,
        messageText
      )

      // 5. Update tracking + reset failure count
      await supabaseAdmin
        .from('replicated_offers')
        .update({
          sent_at: new Date().toISOString(),
          status: 'sent',
          sent_to_count: (currentOffer.sent_to_count ?? 0) + 1
        })
        .eq('id', offerId)

      await antiBanEngine.resetFailureCount(group.groupId, redisConnection)
    }
  },
  { connection: bullConnection, concurrency: 2 }
)
```

**Anti-Ban Features:**
- Adaptive delays based on send frequency
- Exponential backoff on failures
- Circuit breaker on excessive failures
- Failure tracking per group

---

## Arquivos Modificados

### API Routes
- ✅ `apps/api/src/routes/webhooks.ts` — Webhook receiver (processEvolutionEvent)
- ✅ `apps/api/src/routes/offers.ts` — Replicate endpoint
- ✅ `apps/api/src/index.ts` — Register routes (offersRouter, marketplaceCredentialsRouter)

### Services
- ✅ `apps/api/src/services/group-monitor.service.ts` — Message capture
- ✅ `apps/api/src/services/offers/link-substitution.service.ts` — Affiliate links
- ✅ `apps/api/src/services/offers/marketplace-detector.ts` — Detect marketplace
- ✅ `apps/api/src/services/offers/url-extractor.ts` — Extract offer data

### Workers
- ✅ `apps/api/src/workers/offer-parser.worker.ts` — Parse messages → captured_offers
- ✅ `apps/api/src/workers/broadcast.worker.ts` — Send replicated offers
- ✅ `apps/api/src/workers/index.ts` — Initialize workers

### Middleware
- ✅ `apps/api/src/middleware/webhook-router.ts` — Route (monitor vs broadcast)

### Frontend
- ✅ `apps/web/src/app/dashboard/settings/apis/page.tsx` — Marketplace credentials (Shopee, ML, Amazon)
- ✅ `apps/web/src/components/modals/OfferReplicationModal.tsx` — Replication UI
- ✅ `apps/web/src/components/tables/CapturedOffersTable.tsx` — Table with Replicate button
- ✅ `apps/web/src/app/dashboard/captured-offers/page.tsx` — Offers page with filters
- ✅ `apps/web/src/components/layout/sidebar.tsx` — Simplified menu (5 items)
- ✅ `apps/web/src/app/dashboard/page.tsx` — New RedirectFlow dashboard

---

## Checklist de Implementação

- [x] Webhook receiver (POST /webhooks/evolution)
- [x] Group monitoring detection (monitored_groups routing)
- [x] Message capture with deduplication
- [x] Marketplace detection (Shopee, ML, Amazon)
- [x] Offer extraction (title, price, URL, discount)
- [x] Affiliate link substitution
- [x] Queue-based processing (BullMQ + Redis)
- [x] Anti-ban delay engine
- [x] Database persistence (captured_offers, replicated_offers)
- [x] Frontend dashboard redesign (RedirectFlow style)
- [x] Marketplace credentials management (encrypted storage)
- [x] Offer replication UI (group selection)
- [x] API endpoints for offers, credentials
- [x] Worker initialization (offer-parser, offer-replication)
- [x] TypeScript compilation ✅
- [ ] End-to-end testing (webhook → replicated message)

---

## Como Testar

### 1. Simulando Evolution Webhook

```bash
curl -X POST http://localhost:3000/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "prod_tenant-test_conn-123",
    "data": {
      "key": {
        "remoteJid": "120363001@g.us",
        "id": "msg-test-123",
        "participant": "5511999999@s.whatsapp.net",
        "fromMe": false
      },
      "message": {
        "conversation": "Shopee - Tênis adidas R$ 199 → R$ 99 https://shopee.com.br/p/123456"
      },
      "messageTimestamp": '$(date +%s)'
    }
  }'
```

### 2. Verificar Captura

```bash
# Check Redis queue
redis-cli
> llen offer-parser
> llen offer-replication

# Check database
SELECT * FROM captured_offers WHERE captured_at > NOW() - INTERVAL 1 minute;
```

### 3. Testar via UI

1. Configure marketplace credentials em `/dashboard/settings/apis`
2. Acompanhe ofertas capturadas em `/dashboard/captured-offers`
3. Clique em "Replicar" para enfileirar envio
4. Confirme envio via `replicated_offers` table

---

## Environment Setup

O sistema requer:
- **Redis** (job queue + cache)
- **Supabase** (PostgreSQL + RLS)
- **Evolution API** (WhatsApp provider)

Veja `apps/api/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
SUPABASE_URL=...
SUPABASE_KEY=...
REDIS_URL=redis://localhost:6379
EVOLUTION_API_KEY=... (optional - webhook validation)
```

---

## Próximos Passos

1. **Webhook Signature Validation** — Validar assinatura do Evolution API
2. **End-to-End Testing** — Testar fluxo completo (webhook → message → database)
3. **Monitoring & Alerts** — Adicionar alertas para failures
4. **Performance Optimization** — Monitor latência de processamento

---

## Referência de Código

- AC-033: Webhook message routing
- AC-034: Group monitoring
- AC-041: Offer parsing
- AC-049: Offer replication
- AC-050: Anti-ban engine
