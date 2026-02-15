/**
 * Workflow Loader
 * FinHealth Squad — YAML Workflow Definition Loader
 *
 * Loads and validates workflow definitions from YAML files using Zod.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';
import type { WorkflowDefinition } from './types';

// ============================================================================
// Zod Schema
// ============================================================================

const ErrorHandlerSchema = z.object({
  condition: z.string(),
  action: z.enum(['retry', 'notify', 'alert', 'pause']),
  maxRetries: z.number().optional(),
  backoff: z.enum(['exponential', 'linear']).optional(),
  message: z.string().optional(),
  severity: z.string().optional(),
  recipients: z.array(z.string()).optional(),
});

const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  task: z.string().min(1),
  agent: z.string().min(1),
  dependsOn: z.array(z.string()).optional(),
  condition: z.string().optional(),
  input: z.record(z.unknown()),
  output: z.record(z.string()).optional(),
});

const WorkflowDefinitionSchema = z.object({
  name: z.string().min(1),
  version: z.string(),
  description: z.string(),
  metadata: z
    .object({
      squad: z.string(),
      category: z.string(),
      priority: z.string(),
      estimatedDuration: z.string().optional(),
    })
    .optional(),
  trigger: z
    .object({
      type: z.enum(['manual', 'scheduled', 'on-event', 'on-demand']),
      schedule: z.string().optional(),
      timezone: z.string().optional(),
      event: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
  input: z
    .object({
      type: z.literal('object'),
      required: z.array(z.string()).optional(),
      properties: z.record(z.unknown()),
    })
    .optional(),
  steps: z.array(WorkflowStepSchema).min(1),
  output: z
    .object({
      type: z.literal('object'),
      properties: z.record(z.unknown()),
    })
    .optional(),
  onError: z.array(ErrorHandlerSchema).optional(),
  notifications: z.record(z.unknown()).optional(),
});

// ============================================================================
// Validation helpers
// ============================================================================

function validateStepIds(definition: WorkflowDefinition): void {
  const ids = definition.steps.map((s) => s.id);
  const unique = new Set(ids);

  if (unique.size !== ids.length) {
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    throw new Error(`Duplicate step IDs: ${[...new Set(dupes)].join(', ')}`);
  }

  // Validate dependsOn references
  for (const step of definition.steps) {
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        if (!unique.has(dep)) {
          throw new Error(`Step "${step.id}" depends on unknown step "${dep}"`);
        }
      }
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Load a single workflow definition from a YAML file.
 */
export function loadWorkflow(filePath: string): WorkflowDefinition {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Workflow file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let parsed: unknown;

  try {
    parsed = yaml.load(raw);
  } catch (err: unknown) {
    throw new Error(
      `Invalid YAML in ${filePath}: ${err instanceof Error ? err.message : 'Unknown'}`,
    );
  }

  const result = WorkflowDefinitionSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid workflow definition in ${filePath}:\n  ${issues.join('\n  ')}`);
  }

  const definition = result.data as WorkflowDefinition;
  validateStepIds(definition);

  return definition;
}

/**
 * Load all workflow definitions from a directory.
 */
export function loadWorkflowsFromDir(dirPath: string): Map<string, WorkflowDefinition> {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Workflows directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const workflows = new Map<string, WorkflowDefinition>();

  for (const file of files) {
    const workflow = loadWorkflow(path.join(dirPath, file));
    workflows.set(workflow.name, workflow);
  }

  return workflows;
}
