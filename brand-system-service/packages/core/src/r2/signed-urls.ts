/**
 * Signed URL generation for R2 assets.
 * Two-tier expiry: 15min for API/preview, 1h for client download per NFR-1.6.
 *
 * @module r2/signed-urls
 */

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Logger } from '../logger';

import { validatePath } from './path-validator';
import { withRetry } from './retry';
import type { SignedUrlPurpose } from './types';
import { SIGNED_URL_EXPIRY } from './types';

/**
 * Generate a signed download URL for an R2 object.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier for path validation
 * @param r2Key - The R2 object key
 * @param purpose - 'api' (15min) or 'download' (1h)
 * @param logger - Optional logger
 * @returns Signed URL string
 * @throws BSSError if path validation fails
 */
export async function generateSignedDownloadUrl(
  client: S3Client,
  bucket: string,
  clientId: string,
  r2Key: string,
  purpose: SignedUrlPurpose = 'download',
  logger?: Logger,
): Promise<string> {
  const validation = validatePath(clientId, r2Key);
  if (!validation.valid) {
    throw new Error(`Path validation failed: ${validation.error}`);
  }

  const expiresIn = SIGNED_URL_EXPIRY[purpose];

  logger?.debug('Generating signed download URL', {
    bucket,
    key: r2Key,
    purpose,
    expiresIn,
  });

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: r2Key,
  });

  return withRetry(() => getSignedUrl(client, command, { expiresIn }), logger);
}

/**
 * Generate a signed upload URL for putting an object in R2.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier for path validation
 * @param r2Key - The R2 object key
 * @param contentType - MIME type of the file to upload
 * @param logger - Optional logger
 * @returns Signed upload URL string
 * @throws BSSError if path validation fails
 */
export async function generateSignedUploadUrl(
  client: S3Client,
  bucket: string,
  clientId: string,
  r2Key: string,
  contentType: string,
  logger?: Logger,
): Promise<string> {
  const validation = validatePath(clientId, r2Key);
  if (!validation.valid) {
    throw new Error(`Path validation failed: ${validation.error}`);
  }

  const expiresIn = SIGNED_URL_EXPIRY.api; // 15min for uploads

  logger?.debug('Generating signed upload URL', {
    bucket,
    key: r2Key,
    contentType,
    expiresIn,
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: r2Key,
    ContentType: contentType,
  });

  return withRetry(() => getSignedUrl(client, command, { expiresIn }), logger);
}
