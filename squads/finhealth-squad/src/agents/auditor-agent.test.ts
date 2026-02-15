/**
 * Tests for AuditorAgent
 * FinHealth Squad — Audit & Risk Scoring
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

const { mockAccountRepo, mockProcedureRepo, mockGlosaRepo } = vi.hoisted(() => ({
  mockAccountRepo: {
    findById: vi.fn(),
    findPendingAccounts: vi.fn(),
    updateAuditScore: vi.fn(),
  },
  mockProcedureRepo: {
    findByAccountId: vi.fn(),
  },
  mockGlosaRepo: {
    findByAccountId: vi.fn(),
    updateRiskScore: vi.fn(),
  },
}));

vi.mock('../database/supabase-client', () => ({
  MedicalAccountRepository: class { constructor(_orgId: string) { return mockAccountRepo; } },
  ProcedureRepository: class { constructor(_orgId: string) { return mockProcedureRepo; } },
  GlosaRepository: class { constructor(_orgId: string) { return mockGlosaRepo; } },
}));

vi.mock('dotenv', () => ({ config: vi.fn() }));

import { AuditorAgent } from './auditor-agent';
import type { TaskResult } from '../runtime/agent-runtime';

// ============================================================================
// Fixtures
// ============================================================================

const mockRuntime = {
  executeTask: vi.fn<any>().mockResolvedValue({
    success: true,
    output: { auditScore: 85, glosaRisk: 15 },
  } as TaskResult),
} as any;

const mockAccount = {
  id: 'acc-001',
  account_number: 'ACC-2024-001',
  patient_id: 'pat-001',
  health_insurer_id: 'ins-001',
  account_type: 'sadt' as const,
  status: 'pending' as const,
  total_amount: 500,
  approved_amount: 0,
  glosa_amount: 100,
  paid_amount: 0,
  tiss_guide_number: 'GUIDE001',
  tiss_validation_status: 'valid',
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockProcedure = {
  id: 'proc-001',
  medical_account_id: 'acc-001',
  tuss_code: '40301010',
  description: 'Hemograma completo',
  quantity: 1,
  unit_price: 250,
  total_price: 250,
  status: 'active',
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
};

const mockGlosa = {
  id: 'glosa-001',
  medical_account_id: 'acc-001',
  glosa_code: 'G001',
  glosa_type: 'administrativa' as const,
  glosa_description: 'Codigo incorreto',
  original_amount: 250,
  glosa_amount: 100,
  appeal_status: 'pending' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('AuditorAgent', () => {
  let agent: AuditorAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRuntime.executeTask.mockResolvedValue({
      success: true,
      output: { auditScore: 85, glosaRisk: 15 },
    });
    agent = new AuditorAgent(mockRuntime, 'test-org-id');
  });

  // ========================================================================
  // constructor
  // ========================================================================

  describe('constructor', () => {
    it('should create AuditorAgent with runtime and organizationId', () => {
      expect(agent).toBeInstanceOf(AuditorAgent);
    });
  });

  // ========================================================================
  // auditBatch
  // ========================================================================

  describe('auditBatch()', () => {
    it('should return empty result when no pending accounts', async () => {
      mockAccountRepo.findPendingAccounts.mockResolvedValue([]);
      const result = await agent.auditBatch({});
      expect(result.success).toBe(true);
      expect(result.output.audited).toBe(0);
    });

    it('should audit pending accounts and update scores', async () => {
      mockAccountRepo.findPendingAccounts.mockResolvedValue([mockAccount]);
      mockProcedureRepo.findByAccountId.mockResolvedValue([mockProcedure]);
      mockAccountRepo.updateAuditScore.mockResolvedValue(mockAccount);

      const result = await agent.auditBatch({ batchSize: 10 });
      expect(result.success).toBe(true);
      expect(result.output.audited).toBe(1);
      expect(result.output.totalAmount).toBe(250);
      expect(mockAccountRepo.updateAuditScore).toHaveBeenCalledWith('acc-001', 85, 15);
    });

    it('should calculate average audit score across batch', async () => {
      const account2 = { ...mockAccount, id: 'acc-002' };
      mockAccountRepo.findPendingAccounts.mockResolvedValue([mockAccount, account2]);
      mockProcedureRepo.findByAccountId.mockResolvedValue([mockProcedure]);
      mockAccountRepo.updateAuditScore.mockResolvedValue(mockAccount);

      const result = await agent.auditBatch({});
      expect(result.output.averageAuditScore).toBe(85);
      expect(result.output.results).toHaveLength(2);
    });

    it('should validate input with Zod defaults', async () => {
      mockAccountRepo.findPendingAccounts.mockResolvedValue([]);
      await agent.auditBatch({});
      expect(mockAccountRepo.findPendingAccounts).toHaveBeenCalledWith(100);
    });
  });

  // ========================================================================
  // auditAccount
  // ========================================================================

  describe('auditAccount()', () => {
    it('should return error when account not found', async () => {
      mockAccountRepo.findById.mockResolvedValue(null);
      const result = await agent.auditAccount({ accountId: 'nonexistent' });
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('Account not found')]));
    });

    it('should audit account with procedures and glosas', async () => {
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockProcedureRepo.findByAccountId.mockResolvedValue([mockProcedure]);
      mockGlosaRepo.findByAccountId.mockResolvedValue([mockGlosa]);
      mockAccountRepo.updateAuditScore.mockResolvedValue(mockAccount);

      const result = await agent.auditAccount({ accountId: 'acc-001' });
      expect(result.success).toBe(true);
      expect(result.output.accountId).toBe('acc-001');
      expect(result.output.procedureCount).toBe(1);
      expect(result.output.glosaCount).toBe(1);
    });

    it('should calculate glosa ratio correctly', async () => {
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockProcedureRepo.findByAccountId.mockResolvedValue([]);
      mockGlosaRepo.findByAccountId.mockResolvedValue([mockGlosa]);
      mockAccountRepo.updateAuditScore.mockResolvedValue(mockAccount);

      const result = await agent.auditAccount({ accountId: 'acc-001' });
      // glosa_amount=100, total_amount=500, ratio=0.2 -> 20%
      expect(result.output.glosaRatio).toBe(20);
    });

    it('should reject missing accountId', async () => {
      await expect(agent.auditAccount({})).rejects.toThrow();
    });
  });

  // ========================================================================
  // scoreGlosaRisk
  // ========================================================================

  describe('scoreGlosaRisk()', () => {
    it('should return error when account not found', async () => {
      mockAccountRepo.findById.mockResolvedValue(null);
      const result = await agent.scoreGlosaRisk({ accountId: 'nonexistent' });
      expect(result.success).toBe(false);
    });

    it('should return empty result when no glosas', async () => {
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockGlosaRepo.findByAccountId.mockResolvedValue([]);
      const result = await agent.scoreGlosaRisk({ accountId: 'acc-001' });
      expect(result.success).toBe(true);
      expect(result.output.scored).toBe(0);
    });

    it('should score glosas and update risk scores', async () => {
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockGlosaRepo.findByAccountId.mockResolvedValue([mockGlosa]);
      mockGlosaRepo.updateRiskScore.mockResolvedValue(mockGlosa);
      mockRuntime.executeTask.mockResolvedValue({
        success: true,
        output: { successProbability: 70, recommendation: 'Recurso recomendado' },
      });

      const result = await agent.scoreGlosaRisk({ accountId: 'acc-001' });
      expect(result.success).toBe(true);
      expect(result.output.scored).toBe(1);
      expect(result.output.glosas[0].probability).toBe(70);
      expect(mockGlosaRepo.updateRiskScore).toHaveBeenCalledWith(
        'glosa-001', 'Recurso recomendado', 70, 70,
      );
    });

    it('should use fallback scoring when AI does not provide probability', async () => {
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockGlosaRepo.findByAccountId.mockResolvedValue([mockGlosa]);
      mockGlosaRepo.updateRiskScore.mockResolvedValue(mockGlosa);
      mockRuntime.executeTask.mockResolvedValue({ success: true, output: {} });

      const result = await agent.scoreGlosaRisk({ accountId: 'acc-001' });
      expect(result.success).toBe(true);
      // Fallback: (1 - 100/500) * 0.8 * 100 = 64
      expect(result.output.glosas[0].probability).toBe(64);
    });

    it('should reject missing accountId', async () => {
      await expect(agent.scoreGlosaRisk({})).rejects.toThrow();
    });
  });

  // ========================================================================
  // detectInconsistencies
  // ========================================================================

  describe('detectInconsistencies()', () => {
    it('should return empty when no accounts found', async () => {
      mockAccountRepo.findById.mockResolvedValue(null);
      const result = await agent.detectInconsistencies({ accountId: 'nonexistent' });
      expect(result.success).toBe(true);
      expect(result.output.total).toBe(0);
    });

    it('should detect amount mismatches', async () => {
      const accountMismatch = { ...mockAccount, total_amount: 300 };
      mockAccountRepo.findById.mockResolvedValue(accountMismatch);
      mockProcedureRepo.findByAccountId.mockResolvedValue([mockProcedure]); // total=250
      mockRuntime.executeTask.mockResolvedValue({ success: true, output: {} });

      const result = await agent.detectInconsistencies({ accountId: 'acc-001' });
      expect(result.output.inconsistencies).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: 'amount_mismatch' })]),
      );
    });

    it('should detect duplicate guide numbers', async () => {
      const acc1 = { ...mockAccount, id: 'acc-001', tiss_guide_number: 'GUIDE-DUP' };
      const acc2 = { ...mockAccount, id: 'acc-002', tiss_guide_number: 'GUIDE-DUP' };
      mockAccountRepo.findPendingAccounts.mockResolvedValue([acc1, acc2]);
      mockProcedureRepo.findByAccountId.mockResolvedValue([{ ...mockProcedure, total_price: 500 }]);
      mockRuntime.executeTask.mockResolvedValue({ success: true, output: {} });

      const result = await agent.detectInconsistencies({});
      expect(result.output.inconsistencies).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: 'duplicate_guide' })]),
      );
    });

    it('should include AI-detected inconsistencies', async () => {
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockProcedureRepo.findByAccountId.mockResolvedValue([{ ...mockProcedure, total_price: 500 }]);
      mockRuntime.executeTask.mockResolvedValue({
        success: true,
        output: {
          inconsistencies: [{ accountId: 'acc-001', type: 'semantic', description: 'AI found issue', severity: 'medium' }],
        },
      });

      const result = await agent.detectInconsistencies({ accountId: 'acc-001' });
      expect(result.output.inconsistencies).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: 'semantic' })]),
      );
    });
  });
});
