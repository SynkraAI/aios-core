/**
 * R2 Storage Module — Cloudflare R2 asset storage via S3-compatible API.
 *
 * @module r2
 */

// Client
export { createR2Client, r2ConfigFromEnv } from './client';

// Signed URLs
export { generateSignedDownloadUrl, generateSignedUploadUrl } from './signed-urls';

// Upload
export { uploadAsset, uploadAssetWithPreview } from './upload';

// Download
export { getDownloadUrl, downloadAsset } from './download';

// Operations (delete, list, folder creation)
export {
  deleteAsset,
  listAssets,
  createClientFolderStructure,
  listClientAssets,
} from './operations';
export type { ListClientAssetsOptions } from './operations';

// Asset naming and metadata
export {
  normalizeAssetFilename,
  buildAssetMetadata,
  assetMetadataToRecord,
  folderToAssetType,
} from './asset-naming';
export type { NormalizeOptions, AssetMetadata } from './asset-naming';

// Path validation
export { validatePath, validateFile, buildR2Key } from './path-validator';
export type { PathValidationResult } from './path-validator';

// Retry
export { withRetry, isRetryableError } from './retry';

// Types
export type {
  R2Config,
  UploadResult,
  UploadOptions,
  ListOptions,
  ListResult,
  ObjectInfo,
  SignedUrlPurpose,
  RetryConfig,
  FileValidationConfig,
  AssetFolder,
} from './types';

export {
  SIGNED_URL_EXPIRY,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_FILE_VALIDATION,
  ASSET_FOLDERS,
} from './types';
