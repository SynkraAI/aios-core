/**
 * Optional story dispatch adapter (CORE-SU.C2).
 * Sequential default; parallel via Promise pool. No cockpit spawn.
 */

'use strict';

/**
 * @typedef {object} DispatchItem
 * @property {string} [storyId]
 * @property {string} [id]
 */

/**
 * @param {object} [options]
 * @param {'sequential'|'parallel'} [options.mode]
 * @param {number} [options.maxParallel]
 * @param {(msg: string) => void} [options.warn]
 * @returns {{ mode: string, maxParallel: number, dispatchStory: Function, runBatch: Function }}
 */
function createDispatchAdapter(options = {}) {
  let mode = options.mode || 'sequential';
  const warn = options.warn || ((m) => console.warn(`[dispatch-adapter] ${m}`));
  if (mode !== 'sequential' && mode !== 'parallel') {
    warn(`Invalid mode ${JSON.stringify(mode)}; falling back to sequential`);
    mode = 'sequential';
  }
  let maxParallel = Number(options.maxParallel);
  if (!Number.isInteger(maxParallel) || maxParallel < 1) {
    maxParallel = mode === 'parallel' ? 2 : 1;
  }

  /**
   * @param {{ story: object, run: (story: object) => Promise<*>| * }} args
   */
  async function dispatchStory({ story, run }) {
    const storyId = (story && (story.storyId || story.id)) || 'unknown';
    try {
      const result = await Promise.resolve(run(story));
      return { storyId, ok: true, result };
    } catch (error) {
      return {
        storyId,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run workers for items. Always returns settled results in input order.
   * @param {DispatchItem[]} items
   * @param {(item: DispatchItem) => Promise<*>|*} worker
   * @returns {Promise<Array<{ storyId: string, ok: boolean, result?: *, error?: string }>>}
   */
  async function runBatch(items, worker) {
    const list = Array.isArray(items) ? items : [];
    if (mode === 'sequential' || maxParallel <= 1) {
      const out = [];
      for (const item of list) {
        out.push(await dispatchStory({ story: item, run: worker }));
      }
      return out;
    }

    // Parallel pool, preserve order
    const results = new Array(list.length);
    let nextIndex = 0;

    async function workerLoop() {
      while (true) {
        const i = nextIndex;
        nextIndex += 1;
        if (i >= list.length) return;
        results[i] = await dispatchStory({ story: list[i], run: worker });
      }
    }

    const pool = Math.min(maxParallel, list.length);
    await Promise.all(Array.from({ length: pool }, () => workerLoop()));
    return results;
  }

  return {
    mode,
    maxParallel,
    dispatchStory,
    runBatch,
  };
}

module.exports = {
  createDispatchAdapter,
};
