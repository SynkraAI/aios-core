/**
 * Lendário AI Design System - CSS Variable Generator
 *
 * Converts design tokens to CSS custom properties
 */

import { colors } from '../tokens/colors'
import { typography } from '../tokens/typography'
import { spacing, container, breakpoints } from '../tokens/spacing'
import { shadows } from '../tokens/shadows'
import { borders } from '../tokens/borders'
import { transitions } from '../tokens/transitions'

type CSSVariables = Record<string, string>

/**
 * Flatten nested objects into CSS variable format
 * e.g., { primary: { 500: '#000' } } => { '--color-primary-500': '#000' }
 */
function flattenObject(
  obj: Record<string, any>,
  prefix: string = '',
  separator: string = '-'
): CSSVariables {
  const result: CSSVariables = {}

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}${separator}${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey, separator))
    } else {
      result[`--${newKey}`] = String(value)
    }
  })

  return result
}

/**
 * Generate CSS variables for colors
 */
export function generateColorVariables(): CSSVariables {
  return flattenObject(colors, 'color')
}

/**
 * Generate CSS variables for typography
 */
export function generateTypographyVariables(): CSSVariables {
  return flattenObject(typography, 'font')
}

/**
 * Generate CSS variables for spacing
 */
export function generateSpacingVariables(): CSSVariables {
  return {
    ...flattenObject(spacing, 'spacing'),
    ...flattenObject(container, 'container'),
    ...flattenObject(breakpoints, 'breakpoint'),
  }
}

/**
 * Generate CSS variables for shadows
 */
export function generateShadowVariables(): CSSVariables {
  return flattenObject(shadows, 'shadow')
}

/**
 * Generate CSS variables for borders
 */
export function generateBorderVariables(): CSSVariables {
  return flattenObject(borders, 'border')
}

/**
 * Generate CSS variables for transitions
 */
export function generateTransitionVariables(): CSSVariables {
  return flattenObject(transitions, 'transition')
}

/**
 * Generate all CSS variables
 */
export function generateCSSVariables(): CSSVariables {
  return {
    ...generateColorVariables(),
    ...generateTypographyVariables(),
    ...generateSpacingVariables(),
    ...generateShadowVariables(),
    ...generateBorderVariables(),
    ...generateTransitionVariables(),
  }
}

/**
 * Convert CSS variables object to CSS string
 */
export function cssVariablesToString(variables: CSSVariables): string {
  const entries = Object.entries(variables).map(
    ([key, value]) => `  ${key}: ${value};`
  )
  return `:root {\n${entries.join('\n')}\n}`
}

/**
 * Apply CSS variables to document root
 */
export function applyCSSVariables(variables: CSSVariables = generateCSSVariables()): void {
  if (typeof document === 'undefined') {
    console.warn('applyCSSVariables: document is not defined (SSR environment)')
    return
  }

  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

/**
 * Get CSS variable value from computed style
 */
export function getCSSVariable(name: string): string {
  if (typeof document === 'undefined') {
    console.warn('getCSSVariable: document is not defined (SSR environment)')
    return ''
  }

  const varName = name.startsWith('--') ? name : `--${name}`
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}
