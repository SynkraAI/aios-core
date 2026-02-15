/**
 * Auditor Agent
 * FinHealth Squad
 *
 * Handles batch auditing of medical accounts, glosa risk scoring,
 * and inconsistency detection. Mixed-mode: native DB queries +
 * business logic, with LLM delegation for semantic analysis.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import {
  MedicalAccountRepository,
  ProcedureRepository,
  GlosaRepository,
  MedicalAccount,
  Procedure,
  Glosa,
} from '../database/supabase-client';
import { z } from 'zod';
import { logger } from '../logger';

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
// Constants
// ============================================================================

const GLOSA_TYPE_WEIGHTS: Record<string, number> = {
  administrativa: 0.8,
  tecnica: 0.5,
  linear: 0.3,
};

// ============================================================================
// Agent
// ============================================================================

export class AuditorAgent {
  private runtime: AgentRuntime;
  private accountRepo: MedicalAccountRepository;
  private procedureRepo: ProcedureRepository;
  private glosaRepo: GlosaRepository;

  constructor(runtime: AgentRuntime, organizationId: string) {
    this.runtime = runtime;
    this.accountRepo = new MedicalAccountRepository(organizationId);
    this.procedureRepo = new ProcedureRepository(organizationId);
    this.glosaRepo = new GlosaRepository(organizationId);
  }

  async auditBatch(input: unknown): Promise<TaskResult> {
    const validated = AuditBatchInputSchema.parse(input);

    const accounts = await this.accountRepo.findPendingAccounts(validated.batchSize);

    if (accounts.length === 0) {
      return {
        success: true,
        output: { audited: 0, message: 'No pending accounts to audit' },
      };
    }

    const results: Array<{ accountId: string; auditScore: number; glosaRisk: number }> = [];
    let totalAmount = 0;

    for (const account of accounts) {
      const procedures = await this.procedureRepo.findByAccountId(account.id);
      const procedureTotal = procedures.reduce((sum, p) => sum + p.total_price, 0);
      totalAmount += procedureTotal;

      // LLM-based risk analysis per account
      const aiResult = await this.runtime.executeTask({
        agentId: 'auditor-agent',
        taskName: 'audit-risk-analysis',
        parameters: {
          account: {
            id: account.id,
            type: account.account_type,
            totalAmount: account.total_amount,
            status: account.status,
          },
          procedureCount: procedures.length,
          procedureTotal,
        },
      });

      const auditScore = aiResult.output?.auditScore ?? 75;
      const glosaRisk = aiResult.output?.glosaRisk ?? 25;

      await this.accountRepo.updateAuditScore(account.id, auditScore, glosaRisk);
      results.push({ accountId: account.id, auditScore, glosaRisk });
    }

    const avgScore = results.reduce((s, r) => s + r.auditScore, 0) / results.length;

    return {
      success: true,
      output: {
        audited: accounts.length,
        totalAmount,
        averageAuditScore: Math.round(avgScore * 100) / 100,
        results,
      },
    };
  }

  async auditAccount(input: unknown): Promise<TaskResult> {
    const validated = AuditAccountInputSchema.parse(input);

    const account = await this.accountRepo.findById(validated.accountId);
    if (!account) {
      return { success: false, output: null, errors: [`Account not found: ${validated.accountId}`] };
    }

    const procedures = await this.procedureRepo.findByAccountId(account.id);
    const glosas = await this.glosaRepo.findByAccountId(account.id);

    const glosaRatio = account.total_amount > 0
      ? glosas.reduce((sum, g) => sum + g.glosa_amount, 0) / account.total_amount
      : 0;

    // LLM deep audit with full context
    const aiResult = await this.runtime.executeTask({
      agentId: 'auditor-agent',
      taskName: 'deep-audit',
      parameters: {
        account: {
          id: account.id,
          type: account.account_type,
          totalAmount: account.total_amount,
          glosaRatio,
          tissValidationStatus: account.tiss_validation_status,
        },
        procedures: procedures.map((p) => ({
          id: p.id,
          code: p.tuss_code || p.sigtap_code,
          description: p.description,
          quantity: p.quantity,
          totalPrice: p.total_price,
        })),
        glosas: glosas.map((g) => ({
          code: g.glosa_code,
          type: g.glosa_type,
          amount: g.glosa_amount,
        })),
        validateTiss: validated.validateTiss,
        guideXml: validated.guideXml,
      },
    });

    const auditScore = aiResult.output?.auditScore ?? 70;
    const glosaRiskScore = aiResult.output?.glosaRisk ?? Math.round(glosaRatio * 100);

    await this.accountRepo.updateAuditScore(account.id, auditScore, glosaRiskScore, {
      glosaRatio,
      procedureCount: procedures.length,
      glosaCount: glosas.length,
      aiAnalysis: aiResult.output?.analysis,
    });

    return {
      success: true,
      output: {
        accountId: account.id,
        auditScore,
        glosaRiskScore,
        glosaRatio: Math.round(glosaRatio * 10000) / 100,
        procedureCount: procedures.length,
        glosaCount: glosas.length,
        analysis: aiResult.output?.analysis,
        recommendations: aiResult.output?.recommendations,
      },
    };
  }

  async scoreGlosaRisk(input: unknown): Promise<TaskResult> {
    const validated = ScoreGlosaRiskInputSchema.parse(input);

    const account = await this.accountRepo.findById(validated.accountId);
    if (!account) {
      return { success: false, output: null, errors: [`Account not found: ${validated.accountId}`] };
    }

    const glosas = await this.glosaRepo.findByAccountId(account.id);
    if (glosas.length === 0) {
      return {
        success: true,
        output: { accountId: account.id, scored: 0, message: 'No glosas found for account' },
      };
    }

    const scoredGlosas: Array<{
      glosaId: string;
      priorityScore: number;
      probability: number;
      recommendation: string;
    }> = [];

    for (const glosa of glosas) {
      const amountRatio = account.total_amount > 0
        ? glosa.glosa_amount / account.total_amount
        : 0;
      const typeWeight = GLOSA_TYPE_WEIGHTS[glosa.glosa_type || ''] ?? 0.5;

      // LLM scoring + recommendation text
      const aiResult = await this.runtime.executeTask({
        agentId: 'auditor-agent',
        taskName: 'score-risk-detail',
        parameters: {
          glosa: {
            code: glosa.glosa_code,
            type: glosa.glosa_type,
            description: glosa.glosa_description,
            amount: glosa.glosa_amount,
            originalAmount: glosa.original_amount,
          },
          amountRatio,
          typeWeight,
          accountType: account.account_type,
        },
      });

      const probability = aiResult.output?.successProbability ?? Math.round((1 - amountRatio) * typeWeight * 100);
      const recommendation = aiResult.output?.recommendation ?? `Glosa ${glosa.glosa_code}: recurso recomendado com probabilidade ${probability}%`;
      const priorityScore = glosa.glosa_amount * (probability / 100);

      await this.glosaRepo.updateRiskScore(glosa.id, recommendation, probability, priorityScore);
      scoredGlosas.push({ glosaId: glosa.id, priorityScore, probability, recommendation });
    }

    return {
      success: true,
      output: {
        accountId: account.id,
        scored: scoredGlosas.length,
        glosas: scoredGlosas,
      },
    };
  }

  async detectInconsistencies(input: unknown): Promise<TaskResult> {
    const validated = DetectInconsistenciesInputSchema.parse(input);

    let accounts: MedicalAccount[] = [];

    if (validated.accountId) {
      const account = await this.accountRepo.findById(validated.accountId);
      if (account) accounts = [account];
    } else {
      accounts = await this.accountRepo.findPendingAccounts(50);
    }

    if (accounts.length === 0) {
      return { success: true, output: { inconsistencies: [], total: 0 } };
    }

    const inconsistencies: Array<{
      accountId: string;
      type: string;
      description: string;
      severity: string;
    }> = [];

    // Collect all guide numbers for duplicate detection
    const guideNumbers = new Map<string, string[]>();

    for (const account of accounts) {
      const procedures = await this.procedureRepo.findByAccountId(account.id);

      // Check duplicate guide numbers
      if (account.tiss_guide_number) {
        const existing = guideNumbers.get(account.tiss_guide_number) || [];
        existing.push(account.id);
        guideNumbers.set(account.tiss_guide_number, existing);
      }

      // Check amount mismatches
      const procedureTotal = procedures.reduce((sum, p) => sum + p.total_price, 0);
      if (Math.abs(account.total_amount - procedureTotal) > 0.01) {
        inconsistencies.push({
          accountId: account.id,
          type: 'amount_mismatch',
          description: `Total da conta (${account.total_amount}) difere da soma dos procedimentos (${procedureTotal.toFixed(2)})`,
          severity: 'high',
        });
      }
    }

    // Flag duplicate guide numbers
    for (const [guideNumber, accountIds] of guideNumbers) {
      if (accountIds.length > 1) {
        inconsistencies.push({
          accountId: accountIds[0],
          type: 'duplicate_guide',
          description: `Guia ${guideNumber} duplicada em ${accountIds.length} contas: ${accountIds.join(', ')}`,
          severity: 'critical',
        });
      }
    }

    // LLM semantic inconsistency detection
    const aiResult = await this.runtime.executeTask({
      agentId: 'auditor-agent',
      taskName: 'semantic-inconsistencies',
      parameters: {
        accounts: accounts.map((a) => ({
          id: a.id,
          type: a.account_type,
          totalAmount: a.total_amount,
          approvedAmount: a.approved_amount,
          glosaAmount: a.glosa_amount,
        })),
        nativeInconsistencies: inconsistencies,
      },
    });

    if (aiResult.output?.inconsistencies) {
      inconsistencies.push(...aiResult.output.inconsistencies);
    }

    return {
      success: true,
      output: {
        total: inconsistencies.length,
        inconsistencies,
      },
    };
  }
}
