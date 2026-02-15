import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import { AuditorAgent } from './auditor-agent';
import { CashflowAgent } from './cashflow-agent';
import { ReconciliationAgent } from './reconciliation-agent';
import { SupervisorAgent } from './supervisor-agent';

function createMockRuntime(): AgentRuntime {
  return {
    executeTask: vi.fn().mockResolvedValue({
      success: true,
      output: { result: 'ok' },
    } as TaskResult),
  } as unknown as AgentRuntime;
}

describe('AuditorAgent', () => {
  let runtime: AgentRuntime;
  let agent: AuditorAgent;

  beforeEach(() => {
    runtime = createMockRuntime();
    agent = new AuditorAgent(runtime);
  });

  it('has correct AGENT_ID and SUPPORTED_TASKS', () => {
    expect(AuditorAgent.AGENT_ID).toBe('auditor-agent');
    expect(AuditorAgent.SUPPORTED_TASKS).toContain('audit-batch');
    expect(AuditorAgent.SUPPORTED_TASKS).toContain('score-glosa-risk');
    expect(AuditorAgent.SUPPORTED_TASKS).toContain('detect-inconsistencies');
  });

  it('auditBatch validates and delegates to runtime', async () => {
    const result = await agent.auditBatch({ batchSize: 50, status: 'pending' });
    expect(result.success).toBe(true);
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: 'auditor-agent', taskName: 'audit-batch' }),
    );
  });

  it('auditBatch applies defaults', async () => {
    await agent.auditBatch({});
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: expect.objectContaining({ batchSize: 100, status: 'pending' }),
      }),
    );
  });

  it('scoreGlosaRisk rejects missing accountId', async () => {
    await expect(agent.scoreGlosaRisk({})).rejects.toThrow();
  });

  it('detectInconsistencies delegates to runtime', async () => {
    await agent.detectInconsistencies({ accountId: 'acc-1' });
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'detect-inconsistencies' }),
    );
  });
});

describe('CashflowAgent', () => {
  let runtime: AgentRuntime;
  let agent: CashflowAgent;

  beforeEach(() => {
    runtime = createMockRuntime();
    agent = new CashflowAgent(runtime);
  });

  it('has correct AGENT_ID and SUPPORTED_TASKS', () => {
    expect(CashflowAgent.AGENT_ID).toBe('cashflow-agent');
    expect(CashflowAgent.SUPPORTED_TASKS).toContain('forecast-cashflow');
    expect(CashflowAgent.SUPPORTED_TASKS).toContain('detect-anomalies');
    expect(CashflowAgent.SUPPORTED_TASKS).toContain('generate-financial-report');
  });

  it('forecastCashflow applies defaults', async () => {
    await agent.forecastCashflow({});
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: expect.objectContaining({ projectionMonths: 3, historicalMonths: 12 }),
      }),
    );
  });

  it('generateFinancialReport rejects missing month/year', async () => {
    await expect(agent.generateFinancialReport({})).rejects.toThrow();
  });

  it('generateFinancialReport delegates with valid input', async () => {
    await agent.generateFinancialReport({ month: 1, year: 2026 });
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'generate-financial-report' }),
    );
  });

  it('detectAnomalies delegates to runtime', async () => {
    await agent.detectAnomalies({});
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'detect-anomalies' }),
    );
  });
});

describe('ReconciliationAgent', () => {
  let runtime: AgentRuntime;
  let agent: ReconciliationAgent;

  beforeEach(() => {
    runtime = createMockRuntime();
    agent = new ReconciliationAgent(runtime);
  });

  it('has correct AGENT_ID and SUPPORTED_TASKS', () => {
    expect(ReconciliationAgent.AGENT_ID).toBe('reconciliation-agent');
    expect(ReconciliationAgent.SUPPORTED_TASKS).toContain('reconcile-payment');
    expect(ReconciliationAgent.SUPPORTED_TASKS).toContain('match-invoices');
    expect(ReconciliationAgent.SUPPORTED_TASKS).toContain('generate-appeal');
    expect(ReconciliationAgent.SUPPORTED_TASKS).toContain('prioritize-appeals');
  });

  it('reconcilePayment delegates with valid input', async () => {
    await agent.reconcilePayment({ paymentId: 'pay-1' });
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'reconcile-payment' }),
    );
  });

  it('matchInvoices rejects missing paymentId', async () => {
    await expect(agent.matchInvoices({})).rejects.toThrow();
  });

  it('prioritizeAppeals applies default limit', async () => {
    await agent.prioritizeAppeals({});
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: expect.objectContaining({ limit: 50 }),
      }),
    );
  });

  it('generateAppeal delegates to runtime', async () => {
    await agent.generateAppeal({ glosaId: 'g-1' });
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'generate-appeal' }),
    );
  });
});

describe('SupervisorAgent', () => {
  let runtime: AgentRuntime;
  let agent: SupervisorAgent;

  beforeEach(() => {
    runtime = createMockRuntime();
    agent = new SupervisorAgent(runtime);
  });

  it('has correct AGENT_ID and SUPPORTED_TASKS', () => {
    expect(SupervisorAgent.AGENT_ID).toBe('supervisor-agent');
    expect(SupervisorAgent.SUPPORTED_TASKS).toContain('route-request');
    expect(SupervisorAgent.SUPPORTED_TASKS).toContain('generate-consolidated-report');
  });

  it('routeRequest rejects missing userMessage', async () => {
    await expect(agent.routeRequest({})).rejects.toThrow();
  });

  it('routeRequest delegates with valid input', async () => {
    await agent.routeRequest({ userMessage: 'check my accounts' });
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'route-request' }),
    );
  });

  it('generateConsolidatedReport delegates with valid input', async () => {
    await agent.generateConsolidatedReport({ reportType: 'monthly-close', month: 1, year: 2026 });
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskName: 'generate-consolidated-report' }),
    );
  });

  it('generateConsolidatedReport rejects missing reportType', async () => {
    await expect(agent.generateConsolidatedReport({})).rejects.toThrow();
  });
});
