/**
 * iOS 16 Shadow System
 * iOS uses subtle shadows and blur effects for elevation
 * https://developer.apple.com/design/human-interface-guidelines/visual-design
 */

export interface IOSShadow {
  offsetX: string
  offsetY: string
  blur: string
  spread: string
  color: string
  boxShadow: string
}

/**
 * iOS Shadow Elevations
 * iOS uses subtle shadows compared to Material Design
 */
export const shadows = {
  /**
   * No shadow - flat surface
   */
  none: {
    offsetX: '0px',
    offsetY: '0px',
    blur: '0px',
    spread: '0px',
    color: 'transparent',
    boxShadow: 'none',
  },

  /**
   * Small shadow - for buttons and small cards
   * Subtle elevation effect
   */
  sm: {
    offsetX: '0px',
    offsetY: '1px',
    blur: '3px',
    spread: '0px',
    color: 'rgba(0, 0, 0, 0.10)',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.10)',
  },

  /**
   * Medium shadow - for cards and modals
   * Standard iOS card shadow
   */
  md: {
    offsetX: '0px',
    offsetY: '2px',
    blur: '10px',
    spread: '0px',
    color: 'rgba(0, 0, 0, 0.10)',
    boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.10)',
  },

  /**
   * Large shadow - for sheets and floating elements
   * More prominent elevation
   */
  lg: {
    offsetX: '0px',
    offsetY: '4px',
    blur: '20px',
    spread: '0px',
    color: 'rgba(0, 0, 0, 0.12)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
  },

  /**
   * Extra large shadow - for alerts and prominent overlays
   * Maximum elevation effect
   */
  xl: {
    offsetX: '0px',
    offsetY: '8px',
    blur: '30px',
    spread: '0px',
    color: 'rgba(0, 0, 0, 0.15)',
    boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.15)',
  },

  /**
   * Inner shadow - for pressed states and inset elements
   */
  inner: {
    offsetX: '0px',
    offsetY: '2px',
    blur: '4px',
    spread: '0px',
    color: 'rgba(0, 0, 0, 0.10)',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.10)',
  },
} as const satisfies Record<string, IOSShadow>

/**
 * iOS Blur Effects
 * iOS uses backdrop blur for translucent surfaces
 */
export const blur = {
  /** No blur */
  none: '0px',

  /** Small blur for subtle effects */
  sm: '8px',

  /** Medium blur for standard translucent surfaces */
  md: '16px',

  /** Large blur for prominent overlays */
  lg: '24px',

  /** Extra large blur for maximum effect */
  xl: '32px',
} as const

/**
 * iOS Backdrop Filter Presets
 * For creating translucent navigation bars and sheets
 */
export const backdropFilter = {
  /** No filter */
  none: 'none',

  /** Light blur - for standard navigation bars */
  light: 'blur(16px) saturate(180%)',

  /** Medium blur - for sheets and modals */
  medium: 'blur(24px) saturate(180%)',

  /** Heavy blur - for prominent overlays */
  heavy: 'blur(32px) saturate(180%)',

  /** Vibrancy effect - iOS-style vibrancy */
  vibrancy: 'blur(16px) saturate(180%) brightness(1.05)',
} as const

/**
 * iOS Component-Specific Shadows
 * Pre-configured shadows for common components
 */
export const componentShadows = {
  /** Navigation bar shadow */
  navBar: '0 0.5px 0 0 rgba(0, 0, 0, 0.30)',

  /** Tab bar shadow */
  tabBar: '0 -0.5px 0 0 rgba(0, 0, 0, 0.30)',

  /** Card shadow */
  card: '0 2px 10px 0 rgba(0, 0, 0, 0.10)',

  /** Button shadow */
  button: '0 1px 3px 0 rgba(0, 0, 0, 0.10)',

  /** Alert shadow */
  alert: '0 8px 30px 0 rgba(0, 0, 0, 0.15)',

  /** Sheet shadow */
  sheet: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',

  /** Menu shadow */
  menu: '0 2px 10px 0 rgba(0, 0, 0, 0.12)',
} as const

/**
 * Helper function to create custom shadow
 */
export function createShadow(
  offsetY: number,
  blur: number,
  opacity: number = 0.1
): string {
  return `0 ${offsetY}px ${blur}px 0 rgba(0, 0, 0, ${opacity})`
}

/**
 * Type utilities
 */
export type ShadowKey = keyof typeof shadows
export type BlurKey = keyof typeof blur
export type BackdropFilterKey = keyof typeof backdropFilter
export type ComponentShadowKey = keyof typeof componentShadows
