/**
 * Story metadata parser for lean SDC / wave execution (OSS).
 * Reads markdown story files without product harvest deps.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const STATUS_PATTERNS = [
  /^\|\s*Status\s*\|\s*([^|]+)\|/im,
  /^\*\*Status:\*\*\s*(.+)$/im,
  /^Status:\s*(.+)$/im,
  /^status:\s*["']?([^"'\n]+)/im,
];

const STORY_ID_PATTERNS = [
  /^\|\s*Story ID\s*\|\s*([^|]+)\|/im,
  /^\*\*Story ID:\*\*\s*(.+)$/im,
  /^#\s+Story\s+([A-Za-z0-9._-]+)/im,
  /^story[_-]?id:\s*["']?([^"'\n]+)/im,
];

/**
 * @param {string} filePath
 * @returns {string}
 */
function readStory(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Story not found: ${filePath}`);
  }
  return fs.readFileSync(abs, 'utf8');
}

/**
 * @param {string} text
 * @param {RegExp[]} patterns
 * @returns {string|null}
 */
function firstMatch(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim().replace(/\*+/g, '').trim();
  }
  return null;
}

/**
 * Normalize status labels to lifecycle tokens.
 * @param {string|null} raw
 * @returns {string}
 */
function normalizeStatus(raw) {
  if (!raw) return 'Unknown';
  const s = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  if (s.includes('done') || s === 'complete' || s === 'closed') return 'Done';
  if (s.includes('in review') || s.includes('inreview') || s.includes('ready for review')) {
    return 'InReview';
  }
  if (s.includes('in progress') || s.includes('inprogress') || s.includes('implement')) {
    return 'InProgress';
  }
  if (s === 'ready' || s.startsWith('ready ') || s.includes('approved')) return 'Ready';
  if (s.includes('draft')) return 'Draft';
  if (s.includes('blocked') || s.includes('halt')) return 'Blocked';
  // Keep original token casing lightly
  return raw.trim();
}

/**
 * Extract bullet paths under ## File List (or similar).
 * @param {string} text
 * @returns {string[]}
 */
function extractFileList(text) {
  const section = text.match(
    /##\s+File List\b[\s\S]*?(?=\n##\s|\n#\s|$)/i,
  );
  if (!section) return [];
  const body = section[0];
  const paths = [];
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*[-*]\s+`?([^\s`|]+)`?/);
    if (!m) continue;
    let p = m[1].replace(/[,:]$/, '');
    // strip trailing " — note"
    p = p.split(/\s+—\s+/)[0].split(/\s+-\s+/)[0].trim();
    const looksLikePath =
      (p.includes('/') ||
        /\.(js|jsx|ts|tsx|md|yaml|yml|json|mjs|cjs)$/i.test(p)) &&
      !p.startsWith('#');
    if (p && looksLikePath) {
      paths.push(p);
    }
  }
  return [...new Set(paths)];
}

/**
 * Extract depends_on story ids from tables or lists.
 * @param {string} text
 * @returns {string[]}
 */
function extractDependsOn(text) {
  const ids = new Set();
  const dependsSection = text.match(
    /##\s+(Dependencies|Depends|Pré-requisitos|Prerequisites)\b[\s\S]*?(?=\n##\s|\n#\s|$)/i,
  );
  const blobs = [dependsSection ? dependsSection[0] : '', text];
  for (const blob of blobs) {
    for (const m of blob.matchAll(/depends[_-]?on[:\s|*]+([A-Za-z0-9._,-]+)/gi)) {
      for (const part of m[1].split(/[,\s]+/)) {
        if (part && part.length > 1) ids.add(part.trim());
      }
    }
    for (const m of blob.matchAll(/`([A-Za-z0-9]+(?:\.[A-Za-z0-9]+)+)`/g)) {
      // only in depends section to reduce noise
      if (dependsSection && blob === dependsSection[0]) ids.add(m[1]);
    }
  }
  // table row: | Depends | CORE-SU.A1 |
  const tableDep = text.match(/^\|\s*Depends(?:_on| on)?\s*\|\s*([^|]+)\|/im);
  if (tableDep) {
    for (const part of tableDep[1].split(/[,\s/]+/)) {
      const t = part.trim();
      if (t && t !== '-' && t.toLowerCase() !== 'none' && t.toLowerCase() !== 'n/a') {
        ids.add(t);
      }
    }
  }
  return [...ids];
}

/**
 * Extract QA gate verdict from story body if present.
 * @param {string} text
 * @returns {string|null} PASS|CONCERNS|FAIL|WAIVED|null
 */
function extractQaVerdict(text) {
  const m =
    text.match(/Gate:\s*\**\s*(PASS|CONCERNS|FAIL|WAIVED)\b/i) ||
    text.match(/verdict:\s*\**\s*(PASS|CONCERNS|FAIL|WAIVED)\b/i) ||
    text.match(/\*\*Gate Status:\*\*\s*\**\s*(PASS|CONCERNS|FAIL|WAIVED)\b/i) ||
    text.match(/Gate Status\s*\n+\s*Gate:\s*\**\s*(PASS|CONCERNS|FAIL|WAIVED)\b/i);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Count task checkboxes.
 * @param {string} text
 * @returns {{ total: number, done: number }}
 */
function countTaskCheckboxes(text) {
  const all = text.match(/^\s*[-*]\s+\[[ xX]\]/gm) || [];
  const done = text.match(/^\s*[-*]\s+\[[xX]\]/gm) || [];
  return { total: all.length, done: done.length };
}

/**
 * @param {string} filePath
 * @returns {object}
 */
function parseStoryFile(filePath) {
  const abs = path.resolve(filePath);
  const text = readStory(abs);
  const storyId =
    firstMatch(text, STORY_ID_PATTERNS) ||
    path.basename(abs, path.extname(abs)).replace(/^STORY-/i, '');
  const statusRaw = firstMatch(text, STATUS_PATTERNS);
  return {
    path: abs,
    relPath: path.relative(process.cwd(), abs) || abs,
    storyId,
    statusRaw,
    status: normalizeStatus(statusRaw),
    fileList: extractFileList(text),
    dependsOn: extractDependsOn(text),
    qaVerdict: extractQaVerdict(text),
    tasks: countTaskCheckboxes(text),
  };
}

module.exports = {
  readStory,
  parseStoryFile,
  normalizeStatus,
  extractFileList,
  extractDependsOn,
  extractQaVerdict,
  countTaskCheckboxes,
};
