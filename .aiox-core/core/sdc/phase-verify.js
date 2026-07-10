/**
 * Post-phase verification gates for lean full-sdc (on-disk checks).
 */

'use strict';

const { parseStoryFile, resolveQaEvidence } = require('./story-meta');

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
  const qaEvidence = resolveQaEvidence(meta, opts);
  const qaVerdict = qaEvidence.verdict;

  const add = (ok, msg) => {
    checks.push(`${ok ? 'PASS' : 'FAIL'}: ${msg}`);
    if (!ok) failures.push(msg);
  };
  if (['review', 'close'].includes(phase) && qaEvidence.error) {
    add(false, qaEvidence.error);
  }

  switch (phase) {
    case 'validate': {
      // GO → Ready (or already further along is OK for re-entry)
      const okStatuses = new Set(['Ready', 'InProgress', 'InReview', 'Done']);
      add(okStatuses.has(meta.status), `status is Ready+ after validate (got ${meta.status})`);
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
      if (!meta.qaVerdict) {
        add(qaEvidence.gateFound, 'QA Results verdict or canonical story-bound QA gate exists');
      }
      add(Boolean(qaVerdict), 'QA evidence contains an explicit verdict');
      if (qaVerdict) {
        add(
          ['PASS', 'CONCERNS', 'FAIL', 'WAIVED'].includes(qaVerdict),
          `QA verdict present (${qaVerdict})`,
        );
        add(Boolean(qaEvidence.reviewer), 'QA evidence identifies reviewer');
        add(Boolean(qaEvidence.reviewedRevision), 'QA evidence binds reviewed_revision');
        add(qaEvidence.complete, 'QA evidence provenance matches the current story/verdict');
        if (qaVerdict === 'FAIL') {
          add(
            meta.status === 'InProgress',
            `QA FAIL returned status to InProgress (got ${meta.status})`,
          );
        } else {
          add(meta.status === 'Done', `approved QA verdict set status Done (got ${meta.status})`);
        }
      }
      break;
    }
    case 'apply_qa_fixes': {
      add(
        meta.status === 'InProgress',
        `status remains InProgress during fixes (got ${meta.status})`,
      );
      add(true, 'apply-qa-fixes returns to mandatory re-review');
      break;
    }
    case 'close': {
      add(meta.status === 'Done', `status is Done (got ${meta.status})`);
      add(
        ['PASS', 'CONCERNS', 'WAIVED'].includes(qaVerdict),
        `approved QA verdict exists (got ${qaVerdict || 'none'})`,
      );
      add(Boolean(qaEvidence.reviewer), 'QA evidence identifies reviewer');
      add(Boolean(qaEvidence.reviewedRevision), 'QA evidence binds reviewed_revision');
      add(qaEvidence.complete, 'QA evidence provenance matches the current story/verdict');
      break;
    }
    default:
      failures.push(`Unknown phase: ${phase}`);
  }

  return {
    ok: failures.length === 0,
    phase,
    checks,
    failures,
    outcome:
      phase === 'review' && qaVerdict
        ? qaVerdict === 'FAIL'
          ? 'changes_requested'
          : 'approved'
        : null,
    meta: {
      storyId: meta.storyId,
      status: meta.status,
      fileListCount: meta.fileList.length,
      qaVerdict,
      qaReviewer: qaEvidence.reviewer,
      qaReviewedRevision: qaEvidence.reviewedRevision,
      qaEvidenceError: qaEvidence.error,
      tasks: meta.tasks,
    },
  };
}

module.exports = {
  verifyPhase,
};
