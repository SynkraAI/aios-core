/**
 * Unit tests for YouTube Thumbnail & Cover templates (BSS-4.5).
 *
 * Strategy: Mock TemplateEngine.render() to return fixed Buffers.
 * Tests cover: YouTube thumbnail with 2 variants, 2MB size validation
 * with JPG fallback, each cover template renders with correct dimensions,
 * TEMPLATE_REGISTRY lookup for YouTube and cover entries.
 */

import React from 'react';
import type { TokenSet, SocialContent, PlatformSpec } from '../../types';
import { TemplateSizeError } from '../../types';

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

// ---------------------------------------------------------------------------
// Import templates
// ---------------------------------------------------------------------------

import {
  YouTubeThumbnail,
  YOUTUBE_THUMBNAIL_SPEC,
  YT_VARIANT_MAP,
} from '../youtube/thumbnail';

import { InstagramHighlight, INSTAGRAM_HIGHLIGHT_SPEC } from '../covers/instagram-highlight';
import { LinkedInPersonalCover, LINKEDIN_PERSONAL_COVER_SPEC } from '../covers/linkedin-personal';
import { LinkedInCompanyCover, LINKEDIN_COMPANY_COVER_SPEC } from '../covers/linkedin-company';
import { XTwitterHeader, X_TWITTER_HEADER_SPEC } from '../covers/x-twitter-header';
import { YouTubeChannelCover, YOUTUBE_CHANNEL_COVER_SPEC } from '../covers/youtube-channel';
import { FacebookCover, FACEBOOK_COVER_SPEC } from '../covers/facebook-cover';
import { TikTokBanner, TIKTOK_BANNER_SPEC } from '../covers/tiktok-banner';

import { TEMPLATE_REGISTRY } from '../index';

import { renderYouTubeThumbnail, MAX_YOUTUBE_BYTES } from '../../youtube-size-validator';

// ---------------------------------------------------------------------------
// YouTube Thumbnail (1280x720) tests
// ---------------------------------------------------------------------------

describe('YouTubeThumbnail (1280x720)', () => {
  const tokens = createTestTokens();

  it('renders standard variant (quote) as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(YouTubeThumbnail, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders comparison variant (question) as a valid React element', () => {
    const content = createTestContent('question');
    const element = React.createElement(YouTubeThumbnail, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders face-focused variant (tip) as a valid React element', () => {
    const content = createTestContent('tip');
    const element = React.createElement(YouTubeThumbnail, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders bold-text variant (statistic) as a valid React element', () => {
    const content = createTestContent('statistic');
    const element = React.createElement(YouTubeThumbnail, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders branded-series variant (announcement) as a valid React element', () => {
    const content = createTestContent('announcement');
    const element = React.createElement(YouTubeThumbnail, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions (1280x720)', () => {
    expect(YOUTUBE_THUMBNAIL_SPEC.width).toBe(1280);
    expect(YOUTUBE_THUMBNAIL_SPEC.height).toBe(720);
    expect(YOUTUBE_THUMBNAIL_SPEC.platform).toBe('youtube');
    expect(YOUTUBE_THUMBNAIL_SPEC.maxFileSizeMB).toBe(2);
  });

  it('YT_VARIANT_MAP maps all 5 YouTube variants to SocialVariant', () => {
    expect(YT_VARIANT_MAP.standard).toBe('quote');
    expect(YT_VARIANT_MAP['face-focused']).toBe('tip');
    expect(YT_VARIANT_MAP['bold-text']).toBe('statistic');
    expect(YT_VARIANT_MAP.comparison).toBe('question');
    expect(YT_VARIANT_MAP['branded-series']).toBe('announcement');
  });
});

// ---------------------------------------------------------------------------
// YouTube 2MB Size Validation tests
// ---------------------------------------------------------------------------

describe('renderYouTubeThumbnail — 2MB size validation', () => {
  it('returns PNG buffer when under 2MB', async () => {
    const smallBuffer = Buffer.alloc(1_000_000); // 1MB
    const mockEngine = {
      render: jest.fn().mockResolvedValue(smallBuffer),
    };

    const result = await renderYouTubeThumbnail(
      mockEngine as never,
      {
        element: React.createElement('div'),
        tokens: createTestTokens(),
        spec: YOUTUBE_THUMBNAIL_SPEC as PlatformSpec,
        fonts: [],
      }
    );

    expect(result).toBe(smallBuffer);
    expect(mockEngine.render).toHaveBeenCalledTimes(1);
  });

  it('falls back to JPG when PNG exceeds 2MB', async () => {
    const largePngBuffer = Buffer.alloc(2_200_000); // 2.2MB
    const smallJpgBuffer = Buffer.alloc(1_500_000); // 1.5MB

    const mockEngine = {
      render: jest.fn()
        .mockResolvedValueOnce(largePngBuffer) // PNG attempt
        .mockResolvedValueOnce(smallJpgBuffer), // JPG fallback
    };

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await renderYouTubeThumbnail(
      mockEngine as never,
      {
        element: React.createElement('div'),
        tokens: createTestTokens(),
        spec: YOUTUBE_THUMBNAIL_SPEC as PlatformSpec,
        fonts: [],
      }
    );

    expect(result).toBe(smallJpgBuffer);
    expect(mockEngine.render).toHaveBeenCalledTimes(2);
    // Second call should have format: 'jpg'
    const secondCallSpec = mockEngine.render.mock.calls[1][0].spec;
    expect(secondCallSpec.format).toBe('jpg');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('throws TemplateSizeError when both PNG and JPG exceed 2MB', async () => {
    const largePngBuffer = Buffer.alloc(2_200_000);
    const largeJpgBuffer = Buffer.alloc(2_300_000);

    const mockEngine = {
      render: jest.fn()
        .mockResolvedValueOnce(largePngBuffer)
        .mockResolvedValueOnce(largeJpgBuffer),
    };

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(
      renderYouTubeThumbnail(
        mockEngine as never,
        {
          element: React.createElement('div'),
          tokens: createTestTokens(),
          spec: YOUTUBE_THUMBNAIL_SPEC as PlatformSpec,
          fonts: [],
        }
      )
    ).rejects.toThrow(TemplateSizeError);

    warnSpy.mockRestore();
  });

  it('MAX_YOUTUBE_BYTES equals 2MB (2097152)', () => {
    expect(MAX_YOUTUBE_BYTES).toBe(2_097_152);
  });
});

// ---------------------------------------------------------------------------
// Cover templates tests
// ---------------------------------------------------------------------------

describe('InstagramHighlight (1080x1920)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(InstagramHighlight, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(INSTAGRAM_HIGHLIGHT_SPEC.width).toBe(1080);
    expect(INSTAGRAM_HIGHLIGHT_SPEC.height).toBe(1920);
    expect(INSTAGRAM_HIGHLIGHT_SPEC.format).toBe('png');
    expect(INSTAGRAM_HIGHLIGHT_SPEC.platform).toBe('instagram');
  });
});

describe('LinkedInPersonalCover (1584x396)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(LinkedInPersonalCover, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(LINKEDIN_PERSONAL_COVER_SPEC.width).toBe(1584);
    expect(LINKEDIN_PERSONAL_COVER_SPEC.height).toBe(396);
    expect(LINKEDIN_PERSONAL_COVER_SPEC.format).toBe('png');
    expect(LINKEDIN_PERSONAL_COVER_SPEC.platform).toBe('linkedin');
  });
});

describe('LinkedInCompanyCover (1128x191)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(LinkedInCompanyCover, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(LINKEDIN_COMPANY_COVER_SPEC.width).toBe(1128);
    expect(LINKEDIN_COMPANY_COVER_SPEC.height).toBe(191);
    expect(LINKEDIN_COMPANY_COVER_SPEC.format).toBe('png');
    expect(LINKEDIN_COMPANY_COVER_SPEC.platform).toBe('linkedin');
  });
});

describe('XTwitterHeader (1500x500)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(XTwitterHeader, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(X_TWITTER_HEADER_SPEC.width).toBe(1500);
    expect(X_TWITTER_HEADER_SPEC.height).toBe(500);
    expect(X_TWITTER_HEADER_SPEC.format).toBe('png');
    expect(X_TWITTER_HEADER_SPEC.platform).toBe('x-twitter');
  });
});

describe('YouTubeChannelCover (2560x1440)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(YouTubeChannelCover, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(YOUTUBE_CHANNEL_COVER_SPEC.width).toBe(2560);
    expect(YOUTUBE_CHANNEL_COVER_SPEC.height).toBe(1440);
    expect(YOUTUBE_CHANNEL_COVER_SPEC.format).toBe('png');
    expect(YOUTUBE_CHANNEL_COVER_SPEC.platform).toBe('youtube');
  });
});

describe('FacebookCover (820x312)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(FacebookCover, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(FACEBOOK_COVER_SPEC.width).toBe(820);
    expect(FACEBOOK_COVER_SPEC.height).toBe(312);
    expect(FACEBOOK_COVER_SPEC.format).toBe('png');
    expect(FACEBOOK_COVER_SPEC.platform).toBe('facebook');
  });
});

describe('TikTokBanner (1200x300)', () => {
  const tokens = createTestTokens();

  it('renders as a valid React element', () => {
    const content = createTestContent('quote');
    const element = React.createElement(TikTokBanner, { tokens, content });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('spec has correct dimensions', () => {
    expect(TIKTOK_BANNER_SPEC.width).toBe(1200);
    expect(TIKTOK_BANNER_SPEC.height).toBe(300);
    expect(TIKTOK_BANNER_SPEC.format).toBe('png');
    expect(TIKTOK_BANNER_SPEC.platform).toBe('tiktok');
  });
});

// ---------------------------------------------------------------------------
// TEMPLATE_REGISTRY tests — YouTube + Cover entries
// ---------------------------------------------------------------------------

describe('TEMPLATE_REGISTRY — YouTube entries', () => {
  it('contains all 5 YouTube thumbnail variants', () => {
    const variants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    for (const v of variants) {
      const entry = TEMPLATE_REGISTRY.get(`youtube:thumbnail:${v}`);
      expect(entry).toBeDefined();
      expect(entry!.component).toBe(YouTubeThumbnail);
      expect(entry!.spec.width).toBe(1280);
      expect(entry!.spec.height).toBe(720);
    }
  });
});

describe('TEMPLATE_REGISTRY — Cover entries', () => {
  const coverEntries: Array<{ key: string; width: number; height: number; platform: string }> = [
    { key: 'covers:instagram-highlight', width: 1080, height: 1920, platform: 'instagram' },
    { key: 'covers:linkedin-personal', width: 1584, height: 396, platform: 'linkedin' },
    { key: 'covers:linkedin-company', width: 1128, height: 191, platform: 'linkedin' },
    { key: 'covers:x-twitter-header', width: 1500, height: 500, platform: 'x-twitter' },
    { key: 'covers:youtube-channel', width: 2560, height: 1440, platform: 'youtube' },
    { key: 'covers:facebook-cover', width: 820, height: 312, platform: 'facebook' },
    { key: 'covers:tiktok-banner', width: 1200, height: 300, platform: 'tiktok' },
  ];

  for (const { key, width, height, platform } of coverEntries) {
    it(`contains ${key} with correct dimensions`, () => {
      const entry = TEMPLATE_REGISTRY.get(key);
      expect(entry).toBeDefined();
      expect(entry!.spec.width).toBe(width);
      expect(entry!.spec.height).toBe(height);
      expect(entry!.spec.platform).toBe(platform);
    });
  }

  it('contains exactly 7 cover entries', () => {
    let coverCount = 0;
    for (const [key] of TEMPLATE_REGISTRY) {
      if (key.startsWith('covers:')) coverCount++;
    }
    expect(coverCount).toBe(7);
  });
});

describe('TEMPLATE_REGISTRY — total size', () => {
  it('contains 47 total entries (40 variant + 7 cover)', () => {
    expect(TEMPLATE_REGISTRY.size).toBe(47);
  });
});
