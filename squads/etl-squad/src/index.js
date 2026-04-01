/**
 * ETL Squad — Public API
 *
 * Usage:
 *   import { etl } from './squads/etl-squad/src/index.js';
 *   const result = await etl.run({ source: 'https://...', pipeline: 'url-to-markdown' });
 *   const results = await etl.batch({ sources: ['url1', 'url2'], parallel: 3 });
 *   const classified = etl.classify('https://youtube.com/watch?v=xxx');
 */

import { runPipeline, runBatch } from './pipeline.js';
import { classifySource } from './router.js';

export const etl = {
  /**
   * Run single source through ETL pipeline
   * @param {object} params
   * @param {string} params.source - URL, file path, or text
   * @param {string} [params.pipeline] - Force specific pipeline
   * @param {object} [params.options] - { chunk_size, chunk_overlap, language, output_format, destination }
   * @returns {Promise<object>} Job envelope
   */
  run: runPipeline,

  /**
   * Run multiple sources in parallel
   * @param {object} params
   * @param {string[]} params.sources - Array of URLs/paths
   * @param {string} [params.pipeline] - Force same pipeline for all
   * @param {object} [params.options] - { parallel, chunk_size, output_format }
   * @returns {Promise<object[]>} Array of results
   */
  batch: runBatch,

  /**
   * Classify a source without processing it
   * @param {string} source - URL or file path
   * @param {string} [forcePipeline]
   * @returns {{ sourceType: string, pipeline: string, source: string }}
   */
  classify: classifySource,
};

export default etl;
