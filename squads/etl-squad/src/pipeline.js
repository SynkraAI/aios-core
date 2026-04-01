/**
 * Pipeline Engine — Orchestrates extract → parse → enrich → validate → load
 */

import { classifySource } from './router.js';
import { extractWebpage, extractYoutube, extractFile, extractPdf } from './extractors/index.js';
import { htmlToMarkdown } from './parsers/index.js';
import { enrich } from './enricher.js';
import { validate } from './validator.js';
import { writeOutput } from './loader.js';
import { generateJobId, timestamp, isUrl } from './utils/helpers.js';
import { DEFAULTS } from './utils/constants.js';

/**
 * Run a single ETL pipeline
 * @param {object} params
 * @param {string} params.source - URL, file path, or text
 * @param {string} [params.pipeline] - Force pipeline (skip auto-detect)
 * @param {object} [params.options] - Pipeline options
 * @returns {Promise<object>} Job envelope
 */
export async function runPipeline({ source, pipeline: forcePipeline, options = {} }) {
  const startTime = timestamp();
  const jobId = generateJobId();

  // Phase 0: Route
  const classified = classifySource(source, forcePipeline);
  if (!classified.pipeline) {
    return {
      job_id: jobId,
      status: 'failed',
      error: `Cannot classify source: ${source}. Use --pipeline flag to specify.`,
    };
  }

  console.log(`[${jobId}] Source: ${classified.sourceType} → Pipeline: ${classified.pipeline}`);

  try {
    // Phase 1: Extract
    console.log(`[${jobId}] Extracting...`);
    const extracted = await extract(classified, options);

    // Phase 2: Parse
    console.log(`[${jobId}] Parsing...`);
    const parsed = parse(extracted, classified);

    // Phase 3: Enrich
    console.log(`[${jobId}] Enriching...`);
    const enriched = enrich({
      content: parsed.content,
      sourceType: classified.sourceType,
      source: classified.source,
      pipeline: classified.pipeline,
      jobId,
      extractionMetadata: {
        ...extracted.metadata,
        title: extracted.title || parsed.title,
      },
      options,
    });

    // Phase 4: Validate
    console.log(`[${jobId}] Validating...`);
    const qualityReport = validate({
      content: enriched.enrichedContent,
      chunks: enriched.chunks,
      metadata: enriched.metadata,
    });

    enriched.metadata.quality_score = qualityReport.score;

    console.log(`[${jobId}] Quality: ${qualityReport.score} (${qualityReport.verdict})`);

    if (qualityReport.verdict === 'fail') {
      return {
        job_id: jobId,
        status: 'failed',
        quality: qualityReport,
        error: `Quality gate failed: ${qualityReport.issues.join('; ')}`,
      };
    }

    // Phase 5: Load
    console.log(`[${jobId}] Loading...`);
    const result = writeOutput({
      content: enriched.enrichedContent,
      metadata: { ...enriched.metadata, summary: enriched.summary },
      qualityReport,
      chunks: enriched.chunks,
      options: { ...options, _startTime: startTime },
    });

    console.log(`[${jobId}] Done → ${result.outputPath}`);

    return result.envelope;

  } catch (error) {
    return {
      job_id: jobId,
      status: 'failed',
      error: error.message,
      source: { type: classified.sourceType, original: source },
    };
  }
}

/**
 * Run batch pipeline
 */
export async function runBatch({ sources, pipeline: forcePipeline, options = {} }) {
  const parallel = Math.min(options.parallel || DEFAULTS.parallel_workers, DEFAULTS.max_parallel);
  const results = [];

  console.log(`Batch: ${sources.length} sources, ${parallel} parallel workers`);

  // Process in parallel batches
  for (let i = 0; i < sources.length; i += parallel) {
    const batch = sources.slice(i, i + parallel);
    const batchResults = await Promise.allSettled(
      batch.map(source =>
        runPipeline({ source, pipeline: forcePipeline, options })
      )
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      const source = batch[j];

      if (result.status === 'fulfilled') {
        results.push({
          source,
          status: result.value.status === 'failed' ? 'fail' : result.value.quality?.verdict || 'success',
          pipeline: result.value.pipeline_used || forcePipeline || 'auto',
          outputPath: result.value.content?.output_path,
          qualityScore: result.value.quality?.score,
          error: result.value.error,
          durationMs: result.value.performance?.duration_ms || 0,
        });
      } else {
        results.push({
          source,
          status: 'fail',
          error: result.reason?.message || 'Unknown error',
          durationMs: 0,
        });
      }
    }

    console.log(`Progress: ${Math.min(i + parallel, sources.length)}/${sources.length}`);
  }

  return results;
}

// ─── Internal Pipeline Stages ────────────────────────────────────────

async function extract(classified, options) {
  const { sourceType, source } = classified;

  switch (sourceType) {
    case 'youtube':
    case 'vimeo':
      return extractYoutube(source, options);

    case 'webpage':
    case 'twitter':
    case 'linkedin':
    case 'medium':
    case 'substack':
      return extractWebpage(source, options);

    case 'pdf':
      return extractPdf(source);

    case 'text':
    case 'html_local':
    case 'docx':
    case 'structured_data':
    case 'xlsx':
      return extractFile(source);

    default:
      if (isUrl(source)) {
        return extractWebpage(source, options);
      }
      return extractFile(source);
  }
}

function parse(extracted, classified) {
  const { sourceType } = classified;

  // YouTube: transcript is already text, format it
  if (sourceType === 'youtube' || sourceType === 'vimeo') {
    return parseYoutubeTranscript(extracted);
  }

  // HTML content: convert to markdown
  if (extracted.method === 'readability' || extracted.method === 'raw_html' || extracted.method === 'html_read') {
    const result = htmlToMarkdown(extracted.content, extracted.metadata?.url);
    return {
      content: result.markdown,
      title: extracted.title,
      stats: result.stats,
    };
  }

  // Already text (md, txt, etc.)
  return {
    content: extracted.content,
    title: extracted.title,
    stats: {},
  };
}

function parseYoutubeTranscript(extracted) {
  const meta = extracted.metadata;
  const duration = formatDuration(meta.duration_seconds);
  const parts = [];

  parts.push(`> **Canal:** ${meta.channel} | **Duracao:** ${duration} | **Publicado:** ${meta.published_at?.split('T')[0] || 'N/A'}`);
  parts.push('');

  // Summary placeholder (enricher will generate)
  parts.push('## Sumario Executivo');
  parts.push('');

  // Chapters
  if (meta.chapters?.length > 0) {
    parts.push('## Capitulos');
    parts.push('');
    for (const ch of meta.chapters) {
      parts.push(`### [${ch.timestamp}] ${ch.title}`);
      parts.push('');
    }
  }

  // Full transcript
  if (extracted.transcript) {
    parts.push('## Transcricao Completa');
    parts.push('');
    parts.push(`<details>`);
    parts.push(`<summary>Expandir transcricao</summary>`);
    parts.push('');
    parts.push(extracted.transcript);
    parts.push('');
    parts.push('</details>');
  }

  return {
    content: parts.join('\n'),
    title: meta.title,
    stats: { chapters: meta.chapters?.length || 0 },
  };
}

function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
