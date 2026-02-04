/**
 * Lendário AI Design System - Border Tokens
 *
 * Extracted from cohort.lendario.ai and app.lendario.ai
 */

export const borders = {
  // Border widths
  borderWidth: {
    DEFAULT: '1px',
    0: '0px',
    2: '2px',
    4: '4px',
    8: '8px',
  },

  // Border radius from cohort analysis
  borderRadius: {
    none: '0px',
    sm: '0.5rem',       // 8px
    DEFAULT: '0.75rem', // 12px - Cards, inputs (cohort)
    md: '0.75rem',      // 12px - Cards
    lg: '1rem',         // 16px - Larger cards (cohort)
    xl: '1.5rem',       // 24px - Guarantee card, vibe card (cohort)
    '2xl': '2rem',      // 32px
    '3xl': '3rem',      // 48px
    full: '9999px',     // Fully rounded - Buttons (cohort)
    circle: '50%',      // Perfect circle - Icon containers (cohort)
  },

  // Border styles
  borderStyle: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    none: 'none',
  },
} as const

// Border compositions (common patterns from cohort)
export const borderPresets = {
  card: {
    width: '1px',
    style: 'solid',
    radius: '0.75rem',
  },
  cardLarge: {
    width: '1px',
    style: 'solid',
    radius: '1.5rem',
  },
  button: {
    width: '0px',
    style: 'none',
    radius: '9999px',
  },
  input: {
    width: '1px',
    style: 'solid',
    radius: '0.75rem',
  },
  modal: {
    width: '1px',
    style: 'solid',
    radius: '1rem',
  },
} as const

// Type exports
export type Borders = typeof borders
export type BorderPresets = typeof borderPresets
