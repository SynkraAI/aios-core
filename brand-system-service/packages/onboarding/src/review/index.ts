/**
 * Human Review Interface module (BSS-7.7).
 *
 * @module onboarding/review
 */

// Review Manager
export { ReviewManager } from './review-manager';
export type { StandardModeArtifacts, AuditAssistedArtifacts } from './review-manager';

// Color Reviewer
export {
  ColorReviewer,
  computeContrastPairs,
  calculateContrastRatio,
  isValidHex,
  normalizeHex,
  parseHexToRgb,
  WCAG_AA_THRESHOLD,
  WCAG_AA_LARGE_THRESHOLD,
} from './color-reviewer';

// Typography Reviewer
export { TypographyReviewer } from './typography-reviewer';

// Moodboard Reviewer
export { MoodboardReviewer } from './moodboard-reviewer';

// Voice Reviewer
export { VoiceReviewer } from './voice-reviewer';

// Token Reviewer
export { TokenReviewer, flattenTokens, unflattenTokens } from './token-reviewer';

// Approval Handler
export {
  ApprovalHandler,
  areAllSectionsSaved,
  REQUIRED_SECTIONS,
  CLICKUP_READY_FOR_CLIENT_REVIEW,
} from './approval-handler';
export type { ApprovalData, ApprovalResult } from './approval-handler';

// Types
export type {
  OnboardingMode,
  ModeDetectionResult,
  ReviewSectionId,
  ReviewSectionStatus,
  ReviewSectionState,
  ContrastPairResult,
  ColorReviewData,
  TypographyReviewData,
  MoodboardImageStatus,
  MoodboardImageReview,
  MoodboardReviewData,
  RegenerationRequest,
  VoiceReviewData,
  EditableToneScale,
  EditableVocabularyGuide,
  FlattenedToken,
  TokenReviewData,
  DataQualityWarning,
  ReviewState,
  ApprovedDirection,
  ReviewR2Client,
  ReviewClickUpClient,
  ReviewManagerDeps,
} from './review-types';

export {
  MIN_APPROVED_MOODBOARD_IMAGES,
  AUTO_SAVE_INTERVAL_MS,
  AI_DRAFT_BADGE_LABEL,
  buildApprovedDirectionR2Key,
  buildAnalysisSummaryR2Key,
  buildDraftManifestR2Key,
  buildDataQualityReportR2Key,
} from './review-types';
