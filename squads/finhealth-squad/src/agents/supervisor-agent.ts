/**
 * Supervisor Agent
 * FinHealth Squad
 *
 * Orchestrates cross-agent coordination: routes user requests
 * to the correct specialist agent and generates consolidated
 * reports from multiple pipeline outputs. Validates inputs via
 * Zod then delegates to AgentRuntime for LLM-based execution.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import { z } from 'zod';

// ============================================================================
// Input Schemas
// ============================================================================

const RouteRequestInputSchema = z.object({
  userMessage: z.string(),
  context: z.record(z.unknown()).optional(),
});

const GenerateConsolidatedReportInputSchema = z.object({
  reportType: z.string(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().optional(),
  sections: z.unknown().optional(),
  auditResults: z.unknown().optional(),
  inconsistencies: z.unknown().optional(),
  format: z.string().default('pdf'),
  formats: z.array(z.string()).optional(),
});

export type RouteRequestInput = z.infer<typeof RouteRequestInputSchema>;
export type GenerateConsolidatedReportInput = z.infer<typeof GenerateConsolidatedReportInputSchema>;

// ============================================================================
// Agent
// ============================================================================

export class SupervisorAgent {
  static readonly AGENT_ID = 'supervisor-agent';
  static readonly SUPPORTED_TASKS = [
    'route-request',
    'generate-consolidated-report',
  ] as const;

  private runtime: AgentRuntime;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  async routeRequest(input: unknown): Promise<TaskResult> {
    const validated = RouteRequestInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: SupervisorAgent.AGENT_ID,
      taskName: 'route-request',
      parameters: validated as Record<string, unknown>,
    });
  }

  async generateConsolidatedReport(input: unknown): Promise<TaskResult> {
    const validated = GenerateConsolidatedReportInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: SupervisorAgent.AGENT_ID,
      taskName: 'generate-consolidated-report',
      parameters: validated as Record<string, unknown>,
    });
  }
}
