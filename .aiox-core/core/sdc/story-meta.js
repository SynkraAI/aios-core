/**
 * Story metadata parser for lean SDC / wave execution (OSS).
 * Reads markdown story files without product harvest deps.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const STATUS_PATTERNS = [
  /^\|\s*Status\s*\|\s*([^|]+)\|/im,
  /^##\s+Status\s*\n+\s*([^\n#]+)/im,
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
  const section = text.match(/##\s+File List\b[\s\S]*?(?=\n##\s|\n#\s|$)/i);
  if (!section) return [];
  const body = section[0];
  const paths = [];
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*[-*]\s+`?([^\s`|]+)`?/);
    if (!m) continue;
    let p = m[1].replace(/[,:]$/, '');
    // strip trailing " — note"
    p = p
      .split(/\s+—\s+/)[0]
      .split(/\s+-\s+/)[0]
      .trim();
    const looksLikePath =
      (p.includes('/') || /\.(js|jsx|ts|tsx|md|yaml|yml|json|mjs|cjs)$/i.test(p)) &&
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

const QA_VERDICT_PATTERN =
  /(?:\*\*Gate Status:\*\*\s*|Gate Status\s*\n+\s*Gate:\s*|(?:Gate|verdict):\s*)\**\s*(PASS|CONCERNS|FAIL|WAIVED)\b/gi;

function cleanEvidenceValue(value) {
  return String(value || '')
    .trim()
    .replace(/^[*'"`]+|[*'"`]+$/g, '')
    .trim();
}

function lastCapturedValue(text, pattern) {
  const values = [...text.matchAll(pattern)];
  return values.length > 0 ? cleanEvidenceValue(values[values.length - 1][1]) : null;
}

function evidenceEntry(text, latest, previous) {
  const source = String(text);
  const qaSection = source.lastIndexOf('## QA Results', latest.index);
  const baseStart = Math.max(previous ? previous.end : 0, qaSection, 0);
  const prefix = source.slice(baseStart, latest.index);
  const reviewHeadings = [...prefix.matchAll(/^###\s+(?:Re-review|Review) Date\b.*$/gim)];
  const headingStart =
    reviewHeadings.length > 0
      ? baseStart + reviewHeadings[reviewHeadings.length - 1].index
      : baseStart;
  const suffix = source.slice(latest.end);
  const boundaries = [
    ...suffix.matchAll(/^##(?!#)\s+.+$/gm),
    ...suffix.matchAll(/^###\s+(?:Re-review|Review) Date\b.*$/gim),
    ...suffix.matchAll(/^\s*---\s*$/gm),
  ];
  const entryEnd = boundaries.reduce(
    (earliest, match) => Math.min(earliest, latest.end + match.index),
    source.length,
  );
  return source.slice(headingStart, entryEnd);
}

function extractWaiver(entry) {
  let waiver = null;
  try {
    const parsed = yaml.load(entry);
    if (parsed && typeof parsed === 'object' && parsed.waiver) waiver = parsed.waiver;
  } catch {
    waiver = null;
  }

  if (!waiver || typeof waiver !== 'object') {
    const active = lastCapturedValue(
      entry,
      /^\s*(?:#{2,6}\s*)?(?:\*\*)?Waiver Active(?:\*\*)?:\s*(true|false)\s*$/gim,
    );
    const reason = lastCapturedValue(
      entry,
      /^\s*(?:#{2,6}\s*)?(?:\*\*)?Waiver Reason(?:\*\*)?:\s*(.+?)\s*$/gim,
    );
    const approver = lastCapturedValue(
      entry,
      /^\s*(?:#{2,6}\s*)?(?:\*\*)?Waiver Approver(?:\*\*)?:\s*(.+?)\s*$/gim,
    );
    waiver = { active: active === 'true', reason, approver };
  }

  const normalized = {
    active: waiver.active === true,
    reason: cleanEvidenceValue(waiver.reason),
    approver: cleanEvidenceValue(waiver.approver),
  };
  return {
    ...normalized,
    valid: Boolean(normalized.active && normalized.reason && normalized.approver),
  };
}

/**
 * Extract the latest append-only QA verdict and its revision-bound provenance.
 * @param {string} text - Story body or gate-file content.
 * @returns {{ verdict: string|null, reviewer: string|null, reviewedRevision: string|null, waiver: object, waiverValid: boolean, complete: boolean }} Latest QA evidence.
 */
function extractQaEvidence(text) {
  const verdicts = [...String(text).matchAll(QA_VERDICT_PATTERN)].map((match) => ({
    index: match.index,
    end: match.index + match[0].length,
    verdict: match[1].toUpperCase(),
  }));
  if (verdicts.length === 0) {
    return {
      verdict: null,
      reviewer: null,
      reviewedRevision: null,
      waiver: { active: false, reason: '', approver: '', valid: false },
      waiverValid: false,
      complete: false,
    };
  }
  const latest = verdicts[verdicts.length - 1];
  const previous = verdicts[verdicts.length - 2];
  const entry = evidenceEntry(text, latest, previous);
  const reviewer = lastCapturedValue(
    entry,
    /^\s*(?:#{2,6}\s*)?(?:\*\*)?(?:Reviewed By|Reviewer)(?:\*\*)?:\s*(.+?)\s*$/gim,
  );
  const reviewedRevision = lastCapturedValue(
    entry,
    /^\s*(?:#{2,6}\s*)?(?:\*\*)?(?:Reviewed Revision|reviewed_revision)(?:\*\*)?:\s*(.+?)\s*$/gim,
  );
  const waiver = extractWaiver(entry);
  const waiverValid = latest.verdict !== 'WAIVED' || waiver.valid;
  return {
    verdict: latest.verdict,
    reviewer,
    reviewedRevision,
    waiver,
    waiverValid,
    complete: Boolean(reviewer && reviewedRevision && waiverValid),
  };
}

/**
 * Extract the latest QA gate verdict from an append-only story body.
 * @param {string} text
 * @returns {string|null} PASS|CONCERNS|FAIL|WAIVED|null
 */
function extractQaVerdict(text) {
  return extractQaEvidence(text).verdict;
}

/**
 * Resolve complete QA evidence from the story or one uniquely story-bound gate file.
 *
 * @param {object} meta - Parsed story metadata.
 * @param {object} [opts]
 * @param {string} [opts.cwd] - Project root containing the canonical core config.
 * @returns {{ verdict: string|null, reviewer: string|null, reviewedRevision: string|null, waiver: object, waiverValid: boolean, complete: boolean, gateFound: boolean, gateFile: string|null, error: string|null }} Resolved fail-closed evidence.
 */
function resolveQaEvidence(meta, opts = {}) {
  const storyEvidence = {
    verdict: meta.qaVerdict || null,
    reviewer: meta.qaReviewer || null,
    reviewedRevision: meta.qaReviewedRevision || null,
    waiver: meta.qaWaiver || { active: false, reason: '', approver: '', valid: false },
    waiverValid: Boolean(meta.qaWaiverValid),
    complete: Boolean(meta.qaEvidenceComplete),
    gateFound: false,
    gateFile: null,
    error: null,
  };
  if (storyEvidence.complete) return storyEvidence;
  if (!storyEvidence.verdict) {
    return {
      ...storyEvidence,
      error: 'Story has no QA verdict marker; refusing orphan QA gate fallback',
    };
  }

  const cwd = path.resolve(opts.cwd || process.cwd());
  const configPath = path.join(cwd, '.aiox-core', 'core-config.yaml');
  let qaLocation = 'docs/qa';
  if (fs.existsSync(configPath)) {
    try {
      const config = yaml.load(fs.readFileSync(configPath, 'utf8')) || {};
      if (config.qa && config.qa.qaLocation) qaLocation = config.qa.qaLocation;
    } catch (error) {
      return {
        ...storyEvidence,
        error: `Canonical QA location cannot be resolved from ${configPath}: ${error.message}`,
      };
    }
  }
  if (typeof qaLocation !== 'string' || !qaLocation.trim()) {
    return {
      ...storyEvidence,
      error: `Canonical QA location is invalid in ${configPath}`,
    };
  }

  const gatesDir = path.resolve(cwd, qaLocation, 'gates');
  const storyWaiverError =
    storyEvidence.verdict === 'WAIVED' && !storyEvidence.waiverValid
      ? 'WAIVED QA evidence requires waiver.active true, reason, and approver'
      : null;
  if (!fs.existsSync(gatesDir)) {
    return { ...storyEvidence, error: storyWaiverError };
  }

  let entries;
  try {
    entries = fs
      .readdirSync(gatesDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    return {
      ...storyEvidence,
      error: `QA gate directory cannot be read: ${error.message}`,
    };
  }

  const matches = [];
  for (const entry of entries) {
    const gateFile = path.join(gatesDir, entry.name);
    let gateText;
    try {
      gateText = fs.readFileSync(gateFile, 'utf8');
    } catch (error) {
      return {
        ...storyEvidence,
        error: `QA gate cannot be read (${entry.name}): ${error.message}`,
      };
    }
    const boundStory = gateText.match(/^\s*(?:story|storyId):\s*['"]?([^'"\n]+)['"]?\s*$/im);
    if (
      boundStory &&
      cleanEvidenceValue(boundStory[1]).toLowerCase() === String(meta.storyId).toLowerCase()
    ) {
      matches.push({ gateFile, evidence: extractQaEvidence(gateText) });
    }
  }

  if (matches.length === 0) return { ...storyEvidence, error: storyWaiverError };
  if (matches.length > 1) {
    return {
      ...storyEvidence,
      gateFound: true,
      error: `Multiple QA gates are bound to story ${meta.storyId}: ${matches
        .map((match) => path.basename(match.gateFile))
        .join(', ')}`,
    };
  }

  const [{ gateFile, evidence }] = matches;
  if (evidence.verdict === 'WAIVED' && !evidence.waiverValid) {
    return {
      ...evidence,
      complete: false,
      gateFound: true,
      gateFile,
      error: `WAIVED QA gate requires waiver.active true, reason, and approver: ${path.basename(gateFile)}`,
    };
  }
  if (!evidence.complete) {
    return {
      ...evidence,
      complete: false,
      gateFound: true,
      gateFile,
      error: `QA gate lacks reviewer or reviewed_revision: ${path.basename(gateFile)}`,
    };
  }
  if (storyEvidence.verdict && evidence.verdict !== storyEvidence.verdict) {
    return {
      ...evidence,
      complete: false,
      gateFound: true,
      gateFile,
      error: `QA gate verdict ${evidence.verdict} does not match story verdict ${storyEvidence.verdict}`,
    };
  }
  return {
    ...evidence,
    complete: true,
    gateFound: true,
    gateFile,
    error: null,
  };
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
  const qaEvidence = extractQaEvidence(text);
  return {
    path: abs,
    relPath: path.relative(process.cwd(), abs) || abs,
    storyId,
    statusRaw,
    status: normalizeStatus(statusRaw),
    fileList: extractFileList(text),
    dependsOn: extractDependsOn(text),
    qaVerdict: qaEvidence.verdict,
    qaReviewer: qaEvidence.reviewer,
    qaReviewedRevision: qaEvidence.reviewedRevision,
    qaWaiver: qaEvidence.waiver,
    qaWaiverValid: qaEvidence.waiverValid,
    qaEvidenceComplete: qaEvidence.complete,
    tasks: countTaskCheckboxes(text),
  };
}

module.exports = {
  readStory,
  parseStoryFile,
  normalizeStatus,
  extractFileList,
  extractDependsOn,
  extractQaEvidence,
  extractQaVerdict,
  resolveQaEvidence,
  countTaskCheckboxes,
};
