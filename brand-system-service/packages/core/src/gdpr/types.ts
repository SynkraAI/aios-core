/**
 * GDPR Compliance types and interfaces.
 *
 * @module gdpr/types
 */

/** Result of a client data export operation. */
export interface ExportResult {
  readonly exportPath: string;
  readonly downloadUrl: string;
  readonly assetCount: number;
  readonly totalSizeBytes: number;
  readonly generatedAt: string;
}

/** GDPR request types per Articles 12, 17, 20. */
export type GdprRequestType = 'export' | 'delete' | 'rectification';

/** GDPR request processing status. */
export type GdprRequestStatus = 'pending' | 'processing' | 'complete' | 'failed';

/** GDPR data subject request tracker. */
export interface GdprRequest {
  readonly requestId: string;
  readonly clientId: string;
  readonly type: GdprRequestType;
  readonly status: GdprRequestStatus;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly deadlineAt: string;
  readonly details: Record<string, unknown>;
}

/** Audit log event types. */
export type AuditEventType =
  | 'SOFT_DELETE'
  | 'PERMANENT_DELETE'
  | 'DATA_EXPORT'
  | 'GDPR_REQUEST_CREATED'
  | 'GDPR_REQUEST_COMPLETED';

/** Immutable audit log entry with checksum chain. */
export interface AuditLogEntry {
  readonly timestamp: string;
  readonly event: AuditEventType;
  readonly clientId: string;
  readonly actorId?: string;
  readonly details: Record<string, unknown>;
  readonly previousChecksum: string;
  readonly checksum: string;
}

/** Report from retention policy enforcement. */
export interface RetentionReport {
  readonly scanned: number;
  readonly permanentlyDeleted: number;
  readonly backupsDeleted: number;
  readonly errors: string[];
}

/** Audit log verification result. */
export interface AuditVerificationResult {
  readonly valid: boolean;
  readonly entries: number;
  readonly firstCorruptedAt?: number;
}

/** GDPR path constants. */
export const GDPR_PATHS = {
  DELETED_PREFIX: '_deleted',
  BACKUPS_PREFIX: '_backups',
  EXPORTS_PREFIX: '_exports',
  AUDIT_LOG: 'output/logs/audit.jsonl',
  GDPR_REQUESTS_DIR: 'output/gdpr-requests',
  BACKUP_STATE: 'output/.backup-state.json',
} as const;

/** Retention periods in milliseconds. */
export const RETENTION_PERIODS = {
  SOFT_DELETE_DAYS: 7,
  SOFT_DELETE_MS: 7 * 24 * 60 * 60 * 1000,
  BACKUP_DAYS: 30,
  BACKUP_MS: 30 * 24 * 60 * 60 * 1000,
  GDPR_RESPONSE_DAYS: 30,
  GDPR_RESPONSE_MS: 30 * 24 * 60 * 60 * 1000,
  EXPORT_URL_EXPIRY_SECONDS: 3600,
} as const;
