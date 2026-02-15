import { describe, it, expect, vi, beforeEach } from 'vitest';
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

    // Native method delegates to runtime.executeTask after Zod validation
    expect(result.success).toBe(true);
    expect(runtime.executeTask).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: 'auditor-agent', taskName: 'audit-batch' }),
    );
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

  it('skips BillingAgent registration when organizationId is not provided', () => {
    const registryNoOrg = new AgentRegistry({ runtime });
    expect(registryNoOrg.hasNativeImplementation('billing-agent', 'validate-tiss')).toBe(false);
    // Other agents still registered
    expect(registryNoOrg.hasNativeImplementation('auditor-agent', 'audit-batch')).toBe(true);
  });
});
