/**
 * Asset naming convention enforcement and metadata utilities.
 *
 * @module r2/asset-naming
 */

import path from 'node:path';

import type { AssetFolder } from './types';

/** Options for filename normalization. */
export interface NormalizeOptions {
  /** Date to use for the collision-prevention suffix. Defaults to current date. */
  readonly dateSuffix?: Date;
  /** Whether to append date suffix. Defaults to true. */
  readonly appendDate?: boolean;
}

/** Asset metadata stored as R2 object user-metadata. */
export interface AssetMetadata {
  readonly clientId: string;
  readonly folder: AssetFolder;
  readonly originalFilename: string;
  readonly normalizedFilename: string;
  readonly uploadedAt: string; // ISO 8601
  readonly uploadedBy: string;
  readonly assetType: string;
  readonly fileSize: string; // Stored as string per R2/S3 metadata constraints
  readonly contentType: string;
}

/**
 * Normalize an asset filename according to naming conventions.
 *
 * Rules applied:
 * 1. Lowercase the entire filename
 * 2. Replace spaces with hyphens
 * 3. Remove special characters (keep only alphanumeric, `.`, `-`, `_`)
 * 4. Collapse consecutive hyphens into one
 * 5. Append date-based suffix (`-YYYYMMDD`) to prevent collisions
 * 6. Preserve file extension
 *
 * @param filename - Original filename
 * @param options - Normalization options
 * @returns Normalized filename
 */
export function normalizeAssetFilename(filename: string, options: NormalizeOptions = {}): string {
  if (!filename || filename.trim() === '') {
    throw new Error('Filename cannot be empty.');
  }

  const ext = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, path.extname(filename));

  // 1. Lowercase
  let normalized = basename.toLowerCase();

  // 2. Replace spaces with hyphens
  normalized = normalized.replace(/\s+/g, '-');

  // 3. Remove special characters (keep alphanumeric, hyphens, underscores)
  normalized = normalized.replace(/[^a-z0-9\-_]/g, '');

  // 4. Collapse consecutive hyphens
  normalized = normalized.replace(/-{2,}/g, '-');

  // 5. Trim leading/trailing hyphens and underscores
  normalized = normalized.replace(/^[-_]+|[-_]+$/g, '');

  // Guard against empty result after sanitization
  if (!normalized) {
    normalized = 'unnamed';
  }

  // 6. Append date suffix for collision prevention
  const appendDate = options.appendDate !== false;
  if (appendDate) {
    const date = options.dateSuffix ?? new Date();
    const suffix = formatDateSuffix(date);
    normalized = `${normalized}-${suffix}`;
  }

  return `${normalized}${ext}`;
}

/**
 * Map an AssetFolder to a human-readable asset type string.
 */
export function folderToAssetType(folder: AssetFolder): string {
  const mapping: Record<AssetFolder, string> = {
    '01-brand-identity': 'brand-identity',
    '02-design-system': 'design-system',
    '03-social-media': 'social-media',
    '04-marketing': 'marketing',
    '05-documents': 'documents',
    '06-video': 'video',
    '07-audio': 'audio',
    '08-fonts': 'fonts',
    '09-templates': 'templates',
    '10-misc': 'misc',
  };
  return mapping[folder];
}

/**
 * Build asset metadata for R2 object storage.
 * All values are strings per S3/R2 metadata constraints.
 *
 * @param params - Metadata parameters
 * @returns AssetMetadata ready for R2 object user-metadata
 */
export function buildAssetMetadata(params: {
  clientId: string;
  folder: AssetFolder;
  originalFilename: string;
  normalizedFilename: string;
  uploadedBy: string;
  fileSize: number;
  contentType: string;
}): AssetMetadata {
  return {
    clientId: params.clientId,
    folder: params.folder,
    originalFilename: params.originalFilename,
    normalizedFilename: params.normalizedFilename,
    uploadedAt: new Date().toISOString(),
    uploadedBy: params.uploadedBy,
    assetType: folderToAssetType(params.folder),
    fileSize: String(params.fileSize),
    contentType: params.contentType,
  };
}

/**
 * Convert AssetMetadata to a Record<string, string> suitable for R2 object metadata.
 */
export function assetMetadataToRecord(metadata: AssetMetadata): Record<string, string> {
  return {
    'x-bss-client-id': metadata.clientId,
    'x-bss-folder': metadata.folder,
    'x-bss-original-filename': metadata.originalFilename,
    'x-bss-normalized-filename': metadata.normalizedFilename,
    'x-bss-uploaded-at': metadata.uploadedAt,
    'x-bss-uploaded-by': metadata.uploadedBy,
    'x-bss-asset-type': metadata.assetType,
    'x-bss-file-size': metadata.fileSize,
    'x-bss-content-type': metadata.contentType,
  };
}

/**
 * Format a date as YYYYMMDD for filename suffix.
 */
function formatDateSuffix(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
