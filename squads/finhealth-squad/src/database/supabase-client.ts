/**
 * Supabase Client Configuration
 * FinHealth Squad - Database Layer
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Entity types
export interface Patient {
  id: string;
  external_id?: string;
  name: string;
  cpf?: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: Record<string, any>;
  health_insurance_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthInsurer {
  id: string;
  ans_code: string;
  name: string;
  cnpj?: string;
  tiss_version: string;
  contact_email?: string;
  api_endpoint?: string;
  config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalAccount {
  id: string;
  account_number: string;
  patient_id?: string;
  health_insurer_id?: string;
  admission_date?: string;
  discharge_date?: string;
  account_type: 'internacao' | 'ambulatorial' | 'sadt' | 'honorarios';
  status: 'pending' | 'validated' | 'sent' | 'paid' | 'glosa' | 'appeal';
  total_amount: number;
  approved_amount: number;
  glosa_amount: number;
  paid_amount: number;
  tiss_guide_number?: string;
  tiss_guide_type?: string;
  tiss_xml?: string;
  tiss_validation_status?: string;
  tiss_validation_errors?: Record<string, any>;
  audit_score?: number;
  glosa_risk_score?: number;
  audit_issues?: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
}

export interface Procedure {
  id: string;
  medical_account_id: string;
  tuss_code?: string;
  sigtap_code?: string;
  cbhpm_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  performed_at?: string;
  professional_id?: string;
  professional_name?: string;
  professional_council?: string;
  status: string;
  glosa_code?: string;
  glosa_reason?: string;
  appeal_status?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Glosa {
  id: string;
  medical_account_id: string;
  procedure_id?: string;
  glosa_code: string;
  glosa_description?: string;
  glosa_type?: 'administrativa' | 'tecnica' | 'linear';
  original_amount: number;
  glosa_amount: number;
  appeal_status: 'pending' | 'in_progress' | 'sent' | 'accepted' | 'rejected';
  appeal_text?: string;
  appeal_sent_at?: string;
  appeal_response?: string;
  appeal_resolved_at?: string;
  ai_recommendation?: string;
  success_probability?: number;
  priority_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  health_insurer_id: string;
  payment_date: string;
  payment_reference?: string;
  bank_account?: string;
  total_amount: number;
  matched_amount: number;
  unmatched_amount: number;
  reconciliation_status: string;
  reconciled_at?: string;
  payment_file_url?: string;
  payment_file_type?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client (untyped for flexibility)
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variables.'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  });

  return supabaseClient;
}

/**
 * Database repository class for medical accounts
 */
export class MedicalAccountRepository {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  async findById(id: string): Promise<MedicalAccount | null> {
    const { data, error } = await this.client
      .from('medical_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MedicalAccount;
  }

  async findByAccountNumber(accountNumber: string): Promise<MedicalAccount | null> {
    const { data, error } = await this.client
      .from('medical_accounts')
      .select('*')
      .eq('account_number', accountNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as MedicalAccount | null;
  }

  async findPendingAccounts(limit = 100): Promise<MedicalAccount[]> {
    const { data, error } = await this.client
      .from('medical_accounts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as MedicalAccount[];
  }

  async create(account: Omit<MedicalAccount, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalAccount> {
    const { data, error } = await this.client
      .from('medical_accounts')
      .insert(account as any)
      .select()
      .single();

    if (error) throw error;
    return data as MedicalAccount;
  }

  async update(id: string, updates: Partial<MedicalAccount>): Promise<MedicalAccount> {
    const { data, error } = await this.client
      .from('medical_accounts')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MedicalAccount;
  }

  async updateTissValidation(
    id: string,
    status: string,
    errors?: Record<string, any>
  ): Promise<MedicalAccount> {
    return this.update(id, {
      tiss_validation_status: status,
      tiss_validation_errors: errors,
      status: status === 'valid' ? 'validated' : 'pending',
    } as any);
  }

  async updateAuditScore(
    id: string,
    auditScore: number,
    glosaRiskScore: number,
    issues?: Record<string, any>
  ): Promise<MedicalAccount> {
    return this.update(id, {
      audit_score: auditScore,
      glosa_risk_score: glosaRiskScore,
      audit_issues: issues,
    } as any);
  }
}

/**
 * Database repository class for procedures
 */
export class ProcedureRepository {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  async findByAccountId(accountId: string): Promise<Procedure[]> {
    const { data, error } = await this.client
      .from('procedures')
      .select('*')
      .eq('medical_account_id', accountId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Procedure[];
  }

  async create(procedure: Omit<Procedure, 'id' | 'created_at'>): Promise<Procedure> {
    const { data, error } = await this.client
      .from('procedures')
      .insert(procedure as any)
      .select()
      .single();

    if (error) throw error;
    return data as Procedure;
  }

  async createMany(procedures: Omit<Procedure, 'id' | 'created_at'>[]): Promise<Procedure[]> {
    const { data, error } = await this.client
      .from('procedures')
      .insert(procedures as any)
      .select();

    if (error) throw error;
    return (data || []) as Procedure[];
  }
}

/**
 * Database repository class for glosas
 */
export class GlosaRepository {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  async findByAccountId(accountId: string): Promise<Glosa[]> {
    const { data, error } = await this.client
      .from('glosas')
      .select('*')
      .eq('medical_account_id', accountId)
      .order('priority_score', { ascending: false });

    if (error) throw error;
    return (data || []) as Glosa[];
  }

  async findPendingAppeals(limit = 50): Promise<Glosa[]> {
    const { data, error } = await this.client
      .from('glosas')
      .select('*')
      .eq('appeal_status', 'pending')
      .order('priority_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Glosa[];
  }

  async create(glosa: Omit<Glosa, 'id' | 'created_at' | 'updated_at'>): Promise<Glosa> {
    const { data, error } = await this.client
      .from('glosas')
      .insert(glosa as any)
      .select()
      .single();

    if (error) throw error;
    return data as Glosa;
  }

  async updateAppeal(id: string, appealText: string, status: string): Promise<Glosa> {
    const { data, error } = await this.client
      .from('glosas')
      .update({
        appeal_text: appealText,
        appeal_status: status,
        appeal_sent_at: status === 'sent' ? new Date().toISOString() : undefined,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Glosa;
  }
}

export default getSupabaseClient;
