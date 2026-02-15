/**
 * Supervisor Agent
 * FinHealth Squad
 *
 * Orchestrates cross-agent coordination: routes user requests
 * to the correct specialist agent and generates consolidated
 * reports from multiple pipeline outputs. Mixed-mode: native
 * keyword extraction + LLM for semantic intent parsing.
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
// Constants
// ============================================================================

const KEYWORD_ROUTES: Array<{ keywords: string[]; agent: string; task: string }> = [
  { keywords: ['glosa', 'auditoria', 'audit', 'risco', 'inconsistencia'], agent: 'auditor-agent', task: 'audit-batch' },
  { keywords: ['pagamento', 'conciliacao', 'reconcilia', 'recurso', 'appeal'], agent: 'reconciliation-agent', task: 'reconcile-payment' },
  { keywords: ['relatorio', 'report', 'financeiro', 'cashflow', 'fluxo', 'previsao', 'forecast'], agent: 'cashflow-agent', task: 'generate-financial-report' },
  { keywords: ['tiss', 'faturamento', 'guia', 'billing', 'xml'], agent: 'billing-agent', task: 'validate-tiss' },
];

// ============================================================================
// Agent
// ============================================================================

export class SupervisorAgent {
  private runtime: AgentRuntime;
  private organizationId: string;

  constructor(runtime: AgentRuntime, organizationId: string) {
    this.runtime = runtime;
    this.organizationId = organizationId;
  }

  async routeRequest(input: unknown): Promise<TaskResult> {
    const validated = RouteRequestInputSchema.parse(input);

    const message = validated.userMessage.toLowerCase();

    // Native keyword extraction for fast routing
    let matchedRoute: { agent: string; task: string } | null = null;
    let maxMatches = 0;

    for (const route of KEYWORD_ROUTES) {
      const matches = route.keywords.filter((kw) => message.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedRoute = { agent: route.agent, task: route.task };
      }
    }

    // LLM semantic intent parsing for ambiguous cases
    const aiResult = await this.runtime.executeTask({
      agentId: 'supervisor-agent',
      taskName: 'parse-intent',
      parameters: {
        userMessage: validated.userMessage,
        keywordMatch: matchedRoute,
        context: validated.context,
      },
    });

    const finalAgent = aiResult.output?.agent ?? matchedRoute?.agent ?? 'supervisor-agent';
    const finalTask = aiResult.output?.task ?? matchedRoute?.task ?? 'general-query';
    const extractedParams = aiResult.output?.parameters ?? {};

    return {
      success: true,
      output: {
        routedTo: finalAgent,
        task: finalTask,
        parameters: extractedParams,
        confidence: matchedRoute ? (maxMatches > 1 ? 'high' : 'medium') : 'low',
        keywordMatch: matchedRoute !== null,
      },
    };
  }

  async generateConsolidatedReport(input: unknown): Promise<TaskResult> {
    const validated = GenerateConsolidatedReportInputSchema.parse(input);

    // Merge sections from input params and validate structure
    const sections: Record<string, unknown> = {};

    if (validated.auditResults) {
      sections.audit = validated.auditResults;
    }
    if (validated.inconsistencies) {
      sections.inconsistencies = validated.inconsistencies;
    }
    if (validated.sections && typeof validated.sections === 'object') {
      Object.assign(sections, validated.sections);
    }

    // LLM narrative synthesis across sections
    const aiResult = await this.runtime.executeTask({
      agentId: 'supervisor-agent',
      taskName: 'consolidate-report',
      parameters: {
        reportType: validated.reportType,
        month: validated.month,
        year: validated.year,
        sections,
        format: validated.format,
      },
    });

    return {
      success: true,
      output: {
        reportType: validated.reportType,
        period: validated.month && validated.year
          ? `${validated.year}-${String(validated.month).padStart(2, '0')}`
          : undefined,
        sections: Object.keys(sections),
        narrative: aiResult.output?.narrative,
        format: validated.format,
      },
    };
  }
}
