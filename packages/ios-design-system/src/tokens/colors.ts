/**
 * iOS 16 Color System
 * Based on Apple Human Interface Guidelines
 * https://developer.apple.com/design/human-interface-guidelines/color
 */

export interface IOSColor {
  light: string
  dark: string
}

/**
 * iOS System Colors
 * Vibrant colors for UI elements like buttons, links, and indicators
 */
export const systemColors = {
  blue: {
    light: '#007AFF',
    dark: '#0A84FF',
  },
  brown: {
    light: '#A2845E',
    dark: '#AC8E68',
  },
  cyan: {
    light: '#32ADE6',
    dark: '#64D2FF',
  },
  green: {
    light: '#34C759',
    dark: '#30D158',
  },
  indigo: {
    light: '#5856D6',
    dark: '#5E5CE6',
  },
  mint: {
    light: '#00C7BE',
    dark: '#63E6E2',
  },
  orange: {
    light: '#FF9500',
    dark: '#FF9F0A',
  },
  pink: {
    light: '#FF2D55',
    dark: '#FF375F',
  },
  purple: {
    light: '#AF52DE',
    dark: '#BF5AF2',
  },
  red: {
    light: '#FF3B30',
    dark: '#FF453A',
  },
  teal: {
    light: '#30B0C7',
    dark: '#40CBE0',
  },
  yellow: {
    light: '#FFCC00',
    dark: '#FFD60A',
  },
} as const satisfies Record<string, IOSColor>

/**
 * iOS Gray Colors
 * Neutral colors for backgrounds and text
 */
export const grayColors = {
  gray: {
    light: '#8E8E93',
    dark: '#8E8E93',
  },
  gray2: {
    light: '#AEAEB2',
    dark: '#636366',
  },
  gray3: {
    light: '#C7C7CC',
    dark: '#48484A',
  },
  gray4: {
    light: '#D1D1D6',
    dark: '#3A3A3C',
  },
  gray5: {
    light: '#E5E5EA',
    dark: '#2C2C2E',
  },
  gray6: {
    light: '#F2F2F7',
    dark: '#1C1C1E',
  },
} as const satisfies Record<string, IOSColor>

/**
 * iOS Label Colors
 * Semantic colors for text and labels
 */
export const labelColors = {
  label: {
    light: 'rgba(0, 0, 0, 0.85)',
    dark: 'rgba(255, 255, 255, 0.85)',
  },
  secondaryLabel: {
    light: 'rgba(60, 60, 67, 0.60)',
    dark: 'rgba(235, 235, 245, 0.60)',
  },
  tertiaryLabel: {
    light: 'rgba(60, 60, 67, 0.30)',
    dark: 'rgba(235, 235, 245, 0.30)',
  },
  quaternaryLabel: {
    light: 'rgba(60, 60, 67, 0.18)',
    dark: 'rgba(235, 235, 245, 0.18)',
  },
  placeholderText: {
    light: 'rgba(60, 60, 67, 0.30)',
    dark: 'rgba(235, 235, 245, 0.30)',
  },
} as const satisfies Record<string, IOSColor>

/**
 * iOS Fill Colors
 * For overlays, backgrounds, and separators
 */
export const fillColors = {
  systemFill: {
    light: 'rgba(120, 120, 128, 0.20)',
    dark: 'rgba(120, 120, 128, 0.36)',
  },
  secondarySystemFill: {
    light: 'rgba(120, 120, 128, 0.16)',
    dark: 'rgba(120, 120, 128, 0.32)',
  },
  tertiarySystemFill: {
    light: 'rgba(118, 118, 128, 0.12)',
    dark: 'rgba(118, 118, 128, 0.24)',
  },
  quaternarySystemFill: {
    light: 'rgba(116, 116, 128, 0.08)',
    dark: 'rgba(118, 118, 128, 0.18)',
  },
} as const satisfies Record<string, IOSColor>

/**
 * iOS Background Colors
 * System-defined background colors for various contexts
 */
export const backgroundColors = {
  systemBackground: {
    light: '#FFFFFF',
    dark: '#000000',
  },
  secondarySystemBackground: {
    light: '#F2F2F7',
    dark: '#1C1C1E',
  },
  tertiarySystemBackground: {
    light: '#FFFFFF',
    dark: '#2C2C2E',
  },
  systemGroupedBackground: {
    light: '#F2F2F7',
    dark: '#000000',
  },
  secondarySystemGroupedBackground: {
    light: '#FFFFFF',
    dark: '#1C1C1E',
  },
  tertiarySystemGroupedBackground: {
    light: '#F2F2F7',
    dark: '#2C2C2E',
  },
} as const satisfies Record<string, IOSColor>

/**
 * iOS Separator Colors
 * For dividers and borders
 */
export const separatorColors = {
  separator: {
    light: 'rgba(60, 60, 67, 0.29)',
    dark: 'rgba(84, 84, 88, 0.60)',
  },
  opaqueSeparator: {
    light: '#C6C6C8',
    dark: '#38383A',
  },
} as const satisfies Record<string, IOSColor>

/**
 * All iOS colors combined
 */
export const colors = {
  system: systemColors,
  gray: grayColors,
  label: labelColors,
  fill: fillColors,
  background: backgroundColors,
  separator: separatorColors,
} as const

/**
 * Helper function to get color value based on color scheme
 */
export function getColorValue(color: IOSColor, scheme: 'light' | 'dark' = 'light'): string {
  return color[scheme]
}

/**
 * Type utilities
 */
export type SystemColorName = keyof typeof systemColors
export type GrayColorName = keyof typeof grayColors
export type LabelColorName = keyof typeof labelColors
export type FillColorName = keyof typeof fillColors
export type BackgroundColorName = keyof typeof backgroundColors
export type SeparatorColorName = keyof typeof separatorColors
