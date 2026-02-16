-- ============================================================================
-- TISS Batches — Phase 12 (M3)
-- ============================================================================
-- Tracks TISS batch generation, signing, and submission status.
-- Each batch = N guides grouped by (operadora, competencia).

CREATE TABLE IF NOT EXISTS tiss_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  health_insurer_id UUID NOT NULL REFERENCES health_insurers(id),

  -- Batch metadata
  lote_number VARCHAR(12) NOT NULL,
  competencia VARCHAR(7) NOT NULL,  -- YYYY-MM
  guide_count INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'signed', 'sent', 'accepted', 'rejected', 'failed')),
  error_message TEXT,

  -- XML content
  xml_raw TEXT,
  xml_signed TEXT,
  xml_url TEXT,  -- optional: S3/storage URL for large batches

  -- Certificate used for signing
  certificate_id UUID REFERENCES digital_certificates(id),
  signed_at TIMESTAMPTZ,

  -- Submission tracking
  sent_at TIMESTAMPTZ,
  response_at TIMESTAMPTZ,
  response_protocol TEXT,
  response_data JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tiss_batches_org ON tiss_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_tiss_batches_insurer ON tiss_batches(health_insurer_id);
CREATE INDEX IF NOT EXISTS idx_tiss_batches_status ON tiss_batches(status);
CREATE INDEX IF NOT EXISTS idx_tiss_batches_competencia ON tiss_batches(competencia);

-- Updated_at trigger
CREATE TRIGGER set_tiss_batches_updated_at
  BEFORE UPDATE ON tiss_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE tiss_batches ENABLE ROW LEVEL SECURITY;

-- SELECT: org members
CREATE POLICY tiss_batches_select ON tiss_batches
  FOR SELECT USING (
    organization_id IN (SELECT user_org_ids())
    OR is_admin()
  );

-- INSERT: org admin or billing role
CREATE POLICY tiss_batches_insert ON tiss_batches
  FOR INSERT WITH CHECK (
    user_org_role(organization_id) IN ('admin', 'billing')
    OR is_admin()
  );

-- UPDATE: org admin or billing role
CREATE POLICY tiss_batches_update ON tiss_batches
  FOR UPDATE USING (
    user_org_role(organization_id) IN ('admin', 'billing')
    OR is_admin()
  );

-- DELETE: org admin only
CREATE POLICY tiss_batches_delete ON tiss_batches
  FOR DELETE USING (
    user_org_role(organization_id) = 'admin'
    OR is_admin()
  );

-- Service role bypass
CREATE POLICY tiss_batches_service ON tiss_batches
  FOR ALL USING (auth.role() = 'service_role');
