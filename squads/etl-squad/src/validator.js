/**
 * Validator — Quality gate for ETL outputs
 */

import { QUALITY, NOISE_PATTERNS } from './utils/constants.js';
import { countWords } from './utils/helpers.js';

/**
 * Validate enriched content and return quality report
 * @param {object} params
 * @param {string} params.content - Enriched content (with frontmatter)
 * @param {object[]} [params.chunks] - Generated chunks
 * @param {object} [params.metadata] - Frontmatter metadata
 * @returns {{ score: number, verdict: string, components: object, issues: string[] }}
 */
export function validate({ content, chunks = [], metadata = {} }) {
  const issues = [];
  const components = {};

  // 1. Frontmatter Check (20%)
  components.frontmatter_complete = checkFrontmatter(metadata, issues);

  // 2. Encoding Check (15%)
  components.encoding_clean = checkEncoding(content, issues);

  // 3. Noise Check (20%)
  components.noise_below_threshold = checkNoise(content, issues);

  // 4. Coherence Check (20%)
  components.content_coherent = checkCoherence(content, issues);

  // 5. Length Check (10%)
  components.length_in_bounds = checkLength(content, metadata, issues);

  // 6. Chunks Check (15%)
  components.chunks_valid = checkChunks(chunks, issues);

  // Calculate weighted score
  const score = Math.round((
    components.frontmatter_complete * 0.20 +
    components.encoding_clean * 0.15 +
    components.noise_below_threshold * 0.20 +
    components.content_coherent * 0.20 +
    components.length_in_bounds * 0.10 +
    components.chunks_valid * 0.15
  ) * 100) / 100;

  // Determine verdict
  const failComponents = Object.values(components).filter(v => v === 0).length;
  let verdict;
  if (score >= QUALITY.min_quality_score && failComponents === 0) {
    verdict = 'pass';
  } else if (score >= 0.4 && failComponents <= 1) {
    verdict = 'warn';
  } else {
    verdict = 'fail';
  }

  return { score, verdict, components, issues };
}

function checkFrontmatter(metadata, issues) {
  const required = ['source_type', 'title', 'extracted_at', 'language', 'word_count', 'pipeline', 'job_id'];
  const missing = required.filter(f => !metadata[f]);

  if (missing.length === 0) return 1.0;
  if (missing.length <= 2) {
    issues.push(`Frontmatter missing optional-ish fields: ${missing.join(', ')}`);
    return 0.5;
  }
  issues.push(`Frontmatter missing required fields: ${missing.join(', ')}`);
  return 0.0;
}

function checkEncoding(content, issues) {
  if (!content) return 1.0;

  let problemCount = 0;

  // Check for replacement characters
  const replacementChars = (content.match(/\uFFFD/g) || []).length;
  problemCount += replacementChars;

  // Check for null bytes
  const nullBytes = (content.match(/\0/g) || []).length;
  problemCount += nullBytes * 5; // null bytes are severe

  if (problemCount === 0) return 1.0;
  if (problemCount < 5) {
    issues.push(`Encoding: ${replacementChars} replacement chars, ${nullBytes} null bytes`);
    return 0.7;
  }
  issues.push(`Encoding FAIL: ${replacementChars} replacement chars, ${nullBytes} null bytes`);
  return 0.0;
}

function checkNoise(content, issues) {
  if (!content) return 1.0;

  // Extract body (after frontmatter)
  const body = content.replace(/^---[\s\S]*?---\n*/m, '');
  if (!body) return 1.0;

  // Check for HTML tags remaining
  const htmlTags = (body.match(/<[^>]+>/g) || []).length;

  // Check for noise patterns
  let noiseMatches = 0;
  for (const pattern of NOISE_PATTERNS) {
    noiseMatches += (body.match(pattern) || []).length;
  }

  const totalNoise = htmlTags + noiseMatches;
  const ratio = totalNoise / Math.max(countWords(body), 1);

  if (ratio < 0.01) return 1.0;
  if (ratio < 0.05) return 0.85;
  if (ratio < QUALITY.max_noise_ratio) {
    issues.push(`Noise: ${htmlTags} HTML tags, ${noiseMatches} boilerplate matches (ratio: ${ratio.toFixed(3)})`);
    return 0.5;
  }
  issues.push(`Noise FAIL: ratio ${ratio.toFixed(3)} exceeds ${QUALITY.max_noise_ratio}`);
  return 0.0;
}

function checkCoherence(content, issues) {
  if (!content) return 0.0;

  const body = content.replace(/^---[\s\S]*?---\n*/m, '');
  if (!body || body.trim().length < 50) {
    issues.push('Content too short for coherence check');
    return 0.5;
  }

  // Sample 3 paragraphs
  const paragraphs = body.split(/\n\n+/).filter(p => p.trim().length > 30);
  if (paragraphs.length === 0) {
    issues.push('No substantial paragraphs found');
    return 0.0;
  }

  const sampled = paragraphs.length <= 3 ? paragraphs : [
    paragraphs[0],
    paragraphs[Math.floor(paragraphs.length / 2)],
    paragraphs[paragraphs.length - 1],
  ];

  // Check each sample for garbled text indicators
  let passCount = 0;
  for (const para of sampled) {
    const wordRatio = countWords(para) / Math.max(para.length, 1);
    // Normal text has ~0.15-0.25 word/char ratio. Garbled text is much lower
    if (wordRatio > 0.08 && wordRatio < 0.5) {
      passCount++;
    }
  }

  if (passCount === sampled.length) return 1.0;
  if (passCount >= 2) return 0.7;
  issues.push(`Coherence: only ${passCount}/${sampled.length} paragraphs pass`);
  return 0.0;
}

function checkLength(content, metadata, issues) {
  const wordCount = metadata.word_count || countWords(content);

  if (wordCount < QUALITY.min_content_length) {
    issues.push(`Content too short: ${wordCount} words (min: ${QUALITY.min_content_length})`);
    return 0.0;
  }

  if (wordCount > 100000) {
    issues.push(`Content suspiciously long: ${wordCount} words (check for accidental concatenation)`);
    return 0.5;
  }

  return 1.0;
}

function checkChunks(chunks, issues) {
  if (!chunks || chunks.length === 0) return 1.0; // No chunks = N/A = pass

  let valid = true;
  const positions = new Set();

  for (const chunk of chunks) {
    if (!chunk.id || !chunk.text || chunk.token_count === undefined || chunk.position === undefined) {
      issues.push(`Invalid chunk: missing required fields (id, text, token_count, position)`);
      valid = false;
      break;
    }
    if (chunk.text.trim().length === 0) {
      issues.push(`Empty chunk at position ${chunk.position}`);
      valid = false;
      break;
    }
    if (positions.has(chunk.position)) {
      issues.push(`Duplicate chunk position: ${chunk.position}`);
      valid = false;
      break;
    }
    positions.add(chunk.position);
  }

  return valid ? 1.0 : 0.0;
}
