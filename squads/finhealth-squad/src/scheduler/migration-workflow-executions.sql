-- ============================================================================
-- Migration: workflow_executions table
-- FinHealth Squad — Phase 10: Scheduler & Workflow Automation
-- ============================================================================
-- Tracks workflow execution history for observability.
-- Used by the scheduler to log cron, event, and manual trigger executions.
--
-- NOTE: This is a REFERENCE migration. Apply via Supabase SQL editor
-- or include in finhealth-frontend/supabase/migrations/ as 018_workflow_executions.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),

  workflow_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('scheduled', 'on-event', 'manual')),

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'failed', 'cancelled')),

  output_summary JSONB DEFAULT '{}',
  error TEXT,
  parameters JSONB DEFAULT '{}',

  -- Execution metadata
  duration_ms INTEGER,
  total_steps INTEGER,
  executed_steps INTEGER,
  failed_steps INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_workflow_executions_name ON workflow_executions(workflow_name);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org ON workflow_executions(organization_id);

-- RLS
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Service role: full access (for scheduler running as service)
CREATE POLICY workflow_executions_service_all ON workflow_executions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users: read-only for their org
CREATE POLICY workflow_executions_select ON workflow_executions
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT user_org_ids()));
