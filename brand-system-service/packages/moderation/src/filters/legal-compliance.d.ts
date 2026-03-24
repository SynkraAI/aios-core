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
export declare function parseLegalComplianceFromBatch(batchResponse: AIBatchCheckResponse): ModerationFlag | null;
//# sourceMappingURL=legal-compliance.d.ts.map