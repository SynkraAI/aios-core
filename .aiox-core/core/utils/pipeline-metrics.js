/**
 * PipelineMetrics
 *
 * Collects timing and statistics for each layer in the context pipeline.
 * Standardizes hrtime performance measurement across Synapse layers.
 *
 * @module core/utils/pipeline-metrics
 * @version 1.0.0
 */

'use strict';

class PipelineMetrics {
  constructor() {
    /** @type {Object.<string, object>} Per-layer metrics keyed by name */
    this.layers = {};
    /** @type {bigint|null} Pipeline start hrtime (nanoseconds) */
    this.totalStart = null;
    /** @type {bigint|null} Pipeline end hrtime (nanoseconds) */
    this.totalEnd = null;
  }

  /**
   * Mark the start of a layer's execution.
   * @param {string} name - Layer name
   */
  startLayer(name) {
    this.layers[name] = { start: process.hrtime.bigint(), status: 'running' };
  }

  /**
   * Mark the successful end of a layer's execution.
   * @param {string} name - Layer name
   * @param {number} rulesCount - Number of rules produced
   */
  endLayer(name, rulesCount) {
    const layer = this.layers[name];
    if (!layer) {
      this.layers[name] = { status: 'ok', rules: rulesCount };
      return;
    }
    const endTime = process.hrtime.bigint();
    layer.end = endTime;
    layer.duration = Number(endTime - layer.start) / 1e6;
    layer.status = 'ok';
    layer.rules = rulesCount;
  }

  /**
   * Record that a layer was skipped.
   * @param {string} name - Layer name
   * @param {string} reason - Why it was skipped
   */
  skipLayer(name, reason) {
    this.layers[name] = { status: 'skipped', reason };
  }

  /**
   * Record that a layer encountered an error.
   * @param {string} name - Layer name
   * @param {Error} error - The error object
   */
  errorLayer(name, error) {
    const existing = this.layers[name] || {};
    if (existing.start) {
      const endTime = process.hrtime.bigint();
      existing.end = endTime;
      existing.duration = Number(endTime - existing.start) / 1e6;
    }
    this.layers[name] = {
      ...existing,
      status: 'error',
      error: error && error.message ? error.message : String(error),
    };
  }

  /**
   * Return a summary of the full pipeline execution.
   * @returns {Object}
   */
  getSummary() {
    const values = Object.values(this.layers);
    return {
      total_ms: this.totalStart != null && this.totalEnd != null
        ? Number(this.totalEnd - this.totalStart) / 1e6
        : 0,
      layers_loaded: values.filter(l => l.status === 'ok').length,
      layers_skipped: values.filter(l => l.status === 'skipped').length,
      layers_errored: values.filter(l => l.status === 'error').length,
      total_rules: values.reduce((sum, l) => sum + (l.rules || 0), 0),
      per_layer: this.layers,
    };
  }
}

module.exports = PipelineMetrics;
