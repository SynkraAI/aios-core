/**
 * Tests for Pipeline Executor
 * FinHealth Squad — End-to-End Pipeline Execution
 *
 * All tests mock AgentRuntime.executeTask() — no real OpenAI calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

import { PipelineExecutor } from './pipeline-executor';
import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import * as fs from 'fs';

// ============================================================================
// Helpers
// ============================================================================

function createMockRuntime(
  executeHandler?: (input: any) => TaskResult,
): AgentRuntime {
  const defaultHandler = (): TaskResult => ({
    success: true,
    output: { data: 'mock' },
    metadata: { tokensUsed: 50 },
  });

  return {
    executeTask: vi.fn().mockImplementation((input) => {
      return Promise.resolve((executeHandler || defaultHandler)(input));
    }),
    initialize: vi.fn(),
    listAgents: vi.fn().mockReturnValue([]),
    getAgent: vi.fn(),
  } as unknown as AgentRuntime;
}

const noopSleep = () => Promise.resolve();

const TWO_STEP_YAML = `
name: two-step
version: 1.0.0
description: "Two step pipeline"
input:
  type: object
  required:
    - accountId
  properties:
    accountId:
      type: string
steps:
  - id: step-a
    task: task-a
    agent: agent-a
    input:
      accountId: "{{input.accountId}}"
    output:
      dataA: "{{result.value}}"
  - id: step-b
    task: task-b
    agent: agent-b
    dependsOn: [step-a]
    input:
      fromA: "{{steps.step-a.output.dataA}}"
    output:
      dataB: "{{result.value}}"
output:
  type: object
  properties:
    finalResult:
      type: string
      source: "{{steps.step-b.output.dataB}}"
`;

const CONDITION_YAML = `
name: condition-pipeline
version: 1.0.0
description: "Pipeline with conditions"
input:
  type: object
  properties:
    runOptional:
      type: boolean
      default: false
steps:
  - id: always
    task: task-always
    agent: agent-a
    input:
      value: "go"
    output:
      result: "{{result.data}}"
  - id: optional
    task: task-optional
    agent: agent-a
    dependsOn: [always]
    condition: "{{input.runOptional}}"
    input:
      prev: "{{steps.always.output.result}}"
`;

const RETRY_YAML = `
name: retry-pipeline
version: 1.0.0
description: "Pipeline with retry"
steps:
  - id: flaky
    task: flaky-task
    agent: agent-a
    input:
      value: "test"
    output:
      data: "{{result.data}}"
onError:
  - condition: "steps.flaky.failed"
    action: retry
    maxRetries: 2
    backoff: exponential
`;

const DEFAULTS_YAML = `
name: defaults-pipeline
version: 1.0.0
description: "Pipeline with input defaults"
input:
  type: object
  properties:
    batchSize:
      type: number
      default: 100
    status:
      type: string
      default: pending
steps:
  - id: step-a
    task: task-a
    agent: agent-a
    input:
      batchSize: "{{input.batchSize}}"
      status: "{{input.status}}"
`;

function setupWorkflowFiles(yamls: Record<string, string>) {
  vi.mocked(fs.existsSync).mockReturnValue(true);
  const fileNames = Object.keys(yamls).map((name) => `${name}.yaml`);
  vi.mocked(fs.readdirSync).mockReturnValue(fileNames as any);
  vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
    const path = String(p);
    for (const [name, content] of Object.entries(yamls)) {
      if (path.includes(name)) return content;
    }
    return '';
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('PipelineExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================================================
  // initialize / listWorkflows / getWorkflow
  // ========================================================================

  describe('initialize()', () => {
    it('should load workflows from directory', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime();
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });

      await executor.initialize();
      expect(executor.listWorkflows()).toEqual(['two-step']);
    });

    it('should return workflow by name', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime();
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });

      await executor.initialize();
      expect(executor.getWorkflow('two-step')).toBeDefined();
      expect(executor.getWorkflow('nonexistent')).toBeUndefined();
    });
  });

  // ========================================================================
  // execute — basic flow
  // ========================================================================

  describe('execute() — basic flow', () => {
    it('should execute a two-step pipeline end-to-end', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime((input) => ({
        success: true,
        output: { value: `result-from-${input.taskName}` },
      }));

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'two-step',
        parameters: { accountId: 'acc-001' },
      });

      expect(result.success).toBe(true);
      expect(result.workflowName).toBe('two-step');
      expect(result.stepResults).toHaveLength(2);
      expect(result.stepResults[0].success).toBe(true);
      expect(result.stepResults[1].success).toBe(true);
      expect(result.metadata.totalSteps).toBe(2);
      expect(result.metadata.executedSteps).toBe(2);
      expect(result.metadata.skippedSteps).toBe(0);
      expect(result.metadata.failedSteps).toBe(0);
    });

    it('should pass resolved inputs between steps', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime((input) => {
        if (input.taskName === 'task-a') {
          return { success: true, output: { value: 'data-from-A' } };
        }
        return { success: true, output: { value: 'data-from-B' } };
      });

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      await executor.execute({
        workflowName: 'two-step',
        parameters: { accountId: 'acc-001' },
      });

      const calls = (runtime.executeTask as any).mock.calls;
      // Second call should receive resolved output from first
      expect(calls[1][0].parameters.fromA).toBe('data-from-A');
    });

    it('should resolve workflow output', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime((input) => ({
        success: true,
        output: { value: `output-${input.taskName}` },
      }));

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'two-step',
        parameters: { accountId: 'acc-001' },
      });

      expect(result.output.finalResult).toBe('output-task-b');
    });

    it('should return error for unknown workflow', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime();
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'nonexistent',
        parameters: {},
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Workflow not found');
    });
  });

  // ========================================================================
  // execute — input validation
  // ========================================================================

  describe('execute() — input validation', () => {
    it('should fail when required input is missing', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime();
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'two-step',
        parameters: {}, // missing accountId
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Missing required input: accountId');
    });

    it('should apply input defaults', async () => {
      setupWorkflowFiles({ defaults: DEFAULTS_YAML });
      const runtime = createMockRuntime();
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      await executor.execute({
        workflowName: 'defaults-pipeline',
        parameters: {},
      });

      const calls = (runtime.executeTask as any).mock.calls;
      expect(calls[0][0].parameters.batchSize).toBe(100);
      expect(calls[0][0].parameters.status).toBe('pending');
    });

    it('should allow overriding defaults', async () => {
      setupWorkflowFiles({ defaults: DEFAULTS_YAML });
      const runtime = createMockRuntime();
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      await executor.execute({
        workflowName: 'defaults-pipeline',
        parameters: { batchSize: 50 },
      });

      const calls = (runtime.executeTask as any).mock.calls;
      expect(calls[0][0].parameters.batchSize).toBe(50);
    });
  });

  // ========================================================================
  // execute — conditions
  // ========================================================================

  describe('execute() — conditions', () => {
    it('should skip step when condition is false', async () => {
      setupWorkflowFiles({ condition: CONDITION_YAML });
      const runtime = createMockRuntime(() => ({
        success: true,
        output: { data: 'ok' },
      }));

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'condition-pipeline',
        parameters: { runOptional: false },
      });

      expect(result.stepResults[1].skipped).toBe(true);
      expect(result.metadata.skippedSteps).toBe(1);
      // Only 1 call to runtime (the always step)
      expect(runtime.executeTask).toHaveBeenCalledTimes(1);
    });

    it('should execute step when condition is true', async () => {
      setupWorkflowFiles({ condition: CONDITION_YAML });
      const runtime = createMockRuntime(() => ({
        success: true,
        output: { data: 'ok' },
      }));

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'condition-pipeline',
        parameters: { runOptional: true },
      });

      expect(result.stepResults[1].skipped).toBe(false);
      expect(result.metadata.executedSteps).toBe(2);
      expect(runtime.executeTask).toHaveBeenCalledTimes(2);
    });
  });

  // ========================================================================
  // execute — dependency cascade
  // ========================================================================

  describe('execute() — dependency cascade', () => {
    it('should skip dependent step when dependency fails', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime((input) => {
        if (input.taskName === 'task-a') {
          return { success: false, output: null, errors: ['step-a failed'] };
        }
        return { success: true, output: { value: 'ok' } };
      });

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'two-step',
        parameters: { accountId: 'acc-001' },
      });

      expect(result.success).toBe(false);
      expect(result.stepResults[0].success).toBe(false);
      expect(result.stepResults[1].skipped).toBe(true);
      expect(result.metadata.failedSteps).toBe(1);
      expect(result.metadata.skippedSteps).toBe(1);
    });
  });

  // ========================================================================
  // execute — retry
  // ========================================================================

  describe('execute() — retry', () => {
    it('should retry and succeed on second attempt', async () => {
      setupWorkflowFiles({ retry: RETRY_YAML });
      let callCount = 0;
      const runtime = createMockRuntime(() => {
        callCount++;
        if (callCount === 1) {
          return { success: false, output: null, errors: ['temporary failure'] };
        }
        return { success: true, output: { data: 'recovered' } };
      });

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'retry-pipeline',
        parameters: {},
      });

      expect(result.success).toBe(true);
      expect(result.stepResults[0].success).toBe(true);
      expect(result.stepResults[0].output.data).toBe('recovered');
      // 1 initial + 1 retry
      expect(runtime.executeTask).toHaveBeenCalledTimes(2);
    });

    it('should exhaust retries and fail', async () => {
      setupWorkflowFiles({ retry: RETRY_YAML });
      const runtime = createMockRuntime(() => ({
        success: false,
        output: null,
        errors: ['persistent failure'],
      }));

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'retry-pipeline',
        parameters: {},
      });

      expect(result.success).toBe(false);
      expect(result.stepResults[0].success).toBe(false);
      // 1 initial + 2 retries
      expect(runtime.executeTask).toHaveBeenCalledTimes(3);
    });
  });

  // ========================================================================
  // execute — verbose logging
  // ========================================================================

  describe('execute() — verbose', () => {
    it('should log step execution in verbose mode', async () => {
      setupWorkflowFiles({ 'two-step': TWO_STEP_YAML });
      const runtime = createMockRuntime(() => ({
        success: true,
        output: { value: 'ok' },
      }));

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        verbose: true,
        sleepFn: noopSleep,
      });
      await executor.initialize();

      await executor.execute({
        workflowName: 'two-step',
        parameters: { accountId: 'acc-001' },
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Executing step "step-a"'),
      );
      logSpy.mockRestore();
    });
  });

  // ========================================================================
  // execute — billing pipeline end-to-end simulation
  // ========================================================================

  describe('execute() — billing pipeline simulation', () => {
    const BILLING_YAML = `
name: billing-pipeline
version: 1.0.0
description: "Billing pipeline"
input:
  type: object
  required:
    - accountId
  properties:
    accountId:
      type: string
    patientId:
      type: string
    insurerId:
      type: string
steps:
  - id: generate
    task: generate-tiss-guide
    agent: billing-agent
    input:
      accountId: "{{input.accountId}}"
      patientId: "{{input.patientId}}"
    output:
      guideXml: "{{result.xml}}"
      guideNumber: "{{result.guideNumber}}"
  - id: validate
    task: validate-tiss
    agent: billing-agent
    dependsOn: [generate]
    input:
      xml: "{{steps.generate.output.guideXml}}"
      schemaVersion: "3.05.00"
    output:
      isValid: "{{result.isValid}}"
      errors: "{{result.errors}}"
  - id: audit
    task: audit-account
    agent: auditor-agent
    dependsOn: [validate]
    condition: "{{steps.validate.output.isValid}}"
    input:
      accountId: "{{input.accountId}}"
      guideXml: "{{steps.generate.output.guideXml}}"
    output:
      auditScore: "{{result.score}}"
  - id: score-risk
    task: score-glosa-risk
    agent: auditor-agent
    dependsOn: [audit]
    input:
      accountId: "{{input.accountId}}"
    output:
      riskScore: "{{result.riskScore}}"
      recommendation: "{{result.recommendation}}"
output:
  type: object
  properties:
    guideNumber:
      type: string
      source: "{{steps.generate.output.guideNumber}}"
    validationPassed:
      type: boolean
      source: "{{steps.validate.output.isValid}}"
    riskScore:
      type: number
      source: "{{steps.score-risk.output.riskScore}}"
`;

    it('should execute full billing pipeline successfully', async () => {
      setupWorkflowFiles({ billing: BILLING_YAML });
      const runtime = createMockRuntime((input) => {
        switch (input.taskName) {
          case 'generate-tiss-guide':
            return {
              success: true,
              output: { xml: '<tiss>guide</tiss>', guideNumber: 'G-100' },
            };
          case 'validate-tiss':
            return {
              success: true,
              output: { isValid: true, errors: [] },
            };
          case 'audit-account':
            return {
              success: true,
              output: { score: 0.95, issues: [] },
            };
          case 'score-glosa-risk':
            return {
              success: true,
              output: { riskScore: 0.1, recommendation: 'send' },
            };
          default:
            return { success: false, output: null, errors: ['Unknown task'] };
        }
      });

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'billing-pipeline',
        parameters: { accountId: 'acc-001', patientId: 'pat-123' },
      });

      expect(result.success).toBe(true);
      expect(result.stepResults).toHaveLength(4);
      expect(result.output.guideNumber).toBe('G-100');
      expect(result.output.validationPassed).toBe(true);
      expect(result.output.riskScore).toBe(0.1);
      expect(result.metadata.executedSteps).toBe(4);
      expect(result.errors).toEqual([]);
    });

    it('should skip audit & scoring when validation fails', async () => {
      setupWorkflowFiles({ billing: BILLING_YAML });
      const runtime = createMockRuntime((input) => {
        switch (input.taskName) {
          case 'generate-tiss-guide':
            return {
              success: true,
              output: { xml: '<bad/>', guideNumber: 'G-101' },
            };
          case 'validate-tiss':
            return {
              success: true,
              output: { isValid: false, errors: ['invalid schema'] },
            };
          default:
            return { success: true, output: {} };
        }
      });

      const executor = new PipelineExecutor(runtime, {
        workflowsPath: '/test/workflows',
        sleepFn: noopSleep,
      });
      await executor.initialize();

      const result = await executor.execute({
        workflowName: 'billing-pipeline',
        parameters: { accountId: 'acc-001' },
      });

      // Pipeline succeeds (no step failures — audit/scoring are skipped, not failed)
      expect(result.stepResults[0].success).toBe(true); // generate
      expect(result.stepResults[1].success).toBe(true); // validate
      expect(result.stepResults[2].skipped).toBe(true); // audit — condition not met
      expect(result.stepResults[3].skipped).toBe(true); // score-risk — dep skipped
      expect(result.metadata.skippedSteps).toBe(2);
      expect(result.output.validationPassed).toBe(false);
    });
  });
});
