'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('administrative close-story contract', () => {
  it('requires revision-bound QA provenance', () => {
    const qaGate = fs.readFileSync(
      path.join(ROOT, '.aiox-core/development/tasks/qa-gate.md'),
      'utf8',
    );
    const closeStory = fs.readFileSync(
      path.join(ROOT, '.aiox-core/development/tasks/po-close-story.md'),
      'utf8',
    );

    expect(qaGate).toContain('reviewed_revision:');
    expect(closeStory).toContain('QA verdict provenance does not match');
    expect(closeStory).toContain('reviewed_revision');
  });

  it('defines and validates an idempotency key for repeated closure', () => {
    const closeStory = readRepoFile('.aiox-core/development/tasks/po-close-story.md');

    expect(closeStory).toContain('<story-id>:commit:<sha>');
    expect(closeStory).toContain('<story-id>:pr:<number>');
    expect(closeStory).toContain('<story-id>:digest:<reviewed_revision>');
    expect(closeStory).toContain('[closure-key: <key>]');
    expect(closeStory).toContain('Execute the protocol twice');
    expect(closeStory).toContain('each artifact that carries closure metadata');
    expect(closeStory).toMatch(/retry must add only the missing\s+keyed artifact/);
    expect(closeStory).toMatch(/read-only\s+no-op/);
  });
});

describe('Core Super Update review contracts', () => {
  const fullSdcPaths = [
    '.aiox-core/development/skills/full-sdc/SKILL.md',
    '.claude/skills/full-sdc/SKILL.md',
    '.grok/skills/aiox-full-sdc/SKILL.md',
  ];

  it.each(fullSdcPaths)('routes review FAIL before the generic verification halt in %s', (file) => {
    const fullSdc = readRepoFile(file);
    const reviewFail = fullSdc.indexOf('IF phase=review and verdict FAIL:');
    const genericHalt = fullSdc.indexOf('ELSE IF verify FAIL → HALT');

    expect(reviewFail).toBeGreaterThan(-1);
    expect(genericHalt).toBeGreaterThan(reviewFail);
  });

  it.each(fullSdcPaths)('requires approval before interactive QA fixes in %s', (file) => {
    const fullSdc = readRepoFile(file);
    const reviewFail = fullSdc.indexOf('IF phase=review and verdict FAIL:');
    const genericHalt = fullSdc.indexOf('ELSE IF verify FAIL → HALT');
    const reviewFailBranch = fullSdc.slice(reviewFail, genericHalt);

    expect(reviewFailBranch).toContain('IF mode=interactive and no explicit fix approval:');
    expect(reviewFailBranch).toContain('report FAIL and pause (do not invoke apply-qa-fixes)');
    expect(reviewFailBranch).toContain('IF mode=yolo or explicit fix approval:');
    expect(reviewFailBranch.indexOf('report FAIL and pause')).toBeLessThan(
      reviewFailBranch.indexOf('run apply-qa-fixes skill'),
    );
  });

  it.each(fullSdcPaths)('halts when QA remediation verification fails in %s', (file) => {
    const fullSdc = readRepoFile(file);
    const reviewFail = fullSdc.indexOf('IF phase=review and verdict FAIL:');
    const genericHalt = fullSdc.indexOf('ELSE IF verify FAIL → HALT');
    const reviewFailBranch = fullSdc.slice(reviewFail, genericHalt);
    const remediationFailure = reviewFailBranch.indexOf('IF apply_qa_fixes verify FAIL:');
    const remediationSuccess = reviewFailBranch.indexOf('IF apply_qa_fixes verify PASS:');
    const returnToReview = reviewFailBranch.indexOf(
      'CLI returns to review and increments qgIterations',
    );

    expect(remediationFailure).toBeGreaterThan(-1);
    expect(reviewFailBranch).toContain(
      'HALT and escalate human without returning to review or incrementing qgIterations',
    );
    expect(remediationSuccess).toBeGreaterThan(remediationFailure);
    expect(returnToReview).toBeGreaterThan(remediationSuccess);
  });

  it.each(fullSdcPaths)('runs preflight before any phase execution in %s', (file) => {
    const fullSdc = readRepoFile(file);
    const loadOnly = fullSdc.indexOf(
      'Load skill SKILL.md + its task SOT without executing phase work',
    );
    const materialize = fullSdc.indexOf(
      'Materialize the exact payload for inline or spawned phase execution',
    );
    const preflight = fullSdc.indexOf('Run `aiox sdc preflight` over that exact payload');
    const execute = fullSdc.indexOf(
      'Execute inline or spawn the phase only after preflight succeeds',
    );
    const verify = fullSdc.indexOf('aiox sdc verify {story} {phase} --mark');

    expect(loadOnly).toBeGreaterThan(-1);
    expect(materialize).toBeGreaterThan(loadOnly);
    expect(preflight).toBeGreaterThan(materialize);
    expect(execute).toBeGreaterThan(preflight);
    expect(verify).toBeGreaterThan(execute);
  });

  it.each(fullSdcPaths)('quotes and freezes the exact preflight payload in %s', (file) => {
    const fullSdc = readRepoFile(file);

    expect(fullSdc).toContain('aiox sdc preflight "{story-path}"');
    expect(fullSdc).toContain('--task "{phase-task}"');
    expect(fullSdc).toContain('--intent-file "{exact-child-intent-file}"');
    expect(fullSdc).toContain('--context-file "{exact-child-context-file}"');
    expect(fullSdc).toContain('never rebuild or enrich the prompt after preflight');
  });

  it.each([
    '.aiox-core/development/skills/close-story/SKILL.md',
    '.claude/skills/close-story/SKILL.md',
    '.grok/skills/aiox-close-story/SKILL.md',
  ])('keeps close-story administrative in %s', (file) => {
    const closeStory = readRepoFile(file);

    expect(closeStory).toContain('Before any administrative write');
    expect(closeStory).not.toContain('Before mutating Status');
  });

  it('propagates the project root explicitly into pm.sh governance', () => {
    const pmScript = readRepoFile('.aiox-core/scripts/pm.sh');

    expect(pmScript).toMatch(
      /AIOX_DISPATCH_CONTEXT="\$CONTEXT_FILE" \\\n\s+AIOX_PROJECT_ROOT="\$\{AIOX_PROJECT_ROOT:-\$\(pwd\)\}" \\/,
    );
  });

  it('reports every CodeRabbit severity in the QA self-healing summary', () => {
    const qaReview = readRepoFile('.aiox-core/development/tasks/qa-review-story.md');

    expect(qaReview).toContain("const lowIssues = issues.filter((i) => i.severity === 'LOW')");
    expect(qaReview).toContain('${lowIssues.length} LOW');
  });

  it('keeps the port-denylist checkout credential-free', () => {
    const ci = readRepoFile('.github/workflows/ci.yml');
    const portJobAnchor = '\n  port-denylist:\n';
    const portJobStart = ci.indexOf(portJobAnchor);
    expect(portJobStart).toBeGreaterThan(-1);

    const portJobContentStart = portJobStart + portJobAnchor.length;
    const nextJobBoundary = ci
      .slice(portJobContentStart)
      .match(/\n {2}[A-Za-z0-9_-]+:\n/);
    expect(nextJobBoundary).not.toBeNull();

    const portJobEnd = portJobContentStart + nextJobBoundary.index;
    const portJob = ci.slice(portJobStart + 1, portJobEnd);

    expect(portJob).toContain('uses: actions/checkout@v6');
    expect(portJob).toContain('persist-credentials: false');
  });

  it('labels orchestration state access and retrospective evidence precisely', () => {
    const hierarchy = readRepoFile('docs/architecture/orchestration-hierarchy.md');
    const audit = readRepoFile('docs/framework/epics/core-super-update/LIFECYCLE-AUDIT.md');
    const memoryBridge = readRepoFile(
      'docs/framework/epics/core-super-update/STORY-CORE-SU.MB-MEMORY-BRIDGE.md',
    );

    expect(hierarchy).toContain('FullSDC -->|read/reconcile only| SessionState');
    expect(hierarchy).toContain('lifecycle writes via authorized phase tasks');
    expect(audit).toContain('8,957');
    expect(audit).toContain('8,960');
    expect(audit).toContain('9,010');
    expect(memoryBridge).toContain('this row is not QA/PASS evidence');
  });
});
