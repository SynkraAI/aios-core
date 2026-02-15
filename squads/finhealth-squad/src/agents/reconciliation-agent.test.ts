/**
 * Tests for ReconciliationAgent
 * FinHealth Squad — Payment Reconciliation & Appeals
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

const { mockPaymentRepo, mockAccountRepo, mockGlosaRepo } = vi.hoisted(() => ({
  mockPaymentRepo: {
    findById: vi.fn(),
    findUnreconciled: vi.fn(),
    updateReconciliation: vi.fn(),
  },
  mockAccountRepo: {
    findById: vi.fn(),
    findPendingAccounts: vi.fn(),
  },
  mockGlosaRepo: {
    findById: vi.fn(),
    findByAccountId: vi.fn(),
    findPendingAppeals: vi.fn(),
    create: vi.fn(),
    updateAppeal: vi.fn(),
  },
}));

vi.mock('../database/supabase-client', () => ({
  PaymentRepository: class { constructor(_orgId: string) { return mockPaymentRepo; } },
  MedicalAccountRepository: class { constructor(_orgId: string) { return mockAccountRepo; } },
  GlosaRepository: class { constructor(_orgId: string) { return mockGlosaRepo; } },
}));

vi.mock('dotenv', () => ({ config: vi.fn() }));

import { ReconciliationAgent } from './reconciliation-agent';
import type { TaskResult } from '../runtime/agent-runtime';

// ============================================================================
// Fixtures
// ============================================================================

const mockRuntime = {
  executeTask: vi.fn<any>().mockResolvedValue({
    success: true,
    output: { appealText: 'Generated appeal text' },
  } as TaskResult),
} as any;

const mockPayment = {
  id: 'pay-001',
  health_insurer_id: 'ins-001',
  payment_date: '2024-01-15',
  total_amount: 500,
  matched_amount: 0,
  unmatched_amount: 500,
  reconciliation_status: 'pending',
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
};

const mockAccount = {
  id: 'acc-001',
  account_number: 'ACC-001',
  health_insurer_id: 'ins-001',
  account_type: 'sadt' as const,
  status: 'pending' as const,
  total_amount: 500,
  approved_amount: 0,
  glosa_amount: 0,
  paid_amount: 0,
  tiss_guide_number: 'GUIDE001',
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockGlosa = {
  id: 'glosa-001',
  medical_account_id: 'acc-001',
  glosa_code: 'G001',
  glosa_type: 'administrativa' as const,
  glosa_description: 'Codigo incorreto',
  original_amount: 500,
  glosa_amount: 100,
  appeal_status: 'pending' as const,
  success_probability: 70,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('ReconciliationAgent', () => {
  let agent: ReconciliationAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRuntime.executeTask.mockResolvedValue({
      success: true,
      output: { appealText: 'Generated appeal text' },
    });
    agent = new ReconciliationAgent(mockRuntime, 'test-org-id');
  });

  describe('constructor', () => {
    it('should create ReconciliationAgent with runtime and organizationId', () => {
      expect(agent).toBeInstanceOf(ReconciliationAgent);
    });
  });

  // ========================================================================
  // reconcilePayment
  // ========================================================================

  describe('reconcilePayment()', () => {
    it('should return empty when no payments to reconcile', async () => {
      mockPaymentRepo.findUnreconciled.mockResolvedValue([]);
      const result = await agent.reconcilePayment({});
      expect(result.success).toBe(true);
      expect(result.output.reconciled).toBe(0);
    });

    it('should reconcile payment by ID', async () => {
      mockPaymentRepo.findById.mockResolvedValue(mockPayment);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([mockAccount]);
      mockPaymentRepo.updateReconciliation.mockResolvedValue(mockPayment);

      const result = await agent.reconcilePayment({ paymentId: 'pay-001' });
      expect(result.success).toBe(true);
      expect(result.output.reconciled).toBe(1);
      expect(mockPaymentRepo.updateReconciliation).toHaveBeenCalled();
    });

    it('should mark as reconciled when amounts match', async () => {
      mockPaymentRepo.findById.mockResolvedValue(mockPayment);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([mockAccount]); // total=500 matches payment=500
      mockPaymentRepo.updateReconciliation.mockResolvedValue(mockPayment);

      const result = await agent.reconcilePayment({ paymentId: 'pay-001' });
      expect(result.output.results[0].status).toBe('reconciled');
    });

    it('should mark as partial when amounts differ', async () => {
      const smallAccount = { ...mockAccount, total_amount: 300 };
      mockPaymentRepo.findById.mockResolvedValue(mockPayment);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([smallAccount]);
      mockPaymentRepo.updateReconciliation.mockResolvedValue(mockPayment);
      mockGlosaRepo.create.mockResolvedValue(mockGlosa);

      const result = await agent.reconcilePayment({ paymentId: 'pay-001' });
      expect(result.output.results[0].status).toBe('partial');
      expect(result.output.results[0].discrepancy).toBe(200);
    });

    it('should create glosa for discrepancies', async () => {
      const smallAccount = { ...mockAccount, total_amount: 300 };
      mockPaymentRepo.findById.mockResolvedValue(mockPayment);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([smallAccount]);
      mockPaymentRepo.updateReconciliation.mockResolvedValue(mockPayment);
      mockGlosaRepo.create.mockResolvedValue(mockGlosa);

      await agent.reconcilePayment({ paymentId: 'pay-001' });
      expect(mockGlosaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ glosa_code: 'REC-DISC', glosa_amount: 200 }),
      );
    });
  });

  // ========================================================================
  // matchInvoices
  // ========================================================================

  describe('matchInvoices()', () => {
    it('should return error when payment not found', async () => {
      mockPaymentRepo.findById.mockResolvedValue(null);
      const result = await agent.matchInvoices({ paymentId: 'nonexistent' });
      expect(result.success).toBe(false);
    });

    it('should categorize accounts as confirmed, partial, or unmatched', async () => {
      const confirmedAcc = { ...mockAccount, id: 'acc-conf', paid_amount: 500 };
      const partialAcc = { ...mockAccount, id: 'acc-part', paid_amount: 300 };
      const unmatchedAcc = { ...mockAccount, id: 'acc-unm', paid_amount: 0 };

      mockPaymentRepo.findById.mockResolvedValue(mockPayment);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([confirmedAcc, partialAcc, unmatchedAcc]);
      mockPaymentRepo.updateReconciliation.mockResolvedValue(mockPayment);

      const result = await agent.matchInvoices({ paymentId: 'pay-001' });
      expect(result.success).toBe(true);
      expect(result.output.confirmed).toHaveLength(1);
      expect(result.output.partial).toHaveLength(1);
      expect(result.output.unmatched).toHaveLength(1);
    });

    it('should reject missing paymentId', async () => {
      await expect(agent.matchInvoices({})).rejects.toThrow();
    });
  });

  // ========================================================================
  // generateAppeal
  // ========================================================================

  describe('generateAppeal()', () => {
    it('should return error when glosaId is not provided', async () => {
      const result = await agent.generateAppeal({});
      expect(result.success).toBe(false);
    });

    it('should return error when glosa not found', async () => {
      mockGlosaRepo.findById.mockResolvedValue(null);
      const result = await agent.generateAppeal({ glosaId: 'nonexistent' });
      expect(result.success).toBe(false);
    });

    it('should generate appeal using LLM and update glosa', async () => {
      mockGlosaRepo.findById.mockResolvedValue(mockGlosa);
      mockAccountRepo.findById.mockResolvedValue(mockAccount);
      mockGlosaRepo.updateAppeal.mockResolvedValue(mockGlosa);

      const result = await agent.generateAppeal({ glosaId: 'glosa-001' });
      expect(result.success).toBe(true);
      expect(result.output.appealText).toBe('Generated appeal text');
      expect(mockGlosaRepo.updateAppeal).toHaveBeenCalledWith('glosa-001', 'Generated appeal text', 'in_progress');
    });
  });

  // ========================================================================
  // prioritizeAppeals
  // ========================================================================

  describe('prioritizeAppeals()', () => {
    it('should return empty when no pending appeals', async () => {
      mockGlosaRepo.findPendingAppeals.mockResolvedValue([]);
      const result = await agent.prioritizeAppeals({});
      expect(result.success).toBe(true);
      expect(result.output.prioritized).toBe(0);
    });

    it('should sort by priority (amount * probability/100) descending', async () => {
      const g1 = { ...mockGlosa, id: 'g1', glosa_amount: 100, success_probability: 90 }; // priority=90
      const g2 = { ...mockGlosa, id: 'g2', glosa_amount: 200, success_probability: 60 }; // priority=120
      mockGlosaRepo.findPendingAppeals.mockResolvedValue([g1, g2]);

      const result = await agent.prioritizeAppeals({});
      expect(result.output.appeals[0].glosaId).toBe('g2'); // higher priority
      expect(result.output.appeals[1].glosaId).toBe('g1');
    });

    it('should use default probability of 50 when not set', async () => {
      const g = { ...mockGlosa, success_probability: null };
      mockGlosaRepo.findPendingAppeals.mockResolvedValue([g]);

      const result = await agent.prioritizeAppeals({});
      expect(result.output.appeals[0].probability).toBe(50);
    });
  });
});
