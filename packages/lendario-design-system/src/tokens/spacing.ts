/**
 * Lendário AI Design System - Spacing Tokens
 *
 * Base unit: 8px (0.5rem)
 * Scale: Multiples of 4px/8px from cohort analysis
 */

export const spacing = {
  0: '0rem',
  1: '0.25rem',    // 4px - Micro spacing
  2: '0.5rem',     // 8px - Tight padding
  3: '0.75rem',    // 12px - Card gaps, badge padding
  4: '1rem',       // 16px - Standard padding/margins
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px - Larger padding blocks
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px - Section padding
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px - Large sections
  14: '3.5rem',    // 56px - CTA button height (cohort)
  16: '4rem',      // 64px - Section top/bottom padding
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
} as const

// Container widths
export const container = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',    // Cohort max-width
  '2xl': '1536px',
} as const

// Responsive breakpoints (cohort: 768px for tablet)
export const breakpoints = {
  sm: '640px',
  md: '768px',     // Tablet breakpoint (cohort)
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Component-specific spacing (extracted from cohort)
export const componentSpacing = {
  button: {
    // CTA button (cohort)
    height: '56px',
    paddingX: '2rem',   // Horizontal padding
    paddingY: '0',      // Vertical (height-based)
  },
  card: {
    padding: {
      sm: '1rem',       // 16px
      md: '1.5rem',     // 24px
      lg: '2rem',       // 32px
    },
    gap: '0.75rem',     // Gap between cards in grids
  },
  modal: {
    maxWidth: '440px',  // Cohort modal
    padding: '1.5rem',
  },
  header: {
    padding: '1rem',
    height: 'auto',
  },
  section: {
    paddingY: {
      sm: '3rem',       // Mobile
      md: '4rem',       // Desktop
    },
    paddingX: '1rem',
  },
  icon: {
    sm: '24px',
    md: '32px',
    lg: '40px',         // Feature card icon (cohort)
    xl: '48px',
  },
} as const

// Type exports
export type Spacing = typeof spacing
export type Container = typeof container
export type Breakpoints = typeof breakpoints
export type ComponentSpacing = typeof componentSpacing
