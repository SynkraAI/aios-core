/**
 * Types for the Client Approval Flow (BSS-7.8).
 *
 * Defines the client-facing approval interfaces, change request structures,
 * preview page data shapes, R2 key builders, and DI contracts.
 *
 * @module onboarding/approval/approval-types
 */

import type {
  ColorPalette,
  TypographyPairing,
  BrandVoiceDefinition,
  TokensDraft,
} from '../analysis/analysis-types';

// ---------------------------------------------------------------------------
// Client Approval Section Identifiers
// ---------------------------------------------------------------------------

/** Identifiers for each section a client can provide feedback on. */
export type ClientApprovalSection = 'color' | 'typography' | 'moodboard' | 'voice' | 'other';

/** All valid client approval section IDs. */
export const CLIENT_APPROVAL_SECTIONS: readonly ClientApprovalSection[] = [
  'color',
  'typography',
  'moodboard',
  'voice',
  'other',
] as const;

// ---------------------------------------------------------------------------
// Change Request
// ---------------------------------------------------------------------------

/** A single change request from the client, scoped to a section. */
export interface ChangeRequest {
  readonly section: ClientApprovalSection;
  readonly feedback: string;
}

// ---------------------------------------------------------------------------
// Client Approval Record (written to R2)
// ---------------------------------------------------------------------------

/** Client approval record persisted to R2. */
export interface ClientApproval {
  readonly client_id: string;
  readonly approved: boolean;
  readonly approved_at: string; // ISO 8601
  readonly client_name?: string;
  readonly client_email?: string;
  /** When true, triggers BSS-7.9 full production setup. */
  readonly approved_for_setup: boolean;
  readonly change_requests?: ChangeRequest[];
}

// ---------------------------------------------------------------------------
// Preview Page Data
// ---------------------------------------------------------------------------

/** All data needed to generate the static HTML client preview. */
export interface ClientPreviewData {
  readonly clientId: string;
  readonly colorPalette: ColorPalette;
  readonly typography: TypographyPairing;
  readonly moodboardApprovedKeys: string[];
  readonly voiceDefinition: BrandVoiceDefinition;
  readonly tokens: TokensDraft;
  readonly reviewerNotes?: string;
}

// ---------------------------------------------------------------------------
// Approval Flow Result
// ---------------------------------------------------------------------------

/** Result of an approval or change request submission. */
export interface ApprovalFlowResult {
  readonly success: boolean;
  readonly r2Key?: string;
  readonly clickUpUpdated: boolean;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// DI Interfaces
// ---------------------------------------------------------------------------

/** R2 storage client interface for the approval module. */
export interface ApprovalR2Client {
  downloadJson<T>(key: string): Promise<T | null>;
  uploadJson(key: string, data: unknown): Promise<{ key: string }>;
  uploadFile(key: string, body: Buffer | Uint8Array, contentType: string): Promise<{ key: string }>;
}

/** ClickUp client interface for the approval module. */
export interface ApprovalClickUpClient {
  updateTaskStatus(taskId: string, status: string): Promise<void>;
  addComment(taskId: string, comment: string): Promise<void>;
}

/** Dependencies injected into the ClientApprovalHandler. */
export interface ClientApprovalHandlerDeps {
  readonly r2Client: ApprovalR2Client;
  readonly clickUpClient?: ApprovalClickUpClient;
  readonly clickUpTaskId?: string;
}

// ---------------------------------------------------------------------------
// R2 Key Builders
// ---------------------------------------------------------------------------

/**
 * Build R2 key for the client approval record.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for client-approval.json.
 */
export function buildClientApprovalR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/client-approval.json`;
}

/**
 * Build R2 key for the client preview HTML page.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for the preview index.html.
 */
export function buildClientPreviewR2Key(clientId: string): string {
  return `brand-assets/${clientId}/client-preview/index.html`;
}

/**
 * Build R2 key for the approved direction file.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for approved-direction.json.
 */
export function buildApprovedDirectionR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/approved-direction.json`;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** ClickUp status when client has approved. */
export const CLICKUP_CLIENT_APPROVED = 'Client Approved' as const;

/** ClickUp status when client has requested changes. */
export const CLICKUP_CHANGES_REQUESTED = 'Changes Requested' as const;

/** Footer disclaimer shown on the client preview page (AC-8). */
export const PREVIEW_DISCLAIMER = 'This is a brand direction preview for internal review purposes only. Colors and typography may appear differently across devices and print media. Final production assets will be calibrated to exact brand specifications.' as const;

/** Confirmation text the client must agree to when approving. */
export const APPROVAL_CONFIRMATION_TEXT =
  'I confirm this brand direction is approved for full production.' as const;
