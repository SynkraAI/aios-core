# RedirectFlow Architecture Design
## Complete System Design: ZAP → RedirectFlow Adaptation

**Version:** 1.0
**Date:** 2026-02-26
**Status:** Ready for Epic & Story Creation
**Architect:** Aria
**Project:** Synkra AIOS — ZAP Platform

---

## Executive Summary

This document outlines the complete architecture for adapting the ZAP WhatsApp automation platform to function as **RedirectFlow** — an intelligent offer monitoring and replication system that:

- **Monitors** 10 competitor WhatsApp groups (24/7)
- **Captures** offers with affiliate links (Shopee, Mercado Livre, Amazon)
- **Substitutes** links with the user's affiliate IDs
- **Replicates** offers to 10-20+ user groups with intelligent rate limiting
- **Tracks** performance (clicks, conversions, ROI by marketplace)
- **Provides** spy dashboard with competitive insights

### Key Metrics
- **Scale:** 10 monitored groups → 10+ target groups per tenant
- **Throughput:** 10+ offers/day captured
- **Latency:** 2-5 minute intelligent delay (anti-ban)
- **Deduplication:** Daily per marketplace per product
- **Target Users:** Affiliate marketers, group funnel operators

### Timeline
- **Phase 1 (Weeks 1-2):** Foundation + Shopee pipeline
- **Phase 2 (Weeks 3-4):** Full replication + rate limiting
- **Phase 3 (Weeks 5-6):** Mercado Livre integration
- **Phase 4 (Weeks 7-8):** Amazon + analytics dashboard

---

## Part 1: System Architecture

### 1.1 Architectural Layers

#### Layer 1: Monitoring (Inbound)
```
WhatsApp Groups (Competitors)
    ↓
[Evolution API Webhook]
    ↓
GroupMonitorService
├─ Filter: only monitored groups
├─ Extract: message text
└─ Enqueue: to parsing queue
```

**Responsibility:**
- Receive Evolution webhooks for all groups
- Identify if group is in `monitored_groups` table
- Extract message content
- Route to appropriate worker (monitored vs transactional)

**Technologies:**
- Evolution API (existing)
- BullMQ (existing)
- Redis (existing)

---

#### Layer 2: Parsing & Deduplication
```
[Message Queue] (BullMQ)
    ↓
OfferParserWorker
├─ Pattern detection: "Shopee", "ML", "Amazon"
├─ URL extraction + normalization
├─ Price/discount parsing
└─ Deduplication check
    ├─ If duplicate → skip
    └─ If new → queue for substitution
```

**Responsibility:**
- Process captured messages from monitoring
- Detect marketplace patterns (regex-based)
- Extract product IDs, prices, discounts
- Check for duplicates using `dedup_hash`
- Persist to `captured_offers` table
- Enqueue valid offers for link substitution

**Deduplication Logic:**
```
dedup_hash = {marketplace}:{product_id}:{YYYY-MM-DD}

Example:
- Shopee iPhone captured at 09:00 → hash = shopee:123456:2026-02-26
- Same product at 10:30 → hash matches → SKIP (duplicate)
```

**Technologies:**
- BullMQ Worker
- Redis (deduplication cache)
- PostgreSQL (persisted capture history)

---

#### Layer 3: Link Substitution
```
OfferRepository
├─ Shopee: API (user configured)
├─ Mercado Livre: Chrome extension token + account tag
└─ Amazon: Account ID or Selenium (future)
    ↓
LinkSubstitutionEngine
├─ buildShopeeLink(product_id, affiliate_id)
├─ buildMLLink(product_id, account_tag)
└─ buildAmazonLink(asin, associates_id)
    ↓
ReplicatedOffers created
```

**Responsibility:**
- Retrieve user's marketplace credentials
- Construct affiliate link for each marketplace
- Handle marketplace-specific URL patterns
- Create `replicated_offers` record
- Enqueue for replication

**Marketplace-Specific Strategies:**

| Marketplace | Strategy | Status |
|-------------|----------|--------|
| **Shopee** | API integration (user approved) | ✅ Ready Phase 1 |
| **Mercado Livre** | Chrome extension (token + tag) | 🔄 Phase 3 |
| **Amazon** | Account ID + link template | 🔄 Phase 4 |

**Technologies:**
- TypeScript service (marketplace strategy pattern)
- PostgreSQL (credentials storage — encrypted)
- External APIs (Shopee, future: ML)

---

#### Layer 4: Replication (Outbound)
```
OfferReplicationQueue
├─ Rate limiter: 1 offer / 2 min per group
├─ Anti-ban engine: jitter + random delays
└─ Target: 10-20+ user groups
    ↓
BroadcastWorker (extend EPIC-03)
├─ Fetch appropriate connection
├─ Send via SessionManager
└─ Record: sent_at, target group
```

**Responsibility:**
- Queue offers for replication to user's groups
- Apply rate limiting (prevent WhatsApp detection)
- Apply anti-ban delays (jitter + exponential backoff)
- Use existing broadcast infrastructure
- Track send status

**Rate Limiting Rules:**
```
Per Group:
- Max 1 offer / 2 minutes
- Base delay: 2 min
- Jitter: +0-30 seconds
- Adjusted: 2:00-2:30 per send

Per Connection (number):
- Max 3 offers / 5 minutes
- Exponential backoff if rate limit detected

Anti-Ban Triggers:
- If WhatsApp returns rate_limit → backoff 5+ min
- If group marked "spam history" → backoff 3-5 min
```

**Technologies:**
- BullMQ (job scheduling with delays)
- Redis (rate limit tracking)
- SessionManager (existing — send messages)

---

#### Layer 5: Analytics & Tracking
```
ReplicatedOffers Table
├─ affiliate_url (user's link)
├─ sent_to_groups (array)
├─ clicks_count (from link_service)
└─ conversions (webhook from marketplace)
    ↓
Analytics Engine
├─ Calculate: ROI by marketplace
├─ Track: conversion rate by source
└─ Generate: spy dashboard insights
```

**Responsibility:**
- Track replicated offer performance
- Integrate with existing link tracking (EPIC-05)
- Calculate conversion rates and ROI
- Build spy dashboard with competitive insights

**Metrics Tracked:**
- Clicks per offer
- Conversions per offer
- Revenue attributed (if available)
- Performance by marketplace
- Performance by source competitor

**Technologies:**
- PostgreSQL (analytics tables)
- Link tracking service (existing EPIC-05)
- Spy dashboard (future UI component)

---

### 1.2 High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPLETE DATA FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. MONITORING (Inbound)
   Competitor posts: "Shopee: iPhone R$1.999 → R$1.299"
   Link: https://shopee.com.br/iphone-14-p-xxxxx?af_id=rival_id
            ↓
   Evolution webhook triggers
            ↓
   GroupMonitorService validates group is monitored
            ↓
   Message queued to OfferParserQueue

2. PARSING
   OfferParserWorker processes
            ↓
   Pattern match: marketplace=shopee
   Extract: product_id, price, discount
   Dedup check: shopee:xxxxx:2026-02-26
            ↓
   No duplicate found → Create captured_offer record
            ↓
   Queue to LinkSubstitutionQueue

3. SUBSTITUTION
   LinkSubstitutionEngine processes
            ↓
   Fetch: tenant.shopee_affiliate_id from credentials
            ↓
   Build: https://shopee.com.br/iphone-14-p-xxxxx?af_id={TENANT_ID}
            ↓
   Create replicated_offer record
            ↓
   Queue to OfferReplicationQueue

4. REPLICATION (Outbound)
   OfferReplicationQueue processes with rate limiting
            ↓
   Calculate delay: 2:00 + jitter(0:30) = 2:00-2:30
            ↓
   After delay: BroadcastWorker sends
            ↓
   Sends to each target group via SessionManager
            ↓
   Records: sent_at, target_group_id

5. TRACKING
   User clicks affiliate link
            ↓
   LinkService (EPIC-05) tracks click
            ↓
   User purchases on Shopee
            ↓
   Webhook (future) records conversion
            ↓
   Analytics dashboard updates: conversion_count++

6. DASHBOARD (Spy Insights)
   User views ReplicatedOffers dashboard
            ↓
   See trending products across marketplaces
   See conversion rates by marketplace
   See competitor insights (who posts most)
```

---

## Part 2: Marketplace Integration Strategy

### 2.1 Shopee Integration (PHASE 1)

**Status:** User has API access requested ✅

#### URL Pattern Recognition
```
Original competitor link:
https://shopee.com.br/iphone-14-p-123456?af_id=competitor_123

Your affiliate link:
https://shopee.com.br/iphone-14-p-123456?af_id=YOUR_AFFILIATE_ID
```

#### Implementation
```typescript
// Link substitution pseudo-code
const shopeePattern = /shopee\.com\.br\/.*[?&]p-(\d+)/i

function extractShopeeProductId(url: string): string {
  const match = url.match(shopeePattern)
  return match ? match[1] : null
}

function buildShopeeLink(productId: string, tenantAffiliateId: string): string {
  return `https://shopee.com.br/p-${productId}?af_id=${tenantAffiliateId}`
}
```

#### Configuration Required
```yaml
# Tenant settings (encrypted in DB)
marketplace_credentials:
  shopee_affiliate_id: "user_123"  # Public, safe to store
  shopee_api_key: "sk_..."         # Encrypted
```

#### Timeline
- **Week 1:** Shopee pattern detection + URL extraction
- **Week 2:** Link substitution + credential storage

---

### 2.2 Mercado Livre Integration (PHASE 3)

**Status:** Requires Chrome Extension for token capture

#### Challenge
Mercado Livre doesn't expose API for affiliate link generation. Solution: **Chrome Extension approach**

#### URL Pattern Recognition
```
Original:
https://mercadolivre.com.br/...#item_id=123456&user_id=rival_tag

Your link:
https://mercadolivre.com.br/...#item_id=123456&user_id=YOUR_TAG
```

#### Setup Flow
```
1. User clicks "Connect Mercado Livre" in ZAP
2. Chrome extension popup opens
3. User logs into Mercado Livre
4. Extension captures:
   - Bearer token (session)
   - Account tag (affiliate ID)
5. Extension sends to ZAP backend
6. ZAP encrypts + stores in marketplace_credentials
```

#### Implementation
```typescript
// Link substitution pseudo-code
const mlPattern = /mercadolivre\.com\.br\/.*#item_id=(\d+)/i

function buildMLLink(productId: string, accountTag: string): string {
  return `https://mercadolivre.com.br/...#item_id=${productId}&user_id=${accountTag}`
}
```

#### Configuration Required
```yaml
marketplace_credentials:
  mercadolivre_account_tag: "user_tag_abc"  # From extension
  mercadolivre_token: "Bearer ..."          # Encrypted
  mercadolivre_token_expires_at: "2026-05-26"
```

#### Timeline
- **Week 5:** Chrome extension setup flow
- **Week 6:** ML pattern detection + link substitution

---

### 2.3 Amazon Integration (PHASE 4)

**Status:** Account ID only (no public API)

#### Challenge
Amazon Associates doesn't have public API for link generation. Options:

**Option A (Simple - PHASE 4):**
- Extract ASIN from competitor link
- Build: `https://amazon.com.br/dp/{ASIN}?tag={ASSOCIATES_ID}`
- Risk: Links expire 90 days after last click

**Option B (Robust - Future):**
- Use Selenium/Playwright for real-time link generation
- Capture current price + image
- Serve via custom redirect: `https://seu-dominio/amazon/{ASIN}`
- More reliable, but complex

#### Implementation (Phase 4 - Option A)
```typescript
const amazonPattern = /amazon\.com\.br\/dp\/([A-Z0-9]{10})/

function extractAmazonASIN(url: string): string {
  const match = url.match(amazonPattern)
  return match ? match[1] : null
}

function buildAmazonLink(asin: string, associatesId: string): string {
  return `https://amazon.com.br/dp/${asin}?tag=${associatesId}`
}
```

#### Expiration Handling (CRITICAL)
```typescript
// captured_offers.expires_at = captured_at + 90 days

// Daily worker checks expiration
const expiredOffers = await db.query(
  `SELECT id FROM captured_offers
   WHERE marketplace='amazon' AND expires_at < NOW()`
)

for (const offer of expiredOffers) {
  // Mark as expired
  await db.update('captured_offers',
    { status: 'expired' },
    { id: offer.id }
  )

  // Don't replicate anymore
  const pending = await db.query(
    `SELECT id FROM replicated_offers
     WHERE captured_offer_id=$1 AND status IN ('queued','sending')`
  )

  for (const r of pending) {
    await queue.remove(r.id)
  }
}
```

#### Configuration Required
```yaml
marketplace_credentials:
  amazon_associates_id: "sua-id-20"
  amazon_account_id: "optional_for_future"
```

#### Timeline
- **Week 7:** ASIN extraction + link template
- **Week 8:** Expiration handling

---

## Part 3: Database Schema

### 3.1 New Tables

```sql
-- ============================================
-- 1. MONITORED_GROUPS
-- Competitor groups the user is monitoring
-- ============================================
CREATE TABLE monitored_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  connection_id UUID NOT NULL,

  -- Group identification
  group_name TEXT NOT NULL,
  group_jid TEXT NOT NULL UNIQUE,

  -- Status
  status TEXT CHECK (status IN ('active', 'paused', 'deleted')) DEFAULT 'active',

  -- Tracking
  monitored_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  message_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (tenant_id, connection_id)
    REFERENCES whatsapp_connections(tenant_id, id),

  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_jid (group_jid)
);

-- ============================================
-- 2. CAPTURED_OFFERS
-- Offers scraped from competitor groups
-- ============================================
CREATE TABLE captured_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Marketplace & Product
  marketplace TEXT NOT NULL CHECK (marketplace IN ('shopee', 'mercadolivre', 'amazon')),
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image_url TEXT,

  -- Pricing
  original_price DECIMAL(10, 2),
  discounted_price DECIMAL(10, 2),
  discount_percent INT,

  -- Original URL
  original_url TEXT NOT NULL,
  original_affiliate_id TEXT,

  -- Source
  source_group_jid TEXT,
  captured_from_message_id TEXT,
  captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Deduplication
  dedup_hash TEXT NOT NULL,
  -- Format: {marketplace}:{product_id}:{YYYY-MM-DD}
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of_offer_id UUID REFERENCES captured_offers(id),

  -- Expiration (for Amazon: captured_at + 90 days)
  expires_at TIMESTAMP,

  -- Status
  status TEXT CHECK (status IN ('new', 'pending_substitution', 'ready', 'sent', 'expired'))
    DEFAULT 'new',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (marketplace, product_id, tenant_id, captured_at::date),

  INDEX idx_dedup_hash (dedup_hash, tenant_id),
  INDEX idx_status_tenant (status, tenant_id),
  INDEX idx_expires_at (expires_at)
);

-- ============================================
-- 3. REPLICATED_OFFERS
-- Offers sent to user's groups
-- ============================================
CREATE TABLE replicated_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  captured_offer_id UUID NOT NULL REFERENCES captured_offers(id),

  -- Affiliate link
  affiliate_url TEXT NOT NULL,
  marketplace TEXT NOT NULL,

  -- Distribution
  target_group_ids UUID[] DEFAULT '{}',
  sent_to_count INT DEFAULT 0,

  -- Send timestamp
  sent_at TIMESTAMP,

  -- Performance metrics
  clicks_count INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue_estimate DECIMAL(10, 2),

  -- Status
  status TEXT CHECK (status IN ('queued', 'sending', 'sent', 'expired'))
    DEFAULT 'queued',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_captured_offer (captured_offer_id)
);

-- ============================================
-- 4. MARKETPLACE_CREDENTIALS
-- Encrypted storage of user's affiliate credentials
-- ============================================
CREATE TABLE marketplace_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),

  -- Shopee
  shopee_affiliate_id TEXT,
  shopee_api_key TEXT,  -- Encrypted

  -- Mercado Livre
  mercadolivre_account_tag TEXT,
  mercadolivre_token TEXT,  -- Encrypted
  mercadolivre_token_expires_at TIMESTAMP,

  -- Amazon
  amazon_associates_id TEXT,
  amazon_account_id TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- ============================================
-- 5. RATE_LIMIT_STATE
-- Track rate limiting per group (Redis backup)
-- ============================================
CREATE TABLE rate_limit_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  group_id UUID NOT NULL,

  last_offer_sent_at TIMESTAMP,
  offer_count_last_5min INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (tenant_id, group_id),

  INDEX idx_tenant_group (tenant_id, group_id)
);

-- ============================================
-- Update tenants table (add plan migration)
-- ============================================
-- Already exists from EPIC-02
-- tenants.plan_id → plans(id)
-- plans has: max_connections
-- Can extend: max_monitored_groups, max_target_groups
```

### 3.2 RLS Policies

```sql
-- All new tables follow tenant isolation
-- Enable RLS on all tables
ALTER TABLE monitored_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE captured_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE replicated_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_state ENABLE ROW LEVEL SECURITY;

-- Example for captured_offers
CREATE POLICY "Users see only their tenant's offers"
  ON captured_offers
  FOR ALL
  TO authenticated
  USING (tenant_id = auth.uid()::uuid);

-- Service role can see all (for workers)
CREATE POLICY "Service role unrestricted"
  ON captured_offers
  FOR ALL
  TO service_role
  USING (true);
```

---

## Part 4: Rate Limiting & Anti-Ban Strategy

### 4.1 Problem Statement

WhatsApp's platform monitors for:
- Pattern recognition (similar messages to multiple groups)
- High-frequency sending (rate limiting)
- Automated behavior (timing consistency)

**Risk:** Number ban if detected as automated spam distributor

### 4.2 Solutions Implemented

#### Strategy 1: Per-Group Rate Limiting
```
Max 1 offer / 2 minutes per group

Delay calculation:
- Base: 2 minutes
- Jitter: random 0-30 seconds
- Result: 2:00 to 2:30 per group

Per group queue jobs schedule with BullMQ delay:
queue.add(
  { offerId, groupId },
  { delay: calculateDelay(groupId) }
)
```

#### Strategy 2: Per-Connection Rate Limiting
```
Max 3 offers / 5 minutes per WhatsApp number

Tracked in Redis:
redis.get(`offers:sent:${connectionId}:last5m`)
redis.incr(`offers:sent:${connectionId}:last5m`)
redis.expire(`offers:sent:${connectionId}:last5m`, 300)

If count >= 3 within 5 min → pause next offers for 5 min
```

#### Strategy 3: Exponential Backoff
```
If WhatsApp returns rate_limit error (HTTP 429):
  ├─ Attempt 1: wait 5 minutes
  ├─ Attempt 2: wait 10 minutes
  ├─ Attempt 3: wait 20 minutes
  ├─ Attempt 4+: wait 60 minutes or mark group as "restricted"

Tracked in replicated_offers.send_attempts
```

#### Strategy 4: Group-Specific Backoff
```
If group has "spam history" marker:
  ├─ Increase base delay: 3-5 minutes instead of 2
  ├─ Increase jitter: 0-60 seconds instead of 30
  └─ Mark: monitored_groups.backoff_multiplier = 2.0

Triggered by:
- Previous rate limits on group
- High bounce/error rate
- User manual pause
```

#### Strategy 5: Variation & Randomization
```typescript
// Pseudo-code
function calculateDelay(groupId: string, offerId: string): number {
  const baseDelay = 2 * 60 * 1000  // 2 minutes

  // Group-specific backoff
  const group = await getMonitoredGroup(groupId)
  const multiplier = group.backoff_multiplier || 1.0

  // Jitter: pseudo-random but deterministic
  const seed = offerId + groupId + Date.now()
  const jitter = pseudoRandom(seed) * 30 * 1000  // 0-30s

  // Final delay
  const delay = (baseDelay * multiplier) + jitter

  return delay
}
```

### 4.3 Monitoring & Alerts

```typescript
// Track in analytics
interface RateLimitMetrics {
  totalOffersQueued: number
  totalOffersSent: number
  avgDelayPerGroup: number  // in milliseconds
  backoffTriggersLastDay: number
  groupsRestricted: number
  estimatedMaxOffersPerDay: number  // 720 at 2min/group
}
```

---

## Part 5: Deduplication Logic

### 5.1 Deduplication Hash

```typescript
// Format: {marketplace}:{product_id}:{YYYY-MM-DD}
function generateDedupHash(
  marketplace: string,
  productId: string,
  capturedAt: Date
): string {
  const date = capturedAt.toISOString().split('T')[0]  // YYYY-MM-DD
  return `${marketplace}:${productId}:${date}`
}

// Example
generateDedupHash('shopee', '123456', new Date('2026-02-26'))
// → "shopee:123456:2026-02-26"
```

### 5.2 Daily Deduplication Window

**Logic:** Same product per marketplace resets daily at UTC midnight

**Scenario 1:**
```
09:00 - Group A posts: "Shopee iPhone R$1.299"
  └─ Hash: shopee:123456:2026-02-26
  └─ First time → capture + replicate ✅

10:30 - Group B posts: "Shopee iPhone R$1.299" (same product)
  └─ Hash: shopee:123456:2026-02-26
  └─ Duplicate found → skip, mark is_duplicate=true ❌
```

**Scenario 2 (Next day):**
```
2026-02-27 09:00 - Group A posts: "Shopee iPhone R$1.299" again
  └─ Hash: shopee:123456:2026-02-27  ← Different date!
  └─ New hash, date changed → capture + replicate ✅
```

### 5.3 Implementation

```sql
-- Check for duplicate in OfferParserWorker
SELECT id, is_duplicate
FROM captured_offers
WHERE
  tenant_id = $1
  AND dedup_hash = $2
  AND DATE(captured_at) = DATE($3)
LIMIT 1

-- If found:
UPDATE replicated_offers
SET is_duplicate = true, duplicate_of_offer_id = $1
WHERE id = $2
```

---

## Part 6: Security & Privacy Considerations

### 6.1 Credential Storage

**Sensitive Data:**
- Shopee API key
- Mercado Livre token
- (Future) Amazon credentials

**Implementation:**
```typescript
// Encryption at rest (AES-256 per tenant)
const encryptedApiKey = encryptWithTenantKey(apiKey, tenantId)
await db.update('marketplace_credentials', {
  shopee_api_key: encryptedApiKey
}, { tenant_id: tenantId })

// Decryption on use
const apiKey = decryptWithTenantKey(encryptedApiKey, tenantId)
```

### 6.2 Message Access Controls

**Principle:** Only read messages, never write unsolicited messages

```
✅ Allowed:
- Read monitored group messages (webhook data)
- Extract text content
- Parse URLs

❌ Blocked:
- Send messages to monitored groups without user action
- Modify competitor messages
- Export competitor data externally
```

### 6.3 Competitor Data Privacy

**Scenario:** User exports competitor offer data to external service

**Solution:**
```yaml
# Terms of Service clause (for @pm)
"RedirectFlow captures and stores offer data from monitored groups.
 You are responsible for complying with local laws regarding:
 - Data collection from WhatsApp groups
 - Competitor intelligence gathering
 - Affiliate link usage

 RedirectFlow does not:
 - Share competitor data with third parties
 - Publicly expose scraped offers
 - Violate marketplace terms of service"
```

### 6.4 Compliance Considerations

**Defer to @pm, but flag:**
- GDPR: Capturing messages from WhatsApp groups (Brazilian LGPD equivalent?)
- Terms of Service: Shopee/ML/Amazon affiliate program compliance
- WhatsApp: Automation of message sending (allowed with limits)
- Group Privacy: Scraping from public/private groups

---

## Part 7: Four New Epics & 20 Stories

### EPIC-06: Group Monitoring Infrastructure
**Objective:** Enable listening to competitor groups 24/7
**Points:** 13
**Timeline:** Weeks 1-2 (Phase 1-2)

#### Stories

**ZAP-032:** Setup `monitored_groups` table + CRUD API
- Create migration + table
- GET/POST/DELETE endpoints with auth
- RLS policies
- Points: 3

**ZAP-033:** Evolution webhook routing (monitored vs target groups)
- Modify webhook handler in connections.ts
- Route messages to GroupMonitorService (if monitored)
- Route messages to BroadcastWorker (if target)
- Points: 3

**ZAP-034:** Message capture from monitored groups
- Implement GroupMonitorService
- Extract message text + metadata
- Enqueue to OfferParserQueue
- Points: 3

**ZAP-035:** Dashboard: Manage monitored groups (UI)
- Web component to add/pause/delete groups
- Real-time list with last message timestamp
- Connection selector (which WhatsApp account)
- Points: 2

**ZAP-036:** GroupMonitorService worker tests
- Unit tests for message filtering
- Integration tests with Evolution mock
- Points: 2

---

### EPIC-07: Offer Detection & Parsing
**Objective:** Extract offers with marketplace-specific patterns
**Points:** 16
**Timeline:** Weeks 1-4 (Phase 1-3)

#### Stories

**ZAP-037:** Marketplace pattern detection (Shopee, ML regex)
- Implement regex patterns for "Shopee", "ML", "Amazon" prefixes
- Extract marketplace type from message
- Unit tests for edge cases
- Points: 2

**ZAP-038:** URL extraction + normalization (Phase 1: Shopee)
- Implement product_id extraction for Shopee
- URL normalization (remove tracking params, etc.)
- URL validation
- Points: 3

**ZAP-039:** `captured_offers` table + RLS + migrations
- Create table + migrations
- RLS policies (tenant isolation)
- Indexes on dedup_hash, status, expires_at
- Points: 2

**ZAP-040:** Deduplication engine (hash-based, daily window)
- Implement `generateDedupHash()` function
- Check for duplicates in OfferParserWorker
- Mark is_duplicate + duplicate_of_offer_id
- Unit tests
- Points: 3

**ZAP-041:** OfferParserWorker (BullMQ job processing)
- Implement worker: parse messages → extract offers → dedup
- Queue management + error handling
- Integration with captured_offers table
- Points: 3

**ZAP-042:** Dashboard: View captured offers (with filters)
- Web component to browse captured_offers
- Filters: marketplace, date range, duplicate status
- Display: product title, price, discount, source
- Points: 3

---

### EPIC-08: Link Substitution Engine
**Objective:** Build marketplace-specific affiliate links
**Points:** 14
**Timeline:** Weeks 1-2 (Shopee), 5-6 (ML), 7-8 (Amazon)

#### Stories

**ZAP-043:** Marketplace credentials storage (encrypted)
- Create `marketplace_credentials` table
- Encryption/decryption logic with tenant key
- Credentials API: GET/POST/:marketplace
- Points: 3

**ZAP-044:** Shopee integration (Phase 1)
- Implement `buildShopeeLink()` function
- Fetch credential from marketplace_credentials
- Handle API failures gracefully
- Unit tests
- Points: 3

**ZAP-045:** Mercado Livre integration (Phase 3)
- Implement `buildMLLink()` function
- Chrome extension setup flow (UI + API)
- Store token + account_tag (encrypted)
- Handle token refresh
- Points: 4

**ZAP-046:** Amazon integration (Phase 4)
- Implement `buildAmazonLink()` with ASIN extraction
- Handle 90-day link expiration
- Worker: check expiry daily, mark expired
- Points: 2

**ZAP-047:** LinkSubstitutionService (factory pattern)
- Implement MarketplaceStrategy interface
- Factory for ShopeeStrategy, MLStrategy, AmazonStrategy
- Unit tests
- Points: 2

---

### EPIC-09: Intelligent Replication & Analytics
**Objective:** Send offers with rate limiting + track performance
**Points:** 12
**Timeline:** Weeks 3-8 (Phase 2-4)

#### Stories

**ZAP-048:** OfferReplicationQueue + rate limiting (BullMQ)
- Implement queue with delay-based scheduling
- Per-group rate limiter: 1 offer / 2 min
- Per-connection rate limiter: 3 offers / 5 min
- Points: 3

**ZAP-049:** Extend BroadcastWorker for replicated_offers
- Modify existing worker to handle offer context
- Insert sent_at + target_group_id into replicated_offers
- Handle failures + retry logic
- Points: 2

**ZAP-050:** Anti-ban delay engine (jitter + exponential backoff)
- Implement delay calculation with jitter
- Exponential backoff on rate limit errors
- Group-specific backoff multiplier
- Integration tests with mock
- Points: 3

**ZAP-051:** Analytics dashboard (conversions, ROI, spy insights)
- Web component: trending products (across marketplaces)
- Performance by marketplace: captures, sends, conversions
- Competitor insights: which groups post most offers
- ROI calculation: revenue / clicks / conversions
- Points: 4

---

## Part 8: Implementation Roadmap

### Phase 1: Foundation + Shopee (Weeks 1-2)

**Epic Coverage:**
- EPIC-06: 3 stories (ZAP-032, ZAP-033, ZAP-034)
- EPIC-07: 2 stories (ZAP-037, ZAP-038)
- EPIC-08: 1 story (ZAP-044)

**Deliverable:**
```
✅ Can monitor Shopee offers from competitor groups
✅ Can capture, deduplicate, and parse Shopee offers
✅ Can substitute links with user's affiliate ID
⏳ Cannot send yet (replication in Phase 2)
```

**Dependencies:**
- Existing: SessionManager, BullMQ, Evolution API
- New: monitored_groups table, OfferParserWorker, LinkSubstitutionService

---

### Phase 2: Full Replication (Weeks 3-4)

**Epic Coverage:**
- EPIC-09: 3 stories (ZAP-048, ZAP-049, ZAP-050)
- EPIC-07: 2 stories (ZAP-039, ZAP-040, ZAP-041)
- EPIC-06: 2 stories (ZAP-035, ZAP-036)

**Deliverable:**
```
✅ Full Shopee pipeline: capture → substitute → replicate
✅ Rate limiting + anti-ban delays working
✅ Monitoring + parsing dashboards functional
🚀 Production ready for Shopee users
```

**Dependencies:**
- Phase 1 complete
- BroadcastWorker modifications

---

### Phase 3: Mercado Livre (Weeks 5-6)

**Epic Coverage:**
- EPIC-07: 2 stories (ZAP-037, ZAP-038 for ML)
- EPIC-08: 1 story (ZAP-045)

**Deliverable:**
```
✅ ML parsing + link substitution working
✅ Chrome extension flow for credential capture
✅ Concurrent Shopee + ML replication
```

**Dependencies:**
- Phase 2 complete
- Chrome extension development

---

### Phase 4: Amazon + Analytics (Weeks 7-8)

**Epic Coverage:**
- EPIC-07: 1 story (ZAP-042)
- EPIC-08: 2 stories (ZAP-046, ZAP-047)
- EPIC-09: 1 story (ZAP-051)

**Deliverable:**
```
✅ Amazon integration with expiration handling
✅ Analytics dashboard with spy insights
✅ Full 3-marketplace support
✅ Competitive intelligence dashboard
🚀 Complete RedirectFlow feature set
```

**Dependencies:**
- Phases 1-3 complete

---

## Part 9: Architectural Decisions & Trade-offs

### Decision Matrix

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Marketplace-specific (not merged)** | Shopee, ML, Amazon have completely different URL patterns & APIs. Merging would require complex abstraction. Keep simple: per-marketplace strategy. | More code files (3 strategies), less abstraction |
| **Delay 2 min per group (not real-time)** | WhatsApp detects automated patterns. 2 min delay + jitter avoids detection. Real-time would cause bans. | Max ~360 offers/day per number (acceptable for target user) |
| **Dedup by day (resets daily)** | Avoid same offer 2x same day (reduces noise, increases relevance). But next day, OK to replicate again (trending products). | Some users might want 2x per day; add config option later |
| **Store all offer history** | Business value: dashboard insights, trending products, competitor analysis. Privacy acceptable per ToS. | Storage cost + privacy considerations |
| **Shopee priority (Phase 1)** | User already approved API. Easy integration. Fastest to market. | ML + Amazon delayed (user wants all 3 eventually) |
| **Rate limit 1 offer/2 min/group** | Safe threshold. ~360 offers/day/number. Avoids WhatsApp detection. Per industry best practices. | Latency: 2-5 min between capture & replication |
| **Amazon: Account ID only (Phase 4)** | No public API. Users only have account ID. Simple link template. | Links expire 90 days. Requires refresh mechanism. |

---

## Part 10: Risk Assessment

### High-Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **WhatsApp bans for automated sending** | CRITICAL: Service broken | MEDIUM | Rate limiting + jitter strategy. Monitor ban patterns. User education. |
| **Marketplace ToS violation** | HIGH: Account suspension | MEDIUM | Terms clarify user responsibility. Don't scrape non-public groups. |
| **Deduplication fails (sends duplicate)** | HIGH: User trust loss | LOW | Comprehensive unit tests. Daily dedup hash reset clear. |
| **Amazon links expire (90 days)** | MEDIUM: Lost conversions | MEDIUM | Daily expiry check worker. User notification in dashboard. |
| **ML token expires / invalid** | MEDIUM: Feature stops | MEDIUM | Token refresh logic. Error handling + UI notification. |
| **Rate limiter too aggressive (misses offers)** | LOW: Missed revenue | LOW | Config option to adjust delay. Monitor user feedback. |

### Mitigation Strategies

1. **WhatsApp Detection:** Monitor ban patterns, implement backoff, user education
2. **Rate Limiting:** Extensive testing, gradual rollout, user adjustments
3. **Marketplace Compliance:** Clear ToS, user responsibility, legal review (@pm)
4. **Data Expiry:** Automated workers, user dashboards showing status

---

## Part 11: Success Criteria & KPIs

### Epic Success Criteria

**EPIC-06:** ✅
- [ ] 10+ groups can be monitored simultaneously
- [ ] Webhook routing works for monitored vs target groups
- [ ] Message capture pipeline is stable (>99.5% success rate)

**EPIC-07:** ✅
- [ ] Shopee patterns detected with >95% accuracy
- [ ] Dedup reduces duplicates by >90% same-day
- [ ] <5ms parser latency per message

**EPIC-08:** ✅
- [ ] Shopee link substitution 100% accurate
- [ ] ML Chrome extension setup <2 minutes
- [ ] Amazon links respect 90-day expiry

**EPIC-09:** ✅
- [ ] Rate limiting prevents WhatsApp bans (0 bans in testing)
- [ ] Jitter variation is unpredictable (passes entropy test)
- [ ] Analytics dashboard loads <1 second

### Product KPIs

```
Tenant-level:
- Offers captured per day
- Offers replicated per day
- Conversion rate by marketplace
- Revenue attributed per marketplace
- Number of competing groups monitored
- User engagement with spy dashboard

System-level:
- WhatsApp ban incidents (target: 0)
- Worker error rate (target: <0.1%)
- Parser accuracy (target: >99%)
- Anti-ban strategy effectiveness
```

---

## Part 12: Non-Functional Requirements

| NFR | Target | Notes |
|-----|--------|-------|
| **Scalability** | 10 concurrent monitored groups / tenant | BullMQ handles queuing |
| **Latency** | 2-5 min capture → send | Intentional delay for anti-ban |
| **Availability** | 99.5% uptime | Redis + DB failover standard |
| **Security** | End-to-end credential encryption | AES-256 per tenant |
| **Privacy** | Per-tenant data isolation (RLS) | Standard Supabase approach |
| **Reliability** | Max 3 retries per offer send | BullMQ retry config |
| **Compliance** | User responsible (ToS) | @pm defines specific clauses |
| **Maintainability** | Modular marketplace strategies | Easy to add Marketplace N |

---

## Part 13: Technology Stack Summary

### Backend (Existing - Reuse)
- **Framework:** Hono.js v4
- **Runtime:** Node.js 20 (ESM)
- **Database:** Supabase (PostgreSQL 15)
- **Queue:** BullMQ v5 + Redis
- **Auth:** Supabase JWT + RLS
- **WhatsApp:** Evolution API v2

### New Services
- **GroupMonitorService** (TypeScript service)
- **OfferParserWorker** (BullMQ worker)
- **LinkSubstitutionEngine** (Strategy pattern)
- **OfferReplicationQueue** (BullMQ queue)

### Infrastructure
- **Docker:** Existing docker-compose (unchanged)
- **Monitoring:** Extend existing logger
- **Analytics:** PostgreSQL + custom queries

---

## Part 14: Handoff & Next Steps

### Ready for @pm (Morgan)
- [ ] Create 4 EPICs in backlog (EPIC-06 through EPIC-09)
- [ ] Validate scope & timeline with stakeholders
- [ ] Update roadmap in public docs

### Ready for @sm (River)
- [ ] Create 20 detailed stories from epic shards
- [ ] Assign points using estimation matrix
- [ ] Define story dependencies

### Ready for @po (Pax)
- [ ] Validate stories against 10-point checklist
- [ ] Ensure acceptance criteria are testable
- [ ] Flag compliance/legal concerns for @pm

### Ready for @dev (Dex)
- [ ] Start Phase 1: EPIC-06 stories
- [ ] Coordinate with @data-engineer on schema
- [ ] Implement GroupMonitorService

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Captured Offer** | An offer extracted from a competitor's message in a monitored group |
| **Replicated Offer** | A captured offer that has been processed and queued for sending to user's groups |
| **Dedup Hash** | `{marketplace}:{product_id}:{YYYY-MM-DD}` — unique identifier for daily deduplication |
| **Affiliate URL** | Link with user's affiliate/account ID substituted |
| **Rate Limiting** | Delaying offer sends to avoid WhatsApp detection (2 min per group) |
| **Jitter** | Random delay (0-30s) added to base delay to avoid predictable patterns |
| **Expiration** | Amazon links expire 90 days after capture; marked and skipped after expiry |
| **Spy Dashboard** | Analytics showing trending products, competitor insights, user performance |

---

## Appendix B: API Endpoints (Summary)

### Monitored Groups
```
POST   /api/v1/monitored-groups          Create
GET    /api/v1/monitored-groups          List
GET    /api/v1/monitored-groups/:id      Get
DELETE /api/v1/monitored-groups/:id      Delete
PATCH  /api/v1/monitored-groups/:id      Pause/Resume
```

### Captured Offers (Read-Only for Users)
```
GET    /api/v1/captured-offers           List
GET    /api/v1/captured-offers/:id       Get details
GET    /api/v1/captured-offers?marketplace=shopee  Filter
```

### Marketplace Credentials
```
GET    /api/v1/marketplace-credentials          Check status
POST   /api/v1/marketplace-credentials/shopee   Configure Shopee
POST   /api/v1/marketplace-credentials/mercadolivre  Configure ML
POST   /api/v1/marketplace-credentials/amazon   Configure Amazon
```

### Analytics
```
GET    /api/v1/analytics/offers          Overview
GET    /api/v1/analytics/marketplace     By marketplace
GET    /api/v1/analytics/spy-dashboard   Spy insights
```

---

**Document Status:** ✅ Complete
**Ready for:** Epic creation by @pm → Story creation by @sm → Validation by @po → Development by @dev

---

*Designed by: Aria (Architect)
Generated: 2026-02-26
Project: RedirectFlow on ZAP Platform
AIOS Framework: Synkra*

