/**
 * Enricher — Semantic enrichment: frontmatter, summary, chunks, entities, tags
 */

import {
  timestamp, countWords, estimateTokens, detectLanguage, slugify
} from './utils/helpers.js';
import { DEFAULTS } from './utils/constants.js';

/**
 * Enrich parsed content with metadata, chunks, and frontmatter
 * @param {object} params
 * @param {string} params.content - Parsed markdown or text content
 * @param {string} params.sourceType - Source type (webpage, youtube, pdf, etc.)
 * @param {string} params.source - Original source (URL or file path)
 * @param {string} params.pipeline - Pipeline name
 * @param {string} params.jobId - Job ID
 * @param {object} [params.extractionMetadata] - Metadata from extraction
 * @param {object} [params.options] - Enrichment options
 * @returns {{ enrichedContent: string, chunks: object[], metadata: object }}
 */
export function enrich({
  content,
  sourceType,
  source,
  pipeline,
  jobId,
  extractionMetadata = {},
  options = {},
}) {
  const wordCount = countWords(content);
  const language = options.language || detectLanguage(content);
  const tokenEstimate = estimateTokens(content, language);
  const title = extractionMetadata.title || extractTitle(content) || slugify(source, 60);
  const chunkSize = options.chunk_size || DEFAULTS.chunk_size;
  const chunkOverlap = options.chunk_overlap || DEFAULTS.chunk_overlap;

  // Generate chunks
  const chunks = chunkContent(content, {
    chunkSize,
    chunkOverlap,
    minChunkSize: DEFAULTS.min_chunk_size,
    jobId,
  });

  // Extract entities (simple NER)
  let entities = {};
  try {
    entities = extractEntities(content);
  } catch (err) {
    console.warn('[enricher] Entity extraction failed:', err.message);
  }

  // Extract topics/tags
  const tags = extractTags(content, title);

  // Generate summary
  const summary = generateSummary(content);

  // Build frontmatter
  const frontmatter = {
    source_type: sourceType,
    ...(source.startsWith('http') ? { source_url: source } : { source_file: source }),
    title,
    ...(extractionMetadata.author && { author: extractionMetadata.author }),
    ...(extractionMetadata.published_at && { published_at: extractionMetadata.published_at }),
    extracted_at: timestamp(),
    language,
    word_count: wordCount,
    token_estimate: tokenEstimate,
    tags,
    ...(Object.values(entities).some(arr => arr.length > 0) && { entities }),
    chunks: chunks.length,
    pipeline,
    job_id: jobId,
  };

  // Build enriched markdown
  const frontmatterYaml = buildFrontmatterYaml(frontmatter);
  const enrichedContent = [
    frontmatterYaml,
    '',
    `# ${title}`,
    '',
    `> **Sumario:** ${summary}`,
    '',
    '---',
    '',
    content,
    '',
  ].join('\n');

  return {
    enrichedContent,
    chunks,
    metadata: frontmatter,
    summary,
  };
}

/**
 * Chunk content semantically
 */
function chunkContent(text, { chunkSize, chunkOverlap, minChunkSize, jobId }) {
  if (!text) return [];

  const words = text.split(/\s+/);
  const totalTokens = Math.round(words.length * 1.3);

  // If content fits in one chunk, return as-is
  if (totalTokens <= chunkSize) {
    return [{
      id: `${jobId}_chunk_000`,
      text: text.trim(),
      token_count: totalTokens,
      section: 'full_document',
      position: 0,
    }];
  }

  // Split by sections (## headers) first
  const sections = text.split(/(?=^## )/m).filter(s => s.trim());
  const chunks = [];
  let position = 0;

  for (const section of sections) {
    const sectionTitle = extractSectionTitle(section);
    const sectionWords = section.split(/\s+/);
    const sectionTokens = Math.round(sectionWords.length * 1.3);

    if (sectionTokens <= chunkSize) {
      // Section fits in one chunk
      if (sectionTokens >= minChunkSize) {
        chunks.push({
          id: `${jobId}_chunk_${String(position).padStart(3, '0')}`,
          text: section.trim(),
          token_count: sectionTokens,
          section: sectionTitle,
          position,
        });
        position++;
      } else if (chunks.length > 0) {
        // Merge with previous chunk
        const prev = chunks[chunks.length - 1];
        prev.text += '\n\n' + section.trim();
        prev.token_count += sectionTokens;
      } else {
        chunks.push({
          id: `${jobId}_chunk_${String(position).padStart(3, '0')}`,
          text: section.trim(),
          token_count: sectionTokens,
          section: sectionTitle,
          position,
        });
        position++;
      }
    } else {
      // Section too big — split by paragraphs
      const paragraphs = section.split(/\n\n+/).filter(p => p.trim());
      let currentChunk = '';
      let currentTokens = 0;

      for (const para of paragraphs) {
        const paraTokens = Math.round(para.split(/\s+/).length * 1.3);

        if (currentTokens + paraTokens > chunkSize && currentChunk) {
          chunks.push({
            id: `${jobId}_chunk_${String(position).padStart(3, '0')}`,
            text: currentChunk.trim(),
            token_count: currentTokens,
            section: sectionTitle,
            position,
          });
          position++;

          // Overlap: keep last portion
          if (chunkOverlap > 0) {
            const overlapWords = currentChunk.split(/\s+/).slice(-Math.round(chunkOverlap / 1.3));
            currentChunk = overlapWords.join(' ') + '\n\n' + para;
            currentTokens = Math.round(overlapWords.length * 1.3) + paraTokens;
          } else {
            currentChunk = para;
            currentTokens = paraTokens;
          }
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
          currentTokens += paraTokens;
        }
      }

      if (currentChunk.trim()) {
        chunks.push({
          id: `${jobId}_chunk_${String(position).padStart(3, '0')}`,
          text: currentChunk.trim(),
          token_count: currentTokens,
          section: sectionTitle,
          position,
        });
        position++;
      }
    }
  }

  return chunks;
}

function extractSectionTitle(section) {
  const match = section.match(/^##\s+(.+)/m);
  return match ? match[1].trim() : 'content';
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

/**
 * Simple named entity extraction
 */
function extractEntities(text) {
  const entities = { people: [], companies: [], products: [] };
  if (!text || text.length < 100) return entities;

  // Detect capitalized multi-word names (simple heuristic)
  const namePattern = /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
  const names = new Set();
  let match;
  while ((match = namePattern.exec(text)) !== null) {
    const name = match[1].trim();
    // Filter out common sentence starters
    if (!isCommonPhrase(name) && name.length < 50) {
      names.add(name);
    }
  }

  // Classify (very simple: if 2 words likely person, if ends in Corp/Inc/Ltd likely company)
  for (const name of names) {
    if (/\b(Corp|Inc|Ltd|LLC|SA|S\.A\.|Group|Co)\b/i.test(name)) {
      entities.companies.push(name);
    } else {
      entities.people.push(name);
    }
  }

  // Limit to top 10 each
  entities.people = entities.people.slice(0, 10);
  entities.companies = entities.companies.slice(0, 10);

  return entities;
}

function isCommonPhrase(text) {
  const common = ['The New', 'In The', 'For The', 'On The', 'At The', 'To The', 'Of The'];
  return common.includes(text);
}

/**
 * Extract tags from content
 */
function extractTags(content, title) {
  const text = (title + ' ' + content).toLowerCase();
  const tags = new Set();

  // Simple keyword extraction: find frequent meaningful words
  const words = text.split(/\s+/).filter(w => w.length > 4);
  const freq = {};
  for (const w of words) {
    const clean = w.replace(/[^a-z\u00e0-\u00ff]/g, '');
    if (clean.length > 4 && !isStopWord(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  sorted.forEach(t => tags.add(t));
  return [...tags];
}

function isStopWord(word) {
  const stops = new Set([
    'about', 'after', 'again', 'being', 'between', 'could', 'doing', 'during',
    'every', 'found', 'great', 'having', 'their', 'there', 'these', 'thing',
    'think', 'those', 'through', 'under', 'using', 'where', 'which', 'while',
    'would', 'ainda', 'assim', 'cada', 'como', 'desde', 'depois', 'dessa',
    'desse', 'entre', 'essa', 'esse', 'esta', 'este', 'foram', 'mais',
    'mesmo', 'muito', 'nosso', 'onde', 'para', 'pela', 'pelo', 'pode',
    'porque', 'quando', 'quem', 'seja', 'sobre', 'todos', 'voce',
  ]);
  return stops.has(word);
}

/**
 * Generate simple summary (first 2-3 sentences of meaningful content)
 */
function generateSummary(content) {
  if (!content) return '';

  // Skip title and frontmatter-like content
  const lines = content.split('\n').filter(l =>
    l.trim() &&
    !l.startsWith('#') &&
    !l.startsWith('---') &&
    !l.startsWith('>') &&
    !l.startsWith('|') &&
    l.trim().length > 30
  );

  const sentences = lines.join(' ').match(/[^.!?]+[.!?]+/g) || [];
  const summary = sentences.slice(0, 3).join(' ').trim();

  return summary.length > 300 ? summary.slice(0, 297) + '...' : summary;
}

/**
 * Build YAML frontmatter string
 */
function buildFrontmatterYaml(obj) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else if (typeof value[0] === 'string' && value.length <= 5) {
        lines.push(`${key}: [${value.map(v => JSON.stringify(v)).join(', ')}]`);
      } else {
        lines.push(`${key}:`);
        value.forEach(v => lines.push(`  - ${JSON.stringify(v)}`));
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [k2, v2] of Object.entries(value)) {
        if (Array.isArray(v2)) {
          lines.push(`  ${k2}: [${v2.map(v => JSON.stringify(v)).join(', ')}]`);
        } else {
          lines.push(`  ${k2}: ${JSON.stringify(v2)}`);
        }
      }
    } else if (typeof value === 'string') {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}
