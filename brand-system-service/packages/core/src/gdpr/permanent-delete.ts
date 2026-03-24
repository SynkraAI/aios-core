/**
 * GDPR permanent deletion with audit trail.
 * Implements GDPR Article 17 (Right to erasure).
 *
 * @module gdpr/permanent-delete
 */

import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

import { GDPR_PATHS, RETENTION_PERIODS } from './types';
import { appendAuditLog } from './audit-log';

/**
 * Permanently delete a soft-deleted asset after retention period.
 * Verifies the asset is in _deleted/ and the 7-day retention has elapsed.
 *
 * @param clientId - Client identifier
 * @param deletedKey - Key in _deleted/ prefix
 * @param r2Client - Configured S3Client
 * @param bucket - R2 bucket name
 * @param requestedBy - Actor ID for audit trail
 * @param logPath - Optional audit log path
 */
export async function permanentDeleteAsset(
  clientId: string,
  deletedKey: string,
  r2Client: S3Client,
  bucket: string,
  requestedBy?: string,
  logPath?: string,
): Promise<void> {
  // Validate: must be in _deleted/ prefix
  if (!deletedKey.includes(`/${GDPR_PATHS.DELETED_PREFIX}/`)) {
    throw new Error('Can only permanently delete assets in the _deleted/ prefix');
  }

  // Validate: must belong to this client
  if (!deletedKey.startsWith(`${clientId}/`)) {
    throw new Error(`Asset key does not belong to client "${clientId}"`);
  }

  // Validate: 7-day retention period
  const deletedAt = extractTimestamp(deletedKey);
  if (deletedAt) {
    const elapsed = Date.now() - deletedAt.getTime();
    if (elapsed < RETENTION_PERIODS.SOFT_DELETE_MS) {
      const remainingDays = Math.ceil(
        (RETENTION_PERIODS.SOFT_DELETE_MS - elapsed) / (24 * 60 * 60 * 1000),
      );
      throw new Error(
        `Retention period not elapsed. ${remainingDays} day(s) remaining before permanent deletion.`,
      );
    }
  }

  // Delete from R2
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: deletedKey,
    }),
  );

  // Audit log (immutable — not deleted with client data)
  appendAuditLog('PERMANENT_DELETE', clientId, { deletedKey }, requestedBy, logPath);
}

/**
 * Permanently delete all client data from R2.
 * Removes all objects under {clientId}/ including _deleted/.
 * Audit log is NOT deleted (retained for compliance).
 *
 * @param clientId - Client identifier
 * @param r2Client - Configured S3Client
 * @param bucket - R2 bucket name
 * @param requestedBy - Actor ID for audit trail
 * @param logPath - Optional audit log path
 */
export async function permanentDeleteClient(
  clientId: string,
  r2Client: S3Client,
  bucket: string,
  requestedBy?: string,
  logPath?: string,
): Promise<void> {
  let continuationToken: string | undefined;
  let deletedCount = 0;

  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${clientId}/`,
        ContinuationToken: continuationToken,
      }),
    );

    for (const obj of response.Contents ?? []) {
      if (!obj.Key) continue;

      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: obj.Key,
        }),
      );
      deletedCount++;
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  // Audit log (immutable — retained for compliance)
  appendAuditLog(
    'PERMANENT_DELETE',
    clientId,
    { scope: 'full-client', deletedObjects: deletedCount },
    requestedBy,
    logPath,
  );
}

/**
 * Extract timestamp from a soft-deleted key suffix.
 * Expected format: "...-YYYY-MM-DDTHH-MM-SS-mmmZ"
 */
function extractTimestamp(key: string): Date | null {
  // Match ISO-like timestamp appended to deleted key
  const match = key.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)$/);
  if (!match) return null;

  // Convert back from filename-safe format to ISO
  const isoString = match[1].replace(
    /^(\d{4}-\d{2}-\d{2}T\d{2})-(\d{2})-(\d{2})-(\d{3}Z)$/,
    '$1:$2:$3.$4',
  );

  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
}
