/**
 * Durable progress state for lean full-sdc / wave-execute (runtime under .aiox/).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PHASES = ['validate', 'develop', 'review', 'apply_qa_fixes', 'close'];

/**
 * @param {string} [cwd]
 * @returns {string}
 */
function sdcRoot(cwd = process.cwd()) {
  return path.join(cwd, '.aiox', 'sdc');
}

/**
 * @param {string} [cwd]
 * @returns {string}
 */
function waveRoot(cwd = process.cwd()) {
  return path.join(cwd, '.aiox', 'waves');
}

/**
 * Sanitize id for filesystem.
 * @param {string} id
 * @returns {string}
 */
function safeId(id) {
  const sanitized = String(id || 'unknown').replace(/[^a-zA-Z0-9._-]+/g, '_');
  if (!sanitized || sanitized === '.' || sanitized === '..') return 'unknown';
  return sanitized;
}

/**
 * @param {string} storyId
 * @param {string} [cwd]
 * @returns {string}
 */
function sdcStatePath(storyId, cwd = process.cwd()) {
  return path.join(sdcRoot(cwd), safeId(storyId), 'state.json');
}

/**
 * @param {string} waveId
 * @param {string} [cwd]
 * @returns {string}
 */
function waveStatePath(waveId, cwd = process.cwd()) {
  return path.join(waveRoot(cwd), safeId(waveId), 'state.json');
}

/**
 * @param {object} init
 * @returns {object}
 */
function createSdcState(init) {
  if (!init || !init.storyId) {
    throw new Error('createSdcState: init.storyId is required');
  }
  const now = new Date().toISOString();
  const phases = {};
  for (const p of PHASES) {
    phases[p] = { status: 'pending', at: null, notes: null };
  }
  return {
    version: 1,
    kind: 'full-sdc',
    storyId: init.storyId,
    storyPath: init.storyPath || null,
    mode: init.mode || 'interactive',
    status: 'planned',
    currentPhase: 'validate',
    phases,
    qgIterations: 0,
    maxQgIterations: init.maxQgIterations || 3,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * @param {string} filePath
 * @returns {object|null}
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(
      `Failed to parse state file at ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * @param {string} filePath
 * @param {object} data
 * @returns {void}
 * @throws {Error} When the atomic temp write or rename fails.
 */
function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  data.updatedAt = new Date().toISOString();
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    fs.renameSync(tempPath, filePath);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

/**
 * @param {string} storyId
 * @param {string} [cwd]
 * @returns {object|null}
 */
function loadSdcState(storyId, cwd = process.cwd()) {
  return loadJson(sdcStatePath(storyId, cwd));
}

/**
 * @param {object} state
 * @param {string} [cwd]
 */
function saveSdcState(state, cwd = process.cwd()) {
  saveJson(sdcStatePath(state.storyId, cwd), state);
}

/**
 * @param {string} waveId
 * @param {string} [cwd]
 * @returns {object|null}
 */
function loadWaveState(waveId, cwd = process.cwd()) {
  return loadJson(waveStatePath(waveId, cwd));
}

/**
 * @param {object} state
 * @param {string} [cwd]
 */
function saveWaveState(state, cwd = process.cwd()) {
  saveJson(waveStatePath(state.waveId, cwd), state);
}

/**
 * Mark a phase result on SDC state.
 * @param {object} state
 * @param {string} phase
 * @param {'passed'|'failed'|'skipped'|'halted'} status
 * @param {string} [notes]
 * @param {{ outcome?: 'approved'|'changes_requested' }} [options]
 * @returns {object}
 * @throws {Error} When the phase is unknown or a passed review lacks a valid outcome.
 */
function markPhase(state, phase, status, notes, options = {}) {
  if (!PHASES.includes(phase)) {
    throw new Error(`Unknown phase: ${phase}. Expected one of: ${PHASES.join(', ')}`);
  }
  if (
    phase === 'review' &&
    status === 'passed' &&
    !['approved', 'changes_requested'].includes(options.outcome)
  ) {
    throw new Error(
      'Review passed requires outcome: approved or changes_requested',
    );
  }
  state.phases[phase] = {
    status,
    at: new Date().toISOString(),
    notes: notes || null,
  };
  if (status === 'failed' || status === 'halted') {
    state.status = status === 'halted' ? 'halted' : 'failed';
    state.currentPhase = phase;
  } else if (status === 'passed' || status === 'skipped') {
    if (phase === 'review' && options.outcome === 'changes_requested') {
      if ((state.qgIterations || 0) >= state.maxQgIterations) {
        state.phases[phase].status = 'halted';
        state.phases[phase].notes =
          notes || `Quality gate circuit breaker reached (${state.maxQgIterations})`;
        state.status = 'halted';
        state.currentPhase = phase;
      } else {
        state.currentPhase = 'apply_qa_fixes';
        state.status = 'running';
      }
      state.updatedAt = new Date().toISOString();
      return state;
    }
    if (phase === 'review' && options.outcome === 'approved') {
      state.currentPhase = 'close';
      state.status = 'running';
      state.updatedAt = new Date().toISOString();
      return state;
    }
    if (phase === 'apply_qa_fixes') {
      state.qgIterations = (state.qgIterations || 0) + 1;
      state.phases.review = { status: 'pending', at: null, notes: null };
      state.currentPhase = 'review';
      state.status = 'running';
      state.updatedAt = new Date().toISOString();
      return state;
    }
    const idx = PHASES.indexOf(phase);
    const next = PHASES.slice(idx + 1).find((p) => state.phases[p].status === 'pending');
    if (next) {
      state.currentPhase = next;
      state.status = 'running';
    } else {
      state.currentPhase = null;
      state.status = 'completed';
    }
  }
  state.updatedAt = new Date().toISOString();
  return state;
}

module.exports = {
  PHASES,
  sdcRoot,
  waveRoot,
  safeId,
  sdcStatePath,
  waveStatePath,
  createSdcState,
  loadSdcState,
  saveSdcState,
  loadWaveState,
  saveWaveState,
  markPhase,
  loadJson,
  saveJson,
};
