/**
 * Drafts module — AI Draft Generation from Audit (BSS-7.4).
 *
 * Entry point for draft generation pipeline, individual drafters,
 * and all draft-related types.
 *
 * @module onboarding/drafts
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
} from './draft-types';

export {
  DRAFT_PREAMBLE,
  LOW_CONFIDENCE_WARNING,
  DRAFT_FILENAMES,
  buildDraftR2Key,
} from './draft-types';

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

export { generateBrandVoiceDraft } from './brand-voice-drafter';
export { generateMessagingFrameworkDraft } from './messaging-drafter';
export { generateMoodboardDirectionDraft } from './moodboard-direction-drafter';
export { generateImprovementSuggestionsDraft, detectChannels } from './improvement-drafter';

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export { DraftPipeline, isLowConfidence, getHighConfidencePercentage } from './draft-pipeline';
