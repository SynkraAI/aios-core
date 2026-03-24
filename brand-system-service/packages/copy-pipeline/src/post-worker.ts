/**
 * Single-post generation worker.
 *
 * Executes the full pipeline for one post:
 * template -> render -> AI generate -> moderate -> quality score -> hashtags -> assemble
 *
 * Error in any step produces a CopyResult with error flag.
 * The batch continues regardless of individual post failures.
 *
 * @see BSS-3.7 AC 1, 3, 4, 6, 7
 * @module copy-pipeline/post-worker
 */

import { randomUUID } from 'crypto';
import type { AIService } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext } from '@brand-system/prompts';
import { render } from '@brand-system/prompts';
import type { QualityPipeline } from '@brand-system/quality';
import type { ContentModerator, ModerationResult } from '@brand-system/moderation';
import type {
  CopyBrief,
  CopyResult,
  CopyDeliverableType,
  CarouselStructure,
} from './types';
import { CONTENT_PILLAR_DESCRIPTIONS } from './types';
import { generateHashtags } from './hashtag-generator';

/** Map deliverable type to prompt template deliverable type. */
const DELIVERABLE_TYPE_MAP: Record<CopyDeliverableType, string> = {
  'social-post': 'social-post',
  'carousel-caption': 'carousel-caption',
  'hashtag-set': 'hashtag-set',
};

/** Default moderation result for error cases. */
const DEFAULT_MODERATION: ModerationResult = {
  passed: true,
  flags: [],
  requiresHumanReview: false,
  severity: 'PASS',
};

/**
 * Dependencies required by the post worker.
 */
export interface PostWorkerDeps {
  readonly aiService: AIService;
  readonly promptRegistry: PromptRegistry;
  readonly qualityPipeline: QualityPipeline;
  readonly moderator: ContentModerator;
}

/**
 * Generate a single copy piece from a brief.
 *
 * @param brief - Copy generation brief
 * @param deps - Injected dependencies
 * @returns CopyResult with all fields populated
 */
export async function generatePost(
  brief: CopyBrief,
  deps: PostWorkerDeps,
): Promise<CopyResult> {
  const contentId = randomUUID();
  const deliverableType = brief.deliverableType;

  try {
    // Step 1: Enrich client context with content pillar
    const enrichedContext = enrichContext(brief);

    // Step 2: Get template and render prompt
    const templateType = DELIVERABLE_TYPE_MAP[deliverableType];
    const template = deps.promptRegistry.getTemplate(
      templateType as Parameters<typeof deps.promptRegistry.getTemplate>[0],
    );
    if (!template) {
      throw new Error(`No active template found for deliverableType="${templateType}"`);
    }

    const rendered = render(template, enrichedContext);

    // Step 3: Generate content via AIService
    const aiResponse = await deps.aiService.generateText({
      prompt: rendered.user,
      systemPrompt: rendered.system,
      provider: 'claude',
      clientId: brief.clientId,
    });

    let copy = aiResponse.text;

    // Step 4: Parse carousel structure if applicable
    if (deliverableType === 'carousel-caption') {
      copy = parseCarouselOutput(copy);
    }

    // Step 5: Run content moderation
    const moderationContext = {
      clientId: brief.clientId,
      brandForbiddenWords: brief.clientContext.forbiddenWords ?? [],
      competitorNames: brief.clientContext.competitorNames ?? [],
    };
    const moderation = await deps.moderator.moderate(copy, moderationContext);

    // Step 6: Run quality scoring pipeline
    const qualityResult = await deps.qualityPipeline.runPipeline(
      templateType as Parameters<typeof deps.qualityPipeline.runPipeline>[0],
      enrichedContext,
      template.variant,
    );

    // Step 7: Generate hashtags for social-post and carousel-caption
    let hashtags: string[] = [];
    if (deliverableType === 'social-post' || deliverableType === 'carousel-caption') {
      hashtags = await generateHashtags(
        deps.aiService,
        deps.promptRegistry,
        brief.clientContext,
        brief.topic,
        brief.platform,
      );
    }

    // Step 8: Assemble CopyResult
    return {
      contentId,
      copy,
      hashtags,
      platform: brief.platform,
      deliverableType,
      qualityScore: qualityResult.report.averageScore,
      moderation,
      flagged: moderation.requiresHumanReview,
      qualityWarning: qualityResult.report.maxIterationsReached,
      promptVersion: template.version,
      variant: template.variant,
    };
  } catch (error) {
    // Error isolation: return result with error flag
    return {
      contentId,
      copy: '',
      hashtags: [],
      platform: brief.platform,
      deliverableType,
      qualityScore: 0,
      moderation: DEFAULT_MODERATION,
      flagged: false,
      qualityWarning: false,
      promptVersion: 'unknown',
      variant: 'unknown',
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enrich the client context with content pillar information.
 *
 * Injects `deliverablePurpose` based on the content pillar,
 * and maps brief fields to template variables.
 */
function enrichContext(brief: CopyBrief): ClientContext {
  const pillarDescription = CONTENT_PILLAR_DESCRIPTIONS[brief.contentPillar];

  return {
    ...brief.clientContext,
    deliverablePurpose: `Content pillar: ${brief.contentPillar}. Focus on ${pillarDescription}`,
    postTopic: brief.topic,
    carouselTopic: brief.topic,
    contentCategory: brief.topic,
    platform: brief.platform,
  };
}

/**
 * Parse carousel output from AI response.
 *
 * Attempts to parse a structured JSON response with
 * coverHook, contentBullets, summary, and cta fields.
 * Falls back to the raw text if parsing fails.
 *
 * @param rawOutput - Raw AI response text
 * @returns Formatted carousel caption string
 */
function parseCarouselOutput(rawOutput: string): string {
  try {
    // Try to extract JSON from code block or raw text
    const jsonMatch = rawOutput.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, rawOutput];
    const jsonText = jsonMatch[1] ?? rawOutput;
    const parsed = JSON.parse(jsonText.trim()) as CarouselStructure;

    if (parsed.coverHook && parsed.contentBullets && parsed.summary && parsed.cta) {
      // Format structured output as readable text with section markers
      const bullets = parsed.contentBullets
        .map((bullet) => `  - ${bullet}`)
        .join('\n');

      return [
        `[COVER HOOK] ${parsed.coverHook}`,
        '',
        '[CONTENT]',
        bullets,
        '',
        `[SUMMARY] ${parsed.summary}`,
        '',
        `[CTA] ${parsed.cta}`,
      ].join('\n');
    }
  } catch {
    // Parse failed — fall back to free-form text
  }

  return rawOutput;
}
