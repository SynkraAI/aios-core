/**
 * Path Guard
 *
 * Prevents path traversal and blocks writes to sensitive repository paths.
 * OSS deny list — no product `workspace/` trees (those are hub/enterprise only).
 *
 * @module permissions/path-guard
 * @version 1.0.0
 * @story CORE-SU.A3
 *
 * ─── STANDALONE LIBRARY — NOT WIRED TO RUNTIME ENFORCEMENT ───────────────
 *
 * This module is exported from `permissions/index.js` but is NOT called by
 * `operation-guard.js`'s `guard()` path, and is NOT registered as a
 * PreToolUse hook. No write operation is validated against this guard
 * automatically today. Callers must invoke `validateWrite()` /
 * `isTraversalAttempt()` explicitly wherever path-write safety is required
 * (e.g. app code writing to disk on behalf of untrusted input).
 *
 * If/when this is wired into `OperationGuard.guard()` or a hook, remove
 * this notice and document the integration point here.
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────
 *
 *   const pathGuard = require('.aiox-core/core/permissions/path-guard');
 *   const result = pathGuard.validateWrite(targetPath);
 *   if (!result.allowed) {
 *     // Block: result.reason available
 *   }
 */

'use strict';

const path = require('path');

/**
 * Write-denied path prefixes (relative to project root).
 * Do NOT include hub `workspace/` — not part of OSS core layout.
 */
const WRITE_DENY_LIST = [
  // Framework constitution / agent governance
  '.aiox-core/constitution.md',
  '.claude/rules',
  '.claude/hooks',
  // Secrets
  '.env',
  '.env.local',
  '.env.production',
  '.env.staging',
  // Git internals
  '.git',
  // Installer / package binaries
  'node_modules/.bin',
  // CI secret material (if present)
  '.github/workflows/secrets',
];

const TRAVERSAL_PATTERNS = [
  /\.\.[/\\]/, // ../ or ..\
  /[/\\]\.\.(?:[/\\]|$)/, // mid-path or trailing /..
  /%2e%2e/i, // URL-encoded ..
  /%2f/i, // URL-encoded /
  /\0/, // null byte
];

/**
 * @param {string} inputPath
 * @param {string} [base]
 * @returns {string}
 */
function normalizePath(inputPath, base = process.cwd()) {
  if (typeof inputPath !== 'string') {
    throw new TypeError('path-guard: inputPath must be a string');
  }
  return path.resolve(base, inputPath);
}

/**
 * @param {string} inputPath
 * @returns {{ traversal: boolean, patterns: string[] }}
 */
function checkTraversalPatterns(inputPath) {
  const matched = [];
  for (const pattern of TRAVERSAL_PATTERNS) {
    if (pattern.test(inputPath)) {
      matched.push(pattern.toString());
    }
  }
  return { traversal: matched.length > 0, patterns: matched };
}

/**
 * @param {string} resolvedPath
 * @param {string} [projectRoot]
 * @returns {{ denied: boolean, matchedRule: string|null }}
 */
function checkDenyList(resolvedPath, projectRoot = process.cwd()) {
  const normalRoot = path.resolve(projectRoot);

  for (const denied of WRITE_DENY_LIST) {
    const deniedAbsolute = path.resolve(normalRoot, denied);
    const relative = path.relative(deniedAbsolute, resolvedPath);
    const isChild = relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
    const isEqual = resolvedPath === deniedAbsolute;

    // Also match deny entry as a path *prefix file* (e.g. .env blocks .env.backup only if equal or child)
    if (isEqual || isChild) {
      return { denied: true, matchedRule: denied };
    }

    // Prefix match for bare filenames like `.env` that are files not dirs:
    // block `.env.local` when rule is `.env` only if rule ends with a path sep — skip.
    // Explicit list already includes .env.local etc.
  }

  // Block any path whose basename starts with .env (common secret leak)
  const base = path.basename(resolvedPath);
  if (base === '.env' || base.startsWith('.env.')) {
    return { denied: true, matchedRule: '.env*' };
  }

  return { denied: false, matchedRule: null };
}

/**
 * Validate a write path against traversal + project root + deny list.
 *
 * @param {string} inputPath
 * @param {string} [projectRoot]
 * @returns {{
 *   allowed: boolean,
 *   resolvedPath: string,
 *   traversalDetected: boolean,
 *   denyListed: boolean,
 *   matchedRule: string|null,
 *   reason: string|null
 * }}
 */
function validateWrite(inputPath, projectRoot = process.cwd()) {
  if (typeof inputPath !== 'string') {
    throw new TypeError('path-guard: inputPath must be a string');
  }

  const traversalCheck = checkTraversalPatterns(inputPath);
  const resolvedPath = normalizePath(inputPath, projectRoot);
  const normalRoot = path.resolve(projectRoot);
  const relative = path.relative(normalRoot, resolvedPath);
  const escapesRoot = relative.startsWith('..') || path.isAbsolute(relative);
  const denyCheck = checkDenyList(resolvedPath, projectRoot);

  const denied = traversalCheck.traversal || escapesRoot || denyCheck.denied;

  let reason = null;
  if (traversalCheck.traversal) {
    reason = `Path traversal pattern detected: ${traversalCheck.patterns.join(', ')}`;
  } else if (escapesRoot) {
    reason = `Resolved path escapes project root: ${resolvedPath} is outside ${normalRoot}`;
  } else if (denyCheck.denied) {
    reason = `Path is in write deny list (rule: ${denyCheck.matchedRule})`;
  }

  return {
    allowed: !denied,
    resolvedPath,
    traversalDetected: traversalCheck.traversal,
    denyListed: denyCheck.denied,
    matchedRule: denyCheck.matchedRule,
    reason,
  };
}

/**
 * Check whether a requested write remains inside the project and outside the denylist.
 *
 * @param {string} inputPath - User-supplied path.
 * @param {string} [projectRoot] - Absolute or relative repository root.
 * @returns {boolean} True only when `validateWrite` allows the path.
 * @throws {TypeError} When inputPath is not a string.
 */
function isWriteAllowed(inputPath, projectRoot = process.cwd()) {
  return validateWrite(inputPath, projectRoot).allowed;
}

/**
 * Return a copy of the configured write-deny rules.
 *
 * @returns {string[]} Denied path patterns; mutations do not affect the guard.
 */
function getDenyList() {
  return [...WRITE_DENY_LIST];
}

module.exports = {
  validateWrite,
  isWriteAllowed,
  normalizePath,
  checkTraversalPatterns,
  checkDenyList,
  getDenyList,
  WRITE_DENY_LIST,
};
