/**
 * Brand forbidden words checker.
 * @module moderation/filters/forbidden-words
 */

import type { ModerationFlag } from '../types';

/**
 * Check content for brand-specific forbidden words.
 * Case-insensitive search.
 *
 * @param content - Content to check
 * @param forbiddenWords - Array of brand-forbidden words
 * @returns FAIL flag if forbidden words found, null otherwise
 */
export function checkForbiddenWords(
  content: string,
  forbiddenWords: string[],
): ModerationFlag | null {
  const lowerContent = content.toLowerCase();
  const foundWords: string[] = [];

  for (const word of forbiddenWords) {
    if (lowerContent.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }

  if (foundWords.length > 0) {
    return {
      filter: 'forbidden-words',
      severity: 'FAIL',
      matchedContent: foundWords,
      explanation: `Brand-forbidden words found: ${foundWords.join(', ')}`,
    };
  }

  return null;
}
