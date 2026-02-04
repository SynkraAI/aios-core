/**
 * iOS 16 Spacing System
 * Based on 8pt grid system
 * https://developer.apple.com/design/human-interface-guidelines/layout
 */

/**
 * Base spacing unit (8pt)
 * All spacing values are multiples of this base unit
 */
export const BASE_SPACING_UNIT = 8

/**
 * iOS Spacing Scale
 * Based on 8pt grid system: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
 */
export const spacing = {
  /** 4px - Extra small spacing for tight layouts */
  xs: '4px',

  /** 8px - Small spacing, minimum touch target offset */
  sm: '8px',

  /** 12px - Medium-small spacing */
  md: '12px',

  /** 16px - Base spacing unit, standard padding */
  base: '16px',

  /** 20px - Large spacing, list item padding */
  lg: '20px',

  /** 24px - Extra large spacing */
  xl: '24px',

  /** 32px - 2x large spacing, section spacing */
  '2xl': '32px',

  /** 40px - 3x large spacing */
  '3xl': '40px',

  /** 48px - 4x large spacing */
  '4xl': '48px',

  /** 64px - 5x large spacing, major section breaks */
  '5xl': '64px',
} as const

/**
 * iOS Standard Margins
 * Common margin values used across iOS
 */
export const margins = {
  /** Standard horizontal margin for content */
  content: '16px',

  /** Horizontal margin for inset lists */
  inset: '20px',

  /** Horizontal margin for grouped content */
  grouped: '16px',

  /** Vertical spacing between sections */
  section: '24px',

  /** Large vertical spacing */
  large: '32px',
} as const

/**
 * iOS Padding Values
 * Common padding values for components
 */
export const padding = {
  /** Small padding for compact elements */
  sm: '8px',

  /** Medium padding for buttons and inputs */
  md: '12px',

  /** Standard padding for list items */
  base: '16px',

  /** Large padding for cards and containers */
  lg: '20px',

  /** Extra large padding */
  xl: '24px',
} as const

/**
 * iOS Safe Area Insets
 * Dynamic spacing for safe areas (notch, home indicator)
 */
export const safeAreaInsets = {
  /** Top safe area (notch on iPhone 14 Pro: 59pt = 59px) */
  top: 'env(safe-area-inset-top, 0px)',

  /** Bottom safe area (home indicator: 34pt = 34px) */
  bottom: 'env(safe-area-inset-bottom, 0px)',

  /** Left safe area */
  left: 'env(safe-area-inset-left, 0px)',

  /** Right safe area */
  right: 'env(safe-area-inset-right, 0px)',
} as const

/**
 * iOS Component-Specific Spacing
 */
export const componentSpacing = {
  /** Minimum tap target size (44pt × 44pt) */
  minTouchTarget: '44px',

  /** Standard button height */
  buttonHeight: '44px',

  /** Tab bar height (49pt) */
  tabBarHeight: '49px',

  /** Navigation bar height (44pt) */
  navBarHeight: '44px',

  /** Large navigation bar height (96pt) */
  largeNavBarHeight: '96px',

  /** Toolbar height (44pt) */
  toolbarHeight: '44px',

  /** List row minimum height */
  listRowMinHeight: '44px',

  /** Icon size standard */
  iconSize: '28px',

  /** Icon size small */
  iconSizeSmall: '20px',

  /** Icon size large */
  iconSizeLarge: '32px',
} as const

/**
 * iOS Border Widths
 */
export const borderWidth = {
  /** Hairline separator (0.5pt on iOS) */
  hairline: '0.5px',

  /** Thin border */
  thin: '1px',

  /** Medium border */
  medium: '2px',

  /** Thick border */
  thick: '4px',
} as const

/**
 * Helper function to get spacing value
 */
export function getSpacing(multiplier: number): string {
  return `${BASE_SPACING_UNIT * multiplier}px`
}

/**
 * Helper function to calculate safe area aware padding
 */
export function withSafeArea(value: string, side: 'top' | 'bottom' | 'left' | 'right'): string {
  return `calc(${value} + ${safeAreaInsets[side]})`
}

/**
 * Type utilities
 */
export type SpacingKey = keyof typeof spacing
export type MarginKey = keyof typeof margins
export type PaddingKey = keyof typeof padding
export type ComponentSpacingKey = keyof typeof componentSpacing
