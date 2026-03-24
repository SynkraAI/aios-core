/**
 * Profanity filter — word list + AI context check.
 * @module moderation/filters/profanity
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ModerationFlag, AIBatchCheckResponse } from '../types';

/** Cached profanity word set. */
let profanitySet: Set<string> | null = null;

/**
 * Load profanity word lists from data files.
 * Merges English and Portuguese terms into a single Set for O(1) lookup.
 */
function loadProfanityList(): Set<string> {
  if (profanitySet) return profanitySet;

  // Resolve path relative to the package root, works in both src/ and dist/
  const packageRoot = path.resolve(__dirname, '../..');
  const enPath = path.join(packageRoot, 'data/profanity-en.txt');
  const ptPath = path.join(packageRoot, 'data/profanity-pt.txt');

  const enWords = fs.readFileSync(enPath, 'utf-8').split(/\r?\n/).filter(Boolean);
  const ptWords = fs.readFileSync(ptPath, 'utf-8').split(/\r?\n/).filter(Boolean);

  profanitySet = new Set([...enWords, ...ptWords].map((w) => w.toLowerCase().trim().replace(/\r/g, '')));
  return profanitySet;
}

/**
 * Tokenize content into words.
 * Split on whitespace and punctuation, normalize to lowercase, strip punctuation.
 */
function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .split(/[\s.,;:!?()[\]{}'"]+/)
    .filter(Boolean)
    .map((token) => token.replace(/[^\w]/g, ''));
}

/**
 * Check content against profanity word list.
 * Returns matched profanity words if found.
 * Uses prefix matching to catch variations (e.g., "fuck" matches "fucking").
 */
function checkWordList(content: string): string[] {
  const profanityWords = loadProfanityList();
  const tokens = tokenize(content);
  const matches: string[] = [];

  for (const token of tokens) {
    // Exact match
    if (profanityWords.has(token)) {
      matches.push(token);
      continue;
    }

    // Prefix match for variations (e.g., "fucking" starts with "fuck")
    // Only match if profanity word is at least 4 chars to avoid false positives
    for (const badWord of profanityWords) {
      if (badWord.length >= 4 && token.startsWith(badWord)) {
        matches.push(token);
        break;
      }
    }
  }

  return matches;
}

/**
 * AI-powered context-aware profanity check.
 * This is NOT called directly — it's invoked by the ContentModerator
 * as part of the batched AI check.
 *
 * @deprecated Use batchedAICheck in ContentModerator instead
 * @returns Never returns - throws error
 */
export async function checkProfanityContext(): Promise<ModerationFlag | null> {
  // This function is not called directly in the optimized implementation.
  // The ContentModerator batches all AI checks into a single call.
  // This is here for documentation and potential future use.
  throw new Error(
    'checkProfanityContext is deprecated — use batchedAICheck in ContentModerator instead',
  );
}

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
export function checkProfanity(content: string): ModerationFlag | null {
  const wordListMatches = checkWordList(content);

  if (wordListMatches.length > 0) {
    return {
      filter: 'profanity',
      severity: 'FAIL',
      matchedContent: wordListMatches,
      explanation: `Profanity detected: ${wordListMatches.join(', ')}`,
    };
  }

  return null;
}

/**
 * Parse AI batch response for profanity context check.
 *
 * @param batchResponse - AI batch check response
 * @returns Profanity flag if offensive language detected
 */
export function parseProfanityFromBatch(
  batchResponse: AIBatchCheckResponse,
): ModerationFlag | null {
  if (batchResponse.offensiveLanguage.detected && batchResponse.offensiveLanguage.examples.length > 0) {
    return {
      filter: 'profanity',
      severity: 'FAIL',
      matchedContent: batchResponse.offensiveLanguage.examples,
      explanation: `Offensive language detected in context: ${batchResponse.offensiveLanguage.examples.join(', ')}`,
    };
  }

  return null;
}
