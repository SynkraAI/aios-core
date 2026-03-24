/**
 * MediaAssets Collection Configuration (BSS-5.6, AC-5)
 *
 * Payload CMS 3.x upload collection for managing media files.
 * Upload storage points to the R2 bucket path.
 * Accepted MIME types: JPEG, PNG, WebP, SVG.
 */

import { adminAccess, mediaReadAccess, mediaWriteAccess } from '../access/roles';

/**
 * Allowed MIME types for media uploads.
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Payload CMS collection config type for media uploads (simplified).
 */
export interface MediaAssetsCollectionConfig {
  readonly slug: string;
  readonly upload: {
    readonly staticDir: string;
    readonly mimeTypes: readonly string[];
  };
  readonly access: {
    readonly read: typeof mediaReadAccess;
    readonly create: typeof mediaWriteAccess;
    readonly update: typeof mediaWriteAccess;
    readonly delete: typeof adminAccess;
  };
  readonly fields: readonly MediaField[];
}

interface MediaField {
  readonly name: string;
  readonly type: string;
  readonly required?: boolean;
  readonly admin?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Collection definition
// ---------------------------------------------------------------------------

export const MediaAssets: MediaAssetsCollectionConfig = {
  slug: 'media-assets',
  upload: {
    staticDir: process.env['R2_BUCKET_NAME'] ?? 'media',
    mimeTypes: [...ALLOWED_MIME_TYPES],
  },
  access: {
    read: mediaReadAccess,
    create: mediaWriteAccess,
    update: mediaWriteAccess,
    delete: adminAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: {
        description: 'Alt text for accessibility',
      },
    },
  ],
};
