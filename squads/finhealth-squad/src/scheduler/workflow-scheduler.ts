/**
 * Workflow Scheduler
 * FinHealth Squad — Cron-based workflow automation
 *
 * Reads workflow YAML definitions and registers cron jobs for
 * scheduled workflows using node-cron. Also sets up event-based
 * triggers via the EventDispatcher.
 *
 * CLI container model: runs as a long-lived process inside Docker.
 */

import { schedule as cronSchedule, validate as cronValidate } from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import type { PipelineExecutor } from '../pipeline/pipeline-executor';
import type { ScheduledJob, SchedulerConfig, SchedulerStatus } from './types';
import { EventDispatcher } from './event-dispatcher';
import { ExecutionLogger } from './execution-logger';
import { logger } from '../logger';

export class WorkflowScheduler {
  private executor: PipelineExecutor;
  private config: SchedulerConfig;
  private cronTasks: Map<string, ScheduledTask> = new Map();
  private scheduledJobs: Map<string, ScheduledJob> = new Map();
  private eventDispatcher: EventDispatcher;
  private executionLogger: ExecutionLogger;
  private running = false;
  private startedAt?: Date;

  constructor(executor: PipelineExecutor, config: SchedulerConfig) {
    this.executor = executor;
    this.config = config;
    this.eventDispatcher = new EventDispatcher();
    this.executionLogger = new ExecutionLogger();
  }

  /**
   * Initialize scheduler: load workflows, register cron jobs and event bindings.
   */
  async initialize(): Promise<void> {
    await this.executor.initialize();

    const workflowNames = this.executor.listWorkflows();

    for (const name of workflowNames) {
      const workflow = this.executor.getWorkflow(name);
      if (!workflow?.trigger) continue;

      const trigger = workflow.trigger;

      if (trigger.type === 'scheduled' && trigger.schedule) {
        this.registerCronJob(name, trigger.schedule, trigger.timezone || this.config.timezone || 'America/Sao_Paulo');
      }

      if (trigger.type === 'on-event' && trigger.event) {
        this.registerEventBinding(name, trigger.event, trigger.source);
      }
    }

    if (this.config.verbose) {
      logger.info(
        `[Scheduler] Initialized: ${this.scheduledJobs.size} cron jobs, ${this.eventDispatcher.getBindings().length} event bindings`,
      );
    }
  }

  /**
   * Start all cron jobs.
   */
  start(): void {
    if (this.running) {
      logger.warn('[Scheduler] Already running');
      return;
    }

    for (const [name, task] of this.cronTasks) {
      task.start();
      if (this.config.verbose) {
        const job = this.scheduledJobs.get(name);
        logger.info(`[Scheduler] Started cron: ${name} (${job?.cronExpression})`);
      }
    }

    this.running = true;
    this.startedAt = new Date();
    logger.info(`[Scheduler] Started with ${this.cronTasks.size} cron job(s)`);
  }

  /**
   * Stop all cron jobs.
   */
  stop(): void {
    if (!this.running) return;

    for (const [, task] of this.cronTasks) {
      task.stop();
    }

    this.running = false;
    logger.info('[Scheduler] Stopped');
  }

  /**
   * Manually trigger a workflow by name.
   */
  async trigger(workflowName: string, parameters: Record<string, unknown> = {}): Promise<{
    success: boolean;
    executionId: string;
    error?: string;
  }> {
    const execId = this.executionLogger.start(workflowName, 'manual', parameters);

    try {
      const result = await this.executor.execute({
        workflowName,
        parameters,
      });

      const summary = {
        totalSteps: result.metadata.totalSteps,
        executedSteps: result.metadata.executedSteps,
        duration: result.metadata.duration,
      };

      this.executionLogger.finish(execId, result.success ? 'success' : 'failed', summary, result.errors?.[0]);

      // Update scheduled job last run info
      const job = this.scheduledJobs.get(workflowName);
      if (job) {
        job.lastRun = new Date();
        job.lastStatus = result.success ? 'success' : 'failed';
      }

      return {
        success: result.success,
        executionId: execId,
        error: result.errors?.[0],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.executionLogger.finish(execId, 'failed', undefined, message);
      return { success: false, executionId: execId, error: message };
    }
  }

  /**
   * Emit an event to trigger event-based workflows.
   */
  async emitEvent(eventName: string, payload: Record<string, unknown> = {}): Promise<void> {
    await this.eventDispatcher.emit(eventName, payload);
  }

  /**
   * Get full scheduler status.
   */
  getStatus(): SchedulerStatus {
    return {
      running: this.running,
      startedAt: this.startedAt,
      scheduledJobs: [...this.scheduledJobs.values()],
      eventBindings: this.eventDispatcher.getBindings(),
      recentExecutions: this.executionLogger.getRecent(10),
    };
  }

  /**
   * Get the execution logger (for external queries).
   */
  getExecutionLogger(): ExecutionLogger {
    return this.executionLogger;
  }

  /**
   * Get the event dispatcher (for external event emission).
   */
  getEventDispatcher(): EventDispatcher {
    return this.eventDispatcher;
  }

  /**
   * Destroy scheduler: stop all jobs, remove event bindings.
   */
  destroy(): void {
    this.stop();
    for (const [, task] of this.cronTasks) {
      task.stop();
    }
    this.cronTasks.clear();
    this.scheduledJobs.clear();
    this.eventDispatcher.removeAll();
  }

  // ==========================================================================
  // Private
  // ==========================================================================

  private registerCronJob(workflowName: string, cronExpression: string, timezone: string): void {
    if (!cronValidate(cronExpression)) {
      logger.error(`[Scheduler] Invalid cron expression for "${workflowName}": ${cronExpression}`);
      return;
    }

    const task = cronSchedule(
      cronExpression,
      async () => {
        logger.info(`[Scheduler] Cron triggered: ${workflowName}`);
        const execId = this.executionLogger.start(workflowName, 'scheduled');

        try {
          const result = await this.executor.execute({
            workflowName,
            parameters: {},
          });

          const summary = {
            totalSteps: result.metadata.totalSteps,
            executedSteps: result.metadata.executedSteps,
            duration: result.metadata.duration,
          };

          this.executionLogger.finish(execId, result.success ? 'success' : 'failed', summary, result.errors?.[0]);

          const job = this.scheduledJobs.get(workflowName);
          if (job) {
            job.lastRun = new Date();
            job.lastStatus = result.success ? 'success' : 'failed';
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          this.executionLogger.finish(execId, 'failed', undefined, message);
          logger.error(`[Scheduler] Cron execution failed for "${workflowName}": ${message}`);
        }
      },
      {
        timezone,
        name: workflowName,
      },
    );

    // Stop immediately — we control start/stop lifecycle via start()/stop()
    task.stop();

    this.cronTasks.set(workflowName, task);
    this.scheduledJobs.set(workflowName, {
      workflowName,
      cronExpression,
      timezone,
      enabled: true,
    });
  }

  private registerEventBinding(workflowName: string, eventName: string, source?: string): void {
    this.eventDispatcher.bind(
      eventName,
      workflowName,
      async (payload) => {
        logger.info(`[Scheduler] Event "${eventName}" triggered workflow "${workflowName}"`);
        const execId = this.executionLogger.start(workflowName, 'on-event', payload);

        try {
          const result = await this.executor.execute({
            workflowName,
            parameters: payload,
          });

          const summary = {
            totalSteps: result.metadata.totalSteps,
            executedSteps: result.metadata.executedSteps,
            duration: result.metadata.duration,
          };

          this.executionLogger.finish(execId, result.success ? 'success' : 'failed', summary, result.errors?.[0]);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          this.executionLogger.finish(execId, 'failed', undefined, message);
        }
      },
      source,
    );
  }
}
