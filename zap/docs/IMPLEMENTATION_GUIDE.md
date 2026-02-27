# ZAP — RedirectFlow Implementation Guide

## Overview

This guide documents the complete implementation of the RedirectFlow MVP with WhatsApp automation, group monitoring, offer capture, and affiliate link replication.

**Status:** ✅ All core components implemented and tested

---

## What Was Implemented

### ✅ Phase 1: Dashboard Redesign (RedirectFlow Style)
- 5-item simplified sidebar (Dashboard, APIs, Broadcasts, Account, Logout)
- WhatsApp connection card with status + number display
- Monitored groups card listing competitor groups being tracked
- Dispatch groups card showing user's target groups
- Marketplace credentials UI (Shopee, Mercado Livre, Amazon)

### ✅ Phase 2: Webhook Automation Pipeline
- Evolution API webhook integration (`POST /webhooks/evolution`)
- Message filtering and group monitoring
- Offer parsing and marketplace detection
- Database capture to `captured_offers` table
- Redis-based job queueing (BullMQ)

### ✅ Phase 3: Image & Link Preview Support (NOVIDADE)
- **Image Messages:** Extract `imageMessage.url` from messages with captions
- **Link Previews:** Auto-detect `webPreviewMessage` when WhatsApp creates previews
- **Media Pipeline:** Pass `media_url` through offer-parser → captured_offers → replication
- **Image Replication:** New `sendImageToGroup()` method sends images with captions

### ✅ Phase 4: Affiliate Link Generation (Backend Ready)
- ShopeeStrategy, MercadoLivreStrategy, AmazonStrategy implementations
- LinkSubstitutionService coordinates affiliate link generation
- Marketplace credentials stored in `marketplace_credentials` table
- URL parsing for Shopee, Mercado Livre, Amazon product detection

### ✅ Phase 5: Image Sending (Implementation Complete)
- `SessionManager.sendImageToGroup()` — Send image with caption
- `SessionManager.sendMediaToGroup()` — Send any media type
- OfferReplicationWorker now sends images when available
- Fallback to text-only if image unavailable

---

## Architecture

### Message Flow

```
Evolution Webhook
     ↓
GroupMonitorService.processMessage()
     ├─ Extract text (conversation, caption, preview)
     ├─ Extract image URL (imageMessage.url or webPreviewMessage.image.url)
     └─ Enqueue to offer-parser queue
     ↓
OfferParserWorker
     ├─ Detect marketplace (Shopee, Mercado Livre, Amazon)
     ├─ Extract product details (ID, price, title)
     └─ Insert to captured_offers (with product_image_url = media_url)
     ↓
[User clicks Replicate]
     ↓
OfferReplicationQueue
     └─ Generate affiliate link via LinkSubstitutionService
     └─ Send via SessionManager
         ├─ If image available: sendImageToGroup(imageUrl, caption)
         └─ If text only: sendTextToGroup(messageText)
```

### Database Schema

```sql
-- Groups being monitored (competitor groups)
monitored_groups (id, tenant_id, group_jid, status, message_count, last_message_at)

-- Captured offers from group monitoring
captured_offers (
  id, tenant_id, marketplace, product_id, product_title,
  product_image_url, original_price, discounted_price, discount_percent,
  original_url, source_group_jid, captured_at, dedup_hash, is_duplicate
)

-- Offers being replicated to user's groups
replicated_offers (
  id, offer_id, tenant_id, target_group_ids, status, sent_at, sent_to_count
)

-- Marketplace affiliate credentials
marketplace_credentials (
  tenant_id, marketplace, partner_id, partner_secret, affiliate_id, access_token, session_id
)
```

---

## Testing Guide

### Prerequisites

```bash
# 1. Install Redis (macOS)
brew install redis
brew services start redis

# 2. Check Redis is running
redis-cli ping  # Should return "PONG"

# 3. Start API (separate terminal)
npm run dev:api
# Should print: "Zap API running on port 3001"
```

### Test 1: Webhook End-to-End

```bash
# Run automated test script
API_URL=http://localhost:3001 bash scripts/test-webhook-e2e.sh

# Expected output:
# ✅ All webhook tests complete!
# - 3 messages sent to webhook
# - webhook returns { "ok": true }
```

### Test 2: Group Monitoring (Manual)

```bash
# Create a monitored group first
curl -X POST http://localhost:3001/api/v1/monitored-groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group_jid": "120363099999999@g.us",
    "name": "Competitor Group",
    "status": "active"
  }'

# Send message via webhook
curl -X POST http://localhost:3001/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "key": {
        "remoteJid": "120363099999999@g.us",
        "id": "msg-test-123",
        "participant": "5511999999999@s.whatsapp.net"
      },
      "message": {
        "conversation": "New product! https://shopee.com.br/product/123456 - R$ 99.90"
      },
      "messageTimestamp": 1704067200
    },
    "instance": {
      "instanceName": "test_instance",
      "serverUrl": "http://localhost:3000"
    }
  }'

# Check captured offers
psql $DATABASE_URL -c "SELECT * FROM captured_offers WHERE created_at > now() - interval '5 minutes'"
```

### Test 3: Image Message

```bash
# Send message with image + caption
curl -X POST http://localhost:3001/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "key": { "remoteJid": "120363099999999@g.us", "id": "msg-img-1", "participant": "5511999999999@s.whatsapp.net" },
      "message": {
        "imageMessage": {
          "url": "https://example.com/product.jpg",
          "caption": "Confira! Mercado Livre: https://www.mercadolivre.com.br/item-123 - 40% OFF"
        }
      },
      "messageTimestamp": 1704067200
    },
    "instance": { "instanceName": "test_instance", "serverUrl": "http://localhost:3000" }
  }'

# Verify product_image_url is populated in captured_offers
SELECT id, product_id, product_image_url, captured_at FROM captured_offers
WHERE captured_at > now() - interval '5 minutes'
ORDER BY captured_at DESC LIMIT 1;
```

### Test 4: Link Preview (NOVIDADE)

```bash
# Send link preview message
curl -X POST http://localhost:3001/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "key": { "remoteJid": "120363099999999@g.us", "id": "msg-preview-1", "participant": "5511999999999@s.whatsapp.net" },
      "message": {
        "webPreviewMessage": {
          "text": "Melhor preço!",
          "title": "Produto Premium - 50% OFF",
          "description": "Amazon exclusive deal",
          "canonicalUrl": "https://amazon.com.br/dp/B123456789",
          "image": { "url": "https://m.media-amazon.com/images/I/123456.jpg" }
        }
      },
      "messageTimestamp": 1704067200
    },
    "instance": { "instanceName": "test_instance", "serverUrl": "http://localhost:3000" }
  }'

# Check that:
# 1. Amazon marketplace was detected
# 2. Image URL was extracted
# 3. Text + title + description + URL were combined as offer text
SELECT marketplace, product_image_url, created_at FROM captured_offers
WHERE captured_at > now() - interval '1 minute' AND marketplace = 'amazon'
LIMIT 1;
```

### Test 5: Offer Replication with Images

```bash
# Replicate a captured offer
curl -X POST http://localhost:3001/api/v1/captured-offers/{OFFER_ID}/replicate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_group_ids": ["group-jid-1", "group-jid-2"],
    "affiliate_links": {
      "shopee": "https://shopee.com.br/1234567?af_id=your_affiliate_id",
      "mercadolivre": "https://www.mercadolivre.com.br/item/MLB123?aff=your_aff_id",
      "amazon": "https://amazon.com.br/dp/B123456789?tag=your_tag"
    }
  }'

# This triggers:
# 1. OfferReplicationWorker processes job
# 2. If product_image_url exists:
#    - Call sessionManager.sendImageToGroup(imageUrl, messageText)
#    - Sends image + caption to group
# 3. If no image:
#    - Call sessionManager.sendTextToGroup(messageText)
#    - Sends text only
# 4. Update replicated_offers with send status
```

### Test 6: Marketplace Affiliate Configuration

```bash
# Set Shopee affiliate credentials
curl -X POST http://localhost:3001/api/v1/marketplace-credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketplace": "shopee",
    "partner_id": "your_shopee_partner_id",
    "partner_secret": "your_partner_secret"
  }'

# Set Mercado Livre credentials
curl -X POST http://localhost:3001/api/v1/marketplace-credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketplace": "mercadolivre",
    "affiliate_id": "your_ml_affiliate_id",
    "access_token": "your_ml_access_token"
  }'

# Set Amazon credentials
curl -X POST http://localhost:3001/api/v1/marketplace-credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketplace": "amazon",
    "partner_id": "your-amazon-associate-id",
    "access_key": "your_aws_key",
    "secret_key": "your_aws_secret"
  }'
```

---

## Monitoring

### Redis Queues

```bash
# Watch all activity
redis-cli MONITOR

# Check specific queue
redis-cli LLEN "bull:offer-parser:pending"
redis-cli LLEN "bull:offer-replication:pending"

# Get job details
redis-cli GET "bull:offer-parser:{job-id}"
```

### API Logs

```bash
# If running npm run dev:api, logs appear in terminal
# Look for:
# - "Message captured and enqueued" → Webhook received
# - "Offer captured" → Offer parsed successfully
# - "Offer sent to group with image" → Image replication worked
# - "Failed to send offer to group" → Issue with SessionManager
```

### Database Checks

```bash
-- Check captured offers
SELECT id, marketplace, product_image_url, captured_at
FROM captured_offers
WHERE captured_at > now() - interval '1 hour'
ORDER BY captured_at DESC
LIMIT 20;

-- Check replication status
SELECT id, offer_id, status, sent_to_count, sent_at
FROM replicated_offers
WHERE created_at > now() - interval '1 hour'
ORDER BY sent_at DESC;

-- Check monitored groups
SELECT id, group_jid, message_count, last_message_at
FROM monitored_groups
WHERE status = 'active';
```

---

## Troubleshooting

### Issue: Webhook returns 404

**Cause:** Route not registered in index.ts

**Fix:**
```typescript
// apps/api/src/index.ts
app.route('/webhooks', webhooksRouter)
```

### Issue: Jobs not processing

**Cause:** Workers not started or Redis not running

**Fix:**
```bash
redis-cli ping  # Check Redis
ps aux | grep node  # Check API running
# Check logs for "OfferParserWorker started"
```

### Issue: Image URL not extracted

**Cause:** Message structure different from expected

**Fix:**
- Check `extractMessageText()` in GroupMonitorService handles your message type
- Verify Evolution API returns `imageMessage` or `webPreviewMessage` in payload
- Add logging to GroupMonitorService.processMessage()

### Issue: Affiliate links not generated

**Cause:** Marketplace credentials not configured or LinkSubstitutionService not initialized

**Fix:**
```typescript
// In offer-replication flow:
const linkService = initializeLinkSubstitutionService(tenantId)
const affiliateLinks = await linkService.generateAffiliateLinks([
  { marketplace: 'shopee', originalUrl: 'https://shopee.com.br/product/123' }
])
```

---

## Performance Targets

- **Webhook → Queue:** < 100ms (AC-034.3)
- **Offer Parser:** < 2s per message (AC-041)
- **Affiliate Link Gen:** < 500ms per link (AC-047)
- **Image Send:** < 3s per image (AC-034.7)
- **Anti-Ban Delay:** 2-8s between messages (AC-050)

---

## Next Steps

1. **Production Deployment:**
   - Set Evolution API credentials in environment
   - Configure Shopee/Mercado Livre/Amazon API keys
   - Enable webhook signature validation
   - Set up Redis clustering for high volume

2. **UI Enhancements:**
   - Replicate dashboard showing in-progress offers
   - Affiliate link management UI
   - Performance analytics dashboard
   - Group monitoring dashboard

3. **Advanced Features:**
   - Auto-replication to all configured groups
   - Smart scheduling (avoid ban patterns)
   - Competitor tracking analytics
   - Revenue attribution (if affiliate APIs support it)

---

## Files Changed

| File | Changes |
|------|---------|
| `apps/api/src/index.ts` | Added offers & marketplace-credentials routes |
| `apps/api/src/middleware/webhook-router.ts` | Added webPreviewMessage type |
| `apps/api/src/services/group-monitor.service.ts` | Image & link preview extraction |
| `apps/api/src/workers/offer-parser.worker.ts` | Use media_url from job |
| `apps/api/src/workers/broadcast.worker.ts` | Send images with SessionManager |
| `apps/api/src/services/whatsapp/session-manager.ts` | Added sendImageToGroup() & sendMediaToGroup() |
| `apps/api/src/services/offers/link-substitution.service.ts` | Already existed, uses strategies |
| `scripts/test-webhook-e2e.sh` | Added E2E testing script |

---

## Summary

✅ **Complete RedirectFlow MVP Implementation**

- 3 message types supported (text, image + caption, link preview)
- Marketplace detection (Shopee, Mercado Livre, Amazon)
- Offer capture with image URLs
- Affiliate link generation framework
- Image replication with captions
- All components tested and ready for deployment

**Status:** Ready for production testing with real Evolution API and marketplace credentials.
