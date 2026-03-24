/**
 * Review Manager (BSS-7.7, AC 1-10).
 *
 * Orchestrates the human review interface for brand direction validation.
 * Handles dual-mode artifact loading, section tracking, data quality
 * warnings, AI draft badges, and the approval workflow.
 *
 * This is the main entry point for the review module.
 *
 * @module onboarding/review/review-manager
 */

import type {
  AnalysisSummary,
  ColorPalette,
  TypographyPairing,
  TypographyResult,
  MoodboardManifest,
  BrandVoiceDefinition,
  TokensDraft,
} from '../analysis/analysis-types';
import type {
  DraftManifest,
  BrandVoiceDraft,
  MoodboardDirectionDraft,
} from '../drafts/draft-types';
import type { DataQualityReport } from '../quality/quality-types';
import type {
  OnboardingMode,
  ModeDetectionResult,
  ReviewState,
  ReviewSectionId,
  ReviewSectionState,
  ReviewSectionStatus,
  DataQualityWarning,
  ReviewManagerDeps,
  ReviewR2Client,
  ReviewClickUpClient,
  ApprovedDirection,
} from './review-types';
import {
  buildAnalysisSummaryR2Key,
  buildDraftManifestR2Key,
  buildDataQualityReportR2Key,
  AI_DRAFT_BADGE_LABEL,
} from './review-types';
import { ColorReviewer } from './color-reviewer';
import { TypographyReviewer } from './typography-reviewer';
import { MoodboardReviewer } from './moodboard-reviewer';
import { VoiceReviewer } from './voice-reviewer';
import { TokenReviewer } from './token-reviewer';
import { ApprovalHandler, areAllSectionsSaved } from './approval-handler';
import type { ApprovalResult } from './approval-handler';

// ---------------------------------------------------------------------------
// Loaded Artifacts
// ---------------------------------------------------------------------------

/** Artifacts loaded in standard mode (from analysis-summary.json). */
export interface StandardModeArtifacts {
  readonly analysisSummary: AnalysisSummary;
  readonly colorPalette: ColorPalette;
  readonly typography: TypographyResult;
  readonly moodboard: MoodboardManifest;
  readonly voiceDefinition: BrandVoiceDefinition;
  readonly tokensDraft: TokensDraft;
}

/** Artifacts loaded in audit-assisted mode (from ai-drafts/index.json). */
export interface AuditAssistedArtifacts {
  readonly draftManifest: DraftManifest;
  readonly brandVoiceDraft: BrandVoiceDraft;
  readonly moodboardDirection: MoodboardDirectionDraft;
  /** Color palette synthesized from moodboard direction color seeds. */
  readonly colorPalette: ColorPalette;
  /** Typography pairings synthesized from moodboard direction. */
  readonly typography: TypographyResult;
  /** Moodboard manifest (if images were generated). */
  readonly moodboard: MoodboardManifest;
  /** Voice definition extracted from brand voice draft. */
  readonly voiceDefinition: BrandVoiceDefinition;
  /** Token draft (may be partial in audit mode). */
  readonly tokensDraft: TokensDraft;
}

// ---------------------------------------------------------------------------
// Review Manager
// ---------------------------------------------------------------------------

/**
 * ReviewManager orchestrates the complete human review workflow.
 *
 * Lifecycle:
 * 1. `detectMode(clientId)` — determines standard vs audit-assisted mode.
 * 2. `loadArtifacts(clientId)` — loads all artifacts from R2.
 * 3. Section reviewers (color, typography, moodboard, voice, tokens).
 * 4. `approve()` — validates all sections, writes approved-direction.json.
 */
export class ReviewManager {
  private readonly r2Client: ReviewR2Client;
  private readonly clickUpClient?: ReviewClickUpClient;
  private readonly clickUpTaskId?: string;

  private clientId: string | null = null;
  private mode: OnboardingMode | null = null;
  private isAuditAssisted = false;
  private sections: Record<ReviewSectionId, ReviewSectionState>;
  private dataQualityWarning: DataQualityWarning;

  // Section reviewers
  private colorReviewer: ColorReviewer | null = null;
  private typographyReviewer: TypographyReviewer | null = null;
  private moodboardReviewer: MoodboardReviewer | null = null;
  private voiceReviewer: VoiceReviewer | null = null;
  private tokenReviewer: TokenReviewer | null = null;

  constructor(deps: ReviewManagerDeps) {
    this.r2Client = deps.r2Client;
    this.clickUpClient = deps.clickUpClient;
    this.clickUpTaskId = deps.clickUpTaskId;

    // Initialize all sections as not_started
    this.sections = {
      color_palette: { sectionId: 'color_palette', status: 'not_started', hasPendingEdits: false },
      typography: { sectionId: 'typography', status: 'not_started', hasPendingEdits: false },
      moodboard: { sectionId: 'moodboard', status: 'not_started', hasPendingEdits: false },
      voice_definition: { sectionId: 'voice_definition', status: 'not_started', hasPendingEdits: false },
      token_draft: { sectionId: 'token_draft', status: 'not_started', hasPendingEdits: false },
    };

    this.dataQualityWarning = {
      showBanner: false,
      criticalAlert: false,
      lowConfidence: false,
    };
  }

  // -------------------------------------------------------------------------
  // Mode Detection (AC 1, DD-7.7-1)
  // -------------------------------------------------------------------------

  /**
   * Detects the onboarding mode by checking which summary file exists in R2.
   *
   * Detection logic (DD-7.7-1):
   * 1. If analysis-summary.json exists -> standard mode.
   * 2. If ai-drafts/index.json exists -> audit-assisted mode.
   * 3. If both exist -> standard mode (with warning).
   * 4. If neither exists -> throws error.
   */
  async detectMode(clientId: string): Promise<ModeDetectionResult> {
    const analysisSummaryKey = buildAnalysisSummaryR2Key(clientId);
    const draftManifestKey = buildDraftManifestR2Key(clientId);

    const [hasAnalysis, hasDrafts] = await Promise.all([
      this.r2Client.exists(analysisSummaryKey),
      this.r2Client.exists(draftManifestKey),
    ]);

    if (!hasAnalysis && !hasDrafts) {
      throw new Error(
        `No artifacts found for client "${clientId}". ` +
        'Expected analysis-summary.json (standard) or ai-drafts/index.json (audit-assisted).'
      );
    }

    if (hasAnalysis && hasDrafts) {
      return {
        mode: 'standard',
        bothExist: true,
        warning: 'Both analysis-summary.json and ai-drafts/index.json exist. Using standard mode.',
      };
    }

    if (hasAnalysis) {
      return { mode: 'standard', bothExist: false };
    }

    return { mode: 'audit_assisted', bothExist: false };
  }

  // -------------------------------------------------------------------------
  // Artifact Loading (AC 1)
  // -------------------------------------------------------------------------

  /**
   * Loads all artifacts for review based on the detected mode.
   * Also loads data quality report for warning banner (AC 7).
   */
  async loadArtifacts(clientId: string): Promise<void> {
    this.clientId = clientId;
    const detection = await this.detectMode(clientId);
    this.mode = detection.mode;
    this.isAuditAssisted = detection.mode === 'audit_assisted';

    // Load data quality report for warning banner (AC 7)
    await this.loadDataQualityReport(clientId);

    if (detection.mode === 'standard') {
      await this.loadStandardArtifacts(clientId);
    } else {
      await this.loadAuditAssistedArtifacts(clientId);
    }
  }

  /**
   * Loads standard mode artifacts from analysis-summary.json.
   */
  private async loadStandardArtifacts(clientId: string): Promise<void> {
    const summaryKey = buildAnalysisSummaryR2Key(clientId);
    const summary = await this.r2Client.downloadJson<AnalysisSummary>(summaryKey);
    if (!summary) {
      throw new Error(`Failed to load analysis-summary.json for client "${clientId}"`);
    }

    // Load individual artifacts referenced by the summary
    const [colorPalette, typography, moodboard, voiceDefinition, tokensDraft] = await Promise.all([
      this.r2Client.downloadJson<ColorPalette>(summary.artifacts.colorPalette),
      this.r2Client.downloadJson<TypographyResult>(summary.artifacts.typography),
      this.r2Client.downloadJson<MoodboardManifest>(summary.artifacts.moodboard),
      this.r2Client.downloadJson<BrandVoiceDefinition>(summary.artifacts.brandVoice),
      this.r2Client.downloadJson<TokensDraft>(summary.artifacts.tokensDraft),
    ]);

    if (!colorPalette) throw new Error('Failed to load color palette artifact');
    if (!typography) throw new Error('Failed to load typography artifact');
    if (!moodboard) throw new Error('Failed to load moodboard artifact');
    if (!voiceDefinition) throw new Error('Failed to load voice definition artifact');
    if (!tokensDraft) throw new Error('Failed to load tokens draft artifact');

    // Initialize section reviewers
    this.initializeReviewers(colorPalette, typography, moodboard, voiceDefinition, tokensDraft);
  }

  /**
   * Loads audit-assisted mode artifacts from ai-drafts/index.json.
   */
  private async loadAuditAssistedArtifacts(clientId: string): Promise<void> {
    const manifestKey = buildDraftManifestR2Key(clientId);
    const manifest = await this.r2Client.downloadJson<DraftManifest>(manifestKey);
    if (!manifest) {
      throw new Error(`Failed to load ai-drafts/index.json for client "${clientId}"`);
    }

    // Load the individual draft files referenced by the manifest
    const r2Prefix = `brand-assets/${clientId}/onboarding/ai-drafts/`;
    const draftEntries = manifest.drafts;

    // Load all drafts in parallel
    const draftPromises = draftEntries.map(async (entry) => {
      const key = `${r2Prefix}${entry.filename}`;
      return { type: entry.draft_type, data: await this.r2Client.downloadJson<unknown>(key) };
    });
    const drafts = await Promise.all(draftPromises);

    // Extract specific draft types
    let brandVoiceDraft: BrandVoiceDraft | null = null;
    let moodboardDirection: MoodboardDirectionDraft | null = null;

    for (const draft of drafts) {
      if (draft.type === 'brand-voice' && draft.data) {
        brandVoiceDraft = draft.data as BrandVoiceDraft;
      } else if (draft.type === 'moodboard-direction' && draft.data) {
        moodboardDirection = draft.data as MoodboardDirectionDraft;
      }
    }

    // Synthesize review artifacts from drafts
    const colorPalette = this.synthesizeColorPaletteFromDrafts(moodboardDirection);
    const typography = this.synthesizeTypographyFromDrafts(moodboardDirection);
    const moodboard = this.synthesizeMoodboardFromDrafts(moodboardDirection);
    const voiceDefinition = this.synthesizeVoiceFromDraft(brandVoiceDraft);
    const tokensDraft = this.synthesizeTokensFromDrafts(colorPalette, typography);

    this.initializeReviewers(colorPalette, typography, moodboard, voiceDefinition, tokensDraft);
  }

  /**
   * Initializes all section reviewers with loaded data.
   */
  private initializeReviewers(
    colorPalette: ColorPalette,
    typography: TypographyResult,
    moodboard: MoodboardManifest,
    voiceDefinition: BrandVoiceDefinition,
    tokensDraft: TokensDraft
  ): void {
    this.colorReviewer = new ColorReviewer(colorPalette);
    this.typographyReviewer = new TypographyReviewer(typography.pairings);
    this.moodboardReviewer = new MoodboardReviewer(moodboard);
    this.voiceReviewer = new VoiceReviewer(voiceDefinition, {
      r2Client: this.r2Client,
      r2Key: this.clientId
        ? `brand-assets/${this.clientId}/onboarding/voice-definition-draft.json`
        : undefined,
    });
    this.tokenReviewer = new TokenReviewer(tokensDraft);

    // Mark all sections as in_progress
    for (const sectionId of Object.keys(this.sections) as ReviewSectionId[]) {
      this.sections[sectionId] = {
        ...this.sections[sectionId],
        status: 'in_progress',
      };
    }
  }

  // -------------------------------------------------------------------------
  // Data Quality Warning (AC 7)
  // -------------------------------------------------------------------------

  /**
   * Loads the data quality report and sets the warning state.
   */
  private async loadDataQualityReport(clientId: string): Promise<void> {
    const reportKey = buildDataQualityReportR2Key(clientId);
    try {
      const report = await this.r2Client.downloadJson<DataQualityReport>(reportKey);
      if (report) {
        const criticalAlert = report.critical_data_quality_alert === true;
        const lowConfidence = report.overall_confidence === 'low';
        this.dataQualityWarning = {
          showBanner: criticalAlert || lowConfidence,
          criticalAlert,
          lowConfidence,
          report,
        };
      }
    } catch {
      // Data quality report is optional; failure is non-critical
    }
  }

  // -------------------------------------------------------------------------
  // Section State Management (AC 9)
  // -------------------------------------------------------------------------

  /** Updates a section status. */
  updateSectionStatus(sectionId: ReviewSectionId, status: ReviewSectionStatus): void {
    this.sections[sectionId] = {
      ...this.sections[sectionId],
      status,
      lastSavedAt: status === 'saved' ? new Date().toISOString() : this.sections[sectionId].lastSavedAt,
      hasPendingEdits: status !== 'saved',
    };
  }

  /** Saves the color palette section. */
  saveColorPalette(): void {
    this.updateSectionStatus('color_palette', 'saved');
  }

  /** Saves the typography section. */
  saveTypography(): void {
    if (this.typographyReviewer?.hasSelection()) {
      this.updateSectionStatus('typography', 'saved');
    }
  }

  /** Saves the moodboard section. */
  saveMoodboard(): void {
    if (this.moodboardReviewer?.meetsMinimumApproval()) {
      this.updateSectionStatus('moodboard', 'saved');
    }
  }

  /** Saves the voice definition section. */
  saveVoiceDefinition(): void {
    this.voiceReviewer?.markSaved();
    this.updateSectionStatus('voice_definition', 'saved');
  }

  /** Saves the token draft section. */
  saveTokenDraft(): void {
    this.updateSectionStatus('token_draft', 'saved');
  }

  // -------------------------------------------------------------------------
  // Review State (AC 9)
  // -------------------------------------------------------------------------

  /** Returns the complete review state. */
  getReviewState(): ReviewState {
    return {
      clientId: this.clientId ?? '',
      mode: this.mode ?? 'standard',
      sections: { ...this.sections },
      dataQualityWarning: this.dataQualityWarning,
      isAuditAssisted: this.isAuditAssisted,
      allSectionsSaved: areAllSectionsSaved(this.sections),
    };
  }

  // -------------------------------------------------------------------------
  // Section Reviewers Access
  // -------------------------------------------------------------------------

  getColorReviewer(): ColorReviewer {
    if (!this.colorReviewer) throw new Error('Color reviewer not initialized. Call loadArtifacts() first.');
    return this.colorReviewer;
  }

  getTypographyReviewer(): TypographyReviewer {
    if (!this.typographyReviewer) throw new Error('Typography reviewer not initialized. Call loadArtifacts() first.');
    return this.typographyReviewer;
  }

  getMoodboardReviewer(): MoodboardReviewer {
    if (!this.moodboardReviewer) throw new Error('Moodboard reviewer not initialized. Call loadArtifacts() first.');
    return this.moodboardReviewer;
  }

  getVoiceReviewer(): VoiceReviewer {
    if (!this.voiceReviewer) throw new Error('Voice reviewer not initialized. Call loadArtifacts() first.');
    return this.voiceReviewer;
  }

  getTokenReviewer(): TokenReviewer {
    if (!this.tokenReviewer) throw new Error('Token reviewer not initialized. Call loadArtifacts() first.');
    return this.tokenReviewer;
  }

  // -------------------------------------------------------------------------
  // AI Draft Badge (AC 8)
  // -------------------------------------------------------------------------

  /** Returns whether a section should display the AI Draft badge. */
  shouldShowAIDraftBadge(): boolean {
    return this.isAuditAssisted;
  }

  /** Returns the AI Draft badge label. */
  getAIDraftBadgeLabel(): string {
    return AI_DRAFT_BADGE_LABEL;
  }

  // -------------------------------------------------------------------------
  // Approval (AC 9-10)
  // -------------------------------------------------------------------------

  /**
   * Approves the review, writing approved-direction.json to R2.
   * Returns an ApprovalResult.
   */
  async approve(reviewerNotes?: string): Promise<ApprovalResult> {
    if (!this.clientId || !this.mode) {
      return {
        success: false,
        error: 'Review not initialized. Call loadArtifacts() first.',
        clickUpUpdated: false,
      };
    }

    // Validate all sections are saved
    if (!areAllSectionsSaved(this.sections)) {
      return {
        success: false,
        error: 'Not all sections are saved. Complete all sections before approving.',
        clickUpUpdated: false,
      };
    }

    // Get data from all reviewers
    const colorPalette = this.colorReviewer!.getEditedPalette();
    const typography = this.typographyReviewer!.getSelectedPairing();
    if (!typography) {
      return {
        success: false,
        error: 'No typography pairing selected.',
        clickUpUpdated: false,
      };
    }

    const moodboardKeys = this.moodboardReviewer!.getApprovedImageKeys();
    const voiceDefinition = this.voiceReviewer!.getEditedVoiceDefinition();
    const tokens = this.tokenReviewer!.getEditedDraft();

    const handler = new ApprovalHandler({
      r2Client: this.r2Client,
      clickUpClient: this.clickUpClient,
      clickUpTaskId: this.clickUpTaskId,
    });

    return handler.approve({
      clientId: this.clientId,
      mode: this.mode,
      colorPalette,
      typography,
      moodboardApprovedKeys: moodboardKeys,
      voiceDefinition,
      tokens,
      reviewerNotes,
    });
  }

  // -------------------------------------------------------------------------
  // Synthesis Helpers (Audit-Assisted Mode)
  // -------------------------------------------------------------------------

  /**
   * Synthesizes a ColorPalette from moodboard direction color seeds.
   * When no moodboard direction data is available, returns a minimal palette.
   */
  private synthesizeColorPaletteFromDrafts(
    moodboardDirection: MoodboardDirectionDraft | null
  ): ColorPalette {
    if (!moodboardDirection || moodboardDirection.color_seeds.length === 0) {
      return { colors: [], generationRationale: 'No color data available from audit-assisted mode.' };
    }

    const roles: Array<'primary' | 'secondary' | 'accent' | 'neutral-light' | 'neutral-dark' | 'background'> = [
      'primary', 'secondary', 'accent', 'neutral-light', 'neutral-dark', 'background',
    ];
    const colors = moodboardDirection.color_seeds.slice(0, 6).map((seed, idx) => ({
      role: roles[idx] ?? ('primary' as const),
      color: {
        hex: seed.hex,
        rgb: hexToRgb(seed.hex),
        hsl: hexToHsl(seed.hex),
      },
      rationale: `${seed.name} - ${seed.role}`,
    }));

    return {
      colors,
      generationRationale: 'Synthesized from audit-assisted moodboard direction color seeds.',
    };
  }

  /**
   * Synthesizes TypographyResult from moodboard direction.
   */
  private synthesizeTypographyFromDrafts(
    moodboardDirection: MoodboardDirectionDraft | null
  ): TypographyResult {
    if (!moodboardDirection || moodboardDirection.typography_direction.length === 0) {
      return {
        pairings: [{
          heading: { family: 'Inter', weight: 700, style: 'normal', source: 'google-fonts' },
          body: { family: 'Inter', weight: 400, style: 'normal', source: 'google-fonts' },
          rationale: 'Default pairing — no typography data from audit.',
        }],
      };
    }

    const headingDir = moodboardDirection.typography_direction.find((t) => t.category === 'heading');
    const bodyDir = moodboardDirection.typography_direction.find((t) => t.category === 'body');

    return {
      pairings: [{
        heading: {
          family: headingDir?.suggestion ?? 'Inter',
          weight: 700,
          style: 'normal',
          source: 'google-fonts',
        },
        body: {
          family: bodyDir?.suggestion ?? 'Inter',
          weight: 400,
          style: 'normal',
          source: 'google-fonts',
        },
        rationale: [
          headingDir?.rationale ?? 'Default heading',
          bodyDir?.rationale ?? 'Default body',
        ].join('; '),
      }],
    };
  }

  /**
   * Synthesizes a MoodboardManifest from moodboard direction.
   * In audit-assisted mode, images may not have been generated yet,
   * so this creates a placeholder manifest from visual direction tags.
   */
  private synthesizeMoodboardFromDrafts(
    moodboardDirection: MoodboardDirectionDraft | null
  ): MoodboardManifest {
    if (!moodboardDirection) {
      return { images: [], sourceKeywords: [], imageCount: 0 };
    }
    // Audit-assisted mode may not have actual images yet.
    // Create placeholder entries from visual direction tags.
    const images = moodboardDirection.visual_direction_tags.slice(0, 8).map((tag, idx) => ({
      prompt: tag.description,
      r2Key: `brand-assets/placeholder/moodboard/${idx}.jpg`,
      width: 1024,
      height: 1024,
      index: idx,
    }));
    return {
      images,
      sourceKeywords: moodboardDirection.visual_direction_tags.map((t) => t.tag),
      imageCount: images.length,
    };
  }

  /**
   * Synthesizes BrandVoiceDefinition from a BrandVoiceDraft.
   */
  private synthesizeVoiceFromDraft(
    brandVoiceDraft: BrandVoiceDraft | null
  ): BrandVoiceDefinition {
    if (!brandVoiceDraft) {
      return {
        toneScales: [],
        vocabularyGuide: { useWords: [], avoidWords: [] },
        communicationGuidelines: [],
      };
    }
    return {
      toneScales: brandVoiceDraft.tone_spectrum.map((ts) => ({
        dimension: ts.dimension,
        leftPole: 'Formal',
        rightPole: 'Casual',
        position: ts.position,
      })),
      vocabularyGuide: {
        useWords: brandVoiceDraft.vocabulary_examples
          .filter((v) => v.frequency !== 'rare')
          .map((v) => v.word),
        avoidWords: [],
      },
      communicationGuidelines: brandVoiceDraft.communication_guidelines.map(
        (g) => `${g.type === 'do' ? 'DO' : "DON'T"}: ${g.guideline}`
      ),
    };
  }

  /**
   * Synthesizes a basic TokensDraft from color palette and typography.
   */
  private synthesizeTokensFromDrafts(
    colorPalette: ColorPalette,
    typography: TypographyResult
  ): TokensDraft {
    const colorTokens: Record<string, unknown> = {};
    for (const c of colorPalette.colors) {
      colorTokens[c.role] = {
        $value: c.color.hex,
        $type: 'color',
        $description: c.rationale,
      };
    }

    const typographyTokens: Record<string, unknown> = {};
    if (typography.pairings.length > 0) {
      const pairing = typography.pairings[0];
      typographyTokens['heading-family'] = {
        $value: pairing.heading.family,
        $type: 'fontFamily',
      };
      typographyTokens['body-family'] = {
        $value: pairing.body.family,
        $type: 'fontFamily',
      };
    }

    return {
      color: colorTokens as Record<string, never>,
      typography: typographyTokens as Record<string, never>,
    };
  }

  /** Cleans up resources (e.g. voice auto-save timer). */
  dispose(): void {
    this.voiceReviewer?.dispose();
  }
}

// ---------------------------------------------------------------------------
// Hex Conversion Helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  return {
    r: parseInt(cleaned.substring(0, 2), 16) || 0,
    g: parseInt(cleaned.substring(2, 4), 16) || 0,
    b: parseInt(cleaned.substring(4, 6), 16) || 0,
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rNorm) h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  else if (max === gNorm) h = ((bNorm - rNorm) / d + 2) / 6;
  else h = ((rNorm - gNorm) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
