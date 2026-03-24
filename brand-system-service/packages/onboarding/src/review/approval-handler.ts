/**
 * Approval Handler (BSS-7.7, AC 9-10).
 *
 * Validates that all review sections are complete, assembles the
 * approved-direction.json, writes it to R2, and updates ClickUp status.
 *
 * @module onboarding/review/approval-handler
 */

import type { ColorPalette, TypographyPairing, BrandVoiceDefinition, TokensDraft } from '../analysis/analysis-types';
import type {
  ApprovedDirection,
  OnboardingMode,
  ReviewR2Client,
  ReviewClickUpClient,
  ReviewSectionId,
  ReviewSectionState,
} from './review-types';
import { buildApprovedDirectionR2Key } from './review-types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** All section IDs that must be saved before approval. */
export const REQUIRED_SECTIONS: readonly ReviewSectionId[] = [
  'color_palette',
  'typography',
  'moodboard',
  'voice_definition',
  'token_draft',
] as const;

/** Checks whether all required sections are in 'saved' status. */
export function areAllSectionsSaved(
  sections: Record<ReviewSectionId, ReviewSectionState>
): boolean {
  return REQUIRED_SECTIONS.every((id) => sections[id].status === 'saved');
}

/** ClickUp status value for "Ready for Client Review". */
export const CLICKUP_READY_FOR_CLIENT_REVIEW = 'Ready for Client Review' as const;

// ---------------------------------------------------------------------------
// Approval Data
// ---------------------------------------------------------------------------

/** Data needed to build the approved direction. */
export interface ApprovalData {
  readonly clientId: string;
  readonly mode: OnboardingMode;
  readonly colorPalette: ColorPalette;
  readonly typography: TypographyPairing;
  readonly moodboardApprovedKeys: string[];
  readonly voiceDefinition: BrandVoiceDefinition;
  readonly tokens: TokensDraft;
  readonly reviewerNotes?: string;
}

/** Result of the approval operation. */
export interface ApprovalResult {
  readonly success: boolean;
  readonly approvedDirection?: ApprovedDirection;
  readonly r2Key?: string;
  readonly clickUpUpdated: boolean;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Approval Handler
// ---------------------------------------------------------------------------

/**
 * ApprovalHandler orchestrates the final approval step.
 *
 * 1. Validates all sections are complete.
 * 2. Assembles the ApprovedDirection object.
 * 3. Writes approved-direction.json to R2.
 * 4. Updates ClickUp task status to "Ready for Client Review".
 */
export class ApprovalHandler {
  private readonly r2Client: ReviewR2Client;
  private readonly clickUpClient?: ReviewClickUpClient;
  private readonly clickUpTaskId?: string;

  constructor(deps: {
    r2Client: ReviewR2Client;
    clickUpClient?: ReviewClickUpClient;
    clickUpTaskId?: string;
  }) {
    this.r2Client = deps.r2Client;
    this.clickUpClient = deps.clickUpClient;
    this.clickUpTaskId = deps.clickUpTaskId;
  }

  /**
   * Validates that all section conditions are met.
   * Returns a list of missing requirements (empty if all met).
   */
  validateSections(
    sections: Record<ReviewSectionId, ReviewSectionState>,
    moodboardApprovedCount: number
  ): string[] {
    const missing: string[] = [];

    if (sections.color_palette.status !== 'saved') {
      missing.push('Color palette must be saved');
    }
    if (sections.typography.status !== 'saved') {
      missing.push('Typography pairing must be selected and saved');
    }
    if (sections.moodboard.status !== 'saved') {
      missing.push('Moodboard curation must be saved');
    }
    if (moodboardApprovedCount < 4) {
      missing.push('At least 4 moodboard images must be approved');
    }
    if (sections.voice_definition.status !== 'saved') {
      missing.push('Voice definition must be saved');
    }
    if (sections.token_draft.status !== 'saved') {
      missing.push('Token draft must be saved');
    }

    return missing;
  }

  /**
   * Builds the ApprovedDirection object from review data.
   */
  buildApprovedDirection(data: ApprovalData): ApprovedDirection {
    return {
      client_id: data.clientId,
      approved_at: new Date().toISOString(),
      onboarding_mode: data.mode,
      color_palette: data.colorPalette,
      typography: data.typography,
      moodboard_approved_keys: data.moodboardApprovedKeys,
      voice_definition: data.voiceDefinition,
      tokens: data.tokens,
      reviewer_notes: data.reviewerNotes,
    };
  }

  /**
   * Executes the approval workflow:
   * 1. Build approved direction.
   * 2. Write to R2.
   * 3. Update ClickUp status.
   */
  async approve(data: ApprovalData): Promise<ApprovalResult> {
    const approvedDirection = this.buildApprovedDirection(data);
    const r2Key = buildApprovedDirectionR2Key(data.clientId);

    try {
      // Write approved-direction.json to R2
      await this.r2Client.uploadJson(r2Key, approvedDirection);
    } catch (error) {
      return {
        success: false,
        error: `Failed to write approved-direction.json to R2: ${error instanceof Error ? error.message : 'Unknown error'}`,
        clickUpUpdated: false,
      };
    }

    // Update ClickUp status (non-blocking if not configured)
    let clickUpUpdated = false;
    if (this.clickUpClient && this.clickUpTaskId) {
      try {
        await this.clickUpClient.updateTaskStatus(
          this.clickUpTaskId,
          CLICKUP_READY_FOR_CLIENT_REVIEW
        );
        clickUpUpdated = true;
      } catch {
        // ClickUp failure is non-critical; R2 write succeeded
        clickUpUpdated = false;
      }
    }

    return {
      success: true,
      approvedDirection,
      r2Key,
      clickUpUpdated,
    };
  }
}
