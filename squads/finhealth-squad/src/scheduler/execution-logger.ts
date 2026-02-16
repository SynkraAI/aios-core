/**
 * Execution Logger
 * FinHealth Squad — Tracks workflow execution history in-memory
 *
 * Stores a rolling window of recent executions for CLI status queries.
 * Can be extended to persist to DB (workflow_executions table) when Supabase is available.
 */

import type { WorkflowExecution, ExecutionStatus, TriggerType } from './types';
import { logger } from '../logger';

const MAX_HISTORY = 200;

let idCounter = 0;

function generateId(): string {
  idCounter++;
  return `exec-${Date.now()}-${idCounter}`;
}

export class ExecutionLogger {
  private executions: WorkflowExecution[] = [];

  /**
   * Start tracking a new execution. Returns the execution ID.
   */
  start(workflowName: string, triggerType: TriggerType, parameters?: Record<string, unknown>): string {
    const id = generateId();
    const execution: WorkflowExecution = {
      id,
      workflowName,
      triggerType,
      startedAt: new Date(),
      status: 'running',
      parameters,
    };

    this.executions.push(execution);

    // Trim old entries
    if (this.executions.length > MAX_HISTORY) {
      this.executions = this.executions.slice(-MAX_HISTORY);
    }

    logger.info(`[Scheduler] Execution started: ${workflowName} (${triggerType})`, { executionId: id });
    return id;
  }

  /**
   * Mark an execution as completed (success or failed).
   */
  finish(
    executionId: string,
    status: ExecutionStatus,
    outputSummary?: Record<string, unknown>,
    error?: string,
  ): void {
    const exec = this.executions.find((e) => e.id === executionId);
    if (!exec) {
      logger.warn(`[Scheduler] Execution not found: ${executionId}`);
      return;
    }

    exec.status = status;
    exec.finishedAt = new Date();
    exec.outputSummary = outputSummary;
    exec.error = error;

    const duration = exec.finishedAt.getTime() - exec.startedAt.getTime();
    logger.info(`[Scheduler] Execution finished: ${exec.workflowName} → ${status} (${duration}ms)`, {
      executionId,
    });
  }

  /**
   * Get recent executions, optionally filtered by workflow name.
   */
  getRecent(limit = 20, workflowName?: string): WorkflowExecution[] {
    let filtered = this.executions;
    if (workflowName) {
      filtered = filtered.filter((e) => e.workflowName === workflowName);
    }
    return filtered.slice(-limit).reverse();
  }

  /**
   * Get a specific execution by ID.
   */
  get(executionId: string): WorkflowExecution | undefined {
    return this.executions.find((e) => e.id === executionId);
  }

  /**
   * Get the last execution for a specific workflow.
   */
  getLastFor(workflowName: string): WorkflowExecution | undefined {
    for (let i = this.executions.length - 1; i >= 0; i--) {
      if (this.executions[i].workflowName === workflowName) {
        return this.executions[i];
      }
    }
    return undefined;
  }

  /**
   * Get count of executions by status.
   */
  getStats(): Record<ExecutionStatus, number> {
    const stats: Record<ExecutionStatus, number> = {
      running: 0,
      success: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const exec of this.executions) {
      stats[exec.status]++;
    }

    return stats;
  }

  /**
   * Clear all execution history.
   */
  clear(): void {
    this.executions = [];
  }
}
