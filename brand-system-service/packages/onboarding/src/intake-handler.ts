/**
 * IntakeHandler — Multi-step intake form handler for BSS onboarding.
 *
 * Manages the 6-step intake flow: Company Basics, Brand Personality,
 * Visual Preferences, Asset Upload, Competitor URLs, Deliverable Selection.
 *
 * Supports:
 * - Step-by-step form progression with validation
 * - Save-and-resume via session persistence (AC-8)
 * - ClickUp task creation on submission (AC-2)
 * - R2 storage of intake.json (AC-10)
 * - Progress tracking (AC-9)
 * - Confirmation summary generation (AC-10)
 *
 * @module onboarding/intake-handler
 */

import { BSSError } from '@bss/core';

import type {
  IntakeFormData,
  IntakeSession,
  IntakeProgress,
  IntakeRecord,
  IntakeSubmissionResult,
  IntakeStepId,
  ClickUpClient,
  ClickUpTaskPayload,
  R2StorageClient,
  SessionStorage,
  CompanyBasics,
  BrandPersonality,
  VisualPreference,
  AssetUpload,
  CompetitorUrls,
  DeliverableSelection,
  ValidationResult,
  IntakeMetadata,
} from './types';
import {
  INTAKE_STEPS,
  TOTAL_STEPS,
  AVG_MINUTES_PER_STEP,
} from './types';
import {
  validateCompanyBasics,
  validateBrandPersonality,
  validateVisualPreferences,
  validateAssetUploadStep,
  validateCompetitorUrlsStep,
  validateDeliverableSelection,
  validateIntakeFormData,
} from './validators/form-validators';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Error for intake-specific failures. */
export class IntakeError extends BSSError {
  constructor(message: string) {
    super(message, 'INTAKE_ERROR');
    this.name = 'IntakeError';
  }
}

/** Error for validation failures. */
export class IntakeValidationError extends BSSError {
  public readonly validationErrors: ValidationResult['errors'];

  constructor(message: string, errors: ValidationResult['errors']) {
    super(message, 'INTAKE_VALIDATION_ERROR');
    this.name = 'IntakeValidationError';
    this.validationErrors = errors;
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for IntakeHandler. */
export interface IntakeHandlerConfig {
  /** ClickUp list ID where tasks are created. */
  readonly clickUpListId: string;
  /** R2 bucket path prefix for this client's onboarding data. */
  readonly r2PathPrefix: string;
}

/** Dependencies injected into IntakeHandler. */
export interface IntakeHandlerDependencies {
  readonly r2Client: R2StorageClient;
  readonly clickUpClient: ClickUpClient;
  readonly sessionStorage: SessionStorage;
}

// ---------------------------------------------------------------------------
// IntakeHandler
// ---------------------------------------------------------------------------

/**
 * Multi-step intake form handler.
 *
 * Usage:
 * 1. Create handler with config and dependencies
 * 2. Start new session or resume existing one
 * 3. Submit step data one at a time
 * 4. Call submit() when all steps complete
 */
export class IntakeHandler {
  private readonly config: IntakeHandlerConfig;
  private readonly deps: IntakeHandlerDependencies;

  constructor(config: IntakeHandlerConfig, deps: IntakeHandlerDependencies) {
    this.config = config;
    this.deps = deps;
  }

  // -----------------------------------------------------------------------
  // Session Management (AC-8)
  // -----------------------------------------------------------------------

  /**
   * Start a new intake session.
   *
   * @param clientId - Client identifier
   * @returns New session with token
   */
  async startSession(clientId: string): Promise<IntakeSession> {
    const sessionToken = generateSessionToken();
    const now = new Date().toISOString();

    const session: IntakeSession = {
      clientId,
      sessionToken,
      currentStep: INTAKE_STEPS[0],
      completedSteps: [],
      partialData: {},
      startedAt: now,
      lastUpdatedAt: now,
    };

    await this.deps.sessionStorage.save(sessionToken, session);
    return session;
  }

  /**
   * Resume an existing intake session (AC-8).
   *
   * @param sessionToken - Token from a previous session
   * @returns Restored session or null if not found
   */
  async resumeSession(sessionToken: string): Promise<IntakeSession | null> {
    return this.deps.sessionStorage.load(sessionToken);
  }

  /**
   * Generate a resume URL for the current session (AC-8).
   *
   * @param baseUrl - Base URL of the intake form
   * @param session - Current session
   * @returns Resume URL with query params
   */
  generateResumeUrl(baseUrl: string, session: IntakeSession): string {
    const params = new URLSearchParams({
      client_id: session.clientId,
      session_token: session.sessionToken,
    });
    return `${baseUrl}?${params.toString()}`;
  }

  // -----------------------------------------------------------------------
  // Step Submission
  // -----------------------------------------------------------------------

  /**
   * Submit data for a specific intake step.
   *
   * Validates the step data and persists it to the session.
   * Returns the updated session.
   *
   * @param sessionToken - Active session token
   * @param step - Which step is being submitted
   * @param data - Step data
   * @returns Updated session
   * @throws IntakeValidationError if validation fails
   * @throws IntakeError if session not found
   */
  async submitStep(
    sessionToken: string,
    step: IntakeStepId,
    data: CompanyBasics | BrandPersonality | VisualPreference | AssetUpload | CompetitorUrls | DeliverableSelection,
  ): Promise<IntakeSession> {
    const session = await this.deps.sessionStorage.load(sessionToken);
    if (!session) {
      throw new IntakeError(`Session not found: ${sessionToken}`);
    }

    // Validate step data
    const validation = this.validateStep(step, data);
    if (!validation.valid) {
      throw new IntakeValidationError(
        `Validation failed for step "${step}"`,
        validation.errors,
      );
    }

    // Update session with step data
    const updatedPartialData = { ...session.partialData };
    switch (step) {
      case 'company-basics':
        updatedPartialData.companyBasics = data as CompanyBasics;
        break;
      case 'brand-personality':
        updatedPartialData.brandPersonality = data as BrandPersonality;
        break;
      case 'visual-preferences':
        updatedPartialData.visualPreferences = data as VisualPreference;
        break;
      case 'asset-upload':
        updatedPartialData.assetUpload = data as AssetUpload;
        break;
      case 'competitor-urls':
        updatedPartialData.competitorUrls = data as CompetitorUrls;
        break;
      case 'deliverable-selection':
        updatedPartialData.deliverableSelection = data as DeliverableSelection;
        break;
    }

    // Mark step as completed if not already
    const completedSteps = session.completedSteps.includes(step)
      ? session.completedSteps
      : [...session.completedSteps, step];

    // Advance to next step
    const currentStepIndex = INTAKE_STEPS.indexOf(step);
    const nextStep =
      currentStepIndex < INTAKE_STEPS.length - 1
        ? INTAKE_STEPS[currentStepIndex + 1]
        : step;

    const updatedSession: IntakeSession = {
      ...session,
      currentStep: nextStep,
      completedSteps,
      partialData: updatedPartialData,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this.deps.sessionStorage.save(sessionToken, updatedSession);
    return updatedSession;
  }

  // -----------------------------------------------------------------------
  // Step Validation
  // -----------------------------------------------------------------------

  /**
   * Validate data for a specific step.
   *
   * @param step - Step identifier
   * @param data - Step data to validate
   * @returns Validation result
   */
  validateStep(
    step: IntakeStepId,
    data: unknown,
  ): ValidationResult {
    switch (step) {
      case 'company-basics':
        return validateCompanyBasics(data as CompanyBasics);
      case 'brand-personality':
        return validateBrandPersonality(data as BrandPersonality);
      case 'visual-preferences':
        return validateVisualPreferences(data as VisualPreference);
      case 'asset-upload':
        return validateAssetUploadStep(data as AssetUpload);
      case 'competitor-urls':
        return validateCompetitorUrlsStep(data as CompetitorUrls);
      case 'deliverable-selection':
        return validateDeliverableSelection(data as DeliverableSelection);
      default:
        return {
          valid: false,
          errors: [{ field: 'step', message: `Unknown step: ${String(step)}`, code: 'UNKNOWN_STEP' }],
        };
    }
  }

  // -----------------------------------------------------------------------
  // Progress (AC-9)
  // -----------------------------------------------------------------------

  /**
   * Get progress information for a session (AC-9).
   *
   * @param session - Current session
   * @returns Progress with step info and estimated remaining time
   */
  getProgress(session: IntakeSession): IntakeProgress {
    const currentStepNumber = INTAKE_STEPS.indexOf(session.currentStep) + 1;
    const remainingSteps = TOTAL_STEPS - session.completedSteps.length;
    const estimatedRemainingMinutes = remainingSteps * AVG_MINUTES_PER_STEP;

    return {
      currentStepNumber,
      totalSteps: TOTAL_STEPS,
      currentStepId: session.currentStep,
      completedSteps: session.completedSteps,
      estimatedRemainingMinutes,
    };
  }

  // -----------------------------------------------------------------------
  // Final Submission (AC-2, AC-10)
  // -----------------------------------------------------------------------

  /**
   * Submit the complete intake form.
   *
   * This:
   * 1. Validates all form data
   * 2. Uploads intake.json to R2 (AC-10)
   * 3. Creates ClickUp task (AC-2)
   * 4. Returns submission result with summary
   *
   * @param sessionToken - Active session token
   * @returns Submission result
   * @throws IntakeValidationError if form data is incomplete/invalid
   * @throws IntakeError if submission fails
   */
  async submit(sessionToken: string): Promise<IntakeSubmissionResult> {
    const session = await this.deps.sessionStorage.load(sessionToken);
    if (!session) {
      throw new IntakeError(`Session not found: ${sessionToken}`);
    }

    // Verify all steps are completed
    const missingSteps = INTAKE_STEPS.filter(
      (step) => !session.completedSteps.includes(step),
    );
    if (missingSteps.length > 0) {
      throw new IntakeError(
        `Cannot submit: steps not completed: ${missingSteps.join(', ')}`,
      );
    }

    // Build complete form data
    const formData = session.partialData as IntakeFormData;

    // Validate complete form
    const validation = validateIntakeFormData(formData);
    if (!validation.valid) {
      throw new IntakeValidationError(
        'Complete form validation failed',
        validation.errors,
      );
    }

    const now = new Date().toISOString();
    const startedAt = session.startedAt;
    const durationMs = new Date(now).getTime() - new Date(startedAt).getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    // Build intake record
    const metadata: IntakeMetadata = {
      startedAt,
      completedAt: now,
      durationMinutes,
      stepTimings: buildEmptyStepTimings(),
    };

    // Upload intake.json to R2 (AC-10)
    const r2Key = `${this.config.r2PathPrefix}/${session.clientId}/onboarding/intake.json`;
    const intakeRecord: IntakeRecord = {
      version: '1.0',
      clientId: session.clientId,
      sessionToken: session.sessionToken,
      submittedAt: now,
      intakeData: formData,
      metadata,
    };

    let r2Result: { key: string };
    try {
      r2Result = await this.deps.r2Client.uploadJson(r2Key, intakeRecord);
    } catch (error) {
      throw new IntakeError(
        `Failed to upload intake record to R2: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Create ClickUp task (AC-2) — graceful degradation per NFR-9.6
    let clickUpTaskId: string | undefined;
    let clickUpTaskUrl: string | undefined;
    try {
      const clickUpPayload = buildClickUpPayload(session.clientId, formData);
      const clickUpResult = await this.deps.clickUpClient.createTask(
        this.config.clickUpListId,
        clickUpPayload,
      );
      clickUpTaskId = clickUpResult.taskId;
      clickUpTaskUrl = clickUpResult.taskUrl;

      // Update metadata with ClickUp info
      const updatedRecord: IntakeRecord = {
        ...intakeRecord,
        metadata: {
          ...intakeRecord.metadata,
          clickupTaskId: clickUpResult.taskId,
          clickupTaskUrl: clickUpResult.taskUrl,
        },
      };
      // Re-upload with ClickUp task info
      await this.deps.r2Client.uploadJson(r2Key, updatedRecord);
    } catch {
      // Graceful degradation per NFR-9.6: ClickUp failure does not block submission
      // Intake record is already saved to R2
    }

    // Clean up session
    await this.deps.sessionStorage.delete(sessionToken);

    return {
      success: true,
      clientId: session.clientId,
      sessionToken: session.sessionToken,
      r2Key: r2Result.key,
      clickUpTaskId,
      clickUpTaskUrl,
      summary: formData,
    };
  }

  // -----------------------------------------------------------------------
  // Confirmation Summary (AC-10)
  // -----------------------------------------------------------------------

  /**
   * Generate a read-only summary of all submitted fields (AC-10).
   *
   * @param formData - Complete form data
   * @returns Summary object with all fields formatted for display
   */
  generateSummary(formData: IntakeFormData): IntakeFormSummary {
    return {
      companyName: formData.companyBasics.companyName,
      industry: formData.companyBasics.industry,
      targetAudience: formData.companyBasics.targetAudience,
      tagline: formData.companyBasics.tagline,
      foundingYear: formData.companyBasics.foundingYear,
      personality: {
        formalCasual: formData.brandPersonality.formalCasual,
        traditionalInnovative: formData.brandPersonality.traditionalInnovative,
        seriousPlayful: formData.brandPersonality.seriousPlayful,
        minimalExpressive: formData.brandPersonality.minimalExpressive,
        localGlobal: formData.brandPersonality.localGlobal,
      },
      selectedMoods: [...formData.visualPreferences.selectedMoodIds],
      primaryLogoFilename: formData.assetUpload.primaryLogo.filename,
      secondaryLogoFilename: formData.assetUpload.secondaryLogo?.filename,
      brandColors: [...formData.assetUpload.brandColors],
      fontNames: [...formData.assetUpload.fontNames],
      competitorUrls: formData.competitorUrls.urls.map((entry) => entry.url),
      deliverables: [...formData.deliverableSelection.selected],
    };
  }
}

// ---------------------------------------------------------------------------
// Summary Type
// ---------------------------------------------------------------------------

/** Read-only summary for the confirmation screen (AC-10). */
export interface IntakeFormSummary {
  readonly companyName: string;
  readonly industry: string;
  readonly targetAudience: string;
  readonly tagline: string;
  readonly foundingYear: number;
  readonly personality: {
    readonly formalCasual: number;
    readonly traditionalInnovative: number;
    readonly seriousPlayful: number;
    readonly minimalExpressive: number;
    readonly localGlobal: number;
  };
  readonly selectedMoods: readonly string[];
  readonly primaryLogoFilename: string;
  readonly secondaryLogoFilename?: string;
  readonly brandColors: readonly string[];
  readonly fontNames: readonly string[];
  readonly competitorUrls: readonly string[];
  readonly deliverables: readonly string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a unique session token.
 */
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `intake-${timestamp}-${random}`;
}

/**
 * Build empty step timings record.
 */
function buildEmptyStepTimings(): Record<IntakeStepId, number> {
  return {
    'company-basics': 0,
    'brand-personality': 0,
    'visual-preferences': 0,
    'asset-upload': 0,
    'competitor-urls': 0,
    'deliverable-selection': 0,
  };
}

/**
 * Build ClickUp task payload from intake data (AC-2).
 */
function buildClickUpPayload(
  clientId: string,
  formData: IntakeFormData,
): ClickUpTaskPayload {
  const moods = formData.visualPreferences.selectedMoodIds.join(', ');
  const deliverables = formData.deliverableSelection.selected.join(', ');
  const competitors = formData.competitorUrls.urls.map((u) => u.url).join('\n');

  const description = [
    `# Brand Intake: ${formData.companyBasics.companyName}`,
    '',
    `**Industry:** ${formData.companyBasics.industry}`,
    `**Target Audience:** ${formData.companyBasics.targetAudience}`,
    `**Tagline:** ${formData.companyBasics.tagline}`,
    `**Founded:** ${formData.companyBasics.foundingYear}`,
    '',
    '## Brand Personality',
    `- Formal/Casual: ${formData.brandPersonality.formalCasual}/5`,
    `- Traditional/Innovative: ${formData.brandPersonality.traditionalInnovative}/5`,
    `- Serious/Playful: ${formData.brandPersonality.seriousPlayful}/5`,
    `- Minimal/Expressive: ${formData.brandPersonality.minimalExpressive}/5`,
    `- Local/Global: ${formData.brandPersonality.localGlobal}/5`,
    '',
    `## Visual Moods: ${moods}`,
    '',
    `## Competitors`,
    competitors,
    '',
    `## Deliverables: ${deliverables}`,
  ].join('\n');

  return {
    name: `Brand Intake: ${formData.companyBasics.companyName} (${clientId})`,
    description,
    customFields: [],
  };
}
