'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

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
    const closeStory = fs.readFileSync(
      path.join(ROOT, '.aiox-core/development/tasks/po-close-story.md'),
      'utf8',
    );

    expect(closeStory).toContain('<story-id>:commit:<sha>');
    expect(closeStory).toContain('<story-id>:pr:<number>');
    expect(closeStory).toContain('[closure-key: <key>]');
    expect(closeStory).toContain('Execute the protocol twice');
    expect(closeStory).toContain('each artifact that carries closure metadata');
    expect(closeStory).toContain('retry must add only the missing keyed artifact');
    expect(closeStory).toContain('read-only no-op');
  });
});
