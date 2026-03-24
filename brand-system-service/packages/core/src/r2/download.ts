/**
 * Download utility for R2 assets.
 * Generates signed download URLs scoped to client paths.
 *
 * @module r2/download
 */

import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

import type { Logger } from '../logger';

import { validatePath } from './path-validator';
import { withRetry } from './retry';
import { generateSignedDownloadUrl } from './signed-urls';
import type { SignedUrlPurpose } from './types';

/**
 * Get a signed download URL for a client asset.
 * Default expiry: 1 hour for downloads.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier for path validation
 * @param r2Key - The R2 object key
 * @param purpose - 'api' (15min) or 'download' (1h)
 * @param logger - Optional logger
 * @returns Signed download URL
 * @throws Error if key doesn't belong to clientId or object not found
 */
export async function getDownloadUrl(
  client: S3Client,
  bucket: string,
  clientId: string,
  r2Key: string,
  purpose: SignedUrlPurpose = 'download',
  logger?: Logger,
): Promise<string> {
  // Validate path belongs to client
  const validation = validatePath(clientId, r2Key);
  if (!validation.valid) {
    throw new Error(`Path validation failed: ${validation.error}`);
  }

  // Verify object exists before generating URL
  await verifyObjectExists(client, bucket, r2Key, logger);

  return generateSignedDownloadUrl(client, bucket, clientId, r2Key, purpose, logger);
}

/**
 * Download an object's content directly from R2.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier for path validation
 * @param r2Key - The R2 object key
 * @param logger - Optional logger
 * @returns Object content as Buffer and metadata
 */
export async function downloadAsset(
  client: S3Client,
  bucket: string,
  clientId: string,
  r2Key: string,
  logger?: Logger,
): Promise<{ body: Buffer; contentType: string; size: number }> {
  const validation = validatePath(clientId, r2Key);
  if (!validation.valid) {
    throw new Error(`Path validation failed: ${validation.error}`);
  }

  logger?.debug('Downloading asset from R2', { bucket, key: r2Key });

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: r2Key,
  });

  const response = await withRetry(() => client.send(command), logger);

  if (!response.Body) {
    throw new Error(`Empty response body for key: ${r2Key}`);
  }

  // Convert stream to Buffer
  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks);

  logger?.info('Asset downloaded successfully', {
    key: r2Key,
    size: body.length,
    contentType: response.ContentType,
  });

  return {
    body,
    contentType: response.ContentType ?? 'application/octet-stream',
    size: body.length,
  };
}

/**
 * Verify that an object exists in R2.
 * Throws a clear error if not found.
 */
async function verifyObjectExists(
  client: S3Client,
  bucket: string,
  r2Key: string,
  logger?: Logger,
): Promise<void> {
  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: r2Key,
  });

  try {
    await withRetry(() => client.send(command), logger);
  } catch (error) {
    const statusCode = (error as Error & { $metadata?: { httpStatusCode?: number } }).$metadata
      ?.httpStatusCode;
    if (statusCode === 404) {
      throw new Error(`Object not found: ${r2Key}`);
    }
    throw error;
  }
}
