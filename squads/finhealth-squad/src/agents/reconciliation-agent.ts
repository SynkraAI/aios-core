/**
 * Reconciliation Agent
 * FinHealth Squad
 *
 * Handles payment reconciliation, invoice matching, appeal generation,
 * and appeal prioritization. Mixed-mode: native DB queries + matching
 * logic, with LLM delegation for appeal text generation.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import {
  PaymentRepository,
  MedicalAccountRepository,
  GlosaRepository,
  Payment,
  MedicalAccount,
  Glosa,
} from '../database/supabase-client';
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
  private runtime: AgentRuntime;
  private paymentRepo: PaymentRepository;
  private accountRepo: MedicalAccountRepository;
  private glosaRepo: GlosaRepository;

  constructor(runtime: AgentRuntime, organizationId: string) {
    this.runtime = runtime;
    this.paymentRepo = new PaymentRepository(organizationId);
    this.accountRepo = new MedicalAccountRepository(organizationId);
    this.glosaRepo = new GlosaRepository(organizationId);
  }

  async reconcilePayment(input: unknown): Promise<TaskResult> {
    const validated = ReconcilePaymentInputSchema.parse(input);

    let payments: Payment[] = [];

    if (validated.paymentId) {
      const payment = await this.paymentRepo.findById(validated.paymentId);
      if (payment) payments = [payment];
    } else {
      payments = await this.paymentRepo.findUnreconciled();
    }

    if (payments.length === 0) {
      return {
        success: true,
        output: { reconciled: 0, message: 'No payments to reconcile' },
      };
    }

    const results: Array<{
      paymentId: string;
      status: string;
      matchedAmount: number;
      discrepancy: number;
    }> = [];

    for (const payment of payments) {
      // Load accounts and match by insurer
      const accounts = await this.accountRepo.findPendingAccounts(200);
      const insurerAccounts = accounts.filter(
        (a) => a.health_insurer_id === payment.health_insurer_id,
      );

      let matchedAmount = 0;
      const matchedAccountIds: string[] = [];

      for (const account of insurerAccounts) {
        if (account.tiss_guide_number && matchedAmount < payment.total_amount) {
          matchedAmount += account.total_amount;
          matchedAccountIds.push(account.id);
        }
      }

      const discrepancy = payment.total_amount - matchedAmount;
      const status = Math.abs(discrepancy) < 0.01 ? 'reconciled' : 'partial';

      await this.paymentRepo.updateReconciliation(payment.id, status, matchedAmount);

      // Create glosas for discrepancies
      if (discrepancy > 0.01 && matchedAccountIds.length > 0) {
        await this.glosaRepo.create({
          medical_account_id: matchedAccountIds[0],
          glosa_code: 'REC-DISC',
          glosa_type: 'administrativa',
          original_amount: payment.total_amount,
          glosa_amount: discrepancy,
          appeal_status: 'pending',
        });
      }

      results.push({
        paymentId: payment.id,
        status,
        matchedAmount,
        discrepancy,
      });
    }

    return {
      success: true,
      output: {
        reconciled: results.length,
        results,
      },
    };
  }

  async matchInvoices(input: unknown): Promise<TaskResult> {
    const validated = MatchInvoicesInputSchema.parse(input);

    const payment = await this.paymentRepo.findById(validated.paymentId);
    if (!payment) {
      return { success: false, output: null, errors: [`Payment not found: ${validated.paymentId}`] };
    }

    const accounts = await this.accountRepo.findPendingAccounts(200);
    const insurerAccounts = accounts.filter(
      (a) => a.health_insurer_id === payment.health_insurer_id,
    );

    const confirmed: Array<{ accountId: string; amount: number }> = [];
    const partial: Array<{ accountId: string; expected: number; paid: number }> = [];
    const unmatched: Array<{ accountId: string; amount: number }> = [];

    for (const account of insurerAccounts) {
      if (account.paid_amount > 0 && Math.abs(account.total_amount - account.paid_amount) < 0.01) {
        confirmed.push({ accountId: account.id, amount: account.total_amount });
      } else if (account.paid_amount > 0) {
        partial.push({
          accountId: account.id,
          expected: account.total_amount,
          paid: account.paid_amount,
        });
      } else {
        unmatched.push({ accountId: account.id, amount: account.total_amount });
      }
    }

    const matchedAmount = confirmed.reduce((s, c) => s + c.amount, 0)
      + partial.reduce((s, p) => s + p.paid, 0);

    await this.paymentRepo.updateReconciliation(
      payment.id,
      unmatched.length === 0 ? 'reconciled' : 'partial',
      matchedAmount,
    );

    return {
      success: true,
      output: {
        paymentId: payment.id,
        confirmed,
        partial,
        unmatched,
        matchedAmount,
        totalAmount: payment.total_amount,
      },
    };
  }

  async generateAppeal(input: unknown): Promise<TaskResult> {
    const validated = GenerateAppealInputSchema.parse(input);

    if (!validated.glosaId) {
      return { success: false, output: null, errors: ['glosaId is required'] };
    }

    const glosa = await this.glosaRepo.findById(validated.glosaId);
    if (!glosa) {
      return { success: false, output: null, errors: [`Glosa not found: ${validated.glosaId}`] };
    }

    const account = await this.accountRepo.findById(glosa.medical_account_id);

    // LLM generates appeal arguments
    const aiResult = await this.runtime.executeTask({
      agentId: 'reconciliation-agent',
      taskName: 'generate-appeal-text',
      parameters: {
        glosa: {
          code: glosa.glosa_code,
          type: glosa.glosa_type,
          description: glosa.glosa_description,
          amount: glosa.glosa_amount,
          originalAmount: glosa.original_amount,
        },
        account: account ? {
          type: account.account_type,
          totalAmount: account.total_amount,
          insurerId: account.health_insurer_id,
        } : null,
        strategy: validated.strategy,
      },
    });

    const appealText = aiResult.output?.appealText ?? `Recurso referente a glosa ${glosa.glosa_code}`;

    await this.glosaRepo.updateAppeal(glosa.id, appealText, 'in_progress');

    return {
      success: true,
      output: {
        glosaId: glosa.id,
        appealText,
        status: 'in_progress',
      },
    };
  }

  async prioritizeAppeals(input: unknown): Promise<TaskResult> {
    const validated = PrioritizeAppealsInputSchema.parse(input);

    const pendingGlosas = await this.glosaRepo.findPendingAppeals(validated.limit);

    if (pendingGlosas.length === 0) {
      return {
        success: true,
        output: { prioritized: 0, appeals: [], message: 'No pending appeals' },
      };
    }

    const prioritized = pendingGlosas.map((glosa) => {
      const probability = glosa.success_probability ?? 50;
      const priority = glosa.glosa_amount * (probability / 100);
      return {
        glosaId: glosa.id,
        glosaCode: glosa.glosa_code,
        amount: glosa.glosa_amount,
        probability,
        priority,
      };
    });

    // Sort by priority descending
    prioritized.sort((a, b) => b.priority - a.priority);

    return {
      success: true,
      output: {
        prioritized: prioritized.length,
        appeals: prioritized,
      },
    };
  }
}
