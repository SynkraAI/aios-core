/**
 * Token Draft Reviewer (BSS-7.7, AC 6).
 *
 * Manages W3C DTCG token draft review in a flat table view.
 * Allows editing individual token values and saving updates to R2.
 *
 * @module onboarding/review/token-reviewer
 */

import type { TokensDraft, DTCGToken, DTCGTokenGroup } from '../analysis/analysis-types';
import type { TokenReviewData, FlattenedToken, ReviewR2Client } from './review-types';

// ---------------------------------------------------------------------------
// Token Flattening
// ---------------------------------------------------------------------------

/**
 * Checks whether an object is a DTCG token (has $value and $type).
 */
function isDTCGToken(obj: unknown): obj is DTCGToken {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '$value' in obj &&
    '$type' in obj
  );
}

/**
 * Flattens a nested DTCG token group into a flat array of tokens
 * with dot-notation paths.
 */
export function flattenTokens(group: DTCGTokenGroup, prefix: string = ''): FlattenedToken[] {
  const tokens: FlattenedToken[] = [];
  for (const key of Object.keys(group)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = group[key];
    if (isDTCGToken(value)) {
      tokens.push({
        path: fullPath,
        value: value.$value,
        type: value.$type,
        description: value.$description,
      });
    } else if (typeof value === 'object' && value !== null) {
      tokens.push(...flattenTokens(value as DTCGTokenGroup, fullPath));
    }
  }
  return tokens;
}

/**
 * Rebuilds a nested DTCG token group from a flat token array.
 */
export function unflattenTokens(flatTokens: readonly FlattenedToken[]): DTCGTokenGroup {
  const result: Record<string, unknown> = {};
  for (const token of flatTokens) {
    const parts = token.path.split('.');
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    const lastKey = parts[parts.length - 1];
    const tokenObj: Record<string, unknown> = {
      $value: token.value,
      $type: token.type,
    };
    if (token.description !== undefined) {
      tokenObj.$description = token.description;
    }
    current[lastKey] = tokenObj;
  }
  return result as DTCGTokenGroup;
}

// ---------------------------------------------------------------------------
// Token Reviewer
// ---------------------------------------------------------------------------

/**
 * TokenReviewer manages the DTCG token draft review section.
 *
 * - Flattens the token draft into a table-friendly format.
 * - Allows editing individual token values.
 * - Rebuilds the nested DTCG structure for saving.
 * - Saves to R2 on request.
 */
export class TokenReviewer {
  private flattenedTokens: FlattenedToken[];
  private readonly originalDraft: TokensDraft;
  private hasEdits: boolean;

  constructor(draft: TokensDraft) {
    this.originalDraft = draft;
    // Flatten both color and typography token groups
    this.flattenedTokens = [
      ...flattenTokens(draft.color, 'color'),
      ...flattenTokens(draft.typography, 'typography'),
    ];
    this.hasEdits = false;
  }

  /** Returns the current review data snapshot. */
  getReviewData(): TokenReviewData {
    return {
      flattenedTokens: this.flattenedTokens.map((t) => ({ ...t })),
      originalDraft: this.originalDraft,
      hasEdits: this.hasEdits,
    };
  }

  /**
   * Updates a token value by path.
   * Returns true if the update was applied, false if path not found.
   */
  updateTokenValue(path: string, newValue: string | number): boolean {
    const index = this.flattenedTokens.findIndex((t) => t.path === path);
    if (index === -1) {
      return false;
    }
    this.flattenedTokens[index] = {
      ...this.flattenedTokens[index],
      value: newValue,
    };
    this.hasEdits = true;
    return true;
  }

  /**
   * Rebuilds the full TokensDraft from current edits.
   */
  getEditedDraft(): TokensDraft {
    const colorTokens = this.flattenedTokens.filter((t) => t.path.startsWith('color.'));
    const typographyTokens = this.flattenedTokens.filter((t) => t.path.startsWith('typography.'));

    // Strip the top-level prefix for unflattening
    const stripPrefix = (tokens: FlattenedToken[], prefix: string): FlattenedToken[] =>
      tokens.map((t) => ({
        ...t,
        path: t.path.slice(prefix.length + 1), // remove "color." or "typography."
      }));

    return {
      color: unflattenTokens(stripPrefix(colorTokens, 'color')),
      typography: unflattenTokens(stripPrefix(typographyTokens, 'typography')),
    };
  }

  /**
   * Saves the edited token draft to R2.
   * Returns true if the save was successful.
   */
  async saveTo(r2Client: ReviewR2Client, r2Key: string): Promise<boolean> {
    try {
      const draft = this.getEditedDraft();
      await r2Client.uploadJson(r2Key, draft);
      this.hasEdits = false;
      return true;
    } catch {
      return false;
    }
  }

  /** Returns whether there are unsaved edits. */
  hasPendingEdits(): boolean {
    return this.hasEdits;
  }
}
