/**
 * @brand-system/quality — Prompt Quality Scoring Pipeline
 *
 * 5-dimension evaluation with iteration loop, A/B testing,
 * and report persistence.
 *
 * @module quality
 */

// Types
export type {
  DimensionScores,
  QualityReport,
  QualityResult,
  ABComparisonReport,
  QualityPipelineOptions,
} from './types';

export {
  DIMENSION_KEYS,
  DEFAULT_QUALITY_THRESHOLD,
  DEFAULT_MAX_ITERATIONS,
} from './types';

// Scorer
export { QualityScorer } from './scorer';
export type { ScorerClientContext } from './scorer';

// Pipeline
export { QualityPipeline } from './pipeline';

// A/B Tester
export { ABTester } from './ab-tester';

// Report Logger
export { ReportLogger } from './report-logger';

// Job Queue Integration
export { submitQualityJob } from './quality-job';
export type { QualityJobPayload } from './quality-job';
