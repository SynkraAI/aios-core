'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  discoverEpicStories,
  planWaveFromEpic,
} = require('../../../.aiox-core/core/sdc/epic-glue');

describe('epic-glue (C3)', () => {
  let cwd;
  let prev;
  let epicDir;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'epic-glue-'));
    prev = process.cwd();
    process.chdir(cwd);
    epicDir = path.join(cwd, 'epic');
    fs.mkdirSync(epicDir);
  });

  afterEach(() => {
    process.chdir(prev);
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  function writeStory(name, id, status) {
    fs.writeFileSync(
      path.join(epicDir, name),
      `# Story ${id}\n\n| Story ID | ${id} |\n| Status | ${status} |\n\n## File List\n\n- \`${id}.js\`\n`,
      'utf8',
    );
  }

  it('discovers STORY-*.md files', () => {
    writeStory('STORY-A.md', 'E.A', 'Ready');
    writeStory('STORY-B.md', 'E.B', 'Done');
    writeStory('README.md', 'nope', 'Ready');
    const { paths, stories } = discoverEpicStories(epicDir, { cwd });
    expect(paths.length).toBe(2);
    expect(stories.map((s) => s.storyId).sort()).toEqual(['E.A', 'E.B']);
  });

  it('filters and skipDone', () => {
    writeStory('STORY-A.md', 'CORE-SU.C2', 'Ready');
    writeStory('STORY-B.md', 'CORE-SU.C3', 'Done');
    writeStory('STORY-X.md', 'OTHER.1', 'Ready');
    const { stories } = discoverEpicStories(epicDir, {
      cwd,
      filter: 'CORE-SU\\.C',
      skipDone: true,
    });
    expect(stories.map((s) => s.storyId)).toEqual(['CORE-SU.C2']);
  });

  it('throws on empty discovery', () => {
    expect(() =>
      planWaveFromEpic({ epicDir, cwd, waveId: 'empty', filter: 'NOMATCH' }),
    ).toThrow(/No stories found/);
  });

  it('plans and saves wave with epicGlue meta', () => {
    writeStory('STORY-A.md', 'E.A', 'Ready');
    writeStory('STORY-B.md', 'E.B', 'Ready');
    const plan = planWaveFromEpic({
      epicDir,
      cwd,
      waveId: 'EPIC-T',
      mode: 'yolo',
    });
    expect(plan.waveId).toBe('EPIC-T');
    expect(plan.epicGlue.discovered).toEqual(expect.arrayContaining(['E.A', 'E.B']));
    expect(fs.existsSync(path.join(cwd, '.aiox', 'waves', 'EPIC-T', 'state.json'))).toBe(
      true,
    );
  });
});
