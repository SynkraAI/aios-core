/**
 * Lendário AI Design System - Color Tokens
 *
 * Extracted from:
 * - https://www.academialendaria.ai/club
 * - https://cohort.lendario.ai/
 * - https://app.lendario.ai/dados
 */

export const colors = {
  // Primary - Teal/Cyan (main brand color)
  primary: {
    50: '#E0FAF9',
    100: '#B3F1EE',
    200: '#80E8E3',
    300: '#4DDED7',
    400: '#26D5CD',
    500: '#0FB5AE', // Main - cohort page accent
    600: '#0DA29C',
    700: '#0A8E89',
    800: '#087A77',
    900: '#055756',
  },

  // Secondary - Gold/Yellow (CTA buttons)
  secondary: {
    50: '#FEF9EB',
    100: '#FDEFC7',
    200: '#FCE4A0',
    300: '#FBD979',
    400: '#F9D05C',
    500: '#F5D76E', // Main - cohort CTA button
    600: '#F4C73F',
    700: '#F0B520',
    800: '#C9B298', // Gold variant from cohort
    900: '#C4A76A', // Gold variant from app
  },

  // Semantic Colors
  semantic: {
    success: {
      DEFAULT: '#10B981', // Cohort accent-green
      light: '#D1FAE5',
      dark: '#065F46',
    },
    warning: {
      DEFAULT: '#FF9500', // App warning
      light: '#FEF3C7',
      dark: '#92400E',
    },
    error: {
      DEFAULT: '#F43F5E', // Cohort accent-red
      light: '#FEE2E2',
      dark: '#991B1B',
    },
    info: {
      DEFAULT: '#0EA5E9', // App info
      light: '#DBEAFE',
      dark: '#1E40AF',
    },
  },

  // Neutral Scale (Dark Theme - Primary)
  neutral: {
    50: '#F0F0E8',   // Text primary (cohort)
    100: '#EEF1F5',  // Light backgrounds
    200: '#E8E8E8',  // Borders (light)
    300: '#919180',  // Text secondary (cohort)
    400: '#737373',  // Muted text
    500: '#525252',
    600: '#404040',
    700: '#2B2B2B',  // Borders (dark)
    800: '#171717',  // Text (light mode)
    900: '#0A0A0A',  // Card background (cohort)
    950: '#000000',  // Main background (cohort)
  },

  // Background Colors
  background: {
    DEFAULT: '#000000',           // Main dark (cohort)
    card: '#0a0a0a',             // Card dark (cohort)
    elevated: '#050505',          // Section background (cohort)
    light: '#FFFFFF',            // Light mode
    lightCard: '#F8F9FA',        // Light mode cards (app)
    darkApp: '#0A0E27',          // App dark mode
    darkAppCard: '#131B2B',      // App dark cards
  },

  // Border Colors
  border: {
    DEFAULT: '#1a3a3a',                          // Cohort border
    light: 'rgba(15, 181, 174, 0.15)',          // Teal transparent
    lightMode: '#E8E8E8',                       // Light mode border
    darkMode: '#2B2B2B',                        // Dark mode border
  },

  // Overlay & Effects
  overlay: {
    modal: 'rgba(0, 0, 0, 0.6)',               // Modal backdrop
    card: 'rgba(10, 10, 10, 0.9)',             // Card overlay
    cardAlt: 'rgba(15, 15, 15, 0.8)',          // Alternative card
    blur1: 'rgba(15, 181, 174, 0.08)',         // Hero blur teal
    blur2: 'rgba(201, 178, 152, 0.1)',         // Hero blur gold
  },
} as const

// Type export for TypeScript
export type Colors = typeof colors
export type ColorKey = keyof typeof colors
export type PrimaryShade = keyof typeof colors.primary
