'use strict';

const path = require('path');
const {
  scanContent,
  scanProject,
  isAllowlisted,
  DENY_PATTERNS,
  DEFAULT_SCAN_ROOTS,
} = require('../../.aiox-core/core/security/port-denylist');

describe('port-denylist (CORE-SU.A4)', () => {
  it('exposes deny patterns including workspace product and sinkra', () => {
    const ids = DENY_PATTERNS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'workspace-product',
        'sinkra-prefix',
        'mux-adapter',
        'machine-path-users',
      ]),
    );
  });

  it('flags sinkra_ and workspace product paths', () => {
    const hits = scanContent('require("sinkra_pipeline")\nworkspace/businesses/foo');
    expect(hits.some((h) => h.id === 'sinkra-prefix')).toBe(true);
    expect(hits.some((h) => h.id === 'workspace-product')).toBe(true);
  });

  it('flags machine absolute paths', () => {
    const hits = scanContent('const p = "/Users/alan/Code/secret"');
    expect(hits.some((h) => h.id === 'machine-path-users')).toBe(true);
  });

  it('allows clean OSS code', () => {
    const hits = scanContent('const x = require(".aiox-core/core/permissions")');
    expect(hits).toHaveLength(0);
  });

  it('allowlists denylist self-docs', () => {
    expect(
      isAllowlisted(path.join('docs', 'framework', 'epics', 'core-super-update', 'EPIC.md')),
    ).toBe(true);
    expect(isAllowlisted(path.join('src', 'foo.js'))).toBe(false);
  });

  it('scans tracked agent config surfaces by default', () => {
    expect(DEFAULT_SCAN_ROOTS).toEqual(expect.arrayContaining(['.claude']));
  });

  it('fails closed when an explicit file cannot be read', () => {
    const result = scanProject({
      projectRoot: path.resolve(__dirname, '../..'),
      files: ['missing-port-denylist-fixture.js'],
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'scan-error',
          file: 'missing-port-denylist-fixture.js',
        }),
      ]),
    );
  });

  it('scanProject on this repo is clean (or only documents hits)', () => {
    const result = scanProject({ projectRoot: path.resolve(__dirname, '../..') });
    expect(result.filesScanned).toBeGreaterThan(10);
    if (!result.ok) {
      // Fail with readable message
      const sample = result.findings
        .slice(0, 5)
        .map((f) => `${f.file}:${f.line} ${f.id}`)
        .join('\n');
      throw new Error(`Unexpected denylist hits:\n${sample}`);
    }
    expect(result.ok).toBe(true);
  });
});
