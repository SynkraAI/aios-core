/**
 * QualityScorer — scores AI-generated content on 5 dimensions via meta-evaluation.
 *
 * Calls a secondary AI model (meta-evaluator) to assess content quality,
 * parses the JSON response, and computes the average score.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */
import type { AIServiceProvider } from '@brand-system/ai-service';
import type { DimensionScores, QualityReport } from './types';
/**
 * Client context subset needed for quality evaluation.
 */
export interface ScorerClientContext {
    readonly clientId: string;
    readonly brandName: string;
    readonly brandPersonality: string[];
    readonly toneSpectrum: string;
    readonly platform?: string;
}
/**
 * QualityScorer evaluates AI-generated content on 5 dimensions
 * by calling a meta-evaluator prompt via AIService.
 */
export declare class QualityScorer {
    private readonly aiService;
    private readonly qualityThreshold;
    constructor(aiService: AIServiceProvider, qualityThreshold?: number);
    /**
     * Score content on 5 quality dimensions.
     *
     * @param content - The AI-generated content to evaluate
     * @param clientContext - Client brand context for evaluation
     * @param promptVersion - Version of the prompt that generated the content
     * @param variant - A/B variant identifier
     * @param iteration - Current iteration number
     * @returns QualityReport with scores, average, and approval status
     */
    score(content: string, clientContext: ScorerClientContext, promptVersion: string, variant: string, iteration?: number): Promise<QualityReport>;
    /**
     * Compute the average across all 5 dimension scores.
     */
    computeAverage(scores: DimensionScores): number;
    /**
     * Build the evaluation prompt for the meta-evaluator.
     */
    private buildEvaluationPrompt;
    /**
     * Parse the evaluator JSON response with graceful fallback.
     */
    private parseEvaluatorResponse;
}
//# sourceMappingURL=scorer.d.ts.map