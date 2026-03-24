/**
 * Typography Engine for Brand System Service
 *
 * Generates a complete typography system with:
 * - Font family configuration (Display/Heading, Body/Interface, Mono/Code)
 * - Type scale (xs through 7xl)
 * - CSS clamp responsive values for fluid typography
 * - Line height and letter spacing scales
 * - W3C DTCG token output
 *
 * @see BSS-2.4: Typography System
 */

import { createLogger } from '@bss/core';
import type { DTCGToken } from './types';

/**
 * Font family configuration for three semantic roles.
 */
export interface FontConfig {
  /** Display/Heading fonts — titles and large text */
  readonly display: ReadonlyArray<string>;
  /** Body/Interface fonts — body copy and UI labels */
  readonly body: ReadonlyArray<string>;
  /** Mono/Code fonts — technical content */
  readonly mono: ReadonlyArray<string>;
}

/**
 * A single size in the type scale.
 */
export interface TypeScaleSize {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
}

/**
 * Complete type scale from xs (12px) to 7xl (72px).
 */
export interface TypeScale {
  readonly xs: TypeScaleSize;
  readonly sm: TypeScaleSize;
  readonly base: TypeScaleSize;
  readonly lg: TypeScaleSize;
  readonly xl: TypeScaleSize;
  readonly '2xl': TypeScaleSize;
  readonly '3xl': TypeScaleSize;
  readonly '4xl': TypeScaleSize;
  readonly '5xl': TypeScaleSize;
  readonly '6xl': TypeScaleSize;
  readonly '7xl': TypeScaleSize;
}

/**
 * Font license metadata for documentation.
 */
export interface FontLicense {
  readonly family: string;
  readonly license: string;
  readonly sourceUrl: string;
  readonly webEmbeddingPermitted: boolean;
}

/**
 * Typography metadata for Google Fonts integration.
 */
export interface TypographyMetadata {
  readonly embedTag: string;
  readonly fonts: ReadonlyArray<FontLicense>;
}

/**
 * DTCG token file structure.
 */
export interface DTCGTokenFile {
  [key: string]: DTCGToken | DTCGTokenFile;
}

/**
 * Default font configuration (Inter + JetBrains Mono).
 */
export const DEFAULT_FONT_CONFIG: FontConfig = {
  display: ['Inter', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
};

/**
 * Seed data for default font licenses.
 */
export const DEFAULT_FONT_LICENSES: ReadonlyArray<FontLicense> = [
  {
    family: 'Inter',
    license: 'OFL (SIL Open Font License)',
    sourceUrl: 'https://fonts.google.com/specimen/Inter',
    webEmbeddingPermitted: true,
  },
  {
    family: 'JetBrains Mono',
    license: 'OFL (SIL Open Font License)',
    sourceUrl: 'https://fonts.google.com/specimen/JetBrains+Mono',
    webEmbeddingPermitted: true,
  },
  {
    family: 'Playfair Display',
    license: 'OFL (SIL Open Font License)',
    sourceUrl: 'https://fonts.google.com/specimen/Playfair+Display',
    webEmbeddingPermitted: true,
  },
];

/**
 * Top 100 Google Fonts catalog for validation (representative subset).
 */
const GOOGLE_FONTS_CATALOG: ReadonlyArray<string> = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'PT Sans',
  'Merriweather',
  'Nunito',
  'Playfair Display',
  'Poppins',
  'Ubuntu',
  'Libre Baskerville',
  'Source Sans Pro',
  'JetBrains Mono',
  'Fira Code',
  'Inconsolata',
  'Source Code Pro',
  'Roboto Mono',
];

/**
 * Typography Engine generates typography tokens and metadata.
 */
export class TypographyEngine {
  constructor(debug = false) {
    // Logger available for future debugging if needed
    if (debug) {
      createLogger('TypographyEngine', debug);
    }
  }

  /**
   * Generate CSS clamp value for responsive typography.
   *
   * @param minPx - Minimum font size in pixels (mobile)
   * @param maxPx - Maximum font size in pixels (desktop)
   * @param minVw - Minimum viewport width (default: 375px)
   * @param maxVw - Maximum viewport width (default: 1440px)
   * @returns CSS clamp() string
   */
  generateClamp(minPx: number, maxPx: number, minVw = 375, maxVw = 1440): string {
    const slope = (maxPx - minPx) / (maxVw - minVw);
    const intercept = minPx - slope * minVw;
    const slopeVw = (slope * 100).toFixed(4);
    const interceptRem = (intercept / 16).toFixed(4);

    return `clamp(${minPx}px, ${slopeVw}vw + ${interceptRem}rem, ${maxPx}px)`;
  }

  /**
   * Generate complete type scale (11 sizes: xs through 7xl).
   */
  generateTypeScale(): TypeScale {
    return {
      xs: { fontSize: '12px', lineHeight: '1.5', letterSpacing: '0em' },
      sm: { fontSize: '14px', lineHeight: '1.5', letterSpacing: '0em' },
      base: { fontSize: '16px', lineHeight: '1.5', letterSpacing: '0em' },
      lg: { fontSize: '18px', lineHeight: '1.5', letterSpacing: '0em' },
      xl: { fontSize: '20px', lineHeight: '1.5', letterSpacing: '0em' },
      '2xl': { fontSize: '24px', lineHeight: '1.5', letterSpacing: '0em' },
      '3xl': { fontSize: '30px', lineHeight: '1.25', letterSpacing: '-0.025em' },
      '4xl': { fontSize: '36px', lineHeight: '1.25', letterSpacing: '-0.025em' },
      '5xl': { fontSize: '48px', lineHeight: '1.25', letterSpacing: '-0.025em' },
      '6xl': { fontSize: '60px', lineHeight: '1.25', letterSpacing: '-0.025em' },
      '7xl': { fontSize: '72px', lineHeight: '1.25', letterSpacing: '-0.025em' },
    };
  }

  /**
   * Generate line height scale (6 named ratios).
   */
  generateLineHeights(): Record<string, number> {
    return {
      none: 1.0,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2.0,
    };
  }

  /**
   * Generate letter spacing scale (6 named em values).
   */
  generateLetterSpacing(): Record<string, string> {
    return {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    };
  }

  /**
   * Generate DTCG primitive typography tokens.
   * Includes font families, font sizes, line heights, and letter spacing.
   *
   * @param config - Font family configuration
   * @returns DTCG token file structure
   */
  generatePrimitiveTokens(config: FontConfig = DEFAULT_FONT_CONFIG): DTCGTokenFile {
    const scale = this.generateTypeScale();
    const lineHeights = this.generateLineHeights();
    const letterSpacing = this.generateLetterSpacing();

    // Clamp ranges for responsive sizes (3xl and above)
    const clampRanges: Record<string, [number, number]> = {
      '3xl': [24, 30],
      '4xl': [30, 36],
      '5xl': [36, 48],
      '6xl': [48, 60],
      '7xl': [60, 72],
    };

    const fontFamilyTokens: DTCGTokenFile = {
      display: {
        $value: config.display.join(', '),
        $type: 'fontFamily',
        $description: 'Display/Heading font family — titles and large text',
      },
      body: {
        $value: config.body.join(', '),
        $type: 'fontFamily',
        $description: 'Body/Interface font family — body copy and UI labels',
      },
      mono: {
        $value: config.mono.join(', '),
        $type: 'fontFamily',
        $description: 'Mono/Code font family — technical content',
      },
    };

    const fontSizeTokens: DTCGTokenFile = {};
    for (const [key, value] of Object.entries(scale)) {
      // Add clamp extension for 3xl and above
      if (key in clampRanges) {
        const [min, max] = clampRanges[key];
        const token: DTCGToken & { $extensions?: { clamp: string } } = {
          $value: value.fontSize,
          $type: 'dimension',
          $description: `Type scale ${key} — ${value.fontSize}`,
          $extensions: {
            clamp: this.generateClamp(min, max),
          },
        };
        fontSizeTokens[key] = token;
      } else {
        const token: DTCGToken = {
          $value: value.fontSize,
          $type: 'dimension',
          $description: `Type scale ${key} — ${value.fontSize}`,
        };
        fontSizeTokens[key] = token;
      }
    }

    const lineHeightTokens: DTCGTokenFile = {};
    for (const [key, value] of Object.entries(lineHeights)) {
      lineHeightTokens[key] = {
        $value: value,
        $type: 'number',
        $description: `Line height ${key} — ${value}`,
      };
    }

    const letterSpacingTokens: DTCGTokenFile = {};
    for (const [key, value] of Object.entries(letterSpacing)) {
      letterSpacingTokens[key] = {
        $value: value,
        $type: 'dimension',
        $description: `Letter spacing ${key} — ${value}`,
      };
    }

    return {
      fontFamily: fontFamilyTokens,
      fontSize: fontSizeTokens,
      lineHeight: lineHeightTokens,
      letterSpacing: letterSpacingTokens,
    };
  }

  /**
   * Generate DTCG semantic typography tokens.
   * Role-based pairings (display, heading, body, label, mono).
   */
  generateSemanticTokens(): DTCGTokenFile {
    return {
      display: {
        fontFamily: {
          $value: '{fontFamily.display}',
          $type: 'fontFamily',
          $description: 'Display text font family',
        },
        xl: {
          fontSize: {
            $value: '{fontSize.7xl}',
            $type: 'dimension',
            $description: 'Display text size — hero sections',
          },
          lineHeight: {
            $value: '{lineHeight.tight}',
            $type: 'number',
            $description: 'Display text line height',
          },
          letterSpacing: {
            $value: '{letterSpacing.tight}',
            $type: 'dimension',
            $description: 'Display text letter spacing',
          },
        },
      },
      heading: {
        fontFamily: {
          $value: '{fontFamily.display}',
          $type: 'fontFamily',
          $description: 'Heading font family',
        },
        lg: {
          fontSize: {
            $value: '{fontSize.4xl}',
            $type: 'dimension',
            $description: 'Large heading size',
          },
          lineHeight: {
            $value: '{lineHeight.tight}',
            $type: 'number',
            $description: 'Large heading line height',
          },
          letterSpacing: {
            $value: '{letterSpacing.tight}',
            $type: 'dimension',
            $description: 'Large heading letter spacing',
          },
        },
        md: {
          fontSize: {
            $value: '{fontSize.2xl}',
            $type: 'dimension',
            $description: 'Medium heading size',
          },
          lineHeight: {
            $value: '{lineHeight.snug}',
            $type: 'number',
            $description: 'Medium heading line height',
          },
        },
      },
      body: {
        fontFamily: {
          $value: '{fontFamily.body}',
          $type: 'fontFamily',
          $description: 'Body text font family',
        },
        base: {
          fontSize: {
            $value: '{fontSize.base}',
            $type: 'dimension',
            $description: 'Body text size',
          },
          lineHeight: {
            $value: '{lineHeight.normal}',
            $type: 'number',
            $description: 'Body text line height',
          },
          letterSpacing: {
            $value: '{letterSpacing.normal}',
            $type: 'dimension',
            $description: 'Body text letter spacing',
          },
        },
      },
      label: {
        fontFamily: {
          $value: '{fontFamily.body}',
          $type: 'fontFamily',
          $description: 'Label font family',
        },
        sm: {
          fontSize: {
            $value: '{fontSize.sm}',
            $type: 'dimension',
            $description: 'Label text size',
          },
          lineHeight: {
            $value: '{lineHeight.normal}',
            $type: 'number',
            $description: 'Label line height',
          },
          letterSpacing: {
            $value: '{letterSpacing.wide}',
            $type: 'dimension',
            $description: 'Label letter spacing',
          },
        },
      },
      mono: {
        fontFamily: {
          $value: '{fontFamily.mono}',
          $type: 'fontFamily',
          $description: 'Monospace font family for code',
        },
        base: {
          fontSize: {
            $value: '{fontSize.sm}',
            $type: 'dimension',
            $description: 'Code text size',
          },
          lineHeight: {
            $value: '{lineHeight.relaxed}',
            $type: 'number',
            $description: 'Code text line height',
          },
        },
      },
    };
  }

  /**
   * Validate font name against Google Fonts catalog.
   *
   * @param fontName - Font family name to validate
   * @returns true if font exists in Google Fonts catalog
   */
  validateGoogleFont(fontName: string): boolean {
    return GOOGLE_FONTS_CATALOG.includes(fontName);
  }

  /**
   * Generate Google Fonts embed tag.
   *
   * @param heading - Heading font family name
   * @param body - Body font family name
   * @returns HTML <link> tag for Google Fonts
   */
  generateGoogleFontsEmbed(heading: string, body: string): string {
    const families: string[] = [];

    if (heading) {
      families.push(heading.replace(/ /g, '+'));
    }

    if (body && body !== heading) {
      families.push(body.replace(/ /g, '+'));
    }

    const familyParam = families.join('&family=');
    return `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=${familyParam}&display=swap" rel="stylesheet">`;
  }

  /**
   * Generate typography metadata for Google Fonts integration.
   *
   * @param heading - Heading font family name
   * @param body - Body font family name
   * @returns Typography metadata with embed tag and licenses
   */
  generateMetadata(heading: string, body: string): TypographyMetadata {
    const embedTag = this.generateGoogleFontsEmbed(heading, body);
    const fonts: FontLicense[] = [];

    // Look up licenses from seed data
    for (const fontName of [heading, body]) {
      const license = DEFAULT_FONT_LICENSES.find((l) => l.family === fontName);
      if (license) {
        fonts.push(license);
      } else {
        // Unknown font - flag for manual verification
        fonts.push({
          family: fontName,
          license: 'VERIFY MANUALLY',
          sourceUrl: `https://fonts.google.com/specimen/${fontName.replace(/ /g, '+')}`,
          webEmbeddingPermitted: true, // Assume true for Google Fonts
        });
      }
    }

    return {
      embedTag,
      fonts,
    };
  }
}
