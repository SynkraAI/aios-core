/**
 * W3C DTCG Token Draft Generator (BSS-7.6 AC-7).
 *
 * Converts generated color palette and typography pairings into
 * a W3C Design Token Community Group (DTCG) formatted JSON draft.
 *
 * Token format follows the DTCG specification:
 * { "$value": "#1A2B3C", "$type": "color" }
 *
 * @module onboarding/analysis/token-draft-generator
 */

import type {
  ColorPalette,
  TypographyResult,
  TokensDraft,
  DTCGTokenGroup,
} from './analysis-types';

/**
 * TokenDraftGenerator — converts design artifacts to DTCG token format.
 *
 * This is a pure transformation (no AI calls) that converts the generated
 * color palette and typography pairings into standardized design tokens.
 */
export class TokenDraftGenerator {
  /**
   * Generate a DTCG token draft from color palette and typography.
   *
   * @param colorPalette - Generated 6-color palette
   * @param typography - Generated font pairings
   * @returns DTCG-formatted token draft
   */
  generate(colorPalette: ColorPalette, typography: TypographyResult): TokensDraft {
    return {
      color: this.buildColorTokens(colorPalette),
      typography: this.buildTypographyTokens(typography),
    };
  }

  /**
   * Build DTCG color tokens from the palette.
   * Maps each color role to a DTCG token entry.
   */
  private buildColorTokens(palette: ColorPalette): DTCGTokenGroup {
    const tokens: Record<string, { $value: string; $type: string; $description?: string }> = {};

    for (const paletteColor of palette.colors) {
      const tokenKey = paletteColor.role;
      tokens[tokenKey] = {
        $value: paletteColor.color.hex,
        $type: 'color',
        $description: paletteColor.rationale,
      };
    }

    return tokens;
  }

  /**
   * Build DTCG typography tokens from the pairings.
   * Uses the first pairing as the primary font selection.
   */
  private buildTypographyTokens(typography: TypographyResult): DTCGTokenGroup {
    const primaryPairing = typography.pairings[0];
    if (!primaryPairing) {
      return {};
    }

    return {
      'font-family-heading': {
        $value: primaryPairing.heading.family,
        $type: 'fontFamily',
        $description: `Heading font: ${primaryPairing.rationale}`,
      },
      'font-family-body': {
        $value: primaryPairing.body.family,
        $type: 'fontFamily',
        $description: `Body font: ${primaryPairing.rationale}`,
      },
      'font-weight-heading': {
        $value: primaryPairing.heading.weight,
        $type: 'fontWeight',
      },
      'font-weight-body': {
        $value: primaryPairing.body.weight,
        $type: 'fontWeight',
      },
      'font-size-base': {
        $value: '1rem',
        $type: 'dimension',
        $description: 'Base font size (16px default)',
      },
      'line-height-base': {
        $value: 1.5,
        $type: 'number',
        $description: 'Base line height for body text',
      },
    };
  }
}
