/**
 * GDPR module barrel exports.
 *
 * @module gdpr
 */

// Types
export type {
  ExportResult,
  GdprRequest,
  GdprRequestType,
  GdprRequestStatus,
  AuditEventType,
  AuditLogEntry,
  AuditVerificationResult,
  RetentionReport,
} from './types';

export { GDPR_PATHS, RETENTION_PERIODS } from './types';

// Audit log
export { appendAuditLog, verifyAuditLog } from './audit-log';

// Data export
export { exportClientData } from './export';

// Soft delete
export { softDeleteAsset } from './soft-delete';

// Permanent delete
export { permanentDeleteAsset, permanentDeleteClient } from './permanent-delete';

// GDPR request tracking
export { createGdprRequest, getGdprRequest, updateGdprRequestStatus } from './gdpr-requests';

// Retention policy
export { enforceRetentionPolicy } from './retention';
