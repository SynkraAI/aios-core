/**
 * URL validator for competitor URLs (AC-6).
 *
 * Validates that URLs start with http:// or https:// and
 * have a valid structure.
 *
 * @module onboarding/validators/url-validator
 */

import type { ValidationResult, ValidationError } from '../types';

/** Minimum competitor URLs required per AC-6. */
export const MIN_COMPETITOR_URLS = 2;

/** Maximum competitor URLs allowed per AC-6. */
export const MAX_COMPETITOR_URLS = 5;

/**
 * Validate a single URL.
 *
 * Rules per AC-6:
 * - Must start with https:// or http://
 * - Must be a valid URL structure
 *
 * @param url - URL string to validate
 * @returns true if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();

  // Must start with http:// or https:// per AC-6
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    // Must have a hostname with at least one dot (e.g., example.com)
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Validate the complete competitor URLs collection.
 *
 * @param urls - Array of URL strings
 * @returns Validation result with errors if any
 */
export function validateCompetitorUrls(urls: readonly string[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (urls.length < MIN_COMPETITOR_URLS) {
    errors.push({
      field: 'competitorUrls',
      message: `At least ${MIN_COMPETITOR_URLS} competitor URLs are required. Got ${urls.length}.`,
      code: 'MIN_URLS',
    });
  }

  if (urls.length > MAX_COMPETITOR_URLS) {
    errors.push({
      field: 'competitorUrls',
      message: `Maximum ${MAX_COMPETITOR_URLS} competitor URLs allowed. Got ${urls.length}.`,
      code: 'MAX_URLS',
    });
  }

  urls.forEach((url, index) => {
    if (!isValidUrl(url)) {
      errors.push({
        field: `competitorUrls[${index}]`,
        message: `Invalid URL: "${url}". Must start with http:// or https:// and be a valid URL.`,
        code: 'INVALID_URL',
      });
    }
  });

  // Check for duplicates
  const seen = new Set<string>();
  urls.forEach((url, index) => {
    const normalized = url.trim().toLowerCase().replace(/\/+$/, '');
    if (seen.has(normalized)) {
      errors.push({
        field: `competitorUrls[${index}]`,
        message: `Duplicate URL: "${url}".`,
        code: 'DUPLICATE_URL',
      });
    }
    seen.add(normalized);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
