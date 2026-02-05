-- FinHealth Squad - Supabase Schema
-- Healthcare Financial Management Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  birth_date DATE,
  gender VARCHAR(1),
  phone VARCHAR(20),
  email VARCHAR(255),
  address JSONB,
  health_insurance_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Insurers (Operadoras)
CREATE TABLE IF NOT EXISTS health_insurers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ans_code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  tiss_version VARCHAR(10) DEFAULT '3.05.00',
  contact_email VARCHAR(255),
  api_endpoint VARCHAR(500),
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Accounts (Contas Medicas)
CREATE TABLE IF NOT EXISTS medical_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id),
  health_insurer_id UUID REFERENCES health_insurers(id),

  -- Account details
  admission_date TIMESTAMPTZ,
  discharge_date TIMESTAMPTZ,
  account_type VARCHAR(50) NOT NULL, -- 'internacao', 'ambulatorial', 'sadt', 'honorarios'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'validated', 'sent', 'paid', 'glosa', 'appeal'

  -- Financial
  total_amount DECIMAL(15, 2) DEFAULT 0,
  approved_amount DECIMAL(15, 2) DEFAULT 0,
  glosa_amount DECIMAL(15, 2) DEFAULT 0,
  paid_amount DECIMAL(15, 2) DEFAULT 0,

  -- TISS
  tiss_guide_number VARCHAR(20),
  tiss_guide_type VARCHAR(50), -- 'consulta', 'sadt', 'internacao', 'honorarios', 'anexo'
  tiss_xml TEXT,
  tiss_validation_status VARCHAR(50),
  tiss_validation_errors JSONB,

  -- Audit
  audit_score DECIMAL(5, 2),
  glosa_risk_score DECIMAL(5, 2),
  audit_issues JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Procedures (Procedimentos)
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_account_id UUID REFERENCES medical_accounts(id) ON DELETE CASCADE,

  -- Procedure codes
  tuss_code VARCHAR(10),
  sigtap_code VARCHAR(10),
  cbhpm_code VARCHAR(10),

  -- Details
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,

  -- Dates
  performed_at TIMESTAMPTZ,
  professional_id VARCHAR(50),
  professional_name VARCHAR(255),
  professional_council VARCHAR(20), -- CRM, CRO, etc.

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  glosa_code VARCHAR(10),
  glosa_reason TEXT,
  appeal_status VARCHAR(50),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glosas
CREATE TABLE IF NOT EXISTS glosas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_account_id UUID REFERENCES medical_accounts(id),
  procedure_id UUID REFERENCES procedures(id),

  -- Glosa details
  glosa_code VARCHAR(10) NOT NULL,
  glosa_description TEXT,
  glosa_type VARCHAR(50), -- 'administrativa', 'tecnica', 'linear'

  -- Financial
  original_amount DECIMAL(15, 2) NOT NULL,
  glosa_amount DECIMAL(15, 2) NOT NULL,

  -- Appeal
  appeal_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'sent', 'accepted', 'rejected'
  appeal_text TEXT,
  appeal_sent_at TIMESTAMPTZ,
  appeal_response TEXT,
  appeal_resolved_at TIMESTAMPTZ,

  -- AI Analysis
  ai_recommendation TEXT,
  success_probability DECIMAL(5, 2),
  priority_score DECIMAL(5, 2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Pagamentos)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  health_insurer_id UUID REFERENCES health_insurers(id),

  -- Payment details
  payment_date DATE NOT NULL,
  payment_reference VARCHAR(100),
  bank_account VARCHAR(50),

  -- Financial
  total_amount DECIMAL(15, 2) NOT NULL,
  matched_amount DECIMAL(15, 2) DEFAULT 0,
  unmatched_amount DECIMAL(15, 2) DEFAULT 0,

  -- Reconciliation
  reconciliation_status VARCHAR(50) DEFAULT 'pending',
  reconciled_at TIMESTAMPTZ,

  -- File
  payment_file_url TEXT,
  payment_file_type VARCHAR(50),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Items (Itens de Pagamento)
CREATE TABLE IF NOT EXISTS payment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  medical_account_id UUID REFERENCES medical_accounts(id),

  -- Details
  guide_number VARCHAR(20),
  paid_amount DECIMAL(15, 2) NOT NULL,
  glosa_amount DECIMAL(15, 2) DEFAULT 0,

  -- Matching
  match_status VARCHAR(50) DEFAULT 'pending',
  match_confidence DECIMAL(5, 2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  agent VARCHAR(100),
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_medical_accounts_status ON medical_accounts(status);
CREATE INDEX IF NOT EXISTS idx_medical_accounts_patient ON medical_accounts(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_accounts_insurer ON medical_accounts(health_insurer_id);
CREATE INDEX IF NOT EXISTS idx_medical_accounts_created ON medical_accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_procedures_account ON procedures(medical_account_id);
CREATE INDEX IF NOT EXISTS idx_procedures_tuss ON procedures(tuss_code);
CREATE INDEX IF NOT EXISTS idx_glosas_account ON glosas(medical_account_id);
CREATE INDEX IF NOT EXISTS idx_glosas_status ON glosas(appeal_status);
CREATE INDEX IF NOT EXISTS idx_payments_insurer ON payments(health_insurer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_medical_accounts_updated_at
  BEFORE UPDATE ON medical_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_glosas_updated_at
  BEFORE UPDATE ON glosas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE glosas ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON medical_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for service role" ON medical_accounts
  FOR ALL USING (auth.role() = 'service_role');
