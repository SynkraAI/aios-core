/**
 * Quality Scoring Pipeline — Type Definitions
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */

/**
 * Scores for each of the 5 quality dimensions (1-5 scale).
 */
export interface DimensionScores {
  readonly brandVoiceAdherence: number;
  readonly factualAccuracy: number;
  readonly toneAppropriateness: number;
  readonly ctaEffectiveness: number;
  readonly creativity: number;
}

/**
 * Report produced by each evaluation run.
 */
export interface QualityReport {
  readonly contentId: string;
  readonly iteration: number;
  readonly scores: DimensionScores;
  readonly averageScore: number;
  readonly approved: boolean;
  readonly feedback: string;
  readonly promptVersion: string;
  readonly variant: string;
  readonly maxIterationsReached: boolean;
  readonly timestamp: string;
}

/**
 * Final result from the quality scoring pipeline.
 */
export interface QualityResult {
  readonly content: string;
  readonly report: QualityReport;
  readonly iterationHistory: QualityReport[];
}

/**
 * Comparison report for A/B testing between two prompt variants.
 */
export interface ABComparisonReport {
  readonly deliverableType: string;
  readonly clientId: string;
  readonly variantA: QualityResult;
  readonly variantB: QualityResult;
  readonly winner: 'A' | 'B';
  readonly scoreDifference: number;
  readonly timestamp: string;
}

/**
 * Options for the quality scoring pipeline.
 */
export interface QualityPipelineOptions {
  readonly maxIterations?: number;
  readonly qualityThreshold?: number;
}

/**
 * Dimension keys as a const array for iteration.
 */
export const DIMENSION_KEYS: readonly (keyof DimensionScores)[] = [
  'brandVoiceAdherence',
  'factualAccuracy',
  'toneAppropriateness',
  'ctaEffectiveness',
  'creativity',
] as const;

/** Default quality threshold. Content >= this average is approved. */
export const DEFAULT_QUALITY_THRESHOLD = 4.0;

/** Default maximum iterations for the regeneration loop. */
export const DEFAULT_MAX_ITERATIONS = 3;
