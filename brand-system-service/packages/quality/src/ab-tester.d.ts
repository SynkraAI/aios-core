/**
 * A/B Testing — runs two prompt variants in parallel and returns
 * the higher-scoring result with a comparison report.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline (AC 5)
 */
import type { AIServiceProvider } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext } from '@brand-system/prompts';
import type { DeliverableType } from '@brand-system/prompts';
import type { ABComparisonReport, QualityPipelineOptions, QualityResult } from './types';
/**
 * A/B Tester runs two prompt variants in parallel, scores both, and
 * returns the winner with a comparison report.
 */
export declare class ABTester {
    private readonly pipeline;
    constructor(aiService: AIServiceProvider, promptRegistry: PromptRegistry, options?: QualityPipelineOptions);
    /**
     * Compare two prompt variants (A and B) on the same deliverable type
     * and client context. Runs both in parallel via Promise.all.
     *
     * @param deliverableType - Type of content to generate
     * @param clientContext - Client brand context
     * @returns ABComparisonReport with both results and the winner
     */
    compareVariants(deliverableType: DeliverableType, clientContext: ClientContext): Promise<ABComparisonReport>;
    /**
     * Get the winning result from a comparison.
     */
    getWinner(report: ABComparisonReport): QualityResult;
}
//# sourceMappingURL=ab-tester.d.ts.map