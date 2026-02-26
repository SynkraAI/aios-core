-- EPIC-07-STORY-03 (ZAP-039): captured_offers table with RLS and deduplication support
-- Purpose: Persist captured marketplace offers with tenant isolation via Row Level Security

CREATE TABLE captured_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- AC-039.1: Marketplace & Product metadata
  marketplace TEXT NOT NULL CHECK (marketplace IN ('shopee', 'mercadolivre', 'amazon')),
  product_id TEXT NOT NULL,
  product_title TEXT,
  product_image_url TEXT,

  -- AC-039.1: Pricing data
  original_price DECIMAL(10, 2),
  discounted_price DECIMAL(10, 2),
  discount_percent INT,

  -- AC-039.1: Source URL tracking
  original_url TEXT NOT NULL,
  original_affiliate_id TEXT,

  -- AC-039.1: Source tracking and timestamps
  source_group_jid TEXT,
  captured_from_message_id TEXT,
  captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- AC-039.1: Deduplication hash (format: {marketplace}:{product_id}:{YYYY-MM-DD})
  dedup_hash TEXT NOT NULL,
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of_offer_id UUID REFERENCES captured_offers(id) ON DELETE SET NULL,

  -- AC-039.1 & AC-039.5: Expiration tracking (especially for Amazon 90-day expiry)
  expires_at TIMESTAMP,

  -- AC-039.1 & AC-039.5: Status lifecycle (soft delete via 'expired' status)
  status TEXT NOT NULL CHECK (status IN ('new', 'pending_substitution', 'ready', 'sent', 'expired'))
    DEFAULT 'new',

  -- Audit timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- AC-039.3: UNIQUE constraint on deduplication key
  UNIQUE (marketplace, product_id, tenant_id, DATE(captured_at))
);

-- AC-039.3: Create indexes on critical columns for query performance
CREATE INDEX idx_tenant_status ON captured_offers(tenant_id, status);
CREATE INDEX idx_dedup_hash ON captured_offers(dedup_hash, tenant_id);
CREATE INDEX idx_marketplace ON captured_offers(marketplace, tenant_id);
CREATE INDEX idx_expires_at ON captured_offers(expires_at);
CREATE INDEX idx_captured_at ON captured_offers(captured_at DESC);

-- AC-039.2: Enable Row Level Security for tenant isolation
ALTER TABLE captured_offers ENABLE ROW LEVEL SECURITY;

-- AC-039.2: RLS Policy - Authenticated users see only their tenant's offers
CREATE POLICY "Users see only their tenant's offers"
  ON captured_offers
  FOR ALL
  TO authenticated
  USING (tenant_id = auth.uid()::uuid);

-- AC-039.2: RLS Policy - Service role has unrestricted access for backend operations
CREATE POLICY "Service role unrestricted"
  ON captured_offers
  FOR ALL
  TO service_role
  USING (true);
