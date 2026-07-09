'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { verifyPhase } = require('../../../.aiox-core/core/sdc/phase-verify');
const { initFullSdc, loadSdcState } = require('../../../.aiox-core/core/sdc');

function writeStory(dir, name, body) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, body, 'utf8');
  return file;
}

describe('phase-verify + progress', () => {
  let cwd;
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdc-pv-'));
    cwd = dir;
  });

  it('validate passes for Ready', () => {
    const file = writeStory(
      dir,
      's.md',
      '| Story ID | T.1 |\n| Status | Ready |\n',
    );
    const r = verifyPhase(file, 'validate', { cwd });
    expect(r.ok).toBe(true);
  });

  it('develop fails when Done early', () => {
    const file = writeStory(
      dir,
      's.md',
      '| Story ID | T.1 |\n| Status | Done |\n\n## File List\n\n- `a.js`\n',
    );
    const r = verifyPhase(file, 'develop', { cwd });
    expect(r.ok).toBe(false);
  });

  it('initFullSdc writes state under cwd .aiox/sdc', () => {
    const file = writeStory(
      dir,
      's.md',
      '| Story ID | T.9 |\n| Status | Draft |\n',
    );
    // chdir so relative .aiox lands in temp — use opts.cwd in progress
    const prev = process.cwd();
    process.chdir(dir);
    try {
      const { state } = initFullSdc(file, { mode: 'yolo' });
      expect(state.storyId).toBe('T.9');
      expect(loadSdcState('T.9').mode).toBe('yolo');
      expect(fs.existsSync(path.join(dir, '.aiox', 'sdc', 'T.9', 'state.json'))).toBe(
        true,
      );
    } finally {
      process.chdir(prev);
    }
  });
});
