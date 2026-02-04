import { describe, it, expect } from 'vitest'
import {
  generateColorVariables,
  generateTypographyVariables,
  generateSpacingVariables,
  generateCSSVariables,
  cssVariablesToString,
} from '../../src/utils/css-variables'

describe('CSS Variables Generator', () => {
  describe('generateColorVariables', () => {
    it('should generate color CSS variables', () => {
      const vars = generateColorVariables()

      expect(vars['--color-primary-500']).toBe('#0FB5AE')
      expect(vars['--color-secondary-500']).toBe('#F5D76E')
      expect(vars['--color-semantic-success-DEFAULT']).toBe('#10B981')
    })

    it('should flatten nested color objects', () => {
      const vars = generateColorVariables()

      expect(vars['--color-background-DEFAULT']).toBe('#000000')
      expect(vars['--color-background-card']).toBe('#0a0a0a')
    })
  })

  describe('generateTypographyVariables', () => {
    it('should generate typography CSS variables', () => {
      const vars = generateTypographyVariables()

      expect(vars['--font-fontFamily-sans']).toContain('Inter')
      expect(vars['--font-fontSize-base']).toBe('1rem')
      expect(vars['--font-fontWeight-bold']).toBe('700')
    })
  })

  describe('generateSpacingVariables', () => {
    it('should generate spacing CSS variables', () => {
      const vars = generateSpacingVariables()

      expect(vars['--spacing-4']).toBe('1rem')
      expect(vars['--spacing-8']).toBe('2rem')
      expect(vars['--container-xl']).toBe('1200px')
      expect(vars['--breakpoint-md']).toBe('768px')
    })
  })

  describe('generateCSSVariables', () => {
    it('should generate all CSS variables', () => {
      const vars = generateCSSVariables()

      // Should include colors
      expect(vars['--color-primary-500']).toBeDefined()

      // Should include typography
      expect(vars['--font-fontSize-base']).toBeDefined()

      // Should include spacing
      expect(vars['--spacing-4']).toBeDefined()

      // Should include shadows
      expect(vars['--shadow-boxShadow-button']).toBeDefined()

      // Should include borders
      expect(vars['--border-borderRadius-DEFAULT']).toBeDefined()

      // Should include transitions
      expect(vars['--transition-duration-slow']).toBeDefined()
    })

    it('should have unique keys', () => {
      const vars = generateCSSVariables()
      const keys = Object.keys(vars)
      const uniqueKeys = new Set(keys)

      expect(keys.length).toBe(uniqueKeys.size)
    })
  })

  describe('cssVariablesToString', () => {
    it('should convert variables to CSS string', () => {
      const vars = {
        '--color-primary': '#0FB5AE',
        '--font-size': '1rem',
      }

      const css = cssVariablesToString(vars)

      expect(css).toContain(':root {')
      expect(css).toContain('--color-primary: #0FB5AE;')
      expect(css).toContain('--font-size: 1rem;')
      expect(css).toContain('}')
    })

    it('should generate valid CSS', () => {
      const vars = generateCSSVariables()
      const css = cssVariablesToString(vars)

      // Should be valid CSS structure
      expect(css).toMatch(/^:root \{[\s\S]+\}$/)

      // Should have multiple variables
      expect(css.split('\n').length).toBeGreaterThan(10)
    })
  })
})
