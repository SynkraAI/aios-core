/**
 * Lendário AI Design System - Typography Tokens
 *
 * Font: Inter
 * Based on cohort.lendario.ai analysis
 */

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "Consolas, Monaco, 'Courier New', monospace",
  },

  // Font sizes extracted from cohort page
  fontSize: {
    tiny: '0.625rem',    // 10px - Section eyebrows
    xs: '0.75rem',       // 12px - Meta info, labels
    sm: '0.875rem',      // 14px - Secondary text, captions
    base: '1rem',        // 16px - Body text
    lg: '1.125rem',      // 18px - H4, Card titles
    xl: '1.25rem',       // 20px - H3, Subsections
    '2xl': '1.5rem',     // 24px - Clamp base for H2
    '3xl': '1.875rem',   // 30px -
    '4xl': '2rem',       // 32px - Clamp base for H1
    '5xl': '2.5rem',     // 40px - Clamp max for H2
    '6xl': '3rem',       // 48px -
    '7xl': '3.5rem',     // 56px - Clamp max for H1
  },

  // Font weights from cohort
  fontWeight: {
    light: 300,      // Vibe subtitle
    normal: 400,     // Body text
    medium: 500,
    semibold: 600,
    bold: 700,       // Headings, labels, emphasis
    extrabold: 800,
    black: 900,      // Stat numbers, large display text
  },

  // Line heights from cohort
  lineHeight: {
    none: 1,
    tight: 1.1,      // Headings
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.6,    // Body text (cohort)
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// Typography presets matching cohort page
export const typographyPresets = {
  // Hero heading (cohort: clamp(2rem, 5vw, 3.5rem))
  h1: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)', // 32px - 56px
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },

  // Section titles (cohort: clamp(1.5rem, 4vw, 2.5rem))
  h2: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', // 24px - 40px
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },

  // Subsections (cohort: 1.25rem)
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.snug,
  },

  // Card titles, lesson titles (cohort: 1.125rem)
  h4: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.snug,
  },

  h5: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.normal,
  },

  h6: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.normal,
  },

  // Body text (cohort: 1rem, line-height 1.6)
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },

  // Secondary text (cohort: 0.875rem)
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Meta info (cohort: 0.75rem)
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Labels (cohort: 0.75rem, bold)
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.none,
  },

  // Button text (cohort: 1rem, weight 700)
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.none,
  },

  // Stat numbers (cohort: weight 900)
  display: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.black,
    lineHeight: typography.lineHeight.none,
  },
} as const

// Type exports
export type Typography = typeof typography
export type TypographyPresets = typeof typographyPresets
