/**
 * URLCollector — Audit-assisted URL collection handler (BSS-7.2).
 *
 * Manages the lifecycle of URL collection for audit-assisted onboarding:
 * 1. Add/remove URLs with validation (AC-1, AC-2, AC-5, AC-6)
 * 2. Validate collection completeness (AC-3)
 * 3. Persist to R2 and update ClickUp (AC-4, AC-8)
 * 4. Provide submission preview (AC-7)
 *
 * @module onboarding/audit/url-collector
 */

import type {
  AuditUrl,
  AuditUrlCollection,
  AuditCollectionMetadata,
  URLCategory,
  URLCollectorDeps,
  URLCollectionSubmitResult,
  URLValidationResult,
  CollectionValidationResult,
} from './types';

import {
  HIGH_VALUE_CATEGORIES,
  DUPLICATE_URL_MESSAGE,
  URL_CATEGORIES,
} from './types';

import {
  validateUrl,
  isValidCategory,
  isDuplicateUrl,
  validateCategoryLimit,
  validateCollection,
} from './url-validator';

// ---------------------------------------------------------------------------
// R2 Key Construction
// ---------------------------------------------------------------------------

/**
 * Build the R2 storage key for audit-urls.json (AC-4).
 *
 * @param clientId - The client identifier
 * @returns The full R2 key path
 */
export function buildAuditUrlsR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/audit-urls.json`;
}

// ---------------------------------------------------------------------------
// URLCollector Class
// ---------------------------------------------------------------------------

/**
 * URLCollector manages in-memory URL collection state with validation,
 * then persists to R2 and optionally updates ClickUp on submission.
 */
export class URLCollector {
  private readonly clientId: string;
  private readonly deps: URLCollectorDeps;
  private urls: AuditUrl[] = [];
  private submitted = false;

  constructor(clientId: string, deps: URLCollectorDeps) {
    if (!clientId || clientId.trim().length === 0) {
      throw new Error('Client ID is required for URL collection.');
    }
    this.clientId = clientId.trim();
    this.deps = deps;
  }

  // -------------------------------------------------------------------------
  // Query Methods
  // -------------------------------------------------------------------------

  /** Get all collected URLs. */
  getUrls(): readonly AuditUrl[] {
    return [...this.urls];
  }

  /** Get total count of collected URLs. */
  getUrlCount(): number {
    return this.urls.length;
  }

  /** Check if the collection has been submitted. */
  isSubmitted(): boolean {
    return this.submitted;
  }

  /** Get URLs grouped by category for preview (AC-7). */
  getUrlsByCategory(): Map<URLCategory, readonly AuditUrl[]> {
    const grouped = new Map<URLCategory, AuditUrl[]>();
    for (const category of URL_CATEGORIES) {
      const categoryUrls = this.urls.filter((u) => u.category === category);
      if (categoryUrls.length > 0) {
        grouped.set(category, categoryUrls);
      }
    }
    return grouped;
  }

  /**
   * Check if a category is high-value (AC-5).
   *
   * @param category - The URL category to check
   * @returns True if the category should show a "Recommended" badge
   */
  isHighValueCategory(category: URLCategory): boolean {
    return HIGH_VALUE_CATEGORIES.includes(category);
  }

  /**
   * Get categories that are available and the number of existing entries.
   * Useful for rendering the collection interface.
   */
  getCategoryStatus(): Array<{
    category: URLCategory;
    highValue: boolean;
    entryCount: number;
  }> {
    return URL_CATEGORIES.map((category) => ({
      category,
      highValue: this.isHighValueCategory(category),
      entryCount: this.urls.filter((u) => u.category === category).length,
    }));
  }

  // -------------------------------------------------------------------------
  // Mutation Methods (AC-1, AC-6)
  // -------------------------------------------------------------------------

  /**
   * Add a URL to the collection (AC-1, AC-6).
   *
   * Performs format validation (AC-2), duplicate detection (AC-6),
   * and category limit checking before adding.
   *
   * @param url - The URL string to add
   * @param category - The URL category
   * @returns Validation result — check `valid` before proceeding
   */
  addUrl(url: string, category: string): URLValidationResult {
    if (this.submitted) {
      return { valid: false, error: 'Collection has already been submitted.' };
    }

    // Validate category
    if (!isValidCategory(category)) {
      return { valid: false, error: `Unknown URL category: "${category}".` };
    }

    // Validate URL format (AC-2)
    const formatResult = validateUrl(url);
    if (!formatResult.valid) {
      return formatResult;
    }

    const trimmedUrl = url.trim();

    // Check for duplicates (AC-6)
    if (isDuplicateUrl(trimmedUrl, this.urls)) {
      return { valid: false, error: DUPLICATE_URL_MESSAGE };
    }

    // Check category limit
    const limitResult = validateCategoryLimit(category, this.urls);
    if (!limitResult.valid) {
      return limitResult;
    }

    // Add the URL entry (AC-8)
    const entry: AuditUrl = {
      url: trimmedUrl,
      category,
      submitted_at: new Date().toISOString(),
      validated: false,
    };

    this.urls.push(entry);

    return { valid: true };
  }

  /**
   * Remove a URL from the collection by its URL string (AC-6).
   *
   * @param url - The URL to remove (exact match, case-insensitive)
   * @returns True if the URL was found and removed
   */
  removeUrl(url: string): boolean {
    if (this.submitted) {
      return false;
    }

    const normalizedUrl = url.trim().toLowerCase();
    const initialLength = this.urls.length;

    this.urls = this.urls.filter(
      (entry) => entry.url.trim().toLowerCase() !== normalizedUrl,
    );

    return this.urls.length < initialLength;
  }

  /**
   * Remove a URL from the collection by index.
   *
   * @param index - Zero-based index of the URL to remove
   * @returns True if the URL was found and removed
   */
  removeUrlByIndex(index: number): boolean {
    if (this.submitted) {
      return false;
    }

    if (index < 0 || index >= this.urls.length) {
      return false;
    }

    this.urls.splice(index, 1);
    return true;
  }

  // -------------------------------------------------------------------------
  // Validation (AC-3)
  // -------------------------------------------------------------------------

  /**
   * Validate the entire collection before submission (AC-3).
   *
   * @returns Collection validation result with errors and warnings
   */
  validate(): CollectionValidationResult {
    return validateCollection(this.urls);
  }

  // -------------------------------------------------------------------------
  // Submission (AC-4, AC-7, AC-8)
  // -------------------------------------------------------------------------

  /**
   * Submit the URL collection: persist to R2 and update ClickUp (AC-4).
   *
   * @returns Submission result with R2 key and ClickUp references
   * @throws Error if collection validation fails
   */
  async submit(): Promise<URLCollectionSubmitResult> {
    if (this.submitted) {
      throw new Error('Collection has already been submitted.');
    }

    // Validate collection
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(
        `Collection validation failed: ${validation.errors.join('; ')}`,
      );
    }

    // Build the persisted document (AC-8)
    const document = this.buildCollectionDocument();

    // Persist to R2 (AC-4)
    const r2Key = buildAuditUrlsR2Key(this.clientId);
    try {
      await this.deps.r2Client.uploadJson(r2Key, document);
    } catch (error) {
      throw new Error(
        `Failed to persist audit URLs to R2: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Update ClickUp task (AC-4) — optional, non-blocking
    let clickUpTaskId: string | undefined;
    let clickUpTaskUrl: string | undefined;

    if (this.deps.clickUpClient && this.deps.clickUpTaskId) {
      try {
        const urlListText = this.urls
          .map((u) => `- [${u.category}] ${u.url}`)
          .join('\n');

        const result = await this.deps.clickUpClient.updateTask(
          this.deps.clickUpTaskId,
          {
            name: `[Audit URLs] ${this.clientId}`,
            description: `Audit URLs collected (${this.urls.length} URLs):\n\n${urlListText}`,
            customFields: [],
          },
        );

        clickUpTaskId = result.taskId;
        clickUpTaskUrl = result.taskUrl;
      } catch (error) {
        // ClickUp update is non-critical; log but don't fail submission
        // In production, this would use the Logger interface
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`ClickUp update failed (non-critical): ${errorMessage}`);
      }
    }

    this.submitted = true;

    return {
      success: true,
      clientId: this.clientId,
      r2Key,
      urlCount: this.urls.length,
      clickUpTaskId,
      clickUpTaskUrl,
      auditUrls: [...this.urls],
    };
  }

  // -------------------------------------------------------------------------
  // Preview (AC-7)
  // -------------------------------------------------------------------------

  /**
   * Generate a submission preview grouped by category (AC-7).
   *
   * Returns the URLs grouped by category with high-value indicators,
   * suitable for rendering a read-only preview list.
   *
   * @returns Preview data structure
   */
  getSubmissionPreview(): {
    urls: readonly AuditUrl[];
    grouped: Map<URLCategory, readonly AuditUrl[]>;
    totalCount: number;
    highValueCount: number;
    canStartAudit: boolean;
    validation: CollectionValidationResult;
  } {
    const validation = this.validate();
    const grouped = this.getUrlsByCategory();
    const highValueCount = this.urls.filter((u) =>
      HIGH_VALUE_CATEGORIES.includes(u.category),
    ).length;

    return {
      urls: [...this.urls],
      grouped,
      totalCount: this.urls.length,
      highValueCount,
      canStartAudit: this.submitted && this.urls.length >= 1,
      validation,
    };
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Build the AuditUrlCollection document for R2 persistence (AC-8).
   */
  private buildCollectionDocument(): AuditUrlCollection {
    const categoryCounts: Partial<Record<URLCategory, number>> = {};
    for (const entry of this.urls) {
      categoryCounts[entry.category] = (categoryCounts[entry.category] ?? 0) + 1;
    }

    const highValueCount = this.urls.filter((u) =>
      HIGH_VALUE_CATEGORIES.includes(u.category),
    ).length;

    const metadata: AuditCollectionMetadata = {
      totalUrls: this.urls.length,
      categoryCounts,
      highValueCount,
      disclaimerAccepted: true,
    };

    return {
      version: '1.0',
      clientId: this.clientId,
      collectedAt: new Date().toISOString(),
      urls: [...this.urls],
      metadata,
    };
  }
}
