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

/**
 * Build the `aiox wave` Commander command tree.
 *
 * @returns {Command} Configured wave command.
 */
function createWaveCommand() {
  const cmd = new Command('wave');
  cmd.description('Lean wave-execute planner (DAG + file partition)');

  cmd
    .command('from-epic')
    .description('Discover STORY-*.md under an epic dir and plan a wave (C3)')
    .requiredOption('--epic-dir <dir>', 'Epic directory (e.g. docs/framework/epics/core-super-update)')
    .option('--wave-id <id>', 'Wave id')
    .option('--filter <regex>', 'Filter story ids (regex or substring)')
    .option('--skip-done', 'Skip stories already Done', false)
    .option('--mode <mode>', 'yolo | interactive', 'interactive')
    .option('--json', 'JSON output', false)
    .action((opts) => {
      try {
        const plan = sdc.planWaveFromEpic({
          epicDir: opts.epicDir,
          waveId: opts.waveId,
          filter: opts.filter,
          skipDone: opts.skipDone,
          mode: opts.mode,
        });
        if (opts.json) {
          console.log(JSON.stringify(plan, null, 2));
          return;
        }
        console.log(`Wave from epic: ${plan.waveId} [${plan.status}]`);
        console.log(`  epic:    ${plan.epicGlue && plan.epicGlue.epicDir}`);
        console.log(`  filter:  ${(plan.epicGlue && plan.epicGlue.filter) || '—'}`);
        console.log(`  stories: ${plan.stories.length}`);
        for (const b of plan.batches || []) {
          console.log(`\nBatch ${b.index}:`);
          for (const s of b.stories) {
            console.log(`  - ${s.storyId} [${s.status}] ${s.path}`);
          }
        }
        console.log(`\nSaved: ${sdc.waveStatePath(plan.waveId)}`);
        console.log('Next: aiox wave advance ' + plan.waveId);
      } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
      }
    });

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
      let state = sdc.loadWaveState(waveId);
      if (!state) {
        console.error(`No wave state for ${waveId}`);
        process.exitCode = 1;
        return;
      }
      const { wave, nextBatch } = sdc.advanceWave(waveId);
      state = wave;
      if (opts.json) {
        console.log(JSON.stringify({ waveId, nextBatch, status: state.status }, null, 2));
        return;
      }
      if (!nextBatch) {
        console.log(`Wave ${waveId}: ${state.status}`);
        console.log('Hand off merge to @devops if branches need PR/merge.');
        console.log(`Optional: aiox wave report ${waveId}`);
        return;
      }
      console.log(`Next batch ${nextBatch.index} (wave ${state.status}):`);
      for (const s of nextBatch.stories) {
        console.log(`  - ${s.storyId}: ${s.path}`);
        console.log(`    skill: full-sdc ${s.path} ${state.mode || 'interactive'}`);
      }
    });

  cmd
    .command('advance')
    .description('Refresh SDC statuses, auto-complete Done stories, print next batch')
    .argument('<wave-id>', 'Wave id')
    .option('--json', 'JSON output', false)
    .action((waveId, opts) => {
      try {
        const { wave, nextBatch } = sdc.advanceWave(waveId);
        if (opts.json) {
          console.log(JSON.stringify({ wave, nextBatch }, null, 2));
          return;
        }
        console.log(`Wave ${wave.waveId} → ${wave.status}`);
        if (!nextBatch) {
          console.log('No open batches. aiox wave report ' + waveId);
          return;
        }
        console.log(`Dispatch batch ${nextBatch.index}:`);
        for (const s of nextBatch.stories) {
          console.log(`  - ${s.storyId} [${s.runStatus || 'ready'}] ${s.path}`);
        }
      } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
      }
    });

  cmd
    .command('mark')
    .description('Mark a story run result on the wave (completed|failed|blocked|skipped)')
    .argument('<wave-id>', 'Wave id')
    .argument('<story-id>', 'Story id')
    .requiredOption('--status <status>', 'completed | failed | blocked | skipped | running')
    .option('--notes <notes>', 'Optional notes')
    .option('--json', 'JSON output', false)
    .action((waveId, storyId, opts) => {
      const wave = sdc.loadWaveState(waveId);
      if (!wave) {
        console.error(`No wave state for ${waveId}`);
        process.exitCode = 1;
        return;
      }
      try {
        sdc.markStoryRun(wave, storyId, opts.status, opts.notes);
        sdc.saveWaveState(wave);
        if (opts.json) {
          console.log(JSON.stringify(wave, null, 2));
        } else {
          console.log(`Marked ${storyId}=${opts.status} on wave ${waveId}`);
          console.log(`  wave status: ${wave.status}`);
          if ((wave.blockedStoryIds || []).length) {
            console.log(`  blocked: ${wave.blockedStoryIds.join(', ')}`);
          }
        }
      } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
      }
    });

  cmd
    .command('report')
    .description('Write .aiox/waves/{id}/report.md')
    .argument('<wave-id>', 'Wave id')
    .option('--json', 'JSON output', false)
    .action((waveId, opts) => {
      try {
        const reportPath = sdc.writeWaveReport(waveId);
        if (opts.json) {
          console.log(JSON.stringify({ reportPath }, null, 2));
        } else {
          console.log(`Report: ${reportPath}`);
        }
      } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
      }
    });

  return cmd;
}

function collect(value, prev) {
  prev.push(value);
  return prev;
}

module.exports = { createWaveCommand, resolveStoryPaths };
