/**
 * AuditPipeline — Orchestrates the automated digital presence audit (BSS-7.3).
 *
 * Coordinates all analysis phases:
 * 1. Fetch and parse each URL (PageFetcher)
 * 2. Tone of voice analysis (ToneAnalyzer)
 * 3. Messaging consistency analysis (MessagingAnalyzer)
 * 4. Visual consistency analysis (VisualAnalyzer)
 * 5. Improvement opportunities generation (AI)
 * 6. Competitive gap assessment (CompetitiveAnalyzer)
 * 7. Confidence level assignment
 * 8. Persist report to R2 + post ClickUp summary
 *
 * Provides a polling-based progress interface (AC-10).
 *
 * @module onboarding/audit/audit-pipeline
 */

import type {
  AuditReport,
  AuditPipelineDeps,
  AuditPipelineConfig,
  AuditPipelineProgress,
  AuditPipelineStatus,
  AuditUrlProgress,
  PageAnalysis,
  ImprovementItem,
  InferenceItem,
  ConfidenceLevel,
  AuditAIService,
  AuditLogger,
} from './audit-types';

import { DEFAULT_AUDIT_CONFIG } from './audit-types';

import type { AuditUrl } from './types';

import { PageFetcher } from './page-fetcher';
import { ToneAnalyzer } from './tone-analyzer';
import { MessagingAnalyzer } from './messaging-analyzer';
import { VisualAnalyzer } from './visual-analyzer';
import { CompetitiveAnalyzer } from './competitive-analyzer';

// ---------------------------------------------------------------------------
// R2 Key Construction
// ---------------------------------------------------------------------------

/**
 * Build the R2 storage key for audit-report.json (AC-9).
 */
export function buildAuditReportR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/audit-report.json`;
}

// ---------------------------------------------------------------------------
// Improvement Opportunities Prompt (AC-6)
// ---------------------------------------------------------------------------

const IMPROVEMENTS_SYSTEM_PROMPT = `You are a brand audit specialist. Based on the analysis data provided, identify 3-5 specific, actionable improvement opportunities for the client's digital brand presence.`;

function buildImprovementsPrompt(
  pages: readonly PageAnalysis[],
  toneReasoning: string,
  messagingReasoning: string,
  visualReasoning: string,
): string {
  const accessibleCount = pages.filter((p) => p.accessible).length;
  const totalCount = pages.length;

  const pageSummaries = pages
    .filter((p) => p.accessible)
    .slice(0, 8)
    .map((p) => {
      const parts: string[] = [`URL: ${p.url}`];
      if (p.title) parts.push(`Title: ${p.title}`);
      if (p.headings.length > 0)
        parts.push(`Headings: ${p.headings.map((h) => h.text).slice(0, 5).join(', ')}`);
      return parts.join(' | ');
    })
    .join('\n');

  return `Based on the following audit data, identify 3-5 specific improvement opportunities. Provide your response as a JSON array:

[
  {
    "title": "<concise title>",
    "description": "<specific gap description, e.g. 'No clear brand tagline detected across 4 of 6 pages'>",
    "category": "<'branding' | 'messaging' | 'visual' | 'content' | 'seo'>"
  }
]

Audit Data:
- ${accessibleCount} of ${totalCount} URLs accessible
- Pages: ${pageSummaries}
- Tone analysis: ${toneReasoning}
- Messaging analysis: ${messagingReasoning}
- Visual analysis: ${visualReasoning}

Respond with ONLY the JSON array, no additional text.`;
}

// ---------------------------------------------------------------------------
// Inference Collection (AC-8)
// ---------------------------------------------------------------------------

/**
 * Collect all inferences from analysis results with confidence levels.
 */
function collectInferences(
  report: Omit<AuditReport, 'inferences'>,
): InferenceItem[] {
  const inferences: InferenceItem[] = [];

  // Tone inferences
  if (report.toneOfVoice.formalCasualLabel !== 'Unable to determine') {
    inferences.push({
      category: 'tone',
      statement: `Brand tone is ${report.toneOfVoice.formalCasualLabel} with ${report.toneOfVoice.emotionalRegister.join(', ')} register.`,
      confidence: report.toneOfVoice.confidence,
      sourceUrls: report.pageAnalyses.filter((p) => p.accessible).map((p) => p.url),
    });
  }

  // Messaging inferences
  for (const vp of report.messagingConsistency.recurringValuePropositions) {
    inferences.push({
      category: 'messaging',
      statement: `Recurring value proposition: "${vp}"`,
      confidence: report.messagingConsistency.confidence,
      sourceUrls: report.pageAnalyses.filter((p) => p.accessible).map((p) => p.url),
    });
  }

  for (const contradiction of report.messagingConsistency.contradictions) {
    inferences.push({
      category: 'messaging',
      statement: `Messaging contradiction: ${contradiction.description}`,
      confidence: 'Medium',
      sourceUrls: contradiction.sourceUrls,
    });
  }

  // Visual inferences
  if (report.visualConsistency.colorPalette.length > 0) {
    const topColors = report.visualConsistency.colorPalette
      .slice(0, 3)
      .map((c) => c.hexValue);
    inferences.push({
      category: 'visual',
      statement: `Primary brand colors detected: ${topColors.join(', ')}`,
      confidence: report.visualConsistency.confidence,
      sourceUrls: report.pageAnalyses.filter((p) => p.accessible).map((p) => p.url),
    });
  }

  // Improvement inferences
  for (const item of report.improvementOpportunities) {
    inferences.push({
      category: item.category,
      statement: item.description,
      confidence: item.confidence,
      sourceUrls: [],
    });
  }

  return inferences;
}

// ---------------------------------------------------------------------------
// AuditPipeline Class
// ---------------------------------------------------------------------------

/**
 * Orchestrates the complete automated digital presence audit.
 *
 * Usage:
 * ```typescript
 * const pipeline = new AuditPipeline('client-123', deps);
 * const report = await pipeline.run(auditUrls, competitorUrls);
 * const progress = pipeline.getProgress(); // for polling endpoint
 * ```
 */
export class AuditPipeline {
  private readonly clientId: string;
  private readonly deps: AuditPipelineDeps;
  private readonly config: AuditPipelineConfig;
  private readonly logger?: AuditLogger;

  // Progress tracking (AC-10)
  private status: AuditPipelineStatus = 'pending';
  private startedAt: string = '';
  private updatedAt: string = '';
  private urlProgress: AuditUrlProgress[] = [];
  private currentPhase: string = 'initializing';
  private pipelineError?: string;

  constructor(
    clientId: string,
    deps: AuditPipelineDeps,
    config?: Partial<AuditPipelineConfig>,
  ) {
    this.clientId = clientId;
    this.deps = deps;
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
    this.logger = deps.logger;
  }

  // -------------------------------------------------------------------------
  // Progress Polling (AC-10)
  // -------------------------------------------------------------------------

  /**
   * Get current pipeline progress for polling endpoint (AC-10).
   */
  getProgress(): AuditPipelineProgress {
    return {
      clientId: this.clientId,
      status: this.status,
      startedAt: this.startedAt,
      updatedAt: this.updatedAt,
      urlProgress: [...this.urlProgress],
      completedUrls: this.urlProgress.filter((u) => u.status === 'complete').length,
      totalUrls: this.urlProgress.length,
      currentPhase: this.currentPhase,
      error: this.pipelineError,
    };
  }

  // -------------------------------------------------------------------------
  // Main Execution
  // -------------------------------------------------------------------------

  /**
   * Run the complete audit pipeline (AC-1 through AC-10).
   *
   * @param auditUrls - URLs collected from BSS-7.2
   * @param competitorUrls - Competitor URLs from BSS-7.1 intake (optional)
   * @returns The complete audit report
   */
  async run(
    auditUrls: readonly AuditUrl[],
    competitorUrls: readonly string[] = [],
  ): Promise<AuditReport> {
    this.startedAt = new Date().toISOString();
    this.updatedAt = this.startedAt;
    this.status = 'fetching';

    // Initialize URL progress tracking
    this.urlProgress = auditUrls.map((u) => ({
      url: u.url,
      status: 'pending' as const,
    }));

    try {
      // Phase 1: Fetch all URLs (AC-1)
      this.updatePhase('fetching');
      const pageFetcher = new PageFetcher(
        this.deps.httpFetcher,
        { fetchTimeoutMs: this.config.fetchTimeoutMs },
        this.logger,
      );

      const pageAnalyses = await this.fetchAllUrls(pageFetcher, auditUrls);

      // Phase 1b: Fetch competitor URLs if provided (AC-7)
      let competitorAnalyses: PageAnalysis[] = [];
      if (competitorUrls.length > 0) {
        this.updatePhase('fetching-competitors');
        competitorAnalyses = await this.fetchCompetitorUrls(pageFetcher, competitorUrls);
      }

      // Phase 2: Run all analyses in parallel (AC-3, AC-4, AC-5)
      this.updatePhase('analyzing');
      this.status = 'analyzing';

      const toneAnalyzer = new ToneAnalyzer(this.deps.aiService, this.logger);
      const messagingAnalyzer = new MessagingAnalyzer(this.deps.aiService, this.logger);
      const visualAnalyzer = new VisualAnalyzer(this.deps.aiService, this.logger);
      const competitiveAnalyzer = new CompetitiveAnalyzer(this.deps.aiService, this.logger);

      const [toneOfVoice, messagingConsistency, visualConsistency, competitiveGap] =
        await Promise.all([
          toneAnalyzer.analyze(pageAnalyses, this.clientId),
          messagingAnalyzer.analyze(pageAnalyses, this.clientId),
          visualAnalyzer.analyze(pageAnalyses, this.clientId),
          competitiveAnalyzer.analyze(pageAnalyses, competitorAnalyses, this.clientId),
        ]);

      // Phase 3: Generate improvement opportunities (AC-6)
      this.updatePhase('generating-improvements');
      const improvementOpportunities = await this.generateImprovements(
        pageAnalyses,
        toneOfVoice.reasoning,
        messagingConsistency.reasoning,
        visualConsistency.reasoning,
      );

      // Phase 4: Build report and collect inferences (AC-8)
      this.updatePhase('building-report');
      const accessibleCount = pageAnalyses.filter((p) => p.accessible).length;

      const partialReport: Omit<AuditReport, 'inferences'> = {
        clientId: this.clientId,
        generatedAt: new Date().toISOString(),
        urlsSubmitted: auditUrls.length,
        urlsAccessible: accessibleCount,
        pageAnalyses,
        toneOfVoice,
        messagingConsistency,
        visualConsistency,
        improvementOpportunities,
        competitiveGap,
      };

      const inferences = collectInferences(partialReport);

      const report: AuditReport = {
        ...partialReport,
        inferences,
      };

      // Phase 5: Persist to R2 (AC-9)
      this.updatePhase('persisting');
      await this.persistReport(report);

      // Phase 6: Post ClickUp comment (AC-9) — non-blocking
      if (this.deps.clickUpClient && this.deps.clickUpTaskId) {
        this.updatePhase('notifying');
        await this.postClickUpSummary(report);
      }

      // Complete
      this.status = 'complete';
      this.updatePhase('complete');

      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.status = 'failed';
      this.pipelineError = errorMessage;
      this.updatePhase('failed');
      this.logger?.error(`Audit pipeline failed: ${errorMessage}`);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Internal: URL Fetching
  // -------------------------------------------------------------------------

  /**
   * Fetch all audit URLs with concurrency control.
   * Inaccessible URLs are marked but don't abort the pipeline (AC-1).
   */
  private async fetchAllUrls(
    fetcher: PageFetcher,
    auditUrls: readonly AuditUrl[],
  ): Promise<PageAnalysis[]> {
    const results: PageAnalysis[] = [];

    // Process in batches for concurrency control
    const batchSize = this.config.maxConcurrentFetches;

    for (let i = 0; i < auditUrls.length; i += batchSize) {
      const batch = auditUrls.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (auditUrl, batchIndex) => {
          const index = i + batchIndex;
          this.updateUrlProgress(index, 'fetching');

          try {
            const result = await fetcher.fetchAndAnalyze(auditUrl.url);
            this.updateUrlProgress(
              index,
              result.accessible ? 'complete' : 'failed',
              result.accessible ? undefined : result.accessError,
            );
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.updateUrlProgress(index, 'failed', errorMessage);
            return {
              url: auditUrl.url,
              accessible: false,
              accessError: errorMessage,
              headings: [],
              dominantColors: [],
              fontNames: [],
              imageryDescriptions: [],
              textContent: '',
              fetchedAt: new Date().toISOString(),
            } as PageAnalysis;
          }
        }),
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Fetch competitor URLs.
   */
  private async fetchCompetitorUrls(
    fetcher: PageFetcher,
    urls: readonly string[],
  ): Promise<PageAnalysis[]> {
    const results = await Promise.all(
      urls.map((url) => fetcher.fetchAndAnalyze(url)),
    );
    return results;
  }

  // -------------------------------------------------------------------------
  // Internal: Improvement Opportunities (AC-6)
  // -------------------------------------------------------------------------

  /**
   * Generate 3-5 improvement opportunities using AI (AC-6).
   */
  private async generateImprovements(
    pages: readonly PageAnalysis[],
    toneReasoning: string,
    messagingReasoning: string,
    visualReasoning: string,
  ): Promise<ImprovementItem[]> {
    try {
      const prompt = buildImprovementsPrompt(
        pages,
        toneReasoning,
        messagingReasoning,
        visualReasoning,
      );

      const response = await this.deps.aiService.generateText(prompt, {
        systemPrompt: IMPROVEMENTS_SYSTEM_PROMPT,
        maxTokens: 500,
        temperature: 0.4,
        clientId: this.clientId,
      });

      return this.parseImprovements(response.text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error(`Improvement generation AI call failed: ${errorMessage}`);
      return [];
    }
  }

  /** Parse AI improvement opportunities response. */
  private parseImprovements(text: string): ImprovementItem[] {
    try {
      const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr) as Array<Record<string, unknown>>;

      if (!Array.isArray(parsed)) return [];

      const validCategories = ['branding', 'messaging', 'visual', 'content', 'seo'] as const;

      return parsed
        .filter(
          (item) =>
            typeof item['title'] === 'string' &&
            typeof item['description'] === 'string',
        )
        .slice(0, 5) // Cap at 5
        .map((item) => {
          const rawCategory = item['category'] as string | undefined;
          const category =
            rawCategory && (validCategories as readonly string[]).includes(rawCategory)
              ? (rawCategory as ImprovementItem['category'])
              : 'branding';

          return {
            title: item['title'] as string,
            description: item['description'] as string,
            category,
            confidence: 'Medium' as ConfidenceLevel,
          };
        });
    } catch {
      this.logger?.warn('Failed to parse improvements AI response as JSON');
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // Internal: Persistence (AC-9)
  // -------------------------------------------------------------------------

  /**
   * Persist audit report to R2 (AC-9).
   */
  private async persistReport(report: AuditReport): Promise<void> {
    const r2Key = buildAuditReportR2Key(this.clientId);
    try {
      await this.deps.r2Client.uploadJson(r2Key, report);
      this.logger?.info(`Audit report persisted to R2: ${r2Key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to persist audit report to R2: ${errorMessage}`);
    }
  }

  /**
   * Post audit summary to ClickUp (AC-9).
   * Non-blocking — failures are logged but don't abort the pipeline.
   */
  private async postClickUpSummary(report: AuditReport): Promise<void> {
    if (!this.deps.clickUpClient || !this.deps.clickUpTaskId) return;

    try {
      const summary = this.buildClickUpSummary(report);
      await this.deps.clickUpClient.postComment(this.deps.clickUpTaskId, summary);
      this.logger?.info('Audit summary posted to ClickUp');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.warn(`ClickUp comment failed (non-critical): ${errorMessage}`);
    }
  }

  /** Build a human-readable summary for ClickUp. */
  private buildClickUpSummary(report: AuditReport): string {
    const lines: string[] = [
      `**Digital Presence Audit Complete**`,
      ``,
      `- URLs analyzed: ${report.urlsAccessible}/${report.urlsSubmitted} accessible`,
      `- Tone: ${report.toneOfVoice.formalCasualLabel} (${report.toneOfVoice.confidence} confidence)`,
      `- Messaging consistency: ${report.messagingConsistency.consistencyScore}/5`,
      `- Visual consistency: ${report.visualConsistency.consistencyScore}/5`,
      `- Improvement opportunities: ${report.improvementOpportunities.length}`,
    ];

    if (report.competitiveGap.available && report.competitiveGap.gaps) {
      lines.push(`- Competitive gaps identified: ${report.competitiveGap.gaps.length}`);
    }

    lines.push(``, `Full report: audit-report.json in R2`);

    return lines.join('\n');
  }

  // -------------------------------------------------------------------------
  // Internal: Progress Tracking (AC-10)
  // -------------------------------------------------------------------------

  private updatePhase(phase: string): void {
    this.currentPhase = phase;
    this.updatedAt = new Date().toISOString();
  }

  private updateUrlProgress(
    index: number,
    status: AuditUrlProgress['status'],
    error?: string,
  ): void {
    if (index >= 0 && index < this.urlProgress.length) {
      this.urlProgress[index] = {
        ...this.urlProgress[index],
        status,
        ...(error ? { error } : {}),
      };
      this.updatedAt = new Date().toISOString();
    }
  }
}
