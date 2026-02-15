/**
 * Tests for CashflowAgent
 * FinHealth Squad — Cash Flow Forecasting & Reporting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

const { mockPaymentRepo, mockAccountRepo } = vi.hoisted(() => ({
  mockPaymentRepo: {
    findByDateRange: vi.fn(),
  },
  mockAccountRepo: {
    findPendingAccounts: vi.fn(),
  },
}));

vi.mock('../database/supabase-client', () => ({
  PaymentRepository: class { constructor(_orgId: string) { return mockPaymentRepo; } },
  MedicalAccountRepository: class { constructor(_orgId: string) { return mockAccountRepo; } },
}));

vi.mock('dotenv', () => ({ config: vi.fn() }));

import { CashflowAgent } from './cashflow-agent';
import type { TaskResult } from '../runtime/agent-runtime';

// ============================================================================
// Fixtures
// ============================================================================

const mockRuntime = {
  executeTask: vi.fn<any>().mockResolvedValue({
    success: true,
    output: { analysis: 'AI analysis', narrative: 'AI narrative' },
  } as TaskResult),
} as any;

const mockPayments = [
  { id: 'pay-001', payment_date: '2025-01-15', total_amount: 1000, health_insurer_id: 'ins-001', metadata: {}, created_at: '2025-01-01T00:00:00Z' },
  { id: 'pay-002', payment_date: '2025-02-10', total_amount: 1200, health_insurer_id: 'ins-001', metadata: {}, created_at: '2025-02-01T00:00:00Z' },
  { id: 'pay-003', payment_date: '2025-03-20', total_amount: 1100, health_insurer_id: 'ins-001', metadata: {}, created_at: '2025-03-01T00:00:00Z' },
];

const mockAccount = {
  id: 'acc-001',
  account_number: 'ACC-001',
  account_type: 'sadt' as const,
  status: 'pending' as const,
  total_amount: 1000,
  approved_amount: 800,
  glosa_amount: 200,
  paid_amount: 0,
  metadata: {},
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('CashflowAgent', () => {
  let agent: CashflowAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRuntime.executeTask.mockResolvedValue({
      success: true,
      output: { analysis: 'AI analysis', narrative: 'AI narrative' },
    });
    agent = new CashflowAgent(mockRuntime, 'test-org-id');
  });

  describe('constructor', () => {
    it('should create CashflowAgent with runtime and organizationId', () => {
      expect(agent).toBeInstanceOf(CashflowAgent);
    });
  });

  // ========================================================================
  // forecastCashflow
  // ========================================================================

  describe('forecastCashflow()', () => {
    it('should return projections from historical payments', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue(mockPayments);

      const result = await agent.forecastCashflow({ baseMonth: 4, baseYear: 2025, projectionMonths: 2 });
      expect(result.success).toBe(true);
      expect(result.output.historical).toHaveLength(3);
      expect(result.output.projections).toHaveLength(2);
      expect(result.output.trend).toHaveProperty('slope');
      expect(result.output.trend).toHaveProperty('intercept');
    });

    it('should handle empty historical data', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue([]);

      const result = await agent.forecastCashflow({ baseMonth: 1, baseYear: 2025 });
      expect(result.success).toBe(true);
      expect(result.output.historical).toHaveLength(0);
      expect(result.output.projections).toHaveLength(3); // default projectionMonths
    });

    it('should apply Zod defaults for projectionMonths and historicalMonths', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue([]);

      const result = await agent.forecastCashflow({});
      expect(result.success).toBe(true);
      expect(result.output.projections).toHaveLength(3);
    });

    it('should delegate to LLM for qualitative analysis', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue(mockPayments);

      const result = await agent.forecastCashflow({ baseMonth: 4, baseYear: 2025 });
      expect(mockRuntime.executeTask).toHaveBeenCalledWith(
        expect.objectContaining({ agentId: 'cashflow-agent', taskName: 'cashflow-qualitative' }),
      );
      expect(result.output.qualitativeAnalysis).toBe('AI analysis');
    });
  });

  // ========================================================================
  // detectAnomalies
  // ========================================================================

  describe('detectAnomalies()', () => {
    it('should return insufficient data message with less than 2 payments', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue([mockPayments[0]]);

      const result = await agent.detectAnomalies({});
      expect(result.success).toBe(true);
      expect(result.output.message).toContain('Insufficient data');
    });

    it('should calculate mean and stddev correctly', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue(mockPayments);

      const result = await agent.detectAnomalies({ period: 90 });
      expect(result.success).toBe(true);
      expect(result.output.stats.mean).toBeDefined();
      expect(result.output.stats.stddev).toBeDefined();
      expect(result.output.stats.count).toBe(3);
    });

    it('should detect outliers beyond 2 sigma', async () => {
      const normalPayments = [
        { id: 'p1', payment_date: '2025-01-01', total_amount: 100 },
        { id: 'p2', payment_date: '2025-01-02', total_amount: 100 },
        { id: 'p3', payment_date: '2025-01-03', total_amount: 100 },
        { id: 'p4', payment_date: '2025-01-04', total_amount: 100 },
        { id: 'p5', payment_date: '2025-01-05', total_amount: 100 },
        { id: 'p6', payment_date: '2025-01-06', total_amount: 100 },
        { id: 'p7', payment_date: '2025-01-07', total_amount: 100 },
        { id: 'p8', payment_date: '2025-01-08', total_amount: 100 },
        { id: 'p9', payment_date: '2025-01-09', total_amount: 100 },
        { id: 'outlier', payment_date: '2025-01-10', total_amount: 1000 },
      ];
      mockPaymentRepo.findByDateRange.mockResolvedValue(normalPayments);

      const result = await agent.detectAnomalies({ period: 30 });
      expect(result.output.anomalies.length).toBeGreaterThan(0);
      expect(result.output.anomalies[0].type).toBe('high_outlier');
    });

    it('should return no anomalies for consistent data', async () => {
      const consistent = [
        { id: 'p1', payment_date: '2025-01-01', total_amount: 100 },
        { id: 'p2', payment_date: '2025-01-02', total_amount: 101 },
        { id: 'p3', payment_date: '2025-01-03', total_amount: 99 },
      ];
      mockPaymentRepo.findByDateRange.mockResolvedValue(consistent);

      const result = await agent.detectAnomalies({ period: 30 });
      expect(result.output.anomalies).toHaveLength(0);
    });
  });

  // ========================================================================
  // generateFinancialReport
  // ========================================================================

  describe('generateFinancialReport()', () => {
    it('should calculate KPIs from accounts and payments', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue(mockPayments);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([mockAccount]);

      const result = await agent.generateFinancialReport({ month: 1, year: 2025 });
      expect(result.success).toBe(true);
      expect(result.output.kpis.receitaBruta).toBe(1000);
      expect(result.output.kpis.glosaTotal).toBe(200);
      expect(result.output.kpis.receitaLiquida).toBe(800);
      expect(result.output.kpis.taxaGlosa).toBe(20);
    });

    it('should return period in YYYY-MM format', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue([]);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([]);

      const result = await agent.generateFinancialReport({ month: 3, year: 2025 });
      expect(result.output.period).toBe('2025-03');
    });

    it('should reject missing month or year', async () => {
      await expect(agent.generateFinancialReport({})).rejects.toThrow();
    });

    it('should delegate to LLM for narrative', async () => {
      mockPaymentRepo.findByDateRange.mockResolvedValue([]);
      mockAccountRepo.findPendingAccounts.mockResolvedValue([]);

      const result = await agent.generateFinancialReport({ month: 1, year: 2025 });
      expect(result.output.narrative).toBe('AI narrative');
    });
  });
});
