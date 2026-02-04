/**
 * EcoFlow Design System - Color Tokens
 *
 * Color palette extracted from reference designs.
 * Organized by: Primary (teal), Accent (yellow), Neutral (grays), Semantic (status colors)
 *
 * @see packages/ecoflow-design-system/design-analysis/01-design-tokens-analysis.md
 */

export const colors = {
  /**
   * Primary Colors - Teal/Cyan Family
   * Main brand color used for sidebar, primary actions, active states
   */
  primary: {
    50: '#E0F7F4', // Very light teal (backgrounds, hover states)
    100: '#B3EDE5', // Light teal
    200: '#80E1D5', // Medium-light teal
    300: '#4DD5C4', // Medium teal
    400: '#26CCB8', // Medium-dark teal
    500: '#00BFA5', // Main brand teal ★ PRIMARY
    600: '#00B296', // Dark teal (accessible text on white)
    700: '#00A386', // Darker teal
    800: '#009476', // Very dark teal
    900: '#007A58', // Deepest teal
  },

  /**
   * Accent Colors - Yellow/Gold Family
   * Used for call-to-action buttons, warnings, highlighted metrics
   */
  accent: {
    yellow: {
      50: '#FFF9E6', // Very light yellow (backgrounds)
      100: '#FFF0B3', // Light yellow
      200: '#FFE680', // Medium-light yellow
      300: '#FFDC4D', // Medium yellow
      400: '#FFD426', // Medium-dark yellow
      500: '#FFB800', // Main accent yellow ★ ACCENT
      600: '#F5A300', // Dark yellow/amber
      700: '#EB8E00', // Orange-yellow
      800: '#E17900', // Dark orange
      900: '#D15900', // Deep orange
    },
  },

  /**
   * Neutral Palette - Grays
   * Used for text, borders, backgrounds, and UI structure
   */
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    50: '#F9FAFB', // Lightest gray (page backgrounds)
    100: '#F3F4F6', // Very light gray (card backgrounds)
    200: '#E5E7EB', // Light gray (borders, dividers)
    300: '#D1D5DB', // Medium-light gray (inactive borders)
    400: '#9CA3AF', // Medium gray (placeholder text)
    500: '#6B7280', // Base gray (secondary text)
    600: '#4B5563', // Dark gray (body text) ★ DEFAULT TEXT
    700: '#374151', // Darker gray (headings)
    800: '#1F2937', // Very dark gray (emphasis text)
    900: '#111827', // Near black (primary text)
  },

  /**
   * Semantic Colors
   * Status colors with consistent meaning across the system
   */
  semantic: {
    success: {
      light: '#D1FAE5', // Light green background
      DEFAULT: '#10B981', // Green (approved status) ★
      dark: '#047857', // Dark green
    },
    warning: {
      light: '#FEF3C7', // Light yellow background
      DEFAULT: '#F59E0B', // Amber (warning, in review) ★
      dark: '#D97706', // Dark amber
    },
    error: {
      light: '#FEE2E2', // Light red background
      DEFAULT: '#EF4444', // Red (error, direct status) ★
      dark: '#DC2626', // Dark red
    },
    info: {
      light: '#DBEAFE', // Light blue background
      DEFAULT: '#3B82F6', // Blue ★
      dark: '#1D4ED8', // Dark blue
    },
  },

  /**
   * Extended Palette
   * Additional colors for gradients and special use cases
   */
  extended: {
    darkForest: '#0D3330', // Very dark teal-green (text on teal bg)
  },
} as const;

// Type definitions
export type ColorScale = typeof colors.primary;
export type ColorValue = ColorScale[keyof ColorScale];
export type PrimaryColor = keyof typeof colors.primary;
export type AccentColor = keyof typeof colors.accent.yellow;
export type NeutralColor = keyof typeof colors.neutral;
export type SemanticColorType = keyof typeof colors.semantic;
export type SemanticColorVariant = keyof typeof colors.semantic.success;

/**
 * Color accessor function
 * Provides type-safe access to color tokens
 *
 * @example
 * getColor('primary', 500) // '#00BFA5'
 * getColor('accent.yellow', 500) // '#FFB800'
 * getColor('semantic.success', 'DEFAULT') // '#10B981'
 */
export function getColor(
  category: 'primary' | 'neutral',
  shade: number | 'white' | 'black'
): string;
export function getColor(category: 'accent.yellow', shade: number): string;
export function getColor(
  category: 'semantic.success' | 'semantic.warning' | 'semantic.error' | 'semantic.info',
  shade: 'light' | 'DEFAULT' | 'dark'
): string;
export function getColor(category: string, shade: string | number): string {
  const [cat, subcat] = category.split('.');

  if (!cat) {
    throw new Error(`Invalid color category: ${category}`);
  }

  if (subcat) {
    // Handle nested categories like 'accent.yellow' or 'semantic.success'
    const palette = (colors as any)[cat]?.[subcat];
    if (!palette) {
      throw new Error(`Invalid color category: ${category}`);
    }
    const color = (palette as any)[shade];
    if (!color) {
      throw new Error(`Invalid color shade: ${shade} for ${category}`);
    }
    return color;
  } else {
    // Handle top-level categories like 'primary' or 'neutral'
    const palette = (colors as any)[cat];
    if (!palette) {
      throw new Error(`Invalid color category: ${category}`);
    }
    const color = (palette as any)[shade];
    if (!color) {
      throw new Error(`Invalid color shade: ${shade} for ${category}`);
    }
    return color;
  }
}

/**
 * CSS Custom Properties
 * Export colors as CSS variables for use in stylesheets
 */
export const colorsToCSSVariables = (): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Primary
  Object.entries(colors.primary).forEach(([shade, value]) => {
    cssVars[`--color-primary-${shade}`] = value;
  });

  // Accent
  Object.entries(colors.accent.yellow).forEach(([shade, value]) => {
    cssVars[`--color-accent-yellow-${shade}`] = value;
  });

  // Neutral
  Object.entries(colors.neutral).forEach(([shade, value]) => {
    cssVars[`--color-neutral-${shade}`] = value;
  });

  // Semantic
  Object.entries(colors.semantic).forEach(([type, variants]) => {
    Object.entries(variants).forEach(([variant, value]) => {
      const varName = variant === 'DEFAULT' ? type : `${type}-${variant}`;
      cssVars[`--color-semantic-${varName}`] = value;
    });
  });

  return cssVars;
};
