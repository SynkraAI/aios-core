/**
 * CLI: aiox wave — lean wave-execute plan / status
 *
 * Usage:
 *   aiox wave plan --stories <p1,p2,...> [--wave-id ID] [--mode yolo] [--save]
 *   aiox wave plan --glob <glob> ...
 *   aiox wave status <wave-id>
 *   aiox wave next <wave-id>
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const sdc = require('../../../core/sdc');

/**
 * Expand simple globs via fs (no extra deps). Supports ** and * in basename only lightly.
 * @param {string[]} inputs
 * @returns {string[]}
 */
function resolveStoryPaths(inputs) {
  const out = [];
  for (const input of inputs) {
    if (input.includes('*')) {
      // minimal: only support path/to/*.md
      const dir = path.dirname(input);
      const base = path.basename(input);
      const re = new RegExp(
        `^${base.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`
      );
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (re.test(f)) out.push(path.join(dir, f));
      }
    } else {
      out.push(input);
    }
  }
  return [...new Set(out.map((p) => path.resolve(p)))];
}

function createWaveCommand() {
  const cmd = new Command('wave');
  cmd.description('Lean wave-execute planner (DAG + file partition)');

  cmd
    .command('plan')
    .description('Build wave batches from story paths')
    .option('--stories <list>', 'Comma-separated story paths')
    .option('--story <path>', 'Repeatable story path', collect, [])
    .option('--wave-id <id>', 'Wave id')
    .option('--mode <mode>', 'yolo | interactive', 'interactive')
    .option('--save', 'Persist under .aiox/waves/', false)
    .option('--json', 'JSON output', false)
    .action((opts) => {
      const list = [];
      if (opts.stories) list.push(...opts.stories.split(',').map((s) => s.trim()));
      if (opts.story) list.push(...opts.story);
      if (list.length === 0) {
        console.error('Provide --stories a.md,b.md and/or --story path');
        process.exitCode = 1;
        return;
      }
      const paths = resolveStoryPaths(list);
      const plan = sdc.planWaveFromPaths(paths, {
        waveId: opts.waveId,
        mode: opts.mode,
      });
      if (opts.save || opts.waveId) {
        sdc.saveWaveState(plan);
      }
      if (opts.json) {
        console.log(JSON.stringify(plan, null, 2));
        return;
      }
      console.log(`Wave plan: ${plan.waveId} [${plan.status}]`);
      if (plan.errors.length) {
        for (const e of plan.errors) console.log(`  ERROR: ${e}`);
      }
      console.log(`  stories: ${plan.stories.length}`);
      for (const b of plan.batches) {
        console.log(`\nBatch ${b.index} (${b.stories.length}):`);
        for (const s of b.stories) {
          console.log(
            `  - ${s.storyId} [${s.status}] ${s.partition} files=${s.fileList.length}`
          );
          console.log(`    ${s.path}`);
          console.log(`    → full-sdc: aiox sdc plan ${s.path} --mode ${plan.mode}`);
        }
      }
      if (opts.save || opts.waveId) {
        console.log(`\nSaved: ${sdc.waveStatePath(plan.waveId)}`);
      }
      console.log('\nDispatch each story with skill full-sdc (or aiox sdc next).');
      console.log('Merge-back is @devops exclusive after all Done.');
    });

  cmd
    .command('status')
    .description('Show saved wave plan')
    .argument('<wave-id>', 'Wave id')
    .option('--json', 'JSON output', false)
    .action((waveId, opts) => {
      const state = sdc.loadWaveState(waveId);
      if (!state) {
        console.error(`No wave state for ${waveId}`);
        process.exitCode = 1;
        return;
      }
      if (opts.json) {
        console.log(JSON.stringify(state, null, 2));
        return;
      }
      console.log(`Wave ${state.waveId} [${state.status}]`);
      for (const b of state.batches || []) {
        console.log(`Batch ${b.index}:`);
        for (const s of b.stories) {
          console.log(`  - ${s.storyId} (${s.status})`);
        }
      }
    });

  cmd
    .command('next')
    .description('Show first incomplete batch + sdc next hints')
    .argument('<wave-id>', 'Wave id')
    .option('--json', 'JSON output', false)
    .action((waveId, opts) => {
      const state = sdc.loadWaveState(waveId);
      if (!state) {
        console.error(`No wave state for ${waveId}`);
        process.exitCode = 1;
        return;
      }
      const remaining = [];
      for (const b of state.batches || []) {
        const open = b.stories.filter((s) => {
          const st = sdc.loadSdcState(s.storyId);
          return !st || st.status !== 'completed';
        });
        if (open.length) {
          remaining.push({ batch: b.index, stories: open });
          break;
        }
      }
      if (opts.json) {
        console.log(JSON.stringify({ waveId, remaining }, null, 2));
        return;
      }
      if (!remaining.length) {
        console.log(`Wave ${waveId}: all stories completed (or no SDC runs)`);
        console.log('Hand off merge to @devops if branches need PR/merge.');
        return;
      }
      const r = remaining[0];
      console.log(`Next batch ${r.batch}:`);
      for (const s of r.stories) {
        console.log(`  - ${s.storyId}: ${s.path}`);
        console.log(`    skill: full-sdc ${s.path} ${state.mode || 'interactive'}`);
      }
    });

  return cmd;
}

function collect(value, prev) {
  prev.push(value);
  return prev;
}

module.exports = { createWaveCommand, resolveStoryPaths };
