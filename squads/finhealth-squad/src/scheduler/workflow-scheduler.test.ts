/**
 * Workflow Scheduler Tests
 * FinHealth Squad — Phase 10
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WorkflowScheduler } from './workflow-scheduler';
import type { PipelineExecutor } from '../pipeline/pipeline-executor';
import type { PipelineResult, WorkflowDefinition } from '../pipeline/types';

// ============================================================================
// Mocks
// ============================================================================

function createMockWorkflow(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    name: 'test-workflow',
    version: '1.0.0',
    description: 'Test workflow',
    steps: [{ id: 'step-1', task: 'test-task', agent: 'test-agent', input: {} }],
    ...overrides,
  };
}

function createMockResult(overrides: Partial<PipelineResult> = {}): PipelineResult {
  return {
    success: true,
    workflowName: 'test-workflow',
    output: {},
    stepResults: [],
    errors: [],
    metadata: {
      totalSteps: 1,
      executedSteps: 1,
      skippedSteps: 0,
      failedSteps: 0,
      duration: 100,
    },
    ...overrides,
  };
}

function createMockExecutor(workflows: Map<string, WorkflowDefinition>): PipelineExecutor {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    listWorkflows: vi.fn().mockReturnValue([...workflows.keys()]),
    getWorkflow: vi.fn((name: string) => workflows.get(name)),
    execute: vi.fn().mockResolvedValue(createMockResult()),
  } as unknown as PipelineExecutor;
}

// ============================================================================
// Tests
// ============================================================================

describe('WorkflowScheduler', () => {
  let scheduler: WorkflowScheduler;
  let mockExecutor: PipelineExecutor;

  afterEach(() => {
    scheduler?.destroy();
  });

  describe('initialize()', () => {
    it('should register cron jobs for scheduled workflows', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'audit-pipeline',
        createMockWorkflow({
          name: 'audit-pipeline',
          trigger: { type: 'scheduled', schedule: '0 6 * * *', timezone: 'America/Sao_Paulo' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
        verbose: false,
      });

      await scheduler.initialize();

      const status = scheduler.getStatus();
      expect(status.scheduledJobs).toHaveLength(1);
      expect(status.scheduledJobs[0].workflowName).toBe('audit-pipeline');
      expect(status.scheduledJobs[0].cronExpression).toBe('0 6 * * *');
      expect(status.scheduledJobs[0].timezone).toBe('America/Sao_Paulo');
    });

    it('should register event bindings for on-event workflows', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'reconciliation-pipeline',
        createMockWorkflow({
          name: 'reconciliation-pipeline',
          trigger: { type: 'on-event', event: 'payment-received', source: 'banking-integration' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
        verbose: false,
      });

      await scheduler.initialize();

      const status = scheduler.getStatus();
      expect(status.eventBindings).toHaveLength(1);
      expect(status.eventBindings[0].eventName).toBe('payment-received');
      expect(status.eventBindings[0].workflowName).toBe('reconciliation-pipeline');
    });

    it('should skip workflows without triggers', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set('manual-workflow', createMockWorkflow({ name: 'manual-workflow' }));

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();

      const status = scheduler.getStatus();
      expect(status.scheduledJobs).toHaveLength(0);
      expect(status.eventBindings).toHaveLength(0);
    });

    it('should handle multiple workflow types', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'audit',
        createMockWorkflow({
          name: 'audit',
          trigger: { type: 'scheduled', schedule: '0 6 * * *', timezone: 'UTC' },
        }),
      );
      workflows.set(
        'monthly',
        createMockWorkflow({
          name: 'monthly',
          trigger: { type: 'scheduled', schedule: '0 8 1 * *', timezone: 'UTC' },
        }),
      );
      workflows.set(
        'reconcile',
        createMockWorkflow({
          name: 'reconcile',
          trigger: { type: 'on-event', event: 'payment-received' },
        }),
      );
      workflows.set(
        'billing',
        createMockWorkflow({
          name: 'billing',
          trigger: { type: 'manual' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();

      const status = scheduler.getStatus();
      expect(status.scheduledJobs).toHaveLength(2);
      expect(status.eventBindings).toHaveLength(1);
    });
  });

  describe('start() / stop()', () => {
    it('should set running state on start', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'audit',
        createMockWorkflow({
          name: 'audit',
          trigger: { type: 'scheduled', schedule: '0 6 * * *', timezone: 'UTC' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      scheduler.start();

      expect(scheduler.getStatus().running).toBe(true);
      expect(scheduler.getStatus().startedAt).toBeInstanceOf(Date);
    });

    it('should set running to false on stop', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      scheduler.start();
      scheduler.stop();

      expect(scheduler.getStatus().running).toBe(false);
    });

    it('should be idempotent (double start)', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      scheduler.start();
      scheduler.start(); // Should not throw

      expect(scheduler.getStatus().running).toBe(true);
    });
  });

  describe('trigger()', () => {
    it('should manually trigger a workflow and return success', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set('billing-pipeline', createMockWorkflow({ name: 'billing-pipeline' }));

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();

      const result = await scheduler.trigger('billing-pipeline', { accountId: 'acc-001' });

      expect(result.success).toBe(true);
      expect(result.executionId).toMatch(/^exec-/);
      expect(mockExecutor.execute).toHaveBeenCalledWith({
        workflowName: 'billing-pipeline',
        parameters: { accountId: 'acc-001' },
      });
    });

    it('should return failure when workflow execution fails', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set('billing-pipeline', createMockWorkflow({ name: 'billing-pipeline' }));

      mockExecutor = createMockExecutor(workflows);
      vi.mocked(mockExecutor.execute).mockResolvedValue(
        createMockResult({
          success: false,
          errors: ['Step "validate" failed: invalid XML'],
        }),
      );

      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      const result = await scheduler.trigger('billing-pipeline');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Step "validate" failed: invalid XML');
    });

    it('should handle executor exceptions', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set('billing-pipeline', createMockWorkflow({ name: 'billing-pipeline' }));

      mockExecutor = createMockExecutor(workflows);
      vi.mocked(mockExecutor.execute).mockRejectedValue(new Error('Runtime crashed'));

      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      const result = await scheduler.trigger('billing-pipeline');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Runtime crashed');
    });

    it('should log execution in execution logger', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set('audit', createMockWorkflow({ name: 'audit' }));

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      await scheduler.trigger('audit');

      const execLog = scheduler.getExecutionLogger();
      const recent = execLog.getRecent(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].workflowName).toBe('audit');
      expect(recent[0].triggerType).toBe('manual');
      expect(recent[0].status).toBe('success');
    });
  });

  describe('emitEvent()', () => {
    it('should trigger event-based workflows', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'reconciliation-pipeline',
        createMockWorkflow({
          name: 'reconciliation-pipeline',
          trigger: { type: 'on-event', event: 'payment-received' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();

      await scheduler.emitEvent('payment-received', { paymentId: 'pay-001' });

      // Wait for async handler
      await new Promise((r) => setTimeout(r, 50));

      expect(mockExecutor.execute).toHaveBeenCalledWith({
        workflowName: 'reconciliation-pipeline',
        parameters: { paymentId: 'pay-001' },
      });
    });
  });

  describe('getStatus()', () => {
    it('should return comprehensive status', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'audit',
        createMockWorkflow({
          name: 'audit',
          trigger: { type: 'scheduled', schedule: '0 6 * * *', timezone: 'UTC' },
        }),
      );
      workflows.set(
        'reconcile',
        createMockWorkflow({
          name: 'reconcile',
          trigger: { type: 'on-event', event: 'payment-received' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();

      const status = scheduler.getStatus();
      expect(status.running).toBe(false);
      expect(status.scheduledJobs).toHaveLength(1);
      expect(status.eventBindings).toHaveLength(1);
      expect(status.recentExecutions).toHaveLength(0);
    });
  });

  describe('destroy()', () => {
    it('should stop all jobs and clear state', async () => {
      const workflows = new Map<string, WorkflowDefinition>();
      workflows.set(
        'audit',
        createMockWorkflow({
          name: 'audit',
          trigger: { type: 'scheduled', schedule: '0 6 * * *', timezone: 'UTC' },
        }),
      );

      mockExecutor = createMockExecutor(workflows);
      scheduler = new WorkflowScheduler(mockExecutor, {
        workflowsPath: '/tmp/workflows',
      });

      await scheduler.initialize();
      scheduler.start();
      scheduler.destroy();

      const status = scheduler.getStatus();
      expect(status.running).toBe(false);
      expect(status.scheduledJobs).toHaveLength(0);
      expect(status.eventBindings).toHaveLength(0);
    });
  });
});
