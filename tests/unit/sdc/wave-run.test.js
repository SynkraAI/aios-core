'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  cascadeBlock,
  markStoryRun,
  advanceWave,
  planAndSave,
} = require('../../../.aiox-core/core/sdc/wave-run');
const { saveSdcState, createSdcState } = require('../../../.aiox-core/core/sdc/progress');

describe('wave-run', () => {
  let cwd;
  let prev;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'wave-run-'));
    prev = process.cwd();
    process.chdir(cwd);
  });

  afterEach(() => {
    process.chdir(prev);
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  function writeStory(id, status, files, deps = []) {
    const p = path.join(cwd, `${id}.md`);
    const depLine = deps.length ? `| Depends | ${deps.join(', ')} |\n` : '';
    const fileLines = files.map((f) => `- \`${f}\``).join('\n');
    fs.writeFileSync(
      p,
      `# Story ${id}\n\n| Story ID | ${id} |\n| Status | ${status} |\n${depLine}\n## File List\n\n${fileLines}\n`,
      'utf8',
    );
    return p;
  }

  it('cascades block to dependents', () => {
    const wave = {
      stories: [
        { storyId: 'A', dependsOn: [] },
        { storyId: 'B', dependsOn: ['A'] },
        { storyId: 'C', dependsOn: ['B'] },
      ],
      graph: {
        edges: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
        ],
      },
      batches: [
        { index: 1, stories: [{ storyId: 'A' }] },
        { index: 2, stories: [{ storyId: 'B' }] },
        { index: 3, stories: [{ storyId: 'C' }] },
      ],
      blockedStoryIds: [],
    };
    markStoryRun(wave, 'A', 'failed', 'boom');
    expect(wave.blockedStoryIds).toEqual(expect.arrayContaining(['A', 'B', 'C']));
    expect(wave.batches[1].stories[0].runStatus).toBe('blocked');
  });

  it('advance auto-completes Done stories', () => {
    const a = writeStory('W.A', 'Done', ['a.js']);
    const b = writeStory('W.B', 'Ready', ['b.js']);
    planAndSave([a, b], { waveId: 'W1', mode: 'yolo' });

    const { wave, nextBatch } = advanceWave('W1', { cwd });
    expect(wave.stories.find((s) => s.storyId === 'W.A').runStatus).toBe('completed');
    expect(nextBatch).toBeTruthy();
    expect(nextBatch.stories.map((s) => s.storyId)).toEqual(['W.B']);
  });

  it('advance completes wave when all sdc completed', () => {
    const a = writeStory('W.X', 'Ready', ['x.js']);
    planAndSave([a], { waveId: 'W2' });
    const st = createSdcState({ storyId: 'W.X', storyPath: a });
    st.status = 'completed';
    st.currentPhase = null;
    saveSdcState(st, cwd);

    const { wave, nextBatch } = advanceWave('W2', { cwd });
    expect(nextBatch).toBeNull();
    expect(wave.status).toBe('completed');
  });

  it('cascadeBlock returns transitive set', () => {
    const wave = {
      stories: [
        { storyId: 'A', dependsOn: [] },
        { storyId: 'B', dependsOn: ['A'] },
      ],
      graph: { edges: [{ from: 'A', to: 'B' }] },
    };
    expect(cascadeBlock(wave, ['A'])).toEqual(expect.arrayContaining(['A', 'B']));
  });
});
