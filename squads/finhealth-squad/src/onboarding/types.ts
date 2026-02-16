/**
 * Tenant Onboarding Types
 * FinHealth Squad — Phase 12 (M2)
 */

export type OrgType = 'hospital' | 'ubs' | 'clinica';
export type OrgPlan = 'basic' | 'professional' | 'enterprise';
export type MemberRole = 'admin' | 'billing' | 'auditor' | 'viewer';
export type ProvisioningStepName =
  | 'create-organization'
  | 'create-admin-member'
  | 'seed-health-insurers'
  | 'seed-glosa-codes'
  | 'configure-defaults';

export type ProvisioningStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'rolled-back';

export interface TenantCreateInput {
  name: string;
  slug?: string;
  cnpj?: string;
  type: OrgType;
  plan?: OrgPlan;
  adminUserId: string;
  adminRole?: MemberRole;
  /** Optional: pre-configure default health insurers (ANS codes) */
  defaultInsurers?: string[];
}

export interface ProvisioningStep {
  name: ProvisioningStepName;
  status: ProvisioningStepStatus;
  detail?: string;
  rollback?: () => Promise<void>;
}

export interface ProvisioningResult {
  success: boolean;
  organizationId?: string;
  slug?: string;
  steps: ProvisioningStep[];
  errors: string[];
  durationMs: number;
}

/** Default health insurers to seed (top BR operators) */
export const DEFAULT_HEALTH_INSURERS = [
  { ansCode: '326305', name: 'Unimed' },
  { ansCode: '006246', name: 'Amil' },
  { ansCode: '359017', name: 'Hapvida' },
  { ansCode: '368253', name: 'SulAmerica' },
  { ansCode: '393321', name: 'Bradesco Saude' },
  { ansCode: '352501', name: 'Notre Dame Intermedica' },
];

/** Standard glosa codes (ANS) */
export const STANDARD_GLOSA_CODES = [
  { code: 'A001', description: 'Procedimento nao coberto', type: 'administrativa' },
  { code: 'A002', description: 'Guia sem autorizacao previa', type: 'administrativa' },
  { code: 'A003', description: 'Beneficiario inelegivel na data', type: 'administrativa' },
  { code: 'A004', description: 'Codigo TUSS invalido', type: 'administrativa' },
  { code: 'A005', description: 'Falta de documentacao', type: 'administrativa' },
  { code: 'T001', description: 'Procedimento incompativel com CID', type: 'tecnica' },
  { code: 'T002', description: 'Quantidade acima do permitido', type: 'tecnica' },
  { code: 'T003', description: 'Procedimento duplicado', type: 'tecnica' },
  { code: 'T004', description: 'Valor acima da tabela de referencia', type: 'tecnica' },
  { code: 'L001', description: 'Glosa linear — aplicacao de indice', type: 'linear' },
];
