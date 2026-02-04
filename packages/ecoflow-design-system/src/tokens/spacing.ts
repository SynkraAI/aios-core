/**
 * EcoFlow Design System - Spacing Tokens
 *
 * Spacing scale based on 4px base unit with 8px grid system
 *
 * @see packages/ecoflow-design-system/design-analysis/01-design-tokens-analysis.md
 */

export const spacing = {
  px: '1px', // Borders
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px  ★ BASE UNIT
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px  ★ GRID BASE
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px ★ COMMON (form fields, table cells)
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px ★ COMMON (buttons, sidebar padding)
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px ★ COMMON (cards, containers)
  7: '1.75rem', // 28px
  8: '2rem', // 32px ★ SECTION SPACING
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px ★ LARGE SECTIONS
  14: '3.5rem', // 56px
  16: '4rem', // 64px ★ HERO SPACING
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
} as const;

/**
 * Container Widths
 * Max-width constraints for content areas
 */
export const container = {
  sm: '640px', // Mobile landscape
  md: '768px', // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop ★ MAIN
  '2xl': '1536px', // Extra large
  full: '100%', // Full width
} as const;

/**
 * Breakpoints
 * Media query breakpoints for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px', // ★ PRIMARY TARGET (dashboard optimized)
  '2xl': '1536px',
} as const;

// Type definitions
export type SpacingKey = keyof typeof spacing;
export type SpacingValue = typeof spacing[SpacingKey];
export type ContainerSize = keyof typeof container;
export type Breakpoint = keyof typeof breakpoints;

/**
 * Get spacing value
 *
 * @example
 * getSpacing(4) // '1rem' (16px)
 * getSpacing(6) // '1.5rem' (24px)
 */
export function getSpacing(size: SpacingKey): string {
  const value = spacing[size];
  if (!value) {
    throw new Error(`Invalid spacing size: ${size}`);
  }
  return value;
}

/**
 * Get container width
 *
 * @example
 * getContainerWidth('xl') // '1280px'
 */
export function getContainerWidth(size: ContainerSize): string {
  const value = container[size];
  if (!value) {
    throw new Error(`Invalid container size: ${size}`);
  }
  return value;
}

/**
 * Get breakpoint value
 *
 * @example
 * getBreakpoint('lg') // '1024px'
 */
export function getBreakpoint(bp: Breakpoint): string {
  const value = breakpoints[bp];
  if (!value) {
    throw new Error(`Invalid breakpoint: ${bp}`);
  }
  return value;
}

/**
 * Spacing Use Cases
 * Common spacing patterns observed in reference designs
 */
export const spacingPatterns = {
  // Component Padding
  cardPadding: spacing[6], // 24px
  buttonPaddingX: spacing[4], // 16px
  buttonPaddingY: spacing[2], // 8px
  inputPadding: spacing[3], // 12px
  sidebarPadding: spacing[4], // 16px
  containerPadding: spacing[6], // 24px
  tableCellPadding: spacing[3], // 12px

  // Component Gaps
  formFieldGap: spacing[3], // 12px
  sectionGap: spacing[8], // 32px
  heroSectionGap: spacing[12], // 48px
  cardStackGap: spacing[4], // 16px
  buttonGroupGap: spacing[2], // 8px
  navItemGap: spacing[1], // 4px

  // Layout
  sidebarWidth: '240px', // Fixed sidebar
  topBarHeight: '64px', // Top navigation bar
} as const;

/**
 * CSS Custom Properties
 */
export const spacingToCSSVariables = (): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Spacing scale
  Object.entries(spacing).forEach(([key, value]) => {
    const varName = key === 'px' ? 'px' : key;
    cssVars[`--spacing-${varName}`] = value;
  });

  // Container widths
  Object.entries(container).forEach(([key, value]) => {
    cssVars[`--container-${key}`] = value;
  });

  // Breakpoints
  Object.entries(breakpoints).forEach(([key, value]) => {
    cssVars[`--breakpoint-${key}`] = value;
  });

  return cssVars;
};
