'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  indexCoreTree,
  comparePair,
  isOssWins,
  classifyThreeWay,
  classifyByWave,
  buildResult,
  formatReport,
} = require('../../.aiox-core/infrastructure/scripts/framework-3way-diff');

describe('framework-3way-diff (Wave 0)', () => {
  let rootA;
  let rootB;
  let rootC;

  beforeEach(() => {
    rootA = fs.mkdtempSync(path.join(os.tmpdir(), 'fw3-a-'));
    rootB = fs.mkdtempSync(path.join(os.tmpdir(), 'fw3-b-'));
    rootC = fs.mkdtempSync(path.join(os.tmpdir(), 'fw3-c-'));
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
    fs.writeFileSync(path.join(rootA, '.aiox-core', 'core', 'foo', 'a.js'), 'const a = 1;\n');

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
    fs.writeFileSync(path.join(rootB, '.aiox-core', 'core', 'bar', 'only.js'), 'only\n');

    fs.mkdirSync(path.join(rootC, '.aiox-core', 'core', 'foo'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(rootC, '.aiox-core', 'development', 'skills', 'full-sdc'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(rootC, '.aiox-core', 'core', 'foo', 'a.js'),
      'const a = 2;\nconst b = 3;\n',
    );
    fs.writeFileSync(
      path.join(rootC, '.aiox-core', 'development', 'skills', 'full-sdc', 'SKILL.md'),
      'portable candidate workspace/custom-domain\n',
    );
  });

  afterEach(() => {
    fs.rmSync(rootA, { recursive: true, force: true });
    fs.rmSync(rootB, { recursive: true, force: true });
    fs.rmSync(rootC, { recursive: true, force: true });
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
    expect(r.onlyRight).toContain('core/bar/only.js');
    expect(r.onlyLeft).toContain('core/errors/x.js');
    expect(r.differTop.some((d) => d.path === 'core/foo/a.js')).toBe(true);
    const d = r.differTop.find((x) => x.path === 'core/foo/a.js');
    expect(d.deltaLines).toBeGreaterThan(0);
  });

  it('classifies real three-way buckets and wave candidates', () => {
    const result = classifyThreeWay(
      indexCoreTree(rootA),
      indexCoreTree(rootB),
      indexCoreTree(rootC),
    );
    expect(result.buckets.ossDiffers).toContain('core/foo/a.js');
    expect(result.buckets.onlyOss).toContain('core/errors/x.js');
    expect(result.buckets.onlyHub).toContain('core/bar/only.js');
    expect(result.buckets.onlyEnterprise).toContain('development/skills/full-sdc/SKILL.md');
    const waves = classifyByWave(result.buckets.onlyEnterprise);
    expect(waves.B).toContain('development/skills/full-sdc/SKILL.md');
  });

  it('builds byte-stable semantic output unless timestamp is requested', () => {
    const args = {
      oss: rootA,
      hub: rootB,
      enterprise: rootC,
      includeTimestamp: false,
    };
    expect(JSON.stringify(buildResult(args))).toBe(JSON.stringify(buildResult(args)));
    expect(buildResult(args).generatedAt).toBeUndefined();
    expect(buildResult(args).pairs).toHaveLength(3);
    expect(buildResult(args).pairs[2].leftName).toBe('hub');
    expect(buildResult(args).denylistHits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tree: 'enterprise', id: 'workspace-product' }),
      ]),
    );
    expect(buildResult({ ...args, includeTimestamp: true }).generatedAt).toBeDefined();
  });

  it('uses pair-specific labels and omits OSS-wins from hub comparisons', () => {
    fs.writeFileSync(path.join(rootC, '.aiox-core', 'core', 'foo', 'a.js'), 'const a = 99;\n');
    const result = buildResult({
      oss: rootA,
      hub: rootB,
      enterprise: rootC,
      includeTimestamp: false,
    });
    const hubPair = result.pairs[2];
    expect(hubPair.leftName).toBe('hub');
    const changedEntry = hubPair.differTop.find((entry) => entry.path === 'core/foo/a.js');
    expect(changedEntry).toBeDefined();
    expect(changedEntry.ossWins).toBeUndefined();

    const hubSection = formatReport(result)
      .split('## hub ↔ enterprise')[1]
      .split('## Three-way buckets')[0];
    expect(hubSection).toContain('Only in hub');
    expect(hubSection).toContain('| Path | hub lines | enterprise lines | Δ lines |');
    expect(hubSection).not.toContain('OSS-wins?');
  });

  it('strict CLI mode fails when either external tree is missing', () => {
    const script = path.resolve(
      __dirname,
      '../../.aiox-core/infrastructure/scripts/framework-3way-diff.js',
    );
    const missing = path.join(rootA, 'missing-peer');
    const result = spawnSync(
      process.execPath,
      [
        script,
        '--oss',
        rootA,
        '--hub',
        rootB,
        '--enterprise',
        missing,
        '--require-external',
        '--quiet',
      ],
      { encoding: 'utf8' },
    );
    expect(result.status).toBe(3);
    expect(result.stderr).toContain('enterprise');
  });

  it('fails closed with the unreadable tree and path in the diagnostic', () => {
    const target = path.join(rootA, '.aiox-core', 'core', 'foo', 'a.js');
    const readFileSync = fs.readFileSync;
    const spy = jest.spyOn(fs, 'readFileSync').mockImplementation((file, ...args) => {
      if (path.resolve(file) === target) throw new Error('EACCES');
      return readFileSync.call(fs, file, ...args);
    });

    try {
      expect(() =>
        buildResult({
          oss: rootA,
          hub: rootB,
          enterprise: rootC,
          includeTimestamp: false,
        }),
      ).toThrow(/Cannot index oss framework tree.*core\/foo\/a\.js.*EACCES/);
    } finally {
      spy.mockRestore();
    }
  });

  it('marks three-way classification unavailable when a tree is missing', () => {
    const missing = path.join(rootA, 'missing-peer');
    const result = buildResult({
      oss: rootA,
      hub: rootB,
      enterprise: missing,
      includeTimestamp: false,
    });

    expect(result.threeWay).toMatchObject({
      available: false,
      missingTrees: ['enterprise'],
      totalPaths: 0,
    });
    expect(Object.values(result.threeWay.buckets).every((paths) => paths.length === 0)).toBe(true);
    expect(Object.values(result.candidatesByWave).every((paths) => paths.length === 0)).toBe(true);
    expect(formatReport(result)).toContain(
      'Classification unavailable — missing framework trees: enterprise.',
    );
  });
});
