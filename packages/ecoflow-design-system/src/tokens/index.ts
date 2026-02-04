/**
 * EcoFlow Design System - Design Tokens
 *
 * Centralized export of all design tokens
 *
 * @example
 * import { colors, typography, spacing } from '@fosc/ecoflow-design-system/tokens';
 * import { getColor, getFontSize, getSpacing } from '@fosc/ecoflow-design-system/tokens';
 */

// Token objects
import { colorsToCSSVariables as colorsToCSS } from './colors';
export { colors, getColor, colorsToCSSVariables } from './colors';
export type {
  ColorScale,
  ColorValue,
  PrimaryColor,
  AccentColor,
  NeutralColor,
  SemanticColorType,
  SemanticColorVariant,
} from './colors';

import { typographyToCSSVariables as typographyToCSS } from './typography';
export {
  typography,
  typographyPresets,
  getFontSize,
  getFontWeight,
  getLineHeight,
  getLetterSpacing,
  getTypographyPreset,
  typographyToCSSVariables,
} from './typography';
export type {
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
} from './typography';

import { spacingToCSSVariables as spacingToCSS } from './spacing';
export {
  spacing,
  container,
  breakpoints,
  spacingPatterns,
  getSpacing,
  getContainerWidth,
  getBreakpoint,
  spacingToCSSVariables,
} from './spacing';
export type {
  SpacingKey,
  SpacingValue,
  ContainerSize,
  Breakpoint,
} from './spacing';

import { shadowsToCSSVariables as shadowsToCSS } from './shadows';
export {
  shadows,
  shadowPatterns,
  zIndexLayers,
  getBoxShadow,
  getZIndex,
  shadowsToCSSVariables,
} from './shadows';
export type { BoxShadow, ZIndex } from './shadows';

import { bordersToCSSVariables as bordersToCSS } from './borders';
export {
  borders,
  borderPatterns,
  getBorderRadius,
  getBorderWidth,
  getBorderColor,
  bordersToCSSVariables,
} from './borders';
export type { BorderRadius, BorderWidth, BorderColor } from './borders';

/**
 * Generate all CSS Custom Properties
 * Use this to inject design tokens as CSS variables
 *
 * @example
 * const cssVars = generateCSSVariables();
 * // Apply to root element
 * Object.entries(cssVars).forEach(([key, value]) => {
 *   document.documentElement.style.setProperty(key, value);
 * });
 */
export function generateCSSVariables(): Record<string, string> {
  return {
    ...colorsToCSS(),
    ...typographyToCSS(),
    ...spacingToCSS(),
    ...shadowsToCSS(),
    ...bordersToCSS(),
  };
}

/**
 * Token Summary
 * Quick reference for all available tokens
 */
export const tokenSummary = {
  colors: {
    primary: '10 shades of teal (#00BFA5)',
    accent: '10 shades of yellow (#FFB800)',
    neutral: '10 shades of gray + black/white',
    semantic: 'success, warning, error, info',
  },
  typography: {
    fontFamily: 'Inter, system-ui fallback',
    fontSize: '10 sizes (12px - 60px)',
    fontWeight: '6 weights (300-800)',
    lineHeight: '6 values (1 - 2)',
    letterSpacing: '6 values (-0.05em - 0.1em)',
  },
  spacing: {
    scale: '32 stops (4px base, 8px grid)',
    containers: '6 sizes (640px - 1536px)',
    breakpoints: '5 breakpoints (640px - 1536px)',
  },
  shadows: {
    boxShadow: '8 elevation levels',
    zIndex: '6 layers (0 - 50)',
  },
  borders: {
    borderRadius: '9 sizes (0 - 9999px)',
    borderWidth: '5 sizes (0 - 8px)',
    borderColor: '5 preset colors',
  },
} as const;
