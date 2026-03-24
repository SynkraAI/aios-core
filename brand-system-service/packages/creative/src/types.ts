/**
 * Types for the Creative Pipeline template engine.
 *
 * Covers platform specifications, W3C DTCG token sets,
 * render options, and error types for size limit violations.
 */

import type { ReactElement } from 'react';

// ---------------------------------------------------------------------------
// PlatformSpec
// ---------------------------------------------------------------------------

/**
 * Defines target platform dimensions and output format for creative rendering.
 *
 * Reference platform specs (FR-2.1-2.5):
 *   Instagram Feed Square:  1080x1080  PNG
 *   Instagram Feed 4:5:     1080x1350  PNG
 *   Instagram Story:        1080x1920  PNG
 *   Facebook Feed:          1200x630   PNG/JPG
 *   LinkedIn:               1200x644   PNG
 *   X/Twitter:              1200x675   PNG/JPG
 *   Pinterest:              1000x1500  PNG
 *   YouTube Thumbnail:      1280x720   JPG (max 2MB)
 */
export interface PlatformSpec {
  /** Target platform identifier (e.g., 'instagram', 'youtube', 'facebook') */
  readonly platform: string;
  /** Output width in pixels */
  readonly width: number;
  /** Output height in pixels */
  readonly height: number;
  /** Output image format */
  readonly format: 'png' | 'jpg';
  /** Maximum allowed file size in megabytes. Throws TemplateSizeError when exceeded. */
  readonly maxFileSizeMB?: number;
}

// ---------------------------------------------------------------------------
// TokenSet — W3C DTCG aligned
// ---------------------------------------------------------------------------

/** A single W3C DTCG token value (resolved to its concrete value). */
export interface TokenValue {
  readonly $value: string | number;
  readonly $type?: string;
  readonly $description?: string;
}

/**
 * A token group is a nested mapping of W3C DTCG tokens.
 * Supports arbitrary nesting: `tokens.color.primary.$value`.
 */
export interface TokenGroup {
  readonly [key: string]: TokenValue | TokenGroup;
}

/**
 * TokenSet maps W3C DTCG token keys (colors, typography, spacing)
 * so templates can reference `tokens.color.primary` and receive
 * the correct value injected at render time.
 */
export interface TokenSet {
  readonly color?: TokenGroup;
  readonly typography?: TokenGroup;
  readonly spacing?: TokenGroup;
  readonly [category: string]: TokenGroup | undefined;
}

// ---------------------------------------------------------------------------
// Font configuration for Satori
// ---------------------------------------------------------------------------

/**
 * Font configuration for Satori rendering.
 * Satori requires font data as ArrayBuffer (not CSS font-face URLs).
 */
export interface FontConfig {
  /** Font family name as referenced in JSX styles */
  readonly name: string;
  /** Raw font data. Satori requires ArrayBuffer, not file paths or URLs. */
  readonly data: ArrayBuffer;
  /** Font weight (default: 400) */
  readonly weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** Font style (default: 'normal') */
  readonly style?: 'normal' | 'italic';
}

// ---------------------------------------------------------------------------
// RenderOptions
// ---------------------------------------------------------------------------

/**
 * Options accepted by TemplateEngine.render().
 */
export interface RenderOptions {
  /** The React JSX element to render (function component output) */
  readonly element: ReactElement;
  /** W3C DTCG token set to inject into the template */
  readonly tokens: TokenSet;
  /** Target platform specification (dimensions, format, size limit) */
  readonly spec: PlatformSpec;
  /** Fonts loaded as ArrayBuffer for Satori */
  readonly fonts: readonly FontConfig[];
  /** Client identifier for logging attribution */
  readonly clientId?: string;
}

// ---------------------------------------------------------------------------
// SocialContent — Instagram & Facebook template types (BSS-4.2)
// ---------------------------------------------------------------------------

/**
 * Layout variant for social media templates.
 * MVP core: quote, tip, statistic, question, announcement.
 * Stretch: before-after, testimonial, behind-the-scenes.
 */
export type SocialVariant =
  | 'quote'
  | 'tip'
  | 'statistic'
  | 'question'
  | 'announcement'
  | 'before-after'
  | 'testimonial'
  | 'behind-the-scenes';

/**
 * Content payload for social media templates.
 * Passed alongside TokenSet to template components for rendering.
 */
export interface SocialContent {
  /** Primary headline text displayed prominently */
  readonly headline: string;
  /** Optional body/description text */
  readonly body?: string;
  /** Optional statistic value (e.g., "87%", "3x", "10k+") */
  readonly stat?: string;
  /** Optional call-to-action text for the CTA badge */
  readonly ctaText?: string;
  /** Optional background or hero image URL */
  readonly imageUrl?: string;
  /** Brand logo URL (pre-generated PNG from R2, not AI-generated — CON-15) */
  readonly logoUrl: string;
  /** Layout variant determining the visual composition */
  readonly variant: SocialVariant;
}

/**
 * Props interface for all social media template components.
 * CONSTRAINT: All templates use flexbox only (no CSS Grid — ADR-005).
 */
export interface SocialTemplateProps {
  readonly tokens: TokenSet;
  readonly content: SocialContent;
}

// ---------------------------------------------------------------------------
// Token helper utilities (BSS-4.2)
// ---------------------------------------------------------------------------

/**
 * Safely extract a string $value from a W3C DTCG token path.
 * Returns fallback if token is missing or not a TokenValue.
 */
export function tokenStr(
  group: TokenGroup | undefined,
  key: string,
  fallback: string
): string {
  if (!group) return fallback;
  const token = group[key];
  if (token && '$value' in token) return String(token.$value);
  return fallback;
}

/**
 * Safely extract a numeric $value from a W3C DTCG token path.
 * Returns fallback if token is missing or not a TokenValue.
 */
export function tokenNum(
  group: TokenGroup | undefined,
  key: string,
  fallback: number
): number {
  if (!group) return fallback;
  const token = group[key];
  if (token && '$value' in token) return Number(token.$value);
  return fallback;
}

// ---------------------------------------------------------------------------
// Carousel types (BSS-4.4)
// ---------------------------------------------------------------------------

/** Slide type for carousel templates. */
export type SlideType = 'cover' | 'content' | 'summary' | 'cta';

/** Specification for a single carousel slide. */
export interface SlideSpec {
  readonly type: SlideType;
  readonly content: SocialContent;
}

/** Input brief for carousel generation. */
export interface CarouselBrief {
  readonly clientId: string;
  readonly tokens: TokenSet;
  readonly slides: readonly SlideSpec[];
  readonly platform: 'instagram' | 'linkedin';
}

/** Output result from carousel generation. */
export interface CarouselResult {
  readonly buffers: readonly Buffer[];
  readonly slideCount: number;
  readonly platform: string;
  readonly dimensions: { width: number; height: number };
}

/**
 * Thrown when carousel slide count is outside the valid 2-10 range.
 */
export class CarouselValidationError extends Error {
  public readonly code = 'CAROUSEL_VALIDATION_ERROR' as const;
  public readonly slideCount: number;
  constructor(slideCount: number) {
    super(`Carousel requires 2-10 slides, got ${slideCount}`);
    this.name = 'CarouselValidationError';
    this.slideCount = slideCount;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// TemplateSizeError
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Batch Pipeline types (BSS-4.6)
// ---------------------------------------------------------------------------

/** Specification for a single post in a batch generation request. */
export interface PostSpec {
  readonly platform: string;
  readonly format: string;
  readonly variant: SocialVariant;
  readonly content: SocialContent;
  readonly carousel?: CarouselBrief;
}

/** Options for controlling batch pipeline behavior. */
export interface BatchOptions {
  /** Maximum concurrent AI copy generation calls (default: 3) */
  readonly maxConcurrentAI?: number;
}

/** Input brief for batch creative generation. */
export interface BatchBrief {
  readonly clientId: string;
  readonly tokens: TokenSet;
  readonly posts: readonly PostSpec[];
  readonly options?: BatchOptions;
  readonly fonts?: readonly FontConfig[];
}

/** Recorded failure for a single post in a batch. */
export interface PostFailure {
  readonly postIndex: number;
  readonly error: string;
}

/** Summary report generated after batch completion. */
export interface BatchReport {
  readonly batchId: string;
  readonly clientId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly totalPosts: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly totalCostUsd: number;
  readonly assetUrls: readonly string[];
  readonly failures: readonly PostFailure[];
}

/** Result returned from BatchPipeline.run(). */
export interface BatchResult {
  readonly batchId: string;
  readonly assetUrls: readonly string[];
  readonly failures: readonly PostFailure[];
  readonly report: BatchReport;
}

// ---------------------------------------------------------------------------
// TemplateSizeError
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Content Calendar types (BSS-4.7)
// ---------------------------------------------------------------------------

/** Content pillar categories for the 4-week rotation (FR-2.6). */
export type ContentPillar = 'educational' | 'authority' | 'engagement' | 'conversion' | 'promotional';

/** Supported social media platforms for content distribution. */
export type SocialPlatform = 'instagram' | 'linkedin' | 'x-twitter' | 'facebook' | 'pinterest' | 'youtube';

/** Industry vertical for theme selection in content calendar. */
export type IndustryVertical =
  | 'health-wellness'
  | 'professional-services'
  | 'e-commerce'
  | 'technology'
  | 'education'
  | 'hospitality'
  | 'real-estate'
  | 'other';

/** Input brief for generating a 4-week content calendar. */
export interface CalendarBrief {
  readonly clientId: string;
  readonly tokens: TokenSet;
  readonly industry: IndustryVertical;
  readonly postsPerWeek?: number; // default: 7
  readonly startDate: string; // ISO 8601
}

/** A single scheduled post within a weekly plan. */
export interface ScheduledPost {
  readonly date: string; // ISO 8601
  readonly pillar: ContentPillar;
  readonly platform: SocialPlatform;
  readonly variant: SocialVariant;
  readonly contentTheme: string;
  readonly postSpec: PostSpec;
}

/** A single week within the 4-week content calendar. */
export interface WeeklyPlan {
  readonly weekNumber: 1 | 2 | 3 | 4;
  readonly pillarFocus: ContentPillar;
  readonly posts: readonly ScheduledPost[];
}

// ---------------------------------------------------------------------------
// TemplateSizeError
// ---------------------------------------------------------------------------

/**
 * Thrown when the rendered output buffer exceeds PlatformSpec.maxFileSizeMB.
 */
export class TemplateSizeError extends Error {
  public readonly code = 'TEMPLATE_SIZE_ERROR' as const;
  /** Actual output size in bytes */
  public readonly actualSizeBytes: number;
  /** Maximum allowed size in bytes */
  public readonly maxSizeBytes: number;
  /** Target platform */
  public readonly platform: string;

  constructor(actualSizeBytes: number, maxSizeBytes: number, platform: string) {
    const actualMB = (actualSizeBytes / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    super(
      `Template output for ${platform} exceeds size limit: ${actualMB}MB > ${maxMB}MB`
    );
    this.name = 'TemplateSizeError';
    this.actualSizeBytes = actualSizeBytes;
    this.maxSizeBytes = maxSizeBytes;
    this.platform = platform;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
