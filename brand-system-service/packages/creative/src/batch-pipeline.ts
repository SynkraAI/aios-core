/**
 * BatchPipeline — End-to-end batch creative generation orchestrator (BSS-4.6).
 *
 * Orchestrates: AI copy generation -> template rendering -> R2 upload -> report.
 * External dependencies are injected via constructor for testability.
 *
 * Architecture: Top-level orchestrator in the Creative Production Module.
 * Uses a simple semaphore for AI call concurrency control.
 */

import { createLogger, type Logger } from '@bss/core';
import { TemplateEngine } from './template-engine';
import { CarouselEngine } from './carousel-engine';
import { TEMPLATE_REGISTRY } from './templates/index';
import type {
  BatchBrief,
  BatchResult,
  BatchReport,
  PostSpec,
  PostFailure,
  FontConfig,
  TokenSet,
  SocialContent,
} from './types';

// ---------------------------------------------------------------------------
// Dependency interfaces (DI — no direct imports of external packages)
// ---------------------------------------------------------------------------

/** Minimal interface for AI copy generation (BSS-3.7 CopyGenerationPipeline). */
interface CopyPipelineDep {
  generate(brief: {
    platform: string;
    deliverableType: string;
    pillar: string;
    headline?: string;
    body?: string;
  }): Promise<{ headline: string; body: string; costUsd?: number }>;
}

/** Minimal interface for R2 upload (BSS-1.2). */
interface R2UploadDep {
  (
    client: unknown,
    bucket: string,
    clientId: string,
    folder: string,
    filename: string,
    body: Buffer,
    options?: Record<string, unknown>,
    logger?: Logger
  ): Promise<{ key: string; bucket: string; size: number }>;
}

/** Constructor dependencies for BatchPipeline. */
export interface BatchPipelineDeps {
  readonly templateEngine?: TemplateEngine;
  readonly carouselEngine?: CarouselEngine;
  readonly r2Client?: unknown;
  readonly r2Bucket?: string;
  readonly copyPipeline?: CopyPipelineDep;
  readonly uploadAsset?: R2UploadDep;
  readonly logger?: Logger;
}

// ---------------------------------------------------------------------------
// Semaphore for AI concurrency control
// ---------------------------------------------------------------------------

class Semaphore {
  private current = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly max: number) {}

  async acquire(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.current++;
        resolve();
      });
    });
  }

  release(): void {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }
}

// ---------------------------------------------------------------------------
// Batch ID generation
// ---------------------------------------------------------------------------

let batchSequence = 0;

function generateBatchId(): string {
  batchSequence++;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(batchSequence).padStart(3, '0');
  return `b-${dateStr}-${seq}`;
}

/** Reset batch sequence (for testing). */
export function resetBatchSequence(): void {
  batchSequence = 0;
}

// ---------------------------------------------------------------------------
// BatchPipeline
// ---------------------------------------------------------------------------

const PERFORMANCE_WARN_SECONDS = 900;

/**
 * BatchPipeline orchestrates end-to-end batch creative generation.
 *
 * For each PostSpec in the brief:
 * 1. AI copy generation (skipped if headline + body pre-filled)
 * 2. Template lookup via TEMPLATE_REGISTRY or CarouselEngine
 * 3. Rendering via TemplateEngine
 * 4. R2 upload (skipped if no R2 client provided)
 *
 * Failed posts do not abort the batch; they are collected in failures[].
 */
export class BatchPipeline {
  private readonly templateEngine: TemplateEngine;
  private readonly carouselEngine: CarouselEngine;
  private readonly r2Client: unknown | undefined;
  private readonly r2Bucket: string;
  private readonly copyPipeline: CopyPipelineDep | undefined;
  private readonly uploadAssetFn: R2UploadDep | undefined;
  private readonly logger: Logger;

  constructor(deps: BatchPipelineDeps = {}) {
    this.templateEngine = deps.templateEngine ?? new TemplateEngine();
    this.carouselEngine = deps.carouselEngine ?? new CarouselEngine(this.templateEngine);
    this.r2Client = deps.r2Client;
    this.r2Bucket = deps.r2Bucket ?? '';
    this.copyPipeline = deps.copyPipeline;
    this.uploadAssetFn = deps.uploadAsset;
    this.logger = deps.logger ?? createLogger('BatchPipeline');
  }

  /**
   * Run batch generation for all posts in the brief.
   *
   * @param brief - Batch generation brief with posts, tokens, clientId
   * @returns BatchResult with asset URLs, failures, and report
   */
  async run(brief: BatchBrief): Promise<BatchResult> {
    const batchId = generateBatchId();
    const startedAt = new Date().toISOString();
    const startTime = Date.now();
    const { clientId, tokens, posts, options, fonts } = brief;
    const maxConcurrentAI = options?.maxConcurrentAI ?? 3;
    const semaphore = new Semaphore(maxConcurrentAI);

    this.logger.info('Batch started', {
      batch_id: batchId,
      client_id: clientId,
      total_posts: posts.length,
      max_concurrent_ai: maxConcurrentAI,
    });

    const assetUrls: string[] = [];
    const failures: PostFailure[] = [];
    let totalCostUsd = 0;
    let successCount = 0;

    // Process each post sequentially (AI calls use semaphore for concurrency)
    for (let i = 0; i < posts.length; i++) {
      const postStartTime = Date.now();
      try {
        const post = posts[i];

        // Step 1: AI copy generation (or skip)
        const content = await this.resolveContent(post, semaphore, i);
        totalCostUsd += (content as { costUsd?: number }).costUsd ?? 0;

        // Step 2-3: Template lookup + render
        let buffer: Buffer;
        if (post.carousel) {
          const carouselResult = await this.carouselEngine.generate(post.carousel);
          // Use first buffer for batch (carousel slides are separate assets)
          buffer = carouselResult.buffers[0] as Buffer;
        } else {
          buffer = await this.renderPost(post, content, tokens, fonts);
        }

        // Step 4: R2 upload
        const filename = `${post.format}-${post.variant}-${i}.png`;
        const r2Path = `batch/${batchId}/${post.platform}`;
        const url = await this.uploadToR2(clientId, r2Path, filename, buffer);
        if (url) {
          assetUrls.push(url);
        }

        successCount++;

        const postLatencyMs = Date.now() - postStartTime;
        this.logger.info('Post completed', {
          batch_id: batchId,
          post_index: i,
          platform: post.platform,
          latency_ms: postLatencyMs,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failures.push({ postIndex: i, error: errorMessage });
        this.logger.error('Post failed', {
          batch_id: batchId,
          post_index: i,
          error: errorMessage,
        });
      }
    }

    // Performance logging
    const elapsedMs = Date.now() - startTime;
    const elapsedSeconds = elapsedMs / 1000;
    this.logger.info('Batch completed', {
      batch_id: batchId,
      elapsed_ms: elapsedMs,
      elapsed_seconds: elapsedSeconds,
      success_count: successCount,
      failure_count: failures.length,
    });

    if (elapsedSeconds > PERFORMANCE_WARN_SECONDS) {
      this.logger.warn('Batch exceeded performance target', {
        batch_id: batchId,
        elapsed_seconds: elapsedSeconds,
        target_seconds: PERFORMANCE_WARN_SECONDS,
      });
    }

    // Build report
    const completedAt = new Date().toISOString();
    const report: BatchReport = {
      batchId,
      clientId,
      startedAt,
      completedAt,
      totalPosts: posts.length,
      successCount,
      failureCount: failures.length,
      totalCostUsd,
      assetUrls,
      failures,
    };

    // Upload report to R2
    await this.uploadReportToR2(clientId, batchId, report);

    return {
      batchId,
      assetUrls,
      failures,
      report,
    };
  }

  /**
   * Resolve content for a post: skip AI if headline+body present, else call copy pipeline.
   */
  private async resolveContent(
    post: PostSpec,
    semaphore: Semaphore,
    index: number
  ): Promise<SocialContent & { costUsd?: number }> {
    const { content } = post;

    if (content.headline && content.body) {
      this.logger.info('[AI SKIP]', {
        post_index: index,
        platform: post.platform,
      });
      return { ...content, costUsd: 0 };
    }

    if (!this.copyPipeline) {
      this.logger.info('[AI SKIP] No copy pipeline provided', {
        post_index: index,
        platform: post.platform,
      });
      return { ...content, costUsd: 0 };
    }

    await semaphore.acquire();
    try {
      this.logger.info('[AI GEN]', {
        post_index: index,
        platform: post.platform,
      });

      const result = await this.copyPipeline.generate({
        platform: post.platform,
        deliverableType: post.format,
        pillar: post.variant,
        headline: content.headline || undefined,
        body: content.body || undefined,
      });

      return {
        ...content,
        headline: result.headline,
        body: result.body,
        costUsd: result.costUsd ?? 0,
      };
    } finally {
      semaphore.release();
    }
  }

  /**
   * Look up template in registry and render via TemplateEngine.
   */
  private async renderPost(
    post: PostSpec,
    content: SocialContent,
    tokens: TokenSet,
    fonts?: readonly FontConfig[]
  ): Promise<Buffer> {
    const registryKey = `${post.platform}:${post.format}:${post.variant}`;
    const entry = TEMPLATE_REGISTRY.get(registryKey);

    if (!entry) {
      throw new Error(`Template not found in registry: ${registryKey}`);
    }

    const element = entry.component({ tokens, content });

    return this.templateEngine.render({
      element,
      tokens,
      spec: entry.spec,
      fonts: (fonts ?? []) as FontConfig[],
    });
  }

  /**
   * Upload a buffer to R2 storage. Returns the R2 key or empty string if no client.
   */
  private async uploadToR2(
    clientId: string,
    folder: string,
    filename: string,
    body: Buffer
  ): Promise<string> {
    if (!this.r2Client || !this.uploadAssetFn) {
      return '';
    }

    try {
      const result = await this.uploadAssetFn(
        this.r2Client,
        this.r2Bucket,
        clientId,
        folder,
        filename,
        body,
        { contentType: 'image/png' },
        this.logger
      );
      return result.key;
    } catch (error) {
      this.logger.error('R2 upload failed', {
        folder,
        filename,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Upload the batch report as JSON to R2.
   */
  private async uploadReportToR2(
    clientId: string,
    batchId: string,
    report: BatchReport
  ): Promise<void> {
    if (!this.r2Client || !this.uploadAssetFn) {
      return;
    }

    try {
      const reportBuffer = Buffer.from(JSON.stringify(report, null, 2));
      await this.uploadAssetFn(
        this.r2Client,
        this.r2Bucket,
        clientId,
        `batch/${batchId}`,
        'report.json',
        reportBuffer,
        { contentType: 'application/json' },
        this.logger
      );
    } catch (error) {
      this.logger.error('Report upload failed', {
        batch_id: batchId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
