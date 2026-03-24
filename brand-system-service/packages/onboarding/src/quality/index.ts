/**
 * Data Quality module -- Audit Data Quality Handling (BSS-7.5).
 *
 * Evaluates audit-report.json to produce data-quality-report.json with
 * issue classification, conflict detection, workshop recommendations,
 * and confidence scoring.
 *
 * @module onboarding/quality
 */

// Types
export type {
  IssueType,
  IssueSeverity,
  DataQualityIssue,
  WorkshopFocusArea,
  OverallConfidence,
  DataQualityReport,
  UrlAccessibilityStatus,
  BrandingConflict,
  ConflictSource,
  DataQualityAnalyzerDeps,
} from './quality-types';

export {
  STALE_CONTENT_THRESHOLD_MONTHS,
  LOW_CONTENT_WORD_THRESHOLD,
  CRITICAL_ALERT_THRESHOLD,
  TONE_CONFLICT_THRESHOLD,
  MIN_WORKSHOP_FOCUS_AREAS,
  MAX_WORKSHOP_FOCUS_AREAS,
  FOCUS_AREA_TEMPLATES,
  RECOMMENDED_CATEGORIES,
  CRITICAL_ALERT_CLICKUP_MESSAGE,
} from './quality-types';

// Analyzer
export { DataQualityAnalyzer, buildDataQualityR2Key } from './quality-analyzer';

// Conflict Detector
export {
  ConflictDetector,
  classifyColorFamily,
  getDominantColorFamily,
} from './conflict-detector';

// Workshop Recommender
export { WorkshopRecommender } from './workshop-recommender';
