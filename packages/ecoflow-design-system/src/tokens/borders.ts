/**
 * EcoFlow Design System - Border Tokens
 *
 * Border radius and border width/color tokens
 *
 * @see packages/ecoflow-design-system/design-analysis/01-design-tokens-analysis.md
 */

import { colors } from './colors';

export const borders = {
  /**
   * Border Radius
   * Rounding values for corners
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px - subtle rounding
    DEFAULT: '0.25rem', // 4px - inputs, small buttons ★
    md: '0.375rem', // 6px - cards ★ MOST COMMON
    lg: '0.5rem', // 8px - large cards, modals
    xl: '0.75rem', // 12px - hero images
    '2xl': '1rem', // 16px - decorative
    '3xl': '1.5rem', // 24px - very rounded
    full: '9999px', // Pill buttons, badges ★ BADGES
  },

  /**
   * Border Width
   * Standard border thicknesses
   */
  borderWidth: {
    0: '0',
    DEFAULT: '1px', // Standard borders ★
    2: '2px', // Emphasized borders
    4: '4px', // Heavy borders (rare)
    8: '8px', // Very heavy (decorative)
  },

  /**
   * Border Colors
   * Using color palette for consistency
   */
  borderColor: {
    DEFAULT: colors.neutral[200], // #E5E7EB ★ MOST COMMON
    light: colors.neutral[100], // Subtle borders
    dark: colors.neutral[300], // Emphasized borders
    primary: colors.primary[500], // Active/focused state
    transparent: 'transparent',
  },
} as const;

// Type definitions
export type BorderRadius = keyof typeof borders.borderRadius;
export type BorderWidth = keyof typeof borders.borderWidth;
export type BorderColor = keyof typeof borders.borderColor;

/**
 * Get border radius value
 *
 * @example
 * getBorderRadius('md') // '0.375rem' (6px)
 * getBorderRadius('full') // '9999px' (circle/pill)
 */
export function getBorderRadius(radius: BorderRadius): string {
  const value = borders.borderRadius[radius];
  if (value === undefined) {
    throw new Error(`Invalid border radius: ${radius}`);
  }
  return value;
}

/**
 * Get border width value
 *
 * @example
 * getBorderWidth('DEFAULT') // '1px'
 * getBorderWidth(2) // '2px'
 */
export function getBorderWidth(width: BorderWidth): string {
  const value = borders.borderWidth[width];
  if (value === undefined) {
    throw new Error(`Invalid border width: ${width}`);
  }
  return value;
}

/**
 * Get border color value
 *
 * @example
 * getBorderColor('DEFAULT') // '#E5E7EB'
 * getBorderColor('primary') // '#00BFA5'
 */
export function getBorderColor(color: BorderColor): string {
  const value = borders.borderColor[color];
  if (value === undefined) {
    throw new Error(`Invalid border color: ${color}`);
  }
  return value;
}

/**
 * Border Use Cases
 * Common border patterns observed in reference designs
 */
export const borderPatterns = {
  // Cards
  card: {
    width: borders.borderWidth[0], // No border (shadow only)
    radius: borders.borderRadius.md, // 6px
  },

  // Inputs
  input: {
    width: borders.borderWidth.DEFAULT, // 1px
    color: borders.borderColor.dark, // neutral.300
    radius: borders.borderRadius.DEFAULT, // 4px
  },
  inputFocus: {
    width: borders.borderWidth[2], // 2px
    color: borders.borderColor.primary, // primary.500
  },

  // Buttons
  button: {
    radius: borders.borderRadius.DEFAULT, // 4px
  },

  // Status Badges
  badge: {
    radius: borders.borderRadius.full, // Pill shape
  },

  // Tables
  tableCell: {
    width: borders.borderWidth.DEFAULT, // 1px
    color: borders.borderColor.DEFAULT, // neutral.200
  },

  // Dividers
  divider: {
    width: borders.borderWidth.DEFAULT, // 1px
    color: borders.borderColor.light, // neutral.100
  },

  // Hero Images
  heroImage: {
    radius: borders.borderRadius.lg, // 8px
  },
} as const;

/**
 * CSS Custom Properties
 */
export const bordersToCSSVariables = (): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Border radius
  Object.entries(borders.borderRadius).forEach(([key, value]) => {
    cssVars[`--border-radius-${key}`] = value;
  });

  // Border width
  Object.entries(borders.borderWidth).forEach(([key, value]) => {
    cssVars[`--border-width-${key}`] = value;
  });

  // Border colors
  Object.entries(borders.borderColor).forEach(([key, value]) => {
    cssVars[`--border-color-${key}`] = value;
  });

  return cssVars;
};
