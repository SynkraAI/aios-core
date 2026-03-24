/**
 * TEMPLATE_REGISTRY — Central registry for all social media template components.
 *
 * Keyed by 'platform:format:variant' (e.g., 'instagram:feed-square:quote').
 * 7 social templates x 5 variants = 35 entries (BSS-4.2 + BSS-4.3)
 * 1 YouTube thumbnail x 5 variants = 5 entries (BSS-4.5)
 * 7 cover templates (no variants) = 7 entries (BSS-4.5)
 * Total: 47 entries.
 *
 * Consumed by BSS-4.6 (batch pipeline) to look up the correct template
 * component for a given platform/format/variant combination.
 */

import type { SocialTemplateProps, SocialVariant, PlatformSpec } from '../types';
import { InstagramFeedSquare, INSTAGRAM_FEED_SQUARE_SPEC } from './instagram/feed-square';
import { InstagramFeedPortrait, INSTAGRAM_FEED_PORTRAIT_SPEC } from './instagram/feed-portrait';
import { InstagramStory, INSTAGRAM_STORY_SPEC } from './instagram/story';
import { FacebookFeed, FACEBOOK_FEED_SPEC } from './facebook/feed';
import { LinkedInPost, LINKEDIN_POST_SPEC } from './linkedin/post';
import { XTwitterPost, X_TWITTER_POST_SPEC } from './x-twitter/post';
import { PinterestPin, PINTEREST_PIN_SPEC } from './pinterest/pin';

// YouTube Thumbnail (BSS-4.5)
import { YouTubeThumbnail, YOUTUBE_THUMBNAIL_SPEC } from './youtube/thumbnail';

// Cover templates (BSS-4.5)
import { InstagramHighlight, INSTAGRAM_HIGHLIGHT_SPEC } from './covers/instagram-highlight';
import { LinkedInPersonalCover, LINKEDIN_PERSONAL_COVER_SPEC } from './covers/linkedin-personal';
import { LinkedInCompanyCover, LINKEDIN_COMPANY_COVER_SPEC } from './covers/linkedin-company';
import { XTwitterHeader, X_TWITTER_HEADER_SPEC } from './covers/x-twitter-header';
import { YouTubeChannelCover, YOUTUBE_CHANNEL_COVER_SPEC } from './covers/youtube-channel';
import { FacebookCover, FACEBOOK_COVER_SPEC } from './covers/facebook-cover';
import { TikTokBanner, TIKTOK_BANNER_SPEC } from './covers/tiktok-banner';

// Re-export template components for direct use
export { InstagramFeedSquare, INSTAGRAM_FEED_SQUARE_SPEC } from './instagram/feed-square';
export { InstagramFeedPortrait, INSTAGRAM_FEED_PORTRAIT_SPEC } from './instagram/feed-portrait';
export { InstagramStory, INSTAGRAM_STORY_SPEC } from './instagram/story';
export { FacebookFeed, FACEBOOK_FEED_SPEC } from './facebook/feed';
export { LinkedInPost, LINKEDIN_POST_SPEC } from './linkedin/post';
export { XTwitterPost, X_TWITTER_POST_SPEC } from './x-twitter/post';
export { PinterestPin, PINTEREST_PIN_SPEC } from './pinterest/pin';

// Re-export YouTube Thumbnail (BSS-4.5)
export { YouTubeThumbnail, YOUTUBE_THUMBNAIL_SPEC, YT_VARIANT_MAP } from './youtube/thumbnail';

// Re-export Cover templates (BSS-4.5)
export { InstagramHighlight, INSTAGRAM_HIGHLIGHT_SPEC } from './covers/instagram-highlight';
export { LinkedInPersonalCover, LINKEDIN_PERSONAL_COVER_SPEC } from './covers/linkedin-personal';
export { LinkedInCompanyCover, LINKEDIN_COMPANY_COVER_SPEC } from './covers/linkedin-company';
export { XTwitterHeader, X_TWITTER_HEADER_SPEC } from './covers/x-twitter-header';
export { YouTubeChannelCover, YOUTUBE_CHANNEL_COVER_SPEC } from './covers/youtube-channel';
export { FacebookCover, FACEBOOK_COVER_SPEC } from './covers/facebook-cover';
export { TikTokBanner, TIKTOK_BANNER_SPEC } from './covers/tiktok-banner';

// Re-export shared components
export { BrandBar } from './shared/brand-bar';
export { Headline } from './shared/headline';
export { CtaBadge } from './shared/cta-badge';

/**
 * A registered template entry: the component function + its platform spec.
 */
export interface TemplateEntry {
  readonly component: (props: SocialTemplateProps) => React.ReactElement;
  readonly spec: PlatformSpec;
}

/** Registry key format: 'platform:format:variant' or 'covers:platform-name' */
export type TemplateRegistryKey = `${string}:${string}:${SocialVariant}` | `covers:${string}`;

/**
 * Core MVP variants implemented in this story.
 */
const MVP_VARIANTS: readonly SocialVariant[] = [
  'quote',
  'tip',
  'statistic',
  'question',
  'announcement',
] as const;

/**
 * Template definitions: component + spec for each template format.
 */
const TEMPLATE_DEFINITIONS = [
  { platform: 'instagram', format: 'feed-square', component: InstagramFeedSquare, spec: INSTAGRAM_FEED_SQUARE_SPEC },
  { platform: 'instagram', format: 'feed-portrait', component: InstagramFeedPortrait, spec: INSTAGRAM_FEED_PORTRAIT_SPEC },
  { platform: 'instagram', format: 'story', component: InstagramStory, spec: INSTAGRAM_STORY_SPEC },
  { platform: 'facebook', format: 'feed', component: FacebookFeed, spec: FACEBOOK_FEED_SPEC },
  { platform: 'linkedin', format: 'post', component: LinkedInPost, spec: LINKEDIN_POST_SPEC },
  { platform: 'x-twitter', format: 'post', component: XTwitterPost, spec: X_TWITTER_POST_SPEC },
  { platform: 'pinterest', format: 'pin', component: PinterestPin, spec: PINTEREST_PIN_SPEC },
  // YouTube Thumbnail — 5 variants via SocialVariant mapping (BSS-4.5)
  { platform: 'youtube', format: 'thumbnail', component: YouTubeThumbnail, spec: YOUTUBE_THUMBNAIL_SPEC },
] as const;

/**
 * Cover template definitions — single composition each, no variant dimension (BSS-4.5).
 */
const COVER_TEMPLATES = [
  { key: 'covers:instagram-highlight', component: InstagramHighlight, spec: INSTAGRAM_HIGHLIGHT_SPEC },
  { key: 'covers:linkedin-personal', component: LinkedInPersonalCover, spec: LINKEDIN_PERSONAL_COVER_SPEC },
  { key: 'covers:linkedin-company', component: LinkedInCompanyCover, spec: LINKEDIN_COMPANY_COVER_SPEC },
  { key: 'covers:x-twitter-header', component: XTwitterHeader, spec: X_TWITTER_HEADER_SPEC },
  { key: 'covers:youtube-channel', component: YouTubeChannelCover, spec: YOUTUBE_CHANNEL_COVER_SPEC },
  { key: 'covers:facebook-cover', component: FacebookCover, spec: FACEBOOK_COVER_SPEC },
  { key: 'covers:tiktok-banner', component: TikTokBanner, spec: TIKTOK_BANNER_SPEC },
] as const;

/**
 * Build the registry map from definitions x variants.
 */
function buildRegistry(): ReadonlyMap<string, TemplateEntry> {
  const entries = new Map<string, TemplateEntry>();

  // Social + YouTube templates: platform:format:variant (8 templates x 5 variants = 40)
  for (const def of TEMPLATE_DEFINITIONS) {
    for (const variant of MVP_VARIANTS) {
      const key = `${def.platform}:${def.format}:${variant}`;
      entries.set(key, {
        component: def.component,
        spec: { ...def.spec },
      });
    }
  }

  // Cover templates — single composition, no variant dimension (7 entries)
  for (const cover of COVER_TEMPLATES) {
    entries.set(cover.key, {
      component: cover.component,
      spec: { ...cover.spec },
    });
  }

  return entries;
}

/**
 * TEMPLATE_REGISTRY — 47-entry map:
 *   40 variant entries (8 templates x 5 variants)
 *   + 7 cover entries (single composition each)
 *
 * Usage:
 *   const entry = TEMPLATE_REGISTRY.get('instagram:feed-square:quote');
 *   const cover = TEMPLATE_REGISTRY.get('covers:facebook-cover');
 *   if (entry) {
 *     const element = entry.component({ tokens, content });
 *     const buffer = await engine.render({ element, tokens, spec: entry.spec, fonts });
 *   }
 */
export const TEMPLATE_REGISTRY: ReadonlyMap<string, TemplateEntry> = buildRegistry();
