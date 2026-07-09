/**
 * Epic orchestration glue (CORE-SU.C3) — discover STORY-*.md under an epic dir.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseStoryFile } = require('./story-meta');
const { planAndSave } = require('./wave-run');

/**
 * @param {string} epicDir
 * @param {object} [opts]
 * @param {string} [opts.filter] - substring or regex source matched against storyId
 * @param {boolean} [opts.skipDone]
 * @param {string} [opts.cwd]
 * @returns {{ paths: string[], stories: object[], errors: string[] }}
 */
function discoverEpicStories(epicDir, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const abs = path.resolve(cwd, epicDir);
  const errors = [];
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    return { paths: [], stories: [], errors: [`Epic dir not found: ${epicDir}`] };
  }

  const files = fs
    .readdirSync(abs)
    .filter((f) => /^STORY-.*\.md$/i.test(f))
    .map((f) => path.join(abs, f))
    .sort();

  let filterRe = null;
  if (opts.filter) {
    try {
      filterRe = new RegExp(opts.filter, 'i');
    } catch {
      // substring fallback
      filterRe = {
        test: (s) => String(s).toLowerCase().includes(String(opts.filter).toLowerCase()),
      };
    }
  }

  const stories = [];
  const paths = [];
  for (const file of files) {
    let meta;
    try {
      meta = parseStoryFile(file);
    } catch (err) {
      errors.push(`${file}: ${err.message}`);
      continue;
    }
    if (filterRe && !filterRe.test(meta.storyId) && !filterRe.test(path.basename(file))) {
      continue;
    }
    if (opts.skipDone && meta.status === 'Done') {
      continue;
    }
    stories.push(meta);
    paths.push(path.relative(cwd, file) || file);
  }

  return { paths, stories, errors };
}

/**
 * Discover + plan wave from epic directory.
 * @param {object} opts
 * @param {string} opts.epicDir
 * @param {string} [opts.waveId]
 * @param {string} [opts.filter]
 * @param {boolean} [opts.skipDone]
 * @param {string} [opts.mode]
 * @param {string} [opts.cwd]
 * @returns {object} wave plan state
 */
function planWaveFromEpic(opts) {
  const { paths, stories, errors } = discoverEpicStories(opts.epicDir, opts);
  if (errors.length && paths.length === 0) {
    const err = new Error(errors.join('; '));
    err.code = 'EPIC_GLUE_EMPTY';
    throw err;
  }
  if (paths.length === 0) {
    const err = new Error(
      `No stories found under ${opts.epicDir}` +
        (opts.filter ? ` (filter ${opts.filter})` : '') +
        (opts.skipDone ? ' (skipDone)' : ''),
    );
    err.code = 'EPIC_GLUE_EMPTY';
    throw err;
  }

  const absPaths = paths.map((p) => path.resolve(opts.cwd || process.cwd(), p));
  const plan = planAndSave(absPaths, {
    waveId: opts.waveId || `epic-${path.basename(opts.epicDir)}`,
    mode: opts.mode || 'interactive',
    cwd: opts.cwd,
  });
  plan.epicGlue = {
    epicDir: opts.epicDir,
    filter: opts.filter || null,
    skipDone: Boolean(opts.skipDone),
    discovered: stories.map((s) => s.storyId),
  };
  const { saveWaveState } = require('./progress');
  saveWaveState(plan, opts.cwd);
  return plan;
}

module.exports = {
  discoverEpicStories,
  planWaveFromEpic,
};
