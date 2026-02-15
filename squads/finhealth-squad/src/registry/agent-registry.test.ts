import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../database/supabase-client', () => {
  const mockRepo = { findById: vi.fn(), findPendingAccounts: vi.fn().mockResolvedValue([]), findByAccountId: vi.fn().mockResolvedValue([]), findUnreconciled: vi.fn().mockResolvedValue([]), findPendingAppeals: vi.fn().mockResolvedValue([]), findByDateRange: vi.fn().mockResolvedValue([]), updateAuditScore: vi.fn(), updateReconciliation: vi.fn(), updateRiskScore: vi.fn(), updateAppeal: vi.fn(), create: vi.fn(), findById: vi.fn() };
  return {
    MedicalAccountRepository: class { constructor() { return mockRepo; } },
    ProcedureRepository: class { constructor() { return mockRepo; } },
    GlosaRepository: class { constructor() { return mockRepo; } },
    PaymentRepository: class { constructor() { return mockRepo; } },
    HealthInsurerRepository: class { constructor() { return mockRepo; } },
  };
});
vi.mock('dotenv', () => ({ config: vi.fn() }));

import type { AgentRuntime, TaskResult, TaskInput } from '../runtime/agent-runtime';
import { AgentRegistry } from './agent-registry';

function createMockRuntime(): AgentRuntime {
  return {
    executeTask: vi.fn().mockResolvedValue({
      success: true,
      output: { result: 'llm-fallback' },
    } as TaskResult),
  } as unknown as AgentRuntime;
}

describe('AgentRegistry', () => {
  let runtime: AgentRuntime;
  let registry: AgentRegistry;

  beforeEach(() => {
    runtime = createMockRuntime();
    registry = new AgentRegistry({ runtime, organizationId: 'org-test' });
  });

  it('registers all 5 agents', () => {
    const tasks = registry.listRegisteredTasks();
    const agentIds = [...new Set(tasks.map((t) => t.agentId))];
    expect(agentIds).toContain('billing-agent');
    expect(agentIds).toContain('auditor-agent');
    expect(agentIds).toContain('cashflow-agent');
    expect(agentIds).toContain('reconciliation-agent');
    expect(agentIds).toContain('supervisor-agent');
    expect(agentIds).toHaveLength(5);
  });

  it('hasNativeImplementation returns true for registered tasks', () => {
    expect(registry.hasNativeImplementation('auditor-agent', 'audit-batch')).toBe(true);
    expect(registry.hasNativeImplementation('billing-agent', 'validate-tiss')).toBe(true);
    expect(registry.hasNativeImplementation('cashflow-agent', 'forecast-cashflow')).toBe(true);
    expect(registry.hasNativeImplementation('reconciliation-agent', 'reconcile-payment')).toBe(true);
    expect(registry.hasNativeImplementation('supervisor-agent', 'route-request')).toBe(true);
  });

  it('hasNativeImplementation returns false for unknown agent', () => {
    expect(registry.hasNativeImplementation('unknown-agent', 'any-task')).toBe(false);
  });

  it('hasNativeImplementation returns false for unknown task on known agent', () => {
    expect(registry.hasNativeImplementation('auditor-agent', 'nonexistent-task')).toBe(false);
  });

  it('routes registered task through native method (Zod validation + runtime)', async () => {
    const input: TaskInput = {
      agentId: 'auditor-agent',
      taskName: 'audit-batch',
      parameters: { batchSize: 50, status: 'pending' },
    };

    const result = await registry.executeTask(input);

    // Native method now queries repos + delegates to runtime.executeTask for AI
    expect(result.success).toBe(true);
  });

  it('falls back to LLM for unknown agent', async () => {
    const input: TaskInput = {
      agentId: 'unknown-agent',
      taskName: 'some-task',
      parameters: {},
    };

    const result = await registry.executeTask(input);

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ result: 'llm-fallback' });
    expect(runtime.executeTask).toHaveBeenCalledWith(input);
  });

  it('falls back to LLM for unknown task on known agent', async () => {
    const input: TaskInput = {
      agentId: 'auditor-agent',
      taskName: 'nonexistent-task',
      parameters: {},
    };

    const result = await registry.executeTask(input);

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ result: 'llm-fallback' });
    expect(runtime.executeTask).toHaveBeenCalledWith(input);
  });

  it('returns Zod validation error when native method receives invalid input', async () => {
    const input: TaskInput = {
      agentId: 'auditor-agent',
      taskName: 'score-glosa-risk',
      parameters: {}, // missing required accountId
    };

    await expect(registry.executeTask(input)).rejects.toThrow();
  });

  it('listRegisteredTasks returns all task mappings', () => {
    const tasks = registry.listRegisteredTasks();
    expect(tasks.length).toBeGreaterThanOrEqual(13); // 2 billing + 4 auditor + 3 cashflow + 4 reconciliation + 2 supervisor

    const auditBatch = tasks.find((t) => t.taskName === 'audit-batch');
    expect(auditBatch).toEqual({
      agentId: 'auditor-agent',
      taskName: 'audit-batch',
      methodName: 'auditBatch',
    });
  });

  it('skips ALL agent registration when no organizationId', () => {
    const registryNoOrg = new AgentRegistry({ runtime });
    expect(registryNoOrg.hasNativeImplementation('billing-agent', 'validate-tiss')).toBe(false);
    expect(registryNoOrg.hasNativeImplementation('auditor-agent', 'audit-batch')).toBe(false);
    expect(registryNoOrg.hasNativeImplementation('cashflow-agent', 'forecast-cashflow')).toBe(false);
    expect(registryNoOrg.hasNativeImplementation('reconciliation-agent', 'reconcile-payment')).toBe(false);
    expect(registryNoOrg.hasNativeImplementation('supervisor-agent', 'route-request')).toBe(false);
  });
});
