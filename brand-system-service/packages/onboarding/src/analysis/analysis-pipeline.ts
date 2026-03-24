/**
 * AI Analysis Pipeline Orchestrator (BSS-7.6).
 *
 * Orchestrates the 6-phase standard mode analysis pipeline:
 * 1. Competitor screenshot analysis (Claude Vision)
 * 2. Color palette generation (6 colors)
 * 3. Typography pairing generation (2 Google Fonts pairs)
 * 4. Moodboard image generation (8-12 Flux images)
 * 5. Brand voice definition (tone, vocabulary, guidelines)
 * 6. W3C DTCG token draft generation
 *
 * All artifacts are stored in R2 and an analysis-summary.json is written
 * with references to all outputs. A ClickUp comment is posted on completion.
 *
 * Progress events are emitted for each phase via a callback (AC 8).
 *
 * @module onboarding/analysis/analysis-pipeline
 */

import type {
  AnalysisPipelineConfig,
  AnalysisPipelineDeps,
  AnalysisSummary,
  PipelineProgressEvent,
  ProgressCallback,
  AnalysisPhase,
  PhaseStatus,
  PhaseDuration,
  CompetitorAnalysisResult,
  ColorPalette,
  TypographyResult,
  MoodboardManifest,
  BrandVoiceDefinition,
  TokensDraft,
} from './analysis-types';
import { ANALYSIS_PHASES } from './analysis-types';
import type { IntakeFormData, MoodTile } from '../types';
import { CompetitorAnalyzer } from './competitor-analyzer';
import { ColorGenerator } from './color-generator';
import { TypographyGenerator } from './typography-generator';
import { MoodboardGenerator } from './moodboard-generator';
import { VoiceGenerator } from './voice-generator';
import { TokenDraftGenerator } from './token-draft-generator';
import { MOOD_TILES } from '../mood-tiles';

/** Pipeline version identifier. */
const PIPELINE_VERSION = '1.0.0';

/**
 * AnalysisPipeline — orchestrates the full 6-phase AI analysis.
 *
 * Usage:
 * 1. Create pipeline with config and dependencies
 * 2. Call run() with intake data and optional progress callback
 * 3. All artifacts are persisted to R2 automatically
 * 4. Returns the analysis summary
 */
export class AnalysisPipeline {
  private readonly config: AnalysisPipelineConfig;
  private readonly deps: AnalysisPipelineDeps;

  constructor(config: AnalysisPipelineConfig, deps: AnalysisPipelineDeps) {
    this.config = config;
    this.deps = deps;
  }

  /**
   * Execute the full analysis pipeline.
   *
   * @param intakeData - Complete intake form data from BSS-7.1
   * @param onProgress - Optional callback for phase progress events
   * @returns Analysis summary with all artifact R2 keys
   */
  async run(
    intakeData: IntakeFormData,
    onProgress?: ProgressCallback,
  ): Promise<AnalysisSummary> {
    const pipelineStartedAt = new Date().toISOString();
    const phaseDurations: PhaseDuration[] = [];

    // Resolve mood tiles from selected IDs
    const selectedMoodTiles = this.resolveMoodTiles(intakeData.visualPreferences.selectedMoodIds);
    const competitorUrls = intakeData.competitorUrls.urls.map((u) => u.url);

    // -----------------------------------------------------------------------
    // Phase 1: Competitor Analysis (AC 2)
    // -----------------------------------------------------------------------
    const competitorResult = await this.executePhase<CompetitorAnalysisResult>(
      'competitor_analysis',
      phaseDurations,
      onProgress,
      async () => {
        const analyzer = new CompetitorAnalyzer(
          this.deps.screenshotProvider,
          this.deps.visionProvider,
          this.config.clientId,
        );
        return analyzer.analyze(competitorUrls);
      },
    );

    // -----------------------------------------------------------------------
    // Phase 2: Color Palette (AC 3)
    // -----------------------------------------------------------------------
    const colorPalette = await this.executePhase<ColorPalette>(
      'color_palette',
      phaseDurations,
      onProgress,
      async () => {
        const generator = new ColorGenerator(this.deps.textProvider, this.config.clientId);
        return generator.generate(
          intakeData.brandPersonality,
          intakeData.visualPreferences,
          selectedMoodTiles,
          competitorResult,
        );
      },
    );

    // -----------------------------------------------------------------------
    // Phase 3: Typography (AC 4)
    // -----------------------------------------------------------------------
    const typographyResult = await this.executePhase<TypographyResult>(
      'typography',
      phaseDurations,
      onProgress,
      async () => {
        const generator = new TypographyGenerator(this.deps.textProvider, this.config.clientId);
        return generator.generate(
          intakeData.brandPersonality,
          intakeData.companyBasics.industry,
          intakeData.companyBasics.targetAudience,
        );
      },
    );

    // -----------------------------------------------------------------------
    // Phase 4: Moodboard (AC 5)
    // -----------------------------------------------------------------------
    const moodboardManifest = await this.executePhase<MoodboardManifest>(
      'moodboard',
      phaseDurations,
      onProgress,
      async () => {
        const generator = new MoodboardGenerator(
          this.deps.textProvider,
          this.deps.imageProvider,
          this.deps.r2Client,
          this.config.clientId,
          this.config.r2PathPrefix,
          this.config.maxConcurrentImages,
          this.config.moodboardImageCount,
        );
        return generator.generate(selectedMoodTiles, competitorResult);
      },
    );

    // -----------------------------------------------------------------------
    // Phase 5: Brand Voice (AC 6)
    // -----------------------------------------------------------------------
    const brandVoice = await this.executePhase<BrandVoiceDefinition>(
      'voice',
      phaseDurations,
      onProgress,
      async () => {
        const generator = new VoiceGenerator(this.deps.textProvider, this.config.clientId);
        return generator.generate(
          intakeData.brandPersonality,
          intakeData.companyBasics.industry,
          intakeData.companyBasics.targetAudience,
          intakeData.companyBasics.companyName,
        );
      },
    );

    // -----------------------------------------------------------------------
    // Phase 6: Token Draft (AC 7)
    // -----------------------------------------------------------------------
    const tokensDraft = await this.executePhase<TokensDraft>(
      'tokens',
      phaseDurations,
      onProgress,
      async () => {
        const generator = new TokenDraftGenerator();
        return generator.generate(colorPalette, typographyResult);
      },
    );

    // -----------------------------------------------------------------------
    // Persist all artifacts to R2 (AC 9)
    // -----------------------------------------------------------------------
    const artifactKeys = await this.persistArtifacts(
      competitorResult,
      colorPalette,
      typographyResult,
      moodboardManifest,
      brandVoice,
      tokensDraft,
    );

    // -----------------------------------------------------------------------
    // Build and persist analysis summary (AC 10)
    // -----------------------------------------------------------------------
    const pipelineCompletedAt = new Date().toISOString();
    const durationMs =
      new Date(pipelineCompletedAt).getTime() - new Date(pipelineStartedAt).getTime();

    const summaryKey = `${this.config.r2PathPrefix}/analysis/analysis-summary.json`;

    const summary: AnalysisSummary = {
      version: '1.0',
      clientId: this.config.clientId,
      startedAt: pipelineStartedAt,
      completedAt: pipelineCompletedAt,
      durationMs,
      phaseDurations,
      artifacts: {
        ...artifactKeys,
        summary: summaryKey,
      },
      metadata: {
        intakeR2Key: `${this.config.r2PathPrefix}/intake.json`,
        competitorsAnalyzed: competitorResult.analyzedCount,
        competitorsSkipped: competitorResult.skippedCount,
        moodboardImageCount: moodboardManifest.imageCount,
        pipelineVersion: PIPELINE_VERSION,
      },
    };

    await this.deps.r2Client.uploadJson(summaryKey, summary);

    // -----------------------------------------------------------------------
    // ClickUp notification (AC 9)
    // -----------------------------------------------------------------------
    await this.postClickUpComment(summary);

    return summary;
  }

  // -------------------------------------------------------------------------
  // Phase Execution Helper
  // -------------------------------------------------------------------------

  /**
   * Execute a single pipeline phase with progress tracking.
   */
  private async executePhase<T>(
    phase: AnalysisPhase,
    phaseDurations: PhaseDuration[],
    onProgress: ProgressCallback | undefined,
    execute: () => Promise<T>,
  ): Promise<T> {
    const startedAt = new Date().toISOString();

    this.emitProgress(onProgress, phase, 'in_progress');

    try {
      const result = await execute();
      const completedAt = new Date().toISOString();
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

      phaseDurations.push({
        phase,
        startedAt,
        completedAt,
        durationMs,
        status: 'completed',
      });

      this.emitProgress(onProgress, phase, 'completed', durationMs);

      return result;
    } catch (error) {
      const completedAt = new Date().toISOString();
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      phaseDurations.push({
        phase,
        startedAt,
        completedAt,
        durationMs,
        status: 'failed',
      });

      this.emitProgress(onProgress, phase, 'failed', durationMs, errorMessage);

      throw error;
    }
  }

  /**
   * Emit a progress event via the callback.
   */
  private emitProgress(
    onProgress: ProgressCallback | undefined,
    phase: AnalysisPhase,
    status: PhaseStatus,
    durationMs?: number,
    error?: string,
  ): void {
    if (!onProgress) return;

    const event: PipelineProgressEvent = {
      phase,
      status,
      timestamp: new Date().toISOString(),
      ...(durationMs !== undefined ? { durationMs } : {}),
      ...(error ? { error } : {}),
    };

    onProgress(event);
  }

  // -------------------------------------------------------------------------
  // Artifact Persistence (AC 9)
  // -------------------------------------------------------------------------

  /**
   * Persist all analysis artifacts to R2.
   */
  private async persistArtifacts(
    competitorAnalysis: CompetitorAnalysisResult,
    colorPalette: ColorPalette,
    typography: TypographyResult,
    moodboard: MoodboardManifest,
    brandVoice: BrandVoiceDefinition,
    tokensDraft: TokensDraft,
  ): Promise<{
    competitorAnalysis: string;
    colorPalette: string;
    typography: string;
    moodboard: string;
    brandVoice: string;
    tokensDraft: string;
  }> {
    const prefix = `${this.config.r2PathPrefix}/analysis`;

    const keys = {
      competitorAnalysis: `${prefix}/competitor-analysis.json`,
      colorPalette: `${prefix}/color-palette.json`,
      typography: `${prefix}/typography.json`,
      moodboard: `${prefix}/moodboard-manifest.json`,
      brandVoice: `${prefix}/brand-voice.json`,
      tokensDraft: `${this.config.r2PathPrefix}/tokens-draft.json`,
    };

    await Promise.all([
      this.deps.r2Client.uploadJson(keys.competitorAnalysis, competitorAnalysis),
      this.deps.r2Client.uploadJson(keys.colorPalette, colorPalette),
      this.deps.r2Client.uploadJson(keys.typography, typography),
      this.deps.r2Client.uploadJson(keys.moodboard, moodboard),
      this.deps.r2Client.uploadJson(keys.brandVoice, brandVoice),
      this.deps.r2Client.uploadJson(keys.tokensDraft, tokensDraft),
    ]);

    return keys;
  }

  // -------------------------------------------------------------------------
  // ClickUp Notification (AC 9)
  // -------------------------------------------------------------------------

  /**
   * Post a ClickUp comment with artifact links on pipeline completion.
   * Graceful degradation: failure does not throw.
   */
  private async postClickUpComment(summary: AnalysisSummary): Promise<void> {
    if (!this.deps.clickUpClient || !this.deps.clickUpTaskId) {
      return;
    }

    try {
      const durationSec = Math.round(summary.durationMs / 1000);
      const comment = [
        `## AI Analysis Pipeline Complete`,
        '',
        `**Client:** ${summary.clientId}`,
        `**Duration:** ${durationSec}s`,
        `**Competitors Analyzed:** ${summary.metadata.competitorsAnalyzed} (${summary.metadata.competitorsSkipped} skipped)`,
        `**Moodboard Images:** ${summary.metadata.moodboardImageCount}`,
        '',
        '### Artifacts',
        `- Color Palette: \`${summary.artifacts.colorPalette}\``,
        `- Typography: \`${summary.artifacts.typography}\``,
        `- Moodboard: \`${summary.artifacts.moodboard}\``,
        `- Brand Voice: \`${summary.artifacts.brandVoice}\``,
        `- Tokens Draft: \`${summary.artifacts.tokensDraft}\``,
        `- Competitor Analysis: \`${summary.artifacts.competitorAnalysis}\``,
        `- Summary: \`${summary.artifacts.summary}\``,
      ].join('\n');

      await this.deps.clickUpClient.addComment(this.deps.clickUpTaskId, comment);
    } catch {
      // Graceful degradation: ClickUp failure does not block pipeline
    }
  }

  // -------------------------------------------------------------------------
  // Mood Tile Resolution
  // -------------------------------------------------------------------------

  /**
   * Resolve mood tile IDs to full MoodTile objects.
   */
  private resolveMoodTiles(selectedIds: readonly string[]): MoodTile[] {
    return selectedIds
      .map((id) => MOOD_TILES.find((t) => t.id === id))
      .filter((tile): tile is MoodTile => tile !== undefined);
  }
}
