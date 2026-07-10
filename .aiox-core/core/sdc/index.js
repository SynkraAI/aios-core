/**
 * Lean SDC runtime — plan, verify, progress for full-sdc + wave-execute.
 */

'use strict';

const storyMeta = require('./story-meta');
const progress = require('./progress');
const phaseVerify = require('./phase-verify');
const wavePlan = require('./wave-plan');
const waveRun = require('./wave-run');
const dispatchAdapter = require('./dispatch-adapter');
const epicGlue = require('./epic-glue');

/**
 * Initialize or load full-sdc run state for a story.
 * @param {string} storyPath
 * @param {object} [opts]
 * @returns {object}
 */
function initFullSdc(storyPath, opts = {}) {
  const meta = storyMeta.parseStoryFile(storyPath);
  let state = progress.loadSdcState(meta.storyId, opts.cwd);
  if (!state || opts.force) {
    state = progress.createSdcState({
      storyId: meta.storyId,
      storyPath: meta.relPath,
      mode: opts.mode || 'interactive',
      maxQgIterations: opts.maxQgIterations || 3,
    });
    // Resume hints from current story status (re-entry)
    const now = new Date().toISOString();
    const pass = (phase, notes) => {
      state.phases[phase].status = 'passed';
      state.phases[phase].at = now;
      state.phases[phase].notes = notes;
    };

    const approvedQaEvidence =
      meta.status === 'Done' &&
      phaseVerify.verifyPhase(storyPath, 'close', opts).ok;
    if (meta.status === 'Done' && approvedQaEvidence) {
      for (const p of progress.PHASES) {
        pass(p, 'story already Done with approved QA evidence');
      }
      state.currentPhase = null;
      state.status = 'completed';
    } else if (meta.status === 'Done') {
      pass('validate', 'pre-existing Done without complete QA evidence');
      pass('develop', 'pre-existing Done without complete QA evidence');
      state.currentPhase = 'review';
      state.status = 'running';
    } else if (meta.status === 'InReview') {
      pass('validate', 'pre-existing InReview');
      pass('develop', 'pre-existing InReview');
      state.currentPhase = 'review';
      state.status = 'running';
    } else if (meta.status === 'InProgress') {
      pass('validate', 'pre-existing InProgress');
      state.currentPhase = 'develop';
      state.status = 'running';
    } else if (meta.status === 'Ready') {
      pass('validate', 'pre-existing Ready');
      state.currentPhase = 'develop';
      state.status = 'running';
    }
    progress.saveSdcState(state, opts.cwd);
  }
  return { state, meta };
}

/**
 * @param {string} storyPath
 * @param {string} phase
 * @param {object} [opts]
 * @returns {object}
 */
function verifyAndMaybeMark(storyPath, phase, opts = {}) {
  const result = phaseVerify.verifyPhase(storyPath, phase, opts);
  const meta = storyMeta.parseStoryFile(storyPath);
  let state = progress.loadSdcState(meta.storyId, opts.cwd);
  if (!state) {
    ({ state } = initFullSdc(storyPath, opts));
  }
  if (opts.mark) {
    progress.markPhase(
      state,
      phase,
      result.ok ? 'passed' : 'failed',
      result.ok ? null : result.failures.join('; '),
      { outcome: result.outcome },
    );
    progress.saveSdcState(state, opts.cwd);
  }
  return { result, state, meta };
}

module.exports = {
  ...storyMeta,
  ...progress,
  ...phaseVerify,
  ...wavePlan,
  ...waveRun,
  ...dispatchAdapter,
  ...epicGlue,
  initFullSdc,
  verifyAndMaybeMark,
};
