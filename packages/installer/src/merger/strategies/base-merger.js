/**
 * @fileoverview Base class for all merge strategies
 * @module merger/strategies/base-merger
 */

/**
 * Abstract base class for merge strategies.
 * All merger implementations should extend this class.
 * @abstract
 */
class BaseMerger {
  /**
   * Name of this merge strategy for logging
   * @type {string}
   */
  name = 'base';

  /**
   * Check if this strategy can merge the given content
   * @param {string} existingContent - Content of the existing file
   * @param {string} newContent - Content to merge in
   * @returns {boolean} True if merge is possible
   * @abstract
   */
  canMerge(_existingContent, _newContent) {
    throw new Error('BaseMerger.canMerge() must be implemented by subclass');
  }

  /**
   * Merge existing content with new content
   * @param {string} existingContent - Content of the existing file
   * @param {string} newContent - Content to merge in
   * @param {import('../types.js').MergeOptions} [options] - Merge options
   * @returns {Promise<import('../types.js').MergeResult>} Merge result
   * @abstract
   */
  async merge(_existingContent, _newContent, _options = {}) {
    throw new Error('BaseMerger.merge() must be implemented by subclass');
  }

  /**
   * Preview merge without applying changes
   * Returns the same result as merge() but with preview flag set
   * @param {string} existingContent - Content of the existing file
   * @param {string} newContent - Content to merge in
   * @returns {Promise<import('../types.js').MergeResult>} Preview of merge result
   */
  async preview(existingContent, newContent) {
    return this.merge(existingContent, newContent, { preview: true });
  }

  /**
   * Get a description of what this strategy does
   * @returns {string} Human-readable description
   */
  getDescription() {
    return `${this.name} merge strategy`;
  }
}

module.exports = { BaseMerger };
