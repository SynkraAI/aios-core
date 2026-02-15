/**
 * Pipeline Types
 * FinHealth Squad — Workflow Pipeline Engine
 *
 * All interfaces for workflow definitions, execution context, and results.
 */

// ============================================================================
// Workflow Definition (parsed from YAML)
// ============================================================================

export interface WorkflowDefinition {
  name: string;
  version: string;
  description: string;
  metadata?: WorkflowMetadata;
  trigger?: WorkflowTrigger;
  input?: WorkflowInputSchema;
  steps: WorkflowStep[];
  output?: WorkflowOutputSchema;
  onError?: ErrorHandler[];
  notifications?: WorkflowNotifications;
}

export interface WorkflowMetadata {
  squad: string;
  category: string;
  priority: string;
  estimatedDuration?: string;
}

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'on-event' | 'on-demand';
  schedule?: string;
  timezone?: string;
  event?: string;
  source?: string;
}

export interface WorkflowInputSchema {
  type: 'object';
  required?: string[];
  properties: Record<string, WorkflowInputProperty>;
}

export interface WorkflowInputProperty {
  type: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  format?: string;
  items?: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  name?: string;
  task: string;
  agent: string;
  dependsOn?: string[];
  condition?: string;
  input: Record<string, unknown>;
  output?: Record<string, string>;
}

export interface WorkflowOutputSchema {
  type: 'object';
  properties: Record<string, WorkflowOutputProperty>;
}

export interface WorkflowOutputProperty {
  type?: string;
  source?: string;
  computed?: string;
  properties?: Record<string, unknown>;
}

export interface ErrorHandler {
  condition: string;
  action: 'retry' | 'notify' | 'alert' | 'pause';
  maxRetries?: number;
  backoff?: 'exponential' | 'linear';
  message?: string;
  severity?: string;
  recipients?: string[];
}

export interface WorkflowNotifications {
  onStart?: NotificationConfig[];
  onComplete?: NotificationConfig[];
  onFailure?: NotificationConfig[];
}

export interface NotificationConfig {
  type: string;
  message?: string;
  [key: string]: unknown;
}

// ============================================================================
// Execution Context
// ============================================================================

export interface PipelineContext {
  input: Record<string, unknown>;
  steps: Record<string, StepResult>;
}

// ============================================================================
// Results
// ============================================================================

export interface StepResult {
  stepId: string;
  success: boolean;
  skipped: boolean;
  output: Record<string, unknown>;
  error?: string;
}

export interface PipelineResult {
  success: boolean;
  workflowName: string;
  output: Record<string, unknown>;
  stepResults: StepResult[];
  errors: string[];
  metadata: PipelineMetadata;
}

export interface PipelineMetadata {
  totalSteps: number;
  executedSteps: number;
  skippedSteps: number;
  failedSteps: number;
  duration: number;
}
