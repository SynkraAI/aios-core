/**
 * Lendário AI Design System - Shadow Tokens
 *
 * Extracted from cohort.lendario.ai
 */

export const shadows = {
  // Box shadows
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Component-specific shadows from cohort
    button: '0 10px 40px rgba(245, 215, 110, 0.3)',           // CTA button default
    buttonHover: '0 15px 50px rgba(245, 215, 110, 0.4)',      // CTA button hover
    modal: '0 25px 80px rgba(0, 0, 0, 0.6)',                  // Modal backdrop
  },

  // Z-index scale
  zIndex: {
    0: 0,
    10: 10,      // Header (cohort)
    20: 20,
    30: 30,
    40: 40,
    50: 50,      // Modal
    auto: 'auto',
  },

  // Blur effects (cohort hero section)
  blur: {
    sm: 'blur(10px)',   // Modal backdrop
    md: 'blur(50px)',
    lg: 'blur(100px)',  // Hero decorative blurs
  },
} as const

// Gradient shadows/effects (cohort)
export const gradients = {
  hero: 'linear-gradient(135deg, rgba(15, 181, 174, 0.1) 0%, transparent 50%)',
  cardTeal: 'linear-gradient(135deg, rgba(15, 181, 174, 0.1) 0%, rgba(15, 15, 15, 0.8) 100%)',
  cardGreen: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 15, 15, 0.8) 100%)',
  vibeCard: 'linear-gradient(135deg, rgba(15, 181, 174, 0.1) 0%, rgba(15, 15, 15, 0.8) 100%)',
} as const

// Backdrop filters
export const backdropFilters = {
  none: 'none',
  blur: 'blur(10px)',              // Modal (cohort)
  blurSaturate: 'blur(10px) saturate(180%)',
} as const

// Type exports
export type Shadows = typeof shadows
export type Gradients = typeof gradients
export type BackdropFilters = typeof backdropFilters
