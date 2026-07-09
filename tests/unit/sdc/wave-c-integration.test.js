'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  planWaveFromEpic,
  advanceWave,
  runWaveBatch,
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
      '| Story ID | DEMO.1 |\n| Status | Done |\n\n## File List\n\n- `one.js`\n',
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
      { mode: 'parallel', maxParallel: 2 },
    );
    expect(batchResults.every((r) => r.ok)).toBe(true);

    const reportPath = writeWaveReport('DEMO-W', { cwd });
    const report = fs.readFileSync(reportPath, 'utf8');
    expect(report).toMatch(/Epic glue/);
    expect(report).toMatch(/DEMO/);
  });
});
