/**
 * Upload utility for R2 assets.
 * Handles path validation, file validation, and metadata attachment.
 *
 * @module r2/upload
 */

import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

import type { Logger } from '../logger';

import { validateFile, validatePath, buildR2Key } from './path-validator';
import { withRetry } from './retry';
import { generateSignedDownloadUrl } from './signed-urls';
import type { UploadOptions, UploadResult } from './types';

/**
 * Upload an asset to R2 under the client's path prefix.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier
 * @param folder - Asset folder (e.g., '01-brand-identity')
 * @param filename - File name
 * @param body - File content as Buffer or Uint8Array
 * @param options - Upload options (contentType, metadata, cacheControl)
 * @param logger - Optional logger
 * @returns Upload result with key and preview URL
 */
export async function uploadAsset(
  client: S3Client,
  bucket: string,
  clientId: string,
  folder: string,
  filename: string,
  body: Buffer | Uint8Array,
  options: UploadOptions = {},
  logger?: Logger,
): Promise<UploadResult> {
  const r2Key = buildR2Key(clientId, folder, filename);

  // Validate path security
  const pathValidation = validatePath(clientId, r2Key);
  if (!pathValidation.valid) {
    throw new Error(`Path validation failed: ${pathValidation.error}`);
  }

  // Validate file constraints
  const contentType = options.contentType ?? 'application/octet-stream';
  const fileValidation = validateFile(filename, body.length, contentType);
  if (!fileValidation.valid) {
    throw new Error(`File validation failed: ${fileValidation.error}`);
  }

  logger?.info('Uploading asset to R2', {
    bucket,
    key: r2Key,
    size: body.length,
    contentType,
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: r2Key,
    Body: body,
    ContentType: contentType,
    CacheControl: options.cacheControl,
    Metadata: options.metadata,
  });

  const response = await withRetry(() => client.send(command), logger);

  logger?.info('Asset uploaded successfully', {
    key: r2Key,
    etag: response.ETag,
  });

  return {
    key: r2Key,
    bucket,
    size: body.length,
    contentType,
    etag: response.ETag,
  };
}

/**
 * Upload an asset and return both the key and a signed preview URL.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier
 * @param folder - Asset folder
 * @param filename - File name
 * @param body - File content
 * @param options - Upload options
 * @param logger - Optional logger
 * @returns Upload result with key and preview URL
 */
export async function uploadAssetWithPreview(
  client: S3Client,
  bucket: string,
  clientId: string,
  folder: string,
  filename: string,
  body: Buffer | Uint8Array,
  options: UploadOptions = {},
  logger?: Logger,
): Promise<UploadResult & { previewUrl: string }> {
  const result = await uploadAsset(
    client,
    bucket,
    clientId,
    folder,
    filename,
    body,
    options,
    logger,
  );

  const previewUrl = await generateSignedDownloadUrl(
    client,
    bucket,
    clientId,
    result.key,
    'api',
    logger,
  );

  return { ...result, previewUrl };
}
