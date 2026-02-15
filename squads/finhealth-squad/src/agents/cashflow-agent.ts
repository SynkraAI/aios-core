/**
 * Cash Flow Agent
 * FinHealth Squad
 *
 * Handles cash flow forecasting, anomaly detection, and
 * financial report generation. Validates inputs via Zod then
 * delegates to AgentRuntime for LLM-based execution.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import { z } from 'zod';

// ============================================================================
// Input Schemas
// ============================================================================

const ForecastInputSchema = z.object({
  baseMonth: z.number().min(1).max(12).optional(),
  baseYear: z.number().optional(),
  projectionMonths: z.number().default(3),
  historicalMonths: z.number().default(12),
});

const DetectAnomaliesInputSchema = z.object({
  period: z.number().default(30),
});

const GenerateReportInputSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number(),
  auditSummary: z.unknown().optional(),
  reconciliationSummary: z.unknown().optional(),
  projections: z.unknown().optional(),
  formats: z.array(z.string()).default(['pdf']),
});

export type ForecastInput = z.infer<typeof ForecastInputSchema>;
export type DetectAnomaliesInput = z.infer<typeof DetectAnomaliesInputSchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

// ============================================================================
// Agent
// ============================================================================

export class CashflowAgent {
  static readonly AGENT_ID = 'cashflow-agent';
  static readonly SUPPORTED_TASKS = [
    'forecast-cashflow',
    'detect-anomalies',
    'generate-financial-report',
  ] as const;

  private runtime: AgentRuntime;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  async forecastCashflow(input: unknown): Promise<TaskResult> {
    const validated = ForecastInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: CashflowAgent.AGENT_ID,
      taskName: 'forecast-cashflow',
      parameters: validated as Record<string, unknown>,
    });
  }

  async detectAnomalies(input: unknown): Promise<TaskResult> {
    const validated = DetectAnomaliesInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: CashflowAgent.AGENT_ID,
      taskName: 'detect-anomalies',
      parameters: validated as Record<string, unknown>,
    });
  }

  async generateFinancialReport(input: unknown): Promise<TaskResult> {
    const validated = GenerateReportInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: CashflowAgent.AGENT_ID,
      taskName: 'generate-financial-report',
      parameters: validated as Record<string, unknown>,
    });
  }
}
