/**
 * Profanity filter — word list + AI context check.
 * @module moderation/filters/profanity
 */
import type { ModerationFlag, AIBatchCheckResponse } from '../types';
/**
 * AI-powered context-aware profanity check.
 * This is NOT called directly — it's invoked by the ContentModerator
 * as part of the batched AI check.
 *
 * @deprecated Use batchedAICheck in ContentModerator instead
 * @returns Never returns - throws error
 */
export declare function checkProfanityContext(): Promise<ModerationFlag | null>;
/**
 * Check content for profanity using word list.
 * Returns FAIL flag immediately if word-list matches found.
 *
 * AI context check is handled separately by the ContentModerator
 * in the batched AI call.
 *
 * @param content - Content to check
 * @returns Profanity flag if word-list matches found, null otherwise
 */
export declare function checkProfanity(content: string): ModerationFlag | null;
/**
 * Parse AI batch response for profanity context check.
 *
 * @param batchResponse - AI batch check response
 * @returns Profanity flag if offensive language detected
 */
export declare function parseProfanityFromBatch(batchResponse: AIBatchCheckResponse): ModerationFlag | null;
//# sourceMappingURL=profanity.d.ts.map