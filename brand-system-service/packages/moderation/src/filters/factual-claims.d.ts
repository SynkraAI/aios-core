/**
 * Factual claims flagger — AI-powered detection of verifiable claims.
 * @module moderation/filters/factual-claims
 */
import type { ModerationFlag, AIBatchCheckResponse } from '../types';
/**
 * Parse AI batch response for factual claims.
 *
 * @param batchResponse - AI batch check response
 * @returns WARN flag if factual claims detected
 */
export declare function parseFactualClaimsFromBatch(batchResponse: AIBatchCheckResponse): ModerationFlag | null;
//# sourceMappingURL=factual-claims.d.ts.map