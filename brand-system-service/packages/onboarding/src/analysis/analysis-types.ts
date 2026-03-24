/**
 * Types for the AI Analysis Pipeline (BSS-7.6).
 *
 * Covers all analysis artifacts: color palette, typography pairings,
 * moodboard manifest, brand voice definition, DTCG token draft,
 * competitor analysis, and the aggregated analysis summary.
 *
 * @module onboarding/analysis/analysis-types
 */

// ---------------------------------------------------------------------------
// Pipeline Phase Tracking (AC 8)
// ---------------------------------------------------------------------------

/** Identifiers for each pipeline phase, emitted as progress events. */
export const ANALYSIS_PHASES = [
  'competitor_analysis',
  'color_palette',
  'typography',
  'moodboard',
  'voice',
  'tokens',
] as const;

export type AnalysisPhase = (typeof ANALYSIS_PHASES)[number];

/** Status of a single pipeline phase. */
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/** Progress event emitted for each phase transition. */
export interface PipelineProgressEvent {
  readonly phase: AnalysisPhase;
  readonly status: PhaseStatus;
  readonly timestamp: string;
  readonly durationMs?: number;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Competitor Analysis (AC 2)
// ---------------------------------------------------------------------------

/** Visual patterns extracted from a single competitor screenshot. */
export interface CompetitorVisualAnalysis {
  readonly url: string;
  readonly screenshotR2Key?: string;
  readonly dominantColors: readonly string[];
  readonly layoutStyle: string;
  readonly imageryTone: string;
  readonly overallImpression: string;
  readonly skipped: boolean;
  readonly skipReason?: string;
}

/** Aggregated competitor analysis result. */
export interface CompetitorAnalysisResult {
  readonly analyses: readonly CompetitorVisualAnalysis[];
  readonly commonPatterns: {
    readonly dominantColors: readonly string[];
    readonly layoutStyles: readonly string[];
    readonly imageryTones: readonly string[];
  };
  readonly analyzedCount: number;
  readonly skippedCount: number;
}

// ---------------------------------------------------------------------------
// Color Palette (AC 3)
// ---------------------------------------------------------------------------

/** Color representation with hex, RGB, and HSL values. */
export interface ColorValue {
  readonly hex: string;
  readonly rgb: { readonly r: number; readonly g: number; readonly b: number };
  readonly hsl: { readonly h: number; readonly s: number; readonly l: number };
}

/** The 6 named color roles in the brand palette. */
export type ColorRole = 'primary' | 'secondary' | 'accent' | 'neutral-light' | 'neutral-dark' | 'background';

/** A single color entry in the palette. */
export interface PaletteColor {
  readonly role: ColorRole;
  readonly color: ColorValue;
  readonly rationale: string;
}

/** Complete 6-color brand palette (AC 3). */
export interface ColorPalette {
  readonly colors: readonly PaletteColor[];
  readonly generationRationale: string;
}

// ---------------------------------------------------------------------------
// Typography Pairings (AC 4)
// ---------------------------------------------------------------------------

/** A single font specification. */
export interface FontSpec {
  readonly family: string;
  readonly weight: number;
  readonly style: 'normal' | 'italic';
  readonly source: 'google-fonts';
}

/** A heading + body font pairing with rationale. */
export interface TypographyPairing {
  readonly heading: FontSpec;
  readonly body: FontSpec;
  readonly rationale: string;
}

/** Result of typography generation: 2 pairings (AC 4). */
export interface TypographyResult {
  readonly pairings: readonly TypographyPairing[];
}

// ---------------------------------------------------------------------------
// Moodboard (AC 5)
// ---------------------------------------------------------------------------

/** A single moodboard image entry. */
export interface MoodboardImage {
  readonly prompt: string;
  readonly r2Key: string;
  readonly width: number;
  readonly height: number;
  readonly index: number;
}

/** Complete moodboard manifest: 8-12 images (AC 5). */
export interface MoodboardManifest {
  readonly images: readonly MoodboardImage[];
  readonly sourceKeywords: readonly string[];
  readonly imageCount: number;
}

// ---------------------------------------------------------------------------
// Brand Voice Definition (AC 6)
// ---------------------------------------------------------------------------

/** Tone spectrum position on a formal-casual 5-point scale. */
export interface ToneScale {
  readonly dimension: string;
  readonly leftPole: string;
  readonly rightPole: string;
  readonly position: number; // 1-5
}

/** Vocabulary guide: words to use and words to avoid. */
export interface VocabularyGuide {
  readonly useWords: readonly string[];
  readonly avoidWords: readonly string[];
}

/** Complete brand voice definition (AC 6). */
export interface BrandVoiceDefinition {
  readonly toneScales: readonly ToneScale[];
  readonly vocabularyGuide: VocabularyGuide;
  readonly communicationGuidelines: readonly string[];
}

// ---------------------------------------------------------------------------
// W3C DTCG Token Draft (AC 7)
// ---------------------------------------------------------------------------

/** A single DTCG token entry. */
export interface DTCGToken {
  readonly $value: string | number;
  readonly $type: string;
  readonly $description?: string;
}

/** DTCG token group (nested object). */
export interface DTCGTokenGroup {
  readonly [key: string]: DTCGToken | DTCGTokenGroup;
}

/** Complete DTCG token draft document (AC 7). */
export interface TokensDraft {
  readonly color: DTCGTokenGroup;
  readonly typography: DTCGTokenGroup;
}

// ---------------------------------------------------------------------------
// Analysis Summary (AC 10)
// ---------------------------------------------------------------------------

/** Phase duration tracking for the summary. */
export interface PhaseDuration {
  readonly phase: AnalysisPhase;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly status: PhaseStatus;
}

/** Complete analysis summary with all artifact references (AC 10). */
export interface AnalysisSummary {
  readonly version: '1.0';
  readonly clientId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly phaseDurations: readonly PhaseDuration[];
  readonly artifacts: {
    readonly competitorAnalysis: string; // R2 key
    readonly colorPalette: string;
    readonly typography: string;
    readonly moodboard: string;
    readonly brandVoice: string;
    readonly tokensDraft: string;
    readonly summary: string;
  };
  readonly metadata: {
    readonly intakeR2Key: string;
    readonly competitorsAnalyzed: number;
    readonly competitorsSkipped: number;
    readonly moodboardImageCount: number;
    readonly pipelineVersion: string;
  };
}

// ---------------------------------------------------------------------------
// Pipeline Configuration & Dependencies
// ---------------------------------------------------------------------------

/** Configuration for the analysis pipeline. */
export interface AnalysisPipelineConfig {
  /** R2 path prefix: brand-assets/{client-id}/onboarding */
  readonly r2PathPrefix: string;
  /** Client identifier. */
  readonly clientId: string;
  /** Maximum concurrent image generation jobs. */
  readonly maxConcurrentImages: number;
  /** Target moodboard image count (8-12). */
  readonly moodboardImageCount: number;
}

/** Interface for screenshot capture (pluggable provider). */
export interface ScreenshotProvider {
  capture(url: string): Promise<Buffer>;
}

/** Interface for AI text generation (subset of AIServiceProvider). */
export interface AITextProvider {
  generateText(options: {
    readonly prompt: string;
    readonly systemPrompt?: string;
    readonly provider?: string;
    readonly clientId?: string;
    readonly maxTokens?: number;
    readonly temperature?: number;
  }): Promise<{
    readonly text: string;
    readonly provider: string;
    readonly model: string;
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly costUsd: number;
    readonly latencyMs: number;
  }>;
}

/** Interface for AI vision analysis (Claude Vision). */
export interface AIVisionProvider {
  analyzeImage(options: {
    readonly imageBuffer: Buffer;
    readonly prompt: string;
    readonly clientId?: string;
  }): Promise<{
    readonly text: string;
    readonly provider: string;
  }>;
}

/** Interface for AI image generation (Flux / DALL-E). */
export interface AIImageProvider {
  generateImage(options: {
    readonly prompt: string;
    readonly provider?: string;
    readonly width?: number;
    readonly height?: number;
    readonly clientId?: string;
  }): Promise<{
    readonly imageUrl: string;
    readonly provider: string;
    readonly model: string;
    readonly costUsd: number;
    readonly latencyMs: number;
  }>;
}

/** Interface for R2 storage operations used by the analysis pipeline. */
export interface AnalysisR2Client {
  uploadJson(key: string, data: unknown): Promise<{ key: string }>;
  uploadFile(key: string, body: Buffer | Uint8Array, contentType: string): Promise<{ key: string }>;
}

/** Interface for ClickUp notifications used by the analysis pipeline. */
export interface AnalysisClickUpClient {
  addComment(taskId: string, comment: string): Promise<void>;
}

/** All injected dependencies for the analysis pipeline. */
export interface AnalysisPipelineDeps {
  readonly screenshotProvider: ScreenshotProvider;
  readonly textProvider: AITextProvider;
  readonly visionProvider: AIVisionProvider;
  readonly imageProvider: AIImageProvider;
  readonly r2Client: AnalysisR2Client;
  readonly clickUpClient?: AnalysisClickUpClient;
  readonly clickUpTaskId?: string;
}

/** Callback for pipeline progress events. */
export type ProgressCallback = (event: PipelineProgressEvent) => void;
