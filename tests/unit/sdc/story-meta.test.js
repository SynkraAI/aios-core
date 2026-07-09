'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  parseStoryFile,
  normalizeStatus,
  extractFileList,
} = require('../../../.aiox-core/core/sdc/story-meta');

describe('story-meta', () => {
  it('normalizes status labels', () => {
    expect(normalizeStatus('Ready for review')).toBe('InReview');
    expect(normalizeStatus('In Progress')).toBe('InProgress');
    expect(normalizeStatus('Done')).toBe('Done');
    expect(normalizeStatus('Draft')).toBe('Draft');
  });

  it('parses table metadata and file list', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdc-meta-'));
    const file = path.join(dir, 'STORY-X.1.md');
    fs.writeFileSync(
      file,
      `# Story X.1 Foo

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | X.1 |
| Status | Ready |

## File List

- \`.aiox-core/core/foo.js\` — main
- \`tests/unit/foo.test.js\`

## Tasks

- [x] one
- [ ] two
`,
      'utf8',
    );

    const meta = parseStoryFile(file);
    expect(meta.storyId).toBe('X.1');
    expect(meta.status).toBe('Ready');
    expect(meta.fileList).toEqual(
      expect.arrayContaining([
        '.aiox-core/core/foo.js',
        'tests/unit/foo.test.js',
      ]),
    );
    expect(meta.tasks.total).toBe(2);
    expect(meta.tasks.done).toBe(1);
  });

  it('extractFileList ignores non-paths', () => {
    const text = '## File List\n\n- not a path alone\n- `src/a.js`\n';
    expect(extractFileList(text)).toEqual(['src/a.js']);
  });
});
