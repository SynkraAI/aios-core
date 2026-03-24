/**
 * A/B Testing — runs two prompt variants in parallel and returns
 * the higher-scoring result with a comparison report.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline (AC 5)
 */

import type { AIServiceProvider } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext } from '@brand-system/prompts';
import type { DeliverableType } from '@brand-system/prompts';
import { QualityPipeline } from './pipeline';
import type {
  ABComparisonReport,
  QualityPipelineOptions,
  QualityResult,
} from './types';

/**
 * A/B Tester runs two prompt variants in parallel, scores both, and
 * returns the winner with a comparison report.
 */
export class ABTester {
  private readonly pipeline: QualityPipeline;

  constructor(
    aiService: AIServiceProvider,
    promptRegistry: PromptRegistry,
    options: QualityPipelineOptions = {},
  ) {
    this.pipeline = new QualityPipeline(aiService, promptRegistry, options);
  }

  /**
   * Compare two prompt variants (A and B) on the same deliverable type
   * and client context. Runs both in parallel via Promise.all.
   *
   * @param deliverableType - Type of content to generate
   * @param clientContext - Client brand context
   * @returns ABComparisonReport with both results and the winner
   */
  async compareVariants(
    deliverableType: DeliverableType,
    clientContext: ClientContext,
  ): Promise<ABComparisonReport> {
    const [variantA, variantB] = await Promise.all([
      this.pipeline.runPipeline(deliverableType, clientContext, 'A'),
      this.pipeline.runPipeline(deliverableType, clientContext, 'B'),
    ]);

    const winner: 'A' | 'B' =
      variantA.report.averageScore >= variantB.report.averageScore ? 'A' : 'B';

    const scoreDifference =
      Math.round(
        Math.abs(variantA.report.averageScore - variantB.report.averageScore) * 100,
      ) / 100;

    return {
      deliverableType,
      clientId: clientContext.clientId,
      variantA,
      variantB,
      winner,
      scoreDifference,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get the winning result from a comparison.
   */
  getWinner(report: ABComparisonReport): QualityResult {
    return report.winner === 'A' ? report.variantA : report.variantB;
  }
}
