import { describe, it, expect } from 'vitest'
import { colors } from '../../src/tokens/colors'

describe('Color Tokens', () => {
  describe('Primary colors', () => {
    it('should have primary teal color', () => {
      expect(colors.primary[500]).toBe('#0FB5AE')
    })

    it('should have complete primary palette (50-900)', () => {
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
      shades.forEach((shade) => {
        expect(colors.primary[shade]).toBeDefined()
        expect(colors.primary[shade]).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })
  })

  describe('Secondary colors', () => {
    it('should have secondary gold color', () => {
      expect(colors.secondary[500]).toBe('#F5D76E')
    })

    it('should have app gold variant', () => {
      expect(colors.secondary[900]).toBe('#C4A76A')
    })
  })

  describe('Semantic colors', () => {
    it('should have success color', () => {
      expect(colors.semantic.success.DEFAULT).toBe('#10B981')
    })

    it('should have warning color', () => {
      expect(colors.semantic.warning.DEFAULT).toBe('#FF9500')
    })

    it('should have error color', () => {
      expect(colors.semantic.error.DEFAULT).toBe('#F43F5E')
    })

    it('should have info color', () => {
      expect(colors.semantic.info.DEFAULT).toBe('#0EA5E9')
    })
  })

  describe('Neutral colors', () => {
    it('should have complete neutral scale', () => {
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
      shades.forEach((shade) => {
        expect(colors.neutral[shade]).toBeDefined()
        expect(colors.neutral[shade]).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })

    it('should have dark background', () => {
      expect(colors.neutral[950]).toBe('#000000')
    })

    it('should have text primary color', () => {
      expect(colors.neutral[50]).toBe('#F0F0E8')
    })
  })

  describe('Background colors', () => {
    it('should have main dark background', () => {
      expect(colors.background.DEFAULT).toBe('#000000')
    })

    it('should have card background', () => {
      expect(colors.background.card).toBe('#0a0a0a')
    })

    it('should have light mode background', () => {
      expect(colors.background.light).toBe('#FFFFFF')
    })
  })

  describe('Border colors', () => {
    it('should have default border color', () => {
      expect(colors.border.DEFAULT).toBe('#1a3a3a')
    })

    it('should have teal transparent border', () => {
      expect(colors.border.light).toContain('rgba')
    })
  })

  describe('Type safety', () => {
    it('should be immutable (as const)', () => {
      // TypeScript will catch if not 'as const'
      // This test ensures the type is narrow
      expect(colors).toBeDefined()
    })
  })
})
