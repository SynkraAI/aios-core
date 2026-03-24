/**
 * ContentModerator — orchestrator for all moderation filters.
 * @module moderation/moderator
 */
import type { AIService } from '@brand-system/ai-service';
import type { ModerationContext, ModerationOptions, ModerationResult } from './types';
/**
 * Content moderation orchestrator.
 *
 * Runs all enabled filters and aggregates results.
 * AI-powered checks are batched into a single API call for efficiency.
 */
export declare class ContentModerator {
    private readonly aiService;
    constructor(aiService: AIService);
    /**
     * Moderate content through all enabled filters.
     *
     * @param content - Content text to moderate
     * @param context - Moderation context (client ID, forbidden words, competitors)
     * @param options - Filter enable/disable options
     * @returns Moderation result with all flags
     */
    moderate(content: string, context: ModerationContext, options?: ModerationOptions): Promise<ModerationResult>;
    /**
     * Run batched AI checks for profanity context, factual claims, and legal compliance.
     * Single API call with 3 questions to reduce latency and cost.
     *
     * @param content - Content to check
     * @returns Batch check response
     */
    private batchedAICheck;
    /**
     * Compute the most severe flag severity.
     * FAIL > WARN > PASS.
     *
     * @param flags - Array of moderation flags
     * @returns Most severe severity
     */
    private computeSeverity;
}
//# sourceMappingURL=moderator.d.ts.map