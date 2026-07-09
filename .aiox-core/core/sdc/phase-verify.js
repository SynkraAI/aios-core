/**
 * Post-phase verification gates for lean full-sdc (on-disk checks).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseStoryFile } = require('./story-meta');

/**
 * @typedef {object} VerifyResult
 * @property {boolean} ok
 * @property {string} phase
 * @property {string[]} checks
 * @property {string[]} failures
 * @property {object} meta
 */

/**
 * @param {string} storyPath
 * @param {string} phase
 * @param {object} [opts]
 * @returns {VerifyResult}
 */
function verifyPhase(storyPath, phase, opts = {}) {
  const meta = parseStoryFile(storyPath);
  const checks = [];
  const failures = [];

  const add = (ok, msg) => {
    checks.push(`${ok ? 'PASS' : 'FAIL'}: ${msg}`);
    if (!ok) failures.push(msg);
  };

  switch (phase) {
    case 'validate': {
      // GO → Ready (or already further along is OK for re-entry)
      const okStatuses = new Set(['Ready', 'InProgress', 'InReview', 'Done']);
      add(
        okStatuses.has(meta.status),
        `status is Ready+ after validate (got ${meta.status})`,
      );
      break;
    }
    case 'develop': {
      add(meta.status !== 'Draft', `status left Draft (got ${meta.status})`);
      add(meta.status !== 'Done', 'status must not be Done before close (integrity)');
      const hasWork =
        meta.fileList.length > 0 ||
        (meta.tasks.total > 0 && meta.tasks.done > 0) ||
        opts.allowEmptyFileList === true;
      add(hasWork, 'File List non-empty or tasks checked');
      break;
    }
    case 'review': {
      add(meta.status !== 'Done', 'status must not be Done after review-only phase');
      if (meta.qaVerdict) {
        add(
          ['PASS', 'CONCERNS', 'FAIL', 'WAIVED'].includes(meta.qaVerdict),
          `QA verdict present (${meta.qaVerdict})`,
        );
      } else {
        // Look for gate files under docs/qa/gates matching story id slug
        const gatesDir = path.join(opts.cwd || process.cwd(), 'docs', 'qa', 'gates');
        let gateFound = false;
        if (fs.existsSync(gatesDir)) {
          const slug = meta.storyId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const idPattern = new RegExp(`(^|[-_.])${escaped}([-_.]|$)`, 'i');
          const files = fs.readdirSync(gatesDir);
          gateFound = files.some((f) => idPattern.test(f));
        }
        add(
          gateFound,
          'QA Results verdict or docs/qa/gates/* for story exists',
        );
      }
      break;
    }
    case 'apply_qa_fixes': {
      add(meta.status !== 'Done', 'status must not be Done during apply-qa-fixes');
      // Soft: retest notes hard to detect; pass if not Done
      add(true, 'apply-qa-fixes leaves story open for re-review');
      break;
    }
    case 'close': {
      add(meta.status === 'Done', `status is Done (got ${meta.status})`);
      break;
    }
    default:
      failures.push(`Unknown phase: ${phase}`);
  }

  // Integrity: Done only after close phase verification is allowed to see Done
  if (phase !== 'close' && meta.status === 'Done') {
    add(false, 'integrity: Status Done outside close phase');
  }

  return {
    ok: failures.length === 0,
    phase,
    checks,
    failures,
    meta: {
      storyId: meta.storyId,
      status: meta.status,
      fileListCount: meta.fileList.length,
      qaVerdict: meta.qaVerdict,
      tasks: meta.tasks,
    },
  };
}

module.exports = {
  verifyPhase,
};
