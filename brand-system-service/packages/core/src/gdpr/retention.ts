/**
 * Retention policy enforcement — cleans up expired soft-deleted assets and old backups.
 * Designed to run as a scheduled job or manual trigger.
 *
 * @module gdpr/retention
 */

import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

import type { RetentionReport } from './types';
import { GDPR_PATHS, RETENTION_PERIODS } from './types';
import { appendAuditLog } from './audit-log';

/**
 * Enforce retention policy:
 * - Permanently delete soft-deleted assets older than 7 days
 * - Delete backups older than 30 days
 *
 * @param r2Client - Configured S3Client
 * @param bucket - R2 bucket name
 * @param logPath - Optional audit log path
 * @returns Retention enforcement report
 */
export async function enforceRetentionPolicy(
  r2Client: S3Client,
  bucket: string,
  logPath?: string,
): Promise<RetentionReport> {
  const now = Date.now();
  let scanned = 0;
  let permanentlyDeleted = 0;
  let backupsDeleted = 0;
  const errors: string[] = [];

  // Scan _deleted/ across all client prefixes
  try {
    const deletedItems = await listAllWithPrefix(r2Client, bucket, '');
    const deletedKeys = deletedItems.filter((item) =>
      item.key.includes(`/${GDPR_PATHS.DELETED_PREFIX}/`),
    );

    scanned += deletedKeys.length;

    for (const item of deletedKeys) {
      const deletedAt = extractDeletedTimestamp(item.key);
      if (!deletedAt) continue;

      const elapsed = now - deletedAt.getTime();
      if (elapsed >= RETENTION_PERIODS.SOFT_DELETE_MS) {
        try {
          await r2Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.key }));
          permanentlyDeleted++;
        } catch (err) {
          errors.push(
            `Failed to delete ${item.key}: ${err instanceof Error ? err.message : 'unknown'}`,
          );
        }
      }
    }
  } catch (err) {
    errors.push(`Failed to scan _deleted/: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  // Scan _backups/ for expired backups
  try {
    const allItems = await listAllWithPrefix(r2Client, bucket, '');
    const backupKeys = allItems.filter((item) =>
      item.key.includes(`/${GDPR_PATHS.BACKUPS_PREFIX}/`),
    );

    scanned += backupKeys.length;

    for (const item of backupKeys) {
      const backupDate = extractBackupDate(item.key);
      if (!backupDate) continue;

      const elapsed = now - backupDate.getTime();
      if (elapsed >= RETENTION_PERIODS.BACKUP_MS) {
        try {
          await r2Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.key }));
          backupsDeleted++;
        } catch (err) {
          errors.push(
            `Failed to delete backup ${item.key}: ${err instanceof Error ? err.message : 'unknown'}`,
          );
        }
      }
    }
  } catch (err) {
    errors.push(`Failed to scan _backups/: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  // Audit log
  if (permanentlyDeleted > 0 || backupsDeleted > 0) {
    appendAuditLog(
      'PERMANENT_DELETE',
      'system',
      {
        scope: 'retention-policy',
        permanentlyDeleted,
        backupsDeleted,
        scanned,
        errors: errors.length,
      },
      'retention-job',
      logPath,
    );
  }

  return { scanned, permanentlyDeleted, backupsDeleted, errors };
}

/** List all objects with a given prefix. */
async function listAllWithPrefix(
  r2Client: S3Client,
  bucket: string,
  prefix: string,
): Promise<Array<{ key: string }>> {
  const items: Array<{ key: string }> = [];
  let continuationToken: string | undefined;

  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const obj of response.Contents ?? []) {
      if (obj.Key) {
        items.push({ key: obj.Key });
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return items;
}

/**
 * Extract deleted-at timestamp from soft-deleted key.
 * Format: ...filename-YYYY-MM-DDTHH-MM-SS-mmmZ
 */
function extractDeletedTimestamp(key: string): Date | null {
  const match = key.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)$/);
  if (!match) return null;

  const isoString = match[1].replace(
    /^(\d{4}-\d{2}-\d{2}T\d{2})-(\d{2})-(\d{2})-(\d{3}Z)$/,
    '$1:$2:$3.$4',
  );

  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Extract backup date from backup key.
 * Format: _backups/YYYY-MM-DD/...
 */
function extractBackupDate(key: string): Date | null {
  const match = key.match(/_backups\/(\d{4}-\d{2}-\d{2})\//);
  if (!match) return null;

  const date = new Date(match[1] + 'T00:00:00.000Z');
  return isNaN(date.getTime()) ? null : date;
}
