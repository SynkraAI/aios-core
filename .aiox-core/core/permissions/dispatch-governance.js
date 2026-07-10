/**
 * Pre-dispatch governance for automated model calls.
 *
 * Enforces Constitution XII budget, story binding, and intent scanning before
 * an automated executor can invoke a model.
 *
 * @module permissions/dispatch-governance
 */

'use strict';

const fs = require('fs');
const path = require('path');
const promptGuard = require('./prompt-guard');

/** @type {RegExp} Tasks that require an active implementation story binding. */
const IMPLEMENTATION_TASK_PATTERN = /^(develop(?:-(?:yolo|interactive))?|implement|apply-qa-fixes|fix|refactor)$/i;

/** @type {ReadonlySet<string>} Story statuses accepted for implementation dispatch. */
const VALID_IMPLEMENTATION_STATUSES = new Set(['Ready', 'InProgress', 'InReview']);

/** @type {Array<{ id: string, name: string, pattern: RegExp }>} Blocking intent signatures. */
const INTENT_PATTERNS = [
  {
    id: 'INT-001',
    name: 'path-traversal',
    pattern: /(^|[\\/])\.\.(?:[\\/]|$)|%2e%2e(?:%2f|%5c)/i,
  },
  {
    id: 'INT-002',
    name: 'nul-byte',
    pattern: /\0|\\u0000|%00/i,
  },
  {
    id: 'INT-003',
    name: 'obvious-code-injection',
    pattern: /<script\b|\beval\s*\(|\bchild_process\b|\brm\s+-rf\b/i,
  },
];

/**
 * Error raised when an automated model dispatch violates governance.
 * @class
 */
class DispatchGovernanceError extends Error {
  /**
   * @param {string} code - Stable machine-readable rejection code.
   * @param {string} message - Actionable rejection message.
   * @param {object} [details] - Structured rejection evidence.
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'DispatchGovernanceError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Validate a declared model budget ceiling.
 *
 * @param {string|number|undefined} value - Declared ceiling in USD.
 * @returns {number} Positive finite ceiling.
 * @throws {DispatchGovernanceError} When the ceiling is absent or invalid.
 */
function validateBudgetCeiling(value) {
  const ceiling = Number(value);
  if (!Number.isFinite(ceiling) || ceiling <= 0) {
    throw new DispatchGovernanceError(
      'DISPATCH_BUDGET_REQUIRED',
      'Automated dispatch blocked: declare a positive AIOX_MODEL_BUDGET_CEILING_USD.',
    );
  }
  return ceiling;
}

/**
 * Scan an automated intent for prompt injection and dangerous payloads.
 *
 * Shell metacharacters alone are not rejected because callers must preserve
 * argv literally; only instruction and executable-payload signatures block.
 *
 * @param {string} input - Combined task, parameters, and context.
 * @returns {{ safe: boolean, threats: Array<object> }} Scan result.
 */
function scanAutomatedIntent(input) {
  const text = String(input || '');
  const promptResult = promptGuard.scan(text);
  const threats = [...promptResult.threats];
  for (const definition of INTENT_PATTERNS) {
    const match = definition.pattern.exec(text);
    if (match) {
      threats.push({
        id: definition.id,
        name: definition.name,
        severity: 'CRITICAL',
        matchedText: match[0].slice(0, 100),
      });
    }
  }
  return { safe: threats.length === 0, threats };
}

function normalizeStatus(raw) {
  const status = String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
  if (status === 'ready') return 'Ready';
  if (status === 'inprogress') return 'InProgress';
  if (status === 'inreview' || status === 'readyforreview') return 'InReview';
  if (status === 'done' || status === 'complete') return 'Done';
  if (status === 'draft') return 'Draft';
  return raw ? String(raw).trim() : 'Unknown';
}

function parseStory(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const idMatch =
    text.match(/^\|\s*Story ID\s*\|\s*([^|]+)\|/im) ||
    text.match(/^\*\*Story ID:\*\*\s*(.+)$/im) ||
    text.match(/^#\s+Story\s+([A-Za-z0-9._-]+)/im);
  const statusMatch =
    text.match(/^\|\s*Status\s*\|\s*([^|]+)\|/im) ||
    text.match(/^##\s+Status\s*\n+\s*([^\n]+)/im) ||
    text.match(/^\*\*Status:\*\*\s*(.+)$/im);
  return {
    storyId: idMatch ? idMatch[1].trim() : path.basename(filePath, path.extname(filePath)),
    status: normalizeStatus(statusMatch && statusMatch[1]),
    path: filePath,
  };
}

function walkMarkdownFiles(root, files = []) {
  if (!fs.existsSync(root)) return files;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) walkMarkdownFiles(full, files);
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function resolveStoryFile(binding, projectRoot) {
  if (!binding) return null;
  const raw = typeof binding === 'object'
    ? binding.storyPath || binding.path || binding.story || binding.storyId || binding.id
    : binding;
  if (!raw || typeof raw !== 'string') return null;

  const direct = path.resolve(projectRoot, raw);
  const relative = path.relative(projectRoot, direct);
  if (!relative.startsWith('..') && !path.isAbsolute(relative) && fs.existsSync(direct)) {
    return direct;
  }

  const target = raw.trim().toLowerCase();
  const roots = [
    path.join(projectRoot, 'docs', 'framework', 'epics'),
    path.join(projectRoot, 'docs', 'stories'),
  ];
  for (const root of roots) {
    for (const file of walkMarkdownFiles(root)) {
      const basename = path.basename(file, '.md').replace(/^story-/i, '').toLowerCase();
      if (basename === target) return file;
      const story = parseStory(file);
      if (story.storyId.toLowerCase() === target) return file;
    }
  }
  return null;
}

/**
 * Validate a story binding for automated implementation work.
 *
 * @param {string|object} binding - Story path, id, or story descriptor.
 * @param {object} [options]
 * @param {string} [options.projectRoot] - Repository root.
 * @returns {{ storyId: string, status: string, path: string }} Validated story.
 * @throws {DispatchGovernanceError} When no active valid story can be resolved.
 */
function validateStoryBinding(binding, options = {}) {
  const projectRoot = path.resolve(options.projectRoot || process.cwd());
  const file = resolveStoryFile(binding, projectRoot);
  if (!file) {
    throw new DispatchGovernanceError(
      'DISPATCH_STORY_REQUIRED',
      'Automated implementation dispatch blocked: bind an existing story id/path.',
    );
  }
  const story = parseStory(file);
  if (!VALID_IMPLEMENTATION_STATUSES.has(story.status)) {
    throw new DispatchGovernanceError(
      'DISPATCH_STORY_STATUS',
      `Automated implementation dispatch blocked: story ${story.storyId} is ${story.status}; expected Ready, InProgress, or InReview.`,
      story,
    );
  }
  return story;
}

/**
 * Enforce all pre-dispatch controls for an automated model intent.
 *
 * @param {object} options
 * @param {string|number} [options.budgetCeilingUsd] - Explicit USD ceiling.
 * @param {string} [options.task] - Agent task name.
 * @param {string} [options.intent] - Prompt/context payload to scan.
 * @param {string|object} [options.story] - Story binding.
 * @param {boolean} [options.requiresStory] - Override implementation detection.
 * @param {string} [options.projectRoot] - Repository root.
 * @returns {{ budgetCeilingUsd: number, story: object|null, scan: object }} Evidence.
 * @throws {DispatchGovernanceError} On any governance failure.
 */
function assertDispatchGovernance(options = {}) {
  const budgetCeilingUsd = validateBudgetCeiling(
    options.budgetCeilingUsd ?? process.env.AIOX_MODEL_BUDGET_CEILING_USD,
  );
  const scan = scanAutomatedIntent(options.intent || '');
  if (!scan.safe) {
    throw new DispatchGovernanceError(
      'DISPATCH_INTENT_REJECTED',
      `Automated dispatch blocked: unsafe intent (${scan.threats.map((t) => t.id).join(', ')}).`,
      { threats: scan.threats },
    );
  }
  const requiresStory = options.requiresStory ?? IMPLEMENTATION_TASK_PATTERN.test(options.task || '');
  const story = requiresStory
    ? validateStoryBinding(options.story, { projectRoot: options.projectRoot })
    : null;
  return { budgetCeilingUsd, story, scan };
}

module.exports = {
  DispatchGovernanceError,
  IMPLEMENTATION_TASK_PATTERN,
  INTENT_PATTERNS,
  validateBudgetCeiling,
  scanAutomatedIntent,
  validateStoryBinding,
  assertDispatchGovernance,
};
