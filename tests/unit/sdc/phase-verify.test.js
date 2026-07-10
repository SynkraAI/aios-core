'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { verifyPhase } = require('../../../.aiox-core/core/sdc/phase-verify');
const { extractQaEvidence } = require('../../../.aiox-core/core/sdc/story-meta');
const {
  initFullSdc,
  loadSdcState,
  markPhase,
  saveJson,
  saveSdcState,
  verifyAndMaybeMark,
} = require('../../../.aiox-core/core/sdc');

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
    const file = writeStory(dir, 's.md', '| Story ID | T.1 |\n| Status | Ready |\n');
    const r = verifyPhase(file, 'validate', { cwd });
    expect(r.ok).toBe(true);
  });

  it('parses a section-style Status heading with a blank separator', () => {
    const file = writeStory(dir, 'section-status.md', '# Story T.SECTION\n\n## Status\n\nReady\n');
    expect(verifyPhase(file, 'validate', { cwd }).ok).toBe(true);
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
    const file = writeStory(dir, 's.md', '| Story ID | T.9 |\n| Status | Draft |\n');
    // chdir so relative .aiox lands in temp — use opts.cwd in progress
    const prev = process.cwd();
    process.chdir(dir);
    try {
      const { state } = initFullSdc(file, { mode: 'yolo' });
      expect(state.storyId).toBe('T.9');
      expect(loadSdcState('T.9').mode).toBe('yolo');
      expect(fs.existsSync(path.join(dir, '.aiox', 'sdc', 'T.9', 'state.json'))).toBe(true);
    } finally {
      process.chdir(prev);
    }
  });

  it('persists checkpoint JSON through an atomic rename without temp residue', () => {
    const file = path.join(dir, '.aiox', 'sdc', 'atomic', 'state.json');
    saveJson(file, { storyId: 'T.ATOMIC' });
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).storyId).toBe('T.ATOMIC');
    expect(fs.readdirSync(path.dirname(file))).toEqual(['state.json']);
  });

  it('approved review advances directly to administrative close', () => {
    const file = writeStory(
      dir,
      'approved.md',
      '| Story ID | T.PASS |\n| Status | Done |\n\n## QA Results\n\nReviewer: Quinn\nreviewed_revision: working-tree:pass\nGate: PASS\n',
    );
    const { state } = initFullSdc(file, { cwd, force: true });
    state.status = 'running';
    state.currentPhase = 'review';
    state.phases.review.status = 'pending';
    saveSdcState(state, cwd);
    const marked = verifyAndMaybeMark(file, 'review', { cwd, mark: true }).state;
    expect(marked.currentPhase).toBe('close');
    expect(marked.status).toBe('running');
  });

  it('rejects an unsupported review outcome without mutating state', () => {
    const state = initFullSdc(
      writeStory(dir, 'outcome.md', '| Story ID | T.OUTCOME |\n| Status | InReview |\n'),
      { cwd, force: true },
    ).state;
    const before = structuredClone(state);

    expect(() => markPhase(state, 'review', 'passed')).toThrow(
      'Review passed requires outcome: approved or changes_requested',
    );
    expect(state).toEqual(before);
  });

  it('automatically loops FAIL through fixes and halts after the third failed re-review', () => {
    const file = writeStory(
      dir,
      'failed.md',
      '| Story ID | T.FAIL |\n| Status | InProgress |\n\n## QA Results\n\nReviewer: Quinn\nreviewed_revision: working-tree:fail\nGate: FAIL\n',
    );
    const { state } = initFullSdc(file, { cwd, force: true, maxQgIterations: 3 });
    state.status = 'running';
    state.currentPhase = 'review';
    saveSdcState(state, cwd);

    for (let iteration = 0; iteration < 3; iteration++) {
      const reviewed = verifyAndMaybeMark(file, 'review', { cwd, mark: true }).state;
      expect(reviewed.currentPhase).toBe('apply_qa_fixes');
      const fixed = verifyAndMaybeMark(file, 'apply_qa_fixes', { cwd, mark: true }).state;
      expect(fixed.currentPhase).toBe('review');
      expect(fixed.qgIterations).toBe(iteration + 1);
    }

    const halted = verifyAndMaybeMark(file, 'review', { cwd, mark: true }).state;
    expect(halted.status).toBe('halted');
    expect(halted.currentPhase).toBe('review');
    expect(halted.phases.review.notes).toContain('circuit breaker');
  });

  it('uses the latest appended QA verdict after fixes and re-review', () => {
    const file = writeStory(
      dir,
      're-review.md',
      [
        '| Story ID | T.REVIEW |',
        '| Status | Done |',
        '',
        '## QA Results',
        '',
        'Reviewer: Quinn',
        'reviewed_revision: working-tree:first',
        'Gate: FAIL',
        'First review requested changes.',
        '',
        'Reviewer: Quinn',
        'reviewed_revision: working-tree:corrected',
        'verdict: PASS',
        'Re-review approved the corrected revision.',
      ].join('\n'),
    );
    const { state } = initFullSdc(file, { cwd, force: true });
    state.status = 'running';
    state.currentPhase = 'review';
    state.qgIterations = 1;
    saveSdcState(state, cwd);

    const reviewed = verifyAndMaybeMark(file, 'review', { cwd, mark: true });
    expect(reviewed.meta.qaVerdict).toBe('PASS');
    expect(reviewed.state.currentPhase).toBe('close');
    expect(reviewed.state.status).toBe('running');
  });

  it('does not complete or close a Done story without approved QA provenance', () => {
    const file = writeStory(
      dir,
      'done-without-qa.md',
      '| Story ID | T.NOQA |\n| Status | Done |\n',
    );
    const { state } = initFullSdc(file, { cwd, force: true });
    expect(state.status).toBe('running');
    expect(state.currentPhase).toBe('review');
    expect(verifyPhase(file, 'close', { cwd }).ok).toBe(false);
  });

  it('refuses an orphan gate when the story has no QA verdict marker', () => {
    const file = writeStory(
      dir,
      'orphan-gate.md',
      '| Story ID | T.ORPHAN |\n| Status | Done |\n',
    );
    const gatesDir = path.join(dir, 'docs', 'qa', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    fs.writeFileSync(
      path.join(gatesDir, 't-orphan.yml'),
      'story: T.ORPHAN\ngate: PASS\nreviewer: Quinn\nreviewed_revision: commit:orphan\n',
    );

    const result = verifyPhase(file, 'close', { cwd });
    expect(result.ok).toBe(false);
    expect(result.failures.join('\n')).toContain(
      'Story has no QA verdict marker; refusing orphan QA gate fallback',
    );
  });

  it('resolves complete provenance from a story-bound gate file fallback', () => {
    const file = writeStory(
      dir,
      'gate-fallback.md',
      '| Story ID | T.FALLBACK |\n| Status | Done |\n\n## QA Results\n\nGate: PASS → docs/qa/gates/t-fallback.yml\n',
    );
    const gatesDir = path.join(dir, 'docs', 'qa', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    fs.writeFileSync(
      path.join(gatesDir, '00-t-fallback-decoy.yml'),
      'story: OTHER.STORY\ngate: FAIL\nreviewer: Other\nreviewed_revision: commit:decoy\n',
    );
    fs.writeFileSync(
      path.join(gatesDir, 't-fallback.yml'),
      'story: T.FALLBACK\ngate: PASS\nreviewer: Quinn\nreviewed_revision: commit:abc1234\n',
    );
    const result = verifyPhase(file, 'close', { cwd });
    expect(result.ok).toBe(true);
    expect(result.meta.qaReviewer).toBe('Quinn');
    expect(result.meta.qaReviewedRevision).toBe('commit:abc1234');
  });

  it('fails closed when multiple gate files bind the same story', () => {
    const file = writeStory(
      dir,
      'ambiguous-gates.md',
      '| Story ID | T.AMBIG |\n| Status | Done |\n\n## QA Results\n\nGate: PASS\n',
    );
    const gatesDir = path.join(dir, 'docs', 'qa', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    for (const name of ['t-ambig-a.yml', 't-ambig-b.yml']) {
      fs.writeFileSync(
        path.join(gatesDir, name),
        'story: T.AMBIG\ngate: PASS\nreviewer: Quinn\nreviewed_revision: commit:abc1234\n',
      );
    }

    const result = verifyPhase(file, 'close', { cwd });
    expect(result.ok).toBe(false);
    expect(result.failures.join('\n')).toContain('Multiple QA gates');
  });

  it('returns a structured failure when a candidate gate cannot be read', () => {
    const file = writeStory(
      dir,
      'unreadable-gate.md',
      '| Story ID | T.READ |\n| Status | Done |\n\n## QA Results\n\nGate: PASS\n',
    );
    const gatesDir = path.join(dir, 'docs', 'qa', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    const gateFile = path.join(gatesDir, 't-read.yml');
    fs.writeFileSync(
      gateFile,
      'story: T.READ\ngate: PASS\nreviewer: Quinn\nreviewed_revision: commit:abc1234\n',
    );
    const readFileSync = fs.readFileSync;
    const spy = jest.spyOn(fs, 'readFileSync').mockImplementation((target, ...args) => {
      if (path.resolve(target) === gateFile) throw new Error('EACCES');
      return readFileSync.call(fs, target, ...args);
    });
    let result;
    try {
      result = verifyPhase(file, 'close', { cwd });
    } finally {
      spy.mockRestore();
    }
    expect(result.ok).toBe(false);
    expect(result.failures.join('\n')).toContain('QA gate cannot be read');
  });

  it('uses qa.qaLocation from the canonical core config', () => {
    const file = writeStory(
      dir,
      'custom-gate-location.md',
      '| Story ID | T.CUSTOMQA |\n| Status | Done |\n\n## QA Results\n\nGate: PASS\n',
    );
    fs.mkdirSync(path.join(dir, '.aiox-core'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, '.aiox-core', 'core-config.yaml'),
      'qa:\n  qaLocation: artifacts/quality\n',
    );
    const gatesDir = path.join(dir, 'artifacts', 'quality', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    fs.writeFileSync(
      path.join(gatesDir, 't-customqa.yml'),
      'story: T.CUSTOMQA\ngate: PASS\nreviewer: Quinn\nreviewed_revision: commit:abc1234\n',
    );

    const result = verifyPhase(file, 'close', { cwd });
    expect(result.ok).toBe(true);
    expect(result.meta.qaReviewedRevision).toBe('commit:abc1234');
  });

  it('rejects WAIVED evidence without an active authorized waiver', () => {
    const file = writeStory(
      dir,
      'unauthorized-waiver.md',
      '| Story ID | T.WAIVE |\n| Status | Done |\n\n## QA Results\n\nReviewer: Quinn\nreviewed_revision: commit:abc1234\nGate: WAIVED\n',
    );

    const result = verifyPhase(file, 'close', { cwd });
    expect(result.ok).toBe(false);
    expect(result.failures.join('\n')).toContain(
      'WAIVED QA evidence requires waiver.active true, reason, and approver',
    );
  });

  it('accepts WAIVED evidence only when the story-bound gate authorizes it', () => {
    const file = writeStory(
      dir,
      'authorized-waiver.md',
      '| Story ID | T.WAIVE.OK |\n| Status | Done |\n\n## QA Results\n\nReviewer: Quinn\nreviewed_revision: commit:abc1234\nGate: WAIVED\n',
    );
    const gatesDir = path.join(dir, 'docs', 'qa', 'gates');
    fs.mkdirSync(gatesDir, { recursive: true });
    fs.writeFileSync(
      path.join(gatesDir, 't-waive-ok.yml'),
      [
        'story: T.WAIVE.OK',
        'gate: WAIVED',
        'reviewer: Quinn',
        'reviewed_revision: commit:abc1234',
        'waiver:',
        '  active: true',
        '  reason: Accepted delivery risk',
        '  approver: Product Owner',
      ].join('\n'),
    );

    const result = verifyPhase(file, 'close', { cwd });
    expect(result.ok).toBe(true);
    expect(result.meta.qaVerdict).toBe('WAIVED');
  });

  it('does not borrow provenance from a later unrelated section', () => {
    const evidence = extractQaEvidence(
      [
        '## QA Results',
        '',
        '### Review Date: 2026-07-10',
        'Reviewer: Quinn',
        'reviewed_revision: commit:approved',
        'Gate: PASS',
        '',
        '## Unrelated Metadata',
        '',
        'Reviewer: Mallory',
        'reviewed_revision: commit:not-reviewed',
      ].join('\n'),
    );

    expect(evidence).toMatchObject({
      verdict: 'PASS',
      reviewer: 'Quinn',
      reviewedRevision: 'commit:approved',
      complete: true,
    });
  });

  it('does not borrow provenance from a later YAML document', () => {
    const evidence = extractQaEvidence(
      [
        'story: T.DOCUMENT',
        'gate: PASS',
        'reviewer: Quinn',
        'reviewed_revision: commit:approved',
        '---',
        'reviewer: Mallory',
        'reviewed_revision: commit:not-reviewed',
      ].join('\n'),
    );

    expect(evidence).toMatchObject({
      verdict: 'PASS',
      reviewer: 'Quinn',
      reviewedRevision: 'commit:approved',
      complete: true,
    });
  });

  it('never treats a forged completed checkpoint as lifecycle authority', () => {
    const file = writeStory(dir, 'forged.md', '| Story ID | T.FORGED |\n| Status | InReview |\n');
    const { state } = initFullSdc(file, { cwd, force: true });
    state.status = 'completed';
    state.currentPhase = null;
    for (const phase of Object.keys(state.phases)) state.phases[phase].status = 'passed';
    saveSdcState(state, cwd);
    expect(verifyPhase(file, 'close', { cwd }).ok).toBe(false);
    expect(verifyPhase(file, 'review', { cwd }).ok).toBe(false);
  });
});
