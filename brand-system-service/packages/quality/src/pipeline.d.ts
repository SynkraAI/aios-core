/**
 * Quality Scoring Pipeline — iteration/regeneration loop.
 *
 * Generates content, scores it, and if the average is below threshold,
 * appends feedback and regenerates up to maxIterations times. Returns
 * the best-scoring result.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */
import type { AIServiceProvider } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext } from '@brand-system/prompts';
import type { DeliverableType } from '@brand-system/prompts';
import type { QualityResult, QualityPipelineOptions } from './types';
/**
 * Quality scoring pipeline that generates content, evaluates it, and
 * iterates with feedback until the quality threshold is met or max
 * iterations are reached.
 */
export declare class QualityPipeline {
    private readonly aiService;
    private readonly promptRegistry;
    private readonly scorer;
    private readonly maxIterations;
    private readonly qualityThreshold;
    constructor(aiService: AIServiceProvider, promptRegistry: PromptRegistry, options?: QualityPipelineOptions);
    /**
     * Run the quality scoring pipeline for a deliverable.
     *
     * @param deliverableType - Type of content to generate
     * @param clientContext - Client brand context
     * @param variant - A/B variant identifier (default: 'A')
     * @returns QualityResult with the best content and full iteration history
     */
    runPipeline(deliverableType: DeliverableType, clientContext: ClientContext, variant?: string): Promise<QualityResult>;
}
//# sourceMappingURL=pipeline.d.ts.map