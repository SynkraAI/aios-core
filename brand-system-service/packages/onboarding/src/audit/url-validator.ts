/**
 * URL validation logic for audit-assisted URL collection (BSS-7.2).
 *
 * Provides HTTP format validation (AC-2), duplicate detection (AC-6),
 * minimum URL gating (AC-3), and collection-level validation.
 *
 * @module onboarding/audit/url-validator
 */

import type {
  AuditUrl,
  URLCategory,
  URLValidationResult,
  CollectionValidationResult,
} from './types';

import {
  URL_CATEGORIES,
  MIN_URLS_REQUIRED,
  LOW_URL_WARNING_THRESHOLD,
  LOW_URL_WARNING_MESSAGE,
  MULTI_ENTRY_CATEGORIES,
  MAX_OTHER_URLS,
  MAX_LANDING_PAGE_URLS,
} from './types';

/**
 * Regex for HTTP URL format validation (AC-2).
 *
 * Matches: https://example.com, http://sub.domain.co.uk/path
 * Rejects: ftp://, no protocol, localhost, IP addresses without domain
 */
const URL_PATTERN = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;

/**
 * Validate a single URL string for HTTP format (AC-2).
 *
 * @param url - The URL string to validate
 * @returns Validation result with optional error message
 */
export function validateUrl(url: string): URLValidationResult {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL cannot be empty.' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return { valid: false, error: 'URL must start with https:// or http://.' };
  }

  if (!URL_PATTERN.test(trimmedUrl)) {
    return { valid: false, error: 'URL must contain a valid domain (e.g., example.com).' };
  }

  return { valid: true };
}

/**
 * Validate that a category string is a known URLCategory.
 *
 * @param category - The category string to check
 * @returns True if the category is valid
 */
export function isValidCategory(category: string): category is URLCategory {
  return (URL_CATEGORIES as readonly string[]).includes(category);
}

/**
 * Check if a URL is a duplicate within the existing collection (AC-6).
 * Uses exact string match on trimmed, lowercased URLs.
 *
 * @param url - The URL to check
 * @param existingUrls - The existing URL entries
 * @returns True if the URL already exists in the collection
 */
export function isDuplicateUrl(url: string, existingUrls: readonly AuditUrl[]): boolean {
  const normalizedNew = url.trim().toLowerCase();
  return existingUrls.some((entry) => entry.url.trim().toLowerCase() === normalizedNew);
}

/**
 * Validate category entry limits.
 *
 * Landing pages: max MAX_LANDING_PAGE_URLS.
 * Other: max MAX_OTHER_URLS.
 * All other categories: max 1 entry each.
 *
 * @param category - The category being added to
 * @param existingUrls - Current URL entries
 * @returns Validation result
 */
export function validateCategoryLimit(
  category: URLCategory,
  existingUrls: readonly AuditUrl[],
): URLValidationResult {
  const countInCategory = existingUrls.filter((entry) => entry.category === category).length;

  if (category === 'landing_page' && countInCategory >= MAX_LANDING_PAGE_URLS) {
    return {
      valid: false,
      error: `Maximum of ${MAX_LANDING_PAGE_URLS} landing page URLs allowed.`,
    };
  }

  if (category === 'other' && countInCategory >= MAX_OTHER_URLS) {
    return {
      valid: false,
      error: `Maximum of ${MAX_OTHER_URLS} additional URLs allowed.`,
    };
  }

  if (
    !MULTI_ENTRY_CATEGORIES.includes(category) &&
    countInCategory >= 1
  ) {
    return {
      valid: false,
      error: `Only one URL is allowed for the "${category}" category.`,
    };
  }

  return { valid: true };
}

/**
 * Validate the entire URL collection before submission (AC-3).
 *
 * Checks minimum URL count and produces warnings for low count.
 *
 * @param urls - The collected audit URLs
 * @returns Collection validation result with errors and warnings
 */
export function validateCollection(
  urls: readonly AuditUrl[],
): CollectionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // AC-3: Minimum 1 URL required
  if (urls.length < MIN_URLS_REQUIRED) {
    errors.push(`At least ${MIN_URLS_REQUIRED} URL must be provided to proceed.`);
  }

  // AC-3: Warning when fewer than 3 URLs
  if (urls.length > 0 && urls.length < LOW_URL_WARNING_THRESHOLD) {
    warnings.push(LOW_URL_WARNING_MESSAGE);
  }

  // Validate each URL in the collection
  for (const entry of urls) {
    const urlResult = validateUrl(entry.url);
    if (!urlResult.valid) {
      errors.push(`Invalid URL "${entry.url}": ${urlResult.error}`);
    }
    if (!isValidCategory(entry.category)) {
      errors.push(`Unknown category "${entry.category}" for URL "${entry.url}".`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
