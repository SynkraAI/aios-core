/**
 * Pipeline Executor
 * FinHealth Squad — Multi-Step Workflow Orchestrator
 *
 * Executes workflow pipelines step-by-step through the AgentRuntime,
 * resolving template expressions and managing step dependencies.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import type {
  WorkflowDefinition,
  WorkflowStep,
  StepResult,
  PipelineResult,
  PipelineContext,
  ErrorHandler,
} from './types';
import { loadWorkflowsFromDir } from './workflow-loader';
import { topologicalSort } from './topological-sort';
import {
  resolveObject,
  resolveStepOutput,
  resolveValue,
  evaluateCondition,
} from './template-engine';

// ============================================================================
// Config
// ============================================================================

export interface PipelineExecutorConfig {
  workflowsPath: string;
  verbose?: boolean;
  /** Injectable sleep for testability (defaults to real setTimeout) */
  sleepFn?: (ms: number) => Promise<void>;
}

// ============================================================================
// PipelineExecutor
// ============================================================================

export class PipelineExecutor {
  private runtime: AgentRuntime;
  private config: PipelineExecutorConfig;
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private sleepFn: (ms: number) => Promise<void>;

  constructor(runtime: AgentRuntime, config: PipelineExecutorConfig) {
    this.runtime = runtime;
    this.config = config;
    this.sleepFn = config.sleepFn ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  /**
   * Load all workflow YAMLs from the configured directory.
   */
  async initialize(): Promise<void> {
    this.workflows = loadWorkflowsFromDir(this.config.workflowsPath);

    if (this.config.verbose) {
      console.log(
        `[Pipeline] Loaded ${this.workflows.size} workflows: ${[...this.workflows.keys()].join(', ')}`,
      );
    }
  }

  listWorkflows(): string[] {
    return [...this.workflows.keys()];
  }

  getWorkflow(name: string): WorkflowDefinition | undefined {
    return this.workflows.get(name);
  }

  /**
   * Execute a workflow pipeline.
   */
  async execute(input: {
    workflowName: string;
    parameters: Record<string, unknown>;
  }): Promise<PipelineResult> {
    const startTime = Date.now();
    const workflow = this.workflows.get(input.workflowName);

    if (!workflow) {
      return {
        success: false,
        workflowName: input.workflowName,
        output: {},
        stepResults: [],
        errors: [`Workflow not found: ${input.workflowName}`],
        metadata: {
          totalSteps: 0,
          executedSteps: 0,
          skippedSteps: 0,
          failedSteps: 0,
          duration: Date.now() - startTime,
        },
      };
    }

    // Apply input defaults
    const parameters = this.applyInputDefaults(workflow, input.parameters);

    // Validate required inputs
    const missingInputs = this.validateRequiredInputs(workflow, parameters);
    if (missingInputs.length > 0) {
      return {
        success: false,
        workflowName: input.workflowName,
        output: {},
        stepResults: [],
        errors: missingInputs.map((f) => `Missing required input: ${f}`),
        metadata: {
          totalSteps: workflow.steps.length,
          executedSteps: 0,
          skippedSteps: 0,
          failedSteps: 0,
          duration: Date.now() - startTime,
        },
      };
    }

    // Topological sort
    const sortedSteps = topologicalSort(workflow.steps);

    // Init context
    const ctx: PipelineContext = { input: parameters, steps: {} };
    const stepResults: StepResult[] = [];
    const errors: string[] = [];

    if (this.config.verbose) {
      console.log(
        `[Pipeline] Executing "${workflow.name}" with ${sortedSteps.length} steps`,
      );
    }

    // Execute each step in order
    for (const step of sortedSteps) {
      const stepResult = await this.executeStep(step, ctx, workflow.onError);
      ctx.steps[step.id] = stepResult;
      stepResults.push(stepResult);

      if (!stepResult.success && !stepResult.skipped) {
        errors.push(`Step "${step.id}" failed: ${stepResult.error || 'Unknown error'}`);
      }
    }

    // Resolve workflow output
    const output = this.resolveWorkflowOutput(workflow, ctx);

    const failedSteps = stepResults.filter((r) => !r.success && !r.skipped).length;
    const skippedSteps = stepResults.filter((r) => r.skipped).length;

    return {
      success: failedSteps === 0,
      workflowName: workflow.name,
      output,
      stepResults,
      errors,
      metadata: {
        totalSteps: sortedSteps.length,
        executedSteps: stepResults.filter((r) => !r.skipped).length,
        skippedSteps,
        failedSteps,
        duration: Date.now() - startTime,
      },
    };
  }

  // ==========================================================================
  // Private helpers
  // ==========================================================================

  private applyInputDefaults(
    workflow: WorkflowDefinition,
    parameters: Record<string, unknown>,
  ): Record<string, unknown> {
    const result = { ...parameters };

    if (workflow.input?.properties) {
      for (const [key, prop] of Object.entries(workflow.input.properties)) {
        if (result[key] === undefined && prop.default !== undefined) {
          result[key] = prop.default;
        }
      }
    }

    return result;
  }

  private validateRequiredInputs(
    workflow: WorkflowDefinition,
    parameters: Record<string, unknown>,
  ): string[] {
    if (!workflow.input?.required) return [];
    return workflow.input.required.filter((field) => parameters[field] === undefined);
  }

  private async executeStep(
    step: WorkflowStep,
    ctx: PipelineContext,
    errorHandlers?: ErrorHandler[],
  ): Promise<StepResult> {
    // Check dependency results
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        const depResult = ctx.steps[dep];
        if (depResult && (depResult.skipped || !depResult.success)) {
          if (this.config.verbose) {
            console.log(`[Pipeline] Skipping "${step.id}" — dependency "${dep}" not satisfied`);
          }
          return {
            stepId: step.id,
            success: false,
            skipped: true,
            output: {},
          };
        }
      }
    }

    // Check condition
    if (step.condition) {
      const conditionMet = evaluateCondition(step.condition, ctx);
      if (!conditionMet) {
        if (this.config.verbose) {
          console.log(`[Pipeline] Skipping "${step.id}" — condition not met`);
        }
        return {
          stepId: step.id,
          success: false,
          skipped: true,
          output: {},
        };
      }
    }

    // Resolve input templates
    const resolvedInput = resolveObject(step.input, ctx);

    if (this.config.verbose) {
      console.log(`[Pipeline] Executing step "${step.id}" (${step.agent}/${step.task})`);
    }

    // Execute task
    let taskResult = await this.runtime.executeTask({
      agentId: step.agent,
      taskName: step.task,
      parameters: resolvedInput as Record<string, any>,
    });

    // Handle failure with error handlers
    if (!taskResult.success && errorHandlers) {
      taskResult = await this.handleError(step, ctx, errorHandlers, taskResult, resolvedInput);
    }

    if (taskResult.success) {
      const output = resolveStepOutput(step.output, taskResult.output);
      return {
        stepId: step.id,
        success: true,
        skipped: false,
        output,
      };
    }

    return {
      stepId: step.id,
      success: false,
      skipped: false,
      output: {},
      error: taskResult.errors?.[0] || 'Task execution failed',
    };
  }

  private async handleError(
    step: WorkflowStep,
    ctx: PipelineContext,
    handlers: ErrorHandler[],
    lastResult: TaskResult,
    resolvedInput: Record<string, unknown>,
  ): Promise<TaskResult> {
    // Find matching handler for this step
    const handler = handlers.find((h) => {
      if (h.condition === 'any') return true;
      const match = h.condition.match(/^steps\.([a-zA-Z0-9_-]+)\.failed$/);
      return match && match[1] === step.id;
    });

    if (!handler || handler.action !== 'retry') return lastResult;

    const maxRetries = handler.maxRetries || 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const delay =
        handler.backoff === 'exponential' ? Math.pow(2, attempt) * 1000 : 1000;

      if (this.config.verbose) {
        console.log(
          `[Pipeline] Retrying step "${step.id}" (attempt ${attempt}/${maxRetries}, delay ${delay}ms)`,
        );
      }

      await this.sleepFn(delay);

      const result = await this.runtime.executeTask({
        agentId: step.agent,
        taskName: step.task,
        parameters: resolvedInput as Record<string, any>,
      });

      if (result.success) return result;
    }

    return lastResult;
  }

  private resolveWorkflowOutput(
    workflow: WorkflowDefinition,
    ctx: PipelineContext,
  ): Record<string, unknown> {
    if (!workflow.output?.properties) return {};

    const output: Record<string, unknown> = {};

    for (const [key, prop] of Object.entries(workflow.output.properties)) {
      const propObj = prop as Record<string, unknown>;

      if (typeof propObj.source === 'string') {
        output[key] = resolveValue(propObj.source, ctx);
      } else if (typeof propObj.computed === 'string') {
        // Computed fields: try to resolve as template, fall back to condition evaluation
        const resolved = resolveValue(propObj.computed, ctx);
        if (resolved !== undefined) {
          output[key] = resolved;
        } else {
          output[key] = evaluateCondition(propObj.computed, ctx);
        }
      } else if (typeof propObj.properties === 'object' && propObj.properties !== null) {
        // Nested output with direct template values
        const nested: Record<string, unknown> = {};
        for (const [nk, nv] of Object.entries(propObj.properties as Record<string, unknown>)) {
          if (typeof nv === 'string') {
            nested[nk] = resolveValue(nv, ctx);
          } else {
            nested[nk] = nv;
          }
        }
        output[key] = nested;
      }
    }

    return output;
  }
}
