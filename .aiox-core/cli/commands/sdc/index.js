/**
 * CLI: aiox sdc — lean full-sdc plan / status / verify / mark
 *
 * Usage:
 *   aiox sdc plan <story-path> [--mode yolo|interactive] [--force]
 *   aiox sdc status <story-id|story-path>
 *   aiox sdc verify <story-path> <phase> [--mark]
 *   aiox sdc mark <story-id> <phase> --status passed|failed|skipped|halted [--notes "..."]
 *   aiox sdc phases
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const { assertDispatchGovernance } = require('../../../core/permissions');
const sdc = require('../../../core/sdc');

/**
 * Build the `aiox sdc` Commander command tree.
 *
 * @returns {Command} Configured SDC command.
 */
function createSdcCommand() {
  const cmd = new Command('sdc');
  cmd.description('Lean Full SDC runtime (plan, verify, progress)');

  cmd
    .command('phases')
    .description('List SDC phases')
    .action(() => {
      console.log(sdc.PHASES.join('\n'));
    });

  cmd
    .command('preflight')
    .description('Enforce model budget, story binding, and intent scan before dispatch')
    .argument('<story-path>', 'Path to the story bound to the model call')
    .requiredOption('--budget-usd <amount>', 'Positive model budget ceiling in USD')
    .requiredOption('--intent-file <path>', 'File containing the exact child model intent')
    .option('--context-file <path>', 'File containing the exact child context')
    .option('--task <task>', 'Dispatch task name', 'develop')
    .option('--json', 'JSON evidence output', false)
    .action((storyPath, opts) => {
      try {
        const absoluteStoryPath = path.resolve(storyPath);
        const intent = fs.readFileSync(path.resolve(opts.intentFile), 'utf8');
        const context = opts.contextFile
          ? fs.readFileSync(path.resolve(opts.contextFile), 'utf8')
          : '';
        const evidence = assertDispatchGovernance({
          budgetCeilingUsd: opts.budgetUsd,
          task: opts.task,
          intent: `${intent}\n${context}`,
          story: absoluteStoryPath,
          projectRoot: path.dirname(absoluteStoryPath),
          requiresStory: true,
        });
        if (opts.json) console.log(JSON.stringify(evidence, null, 2));
        else console.log(`SDC dispatch preflight: PASS (${evidence.story.storyId})`);
      } catch (error) {
        console.error(`[${error.code || 'SDC_PREFLIGHT'}] ${error.message}`);
        process.exitCode = 5;
      }
    });

  cmd
    .command('plan')
    .description('Initialize full-sdc run state for a story')
    .argument('<story-path>', 'Path to story markdown')
    .option('--mode <mode>', 'yolo | interactive', 'interactive')
    .option('--force', 'Reset existing state', false)
    .option('--json', 'JSON output', false)
    .action((storyPath, opts) => {
      const { state, meta } = sdc.initFullSdc(storyPath, {
        mode: opts.mode,
        force: opts.force,
      });
      if (opts.json) {
        console.log(JSON.stringify({ state, meta }, null, 2));
        return;
      }
      console.log(`SDC plan: ${state.storyId}`);
      console.log(`  path:    ${state.storyPath}`);
      console.log(`  status:  ${state.status} (story file: ${meta.status})`);
      console.log(`  mode:    ${state.mode}`);
      console.log(`  phase:   ${state.currentPhase || '(done)'}`);
      console.log(`  state:   ${sdc.sdcStatePath(state.storyId)}`);
      console.log('  phases:');
      for (const p of sdc.PHASES) {
        console.log(`    - ${p}: ${state.phases[p].status}`);
      }
      console.log('\nNext: run skill phases, then: aiox sdc verify <story> <phase> --mark');
    });

  cmd
    .command('status')
    .description('Show SDC progress for story id or path')
    .argument('<story>', 'Story id or path')
    .option('--json', 'JSON output', false)
    .action((story, opts) => {
      let storyId = story;
      let meta = null;
      if (story.includes('/') || story.endsWith('.md')) {
        meta = sdc.parseStoryFile(story);
        storyId = meta.storyId;
      }
      const state = sdc.loadSdcState(storyId);
      if (!state) {
        console.error(`No SDC state for ${storyId}. Run: aiox sdc plan <story-path>`);
        process.exitCode = 1;
        return;
      }
      if (opts.json) {
        console.log(JSON.stringify({ state, meta }, null, 2));
        return;
      }
      console.log(`SDC status: ${state.storyId} [${state.status}]`);
      console.log(`  current: ${state.currentPhase || '—'}`);
      console.log(`  qg:      ${state.qgIterations}/${state.maxQgIterations}`);
      for (const p of sdc.PHASES) {
        const ph = state.phases[p];
        console.log(`  ${p.padEnd(16)} ${ph.status}${ph.at ? ` @ ${ph.at}` : ''}`);
      }
    });

  cmd
    .command('verify')
    .description('Verify post-phase artifacts on disk')
    .argument('<story-path>', 'Path to story markdown')
    .argument('<phase>', `One of: ${sdc.PHASES.join('|')}`)
    .option('--mark', 'Write result into progress state', false)
    .option('--json', 'JSON output', false)
    .action((storyPath, phase, opts) => {
      if (!sdc.PHASES.includes(phase)) {
        console.error(`Unknown phase ${phase}`);
        process.exitCode = 1;
        return;
      }
      const { result, state } = sdc.verifyAndMaybeMark(storyPath, phase, {
        mark: opts.mark,
      });
      if (opts.json) {
        console.log(JSON.stringify({ result, state }, null, 2));
      } else {
        console.log(`Verify ${phase}: ${result.ok ? 'OK' : 'FAIL'}`);
        for (const c of result.checks) console.log(`  ${c}`);
        if (opts.mark) {
          console.log(`Marked in ${sdc.sdcStatePath(state.storyId)}`);
        }
      }
      if (!result.ok) process.exitCode = 1;
    });

  cmd
    .command('mark')
    .description('Manually mark a phase (agent/orchestrator)')
    .argument('<story-id>', 'Story id')
    .argument('<phase>', `One of: ${sdc.PHASES.join('|')}`)
    .requiredOption(
      '--status <status>',
      'passed | failed | skipped | halted'
    )
    .option('--notes <notes>', 'Optional notes')
    .option('--outcome <outcome>', 'approved | changes_requested (review phase)')
    .option('--json', 'JSON output', false)
    .action((storyId, phase, opts) => {
      let state = sdc.loadSdcState(storyId);
      if (!state) {
        console.error(`No state for ${storyId}; run aiox sdc plan first`);
        process.exitCode = 1;
        return;
      }
      if (
        phase === 'review' &&
        opts.status === 'passed' &&
        !['approved', 'changes_requested'].includes(opts.outcome)
      ) {
        console.error('Review passed requires --outcome approved|changes_requested');
        process.exitCode = 1;
        return;
      }
      sdc.markPhase(state, phase, opts.status, opts.notes, { outcome: opts.outcome });
      sdc.saveSdcState(state);
      if (opts.json) {
        console.log(JSON.stringify(state, null, 2));
      } else {
        console.log(`Marked ${phase}=${opts.status} for ${storyId}`);
        console.log(`  run status: ${state.status}; next: ${state.currentPhase || '—'}`);
      }
    });

  cmd
    .command('next')
    .description('Print next phase + skill to run for a story')
    .argument('<story>', 'Story id or path')
    .option('--json', 'JSON output', false)
    .action((story, opts) => {
      let storyId = story;
      let storyPath = null;
      if (story.includes('/') || story.endsWith('.md')) {
        const meta = sdc.parseStoryFile(story);
        storyId = meta.storyId;
        storyPath = meta.relPath;
      }
      let state = sdc.loadSdcState(storyId);
      if (!state && storyPath) {
        ({ state } = sdc.initFullSdc(storyPath));
      }
      if (!state) {
        console.error(`No state for ${storyId}`);
        process.exitCode = 1;
        return;
      }
      const phase = state.currentPhase;
      const skillMap = {
        validate: 'validate-story-draft',
        develop: 'develop-story',
        review: 'review-story',
        apply_qa_fixes: 'apply-qa-fixes',
        close: 'close-story',
      };
      const payload = {
        storyId,
        storyPath: state.storyPath,
        status: state.status,
        nextPhase: phase,
        skill: phase ? skillMap[phase] : null,
        skillPath: phase
          ? path.join(
              '.aiox-core',
              'development',
              'skills',
              skillMap[phase],
              'SKILL.md'
            )
          : null,
      };
      if (opts.json) {
        console.log(JSON.stringify(payload, null, 2));
        return;
      }
      if (!phase) {
        console.log(`SDC complete for ${storyId}`);
        return;
      }
      console.log(`Next phase: ${phase}`);
      console.log(`  skill:  ${payload.skill}`);
      console.log(`  path:   ${payload.skillPath}`);
      console.log(`  story:  ${state.storyPath}`);
      console.log(`  after:  aiox sdc verify ${state.storyPath} ${phase} --mark`);
    });

  return cmd;
}

module.exports = { createSdcCommand };
