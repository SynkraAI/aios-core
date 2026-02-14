-- ============================================================================
-- FinHealth Squad - Supabase Schema (Reference)
-- ============================================================================
-- This file reflects the ACTUAL database state as defined by the frontend
-- migrations (001-017) in finhealth-frontend/supabase/migrations/.
--
-- SOURCE OF TRUTH: finhealth-frontend migrations
-- THIS FILE: Reference for squad agent development and TypeScript interfaces
--
-- Last synced: 2026-02-14 (migration 017_squad_alignment.sql)
-- ============================================================================

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_write_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'finance_manager', 'tiss_operator'),
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_org_role(org_id UUID)
RETURNS TEXT AS $$
  SELECT role
  FROM organization_members
  WHERE user_id = auth.uid()
    AND organization_id = org_id
  LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- MULTI-TENANT INFRASTRUCTURE (migration 016)
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'ubs', 'clinica')),
  plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'enterprise')),
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'billing', 'auditor', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, organization_id)
);

-- ============================================
-- USER PROFILES (migration 015)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'auditor'
    CHECK (role IN ('admin', 'finance_manager', 'auditor', 'tiss_operator')),
  active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CORE BUSINESS TABLES
-- ============================================

-- Patients (migrations 001, 009, 010, 015)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  name TEXT NOT NULL,
  cpf VARCHAR(14),
  birth_date DATE,
  gender VARCHAR(20),
  phone VARCHAR(20),
  email TEXT,
  address JSONB DEFAULT '{}',
  health_insurance_id_deprecated TEXT, -- deprecated in migration 010
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Health Insurers (migrations 001, 012)
CREATE TABLE IF NOT EXISTS health_insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ans_code VARCHAR(6) NOT NULL, -- resized from 20 in migration 012
  name TEXT NOT NULL,
  cnpj VARCHAR(18),
  tiss_version VARCHAR(10) DEFAULT '3.05.00',
  contact_email TEXT,
  api_endpoint TEXT,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Medical Accounts (migrations 001, 008, 016, 017)
CREATE TABLE IF NOT EXISTS medical_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  health_insurer_id UUID REFERENCES health_insurers(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID DEFAULT auth.uid(),

  admission_date DATE,
  discharge_date DATE,
  account_type VARCHAR(20) NOT NULL
    CHECK (account_type IN ('internacao', 'ambulatorial', 'sadt', 'honorarios')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'validated', 'sent', 'paid', 'glosa', 'appeal')),

  -- Financial (DECIMAL 15,2 after migration 017)
  total_amount DECIMAL(15, 2) DEFAULT 0,
  approved_amount DECIMAL(15, 2) DEFAULT 0,
  glosa_amount DECIMAL(15, 2) DEFAULT 0,
  paid_amount DECIMAL(15, 2) DEFAULT 0,

  -- TISS
  tiss_guide_number TEXT,
  tiss_guide_type TEXT,
  tiss_xml TEXT,
  tiss_validation_status VARCHAR(20) DEFAULT 'pending'
    CHECK (tiss_validation_status IN ('valid', 'invalid', 'pending')),
  tiss_validation_errors JSONB DEFAULT '[]',

  -- Audit (populated by Auditor Agent)
  audit_score DECIMAL(5, 2),
  glosa_risk_score DECIMAL(5, 2),
  audit_issues JSONB DEFAULT '[]',

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Procedures (migrations 001, 008, 010, 011, 016, 017)
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_account_id UUID NOT NULL REFERENCES medical_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID DEFAULT auth.uid(),

  tuss_code VARCHAR(10),
  sigtap_code VARCHAR(10),
  cbhpm_code VARCHAR(10),
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(15, 2) DEFAULT 0,
  total_price DECIMAL(15, 2) DEFAULT 0,

  performed_at TIMESTAMPTZ,
  professional_id TEXT,
  professional_name TEXT,
  professional_council TEXT,

  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'denied', 'appealed')),
  glosa_code TEXT,
  glosa_reason TEXT,
  appeal_status VARCHAR(20),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Glosas (migrations 001, 008, 016, 017)
CREATE TABLE IF NOT EXISTS glosas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_account_id UUID NOT NULL REFERENCES medical_accounts(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID DEFAULT auth.uid(),

  glosa_code TEXT NOT NULL,
  glosa_description TEXT,
  glosa_type VARCHAR(20)
    CHECK (glosa_type IN ('administrativa', 'tecnica', 'linear')),

  -- Financial (DECIMAL 15,2 after migration 017)
  original_amount DECIMAL(15, 2) DEFAULT 0,
  glosa_amount DECIMAL(15, 2) DEFAULT 0,

  appeal_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (appeal_status IN ('pending', 'in_progress', 'sent', 'accepted', 'rejected')),
  appeal_text TEXT,
  appeal_sent_at TIMESTAMPTZ,
  appeal_response TEXT,
  appeal_resolved_at TIMESTAMPTZ,

  -- AI Analysis (populated by Auditor + Reconciliation Agents)
  ai_recommendation TEXT,
  success_probability DECIMAL(5, 4),
  priority_score DECIMAL(5, 2),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments (migrations 001, 008, 010, 016, 017)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_insurer_id UUID REFERENCES health_insurers(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID DEFAULT auth.uid(),

  payment_date DATE NOT NULL,
  payment_reference TEXT,
  bank_account TEXT,

  -- Financial (DECIMAL 15,2 after migration 017)
  total_amount DECIMAL(15, 2) DEFAULT 0,
  matched_amount DECIMAL(15, 2) DEFAULT 0,
  unmatched_amount DECIMAL(15, 2) DEFAULT 0,

  reconciliation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (reconciliation_status IN ('pending', 'partial', 'matched')),
  reconciled_at TIMESTAMPTZ,

  payment_file_url TEXT,
  payment_file_type TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment Items (migration 017 — Squad Alignment)
CREATE TABLE IF NOT EXISTS payment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  medical_account_id UUID REFERENCES medical_accounts(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),

  guide_number VARCHAR(20),

  paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  glosa_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,

  match_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (match_status IN ('pending', 'matched', 'partial', 'unmatched')),
  match_confidence DECIMAL(5, 2),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REFERENCE & SUPPORT TABLES
-- ============================================

-- TUSS Procedures (migrations 002, 012)
CREATE TABLE IF NOT EXISTS tuss_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  chapter VARCHAR(100),
  group_name VARCHAR(100),
  subgroup VARCHAR(100),
  procedure_type VARCHAR(50),
  unit_price DECIMAL(15, 2),
  aux_price DECIMAL(15, 2),
  film_price DECIMAL(15, 2),
  uco DECIMAL(6, 2) DEFAULT 1,
  active BOOLEAN DEFAULT true,
  ans_update_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SUS Procedures (migrations 006, 007)
CREATE TABLE IF NOT EXISTS sus_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_sigtap VARCHAR(20) NOT NULL,
  nome TEXT NOT NULL,
  competencia VARCHAR(7) NOT NULL,
  valor_ambulatorial NUMERIC(12, 2),
  valor_hospitalar NUMERIC(12, 2),
  complexidade VARCHAR(20),
  modalidade VARCHAR(30),
  grupo VARCHAR(100),
  subgrupo VARCHAR(150),
  forma_organizacao VARCHAR(150),
  tipo VARCHAR(30),
  codigo_grupo VARCHAR(2),
  codigo_subgrupo VARCHAR(2),
  codigo_forma_organizacao VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(codigo_sigtap, competencia)
);

-- SUS BPA (migration 006)
CREATE TABLE IF NOT EXISTS sus_bpa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnes VARCHAR(7) NOT NULL,
  competencia VARCHAR(7) NOT NULL,
  cbo VARCHAR(6) NOT NULL,
  procedimento VARCHAR(20) NOT NULL,
  quantidade INTEGER DEFAULT 1,
  cnpj_prestador VARCHAR(14),
  patient_id UUID REFERENCES patients(id),
  valor_unitario NUMERIC(12, 2),
  valor_total NUMERIC(12, 2),
  status VARCHAR(20) DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'validado', 'enviado', 'aprovado', 'rejeitado')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SUS AIH (migration 006)
CREATE TABLE IF NOT EXISTS sus_aih (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_aih VARCHAR(13) NOT NULL UNIQUE,
  patient_id UUID REFERENCES patients(id),
  procedimento_principal VARCHAR(20) NOT NULL,
  procedimento_secundario VARCHAR(20),
  data_internacao DATE NOT NULL,
  data_saida DATE,
  valor NUMERIC(12, 2),
  tipo_aih VARCHAR(5) DEFAULT '1',
  cnes VARCHAR(7) NOT NULL,
  cbo_medico VARCHAR(6),
  diarias INTEGER,
  status VARCHAR(20) DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'validado', 'enviado', 'aprovado', 'rejeitado')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications (migration 001)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type VARCHAR(20) DEFAULT 'info'
    CHECK (type IN ('info', 'warning', 'error', 'success')),
  read BOOLEAN DEFAULT false,
  href TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs (migrations 003, 017)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip TEXT,
  agent VARCHAR(100),  -- added in migration 017 for squad agent tracking
  changes JSONB,       -- added in migration 017 for detailed diffs
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Glosa Notifications (migration 004)
CREATE TABLE IF NOT EXISTS glosa_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_account_id UUID REFERENCES medical_accounts(id) ON DELETE CASCADE,
  severity VARCHAR(20) CHECK (severity IN ('CRITICO', 'ALTO', 'MEDIO')),
  risk_score DECIMAL(5, 2) NOT NULL,
  potential_amount DECIMAL(15, 2),
  notification_data JSONB DEFAULT '{}',
  status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'read', 'dismissed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Digital Certificates (migration 005)
CREATE TABLE IF NOT EXISTS digital_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  common_name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  issuer TEXT NOT NULL,
  subject TEXT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,
  cnpj VARCHAR(14),
  cpf VARCHAR(11),
  certificate_type VARCHAR(10) CHECK (certificate_type IN ('A1')),
  status VARCHAR(20) CHECK (status IN ('active', 'expired', 'revoked', 'replaced')),
  pfx_data BYTEA NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  fingerprint TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS POLICIES (summary — see migrations for full detail)
-- ============================================
-- Core business tables (medical_accounts, procedures, glosas, payments, payment_items):
--   Org-scoped RLS via user_org_ids() + user_org_role() (migration 016-017)
--   SELECT: member of org OR is_admin()
--   INSERT/UPDATE: org member with role admin or billing (auditor for glosas)
--   DELETE: org admin only
--   Service role: full access
--
-- Reference tables (patients, health_insurers, tuss_procedures, sus_procedures):
--   Permissive SELECT for all authenticated users
--
-- Per-user tables (notifications, audit_logs, certificates, sus_bpa, sus_aih):
--   Scoped to auth.uid() = user_id
--
-- profiles: SELECT for authenticated, write for admin only
-- organizations: SELECT for members, manage for admin
-- organization_members: SELECT own memberships, manage by org admin
