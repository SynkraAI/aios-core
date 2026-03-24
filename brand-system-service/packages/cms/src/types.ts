/**
 * CMS Integration Types (BSS-5.6)
 *
 * Defines the data contracts for the optional Payload CMS integration layer.
 * These types mirror the Payload CMS collection structures and the adapter
 * interfaces used to bridge CMS content to the static pipeline.
 */

// ---------------------------------------------------------------------------
// Template types (must match BuildType from static-generator)
// ---------------------------------------------------------------------------

/**
 * Page template types supported by the CMS.
 * Subset of the full BuildType — only templates that make sense for CMS editing.
 */
export type CMSTemplate =
  | 'landing-page'
  | 'about'
  | 'services'
  | 'blog-post'
  | 'contact'
  | 'pricing'
  | 'terms-privacy'
  | '404';

/**
 * Page publication status.
 */
export type PageStatus = 'draft' | 'published';

// ---------------------------------------------------------------------------
// CMS Page — mirrors the Payload Pages collection
// ---------------------------------------------------------------------------

/**
 * A page as returned by the Payload CMS local API.
 */
export interface CMSPage {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly template: CMSTemplate;
  readonly content: unknown; // Lexical rich-text JSON
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly status: PageStatus;
  readonly publishedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ---------------------------------------------------------------------------
// CMS Media Asset — mirrors the Payload MediaAssets collection
// ---------------------------------------------------------------------------

/**
 * A media asset as returned by the Payload CMS local API.
 */
export interface CMSMediaAsset {
  readonly id: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly url: string;
  readonly width?: number;
  readonly height?: number;
  readonly alt?: string;
  readonly filesize: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ---------------------------------------------------------------------------
// CMS Global Config
// ---------------------------------------------------------------------------

/**
 * Global site configuration stored in Payload CMS.
 */
export interface CMSGlobalConfig {
  readonly siteName: string;
  readonly siteUrl: string;
  readonly clientId: string;
  readonly logoUrl?: string;
  readonly faviconUrl?: string;
  readonly primaryColor?: string;
  readonly footerText?: string;
  readonly analyticsId?: string;
}

// ---------------------------------------------------------------------------
// RBAC Types
// ---------------------------------------------------------------------------

/**
 * User roles for CMS access control.
 */
export type CMSRole = 'admin' | 'editor' | 'viewer';

/**
 * A CMS user with role assignment.
 */
export interface CMSUser {
  readonly id: string;
  readonly email: string;
  readonly role: CMSRole;
}

// ---------------------------------------------------------------------------
// Adapter interfaces
// ---------------------------------------------------------------------------

/**
 * Interface for the PayloadCMSAdapter — abstracts Payload local API access.
 */
export interface ICMSAdapter {
  getPage(slug: string): Promise<CMSPage>;
  getAllPages(): Promise<CMSPage[]>;
  getGlobalConfig(): Promise<CMSGlobalConfig>;
}

/**
 * Static page context output from CMSToStaticAdapter.
 * This is the template variable object passed to StaticGenerator.
 */
export interface StaticPageContext {
  readonly clientId: string;
  readonly title: string;
  readonly slug: string;
  readonly template: CMSTemplate;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly content: string; // HTML string rendered from Lexical JSON
  readonly publishedAt?: string;
  readonly siteName: string;
  readonly siteUrl: string;
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly footerText?: string;
}
