'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  planWaveFromEpic,
  advanceWave,
  createSdcState,
  runWaveBatch,
  saveSdcState,
  writeWaveReport,
} = require('../../../.aiox-core/core/sdc');

describe('wave C integration', () => {
  let cwd;
  let prev;
  let epicDir;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'wave-c-int-'));
    prev = process.cwd();
    process.chdir(cwd);
    epicDir = path.join(cwd, 'docs', 'framework', 'epics', 'demo');
    fs.mkdirSync(epicDir, { recursive: true });
  });

  afterEach(() => {
    process.chdir(prev);
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it('from-epic → advance → report → runWaveBatch', async () => {
    fs.writeFileSync(
      path.join(epicDir, 'STORY-ONE.md'),
      '| Story ID | DEMO.1 |\n| Status | Done |\n\n## File List\n\n- `one.js`\n\n## QA Results\n\nReviewer: Quinn\nreviewed_revision: working-tree:demo-1\nGate: PASS\n',
    );
    fs.writeFileSync(
      path.join(epicDir, 'STORY-TWO.md'),
      '| Story ID | DEMO.2 |\n| Status | Ready |\n\n## File List\n\n- `two.js`\n',
    );

    const plan = planWaveFromEpic({
      epicDir,
      waveId: 'DEMO-W',
      mode: 'yolo',
      cwd,
    });
    expect(plan.stories.length).toBe(2);

    const { wave, nextBatch } = advanceWave('DEMO-W', { cwd });
    expect(wave.stories.find((s) => s.storyId === 'DEMO.1').runStatus).toBe(
      'completed',
    );
    expect(nextBatch).toBeTruthy();

    const batchResults = await runWaveBatch(
      nextBatch.stories,
      async (s) => s.storyId,
      {
        mode: 'parallel',
        maxParallel: 2,
        budgetCeilingUsd: 2,
        cwd,
        intent: (story) => `Execute full-sdc for ${story.storyId}`,
      },
    );
    if (!batchResults.every((r) => r.ok)) {
      throw new Error(JSON.stringify({ stories: nextBatch.stories, batchResults }, null, 2));
    }
    expect(batchResults.every((r) => r.ok)).toBe(true);

    const reportPath = writeWaveReport('DEMO-W', { cwd });
    const report = fs.readFileSync(reportPath, 'utf8');
    expect(report).toMatch(/Epic glue/);
    expect(report).toMatch(/DEMO/);
  });

  it('does not let a forged completed checkpoint finish a Done story without QA evidence', () => {
    const story = path.join(epicDir, 'STORY-FORGED.md');
    fs.writeFileSync(
      story,
      '| Story ID | DEMO.FORGED |\n| Status | Done |\n\n## File List\n\n- `forged.js`\n',
    );
    planWaveFromEpic({ epicDir, waveId: 'FORGED-W', mode: 'yolo', cwd });
    const forged = createSdcState({ storyId: 'DEMO.FORGED', storyPath: story });
    forged.status = 'completed';
    forged.currentPhase = null;
    saveSdcState(forged, cwd);

    const { wave, nextBatch } = advanceWave('FORGED-W', { cwd });
    expect(wave.stories[0].runStatus).not.toBe('completed');
    expect(nextBatch.stories.map((entry) => entry.storyId)).toContain('DEMO.FORGED');
  });

  it('uses the shared story-bound gate resolver when advancing a wave', () => {
    const story = path.join(epicDir, 'STORY-EXTERNAL-GATE.md');
    fs.writeFileSync(
      story,
      '| Story ID | DEMO.GATE |\n| Status | Done |\n\n## File List\n\n- `gate.js`\n\n## QA Results\n\nGate: PASS → docs/qa/gates/demo-gate.yml\n',
    );
    const gatesDir = path.join(cwd, 'docs', 'qa', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    fs.writeFileSync(
      path.join(gatesDir, 'demo-gate.yml'),
      'story: DEMO.GATE\ngate: PASS\nreviewer: Quinn\nreviewed_revision: commit:gate123\n',
    );
    planWaveFromEpic({ epicDir, waveId: 'GATE-W', mode: 'yolo', cwd });

    const { wave, nextBatch } = advanceWave('GATE-W', { cwd });
    expect(wave.stories[0].runStatus).toBe('completed');
    expect(nextBatch).toBeNull();
  });
});
