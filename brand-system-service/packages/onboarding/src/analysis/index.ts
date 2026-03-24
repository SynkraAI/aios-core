/**
 * AI Analysis Pipeline — barrel exports (BSS-7.6).
 *
 * @module onboarding/analysis
 */

// Pipeline orchestrator
export { AnalysisPipeline } from './analysis-pipeline';

// Phase generators
export { CompetitorAnalyzer, containsLogoTerms } from './competitor-analyzer';
export { ColorGenerator } from './color-generator';
export { TypographyGenerator } from './typography-generator';
export { MoodboardGenerator } from './moodboard-generator';
export { VoiceGenerator } from './voice-generator';
export { TokenDraftGenerator } from './token-draft-generator';

// Types
export type {
  // Pipeline
  AnalysisPhase,
  PhaseStatus,
  PipelineProgressEvent,
  ProgressCallback,
  AnalysisPipelineConfig,
  AnalysisPipelineDeps,
  AnalysisSummary,
  PhaseDuration,

  // Competitor Analysis
  CompetitorVisualAnalysis,
  CompetitorAnalysisResult,

  // Color Palette
  ColorValue,
  ColorRole,
  PaletteColor,
  ColorPalette,

  // Typography
  FontSpec,
  TypographyPairing,
  TypographyResult,

  // Moodboard
  MoodboardImage,
  MoodboardManifest,

  // Brand Voice
  ToneScale,
  VocabularyGuide,
  BrandVoiceDefinition,

  // Tokens
  DTCGToken,
  DTCGTokenGroup,
  TokensDraft,

  // Dependencies
  ScreenshotProvider,
  AITextProvider,
  AIVisionProvider,
  AIImageProvider,
  AnalysisR2Client,
  AnalysisClickUpClient,
} from './analysis-types';

export { ANALYSIS_PHASES } from './analysis-types';
