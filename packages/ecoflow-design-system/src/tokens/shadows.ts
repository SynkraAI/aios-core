/**
 * EcoFlow Design System - Shadow Tokens
 *
 * Elevation system using box shadows and z-index layers
 *
 * @see packages/ecoflow-design-system/design-analysis/01-design-tokens-analysis.md
 */

export const shadows = {
  boxShadow: {
    // No shadow
    none: 'none',

    // Subtle elevation (cards on page background)
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

    // Default card elevation ★ MOST COMMON
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

    // Elevated cards (hover, active)
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

    // Modals, popovers
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

    // Dropdown menus
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

    // Heavy emphasis (drawers, large modals)
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

    // Inset shadow (inputs)
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  /**
   * Z-Index Layers
   * Stacking order for overlapping elements
   */
  zIndex: {
    0: 0, // Base content
    10: 10, // Default stacking
    20: 20, // Dropdowns, tooltips
    30: 30, // Sticky headers
    40: 40, // Modal overlays
    50: 50, // Modal content
    auto: 'auto',
  },
} as const;

// Type definitions
export type BoxShadow = keyof typeof shadows.boxShadow;
export type ZIndex = keyof typeof shadows.zIndex;

/**
 * Get box shadow value
 *
 * @example
 * getBoxShadow('DEFAULT') // '0 1px 3px 0 rgb(0 0 0 / 0.1), ...'
 * getBoxShadow('lg') // '0 10px 15px -3px rgb(0 0 0 / 0.1), ...'
 */
export function getBoxShadow(shadow: BoxShadow): string {
  const value = shadows.boxShadow[shadow];
  if (value === undefined) {
    throw new Error(`Invalid box shadow: ${shadow}`);
  }
  return value;
}

/**
 * Get z-index value
 *
 * @example
 * getZIndex(20) // 20
 * getZIndex(50) // 50
 */
export function getZIndex(layer: ZIndex): number | string {
  const value = shadows.zIndex[layer];
  if (value === undefined) {
    throw new Error(`Invalid z-index: ${layer}`);
  }
  return value;
}

/**
 * Shadow Use Cases
 * Common shadow patterns observed in reference designs
 */
export const shadowPatterns = {
  card: shadows.boxShadow.DEFAULT, // Default card elevation
  cardHover: shadows.boxShadow.md, // Card on hover
  modal: shadows.boxShadow.lg, // Modal dialogs
  dropdown: shadows.boxShadow.xl, // Dropdown menus
  input: shadows.boxShadow.inner, // Input fields
  buttonActive: shadows.boxShadow.inner, // Active button state
} as const;

/**
 * Z-Index Layer Strategy
 * Recommended z-index values for common components
 */
export const zIndexLayers = {
  baseContent: shadows.zIndex[0], // Default page content
  stickyNav: shadows.zIndex[30], // Sticky navigation
  dropdown: shadows.zIndex[20], // Dropdowns and tooltips
  modalOverlay: shadows.zIndex[40], // Modal background overlay
  modalContent: shadows.zIndex[50], // Modal foreground content
} as const;

/**
 * CSS Custom Properties
 */
export const shadowsToCSSVariables = (): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Box shadows
  Object.entries(shadows.boxShadow).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });

  // Z-index
  Object.entries(shadows.zIndex).forEach(([key, value]) => {
    cssVars[`--z-index-${key}`] = String(value);
  });

  return cssVars;
};
