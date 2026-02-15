/**
 * Cash Flow Agent
 * FinHealth Squad
 *
 * Handles cash flow forecasting, anomaly detection, and
 * financial report generation. Mixed-mode: native aggregation +
 * statistical calcs, with LLM delegation for narrative synthesis.
 */

import type { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import {
  PaymentRepository,
  MedicalAccountRepository,
  Payment,
} from '../database/supabase-client';
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
  private runtime: AgentRuntime;
  private paymentRepo: PaymentRepository;
  private accountRepo: MedicalAccountRepository;

  constructor(runtime: AgentRuntime, organizationId: string) {
    this.runtime = runtime;
    this.paymentRepo = new PaymentRepository(organizationId);
    this.accountRepo = new MedicalAccountRepository(organizationId);
  }

  async forecastCashflow(input: unknown): Promise<TaskResult> {
    const validated = ForecastInputSchema.parse(input);

    const now = new Date();
    const baseYear = validated.baseYear ?? now.getFullYear();
    const baseMonth = validated.baseMonth ?? (now.getMonth() + 1);

    // Calculate date range for historical data
    const fromDate = new Date(baseYear, baseMonth - 1 - validated.historicalMonths, 1);
    const toDate = new Date(baseYear, baseMonth - 1, 0); // last day of previous month

    const from = fromDate.toISOString().slice(0, 10);
    const to = toDate.toISOString().slice(0, 10);

    const payments = await this.paymentRepo.findByDateRange(from, to);

    // Aggregate by month
    const monthlyTotals = new Map<string, number>();
    for (const payment of payments) {
      const key = payment.payment_date.slice(0, 7); // YYYY-MM
      monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + payment.total_amount);
    }

    const months = [...monthlyTotals.keys()].sort();
    const values = months.map((m) => monthlyTotals.get(m) || 0);

    // Calculate linear trend
    const n = values.length;
    let slope = 0;
    let intercept = 0;

    if (n >= 2) {
      const sumX = (n * (n - 1)) / 2;
      const sumY = values.reduce((s, v) => s + v, 0);
      const sumXY = values.reduce((s, v, i) => s + i * v, 0);
      const sumX2 = values.reduce((s, _, i) => s + i * i, 0);

      slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      intercept = (sumY - slope * sumX) / n;
    }

    const projections: Array<{ month: string; projected: number }> = [];
    for (let i = 0; i < validated.projectionMonths; i++) {
      const projMonth = new Date(baseYear, baseMonth - 1 + i, 1);
      const monthKey = projMonth.toISOString().slice(0, 7);
      const projected = Math.max(0, intercept + slope * (n + i));
      projections.push({ month: monthKey, projected: Math.round(projected * 100) / 100 });
    }

    // LLM for seasonality + qualitative projection
    const aiResult = await this.runtime.executeTask({
      agentId: 'cashflow-agent',
      taskName: 'cashflow-qualitative',
      parameters: {
        historical: months.map((m, i) => ({ month: m, amount: values[i] })),
        trend: { slope, intercept },
        projections,
      },
    });

    return {
      success: true,
      output: {
        historical: months.map((m, i) => ({ month: m, amount: values[i] })),
        trend: { slope: Math.round(slope * 100) / 100, intercept: Math.round(intercept * 100) / 100 },
        projections,
        qualitativeAnalysis: aiResult.output?.analysis,
      },
    };
  }

  async detectAnomalies(input: unknown): Promise<TaskResult> {
    const validated = DetectAnomaliesInputSchema.parse(input);

    const now = new Date();
    const from = new Date(now.getTime() - validated.period * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);

    const payments = await this.paymentRepo.findByDateRange(from, to);

    if (payments.length < 2) {
      return {
        success: true,
        output: { anomalies: [], message: 'Insufficient data for anomaly detection' },
      };
    }

    const amounts = payments.map((p) => p.total_amount);
    const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
    const variance = amounts.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / amounts.length;
    const stddev = Math.sqrt(variance);

    const anomalies: Array<{
      paymentId: string;
      amount: number;
      deviation: number;
      type: string;
    }> = [];

    for (const payment of payments) {
      const deviation = stddev > 0 ? (payment.total_amount - mean) / stddev : 0;
      if (Math.abs(deviation) > 2) {
        anomalies.push({
          paymentId: payment.id,
          amount: payment.total_amount,
          deviation: Math.round(deviation * 100) / 100,
          type: deviation > 0 ? 'high_outlier' : 'low_outlier',
        });
      }
    }

    // LLM contextual analysis
    const aiResult = await this.runtime.executeTask({
      agentId: 'cashflow-agent',
      taskName: 'anomaly-context',
      parameters: {
        stats: { mean: Math.round(mean * 100) / 100, stddev: Math.round(stddev * 100) / 100, count: payments.length },
        anomalies,
      },
    });

    return {
      success: true,
      output: {
        stats: { mean: Math.round(mean * 100) / 100, stddev: Math.round(stddev * 100) / 100, count: payments.length },
        anomalies,
        contextualAnalysis: aiResult.output?.analysis,
      },
    };
  }

  async generateFinancialReport(input: unknown): Promise<TaskResult> {
    const validated = GenerateReportInputSchema.parse(input);

    const from = `${validated.year}-${String(validated.month).padStart(2, '0')}-01`;
    const lastDay = new Date(validated.year, validated.month, 0).getDate();
    const to = `${validated.year}-${String(validated.month).padStart(2, '0')}-${lastDay}`;

    const payments = await this.paymentRepo.findByDateRange(from, to);
    const accounts = await this.accountRepo.findPendingAccounts(500);

    // Calculate KPIs
    const receitaBruta = accounts.reduce((s, a) => s + a.total_amount, 0);
    const glosaTotal = accounts.reduce((s, a) => s + a.glosa_amount, 0);
    const receitaLiquida = receitaBruta - glosaTotal;
    const taxaGlosa = receitaBruta > 0 ? (glosaTotal / receitaBruta) * 100 : 0;

    // Average days to receive payment
    const paidAccounts = accounts.filter((a) => a.paid_at && a.sent_at);
    let diasMedioRecebimento = 0;
    if (paidAccounts.length > 0) {
      const totalDays = paidAccounts.reduce((s, a) => {
        const sent = new Date(a.sent_at!).getTime();
        const paid = new Date(a.paid_at!).getTime();
        return s + (paid - sent) / (1000 * 60 * 60 * 24);
      }, 0);
      diasMedioRecebimento = Math.round(totalDays / paidAccounts.length);
    }

    const kpis = {
      receitaBruta: Math.round(receitaBruta * 100) / 100,
      receitaLiquida: Math.round(receitaLiquida * 100) / 100,
      glosaTotal: Math.round(glosaTotal * 100) / 100,
      taxaGlosa: Math.round(taxaGlosa * 100) / 100,
      diasMedioRecebimento,
      totalPagamentos: payments.length,
      valorPagamentos: Math.round(payments.reduce((s, p) => s + p.total_amount, 0) * 100) / 100,
    };

    // LLM narrative synthesis
    const aiResult = await this.runtime.executeTask({
      agentId: 'cashflow-agent',
      taskName: 'report-narrative',
      parameters: {
        kpis,
        month: validated.month,
        year: validated.year,
        auditSummary: validated.auditSummary,
        reconciliationSummary: validated.reconciliationSummary,
      },
    });

    return {
      success: true,
      output: {
        period: `${validated.year}-${String(validated.month).padStart(2, '0')}`,
        kpis,
        narrative: aiResult.output?.narrative,
        formats: validated.formats,
      },
    };
  }
}
