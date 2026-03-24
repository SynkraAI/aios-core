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
export declare function checkForbiddenWords(content: string, forbiddenWords: string[]): ModerationFlag | null;
//# sourceMappingURL=forbidden-words.d.ts.map