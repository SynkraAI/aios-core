/**
 * @brand-system/onboarding — Multi-step intake flow for BSS.
 *
 * @module onboarding
 */

// Main handler
export { IntakeHandler, IntakeError, IntakeValidationError } from './intake-handler';
export type { IntakeHandlerConfig, IntakeHandlerDependencies, IntakeFormSummary } from './intake-handler';

// Mood tiles
export { MOOD_TILES, MOOD_TILE_MAP, getMoodTileById, getInvalidMoodIds } from './mood-tiles';

// Validators
export {
  isValidUrl,
  validateCompetitorUrls,
  validateLogoFile,
  validateAssetUpload,
  validateCompanyBasics,
  validateBrandPersonality,
  validateVisualPreferences,
  validateAssetUploadStep,
  validateCompetitorUrlsStep,
  validateDeliverableSelection,
  validateIntakeFormData,
  MIN_COMPETITOR_URLS,
  MAX_COMPETITOR_URLS,
} from './validators';

// Types
export type {
  CompanyBasics,
  BrandPersonality,
  PersonalityScaleValue,
  PersonalityScale,
  PersonalityDimension,
  MoodTile,
  VisualPreference,
  AssetFileInfo,
  AssetUpload,
  CompetitorUrl,
  CompetitorUrls,
  DeliverableSelection,
  BSSDeliverableType,
  IntakeFormData,
  IntakeRecord,
  IntakeMetadata,
  IntakeSession,
  IntakeProgress,
  IntakeStepId,
  IntakeSubmissionResult,
  ClickUpClient,
  ClickUpTaskPayload,
  ClickUpCustomField,
  ClickUpTaskResult,
  R2StorageClient,
  SessionStorage,
  ValidationResult,
  ValidationError,
} from './types';

export {
  INTAKE_STEPS,
  TOTAL_STEPS,
  AVG_MINUTES_PER_STEP,
  STEP_NUMBER_MAP,
  PERSONALITY_DIMENSIONS,
  BSS_DELIVERABLE_TYPES,
  ALLOWED_LOGO_EXTENSIONS,
  ALLOWED_LOGO_MIME_TYPES,
  MAX_ASSET_FILE_SIZE_BYTES,
} from './types';

// Analysis Pipeline (BSS-7.6)
export {
  AnalysisPipeline,
  CompetitorAnalyzer,
  ColorGenerator,
  TypographyGenerator,
  MoodboardGenerator,
  VoiceGenerator,
  TokenDraftGenerator,
  containsLogoTerms,
  ANALYSIS_PHASES,
} from './analysis';

export type {
  AnalysisPhase,
  PhaseStatus,
  PipelineProgressEvent,
  ProgressCallback,
  AnalysisPipelineConfig,
  AnalysisPipelineDeps,
  AnalysisSummary,
  PhaseDuration,
  CompetitorVisualAnalysis,
  CompetitorAnalysisResult,
  ColorValue,
  ColorRole,
  PaletteColor,
  ColorPalette,
  FontSpec,
  TypographyPairing,
  TypographyResult,
  MoodboardImage,
  MoodboardManifest,
  ToneScale,
  VocabularyGuide,
  BrandVoiceDefinition,
  DTCGToken,
  DTCGTokenGroup,
  TokensDraft,
  ScreenshotProvider,
  AITextProvider,
  AIVisionProvider,
  AIImageProvider,
  AnalysisR2Client,
  AnalysisClickUpClient,
} from './analysis';

// Draft Generation Pipeline (BSS-7.4)
export {
  DraftPipeline,
  isLowConfidence,
  getHighConfidencePercentage,
  generateBrandVoiceDraft,
  generateMessagingFrameworkDraft,
  generateMoodboardDirectionDraft,
  generateImprovementSuggestionsDraft,
  detectChannels,
  DRAFT_PREAMBLE,
  LOW_CONFIDENCE_WARNING,
  DRAFT_FILENAMES,
  buildDraftR2Key,
} from './drafts';

export type {
  DraftValidationStatus,
  DraftBase,
  ToneSpectrumEntry,
  VocabularyExample,
  CommunicationGuideline,
  BrandVoiceDraft,
  MessagingPillar,
  MessagingFrameworkDraft,
  VisualDirectionTag,
  ColorSeed,
  TypographyDirection,
  MoodboardDirectionDraft,
  ImprovementSuggestion,
  ChannelImprovements,
  ImprovementSuggestionsDraft,
  DraftManifestEntry,
  DraftManifest,
  DraftPipelineDeps,
  DraftPipelineResult,
} from './drafts';

// Data Quality (BSS-7.5)
export {
  DataQualityAnalyzer,
  buildDataQualityR2Key,
  ConflictDetector,
  classifyColorFamily,
  getDominantColorFamily,
  WorkshopRecommender,
  STALE_CONTENT_THRESHOLD_MONTHS,
  LOW_CONTENT_WORD_THRESHOLD,
  CRITICAL_ALERT_THRESHOLD,
  TONE_CONFLICT_THRESHOLD,
  MIN_WORKSHOP_FOCUS_AREAS,
  MAX_WORKSHOP_FOCUS_AREAS,
  FOCUS_AREA_TEMPLATES,
  RECOMMENDED_CATEGORIES,
  CRITICAL_ALERT_CLICKUP_MESSAGE,
} from './quality';

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
} from './quality';

// Human Review Interface (BSS-7.7)
export {
  ReviewManager,
  ColorReviewer,
  TypographyReviewer,
  MoodboardReviewer,
  VoiceReviewer,
  TokenReviewer,
  ApprovalHandler,
  computeContrastPairs,
  calculateContrastRatio,
  isValidHex,
  normalizeHex,
  parseHexToRgb,
  flattenTokens,
  unflattenTokens,
  areAllSectionsSaved,
  REQUIRED_SECTIONS,
  CLICKUP_READY_FOR_CLIENT_REVIEW,
  MIN_APPROVED_MOODBOARD_IMAGES,
  AUTO_SAVE_INTERVAL_MS,
  AI_DRAFT_BADGE_LABEL,
  WCAG_AA_THRESHOLD,
  WCAG_AA_LARGE_THRESHOLD,
  buildApprovedDirectionR2Key,
  buildAnalysisSummaryR2Key,
  buildDraftManifestR2Key,
  buildDataQualityReportR2Key,
} from './review';

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
  ApprovalData,
  ApprovalResult,
  StandardModeArtifacts,
  AuditAssistedArtifacts,
} from './review';

// Client Approval Flow (BSS-7.8)
export {
  ClientApprovalHandler,
  PreviewGenerator,
  CLIENT_APPROVAL_SECTIONS,
  CLICKUP_CLIENT_APPROVED,
  CLICKUP_CHANGES_REQUESTED,
  PREVIEW_DISCLAIMER,
  APPROVAL_CONFIRMATION_TEXT,
  buildClientApprovalR2Key,
  buildClientPreviewR2Key,
} from './approval';

export type {
  ClientApprovalSection,
  ChangeRequest,
  ClientApproval,
  ClientPreviewData,
  ApprovalFlowResult,
  ApprovalR2Client,
  ApprovalClickUpClient,
  ClientApprovalHandlerDeps,
} from './approval';

// Automated Client Setup (BSS-7.9)
export {
  ClientSetupPipeline,
  TokenFileGenerator,
  HostingConfigurator,
  SetupEmailSender,
  CLICKUP_SETUP_COMPLETE,
  CLICKUP_SETUP_COMPLETE_MESSAGE,
  CLICKUP_SETUP_FAILED_PREFIX,
  buildTokenR2Key,
  buildClientConfigR2Key,
  buildSetupSummaryR2Key,
  buildSetupNotesR2Key,
  buildAssetDestR2Key,
  buildIntakeR2Key,
} from './setup';

export type {
  HostingProvider,
  SetupStepName,
  SetupStepStatus,
  SetupStep,
  ManualAction,
  SetupSummary,
  ClientConfig,
  SetupNotes,
  TokenFilePaths,
  SetupR2Client,
  SetupClickUpClient,
  SetupEmailClient,
  HostingClient,
  SetupPipelineDeps,
  HostingConfigResult,
  SetupNotificationParams,
  EmailSendResult,
} from './setup';
