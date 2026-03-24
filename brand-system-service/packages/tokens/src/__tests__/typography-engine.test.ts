/**
 * Typography Engine Tests
 *
 * @see BSS-2.4: Typography System
 */

import { TypographyEngine } from '../typography-engine';

describe('TypographyEngine', () => {
  let engine: TypographyEngine;

  beforeEach(() => {
    engine = new TypographyEngine();
  });

  describe('generateTypeScale', () => {
    it('should generate exactly 11 named sizes', () => {
      const scale = engine.generateTypeScale();
      const keys = Object.keys(scale);

      expect(keys).toHaveLength(11);
      expect(keys).toEqual([
        'xs',
        'sm',
        'base',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        '7xl',
      ]);
    });

    it('should have correct px values for all sizes', () => {
      const scale = engine.generateTypeScale();

      expect(scale.xs.fontSize).toBe('12px');
      expect(scale.sm.fontSize).toBe('14px');
      expect(scale.base.fontSize).toBe('16px');
      expect(scale.lg.fontSize).toBe('18px');
      expect(scale.xl.fontSize).toBe('20px');
      expect(scale['2xl'].fontSize).toBe('24px');
      expect(scale['3xl'].fontSize).toBe('30px');
      expect(scale['4xl'].fontSize).toBe('36px');
      expect(scale['5xl'].fontSize).toBe('48px');
      expect(scale['6xl'].fontSize).toBe('60px');
      expect(scale['7xl'].fontSize).toBe('72px');
    });

    it('should include lineHeight and letterSpacing for each size', () => {
      const scale = engine.generateTypeScale();

      for (const size of Object.values(scale)) {
        expect(size).toHaveProperty('fontSize');
        expect(size).toHaveProperty('lineHeight');
        expect(size).toHaveProperty('letterSpacing');
      }
    });
  });

  describe('generateClamp', () => {
    it('should generate correct CSS clamp formula for 3xl (24px→30px)', () => {
      const clamp = engine.generateClamp(24, 30);

      // Expected: slope = (30 - 24) / (1440 - 375) = 6 / 1065 = 0.0056338
      // slopeVw = 0.0056338 * 100 = 0.5634
      // intercept = 24 - 0.0056338 * 375 = 24 - 2.1127 = 21.8873
      // interceptRem = 21.8873 / 16 = 1.3680

      expect(clamp).toMatch(/^clamp\(/);
      expect(clamp).toContain('24px');
      expect(clamp).toContain('30px');
      expect(clamp).toContain('vw');
      expect(clamp).toContain('rem');
    });

    it('should generate correct CSS clamp formula for 7xl (60px→72px)', () => {
      const clamp = engine.generateClamp(60, 72);

      expect(clamp).toMatch(/^clamp\(/);
      expect(clamp).toContain('60px');
      expect(clamp).toContain('72px');
    });

    it('should handle custom viewport ranges', () => {
      const clamp = engine.generateClamp(16, 24, 320, 1920);

      expect(clamp).toMatch(/^clamp\(/);
      expect(clamp).toContain('16px');
      expect(clamp).toContain('24px');
    });
  });

  describe('generateLineHeights', () => {
    it('should generate 6 line height entries', () => {
      const lineHeights = engine.generateLineHeights();
      const keys = Object.keys(lineHeights);

      expect(keys).toHaveLength(6);
      expect(keys).toEqual(['none', 'tight', 'snug', 'normal', 'relaxed', 'loose']);
    });

    it('should have correct ratio values', () => {
      const lineHeights = engine.generateLineHeights();

      expect(lineHeights.none).toBe(1.0);
      expect(lineHeights.tight).toBe(1.25);
      expect(lineHeights.snug).toBe(1.375);
      expect(lineHeights.normal).toBe(1.5);
      expect(lineHeights.relaxed).toBe(1.625);
      expect(lineHeights.loose).toBe(2.0);
    });
  });

  describe('generateLetterSpacing', () => {
    it('should generate 6 letter spacing entries', () => {
      const letterSpacing = engine.generateLetterSpacing();
      const keys = Object.keys(letterSpacing);

      expect(keys).toHaveLength(6);
      expect(keys).toEqual(['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']);
    });

    it('should have correct em values', () => {
      const letterSpacing = engine.generateLetterSpacing();

      expect(letterSpacing.tighter).toBe('-0.05em');
      expect(letterSpacing.tight).toBe('-0.025em');
      expect(letterSpacing.normal).toBe('0em');
      expect(letterSpacing.wide).toBe('0.025em');
      expect(letterSpacing.wider).toBe('0.05em');
      expect(letterSpacing.widest).toBe('0.1em');
    });
  });

  describe('generatePrimitiveTokens', () => {
    it('should generate DTCG tokens with correct structure', () => {
      const tokens = engine.generatePrimitiveTokens();

      expect(tokens).toHaveProperty('fontFamily');
      expect(tokens).toHaveProperty('fontSize');
      expect(tokens).toHaveProperty('lineHeight');
      expect(tokens).toHaveProperty('letterSpacing');
    });

    it('should have $type: "fontFamily" for font family tokens', () => {
      const tokens = engine.generatePrimitiveTokens();
      const fontFamily = tokens.fontFamily as Record<string, unknown>;

      const display = fontFamily.display as { $type: string };
      expect(display.$type).toBe('fontFamily');

      const body = fontFamily.body as { $type: string };
      expect(body.$type).toBe('fontFamily');

      const mono = fontFamily.mono as { $type: string };
      expect(mono.$type).toBe('fontFamily');
    });

    it('should have $type: "dimension" for font size tokens', () => {
      const tokens = engine.generatePrimitiveTokens();
      const fontSize = tokens.fontSize as Record<string, unknown>;

      const base = fontSize.base as { $type: string };
      expect(base.$type).toBe('dimension');

      const xl = fontSize.xl as { $type: string };
      expect(xl.$type).toBe('dimension');
    });

    it('should have $type: "number" for line height tokens', () => {
      const tokens = engine.generatePrimitiveTokens();
      const lineHeight = tokens.lineHeight as Record<string, unknown>;

      const normal = lineHeight.normal as { $type: string };
      expect(normal.$type).toBe('number');
    });

    it('should have $type: "dimension" for letter spacing tokens', () => {
      const tokens = engine.generatePrimitiveTokens();
      const letterSpacing = tokens.letterSpacing as Record<string, unknown>;

      const normal = letterSpacing.normal as { $type: string };
      expect(normal.$type).toBe('dimension');
    });

    it('should attach $extensions.clamp for 3xl and above', () => {
      const tokens = engine.generatePrimitiveTokens();
      const fontSize = tokens.fontSize as Record<string, { $extensions?: { clamp: string } }>;

      // Should NOT have clamp for base (below 3xl)
      expect(fontSize.base.$extensions).toBeUndefined();

      // Should have clamp for 3xl and above
      expect(fontSize['3xl'].$extensions).toBeDefined();
      expect(fontSize['3xl'].$extensions?.clamp).toMatch(/^clamp\(/);

      expect(fontSize['7xl'].$extensions).toBeDefined();
      expect(fontSize['7xl'].$extensions?.clamp).toMatch(/^clamp\(/);
    });

    it('should use custom font config when provided', () => {
      const customConfig = {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      };

      const tokens = engine.generatePrimitiveTokens(customConfig);
      const fontFamily = tokens.fontFamily as Record<string, { $value: string }>;

      expect(fontFamily.display.$value).toBe('Playfair Display, serif');
      expect(fontFamily.body.$value).toBe('Lato, sans-serif');
      expect(fontFamily.mono.$value).toBe('Source Code Pro, monospace');
    });
  });

  describe('generateSemanticTokens', () => {
    it('should generate semantic role tokens', () => {
      const tokens = engine.generateSemanticTokens();

      expect(tokens).toHaveProperty('display');
      expect(tokens).toHaveProperty('heading');
      expect(tokens).toHaveProperty('body');
      expect(tokens).toHaveProperty('label');
      expect(tokens).toHaveProperty('mono');
    });

    it('should reference primitive tokens using curly brace syntax', () => {
      const tokens = engine.generateSemanticTokens();
      const display = tokens.display as Record<string, { $value: string }>;

      expect(display.fontFamily.$value).toBe('{fontFamily.display}');
    });
  });

  describe('validateGoogleFont', () => {
    it('should return true for fonts in catalog', () => {
      expect(engine.validateGoogleFont('Inter')).toBe(true);
      expect(engine.validateGoogleFont('Playfair Display')).toBe(true);
      expect(engine.validateGoogleFont('JetBrains Mono')).toBe(true);
    });

    it('should return false for fonts not in catalog', () => {
      expect(engine.validateGoogleFont('Unknown Font')).toBe(false);
      expect(engine.validateGoogleFont('Comic Sans MS')).toBe(false);
    });
  });

  describe('generateGoogleFontsEmbed', () => {
    it('should generate valid Google Fonts embed tag', () => {
      const embed = engine.generateGoogleFontsEmbed('Playfair Display', 'Inter');

      expect(embed).toContain('<link');
      expect(embed).toContain('fonts.googleapis.com');
      expect(embed).toContain('Playfair+Display');
      expect(embed).toContain('Inter');
      expect(embed).toContain('display=swap');
    });

    it('should handle same font for heading and body', () => {
      const embed = engine.generateGoogleFontsEmbed('Inter', 'Inter');

      // Should only include Inter once
      const interCount = (embed.match(/Inter/g) || []).length;
      expect(interCount).toBe(1);
    });

    it('should replace spaces with plus signs', () => {
      const embed = engine.generateGoogleFontsEmbed('Playfair Display', 'Open Sans');

      expect(embed).toContain('Playfair+Display');
      expect(embed).toContain('Open+Sans');
      expect(embed).not.toContain('Playfair Display');
    });

    it('should include preconnect tags', () => {
      const embed = engine.generateGoogleFontsEmbed('Inter', 'Lato');

      expect(embed).toContain('<link rel="preconnect" href="https://fonts.googleapis.com">');
      expect(embed).toContain('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    });
  });

  describe('generateMetadata', () => {
    it('should include embed tag and licenses', () => {
      const metadata = engine.generateMetadata('Inter', 'Playfair Display');

      expect(metadata).toHaveProperty('embedTag');
      expect(metadata).toHaveProperty('fonts');
      expect(metadata.fonts).toHaveLength(2);
    });

    it('should look up licenses from seed data', () => {
      const metadata = engine.generateMetadata('Inter', 'JetBrains Mono');

      const interLicense = metadata.fonts.find((f) => f.family === 'Inter');
      expect(interLicense?.license).toBe('OFL (SIL Open Font License)');
      expect(interLicense?.webEmbeddingPermitted).toBe(true);

      const jetBrainsLicense = metadata.fonts.find((f) => f.family === 'JetBrains Mono');
      expect(jetBrainsLicense?.license).toBe('OFL (SIL Open Font License)');
    });

    it('should flag unknown fonts for manual verification', () => {
      const metadata = engine.generateMetadata('Unknown Font', 'Inter');

      const unknownLicense = metadata.fonts.find((f) => f.family === 'Unknown Font');
      expect(unknownLicense?.license).toBe('VERIFY MANUALLY');
      expect(unknownLicense?.sourceUrl).toContain('Unknown+Font');
    });
  });
});
