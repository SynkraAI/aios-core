/**
 * @fileoverview Fallback merger that simply replaces content
 * @module merger/strategies/replace-merger
 */

const { BaseMerger } = require('./base-merger.js');
const { createMergeResult, createEmptyStats } = require('../types.js');

/**
 * Fallback merge strategy that replaces existing content entirely.
 * Used when no specific merge strategy is available for a file type.
 * @extends BaseMerger
 */
class ReplaceMerger extends BaseMerger {
  name = 'replace';

  /**
   * Replace merger cannot actually merge - it only replaces
   * @param {string} _existingContent - Ignored
   * @param {string} _newContent - Ignored
   * @returns {boolean} Always returns false (cannot merge, only replace)
   */
  canMerge(_existingContent, _newContent) {
    return false;
  }

  /**
   * Replace existing content with new content entirely
   * @param {string} existingContent - Content to replace
   * @param {string} newContent - New content
   * @param {import('../types.js').MergeOptions} [options] - Merge options
   * @returns {Promise<import('../types.js').MergeResult>} Result with new content
   */
  async merge(existingContent, newContent, _options = {}) {
    const stats = createEmptyStats();
    const changes = [];

    // If content is identical, nothing to do
    if (existingContent === newContent) {
      stats.preserved = 1;
      changes.push({
        type: 'preserved',
        identifier: 'file',
        reason: 'content identical',
      });
      return createMergeResult(existingContent, stats, changes);
    }

    // Full replacement
    stats.updated = 1;
    changes.push({
      type: 'updated',
      identifier: 'file',
      reason: 'full replacement (no merge strategy available)',
    });

    return createMergeResult(newContent, stats, changes);
  }

  /**
   * @returns {string} Description of this strategy
   */
  getDescription() {
    return 'Replaces file content entirely (fallback when no merge strategy available)';
  }
}

module.exports = { ReplaceMerger };
