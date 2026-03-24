/**
 * @brand-system/moderation — Automated content moderation filters
 *
 * Provides comprehensive moderation for AI-generated brand content:
 * - Profanity detection (word list + AI context)
 * - Competitor mention flagging
 * - Brand forbidden words checking
 * - Factual claims verification flagging
 * - Legal compliance risk detection
 *
 * @module moderation
 */

// Main orchestrator
export { ContentModerator } from './moderator';

// Types
export type {
  ModerationContext,
  ModerationOptions,
  ModerationResult,
  ModerationFlag,
  ModerationSeverity,
  FilterType,
  AIBatchCheckResponse,
} from './types';

// Logging
export { logModerationRun } from './mod-logger';

// Individual filters (for advanced usage)
export { checkProfanity, parseProfanityFromBatch } from './filters/profanity';
export { checkCompetitorMentions } from './filters/competitor';
export { checkForbiddenWords } from './filters/forbidden-words';
export { parseFactualClaimsFromBatch } from './filters/factual-claims';
export { parseLegalComplianceFromBatch } from './filters/legal-compliance';
