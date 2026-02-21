/**
 * Unit tests for parallel-executor module
 *
 * Tests the ParallelExecutor class that manages concurrent phase execution
 * with configurable concurrency limits.
 */

jest.mock('chalk', () => ({
  yellow: (s) => s,
  red: (s) => s,
  gray: (s) => s,
}));

const ParallelExecutor = require('../../../.aios-core/core/orchestration/parallel-executor');

describe('ParallelExecutor', () => {
  let executor;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    executor = new ParallelExecutor();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets default maxConcurrency to 3', () => {
      expect(executor.maxConcurrency).toBe(3);
    });

    test('initializes empty runningTasks map', () => {
      expect(executor.runningTasks).toBeInstanceOf(Map);
      expect(executor.runningTasks.size).toBe(0);
    });
  });

  // ============================================================
  // executeParallel
  // ============================================================
  describe('executeParallel', () => {
    test('executes all phases successfully', async () => {
      const phases = [
        { phase: 'discovery' },
        { phase: 'analysis' },
      ];
      const executePhase = jest.fn().mockResolvedValue({ ok: true });

      const result = await executor.executeParallel(phases, executePhase);

      expect(result.results).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.summary).toEqual({ total: 2, success: 2, failed: 0 });
      expect(executePhase).toHaveBeenCalledTimes(2);
    });

    test('handles phase failures via internal catch', async () => {
      const phases = [
        { phase: 'good' },
        { phase: 'bad' },
      ];
      const executePhase = jest.fn()
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Phase failed'));

      const result = await executor.executeParallel(phases, executePhase);

      // Internal try/catch catches errors, marks tasks as failed in runningTasks
      const status = executor.getStatus();
      expect(status['bad'].status).toBe('failed');
      expect(status['bad'].error).toBe('Phase failed');
      expect(status['good'].status).toBe('completed');
    });

    test('all phases fail - marks all as failed in runningTasks', async () => {
      const phases = [{ phase: 'a' }, { phase: 'b' }];
      const executePhase = jest.fn().mockRejectedValue(new Error('fail'));

      await executor.executeParallel(phases, executePhase);

      const status = executor.getStatus();
      expect(status['a'].status).toBe('failed');
      expect(status['b'].status).toBe('failed');
    });

    test('uses custom maxConcurrency from options', async () => {
      const phases = [{ phase: 'a' }];
      const executePhase = jest.fn().mockResolvedValue({});

      await executor.executeParallel(phases, executePhase, { maxConcurrency: 5 });

      expect(executePhase).toHaveBeenCalledTimes(1);
    });

    test('uses step key when phase key is absent', async () => {
      const phases = [{ step: 'step-1' }];
      const executePhase = jest.fn().mockResolvedValue({ done: true });

      await executor.executeParallel(phases, executePhase);

      const status = executor.getStatus();
      expect(status['step-1']).toBeDefined();
      expect(status['step-1'].status).toBe('completed');
    });

    test('tracks running tasks during execution', async () => {
      let capturedStatus;
      const phases = [{ phase: 'check' }];
      const executePhase = jest.fn().mockImplementation(async () => {
        capturedStatus = executor.getStatus();
        return {};
      });

      await executor.executeParallel(phases, executePhase);

      expect(capturedStatus['check'].status).toBe('running');
    });

    test('updates task status on completion', async () => {
      const phases = [{ phase: 'done' }];
      const executePhase = jest.fn().mockResolvedValue({ result: 1 });

      await executor.executeParallel(phases, executePhase);

      const status = executor.getStatus();
      expect(status['done'].status).toBe('completed');
      expect(status['done'].result).toEqual({ result: 1 });
    });

    test('updates task status on failure', async () => {
      const phases = [{ phase: 'err' }];
      const executePhase = jest.fn().mockRejectedValue(new Error('boom'));

      await executor.executeParallel(phases, executePhase);

      const status = executor.getStatus();
      expect(status['err'].status).toBe('failed');
      expect(status['err'].error).toBe('boom');
    });

    test('handles empty phases array', async () => {
      const executePhase = jest.fn();

      const result = await executor.executeParallel([], executePhase);

      expect(result.results).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.summary).toEqual({ total: 0, success: 0, failed: 0 });
      expect(executePhase).not.toHaveBeenCalled();
    });

    test('logs execution start', async () => {
      const phases = [{ phase: 'a' }, { phase: 'b' }, { phase: 'c' }];
      const executePhase = jest.fn().mockResolvedValue({});

      await executor.executeParallel(phases, executePhase);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('3 phases in parallel')
      );
    });

    test('logs completion summary with counts', async () => {
      const phases = [{ phase: 'a' }, { phase: 'b' }];
      const executePhase = jest.fn().mockResolvedValue({});

      await executor.executeParallel(phases, executePhase);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Completed')
      );
    });

    test('logs completion summary', async () => {
      const phases = [{ phase: 'x' }];
      const executePhase = jest.fn().mockResolvedValue({});

      await executor.executeParallel(phases, executePhase);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('1 success, 0 failed')
      );
    });
  });

  // ============================================================
  // getStatus
  // ============================================================
  describe('getStatus', () => {
    test('returns empty object when no tasks', () => {
      expect(executor.getStatus()).toEqual({});
    });

    test('returns task statuses', () => {
      executor.runningTasks.set('a', { status: 'running', startTime: 1000 });
      executor.runningTasks.set('b', { status: 'completed', startTime: 1000, endTime: 2000 });

      const status = executor.getStatus();

      expect(status.a.status).toBe('running');
      expect(status.b.status).toBe('completed');
    });

    test('calculates duration for completed tasks', () => {
      executor.runningTasks.set('task', {
        status: 'completed',
        startTime: 1000,
        endTime: 3500,
      });

      const status = executor.getStatus();
      expect(status.task.duration).toBe(2500);
    });

    test('does not calculate duration for running tasks', () => {
      executor.runningTasks.set('task', {
        status: 'running',
        startTime: 1000,
      });

      const status = executor.getStatus();
      expect(status.task.duration).toBeUndefined();
    });

    test('returns copies not references', () => {
      executor.runningTasks.set('task', { status: 'running' });

      const status = executor.getStatus();
      status.task.status = 'modified';

      expect(executor.runningTasks.get('task').status).toBe('running');
    });
  });

  // ============================================================
  // hasRunningTasks
  // ============================================================
  describe('hasRunningTasks', () => {
    test('returns false when no tasks', () => {
      expect(executor.hasRunningTasks()).toBe(false);
    });

    test('returns true when a task is running', () => {
      executor.runningTasks.set('a', { status: 'running' });
      expect(executor.hasRunningTasks()).toBe(true);
    });

    test('returns false when all tasks completed', () => {
      executor.runningTasks.set('a', { status: 'completed' });
      executor.runningTasks.set('b', { status: 'failed' });
      expect(executor.hasRunningTasks()).toBe(false);
    });
  });

  // ============================================================
  // waitForCompletion
  // ============================================================
  describe('waitForCompletion', () => {
    test('resolves immediately when no running tasks', async () => {
      await expect(executor.waitForCompletion()).resolves.toBeUndefined();
    });

    test('throws on timeout', async () => {
      executor.runningTasks.set('stuck', { status: 'running' });

      await expect(executor.waitForCompletion(50)).rejects.toThrow(
        'Timeout waiting for parallel tasks to complete'
      );
    });
  });

  // ============================================================
  // cancelAll
  // ============================================================
  describe('cancelAll', () => {
    test('marks running tasks as cancelled', () => {
      executor.runningTasks.set('a', { status: 'running', startTime: 1000 });
      executor.runningTasks.set('b', { status: 'running', startTime: 2000 });

      executor.cancelAll();

      expect(executor.runningTasks.get('a').status).toBe('cancelled');
      expect(executor.runningTasks.get('b').status).toBe('cancelled');
      expect(executor.runningTasks.get('a').cancelledAt).toBeDefined();
    });

    test('does not affect completed tasks', () => {
      executor.runningTasks.set('done', { status: 'completed' });
      executor.runningTasks.set('err', { status: 'failed' });

      executor.cancelAll();

      expect(executor.runningTasks.get('done').status).toBe('completed');
      expect(executor.runningTasks.get('err').status).toBe('failed');
    });

    test('preserves original startTime on cancelled tasks', () => {
      executor.runningTasks.set('a', { status: 'running', startTime: 5000 });

      executor.cancelAll();

      expect(executor.runningTasks.get('a').startTime).toBe(5000);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    test('removes all tasks', () => {
      executor.runningTasks.set('a', { status: 'completed' });
      executor.runningTasks.set('b', { status: 'running' });

      executor.clear();

      expect(executor.runningTasks.size).toBe(0);
    });
  });

  // ============================================================
  // setMaxConcurrency
  // ============================================================
  describe('setMaxConcurrency', () => {
    test('sets valid concurrency', () => {
      executor.setMaxConcurrency(5);
      expect(executor.maxConcurrency).toBe(5);
    });

    test('clamps minimum to 1', () => {
      executor.setMaxConcurrency(0);
      expect(executor.maxConcurrency).toBe(1);

      executor.setMaxConcurrency(-5);
      expect(executor.maxConcurrency).toBe(1);
    });

    test('clamps maximum to 10', () => {
      executor.setMaxConcurrency(100);
      expect(executor.maxConcurrency).toBe(10);
    });
  });

  // ============================================================
  // getSummary
  // ============================================================
  describe('getSummary', () => {
    test('returns zeros when no tasks', () => {
      const summary = executor.getSummary();

      expect(summary).toEqual({
        total: 0,
        completed: 0,
        failed: 0,
        running: 0,
        averageDuration: 0,
      });
    });

    test('counts tasks by status', () => {
      executor.runningTasks.set('a', { status: 'completed', startTime: 1000, endTime: 1100 });
      executor.runningTasks.set('b', { status: 'failed' });
      executor.runningTasks.set('c', { status: 'running' });
      executor.runningTasks.set('d', { status: 'completed', startTime: 1000, endTime: 1200 });

      const summary = executor.getSummary();

      expect(summary.total).toBe(4);
      expect(summary.completed).toBe(2);
      expect(summary.failed).toBe(1);
      expect(summary.running).toBe(1);
    });

    test('calculates average duration for completed tasks', () => {
      executor.runningTasks.set('a', { status: 'completed', startTime: 1000, endTime: 1100 });
      executor.runningTasks.set('b', { status: 'completed', startTime: 1000, endTime: 1300 });

      const summary = executor.getSummary();
      expect(summary.averageDuration).toBe(200);
    });

    test('averageDuration is 0 when no completed tasks', () => {
      executor.runningTasks.set('a', { status: 'running' });
      executor.runningTasks.set('b', { status: 'failed' });

      const summary = executor.getSummary();
      expect(summary.averageDuration).toBe(0);
    });

    test('ignores cancelled tasks in counts', () => {
      executor.runningTasks.set('a', { status: 'cancelled' });

      const summary = executor.getSummary();
      expect(summary.total).toBe(1);
      expect(summary.completed).toBe(0);
      expect(summary.failed).toBe(0);
      expect(summary.running).toBe(0);
    });
  });
});
