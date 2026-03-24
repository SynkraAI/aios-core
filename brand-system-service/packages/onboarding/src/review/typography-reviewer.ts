/**
 * Typography Reviewer (BSS-7.7, AC 3).
 *
 * Manages typography pairing selection during the human review.
 * Displays 2 pairings, allows selecting 1 or adjusting font choices.
 *
 * @module onboarding/review/typography-reviewer
 */

import type { TypographyPairing, FontSpec } from '../analysis/analysis-types';
import type { TypographyReviewData } from './review-types';

/**
 * TypographyReviewer manages the typography review section.
 *
 * - Loads 2 pairings from analysis or audit-assisted pipeline.
 * - Allows selecting one pairing.
 * - Allows overriding individual font specs.
 * - Tracks selection state.
 */
export class TypographyReviewer {
  private pairings: TypographyPairing[];
  private selectedIndex: number | null;

  constructor(pairings: readonly TypographyPairing[]) {
    if (pairings.length === 0) {
      throw new Error('At least one typography pairing is required');
    }
    this.pairings = pairings.map((p) => ({ ...p }));
    this.selectedIndex = null;
  }

  /** Returns the current review data snapshot. */
  getReviewData(): TypographyReviewData {
    return {
      pairings: [...this.pairings],
      selectedIndex: this.selectedIndex,
    };
  }

  /**
   * Selects a pairing by index.
   * Returns true if index is valid, false otherwise.
   */
  selectPairing(index: number): boolean {
    if (index < 0 || index >= this.pairings.length) {
      return false;
    }
    this.selectedIndex = index;
    return true;
  }

  /**
   * Updates a font spec in a specific pairing.
   * @param pairingIndex - Index of the pairing to update.
   * @param role - 'heading' or 'body' font to update.
   * @param fontSpec - Partial font spec to merge.
   * Returns true if the update was applied.
   */
  updateFont(
    pairingIndex: number,
    role: 'heading' | 'body',
    fontSpec: Partial<FontSpec>
  ): boolean {
    if (pairingIndex < 0 || pairingIndex >= this.pairings.length) {
      return false;
    }
    const pairing = this.pairings[pairingIndex];
    const currentFont = pairing[role];
    const updatedFont: FontSpec = {
      ...currentFont,
      ...fontSpec,
    };
    this.pairings[pairingIndex] = {
      ...pairing,
      [role]: updatedFont,
    };
    return true;
  }

  /** Returns the selected pairing, or null if none selected. */
  getSelectedPairing(): TypographyPairing | null {
    if (this.selectedIndex === null) {
      return null;
    }
    return this.pairings[this.selectedIndex];
  }

  /** Returns whether a selection has been made. */
  hasSelection(): boolean {
    return this.selectedIndex !== null;
  }
}
