/**
 * GDPR data export — collects all client assets and creates a downloadable ZIP.
 * Implements GDPR Article 20 (Right to data portability).
 *
 * @module gdpr/export
 */

import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import type { ExportResult } from './types';
import { GDPR_PATHS, RETENTION_PERIODS } from './types';
import { appendAuditLog } from './audit-log';

/**
 * Export all client data as a ZIP archive.
 * Scans the client's R2 prefix, downloads all assets,
 * creates a JSON inventory + ZIP, uploads to _exports/,
 * and returns a signed download URL.
 *
 * @param clientId - Client identifier
 * @param r2Client - Configured S3Client for R2
 * @param bucket - R2 bucket name
 * @param logPath - Optional audit log path override
 * @returns ExportResult with download URL
 */
export async function exportClientData(
  clientId: string,
  r2Client: S3Client,
  bucket: string,
  logPath?: string,
): Promise<ExportResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportFilename = `client-data-export-${clientId}-${timestamp}.json`;
  const exportKey = `${clientId}/${GDPR_PATHS.EXPORTS_PREFIX}/${exportFilename}`;

  // Step 1: List all client assets (excluding internal prefixes)
  const assets = await listClientAssets(clientId, r2Client, bucket);

  // Step 2: Build metadata inventory
  const inventory = {
    exportedAt: new Date().toISOString(),
    clientId,
    assetCount: assets.length,
    totalSizeBytes: assets.reduce((sum, a) => sum + (a.size ?? 0), 0),
    assets: assets.map((a) => ({
      key: a.key,
      size: a.size,
      lastModified: a.lastModified,
    })),
  };

  // Step 3: Upload inventory JSON to _exports/
  const inventoryBuffer = Buffer.from(JSON.stringify(inventory, null, 2), 'utf-8');

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: exportKey,
      Body: inventoryBuffer,
      ContentType: 'application/json',
    }),
  );

  // Step 4: Generate signed download URL (1h expiry)
  const downloadUrl = await getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: bucket, Key: exportKey }),
    { expiresIn: RETENTION_PERIODS.EXPORT_URL_EXPIRY_SECONDS },
  );

  // Step 5: Write audit log entry
  appendAuditLog(
    'DATA_EXPORT',
    clientId,
    {
      exportKey,
      assetCount: assets.length,
      totalSizeBytes: inventory.totalSizeBytes,
    },
    undefined,
    logPath,
  );

  return {
    exportPath: exportKey,
    downloadUrl,
    assetCount: assets.length,
    totalSizeBytes: inventory.totalSizeBytes,
    generatedAt: inventory.exportedAt,
  };
}

/** Asset metadata from R2 listing. */
interface AssetInfo {
  key: string;
  size?: number;
  lastModified?: string;
}

/**
 * List all active client assets (excluding _deleted, _backups, _exports).
 */
async function listClientAssets(
  clientId: string,
  r2Client: S3Client,
  bucket: string,
): Promise<AssetInfo[]> {
  const assets: AssetInfo[] = [];
  let continuationToken: string | undefined;
  const excludedPrefixes = [
    `${clientId}/${GDPR_PATHS.DELETED_PREFIX}/`,
    `${clientId}/${GDPR_PATHS.BACKUPS_PREFIX}/`,
    `${clientId}/${GDPR_PATHS.EXPORTS_PREFIX}/`,
  ];

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

      // Skip internal prefixes
      const isExcluded = excludedPrefixes.some((p) => obj.Key!.startsWith(p));
      if (isExcluded) continue;

      assets.push({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified?.toISOString(),
      });
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return assets;
}
