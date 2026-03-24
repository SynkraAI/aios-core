/**
 * Types for the BSS Onboarding Intake Flow.
 *
 * Covers all 6 intake steps: Company Basics, Brand Personality,
 * Visual Preferences, Asset Upload, Competitor URLs, Deliverable Selection.
 *
 * @module onboarding/types
 */

// ---------------------------------------------------------------------------
// Step 1: Company Basics
// ---------------------------------------------------------------------------

/** Company basic information collected in Step 1. */
export interface CompanyBasics {
  readonly companyName: string;
  readonly industry: string;
  readonly targetAudience: string;
  readonly tagline: string;
  readonly foundingYear: number;
}

// ---------------------------------------------------------------------------
// Step 2: Brand Personality (5-point scales)
// ---------------------------------------------------------------------------

/** Valid range for personality scale values: 1 through 5 inclusive. */
export type PersonalityScaleValue = 1 | 2 | 3 | 4 | 5;

/** A single personality scale dimension with its two poles. */
export interface PersonalityScale {
  readonly dimension: string;
  readonly leftPole: string;
  readonly rightPole: string;
  readonly value: PersonalityScaleValue;
}

/** Brand personality captured via 5-point scales per AC-3. */
export interface BrandPersonality {
  readonly formalCasual: PersonalityScaleValue;
  readonly traditionalInnovative: PersonalityScaleValue;
  readonly seriousPlayful: PersonalityScaleValue;
  readonly minimalExpressive: PersonalityScaleValue;
  readonly localGlobal: PersonalityScaleValue;
}

/** All personality dimension keys. */
export const PERSONALITY_DIMENSIONS = [
  'formalCasual',
  'traditionalInnovative',
  'seriousPlayful',
  'minimalExpressive',
  'localGlobal',
] as const;

export type PersonalityDimension = (typeof PERSONALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Step 3: Visual Preferences (mood tiles)
// ---------------------------------------------------------------------------

/** A pre-defined mood tile that users can select. */
export interface MoodTile {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly keywords: readonly string[];
}

/** Visual preferences — selected mood tiles. Min 2, max 3. */
export interface VisualPreference {
  readonly selectedMoodIds: readonly string[];
}

// ---------------------------------------------------------------------------
// Step 4: Asset Upload
// ---------------------------------------------------------------------------

/** Allowed file extensions for logo upload. */
export const ALLOWED_LOGO_EXTENSIONS = ['.svg', '.png', '.ai'] as const;

/** Allowed MIME types for logo upload. */
export const ALLOWED_LOGO_MIME_TYPES = [
  'image/svg+xml',
  'image/png',
  'application/postscript',
] as const;

/** Maximum file size per upload: 10 MB. */
export const MAX_ASSET_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Metadata about an uploaded asset file. */
export interface AssetFileInfo {
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly r2Key?: string;
}

/** Assets collected in Step 4. */
export interface AssetUpload {
  readonly primaryLogo: AssetFileInfo;
  readonly secondaryLogo?: AssetFileInfo;
  readonly brandColors: readonly string[];
  readonly fontNames: readonly string[];
}

// ---------------------------------------------------------------------------
// Step 5: Competitor URLs
// ---------------------------------------------------------------------------

/** Competitor URL entry. */
export interface CompetitorUrl {
  readonly url: string;
  readonly notes?: string;
}

/** Competitor URLs collected in Step 5. Min 2, max 5. */
export interface CompetitorUrls {
  readonly urls: readonly CompetitorUrl[];
}

// ---------------------------------------------------------------------------
// Step 6: Deliverable Selection
// ---------------------------------------------------------------------------

/** All available BSS deliverable types. */
export const BSS_DELIVERABLE_TYPES = [
  'brand-book',
  'design-tokens',
  'social-media-templates',
  'brand-voice-guide',
  'landing-page',
  'bio-link-page',
  'email-templates',
  'presentation-templates',
  'content-calendar',
  'ad-creatives',
  'brand-guidelines-pdf',
  'logo-variations',
] as const;

export type BSSDeliverableType = (typeof BSS_DELIVERABLE_TYPES)[number];

/** Deliverables selected in Step 6. At least one required. */
export interface DeliverableSelection {
  readonly selected: readonly BSSDeliverableType[];
}

// ---------------------------------------------------------------------------
// Intake Step Tracking
// ---------------------------------------------------------------------------

/** Intake step identifiers in sequence order. */
export const INTAKE_STEPS = [
  'company-basics',
  'brand-personality',
  'visual-preferences',
  'asset-upload',
  'competitor-urls',
  'deliverable-selection',
] as const;

export type IntakeStepId = (typeof INTAKE_STEPS)[number];

/** Maps step number (1-6) to step identifier. */
export const STEP_NUMBER_MAP: Record<number, IntakeStepId> = {
  1: 'company-basics',
  2: 'brand-personality',
  3: 'visual-preferences',
  4: 'asset-upload',
  5: 'competitor-urls',
  6: 'deliverable-selection',
} as const;

/** Total number of intake steps. */
export const TOTAL_STEPS = 6;

/** Average minutes per step for progress estimation (AC-9). */
export const AVG_MINUTES_PER_STEP = 2.5;

// ---------------------------------------------------------------------------
// Complete Intake Form Data
// ---------------------------------------------------------------------------

/** Complete intake form data across all 6 steps. */
export interface IntakeFormData {
  readonly companyBasics: CompanyBasics;
  readonly brandPersonality: BrandPersonality;
  readonly visualPreferences: VisualPreference;
  readonly assetUpload: AssetUpload;
  readonly competitorUrls: CompetitorUrls;
  readonly deliverableSelection: DeliverableSelection;
}

// ---------------------------------------------------------------------------
// Intake Record (persisted to R2)
// ---------------------------------------------------------------------------

/** Intake record persisted as JSON to R2 under onboarding/intake.json. */
export interface IntakeRecord {
  readonly version: '1.0';
  readonly clientId: string;
  readonly sessionToken: string;
  readonly submittedAt: string;
  readonly intakeData: IntakeFormData;
  readonly metadata: IntakeMetadata;
}

/** Metadata about the intake session. */
export interface IntakeMetadata {
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMinutes: number;
  readonly stepTimings: Record<IntakeStepId, number>;
  readonly clickupTaskId?: string;
  readonly clickupTaskUrl?: string;
}

// ---------------------------------------------------------------------------
// Session Persistence (save-and-resume)
// ---------------------------------------------------------------------------

/** Session state for save-and-resume (AC-8). */
export interface IntakeSession {
  readonly clientId: string;
  readonly sessionToken: string;
  readonly currentStep: IntakeStepId;
  readonly completedSteps: readonly IntakeStepId[];
  readonly partialData: Partial<IntakeFormData>;
  readonly startedAt: string;
  readonly lastUpdatedAt: string;
}

// ---------------------------------------------------------------------------
// Progress Indicator (AC-9)
// ---------------------------------------------------------------------------

/** Progress information for display. */
export interface IntakeProgress {
  readonly currentStepNumber: number;
  readonly totalSteps: number;
  readonly currentStepId: IntakeStepId;
  readonly completedSteps: readonly IntakeStepId[];
  readonly estimatedRemainingMinutes: number;
}

// ---------------------------------------------------------------------------
// ClickUp Integration (AC-2)
// ---------------------------------------------------------------------------

/** ClickUp task creation/update payload. */
export interface ClickUpTaskPayload {
  readonly name: string;
  readonly description: string;
  readonly customFields: readonly ClickUpCustomField[];
}

/** ClickUp custom field value. */
export interface ClickUpCustomField {
  readonly id: string;
  readonly value: string | number | boolean | readonly string[];
}

/** Result of a ClickUp task operation. */
export interface ClickUpTaskResult {
  readonly taskId: string;
  readonly taskUrl: string;
}

/** Interface for ClickUp API client — injected as dependency. */
export interface ClickUpClient {
  createTask(listId: string, payload: ClickUpTaskPayload): Promise<ClickUpTaskResult>;
  updateTask(taskId: string, payload: Partial<ClickUpTaskPayload>): Promise<ClickUpTaskResult>;
}

// ---------------------------------------------------------------------------
// R2 Storage Interface (for dependency injection)
// ---------------------------------------------------------------------------

/** Interface for R2 storage operations — injected as dependency. */
export interface R2StorageClient {
  uploadJson(key: string, data: unknown): Promise<{ key: string }>;
  uploadFile(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string,
  ): Promise<{ key: string }>;
  getJson<T>(key: string): Promise<T | null>;
}

// ---------------------------------------------------------------------------
// Session Storage Interface (for save-and-resume)
// ---------------------------------------------------------------------------

/** Interface for session persistence — callers provide implementation. */
export interface SessionStorage {
  save(sessionToken: string, session: IntakeSession): Promise<void>;
  load(sessionToken: string): Promise<IntakeSession | null>;
  delete(sessionToken: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Submission Result
// ---------------------------------------------------------------------------

/** Result of a complete intake submission. */
export interface IntakeSubmissionResult {
  readonly success: boolean;
  readonly clientId: string;
  readonly sessionToken: string;
  readonly r2Key: string;
  readonly clickUpTaskId?: string;
  readonly clickUpTaskUrl?: string;
  readonly summary: IntakeFormData;
}

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

/** Validation result for a form step or complete form. */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
}

/** A single validation error. */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}
