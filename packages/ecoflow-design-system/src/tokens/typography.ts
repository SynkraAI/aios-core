/**
 * EcoFlow Design System - Typography Tokens
 *
 * Typography system including font families, sizes, weights, line heights, and letter spacing
 *
 * @see packages/ecoflow-design-system/design-analysis/01-design-tokens-analysis.md
 */

export const typography = {
  /**
   * Font Families
   * Primary: Inter (excellent UI font with tabular numbers)
   * Fallback: System font stack
   */
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(', '),

    mono: [
      '"Fira Code"',
      '"SF Mono"',
      'Menlo',
      'Monaco',
      'monospace',
    ].join(', '),
  },

  /**
   * Font Sizes
   * Base: 16px (1rem)
   * Scale: Modular scale optimized for dashboard interfaces
   */
  fontSize: {
    xs: '0.75rem', // 12px - captions, badges, meta text
    sm: '0.875rem', // 14px - secondary text, table cells
    base: '1rem', // 16px - body text, inputs ★ BASE
    lg: '1.125rem', // 18px - large body, section headers
    xl: '1.25rem', // 20px - card titles
    '2xl': '1.5rem', // 24px - page titles, h3
    '3xl': '1.875rem', // 30px - h2
    '4xl': '2.25rem', // 36px - h1, hero text
    '5xl': '3rem', // 48px - large display (hero banner)
    '6xl': '3.75rem', // 60px - extra large display (rare)
  },

  /**
   * Font Weights
   * Primary weights: 400 (normal) and 600 (semibold)
   */
  fontWeight: {
    light: 300, // Rarely used
    normal: 400, // Body text ★
    medium: 500, // Emphasized text, navigation
    semibold: 600, // Headings, buttons ★
    bold: 700, // Strong emphasis, numbers
    extrabold: 800, // Rare, large display headings
  },

  /**
   * Line Heights
   * Optimized for readability across different text sizes
   */
  lineHeight: {
    none: '1', // Single-line elements (badges)
    tight: '1.25', // Headings
    snug: '1.375', // Card titles
    normal: '1.5', // Body text ★ DEFAULT
    relaxed: '1.625', // Longer paragraphs
    loose: '2', // Rare, for special spacing
  },

  /**
   * Letter Spacing
   * Used for all-caps labels and optical adjustments
   */
  letterSpacing: {
    tighter: '-0.05em', // Large headings
    tight: '-0.025em', // Headings
    normal: '0', // Default ★
    wide: '0.025em', // All-caps labels
    wider: '0.05em', // Badges (uppercase)
    widest: '0.1em', // Rare
  },
} as const;

// Type definitions
export type FontFamily = keyof typeof typography.fontFamily;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type LetterSpacing = keyof typeof typography.letterSpacing;

/**
 * Typography Scale Presets
 * Common typography combinations for specific use cases
 */
export const typographyPresets = {
  // Headings
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.normal,
  },
  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.normal,
  },
  h6: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Body Text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Specialized
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  badge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.none,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.none,
    letterSpacing: typography.letterSpacing.normal,
  },
  link: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
    textDecoration: 'underline' as const,
  },
} as const;

/**
 * Get font size value
 */
export function getFontSize(size: FontSize): string {
  return typography.fontSize[size];
}

/**
 * Get font weight value
 */
export function getFontWeight(weight: FontWeight): number {
  return typography.fontWeight[weight];
}

/**
 * Get line height value
 */
export function getLineHeight(height: LineHeight): string {
  return typography.lineHeight[height];
}

/**
 * Get letter spacing value
 */
export function getLetterSpacing(spacing: LetterSpacing): string {
  return typography.letterSpacing[spacing];
}

/**
 * Get typography preset
 */
export function getTypographyPreset(preset: keyof typeof typographyPresets) {
  return typographyPresets[preset];
}

/**
 * CSS Custom Properties
 */
export const typographyToCSSVariables = (): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Font families
  Object.entries(typography.fontFamily).forEach(([key, value]) => {
    cssVars[`--font-${key}`] = value;
  });

  // Font sizes
  Object.entries(typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });

  // Font weights
  Object.entries(typography.fontWeight).forEach(([key, value]) => {
    cssVars[`--font-weight-${key}`] = String(value);
  });

  // Line heights
  Object.entries(typography.lineHeight).forEach(([key, value]) => {
    cssVars[`--line-height-${key}`] = value;
  });

  // Letter spacing
  Object.entries(typography.letterSpacing).forEach(([key, value]) => {
    cssVars[`--letter-spacing-${key}`] = value;
  });

  return cssVars;
};
