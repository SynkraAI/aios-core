/**
 * Competitor mention detector.
 * @module moderation/filters/competitor
 */
import type { ModerationFlag } from '../types';
/**
 * Check content for competitor brand name mentions.
 * Case-insensitive search.
 *
 * @param content - Content to check
 * @param competitorNames - Array of competitor brand names
 * @returns WARN flag if competitor names found, null otherwise
 */
export declare function checkCompetitorMentions(content: string, competitorNames: string[]): ModerationFlag | null;
//# sourceMappingURL=competitor.d.ts.map