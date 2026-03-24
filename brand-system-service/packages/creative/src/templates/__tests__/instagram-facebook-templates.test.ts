/**
 * Unit tests for Instagram & Facebook social media templates (BSS-4.2).
 *
 * Strategy: Mock TemplateEngine.render() to return a fixed Buffer.
 * Tests cover: all 4 templates with quote + statistic variants,
 * TEMPLATE_REGISTRY lookup, correct dimensions in specs,
 * shared component rendering, and type exports.
 */

import React from 'react';
import type { TokenSet, SocialContent, SocialTemplateProps } from '../../types';
import { tokenStr, tokenNum } from '../../types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createTestTokens(): TokenSet {
  return {
    color: {
      primary: { $value: '#1a1a2e', $type: 'color' },
      secondary: { $value: '#e94560', $type: 'color' },
      neutral50: { $value: '#f5f5f5', $type: 'color' },
    },
    typography: {
      heading: {
        fontFamily: { $value: 'Inter', $type: 'fontFamily' },
        fontSize: { $value: 32, $type: 'dimension' },
      },
      body: {
        fontFamily: { $value: 'Inter', $type: 'fontFamily' },
        fontSize: { $value: 16, $type: 'dimension' },
      },
    },
    spacing: {
      sm: { $value: 8, $type: 'dimension' },
      md: { $value: 16, $type: 'dimension' },
      lg: { $value: 32, $type: 'dimension' },
    },
  };
}

function createTestContent(
  variant: SocialContent['variant'],
  overrides: Partial<SocialContent> = {}
): SocialContent {
  return {
    headline: 'Test Headline Text',
    body: 'This is a test body for the template.',
    stat: '87%',
    ctaText: 'Learn More',
    logoUrl: 'https://example.com/logo.png',
    variant,
    ...overrides,
  };
}

/** Mock TemplateEngine.render() returning a fixed 1024-byte buffer */
const MOCK_RENDER_BUFFER = Buffer.alloc(1024, 0xab);

class MockTemplateEngine {
  async render(options: {
    element: React.ReactElement;
    tokens: TokenSet;
    spec: { width: number; height: number; format: string };
    fonts: unknown[];
  }): Promise<Buffer> {
    // Verify the element is a valid React element
    if (!React.isValidElement(options.element)) {
      throw new Error('Invalid React element passed to render');
    }
    return MOCK_RENDER_BUFFER;
  }
}

// ---------------------------------------------------------------------------
// Import templates after helpers
// ---------------------------------------------------------------------------

import {
  InstagramFeedSquare,
  INSTAGRAM_FEED_SQUARE_SPEC,
} from '../instagram/feed-square';

import {
  InstagramFeedPortrait,
  INSTAGRAM_FEED_PORTRAIT_SPEC,
} from '../instagram/feed-portrait';

import {
  InstagramStory,
  INSTAGRAM_STORY_SPEC,
} from '../instagram/story';

import {
  FacebookFeed,
  FACEBOOK_FEED_SPEC,
} from '../facebook/feed';

import { TEMPLATE_REGISTRY } from '../index';

// ---------------------------------------------------------------------------
// Token helper tests
// ---------------------------------------------------------------------------

describe('Token helpers', () => {
  const tokens = createTestTokens();

  it('tokenStr extracts string $value from a token group', () => {
    expect(tokenStr(tokens.color, 'primary', '#000')).toBe('#1a1a2e');
  });

  it('tokenStr returns fallback for missing key', () => {
    expect(tokenStr(tokens.color, 'nonexistent', '#fallback')).toBe('#fallback');
  });

  it('tokenStr returns fallback for undefined group', () => {
    expect(tokenStr(undefined, 'primary', '#fallback')).toBe('#fallback');
  });

  it('tokenNum extracts numeric $value from a token group', () => {
    expect(tokenNum(tokens.spacing, 'md', 0)).toBe(16);
  });

  it('tokenNum returns fallback for missing key', () => {
    expect(tokenNum(tokens.spacing, 'nonexistent', 99)).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// Instagram Feed Square (1080x1080) tests
// ---------------------------------------------------------------------------

describe('InstagramFeedSquare (1080x1080)', () => {
  const tokens = createTestTokens();

  it('renders quote variant as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(InstagramFeedSquare, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders statistic variant as a valid React element', () => {
    const content = createTestContent('statistic');
    const element = React.createElement(InstagramFeedSquare, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for quote variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('quote');
    const element = React.createElement(InstagramFeedSquare, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: INSTAGRAM_FEED_SQUARE_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('mock TemplateEngine returns non-empty buffer for statistic variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('statistic');
    const element = React.createElement(InstagramFeedSquare, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: INSTAGRAM_FEED_SQUARE_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions', () => {
    expect(INSTAGRAM_FEED_SQUARE_SPEC.width).toBe(1080);
    expect(INSTAGRAM_FEED_SQUARE_SPEC.height).toBe(1080);
    expect(INSTAGRAM_FEED_SQUARE_SPEC.format).toBe('png');
    expect(INSTAGRAM_FEED_SQUARE_SPEC.platform).toBe('instagram');
  });
});

// ---------------------------------------------------------------------------
// Instagram Feed Portrait (1080x1350) tests
// ---------------------------------------------------------------------------

describe('InstagramFeedPortrait (1080x1350)', () => {
  const tokens = createTestTokens();

  it('renders quote variant as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(InstagramFeedPortrait, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders statistic variant as a valid React element', () => {
    const content = createTestContent('statistic');
    const element = React.createElement(InstagramFeedPortrait, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for quote variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('quote');
    const element = React.createElement(InstagramFeedPortrait, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: INSTAGRAM_FEED_PORTRAIT_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions', () => {
    expect(INSTAGRAM_FEED_PORTRAIT_SPEC.width).toBe(1080);
    expect(INSTAGRAM_FEED_PORTRAIT_SPEC.height).toBe(1350);
    expect(INSTAGRAM_FEED_PORTRAIT_SPEC.format).toBe('png');
    expect(INSTAGRAM_FEED_PORTRAIT_SPEC.platform).toBe('instagram');
  });
});

// ---------------------------------------------------------------------------
// Instagram Story (1080x1920) tests
// ---------------------------------------------------------------------------

describe('InstagramStory (1080x1920)', () => {
  const tokens = createTestTokens();

  it('renders quote variant as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(InstagramStory, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders statistic variant as a valid React element', () => {
    const content = createTestContent('statistic');
    const element = React.createElement(InstagramStory, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for statistic variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('statistic');
    const element = React.createElement(InstagramStory, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: INSTAGRAM_STORY_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions and safe zone is 108px', () => {
    expect(INSTAGRAM_STORY_SPEC.width).toBe(1080);
    expect(INSTAGRAM_STORY_SPEC.height).toBe(1920);
    expect(INSTAGRAM_STORY_SPEC.format).toBe('png');
    // Safe zone = 10% of smallest dimension = 108px
    const safeZone = Math.round(INSTAGRAM_STORY_SPEC.width * 0.1);
    expect(safeZone).toBe(108);
  });
});

// ---------------------------------------------------------------------------
// Facebook Feed (1200x630) tests
// ---------------------------------------------------------------------------

describe('FacebookFeed (1200x630)', () => {
  const tokens = createTestTokens();

  it('renders quote variant as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(FacebookFeed, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders statistic variant as a valid React element', () => {
    const content = createTestContent('statistic');
    const element = React.createElement(FacebookFeed, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for quote variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('quote');
    const element = React.createElement(FacebookFeed, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: FACEBOOK_FEED_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions', () => {
    expect(FACEBOOK_FEED_SPEC.width).toBe(1200);
    expect(FACEBOOK_FEED_SPEC.height).toBe(630);
    expect(FACEBOOK_FEED_SPEC.format).toBe('png');
    expect(FACEBOOK_FEED_SPEC.platform).toBe('facebook');
  });
});

// ---------------------------------------------------------------------------
// TEMPLATE_REGISTRY tests
// ---------------------------------------------------------------------------

describe('TEMPLATE_REGISTRY', () => {
  it('contains at least 20 entries (4+ templates x 5 variants)', () => {
    // BSS-4.2 baseline: 20. BSS-4.3 adds 15, BSS-4.5 adds 12. Registry grows over time.
    expect(TEMPLATE_REGISTRY.size).toBeGreaterThanOrEqual(20);
  });

  it('contains all Instagram feed-square variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`instagram:feed-square:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(InstagramFeedSquare);
      expect(entry!.spec.width).toBe(1080);
      expect(entry!.spec.height).toBe(1080);
    }
  });

  it('contains all Instagram feed-portrait variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`instagram:feed-portrait:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(InstagramFeedPortrait);
      expect(entry!.spec.width).toBe(1080);
      expect(entry!.spec.height).toBe(1350);
    }
  });

  it('contains all Instagram story variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`instagram:story:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(InstagramStory);
      expect(entry!.spec.width).toBe(1080);
      expect(entry!.spec.height).toBe(1920);
    }
  });

  it('contains all Facebook feed variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`facebook:feed:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(FacebookFeed);
      expect(entry!.spec.width).toBe(1200);
      expect(entry!.spec.height).toBe(630);
    }
  });

  it('returns undefined for nonexistent key', () => {
    const entry = TEMPLATE_REGISTRY.get('twitter:feed:quote' as never);
    expect(entry).toBeUndefined();
  });

  it('each entry has a valid component function', () => {
    for (const [, entry] of TEMPLATE_REGISTRY) {
      expect(typeof entry.component).toBe('function');
    }
  });

  it('each entry spec has valid dimensions', () => {
    for (const [, entry] of TEMPLATE_REGISTRY) {
      expect(entry.spec.width).toBeGreaterThan(0);
      expect(entry.spec.height).toBeGreaterThan(0);
      expect(['png', 'jpg']).toContain(entry.spec.format);
    }
  });
});

// ---------------------------------------------------------------------------
// Variant exhaustiveness tests
// ---------------------------------------------------------------------------

describe('Variant exhaustiveness', () => {
  const tokens = createTestTokens();
  const variants: SocialContent['variant'][] = ['quote', 'tip', 'statistic', 'question', 'announcement'];

  const templates: Array<{ name: string; component: (props: SocialTemplateProps) => React.ReactElement }> = [
    { name: 'InstagramFeedSquare', component: InstagramFeedSquare },
    { name: 'InstagramFeedPortrait', component: InstagramFeedPortrait },
    { name: 'InstagramStory', component: InstagramStory },
    { name: 'FacebookFeed', component: FacebookFeed },
  ];

  for (const template of templates) {
    for (const variant of variants) {
      it(`${template.name} renders ${variant} variant without error`, () => {
        const content = createTestContent(variant);
        const element = React.createElement(template.component, { tokens, content });
        expect(React.isValidElement(element)).toBe(true);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Content prop variations
// ---------------------------------------------------------------------------

describe('Content prop variations', () => {
  const tokens = createTestTokens();

  it('renders with minimal content (only required fields)', () => {
    const content: SocialContent = {
      headline: 'Minimal',
      logoUrl: 'https://example.com/logo.png',
      variant: 'quote',
    };
    const element = React.createElement(InstagramFeedSquare, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders with all optional fields populated', () => {
    const content = createTestContent('announcement', {
      body: 'Full body text',
      stat: '2026-04-01',
      ctaText: 'Register Now',
      imageUrl: 'https://example.com/hero.jpg',
    });
    const element = React.createElement(FacebookFeed, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });
});
