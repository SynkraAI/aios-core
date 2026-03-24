/**
 * Moodboard Reviewer (BSS-7.7, AC 4).
 *
 * Manages approve/reject state for 8-12 moodboard images.
 * Enforces a minimum of 4 approved images before proceeding.
 * Supports optional regeneration requests for rejected images.
 *
 * @module onboarding/review/moodboard-reviewer
 */

import type { MoodboardManifest, MoodboardImage } from '../analysis/analysis-types';
import type {
  MoodboardReviewData,
  MoodboardImageReview,
  MoodboardImageStatus,
  RegenerationRequest,
} from './review-types';
import { MIN_APPROVED_MOODBOARD_IMAGES } from './review-types';

/**
 * MoodboardReviewer manages the moodboard curation section.
 *
 * - Loads 8-12 images from moodboard manifest.
 * - Allows approve/reject per image.
 * - Enforces minimum 4 approved images.
 * - Tracks regeneration requests for rejected images.
 */
export class MoodboardReviewer {
  private images: MoodboardImageReview[];
  private regenerationRequests: RegenerationRequest[];

  constructor(manifest: MoodboardManifest) {
    this.images = manifest.images.map((img) => ({
      r2Key: img.r2Key,
      prompt: img.prompt,
      width: img.width,
      height: img.height,
      index: img.index,
      status: 'pending' as MoodboardImageStatus,
    }));
    this.regenerationRequests = [];
  }

  /** Returns the current review data snapshot. */
  getReviewData(): MoodboardReviewData {
    const approvedCount = this.images.filter((i) => i.status === 'approved').length;
    const rejectedCount = this.images.filter((i) => i.status === 'rejected').length;
    return {
      images: [...this.images],
      approvedCount,
      rejectedCount,
      meetsMinimum: approvedCount >= MIN_APPROVED_MOODBOARD_IMAGES,
      regenerationRequests: [...this.regenerationRequests],
    };
  }

  /**
   * Sets the status of an image by index.
   * Returns true if the update was applied, false if index is invalid.
   */
  setImageStatus(imageIndex: number, status: MoodboardImageStatus): boolean {
    const idx = this.images.findIndex((i) => i.index === imageIndex);
    if (idx === -1) {
      return false;
    }
    this.images[idx] = { ...this.images[idx], status };
    return true;
  }

  /**
   * Approves an image by its index.
   */
  approveImage(imageIndex: number): boolean {
    return this.setImageStatus(imageIndex, 'approved');
  }

  /**
   * Rejects an image by its index.
   */
  rejectImage(imageIndex: number): boolean {
    return this.setImageStatus(imageIndex, 'rejected');
  }

  /**
   * Adds a regeneration request for a rejected image.
   * Returns true if the request was added (image must be rejected).
   */
  requestRegeneration(imageIndex: number, reason?: string): boolean {
    const image = this.images.find((i) => i.index === imageIndex);
    if (!image || image.status !== 'rejected') {
      return false;
    }
    this.regenerationRequests.push({
      rejectedImageIndex: imageIndex,
      reason,
      requestedAt: new Date().toISOString(),
    });
    return true;
  }

  /** Returns all R2 keys of approved images. */
  getApprovedImageKeys(): string[] {
    return this.images
      .filter((i) => i.status === 'approved')
      .map((i) => i.r2Key);
  }

  /** Returns whether the minimum approval count is met. */
  meetsMinimumApproval(): boolean {
    return this.images.filter((i) => i.status === 'approved').length >= MIN_APPROVED_MOODBOARD_IMAGES;
  }
}
