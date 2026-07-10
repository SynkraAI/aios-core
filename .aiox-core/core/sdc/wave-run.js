/**
 * Wave run controller (CORE-SU Wave C1) — batch advance, cascade-block, report.
 * Builds on wave-plan + sdc progress. No product harvest / worktree registry.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  loadWaveState,
  saveWaveState,
  loadSdcState,
  waveStatePath,
  waveRoot,
} = require('./progress');
const { planWaveFromPaths } = require('./wave-plan');
const { parseStoryFile, resolveQaEvidence } = require('./story-meta');
const { createDispatchAdapter } = require('./dispatch-adapter');

function hasApprovedQaEvidence(story) {
  return (
    story.status === 'Done' &&
    ['PASS', 'CONCERNS', 'WAIVED'].includes(story.qaVerdict) &&
    story.qaEvidenceComplete === true &&
    !story.qaEvidenceError
  );
}

/**
 * @param {object} wave
 * @param {string} storyId
 * @returns {object|null}
 */
function findStory(wave, storyId) {
  for (const b of wave.batches || []) {
    const hit = (b.stories || []).find((s) => s.storyId === storyId);
    if (hit) return { batch: b, story: hit };
  }
  return null;
}

/**
 * Transitive dependents of failed/blocked ids within the wave.
 * @param {object} wave
 * @param {string[]} blockedIds
 * @returns {string[]}
 */
function cascadeBlock(wave, blockedIds) {
  const edges = (wave.graph && wave.graph.edges) || [];
  const blocked = new Set(blockedIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of edges) {
      if (blocked.has(e.from) && !blocked.has(e.to)) {
        blocked.add(e.to);
        changed = true;
      }
    }
    // also from story.dependsOn
    for (const s of wave.stories || []) {
      const deps = s.dependsOn || [];
      if (deps.some((d) => blocked.has(d)) && !blocked.has(s.storyId)) {
        blocked.add(s.storyId);
        changed = true;
      }
    }
  }
  return [...blocked];
}

/**
 * Enrich wave stories with live SDC status when available.
 * @param {object} wave
 * @param {string} [cwd]
 * @returns {object}
 */
function refreshStoryStatuses(wave, cwd = process.cwd()) {
  const refreshOne = (s) => {
    const st = loadSdcState(s.storyId, cwd);
    if (st) {
      s.sdcStatus = st.status;
      s.sdcPhase = st.currentPhase;
    }
    const storyPath = s.absPath || s.path;
    if (storyPath && fs.existsSync(path.resolve(cwd, storyPath))) {
      try {
        const meta = parseStoryFile(path.resolve(cwd, storyPath));
        const evidence = resolveQaEvidence(meta, { cwd });
        s.status = meta.status;
        s.qaVerdict = evidence.verdict;
        s.qaReviewer = evidence.reviewer;
        s.qaReviewedRevision = evidence.reviewedRevision;
        s.qaEvidenceComplete = evidence.complete;
        s.qaEvidenceError = evidence.error;
      } catch (_err) {
        /* keep prior status */
      }
    }
  };
  for (const s of wave.stories || []) refreshOne(s);
  for (const b of wave.batches || []) {
    for (const s of b.stories || []) refreshOne(s);
  }
  return wave;
}

/**
 * First batch that still has non-completed, non-blocked stories.
 * @param {object} wave
 * @returns {{ index: number, stories: object[] }|null}
 */
function nextOpenBatch(wave) {
  const blocked = new Set(wave.blockedStoryIds || []);
  for (const b of wave.batches || []) {
    const open = (b.stories || []).filter((s) => {
      if (blocked.has(s.storyId)) return false;
      if (s.runStatus === 'completed' || s.runStatus === 'skipped') return false;
      if (hasApprovedQaEvidence(s)) return false;
      return true;
    });
    if (open.length) return { index: b.index, stories: open };
  }
  return null;
}

/**
 * Mark a story's run status on the wave and cascade on failure.
 * @param {object} wave
 * @param {string} storyId
 * @param {'completed'|'failed'|'blocked'|'skipped'|'running'} runStatus
 * @param {string} [notes]
 * @returns {object}
 */
function markStoryRun(wave, storyId, runStatus, notes) {
  const loc = findStory(wave, storyId);
  if (!loc) {
    throw new Error(`Story ${storyId} not in wave ${wave.waveId}`);
  }
  loc.story.runStatus = runStatus;
  loc.story.runNotes = notes || null;
  loc.story.runAt = new Date().toISOString();

  // mirror on wave.stories
  const top = (wave.stories || []).find((s) => s.storyId === storyId);
  if (top) {
    top.runStatus = runStatus;
    top.runNotes = notes || null;
  }

  if (runStatus === 'failed' || runStatus === 'blocked') {
    wave.blockedStoryIds = wave.blockedStoryIds || [];
    if (!wave.blockedStoryIds.includes(storyId)) {
      wave.blockedStoryIds.push(storyId);
    }
    const cascaded = cascadeBlock(wave, wave.blockedStoryIds);
    for (const id of cascaded) {
      if (id === storyId) continue; // keep originating failed/blocked notes
      if (!wave.blockedStoryIds.includes(id)) wave.blockedStoryIds.push(id);
      const other = findStory(wave, id);
      if (other && other.story.runStatus !== 'completed') {
        other.story.runStatus = 'blocked';
        other.story.runNotes = `cascade from ${storyId}`;
      }
      const topO = (wave.stories || []).find((s) => s.storyId === id);
      if (topO && topO.runStatus !== 'completed') {
        topO.runStatus = 'blocked';
        topO.runNotes = `cascade from ${storyId}`;
      }
    }
  }

  wave.updatedAt = new Date().toISOString();
  if (!nextOpenBatch(wave)) {
    const anyFailed = (wave.stories || []).some(
      (s) => s.runStatus === 'failed' || s.runStatus === 'blocked',
    );
    wave.status = anyFailed ? 'completed_with_failures' : 'completed';
  } else {
    wave.status = 'running';
  }
  return wave;
}

/**
 * Advance wave: refresh statuses, auto-complete stories with sdc completed, return next batch.
 * @param {string} waveId
 * @param {object} [opts]
 * @returns {object}
 */
function advanceWave(waveId, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const wave = loadWaveState(waveId, cwd);
  if (!wave) {
    throw new Error(`No wave state for ${waveId}. Run: aiox wave plan … --save`);
  }
  refreshStoryStatuses(wave, cwd);

  // Auto-mark only from canonical story lifecycle evidence; checkpoints are advisory.
  for (const s of wave.stories || []) {
    if (s.runStatus === 'completed' || s.runStatus === 'blocked') continue;
    if (hasApprovedQaEvidence(s)) {
      markStoryRun(wave, s.storyId, 'completed', 'auto: approved QA evidence in Done story');
    }
  }

  const next = nextOpenBatch(wave);
  wave.currentBatch = next ? next.index : null;
  if (!next) {
    const anyFailed = (wave.stories || []).some(
      (s) => s.runStatus === 'failed' || s.runStatus === 'blocked',
    );
    wave.status = anyFailed ? 'completed_with_failures' : 'completed';
  } else {
    wave.status = 'running';
    for (const s of next.stories) {
      if (!s.runStatus || s.runStatus === 'pending') {
        s.runStatus = 'ready';
      }
    }
  }
  saveWaveState(wave, cwd);
  return { wave, nextBatch: next };
}

/**
 * Run a worker over a batch of stories using the dispatch adapter (C2).
 * @param {object[]} stories
 * @param {(story: object, payload: { intent: *, context: *, governance: object }) => Promise<*>|*} worker
 * @param {object} [opts]
 * @param {'sequential'|'parallel'} [opts.mode]
 * @param {number} [opts.maxParallel]
 * @param {number|string} opts.budgetCeilingUsd - Required automated model budget ceiling.
 * @param {string} [opts.cwd] - Repository root for story validation.
 * @param {string|object|Function} opts.intent - Exact child model intent or resolver.
 * @param {object|Function} [opts.context] - Exact child context or resolver.
 * @returns {Promise<Array>}
 */
async function runWaveBatch(stories, worker, opts = {}) {
  const adapter = createDispatchAdapter({
    mode: opts.mode || 'sequential',
    maxParallel: opts.maxParallel,
    budgetCeilingUsd: opts.budgetCeilingUsd,
    projectRoot: opts.cwd,
    intent: opts.intent,
    context: opts.context,
  });
  return adapter.runBatch(stories || [], worker);
}

/**
 * Write markdown report for a wave.
 * @param {string} waveId
 * @param {object} [opts]
 * @returns {string} report path
 */
function writeWaveReport(waveId, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const wave = refreshStoryStatuses(loadWaveState(waveId, cwd) || {}, cwd);
  if (!wave.waveId) throw new Error(`No wave state for ${waveId}`);

  const lines = [
    `# Wave report: ${wave.waveId}`,
    '',
    `- Status: **${wave.status}**`,
    `- Mode: ${wave.mode || '—'}`,
    `- Updated: ${wave.updatedAt || '—'}`,
    '',
  ];
  if (wave.epicGlue) {
    lines.push('## Epic glue', '');
    lines.push(`- Epic dir: \`${wave.epicGlue.epicDir || '—'}\``);
    lines.push(`- Filter: ${wave.epicGlue.filter || '—'}`);
    lines.push(`- skipDone: ${wave.epicGlue.skipDone ? 'yes' : 'no'}`);
    lines.push(
      `- Discovered: ${(wave.epicGlue.discovered || []).join(', ') || '—'}`,
    );
    lines.push('');
  }
  lines.push(
    '## Stories',
    '',
    '| Story | File status | SDC | Run | Notes |',
    '|-------|-------------|-----|-----|-------|',
  );
  for (const s of wave.stories || []) {
    lines.push(
      `| ${s.storyId} | ${s.status || '—'} | ${s.sdcStatus || '—'} | ${s.runStatus || '—'} | ${s.runNotes || ''} |`,
    );
  }
  lines.push('', '## Batches', '');
  for (const b of wave.batches || []) {
    lines.push(`### Batch ${b.index}`);
    for (const s of b.stories || []) {
      lines.push(`- ${s.storyId}: run=${s.runStatus || '—'} partition=${s.partition || '—'}`);
    }
    lines.push('');
  }
  if ((wave.blockedStoryIds || []).length) {
    lines.push('## Blocked', '');
    for (const id of wave.blockedStoryIds) lines.push(`- ${id}`);
    lines.push('');
  }
  lines.push('## Next', '');
  lines.push('Merge/push is `@devops` exclusive after stories are Done.');
  lines.push('');

  const dir = path.join(waveRoot(cwd), wave.waveId);
  fs.mkdirSync(dir, { recursive: true });
  const reportPath = path.join(dir, 'report.md');
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');
  wave.reportPath = path.relative(cwd, reportPath);
  saveWaveState(wave, cwd);
  return reportPath;
}

/**
 * Re-plan and merge runStatus when possible.
 * @param {string[]} storyPaths
 * @param {object} opts
 */
function planAndSave(storyPaths, opts = {}) {
  const plan = planWaveFromPaths(storyPaths, opts);
  const cwd = opts.cwd || process.cwd();
  const prev = opts.waveId ? loadWaveState(opts.waveId, cwd) : null;
  if (prev && prev.stories) {
    const prevById = new Map(prev.stories.map((s) => [s.storyId, s]));
    for (const s of plan.stories) {
      const p = prevById.get(s.storyId);
      if (p && p.runStatus) {
        s.runStatus = p.runStatus;
        s.runNotes = p.runNotes;
      }
    }
    plan.blockedStoryIds = prev.blockedStoryIds || [];
  }
  for (const s of plan.stories) {
    if (!s.runStatus) s.runStatus = 'pending';
  }
  saveWaveState(plan, cwd);
  return plan;
}

module.exports = {
  cascadeBlock,
  findStory,
  refreshStoryStatuses,
  nextOpenBatch,
  markStoryRun,
  advanceWave,
  writeWaveReport,
  planAndSave,
  runWaveBatch,
  waveStatePath,
};
