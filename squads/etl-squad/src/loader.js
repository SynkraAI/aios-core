/**
 * Loader — Write output files and generate job envelopes
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { ensureDir, slugify, dateStamp } from './utils/helpers.js';
import { DEFAULTS } from './utils/constants.js';

/**
 * Write ETL output to destination
 * @param {object} params
 * @param {string} params.content - Enriched content to write
 * @param {object} params.metadata - Frontmatter metadata
 * @param {object} params.qualityReport - Validation report
 * @param {object[]} [params.chunks] - Chunks for secondary output
 * @param {object} [params.options] - Output options
 * @returns {{ outputPath: string, envelopePath: string, envelope: object }}
 */
export function writeOutput({
  content,
  metadata,
  qualityReport,
  chunks = [],
  options = {},
}) {
  const basePath = options.destination || './data/etl-output';
  const format = options.output_format || DEFAULTS.output_format;
  const pipeline = metadata.pipeline || 'etl';
  const sourceSlug = slugify(metadata.title || 'untitled');
  const date = dateStamp();

  // Determine subdirectory by source type
  const subDir = metadata.source_type || 'other';
  const outputDir = join(basePath, subDir);
  ensureDir(join(outputDir, 'placeholder'));

  // Generate filename
  const baseName = `${pipeline}_${sourceSlug}_${date}`;
  const ext = format === 'yaml' ? '.yaml' : format === 'json' ? '.json' : '.md';
  const outputPath = join(outputDir, baseName + ext);

  // Write main content
  const finalContent = content.endsWith('\n') ? content : content + '\n';
  writeFileSync(outputPath, finalContent, 'utf-8');

  // Write chunks as JSONL if available
  let chunksPath = null;
  if (chunks.length > 0) {
    chunksPath = join(outputDir, baseName + '.chunks.jsonl');
    const jsonl = chunks.map(c => JSON.stringify(c)).join('\n') + '\n';
    writeFileSync(chunksPath, jsonl, 'utf-8');
  }

  // Generate and write job envelope
  const envelope = buildEnvelope({
    metadata,
    qualityReport,
    outputPath,
    chunksPath,
    chunks,
    startTime: options._startTime,
  });

  const envelopePath = join(outputDir, baseName + '.job.json');
  writeFileSync(envelopePath, JSON.stringify(envelope, null, 2) + '\n', 'utf-8');

  return { outputPath, envelopePath, chunksPath, envelope };
}

/**
 * Write batch index.yaml
 */
export function writeBatchIndex({ batchId, batchDir, results, startTime }) {
  ensureDir(join(batchDir, 'placeholder'));

  const index = {
    batch_id: batchId,
    started_at: startTime,
    completed_at: new Date().toISOString(),
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    warn: results.filter(r => r.status === 'warn').length,
    fail: results.filter(r => r.status === 'fail').length,
    items: results.map(r => ({
      source: r.source,
      status: r.status,
      pipeline: r.pipeline || 'unknown',
      ...(r.outputPath && { output_file: r.outputPath }),
      ...(r.qualityScore !== undefined && { quality_score: r.qualityScore }),
      ...(r.error && { error: r.error }),
      duration_ms: r.durationMs || 0,
    })),
  };

  const indexPath = join(batchDir, 'index.yaml');
  const yamlContent = buildYamlIndex(index);
  writeFileSync(indexPath, yamlContent, 'utf-8');

  return { indexPath, index };
}

function buildEnvelope({ metadata, qualityReport, outputPath, chunksPath, chunks, startTime }) {
  const now = new Date();
  const durationMs = startTime ? now.getTime() - new Date(startTime).getTime() : 0;

  return {
    job_id: metadata.job_id,
    status: qualityReport.verdict === 'fail' ? 'failed' : qualityReport.verdict === 'warn' ? 'partial' : 'success',
    source: {
      type: metadata.source_url ? 'url' : metadata.source_file ? 'file' : 'text',
      subtype: metadata.source_type,
      original: metadata.source_url || metadata.source_file || '',
      accessed_at: metadata.extracted_at,
    },
    pipeline_used: metadata.pipeline,
    content: {
      format: outputPath.endsWith('.yaml') ? 'yaml' : outputPath.endsWith('.json') ? 'json' : 'markdown',
      output_path: outputPath,
      ...(chunksPath && { chunks_path: chunksPath }),
      summary: metadata.summary || '',
      word_count: metadata.word_count || 0,
      token_estimate: metadata.token_estimate || 0,
    },
    metadata: {
      title: metadata.title || '',
      author: metadata.author || '',
      published_at: metadata.published_at || '',
      language: metadata.language || '',
      tags: metadata.tags || [],
      entities: metadata.entities || {},
    },
    quality: {
      score: qualityReport.score,
      verdict: qualityReport.verdict,
      issues: qualityReport.issues || [],
    },
    performance: {
      duration_ms: durationMs,
      chunks_generated: chunks.length,
    },
  };
}

function buildYamlIndex(index) {
  const lines = [];
  lines.push(`batch_id: "${index.batch_id}"`);
  lines.push(`started_at: "${index.started_at}"`);
  lines.push(`completed_at: "${index.completed_at}"`);
  lines.push(`total: ${index.total}`);
  lines.push(`success: ${index.success}`);
  lines.push(`warn: ${index.warn}`);
  lines.push(`fail: ${index.fail}`);
  lines.push('items:');

  for (const item of index.items) {
    lines.push(`  - source: ${JSON.stringify(item.source)}`);
    lines.push(`    status: ${item.status}`);
    lines.push(`    pipeline: ${item.pipeline}`);
    if (item.output_file) lines.push(`    output_file: ${JSON.stringify(item.output_file)}`);
    if (item.quality_score !== undefined) lines.push(`    quality_score: ${item.quality_score}`);
    if (item.error) lines.push(`    error: ${JSON.stringify(item.error)}`);
    lines.push(`    duration_ms: ${item.duration_ms}`);
  }

  return lines.join('\n') + '\n';
}
