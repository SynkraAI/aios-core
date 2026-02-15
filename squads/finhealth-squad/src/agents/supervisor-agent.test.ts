/**
 * Tests for SupervisorAgent
 * FinHealth Squad — Orchestration & Routing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('dotenv', () => ({ config: vi.fn() }));

import { SupervisorAgent } from './supervisor-agent';
import type { TaskResult } from '../runtime/agent-runtime';

// ============================================================================
// Fixtures
// ============================================================================

const mockRuntime = {
  executeTask: vi.fn<any>().mockResolvedValue({
    success: true,
    output: { narrative: 'Consolidated narrative' },
  } as TaskResult),
} as any;

// ============================================================================
// Tests
// ============================================================================

describe('SupervisorAgent', () => {
  let agent: SupervisorAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRuntime.executeTask.mockResolvedValue({
      success: true,
      output: {},
    });
    agent = new SupervisorAgent(mockRuntime, 'test-org-id');
  });

  describe('constructor', () => {
    it('should create SupervisorAgent with runtime and organizationId', () => {
      expect(agent).toBeInstanceOf(SupervisorAgent);
    });
  });

  // ========================================================================
  // routeRequest
  // ========================================================================

  describe('routeRequest()', () => {
    it('should route "glosa" keyword to auditor-agent', async () => {
      const result = await agent.routeRequest({ userMessage: 'Verificar glosa da conta' });
      expect(result.success).toBe(true);
      expect(result.output.routedTo).toBe('auditor-agent');
      expect(result.output.keywordMatch).toBe(true);
    });

    it('should route "pagamento" keyword to reconciliation-agent', async () => {
      const result = await agent.routeRequest({ userMessage: 'Conferir pagamento do mes' });
      expect(result.success).toBe(true);
      expect(result.output.routedTo).toBe('reconciliation-agent');
    });

    it('should route "relatorio" keyword to cashflow-agent', async () => {
      const result = await agent.routeRequest({ userMessage: 'Gerar relatorio financeiro' });
      expect(result.success).toBe(true);
      expect(result.output.routedTo).toBe('cashflow-agent');
    });

    it('should route "tiss" keyword to billing-agent', async () => {
      const result = await agent.routeRequest({ userMessage: 'Validar guia TISS' });
      expect(result.success).toBe(true);
      expect(result.output.routedTo).toBe('billing-agent');
    });

    it('should have low confidence when no keyword matches', async () => {
      const result = await agent.routeRequest({ userMessage: 'Hello world' });
      expect(result.output.confidence).toBe('low');
      expect(result.output.keywordMatch).toBe(false);
    });

    it('should reject missing userMessage', async () => {
      await expect(agent.routeRequest({})).rejects.toThrow();
    });
  });

  // ========================================================================
  // generateConsolidatedReport
  // ========================================================================

  describe('generateConsolidatedReport()', () => {
    it('should merge sections from input and delegate to LLM', async () => {
      mockRuntime.executeTask.mockResolvedValue({
        success: true,
        output: { narrative: 'Report narrative' },
      });

      const result = await agent.generateConsolidatedReport({
        reportType: 'monthly-close',
        month: 1,
        year: 2026,
        auditResults: { score: 85 },
        inconsistencies: [{ type: 'mismatch' }],
      });

      expect(result.success).toBe(true);
      expect(result.output.reportType).toBe('monthly-close');
      expect(result.output.period).toBe('2026-01');
      expect(result.output.sections).toContain('audit');
      expect(result.output.sections).toContain('inconsistencies');
      expect(result.output.narrative).toBe('Report narrative');
    });

    it('should reject missing reportType', async () => {
      await expect(agent.generateConsolidatedReport({})).rejects.toThrow();
    });
  });
});
