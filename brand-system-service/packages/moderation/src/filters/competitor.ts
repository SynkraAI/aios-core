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
export function checkCompetitorMentions(
  content: string,
  competitorNames: string[],
): ModerationFlag | null {
  const lowerContent = content.toLowerCase();
  const foundCompetitors: string[] = [];

  for (const competitor of competitorNames) {
    if (lowerContent.includes(competitor.toLowerCase())) {
      foundCompetitors.push(competitor);
    }
  }

  if (foundCompetitors.length > 0) {
    return {
      filter: 'competitor',
      severity: 'WARN',
      matchedContent: foundCompetitors,
      explanation: `Competitor mentions found: ${foundCompetitors.join(', ')}`,
    };
  }

  return null;
}
