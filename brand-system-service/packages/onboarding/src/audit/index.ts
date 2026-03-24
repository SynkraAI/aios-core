/**
 * Audit module — URL Collection (BSS-7.2) + Digital Presence Audit (BSS-7.3).
 *
 * Entry point for audit URL collection, validation, persistence,
 * and automated digital presence analysis.
 *
 * @module onboarding/audit
 */

// ---------------------------------------------------------------------------
// BSS-7.2: URL Collection Types
// ---------------------------------------------------------------------------

export type {
  URLCategory,
  AuditUrl,
  AuditUrlCollection,
  AuditCollectionMetadata,
  URLValidationResult,
  CollectionValidationResult,
  URLCollectionSubmitResult,
  URLCollectorDeps,
} from './types';

export {
  URL_CATEGORIES,
  HIGH_VALUE_CATEGORIES,
  MULTI_ENTRY_CATEGORIES,
  MAX_OTHER_URLS,
  MAX_LANDING_PAGE_URLS,
  MIN_URLS_REQUIRED,
  LOW_URL_WARNING_THRESHOLD,
  CON18_DISCLAIMER,
  LOW_URL_WARNING_MESSAGE,
  DUPLICATE_URL_MESSAGE,
  START_AUDIT_CTA_LABEL,
} from './types';

// Validation
export {
  validateUrl,
  isValidCategory,
  isDuplicateUrl,
  validateCategoryLimit,
  validateCollection,
} from './url-validator';

// Collector
export { URLCollector, buildAuditUrlsR2Key } from './url-collector';

// ---------------------------------------------------------------------------
// BSS-7.3: Automated Digital Presence Audit Types
// ---------------------------------------------------------------------------

export type {
  ConfidenceLevel,
  PageAnalysis,
  HeadingEntry,
  ToneAnalysis,
  MessagingAnalysis,
  MessagingContradiction,
  VisualAnalysis,
  ColorCluster,
  TypographyAssessment,
  ImageryStyleAssessment,
  ImprovementItem,
  CompetitiveGapAnalysis,
  CompetitiveGap,
  InferenceItem,
  AuditReport,
  AuditPipelineStatus,
  AuditUrlProgress,
  AuditPipelineProgress,
  HttpFetcher,
  FetchOptions,
  FetchResult,
  AuditAIService,
  AuditAIOptions,
  AuditAIResponse,
  AuditR2Client,
  AuditClickUpClient,
  AuditPipelineDeps,
  AuditLogger,
  AuditPipelineConfig,
} from './audit-types';

export { DEFAULT_AUDIT_CONFIG } from './audit-types';

// ---------------------------------------------------------------------------
// BSS-7.3: Pipeline and Analyzers
// ---------------------------------------------------------------------------

export { AuditPipeline, buildAuditReportR2Key } from './audit-pipeline';
export { PageFetcher } from './page-fetcher';
export {
  isAllowedByRobotsTxt,
  parseRobotsTxtAllows,
  extractTitle,
  extractMetaDescription,
  extractHeadings,
  extractColors,
  extractFonts,
  extractTextContent,
} from './page-fetcher';
export { ToneAnalyzer, calculateToneConfidence } from './tone-analyzer';
export { MessagingAnalyzer, calculateMessagingConfidence } from './messaging-analyzer';
export { VisualAnalyzer, clusterColors, assessTypography, calculateVisualConfidence } from './visual-analyzer';
export { CompetitiveAnalyzer } from './competitive-analyzer';
