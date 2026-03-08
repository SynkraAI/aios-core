/**
 * Cognitive Load Balancer Tests
 * Story ORCH-6 - Intelligent task distribution based on agent cognitive capacity
 * @version 1.1.0
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const CognitiveLoadBalancer = require('../../../.aiox-core/core/orchestration/cognitive-load-balancer');
const {
  AgentStatus,
  TaskStatus,
  TaskPriority,
  ThrottlePolicy,
  AFFINITY_WEIGHTS,
  OVERLOAD_THRESHOLD,
} = CognitiveLoadBalancer;

describe('CognitiveLoadBalancer', () => {
  let balancer;
  let tempDir;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `clb-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    fs.mkdirSync(tempDir, { recursive: true });
    balancer = new CognitiveLoadBalancer({ projectRoot: tempDir, persistMetrics: false });
  });

  afterEach(() => {
    balancer.removeAllListeners();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const b = new CognitiveLoadBalancer();
      expect(b.throttlePolicy).toBe(ThrottlePolicy.QUEUE_WHEN_FULL);
      expect(b.maxQueueSize).toBe(1000);
      expect(b.agents.size).toBe(0);
      expect(b.tasks.size).toBe(0);
      expect(b.queue).toEqual([]);
    });

    it('should accept custom options', () => {
      const b = new CognitiveLoadBalancer({
        projectRoot: '/custom/path',
        throttlePolicy: ThrottlePolicy.REJECT_WHEN_FULL,
        maxQueueSize: 50,
        persistMetrics: false,
      });
      expect(b.projectRoot).toBe('/custom/path');
      expect(b.throttlePolicy).toBe(ThrottlePolicy.REJECT_WHEN_FULL);
      expect(b.maxQueueSize).toBe(50);
      expect(b.persistMetrics).toBe(false);
    });

    it('should extend EventEmitter', () => {
      expect(balancer).toBeInstanceOf(require('events').EventEmitter);
    });

    it('should initialize metrics with startTime', () => {
      expect(balancer.metrics.startTime).toBeLessThanOrEqual(Date.now());
      expect(balancer.metrics.totalSubmitted).toBe(0);
    });
  });

  describe('registerAgent', () => {
    it('should register agent with default profile', () => {
      const profile = balancer.registerAgent('agent-1');
      expect(profile.id).toBe('agent-1');
      expect(profile.maxLoad).toBe(100);
      expect(profile.status).toBe(AgentStatus.AVAILABLE);
    });

    it('should register agent with custom profile', () => {
      const profile = balancer.registerAgent('agent-2', { maxLoad: 50, specialties: ['frontend'], processingSpeed: 1.5 });
      expect(profile.maxLoad).toBe(50);
      expect(profile.specialties).toEqual(['frontend']);
    });

    it('should emit agent:registered event', () => {
      const handler = jest.fn();
      balancer.on('agent:registered', handler);
      balancer.registerAgent('agent-3');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should throw on empty agentId', () => {
      expect(() => balancer.registerAgent('')).toThrow('agentId must be a non-empty string');
    });

    it('should throw on non-string agentId', () => {
      expect(() => balancer.registerAgent(null)).toThrow('agentId must be a non-empty string');
      expect(() => balancer.registerAgent(123)).toThrow('agentId must be a non-empty string');
    });

    it('should throw on non-object profile', () => {
      expect(() => balancer.registerAgent('agent-1', 'invalid')).toThrow('profile must be an object or undefined');
      expect(() => balancer.registerAgent('agent-1', 42)).toThrow('profile must be an object or undefined');
    });

    it('should overwrite existing agent on re-registration', () => {
      balancer.registerAgent('agent-1', { maxLoad: 50 });
      balancer.registerAgent('agent-1', { maxLoad: 200 });
      expect(balancer.agents.get('agent-1').maxLoad).toBe(200);
    });

    it('should process queue when new agent registers', () => {
      balancer.submitTask({ id: 'wait-1', complexity: 5 });
      balancer.submitTask({ id: 'wait-2', complexity: 3 });
      expect(balancer.queue).toHaveLength(2);

      balancer.registerAgent('new-agent', { maxLoad: 100 });

      expect(balancer.queue).toHaveLength(0);
      expect(balancer.tasks.get('wait-1').assignedTo).toBe('new-agent');
      expect(balancer.tasks.get('wait-2').assignedTo).toBe('new-agent');
    });
  });

  describe('unregisterAgent', () => {
    it('should unregister agent and return orphaned task IDs', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      const orphaned = balancer.unregisterAgent('agent-1');
      expect(orphaned).toContain('task-1');
      expect(balancer.agents.has('agent-1')).toBe(false);
    });

    it('should re-queue orphaned tasks', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      balancer.unregisterAgent('agent-1');
      const task = balancer.tasks.get('task-1');
      expect(task.status).toBe(TaskStatus.QUEUED);
      expect(task.assignedTo).toBeNull();
    });

    it('should throw on unknown agent', () => {
      expect(() => balancer.unregisterAgent('unknown')).toThrow("Agent 'unknown' not found");
    });

    it('should reassign orphaned tasks to remaining agents', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.registerAgent('agent-2', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      if (balancer.tasks.get('task-1').assignedTo !== 'agent-1') {
        balancer.assignTask('task-1', 'agent-1');
      }
      balancer.unregisterAgent('agent-1');
      expect(balancer.tasks.get('task-1').assignedTo).toBe('agent-2');
    });
  });

  describe('submitTask', () => {
    beforeEach(() => {
      balancer.registerAgent('agent-1', { maxLoad: 100, specialties: ['backend'] });
    });

    it('should submit and auto-assign a task', () => {
      const result = balancer.submitTask({ type: 'coding', complexity: 5 });
      expect(result.assignedTo).toBe('agent-1');
      expect(result.status).toBe(TaskStatus.ASSIGNED);
    });

    it('should auto-generate task ID when omitted', () => {
      const result = balancer.submitTask({ complexity: 3 });
      expect(result.taskId).toMatch(/^task-/);
    });

    it('should use provided task ID', () => {
      const result = balancer.submitTask({ id: 'my-task-1', complexity: 3 });
      expect(result.taskId).toBe('my-task-1');
    });

    it('should reject duplicate task IDs', () => {
      balancer.submitTask({ id: 'dup-task', complexity: 3 });
      expect(() => balancer.submitTask({ id: 'dup-task', complexity: 5 })).toThrow("Task 'dup-task' already exists");
    });

    it('should emit task:submitted event', () => {
      const handler = jest.fn();
      balancer.on('task:submitted', handler);
      balancer.submitTask({ id: 'evt-task', complexity: 3 });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should throw on non-object task input', () => {
      expect(() => balancer.submitTask(null)).toThrow('Task must be a non-null object');
      expect(() => balancer.submitTask('string')).toThrow('Task must be a non-null object');
    });

    it('should clamp complexity to range 1-10', () => {
      balancer.submitTask({ id: 'low', complexity: -5 });
      balancer.submitTask({ id: 'high', complexity: 999 });
      expect(balancer.tasks.get('low').complexity).toBe(1);
      expect(balancer.tasks.get('high').complexity).toBe(10);
    });

    it('should increment totalSubmitted metric', () => {
      balancer.submitTask({ complexity: 3 });
      balancer.submitTask({ complexity: 3 });
      expect(balancer.metrics.totalSubmitted).toBe(2);
    });
  });

  describe('assignTask', () => {
    it('should manually assign task to specific agent', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.registerAgent('agent-2', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      const result = balancer.assignTask('task-1', 'agent-2');
      expect(result.assignedTo).toBe('agent-2');
    });

    it('should throw on unknown task', () => {
      balancer.registerAgent('agent-1');
      expect(() => balancer.assignTask('unknown', 'agent-1')).toThrow("Task 'unknown' not found");
    });

    it('should throw on unknown agent', () => {
      balancer.registerAgent('agent-1');
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      expect(() => balancer.assignTask('task-1', 'unknown')).toThrow("Agent 'unknown' not found");
    });

    it('should throw when assigning a completed task', async () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.registerAgent('agent-2', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1');
      expect(() => balancer.assignTask('task-1', 'agent-2')).toThrow("Task 'task-1' is already completed");
    });

    it('should throw when assigning a failed task', async () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.registerAgent('agent-2', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.failTask('task-1', 'error');
      expect(() => balancer.assignTask('task-1', 'agent-2')).toThrow("Task 'task-1' is already failed");
    });

    it('should move task from one agent to another', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.registerAgent('agent-2', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      balancer.assignTask('task-1', 'agent-1');
      balancer.assignTask('task-1', 'agent-2');
      expect(balancer.agents.get('agent-1').activeTasks).not.toContain('task-1');
      expect(balancer.agents.get('agent-2').activeTasks).toContain('task-1');
    });
  });

  describe('completeTask', () => {
    beforeEach(() => { balancer.registerAgent('agent-1', { maxLoad: 100 }); });

    it('should mark task as completed', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1', { output: 'done' });
      const task = balancer.tasks.get('task-1');
      expect(task.status).toBe(TaskStatus.COMPLETED);
      expect(task.result).toEqual({ output: 'done' });
    });

    it('should free agent capacity', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 8 });
      expect(balancer.agents.get('agent-1').currentLoad).toBe(8);
      await balancer.completeTask('task-1');
      expect(balancer.agents.get('agent-1').currentLoad).toBe(0);
    });

    it('should emit task:completed event', async () => {
      const handler = jest.fn();
      balancer.on('task:completed', handler);
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1', 'result-data');
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ taskId: 'task-1', result: 'result-data' }));
    });

    it('should throw on unknown task', async () => {
      await expect(balancer.completeTask('unknown')).rejects.toThrow("Task 'unknown' not found");
    });

    it('should throw when completing an already completed task', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1');
      await expect(balancer.completeTask('task-1')).rejects.toThrow("Task 'task-1' is already completed");
    });

    it('should throw when completing an already failed task', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.failTask('task-1', 'error');
      await expect(balancer.completeTask('task-1')).rejects.toThrow("Task 'task-1' is already failed");
    });

    it('should return completion time info', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      const result = await balancer.completeTask('task-1');
      expect(result.taskId).toBe('task-1');
      expect(result.completionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('failTask', () => {
    beforeEach(() => { balancer.registerAgent('agent-1', { maxLoad: 100 }); });

    it('should mark task as failed', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.failTask('task-1', 'Something went wrong');
      const task = balancer.tasks.get('task-1');
      expect(task.status).toBe(TaskStatus.FAILED);
      expect(task.error).toBe('Something went wrong');
    });

    it('should accept Error objects', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.failTask('task-1', new Error('Detailed error'));
      expect(balancer.tasks.get('task-1').error).toBe('Detailed error');
    });

    it('should free agent capacity', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 7 });
      await balancer.failTask('task-1', 'fail');
      expect(balancer.agents.get('agent-1').currentLoad).toBe(0);
    });

    it('should throw on unknown task', async () => {
      await expect(balancer.failTask('unknown')).rejects.toThrow("Task 'unknown' not found");
    });

    it('should throw when failing an already failed task', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.failTask('task-1', 'first');
      await expect(balancer.failTask('task-1', 'second')).rejects.toThrow("Task 'task-1' is already failed");
    });

    it('should throw when failing an already completed task', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1');
      await expect(balancer.failTask('task-1', 'error')).rejects.toThrow("Task 'task-1' is already completed");
    });

    it('should use default error message when none provided', async () => {
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.failTask('task-1');
      expect(balancer.tasks.get('task-1').error).toBe('Unknown error');
    });
  });

  describe('getAgentLoad', () => {
    it('should return 0% for empty agent', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      expect(balancer.getAgentLoad('agent-1')).toBe(0);
    });

    it('should return correct load percentage', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 10 });
      expect(balancer.getAgentLoad('agent-1')).toBe(10);
    });

    it('should cap at 100%', () => {
      balancer.registerAgent('agent-1', { maxLoad: 10 });
      balancer.setThrottlePolicy(ThrottlePolicy.SPILLOVER);
      balancer.submitTask({ id: 'task-1', complexity: 10 });
      balancer.submitTask({ id: 'task-2', complexity: 10 });
      expect(balancer.getAgentLoad('agent-1')).toBe(100);
    });

    it('should throw on unknown agent', () => {
      expect(() => balancer.getAgentLoad('unknown')).toThrow("Agent 'unknown' not found");
    });
  });

  describe('getOptimalAgent', () => {
    it('should return null when no agents registered', () => {
      expect(balancer.getOptimalAgent({ complexity: 5 })).toBeNull();
    });

    it('should prefer agent with matching specialties', () => {
      balancer.registerAgent('generalist', { maxLoad: 100 });
      balancer.registerAgent('specialist', { maxLoad: 100, specialties: ['testing'] });
      const result = balancer.getOptimalAgent({ complexity: 5, requiredSpecialties: ['testing'] });
      expect(result.agentId).toBe('specialist');
    });
  });

  describe('Affinity scoring', () => {
    it('should weight specialty match at 40%', () => { expect(AFFINITY_WEIGHTS.SPECIALTY).toBe(0.4); });
    it('should weight load inverse at 30%', () => { expect(AFFINITY_WEIGHTS.LOAD_INVERSE).toBe(0.3); });
    it('should weight speed at 20%', () => { expect(AFFINITY_WEIGHTS.SPEED).toBe(0.2); });
    it('should weight success rate at 10%', () => { expect(AFFINITY_WEIGHTS.SUCCESS_RATE).toBe(0.1); });

    it('should calculate correct success rate with history', async () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 't1', complexity: 2 }); await balancer.completeTask('t1');
      balancer.submitTask({ id: 't2', complexity: 2 }); await balancer.completeTask('t2');
      balancer.submitTask({ id: 't3', complexity: 2 }); await balancer.completeTask('t3');
      balancer.submitTask({ id: 't4', complexity: 2 }); await balancer.failTask('t4', 'error');
      expect(balancer._getSuccessRate(balancer.agents.get('agent-1'))).toBe(0.75);
    });
  });

  describe('Throttle policies', () => {
    it('should accept valid policies', () => {
      balancer.setThrottlePolicy(ThrottlePolicy.QUEUE_WHEN_FULL);
      expect(balancer.throttlePolicy).toBe('queue-when-full');
    });

    it('should throw on invalid policy', () => {
      expect(() => balancer.setThrottlePolicy('invalid')).toThrow("Invalid throttle policy 'invalid'");
    });

    it('should queue tasks when agents are full', () => {
      balancer.registerAgent('small', { maxLoad: 5 });
      balancer.submitTask({ id: 'fill', complexity: 5 });
      const result = balancer.submitTask({ id: 'overflow', complexity: 5 });
      expect(result.status).toBe(TaskStatus.QUEUED);
    });

    it('should reject tasks under reject-when-full', () => {
      balancer.setThrottlePolicy(ThrottlePolicy.REJECT_WHEN_FULL);
      balancer.registerAgent('tiny', { maxLoad: 3 });
      balancer.submitTask({ id: 'fill', complexity: 3 });
      const result = balancer.submitTask({ id: 'rejected', complexity: 3 });
      expect(result.status).toBe(TaskStatus.FAILED);
    });

    it('should spillover to overloaded agent', () => {
      balancer.setThrottlePolicy(ThrottlePolicy.SPILLOVER);
      balancer.registerAgent('agent-1', { maxLoad: 5 });
      balancer.submitTask({ id: 'fill', complexity: 5 });
      const result = balancer.submitTask({ id: 'spill', complexity: 5 });
      expect(result.status).toBe(TaskStatus.ASSIGNED);
    });
  });

  describe('rebalance', () => {
    it('should move tasks from overloaded to underloaded agents', () => {
      balancer.registerAgent('overloaded', { maxLoad: 10 });
      balancer.registerAgent('idle', { maxLoad: 100 });
      balancer.setThrottlePolicy(ThrottlePolicy.SPILLOVER);
      for (let i = 0; i < 5; i++) {
        balancer.submitTask({ id: `task-${i}`, complexity: 3 });
        balancer.assignTask(`task-${i}`, 'overloaded');
      }
      const result = balancer.rebalance();
      expect(result.movements.length).toBeGreaterThan(0);
      expect(result.movements[0].from).toBe('overloaded');
    });
  });

  describe('getQueue', () => {
    it('should return empty array initially', () => {
      expect(balancer.getQueue()).toEqual([]);
    });

    it('should drain queue when agent registers', () => {
      balancer.submitTask({ id: 'wait-1', complexity: 5 });
      expect(balancer.queue).toHaveLength(1);
      balancer.registerAgent('new-agent', { maxLoad: 100 });
      expect(balancer.queue).toHaveLength(0);
      expect(balancer.tasks.get('wait-1').assignedTo).toBe('new-agent');
    });
  });

  describe('getMetrics', () => {
    it('should return comprehensive metrics snapshot', async () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1');
      const metrics = balancer.getMetrics();
      expect(metrics.totalSubmitted).toBe(1);
      expect(metrics.totalCompleted).toBe(1);
      expect(metrics.activeAgents).toBe(1);
    });
  });

  describe('Agent status transitions', () => {
    it('should start as available', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      expect(balancer.agents.get('agent-1').status).toBe(AgentStatus.AVAILABLE);
    });

    it('should transition to busy when tasks assigned', () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      expect(balancer.agents.get('agent-1').status).toBe(AgentStatus.BUSY);
    });

    it('should transition to overloaded at threshold', () => {
      balancer.registerAgent('agent-1', { maxLoad: 10 });
      balancer.submitTask({ id: 'task-1', complexity: 9 });
      expect(balancer.agents.get('agent-1').status).toBe(AgentStatus.OVERLOADED);
    });

    it('should transition back to available when tasks complete', async () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'task-1', complexity: 5 });
      await balancer.completeTask('task-1');
      expect(balancer.agents.get('agent-1').status).toBe(AgentStatus.AVAILABLE);
    });

    it('should emit agent:overloaded only on status transition', () => {
      const handler = jest.fn();
      balancer.on('agent:overloaded', handler);
      balancer.registerAgent('agent-1', { maxLoad: 10 });
      balancer.setThrottlePolicy(ThrottlePolicy.SPILLOVER);
      balancer.submitTask({ id: 'task-1', complexity: 9 });
      expect(handler).toHaveBeenCalledTimes(1);
      balancer.submitTask({ id: 'task-2', complexity: 5 });
      expect(handler).toHaveBeenCalledTimes(1); // no repeat emission
    });

    it('should emit agent:available only on transition from overloaded', async () => {
      const handler = jest.fn();
      balancer.on('agent:available', handler);
      balancer.registerAgent('agent-1', { maxLoad: 10 });
      balancer.setThrottlePolicy(ThrottlePolicy.SPILLOVER);
      balancer.submitTask({ id: 'task-1', complexity: 9 });
      balancer.submitTask({ id: 'task-2', complexity: 5 });
      await balancer.completeTask('task-1');
      const callCount = handler.mock.calls.length;
      expect(callCount).toBeGreaterThanOrEqual(1);
      await balancer.completeTask('task-2');
      // Should NOT emit again since agent was already non-overloaded
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });

  describe('Metrics persistence', () => {
    it('should persist metrics to disk when enabled', async () => {
      const b = new CognitiveLoadBalancer({ projectRoot: tempDir, persistMetrics: true });
      b.registerAgent('agent-1', { maxLoad: 100 });
      b.submitTask({ id: 'task-1', complexity: 5 });
      await b.completeTask('task-1');
      const metricsPath = path.join(tempDir, '.aiox', 'load-balancer-metrics.json');
      expect(fs.existsSync(metricsPath)).toBe(true);
      b.removeAllListeners();
    });

    it('should not persist when disabled', async () => {
      balancer.registerAgent('agent-1', { maxLoad: 100 });
      balancer.submitTask({ id: 'assigned', complexity: 5 });
      await balancer.completeTask('assigned');
      const metricsPath = path.join(tempDir, '.aiox', 'load-balancer-metrics.json');
      expect(fs.existsSync(metricsPath)).toBe(false);
    });
  });

  describe('Module exports', () => {
    it('should export CognitiveLoadBalancer as default and named', () => {
      expect(CognitiveLoadBalancer.CognitiveLoadBalancer).toBe(CognitiveLoadBalancer);
    });
    it('should export enums', () => {
      expect(AgentStatus.AVAILABLE).toBe('available');
      expect(TaskStatus.COMPLETED).toBe('completed');
      expect(TaskPriority.CRITICAL).toBe('critical');
      expect(ThrottlePolicy.SPILLOVER).toBe('spillover');
    });
    it('should export AFFINITY_WEIGHTS summing to 1.0', () => {
      const total = AFFINITY_WEIGHTS.SPECIALTY + AFFINITY_WEIGHTS.LOAD_INVERSE + AFFINITY_WEIGHTS.SPEED + AFFINITY_WEIGHTS.SUCCESS_RATE;
      expect(total).toBeCloseTo(1.0);
    });
    it('should export OVERLOAD_THRESHOLD', () => { expect(OVERLOAD_THRESHOLD).toBe(85); });
  });

  describe('Edge cases', () => {
    it('should handle submitting tasks with no agents', () => {
      const result = balancer.submitTask({ id: 'orphan', complexity: 5 });
      expect(result.status).toBe(TaskStatus.QUEUED);
    });

    it('should handle completing task with no agent', async () => {
      balancer.submitTask({ id: 'no-agent-task', complexity: 5 });
      const task = balancer.tasks.get('no-agent-task');
      task.status = TaskStatus.ASSIGNED;
      const result = await balancer.completeTask('no-agent-task');
      expect(result.taskId).toBe('no-agent-task');
    });

    it('should handle rapid fire task submission', () => {
      balancer.registerAgent('worker', { maxLoad: 1000 });
      const results = [];
      for (let i = 0; i < 100; i++) { results.push(balancer.submitTask({ complexity: 1 })); }
      expect(results.filter(r => r.status === TaskStatus.ASSIGNED).length).toBe(100);
    });
  });
});
