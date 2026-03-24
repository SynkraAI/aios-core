/**
 * R2 operations: delete, list, folder creation, and client asset listing.
 *
 * @module r2/operations
 */

import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

import type { Logger } from '../logger';

import { validatePath } from './path-validator';
import { withRetry } from './retry';
import type { AssetFolder, ListOptions, ListResult, ObjectInfo } from './types';
import { ASSET_FOLDERS } from './types';

/**
 * Delete an object from R2.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier for path validation
 * @param r2Key - The R2 object key to delete
 * @param logger - Optional logger
 */
export async function deleteAsset(
  client: S3Client,
  bucket: string,
  clientId: string,
  r2Key: string,
  logger?: Logger,
): Promise<void> {
  const validation = validatePath(clientId, r2Key);
  if (!validation.valid) {
    throw new Error(`Path validation failed: ${validation.error}`);
  }

  logger?.info('Deleting asset from R2', { bucket, key: r2Key });

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: r2Key,
  });

  await withRetry(() => client.send(command), logger);

  logger?.info('Asset deleted successfully', { key: r2Key });
}

/**
 * List objects in R2 under a client's path prefix.
 *
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param clientId - Client identifier (list is scoped to client prefix)
 * @param options - List options (prefix, maxKeys, continuationToken)
 * @param logger - Optional logger
 * @returns List of objects with pagination info
 */
export async function listAssets(
  client: S3Client,
  bucket: string,
  clientId: string,
  options: ListOptions = {},
  logger?: Logger,
): Promise<ListResult> {
  // Build the full prefix scoped to the client
  const fullPrefix = options.prefix ? `${clientId}/${options.prefix}` : `${clientId}/`;

  // Validate the prefix path for security (traversal, null bytes, client prefix).
  // For listing at client-root level (prefix = "clientId/"), we use a valid
  // folder placeholder so folder membership check passes.
  // For folder-scoped listing, the folder is already in the prefix.
  const validationKey =
    fullPrefix === `${clientId}/`
      ? `${clientId}/${ASSET_FOLDERS[0]}/.keep`
      : fullPrefix.endsWith('/')
        ? `${fullPrefix}.keep`
        : fullPrefix;
  const validation = validatePath(clientId, validationKey);
  if (!validation.valid) {
    throw new Error(`Path validation failed: ${validation.error}`);
  }

  logger?.debug('Listing assets in R2', {
    bucket,
    prefix: fullPrefix,
    maxKeys: options.maxKeys,
  });

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: fullPrefix,
    MaxKeys: options.maxKeys ?? 1000,
    ContinuationToken: options.continuationToken,
  });

  const response = await withRetry(() => client.send(command), logger);

  const objects: ObjectInfo[] = (response.Contents ?? []).map((obj) => ({
    key: obj.Key ?? '',
    size: obj.Size ?? 0,
    lastModified: obj.LastModified ?? new Date(),
    etag: obj.ETag,
  }));

  return {
    objects,
    isTruncated: response.IsTruncated ?? false,
    nextContinuationToken: response.NextContinuationToken,
  };
}

/**
 * Create the standard folder structure for a new client in R2.
 *
 * Uploads a `.keep` placeholder object to each of the 10 ASSET_FOLDERS
 * under the client prefix. Idempotent — safe to call multiple times
 * (PutObject overwrites the placeholder without side effects).
 *
 * @param clientId - Client identifier
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param logger - Optional logger
 * @returns Array of created folder paths
 */
export async function createClientFolderStructure(
  clientId: string,
  client: S3Client,
  bucket: string,
  logger?: Logger,
): Promise<string[]> {
  if (!clientId || clientId.trim() === '') {
    throw new Error('Client ID cannot be empty.');
  }

  logger?.info('Creating folder structure for client', {
    clientId,
    bucket,
    folderCount: ASSET_FOLDERS.length,
  });

  const createdFolders: string[] = [];

  for (const folder of ASSET_FOLDERS) {
    const key = `${clientId}/${folder}/.keep`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(''),
      ContentType: 'application/x-empty',
    });

    await withRetry(() => client.send(command), logger);

    createdFolders.push(`${clientId}/${folder}/`);
    logger?.info('Created folder placeholder', { folder, key });
  }

  logger?.info('Folder structure created successfully', {
    clientId,
    foldersCreated: createdFolders.length,
  });

  return createdFolders;
}

/** Options for listing client assets. */
export interface ListClientAssetsOptions {
  /** Specific folder to scope the listing to. */
  readonly folder?: AssetFolder;
  /** Maximum number of objects to return per page. */
  readonly maxKeys?: number;
  /** Continuation token for pagination. */
  readonly continuationToken?: string;
}

/**
 * List assets under a client prefix, optionally scoped to a specific folder.
 *
 * Provides a higher-level API over `listAssets` that integrates with
 * the ASSET_FOLDERS naming convention and supports pagination.
 *
 * @param clientId - Client identifier
 * @param client - S3Client configured for R2
 * @param bucket - R2 bucket name
 * @param options - Listing options (folder filter, pagination)
 * @param logger - Optional logger
 * @returns Paginated list of objects
 */
export async function listClientAssets(
  clientId: string,
  client: S3Client,
  bucket: string,
  options: ListClientAssetsOptions = {},
  logger?: Logger,
): Promise<ListResult> {
  const prefix = options.folder ? `${options.folder}/` : undefined;

  return listAssets(
    client,
    bucket,
    clientId,
    {
      prefix,
      maxKeys: options.maxKeys,
      continuationToken: options.continuationToken,
    },
    logger,
  );
}
