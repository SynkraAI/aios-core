/**
 * Types for the Audit Data Quality Handler (BSS-7.5).
 *
 * Defines the data quality report shape, issue classification,
 * conflict detection results, and workshop focus areas.
 *
 * @module onboarding/quality/quality-types
 */

import type { AuditR2Client, AuditClickUpClient, AuditLogger } from '../audit/audit-types';

// ---------------------------------------------------------------------------
// Issue Types (AC-2)
// ---------------------------------------------------------------------------

/** All supported data quality issue types (AC-2). */
export type IssueType =
  | 'inaccessible_url'
  | 'stale_content'
  | 'inconsistent_branding'
  | 'low_content_density'
  | 'missing_category';

/** Issue severity levels (AC-3). */
export type IssueSeverity = 'high' | 'medium' | 'low';

// ---------------------------------------------------------------------------
// Data Quality Issue (AC-3)
// ---------------------------------------------------------------------------

/** A single flagged data quality issue (AC-3). */
export interface DataQualityIssue {
  readonly issue_type: IssueType;
  readonly affected_url: string | null;
  readonly description: string;
  readonly severity: IssueSeverity;
  readonly impact_on_audit: string;
}

// ---------------------------------------------------------------------------
// Workshop Focus Area (AC-5)
// ---------------------------------------------------------------------------

/** A recommended workshop focus area derived from quality gaps (AC-5). */
export interface WorkshopFocusArea {
  readonly topic: string;
  readonly reason: string;
  readonly priority: 'high' | 'medium' | 'low';
}

// ---------------------------------------------------------------------------
// Overall Confidence (AC-9)
// ---------------------------------------------------------------------------

/** Aggregate confidence level for the entire audit. */
export type OverallConfidence = 'high' | 'medium' | 'low';

// ---------------------------------------------------------------------------
// Data Quality Report (AC-1)
// ---------------------------------------------------------------------------

/** The complete data quality report (AC-1). */
export interface DataQualityReport {
  readonly client_id: string;
  readonly generated_at: string; // ISO 8601
  readonly urls_submitted: number;
  readonly urls_accessible: number;
  readonly accessibility_rate: number; // 0-1
  readonly critical_data_quality_alert: boolean;
  readonly overall_confidence: OverallConfidence;
  readonly issues: readonly DataQualityIssue[];
  readonly workshop_focus_areas: readonly WorkshopFocusArea[];
  readonly per_url_status: readonly UrlAccessibilityStatus[];
}

/** Per-URL accessibility status for the report (AC-1). */
export interface UrlAccessibilityStatus {
  readonly url: string;
  readonly accessible: boolean;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Conflict Detection (AC-4)
// ---------------------------------------------------------------------------

/** A detected conflict between signals across different URLs. */
export interface BrandingConflict {
  readonly conflict_type: 'tone' | 'color' | 'messaging';
  readonly source_a: ConflictSource;
  readonly source_b: ConflictSource;
  readonly description: string;
  readonly severity: IssueSeverity;
}

/** A source involved in a branding conflict. */
export interface ConflictSource {
  readonly url: string;
  readonly category: string;
  readonly value: string;
}

// ---------------------------------------------------------------------------
// Stale Content Detection
// ---------------------------------------------------------------------------

/** Threshold in months for content to be considered stale (AC-2). */
export const STALE_CONTENT_THRESHOLD_MONTHS = 12;

/** Minimum word count for a page to not be flagged as low content (AC-2). */
export const LOW_CONTENT_WORD_THRESHOLD = 200;

/** Percentage threshold for critical data quality alert (AC-6). */
export const CRITICAL_ALERT_THRESHOLD = 0.5;

/** Tone score difference threshold for conflict detection (AC-4). */
export const TONE_CONFLICT_THRESHOLD = 2;

/** Minimum workshop focus areas to generate (AC-5). */
export const MIN_WORKSHOP_FOCUS_AREAS = 3;

/** Maximum workshop focus areas to generate (AC-5). */
export const MAX_WORKSHOP_FOCUS_AREAS = 5;

// ---------------------------------------------------------------------------
// Focus Area Templates (Dev Notes)
// ---------------------------------------------------------------------------

/** Pre-defined templates for workshop focus area topics. */
export const FOCUS_AREA_TEMPLATES: Record<string, string> = {
  inconsistent_branding:
    'Clarify brand tone -- inconsistency detected between {source_a} and {source_b}',
  missing_category: 'Provide {category} examples -- not included in URL set',
  inaccessible_url: 'Verify digital presence at {url} -- could not be analyzed',
  stale_content: 'Review and refresh content at {url} -- appears outdated',
  low_content_density: 'Expand content depth at {url} -- insufficient for analysis',
} as const;

// ---------------------------------------------------------------------------
// Required URL Categories for missing_category detection
// ---------------------------------------------------------------------------

/** Categories that should ideally be present for a thorough audit. */
export const RECOMMENDED_CATEGORIES = ['website', 'instagram', 'linkedin_company'] as const;

// ---------------------------------------------------------------------------
// Dependencies (DI)
// ---------------------------------------------------------------------------

/** Dependencies injected into the DataQualityAnalyzer. */
export interface DataQualityAnalyzerDeps {
  readonly r2Client: AuditR2Client;
  readonly clickUpClient?: AuditClickUpClient;
  readonly clickUpTaskId?: string;
  readonly logger?: AuditLogger;
}

// ---------------------------------------------------------------------------
// ClickUp Critical Alert Message (AC-6)
// ---------------------------------------------------------------------------

/** Standard ClickUp comment posted when critical data quality alert is triggered. */
export const CRITICAL_ALERT_CLICKUP_MESSAGE =
  'Audit data quality is critically low. Recommend manual brand brief instead of audit-assisted mode.';
