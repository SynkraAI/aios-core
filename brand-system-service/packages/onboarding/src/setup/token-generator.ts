/**
 * Token File Generator for automated client setup (BSS-7.9, AC 2).
 *
 * Generates W3C DTCG-compliant token files (primitive, semantic, component)
 * from the approved brand direction. All tokens use `$value` and `$type`
 * per the DTCG specification.
 *
 * @module onboarding/setup/token-generator
 */

import type { ApprovedDirection } from '../review/review-types';
import type { DTCGTokenGroup } from '../analysis/analysis-types';

/**
 * Generates W3C DTCG token files from an approved brand direction.
 *
 * The generator produces three token tiers:
 * - **Primitive**: Raw color and typography values from the approved palette.
 * - **Semantic**: Purpose-based aliases referencing primitive tokens.
 * - **Component**: UI component tokens referencing semantic tokens.
 */
export class TokenFileGenerator {
  /**
   * Generate primitive tokens from the approved direction.
   *
   * Includes all 6 palette colors and core typography values.
   *
   * @param approvedDirection - The approved brand direction with color palette and typography.
   * @returns A DTCG token group containing primitive color and typography tokens.
   */
  generatePrimitive(approvedDirection: ApprovedDirection): DTCGTokenGroup {
    const colorEntries = approvedDirection.color_palette.colors.map((paletteColor) => [
      paletteColor.role,
      { $value: paletteColor.color.hex, $type: 'color' },
    ]);
    const colorTokens: DTCGTokenGroup = Object.fromEntries(colorEntries);

    const typographyTokens: DTCGTokenGroup = {
      'font-family-heading': {
        $value: approvedDirection.typography.heading.family,
        $type: 'fontFamily',
      },
      'font-family-body': {
        $value: approvedDirection.typography.body.family,
        $type: 'fontFamily',
      },
      'font-size-base': {
        $value: '16px',
        $type: 'dimension',
      },
      'line-height-base': {
        $value: 1.5,
        $type: 'number',
      },
    };

    return {
      color: colorTokens,
      typography: typographyTokens,
    };
  }

  /**
   * Generate semantic tokens from the approved direction.
   *
   * Maps brand roles (primary, secondary, accent) and text/surface roles
   * to primitive token references.
   *
   * @param approvedDirection - The approved brand direction with color palette and typography.
   * @returns A DTCG token group containing semantic color and typography tokens.
   */
  generateSemantic(approvedDirection: ApprovedDirection): DTCGTokenGroup {
    const primaryHex = this._findColorByRole(approvedDirection, 'primary');
    const secondaryHex = this._findColorByRole(approvedDirection, 'secondary');
    const accentHex = this._findColorByRole(approvedDirection, 'accent');
    const neutralDarkHex = this._findColorByRole(approvedDirection, 'neutral-dark');
    const neutralLightHex = this._findColorByRole(approvedDirection, 'neutral-light');
    const backgroundHex = this._findColorByRole(approvedDirection, 'background');

    return {
      color: {
        brand: {
          primary: { $value: primaryHex, $type: 'color' },
          secondary: { $value: secondaryHex, $type: 'color' },
          accent: { $value: accentHex, $type: 'color' },
        } as DTCGTokenGroup,
        text: {
          primary: { $value: neutralDarkHex, $type: 'color' },
          inverse: { $value: neutralLightHex, $type: 'color' },
        } as DTCGTokenGroup,
        surface: {
          background: { $value: backgroundHex, $type: 'color' },
        } as DTCGTokenGroup,
      } as DTCGTokenGroup,
      typography: {
        heading: {
          $value: approvedDirection.typography.heading.family,
          $type: 'fontFamily',
        },
        body: {
          $value: approvedDirection.typography.body.family,
          $type: 'fontFamily',
        },
      },
    };
  }

  /**
   * Generate component tokens from the approved direction.
   *
   * Maps UI component properties (button, text, card) to semantic-level
   * token references.
   *
   * @param approvedDirection - The approved brand direction with color palette and typography.
   * @returns A DTCG token group containing component-level tokens.
   */
  generateComponent(approvedDirection: ApprovedDirection): DTCGTokenGroup {
    const primaryHex = this._findColorByRole(approvedDirection, 'primary');
    const neutralDarkHex = this._findColorByRole(approvedDirection, 'neutral-dark');
    const neutralLightHex = this._findColorByRole(approvedDirection, 'neutral-light');
    const backgroundHex = this._findColorByRole(approvedDirection, 'background');

    return {
      button: {
        background: { $value: primaryHex, $type: 'color' },
        text: { $value: neutralLightHex, $type: 'color' },
        border: { $value: primaryHex, $type: 'color' },
      } as DTCGTokenGroup,
      text: {
        heading: {
          fontFamily: {
            $value: approvedDirection.typography.heading.family,
            $type: 'fontFamily',
          },
          color: { $value: neutralDarkHex, $type: 'color' },
        } as DTCGTokenGroup,
        body: {
          fontFamily: {
            $value: approvedDirection.typography.body.family,
            $type: 'fontFamily',
          },
          color: { $value: neutralDarkHex, $type: 'color' },
        } as DTCGTokenGroup,
      } as DTCGTokenGroup,
      card: {
        background: { $value: backgroundHex, $type: 'color' },
        border: { $value: neutralLightHex, $type: 'color' },
      } as DTCGTokenGroup,
    };
  }

  /**
   * Find a color hex value by its role in the approved direction palette.
   *
   * @param approvedDirection - The approved brand direction.
   * @param role - The color role to look up.
   * @returns The hex color value, or '#000000' if not found.
   */
  private _findColorByRole(approvedDirection: ApprovedDirection, role: string): string {
    const paletteColor = approvedDirection.color_palette.colors.find(
      (c) => c.role === role,
    );
    return paletteColor?.color.hex ?? '#000000';
  }
}
