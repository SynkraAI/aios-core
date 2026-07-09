'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  indexCoreTree,
  comparePair,
  isOssWins,
} = require('../../.aiox-core/infrastructure/scripts/framework-3way-diff');

describe('framework-3way-diff (Wave 0)', () => {
  let rootA;
  let rootB;

  beforeEach(() => {
    rootA = fs.mkdtempSync(path.join(os.tmpdir(), 'fw3-a-'));
    rootB = fs.mkdtempSync(path.join(os.tmpdir(), 'fw3-b-'));
    fs.mkdirSync(path.join(rootA, '.aiox-core', 'core', 'errors'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(rootA, '.aiox-core', 'core', 'foo'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(rootA, '.aiox-core', 'core', 'errors', 'x.js'),
      'module.exports = 1;\n',
    );
    fs.writeFileSync(
      path.join(rootA, '.aiox-core', 'core', 'foo', 'a.js'),
      'const a = 1;\n',
    );

    fs.mkdirSync(path.join(rootB, '.aiox-core', 'core', 'foo'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(rootB, '.aiox-core', 'core', 'bar'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(rootB, '.aiox-core', 'core', 'foo', 'a.js'),
      'const a = 2;\nconst b = 3;\n',
    );
    fs.writeFileSync(
      path.join(rootB, '.aiox-core', 'core', 'bar', 'only.js'),
      'only\n',
    );
  });

  afterEach(() => {
    fs.rmSync(rootA, { recursive: true, force: true });
    fs.rmSync(rootB, { recursive: true, force: true });
  });

  it('indexes relative paths under .aiox-core', () => {
    const idx = indexCoreTree(rootA);
    expect(idx.has('core/errors/x.js')).toBe(true);
    expect(idx.has('core/foo/a.js')).toBe(true);
  });

  it('flags OSS-wins paths', () => {
    expect(isOssWins('core/errors/x.js')).toBe(true);
    expect(isOssWins('core/foo/a.js')).toBe(false);
  });

  it('compares only-in and differ', () => {
    const oss = indexCoreTree(rootA);
    const peer = indexCoreTree(rootB);
    const r = comparePair(oss, peer, 'hub');
    expect(r.present).toBe(true);
    expect(r.onlyPeer).toContain('core/bar/only.js');
    expect(r.onlyOss).toContain('core/errors/x.js');
    expect(r.differTop.some((d) => d.path === 'core/foo/a.js')).toBe(true);
    const d = r.differTop.find((x) => x.path === 'core/foo/a.js');
    expect(d.deltaLines).toBeGreaterThan(0);
  });
});
