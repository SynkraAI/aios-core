/**
 * Client Approval Flow module (BSS-7.8).
 *
 * @module onboarding/approval
 */

// Client Approval Handler
export { ClientApprovalHandler } from './client-approval-handler';

// Preview Generator
export { PreviewGenerator } from './preview-generator';

// Types
export type {
  ClientApprovalSection,
  ChangeRequest,
  ClientApproval,
  ClientPreviewData,
  ApprovalFlowResult,
  ApprovalR2Client,
  ApprovalClickUpClient,
  ClientApprovalHandlerDeps,
} from './approval-types';

// Constants & Key Builders
export {
  CLIENT_APPROVAL_SECTIONS,
  CLICKUP_CLIENT_APPROVED,
  CLICKUP_CHANGES_REQUESTED,
  PREVIEW_DISCLAIMER,
  APPROVAL_CONFIRMATION_TEXT,
  buildClientApprovalR2Key,
  buildClientPreviewR2Key,
  buildApprovedDirectionR2Key,
} from './approval-types';
