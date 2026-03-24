/**
 * Voice Definition Reviewer (BSS-7.7, AC 5).
 *
 * Manages inline editing of tone spectrum, vocabulary guide, and
 * communication guidelines. Tracks dirty state for auto-save.
 *
 * @module onboarding/review/voice-reviewer
 */

import type { BrandVoiceDefinition, ToneScale, VocabularyGuide } from '../analysis/analysis-types';
import type {
  VoiceReviewData,
  EditableToneScale,
  EditableVocabularyGuide,
  ReviewR2Client,
} from './review-types';
import { AUTO_SAVE_INTERVAL_MS } from './review-types';

/**
 * VoiceReviewer manages the voice definition review section.
 *
 * - Loads voice definition from analysis or audit-assisted pipeline.
 * - Allows inline editing of tone scales, vocabulary, and guidelines.
 * - Tracks dirty state for auto-save scheduling.
 * - Auto-save writes edited voice to R2 every 30 seconds.
 */
export class VoiceReviewer {
  private toneScales: EditableToneScale[];
  private vocabularyGuide: EditableVocabularyGuide;
  private communicationGuidelines: string[];
  private isDirty: boolean;
  private lastAutoSaveAt?: string;
  private autoSaveTimer: ReturnType<typeof setInterval> | null;
  private readonly r2Client?: ReviewR2Client;
  private readonly r2Key?: string;

  constructor(
    voiceDefinition: BrandVoiceDefinition,
    options?: { r2Client?: ReviewR2Client; r2Key?: string }
  ) {
    this.toneScales = voiceDefinition.toneScales.map((ts) => ({
      dimension: ts.dimension,
      leftPole: ts.leftPole,
      rightPole: ts.rightPole,
      position: ts.position,
    }));
    this.vocabularyGuide = {
      useWords: [...voiceDefinition.vocabularyGuide.useWords],
      avoidWords: [...voiceDefinition.vocabularyGuide.avoidWords],
    };
    this.communicationGuidelines = [...voiceDefinition.communicationGuidelines];
    this.isDirty = false;
    this.autoSaveTimer = null;
    this.r2Client = options?.r2Client;
    this.r2Key = options?.r2Key;
  }

  /** Returns the current review data snapshot. */
  getReviewData(): VoiceReviewData {
    return {
      toneScales: this.toneScales.map((ts) => ({ ...ts })),
      vocabularyGuide: {
        useWords: [...this.vocabularyGuide.useWords],
        avoidWords: [...this.vocabularyGuide.avoidWords],
      },
      communicationGuidelines: [...this.communicationGuidelines],
      lastAutoSaveAt: this.lastAutoSaveAt,
      isDirty: this.isDirty,
    };
  }

  /**
   * Updates a tone scale value.
   * Returns true if updated, false if index is invalid or position out of range.
   */
  updateToneScale(index: number, position: number): boolean {
    if (index < 0 || index >= this.toneScales.length) {
      return false;
    }
    if (position < 1 || position > 5) {
      return false;
    }
    this.toneScales[index].position = position;
    this.isDirty = true;
    return true;
  }

  /** Updates the vocabulary guide use words. */
  setUseWords(words: string[]): void {
    this.vocabularyGuide.useWords = [...words];
    this.isDirty = true;
  }

  /** Updates the vocabulary guide avoid words. */
  setAvoidWords(words: string[]): void {
    this.vocabularyGuide.avoidWords = [...words];
    this.isDirty = true;
  }

  /** Updates a single communication guideline by index. */
  updateGuideline(index: number, text: string): boolean {
    if (index < 0 || index >= this.communicationGuidelines.length) {
      return false;
    }
    this.communicationGuidelines[index] = text;
    this.isDirty = true;
    return true;
  }

  /** Adds a new communication guideline. */
  addGuideline(text: string): void {
    this.communicationGuidelines.push(text);
    this.isDirty = true;
  }

  /** Removes a communication guideline by index. */
  removeGuideline(index: number): boolean {
    if (index < 0 || index >= this.communicationGuidelines.length) {
      return false;
    }
    this.communicationGuidelines.splice(index, 1);
    this.isDirty = true;
    return true;
  }

  /** Returns the current voice definition as a BrandVoiceDefinition. */
  getEditedVoiceDefinition(): BrandVoiceDefinition {
    return {
      toneScales: this.toneScales.map((ts) => ({
        dimension: ts.dimension,
        leftPole: ts.leftPole,
        rightPole: ts.rightPole,
        position: ts.position,
      })),
      vocabularyGuide: {
        useWords: [...this.vocabularyGuide.useWords],
        avoidWords: [...this.vocabularyGuide.avoidWords],
      },
      communicationGuidelines: [...this.communicationGuidelines],
    };
  }

  /** Starts the auto-save timer. Saves to R2 if dirty. */
  startAutoSave(): void {
    if (this.autoSaveTimer) {
      return;
    }
    this.autoSaveTimer = setInterval(async () => {
      await this.autoSave();
    }, AUTO_SAVE_INTERVAL_MS);
  }

  /** Stops the auto-save timer. */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /** Performs an auto-save if dirty and R2 client is configured. */
  async autoSave(): Promise<boolean> {
    if (!this.isDirty || !this.r2Client || !this.r2Key) {
      return false;
    }
    try {
      await this.r2Client.uploadJson(this.r2Key, this.getEditedVoiceDefinition());
      this.lastAutoSaveAt = new Date().toISOString();
      this.isDirty = false;
      return true;
    } catch {
      // Auto-save failures are non-critical; the user can retry
      return false;
    }
  }

  /** Marks the review as saved (after explicit save). */
  markSaved(): void {
    this.isDirty = false;
    this.lastAutoSaveAt = new Date().toISOString();
  }

  /** Returns whether there are unsaved edits. */
  hasPendingEdits(): boolean {
    return this.isDirty;
  }

  /** Cleans up resources (stops auto-save timer). */
  dispose(): void {
    this.stopAutoSave();
  }
}
