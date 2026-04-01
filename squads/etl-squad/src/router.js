/**
 * ETL Router — Source classification & pipeline selection
 * Implements etl-chief routing logic
 */

import { existsSync } from 'fs';
import { URL_PATTERNS, EXT_MAP } from './utils/constants.js';
import { isUrl, getExtension } from './utils/helpers.js';

/**
 * Classify source and select pipeline
 * @param {string} source - URL, file path, or text
 * @param {string} [forcePipeline] - Override auto-detection
 * @returns {{ sourceType: string, pipeline: string, source: string }}
 */
export function classifySource(source, forcePipeline = null) {
  if (forcePipeline) {
    const sourceType = detectSourceType(source);
    return { sourceType, pipeline: forcePipeline, source };
  }

  if (isUrl(source)) {
    return classifyUrl(source);
  }

  if (existsSync(source)) {
    return classifyFile(source);
  }

  // Treat as inline text
  return { sourceType: 'text', pipeline: 'url-to-markdown', source };
}

function classifyUrl(url) {
  // Check URL patterns (YouTube, GitHub, etc.)
  for (const { pattern, pipeline, type } of URL_PATTERNS) {
    if (pattern.test(url)) {
      return { sourceType: type, pipeline, source: url };
    }
  }

  // Check if URL points to a downloadable file (not .html/.htm which are webpages)
  try {
    const u = new URL(url);
    const ext = getExtension(u.pathname);
    if (ext && EXT_MAP[ext] && ext !== '.html' && ext !== '.htm') {
      return { sourceType: EXT_MAP[ext].type, pipeline: EXT_MAP[ext].pipeline, source: url };
    }
  } catch {
    // ignore URL parse errors
  }

  // Default: generic webpage
  return { sourceType: 'webpage', pipeline: 'url-to-markdown', source: url };
}

function classifyFile(filePath) {
  const ext = getExtension(filePath);
  const mapping = EXT_MAP[ext];

  if (mapping) {
    return { sourceType: mapping.type, pipeline: mapping.pipeline, source: filePath };
  }

  return { sourceType: 'unknown', pipeline: null, source: filePath };
}

function detectSourceType(source) {
  if (isUrl(source)) {
    for (const { pattern, type } of URL_PATTERNS) {
      if (pattern.test(source)) return type;
    }
    return 'webpage';
  }
  if (existsSync(source)) {
    const ext = getExtension(source);
    return EXT_MAP[ext]?.type || 'unknown';
  }
  return 'text';
}
