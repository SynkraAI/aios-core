/**
 * Lean wave planner — DAG from depends_on + file-ownership partition.
 * No worktree product, no conductor.
 */

'use strict';

const { parseStoryFile } = require('./story-meta');

/**
 * @param {string[]} a
 * @param {string[]} b
 * @returns {string[]}
 */
function intersection(a, b) {
  const setB = new Set(b.map(normalizePath));
  return a.map(normalizePath).filter((p) => setB.has(p));
}

/**
 * @param {string} p
 * @returns {string}
 */
function normalizePath(p) {
  return String(p || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .trim();
}

/**
 * Topological batches: stories with unmet deps wait; within a ready set,
 * file-overlapping stories are sequenced (stable order by storyId).
 *
 * @param {Array<{storyId: string, dependsOn: string[], fileList: string[], path: string, status: string}>} stories
 * @returns {{ batches: Array<Array<object>>, errors: string[], graph: object }}
 */
function planWaveBatches(stories) {
  const byId = new Map(stories.map((s) => [s.storyId, s]));
  const errors = [];
  const remaining = new Set(stories.map((s) => s.storyId));
  const batches = [];
  const completed = new Set();

  // Validate dependsOn references
  for (const s of stories) {
    for (const d of s.dependsOn || []) {
      if (!byId.has(d) && !stories.some((x) => x.storyId === d)) {
        // external dep — treat as already satisfied if not in wave
        // only error if cycle within wave
      }
    }
  }

  // Cycle detection via Kahn
  let guard = 0;
  while (remaining.size > 0 && guard < stories.length + 2) {
    guard += 1;
    const ready = [];
    for (const id of remaining) {
      const s = byId.get(id);
      // deps outside wave are ignored
      const unmetInWave = (s.dependsOn || []).filter((d) => remaining.has(d));
      if (unmetInWave.length === 0) ready.push(s);
    }

    if (ready.length === 0) {
      errors.push(
        `Cycle or unsatisfiable depends_on among: ${[...remaining].join(', ')}`,
      );
      break;
    }

    // Ready set → one batch of max non-overlapping subset (file ownership).
    // Overlapping remainder stays for the next iteration after this batch completes.
    const ordered = [...ready].sort((a, b) => a.storyId.localeCompare(b.storyId));
    const batch = [];
    const usedFiles = new Set();
    for (const s of ordered) {
      const files = (s.fileList || []).map(normalizePath);
      const conflict = files.some((f) => usedFiles.has(f));
      if (conflict) continue;
      batch.push({
        ...s,
        partition: 'parallel',
        partition_source: 'file-ownership',
      });
      for (const f of files) usedFiles.add(f);
    }

    if (batch.length === 0) {
      // all conflict — force first
      const first = ordered[0];
      batch.push({ ...first, partition: 'sequenced', partition_source: 'forced-serial' });
    }

    batches.push(batch);
    for (const s of batch) {
      remaining.delete(s.storyId);
      completed.add(s.storyId);
    }
  }

  return {
    batches,
    errors,
    graph: {
      nodes: stories.map((s) => s.storyId),
      edges: stories.flatMap((s) =>
        (s.dependsOn || [])
          .filter((d) => byId.has(d))
          .map((d) => ({ from: d, to: s.storyId })),
      ),
    },
  };
}

/**
 * @param {string[]} storyPaths
 * @param {object} [opts]
 * @returns {object}
 */
function planWaveFromPaths(storyPaths, opts = {}) {
  if (!Array.isArray(storyPaths)) {
    throw new TypeError('planWaveFromPaths: storyPaths must be an array of paths');
  }
  const stories = storyPaths.map((p) => {
    let meta;
    try {
      meta = parseStoryFile(p);
    } catch (err) {
      throw new Error(
        `planWaveFromPaths: failed to parse story "${p}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    return {
      storyId: meta.storyId,
      path: meta.relPath,
      absPath: meta.path,
      status: meta.status,
      dependsOn: meta.dependsOn,
      fileList: meta.fileList,
    };
  });

  const { batches, errors, graph } = planWaveBatches(stories);
  const waveId = opts.waveId || `wave-${Date.now()}`;

  return {
    version: 1,
    kind: 'wave-execute',
    waveId,
    status: errors.length ? 'invalid' : 'planned',
    mode: opts.mode || 'interactive',
    stories,
    batches: batches.map((b, i) => ({
      index: i + 1,
      stories: b.map((s) => ({
        storyId: s.storyId,
        path: s.path,
        absPath: s.absPath,
        status: s.status,
        partition: s.partition,
        partition_source: s.partition_source,
        dependsOn: s.dependsOn,
        fileList: s.fileList,
      })),
    })),
    graph,
    errors,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  planWaveBatches,
  planWaveFromPaths,
  intersection,
  normalizePath,
};
