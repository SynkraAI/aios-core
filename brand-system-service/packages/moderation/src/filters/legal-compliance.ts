/**
 * Legal compliance checker — AI-powered detection of unsubstantiated claims.
 * @module moderation/filters/legal-compliance
 */

import type { ModerationFlag, AIBatchCheckResponse } from '../types';

/**
 * Parse AI batch response for legal compliance risks.
 *
 * @param batchResponse - AI batch check response
 * @returns FAIL flag if legal risks detected
 */
export function parseLegalComplianceFromBatch(
  batchResponse: AIBatchCheckResponse,
): ModerationFlag | null {
  if (batchResponse.legalRisks.detected && batchResponse.legalRisks.phrases.length > 0) {
    return {
      filter: 'legal-compliance',
      severity: 'FAIL',
      matchedContent: batchResponse.legalRisks.phrases,
      explanation: `Legal compliance issues detected: ${batchResponse.legalRisks.phrases.join(' | ')}`,
    };
  }

  return null;
}
