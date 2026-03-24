# R2 Storage Module

Cloudflare R2 asset storage via S3-compatible API for the Brand System Service.

## Overview

This module provides a secure, cost-effective asset storage layer using Cloudflare R2 with zero egress fees. Assets are organized per client using a fixed folder structure and served through signed URLs with two-tier expiry.

## R2 Bucket Setup

### Prerequisites

- Cloudflare account with R2 enabled
- R2 API token with read/write permissions

### 1. Create R2 Bucket

```bash
# Via Cloudflare Dashboard:
# R2 > Create Bucket > Name: "brand-assets" > Create

# Or via Wrangler CLI:
npx wrangler r2 bucket create brand-assets
```

### 2. Create R2 API Token

1. Go to Cloudflare Dashboard > R2 > Manage R2 API Tokens
2. Create a token with Object Read & Write permissions
3. Scope it to the `brand-assets` bucket
4. Copy the Access Key ID and Secret Access Key

### 3. Configure Environment Variables

```bash
# .env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=brand-assets          # defaults to "brand-assets"
R2_REGION=auto                       # defaults to "auto"
R2_PUBLIC_URL=                        # optional: custom domain for public access
```

> **Security**: Never expose R2 credentials client-side. Use `r2ConfigFromEnv()` to load credentials from server-side environment only (NFR-5.2).

## API Reference

### Client

#### `createR2Client(config: R2Config): S3Client`

Create an S3Client configured for Cloudflare R2.

```typescript
import { createR2Client, r2ConfigFromEnv } from '@bss/core';

const config = r2ConfigFromEnv();
const client = createR2Client(config);
```

**Throws**: `ConfigError` if required config values are missing.

#### `r2ConfigFromEnv(): R2Config`

Build R2Config from environment variables. Returns empty strings for missing required values (validation happens in `createR2Client`).

### Signed URLs

#### `generateSignedDownloadUrl(client, bucket, clientId, r2Key, purpose?, logger?): Promise<string>`

Generate a pre-signed URL for downloading an R2 object.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `purpose` | `'api' \| 'download'` | `'download'` | Expiry tier: `api` = 15min, `download` = 1h |

```typescript
// API preview (15 min expiry)
const previewUrl = await generateSignedDownloadUrl(
  client, 'brand-assets', 'acme', 'acme/01-brand-identity/logo.png', 'api'
);

// Client download (1 hour expiry)
const downloadUrl = await generateSignedDownloadUrl(
  client, 'brand-assets', 'acme', 'acme/01-brand-identity/logo.png', 'download'
);
```

#### `generateSignedUploadUrl(client, bucket, clientId, r2Key, contentType, logger?): Promise<string>`

Generate a pre-signed URL for uploading an object. Always uses `api` tier (15min expiry).

```typescript
const uploadUrl = await generateSignedUploadUrl(
  client, 'brand-assets', 'acme', 'acme/01-brand-identity/logo.png', 'image/png'
);
```

### Upload

#### `uploadAsset(client, bucket, clientId, folder, filename, body, options?, logger?): Promise<UploadResult>`

Upload an asset to R2 under the client's path prefix.

```typescript
const result = await uploadAsset(
  client,
  'brand-assets',
  'acme',
  '01-brand-identity',
  'logo.png',
  imageBuffer,
  { contentType: 'image/png', metadata: { source: 'api' } }
);
// result: { key, bucket, size, contentType, etag }
```

#### `uploadAssetWithPreview(client, bucket, clientId, folder, filename, body, options?, logger?): Promise<UploadResult & { previewUrl: string }>`

Upload an asset and return a signed preview URL (15min api-tier expiry).

### Download

#### `downloadAsset(client, bucket, clientId, r2Key, logger?): Promise<{ body: Buffer, contentType: string, size: number }>`

Download an object's content directly from R2 as a Buffer.

```typescript
const { body, contentType, size } = await downloadAsset(
  client, 'brand-assets', 'acme', 'acme/01-brand-identity/logo.png'
);
```

#### `getDownloadUrl(client, bucket, clientId, r2Key, purpose?, logger?): Promise<string>`

Get a signed download URL after verifying the object exists. Throws if not found.

### Operations

#### `deleteAsset(client, bucket, clientId, r2Key, logger?): Promise<void>`

Delete an object from R2. Validates path ownership before deletion.

#### `listAssets(client, bucket, clientId, options?, logger?): Promise<ListResult>`

List objects under a client prefix with pagination.

```typescript
const result = await listAssets(client, 'brand-assets', 'acme', {
  prefix: '01-brand-identity',
  maxKeys: 50,
});
// result: { objects: ObjectInfo[], isTruncated, nextContinuationToken }
```

#### `createClientFolderStructure(clientId, client, bucket, logger?): Promise<string[]>`

Create the standard 10-folder structure for a new client. Idempotent (safe to call multiple times).

```typescript
const folders = await createClientFolderStructure('acme', client, 'brand-assets');
// ["acme/01-brand-identity/", "acme/02-design-system/", ...]
```

#### `listClientAssets(clientId, client, bucket, options?, logger?): Promise<ListResult>`

Higher-level listing API that integrates with ASSET_FOLDERS naming convention.

```typescript
const result = await listClientAssets('acme', client, 'brand-assets', {
  folder: '01-brand-identity',
  maxKeys: 100,
});
```

### Path Validation

#### `validatePath(clientId: string, r2Key: string): PathValidationResult`

Validate that an R2 key is safe and belongs to the specified client.

Security checks:
1. No path traversal (`../`, `..\`)
2. No absolute paths (leading `/`)
3. No double slashes (`//`)
4. No null bytes
5. Key must start with `{clientId}/` prefix
6. Client-ID must match format: `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$`
7. Folder segment must be a valid ASSET_FOLDER (FR-8.8)

```typescript
const result = validatePath('acme', 'acme/01-brand-identity/logo.png');
// { valid: true }

const bad = validatePath('acme', 'acme/../other/secret.png');
// { valid: false, error: 'Path traversal detected...' }
```

#### `buildR2Key(clientId, folder, filename): string`

Build a safe R2 key from components. Sanitizes the filename.

#### `validateFile(filename, sizeBytes, mimeType?, config?): PathValidationResult`

Validate a file against allowed types and size constraints.

- Max size: 50MB
- Allowed extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.avif`, `.pdf`, `.ai`, `.eps`, `.psd`, `.mp4`, `.webm`, `.mov`, `.woff`, `.woff2`, `.ttf`, `.otf`, `.json`, `.yaml`, `.yml`, `.css`

### Retry

#### `withRetry<T>(fn, logger?, config?): Promise<T>`

Execute an async function with exponential backoff retry logic.

- Max retries: 3 (default)
- Base delay: 200ms
- Max delay: 5000ms
- Retryable: network errors, timeouts, 5xx, 429

#### `isRetryableError(error): boolean`

Check if an error is transient and safe to retry.

### Asset Naming

#### `normalizeAssetFilename(filename, options?): string`

Normalize a filename: lowercase, replace spaces with hyphens, remove special characters, append date suffix.

#### `buildAssetMetadata(params): AssetMetadata`

Build structured metadata for an R2 object.

#### `assetMetadataToRecord(metadata): Record<string, string>`

Convert AssetMetadata to R2-compatible key-value pairs (prefixed with `x-bss-`).

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SIGNED_URL_EXPIRY.api` | 900 (15min) | API/preview signed URL expiry |
| `SIGNED_URL_EXPIRY.download` | 3600 (1h) | Client download signed URL expiry |
| `DEFAULT_RETRY_CONFIG.maxRetries` | 3 | Max retry attempts |
| `DEFAULT_RETRY_CONFIG.baseDelayMs` | 200 | Base delay for backoff |
| `DEFAULT_RETRY_CONFIG.maxDelayMs` | 5000 | Maximum delay cap |
| `DEFAULT_FILE_VALIDATION.maxSizeBytes` | 52428800 (50MB) | Max file size |

## Folder Structure (FR-8.8)

Each client has 10 predefined asset folders:

```
r2://brand-assets/{client-id}/
  01-brand-identity/
  02-design-system/
  03-social-media/
  04-marketing/
  05-documents/
  06-video/
  07-audio/
  08-fonts/
  09-templates/
  10-misc/
```

## Error Codes

| Error Class | Code | When |
|-------------|------|------|
| `ConfigError` | `CONFIG_ERROR` | Missing or invalid R2 configuration |
| `StorageError` | `STORAGE_ERROR` | R2 operation failures |

## Types

```typescript
interface R2Config {
  readonly accountId: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucketName: string;
  readonly region?: string;
}

interface UploadResult {
  readonly key: string;
  readonly bucket: string;
  readonly size: number;
  readonly contentType: string;
  readonly etag?: string;
}

type SignedUrlPurpose = 'api' | 'download';
type AssetFolder = '01-brand-identity' | '02-design-system' | ... | '10-misc';
```

See `types.ts` for the complete type definitions.
