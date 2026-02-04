/**
 * iOS 16 Border Radius System
 * iOS uses continuous corner curves (squircle) for rounded corners
 * https://developer.apple.com/design/human-interface-guidelines/visual-design
 */

/**
 * iOS Border Radius Scale
 * Standard border radius values used across iOS
 */
export const radius = {
  /** No rounding */
  none: '0px',

  /** Extra small radius - subtle rounding (2px) */
  xs: '2px',

  /** Small radius - buttons, badges (4px) */
  sm: '4px',

  /** Medium radius - text fields, small cards (8px) */
  md: '8px',

  /** Base radius - standard buttons and cards (10px) */
  base: '10px',

  /** Large radius - large cards, modals (12px) */
  lg: '12px',

  /** Extra large radius - sheets, action sheets (14px) */
  xl: '14px',

  /** 2x large radius - app icons, prominent elements (16px) */
  '2xl': '16px',

  /** 3x large radius - very prominent elements (20px) */
  '3xl': '20px',

  /** Full radius - circular elements (50%) */
  full: '50%',
} as const

/**
 * iOS Component-Specific Radius
 * Pre-configured radius values for common iOS components
 */
export const componentRadius = {
  /** Button radius (iOS standard: 10pt) */
  button: '10px',

  /** Text field radius */
  textField: '8px',

  /** Toggle/Switch pill shape */
  toggle: '27px', // Half of 54px height for perfect circle

  /** Card radius */
  card: '12px',

  /** Alert/Modal radius */
  alert: '14px',

  /** Action Sheet radius */
  actionSheet: '14px',

  /** Badge radius */
  badge: '10px',

  /** Badge small radius */
  badgeSmall: '8px',

  /** App icon radius (iOS 16: 20% of size) */
  appIcon: '20%',

  /** Tab bar icon background */
  tabIconBackground: '10px',

  /** Search bar radius */
  searchBar: '10px',

  /** Segmented control radius */
  segmentedControl: '8px',

  /** List item grouped radius */
  listGrouped: '10px',

  /** Sheet top corners */
  sheetTop: '10px',
} as const

/**
 * iOS Continuous Corner Configuration
 * iOS uses a special "squircle" curve instead of circular arcs
 * This provides a more organic, pleasing appearance
 *
 * Note: True continuous corners require complex math.
 * For web, we approximate with standard border-radius.
 * For pixel-perfect iOS matching, consider using CSS clip-path with SVG.
 */
export const continuousCorners = {
  /** Enable continuous corners (requires CSS Houdini or polyfill) */
  enabled: false,

  /**
   * Approximate continuous corners using border-radius
   * The ratio is adjusted for better visual match to iOS
   */
  approximationRatio: 1.2, // Multiply standard radius by this for closer match
} as const

/**
 * Helper function to get continuous corner radius
 * @param baseRadius - Standard border radius value
 * @returns Approximated continuous corner radius
 */
export function getContinuousRadius(baseRadius: string): string {
  if (!continuousCorners.enabled) {
    return baseRadius
  }

  // Parse numeric value
  const numericValue = parseFloat(baseRadius)
  const unit = baseRadius.replace(/[0-9.]/g, '')

  // Apply approximation ratio
  return `${numericValue * continuousCorners.approximationRatio}${unit}`
}

/**
 * iOS Corner Combinations
 * Common corner configurations
 */
export const cornerConfig = {
  /** All corners rounded */
  all: {
    topLeft: true,
    topRight: true,
    bottomLeft: true,
    bottomRight: true,
  },

  /** Top corners only */
  top: {
    topLeft: true,
    topRight: true,
    bottomLeft: false,
    bottomRight: false,
  },

  /** Bottom corners only */
  bottom: {
    topLeft: false,
    topRight: false,
    bottomLeft: true,
    bottomRight: true,
  },

  /** Left corners only */
  left: {
    topLeft: true,
    topRight: false,
    bottomLeft: true,
    bottomRight: false,
  },

  /** Right corners only */
  right: {
    topLeft: false,
    topRight: true,
    bottomLeft: false,
    bottomRight: true,
  },

  /** No corners rounded */
  none: {
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  },
} as const

/**
 * Helper function to generate border-radius CSS for specific corners
 */
export function getCornerRadius(
  corners: keyof typeof cornerConfig,
  radiusValue: string
): string {
  const config = cornerConfig[corners]
  return [
    config.topLeft ? radiusValue : '0',
    config.topRight ? radiusValue : '0',
    config.bottomRight ? radiusValue : '0',
    config.bottomLeft ? radiusValue : '0',
  ].join(' ')
}

/**
 * Type utilities
 */
export type RadiusKey = keyof typeof radius
export type ComponentRadiusKey = keyof typeof componentRadius
export type CornerConfigKey = keyof typeof cornerConfig
