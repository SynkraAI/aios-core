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
export function parseFactualClaimsFromBatch(
  batchResponse: AIBatchCheckResponse,
): ModerationFlag | null {
  if (batchResponse.factualClaims.detected && batchResponse.factualClaims.sentences.length > 0) {
    return {
      filter: 'factual-claims',
      severity: 'WARN',
      matchedContent: batchResponse.factualClaims.sentences,
      explanation: `Factual claims requiring verification: ${batchResponse.factualClaims.sentences.join(' | ')}`,
    };
  }

  return null;
}
