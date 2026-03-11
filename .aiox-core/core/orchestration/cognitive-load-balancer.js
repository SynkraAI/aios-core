/**
 * Cognitive Load Balancer
 * Story ORCH-6 - Intelligent task distribution based on agent cognitive capacity
 * @module aiox-core/orchestration/cognitive-load-balancer
 * @version 1.0.0
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════

const METRICS_FILENAME = 'load-balancer-metrics.json';
const METRICS_DIR = '.aiox';

/** Default max concurrent tasks per agent */
const DEFAULT_MAX_LOAD = 100;

/** Default processing speed multiplier */
const DEFAULT_PROCESSING_SPEED = 1.0;

/** Overload threshold percentage */
const OVERLOAD_THRESHOLD = 85;

/** Agent status enum */
const AgentStatus = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OVERLOADED: 'overloaded',
  OFFLINE: 'offline',
};

/** Task status enum */
const TaskStatus = {
  QUEUED: 'queued',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/** Task priority enum */
const TaskPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/** Priority weight for scoring */
const PRIORITY_WEIGHTS = {
  [TaskPriority.LOW]: 1,
  [TaskPriority.NORMAL]: 2,
  [TaskPriority.HIGH]: 4,
  [TaskPriority.CRITICAL]: 8,
};

/** Throttle policies */
const ThrottlePolicy = {
  QUEUE_WHEN_FULL: 'queue-when-full',
  REJECT_WHEN_FULL: 'reject-when-full',
  SPILLOVER: 'spillover',
};

/** Affinity weight distribution */
const AFFINITY_WEIGHTS = {
  SPECIALTY: 0.4,
  LOAD_INVERSE: 0.3,
  SPEED: 0.2,
  SUCCESS_RATE: 0.1,
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate a unique task ID
 * @returns {string} Unique task ID
 */
function generateTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a default agent profile
 * @param {string} agentId - Agent identifier
 * @param {Object} overrides - Profile overrides
 * @returns {Object} Complete agent profile
 */
function createAgentProfile(agentId, overrides = {}) {
  return {
    id: agentId,
    maxLoad: overrides.maxLoad ?? DEFAULT_MAX_LOAD,
    currentLoad: 0,
    specialties: overrides.specialties ?? [],
    processingSpeed: overrides.processingSpeed ?? DEFAULT_PROCESSING_SPEED,
    activeTasks: [],
    completedCount: 0,
    failedCount: 0,
    totalCompletionTime: 0,
    avgCompletionTime: 0,
    status: AgentStatus.AVAILABLE,
  };
}

/**
 * Create a task object
 * @param {Object} taskInput - Task input
 * @returns {Object} Normalized task object
 */
function createTask(taskInput) {
  return {
    id: taskInput.id ?? generateTaskId(),
    type: taskInput.type ?? 'general',
    priority: taskInput.priority ?? TaskPriority.NORMAL,
    complexity: Math.min(10, Math.max(1, taskInput.complexity ?? 5)),
    requiredSpecialties: taskInput.requiredSpecialties ?? [],
    assignedTo: null,
    status: TaskStatus.QUEUED,
    submittedAt: Date.now(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                        COGNITIVE LOAD BALANCER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * CognitiveLoadBalancer - Intelligent task distribution based on cognitive capacity
 *
 * Distributes tasks across agents using an affinity scoring algorithm:
 * - Specialty match (40%) - How well agent specialties align with task requirements
 * - Load inverse (30%) - Agents with less load score higher
 * - Processing speed (20%) - Faster agents score higher
 * - Success rate (10%) - Agents with better track records score higher
 *
 * Supports throttle policies for overload scenarios:
 * - queue-when-full: Tasks wait in queue when all agents are at capacity
 * - reject-when-full: Tasks are rejected when no agent can accept them
 * - spillover: Tasks assigned to least-loaded agent regardless of capacity
 *
 * @extends EventEmitter
 */
class CognitiveLoadBalancer extends EventEmitter {
  /**
   * Creates a new CognitiveLoadBalancer instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.projectRoot] - Project root for metrics persistence
   * @param {string} [options.throttlePolicy='queue-when-full'] - Default throttle policy
   * @param {number} [options.maxQueueSize=1000] - Maximum queue size
   * @param {boolean} [options.persistMetrics=true] - Whether to persist metrics to disk
   */
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot ?? process.cwd();
    this.throttlePolicy = options.throttlePolicy ?? ThrottlePolicy.QUEUE_WHEN_FULL;
    this.maxQueueSize = options.maxQueueSize ?? 1000;
    this.persistMetrics = options.persistMetrics ?? true;

    /** @type {Map<string, Object>} Registered agents */
    this.agents = new Map();

    /** @type {Map<string, Object>} All tasks (active + completed) */
    this.tasks = new Map();

    /** @type {Array<string>} Task queue (task IDs in order) */
    this.queue = [];

    /** @type {Object} Runtime metrics */
    this.metrics = {
      totalSubmitted: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalRejected: 0,
      totalRebalanced: 0,
      startTime: Date.now(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          AGENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Register an agent with a cognitive profile
   * @param {string} agentId - Unique agent identifier
   * @param {Object} [profile={}] - Agent cognitive profile
   * @param {number} [profile.maxLoad=100] - Maximum cognitive load capacity
   * @param {string[]} [profile.specialties=[]] - List of specialties
   * @param {number} [profile.processingSpeed=1.0] - Processing speed multiplier
   * @returns {Object} Registered agent profile
   * @throws {Error} If agentId is not a non-empty string
   * @throws {Error} If profile is provided but is not an object
   */
  registerAgent(agentId, profile = {}) {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('agentId must be a non-empty string');
    }

    // Validate profile overrides must be object or undefined
    if (profile !== undefined && profile !== null && typeof profile !== 'object') {
      throw new Error('profile must be an object or undefined');
    }

    const agentProfile = createAgentProfile(agentId, profile || {});
    this.agents.set(agentId, agentProfile);

    this.emit('agent:registered', { agentId, profile: agentProfile });

    // Process queue when new agent registers so queued tasks get assigned
    this._processQueue();

    return agentProfile;
  }

  /**
   * Unregister an agent and redistribute its tasks
   * @param {string} agentId - Agent to unregister
   * @returns {string[]} IDs of tasks that were reassigned or queued
   * @throws {Error} If agent is not found
   */
  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    const orphanedTaskIds = [...agent.activeTasks];

    // Re-queue active tasks
    for (const taskId of orphanedTaskIds) {
      const task = this.tasks.get(taskId);
      if (task) {
        task.assignedTo = null;
        task.status = TaskStatus.QUEUED;
        task.startedAt = null;
        this.queue.unshift(taskId);
      }
    }

    this.agents.delete(agentId);
    this.emit('agent:unregistered', { agentId, orphanedTasks: orphanedTaskIds });

    // Try to process queue after unregistration
    this._processQueue();

    return orphanedTaskIds;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          TASK SUBMISSION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Submit a task for automatic distribution
   * @param {Object} taskInput - Task to submit
   * @param {string} [taskInput.id] - Task ID (auto-generated if omitted)
   * @param {string} [taskInput.type='general'] - Task type
   * @param {string} [taskInput.priority='normal'] - Priority level
   * @param {number} [taskInput.complexity=5] - Complexity 1-10
   * @param {string[]} [taskInput.requiredSpecialties=[]] - Required specialties
   * @returns {Object} Submission result with taskId and assignedTo
   * @throws {Error} If task input is not a non-null object
   * @throws {Error} If task with same ID already exists
   */
  submitTask(taskInput) {
    if (!taskInput || typeof taskInput !== 'object') {
      throw new Error('Task must be a non-null object');
    }

    const task = createTask(taskInput);

    // Reject duplicate task IDs
    if (this.tasks.has(task.id)) {
      throw new Error(`Task '${task.id}' already exists`);
    }

    this.tasks.set(task.id, task);
    this.metrics.totalSubmitted++;

    this.emit('task:submitted', { taskId: task.id, task });

    // Critical priority tasks bypass queue
    if (task.priority === TaskPriority.CRITICAL) {
      const agent = this._findOptimalAgent(task);
      if (agent) {
        this._assignTaskToAgent(task, agent);
        return { taskId: task.id, assignedTo: agent.id, status: TaskStatus.ASSIGNED };
      }
      // Even critical tasks can be queued if using queue policy
      if (this.throttlePolicy === ThrottlePolicy.REJECT_WHEN_FULL) {
        task.status = TaskStatus.FAILED;
        task.error = 'No available agent for critical task';
        this.metrics.totalRejected++;
        this.emit('task:failed', { taskId: task.id, error: task.error });
        return { taskId: task.id, assignedTo: null, status: TaskStatus.FAILED };
      }
    }

    // Try to find an optimal agent
    const optimalAgent = this._findOptimalAgent(task);

    if (optimalAgent) {
      this._assignTaskToAgent(task, optimalAgent);
      return { taskId: task.id, assignedTo: optimalAgent.id, status: TaskStatus.ASSIGNED };
    }

    // Handle overflow based on throttle policy
    return this._handleOverflow(task);
  }

  /**
   * Manually assign a task to a specific agent
   * @param {string} taskId - Task to assign
   * @param {string} agentId - Target agent
   * @returns {Object} Assignment result
   * @throws {Error} If task or agent not found
   * @throws {Error} If task is already completed or failed
   */
  assignTask(taskId, agentId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    // Enforce task state transitions - cannot assign completed/failed tasks
    if (task.status === TaskStatus.COMPLETED) {
      throw new Error(`Task '${taskId}' is already completed`);
    }
    if (task.status === TaskStatus.FAILED) {
      throw new Error(`Task '${taskId}' is already failed`);
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    // If task was in queue, remove it
    const queueIndex = this.queue.indexOf(taskId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
    }

    // If task was assigned to another agent, remove it
    if (task.assignedTo) {
      const prevAgent = this.agents.get(task.assignedTo);
      if (prevAgent) {
        this._removeTaskFromAgent(prevAgent, taskId);
      }
    }

    this._assignTaskToAgent(task, agent);
    return { taskId, assignedTo: agentId, status: TaskStatus.ASSIGNED };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          TASK COMPLETION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Mark a task as completed and free capacity
   * @param {string} taskId - Task to complete
   * @param {*} [result=null] - Task result
   * @returns {Object} Completion info
   * @throws {Error} If task not found
   * @throws {Error} If task is already completed or failed
   */
  async completeTask(taskId, result = null) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    // Enforce task state transitions
    if (task.status === TaskStatus.COMPLETED) {
      throw new Error(`Task '${taskId}' is already completed`);
    }
    if (task.status === TaskStatus.FAILED) {
      throw new Error(`Task '${taskId}' is already failed`);
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = Date.now();
    task.result = result;

    const agent = task.assignedTo ? this.agents.get(task.assignedTo) : null;
    if (agent) {
      this._removeTaskFromAgent(agent, taskId);
      agent.completedCount++;
      const completionTime = task.completedAt - (task.startedAt ?? task.submittedAt);
      agent.totalCompletionTime += completionTime;
      agent.avgCompletionTime = agent.totalCompletionTime / agent.completedCount;
      this._updateAgentStatus(agent);
    }

    this.metrics.totalCompleted++;
    this.emit('task:completed', { taskId, result, agentId: task.assignedTo });

    // Try to process queue after freeing capacity
    this._processQueue();

    // Await metrics persistence instead of fire-and-forget
    await this._persistMetrics();

    return {
      taskId,
      agentId: task.assignedTo,
      completionTime: task.completedAt - (task.startedAt ?? task.submittedAt),
    };
  }

  /**
   * Mark a task as failed and free capacity
   * @param {string} taskId - Task that failed
   * @param {string|Error} [error='Unknown error'] - Error description
   * @returns {Object} Failure info
   * @throws {Error} If task not found
   * @throws {Error} If task is already completed or failed
   */
  async failTask(taskId, error = 'Unknown error') {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    // Enforce task state transitions
    if (task.status === TaskStatus.COMPLETED) {
      throw new Error(`Task '${taskId}' is already completed`);
    }
    if (task.status === TaskStatus.FAILED) {
      throw new Error(`Task '${taskId}' is already failed`);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    task.status = TaskStatus.FAILED;
    task.completedAt = Date.now();
    task.error = errorMessage;

    const agent = task.assignedTo ? this.agents.get(task.assignedTo) : null;
    if (agent) {
      this._removeTaskFromAgent(agent, taskId);
      agent.failedCount++;
      this._updateAgentStatus(agent);
    }

    this.metrics.totalFailed++;
    this.emit('task:failed', { taskId, error: errorMessage, agentId: task.assignedTo });

    // Try to process queue after freeing capacity
    this._processQueue();

    // Await metrics persistence instead of fire-and-forget
    await this._persistMetrics();

    return {
      taskId,
      agentId: task.assignedTo,
      error: errorMessage,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Get current load percentage for an agent (0-100%)
   * @param {string} agentId - Agent to query
   * @returns {number} Load percentage
   * @throws {Error} If agent not found
   */
  getAgentLoad(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    if (agent.maxLoad === 0) return 100;
    return Math.min(100, (agent.currentLoad / agent.maxLoad) * 100);
  }

  /**
   * Find the optimal agent for a task without assigning
   * @param {Object} task - Task descriptor
   * @returns {Object|null} Best agent info or null if none available
   */
  getOptimalAgent(task) {
    const normalizedTask = createTask(task);
    const agent = this._findOptimalAgent(normalizedTask);

    if (!agent) return null;

    return {
      agentId: agent.id,
      currentLoad: this.getAgentLoad(agent.id),
      affinityScore: this._calculateAffinityScore(agent, normalizedTask),
      specialties: agent.specialties,
    };
  }

  /**
   * Get the current task queue
   * @returns {Object[]} Queued tasks with details
   */
  getQueue() {
    return this.queue.map((taskId) => {
      const task = this.tasks.get(taskId);
      return task ? { ...task } : null;
    }).filter(Boolean);
  }

  /**
   * Get comprehensive metrics
   * @returns {Object} Metrics snapshot
   */
  getMetrics() {
    const agentUtilization = {};
    for (const [agentId, agent] of this.agents) {
      agentUtilization[agentId] = {
        load: agent.maxLoad > 0 ? (agent.currentLoad / agent.maxLoad) * 100 : 0,
        activeTasks: agent.activeTasks.length,
        completedCount: agent.completedCount,
        failedCount: agent.failedCount,
        avgCompletionTime: agent.avgCompletionTime,
        successRate: this._getSuccessRate(agent),
        status: agent.status,
      };
    }

    const uptime = Date.now() - this.metrics.startTime;
    const throughput = uptime > 0
      ? (this.metrics.totalCompleted / (uptime / 1000)) * 60
      : 0;

    return {
      totalSubmitted: this.metrics.totalSubmitted,
      totalCompleted: this.metrics.totalCompleted,
      totalFailed: this.metrics.totalFailed,
      totalRejected: this.metrics.totalRejected,
      totalRebalanced: this.metrics.totalRebalanced,
      queueLength: this.queue.length,
      activeAgents: this.agents.size,
      throughputPerMinute: Math.round(throughput * 100) / 100,
      avgWaitTime: this._calculateAvgWaitTime(),
      agentUtilization,
      uptime,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          REBALANCING
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Rebalance tasks from overloaded to underloaded agents
   * @returns {Object} Rebalance summary
   */
  rebalance() {
    const movements = [];
    const overloaded = [];
    const underloaded = [];

    // Categorize agents
    for (const [, agent] of this.agents) {
      if (agent.status === AgentStatus.OFFLINE) continue;

      const loadPct = agent.maxLoad > 0 ? (agent.currentLoad / agent.maxLoad) * 100 : 100;
      if (loadPct > OVERLOAD_THRESHOLD) {
        overloaded.push(agent);
      } else if (loadPct < 50) {
        underloaded.push(agent);
      }
    }

    if (overloaded.length === 0 || underloaded.length === 0) {
      return { movements: [], overloadedCount: overloaded.length, underloadedCount: underloaded.length };
    }

    // Sort underloaded by available capacity (descending)
    underloaded.sort((a, b) => {
      const capA = a.maxLoad - a.currentLoad;
      const capB = b.maxLoad - b.currentLoad;
      return capB - capA;
    });

    // Move tasks from overloaded to underloaded
    for (const source of overloaded) {
      const tasksToMove = [...source.activeTasks];

      for (const taskId of tasksToMove) {
        const task = this.tasks.get(taskId);
        if (!task) continue;

        // Find best underloaded target
        const target = this._findBestRebalanceTarget(task, underloaded, source.id);
        if (!target) continue;

        // Check if source is still overloaded
        const sourceLoad = source.maxLoad > 0 ? (source.currentLoad / source.maxLoad) * 100 : 100;
        if (sourceLoad <= OVERLOAD_THRESHOLD) break;

        // Move task
        this._removeTaskFromAgent(source, taskId);
        this._assignTaskToAgent(task, target);

        movements.push({
          taskId,
          from: source.id,
          to: target.id,
        });

        this.metrics.totalRebalanced++;
        this.emit('task:rebalanced', { taskId, from: source.id, to: target.id });
      }
    }

    // Update all agent statuses
    for (const [, agent] of this.agents) {
      this._updateAgentStatus(agent);
    }

    return {
      movements,
      overloadedCount: overloaded.length,
      underloadedCount: underloaded.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          THROTTLE POLICY
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Set throttle policy for overload scenarios
   * @param {string} policy - Policy: 'queue-when-full', 'reject-when-full', 'spillover'
   * @throws {Error} If policy is invalid
   */
  setThrottlePolicy(policy) {
    const validPolicies = Object.values(ThrottlePolicy);
    if (!validPolicies.includes(policy)) {
      throw new Error(`Invalid throttle policy '${policy}'. Valid: ${validPolicies.join(', ')}`);
    }
    this.throttlePolicy = policy;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                          INTERNAL METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Calculate affinity score for an agent-task pair
   * @param {Object} agent - Agent profile
   * @param {Object} task - Task object
   * @returns {number} Affinity score 0-1
   * @private
   */
  _calculateAffinityScore(agent, task) {
    // Specialty match (40%)
    let specialtyScore = 0;
    if (task.requiredSpecialties.length > 0 && agent.specialties.length > 0) {
      const matches = task.requiredSpecialties.filter(
        (s) => agent.specialties.includes(s)
      ).length;
      specialtyScore = matches / task.requiredSpecialties.length;
    } else if (task.requiredSpecialties.length === 0) {
      specialtyScore = 0.5; // Neutral when no specialties required
    }

    // Load inverse (30%) - Less load = higher score
    const loadPct = agent.maxLoad > 0 ? agent.currentLoad / agent.maxLoad : 1;
    const loadScore = 1 - loadPct;

    // Processing speed (20%)
    const speedScore = Math.min(1, agent.processingSpeed / 2.0);

    // Success rate (10%)
    const successRate = this._getSuccessRate(agent);

    return (
      specialtyScore * AFFINITY_WEIGHTS.SPECIALTY +
      loadScore * AFFINITY_WEIGHTS.LOAD_INVERSE +
      speedScore * AFFINITY_WEIGHTS.SPEED +
      successRate * AFFINITY_WEIGHTS.SUCCESS_RATE
    );
  }

  /**
   * Get success rate for an agent
   * @param {Object} agent - Agent profile
   * @returns {number} Success rate 0-1
   * @private
   */
  _getSuccessRate(agent) {
    const total = agent.completedCount + agent.failedCount;
    if (total === 0) return 1; // Benefit of the doubt for new agents
    return agent.completedCount / total;
  }

  /**
   * Find optimal agent for a task
   * @param {Object} task - Task to assign
   * @returns {Object|null} Best agent or null
   * @private
   */
  _findOptimalAgent(task) {
    let bestAgent = null;
    let bestScore = -1;

    for (const [, agent] of this.agents) {
      if (agent.status === AgentStatus.OFFLINE) continue;

      // Check capacity (unless spillover policy)
      if (this.throttlePolicy !== ThrottlePolicy.SPILLOVER) {
        const loadAfter = agent.currentLoad + task.complexity;
        if (loadAfter > agent.maxLoad) continue;
      }

      const score = this._calculateAffinityScore(agent, task);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * Find best rebalance target from underloaded agents
   * @param {Object} task - Task to move
   * @param {Object[]} candidates - Underloaded agents
   * @param {string} excludeId - Agent to exclude (source)
   * @returns {Object|null} Best target agent
   * @private
   */
  _findBestRebalanceTarget(task, candidates, excludeId) {
    let bestTarget = null;
    let bestScore = -1;

    for (const candidate of candidates) {
      if (candidate.id === excludeId) continue;

      const loadAfter = candidate.currentLoad + task.complexity;
      if (loadAfter > candidate.maxLoad) continue;

      const score = this._calculateAffinityScore(candidate, task);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = candidate;
      }
    }

    return bestTarget;
  }

  /**
   * Assign a task to an agent (internal)
   * @param {Object} task - Task object
   * @param {Object} agent - Agent profile
   * @private
   */
  _assignTaskToAgent(task, agent) {
    // Save previous status for transition-only events
    const previousStatus = agent.status;

    task.assignedTo = agent.id;
    task.status = TaskStatus.ASSIGNED;
    task.startedAt = Date.now();

    agent.activeTasks.push(task.id);
    agent.currentLoad += task.complexity;

    this._updateAgentStatus(agent);
    this.emit('task:assigned', { taskId: task.id, agentId: agent.id });

    // Only emit agent:overloaded on actual status transition
    if (agent.status === AgentStatus.OVERLOADED && previousStatus !== AgentStatus.OVERLOADED) {
      const loadPct = agent.maxLoad > 0 ? (agent.currentLoad / agent.maxLoad) * 100 : 100;
      this.emit('agent:overloaded', { agentId: agent.id, load: loadPct });
    }
  }

  /**
   * Remove a task from an agent's active list
   * @param {Object} agent - Agent profile
   * @param {string} taskId - Task to remove
   * @private
   */
  _removeTaskFromAgent(agent, taskId) {
    // Save previous status for transition-only events
    const previousStatus = agent.status;

    const idx = agent.activeTasks.indexOf(taskId);
    if (idx !== -1) {
      agent.activeTasks.splice(idx, 1);
    }

    const task = this.tasks.get(taskId);
    if (task) {
      agent.currentLoad = Math.max(0, agent.currentLoad - task.complexity);
    }

    this._updateAgentStatus(agent);

    // Only emit agent:available on transition FROM overloaded
    if (agent.status !== AgentStatus.OVERLOADED && agent.status !== AgentStatus.OFFLINE
        && previousStatus === AgentStatus.OVERLOADED) {
      const loadPct = agent.maxLoad > 0 ? (agent.currentLoad / agent.maxLoad) * 100 : 100;
      this.emit('agent:available', { agentId: agent.id, load: loadPct });
    }
  }

  /**
   * Update agent status based on current load
   * @param {Object} agent - Agent profile
   * @private
   */
  _updateAgentStatus(agent) {
    if (agent.status === AgentStatus.OFFLINE) return;

    const loadPct = agent.maxLoad > 0 ? (agent.currentLoad / agent.maxLoad) * 100 : 100;

    if (loadPct >= OVERLOAD_THRESHOLD) {
      agent.status = AgentStatus.OVERLOADED;
    } else if (agent.activeTasks.length > 0) {
      agent.status = AgentStatus.BUSY;
    } else {
      agent.status = AgentStatus.AVAILABLE;
    }
  }

  /**
   * Handle overflow when no agent can accept the task
   * @param {Object} task - Task to handle
   * @returns {Object} Handling result
   * @private
   */
  _handleOverflow(task) {
    switch (this.throttlePolicy) {
      case ThrottlePolicy.QUEUE_WHEN_FULL: {
        if (this.queue.length >= this.maxQueueSize) {
          task.status = TaskStatus.FAILED;
          task.error = 'Queue is full';
          this.metrics.totalRejected++;
          this.emit('queue:full', { taskId: task.id, queueSize: this.queue.length });
          this.emit('task:failed', { taskId: task.id, error: task.error });
          return { taskId: task.id, assignedTo: null, status: TaskStatus.FAILED };
        }
        this.queue.push(task.id);
        return { taskId: task.id, assignedTo: null, status: TaskStatus.QUEUED };
      }

      case ThrottlePolicy.REJECT_WHEN_FULL: {
        task.status = TaskStatus.FAILED;
        task.error = 'All agents at capacity';
        this.metrics.totalRejected++;
        this.emit('task:failed', { taskId: task.id, error: task.error });
        return { taskId: task.id, assignedTo: null, status: TaskStatus.FAILED };
      }

      case ThrottlePolicy.SPILLOVER: {
        // Force assign to least loaded agent
        const leastLoaded = this._findLeastLoadedAgent();
        if (leastLoaded) {
          this._assignTaskToAgent(task, leastLoaded);
          return { taskId: task.id, assignedTo: leastLoaded.id, status: TaskStatus.ASSIGNED };
        }
        // No agents at all — queue it
        this.queue.push(task.id);
        return { taskId: task.id, assignedTo: null, status: TaskStatus.QUEUED };
      }

      default:
        this.queue.push(task.id);
        return { taskId: task.id, assignedTo: null, status: TaskStatus.QUEUED };
    }
  }

  /**
   * Find the least loaded agent (for spillover policy)
   * @returns {Object|null} Least loaded agent
   * @private
   */
  _findLeastLoadedAgent() {
    let bestAgent = null;
    let lowestLoad = Infinity;

    for (const [, agent] of this.agents) {
      if (agent.status === AgentStatus.OFFLINE) continue;

      const loadPct = agent.maxLoad > 0 ? agent.currentLoad / agent.maxLoad : 1;
      if (loadPct < lowestLoad) {
        lowestLoad = loadPct;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * Process queued tasks, assigning to available agents
   * @private
   */
  _processQueue() {
    if (this.queue.length === 0) return;

    const remaining = [];

    for (const taskId of this.queue) {
      const task = this.tasks.get(taskId);
      if (!task || task.status !== TaskStatus.QUEUED) continue;

      const agent = this._findOptimalAgent(task);
      if (agent) {
        this._assignTaskToAgent(task, agent);
      } else {
        remaining.push(taskId);
      }
    }

    this.queue = remaining;
  }

  /**
   * Calculate average wait time for completed tasks
   * @returns {number} Average wait time in ms
   * @private
   */
  _calculateAvgWaitTime() {
    let totalWait = 0;
    let count = 0;

    for (const [, task] of this.tasks) {
      if (task.startedAt && task.submittedAt) {
        totalWait += task.startedAt - task.submittedAt;
        count++;
      }
    }

    return count > 0 ? Math.round(totalWait / count) : 0;
  }

  /**
   * Persist metrics to disk
   * @private
   */
  async _persistMetrics() {
    if (!this.persistMetrics) return;

    try {
      const metricsDir = path.join(this.projectRoot, METRICS_DIR);
      const metricsPath = path.join(metricsDir, METRICS_FILENAME);

      await fs.mkdir(metricsDir, { recursive: true });
      await fs.writeFile(metricsPath, JSON.stringify(this.getMetrics(), null, 2), 'utf8');
    } catch (err) {
      // Log persistence errors with context instead of silently ignoring
      console.error(`Failed to persist load balancer metrics: ${err.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = CognitiveLoadBalancer;
module.exports.CognitiveLoadBalancer = CognitiveLoadBalancer;
module.exports.AgentStatus = AgentStatus;
module.exports.TaskStatus = TaskStatus;
module.exports.TaskPriority = TaskPriority;
module.exports.ThrottlePolicy = ThrottlePolicy;
module.exports.AFFINITY_WEIGHTS = AFFINITY_WEIGHTS;
module.exports.OVERLOAD_THRESHOLD = OVERLOAD_THRESHOLD;
