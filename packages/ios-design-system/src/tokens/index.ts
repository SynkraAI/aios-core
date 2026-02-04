/**
 * iOS 16 Design System - Design Tokens
 * Complete design token library based on Apple Human Interface Guidelines
 */

// Export all token modules
export * from './colors'
export * from './typography'
export * from './spacing'
export * from './shadows'
export * from './radius'

// Re-export for convenience
export { colors, systemColors, grayColors, labelColors, backgroundColors } from './colors'
export { textStyles, fontFamily, fontWeight, fontSize } from './typography'
export { spacing, margins, padding, safeAreaInsets, componentSpacing } from './spacing'
export { shadows, blur, backdropFilter, componentShadows } from './shadows'
export { radius, componentRadius, getContinuousRadius } from './radius'

// Token metadata
export const tokenVersion = '0.1.0'
export const tokenSource = 'Apple Human Interface Guidelines - iOS 16'
export const lastUpdated = '2026-02-04'
