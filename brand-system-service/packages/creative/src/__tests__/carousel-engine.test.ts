/**
 * Unit tests for CarouselEngine (multi-slide carousel orchestrator).
 *
 * Strategy: Mock TemplateEngine.render() to return a fixed Buffer.
 * Tests cover: 2-slide minimum, 10-slide maximum, validation errors,
 * slide order, correct PlatformSpec, and template rendering.
 */

import React from 'react';
import type { TokenSet, SocialContent, CarouselBrief, SlideSpec } from '../types';
import { CarouselValidationError } from '../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockRender = jest.fn<Promise<Buffer>, [unknown]>();

jest.mock('../template-engine', () => ({
  TemplateEngine: jest.fn().mockImplementation(() => ({
    render: mockRender,
  })),
}));

jest.mock('@bss/core', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// Import after mocks
import { CarouselEngine } from '../carousel-engine';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createTestTokens(): TokenSet {
  return {
    color: {
      primary: { $value: '#1a1a2e', $type: 'color' },
      secondary: { $value: '#e94560', $type: 'color' },
    },
    typography: {
      heading: {
        fontFamily: { $value: 'TestFont', $type: 'fontFamily' },
        fontSize: { $value: 32, $type: 'dimension' },
      },
    },
  };
}

function createTestContent(overrides: Partial<SocialContent> = {}): SocialContent {
  return {
    headline: 'Test Headline',
    body: 'Test body text',
    logoUrl: 'https://example.com/logo.png',
    variant: 'quote',
    ctaText: 'Learn More',
    ...overrides,
  };
}

function createMinimalBrief(slideSpecs?: readonly SlideSpec[]): CarouselBrief {
  const slides: readonly SlideSpec[] = slideSpecs ?? [
    { type: 'cover', content: createTestContent({ headline: 'Cover Headline' }) },
    { type: 'cta', content: createTestContent({ headline: 'CTA Headline', ctaText: 'Get Started' }) },
  ];

  return {
    clientId: 'test-client',
    tokens: createTestTokens(),
    slides,
    platform: 'instagram',
  };
}

function createMaxBrief(): CarouselBrief {
  const slides: SlideSpec[] = [
    { type: 'cover', content: createTestContent({ headline: 'Cover' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 1', body: 'Point 1\nPoint 2\nPoint 3' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 2', body: 'Point A\nPoint B' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 3', body: 'Item X\nItem Y' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 4', body: 'Note 1\nNote 2' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 5', body: 'Tip 1\nTip 2' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 6', body: 'Fact 1\nFact 2' }) },
    { type: 'content', content: createTestContent({ headline: 'Content 7', body: 'Info 1\nInfo 2' }) },
    { type: 'summary', content: createTestContent({ headline: 'Summary', body: 'Takeaway 1\nTakeaway 2' }) },
    { type: 'cta', content: createTestContent({ headline: 'CTA', ctaText: 'Get Started' }) },
  ];

  return {
    clientId: 'test-client-max',
    tokens: createTestTokens(),
    slides,
    platform: 'linkedin',
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CarouselEngine', () => {
  let engine: CarouselEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new CarouselEngine();
    // Default: render returns a 512-byte buffer per slide
    mockRender.mockResolvedValue(Buffer.alloc(512, 0));
  });

  // -------------------------------------------------------------------------
  // AC 10: 2-slide minimum (cover + cta)
  // -------------------------------------------------------------------------

  describe('2-slide minimum (cover + cta)', () => {
    it('generates a valid carousel with 2 slides', async () => {
      const brief = createMinimalBrief();
      const result = await engine.generate(brief);

      expect(result.slideCount).toBe(2);
      expect(result.buffers).toHaveLength(2);
      expect(result.platform).toBe('instagram');
      expect(result.dimensions).toEqual({ width: 1080, height: 1350 });
      expect(mockRender).toHaveBeenCalledTimes(2);
    });
  });

  // -------------------------------------------------------------------------
  // AC 10: 10-slide maximum
  // -------------------------------------------------------------------------

  describe('10-slide maximum', () => {
    it('generates a valid carousel with 10 slides', async () => {
      const brief = createMaxBrief();
      const result = await engine.generate(brief);

      expect(result.slideCount).toBe(10);
      expect(result.buffers).toHaveLength(10);
      expect(result.platform).toBe('linkedin');
      expect(mockRender).toHaveBeenCalledTimes(10);
    });
  });

  // -------------------------------------------------------------------------
  // AC 10: CarouselValidationError thrown for 0 slides
  // -------------------------------------------------------------------------

  describe('validation — 0 slides', () => {
    it('throws CarouselValidationError for 0 slides', async () => {
      const brief = createMinimalBrief([]);

      await expect(engine.generate(brief)).rejects.toThrow(CarouselValidationError);
      await expect(engine.generate(brief)).rejects.toThrow(/Carousel requires 2-10 slides, got 0/);
    });

    it('includes slideCount in the error', async () => {
      const brief = createMinimalBrief([]);

      try {
        await engine.generate(brief);
        fail('Expected CarouselValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(CarouselValidationError);
        expect((error as CarouselValidationError).slideCount).toBe(0);
        expect((error as CarouselValidationError).code).toBe('CAROUSEL_VALIDATION_ERROR');
      }
    });
  });

  // -------------------------------------------------------------------------
  // AC 10: CarouselValidationError thrown for 11 slides
  // -------------------------------------------------------------------------

  describe('validation — 11 slides', () => {
    it('throws CarouselValidationError for 11 slides', async () => {
      const slides: SlideSpec[] = Array.from({ length: 11 }, (_, i) => ({
        type: i === 0 ? 'cover' as const : i === 10 ? 'cta' as const : 'content' as const,
        content: createTestContent({ headline: `Slide ${i + 1}` }),
      }));

      const brief: CarouselBrief = {
        clientId: 'test-client',
        tokens: createTestTokens(),
        slides,
        platform: 'instagram',
      };

      await expect(engine.generate(brief)).rejects.toThrow(CarouselValidationError);
      await expect(engine.generate(brief)).rejects.toThrow(/got 11/);
    });
  });

  // -------------------------------------------------------------------------
  // AC 10: Validation for 1 slide (below minimum)
  // -------------------------------------------------------------------------

  describe('validation — 1 slide', () => {
    it('throws CarouselValidationError for 1 slide', async () => {
      const brief = createMinimalBrief([
        { type: 'cover', content: createTestContent() },
      ]);

      await expect(engine.generate(brief)).rejects.toThrow(CarouselValidationError);
      await expect(engine.generate(brief)).rejects.toThrow(/got 1/);
    });
  });

  // -------------------------------------------------------------------------
  // AC 10: Slide order — cover first, cta last
  // -------------------------------------------------------------------------

  describe('slide order', () => {
    it('renders slides in the order provided (cover first, cta last)', async () => {
      const slides: SlideSpec[] = [
        { type: 'cover', content: createTestContent({ headline: 'Cover' }) },
        { type: 'content', content: createTestContent({ headline: 'Content' }) },
        { type: 'summary', content: createTestContent({ headline: 'Summary' }) },
        { type: 'cta', content: createTestContent({ headline: 'CTA' }) },
      ];

      // Return different buffers per call to track ordering
      mockRender
        .mockResolvedValueOnce(Buffer.from('cover'))
        .mockResolvedValueOnce(Buffer.from('content'))
        .mockResolvedValueOnce(Buffer.from('summary'))
        .mockResolvedValueOnce(Buffer.from('cta'));

      const brief = createMinimalBrief(slides);
      const result = await engine.generate(brief);

      expect(result.buffers[0].toString()).toBe('cover');
      expect(result.buffers[1].toString()).toBe('content');
      expect(result.buffers[2].toString()).toBe('summary');
      expect(result.buffers[3].toString()).toBe('cta');
    });
  });

  // -------------------------------------------------------------------------
  // AC 10: Correct PlatformSpec (1080x1350) passed for each slide
  // -------------------------------------------------------------------------

  describe('PlatformSpec', () => {
    it('passes 1080x1350 PNG spec for Instagram', async () => {
      const brief = createMinimalBrief();
      await engine.generate(brief);

      expect(mockRender).toHaveBeenCalledTimes(2);
      for (let i = 0; i < 2; i++) {
        const renderOptions = mockRender.mock.calls[i][0] as Record<string, unknown>;
        expect(renderOptions).toMatchObject({
          spec: {
            platform: 'instagram',
            width: 1080,
            height: 1350,
            format: 'png',
          },
        });
      }
    });

    it('passes 1080x1350 PNG spec for LinkedIn', async () => {
      const brief: CarouselBrief = {
        ...createMinimalBrief(),
        platform: 'linkedin',
      };

      await engine.generate(brief);

      const renderOptions = mockRender.mock.calls[0][0] as Record<string, unknown>;
      expect(renderOptions).toMatchObject({
        spec: {
          platform: 'linkedin',
          width: 1080,
          height: 1350,
          format: 'png',
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Slide templates render as valid React elements
  // -------------------------------------------------------------------------

  describe('slide template rendering', () => {
    it('passes React elements to TemplateEngine.render()', async () => {
      const brief = createMinimalBrief();
      await engine.generate(brief);

      expect(mockRender).toHaveBeenCalledTimes(2);
      for (let i = 0; i < 2; i++) {
        const renderOptions = mockRender.mock.calls[i][0] as Record<string, unknown>;
        expect(renderOptions).toHaveProperty('element');
        expect(React.isValidElement(renderOptions.element)).toBe(true);
      }
    });

    it('passes tokens and clientId to each render call', async () => {
      const brief = createMinimalBrief();
      await engine.generate(brief);

      for (let i = 0; i < 2; i++) {
        const renderOptions = mockRender.mock.calls[i][0] as Record<string, unknown>;
        expect(renderOptions).toHaveProperty('tokens', brief.tokens);
        expect(renderOptions).toHaveProperty('clientId', 'test-client');
      }
    });
  });

  // -------------------------------------------------------------------------
  // CarouselValidationError structure
  // -------------------------------------------------------------------------

  describe('CarouselValidationError', () => {
    it('contains correct structure', () => {
      const error = new CarouselValidationError(15);
      expect(error.name).toBe('CarouselValidationError');
      expect(error.code).toBe('CAROUSEL_VALIDATION_ERROR');
      expect(error.slideCount).toBe(15);
      expect(error.message).toContain('2-10 slides');
      expect(error.message).toContain('15');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
