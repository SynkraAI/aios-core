/**
 * Types for AI Draft Generation from Audit (BSS-7.4).
 *
 * Defines the draft document shapes for Brand Voice Guide, Messaging Framework,
 * Moodboard Direction, and Improvement Suggestions — all generated from the
 * audit report produced by BSS-7.3.
 *
 * @module onboarding/drafts/draft-types
 */

import type {
  AuditReport,
  AuditAIService,
  AuditR2Client,
  AuditClickUpClient,
  AuditLogger,
  ConfidenceLevel,
} from '../audit/audit-types';

// ---------------------------------------------------------------------------
// Common Draft Fields (FR-10.4, CON-17)
// ---------------------------------------------------------------------------

/**
 * Validation status for draft documents (AC-5, AC-7).
 *
 * - pending: generated but not yet reviewed
 * - reviewed: human has reviewed but not approved
 * - approved: human has approved for use
 */
export type DraftValidationStatus = 'pending' | 'reviewed' | 'approved';

/**
 * Base fields present in all draft documents (FR-10.4, CON-17).
 */
export interface DraftBase {
  /** FR-10.4: Flag for Human Review Interface (BSS-7.7). */
  readonly _ai_draft: true;
  /** FR-10.4: Flag for Human Review Interface (BSS-7.7). */
  readonly _requires_validation: true;
  /** FR-10.4: Human-readable label. */
  readonly _label: 'AI Draft - Requires Human Validation';
  /** CON-17: Preamble reminding users this is AI-generated. */
  readonly _preamble: string;
  /** Low-confidence warning prepended when < 30% High inferences (NFR-9.7). */
  readonly _low_confidence_warning?: string;
  /** Validation status for the draft (AC-7). */
  readonly validation_status: DraftValidationStatus;
  /** ISO 8601 timestamp of generation. */
  readonly generated_at: string;
  /** Client ID this draft belongs to. */
  readonly client_id: string;
  /** Version of the source audit report. */
  readonly source_audit_version: string;
}

// ---------------------------------------------------------------------------
// CON-17 Preamble
// ---------------------------------------------------------------------------

/** Standard CON-17 preamble text for all drafts. */
export const DRAFT_PREAMBLE =
  'These drafts are AI-generated from automated analysis and must be validated during the discovery workshop. They represent a starting hypothesis, not final brand direction.';

/** NFR-9.7 low-confidence warning text. */
export const LOW_CONFIDENCE_WARNING =
  'Low source confidence — these drafts are based on limited data. Discovery workshop findings should take priority.';

// ---------------------------------------------------------------------------
// AC-1: Brand Voice Guide Draft
// ---------------------------------------------------------------------------

/** Tone spectrum entry in the brand voice guide. */
export interface ToneSpectrumEntry {
  readonly dimension: string;
  readonly position: number; // 1-5 scale
  readonly label: string;
  readonly description: string;
}

/** Vocabulary example extracted from client content. */
export interface VocabularyExample {
  readonly word: string;
  readonly context: string;
  readonly frequency: 'frequent' | 'occasional' | 'rare';
}

/** Communication do's and don'ts. */
export interface CommunicationGuideline {
  readonly type: 'do' | 'dont';
  readonly guideline: string;
  readonly rationale: string;
}

/** Draft Brand Voice Guide (AC-1). */
export interface BrandVoiceDraft extends DraftBase {
  readonly draft_type: 'brand-voice';
  readonly tone_spectrum: readonly ToneSpectrumEntry[];
  readonly vocabulary_examples: readonly VocabularyExample[];
  readonly communication_guidelines: readonly CommunicationGuideline[];
}

// ---------------------------------------------------------------------------
// AC-2: Messaging Framework Draft
// ---------------------------------------------------------------------------

/** Supporting pillar in the messaging framework. */
export interface MessagingPillar {
  readonly title: string;
  readonly description: string;
  readonly supporting_evidence: string;
}

/** Draft Messaging Framework (AC-2). */
export interface MessagingFrameworkDraft extends DraftBase {
  readonly draft_type: 'messaging-framework';
  readonly value_proposition: string;
  readonly supporting_pillars: readonly MessagingPillar[];
  readonly elevator_pitch: string;
}

// ---------------------------------------------------------------------------
// AC-3: Moodboard Direction Draft
// ---------------------------------------------------------------------------

/** Visual direction tag for moodboard. */
export interface VisualDirectionTag {
  readonly tag: string;
  readonly description: string;
  readonly derived_from: string;
}

/** Color seed for moodboard direction. */
export interface ColorSeed {
  readonly hex: string;
  readonly name: string;
  readonly role: string;
}

/** Typography direction suggestion. */
export interface TypographyDirection {
  readonly category: 'heading' | 'body' | 'accent';
  readonly suggestion: string;
  readonly rationale: string;
}

/** Draft Moodboard Direction (AC-3). */
export interface MoodboardDirectionDraft extends DraftBase {
  readonly draft_type: 'moodboard-direction';
  readonly visual_direction_tags: readonly VisualDirectionTag[];
  readonly color_seeds: readonly ColorSeed[];
  readonly typography_direction: readonly TypographyDirection[];
}

// ---------------------------------------------------------------------------
// AC-4: Improvement Suggestions Draft
// ---------------------------------------------------------------------------

/** A single improvement suggestion for a channel. */
export interface ImprovementSuggestion {
  readonly suggestion: string;
  readonly rationale: string;
  readonly priority: 'high' | 'medium' | 'low';
}

/** Improvement suggestions for a specific channel. */
export interface ChannelImprovements {
  readonly channel: string;
  readonly channel_type: 'website' | 'landing_page' | 'social';
  readonly suggestions: readonly ImprovementSuggestion[];
}

/** Draft Improvement Suggestions (AC-4). */
export interface ImprovementSuggestionsDraft extends DraftBase {
  readonly draft_type: 'improvement-suggestions';
  readonly channels: readonly ChannelImprovements[];
}

// ---------------------------------------------------------------------------
// AC-7: Draft Manifest
// ---------------------------------------------------------------------------

/** Entry in the draft manifest for a single draft file. */
export interface DraftManifestEntry {
  readonly filename: string;
  readonly draft_type: string;
  readonly generated_at: string;
  readonly validation_status: DraftValidationStatus;
}

/** Manifest file listing all generated drafts (AC-7). */
export interface DraftManifest {
  readonly client_id: string;
  readonly generated_at: string;
  readonly source_audit_version: string;
  readonly validation_status: DraftValidationStatus;
  readonly drafts: readonly DraftManifestEntry[];
}

// ---------------------------------------------------------------------------
// Draft Pipeline Dependencies
// ---------------------------------------------------------------------------

/** Dependencies injected into the DraftPipeline. */
export interface DraftPipelineDeps {
  readonly aiService: AuditAIService;
  readonly r2Client: AuditR2Client;
  readonly clickUpClient?: AuditClickUpClient;
  readonly clickUpTaskId?: string;
  readonly logger?: AuditLogger;
}

/** Result of the draft pipeline execution. */
export interface DraftPipelineResult {
  readonly brandVoice: BrandVoiceDraft;
  readonly messagingFramework: MessagingFrameworkDraft;
  readonly moodboardDirection: MoodboardDirectionDraft;
  readonly improvementSuggestions: ImprovementSuggestionsDraft;
  readonly manifest: DraftManifest;
  readonly lowConfidence: boolean;
}

// ---------------------------------------------------------------------------
// R2 Key Helpers
// ---------------------------------------------------------------------------

/** Build R2 key for draft files. */
export function buildDraftR2Key(clientId: string, filename: string): string {
  return `brand-assets/${clientId}/onboarding/ai-drafts/${filename}`;
}

/** Standard draft file names (AC-6). */
export const DRAFT_FILENAMES = {
  brandVoice: 'brand-voice-draft.json',
  messagingFramework: 'messaging-framework-draft.json',
  moodboardDirection: 'moodboard-direction-draft.json',
  improvementSuggestions: 'improvement-suggestions-draft.json',
  manifest: 'index.json',
} as const;
