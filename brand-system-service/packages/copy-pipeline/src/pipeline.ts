/**
 * CopyGenerationPipeline — orchestrates batch copy generation.
 *
 * Accepts a CopyBrief and returns a CopyGenerationResult.
 * For batchSize=1, runs a single post generation.
 * For batchSize>1, runs all posts concurrently via Promise.all.
 * The JobQueue's concurrency limit governs parallelism.
 *
 * @see BSS-3.7 AC 1, 8
 * @module copy-pipeline/pipeline
 */

import type { AIService } from '@brand-system/ai-service';
import type { PromptRegistry } from '@brand-system/prompts';
import type { QualityPipeline } from '@brand-system/quality';
import type { ContentModerator } from '@brand-system/moderation';
import type { CopyBrief, CopyGenerationResult } from './types';
import { generatePost } from './post-worker';
import type { PostWorkerDeps } from './post-worker';

/**
 * Configuration options for CopyGenerationPipeline.
 */
export interface CopyPipelineOptions {
  /** AI service instance for text generation. */
  readonly aiService: AIService;
  /** Prompt template registry. */
  readonly promptRegistry: PromptRegistry;
  /** Quality scoring pipeline. */
  readonly qualityPipeline: QualityPipeline;
  /** Content moderation service. */
  readonly moderator: ContentModerator;
}

/**
 * End-to-end copy generation pipeline.
 *
 * Orchestrates: prompt selection -> content generation -> moderation
 * -> quality scoring -> hashtag generation -> result assembly.
 *
 * Each post in a batch is an independent job. A single post failure
 * does not crash the batch — the failed post is included with an
 * error flag.
 */
export class CopyGenerationPipeline {
  private readonly deps: PostWorkerDeps;

  constructor(options: CopyPipelineOptions) {
    this.deps = {
      aiService: options.aiService,
      promptRegistry: options.promptRegistry,
      qualityPipeline: options.qualityPipeline,
      moderator: options.moderator,
    };
  }

  /**
   * Generate copy from a brief.
   *
   * @param brief - Copy generation brief with batchSize
   * @returns Array of CopyResult objects, one per post
   */
  async generate(brief: CopyBrief): Promise<CopyGenerationResult> {
    const batchSize = brief.batchSize ?? 1;

    if (batchSize === 1) {
      const result = await generatePost(brief, this.deps);
      return [result];
    }

    // Batch: submit all posts concurrently
    // The JobQueue's concurrency limit governs actual parallelism
    const jobs = Array.from({ length: batchSize }, () =>
      generatePost(brief, this.deps),
    );

    return Promise.all(jobs);
  }
}
