/**
 * DraftPipeline — Orchestrates all 4 draft generators (BSS-7.4).
 *
 * Runs all drafters in parallel, applies low-confidence warning (AC-8 / NFR-9.7),
 * persists to R2 (AC-6), writes manifest (AC-7), and posts ClickUp comment (AC-9).
 *
 * @module onboarding/drafts/draft-pipeline
 */

import type { AuditReport, ConfidenceLevel } from '../audit/audit-types';
import type {
  DraftPipelineDeps,
  DraftPipelineResult,
  DraftManifest,
  DraftManifestEntry,
  BrandVoiceDraft,
  MessagingFrameworkDraft,
  MoodboardDirectionDraft,
  ImprovementSuggestionsDraft,
  DraftBase,
} from './draft-types';
import { LOW_CONFIDENCE_WARNING, DRAFT_FILENAMES, buildDraftR2Key } from './draft-types';
import { generateBrandVoiceDraft } from './brand-voice-drafter';
import { generateMessagingFrameworkDraft } from './messaging-drafter';
import { generateMoodboardDirectionDraft } from './moodboard-direction-drafter';
import { generateImprovementSuggestionsDraft } from './improvement-drafter';

// ---------------------------------------------------------------------------
// Confidence Calculation (AC-8 / NFR-9.7)
// ---------------------------------------------------------------------------

/**
 * Calculate the percentage of High confidence inferences in the audit report.
 * Returns true if the report is low-confidence (< 30% High inferences).
 */
export function isLowConfidence(report: AuditReport): boolean {
  const inferences = report.inferences;
  if (inferences.length === 0) return true;

  const highCount = inferences.filter((i) => i.confidence === 'High').length;
  const highPercentage = (highCount / inferences.length) * 100;

  return highPercentage < 30;
}

/**
 * Get the High confidence percentage for diagnostic purposes.
 */
export function getHighConfidencePercentage(report: AuditReport): number {
  const inferences = report.inferences;
  if (inferences.length === 0) return 0;

  const highCount = inferences.filter((i) => i.confidence === 'High').length;
  return Math.round((highCount / inferences.length) * 100);
}

// ---------------------------------------------------------------------------
// Low Confidence Warning Application
// ---------------------------------------------------------------------------

/**
 * Apply low-confidence warning to a draft document.
 * Returns a new draft with the _low_confidence_warning field set.
 */
function applyLowConfidenceWarning<T extends DraftBase>(draft: T): T {
  return {
    ...draft,
    _low_confidence_warning: LOW_CONFIDENCE_WARNING,
  };
}

// ---------------------------------------------------------------------------
// DraftPipeline
// ---------------------------------------------------------------------------

/**
 * Orchestrates AI draft generation from an audit report.
 *
 * Usage:
 * ```typescript
 * const pipeline = new DraftPipeline(deps);
 * const result = await pipeline.run(auditReport, 'client-123');
 * ```
 */
export class DraftPipeline {
  private readonly deps: DraftPipelineDeps;

  constructor(deps: DraftPipelineDeps) {
    this.deps = deps;
  }

  /**
   * Run the complete draft generation pipeline.
   *
   * 1. Generate all 4 drafts in parallel (4 AI calls)
   * 2. Apply low-confidence warning if needed (AC-8)
   * 3. Persist all drafts + manifest to R2 (AC-6, AC-7)
   * 4. Post ClickUp comment (AC-9)
   *
   * @param report - The audit report from BSS-7.3
   * @param clientId - Client identifier
   * @returns DraftPipelineResult with all drafts and manifest
   */
  async run(report: AuditReport, clientId: string): Promise<DraftPipelineResult> {
    const { aiService, logger } = this.deps;
    const startTime = Date.now();

    logger?.info(`Starting draft generation pipeline for client ${clientId}`);

    // Step 1: Generate all 4 drafts in parallel (AC-1 through AC-4)
    const [brandVoiceRaw, messagingRaw, moodboardRaw, improvementsRaw] = await Promise.all([
      generateBrandVoiceDraft(report, aiService, clientId, logger),
      generateMessagingFrameworkDraft(report, aiService, clientId, logger),
      generateMoodboardDirectionDraft(report, aiService, clientId, logger),
      generateImprovementSuggestionsDraft(report, aiService, clientId, logger),
    ]);

    // Step 2: Check confidence and apply warning if needed (AC-8 / NFR-9.7)
    const lowConfidence = isLowConfidence(report);
    const highPct = getHighConfidencePercentage(report);

    if (lowConfidence) {
      logger?.warn(
        `Low confidence audit data (${highPct}% High inferences) — prepending warning to all drafts`,
      );
    }

    const brandVoice = lowConfidence
      ? applyLowConfidenceWarning(brandVoiceRaw)
      : brandVoiceRaw;
    const messagingFramework = lowConfidence
      ? applyLowConfidenceWarning(messagingRaw)
      : messagingRaw;
    const moodboardDirection = lowConfidence
      ? applyLowConfidenceWarning(moodboardRaw)
      : moodboardRaw;
    const improvementSuggestions = lowConfidence
      ? applyLowConfidenceWarning(improvementsRaw)
      : improvementsRaw;

    // Step 3: Persist all drafts to R2 (AC-6)
    await this.persistDrafts(clientId, brandVoice, messagingFramework, moodboardDirection, improvementSuggestions);

    // Step 4: Write manifest (AC-7)
    const manifest = this.buildManifest(clientId, brandVoice, messagingFramework, moodboardDirection, improvementSuggestions);
    await this.persistManifest(clientId, manifest);

    // Step 5: Post ClickUp comment (AC-9)
    await this.postClickUpComment(clientId, manifest);

    const elapsed = Date.now() - startTime;
    logger?.info(`Draft generation pipeline complete in ${elapsed}ms for client ${clientId}`);

    return {
      brandVoice,
      messagingFramework,
      moodboardDirection,
      improvementSuggestions,
      manifest,
      lowConfidence,
    };
  }

  // -------------------------------------------------------------------------
  // R2 Persistence (AC-6)
  // -------------------------------------------------------------------------

  private async persistDrafts(
    clientId: string,
    brandVoice: BrandVoiceDraft,
    messagingFramework: MessagingFrameworkDraft,
    moodboardDirection: MoodboardDirectionDraft,
    improvementSuggestions: ImprovementSuggestionsDraft,
  ): Promise<void> {
    const { r2Client, logger } = this.deps;

    const uploads = [
      { key: buildDraftR2Key(clientId, DRAFT_FILENAMES.brandVoice), data: brandVoice },
      { key: buildDraftR2Key(clientId, DRAFT_FILENAMES.messagingFramework), data: messagingFramework },
      { key: buildDraftR2Key(clientId, DRAFT_FILENAMES.moodboardDirection), data: moodboardDirection },
      { key: buildDraftR2Key(clientId, DRAFT_FILENAMES.improvementSuggestions), data: improvementSuggestions },
    ];

    await Promise.all(
      uploads.map(async ({ key, data }) => {
        try {
          await r2Client.uploadJson(key, data);
          logger?.info(`Draft persisted to R2: ${key}`);
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Failed to persist draft to R2 (${key}): ${msg}`);
        }
      }),
    );
  }

  // -------------------------------------------------------------------------
  // Manifest (AC-7)
  // -------------------------------------------------------------------------

  private buildManifest(
    clientId: string,
    brandVoice: BrandVoiceDraft,
    messagingFramework: MessagingFrameworkDraft,
    moodboardDirection: MoodboardDirectionDraft,
    improvementSuggestions: ImprovementSuggestionsDraft,
  ): DraftManifest {
    const now = new Date().toISOString();

    const drafts: DraftManifestEntry[] = [
      {
        filename: DRAFT_FILENAMES.brandVoice,
        draft_type: 'brand-voice',
        generated_at: brandVoice.generated_at,
        validation_status: 'pending',
      },
      {
        filename: DRAFT_FILENAMES.messagingFramework,
        draft_type: 'messaging-framework',
        generated_at: messagingFramework.generated_at,
        validation_status: 'pending',
      },
      {
        filename: DRAFT_FILENAMES.moodboardDirection,
        draft_type: 'moodboard-direction',
        generated_at: moodboardDirection.generated_at,
        validation_status: 'pending',
      },
      {
        filename: DRAFT_FILENAMES.improvementSuggestions,
        draft_type: 'improvement-suggestions',
        generated_at: improvementSuggestions.generated_at,
        validation_status: 'pending',
      },
    ];

    return {
      client_id: clientId,
      generated_at: now,
      source_audit_version: brandVoice.source_audit_version,
      validation_status: 'pending',
      drafts,
    };
  }

  private async persistManifest(clientId: string, manifest: DraftManifest): Promise<void> {
    const { r2Client, logger } = this.deps;
    const key = buildDraftR2Key(clientId, DRAFT_FILENAMES.manifest);

    try {
      await r2Client.uploadJson(key, manifest);
      logger?.info(`Draft manifest persisted to R2: ${key}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to persist draft manifest to R2: ${msg}`);
    }
  }

  // -------------------------------------------------------------------------
  // ClickUp Notification (AC-9)
  // -------------------------------------------------------------------------

  private async postClickUpComment(clientId: string, manifest: DraftManifest): Promise<void> {
    const { clickUpClient, clickUpTaskId, logger } = this.deps;

    if (!clickUpClient || !clickUpTaskId) {
      logger?.info('ClickUp not configured — skipping notification');
      return;
    }

    try {
      const draftLinks = manifest.drafts
        .map(
          (d) =>
            `- ${d.draft_type}: r2://brand-assets/${clientId}/onboarding/ai-drafts/${d.filename}`,
        )
        .join('\n');

      const comment = [
        '**AI Draft Generation Complete**',
        '',
        `Generated ${manifest.drafts.length} draft documents for client ${clientId}.`,
        '',
        '**Draft Files:**',
        draftLinks,
        '',
        `**Manifest:** r2://brand-assets/${clientId}/onboarding/ai-drafts/index.json`,
        '',
        'All drafts are labeled "AI Draft - Requires Human Validation".',
        'Review via the Human Review Interface (BSS-7.7) before use.',
      ].join('\n');

      await clickUpClient.postComment(clickUpTaskId, comment);
      logger?.info('ClickUp notification posted for draft generation');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger?.warn(`ClickUp comment failed (non-critical): ${msg}`);
      // Non-blocking — don't throw
    }
  }
}
