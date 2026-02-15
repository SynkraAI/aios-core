/**
 * Reconciliation Agent
 * FinHealth Squad
 *
 * Handles payment reconciliation, invoice matching, appeal generation,
 * and appeal prioritization. Validates inputs via Zod then
 * delegates to AgentRuntime for LLM-based execution.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import { z } from 'zod';

// ============================================================================
// Input Schemas
// ============================================================================

const ReconcilePaymentInputSchema = z.object({
  paymentId: z.string().optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().optional(),
  reconcileAll: z.boolean().default(false),
  paymentDate: z.string().optional(),
  amount: z.number().optional(),
  insurerId: z.string().optional(),
  paymentFile: z.string().optional(),
});

const MatchInvoicesInputSchema = z.object({
  paymentId: z.string(),
  matchedInvoices: z.array(z.unknown()).optional(),
  glosas: z.array(z.unknown()).optional(),
});

const GenerateAppealInputSchema = z.object({
  glosaId: z.string().optional(),
  appeals: z.array(z.unknown()).optional(),
  strategy: z.unknown().optional(),
});

const PrioritizeAppealsInputSchema = z.object({
  glosas: z.array(z.unknown()).optional(),
  insurerId: z.string().optional(),
  limit: z.number().default(50),
});

export type ReconcilePaymentInput = z.infer<typeof ReconcilePaymentInputSchema>;
export type MatchInvoicesInput = z.infer<typeof MatchInvoicesInputSchema>;
export type GenerateAppealInput = z.infer<typeof GenerateAppealInputSchema>;
export type PrioritizeAppealsInput = z.infer<typeof PrioritizeAppealsInputSchema>;

// ============================================================================
// Agent
// ============================================================================

export class ReconciliationAgent {
  static readonly AGENT_ID = 'reconciliation-agent';
  static readonly SUPPORTED_TASKS = [
    'reconcile-payment',
    'match-invoices',
    'generate-appeal',
    'prioritize-appeals',
  ] as const;

  private runtime: AgentRuntime;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  async reconcilePayment(input: unknown): Promise<TaskResult> {
    const validated = ReconcilePaymentInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: ReconciliationAgent.AGENT_ID,
      taskName: 'reconcile-payment',
      parameters: validated as Record<string, unknown>,
    });
  }

  async matchInvoices(input: unknown): Promise<TaskResult> {
    const validated = MatchInvoicesInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: ReconciliationAgent.AGENT_ID,
      taskName: 'match-invoices',
      parameters: validated as Record<string, unknown>,
    });
  }

  async generateAppeal(input: unknown): Promise<TaskResult> {
    const validated = GenerateAppealInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: ReconciliationAgent.AGENT_ID,
      taskName: 'generate-appeal',
      parameters: validated as Record<string, unknown>,
    });
  }

  async prioritizeAppeals(input: unknown): Promise<TaskResult> {
    const validated = PrioritizeAppealsInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: ReconciliationAgent.AGENT_ID,
      taskName: 'prioritize-appeals',
      parameters: validated as Record<string, unknown>,
    });
  }
}
