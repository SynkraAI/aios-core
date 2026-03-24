/**
 * GDPR soft delete — moves assets to a recoverable _deleted/ path.
 * 7-day retention before permanent deletion eligibility.
 *
 * @module gdpr/soft-delete
 */

import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

import { GDPR_PATHS } from './types';
import { appendAuditLog } from './audit-log';

/**
 * Soft-delete an asset by moving it to the _deleted/ prefix.
 * The asset becomes inaccessible via signed URLs but is retained
 * for 7 days before permanent deletion eligibility.
 *
 * @param clientId - Client identifier
 * @param r2Key - Original R2 key (e.g., "clientId/01-brand-identity/logo.svg")
 * @param r2Client - Configured S3Client
 * @param bucket - R2 bucket name
 * @param logPath - Optional audit log path
 */
export async function softDeleteAsset(
  clientId: string,
  r2Key: string,
  r2Client: S3Client,
  bucket: string,
  logPath?: string,
): Promise<void> {
  // Validate: cannot soft-delete from _deleted/ or _backups/
  if (r2Key.includes(`/${GDPR_PATHS.DELETED_PREFIX}/`)) {
    throw new Error('Cannot soft-delete an already-deleted asset');
  }
  if (r2Key.includes(`/${GDPR_PATHS.BACKUPS_PREFIX}/`)) {
    throw new Error('Cannot soft-delete a backup asset');
  }

  // Validate: key must belong to this client
  if (!r2Key.startsWith(`${clientId}/`)) {
    throw new Error(`Asset key does not belong to client "${clientId}"`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  // Build deleted path: {clientId}/_deleted/{rest-of-path}-{timestamp}
  const relativePath = r2Key.slice(clientId.length + 1); // Remove "clientId/"
  const deletedKey = `${clientId}/${GDPR_PATHS.DELETED_PREFIX}/${relativePath}-${timestamp}`;

  // Step 1: Copy to _deleted/ path
  await r2Client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${r2Key}`,
      Key: deletedKey,
    }),
  );

  // Step 2: Delete original
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: r2Key,
    }),
  );

  // Step 3: Audit log
  const retentionUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  appendAuditLog(
    'SOFT_DELETE',
    clientId,
    { r2Key, deletedKey, retentionUntil },
    undefined,
    logPath,
  );
}
