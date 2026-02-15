/**
 * Tests for Squad Entry Point
 * FinHealth Squad — AIOS Bridge
 *
 * Tests the stdin/stdout JSON protocol, input validation, and main flow.
 * Uses dynamic imports since main() auto-executes at module load.
 *
 * Note: process.exit is mocked as a no-op. Since writeError() is typed as `never`
 * but our mock doesn't actually exit, code may continue past writeError calls.
 * We verify behavior by checking stdout writes and exit calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable } from 'stream';

// ============================================================================
// Helpers
// ============================================================================

function createMockStdin(data: string): Readable {
  const readable = new Readable({ read() {} });
  process.nextTick(() => {
    readable.push(Buffer.from(data));
    readable.push(null);
  });
  return readable;
}

function getAllStdoutJsons(writeSpy: ReturnType<typeof vi.spyOn>): any[] {
  return writeSpy.mock.calls
    .map((call: any) => {
      try { return JSON.parse(call[0]?.toString().trim()); } catch { return null; }
    })
    .filter(Boolean);
}

// ============================================================================
// Tests
// ============================================================================

describe('entry.ts', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let writeSpy: ReturnType<typeof vi.spyOn>;
  let originalStdin: typeof process.stdin;

  beforeEach(() => {
    vi.resetModules();

    // Mock process.exit as no-op (don't throw — avoids cascading through main().catch())
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
    writeSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    originalStdin = process.stdin;

    process.env.OPENAI_API_KEY = 'test-key';
    delete process.env.FINHEALTH_MODEL;
    delete process.env.OPENAI_MODEL;
  });

  afterEach(() => {
    Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
    vi.restoreAllMocks();
  });

  async function runEntry(
    stdinData: string,
    runtimeOverrides?: {
      initError?: Error;
      executeResult?: any;
      executeError?: Error;
      pipelineResult?: any;
      pipelineInitError?: Error;
    },
  ) {
    const mockStdin = createMockStdin(stdinData);
    Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

    const mockExecuteTask = vi.fn();
    if (runtimeOverrides?.executeError) {
      mockExecuteTask.mockRejectedValue(runtimeOverrides.executeError);
    } else {
      mockExecuteTask.mockResolvedValue(
        runtimeOverrides?.executeResult ?? { success: true, output: { data: 'test' } },
      );
    }

    vi.doMock('./runtime/agent-runtime', () => ({
      createRuntime: vi.fn().mockImplementation(async () => {
        if (runtimeOverrides?.initError) {
          throw runtimeOverrides.initError;
        }
        return { executeTask: mockExecuteTask };
      }),
      AgentRuntime: vi.fn(),
    }));

    // Mock PipelineExecutor for workflow mode tests
    const defaultPipelineResult = {
      success: true,
      output: { data: 'pipeline-result' },
      errors: [],
      metadata: { totalSteps: 2, executedSteps: 2, skippedSteps: 0, failedSteps: 0, duration: 100 },
    };
    const mockPipelineExecute = vi.fn().mockResolvedValue(
      runtimeOverrides?.pipelineResult ?? defaultPipelineResult,
    );
    const mockPipelineInit = runtimeOverrides?.pipelineInitError
      ? vi.fn().mockRejectedValue(runtimeOverrides.pipelineInitError)
      : vi.fn().mockResolvedValue(undefined);

    vi.doMock('./pipeline/pipeline-executor', () => ({
      PipelineExecutor: class MockPipelineExecutor {
        initialize = mockPipelineInit;
        execute = mockPipelineExecute;
      },
    }));

    await import('./entry');
    // Wait for main() to complete (it's async)
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { mockExecuteTask, mockPipelineExecute };
  }

  // ========================================================================
  // Input validation
  // ========================================================================

  describe('validateInput', () => {
    it('should error with exit code 2 when input is not an object', async () => {
      await runEntry('"just a string"');
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(false);
      expect(outputs[0].errors[0]).toContain('expected JSON object');
      expect(exitSpy).toHaveBeenCalledWith(2);
    });

    it('should error with exit code 2 when agentId is missing', async () => {
      await runEntry(JSON.stringify({ taskName: 'test', parameters: {} }));
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(false);
      expect(outputs[0].errors[0]).toContain('agentId');
      expect(exitSpy).toHaveBeenCalledWith(2);
    });

    it('should error with exit code 2 when taskName is missing', async () => {
      await runEntry(JSON.stringify({ agentId: 'billing-agent', parameters: {} }));
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(false);
      expect(outputs[0].errors[0]).toContain('taskName');
      expect(exitSpy).toHaveBeenCalledWith(2);
    });

    it('should error with exit code 2 for null input', async () => {
      await runEntry('null');
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(false);
      expect(exitSpy).toHaveBeenCalledWith(2);
    });
  });

  // ========================================================================
  // JSON parsing
  // ========================================================================

  describe('JSON parsing', () => {
    it('should error with exit code 2 on invalid JSON', async () => {
      await runEntry('not valid json');
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(false);
      expect(outputs[0].errors[0]).toContain('Invalid JSON');
      expect(exitSpy).toHaveBeenCalledWith(2);
    });
  });

  // ========================================================================
  // main() flow
  // ========================================================================

  describe('main() flow', () => {
    const validInput = JSON.stringify({
      agentId: 'billing-agent',
      taskName: 'validate-tiss',
      parameters: { xml: '<test/>' },
    });

    it('should execute task and write result on success', async () => {
      const taskResult = { success: true, output: { validated: true } };
      await runEntry(validInput, { executeResult: taskResult });

      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(true);
      expect(outputs[0].output.validated).toBe(true);
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should error with exit code 1 when createRuntime fails', async () => {
      await runEntry(validInput, {
        initError: new Error('Missing OpenAI key'),
      });

      const outputs = getAllStdoutJsons(writeSpy);
      const errorOutput = outputs.find((o: any) => o.errors?.[0]?.includes('AgentRuntime'));
      expect(errorOutput).toBeDefined();
      expect(errorOutput.success).toBe(false);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should error with exit code 1 when executeTask throws', async () => {
      await runEntry(validInput, {
        executeError: new Error('OpenAI rate limit'),
      });

      const outputs = getAllStdoutJsons(writeSpy);
      const errorOutput = outputs.find((o: any) => o.errors?.[0]?.includes('execution failed'));
      expect(errorOutput).toBeDefined();
      expect(errorOutput.success).toBe(false);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should pass correct parameters to executeTask', async () => {
      const { mockExecuteTask } = await runEntry(validInput);

      expect(mockExecuteTask).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'billing-agent',
          taskName: 'validate-tiss',
          parameters: { xml: '<test/>' },
        }),
      );
    });

    it('should default parameters to empty object when not provided', async () => {
      const inputNoParams = JSON.stringify({
        agentId: 'billing-agent',
        taskName: 'validate-tiss',
      });
      const { mockExecuteTask } = await runEntry(inputNoParams);

      expect(mockExecuteTask).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: {},
        }),
      );
    });
  });

  // ========================================================================
  // Output format
  // ========================================================================

  describe('output format', () => {
    it('should write JSON followed by newline', async () => {
      const validInput = JSON.stringify({
        agentId: 'billing-agent',
        taskName: 'test',
        parameters: {},
      });
      await runEntry(validInput);

      const rawCalls = writeSpy.mock.calls;
      const hasNewline = rawCalls.some(
        (call: any) => typeof call[0] === 'string' && call[0].endsWith('\n'),
      );
      expect(hasNewline).toBe(true);
    });

    it('should include metadata with entryPoint in error output', async () => {
      await runEntry('null');
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].metadata?.entryPoint).toBe('finhealth-squad');
    });

    it('should include exitCode in error metadata', async () => {
      await runEntry('"invalid"');
      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].metadata?.exitCode).toBe(2);
    });
  });

  // ========================================================================
  // Workflow mode
  // ========================================================================

  describe('workflow mode', () => {
    it('should route workflow input to PipelineExecutor', async () => {
      const workflowInput = JSON.stringify({
        workflowName: 'billing-pipeline',
        parameters: { accountId: 'acc-001' },
      });
      const { mockPipelineExecute } = await runEntry(workflowInput);

      expect(mockPipelineExecute).toHaveBeenCalledWith({
        workflowName: 'billing-pipeline',
        parameters: { accountId: 'acc-001' },
      });
    });

    it('should write pipeline result to stdout', async () => {
      const workflowInput = JSON.stringify({
        workflowName: 'billing-pipeline',
        parameters: { accountId: 'acc-001' },
      });
      await runEntry(workflowInput);

      const outputs = getAllStdoutJsons(writeSpy);
      expect(outputs[0].success).toBe(true);
      expect(outputs[0].metadata?.mode).toBe('workflow');
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should exit 1 when pipeline fails', async () => {
      const workflowInput = JSON.stringify({
        workflowName: 'billing-pipeline',
        parameters: {},
      });
      await runEntry(workflowInput, {
        pipelineResult: {
          success: false,
          output: {},
          errors: ['Missing required input: accountId'],
          metadata: { totalSteps: 0, executedSteps: 0, skippedSteps: 0, failedSteps: 0, duration: 5 },
        },
      });

      const outputs = getAllStdoutJsons(writeSpy);
      const errorOutput = outputs.find((o: any) => o.errors?.length > 0);
      expect(errorOutput).toBeDefined();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should default parameters to empty object for workflow', async () => {
      const workflowInput = JSON.stringify({
        workflowName: 'billing-pipeline',
      });
      const { mockPipelineExecute } = await runEntry(workflowInput);

      expect(mockPipelineExecute).toHaveBeenCalledWith({
        workflowName: 'billing-pipeline',
        parameters: {},
      });
    });
  });
});
