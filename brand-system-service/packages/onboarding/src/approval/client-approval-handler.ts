/**
 * Client Approval Handler (BSS-7.8).
 *
 * Orchestrates the client-facing approval flow:
 * - Loads approved direction from R2
 * - Generates static HTML preview page
 * - Processes client approval (writes to R2, updates ClickUp)
 * - Processes change requests (writes to R2, updates ClickUp)
 *
 * ClickUp failures are always non-blocking (logged but do not fail the operation).
 *
 * @module onboarding/approval/client-approval-handler
 */

import type { ApprovedDirection } from '../review/review-types';
import type {
  ApprovalFlowResult,
  ApprovalR2Client,
  ApprovalClickUpClient,
  ChangeRequest,
  ClientApproval,
  ClientApprovalHandlerDeps,
  ClientPreviewData,
} from './approval-types';
import {
  buildApprovedDirectionR2Key,
  buildClientApprovalR2Key,
  CLICKUP_CLIENT_APPROVED,
  CLICKUP_CHANGES_REQUESTED,
  APPROVAL_CONFIRMATION_TEXT,
} from './approval-types';
import { PreviewGenerator } from './preview-generator';

// ---------------------------------------------------------------------------
// ClientApprovalHandler
// ---------------------------------------------------------------------------

/**
 * Handles the client-facing brand direction approval flow.
 *
 * Responsibilities:
 * 1. Load the approved direction from R2.
 * 2. Generate a self-contained HTML preview page.
 * 3. Process client approval (mark as approved, trigger BSS-7.9).
 * 4. Process change requests with structured feedback.
 */
export class ClientApprovalHandler {
  private readonly r2Client: ApprovalR2Client;
  private readonly clickUpClient?: ApprovalClickUpClient;
  private readonly clickUpTaskId?: string;
  private readonly previewGenerator: PreviewGenerator;

  constructor(deps: ClientApprovalHandlerDeps) {
    this.r2Client = deps.r2Client;
    this.clickUpClient = deps.clickUpClient;
    this.clickUpTaskId = deps.clickUpTaskId;
    this.previewGenerator = new PreviewGenerator(deps.r2Client);
  }

  /**
   * Load the approved direction from R2.
   *
   * @param clientId - The client identifier.
   * @returns The approved direction, or null if not found.
   */
  async loadApprovedDirection(clientId: string): Promise<ApprovedDirection | null> {
    const r2Key = buildApprovedDirectionR2Key(clientId);
    return this.r2Client.downloadJson<ApprovedDirection>(r2Key);
  }

  /**
   * Generate a static HTML preview page and store it in R2.
   *
   * Loads the approved direction, converts it to preview data,
   * generates the HTML, and uploads to R2.
   *
   * @param clientId - The client identifier.
   * @returns ApprovalFlowResult with the R2 key of the stored preview.
   */
  async generatePreviewPage(clientId: string): Promise<ApprovalFlowResult> {
    try {
      const direction = await this.loadApprovedDirection(clientId);

      if (!direction) {
        return {
          success: false,
          clickUpUpdated: false,
          error: `Approved direction not found for client: ${clientId}`,
        };
      }

      const previewData: ClientPreviewData = {
        clientId: direction.client_id,
        colorPalette: direction.color_palette,
        typography: direction.typography,
        moodboardApprovedKeys: direction.moodboard_approved_keys,
        voiceDefinition: direction.voice_definition,
        tokens: direction.tokens,
        reviewerNotes: direction.reviewer_notes,
      };

      const r2Key = await this.previewGenerator.generateAndStore(clientId, previewData);

      return {
        success: true,
        r2Key,
        clickUpUpdated: false,
      };
    } catch (error) {
      return {
        success: false,
        clickUpUpdated: false,
        error: `Failed to generate preview page: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process a client approval.
   *
   * Validates the confirmation checkbox, writes the approval record to R2,
   * and updates ClickUp (non-blocking on ClickUp failure).
   *
   * @param params - Approval parameters including confirmation state.
   * @returns ApprovalFlowResult with the R2 key of the approval record.
   */
  async approve(params: {
    readonly clientId: string;
    readonly clientName?: string;
    readonly clientEmail?: string;
    readonly confirmationChecked: boolean;
  }): Promise<ApprovalFlowResult> {
    // Validate confirmation checkbox
    if (!params.confirmationChecked) {
      return {
        success: false,
        clickUpUpdated: false,
        error: `Client must confirm: "${APPROVAL_CONFIRMATION_TEXT}"`,
      };
    }

    const now = new Date().toISOString();
    const approvalRecord: ClientApproval = {
      client_id: params.clientId,
      approved: true,
      approved_at: now,
      client_name: params.clientName,
      client_email: params.clientEmail,
      approved_for_setup: true,
    };

    const r2Key = buildClientApprovalR2Key(params.clientId);

    try {
      await this.r2Client.uploadJson(r2Key, approvalRecord);
    } catch (error) {
      return {
        success: false,
        clickUpUpdated: false,
        error: `Failed to write client-approval.json to R2: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // ClickUp updates are non-blocking
    let clickUpUpdated = false;
    if (this.clickUpClient && this.clickUpTaskId) {
      try {
        await this.clickUpClient.addComment(
          this.clickUpTaskId,
          `Client approved brand direction at ${now}.`
        );
        await this.clickUpClient.updateTaskStatus(
          this.clickUpTaskId,
          CLICKUP_CLIENT_APPROVED
        );
        clickUpUpdated = true;
      } catch {
        // ClickUp failure is non-critical; R2 write succeeded
        clickUpUpdated = false;
      }
    }

    return {
      success: true,
      r2Key,
      clickUpUpdated,
    };
  }

  /**
   * Process change requests from the client.
   *
   * Validates that at least one section has a non-empty feedback comment,
   * writes the change request record to R2, and posts structured feedback
   * to ClickUp (non-blocking on ClickUp failure).
   *
   * @param params - Change request parameters.
   * @returns ApprovalFlowResult with the R2 key of the change request record.
   */
  async requestChanges(params: {
    readonly clientId: string;
    readonly changeRequests: ChangeRequest[];
  }): Promise<ApprovalFlowResult> {
    // Validate at least one non-empty feedback
    const validRequests = params.changeRequests.filter(
      (cr) => cr.feedback.trim().length > 0
    );

    if (validRequests.length === 0) {
      return {
        success: false,
        clickUpUpdated: false,
        error: 'At least one section must have a non-empty feedback comment',
      };
    }

    const now = new Date().toISOString();
    const approvalRecord: ClientApproval = {
      client_id: params.clientId,
      approved: false,
      approved_at: now,
      approved_for_setup: false,
      change_requests: validRequests,
    };

    const r2Key = buildClientApprovalR2Key(params.clientId);

    try {
      await this.r2Client.uploadJson(r2Key, approvalRecord);
    } catch (error) {
      return {
        success: false,
        clickUpUpdated: false,
        error: `Failed to write client-approval.json to R2: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // ClickUp updates are non-blocking
    let clickUpUpdated = false;
    if (this.clickUpClient && this.clickUpTaskId) {
      try {
        const comment = this.formatChangeRequestComment(validRequests);
        await this.clickUpClient.addComment(this.clickUpTaskId, comment);
        await this.clickUpClient.updateTaskStatus(
          this.clickUpTaskId,
          CLICKUP_CHANGES_REQUESTED
        );
        clickUpUpdated = true;
      } catch {
        // ClickUp failure is non-critical; R2 write succeeded
        clickUpUpdated = false;
      }
    }

    return {
      success: true,
      r2Key,
      clickUpUpdated,
    };
  }

  /**
   * Format change requests as a structured ClickUp markdown comment.
   *
   * Each section gets its own heading with the client feedback underneath.
   *
   * @param requests - The list of change requests to format.
   * @returns Formatted markdown string for ClickUp comment.
   */
  formatChangeRequestComment(requests: ChangeRequest[]): string {
    const header = '## Client Change Requests\n\n';
    const sections = requests
      .map((cr) => `### ${cr.section.charAt(0).toUpperCase() + cr.section.slice(1)}\n${cr.feedback}`)
      .join('\n\n');

    return header + sections;
  }
}
