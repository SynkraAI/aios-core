/**
 * Data Quality Analyzer for Audit Data Quality (BSS-7.5).
 *
 * Main orchestrator that evaluates an audit-report.json and produces
 * a data-quality-report.json. Pure data processing -- no AI calls,
 * no URL re-fetching.
 *
 * @module onboarding/quality/quality-analyzer
 */

import type { AuditReport, ConfidenceLevel } from '../audit/audit-types';
import type {
  DataQualityReport,
  DataQualityIssue,
  DataQualityAnalyzerDeps,
  OverallConfidence,
  UrlAccessibilityStatus,
} from './quality-types';
import {
  STALE_CONTENT_THRESHOLD_MONTHS,
  LOW_CONTENT_WORD_THRESHOLD,
  CRITICAL_ALERT_THRESHOLD,
  CRITICAL_ALERT_CLICKUP_MESSAGE,
  RECOMMENDED_CATEGORIES,
} from './quality-types';
import { ConflictDetector } from './conflict-detector';
import { WorkshopRecommender } from './workshop-recommender';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Counts words in a text string. */
function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Checks if a date string is older than the given number of months from now.
 * Returns false if the date cannot be parsed.
 */
function isOlderThanMonths(dateStr: string, months: number): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - months);

  return date < threshold;
}

/**
 * Infers URL category from URL string for missing_category detection.
 */
function inferCategoryFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('facebook.com')) return 'facebook';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('linkedin.com')) return 'linkedin_company';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com')) return 'youtube';
  return 'website';
}

// ---------------------------------------------------------------------------
// Data Quality Analyzer
// ---------------------------------------------------------------------------

export class DataQualityAnalyzer {
  private readonly deps: DataQualityAnalyzerDeps;
  private readonly conflictDetector: ConflictDetector;
  private readonly workshopRecommender: WorkshopRecommender;

  constructor(deps: DataQualityAnalyzerDeps) {
    this.deps = deps;
    this.conflictDetector = new ConflictDetector();
    this.workshopRecommender = new WorkshopRecommender();
  }

  /**
   * Analyzes an audit report and produces a data quality report.
   *
   * Steps:
   * 1. Compute accessibility rate and per-URL status (AC-1)
   * 2. Detect issues: inaccessible, stale, low density, missing categories (AC-2, AC-3)
   * 3. Run conflict detection (AC-4)
   * 4. Generate workshop focus areas (AC-5)
   * 5. Determine critical alert (AC-6)
   * 6. Calculate overall confidence (AC-9)
   * 7. Persist to R2 (AC-7)
   * 8. Post ClickUp comment if critical (AC-6)
   */
  async analyze(report: AuditReport, clientId: string): Promise<DataQualityReport> {
    const startTime = Date.now();
    this.log('info', `Starting data quality analysis for client ${clientId}`);

    // 1. Per-URL accessibility status (AC-1)
    const perUrlStatus = this.buildPerUrlStatus(report);
    const urlsSubmitted = report.urlsSubmitted;
    const urlsAccessible = report.urlsAccessible;
    const accessibilityRate = urlsSubmitted > 0 ? urlsAccessible / urlsSubmitted : 0;

    // 2. Detect standard issues (AC-2, AC-3)
    const standardIssues = this.detectStandardIssues(report);

    // 3. Detect conflicts (AC-4)
    const conflictIssues = this.conflictDetector.detect(report);

    // 4. Merge all issues
    const allIssues: readonly DataQualityIssue[] = [...standardIssues, ...conflictIssues];

    // 5. Generate workshop focus areas (AC-5)
    const workshopFocusAreas = this.workshopRecommender.recommend(allIssues);

    // 6. Critical alert (AC-6): >= 50% inaccessible means accessibility rate <= 50%
    const criticalAlert = accessibilityRate <= CRITICAL_ALERT_THRESHOLD;

    // 7. Overall confidence (AC-9)
    const overallConfidence = this.calculateOverallConfidence(report);

    // 8. Build report
    const qualityReport: DataQualityReport = {
      client_id: clientId,
      generated_at: new Date().toISOString(),
      urls_submitted: urlsSubmitted,
      urls_accessible: urlsAccessible,
      accessibility_rate: Math.round(accessibilityRate * 1000) / 1000, // 3 decimal places
      critical_data_quality_alert: criticalAlert,
      overall_confidence: overallConfidence,
      issues: allIssues,
      workshop_focus_areas: workshopFocusAreas,
      per_url_status: perUrlStatus,
    };

    // 9. Persist to R2 (AC-7)
    const r2Key = buildDataQualityR2Key(clientId);
    await this.deps.r2Client.uploadJson(r2Key, qualityReport);
    this.log('info', `Data quality report stored at ${r2Key}`);

    // 10. Post ClickUp comment if critical (AC-6)
    if (criticalAlert && this.deps.clickUpClient && this.deps.clickUpTaskId) {
      try {
        await this.deps.clickUpClient.postComment(
          this.deps.clickUpTaskId,
          CRITICAL_ALERT_CLICKUP_MESSAGE,
        );
        this.log('info', 'Critical data quality alert posted to ClickUp');
      } catch (error) {
        this.log(
          'warn',
          `Failed to post ClickUp comment: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    const elapsed = Date.now() - startTime;
    this.log('info', `Data quality analysis complete in ${elapsed}ms. Issues: ${allIssues.length}`);

    return qualityReport;
  }

  // -------------------------------------------------------------------------
  // Issue Detection (AC-2, AC-3)
  // -------------------------------------------------------------------------

  /**
   * Detects standard data quality issues (non-conflict).
   */
  private detectStandardIssues(report: AuditReport): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    // inaccessible_url
    issues.push(...this.detectInaccessibleUrls(report));

    // stale_content
    issues.push(...this.detectStaleContent(report));

    // low_content_density
    issues.push(...this.detectLowContentDensity(report));

    // missing_category
    issues.push(...this.detectMissingCategories(report));

    return issues;
  }

  /**
   * Detects inaccessible URLs (AC-2).
   */
  private detectInaccessibleUrls(report: AuditReport): DataQualityIssue[] {
    return report.pageAnalyses
      .filter((page) => !page.accessible)
      .map((page) => ({
        issue_type: 'inaccessible_url' as const,
        affected_url: page.url,
        description: `URL is inaccessible${page.accessError ? `: ${page.accessError}` : ''}`,
        severity: 'high' as const,
        impact_on_audit:
          'This URL could not be analyzed, reducing the breadth of brand data available for audit.',
      }));
  }

  /**
   * Detects stale content (> 12 months old) (AC-2).
   * Uses the fetchedAt timestamp as a proxy if no last-modified header.
   */
  private detectStaleContent(report: AuditReport): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    for (const page of report.pageAnalyses) {
      if (!page.accessible) continue;

      // Check if page content appears stale
      // The audit stores fetchedAt; we check if any metadata suggests staleness
      if (page.fetchedAt && isOlderThanMonths(page.fetchedAt, STALE_CONTENT_THRESHOLD_MONTHS)) {
        issues.push({
          issue_type: 'stale_content',
          affected_url: page.url,
          description: `Page content appears to be older than ${STALE_CONTENT_THRESHOLD_MONTHS} months`,
          severity: 'medium',
          impact_on_audit:
            'Stale content may not reflect current brand positioning, reducing audit accuracy.',
        });
      }
    }

    return issues;
  }

  /**
   * Detects pages with low content density (< 200 words) (AC-2).
   */
  private detectLowContentDensity(report: AuditReport): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    for (const page of report.pageAnalyses) {
      if (!page.accessible) continue;

      const wordCount = countWords(page.textContent);
      if (wordCount < LOW_CONTENT_WORD_THRESHOLD) {
        issues.push({
          issue_type: 'low_content_density',
          affected_url: page.url,
          description: `Page has only ${wordCount} words (minimum ${LOW_CONTENT_WORD_THRESHOLD} expected)`,
          severity: 'low',
          impact_on_audit:
            'Insufficient text content limits tone analysis and messaging extraction accuracy.',
        });
      }
    }

    return issues;
  }

  /**
   * Detects missing recommended URL categories (AC-2).
   * Checks if website and at least 1 social channel were provided.
   */
  private detectMissingCategories(report: AuditReport): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    // Determine which categories are present from submitted URLs
    const presentCategories = new Set<string>();
    for (const page of report.pageAnalyses) {
      presentCategories.add(inferCategoryFromUrl(page.url));
    }

    // Check recommended categories
    for (const category of RECOMMENDED_CATEGORIES) {
      if (!presentCategories.has(category)) {
        const label = category.replace('_', ' ');
        issues.push({
          issue_type: 'missing_category',
          affected_url: null,
          description: `No ${label} URL provided for audit`,
          severity: category === 'website' ? 'high' : 'medium',
          impact_on_audit: `Missing ${label} data limits the audit's ability to assess brand presence on this channel.`,
        });
      }
    }

    return issues;
  }

  // -------------------------------------------------------------------------
  // Accessibility Status (AC-1)
  // -------------------------------------------------------------------------

  /**
   * Builds per-URL accessibility status from the audit report.
   */
  private buildPerUrlStatus(report: AuditReport): UrlAccessibilityStatus[] {
    return report.pageAnalyses.map((page) => ({
      url: page.url,
      accessible: page.accessible,
      ...(page.accessError ? { error: page.accessError } : {}),
    }));
  }

  // -------------------------------------------------------------------------
  // Overall Confidence (AC-9)
  // -------------------------------------------------------------------------

  /**
   * Calculates aggregate confidence from all inference items in the audit.
   *
   * - high: > 60% of inferences are High confidence
   * - medium: 30-60% are High confidence
   * - low: < 30% are High confidence
   */
  calculateOverallConfidence(report: AuditReport): OverallConfidence {
    const inferences = report.inferences;

    if (inferences.length === 0) {
      // Fall back to analysis confidence levels
      return this.calculateFromAnalysisConfidence(report);
    }

    const highCount = inferences.filter((i) => i.confidence === 'High').length;
    const highPercentage = highCount / inferences.length;

    if (highPercentage > 0.6) return 'high';
    if (highPercentage >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * Fallback confidence calculation from analysis section confidence levels.
   */
  private calculateFromAnalysisConfidence(report: AuditReport): OverallConfidence {
    const confidences: ConfidenceLevel[] = [
      report.toneOfVoice.confidence,
      report.messagingConsistency.confidence,
      report.visualConsistency.confidence,
    ];

    if (report.competitiveGap.confidence) {
      confidences.push(report.competitiveGap.confidence);
    }

    const highCount = confidences.filter((c) => c === 'High').length;
    const highPercentage = highCount / confidences.length;

    if (highPercentage > 0.6) return 'high';
    if (highPercentage >= 0.3) return 'medium';
    return 'low';
  }

  // -------------------------------------------------------------------------
  // Logging
  // -------------------------------------------------------------------------

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    if (this.deps.logger) {
      this.deps.logger[level](message);
    }
  }
}

// ---------------------------------------------------------------------------
// R2 Key Builder (AC-7)
// ---------------------------------------------------------------------------

/**
 * Builds the R2 key for the data quality report.
 * Format: brand-assets/{clientId}/onboarding/data-quality-report.json
 */
export function buildDataQualityR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/data-quality-report.json`;
}
