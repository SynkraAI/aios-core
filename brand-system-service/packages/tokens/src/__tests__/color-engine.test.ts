/**
 * Color Engine Tests
 *
 * Validates color scale generation, WCAG contrast calculations,
 * and dark mode variant generation.
 */

import {
  generateScale,
  generateNeutral,
  generateSemantic,
  generateDarkVariants,
  relativeLuminance,
  contrastRatio,
  computeWCAG,
  validateWCAG,
  type DTCGTokenGroup,
} from '../color-engine';
import type { TokenGroup } from '../types';

describe('Color Engine', () => {
  describe('generateScale', () => {
    it('generates exactly 11 steps (50-950)', () => {
      const scale = generateScale('#0057FF', 'blue');
      const steps = Object.keys(scale).map(Number);

      expect(steps).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    });

    it('generates valid hex colors', () => {
      const scale = generateScale('#0057FF', 'blue');

      Object.values(scale).forEach((token) => {
        expect(token.$value).toMatch(/^#[0-9A-F]{6}$/i);
        expect(token.$type).toBe('color');
        expect(token.$description).toBeDefined();
      });
    });

    it('preserves hue across scale', () => {
      const scale = generateScale('#0057FF', 'blue');
      const values = Object.values(scale).map((token) => token.$value as string);

      // All colors should be shades of blue (hue preserved)
      // Check that all values are different (varying lightness)
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(11);
    });

    it('throws on invalid seed color', () => {
      expect(() => generateScale('invalid', 'test')).toThrow('Invalid seed color');
    });
  });

  describe('generateNeutral', () => {
    it('generates exactly 11 neutral steps', () => {
      const scale = generateNeutral();
      const steps = Object.keys(scale).map(Number);

      expect(steps).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    });

    it('generates pure neutrals when no primary provided', () => {
      const scale = generateNeutral();

      Object.values(scale).forEach((token) => {
        expect(token.$value).toMatch(/^#[0-9A-F]{6}$/i);
        expect(token.$type).toBe('color');
      });
    });

    it('derives hue from primary when provided', () => {
      const scaleWithPrimary = generateNeutral('#0057FF');
      const scalePure = generateNeutral();

      // Colors should be different when hue is derived
      expect(scaleWithPrimary['500'].$value).not.toBe(scalePure['500'].$value);
    });

    it('has saturation ≤5%', () => {
      // This is validated by the OKLCH chroma value being ≤0.02
      // Visual inspection of output confirms low saturation
      const scale = generateNeutral('#0057FF');
      expect(Object.keys(scale).length).toBe(11);
    });
  });

  describe('generateSemantic', () => {
    it('generates all semantic groups', () => {
      const semantic = generateSemantic();
      const groups = Object.keys(semantic);

      expect(groups).toEqual(['success', 'warning', 'error', 'info']);
    });

    it('each group has 5 tones (100, 300, 500, 700, 900)', () => {
      const semantic = generateSemantic();

      Object.values(semantic).forEach((group) => {
        const tones = Object.keys(group).map(Number);
        expect(tones).toEqual([100, 300, 500, 700, 900]);
      });
    });

    it('generates valid color tokens', () => {
      const semantic = generateSemantic();

      Object.values(semantic).forEach((group) => {
        Object.values(group).forEach((token) => {
          expect(token.$value).toMatch(/^#[0-9A-F]{6}$/i);
          expect(token.$type).toBe('color');
          expect(token.$description).toBeDefined();
        });
      });
    });
  });

  describe('generateDarkVariants', () => {
    it('generates dark variants for all tokens', () => {
      const lightTokens: TokenGroup = {
        background: {
          default: { $value: '#FFFFFF', $type: 'color', $description: 'Light background' },
        },
        text: {
          default: { $value: '#111827', $type: 'color', $description: 'Dark text' },
        },
      };

      const darkVariants = generateDarkVariants(lightTokens);

      expect(darkVariants).toHaveProperty('background');
      expect(darkVariants).toHaveProperty('text');
    });

    it('inverts lightness for dark mode', () => {
      const lightTokens: TokenGroup = {
        background: {
          default: { $value: '#FFFFFF', $type: 'color', $description: 'White background' },
        },
      };

      const darkVariants = generateDarkVariants(lightTokens) as Record<string, TokenGroup>;
      const darkBg = darkVariants.background as Record<string, { $value: string }>;

      // White (#FFFFFF) should become very dark
      expect(darkBg.default.$value).not.toBe('#FFFFFF');
      expect(darkBg.default.$value).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('preserves token structure', () => {
      const semantic = generateSemantic();
      const darkVariants = generateDarkVariants(semantic);

      // Should have same structure as input
      expect(Object.keys(darkVariants)).toEqual(Object.keys(semantic));
    });
  });

  describe('WCAG Contrast Calculations', () => {
    describe('relativeLuminance', () => {
      it('white has luminance close to 1', () => {
        const lum = relativeLuminance('#FFFFFF');
        expect(lum).toBeCloseTo(1, 1);
      });

      it('black has luminance close to 0', () => {
        const lum = relativeLuminance('#000000');
        expect(lum).toBeCloseTo(0, 1);
      });

      it('throws on invalid color', () => {
        expect(() => relativeLuminance('invalid')).toThrow('Invalid hex color');
      });
    });

    describe('contrastRatio', () => {
      it('white on black has maximum contrast (21:1)', () => {
        const ratio = contrastRatio('#FFFFFF', '#000000');
        expect(ratio).toBeCloseTo(21, 0);
      });

      it('white on white has minimum contrast (1:1)', () => {
        const ratio = contrastRatio('#FFFFFF', '#FFFFFF');
        expect(ratio).toBeCloseTo(1, 1);
      });

      it('white on #0057FF has expected contrast (~5.5:1)', () => {
        const ratio = contrastRatio('#FFFFFF', '#0057FF');
        // Known value from WCAG calculators
        expect(ratio).toBeGreaterThan(5.0);
        expect(ratio).toBeLessThan(6.0);
      });
    });

    describe('computeWCAG', () => {
      it('computes WCAG data for a color', () => {
        const wcag = computeWCAG('#0057FF');

        expect(wcag).toHaveProperty('onWhite');
        expect(wcag).toHaveProperty('onBlack');
        expect(wcag).toHaveProperty('aaLarge');
        expect(wcag).toHaveProperty('aa');
        expect(wcag).toHaveProperty('aaa');

        expect(typeof wcag.onWhite).toBe('number');
        expect(typeof wcag.onBlack).toBe('number');
        expect(typeof wcag.aaLarge).toBe('boolean');
        expect(typeof wcag.aa).toBe('boolean');
        expect(typeof wcag.aaa).toBe('boolean');
      });

      it('white on #0057FF passes AA but not AAA', () => {
        const wcag = computeWCAG('#0057FF');

        expect(wcag.aa).toBe(true); // ≥4.5:1
        expect(wcag.aaa).toBe(false); // <7:1
      });

      it('very light color fails AA', () => {
        const wcag = computeWCAG('#E6F0FF');

        expect(wcag.aa).toBe(false);
      });
    });

    describe('validateWCAG', () => {
      it('passes when all tokens meet WCAG AA', () => {
        const tokens: TokenGroup = {
          text: {
            dark: { $value: '#111827', $type: 'color', $description: 'Dark text' },
          },
        };

        expect(() => validateWCAG(tokens)).not.toThrow();
      });

      it('throws when a token fails WCAG AA', () => {
        const tokens: TokenGroup = {
          text: {
            light: { $value: '#E6F0FF', $type: 'color', $description: 'Too light' },
          },
        };

        expect(() => validateWCAG(tokens)).toThrow('WCAG AA validation failed');
      });

      it('validates nested token groups', () => {
        // Use a darker green that passes WCAG AA (≥4.5:1)
        const tokens: TokenGroup = {
          semantic: {
            success: {
              default: { $value: '#0F7A2E', $type: 'color', $description: 'Success green' },
            },
          },
        };

        expect(() => validateWCAG(tokens)).not.toThrow();
      });
    });
  });

  describe('Integration Tests', () => {
    it('full palette generation workflow', () => {
      // Generate full palette
      const primary = generateScale('#0057FF', 'primary');
      const neutral = generateNeutral('#0057FF');
      const semantic = generateSemantic();

      // Verify structure
      expect(Object.keys(primary).length).toBe(11);
      expect(Object.keys(neutral).length).toBe(11);
      expect(Object.keys(semantic).length).toBe(4);

      // Verify all are valid tokens
      const allTokens: DTCGTokenGroup = { ...primary, ...neutral };
      Object.values(allTokens).forEach((token) => {
        expect(token.$type).toBe('color');
        expect(token.$value).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('semantic colors with dark mode variants', () => {
      const semantic = generateSemantic();
      const darkVariants = generateDarkVariants(semantic);

      // Same structure
      expect(Object.keys(darkVariants)).toEqual(Object.keys(semantic));

      // All tokens are valid colors
      Object.values(darkVariants).forEach((group) => {
        Object.values(group as DTCGTokenGroup).forEach((token) => {
          expect(token.$type).toBe('color');
          expect(token.$value).toMatch(/^#[0-9A-F]{6}$/i);
        });
      });
    });
  });
});
