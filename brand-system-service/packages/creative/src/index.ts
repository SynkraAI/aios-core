/**
 * @bss/creative - Creative Pipeline
 *
 * Handles creative asset generation using Satori (JSX to SVG)
 * and Sharp (SVG to PNG/JPG) per ADR-005.
 *
 * Key responsibilities:
 * - Template rendering with Satori
 * - Image rasterization with Sharp
 * - Batch creative generation pipeline
 * - Per-platform dimension export (Instagram, Facebook, LinkedIn, etc.)
 */

// Template Engine — core rendering pipeline
export { TemplateEngine } from './template-engine';

// Creative Pipeline — high-level orchestrator
export { CreativePipeline, type CreativeOptions } from './creative-pipeline';

// Carousel Engine — multi-slide carousel orchestrator (Story BSS-4.4)
export { CarouselEngine } from './carousel-engine';

// Batch Pipeline — end-to-end batch generation orchestrator (Story BSS-4.6)
export { BatchPipeline, resetBatchSequence, type BatchPipelineDeps } from './batch-pipeline';

// Batch Job Manager — in-memory async job tracking (Story BSS-4.6)
export { submitJob, getJobStatus, resetJobStore, type JobStatus, type JobState } from './batch-job-manager';

// Content Calendar — 4-week content plan generator (Story BSS-4.7)
export { ContentCalendar, calendarToBatchBrief } from './content-calendar';

// Calendar Exporter — JSON/CSV export with optional R2 upload (Story BSS-4.7)
export { CalendarExporter, type CalendarExporterDeps } from './calendar-exporter';

// Content Themes — static theme map per industry x pillar (Story BSS-4.7)
export { CONTENT_THEMES } from './content-themes';

// Types
export {
  TemplateSizeError,
  CarouselValidationError,
  type PlatformSpec,
  type TokenSet,
  type TokenValue,
  type TokenGroup,
  type FontConfig,
  type RenderOptions,
  type SocialContent,
  type SocialVariant,
  type SocialTemplateProps,
  type SlideType,
  type SlideSpec,
  type CarouselBrief,
  type CarouselResult,
  type PostSpec,
  type BatchBrief,
  type BatchOptions,
  type BatchResult,
  type BatchReport,
  type PostFailure,
  type ContentPillar,
  type SocialPlatform,
  type IndustryVertical,
  type CalendarBrief,
  type ScheduledPost,
  type WeeklyPlan,
  tokenStr,
  tokenNum,
} from './types';

// Social Media Templates & Registry (Story BSS-4.2)
export {
  TEMPLATE_REGISTRY,
  type TemplateEntry,
  type TemplateRegistryKey,
  InstagramFeedSquare,
  INSTAGRAM_FEED_SQUARE_SPEC,
  InstagramFeedPortrait,
  INSTAGRAM_FEED_PORTRAIT_SPEC,
  InstagramStory,
  INSTAGRAM_STORY_SPEC,
  FacebookFeed,
  FACEBOOK_FEED_SPEC,
  LinkedInPost,
  LINKEDIN_POST_SPEC,
  XTwitterPost,
  X_TWITTER_POST_SPEC,
  PinterestPin,
  PINTEREST_PIN_SPEC,
  BrandBar,
  Headline,
  CtaBadge,
  // YouTube Thumbnail (BSS-4.5)
  YouTubeThumbnail,
  YOUTUBE_THUMBNAIL_SPEC,
  YT_VARIANT_MAP,
  // Cover templates (BSS-4.5)
  InstagramHighlight,
  INSTAGRAM_HIGHLIGHT_SPEC,
  LinkedInPersonalCover,
  LINKEDIN_PERSONAL_COVER_SPEC,
  LinkedInCompanyCover,
  LINKEDIN_COMPANY_COVER_SPEC,
  XTwitterHeader,
  X_TWITTER_HEADER_SPEC,
  YouTubeChannelCover,
  YOUTUBE_CHANNEL_COVER_SPEC,
  FacebookCover,
  FACEBOOK_COVER_SPEC,
  TikTokBanner,
  TIKTOK_BANNER_SPEC,
} from './templates/index';

// YouTube Size Validator (BSS-4.5)
export { renderYouTubeThumbnail, MAX_YOUTUBE_BYTES } from './youtube-size-validator';

// Brand Voice Generator (Story BSS-2.9)
export {
  buildBrandVoice,
  writeBrandVoice,
  generateVoicePillars,
  generateToneSpectrum,
  generateDoList,
  generateDontList,
  generateManifesto,
  generateValueProp,
  generateTaglines,
} from './brand-voice-generator';
