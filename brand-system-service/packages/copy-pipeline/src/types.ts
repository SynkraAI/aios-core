/**
 * Copy Generation Pipeline — Type Definitions
 *
 * @see BSS-3.7: Copy Generation Pipeline
 */

import type { ModerationResult } from '@brand-system/moderation';
import type { ClientContext } from '@brand-system/prompts';

/** Content pillar categories for copy generation. */
export type ContentPillar =
  | 'educational'
  | 'authority'
  | 'engagement'
  | 'conversion'
  | 'promotional';

/** Deliverable types supported by the copy pipeline. */
export type CopyDeliverableType = 'social-post' | 'carousel-caption' | 'hashtag-set';

/** Target social media platforms. */
export type Platform = 'instagram' | 'linkedin' | 'x' | 'facebook' | 'pinterest';

/**
 * Structured carousel caption output.
 * Parsed from AI JSON response.
 */
export interface CarouselStructure {
  readonly coverHook: string;
  readonly contentBullets: string[];
  readonly summary: string;
  readonly cta: string;
}

/**
 * Content pillar descriptions for AI context injection.
 */
export const CONTENT_PILLAR_DESCRIPTIONS: Record<ContentPillar, string> = {
  educational: 'teaching the audience something new, providing actionable knowledge',
  authority: 'establishing thought leadership and industry expertise',
  engagement: 'sparking conversation, encouraging interaction and community building',
  conversion: 'driving specific actions: signups, purchases, consultations',
  promotional: 'showcasing products, services, or offers with clear value propositions',
} as const;

/**
 * Input brief for copy generation.
 * Describes what to generate and for whom.
 */
export interface CopyBrief {
  /** Client identifier for cost attribution and context isolation. */
  readonly clientId: string;
  /** Type of deliverable to generate. */
  readonly deliverableType: CopyDeliverableType;
  /** Target social media platform. */
  readonly platform: Platform;
  /** Topic/subject for the content. */
  readonly topic: string;
  /** Content pillar driving the post's purpose. */
  readonly contentPillar: ContentPillar;
  /** Client brand context for template rendering. */
  readonly clientContext: ClientContext;
  /** Number of posts to generate (default: 1). */
  readonly batchSize?: number;
}

/**
 * Result for a single generated copy piece.
 * Always included in the batch result, even on moderation failure.
 */
export interface CopyResult {
  /** Unique identifier for this content piece. */
  readonly contentId: string;
  /** The generated copy text. */
  readonly copy: string;
  /** Hashtags for the post (8-12 items). */
  readonly hashtags: string[];
  /** Target platform. */
  readonly platform: Platform;
  /** Deliverable type. */
  readonly deliverableType: CopyDeliverableType;
  /** Average quality score (1-5 scale). */
  readonly qualityScore: number;
  /** Full moderation result. */
  readonly moderation: ModerationResult;
  /** Whether content was flagged by moderation (requiresHumanReview). */
  readonly flagged: boolean;
  /** Whether quality scoring hit max iterations without approval. */
  readonly qualityWarning: boolean;
  /** Prompt template version used. */
  readonly promptVersion: string;
  /** A/B variant identifier. */
  readonly variant: string;
  /** Whether an error occurred during generation. */
  readonly error?: boolean;
  /** Error message if generation failed. */
  readonly errorMessage?: string;
}

/** Result of a copy generation batch. */
export type CopyGenerationResult = CopyResult[];
