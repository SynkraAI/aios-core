/**
 * Shared types for the R2 storage module.
 */

/** Signed URL purpose determines expiry duration. */
export type SignedUrlPurpose = 'api' | 'download';

/** Configuration for the R2 client. */
export interface R2Config {
  readonly accountId: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucketName: string;
  readonly region?: string;
}

/** Result of an upload operation. */
export interface UploadResult {
  readonly key: string;
  readonly bucket: string;
  readonly size: number;
  readonly contentType: string;
  readonly etag?: string;
}

/** Options for an upload operation. */
export interface UploadOptions {
  readonly contentType?: string;
  readonly metadata?: Record<string, string>;
  readonly cacheControl?: string;
}

/** Options for listing objects. */
export interface ListOptions {
  readonly prefix?: string;
  readonly maxKeys?: number;
  readonly continuationToken?: string;
}

/** Result of a list operation. */
export interface ListResult {
  readonly objects: ObjectInfo[];
  readonly isTruncated: boolean;
  readonly nextContinuationToken?: string;
}

/** Info about a stored object. */
export interface ObjectInfo {
  readonly key: string;
  readonly size: number;
  readonly lastModified: Date;
  readonly etag?: string;
}

/** Retry configuration. */
export interface RetryConfig {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

/** Allowed asset types and their constraints. */
export interface FileValidationConfig {
  readonly maxSizeBytes: number;
  readonly allowedExtensions: readonly string[];
  readonly allowedMimeTypes: readonly string[];
}

/** Default signed URL expiry durations in seconds. */
export const SIGNED_URL_EXPIRY = {
  api: 15 * 60, // 15 minutes per NFR-1.6
  download: 60 * 60, // 1 hour per NFR-1.6
} as const;

/** Default retry configuration. */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 200,
  maxDelayMs: 5000,
} as const;

/** Default file validation configuration. */
export const DEFAULT_FILE_VALIDATION: FileValidationConfig = {
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  allowedExtensions: [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.avif',
    '.pdf',
    '.ai',
    '.eps',
    '.psd',
    '.mp4',
    '.webm',
    '.mov',
    '.woff',
    '.woff2',
    '.ttf',
    '.otf',
    '.json',
    '.yaml',
    '.yml',
    '.css',
  ],
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/avif',
    'application/pdf',
    'application/postscript',
    'image/vnd.adobe.photoshop',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'font/woff',
    'font/woff2',
    'font/ttf',
    'font/otf',
    'application/json',
    'text/yaml',
    'text/css',
  ],
} as const;

/**
 * R2 bucket path structure per FR-8.8.
 * Used for organizing client assets.
 */
export const ASSET_FOLDERS = [
  '01-brand-identity',
  '02-design-system',
  '03-social-media',
  '04-marketing',
  '05-documents',
  '06-video',
  '07-audio',
  '08-fonts',
  '09-templates',
  '10-misc',
] as const;

export type AssetFolder = (typeof ASSET_FOLDERS)[number];
