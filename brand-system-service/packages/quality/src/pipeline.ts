/**
 * Quality Scoring Pipeline — iteration/regeneration loop.
 *
 * Generates content, scores it, and if the average is below threshold,
 * appends feedback and regenerates up to maxIterations times. Returns
 * the best-scoring result.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */

import type { AIServiceProvider, AITextResponse } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext, RenderedPrompt } from '@brand-system/prompts';
import { render } from '@brand-system/prompts';
import type { DeliverableType } from '@brand-system/prompts';
import { QualityScorer } from './scorer';
import type { ScorerClientContext } from './scorer';
import type {
  QualityReport,
  QualityResult,
  QualityPipelineOptions,
} from './types';
import {
  DEFAULT_MAX_ITERATIONS,
  DEFAULT_QUALITY_THRESHOLD,
} from './types';

/**
 * Quality scoring pipeline that generates content, evaluates it, and
 * iterates with feedback until the quality threshold is met or max
 * iterations are reached.
 */
export class QualityPipeline {
  private readonly aiService: AIServiceProvider;
  private readonly promptRegistry: PromptRegistry;
  private readonly scorer: QualityScorer;
  private readonly maxIterations: number;
  private readonly qualityThreshold: number;

  constructor(
    aiService: AIServiceProvider,
    promptRegistry: PromptRegistry,
    options: QualityPipelineOptions = {},
  ) {
    this.aiService = aiService;
    this.promptRegistry = promptRegistry;
    const envMax = parseInt(process.env['QUALITY_MAX_ITERATIONS'] ?? '', 10);
    this.maxIterations = options.maxIterations ?? (Number.isNaN(envMax) ? DEFAULT_MAX_ITERATIONS : envMax);
    this.qualityThreshold = options.qualityThreshold ?? DEFAULT_QUALITY_THRESHOLD;
    this.scorer = new QualityScorer(aiService, this.qualityThreshold);
  }

  /**
   * Run the quality scoring pipeline for a deliverable.
   *
   * @param deliverableType - Type of content to generate
   * @param clientContext - Client brand context
   * @param variant - A/B variant identifier (default: 'A')
   * @returns QualityResult with the best content and full iteration history
   */
  async runPipeline(
    deliverableType: DeliverableType,
    clientContext: ClientContext,
    variant: string = 'A',
  ): Promise<QualityResult> {
    const template = this.promptRegistry.getTemplate(deliverableType, undefined, variant);
    if (!template) {
      throw new Error(
        `No active template found for deliverableType="${deliverableType}", variant="${variant}"`,
      );
    }

    const scorerContext: ScorerClientContext = {
      clientId: clientContext.clientId,
      brandName: clientContext.brandName,
      brandPersonality: clientContext.brandPersonality,
      toneSpectrum: clientContext.toneSpectrum,
      platform: (clientContext as Record<string, unknown>)['platform'] as string | undefined,
    };

    const iterationHistory: QualityReport[] = [];
    let bestResult: { content: string; report: QualityReport } | null = null;
    let accumulatedFeedback = '';

    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      // Step 1: Render the prompt
      const rendered: RenderedPrompt = render(template, clientContext);

      // Append feedback from previous iteration if any
      let userPrompt = rendered.user;
      if (accumulatedFeedback) {
        userPrompt += `\n\n[Previous feedback - please address these issues:\n${accumulatedFeedback}]`;
      }

      // Step 2: Generate content via AIService
      const response: AITextResponse = await this.aiService.generateText({
        prompt: userPrompt,
        systemPrompt: rendered.system,
        provider: 'claude',
        clientId: clientContext.clientId,
      });

      const generatedContent = response.text;

      // Step 3: Score the content
      const report = await this.scorer.score(
        generatedContent,
        scorerContext,
        template.version,
        variant,
        iteration,
      );

      iterationHistory.push(report);

      // Track best result
      if (!bestResult || report.averageScore > bestResult.report.averageScore) {
        bestResult = { content: generatedContent, report };
      }

      // Step 4: Check if approved
      if (report.approved) {
        return {
          content: generatedContent,
          report,
          iterationHistory,
        };
      }

      // Accumulate feedback for next iteration
      accumulatedFeedback = report.feedback;
    }

    // Max iterations reached — return best result with flag
    const finalReport: QualityReport = {
      ...bestResult!.report,
      maxIterationsReached: true,
    };

    return {
      content: bestResult!.content,
      report: finalReport,
      iterationHistory,
    };
  }
}
