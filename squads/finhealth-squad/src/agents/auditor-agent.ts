/**
 * Auditor Agent
 * FinHealth Squad
 *
 * Handles batch auditing of medical accounts, glosa risk scoring,
 * and inconsistency detection. Validates inputs via Zod then
 * delegates to AgentRuntime for LLM-based execution.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import { z } from 'zod';

// ============================================================================
// Input Schemas
// ============================================================================

const AuditBatchInputSchema = z.object({
  batchSize: z.number().default(100),
  status: z.enum(['pending', 'review', 'all']).default('pending'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const ScoreGlosaRiskInputSchema = z.object({
  accountId: z.string(),
});

const AuditAccountInputSchema = z.object({
  accountId: z.string(),
  guideXml: z.string().optional(),
  validateTiss: z.boolean().default(true),
});

const DetectInconsistenciesInputSchema = z.object({
  accounts: z.array(z.unknown()).optional(),
  accountId: z.string().optional(),
});

export type AuditBatchInput = z.infer<typeof AuditBatchInputSchema>;
export type AuditAccountInput = z.infer<typeof AuditAccountInputSchema>;
export type ScoreGlosaRiskInput = z.infer<typeof ScoreGlosaRiskInputSchema>;
export type DetectInconsistenciesInput = z.infer<typeof DetectInconsistenciesInputSchema>;

// ============================================================================
// Agent
// ============================================================================

export class AuditorAgent {
  static readonly AGENT_ID = 'auditor-agent';
  static readonly SUPPORTED_TASKS = [
    'audit-batch',
    'audit-account',
    'score-glosa-risk',
    'detect-inconsistencies',
  ] as const;

  private runtime: AgentRuntime;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  async auditBatch(input: unknown): Promise<TaskResult> {
    const validated = AuditBatchInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: AuditorAgent.AGENT_ID,
      taskName: 'audit-batch',
      parameters: validated as Record<string, unknown>,
    });
  }

  async auditAccount(input: unknown): Promise<TaskResult> {
    const validated = AuditAccountInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: AuditorAgent.AGENT_ID,
      taskName: 'audit-account',
      parameters: validated as Record<string, unknown>,
    });
  }

  async scoreGlosaRisk(input: unknown): Promise<TaskResult> {
    const validated = ScoreGlosaRiskInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: AuditorAgent.AGENT_ID,
      taskName: 'score-glosa-risk',
      parameters: validated as Record<string, unknown>,
    });
  }

  async detectInconsistencies(input: unknown): Promise<TaskResult> {
    const validated = DetectInconsistenciesInputSchema.parse(input);
    return this.runtime.executeTask({
      agentId: AuditorAgent.AGENT_ID,
      taskName: 'detect-inconsistencies',
      parameters: validated as Record<string, unknown>,
    });
  }
}
