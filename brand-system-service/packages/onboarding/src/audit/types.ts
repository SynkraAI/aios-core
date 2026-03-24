/**
 * Types for the Audit-Assisted URL Collection module (BSS-7.2).
 *
 * Defines URL categories, validation results, and the persisted
 * audit-urls.json data shape consumed by BSS-7.3.
 *
 * @module onboarding/audit/types
 */

import type { ClickUpClient, R2StorageClient } from '../types';

// ---------------------------------------------------------------------------
// URL Categories
// ---------------------------------------------------------------------------

/** All supported URL categories for audit collection (AC-1). */
export const URL_CATEGORIES = [
  'website',
  'landing_page',
  'youtube',
  'linkedin_company',
  'linkedin_personal',
  'instagram',
  'facebook',
  'tiktok',
  'twitter',
  'other',
] as const;

export type URLCategory = (typeof URL_CATEGORIES)[number];

/**
 * High-value URL categories that receive a "Recommended" badge (AC-5).
 * Website, LinkedIn (company + personal), and Instagram are considered
 * the most useful for brand audit analysis.
 */
export const HIGH_VALUE_CATEGORIES: readonly URLCategory[] = [
  'website',
  'linkedin_company',
  'linkedin_personal',
  'instagram',
] as const;

/**
 * Categories that support multiple entries (AC-1, AC-6).
 * Landing pages allow up to N entries; "other" allows up to 3.
 */
export const MULTI_ENTRY_CATEGORIES: readonly URLCategory[] = [
  'landing_page',
  'other',
] as const;

/** Maximum number of "other" URLs allowed (AC-1). */
export const MAX_OTHER_URLS = 3;

/** Maximum number of landing page URLs allowed. */
export const MAX_LANDING_PAGE_URLS = 10;

/** Minimum URLs required to proceed (AC-3, NFR-9.6). */
export const MIN_URLS_REQUIRED = 1;

/** Threshold below which a warning banner is shown (AC-3). */
export const LOW_URL_WARNING_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Audit URL Data Shape (AC-8)
// ---------------------------------------------------------------------------

/** A single audit URL entry with metadata as persisted in audit-urls.json. */
export interface AuditUrl {
  readonly url: string;
  readonly category: URLCategory;
  readonly submitted_at: string; // ISO 8601
  readonly validated: boolean; // false at collection; updated by BSS-7.3
}

/** The complete audit URL collection document persisted to R2. */
export interface AuditUrlCollection {
  readonly version: '1.0';
  readonly clientId: string;
  readonly collectedAt: string; // ISO 8601
  readonly urls: readonly AuditUrl[];
  readonly metadata: AuditCollectionMetadata;
}

/** Metadata about the audit URL collection session. */
export interface AuditCollectionMetadata {
  readonly totalUrls: number;
  readonly categoryCounts: Partial<Record<URLCategory, number>>;
  readonly highValueCount: number;
  readonly disclaimerAccepted: boolean;
}

// ---------------------------------------------------------------------------
// URL Validation (AC-2)
// ---------------------------------------------------------------------------

/** Result of validating a single URL. */
export interface URLValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

/** Result of validating the entire URL collection. */
export interface CollectionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

// ---------------------------------------------------------------------------
// URL Collection Result (AC-4, AC-7)
// ---------------------------------------------------------------------------

/** Result of submitting the URL collection. */
export interface URLCollectionSubmitResult {
  readonly success: boolean;
  readonly clientId: string;
  readonly r2Key: string;
  readonly urlCount: number;
  readonly clickUpTaskId?: string;
  readonly clickUpTaskUrl?: string;
  readonly auditUrls: readonly AuditUrl[];
}

// ---------------------------------------------------------------------------
// URL Collector Configuration
// ---------------------------------------------------------------------------

/** Dependencies injected into the URLCollector. */
export interface URLCollectorDeps {
  readonly r2Client: R2StorageClient;
  readonly clickUpClient?: ClickUpClient;
  readonly clickUpTaskId?: string;
}

// ---------------------------------------------------------------------------
// Copy Constants (CON-17, CON-18)
// ---------------------------------------------------------------------------

/**
 * CON-18: Disclaimer shown below the URL collection form.
 * Only publicly accessible URLs are in scope.
 */
export const CON18_DISCLAIMER =
  'Only submit publicly accessible URLs or content your client has authorized for analysis. Private accounts and authenticated pages are out of scope.';

/**
 * AC-3: Warning banner when fewer than 3 URLs are provided.
 */
export const LOW_URL_WARNING_MESSAGE =
  'Fewer URLs may reduce audit confidence. Adding more sources improves analysis quality.';

/**
 * AC-6: Duplicate URL rejection message.
 */
export const DUPLICATE_URL_MESSAGE = 'This URL has already been added.';

/**
 * CON-17: CTA button label — avoid implying audit replaces workshop.
 */
export const START_AUDIT_CTA_LABEL = 'Start Digital Presence Analysis';
