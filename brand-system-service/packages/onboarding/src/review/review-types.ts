/**
 * Types for the Human Review Interface (BSS-7.7).
 *
 * Defines the review state, section-level tracking, approved direction
 * output, and all review-section data shapes for color, typography,
 * moodboard, voice, and token review.
 *
 * @module onboarding/review/review-types
 */

import type { ColorPalette, PaletteColor, TypographyPairing, TypographyResult, MoodboardManifest, BrandVoiceDefinition, TokensDraft } from '../analysis/analysis-types';
import type { DraftManifest, BrandVoiceDraft, MoodboardDirectionDraft } from '../drafts/draft-types';
import type { DataQualityReport } from '../quality/quality-types';

// ---------------------------------------------------------------------------
// Onboarding Mode Detection (AC 1, DD-7.7-1)
// ---------------------------------------------------------------------------

/** Detected onboarding mode based on file existence in R2. */
export type OnboardingMode = 'standard' | 'audit_assisted';

/** Result of mode detection. */
export interface ModeDetectionResult {
  readonly mode: OnboardingMode;
  /** True if both summary files exist (edge case). */
  readonly bothExist: boolean;
  /** Warning message when both exist. */
  readonly warning?: string;
}

// ---------------------------------------------------------------------------
// Review Section Identifiers (AC 9)
// ---------------------------------------------------------------------------

/** All review section identifiers. */
export type ReviewSectionId =
  | 'color_palette'
  | 'typography'
  | 'moodboard'
  | 'voice_definition'
  | 'token_draft';

/** Status of a single review section. */
export type ReviewSectionStatus = 'not_started' | 'in_progress' | 'saved';

/** Tracking record for a single review section. */
export interface ReviewSectionState {
  readonly sectionId: ReviewSectionId;
  readonly status: ReviewSectionStatus;
  readonly lastSavedAt?: string;
  readonly hasPendingEdits: boolean;
}

// ---------------------------------------------------------------------------
// Color Palette Review (AC 2)
// ---------------------------------------------------------------------------

/** WCAG contrast pair result. */
export interface ContrastPairResult {
  readonly colorA: string; // hex
  readonly colorB: string; // hex
  readonly roleA: string;
  readonly roleB: string;
  readonly ratio: number;
  readonly passesAA: boolean;
  readonly passesAALarge: boolean;
}

/** Color review data with editable values. */
export interface ColorReviewData {
  readonly originalPalette: ColorPalette;
  readonly editedColors: PaletteColor[];
  readonly contrastPairs: ContrastPairResult[];
  readonly hasAccessibilityWarnings: boolean;
}

// ---------------------------------------------------------------------------
// Typography Review (AC 3)
// ---------------------------------------------------------------------------

/** Typography review data. */
export interface TypographyReviewData {
  readonly pairings: readonly TypographyPairing[];
  readonly selectedIndex: number | null;
}

// ---------------------------------------------------------------------------
// Moodboard Review (AC 4)
// ---------------------------------------------------------------------------

/** Status of a single moodboard image. */
export type MoodboardImageStatus = 'pending' | 'approved' | 'rejected';

/** Moodboard image with review status. */
export interface MoodboardImageReview {
  readonly r2Key: string;
  readonly prompt: string;
  readonly width: number;
  readonly height: number;
  readonly index: number;
  readonly status: MoodboardImageStatus;
}

/** Moodboard review data. */
export interface MoodboardReviewData {
  readonly images: MoodboardImageReview[];
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly meetsMinimum: boolean;
  readonly regenerationRequests: RegenerationRequest[];
}

/** Request to regenerate rejected moodboard images. */
export interface RegenerationRequest {
  readonly rejectedImageIndex: number;
  readonly reason?: string;
  readonly requestedAt: string;
}

/** Minimum number of moodboard images that must be approved. */
export const MIN_APPROVED_MOODBOARD_IMAGES = 4;

// ---------------------------------------------------------------------------
// Voice Definition Review (AC 5)
// ---------------------------------------------------------------------------

/** Editable voice definition data. */
export interface VoiceReviewData {
  readonly toneScales: EditableToneScale[];
  readonly vocabularyGuide: EditableVocabularyGuide;
  readonly communicationGuidelines: string[];
  readonly lastAutoSaveAt?: string;
  readonly isDirty: boolean;
}

/** Editable tone scale (mutable copy). */
export interface EditableToneScale {
  dimension: string;
  leftPole: string;
  rightPole: string;
  position: number;
}

/** Editable vocabulary guide (mutable copy). */
export interface EditableVocabularyGuide {
  useWords: string[];
  avoidWords: string[];
}

/** Auto-save interval in milliseconds (30 seconds). */
export const AUTO_SAVE_INTERVAL_MS = 30_000;

// ---------------------------------------------------------------------------
// Token Draft Review (AC 6)
// ---------------------------------------------------------------------------

/** Flattened token entry for table display. */
export interface FlattenedToken {
  readonly path: string;
  value: string | number;
  readonly type: string;
  readonly description?: string;
}

/** Token review data. */
export interface TokenReviewData {
  readonly flattenedTokens: FlattenedToken[];
  readonly originalDraft: TokensDraft;
  readonly hasEdits: boolean;
}

// ---------------------------------------------------------------------------
// Data Quality Warning (AC 7)
// ---------------------------------------------------------------------------

/** Data quality warning state. */
export interface DataQualityWarning {
  readonly showBanner: boolean;
  readonly criticalAlert: boolean;
  readonly lowConfidence: boolean;
  readonly report?: DataQualityReport;
}

// ---------------------------------------------------------------------------
// AI Draft Badge (AC 8)
// ---------------------------------------------------------------------------

/** Badge label for AI Draft content (NFR-9.7). */
export const AI_DRAFT_BADGE_LABEL = 'AI Draft - Requires Human Validation' as const;

// ---------------------------------------------------------------------------
// Review State (AC 9)
// ---------------------------------------------------------------------------

/** Complete review state for all sections. */
export interface ReviewState {
  readonly clientId: string;
  readonly mode: OnboardingMode;
  readonly sections: Record<ReviewSectionId, ReviewSectionState>;
  readonly dataQualityWarning: DataQualityWarning;
  readonly isAuditAssisted: boolean;
  readonly allSectionsSaved: boolean;
}

// ---------------------------------------------------------------------------
// Approved Direction Output (AC 10)
// ---------------------------------------------------------------------------

/** The approved direction package written to R2 on approval. */
export interface ApprovedDirection {
  readonly client_id: string;
  readonly approved_at: string;
  readonly onboarding_mode: OnboardingMode;
  readonly color_palette: ColorPalette;
  readonly typography: TypographyPairing;
  readonly moodboard_approved_keys: string[];
  readonly voice_definition: BrandVoiceDefinition;
  readonly tokens: TokensDraft;
  readonly reviewer_notes?: string;
}

// ---------------------------------------------------------------------------
// R2 Keys
// ---------------------------------------------------------------------------

/** Build R2 key for the approved direction file. */
export function buildApprovedDirectionR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/approved-direction.json`;
}

/** Build R2 key for analysis summary (standard mode). */
export function buildAnalysisSummaryR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/analysis-summary.json`;
}

/** Build R2 key for draft manifest (audit-assisted mode). */
export function buildDraftManifestR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/ai-drafts/index.json`;
}

/** Build R2 key for data quality report. */
export function buildDataQualityReportR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/data-quality-report.json`;
}

// ---------------------------------------------------------------------------
// Review Dependencies (DI)
// ---------------------------------------------------------------------------

/** R2 client interface for the review module. */
export interface ReviewR2Client {
  downloadJson<T>(key: string): Promise<T | null>;
  uploadJson(key: string, data: unknown): Promise<{ key: string }>;
  exists(key: string): Promise<boolean>;
}

/** ClickUp client interface for the review module. */
export interface ReviewClickUpClient {
  updateTaskStatus(taskId: string, status: string): Promise<void>;
  addComment(taskId: string, comment: string): Promise<void>;
}

/** Dependencies injected into the ReviewManager. */
export interface ReviewManagerDeps {
  readonly r2Client: ReviewR2Client;
  readonly clickUpClient?: ReviewClickUpClient;
  readonly clickUpTaskId?: string;
}
