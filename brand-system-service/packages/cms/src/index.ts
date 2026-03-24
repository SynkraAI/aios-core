// This package is opt-in only. Do not import from default static pipeline.

/**
 * @brand-system/cms — Optional Payload CMS 3.x Integration
 *
 * Provides CMS collections, adapters, and webhook stubs for clients
 * who need self-service content management. The default path remains
 * the static pipeline (BSS-5.1). This package is NOT imported by any
 * other BSS package by default.
 *
 * Activation: BSS_CLIENT_ID=xxx BSS_CMS_ENABLED=true pnpm --filter @brand-system/cms bootstrap
 */

// Types
export type {
  CMSTemplate,
  PageStatus,
  CMSPage,
  CMSMediaAsset,
  CMSGlobalConfig,
  CMSRole,
  CMSUser,
  ICMSAdapter,
  StaticPageContext,
} from './types';

// Collections
export { Pages } from './collections/Pages';
export type { PagesCollectionConfig } from './collections/Pages';
export { MediaAssets, ALLOWED_MIME_TYPES } from './collections/MediaAssets';
export type { MediaAssetsCollectionConfig, AllowedMimeType } from './collections/MediaAssets';

// RBAC Access
export {
  hasMinimumRole,
  adminAccess,
  editorReadAccess,
  editorWriteAccess,
  viewerAccess,
  mediaReadAccess,
  mediaWriteAccess,
} from './access/roles';

// Adapters
export { PayloadCMSAdapter } from './payload-adapter';
export { CMSToStaticAdapter } from './cms-to-static';
export type { LandingPageContext } from './cms-to-static';

// Webhooks
export { createOnPublishHook } from './webhooks/on-publish';
export type {
  AfterChangeHookArgs,
  OnPublishConfig,
  BuildResult,
} from './webhooks/on-publish';
