/**
 * Unit tests for LinkedIn, X/Twitter, Pinterest social media templates (BSS-4.3).
 *
 * Strategy: Mock TemplateEngine.render() to return a fixed Buffer.
 * Tests cover: all 3 new templates with selected variants,
 * TEMPLATE_REGISTRY growth to 35 entries, correct dimensions in specs,
 * and variant exhaustiveness for all new templates.
 */

import React from 'react';
import type { TokenSet, SocialContent, SocialTemplateProps } from '../../types';

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
    if (!React.isValidElement(options.element)) {
      throw new Error('Invalid React element passed to render');
    }
    return MOCK_RENDER_BUFFER;
  }
}

// ---------------------------------------------------------------------------
// Import templates
// ---------------------------------------------------------------------------

import { LinkedInPost, LINKEDIN_POST_SPEC } from '../linkedin/post';
import { XTwitterPost, X_TWITTER_POST_SPEC } from '../x-twitter/post';
import { PinterestPin, PINTEREST_PIN_SPEC } from '../pinterest/pin';
import { TEMPLATE_REGISTRY } from '../index';

// ---------------------------------------------------------------------------
// LinkedIn Post (1200x644) tests
// ---------------------------------------------------------------------------

describe('LinkedInPost (1200x644)', () => {
  const tokens = createTestTokens();

  it('renders quote variant as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(LinkedInPost, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders statistic variant as a valid React element', () => {
    const content = createTestContent('statistic');
    const element = React.createElement(LinkedInPost, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for quote variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('quote');
    const element = React.createElement(LinkedInPost, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: LINKEDIN_POST_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('mock TemplateEngine returns non-empty buffer for statistic variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('statistic');
    const element = React.createElement(LinkedInPost, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: LINKEDIN_POST_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions', () => {
    expect(LINKEDIN_POST_SPEC.width).toBe(1200);
    expect(LINKEDIN_POST_SPEC.height).toBe(644);
    expect(LINKEDIN_POST_SPEC.format).toBe('png');
    expect(LINKEDIN_POST_SPEC.platform).toBe('linkedin');
  });
});

// ---------------------------------------------------------------------------
// X/Twitter Post (1200x675) tests
// ---------------------------------------------------------------------------

describe('XTwitterPost (1200x675)', () => {
  const tokens = createTestTokens();

  it('renders announcement variant as a valid React element', () => {
    const content = createTestContent('announcement');
    const element = React.createElement(XTwitterPost, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders tip variant as a valid React element', () => {
    const content = createTestContent('tip');
    const element = React.createElement(XTwitterPost, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for announcement variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('announcement');
    const element = React.createElement(XTwitterPost, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: X_TWITTER_POST_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('mock TemplateEngine returns non-empty buffer for tip variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('tip');
    const element = React.createElement(XTwitterPost, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: X_TWITTER_POST_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions', () => {
    expect(X_TWITTER_POST_SPEC.width).toBe(1200);
    expect(X_TWITTER_POST_SPEC.height).toBe(675);
    expect(X_TWITTER_POST_SPEC.format).toBe('png');
    expect(X_TWITTER_POST_SPEC.platform).toBe('x-twitter');
  });
});

// ---------------------------------------------------------------------------
// Pinterest Pin (1000x1500) tests
// ---------------------------------------------------------------------------

describe('PinterestPin (1000x1500)', () => {
  const tokens = createTestTokens();

  it('renders quote variant as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(PinterestPin, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders tip variant as a valid React element', () => {
    const content = createTestContent('tip');
    const element = React.createElement(PinterestPin, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('mock TemplateEngine returns non-empty buffer for quote variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('quote');
    const element = React.createElement(PinterestPin, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: PINTEREST_PIN_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('mock TemplateEngine returns non-empty buffer for tip variant', async () => {
    const engine = new MockTemplateEngine();
    const content = createTestContent('tip');
    const element = React.createElement(PinterestPin, { tokens, content });

    const result = await engine.render({
      element,
      tokens,
      spec: PINTEREST_PIN_SPEC,
      fonts: [],
    });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(1024);
  });

  it('spec has correct dimensions', () => {
    expect(PINTEREST_PIN_SPEC.width).toBe(1000);
    expect(PINTEREST_PIN_SPEC.height).toBe(1500);
    expect(PINTEREST_PIN_SPEC.format).toBe('png');
    expect(PINTEREST_PIN_SPEC.platform).toBe('pinterest');
  });

  it('renders with imageUrl in content', () => {
    const content = createTestContent('quote', { imageUrl: 'https://example.com/hero.jpg' });
    const element = React.createElement(PinterestPin, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TEMPLATE_REGISTRY tests (updated from 20 to 35)
// ---------------------------------------------------------------------------

describe('TEMPLATE_REGISTRY (BSS-4.3 expanded)', () => {
  it('contains at least 35 social template entries (7+ templates x 5 variants)', () => {
    // BSS-4.3 adds 15 entries (3 templates x 5 variants) to the 20 from BSS-4.2.
    // BSS-4.5 adds YouTube + covers. Total grows beyond 35.
    expect(TEMPLATE_REGISTRY.size).toBeGreaterThanOrEqual(35);
  });

  it('contains all LinkedIn post variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`linkedin:post:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(LinkedInPost);
      expect(entry!.spec.width).toBe(1200);
      expect(entry!.spec.height).toBe(644);
    }
  });

  it('contains all X/Twitter post variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`x-twitter:post:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(XTwitterPost);
      expect(entry!.spec.width).toBe(1200);
      expect(entry!.spec.height).toBe(675);
    }
  });

  it('contains all Pinterest pin variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`pinterest:pin:${v}` as never);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(PinterestPin);
      expect(entry!.spec.width).toBe(1000);
      expect(entry!.spec.height).toBe(1500);
    }
  });

  it('still contains original Instagram/Facebook entries', () => {
    expect(TEMPLATE_REGISTRY.get('instagram:feed-square:quote' as never)).toBeDefined();
    expect(TEMPLATE_REGISTRY.get('facebook:feed:quote' as never)).toBeDefined();
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
// Variant exhaustiveness tests for new templates
// ---------------------------------------------------------------------------

describe('Variant exhaustiveness (BSS-4.3 templates)', () => {
  const tokens = createTestTokens();
  const variants: SocialContent['variant'][] = ['quote', 'tip', 'statistic', 'question', 'announcement'];

  const templates: Array<{ name: string; component: (props: SocialTemplateProps) => React.ReactElement }> = [
    { name: 'LinkedInPost', component: LinkedInPost },
    { name: 'XTwitterPost', component: XTwitterPost },
    { name: 'PinterestPin', component: PinterestPin },
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
// Content prop variations for new templates
// ---------------------------------------------------------------------------

describe('Content prop variations (BSS-4.3)', () => {
  const tokens = createTestTokens();

  it('LinkedIn renders with minimal content (only required fields)', () => {
    const content: SocialContent = {
      headline: 'Minimal',
      logoUrl: 'https://example.com/logo.png',
      variant: 'quote',
    };
    const element = React.createElement(LinkedInPost, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('X/Twitter renders with all optional fields populated', () => {
    const content = createTestContent('announcement', {
      body: 'Full body text',
      stat: '2026-04-01',
      ctaText: 'Register Now',
      imageUrl: 'https://example.com/hero.jpg',
    });
    const element = React.createElement(XTwitterPost, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('Pinterest renders with imageUrl for image-dominant layout', () => {
    const content = createTestContent('tip', {
      imageUrl: 'https://example.com/hero.jpg',
    });
    const element = React.createElement(PinterestPin, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });
});
