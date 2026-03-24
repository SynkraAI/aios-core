/**
 * @brand-system/copy-pipeline — End-to-End Copy Generation Pipeline
 *
 * Orchestrates HCEA-based social post, carousel caption, and hashtag
 * generation with moderation, quality scoring, and batch support.
 *
 * @module copy-pipeline
 */

// Pipeline
export { CopyGenerationPipeline } from './pipeline';
export type { CopyPipelineOptions } from './pipeline';

// Types
export type {
  CopyBrief,
  CopyResult,
  CopyGenerationResult,
  CopyDeliverableType,
  Platform,
  ContentPillar,
  CarouselStructure,
} from './types';
export { CONTENT_PILLAR_DESCRIPTIONS } from './types';

// Post worker (for advanced usage / direct invocation)
export { generatePost } from './post-worker';
export type { PostWorkerDeps } from './post-worker';

// Hashtag generator
export { generateHashtags, parseHashtags } from './hashtag-generator';
