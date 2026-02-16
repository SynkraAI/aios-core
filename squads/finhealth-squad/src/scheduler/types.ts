/**
 * Scheduler Types
 * FinHealth Squad — Workflow Scheduler & Event Dispatcher
 */

export type TriggerType = 'scheduled' | 'on-event' | 'manual';

export type ExecutionStatus = 'running' | 'success' | 'failed' | 'cancelled';

export interface ScheduledJob {
  workflowName: string;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  nextRun?: Date;
  lastRun?: Date;
  lastStatus?: ExecutionStatus;
}

export interface EventBinding {
  eventName: string;
  workflowName: string;
  source?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  triggerType: TriggerType;
  startedAt: Date;
  finishedAt?: Date;
  status: ExecutionStatus;
  outputSummary?: Record<string, unknown>;
  error?: string;
  parameters?: Record<string, unknown>;
}

export interface SchedulerStatus {
  running: boolean;
  startedAt?: Date;
  scheduledJobs: ScheduledJob[];
  eventBindings: EventBinding[];
  recentExecutions: WorkflowExecution[];
}

export interface SchedulerConfig {
  workflowsPath: string;
  verbose?: boolean;
  timezone?: string;
}
