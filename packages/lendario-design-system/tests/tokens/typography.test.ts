import { describe, it, expect } from 'vitest'
import { typography, typographyPresets } from '../../src/tokens/typography'

describe('Typography Tokens', () => {
  describe('Font families', () => {
    it('should have Inter as primary font', () => {
      expect(typography.fontFamily.sans).toContain('Inter')
    })

    it('should have system font fallbacks', () => {
      expect(typography.fontFamily.sans).toContain('-apple-system')
      expect(typography.fontFamily.sans).toContain('sans-serif')
    })
  })

  describe('Font sizes', () => {
    it('should have base font size', () => {
      expect(typography.fontSize.base).toBe('1rem')
    })

    it('should have complete size scale', () => {
      const sizes = ['tiny', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']
      sizes.forEach((size) => {
        expect(typography.fontSize[size]).toBeDefined()
      })
    })

    it('should have tiny size for eyebrows', () => {
      expect(typography.fontSize.tiny).toBe('0.625rem')
    })
  })

  describe('Font weights', () => {
    it('should have normal weight', () => {
      expect(typography.fontWeight.normal).toBe(400)
    })

    it('should have bold weight', () => {
      expect(typography.fontWeight.bold).toBe(700)
    })

    it('should have black weight for display text', () => {
      expect(typography.fontWeight.black).toBe(900)
    })

    it('should have all cohort weights', () => {
      expect(typography.fontWeight.light).toBe(300)
      expect(typography.fontWeight.normal).toBe(400)
      expect(typography.fontWeight.bold).toBe(700)
      expect(typography.fontWeight.black).toBe(900)
    })
  })

  describe('Line heights', () => {
    it('should have tight line height for headings', () => {
      expect(typography.lineHeight.tight).toBe(1.1)
    })

    it('should have relaxed line height for body', () => {
      expect(typography.lineHeight.relaxed).toBe(1.6)
    })
  })

  describe('Typography presets', () => {
    it('should have h1 preset with clamp', () => {
      expect(typographyPresets.h1.fontSize).toContain('clamp')
      expect(typographyPresets.h1.fontWeight).toBe(typography.fontWeight.bold)
      expect(typographyPresets.h1.lineHeight).toBe(typography.lineHeight.tight)
    })

    it('should have h2 preset with clamp', () => {
      expect(typographyPresets.h2.fontSize).toContain('clamp')
    })

    it('should have body preset', () => {
      expect(typographyPresets.body.fontSize).toBe(typography.fontSize.base)
      expect(typographyPresets.body.fontWeight).toBe(typography.fontWeight.normal)
      expect(typographyPresets.body.lineHeight).toBe(typography.lineHeight.relaxed)
    })

    it('should have button preset', () => {
      expect(typographyPresets.button.fontSize).toBe(typography.fontSize.base)
      expect(typographyPresets.button.fontWeight).toBe(typography.fontWeight.bold)
    })

    it('should have display preset for stats', () => {
      expect(typographyPresets.display.fontWeight).toBe(typography.fontWeight.black)
    })
  })
})
